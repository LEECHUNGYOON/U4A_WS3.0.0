/**************************************************************************
 * ws_events_01.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    let REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        APPCOMMON = oAPP.common,
        CURRWIN = REMOTE.getCurrentWindow(),
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        PATH = parent.PATH,
        APPPATH = parent.APPPATH,
        IPCMAIN = parent.IPCMAIN,
        IPCRENDERER = parent.IPCRENDERER;

    /************************************************************************
     * [WS20] 페이지의 멀티 메시지 닫기
     * **********************************************************************/
    oAPP.events.fnPressMultiFooterMsgCloseBtn = function () {

        APPCOMMON.fnMultiFooterMsgClose();

    }; // end of oAPP.events.fnPressMultiFooterMsgCloseBtn

    /************************************************************************
     * [WS20] Find Button Event
     ************************************************************************/
    oAPP.events.ev_pressFindBtn = function () {       

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");
        
        oAPP.fn.fnFindPopupOpener();

    }; // end of oAPP.events.ev_pressFindBtn

    /************************************************************************
     * [WS10] Text Search Button Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchWS10 = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnTextSearchPopupOpener();

    }; // end of oAPP.events.ev_winTxtSrchWS10

    /************************************************************************
     * [WS20] Text Search Button Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchWS20 = function (oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");
        
        oAPP.fn.fnTextSearchPopupOpener();

    }; // end of oAPP.events.ev_winTxtSrchWS20

    /************************************************************************
     * [WS10] Text Search Lib Change
     ************************************************************************/
    oAPP.events.ev_winTxtSrchLibChgWS10 = function (oEvent) {

        var sValue = oEvent.getParameter("value"),
            oCurrWin = REMOTE.getCurrentWindow();

        oCurrWin.webContents.findInPage(sValue);

    }; // end of oAPP.events.ev_winTxtSrchLibChgWS10

    /************************************************************************
     * [WS20] Text Search Lib Change
     ************************************************************************/
    oAPP.events.ev_winTxtSrchLibChgWS20 = function (oEvent) {

        var sValue = oEvent.getParameter("value"),
            oCurrWin = REMOTE.getCurrentWindow();

        oCurrWin.webContents.findInPage(sValue);

    }; // end of oAPP.events.ev_winTxtSrchLibChgWS20

    /************************************************************************
     * [WS10 / WS20] Browser Pin Button Event
     ************************************************************************/
    oAPP.events.ev_windowPinBtn = function (oEvent) {

        var oCurrWin = REMOTE.getCurrentWindow(),
            bIsPress = oEvent.getParameter("pressed");

        oCurrWin.setAlwaysOnTop(bIsPress); //최상위 처리 

    }; // end of oAPP.events.ev_windowPinBtn

    /************************************************************************
     * [WS10] Window Menu Click Event
     ************************************************************************/
    oAPP.events.ev_pressWMenu10 = function (oEvent) {

        var oBindCtx = oEvent.getSource().getBindingContext(),
            sBindPath = oBindCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath),
            sKey = oBindData.key;

        var oBtn = oEvent.getSource();

        var oMenu = oAPP.wmenu.WS10[sKey];
        if (oMenu == null) {
            return;
        }

        var oModel = oMenu.getModel();
        if (oModel) {
            oModel.refresh(true);
        }

        oMenu.openBy(oBtn);

    }; // end of oAPP.events.ev_pressWMenu10

    /************************************************************************
     * [WS20] Window Menu Click Event
     ************************************************************************/
    oAPP.events.ev_pressWMenu20 = function (oEvent) {

        var oBindCtx = oEvent.getSource().getBindingContext(),
            sBindPath = oBindCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath),
            sKey = oBindData.key;

        var oBtn = oEvent.getSource();

        var oMenu = oAPP.wmenu.WS20[sKey];
        if (oMenu == null) {
            return;
        }

        var oModel = oMenu.getModel();
        if (oModel) {
            oModel.refresh(true);
        }

        oMenu.openBy(oBtn);

    }; // end of oAPP.events.ev_pressWMenu20

    /************************************************************************
     * [WS20] Window Menu Click Event
     ************************************************************************/
    oAPP.events.ev_pressWMenu30 = (oEvent) => {

        var oBindCtx = oEvent.getSource().getBindingContext(),
            sBindPath = oBindCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath),
            sKey = oBindData.key;

        var oBtn = oEvent.getSource();

        var oMenu = oAPP.wmenu.WS30[sKey];
        if (oMenu == null) {
            return;
        }

        var oModel = oMenu.getModel();
        if (oModel) {
            oModel.refresh(true);
        }

        oMenu.openBy(oBtn);

    }; // end of oAPP.events.ev_pressWMenu30

    /************************************************************************
     * [WS10] Window Menu Item Click Event
     ************************************************************************/
    oAPP.events.ev_pressWmenuItemWS10 = function (oEvent) {

        var oSelectedItem = oEvent.getParameter("item"),
            oBindCtx = oSelectedItem.getBindingContext(),
            sBindPath = oBindCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath),
            sItemKey = oBindData.key;


        var sPrefix = "fnWS10",
            fName = sPrefix + sItemKey;

        if (oAPP.fn[fName] == null) {
            return;
        }

        oAPP.fn[fName]();

    }; // end of oAPP.events.ev_pressWmenuItemWS10

    /************************************************************************
     * [WS20] Window Menu Item Click Event
     ************************************************************************/
    oAPP.events.ev_pressWmenuItemWS20 = function (oEvent) {

        var oSelectedItem = oEvent.getParameter("item"),
            oBindCtx = oSelectedItem.getBindingContext(),
            sBindPath = oBindCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath),
            sItemKey = oBindData.key;

        var sPrefix = "fnWS20",
            fName = sPrefix + sItemKey;

        if (oAPP.fn[fName] == null) {
            return;
        }

        oAPP.fn[fName]();

    }; // end of oAPP.events.ev_pressWmenuItemWS20

    // /************************************************************************
    //  * [WS20] Binding Popup 버튼 이벤트
    //  ************************************************************************/
    // oAPP.events.ev_pressBindPopupBtn = (oEvent) => {

    //     // busy 키고 Lock 걸기
    //     oAPP.common.fnSetBusyLock("X");

    //     // Trial Version Check
    //     if (oAPP.fn.fnOnCheckIsTrial()) {
            
    //         // busy 끄고 Lock 풀기
    //         oAPP.common.fnSetBusyLock("");

    //         return;
    //     }

    //     oAPP.fn.fnBindWindowPopupOpener();

    // }; // end of oAPP.events.ev_pressBindPopupBtn

    /************************************************************************
     * [WS20] Binding Popup 버튼 이벤트
     ************************************************************************/
    oAPP.events.ev_pressBindPopupBtn = (oEvent) => {
   
        var _sOption = {
            TITLE: "",
            DESC : "",
        };

        //218  바인딩 팝업을 호출하고 있습니다.
        _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "218"); 


        parent.setBusy("X", _sOption);

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            
            parent.setBusy("", {});

            return;
        }

        oAPP.fn.fnBindWindowPopupOpener();

    }; // end of oAPP.events.ev_pressBindPopupBtn

    /************************************************************************
     * Browser Zoom 버튼 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_pressZoomBtn = function (oEvent) {

        var oBtn = oEvent.getSource();

        oAPP.fn.setWinZoomPopup(oBtn);

    }; // end of oAPP.events.ev_pressZoomBtn 

    // /************************************************************************
    //  * WS20의 멀티 메시지 리스트 아이템 클릭 이벤트
    //  ************************************************************************/
    // oAPP.events.ev_pressFooterMsgColListItem = function (oEvent) {

    //     var oCtx = oEvent.getSource().getBindingContext(),
    //         sBindPath = oCtx.sPath,
    //         oBindData = oCtx.getProperty(sBindPath);

    //     // 하위로직 수행..


    // }; // end of oAPP.events.ev_pressFooterMsgColListItem  

    /************************************************************************
     * WS20 TCode 엔터 이벤트
     ************************************************************************/
    oAPP.events.ev_pressTcodeInputSubmit = (oEvent) => {

        var oSrchField = oEvent.getSource(),
            oAppInfo = oEvent.getParameter("oAppInfo"),
            sValue = oEvent.getParameter("query"),
            bIsPressClearBtn = oEvent.getParameter("clearButtonPressed");

        if (bIsPressClearBtn) {

            oSrchField.setValue("");

            oSrchField.fireSuggest();

            return;
        }

        if (sValue == "") {
            return;
        }

        // 엔터를 친게 아니면 모두 빠져나간다.
        if (!event || event.keyCode !== 13) {
            return;
        }

        // 입력한 TCODE 대문자로 변환
        var sTcode = sValue.toUpperCase();

        // 정규식으로 허용된 특수문자 및 T-code 형식 체크
        var sRegEx = /^[a-zA-Z0-9/_]*$/;
        if (!sRegEx.test(sTcode)) {

            // 메시지 처리 후 리턴            
            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "062", sTcode); // & invalid transaction ID.

            // 현재 페이지의 위치를 구한다.
            let sCurrPage = parent.getCurrPage();

            // 페이지 위치에 맞는 플로팅 메시지를 뿌린다.
            APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

            oSrchField.setValue("");

            return;
        }

        // 대문자로 변환한 값 SearchField 에 setValue
        oSrchField.setValue(sTcode);

        // TCODE 정보를 개인화에 저장
        oAPP.fn.fnSaveTCodeSuggestion(sTcode);

        // 저장한 TCODE를 다시 가져와서 Suggestion 갱신
        var aNewSugg = oAPP.fn.fnReadTCodeSuggestion();

        APPCOMMON.fnSetModelProperty("/SUGG/TCODE", aNewSugg);

        APPCOMMON.execControllerClass(null, null, sTcode, oAppInfo);

    }; // end of oAPP.events.ev_pressTcodeInputSubmit

    /************************************************************************
     * [공통] sap Tcode Suggestion
     ************************************************************************/
    oAPP.events.ev_suggestSapTcode = (oEvent) => {

        var oInput = oEvent.getSource(),
            sValue = oEvent.getParameter("suggestValue"),
            aFilters = [];

        if (sValue) {

            aFilters = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("TCODE", function (sText) {
                        return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                    }),
                ], false)
            ];

        }

        oInput.getBinding("suggestionItems").filter(aFilters);
        oInput.suggest();

    };

})(window, $, oAPP);