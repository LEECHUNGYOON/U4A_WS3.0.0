## SAP U4A Workspace Patch Download Script
# HowTo : ws_patch_tmp.ps1 -BaseUrl 'http://u4arnd.com:8000' -sapClient '[클라이언트]' -sapUser '[User]' -sapPassword '[비번]' -spPath '[app.zip경로]' -JsonInput '{"RETCD":"S","RTMSG":"","VERSN":"v3.5.0","SPLEV":6,"TOTAL":57}'

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
    [string]$JsonInput
)

# Exit codes
$SUCCESS = 0
$ERROR_JSON_PARSE = 1
$ERROR_MISSING_FIELD = 2
$ERROR_DOWNLOAD = 3
$ERROR_FILE_COMBINE = 4
$ERROR_AUTH = 5
$ERROR_GENERAL = 8

# Function to parse JSON safely
function Parse-JsonSafely {
    param([string]$JsonString)
    try {
        $parsed = $JsonString | ConvertFrom-Json
        return $parsed
    }
    catch {
        Write-Error "Failed to parse JSON input: $_"
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
        [int]$Total
    )
    $percentComplete = [math]::Round(($Current / $Total) * 100)
    Write-Progress -Activity "Downloading Patch Files" -Status "$Current of $Total files ($percentComplete%)" -PercentComplete $percentComplete
}

# Function to check authentication error in response
function Check-AuthenticationError {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        if ($content -match '^\s*\{.*\}\s*$') {
            $responseJson = $content | ConvertFrom-Json
            if ($responseJson.TYPE -eq "E" -and $responseJson.ACTCD -eq "999") {
                return $responseJson.MSG
            }
        }
        return $null
    }
    catch {
        Write-Debug "Error checking authentication: $_"
        return $null
    }
}

# Main execution block
try {
    # 1. Parse the JSON input
    $config = Parse-JsonSafely -JsonString $JsonInput
    
    # Verify required JSON field exists
    if ($null -eq $config.TOTAL) {
        Write-Error "Missing required TOTAL field in JSON input"
        exit $ERROR_MISSING_FIELD
    }
    
    # 2. Process downloads based on TOTAL count
    $baseUrl = $BaseUrl + "/zu4a_wbc/u4a_ipcmain/ws_support_patch"
    $credentials = @{
        'sap-client' = $sapClient
        'sap-user' = $sapUser
        'sap-password' = $sapPassword
        'PRCCD' = '02'
        'RELID' = 'SP'
    }
    
    Write-Host "Starting download of $($config.TOTAL) files..."
    
    # Clean up any existing .wsx files
    Remove-Item -Path "*.wsx" -ErrorAction SilentlyContinue
    
    # 3. Download files using Invoke-WebRequest with progress bar
    for ($i = 1; $i -le $config.TOTAL; $i++) {
        $formattedNumber = Format-NumberWithLeadingZeros -Number $i
        $outputFile = "$formattedNumber.wsx"
        
        Show-DownloadProgress -Current $i -Total $config.TOTAL
        
        $body = $credentials.Clone()
        $body['RELKY'] = $formattedNumber
        
        try {
            # Use Invoke-WebRequest in silent mode
            $ProgressPreference = 'SilentlyContinue'
            $response = Invoke-WebRequest -Uri $baseUrl -Method Post -Body $body -OutFile $outputFile
            $ProgressPreference = 'Continue'
            
            if (-not (Test-Path $outputFile)) {
                Write-Error "Failed to download $Type file: $outputFile"
                exit $ERROR_DOWNLOAD
            }

            # Check for authentication error in the downloaded file
            $authError = Check-AuthenticationError -FilePath $outputFile
            if ($authError) {
                Write-Error "Authentication Error: $authError"
                exit $ERROR_AUTH
            }
        }
        catch {
            Write-Error "Failed to download file $outputFile : $_"
            exit $ERROR_DOWNLOAD
        }

    }
    
    # Clear the progress bar
    Write-Progress -Activity "Downloading Patch Files" -Completed
    
    # 4. Combine all .wsx files into final executable
    Write-Host "Combining files into U4A-Workspace-Setup-$($config.VERSN).exe..."
    $outputAsar = $spPath
    
    # Use cmd.exe to execute the copy command
    $copyCommand = "copy /b *.wsx `"$outputAsar`" >nul 2>&1"

    $result = cmd /c $copyCommand
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to combine files. Exit code: $LASTEXITCODE"
        exit $ERROR_FILE_COMBINE
    }
    
    # Verify the final file was created
    if (Test-Path $outputAsar) {
        Write-Host "Successfully created $outputAsar"
        
        # Clean up .wsx files
        Remove-Item -Path "*.wsx" -Force
        Write-Host "Cleaned up temporary .wsx files"
        exit $SUCCESS
    }
    else {
        Write-Error "Failed to create final executable"
        exit $ERROR_FILE_COMBINE
    }
}
catch {
    Write-Error "An error occurred: $_"
    exit $ERROR_GENERAL
}