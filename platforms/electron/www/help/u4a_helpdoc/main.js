/* ***************************************************************** */
// 설치 npm 
// 
/* ***************************************************************** */

/* ***************************************************************** */
// I/F 필드 정의 
/* ***************************************************************** */
/*
 */
/* ***************************************************************** */
/* ***************************************************************** */
/* 사용 예시 
    var HelpDoc = require(oAPP.path.join(__dirname, 'HelpDocument/main.js'));

    Help Document 수행 
        - 파라메터 설명 
            REMOTE         : electron remote 오브젝트 
            DOWN_ROOT_PATH : 다운로드 처리할 폴더 경로 

        - 아래 펑션을 수행전  (busy indicator 수행) 처리함 

            var retdata = await HelpDoc.Excute(oAPP.remote, "D:\\DOWNLOAD"); 
            retdata.RETCD <-- E:오류 
            retdata.RTMSG <-- 처리 메시지 
      
        - (busy indicator 종료)
*/
/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */

// IF 구조
const TY_IFDATA = {
    PRCCD: "",      // 수행중인 프로세스 코드    
    ACTCD: "",      // 수행중인 행위에 대한 코드     
    PARAM: "",      // 수행 결과에 대한 데이터
};

const REMOTE = parent.REMOTE;
const APP = REMOTE.app;
const APPPATH = APP.getAppPath();
const FS = require("fs");
const PATH = require("path");

// 로그인 사용자 정보
const GV_USER_INFO = parent.getUserInfo();
const LANGU = GV_USER_INFO.LANGU;


const GS_MSG = {
    M01: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "367", "", "", "", ""), //"Help Document 처리 통신 오류",
    M02: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "368", "", "", "", ""), //"Help Document 다운로드 처리 과정에서 해더 정보 누락되었습니다",
    M03: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "369", "", "", "", ""), //"Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.",
    M04: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "370", "", "", "", ""), //"Help Document 분할 다운로드 처리 과정에서 오류 발생",
    M05: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "371", "", "", "", ""), //"처리 완료",
    M06: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "372", "", "", "", ""), //"Help Document 버젼 파일 생성중 오류 발생",
    M07: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44", "", "", "", ""), // U4A Help Document
    M08: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B78", "", "", "", ""), // Download
    M09: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "290") // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
};

let GV_HOST = parent.getHost();



/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

//파일 삭제 
async function gfn_fileDel(oFS, PATH) {
    return new Promise((resolve, reject) => {

        try {
            oFS.unlink(PATH, (e) => { });
        } catch (error) {

        }

        resolve();

    });
}

//파일 이동
async function gfn_FileMove(oFS, NEW_PATH, OLD_PATH) {
    return new Promise((resolve, reject) => {

        oFS.rename(OLD_PATH, NEW_PATH, function (err) {
            if (err) { }

            resolve();

        });

    });
}

//Help document 해더 정보 추출
async function gfn_getHeadData() {
    return new Promise((resolve, reject) => {

        // var LV_URL = GV_HOST + "/zu4a_wbc/u4a_ipcmain/U4A_HELP_DOC_WS30?PRCCD=HEAD";

        /**
         * @since   2025-02-11 10:38:52
         * @version v3.5.1-1
         * @author  soccerhs
         * @description
         * 
         * Help Document 헤더 정보 요청 시 언어 정보까지 전달.
         * 
         */
        var LV_URL = `${GV_HOST}/zu4a_wbc/u4a_ipcmain/U4A_HELP_DOC_WS30?PRCCD=HEAD&LANGU_OUT=${GV_USER_INFO.LANGU}`;
        var xhttp = new XMLHttpRequest();
        xhttp.onerror = (e) => {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M01
            });
        }; //통신오류
        xhttp.ontimeout = () => {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M01
            });
        }; //통신오류
        xhttp.onload = (e) => {

            try {
                var sDATA = JSON.parse(e.target.response);
            } catch (error) {
                resolve({
                    RETCD: "E",
                    RTMSG: GS_MSG.M01
                }); //통신오류
                return;
            }

            if(sDATA?.RETCD === "E"){
                
                var sErrMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", sDATA.MSGNR) + "\n\n";
                    sErrMsg += GS_MSG.M09; // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.

                return resolve({                    
                    RETCD: "E",                    
                    RTMSG: sErrMsg

                }); //통신오류               
                

            }

            resolve({
                RETCD: "S",
                RTMSG: "",
                DATA: sDATA
            });
            return;

        };

        xhttp.open("GET", LV_URL, true);
        xhttp.withCredentials = true;
        xhttp.send();

    });
}

