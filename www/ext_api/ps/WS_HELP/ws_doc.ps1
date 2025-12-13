## SAP U4A Workspace Help Document Download Script (WebClient Version)
# HowTo : ws_doc.ps1 -BaseUrl '[Server Host Url]:[Service Port]' -sapClient '[클라이언트]' -sapUser '[User]' -sapPassword '[비번]' -dPath '[문서 저장경로]' -JsonInput '{"LANGU":"3","RINDX":3,"VERSN":"1.03","SPCNT":37,"RFNAM":"U4A_Document.chm","LOCFN":"U4A_WS30_DOCU_V1.03.chm","FSIZE":36188716,"BSPSZ":0,"DUMMY":"","ISACT":"X","CRDAT":"20250210","CRTIM":"225247","CRNAM":"U4AIDE","RETCD":"","MSGNR":"","LANG_O":"KO","BLOBCNT":37}' -Timeout [**기본값 300] -UserAgent '[**옵션]' -UseBasicParsing '[**옵션]' -MaximumRedirection [**기본값 5] -DisableKeepAlive [** 기본값 false] -SkipCertificateCheck [** 기본값 false] -ProxyAddress '[**옵션]' -ProxyCredential '[**옵션]'
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
    [string]$dPath,

    [Parameter(Mandatory=$true)]
    [string]$JsonInput,
    
    # Optional Request Parameters
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 30,
    
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

# UTF-8 환경 강제 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Exit codes
$SUCCESS = 0
$ERROR_JSON_PARSE = 1
$ERROR_MISSING_FIELD = 2
$ERROR_DOWNLOAD = 3
$ERROR_FILE_COMBINE = 4
$ERROR_RESPONSE = 5
$ERROR_CONNECTION = 6
$ERROR_GENERAL = 8
$ERROR_INVOKE_WEB_REQ = 10
$ERROR_NO_FILE_EXIST = 11

# 로그 관련 공통함수
Import-Module "$PSScriptRoot/../COMMON/log.psm1"

# 로그 파일이름의 Prefix 지정
$logPrefix = "U4A_WS_HELP_DOC";

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
    param(
        [int]$Number,
        [int]$Length
    )
    return "{0:D$($Length)}" -f $Number
}

# Function to show download progress
function Show-DownloadProgress {
    param(
        [int]$Current,
        [int]$Total
    )
    $percentComplete = [math]::Round(($Current / $Total) * 100)
    Write-Progress -Activity "Downloading Patch Files" -Status "$Current of $Total files ($percentComplete%)" -PercentComplete $percentComplete
}

# Function to check error in response
function Check-retError {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        if ($content -match '^\s*\{.*\}\s*$') {
            $responseJson = $content | ConvertFrom-Json
            if ($responseJson.TYPE -eq "E" -and $responseJson.ACTCD -eq "999") {
                return "Authentication Error: $($responseJson.MSG)"
            }
            elseif ($responseJson.RETCD -eq "E") {
                return "An Response Error Code: $($responseJson.MSGNR)"
            }
        }
        return $null
    }
    catch {
        Write-Debug "Error checking authentication: $($_.Exception.Message)"
        Write-Log -Type "E" -Message  "Error checking authentication: $($_ | Out-String)"
        return $null
    }
}

