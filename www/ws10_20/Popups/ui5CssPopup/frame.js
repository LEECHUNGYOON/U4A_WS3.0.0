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
            TYPE: "P", // P : Preview, S: Save
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

    window.oAPP = oAPP;

    return oAPP;

})(window);