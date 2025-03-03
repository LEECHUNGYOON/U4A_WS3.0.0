// I/F 필드 정의 
/* ***************************************************************** */
/*
*/
/* ***************************************************************** */
/* ***************************************************************** */

/* 
    설치 nodejs 
    npm gh-release-assets 
    npm adm-zip
    npm arraybuffer-to-buffer

*/

/* 사용 예시 

  var spAutoUpdater = require(oAPP.path.join(__dirname, 'SupportPackageChecker/index.js'));
    
      spAutoUpdater.on("checking-for-update-SP", (e)=>{ console.log("업데이트 확인중"); debugger; });
   
      spAutoUpdater.on("update-available-SP", (e)=>{ console.log("업데이트 항목이 존재합니다"); debugger; });
   
      spAutoUpdater.on("update-not-available-SP", (e)=>{ console.log("현재 최신버전입니다."); debugger; });
   
      spAutoUpdater.on("download-progress-SP", (e)=>{

                   CDN 인 경우                    
                   팝업인데 ......

                  CDN 아닌경우 
                  e.detail.file_info.TOTAL  <-- 모수 
                  e.detail.file_info.TRANSFERRED <-- 현재 진행중 갯수 
 
                   console.log("다운로드중");  
      });
      
      spAutoUpdater.on("update-downloaded-SP", (e)=>{  

        //app 재실행 
        //debugger; 
      });
   
      spAutoUpdater.on("update-error-SP", (e)=>{ console.log("오류 " + e.detail.message);  debugger; });
      
      파라메터 설명 
      1. electron remote
      2. CDN  = true; SAP  = false;
      3. WS.30 현재 버젼 
      4. WS.30 현재 패치 번호
    
      spAutoUpdater.checkForUpdates(oAPP.remote, false, "v3.3.6", "00003");

*/


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

/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */

const
    HOST = parent.getServerHost(),
    PATH = parent.PATH,
    REMOTE = parent.REMOTE,
    APP = REMOTE.app,
    FS = parent.FS,
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"); 

// let REMOTE = undefined;
// let FS = undefined;
// let PATH = undefined;
let ISCDN = false;
let VERSN = ""; //현재 빌드된 WS3.0 버젼 
let SPLEV = 0;  //현재 WS3.0 패치 번호
let ADMIN = {};
let Octokit = undefined;
let ADMZIP = undefined;
let SPAWN = undefined;
// let APPPATH = undefined;
// let USERDATA = undefined;
let oAPP = undefined;

/**
 * 메시지에 대한 정보는 _getGlobalMsg 메소드 참조
 */
var GS_MSG = {
    // M01: "처리 통신 오류",
    // M02: "다운로드 처리 과정에서 해더 정보 누락되었습니다",
    // M03: "(패치) 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.",
    // M04: "(패치) 분할 다운로드 처리 과정에서 오류 발생",
    // M05: "처리 완료",
    // M06: "버젼 파일 생성중 오류 발생",    
    // M07: "패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다",    
    // M08: "WS 빌드버전과 업데이트 패치에 등록되있는 WS 빌드버전이 상이 합니다  \n 관리자에게 문의하세요",
    // M07: "패치 정보 조회 시, 서버 통신이 실패하였습니다.",
    // M08: "U4A Workspace의 버전 정보와, 서버에서 조회한 버전이 상이합니다.",
    // M09: "다운로드중",
    // M10: "패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요",
    // M11: "(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!",
    // M12: "(패치) GIT 다운로드 파일이 존재하지않습니다",
    // M13: "GIT (app.zip) 패치 파일 추출하는동안 오류 발생 \n 관리자에게 문의!!",
    // M14: "GIT (node_modules.zip) 패치 파일 추출하는동안 오류 발생 \n 관리자에게 문의!!",
    // M15: "(패치) 업데이트 확인중",
    // M16: "(패치) 현재 최신버전입니다.",
    // M17: "(패치) 업데이트 항목이 존재합니다",
    // M18: "(패치) 업데이트가 완료되었습니다.",
    // M19: "(패치) 업데이트 설치중",
    // M20: "app.asar 소스 압축해제 하는 과정에서 오류가 발생하였습니다",
    // M21: "app.asar 소스 압축 하는 과정에서 오류가 발생하였습니다",
    // M22: "패치 업데이트 진행 과정에 문제가 발생하였습니다"
};

