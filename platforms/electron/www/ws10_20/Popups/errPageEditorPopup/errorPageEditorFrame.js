/************************************************************************
 * Copyright 2017. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : errorPageEditorFrame.js
 ************************************************************************/

let oAPP = (function(window) {
    "use strict";

    var oAPP = {};
    oAPP.attr = {};
    oAPP.fn = {};
    oAPP.events = {};
    oAPP.common = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.FS = oAPP.REMOTE.require('fs');
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.RANDOM = require("random-key");

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

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/

    oAPP.fn.getSessionKey = function() {

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();

        return oWebPref.partition;

    };

    oAPP.fn.fnGetBrowserKey = function() {

        var oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();

        return oWebPref.browserkey;

    };

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

    oAPP.fn.fnSetEditorInfo = function(oEditorInfo) {
        oAPP.attr.oEditorInfo = oEditorInfo;
    };

    oAPP.fn.fnGetEditorInfo = function() {
        return oAPP.attr.oEditorInfo;
    };

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-editor-info', function(event, res) {

        oAPP.fn.fnSetEditorInfo(res);

        oAPP.attr.oThemeInfo = res.oThemeInfo;

        var oWs_frame = document.getElementById("ws_editorframe");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "errorPageEditor.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);