# Exit code legend:
# 0 - Version starts with 800 and 64bit
# 1 - Version starts with 800 and 32bit
# 2 - Version starts with 770 and 64bit
# 3 - Version starts with 770 and 32bit
# 4 - Other versions
# 8 - File not found in any path

# Define target file paths
$pathA = "C:\Program Files\SAP\FrontEnd\SAPGUI\saplogon.exe"
$pathB = "C:\Program Files (x86)\SAP\FrontEnd\SAPgui\saplogon.exe"
$filePath = $null
$architecture = $null
$fileVersion = $null

# Initialize variables for finding saplogon.exe
$fileFound = $false

# Function to check registry for SAP installation paths
function Get-SapRegistryPaths {
    $registryPaths = @()
    
    # Check registry for installed SAP GUI
    $uninstallKeys = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    
    foreach ($key in $uninstallKeys) {
        if (Test-Path $key) {
            $apps = Get-ItemProperty $key | Where-Object { $_.DisplayName -like "*SAP GUI*" }
            foreach ($app in $apps) {
                if ($app.InstallLocation) {
                    $registryPaths += $app.InstallLocation
                    Write-Host "Found SAP registry path: $($app.InstallLocation)" -ForegroundColor Cyan
                }
                
                # Try to extract path from UninstallString
                if ($app.UninstallString) {
                    if ($app.UninstallString -match '"([^"]+)"') {
                        $extractPath = Split-Path $matches[1] -Parent
                        $registryPaths += $extractPath
                        Write-Host "Found SAP registry uninstall path: $extractPath" -ForegroundColor Cyan
                    }
                }
            }
        }
    }
    
    # Check SapFront.App registry paths
    $sapFrontPaths = @(
        "Registry::HKEY_CLASSES_ROOT\SapFront.App\protocol\StdFileEditing\server",
        "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SapFront.App\protocol\StdFileEditing\server",
        "Registry::HKEY_CURRENT_USER\SOFTWARE\Classes\SapFront.App\protocol\StdFileEditing\server"
    )
    
    foreach ($regPath in $sapFrontPaths) {
        if (Test-Path $regPath) {
            try {
                $regValue = (Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue).'(default)'
                if ($regValue) {
                    # Handle path that points to saplgpad.exe
                    if ($regValue -like "*saplgpad.exe*") {
                        $sapPath = $regValue -replace "saplgpad.exe", "saplogon.exe"
                        $registryPaths += $sapPath
                        Write-Host "Found SAP Front path (saplgpad): $sapPath" -ForegroundColor Cyan
                    }
                    
                    # Handle path that doesn't include SAPGUI
                    $frontEndPath = $regValue -replace "FrontEnd", "FrontEnd\SAPGUI"
                    if (-not $frontEndPath.EndsWith("\saplogon.exe")) {
                        $frontEndPath = $frontEndPath.TrimEnd('\') + "\saplogon.exe"
                    }
                    $registryPaths += $frontEndPath
                    Write-Host "Found SAP Front path (frontend): $frontEndPath" -ForegroundColor Cyan
                    
                    # Add the parent directory
                    $parentDir = Split-Path -Path $regValue -Parent
                    if ($parentDir) {
                        $registryPaths += $parentDir
                        Write-Host "Added parent directory: $parentDir" -ForegroundColor Cyan
                    }
                }
            }
            catch {
                $errorMsg = $_.Exception.Message
                Write-Host "Error reading registry path $regPath`: $errorMsg" -ForegroundColor Red
            }
        }
    }
    
    # Return unique paths
    return $registryPaths | Select-Object -Unique
}

# Function to recursively search for saplogon.exe in a given path with time limit
function Find-SapLogonInPath {
    param (
        [string]$Path,
        [int]$TimeoutSeconds = 30  # Default timeout of 30 seconds per path
    )
    
    Write-Host "Searching in $Path..." -ForegroundColor Yellow
    
    try {
        # Start a job for the search to allow timeout
        $job = Start-Job -ScriptBlock {
            param($searchPath)
            Get-ChildItem -Path $searchPath -Filter "saplogon.exe" -Recurse -ErrorAction SilentlyContinue -Force
        } -ArgumentList $Path
        
        # Wait for the job to complete or timeout
        $completed = Wait-Job -Job $job -Timeout $TimeoutSeconds
        
        if ($completed -eq $null) {
            Write-Host "Search in $Path timed out after $TimeoutSeconds seconds" -ForegroundColor Yellow
            Stop-Job -Job $job
            Remove-Job -Job $job -Force
            return $null
        }
        
        $results = Receive-Job -Job $job
        Remove-Job -Job $job -Force
        
        return $results
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "Error searching in $Path`: $errorMsg" -ForegroundColor Red
        return $null
    }
}

# First, check the standard paths as per original script
if (Test-Path $pathA) {
    Write-Host "File exists at: $pathA" -ForegroundColor Green
    $filePath = $pathA
    $fileFound = $true
} 
# If not in pathA, check pathB
elseif (Test-Path $pathB) {
    Write-Host "File exists at: $pathB" -ForegroundColor Green
    $filePath = $pathB
    $fileFound = $true
} 
else {
    Write-Host "File not found in standard paths. Checking registry..." -ForegroundColor Yellow
    
    # Get potential paths from registry
    $registryPaths = Get-SapRegistryPaths
    
    # Check registry-based paths
    foreach ($regPath in $registryPaths) {
        if ($regPath -and (Test-Path $regPath)) {
            Write-Host "Checking registry path: $regPath" -ForegroundColor Yellow
            
            # Direct file check
            if (Test-Path $regPath -PathType Leaf) {
                $filePath = $regPath
                $fileFound = $true
                Write-Host "File found at registry path: $filePath" -ForegroundColor Green
                break
            }
            
            # Directory search
            $foundInDir = Get-ChildItem -Path $regPath -Filter "saplogon.exe" -ErrorAction SilentlyContinue
            if ($foundInDir) {
                $filePath = $foundInDir[0].FullName
                $fileFound = $true
                Write-Host "File found in registry directory: $filePath" -ForegroundColor Green
                break
            }
            
            # Search deeper but with a reasonable timeout
            $deepSearch = Find-SapLogonInPath -Path $regPath -TimeoutSeconds 15
            if ($deepSearch -and $deepSearch.Count -gt 0) {
                $filePath = $deepSearch[0].FullName
                $fileFound = $true
                Write-Host "File found via deep search in registry path: $filePath" -ForegroundColor Green
                break
            }
        }
    }
    
    # If still not found, check common SAP paths in all drives
    if (-not $fileFound) {
        # Get all drives
        $allDrives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Name -match "^[A-Z]$" }
        
        # Define relative SAP paths to check
        $relativeSapPaths = @(
            "Program Files\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "Program Files\SAP\FrontEnd\SAPgui\saplogon.exe", 
            "Program Files\SAPGUI\saplogon.exe", 
            "Program Files\SAPgui\saplogon.exe", 
            "Program Files (x86)\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "Program Files (x86)\SAP\FrontEnd\SAPgui\saplogon.exe",
            "SAP\FrontEnd\SAPGUI\saplogon.exe",
            "SAP\FrontEnd\SAPgui\saplogon.exe",
            "SAPGUI\saplogon.exe",
            "SAPgui\saplogon.exe"

        )
        
        # Check common locations across all drives
        foreach ($drive in $allDrives) {
            $driveLetter = $drive.Name + ":"
            Write-Host "Checking common SAP paths on drive $driveLetter" -ForegroundColor Yellow
            
            foreach ($relPath in $relativeSapPaths) {
                $fullPath = Join-Path -Path $driveLetter -ChildPath $relPath
                if (Test-Path $fullPath) {
                    $filePath = $fullPath
                    $fileFound = $true
                    Write-Host "File found at: $filePath" -ForegroundColor Green
                    break
                }
            }
            
            if ($fileFound) { break }
            
            # If not found in common locations, check for "SAP" folder on the drive root
            $sapRootFolder = Join-Path -Path $driveLetter -ChildPath "SAP"
            if (Test-Path $sapRootFolder) {
                $sapSearch = Find-SapLogonInPath -Path $sapRootFolder -TimeoutSeconds 20
                if ($sapSearch -and $sapSearch.Count -gt 0) {
                    $filePath = $sapSearch[0].FullName
                    $fileFound = $true
                    Write-Host "File found in SAP folder: $filePath" -ForegroundColor Green
                    break
                }
            }
        }
        
        # Last resort: Full drive search with reasonable timeouts
        if (-not $fileFound) {
            Write-Host "File not found in common locations. Starting targeted drive search..." -ForegroundColor Yellow
            
            foreach ($drive in $allDrives) {
                $driveLetter = $drive.Name + ":"
                Write-Host "Searching drive $driveLetter..." -ForegroundColor Yellow
                
                # Get first-level directories to target search
                $firstLevelDirs = Get-ChildItem -Path $driveLetter -Directory -ErrorAction SilentlyContinue | 
                                 Where-Object { $_.Name -like "*SAP*" -or $_.Name -like "Program Files*" }
                
                if ($firstLevelDirs) {
                    foreach ($dir in $firstLevelDirs) {
                        $sapSearch = Find-SapLogonInPath -Path $dir.FullName -TimeoutSeconds 30
                        if ($sapSearch -and $sapSearch.Count -gt 0) {
                            $filePath = $sapSearch[0].FullName
                            $fileFound = $true
                            Write-Host "File found in: $filePath" -ForegroundColor Green
                            break
                        }
                    }
                    
                    if ($fileFound) { break }
                }
            }
        }
    }
}

