//바인딩 제외 항목.
const CT_BIND_EXCEPT = [
    {ITMCD:"", FLD01:"EXT00000030"},    //appcontainer의 AppID 프로퍼티인경우
    {ITMCD:"", FLD01:"EXT00000031"},    //appcontainer의 AppDescript.
    {ITMCD:"", FLD01:"EXT00000032"},    //appcontainer의 height
    {ITMCD:"", FLD01:"EXT00000033"},    //appcontainer의 width
    {ITMCD:"", FLD01:"EXT00001188"},    //selectOption2의 F4HelpID
    {ITMCD:"", FLD01:"EXT00001189"},    //selectOption2의 F4HelpReturnFIeld
    {ITMCD:"", FLD01:"EXT00002534"},    //selectOption3의 F4HelpID
    {ITMCD:"", FLD01:"EXT00002535"},    //selectOption3의 F4HelpReturnFIeld

    {ITMCD:"", FLD01:"EXT00001347"},    //sap.ui.table.Table autoGrowing
    {ITMCD:"", FLD01:"EXT00001348"},    //sap.m.Table autoGrowing
    {ITMCD:"", FLD01:"EXT00001349"},    //sap.m.List autoGrowing
    {ITMCD:"", FLD01:"EXT00002374"},    //sap.m.Page useBackToTopButton
    {ITMCD:"", FLD01:"EXT00002378"},    //sap.uxap.ObjectPageLayout useBackToTopButton
    {ITMCD:"", FLD01:"EXT00002379"}     //sap.f.DynamicPage
];  


/*************************************************************
 * @module - DESIGN TREE에서 선택한 ATTR(PROPERTY, AGGREGEGATION)
 *           에 대해 바인딩 가능한 필드 정보 표현 처리.
 *************************************************************/
module.exports = function(is_attr){

    return new Promise((res)=>{

        console.log("라인선택");
        var _oModel = oAPP.attr.oModel;

        //바인딩 정보가 존재하지 않는경우 exit.
        if(_oModel.oData.zTREE.length === 0){
            return res(_sRes);
        }

        //2레벨의 TABLE, STRUCTURE정보만 발췌.
        var _aBindTree = _oModel.oData.zTREE[0].zTREE;


        //바인딩 가능 여부 표현 정보 초기화.
        resetBindPossible(_oModel.oData.zTREE);


        //바인딩 가능 여부 표현 할지 여부 점검.
        var _sRes = chkBindPossible(is_attr);

        //바인딩 가능 여부 표현 처리를 안하는경우.
        if(_sRes.RETCD === "E"){

            //기존 바인딩 표현 처리.
            setBindEnableOrg(_aBindTree, "", _oModel, "");

            oAPP.attr.oModel.refresh();
            
            return res(_sRes);

        }


        //바인딩 처리 cardinality 구성.
        var l_CARDI = setFieldCardinality(is_attr);


        //N건 바인딩 처리한 부모 모델 정보 얻기.
        var l_path = getParentModelPath(is_attr);

        
        //기존 로직에서 사용하는 광역변수 구성.
        oAPP.attr.oBindDialog = {};
        oAPP.attr.oBindDialog._CARDI   = l_CARDI;
        oAPP.attr.oBindDialog._is_attr = is_attr;


        
        //model field tree 바인딩 가능 여부 표현 처리.
        lf_setBindEnable(_aBindTree, l_path, _oModel);


        //바인딩 가능여부 표현 이후 기존 로직에서 사용하는 광역변수 제거.
        delete oAPP.attr.oBindDialog;
        

        oAPP.attr.oModel.refresh();
        

        return res(_sRes);

    });

}


/*************************************************************
 * @function - 바인딩 가능 여부 표현 할지 여부 점검.
 *************************************************************/
function chkBindPossible(is_attr){
    
    let _sRes = {RETCD:"", RCODE:""};

    //property, aggregation이 아닌경우 exit.
    if(is_attr.DATYP !== "02"){
        _sRes.RETCD = "E";
        _sRes.RCODE = "01";

        return _sRes;
    }

    return _sRes;

}


