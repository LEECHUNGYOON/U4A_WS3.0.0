## SAP U4A Workspace Help Document Download Script
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
    
    # Verify required JSON field exists(Language Key)
    if ($null -eq $config.LANG_O) {
        Write-Error "Missing required \"LANG_O\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Rel. Index)
    if ($null -eq $config.RINDX) {
        Write-Error "Missing required \"RINDX\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(BLOB Request Count)
    if ($null -eq $config.BLOBCNT) {
        Write-Error "Missing required \"BLOBCNT\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # Verify required JSON field exists(Local File Name)
    if ($null -eq $config.LOCFN) {
        Write-Error "Missing required \"LOCFN\" field in JSON input"
        exit $ERROR_MISSING_FIELD
    }

    # 2. Process downloads based on BLOBCNT count
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/u4a_help_doc_ws30"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'PRCCD' = 'ITEM'
        'LANGU_OUT' = $config.LANG_O
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
    
#   if ($PSBoundParameters.ContainsKey('WebSession')) {
#       $requestParams.Add('WebSession', $WebSession)
#   }
    
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
    
    Write-Host "Starting download of $($config.LOCFN) files..."
    
    # "[언어키] 키워드가 없는지 확인하고 없으면 .chm 앞에 _[언어키] 추가
    $lfnam = $config.LOCFN
#   if ($lfnam -notmatch $config.LANG_O) {
#       $fext = "_" + $config.LANG_O + ".chm"
#       $lfnam = $lfnam -replace '\.chm$', $fext
#       Write-Host "Converted filename: $lfnam"
#   }

    # Clean up any existing .dxx files
    Remove-Item -Path "*.dxx" -ErrorAction SilentlyContinue
    
    # 3. Download files using Invoke-WebRequest with progress bar    
    $relNumber = Format-NumberWithLeadingZeros -Number $config.RINDX -Length 10

    # Using previously created requestParams for all requests
    
    for ($i = 1; $i -le $config.BLOBCNT; $i++) {
        $posNumber = Format-NumberWithLeadingZeros -Number $i -Length 4
        $outputFile = "$relNumber" + "$posNumber.dxx"
        
        Show-DownloadProgress -Current $i -Total $config.BLOBCNT
        
        $body = $credentials.Clone()
        $body['RELKY'] = "$relNumber" + "$posNumber"
        
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
                exit $ERROR_DOWNLOAD
            }

            # Check for response error in the downloaded file
            $retError = Check-retError -FilePath $outputFile
            if ($retError) {
                Write-Error $retError
                exit $ERROR_RESPONSE
            }
            
            Write-Host "CHUNK_DOWN_OK:$i"
        }
        catch {
            Write-Error "Failed to download file $outputFile : $($_.Exception.Message)"
            exit $ERROR_DOWNLOAD
        }
    }
    
    # Clear the progress bar
    Write-Progress -Activity "Downloading Patch Files" -Completed
    
    # 4. Combine all .wsx files into final executable
    Write-Host "Combining files into $($lfnam) ..."

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
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify the final file was created
    if (Test-Path $outputDoc) {
        Write-Host "Successfully created $outputDoc"
        
        # Clean up .dxx files
        Remove-Item -Path "*.dxx" -Force
        Write-Host "Cleaned up temporary .dxx files"
        exit $SUCCESS
    }
    else {
        Write-Error "Failed to create final executable"
        exit $ERROR_FILE_COMBINE
    }
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit $ERROR_GENERAL
}