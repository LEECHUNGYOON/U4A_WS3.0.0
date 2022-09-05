/**************************************************************************
 * ws_events.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    oAPP.events = {};

    let REMOTE = parent.REMOTE,
        APPCOMMON = oAPP.common,
        REMOTEMAIN = parent.REMOTEMAIN;

    /************************************************************************
     * App 생성팝업
     ************************************************************************/
    oAPP.events.ev_AppCreate = function () {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            return;
        }

        // application 존재 여부 체크
        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        var oFormData = new FormData();
        oFormData.append("APPID", sAppID);

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, lf_success);

        function lf_success(oAppInfo) {

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            parent.setBusy('');

            if (oAppInfo.MSGTY == "") {

                // var sMsg = parent.getMessage("002");
                var sMsg = APPCOMMON.fnGetMsgClsTxt("035"); // "It is already registered application information."

                // 페이지 푸터 메시지			
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS10", sMsg);

                return;
            }

            if (!oAPP.fn.createApplicationPopup) {

                $.getScript("design/js/createApplicationPopup.js", function () {
                    oAPP.fn.createApplicationPopup(sAppID);
                });

                return;

            }

            oAPP.fn.createApplicationPopup(sAppID);

        }

    }; // end of oAPP.events.ev_AppCreate

    /************************************************************************
     * App 수정
     ************************************************************************/
    oAPP.events.ev_AppChange = function () {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        oAPP.fn.fnOnEnterDispChangeMode(sAppID, "X");

    }; // end of oAPP.events.ev_AppChange

    /************************************************************************
     * App 삭제
     ************************************************************************/
    oAPP.events.ev_AppDelete = function () {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            sap.ui.getCore().unlock();
            return;
        }

        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            sap.ui.getCore().unlock();
            return;
        }

        // application 존재 여부 체크
        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            parent.setBusy('');

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                return;
            }

            // 질문 메시지
            var sMsg = APPCOMMON.fnGetMsgClsTxt("003"); // Do you really want to delete the object?

            // 질문팝업? 삭제하시겠습니까?
            // parent.showMessage(sap, 30, 'W', sMsg, oAPP.events.ev_pressWebSecurityDelCB);
            parent.showMessage(sap, 30, 'W', sMsg, function (TYPE) {

                if (TYPE == null || TYPE == "NO") {
                    return;
                }

                // 화면 Lock 걸기
                sap.ui.getCore().lock();

                // 어플리케이션 삭제하러 서버 호출
                oAPP.fn.fnSetAppDelete();

            });

        }

    }; // end of oAPP.events.ev_AppDelete

    /************************************************************************
     * App 삭제하러 서버 호출
     ************************************************************************/
    oAPP.fn.fnSetAppDelete = function (oParam) {

        // application 존재 여부 체크
        var oBindData = APPCOMMON.fnGetModelProperty("/WS10"),
            sAppId = oBindData.APPID;

        var sPath = parent.getServerPath() + '/app_delte',
            oFormData = new FormData();

        if (typeof oParam != "undefined") {
            oFormData.append("TRKORR", oParam.TRKORR);
        }

        oFormData.append("APPID", sAppId);

        parent.setBusy('X');

        sendAjax(sPath, oFormData, function (oResult) {

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            parent.setBusy('');

            // 스크립트가 있으면 eval 처리
            if (oResult.SCRIPT) {
                eval(oResult.SCRIPT);
            }

            if (oResult.RETCD == "E") {

                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                let oCurrWin = REMOTE.getCurrentWindow();

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                return;
            }

        });

        // APP 삭제 전용 Cts Popup
        function lf_appDelCtsPopup() {

            // CTS Popup을 Open 한다.
            oAPP.fn.fnCtsPopupOpener(function (oResult) {

                oAPP.fn.fnSetAppDelete(oResult);

            });

        }

    }; // end of oAPP.fn.fnSetAppDelete

    /************************************************************************
     * App 복사
     ************************************************************************/
    oAPP.events.ev_AppCopy = function (oEvent) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            sap.ui.getCore().unlock();
            return;
        }

        // 어플리케이션 명 입력 유무 및 데이터 정합성 체크
        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            sap.ui.getCore().unlock();
            return;
        }

        // application 존재 여부 체크
        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            sap.ui.getCore().unlock();

            parent.setBusy('');

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                return;

            }

            // Application 복사 팝업을 띄운다
            oAPP.fn.fnAppCopyPopupOpener(sAppID);

        }

    }; // end of oAPP.events.ev_AppCopy

    /************************************************************************
     * App 조회
     ************************************************************************/
    oAPP.events.ev_AppDisplay = function (oEvent) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        oAPP.fn.fnOnEnterDispChangeMode(sAppID, "");

    }; // end of oAPP.events.ev_AppDisplay

    /************************************************************************
     * App 실행
     ************************************************************************/
    oAPP.events.ev_AppExec = function (oEvent) {

        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            return;
        }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            parent.setBusy('');

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                return;
            }

            // Inactivate 상태일 경우
            if (oAppInfo.ACTST == "I") {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                var sMsg = APPCOMMON.fnGetMsgClsTxt("031"); // "Only in activity state !!!"

                // 페이지 푸터 메시지
                APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

                return;
            }

            oAPP.fn.fnOnExecApp(sAppID);

        }

    }; // end of oAPP.events.ev_AppExec

    /************************************************************************
     * Example 실행
     ************************************************************************/
    oAPP.events.ev_AppExam = function (oEvent) {

        var oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSERKEY = parent.getBrowserKey();

        var sExamUrl = encodeURI("/zu4a_imp/u4a_samples?parentTyp=ELEC&WS=X"),
            sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(sExamUrl);

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.url = sPath;
        oBrowserOptions.title = "Example Open";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.modal = true;
        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSERKEY;

        oAPP.fn.fnExternalOpen(oBrowserOptions);

    }; // end of oAPP.events.ev_AppExam

    /************************************************************************
     * App 모바일 미리보기
     ************************************************************************/
    oAPP.events.ev_MultiPrev = function (oEvent) {

        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            return;
        }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            parent.setBusy('');

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                return;
            }

            // Inactivate 상태일 경우
            if (oAppInfo.ACTST == "I") {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                var sMsg = APPCOMMON.fnGetMsgClsTxt("031"); // "Only in activity state !!!"

                // 페이지 푸터 메시지
                APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

                return;
            }

            oAPP.fn.fnOnExecApp(sAppID, true);

        }

    }; // end of ev_MultiPrev

    /************************************************************************
     * Application Name Input Search Help(F4)
     ************************************************************************/
    oAPP.events.ev_AppValueHelp = function (oEvent) {

        var bIsPressClearBtn = oEvent.getParameter("clearButtonPressed");
        if (bIsPressClearBtn) {

            var oInput = oEvent.getSource();
            oInput.suggest(true);

            return;
        }

        var oSuggetionItem = oEvent.getParameter("suggestionItem");
        if (oSuggetionItem) {
            return;
        }

        var iKeyCode = event.keyCode;

        // 엔터 또는 F5를 눌렀을 경우에는 F4 Help를 띄우지 않는다.
        if (iKeyCode == 13 || iKeyCode == 116) {
            return;
        }

        var oUserInfo = parent.getUserInfo(),
            sSapId = oUserInfo.ID;

        sSapId = sSapId.toUpperCase();

        // SearchHelp 실행 시, 필요한 Application 정보 데이터를 구한다. 
        var APPCOMMON = oAPP.common;

        var oAppInput = oEvent.getSource(),
            sAppId = APPCOMMON.fnGetModelProperty("/WS10/APPID");

        oAppInput.fireChange({
            value: oAppInput.getValue()
        });

        // APP 검색 팝업 옵션
        var oOptions = {
            autoSearch: true,
            initCond: {
                PACKG: "",
                APPID: sAppId,
                APPNM: "",
                ERUSR: sSapId,
                HITS: 500,
            }
        };

        // APP 검색 팝업
        oAPP.fn.fnAppF4PopupOpener(oOptions, fnAppF4DataCallback);

        function fnAppF4DataCallback(oAppData) {

            APPCOMMON.fnSetModelProperty("/WS10/APPID", oAppData.APPID);

        }

    }; // end of oAPP.events.ev_AppValueHelp

    /************************************************************************
     * new Window
     ************************************************************************/
    oAPP.events.ev_NewWindow = function () {

        parent.onNewWindow();

    }; // end of oAPP.events.ev_NewWindow

    /************************************************************************
     * Application Name Input Change Event
     ************************************************************************/
    oAPP.events.ev_AppInputChange = function (oEvent) {

        oEvent.preventDefault();

        var sValue = oEvent.getParameter("value");

        var sValueUpper = sValue.toUpperCase();

        oEvent.getSource().setValue(sValueUpper);

    }; // end of oAPP.events.ev_AppInputChange

    /************************************************************************
     * logout
     ************************************************************************/
    oAPP.events.ev_Logout = function () {

        // Logout 버튼으로 Logout을 시도 했다는 Flag      
        oAPP.attr.isBrowserCloseLogoutMsgOpen = "X";

        var sMsg = APPCOMMON.fnGetMsgClassTxt("0001"); // "Unsaved data will be lost. \n Do you want to log off?";        

        // 질문 팝업?
        parent.showMessage(sap, 30, 'I', sMsg, lf_MsgCallback);

        function lf_MsgCallback(TYPE) {

            if (TYPE == null || TYPE == "NO") {
                delete oAPP.attr.isBrowserCloseLogoutMsgOpen;
                return;
            }

            parent.IPCRENDERER.send('if-browser-close', {
                ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
                SESSKEY: parent.getSessionKey(),
                BROWSKEY: parent.getBrowserKey()
            });

            var sUrl = parent.getServerPath() + "/logoff";

            var option = {
                URL: sUrl
            };

            sendServerExit(option, () => {

                window.onbeforeunload = null;

                top.window.close();

            });

        }

    }; // end of oAPP.events.ev_Logout

    /************************************************************************
     * ws main 페이지로 이동
     ************************************************************************/
    oAPP.events.ev_pageBack = function (oEvent) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // app 정보를 구한다.
        var oAppInfo = parent.getAppInfo(),

            IS_CHAG = oAppInfo.IS_CHAG,
            IS_EDIT = oAppInfo.IS_EDIT;

        // 변경된 데이터가 없거나 display 모드일 경우 묻지도 말고 바로 빠져나간다.
        if (IS_CHAG != 'X' || IS_EDIT != 'X') {

            // WS10 페이지로 이동        
            oAPP.fn.fnMoveToWs10();

            return;
        }

        var sMsg = "";
        sMsg = APPCOMMON.fnGetMsgClsTxt("118"); // "Application has been changed"
        sMsg += " \n " + APPCOMMON.fnGetMsgClsTxt("119"); // "Save before leaving editor?"    

        // 메시지 질문 팝업을 띄운다.
        parent.showMessage(sap, 40, 'W', sMsg, oAPP.events.ev_pageBack_MsgCallBack);

        // 현재 떠있는 팝업 창들을 잠시 숨긴다.
        oAPP.fn.fnChildWindowShow(false);

        sap.ui.getCore().unlock();

    }; // end of oAPP.events.ev_pageBack

    /************************************************************************
     * WS10 으로 화면 이동 전에 질문 팝업 callback function
     ************************************************************************/
    oAPP.events.ev_pageBack_MsgCallBack = function (ACTCD) {

        // 이동을 하지 않는다.
        if (ACTCD == null || ACTCD == "CANCEL") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        // 저장 후 이동한다.
        if (ACTCD == "YES") {

            sap.ui.getCore().lock();

            var oSaveBtn = sap.ui.getCore().byId("saveBtn");
            if (!oSaveBtn) {
                return;
            }

            // 저장 로직 수행 한다.
            oSaveBtn.firePress({
                ISBACK: "X"
            });

            return;

        }

        // WS10 페이지로 이동
        oAPP.fn.fnMoveToWs10();

    }; // end of oAPP.events.ev_pageBack_MsgCallBack

    /************************************************************************
     * side navigation Menu click
     ************************************************************************/
    oAPP.events.ev_pressSideNavMenu = function (oEvent) {

        var oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getProperty("key"),
            sItemTxt = oSelectedItem.getProperty("text");

        var sPrefix = `fnWs20Side${sItemKey}`;

        if (typeof oAPP.fn[sPrefix] == "undefined") {
            return;
        };

        oAPP.fn[sPrefix](oEvent);

        // parent.showMessage(sap, 10, "", "key: " + sItemKey + ", text: " + sItemTxt);

    }; // end of oAPP.events.ev_pressSideNavMenu

    /************************************************************************
     * Syntax Check Button Event
     ************************************************************************/
    oAPP.events.ev_pressSyntaxCheckBtn = function (oEvent) {

        // 현재 떠있는 브라우저
        var oCurrWin = REMOTE.getCurrentWindow(),
            sCurrPage = parent.getCurrPage();

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        // 멀티 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnMultiFooterMsgClose();

        // 디자인 영역의 오류를 점검한다.
        let T_excep = oAPP.fn.chkExcepionAttr(),
            iexceplength = T_excep.length;

        if (iexceplength !== 0) {

            oAPP.fn.fnMultiFooterMsg(T_excep);

            // 작업표시줄 깜빡임
            oCurrWin.flashFrame(true);

            return;
        }

        // 서버단 런타임 클래스의 신텍스 오류를 점검한다.
        var sPath = parent.getServerPath() + '/chk_ws_syntx',
            oFormData = new FormData();

        oFormData.append("APPDATA", JSON.stringify(oAPP.fn.getSaveData()));

        // Ajax 서버 호출
        sendAjax(sPath, oFormData, (oResult) => {

            // Syntax 오류가 없다면 메시지 처리 후 빠져나간다.
            if (oResult.RETCD != "E") {

                var sMsg = APPCOMMON.fnGetMsgClsTxt("027"); // "No syntax errors found"
                APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

                parent.setBusy("");

                return;
            }

            oAPP.fn.fnMultiFooterMsg(oResult.DATA);

            // 작업표시줄 깜빡임
            oCurrWin.flashFrame(true);

            parent.setBusy("");

        });
        // sendAjax(sPath, oFormData, function(oResult) {

    }; // end of oAPP.events.ev_pressSyntaxCheckBtn

    /************************************************************************
     * Display or Change Button Event
     ************************************************************************/
    oAPP.events.ev_pressDisplayModeBtn = function (oEvent) {

        var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo()); // APP 정보

        // edit 모드 -> display 모드
        if (oAppInfo.IS_EDIT == "X") {

            // 변경된 값이 있는데 Display 모드로 갈려고 할 경우 메시지 팝업 보여준다.		
            if (oAppInfo.IS_CHAG == 'X') {

                // 메시지 팝업 띄울 때 Child window 가 있으면 Hide 시킨다.
                APPCOMMON.fnIsChildWindowShow(false);

                var sMsg = "";
                sMsg = APPCOMMON.fnGetMsgClsTxt("118"); // "Application has been changed"
                sMsg += " \n " + APPCOMMON.fnGetMsgClsTxt("119"); // "Save before leaving editor?"

                parent.showMessage(sap, 40, 'W', sMsg, lf_MsgCallback);
                return;
            }

            // WS20 페이지 정보 갱신            
            oAPP.fn.fnSetAppDisplayMode();

            return;
        }

        // display 모드 -> edit 모드
        oAPP.fn.fnSetAppChangeMode();

        /** 
         *  Local Function...
         */
        function lf_MsgCallback(ACTCD) {

            // child window(각종 Editor창 등..) 가 있었을 경우, 메시지 팝업 뜬 상태에서 어떤 버튼이라도 누른 후에는 
            // child window를 활성화 한다.
            APPCOMMON.fnIsChildWindowShow(true);

            // 이동을 하지 않는다.
            if (ACTCD == null || ACTCD == "CANCEL") {
                return;
            }

            // 저장 후 Display 모드로 이동한다.
            if (ACTCD == "YES") {

                // 저장 로직 수행
                var oSaveBtn = sap.ui.getCore().byId("saveBtn");
                oSaveBtn.firePress({
                    ISDISP: 'X'
                });

                return;

            }

            // WS20 페이지 정보 갱신
            oAPP.fn.fnSetAppDisplayMode();

        } // end of lf_MsgCallback

    }; // end of oAPP.events.ev_pressDisplayModeBtn

    function lf_saveActiveCtsPopup(oEvent) {

        var lo_Event = oEvent;

        // CTS Popup을 Open 한다.
        oAPP.fn.fnCtsPopupOpener(function (oResult) {

            var oEvent = this,
                IS_ACT = oEvent.getParameter("IS_ACT");

            oEvent.mParameters.TRKORR = oResult.TRKORR;

            if (IS_ACT == 'X') {
                oAPP.events.ev_pressActivateBtn(oEvent);
                return;
            }

            oAPP.events.ev_pressSaveBtn(oEvent);

        }.bind(lo_Event));

    }

    /************************************************************************
     * Activate Button Event
     ************************************************************************/
    oAPP.events.ev_pressActivateBtn = function (oEvent) {

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        // 멀티 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnMultiFooterMsgClose();

        let T_excep = oAPP.fn.chkExcepionAttr(),
            iexceplength = T_excep.length;

        if (iexceplength !== 0) {

            oAPP.fn.fnMultiFooterMsg(T_excep);
            return;
        }

        oEvent.mParameters.IS_ACT = "X";

        var oLocalEvent = new sap.ui.base.Event(),
            oNewEvent = jQuery.extend(true, oLocalEvent, oEvent);

        var TRKORR = oEvent.getParameter("TRKORR");

        var sPath = parent.getServerPath() + '/save_active_appdata',
            oFormData = new FormData();

        var sReqNo = "";

        // 기존에 CTS 번호가 있을 경우
        if (oAPP.attr.appInfo.REQNO != "") {
            sReqNo = oAPP.attr.appInfo.REQNO;
        }

        if (TRKORR) {
            sReqNo = TRKORR;
        }

        if (sReqNo != "") {
            oFormData.append("TRKORR", sReqNo);
        }

        oFormData.append("IS_ACT", 'X');
        oFormData.append("APPDATA", JSON.stringify(oAPP.fn.getSaveData()));

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Ajax 서버 호출
        sendAjax(sPath, oFormData, function (oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            // Busy 끄기
            parent.setBusy('');

            if (oResult.RETCD == "E") {

                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                eval(oResult.SCRIPT);

                return;

            }

            eval(oResult.SCRIPT);

            // change Flag 초기화
            var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());
            oAppInfo.IS_CHAG = '';

            oAppInfo.ACTST = 'A';

            var sMsg = APPCOMMON.fnGetMsgClsTxt("032"); // "Activity success"

            APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

            parent.setAppInfo(oAppInfo);

            oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());

            APPCOMMON.fnSetModelProperty("/WS20/APP", oAppInfo);

        });

    }; // end of oAPP.events.ev_pressActivateBtn   

    /************************************************************************
     * Save Button Event
     ************************************************************************/
    oAPP.events.ev_pressSaveBtn = function (oEvent) {

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        var oLocalEvent = new sap.ui.base.Event(),
            oNewEvent = jQuery.extend(true, oLocalEvent, oEvent);

        var sPath = parent.getServerPath() + '/save_active_appdata',
            oFormData = new FormData();

        var ISBACK = oEvent.getParameter("ISBACK"), // 저장후 뒤로 갈 경우 (20 -> 10)
            ISDISP = oEvent.getParameter("ISDISP"), // 저장후 Display 모드로 전환일 경우            
            TRKORR = oEvent.getParameter("TRKORR");

        var sReqNo = "";

        // 기존에 CTS 번호가 있을 경우
        if (oAPP.attr.appInfo.REQNO != "") {
            sReqNo = oAPP.attr.appInfo.REQNO;
        }

        // CTS 팝업에서 선택한 CTS 번호가 있을 경우.
        if (TRKORR) {
            sReqNo = TRKORR;
        }

        if (sReqNo != "") {
            oFormData.append("TRKORR", sReqNo);
        }

        oFormData.append("APPDATA", JSON.stringify(oAPP.fn.getSaveData()));

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Ajax 서버 호출
        sendAjax(sPath, oFormData, lf_getAppInfo);

        // 서버 호출 callback
        function lf_getAppInfo(oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            // Busy 끄기
            parent.setBusy('');

            // 푸터 메시지가 있을 경우 닫기
            APPCOMMON.fnHideFloatingFooterMsg();

            // Multi Footer 메시지 영역이 있으면 삭제.
            APPCOMMON.fnMultiFooterMsgClose();

            // 오류 일때는 Script만 실행하고 빠져나간다.
            if (oResult.RETCD == "E") {

                // 오류 사운드
                parent.setSoundMsg('02'); // sap sound(error)

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                eval(oResult.SCRIPT);

                return;

            }

            eval(oResult.SCRIPT);

            // 저장후 10번 페이지로 이동이면..
            if (ISBACK == 'X') {

                oAPP.fn.fnMoveToWs10();
                return;
            }

            // WS20 페이지 Lock 풀고 Display Mode로 전환
            if (ISDISP == 'X') {

                oAPP.fn.fnSetAppDisplayMode();
                return;
            }

            // change Flag 초기화
            var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());
            oAppInfo.IS_CHAG = '';

            var sMsg = "";
            sMsg = APPCOMMON.fnGetMsgClsTxt("002"); // "Saved success"      

            APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

            /**
             * APP 정보 갱신
             */
            parent.setAppInfo(oAppInfo);

            oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());

            APPCOMMON.fnSetModelProperty("/WS20/APP", oAppInfo);

        } // end of lf_getAppInfo      

    }; // end of oAPP.events.ev_pressSaveBtn

    /************************************************************************
     * MIME Button Event
     ************************************************************************/
    oAPP.events.ev_pressMimeBtn = function (oEvent) {

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            return;
        }

        oAPP.fn.fnMimeDialogOpener();

    }; // end of oAPP.events.ev_pressMimeBtn

    /************************************************************************
     * Controller Button Event
     ************************************************************************/
    oAPP.events.ev_pressControllerBtn = function (oEvent) {

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            return;
        }

        APPCOMMON.execControllerClass();

    }; // end of oAPP.events.ev_pressControllerBtn

    /************************************************************************
     * Application Execution Button Event
     ************************************************************************/
    oAPP.events.ev_pressAppExecBtn = function (oEvent) {

        var oAppInfo = parent.getAppInfo(),
            sCurrPage = parent.getCurrPage(),
            sACTST = oAppInfo.ACTST,
            sMsg = "";

        // Inactivate 상태일 경우 실행하지 않는다
        if (sACTST == 'I') {

            sMsg = APPCOMMON.fnGetMsgClsTxt("031"); // "Only in activity state !!!"

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

            return;
        }

        oAPP.fn.fnOnExecApp(oAppInfo.APPID);

    }; // end of oAPP.events.ev_pressAppExecBtn

    /************************************************************************
     * Multi Preview Button Event
     ************************************************************************/
    oAPP.events.ev_pressMultiPrevBtn = function (oEvent) {

        var oAppInfo = parent.getAppInfo(),
            sCurrPage = parent.getCurrPage(),
            sACTST = oAppInfo.ACTST,
            sMsg = "";

        // Inactivate 상태일 경우 실행하지 않는다
        if (sACTST == 'I') {

            sMsg = APPCOMMON.fnGetMsgClsTxt("031"); // "Only in activity state !!!"

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

            return;
        }

        oAPP.fn.fnOnExecApp(oAppInfo.APPID, true);

    }; // end of oAPP.events.ev_pressMultiPrevBtn

    /************************************************************************
     * IconList Button Event
     ************************************************************************/
    oAPP.events.ev_pressIconListBtn = function (oEvent) {

        oAPP.fn.fnIconListPopupOpener();

    }; // end of oAPP.events.ev_pressIconListBtn

    /************************************************************************
     * Add Server Event Button Event
     ************************************************************************/
    oAPP.events.ev_pressAddEventBtn = function (oEvent) {

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            return;
        }

        if (!oAPP.fn.createEventPopup) {
            oAPP.fn.getScript("design/js/createEventPopup", function () {
                oAPP.fn.createEventPopup();
            });

            return;
        }

        oAPP.fn.createEventPopup();

    }; // end of oAPP.events.ev_pressAddEventBtn

    /************************************************************************
     * Runtime Class Navigator Button
     ************************************************************************/
    oAPP.events.ev_pressRuntimeBtn = function () {

        oAPP.fn.fnRuntimeClassNaviPopupOpener();

    }; // end of oAPP.events.ev_pressRuntimeBtn    

    /************************************************************************
     * 세션 끊기..
     ************************************************************************/
    oAPP.events.ev_LogoutTest = function () {

        var sPath = parent.getServerPath() + '/logoff';

        sendAjax(sPath, null, lf_success);

        function lf_success() {
            sap.m.MessageToast.show("세션 끊켰다.");
            parent.setBusy('');
        }

    }; // end of oAPP.events.ev_LogoutTest

})(window, $, oAPP);