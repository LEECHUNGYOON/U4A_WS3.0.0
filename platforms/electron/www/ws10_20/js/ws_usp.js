/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp.js
 * - file Desc : u4a ws usp
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common;


    oAPP.fn.fnCreateWs30 = (fnCallback) => {

        // 30번 페이지 존재 유무 체크
        var oWs30 = sap.ui.getCore().byId("WS30");
        if (oWs30 && typeof fnCallback === "function") {

            fnOnInitLayoutSettings();

            fnCallback();

            return;
        }

        // 없으면 렌더링부터..
        fnOnInitRendering();

        fnOnInitLayoutSettings();

        if (typeof fnCallback === "function") {
            fnCallback();
        }

    }; // end of oAPP.fn.fnCreateWs30

    function fnOnInitLayoutSettings() {

        var oSplitLayout = sap.ui.getCore().byId("usptreeSplitLayout");
        if (!oSplitLayout) {
            return;
        }

        oSplitLayout.setSize("500px");
        oSplitLayout.setMinSize(500);

        var oUspTreeTable = sap.ui.getCore().byId("usptree");
        if (!oUspTreeTable) {
            return;
        }

        oUspTreeTable.collapseAll();
        oUspTreeTable.expandToLevel(1);
        oUspTreeTable.setSelectedIndex(0);

    } // end of fnOnInitLayoutSettings

    function fnOnInitRendering() {

        var oApp = sap.ui.getCore().byId("WSAPP");
        if (!oApp) {
            return;
        }

        var sFmsgBindRootPath = "/FMSG/WS30";

        var oCustomHeader = fnGetCustomHeaderWs30(),
            oSubHeader = fnGetSubHeaderWs30(),
            aPageContent = fnGetPageContentWs30(),
            oMsgFooter = new sap.m.OverflowToolbar({
                content: [
                    new sap.ui.core.Icon({
                        color: "{" + sFmsgBindRootPath + "/ICONCOLOR}",
                        src: "{" + sFmsgBindRootPath + "/ICON}"
                    }),
                    new sap.m.Text({
                        text: "{" + sFmsgBindRootPath + "/TXT}"
                    }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        type: "Reject",
                        press: oAPP.common.fnHideFloatingFooterMsg
                    }),
                ]
            });

        var oWs30 = new sap.m.Page("WS30", {

            // properties
            floatingFooter: true,
            enableScrolling: false,

            // aggregations
            customHeader: oCustomHeader,
            subHeader: oSubHeader,
            content: aPageContent,

            footer: oMsgFooter,

        }).bindProperty("showFooter", {
            parts: [
                sFmsgBindRootPath + "/ISSHOW"
            ],
            formatter: function(bIsShow) {

                if (bIsShow == null) {
                    return false;
                }

                if (typeof bIsShow !== "boolean") {
                    return false;
                }

                return bIsShow;
            }
        }).addStyleClass("u4aWs30Page");

        oApp.addPage(oWs30);

    } // end of fnInitRenderingWs30

    /************************************************************************
     * [WS30] Custom Header
     ************************************************************************/
    function fnGetCustomHeaderWs30() {

        var sBindRoot = "/WMENU/WS30";

        //10번 페이지 윈도우 메뉴 정보
        var aWMenu30 = fnGetWindowMenuWS30(),
            oMenuList = fnGetWindowMenuListWS30();

        oMenuList.HEADER = aWMenu30;

        APPCOMMON.fnSetModelProperty(sBindRoot, oMenuList);

        var oMenuUI = {};

        // WS30 페이지의 윈도우 메뉴 구성
        oMenuUI.WMENU20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: `${sBindRoot}/WMENU20`,
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}"
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        oMenuUI.WMENU30 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: `${sBindRoot}/WMENU30`,
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}"
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Help
        oMenuUI.WMENU50 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: `${sBindRoot}/WMENU50`,
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            enabled: "{enabled}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        oMenuUI.Test10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: `${sBindRoot}/Test10`,
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}"
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        var oHH = new sap.m.HBox({
            items: [
                oMenuUI.WMENU20,
                oMenuUI.WMENU30,
                oMenuUI.WMENU50,
                oMenuUI.Test10
            ]
        });

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            WMENU: APPCOMMON.fnGetModelProperty("/WMENU")
        });

        oHH.setModel(oJsonModel);

        oAPP.wmenu.WS30 = oMenuUI;

        return new sap.m.OverflowToolbar({
            content: [
                new sap.m.HBox({
                    items: {
                        path: `${sBindRoot}/HEADER`,
                        template: new sap.m.Button({
                            text: "{text}",
                            press: oAPP.events.ev_pressWMenu30
                        }).bindProperty("visible", {
                            parts: [
                                "key"
                            ],
                            formatter: function(sKey) {

                                if (sKey == null) {
                                    return false;
                                }

                                if (sKey != "Test10") {
                                    return true;
                                }

                                // U4A R&D 일 경우에만 Test Menu를 보여준다.
                                var bIsStaff = oAPP.fn.fnIsStaff();
                                if (!bIsStaff) {
                                    return false;
                                }

                                return true;

                            }
                        })
                    }
                }),

                new sap.m.ToolbarSpacer(),
            ]

        });

    } // end of fnGetCustomHeaderWs30

    /************************************************************************
     * [WS30] Sub Header
     ************************************************************************/
    function fnGetSubHeaderWs30() {

        return new sap.m.OverflowToolbar({
            content: [
                new sap.m.Button("ws30_backBtn", {
                    icon: "sap-icon://nav-back",
                    press: ev_pressWs30Back
                })
            ]

        });

    } // end of fnGetCustomHeaderWs30

    /************************************************************************
     * [WS30] Page Contents
     ************************************************************************/
    function fnGetPageContentWs30() {

        var oTreeTab = fnGetTreeTableWs30(),
            oCodeEditor = fnGetCodeEditorWs30();

        return [

            new sap.ui.layout.Splitter({
                height: "100%",
                width: "100%",
                contentAreas: [

                    oTreeTab,
                    oCodeEditor

                ]
            }),


        ];

    } // end of fnGetPageContentWs30

    /**************************************************************************
     * [WS30] Tree Table
     **************************************************************************/
    function fnGetTreeTableWs30() {

        return new sap.ui.table.TreeTable("usptree", {
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            layoutData: new sap.ui.layout.SplitterLayoutData("usptreeSplitLayout", {
                size: "500px",
                minSize: 500
            }),

            columns: [

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Name",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{NAME}",
                    })

                }),

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Description",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{DESC}",
                    })

                }),

            ],
            rows: {
                path: "/WS30/USPTREE",
                parameters: {
                    arrayNames: ['USPTREE']
                }
            },
            extension: [
                new sap.m.OverflowToolbar({
                    content: [
                        new sap.m.Button({
                            icon: "sap-icon://expand-group",
                            // press: oAPP.events.ev_MimeTreeTableExpand
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://collapse-group",
                            // press: oAPP.events.ev_MimeTreeTableCollapse
                        }),
                    ]
                })
            ],

        });

    } // end of fnGetTreeTableWs30

    /**************************************************************************
     * [WS30] Code Editor
     **************************************************************************/
    function fnGetCodeEditorWs30() {

        return new sap.ui.codeeditor.CodeEditor({
            height: "100%",
            width: "100%",
            syntaxHints: false,
        });

    } // end of fnGetCodeEditorWs30

    /**************************************************************************
     * [WS30] 윈도우 메뉴 정보
     **************************************************************************/
    function fnGetWindowMenuWS30() {

        return [{
                key: "WMENU20",
                text: "Utilities",
                icon: "",
            },
            {
                key: "WMENU30",
                text: "System",
                icon: "",
            },
            {
                key: "WMENU50",
                text: "Help",
                icon: "",
            },
            {
                key: "Test10",
                text: "Test",
                icon: "",
            },
        ];

    } // end of fnGetWindowMenuWS30

    /************************************************************************
     * [WS30] Window Menu List
     ************************************************************************/
    function fnGetWindowMenuListWS30() {

        var aWMENU20 = [{
                key: "WMENU20_01",
                text: "Select Browser Type"
            }],

            aWMENU30 = [{
                key: "WMENU30_01",
                text: "New Window"
            }, {
                key: "WMENU30_02",
                text: "Close Browser"
            }, {
                key: "WMENU30_03",
                text: "Options"
            }, {
                key: "WMENU30_04",
                text: "Release Note",
            }],

            aWMENU50 = [{
                key: "WMENU50_01",
                text: "U4A Help Document",
                enabled: true,
            }],
            
            Test10 = [{
                key: "Test97",
                text: "개발툴"
            }];

        return {
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            WMENU50: aWMENU50,
            Test10: Test10
        };

    } // end of fnGetWindowMenuListWS30

    /**************************************************************************
     * [WS30] Back Button Event
     **************************************************************************/
    function ev_pressWs30Back() {

        // 30번 페이지 모델 초기화
        APPCOMMON.fnSetModelProperty("/WS30", {});

        // 단축키 삭제
        APPCOMMON.removeShortCut("WS30");

        // 단축키 설정
        APPCOMMON.setShortCut("WS10");

        // 10번 페이지로 이동
        oAPP.fn.fnOnMoveToPage("WS10");

    } // end of ev_pressWs30Back

})(window, $, oAPP);