/**
 *  ## Electron
 */

var // <-- 여기는 반드시 var로 선언해야함. (let, const는 자식에서 parent로 접근이 안됨.)
    REMOTE = require('@electron/remote'),
    REMOTEMAIN = REMOTE.require('@electron/remote/main'),
    SCREEN = REMOTE.require('electron').screen,
    GLOBALSHORTCUT = REMOTE.require('electron').globalShortcut,
    IPCMAIN = REMOTE.require('electron').ipcMain,
    IPCRENDERER = require('electron').ipcRenderer,
    DIALOG = REMOTE.require('electron').dialog,
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    FS = REMOTE.require('fs'),
    RANDOM = require("random-key"),
    SPAWN = require("child_process").spawn,
    REGEDIT = require('regedit'),
    WEBFRAME = require('electron').webFrame,
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"),
    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    WSUTIL = parent.require(PATHINFO.WSUTIL),
    USP_UTIL = parent.require(PATHINFO.USP_UTIL),
    CURRWIN = REMOTE.getCurrentWindow(),
    MIMETYPES = require('mime-types'),
    POWERMONITOR = REMOTE.require('electron').powerMonitor,
    COMPUTERNAME = process.env.COMPUTERNAME,
    WSLOG = require(PATH.join(APPPATH, "ws10_20", "js", "ws_log.js")),
    UAI = require(PATH.join(PATHINFO.JS_ROOT, "uai", "index.js"));

// var WSUTIL_PATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js");
// var WSUTIL = require(WSUTIL_PATH);




const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

POWERMONITOR.setMaxListeners(100);
IPCMAIN.setMaxListeners(100);

// [R&D 전용 console.log]
// var zconsole = {};
// zconsole.APP = APP;

/**
 *  ## oWS WS
 */

var // <-- 여기는 반드시 var로 선언해야함. (let, const는 자식에서 parent로 접근이 안됨.)
    oWS = {},
    oAPP = {};
oAPP.common = {};
oAPP.msg = {};

