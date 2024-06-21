/************************************************************************
 * sap.ui.table.Table의 style class 처리.
 *-----------------------------------------------------------------------
 * @param   {object} oTable             
 *  - style class 처리할 table UI
 * @param   {string} styleBindPath      
 *  - style 바인딩 path ("STYLE01")
 *  - 예: TABLE에 바인딩된 모델의 데이터가 [{"F01":"test01", "STYLE01":"ilsColor01"}]
 *  -     인경우 "STYLE01"의 값인 ilsColor01 클래스를 row에 적용함.
  ***********************************************************************/
// module.exports = function(oTable, styleBindPath){
export function setStyleClassUiTable(oTable, styleBindPath){

    
    //style class 제거 처리.
    function _fn_removeStyle(oDom, aStyle = []){

        if(typeof oDom === "undefined" || oDom === null){return;}

        if(aStyle.length === 0){return;}

        for (var i = 0, l = aStyle.length; i < l; i++) {
            
            var _style = aStyle[i];

            if(typeof _style === "undefined"){continue;}

            oDom.classList.remove(_style);
            
        }
        
    }


    //style class 적용.
    function _fn_addStyle(oDom, aStyle = []){

        if(typeof oDom === "undefined" || oDom === null){return;}

        if(aStyle.length === 0){return;}

        for (var i = 0, l = aStyle.length; i < l; i++) {
            
            var _style = aStyle[i];

            oDom.classList.add(_style);
            
        }
        
    }

    
    function _fn_setStyle(){
        
        var _aRows = oTable.getRows();

        for (var i = 0, l = _aRows.length; i < l; i++) {
            
            var _oRow = _aRows[i];


            //row의 dom 정보 얻기.
            var _oDom = document.getElementById(_oRow.sId);
            if(typeof _oDom === "undefined" || _oDom === null){continue;}

            
            //row의 fix영역 dom 정보 얻기.
            var _oFixDom = document.getElementById(_oRow.sId + '-fixed');
            
            
            //이전 styleclass 제거.
            _fn_removeStyle(_oDom, _oRow._aStyle);

            //이전 styleclass 제거.
            _fn_removeStyle(_oFixDom, _oRow._aStyle);

            //수집한 styleclass 초기화.
            _oRow._aStyle = [];

                    
            //row의 바인딩 정보 얻기.
            var _oCtxt = _oRow.getBindingContext();
            if(typeof _oCtxt === "undefined" || _oCtxt === null ){continue;}


            //바인딩 필드의 style 정보 얻기.
            var _style = _oCtxt.getProperty(styleBindPath);
            if(typeof _style === "undefined" || _style === "" || _style === null){continue;}

            
            _oRow._aStyle = _style.split(" ");

            //style추가 처리.
            _fn_addStyle(_oDom, _oRow._aStyle);

            //style추가 처리.
            _fn_addStyle(_oFixDom, _oRow._aStyle);
            
        }

    }


    oTable.attachRowsUpdated(_fn_setStyle);



};