/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : patternPopup/frame.js
 ************************************************************************/
let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.msg = {};
    oAPP.events = {};
    oAPP.common = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-icon-prev', (events, oInfo) => {

        // oAPP.attr.oUserInfo = oInfo.oUserInfo;
        // oAPP.attr.oServerInfo = oInfo.oServerInfo;
        // oAPP.attr.oThemeInfo = oInfo.oThemeInfo;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });

    window.onbeforeunload = function () {

        // 부모창에 포커스를 준다.
        let oParWin = oAPP.CURRWIN.getParentWindow();
        oParWin.focus();

    };

    window.oAPP = oAPP;

    return oAPP;

})(window);