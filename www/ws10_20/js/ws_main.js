/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_main.js
 * - file Desc : ws 메인 
 ************************************************************************/

(function(window, oAPP) {
    "use strict";

    var APPCOMMON = oAPP.common;

    /**************************************************************************
     * 공통 인스턴스 정의
     **************************************************************************/
    oAPP.main.fnPredefineGlobalObject = function() {

        var oMetaData = parent.getMetadata();

        oAPP.attr.oShortcut = jQuery.extend(true, {}, shortcut);
        oAPP.attr.oServerInfo = parent.getServerInfo(); // 접속 서버 정보
        oAPP.attr.iAppSuggMaxCnt = 20; // WS10 의 APPID Suggestion Max 갯수
        oAPP.attr.iAppNameMaxLength = 15; // WS10 의 어플리케이션명 이름의 Max 길이  
        // oAPP.attr.iSessionTimeout = 1; // 세션타임아웃 시간 (1: 1분)
        oAPP.attr.iSessionTimeout = oMetaData.STIME; // 세션타임아웃 시간 (1: 1분)
        // oAPP.attr.iServerSessionTimeout = oMetaData.STIME - 1; // 서버 세션 타임아웃 시간 (1: 1분)
        oAPP.attr.bIsNwActive = true; // 네트워크 연결 상태 Flag        

    }; // end of fnPredefineGlobalObject  

    /************************************************************************
     * 접속 Language 에 맞는 메시지 텍스트 읽어오기
     ************************************************************************/
    oAPP.main.fnOnLoadMessageClass = function() {

        var FS = parent.FS,
            oUserInfo = parent.getUserInfo();

        var sMsgFileFolderPath = parent.getPath("MSG"),
            sMsgFilePath = sMsgFileFolderPath + "\\" + oUserInfo.LANGU + ".json";

        if (FS.existsSync(sMsgFilePath) == false) {
            return;
        }

        var sMsgData = FS.readFileSync(sMsgFilePath, 'utf-8'),
            oMsgData = JSON.parse(sMsgData);

        oAPP.attr.oMsgClass = oMsgData;

    }; // end of oAPP.main.fnOnLoadMessageClass

    /**************************************************************************
     * [WS10] 모델 데이터 기본세팅
     **************************************************************************/
    oAPP.main.fnGetWs10InitData = () => {

        return {
            APPID: "",
            SRCHTXT: {
                INPUT_VISI: false,
                INPUT_VALUE: "",
                COUNT: ""
            }
        };

    }; // end of oAPP.main.fnGetWs10InitData

    /**************************************************************************
     * [WS20] 모델 데이터 기본세팅
     **************************************************************************/
    oAPP.main.fnGetWs20InitData = () => {

        return {
            SRCHTXT: {
                INPUT_VISI: false,
                INPUT_VALUE: "",
                COUNT: ""
            },
            SIDEMENU: {
                SELKEY: "",
                ITEMS: oAPP.main.fnGetWs20SideMenuItemList(),
                FIXITM: oAPP.main.fnGetWs20SideMenuFixItemList()
            }
        };

    }; // end of oAPP.main.fnGetWs20InitData

    /**************************************************************************
     * U4A WS 메타 정보 구하기
     **************************************************************************/
    oAPP.main.fnOnInitModelBinding = function() {

        // ModelData
        var oMetaData = {
            METADATA: parent.getMetadata(),
            USERINFO: parent.getUserInfo(),
            WMENU: {
                WS10: {},
                WS20: {}
            },
            SETTING: {
                ISPIN: false
            },
            WS10: oAPP.main.fnGetWs10InitData(),
            WS20: oAPP.main.fnGetWs20InitData(),
            FMSG: {
                WS10: {
                    ISSHOW: false,
                    ICONCOLOR: "",
                    TXT: ""
                },
                WS20: {
                    ISSHOW: false,
                    ICONCOLOR: "",
                    TXT: ""
                }
            }

        };

        oAPP.attr.metadata = oMetaData;

        var oModelData = jQuery.extend(true, {}, oMetaData),
            oModel = new sap.ui.model.json.JSONModel();

        oModel.setData(oModelData);

        sap.ui.getCore().setModel(oModel);

    }; // end of oAPP.main.fnOnInitModelBinding    

    /**************************************************************************
     * [WS20] Side Menu List
     **************************************************************************/
    oAPP.main.fnGetWs20SideMenuItemList = () => {

        return [{
            key: "MENUITEM_10",
            icon: "sap-icon://screen-split-three",
            text: "Split Position Change",
            visible: true
        }];
    };

    /**************************************************************************
     * [WS20] Side Fixed Menu List
     **************************************************************************/
    oAPP.main.fnGetWs20SideMenuFixItemList = () => {

        return [{
            key: "FIXITM_10",
            icon: "sap-icon://it-system",
            text: "System Infomation",
            visible: true
        }];

    };

    oAPP.main.fnOnSleep = (ms) => {

        const wakeUpTime = Date.now() + ms;
        while (Date.now() < wakeUpTime) {}

    };

    /************************************************************************
     * window Event Handle ..
     ************************************************************************/
    oAPP.main.fnBeforeunload = function() {

        // 설정된 Global Shortcut 단축키 삭제
        oAPP.common.fnRemoveGlobalShortcut();

        // IPCMAIN 이벤트 해제
        parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

        // EXAM MOVE 이벤트 해제
        parent.IPCMAIN.off('if-exam-move', oAPP.fn.fnIpcMain_if_exam_move);

        var oPowerMonitor = parent.POWERMONITOR;

        // 대기모드로 전환 감지 이벤트 해제
        oPowerMonitor.removeListener('lock-screen', oAPP.fn.fnAttachPowerMonitorLockScreen);

        oPowerMonitor.removeListener('unlock-screen', oAPP.fn.fnAttachPowerMonitorUnLockScreen);

        // 여러창일때 나를 제외한 윈도우를 닫고 싶을때 
        parent.IPCMAIN.off('if-browser-close', oAPP.fn.fnIpcMain_if_browser_close);

        // // 서버 세션 유지 이벤트 전파
        // oAPP.main.fnServerSessionCheckPropagation();

        // Application 정보를 구한다.
        var oAppInfo = parent.getAppInfo();
        var SSID = parent.getSSID();

        // 20번일 경우
        if (oAppInfo) {

            // Edit 모드 였을 경우 Lock 해제 하고 세션 죽인다.
            if (oAppInfo.IS_EDIT == "X") {

                var sPath = parent.getServerPath() + '/kill_session?APPID=' + oAppInfo.APPID + "&SSID=" + SSID;
                navigator.sendBeacon(sPath);

                oAPP.main.fnOnSleep(1000);

                return;

            }

            // Edit 모드가 아니라면 세션만 죽인다.
            var sPath = parent.getServerPath() + '/kill_session?SSID=' + SSID;
            navigator.sendBeacon(sPath);

            oAPP.main.fnOnSleep(1000);

        }

    } // end of oAPP.main.fnBeforeunload

    // /************************************************************************
    //  * 서버 세션 유지 이벤트 전파
    //  ************************************************************************/
    // oAPP.main.fnServerSessionCheckPropagation = function () {

    //     if (!oAPP.attr.serverSessionCheckingMe) {
    //         return;
    //     }

    //     // 현재 브라우저에 설정된 서버 세션 체크 전파 IPC이벤트를 해제한다.
    //     parent.IPCRENDERER.off('if-server-session-propagation', oAPP.fn.fnIpcRender_if_server_session_propagation);

    //     // 브라우저 갯수 체크
    //     var aSameBrowser = oAPP.fn.fnGetSameBrowsers(),
    //         iSameCnt = aSameBrowser.length;

    //     if (iSameCnt <= 0) {
    //         return;
    //     }

    //     var oBrowser = aSameBrowser[0];

    //     oBrowser.webContents.send('if-server-session-propagation', "X");

    // }; // end of oAPP.main.fnServerSessionCheckPropagation

    /************************************************************************
     *--------------------------[ U4A WS Start ] ----------------------------
     ************************************************************************/
    oAPP.main.fnWsStart = function() {

        sap.ui.getCore().attachInit(function() {

            // Register illustration Message Pool
            oAPP.fn.fnRegisterIllustrationPool();

            // 초기 현재 화면 위치 정보 저장
            parent.setCurrPage("WS10");

            // 공통 인스턴스 정의
            oAPP.main.fnPredefineGlobalObject();

            // Test..(UI5 bootstrap tag의 Language 값 설정 테스트)
            oAPP.main.fnSetLanguage();

            // 접속 Language에 맞는 메시지 정보 읽어오기
            oAPP.main.fnOnLoadMessageClass();

            // 브라우저 상단 메뉴를 없앤다.
            parent.setBrowserMenu(null);

            // 브라우저 상단 메뉴 설정
            // oAPP.common.fnOnLoadBrowserMenu("WS10");

            // APP 전체 대상 글로벌 Shortcut 지정하기
            oAPP.common.fnSetGlobalShortcut();

            // 초기 모델 바인딩
            oAPP.main.fnOnInitModelBinding();

            // 초기 화면 그리기
            oAPP.fn.fnOnInitRendering();

            // 개인화 정보 설정
            oAPP.fn.fnOnInitP13nSettings();

            // // 클라이언트 세션 타임아웃 체크
            // oAPP.fn.fnSessionTimeoutCheck();

            // 서버 세션 타임아웃 체크            
            oAPP.fn.fnServerSession();

            // DOM 감지
            oAPP.fn.fnSetMutationObserver();

            // Loading Page
            parent.showLoadingPage('');

            setTimeout(() => {

                $('#content').fadeIn(1000, 'linear');

            }, 100);

            // 서버 호스트 등록 여부 체크
            oAPP.fn.fnCheckServerHost();

            oAPP.fn.fnIpcMain_Attach_if_browser_close();

        }); // end of attachInit

        /************************************************************************
         * 네트워크 연결 및 해제 시 발생되는 이벤트
         * **********************************************************************/
        window.addEventListener("online", oAPP.fn.fnNetworkCheckerOnline, false);
        window.addEventListener("offline", oAPP.fn.fnNetworkCheckerOffline, false);

    }; // end of oAPP.main.fnWsStart

    // Test..
    oAPP.main.fnSetLanguage = function() {

        var oUserInfo = parent.getUserInfo(),
            oMetaScript = document.getElementById("sap-ui-bootstrap");

        if (!oMetaScript) {
            return;
        }

        var sMetaLangu = oMetaScript.getAttribute("data-sap-ui-language");
        if (oUserInfo.LANGU == sMetaLangu) {
            return;
        }

        oMetaScript.setAttribute("data-sap-ui-language", oUserInfo.LANGU);

    };

    window.onbeforeunload = function() {

        var sKey = parent.getSessionKey(),
            oMeBrows = parent.REMOTE.getCurrentWindow(); // 현재 나의 브라우저

        if (oMeBrows.isDestroyed()) {
            return;
        }

        // Logout 버튼으로 Logout을 시도 했다는 Flag
        if (oAPP.attr.isLogoutFromBtn == "X") {
            return "";
        }

        // 세션 타임아웃 팝업이 떠 있다면..
        if (oAPP.attr.isSessTimeOutPopupOpen == 'X') {
            return "";
        }

        // // 세션종료 팝업 케이스..
        // fn();

        // //펑션 우회..
        // function fn() {
        //     window.onbeforeunload = null;

        //     window.close();

        // }

        var aBrowserList = parent.REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowsLen = aBrowserList.length;

        var aSameBrowser = [];
        for (var i = 0; i < iBrowsLen; i++) {

            var oBrows = aBrowserList[i];
            if (oBrows.isDestroyed()) {
                continue;
            }

            var oWebCon = oBrows.webContents;
            if (oWebCon == null) {
                continue;
            }

            var oWebPref = oWebCon.getWebPreferences();

            // session 정보가 없으면 skip.
            var sSessionKey = oWebPref.partition;
            if (!sSessionKey) {
                continue;
            }

            // 브라우저가 내 자신이라면 skip.
            if (oBrows.id == oMeBrows.id) {
                continue;
            }

            // 현재 브라우저의 session key 와 동일하지 않으면 (다른 서버창) skip.
            if (sKey != sSessionKey) {
                continue;
            }

            aSameBrowser.push(oBrows);

        }


        if (aSameBrowser.length == 0) {

            // 브라우저 닫기 클릭해서 발생한 Logout 메시지가 이미 떠 있다면 창을 못닫게 한다.
            if (oAPP.attr.isBrowserCloseLogoutMsgOpen == 'X') {
                return "";
            }

            // 브라우저 닫기 클릭해서 발생한 Logout 메시지 Flag
            oAPP.attr.isBrowserCloseLogoutMsgOpen = 'X';

            var sMsg = oAPP.common.fnGetMsgClassTxt("0001"); // "Unsaved data will be lost. \n Do you want to log off?";        

            // 질문 팝업?
            parent.showMessage(sap, 30, 'I', sMsg, lf_MsgCallback);

            return "";

        }

        function lf_MsgCallback(sAction) {

            delete oAPP.attr.isBrowserCloseLogoutMsgOpen;

            if (sAction != "YES") {
                return;
            }

            oAPP.main.fnBeforeunload();

            // onBeforeunload event 해제
            oAPP.main.fnDetachBeforeunloadEvent();

            if (!oMeBrows.isDestroyed()) {
                oMeBrows.close();
            }

        }

        oAPP.main.fnBeforeunload();

    }

    oAPP.main.fnDetachBeforeunloadEvent = () => {

        window.onbeforeunload = () => {};

    };

})(window, oAPP);