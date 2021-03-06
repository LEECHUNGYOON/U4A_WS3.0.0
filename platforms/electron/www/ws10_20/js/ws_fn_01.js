/**************************************************************************
 * ws_fn_01.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common,
        REMOTE = parent.REMOTE,
        PATH = parent.PATH,
        FS = parent.FS,
        APP = parent.APP,
        USERDATA = parent.USERDATA,
        WEBFRAME = parent.WEBFRAME;

    /************************************************************************
     * 초기 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRendering = function () {

        var oApp = new sap.m.NavContainer("WSAPP", {
            autoFocus: false,
            afterNavigate: function (oEvent) {

                // // 각 페이지 이동 시 푸터 메시지가 있으면 숨김처리.
                // oAPP.common.fnHideFloatingFooterMsg();

                var fromId = oEvent.getParameter("fromId"),
                    toId = oEvent.getParameter("toId");

                // 현재 페이지의 위치를 저장한다.
                parent.setCurrPage(toId);

                if (fromId != "WS20") {
                    return;
                }

                parent.setBusy('');

                // 10번 페이지로 넘어 올때 APP NAME Input에 포커스 주기
                var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
                if (!oAppNmInput) {
                    return;
                }

                oAppNmInput.focus();

            }

        }).addStyleClass("u4aWsApp");

        // 처음 로드 할때 APP NAME Input에 포커스 주기
        oApp.addDelegate({

            onAfterRendering: function () {

                if (parent.oWS.utill.attr.ISINIT == null) {

                    // 페이지 푸터 메시지                    
                    oAPP.common.fnShowFloatingFooterMsg("S", "WS10", "Welcome to U4A Workspace!");

                    parent.oWS.utill.attr.ISINIT = 'X';

                }

                var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
                if (!oAppNmInput) {
                    return;
                }

                oAppNmInput.focus();

            }

        });

        // 10, 20번 화면에 대한 Page Instance 구하기
        var WS10 = oAPP.fn.fnOnInitRenderingWS10(),
            WS20 = oAPP.fn.fnOnInitRenderingWS20();

        oApp.addPage(WS10);
        oApp.addPage(WS20);

        oApp.placeAt("content");

        // 단축키 설정
        oAPP.common.setShortCut("WS10");

    }; // end of fnOnInitRendering  

    /************************************************************************
     * 10번 페이지 Window Menu List
     ************************************************************************/
    oAPP.fn.fnGetWindowMenuListWS10 = function () {

        var aWMENU10 = [{
                    key: "WMENU10_01",
                    text: "App. Package Change"
                },
                {
                    key: "WMENU10_02",
                    text: "App. Import/Export",
                    items: [{
                            key: "WMENU10_02_01",
                            text: "App. Importing"
                        },
                        {
                            key: "WMENU10_02_02",
                            text: "App. Exporting"
                        }
                    ]
                },
                {
                    key: "WMENU10_03",
                    text: "U4A Help Document",
                },
                {
                    key: "WMENU10_04",
                    text: "Shortcut Manager",
                    items: [{
                            key: "WMENU10_04_01",
                            text: "U4A Shortcut Create"
                        },
                        {
                            key: "WMENU10_04_02",
                            text: "QR Code Maker"
                        }
                    ]
                },
                {
                    key: "WMENU10_05",
                    text: "About U4A WS IDE",
                },
            ],

            aWMENU20 = [{
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
                text: "Options..."
            }],
            Test10 = [{
                    key: "Test90",
                    text: "Busy 강제실행"
                },
                {
                    key: "Test99",
                    text: "Busy 강제종료"
                },
                {
                    key: "Test98",
                    text: "세션 끊기"
                },
                {
                    key: "Test97",
                    text: "개발툴"
                },
            ];

        return {
            WMENU10: aWMENU10,
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            Test10: Test10
        };

    }; // end of oAPP.fn.fnGetWindowMenuListWS10

    /************************************************************************
     * 20번 페이지 Window Menu List
     ************************************************************************/
    oAPP.fn.fnGetWindowMenuListWS20 = function () {

        var aWMENU10 = [{
                key: "WMENU10_01",
                text: "Theme Designer",
                enabled: false,
            }, {
                key: "WMENU10_02",
                text: "Font Style Wizard",
                enabled: true,
            }],

            aWMENU20 = [{
                key: "WMENU20_01",
                text: "Select Browser Type",
                enabled: true,
            }],

            aWMENU30 = [{
                    key: "WMENU30_01",
                    text: "CSS Editor",
                    enabled: true,
                },
                {
                    key: "WMENU30_02",
                    text: "Javascript Editor",
                    enabled: true,
                },
                {
                    key: "WMENU30_03",
                    text: "HTML Editor",
                    enabled: true,
                },
                {
                    key: "WMENU30_04",
                    text: "Error Page Editor",
                    enabled: true,
                }
            ],

            aWMENU40 = [{
                    key: "WMENU40_01",
                    text: "New Browser",
                    enabled: true,
                },
                {
                    key: "WMENU40_02",
                    text: "Close Browser",
                    enabled: true,

                },
                {
                    key: "WMENU40_05",
                    text: "Options..",
                    enabled: true,
                },
                {
                    key: "WMENU40_03",
                    text: "User Profile",
                    enabled: true,
                },
                {
                    key: "WMENU40_04",
                    text: "Logoff",
                    enabled: true,
                },
                {
                    key: "WMENU40_06",
                    text: "Release Note..",
                    enabled: true,
                }
            ],

            aWMENU50 = [{
                key: "WMENU50_01",
                text: "Application Help",
                enabled: true,
            }, {
                key: "WMENU50_02",
                text: "Settings",
                enabled: true,
            }],

            Test20 = [{
                    key: "Test90",
                    text: "Busy 강제실행",
                },
                {
                    key: "Test99",
                    text: "Busy 강제종료",
                },
                {
                    key: "Test98",
                    text: "세션 끊기",
                },
                {
                    key: "Test97",
                    text: "개발툴",
                },
                {
                    key: "Test95",
                    text: "CTS Popup",
                },
                {
                    key: "Test91",
                    text: "Prop Help",
                },
                {
                    key: "doc01",
                    text: "Document",
                },
            ];

        return {
            WMENU10: aWMENU10,
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            WMENU40: aWMENU40,
            WMENU50: aWMENU50,
            Test20: Test20
        };

    }; // end of oAPP.fn.fnGetWindowMenuListWS20

    /**************************************************************************
     * WS10 페이지의 윈도우 메뉴 정보
     **************************************************************************/
    oAPP.fn.fnGetWindowMenuWS10 = function () {

        return [{
                key: "WMENU10",
                text: "Extras",
                icon: "",
            },
            {
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
                key: "Test10",
                text: "Test",
                icon: "",
            },
        ];

    }; // end of oAPP.main.fnGetWindowMenuWS10

    /**************************************************************************
     * WS20 페이지의 윈도우 메뉴 정보
     **************************************************************************/
    oAPP.fn.fnGetWindowMenuWS20 = function () {

        return [{
                key: "WMENU10",
                text: "Style Class",
                icon: "",
            },
            {
                key: "WMENU20",
                text: "Utilities",
                icon: "",
            },
            {
                key: "WMENU30",
                text: "Edit",
                icon: "",
            },
            {
                key: "WMENU40",
                text: "System",
                icon: "",
            },
            {
                key: "WMENU50",
                text: "Help",
                icon: "",
            },
            {
                key: "Test20",
                text: "Test",
                icon: "",
            },
        ];

    }; // end of oAPP.main.fnGetWindowMenuWS20

    /************************************************************************
     * 10번 페이지 Header Menu에 대한 Enable, Disable 
     ************************************************************************/
    oAPP.fn.fnWs10HeaderMenuEnableBinding = (sMenuKey) => {

        let isDev = APPCOMMON.fnGetModelProperty("/USERINFO/USER_AUTH/IS_DEV");
        if (isDev == "D") {
            return true;
        }

        switch (sMenuKey) {
            case "WMENU10_01":
            case "WMENU10_02_01":
                return false;

            default:
                return true;

        }

    }; // end of oAPP.fn.fnWs10HeaderMenuEnableBinding

    /************************************************************************
     * 10번 페이지 Header Toolbar Contents
     ************************************************************************/
    oAPP.fn.fnGetHeaderToolbarContentWs10 = function () {

        var sBindRoot = "/WMENU/WS10";

        //10번 페이지 윈도우 메뉴 정보
        var aWMenu10 = oAPP.fn.fnGetWindowMenuWS10(),
            oMenuList = oAPP.fn.fnGetWindowMenuListWS10();

        oMenuList.HEADER = aWMenu10;

        APPCOMMON.fnSetModelProperty(sBindRoot, oMenuList);

        var oMenuUI = {};

        // WS10 페이지의 윈도우 메뉴 구성
        oMenuUI.WMENU10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU10",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}"
                        }).bindProperty("enabled", "key", oAPP.fn.fnWs10HeaderMenuEnableBinding)
                    }
                }).bindProperty("enabled", "key", oAPP.fn.fnWs10HeaderMenuEnableBinding)
            }
        }).addStyleClass("u4aWsWindowMenu");

        oMenuUI.WMENU20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU20",
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
                path: sBindRoot + "/WMENU30",
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

        oMenuUI.Test10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/Test10",
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
                oMenuUI.WMENU10,
                oMenuUI.WMENU20,
                oMenuUI.WMENU30,
                oMenuUI.Test10
            ]
        });

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            WMENU: APPCOMMON.fnGetModelProperty("/WMENU")
        });

        oHH.setModel(oJsonModel);

        oAPP.wmenu.WS10 = oMenuUI;

        return [

            new sap.m.HBox({
                items: {
                    path: sBindRoot + "/HEADER",
                    template: new sap.m.Button({
                        text: "{text}",
                        press: oAPP.events.ev_pressWMenu10
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

            // Browser Pin Button
            new sap.m.OverflowToolbarToggleButton({
                icon: "sap-icon://pushpin-off",
                pressed: "{/SETTING/ISPIN}",
                tooltip: "Browser Pin",
                press: oAPP.events.ev_windowPinBtn
            }),

            // zoom 기능
            new sap.m.Button({
                icon: "sap-icon://zoom-in",
                press: oAPP.events.ev_pressZoomBtn,
                tooltip: "zoom",
            }),
           
            // 검색 버튼
            new sap.m.Button({
                icon: "sap-icon://search",
                tooltip: "window Text Search",
                press: oAPP.events.ev_winTxtSrchWS10
            }),

            // Logoff 버튼
            new sap.m.Button({
                icon: "sap-icon://log",
                press: oAPP.events.ev_Logout
            })
        ];

    }; // end of oAPP.fn.fnGetHeaderToolbarContentWs10

    /************************************************************************
     * 10번 페이지 Sub Header Toolbar Contents
     ************************************************************************/
    oAPP.fn.fnGetSubHeaderToolbarContentWs10 = function () {

        var lo_bindPropForVisible = {
            parts: [{
                path: "/USERINFO/USER_AUTH/IS_DEV"
            }],
            formatter: function (isDev) {

                if (isDev != "D") {
                    return false;
                }

                return true;

            }
        };

        /**
         * Transaction Buttons
         */
        var oAppCreateBtn = new sap.m.Button("appCreateBtn", {
                text: "Create",
                icon: "sap-icon://document",
                tooltip: "Create (Ctrl+F12)",
                press: oAPP.events.ev_AppCreate
            })
            .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
            .addStyleClass("u4aWs10AppCreateBtn"),

            oAppChangeBtn = new sap.m.Button("appChangeBtn", {
                text: "Change",
                icon: "sap-icon://edit",
                tooltip: "Change (Ctrl+Shift+F1)",
                press: oAPP.events.ev_AppChange
            })
            .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
            .addStyleClass("u4aWs10AppChangeBtn"),

            oAppDelBtn = new sap.m.Button("appDelBtn", {
                text: "Delete",
                icon: "sap-icon://delete",
                tooltip: "Delete (Ctrl+F10)",
                press: oAPP.events.ev_AppDelete
            })
            .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
            .addStyleClass("u4aWs10AppDelBtn"),

            oAppCopyBtn = new sap.m.Button("appCopyBtn", {
                text: "Copy",
                icon: "sap-icon://copy",
                tooltip: "Copy (Shift+F11)",
                press: oAPP.events.ev_AppCopy
            })
            .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
            .addStyleClass("u4aWs10AppCopyBtn"),

            oDisplayBtn = new sap.m.Button("displayBtn", {
                text: "Display",
                icon: "sap-icon://display",
                tooltip: "Display (F7)",
                press: oAPP.events.ev_AppDisplay
            }).addStyleClass("u4aWs10DisplayBtn"),

            oAppExecBtn = new sap.m.Button("appExecBtn", {
                text: "Application Execution",
                icon: "sap-icon://internet-browser",
                tooltip: "Application Execution (F8)",
                press: oAPP.events.ev_AppExec
            }).addStyleClass("u4aWs10AppExecBtn"),

            oExamBtn = new sap.m.Button("examBtn", {
                text: "Example Open",
                icon: "sap-icon://learning-assistant",
                tooltip: "Example Open (Ctrl+F1)",
                press: oAPP.events.ev_AppExam
            }).addStyleClass("u4aWs10ExamBtn"),

            oMultiPrevBtn = new sap.m.Button("multiPrevBtn", {
                text: "App Multi Preview",
                icon: "sap-icon://desktop-mobile",
                tooltip: "App Multi Preview (Ctrl+F3)",
                press: oAPP.events.ev_MultiPrev
            }).addStyleClass("u4aWs10MultiPrevBtn");

        return [

            oAppCreateBtn, // Create Button
            oAppChangeBtn, // Change Button
            oAppDelBtn, // Delete Button
            oAppCopyBtn, // Copy Button

            new sap.m.ToolbarSeparator().bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible)),

            oDisplayBtn, // Display Button Button
            oAppExecBtn, // Execution Button

            new sap.m.ToolbarSeparator(),

            oExamBtn, // Example Open Button
            oMultiPrevBtn, // Multi Preview Button

        ];

    }; // end of oAPP.fn.fnGetSubHeaderToolbarContentWs10 

    /************************************************************************
     * 10번 페이지 Contents
     ************************************************************************/
    oAPP.fn.fnGetPageContentWs10 = function () {

        var oAppNmInput = new sap.m.SearchField("AppNmInput", {
                value: "{/WS10/APPID}",
                change: oAPP.events.ev_AppInputChange,
                search: oAPP.events.ev_AppValueHelp,
                suggest: function (oEvent) {

                    var sValue = oEvent.getParameter("suggestValue"),
                        aFilters = [];

                    if (sValue) {

                        aFilters = [
                            new sap.ui.model.Filter([
                                new sap.ui.model.Filter("APPID", function (sText) {
                                    return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                                }),
                            ], false)
                        ];

                    }

                    this.getBinding("suggestionItems").filter(aFilters);
                    this.suggest();

                },
                enableSuggestions: true,
                suggestionItems: {
                    path: "/WS10/APPSUGG",
                    sorter: "{ path : '/WS10/APPSUGG/APPID' }",
                    template: new sap.m.SuggestionItem({
                        key: "{APPID}",
                        text: "{APPID}",
                    })
                }
            }),

            oForm = new sap.ui.layout.form.Form({
                editable: true,
                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    columnsXL: 4,
                    columnsL: 2,
                    columnsM: 1,
                    labelSpanXL: 6,
                    labelSpanL: 3,
                    labelSpanM: 3,
                    labelSpanS: 12,
                    singleContainerFullSize: false

                }),
                formContainers: [
                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: "Bold",
                                    text: "Application Name"
                                }),
                                fields: oAppNmInput
                            }),
                        ]
                    }),
                ]
            });

        // 10번 페이지 Application Name SearchField의 Key down Event
        oAppNmInput.attachBrowserEvent("keydown", oAPP.fn.fnWs10AppInputKeyDownEvent);

        return [
            oForm
        ];

    }; // end of oAPP.fn.fnGetPageContentWs10    

    /************************************************************************
     * 10번 페이지 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS10 = function () {

        var sFmsgBindRootPath = "/FMSG/WS10";

        var aHeaderToolbarContents = oAPP.fn.fnGetHeaderToolbarContentWs10(),
            aSubHeaderToolbarContents = oAPP.fn.fnGetSubHeaderToolbarContentWs10(),
            aPageContent = oAPP.fn.fnGetPageContentWs10();

        var oHeaderToolbar = new sap.m.OverflowToolbar({
                content: aHeaderToolbarContents
            }).addStyleClass("sapTntToolHeader u4aWsWindowMenuToolbar"),

            oSubHeaderToolbar = new sap.m.OverflowToolbar({
                content: aSubHeaderToolbarContents,
            }).addStyleClass("u4aWs10_HeaderToolbar sapTntToolHeader"),

            oMsgFooter = new sap.m.OverflowToolbar({
                content: [
                    new sap.ui.core.Icon({
                        color: "{" + sFmsgBindRootPath + "/ICONCOLOR}",
                        src: "{" + sFmsgBindRootPath + "/ICON}"
                    }),
                    new sap.m.Text({
                        text: "{" + sFmsgBindRootPath + "/TXT}"
                    }),
                    // new sap.m.ToolbarSpacer(),
                    // new sap.m.Button({
                    //     icon: "sap-icon://decline",
                    //     // type : "Critical", 
                    //     press: oAPP.common.fnHideFloatingFooterMsg
                    // }),
                ]
            });

        var oWs10Page = new sap.m.Page("WS10", {
            titleAlignment: "Center",
            subHeader: oSubHeaderToolbar,
            customHeader: oHeaderToolbar,
            content: aPageContent,
            floatingFooter: true,
            footer: oMsgFooter,
        }).bindProperty("showFooter", {
            parts: [
                sFmsgBindRootPath + "/ISSHOW"
            ],
            formatter: function (isshow) {

                if (isshow == null) {
                    return false;
                }

                if (typeof isshow !== "boolean") {
                    return false;
                }

                return isshow;
            }
        }).addStyleClass("u4aWs10Page");

        // var oHeaderMenuToolbar = new sap.m.OverflowToolbar({
        //     content: [
        //         new sap.m.Button({
        //             text: "test"
        //         })
        //     ]
        // }).addStyleClass("sapTntToolHeader");

        // var oVbox = new sap.m.VBox({
        //     renderType: "Bare",
        //     height: "100%",
        //     items: [
        //         oHeaderMenuToolbar,
        //         oWs10Page
        //     ]
        // });
        return oWs10Page;

        // return new sap.m.Page("WS10", {
        //     showHeader: false,
        //     enableScrolling: false,
        //     content: [
        //         oVbox
        //     ]
        // });

    }; // end of fnOnInitRenderingWS10

    /************************************************************************
     * 10번 페이지 Application Name SearchField의 Key down Event
     * F4 펑션 키를 눌렀을 때 F4 Help를 띄우기 목적인 이벤트
     ************************************************************************/
    oAPP.fn.fnWs10AppInputKeyDownEvent = function (event) {

        var iKeyCode = event.keyCode;

        var oAppInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppInput) {
            return;
        }

        // Application Name에 입력한 값을 구한다.
        var sAppValue = oAppInput.getValue();

        // Enter, F5키를 누르면 이벤트 전파 방지시킨다. (SearchField의 search 이벤트 발생하지 않기 위함)
        // 그러나, Enter키를 누르면 Input의 Change 이벤트를 발생시킨다.
        if (iKeyCode == 13 || iKeyCode == 116) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            if (iKeyCode == 13) {
                oAppInput.fireChange({
                    value: sAppValue
                });
            }

            return;

        }

        // F4 키가 아니면 빠져나간다.
        if (iKeyCode != 115) {
            return;
        }

        var sId = event.currentTarget.id,
            oSearchField = sap.ui.getCore().byId(sId);

        if (!oSearchField) {
            return;
        }

        // F4 Help를 띄운다
        oSearchField.fireChange({
            value: sAppValue
        });
        oSearchField.fireSearch();

    }; // end of oAPP.fn.fnWs10AppInputKeyDownEvent

    /************************************************************************
     * 20번 페이지 Header Toolbar Content
     ************************************************************************/
    oAPP.fn.fnGetHeaderToolbarContentWs20 = function () {

        var sBindRoot = "/WMENU/WS20";

        var oBackBtn = new sap.m.Button("backBtn", {
                icon: "sap-icon://nav-back",
                press: oAPP.events.ev_pageBack
            }),

            oAppIdTxt = new sap.m.Title({
                text: "{/WS20/APP/APPID}"
            }), // APPID

            oAppModeTxt = new sap.m.Title("appModeTxt", {
                text: "{/WS20/APP/MODETXT}"
            }), // Change or Display Text	

            oAppActTxt = new sap.m.Title("appActTxt", {
                text: "{/WS20/APP/ISACTTXT}"
            }), // Activate or inactivate Text

            oFindBtn = new sap.m.Button("ws20_findBtn", {
                icon: "sap-icon://sys-find",
                press: oAPP.events.ev_pressFindBtn,
                tooltip: "Find (Ctrl+F)"
            }).addStyleClass("u4aWs20FindBtn"),

            oNewWin = new sap.m.Button("ws20_newWinBtn", {
                icon: "sap-icon://create",
                tooltip: "New Browser (Ctrl+N)",
                press: function () {
                    parent.onNewWindow();
                }
            }).addStyleClass("u4aWs20NewWin");

        return [

            oBackBtn, // Back Button

            oAppIdTxt, // APPID

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            oAppModeTxt, // Change or Display Text

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            oAppActTxt, // Activate or inactivate Text		

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            // new sap.m.ToolbarSeparator(),

            oFindBtn, // Find Button

            oNewWin, // new window Button            

        ];

    }; // end of oAPP.fn.fnGetHeaderToolbarContentWs20

    /************************************************************************
     * 20번 페이지 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS20 = function () {

        var sFmsgBindRootPath = "/FMSG/WS20";

        /*****************************************************************************
         * 20번 상단 헤더 -- START
         *****************************************************************************/

        var aHeaderToolbarContents = oAPP.fn.fnGetHeaderToolbarContentWs20(),

            oToolHeader = new sap.tnt.ToolHeader({
                content: aHeaderToolbarContents
            }),

            /*****************************************************************************
             * 20번 상단 헤더 -- END
             *****************************************************************************/
            oSideNav = new sap.tnt.SideNavigation({

                // Properties
                expanded: true,
                
                // Aggregations
                item: new sap.tnt.NavigationList({
                    selectedKey: "{/WS20/SIDEMENU/SELKEY}",
                    expanded: true,
                    items: {
                        path: "/WS20/SIDEMENU/ITEMS",
                        template: new sap.tnt.NavigationListItem({
                            key: "{key}",
                            icon: "{icon}",
                            text: "{text}",
                            visible: "{visible}"
                        })
                    }
                }), // end of item

                fixedItem: new sap.tnt.NavigationList({
                    expanded: true,
                    items: {
                        path: "/WS20/SIDEMENU/FIXITM",
                        template: new sap.tnt.NavigationListItem({
                            key: "{key}",
                            icon: "{icon}",
                            text: "{text}",
                            visible: "{visible}"
                        })

                    }
                }), // end of fixedItem

                // Events
                itemSelect: oAPP.events.ev_pressSideNavMenu,

            }),

            // 이거를 차장님께 전달할 Page 임.
            oMainPage = oAPP.fn.fnOnInitRenderingWS20Main(),

            oToolPage = new sap.tnt.ToolPage({
                sideExpanded: false,
                header: oToolHeader,
                sideContent: oSideNav,
                mainContents: oMainPage
            }),

            oMsgFooter = new sap.m.OverflowToolbar({
                content: [
                    new sap.ui.core.Icon({
                        color: "{" + sFmsgBindRootPath + "/ICONCOLOR}",
                        src: "{" + sFmsgBindRootPath + "/ICON}"
                    }),
                    new sap.m.Text({
                        text: "{" + sFmsgBindRootPath + "/TXT}"
                    }),
                    // new sap.m.ToolbarSpacer(),
                    // new sap.m.Button({
                    //     icon: "sap-icon://decline",
                    //     // type : "Critical", 
                    //     press: oAPP.common.fnHideFloatingFooterMsg
                    // }),
                ]
            });

        // 20번 페이지 윈도우 메뉴 정보
        var sHMenuBindRoot = "/WMENU/WS20",
            aWMenu20 = oAPP.fn.fnGetWindowMenuWS20(),
            oMenuList = oAPP.fn.fnGetWindowMenuListWS20();

        oMenuList.HEADER = aWMenu20;

        APPCOMMON.fnSetModelProperty(sHMenuBindRoot, oMenuList);

        var oMenuUI = {};

        // WS20 페이지의 윈도우 메뉴 구성

        // Style Class
        oMenuUI.WMENU10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU10",
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

        // Utilities
        oMenuUI.WMENU20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU20",
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

        // Edit
        oMenuUI.WMENU30 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU30",
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

        // System
        oMenuUI.WMENU40 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU40",
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

        // Help
        oMenuUI.WMENU50 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU50",
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

        // Test
        oMenuUI.Test20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/Test20",
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

        var oHH = new sap.m.HBox({
            items: [
                oMenuUI.WMENU10,
                oMenuUI.WMENU20,
                oMenuUI.WMENU30,
                oMenuUI.WMENU40,
                oMenuUI.WMENU50,
                oMenuUI.Test20
            ]
        });

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            WMENU: APPCOMMON.fnGetModelProperty("/WMENU")
        });

        oHH.setModel(oJsonModel);

        oAPP.wmenu.WS20 = oMenuUI;

        return new sap.m.Page("WS20", {
            showHeader: true,
            enableScrolling: false,
            customHeader: new sap.m.OverflowToolbar({
                content: [
                    new sap.m.HBox({
                        items: {
                            path: sHMenuBindRoot + "/HEADER",
                            template: new sap.m.Button({
                                text: "{text}",
                                press: oAPP.events.ev_pressWMenu20
                            }).bindProperty("visible", {
                                parts: [
                                    "key"
                                ],
                                formatter: function (sKey) {

                                    if (sKey == null) {
                                        return false;
                                    }

                                    if (sKey != "Test20") {
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

                    // Browser Pin Button
                    new sap.m.OverflowToolbarToggleButton({
                        icon: "sap-icon://pushpin-off",
                        pressed: "{/SETTING/ISPIN}",
                        press: oAPP.events.ev_windowPinBtn
                    }),

                    // zoom 기능
                    new sap.m.Button({
                        icon: "sap-icon://zoom-in",
                        press: oAPP.events.ev_pressZoomBtn,
                        tooltip: "zoom",
                    }),

                    /*****************************************************************************
                     * 20번 상단 Text Search -- START
                     *****************************************************************************/
                    // // search Input
                    // new sap.m.Input("txtSrchInputWS20", {
                    //     width: "50px",
                    //     value: "{/WS20/SRCHTXT/INPUT_VALUE}",
                    //     visible: "{/WS20/SRCHTXT/INPUT_VISI}",
                    //     placeholder: "Text Search..",
                    //     liveChange: oAPP.events.ev_winTxtSrchLibChgWS20
                    // })
                    // .addStyleClass("sapUiSizeCompact u4aWsWinTxtSrchInput")
                    // .addDelegate({
                    //     onAfterRendering: function (oEvent) {

                    //         var oInput = oEvent.srcControl;
                    //         if (oInput == null) {
                    //             return;
                    //         }

                    //         oInput.$().animate({
                    //             minWidth: "200px"
                    //         }, 300, "linear");

                    //     }

                    // }),

                    // // 검색 결과 텍스트
                    // new sap.m.Text({
                    //     text: "{/WS20/SRCHTXT/COUNT}",
                    // }).addStyleClass("sapUiTinyMarginBegin"),

                    // new sap.m.ToolbarSeparator({
                    //     visible: "{/WS20/SRCHTXT/INPUT_VISI}"
                    // }),

                    // // up 버튼
                    // new sap.m.Button({
                    //     icon: "sap-icon://navigation-up-arrow",
                    //     visible: "{/WS20/SRCHTXT/INPUT_VISI}",
                    // }),

                    // // down 버튼
                    // new sap.m.Button({
                    //     icon: "sap-icon://navigation-down-arrow",
                    //     visible: "{/WS20/SRCHTXT/INPUT_VISI}",
                    // }),

                    // // search 닫기
                    // new sap.m.Button({
                    //     icon: "sap-icon://decline",
                    //     visible: "{/WS20/SRCHTXT/INPUT_VISI}",
                    //     press: oAPP.events.ev_winTxtSrchClsWS20
                    // }),

                    // 검색 버튼
                    new sap.m.Button({
                        icon: "sap-icon://search",
                        tooltip: "window Text Search",
                        press: oAPP.events.ev_winTxtSrchWS20
                    }),
                    // .bindProperty("visible", "/WS20/SRCHTXT/INPUT_VISI", function (bIsVisi) {

                    //     if (bIsVisi == null) {
                    //         return false;
                    //     }

                    //     return !bIsVisi;

                    // }),

                    /*****************************************************************************
                     * 20번 상단 Text Search -- END
                     *****************************************************************************/

                    new sap.m.Button({
                        icon: "sap-icon://log",
                        press: oAPP.events.ev_Logout
                    }),

                ] // end of custom header content

            }).addStyleClass("sapTntToolHeader u4aWsWindowMenuToolbar"),

            content: [
                oToolPage
            ], // end of page content

            floatingFooter: true,
            footer: oMsgFooter,

        }).bindProperty("showFooter", {
            parts: [
                sFmsgBindRootPath + "/ISSHOW"
            ],
            formatter: function (isshow) {

                if (isshow == null) {
                    return false;
                }

                if (typeof isshow !== "boolean") {
                    return false;
                }

                return isshow;
            }
        }).addStyleClass("u4aWs20Page");

    }; // end of oAPP.fn.fnOnInitRenderingWS20

    /************************************************************************
     * 20번 페이지 Sub Header Toolbar
     ************************************************************************/
    oAPP.fn.fnGetSubHeaderToolbarContentWs20 = function () {

        // visible 바인딩 프로퍼티 설정
        function lf_bindPropForVisible(bIsDispMode) {

            if (bIsDispMode == null) {
                return false;
            }

            var sId = this.getId(),
                bIsDisp = (bIsDispMode == "X" ? true : false);

            switch (sId) {
                case "changeModeBtn":
                    return !bIsDisp;

                default:
                    return bIsDisp;
            }

        } // end of lf_bindPropForVisible

        var sVisiBindPath = "/WS20/APP/IS_EDIT";

        var oSyntaxCheckBtn = new sap.m.Button("syntaxCheckBtn", {
                icon: "sap-icon://validate",
                tooltip: "Syntax Check (Ctrl+F2)",
                press: oAPP.events.ev_pressSyntaxCheckBtn
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible)
            .addStyleClass("u4aWs20SyntaxCheckBtn"),

            oDisplayModeBtn = new sap.m.Button("displayModeBtn", {
                icon: "sap-icon://display",
                tooltip: "Display <--> Change (Ctrl+F1)",
                press: oAPP.events.ev_pressDisplayModeBtn
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible)
            .addStyleClass("u4aWs20DisplayModeBtn"),

            oChangeModeBtn = new sap.m.Button("changeModeBtn", {
                icon: "sap-icon://edit",
                tooltip: "Display <--> Change (Ctrl+F1)",
                press: oAPP.events.ev_pressDisplayModeBtn
            }).bindProperty("visible", {
                parts: [{
                        path: "/USERINFO/USER_AUTH/IS_DEV"
                    },
                    {
                        path: "/IS_EXAM"
                    }, {
                        path: sVisiBindPath
                    }
                ],
                formatter: (IS_DEV, IS_EXAM, IS_EDIT) => {

                    // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                    if (IS_DEV != "D") {
                        return false;
                    }

                    // 샘플 어플리케이션일 경우 비활성화
                    if (IS_EXAM == "X") {
                        return false;
                    }

                    let bIsDisp = (IS_EDIT == "X" ? true : false);
                    return !bIsDisp;

                }
            }).addStyleClass("u4aWs20ChangeModeBtn"),

            oActivateBtn = new sap.m.Button("activateBtn", {
                icon: "sap-icon://activate",
                tooltip: "Activate (Ctrl+F3)",
                press: oAPP.events.ev_pressActivateBtn,
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible)
            .addStyleClass("u4aWs20ActivateBtn"),

            oSaveBtn = new sap.m.Button("saveBtn", {
                icon: "sap-icon://save",
                tooltip: "Save (Ctrl+S)",
                press: oAPP.events.ev_pressSaveBtn,
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
            })
            .addStyleClass("u4aWs20SaveBtn"),

            oMimeBtn = new sap.m.Button("mimeBtn", {
                icon: "sap-icon://picture",
                text: "MIME Repository",
                tooltip: "MIME Repository (Ctrl+Shift+F12)",
                press: oAPP.events.ev_pressMimeBtn
            }).addStyleClass("u4aWs20MimeBtn"),

            oControllerBtn = new sap.m.Button("controllerBtn", {
                icon: "sap-icon://developer-settings",
                text: "Controller (Class Builder)",
                tooltip: "Controller (Ctrl+F12)",
                press: oAPP.events.ev_pressControllerBtn
            }).addStyleClass("u4aWs20ControllerBtn"),

            oAppExecBtn = new sap.m.Button("ws20_appExecBtn", {
                icon: "sap-icon://internet-browser",
                text: "Application Execution",
                tooltip: "Application Execution (F8)",
                press: oAPP.events.ev_pressAppExecBtn
            }).addStyleClass("u4aWs20AppExecBtn"),

            oMobileBtn = new sap.m.Button("ws20_multiPrevBtn", {
                icon: "sap-icon://desktop-mobile",
                text: "App Multi Preview",
                tooltip: "App Multi Preview (Ctrl+F5)",
                press: oAPP.events.ev_pressMultiPrevBtn
            }).addStyleClass("u4aWs20MultiPrevBtn"),

            oIconListBtn = new sap.m.Button("iconListBtn", {
                icon: "sap-icon://activity-items",
                text: "Icon List",
                tooltip: "Icon List (Ctrl+Shift+F10)",
                press: oAPP.events.ev_pressIconListBtn
            }).addStyleClass("u4aWs20IconListBtn"),

            oAddEventBtn = new sap.m.Button("addEventBtn", {
                icon: "sap-icon://touch",
                text: "Add Event Method",
                tooltip: "Add Event Method (Shift+F1)",
                press: oAPP.events.ev_pressAddEventBtn
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible)
            .addStyleClass("u4aWs20AddEventBtn"),

            oRuntimeBtn = new sap.m.Button("runtimeBtn", {
                icon: "sap-icon://functional-location",
                text: "Run-Time Class Navigator",
                tooltip: "Run-Time Class Navigator (F9)",
                press: oAPP.events.ev_pressRuntimeBtn
            }).addStyleClass("u4aWs20RuntimeBtn"),

            oBindPopupBtn = new sap.m.Button("bindPopupBtn", {
                text: "Binding Popup",
                icon: "sap-icon://connected",
                press: oAPP.events.ev_pressBindPopupBtn,

            }).addStyleClass("u4aWs20bindPopupBtn");

        return [

            oDisplayModeBtn, // Display Button
            oChangeModeBtn, // Change Button

            new sap.m.ToolbarSeparator()
            .bindProperty("visible", {
                parts: [{
                        path: "/USERINFO/USER_AUTH/IS_DEV"
                    },
                    {
                        path: "/IS_EXAM"
                    }
                ],
                formatter: (IS_DEV, IS_EXAM) => {

                    // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                    if (IS_DEV != "D") {
                        return false;
                    }

                    // 샘플 어플리케이션일 경우 비활성화
                    if (IS_EXAM == "X") {
                        return false;
                    }

                    return true;

                }
            }),
            // .bindProperty("visible", "/USERINFO/USER_AUTH/IS_DEV", (IS_DEV) => {

            //     if (IS_DEV == "D") {
            //         return true;
            //     }

            //     return false;

            // }),

            oSyntaxCheckBtn, // syntax Check Button
            oActivateBtn, // Activate Button                    

            oSaveBtn, // Save Button
            oMimeBtn, // MIME Button
            oControllerBtn, // Controller Button
            oAppExecBtn, // Application Execution Button
            oMobileBtn, // App Multi Preview Button
            oIconListBtn, // Icon List Button
            oAddEventBtn, // Add Server Event Button
            oRuntimeBtn, // Runtime Class Navigator Button
            oBindPopupBtn, // Binding Popup Button

        ];

    }; // end of oAPP.fn.fnGetSubHeaderToolbarContentWs20

    /************************************************************************
     * 20번 페이지 Tnt Tool page 의 main contents 영역 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS20Main = function () {

        /**
         * Transaction Buttons
         */
        var aSubHeaderToolbarContents = oAPP.fn.fnGetSubHeaderToolbarContentWs20();

        var oToolHeader = new sap.m.OverflowToolbar({
            content: aSubHeaderToolbarContents
        }).addStyleClass("u4aWs20_HeaderToolbar sapTntToolHeader");

        return new sap.m.Page("WS20_MAIN", {
            customHeader: oToolHeader,
            content: [
                // oSplitter
            ],
        }).addStyleClass("u4aWs20MainPage");

    }; // end of oAPP.fn.fnOnInitRenderingWS20Main

    /************************************************************************
     * Personalization Settings..(개인화 설정)
     ************************************************************************/
    oAPP.fn.fnOnInitP13nSettings = function () {

        // 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
        oAPP.fn.fnOnP13nFolderCreate();

        // 브라우저 zoom 정보 생성
        oAPP.fn.fnOnP13nBrowserZoom();

        // Default Browser 개인화 설정
        oAPP.fn.fnOnP13nExeDefaultBrowser();

        // WS10 페이지 APP Name Input의 Suggestion 기능 설정
        oAPP.fn.fnGetP13nWs10AppSuggetion();

    }; // end of oAPP.fn.fnOnInitP13nSettings

    /************************************************************************
     * 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
     ************************************************************************/
    oAPP.fn.fnOnP13nFolderCreate = function () {

        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보		
        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        var sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로
            sP13nPath = parent.getPath("P13N"), // P13N.json 파일 경로
            bIsExists = FS.existsSync(sP13nPath); // P13N.json 파일 유무 확인.        

        // 파일이 있을 경우
        if (bIsExists) {

            // 파일이 있을 경우.. 파일 내용을 읽어본다.	
            var sSavedData = FS.readFileSync(sP13nPath, 'utf-8'),
                oSavedData = JSON.parse(sSavedData);

            if (oSavedData == "") {
                oSavedData = {};
            }

            // 파일 내용에 SYSTEM 아이디의 정보가 있으면 리턴.
            if (oSavedData[sSysID]) {
                return;
            }

            // 없으면 개인화 영역 Object 생성 후 Json 파일에 저장
            oSavedData[sSysID] = {};

            FS.writeFileSync(sP13nPath, JSON.stringify(oSavedData));

            return;
        }

        // 로그인 사용자의 개인화 정보가 없을 경우 
        var oP13N_data = {};
        oP13N_data[sSysID] = {};

        // P13N 폴더가 없으면 폴더부터 생성 		
        if (!FS.existsSync(sP13nfolderPath)) {
            FS.mkdirSync(sP13nfolderPath);
        }

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(oP13N_data));

    }; // end of oAPP.fn.fnOnP13nFolderCreate

    /************************************************************************
     * 브라우저 zoom 정보 생성
     ************************************************************************/
    oAPP.fn.fnOnP13nBrowserZoom = function () {

        var sZoomFileName = PATH.join(USERDATA, "p13n", "zoom.json"), // zoom 파일 경로
            oZoomData = parent.require(sZoomFileName);

        if (oZoomData == "") {
            oAPP.fn.setPersonWinZoom("S");
            return;
        }

        // zoom.json에 저장된 zoom 정보를 현재 브라우저에 설정한다.
        oAPP.fn.setPersonWinZoom("R");

    }; // end of oAPP.fn.fnOnP13nBrowserZoom

    /************************************************************************
     * 브라우저 zoom 정보 읽기 or 저장
     ************************************************************************/
    oAPP.fn.setPersonWinZoom = (act) => {

        var sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로
            sZoomFileName = "zoom.json",
            sPath = PATH.join(sP13nfolderPath, sZoomFileName);

        switch (act) {
            case "R": // 저장된 zoom 정보 읽기

                // var sData = parent.require(sPath);
                var sData = FS.readFileSync(sPath, 'utf-8');
                sData = JSON.parse(sData);

                if (typeof sData === "undefined") {
                    return;
                }

                WEBFRAME.setZoomLevel(sData.zoom);

                break;

            case "S": // zoom 정보 저장

                var sData = {
                    zoom: WEBFRAME.getZoomLevel()
                };

                FS.writeFileSync(sPath, JSON.stringify(sData), 'utf-8');

                break;

        }

    }; // end of oAPP.fn.setPersonWinZoom

    /************************************************************************
     * 사용자 개인화(윈도우 ZOOM) 설정팝업 
     ************************************************************************/
    oAPP.fn.setWinZoomPopup = (PUI) => {

        if (typeof oAPP.fn.setWinZoomPopup.oPOP !== "undefined") {
            oAPP.fn.setWinZoomPopup.oPOP.openBy(PUI);
            return;
        };

        var oSilder = new sap.m.Slider({
            min: -5,
            max: 5,
            step: 0.1,
            change: (e) => {

                if (typeof e.oSource !== "object") {
                    return;
                }

                WEBFRAME.setZoomLevel(e.oSource.getValue());

            }
        });

        oAPP.fn.setWinZoomPopup.oPOP = new sap.m.Popover({
            showHeader: false,
            placement: "Auto",
            contentWidth: "200px",
            afterOpen: (e) => {

                var oSlider = e.oSource.mAggregations.content[0];

                oSilder.setValue(WEBFRAME.getZoomLevel());

                e.oSource.focus();

            },
            beforeClose: (e) => {

                // zoom 정보를 저장한다.
                oAPP.fn.setPersonWinZoom("S");

            }
        });

        oAPP.fn.setWinZoomPopup.oPOP.addContent(oSilder);
        oAPP.fn.setWinZoomPopup.oPOP.openBy(PUI);

    }; // end of oAPP.fn.setWinZoomPopup

    /************************************************************************
     * 사용자 개인화(윈도우 ZOOM) 설정팝업 
     ************************************************************************/
    oAPP.fn.setBrowserZoomZero = function () {

        WEBFRAME.setZoomLevel(0);

    }; // end of oAPP.fn.setBrowserZoomZero

    /************************************************************************
     * 개인화 정보를 읽어서 WS10 페이지의 APP Name Input에 Suggestion 설정하기
     ************************************************************************/
    oAPP.fn.fnGetP13nWs10AppSuggetion = function () {
        
        var FS = parent.FS;

        // 서버 접속 정보
        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보
        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        // 개인화 정보 중, APPID의 Suggestion 정보가 있는지 확인한다.	
        if (!oP13nData[sSysID].APPSUGG) {
            return;
        }

        oAPP.common.fnSetModelProperty("/WS10/APPSUGG", oP13nData[sSysID].APPSUGG);

    }; // end of oAPP.fn.fnGetP13nWs10AppSuggetion

    /************************************************************************
     * 입력한 APPID를 개인화 데이터로 저장
     ************************************************************************/
    oAPP.fn.fnSetP13nWs10AppSuggetion = function (APPID) {

        var FS = parent.FS;

        // 서버 접속 정보
        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보
        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData),

            aAppSugg = oP13nData[sSysID].APPSUGG;

        // 개인화 정보 중, Default Browser 정보가 있는지 확인한다.	
        if (!aAppSugg) {

            aAppSugg = [{
                key: APPID,
                text: APPID
            }];

        } else {

            aAppSugg.push({
                key: APPID,
                text: APPID
            });

        }

        // 실행 브라우저 정보를 모델에 set 하기..
        oAPP.common.fnSetModelProperty("/APPSUGG", aAppSugg);

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(aAppSugg));

    }; // end of oAPP.fn.fnSetP13nWs10AppSuggetion    

    /************************************************************************
     * Default Browser 개인화 설정
     ************************************************************************/
    oAPP.fn.fnOnP13nExeDefaultBrowser = function () {
        
        var FS = parent.FS;

        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // // 로그인 유저 정보
        // var oUserInfo = parent.getUserInfo(),
        //     sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData),

            // 현재 Local PC에 설치된 Browser 정보 (!! 항상 기준이 되는 데이터 !!)
            aCurrBrowsInfos = oAPP.fn.fnGetExecBrowserInfo();

        // 개인화 정보 중, Default Browser 정보가 있는지 확인한다.	
        if (!oP13nData[sSysID].DEFBR) {

            // 없으면 생성
            oP13nData[sSysID].DEFBR = aCurrBrowsInfos;

        } else {

            // 있으면 이전 저장된 Default Browser 정보와 현재 PC에 설치된 Browser 정보를 비교한 후
            // Default Browser 정보를 갱신한다.
            var aNewInfo = oAPP.fn.fnCompareBeforeBrowserInfo(oP13nData[sSysID].DEFBR, aCurrBrowsInfos);

            oP13nData[sSysID].DEFBR = aNewInfo;

        }

        // 실행 브라우저 정보를 모델에 set 하기..
        oAPP.common.fnSetModelProperty("/DEFBR", oP13nData[sSysID].DEFBR, true);

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

    }; // end of oAPP.fn.fnOnP13nExeDefaultBrowser

    /************************************************************************
     * 현재 Local PC에 설치된 Browser 정보 구하기
     ************************************************************************/
    oAPP.fn.fnGetExecBrowserInfo = function () {

        var aBrowserInfo = [],
            aDefaultBrowsInfo = parent.getDefaultBrowserInfo(),
            iBrowsCnt = aDefaultBrowsInfo.length;

        var FS = parent.FS;

        // 선택된 브라우저 여부 flag
        var isSelected = false;

        // 브라우저가 실제로 Local PC에 있는지 여부 체크
        for (var i = 0; i < iBrowsCnt; i++) {

            var oBrowsStatus = {},
                oBrows = aDefaultBrowsInfo[i];

            oBrowsStatus.NAME = oBrows.NAME;
            oBrowsStatus.DESC = oBrows.DESC;

            // 브라우저 설치 유무 확인
            var bIsExist = false;

            if (oBrows.INSPATH) {

                oBrowsStatus.INSPATH = oBrows.INSPATH;

                bIsExist = FS.existsSync(oBrows.INSPATH);
                
            }

            oBrowsStatus.ENABLED = bIsExist;

            // 브라우저가 설치 되있고, 선택된 브라우저가 없다면..
            if (bIsExist && !isSelected) {

                // 설치된 브라우저 정보 기준으로 가장 최근의 브라우저 정보를 자동선택 한다.
                isSelected = true;

                oBrowsStatus.SELECTED = isSelected;

                aBrowserInfo.push(oBrowsStatus);

                continue;
            }

            oBrowsStatus.SELECTED = false;

            aBrowserInfo.push(oBrowsStatus);

        }

        return aBrowserInfo;

    }; // end of oAPP.fn.fnGetExecBrowserInfo

    /************************************************************************
     * 기 저장된 Default Browser 와, 현재 Local PC에 설치된 브라우저의 정보를 비교한다.
     * **********************************************************************
     * @param {Array} aBeforeInfo  
     * - 기 저장된 Default Browser 정보
     * @param {Array} aCurrentInfo 
     * - 현재 Local PC에 설치된 브라우저의 정보
     ************************************************************************/
    oAPP.fn.fnCompareBeforeBrowserInfo = function (aBeforeInfo, aCurrentInfo) {

        var iBeforeCnt = aBeforeInfo.length,
            iCurrCnt = aCurrentInfo.length;

        var oBeforeSelected;

        // 기 저장된 정보 중, 기본브라우저로 설정한 Browser 정보를 구한다. 
        for (var i = 0; i < iBeforeCnt; i++) {

            var oBeforeBrows = aBeforeInfo[i];

            // 기 저장한 기본 브라우저면서 그 브라우저가 실제로 local PC에 설치가 되어 있을 경우..
            if (oBeforeBrows.SELECTED && oBeforeBrows.INSPATH) {
                oBeforeSelected = oBeforeBrows;
                break;
            }

        }

        var aNewInfo = [];

        // 현재 설치된 Browser의 정보를 분석
        for (var j = 0; j < iCurrCnt; j++) {

            var oCurrBrows = aCurrentInfo[j];

            /**
             * 위에서 구한 SELECTED 된 Browser 정보가 없으면..
             */
            if (!oBeforeSelected) {

                // 설치되지 않은 브라우저는 skip.
                if (!oCurrBrows.ENABLED) {
                    continue;
                }

                // SELECTED 된 Browser 정보가 없으면
                // 설치된 브라우저 기준으로
                // 가장 첫번째 브라우저를 자동으로 선택해준다.
                oCurrBrows.SELECTED = true;

                aNewInfo = aCurrentInfo;

                break;
            }

            /**
             * 위에서 구한 SELECTED 된 Browser 정보가 있다면..
             */

            // SELECTED 된 Browser명을 비교하여 이름이 다르면..
            if (oBeforeSelected.NAME != oCurrBrows.NAME) {

                // SELECTED = false 정보와 함께 데이터 수집.
                oCurrBrows.SELECTED = false;

                aNewInfo.push(oCurrBrows);

                continue;

            }

            // SELECTED 된 Browser명을 비교하여 이름이 같다면
            // 선택되었다는 의미의 SELECTED 필드에 true를 입력 후 데이터 수집
            oCurrBrows.SELECTED = true;
            aNewInfo.push(oCurrBrows);

        }

        return aNewInfo;

    }; // end of oAPP.fn.fnCompareBeforeBrowserInfo

    /************************************************************************
     * MIME Dialog 관련 로직..
     ************************************************************************/
    oAPP.fn.fnMimeDialogOpener = function () {

        if (oAPP.fn.fnMimePopupOpen) {
            oAPP.fn.fnMimePopupOpen();
            return;
        }

        oAPP.loadJs("fnMimePopupOpen", function () {
            oAPP.fn.fnMimePopupOpen();
        });

    }; // end of fnMimeDialogHandle

})(window, $, oAPP);