/*************************************************************
 * @module - 멀티 바인딩 가능여부 점검 FUNCTION.
 *************************************************************/
module.exports = function(){

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
        
        oAPP.attr.oDesign.oModel.refresh();

        var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
        _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT02;
        _sBindError.TYPE     = "Error";
        _sBindError.TITLE    = "DESIGN 영역의 라인 선택건이 존재하지 않습니다.";             //$$MSG
        _sBindError.DESC     = "멀티 바인딩을 하기 위해서 디자인 영역의 라인을 선택 해야 합니다."; //$$MSG

        _sRes.T_RTMSG.push(_sBindError);

    }


    //모델 필드 라인 선택 위치 얻기.
    var _indx = oAPP.ui.oTree.getSelectedIndex();

    //모델 필드 라인 선택하지 않은경우.
    if(_indx === -1){

        _sRes.RETCD = "E";
        _sRes.RTMSG = "모델 필드 라인 선택건이 존재하지 않습니다."; //$$MSG

        // return _sRes;

        var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
        _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT01;
        _sBindError.TYPE     = "Error";
        _sBindError.TITLE    = "모델 필드 라인 선택건이 존재하지 않습니다.";             //$$MSG
        _sBindError.DESC     = "멀티 바인딩을 하기 위해서 모델 필드를 선택 해야 합니다."; //$$MSG

        _sRes.T_RTMSG.push(_sBindError);

        return _sRes;

    }

       
    //선택한 라인의 CONTEXT 정보 얻기.
    var _oCtxt = oAPP.ui.oTree.getContextByIndex(_indx);

    if(typeof _oCtxt === "undefined" || _oCtxt === null){

        _sRes.RETCD = "E";
        _sRes.RTMSG = "모델 필드 라인 정보를 얻을 수 없습니다."; //$$MSG

        var _sBindError = JSON.parse(JSON.stringify(oAPP.types.TY_BIND_ERROR));
        
        _sBindError.ACTCD    = oAPP.attr.CS_MSG_ACTCD.ACT01;
        _sBindError.TYPE     = "Error";
        _sBindError.TITLE    = "모델 필드 라인 선택건이 존재하지 않습니다.";             //$$MSG
        _sBindError.DESC     = "멀티 바인딩을 하기 위해서 모델 필드를 선택 해야 합니다."; //$$MSG

        _sRes.T_RTMSG.push(_sBindError);

        return _sRes;

    }


    //라인 선택건이 존재하지 않는경우 exit.
    if(_aTree.length === 0){
        return _sRes;
    }


    //모델 필드 라인 데이터 얻기.
    var _sField = _oCtxt.getProperty();
    

    var _isError = false;


    for (let i = 0; i < _aTree.length; i++) {

        var _sTree = _aTree[i];

        //바인딩 가능 여부 점검.        
        var _sChk =  oAPP.attr.oDesign.fn.checkValidBind(_sTree, _sField);

        if(_sChk.RETCD === "E"){
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
            _sBindError.DESC     = _sChk.RTMSG; //$$MSG

            _sRes.T_RTMSG.push(_sBindError);
            continue;
        }
        
    }


    //오류 발생 라인이 존재하는경우.
    if(_isError === true){

        oAPP.attr.oDesign.oModel.refresh();

        _sRes.RETCD = "E";
        _sRes.RTMSG = "오류 발생 라인이 존재하여 멀티 바인딩을 할 수 없습니다."; //$$MSG

        return _sRes;

    }
    
    return _sRes;


};