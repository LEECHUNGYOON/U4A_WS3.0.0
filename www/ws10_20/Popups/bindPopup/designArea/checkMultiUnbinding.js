/*************************************************************
 * @module - 멀티 바인딩 해제 점검 FUNCTION.
 *************************************************************/
module.exports = function(){

    var _sRes = {RETCD:"", RTMSG:"", T_RTMSG:[]};
    
    //라인 선택건 얻기.
    var _aTree = oAPP.attr.oDesign.fn.getSelectedDesignTree();

    //라인 선택건이 존재하지 않는경우.
    if(_aTree.length === 0){

        //268 Selected line does not exists.
        // oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", "");       

        _sRes.RETCD = "E";
        _sRes.RTMSG = "DESIGN 영역의 라인 선택건이 존재하지 않습니다."; //$$MSG

        var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
        _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT02;
        _sBindError.TYPE     = "Error";
        _sBindError.TITLE    = "DESIGN 영역의 라인 선택건이 존재하지 않습니다.";             //$$MSG
        _sBindError.DESC     = "멀티 바인딩 해제를 하기 위해서 디자인 영역의 라인을 선택 해야 합니다."; //$$MSG

        _sRes.T_RTMSG.push(_sBindError);

        return _sRes;

    }


    var _isError =false;

    //선택한 라인에 바인딩 처리가 되어 있는지 확인.
    for (let i = 0, l = _aTree.length; i < l; i++) {
        
        var _sTree = _aTree[i];

        //바인딩 처리가 되지 않은 건인경우.
        if(_sTree.UIATV === ""){

            _isError = true;

            //바인딩시 오류가 발생한 경우.
            _sTree._bind_error    = true;

            //오류 정보 수집 처리.
            var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
            _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT04;
            _sBindError.LINE_KEY = _sTree.CHILD;
            _sBindError.TYPE     = "Error";
            // _sBindError.TITLE    = _sChk.RTMSG;             //$$MSG
            _sBindError.TITLE    = `${_sTree.OBJID} - ${_sTree.UIATT} 필드 바인딩 오류.`;
            _sBindError.DESC     = "바인딩되지 않은 필드를 선택했습니다."; //$$MSG

            _sRes.T_RTMSG.push(_sBindError);


        }
        
    }


    //오류 발생 라인이 존재하는경우.
    if(_isError === true){

        oAPP.attr.oDesign.oModel.refresh();

        _sRes.RETCD = "E";
        _sRes.RTMSG = "오류 발생 라인이 존재하여 멀티 바인딩 해제를 할 수 없습니다."; //$$MSG

        return _sRes;

    }


    return _sRes;

};