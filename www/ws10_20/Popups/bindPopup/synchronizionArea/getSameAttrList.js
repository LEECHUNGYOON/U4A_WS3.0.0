const TY_LIST = {
    OBJID : "",
    UIATT : "",
    UIATK : "",
    UIATV : "",
    UILIB : "",
    UIOBK : "",
    POBID : "",
    PUIOK : ""

};

//SELECT OPTION의 VALUE 프로퍼티.
const C_SEL_OPT_VALUE = [
    "EXT00001161",
    "EXT00002507"
];

/*************************************************************
 * @module - 동일속성 리스트 얻기.
 *************************************************************/
module.exports = function(is_attr){

    var _aList = [];
    
    //바인딩 필드의 모델 필드 정보 얻기.
    var _sField = oAPP.fn.getModelBindData(is_attr.UIATV, oAPP.attr.oModel.oData.zTREE);

    if(typeof _sField === "undefined"){
        return _aList;
    }

    var _aTREE_DESIGN = oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN;


    //테이블로 파생된 필드가 아닌경우.
    if(isTablePath(_sField.KIND_PATH) !== true){
        //동일 속성 리스트 구성.
        setSameAttrList(_aTREE_DESIGN, is_attr, _aList);

        return _aList;

    }


    //선택한 attr의 N건 바인딩 처리된 부모 UI 정보 얻기.
    var _oUi = oAPP.fn.getParentUi(oAPP.attr.prev[is_attr.OBJID]);


    //n건 바인딩 처리되지 않은경우.
    if(typeof _oUi === "undefined"){
        //동일 속성 리스트 구성.
        setSameAttrList(_aTREE_DESIGN, is_attr, _aList);

        return _aList;

    }
    

    //n건 바인딩 처리된 부모 UI의 라인 정보 얻기.
    var _stree = oAPP.fn.getDesignTreeData(_oUi._OBJID);
    

    //해당 부모로 부터 파생된 CHILD중 동일 프로퍼티명 타입으로 필터링.
    setSameAttrList(_stree.zTREE_DESIGN, is_attr, _aList, _oUi);

    return _aList;

};




/*******************************************************
* @function - table 파생건 여부 확인.
*******************************************************/ 
function isTablePath(KIND_PATH){

    if(typeof KIND_PATH === "undefined"){
        return false;
    }

    //현재 입력 path의 마지막 KIND 정보 제거.
    let _parentPath = KIND_PATH.slice(0, KIND_PATH.length - 2);

    //경로에 해당하는 KIND에 테이블이 존재하는경우.
    if(_parentPath.indexOf("T") !== -1){
        //TABLE 로 파생된 필드 flag return.
        return true;
    }

    return false;

}



/*******************************************************
* @function - 동일 속성 리스트 구성.
*******************************************************/ 
function setSameAttrList(aTree, is_attr, aList, oUi){

    if(typeof aTree === "undefined"){
        return;
    }

    if(aTree.length === 0){
        return;
    }

    for (let i = 0; i < aTree.length; i++) {
        
        var _sTree = aTree[i];


        //N건 바인딩 처리된 UI 정보가 존재하는경우.
        if(typeof oUi !== "undefined"){

            //현재 ui가 N건 바인딩 처리된 UI라면 하위를 탐색.
            if(_sTree.OBJID === oUi._OBJID){
                setSameAttrList(_sTree.zTREE_DESIGN, is_attr, aList, oUi);
                continue;
            }

            if(oUi._UILIB === "sap.ui.table.TreeTable" && _sTree.UILIB === "sap.ui.table.Column"){
                setSameAttrList(_sTree.zTREE_DESIGN, is_attr, aList, oUi);
                continue;
            }

            if(oUi._UILIB === "sap.ui.table.Table" && _sTree.UILIB === "sap.ui.table.Column"){
                setSameAttrList(_sTree.zTREE_DESIGN, is_attr, aList, oUi);
                continue;
            }

            //현재 UI의 N건 바인딩 처리된 부모 얻기.
            // var _oUi = oAPP.fn.getDesignTreeData(_sTree.OBJID);
            var _oUi = oAPP.fn.getParentUi(oAPP.attr.prev[_sTree.OBJID]);

            if(typeof _oUi === "undefined"){
                continue;
            }

            //N건 바인딩 처리된 UI와 현재 UI의 N건 바인딩된 부모가 다른경우 수집 SKIP.
            if(oUi._OBJID !== _oUi._OBJID){
                continue;
            }

        }


        //ATTR 항목이 아닌경우 하위를 탐색.
        if(_sTree.DATYP !== "02"){
            setSameAttrList(_sTree.zTREE_DESIGN, is_attr, aList, oUi);
            continue;
        }

        //같은 UI의 ATTR은 생략.
        if(_sTree.OBJID === is_attr.OBJID && 
            _sTree.UIATT === is_attr.UIATT &&
            _sTree.UIATY === is_attr.UIATY ){
            continue;
        }



        //처리 대상 프로퍼티가 value 인경우.
        if(is_attr.UIATT === "value"){
            
            switch (is_attr.UIOBK) {
                case "UO99992": //SELECTOPTION2
                case "UO99984": //SELECTOPTION3

                    //해당 UI가 select option인경우, select option의 value만 가능.
                    if(C_SEL_OPT_VALUE.indexOf(_sTree.UIATK) === -1){
                        continue;
                    }
                    
                    break;
            
                default:

                    //해당 UI가 select option이 아닌경우 select option의 value는 제외.
                    if(C_SEL_OPT_VALUE.indexOf(_sTree.UIATK) !== -1){
                        continue;
                    }

                    break;
            }

        }       

        

        //프로퍼티명과 타입이 같은경우 수집 처리.
        if(_sTree.UIATT === is_attr.UIATT && is_attr.UIADT === _sTree.UIADT){

            var _sList = JSON.parse(JSON.stringify(TY_LIST));

            _sList.OBJID = _sTree.OBJID;
            _sList.UIATT = _sTree.UIATT;
            _sList.UIATK = _sTree.UIATK;
            _sList.UIATV = _sTree.UIATV;
            _sList.UILIB = _sTree.UILIB;
            _sList.UIOBK = _sTree.UIOBK;
            _sList.POBID = _sTree.POBID;
            _sList.PUIOK = _sTree.PUIOK;

            aList.push(_sList);
            
        }

        setSameAttrList(_sTree.zTREE_DESIGN, is_attr, aList, oUi);
        
    }

}