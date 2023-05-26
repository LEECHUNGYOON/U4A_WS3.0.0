const
    C_BIND_ROOT_PATH = "/APPF4",
    C_DIALOG_ID = "AppF4Dialog";

var APPCOMMON = oAPP.common,
    REMOTE = require('@electron/remote'),
    PATH = REMOTE.require('path'),
    FS = REMOTE.require("fs"),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSUTIL = require(PATHINFO.WSUTIL),
    GfnCallback;

var oWsSettingInfo = WSUTIL.getWsSettingsInfo(),
    bIsTrial = oWsSettingInfo.isTrial;

oAPP.fn = {};
oAPP.events = {};

var sap;

oAPP.common.fnSetBusyLock = function (pIsBusy) {

    let oDialog = sap.ui.getCore().byId(C_DIALOG_ID);
    if (!oDialog) {
        return;
    }

    let bIsBusy = (pIsBusy == "X" ? true : false);

    oDialog.setBusy(bIsBusy);

    if (bIsBusy) {
        sap.ui.getCore().lock();
        return;
    }

    sap.ui.getCore().unlock();

}; // end of oAPP.common.fnSetBusyLock

/************************************************************************
     * WS10에 있는 APPID F4 HELP 팝업내의 TAB CONTAINER 생성
     ************************************************************************/
oAPP.fn.fnCreateAppF4TabCon = function () {

    var oItem1 = oAPP.fn.fnCreateAppF4Tab1(),
        oItem2 = oAPP.fn.fnCreateAppF4Tab2();

    var oIconTab = new sap.m.IconTabBar("appf4tab", {
        backgroundDesign: sap.m.BackgroundDesign.Transparent,
        selectedKey: "K1",
        expandable: false,
        items: [
            oItem1,
            oItem2,
        ],
        select: function (oEvent) {

            var oDialog = sap.ui.getCore().byId("AppF4Dialog");
            if (!oDialog) {
                return;
            }

            var oModelData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH),
                oOptions = oModelData.options,
                // oInitCond = oOptions.initCond,
                bAutoSearch = oOptions.autoSearch;

            var sSelectedKey = oEvent.getParameter("key"),
                sBeforeKey = oAPP.global.beforeSelectedKey;

            // 이전에 선택한 키와 현재 선택한 키가 다를 경우에만 선택한 키 정보를 글로벌 변수에 저장
            if (sSelectedKey != sBeforeKey) {
                oAPP.global.beforeSelectedKey = sSelectedKey;
            }

            // // 이전에 선택한 키와 현재 선택한 키가 같으면 
            // if (sSelectedKey == sBeforeKey) {
            //     return;
            // }

            switch (sSelectedKey) {

                case "K1":

                    var oTree = sap.ui.getCore().byId("appf4tree"),
                        oInput = sap.ui.getCore().byId("appf4_packg");

                    if (oTree) {
                        oTree.clearSelection();
                        oTree.collapseAll();

                        // Binding data 없이 expandToLevel 실행하면 core에서 assert 경고 메시지가 발생한다.
                        if (oTree.getBinding()) {
                            oTree.expandToLevel(1);
                        }

                    }

                    // // 패키지별 트리 APP 모델 초기화 
                    // APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH + "/APPF4HIER", null);

                    APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oModelData);

                    oDialog.setInitialFocus(oInput);

                    if (!bAutoSearch) {
                        return;
                    }

                    oInput.fireSubmit();

                    break;

                case "K2":

                    // App Hierarchy 정보 구하기..
                    oAPP.fn.fnGetAppHierList();

                    break;

                default:
                    break;

            }
        }

    }).addStyleClass("u4aAppF4IconTabbar");

    return oIconTab;

}; // end of oAPP.fn.fnCreateAppF4TabCon

/************************************************************************
 * Application Name F4 의 TabContainer Item1 생성
 ************************************************************************/
