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
    WSUTIL = require(WSMSGPATH);

var zconsole = WSERR(window, document, console);

let oAPP = parent.oAPP;
if (!oAPP) {
    oAPP = {};
    oAPP.ui = {};
    oAPP.attr = {};
    oAPP.fn = {};
    oAPP.msg = {};
}

(async function (window, oAPP) {
    "use strict";

    let FS = require("fs-extra");

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


    oAPP.fn.waiting = function(iTime = 0){

        return new Promise(function(resolve){

            setTimeout(function(){
                resolve();

            }, iTime);

        });

    };

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

        // // WS Global Setting의 Language 설정 값
        // let sWsLangu = await WSUTIL.getWsLanguAsync(),
        //     sWsTheme = await WSUTIL.getWsThemeAsync();

        var oSettings = WSUTIL.getWsSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            oBootStrap = oSetting_UI5.bootstrap,
            oThemeInfo = oAPP.fn.getThemeInfo();
            // oThemeInfo = oAPP.attr.oThemeInfo;
            // sTheme = oSettings.globalTheme,
            // sLangu = oSettings.globalLanguage;
        let oUserInfo = parent.process.USERINFO;
        let sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.codeeditor, sap.ui.table, sap.ui.layout");
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

        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel) {
            oCoreModel.setProperty("/", {});
        }

        // WS Setting 정보
        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            oPath = oSettings.path;

        try {

            var sDefPattJson = FS.readFileSync(oPath.DEF_PATT, 'utf-8'), // Usp 기본 패턴
                sCustPattJson = FS.readFileSync(oPath.CUST_PATT, 'utf-8'); // Usp 커스텀 패턴

        } catch (error) {

            let sMsg = error.toString() + " \n\n ";
            sMsg += "Source Pattern File Not Found!!"

            throw new Error(sMsg);

        }

        let aDefPattJson,
            aCustPattJson;

        try {
            aDefPattJson = JSON.parse(sDefPattJson);
            aCustPattJson = JSON.parse(sCustPattJson);
        } catch (error) {
            throw new Error(error);
        }

        var oJsonModel = new sap.ui.model.json.JSONModel(),
            oData = {
                CUST_CR_DLG: {}, // Custom Pattern 생성 팝업 모델                
                CONTENT: {},
                DEF_PAT: aDefPattJson,
                CUS_PAT: aCustPattJson
            };

        if (oCoreModel == null) {

            sap.ui.getCore().setModel(oJsonModel);
            oJsonModel.setData(oData);

            parent.WSUTIL.parseArrayToTree(oJsonModel, "DEF_PAT", "CKEY", "PKEY", "DEF_PAT");
            parent.WSUTIL.parseArrayToTree(oJsonModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

            oJsonModel.refresh();

            return;

        }

        oCoreModel.setData(oData);

        parent.WSUTIL.parseArrayToTree(oCoreModel, "DEF_PAT", "CKEY", "PKEY", "DEF_PAT");
        parent.WSUTIL.parseArrayToTree(oCoreModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

        oCoreModel.refresh();

    }; // end of oAPP.fn.fnInitModelBinding

    function fnPatternFileWatchEvent(oEvent) {

        oAPP.setBusy("X");

        let oCustTable = sap.ui.getCore().byId("uspCustPattTreeTbl"),
            aSelectedIndices = oCustTable.getSelectedIndices(),
            iSelectedLength = aSelectedIndices.length;
        
        // watch 이벤트 발생 이전에 선택되어 있는 라인이 있었다면 해당 라인을 선택 표시한다.
        if(iSelectedLength > 0){

            let iSelectedIndex = aSelectedIndices[0],
                oCtx = oCustTable.getContextByIndex(iSelectedIndex),
                oCtxData = oCtx.getObject(),
                oBindData = {
                    KEY: oCtxData.CKEY
                };

            // 추가한 데이터 위치에 선택 표시하기
            oCustTable.attachEventOnce("rowsUpdated", ev_CustCreateRowsUpdatedEventOnce.bind(oBindData));

        }

        oAPP.fn.fnInitModelBinding();

        oAPP.setBusy("");

    } // end of fnPatternFileWatchEvent

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oApp = new sap.m.App({
            autoFocus: false,
        }),
            oPage = new sap.m.Page({

                // properties
                showHeader: false,
                enableScrolling: false,

                // aggregations
                content: _getMainPageContents(),
                // footer: _getMainPageFooter(),


            }).addStyleClass("");

        oApp.addPage(oPage);

        oApp.placeAt("content");

        let oDelegate = {
            onAfterRendering : function(){
        
                oApp.removeEventDelegate(oDelegate);

                oAPP.CURRWIN.show();

                // parent.WSUTIL.setBrowserOpacity(oAPP.CURRWIN); 

                $('#content').fadeIn(300, 'linear', () => {                    

                    oAPP.setBusy("");
        
                    // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                    oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

                });
        
            }
        };
        
        oApp.addEventDelegate(oDelegate);


    }; // end of oAPP.fn.fnInitRendering

    /************************************************************************
     * WS 글로벌 메시지 목록 구하기
     ************************************************************************/
    oAPP.fn.getWsMessageList = function () {

        return new Promise(async (resolve) => {

            var WSUTIL = parent.WSUTIL,
                oSettingInfo = WSUTIL.getWsSettingsInfo();

            let sWsLangu = oSettingInfo.globalLanguage;

            oAPP.msg.M01 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "021"); // Default Pattern
            oAPP.msg.M02 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "022"); // Custom Pattern
            oAPP.msg.M03 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "023"); // Content Type
            oAPP.msg.M04 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "024"); // Title
            oAPP.msg.M05 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "025"); // Pretty Print
            oAPP.msg.M06 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "026"); // Create
            oAPP.msg.M07 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "027", oAPP.msg.M04); // title is required entry value
            oAPP.msg.M08 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "028"); // Do you really want to delete the object?
            oAPP.msg.M09 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Delete
            oAPP.msg.M10 = oAPP.msg.M02 + " " + WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "029"); // Custom Pattern Delete
            oAPP.msg.M11 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "030"); // Change
            oAPP.msg.M12 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "031"); // Clipboard Copy Success!
            oAPP.msg.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "007"); // Saved success
            oAPP.msg.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "008"); // Delete success
            oAPP.msg.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "038"); // YES
            oAPP.msg.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "039"); // NO


            oAPP.msg.M276 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "276"); // There is no pattern selected.
            oAPP.msg.M277 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "277"); // If a pattern is selected, it will be displayed here.






            resolve();

        });

    };

    /************************************************************************
     * 패턴 메인 페이지
     ************************************************************************/
    function _getMainPageContents() {

        let oLeftPage = _getPatternListPage(), // 좌측 페이지
            oRightPage = _getPatternContentPage(), // 우측 페이지                   
            oSplitter = new sap.ui.layout.Splitter({
                orientation: sap.ui.core.Orientation.Horizontal,
                height: "100%",
                width: "100%",
                contentAreas: [
                    oLeftPage,
                    oRightPage
                ]
            });

        return [
            oSplitter

        ]

    } // end of _getMainPageContents

    function _getMainPageFooter() {

        return new sap.m.Bar({
            contentRight: [
                new sap.m.Button({
                    icon: "sap-icon://message-success",
                }),
                new sap.m.Button({
                    icon: "sap-icon://decline",
                })
            ]
        });

    } // end of _getMainPageFooter

    function _getPatternListPage() {

        return new sap.m.Page({

            // properties
            showHeader: false,
            enableScrolling: false,

            // aggregations
            content: _getPatternListPageContent(),
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "500px",
            })

        });

    } // end of _getPatternListPage

    function _getPatternListPageContent() {

        let oDefaultPatternTable = _getDefaultPatternTable(),
            oCustomPatternTable = _getCustomPatternTable();

        return [

            new sap.ui.layout.Splitter({
                orientation: sap.ui.core.Orientation.Vertical,
                contentAreas: [
                    oDefaultPatternTable,
                    oCustomPatternTable
                ],

                resize: (oEvent) => {

                    let oUspDefPattLayoData = sap.ui.getCore().byId("uspDefPattLayoutData"),
                        oUspCustPattLayoData = sap.ui.getCore().byId("uspCustPattLayoutData");

                    if (!oUspDefPattLayoData || !oUspCustPattLayoData) {
                        return;
                    }

                    let sSize = "auto";

                    oUspCustPattLayoData.setSize(sSize);

                }
            })

        ];

    } // end of _getPatternListPageContent

    function _getDefaultPatternTable() {

        return new sap.ui.table.TreeTable("uspDefPattTreeTbl", {

            // properties
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            selectionMode: sap.ui.table.SelectionMode.Single,
            minAutoRowCount: 1,
            alternateRowColors: true,
            columnHeaderVisible: true,

            // aggregations            
            layoutData: new sap.ui.layout.SplitterLayoutData("uspDefPattLayoutData"),
            columns: [
                new sap.ui.table.Column({
                    filterProperty: "DESC",
                    sortProperty: "DESC",
                    label: oAPP.msg.M01, // Default Pattern
                    template: new sap.m.HBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        alignItems: sap.m.FlexAlignItems.Center,
                        items: [
                            new sap.m.Image({
                                src: "{ICON}",
                                width: "20px"
                            })
                                .bindProperty("visible", "ICON", function (ICON) {

                                    if (!ICON) {
                                        return false;
                                    }

                                    return true;
                                })
                                .addStyleClass("sapUiTinyMarginEnd"),

                            new sap.m.Text().bindProperty("text", {
                                parts: [
                                    "TYPE",
                                    "DESC"
                                ],
                                formatter: function (TYPE, DESC) {
                                    return (TYPE === "ROOT" ? `${DESC} Root` : DESC);
                                }
                            })
                        ]
                    })

                }),

                // 원본
                // new sap.ui.table.Column({                    
                //     label: oAPP.msg.M01, // Default Pattern
                //     template: new sap.m.Text().bindProperty("text", {
                //         parts: [
                //             "TYPE",
                //             "DESC"
                //         ],
                //         formatter: function (TYPE, DESC) {
                //             return (TYPE === "ROOT" ? `${DESC} Root` : DESC);
                //         }
                //     })
                // }),

            ],
            rows: {
                path: "/DEF_PAT",
                parameters: {
                    arrayNames: ['DEF_PAT']
                },
            },

            rowSelectionChange: ev_DefPattRowSelectionChange

        }).addStyleClass("uspDefPattTreeTbl");

    } // end of _getDefaultPatternTable

    function _getCustomPatternTable() {

        return new sap.ui.table.TreeTable("uspCustPattTreeTbl", {

            // properties
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            selectionMode: sap.ui.table.SelectionMode.Single,
            minAutoRowCount: 1,
            rowActionCount: 2,
            alternateRowColors: true,
            columnHeaderVisible: true,

            // aggregations
            footer: new sap.m.Bar({
                contentRight: [
                    new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        icon: "sap-icon://create-form",
                        press: function (oEvent) {
                            ev_pressCustomPatternCreateUpdate({ PRCCD: "C", CONT_TYPE: "text" });
                        }
                    }),
                    // new sap.m.Button({
                    //     type: sap.m.ButtonType.Negative,
                    //     icon: "sap-icon://delete",
                    //     press: function (oEvent) {
                    //         ev_pressCustomPatternDelete(oEvent);
                    //     }
                    // }),
                ]
            }),

            layoutData: new sap.ui.layout.SplitterLayoutData("uspCustPattLayoutData"),
            columns: [
                new sap.ui.table.Column({
                    label: oAPP.msg.M02, // Custom Pattern
                    template: new sap.m.Text().bindProperty("text", {
                        parts: [
                            "TYPE",
                            "DESC"
                        ],
                        formatter: function (TYPE, DESC) {
                            return (TYPE === "ROOT" ? `${DESC} Root` : DESC);
                        }
                    }),
                    filterProperty: "DESC",
                    sortProperty: "DESC"
                }),
                new sap.ui.table.Column({
                    label: oAPP.msg.M03, // Content Type                    
                    template: new sap.m.Text({ text: "{CONT_TYPE}" }),
                    filterProperty: "CONT_TYPE",
                    sortProperty: "CONT_TYPE"
                }),
            ],

            rows: {
                path: "/CUS_PAT",
                parameters: {
                    arrayNames: ['CUS_PAT']
                },
            },

            rowActionTemplate: new sap.ui.table.RowAction({
                items: [
                    new sap.ui.table.RowActionItem({ // update Button
                        icon: "sap-icon://edit",
                        press: function (oEvent) {

                            let oRow = oEvent.getParameter("row"),
                                iRowIndex = oRow.getIndex(),
                                oRowCtx = oRow.getBindingContext(),
                                oRowData = oRowCtx.getObject(),
                                oTreeTable = oRow.getParent(),
                                oCopyRow = jQuery.extend(true, {}, oRowData);

                            // 선택한 라인 선택 표시
                            oTreeTable.setSelectedIndex(iRowIndex);

                            oCopyRow.PRCCD = "U"; // 수정 플래그

                            // 커스텀 패턴 생성 수정 팝업 실행
                            ev_pressCustomPatternCreateUpdate(oCopyRow);

                        }
                    }),
                    new sap.ui.table.RowActionItem({ // delete button
                        icon: "sap-icon://delete",
                        type: sap.ui.table.RowActionType.Delete,
                        press: function (oEvent) {
                            // ev_rowActionDelete(oEvent);
                            ev_pressCustomPatternDelete(oEvent);
                        }
                    })
                ]
            }).bindProperty("visible", {
                parts: [
                    "TYPE"
                ],
                formatter: (TYPE) => {

                    if (TYPE === "ROOT") {
                        return false;
                    }

                    return true;

                }
            }),

            rowSelectionChange: ev_CustPattRowSelectionChange,
            rowsUpdated: ev_CusttPattRowsUpdated,

        }).addStyleClass("uspCustPattTreeTbl");

    } // end of _getCustomPatternTable

    function ev_CusttPattRowsUpdated(oEvent) {

        let oColorPattleete = sap.ui.core.theming.Parameters.get();

        let oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowIndex = aRows.length;

        for (var i = 0; i < iRowIndex; i++) {

            let oRows = aRows[i];

            if (oRows.isEmpty()) {
                continue;
            }

            let oRowCtx = oRows.getBindingContext();
            if (!oRowCtx) {
                return;
            }

            let oRowAction = oRows.getRowAction(),
                aActionIcons = oRowAction.getAggregation("_icons");

            if (!aActionIcons) {
                return;
            }

            let iActionIconLength = aActionIcons.length;
            for (var j = 0; j < iActionIconLength; j++) {

                let oIcon = aActionIcons[j],
                    sIconSrc = oIcon.getProperty("src");

                if (sIconSrc !== "sap-icon://delete") {
                    continue;
                }

                oIcon.setActiveBackgroundColor(oColorPattleete.sapButton_Reject_Active_Background);
                oIcon.setActiveColor(oColorPattleete.sapButton_Reject_Active_TextColor);
                oIcon.setBackgroundColor(oColorPattleete.sapButton_Reject_Background);
                oIcon.setColor(oColorPattleete.sapButton_Reject_TextColor);
                oIcon.setHoverBackgroundColor(oColorPattleete.sapButton_Reject_Hover_Background);
                oIcon.setHoverColor(oColorPattleete.sapButton_Reject_Hover_TextColor);

            }

        }

    }

    /************************************************************************
     * 패턴 코드 페이지
     ************************************************************************/
    function _getPatternContentPage() {

        let oNavCon1 = new sap.m.NavContainer({
            autoFocus: false
        });

        oAPP.ui.RNAV1 = oNavCon1;

        let oPage1 = new sap.m.Page({
            showHeader: false,
            enableScrolling: true,
        });
        oNavCon1.addPage(oPage1);

        oAPP.ui.RPAGE1 = oPage1;

        let VBOX3 = new sap.m.VBox({
            width: "100%",
            height: "100%",
            justifyContent: "Center",
            alignItems: "Center",
            renderType: "Bare",
            items: [
                
            ]
        });
        oPage1.addContent(VBOX3);

        // let ILLUST1 = new sap.m.Illustration({
        //     set: "sapIllus",
        //     media: "Scene",
        //     type: "NoEntries"
        // });

        let ILLUST1 = new sap.m.IllustratedMessage({
            // illustrationType: "sapIllus-NoEntries"
            illustrationType: "sapIllus-SimpleEmptyList",
            title: oAPP.msg.M276, // There is no pattern selected.
            description: oAPP.msg.M277, // If a pattern is selected, it will be displayed here.
        });
    
        VBOX3.addItem(ILLUST1);

        let oPage2 = new sap.m.Page({
            showHeader: true,
            enableScrolling: true,
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.m.Title({
                        text: "{/CONTENT/DESC}"
                    })
                ],
                contentRight: [
                    new sap.m.Button({
                        icon: "sap-icon://copy",
                        press: function (oEvent) {

                            let oBtn = oEvent.getSource(),
                                oModel = oBtn.getModel();

                            if (!oModel) {
                                return;
                            }

                            let oContentData = oModel.getProperty("/CONTENT");
                            if (!oContentData) {
                                return;
                            }

                            let remote = parent.require("@electron/remote"),
                                clipboard = remote.clipboard;

                            clipboard.writeText(oContentData.DATA);

                            let sMsg = oAPP.msg.M12; // Clipboard Copy Success!

                            sap.m.MessageToast.show(sMsg);

                            // parent.WSUTIL.showMessageToast(sap, sMsg);

                        }
                    }).bindProperty("visible", "/CONTENT", function (oContent) {

                        if (!oContent) {
                            return false;
                        }

                        if (typeof oContent.DATA === "undefined") {
                            return false;
                        }

                        return true;

                    })
                ]
            }),
            content: _getPatternCodePageContent()
        });

        oAPP.ui.RPAGE2 = oPage2;

        oNavCon1.addPage(oPage2);

        return oNavCon1;

    } // end of _getPatternCodePage

    function _getPatternCodePageContent() {

        let oCodeEditor = new sap.ui.codeeditor.CodeEditor("pattCodeEditor", {
            editable: false,
            syntaxHints: false,
            value: "{/CONTENT/DATA}"
        });

        oCodeEditor.addEventDelegate({
            onAfterRendering: function (oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            },

        });

        return [

            oCodeEditor

        ];

    } // end of _getPatternCodePageContent

    /************************************************************************
     * 커스텀 패턴 생성 팝업의 content
     ************************************************************************/
    function _getCustPattCreateDlgContent() {

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
                                design: sap.m.LabelDesign.Bold,
                                text: oAPP.msg.M04 // Title
                            }),
                            fields: new sap.m.Input("custPattCrTitleInput", {
                                value: "{/CUST_CR_DLG/DESC}",
                                valueState: "{/CUST_CR_DLG/TITLE_VS}",
                                valueStateText: "{/CUST_CR_DLG/TITLE_VSTXT}"
                            }).bindProperty("valueState", "/CUST_CR_DLG/TITLE_VS", function (TITLE_VS) {
                                return TITLE_VS || sap.ui.core.ValueState.None;
                            })

                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: oAPP.msg.M03 // Content Type
                            }),
                            fields: new sap.m.Select({
                                selectedKey: "{/CUST_CR_DLG/CONT_TYPE}",
                                items: {
                                    path: "/CUST_CR_DLG/aContentTypes",
                                    template: new sap.ui.core.Item({
                                        key: "{KEY}",
                                        text: "{TEXT}"
                                    })
                                }
                            })
                        })
                    ]
                })
            ]

        });

        let oCodeEditor = new sap.ui.codeeditor.CodeEditor("uspCustomCreateCodeeditor", {
            editable: true,
            syntaxHints: true,
            type: "{/CUST_CR_DLG/CONT_TYPE}",
            value: "{/CUST_CR_DLG/DATA}"
        });

        oCodeEditor.addEventDelegate({

            onAfterRendering: function (oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            },

            onkeyup: function (oEvent) {

                /**
                 * 단축키 설정
                 */

                // [Shift + F1] Pretty Print 기능
                if (oEvent.shiftKey && oEvent.keyCode == 112) {
                    oEvent.srcControl.prettyPrint();
                    return;
                }

            }

        });

        let oToolbar = new sap.m.Bar({
            contentLeft: [
                new sap.m.Button({
                    text: oAPP.msg.M05, // Pretty Print
                    press: function (oEvent) {
                        ev_pressCustPattCreatePrettyPrint(oEvent);
                    }
                })
            ],
            layoutData: new sap.m.FlexItemData({
                order: 0,
                growFactor: 0,
                shrinkFactor: 0
            })
        });

        return [
            new sap.m.Page({
                showHeader: false,
                enableScrolling: false,
                content: [
                    new sap.m.VBox({
                        renderType: sap.m.FlexRendertype.Bare,
                        width: "100%",
                        height: "100%",
                        items: [
                            oForm,
                            oToolbar,
                            oCodeEditor
                        ]
                    }),
                ]
            }),

        ];

    } // end of _getCustPattCreateDlgContent

    /************************************************************************
     * 커스텀 패턴 생성 팝업의 CodeEditor에 Pretty Print 기능
     ************************************************************************/
    function ev_pressCustPattCreatePrettyPrint() {

        let oCodeEditor = sap.ui.getCore().byId("uspCustomCreateCodeeditor");
        if (!oCodeEditor) {
            return;
        }

        oCodeEditor.prettyPrint();

    } // end of ev_pressCustPattCreatePrettyPrint

    /************************************************************************
     * 커스텀 패턴의 컨텐츠 유형
     ************************************************************************/
    function _getWsCustomPatternContentTypes() {

        return [{
            KEY: "text",
            EXTEN: "txt",
            TEXT: "text",
        },
        {
            KEY: "abap",
            EXTEN: "abap",
            TEXT: "abap",
        }, {
            KEY: "html",
            EXTEN: "html",
            TEXT: "html",
        }, {
            KEY: "javascript",
            EXTEN: "js",
            TEXT: "javascript",
        },
        {
            KEY: "css",
            EXTEN: "css",
            TEXT: "css",
        },
        {
            KEY: "json",
            EXTEN: "json",
            TEXT: "json",
        },
        {
            KEY: "xml",
            EXTEN: "xml",
            TEXT: "xml",
        }];


    } // end of _getWsCustomPatternContentTypes

    /************************************************************************
    * 커스텀 패턴 생성 수정 팝업
    ************************************************************************/
    function ev_pressCustomPatternCreateUpdate(oParam) {

        /**
         * Dialog Title 구성
         */
        let sDlgTitle = oAPP.msg.M02, // Custom Pattern
            sHeaderIconSrc = "";

        switch (oParam.PRCCD) {
            case "C": // 신규 생성일 경우
                sDlgTitle += " " + oAPP.msg.M06; // Create
                sHeaderIconSrc = "sap-icon://create-form";
                break;

            case "U":
                sDlgTitle += " " + oAPP.msg.M11; // Change
                sHeaderIconSrc = "sap-icon://edit";
                break;
        }

        let aContentTypes = _getWsCustomPatternContentTypes(), // 커스텀 패턴의 컨텐츠 유형
            oCreateInfo = {
                HEADER_TITLE: sDlgTitle,
                CONT_TYPE: oParam.CONT_TYPE,
                aContentTypes: aContentTypes,
                HEAD_ICON: sHeaderIconSrc,
                PRCCD: oParam.PRCCD
            };

        if (oParam.PRCCD == "U") {
            oCreateInfo = Object.assign({}, oCreateInfo, oParam);
        }

        oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", {});
        oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", oCreateInfo);

        let sDialogId = "uspCustPattCreateDlg";

        var oDialog = sap.ui.getCore().byId(sDialogId);
        if (oDialog) {
            oDialog.open();
            return;
        }

        var oDialog = new sap.m.Dialog(sDialogId, {

            // properties
            draggable: true,
            resizable: true,
            contentWidth: "100%",
            contentHeight: "100%",
            verticalScrolling: false,
            horizontalScrolling: false,
            escapeHandler: () => { },

            // aggregations
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.ui.core.Icon({
                        src: "{/CUST_CR_DLG/HEAD_ICON}"
                    }),

                    new sap.m.Title({
                        text: "{/CUST_CR_DLG/HEADER_TITLE}"
                    }).addStyleClass("sapUiTinyMarginBegin"),
                ],

                contentRight: [

                    new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        icon: "sap-icon://save",
                        press: function (oEvent) {
                            ev_CustCreateDlgSave(oEvent);
                        }
                    }),

                    new sap.m.Button("uspCustPattCreateDlgCloseBtn", {
                        type: sap.m.ButtonType.Reject,
                        icon: "sap-icon://decline",
                        press: function (oEvent) {
                            ev_CustCreateDialogClose(oEvent);
                        }
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://save",
                    press: function (oEvent) {
                        ev_CustCreateDlgSave(oEvent);
                    }
                }),

                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function (oEvent) {
                        ev_CustCreateDialogClose(oEvent);
                    }
                })
            ],

            content: _getCustPattCreateDlgContent()

        });

        oDialog.open();


    } // end of ev_pressCustomPatternCreateUpdate    

    /************************************************************************
     * 커스텀 패턴 생성팝업 저장 이벤트
     ************************************************************************/
    function ev_CustCreateDlgSave() {        

        // Busy 켜기
        oAPP.setBusy("X");

        let oCreateInfo = oAPP.fn.fnGetModelProperty("/CUST_CR_DLG");

        oCreateInfo.TITLE_VS = "";
        oCreateInfo.TITLE_VSTXT = "";

        oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", oCreateInfo);

        // Title 입력 여부 확인
        if (!oCreateInfo.DESC) {

            let sMsg = oAPP.msg.M07; // title is required entry value

            oCreateInfo.TITLE_VS = sap.ui.core.ValueState.Error;
            oCreateInfo.TITLE_VSTXT = sMsg;

            oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", oCreateInfo);

            setTimeout(() => {

                let oCrInput = sap.ui.getCore().byId("custPattCrTitleInput");
                if (oCrInput) {
                    oCrInput.focus();
                }

                // Busy 끄기
                oAPP.setBusy("");

            }, 0);

            return;

        }        

        // WS Setting 정보
        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            oPath = oSettings.path;

        try {

            // 기 저장된 커스텀 데이터를 구한다.
            var sCustomJson = FS.readFileSync(oPath.CUST_PATT, "utf-8"),
                aCustomData = JSON.parse(sCustomJson);

        } catch (error) {

            // Busy 끄기
            oAPP.setBusy("");

            throw new Error(error);
        }

        // 신규 커스텀 데이터를 저장한다.
        let sRandomKey = parent.WSUTIL.getRandomKey(),
            sSelectedKey = "", // 생성 및 수정 후 선택 표시할 Row의 키
            oCustomPatternData = {};

        switch (oCreateInfo.PRCCD) {
            case "C":
                sSelectedKey = sRandomKey;

                oCustomPatternData.PKEY = "PATT002";
                oCustomPatternData.CKEY = sRandomKey;
                oCustomPatternData.DESC = oCreateInfo.DESC;
                oCustomPatternData.DATA = oCreateInfo.DATA;
                oCustomPatternData.CONT_TYPE = oCreateInfo.CONT_TYPE;

                aCustomData.push(oCustomPatternData);

                break;

            case "U":
                sSelectedKey = oCreateInfo.CKEY;

                oCustomPatternData.PKEY = oCreateInfo.PKEY;
                oCustomPatternData.CKEY = oCreateInfo.CKEY;
                oCustomPatternData.DESC = oCreateInfo.DESC;
                oCustomPatternData.DATA = oCreateInfo.DATA;
                oCustomPatternData.CONT_TYPE = oCreateInfo.CONT_TYPE;

                let iFind = aCustomData.findIndex(elem => elem.CKEY == oCreateInfo.CKEY);
                if (iFind >= 0) {
                    var oFindData = aCustomData[iFind];
                    aCustomData[iFind] = Object.assign({}, oFindData, oCustomPatternData);
                }

        }

        try {
            // 신규 추가한 정보를 JSON으로 변환하여 로컬에 저장
            let sNewCustomJsonData = JSON.stringify(aCustomData);

            FS.writeFileSync(oPath.CUST_PATT, sNewCustomJsonData, "utf-8");

        } catch (error) {

            // Busy 끄기
            oAPP.setBusy("");

            throw new Error(error);
        }

        // 신규 추가한 데이터를 모델에 반영한다.
        oAPP.fn.fnSetModelProperty("/CUS_PAT", aCustomData, true);

        // 추가한 데이터를 TREE 형태로 변경
        let oModel = sap.ui.getCore().getModel();

        parent.WSUTIL.parseArrayToTree(oModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

        oModel.refresh();

        let oCloseBtn = sap.ui.getCore().byId("uspCustPattCreateDlgCloseBtn");
        if (oCloseBtn) {
            oCloseBtn.firePress();
        }

        let oCustTable = sap.ui.getCore().byId("uspCustPattTreeTbl"),
            oBindData = {
                KEY: sSelectedKey
            };

        // 추가한 데이터 위치에 선택 표시하기
        oCustTable.attachEventOnce("rowsUpdated", ev_CustCreateRowsUpdatedEventOnce.bind(oBindData));

        let sMsg = oAPP.msg.M13; // // Saved success
        sap.m.MessageToast.show(sMsg);

        // Busy 끄기
        oAPP.setBusy("");

    } // end of ev_CustCreatef

    /************************************************************************
     * 커스텀 패턴 추가한 데이터 위치에 선택 표시하기
     ************************************************************************/
    function ev_CustCreateRowsUpdatedEventOnce(oEvent) {

        let oTreeTable = oEvent.getSource(), // tree table 인스턴스
            sCreateKey = this.KEY, // 신규 생성한 키
            oBindings = oTreeTable.getBinding(); // tree binding 정보

        if (!oBindings) {
            return;
        }

        let sBindPath = oBindings.getPath(), // 테이블에 바인딩된 패스경로
            aBindData = oTreeTable.getModel().getProperty(sBindPath), // 테이블에 바인딩된 데이터
            aNodePaths = []; // 찾을려는 UI의 패스 수집

        if (typeof oAPP.attr.bFindNode !== "undefined") {
            delete oAPP.attr.bFindNode;
        }

        // 노드를 찾았는지 여부 플래그
        oAPP.attr.bFindNode = false;

        /**
         * Key 정보를 가지고 노드를 찾는다.
         */
        _findCustPattCreateNode(aBindData, sCreateKey, aNodePaths);

        let iRowIndex = 0,
            iNodePathLength = aNodePaths.length;

        if (iNodePathLength == 0) {
            return;
        }

        for (var i = 0; i < iNodePathLength; i++) {

            let sPath = aNodePaths[i],
                iBindLength = oBindings.getLength();

            for (var j = 0; j < iBindLength; j++) {

                let oNode = oBindings.getNodeByIndex(j),
                    oCtx = oNode.context,
                    CKEY = oCtx.getObject("CKEY");

                if (CKEY !== sPath) {
                    continue;
                }

                if (j !== iNodePathLength - 1) {
                    let oNodeState = oNode.nodeState,
                        bIsExpanded = oNodeState.expanded;

                    if (!bIsExpanded) {
                        oTreeTable.expand(j);
                    }

                }

                iRowIndex = j + 1;

                break;

            }

        }

        let iFindIndex = iRowIndex - 1;
        oTreeTable.setSelectedIndex(iFindIndex);
        oTreeTable.setFirstVisibleRow(iFindIndex);

    } // end of ev_CustCreateRowsUpdatedEventOnce

    function _findCustPattCreateNode(aBindData, KEY, aNodePaths) {

        let iBindLength = aBindData.length;
        if (iBindLength == 0) {
            return;
        }

        for (var i = 0; i < iBindLength; i++) {

            // 이미 찾았다면 빠져나감.
            if (oAPP.attr.bFindNode == true) {
                return;
            }

            let oBindData = aBindData[i];

            if (oBindData.CKEY === KEY) {
                oAPP.attr.bFindNode = true;
                aNodePaths.push(oBindData.CKEY);
                return;
            }

            aNodePaths.push(oBindData.CKEY);

            let iChildLength = oBindData.CUS_PAT.length;
            if (iChildLength !== 0) {
                _findCustPattCreateNode(oBindData.CUS_PAT, KEY, aNodePaths);
            }

            // 이미 찾았다면 빠져나감.
            if (oAPP.attr.bFindNode == true) {
                return;
            }

            aNodePaths.pop();

        }

    } // end of _findCustPattCreateNode

    /************************************************************************
     * 커스텀 패턴 생성팝업 닫기 이벤트
     ************************************************************************/
    function ev_CustCreateDialogClose() {

        let sDialogId = "uspCustPattCreateDlg";

        let oDialog = sap.ui.getCore().byId(sDialogId);
        if (!oDialog) {
            return;
        }

        oDialog.close();

    } // end of ev_CustCreateDialogClose

    /************************************************************************
     * 커스텀 패턴 삭제 이벤트
     ************************************************************************/
    async function ev_pressCustomPatternDelete(oEvent) {
    
        // Busy 켜기
        oAPP.setBusy("X");

        let oRow = oEvent.getParameter("row"),
            oRowCtx = oRow.getBindingContext(),
            oRowBindData = oRowCtx.getObject(),
            iRowIndex = oRow.getIndex(),
            oCustTable = oRow.getParent();

        oCustTable.setSelectedIndex(iRowIndex);

        // 선택한 위치를 표시해 주기 위해 selection Chage 이벤트가 발생되게 하기 위함
        await oAPP.fn.waiting(0);

        /**
         * 삭제 질문 팝업?
         */
        let oMessagePop = await new Promise((resolve) => {

            let sMsg = `[${oRowBindData.DESC}]  \n\n` + oAPP.msg.M08, //Do you really want to delete the object?
                options = {
                    icon: "WARNING",
                    title: oAPP.msg.M10, // Custom Pattern Delete
                    TYPE: "W",
                    MSG: sMsg,
                    actions: ["YES", "NO"],
                    emphasizedAction: "YES",
                    onClose: function (oAction) {
                        resolve({ RETCD: oAction });
                    }
                };

            parent.WSUTIL.showMessageBox(sap, options);

            // Busy 끄기
            oAPP.setBusy("");

            //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});            

        });

        if (oMessagePop.RETCD !== "YES") {

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        // Busy 켜기
        oAPP.setBusy("X");

        let oTableModel = oCustTable.getModel();
        if (!oTableModel) {

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        let oTableBinding = oCustTable.getBinding(),
            sBindPath = oTableBinding.getPath();

        let oModelData = oTableModel.getProperty(sBindPath),
            aCustData = parent.WSUTIL.parseTreeToArray(oModelData, "CUS_PAT"),
            sCKEY = oRowBindData.CKEY,
            iFindIndex = aCustData.findIndex(elem => elem?.CKEY === sCKEY);

        if (iFindIndex == -1) {

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        aCustData.splice(iFindIndex, 1);

        // WS Setting 정보
        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            oPath = oSettings.path;

        try {
            // 신규 추가한 정보를 JSON으로 변환하여 로컬에 저장
            let sCustomJson = JSON.stringify(aCustData);

            FS.writeFileSync(oPath.CUST_PATT, sCustomJson, "utf-8");

        } catch (error) {

            // Busy 끄기
            oAPP.setBusy("");

            throw new Error(error);
        }

        oTableModel.setProperty("/CUS_PAT", aCustData, true);

        parent.WSUTIL.parseArrayToTree(oTableModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

        oTableModel.refresh();

        oCustTable.clearSelection();

        oAPP.fn.fnSetModelProperty("/CONTENT", {});

        let sMsg = oAPP.msg.M14;  // Delete success
        sap.m.MessageToast.show(sMsg);

        // Busy 끄기
        oAPP.setBusy("");

    } // end of ev_pressCustomDelete

    /************************************************************************
     * 커스텀 패턴 선택 이벤트
     ************************************************************************/
    function ev_CustPattRowSelectionChange(oEvent) {    

        // Busy 켜기
        oAPP.setBusy("X");

        let oDefPattTable = sap.ui.getCore().byId("uspDefPattTreeTbl"),
            oTable = oEvent.getSource(),
            oRowCtx = oEvent.getParameter("rowContext"),
            iRowIndex = oEvent.getParameter("rowIndex"),
            iSelectedIndex = oTable.getSelectedIndex();

        // 선택한 라인이 없다면 빠져나간다.
        if(iSelectedIndex < 0){

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        oAPP.fn.fnSetModelProperty("/CONTENT", {});

        if (!oRowCtx) {

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        // 커스텀 패턴 Row 선택 시, Default 패턴 Row 전체 선택 해제
        if (oDefPattTable) {
            oDefPattTable.clearSelection();
        }

        if (iSelectedIndex < 0) {
            oTable.setSelectionInterval(iRowIndex, iRowIndex);
        }

        let oSelectedRowData = oRowCtx.getProperty(oRowCtx.getPath());

        if (oSelectedRowData.TYPE === "ROOT") {
            
            // 테이블 선택 해제
            oTable.clearSelection();
            
            // 우측 페이지를 첫번째 페이지로 이동
            oAPP.ui.RNAV1.to(oAPP.ui.RPAGE1);

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        if (!oSelectedRowData.DATA) {

            // 테이블 선택 해제
            oTable.clearSelection();

            // 우측 페이지를 첫번째 페이지로 이동
            oAPP.ui.RNAV1.to(oAPP.ui.RPAGE1);
            
            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        // 우측 페이지를 첫번째 페이지로 이동
        oAPP.ui.RNAV1.to(oAPP.ui.RPAGE2);

        oAPP.fn.fnSetModelProperty("/CONTENT", oSelectedRowData);

        // Busy 끄기
        oAPP.setBusy("");

    } // end of ev_CustPattRowSelectionChange

    /************************************************************************
     * 기본 패턴 선택 이벤트
     ************************************************************************/
    function ev_DefPattRowSelectionChange(oEvent) {

        // Busy 켜기
        oAPP.setBusy("X");

        let oCustPattTable = sap.ui.getCore().byId("uspCustPattTreeTbl"),
            oTable = oEvent.getSource(),
            oRowCtx = oEvent.getParameter("rowContext"),
            iRowIndex = oEvent.getParameter("rowIndex"),
            iSelectedIndex = oTable.getSelectedIndex();

            // 선택한 라인이 없다면 빠져나간다.
        if(iSelectedIndex < 0){

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        oAPP.fn.fnSetModelProperty("/CONTENT", {});

        if (!oRowCtx) {

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        // 기본 패턴 Row 선택 시, 커스텀 패턴 테이블 전체 선택 해제
        if (oCustPattTable) {
            oCustPattTable.clearSelection();
        }

        if (iSelectedIndex < 0) {
            oTable.setSelectionInterval(iRowIndex, iRowIndex);
        }

        let oSelectedRowData = oRowCtx.getProperty(oRowCtx.getPath());

        if (oSelectedRowData.TYPE === "ROOT") {

            // 테이블 선택 해제
            oTable.clearSelection();

            // 우측 페이지를 첫번째 페이지로 이동
            oAPP.ui.RNAV1.to(oAPP.ui.RPAGE1);

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        if (!oSelectedRowData.DATA) {

            // 테이블 선택 해제
            oTable.clearSelection();

            // 우측 페이지를 첫번째 페이지로 이동
            oAPP.ui.RNAV1.to(oAPP.ui.RPAGE1);

            // Busy 끄기
            oAPP.setBusy("");

            return;
        }

        // 우측 페이지를 첫번째 페이지로 이동
        oAPP.ui.RNAV1.to(oAPP.ui.RPAGE2);

        oAPP.fn.fnSetModelProperty("/CONTENT", oSelectedRowData); 

        // Busy 끄기
        oAPP.setBusy("");

    } // end of ev_DefPattRowSelectionChange  

    /********************************************************************
     * Busy 켜기 끄기
     *********************************************************************
     * sOption
     * - 옵션에 ISBROAD 값이 있으면, 
     *   내 브라우저의 BroadCast onMessage 이벤트에서 Busy를 킨 것으로,
     *   그럴때는 나만 Busy 키고 다시 BrodCast의 PostMessage를 하지 않는다.
     *********************************************************************/
    oAPP.setBusy = (isBusy, sOption) => {

        oAPP.attr.isBusy = isBusy;

        if (isBusy === "X") {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            // 브라우저 창 닫기 버튼 비활성
            oAPP.CURRWIN.closable = false;

            sap.ui.core.BusyIndicator.show(0);      

        } else {

            // 브라우저 창 닫기 버튼 활성
            oAPP.CURRWIN.closable = true;

            sap.ui.core.BusyIndicator.hide();

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

        }

        var _ISBROAD = sOption?.ISBROAD || undefined;
        if(typeof _ISBROAD !== "undefined"){
            return;
        }

        if(isBusy === "X"){

            oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});

        } else {

            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        }
  
    }; // end of oAPP.fn.setBusy

    /************************************************************************
     * 패턴 파일에 Watch 이벤트를 걸기
     ************************************************************************/
    oAPP.fn.fnSetPatternFileWatch = () => {

        // WS Setting 정보
        let oSettings = parent.WSUTIL.getWsSettingsInfo(),
            oPath = oSettings.path;
        
        FS.watch(oPath.CUST_PATT, fnPatternFileWatchEvent);

    }; // end of oAPP.fn.fnSetPatternFileWatch

    /**
     * UI5 Attach Init
     */
    oAPP.fn.attachInit = () => {

        sap.ui.getCore().attachInit(async function () {            

            oAPP.setBusy("X");

            jQuery.sap.require("sap.m.Illustration");

            // IPC Event 등록
            _attachIpcEvents();

            // 글로벌 BusyIndicator Delay 설정
            sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

            await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

            oAPP.fn.fnInitRendering();

            oAPP.fn.fnSetPatternFileWatch(); // 패턴 파일 Watch 이벤트를 건다.

            oAPP.fn.fnInitModelBinding();

            let oTable1 = sap.ui.getCore().byId("uspDefPattTreeTbl"),
                oTable2 = sap.ui.getCore().byId("uspCustPattTreeTbl");

            if (oTable1 && oTable2) {
                oTable1.expandToLevel(1);
                oTable2.expandToLevel(1);
            } 

        });

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
                    oAPP.setBusy("X", {ISBROAD:true});
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    oAPP.setBusy("",  {ISBROAD:true});
                    break;

                default:
                    break;
            }

        };


    };

    /***********************************************************************
     * @function - 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
     ***********************************************************************/
    function _setBroadCastBusy(){

        // 브라우저 닫는 시점에 busy가 켜있을 경우
        if(oAPP.fn.getBusy() === "X"){

            // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

            return;

        }

        if(typeof window?.sap?.m?.InstanceManager?.getOpenDialogs !== "function"){
            return;
        }

        // 현재 호출된 dialog 정보 얻기.
        var _aDialog = sap.m.InstanceManager.getOpenDialogs();

        //호출된 dialog가 없다면 exit.
        if(typeof _aDialog === "undefined" || _aDialog?.length === 0){
            return;
        }

        // 내가 띄운 MessageBox 가 있을 경우 Busy OFF
        if(_aDialog.findIndex( item => typeof item.getType === "function" && 
            item.getType() === "Message") !== -1){
            
            // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

            // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
            oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

        }

    } // end of _setBroadCastBusy

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();


    // window.addEventListener("keydown", function(e){

    //     console.log(e.keyCode);

    //     if(e.altKey === true && e.keyCode === 116){
            
    //         console.log("alt+f4");

    //         oAPP.CURRWIN.close();

    //         return;
    //     }


    // });

    /************************************************************************
     * window 창 닫을때 호출 되는 이벤트
     ************************************************************************/
    window.onbeforeunload = function() {

        // Busy가 실행 중이면 창을 닫지 않는다.
        if(oAPP.fn.getBusy() === "X"){
            return false;
        }

        // 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
        _setBroadCastBusy();

    };


})(window, oAPP);