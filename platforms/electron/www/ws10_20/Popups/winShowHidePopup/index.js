/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : winShowHidePopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/
var zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    const
        PATH = parent.PATH,
        APP = parent.APP,
        APPCOMMON = oAPP.common,
        require = parent.require;

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function () {

        // Browser Window option
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            oThemeInfo = oAPP.attr.oThemeInfo,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    oAPP.fn.onStart = () => {

        sap.ui.getCore().attachInit(() => {

            oAPP.fn.onInitRendering();



        });

    };

    oAPP.fn.onInitRendering = () => {

        let oApp = new sap.m.App({

            }),
            oPage = new sap.m.Page({
                customHeader: new sap.m.Toolbar({
                    content: [
                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            text: "닫기"
                        })
                    ]
                }).addStyleClass("u4aWsWinShowHideToolbar"),
                content: [
                    new sap.m.Input()
                ]
            });

        oApp.addPage(oPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.onInitRendering

    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = () => {

        oAPP.fn.onStart();


    };

})(window, oAPP);