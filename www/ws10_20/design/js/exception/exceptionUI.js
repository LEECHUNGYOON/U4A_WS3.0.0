var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

/*********************************************************
 * @module - UI 추가 불가 Aggregation 여부 점검.
 ********************************************************/
exports.checkDenyChildAggr = function(oParam) {

    //공통코드 항목이 존재하지 않는경우 판단하지 않음.
    if(typeof oAPP.attr.S_CODE.UW08 === "undefined" || oAPP.attr.S_CODE.UW08 === null){
		return false;
	}

    //파라메터 정보가 존재하지 않는경우 판단하지 않음.
    if(typeof oParam === "undefined" || oParam === null){
        return false;
    }

    //현재 UI 정보가 존재하지 않는경우 판단하지 않음.
    if(typeof oParam.UIOBK === "undefined" || oParam.UIOBK === null || oParam.UIOBK === ""){
        return false;
    }

    //점검 대상 Aggregation이 존재하지 않는경우 판단하지 않음.
    if(typeof oParam.UIATT === "undefined" || oParam.UIATT === null || oParam.UIATT === ""){
        return false;
    }

    //추가 하려는 CHILD UI 정보가 존재하지 않는경우 판단하지 않음.
    if(typeof oParam.CHILD_UIOBK === "undefined" || oParam.CHILD_UIOBK === null || oParam.CHILD_UIOBK === ""){
        return false;
    }
	

    //추가 불가능 Aggregation에 해당하는 UI 여부 확인.
	var _found = oAPP.attr.S_CODE.UW08.findIndex( item => 
		item.FLD01 === oParam.UIOBK && 
        item.FLD03 === oParam.UIATT && 
        item.FLD04 === oParam.CHILD_UIOBK &&
        item.FLD06 !== "X" );
	
    
    //해당되지 않는경우 EXIT.
	if(_found === -1){
		return false;
	}
    
    //해당되는 경우 추가 불가능 FLAG RETURN.
	return true;

};