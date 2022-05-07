/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : runtimeClassNavigator/frame.js
 ************************************************************************/

let oAPP = (function(window) {
    "use strict";
    
    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};
    oAPP.attr.aRuntime = [];
    
    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path'); 
    oAPP.APP = oAPP.REMOTE.app;

    oAPP.setBusy = function(bIsShow){

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
    oAPP.IPCRENDERER.on('if-runtime-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.oUserInfo;

        let aRuntimeData = oInfo.aRuntimeData;

        // 전달받은 Runtime 데이터가 Array 형식이 아니면 리턴.
        if(aRuntimeData instanceof Array == false){
            return;
        }

        var iRuntimeCnt = aRuntimeData.length,            
            sPrefixClassNm = "ZCL_U4A_",
            aRuntime = [];

        // Runtime Class 정보 구성
        for(var i = 0; i < iRuntimeCnt; i++){

            // Object Type이 "1" 인것만 수집
            var oRuntime = aRuntimeData[i];
            if(oRuntime.OBJTY != "1"){
                continue;
            }

            aRuntime.push({
                UIOBJ : oRuntime.UIOBJ,     // UI 명
                LIBNM : oRuntime.LIBNM,     // UI5 Library 명
                CLASS : sPrefixClassNm + oRuntime.UIOBK
            });

        }

        // Runtime Class 정보 Global 변수에 저장
        oAPP.attr.aRuntime = aRuntime;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

        var oCurrWin = oAPP.REMOTE.getCurrentWindow();
        oCurrWin.setOpacity(1);

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);