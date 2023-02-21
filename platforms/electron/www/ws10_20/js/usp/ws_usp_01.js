(function(window, $, oAPP) {
    "use strict";


    const
        APPCOMMON = oAPP.common,
        APP = parent.APP,
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        CURRWIN = parent.CURRWIN,
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        IPCMAIN = parent.IPCMAIN;

    var gfSelectRowUpdate;

    // /***************************************************************************************
    //  * [WS30] USP TREE에서 현재 선택한 Node의 상위 또는 하위 형제 Node의 접힘 펼침 정보를 구한다.
    //  *************************************************************************************** 
    //  * @param {sap.ui.table.TreeTable} oTreeTable
    //  * - 좌측 Usp Tree Instance
    //  * 
    //  * @param {Array} aNodes
    //  * - 현재 선택한 Node의 형제들 정보
    //  * 
    //  * @param {Integer} iCurrIndex
    //  * - 현재 선택한 Node의 Index 정보
    //  * 
    //  * @param {Boolean} bIsUp
    //  * - 현재 선택한 Node의 상위 형제의 펼침 상태 정보를 구할지에 대한 정보
    //  * - ex) true : 상위 펼침 상태 정보
    //  *       false: 하위 펼침 상태 정보
    //  * 
    //  * @return {Boolean} 
    //  * - true : 펼침
    //  * - false: 접힘
    //  ***************************************************************************************/
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
            iMoveIndex = pMoveIndex; // 이동 하려는 위치

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
            oMeItem = aItem[0]; // 선택한 Node를 추출

        // 선택한 Node를 이전 위치에서 위로 이동 시킨다.
        oResult.Nodes.splice(iMoveIndex - 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes, oSelectedCtx, true);

        // 이동한 Node에 선택 표시를 하기 위한 이벤트 걸기
        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnSetUspTreeNodeMove

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

        console.log("Tree Node Up");

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

    }; // end of oAPP.fn.fnUspTreeNodeMoveUp    

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pSelIndex) => {

        console.log("Tree Node Down");

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

    /**************************************************************************
     * [WS30] 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
     * 
     * * 참고사항
     * oRow.expand() or oRow.collapse() 메소드 사용 시
     * 이전 Row의 펼침 접힘 상태가 다를 경우에만
     * RowsUpdated 이벤트를 발생함.
     * ************************************************************************
     * 예) 이전 Row가 펼침 상태 였을 경우.
     * oRow.expand() 메소드 수행하면 RowsUpdated 이벤트 발생 안함!!
     * oRow.collapse() 메소드 수행하면 RowsUpdated 이벤트 발생함!!!
     * 
     * 그렇기 때문에 이전 Row의 접힘/펼침 상태를 읽어서 다를 경우에만
     * Table의 RowsUpdated 이벤트를 걸어준다!!
     **************************************************************************/
    function _fnUspNodeExpCollFromModel(oMeItem, oEvent) {

        console.log("_fnUspNodeExpCollFromModel");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        var bIsAttach = false;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i];

            if (oRow.isEmpty()) {
                break;
            }

            var oCtx = oRow.getBindingContext(),
                oRowData = oCtx.getModel().getProperty(oCtx.getPath()),
                bIsExp = oRow.isExpanded(), // 이전 Row의 접힘/펼침 상태
                bExpAble = oRow.isExpandable(); // Row의 펼침 가능 여부               

            if (oRowData.ISFLD != "X") {

                oRow.collapse(i);

                // 펼침 가능한 Row 이면서 이전 Row가 펼쳐진 상태였다면
                if (bExpAble && bIsExp) {
                    bIsAttach = true;

                    // test
                    setTimeout(function() {
                        oTreeTable.fireRowsUpdated(oEvent, oMeItem); //test
                    }, 0);

                    return;

                }

                continue;
            }

            var bIsModelExpand = oRowData._ISEXP;
            if (bIsModelExpand) {

                oRow.expand(i);

                // 펼침 가능한 Row 이면서 이전 Row가 접혀진 상태였다면
                if (bExpAble && !bIsExp) {

                    bIsAttach = true;

                    setTimeout(function() {
                        oTreeTable.fireRowsUpdated(oEvent, oMeItem); //test
                    }, 0);

                    return;
                }

                continue;
            }

            oRow.collapse(i);

            // 펼침 가능한 Row 이면서 이전 Row가 펼쳐진 상태였다면
            if (bExpAble && bIsExp) {
                bIsAttach = true;

                setTimeout(function() {
                    oTreeTable.fireRowsUpdated(oEvent, oMeItem); //test
                }, 0);

                return;

            }

        }

        oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

        gfSelectRowUpdate = undefined;

        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        if (!bIsAttach) {

            oTreeTable.fireRowsUpdated(oEvent, oMeItem);

        }





        // _fnUspNodeSetSelectedIndex(oMeItem, oEvent);




        // if (!bIsAttach) {
        //     return;
        // }

        // gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

    } // end of _fnUspNodeExpCollFromModel

    function _fnUspNodeSetSelectedIndex(oMeItem, oEvent) {

        console.log("_fnUspNodeSetSelectedIndex");

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
            if (sOBJKY === oMeItem.OBJKY) {

                // 현재 순서의 Row Index를 구한다.
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

    } // end of _fnUspNodeSetSelectedIndex

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeUspTreeData = () => {

        if (!oAPP.attr.oBeforeUspTreeData) {
            return;
        }

        delete oAPP.attr.oBeforeUspTreeData;

    }; // end of oAPP.fn.fnClearOnBeforeUspTreeData

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

        // USP Folder 생성 팝업
        var oDialog = new sap.m.Dialog("ws30_movePosPopup", {

            // properties
            draggable: true,
            resizable: true,
            icon: "sap-icon://outdent",
            title: "Move Position",
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

            content: [
                new sap.m.StepInput("ws30_step", {
                    required: true,
                    min: 1,
                    value: `{${sBindRootPath}/STEPVAL}`,
                    valueState: `{${sBindRootPath}/STEPVS}`,
                    valueStateText: `{${sBindRootPath}/STEPVST}`,
                }).attachBrowserEvent("keydown", ev_uspTreeNodeStepInputEnter)
            ],

            // association
            initialFocus: "ws30_step",

            afterOpen: function(oEvent) {

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
            afterClose: function() {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oDialog.open();

    }; // end of oAPP.fn.fnUspTreeNodeMovePosition

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

    }; // end of oAPP.fn.fnResetUspTree

    /**************************************************************************
     * [WS30] USP New Window
     **************************************************************************/
    oAPP.fn.fnUspNewWindow = (oTreeTable, pIndex) => {

        debugger;

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
        oBrowserOptions.show = false;
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
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function() {

            let oSendData = {
                APPINFO: oAppInfo,
                TREEDATA: oTreeData,
                oUserInfo: parent.getUserInfo(),
                BROWSKEY: BROWSKEY,
                oThemeInfo: oThemeInfo,
                CHANNELID: sChanelID
            };

            oBrowserWindow.webContents.send('if-uspnew', oSendData);

            oBrowserWindow.show();

            oBrowserWindow.setOpacity(1.0);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            // IPCMAIN 이벤트 해제
            IPCMAIN.removeListener(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

            oBrowserWindow = null;

        });


        IPCMAIN.on(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

    }; // end of oAPP.fn.fnUspNewWindow

    oAPP.fn.fnUspNewWindowIPCEvent = (res, data) => {

        debugger;


    }; // end of oAPP.fn.fnUspNewWindowIPCEvent    

    /**************************************************************************
     * [WS30] USP Codeeditor ContextMenu Open
     **************************************************************************/
    oAPP.fn.fnUspCodeeditorContextMenuOpen = (oEvent, oCodeEditor) => {

        let sMenuId = "uspCDECtxMenu";

        var oCtxMenu = sap.ui.getCore().byId(sMenuId);
        if (oCtxMenu) {
            oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);
            return;
        }

        var oCtxMenu = new sap.ui.unified.Menu(sMenuId, {
            items: [
                new sap.ui.unified.MenuItem({
                    // key: "001",
                    text: "패턴1"
                }),
                new sap.ui.unified.MenuItem({
                    // key: "002",
                    text: "패턴2"
                }),
            ]
        }).addStyleClass("u4aWsWindowMenu");

        oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);


    }; // end of oAPP.fn.fnUspCodeeditorContextMenuOpen      

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

    } // end of ev_uspTreeNodeMovePosition

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

        setTimeout(function() {
            oBtn.firePress();
        }, 0);

    } // end of ev_uspTreeNodeStepInputEnter

})(window, $, oAPP);