oAPP.fn.fnCreateAppF4Tab1 = function () {

    var ENUM_LABEL_DESIGN_BOLD = sap.m.LabelDesign.Bold;

    var oForm = new sap.ui.layout.form.Form({
        editable: true,
        layout: new sap.ui.layout.form.ResponsiveGridLayout({
            labelSpanXL: 2,
            labelSpanL: 3,
            labelSpanM: 3,
            labelSpanS: 12,
            singleContainerFullSize: true
        }),
        formContainers: [
            new sap.ui.layout.form.FormContainer({
                formElements: [
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22"), // Package
                        }),
                        fields: new sap.m.Input("appf4_packg", {
                            value: "{PACKG}",
                            submit: oAPP.events.ev_AppF4Search
                        }).bindProperty("enabled", {
                            parts: [
                                `${C_BIND_ROOT_PATH}/ISTRIAL`
                            ],
                            formatter: (IS_TRIAL) => {

                                /**
                                 * Only Trial Version Specific
                                 */

                                return !IS_TRIAL;

                            }
                        })
                    }),
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
                        }),
                        fields: new sap.m.Input({
                            width: "200px",
                            value: "{ERUSR}",
                            submit: oAPP.events.ev_AppF4Search
                        }).bindProperty("enabled", {
                            parts: [
                                `${C_BIND_ROOT_PATH}/ISTRIAL`
                            ],
                            formatter: (IS_TRIAL) => {

                                /**
                                 * Only Trial Version Specific
                                 */

                                return !IS_TRIAL;

                            }
                        })
                    }),
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
                        }),
                        fields: new sap.m.Input({
                            value: "{APPID}",
                            submit: oAPP.events.ev_AppF4Search
                        })
                    }),
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
                        }),
                        fields: new sap.m.Input({
                            value: "{APPNM}",
                            submit: oAPP.events.ev_AppF4Search
                        })
                    }),
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B02"), // Web Application Type
                        }),
                        fields: new sap.m.Select({
                            selectedKey: "{APPTY}",
                            showSecondaryValues: true,
                            items: {
                                path: `${C_BIND_ROOT_PATH}/aAPPTY`,
                                template: new sap.ui.core.ListItem({
                                    key: "{KEY}",
                                    text: "{KEY}",
                                    additionalText: "{TEXT}"
                                })
                            },
                            change: function (oEvent) {

                                var oSelectedItem = oEvent.getParameter("selectedItem"),
                                    sSelectedKey = oSelectedItem.getProperty("key");

                                oAPP.attr.gAPPTY = sSelectedKey;

                                oAPP.events.ev_AppF4Search();

                            }

                        }).bindProperty("enabled", {
                            parts: [
                                "APPTY",
                                "EXPAGE"
                            ],
                            formatter: (APPTY, EXPAGE) => {

                                if (!APPTY || !EXPAGE) {
                                    return false;
                                }

                                // WS10번 페이지가 아니면 Application Type을 Disable 처리한다.
                                if (EXPAGE != "WS10") {
                                    return false;
                                }


                                return true;

                            }
                        })

                    }),
                    new sap.ui.layout.form.FormElement({
                        label: new sap.m.Label({
                            design: ENUM_LABEL_DESIGN_BOLD,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A76"), // Maximum No, of Hits
                        }),
                        fields: new sap.m.Input({
                            width: "100px",
                            value: "{HITS}",
                            submit: oAPP.events.ev_AppF4Search
                        })
                    }),
                ]
            }),
        ]
    });

    // form Ui에 대한 바인딩 루트 패스 지정
    oForm.bindElement(`${C_BIND_ROOT_PATH}/TAB1`);

    var sHeaderText = "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B94"), // All App.

        oPanel = new sap.m.Panel({
            headerText: sHeaderText,
            backgroundDesign: sap.m.BackgroundDesign.Transparent,
            expandable: true,
            expanded: true,
            content: oForm,
        }).addStyleClass("sapUiNoContentPadding"),

        sTableListBindPath = `${C_BIND_ROOT_PATH}/TAB1/APPLIST`,

        oTable = oAPP.fn.fnGetAppF4ListTable(sTableListBindPath),
        oUiTable = getAppF4ListUiTable(sTableListBindPath);

    var oItem = new sap.m.IconTabFilter({
        key: "K1",
        text: sHeaderText,
        content: [
            new sap.m.VBox({
                renderType: sap.m.FlexRendertype.Bare,
                height: "100%",
                items: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [oPanel]
                    }),
                    new sap.m.Page({
                        showHeader: false,
                        content: [
                            // oTable
                            oUiTable
                        ]
                    }),

                ]
            }),

        ]
    });

    return oItem;

}; // end of oAPP.fn.fnCreateAppF4Tab1

