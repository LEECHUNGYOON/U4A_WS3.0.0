// const oAPP = {
//     onStart:function(){
//         this.remote = require('@electron/remote');


//     }    

// };

// //Device ready 
// document.addEventListener('DOMContentLoaded', onDeviceReady, false);
// function onDeviceReady() {
//     oAPP.onStart();
// }

// function fn_getParent(){
//     return oAPP;

// }

/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : releaseNotePopup/index.js
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
    oAPP.APPPATH = oAPP.APP.getAppPath();
    oAPP.PATHINFO = require(oAPP.PATH.join(oAPP.APPPATH, "Frame", "pathInfo.js"));

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
    oAPP.IPCRENDERER.on('if-relnote-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.USERINFO;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;        
        oAPP.attr.sServerPath = oInfo.SERVPATH;
        oAPP.attr.ISCDN = oInfo.ISCDN;

        var oWs_frame = document.getElementById("mainFRAME");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "main.html";

    });

    // CDN 여부 플래그
    oAPP.fn.fnGetIsCDN = () => {

        return oAPP.attr.ISCDN || "";

    }; // end of oAPP.fn.fnGetIsCDN

    // 서버 Path
    oAPP.fn.fnGetServerPath = () => {

        return oAPP.attr.sServerPath;

    }; // end of oAPP.fn.fnGetServerPath

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSettingsInfo = () => {

        // Browser Window option
        var oSettingsPath = oAPP.PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(oSettingsPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of fnGetSettingsInfo

    window.oAPP = oAPP;

    return oAPP;

})(window);