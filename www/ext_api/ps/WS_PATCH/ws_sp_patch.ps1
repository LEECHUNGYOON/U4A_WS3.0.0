## SAP U4A Workspace Patch Download Script
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
    
    [Parameter(Mandatory=$false)]
    [switch]$UseBasicParsing,
    
    [Parameter(Mandatory=$false)]
    [int]$MaximumRedirection = 5,
    
#    [Parameter(Mandatory=$false)]
#    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession,
    
    [Parameter(Mandatory=$false)]
    [switch]$DisableKeepAlive,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipCertificateCheck,
    
    [Parameter(Mandatory=$false)]
    [string]$ProxyAddress,
    
    [Parameter(Mandatory=$false)]
    [pscredential]$ProxyCredential
)

# Exit codes
$SUCCESS = 0
$ERROR_JSON_PARSE = 1
$ERROR_MISSING_FIELD = 2
$ERROR_DOWNLOAD = 3
$ERROR_FILE_COMBINE = 4
$ERROR_AUTH = 5
$ERROR_CONNECTION = 6
$ERROR_GENERAL = 8

# Function to parse JSON safely
function Parse-JsonSafely {
    param([string]$JsonString)
    try {
        $parsed = $JsonString | ConvertFrom-Json
        return $parsed
    }
    catch {
        Write-Error "Failed to parse JSON input: $($_.Exception.Message)"
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
        return $null
    }
}

# Function to test URL connectivity
function Test-UrlConnectivity {
    param(
        [string]$Url,
        [int]$Timeout = 30,
        [hashtable]$AdditionalParams = @{}
    )
    
    try {
        Write-Host "Testing connectivity to $Url..."
        
        # Create parameter hashtable for Invoke-WebRequest
        $testParams = @{
            Uri = $Url
            Method = 'HEAD'  # Use HEAD method to reduce data transfer
            TimeoutSec = $Timeout
            DisableKeepAlive = $true
            ErrorAction = 'Stop'
        }
        
        # Add any additional parameters
        foreach ($key in $AdditionalParams.Keys) {
            if (-not $testParams.ContainsKey($key)) {
                $testParams.Add($key, $AdditionalParams[$key])
            }
        }
        
        # Suppress progress bar
        $ProgressPreference = 'SilentlyContinue'
        $response = Invoke-WebRequest @testParams
        $ProgressPreference = 'Continue'
        
        # Check status code
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            Write-Host "Connection successful: Status code $($response.StatusCode)"
            return $true
        } else {
            Write-Host "Connection failed: Status code $($response.StatusCode)"
            return $false
        }
    }
    catch [System.Net.WebException] {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Connection failed with status code: $statusCode"
        
        if ($_.Exception.Message -match "The remote name could not be resolved") {
            Write-Error "DNS resolution failed for $Url. Please check the URL and your network connectivity."
        }
        elseif ($_.Exception.Message -match "The operation has timed out") {
            Write-Error "Connection to $Url timed out after $Timeout seconds."
        }
        elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Error "Authentication or authorization error connecting to $Url."
        }
        elseif ($statusCode -eq 404) {
            Write-Error "The requested resource at $Url was not found (404)."
        }
        else {
            Write-Error "Connection to $Url failed: $($_.Exception.Message)"
        }
        return $false
    }
    catch {
        Write-Error "Error testing connection to ${Url}: $($_.Exception.Message)"
        return $false
    }
}