/************************************************************************
* APP SearchHelp의 App List UI Table object return
************************************************************************/
function getAppF4ListUiTable(sBindPath) {

    return new sap.ui.table.Table({
        visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
        alternateRowColors: true,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
        rowHeight: 45,
        columns: [

            new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
                    design: sap.m.LabelDesign.Bold
                }),

                template: new sap.m.Text({
                    text: "{ERUSR}"
                }),

            }),

            new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
                    design: sap.m.LabelDesign.Bold
                }),
                template: new sap.m.Text({
                    text: "{APPID}"
                }),

            }),

            new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
                    design: sap.m.LabelDesign.Bold
                }),
                template: new sap.m.Text({
                    text: "{APPNM}"
                }),

            }),

            new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B97"), // App Type
                    design: sap.m.LabelDesign.Bold
                }),
                template: new sap.m.Text({
                    text: "{APPTY}"
                }),

            }),

        ],

        rows: {
            path: sBindPath,
        },


    }).addEventDelegate({

        ondblclick: ev_AppF4ListUiTableDblClick

    });

} // end of getAppF4ListUiTable

/************************************************************************
 * APP SearchHelp의 App List UI Table의 더블 클릭 이벤트
 ************************************************************************/
function ev_AppF4ListUiTableDblClick(oEvent) {

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
        oRowData = oRow.getModel().getProperty(oCtx.sPath);

    if (typeof GfnCallback == "function") {
        GfnCallback(oRowData);
    }

    var oAppF4Dialog = sap.ui.getCore().byId("AppF4Dialog");
    if (oAppF4Dialog) {
        oAppF4Dialog.close();
        return;
    }

} // end of ev_AppF4ListUiTableDblClick

/************************************************************************
 * Application Name F4 의 TabContainer Item2 생성
 ************************************************************************/