# If file doesn't exist in any paths, exit with code 8
if (-not $fileFound) {
    Write-Host "File not found on any drive. Exiting..." -ForegroundColor Red
    exit 8
}

# Get file version information
$fileVersionInfo = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($filePath)

Write-Host "`n[File Information]" -ForegroundColor Cyan
Write-Host "File Name: $($fileVersionInfo.FileName)"
Write-Host "File Description: $($fileVersionInfo.FileDescription)"
Write-Host "File Version: $($fileVersionInfo.FileVersion)"
Write-Host "Product Version: $($fileVersionInfo.ProductVersion)"
Write-Host "Product Name: $($fileVersionInfo.ProductName)"
Write-Host "Company: $($fileVersionInfo.CompanyName)"

# Extract version number for comparison
$versionNumber = $fileVersionInfo.FileVersion
if ($versionNumber -match "(\d+)\.") {
    $majorVersion = $matches[1]
    Write-Host "Major Version: $majorVersion" -ForegroundColor Cyan
} else {
    $majorVersion = "Unknown"
    Write-Host "Major Version: Could not determine" -ForegroundColor Red
}

# Determine architecture (32-bit or 64-bit) by checking PE header
try {
    # Read binary file content
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    
    # Find PE header (PE header position is at offset 60)
    $peHeaderOffset = [BitConverter]::ToInt32($bytes, 60)
    
    # Check PE signature
    $peSignature = [System.Text.Encoding]::ASCII.GetString($bytes, $peHeaderOffset, 4)
    
    if ($peSignature -eq "PE`0`0") {
        # Check machine type (at PE header + 4 bytes)
        $machineType = [BitConverter]::ToUInt16($bytes, $peHeaderOffset + 4)
        
        # Determine architecture
        if ($machineType -eq 0x014c) {
            $architecture = "32bit"
            Write-Host "Architecture: 32-bit (x86)" -ForegroundColor Yellow
        } elseif ($machineType -eq 0x8664) {
            $architecture = "64bit"
            Write-Host "Architecture: 64-bit (x64)" -ForegroundColor Yellow
        } else {
            $architecture = "Unknown"
            Write-Host "Architecture: Unknown (Machine Type: 0x$($machineType.ToString('X4')))" -ForegroundColor Yellow
        }
    } else {
        Write-Host "PE signature not found. This may not be a valid executable file." -ForegroundColor Red
    }
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "Error while checking file architecture`: $errorMsg" -ForegroundColor Red
}

