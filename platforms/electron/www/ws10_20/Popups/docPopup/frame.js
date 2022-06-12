/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : doc/frame.js
 ************************************************************************/

let oAPP = (function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;

    oAPP.setBusy = function(bIsShow) {

        var oLoadPg = document.getElementById("u4a_main_load");

        if (!oLoadPg) {
            return;
        }

        if (bIsShow == 'X') {
            oLoadPg.classList.remove("u4a_loadersInactive");
        } else {
            oLoadPg.classList.add("u4a_loadersInactive");
        }

    };

    oAPP.fn.getSessionKey = function() {

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();

        return oWebPref.partition;

    };

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-appdocu-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.USERINFO;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;
        oAPP.attr.oAppInfo = oInfo.APPINFO;
        oAPP.attr.sServerPath = oInfo.SERVPATH;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "doc.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);