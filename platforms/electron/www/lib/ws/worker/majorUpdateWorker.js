const FS = require("fs");
const { endianness } = require("os");
const spawn = require("child_process").spawn;

// 공통 응답 구조
const TY_RES = {
    PRCCD: "",      // 수행중인 프로세스 코드
    RETCD: "",      // 수행 결과에 대한 코드    
    ACTCD: "",      // 수행중인 행위에 대한 코드    
    STCOD: "",      // 수행 결과에 대한 상태 코드
    MSGNR: "",      // 메시지 번호    
    RTMSG: "",      // 수행 결과에 대한 메시지 (화면 출력용 X)
    PARAM: "",      // 수행 결과에 대한 데이터     
};

// 프로세스 Enum
const PRC = {
    DOWN_LOADING: "download-progress-sap",  // 다운로드 중
    DOWN_FINISH : "update-downloaded-sap",  // 다운로드 완료
    UPDATE_ERROR: "update-error-sap",       // 다운로드 오류    
    UPDATE_ERROR_CONSOLE  : "update-error-console" // 다운로드 중 콘솔오류 대상    
};

/**
 * Worker onmessage 
 */
self.onmessage = async function(e){

    // 공통 응답 구조
    var oRES = JSON.parse(JSON.stringify(TY_RES));        

    // 필수 파라미터 누락!!
    var oIF_DATA = e?.data || undefined;

    if(!oIF_DATA){

        oRES.PRCCD = PRC.UPDATE_ERROR;
        oRES.STCOD = "onmessage-E001";    
        oRES.RTMSG = "필수 파라미터 누락!!";
        oRES.MSGNR = "M002"; // U4A Workspace 업데이트 파일을 다운받는 과정에 문제가 발생하였습니다.

        self.postMessage(oRES);

        return;
    }

    // 프로세스 코드가 없다면 오류!!
    if(!oIF_DATA?.PRCCD){

        oRES.PRCCD = PRC.UPDATE_ERROR;
        oRES.STCOD = "onmessage-E002";
        oRES.RTMSG = "필수 파라미터 누락!!";
        oRES.MSGNR = "M002";  // U4A Workspace 업데이트 파일을 다운받는 과정에 문제가 발생하였습니다.
     
        self.postMessage(oRES);

        return;
    }


    try {

        let oPARAM = oIF_DATA.PARAM;

        self[oIF_DATA.PRCCD](oPARAM);
        
    } catch (error) {
        
        oRES.PRCCD = PRC.UPDATE_ERROR;
        oRES.STCOD = "onmessage-E003";
        oRES.RTMSG = "잘못된 PRCCD";
        oRES.MSGNR = "M002";    // U4A Workspace 업데이트 파일을 다운받는 과정에 문제가 발생하였습니다.

        // Error Log
        var sErrLog = error && error?.toString() || "";
            sErrLog += error && error?.stack || "";

        oRES.PARAM = {
            LOG: sErrLog
        }

        self.postMessage(oRES);

        return;

    }    

};


/**
 * Shell로 Major 버전 설치 파일 다운로드
 */
