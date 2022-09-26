(function (window, $, oAPP) {
    "use strict";


    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pIndex) => {

        debugger;

        var oSelectedCtx = oTreeTable.getContextByIndex(pIndex), // 현재 선택한 Node
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oTreeTable.getModel().getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 현재 선택한 Node가 최상위 일 경우는 빠져나간다.
        if(iFindIndex == 0){
            return;
        }

        


    }; // end of oAPP.fn.fnUspTreeNodeMoveUp




})(window, $, oAPP);