oAPP.fn.fnCreateAppF4Tab2 = function () {

    function lf_nozero(sBindValue) {

        if (sBindValue == null) {
            return;
        }

        var oBindCtx = this.getBindingContext();
        if (oBindCtx == null) {
            return;
        }

        var oBindData = this.getModel().getProperty(oBindCtx.sPath);
        if (oBindData.APPID == "ROOT") {
            return "";
        }

        if (oBindData.PACKG == "ROOT") {
            return "";
        }

        return sBindValue;

    }


    var ENUM_HORIZONTAL_ALIGN = sap.ui.core.HorizontalAlign,
        sTableBindingPath = `${C_BIND_ROOT_PATH}/APPF4HIER`;

    var sHeaderText = "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B98"); // Application Hierarchy By Packages;

    var oTreeTable = new sap.ui.table.TreeTable("appf4tree", {
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
        alternateRowColors: true,
        visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
        // minAutoRowCount: 20,
        fixedColumnCount: 1,
        columns: [
            new sap.ui.table.Column({
                width: "600px",
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B99"), // U4A IDE Solution
                template: new sap.m.Text({
                    text: "{APPNM}"
                }),
            }),
            new sap.ui.table.Column({
                width: "180px",
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C01"), // Identification
                template: new sap.m.Text({
                    text: "{APPID}"
                }),
            }),
            new sap.ui.table.Column({
                width: "100px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C02"), // Active Ver.
                template: new sap.m.Text().bindProperty("text", "APPVR", lf_nozero),
            }),
            new sap.ui.table.Column({
                width: "100px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C03"), // Code Page
                template: new sap.m.Text({
                    text: "{CODPG}"
                }),
            }),
            new sap.ui.table.Column({
                width: "150px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C04"), // Theme
                template: new sap.m.Text({
                    text: "{UITHM}"
                }),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C05"), // Creator
                template: new sap.m.Text({
                    text: "{ERUSR}"
                }),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C06"), // Create Date
                template: new sap.m.Text().bindProperty("text", "ERDAT", lf_nozero),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C07"), // Create Time
                template: new sap.m.Text().bindProperty("text", "ERTIM", lf_nozero),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C08"), // Change User
                template: new sap.m.Text({
                    text: "{AEUSR}"
                }),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C09"), // Change Date
                template: new sap.m.Text().bindProperty("text", "AEDAT", lf_nozero),
            }),
            new sap.ui.table.Column({
                width: "120px",
                hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C10"), // Change Time
                template: new sap.m.Text().bindProperty("text", "AETIM", lf_nozero),
            }),
        ],
        rows: {
            path: sTableBindingPath,
            parameters: {
                arrayNames: ['APPF4HIER']
            },
        },
        extension: [
            new sap.m.OverflowToolbar({
                content: [
                    new sap.m.Button({
                        icon: "sap-icon://expand-group",
                        press: function (oEvent) {

                            var iSelIdx = oTreeTable.getSelectedIndex();
                            if (iSelIdx == -1) {
                                return;
                            }

                            var oCtx = oTreeTable.getContextByIndex(iSelIdx),
                                oData = oTreeTable.getModel().getProperty(oCtx.sPath);

                            if (oData.APPID == "ROOT") {
                                oTreeTable.expandToLevel(99);
                                return;
                            }

                            oTreeTable.expand(iSelIdx);

                        }
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://collapse-group",
                        press: function (oEvent) {

                            var iSelIdx = oTreeTable.getSelectedIndex();
                            if (iSelIdx == -1) {
                                return;
                            }

                            oTreeTable.collapse(iSelIdx);

                        }
                    }),
                ]
            })
        ],

    }).addStyleClass("u4aWsAppf4tree");

    var oItem = new sap.m.IconTabFilter({
        key: "K2",
        text: sHeaderText,
        content: [
            oTreeTable
        ]
    });

    oTreeTable.addEventDelegate({
        ondblclick: function (oEvent) {

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

            var oCtx = oRow.getBindingContext(),
                oRowData = oRow.getModel().getProperty(oCtx.sPath);

            if (oRowData.APPID == "ROOT" || oRowData.PACKG == "ROOT") {
                return;
            }

            if (typeof GfnCallback == "function") {
                GfnCallback(oRowData);
            }

            var oAppF4Dialog = sap.ui.getCore().byId("AppF4Dialog");
            if (oAppF4Dialog) {
                oAppF4Dialog.close();
                return;
            }

        }
    });

    // oTreeTable.attachBrowserEvent("dblclick", function (oEvent) {

    //     var oTarget = oEvent.target,
    //         $SelectedRow = $(oTarget).closest(".sapUiTableRow");

    //     if (!$SelectedRow.length) {
    //         return;
    //     }

    //     var oRow = $SelectedRow[0],

    //         sRowId1 = oRow.getAttribute("data-sap-ui-related"),
    //         sRowId2 = oRow.getAttribute("data-sap-ui"),
    //         sRowId = "";

    //     if (sRowId1 == null && sRowId2 == null) {
    //         return;
    //     }

    //     if (sRowId1) {
    //         sRowId = sRowId1;
    //     }

    //     if (sRowId2) {
    //         sRowId = sRowId2;
    //     }

    //     var oRow = sap.ui.getCore().byId(sRowId);
    //     if (!oRow) {
    //         return;
    //     }

    //     var oCtx = oRow.getBindingContext(),
    //         oRowData = oRow.getModel().getProperty(oCtx.sPath);

    //     if (oRowData.APPID == "ROOT" || oRowData.PACKG == "ROOT") {
    //         return;
    //     }

    //     if (typeof GfnCallback == "function") {
    //         GfnCallback(oRowData);
    //     }

    //     var oAppF4Dialog = sap.ui.getCore().byId("AppF4Dialog");
    //     if (oAppF4Dialog) {
    //         oAppF4Dialog.close();
    //         return;
    //     }

    // });

    return oItem;

}; // end of oAPP.fn.fnCreateAppF4Tab2

/************************************************************************
 * App Hierarchy 정보 구하기
 ************************************************************************/
