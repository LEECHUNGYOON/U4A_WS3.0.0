## Target Host Connection Check Script
# HowTo : host_conn_chk.ps1 -BaseUrl '[Server Host Url]:[Service Port]' -Timeout [**기본값 10]

param (
    [Parameter(Mandatory=$true)]
    [string]$BaseUrl,

    # Optional Request Parameters
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 10
)

# Exit codes
$SUCCESS = 0
$ERROR_CONNECTION = 1
$ERROR_GENERAL = 8

# Function to test URL connectivity
function Test-UrlConnectivity {
    param(
        [string]$Url,
        [int]$Timeout = 30
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
    
    # Test connectivity to the base URL
    $isConnected = Test-UrlConnectivity -Url $BaseUrl -Timeout $Timeout
    
    if (-not $isConnected) {
        Write-Error "Cannot connect to server at ${BaseUrl}. Please check your network connection and server status."
        exit $ERROR_CONNECTION
    }
        
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit $ERROR_GENERAL
}