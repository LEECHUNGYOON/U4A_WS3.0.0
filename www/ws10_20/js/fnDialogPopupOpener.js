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
        APP = parent.APP,
        APPPATH = parent.APPPATH,
        REMOTE = parent.REMOTE,
        USERDATA = parent.USERDATA,
        REMOTEMAIN = parent.REMOTEMAIN,
        CURRWIN = REMOTE.getCurrentWindow(),
        IPCMAIN = parent.IPCMAIN,
        IPCRENDERER = parent.IPCRENDERER,
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        WSUTIL = parent.require(parent.PATHINFO.WSUTIL),
        PATHINFO = parent.PATHINFO,
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
     * @param {String}  [oOptions.initCond.APPTY] Application Type
     * @param {String}  [oOptions.initCond.EXPAGE] 
     * - 팝업을 실행하려는 Page 명
     * - 예) WS10, WS20, WS30
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

        // 서버이벤트 리스트를 구한다.
        // oAPP.fn.getServerEventList(function (aServerEventList) {

        if (oAPP.fn.fnFindPopupOpen) {
            oAPP.fn.fnFindPopupOpen();
            return;
        }

        oAPP.loadJs("fnFindPopupOpen", function () {
            oAPP.fn.fnFindPopupOpen();
        });

        // });

    }; // end of oAPP.fn.fnFindPopupOpener

    /************************************************************************
     * WS20의 MIME Dialog Opener
     ************************************************************************/
    oAPP.fn.fnMimeDialogOpener = function () {

        if (oAPP.fn.fnMimePopupOpen) {
            oAPP.fn.fnMimePopupOpen();
            return;
        }

        oAPP.loadJs("fnMimePopupOpen", function () {
            oAPP.fn.fnMimePopupOpen();
        });

    }; // end of fnMimeDialogOpener

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

    oAPP.fn.fnBindPopupIpcCallBack = () => {

        // busy 끄고 Lock 끄기
        oAPP.common.fnSetBusyLock("");


    }; // end of oAPP.fn.fnBindPopupIpcCallBack

    /************************************************************************
     * [WS20] Binding Popup 버튼 이벤트
     ************************************************************************/
    oAPP.fn.fnBindWindowPopupOpener = () => {

        // busy 키고 Lock 켜기
        oAPP.common.fnSetBusyLock("X");

        var sPopupName = "BINDPOPUP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            // busy 키고 Lock 켜기
            oAPP.common.fnSetBusyLock("");
            return;
        }

        // Binding Popup 에서 콜백 받을 준비를 한다.
        IPCRENDERER.on("if-bindPopup-callback", oAPP.fn.fnBindPopupIpcCallBack);

        let oThemeInfo = parent.getThemeInfo(); // theme 정보

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A15"); // Binding Popup
        oBrowserOptions.width = 1000;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oBindPopupData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보 (필수)
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                T_9011: oAPP.DATA.LIB.T_9011,
                oAppInfo: parent.getAppInfo(),
                servNm: parent.getServerPath(),
                SSID: parent.getSSID()
            };

            oBrowserWindow.webContents.send('if_modelBindingPopup', oBindPopupData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // busy & Lock 끄기
            oAPP.common.fnSetBusyLock("");

            oBrowserWindow = null;

            // Binding Popup 에서 콜백 이벤트 해제
            IPCRENDERER.off("if-bindPopup-callback", oAPP.fn.fnBindPopupIpcCallBack);

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnBindWindowPopupOpener

    /************************************************************************
     * 부모 윈도우 위치의 가운데 배치한다.
     ************************************************************************/
    oAPP.fn.setParentCenterBounds = (oBrowserWindow, oBrowserOptions) => {

        let oCurrWin = REMOTE.getCurrentWindow();

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = oCurrWin.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (oParentBounds.y > yPos) {
            yPos = oParentBounds.y + 10;
        }

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

    }; // end of oAPP.fn.setParentCenterBounds

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
            return;
        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        // oBrowserOptions.titleBarStyle = "hidden";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.width = 380;
        oBrowserOptions.minWidth = 380;
        oBrowserOptions.height = 60;
        oBrowserOptions.minHeight = 60;

        oBrowserOptions.frame = false;
        oBrowserOptions.thickFrame = false;
        // oBrowserOptions.show = false;
        // oBrowserOptions.opacity = 0.0;
        oBrowserOptions.transparent = true;
        oBrowserOptions.center = false;
        oBrowserOptions.resizable = false;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        oBrowserWindow.hide();

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        oBrowserWindow.once('ready-to-show', () => {
            lf_move();
        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            lf_move();

            setTimeout(() => {
                oBrowserWindow.show();
            }, 10);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            // WSUTIL.setBrowserOpacity(oBrowserWindow);

        });

        oBrowserWindow.webContents.on("dom-ready", function () {

            lf_move();

        });

        function lf_move() {

            let oCurrWin = REMOTE.getCurrentWindow();

            // // 팝업 위치를 부모 위치에 배치시킨다.
            var oParentBounds = oCurrWin.getBounds(),
                oBrowserBounds = oBrowserWindow.getBounds();

            let xPos = (oParentBounds.x + oParentBounds.width) - 390,
                yPos = Math.round((oParentBounds.y) + 30)

            if (oParentBounds.y > oBrowserBounds.y) {
                yPos = oParentBounds.y + 10;
            }

            oBrowserWindow.setBounds({
                x: xPos,
                y: yPos
            });

        }

        // 부모 창이 움직일려고 할때 타는 이벤트
        function lf_will_move() {

            lf_move();

            oBrowserWindow.hide();

        }

        // 부모 창이 움직임 완료 되었을 때 타는 이벤트
        function lf_moved() {

            lf_move();

            oBrowserWindow.show();

        }

        function lf_off() {

            CURRWIN.off("maximize", lf_move);
            CURRWIN.off("unmaximize", lf_move);

            CURRWIN.off('will-move', lf_will_move);
            CURRWIN.off("move", lf_move);
            CURRWIN.off('moved', lf_moved);

            // CURRWIN.off("moved", lf_move);
            // CURRWIN.off("will-move", lf_move);

            CURRWIN.off('will-resize', lf_will_move);
            CURRWIN.off('resize', lf_move);
            CURRWIN.off('resized', lf_moved);

            // CURRWIN.off("will-resize", lf_move);
            // CURRWIN.off("resize", lf_move);
            // CURRWIN.off("resized", lf_move);

            CURRWIN.off("restore", lf_move);

            CURRWIN.off("enter-full-screen", lf_move);
            CURRWIN.off("leave-full-screen", lf_move);

            REMOTE.screen.off('display-metrics-changed', lf_screenChange);

        }

        lf_off();


        CURRWIN.on('maximize', lf_move);
        CURRWIN.on('unmaximize', lf_move);

        // CURRWIN.on('moved', lf_move);
        // CURRWIN.on('will-move', lf_move);  

        CURRWIN.on('will-move', lf_will_move);
        CURRWIN.on('move', lf_move);
        CURRWIN.on('moved', lf_moved);

        CURRWIN.on('will-resize', lf_will_move);
        CURRWIN.on('resize', lf_move);
        CURRWIN.on('resized', lf_moved);

        // CURRWIN.on('will-resize', lf_move);
        // CURRWIN.on('resize', lf_move);
        // CURRWIN.on('resized', lf_move);        

        CURRWIN.on('restore', lf_move);
        CURRWIN.on('enter-full-screen', lf_move);
        CURRWIN.on('leave-full-screen', lf_move);


        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            lf_off();

            oBrowserWindow = null;

            CURRWIN.focus();

        });

        function lf_screenChange() {
            lf_move();
        }

        REMOTE.screen.on('display-metrics-changed', lf_screenChange);

    }; // end of oAPP.fn.fnTextSearchPopupOpener

    /************************************************************************
     * Design Tree의 UI 검색 팝업
     ************************************************************************/
    oAPP.fn.fnDesignTreeFindUiPopupOpen = (fnSearch, fnCancel) => {

        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var sPopupName = "DESIGNTREEUISRCH";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        // oBrowserOptions.titleBarStyle = "hidden";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.width = 380;
        oBrowserOptions.minWidth = 380;
        oBrowserOptions.height = 60;
        oBrowserOptions.minHeight = 60;

        oBrowserOptions.frame = false;
        oBrowserOptions.transparent = true;
        oBrowserOptions.center = false;
        oBrowserOptions.resizable = false;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        function lf_move() {

            // 팝업 위치를 부모 위치에 배치시킨다.          
            var oParentBounds = CURRWIN.getBounds();
            oBrowserWindow.setBounds({
                x: Math.round(oParentBounds.x + 170),
                y: Math.round(oParentBounds.y + 190),

                // x: Math.round((oParentBounds.x + oParentBounds.width / 2) - (oBrowserOptions.width / 2)),
                // y: Math.round(((oParentBounds.height / 2) + oParentBounds.y) - (oBrowserOptions.height / 2))
            });

        }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {
            lf_move();
        });

        oBrowserWindow.webContents.on("dom-ready", function () {
            lf_move();
        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            if (typeof fnCancel == "function") {
                fnCancel();
            }

            oBrowserWindow = null;

            // 각종 이벤트 끄기
            lf_off();

            CURRWIN.focus();

        });

        // 각종 이벤트 끄기
        function lf_off() {

            CURRWIN.off("move", lf_move);
            CURRWIN.off("resize", lf_move);
            CURRWIN.off("maximize", lf_move);
            CURRWIN.off("unmaximize", lf_move);

            CURRWIN.off("moved", lf_move);
            CURRWIN.off("will-move", lf_move);
            CURRWIN.off("restore", lf_move);
            CURRWIN.off("resized", lf_move);
            CURRWIN.off("will-resize", lf_move);
            CURRWIN.off("enter-full-screen", lf_move);
            CURRWIN.off("leave-full-screen", lf_move);

            REMOTE.screen.off('display-metrics-changed', lf_screenChange);

        }

        lf_off();

        /**
         * 브라우저 사이즈 변경, 이동 이벤트 걸기
         * 팝업이 부모 창 특정 위치에 따라다니는 효과
         */
        CURRWIN.on('move', lf_move);
        CURRWIN.on('resize', lf_move);
        CURRWIN.on('maximize', lf_move);
        CURRWIN.on('unmaximize', lf_move);

        CURRWIN.on('moved', lf_move);
        CURRWIN.on('will-move', lf_move);
        CURRWIN.on('restore', lf_move);
        CURRWIN.on('resized', lf_move);
        CURRWIN.on('will-resize', lf_move);
        CURRWIN.on('enter-full-screen', lf_move);
        CURRWIN.on('leave-full-screen', lf_move);

        function lf_screenChange() {
            lf_move();
        }

        // Display 해상도가 변경 되었을때 발생하는 이벤트
        REMOTE.screen.on('display-metrics-changed', lf_screenChange);

        // IPCMAIN 이벤트 (팝업과 Interface 용)
        IPCMAIN.on(`${BROWSKEY}--designTextSearch`, lf_DesignTextSearch);

        function lf_DesignTextSearch(event, res) {

            if (typeof fnSearch == "function") {
                fnSearch(res);
            }

        }

    }; // end of oAPP.fn.fnDesignTreeFindUiPopupOpen

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

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B65"); // Document
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oDocuData = {
                USERINFO: parent.getUserInfo(),
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                APPINFO: parent.getAppInfo(),
                SERVPATH: parent.getServerPath()
            };

            oBrowserWindow.webContents.send('if-appdocu-info', oDocuData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

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

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B52"); // Options
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 실행할 URL 적용
        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }   

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oOptionData = {
                BROWSKEY: BROWSKEY, // 브라우저 고유키 
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
                oServerInfo: parent.getServerInfo(), // 서버 정보
                SYSID: sSysID, // System ID
                THEME_INFO: oThemeInfo, // 테마 정보
                ISCDN: parent.getIsCDN() // CDN 여부
            };

            oBrowserWindow.webContents.send('if-ws-options-info', oOptionData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });


        let lf_IpcMainCdnSave = oAPP.fn.fnIpcMain_cdn_save;

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}-cdn-save`, lf_IpcMainCdnSave);

            oBrowserWindow = null;

            CURRWIN.focus();

        });

        // IPCMAIN 이벤트        
        IPCMAIN.on(`${BROWSKEY}-cdn-save`, lf_IpcMainCdnSave);

    }; // end of oAPP.fn.fnWsOptionsPopupOpener

    /************************************************************************
     * USP PATTERN POPUP
     ************************************************************************/
    oAPP.fn.fnSourcePatternPopupOpener = async () => {

        let sPopupName = "PATTPOPUP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            sWsThemeColor = parent.WSUTIL.getThemeBackgroundColor(oSettings.globalTheme);

        // Browswer Options
        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        // oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D46"); // Source Pattern
        oBrowserOptions.title = oAPP.msg.M059; // Source Pattern
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = sWsThemeColor;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${sWsThemeColor}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oOptionData = {
                // BROWSKEY: BROWSKEY, // 브라우저 고유키 
                // oUserInfo: oUserInfo, // 로그인 사용자 정보
                // oServerInfo: oServerInfo, // 서버 정보                
                // oThemeInfo: oThemeInfo, // 테마 정보                
            };

            oBrowserWindow.webContents.send('if-usp-pattern-info', oOptionData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

    }; // end of oAPP.fn.fnSourcePatternPopupOpener

    oAPP.fn.fnIconUrlCallback = function (events, res) {

        this(res);


    }; // end of oAPP.fn.fnIconUrlCallback

    /************************************************************************
     * Icon Preview Popup Opener
     ************************************************************************/
    oAPP.fn.fnIconPreviewPopupOpener = (fnCallback) => {

        // 콜백 유무 플래그
        let isCallback = ((typeof fnCallback === "function") ? "X" : "");

        // 이전에 콜백 바인딩된 펑션이 있을 경우 이벤트 해제
        if (oAPP.attr.fnBindCallback) {
            IPCRENDERER.off("if-icon-url-callback", oAPP.attr.fnBindCallback);
            delete oAPP.attr.fnBindCallback;
        }

        // 파라미터에 콜백 펑션이 있을 경우에만 IPCRENDER 이벤트를 건다.
        if (isCallback == "X") {

            oAPP.attr.fnBindCallback = oAPP.fn.fnIconUrlCallback.bind(fnCallback);

            IPCRENDERER.on("if-icon-url-callback", oAPP.attr.fnBindCallback);

        }

        let sPopupName = "ICONPREV";

        // [!! 전체 떠있는 브라우저 기준 !!] 
        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow2(sPopupName);
        if (oResult.ISOPEN) {

            let oIconWindow = oResult.WINDOW;

            oIconWindow.show();

            oIconWindow.webContents.send("if-icon-isCallback", isCallback);

            return;

        }

        // 로그인 정보에서 서버의 기본 테마 정보를 구한다.
        let oUserInfo = parent.getUserInfo(),
            oMeta = oUserInfo.META,
            aTheme = oMeta.T_REG_THEME,
            oDefThemeInfo = aTheme.find(elem => elem.ISDEF === "X");

        let sDefTheme = "sap_horizon";
        if (oDefThemeInfo) {
            sDefTheme = oDefThemeInfo.THEME;
        }

        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            sGlobalLangu = oSettings.globalLanguage,
            sWsThemeColor = parent.WSUTIL.getThemeBackgroundColor(sDefTheme);

        // Browswer Options
        let sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = parent.WSUTIL.getWsMsgClsTxt(sGlobalLangu, "ZMSG_WS_COMMON_001", "047"); // Icon List
        // oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.titleBarStyle = 'hidden';
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.resizable = true;
        oBrowserOptions.movable = true;
        oBrowserOptions.backgroundColor = sWsThemeColor;
        oBrowserOptions.webPreferences.nodeIntegrationInWorker = true;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = oUserInfo;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${sWsThemeColor}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // // 브라우저 상단 메뉴 없애기.
        // if (APP.isPackaged) {
        oBrowserWindow.setMenu(null);
        // }

        let sUrlPath = parent.getPath(sPopupName);

        oBrowserWindow.loadURL(sUrlPath);

        // // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }
        
        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oOptionData = {
                // BROWSKEY: BROWSKEY, // 브라우저 고유키
                // oUserInfo: oUserInfo, // 로그인 사용자 정보
                sServerHost: parent.getHost(), //  서버 호스트 정보
                sServerPath: parent.getServerPath(), // 서버 Url                
                sDefTheme: sDefTheme, // 테마 정보
                isCallback: isCallback // 아이콘 팝업 호출 시 콜백 펑션이 있는지 여부 플래그 
            };

            oBrowserWindow.webContents.send('if-icon-prev', oOptionData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            parent.setBusy("");

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnIconPreviewPopupOpener

    /************************************************************************
     * 성원이가 만든 일러스트 메시지 팝업
     ************************************************************************/
    oAPP.fn.fnIllustedMsgPrevPopupOpener = () => {

        let sPopupName = "ILLUST_MSG_PREV";

        // [!! 전체 떠있는 브라우저 기준 !!] 
        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow2(sPopupName);
        if (oResult.ISOPEN) {
            let oIconWindow = oResult.WINDOW;
            oIconWindow.show();
            return;
        }

        // 로그인 정보에서 서버의 기본 테마 정보를 구한다.
        let oUserInfo = parent.getUserInfo(),
            oMeta = oUserInfo.META,
            sServerLibPath = oMeta.LIBPATH,
            aTheme = oMeta.T_REG_THEME,
            oDefThemeInfo = aTheme.find(elem => elem.ISDEF === "X");

        let sDefTheme = "sap_horizon";
        if (oDefThemeInfo) {
            sDefTheme = oDefThemeInfo.THEME;
        }

        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            sGlobalLangu = oSettings.globalLanguage,
            sWsThemeColor = parent.WSUTIL.getThemeBackgroundColor(sDefTheme);

        // Browswer Options
        let sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = parent.WSUTIL.getWsMsgClsTxt(sGlobalLangu, "ZMSG_WS_COMMON_001", "067"); // Image Icons
        // oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.titleBarStyle = 'hidden';
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.resizable = true;
        oBrowserOptions.movable = true;
        oBrowserOptions.backgroundColor = sWsThemeColor;
        oBrowserOptions.webPreferences.nodeIntegrationInWorker = true;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = oUserInfo;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${sWsThemeColor}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);

        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oOptionData = {
                // BROWSKEY: BROWSKEY, // 브라우저 고유키
                // oUserInfo: oUserInfo, // 로그인 사용자 정보
                sServerHost: parent.getHost(), //  서버 호스트 정보
                sServerPath: parent.getServerPath(), // 서버 Url                
                sDefTheme: sDefTheme, // 테마 정보 
                sServerLibPath: sServerLibPath // 서버 라이브러리 경로
            };

            oBrowserWindow.webContents.send('if-illust-prev', oOptionData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            parent.setBusy("");

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnIllustedMsgPrevPopupOpener

    /************************************************************************
     * U4A Help Document Popup Opener
     ************************************************************************/
    oAPP.fn.fnU4AHelpDocuPopupOpener = async () => {

        let sP13n_root = parent.getPath("P13N_ROOT"),
            sUrlPath = parent.getPath("U4AHELP"),
            oHelpDoc = parent.require(sUrlPath);

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oRetdata = await oHelpDoc.Excute(REMOTE, sP13n_root);

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

        if (oRetdata.RETCD === "E") {

            // 메시지 처리 
            parent.showMessage(sap, 20, "E", oRetdata.RTMSG);

            return;

        }

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
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var oSendData = {
            USERINFO: parent.getUserInfo(),
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

        //  // no build 일 경우에는 개발자 툴을 실행한다.
        //  if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oBrowserWindow.webContents.send("export_import-INITDATA", oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            oBrowserWindow.show();

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}--export_import-IMPORT`, oAPP.fn.fnIpcMain_export_import_IMPORT);
            IPCMAIN.off(`${BROWSKEY}--export_import-EXPORT`, oAPP.fn.fnIpcMain_export_import_EXPORT);

            oBrowserWindow = null;

            CURRWIN.focus();

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


        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B48"); // About U4A WS IDE
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.modal = true;
        oBrowserOptions.parent = CURRWIN;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let oServerInfo = parent.getServerInfo();

        var oSendData = {
            SERVPATH: sServerPath,
            WSVER: oServerInfo.WSVER,
            WSPATCH_LEVEL: oServerInfo.WSPATCH_LEVEL
        };

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oBrowserWindow.webContents.send("if-about-u4a", oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnAboutU4APopupOpener

    /************************************************************************
     * Runtime Class Navigator Popup Opener
     ************************************************************************/
    oAPP.fn.fnRuntimeClassNaviPopupOpener = () => {

        let sPopupName = "RTMCLS";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo();

        let oThemeInfo = parent.getThemeInfo(); // theme 정보      

        // 브라우저 옵션 설정
        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A14"); // Runtime Class Navigator
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oRuntimeInfo = {
                oUserInfo: oUserInfo,
                oThemeInfo: oThemeInfo,
                aRuntimeData: oAPP.DATA.LIB.T_0022,
                oMetadata: parent.getMetadata()
            };

            // 오픈할 URL 파라미터 전송
            oBrowserWindow.webContents.send('if-runtime-info', oRuntimeInfo);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnRuntimeClassNaviPopupOpener

    /************************************************************************
     * Font Style Wizard
     ************************************************************************/
    oAPP.fn.fnFontStyleWizardPopupOpener = () => {

        let sPopupName = "FONTSTYLE";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
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

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B57"); // Font Style Wizard
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.nodeIntegration = false;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(sUrl);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

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
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sWinObjType);
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

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A12"); // Icon List
        oBrowserOptions.url = sPath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
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

        let sPopupName = "ERRMSGPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보 

        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B93"); // Error
        sTitle += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D24"); // Message Popup

        oBrowserOptions.title = sTitle;
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
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oSendData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                aMsg: aMsg
            };

            oBrowserWindow.webContents.send('if-errmsg-info', oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}--errormsg--click`, oAPP.fn.fnIpcMain_errmsg_click);

            oBrowserWindow = null;

            CURRWIN.focus();

        });

        IPCMAIN.on(`${BROWSKEY}--errormsg--click`, oAPP.fn.fnIpcMain_errmsg_click);

    }; // end of oAPP.fn.fnMultiFooterMsg

    /************************************************************************
     * WS20의 UI Property 도움말
     * **********************************************************************/
    oAPP.fn.fnPropertyHelpPopup = function (sUrl) {

        var sWinObjType = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D28"), // Property Help
            sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(sUrl + "&WS=X");

        // // 테스트 목적임.
        // if (typeof sUrl !== "string") {
        //     var testUrl = "/ZU4A_ACS/U4A_API_DOCUMENT?VER=1.77.2&CLSNM=sap.m.Page&GUBUN=1&PROPID=showFooter&UIOBK=UO00389";
        //     sPath = parent.getServerPath() + "/external_open?URL=" + encodeURIComponent(testUrl + "&WS=X");
        // }

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {

            oResult.WINDOW.webContents.send('if-extopen-url', sPath);
            return;

        }

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D28"); // Property Help
        oBrowserOptions.url = sPath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

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

        let sPopupName = "RELNOTEPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oThemeInfo = parent.getThemeInfo(); // theme 정보  

        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
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
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }  

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oData = {
                USERINFO: parent.getUserInfo(), // User 정보
                oThemeInfo: oThemeInfo, // 테마 개인화 정보                
                ISCDN: parent.getIsCDN(), // CDN 허용 여부,
                SERVPATH: parent.getServerPath() // ws service path
            };

            oBrowserWindow.webContents.send('if-relnote-info', oData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

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


    oAPP.fn.fnOtrIpcCallBack = function (events, res) {

        // busy 끄고 Lock 끄기
        oAPP.common.fnSetBusyLock("");

    }; // end of oAPP.fn.fnOtrIpcCallBack

    /************************************************************************
     * OTR Manager Popup Opener
     ************************************************************************/
    oAPP.fn.fnOtrManagerPopupOpener = () => {

        // busy 키고 Lock 켜기
        oAPP.common.fnSetBusyLock("X");

        let sPopupName = "U4AOTRPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            // busy 키고 Lock 켜기
            oAPP.common.fnSetBusyLock("");
            return;
        }

        // otr 팝업에서 콜백 받을 준비를 한다.
        IPCRENDERER.on("if-otr-callback", oAPP.fn.fnOtrIpcCallBack);

        let SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo();

        let oThemeInfo = parent.getThemeInfo(); // theme 정보      

        // 브라우저 옵션 설정
        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B59"); // OTR Manager
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기        
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oSendData = {
                oUserInfo: oUserInfo,
                oThemeInfo: oThemeInfo,
                T_9011: oAPP.DATA.LIB.T_9011,
                oAppInfo: parent.getAppInfo(),
                servNm: oAPP.attr.servNm
            };

            // 오픈할 URL 파라미터 전송
            oBrowserWindow.webContents.send('if_OTRF4HelpPopup', oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // busy & Lock 끄기
            oAPP.common.fnSetBusyLock("");

            oBrowserWindow = null;

            IPCRENDERER.off("if-otr-callback", oAPP.fn.fnOtrIpcCallBack);

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnOtrManagerPopupOpener

    /************************************************************************
     * [WS20] UI5 Predefined Css Popup Opener
     ************************************************************************/
    oAPP.fn.fnUI5PredefinedCssPopupOpener = () => {

        let sPopupName = "UI5CSSPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo(),
            oThemeInfo = parent.getThemeInfo(); // theme 정보      

        // 브라우저 옵션 설정
        let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B58"); // UI5 Predefined CSS
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.width = 1200;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기        
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // sap icon 종류
        let oIconUrl = {
            ICON_LED_RED: oAPP.fn.fnGetSapIconPath("ICON_LED_RED"),
            ICON_LED_GREEN: oAPP.fn.fnGetSapIconPath("ICON_LED_GREEN")
        };

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oSendData = {
                BROWSKEY: BROWSKEY,
                oUserInfo: oUserInfo,
                oThemeInfo: oThemeInfo,
                oIconUrl: oIconUrl,
                sServerPath: parent.getServerPath(),
                sServerBootStrapUrl: oAPP.fn.getBootStrapUrl()
            };

            // 오픈할 URL 파라미터 전송
            oBrowserWindow.webContents.send('if-ui5css-info', oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            IPCMAIN.off(`${BROWSKEY}--if-ui5css`, lf_ui5css_getData);

            oBrowserWindow = null;

            CURRWIN.focus();

        });

        IPCMAIN.on(`${BROWSKEY}--if-ui5css`, lf_ui5css_getData);

        function lf_ui5css_getData(event, res) {

            var sType = res.TYPE,
                bIsSave = (sType == "S" ? true : false),
                aCSSList = res.DATA;

            oAPP.fn.prevStyleClassApply(aCSSList, bIsSave);

        }

    }; // end of oAPP.fn.fnUI5PredefinedCssPopupOpener

    /************************************************************************
     * [WS20] Application ShortCut Download
     ************************************************************************/
    oAPP.fn.fnAppShortCutDownPopupOpener = () => {

        // 실행할 브라우저가 없다면 오류 후 빠져나감.    
        let aDefBr = APPCOMMON.fnGetModelProperty("/DEFBR"),
            sMsg = "";

        // 뭔가 크게 잘못된 경우
        if (Array.isArray(aDefBr) == false) {

            //"설치된 브라우저 정보를 찾을 수 없습니다.";
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "333"); // Installed browser information not found.

            parent.showMessage(sap, 20, 'E', sMsg);

            return;
        }

        // Chrome 브라우저 설치 유무 확인
        let oChrome = aDefBr.find(elem => elem.NAME === "CHROME") || {};
        if (!oChrome || !oChrome.ENABLED) {

            //sMsg = "Chrome Browser가 설치 되어 있는지 확인하세요!";
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C75"); // Chrome Browser
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "334", sMsg); // &1 is not installed.            

            parent.showMessage(sap, 20, 'E', sMsg);

            return;
        }

        let oMsEdge = aDefBr.find(elem => elem.NAME === "MSEDGE") || {};
        if (!oMsEdge || !oMsEdge.ENABLED) {

            //sMsg = "MS Edge Browser가 설치 되어 있는지 확인하세요!";
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C76"); // IE edge Browser
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "334", sMsg); // &1 is not installed.

            parent.showMessage(sap, 20, 'E', sMsg);

            return;
        }

        let sPopupName = "SHORTCUTPOP";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo();

        let oThemeInfo = parent.getThemeInfo(); // theme 정보      

        // 브라우저 옵션 설정
        let sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D31"); // ShortCut Creator        
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.skipTaskbar = false;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.modal = true;
        oBrowserOptions.minimizable = false;
        oBrowserOptions.maximizable = false;

        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL; //테마별 색상 처리               
        oBrowserOptions.height = 900;
        oBrowserOptions.width = 800;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        let oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5;

        //==* 기본 config 정보 
        var S_config = {};

        //기능 처리 클라이언트 <-> 서버 통신 서비스 HOST        
        S_config.SHOST = parent.getServerPath();

        //서버 HOST        
        S_config.BASE_SHOST = parent.getHost();

        //UI5 기본 정보
        S_config.UI5_INFO = {};

        S_config.UI5_INFO.src = oSetting_UI5.resourceUrl;

        //Lib 접속 언어        
        S_config.UI5_INFO.language = oUserInfo.LANGU;

        //Lib 테마        
        S_config.UI5_INFO.theme = oThemeInfo.THEME;

        //==*브라우져 설처 경로 
        let T_info = [];

        var S_info = {};
        S_info.TYPE = "CR";
        S_info.PATH = oChrome.INSPATH;
        T_info.push(S_info);


        var S_info = {};
        S_info.TYPE = "MS_EDGE";
        S_info.PATH = oMsEdge.INSPATH;
        T_info.push(S_info);

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기        
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oSendData = {
                browserInfo: T_info,
                config: S_config,
                oMetadata: parent.getMetadata()
            };

            // 오픈할 URL 파라미터 전송
            oBrowserWindow.webContents.send('if_APP_shortcutCreator', oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });


    }; // end of oAPP.fn.fnAppShortCutDownPopupOpener

    /************************************************************************
     * [Header Menu] 비디오 녹화 팝업
     ************************************************************************/
    oAPP.fn.fnOpenVideoRecord = () => {

        let oServerInfo = parent.getServerInfo(),
            oThemeInfo = oServerInfo.oThemeInfo,
            sApplyTheme = oThemeInfo.THEME;

        var oVideoPopup = oAPP.attr.videoRecordPopup;

        if (oVideoPopup) {
            oVideoPopup.start(REMOTE, sApplyTheme);
            return;
        }

        let sWinObjType = "VIDEOREC",
            sUrl = parent.getPath(sWinObjType);

        oAPP.attr.videoRecordPopup = parent.require(sUrl);

        oAPP.attr.videoRecordPopup.start(REMOTE, sApplyTheme);

    }; // end of oAPP.fn.fnOpenVideoRecord


})(window, $, oAPP);