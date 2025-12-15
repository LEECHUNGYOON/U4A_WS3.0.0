## SAP U4A Workspace Major Version Update Download Script (WebClient Version)
# HowTo : ws_major_update.ps1 -BaseUrl '[Server Host Url]:[Service Port]' -sapClient '[클라이언트]' -sapUser '[User]' -sapPassword '[비번]' -ePath '[설치파일 저장경로]' -JsonInput '{"VERSN":"v3.5.0","UPDT_FNAME":"U4A-Workspace-Setup-3.5.0.exe","TOT_CHUNK":117}' -Timeout [**기본값 300] -UserAgent '[**옵션]' -UseBasicParsing '[**옵션]' -MaximumRedirection [**기본값 5] -DisableKeepAlive [** 기본값 false] -SkipCertificateCheck [** 기본값 false] -ProxyAddress '[**옵션]' -ProxyCredential '[**옵션]'
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
    [string]$ePath,

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
$logPrefix = "U4A_WS_MAJOR";

# ──────────────────────────────────────── *
# @since   2025-11-10 11:13:13
# @version v3.5.6-16
# @author  soccerhs
# @description
# 
# 파일레벨로 로그 남기는 공통 함수
# Write-Host (stdout) + 파일 로그 통합
# 
# ──────────────────────────────────────── *
function Write-Log {
    param (

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Message,

        [string]$Type = 'I',

        [string]$Color
  
    )

    # Write-Host 출력 (stdout)
    if ($Color) {
        Write-Host $Message -ForegroundColor $Color
    }
    else {
        Write-Host $Message
    }

    # 파일 로그 출력
    if ($logPath) {
        Write-DailyLog -Message $Message -Prefix $logPrefix -LogDir $logPath -Type $Type
    }    
}

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version v3.5.6-17
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
# @version v3.5.6-17
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
        Write-Log -Type "I" -Message "⚠ SSL Certificate Validation: DISABLED" -Color Yellow
        
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
            Write-Log -Type "I" -Message "  TLS 1.3 not supported on this system" -Color Gray
        }
        
        [Net.ServicePointManager]::SecurityProtocol = $protocols -join ', '
        
        # 추가 설정
        [System.Net.ServicePointManager]::Expect100Continue = $false
        [System.Net.ServicePointManager]::CheckCertificateRevocationList = $false
        [System.Net.ServicePointManager]::MaxServicePointIdleTime = 30000
        [System.Net.ServicePointManager]::DefaultConnectionLimit = 50
        
        Write-Log -Type "I" -Message "  SecurityProtocol: $([Net.ServicePointManager]::SecurityProtocol)" -Color Green
        Write-Log -Type "I" -Message "  Expect100Continue: $([System.Net.ServicePointManager]::Expect100Continue)" -Color Green
        Write-Log -Type "I" -Message "  CheckCertificateRevocationList: $([System.Net.ServicePointManager]::CheckCertificateRevocationList)" -Color Green
    }
    else {
        Write-Log -Type "I" -Message "✓ SSL Certificate Validation: ENABLED" -Color Green
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
    Write-Progress -Activity "Downloading Major Update Files" -Status "$Current of $Total files ($percentComplete%)" -PercentComplete $percentComplete
}

