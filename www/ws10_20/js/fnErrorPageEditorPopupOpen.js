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
        APPCOMMON = oAPP.common;


    oAPP.fn.fnErrorPageEditorPopupOpen = function () {

        var sPopupName = "ERRPAGE";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oAppInfo = parent.getAppInfo(),
            oEditData = oAPP.DATA.APPDATA.S_ERHTML,
            oUserInfo = parent.getUserInfo(),
            sBrowserTitle = "Editor - Customizing the Error Page";

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = sBrowserTitle;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);
    
        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oEditorInfo = {
                APPINFO: oAppInfo,
                EDITDATA: oEditData,
                USERINFO: oUserInfo
            };

            oBrowserWindow.webContents.send('if-editor-info', oEditorInfo);

        });

        // EDITOR의 저장을 위한 IPC 이벤트
        IPCMAIN.on("if-ErrorPageEditor-Save", oAPP.fn.fnIpcMain_ErrorPageEditorSave);
        IPCMAIN.on("if-ErrorPage-Preview", oAPP.fn.fnIpcMain_ErrorPagePreview);

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {            

            // IPCMAIN 이벤트 해제
            IPCMAIN.removeListener("if-ErrorPageEditor-Save", oAPP.fn.fnIpcMain_ErrorPageEditorSave);
            IPCMAIN.removeListener("if-ErrorPage-Preview", oAPP.fn.fnIpcMain_ErrorPagePreview);

            oBrowserWindow = null;

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

        var sWinObjType = "ERRPAGEPREV";

        var BROWSKEY = parent.getBrowserKey();
        if (BROWSKEY != res.BROWSKEY) {
            return;
        }

        // 기존에 Error Page Editor 미리보기 팝업이 열렸을 경우 창을 닫고 다시 띄운다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
            // return;
        }

        var oCurrWin = REMOTE.getCurrentWindow(),
            oSaveData = res.SAVEDATA,
            SESSKEY = parent.getSessionKey();

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Error Page Preview";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.devTools = false;
        oBrowserOptions.parent = oCurrWin;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.nodeIntegration = false;
        oBrowserOptions.webPreferences.enableRemoteModule = false;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(oSaveData.HTML));

    };

})(window, $, oAPP);