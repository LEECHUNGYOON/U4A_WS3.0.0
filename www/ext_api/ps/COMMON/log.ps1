function Write-DailyLog {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [Parameter(Mandatory = $true)]
        [string]$LogDir,
        [string]$Prefix = "U4A_WS",
        [switch]$ShowPath
    )

    try {
        if (!(Test-Path -Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir | Out-Null
        }

        $date = Get-Date -Format "yyyy_MM_dd"
        $logFile = Join-Path $LogDir "$Prefix`_$date.log"
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $logLine = "[$timestamp] $Message"

        # 🔹 개행 및 탭 문자열 변환
        $logLine = $logLine -replace '\\r\\n', "`r`n"    # CRLF
        $logLine = $logLine -replace '\\r', "`r"         # CR
        $logLine = $logLine -replace '\\n', "`n"         # LF

        # ✅ UTF-8 with BOM 저장
        $utf8BOM = New-Object System.Text.UTF8Encoding($true)
        $sw = New-Object System.IO.StreamWriter($logFile, $true, $utf8BOM)
        $sw.WriteLine($logLine)
        $sw.Close()

        if ($ShowPath) {
            Write-Host "로그 경로: $logFile"
        }
    }
    catch {
        Write-Error "로그 작성 중 오류 발생: $_"
    }
}
