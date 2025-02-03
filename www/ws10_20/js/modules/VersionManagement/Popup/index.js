/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : patternPopup/frame.js
 ************************************************************************/
let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.ui = {};
    oAPP.attr = {};
    oAPP.msg = {};
    oAPP.events = {};
    oAPP.common = {};

    // 현재 비지 상태 
    oAPP.attr.isBusy = "X";

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
    oAPP.USERDATA = oAPP.APP.getPath("userData");	
    oAPP.FS = oAPP.REMOTE.require('fs');
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
        SYSID = USERINFO.SYSID,
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js"));

    const
        WSUTIL_PATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        WSUTIL = require(WSUTIL_PATH),
        WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/



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
    

    /***********************************************************
     * Busy 실행 여부 정보 리턴
     ***********************************************************/
    oAPP.fn.getBusy = function(){

        return oAPP.attr.isBusy;

    };
    
    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-version-management', (events, oInfo) => {

        // oAPP.attr.oUserInfo = oInfo.oUserInfo;
        // oAPP.attr.oServerInfo = oInfo.oServerInfo;
        // oAPP.attr.oThemeInfo = oInfo.oThemeInfo;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "frame.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);