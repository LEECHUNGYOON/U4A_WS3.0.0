/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnUiTempWizardPopupOpen.js
 * - file Desc : UI Template Wizard
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        C_TMPL_WZD_DLG_ID = "u4aWsTmplWzdDlg",
        C_TMPL_WZD1_ID = "u4aWsTmplWzd1",
        C_TMPL_WZD2_ID = "u4aWsTmplWzd2",
        C_TMPL_WZD3_ID = "u4aWsTmplWzd3",

        C_TMPL_NAVCON_ID = "u4aWsTmplWzdNavCon",
        C_TMPL_LNAVCON_ID = "u4aWsTmplWzdLNavCon",
        C_TMPL_BIND_ROOT = "/WS20/TMPLWZD",

        C_TMPL_WZD1_MODEL_TABLE_ID = `${C_TMPL_WZD1_ID}--table`,
        C_TMPL_WZD2_MODEL_TABLE_ID = `${C_TMPL_WZD2_ID}--table`,
        C_TMPL_WZD3_MODEL_TABLE1_ID = `${C_TMPL_WZD3_ID}--table1`,
        C_TMPL_WZD3_MODEL_TABLE2_ID = `${C_TMPL_WZD3_ID}--table2`,

        C_TMPL_WZD1_STEP1_ID = `${C_TMPL_WZD1_ID}--step1`,
        C_TMPL_WZD1_STEP2_ID = `${C_TMPL_WZD1_ID}--step2`,
        C_TMPL_WZD1_STEP3_ID = `${C_TMPL_WZD1_ID}--step3`,

        C_TMPL_WZD2_STEP1_ID = `${C_TMPL_WZD2_ID}--step1`,
        C_TMPL_WZD2_STEP2_ID = `${C_TMPL_WZD2_ID}--step2`,
        C_TMPL_WZD2_STEP3_ID = `${C_TMPL_WZD2_ID}--step3`,

        C_TMPL_WZD3_STEP1_ID = `${C_TMPL_WZD3_ID}--step1`,
        C_TMPL_WZD3_STEP2_ID = `${C_TMPL_WZD3_ID}--step2`,
        C_TMPL_WZD3_STEP3_ID = `${C_TMPL_WZD3_ID}--step3`,
        C_TMPL_WZD3_STEP4_ID = `${C_TMPL_WZD3_ID}--step4`,
        C_TMPL_WZD3_STEP5_ID = `${C_TMPL_WZD3_ID}--step5`,
        C_TMPL_WZD3_STEP6_ID = `${C_TMPL_WZD3_ID}--step6`,

        C_TMPL_WZD1_MODEL_TABLE = `${C_TMPL_BIND_ROOT}/MODELTABLE1`,
        C_TMPL_WZD2_MODEL_TABLE = `${C_TMPL_BIND_ROOT}/MODELTABLE2`,
        C_TMPL_WZD3_MODEL_TABLE3 = `${C_TMPL_BIND_ROOT}/MODELTABLE3`,
        C_TMPL_WZD3_MODEL_TABLE4 = `${C_TMPL_BIND_ROOT}/MODELTABLE4`;

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = parent.PATH,
        APPPATH = parent.APPPATH,
        APPCOMMON = oAPP.common;

    oAPP.fn.fnUiTempWizardPopupOpen = function (oTempData) {

        // UI Template Wizard Model Bindig
        oAPP.fn.fnUiTempWizardModelBinding(oTempData);

        var oTmplWzdDlg = sap.ui.getCore().byId(C_TMPL_WZD_DLG_ID);
        if (oTmplWzdDlg) {
            oTmplWzdDlg.open();
            return;
        }

        var oCustomHeader = oAPP.fn.fnGetUiTempWizardCustomHeader(), // wizard dialog 제목
            aTmplWzdContent = oAPP.fn.fnGetUiTempWizardContent(), // wizard dialog content
            aButtons = oAPP.fn.fnGetUiTempWizardButtons(); // wizard dialog Buttons

        var oTmplWzdDlg = new sap.m.Dialog(C_TMPL_WZD_DLG_ID, {

            // Properties
            draggable: true,
            resizable: true,
            contentWidth: "100%",
            contentHeight: "100%",
            titleAlignment: sap.m.TitleAlignment.Center,

            // Aggregations
            customHeader: oCustomHeader,
            content: aTmplWzdContent,
            buttons: aButtons,

            // Events      
            afterOpen: oAPP.events.ev_UiTempWizardAfterOpen,
            afterClose: oAPP.events.ev_UiTempWizardAfterClose,
            escapeHandler: function () {

                oTmplWzdDlg.close();

            }

        }).addStyleClass(C_TMPL_WZD_DLG_ID);

        oTmplWzdDlg.bindElement(C_TMPL_BIND_ROOT);

        oTmplWzdDlg.open();

    }; // end of oAPP.fn.fnUiTempWizardPopupOpen

    /**************************************************************************
     *  Table UI Create 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard1PopupInit = function () {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard == null) {
            return;
        }

        // wizard popup create button 숨기기
        fnWizardCreateBtnVisible(false);

        let oFistStep = sap.ui.getCore().byId(C_TMPL_WZD1_STEP1_ID);

        // // 첫번째 스텝으로 이동 시킨다.
        // let sCurrStep = oWizard.getCurrentStep();
        // if (sCurrStep != C_TMPL_WZD1_STEP1_ID) {
        //     oWizard.setCurrentStep(C_TMPL_WZD1_STEP1_ID);
        // }

        oWizard.discardProgress(oFistStep);

        oWizard.invalidateStep(oFistStep);

        // Model 정보 테이블 초기화
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T/selectedKey`, "");
        APPCOMMON.fnSetModelProperty(C_TMPL_WZD1_MODEL_TABLE, undefined);

        // Tree Table Flag 초기화
        let oFlags = {
            bIsPChk: false,
            bIsCChk: false,
        };

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`, oFlags);

    }; // end of oAPP.fn.fnSetWizard1PopupInit

    /**************************************************************************
     *  Form UI Create 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard2PopupInit = function () {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard == null) {
            return;
        }

        let oFistStep = sap.ui.getCore().byId(C_TMPL_WZD2_STEP1_ID);

        // wizard popup create button 숨기기
        fnWizardCreateBtnVisible(false);

        // 첫번째 스탭으로 이동하고 나머지 
        oWizard.discardProgress(oFistStep);

        oWizard.invalidateStep(oFistStep);

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/S/selectedKey`, "");
        APPCOMMON.fnSetModelProperty(C_TMPL_WZD2_MODEL_TABLE, undefined);

    }; // end of oAPP.fn.fnSetWizard2PopupInit

    /**************************************************************************
     *  Report Template Wizard 의 Form Ui 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard3Popup1Init = () => {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // wizard popup create button 숨기기
        fnWizardCreateBtnVisible(false);

        let oFistStep = sap.ui.getCore().byId(C_TMPL_WZD3_STEP1_ID);

        // // // 첫번째 스텝으로 이동 시킨다.
        // let sCurrStep = oWizard.getCurrentStep();
        // if (sCurrStep != C_TMPL_WZD3_STEP1_ID) {
        //     oWizard.setCurrentStep(C_TMPL_WZD3_STEP1_ID);
        // }

        oWizard.discardProgress(oFistStep);

        oWizard.invalidateStep(oFistStep);

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyS`, "");
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyT`, "");

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE3, undefined);
        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE4, undefined);

    }; // end of oAPP.fn.fnSetWizard3Popup1Init

    /**************************************************************************
     *  Report Template Wizard 의 Table Ui 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard3Popup2Init = () => {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // 네번째 스텝으로 이동 시킨다.
        let oStep = sap.ui.getCore().byId(C_TMPL_WZD3_STEP4_ID);

        // let sCurrStep = oWizard.getCurrentStep();
        // if (sCurrStep != C_TMPL_WZD3_STEP4_ID) {
        //     oWizard.setCurrentStep(C_TMPL_WZD3_STEP4_ID);
        // }

        oWizard.discardProgress(oStep);

        oWizard.invalidateStep(oStep);

        // wizard popup create button 숨기기
        fnWizardCreateBtnVisible(false);

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE4, undefined);

    }; // end of oAPP.fn.fnSetWizard3Popup2Init

    /**************************************************************************
     *  UI Template Wizard Model Bindig
     **************************************************************************/
    oAPP.fn.fnUiTempWizardModelBinding = function (oModel) {

        var oModelData = {
            MASTER: oModel,
            TNTMENU: { // 좌측 Menu List
                SELKEY: C_TMPL_WZD1_ID,
                MENULIST: [{
                    key: C_TMPL_WZD1_ID,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D63"), // Table Ui Create
                    enabled: false,
                }, {
                    key: C_TMPL_WZD2_ID,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D64"), // Forms Ui Create
                    enabled: false,
                }, {
                    key: C_TMPL_WZD3_ID,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D65"), // Report Template Create
                    enabled: false,
                }]
            },
            UICHOICE: { // UI Choice DropDown 구조
                T: {
                    selectedKey: "",
                    ITEM: [{
                        key: "",
                        text: ""
                    }]
                },
                S: {
                    selectedKey: "",
                    ITEM: [{
                        key: "",
                        text: ""
                    }]
                },
                A: {
                    selectedKeyT: "",
                    selectedKeyS: "",
                }
            },
            // TREEVISI: false, // tree table 선택시 컬럼 visible flag
            CRBTN_VISI: false, // wizard popup의 Create Button visible
        };

        oModelData[C_TMPL_WZD1_ID] = {};
        oModelData[C_TMPL_WZD2_ID] = {};
        oModelData[C_TMPL_WZD3_ID] = {};

        oModelData[C_TMPL_WZD1_ID].TREEVISI = false; // Tree Table일 경우 특정 컬럼 숨기기 보이기 Flag
        oModelData[C_TMPL_WZD1_ID].TREEFLG = {};
        oModelData[C_TMPL_WZD1_ID].TREEFLG.bIsPChk = false; // parent 선택 여부
        oModelData[C_TMPL_WZD1_ID].TREEFLG.bIsCChk = false; // child 선택 여부

        oModelData[C_TMPL_WZD3_ID].TREEVISI = false; // Tree Table일 경우 특정 컬럼 숨기기 보이기 Flag
        oModelData[C_TMPL_WZD3_ID].TREEFLG = {};
        oModelData[C_TMPL_WZD3_ID].TREEFLG.bIsPChk = false; // parent 선택 여부
        oModelData[C_TMPL_WZD3_ID].TREEFLG.bIsCChk = false; // child 선택 여부        

        // UI Template Type별 UI Choice Combobox Data 구성
        var iUiChoiceLength = oModel.S_TMPL.length;
        for (var i = 0; i < iUiChoiceLength; i++) {

            var oUiChoiceData = oModel.S_TMPL[i];

            switch (oUiChoiceData.CANDTY) {
                case "T":
                    oModelData.UICHOICE.T.ITEM.push(oUiChoiceData);
                    continue;

                case "S":
                    oModelData.UICHOICE.S.ITEM.push(oUiChoiceData);
                    continue;

            }

        }

        APPCOMMON.fnSetModelProperty(C_TMPL_BIND_ROOT, oModelData);

    }; // end of oAPP.fn.fnUiTempWizardModelBinding

    /************************************************************************
     * UI TEMPLATE WIZARD HEADER
     ************************************************************************/
    oAPP.fn.fnGetUiTempWizardCustomHeader = function () {

        var sWzdImgPath = APPPATH + "\\img\\wizard.png";

        return new sap.m.Toolbar({
            content: [

                new sap.m.ToolbarSpacer(),

                new sap.m.Image({
                    src: sWzdImgPath,
                    width: "1.6rem",
                    height: "1.6rem"
                }),

                new sap.m.Title({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24"), // UI Template Wizard
                }),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    icon: "sap-icon://decline",
                    press: oAPP.events.pressUiTempWizardDialogClose
                })
            ]
        });

    }; // end of oAPP.fn.fnGetUiTempWizardCustomHeader

    /************************************************************************
     * UI TEMPLATE WIZARD CONTENT
     ************************************************************************/
    oAPP.fn.fnGetUiTempWizardContent = function () {

        var oWizardSplit = oAPP.fn.fnGetUiTempWzardSplitter();

        return [

            new sap.m.Page({
                showHeader: false,
                content: [
                    oWizardSplit
                ]

            })

        ];

    }; // end of oAPP.fn.fnGetUiTempWizardContent

    /************************************************************************
     * UI TEMPLATE WIZARD Dialog BUTTONS
     ************************************************************************/
    oAPP.fn.fnGetUiTempWizardButtons = function () {

        return [

            new sap.m.Button({
                icon: "sap-icon://document",
                type: sap.m.ButtonType.Emphasized,
                visible: `{${C_TMPL_BIND_ROOT}/CRBTN_VISI}`,
                press: oAPP.events.ev_tmplWzdComplete
            }),

            new sap.m.Button({
                icon: "sap-icon://decline",
                press: oAPP.events.pressUiTempWizardDialogClose
            }),

        ];

    }; // end of oAPP.fn.fnGetUiTempWizardButtons

    /************************************************************************
     * UI TEMPLATE WIZARD SPLITTER
     ************************************************************************/
    oAPP.fn.fnGetUiTempWzardSplitter = function () {

        var oLeftSplitPane = oAPP.fn.fnGetTempWizardLeftSplitPane(), // split의 왼쪽영역
            oRightSplitPane = oAPP.fn.fnGetTempWizardRightSplitPane(); // split의 우측영역

        return new sap.ui.layout.ResponsiveSplitter({
            rootPaneContainer: new sap.ui.layout.PaneContainer({
                panes: [

                    // 좌측 preview 영역
                    oLeftSplitPane,

                    // 우측 모델 바인딩 영역
                    oRightSplitPane

                ]
            })
        });

    }; // end of oAPP.fn.fnGetUiTempWzardSplitter

    /************************************************************************
     * UI TEMPLATE WIZARD SPLITTER to Left Area
     ************************************************************************/
    oAPP.fn.fnGetTempWizardLeftSplitPane = function () {

        return new sap.ui.layout.SplitPane({
            content: new sap.m.Page({
                enableScrolling: false,
                title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67"), // Preview
                layoutData: new sap.ui.layout.SplitterLayoutData({
                    size: "40%"
                }),
                content: [

                    new sap.m.NavContainer(C_TMPL_LNAVCON_ID, {
                        autoFocus: false,
                        pages: [
                            new sap.m.Page(`${C_TMPL_LNAVCON_ID}--P1`, {
                                showHeader: false,
                                enableScrolling: true,
                                content: [
                                    new sap.m.VBox({
                                        height: "100%",
                                        width: "100%",
                                        renderType: "Bare",
                                        justifyContent: "Center",
                                        items: [

                                            new sap.m.IllustratedMessage({
                                                title: APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "347", APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E32")), // Preview Image Not found.
                                                description: "　",
                                                illustrationType: "tnt-UnableToLoad",
                                                illustrationSize: "Scene"
                                            })

                                        ]
                                    })
                                ]
                            }),

                            new sap.m.Page(`${C_TMPL_LNAVCON_ID}--P2`, {
                                showHeader: false,
                                enableScrolling: true,
                                content: [

                                    new sap.m.VBox({
                                        height: "100%",
                                        width: "100%",
                                        renderType: "Bare",
                                        justifyContent: "Center",
                                        items: [

                                            new sap.m.Image(`${C_TMPL_LNAVCON_ID}--Img`, {
                                                // width: "100%",
                                                height: "auto"
                                            }).addStyleClass("u4aWsTmplWzdPrevImg")

                                        ]
                                    })

                                ]

                            })
                        ]
                    })

                ]
            })
        });

    }; // end fo oAPP.fn.fnGetTempWizardLeftSplitPane

    /************************************************************************
     * UI TEMPLATE WIZARD SPLITTER to Right Area
     ************************************************************************/
    oAPP.fn.fnGetTempWizardRightSplitPane = function () {

        var oToolPage = oAPP.fn.fnGetTempWizardToolPage();

        return new sap.ui.layout.SplitPane({
            content: new sap.m.Page({
                showHeader: false,
                content: [
                    oToolPage
                ]
            })
        });

    }; // end of oAPP.fn.fnGetTempWizardRightSplitPane

    /************************************************************************
     * 우측 모델 바인딩 영역의 ToolPage
     ************************************************************************/
    oAPP.fn.fnGetTempWizardToolPage = function () {

        var C_MENU_BIND_PATH = `${C_TMPL_BIND_ROOT}/TNTMENU`;

        var oWizard1 = oAPP.fn.fnGetTempWizardContents1(),
            oWizard2 = oAPP.fn.fnGetTempWizardContents2(),
            oWizard3 = oAPP.fn.fnGetTempWizardContents3();

        return new sap.tnt.ToolPage({
            sideContent: new sap.tnt.SideNavigation({
                item: new sap.tnt.NavigationList({
                    selectedKey: `{${C_MENU_BIND_PATH}/SELKEY}`,
                    itemSelect: oAPP.events.ev_sideNaviItemSelection,
                    items: {
                        path: `${C_MENU_BIND_PATH}/MENULIST`,
                        template: new sap.tnt.NavigationListItem({
                            icon: "sap-icon://color-fill",
                            key: "{key}",
                            text: "{text}",
                            // enabled: "{enabled}"
                        }).bindProperty("enabled", {
                            parts: [
                                `${C_TMPL_BIND_ROOT}/MASTER`,
                                `key`
                            ],
                            formatter: (MASTER, key) => {

                                let bEnabled = false; // 메뉴 활성화 여부

                                let bIsTab = false, // 테이블 존재 여부
                                    bIsStr = false, // 스트럭처 존재 여부
                                    bIsAll = false; // 둘다 존재 여부

                                var sTab = MASTER.T_MINFO.find(element => element == "T"),
                                    sStr = MASTER.T_MINFO.find(element => element == "S");

                                // 테이블이 있는지 확인
                                if (sTab) {
                                    bIsTab = true;
                                }

                                // 스트럭처가 있는지 확인
                                if (sStr) {
                                    bIsStr = true;
                                }


                                // 테이블 && 스트럭처가 있는지 확인
                                if (bIsTab && bIsStr) {
                                    bIsAll = true;
                                }

                                switch (key) {
                                    case C_TMPL_WZD1_ID:

                                        if (bIsTab) {
                                            bEnabled = true;
                                        }

                                        break;

                                    case C_TMPL_WZD2_ID:

                                        if (bIsStr) {
                                            bEnabled = true;
                                        }

                                        break;

                                    case C_TMPL_WZD3_ID:

                                        if (bIsAll) {
                                            bEnabled = true;
                                        }

                                        break;

                                }

                                return bEnabled;

                            }
                        })
                    }
                })
                    .addDelegate({

                        // 구조, 테이블 유무에 따른 아이콘 색상 적용
                        onAfterRendering: function (oEvent) {

                            // Navigation List Item 정보를 구한다.
                            var oControl = oEvent.srcControl,
                                aItems = oControl.getItems(),
                                iItemLength = aItems.length;

                            if (iItemLength <= 0) {
                                return;
                            }

                            var bIsSelectedItem = false;

                            for (var i = 0; i < iItemLength; i++) {

                                var oItem = aItems[i],
                                    bIsEnabled = oItem.getEnabled(),
                                    oItemDomRef = oItem.getDomRef();

                                // Item에 대한 Html Dom 유무 확인
                                if (oItemDomRef == null) {
                                    continue;
                                }

                                oItemDomRef.classList.remove("u4aWsTmplWzdAttrActive");

                                if (!bIsEnabled) {
                                    continue;
                                }

                                // 메뉴가 활성화 일 경우에만 ICON 색상 녹색으로 적용
                                oItemDomRef.classList.add("u4aWsTmplWzdAttrActive");

                                // 활성화된 메뉴 중, 처음 얻어 걸린 메뉴로 선택 효과 적용
                                if (!bIsSelectedItem) {
                                    bIsSelectedItem = true;
                                    oControl.setSelectedItem(oItem);
                                    oControl.fireItemSelect({
                                        item: oItem
                                    });
                                }

                            }

                        } // end of onAfterRendering

                    }) // end of addDelegate

            }).addStyleClass("u4aWsTmplWzdSideNav"),

            mainContents: new sap.m.NavContainer(C_TMPL_NAVCON_ID, {

                // properties
                autoFocus: false,

                // aggregations
                pages: [

                    // Table UI Create Page
                    new sap.m.Page(`${C_TMPL_WZD1_ID}--page`, {
                        content: [
                            oWizard1
                        ]
                    }),

                    // Forms UI Create Page
                    new sap.m.Page(`${C_TMPL_WZD2_ID}--page`, {
                        content: [
                            oWizard2
                        ]
                    }),

                    // Report UI Create Page
                    new sap.m.Page(`${C_TMPL_WZD3_ID}--page`, {
                        content: [
                            oWizard3
                        ]
                    }),

                ],
                afterNavigate: oAPP.events.ev_tmplwzdAfterNavicon
            })
        });

    }; // end of oAPP.fn.fnGetTempWizardToolPage

    /************************************************************************
     * Table Ui Create 에 대한 wizard
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContents1 = function () {

        var aSteps = oAPP.fn.fnGetTempWizardContent1WzdSteps();

        return new sap.m.Wizard(C_TMPL_WZD1_ID, {

            // Properties        
            showNextButton: true,
            backgroundDesign: sap.m.PageBackgroundDesign.Solid,

            // Aggregations
            steps: aSteps,

        });


    }; // end of oAPP.fn.fnGetTempWizardContents1

    /************************************************************************
     * Table Ui Create 에 대한 wizard Steps
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContent1WzdSteps = function () {

        let oEnabledBindProperty = {
            parts: [
                `${C_TMPL_BIND_ROOT}/MASTER`
            ],
            formatter: (MASTER) => {

                let bEnabled = false;

                var sTab = MASTER.T_MINFO.find(element => element == "T");
                if (sTab) {
                    bEnabled = true;
                }

                return bEnabled;
            }

        };


        var oModelInfoTable = oAPP.fn.fnGetModelInfoTable1();

        return [
            new sap.m.WizardStep(C_TMPL_WZD1_STEP1_ID, {
                validated: false,
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [
                            new sap.m.Select({

                                // properties
                                selectedKey: "{UICHOICE/T/selectedKey}",
                                width: "300px",

                                // events
                                change: oAPP.events.ev_tmplWzd1SelectChangeEvent,

                                // aggregations
                                items: {
                                    path: "UICHOICE/T/ITEM",
                                    template: new sap.ui.core.ListItem({
                                        key: "{OBJNM}",
                                        text: "{OBJNM}",
                                    })
                                }

                            }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindProperty))

                        ]
                    })
                ]
            }).bindProperty("title", "UICHOICE/T/selectedKey", function (key) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D77", "", "", "", ""); // UI Choice

                if (key && key !== "") {
                    sTitle += " [ " + key + " ] ";
                }

                return sTitle;

            }),

            new sap.m.WizardStep(C_TMPL_WZD1_STEP2_ID, {
                validated: false,
                title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D66"), // Model Select
                content: [
                    new sap.m.Button({

                        // properties
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D66"), // Model Select
                        // enabled: "{TABLEUI/enabled}",

                        // events
                        press: oAPP.events.ev_tmplWzd1ModelSelectBtn

                    }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindProperty)),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD1_STEP3_ID, {
                validated: false,

                // Aggregations
                content: [
                    oModelInfoTable
                ],

            }).bindProperty("title", "MODELTABLE1/MODEL", function (MODEL) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information

                if (MODEL && MODEL !== "") {
                    sTitle += " [ " + MODEL + " ] ";
                }

                return sTitle;

            })
        ];

    }; // end of oAPP.fn.fnGetTempWizardContent1WzdSteps

    /************************************************************************
     * Table Ui Create 에 대한 Model 정보를 보여주는 테이블
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable1 = function () {

        var aColumns = oAPP.fn.fnGetModelInfoTable1Columns();

        return new sap.ui.table.Table(C_TMPL_WZD1_MODEL_TABLE_ID, {

            // Properties
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
            visibleRowCount: 15,
            selectionMode: sap.ui.table.SelectionMode.MultiToggle,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,

            // Aggregations
            columns: aColumns,
            rows: {
                path: `${C_TMPL_WZD1_MODEL_TABLE}/T_OUTAB`,
            },

            // Events
            rowSelectionChange: oAPP.events.ev_tmplWzd1_ModelInfoTable_RowSelection

        }).addStyleClass("sapUiSizeCompact");

    }; // end of oAPP.fn.fnGetModelInfoTable1

    /************************************************************************
     * Form Ui Create 에 대한 Model 정보를 보여주는 테이블
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable2 = function () {

        var aColumns = oAPP.fn.fnGetModelInfoTable2Columns();

        return new sap.ui.table.Table(C_TMPL_WZD2_MODEL_TABLE_ID, {

            // Properties
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
            visibleRowCount: 15,
            selectionMode: sap.ui.table.SelectionMode.MultiToggle,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,

            // Aggregations
            columns: aColumns,
            rows: {
                path: `${C_TMPL_WZD2_MODEL_TABLE}/T_OUTAB`,
            },

            // Events
            rowSelectionChange: oAPP.events.ev_tmplWzd2_ModelInfoTable_RowSelection

        }).addStyleClass("sapUiSizeCompact");

    }; // end of oAPP.fn.fnGetModelInfoTable2

    /************************************************************************
     * Report Ui Create 에 대한 Form Ui Model 정보를 보여주는 테이블
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable3 = () => {

        var aColumns = oAPP.fn.fnGetModelInfoTable3Columns();

        return new sap.ui.table.Table(C_TMPL_WZD3_MODEL_TABLE1_ID, {

            // Properties
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
            visibleRowCount: 15,
            selectionMode: sap.ui.table.SelectionMode.MultiToggle,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,

            // Aggregations
            columns: aColumns,
            rows: {
                path: `${C_TMPL_WZD3_MODEL_TABLE3}/T_OUTAB`,
            },

            // Events
            rowSelectionChange: oAPP.events.ev_tmplWzd3_ModelInfoTable1_RowSelection

        }).addStyleClass("sapUiSizeCompact");


    }; // end of oAPP.fn.fnGetModelInfoTable3

    /************************************************************************
     * Report Template Create 에 대한 Table Ui Model 정보를 보여주는 테이블
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable4 = () => {

        var aColumns = oAPP.fn.fnGetModelInfoTable4Columns();

        return new sap.ui.table.Table(C_TMPL_WZD3_MODEL_TABLE2_ID, {

            // Properties
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Fixed,
            visibleRowCount: 15,
            selectionMode: sap.ui.table.SelectionMode.MultiToggle,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowSelector,

            // Aggregations
            columns: aColumns,
            rows: {
                path: `${C_TMPL_WZD3_MODEL_TABLE4}/T_OUTAB`,
            },

            // Events
            rowSelectionChange: oAPP.events.ev_tmplWzd3_ModelInfoTable2_RowSelection

        }).addStyleClass("sapUiSizeCompact");

    }; // end of oAPP.fn.fnGetModelInfoTable4

    /************************************************************************
     * Table Ui Create 에 대한 Model 정보를 보여주는 테이블의 컬럼 정보
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable1Columns = function () {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold;
        return [

            new sap.ui.table.Column({
                minWidth: 150,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D68"), // Field Name
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FNAME}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 80,
                width: "100px",
                visible: `{${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEVISI}`,
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D69"), // Is Parent
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.CheckBox({
                    select: oAPP.events.ev_tmplWzd1TreeTableParentChkbox

                }).bindProperty("selected", "PARENT", function (PARENT) {

                    if (PARENT == "X") {
                        return true;
                    }

                    return false;

                }).bindProperty("enabled", "enabled_pchk", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    if (bIsEnabled == false) {
                        this.setSelected(false);
                    }

                    return bIsEnabled;

                }),

            }),

            new sap.ui.table.Column({
                minWidth: 80,
                width: "100px",
                visible: `{${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEVISI}`,
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D70"), // Is Child
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.CheckBox({
                    select: oAPP.events.ev_tmplWzd1TreeTableChildChkbox
                }).bindProperty("selected", "CHILD", function (CHILD) {

                    if (CHILD == "X") {
                        return true;
                    }

                    return false;

                }).bindProperty("enabled", "enabled_cchk", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    if (bIsEnabled == false) {
                        this.setSelected(false);
                    }

                    return bIsEnabled;

                }),

            }),

            new sap.ui.table.Column({
                minWidth: 120,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D71"), // Position (Order)
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                    enabled: "{enabled}"
                })

            }).bindProperty("visible", `${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEVISI`, function (bIsVisi) {
                return !bIsVisi;
            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D72"), // UI Type Select
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Select({
                    width: "100%",
                    selectedKey: "{UITYP}",
                    items: {
                        path: "UILIST",
                        templateShareable: true,
                        template: new sap.ui.core.ListItem({
                            key: "{VAL1}",
                            text: "{VAL1}",
                        })
                    }
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D73"), // Label Text
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Input({
                    value: "{FTEXT}",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D74"), // Field Type
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FTYPE}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 100,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D75"), // Field Length
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FLEN}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D76"), // Conv. Routine
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{CONVE}"
                })
            }),

        ];

    }; // end of oAPP.fn.fnGetModelInfoTable1Columns

    /************************************************************************
     * Form Ui Create 에 대한 Model 정보를 보여주는 테이블의 컬럼 정보
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable2Columns = function () {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold;

        return [

            new sap.ui.table.Column({
                minWidth: 150,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D68"), // Field Name
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FNAME}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 120,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D71"), // Position (Order)
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                    enabled: "{enabled}"
                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D72"), // UI Type Select
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Select({
                    width: "100%",
                    selectedKey: "{UITYP}",
                    items: {
                        path: "UILIST",
                        templateShareable: true,
                        template: new sap.ui.core.ListItem({
                            key: "{VAL1}",
                            text: "{VAL1}",
                        })
                    }
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D73"), // Label Text
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Input({
                    value: "{FTEXT}",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D74"), // Field Type
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FTYPE}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 100,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D75"), // Field Length
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FLEN}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D76"), // Conv. Routine
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{CONVE}"
                })
            }),

        ];

    }; // end of oAPP.fn.fnGetModelInfoTable2Columns

    /************************************************************************
     * Report Template Create 의 Form ui 에 대한 Model 정보를 보여주는 테이블의 컬럼 정보
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable3Columns = () => {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold;

        return [

            new sap.ui.table.Column({
                minWidth: 150,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D68"), // Field Name
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FNAME}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 120,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D71"), // Position (Order)
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                    enabled: "{enabled}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D72"), // UI Type Select
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Select({
                    width: "100%",
                    selectedKey: "{UITYP}",
                    items: {
                        path: "UILIST",
                        templateShareable: true,
                        template: new sap.ui.core.ListItem({
                            key: "{VAL1}",
                            text: "{VAL1}",
                        })
                    }
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D73"), // Label Text
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Input({
                    value: "{FTEXT}",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D74"), // Field Type
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FTYPE}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 100,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D75"), // Field Length
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FLEN}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D76"), // Conv. Routine
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{CONVE}"
                })
            }),

        ];

    }; // end of oAPP.fn.fnGetModelInfoTable3Columns

    /************************************************************************
     * Report Template Create 의 Table ui에 대한 
     * Model 정보를 보여주는 테이블의 컬럼 정보
     ************************************************************************/
    oAPP.fn.fnGetModelInfoTable4Columns = () => {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold;
        return [

            new sap.ui.table.Column({
                minWidth: 150,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D68"), // Field Name
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FNAME}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 80,
                width: "100px",
                visible: `{${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEVISI}`,
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D69"), // Is Parent
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.CheckBox({
                    select: oAPP.events.ev_tmplWzd3TreeTableParentChkbox

                }).bindProperty("selected", "PARENT", function (PARENT) {

                    if (PARENT == "X") {
                        return true;
                    }

                    return false;

                }).bindProperty("enabled", "enabled_pchk", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    if (bIsEnabled == false) {
                        this.setSelected(false);
                    }

                    return bIsEnabled;

                }),

            }),

            new sap.ui.table.Column({
                minWidth: 80,
                width: "100px",
                visible: `{${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEVISI}`,
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D70"), // Is Child
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.CheckBox({
                    select: oAPP.events.ev_tmplWzd3TreeTableChildChkbox
                }).bindProperty("selected", "CHILD", function (CHILD) {

                    if (CHILD == "X") {
                        return true;
                    }

                    return false;

                }).bindProperty("enabled", "enabled_cchk", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    if (bIsEnabled == false) {
                        this.setSelected(false);
                    }

                    return bIsEnabled;

                }),

            }),

            new sap.ui.table.Column({
                minWidth: 120,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D71"), // Position (Order),
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                    enabled: "{enabled}"
                })

            }).bindProperty("visible", `${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEVISI`, function (bIsVisi) {
                return !bIsVisi;
            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D72"), // UI Type Select
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Select({
                    width: "100%",
                    selectedKey: "{UITYP}",
                    items: {
                        path: "UILIST",
                        templateShareable: true,
                        template: new sap.ui.core.ListItem({
                            key: "{VAL1}",
                            text: "{VAL1}",
                        })
                    }
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D73"), // Label Text
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Input({
                    value: "{FTEXT}",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    return bIsEnabled;

                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D74"), // Field Type
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FTYPE}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 100,
                width: "120px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D75"), // Field Length
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{FLEN}"
                })
            }),

            new sap.ui.table.Column({
                minWidth: 150,
                width: "150px",
                label: new sap.m.Label({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D76"), // Conv. Routine
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{CONVE}"
                })
            }),

        ];

    }; // end of oAPP.fn.fnGetModelInfoTable4Columns

    /************************************************************************
     * Table Ui Create의 바인딩 팝업에서 
     * 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd1ModelSuccess = function (oResult) {

        parent.setBusy("");

        var oParam = this;

        if (oResult.RETCD != "S") {
            parent.showMessage(sap, 10, "E", oResult.RTMSG);
            return;
        }

        // 컬럼 정보 리스트에서 UI Type Select DDLB용 데이터를 수집
        var aDDLB = oAPP.fn.fnGetDDLBInfo(oParam.UIFND),
            iDDLBlength = aDDLB.length;

        if (iDDLBlength <= 0) {
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "347", sMsg); // &1 Not found.
            throw new Error(sMsg);
        }

        // Model 정보 테이블의 각 아이템에 DDLB 정보를 저장한다.
        var aOutTab = oResult.T_OTAB,
            iOutTabLength = aOutTab.length;

        if (iOutTabLength <= 0) {
            return;
        }

        for (var i = 0; i < iOutTabLength; i++) {

            var oItem = aOutTab[i];
            oItem.UILIST = aDDLB;

        }

        var oTableModel = {
            MODEL: oParam.MODEL, // 바인딩 팝업에서 선택한 모델의 테이블 명
            T_OUTAB: aOutTab // 모델의 컬럼 정보 테이블에서 선택한 Row Data
        };

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD1_MODEL_TABLE, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard == null) {
            return;
        }

        // Model Info Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD1_STEP3_ID);

        // wizard popup create button 활성화
        fnWizardCreateBtnVisible(true);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();

    }; // end of oAPP.fn.fnGetTmplWzd1ModelSuccess

    /************************************************************************
     * Form Ui Create의 바인딩 팝업에서 
     * 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd2ModelSuccess = function (oResult) {

        parent.setBusy("");

        var oParam = this;

        if (oResult.RETCD != "S") {
            parent.showMessage(sap, 10, "E", oResult.RTMSG);
            return;
        }

        // 컬럼 정보 리스트에서 UI Type Select DDLB용 데이터를 수집
        var aDDLB = oAPP.fn.fnGetDDLBInfo(oParam.UIFND),
            iDDLBlength = aDDLB.length;

        if (iDDLBlength <= 0) {
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "347", sMsg); // &1 Not found.

            throw new Error(sMsg);
        }

        // Model 정보 테이블의 각 아이템에 DDLB 정보를 저장한다.
        var aOutTab = oResult.T_OTAB,
            iOutTabLength = aOutTab.length;

        if (iOutTabLength <= 0) {
            return;
        }

        for (var i = 0; i < iOutTabLength; i++) {

            var oItem = aOutTab[i];
            oItem.UILIST = aDDLB;

        }

        var oTableModel = {
            MODEL: oParam.MODEL, // 바인딩 팝업에서 선택한 모델의 테이블 명
            T_OUTAB: aOutTab // 모델의 컬럼 정보 테이블에서 선택한 Row Data
        };

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD2_MODEL_TABLE, undefined);

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD2_MODEL_TABLE, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard == null) {
            return;
        }

        // Model Info Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD2_STEP3_ID);

        // wizard popup create button 활성화
        fnWizardCreateBtnVisible(true);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD2_MODEL_TABLE_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();

    }; // end of oAPP.fn.fnGetTmplWzd2ModelSuccess    

    /************************************************************************
     * Report Ui Create의 바인딩 팝업에서 
     * 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd3Model1Success = function (oResult) {

        parent.setBusy("");

        var oParam = this;

        if (oResult.RETCD != "S") {
            parent.showMessage(sap, 10, "E", oResult.RTMSG);
            return;
        }

        // 컬럼 정보 리스트에서 UI Type Select DDLB용 데이터를 수집
        var aDDLB = oAPP.fn.fnGetDDLBInfo(oParam.UIFND),
            iDDLBlength = aDDLB.length;

        if (iDDLBlength <= 0) {
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "347", sMsg); // &1 Not found.

            throw new Error(sMsg);
        }

        // Model 정보 테이블의 각 아이템에 DDLB 정보를 저장한다.
        var aOutTab = oResult.T_OTAB,
            iOutTabLength = aOutTab.length;

        if (iOutTabLength <= 0) {
            return;
        }

        for (var i = 0; i < iOutTabLength; i++) {

            var oItem = aOutTab[i];
            oItem.UILIST = aDDLB;

        }

        var oTableModel = {
            MODEL: oParam.MODEL, // 바인딩 팝업에서 선택한 모델의 테이블 명
            T_OUTAB: aOutTab // 모델의 컬럼 정보 테이블에서 선택한 Row Data
        };

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE3, undefined);

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE3, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // 3. Form Ui Model Information Step
        let oMoveStep = sap.ui.getCore().byId(C_TMPL_WZD3_STEP3_ID),
            bIsValidated = oMoveStep.getValidated();

        if (!bIsValidated) {
            oWizard.setCurrentStep(C_TMPL_WZD3_STEP3_ID);
        }

        oWizard.validateStep(oMoveStep);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE1_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();

    }; // end of oAPP.fn.fnGetTmplWzd3Model1Success

    /************************************************************************
     * Report Template Create의 바인딩 팝업에서 
     * 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd3Model2Success = function (oResult) {

        parent.setBusy("");

        var oParam = this;

        if (oResult.RETCD != "S") {
            parent.showMessage(sap, 10, "E", oResult.RTMSG);
            return;
        }

        // 컬럼 정보 리스트에서 UI Type Select DDLB용 데이터를 수집
        var aDDLB = oAPP.fn.fnGetDDLBInfo(oParam.UIFND),
            iDDLBlength = aDDLB.length;

        if (iDDLBlength <= 0) {
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "347", sMsg); // &1 Not found.

            throw new Error("Model DDLB Not found!");
        }

        // Model 정보 테이블의 각 아이템에 DDLB 정보를 저장한다.
        var aOutTab = oResult.T_OTAB,
            iOutTabLength = aOutTab.length;

        if (iOutTabLength <= 0) {
            return;
        }

        for (var i = 0; i < iOutTabLength; i++) {

            var oItem = aOutTab[i];
            oItem.UILIST = aDDLB;

        }

        var oTableModel = {
            MODEL: oParam.MODEL, // 바인딩 팝업에서 선택한 모델의 테이블 명
            T_OUTAB: aOutTab // 모델의 컬럼 정보 테이블에서 선택한 Row Data
        };

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE4, undefined);
        APPCOMMON.fnSetModelProperty(C_TMPL_WZD3_MODEL_TABLE4, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // Model Info Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD3_STEP6_ID);

        // wizard popup create button 활성화
        fnWizardCreateBtnVisible(true);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE2_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();

    }; // end of oAPP.fn.fnGetTmplWzd3Model2Success

    /************************************************************************
     * Forms Ui Create 에 대한 wizard
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContents2 = function () {

        var aSteps = oAPP.fn.fnGetTempWizardContent2WzdSteps();

        return new sap.m.Wizard(C_TMPL_WZD2_ID, {
            showNextButton: true,
            backgroundDesign: sap.m.PageBackgroundDesign.Solid,
            steps: aSteps
        });

    }; // end of oAPP.fn.fnGetTempWizardContents2

    /************************************************************************
     * Forms Ui Create 에 대한 wizard Steps
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContent2WzdSteps = function () {

        let oEnabledBindProperty = {
            parts: [
                `${C_TMPL_BIND_ROOT}/MASTER`
            ],
            formatter: (MASTER) => {

                let bEnabled = false;

                let sStr = MASTER.T_MINFO.find(element => element == "S");
                if (sStr) {
                    bEnabled = true;
                }

                return bEnabled;

            }
        };

        var oModelInfoTable = oAPP.fn.fnGetModelInfoTable2();

        return [
            new sap.m.WizardStep(C_TMPL_WZD2_STEP1_ID, {
                // title: "UI Choice",
                validated: false,
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [
                            new sap.m.Select({
                                selectedKey: "{UICHOICE/S/selectedKey}",
                                width: "300px",
                                change: oAPP.events.ev_tmplWzd2SelectChangeEvent,
                                items: {
                                    path: "UICHOICE/S/ITEM",
                                    template: new sap.ui.core.ListItem({
                                        key: "{OBJNM}",
                                        text: "{OBJNM}",
                                    })
                                }
                            }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindProperty))

                        ]
                    })
                ]
            }).bindProperty("title", "UICHOICE/S/selectedKey", function (key) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D77"); // UI Choice

                if (key && key !== "") {
                    sTitle += " [ " + key + " ] ";
                }

                return sTitle;

            }),

            new sap.m.WizardStep(C_TMPL_WZD2_STEP2_ID, {
                title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D66"), // Model Select
                validated: false,
                content: [

                    new sap.m.Button({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D66"), // Model Select
                        press: oAPP.events.ev_tmplWzd2ModelSelectBtn
                    }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindProperty)),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD2_STEP3_ID, {
                validated: false,
                // title: `Model Information   [{MODELTABLE2/MODEL}]`,
                content: [
                    oModelInfoTable
                ],
            }).bindProperty("title", "MODELTABLE2/MODEL", function (MODEL) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D67"); // Model Information

                if (MODEL && MODEL !== "") {
                    sTitle += " [ " + MODEL + " ] ";
                }

                return sTitle;

            })

        ];

    }; // end of oAPP.fn.fnGetTempWizardContent2WzdSteps

    /************************************************************************
     * Report Ui Create 에 대한 wizard
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContents3 = function () {

        let aSteps = oAPP.fn.fnGetTempWizardContent3WzdSteps();

        return new sap.m.Wizard(C_TMPL_WZD3_ID, {
            showNextButton: true,
            backgroundDesign: sap.m.PageBackgroundDesign.Solid,
            steps: aSteps
        });

    }; // end of oAPP.fn.fnGetTempWizardContents3

    /************************************************************************
     * Report Ui Create 에 대한 wizard Steps
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContent3WzdSteps = () => {

        let oEnabledBindPropertyS = {
            parts: [
                `${C_TMPL_BIND_ROOT}/MASTER`
            ],
            formatter: (MASTER) => {

                let bEnabled = false;

                let sStr = MASTER.T_MINFO.find(element => element == "S");
                if (sStr) {
                    bEnabled = true;
                }

                return bEnabled;

            }
        },
            oEnabledBindPropertyT = {
                parts: [
                    `${C_TMPL_BIND_ROOT}/MASTER`
                ],
                formatter: (MASTER) => {

                    let bEnabled = false;

                    var sTab = MASTER.T_MINFO.find(element => element == "T");
                    if (sTab) {
                        bEnabled = true;
                    }

                    return bEnabled;
                }

            };

        var oFormModelInfoTable = oAPP.fn.fnGetModelInfoTable3(),
            oTableModelInfoTable = oAPP.fn.fnGetModelInfoTable4();

        return [

            // form Ui Choice
            new sap.m.WizardStep(C_TMPL_WZD3_STEP1_ID, {
                validated: false,
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [
                            new sap.m.Select({
                                selectedKey: "{UICHOICE/A/selectedKeyS}",
                                width: "300px",
                                change: oAPP.events.ev_tmplWzd3SelectChangeEvent,
                                items: {
                                    path: "UICHOICE/S/ITEM",
                                    template: new sap.ui.core.ListItem({
                                        key: "{OBJNM}",
                                        text: "{OBJNM}",
                                    })
                                }
                            }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindPropertyS))

                        ]
                    })
                ]
            }).bindProperty("title", "UICHOICE/A/selectedKeyS", function (key) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D78"); // Form UI Choice

                if (key && key !== "") {
                    sTitle += "\n [ " + key + " ] ";
                }

                return sTitle;

            }),

            new sap.m.WizardStep(C_TMPL_WZD3_STEP2_ID, {
                title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D79"), // Form Ui Model Select
                validated: false,
                content: [

                    new sap.m.Button({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D79"), // Form Ui Model Select
                        press: oAPP.events.ev_tmplWzd3ModelSelectBtn
                    }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindPropertyS)),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD3_STEP3_ID, {
                validated: false,

                // Aggregations
                content: [
                    oFormModelInfoTable,
                ],

            }).bindProperty("title", "MODELTABLE3/MODEL", function (MODEL) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D80"); // Form Ui Model Information;

                if (MODEL && MODEL !== "") {
                    sTitle += "\n [ " + MODEL + " ] ";
                }

                return sTitle;
            }),

            // table Ui Choice
            new sap.m.WizardStep(C_TMPL_WZD3_STEP4_ID, {
                validated: false,
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [
                            new sap.m.Select({

                                // properties
                                selectedKey: "{UICHOICE/A/selectedKeyT}",
                                width: "300px",

                                // events
                                change: oAPP.events.ev_tmplWzd4SelectChangeEvent,

                                // aggregations
                                items: {
                                    path: "UICHOICE/T/ITEM",
                                    template: new sap.ui.core.ListItem({
                                        key: "{OBJNM}",
                                        text: "{OBJNM}",
                                    })
                                }

                            }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindPropertyT))

                        ]
                    })
                ]

            }).bindProperty("title", "UICHOICE/A/selectedKeyT", function (key) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D84"); // Table Ui Choice

                if (key && key !== "") {
                    sTitle += "\n [ " + key + " ] ";
                }

                return sTitle;

            }),

            new sap.m.WizardStep(C_TMPL_WZD3_STEP5_ID, {
                validated: false,
                title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D81"), // Table Ui Model Select
                content: [
                    new sap.m.Button({

                        // properties
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D81"), // Table Ui Model Select

                        // events
                        press: oAPP.events.ev_tmplWzd4ModelSelectBtn

                    }).bindProperty("enabled", jQuery.extend(true, {}, oEnabledBindPropertyT)),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD3_STEP6_ID, {

                // properties
                validated: false,

                // Aggregations
                content: [
                    oTableModelInfoTable
                ],

            }).bindProperty("title", "MODELTABLE4/MODEL", function (MODEL) {

                let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D82"); // Table Ui Model Information

                if (MODEL && MODEL !== "") {
                    sTitle += "\n [ " + MODEL + " ] ";
                }

                return sTitle;

            })

        ];

    }; // end of oAPP.fn.fnGetTempWizardContent3WzdSteps

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Parent] Check Box 에서
     * 현재 선택된 Row를 제외한 나머지 Parent의 Check Box는 disable
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe = function (bIsEnabled, oCtxData) {

        var aTableData = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE1/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        var FNAME = oCtxData.FNAME,
            oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`);

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (oFlags.bIsCChk == true && oTableData.enabled_cchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_pchk = bIsEnabled;

        }

    }; // end of oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe   

    /************************************************************************
     * Report TemplateCreate의 Tree Table의 [Parent] Check Box 에서
     * 현재 선택된 Row를 제외한 나머지 Parent의 Check Box는 disable
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd3_Table_Parent_Enabled_WithoutMe = (bIsEnabled, oCtxData) => {

        var aTableData = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE4/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        var FNAME = oCtxData.FNAME,
            oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEFLG`);

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (oFlags.bIsCChk == true && oTableData.enabled_cchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_pchk = bIsEnabled;

        }

    }; // end of oAPP.fn.fnSetTmplWzd3_Table_Parent_Enabled_WithoutMe

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Child] Check Box 에서
     * 현재 선택된 Row를 제외한 나머지 Child의 Check Box는 disable
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd1_Table_Child_Enabled_WithoutMe = function (bIsEnabled, oCtxData) {

        var aTableData = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE1/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        var FNAME = oCtxData.FNAME,
            oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`);

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (oFlags.bIsPChk == true && oTableData.enabled_pchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_cchk = bIsEnabled;

        }

    }; // end of fnSetTmplWzd1_Table_Child_Enabled_WithoutMe

    /************************************************************************
     * Report Template Create의 Tree Table의 [Child] Check Box 에서
     * 현재 선택된 Row를 제외한 나머지 Child의 Check Box는 disable
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd3_Table_Child_Enabled_WithoutMe = (bIsEnabled, oCtxData) => {

        var aTableData = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE4/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        var FNAME = oCtxData.FNAME,
            oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEFLG`);

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (oFlags.bIsPChk == true && oTableData.enabled_pchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_cchk = bIsEnabled;

        }

    }; // end of oAPP.fn.fnSetTmplWzd3_Table_Child_Enabled_WithoutMe

    /************************************************************************
     * Table Ui Create의 Model Select Popup Callback
     ************************************************************************/
    oAPP.fn.fnTmplWzd1ModelSelectPopupCallback = function (bIsBind, oResult) {

        if (!bIsBind) {
            return;
        }

        var oTableModel = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T`),
            aTableModelItems = oTableModel.ITEM,
            sSelectedKey = oTableModel.selectedKey;

        if (sSelectedKey == "") {
            return;
        }

        var oUiFind = aTableModelItems.find(element => element.OBJNM == sSelectedKey);

        var sModelName = oResult.CHILD, // Bind 팝업에서 선택한 Model 명
            oAppInfo = parent.getAppInfo(), // app 정보            
            sServerPath = parent.getServerPath(),
            sTempWzdService = PATH.join(sServerPath, "ui_temp_wzd"),
            oParam = {
                UIFND: oUiFind.UIFND, // UI Choice 
                MODEL: sModelName, // Bind Popup에서 선택한 테이블명
                CLSID: oAppInfo.CLSID // 런타임클래스 ID
            };

        var oFormData = new FormData();
        oFormData.append("ACTCD", "WZD_GET_FLD_INFO");
        oFormData.append("MODEL", oParam.MODEL);
        oFormData.append("CLSID", oParam.CLSID);
        oFormData.append("UIFND", oParam.UIFND);

        parent.setBusy("X");

        // 현재 선택한 모델의 컬럼 정보를 구하러 서버 호출
        sendAjax(sTempWzdService, oFormData, oAPP.fn.fnGetTmplWzd1ModelSuccess.bind(oParam));

    }; // end of oAPP.fn.fnTmplWzd1ModelSelectPopupCallback

    /************************************************************************
     * Form Ui Create의 Model Select Popup Callback
     ************************************************************************/
    oAPP.fn.fnTmplWzd2ModelSelectPopupCallback = function (bIsBind, oResult) {

        if (!bIsBind) {
            return;
        }

        var oTableModel = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/S`),
            aTableModelItems = oTableModel.ITEM,
            sSelectedKey = oTableModel.selectedKey;

        if (sSelectedKey == "") {
            return;
        }

        var oUiFind = aTableModelItems.find(element => element.OBJNM == sSelectedKey);

        var sModelName = oResult.CHILD, // Bind 팝업에서 선택한 Model 명
            oAppInfo = parent.getAppInfo(), // app 정보            
            sServerPath = parent.getServerPath(),
            sTempWzdService = PATH.join(sServerPath, "ui_temp_wzd"),
            oParam = {
                UIFND: oUiFind.UIFND, // UI Choice 
                MODEL: sModelName, // Bind Popup에서 선택한 테이블명
                CLSID: oAppInfo.CLSID // 런타임클래스 ID
            };

        var oFormData = new FormData();
        oFormData.append("ACTCD", "WZD_GET_FLD_INFO");
        oFormData.append("MODEL", oParam.MODEL);
        oFormData.append("CLSID", oParam.CLSID);
        oFormData.append("UIFND", oParam.UIFND);

        parent.setBusy("X");

        // 현재 선택한 모델의 컬럼 정보를 구하러 서버 호출
        sendAjax(sTempWzdService, oFormData, oAPP.fn.fnGetTmplWzd2ModelSuccess.bind(oParam));


    }; // end of oAPP.fn.fnTmplWzd2ModelSelectPopupCallback    

    /************************************************************************
     * Report Ui Create의 Form Ui Model Select Popup Callback
     ************************************************************************/
    oAPP.fn.fnTmplWzd3ModelSelectPopup1Callback = function (bIsBind, oResult) {

        if (!bIsBind) {
            return;
        }

        var oTableModel = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/S`),
            oSelectedKey = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A`),
            aTableModelItems = oTableModel.ITEM,
            sSelectedKey = oSelectedKey.selectedKeyS;

        if (sSelectedKey == "") {
            return;
        }

        var oUiFind = aTableModelItems.find(element => element.OBJNM == sSelectedKey);

        var sModelName = oResult.CHILD, // Bind 팝업에서 선택한 Model 명
            oAppInfo = parent.getAppInfo(), // app 정보            
            sServerPath = parent.getServerPath(),
            sTempWzdService = PATH.join(sServerPath, "ui_temp_wzd"),
            oParam = {
                UIFND: oUiFind.UIFND, // UI Choice 
                MODEL: sModelName, // Bind Popup에서 선택한 테이블명
                CLSID: oAppInfo.CLSID // 런타임클래스 ID
            };

        var oFormData = new FormData();
        oFormData.append("ACTCD", "WZD_GET_FLD_INFO");
        oFormData.append("MODEL", oParam.MODEL);
        oFormData.append("CLSID", oParam.CLSID);
        oFormData.append("UIFND", oParam.UIFND);

        parent.setBusy("X");

        // 현재 선택한 모델의 컬럼 정보를 구하러 서버 호출
        sendAjax(sTempWzdService, oFormData, oAPP.fn.fnGetTmplWzd3Model1Success.bind(oParam));

    }; // end of oAPP.fn.fnTmplWzd3ModelSelectPopup1Callback

    /************************************************************************
     * Report Template Create의 Table Ui Model Select Popup Callback
     ************************************************************************/
    oAPP.fn.fnTmplWzd3ModelSelectPopup2Callback = (bIsBind, oResult) => {

        if (!bIsBind) {
            return;
        }

        var oTableModel = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T`),
            oSelectedKey = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A`),
            aTableModelItems = oTableModel.ITEM,
            sSelectedKey = oSelectedKey.selectedKeyT;

        if (sSelectedKey == "") {
            return;
        }

        var oUiFind = aTableModelItems.find(element => element.OBJNM == sSelectedKey);

        var sModelName = oResult.CHILD, // Bind 팝업에서 선택한 Model 명
            oAppInfo = parent.getAppInfo(), // app 정보            
            sServerPath = parent.getServerPath(),
            sTempWzdService = PATH.join(sServerPath, "ui_temp_wzd"),
            oParam = {
                UIFND: oUiFind.UIFND, // UI Choice 
                MODEL: sModelName, // Bind Popup에서 선택한 테이블명
                CLSID: oAppInfo.CLSID // 런타임클래스 ID
            };

        var oFormData = new FormData();
        oFormData.append("ACTCD", "WZD_GET_FLD_INFO");
        oFormData.append("MODEL", oParam.MODEL);
        oFormData.append("CLSID", oParam.CLSID);
        oFormData.append("UIFND", oParam.UIFND);

        parent.setBusy("X");

        // 현재 선택한 모델의 컬럼 정보를 구하러 서버 호출
        sendAjax(sTempWzdService, oFormData, oAPP.fn.fnGetTmplWzd3Model2Success.bind(oParam));

    }; // end of oAPP.fn.fnTmplWzd3ModelSelectPopup2Callback

    /************************************************************************
     * Table Ui Create의 TreeTable validation check
     ************************************************************************/
    oAPP.fn.fnCheckValidTmplWzd1TreeTable = function (aSelectRows) {

        // return 구조
        var oReturn = {
            RETCD: "",
            RETMSG: ""
        },

            sParTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B76"), // Parent
            sChildTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B77"), // Child
            sErrorMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "050", sParTxt + ", " + sChildTxt), // & is required.

            // parent, child 선택 여부 확인
            oFind1 = aSelectRows.find(element => element.PARENT == "X");

        if (oFind1 == null) {

            oReturn.RETCD = "E";
            oReturn.RETMSG = sErrorMsg;

            return oReturn;
        }

        var oFind2 = aSelectRows.find(element => element.CHILD == "X");
        if (oFind2 == null) {

            oReturn.RETCD = "E";
            oReturn.RETMSG = sErrorMsg;

            return oReturn;
        }

        oReturn.RETCD = "S";

        return oReturn;

    }; // end of oAPP.fn.fnCheckValidTmplWzd1TreeTable

    /************************************************************************
     * UI MODEL 정보의 DDLB 정보 구하기
     ************************************************************************/
    oAPP.fn.fnGetDDLBInfo = function (UIFND) {

        var aAllDDLB = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MASTER/T_UIDDLB`);
        if (aAllDDLB == null) {
            return;
        }

        var aDDLBLIST = [],
            iDDlbLength = aAllDDLB.length;

        for (var i = 0; i < iDDlbLength; i++) {

            var oDDLB = aAllDDLB[i];
            if (UIFND != oDDLB.VAL4) {
                continue;
            }

            aDDLBLIST.push(oDDLB);

        }

        return aDDLBLIST;

    }; // end of oAPP.fn.fnGetDDLBInfo

    /************************************************************************
     * Table UI Create 의 Model Info Table의 테이블 전체 row 데이터 enable or disable 처리
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd1TableAllRowEnable = function (bIsEnableAll) {

        const C_MODEL_TABLE_OUTAB_PATH = `${C_TMPL_WZD1_MODEL_TABLE}/T_OUTAB`;

        var aTableData = APPCOMMON.fnGetModelProperty(C_MODEL_TABLE_OUTAB_PATH),
            sUiChioce = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T/selectedKey`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            oTableData.enabled = bIsEnableAll;

            if (sUiChioce == "sap.ui.table.TreeTable") {

                // Ui Choice에서 Tree Table을 선택했을 경우.
                oTableData.enabled_pchk = bIsEnableAll; // Is Parent checkbox enabled?
                oTableData.enabled_cchk = bIsEnableAll; // Is child checkbox enabled?                

                oTableData.PARENT = "";
                oTableData.CHILD = "";

            }

        }

        APPCOMMON.fnSetModelProperty(C_MODEL_TABLE_OUTAB_PATH, aTableData);

    }; // end of oAPP.fn.fnSetTmplWzd1TableAllRowEnable

    /************************************************************************
     * Form UI Create 의 Model Info Table의 
     * 테이블 전체 row 데이터 enable or disable 처리
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd2TableAllRowEnable = function (bIsEnableAll) {

        var sModelPath = C_TMPL_WZD2_MODEL_TABLE,
            aTableData = APPCOMMON.fnGetModelProperty(`${sModelPath}/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            oTableData.enabled = bIsEnableAll;

        }

        APPCOMMON.fnSetModelProperty(`${sModelPath}/T_OUTAB`, aTableData);

    }; // end of oAPP.fn.fnSetTmplWzd2TableAllRowEnable

    /************************************************************************
     * Report Template Create 의 Form Ui Model Info Table의 
     * 테이블 전체 row 데이터 enable or disable 처리
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd3FormUiTableAllRowEnable = (bIsEnableAll) => {

        var sModelPath = C_TMPL_WZD3_MODEL_TABLE3,
            aTableData = APPCOMMON.fnGetModelProperty(`${sModelPath}/T_OUTAB`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            oTableData.enabled = bIsEnableAll;

        }

        APPCOMMON.fnSetModelProperty(`${sModelPath}/T_OUTAB`, aTableData);

    }; // end of oAPP.fn.fnSetTmplWzd3FormUiTableAllRowEnable

    /************************************************************************
     * Report Template Create 의 Table Ui Model Info Table의 
     * 테이블 전체 row 데이터 enable or disable 처리
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd3TableAllRowEnable = (bIsEnableAll) => {

        const C_MODEL_TABLE_OUTAB_PATH = `${C_TMPL_WZD3_MODEL_TABLE4}/T_OUTAB`;

        var aTableData = APPCOMMON.fnGetModelProperty(C_MODEL_TABLE_OUTAB_PATH),
            sUiChioce = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyT`);

        if (aTableData == null) {
            return;
        }

        var iTableLength = aTableData.length;

        if (iTableLength <= 0) {
            return;
        }

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            oTableData.enabled = bIsEnableAll;

            if (sUiChioce == "sap.ui.table.TreeTable") {

                // Ui Choice에서 Tree Table을 선택했을 경우.
                oTableData.enabled_pchk = bIsEnableAll; // Is Parent checkbox enabled?
                oTableData.enabled_cchk = bIsEnableAll; // Is child checkbox enabled?                

                oTableData.PARENT = "";
                oTableData.CHILD = "";

            }

        }

        APPCOMMON.fnSetModelProperty(C_MODEL_TABLE_OUTAB_PATH, aTableData);

    }; // end of oAPP.fn.fnSetTmplWzd3TableAllRowEnable

    /************************************************************************
     * 좌측 미리보기 이미지 보이기
    ************************************************************************/
    function fnSetPrevImage(sKey = "") {

        let sPrevImgRootPath = PATH.join(APPPATH, "ws10_20", "images", "wizard"),
            sImagePath = PATH.join(sPrevImgRootPath, `${sKey}.png`),

            sPrevImgId = `${C_TMPL_LNAVCON_ID}--Img`,
            oPrevImg = sap.ui.getCore().byId(sPrevImgId);

        if (!sKey) {
            oPrevImg.setSrc("");
            return;
        }

        oPrevImg.setSrc(sImagePath);

    } // end of fnSetPrevImage

    /************************************************************************
     * 좌측 미리보기 이미지 영역 페이지 이동
    ************************************************************************/
    function fnPrevNavPage(sPageId = "P1") {

        let sPrevPagePrefix = C_TMPL_LNAVCON_ID,
            sPrevMovePage = `${sPrevPagePrefix}--${sPageId}`;

        let oLNavCon = sap.ui.getCore().byId(C_TMPL_LNAVCON_ID);

        oLNavCon.to(sPrevMovePage);

    } // end of fnPrevNavPage

    /************************************************************************
     * 좌측 미리보기 이미지 영역 초기화
    ************************************************************************/
    function fnSetPrevInit() {

        fnPrevNavPage(); // 미리보기 영역 페이지 이동

        fnSetPrevImage(); // 미리보기 영역에 이미지 출력

    } // end of fnSetPrevInit





    /************************************************************************************************************************************************
     * [Event] **************************************************************************************************************************************
     ************************************************************************************************************************************************/


    /************************************************************************
     * UI Template Wizard After Navigate Event
     ************************************************************************/
    oAPP.events.ev_tmplwzdAfterNavicon = function (oEvent) {

        let toId = oEvent.getParameter("toId"), // 이동 하려는 페이지 id
            toWzd = toId.split("--", 1)[0], // 이동 하려는 페이지의 wizard id
            oToWzd = sap.ui.getCore().byId(toWzd);

        if (oToWzd == null) {
            return;
        }

        let toCurrStep = oToWzd.getCurrentStep(), // 이동하려는 페이지의 wizard 현재 스텝
            aAllSteps = oToWzd.getSteps(), // 이동하려는 페이지 wizard에 있는 전체 스텝         
            iSteplength = aAllSteps.length,
            bIsCrBtnShow = false;

        if (iSteplength <= 0) {

            // wizard popup create button 활성 / 비활성화   
            fnWizardCreateBtnVisible(bIsCrBtnShow);

            return;
        }

        let oLastStep = aAllSteps[iSteplength - 1]; // 이동하려는 페이지 wizard의 마지막 스텝

        // 이동하려는 페이지 wizard의 현재 스텝이 마지막 스텝과 동일하다면 하단의 Create 버튼 활성화
        if (toCurrStep == oLastStep.sId) {
            bIsCrBtnShow = true;
        }

        // wizard popup create button 활성 / 비활성화   
        fnWizardCreateBtnVisible(bIsCrBtnShow);

    }; // end of oAPP.events.ev_tmplwzdAfterNavicon

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Parent] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd1TreeTableParentChkbox = function (oEvent) {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        let oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`);
        oFlags.bIsPChk = bIsSelect;

        oCtxData.PARENT = (bIsSelect == true ? "X" : "");

        /**
         * parent chkbox에 체크 -> 나를 제외한 parent의 chkbox는 체크 해제
         * parent chkbox에 해제 -> 나를 제외한 parent의 chkbox는 체크
         */
        oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe(!bIsSelect, oCtxData);


        /**
         * parent 에 체크 했는데 child가 check 되어 있으면 child check 해제 후 disable 처리.
         * parent 에 체크 해제 했는데 child가 disable 되어 있으면 enable 처리.
         */

        // parent 에 체크 한 경우..
        if (bIsSelect == true) {

            // Parent에 체크 했는데 Child가 이미 체크 되어 있다면
            // child에 체크 해제 하고 disable 처리한다.
            if (oCtxData.CHILD == "X") {
                oCtxData.CHILD = "";
            }

            oCtxData.enabled_cchk = false;

            APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

            return;
        }

        // parent에 체크를 해제 했는데 child가 disable 되어 있다면
        // child를 enable 처리한다.

        if (oCtxData.enabled_cchk == false && oFlags.bIsCChk == false) {
            oCtxData.enabled_cchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

    }; // end of oAPP.events.ev_tmplWzd1TreeTableParentChkbox

    /************************************************************************
     * Report Template Create의 Tree Table의 [Parent] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd3TreeTableParentChkbox = (oEvent) => {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        let oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEFLG`);
        oFlags.bIsPChk = bIsSelect;

        oCtxData.PARENT = (bIsSelect == true ? "X" : "");

        /**
         * parent chkbox에 체크 -> 나를 제외한 parent의 chkbox는 체크 해제
         * parent chkbox에 해제 -> 나를 제외한 parent의 chkbox는 체크
         */
        oAPP.fn.fnSetTmplWzd3_Table_Parent_Enabled_WithoutMe(!bIsSelect, oCtxData);


        /**
         * parent 에 체크 했는데 child가 check 되어 있으면 child check 해제 후 disable 처리.
         * parent 에 체크 해제 했는데 child가 disable 되어 있으면 enable 처리.
         */

        // parent 에 체크 한 경우..
        if (bIsSelect == true) {

            // Parent에 체크 했는데 Child가 이미 체크 되어 있다면
            // child에 체크 해제 하고 disable 처리한다.
            if (oCtxData.CHILD == "X") {
                oCtxData.CHILD = "";
            }

            oCtxData.enabled_cchk = false;

            APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

            return;
        }

        // parent에 체크를 해제 했는데 child가 disable 되어 있다면
        // child를 enable 처리한다.

        if (oCtxData.enabled_cchk == false && oFlags.bIsCChk == false) {
            oCtxData.enabled_cchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

    }; // end of oAPP.events.ev_tmplWzd3TreeTableParentChkbox

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Child] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd1TreeTableChildChkbox = function (oEvent) {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        let oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`);
        oFlags.bIsCChk = bIsSelect;

        oCtxData.CHILD = (bIsSelect == true ? "X" : "");

        /**
         * Child chkbox에 체크 -> 나를 제외한 Child 의 chkbox 는 체크 해제
         * Child chkbox에 해제 -> 나를 제외한 Child 의 chkbox 는 체크
         */
        oAPP.fn.fnSetTmplWzd1_Table_Child_Enabled_WithoutMe(!bIsSelect, oCtxData);

        /**
         * Child 에 체크 했는데 Parent 가 check 되어 있으면 Child check 해제 후 disable 처리.
         * Child 에 체크 해제 했는데 Parent 가 disable 되어 있으면 enable 처리.
         */

        // Child 에 체크 한 경우..
        if (bIsSelect == true) {

            // Child 에 체크 했는데 Parent 가 이미 체크 되어 있다면
            // Parent 에 체크 해제 하고 disable 처리한다.
            if (oCtxData.PARENT == "X") {
                oCtxData.PARENT = "";
            }

            oCtxData.enabled_pchk = false;

            APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

            return;
        }

        // Child 에 체크를 해제 했는데 Parent 가 disable 되어 있다면
        // Parent 를 enable 처리한다.

        if (oCtxData.enabled_pchk == false && oFlags.bIsPChk == false) {
            oCtxData.enabled_pchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

    }; // end of oAPP.events.ev_tmplWzd1TreeTableChildChkbox    

    /************************************************************************
     * Report Template Create의 Tree Table의 [Child] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd3TreeTableChildChkbox = (oEvent) => {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        let oFlags = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEFLG`);
        oFlags.bIsCChk = bIsSelect;

        oCtxData.CHILD = (bIsSelect == true ? "X" : "");

        /**
         * Child chkbox에 체크 -> 나를 제외한 Child 의 chkbox 는 체크 해제
         * Child chkbox에 해제 -> 나를 제외한 Child 의 chkbox 는 체크
         */
        oAPP.fn.fnSetTmplWzd3_Table_Child_Enabled_WithoutMe(!bIsSelect, oCtxData);

        /**
         * Child 에 체크 했는데 Parent 가 check 되어 있으면 Child check 해제 후 disable 처리.
         * Child 에 체크 해제 했는데 Parent 가 disable 되어 있으면 enable 처리.
         */

        // Child 에 체크 한 경우..
        if (bIsSelect == true) {

            // Child 에 체크 했는데 Parent 가 이미 체크 되어 있다면
            // Parent 에 체크 해제 하고 disable 처리한다.
            if (oCtxData.PARENT == "X") {
                oCtxData.PARENT = "";
            }

            oCtxData.enabled_pchk = false;

            APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

            return;
        }

        // Child 에 체크를 해제 했는데 Parent 가 disable 되어 있다면
        // Parent 를 enable 처리한다.

        if (oCtxData.enabled_pchk == false && oFlags.bIsPChk == false) {
            oCtxData.enabled_pchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);


    }; // end of oAPP.events.ev_tmplWzd3TreeTableChildChkbox

    /************************************************************************
     * Table Ui Create의 UI Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1SelectChangeEvent = function (oEvent) {

        let oWizard = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard == null) {
            return;
        }

        // UI Choice DDLB에서 선택한 값을 구한다.
        let oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        // 1. UI Choice Step
        let oCurrentStep = sap.ui.getCore().byId(C_TMPL_WZD1_STEP1_ID);

        // 선택한 값이 없으면 wizard UI의 첫번째 step으로 이동
        if (sSelectedItemKey == "") {

            // 좌측 미리보기에 이미지 없음 화면으로 이동
            fnPrevNavPage("P1");

            // Model Info Table의 체크 박스 전체 해제
            let oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
            if (oBindInfoTable) {
                oBindInfoTable.clearSelection();
            }

            // 초기화
            oAPP.fn.fnSetWizard1PopupInit();

            oWizard.invalidateStep(oCurrentStep);

            return;
        }

        // 좌측 미리보기 이미지 페이지로 이동
        fnPrevNavPage("P2");

        // Tree Table을 선택 했을 경우 Tree 전용 컬럼을 활성화 한다.
        let sTreeColumnVisi = false;
        if (sSelectedItemKey == "sap.ui.table.TreeTable") {
            sTreeColumnVisi = true;
        }

        // 좌측 미리보기 화면에 이미지 출력
        fnSetPrevImage(sSelectedItemKey);

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEVISI`, sTreeColumnVisi);

        // Model 선택 Step으로 이동
        oWizard.validateStep(oCurrentStep);

    }; // end of oAPP.events.ev_tmplWzd1SelectChangeEvent    

    /************************************************************************
     * Table Ui Create의 Model Select Button Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1ModelSelectBtn = function (oEvent) {

        // UI Choice를 하지 않은 경우 빠져나간다.
        var sUiFind = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T/selectedKey`);
        if (sUiFind == "") {
            return;
        }

        // Bind Popup을 Open 한다.
        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24"); // UI Template Wizard

        oAPP.fn.fnBindPopupOpener(sTitle, "T", oAPP.fn.fnTmplWzd1ModelSelectPopupCallback);

    }; // end of oAPP.events.ev_tmplWzd1ModelSelectBtn

    /************************************************************************
     * Form Ui Create의 Model Select Button Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd2ModelSelectBtn = function () {

        // UI Choice를 하지 않은 경우 빠져나간다.
        var sUiFind = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/S/selectedKey`);
        if (sUiFind == "") {
            return;
        }


        // Bind Popup을 Open 한다.
        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24"); // UI Template Wizard

        oAPP.fn.fnBindPopupOpener(sTitle, "S", oAPP.fn.fnTmplWzd2ModelSelectPopupCallback);

    }; // end of oAPP.events.ev_tmplWzd2ModelSelectBtn    

    /************************************************************************
     * Report Ui Create의 Form Ui Model Select Button Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd3ModelSelectBtn = function () {

        // UI Choice를 하지 않은 경우 빠져나간다.
        var sUiFind = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyS`);
        if (sUiFind == "") {
            return;
        }

        // Bind Popup을 Open 한다.
        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24"); // UI Template Wizard

        oAPP.fn.fnBindPopupOpener(sTitle, "S", oAPP.fn.fnTmplWzd3ModelSelectPopup1Callback);

    }; // end of oAPP.events.ev_tmplWzd3ModelSelectBtn    

    /************************************************************************
     * Report Ui Create의 Table Ui Model Select Button Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd4ModelSelectBtn = () => {

        // UI Choice를 하지 않은 경우 빠져나간다.
        var sUiFind = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyT`);
        if (sUiFind == "") {
            return;
        }

        // Bind Popup을 Open 한다.
        let sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24"); // UI Template Wizard

        oAPP.fn.fnBindPopupOpener(sTitle, "T", oAPP.fn.fnTmplWzd3ModelSelectPopup2Callback);


    }; // end of oAPP.events.ev_tmplWzd4ModelSelectBtn

    /************************************************************************
     * Wizard 생성 버튼
     ************************************************************************/
    oAPP.events.ev_tmplWzdComplete = function () {        

        parent.setBusy("X");

        var sCurrWizardPage = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/TNTMENU/SELKEY`);

        if (typeof sCurrWizardPage !== "string" || sCurrWizardPage == null) {

            parent.setBusy("");

            return;
        };

        switch (sCurrWizardPage) {
            case C_TMPL_WZD1_ID:
                oAPP.events.ev_tmplWzd1Complete();
                return;

            case C_TMPL_WZD2_ID:
                oAPP.events.ev_tmplWzd2Complete();
                return;

            case C_TMPL_WZD3_ID:
                oAPP.events.ev_tmplWzd3Complete();
                return;

        }

    }; // end of oAPP.events.ev_tmplWzdComplete

    /************************************************************************
     * Table Ui Create의 Wizard Complete Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1Complete = function () {

        // Model Table
        var oTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
        if (oTable == null) {

            parent.setBusy("");

            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {
            
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "268"); // Selected line does not exists.
            
            parent.showMessage(sap, 10, "E", sMsg);

            parent.setBusy("");

            return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            oModelTable = oModelData.MODELTABLE1,
            aTableData = oModelTable.T_OUTAB,
            sUiChioce = oModelData.UICHOICE.T.selectedKey;

        var aSelectRows = [];

        for (var i = 0; i < iSelectIdxLength; i++) {

            var iIdx = aSelectIdx[i];

            aSelectRows.push(aTableData[iIdx]);

        }

        // 데이터 정합성 체크..

        // UI CHOICE가 Tree table 일 경우..
        if (sUiChioce == "sap.ui.table.TreeTable") {

            var oResult = oAPP.fn.fnCheckValidTmplWzd1TreeTable(aSelectRows);
            if (oResult.RETCD == "E") {

                parent.showMessage(sap, 10, "", oResult.RETMSG);

                parent.setBusy("");

                return;
            }

        } else {

            // POSITION 기준으로 정렬
            aSelectRows = aSelectRows.sort(function (a, b) {
                return a["POSIT"] - b["POSIT"];
            });

        }

        // Table Wizard 정보 구성
        var oComplete = {
            uName: sUiChioce, // Table 명 (sap.m.Table..)
            mName: oModelTable.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        function lf_callback(oReturn) {

            // // Busy Dialog를 끈다.
            // APPCOMMON.fnSetBusyDialog(false);

            if (oReturn.SUBRC == "E") {

                parent.showMessage(sap, 10, "E", oReturn.MSG);

                parent.setBusy("");

                return;
            }

            parent.showMessage(sap, 10, "S", oReturn.MSG);

            oAPP.events.pressUiTempWizardDialogClose();

            parent.setBusy("");

        }

        oAPP.fn.designWizardCallback(oComplete, lf_callback);

    }; // end of oAPP.events.ev_tmplWzd1Complete 

    /************************************************************************
     * Form Ui Create의 Wizard Complete Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd2Complete = function () {

        // Model Table
        var oTable = sap.ui.getCore().byId(C_TMPL_WZD2_MODEL_TABLE_ID);
        if (oTable == null) {

            parent.setBusy("");

            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {

            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "268"); // Selected line does not exists.
            
            parent.showMessage(sap, 10, "E", sMsg);

            parent.setBusy("");

            return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            oModelTable = oModelData.MODELTABLE2,
            aTableData = oModelTable.T_OUTAB,
            sUiChioce = oModelData.UICHOICE.S.selectedKey;

        var aSelectRows = [];

        for (var i = 0; i < iSelectIdxLength; i++) {

            var iIdx = aSelectIdx[i];

            aSelectRows.push(aTableData[iIdx]);

        }

        // POSITION 기준으로 정렬
        aSelectRows = aSelectRows.sort(function (a, b) {
            return a["POSIT"] - b["POSIT"];
        });

        // Table Wizard 정보 구성
        var oComplete = {
            uName: sUiChioce, // Table 명 (sap.m.Table..)
            mName: oModelTable.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        function lf_callback(oReturn) {

            // // Busy Dialog를 끈다.
            // APPCOMMON.fnSetBusyDialog(false);

            if (oReturn.SUBRC == "E") {
                
                parent.showMessage(sap, 10, "E", oReturn.MSG);

                parent.setBusy("");

                return;
            }

            parent.showMessage(sap, 10, "S", oReturn.MSG);

            oAPP.events.pressUiTempWizardDialogClose();

            parent.setBusy("");

        }

        oAPP.fn.designWizardCallback(oComplete, lf_callback);

    }; // end of oAPP.events.ev_tmplWzd2Complete    

    /************************************************************************
     * Report Template Create의 Wizard Complete Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd3Complete = () => {

        // Report Template의 Form 정보를 구한다.
        let oFormResult = oAPP.fn.fnGetTmplWzd3FormComplete();
        if (oFormResult.RETCD && oFormResult.RETCD == "E") {

            parent.showMessage(sap, 10, "E", oFormResult.RTMSG);

            parent.setBusy("");

            return;
        }

        // Report Template의 Table 정보를 구한다.
        let oTableResult = oAPP.fn.fnGetTmplWzd3TableComplete();
        if (oTableResult.RETCD && oTableResult.RETCD == "E") {

            parent.showMessage(sap, 10, "E", oTableResult.RTMSG);

            parent.setBusy("");

            return;
        }

        let oResult = {
            uName: "ReportTemplate",
            oSearch: oFormResult,
            oList: oTableResult
        }

        oAPP.fn.designWizardCallback(oResult, lf_callback);

        function lf_callback(oReturn) {

            // // Busy Dialog를 끈다.
            // APPCOMMON.fnSetBusyDialog(false);

            if (oReturn.SUBRC == "E") {

                parent.showMessage(sap, 10, "E", oReturn.MSG);

                parent.setBusy("");

                return;
            }

            parent.showMessage(sap, 10, "S", oReturn.MSG);

            oAPP.events.pressUiTempWizardDialogClose();

            parent.setBusy("");

        }

    }; // end of oAPP.events.ev_tmplWzd3Complete

    /************************************************************************
     * Report Template Create 의 Form 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd3FormComplete = () => {

        // Model Table
        var oTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE1_ID);
        if (oTable == null) {
            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {

            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D80"); // Form Ui Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "348", sMsg); // Please select a row of &1

            return {
                RETCD: "E",
                RTMSG: sMsg
            };

            // parent.showMessage(sap, 10, "E", "라인을 선택하세요.");
            // return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            oModelTable = oModelData.MODELTABLE3,
            aTableData = oModelTable.T_OUTAB,
            sUiChioce = oModelData.UICHOICE.A.selectedKeyS;

        var aSelectRows = [];

        for (var i = 0; i < iSelectIdxLength; i++) {

            var iIdx = aSelectIdx[i];

            aSelectRows.push(aTableData[iIdx]);

        }

        // POSITION 기준으로 정렬
        aSelectRows = aSelectRows.sort(function (a, b) {
            return a["POSIT"] - b["POSIT"];
        });

        // Table Wizard 정보 구성
        var oComplete = {
            uName: sUiChioce, // Table 명 (sap.m.Table..)
            mName: oModelTable.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        return oComplete;

    }; // end of oAPP.fn.fnGetTmplWzd3FormComplete

    /************************************************************************
     * Report Template Create 의 Table 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetTmplWzd3TableComplete = () => {

        // Model Table
        var oTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE2_ID);
        if (oTable == null) {
            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {

            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D82", "", "", "", ""); // Table Ui Model Information
            sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "348", sMsg); // Please select a row of &1

            return {
                RETCD: "E",
                RTMSG: sMsg //"Table Ui Model Information 의 라인을 선택하세요."
            };
            // parent.showMessage(sap, 10, "E", "라인을 선택하세요.");
            // return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            oModelTable = oModelData.MODELTABLE4,
            aTableData = oModelTable.T_OUTAB,
            sUiChioce = oModelData.UICHOICE.A.selectedKeyT;

        var aSelectRows = [];

        for (var i = 0; i < iSelectIdxLength; i++) {

            var iIdx = aSelectIdx[i];

            aSelectRows.push(aTableData[iIdx]);

        }

        // 데이터 정합성 체크..

        // UI CHOICE가 Tree table 일 경우..
        if (sUiChioce == "sap.ui.table.TreeTable") {

            var oResult = oAPP.fn.fnCheckValidTmplWzd1TreeTable(aSelectRows);
            if (oResult.RETCD == "E") {

                return {
                    RETCD: "E",
                    RTMSG: oResult.RETMSG
                };
                // parent.showMessage(sap, 10, "", oResult.RETMSG);
                return;
            }

        } else {

            // POSITION 기준으로 정렬
            aSelectRows = aSelectRows.sort(function (a, b) {
                return a["POSIT"] - b["POSIT"];
            });

        }

        // Table Wizard 정보 구성
        var oComplete = {
            uName: sUiChioce, // Table 명 (sap.m.Table..)
            mName: oModelTable.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        return oComplete;

    }; // end of oAPP.fn.fnGetTmplWzd3TableComplete

    /************************************************************************
     * Forms Ui Create의 UI Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd2SelectChangeEvent = function (oEvent) {

        let oWizard = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard == null) {
            return;
        }

        // UI Choice DDLB에서 선택한 값을 구한다.
        let oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        // Form Ui Choice Step
        let oCurrentStep = sap.ui.getCore().byId(C_TMPL_WZD2_STEP1_ID);

        // 선택한 값이 없으면 wizard UI의 첫번째 step으로 이동
        if (sSelectedItemKey == "") {

            // 좌측 미리보기에 이미지 없음 화면으로 이동
            fnPrevNavPage("P1");

            // Model Info Table의 체크 박스 전체 해제
            let oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD2_MODEL_TABLE_ID);
            if (oBindInfoTable) {
                oBindInfoTable.clearSelection();
            }

            // 초기화
            oAPP.fn.fnSetWizard2PopupInit();

            oWizard.invalidateStep(oCurrentStep);

            return;
        }

        // 좌측 미리보기 이미지 페이지로 이동
        fnPrevNavPage("P2");

        // 좌측 미리보기 화면에 이미지 출력
        fnSetPrevImage(sSelectedItemKey);

        // Model 선택 Step으로 이동
        oWizard.validateStep(oCurrentStep);

    }; // end of oAPP.events.ev_tmplWzd2SelectChangeEvent

    /************************************************************************
     * Report Template Create의 Form Ui Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd3SelectChangeEvent = (oEvent) => {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // wizard popup create button 숨기기        
        fnWizardCreateBtnVisible(false);

        // UI Choice DDLB에서 선택한 값을 구한다.
        var oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        let oCurrentStep = sap.ui.getCore().byId(C_TMPL_WZD3_STEP1_ID);

        // 선택한 값이 없으면 wizard UI의 첫번째 step으로 이동
        if (sSelectedItemKey == "") {

            // Model Info Table의 체크 박스 전체 해제
            var oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE1_ID);
            if (oBindInfoTable) {
                oBindInfoTable.clearSelection();
            }

            // 초기화
            oAPP.fn.fnSetWizard3Popup1Init();

            oWizard.invalidateStep(oCurrentStep);

            return;
        }

        oWizard.validateStep(oCurrentStep);

    }; // end of oAPP.events.ev_tmplWzd3SelectChangeEvent

    /************************************************************************
     * Report Template Create의 Table Ui Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd4SelectChangeEvent = (oEvent) => {

        let oWizard = sap.ui.getCore().byId(C_TMPL_WZD3_ID);
        if (oWizard == null) {
            return;
        }

        // UI Choice DDLB에서 선택한 값을 구한다.
        let oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        // 4. Table Ui Choice step
        let oCurrentStep = sap.ui.getCore().byId(C_TMPL_WZD3_STEP4_ID);

        // 선택한 값이 없으면 4번째 스텝 이후의 모델 데이터는 지우고 4번째 스텝으로 이동
        if (sSelectedItemKey == "") {

            // Model Info Table의 체크 박스 전체 해제
            let oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD3_MODEL_TABLE2_ID);
            if (oBindInfoTable) {
                oBindInfoTable.clearSelection();
            }

            // 초기화
            oAPP.fn.fnSetWizard3Popup2Init();

            oWizard.invalidateStep(oCurrentStep);

            return;
        }

        // Tree Table을 선택 했을 경우 Tree 전용 컬럼을 활성화 한다.
        let sTreeColumnVisi = false;
        if (sSelectedItemKey == "sap.ui.table.TreeTable") {
            sTreeColumnVisi = true;
        }

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEVISI`, sTreeColumnVisi);

        // Table Ui 정보가 있다면 wizard 생성 버튼을 활성화 한다.
        let bIsCreateBtnVisi = false,
            oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_WZD3_MODEL_TABLE4);

        if (oModelData) {
            bIsCreateBtnVisi = true;
        }

        // wizard popup create button 숨기기        
        fnWizardCreateBtnVisible(bIsCreateBtnVisi);

        oWizard.validateStep(oCurrentStep);

    }; // end of oAPP.events.ev_tmplWzd4SelectChangeEvent

    /************************************************************************
     * UI TEMPLATE WIZARD Dialog After Open Event
     ************************************************************************/
    oAPP.events.ev_UiTempWizardAfterOpen = function (oEvent) {

        parent.setBusy('');

    }; // end of oAPP.events.ev_UiTempWizardAfterOpen

    /************************************************************************
     * UI TEMPLATE WIZARD Dialog After Close Event
     ************************************************************************/
    oAPP.events.ev_UiTempWizardAfterClose = function () {

        oAPP.fn.fnSetWizard1PopupInit(); // Table UI Create 초기화
        oAPP.fn.fnSetWizard2PopupInit(); // Forms Ui Create 초기화
        oAPP.fn.fnSetWizard3Popup1Init(); // Report Template Create의 Form Ui 초기화
        // oAPP.fn.fnSetWizard3Popup2Init(); // Report Template Create의 Table Ui 초기화

        fnSetPrevInit(); // 좌측 미리보기 영역 초기화

        APPCOMMON.fnSetModelProperty("/WS20/TMPLWZD", undefined);

    }; // end of oAPP.events.ev_UiTempWizardAfterClose

    /************************************************************************
     * UI TEMPLATE WIZARD Dialog Tnt Menu Item Select Event
     ************************************************************************/
    oAPP.events.ev_sideNaviItemSelection = function (oEvent) {       

        var oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getProperty("key"),
            sTitle = oSelectedItem.getProperty("text");

        var oNavCon = sap.ui.getCore().byId(C_TMPL_NAVCON_ID);
        if (oNavCon == null) {
            return;
        }

        let sPageId = `${sItemKey}--page`;

        oNavCon.to(`${sItemKey}--page`);

        // 선택한 메뉴명을 페이지 타이틀에 보여준다.
        let oPage = sap.ui.getCore().byId(sPageId);
        if (!oPage) {
            return;
        }

        oPage.setTitle(sTitle);

        let oUiChoiceData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT + "/UICHOICE");

        // 선택한 메뉴별 Preview 화면 구성
        let sSelectedKey = "";

        switch (sItemKey) {

            case C_TMPL_WZD1_ID: // Table Ui Create

                sSelectedKey = oUiChoiceData.T.selectedKey;

                break;

            case C_TMPL_WZD2_ID: // Form Ui Create

                sSelectedKey = oUiChoiceData.S.selectedKey;

                break;

            case C_TMPL_WZD3_ID: // Report Template Create

                fnPrevNavPage("P2"); // 미리보기 영역 페이지 이동

                fnSetPrevImage("ReportTemplate"); // 미리보기 영역에 이미지 출력

                return;

        }

        if (!sSelectedKey) {
            fnSetPrevInit(); // 미리보기 화면 초기화
            return;
        }

        fnPrevNavPage("P2"); // 미리보기 영역 페이지 이동

        fnSetPrevImage(sSelectedKey); // 미리보기 영역에 이미지 출력

    }; // end of oAPP.events.ev_sideNaviItemSelection      

    /************************************************************************
     * UI Template Wizard Popup Close event
     ************************************************************************/
    oAPP.events.pressUiTempWizardDialogClose = function () {

        var oTmplWzdDlg = sap.ui.getCore().byId(C_TMPL_WZD_DLG_ID);
        if (oTmplWzdDlg == null) {
            return;
        }

        oTmplWzdDlg.close();

    }; // end of oAPP.events.pressUiTempWizardDialogClose       

    /************************************************************************
     * Table UI Create 의 Model Info Table의 Row Selection Change Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1_ModelInfoTable_RowSelection = function (oEvent) {

        const C_TreeFlagBindPath = `${C_TMPL_BIND_ROOT}/${C_TMPL_WZD1_ID}/TREEFLG`;

        var oTable = oEvent.getSource(),
            aSelectedIndices = oTable.getSelectedIndices(),
            iIndicesLength = aSelectedIndices.length,
            bIsSelectAll = oEvent.getParameter("selectAll"),
            sUiChioce = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T/selectedKey`);

        // 전체 선택 해제라면..
        if (iIndicesLength <= 0) {

            var oFlags = {
                bIsPChk: false,
                bIsCChk: false,
            };

            APPCOMMON.fnSetModelProperty(C_TreeFlagBindPath, oFlags);

            // 모든 필드를 Disable 처리한다.
            oAPP.fn.fnSetTmplWzd1TableAllRowEnable(false);

            return;
        }

        // 전체 선택 이라면..
        if (bIsSelectAll == true) {

            // 모든 필드를 Enable 처리한다.
            oAPP.fn.fnSetTmplWzd1TableAllRowEnable(true);
            return;

        }

        // 개별 선택일 경우...

        //현재 선택한 Row의 Binding 정보를 구한다.
        var oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        // 개별 Row의 체크박스에 선택이냐 해제이냐에 따라서 해당 선택한 행을 Enable or Disable 처리..
        var oRowData = APPCOMMON.fnGetModelProperty(oRowCtx.sPath),
            bIsSelected = event.target.getAttribute("aria-selected") == "true" ? true : false;

        oRowData.enabled = bIsSelected;

        if (sUiChioce != "sap.ui.table.TreeTable") {
            oTable.getModel().refresh();
            return;
        }

        var oFlags = APPCOMMON.fnGetModelProperty(C_TreeFlagBindPath);

        // Row를 선택 했을 경우.
        if (bIsSelected == true) {

            oRowData.enabled_pchk = bIsSelected;
            oRowData.enabled_cchk = bIsSelected;

            // Parent 전체 정보 중, 이미 선택되어 있는 Parent 가 있을 경우.
            // 나 자신의 Parent를 비활성화 한다.
            if (oFlags.bIsPChk == true) {
                oRowData.enabled_pchk = false;
            }

            // Child 전체 정보 중, 이미 선택되어 있는 Child 가 있을 경우.
            // 나 자신의 Child를 비활성화 한다.
            if (oFlags.bIsCChk == true) {
                oRowData.enabled_cchk = false;
            }

            oTable.getModel().refresh();

            return;

        }

        // Row를 선택 해제 했을 경우.
        oRowData.enabled_pchk = bIsSelected;
        oRowData.enabled_cchk = bIsSelected;

        var oFlags = {
            bIsPChk: false,
            bIsCChk: false,
        };

        // PARENT가 선택되어 있다면..
        if (oRowData.PARENT == "X") {

            oFlags.bIsPChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 PARENT를 활성화 한다.
            oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

        // CHILD가 선택되어 있다면..        
        if (oRowData.CHILD == "X") {

            oFlags.bIsCChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 CHILD를 활성화 한다.
            oAPP.fn.fnSetTmplWzd1_Table_Child_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

        APPCOMMON.fnSetModelProperty(C_TreeFlagBindPath, oFlags);

        oTable.getModel().refresh();

    }; // end of oAPP.events.ev_tmplWzd1_ModelInfoTable_RowSelection

    /************************************************************************
     * Form UI Create 의 Model Info Table의 Row Selection Change Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd2_ModelInfoTable_RowSelection = function (oEvent) {

        var oTable = oEvent.getSource(),
            aSelectedIndices = oTable.getSelectedIndices(),
            iIndicesLength = aSelectedIndices.length,
            bIsSelectAll = oEvent.getParameter("selectAll");

        // 전체 선택 해제라면..
        if (iIndicesLength <= 0) {

            // 모든 필드를 Disable 처리한다.
            oAPP.fn.fnSetTmplWzd2TableAllRowEnable(false);
            return;
        }

        // 전체 선택 이라면..
        if (bIsSelectAll == true) {

            // 모든 필드를 Enable 처리한다.
            oAPP.fn.fnSetTmplWzd2TableAllRowEnable(true);
            return;

        }
        // 개별 선택일 경우...

        //현재 선택한 Row의 Binding 정보를 구한다.
        var oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        // 개별 Row의 체크박스에 선택이냐 해제이냐에 따라서 해당 선택한 행을 Enable or Disable 처리..
        var oRowData = APPCOMMON.fnGetModelProperty(oRowCtx.sPath),
            bIsSelected = event.target.getAttribute("aria-selected") == "true" ? true : false;

        oRowData.enabled = bIsSelected;

        oTable.getModel().refresh();

    }; // end of oAPP.events.ev_tmplWzd2_ModelInfoTable_RowSelection  

    /************************************************************************
     * Report Template Create => Form Ui Model Info Table => 
     * Row Selection Change Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd3_ModelInfoTable1_RowSelection = (oEvent) => {

        var oTable = oEvent.getSource(),
            aSelectedIndices = oTable.getSelectedIndices(),
            iIndicesLength = aSelectedIndices.length,
            bIsSelectAll = oEvent.getParameter("selectAll");

        // 전체 선택 해제라면..
        if (iIndicesLength <= 0) {

            // 모든 필드를 Disable 처리한다.
            oAPP.fn.fnSetTmplWzd3FormUiTableAllRowEnable(false);
            return;
        }

        // 전체 선택 이라면..
        if (bIsSelectAll == true) {

            // 모든 필드를 Enable 처리한다.
            oAPP.fn.fnSetTmplWzd3FormUiTableAllRowEnable(true);
            return;

        }
        // 개별 선택일 경우...

        //현재 선택한 Row의 Binding 정보를 구한다.
        var oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        // 개별 Row의 체크박스에 선택이냐 해제이냐에 따라서 해당 선택한 행을 Enable or Disable 처리..
        var oRowData = APPCOMMON.fnGetModelProperty(oRowCtx.sPath),
            bIsSelected = event.target.getAttribute("aria-selected") == "true" ? true : false;

        oRowData.enabled = bIsSelected;

        oTable.getModel().refresh();

    }; // end of oAPP.events.ev_tmplWzd3_ModelInfoTable1_RowSelection

    /************************************************************************
     * Report Template Create => Table Ui Model Info Table => 
     * Row Selection Change Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd3_ModelInfoTable2_RowSelection = (oEvent) => {

        const C_TreeFlagBindPath = `${C_TMPL_BIND_ROOT}/${C_TMPL_WZD3_ID}/TREEFLG`;

        var oTable = oEvent.getSource(),
            aSelectedIndices = oTable.getSelectedIndices(),
            iIndicesLength = aSelectedIndices.length,
            bIsSelectAll = oEvent.getParameter("selectAll"),
            sUiChioce = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/A/selectedKeyT`);

        // 전체 선택 해제라면..
        if (iIndicesLength <= 0) {

            var oFlags = {
                bIsPChk: false,
                bIsCChk: false,
            };

            APPCOMMON.fnSetModelProperty(C_TreeFlagBindPath, oFlags);

            // 모든 필드를 Disable 처리한다.
            oAPP.fn.fnSetTmplWzd3TableAllRowEnable(false);

            return;
        }

        // 전체 선택 이라면..
        if (bIsSelectAll == true) {

            // 모든 필드를 Enable 처리한다.
            oAPP.fn.fnSetTmplWzd3TableAllRowEnable(true);
            return;

        }

        // 개별 선택일 경우...

        //현재 선택한 Row의 Binding 정보를 구한다.
        var oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        // 개별 Row의 체크박스에 선택이냐 해제이냐에 따라서 해당 선택한 행을 Enable or Disable 처리..
        var oRowData = APPCOMMON.fnGetModelProperty(oRowCtx.sPath),
            bIsSelected = event.target.getAttribute("aria-selected") == "true" ? true : false;

        oRowData.enabled = bIsSelected;

        if (sUiChioce != "sap.ui.table.TreeTable") {
            oTable.getModel().refresh();
            return;
        }

        var oFlags = APPCOMMON.fnGetModelProperty(C_TreeFlagBindPath);

        // Row를 선택 했을 경우.
        if (bIsSelected == true) {

            oRowData.enabled_pchk = bIsSelected;
            oRowData.enabled_cchk = bIsSelected;

            // Parent 전체 정보 중, 이미 선택되어 있는 Parent 가 있을 경우.
            // 나 자신의 Parent를 비활성화 한다.
            if (oFlags.bIsPChk == true) {
                oRowData.enabled_pchk = false;
            }

            // Child 전체 정보 중, 이미 선택되어 있는 Child 가 있을 경우.
            // 나 자신의 Child를 비활성화 한다.
            if (oFlags.bIsCChk == true) {
                oRowData.enabled_cchk = false;
            }

            oTable.getModel().refresh();

            return;

        }

        // Row를 선택 해제 했을 경우.
        oRowData.enabled_pchk = bIsSelected;
        oRowData.enabled_cchk = bIsSelected;

        var oFlags = {
            bIsPChk: false,
            bIsCChk: false,
        };

        // PARENT가 선택되어 있다면..
        if (oRowData.PARENT == "X") {

            oFlags.bIsPChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 PARENT를 활성화 한다.
            oAPP.fn.fnSetTmplWzd3_Table_Parent_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

        // CHILD가 선택되어 있다면..        
        if (oRowData.CHILD == "X") {

            oFlags.bIsCChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 CHILD를 활성화 한다.
            oAPP.fn.fnSetTmplWzd3_Table_Child_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

        APPCOMMON.fnSetModelProperty(C_TreeFlagBindPath, oFlags);

        oTable.getModel().refresh();


    }; // end of oAPP.events.ev_tmplWzd3_ModelInfoTable2_RowSelection


    /************************************************************************************************************************************************
     * [Local Function] *****************************************************************************************************************************
     ************************************************************************************************************************************************/


    function fnWizardCreateBtnVisible(bIsVisi) {

        // wizard popup create button 숨기기
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, bIsVisi);

    } // end of fnWizardCreateBtnVisible

})(window, $, oAPP);