# Function to process downloads and combine files
function Process-Downloads {
    param(
        [int]$TotalCount,
        [string]$OutputPath,
        [string]$Type,        
        [hashtable]$Credentials,
        [hashtable]$ReqParam
    )

    # 파일 경로에서 디렉토리와 파일명 분리
    $workDirectory = Split-Path -Path $OutputPath -Parent
    $outputFileName = Split-Path -Path $OutputPath -Leaf
    
    Write-Host "Starting download of $TotalCount $Type files..."
    Write-Host "Work Directory: $workDirectory"
    Write-Host "Output File: $outputFileName"
    
    # 작업 디렉토리가 존재하는지 확인하고 없으면 생성
    if (-not (Test-Path -Path $workDirectory)) {
        New-Item -Path $workDirectory -ItemType Directory -Force | Out-Null
        Write-Host "Created work directory: $workDirectory"
    }
    
    # 작업 디렉토리로 이동
    Push-Location $workDirectory
    
    # Clean up any existing .wsx files for this type
    $filePattern = "$Type*.wsx"
    Remove-Item -Path $filePattern -ErrorAction SilentlyContinue
    
    $reqParms = $ReqParam.Clone()

    # Download files
    for ($i = 1; $i -le $TotalCount; $i++) {
        $formattedNumber = Format-NumberWithLeadingZeros -Number $i
        $tempOutputFile = Join-Path -Path $workDirectory -ChildPath "$Type$formattedNumber.wsx"
        
        Show-DownloadProgress -Current $i -Total $TotalCount -Type $Type
        
        $body = $Credentials.Clone()
        $body['RELKY'] = $formattedNumber
        
        $reqParms.OutFile = $tempOutputFile
        $reqParms.Body = $body

        try {
            $ProgressPreference = 'SilentlyContinue'
            $response = Invoke-WebRequest @reqParms
            $ProgressPreference = 'Continue'

            if (-not (Test-Path $tempOutputFile)) {
                Write-Error "Failed to download $Type file: $tempOutputFile"
                Pop-Location
                exit $ERROR_DOWNLOAD
            }

            # Check for bad file data
            $fileContent = Get-Content $tempOutputFile -Raw -ErrorAction SilentlyContinue
            if ($fileContent -eq "X") {
                Write-Host "Warning: File contains only 'X' character, which indicates an error"
            }

            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $tempOutputFile
            if ($retError) {
                Write-Error $retError
                Pop-Location
                exit $ERROR_RESPONSE
            }
            
            Write-Host "CHUNK_DOWN_OK:$i"
            
        }
        catch {
            Write-Error "Failed to download $Type file $tempOutputFile : $($_.Exception.Message)"
            Pop-Location
            exit $ERROR_DOWNLOAD
        }
    }
    
    Write-Progress -Activity "Downloading $Type Files" -Completed
    
    # Combine files
    Write-Host "Combining $Type files into $OutputPath..."
    $copyCommand = "copy /b $filePattern `"$outputFileName`" >nul 2>&1"
    
    $result = cmd /c $copyCommand
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine $Type files. Exit code: $LASTEXITCODE"
        Pop-Location
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify and cleanup
    if (Test-Path $outputFileName) {
        Write-Host "Successfully created $outputFileName in $workDirectory"
        Remove-Item -Path $filePattern -Force
        Write-Host "Cleaned up temporary $Type .wsx files"
    }
    else {
        Write-Error "Failed to create final $Type file"
        Pop-Location
        exit $ERROR_FILE_COMBINE
    }
    
    # 작업 디렉토리에서 나오기
    Pop-Location
}

# Main execution block
try {
    # Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput
    
    # Verify JSON fields and validate counts
    if ($null -eq $config.TOTSP -or $null -eq $config.TOTND) {
        Write-Error "Missing required TOTSP or TOTND field in JSON input"
        exit $ERROR_MISSING_FIELD
    }
    
    # Check if both counts are 0
    if ($config.TOTSP -eq 0 -and $config.TOTND -eq 0) {
        Write-Error "Both TOTSP and TOTND counts cannot be 0"
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

    # Build request parameters - will be used for both testing and actual requests
    $requestParams = @{
        Uri = $baseUrl
        Method = 'Post'
        TimeoutSec = $Timeout
        OutFile = ""
    }
    
    # Add optional parameters if provided
    if ($PSBoundParameters.ContainsKey('UserAgent')) {
        $requestParams.Add('UserAgent', $UserAgent)
    }
    
    if ($UseBasicParsing) {
        $requestParams.Add('UseBasicParsing', $true)
    }
    
    if ($PSBoundParameters.ContainsKey('MaximumRedirection')) {
        $requestParams.Add('MaximumRedirection', $MaximumRedirection)
    }
    
#    if ($PSBoundParameters.ContainsKey('WebSession')) {
#        $requestParams.Add('WebSession', $WebSession)
#    }
    
    if ($DisableKeepAlive) {
        $requestParams.Add('DisableKeepAlive', $true)
    }
    
    if ($SkipCertificateCheck) {
        $requestParams.Add('SkipCertificateCheck', $true)
    }
    
    if ($PSBoundParameters.ContainsKey('ProxyAddress')) {
       $requestParams.Add('Proxy', $ProxyAddress)
    }
   
    if ($PSBoundParameters.ContainsKey('ProxyCredential')) {
       $requestParams.Add('ProxyCredential', $ProxyCredential)
    }
    
    # Test connectivity to the base URL
    $baseServer = $BaseUrl -replace '(/[^/]+)?$', '' # Extract server part without endpoint
    $testParams = $requestParams.Clone()
    $testParams.Remove('OutFile')
    $testParams.Method = 'HEAD'
    $testParams.Uri = $baseServer
    
    $isConnected = Test-UrlConnectivity -Url $baseServer -Timeout 10 -AdditionalParams $testParams
    
    if (-not $isConnected) {
        Write-Error "Cannot connect to server at $baseServer. Please check your network connection and server status."
        exit $ERROR_CONNECTION
    }

    # Process SP (Support Package) downloads if count > 0
    if ($config.TOTSP -gt 0) {
        $spCredentials = $credentials.Clone()
        $spCredentials['RELID'] = 'SP'
        Process-Downloads -TotalCount $config.TOTSP -OutputPath $spPath -Type "SP" -Credentials $spCredentials -ReqParam $requestParams

    }

    # Process ND (Node.js) downloads if count > 0
    if ($config.TOTND -gt 0) {
        $ndCredentials = $credentials.Clone()
        $ndCredentials['RELID'] = 'ND'
        Process-Downloads -TotalCount $config.TOTND -OutputPath $ndPath -Type "ND" -Credentials $ndCredentials -ReqParam $requestParams

    }

    exit $SUCCESS
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit $ERROR_GENERAL
}