# ──────────────────────────────────────── *
# @since   2025-12-12
# @version vNAN-NAN
# @author  soccerhs
# @description
# 
# - WebClient를 사용한 URL 연결 테스트
# - POST 요청 + Body 지원 (SAP 인증 포함)
# - XMLHttpRequest.timeout처럼 정확한 timeout 동작
# - 전역 ServicePointManager 설정을 자동으로 따름
# - 모든 PowerShell 버전 호환
#
# ──────────────────────────────────────── *
#region Test-UrlConnectivity
#endregion 
function Test-UrlConnectivity {
    param(
        [string]$Url,
        [hashtable]$Body,  # ← Body 파라미터 추가
        [int]$Timeout = 30,
        [string]$ProxyAddress,
        [pscredential]$ProxyCredential
    )
    
    try {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "  Test-UrlConnectivity 시작" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "  URL     : $Url" -ForegroundColor Cyan
        Write-Host "  Timeout : $Timeout seconds" -ForegroundColor Cyan
        Write-Host "  Method  : POST (with credentials)" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Log -Type "I" -Message "Testing connectivity to $Url (Timeout: ${Timeout}s, Method: POST with credentials)"

        $webClient = New-Object WebClientWithTimeout
        
        try {
            # Timeout 설정 (밀리초) - 전체 요청/응답 시간
            $webClient.TimeoutMilliseconds = $Timeout * 1000
            
            # Encoding 설정
            $webClient.Encoding = [System.Text.Encoding]::UTF8
            
            # Proxy 설정 - 명시적 처리
            if ($ProxyAddress) {
                Write-Host "  Proxy 사용: $ProxyAddress" -ForegroundColor Gray
                Write-Log -Type "I" -Message "Using Proxy: $ProxyAddress"
                
                $proxy = New-Object System.Net.WebProxy($ProxyAddress)
                if ($ProxyCredential) {
                    $proxy.Credentials = $ProxyCredential.GetNetworkCredential()
                }
                $webClient.Proxy = $proxy
            }
            else {
                # 시스템 기본 Proxy 사용 안 함 (timeout 정확도 보장)
                Write-Host "  Proxy 사용 안 함 (직접 연결)" -ForegroundColor Gray
                Write-Log -Type "I" -Message "Direct connection (No proxy)"
                $webClient.Proxy = $null
            }
            
            # Body를 query string 형태로 변환 (Invoke-WebClientDownload와 동일)
            $postData = ""
            if ($Body) {
                foreach ($key in $Body.Keys) {
                    if ($postData.Length -gt 0) {
                        $postData += "&"
                    }
                    # 비밀번호는 로그에 표시하지 않음
                    if ($key -ne "sap-password") {
                        Write-Host "  Body[$key]: $($Body[$key])" -ForegroundColor Gray
                    }
                    else {
                        Write-Host "  Body[$key]: ********" -ForegroundColor Gray
                    }
                    $postData += [System.Web.HttpUtility]::UrlEncode($key) + "=" + [System.Web.HttpUtility]::UrlEncode($Body[$key])
                }
            }
            
            # 호출 직전
            Write-Host ""
            Write-Host "→ HTTP POST 요청 시작..." -ForegroundColor Cyan
            Write-Host "  (SAP 엔드포인트 인증 포함 테스트)" -ForegroundColor Gray
            
            $startTime = Get-Date
            
            # Content-Type 설정
            $webClient.Headers.Add("Content-Type", "application/x-www-form-urlencoded")
            
            # POST 요청 (Invoke-WebClientDownload와 동일한 방식)
            $postBytes = [System.Text.Encoding]::UTF8.GetBytes($postData)
            $responseBytes = $webClient.UploadData($Url, "POST", $postBytes)
            $result = [System.Text.Encoding]::UTF8.GetString($responseBytes)
            
            # 호출 직후
            $endTime = Get-Date
            $elapsed = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
            
            Write-Host "✓ HTTP POST 요청 완료!" -ForegroundColor Green
            Write-Host "  소요 시간: $elapsed 초" -ForegroundColor Green
            Write-Host "  응답 크기: $($result.Length) bytes" -ForegroundColor Green
            
            # 응답이 너무 길면 일부만 표시
            if ($result.Length -gt 200) {
                $preview = $result.Substring(0, 200) + "..."
                Write-Host "  응답 미리보기: $preview" -ForegroundColor Gray
            }
            else {
                Write-Host "  응답 내용: $result" -ForegroundColor Gray
            }
            Write-Host ""
            
            Write-Log -Type "I" -Message "Connection successful (Elapsed: ${elapsed}s, Response: $($result.Length) bytes)"
            return $true
        }
        catch [System.Net.WebException] {
            $endTime = Get-Date
            $elapsed = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
            
            Write-Host ""
            Write-Host "✗ 연결 실패!" -ForegroundColor Red
            Write-Host "  소요 시간: $elapsed 초" -ForegroundColor Yellow
            Write-Host "  Exception Type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
            Write-Host "  Exception Message: $($_.Exception.Message)" -ForegroundColor Red
            
            # 타임아웃 여부 명확히 표시
            if ($_.Exception.Message -match "The operation has timed out") {
                Write-Host ""
                Write-Host "⏱ TIMEOUT 발생!" -ForegroundColor Magenta
                Write-Host "  설정 시간: $Timeout 초" -ForegroundColor Magenta
                Write-Host "  실제 소요: $elapsed 초" -ForegroundColor Magenta
                Write-Host ""
            }
            
            $statusCode = 0
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                Write-Host "  HTTP Status Code: $statusCode" -ForegroundColor Red
            }
            Write-Host ""
            
            Write-Log -Type "E" -Message "Connection failed (Elapsed: ${elapsed}s, Status: $statusCode)"

            if ($_.Exception.Message -match "The remote name could not be resolved") {
                Write-Error "DNS resolution failed for $Url. Please check the URL and your network connectivity."
                Write-Log -Type "E" -Message "DNS resolution failed for $Url"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($_.Exception.Message -match "The operation has timed out") {
                Write-Error "Connection to $Url timed out after $Timeout seconds."
                Write-Log -Type "E" -Message "Connection timeout after $Timeout seconds"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
                Write-Error "Authentication or authorization error connecting to $Url."
                Write-Log -Type "E" -Message "Authentication or authorization error"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($statusCode -eq 404) {
                Write-Error "The requested resource at $Url was not found (404)."
                Write-Log -Type "E" -Message "Resource not found (404)"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            elseif ($statusCode -eq 405) {
                Write-Host "⚠ Method Not Allowed (405) - 서버가 POST 요청을 지원하지 않습니다." -ForegroundColor Yellow
                Write-Log -Type "W" -Message "Method Not Allowed (405)"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            else {
                Write-Error "Connection to $Url failed: $($_.Exception.Message)"
                Write-Log -Type "E" -Message "Connection failed: $($_.Exception.Message)"
                Write-Log -Type "E" -Message  ($_ | Out-String)
            }
            return $false
        }
        finally {
            $webClient.Dispose()
        }
    }
    catch {
        Write-Host ""
        Write-Host "✗ 예상치 못한 에러!" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        
        Write-Error "Error testing connection to ${Url}: $($_.Exception.Message)"
        Write-Log -Type "E" -Message "Unexpected error: $($_.Exception.Message)"
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

# Main execution block
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
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  U4A Help Document Download Script" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Log -Type "I" -Message "========== Script Started =========="
    Write-Log -Type "I" -Message "BaseUrl: $BaseUrl"
    Write-Log -Type "I" -Message "PowerShell Version: $($PSVersionTable.PSVersion)"

    # HTTPS 인증서 검증 설정
    Initialize-CertificatePolicy -SkipValidation $SkipCertificateCheck

    # 1. Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput

    # log Prefix 만들때 버전 번호 조합하기
    $logPrefix += "_" + $config.VERSN
    
    # Verify required JSON field exists(Language Key)
    if ($null -eq $config.LANG_O) {
        Write-Error "Missing required `"LANG_O`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"LANG_O`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Rel. Index)
    if ($null -eq $config.RINDX) {
        Write-Error "Missing required `"RINDX`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"RINDX`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(BLOB Request Count)
    if ($null -eq $config.BLOBCNT) {
        Write-Error "Missing required `"BLOBCNT`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"BLOBCNT`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Local File Name)
    if ($null -eq $config.LOCFN) {
        Write-Error "Missing required `"LOCFN`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"LOCFN`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Change to the work directory (ePath)
    Set-Location -Path $dPath
    Write-Host "Working directory set to: $dPath"
    Write-Log -Type "I" -Message "Working directory set to: $dPath"

    #region Base Url
    #endregion    
    # 2. Process downloads based on BLOBCNT count
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/u4a_help_doc_ws30"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'PRCCD' = 'ITEM'
        'LANGU_OUT' = $config.LANG_O
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
    # $baseServer = $BaseUrl -replace '(/[^/]+)?$', '' # Extract server part without endpoint
    $baseServer = $baseUrl  # 실제 SAP 엔드포인트 사용
    $testBody = $credentials.Clone()  # ← credentials 복사해서 사용!

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  연결 테스트 준비" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  BaseUrl : $BaseUrl" -ForegroundColor White
    Write-Host "  ⚠ 실제 SAP 엔드포인트로 인증 포함 테스트합니다" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""

    $isConnected = Test-UrlConnectivity -Url $baseServer -Body $testBody -Timeout $Timeout -ProxyAddress $ProxyAddress -ProxyCredential $ProxyCredential

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  연결 테스트 결과: $isConnected" -ForegroundColor $(if ($isConnected) { "Green" } else { "Red" })
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""

    if (-not $isConnected) {
        Write-Error "Cannot connect to server at $baseServer. Please check your network connection and server status."
        Write-Log -Type "E" -Message "Cannot connect to server at $baseServer. Please check your network connection and server status."
        exit $ERROR_CONNECTION
    }
    
    Write-Host "Starting download of $($config.LOCFN) files..."
    Write-Log -Type "I" -Message "Starting download of $($config.LOCFN) files..."

    
    # "[언어키] 키워드가 없는지 확인하고 없으면 .chm 앞에 _[언어키] 추가
    $lfnam = $config.LOCFN
#   if ($lfnam -notmatch $config.LANG_O) {
#       $fext = "_" + $config.LANG_O + ".chm"
#       $lfnam = $lfnam -replace '\.chm$', $fext
#       Write-Host "Converted filename: $lfnam"
#   }

    # Clean up any existing .dxx files
    Remove-Item -Path "*.dxx" -ErrorAction SilentlyContinue
    
    # 3. Download files using WebClient with progress bar    
    $relNumber = Format-NumberWithLeadingZeros -Number $config.RINDX -Length 10
    
    for ($i = 1; $i -le $config.BLOBCNT; $i++) {
        $posNumber = Format-NumberWithLeadingZeros -Number $i -Length 4
        $outputFile = Join-Path $dPath "$relNumber$posNumber.dxx"
        # $outputFile = "$relNumber" + "$posNumber.dxx"
        
        Show-DownloadProgress -Current $i -Total $config.BLOBCNT
        
        $body = $credentials.Clone()
        $body['RELKY'] = "$relNumber" + "$posNumber"

        # ──────────────────────────────────────── *
        # WebClient를 사용한 다운로드
        # ──────────────────────────────────────── *
        try {
            $downloadParams = @{
                Url = $requestConfig.Url
                Body = $body
                OutFile = $outputFile
                TimeoutSeconds = $requestConfig.TimeoutSeconds
            }
            
            if ($requestConfig.UserAgent) {
                $downloadParams.UserAgent = $requestConfig.UserAgent
            }
            
            if ($requestConfig.ProxyAddress) {
                $downloadParams.ProxyAddress = $requestConfig.ProxyAddress
            }
            
            if ($requestConfig.ProxyCredential) {
                $downloadParams.ProxyCredential = $requestConfig.ProxyCredential
            }
            
            #region Invoke-WebClientDownload
            #endregion 
            $null = Invoke-WebClientDownload @downloadParams
        }
        catch {
            $errMsg = $_ | Out-String            
            $errType = $_.Exception.GetType().FullName

            # 콘솔(표준 오류)에 기록
            Write-Error "WebClient download failed: [$errType] $errMsg"
            Write-Log -Type "E" -Message "WebClient download failed: [$errType] $errMsg"

            # 종료 코드로 명시적 전달
            exit $ERROR_INVOKE_WEB_REQ
        }

        try {

            # ──────────────────────────────────────── *
            # @since   2025-11-10 11:30:06
            # @version v3.5.6-16
            # @author  soccerhs
            # @description
            # 
            #  - 파일 존재 유무 체크 
            #   (30초동안 1초에 한번식 체크)        
            # ──────────────────────────────────────── *        
            $isfileExixts = Wait-ForFile -FilePath $outputFile -TimeoutSeconds 30
            if ($isfileExixts -eq 1) {
                Write-Host "Success: File exists. file: $outputFile"
                Write-Log -Type "I" -Message "Success: File exists. file: $outputFile"
            } else {         
                Write-Error "Error: File not found. file: $outputFile"
                Write-Log -Type "E" -Message "Error: File not found. file: $outputFile"
                exit $ERROR_NO_FILE_EXIST
            }        

            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $outputFile
            if ($retError) {
                Write-Error $retError
                Write-Log -Type "E" -Message $retError
                exit $ERROR_RESPONSE
            }
            
            Write-Host "CHUNK_DOWN_OK:$i"
            Write-Log -Type "I" -Message "CHUNK_DOWN_OK:$i"

        }
        catch {
            Write-Error "Failed to download file $outputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message "Failed to download file $outputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message  ($_ | Out-String)
            exit $ERROR_DOWNLOAD
        }
    }
    
    # Clear the progress bar
    Write-Progress -Activity "Downloading Patch Files" -Completed
    
    # 4. Combine all .dxx files into final document
    Write-Host "Combining files into $($lfnam) ..."
    Write-Log -Type "I" -Message "Combining files into $($lfnam) ..."

    $chk = $dPath.EndsWith("\")
    if ($chk -ne "True") {
        $outputDoc = $dPath + '\' + $lfnam
    } else {
        $outputDoc = $dPath + $lfnam
    }

    # Use cmd.exe to execute the copy command
    $copyCommand = "copy /b *.dxx `"$outputDoc`" >nul 2>&1"

    $result = cmd /c $copyCommand
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine files. Exit code: $LASTEXITCODE"
        Write-Log -Type "E" -Message "Failed to combine files. Exit code: $LASTEXITCODE"
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify the final file was created
    if (Test-Path $outputDoc) {
        Write-Host "Successfully created $outputDoc"
        Write-Log -Type "I" -Message "Successfully created $outputDoc"
        
        # Clean up .dxx files
        Remove-Item -Path "*.dxx" -Force
        Write-Host "Cleaned up temporary .dxx files"
        Write-Log -Type "I" -Message "Cleaned up temporary .dxx files"
        exit $SUCCESS
    }
    else {
        Write-Error "Failed to create final document"
        Write-Log -Type "E" -Message "Failed to create final document"
        exit $ERROR_FILE_COMBINE
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Log -Type "E" -Message  "An error occurred: $($_ | Out-String)"
    exit $ERROR_GENERAL
}