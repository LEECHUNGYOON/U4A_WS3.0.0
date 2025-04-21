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
                    # Note: This registry value might be incorrect due to SAP GUI installation bug 
                    # when custom installation path is used
                    Write-Host "Registry value found: $regValue (Note: This may be incorrect due to a known SAP GUI bug)" -ForegroundColor Yellow
                    
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

# Function to search for saplogon.exe with pattern matching
function Find-SapLogonPattern {
    param (
        [string]$DrivePath
    )
    
    Write-Host "Searching for SAPGUI pattern on $DrivePath..." -ForegroundColor Yellow
    
    try {
        # Look for SAPGUI\saplogon.exe directly in the drive root or one level down
        # First check if path exists at drive root
        $sapGuiRootPath = Join-Path -Path $DrivePath -ChildPath "SAPGUI\saplogon.exe"
        if (Test-Path $sapGuiRootPath) {
            Write-Host "Found saplogon.exe at drive root: $sapGuiRootPath" -ForegroundColor Green
            return $sapGuiRootPath
        }
        
        # Check for SAP\SAPGUI pattern
        $sapGuiSubPath = Join-Path -Path $DrivePath -ChildPath "SAP\SAPGUI\saplogon.exe"
        if (Test-Path $sapGuiSubPath) {
            Write-Host "Found saplogon.exe at SAP\SAPGUI path: $sapGuiSubPath" -ForegroundColor Green
            return $sapGuiSubPath
        }
        
        # Get all first level directories with specific patterns
        $sapDirs = Get-ChildItem -Path $DrivePath -Directory -ErrorAction SilentlyContinue | 
                   Where-Object { $_.Name -like "*SAP*" -or $_.Name -like "Program Files*" }
        
        foreach ($dir in $sapDirs) {
            # Check for SAPGUI under first level directories
            $sapGuiPath = Join-Path -Path $dir.FullName -ChildPath "SAPGUI\saplogon.exe"
            if (Test-Path $sapGuiPath) {
                Write-Host "Found saplogon.exe in directory: $sapGuiPath" -ForegroundColor Green
                return $sapGuiPath
            }
            
            # Check for FrontEnd\SAPGUI pattern
            $frontEndPath = Join-Path -Path $dir.FullName -ChildPath "FrontEnd\SAPGUI\saplogon.exe"
            if (Test-Path $frontEndPath) {
                Write-Host "Found saplogon.exe in FrontEnd directory: $frontEndPath" -ForegroundColor Green
                return $frontEndPath
            }
            
            # Also check one more level for FrontEnd\SAPGUI if "SAP" is in the name
            if ($dir.Name -like "*SAP*") {
                $subDirs = Get-ChildItem -Path $dir.FullName -Directory -ErrorAction SilentlyContinue
                foreach ($subDir in $subDirs) {
                    $subSapGuiPath = Join-Path -Path $subDir.FullName -ChildPath "SAPGUI\saplogon.exe"
                    if (Test-Path $subSapGuiPath) {
                        Write-Host "Found saplogon.exe in subdirectory: $subSapGuiPath" -ForegroundColor Green
                        return $subSapGuiPath
                    }
                }
            }
        }
        
        # If still not found, use a more targeted approach to find saplogon.exe with "SAPGUI" in the path
        # but limit depth to improve performance
        $saplogonFiles = Get-ChildItem -Path $DrivePath -Filter "saplogon.exe" -Recurse -Depth 3 -ErrorAction SilentlyContinue | 
                         Where-Object { $_.FullName -like "*SAPGUI*" } | 
                         Select-Object -First 1
                         
        if ($saplogonFiles) {
            Write-Host "Found saplogon.exe through recursive search: $($saplogonFiles.FullName)" -ForegroundColor Green
            return $saplogonFiles.FullName
        }
        
        return $null
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "Error searching in $DrivePath`: $errorMsg" -ForegroundColor Red
        return $null
    }
}

# First, check the standard paths
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
        }
    }
    
    # If still not found, check all drives with direct paths and pattern search
    if (-not $fileFound) {
        # Get all drives - ensure we're using absolute paths
        $allDrives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Name -match "^[A-Z]$" }
        
        # Define path patterns to check
        $sappaths = @(
            "\Program Files\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "\Program Files\SAPGUI\saplogon.exe",
            "\Program Files (x86)\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "\SAPGUI\saplogon.exe",
            "\SAP\SAPGUI\saplogon.exe"
        )
        
        # Check each drive with absolute paths
        foreach ($drive in $allDrives) {
            $driveLetter = $drive.Name + ":"
            Write-Host "Checking drive $driveLetter..." -ForegroundColor Yellow
            
            # Try direct paths first (faster)
            foreach ($path in $sappaths) {
                $fullPath = $driveLetter + $path
                if (Test-Path $fullPath -PathType Leaf) {
                    $filePath = $fullPath
                    $fileFound = $true
                    Write-Host "File found at: $filePath" -ForegroundColor Green
                    break
                }
            }
            
            if ($fileFound) { break }
            
            # If direct paths didn't work, use pattern search
            $patternResult = Find-SapLogonPattern -DrivePath $driveLetter
            if ($patternResult) {
                $filePath = $patternResult
                $fileFound = $true
                break
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
Write-Host "SAPGUI_PATH|$filePath"

# Return the exit code
exit $exitCode