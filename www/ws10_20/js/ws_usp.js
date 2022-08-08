/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp.js
 * - file Desc : u4a ws usp
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common,
        APPPATH = parent.APPPATH,
        PATH = parent.PATH;


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
        oUspTreeTable.clearSelection();
        // oUspTreeTable.setSelectedIndex(0);

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
            formatter: function (bIsShow) {

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
                            formatter: function (sKey) {

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

        var oTreeTab = fnGetUspTreeTableWs30(),
            oNavCon = fnGetUspNavContainerWs30();

        return [

            new sap.ui.layout.Splitter({
                height: "100%",
                width: "100%",
                contentAreas: [
                    oTreeTab,
                    oNavCon

                ]
            })

        ];

    } // end of fnGetPageContentWs30

    /**************************************************************************
     * [WS30] Split 우측 NavContainer
     **************************************************************************/
    function fnGetUspNavContainerWs30() {

        var oIntroPage = fnGetUspIntroPageWs30(),
            oAttrPage = fnGetUspAttrPageWs30(),
            oContPage = fnGetUspContPageWs30();


        return new sap.m.NavContainer("usp_navcon", {
            autoFocus: false,
            pages: [
                oIntroPage,
                oAttrPage,
                oContPage

            ]
        });

    } // end of fnGetUspNavContainerWs30

    /**************************************************************************
     * [WS30] USP Page의 우측 Intro Page
     **************************************************************************/
    function fnGetUspIntroPageWs30() {

        var sImgSrc = PATH.join(APPPATH, "img", "intro.png"),

            oImg = new sap.m.Image({
                src: sImgSrc,
            }),

            oVbox = new sap.m.VBox({
                renderType: "Bare",
                width: "100%",
                height: "100%",
                alignItems: sap.m.FlexAlignItems.Center,
                justifyContent: sap.m.FlexAlignItems.Center,
                items: [
                    oImg
                ]

            });

        return new sap.m.Page("usp_intro", {
            showHeader: false,
            content: [
                oVbox
            ]
        });

    } // end of fnGetUspIntroPageWs30

    /**************************************************************************
     * [WS30] USP Page의 우측 Attribute Page
     **************************************************************************/
    function fnGetUspAttrPageWs30() {

        return new sap.m.Page("usp_attr", {
            showHeader: true,
            title: "Attribute",
            content: [

            ]
        });

    } // end of fnGetUspAttrPageWs30

    /**************************************************************************
     * [WS30] USP Page의 우측 Content Page
     **************************************************************************/
    function fnGetUspContPageWs30() {

        var oPanel = fnGetUspPanelWs30(),
            oPage = fnGetUspPageWs30();

        return new sap.m.Page("usp_cont", {
            showHeader: false,
            content: [

                new sap.ui.layout.Splitter({
                    height: "100%",
                    width: "100%",
                    orientation: "Vertical",
                    contentAreas: [
                        oPanel,
                        oPage
                    ]

                })

            ]

        });

    } // end of fnGetUspContPageWs30

    /**************************************************************************
     * [WS30] Tree Table
     **************************************************************************/
    function fnGetUspTreeTableWs30() {

        return new sap.ui.table.TreeTable("usptree", {

            // Properties
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",

            // Aggregations
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
                        text: "{OBJKY}",
                    })

                }),

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Description",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{OBJNM}",
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

            contextMenu: new sap.m.Menu({
                items: {
                    path: "/WS30/USPTREE/CTXMENU",
                    template: new sap.m.MenuItem({
                        icon: "{ICON}",
                        key: "{KEY}",
                        text: "{TXT}",
                        enabled: "{ENABLED}",
                        startsSection: "{ISSTART}",
                        visible: "{VISIBLE}"
                    })
                },
                itemSelected: ev_UspTreeCtxMenuClick
            }),

            // Events
            beforeOpenContextMenu: ev_beforeOpenContextMenu,
            rowSelectionChange: ev_rowSelectionChange

        });

    } // end of fnGetTreeTableWs30

    /**************************************************************************
     * [WS30] Usp Panel
     **************************************************************************/
    function fnGetUspPanelWs30() {

        // Usp Url
        var oUrlInput = new sap.m.Input({
                value: "{/WS30/USPDATA/URL}",
                editable: false
            }).addStyleClass("sapUiTinyMarginEnd"),

            // Mime Url Copy Button
            oUrlCopyBtn = new sap.m.Button({
                text: "URL Copy",
                press: ev_pressUspUrlCopy.bind(this, oUrlInput)
            });

        var oForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                singleContainerFullSize: true
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "URL"
                            }),
                            fields: new sap.m.HBox({
                                renderType: "Bare",
                                items: [
                                    oUrlInput,
                                    oUrlCopyBtn
                                ]
                            })
                        }),
                        // new sap.ui.layout.form.FormElement({
                        //     label: new sap.m.Label({
                        //         design: "Bold",
                        //         text: "Create"
                        //     }),
                        //     fields: new sap.m.HBox({
                        //         renderType: "Bare",
                        //         items: [
                        //             oCreateDateInput,
                        //             oCreateTimeInput,
                        //             oCreateUnameInput
                        //         ]
                        //     })
                        // }),
                    ]
                }),
            ]
        });

        return new sap.m.Panel("uspPanel", {

            headerText: "Properties",
            content: [
                oForm
            ],
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "150px",
                minSize: 150
            })

        });

    } // end of fnGetUspPanelWs30

    /**************************************************************************
     * [WS30] Usp Page
     **************************************************************************/
    function fnGetUspPageWs30() {

        // var sImgSrc = PATH.join(APPPATH, "img", "intro.png"),

        //     oImg = new sap.m.Image({
        //         src: sImgSrc,
        //     }),

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor({
                height: "100%",
                width: "100%",
                syntaxHints: false,
                value: "{/WS30/USPDATA/DATA}",
            });
            // .bindProperty("visible", {
            //     parts: [
            //         "/WS30/USPDATA/VISI"
            //     ],
            //     formatter: function (VISI) {

            //         if (VISI !== "DATA") {
            //             return false;
            //         }

            //         return true;

            //     }

            // }),

            // oVbox = new sap.m.VBox({
            //     renderType: "Bare",
            //     width: "100%",
            //     height: "100%",
            //     alignItems: sap.m.FlexAlignItems.Center,
            //     justifyContent: sap.m.FlexAlignItems.Center,
            //     items: [
            //         oImg
            //     ]

            // }).bindProperty("visible", {
            //     parts: [
            //         "/WS30/USPDATA/VISI"
            //     ],
            //     formatter: function (VISI) {

            //         // visible 값이 없으면 No data 화면을 보여준다.
            //         if (!VISI || VISI == "") {
            //             return true;
            //         }

            //         return false;

            //     }

            // });

        return new sap.m.Page({
            showHeader: false,

            content: [
                // oVbox,
                oCodeEditor
            ]

        });

    } // end of fnGetUspPageWs30  

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

    /**************************************************************************
     * [WS30] USP Tree rowSelectionChange
     **************************************************************************/
    function ev_rowSelectionChange(oEvent) {

        // 마우스 우클릭일 경우는 실행하지 않기
        if ("which" in event) {
            if (event.which == 3) {
                return;
            }
        }

        var oUspData = {
            DATA: "",
            // VISI: "",
            URL: ""
        };

        APPCOMMON.fnSetModelProperty("/WS30/USPDATA", oUspData);

        var oTreeTable = oEvent.getSource(),
            iSelIdx = oTreeTable.getSelectedIndex();

        if (iSelIdx == -1) {
            return;
        }

        var oCtx = oTreeTable.getContextByIndex(iSelIdx),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // 선택한 위치가 Root 또는 폴더이면 return.
        if (oData.ISROOT == "X" || oData.ISFLD == "X") {
            return;
        }

        APPCOMMON.fnSetModelProperty("/WS30/USPDATA", {
            // VISI: "DATA",
            URL: oData.OBJKY,
            DATA: oData.DATA
        });

    } // end of ev_rowSelectionChange

    /**************************************************************************
     * [WS30] USP Url Clipboard Copy
     **************************************************************************/
    function ev_pressUspUrlCopy(oInput, oEvent) {

        var $oInputDom = oInput._$input;
        if ($oInputDom.length == 0) {
            return;
        }

        var sInputValue = oInput.getValue();
        if (sInputValue == "") {
            return;
        }

        $oInputDom.select();

        document.execCommand("copy");

        $oInputDom[0].setSelectionRange(0, 0);

        parent.showMessage(sap, 10, null, "Clipboard Copy!");

    } // end of ev_pressUspUrlCopy

    /**************************************************************************
     * [WS30] USP Tree beforeOpenContextMenu Event
     **************************************************************************/
    function ev_beforeOpenContextMenu(oEvent) {

        debugger;

        var oTreeTable = oEvent.getSource(),
            iSelectRow = oEvent.getParameter("rowIndex"),
            oCtx = oTreeTable.getContextByIndex(iSelectRow);

        // 우클릭한 라인을 선택 처리 한다.
        oTreeTable.setSelectedIndex(iSelectRow);

        var oRowData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // mime tree 의 기본 contextmenu 정보를 구한다. 
        var aCtxMenu = fnGetUspTreeDefCtxMenuList();



    } // end of ev_beforeOpenContextMenu

    /**************************************************************************
     * [WS30] USP Tree ContextMenu Default 정보
     **************************************************************************/
    function fnGetUspTreeDefCtxMenuList() {

        return [{
                ICON: "",
                KEY: "K1",
                TXT: "Expand Subtree",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K2",
                TXT: "Collapse Subtree",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K3",
                TXT: "Create Folder",
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K4",
                TXT: "Delete Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K5",
                TXT: "Import Mime Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K6",
                TXT: "Download Mime Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            }
        ];

    } // end of fnGetUspTreeDefCtxMenuList

    /**************************************************************************
     * [WS30] USP Tree ContextMenu Click Event
     **************************************************************************/
    function ev_UspTreeCtxMenuClick(oEvent) {

        debugger;





    } // end of ev_UspTreeCtxMenuClick

})(window, $, oAPP);