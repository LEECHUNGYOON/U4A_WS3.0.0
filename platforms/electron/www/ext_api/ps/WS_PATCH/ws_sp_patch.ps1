## SAP U4A Workspace Patch Download Script (WebClient Version)
# HowTo : ws_sp_patch.ps1 -BaseUrl '[Server Host Url]:[Service Port]' -sapClient '[클라이언트]' -sapUser '[User]' -sapPassword '[비번]' -spPath '[서포트패치 저장경로]' -ndPath '[node 모듈 패치 저장경로]' -JsonInput '{"RETCD":"S","RTMSG":"","VERSN":"v3.5.0","SPLEV":6,"TOTSP":57,"TOTND":30}' -Timeout [**기본값 300] -UserAgent '[**옵션]' -UseBasicParsing '[**옵션]' -MaximumRedirection [**기본값 5] -DisableKeepAlive [** 기본값 false] -SkipCertificateCheck [** 기본값 false] -ProxyAddress '[**옵션]' -ProxyCredential '[**옵션]'
param (
    [Parameter(Mandatory=$true)]
    [string]$BaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$sapClient,
    
    [Parameter(Mandatory=$true)]
    [string]$sapUser,
    
    [Parameter(Mandatory=$true)]
    [string]$sapPassword,

    [Parameter(Mandatory=$true)]
    [string]$spPath,

    [Parameter(Mandatory=$true)]
    [string]$ndPath,

    [Parameter(Mandatory=$true)]
    [string]$JsonInput,

    # Optional Request Parameters
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 300,
    
    [Parameter(Mandatory=$false)]
    [string]$UserAgent,
    
    # Note: UseBasicParsing is Invoke-WebRequest specific parameter.
    # WebClient (used in this script) always uses basic parsing by default.
    # This parameter is kept for compatibility but has no effect.
    [Parameter(Mandatory=$false)]
    [switch]$UseBasicParsing,
    
    # Note: MaximumRedirection is Invoke-WebRequest specific parameter.
    # WebClient handles redirects automatically.
    # This parameter is kept for compatibility but has no effect.
    [Parameter(Mandatory=$false)]
    [int]$MaximumRedirection = 5,
    
#    [Parameter(Mandatory=$false)]
#    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession,
    
    # Note: DisableKeepAlive is Invoke-WebRequest specific parameter.
    # WebClient connection behavior is different.
    # This parameter is kept for compatibility but has no effect.
    [Parameter(Mandatory=$false)]
    [switch]$DisableKeepAlive,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipCertificateCheck,
    
    [Parameter(Mandatory=$false)]
    [string]$ProxyAddress,
    
    [Parameter(Mandatory=$false)]
    [pscredential]$ProxyCredential,

    # ──────────────────────────────────────── *
    # @since   2025-11-10 11:01:47
    # @version v3.5.6-16
    # @author  soccerhs
    # @description
    # 
    # - 파워쉘에서 발생되는 로그는 전달받은 경로로 저장
    #
    # ──────────────────────────────────────── *
    [Parameter(Mandatory=$false)]
    [string]$logPath
)

#region 2025-11-03 by yoon ---- output Encoding
# UTF-8 환경 강제 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
#endregion

# Exit codes
$SUCCESS = 0
$ERROR_JSON_PARSE = 1
$ERROR_MISSING_FIELD = 2
$ERROR_DOWNLOAD = 3
$ERROR_FILE_COMBINE = 4
$ERROR_AUTH = 5
$ERROR_CONNECTION = 6
$ERROR_GENERAL = 8
$ERROR_RESPONSE = 9
$ERROR_INVOKE_WEB_REQ = 10
$ERROR_NO_FILE_EXIST = 11

#region 📝 2025-11-05 by yoon - 로그 관련

# 로그 관련 공통함수
Import-Module "$PSScriptRoot/../COMMON/log.psm1"

# 로그 파일이름의 Prefix 지정
$logPrefix = "U4A_WS_PATCH";

# ──────────────────────────────────────── *
# @since   2025-11-10 11:13:13
# @version v3.5.6-16
# @author  soccerhs
# @description
# 
# 파일레벨로 로그 남기는 공통 함수
# 
# ──────────────────────────────────────── *
function Write-Log {
    param (

        [Parameter(Mandatory = $true)]
        [string]$Message,

        [string]$Type = 'I'
  
    )

    if ($logPath) {
        Write-DailyLog -Message $Message -Prefix $logPrefix -LogDir $logPath -Type $Type
    }    
}

