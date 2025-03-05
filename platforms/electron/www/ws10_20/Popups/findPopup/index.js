/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : findPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/
let zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function(window, oAPP) {
    "use strict";

    oAPP.settings = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        PATHINFO = parent.PATHINFO,
        require = parent.require;

    const
        APPCOMMON = oAPP.common,
        C_MENU_BIND_PATH = "/FIND",
        C_FIND_MENU1_ID = "M001",
        C_FIND_MENU2_ID = "M002",
        C_FIND_MENU3_ID = "M003",
        C_FIND_MENU4_ID = "M004",
        C_NAVCON_ID = "findNavCon";




    /*************************************************************
     * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
     *************************************************************/
    function _onIpcMain_if_p13n_themeChange(){ 

        let oThemeInfo = oAPP.fn.getThemeInfo();
        if(!oThemeInfo){
            return;
        }

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        let oBrowserWindow = oAPP.REMOTE.getCurrentWindow();
            oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        sap.ui.getCore().applyTheme(oThemeInfo.THEME);

    } // end of _onIpcMain_if_p13n_themeChange


    /*************************************************************
     * @function - IPC Event 등록
     *************************************************************/
    function _attachIpcEvents(){

        let oUserInfo = parent.process.USERINFO;
        let sSysID = oUserInfo.SYSID;

        // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
        oAPP.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

    } // end of _attachIpcEvents


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

    }; // end of APPCOMMON.fnSetModelProperty

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
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

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
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            // oThemeInfo = oAPP.attr.oThemeInfo,
            oThemeInfo = oAPP.fn.getThemeInfo(),
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.table, sap.ui.layout");
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

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

            // 각 메뉴별 서치필드 구조
            // 구조이름은 메뉴 ID와 동일하게 할것!!
            // 예) 메뉴 ID가 M999 일경우
            //  => SHFLDS: { 
            //       M999: { 
            //          SHFLD1: ""
            //       } 
            //     }
            SHFLDS: {
                M001: {
                    SHFLD1: "",
                },
                M002: {
                    SHFLD1: "",
                    SHFLD2: "",
                },
                M003: {
                    SHFLD1: "",
                },
                M004: {
                    SHFLD1: "",
                },
            }
        };

        var oCoreModel = sap.ui.getCore().getModel(),
            oJsonModel = new sap.ui.model.json.JSONModel(),
            oData = {
                FIND: oModelData
            };

        if (oCoreModel == null) {

            oJsonModel.setData(oData);

            sap.ui.getCore().setModel(oJsonModel);           

            return;

        }

        oCoreModel.setData(oData);

        oCoreModel.refresh();

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
                showHeader: true,
                enableScrolling: false,

                // Aggregations
                customHeader: new sap.m.Bar({

                    contentMiddle: [

                        new sap.ui.core.Icon({
                            src: "sap-icon://sys-find"
                        }),

                        new sap.m.Title({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D02"), // Find
                        }),

                    ],

                    contentRight: [

                        new sap.m.Button({
                            icon: "sap-icon://refresh",
                            press: oAPP.fn.fnFindDataRefresh
                        })

                    ]

                }),
                content: [
                    oTntPage
                ]

            }).addStyleClass("sapUiContentPadding");

        oApp.addPage(oPage);

        oApp.placeAt("content");

        let oDelegate = {
            onAfterRendering : function(){

                oApp.removeEventDelegate(oDelegate);

                oAPP.CURRWIN.show();

                oAPP.WSUTIL.setBrowserOpacity(oAPP.CURRWIN); 

                oAPP.fn.setBusyIndicator("");

                // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                parent.oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

            }
        };

        oApp.addEventDelegate(oDelegate);

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
                    // .bindProperty("selectedKey", {
                    //     parts: [
                    //         `${C_MENU_BIND_PATH}/SELKEY`
                    //     ],
                    //     formatter: function(selectedKey) {

                    //         if (selectedKey == null) {
                    //             return;
                    //         }

                    //         this.setSelectedKey(selectedKey);

                    //         var oItem = this.getSelectedItem(),
                    //             oEvent = {
                    //                 key: selectedKey,
                    //                 item: oItem
                    //             }

                    //         this.fireItemSelect(oEvent);

                    //         return selectedKey;

                    //     }

                    // })
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
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D03"), // UI Where to Use the Event
            },
            {
                key: C_FIND_MENU2_ID,
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D04"), // Model Binding Usage For UI
            },
            {
                key: C_FIND_MENU3_ID,
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D05"), // CSS Style Class Where to Use
            },
            {
                key: C_FIND_MENU4_ID,
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D06"), // Event JS Where to Use
            },
        ];

    }; // end of oAPP.fn.fnGetFindMenuList

    /**************************************************************************
     *  Find의 "UI Where to Use the Event" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage1 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        let PAGE1 = new sap.m.Page(`${C_FIND_MENU1_ID}--page`, {
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D03"), // UI Where to Use the Event
            titleAlignment: sap.m.TitleAlignment.Center,      
        });

        let TABLE1 = new sap.m.Table({

            // properties
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: false,
            growing: true,
            growingScrollToLoad: true,
            growingThreshold: 50,
            sticky: [
                EnumSticky.HeaderToolbar,
                EnumSticky.ColumnHeaders
            ],

            // Aggregations
            columns: [

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C49"), // Event ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Desktop",
                    // popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C52"), // Event Text
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C50"), // Event Target Properties
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C51"), // UI OBJ ID
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

        });


        PAGE1.addContent(TABLE1);

        /************************************************
         * 테이블 헤더 툴바 영역
         ************************************************/
        let TOOLBAR1 = new sap.m.Toolbar();        
        TABLE1.setHeaderToolbar(TOOLBAR1);       

        let SEARCHFIELD1 = new sap.m.SearchField(`${C_FIND_MENU1_ID}--SHFLD1`, {
            width: "300px",
            value: `{${C_MENU_BIND_PATH}/SHFLDS/M001/SHFLD1}`,
            change: function(oEvent){

                oAPP.fn.fnFindPage1Filter(oEvent);

            },
        });

        TOOLBAR1.addContent(SEARCHFIELD1);

        SEARCHFIELD1.data("table", TABLE1);

        return PAGE1;

    }; // end of oAPP.fn.fnGetFindPage1


    /**************************************************************************
     *  Find의 "UI Where to Use the Event" 페이지
     * 
     * 테이블 필터
     **************************************************************************/
    oAPP.fn.fnFindPage1Filter = function(oEvent){

        let oSearchField = oEvent.getSource();

        let oTable = oSearchField.data("table");
        if(!oTable){
            return;
        }

        let oBindInfo = oTable.getBinding("items");
        if(!oBindInfo){
            return;
        }                                                                 

        // let sValue = oEvent.getSource().getValue();

        let sValue = oEvent.getParameter("value") || "";

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(sValue === ""){
            oBindInfo.filter();
            return;
        }      

        let aFilter = [];

        aFilter.push(new sap.ui.model.Filter({path:"UIATV", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"EVTXT", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATT", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:"Contains", value1:sValue}));                     
        
        // let sOper = "NotContains";

        // aFilter.push(new sap.ui.model.Filter({path:"UIATV", operator:sOper, value1:sValue}));
        // aFilter.push(new sap.ui.model.Filter({path:"EVTXT", operator:sOper, value1:sValue}));
        // aFilter.push(new sap.ui.model.Filter({path:"UIATT", operator:sOper, value1:sValue}));
        // aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:sOper, value1:sValue})); 

        oBindInfo.filter([new sap.ui.model.Filter(aFilter, false)]);

    }// end of oAPP.fn.fnFindPage1Filter

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage2 = function() {

        var oLeftPage = oAPP.fn.fnGetFindPage2_LeftPage(),
            oRightPage = oAPP.fn.fnGetFindPage2_RightPage();

        return new sap.m.Page(`${C_FIND_MENU2_ID}--page`, {

            // properties
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D04"), // Model Binding Usage For UI
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

        let oPage = new sap.m.Page(`${C_FIND_MENU2_ID}--leftPage`, {
            showHeader: false,
        });

        let oTable = new sap.m.Table({

            // properties
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: false,
            growing: true,
            growingScrollToLoad: true,
            growingThreshold: 50,
            sticky: [
                EnumSticky.HeaderToolbar,
                EnumSticky.ColumnHeaders
            ],

            // Aggregations
            columns: [

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C53"), // UI ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C54"), // UI Attribute ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "10000px",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C57"), // Model full Path
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C55"), // Binding Field
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C56"), // Data Type
                        design: EnumLabelDesignBold
                    }),
                }),

            ],

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

        });
        oPage.addContent(oTable);

        /************************************************
         * 테이블 헤더 툴바 영역
         ************************************************/
        let oHeaderToolbar = new sap.m.Toolbar();
        oTable.setHeaderToolbar(oHeaderToolbar);

        let ICON1 = new sap.ui.core.Icon({
            src: "sap-icon://list"
        });
        oHeaderToolbar.addContent(ICON1);

        let TEXT1 = new sap.m.Text({
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D07"), // Properties Usage Bind List
        }).addStyleClass("sapUiTinyMarginBegin");
        oHeaderToolbar.addContent(TEXT1);

        oHeaderToolbar.addContent(new sap.m.ToolbarSpacer());

        let SEARCHFIELD1 = new sap.m.SearchField(`${C_FIND_MENU2_ID}--SHFLD1`, {
            width: "300px",
            value: `{${C_MENU_BIND_PATH}/SHFLDS/M002/SHFLD1}`,
            change: function(oEvent){

                oAPP.fn.fnFindPage2_LeftPageFilter(oEvent);

            }
        });
        oHeaderToolbar.addContent(SEARCHFIELD1);

        SEARCHFIELD1.data("table", oTable);

        return oPage;

    }; // end of oAPP.fn.fnGetFindPage2_LeftPage

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 왼쪽영역
     * 
     *  테이블 필터
     **************************************************************************/
    oAPP.fn.fnFindPage2_LeftPageFilter = function(oEvent){

        let oSearchField = oEvent.getSource();

        let oTable = oSearchField.data("table");
        if(!oTable){
            return;
        }

        let oBindInfo = oTable.getBinding("items");
        if(!oBindInfo){
            return;
        }                                                                 

        let sValue = oEvent.getSource().getValue();

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(sValue === ""){
            oBindInfo.filter();
            return;
        }      

        let aFilter = [];

        aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATT", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATV", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIADT", operator:"Contains", value1:sValue}));                     

        oBindInfo.filter([new sap.ui.model.Filter(aFilter, false)]);


    }; // end of oAPP.fn.fnFindPage2_LeftPageFilter

    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 오른쪽영역
     **************************************************************************/
    oAPP.fn.fnGetFindPage2_RightPage = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        let PAGE1 = new sap.m.Page(`${C_FIND_MENU2_ID}--rightPage`, {
            showHeader: false,  
        });

        let TABLE1 = new sap.m.Table({

            // properties
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: false,
            growing: true,
            growingScrollToLoad: true,
            growingThreshold: 50,
            sticky: [
                EnumSticky.HeaderToolbar,
                EnumSticky.ColumnHeaders
            ],

            // Aggregations
            columns: [

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C53"), // UI ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Desktop",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C58"), // Aggregations ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Desktop",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C59"), // Binding Model
                        design: EnumLabelDesignBold
                    }),
                }),

            ],

            // headerToolbar: new sap.m.Toolbar({
            //     content: [

            //         new sap.ui.core.Icon({
            //             src: "sap-icon://list"
            //         }),
            //         new sap.m.Text({
            //             text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D08"), // Aggregations Usage Bind Models
            //         }).addStyleClass("sapUiTinyMarginBegin")
            //     ]
            // }),

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

        });
        PAGE1.addContent(TABLE1);


        /************************************************
         * 테이블 헤더 툴바 영역
         ************************************************/
        let TOOLBAR1 = new sap.m.Toolbar();        
        TABLE1.setHeaderToolbar(TOOLBAR1);

        let ICON1 = new sap.ui.core.Icon({
            src: "sap-icon://list"
        });
        TOOLBAR1.addContent(ICON1);

        let TEXT1 = new sap.m.Text({
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D08"), // Aggregations Usage Bind Models
        }).addStyleClass("sapUiTinyMarginBegin")
        TOOLBAR1.addContent(TEXT1);

        TOOLBAR1.addContent(new sap.m.ToolbarSpacer());

        let SEARCHFIELD1 = new sap.m.SearchField(`${C_FIND_MENU2_ID}--SHFLD2`,{
            width: "300px",
            value: `{${C_MENU_BIND_PATH}/SHFLDS/M002/SHFLD2}`,
            change: function(oEvent){

                oAPP.fn.fnFindPage2_RightPageFilter(oEvent);

            }
        });
        TOOLBAR1.addContent(SEARCHFIELD1);

        SEARCHFIELD1.data("table", TABLE1);

        return PAGE1;

    }; // end of oAPP.fn.fnGetFindPage2_RightPage


    /**************************************************************************
     *  Find의 "Model Binding Usage For UI" 페이지의 Split 중 오른쪽영역
     * 
     *  테이블 필터
     **************************************************************************/
    oAPP.fn.fnFindPage2_RightPageFilter = function(oEvent){

        let oSearchField = oEvent.getSource();

        let oTable = oSearchField.data("table");
        if(!oTable){
            return;
        }

        let oBindInfo = oTable.getBinding("items");
        if(!oBindInfo){
            return;
        }                                                                 

        let sValue = oEvent.getSource().getValue();

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(sValue === ""){
            oBindInfo.filter();
            return;
        }      

        let aFilter = [];

        aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATT", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATV", operator:"Contains", value1:sValue}));                  

        oBindInfo.filter([new sap.ui.model.Filter(aFilter, false)]);

    }; // end of oAPP.fn.fnFindPage2_RightPageFilter

    /**************************************************************************
     *  Find의 "CSS Style Class Where to Use" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage3 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        let PAGE1 = new sap.m.Page(`${C_FIND_MENU3_ID}--page`, {

            // properties
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D05"), // CSS Style Class Where to Use
            titleAlignment: sap.m.TitleAlignment.Center,

        });

        let TABLE1 = new sap.m.Table({

            // properties                   
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: false,
            growing: true,
            growingScrollToLoad: true,
            growingThreshold: 50,
            sticky: [
                EnumSticky.HeaderToolbar,
                EnumSticky.ColumnHeaders
            ],

            // Aggregations
            columns: [

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C51"), // UI OBJ ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C60"), // Style Class Name
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

        });
        PAGE1.addContent(TABLE1);


        /************************************************
         * 테이블 헤더 툴바 영역
         ************************************************/
        let TOOLBAR1 = new sap.m.Toolbar();        
        TABLE1.setHeaderToolbar(TOOLBAR1);       

        let SEARCHFIELD1 = new sap.m.SearchField(`${C_FIND_MENU3_ID}--SHFLD1`,{
            width: "300px",     
            value: `{${C_MENU_BIND_PATH}/SHFLDS/M003/SHFLD1}`,               
            change: function(oEvent){

                oAPP.fn.fnFindPage3Filter(oEvent);

            }
        });
        TOOLBAR1.addContent(SEARCHFIELD1);

        SEARCHFIELD1.data("table", TABLE1);

        return PAGE1;

    }; // end of oAPP.fn.fnGetFindPage3


    /**************************************************************************
     *  Find의 "CSS Style Class Where to Use" 페이지
     * 
     * 테이블 필터
     **************************************************************************/
    oAPP.fn.fnFindPage3Filter = function(oEvent) {

        let oSearchField = oEvent.getSource();

        let oTable = oSearchField.data("table");
        if(!oTable){
            return;
        }

        let oBindInfo = oTable.getBinding("items");
        if(!oBindInfo){
            return;
        }                                                                 

        let sValue = oEvent.getSource().getValue();

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(sValue === ""){
            oBindInfo.filter();
            return;
        }      

        let aFilter = [];

        aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATV", operator:"Contains", value1:sValue}));                    

        oBindInfo.filter([new sap.ui.model.Filter(aFilter, false)]);

    }; // end of oAPP.fn.fnFindPage3Filter


    /**************************************************************************
     *  Find의 "Event JS Where to Use" 페이지
     **************************************************************************/
    oAPP.fn.fnGetFindPage4 = function() {

        var EnumLabelDesignBold = sap.m.LabelDesign.Bold,
            EnumSticky = sap.m.Sticky;

        let PAGE1 = new sap.m.Page(`${C_FIND_MENU4_ID}--page`, {

            // properties
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D06"), // Event JS Where to Use
            titleAlignment: sap.m.TitleAlignment.Center,

        });

        let TABLE1 = new sap.m.Table({

            // properties                    
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: false,
            growing: true,
            growingScrollToLoad: true,
            growingThreshold: 50,
            sticky: [
                EnumSticky.HeaderToolbar,
                EnumSticky.ColumnHeaders
            ],

            // Aggregations
            columns: [

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C51"), // UI OBJ ID
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C61"), // UI Event Name
                        design: EnumLabelDesignBold
                    }),
                }),

                new sap.m.Column({
                    demandPopin: false,
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C62"), // UI Class
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

        });
        PAGE1.addContent(TABLE1);

        /************************************************
         * 테이블 헤더 툴바 영역
         ************************************************/
        let TOOLBAR1 = new sap.m.Toolbar();        
        TABLE1.setHeaderToolbar(TOOLBAR1);       

        let SEARCHFIELD1 = new sap.m.SearchField(`${C_FIND_MENU4_ID}--SHFLD1`,{
            width: "300px", 
            value: `{${C_MENU_BIND_PATH}/SHFLDS/M004/SHFLD1}`,                   
            change: function(oEvent){

                oAPP.fn.fnFindPage4Filter(oEvent);

            }
        });
        TOOLBAR1.addContent(SEARCHFIELD1);

        SEARCHFIELD1.data("table", TABLE1);

        return PAGE1;

    }; // end of oAPP.fn.fnGetFindPage4


    /**************************************************************************
     *  Find의 "CSS Style Class Where to Use" 페이지
     * 
     *  테이블 필터
     **************************************************************************/
    oAPP.fn.fnFindPage4Filter = function(oEvent){

        let oSearchField = oEvent.getSource();

        let oTable = oSearchField.data("table");
        if(!oTable){
            return;
        }

        let oBindInfo = oTable.getBinding("items");
        if(!oBindInfo){
            return;
        }                                                                 

        let sValue = oEvent.getSource().getValue();

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(sValue === ""){
            oBindInfo.filter();
            return;
        }      

        let aFilter = [];

        aFilter.push(new sap.ui.model.Filter({path:"OBJID", operator:"Contains", value1:sValue}));
        aFilter.push(new sap.ui.model.Filter({path:"UIATT", operator:"Contains", value1:sValue}));                    
        aFilter.push(new sap.ui.model.Filter({path:"LIBNM", operator:"Contains", value1:sValue}));                    

        oBindInfo.filter([new sap.ui.model.Filter(aFilter, false)]);

    }; // end of oAPP.fn.fnFindPage4Filter


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

    // Find 정보 갱신
    oAPP.fn.fnFindDataRefresh = () => {

        oAPP.fn.setBusyIndicator('X');

        oAPP.IPCRENDERER.off(`${oAPP.BROWSKEY}--find--data--refresh--callback`, oAPP.fn.fnIpcRendererFind_data_refresh_callback);

        oAPP.IPCRENDERER.on(`${oAPP.BROWSKEY}--find--data--refresh--callback`, oAPP.fn.fnIpcRendererFind_data_refresh_callback);

        oAPP.IPCRENDERER.send(`${oAPP.BROWSKEY}--find--data--refresh`);

    }; // end of oAPP.fn.fnFindDataRefresh

    oAPP.fn.fnIpcRendererFind_data_refresh_callback = (event, oInfo) => {

        oAPP.IPCRENDERER.off(`${oAPP.BROWSKEY}--find--data--refresh--callback`, oAPP.fn.fnIpcRendererFind_data_refresh_callback);

        oAPP.fn.setBusyIndicator('');

        oAPP.attr.oUserInfo         = oInfo.oUserInfo;
        oAPP.attr.oThemeInfo        = oInfo.oThemeInfo;
        oAPP.attr.aAttrData         = oInfo.aAttrData;
        oAPP.attr.aServEvtData      = oInfo.aServEvtData;
        oAPP.attr.aT_0022           = oInfo.aT_0022;

        let oModel = sap.ui.getCore().getModel();

        // 현재 선택된 메뉴
        let sCurrSelectKey = oModel.getProperty(`${C_MENU_BIND_PATH}/SELKEY`);

        // 서치필드 관련 모델 데이터
        let oShfModelData = oModel.getProperty(`${C_MENU_BIND_PATH}/SHFLDS`);

        // 모델 초기화
        oAPP.fn.fnInitModelBinding();

        // 초기화 하기전에 이전에 서치필드에 입력한 값을 저장했다가,
        // 모델 초기화 한 이후에 현재 메뉴에 해당하는 서치필드만 지우고 나머지는 지우지 않는 목적으로 설계됨.
        for(var i in oShfModelData){

            // 모델 정보 중, 현재 선택된 메뉴에 해당하는 서치필드 모델은 스킵
            if(i === sCurrSelectKey){
                continue;
            }

            // 모델 정보 중, 현재 선택되지 않은 모델은 다시 이전 입력값으로 데이터 설정
            oModel.setProperty(`${C_MENU_BIND_PATH}/SHFLDS/${i}`, oShfModelData[i]);

        }

        // 마지막 선택된 메뉴로 설정
        oModel.setProperty(`${C_MENU_BIND_PATH}/SELKEY`, sCurrSelectKey);

        var oSHFLDModelData = oModel.getProperty(`${C_MENU_BIND_PATH}/SHFLDS/${sCurrSelectKey}`);
        if(!oSHFLDModelData){
            return;
        }

        for(var i in oSHFLDModelData){

            let sId = `${sCurrSelectKey}--${i}`;
            var oSrchField = sap.ui.getCore().byId(sId);
            if(!oSrchField){
                continue;
            }

            oSrchField.fireChange();

        }

        

        // sap.ui.getCore().getModel().refresh(true);

    }; // end of oAPP.fn.fnIpcRendererFind_data_refresh_callback















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

        oEvent.getSource().setSelectedKey(sItemKey);

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

        try {            
        
            var oWebCon = oCurrWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sBrowserKey = oWebPref.browserkey,
                IPCRENDERER = oAPP.IPCRENDERER;

        } catch (error) {
            return;
        }

        var sBindPath = oCtx.sPath,
            oBindData = oAPP.fn.fnGetModelProperty(sBindPath);

        oAPP.fn.setBusyIndicator('X');

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

        try {           
        
            var oWebCon = oCurrWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sBrowserKey = oWebPref.browserkey,
                IPCRENDERER = oAPP.IPCRENDERER;

        } catch (error) {
            return;
        }

        var sBindPath = oCtx.sPath,
            oBindData = oAPP.fn.fnGetModelProperty(sBindPath);

        oAPP.fn.setBusyIndicator('X');

        IPCRENDERER.send(`${sBrowserKey}--find--controller`, oBindData);

        setTimeout(() => {

            oAPP.fn.setBusyIndicator('');

        }, 3000);

    }; // end of oAPP.events.ev_press_Link_Find_Controller


    /**************************************************
     * BroadCast Event 걸기
     **************************************************/
    function _attachBroadCastEvent(){

        oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oAPP.BROWSKEY}`);        

        oAPP.broadToChild.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;

            if(typeof _PRCCD === "undefined"){
                return;
            }

            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":

                    //BUSY ON을 요청받은경우.
                    oAPP.fn.setBusyIndicator("X", {ISBROAD:true});
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    oAPP.fn.setBusyIndicator("",  {ISBROAD:true});
                    break;

                default:
                    break;
            }

        };

    } // end of _attachBroadCastEvent

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function() {
        
        // BroadCast Event 걸기
        _attachBroadCastEvent();

        sap.ui.getCore().attachInit(function() {

            oAPP.fn.setBusyIndicator("X");

            // IPC Event 등록
            _attachIpcEvents();

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            // 화면 초기 실행 시 한번만 수행 되는 메인 Busy를 끈다.
            oAPP.setBusyLoading('');

            setTimeout(() => {
                $('#content').fadeIn(300, 'linear');
            }, 100);

        }); 

    };

    /************************************************************************
     * window 창을 닫을때 호출 되는 이벤트
     ************************************************************************/
    window.onbeforeunload = function() {

        // Busy가 실행 중이면 창을 닫지 않는다.
        if(oAPP.fn.getBusy() === "X"){
            return false;
        }

        // IPCRENDERER 이벤트 해제

        oAPP.IPCMAIN.off(`${oAPP.BROWSKEY}--find--success`, oAPP.fn.fnIpcMainFindSuccess);
        
        oAPP.IPCRENDERER.off(`${oAPP.BROWSKEY}--find--data--refresh--callback`, oAPP.fn.fnIpcRendererFind_data_refresh_callback);

    };

})(window, oAPP);