/*************************************************************
 * @function - 바인딩 처리 cardinality 구성.
 *************************************************************/
function setFieldCardinality(is_attr){
    
    var l_CARDI = "";

    //attribute 타입에 따른 분기.
    switch(is_attr.UIATY){
        case "1": //property
  
            l_CARDI = "F";
    
            //SELECT OPTION2의 VALUE에 바인딩처리 하는경우.
            if(is_attr.UIATK === "EXT00001161"){
                //RANGE TABLE만 바인딩 가능 FLAG 처리.
                l_CARDI = "R";
            }
    
            //SELECT OPTION3의 VALUE에 바인딩처리 하는경우.
            if(is_attr.UIATK === "EXT00002507"){
                //RANGE TABLE만 바인딩 가능 FLAG 처리.
                l_CARDI = "R";
            }
    
            //프로퍼티가 ARRAY로 입력 가능한 경우, 프로퍼티 타입이 숫자 유형이 아니면.
            if(is_attr.ISMLB === "X" && (is_attr.UIADT !== "int" && is_attr.UIADT !== "float")){
                //STRING_TABLE 바인딩 가능 FLAG 처리.
                l_CARDI = "ST";
            }
    
            break;
  
        case "3": //Aggregation
  
            l_CARDI = "T";
            break;
  
  
    } //UI Attribute Type에 따른 분기.

    return l_CARDI;

}


/*************************************************************
 * @function - N건 바인딩 처리한 부모 모델 정보 얻기.
 *************************************************************/
function getParentModelPath(is_attr){
    
    //n건 바인딩 처리된 UI인지 여부 확인.
    var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[is_attr.OBJID]);

    
    //현재 UI의 라인 정보 얻기.
    var ls_tree = oAPP.fn.getDesignTreeData(is_attr.OBJID);


    //바인딩 팝업을 호출한 attribute정보가 sap.m.Tree의 parent, child인경우.
    if(is_attr.UIATK === "EXT00001190" ||  //parent
        is_attr.UIATK === "EXT00001191"){   //child

        //items aggregation에 바인딩된 정보 매핑.
        l_path = oAPP.attr.prev[is_attr.OBJID]._MODEL["items"];

    //바인딩 팝업을 호출한 attribute정보가 sap.ui.table.TreeTable의 parent, child인경우.
    }else if(is_attr.UIATK === "EXT00001192" || //parent
        is_attr.UIATK === "EXT00001193"){  //child
                    
        //rows aggregation에 바인딩된 정보 매핑.
        l_path = oAPP.attr.prev[is_attr.OBJID]._MODEL["rows"];
        
    }else if(is_attr.UIATK === "EXT00002382" &&        //sap.ui.table.Column의 markCellColor 프로퍼티
        oAPP.attr.prev[is_attr.OBJID].__PARENT){ //sap.ui.table.Column의 parent가 존재하는경우
        
        //rows aggregation에 바인딩된 정보 매핑.
        l_path = oAPP.attr.prev[is_attr.OBJID].__PARENT._MODEL["rows"];

    }else if(ls_tree && (ls_tree.PUIATK === "AT000022249" || ls_tree.PUIATK === "AT000022258" || 
        ls_tree.PUIATK === "AT000013070" || ls_tree.PUIATK === "AT000013148")){
        //sap.ui.table.Table(sap.ui.table.TreeTable)의 rowSettingsTemplate, rowActionTemplate aggregation에 속한 UI인경우.
        //부모의 rows aggregation의 path 정보 얻기.
        l_path = oAPP.attr.prev[ls_tree.POBID]._MODEL["rows"];
        
    }else if(ls_tree && ls_tree.PUIATK === "AT000013013"){
        //sap.ui.table.RowAction의 items aggregation에 존재하는 ui인경우.

        //부모의 items에 바인딩이 설정되있지 않다면.
        if(!oAPP.attr.prev[ls_tree.POBID]._MODEL["items"]){

            //부모의 라인 정보 얻기.
            var ls_parent = oAPP.fn.getDesignTreeData(ls_tree.POBID);

            //sap.ui.table.RowAction의 부모(ui table, tree table의 rows에 바인딩된 정보를 얻기.)
            if(ls_parent && (ls_parent.UIOBK === "UO01139" || ls_parent.UIOBK === "UO01142")){
                l_path = oAPP.attr.prev[ls_parent.POBID]._MODEL["rows"];
            }

        }

    }

    return l_path;

}


