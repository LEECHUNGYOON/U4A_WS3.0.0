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
    CURRWIN = REMOTE.getCurrentWindow(),
    MIMETYPES = require('mime-types'),
    POWERMONITOR = REMOTE.require('electron').powerMonitor,
    COMPUTERNAME = process.env.COMPUTERNAME,
    WSLOG = require(PATH.join(APPPATH, "ws10_20", "js", "ws_log.js"));

const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);
// REGEDIT.setExternalVBSLocation('resources/regedit/vbs');

// 오디오 자동실행 오류 정책 회피
APP.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

POWERMONITOR.setMaxListeners(100);
IPCMAIN.setMaxListeners(100);

/**
 *  ## oWS WS
 */

var // <-- 여기는 반드시 var로 선언해야함. (let, const는 자식에서 parent로 접근이 안됨.)
    oWS = {};

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

    // 현재 떠있는 새창 갯수
    oWS.utill.attr.aWindowIds = [];

    // 에디터 정보
    oWS.utill.attr.oWsConfInfo = {
        BUSYTYPE: '01',
    };

    // 현재 페이지 정보
    oWS.utill.attr.currPage = "";

    /**
     * ## Function 
     */

    // 1. 메시지 호출
    oWS.utill.fn.showMessage = function (oUI5, KIND, TYPE, MSG, fn_callback) {

        /**
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

        // 메시지가 Array 일 경우 개행 문자를 넣는다.
        var newMsg = "";

        if (MSG instanceof Array) {

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

                        oMsgBoxOpts.title = "Success";

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = "Information";

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = "Warning";

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = "Error";

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

                        oMsgBoxOpts.title = "Success";

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = "Information";

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = "Warning";

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = "Error";

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

                        oMsgBoxOpts.title = "Success";

                        oUI5.m.MessageBox.success(newMsg, oMsgBoxOpts);

                        break;

                    case "I":

                        oMsgBoxOpts.title = "Information";

                        oUI5.m.MessageBox.information(newMsg, oMsgBoxOpts);

                        break;

                    case "W":

                        oMsgBoxOpts.title = "Warning";

                        oUI5.m.MessageBox.warning(newMsg, oMsgBoxOpts);

                        break;

                    case "E":

                        setSoundMsg("02"); // error

                        oMsgBoxOpts.title = "Error";

                        oUI5.m.MessageBox.error(newMsg, oMsgBoxOpts);

                        break;

                }

                break;

            case 99:

                var oCurrView = REMOTE.getCurrentWindow();

                switch (TYPE) {
                    case "I":
                        DIALOG.showMessageBox(oCurrView, {
                            type: "info",
                            title: "U4A Workspace",
                            message: newMsg
                        });
                        break;

                    case "W":
                        DIALOG.showMessageBox(oCurrView, {
                            type: "warning",
                            title: "U4A Workspace",
                            message: newMsg
                        });
                        break;

                    case "E":

                        setSoundMsg("02"); // error  

                        DIALOG.showMessageBox(oCurrView, {
                            type: "error",
                            title: "U4A Workspace",
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
    oWS.utill.fn.getServerPath = function () {

        // if (!oWS.oServerInfo) {
        //     return;
        // }

        // var oServerInfo = oWS.oServerInfo,
        //     sServerUrl = oServerInfo.SERVERIP,
        //     sInstanceNo = oServerInfo.INSTANCENO,
        //     sServicePath = "http://" + sServerUrl + ":80" + sInstanceNo + "/zu4a_wbc/u4a_ipcmain";

        var sServerHost = getServerHost(),
            sServicePath = sServerHost + "/zu4a_wbc/u4a_ipcmain";

        return sServicePath;

    };

    // 4. 서버 호스트를 구한다.
    oWS.utill.fn.getServerHost = function () {

        if (!oWS.oServerInfo) {
            return;
        }

        var oServerInfo = oWS.oServerInfo,
            oMetadata = parent.getMetadata(),
            sInstanceNo = oServerInfo.INSTANCENO,
            sServicePath = "http://" + oServerInfo.SERVERIP + ":80" + sInstanceNo;

        // if (oMetadata.HOST) {
        //     return oMetadata.HOST;
        // }

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

        // // LOGIN 페이지로 이동할 경우 상단 메뉴를 없앤다.
        // var oCurrWin = REMOTE.getCurrentWindow();
        // oCurrWin.setMenuBarVisibility(true);

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

        /**
         * Change or Display,
         * Activate or Inactivate 에 대한 Desc 설정
         */
        if (oAppInfo.IS_EDIT == 'X') {
            oAppInfo.MODETXT = "Change";
        } else {
            oAppInfo.MODETXT = "Display";
        }

        if (oAppInfo.ACTST == "A") {
            oAppInfo.ISACTTXT = "Active";
        } else {
            oAppInfo.ISACTTXT = "Inactive";
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
            // oSAP.ui.getCore().getModel().setProperty("/WS20", oAppInfo);
        }

    };

    // 8. AppID 및 Create, Change, Display 모드 정보 구하기
    oWS.utill.fn.getAppInfo = function () {

        if (!oWS.utill.attr.oAppInfo) {
            return;
        }

        return oWS.utill.attr.oAppInfo;

    };

    // 9. SAP Icon Image Path 만들어주는 function
    oWS.utill.fn.getSapIconPath = function (sIconName) {
        return oWS.utill.attr.paths.SAPICONPATH + sIconName + ".gif";
    };

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

    // // 13. ajax 통신 (FormData, success callback)
    // oWS.utill.fn.sendAjax = function (sPath, oFormData, fn_success) {

    //     // Busy Indicator 실행
    //     setBusy('X');

    //     var xhr = new XMLHttpRequest();
    //     xhr.onreadystatechange = function () { // 요청에 대한 콜백
    //         if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
    //             if (xhr.status === 200 || xhr.status === 201) {

    //                 var oReturn = xhr.responseText;

    //                 if (oReturn == "") {
    //                     oReturn = JSON.stringify({});
    //                 }

    //                 try {

    //                     var oResult = JSON.parse(oReturn);

    //                     fn_success(oResult);

    //                 } catch (e) {

    //                     setErrorPage(oReturn);
    //                     setBusy('');

    //                 }

    //             } else {

    //                 setErrorPage(oReturn);
    //                 setBusy('');

    //             }
    //         }
    //     };

    //     xhr.open('POST', sPath); // 메소드와 주소 설정
    //     xhr.send(oFormData); // 요청 전송 

    // }; // end of oWS.utill.fn.ajax

    // 14. 서버에서 App 정보를 구한다.
    oWS.utill.fn.getAppDataFromServer = function (oFormData, fn_callback) {

        var sPath = getServerPath() + '/INIT_PRC';

        setBusy('X');

        sendAjax(sPath, oFormData, (oAppInfo) => {

            fn_callback(oAppInfo);

        });

    }; // end of oWS.utill.fn.getAppDataFromServer

    // 15. 새창 띄우기
    oWS.utill.fn.onNewWindow = function () {

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
            // oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);
            oBrowserOptions = JSON.parse(JSON.stringify(oDefaultOption.browserWindow));

        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSERKEY;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        // 브라우저 윈도우 기본 사이즈
        oBrowserOptions.x = mainWindowState.x;
        oBrowserOptions.y = mainWindowState.y;
        oBrowserOptions.width = mainWindowState.width;
        oBrowserOptions.height = mainWindowState.height;
        oBrowserOptions.minWidth = 1000;
        oBrowserOptions.minHeight = 800;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        /**
         * ----- test start -----
         */
        function lf_setBound() {

            let oBrowserOptions = {};

            var oParentBounds = CURRWIN.getBounds();
            oBrowserOptions.x = oParentBounds.x + 30;
            oBrowserOptions.y = oParentBounds.y + 30;
            oBrowserOptions.width = oParentBounds.width;
            oBrowserOptions.height = oParentBounds.height;

            oBrowserWindow.setBounds(oBrowserOptions);

        }

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(parent.getPath("MAINFRAME"));

        // oBrowserWindow.webContents.openDevTools();    

        oBrowserWindow.once('ready-to-show', () => {

            console.log('ready-to-show');

            lf_setBound();

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            console.log('did-finish-load');

            var oSAPServerInfo = getServerInfo();

            var oMetadata = {};
            oMetadata.METADATA = parent.getMetadata();
            oMetadata.SERVERINFO = oSAPServerInfo;
            oMetadata.USERINFO = parent.getUserInfo();
            oMetadata.SESSIONKEY = SESSKEY;
            oMetadata.BROWSERKEY = BROWSERKEY;
            oMetadata.EXEPAGE = "WS10";
            oMetadata.DEFBR = parent.getDefaultBrowserInfo();
            oMetadata.THEMEINFO = parent.getThemeInfo();
            oMetadata.BeforeServerInfo = parent.getBeforeServerInfo();

            // 브라우저가 오픈되면서 부모가 가지고 있는 메타 관련 정보들을 전달한다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);

            oBrowserWindow.show();

            oBrowserWindow.setOpacity(1.0);

            lf_setBound();

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;

            if (oWS.utill.attr.oBusyIndicator) {
                oWS.utill.attr.oBusyIndicator.close();
                delete oWS.utill.attr.oBusyIndicator;
            }

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

    // 19. Busy Indicator 실행
    oWS.utill.fn.setBusy = (sIsbusy) => {

        // ws config를 구한다.
        var oWsConfInfo = getWsConfigInfo(),
            sBusyType = oWsConfInfo.BUSYTYPE,

            bIsBusy = (sIsbusy == "X" ? true : false);


        // Cursor Focus Handle
        if (bIsBusy) {

            if (document.activeElement && document.activeElement.blur) {
                oWS.utill.attr.beforeActiveElement = document.activeElement;
                document.activeElement.blur();
            }

        } else {

            if (oWS.utill.attr.beforeActiveElement) {

                oWS.utill.attr.beforeActiveElement.focus();

                delete oWS.utill.attr.beforeActiveElement;

            }

        }

        if (oWS.utill.attr.sap) {
            if (bIsBusy) {
                oWS.utill.attr.sap.ui.getCore().lock();
            } else {
                oWS.utill.attr.sap.ui.getCore().unlock();
            }
        }

        // 현재 Busy Indicator 상태정보를 글로벌 변수에 저장한다.
        oWS.utill.attr.isBusy = sIsbusy;

        // 작업표시줄에 ProgressBar 실행
        setProgressBar("S", bIsBusy);

        switch (sBusyType) {
            case "01": // UI5 Style
                lf_type01(bIsBusy);
                break;
        }

        function lf_type01(bIsBusy) {

            var oBusy = document.getElementById("u4aWsBusyIndicator");

            if (!oBusy) {
                return;
            }

            if (bIsBusy) {
                oBusy.style.visibility = "visible";
            } else {
                oBusy.style.visibility = "hidden";
            }

        }

    }; // end of oWS.utill.fn.setBusy

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

        // var oAudio = new Audio(),
        var oAudio = document.getElementById("u4aWsAudio"),
            sSoundRootPath = PATH.join(__dirname, '../sound/sap/'),
            sAudioPath = "";

        switch (TYPE) {
            case "01": // active
                sAudioPath = PATH.join(sSoundRootPath, 'sapmsg.wav');
                break;

            case "02": // error
                sAudioPath = PATH.join(sSoundRootPath, 'saperror.wav');
                break;

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

    // // 자연스러운 로딩
    // fnOnSmoothLoading();

});

window.onload = function () {
    showLoadingPage('');
};