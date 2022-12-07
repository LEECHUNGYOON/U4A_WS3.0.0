/**************************************************************************                                           
 * ws_fn_04.js
 **************************************************************************/
(function (window, $, oAPP) {
    "use strict";

    var PATH = parent.PATH,
        APP = parent.APP,
        REMOTEMAIN = parent.REMOTEMAIN,
        REMOTE = parent.REMOTE,
        APPPATH = parent.APPPATH,
        APPCOMMON = oAPP.common;

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

        debugger;

        var oMetadata = parent.getMetadata(),
            oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = parent.require(oSettingsPath),
            oVbsInfo = oSettings.vbs,
            sVbsPath = oVbsInfo.rootPath,
            sVbsFileName = oVbsInfo.controllerClassVbs,
            sNewSessionVbs = oVbsInfo.newSessionVbs;

        // 서버가 신규 네임 스페이스 적용 서버가 아닌경우
        if (oMetadata.IS_NAME_SPACE !== "X") {
            sVbsFileName = "asis_" + sVbsFileName;
            sNewSessionVbs = "asis_" + sNewSessionVbs;
        }

        var sAppPath = APP.getPath("userData"),
            sVbsFullPath = PATH.join(sAppPath, sVbsPath, sVbsFileName),
            sNewSessionVbsFullPath = PATH.join(sAppPath, sVbsPath, sNewSessionVbs);

        var oServerInfo = parent.getServerInfo(),
            oAppInfo = parent.getAppInfo(),
            oUserInfo = parent.getUserInfo();

        var METHNM = this.METHNM,
            INDEX = this.INDEX,
            TCODE = this.TCODE,
            oParamAppInfo = this.oAppInfo;

        if (oParamAppInfo) {
            oAppInfo = oParamAppInfo;
        }

        // App 정보가 없다면 빈 Object로 초기화..
        if (!oAppInfo) {
            oAppInfo = {};
        }

        var aParam = [
            sNewSessionVbsFullPath, // VBS 파일 경로
            oServerInfo.SYSTEMID, // SYSTEM ID  
            oServerInfo.CLIENT, // CLIENT
            oUserInfo.ID.toUpperCase(), // SAP ID    
            oAppInfo.APPID || "", // Application Name
            (typeof METHNM == "undefined" ? "" : METHNM),
            (typeof INDEX == "undefined" ? "0" : INDEX),
            oAppInfo.IS_EDIT || "", // Edit or Display Mode
            TCODE || "", // T-CODE
            // oResult.RTVAL, // SAPGUI Multi Login Check Value
            oResult.MAXSS, // 최대 세션창 갯수
        ];

        //1. 이전 GUI 세션창 OPEN 여부 VBS 
        var vbs = parent.SPAWN('cscript.exe', aParam);
        vbs.stdout.on("data", function (data) {
            console.log(data.toString());
        });

        //GUI 세션창이 존재하지않다면 ...
        vbs.stderr.on("data", function (data) {

            //VBS 리턴 오류 CODE / MESSAGE 
            var str = data.toString(),
                Tstr = str.split(":"),
                len = Tstr.length - 1;

            if (len !== 0) {

                str = Tstr[len];
                if (str.indexOf("|") != -1) {
                    return;
                }

            }

            var aParam = [
                sVbsFullPath, // VBS 파일 경로
                oServerInfo.SERVERIP, // Server IP
                oServerInfo.SYSTEMID, // SYSTEM ID
                oServerInfo.INSTANCENO, // INSTANCE Number
                oServerInfo.CLIENT, // CLIENT
                oUserInfo.ID.toUpperCase(), // SAP ID    
                oUserInfo.PW, // SAP PW
                oServerInfo.LANGU, // LANGUAGE
                oAppInfo.APPID || "", // Application Name
                (typeof METHNM == "undefined" ? "" : METHNM),
                (typeof INDEX == "undefined" ? "0" : INDEX),
                oAppInfo.IS_EDIT || "", // Edit or Display Mode,
                TCODE || "", // T-CODE
                oResult.RTVAL, // SAPGUI Multi Login Check Value
                oResult.MAXSS, // 최대 세션창 갯수
            ];

            var vbs = parent.SPAWN('cscript.exe', aParam);
            vbs.stdout.on("data", function (data) {});
            vbs.stderr.on("data", function (data) {

                //VBS 리턴 오류 CODE / MESSAGE 
                var str = data.toString(),
                    Tstr = str.split(":"),
                    len = Tstr.length - 1;

                if (len !== 0) {

                    str = Tstr[len];

                    if (str.indexOf("|") != -1) {
                        return;
                    }

                }

            });

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheckThen

    /************************************************************************
     * 브라우저에 내장된 세션 정보를 클리어 한다.
     ************************************************************************/
    oAPP.fn.fnClearSessionStorageData = () => {

        var currwin = parent.CURRWIN,
            webcon = currwin.webContents,
            sess = webcon.session;

        sess.clearStorageData([]);

    }; // end of oAPP.fn.fnClearSessionStorageData

    /************************************************************************
     * TCODE Suggestion 구성
     ************************************************************************/
    oAPP.fn.fnOnInitTCodeSuggestion = () => {

        let sSuggName = "tcode";

        var aSuggData = oAPP.fn.fnSuggestionRead(sSuggName);

        if (aSuggData instanceof Array == false) {
            oAPP.fn.fnSuggestionSave(sSuggName, []);

            return;
        }

        APPCOMMON.fnSetModelProperty("/SUGG/TCODE", aSuggData);

    }; // end of oAPP.fn.fnOnInitTCodeSuggestion

    /************************************************************************
     * ServerList Focus
     ************************************************************************/
    oAPP.fn.fnSetFocusServerList = () => {

        var sPopupName = "SERVERLIST";

        // 1. 현재 떠있는 브라우저 갯수를 구한다.
        var aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowsLen = aBrowserList.length;

        for (var i = 0; i < iBrowsLen; i++) {

            var oBrows = aBrowserList[i];
            if (oBrows.isDestroyed()) {
                continue;
            }

            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

            if (oWebPref.OBJTY !== sPopupName) {
                continue;
            }

            oBrows.show();
            oBrows.focus();

            return;

        }


    }; // end of oAPP.fn.fnSetFocusServerList

    /************************************************************************
     * 30번 페이지 생성
     ************************************************************************/
    oAPP.fn.fnWs30Creator = () => {

        // Application Copy Popup Open
        if (oAPP.fn.fnCreateWs30) {
            oAPP.fn.fnCreateWs30();
            return;
        }

        oAPP.fn.fnCreateWs30();

    }; // end of oAPP.fn.fnWs30Creator

    /************************************************************************
     * 윈도우의 프레임을 투명하게 만들고 배경을 선택할 수 있게 만드는 기능
     ************************************************************************/
    oAPP.fn.fnSetHideWindow = () => {

        // var op = {
        //      "height": 120,
        //      "width": 288,
        //     "acceptFirstMouse": true,
        //     "alwaysOnTop": true,
        //     "maximizable": false,
        //     "minimizable": false,
        //     "show": true,
        //     // "resizable": false,
        //     "transparent": true,
        //     "frame": false,
        //     //"titleBarStyle": "hidden",
        //     "parent": parent.REMOTE.getCurrentWindow(),

        //     "webPreferences": {
        //         "devTools": true,
        //         "nodeIntegration": true,
        //         "enableRemoteModule": true,
        //         "contextIsolation": false,
        //         "webSecurity": false,
        //         "nativeWindowOpen": true
        //     }

        // };

        // let win = parent.REMOTE.getCurrentWindow();

        // // 윈도우에 클릭 이벤트 무시 여부
        // win.setIgnoreMouseEvents(true);
        // win.setAlwaysOnTop(true);

        // var oWIN = new parent.REMOTE.BrowserWindow(op);

        // oWIN.loadURL(parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20/Popups/winShowHidePopup/index.html"));

        // oWIN.webContents.on('did-finish-load', function () {
        //     oWIN.show();

        //     let oSendData = {
        //         DEFAULT_OPACITY: 0.3
        //     };

        //     oWIN.webContents.send('if_showHidePopup', oSendData);

        // });

        // // 브라우저를 닫을때 타는 이벤트
        // oWIN.on('closed', () => {

        //     let bIsPin = APPCOMMON.fnGetModelProperty("/SETTING/ISPIN");

        //     parent.REMOTE.getCurrentWindow().focus();
        //     parent.REMOTE.getCurrentWindow().setOpacity(1);
        //     parent.REMOTE.getCurrentWindow().setIgnoreMouseEvents(false);

        //     if (!bIsPin) {
        //         parent.REMOTE.getCurrentWindow().setAlwaysOnTop(false);
        //     }

        //     oWIN = null;

        // });

        // parent.REMOTE.require('@electron/remote/main').enable(oWIN.webContents);

        // return;









        let win = parent.REMOTE.getCurrentWindow();

        // 윈도우에 클릭 이벤트 무시 여부
        win.setIgnoreMouseEvents(true);

        win.setAlwaysOnTop(true);

        var oBrowserOptions = {
            "height": 120,
            "width": 288,
            "maxWidth": 288,
            "maxHeight": 120,
            "minWidth": 288,
            "minHeight": 120,
            // "height": 400,
            // "width": 400,
            "acceptFirstMouse": true,
            // "resizable": false,
            "alwaysOnTop": true,
            "maximizable": false,
            "minimizable": false,
            // "show": true,
            // "opacity": 0.0,
            "frame": false,
            "transparent": true,
            "parent": win,
            "webPreferences": {
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
            }
        };

        // 브라우저 오픈
        var oBrowserWindow = new parent.REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);
        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);
        // oBrowserWindow.setMenuBarVisibility(false);

        // 실행할 URL 적용
        // var sUrlPath = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20/Popups/winShowHidePopup/test1.html");
        // var sUrlPath = parent.getPath("WINHIDE2");
        var sUrlPath = parent.getPath("WINHIDE");

        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oSendData = {
                DEFAULT_OPACITY: 0.3
            };

            oBrowserWindow.webContents.send('if_showHidePopup', oSendData);

            oBrowserWindow.show();

            // oBrowserWindow.setOpacity(1.0);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            let bIsPin = APPCOMMON.fnGetModelProperty("/SETTING/ISPIN");

            win.focus();
            win.setOpacity(1);
            win.setIgnoreMouseEvents(false);

            if (!bIsPin) {
                win.setAlwaysOnTop(false);
            }

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnSetToggleFrameWindow

})(window, $, oAPP);