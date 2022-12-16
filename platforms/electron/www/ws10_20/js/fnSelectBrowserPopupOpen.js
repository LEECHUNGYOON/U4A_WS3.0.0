/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnSelectBrowserPopupOpen.js
 * - file Desc : 기본 브라우저 설정 팝업
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common;

    oAPP.fn.fnSelectBrowserPopupOpen = function() {

        var FS = parent.FS,

            oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID,

            // 로그인 유저 정보
            oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase(),

            sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        APPCOMMON.fnSetModelProperty("/DEFBR", oP13nData[sSysID].DEFBR);

        var oDialog = sap.ui.getCore().byId("selBrwsDlg");

        // Dialog가 이미 만들어졌을 경우
        if (oDialog) {

            // 이미 오픈 되있다면 return.
            if (oDialog.isOpen()) {
                return;
            }

            oDialog.open();
            return;

        }

        var oVbox = new sap.m.VBox({
            renderType: "Bare",
            items: [
                new sap.m.RadioButtonGroup("browserSelectRadioBtn", {
                    buttons: {
                        path: "/DEFBR",
                        template: new sap.m.RadioButton({
                            text: "{DESC}",
                            selected: "{SELECTED}",
                        }).bindProperty("enabled", "ENABLED", function(values) {

                            if (!values) {
                                this.setSelected(values);
                            }

                            return values;

                        })
                    }
                })
            ],
        });

        // 실행 브라우저 선택 팝업
        var oSelectBrowserDialog = new sap.m.Dialog("selBrwsDlg", {

            // Properties
            draggable: true,
            resizable: true,
            // contentWidth: "500px",
            // contentHeight: "150px",
            // title: "Select Default Browser",
            // titleAlignment: sap.m.TitleAlignment.Center,
            // icon: "sap-icon://internet-browser",

            // Aggregations

            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://internet-browser"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C99"), // Select Default Browser
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function() {

                            var oDialog = sap.ui.getCore().byId("selBrwsDlg");
                            if (oDialog == null) {
                                return;
                            }

                            if (oDialog.isOpen()) {
                                oDialog.close();
                            }

                        }
                    })
                ]
            }),
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_selectBrowserSave
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_selectBrowserClose
                }),
            ],
            content: [
                oVbox
            ]

        }).addStyleClass("sapUiContentPadding");

        oSelectBrowserDialog.open();

    }; // end of oAPP.fn.fnSelectBrowserPopupOpen

    /************************************************************************
     * 기본 브라우저 저장 이벤트
     ************************************************************************/
    oAPP.events.ev_selectBrowserSave = function(oEvent) {

        // 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
        oAPP.fn.fnOnP13nFolderCreate();

        var FS = parent.FS,

            oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID,

            // 로그인 유저 정보
            oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase(),
            sP13nPath = parent.getPath("P13N"),
            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        oP13nData[sSysID].DEFBR = APPCOMMON.fnGetModelProperty("/DEFBR");

        FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

        oEvent.getSource().getParent().close();

    }; // end of oAPP.events.ev_selectBrowserSave

    /************************************************************************
     * 기본 브라우저 선택 팝업 닫기
     ************************************************************************/
    oAPP.events.ev_selectBrowserClose = function(oEvent) {

        oEvent.getSource().getParent().close();

    }; // end of oAPP.events.ev_selectBrowserClose

})(window, $, oAPP);