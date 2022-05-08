/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : findPopup/index.js
 ************************************************************************/

let oAPP = parent.oAPP;

(function(window, oAPP) {
    "use strict";

    oAPP.settings = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        require = parent.require;

    const
        C_MENU_BIND_PATH = "/FIND",
        C_FIND_MENU1_ID = "M001",
        C_FIND_MENU2_ID = "M002",
        C_FIND_MENU3_ID = "M003",
        C_FIND_MENU4_ID = "M004",
        C_NAVCON_ID = "findNavCon";

    /************************************************************************
     * 모델 데이터 set
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     * @param {Object} oModelData
     * 
     * @param {Boolean} bIsRefresh 
     * model Refresh 유무
     ************************************************************************/
    oAPP.fn.fnSetModelProperty = function(sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of oAPP.common.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.fn.fnGetModelProperty = function(sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function() {

        // Browser Window option
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function() {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.table, sap.ui.layout");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * find 대상 모수 데이터 구하기
     ************************************************************************/
    oAPP.fn.getAttrChangedData = function() {

        return oAPP.attr.aAttrData;

    }; // end of oAPP.fn.getAttrChangedData

    /************************************************************************
     * 서버 이벤트 정보 구하기
     ************************************************************************/
    oAPP.fn.getServerEventList = function() {

        return oAPP.attr.aServEvtData;

    }; // end of oAPP.fn.getServerEventList

    /************************************************************************
     * 22번 테이블 정보를 구한다.
     ************************************************************************/
    oAPP.fn.get0022Data = function() {

        return oAPP.attr.aT_0022;

    }; // end of oAPP.fn.Get0022Data


    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function() {

        var oFind2Data = oAPP.fn.fnGetFindData2();

        var oModelData = {
            SELKEY: C_FIND_MENU1_ID,
            MENULIST: oAPP.fn.fnGetFindMenuList(), // find의 메뉴 리스트       
            FIND1TABLE: oAPP.fn.fnGetFindData1(),
            FIND2LEFT: oFind2Data.LEFT,
            FIND2RIGHT: oFind2Data.RIGHT,
            FIND3TABLE: oAPP.fn.fnGetFindData3(),
            FIND4TABLE: oAPP.fn.fnGetFindData4(),
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            FIND: oModelData
        });

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function() {

        var oTntPage = oAPP.fn.fnGetFindTntToolPage();

        var oApp = new sap.m.App({
                autoFocus: false,
            }),
            oPage = new sap.m.Page({

                // properties
                showHeader: false,
                enableScrolling: false,

                // Aggregations
                customHeader: new sap.m.Toolbar({
                    content: [

                        new sap.m.ToolbarSpacer(),

                        new sap.ui.core.Icon({
                            src: "sap-icon://sys-find"
                        }),

                        new sap.m.Title({
                            text: "Find"
                        }),

                        new sap.m.ToolbarSpacer(),

                    ]
                }),
                content: [
                    oTntPage
                ]

            }).addStyleClass("sapUiContentPadding");

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering   

    /**************************************************************************
     *  Find의 메인 페이지 (tnt ToolPage)
     **************************************************************************/
    oAPP.fn.fnGetFindTntToolPage = function() {

        var oPage1 = oAPP.fn.fnGetFindPage1(), // "UI Where to Use the Event"
            oPage2 = oAPP.fn.fnGetFindPage2(), // "Model Binding Usage For UI"
            oPage3 = oAPP.fn.fnGetFindPage3(), // "CSS Style Class Where to Use"
            oPage4 = oAPP.fn.fnGetFindPage4(); // "Event JS Where to Use"

        return new sap.tnt.ToolPage({
            sideContent: new sap.tnt.SideNavigation({
                item: new sap.tnt.NavigationList({
                    selectedKey: `{${C_MENU_BIND_PATH}/SELKEY}`,
                    itemSelect: oAPP.events.ev_sideNaviItemSelection,
                    items: {
                        path: `${C_MENU_BIND_PATH}/MENULIST`,
                        template: new sap.tnt.NavigationListItem({
                            key: "{key}",
                            text: "{text}",
                        })
                    }
                })
            }),

            mainContents: new sap.m.NavContainer(C_NAVCON_ID, {
                autoFocus: false,
                pages: [
                    oPage1,
                    oPage2,
                    oPage3,
                    oPage4
                ],

                afterNavigate: oAPP.events.ev_findNavConAfterNav

            })

        });

    }; // end of oAPP.fn.fnGetFindTntToolPage

    /**************************************************************************
     *  Find의 메뉴 리스트
     **************************************************************************/
    oAPP.fn.fnGetFindMenuList = function() {

        return [{
                key: C_FIND_MENU1_ID,
                text: "UI Where to Use the Event"
            },
            {
                key: C_FIND_MENU2_ID,
                text: "Model Binding Usage For UI"
            },
            {
                key: C_FIND_MENU3_ID,
                text: "CSS Style Class Where to Use"
            },
            {
                key: C_FIND_MENU4_ID,
                text: "Event JS Where to Use"
            },
        ];

    }; // end of oAPP.fn.fnGetFindMenuList

    /**************************************************************************
     *  Find의 "UI Where to Use the Event" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage1 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        return new sap.m.Page(`${C_FIND_MENU1_ID}--page`, {
            showHeader: true,
            title: "UI Where to Use the Event",
            titleAlignment: sap.m.TitleAlignment.Center,
            content: [
                new sap.m.Table({

                    // properties
                    fixedLayout: false,
                    alternateRowColors: true,
                    autoPopinMode: false,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 50,
                    sticky: [
                        EnumSticky.ColumnHeaders
                    ],

                    // Aggregations
                    columns: [

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "Event ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: true,
                            minScreenWidth: "Desktop",
                            // popinDisplay: sap.m.PopinDisplay.Inline,
                            header: new sap.m.Label({
                                text: "Event Text",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "Event Target Properties",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI OBJ ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                    ],

                    items: {
                        path: `${C_MENU_BIND_PATH}/FIND1TABLE`,
                        template: new sap.m.ColumnListItem({
                            cells: [

                                new sap.m.Link({
                                    text: "{UIATV}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find_Controller
                                }),

                                new sap.m.Text({
                                    text: "{EVTXT}"
                                }),

                                new sap.m.Link({
                                    text: "{UIATT}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text({
                                    text: "{OBJID}"
                                }),


                            ]
                        })
                    }

                })

            ]
        })
        // .addStyleClass("sapUiContentPadding");

    }; // end of oAPP.fn.fnGetFindPage1

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage2 = function() {

        var oLeftPage = oAPP.fn.fnGetFindPage2_LeftPage(),
            oRightPage = oAPP.fn.fnGetFindPage2_RightPage();

        return new sap.m.Page(`${C_FIND_MENU2_ID}--page`, {

            // properties
            showHeader: true,
            title: "Model Binding Usage For UI",
            titleAlignment: sap.m.TitleAlignment.Center,

            // Aggregations
            content: [

                new sap.ui.layout.ResponsiveSplitter({
                    height: "100%",
                    width: "100%",
                    rootPaneContainer: new sap.ui.layout.PaneContainer({
                        panes: [
                            new sap.ui.layout.SplitPane({
                                content: oLeftPage
                            }),

                            new sap.ui.layout.SplitPane({
                                content: oRightPage
                            }),
                        ]

                    })

                }),

            ]

        });

    }; // end of oAPP.fn.fnGetFindPage2

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 왼쪽영역
     **************************************************************************/
    oAPP.fn.fnGetFindPage2_LeftPage = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        return new sap.m.Page(`${C_FIND_MENU2_ID}--leftPage`, {
            showHeader: false,
            content: [

                new sap.m.Table({

                    // properties
                    fixedLayout: false,
                    alternateRowColors: true,
                    autoPopinMode: false,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 50,
                    sticky: [
                        EnumSticky.ColumnHeaders,
                        EnumSticky.HeaderToolbar
                    ],

                    // Aggregations
                    columns: [

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI Attribute ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: true,
                            minScreenWidth: "10000px",
                            header: new sap.m.Label({
                                text: "Model full Path",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "Binding Field",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "Data Type",
                                design: EnumLabelDesignBold
                            }),
                        }),

                    ],

                    headerToolbar: new sap.m.Toolbar({
                        content: [
                            new sap.ui.core.Icon({
                                src: "sap-icon://list"
                            }),
                            new sap.m.Text({
                                text: "Properties Usage Bind List"
                            }).addStyleClass("sapUiTinyMarginBegin")
                        ]
                    }),

                    items: {
                        path: `${C_MENU_BIND_PATH}/FIND2LEFT`,
                        template: new sap.m.ColumnListItem({
                            cells: [

                                new sap.m.Link({
                                    text: "{OBJID}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text({
                                    text: "{UIATT}"
                                }),

                                new sap.m.Link({
                                    text: "{UIATV}",
                                    emphasized: true,
                                    // press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text().bindProperty("text", {
                                    parts: [
                                        "UIATV"
                                    ],
                                    formatter: function(UIATV) {

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

                                new sap.m.Text({
                                    text: "{UIADT}"
                                }),

                            ]
                        })
                    }

                })

            ]

        });

    }; // end of oAPP.fn.fnGetFindPage2_LeftPage

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 오른쪽영역
     **************************************************************************/
    oAPP.fn.fnGetFindPage2_RightPage = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        return new sap.m.Page(`${C_FIND_MENU2_ID}--rightPage`, {
            showHeader: false,
            content: [

                new sap.m.Table({

                    // properties
                    fixedLayout: false,
                    alternateRowColors: true,
                    autoPopinMode: false,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 50,
                    sticky: [
                        EnumSticky.ColumnHeaders
                    ],

                    // Aggregations
                    columns: [

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: true,
                            minScreenWidth: "Desktop",
                            header: new sap.m.Label({
                                text: "Aggregations ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: true,
                            minScreenWidth: "Desktop",
                            header: new sap.m.Label({
                                text: "Binding Model",
                                design: EnumLabelDesignBold
                            }),
                        }),

                    ],

                    headerToolbar: new sap.m.Toolbar({
                        content: [

                            new sap.ui.core.Icon({
                                src: "sap-icon://list"
                            }),
                            new sap.m.Text({
                                text: "Aggregations Usage Bind Models"
                            }).addStyleClass("sapUiTinyMarginBegin")
                        ]
                    }),

                    items: {
                        path: `${C_MENU_BIND_PATH}/FIND2RIGHT`,
                        template: new sap.m.ColumnListItem({
                            cells: [

                                new sap.m.Link({
                                    text: "{OBJID}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text({
                                    text: "{UIATT}"
                                }),

                                new sap.m.Link({
                                    text: "{UIATV}",
                                    emphasized: true,
                                    // press: oAPP.events.ev_press_Link_Find_Controller
                                }),

                            ]
                        })
                    }

                })

            ]

        });

    }; // end of oAPP.fn.fnGetFindPage2_RightPage

    /**************************************************************************
     *  Find의 "CSS Style Class Where to Use" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage3 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        return new sap.m.Page(`${C_FIND_MENU3_ID}--page`, {

            // properties
            showHeader: true,
            title: "CSS Style Class Where to Use",
            titleAlignment: sap.m.TitleAlignment.Center,

            content: [

                new sap.m.Table({

                    // properties                   
                    fixedLayout: false,
                    alternateRowColors: true,
                    autoPopinMode: false,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 50,
                    sticky: [
                        EnumSticky.ColumnHeaders
                    ],

                    // Aggregations
                    columns: [

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI OBJ ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "Style Class Name",
                                design: EnumLabelDesignBold
                            }),
                        }),

                    ],

                    items: {
                        path: `${C_MENU_BIND_PATH}/FIND3TABLE`,
                        template: new sap.m.ColumnListItem({
                            cells: [

                                new sap.m.Link({
                                    text: "{OBJID}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text({
                                    text: "{UIATV}"
                                }),

                            ]
                        })
                    }

                })
            ]

        });

    }; // end of oAPP.fn.fnGetFindPage3

    /**************************************************************************
     *  Find의 "Event JS Where to Use" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage4 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        return new sap.m.Page(`${C_FIND_MENU4_ID}--page`, {

            // properties
            showHeader: true,
            title: "Event JS Where to Use",
            titleAlignment: sap.m.TitleAlignment.Center,

            content: [

                new sap.m.Table({

                    // properties                    
                    fixedLayout: false,
                    alternateRowColors: true,
                    autoPopinMode: false,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 50,
                    sticky: [
                        EnumSticky.ColumnHeaders
                    ],

                    // Aggregations
                    columns: [

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI OBJ ID",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI Event Name",
                                design: EnumLabelDesignBold
                            }),
                        }),

                        new sap.m.Column({
                            demandPopin: false,
                            header: new sap.m.Label({
                                text: "UI Class",
                                design: EnumLabelDesignBold
                            }),
                        }),

                    ],

                    items: {
                        path: `${C_MENU_BIND_PATH}/FIND4TABLE`,
                        template: new sap.m.ColumnListItem({
                            cells: [

                                new sap.m.Link({
                                    text: "{OBJID}",
                                    emphasized: true,
                                    press: oAPP.events.ev_press_Link_Find
                                }),

                                new sap.m.Text({
                                    text: "{UIATT}"
                                }),

                                new sap.m.Text({
                                    text: "{LIBNM}"
                                }),

                            ]
                        })
                    }

                })
            ]

        });

    }; // end of oAPP.fn.fnGetFindPage4


    /**************************************************************************
     *  Find의 "UI Where to Use the Event" Data
     **************************************************************************/
    oAPP.fn.fnGetFindData1 = function() {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return [];
        }

        // Attribute 정보에서 서버 이벤트 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "2" && elem.UIATV != ""),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return [];
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

        return aFindData;

        // oAPP.fn.fnSetModelProperty(`${C_MENU_BIND_PATH}/CHOICE1TABLE`, aFindData);

    }; // end of oAPP.events.ev_findPopupChoice1AfterOpen

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 왼쪽영역 데이터
     **************************************************************************/
    oAPP.fn.fnGetFindData2 = function() {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return;
        }

        var oReturnData = {
            LEFT: [],
            RIGHT: []
        };

        // Properties Usage Bind List 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "1" && elem.ISBND == "X"),
            iDataLength = aFindData.length;

        if (iDataLength > 0) {
            oReturnData.LEFT = aFindData;
            // APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE2LEFT`, aFindData);
        }

        // Aggregations Usage Bind Model 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATY == "3"),
            iDataLength = aFindData.length;

        if (iDataLength > 0) {
            oReturnData.RIGHT = aFindData;
            // APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE2RIGHT`, aFindData);
        }

        return oReturnData;

    }; // end of oAPP.fn.fnGetFindData2

    /**************************************************************************
     *  Find의 "CSS Style Class Where to Use" 페이지 데이터
     **************************************************************************/
    oAPP.fn.fnGetFindData3 = function() {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return [];
        }

        // Attribute 정보에서 StyleClass 정보만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.UIATT == "styleClass"),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return [];
        }

        return aFindData;

    }; // end of oAPP.fn.fnGetFindData3


    /**************************************************************************
     *  Find의 "Event JS Where to Use" 페이지 데이터
     **************************************************************************/
    oAPP.fn.fnGetFindData4 = function() {

        // Attribute 정보를 구한다.
        var aAttrData = oAPP.fn.getAttrChangedData(),
            iAttrLength = aAttrData.length;

        if (iAttrLength <= 0) {
            return [];
        }

        // 클라이언트 스크립트가 있는 UI만 추출한다.
        var aFindData = aAttrData.filter(elem => elem.ADDSC == "JS" && elem.UIATY == "2"),
            iDataLength = aFindData.length;

        if (iDataLength <= 0) {
            return [];
        }

        // 22번에서 UIOBK를 가지고 UI Class 명을 매핑한다.
        var a0022 = oAPP.fn.get0022Data(),
            // a0022 = oAPP.DATA.LIB.T_0022,
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

        return aFindData;

        // APPCOMMON.fnSetModelProperty(`${C_BIND_ROOT_PATH}/CHOICE4TABLE`, aFindData);

    }; // end of oAPP.fn.fnGetFindData4


    /**************************************************************************
     *  Find의 TNT 메뉴 선택 시 NavContainer의 afterNav events.
     **************************************************************************/
    oAPP.events.ev_findNavConAfterNav = function(oEvent) {

        var oMovePage = oEvent.getParameter("to"),
            toId = oEvent.getParameter("toId");

        if (oMovePage == null) {
            return;
        }

        if (oMovePage instanceof sap.m.Page == false) {
            return;
        }

        // 이동할 페이지의 스크롤 Object를 구한다.
        var _oScroller = oMovePage._oScroller;

        // 이동할 페이지의 스크롤을 최상단으로 옮긴다.
        _oScroller.scrollTo(0, 0);

        // Splitter가 있는 페이지 일 경우.
        if (toId != "M002--page") {
            return;
        }

        // Splitter의 왼쪽, 오른쪽 페이지
        var oLeftPage = sap.ui.getCore().byId(`${C_FIND_MENU2_ID}--leftPage`),
            oRightPage = sap.ui.getCore().byId(`${C_FIND_MENU2_ID}--rightPage`);

        if (oLeftPage == null || oRightPage == null) {
            return;
        }

        // Splitter의 왼쪽, 오른쪽 페이지 각각 스크롤을 최상단으로 옮긴다.
        var _oScrollerLeft = oLeftPage._oScroller,
            _oScrollerRight = oRightPage._oScroller;

        if (_oScrollerLeft != null) {
            _oScrollerLeft.scrollTo(0, 0);
        }

        if (_oScrollerRight != null) {
            _oScrollerRight.scrollTo(0, 0);
        }

    }; // end of oAPP.events.ev_findNavConAfterNav

    /**************************************************************************
     *  Find의 TNT 메뉴 선택 이벤트
     **************************************************************************/
    oAPP.events.ev_sideNaviItemSelection = function(oEvent) {

        var oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getProperty("key");

        var oNavCon = sap.ui.getCore().byId(C_NAVCON_ID);
        if (oNavCon == null) {
            return;
        }

        oNavCon.to(`${sItemKey}--page`);

    }; // end of oAPP.events.ev_sideNaviItemSelection

    /**************************************************************************
     *  Find의 링크 이벤트들..
     **************************************************************************/
    oAPP.events.ev_press_Link_Find = function(oEvent) {

        var oCtx = oEvent.getSource().getBindingContext();
        if (oCtx == null) {
            return;
        }

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences(),
            sBrowserKey = oWebPref.browserkey,
            IPCRENDERER = oAPP.IPCRENDERER;

        var sBindPath = oCtx.sPath,
            oBindData = oAPP.fn.fnGetModelProperty(sBindPath);

        IPCRENDERER.send(`${sBrowserKey}--find`, oBindData);

    }; // end of oAPP.events.ev_press_Find1_EventID

    /**************************************************************************
     *  Find의 링크 이벤트인데 Controller 실행 할 경우.
     **************************************************************************/
    oAPP.events.ev_press_Link_Find_Controller = function(oEvent) {

        var oCtx = oEvent.getSource().getBindingContext();
        if (oCtx == null) {
            return;
        }

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences(),
            sBrowserKey = oWebPref.browserkey,
            IPCRENDERER = oAPP.IPCRENDERER;

        var sBindPath = oCtx.sPath,
            oBindData = oAPP.fn.fnGetModelProperty(sBindPath);

        IPCRENDERER.send(`${sBrowserKey}--find--controller`, oBindData);

    }; // end of oAPP.events.ev_press_Link_Find_Controller


    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function() {

        sap.ui.getCore().attachInit(function() {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            oAPP.setBusy('');

            setTimeout(() => {
                $('#content').fadeIn(1000, 'linear');
            }, 100);

        });

    };

})(window, oAPP);