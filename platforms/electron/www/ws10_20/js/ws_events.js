/**************************************************************************
 * ws_events.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    oAPP.events = {};

    let REMOTE = parent.REMOTE,
        APPCOMMON = oAPP.common,
        REMOTEMAIN = parent.REMOTEMAIN,
        CURRWIN = REMOTE.getCurrentWindow();

    /************************************************************************
     * App 생성팝업
     ************************************************************************/
    oAPP.events.ev_AppCreate = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // Create, Copy일 경우에만 App Name MaxLength Check 해야함!!
        let bAppMaxLengthCheck = true;

        var bCheckAppNm = oAPP.fn.fnCheckAppName(bAppMaxLengthCheck);
        if (!bCheckAppNm) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

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

            if (oAppInfo.MSGTY == "") {

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "035"); // It is already registered application information.

                // 페이지 푸터 메시지			
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS10", sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            if (!oAPP.fn.createApplicationPopup) {

                // Application 생성 팝업 띄우기
                $.getScript("design/js/createApplicationPopup.js", function () {

                    oAPP.fn.createApplicationPopup(sAppID);

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                });

                return;

            }

            // Application 생성 팝업 띄우기
            oAPP.fn.createApplicationPopup(sAppID);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

        }

    }; // end of oAPP.events.ev_AppCreate

    /************************************************************************
     * App 수정
     ************************************************************************/
    oAPP.events.ev_AppChange = async function () {

        // busy 키고 Lock 걸기        
        oAPP.common.fnSetBusyLock("X");

        zconsole.log("ev_AppChange");        

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();
        
        oAPP.fn.fnOnEnterDispChangeMode(sAppID, "X"); // [async]

    }; // end of oAPP.events.ev_AppChange

    /************************************************************************
     * App 삭제
     ************************************************************************/
    oAPP.events.ev_AppDelete = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");
            return;
        }

        // var bCheckAppNm = oAPP.fn.fnCheckAppName();
        // if (!bCheckAppNm) {
        //     // busy 끄고 Lock 풀기
        //     oAPP.common.fnSetBusyLock("");
        //     return;
        // }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppNmInput) {

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        let oUserInfo = parent.process.USERINFO;
        let sLangu = oUserInfo.LANGU;
        
        var sValue = oAppNmInput.getValue(),
            sCurrPage = parent.getCurrPage();

        // 입력값 유무 확인
        if (typeof sValue !== "string" || sValue == "") {
                    
            // Application name is required.            
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "273");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }        
        
        // 입력값 공백 여부 체크
        var reg = /\s/;
        if (reg.test(sValue)) {
            
            // The application name must not contain any spaces.
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "274");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 특수문자 존재 여부 체크
        var reg = /[^\w]/;
        if (reg.test(sValue)) {
            
            //Special characters are not allowed.
            let sErrMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "278");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // application 존재 여부 체크        
        let sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // Application ID &1 does not exist.
                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            // 질문 메시지
            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "003"); // Do you really want to delete the object?

            // 질문팝업? 삭제하시겠습니까?            
            parent.showMessage(sap, 30, 'W', sMsg, function (TYPE) {

                if (TYPE == null || TYPE == "NO") {
                    return;
                }

                // busy 키고 Lock 걸기
                oAPP.common.fnSetBusyLock("X");

                // 삭제 어플리케이션이 USP 일 경우.
                if (oAppInfo.APPTY == "U") {

                    // busy 키고 Lock 걸기
                    oAPP.common.fnSetBusyLock("X");

                    // 어플리케이션 삭제하러 서버 호출
                    oAPP.fn.fnSetUspAppDelete();

                    return;

                }

                // busy 키고 Lock 걸기
                oAPP.common.fnSetBusyLock("X");

                // 어플리케이션 삭제하러 서버 호출
                oAPP.fn.fnSetAppDelete();

            });

        }

    }; // end of oAPP.events.ev_AppDelete

    /************************************************************************
     * App 삭제하러 서버 호출
     ************************************************************************/
    oAPP.fn.fnSetAppDelete = function (oParam) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        parent.setBusy('X');

        // application 존재 여부 체크
        var oBindData = APPCOMMON.fnGetModelProperty("/WS10"),
            sAppId = oBindData.APPID;

        var sPath = parent.getServerPath() + '/app_delte',
            oFormData = new FormData();

        if (typeof oParam != "undefined") {
            oFormData.append("TRKORR", oParam.TRKORR);
        }

        oFormData.append("APPID", sAppId);

        sendAjax(sPath, oFormData, function (oResult) {

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

                // 화면 Lock 해제
                sap.ui.getCore().unlock();

                parent.setBusy("");

                return;
            }

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            parent.setBusy("");

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
     * USP App 삭제하러 서버 호출
     ************************************************************************/
    oAPP.fn.fnSetUspAppDelete = function (oParam) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // application 존재 여부 체크
        var oBindData = APPCOMMON.fnGetModelProperty("/WS10"),
            sAppId = oBindData.APPID;

        var sPath = parent.getServerPath() + '/usp_app_delete',
            oFormData = new FormData();

        var oDelAppInfo = {
            APPID: sAppId,
            TRKORR: "",
        };

        if (typeof oParam != "undefined") {
            oDelAppInfo.TRKORR = oParam.TRKORR;
        }

        oFormData.append("APPDATA", JSON.stringify(oDelAppInfo));

        sendAjax(sPath, oFormData, function (oResult) {

            // 스크립트가 있으면 eval 처리
            if (oResult.SCRIPT) {
                eval(oResult.SCRIPT);
            }

            // 오류 일 경우.
            if (oResult.RETCD == "E") {

                parent.setSoundMsg("02"); // error sound

                // 작업표시줄 깜빡임
                CURRWIN.flashFrame(true);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            }

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

        });

        // APP 삭제 전용 Cts Popup
        function lf_appDelCtsPopup() {

            // CTS Popup을 Open 한다.
            oAPP.fn.fnCtsPopupOpener(function (oResult) {

                oAPP.fn.fnSetUspAppDelete(oResult);

            });

        }

    } // end of oAPP.fn.fnSetUspAppDelete

    /************************************************************************
     * App 복사
     ************************************************************************/
    oAPP.events.ev_AppCopy = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // // 어플리케이션 명 입력 유무 및 데이터 정합성 체크
        // var bCheckAppNm = oAPP.fn.fnCheckAppName();
        // if (!bCheckAppNm) {
        //     // busy 끄고 Lock 풀기
        //     oAPP.common.fnSetBusyLock("");
        //     return;
        // }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppNmInput) {

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var sValue = oAppNmInput.getValue(),
            sCurrPage = parent.getCurrPage();

        let oUserInfo = parent.process.USERINFO;
        let sLangu = oUserInfo.LANGU;

        // 입력값 유무 확인
        if (typeof sValue !== "string" || sValue == "") {
            
            // Application name is required.            
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "273");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 입력값 공백 여부 체크
        var reg = /\s/;
        if (reg.test(sValue)) {
            
            // The application name must not contain any spaces.
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "274");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }        

        // 특수문자 존재 여부 체크
        var reg = /[^\w]/;
        if (reg.test(sValue)) {
            
            //Special characters are not allowed.
            let sErrMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "278");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // application 존재 여부 체크
        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // Application ID &1 does not exist.
                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            }

            // // busy 끄고 Lock 풀기
            // oAPP.common.fnSetBusyLock("");

            // Application 복사 팝업을 띄운다
            oAPP.fn.fnAppCopyPopupOpener(sAppID);

        }

    }; // end of oAPP.events.ev_AppCopy

    /************************************************************************
     * App 조회
     ************************************************************************/
    oAPP.events.ev_AppDisplay = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        oAPP.fn.fnOnEnterDispChangeMode(sAppID, ""); // [async]

    }; // end of oAPP.events.ev_AppDisplay

    /************************************************************************
     * App 실행
     ************************************************************************/
    oAPP.events.ev_AppExec = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");       

        // var bCheckAppNm = oAPP.fn.fnCheckAppName();
        // if (!bCheckAppNm) {
        //     // busy 끄고 Lock 풀기
        //     oAPP.common.fnSetBusyLock("");
        //     return;
        // }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppNmInput) {

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var sValue = oAppNmInput.getValue(),
            sCurrPage = parent.getCurrPage();

        let oUserInfo = parent.process.USERINFO;
        let sLangu = oUserInfo.LANGU;

        // 입력값 유무 확인
        if (typeof sValue !== "string" || sValue == "") {
            
            // Application name is required.            
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "273");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 입력값 공백 여부 체크
        var reg = /\s/;
        if (reg.test(sValue)) {
            
            // The application name must not contain any spaces.
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "274");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }        

        // 특수문자 존재 여부 체크
        var reg = /[^\w]/;
        if (reg.test(sValue)) {
            
            //Special characters are not allowed.
            let sErrMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "278");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }


        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // Application ID &1 does not exist.
                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // USP App 일 경우 실행하지 않음.
            if (oAppInfo.APPTY == "U") {

                let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "189"); // USP apps are not supported.

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // Inactivate 상태일 경우
            if (oAppInfo.ACTST == "I") {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!!

                // 페이지 푸터 메시지
                APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

                // 화면 Lock 해제
                sap.ui.getCore().unlock();

                // Busy를 끈다.
                parent.setBusy("");

                return;
            }

            oAPP.fn.fnOnExecApp(sAppID); // [ws_fn_02.js]

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            // Busy를 끈다.
            parent.setBusy("");

        }

    }; // end of oAPP.events.ev_AppExec

    /************************************************************************
     * Example 실행
     ************************************************************************/
    oAPP.events.ev_AppExam = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // 전체 자식 윈도우에 Busy 킨다.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_ON"});


        var oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSERKEY = parent.getBrowserKey();

        var sExamUrl = encodeURI("/zu4a_imp/u4a_samples?parentTyp=ELEC&WS=X"),
            sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(sExamUrl);

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.url = sPath;
        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A07"); // Example Open
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.modal = true;        
        oBrowserOptions.parent = oCurrWin;

        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;
        oBrowserOptions.closable = false;
        
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSERKEY;
        oBrowserOptions.webPreferences.OBJTY = "EXAMPLE"

        oAPP.fn.fnExternalOpen(oBrowserOptions);

    }; // end of oAPP.events.ev_AppExam

    /************************************************************************
     * App 모바일 미리보기
     ************************************************************************/
    oAPP.events.ev_MultiPrev = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // var bCheckAppNm = oAPP.fn.fnCheckAppName();
        // if (!bCheckAppNm) {
        //     // busy 끄고 Lock 풀기
        //     oAPP.common.fnSetBusyLock("");
        //     return;
        // }

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppNmInput) {

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var sValue = oAppNmInput.getValue(),
            sCurrPage = parent.getCurrPage();

        let oUserInfo = parent.process.USERINFO;
        let sLangu = oUserInfo.LANGU;

        // 입력값 유무 확인
        if (typeof sValue !== "string" || sValue == "") {
            
            // Application name is required.            
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "273");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 입력값 공백 여부 체크
        var reg = /\s/;
        if (reg.test(sValue)) {
            
            // The application name must not contain any spaces.
            let sErrMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "274");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }        

        // 특수문자 존재 여부 체크
        var reg = /[^\w]/;
        if (reg.test(sValue)) {
            
            //Special characters are not allowed.
            let sErrMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "278");

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sErrMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }
        

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        // APP 존재 유무 확인
        oAPP.fn.fnCheckAppExists(sAppID, lf_result);

        function lf_result(RESULT) {

            var oAppInfo = RESULT.RETURN,
                oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (RESULT.RETCD == 'E') {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // Application ID &1 does not exist.
                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // USP App 일 경우 실행하지 않음.
            if (oAppInfo.APPTY == "U") {

                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "189"); // USP apps are not supported.

                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                // busy 끄고 Lock 풀기
                APPCOMMON.fnSetBusyLock("");

                return;
            }

            // Inactivate 상태일 경우
            if (oAppInfo.ACTST == "I") {

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!!

                // 페이지 푸터 메시지
                APPCOMMON.fnShowFloatingFooterMsg("W", sCurrPage, sMsg);

                // 화면 Lock 해제
                sap.ui.getCore().unlock();

                // Busy를 끈다.
                parent.setBusy("");

                return;
            }

            oAPP.fn.fnOnExecApp(sAppID, true);

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            // Busy를 끈다.
            parent.setBusy("");

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

        // Global APPTY 변수가 없다면 기본 "M" 타입으로 설정.
        if (!oAPP.attr.gAPPTY) {
            oAPP.attr.gAPPTY = "M";
        }

        // APP 검색 팝업 옵션
        var oOptions = {
            autoSearch: true,
            initCond: {
                PACKG: "",
                APPID: sAppId,
                APPNM: "",
                APPTY: oAPP.attr.gAPPTY,
                EXPAGE: "WS10",
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

        // Unsaved data will be lost.
        // Do you want to log off?
        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "301");
        sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "302");

        // 질문 팝업?
        parent.showMessage(sap, 30, 'I', sMsg, lf_MsgCallback);

        function lf_MsgCallback(TYPE) {

            if (TYPE == null || TYPE == "NO") {
                delete oAPP.attr.isBrowserCloseLogoutMsgOpen;
                return;
            }

            // 현재 브라우저에 종속된 팝업 종류들을 닫는다.
            // true: 강제로 닫기
            oAPP.fn.closeAllCurrWinDependentPopups(); // => [ws_fn_04.js]

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

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // app 정보를 구한다.
        var oAppInfo = parent.getAppInfo(),

            IS_CHAG = oAppInfo.IS_CHAG,
            IS_EDIT = oAppInfo.IS_EDIT;

        // 변경된 데이터가 없거나 display 모드일 경우 묻지도 말고 바로 빠져나간다.
        if (IS_CHAG !== 'X' || IS_EDIT !== 'X') {

            // WS10 페이지로 이동        
            oAPP.fn.fnMoveToWs10();

            return;
        }

        var sMsg = "";
        sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "118"); // Application has been changed
        sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

        // 메시지 질문 팝업을 띄운다.
        parent.showMessage(sap, 40, 'W', sMsg, oAPP.events.ev_pageBack_MsgCallBack);

        // 현재 떠있는 팝업 창들을 잠시 숨긴다.
        oAPP.fn.fnChildWindowShow(false);

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

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

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("X");

            var oSaveBtn = sap.ui.getCore().byId("saveBtn");
            if (!oSaveBtn) {

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");
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

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getProperty("key"),
            sItemTxt = oSelectedItem.getProperty("text");

        var sPrefix = `fnWs20Side${sItemKey}`;

        if (typeof oAPP.fn[sPrefix] == "undefined") {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        };

        oAPP.fn[sPrefix](oEvent);

        // parent.showMessage(sap, 10, "", "key: " + sItemKey + ", text: " + sItemTxt);

    }; // end of oAPP.events.ev_pressSideNavMenu

    /************************************************************************
     * Syntax Check Button Event
     ************************************************************************/
    oAPP.events.ev_pressSyntaxCheckBtn = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

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

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "027"); // No syntax errors found

                APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

                // 화면 Lock 해제
                sap.ui.getCore().unlock();

                // Busy를 끈다.
                parent.setBusy("");

                return;
            }

            oAPP.fn.fnMultiFooterMsg(oResult.DATA);

            // 작업표시줄 깜빡임
            oCurrWin.flashFrame(true);

        });

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
                sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "118"); // Application has been changed
                sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

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

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("X");

            // child window(각종 Editor창 등..) 가 있었을 경우, 메시지 팝업 뜬 상태에서 어떤 버튼이라도 누른 후에는 
            // child window를 활성화 한다.
            APPCOMMON.fnIsChildWindowShow(true);

            // 이동을 하지 않는다.
            if (ACTCD == null || ACTCD === "CANCEL") {

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // 저장 후 Display 모드로 이동한다.
            if (ACTCD === "YES") {

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
    oAPP.events.ev_pressActivateBtn = async function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");        

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        // 멀티 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnMultiFooterMsgClose();

        let T_excep = oAPP.fn.chkExcepionAttr(),
            iexceplength = T_excep.length;

        if (iexceplength !== 0) {

            // // 자식 윈도우 활성화
            // oAPP.fn.fnChildWindowShow(true);
            
            // 멀티푸터 메시지 실행 
            // 이 안에서 화면이 로드가 완료되면
            // IPC로 비지 끄는 로직 있음
            oAPP.fn.fnMultiFooterMsg(T_excep);

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            // // busy 끄고 Lock 풀기
            // oAPP.common.fnSetBusyLock("");            

            return;

        }

        // 자식 윈도우 숨기기
        oAPP.fn.fnChildWindowShow(false);

        oEvent.mParameters.IS_ACT = "X";

        var oLocalEvent = new sap.ui.base.Event(),
            oNewEvent = jQuery.extend(true, oLocalEvent, oEvent);

        var TRKORR = oEvent.getParameter("TRKORR");

        var sPath = parent.getServerPath() + '/save_active_appdata#active',
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

        // Ajax 서버 호출
        sendAjax(sPath, oFormData, function (oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

            if (typeof oResult == "string" || typeof oResult != "object") {

                try {

                    var oResult = JSON.parse(oResult);

                } catch (error) {

                    // 오류 사운드 실행
                    parent.setSoundMsg('02'); // sap sound(error)

                    // 작업표시줄 깜빡임
                    oCurrWin.flashFrame(true);

                    var sMsg = "[Activate Error]:" + error.toString();

                    // 메시지 처리.. 
                    parent.showMessage(null, 99, "E", sMsg);

                    console.error(error);

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    // 자식 윈도우 활성화
                    oAPP.fn.fnChildWindowShow(true);

                    return;

                }

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "312"); // A Critical error has occurred.

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS20", sMsg);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                // 자식 윈도우 활성화
                oAPP.fn.fnChildWindowShow(true);

                return;

            }

            if (oResult.RETCD == "E") {

                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // 서버에서 만든 스크립트가 있다면 eval 처리.
                if (oResult.SCRIPT) {

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    // 자식 윈도우 활성화
                    oAPP.fn.fnChildWindowShow(true);
                    
                    eval(oResult.SCRIPT);

                    return;
                }

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS20", oResult.RTMSG);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                // 자식 윈도우 활성화
                oAPP.fn.fnChildWindowShow(true);

                return;

            }

            // 서버에서 만든 스크립트가 있다면 eval 처리.
            if (oResult.SCRIPT) {
                eval(oResult.SCRIPT);
            }

            // change Flag 초기화
            var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());
            oAppInfo.IS_CHAG = '';

            oAppInfo.ACTST = 'A';

            // var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "032"); // Activity success

            let oUserInfo = parent.process.USERINFO;
            let sLangu = oUserInfo.LANGU;

            // Activity success
            var sMsg = parent.WSUTIL.getWsMsgClsTxt(sLangu, "ZMSG_WS_COMMON_001", "275");

            APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

            parent.setAppInfo(oAppInfo);

            oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());

            APPCOMMON.fnSetModelProperty("/WS20/APP", oAppInfo);

           

            //undo, redo 이력 초기화.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).clearHistory();

            //undo, redo 버튼 활성여부 처리.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).setUndoRedoButtonEnable();

            oAPP.attr.oModel.refresh();



            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            // 자식 윈도우 활성화
            oAPP.fn.fnChildWindowShow(true);

        });

    }; // end of oAPP.events.ev_pressActivateBtn   

    /************************************************************************
     * Save Button Event
     ************************************************************************/
    oAPP.events.ev_pressSaveBtn = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // 자식 윈도우 숨기기
        oAPP.fn.fnChildWindowShow(false);

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        var oLocalEvent = new sap.ui.base.Event(),
            oNewEvent = jQuery.extend(true, oLocalEvent, oEvent);

        var sPath = parent.getServerPath() + '/save_active_appdata#save',
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

        // Ajax 서버 호출
        sendAjax(sPath, oFormData, lf_getAppInfo);

        // 서버 호출 callback
        function lf_getAppInfo(oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow(),
                sCurrPage = parent.getCurrPage();

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

                // 서버에서 만든 스크립트가 있다면 eval 처리.
                if (oResult.SCRIPT) {                    

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    // 자식 윈도우 활성화
                    oAPP.fn.fnChildWindowShow(true);

                    eval(oResult.SCRIPT);                    

                    return;
                }

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS20", oResult.RTMSG);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                // 자식 윈도우 활성화
                oAPP.fn.fnChildWindowShow(true);

                return;

            }

            // 서버에서 만든 스크립트가 있다면 eval 처리.
            if (oResult.SCRIPT) {
                eval(oResult.SCRIPT);
            }

            // 저장후 10번 페이지로 이동이면..
            if (ISBACK == 'X') {

                oAPP.fn.fnMoveToWs10();

                // // busy 끄고 Lock 풀기
                // oAPP.common.fnSetBusyLock("");

                return;
            }

            // WS20 페이지 Lock 풀고 Display Mode로 전환
            if (ISDISP == 'X') {

                oAPP.fn.fnSetAppDisplayMode();

                // // busy 끄고 Lock 풀기
                // oAPP.common.fnSetBusyLock("");

                return;
            }

            // change Flag 초기화
            var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());
            oAppInfo.IS_CHAG = '';

            var sMsg = "";
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "002"); // Saved success

            APPCOMMON.fnShowFloatingFooterMsg('S', sCurrPage, sMsg);

            /**
             * APP 정보 갱신
             */
            parent.setAppInfo(oAppInfo);

            oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());

            APPCOMMON.fnSetModelProperty("/WS20/APP", oAppInfo);


            
            //undo, redo 이력 초기화.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).clearHistory();

            //undo, redo 버튼 활성여부 처리.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).setUndoRedoButtonEnable();

            oAPP.attr.oModel.refresh();



            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            // 자식 윈도우 활성화
            oAPP.fn.fnChildWindowShow(true);            

        } // end of lf_getAppInfo      

    }; // end of oAPP.events.ev_pressSaveBtn

    /************************************************************************
     * MIME Button Event
     ************************************************************************/
    oAPP.events.ev_pressMimeBtn = function () {

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            return;
        }

        oAPP.fn.fnMimeDialogOpener();

    }; // end of oAPP.events.ev_pressMimeBtn

    /************************************************************************
     * Controller Button Event
     ************************************************************************/
    oAPP.events.ev_pressControllerBtn = function () {

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

            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!! 

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

            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!!

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

        // /**
        //  * White List Object에 해당 CTS 번호가 있을경우 새로운 Icon List를 실행
        //  */
        // let bIsNewPopup = oAPP.common.checkWLOList("C", "UHAK900630");
        // if (bIsNewPopup) {
        //     oAPP.fn.fnIconPreviewPopupOpener();
        //     return;
        // }

        oAPP.fn.fnIconListPopupOpener();

    }; // end of oAPP.events.ev_pressIconListBtn

    /************************************************************************
     * Icon Collection Button Event
     ************************************************************************/
    oAPP.events.ev_PressIconCollectBtn = function (oEvent) {

        let oSelectedMenuItem = oEvent.getParameter("item"),
            sSelectedKey = oSelectedMenuItem.getProperty("key");

        switch (sSelectedKey) {
            case "M1": // Icon Preview popup

                oAPP.fn.fnIconPreviewPopupOpener();

                return;

            case "M2": // Illustrated Message Preview Popup

                oAPP.fn.fnIllustedMsgPrevPopupOpener();

                return;

        }

    }; // end of oAPP.events.ev_PressIconCollectBtn

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

    /**********************************************************************\**
     * Runtime Class Navigator Button
     ************************************************************************/
    oAPP.events.ev_pressRuntimeBtn = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

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