/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnWebSecurityPopupOpen.js
 * - file Desc : WS20의 Web Security Settings Popup
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Root Variable Area..
     ************************************************************************/
    const
        C_BIND_ROOT_PATH = "/WS20/WEBSECU",
        C_DLG_ID = "u4aWsWebSecurityDialog",
        C_WHILIST_TABLE_ID = "WebSecurityXFrameTable";

    var APPCOMMON = oAPP.common;

    oAPP.fn.fnWebSecurityPopupOpen = function() {

        var oWebSecuDlg = sap.ui.getCore().byId(C_DLG_ID);
        if (oWebSecuDlg) {
            oWebSecuDlg.open();
            return;
        }

        var oContents = oAPP.fn.fnGetWebSecurityPopupContents(),

            oWebSecuDlg = new sap.m.Dialog(C_DLG_ID, {
                showHeader: false,
                draggable: true,
                resizable: true,
                contentWidth: "600px",
                contentHeight: "600px",
                customHeader: new sap.m.Toolbar({
                    content: [
                        new sap.ui.core.Icon({
                            src: "sap-icon://shield"
                        }),

                        new sap.m.Title({
                            text: "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C86"), // Web Security Management
                        }).addStyleClass("sapUiTinyMarginBegin"),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://decline",
                            press: function() {
                                // web security Dialog를 닫는다.
                                oAPP.fn.fnWebSecurityPopupClose();
                            }
                        })
                    ]
                }),
                buttons: [
                    new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        icon: "sap-icon://accept",
                        press: oAPP.events.ev_pressWebSecuritySave
                    }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                    new sap.m.Button({
                        type: sap.m.ButtonType.Negative,
                        icon: "sap-icon://delete",
                        press: oAPP.events.ev_pressWebSecurityDel
                    }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                    new sap.m.Button({
                        type: sap.m.ButtonType.Reject,
                        icon: "sap-icon://decline",
                        press: function(oEvent) {

                            // web security Dialog를 닫는다.
                            oAPP.fn.fnWebSecurityPopupClose();

                        }
                    }),
                ],

                content: [
                    oContents
                ],

                afterOpen: oAPP.events.ev_webSecurityPopupAfterOpen,

                afterClose: function(oEvent) {

                    // white list 테이블에 체크박스 해제
                    oAPP.fn.fnSetWhiteListTableClearSelection();

                },
                escapeHandler: function() {

                    // web security Dialog를 닫는다.
                    oAPP.fn.fnWebSecurityPopupClose();

                }

            }).addStyleClass(C_DLG_ID);

        oWebSecuDlg.bindElement(C_BIND_ROOT_PATH);

        oWebSecuDlg.open();
    };

    /************************************************************************
     * WebSecurity Popup의 Contents
     ************************************************************************/
    oAPP.fn.fnGetWebSecurityPopupContents = function() {

        var aPanelTopContents = oAPP.fn.fnGetWebSecurityPopupPanelTopContents(), // Access-Control-Allow-Origin
            oPanelBottomContents = oAPP.fn.fnGetWebSecurityPopupPanelBottomContents(); // X-Frame-Options

        return new sap.m.Page({
            showHeader: false,
            content: [
                new sap.m.Panel({
                    headerText: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C89"), // Access-Control-Allow-Origin
                    content: aPanelTopContents
                }),

                new sap.m.Panel({
                    headerText: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C87"), // X-Frame-Options
                    content: [
                        oPanelBottomContents
                    ]
                }).addStyleClass("sapUiSmallMarginTop")
            ]
        });

    }; // end of oAPP.fn.fnGetWebSecurityPopupContents

    /************************************************************************
     * WebSecurity Popup의 Access-Control-Allow-Origin Paneld의 Contents
     ************************************************************************/
    oAPP.fn.fnGetWebSecurityPopupPanelTopContents = function() {

        return [
            new sap.m.RadioButtonGroup({
                buttons: [
                    new sap.m.RadioButton({
                        groupName: "OriginGroup",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C90"), // Origin: * (Origin Not Assign)
                    }),
                    new sap.m.RadioButton({
                        groupName: "OriginGroup",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C91"), // Currently Accessed Host
                    }),
                    new sap.m.RadioButton({
                        groupName: "OriginGroup",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C92"), // Specific External Host
                    }),
                ],
                select: oAPP.events.ev_selectAcaRadioButton
            })
            .bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding)
            .bindProperty("selectedIndex", {
                parts: [
                    "ACA"
                ],
                formatter: function(oACA) {

                    if (typeof oACA === "undefined") {
                        return;
                    }

                    switch ("X") {
                        case oACA.M01:
                            return 0;

                        case oACA.M02:
                            return 1;

                        case oACA.M03:
                            return 2;

                        default:
                            oACA.M01 = "X";
                            return 0;
                    }

                }
            }),

            new sap.m.HBox({
                renderType: sap.m.FlexRendertype.Bare,
                alignItems: sap.m.FlexAlignItems.Center,
                items: [
                    new sap.m.Text({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C73"), // External Host URL
                        width: "120px"
                    }),
                    new sap.m.Input({
                        value: "{ACA/EUL}"
                    }).bindProperty("editable", {
                        parts: [
                            "/WS20/APP/IS_EDIT",
                            "ACA"
                        ],
                        formatter: function(IS_EDIT, oACA) {

                            if (IS_EDIT == null) {
                                return false;
                            }

                            // DISPLAY 모드였을 경우 무조건 잠근다.
                            var bIsEdit = (IS_EDIT == "X" ? true : false);

                            if (!bIsEdit) {
                                return false;
                            }

                            // Change 모드 이면서, 라디오 항목 중 'Specific External Host' 를 선택 했을 경우에만 Editable: true
                            if (typeof oACA === "undefined") {
                                return false;
                            }

                            if (oACA.M03 == 'X') {
                                return true;
                            }

                            return false;

                        }
                    })

                ]
            })
        ];

    }; // end of oAPP.fn.fnGetWebSecurityPopupPanelTopContents

    /************************************************************************
     * WebSecurity Popup의 X-Frame-Options Panel의 Contents
     ************************************************************************/
    oAPP.fn.fnGetWebSecurityPopupPanelBottomContents = function() {

        var oXframeToolbar = oAPP.fn.fnGetXframeTableToolbar(),
            oXframeExt = oAPP.fn.fnGetXframeTableExtension();

        var oXframeBindProp = {
            parts: [
                "/WS20/APP/IS_EDIT",
                C_BIND_ROOT_PATH + "/XFO"
            ],
            formatter: function(IS_EDIT, oXfo) {

                if (IS_EDIT == null) {
                    return false;
                }

                // DISPLAY 모드였을 경우 무조건 잠근다.
                var bIsEdit = (IS_EDIT == "X" ? true : false);
                if (!bIsEdit) {
                    return false;
                }

                if (oXfo != null) {

                    var oTable = this.getParent().getParent();

                    // Change 모드 이면서, 라디오 항목 중 'Allow-from' 를 선택 했을 경우에만 Editable: true
                    if (oXfo.M03 == "X") {
                        oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
                        return true;
                    }

                    oTable.setSelectionMode(sap.ui.table.SelectionMode.None);

                }

                return false;

            }
        };

        return new sap.ui.table.Table(C_WHILIST_TABLE_ID, {
                // selectionMode: sap.ui.table.SelectionMode.None,
                selectionBehavior: sap.ui.table.SelectionBehavior.Row,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
                visibleRowCount: 5,
                columns: [
                    new sap.ui.table.Column({
                        width: "150px",
                        label: new sap.m.Label({
                            text: "SID",
                            design: sap.m.LabelDesign.Bold
                        }),
                        template: new sap.m.Input({
                            value: "{SID}"
                        }).bindProperty("editable", oXframeBindProp)
                    }),

                    new sap.ui.table.Column({
                        label: new sap.m.Label({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C71"), // Target Host URL
                            design: sap.m.LabelDesign.Bold
                        }),
                        template: new sap.m.Input({
                            value: "{SRC}"
                        }).bindProperty("editable", oXframeBindProp)
                    }),
                ],
                rows: {
                    path: "WHIT",
                },
                toolbar: oXframeToolbar,

                extension: [
                    oXframeExt
                ]

            }).bindProperty("selectionMode", "/WS20/APP/IS_EDIT", function(bIsMode) {

                var bIsMode = (bIsMode == "X" ? true : false);

                if (bIsMode) {
                    return sap.ui.table.SelectionMode.MultiToggle;
                }

                return sap.ui.table.SelectionMode.None;

            })
            .addStyleClass("sapUiSizeCompact")
            .addStyleClass(C_WHILIST_TABLE_ID);

    }; // end of oAPP.fn.fnGetWebSecurityPopupPanelBottomContents

    /************************************************************************
     *  X-Frame-Options Table Toolbar UI
     ************************************************************************/
    oAPP.fn.fnGetXframeTableToolbar = function() {

        return new sap.m.Toolbar({
            content: [
                new sap.m.RadioButtonGroup({
                    columns: 4,
                    buttons: [
                        new sap.m.RadioButton({
                            groupName: "xframeGroup",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C93"), // SameOrigin
                        }),
                        new sap.m.RadioButton({
                            groupName: "xframeGroup",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C94"), // Deny
                        }),
                        new sap.m.RadioButton({
                            groupName: "xframeGroup",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C95"), // Allow-From
                        }),
                        new sap.m.RadioButton({
                            groupName: "xframeGroup",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C96"), // None(Not Recommend)
                        }),
                    ],
                    select: oAPP.events.ev_selectXfoRadioButton
                })
                .bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding)
                .bindProperty("selectedIndex", {
                    parts: [
                        "XFO",
                        C_BIND_ROOT_PATH + "/WHIT"
                    ],
                    formatter: function(oXfo, aWhit) {

                        if (typeof oXfo === "undefined") {
                            return;
                        }

                        // white list가 있는 경우
                        if (aWhit != null && aWhit instanceof Array == true) {

                            // X-Frame-Option이 "Allow-From" 이 아니면서 white list가 있는 경우는
                            // white list 데이터를 전부 지운다.
                            if (oXfo.M03 != "X" && aWhit.length > 0) {

                                while (aWhit.length) {
                                    aWhit.splice(aWhit.length - 1, 1);
                                }

                                APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH + "/WHIT", aWhit);

                            }

                        }

                        switch ("X") {
                            case oXfo.M01:
                                return 0;

                            case oXfo.M02:
                                return 1;

                            case oXfo.M03:
                                return 2;

                            case oXfo.M04:
                                return 3;

                            default:
                                oXfo.M01 = "X";
                                return 0;
                        }

                    }

                })
            ]
        });

    }; // end of oAPP.fn.fnGetXframeTableToolbar

    /************************************************************************
     *  X-Frame-Options Table Extension UI
     ************************************************************************/
    oAPP.fn.fnGetXframeTableExtension = function() {

        var lfAddDelBtnBindProp = function(bIsDispMode, oXFO) {

            if (bIsDispMode == null) {
                return false;
            }

            var bIsDisp = (bIsDispMode == "X" ? true : false);

            if (!bIsDisp) {
                return bIsDisp;
            }

            if (oXFO == null || oXFO.M03 != "X") {
                return false;
            }

            return true;

        };

        return new sap.m.Toolbar({
            content: [
                new sap.m.Text({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C97"), // White List
                }),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C98"), // Add
                    icon: "sap-icon://document",
                    press: oAPP.events.ev_pressXframeOptionAdd
                })
                .bindProperty("enabled", {
                    parts: [
                        "/WS20/APP/IS_EDIT",
                        C_BIND_ROOT_PATH + "/XFO"
                    ],
                    formatter: lfAddDelBtnBindProp
                }),
                new sap.m.Button({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03"), // Delete
                    icon: "sap-icon://delete",
                    type: sap.m.ButtonType.Negative,
                    press: oAPP.events.ev_pressXframeOptionDel
                }).bindProperty("enabled", {
                    parts: [
                        "/WS20/APP/IS_EDIT",
                        C_BIND_ROOT_PATH + "/XFO"
                    ],
                    formatter: lfAddDelBtnBindProp
                }),
            ]
        });

    }; // end of oAPP.fn.fnGetXframeTableExtension

    /**************************************************************************
     * White List Table 체크 박스 선택 해제 이벤트
     * ************************************************************************/
    oAPP.fn.fnSetWhiteListTableClearSelection = function() {

        var oTable = sap.ui.getCore().byId(C_WHILIST_TABLE_ID);
        if (!oTable) {
            return;
        }

        // 테이블에 체크박스가 체크되어 있다면 전체 해제
        oTable.clearSelection();

    }; // end of oAPP.fn.fnSetWhiteListTableClearSelection

    /**************************************************************************
     * Web Security popup close
     * ************************************************************************/
    oAPP.fn.fnWebSecurityPopupClose = function() {

        var oDialog = sap.ui.getCore().byId(C_DLG_ID);
        if (!oDialog) {
            return;
        }

        oDialog.close();

    }; // end of oAPP.fn.fnWebSecurityPopupClose

    /**************************************************************************
     * X-Frame-Options White List 추가버튼 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressXframeOptionAdd = function() {

        var sKey = parent.getRandomKey(10),
            oNewRow = {
                KEY: sKey,
                SID: "",
                SRC: ""
            },
            sWhiteListBindPath = C_BIND_ROOT_PATH + "/WHIT";

        // 테이블에 체크박스가 체크되어 있다면 전체 해제
        oAPP.fn.fnSetWhiteListTableClearSelection();

        // 신규 Row를 추가한다.
        var aTableData = APPCOMMON.fnGetModelProperty(sWhiteListBindPath);
        if (!aTableData || aTableData.length <= 0) {
            APPCOMMON.fnSetModelProperty(sWhiteListBindPath, [oNewRow]);
            return;
        }

        aTableData.push(oNewRow);

        APPCOMMON.fnSetModelProperty(sWhiteListBindPath, aTableData);

    }; // end of oAPP.events.ev_pressXframeOptionAdd

    /**************************************************************************
     * X-Frame-Options White List 삭제버튼 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressXframeOptionDel = function() {

        var oWhiteListTable = sap.ui.getCore().byId(C_WHILIST_TABLE_ID);
        if (!oWhiteListTable) {
            return;
        }

        var aSelIdx = oWhiteListTable.getSelectedIndices(),
            iSelLenth = aSelIdx.length;

        if (iSelLenth <= 0) {
            return;
        }

        var sWhiteListBindPath = C_BIND_ROOT_PATH + "/WHIT",
            aTableData = jQuery.extend(true, [], APPCOMMON.fnGetModelProperty(sWhiteListBindPath));

        for (var i = 0; i < iSelLenth; i++) {

            var iSelIdx = aSelIdx[i],
                oCtx = oWhiteListTable.getContextByIndex(iSelIdx),
                sKey = oCtx.getObject("KEY"),
                iFindIndex = aTableData.findIndex((DATA) => DATA.KEY == sKey);

            if (iFindIndex < 0) {
                continue;
            }

            aTableData.splice(iFindIndex, 1);
        }

        APPCOMMON.fnSetModelProperty(sWhiteListBindPath, aTableData);

        oWhiteListTable.clearSelection();

    }; // end of oAPP.events.ev_pressXframeOptionDel


    /**************************************************************************
     * Access-Control-Allow-Origin 영역의 라디오 버튼 그룹 선택 이벤트
     * ************************************************************************/
    oAPP.events.ev_selectAcaRadioButton = function(oEvent) {

        var sAccessControlBindPath = C_BIND_ROOT_PATH + "/ACA",
            iSelIdx = oEvent.getParameter("selectedIndex"),
            oModelData = APPCOMMON.fnGetModelProperty(sAccessControlBindPath);

        // 모델 데이터를 클리어 한다.
        for (var key in oModelData) {

            if (key.startsWith("M") === false) {
                continue;
            }

            oModelData[key] = "";
        }


        switch (iSelIdx) {
            case 0:
                oModelData.M01 = "X";
                break;

            case 1:
                oModelData.M02 = "X";
                break;

            case 2:
                oModelData.M03 = "X";
                break;

            default:
                break;
        }

        APPCOMMON.fnSetModelProperty(sAccessControlBindPath, oModelData, true);

    }; // end of oAPP.events.ev_selectAcaRadioButton

    /**************************************************************************
     * X-Frame-Options 영역의 라디오 버튼 그룹 선택 이벤트
     * ************************************************************************/
    oAPP.events.ev_selectXfoRadioButton = function(oEvent) {

        var sXframeOptionBindPath = C_BIND_ROOT_PATH + "/XFO",
            iSelIdx = oEvent.getParameter("selectedIndex"),
            oModelData = APPCOMMON.fnGetModelProperty(sXframeOptionBindPath);

        // 모델 데이터 전체 클리어
        for (var key in oModelData) {

            oModelData[key] = "";

        }

        // 선택한 라디오 버튼에 따라 모델 데이터 변경
        switch (iSelIdx) {
            case 0:
                oModelData.M01 = "X";
                break;

            case 1:
                oModelData.M02 = "X";
                break;

            case 2:
                oModelData.M03 = "X";
                break;

            case 3:
                oModelData.M04 = "X";
                break;

            default:
                break;
        }

        APPCOMMON.fnSetModelProperty(sXframeOptionBindPath, oModelData, true);

    }; // end of oAPP.events.ev_selectXfoRadioButton

    /**************************************************************************
     * WebSecurityDialog 의 저장 버튼 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressWebSecuritySave = function() {

        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "010"); // Do you want to save it?

        // 질문 팝업?
        parent.showMessage(sap, 30, 'I', sMsg, oAPP.events.ev_pressWebSecuritySaveCB);

    }; // end of oAPP.events.ev_pressWebSecuritySave

    /**************************************************************************
     * WebSecurityDialog 의 저장 버튼 클릭시 질문 팝업 콜백 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressWebSecuritySaveCB = function(TYPE) {

        if (TYPE == null || TYPE == "NO") {
            return;
        }

        // 현재 바인딩된 web security 정보를 읽는다.
        var oWsoData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH),
            oXfo = oWsoData.XFO,
            aWhit = oWsoData.WHIT,
            aWhitList = jQuery.extend(true, [], oWsoData.WHIT),
            iWhitLength = aWhitList.length;

        // X-Frame-Options영역에서 "Allow-From" 을 선택했을 경우 white list 테이블에 SID와 URL 값이 없는 것 삭제
        if (oXfo.M03 == "X" && iWhitLength >= 0) {

            for (var i = 0; i < iWhitLength; i++) {

                var oWhitItem = aWhitList[i];

                if (oWhitItem.SID != "" && oWhitItem.SRC != "") {
                    continue;
                }

                var sKey = oWhitItem.KEY,
                    iFindIndex = aWhit.findIndex((DATA) => DATA.KEY == sKey);

                if (iFindIndex < 0) {
                    continue;
                }

                aWhit.splice(iFindIndex, 1);

            }

            APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oWsoData);

        }

        oAPP.DATA.APPDATA.S_WSO = oWsoData;

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

        // 저장 성공 메시지
        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "002"); // Saved success
        parent.showMessage(sap, 10, null, sMsg);

        // web security Dialog를 닫는다.
        oAPP.fn.fnWebSecurityPopupClose();

    }; // end of oAPP.events.ev_pressWebSecuritySaveCB

    /**************************************************************************
     * WebSecurityDialog 의 삭제 버튼 이벤트
     * ************************************************************************/
    oAPP.events.ev_pressWebSecurityDel = function() {

        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "003"); // Do you really want to delete the object?

        // 질문 팝업?
        parent.showMessage(sap, 30, 'W', sMsg, oAPP.events.ev_pressWebSecurityDelCB);

    }; // end of oAPP.events.ev_pressWebSecurityDel

    /**************************************************************************
     * WebSecurityDialog 의 삭제 버튼 질문 팝업 콜백 펑션
     * ************************************************************************/
    oAPP.events.ev_pressWebSecurityDelCB = function(TYPE) {

        if (TYPE == null || TYPE == "NO") {
            return;
        }

        var oWsoDef = jQuery.extend(true, {}, oAPP.DATA.APPDATA.S_WSO_DEF);

        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oWsoDef, true);

    }; // end of oAPP.events.ev_pressWebSecurityDelCB

    /**************************************************************************
     * WebSecurityDialog 의 AfterOpen 이벤트
     * ************************************************************************/
    oAPP.events.ev_webSecurityPopupAfterOpen = function() {

        var oWsoData = jQuery.extend(true, {}, oAPP.DATA.APPDATA.S_WSO),
            aWhit = oWsoData.WHIT,
            iWhitLength = aWhit.length;

        if (iWhitLength >= 0) {

            for (var i = 0; i < iWhitLength; i++) {

                var sKey = parent.getRandomKey(10),
                    oWhitItem = aWhit[i];

                oWhitItem.KEY = sKey;

            }

        }

        // UI Where to Use the Event 데이터를 가지고 모델에 저장한다.
        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oWsoData);

    }; // end of oAPP.events.ev_webSecurityPopupAfterOpen


})(window, $, oAPP);