// IF 구조
const TY_IFDATA = {
    PRCCD: "",      // 수행중인 프로세스 코드    
    ACTCD: "",      // 수행중인 행위에 대한 코드     
    PARAM: "",      // 수행 결과에 대한 데이터
};


/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

//[펑션] 랜덤키 생성
function fn_random(length = 15) {

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';

    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

}

//[펑션] 기다려 
async function gf_waiting(t = 0) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, t);
    });
}

function HexToStr(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

//[펑션] 초기값 설정
function gf_initData(oLoginInfo) {

    let oSettings = getSettingsInfo(),
        oGitInfo = oSettings.GITHUB,
        // sGitAuth = atob(oGitInfo.devKey),
        sGitAuth = HexToStr(oGitInfo.devKey),
        sPatch_repo_url = oGitInfo.PATCH_REPO_URL,
        sServerHost = getHost();

    Octokit = REMOTE.require("@octokit/core").Octokit;

    ADMIN.PATCH_SEP = "💛";

    //sap config
    ADMIN.SAP = {};
    ADMIN.SAP.HOST = sServerHost;
    ADMIN.SAP.URL = ADMIN.SAP.HOST + "/zu4a_wbc/u4a_ipcmain/WS_SUPPORT_PATCH";

    ADMIN.SAP.CLIENT = oLoginInfo.CLIENT;
    ADMIN.SAP.ID = oLoginInfo.ID;
    ADMIN.SAP.PW = oLoginInfo.PW;

    ADMIN.GIT = {};

    if (REMOTE.app.isPackaged) {
        ADMIN.GIT.AUTH = sGitAuth;
        ADMIN.GIT.BASE_PATH = sPatch_repo_url;
    }

    ADMIN.GIT.AUTH = sGitAuth;
    ADMIN.GIT.BASE_PATH = sPatch_repo_url;

}


//[펑션] (SAP) 패치 존재여부 점검 
async function gf_chkPatch_SAP() {
    return new Promise((resolve, rej) => {

        //패치 확인
        let oformData = new FormData();

        if (!REMOTE.app.isPackaged) {
            oformData.append('sap-user', ADMIN.SAP.ID);
            oformData.append('sap-password', ADMIN.SAP.PW);
        }

        oformData.append('PRCCD', '01');

        var xhttp = new XMLHttpRequest();
        xhttp.onload = (e) => {

            if (e.target.status != 200 || e.target.response === "") {
                resolve({ RETCD: "E", RTMSG: GS_MSG.M07 }); //패치 정보 조회 시, 서버 통신이 실패하였습니다.
                return;
            }

            try {
                var LS_DATA = JSON.parse(e.target.response);
            } catch (err) {
                resolve({ RETCD: "E", RTMSG: GS_MSG.M07 }); //패치 정보 조회 시, 서버 통신이 실패하였습니다.
                return;

            }

            if (LS_DATA.RETCD === "E") {
                resolve({ RETCD: "E", RTMSG: LS_DATA.RTMSG });
                return;
            }

            //WS3.0 버젼
            //현재 WS3.0 빌드 버젼과 업데이트 패치에 등록된 WS3.0 버젼이 다르다면 치명적 오류 !!!
            if (LS_DATA.VERSN != VERSN) {
                resolve({ RETCD: "E", RTMSG: GS_MSG.M08 }); //WS 빌드버전 과 업데이트 패치에 등록되있는 WS 빌드버전이 상이 합니다  \n 관리자에게 문의하세요               
                return;

            }

            if (Number(LS_DATA.SPLEV) > SPLEV) {
                resolve({ RETCD: "S", ISPATCH: true, RTMSG: "패치 존재", S_INFO: LS_DATA });
                return;

            }

            resolve({ RETCD: "S", ISPATCH: false, RTMSG: "패치 미존재" });

        };

        xhttp.onerror = (e) => {
            resolve({ RETCD: "E", RTMSG: GS_MSG.M07 }); // 패치 정보 조회 시, 서버 통신이 실패하였습니다.

        };

        xhttp.open("POST", ADMIN.SAP.URL, true);
        xhttp.send(oformData);


    });
}

//[펑션] (GIT) 패치 존재여부 점검 
async function gf_chkPatch_GIT() {
    return new Promise(async (res, rej) => {

        const octokit = new Octokit({ auth: ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.GIT.BASE_PATH + '/releases/latest', {});

        } catch (err) {
            res({ RETCD: "E", RTMSG: GS_MSG.M11 }); //(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!
            return;

        }

        if (ROOT.data.assets.length == 0) {
            resolve({ RETCD: "W", RTMSG: "GIT 이전 패치정보 없슴!!" });
            return;
        }

        //패치번호 추출 => WS3.0 버젼 + 💛 + 00001 구성된상태
        var LT_PATCH = ROOT.data.tag_name.split(ADMIN.PATCH_SEP);

        //현재 WS3.0 빌드 버젼과 업데이트 패치에 등록된 WS3.0 버젼이 다르다면 치명적 오류 !!!
        if (LT_PATCH[0] !== VERSN) {
            res({ RETCD: "E", RTMSG: GS_MSG.M08 }); //U4A Workspace의 버전 정보와, 서버에서 조회한 버전이 상이합니다.
            return;
        }


        //패치 여부 점검 
        if (Number(LT_PATCH[1]) > SPLEV) {
            res({ RETCD: "S", ISPATCH: true, RTMSG: "패치 존재" });
            return;

        }

        res({ RETCD: "S", ISPATCH: false, RTMSG: "패치 미존재" });


    });
}


//[펑션] (GIT) 패치 다운로드
async function gf_download_GIT() {
    return new Promise(async (res, rej) => {

        const octokit = new Octokit({ auth: ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.GIT.BASE_PATH + '/releases/latest', {});

        } catch (err) {
            res({ RETCD: "E", RTMSG: GS_MSG.M11 }); //(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!
            return;

        }


        //이벤트 트리거 - 다운로드중..
        document.dispatchEvent(new CustomEvent('download-progress-SP', { detail: { message: GS_MSG.M09, file_info: ROOT.data.assets } }));


        /* ========================================================================= */
        //1. app.zip 파일 =========================================================== */
        /* ========================================================================= */
        var LT_FILTER = ROOT.data.assets.filter(e => e.name === "app.zip");

        //app.zip 다운로드 파일 누락이라면..
        if (LT_FILTER.length == 0) {
            res({ RETCD: "E", RTMSG: GS_MSG.M12 }); //(패치) GIT 다운로드 파일이 존재하지않습니다
            return;
        }


        //app.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0];
        try {
            var LS_FILE_INFO = await octokit.request('GET ' + LS_INFO.browser_download_url, {});
        } catch (err) {
            res({ RETCD: "E", RTMSG: GS_MSG.M13 }); //GIT (app.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!
            return;

        }

        //app.zip 다운로드 경로 설정
        var LV_DOWN_PATH = PATH.join(process.resourcesPath, LS_INFO.name);

        //app.zip 다운로드처리 전 이전 쓰레기 File 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) { }

        //app.zip 다운로드
        FS.writeFileSync(LV_DOWN_PATH, Buffer.from(LS_FILE_INFO.data), 'binary');

        //테스트 모드 일 경우는 다운로드 위치 폴더 OPEN
        if (!REMOTE.app.isPackaged) {
            REMOTE.shell.showItemInFolder(LV_DOWN_PATH);
        }

        //APP.ZIP 파일 압축 해제
        // try {
        //     var zip = new ADMZIP(LV_DOWN_PATH);
        // } catch (err) {
        //     res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
        //     return;
        // }

        // try {
        //     zip.extractAllTo(process.resourcesPath, true);
        // } catch (err) {
        //     res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
        //     return;
        // }

        // APP.ZIP 파일 압축 해제
        var oExtractResult = await onZipExtractAsync("SP", LV_DOWN_PATH, process.resourcesPath, true);
        if (oExtractResult.RETCD == "E") {
            res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }

        //app.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) { }

        /* ========================================================================= */
        //2. node_modules.zip 파일 ================================================= */
        /* ========================================================================= */
        var LT_FILTER = ROOT.data.assets.filter(e => e.name === "node_modules.zip");

        //node_modules.zip 다운로드 파일 누락이라면..
        if (LT_FILTER.length == 0) {
            res({ RETCD: "W", RTMSG: "node_modules 미존재" });
            return;
        }

        //node_modules.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0];
        try {
            var LS_FILE_INFO = await octokit.request('GET ' + LS_INFO.browser_download_url, {});
        } catch (err) {
            res({ RETCD: "E", RTMSG: GS_MSG.M14 }); //GIT (node_modules.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!
            return;

        }

        //node_modules.zip 다운로드 경로 설정
        var LV_DOWN_PATH = PATH.join(process.resourcesPath, LS_INFO.name);

        //node_modules.zip 다운로드처리 전 이전 쓰레기 File 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) { }

        //node_modules.zip 다운로드
        FS.writeFileSync(LV_DOWN_PATH, Buffer.from(LS_FILE_INFO.data), 'binary');


        //node_modules.zip 파일 압축 해제
        // try {
        //     var zip = new ADMZIP(LV_DOWN_PATH);
        // } catch (err) {
        //     res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
        //     return;
        // }

        // try {
        //     zip.extractAllTo(process.resourcesPath, true);
        // } catch (err) {
        //     res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
        //     return;
        // }

        var oExtractResult = await onZipExtractAsync("SP", LV_DOWN_PATH, process.resourcesPath, true);
        if (oExtractResult.RETCD == "E") {
            res({ RETCD: "E", RTMSG: GS_MSG.M10 }); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }

        //node_modules.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) { }


        res({ RETCD: "S", RTMSG: "" });

    });
}

// 비동기 압축 풀기
async function onZipExtractAsync(PRCCD, sSourcePath, sTargetPath, pOverwrite = true) {

    return new Promise((resolve) => {

        try {
            var zip = new ADMZIP(sSourcePath);

        } catch (error) {

            switch (PRCCD) {

                case "ND":
                    resolve({ RETCD: "W" });
                    break;

                default:
                    resolve({ RETCD: "E" });
                    return;
            }

        }

        try {

            zip.extractAllToAsync(sTargetPath, pOverwrite, (err) => {

                if (err) {
                    resolve({ RETCD: "E" });
                    return;
                }

                resolve({ RETCD: "S" });

            });
        }

        catch (err) {
            resolve({ RETCD: "E" });
        }

    });

}



/* ================================================================= */
/* Export Module Function 
/* ================================================================= */

//이벤트 설정 
exports.on = function (evtnm, CB) {
    document.addEventListener(evtnm, CB);

};

/**
 * 패치 업데이트 파일을 워커로 다운
 */
function _getPatchUpdateFileWorker(oPARAM){

    let _sWorkerPath = PATH.join(APPPATH, "lib", "ws", "worker", "supportPackageWorker.js");

    let oWorker = new Worker(_sWorkerPath);

    oWorker.onmessage = function(e){
        
        var oIF_DATA = e?.data || undefined;
        if(!oIF_DATA){

            // 실행 중인 워커를 종료시킨다.
            try {
                oWorker.terminate();
                console.log("worker terminate - [WORKER-001]");
            } catch (error) {
                
            }

            var aConsoleMsg = [              
              `[PATH]: www/lib/ws/SupportPackageChecker/index.js`,  
              `=> _getPatchUpdateFileWorker`,
              `=> oWorker.onmessage`,                    
              `=> oIF_DATA undefined`,
              `[WORKER-001]`                   
            ];
            console.error(aConsoleMsg.join("\r\n"));
            console.trace();

            // 패치 업데이트 진행 과정에 문제가 발생하였습니다
            // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
            let sErrMsg = GS_MSG.M22 + "\n\n";
                sErrMsg += GS_MSG.M290;
         
            // 응답 오류!!
            document.dispatchEvent(new CustomEvent('update-error-SP', { 
                detail: { message: `[WORKER-001] ${sErrMsg}` } 
            }));

            return;
        }
        
        switch (oIF_DATA.PRCCD) {       
            
            case "download-progress-SP": //다운로드중 ..
         
                // 로그 정보가 있을 경우에는 콘솔 오류에 로그 정보를 담는다
                var sLog = "";
                var _oPARAM = oIF_DATA?.PARAM || undefined;
                if(_oPARAM?.LOG){
                    sLog = _oPARAM.LOG;
                }

                console.log(sLog);

                document.dispatchEvent(new CustomEvent('download-progress-SP', { 
                    detail: { message: GS_MSG.M09, file_info: _oPARAM.FILE_INFO } 
                }));

                return;

            case "update-install-SP" : // 다운로드 이후에 asar 압축 및 인스톨할 때

                document.dispatchEvent(new CustomEvent('update-install-SP', { 
                    detail: { message: GS_MSG.M19 }
                }));

                return;

            case "update-downloaded-SP": // 다운로드 완료 

                try {
                    oWorker.terminate();
                    console.log("worker terminate - [update-downloaded-SP]");
                } catch (error) {
                    
                }

                //다운로드중 완료 ..event 핸들러 call
                document.dispatchEvent(new CustomEvent('update-downloaded-SP', { 
                    detail: { message: '업데이트가 완료되었습니다.' } 
                }));

                return;

            case "update-error-SP": //오류

                // 실행 중인 워커를 종료시킨다.
                try {
                    oWorker.terminate();
                    console.log("worker terminate - [update-error-SP]");
                } catch (error) {
                    
                }   
                
                // 로그 정보가 있을 경우에는 콘솔 오류에 로그 정보를 담는다
                var sLog = "";
                var _oPARAM = oIF_DATA?.PARAM || undefined;
                if(_oPARAM?.LOG){
                    sLog = _oPARAM.LOG;
                }    

                // 콘솔용 오류 메시지
                var aConsoleMsg = [
                    `[PATH]: www/lib/ws/SupportPackageChecker/index.js`,  
                    `=> _getPatchUpdateFileWorker`,
                    `=> oWorker.onmessage`,
                    `=> update-error-SP`,
                    `[WORKER-${oIF_DATA.STCOD}]`,
                    `[Log]: ${sLog}`
                ];           

                console.error(aConsoleMsg.join("\r\n"), oIF_DATA);
                console.trace();

                // [Default Error Msg] 
                // 패치 업데이트 진행 과정에 문제가 발생하였습니다.
                // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                var sDefErrMsg = GS_MSG.M22 + "\n\n";
                    sDefErrMsg += GS_MSG.M290;

                var sErrMsg = GS_MSG[oIF_DATA.MSGNR];

                // MSGNR에 해당하는 메시지가 있을 경우 추가 메시지 내용을 덧붙인다.
                if(sErrMsg){
                    sErrMsg += "\n\n" + GS_MSG.M290; // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                }

                sErrMsg = sErrMsg || sDefErrMsg;
                      
                document.dispatchEvent(new CustomEvent('update-error-SP', { 
                    detail: { message: `[WORKER-${oIF_DATA.STCOD}] ${sErrMsg}` } 
                }));

                return;            
        
            default:                

                return;
        }

    };

    // 설치할 WS 패치 버전 정보
    let oFileInfo  = oPARAM.FILE_INFO;

    // 로그인 정보
    let oLoginInfo = oPARAM.LOGIN_INFO;     

    // WS Setting Json 정보
    let oSettings = parent.getSettingsInfo();

    // WS Setting Json 정보에서 powerShell 관련 정보
    let oPsInfo   = oSettings.ps;

    // WS Setting Json 정보에서 powerShell 파일 루트 경로
    let sPsRootPath = oPsInfo.rootPath;

    // WS Setting Json 정보에서 powerShell 실행 파일 경로
    let sWsSpPsPath = oPsInfo.ws_sp;
    
    // Package 여부에 따른 PowerShell 파일 경로
    let sPsPath = PATH.join(process.resourcesPath, "www",  sPsRootPath /* ext_api/ps */, sWsSpPsPath /* WS_PATCH/ws_sp_patch.ps1 */);

    if(!APP.isPackaged){
        sPsPath = PATH.join(APPPATH, sPsRootPath /* ext_api/ps */, sWsSpPsPath /* WS_PATCH/ws_sp_patch.ps1 */);   
    }

    // powerShell 실행 파일이 없을 경우 오류!!
    if(FS.existsSync(sPsPath) === false){

        // 실행 중인 워커를 종료시킨다.
        try {
            oWorker.terminate();
            console.log("worker terminate - [WORKER-002]");
        } catch (error) {
            
        }

        document.dispatchEvent(new CustomEvent('update-error-SP', { 
            detail: { message: `[WORKER-002] ${GS_MSG.M22}` } 
        }));

        return;
    }

    // 일렉트론 리소스 경로
    let sResourcePath = process.resourcesPath;
    
    if(!APP.isPackaged){
        sResourcePath = USERDATA;
    }

    // 패치 파일 다운 경로
    let sSpDownPath = PATH.join(sResourcePath, "app.zip");

    // node_modules 파일 다운 경로
    let sNdDownPath = PATH.join(sResourcePath, "node_modules.zip");

    // 파워쉘 실행 파라미터
    let _oPARAM = {
        PS_SP_PATH    : sPsPath,
        BASE_URL      : parent.getServerHost(),
        SAP_CLIENT    : oLoginInfo.CLIENT,
        SAP_USER      : oLoginInfo.ID,
        SAP_PW        : oLoginInfo.PW,
        SP_DOWN_PATH  : sSpDownPath,
        ND_DOWN_PATH  : sNdDownPath,
        FILE_INFO     : oFileInfo,
        RESOURCE_PATH : sResourcePath,
        ISCDN         : ISCDN               // CDN 여부
    };

    // 공통 IF 구조
    let oIF_DATA = JSON.parse(JSON.stringify(TY_IFDATA));

    oIF_DATA.PRCCD = "WS_PATCH_UPDATE";
    oIF_DATA.PARAM = _oPARAM;

    oWorker.postMessage(oIF_DATA);

} // end of _getPatchUpdateFileWorker


/**
 * 글로벌 언어 정보 가져오기
 */
function _getGlobalMsg(){

    // WS Setting Json 정보
    let oSettingInfo = parent.getSettingsInfo();

    let sWsLangu = oSettingInfo.globalLanguage;

    const WSUTIL = parent.WSUTIL;

    GS_MSG.M07 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "299"); // 패치 정보 조회 시, 서버 통신이 실패하였습니다.
    GS_MSG.M08 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "300"); // U4A Workspace의 버전 정보와, 서버에서 조회한 버전이 상이합니다.
    GS_MSG.M09 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "301"); // 다운로드중
    GS_MSG.M10 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "302"); // 패치 압축 파일을 푸는 과정에 문제가 발생하였습니다
    GS_MSG.M11 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "303"); // CDN 서비스 호출 과정에 통신 오류가 발생하였습니다.
    GS_MSG.M12 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "304"); // CDN 에서 다운로드할 패치 파일이 존재하지 않습니다.
    GS_MSG.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "305"); // 패치 파일 다운로드 중에 문제가 발생하였습니다.
    GS_MSG.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "305"); // 패치 파일 다운로드 중에 문제가 발생하였습니다.
    GS_MSG.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "306"); // 패치 업데이트 정보를 확인하고 있습니다.
    GS_MSG.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "307"); // 현재 최신버전 입니다.
    GS_MSG.M17 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "308"); // "(패치) 업데이트 항목이 존재합니다",
    GS_MSG.M18 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "309"); // "(패치) 업데이트가 완료되었습니다.",
    GS_MSG.M19 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "310"); // "(패치) 업데이트 설치중",
    // GS_MSG.M20 = "app.asar 소스 압축해제 하는 과정에서 오류가 발생하였습니다",
    // GS_MSG.M21 = "app.asar 소스 압축 하는 과정에서 오류가 발생하였습니다",  
    GS_MSG.M22 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "298"); // 패치 업데이트 진행 과정에 문제가 발생하였습니다    
    GS_MSG.M290 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "290"); // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
    

}; // end of _getGlobalMsg