# Function to check error in response
function Check-retError {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
		
		# Check for >>NULL<< in non-JSON content first
        if ($content -match '>>NULL<<') {
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
# @since   2025-12-12
# @version v3.5.6-17
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
        Write-Log -Type "I" -Message ""
        Write-Log -Type "I" -Message "========================================" -Color Yellow
        Write-Log -Type "I" -Message "  Test-UrlConnectivity 시작" -Color Yellow
        Write-Log -Type "I" -Message "========================================" -Color Yellow
        Write-Log -Type "I" -Message "  URL     : $Url" -Color Cyan
        Write-Log -Type "I" -Message "  Timeout : $Timeout seconds" -Color Cyan
        Write-Log -Type "I" -Message "  Method  : POST (with credentials)" -Color Cyan
        Write-Log -Type "I" -Message "========================================" -Color Yellow
        Write-Log -Type "I" -Message ""
        Write-Log -Type "I" -Message "Testing connectivity to $Url (Timeout: ${Timeout}s, Method: POST with credentials)"

        $webClient = New-Object WebClientWithTimeout
        
        try {
            # Timeout 설정 (밀리초) - 전체 요청/응답 시간
            $webClient.TimeoutMilliseconds = $Timeout * 1000
            
            # Encoding 설정
            $webClient.Encoding = [System.Text.Encoding]::UTF8
            
            # Proxy 설정 - 명시적 처리
            if ($ProxyAddress) {
                Write-Log -Type "I" -Message "  Proxy 사용: $ProxyAddress" -Color Gray
                
                $proxy = New-Object System.Net.WebProxy($ProxyAddress)
                if ($ProxyCredential) {
                    $proxy.Credentials = $ProxyCredential.GetNetworkCredential()
                }
                $webClient.Proxy = $proxy
            }
            else {
                # 시스템 기본 Proxy 사용 안 함 (timeout 정확도 보장)
                Write-Log -Type "I" -Message "  Proxy 사용 안 함 (직접 연결)" -Color Gray
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
                        Write-Log -Type "I" -Message "  Body[$key]: $($Body[$key])" -Color Gray
                    }
                    else {
                        Write-Log -Type "I" -Message "  Body[$key]: ********" -Color Gray
                    }
                    $postData += [System.Web.HttpUtility]::UrlEncode($key) + "=" + [System.Web.HttpUtility]::UrlEncode($Body[$key])
                }
            }
            
            # 호출 직전
            Write-Log -Type "I" -Message ""
            Write-Log -Type "I" -Message "→ HTTP POST 요청 시작..." -Color Cyan
            Write-Log -Type "I" -Message "  (SAP 엔드포인트 인증 포함 테스트)" -Color Gray
            
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
            
            Write-Log -Type "I" -Message "✓ HTTP POST 요청 완료!" -Color Green
            Write-Log -Type "I" -Message "  소요 시간: $elapsed 초" -Color Green
            Write-Log -Type "I" -Message "  응답 크기: $($result.Length) bytes" -Color Green
            
            # 응답이 너무 길면 일부만 표시
            if ($result.Length -gt 200) {
                $preview = $result.Substring(0, 200) + "..."
                Write-Log -Type "I" -Message "  응답 미리보기: $preview" -Color Gray
            }
            else {
                Write-Log -Type "I" -Message "  응답 내용: $result" -Color Gray
            }
            Write-Log -Type "I" -Message ""
            
            return $true
        }
        catch [System.Net.WebException] {
            $endTime = Get-Date
            $elapsed = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
            
            Write-Log -Type "E" -Message ""
            Write-Log -Type "E" -Message "✗ 연결 실패!" -Color Red
            Write-Log -Type "E" -Message "  소요 시간: $elapsed 초" -Color Yellow
            Write-Log -Type "E" -Message "  Exception Type: $($_.Exception.GetType().FullName)" -Color Red
            Write-Log -Type "E" -Message "  Exception Message: $($_.Exception.Message)" -Color Red
            
            # 타임아웃 여부 명확히 표시
            if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::Timeout) {
                Write-Log -Type "E" -Message ""
                Write-Log -Type "E" -Message "⏱ TIMEOUT 발생!" -Color Magenta
                Write-Log -Type "E" -Message "  설정 시간: $Timeout 초" -Color Magenta
                Write-Log -Type "E" -Message "  실제 소요: $elapsed 초" -Color Magenta
                Write-Log -Type "E" -Message ""
            }
            
            $statusCode = 0
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                Write-Log -Type "E" -Message "  HTTP Status Code: $statusCode" -Color Red
            }
            Write-Log -Type "E" -Message ""

            if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::NameResolutionFailure) {
                Write-Error "DNS resolution failed for $Url. Please check the URL and your network connectivity."
                Write-Log -Type "E" -Message "DNS resolution failed for $Url"
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::Timeout) {
                Write-Error "Connection to $Url timed out after $Timeout seconds."
                Write-Log -Type "E" -Message "Connection timeout after $Timeout seconds"
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ProtocolError) {
                if ($statusCode -eq 401 -or $statusCode -eq 403) {
                    Write-Error "Authentication or authorization error connecting to $Url."
                    Write-Log -Type "E" -Message "Authentication or authorization error"
                }
                elseif ($statusCode -eq 404) {
                    Write-Error "The requested resource at $Url was not found (404)."
                    Write-Log -Type "E" -Message "Resource not found (404)"
                }
                elseif ($statusCode -eq 405) {
                    Write-Log -Type "W" -Message "⚠ Method Not Allowed (405) - 서버가 POST 요청을 지원하지 않습니다." -Color Yellow
                }
                else {
                    Write-Error "HTTP Error: $statusCode"
                    Write-Log -Type "E" -Message "HTTP Error: $statusCode"
                }
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
                Write-Error "Connection failed to $Url"
                Write-Log -Type "E" -Message "Connection failed to $Url"
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::TrustFailure) {
                Write-Error "SSL/TLS certificate error"
                Write-Log -Type "E" -Message "SSL/TLS certificate error"
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            else {
                Write-Error "Connection to $Url failed: $($_.Exception.Message)"
                Write-Log -Type "E" -Message "Connection failed: Status=$($_.Exception.Status)"
                Write-Log -Type "E" -Message ($_ | Out-String)
            }
            return $false
        }
        finally {
            $webClient.Dispose()
        }
    }
    catch {
        Write-Log -Type "E" -Message ""
        Write-Log -Type "E" -Message "✗ 예상치 못한 에러!" -Color Red
        Write-Log -Type "E" -Message "  $($_.Exception.Message)" -Color Red
        Write-Log -Type "E" -Message ""
        
        Write-Error "Error testing connection to ${Url}: $($_.Exception.Message)"
        Write-Log -Type "E" -Message ($_ | Out-String)
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
    
    Write-Log -Type "I" -Message "Check exists File. $FilePath"
    
    # 파일 존재 여부 체크 카운트
    $iCheckCnt = 1

    $startTime = Get-Date
    while ((Get-Date) - $startTime -lt (New-TimeSpan -Seconds $TimeoutSeconds)) {
        if (Test-Path $FilePath) {
            return 1
        }

        Write-Log -Type "I" -Message "No exists File ($iCheckCnt) --- $FilePath"

        $iCheckCnt++

        Start-Sleep -Seconds $IntervalSeconds
    }
    return 0
}