//File 존재여부 점검
async function gfn_file_existence(oFS, FOLD_PATH, CHK_FNAME) {
    return new Promise((resolve, reject) => {
        oFS.readdir(FOLD_PATH, (err, files) => {
            var isFnd = false;
            files.forEach(file => {
                if (file === CHK_FNAME) {
                    isFnd = true;

                }
            });

            resolve(isFnd);

        });
    });

}

// 프로그레스바 다이얼로그 열기
function gfn_openProgressDialogOpen() {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.oAPP) {
        return;
    }

    let oAPP = oConWin.oAPP,
        sTitle = `${GS_MSG.M07} ${GS_MSG.M08}`;

    let oInitOptions = {
        description: sTitle,
        // title: sTitle,
        illustrationType: "tnt-Systems",
    };

    oAPP.common.fnProgressDialogOpen(oInitOptions);

} // end of gfn_openProgressDialog

// 프로그레스바 다이얼로그 닫기
function gfn_closeProgressDialog() {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.oAPP) {
        return;
    }

    let oAPP = oConWin.oAPP;
    if (!oAPP) {
        return;
    }

    oAPP.common.fnProgressDialogClose();

} // end of gfn_closeProgressDialog

function gfn_setProgressbar(iValue, iTotalValue) {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.sap) {
        return;
    }

    // sap 인스턴스 여부 확인
    let sap = oConWin.sap;
    if (!sap) {
        return;
    }

    // 혹시나 나눗셈 할때 0으로 나누는지 확인
    if (!isFinite(iValue / iTotalValue)) {
        return;
    }

    let sPerValue = (iValue / iTotalValue) * 100,
        sPrgressId = "u4aWsProg",
        oProgressbar = sap.ui.getCore().byId(sPrgressId);

    if (!oProgressbar) {
        return;
    }

    sPerValue = sPerValue.toFixed(2);

    // 계산된 퍼센트 값이 100이 넘으면 100으로 고정
    if(sPerValue >= 100){
        sPerValue = 100;
    }

    oProgressbar.setPercentValue(sPerValue);

    let sMsg = `${GS_MSG.M08}.....${sPerValue}%`;

    oProgressbar.setDisplayValue(sMsg);

} // end of gfn_setProgressbar



/**
 * @since   2025-02-27
 * @version 3.5.0-sp7
 * @author  soccerhs
 * 
 * @description
 * Help Document 파일 다운로드
 * 
 * @returns
 * resolve의 Return 구조는 다음과 같이 한다.
 * 
 * resolve({
 *    RETCD: "",      // 리턴코드 S: 성공, E: 오류)
 *    RTMSG: "",      // 리턴코드에 대한 메시지
 * }); 
 */
