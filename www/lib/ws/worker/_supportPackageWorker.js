const FS    = require("fs");
const ASAR  = require("asar");
const spawn = require("child_process").spawn;
const PATH  = require("path");
const ADMZIP = require("adm-zip");


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


/**
 * @description
 * 패치 업데이트 시, 이벤트 종류
 * 
 * @events
 * update-available-SP      업데이트 항목 존재
 * download-progress-SP     다운로드 중..
 * update-install-SP        다운로드 이후에 asar 압축 및 인스톨할 때
 * update-downloaded-SP     다운로드 완료시
 * update-error-SP          오류 발생시
 */


// 프로세스 Enum
const PRC = {
    DOWN_LOADING   : "download-progress-SP",  // 다운로드 중
    DOWN_FINISH    : "update-downloaded-SP",  // 다운로드 완료
    UPDATE_INSTALL : "update-install-SP",     // 다운로드 이후에 asar 압축 및 인스톨할 때
    UPDATE_ERROR   : "update-error-SP"        // 다운로드 오류
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
        oRES.MSGNR = "M22";

        self.postMessage(oRES);

        return;
    }

    // 프로세스 코드가 없다면 오류!!
    if(!oIF_DATA?.PRCCD){

        oRES.PRCCD = PRC.UPDATE_ERROR;
        oRES.STCOD = "onmessage-E002";
        oRES.RTMSG = "필수 파라미터 누락!!";
        oRES.MSGNR = "M22";
     
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
        oRES.MSGNR = "M22";

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


/************************************************************************
 * @function - PowerShell로 SP 파일 다운로드
 ************************************************************************/
function _getSuppPackDataFromPowerShell(oPARAM) {

    return new Promise(function(resolve){

        // 설치 파일 정보
        let oFileInfo = oPARAM.FILE_INFO;
      
        oFileInfo.TRANSFERRED = 0;

        var oRES = JSON.parse(JSON.stringify(TY_RES)); 

        oRES.PRCCD = PRC.DOWN_LOADING; // // 다운로드 중
        oRES.PARAM = {
            FILE_INFO: oFileInfo
        };

        self.postMessage(oRES);

        // PowerShell 프로세스 생성
        const ps = spawn("powershell.exe", [
            "-ExecutionPolicy", "Bypass",
            "-File", oPARAM.PS_SP_PATH,
            "-BaseUrl", oPARAM.BASE_URL,
            "-sapClient", oPARAM.SAP_CLIENT,
            "-sapUser", oPARAM.SAP_USER,
            "-sapPassword", oPARAM.SAP_PW,
            "-spPath", oPARAM.SP_DOWN_PATH,
            "-ndPath", oPARAM.ND_DOWN_PATH,
            "-JsonInput", JSON.stringify(oPARAM.FILE_INFO)
        ]);

        // 실행 결과 출력
        ps.stdout.on("data", (data) => {

            // 분할 다운로드 수행 횟수에 상관없이 공백이 날라오는 경우가 있음.
            // 테스트 결과 공백일 경우는 리턴해도 수행 해야할 총 횟수에는 영향이 없음.
            if(!data?.toString()?.trim()){                
                return;
            }

            let sLog = `Patch 업데이트 파일 다운로드 중..: ${data.toString()}`;

            // 다운로드 수행 횟수 증가
            oFileInfo.TRANSFERRED++;

            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.PRCCD = PRC.DOWN_LOADING; // // 다운로드 중
            oRES.PARAM = {
                FILE_INFO: oFileInfo,
                LOG: sLog
            };

            self.postMessage(oRES);

            console.log(sLog);
            
        });

        // 에러 메시지 출력
        ps.stderr.on("data", (data) => {

            let sLog = `Patch 업데이트 다운로드 중 에러: ${data.toString()}`;
            
            console.error(sLog);            
            console.trace();

            if (!ps.killed) {              
                ps.kill();
                console.log("kill-1");
            }

            return resolve({ SUBRC: 999, LOG: sLog });

        });

        // 실행 완료 이벤트 처리
        ps.on("close", (code) => {   

            if (!ps.killed) {              
                ps.kill();
                console.log("kill-2");
            }

            return resolve({ SUBRC: code });

        });

    });

} // end of _getSuppPackDataFromPowerShell



/************************************************************************
 * @function - Waiting
 ************************************************************************/
function _fnWaiting (iTime = 1000){

    return new Promise(function(resolve){

        setTimeout(function(){

            resolve();

        }, iTime);

    });

} // end of _fnWaiting

/************************************************************************
 * @function - 압축 해제
 ************************************************************************/
function _zipExtractAsync(sSourcePath, sTargetPath, pOverwrite){

    return new Promise(function(resolve){

        try {
            var zip = new ADMZIP(sSourcePath);

            zip.extractAllToAsync(sTargetPath, pOverwrite, (err) => {

                if (err) {
                    resolve({ RETCD: "E" });
                    return;
                }

                resolve({ RETCD: "S" });

            });

        } catch (error) {
            return resolve({ RETCD: "E" });            
        }

    });

} // end of _zipExtractAsync



/**
 * @since 2025-02-27
 * @description
 * U4A Workspace CDN Update는 추후 다시 결정..
 * 
 * 
 *  
 */
function _updateSuppPackFromCDN(oPARAM){
   






} // end of _getSuppPackDataFromCDN


/**
 * WS Patch Update
 */
self.WS_PATCH_UPDATE = async function (oPARAM) {

// --------------------------------------------
// ☝️step1. asar 소스파일 압축해제 처리
// --------------------------------------------

    // 리소스 경로
    let sResourcePath = oPARAM.RESOURCE_PATH;

    // 기존 asar 파일을 압축을 해제할 임시 폴더 경로
    var LV_APP_PATH = PATH.join(sResourcePath, "app");

    // 기존 asar 파일을 압축 해제할 임시 폴더 생성
    FS.mkdirSync(LV_APP_PATH, { recursive: true });

    // 기존 asar 파일 경로
    var LV_ASAR_PATH = PATH.join(sResourcePath, "app.asar");

    // 기존 asar 파일이 있는지 체크
    if(FS.existsSync(LV_ASAR_PATH) === false){

        oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
        oRES.STCOD = `WS_PATCH_UPDATE-E001`; // app.asar 파일 없음!!
        oRES.MSGNR = "M22";
        oRES.PARAM = {
            LOG: err && err?.toString() || "" // PowerShell 오류 로그
        };

        self.postMessage(oRES);

        return;
    }

    var oRES = JSON.parse(JSON.stringify(TY_RES));

    //압축 해제(소스 원복)
    try {

        await ASAR.extractAll(LV_ASAR_PATH, LV_APP_PATH);

    } catch (err) {        

        oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
        oRES.STCOD = `WS_PATCH_UPDATE-E002`; // asar 파일 압축 풀다가 오류 발생
        oRES.MSGNR = "M22";
        oRES.PARAM = {
            LOG: err && err?.toString() || "" // PowerShell 오류 로그
        };

        self.postMessage(oRES);

        return;
    }

    // 공통 응답 구조
    var oRES = JSON.parse(JSON.stringify(TY_RES));


// --------------------------------------------
// ☝️step3. 업데이트 방식에 따른 분기처리
// --------------------------------------------

    let bIsCdn = oPARAM.ISCDN;
    if(bIsCdn === true){

        // CDN 방식 업데이트
        _updateSuppPackFromCDN(oPARAM);

        return;
    }


// --------------------------------------------
// ☝️step4. Patch 파일을 쉘로 다운 받는다.
// --------------------------------------------

    let oShellResult = await _getSuppPackDataFromPowerShell(oPARAM);
    if(oShellResult.SUBRC !== 0){

        oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
        oRES.STCOD = `WS_PATCH_UPDATE-E003-SUBRC:${oShellResult.SUBRC}`;
        oRES.MSGNR = "M22";
        oRES.PARAM = {
            LOG: oShellResult?.LOG || "" // PowerShell 오류 로그
        };

        self.postMessage(oRES);

        return;

    }

    oRES.PRCCD = PRC.UPDATE_INSTALL; // asar 압축 및 인스톨

    self.postMessage(oRES);


// --------------------------------------------
// ☝️step5. 다운받은 app.zip 파일 압축 해제
// --------------------------------------------

    // 압축 해제 대상 파일
    var sSourcePath = PATH.join(sResourcePath, "app.zip");

    var sTargetPath = sResourcePath;

    let oAppZipExtResult = await _zipExtractAsync(sSourcePath, sTargetPath, true);
    if(oAppZipExtResult.RETCD === "E"){

        oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
        oRES.STCOD = `WS_PATCH_UPDATE-E004`; // 다운받은 app.zip 파일 압축 풀다가 오류 발생
        oRES.MSGNR = "M22";

        self.postMessage(oRES);

        return;

    }

    //app.zip 다운로드처리 전 이전 쓰레기 File 제거
    try { FS.unlinkSync(sSourcePath); } catch (err) { }


// --------------------------------------------
// ☝️step6. node_modules.zip 파일이 존재할 경우 압축 해제
// --------------------------------------------

    // 압축 해제 대상 파일
    var sSourcePath = PATH.join(sResourcePath, "node_modules.zip");

    if(FS.existsSync(sSourcePath) === true){

        let oNDZipExtResult = await _zipExtractAsync(sSourcePath, sTargetPath, true);        
        if(oNDZipExtResult.RETCD === "E"){

            oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
            oRES.STCOD = `WS_PATCH_UPDATE-E005`; // 다운받은 node_modules.zip 파일 압축 풀다가 오류 발생
            oRES.MSGNR = "M22";

            self.postMessage(oRES);

            return;
        }

    }


// --------------------------------------------
// ☝️step7. asar 소스파일 압축 처리 
// --------------------------------------------

    try {

        await ASAR.createPackage(LV_APP_PATH, LV_ASAR_PATH);

    } catch (err) {

        oRES.PRCCD = PRC.UPDATE_ERROR; // 오류
        oRES.STCOD = `WS_PATCH_UPDATE-E006`; // app.asar 만들다가 오류
        oRES.MSGNR = "M22";
        oRES.PARAM = {
            LOG: err && err?.toString() || "" // PowerShell 오류 로그
        };
        
        self.postMessage(oRES);

        // res({ RETCD: "E", RTMSG: GS_MSG.M21 }); //app.asar 소스 압축 하는 과정에서 오류가 발생하였습니다

        return;
    }

    await _fnWaiting(500);

    //압축 해제한 폴더 삭제 처리 
    FS.rmdir(LV_APP_PATH, {
        recursive: true, force: true
    }, (error) => {

    });

    await _fnWaiting(500);


// --------------------------------------------
// ☝️step8. 패치 업데이트 완료!!!
// --------------------------------------------

    oRES.PRCCD = PRC.DOWN_FINISH; // 다운로드 완료

    self.postMessage(oRES);

};