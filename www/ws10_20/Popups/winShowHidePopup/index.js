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
        PATHINFO = parent.PATHINFO,
        require = parent.require;

    /*************************************************************
     * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
     *************************************************************/
    function _onIpcMain_if_p13n_themeChange(){ 

        let oThemeInfo = oAPP.fn.getThemeInfo();
        if(!oThemeInfo){
            return;
        }

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        let oBrowserWindow = oAPP.REMOTE.getCurrentWindow();
            oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        sap.ui.getCore().applyTheme(oThemeInfo.THEME);

    } // end of _onIpcMain_if_p13n_themeChange


    /*************************************************************
     * @function - IPC Event 등록
     *************************************************************/
    function _attachIpcEvents(){

        // let oUserInfo = parent.process.USERINFO;
        let oUserInfo = oAPP.USERINFO;
        let sSysID = oUserInfo.SYSID;

        // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
        oAPP.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

    } // end of _attachIpcEvents


    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function () {

        // Browser Window option
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

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
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            // oThemeInfo = oAPP.attr.oThemeInfo,
            oThemeInfo = oAPP.fn.getThemeInfo(),
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
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);
        
        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * Application Start!!
     ************************************************************************/
    oAPP.fn.onStart = () => {

        sap.ui.getCore().attachInit(() => {

            // IPC Event 등록
            _attachIpcEvents();

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