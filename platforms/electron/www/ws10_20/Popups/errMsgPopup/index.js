/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/index.js
 ************************************************************************/

let oAPP = parent.oAPP;

(function(window, oAPP) {
    "use strict";

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
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
    oAPP.fn.fnSetModelProperty = function(sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of oAPP.common.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.fn.fnGetModelProperty = function(sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function() {

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
    oAPP.fn.fnLoadBootStrapSetting = function() {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.table, sap.ui.layout");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting


    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function() {

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            FMTMSG: oAPP.attr.aMsg
        });

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function() {

        var oToolbar = new sap.m.Toolbar({
                content: [
                    new sap.m.Text({
                        text: "Error Footer Message"
                    }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        // press: oAPP.events.fnPressMultiFooterMsgCloseBtn
                    })
                ]
            }).addStyleClass("u4aWsMsgFooter_HeaderToolbar"),

            oTable = new sap.m.Table("footerMsgTable", {
                sticky: ["ColumnHeaders", "HeaderToolbar"],
                fixedLayout: true,
                headerToolbar: oToolbar,
                columns: [
                    new sap.m.Column({
                        width: "100px",
                        hAlign: "Center",
                        header: new sap.m.Label({
                            design: "Bold",
                            text: "Error Type"
                        })
                    }),
                    new sap.m.Column({
                        width: "80px",
                        hAlign: "Center",
                        header: new sap.m.Label({
                            design: "Bold",
                            text: "Line"
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            design: "Bold",
                            text: "Description"
                        })
                    }),
                ],
                items: {
                    path: "/FMTMSG",
                    template: new sap.m.ColumnListItem({
                        type: "Active",
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
        oTable.attachBrowserEvent("dblclick", function(oEvent) {

            return;

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

            switch (oRowData.GRCOD) {

                case "CLS_SNTX":
                case "METH":
                case "CLSD":
                case "CPRO":
                case "CPUB":

                    oAPP.common.execControllerClass(oRowData.OBJID, oRowData.LINE);
                    return;

                default:

                    oAPP.fn.setSelectTreeItem(oRowData.OBJID, oRowData.UIATK, oRowData.TYPE);
                    return;

            }

        });


        var oPage = new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        });

        new sap.m.App({
            autoFocus: false,
            pages: [
                oPage
            ]
        }).placeAt("content");

    }; // end of oAPP.fn.fnInitRendering       

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function() {

        sap.ui.getCore().attachInit(function() {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            oAPP.setBusy('');

        });

    };

})(window, oAPP);