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
    var
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

    
        oAPP.WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        oAPP.WSUTIL = require(oAPP.WSMSGPATH),
        oAPP.WSMSG = new oAPP.WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = oAPP.WSMSG.fnGetMsgClsText.bind(oAPP.WSMSG);

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/

    // 현재 비지 상태 
    oAPP.attr.isBusy = false;

    oAPP.setBusyLoading = function(bIsShow) {

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

    oAPP.getBusy = function(){
    
        return oAPP.attr.isBusy;

    };
    
    oAPP.setBusyIndicator = function(bIsBusy, sOption) {

        oAPP.attr.isBusy = bIsBusy;

        var _ISBROAD = sOption?.ISBROAD || undefined;

        var oBusy = document.getElementById("u4aWsBusyIndicator");

        if (!oBusy) {
            return;
        }

        if (bIsBusy === "X") {

            oBusy.style.visibility = "visible";

            // 브라우저 창 닫기 버튼 비활성
            oAPP.CURRWIN.closable = false;

            //다른 팝업의 BUSY ON 요청 처리.
            //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});
            }      

        } else {
            oBusy.style.visibility = "hidden";

            // 브라우저 창 닫기 버튼 활성
            oAPP.CURRWIN.closable = true;

            //다른 팝업의 BUSY OFF 요청 처리.
            //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});
            }

        }

    }

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-find-info', (events, oInfo) => {        

        oAPP.attr.oUserInfo = oInfo.oUserInfo;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;
        oAPP.attr.aAttrData = oInfo.aAttrData;
        oAPP.attr.aServEvtData = oInfo.aServEvtData;
        oAPP.attr.aT_0022 = oInfo.aT_0022;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {

            oAPP.setBusyIndicator("");

            return;
        }

        oWs_frame.src = "index.html";

    });

    oAPP.fn.fnIpcMainFindSuccess = () => {

        oAPP.setBusyIndicator('');

    };

    oAPP.IPCMAIN.on(`${oAPP.BROWSKEY}--find--success`, oAPP.fn.fnIpcMainFindSuccess);

    window.addEventListener("beforeunload", () => {

        oAPP.IPCMAIN.off(`${oAPP.BROWSKEY}--find--success`, oAPP.fn.fnIpcMainFindSuccess);

        // 브라우저 닫는 시점에 busy가 켜있을 경우
        if(oAPP.getBusy() === true){

            //다른 팝업의 BUSY OFF 요청 처리.
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

            return;

        }

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);