//업데이트 점검 시작 
exports.checkForUpdates = async function (remote, iscdn = false, versn, splev = 0, oLoginInfo) {

    //업데이트 확인중 
    document.dispatchEvent(new CustomEvent('checking-for-update-SP', { detail: { message: GS_MSG.M15 } }));

    //electron resource
    // REMOTE = remote;
    ISCDN = iscdn;          //CDN 여부 
    VERSN = versn;          //WS3.0 버젼(current) 
    SPLEV = Number(splev);  //패치 번호(current)

    //초기값 설정
    gf_initData(oLoginInfo);

    // 글로벌 언어 정보 가져오기
    _getGlobalMsg();

    
    //업데이트 방식에 따른 분기
    switch (ISCDN) {
        case true: //GIT
            var LS_CHKER = await gf_chkPatch_GIT();
            break;

        default:   //SAP
            var LS_CHKER = await gf_chkPatch_SAP();
            break;
    }

    if (LS_CHKER.RETCD === "E") {
        document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_CHKER.RTMSG } }));
        return;
    }


    //업데이트 항목이 없을 경우 
    if (!LS_CHKER.ISPATCH) {
        document.dispatchEvent(new CustomEvent('update-not-available-SP', { detail: { message: GS_MSG.M16 } })); //현재 최신버전입니다.
        return;
    }

    //이벤트 트리거 - 업데이트 항목 존재 
    document.dispatchEvent(new CustomEvent('update-available-SP', { detail: { message: GS_MSG.M17 } }));  //업데이트 항목이 존재합니다

    
    // 설치할 WS 패치 버전 정보
    let LS_FILE_INFO = {};
        LS_FILE_INFO.VERSN = LS_CHKER?.S_INFO?.VERSN;
        LS_FILE_INFO.SPLEV = LS_CHKER?.S_INFO?.SPLEV;
        LS_FILE_INFO.TOTAL = LS_CHKER?.S_INFO?.TOTAL;
        LS_FILE_INFO.TOTSP = LS_CHKER?.S_INFO?.TOTSP;
        LS_FILE_INFO.TOTND = LS_CHKER?.S_INFO?.TOTND;
        LS_FILE_INFO.TRANSFERRED = 0;

    let oPARAM = {        
        LOGIN_INFO : oLoginInfo,    // 현재 접속하려는 서버의 정보(SYSID, LOGIN 정보등)
        FILE_INFO  : LS_FILE_INFO,  // 업데이트 대상 파일 정보
        ISCDN      : ISCDN          // CDN 여부
    };

    // 패치 업데이트 파일을 워커로 다운
    _getPatchUpdateFileWorker(oPARAM);

};