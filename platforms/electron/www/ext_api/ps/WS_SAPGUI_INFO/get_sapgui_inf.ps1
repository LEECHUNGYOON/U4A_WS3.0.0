# Exit code legend:
# 0 - Version starts with 800 and 64bit
# 1 - Version starts with 800 and 32bit
# 2 - Version starts with 770 and 64bit
# 3 - Version starts with 770 and 32bit
# 4 - Other versions
# 8 - File not found in any path

# Define standard target file paths
$pathA = "C:\Program Files\SAP\FrontEnd\SAPGUI\saplogon.exe"
$pathB = "C:\Program Files (x86)\SAP\FrontEnd\SAPgui\saplogon.exe"
$filePath = $null
$architecture = $null
$fileVersion = $null
$fileFound = $false

# Function to check registry for SAP installation path
function Get-SapRegistryInfo {
    # Registry paths to check
    $sapFrontPaths = @(
        "Registry::HKEY_CLASSES_ROOT\SapFront.App\protocol\StdFileEditing",
        "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SapFront.App\protocol\StdFileEditing",
        "Registry::HKEY_CURRENT_USER\SOFTWARE\Classes\SapFront.App\protocol\StdFileEditing"
    )
    
    foreach ($regPath in $sapFrontPaths) {
        Write-Host "Checking registry path: $regPath" -ForegroundColor Yellow
        
        if (Test-Path $regPath) {
            try {
                $regValue = $null
                
                # 1) 첫 번째 케이스: 경로가 StdFileEditing인 경우 server 값을 읽음 (800/64비트)
                $serverValue = (Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue).server
                if ($serverValue) {
                    Write-Host "Found server value at: $regPath" -ForegroundColor Cyan
                    $regValue = $serverValue
                }
                # 2) 두 번째 케이스: server 하위 경로의 default 값을 읽음 (770/32비트)
                else {
                    $serverPath = "$regPath\server"
                    if (Test-Path $serverPath) {
                        # PowerShell에서 default 값은 '(default)'로 접근해야 함
                        $defaultValue = (Get-ItemProperty -Path $serverPath -ErrorAction SilentlyContinue).'(default)'
                        if ($defaultValue) {
                            Write-Host "Found default value at: $serverPath" -ForegroundColor Cyan
                            $regValue = $defaultValue
                        }
                    }
                }
                
                # 레지스트리 값이 있는 경우만 처리
                if ($regValue) {
                    Write-Host "Found registry value: $regValue" -ForegroundColor Cyan
                    
                    # 따옴표 제거 (레지스트리 값에 따옴표가 포함된 경우)
                    $regValue = $regValue -replace '^"(.*)"$', '$1'
                    
                    # Check if the registry value points to an existing file
                    if (Test-Path $regValue -PathType Leaf) {
                        Write-Host "Registry path points to existing file: $regValue" -ForegroundColor Green
                        return @{
                            FilePath = $regValue
                            Found = $true
                        }
                    }
                    # If registry exists but file doesn't, extract drive letter
                    else {
                        # Extract drive letter from registry value
                        if ($regValue -match "^([A-Z]:)") {
                            $driveLetter = $matches[1]
                            Write-Host "Extracted drive letter from registry: $driveLetter" -ForegroundColor Cyan
                            return @{
                                DriveLetter = $driveLetter
                                Found = $false
                            }
                        }
                        elseif ($regValue -match "^([A-Z]):\\") {
                            $driveLetter = $regValue.Substring(0, 2)
                            Write-Host "Extracted drive letter from registry with double backslash: $driveLetter" -ForegroundColor Cyan
                            return @{
                                DriveLetter = $driveLetter
                                Found = $false
                            }
                        }
                    }
                }
            }
            catch {
                Write-Host "Error reading registry path $regPath`: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "Registry path does not exist: $regPath" -ForegroundColor Yellow
        }
    }
    
    # If no registry information found, return null
    return $null
}

# Function to search for saplogon.exe on a specific drive
function Find-SapLogonOnDrive {
    param (
        [string]$DrivePath
    )
    
    Write-Host "Searching for SAPGUI on drive $DrivePath..." -ForegroundColor Yellow
    
    try {
        # Look for saplogon.exe in SAPGUI directory at drive root
        $sapGuiPath = Join-Path -Path $DrivePath -ChildPath "SAPGUI\saplogon.exe"
        if (Test-Path $sapGuiPath -PathType Leaf) {
            Write-Host "Found saplogon.exe at: $sapGuiPath" -ForegroundColor Green
            return $sapGuiPath
        }
        
        # Check other common patterns
        $patterns = @(
            "SAPGUI\saplogon.exe",
            "SAP\SAPGUI\saplogon.exe",
            "Program Files\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "Program Files (x86)\SAP\FrontEnd\SAPGUI\saplogon.exe",
            "SAP\FrontEnd\SAPGUI\saplogon.exe"
        )
        
        foreach ($pattern in $patterns) {
            $fullPath = Join-Path -Path $DrivePath -ChildPath $pattern
            if (Test-Path $fullPath -PathType Leaf) {
                Write-Host "Found saplogon.exe at: $fullPath" -ForegroundColor Green
                return $fullPath
            }
        }
        
        # If not found with direct patterns, do a more targeted search for SAPGUI directory
        $sapGuiDirs = Get-ChildItem -Path $DrivePath -Filter "SAPGUI" -Directory -Recurse -Depth 4 -ErrorAction SilentlyContinue
        foreach ($dir in $sapGuiDirs) {
            $saplogonPath = Join-Path -Path $dir.FullName -ChildPath "saplogon.exe"
            if (Test-Path $saplogonPath -PathType Leaf) {
                Write-Host "Found saplogon.exe at: $saplogonPath" -ForegroundColor Green
                return $saplogonPath
            }
        }
        
        return $null
    }
    catch {
        Write-Host "Error searching drive $DrivePath`: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# First, check the standard paths
if (Test-Path $pathA) {
    Write-Host "File exists at standard path: $pathA" -ForegroundColor Green
    $filePath = $pathA
    $fileFound = $true
} 
elseif (Test-Path $pathB) {
    Write-Host "File exists at standard path: $pathB" -ForegroundColor Green
    $filePath = $pathB
    $fileFound = $true
} 
else {
    Write-Host "File not found in standard paths. Checking registry..." -ForegroundColor Yellow
    
    # Get SAP registry information
    $regInfo = Get-SapRegistryInfo
    
    if ($regInfo) {
        # If file was found directly from registry
        if ($regInfo.Found) {
            $filePath = $regInfo.FilePath
            $fileFound = $true
            Write-Host "File found through registry: $filePath" -ForegroundColor Green
        }
        # If only drive letter was found, search on that drive
        elseif ($regInfo.DriveLetter) {
            $foundPath = Find-SapLogonOnDrive -DrivePath $regInfo.DriveLetter
            if ($foundPath) {
                $filePath = $foundPath
                $fileFound = $true
                Write-Host "File found on drive from registry: $filePath" -ForegroundColor Green
            }
            else {
                Write-Host "SAP GUI not found on drive $($regInfo.DriveLetter) from registry." -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "No SAP GUI registry information found." -ForegroundColor Red
    }
}

# If file doesn't exist in any paths, exit with code 8
if (-not $fileFound) {
    Write-Host "SAP GUI not found in standard paths or on drive from registry." -ForegroundColor Red
    Write-Host "SAP GUI is not installed or installation is corrupt. Exiting with code 8." -ForegroundColor Red
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
    Write-Host "Error while checking file architecture`: $($_.Exception.Message)" -ForegroundColor Red
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