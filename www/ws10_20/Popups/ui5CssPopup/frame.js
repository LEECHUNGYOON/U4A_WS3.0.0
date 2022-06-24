/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/frame.js
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

    // 현재 팝업 닫기
    oAPP.fn.fnCurrentWindowClose = () => {
        var oCurr = oAPP.REMOTE.getCurrentWindow();
        oCurr.close();
    };


    oAPP.fn.fnPredefinedCssPreview = (aPreviewCss) => {

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE : "P", // P : Preview, S: Save
            DATA : aPreviewCss
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css-save`, oSendData);

    };

    oAPP.fn.fnPredefinedCssSave = (aSaveCss) => {

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE : "S", // P : Preview, S: Save
            DATA : aSaveCss
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css-save`, oSendData);

    };

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-ui5css-info', (events, oInfo) => {

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        // 브라우저 키
        oAPP.attr.BROWSERKEY = oInfo.BROWSKEY;

        var sUrl = oInfo.sServerPath + "/getui5_pre_css?LIBPATH=" + oInfo.sServerBootStrapUrl;

        oWs_frame.src = sUrl;

        oWs_frame.onload = () => {

            oAPP.setBusy("");

        };

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);