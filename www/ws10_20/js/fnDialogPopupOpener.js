/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnDialogPopupOpener.js
 * - file Desc : 각종 Dialog Popup Opener
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        PATH = parent.PATH,
        APPPATH = parent.APPPATH,
        REMOTE = parent.REMOTE,
        USERDATA = parent.USERDATA,
        REMOTEMAIN = parent.REMOTEMAIN,
        CURRWIN = REMOTE.getCurrentWindow(),
        IPCMAIN = parent.IPCMAIN,
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        APPCOMMON = oAPP.common;


    /************************************************************************
     * APP 검색 Popup 
     ************************************************************************
     * @param {Object} oOptions
     * - 검색 팝업 실행 시, 기본 옵션
     * @param {Boolean} [oOptions.autoSearch] 팝업 실행하자마자 자동검색
     * @param {Object}  [oOptions.initCond] 
     * - 초기 조회 조건 설정
     * @param {String}  [oOptions.initCond.PACKG] Package
     * @param {String}  [oOptions.initCond.APPID] Application ID
     * @param {String}  [oOptions.initCond.APPNM] Application Desc
     * @param {String}  [oOptions.initCond.ERUSR] Create User
     * @param {Int}     [oOptions.initCond.HITS]  Max Count
     ************************************************************************/
    oAPP.fn.fnAppF4PopupOpener = function (oOptions, fnAppF4DataCallback) {

        if (oAPP.fn.fnAppF4PopupOpen) {
            oAPP.fn.fnAppF4PopupOpen(oOptions, fnAppF4DataCallback);
            return;
        }

        oAPP.loadJs("fnAppF4PopupOpen", function () {
            oAPP.fn.fnAppF4PopupOpen(oOptions, fnAppF4DataCallback);
        });

    }; // end of oAPP.fn.fnAppF4PopupOpener

    /************************************************************************
     * WS20의 찾기 버튼 팝업 실행시켜 주는 메소드
     ************************************************************************/
    oAPP.fn.fnFindPopupOpener = function () {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnFindPopupOpen) {
            oAPP.fn.fnFindPopupOpen();
            return;
        }

        oAPP.loadJs("fnFindPopupOpen", function () {
            oAPP.fn.fnFindPopupOpen();
        });

    }; // end of oAPP.fn.fnFindPopupOpener

    /************************************************************************
     * WS20의 CSS & JS Link Add 팝업 실행시켜 주는 메소드
     ************************************************************************/
    oAPP.fn.fnCssJsLinkAddPopupOpener = function (TYPE) {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnCssJsLinkAddPopupOpen) {
            oAPP.fn.fnCssJsLinkAddPopupOpen(TYPE);
            return;
        }

        oAPP.loadJs("fnCssJsLinkAddPopupOpen", function () {
            oAPP.fn.fnCssJsLinkAddPopupOpen(TYPE);
        });

    }; // end of oAPP.fn.fnCssJsLinkAddPopupOpen

    /************************************************************************
     * WS20의 Web Security 팝업 실행시켜 주는 메소드
     ************************************************************************/
    oAPP.fn.fnWebSecurityPopupOpener = function () {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnWebSecurityPopupOpen) {
            oAPP.fn.fnWebSecurityPopupOpen();
            return;
        }

        oAPP.loadJs("fnWebSecurityPopupOpen", function () {
            oAPP.fn.fnWebSecurityPopupOpen();
        });

    }; // end of oAPP.fn.fnWebSecurityPopupOpener

    /************************************************************************
     * WS20의 Client Event 팝업 실행시켜 주는 메소드
     ************************************************************************/
    oAPP.fn.fnClientEditorPopupOpener = function (TYPE, PARAM, fnCallback) {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnClientEditorPopupOpen) {
            oAPP.fn.fnClientEditorPopupOpen(TYPE, PARAM, fnCallback);
            return;
        }

        oAPP.loadJs("fnClientEditorPopupOpen", function () {
            oAPP.fn.fnClientEditorPopupOpen(TYPE, PARAM, fnCallback);
        });

    }; // end of oAPP.fn.fnClientEditorPopupOpener

    /************************************************************************
     * WS20의 Error Page Editor 팝업 실행시켜 주는 메소드
     ************************************************************************/
    oAPP.fn.fnErrorPageEditorPopupOpener = function () {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // Error Page Editor Popup Open
        if (oAPP.fn.fnErrorPageEditorPopupOpen) {
            oAPP.fn.fnErrorPageEditorPopupOpen();
            return;
        }

        oAPP.loadJs("fnErrorPageEditorPopupOpen", function () {
            oAPP.fn.fnErrorPageEditorPopupOpen();
        });

    }; // end of oAPP.fn.fnErrorPageEditorPopupOpener

    /************************************************************************
     * WS10의 Application Copy 팝업 실행시켜 주는 메소드
     * **********************************************************************
     * @param {String} sAppId  
     * - 복사할 APPID
     * **********************************************************************/
    oAPP.fn.fnAppCopyPopupOpener = function (sAppId) {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // Application Copy Popup Open
        if (oAPP.fn.fnAppCopyPopupOpen) {
            oAPP.fn.fnAppCopyPopupOpen(sAppId);
            return;
        }

        oAPP.loadJs("fnAppCopyPopupOpen", function () {
            oAPP.fn.fnAppCopyPopupOpen(sAppId);
        });

    }; // end of oAPP.fn.fnAppCopyPopupOpener

    /************************************************************************
     * Package 정보 Search Help Popup 호출
     * **********************************************************************
     * @param {function} fnCallback  
     * - Package 정보 Search Help Popup 호출후 선택한 Package 값 리턴 콜백 메소드
     * **********************************************************************/
    oAPP.fn.fnPackgSchpPopupOpener = function (fnCallback) {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.callF4HelpPopup) {
            //f4 help 팝업 function load 이후 팝업 호출.
            oAPP.fn.callF4HelpPopup("DEVCLASS", "DEVCLASS", [], [], fnCallback);
            return;
        }

        $.getScript("design/js/callF4HelpPopup.js", function () {
            //f4 help 팝업 function load 이후 팝업 호출.
            oAPP.fn.callF4HelpPopup("DEVCLASS", "DEVCLASS", [], [], fnCallback);
        });

    }; // end of oAPP.fn.fnPackgSchpPopupOpener

    /************************************************************************
     * UI Template Wizard Popup
     * **********************************************************************
     * @param {Object} oTempData  
     * - Ui Template 관련 정보
     * **********************************************************************/
    oAPP.fn.fnUiTempWizardPopupOpener = function (oTempData) {

        if (oAPP.fn.fnUiTempWizardPopupOpen) {
            oAPP.fn.fnUiTempWizardPopupOpen(oTempData);
            return;
        }

        oAPP.loadJs("fnUiTempWizardPopupOpen", function () {
            oAPP.fn.fnUiTempWizardPopupOpen(oTempData);
        });

    }; // end of oAPP.fn.fnUiTempWizardPopupOpener

    /************************************************************************
     * CTS popup 실행 시켜주는 메소드
     * **********************************************************************
     * @param {function} lf_success  
     * - CTS popup 실행 후 선택한 CTS 값 리턴 콜백 메소드
     * **********************************************************************/
    oAPP.fn.fnCtsPopupOpener = function (lf_success) {

        if (oAPP.fn.fnCtsPopupOpen) {
            oAPP.fn.fnCtsPopupOpen(lf_success);
            return;
        }

        oAPP.loadJs("fnCtsPopupOpen", function () {
            oAPP.fn.fnCtsPopupOpen(lf_success);
        });

    }; // end of oAPP.fn.fnCtsPopupOpener

    /************************************************************************
     * Bind Popup Opener
     * **********************************************************************
     * @param {String} sTitle  
     * - 바인딩 팝업의 헤더 타이틀
     * 
     * @param {String} sKind  
     * - "T": Table
     * - "S": Structure
     * 
     * @param {function} fnCallback
     * - Callback function
     * **********************************************************************/
    oAPP.fn.fnBindPopupOpener = function (sTitle, sKind, fnCallback) {

        //대상 function이 존재하는경우 호출 처리.
        if (typeof oAPP.fn.callBindPopup !== "undefined") {
            oAPP.fn.callBindPopup(sTitle, sKind, fnCallback);
            return;
        }

        //대상 function이 존재하지 않는경우 script 호출.
        oAPP.fn.getScript("design/js/callBindPopup", function () {
            oAPP.fn.callBindPopup(sTitle, sKind, fnCallback);
        });

    }; // end of oAPP.fn.fnBindPopupOpener

    /************************************************************************
     * [WS20] Binding Popup 버튼 이벤트
     ************************************************************************/
    oAPP.fn.fnBindWindowPopupOpener = () => {

        var sPopupName = "BINDPOPUP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Binding Popup";
        oBrowserOptions.width = 1000;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.center = true;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oBindPopupData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보 (필수)
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                T_9011: oAPP.DATA.LIB.T_9011,
                oAppInfo: parent.getAppInfo(),
                servNm: parent.getServerPath(),
            };

            oBrowserWindow.webContents.send('if_modelBindingPopup', oBindPopupData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnBindWindowPopupOpener

    /************************************************************************
     * Text 검색 팝업 (electron 기능)
     ************************************************************************/
    oAPP.fn.fnTextSearchPopupOpener = function () {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var sPopupName = "TXTSRCH";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.titleBarStyle = "hidden";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.width = 380;
        oBrowserOptions.height = 60;
        oBrowserOptions.frame = false;
        oBrowserOptions.transparent = true;
        oBrowserOptions.resizable = false;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds();
        oBrowserWindow.setBounds({
            x: Math.round((oParentBounds.x + oParentBounds.width) - 390),
            y: Math.round((oParentBounds.y) + 30)
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {


        });

        function lf_move() {

            let oNewBounds = {};
            let oCurrWinBounds = CURRWIN.getBounds();

            oNewBounds.x = (oCurrWinBounds.x + oCurrWinBounds.width) - 390;
            oNewBounds.y = oCurrWinBounds.y + 30;

            oBrowserWindow.setBounds(oNewBounds);
        }

        CURRWIN.on('move', lf_move);
        CURRWIN.on('resize', lf_move);

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            CURRWIN.off("move", lf_move);
            CURRWIN.off("resize", lf_move);

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnTextSearchPopupOpener

    /************************************************************************
     * Document Popup Open
     ************************************************************************/
    oAPP.fn.fnDocuPopupOpener = function () {

        var sPopupName = "APPDOCU";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보  

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Document";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oDocuData = {
                USERINFO: parent.getUserInfo(),
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                APPINFO: parent.getAppInfo(),
                SERVPATH: parent.getServerPath()
            };

            oBrowserWindow.webContents.send('if-appdocu-info', oDocuData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnDocuPopupOpener

    /************************************************************************
     * WS Options Popup Opener
     ************************************************************************/
    oAPP.fn.fnWsOptionsPopupOpener = () => {

        let sPopupName = "WSOPTS";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oServerInfo = parent.getServerInfo(), // 서버 정보
            sSysID = oServerInfo.SYSID, // System ID
            oThemeInfo = parent.getThemeInfo(); // 테마 개인화 정보

        // Browswer Options
        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "WS Options";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oOptionData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
            };

            oBrowserWindow.webContents.send('if-ws-options-info', oOptionData);
            oBrowserWindow.webContents.send('option-initData', {
                SYSID: sSysID,
                THEME_INFO: oThemeInfo
            });

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnWsOptionsPopupOpener

    /************************************************************************
     * U4A Help Document Popup Opener
     ************************************************************************/
    oAPP.fn.fnU4AHelpDocuPopupOpener = () => {

        let sPopupName = "U4ADOCU";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보  

        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "U4A Help Documents";
        oBrowserOptions.width = 350;
        oBrowserOptions.height = 500;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oDocuData = {
                oUserInfo: parent.getUserInfo(),
                oThemeInfo: oThemeInfo, // 테마 개인화 정보               
            };

            oBrowserWindow.webContents.send('if-u4adocu-info', oDocuData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnU4ADocuPopupOpener

    /************************************************************************
     * WS APP Import/Export Popup Opener
     * **********************************************************************
     * @param {String} sFlag  
     * - IMPORT : Application Import
     * - EXPORT : Application Export
     * **********************************************************************/
    oAPP.fn.fnWsImportExportPopupOpener = (sFlag) => {

        let sPopupName = "IMPEXPPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        if (sFlag == "EXPORT") {

            // application명 정합성 체크
            let bCheckAppNm = oAPP.fn.fnCheckAppName();
            if (!bCheckAppNm) {
                return;
            }

        }

        let sAppId = APPCOMMON.fnGetModelProperty("/WS10/APPID"),
            sServerPath = parent.getServerPath(),
            oBrowserOptions = {
                "height": 400,
                "width": 400,
                "transparent": true,
                "frame": false,
                "resizable": false,
                "maximizable": false,
                "minimizable": false,
                "icon": "www/img/logo.png",
                "webPreferences": {
                    "devTools": true,
                    "nodeIntegration": true,
                    "enableRemoteModule": true,
                    "contextIsolation": false,
                    "nativeWindowOpen": true,
                    "webSecurity": false
                }

            };

        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.title = sFlag;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.modal = true;
        oBrowserOptions.parent = CURRWIN;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var oSendData = {
            BROWSKEY: BROWSKEY,
            SERVPATH: sServerPath,
            PRCCD: sFlag,
            APPID: ""
        };

        if (sFlag == "EXPORT") {
            oSendData.APPID = sAppId;
        }

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oBrowserWindow.webContents.send("export_import-INITDATA", oSendData);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}--export_import-IMPORT`, oAPP.fn.fnIpcMain_export_import_IMPORT);
            IPCMAIN.off(`${BROWSKEY}--export_import-EXPORT`, oAPP.fn.fnIpcMain_export_import_EXPORT);

            oBrowserWindow = null;

        });

        // IPCMAIN 이벤트
        IPCMAIN.on(`${BROWSKEY}--export_import-IMPORT`, oAPP.fn.fnIpcMain_export_import_IMPORT);
        IPCMAIN.on(`${BROWSKEY}--export_import-EXPORT`, oAPP.fn.fnIpcMain_export_import_EXPORT);

    }; // end of oAPP.fn.fnWsImportExportPopupOpener


    /************************************************************************
     * About U4A Popup Opener
     ************************************************************************/
    oAPP.fn.fnAboutU4APopupOpener = () => {

        let sPopupName = "ABOUTU4APOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let sServerPath = parent.getServerPath(),
            oBrowserOptions = {
                "height": 640,
                "width": 500,
                "resizable": false,
                "fullscreenable": true,
                "maximizable": false,
                "minimizable": false,
                "icon": "www/img/logo.png",
                "webPreferences": {
                    "devTools": true,
                    "nodeIntegration": true,
                    "enableRemoteModule": true,
                    "contextIsolation": false,
                    "nativeWindowOpen": true,
                    "webSecurity": false
                }

            };

        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.title = "About U4A";
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.modal = true;
        oBrowserOptions.parent = CURRWIN;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var oSendData = {
            SERVPATH: sServerPath
        };

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oBrowserWindow.webContents.send("if-about-u4a", oSendData);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnAboutU4APopupOpener

    /************************************************************************
     * Runtime Class Navigator Popup Opener
     ************************************************************************/
    oAPP.fn.fnRuntimeClassNaviPopupOpener = () => {

        var sWinObjType = "RTMCLS";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {
            return;
        }

        var SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo(),
            sUrl = parent.getPath(sWinObjType);

        let oThemeInfo = parent.getThemeInfo(); // theme 정보      

        // 브라우저 옵션 설정
        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Runtime Class Navigator";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기        
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(sUrl);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oRuntimeInfo = {
                oUserInfo: oUserInfo,
                oThemeInfo: oThemeInfo,
                aRuntimeData: oAPP.DATA.LIB.T_0022
            };

            // 오픈할 URL 파라미터 전송
            oBrowserWindow.webContents.send('if-runtime-info', oRuntimeInfo);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    }; // end of oAPP.fn.fnRuntimeClassNaviPopupOpener

    /************************************************************************
     * Font Style Wizard
     ************************************************************************/
    oAPP.fn.fnFontStyleWizardPopupOpener = () => {

        var sWinObjType = "FONTSTYLE";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {
            return;
        }

        var SESSKEY = parent.getSessionKey(),
            oMeta = APPCOMMON.fnGetModelProperty("/METADATA"),
            oServerInfo = parent.getServerInfo(),
            oServerHost = parent.getServerHost(),
            oUserInfo = parent.getUserInfo();

        // 실행시킬 호스트명 + U4A URL 만들기

        var sHost = oServerHost,
            sUrl = encodeURI(`${sHost}/zu4a_imp/cssfontstylewizrd?sap-user=${oUserInfo.ID}&sap-password=${oUserInfo.PW}`);

        // 브라우저 옵션 설정
        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "U4A Workspace: Font Style";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.nodeIntegration = false;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(sUrl);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    }; // end of oAPP.fn.fnFontStyleWizardPopupOpener

    /************************************************************************
     * Icon List Popup Opener
     ************************************************************************/
    oAPP.fn.fnIconListPopupOpener = () => {

        var sWinObjType = "ICONLIST",
            sHost = parent.getServerHost(),
            oUserInfo = parent.getUserInfo(),
            sServerPath = parent.getServerPath(),
            sIconListUrl = sHost + "/zu4a_acs/icon_exp?sap-user=" + oUserInfo.ID + "&sap-password=" + oUserInfo.PW + "&sap-language=" + oUserInfo.LANGU + "&WS=X#/overview/SAP-icons",
            sUrl = encodeURI(sIconListUrl),
            // sUrl = encodeURI("/zu4a_acs/icon_exp?WS=X#/overview/SAP-icons"),
            sPath = sServerPath + "/external_open?URL=" + encodeURIComponent(sUrl);

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {

            oResult.WINDOW.webContents.send('if-extopen-url', sPath);
            return;

        }

        var oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSERKEY = parent.getBrowserKey();

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Icon List";
        oBrowserOptions.url = sPath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSERKEY;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        oAPP.fn.fnExternalOpen(oBrowserOptions);

    }; // end of oAPP.fn.fnIconListPopupOpener

    /************************************************************************
     * WS20의 하단 멀티 푸터 메시지 처리
     * **********************************************************************/
    oAPP.fn.fnMultiFooterMsg = function (aMsg) {

        var sPopupName = "ERRMSGPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보 

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Error Message Popup";
        oBrowserOptions.center = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.titleBarStyle = "hidden";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.height = 400;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oSendData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                aMsg: aMsg
            };

            oBrowserWindow.webContents.send('if-errmsg-info', oSendData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}--errormsg--click`, oAPP.fn.fnIpcMain_errmsg_click);

            oBrowserWindow = null;

        });


        IPCMAIN.on(`${BROWSKEY}--errormsg--click`, oAPP.fn.fnIpcMain_errmsg_click);


    }; // end of oAPP.fn.fnMultiFooterMsg

    /************************************************************************
     * WS20의 UI Property 도움말
     * **********************************************************************/
    oAPP.fn.fnPropertyHelpPopup = function (sUrl) {

        var sWinObjType = "PROPHELP",
            sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(sUrl + "&WS=X");

        // 테스트 목적임.
        if (typeof sUrl !== "string") {
            var testUrl = "/ZU4A_ACS/U4A_API_DOCUMENT?VER=1.77.2&CLSNM=sap.m.Page&GUBUN=1&PROPID=showFooter&UIOBK=UO00389";
            sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(testUrl + "&WS=X");
        }

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {

            oResult.WINDOW.webContents.send('if-extopen-url', sPath);
            return;

        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Property Help";
        oBrowserOptions.url = sPath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        oAPP.fn.fnExternalOpen(oBrowserOptions);

    }; // end of oAPP.fn.fnPropertyHelpPopup   

    /************************************************************************
     * Editor Popup Opener
     * **********************************************************************/
    oAPP.fn.fnEditorPopupOpener = (oEditorInfo, sSearchValue) => {

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo, sSearchValue);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo, sSearchValue);
        });

    }; // end of oAPP.fn.fnEditorPopupOpener

    /************************************************************************
     * Release Note Popup Opener
     * **********************************************************************/
    oAPP.fn.fnReleaseNotePopupOpener = () => {

        var sPopupName = "RELNOTEPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보  

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        // oBrowserOptions.title = "Document";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.height = 700;
        oBrowserOptions.width = 700;
        oBrowserOptions.minWidth = 700;
        oBrowserOptions.minHeight = 600;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {         

            var oData = {
                USERINFO: parent.getUserInfo(), // User 정보
                oThemeInfo: oThemeInfo, // 테마 개인화 정보                
                ISCDN: parent.getIsCDN(), // CDN 허용 여부,
                SERVPATH: parent.getServerPath() // ws service path
            };

            oBrowserWindow.webContents.send('if-relnote-info', oData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnReleaseNotePopupOpener

    /************************************************************************
     * [WS20] 디자인영역 Layout 변경 기능 팝업
     * **********************************************************************/
    oAPP.fn.callDesignLayoutChangePopupOpener = () => {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.callDesignLayoutChangePopup) {
            oAPP.fn.callDesignLayoutChangePopup();
            return;
        }

        $.getScript("design/js/callDesignLayoutChangePopup.js", function () {
            oAPP.fn.callDesignLayoutChangePopup();
        });

    }; // end of oAPP.fn.callDesignLayoutChangePopupOpener

})(window, $, oAPP);