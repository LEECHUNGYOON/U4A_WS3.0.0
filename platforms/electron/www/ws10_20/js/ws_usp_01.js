(function (window, $, oAPP) {
    "use strict";

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
        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
        oTreeTable.attachRowsUpdated(_fnUspNodeExpCollFromModel);

        setTimeout(function () {

            // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
            gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

            oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        }, 0);

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
        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
        oTreeTable.attachRowsUpdated(_fnUspNodeExpCollFromModel);

        setTimeout(function () {

            // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
            gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

            oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        }, 0);

        // // 이동된 Node에 선택 표시를 하기 위한 Tree Table RowUpdated Event 걸기
        // gfSelectRowUpdate = ev_uspTreeNodeMoveAndSelectedRowUpdated.bind(this, oMeItem);

        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

    /**************************************************************************
     * [WS30] 모델에 저장되어 있는 현재 노드의 접힘/펼침 플래그에 따라 현재 트리 테이블에 상태 적용
     **************************************************************************/
    function _fnUspNodeExpCollFromModel(oEvent) {

        console.log("_fnUspNodeExpCollFromModel");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i],
                oCtx = oRow.getBindingContext();

            if (!oCtx) {
                continue;
            }

            var oRowData = oCtx.getModel().getProperty(oCtx.getPath());

            if (oRowData.ISFLD != "X") {
                oRow.collapse(i);
                continue;
            }

            var bIsExpand = oRowData._ISEXP;
            if (bIsExpand) {
                oRow.expand(i);
                continue;
            }

            oRow.collapse(i);

        }

        oTreeTable.detachRowsUpdated(_fnUspNodeExpCollFromModel);

    } // end of _fnUspNodeExpCollFromModel

    function ev_uspTreeNodeMoveAndSelectedRowUpdated(oMeItem, oEvent) {

        debugger;

        console.log("ev_uspTreeNodeMoveAndSelectedRowUpdated");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        var bIsFind1 = false;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i],
                oCtx = oRow.getBindingContext();

            if (!oCtx) {
                continue;
            }

            var oRowData = oCtx.getModel().getProperty(oCtx.getPath()),

                // Row의 Object Key            
                sOBJKY = oRowData.OBJKY;

            // 현재 순서의 Row와 선택한 Row가 같을 경우 
            if (sOBJKY === oMeItem.OBJKY) {

                debugger;

                bIsFind1 = true;

                // 현재 순서의 Row Index를 구한다.
                var iIndex = oRow.getIndex();

                // 현재 순서의 Row에 라인선택 설정
                oTreeTable.setSelectedIndex(iIndex);

            }

            // if (oRowData.ISFLD != "X") {
            //     oRow.collapse(i);
            //     continue;
            // }

            // var bIsExpand = oRowData._ISEXP;
            // if (bIsExpand) {
            //     oRow.expand(i);
            //     continue;
            // }

            // oRow.collapse(i);

        }

        // 현재 선택한 Row를 찾은 경우 
        if (bIsFind1 == true) {

            // RowUpdate 이벤트를 해제 한다.
            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

            gfSelectRowUpdate = undefined;

            return;

        }

        if (!gfSelectRowUpdate.iRowLength) {
            gfSelectRowUpdate.iRowLength = iRowLength;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        // 스크롤을 이동하여 다시 찾는다.
        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oMeItem);
        }, 0);

    } // end of ev_uspTreeNodeMoveAndSelectedRowUpdated

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeSelectUspTreeData = () => {

        if (oAPP.attr.oBeforeUspTreeData) {
            delete oAPP.attr.oBeforeUspTreeData;
        }

    }; // end of oAPP.fn.fnClearOnBeforeSelectUspTreeData

})(window, $, oAPP);