/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : errMsgPopup/index.js
 ************************************************************************/
/************************************************************************
 * 에러 감지
 ************************************************************************/
const zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP,
    APPCOMMON = oAPP.common;

(function (window, oAPP) {
    "use strict";

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        APPPATH = APP.getAppPath(),
        PATHINFO = parent.PATHINFO,
        require = parent.require;

    /************************************************************************
     * 모델 데이터 set
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     * @param {Object} oModelData
     * 
     * @param {Boolean} bIsRefresh 
     * model Refresh 유무
     ************************************************************************/
    oAPP.fn.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of APPCOMMON.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.fn.fnGetModelProperty = function (sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

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

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
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
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting


    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function () {

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            FMTMSG: oAPP.attr.aMsg
        });

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oToolbar = new sap.m.Toolbar({
            content: [
                // new sap.m.Text({
                //     text: "Error Footer Message"
                // }),
                new sap.m.ObjectStatus({
                    // inverted: true,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D25"), // Error Message
                    state: sap.ui.core.ValueState.Error,
                    icon: "sap-icon://alert"
                }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    icon: "sap-icon://decline",
                    press: function () {

                        var oCurrWin = oAPP.REMOTE.getCurrentWindow();
                        oCurrWin.close();
                    }
                    // press: oAPP.events.fnPressMultiFooterMsgCloseBtn
                })
            ]
        })
            // .addStyleClass("u4aWsMsgFooter_HeaderToolbar"),
            .addStyleClass("u4aWsMsgFooter_HeaderToolbar u4aWsWindowHeaderDraggable"),

            oTable = new sap.m.Table("footerMsgTable", {
                sticky: [sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar],
                fixedLayout: true,
                headerToolbar: oToolbar,
                columns: [
                    new sap.m.Column({
                        width: "100px",
                        hAlign: sap.ui.core.TextAlign.Center,
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D26"), // Error Type
                        })
                    }),
                    new sap.m.Column({
                        width: "80px",
                        hAlign: sap.ui.core.TextAlign.Center,
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D27"), // Line
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                        })
                    }),
                ],
                items: {
                    path: "/FMTMSG",
                    template: new sap.m.ColumnListItem({
                        type: sap.m.ListType.Active,
                        // press: oAPP.events.ev_pressFooterMsgColListItem,
                        cells: [
                            new sap.m.Text({
                                text: '{TYPE}'
                            }),
                            new sap.m.Text({
                                text: '{LINE}'
                            }),
                            new sap.m.Text({
                                text: '{DESC}'
                            }),
                        ]
                    })
                }

            }).addStyleClass("sapUiSizeCompact");

        // Multi Footer Message 더블클릭
        oTable.attachBrowserEvent("dblclick", function (oEvent) {

            var oTarget = oEvent.target,
                $SelectedRow = $(oTarget).closest(".sapMListTblRow");

            if (!$SelectedRow.length) {
                return;
            }

            var oRow = $SelectedRow[0],
                oSelectedRow = sap.ui.getCore().byId(oRow.id);

            if (!oSelectedRow) {
                return;
            }

            var oCtx = oSelectedRow.getBindingContext(),
                oRowData = oSelectedRow.getModel().getProperty(oCtx.sPath);

            let oCurrWin = oAPP.REMOTE.getCurrentWindow();
            if (oCurrWin.isDestroyed()) {
                return;
            }

            let oWebCon = oCurrWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sBrowserKey = oWebPref.browserkey,
                IPCRENDERER = oAPP.IPCRENDERER;

            IPCRENDERER.send(`${sBrowserKey}--errormsg--click`, {
                oRowData: oRowData
            });

        });

        var oPage = new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        }).addStyleClass("u4aWsErrMsgPopupPage");

        new sap.m.App({
            autoFocus: false,
            pages: [
                oPage
            ]
        }).placeAt("content");

    }; // end of oAPP.fn.fnInitRendering       

    /************************************************************************
     * 공통 css을 적용한다.
     ************************************************************************/
    oAPP.fn.fnLoadCommonCss = () => {

        var sCommonCssUrl = PATH.join(APPPATH, "css", "common.css");

        sCommonCssUrl = sCommonCssUrl.replaceAll("\\", "/");
        sCommonCssUrl = `file:///${sCommonCssUrl}`;
        sCommonCssUrl = encodeURI(sCommonCssUrl);

        var oCss = document.createElement("link");
        oCss.setAttribute("rel", "stylesheet");
        oCss.setAttribute("href", sCommonCssUrl);

        document.head.appendChild(oCss);

    }; // end of oAPP.fn.fnLoadCommonCss

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    // 공통 CSS를 적용한다.
    oAPP.fn.fnLoadCommonCss();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            oAPP.setBusy('');

            // 자연스러운 로딩
            setTimeout(() => {

                $('#content').fadeIn(300, 'linear');

            }, 100);

        });

    };

})(window, oAPP);