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
    oAPP.IPCRENDERER.on('if_AItest', (events, oInfo) => {

        // oAPP.attr.oUserInfo = oInfo.oUserInfo;
        // oAPP.attr.oServerInfo = oInfo.oServerInfo;
        // oAPP.attr.oThemeInfo = oInfo.oThemeInfo;


        // 채널이름 설정
        oAPP.attr.broadcast = new BroadcastChannel(oInfo.channelKey);

        // 메시지 수신
        oAPP.attr.broadcast.onmessage = function(oEvent){
            console.log(oEvent);
        };




    });

    window.onbeforeunload = function () {

        // 부모창에 포커스를 준다.
        let oParWin = oAPP.CURRWIN.getParentWindow();
        oParWin.focus();

    };



    /************************************************************************
     * 라이브러리 수집 데이터 WS 3.0 메인에 전송 처리.
     ************************************************************************/
    oAPP.fn.sendCollectLibData = function(sLibData){
        
        oAPP.attr.broadcast.postMessage({ LIBDATA: sLibData });

    };

    window.oAPP = oAPP;

    return oAPP;

})(window);