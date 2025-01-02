/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ui5CssPopup/frame.js
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
    oAPP.FS = oAPP.REMOTE.require('fs');
    oAPP.USERDATA = oAPP.APP.getPath("userData");
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;	


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
    

    oAPP.setBusyIndicator = (bIsBusy) => {

        var oBusy = document.getElementById("u4aWsBusyIndicator");

        if (!oBusy) {
            return;
        }

        if (bIsBusy) {
            oBusy.style.visibility = "visible";
        } else {
            oBusy.style.visibility = "hidden";
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
     * CSS 미리보기 전체 선택 해제 시 20번 페이지 미리보기 초기화
     ************************************************************************/
    oAPP.fn.fnUnselectCssItems = function(){

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE: "C", // P : Preview, S: Save, C: Close
            DATA: []
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css`, oSendData);

    }; // end of oAPP.fn.fnUnselectCssItems

    /************************************************************************
     * 현재 팝업 닫기
     ************************************************************************/
    oAPP.fn.fnCurrentWindowClose = () => {

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE: "C", // P : Preview, S: Save, C: Close
            DATA: []
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css`, oSendData);

        var oCurr = oAPP.REMOTE.getCurrentWindow();
        oCurr.close();

    }; // end of oAPP.fn.fnCurrentWindowClose

    /************************************************************************
     * 선택한 css 미리보기
     ************************************************************************/
    oAPP.fn.fnPredefinedCssPreview = (aPreviewCss) => {

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE: "P", // P : Preview, S: Save, C: Close
            DATA: aPreviewCss
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css`, oSendData);

    }; // end of oAPP.fn.fnPredefinedCssPreview

    /************************************************************************
     * 선택한 css 저장
     ************************************************************************/
    oAPP.fn.fnPredefinedCssSave = (aSaveCss) => {

        var BROWSKEY = oAPP.attr.BROWSERKEY;

        var oSendData = {
            TYPE: "S", // P : Preview, S: Save
            DATA: aSaveCss
        }

        oAPP.IPCRENDERER.send(`${BROWSKEY}--if-ui5css`, oSendData);

    }; // end of oAPP.fn.fnPredefinedCssSave

    // [서버에서 호출함] 페이지 7번에 대한 FormData 구성
    oAPP.GET_FORMDATA_M7 = (oFormData) => {

        // sap icon 경로 전달
        let oIconUrl = oAPP.attr.oIconUrl;
        for (const key in oIconUrl) {
            if (Object.hasOwnProperty.call(oIconUrl, key)) {
                const element = oIconUrl[key];

                oFormData.append(key, element);

            }
        }

        return oFormData;

    }; // end of oAPP.M7

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-ui5css-info', (events, oInfo) => {

        let oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oAPP.attr.BROWSERKEY = oInfo.BROWSKEY;  // 브라우저 키
        oAPP.attr.oIconUrl = oInfo.oIconUrl; // SAP ICON PATH

        let oIconUrl = oInfo.oIconUrl, // sap icon url
            sThemeName = oInfo.oThemeInfo.THEME, // 테마정보
            sUrl = oInfo.sServerPath + "/getui5_pre_css"; // 서버 호출 url

        // 서버로 던질 파라미터
        let oParam = {
            LIBPATH: decodeURIComponent(oInfo.sServerBootStrapUrl), // post로 쏠때는 url path 같은 경우 encoding 안해야함.
            THEME: sThemeName,
            ICON_LED_RED: oIconUrl.ICON_LED_RED,
            ICON_LED_GREEN: oIconUrl.ICON_LED_GREEN
        };

        let oForm = document.getElementById("ws_form");
        oForm.setAttribute("action", sUrl);

        for (const key in oParam) {
            if (Object.hasOwnProperty.call(oParam, key)) {

                const element = oParam[key];

                let oInput = document.createElement("input");
                oInput.setAttribute("type", "hidden");
                oInput.setAttribute("name", key);
                oInput.setAttribute("value", element);
                oForm.appendChild(oInput);

            }
        }

        oForm.submit();

        // oWs_frame.src = sUrl;

        oWs_frame.onload = () => {

            oAPP.setBusyIndicator("");

            // oAPP.setBusy("");

        };

    });


    /************************************************************************
     * 창 종료시 
     ************************************************************************/
    
    
    /**
     * [TEST]  테스트 끝나면 반드시 주석을 풀것!! ----------- Start
     */    
    // window.onbeforeunload = () => { 

    //     oAPP.fn.fnCurrentWindowClose();

    // };
    /**
     * [TEST]  테스트 끝나면 반드시 주석을 풀것!! ----------- End
     */    

    window.oAPP = oAPP;

    return oAPP;

})(window);