#endregion 📝 2025-11-05 by yoon - 로그 관련

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - Timeout을 지원하는 커스텀 WebClient 클래스 정의
# - 모든 PowerShell 버전 호환
#
# ──────────────────────────────────────── *
Add-Type -TypeDefinition @"
using System;
using System.Net;

public class WebClientWithTimeout : WebClient
{
    public int TimeoutMilliseconds { get; set; }

    public WebClientWithTimeout()
    {
        TimeoutMilliseconds = 300000; // 기본값 5분
    }

    protected override WebRequest GetWebRequest(Uri address)
    {
        WebRequest request = base.GetWebRequest(address);
        if (request != null)
        {
            request.Timeout = TimeoutMilliseconds;
        }
        return request;
    }
}
"@

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - HTTPS 인증서 검증 회피를 위한 전역 설정
# - SkipCertificateCheck 파라미터가 true일 경우에만 적용
# - 모든 PowerShell 버전 호환
#
# ──────────────────────────────────────── *
function Initialize-CertificatePolicy {
    param(
        [bool]$SkipValidation
    )
    
    if ($SkipValidation) {
        Write-Host "⚠ SSL Certificate Validation: DISABLED" -ForegroundColor Yellow
        Write-Log -Type "I" -Message "SSL Certificate Validation Disabled (SkipCertificateCheck)"
        
        # 인증서 검증 완전히 무시
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { 
            param($sender, $certificate, $chain, $sslPolicyErrors)
            return $true 
        }
        
        # 모든 TLS 버전 활성화
        $protocols = @()
        $protocols += [Net.SecurityProtocolType]::Tls
        $protocols += [Net.SecurityProtocolType]::Tls11
        $protocols += [Net.SecurityProtocolType]::Tls12
        
        # TLS 1.3 지원 확인
        try {
            $tls13 = [Net.SecurityProtocolType]::Tls13
            $protocols += $tls13
        }
        catch {
            Write-Host "  TLS 1.3 not supported on this system" -ForegroundColor Gray
        }
        
        [Net.ServicePointManager]::SecurityProtocol = $protocols -join ', '
        
        # 추가 설정
        [System.Net.ServicePointManager]::Expect100Continue = $false
        [System.Net.ServicePointManager]::CheckCertificateRevocationList = $false
        [System.Net.ServicePointManager]::MaxServicePointIdleTime = 30000
        [System.Net.ServicePointManager]::DefaultConnectionLimit = 50
        
        Write-Host "  SecurityProtocol: $([Net.ServicePointManager]::SecurityProtocol)" -ForegroundColor Green
        Write-Host "  Expect100Continue: $([System.Net.ServicePointManager]::Expect100Continue)" -ForegroundColor Green
        Write-Host "  CheckCertificateRevocationList: $([System.Net.ServicePointManager]::CheckCertificateRevocationList)" -ForegroundColor Green
        
        Write-Log -Type "I" -Message "SecurityProtocol: $([Net.ServicePointManager]::SecurityProtocol)"
    }
    else {
        Write-Host "✓ SSL Certificate Validation: ENABLED" -ForegroundColor Green
        Write-Log -Type "I" -Message "SSL Certificate Validation Enabled"
    }
}

# Function to parse JSON safely
function Parse-JsonSafely {
    param([string]$JsonString)
    try {
        $parsed = $JsonString | ConvertFrom-Json
        return $parsed
    }
    catch {
        Write-Error "Failed to parse JSON input: $($_.Exception.Message)"
        Write-Log -Type "E" -Message "Failed to parse JSON input: $($_ | Out-String)"

        exit $ERROR_JSON_PARSE
    }
}

# Function to format number with leading zeros
function Format-NumberWithLeadingZeros {
    param([int]$Number)
    return "{0:D10}" -f $Number
}

# Function to show download progress
function Show-DownloadProgress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Type
    )
    $percentComplete = [math]::Round(($Current / $Total) * 100)
    Write-Progress -Activity "Downloading $Type Files" -Status "$Current of $Total files ($percentComplete%)" -PercentComplete $percentComplete
}

