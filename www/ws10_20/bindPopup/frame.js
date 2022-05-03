/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : findPopup/frame.js
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

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-bind-popup-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.oUserInfo;
        oAPP.attr.aAttrData = oInfo.aAttrData;
        oAPP.attr.aServEvtData = oInfo.aServEvtData;
        oAPP.attr.aT_0022 = oInfo.aT_0022;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);