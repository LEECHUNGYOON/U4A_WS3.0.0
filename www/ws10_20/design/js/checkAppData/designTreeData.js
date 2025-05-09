
var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

var oCheckFunc = {};


/************************************************************************
 * attribute 점검 항목 영역 -start.
 * /U4A/CL_APPLICATION_CHECKER=>GTY_SYNTAX
    GRCOD(20) TYPE C,               "내부 그룹코드
    TYPE      TYPE SYMSGTY,         "오류 타입
    FNAME     TYPE STRING,          "오류 필드명
    DESC      TYPE STRING,          "내역
    LINE      TYPE I,               "오류 Index
    METHOD    TYPE STRING,          "메소드명
    OBJID     TYPE STRING,          "UI OBJECT ID
    UIATK     TYPE ZTU4A0023-UIATK, "오류 대상 프로퍼티 내부KEY
    GUBN(1)   TYPE C.               "A:UI 디자인 영역 B:컨트롤러 EDIT
************************************************************************/
const TY_ERROR = {
    GRCOD  : "",    //내부 그룹코드
    TYPE   : "",    //오류 타입
    FNAME  : "",    //오류 필드명
    DESC   : "",    //내역
    LINE   : "",    //오류 Index
    METHOD : "",    //메소드명
    OBJID  : "",    //UI OBJECT ID
    UIATK  : "",    //오류 대상 프로퍼티 내부KEY
    GUBN   : "",    //A:UI 디자인 영역 B:컨트롤러 EDIT
};


const TY_CHECK_RES = {
    RETCD : "",     //오류 여부 E: 오류
    ERCOD : "",     //오류 코드
    RTMSG : "",     //오류 메시지
};


/*********************************************************
 * @module - child가 필수인 UI의 Child 존재 여부 점검.
 ********************************************************/
module.exports.checkRequireChild = function() {

    //design tree 데이터를 기준으로 child필수 UI 점검.
    return checkRequireChildRec(oAPP.attr.oModel.oData.zTREE);
    
};



/*********************************************************
 * @module - 입력한 property에 대한 점검 처리.
 ********************************************************/
module.exports.checkValidProperty = function() {

    //design tree 데이터를 기준으로 입력 property 점검.
    return checkValidProperty(oAPP.attr.oModel.oData.zTREE);
    
};



/*********************************************************
 * @module - 프로퍼티 입력건 점검.
 ********************************************************/
module.exports.checkPropertyValue = function(sAttr){

    var _sRes = JSON.parse(JSON.stringify(TY_CHECK_RES));

    //바인딩 처리된 건인경우 EXIT.
    if(sAttr.ISBND === "X"){
        return _sRes;
    }

    //PROPERTY가 아닌경우 EXIT.
    if(sAttr.UIATY !== "1"){
        return _sRes;
    }

    //공통코드 UI 프로퍼티 점검 항목이 존재하지 않는다면 EXIT.
    if(typeof oAPP.attr.S_CODE?.UW09 === "undefined" || oAPP.attr.S_CODE?.UW09 === null){
        return _sRes;
    }


    //현재 프로퍼티가 점검 대상 인지 확인.
    var _sUW09 = oAPP.attr.S_CODE?.UW09.find( item => item.FLD01 === sAttr.UIOBK && item.FLD01 && item.FLD03 === sAttr.UIATT ); 

    //점검 대상이 아닌경우 exit.
    if(typeof _sUW09 === "undefined"){
        return _sRes;
    }


    //점검처리 SCRIPT가 존재하지 않는경우 EXIT.
    if(_sUW09.FLD04 === "" && _sUW09.FLD05 === "" && _sUW09.FLD06 === ""){
        return _sRes;
    }

    //점검 처리 script 구성.
    var _eval = `_sRes = ${_sUW09.FLD04}${_sUW09.FLD05}${_sUW09.FLD06}`;


    //구성된 script 수행.
    try {
        eval(_eval);    
    } catch (error) {

    }
    

    return _sRes;


};



