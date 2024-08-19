
/*******************************************************************
 *  IF_DATA 필수 파라미터
 * - SESSKEY : 세션이 있어야 서버 로그인 할 수 있음.
 * - BROWSKEY: IPC 통신할 때 다른 브라우저 호출을 막을 수 있음.
 *******************************************************************/

export async function start(require, IF_DATA, fnCallback){

    // 단독으로 실행한다 생각하고 짤것!!!

    if(!IF_DATA){
        var IF_DATA = {};
    }
   
    let sPopupName = "UI5CSSPOP_V2";

    const 
        REMOTE = require('@electron/remote'),
        IPCMAIN = REMOTE.require('electron').ipcMain,
        REMOTEMAIN = REMOTE.require('@electron/remote/main'),
        CURRWIN = REMOTE.getCurrentWindow(),
        PATH = REMOTE.require('path'),
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
        PATHINFO = require(PATHINFOURL),
        WSUTIL = require(PATHINFO.WSUTIL),
        SETTINGS = require(PATHINFO.WSSETTINGS),
        oSetting_UI5 = SETTINGS.UI5;

    let SESSKEY = IF_DATA.SESSKEY;
    let BROWSKEY = IF_DATA.BROWSKEY;
    let oUserLoginInfo = await WSUTIL.getSysInfoIPC({ PRCCD: "USER_LOGIN_INFO", BROWSKEY: BROWSKEY });
    
    // 테마 관련 정보
    let sTheme = sap.ui.getCore().getConfiguration().getTheme();
    let oThemeColors = sap.ui.core.theming.Parameters.get();
    let sThemeBgColor = oThemeColors.sapBackgroundColor;    
    let oThemeInfo = { THEME: sTheme, BGCOL: sThemeBgColor };

    IF_DATA.SESSKEY          = SESSKEY;
    IF_DATA.BROWSKEY         = BROWSKEY;
    IF_DATA.USER_LOGIN_INFO  = oUserLoginInfo;
    IF_DATA.USER_INFO        = await WSUTIL.getSysInfoIPC({ PRCCD: "USER_INFO",   BROWSKEY: BROWSKEY });    
    IF_DATA.SERVER_HOST      = await WSUTIL.getSysInfoIPC({ PRCCD: "SERVER_HOST", BROWSKEY: BROWSKEY });
    IF_DATA.SERVER_PATH      = await WSUTIL.getSysInfoIPC({ PRCCD: "SERVER_PATH", BROWSKEY: BROWSKEY });
    IF_DATA.SERVER_BOOT_PATH = IF_DATA.USER_INFO.META.LIBPATH;
    IF_DATA.WS30_BOOT_PATH   = oSetting_UI5.resourceUrl;
    IF_DATA.SUBROOT_PATH     = "/getui5_pre_css_v2";
    IF_DATA.THEME_INFO       = oThemeInfo;

    let LANGU = IF_DATA.USER_LOGIN_INFO.LANGU;
    let SYSID = IF_DATA.USER_LOGIN_INFO.SYSID;
    let WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);
    
    // 메시지 클래스 정보 구하는 function
    let fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

    // 브라우저 옵션 설정
    let sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
        oDefaultOption = parent.require(sSettingsJsonPath),
        oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = fnGetMsgClsText("/U4A/CL_WS_COMMON", "B58"); // UI5 Predefined CSS
        oBrowserOptions.autoHideMenuBar = true;        
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.width = 1200;

        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;
        oBrowserOptions.closable = false;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = oUserLoginInfo;
    
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

    // // no build 일 경우에는 개발자 툴을 실행한다.
    // if (!APP.isPackaged) {
    //     oBrowserWindow.webContents.openDevTools();
    // }

    // 브라우저가 활성화 될 준비가 될때 타는 이벤트
    oBrowserWindow.once('ready-to-show', () => {

        // 부모 위치 가운데 배치한다.
        WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow, oBrowserOptions);

    });
 
    // 브라우저가 오픈이 다 되면 타는 이벤트
    oBrowserWindow.webContents.on('did-finish-load', function () {

        // 오픈할 URL 파라미터 전송
        oBrowserWindow.webContents.send('if-ui5css-info', IF_DATA);

        // 부모 위치 가운데 배치한다.
        WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow, oBrowserOptions);

        // // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
        // WSUTIL.setBrowserOpacity(oBrowserWindow, () => {
            
        //     if(oBrowserWindow.isDestroyed()){                        
        //         return;    
        //     }

        //     // try {
        //     //     oBrowserWindow.closable = true;    
        //     // } catch (error) {
                
        //     // }

        // });

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

            res.WIN = oBrowserWindow;

            fnCallback(res);
            
            return;
        }

    }

};