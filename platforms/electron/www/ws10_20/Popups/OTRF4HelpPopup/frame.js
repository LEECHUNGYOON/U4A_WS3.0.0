/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/frame.js
 ************************************************************************/

let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;

    // 텍스트 클립보드 복사
    oAPP.fn.setClipBoardTextCopy = (sText, fnCallback) => {

        if (typeof sText !== "string") {
            return;
        }

        var oTextArea = document.createElement("textarea");
        oTextArea.value = sText;

        document.body.appendChild(oTextArea);

        oTextArea.select();

        document.execCommand('copy');

        document.body.removeChild(oTextArea);

        if (typeof fnCallback === "function") {
            fnCallback();
        }

    };

    oAPP.setBusy = function (bIsShow) {

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
    oAPP.IPCRENDERER.on('if_OTRF4HelpPopup', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.oUserInfo; // User 정보(필수)
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo; // User 정보(필수)

        oAPP.attr.T_9011 = oInfo.T_9011;
        oAPP.attr.oAppInfo = oInfo.oAppInfo;
        oAPP.attr.servNm = oInfo.servNm;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);