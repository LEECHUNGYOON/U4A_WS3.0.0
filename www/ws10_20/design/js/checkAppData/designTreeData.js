
var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

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
    GRCOD  : "",    //"내부 그룹코드
    TYPE   : "",    //"오류 타입
    FNAME  : "",    //"오류 필드명
    DESC   : "",    //"내역
    LINE   : "",    //"오류 Index
    METHOD : "",    //"메소드명
    OBJID  : "",    //"UI OBJECT ID
    UIATK  : "",    //"오류 대상 프로퍼티 내부KEY
    GUBN   : "",    //"A:UI 디자인 영역 B:컨트롤러 EDIT
};



/*********************************************************
 * @module - child가 필수인 UI의 Child 존재 여부 점검.
 ********************************************************/
module.exports.checkRequireChild = function() {

    //design tree 데이터를 기준으로 child필수 UI 점검.
    return checkRequireChildRec(oAPP.attr.oModel.oData.zTREE);
    
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

        //현재 UI가 필수 점검 대상 UI 인지 여부 확인.
        var _sUA050 = oAPP.attr.S_CODE.UA050.find( item => item.FLD01 === _sTree.UIOBK && item.FLD08 !== "X" );

        //필수 점검 대상 UI가 아닌경우.
        if(typeof _sUA050 === "undefined"){

            //하위를 탐색하며, 점검 처리.
            checkRequireChildRec(_sTree.zTREE, aError);

            continue;

        }

        //필수 aggregation의 child가 존재하는지 확인.
        var _exist = _sTree.zTREE.findIndex( item => item.UIATT === _sUA050.FLD03 );

        //필수 aggregation에 child 정보가 존재하지 않는경우.
        if(_exist === -1){

            var _sError = JSON.parse(JSON.stringify(TY_ERROR));

            //그룹코드 : 오브젝트 (CLAS,METH...)
            _sError.GRCOD  = "PROG";

            //오류 flag.
            _sError.TYPE   = "E";

            //오류 메시지.
            _sError.DESC   = `${_sTree.OBJID} UI의 ${_sUA050.FLD03} aggregation에 UI를 추가하십시오.`;  //$$MSG

            //오류 Index
            _sError.LINE   = "";
            
            //UI OBJECT ID            
            _sError.OBJID  = _sTree.OBJID;
            
            //A:UI 디자인 영역 B:컨트롤러 EDIT
            _sError.GUBN   = "A";


            aError.push(_sError);
            
            _sError = null;
            
        }


        //하위를 탐색하며, 점검 처리.
        checkRequireChildRec(_sTree.zTREE, aError);

    }

    return aError;
    
}