oAPP.fn.fnGetAppHierList = function () {

    var sPath = parent.getServerPath() + '/getapplhierarchydata';

    sendAjax(sPath, null, lf_success);

    function lf_success(oResult) {

        var oCurrPage = parent.getCurrPage();

        if (oResult.RETCD == 'E') {

            var oCurrWin = REMOTE.getCurrentWindow();
            oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

            oAPP.common.fnSetBusyLock('');

            // 페이지 푸터 메시지
            APPCOMMON.fnShowFloatingFooterMsg("E", oCurrPage, oResult.RTMSG);

            return;
        }

        var sTreeTableBindPath = C_BIND_ROOT_PATH + "/APPF4HIER";

        // APP DATA setModel
        APPCOMMON.fnSetModelProperty(sTreeTableBindPath, oResult.T_APPL);

        var oModel = sap.ui.getCore().getModel(),
            sTreeJsonPath = sTreeTableBindPath.replace(/\//g, ".");
        sTreeJsonPath = sTreeJsonPath.replace(/^./g, "");

        // Model Data를 Tree로 구성
        oAPP.fn.fnSetTreeJson(oModel, sTreeJsonPath, "APPID", "PACKG", "APPF4HIER");

        oModel.refresh();

        oAPP.common.fnSetBusyLock('');

        // mime Tree에서 처음 실행 시 1레벨 펼치고 첫번째 라인에 셀렉션을 추가한다. 
        var oAppf4tree = sap.ui.getCore().byId("appf4tree");
        if (oAppf4tree == null) {
            return;
        }

        oAppf4tree.expandToLevel(1);
        oAppf4tree.setSelectedIndex(0);

    }

}; // end of oAPP.fn.fnGetAppHierList

/************************************************************************
 * APP SearchHelp의 App List Table Object Return
 ************************************************************************/
oAPP.fn.fnGetAppF4ListTable = function (sBindPath) {

    var oTable = new sap.m.Table({
        alternateRowColors: true,
        growing: true,
        growingScrollToLoad: true,
        growingThreshold: 50,
        sticky: ["ColumnHeaders"],
        columns: [
            new sap.m.Column({
                demandPopin: true,
                minScreenWidth: "1000px",
                header: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
                }),
            }),
            new sap.m.Column({
                demandPopin: true,
                minScreenWidth: "1000px",
                header: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
                }),
            }),
            new sap.m.Column({
                demandPopin: true,
                minScreenWidth: "1000px",
                header: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
                }),
            }),
            new sap.m.Column({
                demandPopin: true,
                minScreenWidth: "1000px",
                header: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B97"), // App Type
                }),
            }),
        ],
        items: {
            path: sBindPath,
            template: new sap.m.ColumnListItem({
                type: sap.m.ListType.Active,
                cells: [
                    new sap.m.Text({
                        text: "{ERUSR}"
                    }),
                    new sap.m.Text({
                        text: "{APPID}"
                    }),
                    new sap.m.Text({
                        text: "{APPNM}"
                    }),
                    new sap.m.Text({
                        text: "{APPTY}"
                    }),
                ]
            })
        }

    });

    oTable.addEventDelegate({
        ondblclick: function (oEvent) {

            var oTarget = oEvent.target,
                $SelectedRow = $(oTarget).closest(".sapMListTblRow, .sapMListTblSubRow");

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

            if (typeof GfnCallback == "function") {
                GfnCallback(oRowData);
            }

            var oAppF4Dialog = sap.ui.getCore().byId("AppF4Dialog");
            if (oAppF4Dialog) {
                oAppF4Dialog.close();
                return;
            }

        }
    });

    return oTable;

}; // end of oAPP.fn.fnGetAppF4ListTable

/************************************************************************
 * Application Name Search Help(F4) Ok Button
 ************************************************************************/
oAPP.events.ev_AppF4Search = function () {

    // busy 키고 Lock 걸기
    oAPP.common.fnSetBusyLock("X");

    var sAppF4BindPath = C_BIND_ROOT_PATH + "/TAB1";

    // 검색 조건 구하기
    var oSrchCond = APPCOMMON.fnGetModelProperty(sAppF4BindPath);

    if (!oSrchCond) {

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

        return;
    }

    // 서버를 호출하여 Application 정보 검색
    var sPath = parent.getServerPath() + '/getappsearch',
        oFormData = new FormData();

    oFormData.append("APPINFO", JSON.stringify(oSrchCond));

    sendAjax(sPath, oFormData, lf_AppInfo);

    function lf_AppInfo(aAppInfo) {

        // 검색 결과 모델 업데이트
        var oModelData = sap.ui.getCore().getModel().getData();

        if (oModelData.APPLIST1) {
            delete oModelData.APPLIST1;
        }

        var sAppListBindPath = C_BIND_ROOT_PATH + "/TAB1/APPLIST";

        // APPID 기준으로 오름차순 정렬해주기
        let iAppInfoLength = aAppInfo.length;
        if (iAppInfoLength > 0) {

            aAppInfo.sort(function (a, b) {
                return a.APPID < b.APPID ? -1 : a.APPID > b.APPID ? 1 : 0;

            });

        }

        APPCOMMON.fnSetModelProperty(sAppListBindPath, aAppInfo);

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

    }

}; // end of oAPP.events.ev_AppF4Search

