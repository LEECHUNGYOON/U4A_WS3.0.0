/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_main.js
 * - file Desc : ws 메인 
 ************************************************************************/

(function (window, oAPP) {
    "use strict";

    var APPCOMMON = oAPP.common;

    /**************************************************************************
     * 공통 인스턴스 정의
     **************************************************************************/
    oAPP.main.fnPredefineGlobalObject = function () {

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
    oAPP.main.fnOnLoadMessageClass = function () {

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
    oAPP.main.fnOnInitModelBinding = function () {

        // ModelData
        var oMetaData = {
            METADATA: parent.getMetadata(),
            USERINFO: parent.getUserInfo(),
            SUGG: {
                TCODE: []
            },
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
    oAPP.main.fnBeforeunload = function (isClearStorage) {

        // 설정된 Global Shortcut 단축키 삭제
        oAPP.common.fnRemoveGlobalShortcut();

        var oPowerMonitor = parent.POWERMONITOR;

        // 대기모드로 전환 감지 이벤트 해제
        oPowerMonitor.removeListener('lock-screen', oAPP.fn.fnAttachPowerMonitorLockScreen);

        oPowerMonitor.removeListener('unlock-screen', oAPP.fn.fnAttachPowerMonitorUnLockScreen);

        // IPCMAIN 이벤트 해제
        oAPP.fn.fnIpcMain_Detach_Event_Handler();

        // Application 정보를 구한다.
        var oAppInfo = parent.getAppInfo(),
            SSID = parent.getSSID();

        // 20번 페이지 일 경우
        var sPath = parent.getServerPath() + '/kill_session',
            oFormData = new FormData();

        // Edit 모드 였을 경우 Lock 해제 하고 세션 죽인다.
        if (oAppInfo && oAppInfo.IS_EDIT == "X") {

            oFormData.append("APPID", oAppInfo.APPID);
            oFormData.append("SSID", SSID);

            var oOptions = {
                URL: sPath,
                FORMDATA: oFormData
            };

            sendServerExit(oOptions, () => {

                if (isClearStorage == "X") {
                    oAPP.fn.fnClearSessionStorageData(); // #[ws_fn_04.js]
                }

                window.onbeforeunload = () => {};

                top.window.close();

            });

            return;

        }

        oFormData.append("SSID", SSID);

        var oOptions = {
            URL: sPath,
            FORMDATA: oFormData
        };

        sendServerExit(oOptions, () => {

            // 브라우저에 내장된 세션 정보를 클리어 한다.
            if (isClearStorage == "X") {
                oAPP.fn.fnClearSessionStorageData(); // #[ws_fn_04.js]
            }

            window.onbeforeunload = () => {};

            top.window.close();

        });

    }; // end of oAPP.main.fnBeforeunload

    oAPP.main.fnDetachBeforeunloadEvent = () => {

        window.onbeforeunload = () => {};

    };

    // Test..
    oAPP.main.fnSetLanguage = function () {

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

    // Drag End Event
    oAPP.main.onDragend = () => {

        // 20번 페이지 Design영역, Attribute 영역 잔상 제거
        oAPP.fn.ClearDropEffect();

        // 미리보기쪽 잔상 제거
        if (oAPP.attr.ui &&
            oAPP.attr.ui.frame &&
            oAPP.attr.ui.frame.contentWindow &&
            oAPP.attr.ui.frame.contentWindow.prevClearDropEffect) {

            oAPP.attr.ui.frame.contentWindow.prevClearDropEffect();

        }

        parent.IPCRENDERER.send("if-Dialog-dragEnd");

    }; // end of oAPP.main.onDragend

    /************************************************************************
     *--------------------------[ U4A WS Start ] ----------------------------
     ************************************************************************/
    oAPP.main.fnWsStart = function () {

        sap.ui.getCore().attachInit(function () {

            // 부모에 sap 인스턴스 전달
            parent.oWS.utill.attr.sap = sap;

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

            // APP 전체 대상 글로벌 Shortcut 지정하기
            oAPP.common.fnSetGlobalShortcut();

            // 초기 모델 바인딩
            oAPP.main.fnOnInitModelBinding();

            // 초기 화면 그리기
            oAPP.fn.fnOnInitRendering();

            // 개인화 정보 설정
            oAPP.fn.fnOnInitP13nSettings(); // #[ws_fn_01.js]

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
            oAPP.fn.fnCheckServerHost(); // #[ws_fn_03.js]

            // 공통 IPCMAIN 이벤트 걸기
            oAPP.fn.fnIpcMain_Attach_Event_Handler();


        }); // end of attachInit

        /************************************************************************
         * 네트워크 연결 및 해제 시 발생되는 이벤트
         * **********************************************************************/
        window.addEventListener("online", oAPP.fn.fnNetworkCheckerOnline, false);
        window.addEventListener("offline", oAPP.fn.fnNetworkCheckerOffline, false);

    }; // end of oAPP.main.fnWsStart    

    window.ondragend = (e) => {

        console.log('ondragend');

        oAPP.main.onDragend();

    };

    // 브라우저 닫기, window.close() 실행시 타는 이벤트
    window.onbeforeunload = () => {

        // Logout 메시지가 이미 떠 있다면 창을 못닫게 한다.
        if (oAPP.attr.isBrowserCloseLogoutMsgOpen == 'X') {

            // 네트워크가 차단됐을 경우는 그냥 끈다.            
            if (!oAPP.attr.bIsNwActive) {
                oAPP.main.fnBeforeunload("");
                return;
            }

            return "";
        }

        // 같은 세션의 브라우저 갯수 체크
        var aSameBrowser = oAPP.fn.fnGetSameBrowsers(); // #[ws_fn_02.js]        

        // 같은 세션의 브라우저가 나밖에 없다면
        if (aSameBrowser.length == 0) {

            // 네트워크가 차단됐을 경우는 그냥 끈다.
            if (!oAPP.attr.bIsNwActive) {
                oAPP.main.fnBeforeunload("");
                return;
            }

            // Busy가 켜져 있는 상태에서는 창을 못닫는다.
            if (parent.getBusy() == "X") {
                return;
            }

            // Logout 메시지 Open 여부 Flag
            oAPP.attr.isBrowserCloseLogoutMsgOpen = 'X';

            var sMsg = oAPP.common.fnGetMsgClassTxt("0001"); // "Unsaved data will be lost. \n Do you want to log off?";        

            // 질문 팝업?
            parent.showMessage(sap, 30, 'I', sMsg, lf_MsgCallback);

            return "";

        }

        // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
        // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
        oAPP.main.fnBeforeunload("");

        return "";

    };

    function lf_MsgCallback(sAction) {

        delete oAPP.attr.isBrowserCloseLogoutMsgOpen;

        if (sAction != "YES") {
            return;
        }

        // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
        // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
        oAPP.main.fnBeforeunload('X');

    }








})(window, oAPP);