## SAP U4A Workspace Major Version Update Download Script
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
    [int]$Timeout = 300,
    
    [Parameter(Mandatory=$false)]
    [string]$UserAgent,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseBasicParsing,
    
    [Parameter(Mandatory=$false)]
    [int]$MaximumRedirection = 5,
    
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
$ERROR_RESPONSE = 5
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

# Main execution block
try {
    # 1. Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput
    
    # Verify required JSON field exists(version)
    if ($null -eq $config.VERSN) {
        Write-Error "Missing required \"VERSN\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Update Filename)
    if ($null -eq $config.UPDT_FNAME) {
        Write-Error "Missing required \"UPDT_FNAME\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(BLOB Chunk Count)
    if ($null -eq $config.TOT_CHUNK) {
        Write-Error "Missing required \"TOT_CHUNK\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Ensure the ePath exists
    if (-not (Test-Path -Path $ePath -PathType Container)) {
        try {
            New-Item -Path $ePath -ItemType Directory -Force | Out-Null
            Write-Host "Created directory: $ePath"
        }
        catch {
            Write-Error "Failed to create directory $ePath : $($_.Exception.Message)"
            exit $ERROR_GENERAL
        }
    }

    # Store the original location to restore later
    $originalLocation = Get-Location
    
    # Change to the work directory (ePath)
    Set-Location -Path $ePath
    Write-Host "Working directory set to: $ePath"
   
    # 2. Process downloads based on TOT_CHUNK count
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/ws_update_file_get"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'NEW_UPRC' = 'X'
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
        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_CONNECTION
    }

    Write-Host "Starting download of $($config.UPDT_FNAME) files..."

    # Clean up any existing .exx files in the work directory
    Remove-Item -Path "$ePath\*.exx" -ErrorAction SilentlyContinue
    
    $lfnam = $config.UPDT_FNAME
    
    # 3. Download files using Invoke-WebRequest with progress bar    
    for ($i = 1; $i -le $config.TOT_CHUNK; $i++) {
        $posNumber = Format-NumberWithLeadingZeros -Number $i -Length 10
        $outputFile = Join-Path -Path $ePath -ChildPath "$posNumber.exx"
        
        Show-DownloadProgress -Current $i -Total $config.TOT_CHUNK
        
        $body = $credentials.Clone()
        $body['relky'] = "$posNumber"
        
        try {
            # Update the OutFile for this iteration
            $requestParams.OutFile = $outputFile
            $requestParams.Body = $body
            
            # Use Invoke-WebRequest in silent mode
            $ProgressPreference = 'SilentlyContinue'            
            $response = Invoke-WebRequest @requestParams
            $ProgressPreference = 'Continue'
            
            if (-not (Test-Path $outputFile)) {
                Write-Error "Failed to download file: $outputFile"
                # Restore original location before exiting
                Set-Location -Path $originalLocation
                exit $ERROR_DOWNLOAD
            }

            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $outputFile
            if ($retError) {
                Write-Error $retError
                # Restore original location before exiting
                Set-Location -Path $originalLocation
                exit $ERROR_RESPONSE
            }
            
            Write-Host "CHUNK_DOWN_OK:$i"
            
        }
        catch {
            Write-Error "Failed to download file $outputFile : $($_.Exception.Message)"
            # Restore original location before exiting
            Set-Location -Path $originalLocation
            exit $ERROR_DOWNLOAD
        }
    }
    
    # Clear the progress bar
    Write-Progress -Activity "Downloading Major Version Update Files" -Completed
    
    # 4. Combine all .exx files into final executable
    Write-Host "Combining files into $($lfnam) ..."

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
        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
    
    # Use cmd.exe to execute the copy command in the work directory
    $copyCommand = "copy /b *.exx `"$outputEXE`" >nul 2>&1"
    $result = cmd /c $copyCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine files. Exit code: $LASTEXITCODE"
        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify the final file was created
    if (Test-Path $outputEXE) {
        Write-Host "Successfully created $outputEXE"
        
        # Clean up .exx files
        Remove-Item -Path "$ePath\*.exx" -Force
        Write-Host "Cleaned up temporary .exx files"
        
        # Restore the original location
        Set-Location -Path $originalLocation
        exit $SUCCESS
    }
    else {
        Write-Error "Failed to create final executable"
        # Restore original location before exiting
        Set-Location -Path $originalLocation
        exit $ERROR_FILE_COMBINE
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    # Restore original location if changed
    if ((Get-Location).Path -ne $originalLocation.Path) {
        Set-Location -Path $originalLocation
    }
    exit $ERROR_GENERAL
}