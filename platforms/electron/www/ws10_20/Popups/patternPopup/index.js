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

(function (window, oAPP) {
    "use strict";

    let require = parent.require,
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
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.attr.oSettingInfo,
            oSetting_UI5 = oSettings.UI5,
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
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting 

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function () {

        let sDefPattJson = FS.readFileSync(oAPP.attr.sDefaultPatternJsonPath, 'utf-8'), // Usp 기본 패턴
            sCustPattJson = FS.readFileSync(oAPP.attr.sCustomPatternJsonPath, 'utf-8'); // Usp 커스텀 패턴

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

        oCoreModel.refresh(true);

        parent.WSUTIL.parseArrayToTree(oCoreModel, "DEF_PAT", "CKEY", "PKEY", "DEF_PAT");
        parent.WSUTIL.parseArrayToTree(oCoreModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

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

                // aggregations
                content: _getMainPageContents(),
                footer: _getMainPageFooter(),


            }).addStyleClass("");

        oApp.addPage(oPage);

        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering

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
                    label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E10"), // Default Pattern
                    template: new sap.m.Text().bindProperty("text", {
                        parts: [
                            "TYPE",
                            "DESC"
                        ],
                        formatter: function (TYPE, DESC) {
                            return (TYPE === "ROOT" ? `${DESC} Root` : DESC);
                        }
                    })
                }),

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
            alternateRowColors: true,
            columnHeaderVisible: true,

            // aggregations
            footer: new sap.m.Bar({
                contentRight: [
                    new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        icon: "sap-icon://create-form",
                        press: function (oEvent) {
                            ev_pressCustomPatternCreate(oEvent);
                        }
                    }),
                    new sap.m.Button({
                        type: sap.m.ButtonType.Negative,
                        icon: "sap-icon://delete",
                        press: function (oEvent) {
                            ev_pressCustomPatternDelete(oEvent);
                        }

                    }),
                ]
            }),

            layoutData: new sap.ui.layout.SplitterLayoutData("uspCustPattLayoutData"),
            columns: [
                new sap.ui.table.Column({
                    label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E11"), // Custom Pattern
                    template: new sap.m.Text().bindProperty("text", {
                        parts: [
                            "TYPE",
                            "DESC"
                        ],
                        formatter: function (TYPE, DESC) {
                            return (TYPE === "ROOT" ? `${DESC} Root` : DESC);
                        }
                    })
                }),

                new sap.ui.table.Column({
                    label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E18"), // Content Type
                    template: new sap.m.Text({ text: "{CONT_TYPE}" })
                }),
            ],
            rows: {
                path: "/CUS_PAT",
                parameters: {
                    arrayNames: ['CUS_PAT']
                },
            },

            rowSelectionChange: ev_CustPattRowSelectionChange

        }).addStyleClass("uspCustPattTreeTbl");

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
                        text: "{/CONTENT/DESC}"
                    })
                ],
            }),
            content: _getPatternCodePageContent()
        });

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
                                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D16") // Title
                            }),
                            fields: new sap.m.Input("custPattCrTitleInput", {
                                value: "{/CUST_CR_DLG/TITLE}",
                                valueState: "{/CUST_CR_DLG/TITLE_VS}",
                                valueStateText: "{/CUST_CR_DLG/TITLE_VSTXT}"
                            }).bindProperty("valueState", "/CUST_CR_DLG/TITLE_VS", function (TITLE_VS) {
                                return TITLE_VS || sap.ui.core.ValueState.None;
                            })

                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E18") // Content Type
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
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C25"), // Pretty Print
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
     * 커스텀 패턴 생성 이벤트
     ************************************************************************/
    function ev_pressCustomPatternCreate(oEvent) {

        let sDlgTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E11"); // Custom Pattern
        sDlgTitle += " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"); // Create

        let aContentTypes = [{
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

        let oCreateInfo = {
            HEADER_TITLE: sDlgTitle,
            CONT_TYPE: "text",
            aContentTypes: aContentTypes
        };

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

            // aggregations
            customHeader: new sap.m.Bar({
                contentLeft: [
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

    } // end of ev_pressCustomPatternCreate

    /************************************************************************
     * 커스텀 패턴 생성팝업 저장 이벤트
     ************************************************************************/
    function ev_CustCreateDlgSave() {

        let oCreateInfo = oAPP.fn.fnGetModelProperty("/CUST_CR_DLG");

        oCreateInfo.TITLE_VS = "";
        oCreateInfo.TITLE_VSTXT = "";

        oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", oCreateInfo);

        // Title 입력 여부 확인
        if (!oCreateInfo.TITLE) {

            let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D16")); // title is required entry value

            oCreateInfo.TITLE_VS = sap.ui.core.ValueState.Error;
            oCreateInfo.TITLE_VSTXT = sMsg;

            oAPP.fn.fnSetModelProperty("/CUST_CR_DLG", oCreateInfo);

            setTimeout(() => {

                let oCrInput = sap.ui.getCore().byId("custPattCrTitleInput");
                if (oCrInput) {
                    oCrInput.focus();
                }

            }, 0);

            return;

        }

        // 기 저장된 커스텀 데이터를 구한다.
        let sCustomJson = FS.readFileSync(oAPP.attr.sCustomPatternJsonPath, "utf-8"),
            aCustomData;

        try {
            aCustomData = JSON.parse(sCustomJson);
        } catch (error) {
            throw new Error(error);
        }

        // 신규 커스텀 데이터를 저장한다.
        let sKey = parent.WSUTIL.getRandomKey(),
            oNewCustomPatternData = {
                PKEY: "PATT002",
                CKEY: sKey,
                DESC: oCreateInfo.TITLE,
                DATA: oCreateInfo.DATA,
                CONT_TYPE: oCreateInfo.CONT_TYPE
            };

        aCustomData.push(oNewCustomPatternData);

        // 신규 추가한 데이터를 모델에 반영한다.
        oAPP.fn.fnSetModelProperty("/CUS_PAT", aCustomData, true);

        // 추가한 데이터를 TREE 형태로 변경
        let oModel = sap.ui.getCore().getModel();

        parent.WSUTIL.parseArrayToTree(oModel, "CUS_PAT", "CKEY", "PKEY", "CUS_PAT");

        oModel.refresh();

        // 신규 추가한 정보를 JSON으로 변환하여 로컬에 저장
        let sNewCustomJsonData = JSON.stringify(aCustomData);

        FS.writeFileSync(oAPP.attr.sCustomPatternJsonPath, sNewCustomJsonData, "utf-8");

        let oCloseBtn = sap.ui.getCore().byId("uspCustPattCreateDlgCloseBtn");
        if (oCloseBtn) {
            oCloseBtn.firePress();
        }

    } // end of ev_CustCreatef

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
    function ev_pressCustomPatternDelete(oEvent) {

        debugger;

        let oCustTable = sap.ui.getCore().byId("uspCustPattTreeTbl");
        if (!oCustTable) {
            return;
        }

        let oTableModel = oCustTable.getModel();
        if (!oTableModel) {
            return;
        }

        let oModelData = oTableModel.getProperty("/CUS_PAT"),
            aCustData = parent.WSUTIL.parseTreeToArray(oModelData, "CUS_PAT");

        // 선택한 라인이 있는지 확인
        let aSelIndex = oCustTable.getSelectedIndices(),
            iSelLength = aSelIndex.length;

        if (iSelLength == 0) {
            return;
        }

        for (var i = 0; i < iSelLength; i++) {

            let iSelIdx = aSelIndex[i],
                oCtx = oCustTable.getContextByIndex(iSelIdx);

            if (!oCtx) {
                continue;
            }

            let sCKEY = oCtx.getObject("CKEY");

            let iFindIndex = aCustData.findIndex(elem => elem?.CKEY === sCKEY);

            if (iFindIndex == -1) {
                continue;
            }





            debugger;


        }



    } // end of ev_pressCustomDelete

    /************************************************************************
     * 커스텀 패턴 선택 이벤트
     ************************************************************************/
    function ev_CustPattRowSelectionChange(oEvent) {

        let oDefPattTable = sap.ui.getCore().byId("uspDefPattTreeTbl"),
            oTable = oEvent.getSource(),
            oRowCtx = oEvent.getParameter("rowContext"),
            iRowIndex = oEvent.getParameter("rowIndex"),
            iSelectedIndex = oTable.getSelectedIndex();

        oAPP.fn.fnSetModelProperty("/CONTENT", {});

        if (!oRowCtx) {
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
            return;
        }

        if (!oSelectedRowData.DATA) {
            return;
        }

        oAPP.fn.fnSetModelProperty("/CONTENT", oSelectedRowData);

    } // end of ev_CustPattRowSelectionChange

    /************************************************************************
     * 기본 패턴 선택 이벤트
     ************************************************************************/
    function ev_DefPattRowSelectionChange(oEvent) {

        let oCustPattTable = sap.ui.getCore().byId("uspCustPattTreeTbl"),
            oTable = oEvent.getSource(),
            oRowCtx = oEvent.getParameter("rowContext"),
            iRowIndex = oEvent.getParameter("rowIndex"),
            iSelectedIndex = oTable.getSelectedIndex();

        oAPP.fn.fnSetModelProperty("/CONTENT", {});

        if (!oRowCtx) {
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
            return;
        }

        if (!oSelectedRowData.DATA) {
            return;
        }

        oAPP.fn.fnSetModelProperty("/CONTENT", oSelectedRowData);

    } // end of ev_DefPattRowSelectionChange  


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

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            oAPP.setBusy("X");

            oAPP.fn.fnInitRendering();

            oAPP.fn.fnInitModelBinding();

            let oTable1 = sap.ui.getCore().byId("uspDefPattTreeTbl"),
                oTable2 = sap.ui.getCore().byId("uspCustPattTreeTbl");

            if (oTable1 && oTable2) {
                oTable1.expandToLevel(1);
                oTable2.expandToLevel(1);
            }

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

    };

})(window, oAPP);