# ──────────────────────────────────────── *
# @since   2025-12-11
# @version v3.5.6-17
# @author  soccerhs
# @description
# 
# - WebClient를 사용한 파일 다운로드
# - POST 요청 지원
# - Timeout, UserAgent, Proxy 설정 지원
# - 전역 ServicePointManager 설정을 자동으로 따름
#
# ──────────────────────────────────────── *
#region Invoke-WebClientDownload
#endregion  
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
    $startTime = Get-Date
    
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
        
        $postBytes = [System.Text.Encoding]::UTF8.GetBytes($postData)

        $responseBytes = $webClient.UploadData($Url, "POST", $postBytes)
        
        [System.IO.File]::WriteAllBytes($OutFile, $responseBytes)
        
        return $true
    }
    catch [System.Net.WebException] {
        $endTime = Get-Date
        $elapsed = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
        
        Write-Log -Type "E" -Message ""
        Write-Log -Type "E" -Message "✗ 다운로드 실패!" -Color Red
        Write-Log -Type "E" -Message "  소요 시간: $elapsed 초" -Color Yellow
        Write-Log -Type "E" -Message "  Exception Type: $($_.Exception.GetType().FullName)" -Color Red
        Write-Log -Type "E" -Message "  Exception Message: $($_.Exception.Message)" -Color Red
        
        # 타임아웃 여부 명확히 표시
        if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::Timeout) {
            Write-Log -Type "E" -Message ""
            Write-Log -Type "E" -Message "⏱ TIMEOUT 발생!" -Color Magenta
            Write-Log -Type "E" -Message "  설정 시간: $TimeoutSeconds 초" -Color Magenta
            Write-Log -Type "E" -Message "  실제 소요: $elapsed 초" -Color Magenta
            Write-Log -Type "E" -Message ""
        }
        
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Log -Type "E" -Message "  HTTP Status Code: $statusCode" -Color Red
        }
        Write-Log -Type "E" -Message ""

        if ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::NameResolutionFailure) {
            Write-Log -Type "E" -Message "DNS resolution failed for $Url"
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::Timeout) {
            Write-Log -Type "E" -Message "Download timeout after $TimeoutSeconds seconds"
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ProtocolError) {
            if ($statusCode -eq 401 -or $statusCode -eq 403) {
                Write-Log -Type "E" -Message "Authentication or authorization error"
            }
            elseif ($statusCode -eq 404) {
                Write-Log -Type "E" -Message "Resource not found (404)"
            }
            elseif ($statusCode -eq 405) {
                Write-Log -Type "W" -Message "⚠ Method Not Allowed (405)" -Color Yellow
            }
            else {
                Write-Log -Type "E" -Message "HTTP Error: $statusCode"
            }
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::ConnectFailure) {
            Write-Log -Type "E" -Message "Connection failed to $Url"
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        elseif ($_.Exception.Status -eq [System.Net.WebExceptionStatus]::TrustFailure) {
            Write-Log -Type "E" -Message "SSL/TLS certificate error"
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        else {
            Write-Log -Type "E" -Message "Download failed: Status=$($_.Exception.Status)"
            Write-Log -Type "E" -Message ($_ | Out-String)
        }
        
        throw $_
    }
    catch {
        Write-Log -Type "E" -Message ""
        Write-Log -Type "E" -Message "✗ 예상치 못한 에러!" -Color Red
        Write-Log -Type "E" -Message "  $($_.Exception.Message)" -Color Red
        Write-Log -Type "E" -Message ""
        Write-Log -Type "E" -Message ($_ | Out-String)
        
        throw $_
    }
    finally {
        $webClient.Dispose()
    }
}