/*********************************************************
 * @module - child가 필수인 UI의 Child 존재 여부 점검 재귀호출 function.
 ********************************************************/
function checkRequireChildRec(aTree, aError = []) {
    
    if(typeof aTree === "undefined"){
        return aError;
    }

    if(aTree.length === 0){
        return aError;
    }


    for (let i = 0, l = aTree.length; i < l; i++) {
        
        var _sTree = aTree[i];

        var _aUA050 = oAPP.attr.S_CODE.UA050.filter( item => item.FLD01 === _sTree.UIOBK && item.FLD08 !== "X" );

        if(_aUA050.length === 0){
            //하위를 탐색하며, 점검 처리.
            checkRequireChildRec(_sTree.zTREE, aError);

            continue;
        }

        for (let j = 0; j < _aUA050.length; j++) {
            
            var _sUA050 = _aUA050[j];

            //필수 aggregation의 child가 존재하는지 확인.
            var _exist = _sTree.zTREE.findIndex( item => item.UIATT === _sUA050.FLD03 );

            //존재하는경우 하위 로직 skip.
            if(_exist === 0){
                continue;
            }

            //필수점검 예외 AGGR명(해당 AGGR에 UI가 존재시 점검 생략) 항목이 존재시 해당 aggr에 UI가 존재하는경우.
            if(_sUA050.FLD09 !== "" && _sTree.zTREE.findIndex( item => item.UIATT === _sUA050.FLD09 ) !== -1){
                //필수 점검 생략 처리.
                _exist = 0;
            }

            //필수 aggregation에 child 정보가 존재하지 않는경우.
            if(_exist === -1){

                var _sError = JSON.parse(JSON.stringify(TY_ERROR));

                //그룹코드 : 오브젝트 (CLAS,METH...)
                _sError.GRCOD  = "PROG";

                //오류 flag.
                _sError.TYPE   = "E";

                //오류 메시지.
                //217	&1 UI의 &2 Aggregation에 UI를 추가하십시오.
                _sError.DESC   = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "217", _sTree.OBJID, _sUA050.FLD03);

                //오류 Index
                _sError.LINE   = "";
                
                //UI OBJECT ID            
                _sError.OBJID  = _sTree.OBJID;
                
                //A:UI 디자인 영역 B:컨트롤러 EDIT
                _sError.GUBN   = "A";


                aError.push(_sError);
                
                _sError = null;
                
            }
            
        }


        //하위를 탐색하며, 점검 처리.
        checkRequireChildRec(_sTree.zTREE, aError);

        // //현재 UI가 필수 점검 대상 UI 인지 여부 확인.
        // var _sUA050 = oAPP.attr.S_CODE.UA050.find( item => item.FLD01 === _sTree.UIOBK && item.FLD08 !== "X" );

        // //필수 점검 대상 UI가 아닌경우.
        // if(typeof _sUA050 === "undefined"){

        //     //하위를 탐색하며, 점검 처리.
        //     checkRequireChildRec(_sTree.zTREE, aError);

        //     continue;

        // }

        // //필수 aggregation의 child가 존재하는지 확인.
        // var _exist = _sTree.zTREE.findIndex( item => item.UIATT === _sUA050.FLD03 );

        // //필수 aggregation에 child 정보가 존재하지 않는경우.
        // if(_exist === -1){

        //     var _sError = JSON.parse(JSON.stringify(TY_ERROR));

        //     //그룹코드 : 오브젝트 (CLAS,METH...)
        //     _sError.GRCOD  = "PROG";

        //     //오류 flag.
        //     _sError.TYPE   = "E";

        //     //오류 메시지.
        //     //217	&1 UI의 &2 Aggregation에 UI를 추가하십시오.
        //     _sError.DESC   = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "217", _sTree.OBJID, _sUA050.FLD03);

        //     //오류 Index
        //     _sError.LINE   = "";
            
        //     //UI OBJECT ID            
        //     _sError.OBJID  = _sTree.OBJID;
            
        //     //A:UI 디자인 영역 B:컨트롤러 EDIT
        //     _sError.GUBN   = "A";


        //     aError.push(_sError);
            
        //     _sError = null;
            
        // }


        // //하위를 탐색하며, 점검 처리.
        // checkRequireChildRec(_sTree.zTREE, aError);

    }

    return aError;
    
}



