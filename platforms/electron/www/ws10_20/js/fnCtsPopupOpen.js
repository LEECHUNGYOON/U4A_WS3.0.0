/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnCtsPopupOpen.js
 * - file Desc : CTS POPUP
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Root Variable Area..
     ************************************************************************/
    const
        C_BIND_ROOT_PATH = "/CTS",
        C_DLG_ID = "u4aWsCtsDlg",
        C_CTS_NEW_DLG_ID = "u4aWsCtsNewDlg",
        C_CTS_NEW_BIND_ROOT_PATH = C_BIND_ROOT_PATH + "/CTSNEW",
        C_CTS_TB_ID = "u4aCtsTb";

    var APPCOMMON = oAPP.common,
        GfnCtsCallback;

    /************************************************************************
     * CTS 관련 정보를 구하는 팝업
     ************************************************************************
     * @param {Function} fnCallback
     * - CTS 팝업에서 CTS 번호 선택한 값 전달하기 위한 callback function
     ************************************************************************/
    oAPP.fn.fnCtsPopupOpen = function(fnCallback) {

        if (typeof GfnCtsCallback !== "undefined") {
            GfnCtsCallback = undefined;
        }

        // callback function 글로벌 변수로 저장
        GfnCtsCallback = fnCallback;

        var oCtsDialog = sap.ui.getCore().byId(C_DLG_ID);

        if (oCtsDialog) {
            oCtsDialog.open();
            return;
        }

        var oCtsContent = oAPP.fn.fnGetCtsContents();

        var oCtsDialog = new sap.m.Dialog(C_DLG_ID, {

            // Properties
            busy: "{/CTS/ISBUSY}",
            draggable: true,
            resizable: true,
            contentWidth: "100%",
            contentHeight: "100%",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://shipping-status"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "345"), // Prompt for Transportable Workbench Request
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function() {

                            oCtsDialog.close();

                        }
                    })
                ]
            }),
            content: [

                oCtsContent

            ],
            buttons: [
                // Accept 버튼
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: function() {
                        oAPP.events.ev_CtsPopupAccept();
                    }
                }),

                // // CTS 신규 생성 버튼
                // new sap.m.Button({
                //     type: sap.m.ButtonType.Ghost,
                //     icon: "sap-icon://document",
                //     press: function() {
                //         oAPP.fn.fnNewCtsPopUpOpen();
                //     }
                // }).addStyleClass("sapUiSmallMarginBegin"),

                // Cancel 버튼
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function() {

                        oCtsDialog.close();

                    }.bind(oCtsDialog)
                }),
            ],

            // Events
            beforeOpen: oAPP.events.ev_CtsDlgBeforeOpen,
            afterOpen: oAPP.events.ev_GetCtsDialogAfterOpen,
            afterClose: oAPP.events.ev_CtsDlgAfterClose,

        }).addStyleClass("sapUiContentPadding");

        oCtsDialog.bindElement(C_BIND_ROOT_PATH);

        oCtsDialog.open();

    }; // end of oAPP.fn.fnCtsPopupOpen

    /************************************************************************
     * CTS 팝업의 컨텐츠 영역 UI Object
     ************************************************************************/
    oAPP.fn.fnGetCtsContents = function() {

        var oCtsPanel = oAPP.fn.fnGetCtsDlgPanel(),
            oCtsTreeTable = oAPP.fn.fnGetCtsDlgTreeTable();

        var oCtsPage = new sap.m.Page({
            showHeader: false,
            content: [
                new sap.m.VBox({
                    renderType: sap.m.FlexRendertype.Bare,
                    height: "100%",
                    items: [

                        oCtsPanel,

                        new sap.m.Page({
                            showHeader: true,
                            customHeader: new sap.m.Bar({
                                contentLeft: [
                                    new sap.m.Button({
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A48"), // Refresh
                                        icon: "sap-icon://refresh",
                                        type: sap.m.ButtonType.Emphasized,
                                        press: () => {

                                            var oCtsDialog = sap.ui.getCore().byId(C_DLG_ID);
                                            if (oCtsDialog == null) {
                                                return;
                                            }

                                            oCtsDialog.fireBeforeOpen();
                                            oCtsDialog.fireAfterOpen();

                                        }
                                    })
                                ]
                            }),
                            content: [
                                oCtsTreeTable // CTS Dialog의 Tree Table 영역
                            ]
                        })

                    ]

                })

            ]

        });



        // var oCtsPage = new sap.m.Page({
        //     showHeader: false,
        //     content: [

        //         new sap.ui.layout.Splitter({
        //             height: "100%",
        //             width: "100%",
        //             orientation: sap.ui.core.Orientation.Vertical,
        //             contentAreas: [

        //                 oCtsPanel, // CTS Dialog의 Panel 영역

        //                 new sap.m.Page({
        //                     showHeader: true,
        //                     customHeader: new sap.m.Bar(),
        //                     content: [
        //                         oCtsTreeTable // CTS Dialog의 Tree Table 영역
        //                     ]
        //                 })

        //             ]
        //         })

        //     ]

        // });

        return oCtsPage;

    }; // end of oAPP.fn.fnGetCtsContents

    /************************************************************************
     * CTS 팝업의 Panel 영역 UI Object
     ************************************************************************/
    oAPP.fn.fnGetCtsDlgPanel = function() {

        var oCtsForm = oAPP.fn.fnGetCtsDlgForm();

        var oCtsPanel = new sap.m.Panel({
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "180px",
                resizable: true,
                minSize: 180
            }),
            content: [
                oCtsForm
            ]

        });

        return oCtsPanel;

    }; // end of oAPP.fn.fnGetCtsDlgPanel

    /************************************************************************
     * CTS 팝업의 Panel 영역 UI Object
     ************************************************************************/
    oAPP.fn.fnGetCtsDlgForm = function() {

        // MIME Folder 생성 팝업의 FORM
        var oCtsForm = new sap.ui.layout.form.Form({
            editable: true,
            busy: "{/CTS/ISBUSY}",
            busyIndicatorDelay: 0,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 3,
                labelSpanL: 4,
                labelSpanM: 6,
                labelSpanS: 12,
                singleContainerFullSize: false
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B03"), // Request No
                            }),
                            fields: new sap.m.Input({
                                value: "{CTSNO}",
                                editable: false
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D54"), // Short Description
                            }),
                            fields: new sap.m.Input({
                                value: "{CTSDESC}",
                                editable: false
                            })
                        }),

                    ]

                }),

            ]

        });

        oCtsForm.bindElement(C_BIND_ROOT_PATH + "/CTSHEAD");

        return oCtsForm;

    }; // end of oAPP.fn.fnGetCtsDlgFormInPanel

    /************************************************************************
     * CTS 팝업의 TreeTable 영역 UI Object
     ************************************************************************/
    oAPP.fn.fnGetCtsDlgTreeTable = function() {

        var oCtsTreeTable = new sap.ui.table.Table(C_CTS_TB_ID, {
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            columns: [
                new sap.ui.table.Column({
                    hAlign: sap.ui.core.HorizontalAlign.Center,
                    width: "150px",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A21"), // CTS No.
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{TRKORR}"
                    }),
                }),

                // new sap.ui.table.Column({
                //     label: new sap.m.Label({
                //         text: "SAP ID",
                //         design: sap.m.LabelDesign.Bold
                //     }),
                //     template: new sap.m.Text({
                //         text: "{AS4USER}"
                //     }),
                // }),

                new sap.ui.table.Column({
                    width: "auto",
                    minWidth: 500,
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{AS4TEXT}"
                    }),
                }),

                new sap.ui.table.Column({
                    hAlign: sap.ui.core.HorizontalAlign.Center,
                    width: "150px",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D55"), // Date
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{AS4DATE}"
                    }),
                }),

                new sap.ui.table.Column({
                    hAlign: sap.ui.core.HorizontalAlign.Center,
                    width: "150px",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D56"), // Time
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{AS4TIME}"
                    }),
                }),

            ],
            rows: {
                path: "/CTS/CTSTREE",
                // parameters: {
                //     numberOfExpandedLevels: 1,
                //     collapseRecursive: true,
                //     arrayNames: ['CTSTREE']
                // }
            },
            rowSelectionChange: oAPP.events.ev_CtsTreeTableRowSelect,

        });

        oCtsTreeTable.attachBrowserEvent("dblclick", function(oEvent) {

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

            var oRowData = oRow.getModel().getProperty(oCtx.sPath);

            // 저장 확인 질문 팝업
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "346"); // Do you want to choose?
            parent.showMessage(sap, 30, "I", sMsg, lf_msgCallback.bind(oRowData));

            function lf_msgCallback(sAction) {

                var YES = sap.m.MessageBox.Action.YES,
                    bIsAction = (sAction == YES ? true : false);

                if (!bIsAction) {
                    return;
                }

                var oRowData = this;

                // 선택된 CTS 정보의 Parent, child 번호를 전달한다.        
                if (typeof GfnCtsCallback === "function") {
                    GfnCtsCallback(oRowData);
                }

                var oCtsDialog = sap.ui.getCore().byId(C_DLG_ID);
                if (oCtsDialog) {
                    oCtsDialog.close();
                }

            }

        });

        return oCtsTreeTable;

    }; // end of oAPP.fn.fnGetCtsDlgTreeTable    

    /************************************************************************
     * CTS 정보 가져오기 성공 function
     ************************************************************************/
    oAPP.fn.fnGetCtsDataSucc = function(oResult) {

        parent.setBusy('');

        APPCOMMON.fnSetModelProperty("/CTS/ISBUSY", false);

        if (oResult.RETCD != "S") {
            return;
        }

        var aCtsData = oResult.RESULT,
            oCtsModel = {
                CTSTREE: aCtsData,
                CTSHEAD: {
                    CTSNO: "",
                    CTSDESC: ""
                }
            };

        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oCtsModel);

        // var oModel = sap.ui.getCore().getModel();

        // // Model Data를 Tree로 구성
        // oAPP.fn.fnSetTreeJson(oModel, "CTS.CTSTREE", "TRKORR", "STRKORR", "CTSTREE");

    }; // end of oAPP.fn.fnGetCtsDataSucc

    /************************************************************************
     * CTS 정보 가져오기 실패 function
     ************************************************************************/
    oAPP.fn.fnGetCtsDataErr = function() {

        parent.setBusy('');

        APPCOMMON.fnSetModelProperty("/CTS/ISBUSY", false);

    }; // end of oAPP.fn.fnGetCtsDataErr

    /************************************************************************
     * CTS 신규 생성 Dialog
     ************************************************************************/
    oAPP.fn.fnNewCtsPopUpOpen = function() {

        var oCtsDialog = sap.ui.getCore().byId(C_CTS_NEW_DLG_ID);

        if (oCtsDialog) {
            oCtsDialog.open();
            return;
        }

        var oCtsNewContents = oAPP.fn.fnGetCtsNewContents();

        var oCtsNewDialog = new sap.m.Dialog(C_CTS_NEW_DLG_ID, {

            // properties
            draggable: true,
            resizable: true,
            contentWidth: "60%",
            // contentHeight: "60%",
            // title: "Create Request",
            // titleAlignment: sap.m.TitleAlignment.Center,
            // icon: "sap-icon://document",
            // beforeOpen: oAPP.events.ev_CtsDlgBeforeOpen,

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://document"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D57"), // Create Request
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function() {

                            var oDialog = sap.ui.getCore().byId(C_CTS_NEW_DLG_ID);
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
            content: [
                oCtsNewContents
            ],

            // Events
            afterOpen: oAPP.events.ev_ctsNewDlgAfterOpen,

        });

        oCtsNewDialog.bindElement(C_CTS_NEW_BIND_ROOT_PATH);

        oCtsNewDialog.open();

    }; // end of oAPP.fn.fnNewCtsPopUpOpen

    /************************************************************************
     * CTS 신규 생성 Dialog의 Contents..
     ************************************************************************/
    oAPP.fn.fnGetCtsNewContents = function() {

        var oForm1 = oAPP.fn.fngetCtsNewForm1(),
            oForm2 = oAPP.fn.fngetCtsNewForm2(),
            oForm3 = oAPP.fn.fngetCtsNewForm3();

        return new sap.m.Page({
            showHeader: false,
            content: [
                oForm1,
                oForm2,
                oForm3
            ]
        });

    }; // end of oAPP.fn.fnGetCtsNewContents

    oAPP.fn.fngetCtsNewForm1 = function() {

        return new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                columnsM: 2,
            }),
            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B03"), // Request No
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{TRKORR}",
                                    editable: false,
                                    description: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D58"), // Workbench Request
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D54"), // Short Description
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{AS4TEXT}",
                                })
                            ]
                        })
                    ]
                })
            ]

        }).addStyleClass("u4aWsCtsNewForm1");

    };

    oAPP.fn.fngetCtsNewForm2 = function() {

        return new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                columnsM: 2,
            }),
            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D59"), // Owner
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{AS4USER}",
                                    editable: false,
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M4 S12"
                                    })
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D53"), // Status
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{TRSTATUS_T}",
                                    editable: false,
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M8 S12"
                                    })
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D60"), // Last Changed
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{AS4DATE}",
                                    editable: false,
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M4 S12"
                                    })
                                }),
                                new sap.m.Input({
                                    value: "{AS4TIME}",
                                    editable: false,
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M4 S12"
                                    })
                                })
                            ]

                        })

                    ]
                }),

                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D61"), // Source Client
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{CLIENT}",
                                    editable: false,
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M4 S12"
                                    })
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D62"), // Target
                                design: sap.m.LabelDesign.Bold
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{TARSYSTEM}",
                                    layoutData: new sap.ui.layout.GridData({
                                        span: "XL4 L4 M4 S12"
                                    })
                                })
                            ]
                        }),

                    ]
                })

            ]
        });

    };

    oAPP.fn.fngetCtsNewForm3 = function() {


    };


    /************************************************************************
     * CTS 신규 생성 Dialog의 AfterOpen 이벤트
     ************************************************************************/
    oAPP.events.ev_ctsNewDlgAfterOpen = function() {

        var oUserInfo = parent.getUserInfo();

        var oNewCts = {
            TRKORR: "",
            AS4TEXT: "",
            AS4USER: oUserInfo.ID.toUpperCase(),
            TRSTATUS_T: "New",
            AS4DATE: new Date().format("yyyy-MM-dd"),
            AS4TIME: new Date().format("HH:mm:ss"),
            CLIENT: oUserInfo.CLIENT,
            TARSYSTEM: "",
            GT_TASKS: [{
                USER: ""
            }]
        };

        APPCOMMON.fnSetModelProperty(C_CTS_NEW_BIND_ROOT_PATH, oNewCts);

    }; // end of oAPP.events.ev_ctsNewDlgAfterOpen

    /************************************************************************
     * Cts Dialog의 Accept 버튼
     * **********************************************************************/
    oAPP.events.ev_CtsPopupAccept = function() {

        var oCtsInfo = APPCOMMON.fnGetModelProperty("/CTS/CTSHEAD");

        if (oCtsInfo.CTSNO == "") {
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "268"); // Selected line does not exists.
            parent.showMessage(sap, 10, null, sMsg);
            return;
        }

        var oTable = sap.ui.getCore().byId(C_CTS_TB_ID);
        if (oTable == null) {
            return;
        }

        // 테이블의 선택된 라인의 바인딩 정보를 구한다.
        var iSelIdx = oTable.getSelectedIndex(),
            oCtx = oTable.getContextByIndex(iSelIdx),
            sBindPath = oCtx.sPath,
            oBindData = APPCOMMON.fnGetModelProperty(sBindPath);

        // 선택된 CTS 정보의 Parent, child 번호를 전달한다.        
        if (typeof GfnCtsCallback === "function") {
            GfnCtsCallback(oBindData);
        }

        var oCtsDialog = sap.ui.getCore().byId(C_DLG_ID);
        if (oCtsDialog) {
            oCtsDialog.close();
        }

    }; // end of oAPP.events.ev_CtsPopupAccept

    /************************************************************************
     * Cts Tree Table Row Select Event
     * **********************************************************************/
    oAPP.events.ev_CtsTreeTableRowSelect = function(oEvent) {

        var oTable = oEvent.getSource(),
            iSelIdx = oEvent.getParameter("rowIndex");

        oTable.setSelectedIndex(iSelIdx);

        var oCtsHeadInfo = APPCOMMON.fnGetModelProperty("/CTS/CTSHEAD");
        oCtsHeadInfo.CTSNO = "";
        oCtsHeadInfo.CTSDESC = "";

        APPCOMMON.fnSetModelProperty("/CTS/CTSHEAD", oCtsHeadInfo);

        // 선택한 라인이 있는지 체크
        if (iSelIdx < 0) {
            return;
        }

        var oCtx = oTable.getContextByIndex(iSelIdx),
            oTableModel = oTable.getModel(),
            oModelData = oTableModel.getProperty(oCtx.sPath);

        // // Target System 영역을 클릭 했을 경우 리턴
        // if (oModelData.ISROOT == 'X' && oModelData.TARSYSTEM == 'X') {
        //     oTable.clearSelection();
        //     return;
        // }

        var TRKORR = oModelData.TRKORR,
            AS4TEXT = oModelData.AS4TEXT,
            STRKORR = oModelData.STRKORR;

        oCtsHeadInfo.CTSNO = TRKORR;
        oCtsHeadInfo.CTSDESC = AS4TEXT;

        var oCtsInfo = {
            PARENT: "",
            CHILD: ""
        }

        // 선택한 CTS의 Parent, Child 번호를 구한다.
        oCtsInfo.CHILD = TRKORR;
        oCtsInfo.PARENT = STRKORR;

        // if (oModelData.ISROOT != 'X') {
        //     oCtsInfo.PARENT = STRKORR;
        // }

        // CTS 팝업 상단에 CTS 정보를 뿌려줄 데이터 바인딩
        APPCOMMON.fnSetModelProperty("/CTS/CTSHEAD", oCtsHeadInfo);

        // 선택한 CTS의 부모 자식 정보를 콜백 메소드로 전달할 데이터
        APPCOMMON.fnSetModelProperty("/CTS/SEL_CTS", oCtsInfo);

    };

    /************************************************************************
     * CTS 팝업을 띄우기 전 Dialog 초기화 및 Busy Indicator 켜기
     ************************************************************************/
    oAPP.events.ev_CtsDlgBeforeOpen = function() {

        var oCts = {
            ISBUSY: true,
            CTSHEAD: {}
        }

        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oCts);

    }; // end of oAPP.events.ev_CtsDlgBeforeOpen

    /************************************************************************
     * CTS 팝업을 띄운 후 CTS 정보 불러오는 로직
     ************************************************************************/
    oAPP.events.ev_GetCtsDialogAfterOpen = function() {

        var oTable = sap.ui.getCore().byId(C_CTS_TB_ID);
        if (oTable != null) {
            oTable.clearSelection();
        }

        var sPath = parent.getServerPath() + '/getctsdata',
            oUserInfo = parent.getUserInfo(),
            oFormData = new FormData();

        oFormData.append("USRID", oUserInfo.ID);

        sendAjax(sPath, oFormData, oAPP.fn.fnGetCtsDataSucc, null, null, 'POST', oAPP.fn.fnGetCtsDataErr);

    }; // end of oAPP.events.ev_GetCtsDialogAfterOpen    

    /************************************************************************
     * CTS 팝업을 닫은 후 이벤트
     ************************************************************************/
    oAPP.events.ev_CtsDlgAfterClose = function() {

        // CTS 팝업을 닫으면 CTS 모델을 초기화 한다.
        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, undefined);

    }; // end of oAPP.events.ev_CtsDlgAfterClose


})(window, $, oAPP);