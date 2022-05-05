/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnTextSearchPopupOpen.js
 * - file Desc : Text Search Popup
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        IPCMAIN = parent.IPCMAIN,
        PATH = parent.PATH,
        APP = parent.APP;

    oAPP.fn.fnTextSearchPopupOpen = function() {

        var sWinObjType = "TXTSRCH";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(sWinObjType);
        if (oResult.ISOPEN) {
            return;
        }

        var oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey();

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
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

        var sUrlPath = parent.getPath(sWinObjType);
        oBrowserWindow.loadURL(sUrlPath);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function() {

            var oFindData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
                aAttrData: aAttrData,
                aServEvtData: aServerEventList,
                aT_0022: oAPP.DATA.LIB.T_0022
            };

            oBrowserWindow.webContents.send('if-find-info', oFindData);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnTextSearchPopupOpen


})(window, $, oAPP);