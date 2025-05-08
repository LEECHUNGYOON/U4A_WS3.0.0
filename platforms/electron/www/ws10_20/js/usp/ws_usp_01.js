/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp_01.js
 * - file Desc : u4a ws usp sub
 ************************************************************************/
(function (window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common,
        APP = parent.APP,
        FS = parent.FS,
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        CURRWIN = parent.CURRWIN,
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        PATH = parent.PATH,
        IPCMAIN = parent.IPCMAIN,
        PATHINFO = parent.PATHINFO,
        WSUTIL = parent.WSUTIL;


    var gfSelectRowUpdate;

    // /***************************************************************************************
    // * [WS30] USP TREE에서 현재 선택한 Node의 상위 또는 하위 형제 Node의 접힘 펼침 정보를 구한다.
    // ***************************************************************************************
    // * @param {sap.ui.table.TreeTable} oTreeTable
    // * - 좌측 Usp Tree Instance
    // *
    // * @param {Array} aNodes
    // * - 현재 선택한 Node의 형제들 정보
    // *
    // * @param {Integer} iCurrIndex
    // * - 현재 선택한 Node의 Index 정보
    // *
    // * @param {Boolean} bIsUp
    // * - 현재 선택한 Node의 상위 형제의 펼침 상태 정보를 구할지에 대한 정보
    // * - ex) true : 상위 펼침 상태 정보
    // *       false: 하위 펼침 상태 정보
    // *
    // * @return {Boolean}
    // * - true : 펼침
    // * - false: 접힘
    // ***************************************************************************************/
    // function fnIsExpandedNode(oTreeTable, aNodes, iCurrIndex, bIsUp) {

    //     var oMoveNode = (bIsUp == true ? aNodes[iCurrIndex - 1] : aNodes[iCurrIndex + 1]),
    //         aRows = oTreeTable.getRows(),
    //         iRowLength = aRows.length;

    //     for (var i = 0; i < iRowLength; i++) {

    //         var oRow = aRows[i],
    //             oRowCtx = oRow.getBindingContext();

    //         if (!oRowCtx) {
    //             continue;
    //         }

    //         if (oMoveNode.OBJKY !== oRowCtx.getObject("OBJKY")) {
    //             continue;
    //         }

    //         return oTreeTable.isExpanded(i);

    //     }

    // } // end of fnIsExpandedUpNode

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Integer} pIndex
     * - 현재 선택한 Node의 Index 정보
     * 
     * @param {Integer} pMoveIndex
     * - 이동할 Index
     **************************************************************************/
    oAPP.fn.fnSetUspTreeNodeMove = (oTreeTable, pSelIndex, pMoveIndex) => {

        zconsole.log("Tree Node Move Position");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),

            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터

            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 이동하려는 Node의 위치와 이동할 Index가 같으면 이동할 필요가 없으므로 빠져나간다.
        if (iFindIndex == (pMoveIndex - 1)) {
            return;
        }

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        var iNodeLength = oResult.Nodes.length, // 같은 노드의 갯수
            iMoveIndex = pMoveIndex;
        // 이동 하려는 위치

        // 이동하려는 위치가 노드의 갯수보다 클 경우에는
        // 이동하려는 위치값을 노드의 총 갯수로 지정
        if (iNodeLength <= pMoveIndex - 1) {
            iMoveIndex = iNodeLength;
        }

        // 최종적으로 현재 이동하려는 노드와 이동할 index가 같으면 빠져나간다.
        if (iFindIndex == (iMoveIndex - 1)) {
            return;
        }

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0];
        // 선택한 Node를 추출

        // 선택한 Node를 이전 위치에서 위로 이동 시킨다.
        oResult.Nodes.splice(iMoveIndex - 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes, oSelectedCtx, true);

        // 이동한 Node에 선택 표시를 하기 위한 이벤트 걸기
        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    };
    // end of oAPP.fn.fnSetUspTreeNodeMove

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Integer} pIndex
     * - 현재 선택한 Node의 Index 정보
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pSelIndex) => {

        zconsole.log("Tree Node Up");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 현재 선택한 Node가 최상위 일 경우는 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        var pMoveIndex = iFindIndex;

        oAPP.fn.fnSetUspTreeNodeMove(oTreeTable, pSelIndex, pMoveIndex);

    };
    // end of oAPP.fn.fnUspTreeNodeMoveUp

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pSelIndex) => {

        zconsole.log("Tree Node Down");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY),
            iNodeLength = oResult.Nodes.length;

        // 현재 선택한 Node가 최하위 일 경우는 빠져나간다.
        if (iFindIndex == iNodeLength - 1) {
            return;
        }

        var pMoveIndex = iFindIndex + 2;

        oAPP.fn.fnSetUspTreeNodeMove(oTreeTable, pSelIndex, pMoveIndex);

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

    // 이동한 Node에 선택 표시를 하기 위한 이벤트 걸기
    function _fnUspNodeSetSelectedIndex(oMeItem, oEvent) {

        zconsole.log("_fnUspNodeSetSelectedIndex");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i];

            if (oRow.isEmpty()) {
                break;
            }

            var oCtx = oRow.getBindingContext(),
                oRowData = oCtx.getModel().getProperty(oCtx.getPath()),

                // Row의 Object Key
                sOBJKY = oRowData.OBJKY;

            // 현재 순서의 Row와 선택한 Row가 같을 경우
            if (sOBJKY === oMeItem.OBJKY) { // 현재 순서의 Row Index를 구한다.
                var iIndex = oRow.getIndex();

                // 현재 순서의 Row에 라인선택 설정
                oTreeTable.setSelectedIndex(iIndex);

                // oTreeTable.setFirstVisibleRow(iIndex);

                // RowUpdate 이벤트를 해제 한다.
                oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

                gfSelectRowUpdate = undefined;

                return;

            }

        }

        // 호출 횟수 count
        if (typeof gfSelectRowUpdate._callCount === "undefined") {
            gfSelectRowUpdate._callCount = 0;
        } else {
            gfSelectRowUpdate._callCount++;
        }

        // 혹시라도 RowUpdate 호출 횟수가 5회 이상이면
        // 무한루프를 막기 위한 조치..
        if (gfSelectRowUpdate._callCount >= 5) {
            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);
            gfSelectRowUpdate = undefined;
            return;
        }

        if (typeof gfSelectRowUpdate.iRowLength === "undefined") {
            gfSelectRowUpdate.iRowLength = 0;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        // 스크롤을 이동하여 다시 찾는다.
        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oMeItem);
        }, 0);

    }
    // end of _fnUspNodeSetSelectedIndex

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeUspTreeData = () => {

        if (!oAPP.attr.oBeforeUspTreeData) {
            return;
        }

        delete oAPP.attr.oBeforeUspTreeData;

    };
    // end of oAPP.fn.fnClearOnBeforeUspTreeData

    /**************************************************************************
     * [WS30] USP Tree의 Node 이동 팝업
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMovePosition = (oTreeTable, pIndex) => {

        var sBindRootPath = "/WS30/MOVEPOS",
            oCtx = oTreeTable.getContextByIndex(pIndex);

        if (!oCtx) {
            return;
        }

        var oData = oTreeTable.getModel().getProperty(oCtx.sPath),
            oInitData = {
                SELIDX: pIndex,
                STEPVAL: 1,
                STEPVS: sap.ui.core.ValueState.None,
                STEPVST: ""
            };

        // USP 생성 팝업의 초기 데이터 모델 세팅
        APPCOMMON.fnSetModelProperty(sBindRootPath, oInitData);

        var oDialog = sap.ui.getCore().byId("ws30_movePosPopup");
        if (oDialog) {
            oDialog.open();
            return;
        }

        // USP Tree의 Node 이동 팝업
        var oDialog = new sap.m.Dialog("ws30_movePosPopup", {

            // properties
            draggable: true,
            resizable: true,
            icon: "sap-icon://outdent",
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A57"), // Move Position
            // contentWidth: "500px",

            // aggregations
            buttons: [
                new sap.m.Button("ws30_movePosOk", {
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: ev_uspTreeNodeMovePosition.bind(this, oTreeTable)
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: ev_uspTreeNodeMovePosPopupClose
                }),
            ],

            content: [new sap.m.StepInput("ws30_step", {
                required: true,
                min: 1,
                value: `{${sBindRootPath}/STEPVAL}`,
                valueState: `{${sBindRootPath}/STEPVS}`,
                valueStateText: `{${sBindRootPath}/STEPVST}`
            }).attachBrowserEvent("keydown", ev_uspTreeNodeStepInputEnter)],

            // association
            initialFocus: "ws30_step",

            afterOpen: function (oEvent) {

                var oStepInput = sap.ui.getCore().byId("ws30_step");
                if (!oStepInput) {
                    return;
                }

                var oInputDom = oStepInput.getDomRef("input-inner");
                if (!oInputDom) {
                    return;
                }

                oInputDom.select();

            },

            // events
            afterClose: function () {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oDialog.open();

    };
    // end of oAPP.fn.fnUspTreeNodeMovePosition

    /**************************************************************************
     * [WS30] Usp Tree 데이터를 마지막 저장한 데이터로 복원한다.
     **************************************************************************/
    oAPP.fn.fnResetUspTree = () => {

        if (!oAPP.attr.oBeforeUspTreeData) {
            return;
        }

        APPCOMMON.fnSetModelProperty("/WS30/USPTREE", oAPP.attr.oBeforeUspTreeData, true);

        // 마지막 저장 전의 Usp Tree 정보를 초기화 한다.
        oAPP.fn.fnClearOnBeforeUspTreeData();

    };
    // end of oAPP.fn.fnResetUspTree

    /**************************************************************************
     * [WS30] USP New Window
     **************************************************************************/
    oAPP.fn.fnUspNewWindow = (oTreeTable, pIndex) => {

        let oCtx = oTreeTable.getContextByIndex(pIndex),
            oTreeModel = oTreeTable.getModel(),
            oTreeData = oTreeModel.getProperty(oCtx.sPath),
            oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),

            sSpath = oTreeData.SPATH, // Usp Page Path
            sChanelID = BROWSKEY + sSpath; // IPC 통신 채널 ID

        sChanelID = btoa(sChanelID);

        let oThemeInfo = parent.getThemeInfo(), // theme 정보
            sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = sSpath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.CHANNELID = sChanelID;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath("USPNEW");
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oSendData = {
                APPINFO: oAppInfo,
                TREEDATA: oTreeData,
                oUserInfo: parent.getUserInfo(),
                BROWSKEY: BROWSKEY,
                oThemeInfo: oThemeInfo,
                CHANNELID: sChanelID
            };

            oBrowserWindow.webContents.send('if-uspnew', oSendData);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            parent.WSUTIL.setBrowserOpacity(oBrowserWindow);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => { // IPCMAIN 이벤트 해제

            IPCMAIN.removeListener(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

            oBrowserWindow = null;

            CURRWIN.focus();

        });


        IPCMAIN.on(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

    }; // end of oAPP.fn.fnUspNewWindow

    oAPP.fn.fnUspNewWindowIPCEvent = (res, data) => {

  
    };
    // end of oAPP.fn.fnUspNewWindowIPCEvent

    /**************************************************************************
     * Usp Pattern 정보를 바인딩한다.
     **************************************************************************/
    oAPP.fn.fnModelBindingUspPattern = () => {

        return new Promise(async (resolve) => {

            let sPatternJsonPath = PATHINFO.DEF_PATT, //parent.getPath("DEF_PATT"), // 기본 패턴 경로
                sCustomPatternJsonPath = PATHINFO.CUST_PATT, //parent.getPath("CUST_PATT"), // 커스텀 패턴 경로
                sPatternJson = FS.readFileSync(sPatternJsonPath, 'utf-8'), // 기본 패턴 JSON Data
                sCustomPatternJson = FS.readFileSync(sCustomPatternJsonPath, 'utf-8'); // 커스텀 패턴 Json Data

            let aPatternJson,
                aCustmPatternJson,
                aPatternMerge;

            try {

                aPatternJson = JSON.parse(sPatternJson); // 기본 패턴 Json Parse
                aCustmPatternJson = JSON.parse(sCustomPatternJson); // Custom Pattern Json Parse

            } catch (error) {
                console.error(error);
                throw new Error(error);
            }

            // 기본 패턴과 커스텀 패턴을 합친다.
            aPatternMerge = aPatternJson.concat(aCustmPatternJson);

            // 우클릭 메뉴에 추가할 메뉴를 세팅한다.
            let aCtxMenu = _additionalUspCtxMenu();

            // 패턴 메뉴가 없을 경우에는 해당 변수를 Array로 만든다.
            if(Array.isArray(aPatternMerge) === false){
                aPatternMerge = [];
            }

            // // TEST ------ Start

            // // 패키지일 경우에는 추가 컨텍스트 메뉴를 추가하지 않는다.
            // if (APP.isPackaged) {
            //     aCtxMenu = [];
            // }
            
            // // TEST ------ End

            // 추가할 컨텍스트 메뉴가 있다면 기존 메뉴정보와 합친다.
            if(Array.isArray(aCtxMenu) === true && aCtxMenu.length !== 0){
                aPatternMerge = aPatternMerge.concat(aCtxMenu);
            }            

            // APPCOMMON.fnSetModelProperty("/PATTN", aPatternMerge);
            APPCOMMON.fnSetModelProperty("/WS30/USP_EDITOR_CTX_MENU", aPatternMerge);

            let oModel = sap.ui.getCore().getModel();

            parent.WSUTIL.parseArrayToTree(oModel, "WS30.USP_EDITOR_CTX_MENU", "CKEY", "PKEY", "USP_EDITOR_CTX_MENU");
            // parent.WSUTIL.parseArrayToTree(oModel, "PATTN", "CKEY", "PKEY", "PATTN");

            oModel.refresh();

            resolve();

        });

    }
    // end of oAPP.fn.fnModelBindingUspPattern

    /**************************************************************************
     * [WS30] USP Codeeditor ContextMenu Open
     **************************************************************************/
    // oAPP.fn.fnUspCodeeditorContextMenuOpen = (oEvent, oCodeEditor) => {

    //     // 패턴메뉴 선택 시, 출력될 에디터 위치를 저장한다.
    //     if (oAPP.attr.oCtxMenuClickEditor) {
    //         delete oAPP.attr.oCtxMenuClickEditor;
    //     }

    //     oAPP.attr.oCtxMenuClickEditor = oCodeEditor;

    //     let sMenuId = "uspCDECtxMenu";

    //     let aPatterns = APPCOMMON.fnGetModelProperty("/WS30/USP_EDITOR_CTX_MENU"),
    //         oUspAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP");
            
    //     var oCtxMenu = sap.ui.getCore().byId(sMenuId);
    //     if (oCtxMenu) {

    //         let oCtxMenuModel = oCtxMenu.getModel();

    //         oCtxMenuModel.setProperty("/", {
    //             USP_EDITOR_CTX_MENU: aPatterns,
    //             APPINFO: oUspAppInfo
    //         });

    //         oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);

    //         return;
    //     }

    //     var oCtxMenu = new sap.m.Menu(sMenuId, {
    //         itemSelected: (oEvent) => { // USP Pattern Contextmenu Event
    //             oAPP.fn.fnUspPatternContextMenuClick(oEvent); // #[ws_usp_01.js]
    //         },
    //         items: {
    //             path: "/USP_EDITOR_CTX_MENU",
    //             template: new sap.m.MenuItem({
    //                 key: "{CKEY}",
    //                 text: "{DESC}",
    //                 startsSection: "{ISSTART}",
    //                 icon: "{ICON}",
    //                 enabled: "{ENABLED}",
    //                 // tooltip: "{DATA}",
    //                 items: {
    //                     // path: "PATTN",
    //                     path: "USP_EDITOR_CTX_MENU",
    //                     templateShareable: true,
    //                     template: new sap.m.MenuItem({
    //                         key: "{CKEY}",
    //                         text: "{DESC}",
    //                         startsSection: "{ISSTART}",
    //                         icon: "{ICON}",
    //                         enabled: "{ENABLED}",
    //                         // tooltip: "{DATA}",
    //                         items: {
    //                             path: "USP_EDITOR_CTX_MENU",
    //                             templateShareable: true,
    //                             template: new sap.m.MenuItem({
    //                                 key: "{CKEY}",
    //                                 text: "{DESC}",
    //                                 startsSection: "{ISSTART}",
    //                                 icon: "{ICON}",
    //                                 enabled: "{ENABLED}",
    //                                 // tooltip: "{DATA}",
    //                                 items: {
    //                                     path: "USP_EDITOR_CTX_MENU",
    //                                     templateShareable: true,
    //                                     template: new sap.m.MenuItem({
    //                                         key: "{CKEY}",
    //                                         text: "{DESC}",
    //                                         startsSection: "{ISSTART}",
    //                                         icon: "{ICON}",
    //                                         enabled: "{ENABLED}",
    //                                         // tooltip: "{DATA}"
    //                                     })
    //                                 }
    //                             })
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     }).addStyleClass("u4aWsUspPatternMenu");

    //     let oModel = new sap.ui.model.json.JSONModel();

    //     oModel.setData({
    //         USP_EDITOR_CTX_MENU: aPatterns,
    //         APPINFO: oUspAppInfo
    //     });

    //     oCtxMenu.setModel(oModel);

    //     oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);

    // }; // end of oAPP.fn.fnUspCodeeditorContextMenuOpen

    
    /*****************************************************
     * @since   2025-05-06
     * @version 3.5.6-sp2
     * @author  soccerhs
     * 
     * @description
     * ## USP EDITOR 변경 작업 ##
     * 
     * [WS30] Editor에 ContextMenu 이벤트 시 메뉴 팝업 띄우기 
     ******************************************************/       
    oAPP.fn.fnUspCodeeditorContextMenuOpen = (oEvent, oSelectedCtxInfo) => {

        // 선택된 컨텍스트 메뉴 정보를 전역에 저장한다.
        // 추후, 컨텍스트 메뉴 선택 시, 어떤 에디터에 출력할지 판단하기 위함.
        delete oAPP.usp.oSelectedCtxInfo;

        oAPP.usp.oSelectedCtxInfo = oSelectedCtxInfo;

        // 컨텍스트 메뉴 이벤트가 발생된 페이지 
        let oTargetPage = oSelectedCtxInfo?.oTargetPage;
        if(!oTargetPage){
            return;
        }
        

        let sMenuId = "uspCDECtxMenu";

        let aPatterns = APPCOMMON.fnGetModelProperty("/WS30/USP_EDITOR_CTX_MENU"),
            oUspAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP");
        
        var oCtxMenu = sap.ui.getCore().byId(sMenuId);
        if (oCtxMenu) {

            let oCtxMenuModel = oCtxMenu.getModel();

            oCtxMenuModel.setProperty("/", {
                USP_EDITOR_CTX_MENU: aPatterns,
                APPINFO: oUspAppInfo
            });

            
            oCtxMenu.close();
            
            oCtxMenu.openBy(oTargetPage, false, "begin top", "begin top", `${oEvent.x} ${oEvent.y}`);

            return;
        }

        var oCtxMenu = new sap.m.Menu(sMenuId, {
            itemSelected: (oEvent) => { // USP Pattern Contextmenu Event
                oAPP.fn.fnUspPatternContextMenuClick(oEvent); // #[ws_usp_01.js]
            },
            items: {
                path: "/USP_EDITOR_CTX_MENU",
                template: new sap.m.MenuItem({
                    key: "{CKEY}",
                    text: "{DESC}",
                    startsSection: "{ISSTART}",
                    icon: "{ICON}",
                    enabled: "{ENABLED}",
                    // tooltip: "{DATA}",
                    items: {
                        // path: "PATTN",
                        path: "USP_EDITOR_CTX_MENU",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{CKEY}",
                            text: "{DESC}",
                            startsSection: "{ISSTART}",
                            icon: "{ICON}",
                            enabled: "{ENABLED}",
                            // tooltip: "{DATA}",
                            items: {
                                path: "USP_EDITOR_CTX_MENU",
                                templateShareable: true,
                                template: new sap.m.MenuItem({
                                    key: "{CKEY}",
                                    text: "{DESC}",
                                    startsSection: "{ISSTART}",
                                    icon: "{ICON}",
                                    enabled: "{ENABLED}",
                                    // tooltip: "{DATA}",
                                    items: {
                                        path: "USP_EDITOR_CTX_MENU",
                                        templateShareable: true,
                                        template: new sap.m.MenuItem({
                                            key: "{CKEY}",
                                            text: "{DESC}",
                                            startsSection: "{ISSTART}",
                                            icon: "{ICON}",
                                            enabled: "{ENABLED}",
                                            // tooltip: "{DATA}"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsUspPatternMenu");

        let oModel = new sap.ui.model.json.JSONModel();

        oModel.setData({
            USP_EDITOR_CTX_MENU: aPatterns,
            APPINFO: oUspAppInfo
        });

        oCtxMenu.setModel(oModel);
      
        oCtxMenu.openBy(oTargetPage, false, "begin top", "begin top", `${oEvent.x} ${oEvent.y}`);

    }; // end of oAPP.fn.fnUspCodeeditorContextMenuOpen


    /**************************************************************************
     * [WS30] USP Pattern Context Menu Event
     **************************************************************************/
    oAPP.fn.fnUspPatternContextMenuClick = async (oEvent) => {

        // 선택한 ContextMenu 정보를 구한다.
        let oSelectMenuItem = oEvent.getParameter("item"),
            oCtx = oSelectMenuItem.getBindingContext();

        if (!oCtx) {
            return;
        }        

        // 바인딩 데이터
        let oBindData = oCtx.getProperty(oCtx.getPath());

        // 선택한 메뉴가 소스 패턴 관련 메뉴일 경우 해당 function 수행 후 
        // 이후 로직은 수행하지 않음.
        if(_setCtxPatternMenuClick(oCtx) === true){
            return;
        }

        // 자식키
        let sCKEY = oBindData?.CKEY || "";
        if(!sCKEY){
            return;
        }

        try {

            // USP ROOT 폴더 경로
            let sUspRootPath = PATHINFO.USP_ROOT;

            // USP Context Menu 관련 모듈 경로
            let sCtxMenuModuleRootPath = PATH.join(sUspRootPath, "contextMenu", "MENU_MODULES", sCKEY, "index.js");
     
            var oModules = await import(sCtxMenuModuleRootPath);

            // 모듈에 전달할 파라미터 정보
            let oPARAM = {
                MENU_INFO: oBindData
            };

            oModules.exports(oPARAM);
            
        } catch (error) {            

            // 콘솔용 오류 메시지
            var aConsoleMsg = [             
                `[PATH]: www/ws10_20/js/usp/ws_usp_01.js`,  
                `=> oAPP.fn.fnUspPatternContextMenuClick`,
            ];
            
            if(error && error?.stack){
                aConsoleMsg.push(error?.stack);
            }

            console.error(aConsoleMsg.join("\r\n"));
            console.trace();   

            return;

        }

    }; // end of oAPP.fn.fnUspPatternContextMenuClick

    /**************************************************************************
     * [WS30] 단축키로 save 및 active 시 마지막 선택한 커서의 위치가 에디터였다면 
     * 해당 에디터로 포커스를 준다!!
     **************************************************************************/
    // oAPP.fn.fnLastActivateElementFocus = () => {

    //     /**
    //      * 단축키로 실행했을 경우 하위로직 수행
    //      */
    //     let oActiveDom = oAPP.attr.beforeActiveElement;
    //     if (!oActiveDom) {
    //         return;
    //     }

    //     let oCodeEditor1 = sap.ui.getCore().byId("ws30_codeeditor"),
    //         oCodeEditor2 = sap.ui.getCore().byId("ws30_codeeditor-clone1");

    //     // 에디터가 둘중에 하나라도 없다면 빠져나감.
    //     if (!oCodeEditor1 || !oCodeEditor2) {
    //         return;
    //     }

    //     // 이전 포커스의 위치 정보를 지운다.
    //     delete oAPP.attr.beforeActiveElement;

    //     // 현재 커서의 위치가 어떤 에디터인지 확인
    //     let $oCodeeditor1 = $(oActiveDom).closest(".u4aUspCodeeditor1");

    //     // 커서가 왼쪽 에디터에 있었을 경우
    //     if ($oCodeeditor1.length !== 0) {

    //         oCodeEditor1.focus();

    //         return;

    //     }

    //     oCodeEditor2.focus();

    // }; // end of oAPP.fn.fnLastActivateElementFocus

    /**************************************************************************
     * [WS30] USP Move Position Popup Close
     **************************************************************************/
    function ev_uspTreeNodeMovePosPopupClose() {

        var oDialog = sap.ui.getCore().byId("ws30_movePosPopup");

        if (oDialog && oDialog.isOpen()) {
            oDialog.close();
        }

    } // end of ev_uspTreeNodeMovePosPopupClose

    /**************************************************************************
     * [WS30] USP Move Position Popup 확인 버튼 이벤트
     **************************************************************************/
    function ev_uspTreeNodeMovePosition(oTable) {

        const sMovePosModelPath = "/WS30/MOVEPOS";

        var oMovePos = APPCOMMON.fnGetModelProperty(sMovePosModelPath),
            iSelIndex = oMovePos.SELIDX,
            iStepValue = oMovePos.STEPVAL;

        if (iStepValue <= 0) {

            sap.ui.getCore().byId("ws30_step").focus();

            oMovePos.STEPVS = sap.ui.core.ValueState.Error;
            oMovePos.STEPVST = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "375"); // Please enter a numeric value of 1 or more.

            APPCOMMON.fnSetModelProperty(sMovePosModelPath, oMovePos);

            return;
        }

        oAPP.fn.fnSetUspTreeNodeMove(oTable, iSelIndex, iStepValue);

        ev_uspTreeNodeMovePosPopupClose();

    }
    // end of ev_uspTreeNodeMovePosition

    /**************************************************************************
     * [WS30] USP Move Position Step Input Enter 이벤트
     **************************************************************************/
    function ev_uspTreeNodeStepInputEnter(oEvent) {

        var iKeyCode = oEvent.keyCode;

        if (iKeyCode !== 13) {
            return;
        }

        var oBtn = sap.ui.getCore().byId("ws30_movePosOk");
        if (!oBtn) {
            return;
        }

        setTimeout(function () {
            oBtn.firePress();
        }, 0);

    } // end of ev_uspTreeNodeStepInputEnter


    /**************************************************************************
     * [WS30] USP Code Editor의 Ctx Menu에 추가할 메뉴
     **************************************************************************/
    function _additionalUspCtxMenu(){

        let sUspRootPath = PATHINFO.USP_ROOT;
        let sContextMenuModulePath = PATH.join(sUspRootPath, "contextMenu", "contextMenuInfo.js");

        let fnGetCtxMenu = parent.require(sContextMenuModulePath);

        return fnGetCtxMenu();

    } // end of _additionalUspCtxMenu


    /**************************************************************************
     * [WS30] USP Code Editor의 CtxMenu 중, 최상위 메뉴 정보 구하기
     **************************************************************************/
    function _getCodeEditorCtxMenuRootModelData(oModelData, sBindPath){

        var oBindInfo = oAPP.fn._fnFindModelData2(oModelData, sBindPath);
        if(!oBindInfo){
            return;
        }

        if(Array.isArray(oBindInfo.Nodes) === true){
            return _getCodeEditorCtxMenuRootModelData(oModelData, oBindInfo.Path);
        }

        let oNode = oBindInfo.Nodes;
        if(oNode.PKEY === "" || oNode.TYPE === "ROOT"){
            return oNode;
        }

        return _getCodeEditorCtxMenuRootModelData(oModelData, oBindInfo.Path);

    } // end of _getCodeEditorCtxMenuRootModelData


    /**************************************************************************
     * [WS30] USP Ctx Menu 메뉴 중, 소스 패턴 메뉴일 경우
     **************************************************************************/
    // function _setCtxPatternMenuClick(oCtx){

    //     // 다음 로직을 수행할지 말지 여부 플래그
    //     let bIsStop = false;

    //     let oModel      = oCtx.getModel();
    //     let sBindPath   = oCtx.getPath();
    //     let oModelData  = oModel.getData();
    //     let oBindData   = oCtx.getProperty(oCtx.getPath());

    //     let oRootNode;
    //     if(oBindData.CKEY === "" || oBindData.TYPE === "ROOT"){
    //         oRootNode = oBindData;
    //     }
    //     else {

    //         // 선택한 메뉴의 최상위 부모를 찾아서 소스 패턴 관련 메뉴인지 확인
    //         let oFindRoot = _getCodeEditorCtxMenuRootModelData(oModelData, sBindPath);
    //         if(!oFindRoot){
    //             return bIsStop;
    //         }

    //         oRootNode = oFindRoot;
    //     }

    //     // 최상위 부모키
    //     let sCKEY = oRootNode?.CKEY || "";

    //     // 패턴 데이터
    //     let sPattData = oBindData?.DATA || "";

    //     // 최상위 부모키의 시작이 "PATT" or "PTN" 으로 시작하지 않으면 
    //     // 다음 프로세스 진행시켜~!
    //     if (!sCKEY || (!sCKEY.startsWith("PAT") && !sCKEY.startsWith("PTN"))) {
    //         return bIsStop;
    //     }

    //     // 다음 프로세스 수행 금지
    //     bIsStop = true;

    //     // 패턴 데이터가 없을 경우 빠져나감
    //     if(!sPattData){
    //         return bIsStop;
    //     }        

    //     // 현재 어플리케이션의 change 모드 여부를 확인한다.
    //     let oAppInfo = oCtx.getProperty("/APPINFO"),
    //         bIsEdit = (oAppInfo.IS_EDIT == "X" ? true : false);

    //     // 어플리케이션이 change 모드가 아니면 빠져나감.
    //     if (!bIsEdit) {
    //         return bIsStop;
    //     }

    //     // 마우스 우클릭한 위치의 Editor 정보를 구한다.
    //     let oCodeEditor = oAPP.attr.oCtxMenuClickEditor;
    //     if (!oCodeEditor) {
    //         return bIsStop;
    //     }
        
    //     let oEditor = oCodeEditor._oEditor,
    //         oCursorPos = oEditor.getCursorPosition(),
    //         sInsertTxt = oBindData.DATA;

    //     if (!sInsertTxt) {
    //         return bIsStop;
    //     }

    //     // Editor에 선택한 패턴을 출력해준다.
    //     oEditor.session.insert(oCursorPos, sInsertTxt);

    //     // Editor에 변경 이벤트를 발생시킨다.
    //     oCodeEditor.fireChange({
    //         value: oEditor.session.getValue()
    //     });

    //     // 앱 변경 사항 플래그 설정
    //     oAPP.fn.setAppChangeWs30("X");

    //     return bIsStop;

    // } // end of _setCtxPatternMenuClick


    /*****************************************************
     * @since   2025-05-06
     * @version 3.5.6-sp2
     * @author  soccerhs
     * 
     * @description
     * ## USP EDITOR 변경 작업 ##
     *
     * USP Ctx Menu 메뉴 중, 소스 패턴 메뉴일 경우에 대한 
     * 에디터에 패턴 적용
     ******************************************************/    
    function _setCtxPatternMenuClick(oCtx){

        // 다음 로직을 수행할지 말지 여부 플래그
        let bIsStop = false;

        let oModel      = oCtx.getModel();
        let sBindPath   = oCtx.getPath();
        let oModelData  = oModel.getData();
        let oBindData   = oCtx.getProperty(oCtx.getPath());

        let oRootNode;
        if(oBindData.CKEY === "" || oBindData.TYPE === "ROOT"){
            oRootNode = oBindData;
        }
        else {

            // 선택한 메뉴의 최상위 부모를 찾아서 소스 패턴 관련 메뉴인지 확인
            let oFindRoot = _getCodeEditorCtxMenuRootModelData(oModelData, sBindPath);
            if(!oFindRoot){
                return bIsStop;
            }

            oRootNode = oFindRoot;
        }

        // 최상위 부모키
        let sCKEY = oRootNode?.CKEY || "";

        // 패턴 데이터
        let sPattData = oBindData?.DATA || "";

        // 최상위 부모키의 시작이 "PATT" or "PTN" 으로 시작하지 않으면 
        // 다음 프로세스 진행시켜~!
        if (!sCKEY || (!sCKEY.startsWith("PAT") && !sCKEY.startsWith("PTN"))) {
            return bIsStop;
        }

        // 다음 프로세스 수행 금지
        bIsStop = true;

        // 패턴 데이터가 없을 경우 빠져나감
        if(!sPattData){
            return bIsStop;
        }        

        // 현재 어플리케이션의 change 모드 여부를 확인한다.
        let oAppInfo = oCtx.getProperty("/APPINFO"),
            bIsEdit = (oAppInfo.IS_EDIT == "X" ? true : false);

        // 어플리케이션이 change 모드가 아니면 빠져나감.
        if (!bIsEdit) {
            return bIsStop;
        }

        let oSelectedCtxInfo = oAPP?.usp?.oSelectedCtxInfo || undefined;
        if(!oSelectedCtxInfo){
            return bIsStop;
        }

        let oEditor = oSelectedCtxInfo?.oEditor || undefined;
        let oMonaco = oSelectedCtxInfo?.oMonaco || undefined;
        if(!oEditor || !oMonaco){
            return;
        }

        // // 현재 커서 위치 가져오기
        const position = oEditor.getPosition();

        // // 해당 위치에 텍스트 삽입
        oEditor.executeEdits('', [
            {
                range: new oMonaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: sPattData,
                // forceMoveMarkers: true
            }
        ]);

        // 삽입된 텍스트의 끝 위치 계산
        const lastPosition = oEditor.getPosition();
        
        // 선택 없이 커서만 이동
        oEditor.setPosition(lastPosition);
        
        oEditor.focus();

        // 앱 변경 사항 플래그 설정
        oAPP.fn.setAppChangeWs30("X");

        return bIsStop;

    } // end of _setCtxPatternMenuClick


    /*****************************************************
     * @since   2025-05-06
     * @version 3.5.6-sp2
     * @author  soccerhs
     * 
     * @description
     * ## USP EDITOR 변경 작업 ##
     *
     *  USP EDITOR 영역의 Iframe Load 이벤트
     ******************************************************/
    oAPP.fn.onFrameLoadUspEditor = function(oEvent){

        oEvent.preventDefault();
        
        if(!oEvent?.target?.classList){
            return;
        }

        zconsole.log(`USP IFrame onLoad!!!!!! --- ${oEvent.target.className}`);

        if(oEvent.target.classList.contains("EDITOR_FRAME1")){
            
            oEvent.target.contentWindow.postMessage({ actcd: 'init', port: oAPP.usp.USP_EDITOR_CHANNEL.port1 }, '*', [oAPP.usp.USP_EDITOR_CHANNEL.port1]);

            return;
        }

        if(oEvent.target.classList.contains("EDITOR_FRAME2")){
            
            oEvent.target.contentWindow.postMessage({ actcd: 'init', port: oAPP.usp.USP_EDITOR_CHANNEL.port2 }, '*', [oAPP.usp.USP_EDITOR_CHANNEL.port2]);

            return;
        }

    }; // end of oAPP.fn.onFrameLoadUspEditor

})(window, $, oAPP);