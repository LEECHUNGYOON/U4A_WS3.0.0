/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : patternPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/

const
    require = parent.require,
    REMOTE = require('@electron/remote'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    WSUTIL = require(WSMSGPATH),
    CURRWIN = REMOTE.getCurrentWindow();

var zconsole = WSERR(window, document, console);

let oAPP = parent.oAPP;
if (!oAPP) {
    oAPP = {};
    oAPP.attr = {};
    oAPP.fn = {};
    oAPP.msg = {};
}

(async function (window, oAPP) {
    "use strict";

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
    oAPP.fn.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

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
    oAPP.fn.fnGetModelProperty = function (sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = async function () {

        var oSettings = WSUTIL.getWsSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            oBootStrap = oSetting_UI5.bootstrap,
            sTheme = oSettings.globalTheme,
            sLangu = oSettings.globalLanguage;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute('data-sap-ui-theme', sTheme);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.f, sap.ui.table");
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

        oScript.onload = () => {

            oAPP.fn.attachInit();

        };

    }; // end of fnLoadBootStrapSetting 

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function () {



    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oApp = new sap.m.App({
            autoFocus: false,
        }),
            oPage = new sap.m.Page({
                // properties
                showHeader: true,
                enableScrolling: false,
                customHeader: new sap.m.Toolbar({
                    content: [
                        new sap.m.Image({
                            width: "25px",
                            src: PATHINFO.WS_LOGO
                        }),
                        new sap.m.Title({
                            text: "Icon List"
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.MenuButton("hdMenuBtn", {
                            text: "SAP Icons",
                            menu: new sap.m.Menu("hdMenu", {
                                itemSelected: ev_HeaderMenuSelected,
                                items: [
                                    new sap.m.MenuItem({
                                        key: "SAP",
                                        text: "SAP Icons"
                                    }),
                                    new sap.m.MenuItem({
                                        key: "U4A",
                                        text: "U4A Icons"
                                    }),
                                ]
                            })
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://less",
                            press: function () {

                                CURRWIN.setOpacity(0);

                                CURRWIN.setParentWindow(null);

                                setTimeout(() => {

                                    CURRWIN.minimize();

                                    CURRWIN.setOpacity(1);

                                }, 100);

                            }
                        }),
                        new sap.m.Button("maxWinBtn", {
                            icon: "sap-icon://header",
                            press: function (oEvent) {

                                let bIsMax = CURRWIN.isMaximized();

                                if (bIsMax) {
                                    CURRWIN.unmaximize();
                                    return;
                                }

                                CURRWIN.maximize();

                            }
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://decline",
                            press: function () {

                                CURRWIN.close();

                            }
                        }),
                    ]
                }).addStyleClass("u4aWsBrowserDraggable"),

                content: fnGetMainPageContents()

            }).addStyleClass("u4aWsIconListMainPage");

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering

    /************************************************************************
     * WS 글로벌 메시지 목록 구하기
     ************************************************************************/
    oAPP.fn.getWsMessageList = function () {

        return new Promise(async (resolve) => {

            var WSUTIL = parent.WSUTIL,
                oSettingInfo = WSUTIL.getWsSettingsInfo();

            let sWsLangu = oSettingInfo.globalLanguage;

            // oAPP.msg.M01 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "021"); // Default Pattern
            // oAPP.msg.M02 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "022"); // Custom Pattern
            // oAPP.msg.M03 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "023"); // Content Type
            // oAPP.msg.M04 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "024"); // Title
            // oAPP.msg.M05 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "025"); // Pretty Print
            // oAPP.msg.M06 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "026"); // Create
            // oAPP.msg.M07 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "027", oAPP.msg.M04); // title is required entry value
            // oAPP.msg.M08 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "028"); // Do you really want to delete the object?
            // oAPP.msg.M09 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Delete
            // oAPP.msg.M10 = oAPP.msg.M02 + " " + WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Custom Pattern Delete
            // oAPP.msg.M11 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "030"); // Change
            // oAPP.msg.M12 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "031"); // Clipboard Copy Success!
            // oAPP.msg.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "007"); // Saved success
            // oAPP.msg.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "008"); // Delete success
            // oAPP.msg.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "038"); // YES
            // oAPP.msg.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "039"); // NO


            resolve();

        });

    };

    oAPP.setBusy = (isBusy) => {

        let bIsBusy = (isBusy == "X" ? true : false);

        sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            sap.ui.core.BusyIndicator.show(0);

            return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        sap.ui.core.BusyIndicator.hide();

    }; // end of oAPP.fn.setBusy

    /************************************************************************
     * UI5 Attach Init
     ************************************************************************/
    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(async function () {

            oAPP.setBusy("X");

            await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

            oAPP.fn.fnInitRendering();

            oAPP.fn.fnInitModelBinding();

            /**
             * 무조건 맨 마지막에 수행 되어야 함!!
             */
            // 자연스러운 로딩
            sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, function () {

                if (!oAPP.attr.UIUpdated) {

                    setTimeout(() => {
                        $('#content').fadeIn(300, 'linear');
                    }, 300);

                    oAPP.attr.UIUpdated = "X";

                    oAPP.setBusy("");

                }

            });

        });

    }; // end of oAPP.fn.attachInit

    function fnGetMainPageContents() {

        let oDynamicPage = fnGetDynamicPage();

        let oIconTabBar = new sap.m.IconTabBar({
            selectedKey: "K1",
            expandable: false,
            expanded: true,
            stretchContentHeight: true,
            applyContentPadding: false,
            backgroundDesign: "Transparent",
            items: [
                new sap.m.IconTabFilter({
                    icon: "sap-icon://grid",
                    text: "Grid",
                    key: "K1"
                }),
                new sap.m.IconTabFilter({
                    icon: "sap-icon://list",
                    text: "Details",
                    key: "K2"
                }),
            ],
            content: [
                oDynamicPage
            ],

            select: ev_iconListIconTabSelectEvent

        });

        return [
            oIconTabBar
        ];

    } // end of fnGetMainPageContents

    function fnGetDynamicPageContent() {

        jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

        let oGridListPage = new sap.m.Page("K1", {
            showHeader: false,
            content: [
                new sap.f.GridList({

                    growingScrollToLoad: true,
                    growingThreshold: 200,
                    customLayout: new sap.ui.layout.cssgrid.GridBoxLayout({
                        boxWidth: "8.125rem"
                    }),

                    items: [
                        new sap.f.GridListItem({
                            content: [
                                new sap.m.VBox({
                                    direction: "Column",
                                    alignItems: "Center",
                                    items: [
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://settings",
                                            size: "2.5rem",
                                            layoutData: new sap.m.FlexItemData({
                                                styleClass: "sapUiTinyMarginTop"
                                            })
                                        }),
                                        new sap.m.Label({
                                            text: "settings",
                                            textAlign: "Center",
                                            design: "Bold",
                                            width: "6rem"
                                        }),
                                        new sap.m.HBox({
                                            items: [
                                                new sap.m.Button({
                                                    icon: "sap-icon://copy",
                                                    press: ev_iconClipBoardCopy
                                                })
                                            ]
                                        }),
                                    ]

                                })
                            ]
                        })
                    ]

                })
            ]
        }).addStyleClass("sapUiContentPadding");


        let oTableListPage = new sap.m.Page("K2", {

            showHeader: false,
            content: [

                new sap.ui.table.Table({

                    // properties
                    selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                    visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                    selectionMode: sap.ui.table.SelectionMode.Single,
                    minAutoRowCount: 1,
                    alternateRowColors: true,

                    columns: [
                        new sap.ui.table.Column({
                            label: "Icon",
                            template: new sap.ui.core.Icon({

                            })
                        }),
                        new sap.ui.table.Column({
                            label: "Name",
                            template: new sap.m.Label({
                                design: "Bold",

                            })
                        }),

                        new sap.ui.table.Column({
                            label: "Code",
                            template: new sap.m.Text({

                            })
                        }),

                    ],
                    rows: {
                        path: "/ICONLIST",
                    },

                })

            ]

        }).addStyleClass("sapUiContentPadding");

        return new sap.m.NavContainer("IconListNavCon", {
            autoFocus: false,
            pages: [

                oGridListPage,

                oTableListPage

            ]
        })

    } // end of fnGetDynamicPageContent    

    function fnGetDynamicPage() {

        return new sap.f.DynamicPage({
            headerExpanded: true,
            fitContent: true,

            title: new sap.f.DynamicPageTitle({
                expandedContent: [
                    new sap.m.VBox({
                        items: [
                            new sap.m.SearchField()
                        ]
                    })
                ]
            }),

            content: fnGetDynamicPageContent()

        }).addStyleClass("u4aWsIconListDynamicPage");

    }  // end of fnGetDynamicPage

    /************************************************************************
     * 아이콘 탭 바 선택 이벤트
     ************************************************************************/
    function ev_iconListIconTabSelectEvent(oEvent) {

        let sPrevKey = oEvent.getParameter("previousKey"),
            sCurrKey = oEvent.getParameter("selectedKey");

        if (sPrevKey === sCurrKey) {
            return;
        }

        let oNavi = sap.ui.getCore().byId("IconListNavCon");
        oNavi.to(sCurrKey);

    } // end of ev_iconListIconTabSelectEvent

    /************************************************************************
     * 헤더 메뉴 버튼 클릭 이벤트
     ************************************************************************/
    function ev_HeaderMenuSelected(oEvent) {

        debugger;

        let oSelectedItem = oEvent.getParameter("item"),
            sSelectedKey = oSelectedItem.getProperty("key");





    } // end of ev_HeaderMenuSelected

    /************************************************************************
     * GridList의 클립보드 복사 버튼 이벤트
     ************************************************************************/
    function ev_iconClipBoardCopy(oEvent) {

        debugger;




    } // end of ev_iconClipBoardCopy





    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

})(window, oAPP);