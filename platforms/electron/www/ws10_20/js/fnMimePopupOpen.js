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
        CURRWIN = REMOTE.getCurrentWindow(),
        PATH = parent.PATH,
        APP = parent.APP,
        FS = REMOTE.require('fs'),
        DIALOG = REMOTE.dialog,
        SHELL = REMOTE.shell,
        APPCOMMON = oAPP.common;

    let USERINFO = parent.getUserInfo();
    let LANGU = USERINFO.LANGU;

    const
        C_DIALOG_ID = "u4aMimeTreeDlg";

    var APPINFO,
        oThemeColors;

    oAPP.fn.fnMimePopupOpen = function () {

        oThemeColors = sap.ui.core.theming.Parameters.get();

        if (APPINFO) {
            APPINFO = undefined;
        }

        let oWs20App = APPCOMMON.fnGetModelProperty("/WS20/APP");
        if (oWs20App) {
            APPINFO = jQuery.extend(true, {}, oWs20App);
        }

        let oWs30App = APPCOMMON.fnGetModelProperty("/WS30/APP");
        if (oWs30App) {
            APPINFO = jQuery.extend(true, {}, oWs30App);
            APPCOMMON.fnSetModelProperty("/WS20", {});
        }

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

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
        APPCOMMON.fnSetModelProperty("/WS20/MIME", oMimeInfo);      // Mime File 정보	
        APPCOMMON.fnSetModelProperty("/WS20/MIMETREE", null);       // Mime Tree Data	
        APPCOMMON.fnSetModelProperty("/WS20/MIMEDATA", oMimeData);  // Mime File Data

        var oMimeTreeDlg = sap.ui.getCore().byId(C_DIALOG_ID);
        if (oMimeTreeDlg) {            
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
                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C21"), // URL Copy
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

            }).addStyleClass("sapUiTinyMarginEnd"),

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

            }).addStyleClass("sapUiTinyMarginEnd"),

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
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C18"), // URL
                                }),
                                fields: new sap.m.HBox({
                                    renderType: sap.m.FlexRendertype.Bare,
                                    items: [
                                        oUrlInput,
                                        oUrlCopyBtn
                                    ]
                                })
                            }),
                            new sap.ui.layout.form.FormElement({
                                label: new sap.m.Label({
                                    design: sap.m.LabelDesign.Bold,
                                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"), // Create
                                }),
                                fields: new sap.m.HBox({
                                    renderType: sap.m.FlexRendertype.Bare,
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
                headerText: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C17"), // Properties
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
                    }).bindProperty("src", {
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
                    }).bindProperty("visible", "/WS20/MIMEDATA/VISI", function (value) {

                            if (value == "TEXT") {
                                return true;
                            }

                            return false;

                        }),

                    new sap.m.HBox({
                        width: "100%",
                        height: "100%",
                        alignItems: sap.m.FlexAlignItems.Center,
                        justifyContent: sap.m.FlexAlignItems.Center,
                        items: [
                            new sap.m.Title({
                                text: APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "313"), // This file can't be previewed.
                            })
                        ]
                    }).bindProperty("visible", "/WS20/MIMEDATA/VISI", function (value) {

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

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://picture"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C26"), // U4A MIME Repository
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
                                    orientation: sap.ui.core.Orientation.Vertical,
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

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        //MIME 데이터 구하기..
        var sPath = parent.getServerPath() + '/getmimetree?APPID=' + APPINFO.APPID;

        sendAjax(sPath, null, lf_success, null, true, 'GET');

        async function lf_success(oResult) {

            // 현재 떠있는 브라우저
            var oCurrWin = REMOTE.getCurrentWindow();

            if (oResult.RETCD === "E") {

                // 콘솔용 오류 메시지
                var aConsoleMsg = [             
                    `[PATH]: www/ws10_20/js/fnMimePopupOpen.js`,  
                    `=> oAPP.fn.fnGetMimeTreeData`,
                    `=> lf_success`,
                    `[LOG]: Mime Data Not Found`     
                ];

                console.log(aConsoleMsg.join("\r\n"));
                console.trace();

                // 오류 사운드 실행
                parent.setSoundMsg('02'); // sap sound(error)

                // 작업표시줄 깜빡임
                oCurrWin.flashFrame(true);

                // busy 끄고 Lock 풀기
                APPCOMMON.fnSetBusyLock("");

                return;
            }

            /**
             * @since   2025-04-15
             * @version 3.5.1-sp3
             * @author  soccerhs
             * 
             * @title - Mime Repository 속도 개선에 따른 보완작업
             * @description
             * - 전체 마임 정보 중, 자식이 있는 노드일 경우에는
             *   트리 테이블에 "접기 펼치기" 아이콘을 활성화 하기 위해 Dummy 자식을 붙인다.
             */
            if(APPCOMMON.checkWLOList("C", "UHAK901016") === true){

                // 각 노드 중, Child가 있는 노드만 추출한다.
                let aHasChild = oResult.MIMETREE.filter(e => e.ISECD === 'X');
                
                // 자식이 있을 경우에는 Tree Table에 "접기/펼치기 아이콘"을 활성화 하기 위해 
                // 해당 노드에 Dummy 자식을 붙여 놓는다.
                for(var oHasChild of aHasChild){

                    // 노드 레벨이 3레벨일 경우 Skip..
                    if(oHasChild.ZLEVEL !== 3){
                        continue;
                    }

                    // 노드 중 나의 APPID는 Skip..
                    if(oHasChild.NTEXT === APPINFO.APPID){
                        continue;
                    }

                    // 더미 자식을 넣는다.
                    let oDummyChild = {
                        PARENT: oHasChild.CHILD,
                        CHILD: "DUMMY_CHILD",
                        NTEXT: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "312") // No data Found.
                    };

                    oResult.MIMETREE.push(oDummyChild);

                }
                
            }

            // Mime Tree 데이터에 My APP 표시를 위한 플래그 지정
            oResult.MIMETREE = oAPP.fn.fnSetMimeTreeMyAppFlag(oResult.MIMETREE);

            APPCOMMON.fnSetModelProperty("/WS20/MIMETREE", oResult.MIMETREE);

            var oModel = sap.ui.getCore().getModel();

            // Model Data를 Tree로 구성
            oAPP.fn.fnSetTreeJson(oModel, "WS20.MIMETREE", "CHILD", "PARENT", "MIMETREE");

            // mime Tree에서 처음 실행 시 1레벨 펼치고 첫번째 라인에 셀렉션을 추가한다. 
            var oMimeTreeTable = sap.ui.getCore().byId("mimeTree");
            if (oMimeTreeTable == null) {

                // busy 끄고 Lock 풀기
                oAPP.common.fnSetBusyLock("");

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

                var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D00"); // Current
                sMsg += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A30"); // MIME Folder                
                sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "196", sMsg); // &1 does not exist.

                parent.showMessage(sap, 10, "E", sMsg);

            }

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

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

        var oCtx = oTreeTable.getContextByIndex(iSelIdx);
        var oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
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
            busyIndicatorDelay: 0,
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "500px",
                minSize: 500
            }),
            columns: [
                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A50"), // Object Name
                        design: sap.m.LabelDesign.Bold
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
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                        design: sap.m.LabelDesign.Bold
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

                let oTable = oEvent.getSource();
                
                // 스크롤 이동시 컨텍스트 메뉴가 떠있을 경우
                // 컨텍스트 메뉴를 닫는다.
                let oCtxMenu = oTable.getContextMenu();
                if(oCtxMenu && oCtxMenu.close){
                    oCtxMenu.close();
                }

                // ev_mimePopupRowsUpdated(oEvent);

                // var oTable = oEvent.getSource();

                // var aRows = oTable.getRows(),
                //     iRowLen = aRows.length;

                // if (iRowLen <= 0) {
                //     return;
                // }

                // for (var i = 0; i < iRowLen; i++) {

                //     var oRow = aRows[i],
                //         oRowBindCtx = oRow.getBindingContext();

                //     if (!oRowBindCtx) {
                //         return;
                //     }

                //     // mime tree의 binding 값을 확인하여 level, row별 css를 적용한다.
                //     oAPP.fn.fnMimeTreeTableRowCssApply(oRow);

                // }

            },

            rowsUpdated: function (oEvent) {
                ev_mimePopupRowsUpdated(oEvent);
            }

        }).addStyleClass("u4aWsMimeTreeTable");


        /**
         * @since   2025-04-15
         * @version 3.5.1-sp3
         * @author  soccerhs
         * 
         * @title - Mime Repository 속도 개선에 따른 보완작업
         * @description
         * - 트리 테이블의 "접힘/펼침 버튼" 버튼을 선택하여 펼친 경우, 
         *   선택한 노드의 하위 자식을 한번도 가져오지 않은 상태일 경우에만
         *   서버에 가서 하위 자식 데이터를 서버에서 구하여 하위 자식 데이터를 넣는다.
         */
        if(APPCOMMON.checkWLOList("C", "UHAK901016") === true){
            oTreeTable.attachToggleOpenState(_onMimeTreeToggleOpenState);
        }

        return oTreeTable;

    }; // end of oAPP.fn.fnGetMimeTreeTable


    function ev_mimePopupRowsUpdated(oEvent) {

        let oTable = oEvent.getSource(),
            aRows = oTable.getRows(),
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

    }

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

        // oRow.removeStyleClass("u4aMimeTreeMyApp");
        // oRow.removeStyleClass("u4aMimeTreeDarkRow");
        // oRow.removeStyleClass("u4aMimeTreeBrightRow");
        // oRow.removeStyleClass("u4aMimeTreeMyAppChild");  

        let sRowBgCol = oThemeColors.sapUiTableRowSelectionBG,
            sRowBgCol_rgba = parent.WSUTIL.hexToRgb(sRowBgCol, 0.6);

        oRow.$().css({ "background-color": "" });

        var oRowBindCtx = oRow.getBindingContext();

        if (oRowBindCtx === null) {
            // oRow.addStyleClass("u4aMimeTreeDarkRow");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapContent_DisabledTextColor });
            return;
        };

        var ZLEVEL = oRowBindCtx.getObject("ZLEVEL"),
            MYAPP = oRowBindCtx.getObject("MYAPP"),
            MYAPPCHILD = oRowBindCtx.getObject("MYAPPCHILD"),
            TYPE = oRowBindCtx.getObject("TYPE");

        if (ZLEVEL == 1) {
            // oRow.addStyleClass("u4aMimeTreeBrightRow");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapTextColor });
            return;
        }

        if (ZLEVEL == 2) {
            // oRow.addStyleClass("u4aMimeTreeDarkRow");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapContent_DisabledTextColor });
            return;
        }

        if (MYAPP == 'X') {
            // oRow.addStyleClass("u4aMimeTreeMyApp");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapTextColor });
            oRow.$().css({ "background-color": sRowBgCol_rgba });
            return;
        }

        if (MYAPPCHILD == 'X') {
            // oRow.addStyleClass("u4aMimeTreeMyAppChild");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapTextColor });
            return;
        }

        if (TYPE == 'F') {
            // oRow.addStyleClass("u4aMimeTreeDarkRow");
            oRow.$().find(".sapMText").css({ color: oThemeColors.sapContent_DisabledTextColor });
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

        var oCtx = oTreeTable.getContextByIndex(iSelIdx);
        if(!oCtx){
            return;
        }

        var oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

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
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if(!oCtx){
            return;
        }

        var oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

        var oMimeFolder = {
            FLDNM: "",
            DESC: "",
            FLDPATH: oData.URL
        };

        // MIME Folder 생성 팝업의 Input 초기 데이터 모델 세팅
        APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CRFLD", oMimeFolder);

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
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D01"), // Folder Name
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
                                design: sap.m.LabelDesign.Bold,
                                text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
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

        var sTitle = "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A30"); // MIME Folder
        sTitle += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01"); // Create

        // MIME Folder 생성 팝업
        var oCrMimeFldDlg = new sap.m.Dialog("CrMimeFldDlg", {
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "150px",
            title: sTitle, // [U4A] MIME Folder Create
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
        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "003"); // Do you really want to delete the object?

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

        var iIndex = oTreeTable.getSelectedIndex();
        var oCtx = oTreeTable.getContextByIndex(iIndex);
        if(!oCtx){
            return;
        }

        let oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

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
            DEVPKG : APPINFO.PACKG, // 개발 패키지
            REQNO: APPINFO.REQNO || "" // Request/Task 
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
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if(!oCtx){
            return;
        }

        var oTreeTableModel = oTreeTable.getModel();
        if(!oTreeTableModel){
            return;
        }

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
        APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/FILEATTACHES", null);

        var oAttachMimeDlg = sap.ui.getCore().byId("attachMimeDlg"),
            oAttachMimeFileUp = sap.ui.getCore().byId("mimeAttachFileup");

        if (oAttachMimeDlg) {
            oAttachMimeFileUp.setValue("");
            oAttachMimeDlg.rerender();
            oAttachMimeDlg.open();
            return;
        }

        var oFileUploadUI = oAPP.fn.fnGetMimeFileAttachUI(); // file upload 화면 구하기

        var sTitle = "[U4A] " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C33"); // MIME File Attach

        // MIME File Attach 생성 팝업
        var oAttachMimeDlg = new sap.m.Dialog("attachMimeDlg", {
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "300px",
            title: sTitle, // [U4A] MIME File Attach
            titleAlignment: sap.m.TitleAlignment.Center,
            icon: "sap-icon://attachment",
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64"), // Save
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_attachMimeDlgSaveEvent
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41"), // Cancel
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
                        design: sap.m.LabelDesign.Bold,
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C35") // File Name
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
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
            oCtx = oTreeTable.getContextByIndex(iIndex);
        
        var oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

        // 로그인 유지 여부 체크 후 Mime Repository의 선택한 파일 가져오기
        APPCOMMON.sendAjaxLoginChk(lf_LoginOk);

        function lf_LoginOk(oReturn) {

            if (oReturn.RETCD != "S") {
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

        var sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B79"); // File
        sTitle += " " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B78"); // Download

        // 다운받을 폴더 지정하는 팝업에 대한 Option
        var options = {
            // See place holder 1 in above image
            title: sTitle, // File Download,

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
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C27"), // Expand Subtree
            ENABLED: true,
            ISSTART: false,
            VISIBLE: true
        },
        {
            ICON: "",
            KEY: "K2",
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C28"), // Collapse Subtree
            ENABLED: true,
            ISSTART: false,
            VISIBLE: true
        },
        {
            ICON: "",
            KEY: "K3",
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C29"), // Create Folder
            ENABLED: true,
            ISSTART: true,
            VISIBLE: true
        },
        {
            ICON: "",
            KEY: "K4",
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C30"), // Delete Object
            ENABLED: true,
            ISSTART: false,
            VISIBLE: true
        },
        {
            ICON: "",
            KEY: "K5",
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C31"), // Import Mime Object
            ENABLED: true,
            ISSTART: false,
            VISIBLE: true
        },
        {
            ICON: "",
            KEY: "K6",
            TXT: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C32"), // Download Mime Object
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

            APPCOMMON.fnSetModelProperty("/WS20/MIMEDATA", oFileData);
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
            oCtx = oTreeTable.getContextByIndex(iIndex);

        if(!oCtx){
            return;
        }

        let oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

        var aChild = (oData.MIMETREE == null ? [] : oData.MIMETREE);

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
        var oTreeTable = oEvent.getSource().getParent();
        if(!oTreeTable){
            return;
        }

        var oCtxMenuItm = oEvent.getParameter("item");
        if(!oCtxMenuItm){
            return;
        }

        var sCtxMenuKey = oCtxMenuItm.getProperty("key");

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

        var aFiles = APPCOMMON.fnGetModelProperty(sModelPath), // 기존에 모델에 저장된 파일 정보
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
            APPCOMMON.fnSetModelProperty(sModelPath, aNewFiles);
            return;
        }

        // 기존 모델에 저장한 파일정보와 방금 첨부한 파일을 합쳐서 모델에 저장한다.
        var aConcatFile = aFiles.concat(aNewFiles);

        APPCOMMON.fnSetModelProperty(sModelPath, aConcatFile);

    }; // end of oAPP.events.fnMimeTreeFileAttachChange


    /************************************************************************
     * Mime File 저장 시 중복 이름 유무 체크
     ************************************************************************/
    // function _checkDupSaveFile(aFiles){

    //     let oRES = {
    //         RETCD: "E",
    //         ERRCD: "",
    //         RDATA: ""
    //     };


    //     if(!aFiles || Array.isArray(aFiles) === false || aFiles.length === 0){
    //         return;
    //     }

    //     let iFileLength = aFiles.length;
    //     for(var i = 0; i < iFileLength; i++){

    //         let sFileName = "";

    //         for(var j = 0; j < iFileLength; j++){


    //         }

    //     }




    // } // end of _checkDupSaveFile

    /************************************************************************
     * Mime upload의 파일 첨부 후 저장 이벤트
     ************************************************************************/
    oAPP.events.ev_attachMimeDlgSaveEvent = function () {

        var sModelPath = "/WS20/MIMETREE/FILEATTACHES",
            aFiles = APPCOMMON.fnGetModelProperty(sModelPath);

        if (!aFiles) {
            return;
        }

        var oTreeTable = sap.ui.getCore().byId("mimeTree");
        if (!oTreeTable) {
            return;
        }

        // // 첨부된 파일 중복 체크
        // let oCheckDupResult = _checkDupSaveFile(aFiles);
        // if(oCheckDupResult.RETCD === "E"){

        //     return;
        // }

        lf_createMimeFile();

        function lf_createMimeFile(sReqNo) {

            // 트리 테이블에 선택한 라인의 모델 정보를 구한다.
            var iIndex = oTreeTable.getSelectedIndex(),
                oCtx = oTreeTable.getContextByIndex(iIndex);

            if(!oCtx){
                return;
            }

            var oModel = oTreeTable.getModel();
            if(!oModel){
                return;
            }

            var oData = oModel.getProperty(oCtx.sPath);
            if(!oData){
                return;
            }

            var oCrFldInfo = {
                TRCOD: "C", // C: 생성, D: 삭제
                OBJTYPE: "FILE", // FILE: 파일, FOLD: 폴더
                FLDPATH: oData.URL, // 파일 및 폴더 경로
                DEVPKG: APPINFO.PACKG, // 개발 패키지
                REQNO: sReqNo == null ? APPINFO.REQNO : sReqNo, // Request/Task                
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
                    oCtx = oTreeTable.getContextByIndex(iIndex);

                if(!oCtx){
                    return;                    
                }

                let oModel = oTreeTable.getModel();
                if(!oModel){
                    return;
                }

                var oData = oModel.getProperty(oCtx.sPath);
                if(!oData){
                    return;
                }
                
                // aChild = oData.MIMETREE,
                var aChild = (oData.MIMETREE == null ? [] : oData.MIMETREE),
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

        if (!oCtx) {
            return;
        }

        // 우클릭한 라인을 선택 처리 한다.
        oTreeTable.setSelectedIndex(iSelectRow);

        let oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oRowData = oModel.getProperty(oCtx.sPath);
        // APPINFO = parent.getAppInfo();

        // mime tree 의 기본 contextmenu 정보를 구한다. 
        var aCtxMenu = oAPP.fn.fnGetMimeTreeDefCtxMenuList();

        if (APPINFO.IS_EDIT == 'X') {

            lf_mimeEdit();
            return;

        }

        lf_mimeDisp();

        function lf_mimeEdit() {

            // MYAPP 일 경우..
            if (oRowData.MYAPP == 'X') {

                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;

            }

            //MYAPPCHILD 일 경우..
            if (oRowData.MYAPPCHILD == 'X') {

                // MYAPP CHILD 면서 폴더 일 경우
                if (oRowData.TYPE == 'F') {

                    aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                    APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                    return;

                }

                // MYAPP CHILD 면서 파일 일 경우..			
                aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

                APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;

            }

            // MYAPP이 아닐 경우..

            // MYAPP이 아니면서 폴더일 경우.
            if (oRowData.TYPE == 'F') {

                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;
            }

            // MYAPP이 아니면서 파일일 경우.
            aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;

            APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

        }

        function lf_mimeDisp() {

            var aMimeTree = APPCOMMON.fnGetModelProperty("/WS20/MIMETREE");

            // 폴더일 경우
            if (oRowData.TYPE == 'F') {

                // 폴더면서 하위가 있는 경우
                var aChild = aMimeTree.filter(arr => arr.PARENT == oRowData.CHILD);
                if (aChild.length < 0) {

                    aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                    aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                    APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                    return;

                }

                // 폴더면서 하위가 없는 경우
                aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
                aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
                aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = false;

                APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

                return;
            }

            // 파일일 경우

            aCtxMenu.find(arr => arr.KEY == "K1").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K2").VISIBLE = false;
            aCtxMenu.find(arr => arr.KEY == "K3").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K4").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K5").ENABLED = false;
            aCtxMenu.find(arr => arr.KEY == "K6").ENABLED = true;

            APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CTXMENU", aCtxMenu);

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

        APPCOMMON.fnSetModelProperty("/WS20/MIME", {});
        APPCOMMON.fnSetModelProperty("/WS20/MIMEDATA", {});

        sap.ui.getCore().getModel().refresh(true);

        var iSelIdx = oEvent.getSource().getSelectedIndex();

        if (iSelIdx == -1) {
            return;
        }

        var oTreeTable = oEvent.getSource(),
            oCtx = oTreeTable.getContextByIndex(iSelIdx);

        var oModel = oTreeTable.getModel();
        if(!oModel){
            return;
        }

        var oData = oModel.getProperty(oCtx.sPath);
        if(!oData){
            return;
        }

        // 선택한 위치가 폴더이면 return.
        if (oData.TYPE == 'F') {
            return;
        }

        // 로그인 유지 여부 체크 후 Mime Repository의 선택한 파일 가져오기
        APPCOMMON.sendAjaxLoginChk(lf_LoginOk);

        function lf_LoginOk(oReturn) {

            if (oReturn.RETCD != "S") {
                parent.setBusy('');
                return;
            }

            var oMimeInfo = {
                URL: oData.URL,
                ERDAT: oData.ERDAT,
                ERZET: oData.ERZET,
                ERNAM: oData.ERNAM
            };

            APPCOMMON.fnSetModelProperty("/WS20/MIME", oMimeInfo);

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

        var oMimeInfo = APPCOMMON.fnGetModelProperty("/WS20/MIME");
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

        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "303"); // Clipboard Copy Success!

        parent.showMessage(sap, 10, null, sMsg);

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

        var oDialog = oEvent.getSource().getParent();
        if(!oDialog){
            return;
        }

        var oDialogModel = oDialog.getModel();
        if(!oDialogModel){
            return;
        }

        var oData = oDialogModel.getProperty("/WS20/MIMETREE/CRFLD");
        if(!oData){
            return;
        }

        if (oData.FLDNM == "") {

            oData.FLDNM_VS = "Error";

            var sTxt = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D01"); // Folder Name
            sTxt = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "050", sTxt); // & is required. 

            oData.FLDNM_VSTXT = sTxt; // Folder Name is required

            APPCOMMON.fnSetModelProperty("/WS20/MIMETREE/CRFLD/", oData);

            return;
        }

        // 마임 폴더를 생성
        lf_createMimeFolder();

        function lf_createMimeFolder(sReqNo) {

            // 현재 APP 정보
            // var APPINFO = parent.getAppInfo();

            // 마임 폴더 생성 정보
            var oCrFldInfo = {
                TRCOD: "C", // C: 생성, D: 삭제		
                OBJTYPE: "FOLD", // FOLD: 폴더, FILE: 파일
                FLDNM: oData.FLDNM, // 파일 및 폴더 명
                FLDPATH: oData.FLDPATH, // 파일 및 폴더 경로
                DESC: oData.DESC, // DESCRIPTION
                DEVPKG: APPINFO.PACKG, // 개발 패키지
                REQNO: sReqNo == null ? APPINFO.REQNO : sReqNo, // Request/Task
                CONTENT: "", // 파일 컨텐츠(xstring)
                CLSID: APPINFO.CLSID
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


    /************************************************************************
     * 선택한 노드의 하위 자식 데이터를 구한다.
     ************************************************************************/
    function _getMimeChildData(oSelNode){

        return new Promise(function(resolve){

            //MIME 데이터 구하기..
            var sPath = parent.getServerPath() + "/get_mime_children";

            let oFormData = new FormData();
                oFormData.append("MIME_DATA", JSON.stringify(oSelNode));

            function fnSuccess(oResult){

                return resolve(oResult);

            }

            function fnError(){

                return resolve({
                    RETCD: "E"
                });

            }

            // function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {
            sendAjax(sPath, oFormData, fnSuccess, null, null, 'POST', fnError);

        });

    } // end of _getMimeChildData


    /************************************************************************
     * Tree Table의 "접힘/펼침" 버튼 이벤트
     ************************************************************************/
    async function _onMimeTreeToggleOpenState(oEvent){

        let bIsExpanded = oEvent.getParameter("expanded");
            
        if(bIsExpanded === false){
            return;
        }

        // let oTable = oEvent.getSource();

        let oRowCtx = oEvent.getParameter("rowContext");
        let oModel = oRowCtx.getModel();
        let sPath = oRowCtx.getPath();
        
        // 선택한 노드 정보를 구한다.
        let oSelNode = oModel.getProperty(sPath);
        let aChild = oSelNode.MIMETREE;

        // 하위에 이미 자식 데이터가 있다면 빠져나감 
        // (더미로 생성된 데이터가 없다면 이미 한번은 서버가서 자식 마임 정보를 가져왔다는 의미임)
        // 한번은 자식 데이터를 가져온적이 있다면 또 다시 자식 요소를 서버가서 구하지 않음.

        // ☝️ 더미 데이터가 있다는 의미? 
        // - 자식 데이터를 한번도 가져오지 않은 상태
        let oChild = aChild.find(e => e.CHILD === "DUMMY_CHILD");
        if(!oChild){
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");        

        // 선택한 노드의 자식 마임 데이터를 구한다.
        let oMimeChildResult = await _getMimeChildData(oSelNode);
        
        var sRetMsg = "";

        if(oMimeChildResult.RETCD === "E"){   
 
            switch (oMimeChildResult.STCOD) {
                case "E001": // 필수 파라미터가 누락된 경우                    
          
                    // 마임정보를 구하는 도중에 문제가 발생하였습니다.
                    sRetMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "313");

                    // 콘솔용 오류 메시지
                    var aConsoleMsg = [             
                        `[PATH]: www/ws10_20/js/fnMimePopupOpen.js`,  
                        `=> _onMimeTreeToggleOpenState`,
                        `=> 마임 정보 구하러 서버 호출 할 때 파라미터 필수 누락!!`,
                    ];

                    console.error(aConsoleMsg.join("\r\n"));
                    console.trace();

                    break;

                case "E002": // 서버로 전달한 파라미터 중, 마임 정보 구성이 잘못 된 경우                    
  
                    // 마임정보를 구하는 도중에 문제가 발생하였습니다.
                    sRetMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "313");                    
                    
                    // 콘솔용 오류 메시지
                    var aConsoleMsg = [             
                        `[PATH]: www/ws10_20/js/fnMimePopupOpen.js`,  
                        `=> _onMimeTreeToggleOpenState`,
                        `=> 서버에서 마임 정보 구성이 잘못됨!!`,      
                    ];

                    console.error(aConsoleMsg.join("\r\n"));
                    console.trace();

                    break;
            
                default:

                    // 마임 정보 구성중, 알 수 없는 오류가 발생하였습니다.
                    sRetMsg = parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "314"); 

                    // 콘솔용 오류 메시지
                    var aConsoleMsg = [             
                        `[PATH]: www/ws10_20/js/fnMimePopupOpen.js`,  
                        `=> _onMimeTreeToggleOpenState`,
                        `=> 알수 없는 오류 발생!!`,      
                    ];

                    console.error(aConsoleMsg.join("\r\n"));
                    console.trace();

                    break;
            }

            sRetMsg = sRetMsg + "\n\n";

            // 문제가 지속될 경우, U4A 솔루션 팀에 문의하세요.
            sRetMsg += parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "228");

            // 오류 사운드 실행
            parent.setSoundMsg('02'); // sap sound(error)
            
            CURRWIN.flashFrame(true); // 작업표시줄 깜빡임

            parent.showMessage(sap, 20, "E", sRetMsg);

            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        /**
         * 자식 마임 데이터를 구한 뒤, 
         * 자식 마임에 대한 계층 구조를 만들어 준다.
         */
        let aChildData = oMimeChildResult?.T_MIME_CHILD || [];
      
        /**
         * 선택한 노드를 복사한 후 PARENT 정보를 지운다.
         * 
         * ☝️ PARENT 정보를 지우는 이유
         * 
         * - 자식 노드에 대한 계층 구조를 만들어줄 때,
         *   계층구조 만들어주는 function 에서 부모 노드 정보가 space 인 노드가 있어야 계층구조 만들어 주기 때문에, 
         *          
         *   선택한 노드의 정보와 서버에서 구한 자식 노드 정보를 하나의 Array에 담아서
         *   계층구조 만들어주는 function을 수행한 이후에,
         *   만들어진 계층구조에서 자식 요소만 발췌한 후 원본 모델에 넣어준다.
         * 
         */
        let oCopySelNode = JSON.parse(JSON.stringify(oSelNode));
            oCopySelNode.PARENT = "";

        aChildData.push(oCopySelNode);

        let oJsonModel = new sap.ui.model.json.JSONModel();
            oJsonModel.setProperty("/MIMETREE", aChildData);

        oAPP.fn.fnSetTreeJson(oJsonModel, "MIMETREE", "CHILD", "PARENT", "MIMETREE");

        let oChilren = oJsonModel.getProperty("/MIMETREE/0");

        oSelNode.MIMETREE = oChilren.MIMETREE;
        
        // 자식 요소가 없을 경우 데이터 없음 표시를 해준다.
        if(oSelNode.MIMETREE.length === 0){
         
            // 더미 자식을 넣은 후, 데이터 없음 메시지를 노드에 출력한다.
            let oDummyChild = {
                PARENT: oSelNode.CHILD,
                CHILD: "DUMMY_CHILD",
                NTEXT: parent.WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "312") // No data Found.
            };
            
            oSelNode.MIMETREE.push(oDummyChild);
        
        }

        oModel.setProperty(sPath, oSelNode);
            
        oModel.refresh();

        // busy 끄고 Lock 풀기기
        oAPP.common.fnSetBusyLock("");        

    } // end of _onMimeTreeToggleOpenState

})(window, $, oAPP);