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
    oAPP.common = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
    oAPP.BROWSKEY = oAPP.CURRWIN.webContents.getWebPreferences().browserkey;

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- start
     *******************************************************/
    const
        REMOTE = oAPP.REMOTE,
        PATH = REMOTE.require('path'),
        CURRWIN = REMOTE.getCurrentWindow(),
        WEBCON = CURRWIN.webContents,
        WEBPREF = WEBCON.getWebPreferences(),
        USERINFO = WEBPREF.USERINFO,
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        LANGU = USERINFO.LANGU,
        SYSID = USERINFO.SYSID;

    const
        WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        WSUTIL = require(WSMSGPATH),
        WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

    // /*******************************************************
    //  * 메시지클래스 텍스트 작업 관련 Object -- end
    //  *******************************************************/

    // oAPP.setBusy = function(bIsShow) {

    //     var oLoadPg = document.getElementById("u4a_main_load");

    //     if (!oLoadPg) {
    //         return;
    //     }

    //     if (bIsShow == 'X') {
    //         oLoadPg.classList.remove("u4a_loadersInactive");
    //     } else {
    //         oLoadPg.classList.add("u4a_loadersInactive");
    //     }

    // };

    // oAPP.setBusyIndicator = function(bIsBusy) {

    //     var oBusy = document.getElementById("u4aWsBusyIndicator");

    //     if (!oBusy) {
    //         return;
    //     }

    //     if (bIsBusy) {
    //         oBusy.style.visibility = "visible";
    //     } else {
    //         oBusy.style.visibility = "hidden";
    //     }

    // }

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-uspnew', (events, oInfo) => {

        oAPP.attr.APPINFO = oInfo.oAppInfo;
        oAPP.attr.BROWSKEY = oInfo.BROWSKEY;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;
        oAPP.attr.CHANNELID = oInfo.CHANNELID;
        oAPP.attr.oUserInfo = oInfo.oUserInfo;
        
        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });

    // oAPP.fn.fnIpcMainFindSuccess = () => {

    //     oAPP.setBusyIndicator('');

    // };

    // oAPP.IPCMAIN.on(`${oAPP.BROWSKEY}--find--success`, oAPP.fn.fnIpcMainFindSuccess);

    // window.addEventListener("beforeunload", () => {

    //     oAPP.IPCMAIN.off(`${oAPP.BROWSKEY}--find--success`, oAPP.fn.fnIpcMainFindSuccess);

    // });

    window.oAPP = oAPP;

    return oAPP;

})(window);