function _getHelpDocFileDown(oPARAM){

    // 응답 공통 구조
    let TY_RES = {
        RETCD: "",
        RTMSG: "",
    };

    return new Promise(function(resolve){

        // Document 다운로드 처리에 대한 Worker js
        let _sWorkerPath = PATH.join(APPPATH, "help", "u4a_helpdoc", "workers", "u4aHelpDownWorker.js");

        let oWorker = new Worker(_sWorkerPath);

        oWorker.onmessage = function(e){
            
            // 공통 응답 구조
            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.RETCD = "E";

            var oIF_DATA = e?.data || undefined;
            if(!oIF_DATA){

                // 실행 중인 워커를 종료시킨다.
                try {
                    oWorker.terminate();
                    console.log("worker terminate - [WORKER-001]");
                } catch (error) {
                    
                }

                var aConsoleMsg = [              
                    `[PATH]: www/help/u4a_helpdoc/main.js`,  
                    `=> _getHelpDocFileDown`,
                    `=> oWorker.onmessage`,                    
                    `=> oIF_DATA undefined`,
                    `[WORKER-001]`                   
                ];
                console.error(aConsoleMsg.join("\r\n"));
                console.trace();

                // Help Document 버젼 파일 생성중 오류 발생
                // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                let sErrMsg = GS_MSG.M06 + "\n\n";
                    sErrMsg += GS_MSG.M09;
             
                oRES.RTMSG = sErrMsg;

                resolve(oRES);

                return;
            }

          
            // 프로세스 코드에 따른 분기
            switch (oIF_DATA.PRCCD) { 

                // 오류
                case "ERROR":

                    // 실행 중인 워커를 종료시킨다.
                    try {
                        oWorker.terminate();
                        console.log(`worker terminate - [PRCCD]: ${oIF_DATA.PRCCD}`);
                    } catch (error) {
                        
                    }

                    // 프로그래스 Dialog를 닫는다.
                    gfn_closeProgressDialog();

                    // 로그 정보가 있을 경우에는 콘솔 오류에 로그 정보를 담는다
                    var sLog = "";
                    var oPARAM = oIF_DATA?.PARAM || undefined;
                    if(oPARAM?.LOG){
                        sLog = oPARAM.LOG;
                    }    

                    var aConsoleMsg = [              
                        `[PATH]: www/help/u4a_helpdoc/main.js`,  
                        `=> _getHelpDocFileDown`,
                        `=> oWorker.onmessage`,  
                        `[WORKER-${oIF_DATA.STCOD}]`,
                        `[Log]: ${sLog}`                  
                    ];
                    console.error(aConsoleMsg.join("\r\n"));
                    console.trace();
                    
                    // [Default Error Msg] Help Document 버젼 파일 생성중 오류 발생
                    // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                    var sDefErrMsg = GS_MSG.M06 + "\n\n";
                        sDefErrMsg += GS_MSG.M09;

                    var sErrMsg = GS_MSG[oIF_DATA.MSGNR];

                    // MSGNR에 해당하는 메시지가 있을 경우 추가 메시지 내용을 덧붙인다.
                    if(sErrMsg){
                        sErrMsg += "\n\n" + GS_MSG.M09; // 다시시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                    }

                    // MSGNR에 해당하는 메시지가 없을 경우에는 기본값 메시지 내용을 출력한다.
                    oRES.RTMSG = sErrMsg || sDefErrMsg;

                    break;

                // Document 실행
                case "OPEN_DOCU":

                    // 실행 중인 워커를 종료시킨다.
                    try {
                        oWorker.terminate();
                        console.log(`worker terminate - [PRCCD]: ${oIF_DATA.PRCCD}`);
                    } catch (error) {
                        
                    }

                    // 프로그래스 Dialog를 닫는다.
                    gfn_closeProgressDialog();

                    var _oPARAM = oIF_DATA.PARAM;
                    var _sDocFilePath = _oPARAM.DOC_FILE_PATH;

                    REMOTE.shell.openPath(_sDocFilePath); //파일 실행 

                    oRES.RETCD = "S";
                    oRES.RTMSG = "";                   

                    break;

                // 프로그래스바 Dialog Open
                case "PROG_DIALOG_OPEN": 

                    gfn_openProgressDialogOpen();

                    return;

                // 프로그래스바 Dialog Close
                case "PROG_DIALOG_CLOSE": 

                    gfn_closeProgressDialog();

                    return;

                // 파워쉘 수행 중 오류에 대한 로그 남기기
                case "update-error-console": 

                    // 로그 정보가 있을 경우에는 콘솔 오류에 로그 정보를 담는다
                    var sLog = "";
                    var _oPARAM = oIF_DATA?.PARAM || undefined;
                    if(_oPARAM?.LOG){
                        sLog = _oPARAM.LOG;
                    }  

                    console.error(sLog);

                    return;

                // 프로그래스바 데이터 설정
                case "SET_PROG_DATA":

                    var _oPARAM = oIF_DATA.PARAM;

                    let iCount = _oPARAM.COUNT;
                    let iTotal = _oPARAM.TOTAL;
                    var sLog   = _oPARAM.LOG || "";

                    console.log(sLog);

                    gfn_setProgressbar(iCount, iTotal);

                    return;

                default:                

                    break;

            }

            // 실행 중인 워커를 종료시킨다.
            try {
                oWorker.terminate();
                console.log("worker terminate - END");
            } catch (error) {
                
            }

            resolve(oRES);

        };

        // 공통 IF 구조
        let oIF_DATA = JSON.parse(JSON.stringify(TY_IFDATA));

        oIF_DATA.PRCCD = "WS_HELP_DOCU_DOWN";
        oIF_DATA.PARAM = oPARAM;

        oWorker.postMessage(oIF_DATA);

    });

} // end of _getHelpDocFileDown

/*=================================================================== */
// Export Module Function - Help document 서버 Data 추출후 다운로드 처리
/*=================================================================== */
exports.Excute = async function (REMOTE, DOWN_ROOT_PATH) {
    //REMOTE         : electron remote 오브젝트 
    //HEAD_DATA      : Help document 해더 Data => getHeadData <- 이 펑션에서 추출한 Data
    //DOWN_ROOT_PATH : 다운로드 처리할 폴더 경로 

    return new Promise(async (resolve, reject) => {        

        //Help document 해더 정보 추출
        let HEAD_DATA = await gfn_getHeadData();

        //Help Document 다운로드 처리 과정에서 해더 정보 누락되었습니다
        if (typeof HEAD_DATA !== "object") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }

        if(HEAD_DATA?.RETCD === "E"){
            return resolve(HEAD_DATA);
        }

        if (typeof HEAD_DATA.DATA !== "object") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }

        if (typeof HEAD_DATA.DATA.RINDX === "undefined") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }


        // 하위 버전 서버를 접속했을 경우에는
        // 헤더 정보에 아래의 필드(LANG_O, BLOBCNT) 가 없는데
        // PowerShell 에서는 필수 파라미터 이므로
        // 필요한 값을 정의해준다.
        if(typeof HEAD_DATA?.DATA?.LANG_O === "undefined"){
            HEAD_DATA.DATA.LANG_O = LANGU;
        }

        if(typeof HEAD_DATA?.DATA?.BLOBCNT === "undefined"){
            HEAD_DATA.DATA.BLOBCNT = HEAD_DATA.DATA.SPCNT;
        }
    

        // WS Setting Json 정보
        let oSettings = parent.getSettingsInfo();

        // WS Setting Json 정보에서 powerShell 관련 정보
        let oPsInfo   = oSettings.ps;

        // WS Setting Json 정보에서 powerShell 파일 루트 경로
        let sPsRootPath = oPsInfo.rootPath;

        // WS Setting Json 정보에서 powerShell 실행 파일 경로
        let sWsDocPath = oPsInfo.ws_help_doc;

        // Package 여부에 따른 PowerShell 파일 경로
        // let sPsPath = PATH.join(process.resourcesPath, "www",  sPsRootPath /* ext_api/ps */, sWsDocPath /* WS_HELP/ws_doc.ps1 */);

        // if(!APP.isPackaged){
        //     sPsPath = PATH.join(APPPATH, sPsRootPath /* ext_api/ps */, sWsDocPath /* WS_HELP/ws_doc.ps1 */);   
        // }

        /**
         * @since   2025-04-24
         * @version 3.5.5-sp0
         * @author  soccerhs
         * 
         * @description
         * ## Powershell 경로 변경
         *
         * - 기존: [extraResource]/www/ext_api
         * - 변경: [UserData]/ext_api
         */
        let sPsPath = PATH.join(APP.getPath("userData"), sPsRootPath /* ext_api/ps */, sWsDocPath /* WS_HELP/ws_doc.ps1 */);


        // 로그인 사용자 정보
        let oLoginInfo = GV_USER_INFO;

        let oPATH = PATH;

        // 다운로드 파일 처리 경로 설정 
        let LV_ROOT_PATH = oPATH.join(DOWN_ROOT_PATH, "U4A_HELP_DOC");
        let LV_DOWN_PATH = oPATH.join(LV_ROOT_PATH, HEAD_DATA.DATA.LOCFN);

        // 다운로드 임시폴더 경로 설정 
        let LV_TMP_ROOT_PATH = oPATH.join(LV_ROOT_PATH, "U4A_HELP_DOC_TMP");
        let LV_TMP_DOWN_PATH = oPATH.join(LV_TMP_ROOT_PATH, HEAD_DATA.DATA.LOCFN);

        //Help document 버젼 파일 Path 설정 
        let LV_VESN_PATH = oPATH.join(LV_ROOT_PATH, "U4A_HELP_DOC_VER" + HEAD_DATA.DATA.VERSN + ".json");
        
        /**
         * @since   2025-11-07 15:06:07
         * @version v3.5.6-16
         * @author  soccerhs
         * @description
         * 
         * 파워쉘에서 발생되는 로그를 남기기 위한 경로
         
         */
        // 로그 저장 폴더 경로
        let sLogFolderPath = PATH.join(USERDATA, "logs", "u4a_ws_help_doc");
        
        if(APP.isPackaged){
            sLogFolderPath = PATH.join(USERDATA, "logs");
        }

        /**
         * @since   2025-11-07 15:06:07
         * @version v3.5.6-16
         * @author  soccerhs
         * @description
         * 
         * 서버 설정값에 내부 인터널 주소 설정이 되어있다면 내부 호스트를 BaseUrl로 지정한다.
         *      
         */
        let oServerSettings = oLoginInfo?.SERVER_SETTINGS || undefined;

        // Base Url 설정
        let sBaseUrl = parent.getServerHost();

        if(oServerSettings && oServerSettings.useInternal === true){
            sBaseUrl = oLoginInfo.META.HOST;
        }

        let oPARAM = {

            // 파워쉘 파일 경로
            PS_DOC_PATH : sPsPath,

            BASE_URL     : sBaseUrl,
            SAP_CLIENT   : oLoginInfo.CLIENT,
            SAP_USER     : oLoginInfo.ID,
            SAP_PW       : oLoginInfo.PW,

            ROOT_PATH    : LV_ROOT_PATH,
            DOWN_PATH    : LV_DOWN_PATH,
            TMP_ROOT_PATH: LV_TMP_ROOT_PATH,
            TMP_DOWN_PATH: LV_TMP_DOWN_PATH,
            VESN_PATH    : LV_VESN_PATH,

            // Help Document Header Data
            HEAD_DATA    : HEAD_DATA,

            // 로그 폴더 경로
            LOG_FLD_PATH : sLogFolderPath,

            // https 인증서 오류 회피
            SKIP_CERT    : false

        };

        /**
         * @since   2025-12-10 17:57:03
         * @version v3.5.6-17
         * @author  soccerhs
         * @description
         * 
         * https 인증서 오류 회피 옵션 추가
         * 
         */
        if(oServerSettings && oServerSettings.skipCertificate === true){
            oPARAM.SKIP_CERT = true;
        }

        // Help Document 파일 다운로드
        let oResult = await _getHelpDocFileDown(oPARAM);

        resolve(oResult);

    }); //return new Promise( async (resolve, reject)


}; //exports.HelpDocDown