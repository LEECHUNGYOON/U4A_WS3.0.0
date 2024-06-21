/*************************************************************
 * @module - 멀티 추가속성 바인딩 가능여부 점검 FUNCTION.
 *************************************************************/
module.exports = function(is_attr){

    return new Promise(async(res)=>{

        var _sRes = {RETCD:"", RTMSG:""};


        //DESIGN TREE의 오류 표현 필드 정보 초기화.
        oAPP.attr.oDesign.fn.resetErrorField();
        

        //바인딩 추가 속성 정보 적용 전 입력값 점검.
        var _sRes =  await oAPP.fn.chkAdditBindData(oAPP.attr.oAddit.oModel);

        //추가속성 정보 입력값 오류가 존재하는경우.
        if(_sRes.RETCD === "E"){
            oAPP.attr.oDesign.oModel.refresh();
            return res(_sRes);
        }


        //DESIGN TREE의 체크박스 선택건 존재 여부 확인.
        var _aTree = oAPP.attr.oDesign.fn.getSelectedDesignTree();

        //DESIGN TREE의 체크박스 선택건이 존재하지 않는경우.
        if(_aTree.length === 0){
            
            //$$MSG
            _sRes.RETCD = "E";
            _sRes.RTMSG = "라인 선택건이 존재하지 않습니다.";
            oAPP.attr.oDesign.oModel.refresh();
            return res(_sRes);

        }
        

        var _error = false;

        //선택한 라인의 추가속성 가능건 확인.
        for (let i = 0, l = _aTree.length; i < l; i++) {

            var _sTree = _aTree[i];

            //선택건중 추가속성 정보 가능건 확인.
            var _sRes = oAPP.attr.oAddit.fn.chkPossibleAdditBind(_sTree);

            //선택건중 추가속성이 불가능한건이존재하는경우.
            if(_sRes.RETCD === "E"){

                //오류 flag 처리.
                _error = true;

                //바인딩시 오류가 발생한 경우.
                _sTree._bind_error    = true;

                //오류 표현 처리.
                _sTree._check_vs      = "Error";
                _sTree._highlight     = "Error";
                _sTree._style         = "u4aWsDesignTreeError";
                _sTree._error_tooltip = _sRes.RTMSG;

            }
            
        }

        
        //추가 속성 불가능건이 존재하는경우.
        if(_error === true){

            //오류 표현 존재건에 대해 해당 tree를 펼침 처리.
            for (let i = 0, l = _aTree.length; i < l; i++) {

                var _sTree = _aTree[i];

                //오류 발생 라인이 아닌경우 skip.
                if(_sTree._bind_error !== true){
                    continue;
                }

                //라인 펼침 처리.
                oAPP.attr.oDesign.fn.setSelectTreeItem(_sTree.CHILD);

            }


            //현재 row에 오류 표현된건이 존재하지 않는경우 오류 발생한 라인으로 이동 처리.
            moveDesignTreeErrorLine();

            //$$MSG
            _sRes.RETCD = "E";
            _sRes.RTMSG = "선택한 정보 중 추가 속성 불가능건이 존재합니다.";
            
            oAPP.attr.oDesign.oModel.refresh();
            return res(_sRes);

        }



        //선택 라인의 모델 필드 정보 점검.
        var _sRes = await parent.require("./bindAdditArea/checkModelFieldData.js")(_aTree);

        //추가속성 정보 입력값 오류가 존재하는경우.
        if(_sRes.RETCD === "E"){

            oAPP.attr.oDesign.oModel.refresh();

            return res(_sRes);
        }

        oAPP.attr.oDesign.oModel.refresh();

        return res(_sRes);

    });

};


/*************************************************************
 * @function - 디자인 트리 영역에 오류 발생 위치로 이동 처리.
 *************************************************************/
function moveDesignTreeErrorLine(){

    function _foundErrorNode(aChild){

        if(aChild.length === 0){
            return;
        }

        for (let i = 0, l = aChild.length; i < l; i++) {
            var _oChild = aChild[i];

            if(typeof _oChild?.context === "undefined" || _oChild.context === null){
                continue;
            }

            _cnt++;

            if(_oChild.context.getProperty("_bind_error") === true){
                return true;
            }

            //하위를 탐색하며 오류 발생 라인 찾기.
            var _found = _foundErrorNode(_oChild.children);

            if(_found === true){
                return;
            }
            
        }

    }



    //오류가 발생한 row가 화면에 표현된 상태인경우 exit.
    if(chkShowErrorRow() === true){
        return;
    }


    var _cnt = -1;

    var _oBind = oAPP.attr.oDesign.ui.ROOT.getBinding("rows");

    if(typeof _oBind === "undefined" || _oBind === null){
        return;
    }


    //오류 발생 라인 위치 찾기.
    _foundErrorNode(_oBind._oRootNode.children);

    //오류 발생 라인을 찾지 못한 경우 exit.
    if(_cnt === -1){
        return;
    }


    //오류 발생 라인을 찾은경우 해당 라인으로 이동 처리.
    oAPP.attr.oDesign.ui.ROOT.setFirstVisibleRow(_cnt);

}


/*************************************************************
 * @function - 오류가 발생한 row가 화면에 표현됐는지 확인.
 *************************************************************/
function chkShowErrorRow(){
    
    var _aRows = oAPP.attr.oDesign.ui.ROOT.getRows();

    if(_aRows.length === 0){
        return false;
    }

    var _foundEror = false;

    for (let i = 0, l = _aRows.length; i < l; i++) {
        
        var _oRow = _aRows[i];

        if(typeof _oRow === "undefined"){
            continue;
        }

        if(_oRow === null){
            continue;
        }

        var _oCtxt = _oRow.getBindingContext();

        if(typeof _oCtxt === "undefined" || _oCtxt === null){
            continue;
        }

        var _bindError = _oCtxt.getProperty("_bind_error");

        //오류가 발생하지 않은경우 skip.
        if(_bindError === true){

            //오류 발생라인 찾음.
            _foundEror = true;

            break;
        }
        
    }

    //현재 출력 row에 오류 발생 라인이 존재여부 return.
    return _foundEror;


}