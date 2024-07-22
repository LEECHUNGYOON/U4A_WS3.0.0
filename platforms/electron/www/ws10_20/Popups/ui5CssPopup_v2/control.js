export function start(REMOTE, IF_DATA, fnCallback){

    let sPopupName = "UI5CSSPOP_V2";

    const REMOTEMAIN = REMOTE.require('@electron/remote/main');
    const CURRWIN = REMOTE.getCurrentWindow();
    const APP = REMOTE.app;
    const PATH = REMOTE.require("path");
    const IPCMAIN = REMOTE.require('electron').ipcMain;
    const WSUTIL = parent.require(parent.PATHINFO.WSUTIL);

    let SESSKEY = IF_DATA.SESSKEY,
        BROWSKEY = IF_DATA.BROWSKEY,
        oUserInfo = IF_DATA.oUserInfo,
        oThemeInfo = IF_DATA.oThemeInfo; // theme 정보

    // 브라우저 옵션 설정
    let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
        oDefaultOption = parent.require(sSettingsJsonPath),
        oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B58"); // UI5 Predefined CSS
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.width = 1200;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = oUserInfo;
    
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
    if (!APP.isPackaged) {
        oBrowserWindow.webContents.openDevTools();
    }
 
    // 브라우저가 오픈이 다 되면 타는 이벤트
    oBrowserWindow.webContents.on('did-finish-load', function () {

        // 오픈할 URL 파라미터 전송
        oBrowserWindow.webContents.send('if-ui5css-info', IF_DATA);

        // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
        WSUTIL.setBrowserOpacity(oBrowserWindow);

        // 부모 위치 가운데 배치한다.
        oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

    });

    // 브라우저가 활성화 될 준비가 될때 타는 이벤트
    oBrowserWindow.once('ready-to-show', () => {

        // 부모 위치 가운데 배치한다.
        oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

    });

    // 브라우저를 닫을때 타는 이벤트
    oBrowserWindow.on('closed', () => {

        IPCMAIN.off(`${IF_DATA.BROWSKEY}--if-ui5css`, lf_ui5css_getData);

        oBrowserWindow = null;

        CURRWIN.focus();

    });

    IPCMAIN.on(`${IF_DATA.BROWSKEY}--if-ui5css`, lf_ui5css_getData);

    function lf_ui5css_getData(event, res) {

        if(typeof fnCallback === "function"){
            fnCallback(res);
            return;
        }

    }


};