/*************************************************************
 * @function - 바인딩 가능 여부 초기화.
 *************************************************************/
function resetBindPossible(aTree){

    for (let i = 0; i < aTree.length; i++) {
        
        var _sTree = aTree[i];

        _sTree.enable     = false;

        //바인딩 가능 여부 표현 필드 초기화.
        _sTree.stat_color = null;
        _sTree.stat_src   = null;
        _sTree.highlight  = null;

        //하위를 탐색하며 바인딩 가능 여부 표현 필드 초기화.
        resetBindPossible(_sTree.zTREE);
        
    }

}



/*************************************************************
 * @function - 기존 바인딩 가능 여부 처리.
 *************************************************************/
function setBindEnableOrg(it_tree, l_path, l_model, KIND) {

    if (it_tree.length === 0) {
        return;
    }

    for (var i = 0, l = it_tree.length; i < l; i++) {
        
        switch (it_tree[i].KIND) {
            case "T": //TABLE인경우.
                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";

                //하위 path를 탐색하며 선택 가능 flag 처리.
                setBindEnableOrg(it_tree[i].zTREE, l_path, l_model, it_tree[i].KIND);

                break;

            case "S": //STRUCTURE인경우.

                //하위 path를 탐색하며 선택 가능 flag 처리.
                setBindEnableOrg(it_tree[i].zTREE, l_path, l_model, KIND);

                break;

            case "E": //일반 필드인경우.

                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";

                break;

        }

    }

} //바인딩 가능여부 flag 처리.



/*************************************************************
 * @function - model field tree 바인딩 가능 여부 표현 처리.
 *************************************************************/
