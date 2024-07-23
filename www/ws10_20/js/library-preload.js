/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : library-preload.js
 * - file Desc : WS 초기 실행 시 필요한 js 및 Object 생성
 ************************************************************************/
let oAPP = (function (window) {
    "use strict";

    // Object 선언부
    let oAPP = {},
        PATH = parent.PATH,
        APP = parent.APP,
        PATHINFO = parent.PATHINFO,
        USERDATA = parent.USERDATA,
        require = parent.require;

    oAPP.global = {};
    oAPP.main = {};

    oAPP.fn = {};

    oAPP.DATA = {};

    oAPP.sap = {};
    oAPP.sap.msgcls = {};

    oAPP.attr = {};
    oAPP.common = {};
    oAPP.wmenu = {}; // window menu

    oAPP.aPreloadScripts = [{
        URL: parent.getPath("JQUERYUI"),
        MIMETYPE: "script"
    },
    {
        URL: "../js/shortcut.js",
        MIMETYPE: "script"
    },
    {
        URL: "../js/download.js",
        MIMETYPE: "script"
    },
    {
        URL: "../js/dateformat.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_common.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/fnNetworkChecker.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_events.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_events_01.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_events_02.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_fn_01.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_fn_02.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_fn_03.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_fn_04.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/fnSuggestion.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/fnDialogPopupOpener.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ipc/ws_fn_ipc.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/fnServerSession.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/fnHmws.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_fn_test.js",
        MIMETYPE: "script"
    },
    {
        URL: "design/js/main.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/usp/ws_usp.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/usp/ws_usp_01.js",
        MIMETYPE: "script"
    },
    {
        URL: "./js/ws_main.js",
        MIMETYPE: "script"
    },
    ];

    oAPP.loadLibrary = function (scripts, index, fnCallback) {

        var oLoadFile = scripts[index];

        $.ajax({
            url: oLoadFile.URL,
            async: false,
            dataType: oLoadFile.MIMETYPE,
            success: function (e) {

                if (scripts.length - 1 <= index) {

                    if (fnCallback) fnCallback();

                    return;
                }

                if (index + 1 <= scripts.length - 1) {
                    oAPP.loadLibrary(scripts, index + 1, fnCallback);
                    return;
                }

                if (fnCallback) fnCallback();

            }

        });

    }; // end of oAPP.loadLibrary

    oAPP.loadJs = function (sUrl, fnCallback) {

        var URL = "./js/" + sUrl + ".js"

        $.ajax({
            url: URL,
            async: false,
            dataType: "script",
            success: function (e) {

                if (typeof fnCallback == "function") {
                    fnCallback();
                }

            }

        });

    }; // end of oAPP.loadJs

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.getSettingsInfo = function () {

        // Browser Window option
        // var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);

        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    /************************************************************************
     * Browser Window Option 정보를 구한다.
     ************************************************************************/
    oAPP.getBrowserWindowSettingInfo = function () {

        // Browser Window option        
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);

        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.getBrowserWindowSettingInfo

    /************************************************************************
     * WS의 UI5 Bootstrap 정보를 생성한다.
     ************************************************************************/
    oAPP.fnLoadBootStrapSetting = function () {

        let oSettings = oAPP.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = parent.getUserInfo(), // 로그인 유저 정보
            sLangu = oUserInfo.LANGU, // 접속 언어           
            oThemeInfo = parent.getThemeInfo(); // theme 정보      

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout, sap.ui.table, sap.tnt, sap.ui.codeeditor, sap.ui.unified");
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * window onload Event
     ************************************************************************/
    oAPP.fnWindowOnInitLoad = function () {

        // 초기 JS Load
        oAPP.loadLibrary(oAPP.aPreloadScripts, 0);

        // WS 시작
        oAPP.main.fnWsStart();

    }; // end of oAPP.fnWindowOnInitLoad

    window.oAPP = oAPP;

    return oAPP;

})(window);

// // UI5 Bootstrap Setting
oAPP.fnLoadBootStrapSetting();

// Window onload
window.addEventListener("load", oAPP.fnWindowOnInitLoad);

document.addEventListener('DOMContentLoaded', function () {

    zconsole.log("[library-preload.js] === > ws10_20.html");

    // var oWin = parent.REMOTE.getCurrentWindow();

    // parent.fn_onWinMove(true, oWin);

    // parent.fn_setPersonalWinSize(oWin);

    // console.log("DOMContentLoaded_2");

});