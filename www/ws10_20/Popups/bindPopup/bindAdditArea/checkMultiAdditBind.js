/*************************************************************
 * @module - 멀티 추가속성 바인딩 가능여부 점검 FUNCTION.
 *************************************************************/
module.exports = function(is_attr){

    return new Promise(async(res)=>{

        var _sRes = {RETCD:"", RTMSG:"", T_RTMSG:[]};


        //DESIGN TREE의 오류 표현 필드 정보 초기화.
        oAPP.attr.oDesign.fn.resetErrorField();
        

        //DESIGN TREE의 체크박스 선택건 존재 여부 확인.
        var _aTree = oAPP.attr.oDesign.fn.getSelectedDesignTree();

        //DESIGN TREE의 체크박스 선택건이 존재하지 않는경우.
        if(_aTree.length === 0){

            //$$MSG
            _sRes.RETCD = "E";
            _sRes.RTMSG = "DESIGN 영역의 라인 선택건이 존재하지 않습니다."; //$$MSG
            
            var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
            
            _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT02;
            _sBindError.TYPE     = "Error";
            _sBindError.TITLE    = "DESIGN 영역의 라인 선택건이 존재하지 않습니다.";             //$$MSG
            _sBindError.DESC     = "추가속성 바인딩을 하기 위해서 디자인 영역의 라인을 선택 해야 합니다."; //$$MSG

            _sRes.T_RTMSG.push(_sBindError);

            oAPP.attr.oDesign.oModel.refresh();

        }


        //오류 표현 필드 초기화.
        oAPP.attr.oAddit.fn.resetErrorField();


        //바인딩 추가 속성 정보 적용 전 입력값 점검.
        var _sChk =  await oAPP.fn.chkAdditBindData(oAPP.attr.oAddit.ui.ROOT);

        //추가속성 정보 입력값 오류가 존재하는경우.
        if(_sChk.RETCD === "E"){

            _sRes.RETCD = _sChk.RETCD;
            _sRes.RTMSG = _sChk.RTMSG;

            _sRes.T_RTMSG = _sRes.T_RTMSG.concat(_sChk.T_RTMSG);
            
            // var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
            
            // _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT03;
            // _sBindError.TYPE     = "Error";
            // _sBindError.TITLE    = _sChk.RTMSG;             //$$MSG
            // _sBindError.DESC     = _sChk.RTMSG; //$$MSG

            // _sRes.T_RTMSG.push(_sBindError);

            oAPP.attr.oDesign.oModel.refresh();


            return res(_sRes);
        }


        //라인 선택건이 존재하지 않는경우 exit.
        if(_aTree.length === 0){
            return res(_sRes);
        }


        var _error = false;

        //선택한 라인의 추가속성 가능건 확인.
        for (let i = 0, l = _aTree.length; i < l; i++) {

            var _sTree = _aTree[i];

            //선택건중 추가속성 정보 가능건 확인.
            var _sChk = oAPP.attr.oAddit.fn.chkPossibleAdditBind(_sTree);

            //선택건중 추가속성이 불가능한건이존재하는경우.
            if(_sChk.RETCD === "E"){

                //오류 flag 처리.
                _error = true;

                //바인딩시 오류가 발생한 경우.
                _sTree._bind_error    = true;

                // //오류 표현 처리.
                // _sTree._check_vs      = "Error";
                // _sTree._highlight     = "Error";
                // _sTree._style         = "u4aWsDesignTreeError";
                // _sTree._error_tooltip = _sChk.RTMSG;


                var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
                _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT04;
                _sBindError.LINE_KEY = _sTree.CHILD;
                _sBindError.TYPE     = "Error";
                _sBindError.TITLE    = `${_sTree.OBJID} - ${_sTree.UIATT} 필드 추가속성 바인딩 오류.`; //$$MSG
                _sBindError.DESC     = _sChk.RTMSG; //$$MSG

                _sRes.T_RTMSG.push(_sBindError);

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
                oAPP.attr.oDesign.fn.getTreeItemIndex(_sTree.CHILD);

            }


            //현재 row에 오류 표현된건이 존재하지 않는경우 오류 발생한 라인으로 이동 처리.
            moveDesignTreeErrorLine(_aTree);

            //$$MSG
            _sRes.RETCD = "E";
            _sRes.RTMSG = "선택한 정보 중 추가 속성 불가능건이 존재합니다.";
            
            oAPP.attr.oDesign.oModel.refresh();
            return res(_sRes);

        }



        // //선택 라인의 모델 필드 정보 점검.
        // var _sChk = await parent.require("./bindAdditArea/checkModelFieldData.js")(_aTree);

        // //추가속성 정보 입력값 오류가 존재하는경우.
        // if(_sChk.RETCD === "E"){

        //     _sRes.RETCD = _sChk.RETCD;
        //     _sRes.RTMSG = _sChk.RTMSG;

        //     oAPP.attr.oDesign.oModel.refresh();

        //     return res(_sRes);
        // }

        oAPP.attr.oDesign.oModel.refresh();

        return res(_sRes);

    });

};


/*************************************************************
 * @function - 디자인 트리 영역에 오류 발생 위치로 이동 처리.
 *************************************************************/
function moveDesignTreeErrorLine(aTree){


    //오류가 발생한 row가 화면에 표현된 상태인경우 exit.
    if(chkShowErrorRow() === true){
        return;
    }


    //오류가 발생한 라인 얻기.
    var _sTree = aTree.find( item => item._bind_error === true);

    //라인 펼침 처리.
    var _pos = oAPP.attr.oDesign.fn.getTreeItemIndex(_sTree.CHILD);

    if(typeof _pos === "undefined"){
        return;
    }

    //해당 위치로 이동 처리.
    oAPP.attr.oDesign.ui.TREE.setFirstVisibleRow(_pos);


}


/*************************************************************
 * @function - 오류가 발생한 row가 화면에 표현됐는지 확인.
 *************************************************************/
function chkShowErrorRow(){
    
    var _aRows = oAPP.attr.oDesign.ui.TREE.getRows();

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