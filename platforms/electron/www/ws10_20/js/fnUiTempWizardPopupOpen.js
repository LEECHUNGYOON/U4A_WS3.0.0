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
        C_TMPL_NAVCON_ID = "u4aWsTmplWzdNavCon",
        C_TMPL_BIND_ROOT = "/WS20/TMPLWZD",

        C_TMPL_WZD1_MODEL_TABLE_ID = `${C_TMPL_WZD1_ID}--table`,
        C_TMPL_WZD2_MODEL_TABLE_ID = `${C_TMPL_WZD2_ID}--table`,

        C_TMPL_WZD1_STEP1_ID = `${C_TMPL_WZD1_ID}--step1`,
        C_TMPL_WZD1_STEP2_ID = `${C_TMPL_WZD1_ID}--step2`,
        C_TMPL_WZD1_STEP3_ID = `${C_TMPL_WZD1_ID}--step3`,

        C_TMPL_WZD2_STEP1_ID = `${C_TMPL_WZD2_ID}--step1`,
        C_TMPL_WZD2_STEP2_ID = `${C_TMPL_WZD2_ID}--step2`,
        C_TMPL_WZD2_STEP3_ID = `${C_TMPL_WZD2_ID}--step3`,

        C_TMPL_WZD1_MODEL_TABLE = `${C_TMPL_BIND_ROOT}/MODELTABLE1`,
        C_TMPL_WZD2_MODEL_TABLE = `${C_TMPL_BIND_ROOT}/MODELTABLE2`;

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = parent.PATH,
        APPPATH = parent.APPPATH,
        APPCOMMON = oAPP.common;

    var G_TreeFlag = {};

    oAPP.fn.fnUiTempWizardPopupOpen = function (oTempData) {

        G_TreeFlag = {
            bIsPChk: false,
            bIsCChk: false,
        };

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

        }).addStyleClass(C_TMPL_BIND_ROOT);

        oTmplWzdDlg.bindElement(C_TMPL_BIND_ROOT);

        oTmplWzdDlg.open();

    }; // end of oAPP.fn.fnUiTempWizardPopupOpen

    /**************************************************************************
     *  UI Template Wizard1 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard1PopupInit = function () {

        var oWizard1 = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard1 == null) {
            return;
        }

        var sCurrStep1 = oWizard1.getCurrentStep();
        if (sCurrStep1 == null || sCurrStep1 == C_TMPL_WZD1_STEP1_ID) {
            return;
        }

        // 첫번째 스텝으로 이동 시킨다.
        oWizard1.setCurrentStep(C_TMPL_WZD1_STEP1_ID);

        // wizard popup create button 숨기기
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, false);

        // Model 정보 테이블 초기화
        APPCOMMON.fnSetModelProperty(C_TMPL_WZD1_MODEL_TABLE, []);

        G_TreeFlag = {
            bIsPChk: false,
            bIsCChk: false,
        };

    }; // end of oAPP.fn.fnSetWizard1PopupInit

    /**************************************************************************
     *  UI Template Wizard2 초기화
     **************************************************************************/
    oAPP.fn.fnSetWizard2PopupInit = function () {

        var oWizard2 = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard2 == null) {
            return;
        }

        var sCurrStep2 = oWizard2.getCurrentStep();
        if (sCurrStep2 == null || sCurrStep2 == C_TMPL_WZD2_STEP1_ID) {
            return;
        }

        // 첫번째 스텝으로 이동 시킨다.
        oWizard2.setCurrentStep(C_TMPL_WZD2_STEP1_ID);

        // wizard popup create button 숨기기
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, false);

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD2_MODEL_TABLE, []);

    }; // end of oAPP.fn.fnSetWizard2PopupInit

    /**************************************************************************
     *  UI Template Wizard Model Bindig
     **************************************************************************/
    oAPP.fn.fnUiTempWizardModelBinding = function (oModel) {

        var oModelData = {
            MASTER: oModel,
            TNTMENU: {
                SELKEY: C_TMPL_WZD1_ID,
                MENULIST: [{
                    key: C_TMPL_WZD1_ID,
                    text: "Table Ui Create",
                    enabled: false,
                }, {
                    key: C_TMPL_WZD2_ID,
                    text: "Forms Ui Create",
                    enabled: false,
                }]
            },
            UICHOICE: { // UI Choice DropDown 구조
                S: {
                    selectedKey: "",
                    ITEM: [{
                        key: "",
                        text: ""
                    }]
                },
                T: {
                    selectedKey: "",
                    ITEM: [{
                        key: "",
                        text: ""
                    }]
                },
            },
            TABLEUI: {
                enabled: false, // Table Ui Create 영역 활성화 flag
            },
            FORMUI: {
                enabled: false // FORM UI Create 영역 활성화 flag
            },
            TREEVISI: false, // tree table 선택시 컬럼 visible flag
            CRBTN_VISI: false, // wizard popup의 Create Button visible
        };

        // 모델 유형이 Table 또는 Structure 구조가 있는지 확인
        var sTab = oModel.T_MINFO.find(element => element == "T"),
            sStr = oModel.T_MINFO.find(element => element == "S");

        // Table 유형이 있을 경우 활성화 플래그
        if (sTab != null) {

            oModelData.TNTMENU.MENULIST[0].enabled = true;
            oModelData.TABLEUI.enabled = true;

        }

        // Structure 유형이 있을 경우 활성화 플래그
        if (sStr != null) {

            oModelData.TNTMENU.MENULIST[1].enabled = true;
            oModelData.FORMUI.enabled = true;

        }

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
                    text: "UI Template Wizard"
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
                title: "Preview",
                layoutData: new sap.ui.layout.SplitterLayoutData({
                    size: "500px"
                }),
                content: [
                    new sap.m.Image({
                        width: "100%",
                        height: "100%"
                    }).addStyleClass("u4aWsTmplWzdPrevImg")
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
            oWizard2 = oAPP.fn.fnGetTempWizardContents2();

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
                                enabled: "{enabled}"
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
                        title: "Table UI Create",
                        content: [
                            oWizard1
                        ]
                    }),

                    // Forms UI Create Page
                    new sap.m.Page(`${C_TMPL_WZD2_ID}--page`, {
                        title: "Forms UI Create",
                        content: [
                            oWizard2
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
            showNextButton: false,
            backgroundDesign: sap.m.PageBackgroundDesign.Solid,

            // Aggregations
            steps: aSteps,

        });


    }; // end of oAPP.fn.fnGetTempWizardContents1

    /************************************************************************
     * Table Ui Create 에 대한 wizard Steps
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContent1WzdSteps = function () {

        var oModelInfoTable = oAPP.fn.fnGetModelInfoTable1();

        return [
            new sap.m.WizardStep(C_TMPL_WZD1_STEP1_ID, {
                title: "UI Choice",
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        items: [
                            new sap.m.Select({

                                // properties
                                selectedKey: "{UICHOICE/T/selectedKey}",
                                width: "300px",
                                enabled: "{TABLEUI/enabled}",

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

                            })

                        ]
                    })
                ]
            }),

            new sap.m.WizardStep(C_TMPL_WZD1_STEP2_ID, {
                title: "Model Select",
                content: [
                    new sap.m.Button({

                        // properties
                        text: "Model Select",
                        enabled: "{TABLEUI/enabled}",

                        // events
                        press: oAPP.events.ev_tmplWzd1ModelSelectBtn

                    }),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD1_STEP3_ID, {

                // properties
                title: `Model Information   [{MODELTABLE1/MODEL}]`,


                // Aggregations
                content: [
                    oModelInfoTable
                ],

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

        });

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

        });

    }; // end of oAPP.fn.fnGetModelInfoTable2


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
                    text: "Field Name",
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
                visible: `{${C_TMPL_BIND_ROOT}/TREEVISI}`,
                label: new sap.m.Label({
                    text: "Is Parent",
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
                visible: `{${C_TMPL_BIND_ROOT}/TREEVISI}`,
                label: new sap.m.Label({
                    text: "Is Child",
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
                    text: "Position (Order)",
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    // disable 일 경우 포지션 값을 지운다.
                    if (bIsEnabled == false) {
                        this.setValue(0);
                    }

                    return bIsEnabled;

                })

            }).bindProperty("visible", `${C_TMPL_BIND_ROOT}/TREEVISI`, function (bIsVisi) {
                return !bIsVisi;
            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: "UI Type Select",
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
                    text: "Label Text",
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
                    text: "Field Type",
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
                    text: "Field Length",
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
                    text: "Conv. Routine",
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
                    text: "Field Name",
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
                    text: "Position (Order)",
                    required: true,
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.StepInput({
                    value: "{POSIT}",
                    min: 0,
                    width: "100%",
                }).bindProperty("enabled", "enabled", function (bIsEnabled) {

                    if (bIsEnabled == null) {
                        return true;
                    }

                    // disable 일 경우 포지션 값을 지운다.
                    if (bIsEnabled == false) {
                        this.setValue(0);
                    }

                    return bIsEnabled;

                })

            }),

            new sap.ui.table.Column({
                minWidth: 200,
                width: "200px",
                label: new sap.m.Label({
                    text: "UI Type Select",
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
                    text: "Label Text",
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
                    text: "Field Type",
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
                    text: "Field Length",
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
                    text: "Conv. Routine",
                    design: EnumLabelDesignBold
                }),
                template: new sap.m.Text({
                    text: "{CONVE}"
                })
            }),

        ];

    }; // end of oAPP.fn.fnGetModelInfoTable2Columns

    /************************************************************************
     * Table Ui Create의 바인딩 팝업에서 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
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

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD1_MODEL_TABLE, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard == null) {
            return;
        }

        // Model Info Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD1_STEP3_ID);

        // wizard popup create button 활성화
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, true);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();

    }; // end of oAPP.fn.fnGetTmplWzd1ModelSuccess

    /************************************************************************
     * Form Ui Create의 바인딩 팝업에서 선택한 테이블의 컬럼정보를 서버에서 구한 후의 callback
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

        APPCOMMON.fnSetModelProperty(C_TMPL_WZD2_MODEL_TABLE, oTableModel);

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard == null) {
            return;
        }

        // Model Info Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD2_STEP3_ID);

        // wizard popup create button 활성화
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, true);

        var oTable = sap.ui.getCore().byId(C_TMPL_WZD2_MODEL_TABLE_ID);
        if (oTable == null) {
            return;
        }

        // 테이블 전체 선택
        oTable.selectAll();


    }; // end of oAPP.fn.fnGetTmplWzd1ModelSuccess

    /************************************************************************
     * Forms Ui Create 에 대한 wizard
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContents2 = function () {

        var aSteps = oAPP.fn.fnGetTempWizardContent2WzdSteps();

        return new sap.m.Wizard(C_TMPL_WZD2_ID, {
            showNextButton: false,
            backgroundDesign: sap.m.PageBackgroundDesign.Solid,
            steps: aSteps
        });

    }; // end of oAPP.fn.fnGetTempWizardContents2

    /************************************************************************
     * Forms Ui Create 에 대한 wizard Steps
     ************************************************************************/
    oAPP.fn.fnGetTempWizardContent2WzdSteps = function () {

        var oModelInfoTable = oAPP.fn.fnGetModelInfoTable2();

        return [
            new sap.m.WizardStep(C_TMPL_WZD2_STEP1_ID, {
                title: "UI Choice",
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
                            })

                        ]
                    })
                ]
            }),

            new sap.m.WizardStep(C_TMPL_WZD2_STEP2_ID, {
                title: "Model Select",
                content: [
                    new sap.m.Button({

                        // properties
                        text: "Model Select",
                        enabled: "{FORMUI/enabled}",

                        // events
                        press: oAPP.events.ev_tmplWzd2ModelSelectBtn

                    }),

                ]

            }),

            new sap.m.WizardStep(C_TMPL_WZD2_STEP3_ID, {

                // properties
                title: `Model Information   [{MODELTABLE2/MODEL}]`,


                // Aggregations
                content: [
                    oModelInfoTable
                ],

            })

        ];

    }; // end of oAPP.fn.fnGetTempWizardContent2WzdSteps   


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

        var FNAME = oCtxData.FNAME;

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (G_TreeFlag.bIsCChk == true && oTableData.enabled_cchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_pchk = bIsEnabled;

        }

    }; // end of oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe   

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

        var FNAME = oCtxData.FNAME;

        for (var i = 0; i < iTableLength; i++) {

            var oTableData = aTableData[i];

            if (oTableData.enabled == false) {
                continue;
            }

            if (G_TreeFlag.bIsPChk == true && oTableData.enabled_pchk == true) {
                continue;
            }

            if (oTableData.FNAME == FNAME) {
                continue;
            }

            oTableData.enabled_cchk = bIsEnabled;

        }

    }; // end of fnSetTmplWzd1_Table_Child_Enabled_WithoutMe

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


    }; // end of oAPP.fn.fnTmplWzd1ModelSelectPopupCallback    


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


    }; // end of oAPP.fn.fnTmplWzd1ModelSelectPopupCallback    

    /************************************************************************
     * Table Ui Create의 TreeTable validation check
     ************************************************************************/
    oAPP.fn.fnCheckValidTmplWzd1TreeTable = function (aSelectRows) {

        // return 구조
        var oReturn = {
                RETCD: "",
                RETMSG: ""
            },

            sErrorMsg = oAPP.common.fnGetMsgClsTxt("050", "parent, child"), // "parent, child is required."

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

        var aTableData = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE1/T_OUTAB`),
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

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/MODELTABLE1/T_OUTAB`, aTableData);

    }; // end of oAPP.fn.fnSetTmplWzd1TableAllRowEnable

    /************************************************************************
     * Form UI Create 의 Model Info Table의 테이블 전체 row 데이터 enable or disable 처리
     ************************************************************************/
    oAPP.fn.fnSetTmplWzd2TableAllRowEnable = function (bIsEnableAll) {

        var sModelPath = `${C_TMPL_BIND_ROOT}/MODELTABLE2`,
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





    /************************************************************************************************************************************************
     * [Event] **************************************************************************************************************************************
     ************************************************************************************************************************************************/





    /************************************************************************
     * UI Template Wizard After Navigate Event
     ************************************************************************/
    oAPP.events.ev_tmplwzdAfterNavicon = function (oEvent) {

        var toId = oEvent.getParameter("toId"), // 이동 하려는 페이지 id
            toWzd = toId.split("--", 1)[0], // 이동 하려는 페이지의 wizard id
            oToWzd = sap.ui.getCore().byId(toWzd);

        if (oToWzd == null) {
            return;
        }

        var toCurrStep = oToWzd.getCurrentStep(), // 이동하려는 페이지의 wizard 현재 스텝
            aAllSteps = oToWzd.getSteps(), // 이동하려는 페이지 wizard에 있는 전체 스텝         
            iSteplength = aAllSteps.length;

        if (iSteplength <= 0) {
            return;
        }

        var oLastStep = aAllSteps[iSteplength - 1], // 이동하려는 페이지 wizard의 마지막 스텝
            bIsCrBtnShow = false;

        // 이동하려는 페이지 wizard의 현재 스텝이 마지막 스텝과 동일하다면 하단의 Create 버튼 활성화
        if (toCurrStep == oLastStep.sId) {
            bIsCrBtnShow = true;
        }

        // wizard popup create button 활성 / 비활성화   
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, bIsCrBtnShow);

    }; // end of oAPP.events.ev_tmplwzdAfterNavicon

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Parent] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd1TreeTableParentChkbox = function (oEvent) {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        G_TreeFlag.bIsPChk = bIsSelect;

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

        if (oCtxData.enabled_cchk == false && G_TreeFlag.bIsCChk == false) {
            oCtxData.enabled_cchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

    }; // end of oAPP.events.ev_tmplWzd1TreeTableParentChkbox

    /************************************************************************
     * Table Ui Create의 Tree Table의 [Child] Check Box 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_tmplWzd1TreeTableChildChkbox = function (oEvent) {

        var oChk = oEvent.getSource(),
            oCtx = oChk.getBindingContext(),
            oCtxData = APPCOMMON.fnGetModelProperty(oCtx.sPath),
            bIsSelect = oEvent.getParameter("selected");

        G_TreeFlag.bIsCChk = bIsSelect;

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

        if (oCtxData.enabled_pchk == false && G_TreeFlag.bIsPChk == false) {
            oCtxData.enabled_pchk = true;
        }

        APPCOMMON.fnSetModelProperty(oCtx.sPath, oCtxData);

    }; // end of oAPP.events.ev_tmplWzd1TreeTableChildChkbox    

    /************************************************************************
     * Table Ui Create의 UI Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1SelectChangeEvent = function (oEvent) {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD1_ID);
        if (oWizard == null) {
            return;
        }

        // wizard popup create button 숨기기        
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, false);

        // Model Info Table의 체크 박스 전체 해제
        var oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
        if (oBindInfoTable) {
            oBindInfoTable.clearSelection();
        }

        // UI Choice DDLB에서 선택한 값을 구한다.
        var oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        // 선택한 값이 없으면 wizard UI의 첫번째 step으로 이동
        if (sSelectedItemKey == "") {

            // 초기화
            oAPP.fn.fnSetWizard1PopupInit();
            return;
        }

        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/TREEVISI`, false);

        // Tree Table을 선택 했을 경우 Tree 전용 컬럼을 활성화 한다.
        if (sSelectedItemKey == "sap.ui.table.TreeTable") {
            APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/TREEVISI`, true);
        }

        // Model 선택 Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD1_STEP2_ID);

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
        oAPP.fn.fnBindPopupOpener("UI Template wizard", "T", oAPP.fn.fnTmplWzd1ModelSelectPopupCallback);

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
        oAPP.fn.fnBindPopupOpener("UI Template wizard", "S", oAPP.fn.fnTmplWzd2ModelSelectPopupCallback);

    }; // end of oAPP.events.ev_tmplWzd2ModelSelectBtn    

    /************************************************************************
     * Wizard 생성 버튼
     ************************************************************************/
    oAPP.events.ev_tmplWzdComplete = function () {

        var sCurrWizardPage = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/TNTMENU/SELKEY`);

        if (typeof sCurrWizardPage !== "string" || sCurrWizardPage == null) {
            return;
        };

        switch (sCurrWizardPage) {
            case "u4aWsTmplWzd1":
                oAPP.events.ev_tmplWzd1Complete();
                break;

            case "u4aWsTmplWzd2":
                oAPP.events.ev_tmplWzd2Complete();
                break;

        }

    }; // end of oAPP.events.ev_tmplWzdComplete

    /************************************************************************
     * Table Ui Create의 Wizard Complete Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd1Complete = function () {

        // Model Table
        var oTable = sap.ui.getCore().byId(C_TMPL_WZD1_MODEL_TABLE_ID);
        if (oTable == null) {
            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {
            parent.showMessage(sap, 10, "E", "라인을 선택하세요.");
            return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            aTableData = oModelData.MODELTABLE1.T_OUTAB,
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
                return;
            }
        } else {

            // POSITION 기준으로 정렬
            aSelectRows = aSelectRows.sort(function (a, b) {
                return a["POSIT"] - b["POSIT"];
            });

        }

        // UI CHOICE가 Tree table 이 아닌경우..

        // 테이블에 바인딩된 모델명을 구한다.
        var oTableModel = APPCOMMON.fnGetModelProperty(C_TMPL_WZD1_MODEL_TABLE);

        // Table Wizard 정보 구성
        var oComplete = {
            uName: oModelData.UICHOICE.T.selectedKey, // Table 명 (sap.m.Table..)
            mName: oTableModel.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        function lf_callback(oReturn) {

            // Busy Dialog를 끈다.
            oAPP.common.fnSetBusyDialog(false);

            if (oReturn.SUBRC == "E") {
                parent.showMessage(sap, 10, "E", oReturn.MSG);
                return;
            }

            parent.showMessage(sap, 10, "S", oReturn.MSG);

            oAPP.events.pressUiTempWizardDialogClose();

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
            return;
        }

        // Model Table에 선택된 라인을 구한다.
        var aSelectIdx = oTable.getSelectedIndices(),
            iSelectIdxLength = aSelectIdx.length;

        if (iSelectIdxLength <= 0) {
            parent.showMessage(sap, 10, "E", "라인을 선택하세요.");
            return;
        }

        // 현재 바인딩 된 모델에서 선택된 라인의 데이터를 수집한다.
        var oModelData = APPCOMMON.fnGetModelProperty(C_TMPL_BIND_ROOT),
            aTableData = oModelData.MODELTABLE2.T_OUTAB,

            aSelectRows = [];

        for (var i = 0; i < iSelectIdxLength; i++) {

            var iIdx = aSelectIdx[i];

            aSelectRows.push(aTableData[iIdx]);

        }

        // POSITION 기준으로 정렬
        aSelectRows = aSelectRows.sort(function (a, b) {
            return a["POSIT"] - b["POSIT"];
        });

        // 테이블에 바인딩된 모델명을 구한다.
        var oTableModel = APPCOMMON.fnGetModelProperty(C_TMPL_WZD2_MODEL_TABLE);

        // Table Wizard 정보 구성
        var oComplete = {
            uName: oModelData.UICHOICE.S.selectedKey, // Table 명 (sap.m.Table..)
            mName: oTableModel.MODEL, // 모델명 (GT_OUTAB..)
            selTab: aSelectRows, // 바인딩된 테이블에서 선택한 Row 데이터
            uiDDLB: oModelData.MASTER.T_UIDDLB // Dropdown Data..
        };

        function lf_callback(oReturn) {
            
            // Busy Dialog를 끈다.
            oAPP.common.fnSetBusyDialog(false);

            if (oReturn.SUBRC == "E") {
                parent.showMessage(sap, 10, "E", oReturn.MSG);
                return;
            }

            parent.showMessage(sap, 10, "S", oReturn.MSG);

            oAPP.events.pressUiTempWizardDialogClose();

        }

        oAPP.fn.designWizardCallback(oComplete, lf_callback);

    }; // end of oAPP.events.ev_tmplWzd2Complete    

    /************************************************************************
     * Forms Ui Create의 UI Choice Select Event
     ************************************************************************/
    oAPP.events.ev_tmplWzd2SelectChangeEvent = function (oEvent) {

        var oWizard = sap.ui.getCore().byId(C_TMPL_WZD2_ID);
        if (oWizard == null) {
            return;
        }

        // wizard popup create button 숨기기        
        APPCOMMON.fnSetModelProperty(`${C_TMPL_BIND_ROOT}/CRBTN_VISI`, false);

        // Model Info Table의 체크 박스 전체 해제
        var oBindInfoTable = sap.ui.getCore().byId(C_TMPL_WZD2_MODEL_TABLE_ID);
        if (oBindInfoTable) {
            oBindInfoTable.clearSelection();
        }

        // UI Choice DDLB에서 선택한 값을 구한다.
        var oSelectedItem = oEvent.getParameter("selectedItem"),
            sSelectedItemKey = oSelectedItem.getProperty("key");

        // 선택한 값이 없으면 wizard UI의 첫번째 step으로 이동
        if (sSelectedItemKey == "") {

            // 초기화
            oAPP.fn.fnSetWizard2PopupInit();
            return;
        }

        // Model 선택 Step으로 이동
        oWizard.setCurrentStep(C_TMPL_WZD2_STEP2_ID);

    }; // end of oAPP.events.ev_tmplWzd2SelectChangeEvent

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

        oAPP.fn.fnSetWizard1PopupInit();
        oAPP.fn.fnSetWizard2PopupInit();

    }; // end of oAPP.events.ev_UiTempWizardAfterClose

    /************************************************************************
     * UI TEMPLATE WIZARD Dialog Tnt Menu Item Select Event
     ************************************************************************/
    oAPP.events.ev_sideNaviItemSelection = function (oEvent) {

        var oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getProperty("key");

        var oNavCon = sap.ui.getCore().byId(C_TMPL_NAVCON_ID);
        if (oNavCon == null) {
            return;
        }

        oNavCon.to(`${sItemKey}--page`);

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

        var oTable = oEvent.getSource(),
            aSelectedIndices = oTable.getSelectedIndices(),
            iIndicesLength = aSelectedIndices.length,
            bIsSelectAll = oEvent.getParameter("selectAll"),
            sUiChioce = APPCOMMON.fnGetModelProperty(`${C_TMPL_BIND_ROOT}/UICHOICE/T/selectedKey`);

        // 전체 선택 해제라면..
        if (iIndicesLength <= 0) {

            // 현재 Parent, Child에 선택된게 없다는 Global Flag
            G_TreeFlag = {
                bIsPChk: false,
                bIsCChk: false,
            };

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

        // Row를 선택 했을 경우.
        if (bIsSelected == true) {

            oRowData.enabled_pchk = bIsSelected;
            oRowData.enabled_cchk = bIsSelected;

            // Parent 전체 정보 중, 이미 선택되어 있는 Parent 가 있을 경우.
            // 나 자신의 Parent를 비활성화 한다.
            if (G_TreeFlag.bIsPChk == true) {
                oRowData.enabled_pchk = false;
            }

            // Child 전체 정보 중, 이미 선택되어 있는 Child 가 있을 경우.
            // 나 자신의 Child를 비활성화 한다.
            if (G_TreeFlag.bIsCChk == true) {
                oRowData.enabled_cchk = false;
            }

            oTable.getModel().refresh();

            return;

        }

        // Row를 선택 해제 했을 경우.
        oRowData.enabled_pchk = bIsSelected;
        oRowData.enabled_cchk = bIsSelected;

        // PARENT가 선택되어 있다면..
        if (oRowData.PARENT == "X") {

            G_TreeFlag.bIsPChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 PARENT를 활성화 한다.
            oAPP.fn.fnSetTmplWzd1_Table_Parent_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

        // CHILD가 선택되어 있다면..        
        if (oRowData.CHILD == "X") {

            G_TreeFlag.bIsCChk = bIsSelected;

            // 활성화 되어있는 Row 중에서 나 자신을 제외한 나머지 CHILD를 활성화 한다.
            oAPP.fn.fnSetTmplWzd1_Table_Child_Enabled_WithoutMe(!bIsSelected, oRowData);

        }

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

})(window, $, oAPP);