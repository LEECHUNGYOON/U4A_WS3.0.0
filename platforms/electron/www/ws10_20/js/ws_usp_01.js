(function (window, $, oAPP) {
    "use strict";

    var gfSelectRowUpdate;

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pIndex) => {

        debugger;

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

        // 선택한 Node를 위로 이동 후 모델 업데이트
        var aItem = oResult.Nodes.splice(iFindIndex, 1);

        oResult.Nodes.splice(iFindIndex - 1, 0, aItem[0]);

        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // oCtxModel.refresh();

        // Tree Table RowUpdated Event 걸기
        gfSelectRowUpdate = ev_setSelectedRowUpdated.bind(this, aItem[0]);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveUp    

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pIndex) => {

        debugger;

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

        var aSelectedItem = oResult.Nodes.splice(iFindIndex, 1),
            aBeforeItem = oResult.Nodes.splice(iFindIndex - 1, 1);

        oResult.Nodes.splice(iFindIndex + 1, 0, aSelectedItem[0]);

        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        // oCtxModel.refresh();

        // Tree Table RowUpdated Event 걸기
        gfSelectRowUpdate = ev_setSelectedRowUpdated.bind(this, aSelectedItem[0]);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

    function ev_setSelectedRowUpdated(oRowData, oEvent) {

        debugger;

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i],
                oCtx = oRow.getBindingContext();

            if (!oCtx) {
                continue;
            }

            var sOBJKY = oCtx.getObject("OBJKY");
            if (sOBJKY !== oRowData.OBJKY) {
                continue;
            }

            var iIndex = oRow.getIndex();

            oTreeTable.setSelectedIndex(iIndex);

            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

            gfSelectRowUpdate = undefined;

            return;
        }

        if (!gfSelectRowUpdate.iRowLength) {
            gfSelectRowUpdate.iRowLength = iRowLength;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oRowData);
        }, 0);

    } // end of ev_setSelectedRowUpdated

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeSelectUspTreeData = () => {

        if (oAPP.attr.oBeforeUspTreeData) {
            delete oAPP.attr.oBeforeUspTreeData;
        }

    }; // end of oAPP.fn.fnClearOnBeforeSelectUspTreeData

})(window, $, oAPP);