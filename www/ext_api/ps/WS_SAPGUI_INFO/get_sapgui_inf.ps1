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
# If file doesn't exist in both standard paths, check registry
elseif (-not $fileFound) {
    Write-Host "File not found in standard paths. Checking registry..." -ForegroundColor Yellow
    
    # First registry path to check
    try {
        $regPath1 = "Registry::HKEY_CLASSES_ROOT\SapFront.App\protocol\StdFileEditing\server"
        if (Test-Path $regPath1) {
            $regValue = (Get-ItemProperty -Path $regPath1).'(default)'
            if ($regValue) {
                $potentialPath = $regValue -replace "FrontEnd", "FrontEnd\SAPGUI"
                if (-not $potentialPath.EndsWith("saplogon.exe")) {
                    $potentialPath = $potentialPath.TrimEnd('\') + "\saplogon.exe"
                }
                
                if (Test-Path $potentialPath) {
                    $filePath = $potentialPath
                    $fileFound = $true
                    Write-Host "File found via registry path 1: $filePath" -ForegroundColor Green
                }
            }
        }
    } catch {
        Write-Host "Error reading registry path 1: $_" -ForegroundColor Red
    }
    
    # Second registry path to check if first one didn't work
    if (-not $fileFound) {
        try {
            $regPath2 = "Registry::HKEY_CLASSES_ROOT\SapFront.App\protocol\StdFileEditing\server\"
            if (Test-Path $regPath2) {
                $regValue = (Get-ItemProperty -Path $regPath2).'(default)'
                if ($regValue) {
                    $potentialPath = $regValue -replace "saplgpad.exe", "saplogon.exe"
                    
                    if (Test-Path $potentialPath) {
                        $filePath = $potentialPath
                        $fileFound = $true
                        Write-Host "File found via registry path 2: $filePath" -ForegroundColor Green
                    }
                }
            }
        } catch {
            Write-Host "Error reading registry path 2: $_" -ForegroundColor Red
        }
    }
}
# If file doesn't exist in both standard paths, search more extensively
else {
    Write-Host "File not found in standard paths. Searching more extensively..." -ForegroundColor Yellow
    
    # Define additional common SAP GUI paths to check
    $additionalSpecificPaths = @(
        "C:\Program Files\SAP\FrontEnd\SAPgui\saplogon.exe",  # Different capitalization
        "C:\Program Files (x86)\SAP\FrontEnd\SAPGUI\saplogon.exe"  # Different capitalization
    )
    
    # Check additional specific paths
    foreach ($specificPath in $additionalSpecificPaths) {
        if (Test-Path -Path $specificPath) {
            $filePath = $specificPath
            $fileFound = $true
            Write-Host "File found at: $filePath" -ForegroundColor Green
            break
        }
    }
    
    # If still not found, search in Program Files directories
    if (-not $fileFound) {
        # Set priority search paths
        $priorityPaths = @(
            "C:\Program Files",
            "C:\Program Files (x86)"
        )
    
        # Search in priority paths
        foreach ($path in $priorityPaths) {
            if (Test-Path -Path $path) {
                Write-Host "Searching in ${path}..." -ForegroundColor Yellow
                try {
                    # Add SAP subfolder check first if it exists
                    $sapPath = Join-Path -Path $path -ChildPath "SAP"
                    if (Test-Path -Path $sapPath) {
                        $foundFiles = Get-ChildItem -Path $sapPath -Filter "saplogon.exe" -Recurse -ErrorAction SilentlyContinue -Force
                        
                        if ($foundFiles -and $foundFiles.Count -gt 0) {
                            $filePath = $foundFiles[0].FullName
                            $fileFound = $true
                            Write-Host "File found at: $filePath" -ForegroundColor Green
                            break
                        }
                    }
                    
                    # If not found in SAP subfolder, search entire Program Files directory
                    if (-not $fileFound) {
                        $foundFiles = Get-ChildItem -Path $path -Filter "saplogon.exe" -Recurse -ErrorAction SilentlyContinue -Force
                        
                        if ($foundFiles -and $foundFiles.Count -gt 0) {
                            $filePath = $foundFiles[0].FullName
                            $fileFound = $true
                            Write-Host "File found at: $filePath" -ForegroundColor Green
                            break
                        }
                    }
                }
                catch {
                    Write-Host "Error accessing path ${path}: ${_}" -ForegroundColor Red
                }
            }
        }
    }
    
    # If still not found, search all drives
    if (-not $fileFound) {
        # Get all available drives
        $drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Name -match "^[C-Z]$" } | Sort-Object Name
        
        # Search for saplogon.exe in each drive
        foreach ($drive in $drives) {
            # Display current drive being searched
            $driveName = $drive.Name
            Write-Host "Searching drive ${driveName}..." -ForegroundColor Yellow
            
            try {
                # For C drive, exclude Program Files as they were already searched
                if ($driveName -eq "C") {
                    # Search in paths excluding Program Files and Program Files (x86)
                    $excludePaths = @("Program Files", "Program Files (x86)")
                    $cDriveDirs = Get-ChildItem -Path "C:\" -Directory -ErrorAction SilentlyContinue | 
                                  Where-Object { $excludePaths -notcontains $_.Name }
                    
                    foreach ($dir in $cDriveDirs) {
                        $dirPath = $dir.FullName
                        $foundFiles = Get-ChildItem -Path $dirPath -Filter "saplogon.exe" -Recurse -ErrorAction SilentlyContinue -Force
                        
                        if ($foundFiles -and $foundFiles.Count -gt 0) {
                            $filePath = $foundFiles[0].FullName
                            $fileFound = $true
                            Write-Host "File found at: $filePath" -ForegroundColor Green
                            break
                        }
                    }
                    
                    if ($fileFound) { break }
                }
                else {
                    # For non-C drives, search the entire drive
                    $drivePath = "${driveName}:\"
                    $foundFiles = Get-ChildItem -Path $drivePath -Filter "saplogon.exe" -Recurse -ErrorAction SilentlyContinue -Force
                    
                    if ($foundFiles -and $foundFiles.Count -gt 0) {
                        $filePath = $foundFiles[0].FullName
                        $fileFound = $true
                        Write-Host "File found at: $filePath" -ForegroundColor Green
                        break
                    }
                }
            }
            catch {
                Write-Host "Error accessing drive ${driveName}: ${_}" -ForegroundColor Red
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
        
        # Additional characteristics check
        $characteristics = [BitConverter]::ToUInt16($bytes, $peHeaderOffset + 22)
        if (($characteristics -band 0x0100) -eq 0x0100) {
            Write-Host "Characteristic: Uses 32-bit words" -ForegroundColor Yellow
        }
        if (($characteristics -band 0x2000) -eq 0x2000) {
            Write-Host "Characteristic: DLL file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "PE signature not found. This may not be a valid executable file." -ForegroundColor Red
    }
} catch {
    Write-Host "Error while checking file architecture: $_" -ForegroundColor Red
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