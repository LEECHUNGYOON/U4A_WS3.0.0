(function (window, $, oAPP) {
    "use strict";

    var gfSelectRowUpdate;

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pIndex) => {

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

        var aItem = oResult.Nodes.splice(iFindIndex, 1);

        oResult.Nodes.splice(iFindIndex - 1, 0, aItem[0]);

        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        oCtxModel.refresh();

        // gfSelectRowUpdate = ev_selectedRowUpdated.bind(this, aItem[0]);

        // oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // oTreeTable.setSelectedIndex(pIndex - 1);

        //oTreeTable.clearSelection();

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveUp

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pIndex) => {

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

        var aItem = oResult.Nodes.splice(iFindIndex, 1);

        oResult.Nodes.splice(iFindIndex + 1, 0, aItem[0]);

        oCtxModel.setProperty(oResult.Path, oResult.Nodes);

        oCtxModel.refresh();

        // oTreeTable.setSelectedIndex(pIndex + 1);

        //oTreeTable.clearSelection();

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

})(window, $, oAPP);