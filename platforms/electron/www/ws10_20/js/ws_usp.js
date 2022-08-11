/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp.js
 * - file Desc : u4a ws usp
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APPCOMMON = oAPP.common,
        APPPATH = parent.APPPATH,
        PATH = parent.PATH,
        RANDOM = parent.RANDOM,
        MIMETYPES = parent.MIMETYPES;

    /**
     * 
     * 
     */
    var gSelectedTreeIndex = -1,
        gBeforeBindPath = "",
        gISEDIT = "";

    oAPP.fn.fnCreateWs30 = () => {

        // 30번 페이지 존재 유무 체크
        var oWs30 = sap.ui.getCore().byId("WS30");
        if (oWs30) {
            return;
        }

        // 없으면 렌더링부터..
        fnOnInitRendering();

    }; // end of oAPP.fn.fnCreateWs30

    oAPP.fn.fnOnInitLayoutSettingsWs30 = () => {

        var oSplitLayout = sap.ui.getCore().byId("usptreeSplitLayout");
        if (oSplitLayout) {
            oSplitLayout.setSize("500px");
            oSplitLayout.setMinSize(500);
        }

        var oUspTreeTable = sap.ui.getCore().byId("usptree");
        if (oUspTreeTable) {
            oUspTreeTable.collapseAll();
            oUspTreeTable.clearSelection();
        }

        var oWs30Navcon = sap.ui.getCore().byId("usp_navcon");
        if (oWs30Navcon) {
            fnOnMoveToPage("USP10");
        }

    }; // end of fnOnInitLayoutSettingsWs30

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
                        press: APPCOMMON.fnHideFloatingFooterMsg
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

        var sBindRootPath = "/WS30/APP";

        var oBackBtn = new sap.m.Button("ws30_backBtn", {
                icon: "sap-icon://nav-back",
                press: ev_pressWs30Back
            }),

            oAppIdTxt = new sap.m.Title({
                text: `{${sBindRootPath}/APPID}`
            }).addStyleClass("sapUiSmallMarginEnd"), // APPID

            oAppModeTxt = new sap.m.Title("ws30_appModeTxt")
            .bindProperty("text", {

                parts: [
                    `${sBindRootPath}/IS_EDIT`,
                ],
                formatter: (IS_EDIT) => {
                    return IS_EDIT == "X" ? "Change" : "Display";
                }

            }).addStyleClass("sapUiSmallMarginEnd"), // Change or Display Text	

            oAppActTxt = new sap.m.Title("ws30_appActTxt")
            .bindProperty("text", {

                parts: [
                    `${sBindRootPath}/ACTST`,
                ],
                formatter: (ACTST) => {
                    return ACTST == "A" ? "Active" : "Inactive";
                }

            }).addStyleClass("sapUiSmallMarginEnd"), // Activate or inactivate Text

            oNewWindowBtn = new sap.m.Button("ws30_newWindowBtn", {
                icon: "sap-icon://create",
                tooltip: "New Window (Ctrl+N)",
                press: oAPP.events.ev_NewWindow
            });

        return new sap.m.OverflowToolbar({
            content: [
                oBackBtn,
                oAppIdTxt,
                oAppModeTxt,
                oAppActTxt,

                new sap.m.ToolbarSeparator(),

                oNewWindowBtn

            ]
        });

    } // end of fnGetCustomHeaderWs30


    /************************************************************************
     * [WS30] Page Toolbar Buttons
     ************************************************************************/
    function fnGetUspPageToolbarButtonsWs30() {

        var sBindRootPath = "/WS30/APP",
            sVisiBindPath = "/WS30/APP/IS_EDIT";

        // visible 바인딩 프로퍼티 설정
        function lf_bindPropForVisible(bIsDispMode) {

            if (bIsDispMode == null) {
                return false;
            }

            var sId = this.getId(),
                bIsDisp = (bIsDispMode == "X" ? true : false);

            switch (sId) {
                case "ws30_changeModeBtn":
                    return !bIsDisp;

                default:
                    return bIsDisp;
            }

        } // end of lf_bindPropForVisible

        var oDisplayModeBtn = new sap.m.Button("ws30_displayModeBtn", {
                icon: "sap-icon://display",
                tooltip: "Display <--> Change (Ctrl+F1)",
                // press: ev_pressDisplayModeBtn
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible)
            .addStyleClass("u4aWs20DisplayModeBtn"),

            oChangeModeBtn = new sap.m.Button("ws30_changeModeBtn", {
                icon: "sap-icon://edit",
                tooltip: "Display <--> Change (Ctrl+F1)",
                // press: ev_pressDisplayModeBtn
            }).bindProperty("visible", {
                parts: [{
                        path: "/USERINFO/USER_AUTH/IS_DEV" // 개발자 권한 여부
                    },
                    {
                        path: "/USERINFO/ISADM"
                    },
                    {
                        path: `${sBindRootPath}/ADMIN_APP` // "ADMIN App 여부"
                    },
                    {
                        path: sVisiBindPath
                    },

                ],
                formatter: (IS_DEV, ISADM, ADMIN_APP, IS_EDIT) => {

                    // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                    if (IS_DEV != "D") {
                        return false;
                    }

                    // Admin이 아닌 유저가 Admin App을 열었을 경우 버튼 비활성화
                    if (ISADM != "X" && ADMIN_APP == "X") {
                        return false;
                    }

                    let bIsDisp = (IS_EDIT == "X" ? true : false);
                    return !bIsDisp;

                }
            }),

            oActivateBtn = new sap.m.Button("ws30_activateBtn", {
                icon: "sap-icon://activate",
                tooltip: "Activate (Ctrl+F3)",
                // press: ev_pressActivateBtn,
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible),

            oSaveBtn = new sap.m.Button("ws30_saveBtn", {
                icon: "sap-icon://save",
                tooltip: "Save (Ctrl+S)",
                press: ev_pressSaveBtn,
            })
            // .bindProperty("enabled", sVisiBindPath, lf_bindPropForVisible)
            .bindProperty("visible", {
                parts: [{
                    path: "/USERINFO/USER_AUTH/IS_DEV"
                }, {
                    path: sVisiBindPath
                }],
                formatter: (IS_DEV, IS_EDIT) => {

                    // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                    if (IS_DEV != "D" || IS_EDIT != "X") {
                        return false;
                    }

                    return true;

                }
            }),

            oControllerBtn = new sap.m.Button("ws30_controllerBtn", {
                icon: "sap-icon://developer-settings",
                text: "Controller (Class Builder)",
                tooltip: "Controller (Ctrl+F12)",
                // press: ev_pressControllerBtn
            });

        return [

            oDisplayModeBtn,
            oChangeModeBtn,

            new sap.m.ToolbarSeparator(),

            oActivateBtn,
            oSaveBtn,

            new sap.m.ToolbarSeparator(),

            oControllerBtn

        ];

    }; // end of fnGetUspPageToolbarButtonsWs30

    /************************************************************************
     * [WS30] Page Contents
     ************************************************************************/
    function fnGetPageContentWs30() {

        var oTreeTab = fnGetUspTreeTableWs30(),
            oNavCon = fnGetUspNavContainerWs30(),
            aToolbarButtons = fnGetUspPageToolbarButtonsWs30();

        return [

            new sap.m.VBox({
                renderType: "Bare",
                width: "100%",
                height: "100%",
                items: [

                    new sap.m.OverflowToolbar({
                        content: aToolbarButtons
                    }),

                    new sap.m.Page({
                        showHeader: false,
                        content: [

                            new sap.ui.layout.Splitter({
                                height: "100%",
                                width: "100%",
                                contentAreas: [
                                    oTreeTab,
                                    oNavCon

                                ]
                            })

                        ]

                    })
                ]
            })

        ];

    } // end of fnGetPageContentWs30

    /**************************************************************************
     * [WS30] Split 우측 NavContainer
     **************************************************************************/
    function fnGetUspNavContainerWs30() {

        var oIntroPage = fnGetUspIntroPageWs30(),
            // oAttrPage = fnGetUspAttrPageWs30(),
            oContPage = fnGetUspContPageWs30();

        return new sap.m.NavContainer("usp_navcon", {
            autoFocus: false,
            pages: [
                oIntroPage,
                // oAttrPage,
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
            }).addStyleClass("u4aWsUspIntroImg"),

            oVbox = new sap.m.VBox({
                // renderType: "Bare",
                width: "100%",
                height: "100%",
                alignItems: sap.m.FlexAlignItems.Center,
                justifyContent: sap.m.FlexAlignItems.Center,
                items: [
                    oImg
                ]

            });

        return new sap.m.Page("USP10", {
            showHeader: false,
            enableScrolling: false,
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

        return new sap.m.Page("USP20", {
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
            // selectionMode: "None",
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            rowHeight: 45,

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

                    // template: new sap.m.Text({
                    //     text: "{OBDEC}",
                    // })

                    template: new sap.m.HBox({
                        renderType: "Bare",
                        items: [

                            new sap.ui.core.Icon({
                                // src: "{ICONSRC}"
                                src: "sap-icon://accept",
                                visible: "{ICONVISI}"
                            })
                            .bindProperty("visible", "ICONVISI", function(VISI) {

                                if (!VISI) {
                                    return false;
                                }

                                return VISI;

                            })
                            .addStyleClass("sapUiTinyMarginEnd"),

                            new sap.m.Text({
                                text: "{OBDEC}",
                            })

                        ]
                    })

                }),

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Description",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{DESCT}",
                    })

                }),

            ],
            rows: {
                path: "/WS30/USPTREE",
                parameters: {
                    numberOfExpandedLevels: 1,
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
                    path: "/WS30/CTXMENU",
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
            // rowSelectionChange: ev_rowSelectionChange
            rowSelectionChange: function(oEvent) {

                var oTreeTable = oEvent.getSource(),
                    iSelIdx = oTreeTable.getSelectedIndex(),
                    iRowIndex = oEvent.getParameter("rowIndex");

                if (iSelIdx == iRowIndex) {
                    return;
                }

                oTreeTable.setSelectedIndex(iRowIndex);

            }

        }).attachBrowserEvent("dblclick", ev_uspTreeItemDblClickEvent).addStyleClass("u4aWsUspTree");

    } // end of fnGetTreeTableWs30    

    /**************************************************************************
     * [WS30] Usp Panel
     **************************************************************************/
    function fnGetUspPanelWs30() {

        // Usp Url
        var oUrlInput = new sap.m.Input({
                value: "{/WS30/USPDATA/SPATH}",
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

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor({
                height: "100%",
                width: "100%",
                syntaxHints: true,
                type: "{/WS30/USPDATA/EXTEN}",
                value: "{/WS30/USPDATA/CONTENT}",
                change: ev_codeEditorChange
            })
            .bindProperty("editable", "/WS30/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding)
            .bindProperty("type", "/WS30/USPDATA/EXTEN", function(EXTEN) {

                this.setSyntaxHints(true);

                switch (EXTEN) {

                    case "js":
                        return "javascript";

                    case "ts":
                        return "typescript";

                    case "css":
                        return "css";

                    case "htm":
                    case "html":
                        return "html";

                    case "vbs":
                        return "vbscript";

                    case "xml":
                        return "xml";

                    case "svg":
                        return "svg";

                    case "txt":
                        return "text";

                    default:

                        this.setSyntaxHints(false);

                        return;

                }

            });


        oCodeEditor.addDelegate({
            onAfterRendering: function(oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            }
        });

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
                TXT: "Create",
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K4",
                TXT: "Delete",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K5",
                TXT: "Download",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            }
        ];

    } // end of fnGetUspTreeDefCtxMenuList

    /**************************************************************************
     * [WS30] USP Tree의 생성 팝업
     **************************************************************************/
    function fnCreateUspNodePopup(oTreeTable) {

        var sBindRootPath = "/WS30/USPCRT",
            iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oCtx) {
            return;
        }

        var oData = oTreeTable.getModel().getProperty(oCtx.sPath),
            oInitData = {
                TITLE: oData.OBDEC,
                NAME: "",
                NAME_VS: "",
                NAME_VSTXT: "",
                DESC: "",
                ISFLD: false
            };

        // USP 생성 팝업의 초기 데이터 모델 세팅
        APPCOMMON.fnSetModelProperty(sBindRootPath, oInitData);

        var oDialog = sap.ui.getCore().byId("uspCrNodePopup");
        if (oDialog) {
            oDialog.open();
            return;
        }

        // USP 생성 팝업의 FORM
        var oUspCrForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 12,
                labelSpanL: 12,
                labelSpanM: 12,
                labelSpanS: 12,
                singleContainerFullSize: false
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({

                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: true,
                                design: "Bold",
                                text: "Name"
                            }),
                            fields: new sap.m.Input({
                                value: `{${sBindRootPath}/NAME}`,
                                valueStateText: `{${sBindRootPath}/NAME_VSTXT}`,
                                // submit: oAPP.events.ev_createMimeFolderEvent
                            }).bindProperty("valueState", `${sBindRootPath}/NAME_VS`, function(VST) {

                                // 바인딩 필드에 값이 없으면 ValueState의 기본값으로 리턴
                                if (VST == null || VST == "") {
                                    return sap.ui.core.ValueState.None;
                                }

                                return VST;

                            })

                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "Description"
                            }),
                            fields: new sap.m.Input({
                                value: `{${sBindRootPath}/DESC}`,
                                // submit: oAPP.events.ev_createMimeFolderEvent
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "Folder"
                            }),
                            fields: new sap.m.CheckBox({
                                selected: `{${sBindRootPath}/ISFLD}`
                            })
                        }),

                    ]

                }),

            ]

        });

        // USP Folder 생성 팝업
        var oUspCrDlg = new sap.m.Dialog("uspCrNodePopup", {
            draggable: true,
            resizable: true,
            title: `Create [ {${sBindRootPath}/TITLE} ]`,
            contentWidth: "500px",
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: ev_createUspDlgCloseEvent
                }),
            ],

            content: [
                oUspCrForm
            ],

            afterClose: function() {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oUspCrDlg.open();

    } // end of fnCreateUspNodePopup

    /**************************************************************************
     * [WS30] USP Tree의 Node 삭제
     **************************************************************************/
    function fnDeleteUspNode(oTreeTable) {

        var iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oTreeModel = oTreeTable.getModel(),
            oTreeData = oTreeModel.getProperty(oCtx.sPath);

        // 질문 메시지
        var sMsg = ` [ ${oTreeData.OBDEC} ] ` + oAPP.common.fnGetMsgClsTxt("003"); // Do you really want to delete the object?

        // 질문팝업? 삭제하시겠습니까?
        parent.showMessage(sap, 30, 'W', sMsg, _fnDeleteUspNodeCb.bind(this, oTreeTable));

    } // end of fnDeleteUspNode

    function _fnDeleteUspNodeCb(oTreeTable, oEvent) {

        if (oEvent !== "YES") {
            return;
        }

        var iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oCtx) {
            return;
        }

        var oTreeModel = oTreeTable.getModel(),
            oTreeData = oTreeModel.getProperty(oCtx.sPath),

            oResult = _fnFindModelData(oCtx.sPath),

            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oTreeData.OBJKY);

        if (iFindIndex == -1) {
            return;
        }

        oResult.Nodes.splice(iFindIndex, 1);

        oTreeModel.setProperty(oResult.Path, oResult.Nodes);

        oTreeModel.refresh();

        oTreeTable.clearSelection();

    } // end of _fnDeleteUspNodeCb

    function _fnFindModelData(sPath) {

        var aa = sPath.split("/"),
            ilen = aa.length,
            mo = APPCOMMON.fnGetModelProperty("/"),
            sPath = "",
            dd;

        for (var i = 0; i < ilen; i++) {

            var tt = aa[i];

            if (tt == "") {
                continue;
            }

            if (i <= ilen - 2) {
                sPath += `/${tt}`;
            }

            if (!dd) {
                dd = mo[tt];
                continue;
            }

            if (i == ilen - 1) {

                break;
            }

            dd = dd[tt];

        }

        return {
            Path: sPath,
            Nodes: dd
        };

    } // end of _fnFindModelData


    function fnMoveToWs10() {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Busy 실행
        parent.setBusy('X');

        // 글로벌 변수 초기화
        gBeforeBindPath = "";

        gSelectedTreeIndex = -1;

        oAPP.fn.fnOnInitLayoutSettingsWs30();

        // 10번 페이지로 이동할때 서버 한번 콜 해준다. (서버 세션 죽이기)
        oAPP.fn.fnKillUserSession(_fnKillUserSessionCb);

    } // end of fnMoveToWs10

    function _fnKillUserSessionCb() {

        /**
         * 페이지 이동 시, CHANGE 모드였다면 현재 APP의 Lock Object를 해제한다.
         */
        var oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP");

        if (oAppInfo.IS_EDIT == 'X') {
            ajax_unlock_app(oAppInfo.APPID);
        }

        // WS20 화면에서 떠있는 Dialog, Popup 종류, Electron Browser들 전체 닫는 function
        oAPP.fn.fnCloseAllWs20Dialogs();

        // App Info 초기화
        parent.setAppInfo({});

        // WS20에 대한 모델 정보 초기화
        APPCOMMON.fnSetModelProperty("/WS30", {});

        // 단축키 삭제
        APPCOMMON.removeShortCut("WS30");

        // 단축키 설정
        APPCOMMON.setShortCut("WS10");

        // 10번 페이지로 이동
        oAPP.fn.fnOnMoveToPage("WS10");

        // Busy 끄기
        parent.setBusy('');

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

    } // end of _fnKillUserSessionCb

    //tree -> tab으로 변환.
    function _parseTree2Tab(e, sArrName) {
        var a = [],
            t = function(e) {
                $.each(e, function(e, o) {
                    o[sArrName] && (t(o[sArrName]),
                        delete o[sArrName]);
                    a.push(o);
                })
            };
        t(JSON.parse(JSON.stringify(e)));
        return a;

    } //tree -> tab으로 변환.


    // //tree -> tab으로 변환.
    // function _parseTree2Tab(e) {
    //     var a = [],
    //         t = function(e) {
    //             $.each(e, function(e, o) {
    //                 o.USPTREE && (t(o.USPTREE),
    //                     delete o.USPTREE);
    //                 a.push(o);
    //             })
    //         };
    //     t(JSON.parse(JSON.stringify(e)));
    //     return a;

    // } //tree -> tab으로 변환.








    /**************************************************************************
     * [WS30] Tree Table 더블클릭 이벤트
     **************************************************************************/
    function ev_uspTreeItemDblClickEvent(oEvent) {

        var oTarget = oEvent.target,
            $SelectedRow = $(oTarget).closest(".sapUiTableRow");

        if (!$SelectedRow.length) {
            return;
        }

        var oRow = $SelectedRow[0],

            sRowId1 = oRow.getAttribute("data-sap-ui-related"),
            sRowId2 = oRow.getAttribute("data-sap-ui"),
            sRowId = "";

        if (sRowId1 == null && sRowId2 == null) {
            return;
        }

        if (sRowId1) {
            sRowId = sRowId1;
        }

        if (sRowId2) {
            sRowId = sRowId2;
        }

        var oRow = sap.ui.getCore().byId(sRowId);
        if (!oRow) {
            return;
        }

        var oCtx = oRow.getBindingContext();
        if (!oCtx) {
            return;
        }

        if (gBeforeBindPath == oCtx.sPath) {
            return;
        }

        console.log("로우 더블 클릭!!!");

        var oRowModel = oRow.getModel(),
            oRowData = oRowModel.getProperty(oCtx.sPath);

        // 선택한 Row 가 ROOT 또는 폴더 이면 빠져나감.
        if (oRowData.PUJKY == "" || oRowData.ISFLD == "X") {
            return;
        }

        var sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_get_object_line_data`;

        var oFormData = new FormData();
        oFormData.append("sData", JSON.stringify(oRowData));

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        sendAjax(sPath, oFormData, _fnLineSelectCb.bind(oRow));

    } // end of ev_uspTreeItemDblClickEvent

    function _fnLineSelectCb(oResult) {

        if (oResult.RETCD == "E") {

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

            parent.setBusy("");

            parent.setSoundMsg("02"); // error sound

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

            return;

        }

        // app 정보를 구한다.
        var oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),
            IS_EDIT = oAppInfo.IS_EDIT;
        
        if (IS_EDIT == "X") {







        }

        var oRow = this,
            oRowModel = oRow.getModel(),
            oCtx = oRow.getBindingContext(),
            sCurrBindPath = oCtx.getPath();

        // 리턴받은 라인 정보로 업데이트
        var oResultRowData = oResult.S_HEAD;
        oResultRowData.ICONVISI = true;

        // 현재 선택한 좌측 트리 데이터 업데이트
        oRowModel.setProperty(sCurrBindPath, oResultRowData);

        // 우측 컨텐츠 영역 모델 데이터 설정
        var oContent = {
            OBJKY: oResultRowData.OBJKY,
            EXTEN: oResultRowData.EXTEN,
            CONTENT: oResult.CONTENT,
            SPATH: oResultRowData.SPATH
        }

        APPCOMMON.fnSetModelProperty("/WS30/USPDATA", oContent);

        fnOnMoveToPage("USP20");

        // 이전에 선택한 라인이 있다면 해당 라인 선택 아이콘 표시 해제
        var oBeforeRowData = oRowModel.getProperty(gBeforeBindPath);
        if (oBeforeRowData) {
            oBeforeRowData.ICONVISI = false;
            oRowModel.setProperty(gBeforeBindPath, oBeforeRowData);
        }

        // 선택한 index 이전 히스토리 저장
        gBeforeBindPath = sCurrBindPath;

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        parent.setBusy("");










    } // end of _fnLineSelectCb

    /**************************************************************************
     * [WS30] USP PAGE 우측영역 페이지 이동
     **************************************************************************/
    function fnOnMoveToPage(sPage) {

        var oUspNav = sap.ui.getCore().byId("usp_navcon");
        if (!oUspNav) {
            return;
        }

        oUspNav.to(sPage);

    } // end of fnOnMoveToPage

    /**************************************************************************
     * [WS30] Back Button Event
     **************************************************************************/
    function ev_pressWs30Back() {

        fnMoveBack_Ws30_To_Ws10();

    } // end of ev_pressWs30Back

    function fnMoveBack_Ws30_To_Ws10() {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // app 정보를 구한다.
        var oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),

            IS_CHAG = oAppInfo.IS_CHAG,
            IS_EDIT = oAppInfo.IS_EDIT;

        // 변경된 데이터가 없거나 display 모드일 경우 묻지도 말고 바로 빠져나간다.
        if (IS_CHAG != 'X' || IS_EDIT != 'X') {

            // WS10 페이지로 이동        
            fnMoveToWs10();

            return;
        }

        var sMsg = "";
        sMsg = oAPP.common.fnGetMsgClsTxt("118"); // "Application has been changed"
        sMsg += " \n " + oAPP.common.fnGetMsgClsTxt("119"); // "Save before leaving editor?"    

        // 메시지 질문 팝업을 띄운다.
        parent.showMessage(sap, 40, 'W', sMsg, fnMoveBack_Ws30_To_Ws10Cb);

        // 현재 떠있는 팝업 창들을 잠시 숨긴다.
        oAPP.fn.fnChildWindowShow(false);

        sap.ui.getCore().unlock();
    }

    function fnMoveBack_Ws30_To_Ws10Cb(ACTCD) {

        // 이동을 하지 않는다.
        if (ACTCD == null || ACTCD == "CANCEL") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        // 저장 후 이동한다.
        if (ACTCD == "YES") {

            sap.ui.getCore().lock();

            var oSaveBtn = sap.ui.getCore().byId("saveBtn");
            if (!oSaveBtn) {
                return;
            }

            // // 저장 로직 수행 한다.
            // oSaveBtn.firePress({
            //     ISBACK: "X"
            // });

            return;

        }

        // WS10 페이지로 이동
        fnMoveToWs10();

    } // end of ev_pressWs30BackCb

    /**************************************************************************
     * [WS30] USP Tree rowSelectionChange
     **************************************************************************/
    function ev_rowSelectionChange(oEvent) {

        // 마우스 우클릭일 경우는 실행하지 않기
        if (event && "which" in event) {
            if (event.which == 3) {
                return;
            }
        }

        var oTreeTable = oEvent.getSource(),
            iSelIdx = oTreeTable.getSelectedIndex(),
            iRowIndex = oEvent.getParameter("rowIndex");

        if (iSelIdx != iRowIndex) {
            oTreeTable.setSelectedIndex(iRowIndex);
        }

        if (gBeforeSelectedIndex == iRowIndex) {
            return;
        }

        // 선택한 index 이전 히스토리 저장
        gBeforeSelectedIndex = iRowIndex;

        // var oUspData = {
        //     DATA: "",
        //     URL: "",
        //     ISEDIT: "",
        // };

        // APPCOMMON.fnSetModelProperty("/WS30/USPDATA", oUspData);

        var oCtx = oTreeTable.getContextByIndex(iRowIndex),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // 선택한 위치가 Root 또는 폴더이면 return.
        if (oData.ISROOT == "X" || oData.ISFLD == "X") {
            return;
        }

        APPCOMMON.fnSetModelProperty("/WS30/USPDATA", {
            URL: oData.SPATH,
            DATA: oData.DATA,
            ISEDIT: "X",
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

        var oTreeTable = oEvent.getSource(),
            iSelectRow = oEvent.getParameter("rowIndex"),
            oCtx = oTreeTable.getContextByIndex(iSelectRow),
            oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP");

        if (!oCtx) {
            return;
        }

        // 우클릭한 라인 인덱스 값을 글로벌에 잠시 둔다.
        gSelectedTreeIndex = iSelectRow;

        var oRowData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // mime tree 의 기본 contextmenu 정보를 구한다. 
        var aCtxMenu = fnGetUspTreeDefCtxMenuList();

        // Display 모드 일 경우 
        if (oAppInfo.IS_EDIT == "") {

            // Display 모드에서의 ContextMenu 구성
            _ev_beforeOpenContextMenuDisplay(oRowData, aCtxMenu);

            return;

        }

        // Change 모드에서의 ContextMenu 구성
        _ev_beforeOpenContextMenuChange(oRowData, aCtxMenu);

    } // end of ev_beforeOpenContextMenu

    /**************************************************************************
     * [WS30] Display 모드에서의 ContextMenu 구성
     **************************************************************************/
    function _ev_beforeOpenContextMenuDisplay(oRowData, aCtxMenu) {

        aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
        aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
        aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

        // root가 아니면서 폴더가 아닐경우 (파일일 경우에만) 다운로드 버튼을 활성화 한다.
        if (oRowData.PUJKY != "" && oRowData.ISFLD == "") {

            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = true;

        }

        APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

    } // end of _ev_beforeOpenContextMenuDisplay

    /**************************************************************************
     * [WS30] Change 모드에서의 ContextMenu 구성
     **************************************************************************/
    function _ev_beforeOpenContextMenuChange(oRowData, aCtxMenu) {

        // 우클릭한 위치가 ROOT 일 경우 생성 버튼만 활성화 한다.
        if (oRowData.PUJKY == "") {

            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

            APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

            return;

        }

        // 우클릭한 위치가 폴더일 경우
        if (oRowData.ISFLD == "X") {

            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

            APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

            return;

        }

        // 우클릭한 위치가 파일 레벨인 경우        
        aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;

        APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

    } // end of _ev_beforeOpenContextMenuChange

    /**************************************************************************
     * [WS30] USP Tree ContextMenu Click Event
     **************************************************************************/
    function ev_UspTreeCtxMenuClick(oEvent) {

        // contextmenu의 선택한 메뉴 정보를 구한다.
        var oTreeTable = oEvent.getSource().getParent(),
            oCtxMenuItm = oEvent.getParameter("item"),
            sCtxMenuKey = oCtxMenuItm.getProperty("key");

        switch (sCtxMenuKey) {

            case "K3": // create

                fnCreateUspNodePopup(oTreeTable);

                break;

            case "K4": // delete

                fnDeleteUspNode(oTreeTable);

                break;
        }

    } // end of ev_UspTreeCtxMenuClick

    /**************************************************************************
     * [WS30] USP Create Node Accept Event
     **************************************************************************/
    function ev_createUspNodeAcceptEvent(oTreeTable, oEvent) {

        var sBindRootPath = "/WS30/USPCRT";

        // USP 생성 팝업의 입력 값 구하기
        var oCrateData = APPCOMMON.fnGetModelProperty(sBindRootPath);

        oCrateData.NAME_VS = "";
        oCrateData.NAME_VSTXT = "";

        // 생성 팝업 입력값 체크
        var oResult = _fnCheckCreateNodeData(oCrateData);
        if (oResult.RETCD == "E") {

            // Value State 설정
            oCrateData.NAME_VS = sap.ui.core.ValueState.Error;
            oCrateData.NAME_VSTXT = oResult.RTMSG;

            APPCOMMON.fnSetModelProperty(sBindRootPath, oCrateData, true);

            parent.setSoundMsg("02"); // error sound

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

            return;
        }

        var oCtx = oTreeTable.getContextByIndex(gSelectedTreeIndex);
        if (!oCtx) {
            return;
        }

        var oTreeModel = oTreeTable.getModel(),
            oRowData = oTreeModel.getProperty(oCtx.sPath);

        // 같은 레벨에서의 이름 중복 확인
        var oDup = oRowData.USPTREE.find(arr => arr.OBDEC.toLowerCase() == oCrateData.NAME.toLowerCase());

        if (oDup) {

            var sMsg = APPCOMMON.fnGetMsgClsTxt("004"); // Duplicate filename exists.

            // Value State 설정
            oCrateData.NAME_VS = sap.ui.core.ValueState.Error;
            oCrateData.NAME_VSTXT = sMsg;

            APPCOMMON.fnSetModelProperty(sBindRootPath, oCrateData, true);

            parent.setSoundMsg("02"); // error sound

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", sMsg);

            return;

        }

        var sRandomKey = RANDOM.generateBase30(50),
            oCopyRowData = jQuery.extend(true, {}, oRowData);

        oCopyRowData.PUJKY = oRowData.OBJKY;
        oCopyRowData.OBJKY = sRandomKey;
        oCopyRowData.APPID = oRowData.APPID;
        oCopyRowData.ISFLD = oCrateData.ISFLD ? "X" : "";
        oCopyRowData.OBDEC = oCrateData.NAME;
        oCopyRowData.DESCT = oCrateData.DESC;
        oCopyRowData.ICONVISI = false;
        oCopyRowData.SPATH = `${oRowData.SPATH}/${oCrateData.NAME}`;

        // 폴더가 아닐 경우 파일 확장자와 MIME TYPE을 구한다.
        if (oCrateData.ISFLD == false) {

            oCopyRowData.MIME = MIMETYPES.lookup(oCrateData.NAME);
            oCopyRowData.EXTEN = APPCOMMON.fnGetFileExt(oCrateData.NAME);

        }

        oCopyRowData.USPTREE = [];

        oRowData.USPTREE.push(oCopyRowData);

        oTreeModel.setProperty(oCtx.sPath, oRowData);

        oTreeModel.refresh();

        // 현재 선택한 노드 펼침
        oTreeTable.expand(gSelectedTreeIndex);

        ev_createUspDlgCloseEvent();

    } // end of ev_createUspNodeAcceptEvent

    function _fnCheckCreateNodeData(oCrateData) {

        var oCheck = {};

        // 입력값 존재 여부 확인
        if (parent.isEmpty(oCrateData.NAME) === true || parent.isBlank(oCrateData.NAME) === true) {

            oCheck.RETCD = "E";
            oCheck.RTMSG = "Name is Required!";

            return oCheck;

        }

        // 파일 생성일 경우 파일명에 허용된 확장자인지 체크 한다.
        if (oCrateData.ISFLD == false) {

            var sCheck = MIMETYPES.lookup(oCrateData.NAME);

            if (typeof sCheck == "boolean" && sCheck == false) {

                oCheck.RETCD = "E";
                oCheck.RTMSG = "Invalid MimeType! Check the extension of the file name. ex) aaa.txt, aaa.js..";

                return oCheck;

            }

        }

        oCheck.RETCD = "S";

        return oCheck;

    } // end of _fnCheckCreateNodeData

    /**************************************************************************
     * [WS30] USP Create Dialog Close
     **************************************************************************/
    function ev_createUspDlgCloseEvent() {

        var oDialog = sap.ui.getCore().byId("uspCrNodePopup");

        if (oDialog && oDialog.isOpen()) {
            oDialog.close();
        }

    } // end of ev_createUspDlgCloseEvent

    /**************************************************************************
     * [WS30] Save Button
     **************************************************************************/
    function ev_pressSaveBtn(oEvent) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        var oAppData = APPCOMMON.fnGetModelProperty("/WS30/APP"),
            aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE");

        // 저장 구조
        var oSaveData = {
            APPID: oAppData.APPID,
            TRKORR: "",
            IS_ACT: "",
            S_CONTENT: {},
            T_TREE: []
        };

        var oContent = APPCOMMON.fnGetModelProperty("/WS30/USPDATA");
        if (oContent) {
            oSaveData.S_CONTENT = oContent;
        }

        // TREE -> Array
        var aParseTree = _parseTree2Tab(aTreeData, "USPTREE");

        oSaveData.T_TREE = aParseTree;

        var sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_save_active_appdata`;

        var oFormData = new FormData();
        oFormData.append("APPDATA", JSON.stringify(oSaveData));

        sendAjax(sPath, oFormData, _fnSaveCallback);

    } // end of ev_pressSaveBtn

    /**************************************************************************
     * [WS30] 저장 콜백
     **************************************************************************/
    function _fnSaveCallback(oResult) {

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        parent.setBusy("");

        // Critical 오류
        if (oResult.RETCD == "Z") {

            parent.setSoundMsg("02"); // error sound

            return;

        }

        if (oResult.RETCD == "E") {

            parent.setSoundMsg("02"); // error sound

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

            return;
        }

        // Footer Msg 출력
        APPCOMMON.fnShowFloatingFooterMsg("S", "WS30", oResult.RTMSG);

    } // end of _fnSaveCallback














    // Application Change 모드 변경
    function setAppChange(bIsChange) {

        if (typeof bIsChange !== "string") {
            return;
        }

        if (bIsChange != 'X' && bIsChange != '') {
            return;
        }

        // 어플리케이션 정보 가져오기
        var oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP");

        // 어플리케이션 정보에 변경 플래그 
        oAppInfo.IS_CHAG = bIsChange;

        if (bIsChange == "X") {
            oAppInfo.ACTST = "I";
        }

        APPCOMMON.fnSetModelProperty("/WS30/APP", oAppInfo);

    } // end of setAppChange


    /**************************************************************************
     * [WS30] codeeditor Change Event
     **************************************************************************/
    function ev_codeEditorChange(oEvent) {

        setAppChange("X");

    } // end of ev_codeEditorChange

})(window, $, oAPP);