function lf_setBindEnable(it_tree, l_path, l_model, KIND){

    if(it_tree.length === 0){return;}

    for(var i = 0, l = it_tree.length; i < l; i++){

      switch(it_tree[i].KIND){
        case "T": //TABLE인경우.

            //range table 바인딩 처리건 여부 확인.
            if(lf_chkRangeTable(it_tree[i]) === true){
                //해당 table이 range table이며, 현재 range table을 바인딩 처리하고자 하는경우.
                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";
                it_tree[i].highlight  = "Success";

                //현재 TABLE이 바인딩 팝업 호출건의 PATH와 동일하다면.
                if(it_tree[i].CHILD === oAPP.attr.oBindDialog._is_attr.UIATV){
                    //선택됨 icon 처리.
                    it_tree[i].stat_src   = "sap-icon://accept";
                    it_tree[i].stat_color = "#1589FF";
                    it_tree[i].highlight  = "Information";
                }

                continue;
            }

            //STRING_TABLE 바인딩 처리건 여부 확인.
            if(lf_chkStringTable(it_tree[i]) === true){
                //해당 table이 STRING_TABLE이며, 현재 STRING_TABLE을 바인딩 처리하고자 하는경우.
                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";
                it_tree[i].highlight  = "Success";

                //현재 TABLE이 바인딩 팝업 호출건의 PATH와 동일하다면.
                if(it_tree[i].CHILD === oAPP.attr.oBindDialog._is_attr.UIATV){
                    //선택됨 icon 처리. 
                    it_tree[i].stat_src   = "sap-icon://accept";
                    it_tree[i].stat_color = "#1589FF";
                    it_tree[i].highlight  = "Information";
                }

                continue;

            }

            //property에서 바인딩 팝업 호출시 n건 바인딩 path와 현재 path가 동일한 경우 하위 탐색.
            if((oAPP.attr.oBindDialog._CARDI === "F" ||
                oAPP.attr.oBindDialog._CARDI === "R" ||
                oAPP.attr.oBindDialog._CARDI === "ST" ) && 
                ( l_path && l_path.substr(0, it_tree[i].CHILD.length) === it_tree[i].CHILD)){

                //N건 바인딩 필드 아이콘 표현.
                it_tree[i].stat_src   = "sap-icon://share-2";
                it_tree[i].stat_color = "#FBB917";
                it_tree[i].highlight  = "Warning";

                lf_setBindEnable(it_tree[i].zTREE, l_path, l_model, it_tree[i].KIND);
                continue;

            }

            //property에서 바인딩 팝업 호출시 table인경우 하위 정보 활성화 skip.
            if(oAPP.attr.oBindDialog._CARDI === "F"){
                continue;
            }

            //aggregation인경우 첫번째 만나는 TABLE은 선택 가능 처리 후 하위 정보 활성화 SKIP.
            if(oAPP.attr.oBindDialog._CARDI === "T" && l_path && l_path.substr(0, it_tree[i].CHILD.length) === it_tree[i].CHILD){

                var lt_child = it_tree[i].zTREE.filter( a => a.PARENT === it_tree[i].CHILD && a.KIND !== "E" );
                lf_setBindEnable(lt_child, l_path, l_model, it_tree[i].KIND);

                continue;
            }


            //현재 선택한 UI가 AGGR이 N건인경우 바인딩 불가능.
            if(oAPP.fn.attrChkBindAggrPossible(oAPP.attr.oBindDialog._is_attr) === true){
                continue;
            }

            //대상 UI로부터 자식을 탐색하며 바인딩 가능 여부 점검.
            if(oAPP.fn.getChildAggrBind(oAPP.attr.oBindDialog._is_attr.OBJID, it_tree[i].CHILD) === true){
                continue;
            }

            //aggregation인경우 첫번째 만나는 TABLE은 선택 가능 처리 후 하위 정보 활성화 SKIP.
            if(oAPP.attr.oBindDialog._CARDI === "T"){

                //현재 path의 하위 정보 얻기.
                var l_indx = it_tree[i].zTREE.length;

                //하위 필드 정보가 존재하는경우.
                if(l_indx > 0){
                    it_tree[i].enable     = true;
                    it_tree[i].stat_src   = "sap-icon://status-positive";
                    it_tree[i].stat_color = "#01DF3A";
                    it_tree[i].highlight  = "Success";
                }

                //현재 TABLE이 바인딩 팝업 호출건의 PATH와 동일하다면.
                if(it_tree[i].CHILD === oAPP.attr.oBindDialog._is_attr.UIATV){
                    //선택됨 icon 처리.
                    it_tree[i].stat_src   = "sap-icon://accept";
                    it_tree[i].stat_color = "#1589FF";
                    it_tree[i].highlight  = "Information";
                }            

                continue;
            }

            break;

        case "S": //STRUCTURE인경우.

            var l_KIND = "";

            //aggregation인경우 일반 필드는 검색 불필요 함으로 제외 조건값 구성.
            if(oAPP.attr.oBindDialog._CARDI === "T"){
                l_KIND = "E";
            }

            if(oAPP.attr.oBindDialog._CARDI === "S"){
                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";
                it_tree[i].highlight  = "Success";
            }

            //현재 path의 하위 path정보 얻기.
            var lt_child = it_tree[i].zTREE.filter( a => a.PARENT === it_tree[i].CHILD && a.KIND !== l_KIND);

            //하위 path를 탐색하며 선택 가능 flag 처리.
            lf_setBindEnable(lt_child, l_path, l_model, KIND);

            break;

        case "E": //일반 필드인경우.

            //TREE의 경우PARENT, CHILD에 바인딩시 바인딩된 AGGR의 TABLE건만 가능.
            if(oAPP.attr.oBindDialog._is_attr.UIATK === "EXT00001190" ||
                oAPP.attr.oBindDialog._is_attr.UIATK === "EXT00001191" ||
                oAPP.attr.oBindDialog._is_attr.UIATK === "EXT00001192" ||
                oAPP.attr.oBindDialog._is_attr.UIATK === "EXT00001193"){

                if(l_path && it_tree[i].CHILD.substr(0, l_path.length) !== l_path){
                    continue;

                }

            }

            
            //property인경우 필드 선택 가능 처리.
            if(oAPP.attr.oBindDialog._CARDI === "F"){

                if(l_path && KIND === "T" && it_tree[i].CHILD.substr(0, l_path.length) !== l_path){
                    continue;
                }

                //바인딩 예외처리 항목에 해당하는건은 선택 불가능 처리.
                if(CT_BIND_EXCEPT.findIndex( item => item.FLD01 === oAPP.attr.oBindDialog._is_attr.UIATK) !== -1){
                    continue;
                }

                it_tree[i].enable     = true;
                it_tree[i].stat_src   = "sap-icon://status-positive";
                it_tree[i].stat_color = "#01DF3A";
                it_tree[i].highlight  = "Success";

                //현재 path가 이전 바인딩값과 동일한 경우.
                if(it_tree[i].CHILD === oAPP.attr.oBindDialog._is_attr.UIATV){
                    //선택됨 icon 처리.
                    it_tree[i].stat_src   = "sap-icon://accept";
                    it_tree[i].stat_color = "#1589FF";
                    it_tree[i].highlight  = "Information";

                    //이전 선택한 바인딩 상세정보가 존재하는경우.
                    if(oAPP.attr.oBindDialog._is_attr.MPROP !== ""){
                        //바인딩 상세정보 매핑.
                        it_tree[i].MPROP = oAPP.attr.oBindDialog._is_attr.MPROP;
                    }

                }

            }

            break;

        }

    }

} //model field tree 바인딩 가능 여부 표현 처리.