(function (oWS) {
    "use strict";

    oWS.utill = {};
    oWS.utill.fn = {};
    oWS.utill.attr = {};
    oWS.utill.attr.paths = {}; // 각종 패스 모음
    oWS.utill.attr.METADATA = {}; // 메타 데이터

    // Busy Indicator 상태
    oWS.utill.attr.isBusy = "";

    oWS.utill.attr.paths = require(PATH.join(APPPATH, "Frame", "pathInfo.js"));

    // Default Browser 기준정보 (Login.js 에서 관련 기준 정보 선행체크함.)
    oWS.utill.attr.aDefaultBrowsInfo = [];

    // Theme 정보
    oWS.utill.attr.oThemeInfo = {};

    // Browser Session Key 정보
    oWS.utill.attr.sessionkey = "";

    // Browser Key 정보
    oWS.utill.attr.browserkey = "";

    // // 현재 떠있는 새창 갯수
    // oWS.utill.attr.aWindowIds = [];

    // 에디터 정보
    oWS.utill.attr.oWsConfInfo = {
        BUSYTYPE: '01',
    };

    // 현재 페이지 정보
    oWS.utill.attr.currPage = "";

    // Busy를 실행하는 DOM 객체 정보
    oWS.utill.attr.oBusyDom = undefined;

    // Busy 타입별 Busy Dom 객체정보를 글로벌에 저장
    let oDefBusyDom = document.getElementById("u4aWsBusyIndicator");
    switch(oWS.utill.attr.oWsConfInfo.BUSYTYPE){

        case "01":
            oWS.utill.attr.oBusyDom = oDefBusyDom;
            break;
        
        default: 
            oWS.utill.attr.oBusyDom = oDefBusyDom;
            break;

    }



/**********************************************************
 * 📝 Local Functions 
 **********************************************************/


    /**********************************************************
     * ## 접속 언어별 웰컴 사운드 경로를 반환 한다.
     **********************************************************/
    function _getWelComeSoundPath(){

        let oUserInfo = parent.process.USERINFO;
        if(!oUserInfo){
            return;
        }

        let sLangu = oUserInfo.LANGU;

        // 사운드 ROOT 경로
        // let sSoundRootPath = PATH.join(__dirname, '../sound/welcome/');
        let sSoundRootPath = PATH.join(APPPATH, "sound", "welcome");
        let sSoundFileName = "WELCOME";

        let sSoundPath = PATH.join(sSoundRootPath, sLangu, sSoundFileName + ".wav");        

        // 로그인 언어에 해당하는 사운드가 없다면 기본 EN 사운드로 출력한다.
        if(FS.existsSync(sSoundPath) === false){            
            return PATH.join(sSoundRootPath, "EN", sSoundFileName + ".wav");
        }

        return sSoundPath;

    } // end of _getWelComeSoundPath

    /**********************************************************
     * ## Function 
     **********************************************************/


    /** 
     * 1. 메시지 호출
     * 
     * # oUI5
     * - (instance) sap
     *  
     * # KIND
     * - 10: MessageToast
     * - 20: MessageBox (1 button: OK)
     * - 30: MessageBox (2 button: YES, NO)
     * - 40: MessageBox (3 button: YES, NO, CANCLE)     
     * - 99: Electron Message
     * 
     * # TYPE     
     * - S : success
     * - E : error
     * - W : warning
     * - I : information
     * 
     * # MSG
     * - (string) Message
     */
    oWS.utill.fn.showMessage = function (oUI5, KIND, TYPE, MSG, fn_callback) {

        // 메시지가 Array 일 경우 개행 문자를 넣는다.
        var newMsg = "";

        // if (MSG instanceof Array) {
        if (Array.isArray(MSG)) {

            var iMsgcnt = MSG.length;

            for (var i = 0; i < iMsgcnt; i++) {

                var sMsg = MSG[i];

                if (i == iMsgcnt - 1) {
                    newMsg = sMsg;
                    break;
                }

                newMsg = sMsg + "\n";

            }

        } else {
            newMsg = MSG;
        }

        // UI5 필요한 라이브러리를 로드한다.
        lf_loadLibrary(oUI5);

        // 메시지 타입별 텍스트
        let oMsgcls = {
            S: "Success",
            E: "Error",
            I: "Information",
            W: "Warning",
            WORKSPACE: "U4A WorkSpace"
        };

        let APPCOMMON = oAPP.common;

        // 로그인 후 메시지 정보를 읽었을 경우 접속 언어에 맞게 텍스트 변경
        if (APPCOMMON && APPCOMMON.fnGetMsgClsText) {
            oMsgcls.S = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D86"); // Success
            oMsgcls.E = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B93"); // Error
            oMsgcls.I = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B86"); // Information
            oMsgcls.W = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B89"); // Warning
            oMsgcls.WORKSPACE = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D29"); // U4A WorkSpace
        }

        switch (KIND) {

            case 10: // MessageToast

                // 메시지 토스트 옵션
                var oMsgToastOpts = {
                    width: "auto",
                    my: "center center",
                    at: "center center",
                };

                oUI5.m.MessageToast.show(newMsg, oMsgToastOpts);

                break;

            case 20: // MessageBox (1 button: OK)

                // 메시지 박스 옵션
                var oMsgBoxOpts = {
                    title: "",
                    onClose: fn_callback,
                    actions: [
                        oUI5.m.MessageBox.Action.OK,
                    ],
                    emphasizedAction: oUI5.m.MessageBox.Action.OK
                };

                switch (TYPE) {

                    case "S":

                        setSoundMsg("01"); // success

                        oMsgBoxOpts.title = oMsgcls.S; // Success

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = oMsgcls.I; // Information

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = oMsgcls.W; // Warning

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = oMsgcls.E; // Error

                        oUI5.m.MessageBox.error(newMsg, oMsgBoxOpts);

                        break;

                }

                break;


            case 30: // MessageBox (2 button: YES, NO)

                // 메시지 박스 옵션
                var oMsgBoxOpts = {
                    title: "",
                    onClose: fn_callback,
                    initialFocus: null,
                    actions: [
                        oUI5.m.MessageBox.Action.YES,
                        oUI5.m.MessageBox.Action.NO,
                    ],
                    emphasizedAction: oUI5.m.MessageBox.Action.YES
                };

                switch (TYPE) {

                    case "S":

                        setSoundMsg("01"); // success

                        oMsgBoxOpts.title = oMsgcls.S; // Success

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = oMsgcls.I; // Information

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = oMsgcls.W; // Warning

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = oMsgcls.E; // Error

                        oUI5.m.MessageBox.error(newMsg, oMsgBoxOpts);

                        break;

                }

                break;

            case 40: // MessageBox (3 button: YES, NO, CANCLE)

                // 메시지 박스 옵션
                var oMsgBoxOpts = {
                    title: "",
                    onClose: fn_callback,
                    initialFocus: null,
                    actions: [
                        oUI5.m.MessageBox.Action.YES,
                        oUI5.m.MessageBox.Action.NO,
                        oUI5.m.MessageBox.Action.CANCEL,
                    ],
                    emphasizedAction: oUI5.m.MessageBox.Action.YES
                };

                switch (TYPE) {

                    case "S":

                        setSoundMsg("01"); // success

                        oMsgBoxOpts.title = oMsgcls.S; // Success

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = oMsgcls.I; // Information

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        oMsgBoxOpts.title = oMsgcls.W; // Warning

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = oMsgcls.W; // Error

                        oUI5.m.MessageBox.error(newMsg, oMsgBoxOpts);

                        break;

                }

                break;

            case 99:

                var oCurrView = REMOTE.getCurrentWindow();

                let sTitle = oMsgcls.WORKSPACE; // U4A WorkSpace

                switch (TYPE) {
                    case "I":
                        DIALOG.showMessageBox(oCurrView, {
                            type: "info",
                            title: sTitle,
                            message: newMsg
                        });
                        break;

                    case "W":
                        DIALOG.showMessageBox(oCurrView, {
                            type: "warning",
                            title: sTitle,
                            message: newMsg
                        });
                        break;

                    case "E":

                        setSoundMsg("02"); // error  

                        DIALOG.showMessageBox(oCurrView, {
                            type: "error",
                            title: sTitle,
                            message: newMsg
                        });

                        break;

                }

        }

        // (local function) UI5 라이브러리 로드
        function lf_loadLibrary(oUI5) {

            // 메시지박스 
            if (!oUI5) {
                return;
            }

            if (!oUI5.m.MessageBox) {
                oUI5.ui.requireSync("sap/m/MessageBox");
            }

        } // end of lf_loadLibrary

    }; // end of oWS.utill.fn.showMessage

    // 2. 서버 정보를 구한다.
    oWS.utill.fn.getServerInfo = function () {

        if (!oWS.oServerInfo) {
            return;
        }

        return oWS.oServerInfo;

    };

    oWS.utill.fn.setServerInfo = (oServerInfo) => {

        oWS.oServerInfo = oServerInfo;

    };

    oWS.utill.fn.setBeforeServerInfo = (oServerInfo) => {

        oWS.oBeforeServerInfo = oServerInfo;

    };

    oWS.utill.fn.getBeforeServerInfo = () => {

        if (!oWS.oBeforeServerInfo) {
            return;
        }

        return oWS.oBeforeServerInfo;

    };

    // 3. 서버 URL을 구한다.
    oWS.utill.fn.getServerPath = function (bIsStateLess) {

        var sServerHost = getServerHost(),
            sServicePath = sServerHost + "/zu4a_wbc/u4a_ipcmain";

        if (bIsStateLess === true) {
            sServicePath = sServerHost + "/zu4a_wbc/u4a_dynpro";
        }

        return sServicePath;

    };

    // 4. 서버 호스트를 구한다.
    oWS.utill.fn.getServerHost = function () {

        let oWS_ServerInfo = oWS.oServerInfo;
        if (!oWS_ServerInfo) {
            return;
        }

        let oServerInfo = oWS_ServerInfo.SERVER_INFO,
            sProtocol = oServerInfo.protocol,
            sHost = oServerInfo.host,
            sPort = oServerInfo.port;

        let sServicePath = `${sProtocol}://${sHost}`;
        if (sPort != "") {
            sServicePath += `:${sPort}`;
        }

        return sServicePath;

    };

    // 4. Page 이동
    oWS.utill.fn.onMoveToPage = function (sMovePath) {

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        var sPath = getPath(sMovePath);
        if (!sPath) {
            return;
        }

        if (sMovePath == "LOGIN") {
            delete oWS.utill.attr.ISINIT;
        }

        oWs_frame.src = sPath;

    };

    // 5. Electron Instance return.
    oWS.utill.fn.getElectronRemote = function () {
        return REMOTE;
    };

    // 6. NODE JS 'require' return.
    oWS.utill.fn.getRequire = function () {
        return require;
    };

    // 7. Application 정보 저장
    oWS.utill.fn.setAppInfo = function (oAppInfo) {

        if (oWS.utill.attr.oAppInfo) {
            delete oWS.utill.attr.oAppInfo;
        }

        if (!oAppInfo) {
            return;
        }

        // Object가 빈값이면 리턴 (초기화 일 경우).
        if (Object.keys(oAppInfo).length === 0 &&
            JSON.stringify(oAppInfo) === JSON.stringify({})) {
            return;
        }

        // 변경된 값이 있으면 Inactive 상태로 변환
        if (oAppInfo.IS_CHAG == 'X') {
            oAppInfo.ACTST = "I";
        }

        // Global AppInfo에 저장
        oWS.utill.attr.oAppInfo = oAppInfo;

        // 변경된 값이 있을 경우
        if (oAppInfo.IS_CHAG == 'X') {

            // WS20 페이지에 AppInfo 모델 정보를 갱신 시킨다.
            var oIframe = document.getElementById("ws_frame"),
                oSAP = oIframe.contentWindow.sap,
                oAPP = oIframe.contentWindow.oAPP,
                oWS20APP = oSAP.ui.getCore().byId("WSAPP");

            if (!oWS20APP && oWS20APP.oToPage.sId != "WS20") {
                return;
            }

            oAPP.common.fnSetModelProperty("/WS20/APP", oAppInfo);

        }

    };

    // 8. AppID 및 Create, Change, Display 모드 정보 구하기
    oWS.utill.fn.getAppInfo = function () {

        if (!oWS.utill.attr.oAppInfo) {
            return;
        }

        return oWS.utill.attr.oAppInfo;

    };

    // // 9. SAP Icon Image Path 만들어주는 function  ## oAPP.fn.fnGetSapIconPath(); 으로 대체함 
    // oWS.utill.fn.getSapIconPath = function (sIconName) {
    //     return oWS.utill.attr.paths.SAPICONPATH + sIconName + ".gif";
    // };

    // 10. Window Header Menu Setting
    oWS.utill.fn.setBrowserMenu = function (aTemplate) {

        var oCurrWin = REMOTE.getCurrentWindow(),
            MENU = REMOTE.Menu;

        if (aTemplate == null) {
            oCurrWin.setMenu(null);
            return;
        }

        var oMenu = MENU.buildFromTemplate(aTemplate);
        oCurrWin.setMenu(oMenu);

    };

    // 11. 현재 dirname 구하기
    oWS.utill.fn.getDirName = function () {
        return __dirname;
    };

    // 12. Page Path 구하기
    oWS.utill.fn.getPath = function (sPagePath) {

        var sPath = oWS.utill.attr.paths[sPagePath];
        if (!sPath) {
            return;
        }

        return sPath;

    };

    // 14. 서버에서 App 정보를 구한다.
    oWS.utill.fn.getAppDataFromServer = function (oFormData, fn_callback) {

        var sPath = getServerPath() + '/INIT_PRC';

        setBusy('X');

        sendAjax(sPath, oFormData, (oAppInfo) => {

            fn_callback(oAppInfo);

        });

    }; // end of oWS.utill.fn.getAppDataFromServer

    // 15. 새창 띄우기
    oWS.utill.fn.onNewWindow = function (IF_DATA) {

        const WINDOWSTATE = REMOTE.require('electron-window-state');

        // 창 크기 기본값 설정
        let mainWindowState = WINDOWSTATE({
            defaultWidth: 800,
            defaultHeight: 800
        });

        let SESSKEY = getSessionKey(),
            BROWSERKEY = getRandomKey(10);

        let oThemeInfo = getThemeInfo(), // 테마 정보
            sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = JSON.parse(JSON.stringify(oDefaultOption.browserWindow));

        oBrowserOptions.title = "U4A Workspace - #Main";
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.titleBarStyle = 'hidden';
        oBrowserOptions.autoHideMenuBar = true;

        // 브라우저 윈도우 기본 사이즈
        oBrowserOptions.x = mainWindowState.x;
        oBrowserOptions.y = mainWindowState.y;
        oBrowserOptions.width = mainWindowState.width;
        oBrowserOptions.height = mainWindowState.height;
        oBrowserOptions.minWidth = 1000;
        oBrowserOptions.minHeight = 800;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSERKEY;
        oBrowserOptions.webPreferences.USERINFO = process.USERINFO;
        oBrowserOptions.webPreferences.OBJTY = "MAIN";
        oBrowserOptions.webPreferences.SYSID = process.USERINFO.SYSID;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        function lf_setBound() {

            let oBrowserOptions = {};

            var oParentBounds = CURRWIN.getBounds();
            oBrowserOptions.x = oParentBounds.x + 30;
            oBrowserOptions.y = oParentBounds.y + 30;
            oBrowserOptions.width = oParentBounds.width;
            oBrowserOptions.height = oParentBounds.height;

            oBrowserWindow.setBounds(oBrowserOptions);

            oBrowserWindow.setPosition(oBrowserOptions.x, oBrowserOptions.y);

        }

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(parent.getPath("MAINFRAME"));

        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            lf_setBound();

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oSAPServerInfo = getServerInfo();

            var oMetadata = {};
            oMetadata.METADATA      = parent.getMetadata();
            oMetadata.SERVERINFO    = oSAPServerInfo;
            oMetadata.USERINFO      = parent.getUserInfo();
            oMetadata.SESSIONKEY    = SESSKEY;
            oMetadata.BROWSERKEY    = BROWSERKEY;
            oMetadata.EXEPAGE       = "WS10";
            oMetadata.DEFBR         = parent.getDefaultBrowserInfo();
            oMetadata.THEMEINFO     = parent.getThemeInfo();
            oMetadata.BeforeServerInfo = parent.getBeforeServerInfo();

            // 새창 띄운 후 추가 파라미터
            oMetadata.IF_DATA = IF_DATA;

            // 브라우저가 오픈되면서 부모가 가지고 있는 메타 관련 정보들을 전달한다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);
            
            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            // WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치에서 우측 + 30, 하단 + 30 위치에 배치한다.
            lf_setBound();

            // 새창 띄울때 파라미터 중 20번페이지로 이동일 경우에는 브라우저 opacity를 0으로 한다.
            // 추후 새창 뜨고 나서 20번으로 넘어갈때 opacity를 줄 목적임
            if(IF_DATA && IF_DATA.ACTCD === "VMS_MOVE20"){

                oBrowserWindow.show();
                
                return;
            }

            oBrowserWindow.setOpacity(1.0);

            oBrowserWindow.show();

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;

            // if (oWS.utill.attr.oBusyIndicator) {
            //     oWS.utill.attr.oBusyIndicator.close();
            //     delete oWS.utill.attr.oBusyIndicator;
            // }

        });

    };

    /** 
     * 16. 새창 띄울때 현재 세션 추가하기
     * @param {*} TYPE
     *  - A : +
     *  - D : -  
     */
    oWS.utill.fn.setSessionCount = function (TYPE) {
        return;

        var sFoldPath = PATH.join(__dirname, '../conf/'),
            sConfPath = PATH.join(__dirname, '../conf/conf.json');

        // Session 갯수 관련 conf.json 파일이 있으면 해당 필드에 세션 Count (자주 수행될 로직)
        if (FS.existsSync(sFoldPath) && FS.existsSync(sConfPath)) {

            var sSessionDataJSON = FS.readFileSync(sConfPath, 'utf-8'),
                oSessionData = JSON.parse(sSessionDataJSON);

            /**
             * TYPE
             * - A : +,
             * - D : -
             */
            if (TYPE == "A") {

                if (oSessionData.sessionCnt >= 6) {
                    return false;

                }

                ++oSessionData.sessionCnt;

            } else {
                --oSessionData.sessionCnt;
            }

            //showMessage(null, 99, "E", oSessionData.sessionCnt + "");

            FS.writeFileSync(sConfPath, JSON.stringify(oSessionData), {
                encoding: "utf8"
            });

            return true;

        }

        // conf 폴더가 없으면 폴더를 생성한다.
        if (!FS.existsSync(sFoldPath)) {
            FS.mkdirSync(sFoldPath);
        }

        // 세션 갯수 초기값
        var oConf = {
            sessionCnt: 1,
        },

            oConfJson = JSON.stringify(oConf);

        // conf 폴더가 있는데 JSON 파일이 없으면 세션 갯수 정보를 생성하여 JSON 파일로 저장한다.
        if (!FS.existsSync(sConfPath)) {

            /* 파일 디렉토리에 파일 생성 */
            FS.writeFileSync(sConfPath, oConfJson, {
                encoding: "utf8"
            });
            return true;

        }

    };

    // // 17. error page 호출
    // oWS.utill.fn.setErrorPage = (sErrMsg) => {

    //     oWS.utill.attr.sErrorMsg = sErrMsg;

    //     onMoveToPage("ERRORPAGE");

    // };

    // 18. error message 가져오기
    oWS.utill.fn.getErrorMsg = () => {

        if (!oWS.utill.attr.sErrorMsg) {
            return;
        }

        var sErrorMsg = oWS.utill.attr.sErrorMsg;

        delete oWS.utill.attr.sErrorMsg;

        return sErrorMsg;

    };

    // [원본]
    // // 19. Busy Indicator 실행
    // oWS.utill.fn.setBusy = (sIsbusy) => {

    //     // ws config를 구한다.
    //     var oWsConfInfo = getWsConfigInfo(),
    //         sBusyType = oWsConfInfo.BUSYTYPE,

    //         bIsBusy = (sIsbusy == "X" ? true : false);

    //     // 현재 Busy Indicator 상태정보를 글로벌 변수에 저장한다.
    //     oWS.utill.attr.isBusy = sIsbusy;

    //     if (oWS.utill.attr.sap) {
    //         if (bIsBusy) {
    //             oWS.utill.attr.sap.ui.getCore().lock();
    //         } else {
    //             oWS.utill.attr.sap.ui.getCore().unlock();
    //         }
    //     }

    //     // Cursor Focus Handle
    //     if (bIsBusy) {

    //         if (document.activeElement && document.activeElement.blur) {
    //             oWS.utill.attr.beforeActiveElement = document.activeElement;
    //             document.activeElement.blur();
    //         }

    //     } else {

    //         if (oWS.utill.attr.beforeActiveElement) {

    //             oWS.utill.attr.beforeActiveElement.focus();

    //             delete oWS.utill.attr.beforeActiveElement;

    //         }

    //     }

    //     // 작업표시줄에 ProgressBar 실행
    //     setProgressBar("S", bIsBusy);

    //     switch (sBusyType) {
    //         case "01": // UI5 Style
    //             lf_type01(bIsBusy);
    //             break;
    //     }

    //     function lf_type01(bIsBusy) {

    //         var oBusy = document.getElementById("u4aWsBusyIndicator");

    //         if (!oBusy) {
    //             return;
    //         }

    //         if (bIsBusy) {
    //             oBusy.style.visibility = "visible";
    //         } else {
    //             oBusy.style.visibility = "hidden";
    //         }

    //     }

    // }; // end of oWS.utill.fn.setBusy

    // // 19. Busy Indicator 실행
    // // - 파라미터에 Option이 존재할 경우는 busyDialog로 호출함
    // oWS.utill.fn.setBusy = (sIsbusy, oOptions) => {

    //     // 파라미터에 옵션을 추가했을 경우는 BusyDialog로 호출함!!
    //     if(typeof oOptions === "object"){
    //         oWS.utill.fn.setBusyDialog(sIsbusy, oOptions);
    //         return;
    //     }

    //     var bIsBusy = (sIsbusy === "X" ? true : false);

    //     // 실행 즉시 lock을 건다
    //     if (oWS.utill.attr.sap) {
    //         if (bIsBusy) {
    //             oWS.utill.attr.sap.ui.getCore().lock();
               
    //         } else {
    //             oWS.utill.attr.sap.ui.getCore().unlock();
    //         }
    //     }

    //     // Cursor Focus Handle
    //     if (bIsBusy) {

    //         // var _oBeforeActiveElement = document.activeElement || undefined;

    //         var _oBeforeActiveElement = (typeof ws_frame === "object" && ws_frame?.document?.activeElement) || undefined;

    //         if (_oBeforeActiveElement && typeof _oBeforeActiveElement?.blur !== "undefined") {

    //             //마지막 포커스 위치 전역화 
    //             oWS.utill.attr.beforeActiveElement = _oBeforeActiveElement;

    //             //이전 포커스 제거
    //             _oBeforeActiveElement.blur();

    //         }

    //     } else {

    //         //이전 등록된 위치정보가 존재시 
    //         if (typeof oWS?.utill?.attr?.beforeActiveElement?.focus !== "undefined") {

    //             oWS.utill.attr.beforeActiveElement.focus();

    //             delete oWS.utill.attr.beforeActiveElement;

    //         }

    //     }

    //     // Busy Indicator dom
    //     var oBusy = oWS.utill.attr.oBusyDom;
        
    //     setTimeout(() => {
            
    //         if (bIsBusy) {
    //             oBusy.style.visibility = "visible";
    //         } else {
    //             oBusy.style.visibility = "hidden";    
    //         }
    
    //         oWS.utill.attr.isBusy = "";
    
    //         if(oBusy.style.visibility === "visible"){
    //             oWS.utill.attr.isBusy = "X";       
    
    //         }

    //     }, 0);

    //     // 작업표시줄에 ProgressBar 실행
    //     setProgressBar("S", bIsBusy);

    // }; // end of oWS.utill.fn.setBusy

    // 메인 브라우저 닫기 버튼 활성/비활성
    oWS.utill.fn.setMainCloseBtnDisabled = function(sIsEnabled){
    // oWS.utill.fn.setMainCloseBtnEnabled = function(sIsEnabled){

        if(!oWS.utill.attr.sap){
            return;
        }

        // 메인 브라우저 닫기 버튼
        let _oMainCloseBtn = oWS.utill.attr.sap.ui.getCore().byId("mainWinClose");

        if(sIsEnabled === "X"){

            _oMainCloseBtn.setEnabled(false);

            return;
        }

        _oMainCloseBtn.setEnabled(true);

    };

    // 19. Busy Indicator 실행
    oWS.utill.fn.setBusy = (sIsbusy) => {        

        debugger;
        
        oWS.utill.attr.isBusy = sIsbusy;       

        var bIsBusy = (sIsbusy === "X" ? true : false);
    
        // 실행 즉시 lock을 건다
        if (oWS.utill.attr.sap) {
            if (bIsBusy) {
                oWS.utill.attr.sap.ui.getCore().lock();
    
            } else {
                oWS.utill.attr.sap.ui.getCore().unlock();
            }
        }

        // Cursor Focus Handle
        if (bIsBusy) {
    
            var _oBeforeActiveElement = (typeof ws_frame === "object" && ws_frame?.document?.activeElement) || undefined;
    
            if (_oBeforeActiveElement && typeof _oBeforeActiveElement?.blur !== "undefined") {
    
                //마지막 포커스 위치 전역화 
                oWS.utill.attr.beforeActiveElement = _oBeforeActiveElement;
    
                //이전 포커스 제거
                _oBeforeActiveElement.blur();
    
            }
    
        } else {
    
            //이전 등록된 위치정보가 존재시 
            if (typeof oWS?.utill?.attr?.beforeActiveElement?.focus !== "undefined") {
    
                oWS.utill.attr.beforeActiveElement.focus();
    
                delete oWS.utill.attr.beforeActiveElement;
    
            }
    
        }        
    
        // Busy Indicator dom
        var oBusy = oWS.utill.attr.oBusyDom;
    
        setTimeout(function(){

            if (bIsBusy) {
                
                oBusy.style.visibility = "visible";
                
                // 메인 브라우저 닫기 버튼 비활성
                oWS.utill.fn.setMainCloseBtnDisabled("X");

            } else {

                oBusy.style.visibility = "hidden";    

                // 메인 브라우저 닫기 버튼 활성
                oWS.utill.fn.setMainCloseBtnDisabled("");

            }
    
            // oWS.utill.attr.isBusy = "";
    
            // if(oBusy.style.visibility === "visible"){
            //     oWS.utill.attr.isBusy = "X";
            // }
    
        }, 0);
    
        // 작업표시줄에 ProgressBar 실행
        setProgressBar("S", bIsBusy);
    
    }; // end of oWS.utill.fn.setBusy


    /**********************************************************
     * 공통 Busy Dialog 
     **********************************************************
     * @param {Char1} bIsBusy 
     *  - "X" : busy 실행
     *  - ""  : busy 종료
     * 
     * @param {Object} oOptions 
     * {
     *    TITLE: "",   // 제목
     *    DESC : ""    // 내역
     * }
     **********************************************************/
     oWS.utill.fn.setBusyDialog = function(sIsbusy, oOptions){

        if(!oWS.utill.attr.sap){
            return;
        }

        var bIsBusy = (sIsbusy === "X" ? true : false);

        // 실행 즉시 lock을 건다        
        if (bIsBusy) {
            oWS.utill.attr.sap.ui.getCore().lock();            
        }        

        // Cursor Focus Handle
        if (bIsBusy) {

            var _oBeforeActiveElement = document.activeElement || undefined;

            if (_oBeforeActiveElement && typeof _oBeforeActiveElement?.blur !== "undefined") {

                //마지막 포커스 위치 전역화 
                oWS.utill.attr.beforeActiveElement = _oBeforeActiveElement;

                //이전 포커스 제거
                _oBeforeActiveElement.blur();

            }

        } else {

            //이전 등록된 위치정보가 존재시 
            if (typeof oWS?.utill?.attr?.beforeActiveElement?.focus !== "undefined") {

                oWS.utill.attr.beforeActiveElement.focus();

                delete oWS.utill.attr.beforeActiveElement;

            }

        }

        // // Busy를 켰을 경우
        // if(bIsBusy){

        //     // 메인 브라우저 닫기 버튼 비활성
        //     oWS.utill.fn.setMainCloseBtnDisabled("X");         
         
        //     let sDefTitle = "";
        //     let sDefDesc  = "please wait a minute..";

        //     let sTitle = sDefTitle;
        //     let sDesc  = sDefDesc;

        //     // 옵션값이 있을 경우 
        //     if(typeof oOptions === "object"){
        //         sTitle = oOptions.TITLE || sDefTitle;
        //         sDesc  = oOptions.DESC  || sDefDesc;
        //     }         

        //     // BusyDialog가 없으면 신규 생성
        //     if(!oWS.utill.attr.oBusyDlg){

        //         oWS.utill.attr.oBusyDlg = new oWS.utill.attr.sap.m.BusyDialog();

        //         // CustomData에 MUTATION_EXCEP을 주는 이유?
        //         // Mutation이 화면에 dialog 류 들이 감지되면 현재 떠있는 자식 윈도우를 활성 or 비활성 하는데,
        //         // 특정 Dialog는 Mutation 감지 대상에서 제외시키고자 할 때
        //         // Dialog Object에 CustomData로 구분함
        //         oWS.utill.attr.oBusyDlg._oDialog.data("MUTATION_EXCEP", "X");

        //     }

        //     let oBusyDlg = oWS.utill.attr.oBusyDlg;

        //     oBusyDlg.setTitle(sTitle);
        //     oBusyDlg.setText(sDesc);

        //     // Busy Dialog가 open되지 않았을 경우 오픈시킨다.
        //     if(oBusyDlg?._oDialog?.isOpen() === false){
        //         oBusyDlg.open();
        //     }

        // } else {

        //     // 메인 브라우저 닫기 버튼 활성
        //     oWS.utill.fn.setMainCloseBtnDisabled("");

        //     if(oWS.utill.attr.oBusyDlg){
                
        //         oWS.utill.attr.oBusyDlg.destroy();

        //         delete oWS.utill.attr.oBusyDlg;
    
        //         oWS.utill.attr.sap.ui.getCore().unlock();

        //     }            

        // }

        /**
         * "setBusy" function에서 Busy를 키고 끌 때, 메인 화면 상단의 "X" 버튼 활성, 비활성화 처리를
         * setTimeout에서 실행하여, BusyDialog에서도 동일하게 setTimeout으로 해야
         * busy와 busyDialog를 동시에 실행해도 sync가 깨지지 않음.
         * 
         * 예) 아래의 두개의 소스를 동시에 실행
         * 1. setBusy("");                         <---- 메인 화면 상단의 "X" 버튼 활성 비활성을 setTimeout에서 수행
         * 2. setBusy("X", { DESC:"loading.."});   <---- 메인 화면 상단의 "X" 버튼 활성 비활성을 동기로 수행
         * 
         * 동기로 수행한 2번째 로직에서는 "X"로 BusyDialog를 실행했는데,
         * 비동기로 수행한 1번째 로직이 setTimeout으로 비동기 동작을 하여,
         * 수행은 1 => 2의 순서로 수행했지만, 1번이 비동기라 2번 수행 후 1번이 타는 현상.
         */
        setTimeout(function(){

            // Busy를 켰을 경우
            if(bIsBusy){

                // 메인 브라우저 닫기 버튼 비활성
                oWS.utill.fn.setMainCloseBtnDisabled("X");         
            
                let sDefTitle = "";
                let sDefDesc  = "please wait a minute..";

                let sTitle = sDefTitle;
                let sDesc  = sDefDesc;

                // 옵션값이 있을 경우 
                if(typeof oOptions === "object"){
                    sTitle = oOptions.TITLE || sDefTitle;
                    sDesc  = oOptions.DESC  || sDefDesc;
                }         

                // BusyDialog가 없으면 신규 생성
                if(!oWS.utill.attr.oBusyDlg){

                    oWS.utill.attr.oBusyDlg = new oWS.utill.attr.sap.m.BusyDialog();

                    // CustomData에 MUTATION_EXCEP을 주는 이유?
                    // Mutation이 화면에 dialog 류 들이 감지되면 현재 떠있는 자식 윈도우를 활성 or 비활성 하는데,
                    // 특정 Dialog는 Mutation 감지 대상에서 제외시키고자 할 때
                    // Dialog Object에 CustomData로 구분함
                    oWS.utill.attr.oBusyDlg._oDialog.data("MUTATION_EXCEP", "X");

                }

                let oBusyDlg = oWS.utill.attr.oBusyDlg;

                oBusyDlg.setTitle(sTitle);
                oBusyDlg.setText(sDesc);

                // Busy Dialog가 open되지 않았을 경우 오픈시킨다.
                if(oBusyDlg?._oDialog?.isOpen() === false){
                    oBusyDlg.open();
                }

            } else {

                // 메인 브라우저 닫기 버튼 활성
                oWS.utill.fn.setMainCloseBtnDisabled("");

                if(oWS.utill.attr.oBusyDlg){
                    
                    oWS.utill.attr.oBusyDlg.destroy();

                    delete oWS.utill.attr.oBusyDlg;
        
                    oWS.utill.attr.sap.ui.getCore().unlock();

                }            

            }

        }, 0);

        // 작업표시줄에 ProgressBar 실행
        setProgressBar("S", bIsBusy);

    }; // end of oWS.utill.fn.setBusyDialog

    // oWS.utill.fn.setBusyDialog = function(sIsbusy, oOptions){

    //     if(!oWS.utill.attr.sap){
    //         return;
    //     }

    //     var bIsBusy = (sIsbusy === "X" ? true : false);

    //     // 실행 즉시 lock을 건다        
    //     if (bIsBusy) {
    //         oWS.utill.attr.sap.ui.getCore().lock();            
    //     }        

    //     // Cursor Focus Handle
    //     if (bIsBusy) {

    //         var _oBeforeActiveElement = document.activeElement || undefined;

    //         if (_oBeforeActiveElement && typeof _oBeforeActiveElement?.blur !== "undefined") {

    //             //마지막 포커스 위치 전역화 
    //             oWS.utill.attr.beforeActiveElement = _oBeforeActiveElement;

    //             //이전 포커스 제거
    //             _oBeforeActiveElement.blur();

    //         }

    //     } else {

    //         //이전 등록된 위치정보가 존재시 
    //         if (typeof oWS?.utill?.attr?.beforeActiveElement?.focus !== "undefined") {

    //             oWS.utill.attr.beforeActiveElement.focus();

    //             delete oWS.utill.attr.beforeActiveElement;

    //         }

    //     }

    //     // let aa = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "392", "", "", "", ""); // 잠시만 기다려 주세요.,  //350
    //     // console.log(aa);

    //     let sDefTitle = "";
    //     let sDefDesc  = "please wait a minute..";

    //     let sTitle = sDefTitle;
    //     let sDesc  = sDefDesc;

    //     // 옵션값이 있을 경우 
    //     if(typeof oOptions === "object"){
    //         sTitle = oOptions.TITLE || sDefTitle;
    //         sDesc  = oOptions.DESC  || sDefDesc;
    //     }

    //     // Busy를 켰을 경우
    //     if(bIsBusy){

    //         // BusyDialog가 없으면 신규 생성
    //         if(!oWS.utill.attr.oBusyDlg){

    //             oWS.utill.attr.oBusyDlg = new oWS.utill.attr.sap.m.BusyDialog();

    //             // CustomData에 MUTATION_EXCEP을 주는 이유?
    //             // Mutation이 화면에 dialog 류 들이 감지되면 현재 떠있는 자식 윈도우를 활성 or 비활성 하는데,
    //             // 특정 Dialog는 Mutation 감지 대상에서 제외시키고자 할 때
    //             // Dialog Object에 CustomData로 구분함
    //             oWS.utill.attr.oBusyDlg._oDialog.data("MUTATION_EXCEP", "X");

    //         }

    //         let oBusyDlg = oWS.utill.attr.oBusyDlg;

    //         oBusyDlg.setTitle(sTitle);
    //         oBusyDlg.setText(sDesc);

    //         // Busy Dialog가 open되지 않았을 경우 오픈시킨다.
    //         if(oBusyDlg?._oDialog?.isOpen() === false){
    //             oBusyDlg.open();
    //         }

    //     } else {

    //         if(oWS.utill.attr.oBusyDlg){
                
    //             oWS.utill.attr.oBusyDlg.destroy();

    //             delete oWS.utill.attr.oBusyDlg;
    
    //             oWS.utill.attr.sap.ui.getCore().unlock();

    //         }            

    //     }

    //     // 작업표시줄에 ProgressBar 실행
    //     setProgressBar("S", bIsBusy);

    // }; // end of oWS.utill.fn.setBusyDialog    

    // 현재 Busy Indicator 상태를 리턴해준다.
    oWS.utill.fn.getBusy = function () {
        return oWS.utill.attr.isBusy;
    };

    // 20. Page Loading 실행
    oWS.utill.fn.showLoadingPage = function (bIsShow) {

        var oLoadPg = document.getElementById("u4a_main_load");
        if (!oLoadPg) {
            return;
        }

        if (bIsShow == 'X') {
            oLoadPg.style.background = "linear-gradient(to right, #1c2228, #1c2228)";
            oLoadPg.classList.remove("u4a_loadersInactive");

        } else {

            // oLoadPg.style.background = "";
            oLoadPg.classList.add("u4a_loadersInactive");
        }

    };

    // 21. 에디터 정보 저장
    oWS.utill.fn.setWsConfigInfo = (oWsConfInfo) => {
        oWS.utill.attr.oWsConfInfo = Object.assign(oWS.utill.attr.oWsConfInfo, oWsConfInfo);
    };

    // 22. 에디터 정보 구하기
    oWS.utill.fn.getWsConfigInfo = () => {

        if (!oWS.utill.attr.oWsConfInfo) {
            return;
        }

        return oWS.utill.attr.oWsConfInfo;

    };

    // 23. sap sound
    oWS.utill.fn.setSoundMsg = (TYPE) => {
        
        // 글로벌 사운드 설정값이 X 일 경우에만 수행
        let oSettingInfo = WSUTIL.getWsSettingsInfo();
        if(oSettingInfo.globalSound !== "X"){
            return;
        }

        // var oAudio = new Audio(),
        let oAudio = document.getElementById("u4aWsAudio");
        let sSoundRootPath = PATH.join(APPPATH, "sound", "sap");
        let sAudioPath = "";

        switch (TYPE) {
            case "01": // active
                sAudioPath = PATH.join(sSoundRootPath, 'sapmsg.wav');
                break;

            case "02": // error
                sAudioPath = PATH.join(sSoundRootPath, 'saperror.wav');
                break;

            case "WELCOME": 

                // 웰컴 사운드 경로를 구한다.
                sAudioPath = _getWelComeSoundPath();

                break;

            // case "WELCOME": 
            //     sAudioPath = PATH.join(sSoundRootPath, 'greeting_1.wav');
            //     break;

            // case "WELCOME_KO": 
            //     sAudioPath = PATH.join(sSoundRootPath, 'WELCOME_KO.wav');
            //     break;
            
            // case "WELCOME_KO": 
            //     sAudioPath = PATH.join(sSoundRootPath, 'WELCOME_EN.wav');
            //     break;

        }

        // 실행 중이면 리턴.
        if (!oAudio.paused) {
            return;
        }

        oAudio.src = "";
        oAudio.src = sAudioPath;
        oAudio.play();

    };

    // 24. Login 유저 정보 저장 
    oWS.utill.fn.setUserInfo = (oUserInfo) => {

        if (oWS.utill.attr.oUserInfo) {
            delete oWS.utill.attr.oUserInfo;
        }

        oWS.utill.attr.oUserInfo = oUserInfo;

        IPCRENDERER.send("if-test-user", oUserInfo);

    };

    // 25. Login 유저 정보 구하기
    oWS.utill.fn.getUserInfo = () => {

        if (!oWS.utill.attr.oUserInfo) {
            return;
        }

        return oWS.utill.attr.oUserInfo;

    };

    // 27. random Key
    oWS.utill.fn.getRandomKey = (iLenth) => {
        if (iLenth) {
            return RANDOM.generate(iLenth);
        }
        return RANDOM.generate(40);
    };

    // 28. SSID Setting
    oWS.utill.fn.setSSID = (SSID) => {

        if (oWS.utill.attr.SSID) {
            delete oWS.utill.attr.SSID;
        }

        oWS.utill.attr.SSID = SSID;

    };

    // 29. SSID 구하기
    oWS.utill.fn.getSSID = () => {

        if (typeof oWS.utill.attr.SSID === "undefined") {
            return "";
        }

        return oWS.utill.attr.SSID;
    };

    // 30. Browser Session Key를 구한다.
    oWS.utill.fn.getSessionKey = () => {
        return oWS.utill.attr.sessionkey;
    };

    // 31. Browser Session Key를 설정한다.
    oWS.utill.fn.setSessionKey = (sSessKey) => {
        oWS.utill.attr.sessionkey = sSessKey;
    }

    // 32. Browser 개별 key를 구한다.
    oWS.utill.fn.getBrowserKey = () => {
        return oWS.utill.attr.browserkey;
    }

    // 33. Browser 개별 key를 설정한다.
    oWS.utill.fn.setBrowserKey = (sBrowserKey) => {
        oWS.utill.attr.browserkey = sBrowserKey;
    }

    // // 31. 메시지 번호에 맞는 메시지 내용을 구한다.
    // oWS.utill.fn.getMessage = (MSGKY) => {

    //     var aMsg = oWS.utill.attr.aMsgTxt,

    //         iMsgLen = aMsg.length;

    //     for (var i = 0; i < iMsgLen; i++) {

    //         var oMsg = aMsg[i];

    //         if (oMsg.NUM != MSGKY) {
    //             continue;
    //         }

    //         return oMsg.MSG;

    //     }

    // };

    // // 34. 어플리케이션 실행 URL 리턴
    // oWS.utill.fn.getAppExePath = () => {

    //     var oServerInfo = oWS.oServerInfo,
    //         sServerUrl = oServerInfo.SERVERIP,
    //         sInstanceNo = oServerInfo.INSTANCENO,
    //         sServicePath = "http://" + sServerUrl + ":80" + sInstanceNo + "/zu4a";

    //     return sServicePath;

    // };

    // 35. Default Browser 정보 리턴
    oWS.utill.fn.getDefaultBrowserInfo = () => {
        return oWS.utill.attr.aDefaultBrowsInfo;
    };

    // 36. Default Browser 정보 저장
    oWS.utill.fn.setDefaultBrowserInfo = (aDefaultBrowsInfo) => {

        if (oWS.utill.attr.aDefaultBrowsInfo.length != 0) {
            oWS.utill.attr.aDefaultBrowsInfo = [];
        }

        oWS.utill.attr.aDefaultBrowsInfo = aDefaultBrowsInfo;

    };

    // 37. 메타 정보 세팅
    oWS.utill.fn.setMetadata = (METADATA) => {

        if (oWS.utill.attr.METADATA) {
            delete oWS.utill.attr.METADATA;
        }

        oWS.utill.attr.METADATA = METADATA;

    };

    // 38. 메타 정보 구하기
    oWS.utill.fn.getMetadata = () => {

        if (!oWS.utill.attr.METADATA) {
            return;
        }

        return oWS.utill.attr.METADATA;

    };

    // 39. 네트워크 상태에 따른 Busy Indicator 실행 메소드
    oWS.utill.fn.setNetworkBusy = (bIsBusy, iZindex) => {

        var oNetBusy = document.getElementById("u4a_neterr");
        if (!oNetBusy) {
            return;
        }

        oNetBusy.classList.add("u4a_neterrInactive");

        if (bIsBusy) {

            setTimeout(() => {
                oNetBusy.focus();
            }, 0);

            oNetBusy.classList.remove("u4a_neterrInactive");
            oNetBusy.style.zIndex = iZindex ? iZindex : 999999;
            return;
        }

    };

})(oWS);

