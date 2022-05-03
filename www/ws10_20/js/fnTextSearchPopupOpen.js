/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnTextSearchPopupOpen.js
 * - file Desc : Text Search Popup
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        IPCMAIN = parent.IPCMAIN,
        PATH = parent.PATH,
        APP = parent.APP;

    oAPP.fn.fnTextSearchPopupOpen = function () {

        debugger;

        var sWinObjType = "TXTSRCH";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {
            return;
        }

        var oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey();

        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/BrowserWindow/BrowserWindow-settings.json"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.frame = false;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sWinObjType;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        oBrowserWindow.loadURL(`file://${parent.__dirname}/../ws10_20/editor/editorFrame.html`);

    }; // end of oAPP.fn.fnTextSearchPopupOpen


})(window, $, oAPP);