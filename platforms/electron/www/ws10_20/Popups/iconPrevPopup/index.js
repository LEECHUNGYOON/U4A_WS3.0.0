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
    USP_UTIL = parent.require(PATHINFO.USP_UTIL),
    CURRWIN = REMOTE.getCurrentWindow();

var zconsole = WSERR(window, document, console);

let oAPP = parent.oAPP;
if (!oAPP) {
    oAPP = {};
    oAPP.attr = {};
    oAPP.fn = {};
    oAPP.msg = {};
}

(async function(window, oAPP) {
    "use strict";

    let FS = require("fs-extra");

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

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = async function() {

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
        oScript.setAttribute("data-sap-ui-libs", "sap.m");
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

        oScript.onload = () => {

            oAPP.fn.attachInit();

        };

    }; // end of fnLoadBootStrapSetting 

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function() {



    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function() {

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
                            src: PATH.join(APPPATH, "img", "logo.png")
                        }),
                        new sap.m.Title({
                            text: "Icon List"
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.MenuButton("hdMenuBtn",{
                            text: "SAP Icons",
                            menu: new sap.m.Menu({                                
                                items: [
                                    new sap.m.MenuItem({
                                        key: "SAP",
                                        text : "SAP Icons"
                                    }),
                                    new sap.m.MenuItem({
                                        key: "U4A",
                                        text : "U4A Icons"
                                    }),
                                ]
                            })
                        }),
                        // new sap.m.Select({
                        //     selectedKey: "SAP",
                        //     items: [
                        //         new sap.ui.core.Item({
                        //             key: "SAP",
                        //             text: "SAP ICONS"
                        //         }),
                        //         new sap.ui.core.Item({
                        //             key: "U4A",
                        //             text: "U4A ICONS"
                        //         }),
                        //     ]
                        // }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://less",
                            press: function() {

                                CURRWIN.minimize();

                            }
                        }),
                        new sap.m.Button("maxWinBtn", {
                            icon: "sap-icon://header",
                            press: function(oEvent) {

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
                            press: function() {

                                CURRWIN.close();

                            }
                        }),
                    ]
                }),
                // new sap.m.Bar({
                //     titleAlignment: "Center",
                //     contentLeft: [
                //         new sap.m.Image({
                //             src: PATH.join(APPPATH, "img", "logo.png")
                //         }),
                //         new sap.m.Title({
                //             text: "Icon List"
                //         }),                    
                //     ],
                //     contentMiddle: [
                //         new sap.m.Select({
                //             selectedKey: "SAP",
                //             items: [
                //                 new sap.ui.core.Item({
                //                     key: "SAP",
                //                     text: "SAP ICONS"
                //                 }),
                //                 new sap.ui.core.Item({
                //                     key: "U4A",
                //                     text: "U4A ICONS"
                //                 }),
                //             ]
                //         })
                //     ],
                //     contentRight: [
                //         new sap.m.Button({
                //             icon: "sap-icon://less",
                //             press: function() {

                //                 CURRWIN.minimize();

                //             }
                //         }),
                //         new sap.m.Button("maxWinBtn", {
                //             icon: "sap-icon://header",
                //             press: function(oEvent) {

                //                 let bIsMax = CURRWIN.isMaximized();

                //                 if (bIsMax) {
                //                     CURRWIN.unmaximize();
                //                     return;
                //                 }

                //                 CURRWIN.maximize();

                //             }
                //         }),
                //         new sap.m.Button({
                //             icon: "sap-icon://decline",
                //             press: function() {

                //                 CURRWIN.close();

                //             }
                //         }),
                //     ]
                // }).addStyleClass("u4aWsBrowserDraggable"),

            }).addStyleClass("");

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering

    /************************************************************************
     * WS 글로벌 메시지 목록 구하기
     ************************************************************************/
    oAPP.fn.getWsMessageList = function() {

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

    /**
     * UI5 Attach Init
     */
    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(async function() {

            oAPP.setBusy("X");

            await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

            oAPP.fn.fnInitRendering();

            oAPP.fn.fnInitModelBinding();

            /**
             * 무조건 맨 마지막에 수행 되어야 함!!
             */
            // 자연스러운 로딩
            sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, function() {

                if (!oAPP.attr.UIUpdated) {

                    setTimeout(() => {
                        $('#content').fadeIn(300, 'linear');
                    }, 300);

                    oAPP.attr.UIUpdated = "X";

                    oAPP.setBusy("");

                }

            });

        });

    };

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

})(window, oAPP);