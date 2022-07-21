/**************************************************************************                                           
 * ws_fn_04.js
 **************************************************************************/
(function (window, $, oAPP) {
    "use strict";

    var PATH = parent.PATH,
        APP = parent.APP,
        APPPATH = parent.APPPATH;

    // REMOTE = parent.REMOTE,
    // REMOTEMAIN = parent.REMOTEMAIN,
    // APPCOMMON = oAPP.common,
    // CURRWIN = REMOTE.getCurrentWindow(),
    // SESSKEY = parent.getSessionKey(),
    // BROWSKEY = parent.getBrowserKey(),
    // IPCMAIN = REMOTE.require('electron').ipcMain;

    /************************************************************************
     * SAP GUI 멀티 로그인 체크
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheck = () => {

        return new Promise((resolve, reject) => {

            var sPath = parent.getServerPath() + '/chk_mlogin_of_gui',
                oUserInfo = parent.getUserInfo(),
                sId = oUserInfo.ID.toUpperCase(),
                sPw = oUserInfo.PW,
                sComputerName = parent.COMPUTERNAME;

            var oFormData = new FormData();
            oFormData.append("sap-user", sId);
            oFormData.append("sap-password", sPw);
            oFormData.append("PC_NAME", sComputerName);

            // function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {
            sendAjax(
                sPath,
                oFormData,
                (oResult) => { // success

                    if (oResult.RETCD == "E") {

                        reject(oResult);
                        return;
                    }

                    resolve(oResult);

                },
                true, // is Busy
                true, // bIsAsync
                "POST" // meth
            );

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheck

    /************************************************************************
     * SAP GUI 멀티 로그인 체크 성공시
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheckThen = function (oResult) {

        var oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = parent.require(oSettingsPath),
            oVbsInfo = oSettings.vbs,
            sVbsPath = oVbsInfo.rootPath,
            sVbsFileName = oVbsInfo.controllerClassVbs,
            sNewSessionVbs = oVbsInfo.newSessionVbs,
            sAppPath = APP.getPath("userData"),
            sVbsFullPath = PATH.join(sAppPath, sVbsPath, sVbsFileName),
            sNewSessionVbsFullPath = PATH.join(sAppPath, sVbsPath, sNewSessionVbs);

        var oServerInfo = parent.getServerInfo(),
            oAppInfo = parent.getAppInfo(),
            oUserInfo = parent.getUserInfo();

        if (!oAppInfo) {
            return;
        }

        debugger;
        
        var METHNM = this.METHNM,
            INDEX = this.INDEX,
            TCODE = this.TCODE;

        // SID    = WScript.arguments.Item(0) '연결 SID (*필수) => EX) U4A
        // MANDT  = WScript.arguments.Item(1) '로그온 클라이언트 (*필수) => EX) 800
        // BNAME  = WScript.arguments.Item(2) '로그온 SAP ID (*필수)	 => EX) USER
        // APPID  = WScript.arguments.Item(3) 'U4A APP ID (*필수) => EX) ZU4A_TS0010
        // METHD  = WScript.arguments.Item(4) '네비게이션 대상 이벤트 메소드 (*옵션) => EX) EV_TEST
        // SPOSI  = WScript.arguments.Item(5) '네비게이션 대상 이벤트 메소드 소스 라인번호 (*옵션) => EX) 100
        // ISEDT  = WScript.arguments.Item(6) '수정모드 여부(예 : X, 아니오 : 공백) 
        // TCODE  = WScript.arguments.Item(7) 'SAP TCODE
        // MAXSS  = CInt(WScript.arguments.Item(8)) '시스템 허용 최대 세션수

        var aParam = [
            sNewSessionVbsFullPath, // VBS 파일 경로
            oServerInfo.SYSTEMID, // SYSTEM ID  
            oServerInfo.CLIENT, // CLIENT
            oUserInfo.ID.toUpperCase(), // SAP ID    
            oAppInfo.APPID, // Application Name
            (typeof METHNM == "undefined" ? "" : METHNM),
            (typeof INDEX == "undefined" ? "0" : INDEX),
            oAppInfo.IS_EDIT, // Edit or Display Mode
            TCODE || "", // T-CODE
            // oResult.RTVAL, // SAPGUI Multi Login Check Value
            oResult.MAXSS, // 최대 세션창 갯수
        ];

        //1. 이전 GUI 세션창 OPEN 여부 VBS 
        var vbs = parent.SPAWN('cscript.exe', aParam);
        vbs.stdout.on("data", function (data) {});

        //GUI 세션창이 존재하지않다면 ...
        vbs.stderr.on("data", function (data) {

            // HostIP = WScript.arguments.Item(0) '연결 Host IP (*필수)
            // SID    = WScript.arguments.Item(1) '연결 SID (*필수)
            // SNO    = WScript.arguments.Item(2) '연결 SNo (*필수)
            // MANDT  = WScript.arguments.Item(3) '로그온 클라이언트 (*필수)
            // BNAME  = WScript.arguments.Item(4) '로그온 SAP ID (*필수)
            // PASS   = WScript.arguments.Item(5) '로그온 SAP ID 비번 (*필수)
            // LANGU  = WScript.arguments.Item(6) '로그온 언어키 (*필수)
            // APPID  = WScript.arguments.Item(7) 'U4A APP ID (*필수)
            // METHD  = WScript.arguments.Item(8) '네비게이션 대상 이벤트 메소드 (*옵션)
            // SPOSI  = WScript.arguments.Item(9) '네비게이션 대상 이벤트 메소드 소스 라인번호 (*옵션)
            // ISEDT  = WScript.arguments.Item(10) '수정모드 여부(예 : X, 아니오 : 공백)
            // TCODE  = WScript.arguments.Item(11) 'SAP TCODE

            // REM ** 다중 로그인 여부 **
            // REM    1: SAP GUI 다중 로그인 정보 없음, 
            // REM    2: SAP GUI 다중 로그인 정보 있음(* 시스템 허용)
            // REM    X: SAP GUI 다중 로그인 시스템 허용 안함
            // ISMLGN = WScript.arguments.Item(12) 

            // MAXSS = CInt(WScript.arguments.Item(13))
            var aParam = [
                sVbsFullPath, // VBS 파일 경로
                oServerInfo.SERVERIP, // Server IP
                oServerInfo.SYSTEMID, // SYSTEM ID
                oServerInfo.INSTANCENO, // INSTANCE Number
                oServerInfo.CLIENT, // CLIENT
                oUserInfo.ID.toUpperCase(), // SAP ID    
                oUserInfo.PW, // SAP PW
                oServerInfo.LANGU, // LANGUAGE
                oAppInfo.APPID, // Application Name
                (typeof METHNM == "undefined" ? "" : METHNM),
                (typeof INDEX == "undefined" ? "0" : INDEX),
                TCODE || "", // T-CODE
                oAppInfo.IS_EDIT, // Edit or Display Mode,
                oResult.RTVAL, // SAPGUI Multi Login Check Value
                oResult.MAXSS, // 최대 세션창 갯수
            ];

            var vbs = parent.SPAWN('cscript.exe', aParam);
            vbs.stdout.on("data", function (data) {});
            vbs.stderr.on("data", function (data) {});

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheckThen

})(window, $, oAPP);