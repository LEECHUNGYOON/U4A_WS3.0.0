/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : patternPopup/index.js
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
        require = parent.require,
        FS = require("fs-extra");

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
            sReleaseResource = `../../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            oThemeInfo = oAPP.attr.oThemeInfo,
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
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.codeeditor, sap.ui.table, sap.ui.layout");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting 

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function() {

        let sDefPattJson = FS.readFileSync(oAPP.attr.sDefaultPatternJsonPath, 'utf-8'),
            sCustPattJson = FS.readFileSync(oAPP.attr.sCustomPatternJsonPath, 'utf-8');

        let aDefPattJson,
            aCustPattJson;

        try {
            aDefPattJson = JSON.parse(sDefPattJson);
            aCustPattJson = JSON.parse(sCustPattJson);
        } catch (error) {
            throw new Error(error);
        }

        var oCoreModel = sap.ui.getCore().getModel(),
            oJsonModel = new sap.ui.model.json.JSONModel(),
            oData = {
                DEF_PAT: aDefPattJson,
                CUS_PAT: aCustPattJson
            };

        if (oCoreModel == null) {

            sap.ui.getCore().setModel(oJsonModel);
            oJsonModel.setData(oData);

            parent.WSUTIL.parseArrayToTree(oJsonModel, "DEF_PAT", "CKEY", "PKEY", "DEF_PAT");

            return;

        }

        oCoreModel.setData(oData);

        oCoreModel.refresh(true);

        parent.WSUTIL.parseArrayToTree(oJsonModel, "DEF_PAT", "CKEY", "PKEY", "DEF_PAT");

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

                // aggregations
                content: _getMainPageContents(),
                footer: _getMainPageFooter(),


            }).addStyleClass("");

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering

    // /************************************************************************
    //  * 선택한 메뉴에 맞는 패턴 파일들을 읽어온다.
    //  ************************************************************************/
    // oAPP.fn.fnGetPatternFiles = () => {

    //     return new Promise(async (resolve) => {

    //         let oMenuInfo = oAPP.attr.oMenuInfo;
    //         if (!oMenuInfo) {
    //             resolve();
    //             return;
    //         }

    //         let sPatternRootFolderPath = parent.PATHINFO.PATTERN,
    //             oDirInfo = await parent.WSUTIL.readDir(sPatternRootFolderPath);

    //         if (oDirInfo.RETCD == "E") {
    //             resolve();
    //             return;
    //         }

    //         let aFolderList = oDirInfo.RTDATA;
    //         if (Array.isArray(aFolderList) == false) {
    //             resolve();
    //             return;
    //         }

    //         let iFolderLength = aFolderList.length;
    //         if (iFolderLength < 0) {
    //             resolve();
    //             return;
    //         }

    //         let oData = {};
    //         for (var i = 0; i < iFolderLength; i++) {

    //             let sFolderName = aFolderList[i];

    //             oData[sFolderName] = [];

    //             let sChildFolderPath = PATH.join(sPatternRootFolderPath, sFolderName),
    //                 oDirInfo = await parent.WSUTIL.readDir(sChildFolderPath);

    //             if (oDirInfo.RETCD == "E") {
    //                 continue;
    //             }

    //             oData[sFolderName] = oDirInfo.RTDATA;

    //         }

    //         oAPP.fn.fnSetModelProperty("/CUS_PAT", oData);

    //         resolve();
    //     });

    // }; // end of oAPP.fn.fnGetPatternFiles

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

                    // oUspDefPattLayoData.setSize(sSize);
                    oUspCustPattLayoData.setSize(sSize);

                }
            })

        ];

    } // end of _getPatternListPageContent

    function _getDefaultPatternTable() {

        return new sap.ui.table.TreeTable({

            // properties
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            selectionMode: sap.ui.table.SelectionMode.Single,
            minAutoRowCount: 1,
            alternateRowColors: true,
            columnHeaderVisible: false,
            expandToLevel: 1,

            // aggregations
            extension: [
                new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Title({
                            text: "Default Patterns"
                        })
                    ]
                })
            ],

            layoutData: new sap.ui.layout.SplitterLayoutData("uspDefPattLayoutData"),
            columns: [
                new sap.ui.table.Column({
                    label: "Name",
                    template: new sap.m.Text({
                        text: "{DESC}"
                    }),
                }),                
            ],
            rows: {
                path: "/DEF_PAT",
                parameters: {
                    arrayNames: ['DEF_PAT']
                },
            },

        })

    } // end of _getDefaultPatternTable

    function _getCustomPatternTable() {

        return new sap.ui.table.Table({

            // properties
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            selectionMode: sap.ui.table.SelectionMode.Single,
            minAutoRowCount: 1,
            alternateRowColors: true,
            columnHeaderVisible: false,

            // aggregations
            extension: [
                new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Title({
                            text: "Custom Patterns"
                        })
                    ],
                    contentRight: [
                        new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            icon: "sap-icon://save",
                            press: ev_pressCustomSave
                        }),
                        new sap.m.Button({
                            type: sap.m.ButtonType.Negative,
                            icon: "sap-icon://delete",
                            press: ev_pressCustomDelete
                        }),
                    ]
                })
            ],

            layoutData: new sap.ui.layout.SplitterLayoutData("uspCustPattLayoutData"),
            columns: [
                new sap.ui.table.Column({
                    label: "Name",
                    template: new sap.m.Text({
                        text: "{DESC}"
                    }),
                }),       
            ],
            rows: {
                path: "/CUS_PAT"              
            },

        });

    } // end of _getCustomPatternTable

    /************************************************************************
     * 패턴 코드 페이지
     ************************************************************************/
    function _getPatternContentPage() {

        return new sap.m.Page({
            showHeader: true,
            enableScrolling: true,
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.m.Title({
                        text: "aaaaaa"
                    })
                ],
            }),
            content: _getPatternCodePageContent()
        });

    } // end of _getPatternCodePage

    function _getPatternCodePageContent() {

        let oCodeEditor = new sap.ui.codeeditor.CodeEditor();

        oCodeEditor.addEventDelegate({
            onAfterRendering: function(oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            }
        });

        return [

            oCodeEditor

        ];

    } // end of _getPatternCodePageContent



    function ev_pressCustomSave() {



    } // end of ev_pressCustomSave

    function ev_pressCustomDelete() {



    } // end of ev_pressCustomDelete

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
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function() {

        sap.ui.getCore().attachInit(async function() {

            debugger;

            oAPP.setBusy("X");

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            // 패턴 파일들을 읽어온다.
            // await oAPP.fn.fnGetPatternFiles();









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

})(window, oAPP);