/**
 *  Electron Event 
 */

// 전달받은 Meta 정보를 저장한다.
IPCRENDERER.on('if-meta-info', (event, res) => {

    var oMetadata = res;

    // 메타데이터 정보
    if (oMetadata.METADATA) {
        setMetadata(oMetadata.METADATA);
    }

    // Default Browser 정보
    if (oMetadata.DEFBR) {
        parent.setDefaultBrowserInfo(oMetadata.DEFBR);
    }

    // 서버 정보
    if (oMetadata.SERVERINFO) {
        oWS.oServerInfo = oMetadata.SERVERINFO;
    }

    // 이전 서버 접속 정보
    if (oMetadata.BeforeServerInfo) {
        parent.setBeforeServerInfo(oMetadata.BeforeServerInfo);
    }

    // 로그인 유저 정보
    if (oMetadata.USERINFO) {
        setUserInfo(oMetadata.USERINFO);
    }

    // 브라우저 세션 키 정보
    if (oMetadata.SESSIONKEY) {
        setSessionKey(oMetadata.SESSIONKEY);
    }

    // 브라우저 키 정보
    if (oMetadata.BROWSERKEY) {
        setBrowserKey(oMetadata.BROWSERKEY);
    }

    // 이동할 페이지
    if (oMetadata.EXEPAGE) {
        onMoveToPage(oMetadata.EXEPAGE);
    }

    // 테마정보
    if (oMetadata.THEMEINFO) {
        setThemeInfo(oMetadata.THEMEINFO);
    }

    // 새창 실행 후 IF 데이터가 있을 경우
    if(oMetadata.IF_DATA){
        setNewBrowserIF_DATA(oMetadata.IF_DATA);
    }

    // 새창일 경우 process object에 USERINFO 정보를 저장한다.
    const
        CURRWIN = REMOTE.getCurrentWindow(),
        WEBCON = CURRWIN.webContents,
        WEBPREF = WEBCON.getWebPreferences(),
        USERINFO = WEBPREF.USERINFO;

    if (USERINFO) {
        // 새창 띄울 경우 process 
        setProcessEnvUserInfo(USERINFO);
    }

    // 타이틀 설정
    CURRWIN.setTitle("U4A Workspace - #Main");

});

window.onload = function () {
    showLoadingPage('');
};