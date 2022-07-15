/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnFindPopupOpen.js
 * - file Desc : WS20의 Find Dialog Popup
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Root Variable Area..
     ************************************************************************/
    const
        C_BIND_ROOT_PATH = "/WS20/FIND",
        C_FIND_DLG_ID = "u4aWsFindDlg",
        C_FIND_DLG_RDB_ID = "u4aWsFindDlgRdBtnGrp",
        C_FIND_DLG_CH1_ID = "u4aWsChoice1Dialog",
        C_FIND_DLG_CH2_ID = "u4aWsChoice2Dialog",
        C_FIND_DLG_CH3_ID = "u4aWsChoice3Dialog",
        C_FIND_DLG_CH4_ID = "u4aWsChoice4Dialog";

    const
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        APP = parent.APP,
        PATH = parent.PATH,
        APPPATH = parent.APPPATH,
        IPCMAIN = parent.IPCMAIN,
        IPCRENDERER = parent.IPCRENDERER,
        CURRWIN = REMOTE.getCurrentWindow(),
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey();

    var APPCOMMON = oAPP.common;

    /**************************************************************************
     * WS20의 찾기버튼 Dialog Open
     * ************************************************************************/
    oAPP.fn.fnFindPopupOpen = function () {

        var sPopupName = "UIFIND";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        // 테마 개인화 정보
        let oThemeInfo = parent.getThemeInfo(); // theme 정보 

        var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = "Find";
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;

        var aAttrData = oAPP.fn.getAttrChangedData(), // attribute 정보
            aServerEventList = oAPP.fn.getServerEventList(); // 서버 이벤트 리스트

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = CURRWIN.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (yPos < 0) {
            yPos = 0;
        };

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        var sUrlPath = parent.getPath(sPopupName);
        oBrowserWindow.loadURL(sUrlPath);

        //oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oFindData = {
                oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보
                oThemeInfo: oThemeInfo, // 테마 개인화 정보
                aAttrData: aAttrData,
                aServEvtData: aServerEventList,
                aT_0022: oAPP.DATA.LIB.T_0022
            };

            oBrowserWindow.webContents.send('if-find-info', oFindData);

            oBrowserWindow.setOpacity(1.0);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // IPCMAIN 이벤트 해제
            IPCMAIN.off(`${BROWSKEY}--find`, oAPP.fn.fnIpcMain_Find);
            IPCMAIN.off(`${BROWSKEY}--find--controller`, oAPP.fn.fnIpcMain_Find_Controller);            

            oBrowserWindow = null;

        });

        // 선택한 UI 정보를 WS20에 표시
        IPCMAIN.on(`${BROWSKEY}--find`, oAPP.fn.fnIpcMain_Find);

        // 선택한 UI 정보를 가지고 controller(class builder) 실행
        IPCMAIN.on(`${BROWSKEY}--find--controller`, oAPP.fn.fnIpcMain_Find_Controller);

    }; // end of oAPP.fn.fnFindPopupOpen

    /**************************************************************************
     * Find Popup에서 전달 받은 UI 정보를 가지고 WS20에 표시를 해준다.
     * ************************************************************************/
    oAPP.fn.fnIpcMain_Find = function (events, res) {

        // function lf_success() {

        //     IPCRENDERER.send(`${BROWSKEY}--find--success`, "X");

        // }

        // lf_success();

        // return;

        oAPP.fn.setSelectTreeItem(res.OBJID, res.UIATK);
        // oAPP.fn.setSelectTreeItem(res.OBJID, res.UIATK, lf_success);

    }; // end of oAPP.fn.fnIpcMain_Find

    /**************************************************************************
     * Find Popup에서 전달 받은 UI 정보를 가지고 controller(class builder)를 실행.
     * ************************************************************************/
    oAPP.fn.fnIpcMain_Find_Controller = function (events, res) {

        oAPP.common.execControllerClass(res.UIATV);

        // oAPP.common.execControllerClass = function (METHNM, INDEX);


    }; // end of oAPP.fn.fnIpcMain_Find

    // oAPP.fn.fnIpcMain_Find_Success = (events, res) => {

    //     IPCRENDERER.send(`${BROWSKEY}--find--success`, "X");

    // }; // end of oAPP.fn.fnIpcMain_Find_Success

    /**************************************************************************
     * 찾기버튼 Dialog의 라디오 버튼 그룹 그리기
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupRadioBtnGrp = function () {

        return new sap.m.RadioButtonGroup(C_FIND_DLG_RDB_ID, {
            buttons: [
                new sap.m.RadioButton({
                    text: "UI Where to Use the Event"
                }),
                new sap.m.RadioButton({
                    text: "Model Binding Usage For UI"
                }),
                new sap.m.RadioButton({
                    text: "CSS Style Class Where to Use"
                }),
                new sap.m.RadioButton({
                    text: "Event JS Where to Use"
                }),
            ]
        }).addStyleClass(C_FIND_DLG_RDB_ID);

    }; // end of oAPP.fn.fnGetFindPopupRadioBtnGrp    

    /**************************************************************************
     * UI Where to Use the Event
     * ************************************************************************/
    oAPP.fn.fnFindPopupRdBtnChoice1 = function () {

        var oChoice1Dlg = sap.ui.getCore().byId(C_FIND_DLG_CH1_ID);
        if (oChoice1Dlg) {
            oChoice1Dlg.open();
            return;
        }

        var oContents = oAPP.fn.fnGetFindPopupChoice1Contents();

        var oChoice1Dlg = new sap.m.Dialog(C_FIND_DLG_CH1_ID, {

            // Properties
            draggable: true,
            resizable: true,
            contentWidth: "800px",
            contentHeight: "500px",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://sys-find"
                    }),

                    new sap.m.Title({
                        text: "UI Where to Use the Event"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {
                            oChoice1Dlg.close();
                        }
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function (oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents
            ],

            // Events
            afterOpen: oAPP.events.ev_findPopupChoice1AfterOpen,
            afterClose: function (oEvent) {
                var oDialog = oEvent.getSource();
                oDialog.destroy();
            },
            escapeHandler: function () {
                var oDialog = sap.ui.getCore().byId(C_FIND_DLG_CH1_ID);
                if (!oDialog) {
                    return;
                }
                oDialog.close();
            }

        }).addStyleClass(C_FIND_DLG_CH1_ID);

        oChoice1Dlg.bindElement(C_BIND_ROOT_PATH);

        oChoice1Dlg.open();

    }; // end of oAPP.fn.fnFindPopupRdBtnChoice1

    /**************************************************************************
     * Model Binding Usage For UI
     * ************************************************************************/
    oAPP.fn.fnFindPopupRdBtnChoice2 = function () {

        var oChoice2Dlg = sap.ui.getCore().byId(C_FIND_DLG_CH2_ID);
        if (oChoice2Dlg) {
            oChoice2Dlg.open();
            return;
        }

        var oContents = oAPP.fn.fnGetFindPopupChoice2Contents();

        var oChoice2Dlg = new sap.m.Dialog(C_FIND_DLG_CH2_ID, {

            // Properties            
            draggable: true,
            resizable: true,
            // contentWidth: "1200px",
            // contentHeight: "500px",

            contentWidth: "70%",
            contentHeight: "70%",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://sys-find"
                    }),

                    new sap.m.Title({
                        text: "Model Binding Usage For UI"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {
                            oChoice2Dlg.close();
                        }
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function (oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents
            ],

            // Events
            afterOpen: oAPP.events.ev_findPopupChoice2AfterOpen,

            afterClose: function (oEvent) {
                var oDialog = oEvent.getSource();
                oDialog.destroy();
            },

            escapeHandler: function () {

                var oDialog = sap.ui.getCore().byId(C_FIND_DLG_CH2_ID);
                if (!oDialog) {
                    return;
                }

                oDialog.close();

            }

        }).addStyleClass(C_FIND_DLG_CH2_ID);

        oChoice2Dlg.bindElement(C_BIND_ROOT_PATH);

        oChoice2Dlg.open();

    }; // end of oAPP.fn.fnFindPopupRdBtnChoice2

    /**************************************************************************
     * CSS Style Class Where to Use
     * ************************************************************************/
    oAPP.fn.fnFindPopupRdBtnChoice3 = function () {

        var oChoice3Dlg = sap.ui.getCore().byId(C_FIND_DLG_CH3_ID);
        if (oChoice3Dlg) {
            oChoice3Dlg.open();
            return;
        }

        var oContents = oAPP.fn.fnGetFindPopupChoice3Contents(),
            oChoice3Dlg = new sap.m.Dialog(C_FIND_DLG_CH3_ID, {

                // Properties
                draggable: true,
                resizable: true,
                contentWidth: "500px",
                contentHeight: "300px",

                // Aggregations
                customHeader: new sap.m.Toolbar({
                    content: [
                        new sap.m.ToolbarSpacer(),

                        new sap.ui.core.Icon({
                            src: "sap-icon://sys-find"
                        }),

                        new sap.m.Title({
                            text: "CSS Style Class Where to Use"
                        }).addStyleClass("sapUiTinyMarginBegin"),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://decline",
                            press: function () {
                                oChoice3Dlg.close();
                            }
                        })
                    ]
                }),

                buttons: [
                    new sap.m.Button({
                        type: sap.m.ButtonType.Reject,
                        icon: "sap-icon://decline",
                        press: function (oEvent) {
                            var oDialog = oEvent.getSource().getParent();
                            oDialog.close();
                        }
                    }),
                ],

                content: [
                    oContents,

                ],
                afterOpen: oAPP.events.ev_findPopupChoice3AfterOpen,

                afterClose: function (oEvent) {
                    var oDialog = oEvent.getSource();
                    oDialog.destroy();
                },
                escapeHandler: function () {
                    var oDialog = sap.ui.getCore().byId(C_FIND_DLG_CH3_ID);
                    if (!oDialog) {
                        return;
                    }
                    oDialog.close();
                }

            }).addStyleClass(C_FIND_DLG_CH3_ID);

        oChoice3Dlg.bindElement(C_BIND_ROOT_PATH);

        oChoice3Dlg.open();

    }; // end of oAPP.fn.fnFindPopupRdBtnChoice3

    /**************************************************************************
     * Event JS Where to Use
     * ************************************************************************/
    oAPP.fn.fnFindPopupRdBtnChoice4 = function () {

        var oChoice4Dlg = sap.ui.getCore().byId(C_FIND_DLG_CH4_ID);
        if (oChoice4Dlg) {
            oChoice4Dlg.open();
            return;
        }

        var oContents = oAPP.fn.fnGetFindPopupChoice4Contents();

        var oChoice4Dlg = new sap.m.Dialog(C_FIND_DLG_CH4_ID, {

            // Properties
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "300px",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://sys-find"
                    }),

                    new sap.m.Title({
                        text: "Event JS Where to Use"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {
                            oChoice4Dlg.close();
                        }
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function (oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents,
            ],

            // Events
            afterOpen: oAPP.events.ev_findPopupChoice4AfterOpen,

            afterClose: function (oEvent) {
                var oDialog = oEvent.getSource();
                oDialog.destroy();
            },

            escapeHandler: function () {
                var oDialog = sap.ui.getCore().byId(C_FIND_DLG_CH4_ID);
                if (!oDialog) {
                    return;
                }
                oDialog.close();
            }

        }).addStyleClass(C_FIND_DLG_CH4_ID);

        oChoice4Dlg.bindElement(C_BIND_ROOT_PATH);

        oChoice4Dlg.open();

    }; // end of oAPP.fn.fnFindPopupRdBtnChoice4

    /**************************************************************************
     * UI Where to Use the Event 팝업의 Contents
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice1Contents = function () {

        var LabelDesignBoldEnum = sap.m.LabelDesign.Bold;

        return new sap.m.Page({
            showHeader: false,
            content: [

                new sap.ui.table.Table({
                    selectionMode: sap.ui.table.SelectionMode.Single,
                    selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                    visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                    columns: [
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Event ID",
                                design: LabelDesignBoldEnum
                            }),
                            template: new sap.m.Link({
                                text: "{UIATV}",
                                emphasized: true,
                                press: oAPP.events.ev_pressFindPopChoice1TblCol1
                            }),
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Event Text",
                                design: LabelDesignBoldEnum
                            }),
                            template: new sap.m.Text({
                                text: "{EVTXT}"
                            }),
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "Event Target Properties",
                                design: LabelDesignBoldEnum
                            }),
                            template: new sap.m.Link({
                                text: "{UIATT}",
                                emphasized: true,
                                press: oAPP.events.ev_pressFindPopChoice1TblCol3
                            }),
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: "UI OBJ ID",
                                design: LabelDesignBoldEnum
                            }),
                            template: new sap.m.Text({
                                text: "{OBJID}"
                            }),
                        }),
                    ],
                    rows: {
                        path: "CHOICE1TABLE",
                    },
                })

            ]
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice1Contents

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 컨텐츠들..
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice2Contents = function () {

        var oLeftTable = oAPP.fn.fnGetFindPopupChoice2LeftTable(),
            oRightTable = oAPP.fn.fnGetFindPopupChoice2RightTable();

        return new sap.m.Page({
            showHeader: false,
            content: [
                new sap.ui.layout.Splitter({
                    height: "100%",
                    width: "100%",
                    contentAreas: [

                        oLeftTable,
                        oRightTable

                    ]
                }),
            ]
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice2Contents

    /**************************************************************************
     * CSS Style Class Where to Use 팝업의 컨텐츠들..
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice3Contents = function () {

        var oTable = oAPP.fn.fnGetFindPopupChoice3Table();

        return new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice3Contents

    /**************************************************************************
     * Event JS Where to Use 팝업의 컨텐츠들..
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice4Contents = function () {

        var oTable = oAPP.fn.fnGetFindPopupChoice4Table();

        return new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice4Contents

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 좌측 Properties Usage Bind List
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice2LeftTable = function () {

        var LabelDesignBoldEnum = sap.m.LabelDesign.Bold;

        return new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            columns: [
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "UI ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Link({
                        text: "{OBJID}",
                        emphasized: true,
                        press: oAPP.events.ev_pressFindPopChoice2Tbl1Col1
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "UI Attribute ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIATT}"
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Model full Path",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Link({
                        text: "{UIATV}",
                        emphasized: true,
                        press: oAPP.events.ev_pressFindPopChoice2Tbl1Col3
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Binding Field",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text().bindProperty("text", {
                        parts: [
                            "UIATV"
                        ],
                        formatter: function (UIATV) {

                            if (UIATV == null) {
                                return "";
                            }

                            if (UIATV.indexOf("-") < 0) {
                                return "";
                            }

                            var aSplit = UIATV.split("-"),
                                sFieldName = aSplit[aSplit.length - 1];

                            return sFieldName;

                        }
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Data Type",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIADT}"
                    }),
                }),
            ],

            rows: {
                path: "CHOICE2LEFT",
            },
            extension: [
                new sap.m.OverflowToolbar({
                    content: [
                        new sap.m.Text({
                            text: "Properties Usage Bind List"
                        })
                    ]
                })
            ],
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice2LeftTable

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 우측 Aggregations Usage Bind Models
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice2RightTable = function () {

        var LabelDesignBoldEnum = sap.m.LabelDesign.Bold;

        return new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            columns: [
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "UI ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Link({
                        text: "{OBJID}",
                        emphasized: true,
                        press: oAPP.events.ev_pressFindPopChoice2Tbl2Col1
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Aggregations ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIATT}"
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Binding Model",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIATV}"
                    }),
                }),
            ],
            rows: {
                path: "CHOICE2RIGHT",
            },
            extension: [
                new sap.m.OverflowToolbar({
                    content: [
                        new sap.m.Text({
                            text: "Aggregations Usage Bind Models"
                        })
                    ]
                })
            ],
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice2RightTable

    /**************************************************************************
     * CSS Style Class Where to Use 팝업의 Table
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice3Table = function () {

        var LabelDesignBoldEnum = sap.m.LabelDesign.Bold;

        return new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            columns: [
                new sap.ui.table.Column({
                    width: "150px",
                    minWidth: 100,
                    label: new sap.m.Label({
                        text: "UI OBJ ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Link({
                        text: "{OBJID}",
                        emphasized: true,
                        press: oAPP.events.ev_pressFindPopChoice3Tbl1Col1
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Style Class Name",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIATV}"
                    }),
                }),
            ],
            rows: {
                path: "CHOICE3TABLE",
            },
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice3Table

    /**************************************************************************
     * Event JS Where to Use 팝업의 Table
     * ************************************************************************/
    oAPP.fn.fnGetFindPopupChoice4Table = function () {

        var LabelDesignBoldEnum = sap.m.LabelDesign.Bold;

        return new sap.ui.table.Table({
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            columns: [
                new sap.ui.table.Column({
                    width: "150px",
                    minWidth: 100,
                    label: new sap.m.Label({
                        text: "UI OBJ ID",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Link({
                        text: "{OBJID}",
                        emphasized: true,
                        press: oAPP.events.ev_pressFindPopChoice4Tbl1Col1
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "UI Event Name",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{UIATT}"
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "UI Class",
                        design: LabelDesignBoldEnum
                    }),
                    template: new sap.m.Text({
                        text: "{LIBNM}"
                    }),
                }),
            ],
            rows: {
                path: "CHOICE4TABLE",
            },
        });

    }; // end of oAPP.fn.fnGetFindPopupChoice4Table



    /********************************** Events Start ****************************************/


    /**************************************************************************
     * UI Where to Use the Event Popup After Open
     * ************************************************************************/
    oAPP.events.ev_findPopupChoice1AfterOpen = function (oEvent) {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return;
        }

        // Attribute 정보에서 서버 이벤트 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "2" && elem.UIATV != ""),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return;
        }

        // 서버 이벤트의 Descripion을 구한다.
        var aEventName = oAPP.fn.getServerEventList(),
            iEventNameLength = aEventName.length;

        if (iEventNameLength > 0) {

            // 수집된 서버 이벤트 정보에 Description 정보를 매핑한다.
            for (var i = 0; i < iDataLength; i++) {

                var oFindData = aFindData[i],
                    sUIATV = oFindData.UIATV;

                var oEventName = aEventName.find(elem => elem.KEY == sUIATV);
                if (oEventName == null) {
                    continue;
                }

                oFindData.EVTXT = oEventName.DESC;

            }

        }

        APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE1TABLE`, aFindData);

    }; // end of oAPP.events.ev_findPopupChoice1AfterOpen

    /**************************************************************************
     * Model Binding Usage For UI Popup After Open
     * ************************************************************************/
    oAPP.events.ev_findPopupChoice2AfterOpen = function () {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return;
        }

        // Properties Usage Bind List 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "1" && elem.ISBND == "X"),
            iDataLength = aFindData.length;

        if (iDataLength > 0) {
            APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE2LEFT`, aFindData);
        }

        // Aggregations Usage Bind Model 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "3"),
            iDataLength = aFindData.length;

        if (iDataLength > 0) {
            APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE2RIGHT`, aFindData);
        }

    }; // end of oAPP.events.ev_findPopupChoice2AfterOpen

    /**************************************************************************
     * CSS Style Class Where to Use Popup After Open
     * ************************************************************************/
    oAPP.events.ev_findPopupChoice3AfterOpen = function () {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return;
        }

        // Attribute 정보에서 StyleClass 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATT == "styleClass"),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return;
        }

        APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE3TABLE`, aFindData);

    }; // end of oAPP.events.ev_findPopupChoice3AfterOpen

    /**************************************************************************
     * Event JS Where to Use Popup After Open
     * ************************************************************************/
    oAPP.events.ev_findPopupChoice4AfterOpen = function () {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return;
        }

        // 클라이언트 스크립트가 있는 UI만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.ADDSC == "JS" && elem.UIATY == "2"),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return;
        }

        // 22번에서 UIOBK를 가지고 UI Class 명을 매핑한다.
        var a0022 = oAPP.DATA.LIB.T_0022,
            i0022length = a0022.length;

        if (i0022length > 0) {

            for (var i = 0; i < iDataLength; i++) {

                var oFindData = aFindData[i],
                    sUIOBK = oFindData.UIOBK;

                var oUIData = a0022.find(elem => elem.UIOBK == sUIOBK);
                if (oUIData == null) {
                    continue;
                }

                oFindData.LIBNM = oUIData.LIBNM;

            }

        }

        APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE4TABLE`, aFindData);

    }; // end of oAPP.events.ev_findPopupChoice4AfterOpen

    /**************************************************************************
     * 찾기버튼 Dialog의 확인버튼 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressFindPopupOkBtn = function () {

        var oRdBtnGrp = sap.ui.getCore().byId(C_FIND_DLG_RDB_ID);
        if (!oRdBtnGrp) {
            return;
        }

        // FIND 팝업 모델 초기화
        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, {});

        var iSelectedRdBtn = oRdBtnGrp.getSelectedIndex();

        switch (iSelectedRdBtn) {
            case 0: // UI Where to Use the Event
                oAPP.fn.fnFindPopupRdBtnChoice1();
                break;

            case 1: // Model Binding Usage For UI
                oAPP.fn.fnFindPopupRdBtnChoice2();
                break;

            case 2: // CSS Style Class Where to Use
                oAPP.fn.fnFindPopupRdBtnChoice3();
                break;

            case 3: // Event JS Where to Use
                oAPP.fn.fnFindPopupRdBtnChoice4();
                break;

        }

    }; // end of oAPP.fn.fnGetFindPopupOkBtn

    /**************************************************************************
     * UI Where to Use the Event Table의 "Event ID" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice1TblCol1 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

        APPCOMMON.execControllerClass(oSelectData.F01);

    }; // end of oAPP.events.ev_pressFindPopChoice1TblCol1

    /**************************************************************************
     * UI Where to Use the Event Table의 "Event Target Properties" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice1TblCol3 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    }; // end of oAPP.events.ev_pressFindPopChoice1TblCol3

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 좌측 Properties Usage Bind List "UI ID" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice2Tbl1Col1 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    }; // end of oAPP.events.ev_pressFindPopChoice2Tbl1Col1

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 좌측 Properties Usage Bind List "Model Full Path" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice2Tbl1Col3 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    }; // end of oAPP.events.ev_pressFindPopChoice2Tbl1Col3

    /**************************************************************************
     * Model Bindig Usage for UI 팝업의 우측 Aggregations Usage bind Models "UI ID" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice2Tbl2Col1 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    }; // end of oAPP.events.ev_pressFindPopChoice2Tbl2Col1

    /**************************************************************************
     * CSS Style Class Where to Use 팝업의 "UI OBJ ID" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice3Tbl1Col1 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    }; // end of oAPP.events.ev_pressFindPopChoice3Tbl1Col1


    /**************************************************************************
     * Event JS Where to Use 팝업의 "UI OBJ ID" Link
     * ************************************************************************/
    oAPP.events.ev_pressFindPopChoice4Tbl1Col1 = function (oEvent) {

        debugger;

        var oCtx = oEvent.getSource().getBindingContext(),
            oSelectData = APPCOMMON.fnGetModelProperty(oCtx.sPath);

    };

})(window, $, oAPP);