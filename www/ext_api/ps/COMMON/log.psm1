# UTF-8 환경 강제 설정
chcp 65001 | Out-Null
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Write-DailyLog {
    param (
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Message,

        [Parameter(Mandatory = $true)]
        [string]$LogDir,

        [string]$Prefix = "U4A_WS",

        # 로그 중요도 (I=Info, W=Warn, E=Error)
        [string]$Type = 'I',

        [switch]$ShowPath
    )

    try {
        # 로그 폴더 없으면 생성
        if (!(Test-Path -Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir | Out-Null
        }

        # 날짜 및 파일명 구성
        $date = Get-Date -Format "yyyy_MM_dd"
        $logFile = Join-Path $LogDir "$Prefix`_$date.log"

        # 타임스탬프
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        # 🔹 허용되지 않은 Type일 경우 기본값 [INFO]로 대체
        switch ($Type.ToUpper()) {
            'I' { $typePrefix = '[info]'  }
            'W' { $typePrefix = '[warn]'  }
            'E' { $typePrefix = '[error]' }
            default { $typePrefix = '[info]' }
        }

        # 🔹 로그 메시지 조합
        $logLine = "[$timestamp] $typePrefix $Message"

        # 🔹 개행 및 탭 문자열 변환
        $logLine = $logLine -replace '\\r\\n', "`r`n"    # CRLF
        $logLine = $logLine -replace '\\r', "`r"         # CR
        $logLine = $logLine -replace '\\n', "`n"         # LF
        $logLine = $logLine -replace '\\t', "`t"         # Tab

        # ✅ UTF-8 with BOM으로 저장
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
