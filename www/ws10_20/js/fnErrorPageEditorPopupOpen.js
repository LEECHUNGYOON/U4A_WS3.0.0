/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnErrorPageEditorPopupOpen.js
 * - file Desc : Error Page Editor
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        IPCMAIN = parent.IPCMAIN,
        PATH = parent.PATH,
        APP = parent.APP,
        CURRWIN = REMOTE.getCurrentWindow(),
        APPCOMMON = oAPP.common;


    oAPP.fn.fnErrorPageEditorPopupOpen = function () {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        let sPopupName = "ERRPAGE";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        let oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oAppInfo = parent.getAppInfo(),
            oEditData = oAPP.DATA.APPDATA.S_ERHTML,
            oUserInfo = parent.getUserInfo(),
            oThemeInfo = parent.getThemeInfo(), // theme 정보   
            // sBrowserTitle = "Editor - Customizing the Error Page";

            sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D23"); // Editor
            sTitle += " - " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D32"); // Customizing the Error Page

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = sTitle;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.closable = false;
        
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

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

        });        

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oEditorInfo = {
                APPINFO: oAppInfo,
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                EDITDATA: oEditData,
                USERINFO: oUserInfo
            };

            oBrowserWindow.webContents.send('if-editor-info', oEditorInfo);

            // 부모 위치 가운데 배치한다.
            parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            parent.WSUTIL.setBrowserOpacity(oBrowserWindow, () => {
                
                if(oBrowserWindow.isDestroyed()){                        
                    return;    
                }

                try {
                    oBrowserWindow.closable = true;    
                } catch (error) {
                    
                }

            });      

        });

        // EDITOR의 저장을 위한 IPC 이벤트
        IPCMAIN.on("if-ErrorPageEditor-Save", oAPP.fn.fnIpcMain_ErrorPageEditorSave);

        // ErrPageEditor 미리보기에 반영할 html을 받을 목적인 IPC 이벤트
        IPCMAIN.on("if-ErrorPage-Preview", oAPP.fn.fnIpcMain_ErrorPagePreview);

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // IPCMAIN 이벤트 해제
            IPCMAIN.removeListener("if-ErrorPageEditor-Save", oAPP.fn.fnIpcMain_ErrorPageEditorSave);
            IPCMAIN.removeListener("if-ErrorPage-Preview", oAPP.fn.fnIpcMain_ErrorPagePreview);

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    }; // end of oAPP.fn.fnErrorPageEditorPopupOpen

    /************************************************************************
     * Error Page Editor 팝업의 저장 버튼 이벤트를 수행하기 위한 IPCMAIN 이벤트
     * **********************************************************************/
    oAPP.fn.fnIpcMain_ErrorPageEditorSave = function (event, res) {

        var BROWSKEY = parent.getBrowserKey();

        if (BROWSKEY != res.BROWSKEY) {
            return;
        }

        // 저장할 데이터
        var oSaveData = res.SAVEDATA;

        // 세개의 오브젝트 중에 하나라도 없으면 빠져나감.
        if (!oAPP.DATA || !oAPP.DATA.APPDATA || !oAPP.DATA.APPDATA.S_ERHTML) {
            return;
        }

        oAPP.DATA.APPDATA.S_ERHTML.HTML = oSaveData.HTML;
        oAPP.DATA.APPDATA.S_ERHTML.IS_USE = oSaveData.IS_USE;

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

    }; // end of oAPP.fn.fnIpcMain_ErrorPageEditorSave  

    /************************************************************************
     * Error Page Editor 팝업의 미리보기 IPCMAIN 이벤트
     * **********************************************************************/
    oAPP.fn.fnIpcMain_ErrorPagePreview = function (event, res) {        

        var BROWSKEY = parent.getBrowserKey();
        if (BROWSKEY != res.BROWSKEY) {
            return;
        }

        var sPopupName = "ERRPAGEPREV";

        // 기존에 Error Page Editor 미리보기 팝업이 열렸을 경우 창을 닫고 다시 띄운다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
            // return;
        }

        var oCurrWin = REMOTE.getCurrentWindow(),
            oSaveData = res.SAVEDATA,
            oParWin = res.PARWIN,
            SESSKEY = parent.getSessionKey();

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B63"); // Error Page Editor
        sTitle += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67"); // Preview

        // oBrowserOptions.title = "Error Page Preview";
        oBrowserOptions.title = sTitle;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.devTools = false;
        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.closable = false;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        // oBrowserOptions.webPreferences.nodeIntegration = false;
        // oBrowserOptions.webPreferences.enableRemoteModule = false;
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

        // // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

        });

        oBrowserWindow.webContents.on('did-finish-load', () => {            

            oBrowserWindow.webContents.send('if-Error-Page-prev', oSaveData);

            // 부모 위치 가운데 배치한다.
            parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            parent.WSUTIL.setBrowserOpacity(oBrowserWindow, () => {
                    
                if(oBrowserWindow.isDestroyed()){                        
                    return;    
                }

                try {
                    oBrowserWindow.closable = true;    
                } catch (error) {
                    
                }

            });          
            
            // 오류 페이지 미리보기가 로드가 되면 오류 페이지 에디터에 실행중인 Busy를 끄라고 알린다.
            parent.IPCRENDERER.send(`if-errorPageEditor-setBusy-${parent.getBrowserKey()}`, "");

        });  

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    };

})(window, $, oAPP);