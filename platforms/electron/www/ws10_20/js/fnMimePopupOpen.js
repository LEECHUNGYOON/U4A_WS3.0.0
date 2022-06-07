/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnMimePopupOpen.js
 * - file Desc : Mime Repository Dialog Popup
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        PATH = parent.PATH,
        APP = parent.APP,
        FS = REMOTE.require('fs'),
        DIALOG = REMOTE.dialog,
        SHELL = REMOTE.shell;

    const
        C_DIALOG_ID = "u4aMimeTreeDlg";

    oAPP.fn.fnMimePopupOpen = function () {

        // 푸터 메시지가 있을 경우 닫기
        oAPP.common.fnHideFloatingFooterMsg();

        var oMimeInfo = {
            URL: "",
            ERDAT: "",
            ERZET: "",
            ERNAM: ""
        };

        var oMimeData = {
            CONTENT: "",
            VISI: "",
        };

        // Mime 관련 Default 모델 데이터 초기 세팅
        oAPP.common.fnSetModelProperty("/WS20/MIME", oMimeInfo); // Mime File 정보	
        oAPP.common.fnSetModelProperty("/WS20/MIMETREE", null); // Mime Tree Data	
        oAPP.common.fnSetModelProperty("/WS20/MIMEDATA", oMimeData); // Mime File Data

        // // Mime Tree Data 구하기        
        // oAPP.fn.fnGetMimeTreeData();

        var oMimeTreeDlg = sap.ui.getCore().byId(C_DIALOG_ID);
        if (oMimeTreeDlg) {
            // oMimeTreeDlg.rerender();
            oMimeTreeDlg.open();
            return;
        }

        // Mime Tree Table 인스턴스 구하기
        var oMimeTreeTab = oAPP.fn.fnGetMimeTreeTable(),

            // Mime Url
            oUrlInput = new sap.m.Input({
                value: "{/WS20/MIME/URL}",
                editable: false
            }).addStyleClass("sapUiTinyMarginEnd"),

            // Mime Url Copy Button
            oUrlCopyBtn = new sap.m.Button({
                text: "URL Copy",
                press: oAPP.events.ev_pressMimeUrlCopy.bind(this, oUrlInput)
            }),

            // Mime Create Date
            oCreateDateInput = new sap.m.Input({
                editable: false
            }).bindProperty("value", "/WS20/MIME/ERDAT", function (value) {

                if (value == null || value == "") {
                    return;
                }

                var year = parseInt(value.substring(0, 4)),
                    month = parseInt(value.substring(4, 6)) - 1,
                    day = parseInt(value.substring(6, 8)),
                    oDate = new Date(year, month, day),

                    sFormattedDate = oDate.format("yyyy-MM-dd");

                return sFormattedDate;

            })
            .addStyleClass("sapUiTinyMarginEnd"),

            // Mime Create Time
            oCreateTimeInput = new sap.m.Input({
                editable: false
            }).bindProperty("value", "/WS20/MIME/ERZET", function (value) {

                if (!value || value == "") {
                    return;
                }

                var hour = value.substring(0, 2),
                    min = value.substring(2, 4),
                    sec = value.substring(4, 6),

                    sFormattedDate = hour + ":" + min + ":" + sec;

                return sFormattedDate;

            })
            .addStyleClass("sapUiTinyMarginEnd"),

            oCreateUnameInput = new sap.m.Input({
                value: "{/WS20/MIME/ERNAM}",
                editable: false
            }),

            oMimeform = new sap.ui.layout.form.Form({
                editable: true,
                layout: new sap.ui.layout.form.ResponsiveGridLayout({
                    singleContainerFullSize: true
                }),

                formContainers: [
                    new sap.ui.layout.form.FormContainer({
                        formElements: [
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: "Bold",
                                    text: "URL"
                                }),
                                fields: new sap.m.HBox({
                                    renderType: "Bare",
                                    items: [
                                        oUrlInput,
                                        oUrlCopyBtn
                                    ]
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: "Bold",
                                    text: "Create"
                                }),
                                fields: new sap.m.HBox({
                                    renderType: "Bare",
                                    items: [
                                        oCreateDateInput,
                                        oCreateTimeInput,
                                        oCreateUnameInput
                                    ]
                                })
                            }),
                        ]
                    }),
                ]
            }),

            oMimePropPanel = new sap.m.Panel({
                headerText: "Properties",
                content: [
                    oMimeform
                ],
                layoutData: new sap.ui.layout.SplitterLayoutData({
                    size: "200px",
                    minSize: 200
                })
            }),

            oMimePage = new sap.m.Page({
                showHeader: false,
                content: [
                    new sap.m.Image({
                        src: "{/WS20/MIMEDATA/CONTENT}"
                    })
                    .bindProperty("src", {
                        parts: [{
                                path: "/WS20/MIMEDATA/CONTENT"
                            },
                            {
                                path: "/WS20/MIMEDATA/VISI"
                            },
                        ],
                        formatter: function (CONT, VISI) {

                            if (VISI != "IMAGE") {
                                return;
                            }

                            return CONT;

                        }

                    })
                    .bindProperty("visible", "/WS20/MIMEDATA/VISI", function (value) {

                        if (value == "IMAGE") {
                            return true;
                        }

                        return false;

                    }).addStyleClass("u4aWsMimeImgPrev"),

                    new sap.ui.codeeditor.CodeEditor({
                        syntaxHints: false,
                        editable: false,
                        height: "100%",
                        width: "100%",
                        value: "{/WS20/MIMEDATA/CONTENT}"
                    }).bindProperty("value", {
                        parts: [{
                                path: "/WS20/MIMEDATA/CONTENT"
                            },
                            {
                                path: "/WS20/MIMEDATA/VISI"
                            },
                        ],
                        formatter: function (CONT, VISI) {

                            if (VISI != "TEXT") {
                                return;
                            }

                            return CONT;

                        }
                    })
                    .bindProperty("visible", "/WS20/MIMEDATA/VISI", function (value) {

                        if (value == "TEXT") {
                            return true;
                        }

                        return false;

                    }),

                    new sap.m.HBox({
                        width: "100%",
                        height: "100%",
                        alignItems: "Center",
                        justifyContent: "Center",
                        items: [
                            new sap.m.Title({
                                text: "This file can't be previewed."
                            })
                        ]
                    })
                    .bindProperty("visible", "/WS20/MIMEDATA/VISI", function (value) {

                        // visible 값이 없으면 No data 화면을 보여준다.
                        if (!value || value == "") {
                            return true;
                        }

                        return false;

                    }),
                ]

            });

        // Application 생성 Dialog
        var oMimeDialog = new sap.m.Dialog(C_DIALOG_ID, {

            // Properties
            draggable: true,
            resizable: true,
            contentWidth: "100%",
            contentHeight: "100%",
            // title: "U4A MIME Repository",
            // titleAlignment: sap.m.TitleAlignment.Center,
            // icon: "sap-icon://picture",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://picture"
                    }),

                    new sap.m.Title({
                        text: "U4A MIME Repository"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: oAPP.events.ev_MimeDlgCancel
                    })
                ]
            }),
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_MimeDlgCancel
                }),
            ],

            content: [
                new sap.m.Page({
                    showHeader: false,
                    content: [
                        new sap.ui.layout.Splitter({
                            height: "100%",
                            width: "100%",
                            contentAreas: [

                                oMimeTreeTab,

                                new sap.ui.layout.Splitter({
                                    height: "100%",
                                    width: "100%",
                                    orientation: "Vertical",
                                    contentAreas: [
                                        oMimePropPanel,
                                        oMimePage
                                    ]
                                })

                            ]
                        }),
                    ]
                }),

            ],

            // Events
            afterOpen: function () {
                // Mime Tree Data 구하기        
                oAPP.fn.fnGetMimeTreeData();
            },
            afterClose: function (oEvent) {

                var oDialog = oEvent.getSource();
                oDialog.destroy();

            },
            escapeHandler: () => {

                let oDialog = sap.ui.getCore().byId(C_DIALOG_ID);
                if (oDialog == null) {
                    return;
                }

                if (parent.getBusy() != "X") {
                    oDialog.close();
                }

            }

        }).addStyleClass(C_DIALOG_ID);

        oMimeDialog.open();

    }; // end of oAPP.fn.fnMimePopupOpen

    /************************************************************************
     * Mime Tree Data 구하기
     ************************************************************************/
    oAPP.fn.fnGetMimeTreeData = function () {

        var oAppInfo = parent.getAppInfo();

        //MIME 데이터 구하기..
        var sPath = parent.getServerPath() + '/getmimetree?APPID=' + oAppInfo.APPID;

        parent.setBusy('X');

        sendAjax(sPath, null, lf_success, null, true, 'GET');

        function lf_success(oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow();

            if (oResult.RETCD == "E") {

                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                parent.setBusy('');

                return;
            }

            // Mime Tree 데이터에 My APP 표시를 위한 플래그 지정
            oResult.MIMETREE = oAPP.fn.fnSetMimeTreeMyAppFlag(oResult.MIMETREE);

            oAPP.common.fnSetModelProperty("/WS20/MIMETREE", oResult.MIMETREE);

            var oModel = sap.ui.getCore().getModel();

            // Model Data를 Tree로 구성
            oAPP.fn.fnSetTreeJson(oModel, "WS20.MIMETREE", "CHILD", "PARENT", "MIMETREE");

            parent.setBusy('');

            // mime Tree에서 처음 실행 시 1레벨 펼치고 첫번째 라인에 셀렉션을 추가한다. 
            var oMimeTreeTable = sap.ui.getCore().byId("mimeTree");
            if (oMimeTreeTable == null) {
                return;
            }

            let oMimeTreeModel = oMimeTreeTable.getModel();
            if (oMimeTreeModel) {
                oMimeTreeTable.getModel().refresh();
            }

            oMimeTreeTable.expandToLevel(1);
            oMimeTreeTable.setSelectedIndex(0);

            // Mime Tree 에서 현재 어플리케이션에 해당하는 폴더에 포커스 주고 노드를 펼친다.
            oAPP.fn.fnSetMimeTreeExpandMyApp(oMimeTreeTable);

            //현재 application에 해당하는 폴더가 존재하지 않는경우.
            if (oResult.MIMETREE.findIndex(a => a.MYAPP === "X") === -1) {
                
                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                //073   &1 does not exist.
                parent.showMessage(sap, 10, "E", "Current MIME Folder does not exist.");

            }

        } // end of lf_success

    }; // end of oAPP.fn.fnGetMimeTreeData

    /************************************************************************
     * Mime Tree 에서 현재 어플리케이션에 해당하는 폴더에 포커스 주고 노드를 펼친다.
     ************************************************************************/
    oAPP.fn.fnSetMimeTreeExpandMyApp = function (oTreeTable) {

        var iSelIdx = oTreeTable.getSelectedIndex();
        if (iSelIdx <= 0) {
            iSelIdx = 0;
        }

        var oCtx = oTreeTable.getContextByIndex(iSelIdx),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        var aCHILDTREE = oData.MIMETREE,
            iTreeCnt = aCHILDTREE.length;

        var iSelIndex = iSelIdx;

        if (iTreeCnt >= 0) {
            oTreeTable.expand(iSelIndex);
        }

        function lf_expand(aCHILDTREE) {

            var iTreeCnt = aCHILDTREE.length;
            if (iTreeCnt == 0) {
                return;
            }

            for (var i = 0; i < iTreeCnt; i++) {

                iSelIndex++;

                var oChild = aCHILDTREE[i],
                    isMyApp = oChild.MYAPP;

                if (oChild.ZLEVEL != 3) {
                    oTreeTable.expand(iSelIndex);
                    lf_expand(oChild.MIMETREE);
                    return;
                }

                if (isMyApp !== "X") {
                    continue;
                }

                // 하위가 있는 경우 노드를 펼친다.
                if (oChild.MIMETREE.length > 0) {
                    oTreeTable.expand(iSelIndex);
                }

                oTreeTable.setSelectedIndex(iSelIndex);
                oTreeTable.setFirstVisibleRow(iSelIndex);

                return;

            }

        } // end of lf_expand

        lf_expand(aCHILDTREE);

    }; // end of oAPP.fn.fnSetMimeTreeExpandMyApp

    /************************************************************************
     * Mime Tree 데이터에 My APP 표시를 위한 플래그 지정
     ************************************************************************/
    oAPP.fn.fnSetMimeTreeMyAppFlag = function (aMimeTree) {

        var oMyApp = aMimeTree.find(arr => arr.MYAPP == 'X');
        if (!oMyApp) {
            return aMimeTree;
        }

        var sMyAppChild = oMyApp.CHILD;

        // Mime Tree 데이터에 My APP 표시를 위한 플래그 지정 재귀 호출 펑션
        oAPP.fn.fnSetMimeTreeMyAppFlagRecursive(aMimeTree, sMyAppChild);

        return aMimeTree;

    }; // end of oAPP.fn.fnSetMimeTreeMyAppFlag

    /************************************************************************
     * Mime Tree 데이터에 My APP 표시를 위한 플래그 지정 재귀 호출 펑션
     ************************************************************************/
    oAPP.fn.fnSetMimeTreeMyAppFlagRecursive = function (aMimeTree, sChildKey) {

        var aChildren = aMimeTree.filter(arr => arr.PARENT == sChildKey),
            iChildCnt = aChildren.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {

            var oChild = aChildren[i];

            oChild.MYAPPCHILD = 'X';

            oAPP.fn.fnSetMimeTreeMyAppFlagRecursive(aMimeTree, oChild.CHILD);

        }

    }; // end of oAPP.fn.fnSetMimeTreeMyAppFlagRecursive

    /************************************************************************
     * Mime Tree Table 인스턴스 구하기 
     ************************************************************************/
    oAPP.fn.fnGetMimeTreeTable = function () {

        var oTreeTable = new sap.ui.table.TreeTable("mimeTree", {
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "500px",
                minSize: 500
            }),
            columns: [
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Object Name",
                        design: "Bold"
                    }),
                    template: new sap.m.Text({
                        text: "{NTEXT}",
                        customData: [

                            new sap.ui.core.CustomData({
                                key: "MYAPP",
                                value: "{MYAPP}"
                            }).bindProperty("value", {

                                parts: [{
                                        path: "MYAPP"
                                    },
                                    {
                                        path: "TYPE"
                                    },
                                    {
                                        path: "ZLEVEL"
                                    },
                                    {
                                        path: "MYAPPCHILD"
                                    },
                                ],

                                formatter: oAPP.fn.fnMimeTreeTableBindingFormatter

                            })
                        ]
                    }),
                }),
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Description",
                        design: "Bold"
                    }),
                    template: new sap.m.Text({
                        text: "{MDESC}"
                    }),
                }),
            ],
            rows: {
                path: "/WS20/MIMETREE",
                parameters: {
                    arrayNames: ['MIMETREE']
                }
            },
            extension: [
                new sap.m.OverflowToolbar({
                    content: [
                        new sap.m.Button({
                            icon: "sap-icon://expand-group",
                            press: oAPP.events.ev_MimeTreeTableExpand
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://collapse-group",
                            press: oAPP.events.ev_MimeTreeTableCollapse
                        }),
                    ]
                })
            ],
            contextMenu: new sap.m.Menu({
                items: {
                    path: "/WS20/MIMETREE/CTXMENU",
                    template: new sap.m.MenuItem({
                        icon: "{ICON}",
                        key: "{KEY}",
                        text: "{TXT}",
                        enabled: "{ENABLED}",
                        startsSection: "{ISSTART}",
                        visible: "{VISIBLE}"
                    })
                },
                itemSelected: oAPP.events.ev_MimeTreeCtxMenuClick
            }),

            beforeOpenContextMenu: oAPP.events.ev_MimeTreeTableContextMenu,
            rowSelectionChange: oAPP.events.ev_MimeTreeTableRowSelect,
            firstVisibleRowChanged: function (oEvent) {

                var oTable = oEvent.getSource();

                var aRows = oTable.getRows(),
                    iRowLen = aRows.length;

                if (iRowLen <= 0) {
                    return;
                }

                for (var i = 0; i < iRowLen; i++) {

                    var oRow = aRows[i],
                        oRowBindCtx = oRow.getBindingContext();

                    if (!oRowBindCtx) {
                        return;
                    }

                    // mime tree의 binding 값을 확인하여 level, row별 css를 적용한다.
                    oAPP.fn.fnMimeTreeTableRowCssApply(oRow);

                }

            },

        }).addStyleClass("u4aWsMimeTreeTable");

        return oTreeTable;

    }; // end of oAPP.fn.fnGetMimeTreeTable

    /************************************************************************
     * Mime Tree Table에 대한 Binding Formatter 
     * **********************************************************************
     * @param {Char1} MYAPP  
     * - 'X' : Mime 이 존재하는 여러 APP 목록 중 현재 진입한 APP와 같을 경우
     * - ''  : Mime 이 존재하는 여러 APP 목록 중 현재 진입한 APP와 다를 경우
     * @param {Char1} TYPE  
     * - F: 폴더
     * - F 이외에는 모두 일반 파일로 간주
     * @param {Int} ZLEVEL
     * - Tree Table Level
     * @param {Object} MYAPPCHILD
     * - 'X' : 현재 진입한 APP의 하위 Object 인 경우
     * - ''  : 현재 진입한 APP의 하위 Object 가 아닌 경우
     ************************************************************************/
    oAPP.fn.fnMimeTreeTableBindingFormatter = function (MYAPP, TYPE, ZLEVEL, MYAPPCHILD) {

        var oRow = this.getParent().getParent();
        if (!oRow) {
            return;
        }

        var oRowDomRef = oRow.getDomRef();
        if (!oRowDomRef) {
            return;
        }

        // mime tree의 binding 값을 확인하여 level, row별 css를 적용한다.
        oAPP.fn.fnMimeTreeTableRowCssApply(oRow);

    }; // end of oAPP.fn.fnMimeTreeTableBindingFormatter

    /************************************************************************
     * mime tree의 binding 값을 확인하여 level, row별 css를 적용한다.
     * **********************************************************************/
    oAPP.fn.fnMimeTreeTableRowCssApply = function (oRow) {

        oRow.removeStyleClass("u4aMimeTreeMyApp");
        oRow.removeStyleClass("u4aMimeTreeDarkRow");
        oRow.removeStyleClass("u4aMimeTreeBrightRow");
        oRow.removeStyleClass("u4aMimeTreeMyAppChild");

        var oRowBindCtx = oRow.getBindingContext();

        if (oRowBindCtx === null) {
            oRow.addStyleClass("u4aMimeTreeDarkRow");
            return;
        };

        var ZLEVEL = oRowBindCtx.getObject("ZLEVEL"),
            MYAPP = oRowBindCtx.getObject("MYAPP"),
            MYAPPCHILD = oRowBindCtx.getObject("MYAPPCHILD"),
            TYPE = oRowBindCtx.getObject("TYPE");

        if (ZLEVEL == 1) {
            oRow.addStyleClass("u4aMimeTreeBrightRow");
            return;
        }

        if (ZLEVEL == 2) {
            oRow.addStyleClass("u4aMimeTreeDarkRow");
            return;
        }

        if (MYAPP == 'X') {
            oRow.addStyleClass("u4aMimeTreeMyApp");
            return;
        }

        if (MYAPPCHILD == 'X') {
            oRow.addStyleClass("u4aMimeTreeMyAppChild");
            return;
        }

        if (TYPE == 'F') {
            oRow.addStyleClass("u4aMimeTreeDarkRow");
            return;
        }

    }; // end of oAPP.fn.fnMimeTreeTableRowCssApply

    /************************************************************************
     * Mime Tree Table의 트리 레벨 펼치기 공통 function
     * **********************************************************************
     * @param {Object} oTreeTable  
     * - Mime Tree Table Instance 
     ************************************************************************/
    oAPP.fn.fnCommonMimeTreeTableExpand = function (oTreeTable) {

        var iSelIdx = oTreeTable.getSelectedIndex();
        if (iSelIdx == -1) {
            return;
        }

        var oCtx = oTreeTable.getContextByIndex(iSelIdx),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        if (oData.ZLEVEL == 1 || oData.ZLEVEL == 2) {
            oTreeTable.expandToLevel(99);
            return;
        }

        var aCHILDTREE = oData.MIMETREE,
            iTreeCnt = aCHILDTREE.length;

        var iSelIndex = iSelIdx;

        if (iTreeCnt >= 0) {
            oTreeTable.expand(iSelIndex);
        }

        function lf_expand(aCHILDTREE) {

            var iTreeCnt = aCHILDTREE.length;
            if (iTreeCnt == 0) {
                return;
            }

            for (var i = 0; i < iTreeCnt; i++) {

                iSelIndex++;

                var oChild = aCHILDTREE[i],
                    aChild = oChild.MIMETREE,
                    iChildCnt = aChild.length;

                if (iChildCnt != 0) {
                    oTreeTable.expand(iSelIndex);
                    lf_expand(aChild);
                }

            }

        } // end of lf_expand

        lf_expand(aCHILDTREE);

    }; // end of oAPP.fn.fnCommonMimeTreeTableExpand

    /************************************************************************
     * Mime Tree Table의 트리 레벨 접기 공통 function
     * **********************************************************************
     * @param {Object} oTreeTable  
     * - Mime Tree Table Instance 
     ************************************************************************/
    oAPP.fn.fnCommonMimeTreeTableCollapse = function (oTreeTable) {

        var iSelIdx = oTreeTable.getSelectedIndex();
        if (iSelIdx == -1) {
            return;
        }

        oTreeTable.collapse(iSelIdx);

    }; // end of oAPP.fn.fnCommonMimeTreeTableCollapse

    /************************************************************************
     * Mime ContextMenu => 폴더 생성
     * **********************************************************************
     * @param {Object} oTreeTable  
     * - Mime Tree Table Instance 
     ************************************************************************/
    oAPP.fn.fnMimeTreeCreateFolder = function (oTreeTable) {

        var iIndex = oTreeTable.getSelectedIndex(),
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        var oMimeFolder = {
            FLDNM: "",
            DESC: "",
            FLDPATH: oData.URL
        };

        // MIME Folder 생성 팝업의 Input 초기 데이터 모델 세팅
        oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CRFLD", oMimeFolder);

        var oDialog = sap.ui.getCore().byId("CrMimeFldDlg");
        if (oDialog) {
            oDialog.open();
            return;
        }

        // MIME Folder 생성 팝업의 FORM
        var oCrMimeFldDlgForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 2,
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
                                required: true,
                                design: "Bold",
                                text: "Folder Name"
                            }),
                            fields: new sap.m.Input({
                                value: "{/WS20/MIMETREE/CRFLD/FLDNM}",
                                valueState: "{/WS20/MIMETREE/CRFLD/FLDNM_VS}",
                                valueStateText: "{/WS20/MIMETREE/CRFLD/FLDNM_VSTXT}",
                                submit: oAPP.events.ev_createMimeFolderEvent
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                // required: true,
                                design: "Bold",
                                text: "Description"
                            }),
                            fields: new sap.m.Input({
                                value: "{/WS20/MIMETREE/CRFLD/DESC}",
                                submit: oAPP.events.ev_createMimeFolderEvent
                            })
                        }),

                    ]

                }),

            ]

        });

        // MIME Folder 생성 팝업
        var oCrMimeFldDlg = new sap.m.Dialog("CrMimeFldDlg", {
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "150px",
            title: "[U4A] MIME Folder Create",
            titleAlignment: sap.m.TitleAlignment.Center,
            icon: "sap-icon://add-folder",
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_createMimeFolderEvent
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_createMimeFolderCloseEvent
                }),
            ],
            content: [
                oCrMimeFldDlgForm
            ]

        });

        oCrMimeFldDlg.open();

    }; // end of oAPP.fn.fnMimeTreeCreateFolder

    /************************************************************************
     * Mime ContextMenu => Mime Object 삭제
     * **********************************************************************
     * @param {Object} oTreeTable  
     * - Mime Tree Table Instance 
     ************************************************************************/
    oAPP.fn.fnMimeTreeDeleteObject = function (oTreeTable) {

        // 질문 팝업?	
        var sMsg = "삭제 하시겠습니까?";

        oAPP.fn.fnMimeCRUD_MessageBox(sMsg, oAPP.fn.fnMimeTreeDeleteCallback.bind(oTreeTable));

    }; // end of oAPP.fn.fnMimeTreeDeleteObject

    /************************************************************************
     * Mime ContextMenu 전용 메시지 박스
     * **********************************************************************
     * @param {String} sMsg  
     * - message
     * 
     * @param {Function} fnCallback
     * - MessageBox Callback
     ************************************************************************/
    oAPP.fn.fnMimeCRUD_MessageBox = function (sMsg, fnCallback) {

        parent.showMessage(sap, 30, 'I', sMsg, fnCallback);

    }; // end of oAPP.fn.fnMimeCRUD_MessageBox

    /************************************************************************
     * Mime ContextMenu => Mime Object 삭제 질문 팝업 callback
     * **********************************************************************
     * @param {Object} oResult  
     * - Mime 삭제 MessageBox의 삭제 실행, 취소에 대한 정보
     * - 'YES': 삭제 실행, 'CANCLE': 삭제 취소
     ************************************************************************/
    oAPP.fn.fnMimeTreeDeleteCallback = function (oResult) {

        if (oResult == null || oResult != "YES") {
            return;
        }

        var oTreeTable = this;

        var iIndex = oTreeTable.getSelectedIndex(),
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        var sObjType = "FILE";

        if (oData.FOLDER == 'X') {
            sObjType = "FOLDER";
        }

        var oDelObj = {
            TRCOD: "D", // C: 생성, D: 삭제
            OBJTYPE: sObjType, // FILE: 파일, FOLD: 폴더
            FLDNM: oData.NTEXT, // 파일 및 폴더 명
            FLDPATH: oData.URL, // 파일 및 폴더 경로
            DESC: oData.MDESC, // DESCRIPTION
            DEVPKG: "$TMP", // 개발 패키지
            REQNO: "", // Request/Task
            // CONTENT : "",			// 파일 컨텐츠(xstring)	
        };

        var sPath = parent.getServerPath() + '/set_mime_crud',
            oFormData = new FormData();

        oFormData.append("MIMEINFO", JSON.stringify(oDelObj));

        // 서버 전송
        sendAjax(sPath, oFormData, oAPP.fn.fnMimeDeleteSuccess.bind(oTreeTable), null, null, null, lf_errorCallback);

        // 에러 발생 시 콜백
        function lf_errorCallback(oResult) {

            var oMimeDialog = sap.ui.getCore().byId("u4aMimeTreeDlg");
            if (!oMimeDialog) {
                return;
            }

            if (oMimeDialog.isOpen && oMimeDialog.isOpen()) {
                oMimeDialog.close();
            }

        }

    }; // end of oAPP.fn.fnMimeTreeDeleteCallback

    /************************************************************************
     * Mime ContextMenu => Mime Object 삭제 성공 후 결과 callback
     * **********************************************************************
     * @param {Object} oResult  
     * - Mime 삭제 후 결과 정보 
     ************************************************************************/
    oAPP.fn.fnMimeDeleteSuccess = function (oResult) {

        parent.setBusy('');

        if (oResult.RETCD == 'E') {

            var oCurrWin = REMOTE.getCurrentWindow();
            oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

            parent.setSoundMsg('02'); // sap sound(error)

            parent.showMessage(sap, 20, 'E', oResult.RETMSG);

            return;
        }

        var oTreeTable = this;

        var iIndex = oTreeTable.getSelectedIndex(),
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oTreeTableModel = oTreeTable.getModel();

        oTreeTableModel.setProperty(oCtx.sPath, null, true); // 마임 트리 테이블에 데이터 삭제
        oTreeTableModel.setProperty("/WS20/MIME", null, true); // 마임의 프로퍼티 데이터 초기화
        oTreeTableModel.setProperty("/WS20/MIMEDATA", null, true); // 마임의 미리보기 모델 초기화        

    }; // end of oAPP.fn.fnMimeDeleteSuccess

    /************************************************************************
     * MIME UPLOAD의 파일 첨부
     * **********************************************************************
     * @param {Object} oTreeTable  
     * - Mime Tree table instance
     ************************************************************************/
    oAPP.fn.fnMimeTreeAttachFiles = function (oTreeTable) {

        // 마임 첨부파일 정보 모델 초기화
        oAPP.common.fnSetModelProperty("/WS20/MIMETREE/FILEATTACHES", null);

        var oAttachMimeDlg = sap.ui.getCore().byId("attachMimeDlg"),
            oAttachMimeFileUp = sap.ui.getCore().byId("mimeAttachFileup");

        if (oAttachMimeDlg) {
            oAttachMimeFileUp.setValue("");
            oAttachMimeDlg.rerender();
            oAttachMimeDlg.open();
            return;
        }

        var oFileUploadUI = oAPP.fn.fnGetMimeFileAttachUI(); // file upload 화면 구하기

        // MIME File Attach 생성 팝업
        var oAttachMimeDlg = new sap.m.Dialog("attachMimeDlg", {
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "300px",
            title: "[U4A] MIME File Attach",
            titleAlignment: sap.m.TitleAlignment.Center,
            icon: "sap-icon://attachment",
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "Save",
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_attachMimeDlgSaveEvent
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    text: "Cancel",
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_attachMimeDlgCloseEvent
                }),
            ],
            content: [
                oFileUploadUI
            ]

        }).addStyleClass("sapUiContentPadding");

        oAttachMimeDlg.open();

    }; // end of oAPP.fn.fnMimeTreeAttachFiles

    /************************************************************************
     * MIME UPLOAD 팝업의 파일 첨부 및 첨부 결과 화면 만들기
     * **********************************************************************/
    oAPP.fn.fnGetMimeFileAttachUI = function () {

        var oFileUploader = oAPP.fn.fnGetMimeTreeFileAttachFileUploader(),
            oTable = oAPP.fn.fnGetMimeTreeFileAttachTable();

        return new sap.m.VBox({
            items: [
                oFileUploader,
                oTable
            ]
        });

    }; // end of oAPP.fn.fnGetMimeFileAttachUI

    /************************************************************************
     * MIME UPLOAD 팝업의 파일 첨부 UI 만들기
     * **********************************************************************/
    oAPP.fn.fnGetMimeTreeFileAttachFileUploader = function () {

        return new sap.ui.unified.FileUploader("mimeAttachFileup", {
            uploadOnChange: false,
            multiple: true,
            change: oAPP.events.ev_MimeTreeFileAttachChange,
        });

    }; // end of oAPP.fn.fnGetMimeTreeFileAttachFileUploader

    /************************************************************************
     * MIME UPLOAD 팝업의 첨부된 파일 리스트를 표현할 테이블 만들기
     * **********************************************************************/
    oAPP.fn.fnGetMimeTreeFileAttachTable = function () {

        return new sap.m.Table({
            columns: [
                new sap.m.Column({
                    header: new sap.m.Label({
                        design: "Bold",
                        text: "File Name"
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label({
                        design: "Bold",
                        text: "Description"
                    })
                }),
            ],
            items: {
                path: "/WS20/MIMETREE/FILEATTACHES",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({
                            text: "{name}"
                        }),
                        new sap.m.Input({
                            value: "{desc}"
                        })
                    ]
                })
            }

        });

    }; // end of oAPP.fn.fnGetMimeTreeFileAttachTable

    /************************************************************************
     * 선택된 Mime object 다운로드
     * **********************************************************************/
    oAPP.fn.fnMimeTreeFileDown = function (oTreeTable) {

        var iIndex = oTreeTable.getSelectedIndex(),
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // 로그인 유지 여부 체크 후 Mime Repository의 선택한 파일 가져오기
        oAPP.common.sendAjaxLoginChk(lf_LoginOk);

        function lf_LoginOk(oReturn) {

            if (oReturn.TYPE != "S") {
                parent.setBusy('');
                return;
            }

            // Mime Object 구하기
            oAPP.fn.fnGetMimeObject(oData.URL, lf_success);

        }

        function lf_success(oMimeObj) {

            var sFileName = oData.NTEXT;

            parent.setBusy('');

            if (oMimeObj.size <= 0) {
                return;
            }

            // 파일 다운로드 API
            oAPP.fn.fnFileDown(sFileName, oMimeObj);

        }

    }; // end of oAPP.fn.fnMimeTreeFileDown

    /************************************************************************
     * Mime Object (ArrayBuffer) 구하기
     * **********************************************************************/
    oAPP.fn.fnGetMimeObject = function (sMimePath, fnSuccess) {

        // 서버를 호출하여 Application 정보 검색
        var sPath = parent.getServerPath() + '/getmimeobj',

            oFormData = new FormData();

        oFormData.append("URL", sMimePath);

        parent.setBusy('X');

        // function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {

        sendAjax(sPath, oFormData, fnSuccess, null, null, 'POST', null, 'X');

    }; // oAPP.fn.fnGetMimeObject

    /************************************************************************
     * 파일 다운로드 API
     * **********************************************************************/
    oAPP.fn.fnFileDown = function (sFileName, oMimeObj) {

        let defaultDownPath = APP.getPath("downloads");

        // 이전에 지정한 파일 다운 폴더 경로가 있을 경우 해당 경로 띄우기.
        if (!!oAPP.attr._filedownFolderPath) {
            defaultDownPath = oAPP.attr._filedownPath;
        }

        // 다운받을 폴더 지정하는 팝업에 대한 Option
        var options = {
            // See place holder 1 in above image
            title: "File Download",

            // See place holder 2 in above image            
            defaultPath: defaultDownPath,

            properties: ['openDirectory', 'dontAddToRecent']

        };

        var oFilePathPromise = REMOTE.dialog.showOpenDialog(REMOTE.getCurrentWindow(), options);

        oFilePathPromise.then((oPaths) => {

            if (oPaths.canceled) {
                return;
            }

            var fileName = sFileName,

                //파일 Path 와 파일 명 조합 
                folderPath = oPaths.filePaths[0],
                filePath = folderPath + "\\" + fileName; //폴더 경로 + 파일명

            // 방금 선택한 폴더 경로를 저장
            oAPP.attr._filedownFolderPath = folderPath;

            var fileReader = new FileReader();
            fileReader.onload = function (event) {

                var arrayBuffer = event.target.result,
                    buffer = parent.Buffer.from(arrayBuffer);

                //PC DOWNLOAD 
                FS.writeFile(filePath, buffer, {}, (err, res) => {

                    if (err) {
                        return;
                    }

                    // 파일 다운받은 폴더를 오픈한다.
                    SHELL.showItemInFolder(filePath);

                });

            };

            fileReader.readAsArrayBuffer(oMimeObj);

        });

    }; // end of oAPP.fn.fnFileDown

    /************************************************************************
     * Mime Tree Default Context Menu List
     * **********************************************************************/
    oAPP.fn.fnGetMimeTreeDefCtxMenuList = function () {

        return [{
                ICON: "",
                KEY: "K1",
                TXT: "Expand Subtree",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K2",
                TXT: "Collapse Subtree",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K3",
                TXT: "Create Folder",
                ENABLED: true,
                ISSTART: true,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K4",
                TXT: "Delete Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K5",
                TXT: "Import Mime Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            },
            {
                ICON: "",
                KEY: "K6",
                TXT: "Download Mime Object",
                ENABLED: true,
                ISSTART: false,
                VISIBLE: true
            }
        ];

    }; // end of oAPP.fn.fnGetMimeTreeDefCtxMenuList

    /************************************************************************
     * 선택된 mime object의 미리보기
     * **********************************************************************
     * @param {Object || Buffer Array} DATA  
     * - 선택된 mime object
     ************************************************************************/
    oAPP.fn.fnSetMimeObjectPreview = function (DATA) {

        // 파일 사이즈가 0이면 그냥 리턴
        if (DATA.size == 0) {
            return;
        }

        var sMimetype = DATA.type,
            sExplicitTypeName = "";

        var bIsAllow = oAPP.fn.fnCheckAllowedMimeTypes(sMimetype);
        if (!bIsAllow) {
            parent.setBusy('');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {

            var result = e.target.result;

            var oFileData = {
                CONTENT: result,
                VISI: sExplicitTypeName
            };

            oAPP.common.fnSetModelProperty("/WS20/MIMEDATA", oFileData);
            sap.ui.getCore().getModel().refresh(true);

            parent.setBusy('');

        };

        if (sMimetype.startsWith("image")) {
            sExplicitTypeName = "IMAGE";
            reader.readAsDataURL(DATA);
            return;
        }

        sExplicitTypeName = "TEXT";
        reader.readAsText(DATA, "UTF-8");

    }; // end of oAPP.fn.fnSetMimeObjectPreview

    /************************************************************************
     * 선택된 mime object가 mime 미리보기에 표현 가능한 MIME Type 인지 여부 체크
     * **********************************************************************
     * @param {String} sMimetype  
     * - 선택된 mime object의 mime type
     ************************************************************************/
    oAPP.fn.fnCheckAllowedMimeTypes = function (sMimetype) {

        var aAllowedMimeTypes = [
                "text/plain",
                "text/html",
                "text/css",
                "text/javascript",
                "application/x-javascript",
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/bmp",
            ],
            aTypeLen = aAllowedMimeTypes.length;

        var bIsAllow = false;

        for (var i = 0; i < aTypeLen; i++) {

            var sAllowedType = aAllowedMimeTypes[i];

            if (sAllowedType != sMimetype) {
                continue;
            }

            return true;
        }

        return bIsAllow;

    }; // end of oAPP.fn.fnCheckAllowedMimeTypes

    /************************************************************************
     * 마임 폴더 생성 성공시 트리 구조에서 폴더를 추가한다.
     * **********************************************************************
     * @param {Object} oTreeData  
     * - Mime Tree에 표현될 Mime Tree Data
     ************************************************************************/
    oAPP.fn.fnMimeFolderCreateSuccess = function (oTreeData) {

        var oTreeTable = new sap.ui.getCore().byId("mimeTree");
        if (!oTreeTable) {
            return;
        }

        // 트리 테이블에 선택한 라인의 모델 정보를 구한다.
        var iIndex = oTreeTable.getSelectedIndex(),
            oCtx = oTreeTable.getContextByIndex(iIndex),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath),
            aChild = (oData.MIMETREE == null ? [] : oData.MIMETREE);

        var iChildLen = aChild.length;

        // 생성된 폴더 정보를, 현재 선택한 마임 트리 하위에 추가한다.
        if (iChildLen == 0) {
            // oData.MIMETREE = e.MIMETREE;
            oData.MIMETREE = [];

        }

        oData.MIMETREE.push(oTreeData);

        oTreeTable.getModel().refresh(true);

        // 마임 생성 팝업을 닫는다.
        var oDialog = sap.ui.getCore().byId("CrMimeFldDlg");
        if (!oDialog) {
            return;
        }

        if (oDialog.isOpen()) {
            oDialog.close();
        }

        oDialog.close();

        oTreeTable.expand(iIndex);

    }; // end of oAPP.fn.fnMimeFolderCreateSuccess

    /************************************************************************
     * Mime Repository Popup => Tree Table 펼치기 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeTableExpand = function (oEvent) {

        var oTreeTable = oEvent.getSource().getParent().getParent();
        if (!oTreeTable) {
            return;
        }

        // tree table 펼침 공통 메소드
        oAPP.fn.fnCommonMimeTreeTableExpand(oTreeTable);

    }; // end of oAPP.events.ev_MimeTreeTableExpand

    /************************************************************************
     * Mime Repository Popup => Tree Table 접기 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeTableCollapse = function (oEvent) {

        var oTreeTable = oEvent.getSource().getParent().getParent();
        if (!oTreeTable) {
            return;
        }

        oAPP.fn.fnCommonMimeTreeTableCollapse(oTreeTable);

    }; // end of oAPP.events.ev_mimeTreeTableCollapse

    /************************************************************************
     * Mime Repository Popup => Tree Table 마우스 우클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeCtxMenuClick = function (oEvent) {

        // contextmenu의 선택한 메뉴 정보를 구한다.
        var oTreeTable = oEvent.getSource().getParent(),
            oCtxMenuItm = oEvent.getParameter("item"),
            sCtxMenuKey = oCtxMenuItm.getProperty("key");

        switch (sCtxMenuKey) {

            case "K1": // Mime Tree Table 펼침

                oAPP.fn.fnCommonMimeTreeTableExpand(oTreeTable);

                break;

            case "K2": // Mime Tree Table 접힘

                oAPP.fn.fnCommonMimeTreeTableCollapse(oTreeTable);

                break;

            case "K3": // Folder 생성

                oAPP.fn.fnMimeTreeCreateFolder(oTreeTable);

                break;

            case "K4": // Folder 및 파일 삭제

                oAPP.fn.fnMimeTreeDeleteObject(oTreeTable);

                break;

            case "K5": // Mime File Attach

                oAPP.fn.fnMimeTreeAttachFiles(oTreeTable);

                break;

            case "K6": // Mime Down

                oAPP.fn.fnMimeTreeFileDown(oTreeTable);

                break;

        }

    }; // end of oAPP.events.ev_MimeTreeCtxMenuClick

    /************************************************************************
     * Mime upload의 파일 첨부시 발생되는 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeFileAttachChange = function (oEvent) {

        var sModelPath = "/WS20/MIMETREE/FILEATTACHES";

        var aFiles = oAPP.common.fnGetModelProperty(sModelPath), // 기존에 모델에 저장된 파일 정보
            aAttachFile = oEvent.getParameter("files"), // 방금 첨부한 파일 정보
            iAttLen = aAttachFile.length,
            aNewFiles = [];

        // 방금 첨부한 파일정보를 Array에 쌓는다.
        for (var i = 0; i < iAttLen; i++) {
            aNewFiles.push(aAttachFile[i]);
        }

        oEvent.getSource().setValue('');

        // 기존에 모델에 저장한 파일 정보가 없을 경우,
        // 방금 첨부한 파일을 모델에 저장한다.
        if (!aFiles) {
            oAPP.common.fnSetModelProperty(sModelPath, aNewFiles);
            return;
        }

        // 기존 모델에 저장한 파일정보와 방금 첨부한 파일을 합쳐서 모델에 저장한다.
        var aConcatFile = aFiles.concat(aNewFiles);

        oAPP.common.fnSetModelProperty(sModelPath, aConcatFile);

    }; // end of oAPP.events.fnMimeTreeFileAttachChange

    /************************************************************************
     * Mime upload의 파일 첨부 후 저장 이벤트
     ************************************************************************/
    oAPP.events.ev_attachMimeDlgSaveEvent = function () {

        var sModelPath = "/WS20/MIMETREE/FILEATTACHES",
            aFiles = oAPP.common.fnGetModelProperty(sModelPath);

        if (!aFiles) {
            return;
        }

        var oTreeTable = sap.ui.getCore().byId("mimeTree");
        if (!oTreeTable) {
            return;
        }

        lf_createMimeFile();

        function lf_createMimeFile(sReqNo) {

            // 현재 APP 정보
            var oAppInfo = parent.getAppInfo();

            // 트리 테이블에 선택한 라인의 모델 정보를 구한다.
            var iIndex = oTreeTable.getSelectedIndex(),
                oCtx = oTreeTable.getContextByIndex(iIndex),
                oData = oTreeTable.getModel().getProperty(oCtx.sPath);

            var oCrFldInfo = {
                TRCOD: "C", // C: 생성, D: 삭제
                OBJTYPE: "FILE", // FILE: 파일, FOLD: 폴더
                FLDPATH: oData.URL, // 파일 및 폴더 경로
                DEVPKG: oAppInfo.PACKG, // 개발 패키지
                REQNO: sReqNo == null ? oAppInfo.REQNO : sReqNo, // Request/Task                
            };

            var sPath = parent.getServerPath() + '/set_mime_crud',
                oFormData = new FormData();

            var iFileCnt = aFiles.length;

            for (var i = 0; i < iFileCnt; i++) {

                var oFile = aFiles[i];

                var sFnm_Desc = oFile.name + "|" + (oFile.desc == null ? "" : oFile.desc);
                oFormData.append("FILE", oFile, sFnm_Desc);

            }

            oFormData.append("MIMEINFO", JSON.stringify(oCrFldInfo));

            sendAjax(sPath, oFormData, lf_attachFile);

            function lf_attachFile(e) {

                parent.setBusy('');

                if (e == {}) {
                    return;
                }

                if (e.RETCD == "E") {

                    var oCurrWin = REMOTE.getCurrentWindow();
                    oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

                    parent.setSoundMsg('02'); // sap sound(error)

                    parent.showMessage(sap, 10, "", e.RETMSG);

                    if (e.SCRIPT != null) {
                        eval(e.SCRIPT);
                    }

                    return;
                }

                var oTreeTable = sap.ui.getCore().byId("mimeTree");
                if (!oTreeTable) {
                    return;
                }

                // 트리 테이블에 선택한 라인의 모델 정보를 구한다.
                var iIndex = oTreeTable.getSelectedIndex(),
                    oCtx = oTreeTable.getContextByIndex(iIndex),
                    oData = oTreeTable.getModel().getProperty(oCtx.sPath),
                    // aChild = oData.MIMETREE,
                    aChild = (oData.MIMETREE == null ? [] : oData.MIMETREE),
                    iChildLen = aChild.length;

                if (iChildLen == 0) {
                    oData.MIMETREE = e.MIMETREE;
                } else {
                    oData.MIMETREE = aChild.concat(e.MIMETREE);
                }

                oTreeTable.getModel().refresh(true);

                var oAttachMimeDlg = sap.ui.getCore().byId('attachMimeDlg');
                if (!oAttachMimeDlg) {
                    return;
                }

                if (oAttachMimeDlg.isOpen()) {
                    oAttachMimeDlg.close();
                }

                oTreeTable.expand(iIndex);

            } // end of lf_attachFile

        } // end of lf_createMimeFile

        // [Server Eval] 마임 폴더 생성 시, cts 팝업을 호출해야 하는 경우.
        function lf_createMimeCts() {

            oAPP.fn.fnCtsPopupOpener(function (oResult) {

                // 마임 폴더를 생성
                lf_createMimeFile(oResult.TRKORR);

            });

        } // end of lf_createMimeCts


        // // 저장 실행 전 확인 팝업 띄우기
        // // 질문 팝업?
        // var sMsg = "저장하시겠습니까?";

        // oAPP.fn.fnMimeCRUD_MessageBox(sMsg, lf_MsgCallback);

        // function lf_MsgCallback(oResult) {

        //     if (oResult == null || oResult != "YES") {
        //         return;
        //     }

        //     var sPath = parent.getServerPath() + '/set_mime_crud',
        //         oFormData = new FormData();

        //     var iFileCnt = aFiles.length;

        //     for (var i = 0; i < iFileCnt; i++) {

        //         var oFile = aFiles[i];

        //         var sFnm_Desc = oFile.name + "|" + (oFile.desc == null ? "" : oFile.desc);
        //         oFormData.append("FILE", oFile, sFnm_Desc);

        //     }

        //     oFormData.append("MIMEINFO", JSON.stringify(oCrFldInfo));

        //     sendAjax(sPath, oFormData, lf_attachFile);

        //     function lf_attachFile(e) {

        //         parent.setBusy('');
        //         if (e == {}) {
        //             return;
        //         }

        //         if (e.RETCD != 'S') {
        //             return;
        //         }

        //         var oTreeTable = sap.ui.getCore().byId("mimeTree");
        //         if (!oTreeTable) {
        //             return;
        //         }

        //         // 트리 테이블에 선택한 라인의 모델 정보를 구한다.
        //         var iIndex = oTreeTable.getSelectedIndex(),
        //             oCtx = oTreeTable.getContextByIndex(iIndex),
        //             oData = oTreeTable.getModel().getProperty(oCtx.sPath),
        //             // aChild = oData.MIMETREE,
        //             aChild = (oData.MIMETREE == null ? [] : oData.MIMETREE),
        //             iChildLen = aChild.length;

        //         if (iChildLen == 0) {
        //             oData.MIMETREE = e.MIMETREE;
        //         } else {
        //             oData.MIMETREE = aChild.concat(e.MIMETREE);
        //         }

        //         oTreeTable.getModel().refresh(true);

        //         var oAttachMimeDlg = sap.ui.getCore().byId('attachMimeDlg');
        //         if (!oAttachMimeDlg) {
        //             return;
        //         }

        //         if (oAttachMimeDlg.isOpen()) {
        //             oAttachMimeDlg.close();
        //         }

        //         oTreeTable.expand(iIndex);

        //     } // end of lf_attachFile

        // } // end of lf_MsgCallback

    }; // end of oAPP.events.ev_attachMimeDlgSaveEvent

    /************************************************************************
     * Mime upload의 파일 첨부 팝업 닫기 이벤트
     ************************************************************************/
    oAPP.events.ev_attachMimeDlgCloseEvent = function (oEvent) {

        var oDialog = oEvent.getSource().getParent();
        oDialog.close();
        oDialog.destroy();

    }; // end of oAPP.events.ev_attachMimeDlgCloseEvent

    /************************************************************************
     * Mime Repository Popup => MIME Context Menu 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeTableContextMenu = function (oEvent) {

        var oTreeTable = oEvent.getSource(),
            iSelectRow = oEvent.getParameter("rowIndex"),
            oCtx = oTreeTable.getContextByIndex(iSelectRow);

        // 우클릭한 라인을 선택 처리 한다.
        oTreeTable.setSelectedIndex(iSelectRow);

        var oRowData = oTreeTable.getModel().getProperty(oCtx.sPath),
            oAppInfo = parent.getAppInfo();

        // mime tree 의 기본 contextmenu 정보를 구한다. 
        var aCtxMenu = oAPP.fn.fnGetMimeTreeDefCtxMenuList();

        if (oAppInfo.IS_EDIT == 'X') {

            lf_mimeEdit();
            return;

        }

        lf_mimeDisp();

        function lf_mimeEdit() {

            // MYAPP 일 경우..
            if (oRowData.MYAPP == 'X') {

                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;

            }

            //MYAPPCHILD 일 경우..
            if (oRowData.MYAPPCHILD == 'X') {

                // MYAPP CHILD 면서 폴더 일 경우
                if (oRowData.TYPE == 'F') {

                    aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                    oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                    return;

                }

                // MYAPP CHILD 면서 파일 일 경우..			
                aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

                oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;

            }

            // MYAPP이 아닐 경우..

            // MYAPP이 아니면서 폴더일 경우.
            if (oRowData.TYPE == 'F') {

                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;
            }

            // MYAPP이 아니면서 파일일 경우.
            aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

            oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

        }

        function lf_mimeDisp() {

            var aMimeTree = oAPP.common.fnGetModelProperty("/WS20/MIMETREE");

            // 폴더일 경우
            if (oRowData.TYPE == 'F') {

                // 폴더면서 하위가 있는 경우
                var aChild = aMimeTree.filter(arr => arr.PARENT == oRowData.CHILD);
                if (aChild.length < 0) {

                    aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                    oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                    return;

                }

                // 폴더면서 하위가 없는 경우
                aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;
            }

            // 파일일 경우

            aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = true;

            oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

        }

    }; // end of oAPP.events.ev_MimeTreeTableContextMenu

    /************************************************************************
     * Mime Repository Popup => 트리 테이블의 row 선택 이벤트
     ************************************************************************/
    oAPP.events.ev_MimeTreeTableRowSelect = function (oEvent) {

        // 마우스 우클릭일 경우는 실행하지 않기
        if ("which" in event) {
            if (event.which == 3) {
                return;
            }
        }

        oAPP.common.fnSetModelProperty("/WS20/MIME", {});
        oAPP.common.fnSetModelProperty("/WS20/MIMEDATA", {});

        sap.ui.getCore().getModel().refresh(true);

        var iSelIdx = oEvent.getSource().getSelectedIndex();

        if (iSelIdx == -1) {
            return;
        }

        var oTreeTable = oEvent.getSource(),
            oCtx = oTreeTable.getContextByIndex(iSelIdx),
            oData = oTreeTable.getModel().getProperty(oCtx.sPath);

        // 선택한 위치가 폴더이면 return.
        if (oData.TYPE == 'F') {
            return;
        }

        // 로그인 유지 여부 체크 후 Mime Repository의 선택한 파일 가져오기
        oAPP.common.sendAjaxLoginChk(lf_LoginOk);

        function lf_LoginOk(oReturn) {

            if (oReturn.TYPE != "S") {
                parent.setBusy('');
                return;
            }

            var oMimeInfo = {
                URL: oData.URL,
                ERDAT: oData.ERDAT,
                ERZET: oData.ERZET,
                ERNAM: oData.ERNAM
            };

            oAPP.common.fnSetModelProperty("/WS20/MIME", oMimeInfo);

            // Mime Object 구하기
            oAPP.fn.fnGetMimeObject(oMimeInfo.URL, lf_success);

            function lf_success(oMimeObj) {

                // Mime 미리보기 실행
                oAPP.fn.fnSetMimeObjectPreview(oMimeObj);

                parent.setBusy('');

            }

        } // end of lf_success        

    }; // end of oAPP.events.ev_MimeTreeTableRowSelect

    /************************************************************************
     * Mime Repository Popup => MIME URL Copy Button Event
     ************************************************************************/
    oAPP.events.ev_pressMimeUrlCopy = function (oInput, oEvent) {

        var oMimeInfo = oAPP.common.fnGetModelProperty("/WS20/MIME");
        if (!oMimeInfo) {
            return;
        }

        var $oInputDom = oInput._$input;
        if ($oInputDom.length == 0) {
            return;
        }

        var sInputValue = oInput.getValue();
        if (sInputValue == "") {
            return;
        }

        $oInputDom.select();

        document.execCommand("copy");

        $oInputDom[0].setSelectionRange(0, 0);

        parent.showMessage(sap, 10, null, "Clipboard Copy!");

    }; // end of oAPP.events.ev_pressMimeUrlCopy

    /************************************************************************
     * Mime Repository Popup => Cancel Button Event
     ************************************************************************/
    oAPP.events.ev_MimeDlgCancel = function (oEvent) {

        var oDialog = sap.ui.getCore().byId(C_DIALOG_ID);
        if (oDialog == null) {
            return;
        }

        if (oDialog.isOpen()) {
            oDialog.close();
            oDialog.destroy();
        }

    }; // oAPP.events.ev_MimeDlgCancel   

    /************************************************************************
     * Mime Repository Popup => MIME Folder 생성 팝업
     ************************************************************************/
    oAPP.events.ev_createMimeFolderEvent = function (oEvent) {

        var oDialog = oEvent.getSource().getParent(),
            oDialogModel = oDialog.getModel(),
            oData = oDialogModel.getProperty("/WS20/MIMETREE/CRFLD");

        if (oData.FLDNM == "") {

            oData.FLDNM_VS = "Error";
            oData.FLDNM_VSTXT = "Folder Name is Require!!";

            oAPP.common.fnSetModelProperty("/WS20/MIMETREE/CRFLD/", oData);

            return;
        }

        // 마임 폴더를 생성
        lf_createMimeFolder();

        function lf_createMimeFolder(sReqNo) {

            // 현재 APP 정보
            var oAppInfo = parent.getAppInfo();

            // 마임 폴더 생성 정보
            var oCrFldInfo = {
                TRCOD: "C", // C: 생성, D: 삭제		
                OBJTYPE: "FOLD", // FOLD: 폴더, FILE: 파일
                FLDNM: oData.FLDNM, // 파일 및 폴더 명
                FLDPATH: oData.FLDPATH, // 파일 및 폴더 경로
                DESC: oData.DESC, // DESCRIPTION
                DEVPKG: oAppInfo.PACKG, // 개발 패키지
                REQNO: sReqNo == null ? oAppInfo.REQNO : sReqNo, // Request/Task
                CONTENT: "", // 파일 컨텐츠(xstring)
                CLSID: oAppInfo.CLSID
            };

            // 마임 생성 서비스
            var sPath = parent.getServerPath() + '/set_mime_crud';

            var oFormData = new FormData();
            oFormData.append("MIMEINFO", JSON.stringify(oCrFldInfo));

            // Ajax 서버 호출
            sendAjax(sPath, oFormData, lf_success);

            function lf_success(oResult) {

                parent.setBusy('');

                if (oResult.RETCD == 'E') {

                    var oCurrWin = REMOTE.getCurrentWindow();
                    oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

                    parent.setSoundMsg('02'); // sap sound(error)

                    parent.showMessage(sap, 10, "", oResult.RETMSG);

                    if (oResult.SCRIPT != null) {
                        eval(oResult.SCRIPT);
                    }

                    return;
                }

                // 마임 폴더 생성 성공시 트리 구조에서 폴더를 추가한다.
                oAPP.fn.fnMimeFolderCreateSuccess(oResult.MIMETREE);

            } // end of lf_success

        } // end of lf_createMimeFolder

        // [Server Eval] 마임 폴더 생성 시, cts 팝업을 호출해야 하는 경우.
        function lf_createMimeCts() {

            oAPP.fn.fnCtsPopupOpener(function (oResult) {

                // 마임 폴더를 생성
                lf_createMimeFolder(oResult.TRKORR);

            });

        } // end of lf_createMimeCts

    }; // end of oAPP.events.ev_createMimeFolderEvent

    /************************************************************************
     * Mime Repository Popup => MIME Folder 생성 팝업 닫기 이벤트
     ************************************************************************/
    oAPP.events.ev_createMimeFolderCloseEvent = function (oEvent) {

        oEvent.getSource().getParent().close();

    }; // end of ev_createMimeFolderCloseEvent

})(window, $, oAPP);