# Determine exit code based on version and architecture
$exitCode = 4  # Default to 4 (other versions)

# Convert $majorVersion to integer for numeric comparison
$majorVersionInt = 0
[int]::TryParse($majorVersion, [ref]$majorVersionInt) | Out-Null

# Handle versions less than 770
if ($majorVersionInt -lt 770) {
    $exitCode = 4  # Other versions (less than 770)
}
# Handle exact version 770
elseif ($majorVersionInt -eq 770 -or $majorVersion -match "^770") {
    if ($architecture -eq "64bit") {
        $exitCode = 2  # Version is 770 and 64bit
    } elseif ($architecture -eq "32bit") {
        $exitCode = 3  # Version is 770 and 32bit
    }
}
# Handle versions 800 and above (including 8000)
else {
    if ($architecture -eq "64bit") {
        $exitCode = 0  # Version 800 or above and 64bit
    } elseif ($architecture -eq "32bit") {
        $exitCode = 1  # Version 800 or above and 32bit
    }
}

Write-Host "`n[Result]" -ForegroundColor Cyan
Write-Host "Version: $majorVersion"
Write-Host "Architecture: $architecture"
Write-Host "Exit code: $exitCode" -ForegroundColor Green
Write-Host "SAPGUI_VER|$($fileVersionInfo.FileVersion)"

# Return the exit code
exit $exitCode