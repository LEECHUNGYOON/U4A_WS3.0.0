/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/frame.js
 ************************************************************************/

let oAPP = (function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.ui = {};
    oAPP.attr = {};
    oAPP.events = {};
    oAPP.common = {};

    oAPP.PES_DEV = process?.env?.PES_DEV || undefined;

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain,
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.FS = oAPP.REMOTE.require('fs');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.USERDATA = oAPP.APP.getPath("userData");

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
    oAPP.WSUTIL = WSUTIL;

    oAPP.attr.GLANGU = oAPP.WSUTIL.getWsSettingsInfo().globalLanguage;


    /*************************************************************
     * @function - 테마 정보를 구한다.
     *************************************************************/
    oAPP.fn.getThemeInfo = function (){

        let oUserInfo = parent.process.USERINFO;
        let sSysID = oUserInfo.SYSID;
        
        // 해당 SYSID별 테마 정보 JSON을 읽는다.
        let sThemeJsonPath = oAPP.PATH.join(oAPP.USERDATA, "p13n", "theme", `${sSysID}.json`);
        if(oAPP.FS.existsSync(sThemeJsonPath) === false){
            return;
        }

        let sThemeJson = oAPP.FS.readFileSync(sThemeJsonPath, "utf-8");

        try {
        
            var oThemeJsonData = JSON.parse(sThemeJson);    

        } catch (error) {
            return;
        }

        return oThemeJsonData;

    } // end of oAPP.fn.getThemeInfo
    

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/

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
    oAPP.IPCRENDERER.on('if_modelBindingPopup', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.oUserInfo; // User 정보(필수)
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo; // User 정보(필수)

        oAPP.attr.T_9011 = oInfo.T_9011;
        oAPP.attr.T_0022 = oInfo.T_0022;
        oAPP.attr.T_0023 = oInfo.T_0023;

        oAPP.attr.T_0014 = oInfo.T_0014;
        oAPP.attr.T_0015 = oInfo.T_0015;
        oAPP.attr.T_CEVT = oInfo.T_CEVT;
        oAPP.attr.oAppInfo = oInfo.oAppInfo;
        oAPP.attr.servNm = oInfo.servNm;
        oAPP.attr.DnDRandKey = oInfo.SSID;
        oAPP.attr.SSID       = oInfo.SSID;
        oAPP.attr.channelKey = oInfo.channelKey;
        oAPP.attr.browserkey = CURRWIN.webContents.getWebPreferences().browserkey;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });
    

    window.oAPP = oAPP;

    return oAPP;

})(window);