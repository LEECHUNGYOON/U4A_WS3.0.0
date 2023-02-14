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
        FS = parent.FS,
        SHELL = REMOTE.shell,
        APP = parent.APP,
        APPCOMMON = oAPP.common,
        APPPATH = parent.APPPATH,
        PATH = parent.PATH,
        RANDOM = parent.RANDOM,
        CURRWIN = REMOTE.getCurrentWindow(),
        PATHINFO = parent.require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        WSUTIL = parent.require(PATHINFO.WSUTIL),
        MIMETYPES = parent.MIMETYPES;

    /**
     * 
     * 
     */
    var gSelectedTreeIndex = -1, // 우클릭 Context menu Index
        // goBeforeSelect; // 이전에 선택한 Row 정보

        gaDblClickHistory = [], // Node 더블클릭 히스토리
        gaFileExtendImgList = [], // 파일 확장자 이미지 경로

        gfSelectRowUpdate; // Ui Table RowUpdated Global function



    /**
     * Bind root paths
     */
    const RENAME_BINDROOT = "/WS30/USPRN";

    /************************************************************************
     * [WS30] 30번 페이지 생성
     ************************************************************************/
    oAPP.fn.fnCreateWs30 = () => {

        // 30번 페이지 존재 유무 체크
        var oWs30 = sap.ui.getCore().byId("WS30");
        if (oWs30) {
            return;
        }

        // 파일 확장자 이미지 경로 구하기
        fnGetFileExtendImgList()
            .then(function() {

                // 없으면 렌더링부터..
                fnOnInitRendering();

            })
            .catch(function() {

                // 없으면 렌더링부터..
                fnOnInitRendering();

            });

    }; // end of oAPP.fn.fnCreateWs30

    /************************************************************************
     * [WS30] 파일 확장자 이미지 경로 구하기
     ************************************************************************/
    function fnGetFileExtendImgList() {

        return new Promise(function(resolve, reject) {

            var svgFolder = PATH.join(APP.getAppPath(), "svg");

            FS.readdir(svgFolder, (err, files) => {

                if (err) {
                    console.log(err);
                    reject();
                    return;
                }

                gaFileExtendImgList = files;

                resolve();

            });


        });

    } // end of fnGetFileExtendImgList

    /************************************************************************
     * [WS30] Layout 초기 설정
     ************************************************************************/
    oAPP.fn.fnOnInitLayoutSettingsWs30 = () => {

        var oUspTreeTable = sap.ui.getCore().byId("usptree");
        if (oUspTreeTable) {
            oUspTreeTable.collapseAll();
            oUspTreeTable.clearSelection();

            // Usp Tree RowsUpdate 이벤트 걸기
            oUspTreeTable.detachRowsUpdated(oAPP.fn.fnAttachRowsUpdateInit);
            oUspTreeTable.attachRowsUpdated(oAPP.fn.fnAttachRowsUpdateInit);

            // 화면 처음 로딩 시, Root Node의 정보를 구한다.
            oUspTreeTable.attachRowsUpdated(ev_getRootNodeRowsUpdated);

        }

        // 이전에 선택한 라인이 있다면 해당 라인 선택 아이콘 표시 해제
        fnOnUspTreeUnSelect();

    }; // end of fnOnInitLayoutSettingsWs30

    oAPP.fn.fnOnResizeWs30 = function() {

        zconsole.log("resize30!!!");

        var oUspTree = sap.ui.getCore().byId("usptree");
        if (!oUspTree) {
            return;
        }

        var oVsb = oUspTree.getDomRef("vsb");
        if (!oVsb) {
            return;
        }

        oVsb.scrollTo(0, 0);

    };

    /************************************************************************
     * [WS30] Code Editor Key Press Callback Event
     ************************************************************************/
    oAPP.fn.fnAttachKeyPressEventCodeEditorWs30 = () => {

        if (event && event.keyCode) {

            // 붙여넣기로 입력한 경우 APP Change 플래그 적용
            if (event.ctrlKey && event.keyCode == 86) {

                oAPP.fn.setAppChangeWs30("X");

                zconsole.log("codeeditor change!!");

                // code editor keyPress 이벤트 해제
                fnCodeEditorKeyPressEvent("");

                return;
            }

            if (event.ctrlKey || event.altKey) {
                return;
            }

            console.log(event.code);

            switch (event.keyCode) {
                case 16: // Shift
                case 17: // Ctrl
                case 18: // Alt
                case 19: // Pause
                case 20: // Caps Lock
                case 25: // ControlRight

                case 27: // esc
                case 33: // Page Up
                case 34: // Page Down
                case 35: // End
                case 36: // Home
                case 37: // Arrow Left
                case 38: // Arrow Up
                case 39: // Arrow Right
                case 40: // Arrow Down

                case 45: // Insert

                case 91: // Windows
                case 93: // ContextMenu

                case 112: // F1
                case 113: // F2
                case 114: // F3
                case 115: // F4
                case 116: // F5
                case 117: // F6
                case 118: // F7
                case 119: // F8
                case 120: // F9
                case 121: // F10
                case 122: // F11
                case 123: // F12

                case 144: // Num Lock
                case 145: // ScrollLock

                    return;

            }

        }

        oAPP.fn.setAppChangeWs30("X");

        zconsole.log("codeeditor change!!");

        // code editor keyPress 이벤트 해제
        fnCodeEditorKeyPressEvent("");

    }; // end of oAPP.fn.fnAttachKeyPressEventCodeEditorWs30

    /************************************************************************
     * [WS30] 초기 화면 그리기
     ************************************************************************/
    function fnOnInitRendering() {

        var oApp = sap.ui.getCore().byId("WSAPP");
        if (!oApp) {
            return;
        }

        var sFmsgBindRootPath = "/FMSG/WS30",

            oCustomHeader = fnGetCustomHeaderWs30(),
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

        var sBindRoot = "/WMENU/WS30",

            //10번 페이지 윈도우 메뉴 정보
            aWMenu30 = fnGetWindowMenuWS30(),
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
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            visible: "{visible}",
                            enabled: "{enabled}",
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
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            visible: "{visible}",
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
                path: `${sBindRoot}/WMENU50`,
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            enabled: "{enabled}",
                            visible: "{visible}",
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
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            visible: "{visible}",
                            enabled: "{enabled}",
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

                // 상단 공통 헤더 버튼
                APPCOMMON.fnGetCommonHeaderButtons()

            ]

        });

    } // end of fnGetCustomHeaderWs30

    /************************************************************************
     * [WS30] Sub Header
     ************************************************************************/
    function fnGetSubHeaderWs30() {

        // Message Class Text
        let sChangeTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"), // Change
            sDispTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"), // Display
            sActiveTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B66"), // Activate,
            sInactTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B67"); // Inactivate             

        var sBindRootPath = "/WS30/APP",

            oBackBtn = new sap.m.Button("ws30_backBtn", {
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
                    return IS_EDIT == "X" ? sChangeTxt : sDispTxt;
                }

            }).addStyleClass("sapUiSmallMarginEnd"), // Change or Display Text	

            oAppActTxt = new sap.m.Title("ws30_appActTxt")
            .bindProperty("text", {
                parts: [
                    `${sBindRootPath}/ACTST`,
                    `${sBindRootPath}/IS_EDIT`,
                    `${sBindRootPath}/APPID`,
                ],
                formatter: (ACTST, IS_EDIT, APPID) => {

                    if (!APPID) {
                        return;
                    }

                    // 브라우저 타이틀을 구성한다.
                    let sModeTxt = IS_EDIT == "X" ? sChangeTxt : sDispTxt,
                        sActTxt = ACTST == "A" ? sActiveTxt : sInactTxt;

                    let sTitle = "U4A Workspace - #";
                    sTitle += `${APPID} ${sModeTxt} ${sActTxt}`;

                    parent.CURRWIN.setTitle(sTitle);


                    return ACTST == "A" ? sActTxt : sInactTxt;
                }

            }).addStyleClass("sapUiSmallMarginEnd"), // Activate or inactivate Text

            oNewWindowBtn = new sap.m.Button("ws30_newWindowBtn", {
                icon: "sap-icon://create",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09") + " (Ctrl+N)", // New Window (Ctrl+N)
                press: oAPP.events.ev_NewWindow
            });

        return new sap.m.OverflowToolbar({

            content: [

                oBackBtn,
                oAppIdTxt,
                oAppModeTxt,
                oAppActTxt,

                new sap.m.ToolbarSeparator(),

                oNewWindowBtn,

                new sap.m.ToolbarSpacer(),

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

        let sDispChgTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05") + " <--> "; // Display
        sDispChgTxt += APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02") + " (Ctrl+F1)"; // Change

        var oDisplayModeBtn = new sap.m.Button("ws30_displayModeBtn", {
                icon: "sap-icon://display",
                tooltip: sDispChgTxt,
                press: ev_pressDisplayModeBtn
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible),

            oChangeModeBtn = new sap.m.Button("ws30_changeModeBtn", {
                icon: "sap-icon://edit",
                tooltip: sDispChgTxt,
                press: ev_pressDisplayModeBtn
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
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B73") + " (Ctrl+F3)", // Activate (Ctrl+F3)
                press: ev_pressActivateBtn,
            }).bindProperty("visible", sVisiBindPath, lf_bindPropForVisible),

            oSaveBtn = new sap.m.Button("ws30_saveBtn", {
                icon: "sap-icon://save",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64") + " (Ctrl+S)", // Save (Ctrl+S)
                press: ev_pressSaveBtn
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

            oMimeBtn = new sap.m.Button({
                icon: "sap-icon://picture",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A10"), // MIME Repository
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A10") + " (Ctrl+Shift+F12)", // MIME Repository (Ctrl+Shift+F12)
                press: oAPP.events.ev_pressMimeBtn
            }).addStyleClass("u4aWs20MimeBtn"),

            oControllerBtn = new sap.m.Button("ws30_controllerBtn", {
                icon: "sap-icon://developer-settings",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A11"), // Controller (Class Builder)
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C38") + " (Ctrl+F12)", // Controller (Ctrl+F12)
                press: ev_pressControllerBtn
            }),

            oAppExecBtn = new sap.m.Button("ws30_appExecBtn", {
                icon: "sap-icon://internet-browser",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06"), // Application Execution                
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06") + " (F8)", // Application Execution (F8)
                press: ev_AppExec
            }).addStyleClass("u4aWs30AppExecBtn");

        return [

            oDisplayModeBtn,
            oChangeModeBtn,

            new sap.m.ToolbarSeparator().bindProperty("visible", sVisiBindPath, lf_bindPropForVisible),

            oActivateBtn,
            oSaveBtn,

            new sap.m.ToolbarSeparator(),
            oMimeBtn,
            oControllerBtn,
            oAppExecBtn

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
                renderType: sap.m.FlexRendertype.Bare,
                width: "100%",
                height: "100%",
                items: [

                    new sap.m.OverflowToolbar({
                        content: aToolbarButtons
                    }),

                    new sap.m.Page("PP", {
                        showHeader: false,
                        enableScrolling: false,
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
            oContPage = fnGetUspContPageWs30(),
            oDocPage = fnGetUspDocPageWs30();

        return new sap.m.NavContainer("usp_navcon", {
            autoFocus: false,
            pages: [

                oDocPage, // USP30

                oIntroPage, // USP10

                oContPage, // USP20

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
     * [WS30] USP Page의 우측 Document Page
     **************************************************************************/
    function fnGetUspDocPageWs30() {

        var aContent = fnGetUspDocPageContentWs30();

        return new sap.m.Page("USP30", {
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B65"), // Document
            content: aContent
        });

    } // end of fnGetUspAttrPageWs30

    /**************************************************************************
     * [WS30] USP Page의 우측 Document Page의 Content
     **************************************************************************/
    function fnGetUspDocPageContentWs30() {

        var sBindRoot = "/WS30/USPDATA",

            oForm = new sap.ui.layout.form.Form({
                editable: true,
                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    labelSpanL: 12,
                    labelSpanM: 12,
                    labelSpanS: 12,
                }),

                formContainers: [
                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
                                }),
                                fields: new sap.m.Text({
                                    // editable: false,
                                    text: `{${sBindRoot}/APPID}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
                                }),
                                fields: new sap.m.Input({
                                    value: `{${sBindRoot}/DESCT}`,
                                    maxLength: 40,
                                    change: ev_UspDescInputChangeEvent
                                }).bindProperty("editable", "/WS30/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding)
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C12"), // Request/Task
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/REQNO}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A98"), // Language Key
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/LANGU}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C03"), // Code Page
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/CODPG}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C13"), // Dev. Package
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/PACKG}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A92"), // Assigned Class Object ID
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/CLSID}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C14"), // Program ID in Requests and Tasks
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/PGMID}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B27"), // Object Type
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/OBJTY}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C15"), // Authorization Group
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/AUTHG}`
                                })
                            }),

                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C16"), // Create User
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/ERUSR}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C06"), // Create Date
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/ERDAT}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C07"), // Create Time
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/ERTIM}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C08"), // Change User
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/AEUSR}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C09"), // Change Date
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/AEDAT}`
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C10"), // Change Time
                                }),
                                fields: new sap.m.Text({
                                    text: `{${sBindRoot}/AETIM}`
                                })
                            }),

                        ]
                    }),
                ]
            });

        return [
            oForm
        ];

    } // end of fnGetUspDocPageContentWs30

    /**************************************************************************
     * [WS30] USP Page의 우측 Content Page
     **************************************************************************/
    function fnGetUspContPageWs30() {

        var oPanel = fnGetUspPanelWs30(),
            oPage = fnGetUspPageWs30();

        return new sap.m.Page("USP20", {
            showHeader: false,
            enableScrolling: false,
            content: [

                new sap.m.VBox({
                    height: "100%",
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [

                        new sap.m.VBox({
                            renderType: sap.m.FlexRendertype.Bare,
                            items: [
                                oPanel
                            ]
                        }),
                        new sap.m.VBox({
                            height: "100%",
                            renderType: sap.m.FlexRendertype.Bare,
                            items: [
                                oPage
                            ]
                        }),

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
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            rowHeight: 45,

            // Aggregations
            layoutData: new sap.ui.layout.SplitterLayoutData("usptreeSplitLayout", {
                size: "500px",
            }),

            columns: [

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C11"), // Name
                        design: sap.m.LabelDesign.Bold
                    }),

                    template: new sap.m.HBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        alignItems: sap.m.FlexAlignItems.Center,
                        items: [

                            new sap.m.Image({
                                width: "20px"
                            })
                            .bindProperty("src", {
                                parts: [
                                    "ISFLD",
                                    "EXTEN"
                                ],
                                formatter: function(ISFLD, EXTEN) {

                                    var iFileImgListLength = gaFileExtendImgList.length;
                                    if (iFileImgListLength == 0) {
                                        return;
                                    }

                                    // SVG 폴더 경로
                                    var svgFolder = PATH.join(APP.getAppPath(), "svg"),
                                        sIconPath = "";

                                    // 폴더일 경우 폴더 아이콘
                                    if (ISFLD == "X") {

                                        sIconPath = svgFolder + "/folder.svg";

                                        return sIconPath;

                                    }

                                    if (!EXTEN) {
                                        return;
                                    }

                                    var sFind = gaFileExtendImgList.find((elem) => {

                                        if (elem.startsWith(EXTEN.toLowerCase()) == true) {
                                            return elem;
                                        }

                                    });

                                    // SVG 폴더 경로에 해당 파일 확장자가 없으면 알수 없는 파일 아이콘
                                    if (!sFind) {

                                        sIconPath = svgFolder + "/file.svg";

                                        return sIconPath;

                                    }

                                    // SVG 폴더 경로에 해당 파일 확장자가 있을 경우
                                    sIconPath = svgFolder + "/" + sFind;

                                    return sIconPath;

                                }
                            })
                            .bindProperty("visible", {
                                parts: [
                                    "PUJKY",
                                    "ISFLD"
                                ],
                                formatter: (PUJKY, ISFLD) => {

                                    if (PUJKY == null || ISFLD == null) {
                                        return;
                                    }

                                    if (PUJKY == "") {
                                        return true;
                                    }

                                    return true;

                                }

                            }).addStyleClass("sapUiTinyMarginEnd"),

                            new sap.m.Text({
                                text: "{OBDEC}",
                            })

                        ]
                    })

                }),

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                        design: sap.m.LabelDesign.Bold
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
                            press: ev_UspTreeTableExpand
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://collapse-group",
                            press: ev_UspTreeTableCollapse
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
                itemSelected: ev_UspTreeCtxMenuClick,
                closed: ev_UspTreeCtxMenuClosed
            }),

            // Events
            beforeOpenContextMenu: ev_beforeOpenContextMenu,
            rowSelectionChange: function(oEvent) {

                var iRowIndex = oEvent.getParameter("rowIndex"),
                    oTable = oEvent.getSource();

                if (oTable.getSelectedIndex() == -1) {
                    oTable.setSelectedIndex(iRowIndex);
                }

            },

        }).addEventDelegate({

            ondblclick: ev_uspTreeItemDblClickEvent

        }).addStyleClass("u4aWsUspTree");

    } // end of fnGetTreeTableWs30

    /**************************************************************************
     * [WS30] Usp 화면 진입시 UspTree에 RowsUpdate 이벤트 걸기
     **************************************************************************/
    oAPP.fn.fnAttachRowsUpdateInit = () => {

        zconsole.log("[Table] rowsUpdated Event");

        // // Usp Tree의 선택된 Row에 색깔 표시
        _fnUspTreeSelectedRowMark();

    }; // end of oAPP.fn.fnAttachRowsUpdateInit

    /**************************************************************************
     * [WS30] Usp Tree의 선택된 Row에 색깔 표시
     **************************************************************************/
    function _fnUspTreeSelectedRowMark() {

        var oTreeTable = sap.ui.getCore().byId("usptree");
        if (!oTreeTable) {
            return;
        }

        var aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        if (iRowLength < 0) {
            return;
        }

        for (var i = 0; i < iRowLength; i++) {

            // Row의 Instance를 구한다.
            var oRow = aRows[i];

            // 일단 css 클래스를 지우고 본다.
            oRow.removeStyleClass("u4aWsTreeTableSelected");

            // 바인딩 정보가 없으면 빠져나간다.
            if (oRow.isEmpty()) {
                continue;
            }

            var oRowCtx = oRow.getBindingContext(),
                oRowData = oRowCtx.getModel().getProperty(oRowCtx.getPath());

            // 바인딩 데이터 중 선택 플래그가 있을 경우에만 css 클래스를 적용한다.
            var ISSEL = oRowData.ISSEL;

            if (ISSEL) {
                oRow.addStyleClass("u4aWsTreeTableSelected");
            }

        }

    } // end of _fnUspTreeSelectedRowMark

    /**************************************************************************
     * [WS30] Usp Panel
     **************************************************************************/
    function fnGetUspPanelWs30() {

        var sBindRoot = "/WS30/USPDATA",

            // Usp Url
            oUrlInput = new sap.m.Input({
                value: `{${sBindRoot}/SPATH}`,
                editable: false
            }).addStyleClass("sapUiTinyMarginEnd"),

            // Mime Url Copy Button
            oUrlCopyBtn = new sap.m.Button({
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C21"), // URL Copy
                press: ev_pressUspUrlCopy.bind(this, oUrlInput)
            }),

            oDescInput = new sap.m.Input({
                value: `{${sBindRoot}/DESCT}`,
                change: ev_UspDescInputChangeEvent
            }).bindProperty("editable", "/WS30/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

            oCharsetInput = new sap.m.Input({
                value: `{${sBindRoot}/CODPG}`,
                change: ev_UspCharsetInputChangeEvent
            })
            .bindProperty("editable", "/WS30/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

            oIsFolderCheckbox = new sap.m.CheckBox({
                editable: false
            }).bindProperty("selected", `${sBindRoot}/ISFLD`, function(ISFLD) {

                if (ISFLD == "X") {
                    return true;
                }

                return false;

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
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C18"), // URL
                            }),
                            fields: new sap.m.HBox({
                                renderType: sap.m.FlexRendertype.Bare,
                                items: [
                                    oUrlInput,
                                    oUrlCopyBtn
                                ]
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C19"), // Is Folder?
                            }),
                            fields: oIsFolderCheckbox
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                            }),
                            fields: new sap.m.HBox({
                                renderType: sap.m.FlexRendertype.Bare,
                                items: [
                                    oDescInput // description Input
                                ]
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C20"), // Charset
                            }),
                            fields: new sap.m.HBox({
                                renderType: sap.m.FlexRendertype.Bare,
                                items: [
                                    oCharsetInput // charset Input
                                ]
                            })

                        }).bindProperty("visible", `${sBindRoot}/ISFLD`, function(ISFLD) {

                            // 폴더가 아닐 경우에만 보여준다.
                            if (ISFLD != "X") {
                                return true;
                            }

                            return false;

                        }),

                    ]
                }),
            ]
        });

        return new sap.m.Panel("uspPanel", {
            expandable: true,
            expanded: true,
            headerText: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C17"), // Properties

            content: [
                oForm
            ],

            layoutData: new sap.m.FlexItemData({
                styleClass: "sapUiTinyMarginBottom"
            })

        });

    } // end of fnGetUspPanelWs30    

    /**************************************************************************
     * [WS30] Usp Page
     **************************************************************************/
    function fnGetUspPageWs30() {

        let lfCodeeditorDelegate = () => { // codeeditor Delegate

                return {

                    onAfterRendering: function(oControl) {

                        var oEditor = oControl.srcControl,
                            _oAceEditor = oEditor._oEditor;

                        if (!_oAceEditor) {
                            return;
                        }

                        _oAceEditor.setFontSize(20);

                    }
                };

            },
            lfCodeeditorAttribute = () => { // codeeditor 속성 정보

                return {
                    height: "100%",
                    width: "100%",
                    syntaxHints: true,
                    type: "{/WS30/USPDATA/EXTEN}",
                    value: "{/WS30/USPDATA/CONTENT}",
                };

            };

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor("ws30_codeeditor", lfCodeeditorAttribute())
            .bindProperty("editable", "/WS30/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding)
            .bindProperty("type", "/WS30/USPDATA/EXTEN", _fnCodeEditorBindPropertyType)
            .bindProperty("visible", _fnCodeEditorBindPropertyVisible());

        oCodeEditor.addDelegate(lfCodeeditorDelegate());

        let oCodeEditorClone = oCodeEditor.clone("clone1");
        oCodeEditorClone.addDelegate(lfCodeeditorDelegate());

        // CodeEditor 각각의 고유 CSS 클래스를 적용한다.
        oCodeEditor.addStyleClass("u4aUspCodeeditor1");
        oCodeEditorClone.addStyleClass("u4aUspCodeeditor2");

        oCodeEditor.setLayoutData(new sap.ui.layout.SplitterLayoutData("codeEditorSplitLayout", {
            size: "0px",
        }));

        let lfCodeeditorBindProperty = () => {

            return {

                parts: [
                    "/WS30/APP/IS_EDIT",
                    "/WS30/USPDATA/PUJKY",
                    "/WS30/USPDATA/ISFLD",
                ],
                formatter: (IS_EDIT, PUJKY, ISFLD) => {

                    if (IS_EDIT != "X") {
                        return false;
                    }

                    if (PUJKY == "") {
                        return false;
                    }

                    if (ISFLD == "X") {
                        return false;
                    }

                    return true;

                }
            };

        };

        oAPP.attr.oCodeEditor1 = oCodeEditor;
        oAPP.attr.oCodeEditor2 = oCodeEditorClone;

        /**
         * 코드 에디터 입력한 값 동기화
         */

        oCodeEditor.addEventDelegate({
            onkeyup: () => {

                let value = oCodeEditor._oEditor.getValue();

                oCodeEditorClone._oEditor.setValue(value, 1);

            }
        });

        oCodeEditorClone.addEventDelegate({
            onkeyup: () => {

                let value = oCodeEditorClone._oEditor.getValue();

                oCodeEditor._oEditor.setValue(value, 1);

            }
        });

        let oHeaderToolbar = new sap.m.Bar({

            contentLeft: [
                new sap.m.Title({
                    text: "{/WS30/USPDATA/OBDEC}"
                })
            ],

            contentRight: [

                new sap.m.Button({
                    icon: "sap-icon://rotate",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C22"), // Split Orientation Change
                    tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C22"), // Split Orientation Change
                    press: ev_codeeditorSplitOrientationChange
                }).bindProperty("enabled", {
                    parts: [
                        "/WS30/USPDATA/ISFLD",
                    ],
                    formatter: (ISFLD) => {

                        if (ISFLD == "X") {
                            return false;
                        }

                        return true;

                    }
                }),

                new sap.m.Button({
                    icon: "sap-icon://full-screen",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C23"), // Full Screen                    
                    tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D23") + " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C79"), // Editor Full Screen Mode
                    press: ev_codeeditorFullscreen
                }),

                new sap.m.Button({
                    icon: "sap-icon://syntax",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C24"), // Pattern
                    tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D46"), // Source Pattern
                    press: ev_codeeditorPattern
                }).bindProperty("enabled", lfCodeeditorBindProperty()),

                new sap.m.Button("ws30_codeeditor_prettyBtn", {
                    icon: "sap-icon://indent",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C25"), // Pretty Print
                    tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C25") + "(Shift + F1)", // Pretty Print                    
                    press: ev_codeeditorPrettyPrint,
                }).bindProperty("enabled", lfCodeeditorBindProperty())
            ]

        });

        return new sap.m.Page({
            showHeader: true,
            showFooter: false,
            enableScrolling: false,
            customHeader: oHeaderToolbar,

            content: [

                new sap.ui.layout.Splitter("uspCodeeditorSplit", {
                    height: "100%",
                    width: "100%",
                    contentAreas: [
                        oCodeEditor,
                        oCodeEditorClone

                    ]
                })
                .bindProperty("visible", _fnCodeEditorBindPropertyVisible())
                .addEventDelegate({
                    ondblclick: _fnDoubleClickSplitbar,
                })
                .addStyleClass("uspCodeeditorSplit sapUiSmallMarginBottom")

            ]

        });

    } // end of fnGetUspPageWs30  

    function _fnDoubleClickSplitbar(e) {

        let oSplitLayoutData = sap.ui.getCore().byId("codeEditorSplitLayout"),
            oTarget = e.target,
            bIsSplitBar = $(oTarget).hasClass("uspCodeeditorSplit");

        if (!oSplitLayoutData || !bIsSplitBar) {
            return;
        }

        oSplitLayoutData.setSize("0px");

    }

    function _fnCodeEditorBindPropertyVisible() {

        return {
            parts: [
                "/WS30/USPDATA/ISFLD"
            ],
            formatter: (ISFLD) => {

                if (ISFLD == "X") {
                    return false;
                }

                return true;

            }
        };

    } // end of _fnCodeEditorBindPropertyVisible

    function _fnCodeEditorBindPropertyType(EXTEN) {

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

    } // end of _fnCodeEditorBindPropertyType

    /**************************************************************************
     * [WS30] 윈도우 메뉴 정보
     **************************************************************************/
    function fnGetWindowMenuWS30() {

        return [{
                key: "WMENU20",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B35"), // Utilities
                icon: "",
            },
            {
                key: "WMENU30",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B36"), // System
                icon: "",
            },
            {
                key: "WMENU50",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39"), // Help
                icon: "",
            },
            {
                key: "Test10",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B69"), // Test
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
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B49"), // Select Browser Type
            }, {
                key: "WMENU20_03",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B50"), // Video Record
            }],

            aWMENU30 = [{
                key: "WMENU30_01",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
            }, {
                key: "WMENU30_02",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B51"), // Close Window
            }, {
                key: "WMENU30_03",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B52"), // Options
            }, {
                key: "WMENU30_04",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B53"), // Logoff
            }, {
                key: "WMENU30_05",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B54"), // Release Notes
            }, {
                key: "WMENU30_07",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B70"), // Error Log
            }, {
                key: "WMENU30_06",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B55"), // Administrator
                visible: true,
                items: [{
                    key: "WMENU30_06_01",
                    text: "DevTool"
                }, ],
            }, ],

            aWMENU50 = [{
                key: "WMENU50_01",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44"), // U4A Help Document
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
     * 
     * -- Menu List --
     * K1: Expand Subtree
     * K2: Collapse Subtree
     * K3: Create
     * K4: Delete
     * K5: Download
     * K6: Test Service
     * K7: Rename
     * K8: Up
     * K9: Down
     * K10: Move Position
     * K11: new window usp Page
     * K12: Upload
     **************************************************************************/
    function fnGetUspTreeDefCtxMenuList() {

        return [{
                ICON: "sap-icon://expand-group",
                KEY: "K1",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C27"), // Expand Subtree
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://collapse-group",
                KEY: "K2",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C28"), // Collapse Subtree
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://internet-browser",
                KEY: "K6",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D43"), // Test Service
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://popup-window",
                KEY: "K11",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://write-new",
                KEY: "K3",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"), // Create
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://delete",
                KEY: "K4",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03"), // Delete
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://edit",
                KEY: "K7",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D44"), // Rename
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://navigation-up-arrow",
                KEY: "K8",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A55"), // Up
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://navigation-down-arrow",
                KEY: "K9",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A56"), // Down
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://outdent",
                KEY: "K10",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A57"), // Move Position
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://upload",
                KEY: "K12",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D88"), // Upload
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "sap-icon://download",
                KEY: "K5",
                TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B78"), // Download
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },

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
                ISFLD: false,
                CODPG: "utf-8"
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
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C11"), // Name
                            }),
                            fields: new sap.m.Input("ws30_crname", {
                                value: `{${sBindRootPath}/NAME}`,
                                valueStateText: `{${sBindRootPath}/NAME_VSTXT}`,
                                submit: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
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
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                            }),
                            fields: new sap.m.Input({
                                value: `{${sBindRootPath}/DESC}`,
                                submit: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C20") + " (ex: utf-8, euc-kr..)" // Charset (ex: utf-8, euc-kr..)                               
                            }),
                            fields: new sap.m.Input({
                                value: `{${sBindRootPath}/CODPG}`,
                                submit: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D45"), // Folder
                            }),
                            fields: new sap.m.CheckBox({
                                selected: `{${sBindRootPath}/ISFLD}`,
                            })
                        }),

                    ]

                }),

            ]

        });

        let oCloseBtn = new sap.m.Button({
            type: sap.m.ButtonType.Reject,
            icon: "sap-icon://decline",
            press: ev_createUspDlgCloseEvent
        });

        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"); // Create
        sTitle += ` [ {${sBindRootPath}/TITLE} ]`;

        // USP Folder 생성 팝업
        var oUspCrDlg = new sap.m.Dialog("uspCrNodePopup", {

            // properties
            draggable: true,
            resizable: true,
            title: sTitle, //`Create [ {${sBindRootPath}/TITLE} ]`,
            contentWidth: "500px",

            // aggregations
            customHeader: new sap.m.Toolbar({
                content: [

                    new sap.ui.core.Icon({
                        src: "sap-icon://write-new"
                    }),

                    new sap.m.Title({
                        text: sTitle
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    oCloseBtn.clone()

                ]

            }),
            buttons: [

                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
                }),

                oCloseBtn.clone()

            ],

            content: [
                oUspCrForm
            ],

            // association
            initialFocus: "ws30_crname",

            // events
            afterClose: function() {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oUspCrDlg.open();

    } // end of fnCreateUspNodePopup

    /**************************************************************************
     * [WS30] USP Tree의 Rename 팝업
     **************************************************************************/
    function fnRenameUspNodePopup(oTreeTable) {

        // 테이블의 선택한 라인의 바인딩 데이터를 구한다.
        let iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oCtx) {
            return;
        }

        let oData = oCtx.getModel().getProperty(oCtx.getPath()),
            oBindData = {
                PRC: {
                    NAME_VSTXT: "",
                    NAME_VS: sap.ui.core.ValueState.None
                }
            };

        oBindData.BINDDATA = jQuery.extend(true, {}, oData);

        // USP 생성 팝업의 초기 데이터 모델 세팅
        APPCOMMON.fnSetModelProperty(RENAME_BINDROOT, oBindData);

        var oDialog = sap.ui.getCore().byId("uspRNPopup");
        if (oDialog) {

            oDialog.open();

            return;
        }

        // USP 생성 팝업의 FORM
        var oUspRNForm = new sap.ui.layout.form.Form({
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
                                required: false,
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C18") // URL
                            }),
                            fields: new sap.m.Input({
                                value: `{${RENAME_BINDROOT}/BINDDATA/SPATH}`,
                                editable: false,
                                enabled: false,
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: false,
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D92") // Old Name
                            }),
                            fields: new sap.m.Input({
                                value: `{${RENAME_BINDROOT}/BINDDATA/OBDEC}`,
                                editable: false,
                                enabled: false,
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C19"), // Is Folder?
                            }),
                            fields: new sap.m.CheckBox({
                                editable: false,
                            }).bindProperty("selected", `${RENAME_BINDROOT}/BINDDATA/ISFLD`, function(ISFLD) {

                                if (ISFLD == "X") {
                                    return true;
                                }

                                return false;

                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: true,
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D93"), // New Name
                            }),
                            fields: new sap.m.Input("ws30_rename_new", {
                                value: `{${RENAME_BINDROOT}/BINDDATA/NEWNAME}`,
                                valueStateText: `{${RENAME_BINDROOT}/PRC/NAME_VSTXT}`,
                                submit: () => {
                                    fnRenameSubmit();
                                }
                            }).bindProperty("valueState", `${RENAME_BINDROOT}/PRC/NAME_VS`, function(VST) {

                                // 바인딩 필드에 값이 없으면 ValueState의 기본값으로 리턴
                                if (VST == null || VST == "") {
                                    return sap.ui.core.ValueState.None;
                                }

                                return VST;

                            })
                        }),

                    ]

                }),

            ]

        }); // end of form

        let oCloseBtn = new sap.m.Button({
            type: sap.m.ButtonType.Reject,
            icon: "sap-icon://decline",
            press: () => {

                var oDialog = sap.ui.getCore().byId("uspRNPopup");

                if (oDialog && oDialog.isOpen()) {
                    oDialog.close();
                }

            }
        });

        // USP Rename 팝업
        new sap.m.Dialog("uspRNPopup", {

            // properties
            draggable: true,
            resizable: true,
            contentWidth: "500px",

            // aggregations
            customHeader: new sap.m.Toolbar({
                content: [

                    new sap.ui.core.Icon({
                        src: "sap-icon://edit"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D44"), // Rename
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    oCloseBtn.clone()

                ]

            }),
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: () => {

                        fnRenameSubmit();
                    }
                }),

                oCloseBtn.clone()

            ],

            content: [
                oUspRNForm
            ],

            // association
            initialFocus: "ws30_rename_new",

            // events
            afterClose: function() {

                // USP 생성 팝업의 초기 데이터 모델 세팅
                APPCOMMON.fnSetModelProperty(RENAME_BINDROOT, {});

            }

        }).open();

    } // end of fnRenameUspNodePopup

    /**************************************************************************
     * [WS30] USP Tree의 Rename
     **************************************************************************/
    async function fnRenameSubmit() {

        debugger;

        // busy 키고 Lock 키기
        oAPP.common.fnSetBusyLock("X");

        // Rename 바인딩 데이터를 구한다.
        let oModelData = APPCOMMON.fnGetModelProperty(RENAME_BINDROOT),
            oModelCopyData = jQuery.extend(true, {}, oModelData);

        let oBindData = oModelCopyData.BINDDATA,
            oPrc = oModelCopyData.PRC;

        // 기존이름과 변경할 이름이 같다면 그냥 빠져나간다.        
        if (oBindData.OBDEC == oBindData.NEWNAME) {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            // 오류난 Input에 focus를 줘서 ValueState Text가 잘 보이도록 만든다.
            var oInput = sap.ui.getCore().byId("ws30_rename_new");
            if (oInput) {
                oInput.focus();
            }

            // Value State 설정
            oPrc.NAME_VS = sap.ui.core.ValueState.Error;
            oPrc.NAME_VSTXT = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "363"); // Same file exists.

            APPCOMMON.fnSetModelProperty(`${RENAME_BINDROOT}/PRC`, oPrc);

            return;

        }

        oBindData.NAME = oBindData.NEWNAME;
        oBindData.ISFLD = oBindData.ISFLD == "X" ? true : false;

        // Rename 입력값 체크
        var oResult = _fnCheckCreateNodeData(oBindData);

        if (oResult.RETCD == "E") {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            // 오류난 Input에 focus를 줘서 ValueState Text가 잘 보이도록 만든다.
            var oInput = sap.ui.getCore().byId("ws30_rename_new");
            if (oInput) {
                oInput.focus();
            }

            // Value State 설정
            oPrc.NAME_VS = sap.ui.core.ValueState.Error;
            oPrc.NAME_VSTXT = oResult.RTMSG;

            APPCOMMON.fnSetModelProperty(`${RENAME_BINDROOT}/PRC`, oPrc);

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            return;

        }

        let oTreeTable = sap.ui.getCore().byId("usptree");
        if (!oTreeTable) {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var oCtx = oTreeTable.getContextByIndex(gSelectedTreeIndex);
        if (!oCtx) {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 같은 레벨의 형제들 찾기
        var oResult = oAPP.fn._fnFindModelData(oCtx.sPath),
            oDup = oResult.Nodes.find(arr => arr.OBDEC == oBindData.NEWNAME);

        // 같은 레벨에서의 나를 제외한 이름 중복 확인
        if (oDup && oDup.OBJKY !== oBindData.OBJKY) {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            // 오류난 Input에 focus를 줘서 ValueState Text가 잘 보이도록 만든다.
            var oInput = sap.ui.getCore().byId("ws30_rename_new");
            if (oInput) {
                oInput.focus();
            }

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "004"); // Duplicate filename exists.

            // Value State 설정
            oPrc.NAME_VS = sap.ui.core.ValueState.Error;
            oPrc.NAME_VSTXT = sMsg;

            APPCOMMON.fnSetModelProperty(`${RENAME_BINDROOT}/PRC`, oPrc);

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            return;

        }

        // 마임타입 변경 여부 플래그
        let bIsMimeTypeChange = false;

        // 폴더가 아닌 파일명 변경 시, 이전 파일의 확장자와 같은지 확인
        if (!oBindData.ISFLD) {

            // busy 끄고 Lock 끄기
            oAPP.common.fnSetBusyLock("");

            var oResult = await _checkDiffFileExtension(oBindData);
            if (oResult.RETCD == "E") {
                return;
            }

            // busy 키고 Lock 키기
            oAPP.common.fnSetBusyLock("X");

            // 파일명 변경시, 확장자까지 변경을 원할 경우 
            if (oResult.RETCD == "W") {
                bIsMimeTypeChange = true;
            }

        }

        // 변경된 Path 위치 구하기
        var aBeforePathSplit = oBindData.SPATH.split("/"),
            iBeforePathSplitLength = aBeforePathSplit.length;

        // 변경할 자식요소들 구하기
        let aChildData = oCtx.getProperty(oCtx.getPath()),
            aChildDataCopy = jQuery.extend(true, {}, aChildData);

        aChildDataCopy = _parseTree2Tab([aChildDataCopy], "USPTREE");

        let iChildDataLength = aChildDataCopy.length;

        for (var i = 0; i < iChildDataLength; i++) {

            var oTreeItem = aChildDataCopy[i],
                sPath = oTreeItem.SPATH,
                aPathSplit = sPath.split("/"),
                iPathSplitLength = aPathSplit.length;

            // 변경 전 Path와 변경할 Path가 같을 경우는 Path의 이름(OBDEC)을 변경한다.
            if (iBeforePathSplitLength == iPathSplitLength) {
                oTreeItem.OBDEC = oBindData.NEWNAME;

                // 마임타입까지 변경해야 하는 경우
                if (bIsMimeTypeChange) {

                    oTreeItem.MIME = MIMETYPES.lookup(oBindData.NEWNAME);
                    oTreeItem.EXTEN = APPCOMMON.fnGetFileExt(oBindData.NEWNAME);

                }

            }

            // 변경된 Path로 재구성
            let newPath = "";
            for (var j = 0; j < iPathSplitLength; j++) {

                var sPath = aPathSplit[j];
                if (sPath == "") {
                    continue;
                }

                if (j == iBeforePathSplitLength - 1) {
                    newPath += "/" + oBindData.NEWNAME;
                    continue;
                }

                newPath += "/" + sPath;

            }

            oTreeItem.SPATH = newPath;

        }

        /*************************************************************************
         * 변경된 데이터 말기
         *************************************************************************/

        let aUspTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
            aUspTreeDataCopy = jQuery.extend(true, [], aUspTreeData);

        aUspTreeDataCopy = _parseTree2Tab(aUspTreeDataCopy, "USPTREE");

        for (var i = 0; i < iChildDataLength; i++) {

            var oTreeItem = aChildDataCopy[i];

            let iFound = aUspTreeDataCopy.findIndex(elem => elem.OBJKY == oTreeItem.OBJKY);
            if (iFound == -1) {
                continue;
            }

            aUspTreeDataCopy.splice(iFound, 1);

            aUspTreeDataCopy.splice(iFound, 0, oTreeItem);

        }

        var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
        oSaveBtn.firePress({
            AFPRC: "_RN",
            PRCCD: "03", // 01: CREATE, 02: SAVE, 03: RENAME
            oTreeTable: oTreeTable,
            TREEDATA: aUspTreeDataCopy,
            CHANGEDATA: aChildDataCopy
        });

    } // end of fnRenameSubmit

    // 기존 파일명의 확장자와 변경할 파일명의 확장자가 다른지 확인
    function _checkDiffFileExtension(oBindData) {

        return new Promise((resolve) => {

            // 기존 파일명의 확장자와 변경할 파일명을 구한다.
            var sExtFileName = PATH.extname(oBindData.OBDEC),
                sNewExtFileName = PATH.extname(oBindData.NEWNAME);

            // 확장자가 같으면 그냥 빠져나간다.
            if (sExtFileName == sNewExtFileName) {
                resolve({
                    RETCD: "S"
                });
                return;
            }

            // 기존 파일명의 확장자와 변경할 파일명의 확장자가 다를 경우 경고 메시지를 뿌린다.
            if (sExtFileName !== sNewExtFileName) {

                // 질문팝업
                let sMsg = "기존 파일 확장자와 변경 확장자가 다를 경우 파일이 손상될 수 있습니다. \n \n  계속하시겠습니까? ";
                parent.showMessage(sap, 30, 'W', sMsg, (oResult) => {

                    if (oResult == "NO") {
                        resolve({
                            RETCD: "E"
                        });

                        return;
                    }

                    resolve({
                        RETCD: "W"
                    });

                });

                return;

            }

        });

    }

    /**************************************************************************
     * [WS30] USP Tree의 Node 삭제
     **************************************************************************/
    function fnDeleteUspNode(oTreeTable) {

        var iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oTreeModel = oTreeTable.getModel(),
            oTreeData = oTreeModel.getProperty(oCtx.sPath),

            // 질문 메시지
            sMsg = ` [ ${oTreeData.OBDEC} ] ` + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "003"); // Do you really want to delete the object?

        var oParam = {
            oTreeTable: oTreeTable
        };

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

        // 질문팝업? 삭제하시겠습니까?
        parent.showMessage(sap, 30, 'W', sMsg, _fnDeleteUspNodeCb.bind(this, oParam));

        // 현재 떠있는 팝업 창들을 잠시 숨긴다.
        oAPP.fn.fnChildWindowShow(false);

    } // end of fnDeleteUspNode

    function _fnDeleteUspNodeCb(oParam, oEvent) {

        // 동작 취소.
        if (oEvent !== "YES") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        var oTreeTable = oParam.oTreeTable,
            iIndex = gSelectedTreeIndex,
            oSelectedCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oSelectedCtx) {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oDelRowData = oSelectedCtx.getModel().getProperty(oSelectedCtx.getPath()),
            oDeleteTreeData = jQuery.extend(true, {}, oDelRowData),
            aDeleteTreeData = _parseTree2Tab([oDeleteTreeData], "USPTREE"),

            oAppData = fnGetAppInfo();

        var sReqNo = "";

        // 기존에 CTS 번호가 있을 경우
        if (oAppData.REQNO != "") {
            sReqNo = oAppData.REQNO;
        }

        // CTS 팝업에서 선택한 CTS 번호가 있을 경우.
        if (oParam.TRKORR) {
            sReqNo = oParam.TRKORR;
        }

        var oSendData = {
                APPID: oAppData.APPID,
                TRKORR: sReqNo,
                T_TREE: aDeleteTreeData,
                TU4A0010: oAppData
            },

            sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_page_del`,

            oFormData = new FormData();

        oFormData.append("APPDATA", JSON.stringify(oSendData));

        var oParam = {
            oTreeTable: oTreeTable,
            TRKORR: sReqNo,
            oEvent: oEvent
        }

        sendAjax(sPath, oFormData, _fnDeleteUspNodeSuccessCb.bind(oParam));

    } // end of _fnDeleteUspNodeCb    

    function _fnDeleteUspNodeSuccessCb(oResult) {

        // JSON Parse 오류 일 경우
        if (typeof oResult !== "object") {

            var sMsg = "[usp_page_del] JSON Parse Error";

            // Critical Error
            oAPP.fn.fnCriticalErrorWs30({
                RTMSG: sMsg
            });

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        var oParam = this,
            oTreeTable = oParam.oTreeTable;

        // Normal or Critical Error!
        switch (oResult.RETCD) {

            case "Z":

                // [WS30] Critical Error
                oAPP.fn.fnCriticalErrorWs30(oResult);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            case "E":

                parent.setSoundMsg("02"); // error sound

                // 작업표시줄 깜빡임
                CURRWIN.flashFrame(true);

                // 서버에서 만든 스크립트가 있다면 eval 처리.
                if (oResult.SCRIPT) {
                    eval(oResult.SCRIPT);

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    return;
                }

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

        }

        // 서버에서 만든 스크립트가 있다면 eval 처리.
        if (oResult.SCRIPT) {

            eval(oResult.SCRIPT);

        } else {

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("S", "WS30", oResult.RTMSG);

        }

        var iIndex = gSelectedTreeIndex,
            oSelectedCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oSelectedCtx) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var oCtxModel = oSelectedCtx.getModel(),
            oDelRowData = oCtxModel.getProperty(oSelectedCtx.getPath()),
            oDeleteTreeData = jQuery.extend(true, {}, oDelRowData);

        // 삭제 성공한 Tree Data를 구한다.
        var aDeleteTreeData = _parseTree2Tab([oDeleteTreeData], "USPTREE"),
            aUspTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
            oBindBeforeSelect = _fnGetSelectedUspTreeData(aUspTreeData);

        var oAppInfo = fnGetAppInfo(), // App 정보
            oContent = APPCOMMON.fnGetModelProperty("/WS30/USPDATA"); // 우측 컨텐츠 데이터

        // APP 업데이트 정보 갱신
        oAppInfo = Object.assign({}, oAppInfo, oResult.S_RETURN);

        /**
         * 삭제된 대상 중, 우측에 보고 있던 CONTENT가 있다면 클리어 시키고 Intro 페이지로 이동
         */
        if (oBindBeforeSelect) {

            // 우측에 활성화 되어 있는 Content가 Root 정보 일 경우.
            var bIsRoot = oBindBeforeSelect.PUJKY === "" ? true : false;
            if (bIsRoot) {
                oContent = Object.assign({}, oContent, oResult.S_RETURN);
            }

            var oFind = aDeleteTreeData.find(arr => arr.OBJKY == oBindBeforeSelect.OBJKY);
            if (oFind) {

                // 앱 변경 사항 플래그 설정
                oAPP.fn.setAppChangeWs30("");

                // Intro Page 로 이동
                fnOnMoveToPage("USP10");

            }

        }

        var oResult = oAPP.fn._fnFindModelData(oSelectedCtx.sPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oDeleteTreeData.OBJKY);

        if (iFindIndex == -1) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        oResult.Nodes.splice(iFindIndex, 1);

        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        oCtxModel.refresh();

        oTreeTable.clearSelection();

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

    } // end of _fnDeleteUspNodeSuccessCb

    function lf_appDelCtsPopup(oParam) {

        // CTS Popup을 Open 한다.
        oAPP.fn.fnCtsPopupOpener(function(oResult) {

            var oParam = this;

            oParam.TRKORR = oResult.TRKORR;

            _fnDeleteUspNodeCb(oParam, oParam.oEvent);

        }.bind(oParam));

    } // end of lf_appDelCtsPopup

    oAPP.fn._fnFindModelData = (sPath) => {

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

    }; // end of oAPP.fn._fnFindModelData

    oAPP.fn._fnFindModelData2 = (oModelData, sPath) => {

        var aa = sPath.split("/"),
            ilen = aa.length,
            mo = oModelData,
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

    }; // end of oAPP.fn._fnFindModelData

    /**************************************************************************
     * [WS30] Critical Error
     **************************************************************************/
    oAPP.fn.fnCriticalErrorWs30 = (oResult) => {

        parent.setSoundMsg("02"); // error sound

        // 작업표시줄 깜빡임
        CURRWIN.flashFrame(true);

        parent.showMessage(sap, 20, 'E', oResult.RTMSG, fnCallback);

        function fnCallback() {

            //  [Critical] 메시지 팝업 띄우고 확인 누르면 10번으로 강제 이동
            // 세션, 락 등등 처리 후 이동
            // 서버 세션이 죽었다면 오류 메시지 뿌리고 10번 화면으로 이동한다.           
            // fnMoveToWs10();

            // 현재 같은 세션으로 떠있는 브라우저 창을 전체 닫고 내 창은 Login 페이지로 이동.
            fn_logoff_success('X');

        }

    }; // end of oAPP.fn.fnCriticalErrorWs30

    function fnMoveToWs10() {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // Busy 실행
        parent.setBusy('X');

        // 글로벌 변수 초기화
        // goBeforeSelect = undefined;
        gSelectedTreeIndex = -1;

        // // 30번 레이아웃 초기 설정
        // oAPP.fn.fnOnInitLayoutSettingsWs30();

        // 우측 에디터 영역을 메인 페이지로 이동
        fnOnMoveToPage("USP10");

        // code editor KeyPress 이벤트 설정
        fnCodeEditorKeyPressEvent("");

        // 10번 페이지로 이동할때 서버 한번 콜 해준다. (서버 세션 죽이기)
        oAPP.fn.fnKillUserSession(_fnKillUserSessionCb);

    }; // end of fnMoveToWs10

    function _fnKillUserSessionCb() {

        /**
         * 페이지 이동 시, CHANGE 모드였다면 현재 APP의 Lock Object를 해제한다.
         */
        var oAppInfo = fnGetAppInfo();

        if (oAppInfo.IS_EDIT == 'X') {
            ajax_unlock_app(oAppInfo.APPID);
        }

        // WS20 화면에서 떠있는 Dialog, Popup 종류, Electron Browser들 전체 닫는 function
        oAPP.fn.fnCloseAllWs20Dialogs();

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

        // RowUpdate 이벤트를 해제 한다.
        let oUspTreeTable = sap.ui.getCore().byId("usptree");
        if (oUspTreeTable) {
            oUspTreeTable.detachRowsUpdated(oAPP.fn.fnAttachRowsUpdateInit);
        }

        parent.CURRWIN.setTitle("U4A Workspace - #Main");

    } // end of _fnKillUserSessionCb

    /**************************************************************************
     * tree -> tab으로 변환.
     **************************************************************************/
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

    } // end of _parseTree2Tab

    /**************************************************************************
     * [WS30] USP Tree의 File Download
     **************************************************************************/
    function fnOnDownloadUspFiles(oTreeTable) {

        var iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oCtx) {
            return;
        }

        // 선택한 Node 정보 구하기
        var oSelectedUspData = oCtx.getModel().getProperty(oCtx.getPath()),
            aUspData = [];

        // 선택한 USP Node가 폴더가 아닌 경우만 수집
        if (oSelectedUspData.ISFLD !== "X") {
            aUspData.push(oSelectedUspData);
        }

        // download 대상 Usp File 수집
        fnUspTreeDownloadFileCollect(aUspData, oSelectedUspData);

        // Download 대상 File이 없는 경우.
        if (aUspData.length == 0) {

            // Download 대상 File이 없습니다. 메시지 토스트 처리..            
            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B78"); // Download
            sMsg = sMsg + " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B79"); // File
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "073", sMsg); // &1 does not exist.

            parent.showMessage(sap, 10, "E", sMsg);

            return;
        }

        var sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_get_file_data`;

        var oFormData = new FormData();
        oFormData.append("USPDATA", JSON.stringify(aUspData));

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        // function bind Parameter
        var oBindParam = {
            SelectedUspData: oSelectedUspData
        };

        // 서버에서 실제 Content 데이터를 구한다.
        sendAjax(sPath, oFormData, _fnGetFileContents.bind(oBindParam));

    } // end of fnOnDownloadUspFiles

    /**************************************************************************
     * [WS30] USP Tree의 File Download 대상 수집
     **************************************************************************
     * @param {Array} aUspData
     * - 좌측 Usp Tree 전체 데이터
     * 
     * @param {Object} oSelectedUspData
     * - 현재 선택된 Usp Data
     **************************************************************************/
    function fnUspTreeDownloadFileCollect(aUspData, oSelectedUspData) {

        if (!oSelectedUspData.USPTREE) {
            return;
        }

        var iChildCnt = oSelectedUspData.USPTREE.length;
        if (iChildCnt == 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {

            if (!oSelectedUspData.USPTREE) {
                return;
            }

            var oChild = oSelectedUspData.USPTREE[i];
            if (oChild.ISFLD !== "X") {
                aUspData.push(oChild);
            }

            if (!oChild.USPTREE || oChild.USPTREE.length == 0) {
                continue;
            }

            fnUspTreeDownloadFileCollect(aUspData, oChild);

        }

    } // end of fnUspTreeFileCollect

    /**************************************************************************
     * [WS30] 서버에서 실제 content 데이터를 구한다.
     **************************************************************************/
    function _fnGetFileContents(oResult) {

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        parent.setBusy("");

        // JSON Parse 오류 일 경우
        if (typeof oResult !== "object") {

            var sMsg = "[usp_get_file_data] JSON Parse Error";

            // Critical Error
            oAPP.fn.fnCriticalErrorWs30({
                RTMSG: sMsg
            });

            return;

        }

        // Normal or Critical Error!
        switch (oResult.RETCD) {

            case "Z":

                // [WS30] Critical Error
                oAPP.fn.fnCriticalErrorWs30(oResult);

                return;

            case "E":

                parent.setSoundMsg("02"); // error sound

                // 작업표시줄 깜빡임
                CURRWIN.flashFrame(true);

                // 서버에서 만든 스크립트가 있다면 eval 처리.
                if (oResult.SCRIPT) {
                    eval(oResult.SCRIPT);
                    return;
                }

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

                return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        parent.setBusy("");

        var aUspData = oResult.USPDATA;

        // Array 타입이 아니면 리턴
        if (aUspData instanceof Array == false) {
            throw new Error("Usp Data Type Error! Please Contact Administrator!");
        }

        var ZIP = new parent.require('node-zip')(),
            iUspDataLength = aUspData.length;

        for (var i = 0; i < iUspDataLength; i++) {

            var oUspData = aUspData[i],
                sFilePath = oUspData.SPATH,
                sMimeType = oUspData.MIME,
                sFilePath = sFilePath.replace("/zu4a/usp", "");

            // Mime type 이 Image 인 경우 Base64로 압축한다.
            if (sMimeType.startsWith("image")) {

                var sContent = oUspData.CONTENT,
                    aSplit = sContent.split(",");

                if (aSplit.length > 1) {
                    sContent = aSplit[1];
                }

                var ImgBuffer = parent.base64ToArrayBuffer(sContent);
                ZIP.file(sFilePath, ImgBuffer);

                continue;
            }

            ZIP.file(sFilePath, oUspData.CONTENT);

        }

        var data = ZIP.generate({
            type: "blob",
        });

        var oAppInfo = fnGetAppInfo(),
            sFileName = `${oAppInfo.APPID.toLowerCase()}`;

        _fnUspFileDown(sFileName, data);

    } // end of _fnGetFileContents

    /**************************************************************************
     * [WS30] Usp 데이터를 파일로 다운로드
     **************************************************************************/
    function _fnUspFileDown(sFileName, data) {

        let defaultDownPath = APP.getPath("downloads");

        // 이전에 지정한 파일 다운 폴더 경로가 있을 경우 해당 경로 띄우기.
        if (!!oAPP.attr._filedownFolderPath) {
            defaultDownPath = oAPP.attr._filedownPath;
        }

        // 다운받을 폴더 지정하는 팝업에 대한 Option
        var options = {
            // See place holder 1 in above image
            title: "File Download",

            // See place holder 2 in above image            
            defaultPath: defaultDownPath,

            properties: ['openDirectory', 'dontAddToRecent']

        };

        var oFilePathPromise = REMOTE.dialog.showOpenDialog(REMOTE.getCurrentWindow(), options);

        oFilePathPromise.then((oPaths) => {

            if (oPaths.canceled) {
                return;
            }

            var sTimeStamp = new Date().format("yyyyMMddHHmmss"),
                fileName = `${sFileName}_${sTimeStamp}.zip`,

                //파일 Path 와 파일 명 조합 
                folderPath = oPaths.filePaths[0],

                filePath = folderPath + "\\" + fileName; //폴더 경로 + 파일명

            // 방금 선택한 폴더 경로를 저장
            oAPP.attr._filedownFolderPath = folderPath;

            var fileReader = new FileReader();
            fileReader.onload = function(event) {

                var arrayBuffer = event.target.result,
                    buffer = parent.Buffer.from(arrayBuffer);

                //PC DOWNLOAD 
                FS.writeFile(filePath, buffer, {}, (err, res) => {

                    if (err) {
                        parent.showMessage(sap, 10, "E", err.toString());
                        return;
                    }

                    // 파일 다운받은 폴더를 오픈한다.
                    SHELL.showItemInFolder(filePath);

                });

            };

            fileReader.readAsArrayBuffer(data);

        });

    } // end of _fnUspFileDown

    /**************************************************************************
     * [WS30] Tree Table 더블클릭 이벤트
     **************************************************************************/
    function ev_uspTreeItemDblClickEvent(oEvent) {

        var oTarget = oEvent.target,
            $oTreeIcon = $(oTarget).closest(".sapUiTableTreeIcon"),
            $SelectedRow = $(oTarget).closest(".sapUiTableRow");

        if ($oTreeIcon.length || !$SelectedRow.length) {
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

        // 바인딩 정보가 없으면 빠져나간다.
        if (oRow.isEmpty()) {
            return;
        }

        var oCtx = oRow.getBindingContext(),
            aUspTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE");

        if (aUspTreeData) {

            // 이전에 선택한 라인 값을 구한다.
            var oBindBeforeSelect = _fnGetSelectedUspTreeData(aUspTreeData);
            var sCurrOBJKY = oCtx.getObject("OBJKY");

            if (oBindBeforeSelect && oBindBeforeSelect.OBJKY == sCurrOBJKY) {
                return;
            }

        }

        // 변경 사항이 존재 할 경우 질문 팝업 띄우기.
        var IS_CHAG = getAppChangeWs30();
        if (IS_CHAG == 'X') {

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

            parent.showMessage(sap, 40, 'W', sMsg, _fnSaveBeforeLeavEditMsgCb.bind(this, oRow));

            // 현재 떠있는 팝업 창들을 잠시 숨긴다.
            oAPP.fn.fnChildWindowShow(false);

            return;

        }

        // Tree Table Row 데이터 구하기
        fnUspTreeTableRowSelect(oRow);

    } // end of ev_uspTreeItemDblClickEvent

    function _fnSaveBeforeLeavEditMsgCb(oRow, oEvent) {

        // 동작 취소
        if (oEvent == null || oEvent == "CANCEL") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        // 취소인 경우.
        if (oEvent !== "YES") {

            var oUspTree = oRow.getParent(),
                oRowData = oRow.getBindingContext().getObject();

            // 앱 변경 사항 플래그 설정
            oAPP.fn.setAppChangeWs30("");

            // code editor key press 이벤트 설정
            fnCodeEditorKeyPressEvent("X");

            // 좌측 Usp Tree 정보에 변경한 내역이 있을 경우 마지막 저장한 상태로 복원한다.
            oAPP.fn.fnResetUspTree();

            gfSelectRowUpdate = _fnResetUspTreeRowsUpdated.bind(this, oRowData)

            oUspTree.attachRowsUpdated(gfSelectRowUpdate);

            // // Tree Table Row 데이터 구하기            
            // fnUspTreeTableRowSelect(oRow);

            return;

        }

        var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
        oSaveBtn.firePress({
            ISROW: oRow,
        });

    } // end of _fnSaveBeforeLeavEditMsgCb

    /************************************************************************************************************
     * [WS30] App Change 모드 후 저장 팝업에서 취소 했을 경우 모델 원복 후 Tree Table의 RowsUpdated 이벤트
     ************************************************************************************************************/
    function _fnResetUspTreeRowsUpdated(oMeItem, oEvent) {

        console.log("_fnResetUspTree");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i];

            if (oRow.isEmpty()) {
                break;
            }

            var oCtx = oRow.getBindingContext(),
                oRowData = oCtx.getModel().getProperty(oCtx.getPath()),

                // Row의 Object Key            
                sOBJKY = oRowData.OBJKY;

            // 현재 순서의 Row와 선택한 Row가 같을 경우 
            if (sOBJKY === oMeItem.OBJKY) {

                // RowUpdate 이벤트를 해제 한다.
                oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

                gfSelectRowUpdate = undefined;

                fnUspTreeTableRowSelect(oRow);

                return;

            }

        }

        // 호출 횟수 count
        if (typeof gfSelectRowUpdate._callCount === "undefined") {
            gfSelectRowUpdate._callCount = 0;
        } else {
            gfSelectRowUpdate._callCount++;
        }

        // 혹시라도 RowUpdate 호출 횟수가 5회 이상이면 
        // 무한루프를 막기 위한 조치..
        if (gfSelectRowUpdate._callCount >= 5) {
            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);
            gfSelectRowUpdate = undefined;
            return;
        }

        if (typeof gfSelectRowUpdate.iRowLength === "undefined") {
            gfSelectRowUpdate.iRowLength = 0;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        // 스크롤을 이동하여 다시 찾는다.
        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oMeItem);
        }, 0);


    } // end of _fnResetUspTreeRowsUpdated

    /**************************************************************************
     * [WS30] Tree Table Row 데이터 구하기
     **************************************************************************/
    function fnUspTreeTableRowSelect(oRow) {

        var oCtx = oRow.getBindingContext(),
            oRowModel = oRow.getModel(),
            oRowData = oRowModel.getProperty(oCtx.sPath);

        var sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_get_object_line_data`;

        var oSendData = {
            S_HEAD: oRowData
        };

        var oFormData = new FormData();
        oFormData.append("sData", JSON.stringify(oSendData));

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        var oParam = {
            oRow: oRow,
        }

        sendAjax(sPath, oFormData, _fnLineSelectCb.bind(oParam));

    } // end of fnTreeTableRowSelect

    function _fnLineSelectCb(oResult) {

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        parent.setBusy("");

        // JSON Parse 오류 일 경우
        if (typeof oResult !== "object") {

            var sMsg = "[usp_get_object_line_data] JSON Parse Error";

            // Critical Error
            oAPP.fn.fnCriticalErrorWs30({
                RTMSG: sMsg
            });

            return;

        }

        // Normal or Critical Error
        switch (oResult.RETCD) {

            case "Z":

                // Critical Error
                oAPP.fn.fnCriticalErrorWs30(oResult);

                return;

            case "E":

                sap.ui.getCore().unlock(); // 화면 Lock 해제

                parent.setBusy(""); // Busy 종료

                parent.setSoundMsg("02"); // error sound

                // 작업표시줄 깜빡임
                CURRWIN.flashFrame(true);

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

                return;


        }

        // 이전에 선택한 라인이 있다면 해당 라인 선택 아이콘 표시 해제
        fnOnUspTreeUnSelect();

        var oParam = this,
            oRow = oParam.oRow,
            oTable = oRow.getParent(),
            iRowIndex = oRow.getIndex(),
            oRowModel = oRow.getModel(),
            oCtx = oRow.getBindingContext(),
            sCurrBindPath = oCtx.getPath();

        oTable.setSelectedIndex(iRowIndex);

        var oRowBindData = oRowModel.getProperty(sCurrBindPath),
            bIsRoot = oRowBindData.PUJKY === "" ? true : false;

        // 리턴받은 라인 정보
        var oResultRowData = oResult.S_HEAD;
        oResultRowData.ISSEL = true;

        // 서버에서 리턴 받은 라인 정보와 바인딩 되어있는 데이터를 병합
        oResultRowData = jQuery.extend(true, oRowBindData, oResultRowData);

        // 선택한 위치가 Root 여부
        if (bIsRoot) {

            // 현재 APP 정보를 구한다.
            var oAppInfo = fnGetAppInfo();

            // 서버에서 리턴 받은 10번 테이블 정보로 머지 한다.
            oAppInfo = Object.assign({}, oAppInfo, oResult.S_APPINFO);

            // APP 정보 갱신
            APPCOMMON.fnSetModelProperty("/WS30/APP", oAppInfo);

            // Root 일 경우는 APP 정보 까지 Object 복사한다.
            oResultRowData = jQuery.extend(true, oResultRowData, oAppInfo);

            //Root 일 경우 Document 페이지로 이동한다.
            fnOnMoveToPage("USP30");

        } else {

            // Content Page로 이동
            fnOnMoveToPage("USP20");

        }

        // 위에서 병합한 데이터를 복사해서 우측 Content 영역을 복사할 Object 생성
        var oUspData = jQuery.extend(true, {}, oResultRowData);

        oResultRowData.CONTENT = oUspData.CONTENT = oResult.CONTENT;

        // 현재 선택한 좌측 트리 데이터 업데이트
        oRowModel.setProperty(sCurrBindPath, oResultRowData);

        APPCOMMON.fnSetModelProperty("/WS30/USPDATA", oUspData);

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
     * [WS30] 선택한 USP 브라우저 실행
     **************************************************************************/
    function fnTestServiceWs30(oTreeTable) {

        var iIndex = gSelectedTreeIndex,
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if (!oCtx) {
            return;
        }

        var oAppInfo = fnGetAppInfo();

        // Inactivate 상태일 경우 실행하지 않는다
        if (oAppInfo.ACTST == "I") {

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!!

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("W", "WS30", sMsg);

            return;
        }

        var sBindPath = oCtx.getPath(),
            oTreeData = oTreeTable.getModel().getProperty(sBindPath),
            sServicePath = oTreeData.SPATH;

        oAPP.fn.fnExeBrowser(sServicePath);

    } // end of fnTestServiceWs30

    /**************************************************************************
     * [WS30] Usp Description Input Change Event
     **************************************************************************/
    function ev_UspDescInputChangeEvent() {

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    } // end of ev_UspDescInputChangeEvent

    /**************************************************************************
     * [WS30] Usp Charset Input Change Event
     **************************************************************************/
    function ev_UspCharsetInputChangeEvent() {

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    } // end of ev_UspCharsetInputChangeEvent

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
        var oAppInfo = fnGetAppInfo(),

            IS_CHAG = oAppInfo.IS_CHAG,
            IS_EDIT = oAppInfo.IS_EDIT;

        // 변경된 데이터가 없거나 display 모드일 경우 묻지도 말고 바로 빠져나간다.
        if (IS_CHAG != 'X' || IS_EDIT != 'X') {

            // WS10 페이지로 이동        
            fnMoveToWs10();

            return;
        }

        var sMsg = "";
        sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "118"); // Application has been changed
        sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

        // 메시지 질문 팝업을 띄운다.
        parent.showMessage(sap, 40, 'W', sMsg, fnMoveBack_Ws30_To_Ws10Cb);

        // 현재 떠있는 팝업 창들을 잠시 숨긴다.
        oAPP.fn.fnChildWindowShow(false);

        sap.ui.getCore().unlock();

    } // end fofnMoveBack_Ws30_To_Ws10

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

            var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
            if (!oSaveBtn) {
                return;
            }

            // 저장 로직 수행 한다.
            oSaveBtn.firePress({
                ISBACK: "X",
            });

            return;

        }

        // WS10 페이지로 이동
        fnMoveToWs10();

    } // end of ev_pressWs30BackCb

    /**************************************************************************
     * [WS30] 화면 처음 로딩 시, Usp Tree의 Root 정보를 구한다
     **************************************************************************/
    function ev_getRootNodeRowsUpdated(oEvent) {

        var oTable = oEvent.getSource(),
            aRows = oTable.getRows(),
            oRow = aRows[0];

        // 바인딩 정보가 없으면 빠져나간다.
        if (oRow.isEmpty()) {
            return;
        }

        var oCtx = oRow.getBindingContext(),
            oRowBindData = oCtx.getModel().getProperty(oCtx.getPath()),
            bIsRoot = oRowBindData.PUJKY === "" ? true : false;

        if (!bIsRoot) {
            return;
        }

        // Tree Table Row 데이터 구하기
        fnUspTreeTableRowSelect(oRow);

        oTable.detachRowsUpdated(ev_getRootNodeRowsUpdated);

        oTable.focus();

    } // end of ev_getRootNodeRowsUpdated

    /**************************************************************************
     * [WS30] Usp runtime Class Controller Event
     **************************************************************************/
    function ev_pressControllerBtn() {

        var oAppInfo = fnGetAppInfo();

        APPCOMMON.execControllerClass(null, null, null, oAppInfo);

    } // end of ev_pressControllerBtn

    /**************************************************************************
     * [WS30] Application Execute
     **************************************************************************/
    function ev_AppExec() {

        var oAppInfo = fnGetAppInfo();

        // Inactivate 상태일 경우 실행하지 않는다
        if (oAppInfo.ACTST == "I") {

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "031"); // Only in activity state !!!

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("W", "WS30", sMsg);

            return;
        }

        var oUspData = APPCOMMON.fnGetModelProperty("/WS30/USPDATA"),
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "364"); // Application cannot be execution.

        if (!oUspData) {

            // -메시지 출력
            parent.showMessage(sap, 10, "E", sMsg);

            parent.setSoundMsg("02"); // error sound

            return;
        }

        // 폴더 일 경우 실행 하지 않음.
        if (oUspData.ISFLD == "X") {

            // -메시지 출력
            parent.showMessage(sap, 10, "E", sMsg);

            parent.setSoundMsg("02"); // error sound

            return;
        }

        var sExecPath = oUspData.SPATH;

        oAPP.fn.fnExeBrowser(sExecPath);

    } // end of ev_AppExec

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

        zconsole.log("Context Menu");

        var oTreeTable = oEvent.getSource(),
            iSelectRow = oEvent.getParameter("rowIndex"),
            oCtx = oTreeTable.getContextByIndex(iSelectRow),
            oAppInfo = fnGetAppInfo();

        if (!oCtx) {
            return;
        }

        // 현재 테이블의 첫번째 Row의 Index를 구한다.
        var iFirstVisibleRow = oTreeTable.getFirstVisibleRow(),
            oRowData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // 우클릭한 라인 인덱스 값을 글로벌에 잠시 둔다.
        gSelectedTreeIndex = iSelectRow;

        // 우클릭한 위치 selection 효과
        oTreeTable.setSelectedIndex(iSelectRow);

        // wheel 이벤트 막기
        var oScrollArea = oTreeTable.getDomRef("tableCCnt");
        if (oScrollArea) {
            oScrollArea.onwheel = lf_PreventWheel;
        }

        // Usp Tree Mouse Wheel Callback Event
        function lf_PreventWheel(e) {
            oTreeTable.setFirstVisibleRow(iFirstVisibleRow);
        };

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

        // // [test] UspTree Node의 접힘/펼침 상태 값을 모델에 저장
        // oTreeTable.attachRowsUpdated(_fnUspNodeExpCollStatusMarkFlagToModel);

    } // end of ev_beforeOpenContextMenu

    /**************************************************************************
     * [WS30] USP Tree ContextMeny Close 이벤트
     **************************************************************************/
    function ev_UspTreeCtxMenuClosed(oEvent) {

        zconsole.log("contextMenu Close");

        var oTreeTable = sap.ui.getCore().byId("usptree");
        if (!oTreeTable) {
            return;
        }

        // // [test] UspTree Node의 접힘/펼침 상태 값을 모델에 저장
        // oTreeTable.detachRowsUpdated(_fnUspNodeExpCollStatusMarkFlagToModel);

        // USP TREE 마우스 휠 이벤트 풀기
        var aa = oTreeTable.getDomRef("tableCCnt");
        aa.onwheel = () => {};

    } // end of ev_UspTreeCtxMenuClosed

    /**************************************************************************
     * [WS30] Display 모드에서의 ContextMenu 구성
     **************************************************************************/
    function _ev_beforeOpenContextMenuDisplay(oRowData, aCtxMenu) {

        aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false; // Create
        aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false; // Delete        
        aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false; // Test Service
        aCtxMenu.find(arr => arr.KEY == "K7").ENABLED = false; // Rename
        aCtxMenu.find(arr => arr.KEY == "K8").ENABLED = false; // Up
        aCtxMenu.find(arr => arr.KEY == "K9").ENABLED = false; // Down
        aCtxMenu.find(arr => arr.KEY == "K10").ENABLED = false; // Move Position
        aCtxMenu.find(arr => arr.KEY == "K11").ENABLED = false; // new window usp Page

        // root가 아니면서 폴더가 아닐경우 (파일일 경우에만) 
        // 다운로드 버튼, Test Service 버튼을 활성화 한다.
        if (oRowData.PUJKY != "" && oRowData.ISFLD == "") {

            aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = true; // Test Service
            aCtxMenu.find(arr => arr.KEY == "K11").ENABLED = true; // new window usp Page
        }

        APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

    } // end of _ev_beforeOpenContextMenuDisplay

    /**************************************************************************
     * [WS30] Change 모드에서의 ContextMenu 구성
     **************************************************************************/
    function _ev_beforeOpenContextMenuChange(oRowData, aCtxMenu) {

        // 우클릭한 위치가 ROOT 일 경우 생성 버튼만 활성화 한다.
        if (oRowData.PUJKY == "") {

            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false; // Delete            
            aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false; // Test Service
            aCtxMenu.find(arr => arr.KEY == "K7").ENABLED = false; // Rename
            aCtxMenu.find(arr => arr.KEY == "K8").ENABLED = false; // Up
            aCtxMenu.find(arr => arr.KEY == "K9").ENABLED = false; // Down
            aCtxMenu.find(arr => arr.KEY == "K10").ENABLED = false; // Move Position
            aCtxMenu.find(arr => arr.KEY == "K11").ENABLED = false; // new window usp Page

            APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

            return;

        }

        // 우클릭한 위치가 폴더일 경우
        if (oRowData.ISFLD == "X") {

            aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false; // Test Service
            aCtxMenu.find(arr => arr.KEY == "K11").ENABLED = false; // new window usp Page

            APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

            return;

        }

        // 우클릭한 위치가 파일 레벨인 경우        
        aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false; // Create

        APPCOMMON.fnSetModelProperty("/WS30/CTXMENU", aCtxMenu);

    } // end of _ev_beforeOpenContextMenuChange

    /**************************************************************************
     * [WS30] Usp Tree Table 펼치기 이벤트
     **************************************************************************/
    function ev_UspTreeTableExpand(oEvent) {

        var oTreeTable = oEvent.getSource().getParent().getParent();
        if (!oTreeTable) {
            return;
        }

        // tree table 펼침 공통 메소드
        fnCommonUspTreeTableExpand(oTreeTable);

    } // end of ev_UspTreeTableExpand

    /**************************************************************************
     * [WS30] Usp Tree Table 접기 이벤트
     **************************************************************************/
    function ev_UspTreeTableCollapse(oEvent) {

        var oTreeTable = oEvent.getSource().getParent().getParent();
        if (!oTreeTable) {
            return;
        }

        fnCommonUspTreeTableCollapse(oTreeTable);

    } // end of ev_MimeTreeTableCollapse

    /**************************************************************************
     * [WS30] Usp Tree Table 펼침 공통 이벤트
     **************************************************************************/
    function fnCommonUspTreeTableExpand(oTreeTable, gIndex) {

        var iSelIdx = -1;
        if (typeof gIndex !== "undefined") {

            iSelIdx = gIndex;

        } else {

            iSelIdx = oTreeTable.getSelectedIndex();

        }

        var oCtx = oTreeTable.getContextByIndex(iSelIdx);
        if (!oCtx) {
            return;
        }

        var oData = oCtx.getModel().getProperty(oCtx.getPath());

        if (oData.PUJKY == "") {
            oTreeTable.expandToLevel(99);
            return;
        }

        var aCHILDTREE = oData.USPTREE,
            iTreeCnt = aCHILDTREE.length;

        var iSelIndex = iSelIdx;

        if (iTreeCnt >= 0) {
            oTreeTable.expand(iSelIndex);
        }

        function lf_expand(aCHILDTREE) {

            var iTreeCnt = aCHILDTREE.length;
            if (iTreeCnt == 0) {
                return;
            }

            for (var i = 0; i < iTreeCnt; i++) {

                iSelIndex++;

                var oChild = aCHILDTREE[i],
                    aChild = oChild.USPTREE,
                    iChildCnt = aChild.length;

                if (iChildCnt != 0) {
                    oTreeTable.expand(iSelIndex);
                    lf_expand(aChild);
                }

            }

        } // end of lf_expand

        lf_expand(aCHILDTREE);

    }; // end of fnCommonMimeTreeTableExpand

    /**************************************************************************
     * [WS30] Usp Tree Table 접기 공통 이벤트
     **************************************************************************/
    function fnCommonUspTreeTableCollapse(oTreeTable, gIndex) {

        var iSelIdx = -1;
        if (typeof gIndex !== "undefined") {

            iSelIdx = gIndex;

        } else {

            iSelIdx = oTreeTable.getSelectedIndex();

        }

        var oCtx = oTreeTable.getContextByIndex(iSelIdx);
        if (!oCtx) {
            return;
        }

        oTreeTable.collapse(iSelIdx);

    }; // end of oAPP.fn.fnCommonMimeTreeTableCollapse

    /**************************************************************************
     * [WS30] USP Tree ContextMenu Click Event
     **************************************************************************
     * K1: Expand Subtree
     * K2: Collapse Subtree
     * K3: Create
     * K4: Delete
     * K5: Download
     * K6: Test Service
     * K7: Rename
     * K8: Up
     * K9: Down
     * K10: Move Position
     * K11: new window usp Page
     * K12: Upload
     ***************************************************************************/
    function ev_UspTreeCtxMenuClick(oEvent) {

        // contextmenu의 선택한 메뉴 정보를 구한다.
        var oTreeTable = oEvent.getSource().getParent(),
            oCtxMenuItm = oEvent.getParameter("item"),
            sCtxMenuKey = oCtxMenuItm.getProperty("key");

        switch (sCtxMenuKey) {

            case "K1": // Expand Subtree

                // tree table 펼침 공통 메소드
                fnCommonUspTreeTableExpand(oTreeTable, gSelectedTreeIndex);

                break;

            case "K2": // Collapse Subtree

                // tree table 접힘 공통 메소드
                fnCommonUspTreeTableCollapse(oTreeTable, gSelectedTreeIndex);

                break;

            case "K3": // create

                // Usp 생성 시, 현재 Change가 된 상태인지 확인.
                // 변경 사항이 존재 할 경우 질문 팝업 띄우기.
                var IS_CHAG = getAppChangeWs30();
                if (IS_CHAG == 'X') {

                    var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

                    parent.showMessage(sap, 40, 'W', sMsg, _fnCreateUspAppChangeMsgCB.bind(this, oTreeTable));

                    // 현재 떠있는 팝업 창들을 잠시 숨긴다.
                    oAPP.fn.fnChildWindowShow(false);

                    return;

                }

                fnCreateUspNodePopup(oTreeTable);

                break;

            case "K4": // delete

                fnDeleteUspNode(oTreeTable);

                break;

            case "K5": // File Down

                fnOnDownloadUspFiles(oTreeTable);

                break;

            case "K6": // Test Service

                fnTestServiceWs30(oTreeTable);

                break;

            case "K7": // Rename

                // Usp 생성 시, 현재 Change가 된 상태인지 확인.
                // 변경 사항이 존재 할 경우 질문 팝업 띄우기.
                var IS_CHAG = getAppChangeWs30();
                if (IS_CHAG == 'X') {

                    var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

                    parent.showMessage(sap, 40, 'W', sMsg, _fnRenameUspAppChangeMsgCB.bind(this, oTreeTable));

                    // 현재 떠있는 팝업 창들을 잠시 숨긴다.
                    oAPP.fn.fnChildWindowShow(false);

                    return;

                }

                fnRenameUspNodePopup(oTreeTable);

                break;

            case "K8": // Up

                oAPP.fn.fnUspTreeNodeMoveUp(oTreeTable, gSelectedTreeIndex);

                break;

            case "K9": // Down

                oAPP.fn.fnUspTreeNodeMoveDown(oTreeTable, gSelectedTreeIndex);

                break;

            case "K10": // Move Position

                oAPP.fn.fnUspTreeNodeMovePosition(oTreeTable, gSelectedTreeIndex);

                break;

            case "K11": // new window

                // oAPP.fn.fnUspNewWindow(oTreeTable, gSelectedTreeIndex);

                sap.m.MessageToast.show("준비중입니다.");

                break;

                // case "K12": // Upload

                //     sap.m.MessageToast.show("준비중입니다.");

                //     break;

            default:
                sap.m.MessageToast.show("준비중입니다.");
                break;

        }

    } // end of ev_UspTreeCtxMenuClick   

    /**************************************************************************
     * [WS30] USP 생성 전 APP Change가 있을 경우 메시지 팝업 콜백 이벤트
     **************************************************************************/
    function _fnCreateUspAppChangeMsgCB(oTreeTable, oEvent) {

        // 동작 취소
        if (oEvent == null || oEvent == "CANCEL") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        // 아니오 일 경우
        if (oEvent !== "YES") {

            // 저장 취소 공통 메소드
            _fnSaveCancel(oTreeTable);

            // USP 생성 팝업 띄우기
            fnCreateUspNodePopup(oTreeTable);

            return;

        }

        // 저장 후 생성 팝업띄우는 프로세스일 경우.

        // 좌측 트리 데이터를 구한다.
        var aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
            aUspTreeData = jQuery.extend(true, [], aTreeData),
            aUspTreeData = _parseTree2Tab(aUspTreeData, "USPTREE"),

            oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");

        oSaveBtn.firePress({
            AFPRC: "C",
            TREEDATA: aUspTreeData,
            oTreeTable: oTreeTable
        });

    } // end of _fnCreateUspAppChangeMsgCB

    /**************************************************************************
     * [WS30] USP Rename 전 APP Change가 있을 경우 메시지 팝업 콜백 이벤트
     **************************************************************************/
    function _fnRenameUspAppChangeMsgCB(oTreeTable, oEvent) {

        // 동작 취소.
        if (oEvent == null || oEvent == "CANCEL") {

            // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
            oAPP.fn.fnChildWindowShow(true);

            return;
        }

        // 취소했을 경우.
        if (oEvent !== "YES") {

            // // 앱 변경 사항 플래그 설정
            // oAPP.fn.setAppChangeWs30("");

            // // code editor key press 이벤트 설정
            // fnCodeEditorKeyPressEvent("X");

            // // 이전에 선택 표시된 USP Tree Node 선택 해제
            // fnOnUspTreeUnSelect();

            // // 우측 에디터 영역을 메인 페이지로 이동
            // fnOnMoveToPage("USP10");

            // 저장 취소 공통 메소드
            _fnSaveCancel(oTreeTable);

            // USP 생성 팝업 띄우기
            fnRenameUspNodePopup(oTreeTable);

            return;

        }

        // 좌측 트리 데이터를 구한다.
        var aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
            aUspTreeData = jQuery.extend(true, [], aTreeData),
            aUspTreeData = _parseTree2Tab(aUspTreeData, "USPTREE"),

            oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");

        oSaveBtn.firePress({
            AFPRC: "RN",
            TREEDATA: aUspTreeData,
            oTreeTable: oTreeTable
        });

    } // end of _fnRenameUspAppChangeMsgCB

    // /**************************************************************************
    //  * [WS30] USP 삭제 전 APP Change가 있을 경우 메시지 팝업 콜백 이벤트
    //  **************************************************************************/
    // function _fnDeleteUspAppChangeMsgCB(oTreeTable, oEvent) {

    //     // 동작 취소.
    //     if (oEvent == null || oEvent == "CANCEL") {

    //         // 현재 떠있는 팝업 창이 있었고 숨김 처리 되있었다면 다시 활성화 시킨다.
    //         oAPP.fn.fnChildWindowShow(true);

    //         return;
    //     }

    //     // 취소했을 경우.
    //     if (oEvent !== "YES") {

    //         // 이전에 선택 표시된 Node 정보 구하기
    //         // var oTreeModel = oTreeTable.getModel(),
    //         //     aUspTreeData = oTreeModel.getProperty("/WS30/USPTREE");

    //         // var oBindBeforeSelect = _fnGetSelectedUspTreeData(aUspTreeData);
    //         // if (oBindBeforeSelect) {

    //         //     var oUspData = APPCOMMON.fnGetModelProperty("/WS30/USPDATA");

    //         //     oUspData.DESCT = oBindBeforeSelect.DESCT;
    //         //     oUspData.CONTENT = oBindBeforeSelect.CONTENT;

    //         //     oTreeModel.refresh();

    //         // }

    //         // // 앱 변경 사항 플래그 설정
    //         // oAPP.fn.setAppChangeWs30("");

    //         // // code editor key press 이벤트 설정
    //         // fnCodeEditorKeyPressEvent("X");

    //         // // 이전에 선택 표시된 USP Tree Node 선택 해제
    //         // fnOnUspTreeUnSelect();

    //         // // 우측 에디터 영역을 메인 페이지로 이동
    //         // fnOnMoveToPage("USP10");

    //         // 저장 취소
    //         _fnSaveCancel(oTreeTable);

    //         // Usp 삭제 팝업 띄우기
    //         fnDeleteUspNode(oTreeTable);

    //         return;

    //     }

    //     // 좌측 트리 데이터를 구한다.
    //     var aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
    //         aUspTreeData = jQuery.extend(true, [], aTreeData),
    //         aUspTreeData = _parseTree2Tab(aUspTreeData, "USPTREE"),

    //         // 저장 후 삭제 프로세스를 태운다.
    //         oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");

    //     oSaveBtn.firePress({
    //         AFPRC: "D",
    //         TREEDATA: aUspTreeData,
    //         oTreeTable: oTreeTable
    //     });

    // } // end of _fnDeleteUspAppChangeMsgCB

    /**************************************************************************
     * [WS30] 저장 취소 공통 메소드
     **************************************************************************/
    function _fnSaveCancel(oTreeTable) {

        // 이전에 선택 표시된 Node 정보 구하기
        var oTreeModel = oTreeTable.getModel(),
            aUspTreeData = oTreeModel.getProperty("/WS30/USPTREE");

        var oBindBeforeSelect = _fnGetSelectedUspTreeData(aUspTreeData);
        if (oBindBeforeSelect) {

            var oUspData = APPCOMMON.fnGetModelProperty("/WS30/USPDATA");

            oUspData.DESCT = oBindBeforeSelect.DESCT;
            oUspData.CONTENT = oBindBeforeSelect.CONTENT;

            oTreeModel.refresh();

        }

        // 좌측 Usp Tree 정보에 변경한 내역이 있을 경우 마지막 저장한 상태로 복원한다.
        oAPP.fn.fnResetUspTree();

        // 앱 변경 사항 플래그 설정
        oAPP.fn.setAppChangeWs30("");

        // code editor key press 이벤트 설정
        fnCodeEditorKeyPressEvent("X");

    } // end of _fnSaveCancel

    /**************************************************************************
     * [WS30] 이전에 선택 표시된 USP Tree Node 선택 해제
     **************************************************************************/
    function fnOnUspTreeUnSelect() {

        var aUspTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE");
        if (!aUspTreeData) {
            return;
        }

        if (aUspTreeData instanceof Array == false) {
            return;
        }

        // 이전에 선택 표시된 Node 정보 구하기
        var oBindBeforeSelect = _fnGetSelectedUspTreeData(aUspTreeData);
        if (!oBindBeforeSelect) {
            return;
        }

        oBindBeforeSelect.ISSEL = false;

        sap.ui.getCore().getModel().refresh();

    } // end of fnOnUspTreeUnSelect

    /**************************************************************************
     * [WS30] USP Create Node Accept Event
     **************************************************************************/
    function ev_createUspNodeAcceptEvent(oTreeTable, oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var sBindRootPath = "/WS30/USPCRT";

        // USP 생성 팝업의 입력 값 구하기
        var oCrateData = APPCOMMON.fnGetModelProperty(sBindRootPath);

        oCrateData.NAME_VS = "";
        oCrateData.NAME_VSTXT = "";

        // 생성 팝업 입력값 체크
        var oResult = _fnCheckCreateNodeData(oCrateData);
        if (oResult.RETCD == "E") {

            // 오류난 Input에 focus를 줘서 ValueState Text가 잘 보이도록 만든다.
            var oCrnameInput = sap.ui.getCore().byId("ws30_crname");
            if (oCrnameInput) {
                oCrnameInput.focus();
            }

            // Value State 설정
            oCrateData.NAME_VS = sap.ui.core.ValueState.Error;
            oCrateData.NAME_VSTXT = oResult.RTMSG;

            APPCOMMON.fnSetModelProperty(sBindRootPath, oCrateData, true);

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var oCtx = oTreeTable.getContextByIndex(gSelectedTreeIndex);
        if (!oCtx) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        var oTreeModel = oTreeTable.getModel(),
            oRowData = oTreeModel.getProperty(oCtx.sPath);

        // 같은 레벨에서의 이름 중복 확인
        // var oDup = oRowData.USPTREE.find(arr => arr.OBDEC.toLowerCase() == oCrateData.NAME.toLowerCase());
        var oDup = oRowData.USPTREE.find(arr => arr.OBDEC == oCrateData.NAME);
        if (oDup) {

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "004"); // Duplicate filename exists.

            // Value State 설정
            oCrateData.NAME_VS = sap.ui.core.ValueState.Error;
            oCrateData.NAME_VSTXT = sMsg;

            APPCOMMON.fnSetModelProperty(sBindRootPath, oCrateData, true);

            parent.setSoundMsg("02"); // error sound

            // 작업표시줄 깜빡임
            CURRWIN.flashFrame(true);

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", sMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        var oAppInfo = fnGetAppInfo(),
            sRandomKey = oAppInfo.APPID + "|" + RANDOM.generateBase30(34),
            oNewRowData = jQuery.extend(true, {}, oRowData);

        oNewRowData = _fnClearNewRowData(oNewRowData);

        oNewRowData.PUJKY = oRowData.OBJKY;
        oNewRowData.OBJKY = sRandomKey;
        oNewRowData.APPID = oRowData.APPID;
        oNewRowData.ISFLD = oCrateData.ISFLD ? "X" : "";
        oNewRowData.OBDEC = oCrateData.NAME;
        oNewRowData.DESCT = oCrateData.DESC;
        oNewRowData.CODPG = oCrateData.CODPG; // charset
        oNewRowData.ISSEL = false;
        oNewRowData.SPATH = `${oRowData.SPATH}/${oCrateData.NAME}`;

        // 폴더가 아닐 경우 파일 확장자와 MIME TYPE을 구한다.
        if (oCrateData.ISFLD == false) {

            oNewRowData.MIME = MIMETYPES.lookup(oCrateData.NAME);
            oNewRowData.EXTEN = APPCOMMON.fnGetFileExt(oCrateData.NAME);

        }

        oNewRowData.USPTREE = [];

        // 좌측 트리 데이터를 구한다.
        var aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"),
            aUspTreeData = jQuery.extend(true, [], aTreeData);

        aUspTreeData = _parseTree2Tab(aUspTreeData, "USPTREE");

        aUspTreeData.push(oNewRowData);

        var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
        oSaveBtn.firePress({
            AFPRC: "_C",
            PRCCD: "01", // 01: Create, 02: SAVE, 03: RENAME
            oTreeTable: oTreeTable,
            oNewRowData: oNewRowData,
            TREEDATA: aUspTreeData,
        });

    } // end of ev_createUspNodeAcceptEvent

    /**************************************************************************
     * [WS30] 신규 생성된 Usp Node 화면에 반영
     **************************************************************************/
    function _fnCreateUspNode(oEvent) {

        let oTreeTable = oEvent.getParameter("oTreeTable"),
            oNewRowData = oEvent.getParameter("oNewRowData"); // 신규 등록한 데이터

        let iSelectedIndex = gSelectedTreeIndex,
            oSelectedCtx = oTreeTable.getContextByIndex(iSelectedIndex);

        if (!oSelectedCtx) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        let oSelectedCtxModel = oSelectedCtx.getModel(),
            oRowData = oSelectedCtxModel.getProperty(oSelectedCtx.sPath);

        oRowData.USPTREE.push(oNewRowData);

        oSelectedCtxModel.refresh(true);

        // 현재 선택한 노드 펼침
        oTreeTable.expand(gSelectedTreeIndex);

        // USP 신규 생성된 Row에 선택 표시
        gfSelectRowUpdate = ev_selectMarkNewRowUpdated.bind(this, oNewRowData);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

    } // end of _fnCreateUspNode

    /**************************************************************************
     * [WS30] USP 신규 생성된 Row에 선택 표시
     **************************************************************************/
    function ev_selectMarkNewRowUpdated(oRowData, oEvent) {

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i];

            // 바인딩 정보가 없으면 빠져나간다.
            if (oRow.isEmpty()) {
                continue;
            }

            var oCtx = oRow.getBindingContext(),
                sOBJKY = oCtx.getObject("OBJKY");

            if (sOBJKY !== oRowData.OBJKY) {
                continue;
            }

            // Intro Page 로 이동
            fnOnMoveToPage("USP10");

            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

            gfSelectRowUpdate = undefined;

            // 신규 생성된 Node의 Content 정보를 구한다.
            fnUspTreeTableRowSelect(oRow);

            // 생성 팝업 닫기
            ev_createUspDlgCloseEvent();

            return;
        }

        if (!gfSelectRowUpdate.iRowLength) {
            gfSelectRowUpdate.iRowLength = iRowLength;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oRowData);
        }, 0);

    } // end of ev_selectRowUpdated

    function _fnClearNewRowData(oRowData) {

        for (var i in oRowData) {
            oRowData[i] = "";
        }

        return oRowData;

    } // end of _fnClearNewRowData

    /**************************************************************************
     * [WS30] 생성 팝업 입력값 체크
     **************************************************************************/
    function _fnCheckCreateNodeData(oCrateData) {

        let oCheck = {};

        let sName = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C11"), // Name
            sNameRequiredMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "050", sName); // & is required.

        // 입력값 존재 여부 확인
        if (!oCrateData || !oCrateData.NAME) {

            oCheck.RETCD = "E";
            oCheck.RTMSG = sNameRequiredMsg; //"Name is Required!";

            return oCheck;
        }

        // 입력값 공백 여부 확인
        if (parent.isEmpty(oCrateData.NAME) === true || parent.isBlank(oCrateData.NAME) === true) {

            oCheck.RETCD = "E";
            oCheck.RTMSG = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "358"); // 공백문자를 포함할 수 없습니다.

            return oCheck;

        }

        // 공백 입력 확인
        let blank_pattern = /[\s]/gi;
        if (blank_pattern.test(oCrateData.NAME) == true) {

            oCheck.RETCD = "E";
            oCheck.RTMSG = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "358"); // 공백문자를 포함할 수 없습니다.

            return oCheck;

        }

        // 특수문자 전체
        // var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;


        // 특수문자가 있는 경우 (허용 특수문자 ==> 언더바[_] 또는 점[.])
        var special_pattern = /[\{\}\[\]\/?,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
        if (special_pattern.test(oCrateData.NAME) == true) {

            oCheck.RETCD = "E";
            oCheck.RTMSG = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "359"); // 특수문자를 포함할 수 없습니다.

            return oCheck;

        }

        // 영문으로 시작해서 숫자 및 _ 만 허용 
        // var engNum = /^[a-zA-Z]+[a-z0-9A-Z|_]/;
        var engNum = /^[a-zA-Z]|^[a-zA-Z]+[a-z0-9A-Z|_]/;
        if (engNum.test(oCrateData.NAME) == false) {

            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "362"); // You can only English can be the first character
            sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "361"); // You can only English + numbers can be entered

            oCheck.RETCD = "E";
            oCheck.RTMSG = sMsg;
            // oCheck.RTMSG = "Only English + numbers can be entered and only English can be the first character.";

            return oCheck;

        }

        // 폴더 일 경우 특수문자 체크
        if (oCrateData.ISFLD == true) {

            // 폴더일 경우 추가 특수문자 체크 
            var special_pattern = /[.]/gi;
            if (special_pattern.test(oCrateData.NAME) == true) {

                oCheck.RETCD = "E";
                oCheck.RTMSG = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "359"); // 특수문자를 포함할 수 없습니다.

                return oCheck;

            }

        }
        // 파일 일 경우 파일명 체크
        else {

            // 파일명에 확장자가 있는지 체크..            
            var path = oCrateData.NAME;
            let file = path.substring(path.lastIndexOf('\\') + 1, path.length);

            let filename;
            let exp;
            if (file.indexOf('.') >= 0) {
                filename = file.substring(0, file.lastIndexOf('.'));
                exp = file.substring(file.lastIndexOf('.') + 1, file.length);
            } else {
                filename = file;
                exp = '';
            }

            var sCheck = MIMETYPES.lookup(oCrateData.NAME);

            if ((typeof sCheck == "boolean" && sCheck == false) || exp == '') {

                let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "360");
                sMsg += " ex) aaa.txt, aaa.js..";

                oCheck.RETCD = "E";
                oCheck.RTMSG = sMsg; // Invalid MimeType! Check the extension of the file name. ex) aaa.txt, aaa.js..";

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
     * [WS30] Activate Button
     **************************************************************************/
    function ev_pressActivateBtn(oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
        if (!oSaveBtn) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        oSaveBtn.firePress({
            IS_ACT: "X"
        });

    } // end of ev_pressActivateBtn

    /**************************************************************************
     * [WS30] Save Button
     **************************************************************************/
    function ev_pressSaveBtn(oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        var oLocalEvent = new sap.ui.base.Event(),
            oNewEvent = jQuery.extend(true, oLocalEvent, oEvent);

        var oAppData = fnGetAppInfo(),
            IS_ACT = oEvent.getParameter("IS_ACT"),
            TRKORR = oEvent.getParameter("TRKORR"),
            PRCCD = oEvent.getParameter("PRCCD"),
            sReqNo = "";

        // 기존에 CTS 번호가 있을 경우
        if (oAppData.REQNO != "") {
            sReqNo = oAppData.REQNO;
        }

        // CTS 팝업에서 선택한 CTS 번호가 있을 경우.
        if (TRKORR) {
            sReqNo = TRKORR;
        }

        // 저장 구조
        var oSaveData = {
            APPID: oAppData.APPID,
            TRKORR: sReqNo,
            PRCCD: PRCCD || "02",
            IS_ACT: IS_ACT || "",
            S_CONTENT: {},
            T_TREE: [],
            TU4A0010: oAppData
        };

        // 우측 컨텐츠 데이터를 읽는다.
        var oContent = APPCOMMON.fnGetModelProperty("/WS30/USPDATA"),
            aUspTreeData = oEvent.getParameter("TREEDATA");

        if (!aUspTreeData) {
            var aTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE");
            aUspTreeData = jQuery.extend(true, [], aTreeData);
            aUspTreeData = _parseTree2Tab(aUspTreeData, "USPTREE");
        }

        var iUspTreeLength = aUspTreeData.length;

        // 저장 당시 활성화 되어 있는 content 데이터가 존재 할 경우.
        var oBeforeSelectData = aUspTreeData.find(arr => arr.ISSEL == true);

        if (oBeforeSelectData) {

            var sOBJKY = oBeforeSelectData.OBJKY;

            for (var i = 0; i < iUspTreeLength; i++) {

                var oUspTreeItem = aUspTreeData[i];
                if (oUspTreeItem.OBJKY != sOBJKY) {
                    continue;
                }

                oUspTreeItem.CODPG = oContent.CODPG;
                oUspTreeItem.DESCT = oContent.DESCT;

                break;

            }

            oSaveData.S_CONTENT = oContent;

        }

        oSaveData.T_TREE = aUspTreeData;

        var sServerPath = parent.getServerPath(),
            sPath = `${sServerPath}/usp_save_active_appdata`;

        var oFormData = new FormData();
        oFormData.append("APPDATA", JSON.stringify(oSaveData));

        sendAjax(sPath, oFormData, _fnSaveCallback.bind(oNewEvent));

    } // end of ev_pressSaveBtn

    /**************************************************************************
     * [WS30] 저장 콜백
     **************************************************************************/
    function _fnSaveCallback(oResult) {

        // JSON Parse 오류 일 경우
        if (typeof oResult !== "object") {

            parent.setSoundMsg("02"); // error sound

            var sMsg = "[usp_save_active_appdata] JSON Parse Error";

            // Critical Error
            oAPP.fn.fnCriticalErrorWs30({
                RTMSG: sMsg
            });

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        // 전달 받은 파라미터 확인 점검..
        var oEvent = this,
            oNewEvent = oEvent,
            pAFPRC = oEvent.getParameter("AFPRC"),
            pISBACK = oEvent.getParameter("ISBACK"),
            pISROW = oEvent.getParameter("ISROW"),
            pISDISP = oEvent.getParameter("ISDISP"),
            pIS_ACT = oEvent.getParameter("IS_ACT"),
            oTreeTable = oEvent.getParameter("oTreeTable");

        // Normal or Critical Error!
        switch (oResult.RETCD) {

            case "Z":

                parent.setSoundMsg("02"); // error sound

                // [WS30] Critical Error
                oAPP.fn.fnCriticalErrorWs30(oResult);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            case "E":

                parent.setSoundMsg("02"); // error sound

                // 작업표시줄 깜빡임
                CURRWIN.flashFrame(true);

                // 서버에서 만든 스크립트가 있다면 eval 처리.
                if (oResult.SCRIPT) {

                    eval(oResult.SCRIPT);

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    return;
                }

                // Footer Msg 출력
                APPCOMMON.fnShowFloatingFooterMsg("E", "WS30", oResult.RTMSG);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
        }

        // 서버에서 만든 스크립트가 있다면 eval 처리.
        if (oResult.SCRIPT) {

            eval(oResult.SCRIPT);

        } else {

            // Footer Msg 출력
            APPCOMMON.fnShowFloatingFooterMsg("S", "WS30", oResult.RTMSG);

        }

        parent.setSoundMsg("01"); // success sound

        // 저장 성공 후 앱 상태 변경 플래그 해제
        oAPP.fn.setAppChangeWs30("");

        // 마지막 저장 전의 Usp Tree 정보를 초기화 한다.
        oAPP.fn.fnClearOnBeforeUspTreeData();

        // Activate로 들어왔을 경우 상단에 APP 상태 정보 변경
        if (pIS_ACT == "X") {

            setAppActive("X");

        }

        // WS30 페이지 Lock 풀고 Display Mode로 전환
        if (pISDISP == 'X') {

            fnSetAppDisplayMode();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 저장 하고 10번으로 이동할 경우
        if (pISBACK == "X") {

            // WS10 페이지로 이동
            fnMoveToWs10();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        var oAppInfo = fnGetAppInfo(), // App 정보
            oContent = APPCOMMON.fnGetModelProperty("/WS30/USPDATA"), // 우측 컨텐츠 데이터
            aUspTreeData = APPCOMMON.fnGetModelProperty("/WS30/USPTREE"); // 좌측 Tree 데이터

        // APP 업데이트 정보 갱신
        oAppInfo = Object.assign({}, oAppInfo, oResult.S_RETURN);

        // 저장 당시 활성화 되어 있는 content 데이터가 존재 할 경우.
        var oBeforeSelectData = _fnGetSelectedUspTreeData(aUspTreeData);

        if (oBeforeSelectData) {

            oBeforeSelectData.DESCT = oContent.DESCT;

            // 우측에 활성화 되어 있는 Content 정보가 ROOT 정보 라면..
            var bIsRoot = oBeforeSelectData.PUJKY === "" ? true : false;
            if (bIsRoot) {
                // 우측 컨텐트 영역과 좌측 Root에 정보 업데이트
                oContent = Object.assign({}, oContent, oResult.S_RETURN);
                oBeforeSelectData = Object.assign({}, oBeforeSelectData, oResult.S_RETURN);
            }

        }

        // TREE 모델 갱신
        sap.ui.getCore().getModel().refresh();

        // code editor KeyPress 이벤트 설정
        fnCodeEditorKeyPressEvent("X");

        // // Footer Msg 출력
        // APPCOMMON.fnShowFloatingFooterMsg("S", "WS30", sMsg);

        switch (pAFPRC) {

            case "_C": // 신규 생성일 경우.     

                _fnCreateUspNode(oEvent);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            case "C": // 저장 후 프로세스가 신규 생성일 경우.

                fnCreateUspNodePopup(oTreeTable);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            case "D": // 저장 후 프로세스가 삭제 일 경우.

                fnDeleteUspNode(oTreeTable);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

            case "_RN": //rename 일 경우.

                fnRenameUspNode(oEvent);

                return;

            case "RN": // 저장 후 프로세스가 Rename 일 경우.             

                fnRenameUspNodePopup(oTreeTable);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;

                // case "UP": // 저장 후 선택한 Node를 위로 이동할 경우.

                //     oAPP.fn.fnUspTreeNodeMoveUp(oTreeTable, gSelectedTreeIndex);

                //     return;

                // case "DOWN": // 저장 후 선택한 Node를 아래로 이동할 경우.

                //     oAPP.fn.fnUspTreeNodeMoveDown(oTreeTable, gSelectedTreeIndex);

                //     return;
        }

        // EDIT 모드에서 다른 CONTENT 선택시 저장하고 넘어가려는 경우
        if (pISROW) {

            var oRow = pISROW,
                iRowIndex = oRow.getIndex(),
                oTable = oRow.getParent();

            oTable.setSelectedIndex(iRowIndex);

            // Row Select 
            fnUspTreeTableRowSelect(oRow);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

    } // end of _fnSaveCallback

    function fnRenameUspNode(oEvent) {

        debugger;

        let oTreeTable = oEvent.getParameter("oTreeTable"),
            aChangedData = oEvent.getParameter("CHANGEDATA"), // Rename 변경 대상 Array
            aTreeData = oEvent.getParameter("TREEDATA"); // 전체 Tree Data Array

        var iSelectedIndex = gSelectedTreeIndex,
            oSelectedCtx = oTreeTable.getContextByIndex(iSelectedIndex);

        if (!oSelectedCtx) {

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;

        }

        let aTreeDataCopy = jQuery.extend(true, [], aTreeData), // 테이블 전체 데이터 복사
            aChangedDataCopy = jQuery.extend(true, [], aChangedData), // 변경 대상 데이터 복사
            oChangedModelData = _fnChangedDataToTreeModel(aTreeDataCopy, aChangedDataCopy); // 합쳐서 트리구조 모델데이터 만든거


        let oChangeNodeData = oAPP.fn._fnFindModelData2(oChangedModelData, oSelectedCtx.getPath()),
            aNodes = oChangeNodeData.Nodes;

        let oOBJKY = oSelectedCtx.getObject("OBJKY"),
            oFoundNode = aNodes.find(elem => elem.OBJKY === oOBJKY);

        if (!oFoundNode) {

            // busy 끄고 Lock 풀기            
            oAPP.common.fnSetBusyLock("");

            return;

        }

        oSelectedCtx.getModel().setProperty(oSelectedCtx.getPath(), oFoundNode);
        oSelectedCtx.getModel().refresh();

        // Rename 팝업 닫기
        var oDialog = sap.ui.getCore().byId("uspRNPopup");
        if (oDialog) {
            oDialog.close();
        }

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

    } // end of fnRenameUspNode

    function _fnChangedDataToTreeModel(aTreeData, aChangedData) {

        debugger;

        // 기존 전체 테이블 데이터 중에서 변경 대상 데이터와 같은 키인것 제거
        let iChangedDataLength = aChangedData.length;

        for (var i = 0; i < iChangedDataLength; i++) {

            let oChangedData = aChangedData[i];

            let iFind = aTreeData.findIndex(elem => elem.OBJKY === oChangedData.OBJKY);
            if (iFind < 0) {
                continue;
            }

            aTreeData.splice(iFind, 1);

        }

        // 기존 전체 테이블에서 변경 대상 데이터 제거후 실제 변경해야할 데이터와 병합
        let mergeArray = aTreeData.concat(aChangedData),
            oJsonModel = new sap.ui.model.json.JSONModel();

        // 임시 모델을 생성해서 모델 데이터를 구성
        oJsonModel.setData({
            "WS30": {
                "USPTREE": mergeArray
            }
        });

        sap.ui.getCore().setModel(oJsonModel, "usptreeTmp");

        let oTmpModel = sap.ui.getCore().getModel("usptreeTmp");

        WSUTIL.parseArrayToTree(oTmpModel, "WS30.USPTREE", "OBJKY", "PUJKY", "USPTREE");

        const oModelData = sap.ui.getCore().getModel("usptreeTmp").getData();

        sap.ui.getCore().setModel(null, "usptreeTmp");

        return oModelData;

    } // end of _fnChangedDataToTreeModel

    /************************************************************************
     * [WS30] 현재 활성화 되어 있는 Usp Data 를 구한다.
     ************************************************************************/
    function _fnGetSelectedUspTreeData(aUspTreeData) {

        // 전달받은 파라미터값이 Array 가 아니면 빠져나감.
        if (aUspTreeData instanceof Array == false) {
            return;
        }

        // Array에 데이터가 없으면 빠져나감.
        var iUspTreeLength = aUspTreeData.length;
        if (iUspTreeLength == 0) {
            return;
        }

        for (var i = 0; i < iUspTreeLength; i++) {

            var oTreeItem = aUspTreeData[i];

            if (oTreeItem.ISSEL == true) {

                return oTreeItem;

            }

            var aChild = oTreeItem.USPTREE,
                iChildCnt = aChild.length;

            if (iChildCnt == 0) {
                continue;
            }

            var oSelItem = _fnGetSelectedUspTreeData(aChild);
            if (!oSelItem) {
                continue;
            }

            return oSelItem;

        }

    } // end of _fnGetSelectedUspTreeData

    /************************************************************************
     * [WS30] Display Mode Button press Event
     ************************************************************************/
    function ev_pressDisplayModeBtn(oEvent) {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oBindAppData = fnGetAppInfo(),
            oAppInfo = jQuery.extend(true, {}, oBindAppData); // APP 정보

        // edit 모드 -> display 모드
        if (oAppInfo.IS_EDIT == "X") {

            // 변경된 값이 있는데 Display 모드로 갈려고 할 경우 메시지 팝업 보여준다.		
            if (oAppInfo.IS_CHAG == 'X') {

                // 메시지 팝업 띄울 때 Child window 가 있으면 Hide 시킨다.
                APPCOMMON.fnIsChildWindowShow(false);

                var sMsg = "";
                sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "118"); // Application has been changed
                sMsg += " \n " + APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "119"); // Save before leaving editor?

                parent.showMessage(sap, 40, 'W', sMsg, lf_MsgCallback);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            // WS30 페이지 정보 갱신            
            fnSetAppDisplayMode();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // display 모드 -> edit 모드
        fnSetAppChangeMode();

        /** 
         *  Local Function...
         */
        function lf_MsgCallback(ACTCD) {

            // child window(각종 Editor창 등..) 가 있었을 경우, 메시지 팝업 뜬 상태에서 어떤 버튼이라도 누른 후에는 
            // child window를 활성화 한다.
            APPCOMMON.fnIsChildWindowShow(true);

            // 이동을 하지 않는다.
            if (ACTCD == null || ACTCD == "CANCEL") {
                return;
            }

            // busy 키고 Lock 걸기
            oAPP.common.fnSetBusyLock("X");

            // 저장 후 Display 모드로 이동한다.
            if (ACTCD == "YES") {

                // 저장 로직 수행
                var oSaveBtn = sap.ui.getCore().byId("ws30_saveBtn");
                oSaveBtn.firePress({
                    ISDISP: "X",
                });

                return;

            }

            // WS20 페이지 정보 갱신
            fnSetAppDisplayMode();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

        } // end of lf_MsgCallback

    }; // end of oAPP.events.ev_pressDisplayModeBtn

    /****************************************************************************************
     * [WS30] Save or Activate 시 서버에서 판단하여 CTS를 적용해야할 경우 Eval 수행하는 function 
     ****************************************************************************************/
    function lf_saveActiveCtsPopup(oEvent) {

        var lo_Event = oEvent;

        // CTS Popup을 Open 한다.
        oAPP.fn.fnCtsPopupOpener(function(oResult) {

            var oEvent = this;
            // IS_ACT = oEvent.getParameter("IS_ACT");

            oEvent.mParameters.TRKORR = oResult.TRKORR;

            // if (IS_ACT == 'X') {

            //     oEvent.mParameters.IS_ACT = "X";

            //     ev_pressSaveBtn(oEvent);

            //     // var oActivateBtn = sap.ui.getCore().byId("ws30_activateBtn");
            //     // if(oActivateBtn){
            //     //     oActivateBtn.firePress();
            //     // }
            //     // ev_pressActivateBtn(oEvent);

            //     return;
            // }

            ev_pressSaveBtn(oEvent);

        }.bind(lo_Event));

    } // end of lf_saveActiveCtsPopup

    /************************************************************************
     * [WS30] change -> display mode 
     ************************************************************************/
    function fnSetAppDisplayMode() {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oAppInfo = fnGetAppInfo(),
            sCurrPage = parent.getCurrPage();

        var oFormData = new FormData();
        oFormData.append("APPID", oAppInfo.APPID);

        // Lock을 해제한다.
        ajax_unlock_app(oAppInfo.APPID, lf_success);

        function lf_success(RETURN) {

            if (RETURN.RTCOD == 'E') {
                // 오류..1
                parent.showMessage(sap, 20, RETURN.RTCOD, RETURN.RTMSG);

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

                return;
            }

            RETURN.IS_EDIT = ""; // Display Mode FLAG
            RETURN.IS_CHAG = "";

            APPCOMMON.fnSetModelProperty("/WS30/APP", RETURN, true); // 모델 정보 갱신

            // 현재 떠있는 Electron Browser들 전체 닫는 function
            oAPP.fn.fnChildWindowClose();

            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "029"); // "Switch to display mode."

            // 푸터 메시지 처리
            APPCOMMON.fnShowFloatingFooterMsg("S", sCurrPage, sMsg);

            // code editor KeyPress 이벤트 해제
            fnCodeEditorKeyPressEvent("");

            // 30번 페이지 레이아웃 초기 설정
            oAPP.fn.fnOnInitLayoutSettingsWs30();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

        }

    } // end of fnSetAppDisplayMode

    /************************************************************************
     * [WS30] display -> change mode 
     ************************************************************************/
    function fnSetAppChangeMode() {

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oAppInfo = fnGetAppInfo(),
            sCurrPage = parent.getCurrPage();

        var oFormData = new FormData();
        oFormData.append("APPID", oAppInfo.APPID);
        oFormData.append("ISEDIT", 'X');

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, lf_success);

        function lf_success(oAppInfo) {

            if (oAppInfo.IS_EDIT != "X") {

                // 페이지 푸터 메시지
                APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                // var sMsg = "Editing by " + oAppInfo.APPID;

                // // 페이지 푸터 메시지
                // APPCOMMON.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                parent.setSoundMsg("02"); // error sound

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");


                return false;

            }

            APPCOMMON.fnSetModelProperty("/WS30/APP", oAppInfo);

            // 현재 떠있는 Electron Browser들 전체 닫는 function
            oAPP.fn.fnChildWindowClose();

            // 푸터 메시지 처리                        
            var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "020"); // "Switch to edit mode."

            APPCOMMON.fnShowFloatingFooterMsg("S", sCurrPage, sMsg);

            // code editor KeyPress 이벤트 설정
            fnCodeEditorKeyPressEvent("X");

            // 30번 페이지 레이아웃 초기 설정
            oAPP.fn.fnOnInitLayoutSettingsWs30();

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

        }

    } // end of fnSetAppChangeMode

    /**************************************************************************
     * [WS30] Application Change 여부 구하기
     **************************************************************************
     * @return {Char1} IS_CHAG (X: true, '': false)
     * - Application Change 모드 여부
     **************************************************************************/
    function getAppChangeWs30() {

        // 어플리케이션 정보 가져오기
        var oAppInfo = fnGetAppInfo();

        // 어플리케이션 정보에 변경 플래그 
        return oAppInfo.IS_CHAG;

    } // end of getAppChangeWs30

    /**************************************************************************
     * [WS30] Application Change 모드 변경
     **************************************************************************
     * @param {Char1} bIsChange (X: true, '': false)
     * - Application Change 모드 여부
     **************************************************************************/
    oAPP.fn.setAppChangeWs30 = (bIsChange) => {

        if (typeof bIsChange !== "string") {
            return;
        }

        if (bIsChange != 'X' && bIsChange != '') {
            return;
        }

        // 어플리케이션 정보 가져오기
        var oAppInfo = fnGetAppInfo();

        // 어플리케이션 정보에 변경 플래그 
        oAppInfo.IS_CHAG = bIsChange;

        if (bIsChange == "X") {
            oAppInfo.ACTST = "I";
        }

        APPCOMMON.fnSetModelProperty("/WS30/APP", oAppInfo);

    }; // end of oAPP.fn.setAppChangeWs30

    /**************************************************************************
     * [WS30] Application Activate 상태 변경
     * 
     * @param {Char1} bIsActivate (X: true, '': false)
     * - Application Activate 상태 변경
     **************************************************************************/
    function setAppActive(bIsActivate) {

        if (typeof bIsActivate !== "string") {
            return;
        }

        if (bIsActivate != 'X' && bIsActivate != '') {
            return;
        }

        // 어플리케이션 정보 가져오기
        var oAppInfo = fnGetAppInfo();

        // Activate가 성공했으면 APP 상태코드 값 변경
        if (bIsActivate == "X") {
            oAppInfo.ACTST = "A";
        }

        APPCOMMON.fnSetModelProperty("/WS30/APP", oAppInfo);

    } // end of setAppActive

    /**************************************************************************
     * [WS30] code editor keyPress 이벤트 해제
     * 
     * @param {Char1} IsAttach (X: true, '': false)
     * - Application Change 모드 여부
     **************************************************************************/
    function fnCodeEditorKeyPressEvent(IsAttach) {

        let oCodeEditor1 = sap.ui.getCore().byId("ws30_codeeditor");
        if (!oCodeEditor1) {
            return;
        }

        let oCodeEditor2 = oAPP.attr.oCodeEditor2;
        if (!oCodeEditor2) {
            return;
        }

        let oEditorDom1 = oCodeEditor1._oEditor.textInput.getElement(),
            oEditorDom2 = oCodeEditor2._oEditor.textInput.getElement();

        if (IsAttach == "X") {

            oEditorDom1.addEventListener("keydown", oAPP.fn.fnAttachKeyPressEventCodeEditorWs30);
            oEditorDom2.addEventListener("keydown", oAPP.fn.fnAttachKeyPressEventCodeEditorWs30);

            return;
        }

        oEditorDom1.removeEventListener("keydown", oAPP.fn.fnAttachKeyPressEventCodeEditorWs30);
        oEditorDom2.removeEventListener("keydown", oAPP.fn.fnAttachKeyPressEventCodeEditorWs30);

    } // end of fnCodeEditorKeyPressEvent

    /**************************************************************************
     * [WS30] Content 영역의 Code Editor Pretty Print 기능
     **************************************************************************/
    function ev_codeeditorPrettyPrint() {

        let oActiveDom = document.activeElement;
        if (!oActiveDom) {
            return;
        }

        let oCodeEditor1 = sap.ui.getCore().byId("ws30_codeeditor"),
            oCodeEditor2 = sap.ui.getCore().byId("ws30_codeeditor-clone1");

        // 에디터가 둘중에 하나라도 없다면 빠져나감.
        if (!oCodeEditor1 || !oCodeEditor2) {
            return;
        }

        let oEditor1 = oCodeEditor1._oEditor,
            oEditor2 = oCodeEditor2._oEditor;

        // 현재 커서의 위치가 어떤 에디터인지 확인
        let $oCodeeditor1 = $(oActiveDom).closest(".u4aUspCodeeditor1"),
            $oCodeeditor2 = $(oActiveDom).closest(".u4aUspCodeeditor2");

        // 커서가 왼쪽 에디터에 있었을 경우
        if ($oCodeeditor1.length !== 0) {

            let oCursorPos = oEditor1.getCursorPosition();

            oCodeEditor1.prettyPrint();

            oCodeEditor1.focus();

            oEditor1.selection.$setSelection(oCursorPos.row, oCursorPos.column, oCursorPos.row, oCursorPos.column);

            oAPP.fn.setAppChangeWs30("X");

            return;
        }

        // 커서가 오른쪽 에디터에 있었을 경우
        if ($oCodeeditor2.length !== 0) {

            let oCursorPos = oEditor2.getCursorPosition();

            oCodeEditor2.prettyPrint();

            oCodeEditor2.focus();

            oEditor2.selection.$setSelection(oCursorPos.row, oCursorPos.column, oCursorPos.row, oCursorPos.column);

            oAPP.fn.setAppChangeWs30("X");

            return;

        }

    } // end of ev_codeeditorPrettyPrint

    /**************************************************************************
     * [WS30] Content 영역의 Code Editor Pattern Popover
     **************************************************************************/
    function ev_codeeditorPattern() {



    } // end of ev_codeeditorPattern

    /**************************************************************************
     * [WS30] Content 영역의 Code Editor Full Screen
     **************************************************************************/
    function ev_codeeditorFullscreen() {

        let oSplitLayout = sap.ui.getCore().byId("usptreeSplitLayout");
        if (oSplitLayout) {
            oSplitLayout.setSize("0px");
        }

        let oPanel = sap.ui.getCore().byId("uspPanel");
        if (oPanel) {
            oPanel.setExpanded(false);
        }

    } // end of ev_codeeditorFullscreen

    /**************************************************************************
     * [WS30] Content 영역의 Code Editor 화면 분할 변경
     **************************************************************************/
    function ev_codeeditorSplitOrientationChange() {

        let oCodeEditorSplit = sap.ui.getCore().byId("uspCodeeditorSplit");
        if (!oCodeEditorSplit) {
            return;
        }

        let oCodeEditorSplitLayoutData = sap.ui.getCore().byId("codeEditorSplitLayout");
        if (!oCodeEditorSplitLayoutData) {
            return;
        }

        oCodeEditorSplitLayoutData.setSize("0px");

        let sOrientation = oCodeEditorSplit.getOrientation();
        if (sOrientation == sap.ui.core.Orientation.Horizontal) {
            oCodeEditorSplit.setOrientation(sap.ui.core.Orientation.Vertical);
            return;
        }

        oCodeEditorSplit.setOrientation(sap.ui.core.Orientation.Horizontal);

    } // end of ev_codeeditorSplitOrientationChange

    /**************************************************************************
     * [WS30] App 정보 가져오기.
     **************************************************************************/
    function fnGetAppInfo() {

        return APPCOMMON.fnGetModelProperty("/WS30/APP");

    } // end of fnGetAppInfo


})(window, $, oAPP);