# ──────────────────────────────────────── *
# Main execution block
# ──────────────────────────────────────── *
#region Main execution block
#endregion 
try {

    # 1. Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput

    # log Prefix 만들때 버전 + Patch 번호 조합하기
    $logPrefix += "_" + $config.VERSN

    # ──────────────────────────────────────── *
    # @since   2025-12-11
    # @version v3.5.6-17
    # @author  soccerhs
    # @description
    # 
    #  - SkipCertificateCheck 옵션에 따른 인증서 검증 설정
    #  - 모든 PowerShell 버전 호환
    #
    # ──────────────────────────────────────── *
    Write-Log -Type "I" -Message ""
    Write-Log -Type "I" -Message "========================================" -Color Cyan
    Write-Log -Type "I" -Message "  U4A Major Update Download Script" -Color Cyan
    Write-Log -Type "I" -Message "========================================" -Color Cyan
    Write-Log -Type "I" -Message ""
    Write-Log -Type "I" -Message "BaseUrl: $BaseUrl"
    Write-Log -Type "I" -Message "PowerShell Version: $($PSVersionTable.PSVersion)"
    
    # HTTPS 인증서 검증 설정
    Initialize-CertificatePolicy -SkipValidation $SkipCertificateCheck
    
    # Verify required JSON field exists(version)
    if ($null -eq $config.VERSN) {
        Write-Error "Missing required `"VERSN`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"VERSN`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Update Filename)
    if ($null -eq $config.UPDT_FNAME) {
        Write-Error "Missing required `"UPDT_FNAME`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"UPDT_FNAME`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(BLOB Chunk Count)
    if ($null -eq $config.TOT_CHUNK) {
        Write-Error "Missing required `"TOT_CHUNK`" field in JSON input"
        Write-Log -Type "E" -Message "Missing required `"TOT_CHUNK`" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Ensure the ePath exists
    if (-not (Test-Path -Path $ePath -PathType Container)) {
        try {
            New-Item -Path $ePath -ItemType Directory -Force | Out-Null
            Write-Log -Type "I" -Message "Created directory: $ePath"
        }
        catch {
            Write-Error "Failed to create directory $ePath : $($_.Exception.Message)"
            Write-Log -Type "E" -Message "Failed to create directory $ePath : $($_.Exception.Message)"
            Write-Log -Type "E" -Message ($_ | Out-String)
            exit $ERROR_GENERAL
        }
    }

    # Store the original location to restore later
    $originalLocation = Get-Location
    
    # Change to the work directory (ePath)
    Set-Location -Path $ePath
    Write-Log -Type "I" -Message "Working directory set to: $ePath"

    #region Base Url
    #endregion       
    # 2. Process downloads based on TOT_CHUNK count
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/ws_update_file_get"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'NEW_UPRC' = 'X'
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
    
    Write-Log -Type "I" -Message ""
    Write-Log -Type "I" -Message "========================================" -Color Magenta
    Write-Log -Type "I" -Message "  연결 테스트 준비" -Color Magenta
    Write-Log -Type "I" -Message "========================================" -Color Magenta
    Write-Log -Type "I" -Message "  BaseUrl : $BaseUrl" -Color White
    Write-Log -Type "I" -Message "  ⚠ 실제 SAP 엔드포인트로 인증 포함 테스트합니다" -Color Yellow
    Write-Log -Type "I" -Message "========================================" -Color Magenta
    Write-Log -Type "I" -Message ""

    $isConnected = Test-UrlConnectivity -Url $baseServer -Body $testBody -Timeout $Timeout -ProxyAddress $ProxyAddress -ProxyCredential $ProxyCredential

    Write-Log -Type "I" -Message ""
    Write-Log -Type "I" -Message "========================================" -Color Magenta
    if ($isConnected) {
        Write-Log -Type "I" -Message "  연결 테스트 결과: $isConnected" -Color Green
    } else {
        Write-Log -Type "E" -Message "  연결 테스트 결과: $isConnected" -Color Red
    }
    Write-Log -Type "I" -Message "========================================" -Color Magenta
    Write-Log -Type "I" -Message ""

    if (-not $isConnected) {
        Write-Error "Cannot connect to server at $baseServer. Please check your network connection and server status."
        Write-Log -Type "E" -Message "Cannot connect to server at $baseServer. Please check your network connection and server status."
        exit $ERROR_CONNECTION
    }

    Write-Log -Type "I" -Message "Starting download of $($config.UPDT_FNAME) files..."

    # Clean up any existing .exx files in the work directory
    Remove-Item -Path "$ePath\*.exx" -ErrorAction SilentlyContinue
    
    $lfnam = $config.UPDT_FNAME
    
    # 3. Download files using WebClient with progress bar    
    for ($i = 1; $i -le $config.TOT_CHUNK; $i++) {
        $posNumber = Format-NumberWithLeadingZeros -Number $i -Length 10
        $outputFile = Join-Path -Path $ePath -ChildPath "$posNumber.exx"
        
        Show-DownloadProgress -Current $i -Total $config.TOT_CHUNK
        
        $body = $credentials.Clone()
        $body['relky'] = "$posNumber"

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
              
            $null = Invoke-WebClientDownload @downloadParams
        }
        catch {
            $errMsg = $_ | Out-String            
            $errType = $_.Exception.GetType().FullName

            # 콘솔(표준 오류)에 기록
            Write-Error "WebClient download failed: [$errType] $errMsg"
            Write-Log -Type "E" -Message "WebClient download failed: [$errType] $errMsg" 

            # 종료 코드로 명시적 전달
            Set-Location -Path $originalLocation
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
                Write-Log -Type "I" -Message "Success: File exists. file: $outputFile"
            } else {         
                Write-Error "Error: File not found. file: $outputFile"
                Write-Log -Type "E" -Message "Error: File not found. file: $outputFile"
                Set-Location -Path $originalLocation
                exit $ERROR_NO_FILE_EXIST
            }            
 
            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $outputFile
            if ($retError) {
                Write-Error $retError
                Write-Log -Type "E" -Message $retError

                # Restore original location before exiting
                Set-Location -Path $originalLocation
                exit $ERROR_RESPONSE
            }
            
            Write-Log -Type "I" -Message "CHUNK_DOWN_OK:$i"
        }
        catch {
            Write-Error "Failed to download file $outputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message "Failed to download file $outputFile : $($_.Exception.Message)"
            Write-Log -Type "E" -Message ($_ | Out-String)

            # Restore original location before exiting
            Set-Location -Path $originalLocation
            exit $ERROR_DOWNLOAD
        }
    }
    
    # Clear the progress bar
    Write-Progress -Activity "Downloading Major Version Update Files" -Completed
    
    # 4. Combine all .exx files into final executable
    Write-Log -Type "I" -Message "Combining files into $($lfnam) ..."

    # Determine the output file path
    if ($ePath -notmatch '\.exe$') {
        # If ePath doesn't end with .exe, combine with UPDT_FNAME
        $outputEXE = Join-Path -Path $ePath -ChildPath $config.UPDT_FNAME
    } else {
        # If ePath already ends with .exe, use it as is
        $outputEXE = $ePath
    }

    # Get all .exx files in the work directory and combine them
    $exxFiles = Get-ChildItem -Path "$ePath\*.exx" | Sort-Object Name
    if ($exxFiles.Count -ne $config.TOT_CHUNK) {
        Write-Error "Expected $($config.TOT_CHUNK) .exx files but found $($exxFiles.Count)"
        Write-Log -Type "E" -Message "Expected $($config.TOT_CHUNK) .exx files but found $($exxFiles.Count)"

        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
    
    # Use cmd.exe to execute the copy command in the work directory
    $copyCommand = "copy /b *.exx `"$outputEXE`" >nul 2>&1"
    $result = cmd /c $copyCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine files. Exit code: $LASTEXITCODE"
        Write-Log -Type "E" -Message "Failed to combine files. Exit code: $LASTEXITCODE"

        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify the final file was created
    if (Test-Path $outputEXE) {
        Write-Log -Type "I" -Message "Successfully created $outputEXE"
        
        # Clean up .exx files
        Remove-Item -Path "$ePath\*.exx" -Force
        Write-Log -Type "I" -Message "Cleaned up temporary .exx files"
        
        # Restore the original location
        Set-Location -Path $originalLocation
        exit $SUCCESS
    }
    else {
        Write-Error "Failed to create final executable"
        Write-Log -Type "E" -Message "Failed to create final executable"

        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Log -Type "E" -Message "An error occurred: $($_ | Out-String)"

    # Restore original location if changed
    if ((Get-Location).Path -ne $originalLocation.Path) {
        Set-Location -Path $originalLocation
    }
    exit $ERROR_GENERAL
}