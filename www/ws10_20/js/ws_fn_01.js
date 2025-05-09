/**************************************************************************
 * ws_fn_01.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common,
        REMOTE = parent.REMOTE,
        PATH = parent.PATH,
        FS = parent.FS,
        APP = parent.APP,
        CURRWIN = parent.CURRWIN,
        USERDATA = parent.USERDATA,
        APPPATH = parent.APPPATH,
        WEBFRAME = parent.WEBFRAME;

    function _checkExamPopup() {

        if (oAPP.attr.isExam !== "X") {
            return;
        }

        var oCurrWin = REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        var aChild = oCurrWin.getChildWindows(),
            iChildCnt = aChild.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {

            var oChild = aChild[i];
            if (oChild.isDestroyed()) {
                continue;
            }

            try {               
            
                var oWebCon = oChild.webContents,
                    oWebPref = oWebCon.getWebPreferences(),
                    sOBJTY = oWebPref.OBJTY;

                if (sOBJTY !== "EXAMPLE") {
                    continue;
                }

                oChild.show();

            } catch (error) {
                continue;
            }

        }

        delete oAPP.attr.isExam;

    }

    /************************************************************************
     * 초기 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRendering = function () {

        let oRootApp = new sap.m.App({
            autoFocus: false,
        }).addStyleClass("sapUiSizeCompact"),
            oRootPage = new sap.m.Page({
                enableScrolling: false,
                customHeader: new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Image({
                            width: "25px",
                            src: parent.PATHINFO.WS_LOGO
                        }),
                        new sap.m.Title("u4aWsHeaderTitle", {
                            text: "U4A Workspace - Main"
                        }),
                    ],
                    contentRight: [

                        new sap.m.Button({
                            icon: "sap-icon://less",
                            press: function () {

                                CURRWIN.minimize();

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
                        new sap.m.Button("mainWinClose", {
                            icon: "sap-icon://decline",
                            press: function () {

                                // 브라우저의 닫기 버튼 눌렀다는 플래그
                                oAPP.attr.isPressWindowClose = "X";

                                CURRWIN.close();

                            }
                        }),

                    ]
                }).addStyleClass("u4aWsBrowserDraggable"),

            });

        var oApp = new sap.m.NavContainer("WSAPP", {
            autoFocus: false,
            afterNavigate: function (oEvent) {
                
                var toId = oEvent.getParameter("toId");

                // 현재 떠있는 팝오버 종류들을 전체 닫는다.
                sap.m.InstanceManager.closeAllPopovers();

                // 현재 페이지의 위치를 저장한다.
                parent.setCurrPage(toId);

                switch (toId) {

                    case "WS10":

                        // busy 끄고 Lock 끄기
                        oAPP.common.fnSetBusyLock("");

                        // 10번 페이지로 넘어 올때 APP NAME Input에 포커스 주기
                        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
                        if (oAppNmInput) {
                            oAppNmInput.focus();
                        }

                        // Example 팝업을 통해서 접속 했다면 숨겨진 팝업을 보이게 한다.
                        _checkExamPopup();

                        break;

                    case "WS20":
                        
                        oAPP.fn.fnMoveToWs20(); // #[ws_fn_02.js]                 

                        break;

                    case "WS30":

                        oAPP.fn.fnMoveToWs30(); // #[ws_fn_02.js]

                        break;

                }

            }

        }).addStyleClass("u4aWsApp sapUiSizeCompact");

        // 모든 팝업 및 드롭다운 등등의 영역 제한
        sap.ui.core.Popup.setWithinArea(oApp);

        // 10, 20번 화면에 대한 Page Instance 구하기
        var WS10 = oAPP.fn.fnOnInitRenderingWS10(),
            WS20 = oAPP.fn.fnOnInitRenderingWS20();

        oApp.addPage(WS10);
        oApp.addPage(WS20);

        // 30번 페이지 생성하기
        oAPP.fn.fnWs30Creator();

        // oApp.placeAt("content");        

        oRootPage.addContent(new sap.m.VBox({
            height: "100%",
            renderType: "Bare",
            items: [
                oApp
            ]
        }));

        oRootApp.addPage(oRootPage);

        oRootApp.placeAt("content");

        // 단축키 설정
        APPCOMMON.setShortCut("WS10");

        // 처음 로드 할때 APP NAME Input에 포커스 주기
        oApp.addEventDelegate({

            onAfterRendering: function () {

                if (parent.oWS.utill.attr.ISINIT == null) {

                    // // 웰컴 사운드   <--- 로그인 성공 시 사운드 출력하는 것으로 소스 이동
                    // parent.setSoundMsg('WELCOME');

                    let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "299");                   

                    // 페이지 푸터 메시지                    
                    APPCOMMON.fnShowFloatingFooterMsg("S", "WS10", sMsg /*"Welcome to U4A Workspace!"*/);

                    parent.oWS.utill.attr.ISINIT = 'X';

                    // setTimeout(() => {
                    //     $('#content').fadeIn(300, 'linear');
                    // }, 300);

                }

                var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
                if (!oAppNmInput) {
                    return;
                }

                oAppNmInput.focus();

            }

        });

    }; // end of fnOnInitRendering  

    /************************************************************************
     * [WS10] 10번 페이지 Window Menu List
     ************************************************************************/
    oAPP.fn.fnGetWindowMenuListWS10 = function () {

        var
            /** 
             * Extras
            */
            aWMENU10 = [
                {
                    key: "WMENU10_01",
                    icon: "sap-icon://u4a-fw-solid/Arrows Rotate",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B40"), // App. Package Change
                },
                {
                    key: "WMENU10_02",
                    icon: "sap-icon://u4a-fw-solid/Arrow Right Arrow Left",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B41"), // App. Import/Export
                    items: [{
                        key: "WMENU10_02_01",
                        icon: "sap-icon://u4a-fw-solid/File Import",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B42"), // App. Importing
                    },
                    {
                        key: "WMENU10_02_02",
                        icon: "sap-icon://u4a-fw-solid/File Export",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B43"), // App. Exporting
                    }
                    ]
                },
                // 2023-04-04 중복 메뉴로 폐기
                // {
                //     key: "WMENU10_03",
                //     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44"), // U4A Help Document
                // },
                {
                    key: "WMENU10_04",
                    icon: "sap-icon://shortcut",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B45"), // Shortcut Manager
                    items: [{
                        key: "WMENU10_04_01",
                        icon: "sap-icon://generate-shortcut",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B46"), // U4A Shortcut Create
                    },
                        // 2023-04-04 로직 미완성으로 임시 주석처리
                        // {
                        //     key: "WMENU10_04_02",
                        //     text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B47"), // QR Code Maker
                        // }
                    ]
                },
                {
                    key: "WMENU10_05",
                    icon: "sap-icon://hint",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B48"), // About U4A WS IDE
                },

            ],

            /**
             * Utilities
            */
            aWMENU20 = [
                {
                    key: "WMENU20_01",
                    icon: "sap-icon://internet-browser",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B49"), // Select Browser Type
                },
                {
                    key: "WMENU20_03",
                    icon: "sap-icon://video",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B50"), // Video Record
                },
                {
                    key: "WMENU20_05",
                    icon: "sap-icon://source-code",
                    text: oAPP.msg.M059, // Source Pattern                    
                },
                {
                    key: "WMENU20_04",                    
                    icon: "sap-icon://u4a-fw-regular/Face Grin Wide",
                    text: oAPP.msg.M068, // Icon Viewer
                    visible: oAPP.common.checkWLOList("C", "UHAK900630"),
                    items: [
                        {
                            key: "WMENU20_04_01",
                            icon: "sap-icon://u4a-fw-solid/Icons",
                            text: oAPP.msg.M047, // Icon List
                        },
                        {
                            key: "WMENU20_04_02",
                            icon: "sap-icon://u4a-fw-solid/Image",
                            text: oAPP.msg.M067 // Image Icons
                        },
                    ]

                }
                // {
                //     key: "WMENU20_04",
                //     text: oAPP.msg.M047, // Icon List
                //     visible: oAPP.common.checkWLOList("C", "UHAK900630")
                // }
            ],

            /**
             * System
            */
            aWMENU30 = [
                {
                    key: "WMENU30_01",
                    icon: "sap-icon://create",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
                },
                {
                    key: "WMENU30_02",
                    icon: "sap-icon://decline",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B51"), // Close Window
                },
                {
                    key: "WMENU30_03",
                    icon: "sap-icon://action-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B52"), // Options
                },
                {
                    key: "WMENU30_04",
                    icon: "sap-icon://log",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B53"), // Logoff
                },
                {
                    key: "WMENU30_06",
                    icon: "sap-icon://key-user-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B55"), // Administrator
                    items: [
                        {
                            key: "WMENU30_06_01",
                            text: oAPP.msg.M252, // DevTool
                            icon: "sap-icon://u4a-fw-solid/Bug"
                        },
                        {
                            key: "WMENU30_06_02",
                            icon: "sap-icon://notes",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B54"), // Release Note
                        }, {
                            key: "WMENU30_06_03",
                            icon: "sap-icon://u4a-fw-solid/Triangle Exclamation",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B70"), // Error Log
                        },
                    ],
                    visible: true,
                },
                {
                    key: "WMENU30_07",
                    icon: "sap-icon://it-host",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C42") // Server Information
                },
            ],

            /** 
             * Help
            */
            aWMENU50 = [
                {
                    key: "WMENU50_01",
                    icon: "sap-icon://u4a-fw-solid/Book Open Reader",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44"), // U4A Help Document
                    enabled: true,
                },
                {   // 20241228
                    key: "WMENU50_04",
                    icon: "sap-icon://u4a-fw-solid/Keyboard",
                    text: oAPP.msg.M253, // Keyboard Shortcut List
                    enabled: true,
                    // visible: !parent.APP.isPackaged
                },
            ],

            /** 
             * Test
            */
            Test10 = [
                {
                    key: "Test96",
                    text: "USP 페이지 생성"
                },
                {
                    key: "Test90",
                    text: "Busy 강제실행"
                },
                {
                    key: "Test99",
                    text: "Busy 강제종료"
                },
                {
                    key: "Test98",
                    text: "세션 끊기"
                },
                {
                    key: "Test97",
                    text: "개발툴"
                },
                {
                    key: "Test94",
                    text: "잘못된 서버 호출"
                },
                // {
                //     key: "Test93",
                //     text: "abap 펑션 버젼 확인"
                // },
                // {
                //     key: "Test92",
                //     text: "abap syntax 버젼 확인"
                // },
                // {
                //     key: "Test91",
                //     text: "Source Pattern Popop"
                // },
                // {
                //     key: "Test89",
                //     text: "icon Preview Popup"
                // },
                // {
                //     key: "Test88",
                //     text: "icon Preview Popup (callback)"
                // },
                {
                    key: "Test86",
                    text: "모나코 에디터 테마 디자이너"
                },
                {
                    key: "Test85",
                    text: "모나코 에디터 스니펫 생성기"
                },                
            ];

        return {
            WMENU10: aWMENU10,
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            WMENU50: aWMENU50,
            Test10: Test10
        };

    }; // end of oAPP.fn.fnGetWindowMenuListWS10

    /************************************************************************
     * [WS20] 20번 페이지 Window Menu List
     ************************************************************************/
    oAPP.fn.fnGetWindowMenuListWS20 = function () {

        var
            /** 
             * Style Class
            */
            aWMENU10 = [
                {
                    key: "WMENU10_01",
                    icon: "sap-icon://palette",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B56"), // Theme Designer
                    enabled: false,
                }, {
                    key: "WMENU10_02",
                    icon: "sap-icon://BusinessSuiteInAppSymbols/icon-bold",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B57"), // Font Style Wizard
                    enabled: true,
                },
                {
                    key: "WMENU10_03",
                    icon: "sap-icon://u4a-fw-solid/Pen Ruler",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B58"), // UI5 Predefined CSS
                    enabled: true,
                }
            ],

            /** 
             * Utilities
            */
            aWMENU20 = [
                {
                    key: "WMENU20_01",
                    icon: "sap-icon://internet-browser",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B49"), // Select Browser Type
                    enabled: true,
                },
                {
                    key: "WMENU20_02",
                    icon: "sap-icon://translate",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B59"), // OTR Manager
                    enabled: true,
                },
                {
                    key: "WMENU20_03",
                    icon: "sap-icon://video",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B50"), // Video Record
                    enabled: true,
                },
                {
                    key: "WMENU20_05",
                    icon: "sap-icon://source-code",
                    text: oAPP.msg.M059, // Source Pattern
                    enabled: true,                    
                },
                {
                    key: "WMENU20_04",
                    text: oAPP.msg.M068, // Icon Viewer
                    icon: "sap-icon://u4a-fw-regular/Face Grin Wide",
                    visible: oAPP.common.checkWLOList("C", "UHAK900630"),
                    items: [
                        {
                            key: "WMENU20_04_01",
                            icon: "sap-icon://u4a-fw-solid/Icons",
                            text: oAPP.msg.M047, // Icon List
                        },
                        {
                            key: "WMENU20_04_02",
                            icon: "sap-icon://u4a-fw-solid/Image",
                            text: oAPP.msg.M067 // Image Icons
                        },
                    ]

                },
                {
                    key: "WMENU20_06",
                    icon: "sap-icon://u4a-fw-solid/Code Branch",
                    visible: !parent.APP.isPackaged,
                    // visible: oAPP.common.checkWLOList("C", "UHAK900948"),
                    text: "Version Management", // [MSG]            
                    enabled: true,
                },
                // {
                //     key: "WMENU20_04",
                //     text: oAPP.msg.M047, // Icon List
                //     visible: oAPP.common.checkWLOList("C", "UHAK900630")
                // }
            ],

            /** 
             * Edit
            */
            aWMENU30 = [
                {
                    key: "WMENU30_01",
                    icon: "sap-icon://u4a-fw-brands/CSS 3 Logo",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B60"), // CSS Editor
                    enabled: true,
                },
                {
                    key: "WMENU30_02",
                    icon: "sap-icon://u4a-fw-brands/JavaScript (JS)",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B61"), // Javascript Editor
                    enabled: true,
                },
                {
                    key: "WMENU30_03",
                    icon: "sap-icon://u4a-fw-brands/HTML 5 Logo",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B62"), // HTML Editor
                    enabled: true,
                },
                {
                    key: "WMENU30_04",
                    icon: "sap-icon://u4a-fw-regular/File Lines",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B63"), // Error Page Editor
                    enabled: true,
                },
                {
                    key: "WMENU30_05",
                    icon: "sap-icon://u4a-fw-solid/Sliders",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B64"), // Skeleton Scr Setting
                    enabled: true,
                }
            ],

            /** 
             * System
            */
            aWMENU40 = [
                {
                    key: "WMENU40_01",
                    icon: "sap-icon://create",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
                    enabled: true,
                },
                {
                    key: "WMENU40_02",
                    icon: "sap-icon://decline",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B51"), // Close Window
                    enabled: true,
                },
                {
                    key: "WMENU40_03",
                    icon: "sap-icon://action-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B52"), // Options
                    enabled: true,
                },
                {
                    key: "WMENU40_04",
                    icon: "sap-icon://log",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B53"), // Logoff
                    enabled: true,
                },
                {
                    key: "WMENU40_06",
                    icon: "sap-icon://key-user-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B55"), // Administrator
                    enabled: true,
                    visible: true,
                    items: [{
                        key: "WMENU40_06_01",
                        text: oAPP.msg.M252, // DevTool
                        icon: "sap-icon://u4a-fw-solid/Bug"
                    },
                    {
                        key: "WMENU40_06_02",
                        icon: "sap-icon://notes",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B54"), // Release Note
                        enabled: true,
                    },
                    {
                        key: "WMENU40_06_03",
                        icon: "sap-icon://u4a-fw-solid/Triangle Exclamation",
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B70"), // Error Log
                        enabled: true,
                    },],
                },
                {
                    key: "WMENU40_07",
                    icon: "sap-icon://it-host",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C42") // Server Information
                },
            ],

            /** 
             * Help
            */
            aWMENU50 = [
                {
                    key: "WMENU50_01",
                    icon: "sap-icon://u4a-fw-solid/Book Open Reader",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44"), // U4A Help Document
                    enabled: true,
                },
                // {
                //      key: "WMENU50_02",
                //      text: "Settings",
                //      enabled: true,
                //  },
                {
                    key: "WMENU50_03",
                    icon: "sap-icon://u4a-fw-solid/Book",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B65"), // Document
                    enabled: true,
                },
                {   // 20241228
                    key: "WMENU50_04",
                    icon: "sap-icon://u4a-fw-solid/Keyboard",
                    text: oAPP.msg.M253, // Keyboard Shortcut List
                    enabled: true,
                    // visible: !parent.APP.isPackaged
                },
            ],

            /** 
             * Test
            */
            Test20 = [
                {
                    key: "Test90",
                    text: "Busy 강제실행",
                },
                {
                    key: "Test99",
                    text: "Busy 강제종료",
                },
                {
                    key: "Test98",
                    text: "세션 끊기",
                },
                {
                    key: "Test97",
                    text: "개발툴",
                },
                {
                    key: "Test95",
                    text: "CTS Popup",
                },
                {
                    key: "Test91",
                    text: "Prop Help",
                },
                {
                    key: "Test96",
                    text: "스크립트 오류",
                },
                {
                    key: "Test94",
                    text: "sample script download",
                },
                {
                    key: "Test87",
                    text: "AI 연결 테스트"
                },

                // {
                //     key: "doc01",
                //     text: "Document",
                // },
            ];

        return {
            WMENU10: aWMENU10,
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            WMENU40: aWMENU40,
            WMENU50: aWMENU50,
            Test20: Test20
        };

    }; // end of oAPP.fn.fnGetWindowMenuListWS20

    /************************************************************************
    * [WS30] 30번 페이지 Window Menu List
    ************************************************************************/
    oAPP.fn.fnGetWindowMenuListWS30 = function () {

        var
            /** 
             * Utilities
            */
            aWMENU20 = [
                {
                    key: "WMENU20_01",
                    icon: "sap-icon://internet-browser",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B49"), // Select Browser Type
                },
                {
                    key: "WMENU20_03",
                    icon: "sap-icon://video",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B50"), // Video Record
                },
                {
                    key: "WMENU20_05",
                    icon: "sap-icon://source-code",
                    text: oAPP.msg.M059, // Source Pattern                    
                },
                {
                    key: "WMENU20_04",                    
                    icon: "sap-icon://u4a-fw-regular/Face Grin Wide",
                    text: oAPP.msg.M068, // Icon Viewer
                    visible: oAPP.common.checkWLOList("C", "UHAK900630"),
                    items: [
                        {
                            key: "WMENU20_04_01",
                            icon: "sap-icon://u4a-fw-solid/Icons",
                            text: oAPP.msg.M047, // Icon List
                        },
                        {
                            key: "WMENU20_04_02",
                            icon: "sap-icon://u4a-fw-solid/Image",
                            text: oAPP.msg.M067 // Image Icons
                        },
                    ]

                },
                // {
                //     key: "WMENU20_07",
                //     icon: "sap-icon://u4a-fw-solid/Code",
                //     text: oAPP.msg.M344, // Code Editor
                //     items: [
                //         {
                //             key: "WMENU20_07_01",
                //             icon: "sap-icon://palette",
                //             text: oAPP.msg.M345, // Theme Designer
                //         },
                //         {
                //             key: "WMENU20_07_02",
                //             icon: "sap-icon://palette",
                //             text: oAPP.msg.M346, // Snippet Designer
                //         },
                        
                //     ]
                // }

            ],

            /** 
             * System
            */
            aWMENU30 = [
                {
                    key: "WMENU30_01",
                    icon: "sap-icon://create",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
                },
                {
                    key: "WMENU30_02",
                    icon: "sap-icon://decline",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B51"), // Close Window
                },
                {
                    key: "WMENU30_03",
                    icon: "sap-icon://action-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B52"), // Options
                },
                {
                    key: "WMENU30_04",
                    icon: "sap-icon://log",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B53"), // Logoff
                },
                {
                    key: "WMENU30_06",
                    icon: "sap-icon://key-user-settings",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B55"), // Administrator
                    visible: true,
                    items: [
                        {
                            key: "WMENU30_06_01",
                            text: oAPP.msg.M252, // DevTool
                            icon: "sap-icon://u4a-fw-solid/Bug"
                        },
                        {
                            key: "WMENU30_06_02",
                            icon: "sap-icon://notes",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B54"), // Release Notes
                        }, {
                            key: "WMENU30_06_03",
                            icon: "sap-icon://u4a-fw-solid/Triangle Exclamation",
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B70"), // Error Log
                        },
                    ],
                },
                {
                    key: "WMENU30_07",
                    icon: "sap-icon://it-host",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C42") // Server Information
                },

            ],

            /** 
             * Help
            */
            aWMENU50 = [
                {
                    key: "WMENU50_01",
                    icon: "sap-icon://u4a-fw-solid/Book Open Reader",
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44"), // U4A Help Document
                    enabled: true,
                },
                {   // 20241228
                    key: "WMENU50_04",
                    icon: "sap-icon://u4a-fw-solid/Keyboard",
                    text: oAPP.msg.M253, // Keyboard Shortcut List
                    enabled: true,
                    // visible: !parent.APP.isPackaged
                },
            ],

            /** 
             * Test
            */
            Test10 = [
                {
                    key: "Test97",
                    text: "개발툴"
                },
                {
                    key: "Test86",
                    text: "모나코 에디터 테마 디자이너"
                },
                {
                    key: "Test85",
                    text: "모나코 에디터 스니펫 생성기"
                },
            ];

        return {
            WMENU20: aWMENU20,
            WMENU30: aWMENU30,
            WMENU50: aWMENU50,
            Test10: Test10
        };

    }; // end of oAPP.fn.fnGetWindowMenuListWS30

    /**************************************************************************
     * WS10 페이지의 윈도우 메뉴 정보
     **************************************************************************/
    oAPP.fn.fnGetWindowMenuWS10 = function () {

        return [{
            key: "WMENU10",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B34"), //"Extras",
            icon: "",
        },
        {
            key: "WMENU20",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B35"), // Utilities 
            icon: "",
        },
        {
            key: "WMENU30",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B36"), //"System"
            icon: "",
        },
        {
            key: "WMENU50",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39"), // Help
            icon: "",
        },
        {
            key: "Test10",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B69"), // Test
            icon: "",
        },
        ];

    }; // end of oAPP.main.fnGetWindowMenuWS10

    /**************************************************************************
     * WS20 페이지의 윈도우 메뉴 정보
     **************************************************************************/
    oAPP.fn.fnGetWindowMenuWS20 = function () {

        return [{
            key: "WMENU10",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B37"), // Style Class
            icon: "",
        },
        {
            key: "WMENU20",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B35"), // Utilities
            icon: "",
        },
        {
            key: "WMENU30",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B38"), // Edit
            icon: "",
        },
        {
            key: "WMENU40",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B36"), // System
            icon: "",
        },
        {
            key: "WMENU50",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39"), // Help
            icon: "",
        },
        {
            key: "Test20",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B69"), // Test
            icon: "",
        },
        ];

    }; // end of oAPP.main.fnGetWindowMenuWS20

    /************************************************************************
     * 10번 페이지 Header Menu에 대한 Enable, Disable 
     ************************************************************************/
    oAPP.fn.fnWs10HeaderMenuEnableBinding = (sMenuKey) => {

        // 개발 서버 여부 확인
        let isDev = APPCOMMON.fnGetModelProperty("/USERINFO/USER_AUTH/IS_DEV");

        // 개발서버가 아닐 경우 막을 메뉴
        if (isDev !== "D") {

            switch (sMenuKey) {
                case "WMENU10_01": // App. Package Change
                case "WMENU10_02_01": // App. Importing
                    return false;

                default:
                    return true;

            }

        }

        // 개발서버 일 경우
        // 아래에 case로 확장하면 됨!!
        switch (sMenuKey) {

            default:
                return true;

        }

    }; // end of oAPP.fn.fnWs10HeaderMenuEnableBinding

    /************************************************************************
     * 10번 페이지 Header Toolbar Contents
     ************************************************************************/
    oAPP.fn.fnGetHeaderToolbarContentWs10 = function () {

        var sBindRoot = "/WMENU/WS10";

        //10번 페이지 윈도우 메뉴 정보
        var aWMenu10 = oAPP.fn.fnGetWindowMenuWS10(),
            oMenuList = oAPP.fn.fnGetWindowMenuListWS10();

        oMenuList.HEADER = aWMenu10;

        APPCOMMON.fnSetModelProperty(sBindRoot, oMenuList);

        var oMenuUI = {};

        // WS10 페이지의 윈도우 메뉴 구성

        // Extras
        oMenuUI.WMENU10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU10",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            visible: "{visible}",
                            enabled: "{enabled}",
                        }).bindProperty("enabled", "key", oAPP.fn.fnWs10HeaderMenuEnableBinding)
                    }
                }).bindProperty("enabled", "key", oAPP.fn.fnWs10HeaderMenuEnableBinding)
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Utilities
        oMenuUI.WMENU20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU20",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            visible: "{visible}",
                            enabled: "{enabled}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // System
        oMenuUI.WMENU30 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU30",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            visible: "{visible}",
                            enabled: "{enabled}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Help
        oMenuUI.WMENU50 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/WMENU50",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            visible: "{visible}",
                            enabled: "{enabled}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        oMenuUI.Test10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS10,
            items: {
                path: sBindRoot + "/Test10",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            visible: "{visible}",
                            enabled: "{enabled}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        var oHH = new sap.m.HBox({
            items: [
                oMenuUI.WMENU10,
                oMenuUI.WMENU20,
                oMenuUI.WMENU30,
                oMenuUI.WMENU50,
                oMenuUI.Test10
            ]
        });

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            WMENU: APPCOMMON.fnGetModelProperty("/WMENU")
        });

        oHH.setModel(oJsonModel);

        oAPP.wmenu.WS10 = oMenuUI;

        return [

            new sap.m.HBox({
                items: {
                    path: sBindRoot + "/HEADER",
                    template: new sap.m.Button({
                        text: "{text}",
                        press: oAPP.events.ev_pressWMenu10
                    }).bindProperty("visible", {
                        parts: [
                            "key"
                        ],
                        formatter: function (sKey) {

                            if (sKey == null) {
                                return false;
                            }

                            if (sKey != "Test10") {
                                return true;
                            }

                            // U4A R&D 일 경우에만 Test Menu를 보여준다.
                            var bIsStaff = oAPP.fn.fnIsStaff();
                            if (!bIsStaff) {
                                return false;
                            }

                            return true;

                        }
                    })
                }
            }),

            new sap.m.ToolbarSpacer(),

            // 상단 공통 헤더 버튼
            APPCOMMON.fnGetCommonHeaderButtons()

        ];

    }; // end of oAPP.fn.fnGetHeaderToolbarContentWs10

    /************************************************************************
     * 10번 페이지 Sub Header Toolbar Contents
     ************************************************************************/
    oAPP.fn.fnGetSubHeaderToolbarContentWs10 = function () {

        var lo_bindPropForVisible = {
            parts: [{
                path: "/USERINFO/USER_AUTH/IS_DEV"
            }],
            formatter: function (isDev) {

                if (isDev !== "D") {
                    return false;
                }

                return true;

            }
        };

        /**
         * Transaction Buttons
         */
        var oAppCreateBtn = new sap.m.Button("appCreateBtn", {
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"), // Create
            icon: "sap-icon://document",
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01") + " (Ctrl+F12)", // Create (Ctrl+F12),
            press: oAPP.events.ev_AppCreate
        })
            .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
            .addStyleClass("u4aWs10AppCreateBtn"),

            oAppChangeBtn = new sap.m.Button("appChangeBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"), // Change
                icon: "sap-icon://edit",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02") + " (F6)", // Change (F6)",
                press: oAPP.events.ev_AppChange
            })
                .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
                .addStyleClass("u4aWs10AppChangeBtn"),

            oAppDelBtn = new sap.m.Button("appDelBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03"), // Delete
                icon: "sap-icon://delete",
                type: sap.m.ButtonType.Reject,
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03") + " (Ctrl+F10)", // Delete (Ctrl+F10)
                press: oAPP.events.ev_AppDelete
            })
                .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
                .addStyleClass("u4aWs10AppDelBtn"),

            oAppCopyBtn = new sap.m.Button("appCopyBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04"), // Copy
                icon: "sap-icon://copy",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04") + " (Shift+F11)", // Copy (Shift+F11)
                press: oAPP.events.ev_AppCopy
            })
                .bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible))
                .addStyleClass("u4aWs10AppCopyBtn"),

            oDisplayBtn = new sap.m.Button("displayBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"), // Display
                icon: "sap-icon://display",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05") + " (F7)", // Display (F7)
                press: oAPP.events.ev_AppDisplay
            }).addStyleClass("u4aWs10DisplayBtn"),

            oAppExecBtn = new sap.m.Button("appExecBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06"), // Application Execution
                icon: "sap-icon://internet-browser",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06") + " (F8)", // Application Execution (F8)
                press: oAPP.events.ev_AppExec
            }).addStyleClass("u4aWs10AppExecBtn"),

            oExamBtn = new sap.m.Button("examBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A07"), // Example Open
                icon: "sap-icon://learning-assistant",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A07") + " (Ctrl+F1)", // Example Open (Ctrl+F1)
                press: oAPP.events.ev_AppExam
            }).addStyleClass("u4aWs10ExamBtn"),

            oMultiPrevBtn = new sap.m.Button("multiPrevBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08"), // App Multi Preview
                icon: "sap-icon://desktop-mobile",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08") + " (Ctrl+F3)", // App Multi Preview (Ctrl+F3)
                press: oAPP.events.ev_MultiPrev
            }).addStyleClass("u4aWs10MultiPrevBtn"),

            oNewWindowBtn = new sap.m.Button("newWindowBtn", {
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09"), // New Window
                icon: "sap-icon://create",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A09") + " (Ctrl+N)", // New Window (Ctrl+N)
                press: oAPP.events.ev_NewWindow
            }).addStyleClass("u4aWs10NewWindowBtn");

        return [

            oAppCreateBtn, // Create Button
            oAppChangeBtn, // Change Button
            oAppDelBtn, // Delete Button
            oAppCopyBtn, // Copy Button

            new sap.m.ToolbarSeparator().bindProperty("visible", jQuery.extend(true, {}, lo_bindPropForVisible)),

            oDisplayBtn, // Display Button Button
            oAppExecBtn, // Execution Button

            new sap.m.ToolbarSeparator(),

            oExamBtn, // Example Open Button
            oMultiPrevBtn, // Multi Preview Button

            new sap.m.ToolbarSeparator(),

            oNewWindowBtn // New Window

        ];

    }; // end of oAPP.fn.fnGetSubHeaderToolbarContentWs10 

    /************************************************************************
     * 10번 페이지 Contents
     ************************************************************************/
    oAPP.fn.fnGetPageContentWs10 = function () {

        var oAppNmInput = new sap.m.SearchField("AppNmInput", {
            value: "{/WS10/APPID}",
            change: oAPP.events.ev_AppInputChange,
            search: oAPP.events.ev_AppValueHelp,
            liveChange: (oEvent) => {

                // X 버튼, 검색 버튼 눌렀을 경우는 하위 로직 실행 하지 않음.
                let bCloseBtnPress = jQuery(event.target).hasClass("sapMSFR sapMSFB");
                if (bCloseBtnPress) {
                    return;
                }

                var oInput = oEvent.getSource(),
                    sValue = oInput.getValue();

                if (typeof sValue == "string" && sValue.length > 0 && sValue !== "") {
                    oInput.setValue(sValue.toUpperCase());
                }

                var aFilters = [];

                oInput.getBinding("suggestionItems").filter();

                aFilters = [
                    new sap.ui.model.Filter([
                        new sap.ui.model.Filter("APPID", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase())
                    ], false)
                ];

                oInput.getBinding("suggestionItems").filter(aFilters);

                oInput.suggest(true);

            },
            suggest: function (oEvent) {
                
                sap.ui.getCore().lock();

                var sValue = oEvent.getParameter("suggestValue"),
                    aFilters = [];

                if (sValue) {

                    aFilters = [
                        new sap.ui.model.Filter([
                            new sap.ui.model.Filter("APPID", function (sText) {
                                return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                            }),
                        ], false)
                    ];

                }

                this.getBinding("suggestionItems").filter(aFilters);
                // this.suggest();

                sap.ui.getCore().unlock();

            },
            enableSuggestions: true,
            suggestionItems: {
                path: "/WS10/APPSUGG",
                sorter: "{ path : '/WS10/APPSUGG/APPID' }",
                template: new sap.m.SuggestionItem({
                    key: "{APPID}",
                    text: "{APPID}",
                })
            }
        }),

            oForm = new sap.ui.layout.form.Form({
                editable: true,
                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    columnsXL: 3,
                    columnsL: 2,
                    columnsM: 1,
                    labelSpanXL: 4,
                    labelSpanL: 3,
                    labelSpanM: 3,
                    labelSpanS: 12,
                    singleContainerFullSize: false

                }),
                formContainers: [
                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: "Bold",
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A33"), // Application name
                                }),
                                fields: oAppNmInput
                            }),
                        ]
                    }),
                ]
            }),

            oHtml = new sap.ui.core.HTML({
                content: _getWs10ContentHtml()
            });


        // 10번 페이지 Application Name SearchField의 Key down Event
        oAppNmInput.attachBrowserEvent("keydown", oAPP.fn.fnWs10AppInputKeyDownEvent);
        oAppNmInput.attachBrowserEvent("dblclick", oAPP.fn.fnWs10AppInputdblclickEvent);
        oAppNmInput.attachBrowserEvent("mousedown", () => {

            var sValue = oAppNmInput.getValue() || "";

            var aFilters = [];

            aFilters = [
                new sap.ui.model.Filter([
                    new sap.ui.model.Filter("APPID", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase())
                ], false)
            ];

            oAppNmInput.getBinding("suggestionItems").filter();
            oAppNmInput.getBinding("suggestionItems").filter(aFilters);
            oAppNmInput.suggest(true);

        });

        return [

            new sap.m.VBox({
                height: "100%",
                width: "100%",
                renderType: "Bare",
                items: [
                    oForm,
                    new sap.m.Page({
                        showHeader: false,
                        enableScrolling: false,
                        content: [
                            // oHtml,
                            // new sap.m.Button({
                            //     text: "테스트 서버 호출",
                            //     press: _testServerCall
                            // }),
                            // new sap.m.Button({text: "SP_00002", press: function(){
                            //     alert("SP_00002!!!");
                            // }}),
                            // new sap.m.Button({text: "SP_00002", press: function(){
                            //     alert("SP_00002!!!");
                            // }}),
                            // new sap.m.Button({text: "SP_00002", press: function(){
                            //     alert("SP_00002!!!");
                            // }})
                        ]
                    }),
                ]
            }),
        ];

    }; // end of oAPP.fn.fnGetPageContentWs10 

    function _testServerCall() {



        // var sPath = parent.getServerPath() + "/wsloginchk";
        var sPath = parent.getServerPath() + "/test_lee";

        var oFormData = new FormData();
        oFormData.append('APPID', "aaaa");

        sendAjax(sPath, oFormData, (oReturn) => {



            parent.setBusy("");

            // if (typeof fnCallback == "function") {
            //     fnCallback(oReturn);
            // }

        },
            null,
            null,
            "POST"
        );

    }

    function _getWs10ContentHtml() {

        let sHtmlPath = PATH.join(APPPATH, "ws10_20", "ws10_content", "intro.html");


        let aa = `<iframe src=${sHtmlPath} style="width:100%;height:100%;border:0px;"></iframe>`;
        return aa;
        // return FS.readFileSync(sHtmlPath);

    }

    /************************************************************************
     * 10번 페이지 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS10 = function () {

        var sFmsgBindRootPath = "/FMSG/WS10";

        var aHeaderToolbarContents = oAPP.fn.fnGetHeaderToolbarContentWs10(), // 헤더 메뉴
            aSubHeaderToolbarContents = oAPP.fn.fnGetSubHeaderToolbarContentWs10(),
            aPageContent = oAPP.fn.fnGetPageContentWs10();

        var oHeaderToolbar = new sap.m.OverflowToolbar({
            content: aHeaderToolbarContents
            // }).addStyleClass("sapTntToolHeader u4aWsWindowMenuToolbar"),
        }).addStyleClass("u4aWsWindowMenuToolbar"),

            oSubHeaderToolbar = new sap.m.OverflowToolbar({
                content: aSubHeaderToolbarContents,
                // }).addStyleClass("u4aWs10_HeaderToolbar sapTntToolHeader"),
            }).addStyleClass("u4aWs10_HeaderToolbar"),

            oMsgFooter = new sap.m.OverflowToolbar({
                content: [
                    new sap.ui.core.Icon({
                        color: "{" + sFmsgBindRootPath + "/ICONCOLOR}",
                        src: "{" + sFmsgBindRootPath + "/ICON}"
                    }),
                    new sap.m.Text({
                        text: "{" + sFmsgBindRootPath + "/TXT}"
                    }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        type: sap.m.ButtonType.Reject,
                        press: APPCOMMON.fnHideFloatingFooterMsg
                    }),
                ]
            });

        var oWs10Page = new sap.m.Page("WS10", {
            titleAlignment: sap.m.TitleAlignment.Center,
            enableScrolling: false,
            subHeader: oSubHeaderToolbar,
            customHeader: oHeaderToolbar,
            content: aPageContent,
            floatingFooter: true,
            footer: oMsgFooter,
        }).bindProperty("showFooter", {
            parts: [
                sFmsgBindRootPath + "/ISSHOW"
            ],
            formatter: function (isshow) {

                if (isshow == null) {
                    return false;
                }

                if (typeof isshow !== "boolean") {
                    return false;
                }

                return isshow;
            }
        }).addStyleClass("u4aWs10Page");

        return oWs10Page;

    }; // end of fnOnInitRenderingWS10

    /************************************************************************
     * 10번 페이지 Application Name SearchField의 Key down Event
     * F4 펑션 키를 눌렀을 때 F4 Help를 띄우기 목적인 이벤트
     ************************************************************************/
    oAPP.fn.fnWs10AppInputKeyDownEvent = function (event) {

        var bIsLock = sap.ui.getCore().isLocked();

        // zconsole.log(`bIsLock: ${bIsLock}`);

        if (bIsLock) {
            return;
        }

        var oAppInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppInput) {
            return;
        }

        // Application Name에 입력한 값을 구한다.
        var sAppValue = oAppInput.getValue(),
            iKeyCode = event.keyCode;

        switch (iKeyCode) {

            // Enter키를 누르면 Input의 Change 이벤트를 발생시킨다.
            case 13: // Enter

                // 이벤트 전파 방지
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();

                oAppInput.fireChange({
                    value: sAppValue
                });

                return;

            case 27: // 이상하게 esc만 누르면 F4 동작함. 그래서 이벤트 전파를 방지함.

                // 이벤트 전파 방지
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();

                return;

            case 35: // End

                // 이벤트 전파 방지
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();

                // 커서를 텍스트 맨 끝으로 보낸다.
                var sTxtLength = sAppValue.length;
                if (sTxtLength == 0) {
                    return;
                }

                var oInput = oAppInput.getInputElement();

                // Shift키를 눌렀다면
                if (event.shiftKey) {

                    var s = oInput.selectionStart,
                        e = oInput.selectionEnd;

                    oInput.setSelectionRange(e, sTxtLength, "forward");

                    return;

                }

                oInput.setSelectionRange(sTxtLength, sTxtLength);
                oInput.focus();

                return;

            case 36: // Home

                // 이벤트 전파 방지
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();

                // 커서를 텍스트 맨 처음으로 보낸다.
                var oInput = oAppInput.getInputElement();

                // Shift키를 눌렀다면
                if (event.shiftKey) {

                    var s = oInput.selectionStart,
                        e = oInput.selectionEnd;

                    oInput.setSelectionRange(0, s, "backward");

                    return;

                }

                oInput.setSelectionRange(0, 0);
                oInput.focus();

                return;

            default:

                if (iKeyCode != 115) {
                    return;
                }


        }

        // F4 Help를 띄운다
        oAppInput.fireChange({
            value: sAppValue
        });

        oAppInput.fireSearch();

    }; // end of oAPP.fn.fnWs10AppInputKeyDownEvent

    /************************************************************************
     * 10번 페이지 Application Name SearchField의 Doubble click Event
     * - 더블 클릭 시, 텍스트 블럭을 잡는 목적
     ************************************************************************/
    oAPP.fn.fnWs10AppInputdblclickEvent = (oEvent) => {

        var oAppInput = sap.ui.getCore().byId("AppNmInput"),
            oInput = oAppInput.getInputElement();

        if (!oAppInput || !oInput) {
            return;
        }

        var sValue = oAppInput.getValue();
        if (sValue == "") {
            return;
        }

        var iValueLength = sValue.length;

        oInput.setSelectionRange(0, iValueLength);

    }; // end of oAPP.fn.fnWs10AppInputdblclickEvent

    /************************************************************************
     * 20번 페이지 Header Toolbar Content
     ************************************************************************/
    oAPP.fn.fnGetHeaderToolbarContentWs20 = function () {

        let sChangeTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"), // Change
            sDispTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"), // Display
            sActiveTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B66"), // Activate,
            sInactTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B67"), // Inactivate   
            sUnknownTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B68"); // Unknown   

        var sBindRoot = "/WMENU/WS20";

        var oBackBtn = new sap.m.Button("backBtn", {
            icon: "sap-icon://nav-back",
            press: oAPP.events.ev_pageBack
        }),

            oAppIdTxt = new sap.m.Title({
                text: "{/WS20/APP/APPID}"
            }), // APPID

            oAppModeTxt = new sap.m.Title("appModeTxt").bindProperty("text", "/WS20/APP/IS_EDIT", function (IS_EDIT) {

                return IS_EDIT == "X" ? sChangeTxt : sDispTxt;

            }), // Change or Display Text	

            oAppActTxt = new sap.m.Title("appActTxt").bindProperty("text", {
                parts: [
                    "/WS20/APP/APPID",
                    "/WS20/APP/IS_EDIT",
                    "/WS20/APP/ACTST"
                ],
                formatter: (APPID, IS_EDIT, ACTST) => {

                    if (!APPID) {
                        return;
                    }

                    // 브라우저 타이틀을 구성한다.
                    let sModeTxt = IS_EDIT == "X" ? sChangeTxt : sDispTxt,
                        sActTxt = ACTST == "A" ? sActiveTxt : sInactTxt;

                    let sTitle = "U4A Workspace - ";
                    sTitle += `${APPID} ${sModeTxt} ${sActTxt}`;

                    // 브라우저 타이틀 변경
                    parent.CURRWIN.setTitle(sTitle);

                    // 윈도우 헤더 타이틀 변경
                    oAPP.common.setWSHeadText(sTitle);

                    switch (ACTST) {
                        case "A":
                            return sActTxt; // Active,

                        case "I":
                            return sInactTxt; // Inactive
                    }

                }

            }), // Activate or inactivate Text

            oFindBtn = new sap.m.Button("ws20_findBtn", {
                icon: "sap-icon://sys-find",
                press: oAPP.events.ev_pressFindBtn,
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A70") + " (Ctrl+F)", // Find UI (Ctrl+F)"
            }).addStyleClass("u4aWs20FindBtn"),

            oNewWin = new sap.m.Button("ws20_newWinBtn", {
                icon: "sap-icon://create",
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B71") + " (Ctrl+N)", // New Browser (Ctrl+N)",
                press: function () {
                    parent.onNewWindow();
                }
            }).addStyleClass("u4aWs20NewWin");


        return [

            oBackBtn, // Back Button

            oAppIdTxt, // APPID

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            oAppModeTxt, // Change or Display Text

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            oAppActTxt, // Activate or inactivate Text		

            new sap.m.ToolbarSpacer({
                width: "20px"
            }),

            oFindBtn, // Find Button

            oNewWin, // new window Button

        ];

    }; // end of oAPP.fn.fnGetHeaderToolbarContentWs20

    /************************************************************************
     * 20번 페이지 화면 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS20 = function () {

        var sFmsgBindRootPath = "/FMSG/WS20";

        /*****************************************************************************
         * 20번 상단 헤더 -- START
         *****************************************************************************/

        var aHeaderToolbarContents = oAPP.fn.fnGetHeaderToolbarContentWs20(),

            oToolHeader = new sap.tnt.ToolHeader({
                content: aHeaderToolbarContents
            }),

            /*****************************************************************************
             * 20번 상단 헤더 -- END
             *****************************************************************************/
            oSideNav = new sap.tnt.SideNavigation({

                // Properties
                expanded: true,

                // Aggregations
                item: new sap.tnt.NavigationList({
                    selectedKey: "{/WS20/SIDEMENU/SELKEY}",
                    expanded: true,
                    items: {
                        path: "/WS20/SIDEMENU/ITEMS",
                        template: new sap.tnt.NavigationListItem({
                            key: "{key}",
                            icon: "{icon}",
                            text: "{text}",
                            visible: "{visible}"
                        })
                    }
                }), // end of item

                fixedItem: new sap.tnt.NavigationList({
                    expanded: true,
                    items: {
                        path: "/WS20/SIDEMENU/FIXITM",
                        template: new sap.tnt.NavigationListItem({
                            key: "{key}",
                            icon: "{icon}",
                            text: "{text}",
                            visible: "{visible}"
                        })

                    }
                }), // end of fixedItem

                // Events
                itemSelect: oAPP.events.ev_pressSideNavMenu,

            }),

            // 이거를 차장님께 전달할 Page 임.
            oMainPage = oAPP.fn.fnOnInitRenderingWS20Main(),

            oToolPage = new sap.tnt.ToolPage({
                sideExpanded: false,
                header: oToolHeader,
                sideContent: oSideNav,
                mainContents: oMainPage
            }),

            oMsgFooter = new sap.m.OverflowToolbar({
                content: [
                    new sap.ui.core.Icon({
                        color: "{" + sFmsgBindRootPath + "/ICONCOLOR}",
                        src: "{" + sFmsgBindRootPath + "/ICON}"
                    }),
                    new sap.m.Text({
                        text: "{" + sFmsgBindRootPath + "/TXT}"
                    }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        type: sap.m.ButtonType.Reject,
                        press: APPCOMMON.fnHideFloatingFooterMsg
                    }),
                ]
            });

        // 20번 페이지 윈도우 메뉴 정보
        var sHMenuBindRoot = "/WMENU/WS20",
            aWMenu20 = oAPP.fn.fnGetWindowMenuWS20(),
            oMenuList = oAPP.fn.fnGetWindowMenuListWS20();

        oMenuList.HEADER = aWMenu20;

        APPCOMMON.fnSetModelProperty(sHMenuBindRoot, oMenuList);

        var oMenuUI = {};

        // WS20 페이지의 윈도우 메뉴 구성

        // Style Class
        oMenuUI.WMENU10 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU10",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                })
            }
        })      
        .addStyleClass("u4aWsWindowMenu");        

        // Utilities
        oMenuUI.WMENU20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU20",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                })
                .bindProperty("enabled", {
                    parts: [
                        "key",
                        "enabled"
                    ],
                    formatter: function(key, enabled){
        
                        switch (key) {
        
                            case "WMENU20_06":  // Version Management
        
                                var oAppInfo = parent.getAppInfo();

                                // APP 정보에 버전 정보가 있다면 메뉴를 비활성화 시킨다
                                if(typeof oAppInfo?.S_APP_VMS !== "undefined"){
                                    return false;
                                }
        
                                break;        
        
                            default:
                                return enabled;
        
                        }
        
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Edit
        oMenuUI.WMENU30 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU30",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    visible: "{visible}",
                    enabled: "{enabled}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                }).bindProperty("enabled", {
                    parts: [
                        "key",
                        "enabled"
                    ],
                    formatter: (key, enabled) => {

                        switch (key) {

                            case "WMENU30_05": // skeleton Scr Setting Menu

                                var oAppInfo = parent.getAppInfo();
                                if (oAppInfo == null) {
                                    return enabled;
                                }

                                var IS_EDIT = oAppInfo.IS_EDIT;

                                if (IS_EDIT !== "X") {
                                    return false;
                                }

                                return true;

                            default:
                                return enabled;
                        }

                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // System
        oMenuUI.WMENU40 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU40",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Help
        oMenuUI.WMENU50 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/WMENU50",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        // Test
        oMenuUI.Test20 = new sap.m.Menu({
            itemSelected: oAPP.events.ev_pressWmenuItemWS20,
            items: {
                path: sHMenuBindRoot + "/Test20",
                template: new sap.m.MenuItem({
                    key: "{key}",
                    text: "{text}",
                    icon: "{icon}",
                    enabled: "{enabled}",
                    visible: "{visible}",
                    items: {
                        path: "items",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{key}",
                            text: "{text}",
                            icon: "{icon}",
                            enabled: "{enabled}",
                            visible: "{visible}",
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsWindowMenu");

        var oHH = new sap.m.HBox({
            items: [
                oMenuUI.WMENU10,
                oMenuUI.WMENU20,
                oMenuUI.WMENU30,
                oMenuUI.WMENU40,
                oMenuUI.WMENU50,
                oMenuUI.Test20
            ]
        });

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            WMENU: APPCOMMON.fnGetModelProperty("/WMENU")
        });

        oHH.setModel(oJsonModel);

        oAPP.wmenu.WS20 = oMenuUI;

        return new sap.m.Page("WS20", {
            showHeader: true,
            enableScrolling: false,
            customHeader: new sap.m.OverflowToolbar({
                content: [
                    new sap.m.HBox({
                        items: {
                            path: sHMenuBindRoot + "/HEADER",
                            template: new sap.m.Button({
                                text: "{text}",
                                press: oAPP.events.ev_pressWMenu20
                            }).bindProperty("visible", {
                                parts: [
                                    "key",
                                    "/WS20/APP/S_APP_VMS"
                                ],
                                formatter: function (sKey, S_APP_VMS) {

                                    if (sKey == null) {
                                        return false;
                                    }

                                    /**
                                     * APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 일부 메뉴를 숨긴다.
                                     * - 대상: 
                                     * 1. CSS 스타일 클래스
                                     * 2. 유틸리티
                                     * 3. 시스템
                                     */                                    
                                    if(typeof S_APP_VMS !== "undefined"){

                                        switch (sKey) {
                                            case "WMENU10": // CSS 스타일 클래스
                                            case "WMENU20": // 유틸리티
                                            case "WMENU40": // 시스템
                                                
                                                return false;
                                        
                                            default:
                                                break;
                                        }

                                        // return false;
                                    }

                                    if (sKey !== "Test20") {
                                        return true;
                                    }

                                    // U4A R&D 일 경우에만 Test Menu를 보여준다.
                                    var bIsStaff = oAPP.fn.fnIsStaff();
                                    if (!bIsStaff) {
                                        return false;
                                    }

                                    return true;

                                }
                            })
                        }
                    }),

                    new sap.m.ToolbarSpacer(),

                    // 상단 공통 헤더 버튼
                    APPCOMMON.fnGetCommonHeaderButtons()

                ] // end of custom header content

            }).addStyleClass("sapTntToolHeader u4aWsWindowMenuToolbar"),

            content: [
                oToolPage
            ], // end of page content

            floatingFooter: true,
            footer: oMsgFooter,

        }).bindProperty("showFooter", {
            parts: [
                sFmsgBindRootPath + "/ISSHOW"
            ],
            formatter: function (isshow) {

                if (isshow == null) {
                    return false;
                }

                if (typeof isshow !== "boolean") {
                    return false;
                }

                return isshow;
            }
        }).addStyleClass("u4aWs20Page");

    }; // end of oAPP.fn.fnOnInitRenderingWS20

    /************************************************************************
     * 20번 페이지 Sub Header Toolbar
     ************************************************************************/
    oAPP.fn.fnGetSubHeaderToolbarContentWs20 = function () {

        // visible 바인딩 프로퍼티 설정
        function lf_bindPropForVisible(bIsDispMode) {

            if (bIsDispMode == null) {
                return false;
            }

            var sId = this.getId(),
                bIsDisp = (bIsDispMode == "X" ? true : false);

            switch (sId) {
                case "changeModeBtn":
                    return !bIsDisp;

                default:
                    return bIsDisp;
            }

        } // end of lf_bindPropForVisible

        let sDispChgTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05") + " <--> "; // Display
            sDispChgTxt += APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02") + " (Ctrl+F1)"; // Change

        var sVisiBindPath = "/WS20/APP/IS_EDIT";

        var oSyntaxCheckBtn = new sap.m.Button("syntaxCheckBtn", {
            icon: "sap-icon://validate",
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B72") + " (Ctrl+F2)", // Syntax Check (Ctrl+F2)
            press: oAPP.events.ev_pressSyntaxCheckBtn
        });

        oSyntaxCheckBtn.addStyleClass("u4aWs20SyntaxCheckBtn");

        oSyntaxCheckBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
                sVisiBindPath
            ],
            formatter: function(S_APP_VMS, IS_EDIT){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return lf_bindPropForVisible.call(this, IS_EDIT);           

            }
        });

        var oDisplayModeBtn = new sap.m.Button("displayModeBtn", {
            icon: "sap-icon://display",
            tooltip: sDispChgTxt,
            press: oAPP.events.ev_pressDisplayModeBtn
        });

        oDisplayModeBtn.addStyleClass("u4aWs20DisplayModeBtn");

        oDisplayModeBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
                sVisiBindPath
            ],
            formatter: function(S_APP_VMS, IS_EDIT){

                // APP 정보에 버전 관리 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return lf_bindPropForVisible.call(this, IS_EDIT); 
            }
        });

        var oChangeModeBtn = new sap.m.Button("changeModeBtn", {
            icon: "sap-icon://edit",
            tooltip: sDispChgTxt,
            press: oAPP.events.ev_pressDisplayModeBtn
        });

        oChangeModeBtn.bindProperty("visible", {
            parts: [
                "/USERINFO/USER_AUTH/IS_DEV",   // 개발자 권한 여부
                "/USERINFO/ISADM",
                "/WS20/APP/ADMIN_APP",          // "ADMIN App 여부"
                sVisiBindPath,
                "/WS20/APP/S_APP_VMS"
            ],
            formatter: (IS_DEV, ISADM, ADMIN_APP, IS_EDIT, S_APP_VMS) => {

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                if (IS_DEV !== "D") {
                    return false;
                }

                // Admin이 아닌 유저가 Admin App을 열었을 경우 버튼 비활성화
                if (ISADM !== "X" && ADMIN_APP === "X") {
                    return false;
                }

                let bIsDisp = (IS_EDIT === "X" ? true : false);

                return !bIsDisp;

            }
        }).addStyleClass("u4aWs20ChangeModeBtn");

        var oActivateBtn = new sap.m.Button("activateBtn", {
            icon: "sap-icon://activate",                
            press: oAPP.events.ev_pressActivateBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B73") + " (Ctrl+F3)", // Activate (Ctrl+F3)
        });

        oActivateBtn.addStyleClass("u4aWs20ActivateBtn");

        oActivateBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
                sVisiBindPath
            ],
            formatter: function(S_APP_VMS, IS_EDIT){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return lf_bindPropForVisible.call(this, IS_EDIT); 
            }

        });

        var oSaveBtn = new sap.m.Button("saveBtn", {
            icon: "sap-icon://save",                
            press: oAPP.events.ev_pressSaveBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64") + " (Ctrl+S)", // Save (Ctrl+S)
        });

        oSaveBtn.addStyleClass("u4aWs20SaveBtn");

        oSaveBtn.bindProperty("visible", {
            parts: [
                "/USERINFO/USER_AUTH/IS_DEV",
                sVisiBindPath,
                "/WS20/APP/S_APP_VMS",
            ],
            formatter: (IS_DEV, IS_EDIT, S_APP_VMS) => {

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                if (IS_DEV !== "D" || IS_EDIT !== "X") {
                    return false;
                }

                return true;
            }
        });        

        var oMimeBtn = new sap.m.Button("mimeBtn", {
                icon: "sap-icon://picture",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A10"), // MIME Repository                
                press: oAPP.events.ev_pressMimeBtn,
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A10") + " (Ctrl+Shift+F12)", // MIME Repository (Ctrl+Shift+F12)
            }).addStyleClass("u4aWs20MimeBtn"),

            oControllerBtn = new sap.m.Button("controllerBtn", {
                icon: "sap-icon://developer-settings",
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A11"), // Controller (Class Builder)                
                press: oAPP.events.ev_pressControllerBtn,
                tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C38") + " (Ctrl+F12)", // Controller (Ctrl+F12)
            }).addStyleClass("u4aWs20ControllerBtn");

        var oAppExecBtn = new sap.m.Button("ws20_appExecBtn", {
            icon: "sap-icon://internet-browser",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06"), // Application Execution                
            press: oAPP.events.ev_pressAppExecBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A06") + " (F8)", // Application Execution (F8)
        });

        oAppExecBtn.addStyleClass("u4aWs20AppExecBtn");

        oAppExecBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
            ],
            formatter: function(S_APP_VMS){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return true;

            }
        });


        var oMobileBtn = new sap.m.Button("ws20_multiPrevBtn", {
            icon: "sap-icon://desktop-mobile",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08"), // App Multi Preview                
            press: oAPP.events.ev_pressMultiPrevBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A08") + " (Ctrl+F5)", // App Multi Preview (Ctrl+F5)
        });

        oMobileBtn.addStyleClass("u4aWs20MultiPrevBtn");

        oMobileBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
            ],
            formatter: function(S_APP_VMS){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return true;

            }
        });

        var oIconListBtn = new sap.m.Button("iconListBtn", {
            icon: "sap-icon://activity-items",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A12"), // Icon List                
            press: oAPP.events.ev_pressIconListBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A12") + " (Ctrl+Shift+F10)", // Icon List (Ctrl+Shift+F10)
        });

        oIconListBtn.addStyleClass("u4aWs20IconListBtn");

        oIconListBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
            ],
            formatter: function(S_APP_VMS){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return true;

            }
        });

        var oIconCollection = new sap.m.MenuButton({
                icon: "sap-icon://u4a-fw-regular/Face Grin Wide",
                text: "{/WSLANGU/ZMSG_WS_COMMON_001/068}", // Icon Viewer
                tooltip: "{/WSLANGU/ZMSG_WS_COMMON_001/068}", // Icon Viewer
                menu: [
                    new sap.m.Menu("iconCollBtn", {
                        itemSelected: oAPP.events.ev_PressIconCollectBtn,
                        items: [
                            new sap.m.MenuItem("iconListMenuItem", {
                                key: "M1",
                                icon: "sap-icon://u4a-fw-solid/Icons",
                                text: "{/WSLANGU/ZMSG_WS_COMMON_001/047}", // Icon List                                
                                tooltip: "{/WSLANGU/ZMSG_WS_COMMON_001/047}" + " (Ctrl+Shift+F10)", // Icon List (Ctrl+Shift+F10)
                            }),
                            new sap.m.MenuItem({
                                key: "M2",
                                icon: "sap-icon://u4a-fw-solid/Image",
                                text: "{/WSLANGU/ZMSG_WS_COMMON_001/067}", // Image Icons
                                tooltip: "{/WSLANGU/ZMSG_WS_COMMON_001/067}", // Image Icons
                            })
                        ]

                    })
                ]

            });

        var oAddEventBtn = new sap.m.Button("addEventBtn", {
            icon: "sap-icon://touch",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A13"), // Add Event Method
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A13") + " (Shift+F1)", // Add Event Method (Shift+F1)
            press: oAPP.events.ev_pressAddEventBtn
        });

        oAddEventBtn.addStyleClass("u4aWs20AddEventBtn");

        oAddEventBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS",
                sVisiBindPath
            ],
            formatter: function(S_APP_VMS, IS_EDIT){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return lf_bindPropForVisible.call(this, IS_EDIT); 
            }

        });            

        var oRuntimeBtn = new sap.m.Button("runtimeBtn", {
            icon: "sap-icon://functional-location",
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A14"), // Runtime Class Navigator
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A14"), // Runtime Class Navigator (F9)
            press: oAPP.events.ev_pressRuntimeBtn
        });
        
        oRuntimeBtn.addStyleClass("u4aWs20RuntimeBtn");

        oRuntimeBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS"
            ],
            formatter: function(S_APP_VMS){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return true;

            }
        });

        var oBindPopupBtn = new sap.m.Button("bindPopupBtn", {
            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A15"), // Binding Popup
            icon: "sap-icon://connected",
            press: oAPP.events.ev_pressBindPopupBtn,
            tooltip: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A15"), // Binding Popup

        });
        
        oBindPopupBtn.addStyleClass("u4aWs20bindPopupBtn");

        oBindPopupBtn.bindProperty("visible", {
            parts: [
                "/WS20/APP/S_APP_VMS"
            ],
            formatter: function(S_APP_VMS){

                // APP 정보에 버전 정보가 있다면 View 용으로 만들어야 하기 때문에 버튼을 숨긴다.
                if(typeof S_APP_VMS !== "undefined"){
                    return false;
                }

                return true;

            }
        });


        // WS 버전에 따른 아이콘 리스트 버튼 
        let oIconList = oIconListBtn;
        if (oAPP.common.checkWLOList("C", "UHAK900630")) {
            oIconList = oIconCollection;
        }

        return [

            oDisplayModeBtn, // Display Button
            oChangeModeBtn, // Change Button

            new sap.m.ToolbarSeparator()
                .bindProperty("visible", {
                    parts: [{
                        path: "/USERINFO/USER_AUTH/IS_DEV" // 개발자 권한 여부
                    },
                    {
                        path: "/USERINFO/ISADM"
                    },
                    {
                        path: "/WS20/APP/ADMIN_APP" // "ADMIN App 여부"
                    },
                    {
                        path: sVisiBindPath
                    },

                    ],
                    formatter: (IS_DEV, ISADM, ADMIN_APP) => {

                        // 개발자 권한이 없거나 edit 모드가 아닌 경우 비활성화
                        if (IS_DEV !== "D") {
                            return false;
                        }

                        // Admin이 아닌 유저가 Admin App을 열었을 경우 버튼 비활성화
                        if (ISADM !== "X" && ADMIN_APP === "X") {
                            return false;
                        }

                        return true;

                    }
                }),
            // .bindProperty("visible", "/USERINFO/USER_AUTH/IS_DEV", (IS_DEV) => {

            //     if (IS_DEV == "D") {
            //         return true;
            //     }

            //     return false;

            // }),

            oSyntaxCheckBtn, // syntax Check Button
            oActivateBtn, // Activate Button                    

            oSaveBtn, // Save Button
            oMimeBtn, // MIME Button
            oControllerBtn, // Controller Button
            oAppExecBtn, // Application Execution Button
            oMobileBtn, // App Multi Preview Button

            oIconList, // Icon List Button

            oAddEventBtn, // Add Server Event Button
            oRuntimeBtn, // Runtime Class Navigator Button
            oBindPopupBtn, // Binding Popup Button

        ];

    }; // end of oAPP.fn.fnGetSubHeaderToolbarContentWs20

    /************************************************************************
     * 20번 페이지 Tnt Tool page 의 main contents 영역 그리기
     ************************************************************************/
    oAPP.fn.fnOnInitRenderingWS20Main = function () {

        /**
         * Transaction Buttons
         */
        var aSubHeaderToolbarContents = oAPP.fn.fnGetSubHeaderToolbarContentWs20();

        var oToolHeader = new sap.m.OverflowToolbar({
            content: aSubHeaderToolbarContents
            // }).addStyleClass("u4aWs20_HeaderToolbar sapTntToolHeader");
        }).addStyleClass("u4aWs20_HeaderToolbar");

        return new sap.m.Page("WS20_MAIN", {
            customHeader: oToolHeader,
            content: [
                // oSplitter
            ],
        }).addStyleClass("u4aWs20MainPage");

    }; // end of oAPP.fn.fnOnInitRenderingWS20Main

    /************************************************************************
     * Personalization Settings..(개인화 설정)
     ************************************************************************/
    oAPP.fn.fnOnInitP13nSettings = function () {

        // 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
        oAPP.fn.fnOnP13nFolderCreate();

        // 브라우저 zoom 정보 생성
        oAPP.fn.fnOnP13nBrowserZoom();

        // Default Browser 개인화 설정
        oAPP.fn.fnOnP13nExeDefaultBrowser();

        // WS10 페이지 APP Name Input의 Suggestion 기능 설정
        oAPP.fn.fnGetP13nWs10AppSuggetion();

        // Tcode Suggestion Setting
        oAPP.fn.fnOnInitTCodeSuggestion(); // #[ws_fn_04.js] 

    }; // end of oAPP.fn.fnOnInitP13nSettings

    /************************************************************************
     * 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
     ************************************************************************/
    oAPP.fn.fnOnP13nFolderCreate = function () {

        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보		
        var oUserInfo = parent.getUserInfo(),
            sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로
            sP13nPath = parent.getPath("P13N"), // P13N.json 파일 경로
            bIsExists = FS.existsSync(sP13nPath); // P13N.json 파일 유무 확인.        

        // 파일이 있을 경우
        if (bIsExists) {

            // 파일이 있을 경우.. 파일 내용을 읽어본다.	
            var sSavedData = FS.readFileSync(sP13nPath, 'utf-8'),
                oSavedData = JSON.parse(sSavedData);

            if (oSavedData == "") {
                oSavedData = {};
            }

            // 파일 내용에 SYSTEM 아이디의 정보가 있으면 리턴.
            if (oSavedData[sSysID]) {
                return;
            }

            // 없으면 개인화 영역 Object 생성 후 Json 파일에 저장
            oSavedData[sSysID] = {};

            FS.writeFileSync(sP13nPath, JSON.stringify(oSavedData));

            return;
        }

        // 로그인 사용자의 개인화 정보가 없을 경우 
        var oP13N_data = {};
        oP13N_data[sSysID] = {};

        // P13N 폴더가 없으면 폴더부터 생성 		
        if (!FS.existsSync(sP13nfolderPath)) {
            FS.mkdirSync(sP13nfolderPath);
        }

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(oP13N_data));

    }; // end of oAPP.fn.fnOnP13nFolderCreate

    /************************************************************************
     * 브라우저 zoom 정보 생성
     ************************************************************************/
    oAPP.fn.fnOnP13nBrowserZoom = function () {

        var sZoomFileName = PATH.join(USERDATA, "p13n", "zoom.json"), // zoom 파일 경로
            oZoomData = parent.require(sZoomFileName);

        if (oZoomData == "") {
            oAPP.fn.setPersonWinZoom("S");
            return;
        }

        // zoom.json에 저장된 zoom 정보를 현재 브라우저에 설정한다.
        oAPP.fn.setPersonWinZoom("R");

    }; // end of oAPP.fn.fnOnP13nBrowserZoom

    /************************************************************************
     * 브라우저 zoom 정보 읽기 or 저장
     ************************************************************************/
    oAPP.fn.setPersonWinZoom = (act) => {

        var sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로
            sZoomFileName = "zoom.json",
            sPath = PATH.join(sP13nfolderPath, sZoomFileName);

        switch (act) {
            case "R": // 저장된 zoom 정보 읽기

                // var sData = parent.require(sPath);
                var sData = FS.readFileSync(sPath, 'utf-8');
                sData = JSON.parse(sData);

                if (typeof sData === "undefined") {
                    return;
                }

                WEBFRAME.setZoomLevel(sData.zoom);

                break;

            case "S": // zoom 정보 저장

                var sData = {
                    zoom: WEBFRAME.getZoomLevel()
                };

                FS.writeFileSync(sPath, JSON.stringify(sData), 'utf-8');

                break;

        }

    }; // end of oAPP.fn.setPersonWinZoom

    /************************************************************************
     * 사용자 개인화(윈도우 ZOOM) 설정팝업 
     ************************************************************************/
    oAPP.fn.setWinZoomPopup = (PUI) => {

        if (typeof oAPP.fn.setWinZoomPopup.oPOP !== "undefined") {
            oAPP.fn.setWinZoomPopup.oPOP.openBy(PUI);
            return;
        };

        var oSilder = new sap.m.Slider({
            min: -5,
            max: 5,
            step: 0.1,
            change: (e) => {

                if (typeof e.oSource !== "object") {
                    return;
                }

                WEBFRAME.setZoomLevel(e.oSource.getValue());

            }
        });

        oAPP.fn.setWinZoomPopup.oPOP = new sap.m.Popover({
            showHeader: false,
            placement: "Auto",
            contentWidth: "200px",
            afterOpen: (e) => {

                var oSlider = e.oSource.mAggregations.content[0];

                oSilder.setValue(WEBFRAME.getZoomLevel());

                e.oSource.focus();

            },
            beforeClose: (e) => {

                // zoom 정보를 저장한다.
                oAPP.fn.setPersonWinZoom("S");

            }
        });

        oAPP.fn.setWinZoomPopup.oPOP.addContent(oSilder);
        oAPP.fn.setWinZoomPopup.oPOP.openBy(PUI);

    }; // end of oAPP.fn.setWinZoomPopup

    /************************************************************************
     * 사용자 개인화(윈도우 ZOOM) 설정팝업 
     ************************************************************************/
    oAPP.fn.setBrowserZoomZero = function () {

        WEBFRAME.setZoomLevel(0);

        zconsole.log("setBrowserZoomZero");

        // 현재 페이지 별 동작 정의
        let sCurrPage = parent.getCurrPage();
        switch (sCurrPage) {

            // USP 일 경우 에디터 영역의 폰트 크기를 기본값으로 지정한다.
            case "WS30":

                let oDefaultFontBtn = sap.ui.getCore().byId("editorDefaultFontBtn");
                if(oDefaultFontBtn){
                    oDefaultFontBtn.firePress();
                }
                
                break;
        
            default:
                break;
        }


    }; // end of oAPP.fn.setBrowserZoomZero

    /************************************************************************
     * 개인화 정보를 읽어서 WS10 페이지의 APP Name Input에 Suggestion 설정하기
     ************************************************************************/
    oAPP.fn.fnGetP13nWs10AppSuggetion = function () {

        var FS = parent.FS;

        // 서버 접속 정보
        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보
        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        // 개인화 정보 중, APPID의 Suggestion 정보가 있는지 확인한다.	
        if (!oP13nData[sSysID].APPSUGG) {
            return;
        }

        APPCOMMON.fnSetModelProperty("/WS10/APPSUGG", oP13nData[sSysID].APPSUGG);

    }; // end of oAPP.fn.fnGetP13nWs10AppSuggetion

    /************************************************************************
     * 입력한 APPID를 개인화 데이터로 저장
     ************************************************************************/
    oAPP.fn.fnSetP13nWs10AppSuggetion = function (APPID) {

        var FS = parent.FS;

        // 서버 접속 정보
        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // 로그인 유저 정보
        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData),

            aAppSugg = oP13nData[sSysID].APPSUGG;

        // 개인화 정보 중, Default Browser 정보가 있는지 확인한다.	
        if (!aAppSugg) {

            aAppSugg = [{
                key: APPID,
                text: APPID
            }];

        } else {

            aAppSugg.push({
                key: APPID,
                text: APPID
            });

        }

        // 실행 브라우저 정보를 모델에 set 하기..
        APPCOMMON.fnSetModelProperty("/APPSUGG", aAppSugg);

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(aAppSugg));

    }; // end of oAPP.fn.fnSetP13nWs10AppSuggetion    

    /************************************************************************
     * Default Browser 개인화 설정
     ************************************************************************/
    oAPP.fn.fnOnP13nExeDefaultBrowser = function () {

        var FS = parent.FS;

        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // // 로그인 유저 정보
        // var oUserInfo = parent.getUserInfo(),
        //     sUserId = oUserInfo.ID.toUpperCase();

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData),

            // 현재 Local PC에 설치된 Browser 정보 (!! 항상 기준이 되는 데이터 !!)
            aCurrBrowsInfos = oAPP.fn.fnGetExecBrowserInfo();

        // 개인화 정보 중, Default Browser 정보가 있는지 확인한다.	
        if (!oP13nData[sSysID].DEFBR) {

            // 없으면 생성
            oP13nData[sSysID].DEFBR = aCurrBrowsInfos;

        } else {

            // 있으면 이전 저장된 Default Browser 정보와 현재 PC에 설치된 Browser 정보를 비교한 후
            // Default Browser 정보를 갱신한다.
            var aNewInfo = oAPP.fn.fnCompareBeforeBrowserInfo(oP13nData[sSysID].DEFBR, aCurrBrowsInfos);

            oP13nData[sSysID].DEFBR = aNewInfo;

        }

        // 실행 브라우저 정보를 모델에 set 하기..
        APPCOMMON.fnSetModelProperty("/DEFBR", oP13nData[sSysID].DEFBR, true);

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

    }; // end of oAPP.fn.fnOnP13nExeDefaultBrowser

    /************************************************************************
     * 현재 Local PC에 설치된 Browser 정보 구하기
     ************************************************************************/
    oAPP.fn.fnGetExecBrowserInfo = function () {

        var aBrowserInfo = [],
            aDefaultBrowsInfo = parent.getDefaultBrowserInfo(),
            iBrowsCnt = aDefaultBrowsInfo.length;

        var FS = parent.FS;

        // 선택된 브라우저 여부 flag
        var isSelected = false;

        // 브라우저가 실제로 Local PC에 있는지 여부 체크
        for (var i = 0; i < iBrowsCnt; i++) {

            var oBrowsStatus = {},
                oBrows = aDefaultBrowsInfo[i];

            oBrowsStatus.NAME = oBrows.NAME;
            oBrowsStatus.DESC = oBrows.DESC;
            oBrowsStatus.APP_MODE = oBrows.APP_MODE;

            // 브라우저 설치 유무 확인
            var bIsExist = false;

            if (oBrows.INSPATH) {

                oBrowsStatus.INSPATH = oBrows.INSPATH;

                bIsExist = FS.existsSync(oBrows.INSPATH);

            }

            oBrowsStatus.ENABLED = bIsExist;

            // 브라우저가 설치 되있고, 선택된 브라우저가 없다면..
            if (bIsExist && !isSelected) {

                // 설치된 브라우저 정보 기준으로 가장 최근의 브라우저 정보를 자동선택 한다.
                isSelected = true;

                oBrowsStatus.SELECTED = isSelected;

                aBrowserInfo.push(oBrowsStatus);

                continue;
            }

            oBrowsStatus.SELECTED = false;

            aBrowserInfo.push(oBrowsStatus);

        }

        return aBrowserInfo;

    }; // end of oAPP.fn.fnGetExecBrowserInfo

    /************************************************************************
     * 기 저장된 Default Browser 와, 현재 Local PC에 설치된 브라우저의 정보를 비교한다.
     * **********************************************************************
     * @param {Array} aBeforeInfo  
     * - 기 저장된 Default Browser 정보
     * @param {Array} aCurrentInfo 
     * - 현재 Local PC에 설치된 브라우저의 정보
     ************************************************************************/
    oAPP.fn.fnCompareBeforeBrowserInfo = function (aBeforeInfo, aCurrentInfo) {

        var iBeforeCnt = aBeforeInfo.length,
            iCurrCnt = aCurrentInfo.length;

        var oBeforeSelected;

        // 기 저장된 정보 중, 기본브라우저로 설정한 Browser 정보를 구한다. 
        for (var i = 0; i < iBeforeCnt; i++) {

            var oBeforeBrows = aBeforeInfo[i];

            // 기 저장한 기본 브라우저면서 그 브라우저가 실제로 local PC에 설치가 되어 있을 경우..
            if (oBeforeBrows.SELECTED && oBeforeBrows.INSPATH) {

                let oFound = aCurrentInfo.find(elem => elem.NAME == oBeforeBrows.NAME);
                if (!oFound) {
                    continue;
                }

                if (!oFound.ENABLED) {
                    continue;
                }

                // 이전에 선택된 브라우저 정보를 저장한다
                oBeforeSelected = oBeforeBrows;

                break;
            }

        }

        var aNewInfo = [];

        // 현재 설치된 Browser의 정보를 분석
        for (var j = 0; j < iCurrCnt; j++) {

            var oCurrBrows = aCurrentInfo[j];

            if(aBeforeInfo && Array.isArray(aBeforeInfo) === true && aBeforeInfo.length !== 0){

                // 추가 필드 동기화..
                let oFind = aBeforeInfo.find(e => e.NAME === oCurrBrows.NAME);
                if(oFind){
                    oCurrBrows.APP_MODE = oFind.APP_MODE;
                }

            }

            /**
             * 위에서 구한 SELECTED 된 Browser 정보가 없으면..
             */
            if (!oBeforeSelected) {

                // 설치되지 않은 브라우저는 skip.
                if (!oCurrBrows.ENABLED) {
                    continue;
                }

                // SELECTED 된 Browser 정보가 없으면
                // 설치된 브라우저 기준으로
                // 가장 첫번째 브라우저를 자동으로 선택해준다.
                oCurrBrows.SELECTED = true;

                aNewInfo = aCurrentInfo;

                break;
            }

            /**
             * 위에서 구한 SELECTED 된 Browser 정보가 있다면..
             */

            // SELECTED 된 Browser명을 비교하여 이름이 다르면..
            if (oBeforeSelected.NAME != oCurrBrows.NAME) {

                // SELECTED = false 정보와 함께 데이터 수집.
                oCurrBrows.SELECTED = false;

                aNewInfo.push(oCurrBrows);

                continue;

            }

            // SELECTED 된 Browser명을 비교하여 이름이 같다면
            // 선택되었다는 의미의 SELECTED 필드에 true를 입력 후 데이터 수집
            oCurrBrows.SELECTED = true;
            aNewInfo.push(oCurrBrows);

        }

        if (aNewInfo.length == 0) {
            return aCurrentInfo;
        }

        // 선택된 브라우저가 그래도 없다면 첫번째 브라우저를 선택
        // 크롬, 엣지, IE 순
        let oSelectedBrowser = aNewInfo.find(elem => elem.SELECTED === true);
        if (!oSelectedBrowser) {
            aNewInfo[0].SELECTED = true;
        }

        return aNewInfo;

    }; // end of oAPP.fn.fnCompareBeforeBrowserInfo    

})(window, $, oAPP);