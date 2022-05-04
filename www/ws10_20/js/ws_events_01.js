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

        oAPP.common.fnMultiFooterMsgClose();

    }; // end of oAPP.events.fnPressMultiFooterMsgCloseBtn

    /************************************************************************
     * [WS20] Find Button Event
     ************************************************************************/
    oAPP.events.ev_pressFindBtn = function () {

        oAPP.fn.fnFindPopupOpener();

    }; // end of oAPP.events.ev_pressFindBtn

    /************************************************************************
     * [WS10] Text Search Button Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchWS10 = function (oEvent) {


        oAPP.fn.fnTextSearchPopupOpener();


        return;

        var oModelData = oAPP.common.fnGetModelProperty("/WS10/SRCHTXT"),
            bSrchInpVisi = oModelData.INPUT_VISI;

        oModelData.INPUT_VISI = !bSrchInpVisi;

        sap.ui.getCore().getModel().refresh(true);

    }; // end of oAPP.events.ev_winTxtSrchWS10

    /************************************************************************
     * [WS20] Text Search Button Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchWS20 = function (oEvent) {

        var oModelData = oAPP.common.fnGetModelProperty("/WS20/SRCHTXT"),
            bSrchInpVisi = oModelData.INPUT_VISI;

        oModelData.INPUT_VISI = !bSrchInpVisi;

        sap.ui.getCore().getModel().refresh(true);

    }; // end of oAPP.events.ev_winTxtSrchWS20

    /************************************************************************
     * [WS10] Text Search Button Close Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchClsWS10 = function (oEvent) {

        var oCurrWin = REMOTE.getCurrentWindow();
        oCurrWin.webContents.stopFindInPage("clearSelection");

        var oSearchInput = sap.ui.getCore().byId("txtSrchInputWS10");
        if (oSearchInput == null) {
            return;
        }

        var $oInput = oSearchInput.$();
        if (!$oInput.length) {
            return;
        }

        $oInput.animate({
            maxWidth: "50px",
            minWidth: "50px",
        }, 300, "linear", function () {

            setTimeout(function () {

                var oModelData = oAPP.common.fnGetModelProperty("/WS10/SRCHTXT"),
                    bSrchInpVisi = oModelData.INPUT_VISI;

                oModelData.INPUT_VALUE = "";
                oModelData.INPUT_VISI = !bSrchInpVisi;

                sap.ui.getCore().getModel().refresh(true);

            }, 200);

        });

    }; // end of oAPP.events.ev_winTxtSrchClsWS10

    /************************************************************************
     * [WS20] Text Search Button Close Event
     ************************************************************************/
    oAPP.events.ev_winTxtSrchClsWS20 = function (oEvent) {

        var oCurrWin = REMOTE.getCurrentWindow();
        oCurrWin.webContents.stopFindInPage("clearSelection");

        var oSearchInput = sap.ui.getCore().byId("txtSrchInputWS20");
        if (oSearchInput == null) {
            return;
        }

        var $oInput = oSearchInput.$();
        if (!$oInput.length) {
            return;
        }

        $oInput.animate({
            maxWidth: "50px",
            minWidth: "50px",
        }, 300, "linear", function () {

            setTimeout(function () {

                var oModelData = oAPP.common.fnGetModelProperty("/WS20/SRCHTXT"),
                    bSrchInpVisi = oModelData.INPUT_VISI;

                oModelData.INPUT_VALUE = "";
                oModelData.INPUT_VISI = !bSrchInpVisi;

                sap.ui.getCore().getModel().refresh(true);

            }, 200);

        });

    }; // end of oAPP.events.ev_winTxtSrchClsWS20

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

        oMenu.openBy(oBtn);

    }; // end of oAPP.events.ev_pressWMenu20

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

    /************************************************************************
     * [WS20] Binding Popup 버튼 이벤트
     ************************************************************************/
    oAPP.events.ev_pressBindPopupBtn = (oEvent) => {

        var sPopupName = "BINDPOPUP";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Binding Popup";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;

        oBrowserOptions.backgroundColor = "#1c2228";

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 실행할 URL
        var sUrlPath = PATH.join(APPPATH, "ws10_20", "bindPopup", "frame.html");

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oBindPopupData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보 (필수)
                T_9011: oAPP.DATA.LIB.T_9011,
                oAppInfo: parent.getAppInfo(),
                servNm: parent.getServerPath(),
            };

            oBrowserWindow.webContents.send('if_modelBindingPopup', oBindPopupData);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // // IPCMAIN 이벤트 해제
            // IPCMAIN.off(`${BROWSKEY}--find`, oAPP.fn.fnIpcMain_Find);
            // IPCMAIN.off(`${BROWSKEY}--find--controller`, oAPP.fn.fnIpcMain_Find_Controller);

            oBrowserWindow = null;

        });

        // // 선택한 UI 정보를 WS20에 표시
        // IPCMAIN.on(`${BROWSKEY}--find`, oAPP.fn.fnIpcMain_Find);

        // // 선택한 UI 정보를 가지고 controller(class builder) 실행
        // IPCMAIN.on(`${BROWSKEY}--find--controller`, oAPP.fn.fnIpcMain_Find_Controller);


    }; // end of oAPP.events.ev_pressBindPopupBtn

    /************************************************************************
     * Browser Zoom 버튼 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_pressZoomBtn = function (oEvent) {

        var oBtn = oEvent.getSource();

        oAPP.fn.setWinZoomPopup(oBtn);

    }; // end of oAPP.events.ev_pressZoomBtn 

    /************************************************************************
     * WS20의 멀티 메시지 리스트 아이템 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_pressFooterMsgColListItem = function (oEvent) {

        var oCtx = oEvent.getSource().getBindingContext(),
            sBindPath = oCtx.sPath,
            oBindData = oCtx.getProperty(sBindPath);

        // 하위로직 수행..


    }; // end of oAPP.events.ev_pressFooterMsgColListItem  

})(window, $, oAPP);