/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_main.js
 * - file Desc : ws 메인 
 ************************************************************************/

(function (window, oAPP) {
    "use strict";

    var APPCOMMON = oAPP.common,
        WSUTIL = parent.WSUTIL;

    /**************************************************************************
     * 공통 인스턴스 정의
     **************************************************************************/
    oAPP.main.fnPredefineGlobalObject = function () {

        let oMetaData = parent.getMetadata();

        oAPP.attr.oShortcut = jQuery.extend(true, {}, shortcut);
        oAPP.attr.oServerInfo = parent.getServerInfo(); // 접속 서버 정보
        oAPP.attr.iAppSuggMaxCnt = 20; // WS10 의 APPID Suggestion Max 갯수
        oAPP.attr.iAppNameMaxLength = 15; // WS10 의 어플리케이션명 이름의 Max 길이  
        // oAPP.attr.iSessionTimeout = 0.5; // 세션타임아웃 시간 (1: 1분)
        oAPP.attr.iSessionTimeout = oMetaData.STIME; // 세션타임아웃 시간 (1: 1분)
        // oAPP.attr.iServerSessionTimeout = oMetaData.STIME - 1; // 서버 세션 타임아웃 시간 (1: 1분)
        oAPP.attr.bIsNwActive = true; // 네트워크 연결 상태 Flag        

    }; // end of fnPredefineGlobalObject      

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
     * WS Global Setting Lauguage에 맞는 메시지 텍스트 정보를 구한다.
     **************************************************************************/
    oAPP.main.fnGetWsMsgModelData = function () {

        return new Promise(async (resolve) => {

            // WS Global Setting Lauguage에 맞는 메시지 텍스트 정보를 구한다.
            let oLanguTextResult = await WSUTIL.getWsMsgModelData();
            if (oLanguTextResult.RETCD == "E") {
                resolve();
                return;
            }

            let oLanguJsonData = oLanguTextResult.RTDATA,
                oCoreModel = sap.ui.getCore().getModel();

            oCoreModel.setProperty("/WSLANGU", oLanguJsonData);

            resolve();

        });

    }; // end of oAPP.main.fnGetWsMsgModelData

    /************************************************************************
     * WS Global 메시지 글로벌 변수 설정
     ************************************************************************/
    oAPP.fn.fnWsGlobalMsgList = () => {

        return new Promise(async (resolve) => {

            if (!oAPP.msg) {
                oAPP.msg = {};
            }

            let oSettingInfo = WSUTIL.getWsSettingsInfo(),
                sWsLangu = oSettingInfo.globalLanguage;

            oAPP.msg.M047 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "047"); // Icon List
            oAPP.msg.M059 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "059"); // Source Pattern
            oAPP.msg.M068 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "068"); // Icon Viewer
            oAPP.msg.M067 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "067"); // Image Icons

            resolve();

        });

    }; // end of oAPP.fn.fnWsGlobalMsgList

    /**************************************************************************
     * U4A WS 메타 정보 구하기
     **************************************************************************/
    oAPP.main.fnOnInitModelBinding = function () {

        // ModelData
        var oMetaData = {
            METADATA: parent.getMetadata(),
            USERINFO: parent.getUserInfo(),
            SERVERINFO: parent.getServerInfo(),
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
            WS30: {},
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

        let sText = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B31", "", "", "", "");

        return [{
            key: "MENUITEM_10",
            icon: "sap-icon://screen-split-three",
            text: sText, // "Split Position Change",
            visible: true
        }];
    };

    /**************************************************************************
     * [WS20] Side Fixed Menu List
     **************************************************************************/
    oAPP.main.fnGetWs20SideMenuFixItemList = () => {

        let sText = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B32", "", "", "", "");

        return [{
            key: "FIXITM_10",
            icon: "sap-icon://it-system",
            text: sText, //"System Infomation",
            visible: true
        }];

    };

    /************************************************************************
     * window Event Handle ..
     ************************************************************************/
    oAPP.main.fnBeforeunload = function (isClearStorage) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Busy를 킨다.
        parent.setBusy("X");

        // 설정된 Global Shortcut 단축키 삭제
        oAPP.common.fnRemoveGlobalShortcut();

        var oPowerMonitor = parent.POWERMONITOR;

        // 대기모드로 전환 감지 이벤트 해제
        oPowerMonitor.removeListener('lock-screen', oAPP.fn.fnAttachPowerMonitorLockScreen);

        oPowerMonitor.removeListener('unlock-screen', oAPP.fn.fnAttachPowerMonitorUnLockScreen);

        // IPCMAIN 이벤트 해제
        oAPP.fn.fnIpcMain_Detach_Event_Handler();

        // Application 정보를 구한다.
        var oAppInfo = parent.getAppInfo() || APPCOMMON.fnGetModelProperty("/WS30/APP"),
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

                    // 서버리스트 포커스 주기
                    oAPP.fn.fnSetFocusServerList(); // #[ws_fn_04.js]

                }

                window.onbeforeunload = () => { };

                top.window.close();

            });

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            // Busy를 끈다.
            parent.setBusy("");

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

                // 서버리스트 포커스 주기
                oAPP.fn.fnSetFocusServerList(); // #[ws_fn_04.js]

            }

            window.onbeforeunload = () => { };

            top.window.close();

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            // Busy를 끈다.
            parent.setBusy("");


        });

    }; // end of oAPP.main.fnBeforeunload

    oAPP.main.fnDetachBeforeunloadEvent = () => {

        window.onbeforeunload = () => { };

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
        if (oAPP.fn.ClearDropEffect) {
            oAPP.fn.ClearDropEffect();
        }

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
     * 현재 브라우저의 이벤트 핸들러
     ************************************************************************/
    function _attachCurrentWindowEvents() {

        let CURRWIN = parent.CURRWIN;

        CURRWIN.on("maximize", () => {

            if (typeof sap === "undefined") {
                return;
            }

            let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
            if (!oMaxBtn) {
                return;
            }

            oMaxBtn.setIcon("sap-icon://value-help");

        });

        CURRWIN.on("unmaximize", () => {

            if (typeof sap === "undefined") {
                return;
            }

            let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
            if (!oMaxBtn) {
                return;
            }

            oMaxBtn.setIcon("sap-icon://header");

        });

    } // end of _attachCurrentWindowEvents

    /************************************************************************
     *--------------------------[ U4A WS Start ] ----------------------------
     ************************************************************************/
    oAPP.main.fnWsStart = function () {

        sap.ui.getCore().attachInit(async function () {

            // 부모에 sap 인스턴스 전달
            parent.oWS.utill.attr.sap = sap;

            // 현재 브라우저의 이벤트 핸들러
            _attachCurrentWindowEvents();

            // Register illustration Message Pool
            oAPP.fn.fnRegisterIllustrationPool();

            // SAP Icon 등록 (TNT, Business)
            oAPP.fn.fnRegisterSAPIcons();

            // U4A Icon 추가하기
            oAPP.fn.fnRegisterU4AIcons();

            // 초기 현재 화면 위치 정보 저장
            parent.setCurrPage("WS10");

            // 공통 인스턴스 정의
            oAPP.main.fnPredefineGlobalObject();

            // Test..(UI5 bootstrap tag의 Language 값 설정 테스트)
            oAPP.main.fnSetLanguage();

            // 브라우저 상단 메뉴를 없앤다.
            parent.setBrowserMenu(null);

            // APP 전체 대상 글로벌 Shortcut 지정하기
            oAPP.common.fnSetGlobalShortcut();

            // 초기 모델 바인딩
            oAPP.main.fnOnInitModelBinding();

            //WS Global Setting Lauguage에 맞는 메시지 텍스트 정보를 구해서 모델에 저장한다.
            await oAPP.main.fnGetWsMsgModelData();

            // WS Global 메시지 글로벌 변수 설정
            await oAPP.fn.fnWsGlobalMsgList();

            // 초기 화면 그리기
            oAPP.fn.fnOnInitRendering(); // #[ws_fn_01.js]

            // 개인화 정보 설정
            oAPP.fn.fnOnInitP13nSettings(); // #[ws_fn_01.js]

            // 서버 세션 타임아웃 체크            
            oAPP.fn.fnServerSession(); // #[fnServerSession.js]

            // DOM 감지
            oAPP.fn.fnSetMutationObserver(); // #[ws_fn_03.js]           

            // 공통 IPCMAIN 이벤트 걸기
            oAPP.fn.fnIpcMain_Attach_Event_Handler(); // #[ws_fn_ipc.js]                           

            // 자연스러운 로딩
            sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, async function () {

                if (!parent.oWS.utill.attr.UIUpdated) {

                    // Loading Page
                    parent.showLoadingPage("");

                    parent.setBusy("");

                    setTimeout(() => {

                        $('#content').fadeIn(300, 'linear');

                    }, 300);

                    parent.oWS.utill.attr.UIUpdated = "X";

                }

            });

        }); // end of attachInit

        /************************************************************************
         * 네트워크 연결 및 해제 시 발생되는 이벤트
         * **********************************************************************/
        window.addEventListener("online", oAPP.fn.fnNetworkCheckerOnline, false);
        window.addEventListener("offline", oAPP.fn.fnNetworkCheckerOffline, false);

    }; // end of oAPP.main.fnWsStart    

    window.ondragend = (e) => {

        console.log('ondragend!!!');

        oAPP.main.onDragend();

    };

    /**
     * 테스트
     * @returns 
     */
    // window.ondragstart = () => {
    window.addEventListener("dragstart", () => {

        console.log('ondragstart!!!');

        oAPP.main.onDragend();

        //focus된 dom focus 해제 처리.
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }

        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
        if (l_dom === null || l_dom.length === 0) {
            return;
        }

        let oDom = l_dom[0];

        oDom.classList.remove("u4aWsDisplayNone");

    });

    // 브라우저 닫기, window.close() 실행시 타는 이벤트
    window.onbeforeunload = () => {

        // Logout 메시지가 이미 떠 있다면 창을 못닫게 한다.
        if (oAPP.attr.isBrowserCloseLogoutMsgOpen == 'X') {

            // 네트워크가 차단됐을 경우는 그냥 끈다.            
            if (!oAPP.attr.bIsNwActive) {
                oAPP.main.fnBeforeunload("");
                return;
            }

            return false;
        }

        // 브라우저의 닫기 버튼을 누른게 아니라면 종료 하지 않음
        if (oAPP.attr.isPressWindowClose !== "X") {
            return false;
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

            // Logout 메시지 Open 여부 Flag
            oAPP.attr.isBrowserCloseLogoutMsgOpen = 'X';

            // Unsaved data will be lost.
            // Do you want to log off?
            var sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "301", "", "", "", "");
            sMsg += " \n " + oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "302", "", "", "", "");

            // 질문 팝업?
            parent.showMessage(sap, 30, 'I', sMsg, lf_MsgCallback);

            return "";

        }

        // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
        // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
        oAPP.main.fnBeforeunload("");

        return "";

    }; // end of window.onbeforeunload

    function lf_MsgCallback(sAction) {

        delete oAPP.attr.isBrowserCloseLogoutMsgOpen; // Logout 메시지 Open 여부 Flag
        delete oAPP.attr.isPressWindowClose; //  // 브라우저의 닫기 버튼을 눌렀는지 여부 Flag

        if (sAction != "YES") {
            return;
        }

        oAPP.fn.fnSetFocusServerList();

        // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
        // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
        oAPP.main.fnBeforeunload('X');

    }

})(window, oAPP);