var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

/*********************************************************
 * @module - RichTextEditor 미리보기 출력 예외처리로직.
 ********************************************************/
module.exports = function(is_tree){
    
    var _aPromise = [];
	
    if(typeof is_tree === "undefined"){
        return _aPromise;
    }
    
    if(typeof is_tree.zTREE.length === 0){
        return _aPromise;
    }
    
    //처리 대상 child에 richTextEditor 존재 여부 확인.
    for(var i = 0, l = is_tree.zTREE.length; i < l; i ++){
      
        var _sChild = is_tree.zTREE[i];

        //richTextEditor UI인경우.
        if(_sChild.UIOBK === "UO01786"){
            
            var _oRich = oAPP.attr.prev[_sChild.OBJID];

            if(typeof _oRich === "undefined"){
                continue;
            }

            //비활성 건인경우 수집 skip.
            if(_oRich.getVisible() === false){
                continue;
            }

            //onAfterRendering 이벤트 등록.
            _aPromise.push(oAPP.fn.setAfterRendering(_oRich));
            
        }		
      
    }	
    
    return _aPromise;	
    
};
