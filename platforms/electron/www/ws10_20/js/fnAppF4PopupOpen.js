/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnAppF4PopupOpen.js
 * - file Desc : CSS, JAVASCRIPT, HTML Editor
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const USERINFO = parent.getUserInfo();
    const LANGU = USERINFO.LANGU;

    const
        C_BIND_ROOT_PATH = "/WS10/APPF4",
        C_DIALOG_ID = "AppF4Dialog";

    var APPCOMMON = oAPP.common,
        REMOTE = parent.REMOTE,
        bIsTrial = parent.getIsTrial(),
        GfnCallback;

    oAPP.fn.fnAppF4PopupOpen = function (options, fnCallback) {

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

        // 모델 업데이트
        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oBindData);

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

        oAppF4Dialog.addStyleClass("sapUiSizeCompact");

        oAppF4Dialog.open();

    }; // end of oAPP.fn.fnAppF4PopupOpen

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
                                showClearIcon: true,
                                width: "200px",
                                value: "{PACKG}",
                                submit: oAPP.events.ev_AppF4Search,
                                // liveChange: function(oEvent){

                                //     var oInput = oEvent.getSource(),
                                //         sValue = oInput.getValue();

                                //     if (typeof sValue == "string" && sValue.length > 0 && sValue !== "") {
                                //         oInput.setValue(sValue.toUpperCase());
                                //     }

                                // }

                                liveChange: function(oEvent){

                                    var oInput = oEvent.getSource(),
                                        sValue = oInput.getValue();

                                    /**
                                     * UI5의 Input에 setValue 메소드를 수행하면 무조건 커서가 맨 끝으로 이동되는 현상때문에
                                     * 텍스트의 중간부터 입력할 경우에도 setValue를 할 경우 무조건 커서가 텍스트 맨 마지막으로 
                                     * 이동되기 때문에 이전 커서 위치를 기억했다가 setValue 이후에 이전 위치로 다시 커서를 
                                     * 이동시켜야 자연스럽게 입력이 됨.
                                     */

                                    // 입력한 값의 커서 위치
                                    let beforeCurPos;

                                    let oHtmlInputDom = $(oInput.getDomRef()).find("input")[0];
                                    if(oHtmlInputDom){
                                        beforeCurPos = oHtmlInputDom.selectionStart;
                                    }

                                    if(sValue){
                                        oInput.setValue(sValue.toUpperCase());
                                    }

                                    // 입력한 값의 이전 위치로 이동
                                    if(typeof beforeCurPos !== "undefined"){
                                        oHtmlInputDom.setSelectionRange(beforeCurPos, beforeCurPos);
                                    }

                                }
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
                                showClearIcon: true,
                                width: "200px",
                                value: "{ERUSR}",
                                submit: oAPP.events.ev_AppF4Search,
                                // liveChange: function(oEvent){

                                //     var oInput = oEvent.getSource(),
                                //         sValue = oInput.getValue();

                                //     if (typeof sValue == "string" && sValue.length > 0 && sValue !== "") {
                                //         oInput.setValue(sValue.toUpperCase());
                                //     }
                                    
                                // }
                                liveChange: function(oEvent){

                                    var oInput = oEvent.getSource(),
                                        sValue = oInput.getValue();

                                    /**
                                     * UI5의 Input에 setValue 메소드를 수행하면 무조건 커서가 맨 끝으로 이동되는 현상때문에
                                     * 텍스트의 중간부터 입력할 경우에도 setValue를 할 경우 무조건 커서가 텍스트 맨 마지막으로 
                                     * 이동되기 때문에 이전 커서 위치를 기억했다가 setValue 이후에 이전 위치로 다시 커서를 
                                     * 이동시켜야 자연스럽게 입력이 됨.
                                     */

                                    // 입력한 값의 커서 위치
                                    let beforeCurPos;

                                    let oHtmlInputDom = $(oInput.getDomRef()).find("input")[0];
                                    if(oHtmlInputDom){
                                        beforeCurPos = oHtmlInputDom.selectionStart;
                                    }

                                    if(sValue){
                                        oInput.setValue(sValue.toUpperCase());
                                    }

                                    // 입력한 값의 이전 위치로 이동
                                    if(typeof beforeCurPos !== "undefined"){
                                        oHtmlInputDom.setSelectionRange(beforeCurPos, beforeCurPos);
                                    }

                                }

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
                                showClearIcon: true,
                                value: "{APPID}",
                                width: "200px",
                                submit: oAPP.events.ev_AppF4Search,
                                // liveChange: function(oEvent){

                                //     var oInput = oEvent.getSource(),
                                //         sValue = oInput.getValue();

                                //     if (typeof sValue == "string" && sValue.length > 0 && sValue !== "") {
                                //         oInput.setValue(sValue.toUpperCase());
                                //     }
                                    
                                // }
                                liveChange: function(oEvent){

                                    var oInput = oEvent.getSource(),
                                        sValue = oInput.getValue();

                                    /**
                                     * UI5의 Input에 setValue 메소드를 수행하면 무조건 커서가 맨 끝으로 이동되는 현상때문에
                                     * 텍스트의 중간부터 입력할 경우에도 setValue를 할 경우 무조건 커서가 텍스트 맨 마지막으로 
                                     * 이동되기 때문에 이전 커서 위치를 기억했다가 setValue 이후에 이전 위치로 다시 커서를 
                                     * 이동시켜야 자연스럽게 입력이 됨.
                                     */

                                    // 입력한 값의 커서 위치
                                    let beforeCurPos;

                                    let oHtmlInputDom = $(oInput.getDomRef()).find("input")[0];
                                    if(oHtmlInputDom){
                                        beforeCurPos = oHtmlInputDom.selectionStart;
                                    }

                                    if(sValue){
                                        oInput.setValue(sValue.toUpperCase());
                                    }

                                    // 입력한 값의 이전 위치로 이동
                                    if(typeof beforeCurPos !== "undefined"){
                                        oHtmlInputDom.setSelectionRange(beforeCurPos, beforeCurPos);
                                    }

                                }                                
                            })
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: ENUM_LABEL_DESIGN_BOLD,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // APP Description
                            }),
                            fields: new sap.m.Input({
                                showClearIcon: true,
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
                                        text: "{KEY}\t( {TEXT} )",
                                        // additionalText: "{TEXT}"
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
                                showClearIcon: true,
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

        let sHeaderText = "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B94"); // All App.

        let oPanel = new sap.m.Panel({
            // headerText: sHeaderText,
            backgroundDesign: sap.m.BackgroundDesign.Transparent,
            expandable: true,
            expanded: true,
            content: oForm,
        }).addStyleClass("sapUiNoContentPadding");        

        let oToolbar = new sap.m.Toolbar();
        oPanel.setHeaderToolbar(oToolbar);

        let oTitle1 = new sap.m.Title({
            text: sHeaderText
        });
        oToolbar.addContent(oTitle1);

        oTitle1.addStyleClass("sapUiTinyMarginEnd");

        let oBtn1 = new sap.m.Button({
            type: "Emphasized",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A75"), // Search
            icon: "sap-icon://search",
            press: oAPP.events.ev_AppF4Search            
        });
        oToolbar.addContent(oBtn1);

        let sTableListBindPath = `${C_BIND_ROOT_PATH}/TAB1/APPLIST`;

        // let oTable = oAPP.fn.fnGetAppF4ListTable(sTableListBindPath);
        let oUiTable = getAppF4ListUiTable(sTableListBindPath);

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


    // [원본]
    // /************************************************************************
    // * APP SearchHelp의 App List UI Table object return
    // ************************************************************************/
    // function getAppF4ListUiTable(sBindPath) {

    //     return new sap.ui.table.Table({
    //         // visibleRowCount: 1,
    //         minAutoRowCount: 1,
    //         visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
    //         alternateRowColors: true,
    //         selectionMode: sap.ui.table.SelectionMode.Single,
    //         selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
    //         rowHeight: 45,
    //         columns: [

    //             new sap.ui.table.Column({
    //                 sortProperty: "ERUSR",
    //                 filterProperty: "ERUSR",
    //                 label: new sap.m.Label({
    //                     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
    //                     design: sap.m.LabelDesign.Bold
    //                 }),

    //                 template: new sap.m.Text({
    //                     text: "{ERUSR}"
    //                 }),

    //             }),

    //             new sap.ui.table.Column({
    //                 sortProperty: "APPID",
    //                 filterProperty: "APPID",
    //                 label: new sap.m.Label({
    //                     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
    //                     design: sap.m.LabelDesign.Bold
    //                 }),
    //                 template: new sap.m.Text({
    //                     text: "{APPID}"
    //                 }),

    //             }),

    //             new sap.ui.table.Column({
    //                 sortProperty: "APPNM",
    //                 filterProperty: "APPNM",
    //                 label: new sap.m.Label({
    //                     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
    //                     design: sap.m.LabelDesign.Bold
    //                 }),
    //                 template: new sap.m.Text({
    //                     text: "{APPNM}"
    //                 }),

    //             }),

    //             new sap.ui.table.Column({
    //                 sortProperty: "APPTY",
    //                 filterProperty: "APPTY",
    //                 label: new sap.m.Label({
    //                     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B97"), // App Type
    //                     design: sap.m.LabelDesign.Bold
    //                 }),
    //                 template: new sap.m.Text({
    //                     text: "{APPTY}"
    //                 }),

    //             }),

    //         ],

    //         rows: {
    //             path: sBindPath,
    //         },


    //     }).addEventDelegate({

    //         ondblclick: ev_AppF4ListUiTableDblClick

    //     });

    // } // end of getAppF4ListUiTable


    /************************************************************************
    * APP SearchHelp의 App List UI Table object return
    ************************************************************************/
    function getAppF4ListUiTable(sBindPath) {

        let oTable = new sap.ui.table.Table({
            width: "100%",
            // visibleRowCount: 1,
            minAutoRowCount: 1,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            alternateRowColors: true,
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,            
            rowHeight: 45,
            columns: [

                new sap.ui.table.Column({
                    hAlign: "Center",
                    width: "120px",
                    sortProperty: "ERUSR",
                    filterProperty: "ERUSR",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
                        design: sap.m.LabelDesign.Bold
                    }),

                    template: new sap.m.Text({
                        text: "{ERUSR}",
                        wrapping: true,
                        tooltip: "{ERUSR}",
                    }),

                }),

                new sap.ui.table.Column({
                    width: "250px",
                    sortProperty: "APPID",
                    filterProperty: "APPID",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90"), // Web Application ID
                        design: sap.m.LabelDesign.Bold
                    }),
                    // template: new sap.m.Text({
                    //     text: "{APPID}",
                    //     wrapping: false,
                    //     tooltip: "{APPID}",
                    // }),
                    template: new sap.m.Link({
                        emphasized: true,
                        text: "{APPID}",
                        tooltip: "{APPID}",
                        press: function(oEvent){
                            
                            parent.setBusy('X');

                            if(!oEvent){                                
                                return parent.setBusy('');
                            }

                            let oUi = oEvent.getSource();
                            if(!oUi){
                                return parent.setBusy('');
                            }
                            let oBindCtx = oUi.getBindingContext();
                            if(!oBindCtx){
                                return parent.setBusy('');
                            }

                            let oBindData = oBindCtx.getObject();
                            if(!oBindData){
                                return parent.setBusy('');
                            }

                            let sAPPID = oBindData?.APPID || "";
                            if(!sAPPID){
                                return parent.setBusy('');
                            }

                            // APP 존재 유무 확인
                            oAPP.fn.fnCheckAppExists(sAPPID, (oResult) => {

                                var oAppInfo = oResult.RETURN;
                                if (oAppInfo.RETCD === 'E') {

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);
                                    
                                    // Application ID &1 does not exist.
                                    var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                                    parent.showMessage(sap, 10, "E", sMsg);

                                    return parent.setBusy('');
                                }

                                // USP App 일 경우 실행하지 않음.
                                if(oAppInfo.APPTY === "U"){

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);

                                    // USP apps are not supported.
                                    var sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "189"); 

                                    parent.showMessage(sap, 10, "E", sMsg);
                                    
                                    return parent.setBusy('');
                                }

                                // Inactivate 상태일 경우 실행 불가
                                if (oAppInfo.ACTST == "I") {

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);

                                    // This application cannot be executed.
                                    var sMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "434"); 

                                    parent.showMessage(sap, 10, "E", sMsg);
                                    
                                    return parent.setBusy('');
                                }

                                // 어플리케이션 브라우저 실행
                                oAPP.fn.fnOnExecApp(sAPPID);                            

                                // 연속 클릭 방지용
                                setTimeout(function(){
                                    parent.setBusy('');
                                }, 1000);

                            });
             
                        }
                    })

                }),

                new sap.ui.table.Column({
                    width: "400px",
                    sortProperty: "APPNM",
                    filterProperty: "APPNM",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91"), // Web Application Name
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{APPNM}",
                        wrapping: false,
                        tooltip: "{APPNM}",
                    }),

                }),

                new sap.ui.table.Column({
                    hAlign: "Center",
                    width: "100px",
                    sortProperty: "APPTY",
                    filterProperty: "APPTY",
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B97"), // App Type
                        design: sap.m.LabelDesign.Bold
                    }),
                    template: new sap.m.Text({
                        text: "{APPTY}",
                        wrapping: false,
                        tooltip: "{APPTY}",
                    }),

                }),

            ],

            rows: {
                path: sBindPath,
            },


        }).addEventDelegate({

            ondblclick: ev_AppF4ListUiTableDblClick

        });

  
        // let COLUMN1 = new sap.ui.table.Column({
        //     hAlign: "Center",
        //     width: "120px",
        //     sortProperty: "ERUSR",
        //     filterProperty: "ERUSR",
        //     label: new sap.m.Label({
        //         text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B95"), // User Name
        //         design: sap.m.LabelDesign.Bold
        //     }),
        //     template: new sap.m.Text({
        //         text: "{ERUSR}",
        //         wrapping: false,
        //         tooltip: "{ERUSR}",
        //     }),

        // });
        // oTable.addColumn(COLUMN1);


        let aColumns = [];

        /**
         * @since   2025-06-16
         * @version 3.5.6-sp8
         * @author  soccerhs
         * 
         * @description 컬럼추가
         * - ERDAT : 생성일자
         * - ERTIM : 생성시간
         * - AEUSR : 변경자
         * - AEDAT : 변경일자
         * - AETIM : 변경시간
         */      
        let COLUMN2 = new sap.ui.table.Column({
            hAlign: "Center",
            width: "120px",
            sortProperty: "ERDAT",
            filterProperty: "ERDAT",
            label: new sap.m.Label({                
                text: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "387"), // 생성일자                
                design: sap.m.LabelDesign.Bold
            }),
            template: new sap.m.Text({
                // text: "{ERDAT}",
                // text: {
                //     path: "ERDAT",
                //     type: "sap.ui.model.type.Date",
                //     formatOptions: {
                //         pattern: "yyyy-MM-dd",
                //         source: {
                //             pattern: "yyyyMMdd"
                //         }
                //     }
                // },
                wrapping: false,
                tooltip: "{ERDAT}",
            }).bindProperty("text", "ERDAT", lf_nozero_date),

        });
        // oTable.addColumn(COLUMN2);

        aColumns.push(COLUMN2);

        let COLUMN3 = new sap.ui.table.Column({
            hAlign: "Center",
            width: "120px",
            sortProperty: "ERTIM",
            filterProperty: "ERTIM",
            label: new sap.m.Label({
                text: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "388"), // 생성시간                
                design: sap.m.LabelDesign.Bold
            }),
            template: new sap.m.Text({
                // text: "{ERTIM}",
                // text: {
                //     path: "ERTIM",
                //     type: "sap.ui.model.type.Time",
                //     formatOptions: {
                //         pattern: "hh:mm:ss",
                //         source: {
                //             pattern: "HHmmss"
                //         }
                //     }
                // },
                wrapping: false,
                tooltip: "{ERTIM}",
            }).bindProperty("text", "ERTIM", lf_nozero_time),

        });
        // oTable.addColumn(COLUMN3);
        aColumns.push(COLUMN3);

        let COLUMN4 = new sap.ui.table.Column({
            hAlign: "Center",
            width: "120px",
            sortProperty: "AEUSR",
            filterProperty: "AEUSR",
            label: new sap.m.Label({
                text: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "411"), // 변경자                
                design: sap.m.LabelDesign.Bold
            }),
            template: new sap.m.Text({
                text: "{AEUSR}",
                wrapping: false,
                tooltip: "{AEUSR}",
            }),

        });
        // oTable.addColumn(COLUMN4);
        aColumns.push(COLUMN4);

        let COLUMN5 = new sap.ui.table.Column({
            hAlign: "Center",
            width: "120px",
            sortProperty: "AEDAT",
            filterProperty: "AEDAT",
            label: new sap.m.Label({
                text: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "412"), // 변경일자                
                design: sap.m.LabelDesign.Bold
            }),
            template: new sap.m.Text({
                // text: "{AEDAT}",
                // text: {
                //     path: "AEDAT",
                //     type: "sap.ui.model.type.Date",
                //     formatOptions: {
                //         pattern: "yyyy-MM-dd",
                //         source: {
                //             pattern: "yyyyMMdd"
                //         }
                //     }
                // },
                wrapping: false,
                tooltip: "{AEDAT}",
            }).bindProperty("text", "AEDAT", lf_nozero_date),

        });
        // oTable.addColumn(COLUMN5);
        aColumns.push(COLUMN5);

        let COLUMN6 = new sap.ui.table.Column({
            hAlign: "Center",
            width: "120px",
            sortProperty: "AETIM",
            filterProperty: "AETIM",
            label: new sap.m.Label({
                text: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "413"), // 변경시간                
                design: sap.m.LabelDesign.Bold
            }),
            template: new sap.m.Text({
                // text: "{AETIM}",
                // text: {
                //     path: "AETIM",
                //     type: "sap.ui.model.type.Time",
                //     formatOptions: {
                //         pattern: "hh:mm:ss",
                //         source: {
                //             pattern: "HHmmss"
                //         }
                //     }
                // },
                wrapping: false,
                tooltip: "{AETIM}",
            }).bindProperty("text", "AETIM", lf_nozero_time),

        });
        // oTable.addColumn(COLUMN6);

        aColumns.push(COLUMN6);

        /**
         * @since   2025-06-16
         * @version 3.5.6-sp8
         * @author  soccerhs
         * 
         * @description 컬럼추가
         * - ERDAT : 생성일자
         * - ERTIM : 생성시간
         * - AEUSR : 변경자
         * - AEDAT : 변경일자
         * - AETIM : 변경시간
         */      
        if(oAPP.common.checkWLOList("C", "UHAK901182")){
            
            // 고정 컬럼 지정
            oTable.setFixedColumnCount(3);

            for(const oColumn of aColumns){
                oTable.addColumn(oColumn);
            }

        }


        return oTable;

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


    function lf_nozero_time(sBindValue){

        // if (!sBindValue) {
        //     return;
        // }

        // if(sBindValue === "000000"){
        //     return;
        // }

        // var oBindCtx = this.getBindingContext();
        // if (oBindCtx == null) { 
        //     return;
        // }

        // var oBindData = this.getModel().getProperty(oBindCtx.sPath);
        // if (oBindData.APPID == "ROOT") {
        //     return "";
        // }

        // if (oBindData.PACKG == "ROOT") {
        //     return "";
        // }

        // const oTime = sap.ui.core.format.DateFormat.getTimeInstance({
        //     pattern: "HHmmss"
        // }).parse(sBindValue);

        // if (!oTime) return "";

        // return sap.ui.core.format.DateFormat.getTimeInstance({
        //     pattern: "hh:mm:ss" // a는 AM/PM 표시. 원하면 제거 가능
        // }).format(oTime);

        if (!sBindValue) {
            return;
        }

        if (sBindValue === "000000") {
            return;
        }

        var oBindCtx = this.getBindingContext();
        if (oBindCtx == null) { 
            return;
        }

        var oBindData = this.getModel().getProperty(oBindCtx.sPath);
        if (oBindData.APPID === "ROOT" || oBindData.PACKG === "ROOT") {
            return "";
        }

        try {

            const oParseFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "HHmmss"
            });

            const oTime = oParseFormat.parse(sBindValue);

            if (!oTime) return "";

            const oDisplayFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "hh:mm:ss" // 필요에 따라 "HH:mm:ss"로 24시간제 가능
            });

            return oDisplayFormat.format(oTime);

        } catch (e) {
            
            return "";
        }


    } // end of lf_nozero_time

    function lf_nozero_date(sBindValue){

    //     if (!sBindValue) {
    //         return;
    //     }

    //     if(sBindValue === "00000000"){                
    //         return;
    //     }

    //     var oBindCtx = this.getBindingContext();
    //     if (oBindCtx == null) { 
    //         return;
    //     }

    //     var oBindData = this.getModel().getProperty(oBindCtx.sPath);
    //     if (oBindData.APPID == "ROOT") {
    //         return "";
    //     }

    //     if (oBindData.PACKG == "ROOT") {
    //         return "";
    //     }

    //     // 날짜 형식이 yyyyMMdd 인 경우 포맷팅
    //     const oDateFormat = sap.ui.core.format.DateFormat.getInstance({
    //         pattern: "yyyy-MM-dd"
    //     });

    //     const oDate = sap.ui.core.format.DateFormat.getInstance({
    //         pattern: "yyyyMMdd"
    //     }).parse(sBindValue);

    //     return oDate ? oDateFormat.format(oDate) : "";


        if (!sBindValue) {
            return;
        }

        if (sBindValue === "00000000") {
            return;
        }

        var oBindCtx = this.getBindingContext();
        if (oBindCtx == null) { 
            return;
        }

        var oBindData = this.getModel().getProperty(oBindCtx.sPath);
        if (oBindData.APPID === "ROOT" || oBindData.PACKG === "ROOT") {
            return "";
        }

        try {

            // 날짜 형식이 yyyyMMdd 인 경우 포맷팅
            const oDateFormat = sap.ui.core.format.DateFormat.getInstance({
                pattern: "yyyy-MM-dd"
            });

            const oParseFormat = sap.ui.core.format.DateFormat.getInstance({
                pattern: "yyyyMMdd"
            });

            const oDate = oParseFormat.parse(sBindValue);

            return oDate ? oDateFormat.format(oDate) : "";

        } catch (e) {
            // 오류 발생 시 안전하게 처리
            // console.error("날짜 포맷팅 중 오류 발생:", e);
            return "";
        }

    } // end of lf_nozero_date

    

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
                    sortProperty: "APPNM",
                    filterProperty: "APPNM",
                    width: "600px",
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B99"), // U4A IDE Solution
                    template: new sap.m.Text({
                        text: "{APPNM}"
                    }),
                }),
                new sap.ui.table.Column({
                    sortProperty: "APPID",
                    filterProperty: "APPID",
                    width: "180px",
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C01"), // Identification
                    template: new sap.m.Link({
                        emphasized: true,
                        text: "{APPID}",
                        tooltip: "{APPID}",
                        press: function(oEvent){                           
                            
                            parent.setBusy('X');

                            if(!oEvent){
                                parent.setBusy('');
                                return;
                            }

                            let oUi = oEvent.getSource();
                            if(!oUi){
                                parent.setBusy('');
                                return;
                            }
                            let oBindCtx = oUi.getBindingContext();
                            if(!oBindCtx){
                                parent.setBusy('');
                                return;
                            }

                            let oBindData = oBindCtx.getObject();
                            if(!oBindData){
                                parent.setBusy('');
                                return;
                            }
                            
                            // 실행할 수 없는 어플리케이션 입니다.
                            var sNoExeAppMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "435");

                            // 하위 정보가 있다는건 루트 노드라는 의미로 실행 하지 않음.
                            if(oBindData.APPF4HIER && Array.isArray(oBindData.APPF4HIER) === true && oBindData.APPF4HIER.length !== 0){                                

                                // 작업표시줄 깜빡임
                                parent.CURRWIN.flashFrame(true);

                                parent.showMessage(sap, 10, "E", sNoExeAppMsg);

                                parent.setBusy('');

                                return;
                            }                            

                            // APPID가 없을 경우 실행 불가
                            let sAPPID = oBindData?.APPID || "";
                            if(!sAPPID){

                                // 작업표시줄 깜빡임
                                parent.CURRWIN.flashFrame(true);

                                parent.showMessage(sap, 10, "E", sNoExeAppMsg);

                                parent.setBusy('');

                                return;
                            }

                            // ROOT인 경우 어플리케이션이 아니므로 실행 불가
                            if(sAPPID === "ROOT"){

                                // 작업표시줄 깜빡임
                                parent.CURRWIN.flashFrame(true);

                                parent.showMessage(sap, 10, "E", sNoExeAppMsg);

                                parent.setBusy('');

                                return;
                            }

                            // APP 존재 유무 확인
                            oAPP.fn.fnCheckAppExists(sAPPID, (oResult) => {

                                var oAppInfo = oResult.RETURN;
                                if (oAppInfo.RETCD === 'E') {

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);
                                    
                                    // Application ID &1 does not exist.
                                    var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "007", oAppInfo.APPID);

                                    parent.showMessage(sap, 10, "E", sMsg);

                                    return parent.setBusy('');
                                }

                                // USP App 일 경우 실행하지 않음.
                                if(oAppInfo.APPTY === "U"){

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);

                                    // USP apps are not supported.
                                    var sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "189"); 

                                    parent.showMessage(sap, 10, "E", sMsg);
                                    
                                    return parent.setBusy('');
                                }

                                // Inactivate 상태일 경우 실행 불가
                                if (oAppInfo.ACTST === "I") {

                                    // 작업표시줄 깜빡임
                                    parent.CURRWIN.flashFrame(true);

                                    // Only in activity state !!!
                                    // var sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "031"); 
                                    var sMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "434"); 

                                    parent.showMessage(sap, 10, "E", sMsg);
                                    
                                    return parent.setBusy('');
                                }

                                // 어플리케이션 브라우저 실행
                                oAPP.fn.fnOnExecApp(sAPPID);                            

                                // 연속 클릭 방지용
                                setTimeout(function(){
                                    parent.setBusy('');
                                }, 1000);

                            });

                        }
                    })

                }),
                new sap.ui.table.Column({
                    sortProperty: "APPVR",
                    filterProperty: "APPVR",
                    width: "100px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C02"), // Active Ver.
                    template: new sap.m.Text().bindProperty("text", "APPVR", lf_nozero),
                }),
                new sap.ui.table.Column({
                    sortProperty: "CODPG",
                    filterProperty: "CODPG",
                    width: "100px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C03"), // Code Page
                    template: new sap.m.Text({
                        text: "{CODPG}"
                    }),
                }),
                new sap.ui.table.Column({
                    sortProperty: "UITHM",
                    filterProperty: "UITHM",
                    width: "150px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C04"), // Theme
                    template: new sap.m.Text({
                        text: "{UITHM}"
                    }),
                }),
                new sap.ui.table.Column({
                    sortProperty: "ERUSR",
                    filterProperty: "ERUSR",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C05"), // Creator
                    label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C05"), // Creator
                    template: new sap.m.Text({
                        text: "{ERUSR}"
                    }),
                }),
                new sap.ui.table.Column({
                    sortProperty: "ERDAT",
                    filterProperty: "ERDAT",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C06"), // Create Date                    
                    // template: new sap.m.Text().bindProperty("text", "ERDAT", lf_nozero),
                    label: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "387"), // Create Date
                    template: new sap.m.Text().bindProperty("text", "ERDAT", lf_nozero_date),
                }),
                new sap.ui.table.Column({
                    sortProperty: "ERTIM",
                    filterProperty: "ERTIM",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C07"), // Create Time                    
                    // template: new sap.m.Text().bindProperty("text", "ERTIM", lf_nozero),
                    label: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "388"), // Create Time
                    template: new sap.m.Text().bindProperty("text", "ERTIM", lf_nozero_time),
                }),
                new sap.ui.table.Column({
                    sortProperty: "AEUSR",
                    filterProperty: "AEUSR",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C08"), // Change User
                    label: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "411"), // Change User
                    template: new sap.m.Text({
                        text: "{AEUSR}"
                    }),
                }),
                new sap.ui.table.Column({
                    sortProperty: "AEDAT",
                    filterProperty: "AEDAT",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C09"), // Change Date
                    label: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "412"), // Change Date
                    // template: new sap.m.Text().bindProperty("text", "AEDAT", lf_nozero),
                    template: new sap.m.Text().bindProperty("text", "AEDAT", lf_nozero_date),
                }),
                new sap.ui.table.Column({
                    sortProperty: "AETIM",
                    filterProperty: "AETIM",
                    width: "120px",
                    hAlign: ENUM_HORIZONTAL_ALIGN.Center,
                    // label: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C10"), // Change Time
                    label: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "413"), // Change Time
                    // template: new sap.m.Text().bindProperty("text", "AETIM", lf_nozero),
                    template: new sap.m.Text().bindProperty("text", "AETIM", lf_nozero_time),
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

                        new sap.m.ToolbarSeparator(),

                        new sap.m.Input({
                            showClearIcon: true,
                            width: "200px",
                            placeholder: "Application Search", // [MSG]
                            change: function(oEvent){

                                // row 의 바인딩 정보
                                let oBindingInfo = oTreeTable.getBinding("rows");
                                if(!oBindingInfo){
                                    return;
                                }

                                let sValue = oEvent.getParameter("value") || "";

                                let oFilter = [
                                    new sap.ui.model.Filter({ path:"APPID", operator:"Contains", value1: "ROOT" }),
                                    new sap.ui.model.Filter({ path:"APPID", operator:"Contains", value1: sValue }),
                                    new sap.ui.model.Filter({ path:"APPNM", operator:"Contains", value1: sValue }),
                                ];

                                oBindingInfo.filter([new sap.ui.model.Filter(oFilter, false)]);

                                if(sValue){                                   
                                    oTreeTable.expandToLevel(99);
                                } else {
                                    oTreeTable.collapseAll();
                                    oTreeTable.expandToLevel(1);
                                }

                            }

                        }).addStyleClass("sapUiSmallMarginBegin")
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

                parent.setBusy('');

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

            parent.setBusy('');

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

})(window, $, oAPP);