/*********************************************************
 * @function - design tree 데이터를 기준으로 입력 property 점검.
 ********************************************************/
function checkValidProperty(aTree, aError = []){

    if(typeof aTree === "undefined"){
        return;
    }

    if(aTree.length === 0){
        return;
    }

    for (let i = 0, l = aTree.length; i < l; i++) {
        
        var _sTree = aTree[i];

        var _aT0015 = oAPP.attr.prev[_sTree.OBJID]._T_0015;

        for (let j = 0; j < _aT0015.length; j++) {
            
            var _s0015 = _aT0015[j];

            //프로퍼티 점검 처리.
            var _sRes = module.exports.checkPropertyValue(_s0015);

            if(_sRes?.RETCD === "E"){

                var _sError = JSON.parse(JSON.stringify(TY_ERROR));

                //그룹코드 : 오브젝트 (CLAS,METH...)
                _sError.GRCOD  = "PROG";

                //오류 flag.
                _sError.TYPE   = "E";

                //오류 메시지.
                _sError.DESC   = _sRes.RTMSG;

                //오류 Index
                _sError.LINE   = "";
                
                //UI OBJECT ID            
                _sError.OBJID  = _sTree.OBJID;

                //오류 대상 프로퍼티 내부KEY
                _sError.UIATK  = _s0015.UIATK;
                
                //A:UI 디자인 영역 B:컨트롤러 EDIT
                _sError.GUBN   = "A";


                aError.push(_sError);
                
                _sError = null;

            }

            
        }

        //하위를 탐색하며, 프로퍼티 점검 처리.
        checkValidProperty(_sTree.zTREE, aError);        
        
    }

    return aError;

}



/*********************************************************
 * @function - 입력한 property의 from to 값 점검 처리.
 ********************************************************/
oCheckFunc.validFromTo = function(sAttr, from, to){

    var _sRes = JSON.parse(JSON.stringify(TY_CHECK_RES));
    

    //attribute에 입력한 값을 integer으로 변환.
    var _UIATV = parseInt(Number(sAttr.UIATV));

    //숫자 유형 여부 확인.
    if(isNaN(_UIATV) === true){
        _sRes.RETCD = "E";

        //372	&1 은 숫자 유형이 아닙니다. 숫자 유형의 값을 입력 하십시오.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "372", sAttr.UIATV);

        return _sRes;
    }


    //from 값보다 작은 값을 입력했거나, to 값보다 큰 값을 입력한 경우.
    if(_UIATV < from || _UIATV > to){

        _sRes.RETCD = "E";

        //226	&1 값은 허용값이 아닙니다.(&2 ~ &3 사이의 값을 입력하십시오.)
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, 
            "ZMSG_WS_COMMON_001", "226", sAttr.UIATV, from, to);

        return _sRes;

    }

    return _sRes;

};




/*********************************************************
 * @function - 입력한 property의 최소값 숫자 점검.
 ********************************************************/
oCheckFunc.validMinInt = function(sAttr, minValue){

    var _sRes = JSON.parse(JSON.stringify(TY_CHECK_RES));

    //attribute에 입력한 값을 integer으로 변환.
    var _UIATV = parseInt(Number(sAttr.UIATV));

    //숫자 유형 여부 확인.
    if(isNaN(_UIATV) === true){
        _sRes.RETCD = "E";

        //372	&1 은 숫자 유형이 아닙니다. 숫자 유형의 값을 입력 하십시오.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "372", sAttr.UIATV);

        return _sRes;
    }
    
    //입력값이 기준값보다 작은경우.
    if(_UIATV < minValue){

        _sRes.RETCD = "E";

        //373	&1 보다 큰 값을 입력 하십시오.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "373", minValue);

        return _sRes;

    }

    return _sRes;

};