/************************************************************************
 * Application Name Search Help(F4) Cancel Button
 ************************************************************************/
oAPP.events.ev_AppF4DialogCancel = function () {

    var oDialog = sap.ui.getCore().byId(C_DIALOG_ID);
    if (oDialog == null) {
        return;
    }

    if (oDialog.isOpen()) {
        oDialog.close();
    }

}; // end of oAPP.events.ev_AppF4DialogCancel

/************************************************************************
 * Application Name Search Help(F4) 팝업 오픈 전 이벤트
 ************************************************************************/
oAPP.events.ev_AppF4DialogAfterOpen = function (oEvent) {

    var oIconTab = sap.ui.getCore().byId("appf4tab");

    if (oIconTab == null) {
        return;
    }

    // 현재 선택된 Tab의 key를 구한다.
    var sKey = oIconTab.getSelectedKey(),
        sBeforeKey = oAPP.global.beforeSelectedKey;

    // 이전에 선택한 키값이 있다면
    if (sBeforeKey) {

        // 이전에 선택한 키값과 현재 선택된 key값이 다를 경우에만 키 값을 갱신한다.
        if (sBeforeKey != sKey) {
            sKey = sBeforeKey;
            oIconTab.setSelectedKey(sKey);
        }

    }

    oIconTab.fireSelect({
        key: sKey
    });

}; // end of oAPP.events.ev_AppF4DialogAfterOpen


module.exports = {

    open: function (oSap, options, fnCallback) {

        debugger;
        
        
        sap = oSap;

        sap.ui.require("sap.ui.table.Table");

        var oTab1_Data = options.initCond;

        var oBindData = {
            options: options,
            ISTRIAL: bIsTrial, // Trial 여부 플래그
            // APPLIST1: aAPPLIST,
            TAB1: oTab1_Data,
            aAPPTY: [{
                KEY: "M",
                TEXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B96"), // U4A Application
            },
            {
                KEY: "U",
                TEXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D48"), // U4A Server Page
            }
            ],
            APPF4HIER: null
        };

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(C_BIND_ROOT_PATH, oBindData);

        sap.ui.getCore().setModel(oJsonModel);

        // 첫번째 탭 선택
        var oTab = sap.ui.getCore().byId("appf4tab");
        if (oTab) {
            oTab.setSelectedKey("K1");
        }

        // 두번째 탭의 Tree Table
        // Select 효과 제거, 트리 레벨 전체 접기
        var oTree = sap.ui.getCore().byId("appf4tree");
        if (oTree) {
            oTree.clearSelection();
            oTree.collapseAll();
        }

        if (typeof GfnCallback !== "undefined") {
            GfnCallback = undefined;
        }

        // callback function 글로벌 변수로 저장
        GfnCallback = fnCallback;

        var oAppF4Dialog = sap.ui.getCore().byId(C_DIALOG_ID);
        if (oAppF4Dialog) {
            oAppF4Dialog.open();
            return;
        }

        // tab container 생성
        var oIconTab = oAPP.fn.fnCreateAppF4TabCon();

        let sTitleTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B96"); // U4A Application
        sTitleTxt += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A26"); // Search Help

        var oAppF4Dialog = new sap.m.Dialog(C_DIALOG_ID, {

            // Properties
            busyIndicatorDelay: 0,
            draggable: true,
            resizable: true,
            contentWidth: "100%",
            contentHeight: "100%",
            verticalScrolling: false,
            // title: "UI5 Application Search Help",
            // titleAlignment: sap.m.TitleAlignment.Center,
            // icon: "sap-icon://search",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://search"
                    }),

                    new sap.m.Title({
                        text: sTitleTxt
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: oAPP.events.ev_AppF4DialogCancel
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_AppF4DialogCancel
                }),
            ],
            content: [
                oIconTab
            ],

            // Events
            beforeOpen: oAPP.events.ev_AppF4DialogAfterOpen,
            // afterOpen: oAPP.events.ev_AppF4DialogAfterOpen,
            afterClose: oAPP.events.ev_AppF4DialogCancel

        }).addStyleClass(C_DIALOG_ID);

        oAppF4Dialog.open();


    },



};