# Function to check error in response
function Check-retError {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
		
		# Check for >>NULL<< in non-JSON content first
        if ($content -match '^X$') {
            return "Error: NULL content detected in file"
        }
		
        if ($content -match '^\s*\{.*\}\s*$') {
            $responseJson = $content | ConvertFrom-Json
            if ($responseJson.TYPE -eq "E" -and $responseJson.ACTCD -eq "999") {
                return "Authentication Error: $($responseJson.MSG)"

            }elseif ($responseJson.RETCD -eq "E") {
                return "An Response Error Code: $($responseJson.MSGNR)"

            }
        }
        return $null
    }
    catch {
        Write-Debug "Error checking authentication: $($_.Exception.Message)"     
        Write-Log -Type "E" -Message "Error checking authentication: $($_ | Out-String)"

        return $null
    }
}

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - WebClient를 사용한 URL 연결 테스트
# - 전역 ServicePointManager 설정을 자동으로 따름
# - 모든 PowerShell 버전 호환
#
# ──────────────────────────────────────── *
function Test-UrlConnectivity {
    param(
        [string]$Url,
        [int]$Timeout = 30,
        [string]$ProxyAddress,
        [pscredential]$ProxyCredential
    )
    
    try {
        Write-Host "Testing connectivity to $Url..."
        Write-Log -Type "I" -Message "Testing connectivity to $Url..."        

        $webClient = New-Object WebClientWithTimeout
        
        try {
            # Timeout 설정 (밀리초)
            $webClient.TimeoutMilliseconds = $Timeout * 1000
            
            # Encoding 설정
            $webClient.Encoding = [System.Text.Encoding]::UTF8
            
            # Proxy 설정
            if ($ProxyAddress) {
                $proxy = New-Object System.Net.WebProxy($ProxyAddress)
                if ($ProxyCredential) {
                    $proxy.Credentials = $ProxyCredential.GetNetworkCredential()
                }
                $webClient.Proxy = $proxy
            }
            
            # 간단한 다운로드 시도
            $null = $webClient.DownloadString($Url)
            
            Write-Host "Connection successful"
            Write-Log -Type "I" -Message "Connection successful"   
            return $true
        }
        catch [System.Net.WebException] {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "Connection failed with status code: $statusCode"
            Write-Log -Type "I" -Message "Connection failed with status code: $statusCode"

            if ($_.Exception.Message -match "The remote name could not be resolved") {
                Write-Error "DNS resolution failed for $Url. Please check the URL and your network connectivity."
                Write-Log -Type "E" -Message "DNS resolution failed for $Url. Please check the URL and your network connectivity."
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($_.Exception.Message -match "The operation has timed out") {
                Write-Error "Connection to $Url timed out after $Timeout seconds."
                Write-Log -Type "E" -Message "Connection to $Url timed out after $Timeout seconds."
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
                Write-Error "Authentication or authorization error connecting to $Url."
                Write-Log -Type "E" -Message "Authentication or authorization error connecting to $Url."
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($statusCode -eq 404) {
                Write-Error "The requested resource at $Url was not found (404)."
                Write-Log -Type "E" -Message "The requested resource at $Url was not found (404)."
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            else {
                Write-Error "Connection to $Url failed: $($_.Exception.Message)"
                Write-Log -Type "E" -Message "Connection to $Url failed: $($_.Exception.Message)"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            return $false
        }
        finally {
            $webClient.Dispose()
        }
    }
    catch {
        Write-Error "Error testing connection to ${Url}: $($_.Exception.Message)"
        Write-Log -Type "E" -Message "Error testing connection to ${Url}: $($_.Exception.Message)"
        Write-Log -Type "E" -Message  ($_ | Out-String)
        return $false
    }
}

# ──────────────────────────────────────── *
# @since   2025-11-03 11:21:37
# @version v3.5.6-16
# @author  soccerhs
# @description
#
# - 파일이 존재하는지 체크 하는 함수
#
# ──────────────────────────────────────── *
# Waits up to 30 seconds for a file to appear; returns 1 if found, 0 otherwise.
function Wait-ForFile {
    param(
        [string]$FilePath,
        [int]$TimeoutSeconds  = 1,
        [int]$IntervalSeconds = 1
    )
    
    Write-Host "Check exists File. $FilePath"
    Write-Log -Type "I" -Message "Check exists File. $FilePath"
    
    # 파일 존재 여부 체크 카운트
    $iCheckCnt = 1

    $startTime = Get-Date
    while ((Get-Date) - $startTime -lt (New-TimeSpan -Seconds $TimeoutSeconds)) {
        if (Test-Path $FilePath) {
            return 1
        }

        Write-Host "No exists File ($iCheckCnt) --- $FilePath"
        Write-Log -Type "I" -Message "No exists File ($iCheckCnt) --- $FilePath"

        $iCheckCnt++

        Start-Sleep -Seconds $IntervalSeconds
    }
    return 0
}

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - WebClient를 사용한 파일 다운로드
# - POST 요청 지원
# - Timeout, UserAgent, Proxy 설정 지원
# - 전역 ServicePointManager 설정을 자동으로 따름
#
# ──────────────────────────────────────── *
function Invoke-WebClientDownload {
    param(
        [string]$Url,
        [hashtable]$Body,
        [string]$OutFile,
        [int]$TimeoutSeconds = 300,
        [string]$UserAgent,
        [string]$ProxyAddress,
        [pscredential]$ProxyCredential
    )
    
    $webClient = New-Object WebClientWithTimeout
    
    try {
        # Timeout 설정 (밀리초)
        $webClient.TimeoutMilliseconds = $TimeoutSeconds * 1000
        
        # Encoding 설정
        $webClient.Encoding = [System.Text.Encoding]::UTF8
        
        # UserAgent 설정
        if ($UserAgent) {
            $webClient.Headers.Add("User-Agent", $UserAgent)
        }
        
        # Proxy 설정
        if ($ProxyAddress) {
            $proxy = New-Object System.Net.WebProxy($ProxyAddress)
            if ($ProxyCredential) {
                $proxy.Credentials = $ProxyCredential.GetNetworkCredential()
            }
            $webClient.Proxy = $proxy
        }
        
        # Body를 query string 형태로 변환
        $postData = ""
        foreach ($key in $Body.Keys) {
            if ($postData.Length -gt 0) {
                $postData += "&"
            }
            $postData += [System.Web.HttpUtility]::UrlEncode($key) + "=" + [System.Web.HttpUtility]::UrlEncode($Body[$key])
        }
        
        # Content-Type 설정
        $webClient.Headers.Add("Content-Type", "application/x-www-form-urlencoded")
        
        $postBytes = [System.Text.Encoding]::UTF8.GetBytes($postData)  # ← POST 데이터를 바이트로

        $responseBytes = $webClient.UploadData($Url, "POST", $postBytes)  # ← 바이트 배열 반환
        
        [System.IO.File]::WriteAllBytes($OutFile, $responseBytes)  # ← 바이너리로 저장
        
        return $true
    }
    catch {
        throw $_
    }
    finally {
        $webClient.Dispose()
    }
}

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - WebClient를 사용하도록 수정된 다운로드 및 파일 결합 함수
# - Invoke-WebRequest 대신 Invoke-WebClientDownload 사용
# - 모든 PowerShell 버전 호환
#
# ──────────────────────────────────────── *
function Process-Downloads {
    param(
        [int]$TotalCount,
        [string]$OutputPath,
        [string]$Type,        
        [hashtable]$Credentials,
        [hashtable]$RequestConfig
    )

    # 파일 경로에서 디렉토리와 파일명 분리
    $workDirectory = Split-Path -Path $OutputPath -Parent
    $outputFileName = Split-Path -Path $OutputPath -Leaf
    
    Write-Host "Starting download of $TotalCount $Type files..."
    Write-Host "Work Directory: $workDirectory"
    Write-Host "Output File: $outputFileName"

    Write-Log -Type "I" -Message "Starting download of $TotalCount $Type files..."
    Write-Log -Type "I" -Message "Work Directory: $workDirectory"
    Write-Log -Type "I" -Message "Output File: $outputFileName"
    
    # 작업 디렉토리가 존재하는지 확인하고 없으면 생성
    if (-not (Test-Path -Path $workDirectory)) {
        New-Item -Path $workDirectory -ItemType Directory -Force | Out-Null
        Write-Host "Created work directory: $workDirectory"
        Write-Log -Type "I" -Message "Created work directory: $workDirectory"
    }
    
    # 작업 디렉토리로 이동
    Push-Location $workDirectory
    
    # Clean up any existing .wsx files for this type
    $filePattern = "$Type*.wsx"
    Remove-Item -Path $filePattern -ErrorAction SilentlyContinue

    # Download files
    for ($i = 1; $i -le $TotalCount; $i++) {
        $formattedNumber = Format-NumberWithLeadingZeros -Number $i
        $tempOutputFile = Join-Path -Path $workDirectory -ChildPath "$Type$formattedNumber.wsx"
        
        Show-DownloadProgress -Current $i -Total $TotalCount -Type $Type
        
        $body = $Credentials.Clone()
        $body['RELKY'] = $formattedNumber

        # ──────────────────────────────────────── *
        # WebClient를 사용한 다운로드
        # ──────────────────────────────────────── *
        try {
            $downloadParams = @{
                Url = $RequestConfig.Url
                Body = $body
                OutFile = $tempOutputFile
                TimeoutSeconds = $RequestConfig.TimeoutSeconds
            }
            
            if ($RequestConfig.UserAgent) {
                $downloadParams.UserAgent = $RequestConfig.UserAgent
            }
            
            if ($RequestConfig.ProxyAddress) {
                $downloadParams.ProxyAddress = $RequestConfig.ProxyAddress
            }
            
            if ($RequestConfig.ProxyCredential) {
                $downloadParams.ProxyCredential = $RequestConfig.ProxyCredential
            }
            
            $null = Invoke-WebClientDownload @downloadParams
        }
        catch {
            $errMsg = $_ | Out-String            
            $errType = $_.Exception.GetType().FullName

            # 콘솔(표준 오류)에 기록
            Write-Error "WebClient download failed: [$errType] $errMsg"
            Write-Log -Type "E" -Message "WebClient download failed: [$errType] $errMsg"

            # 종료 코드로 명시적 전달
            Pop-Location
            exit $ERROR_INVOKE_WEB_REQ
        } 
        
        try {  
            # ──────────────────────────────────────── *
            # 파일 존재 유무 체크 (30초동안 1초에 한번식 체크)        
            # ──────────────────────────────────────── * 
            $isfileExixts = Wait-ForFile -FilePath $tempOutputFile -TimeoutSeconds 30
            if ($isfileExixts -eq 1) {
                Write-Host "Success: File exists. $Type file: $tempOutputFile"
                Write-Log -Type "I" -Message "Success: File exists. $Type file: $tempOutputFile"
            } else {         
                Write-Error "Error: File not found. $Type file: $tempOutputFile"
                Write-Log -Type "E" -Message "Error: File not found. $Type file: $tempOutputFile"
                Pop-Location
                exit $ERROR_NO_FILE_EXIST
            }

            # Check for bad file data
            $fileContent = Get-Content $tempOutputFile -Raw -ErrorAction SilentlyContinue
            if ($fileContent -eq "X") {
                Write-Host "Warning: File contains only 'X' character, which indicates an error"
                Write-Log -Type "I" -Message "Warning: File contains only 'X' character, which indicates an error"
            }          

            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $tempOutputFile
            if ($retError) {
                Write-Error $retError
                Write-Log -Type "E" -Message $retError
                Pop-Location
                exit $ERROR_RESPONSE
            }
            
            Write-Host "CHUNK_DOWN_OK:$i"
            Write-Log -Type "I" -Message "CHUNK_DOWN_OK:$i"
        }
        catch {
            Write-Error "Failed to download file $tempOutputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message "Failed to download file $tempOutputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message  ($_ | Out-String)
            Pop-Location
            exit $ERROR_DOWNLOAD
        }
    }
    
    Write-Progress -Activity "Downloading $Type Files" -Completed
    
    # Combine files
    Write-Host "Combining $Type files into $OutputPath..."
    Write-Log -Type "I" -Message "Combining $Type files into $OutputPath..."

    $copyCommand = "copy /b $filePattern `"$outputFileName`" >nul 2>&1"
    
    $result = cmd /c $copyCommand
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine $Type files. Exit code: $LASTEXITCODE"
        Write-Log -Type "E" -Message "Failed to combine $Type files. Exit code: $LASTEXITCODE"
        Pop-Location
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify and cleanup
    if (Test-Path $outputFileName) {
        Write-Host "Successfully created $outputFileName in $workDirectory"
        Write-Log -Type "I" -Message "Successfully created $outputFileName in $workDirectory"
        
        Remove-Item -Path $filePattern -Force

        Write-Host "Cleaned up temporary $Type .wsx files"
        Write-Log -Type "I" -Message "Cleaned up temporary $Type .wsx files"
    }
    else {
        Write-Error "Failed to create final $Type file"
        Write-Log -Type "E" -Message "Failed to create final $Type file"
        Pop-Location
        exit $ERROR_FILE_COMBINE
    }
    
    # 작업 디렉토리에서 나오기
    Pop-Location
}

# ──────────────────────────────────────── *
# Main execution block
# ──────────────────────────────────────── *
try {

    # ──────────────────────────────────────── *
    # @since   2025-12-11
    # @version vNAN-NAN
    # @author  soccerhs
    # @description
    # 
    #  - SkipCertificateCheck 옵션에 따른 인증서 검증 설정
    #  - 모든 PowerShell 버전 호환
    #
    # ──────────────────────────────────────── *
    Initialize-CertificatePolicy -SkipValidation $SkipCertificateCheck

    # Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput

    # log Prefix 만들때 버전 + Patch 번호 조합하기
    $logPrefix += "_" + $config.VERSN + "-" + $config.SPLEV
    
    # Verify JSON fields and validate counts
    if ($null -eq $config.TOTSP -or $null -eq $config.TOTND) {
        Write-Error "Missing required TOTSP or TOTND field in JSON input"
        Write-Log -Type "E" -Message "Missing required TOTSP or TOTND field in JSON input"
        exit $ERROR_MISSING_FIELD
    }
    
    # Check if both counts are 0
    if ($config.TOTSP -eq 0 -and $config.TOTND -eq 0) {
        Write-Error "Both TOTSP and TOTND counts cannot be 0"
        Write-Log -Type "E" -Message "Both TOTSP and TOTND counts cannot be 0"
        exit $ERROR_MISSING_FIELD
    }
    
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/ws_support_patch"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'PRCCD' = '02'
        'NEW_PATCH' = 'X'
    }

    # Build request configuration for WebClient
    $requestConfig = @{
        Url = $baseUrl
        TimeoutSeconds = $Timeout
    }
    
    # Add optional parameters if provided
    if ($PSBoundParameters.ContainsKey('UserAgent')) {
        $requestConfig.UserAgent = $UserAgent
    }
    
    if ($PSBoundParameters.ContainsKey('ProxyAddress')) {
        $requestConfig.ProxyAddress = $ProxyAddress
    }
   
    if ($PSBoundParameters.ContainsKey('ProxyCredential')) {
        $requestConfig.ProxyCredential = $ProxyCredential
    }
    
    # Test connectivity to the base URL
    $baseServer = $BaseUrl -replace '(/[^/]+)?$', '' # Extract server part without endpoint
    
    $isConnected = Test-UrlConnectivity -Url $baseServer -Timeout 10 -ProxyAddress $ProxyAddress -ProxyCredential $ProxyCredential
    
    if (-not $isConnected) {
        Write-Error "Cannot connect to server at $baseServer. Please check your network connection and server status."
        Write-Log -Type "E" -Message "Cannot connect to server at $baseServer. Please check your network connection and server status."
        exit $ERROR_CONNECTION
    }

    # Process SP (Support Package) downloads if count > 0
    if ($config.TOTSP -gt 0) {
        $spCredentials = $credentials.Clone()
        $spCredentials['RELID'] = 'SP'
        Process-Downloads -TotalCount $config.TOTSP -OutputPath $spPath -Type "SP" -Credentials $spCredentials -RequestConfig $requestConfig
    }

    # Process ND (Node.js) downloads if count > 0
    if ($config.TOTND -gt 0) {
        $ndCredentials = $credentials.Clone()
        $ndCredentials['RELID'] = 'ND'
        Process-Downloads -TotalCount $config.TOTND -OutputPath $ndPath -Type "ND" -Credentials $ndCredentials -RequestConfig $requestConfig
    }

    exit $SUCCESS
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Log -Type "E" -Message  "An error occurred: $($_ | Out-String)"
    exit $ERROR_GENERAL
}