/*************************************************************
 * @function - range table 여부 확인.
 *************************************************************/
function lf_chkRangeTable(is_tree){

    //바인딩 팝업 호출시 RANGE 처리용으로 호출하지 않은경우 EXIT.
    if(oAPP.attr.oBindDialog._CARDI !== "R"){return;}

    //TABLE이 아닌경우 EXIT.
    if(is_tree.KIND !== "T"){return;}

    //현재 table의 하위 필드 정보 검색.
    var lt_filter = is_tree.zTREE;

    //child가 4건이 아닌경우 exit.
    if(lt_filter.length !== 4){return;}

    //SIGN, OPTION, LOW, HIGH 필드가 아닌 필드 검색.
    var l_indx = lt_filter.findIndex( a => a.NTEXT !== "SIGN" && a.NTEXT !== "OPTION" 
        &&  a.NTEXT !== "LOW" && a.NTEXT !== "HIGH");

    //SIGN, OPTION, LOW, HIGH 이외의 필드가 존재하지 않는경우.
    if(l_indx === -1){
        //range table flag return
        return true;
    }

} //range table 여부 확인.


/*************************************************************
 * @function - STRING_TABLE 여부 확인.
 *************************************************************/
function lf_chkStringTable(is_tree){

    //STRING_TABLE 바인딩 처리용으로 호출되지 않은경우 EXIT.
    if(oAPP.attr.oBindDialog._CARDI !== "ST"){return;}

    //TABLE이 아닌경우 EXIT.
    if(is_tree.KIND !== "T"){return;}

    //부모가 ROOT인경우 EXIT.(바인딩 가능한건은 STRU-FIELD or TABLE-FIELD만 가능)
    if(is_tree.PARENT === "Attribute"){return;}

    //현재 라인이 STRING_TABLE인경우 STRING_TABLE FLAG RETURN.
    if(is_tree.EXP_TYP === "STR_TAB"){
        return true;
    }

}  //STRING_TABLE 여부 확인.