function _majorVersionDownPowerShell(oPARAM){

    return new Promise(function(resolve){

        // 설치 파일 정보
        let oFileInfo = oPARAM.FILE_INFO;

        // 파일 전체 갯수
        let iTotal = oFileInfo.TOT_CHUNK;

        // 다운로드 수행 횟수
        let iCount = 0;

        var oRES = JSON.parse(JSON.stringify(TY_RES)); 

        oRES.PRCCD = PRC.DOWN_LOADING; // 다운로드 중
        oRES.PARAM = {
            TOTAL: iTotal,
            COUNT: iCount
        };

        self.postMessage(oRES);

        // PowerShell 프로세스 생성
        const ps = spawn("powershell.exe", [
            "-ExecutionPolicy", "Bypass",
            "-File", oPARAM.PS_PATH,
            "-BaseUrl", oPARAM.BASE_URL,
            "-sapClient", oPARAM.SAP_CLIENT,
            "-sapUser", oPARAM.SAP_USER,
            "-sapPassword", oPARAM.SAP_PW,
            "-ePath", oPARAM.DOWN_PATH,               
            "-JsonInput", JSON.stringify(oPARAM.FILE_INFO),
            "-logPath", oPARAM.LOG_FLD_PATH
        ]);

        // 실행 결과 출력
        ps.stdout.on("data", (data) => {

            // 분할 다운로드 수행 횟수에 상관없이 공백이 날라오는 경우가 있음.
            // 테스트 결과 공백일 경우는 리턴해도 수행 해야할 총 횟수에는 영향이 없음.
            if(!data?.toString()?.trim()){                
                return;
            }

            let sData = data?.toString();

            /**
             * @since   2025-11-05
             * @version vNAN-NAN
             * @author  soccerhs
             * 
             * @description
             *  [기존] 
             *      - powershell에서 패치 파일 다운로드 진행 중,
             *        Write-Host 출력(stdout)을 다운로드 성공 신호로 인식하여 퍼센트 계산함
             *  [변경]
             *      - stdout 로그 중 단순 로그 용으로 Write-Host를 사용하는 경우가 있어서,
             *        특정 키워드(CHUNK_DOWN_OK) 포함 시에만 다운로드 성공으로 간주하도록 수정함
             */
            if(sData.includes("CHUNK_DOWN_OK") === true){

                // 다운로드 수행 횟수 증가
                iCount++;
            
            }

            let sLog = `Major 업데이트 파일 다운로드 중..: ${data.toString()}`;
            
            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.PRCCD = PRC.DOWN_LOADING; // // 다운로드 중
            oRES.PARAM = {
                TOTAL: iTotal,
                COUNT: iCount,
                LOG  : sLog
            };

            self.postMessage(oRES);

        });

        // 에러 메시지 출력
        ps.stderr.on("data", (data) => {
      
            let sLog = `Major 업데이트 다운로드 중 에러: ${data.toString()}`;            
            
            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.PRCCD = PRC.UPDATE_ERROR_CONSOLE; // 다운로드 중 콘솔오류 대상
            oRES.PARAM = {
                LOG: sLog
            };

            self.postMessage(oRES);            

        });

        // 실행 완료 이벤트 처리
        ps.on("close", (code) => {

            if (!ps.killed) {              
                ps.kill();
            }

            return resolve({ SUBRC: code });

        });

    });

}; // end of _majorVersionDownPowerShell

/**
 * WS Major update
 */
self.WS_MAJOR_UPDATE = async function(oPARAM){

    // 이전에 업데이트 파일이 존재 할 경우 삭제
    let sDownPath = oPARAM.DOWN_PATH;
    if(FS.existsSync(sDownPath) === true){

        try {
            
            FS.unlinkSync(sDownPath);

        } catch (error) {
            
        }

    }

    // 공통 응답 구조
    var oRES = JSON.parse(JSON.stringify(TY_RES));

    // Shell로 Major 버전 설치 파일을 다운로드한다.
    let oShellResult = await _majorVersionDownPowerShell(oPARAM);
    if(oShellResult.SUBRC !== 0){

        oRES.PRCCD = PRC.UPDATE_ERROR; // 다운로드 오류
        oRES.STCOD = `WS_MAJOR_UPDATE-E001-SUBRC:${oShellResult.SUBRC}`;
        oRES.MSGNR = "M002";  // U4A Workspace 업데이트 파일을 다운받는 과정에 문제가 발생하였습니다.
        oRES.PARAM = {
            LOG: oShellResult?.LOG || "" // PowerShell 오류 로그
        };

        self.postMessage(oRES);

        return;
    }

    oRES.PRCCD = PRC.DOWN_FINISH; // 다운로드 완료

    self.postMessage(oRES);

};