/*************************************************************
 * @module - 선택 라인의 모델 필드 정보 점검.
 *************************************************************/
module.exports = function(aTree){

    var _sRes = {RETCD:"", RTMSG:""};

    if(typeof aTree === "undefined"){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "점검 대상 attribute 항목이 존재하지 않습니다.";   //$$MSG

        return _sRes;
    }

    if(aTree.length === 0){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "점검 대상 attribute 항목이 존재하지 않습니다.";   //$$MSG
        return _sRes;
    }


    var _aField = [];

    //선택한 라인의 바인딩 필드
    for (let i = 0, l = aTree.length; i < l; i++) {

        var _sTree = aTree[i];

        //바인딩한 필드 정보 검색.
        var _sField = oAPP.fn.getModelBindData(_sTree.UIATV, oAPP.attr.oModel.oData.zTREE);


        //바인딩 필드 정보 수집.
        _aField.push(_sField);

    }


    //nozero 불가능 항목.(C:char, g:string)
    var l_nozero = "Cg";
    
    //no zero 가능 항목 검색.
    var _nozero_t = _aField.findIndex( item => l_nozero.indexOf(item.TYPE_KIND) === -1 );

    //no zero 가능 항목이 존재하는경우 true
    //존재하지 않는경우 false.
    _nozero_t = _nozero_t !== -1 ? true : false;


    //no zero 불가능 항목 검색.
    var _nozero_f = _aField.findIndex( item => l_nozero.indexOf(item.TYPE_KIND) !== -1 );

    //no zero 불가능항목이 존재지 않는 경우 true
    //존재하는경우 false.
    _nozero_f = _nozero_f !== -1 ? true : false;


    //NOZERO 가능항목 존재, 불가능항목이 존재하는경우 오류.
    if(_nozero_t === _nozero_f){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "Nozero 가능, 불가능한 항목을 같이 선택했습니다.";   //$$MSG

        return _sRes;

    }



    //number format 가능항목.(I:int, P: P TYPE)
    var l_numfmt = "IP";

    //number format 가능 항목 검색.
    var _numfmt_t = _aField.findIndex( item => l_numfmt.indexOf(item.TYPE_KIND) !== -1 );

    //number format 가능 항목이 존재하는경우 true
    //존재하지 않는경우 false.
    _numfmt_t = _numfmt_t !== -1 ? true : false;


    //number format 불가능 항목 검색.
    var _numfmt_f = _aField.findIndex( item => l_numfmt.indexOf(item.TYPE_KIND) === -1 );

    //number format 불가능항목이 존재지 않는 경우 true
    //존재하는경우 false.
    _numfmt_f = _numfmt_f !== -1 ? true : false;


    //number format 가능항목 존재, 불가능항목이 존재하는경우 오류.
    if(_numfmt_t === _numfmt_f){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "number format 가능, 불가능한 항목을 같이 선택했습니다.";   //$$MSG

        return _sRes;

    }



    //Bind type 가능항목.(P TYPE)
    var l_bindType = "P";

    //Bind type 가능 항목 검색.
    var _bindType_t = _aField.findIndex( item => l_bindType.indexOf(item.TYPE_KIND) !== -1 );

    //Bind type 가능 항목이 존재하는경우 true
    //존재하지 않는경우 false.
    _bindType_t = _bindType_t !== -1 ? true : false;


    //Bind type 불가능 항목 검색.
    var _bindType_f = _aField.findIndex( item => l_bindType.indexOf(item.TYPE_KIND) === -1 );

    //Bind type 불가능항목이 존재지 않는 경우 true
    //존재하는경우 false.
    _bindType_f = _bindType_f !== -1 ? true : false;


    //Bind type 가능항목 존재, 불가능항목이 존재하는경우 오류.
    if(_bindType_t === _bindType_f){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "Bind type 가능, 불가능한 항목을 같이 선택했습니다.";   //$$MSG

        return _sRes;

    }

    return _sRes;


};