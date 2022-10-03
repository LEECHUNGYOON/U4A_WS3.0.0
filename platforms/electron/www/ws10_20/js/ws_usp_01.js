(function(window, $, oAPP) {
    "use strict";


    const APPCOMMON = oAPP.common;

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
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pIndex) => {

        console.log("Tree Node Up");

        var oSelectedCtx = oTreeTable.getContextByIndex(pIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 현재 선택한 Node가 최상위 일 경우는 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0]; // 선택한 Node를 추출

        // 선택한 Node를 이전 위치에서 위로 이동 시킨다.
        oResult.Nodes.splice(iFindIndex - 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes, oSelectedCtx, true);
        // oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // gfSelectRowUpdate = _fnUspNodeExpCollFromModel.bind(this, oMeItem);

        // // 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        // gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveUp    

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pIndex) => {

        console.log("Tree Node Down");

        var oSelectedCtx = oTreeTable.getContextByIndex(pIndex), // 현재 선택한 Node
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

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0];

        // 선택한 Node를 이전 위치에서 아래로 이동 시킨다.
        oResult.Nodes.splice(iFindIndex + 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes, oSelectedCtx, true);
        // oCtxModel.setProperty(oResult.Path, oResult.Nodes, true);


        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // gfSelectRowUpdate = _fnUspNodeExpCollFromModel.bind(this, oMeItem);

        // // 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // setTimeout(function () {

        //     // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        //     gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

        //     oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // }, 0);

        // // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        // gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

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

        debugger;

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

    // function ev_uspTreeNodeMoveAndSelectedRowUpdated(oMeItem, oEvent) {

    //     debugger;

    //     console.log("ev_uspTreeNodeMoveAndSelectedRowUpdated");

    //     var oTreeTable = oEvent.getSource(),
    //         aRows = oTreeTable.getRows(),
    //         iRowLength = aRows.length;

    //     var bIsFind1 = false;

    //     for (var i = 0; i < iRowLength; i++) {

    //         var oRow = aRows[i],
    //             oCtx = oRow.getBindingContext();

    //         if (!oCtx) {
    //             continue;
    //         }

    //         var oRowData = oCtx.getModel().getProperty(oCtx.getPath()),

    //             // Row의 Object Key            
    //             sOBJKY = oRowData.OBJKY;

    //         // 현재 순서의 Row와 선택한 Row가 같을 경우 
    //         if (sOBJKY === oMeItem.OBJKY) {

    //             debugger;

    //             bIsFind1 = true;

    //             // 현재 순서의 Row Index를 구한다.
    //             var iIndex = oRow.getIndex();

    //             // 현재 순서의 Row에 라인선택 설정
    //             oTreeTable.setSelectedIndex(iIndex);

    //         }

    //         // if (oRowData.ISFLD != "X") {
    //         //     oRow.collapse(i);
    //         //     continue;
    //         // }

    //         // var bIsExpand = oRowData._ISEXP;
    //         // if (bIsExpand) {
    //         //     oRow.expand(i);
    //         //     continue;
    //         // }

    //         // oRow.collapse(i);

    //     }

    //     // 현재 선택한 Row를 찾은 경우 
    //     if (bIsFind1 == true) {

    //         // RowUpdate 이벤트를 해제 한다.
    //         oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

    //         gfSelectRowUpdate = undefined;

    //         return;

    //     }

    //     if (!gfSelectRowUpdate.iRowLength) {
    //         gfSelectRowUpdate.iRowLength = iRowLength;
    //     } else {
    //         gfSelectRowUpdate.iRowLength += iRowLength;
    //     }

    //     // 스크롤을 이동하여 다시 찾는다.
    //     oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

    //     setTimeout(() => {
    //         oTreeTable.fireRowsUpdated(oEvent, oMeItem);
    //     }, 0);

    // } // end of ev_uspTreeNodeMoveAndSelectedRowUpdated

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeSelectUspTreeData = () => {

        if (oAPP.attr.oBeforeUspTreeData) {
            delete oAPP.attr.oBeforeUspTreeData;
        }

    }; // end of oAPP.fn.fnClearOnBeforeSelectUspTreeData

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
                STEPVAL: 1
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
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    // press: ev_createUspNodeAcceptEvent.bind(this, oTreeTable)
                    press: ev_uspTreeNodeMovePosition.bind(this, oTreeTable)
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: ev_UspTreeNodeMovePosPopupClose
                }),
            ],

            content: [
                new sap.m.StepInput("ws30_step", {
                    // width: "200px",
                    required: true,
                    min: 1,
                    value: `{${sBindRootPath}/STEPVAL}`,
                }).attachBrowserEvent("keydown", ev_uspTreeNodeStepInputEnter)
            ],

            // association
            initialFocus: "ws30_step",

            // events
            afterClose: function() {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oDialog.open();

    }; // end of oAPP.fn.fnUspTreeNodeMovePosition

    /**************************************************************************
     * [WS30] USP Move Position Popup Close
     **************************************************************************/
    function ev_UspTreeNodeMovePosPopupClose() {

        var oDialog = sap.ui.getCore().byId("ws30_movePosPopup");

        if (oDialog && oDialog.isOpen()) {
            oDialog.close();
        }

    } // end of ev_UspTreeNodeMovePosPopupClose

    function ev_uspTreeNodeMovePosition(oTable, oEvent) {

        debugger;


        ev_UspTreeNodeMovePosPopupClose();

    } // end of ev_uspTreeNodeMovePosition

    function ev_uspTreeNodeStepInputEnter(oEvent) {

        var iKeyCode = oEvent.keyCode;

        if (iKeyCode !== 13) {
            return;
        }

        var oInputDom = oEvent.currentTarget,
            sInputId = oInputDom.id,
            oStepInput = sap.ui.getCore().byId(sInputId);

        if (!oStepInput) {
            return;
        }

        setTimeout(function() {

            debugger;

            var value = oStepInput.getValue();

        }, 0);




    } // end of ev_uspTreeNodeStepInputEnter

})(window, $, oAPP);