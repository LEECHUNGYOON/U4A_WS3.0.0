var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

/*********************************************************
 * @module - RichTextEditor 미리보기 출력 예외처리로직.
 ********************************************************/
module.exports = function(is_tree){
    
    //미리보기 화면에 출력될 RichTextEditor의 readyRecurring 이벤트 등록 처리
    return refreshRichTextEditor(is_tree);
    
};



/*********************************************************
 * @function - 미리보기 화면에 출력될 RichTextEditor의 
 *             readyRecurring 이벤트 등록 처리 내부 function.
 ********************************************************/
function refreshRichTextEditor(is_tree, aPromise = []){

    if(typeof is_tree === "undefined"){
        return aPromise;
    }
    
    if(typeof is_tree.zTREE.length === 0){
        return aPromise;
    }


    var _oTarget = oAPP.attr.prev[is_tree.OBJID];

    //UI가 존재하지 않는경우 exit.
    if(typeof _oTarget === "undefined"){
        return aPromise;
    }

    if(typeof _oTarget.getDomRef !== "function"){
        return aPromise;
    }
    
    //현재 UI가 미리보기 화면에 출력 됐는지 확인.
    var _oDom = _oTarget.getDomRef();

    //미리보기 화면에 출력되지 않은경우(dom이 없는경우) exit.
    if(typeof _oDom === "undefined" || _oDom === null){
        return aPromise;
    }

    
    //처리 대상 child에 richTextEditor 존재 여부 확인.
    //(richTextEditor가 화면에 출력되지 않는상황(visible:false) 이거나,
    //richTextEditor의 부모가 화면에 출력되지 않는상황(dom을 그리지 않음)
    //인경우 onAfterRendering이벤트를 등록하지 않음)
    for(var i = 0, l = is_tree.zTREE.length; i < l; i ++){
      
        var _sChild = is_tree.zTREE[i];


        var _oChild = oAPP.attr.prev[_sChild.OBJID];


        //UI정보가 존재하지 않는경우 skip.
        if(typeof _oChild === "undefined"){
            continue;
        }


        if(typeof _oChild.getDomRef === "undefined"){
            continue;
        }

        //화면에 출력된 dom 정보 확인.
        var _oDom = _oChild.getDomRef();

        //화면에 출력된 UI가 아닌경우(dom 정보가 없는경우) skip.
        if(typeof _oDom === "undefined" || _oDom === null){
            continue;
        }


        //현재 UI가 richTextEditor라면 readyRecurring 이벤트 등록처리.
        if(_sChild.UIOBK === "UO01786"){

            aPromise.push(oAPP.fn.setAfterRendering(_oChild));

        }

        //하위를 탐색하며 richTextEditor의 readyRecurring 이벤트 등록처리.
        refreshRichTextEditor(_sChild, aPromise);    

    }
    
    return aPromise;

}