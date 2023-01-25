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

    /************************************************************************
     * UI5 BootStrap Settings
     ************************************************************************/
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

    /************************************************************************
     * Application Start!!
     ************************************************************************/
    oAPP.fn.onStart = () => {

        sap.ui.getCore().attachInit(() => {

            oAPP.fn.onInitRendering();

        });

    }; // end of oAPP.fn.onStart    

    /************************************************************************
     * Init Rendering
     ************************************************************************/
    oAPP.fn.onInitRendering = () => {

        let oApp = new sap.m.App({
            autoFocus: false
        }),
            oPage = new sap.m.Page({
                backgroundDesign: sap.m.PageBackgroundDesign.List,
                customHeader: new sap.m.Toolbar({
                    content: [
                        new sap.ui.core.Icon({
                            src: "sap-icon://hide"
                        }),
                        new sap.m.Title({
                            text: "window Hide Slider"
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            type: sap.m.ButtonType.Negative,
                            icon: "sap-icon://decline",
                            press: () => {

                                let oCurrWin = oAPP.REMOTE.getCurrentWindow();
                                oCurrWin.close();

                            }
                        })
                    ]
                }).addStyleClass("u4aWsWinShowHideToolbar"),
                content: [
                    new sap.m.VBox({
                        height: "100%",
                        renderType: sap.m.FlexRendertype.Bare,
                        alignItems: sap.m.FlexAlignItems.Center,
                        items: [

                            new sap.m.Slider("opaSlider", {
                                value: oAPP.attr.DEFAULT_OPACITY * 100,
                                liveChange: (oEvent) => {

                                    oAPP.PARWIN.setIgnoreMouseEvents(true);

                                    let oCurrWin = oAPP.REMOTE.getCurrentWindow(),
                                        oParentWin = oCurrWin.getParentWindow();

                                    let iValue = oEvent.getParameter("value"),
                                        opa = iValue / 100;

                                    oParentWin.setOpacity(opa);

                                    if (opa == 1) {
                                        oAPP.PARWIN.setIgnoreMouseEvents(false);
                                        return;
                                    }

                                }

                            }),

                            new sap.m.HBox({
                                renderType: sap.m.FlexRendertype.Bare,
                                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                                width: "100%",
                                items: [

                                    new sap.m.Button({
                                        text: "20",
                                        press: _pressOpacityButton
                                    }),
                                    new sap.m.Button({
                                        text: "40",
                                        press: _pressOpacityButton
                                    }),

                                    new sap.m.Button({
                                        text: "60",
                                        press: _pressOpacityButton
                                    }),
                                    new sap.m.Button({
                                        text: "80",
                                        press: _pressOpacityButton
                                    }),
                                    new sap.m.Button({
                                        text: "100",
                                        press: _pressOpacityButton
                                    }),
                                ]
                            })

                        ] // end of vbox items
                    }),

                ] // end of page content

            });

        oApp.addPage(oPage);
        oApp.placeAt("content");

        oPage.addStyleClass("sapUiContentPadding");
        // oApp.addStyleClass("sapUiSizeCompact");

        oAPP.PARWIN.setOpacity(oAPP.attr.DEFAULT_OPACITY);

    }; // end of oAPP.fn.onInitRendering

    function _pressOpacityButton(oEvent) {

        debugger;

        let oBtn = oEvent.getSource(),
            sValue = oBtn.getText(),
            iSliderValue = parseInt(sValue),
            iValue = parseInt(iSliderValue) / 100;

        let oSlider = sap.ui.getCore().byId("opaSlider");
        if (oSlider) {
            oSlider.setValue(iSliderValue);
        }

        oAPP.PARWIN.setOpacity(iValue);

        oAPP.PARWIN.setIgnoreMouseEvents(true);

        if (iValue == 1) {
            oAPP.PARWIN.setIgnoreMouseEvents(false);
        }

    }

    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = () => {

        oAPP.fn.onStart();


    };


})(window, oAPP);