
//oAPP에서 사용하고 있는 object 점검 항목.
const T_CHK_APP_OBJECT = [
    'fn.parseTree2Tab',
    'fn.setShortcutLock',
    'fn.getTreeData',
    'fn.setTreeJson',
    'fn.setTreeDnDEnable',
    'fn.setTreeChkBoxEnable',
    'fn.setTreeUiIcon',
    'fn.designSetActionIcon',
    'fn.designTreeSetRowAction',
    'fn.designRefershModel',
    'fn.crtStru0015',
    'fn.setChangeFlag',
    'fn.getScript',
    'attr.ui.frame.contentWindow.drawPreview',
    'attr.oModel.oData.zTREE',
    'attr.prev',
    'attr.oModel.oData.TREE',    
    'attr.appInfo.APPID',
    'attr.appInfo.GUINR',
    'DATA.APPDATA.T_0015',
    'DATA.LIB.T_0022',
    'DATA.LIB.T_0023',
];

//AI와 통신을 통한 UI 생성 처리.
const C_TRANS_AI_DATA = "TRANS_AI_DATA";

//DESIGN TREE 영역에 DROP을 통한 UI 생성 처리.
const C_DESIGN_DROP = "DESIGN_DROP";

//DESIGN TREE 영역에서 붙여넣기를 통한 UI 생성 처리.
const C_DESIGN_PASTE = "DESIGN_PASTE";


//액션코드 항목.
const T_ACTCD = [
    C_TRANS_AI_DATA,   //AI와 통신을 통한 UI 생성 처리.
    C_DESIGN_DROP,   //DESIGN TREE 영역에 DROP을 통한 UI 생성 처리.
    C_DESIGN_PASTE   //DESIGN TREE 영역에서 붙여넣기를 통한 UI 생성 처리.
];


//처리결과 메시지 구조.
const TY_RET = {
    RETCD : "",
    RTMSG : "",
};


let oAPP = undefined;

//ui5 라이브러리.
let sap = undefined;


/*********************************************************
 * @module - AI UI 정보 
 * @params {sAppData} - AI를 통해 전달받은 어플리케이션 정보
 *  sAppData.ACTCD - 액션 코드.
 *                   TRANS_AI_DATA : AI와 통신을 통한 UI 생성 처리.
 *                   DESIGN_DROP   : DESIGN TREE 영역에 DROP을 통한 UI 생성 처리.
 *                   DESIGN_PASTE  : DESIGN TREE 영역에서 붙여넣기를 통한 UI 생성 처리.
 *  sAppData.T_0014 - UI 정보
 *  sAppData.T_0015 - UI의 attribute(property, event, aggregation) 정보
 ********************************************************/
module.exports = function(sAppData, oAPPInstance){
    
    return new Promise(async function(resolve){

        parent.setBusy("X");

        //oAPP INSTANCE 광역화.
        if(typeof oAPP === "undefined"){

            oAPP = oAPPInstance;

            //oAPP INSTANCE 정보 점검.
            let _sRes = checkAppInstance(oAPP);

            if(_sRes.RETCD === "E"){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return resolve(_sRes);
            }
        
        }

        if(typeof sap === "undefined"){
            //WS 3.0 메인 프레임.
            sap = document.getElementById('ws_frame').contentWindow.sap

        }
        

        //단축키 잠금 처리.
        oAPP.fn.setShortcutLock(true);

        
        //입력 파라메터 점검 처리.
        _sRes = checkLibData(sAppData);
        
        if(_sRes.RETCD === "E"){

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return resolve(_sRes);
        }


        //action code에 따른 로직 분기.
        switch (sAppData.ACTCD) {
            case C_TRANS_AI_DATA: 
                //AI와 통신을 통한 UI 생성 처리.
                _sRes = await createUiFromTrasnport(sAppData);

                break;

            case C_DESIGN_DROP:
                //DESIGN TREE 영역에 DROP을 통한 UI 생성 처리.
                _sRes = await createUiFromDrop(sAppData);

                break;
        
            default:
                break;
        }

        return resolve(_sRes);

    });

};




/*********************************************************
 * @function - 전달받은 라이브러리 정보 점검.
 ********************************************************/
function checkLibData(sAppData){

    let _sRet = JSON.parse(JSON.stringify(TY_RET));
    

    //파라메터정보가 존재하지 않는경우.
    if(typeof sAppData === "undefined"){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "라이브러리 파라메터가 존재하지 않습니다.";

        return _sRet;
    }


    //파라메터정보가 존재하지 않는경우.
    if(sAppData === null){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "라이브러리 파라메터가 존재하지 않습니다.";

        return _sRet;
    }

    
    //AI 데이터 -> 0014, 0015 데이터 구성에 실패한경우.
    if(sAppData?.RETCD === "E"){
        _sRet.RETCD = sAppData.RETCD;

        _sRet.RTMSG = sAppData.RTMSG;

        return _sRet;
    }


    //액션코드가 존재하지 않는경우.
    if(!sAppData?.ACTCD){
        _sRet.RETCD = "E";

        //$MSG
        _sRet.RTMSG = "ACTCD가 존재하지 않습니다.";

        return _sRet;
    }


    //입력한 액션코드가 허용 가능한건인지 확인.
    if(T_ACTCD.indexOf(sAppData.ACTCD) === -1){
        _sRet.RETCD = "E";

        //$MSG
        _sRet.RTMSG = `${sAppData.ACTCD} 는 허용되지 않는 CODE 입니다.`;

        return _sRet;

    }


    //AI 데이터를 통해 UI 정보 구성건이 존재하지 않는경우.
    if(typeof sAppData?.T_0014 === "undefined"){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return _sRet;
    }


    //AI 데이터를 통해 UI 정보 구성건이 존재하지 않는경우.
    if(Array.isArray(sAppData?.T_0014) !== true){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return _sRet;
    }


    //AI 데이터를 통해 UI 정보 구성건이 존재하지 않는경우.
    if(sAppData?.T_0014.length === 0){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return _sRet;
    }


    //전달받은 ROOT UI 점검.
    _sRet = checkRootUIObject(sAppData);

    if(_sRet.RETCD === "E"){
        return _sRet;
    }


    // //전달받은 OBJECT ID가 존재하는경우 점검.
    // _sRet = checkOBJIDParam(sAppData);

    // if(_sRet.RETCD === "E"){
    //     return _sRet;
    // }

    return _sRet;
    
}


/*********************************************************
 * @function - 전달받은 ROOT UI 점검.
 ********************************************************/
function checkRootUIObject(sAppData){

    let _sRet = JSON.parse(JSON.stringify(TY_RET));


    let _s0014 = sAppData.T_0014[0];

    //날라온 데이터의 ROOT를 봤더니 POBID가 있으면 오류.
    if(_s0014.POBID !== ""){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "최상위 UI에 부모 정보가 존재합니다.";

    }
    
    return _sRet;

}




/*********************************************************
 * @function - ROOT UI 파라메터 변경 처리.
 ********************************************************/
function changeRootUIObject(sParams){

    let _s0014 = sParams.LIBDATA.T_0014[0];

    //전달받은 UI정보의 root가 sap.m.App가 아닌경우 exit.
    if(_s0014.UILIB !== "sap.m.App"){
        return;
    }


    //선택한 UI가 ROOT, APP가 아닌경우 EXIT.
    if(sParams.ROOT.OBJID !== "ROOT" && sParams.ROOT.OBJID !== "APP"){
        return;
    }


    //전달받은 UI의 root가 sap.m.App 이면서,
    //추가 대상 위치의UI가 최상위 위치인경우 하위 로직 수행.

    
    //최상위 APP 정보를 얻기.
    let _sAPP = oAPP.fn.getTreeData("APP");

    
    //AI로 부터 전달받은 ROOT UI의 ATTRIBUTE의 OBJECT ID 변경.
    var _a0015 = sParams.LIBDATA.T_0015.filter( item => item.OBJID === _s0014.OBJID );

    for (let i = 0, l = _a0015.length; i < l; i++) {
        var _s0015 = _a0015[i];

        _s0015.OBJID = _sAPP.OBJID;
        
    }

    
    //root UI의 child 정보 얻기.
    let _aChild = sParams.LIBDATA.T_0014.filter( item => item.POBID === _s0014.OBJID );
    
    for (let i = 0, l = _aChild.length; i < l; i++) {

        let _sChild = _aChild[i];

        //현재 APPLICATION의 OBJECT ID를 PARENT로 지정.
        _sChild.POBID = _sAPP.OBJID;
        
    }

    //AI로 부터 입력받은 최상위 UI 제거 처리.
    sParams.LIBDATA.T_0014.splice(0, 1);
    
}





/*********************************************************
 * @function - 대상 UI의 추가될 aggregation 정보 얻기.
 ********************************************************/
function getEmbeddedAggregation(sSource, sTarget){

    return new Promise(async function (resolve) {

        //aggregation 선택 팝업이 로드되지 않은경우.
        if(typeof oAPP.fn.aggrSelectPopup === "undefined"){

            //UI 추가 팝업 정보가 존재하지 않는다면 JS 호출 후 팝업 호출.
            await new Promise(function(resJSLoad){

                oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
                    resJSLoad();
                });

            });

        }


        //aggregation 선택 팝업 호출.
        oAPP.fn.aggrSelectPopup(sSource, sTarget, function(sAggr, sChild, sParent){
            
            parent.setBusy("X");

            //단축키 잠금 처리.
            oAPP.fn.setShortcutLock(true);

            let _sRes = {};

            _sRes.sAggr   = sAggr;
            _sRes.sChild  = sChild;
            _sRes.sParent = sParent;
            
            resolve(_sRes);

        });
        
    });

}




/*********************************************************
 * @function - Aggregation 정보로부터 _s0014 및 _s0015 구조 구성
 * 
 * @param {object} oUi - _s0014 객체 (T_0014의 UI 정보)
 * @param {object} oLibMeta - _s0022 객체 (UI Object 메타정보)
 * @param {object} oAggr - sAggr 객체 (aggregation 정보)
 * @returns {object} _s0015 구조 객체 반환
 *********************************************************/
function setRootEmbeddedAggregation(oUi, oLibMeta, oAggr) {

    // T_0014용 정보 구성

    //UI Attribute Internal Key
    oUi.UIATK  = oAggr.UIATK;

    //UI Attribute ID.
    oUi.UIATT  = oAggr.UIATT;

    //UI Attribute ID (Upper Case Short)
    oUi.UIASN  = oAggr.UIASN;

    //UI Attribute Type
    oUi.UIATY  = oAggr.UIATY;

    //UI Object Property Data Type (Real)
    oUi.UIADT  = oAggr.UIADT;

    //UI Object Property Data Type (SAP Internal)
    oUi.UIADS  = oAggr.UIADS;

    //UI Object Property Value Key
    oUi.VALKY  = oAggr.VALKY;

    //Is List Box Support? (Yes : X)
    oUi.ISLST  = oAggr.ISLST;

    //Is Multie Value Bind? (Yes : X)
    oUi.ISMLB  = oAggr.ISMLB;

    //UI Attribute Internal Key
    oUi.PUIATK = oAggr.UIATK;

    // T_0015 구조 생성
    let oAttr = oAPP.fn.crtStru0015();

    oAttr.OBJID = oUi.OBJID;
    oAttr.UIATK = oAggr.UIATK;
    oAttr.UIATT = oAggr.UIATT;
    oAttr.UIASN = oAggr.UIASN;
    oAttr.UIATY = "6";
    oAttr.UIADT = oAggr.UIADT;
    oAttr.ISMLB = oAggr.ISMLB;
    oAttr.ISEML = "X";
    oAttr.ISEMB = "X";

    oAttr.UIOBK = oLibMeta?.UIOBK || "";
    oAttr.UILIK = oLibMeta?.UILIK || "";

    return oAttr;
}



/*********************************************************
 * @function - AI로 부터 입력받은 CHILD UI 정보 구성 처리.
 ********************************************************/
function setChildUiOjbect(sParams){

    
    for (let i = 0, l = sParams.LIBDATA.T_0014.length; i < l; i++) {
            
        let _s0014 = sParams.LIBDATA.T_0014[i];

        //Web Application ID
        _s0014.APPID = oAPP.attr.appInfo.APPID;

        //Guid Number
        _s0014.GUINR = oAPP.attr.appInfo.GUINR;

        //대상 UI 검색.
        let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === _s0014.UILIB );

        if(typeof _s0022 === "undefined"){
            continue;
        }

        //폐기된 건인경우 생략.
        if(_s0022.ISDEP === "X"){
            continue;
        }

        //이전 UI 정보.
        let _BEFORE_OBJID = _s0014.OBJID;


        //object id 다시 채번.
        let _OBJID = setOBJID(_BEFORE_OBJID, sParams.aT_0014);

        _s0014.OBJID = _OBJID;


        let _aChild = sParams.LIBDATA.T_0014.filter( item => item.POBID === _BEFORE_OBJID );

        for (let index = 0; index < _aChild.length; index++) {
            let _sChild = _aChild[index];

            _sChild.NEW_POBID = _OBJID;
            
        }


        let _a0015 = sParams.LIBDATA.T_0015.filter( item => item.OBJID === _BEFORE_OBJID );

        for (let index = 0; index < _a0015.length; index++) {
            let _s0015 = _a0015[index];

            _s0015.NEW_OBJID = _OBJID;
            
        }

        
        //현재 UI의 UI OBJECT KEY 매핑.(UO00249)
        _s0014.UIOBK = _s0022.UIOBK;

        //UI Object Find Value(SAP.M.BUTTON)
        _s0014.UIFND = _s0022.UIFND;

        //Is Extension?(Yes : X)
        _s0014.ISEXT = _s0022.ISEXT;

        //Target UI Object Library(sap.m)
        _s0014.TGLIB = _s0022.TGLIB;

        //Is Exception UI?(Yes : X )
        _s0014.ISECP = _s0022.ISECP;


        sParams.aT_0014.push(_s0014);
        
    }



    for (let i = 0, l = sParams.LIBDATA.T_0014.length; i < l; i++) {

        let _s0014 = sParams.LIBDATA.T_0014[i];

        if(typeof _s0014.NEW_POBID !== "undefined"){
            _s0014.POBID = _s0014.NEW_POBID;
        }

        delete _s0014.NEW_POBID;

        //부모 UI OBJECT KEY가 없는경우 최상위.
        //호출처에서 만들어진 UI
        if(_s0014.POBID === ""){
            _s0014.POBID = sParams.ROOT.OBJID;
            _s0014.PUIOK = sParams.ROOT.UIOBK;

            continue;
        }

        
        //부모 instance 검색.
        let _sParent = sParams.aT_0014.find( item => item.OBJID === _s0014.POBID );

        if(typeof _sParent === "undefined"){
            continue;
        }

        //부모 UI의 UI OBJECT KEY 매핑.
        _s0014.PUIOK = _sParent.UIOBK;


        //embedded Aggregation 검색.
        let _s0023 = oAPP.DATA.LIB.T_0023.find( item => 
            item.UIOBK === _s0014.PUIOK &&
            item.UIATT === _s0014.UIATT &&
            item.UIATY === _s0014.UIATY
        );

        if(typeof _s0023 === "undefined"){
            continue;
        }

        if(_s0023.ISDEP === "X"){
            continue;
        }

        //UI Attribute Internal Key
        _s0014.UIATK  = _s0023.UIATK;

        //UI Attribute ID (Upper Case Short)
        _s0014.UIASN  = _s0023.UIASN;

        //UI Attribute Type
        _s0014.UIATY  = _s0023.UIATY;

        //UI Object Property Data Type (Real)
        _s0014.UIADT  = _s0023.UIADT;

        //UI Object Property Data Type (SAP Internal)
        _s0014.UIADS  = _s0023.UIADS;

        //UI Object Property Value Key
        _s0014.VALKY  = _s0023.VALKY;

        //Is List Box Support? (Yes : X)
        _s0014.ISLST  = _s0023.ISLST;

        //Is Multie Value Bind? (Yes : X)
        _s0014.ISMLB  = _s0023.ISMLB;

        //UI Attribute Internal Key
        _s0014.PUIATK = _s0023.UIATK;        

    }

}




/*********************************************************
 * @function - 생성한 UI명 채번
 ********************************************************/
function setOBJID(objid, aT_0014){

    let _cnt = 1;
    let _upper = objid.toUpperCase();

    _upper = _upper.replace(/\d/g,"");

    let _objid = _upper + _cnt;

    let _found = false, l_stru;


    while(_found !== true){

      //구성한 objid와 동일건 존재여부 확인.
      if(aT_0014.findIndex( a => a.OBJID === _objid ) === -1){
        //동일건이 존재하지 않는경우 구성한 OBJECT ID RETURN.
        return _objid;

      }

      _cnt ++;

      _objid = _upper + _cnt;

    }

};  //생성한 UI명 채번




/*********************************************************
 * @function - AI로 부터 입력받은 CHILD UI의 attribute 정보 구성 처리.
 ********************************************************/
function setChildUiAttribute(sParams){


    for (let i = 0, l = sParams.LIBDATA.T_0015.length; i < l; i++) {

        let _s0015 = sParams.LIBDATA.T_0015[i];

        if(typeof _s0015.NEW_OBJID !== "undefined"){
            _s0015.OBJID = _s0015.NEW_OBJID;
        }

        delete _s0015.NEW_OBJID;

        //Web Application ID
        _s0015.APPID = oAPP.attr.appInfo.APPID;

        //Guid Number
        _s0015.GUINR = oAPP.attr.appInfo.GUINR;


        //대상 UI 검색.
        let _s0014 = sParams.aT_0014.find( item => item.OBJID === _s0015.OBJID );

        if(typeof _s0014 === "undefined"){
            continue;
        }

        let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.UIOBK === _s0014.UIOBK );

        if(typeof _s0022 === "undefined"){
            continue;
        }

        //폐기된 건인경우 수집 생략.
        if(_s0022.ISDEP === "X"){
            continue;
        }


        //DEFAULT 현재 UI의 UI OBJECT KEY.
        let _UIOBK = _s0014.UIOBK;

        //DEFAULT 현재 ATTRIBUTE의 TYPE.
        let _UIATY = _s0015.UIATY;

        //embedded Aggregation인경우.
        if(_UIATY === "6"){

            //부모 UI의 UI OBJECT KEY.
            _UIOBK = _s0014.PUIOK;

            //부모 UI의 aggregation 검색을 위한 type 변경.
            _UIATY = _s0014.UIATY;
        }


        let _s0023 = oAPP.DATA.LIB.T_0023.find( item => 
            item.UIOBK === _UIOBK &&
            item.UIATT === _s0015.UIATT &&
            item.UIATY === _UIATY
        );

        if(typeof _s0023 === "undefined"){
            continue;
        }

        //폐기된 건인경우 수집 생략.
        if(_s0023.ISDEP === "X"){
            continue;
        }

        //UI Attribute Internal Key
        _s0015.UIATK = _s0023.UIATK;

        //UI Library Internal Key
        _s0015.UILIK = _s0022.UILIK;

        //UI Object Internal Key
        _s0015.UIOBK = _s0023.UIOBK;

        //UI Attribute ID (Upper Case Short)
        _s0015.UIASN = _s0023.UIASN;

        //UI Object Property Data Type (Real)
        _s0015.UIADT = _s0023.UIADT;

        //Is Multie Value Bind? (Yes : X)
        _s0015.ISMLB = _s0023.ISMLB;


        //직접 입력 가능한 AGGREGATION인경우.
        if(_s0023.ISSTR === "X" && _s0015.UIATY === "3"){
            _s0015.UIATK = _s0015.UIATK + "_1";

            _s0015.UIATY = "1";

        }

        sParams.aT_0015.push(_s0015);

    }

}




/*********************************************************
 * @function - object 정보 return 처리.
 ********************************************************/
function getNestedProp(obj, pathStr) {
  
    return pathStr.split('.').reduce((acc, key) => acc?.[key], obj);

}




/*********************************************************
 * @function - APP Instance 점검.
 ********************************************************/
function checkAppInstance(oAPPInstance){

    let _sRet = JSON.parse(JSON.stringify(TY_RET));

    if(typeof oAPPInstance === "undefined"){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "oAPP 파라메터가 존재하지 않습니다.";

        return _sRet;

    }


    if(oAPPInstance === null){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "oAPP 파라메터가 존재하지 않습니다.";

        return _sRet;

    }


    //점검 항목이 존재하지 않는경우 exit.
    if(T_CHK_APP_OBJECT.length === 0){
        return _sRet;
    }


    for (let i = 0, l = T_CHK_APP_OBJECT.length; i < l; i++) {
        
        let _checkObj = T_CHK_APP_OBJECT[i];

        let _obj = getNestedProp(oAPPInstance, _checkObj);

        if(_obj === undefined){

            _sRet.RETCD = "E";

            //$$MSG
            _sRet.RTMSG = `oAPP의 ${_checkObj} 파라메터가 존재하지 않습니다.`;

            return _sRet;

        }       
        
    }

    return _sRet;


}




/*********************************************************
 * @function - AI와 통신을 통한 UI 생성 처리.
 ********************************************************/
async function createUiFromTrasnport(sAppData){

    var _sRes = JSON.parse(JSON.stringify(TY_RET));
    
    //라인 선택건 정보 얻기.
    var _sParent = oAPP.fn.designGetSelectedTreeItem();

    if(typeof _sParent === "undefined"){

        _sRes.RETCD = "E";

        //$$MSG
        _sRes.RTMSG = "선택한 라인이 존재하지 않습니다.";

        return _sRes;

    }


    //선택한 라인이 ROOT일때의 UI 추가 처리.
    if(_sParent.OBJID === "ROOT"){
        return await insertUiFromRootTrasnportData(sAppData, _sParent);
    }


    //선택한 라인이 ROOT가 아닌경우에 대한 UI 추가 처리.
    return await insertUiFromTargetTrasnportData(sAppData, _sParent);


}



/*********************************************************
 * @function - 14, 15 정보를 통한 UI 재구성 처리.
 ********************************************************/
async function rebuildAppData(sParams, randHist) {

    
    //AI로 부터 입력받은 CHILD UI 정보 구성 처리.
    setChildUiOjbect(sParams);


    //AI로 부터 입력받은 CHILD UI의 attribute 정보 구성 처리.
    setChildUiAttribute(sParams);


    var _sUndoHist = {
        ROOT : sParams.ROOT.OBJID,
        PRCCD : "ADD",
        RAND : randHist,
        HIST : sParams.LIBDATA.T_0014.filter( item => item.POBID === sParams.ROOT.OBJID )
    };

    
    //UNDO 이력 추가 처리.
    require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("AI_INSERT", _sUndoHist);


    oAPP.attr.oModel.oData.TREE = sParams.aT_0014;

    oAPP.attr.oModel.oData.zTREE = [];

    //tree 바인딩 정보 구성.
    oAPP.fn.setTreeJson(oAPP.attr.oModel,"TREE","OBJID","POBID","zTREE");

    //tree drag & drop 처리 활성여부 처리.
    oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);

    //UI design tree영역 체크박스 활성여부 처리.
    oAPP.fn.setTreeChkBoxEnable(oAPP.attr.oModel.oData.zTREE[0]);

    //UI design tree 영역 UI에 따른 ICON 세팅.
    oAPP.fn.setTreeUiIcon(oAPP.attr.oModel.oData.zTREE[0]);

    //UI design tree 영역의 action icon 활성여부 처리.
    oAPP.fn.designSetActionIcon(oAPP.attr.oModel.oData.zTREE[0]);

    //design tree의 row action 활성여부 설정.
    oAPP.fn.designTreeSetRowAction();

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh();


    //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
    await oAPP.fn.designRefershModel();

    oAPP.DATA.APPDATA.T_0015 = [];

    oAPP.DATA.APPDATA.T_0015 = sParams.aT_0015;


    //변경 FLAG 처리.
    oAPP.fn.setChangeFlag();


    oAPP.attr.prev = {};

    //미리보기 화면 구성.
    await oAPP.attr.ui.frame.contentWindow.drawPreview();
    
}



/*********************************************************
 * @function - ROOT UI에 AI와 통신을 통한 UI 생성 처리.
 ********************************************************/
async function insertUiFromRootTrasnportData(sAppData, sParent){

    var _sRes = JSON.parse(JSON.stringify(TY_RET));

    //$$MSG
    var _msg = "ROOT를 선택시 APP의 모든 하위 UI가 초기화 됩니다. 계속 하시겠습니까?";

    //단축키 잠금 해제처리.
    oAPP.fn.setShortcutLock(false);

    parent.setBusy("");

    //확인 팝업 호출.
    var _param = await new Promise(function(resConfirm){
        parent.showMessage(sap, 30, "I", _msg, async function(params){
            return resConfirm(params);
        });
    });


    if(_param !== "YES"){

        _sRes.RETCD = "E";

        //$$MSG
        _sRes.RTMSG = "취소함";

        return _sRes;

    }


    parent.setBusy("X");

    //단축키 잠금 해제처리.
    oAPP.fn.setShortcutLock(true);


    let _sParams = {};

    //AI로 부터 전달받은 파라메터 정보.
    _sParams.LIBDATA = sAppData;


    var _sParent = sParent;

    //ROOT인경우 APP UI를 대상으로 설정.
    if(_sParent.OBJID === "ROOT"){
        _sParent = oAPP.fn.getTreeData("APP");
    }

    
    //UI 추가 대상 OBJECT의 TREE 정보 얻기.
    _sParams.ROOT = _sParent;


    let _randHist = oAPP.fn.getRandomKey();


    //최상위 UI를 선택한 경우, 최상위를 제외한 나머지 UI 제거.
    if(_sParams.ROOT.OBJID === "APP"){
        

        //APP의 ATTR 변경건 이력 설정.
        var _sUndoHist = {
            ROOT : _sParams.ROOT.OBJID,
            PRCCD : "CHANGE_ATTR",
            RAND : _randHist,
            HIST : oAPP.attr.prev[_sParams.ROOT.OBJID]._T_0015
        };

        //UNDO 이력 추가.
        parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("AI_INSERT", _sUndoHist);


        
        var _sUndoHist = {
            ROOT : _sParams.ROOT.OBJID,
            PRCCD : "DEL",
            RAND : _randHist,
            HIST : _sParams.ROOT.zTREE
        };

        //UNDO 이력 추가.
        parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("AI_INSERT", _sUndoHist);
        
        _sParams.ROOT.zTREE = [];

    }

    
    //ROOT UI 파라메터 변경 처리.
    changeRootUIObject(_sParams);



    //현재 화면에 출력된 tree를 itab화.
    _sParams.aT_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);


    _sParams.aT_0015 = [];

    //현재 UI의 매핑된 ATTR 정보 수집 처리.
    for (let i = 0; i < _sParams.aT_0014.length; i++) {

        let _s0014 = _sParams.aT_0014[i];

        if(_s0014.OBJID === "APP"){
            continue;
        }

        _sParams.aT_0015 = _sParams.aT_0015.concat(oAPP.attr.prev[_s0014.OBJID]._T_0015);
        
    }


    //14, 15 정보를 통한 UI 재구성 처리.
    await rebuildAppData(_sParams, _randHist);

    return _sRes;


}




/*********************************************************
 * @function - ROOT가 아닌 대상 UI에 AI와 통신을 통한 UI 생성 처리.
 ********************************************************/
async function insertUiFromTargetTrasnportData(sAppData, sParent) {

    var _sRes = JSON.parse(JSON.stringify(TY_RET));

    //AI로 부터 받은 데이터의 ROOT UI 정보 얻기.
    let _s0014 = sAppData.T_0014[0];

    //대상 UI 검색.
    let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === _s0014.UILIB );

    if(typeof _s0022 !== "undefined"){
        _s0014.UIOBK = _s0022.UIOBK;
    }   

    //대상 UI의 추가될 aggregation 정보 얻기.
    var _sResAggr = await getEmbeddedAggregation(_s0014, sParent);

    
    let _randHist = oAPP.fn.getRandomKey();


    //AGGR 팝업에서 선택한 aggregation의 child가 존재하는지 확인.
    var _found = sParent.zTREE.findIndex( item  => item.UIATK === _sResAggr.sAggr.UIATK );

    
    //선택한 AGGREGATION에 UI가 존재하는경우.
    if(_found !== -1){

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        //$$MSG
        var _msg = `${sParent.OBJID}의 ${_sResAggr.sAggr.UIATT} Aggregation에 Child UI가 존재 합니다.\n` + 
                `${_sResAggr.sAggr.UIATT} Aggregation의 UI를 초기화 처리 후 AI로 부터 전달받은 UI를 추가 하시겠습니까?`;

        //확인 팝업 호출.(YES / NO / CANCEL)
        var _param = await new Promise(function(resConfirm){
            parent.showMessage(sap, 40, "I", _msg, async function(params){
                return resConfirm(params);
            });
        });

        //확인 팝업에서 취소 처리를 한 경우.
        if(!_param || _param === "CANCEL"){

            _sRes.RETCD = "E";

            //$$MSG
            _sRes.RTMSG = "취소함";

            return _sRes;

        }

        
        parent.setBusy("X");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(true);


        //확인 팝업에서 YES를 선택 한 경우.
        if(_param === "YES"){
            
            var _sUndoHist = {
                ROOT : sParent.OBJID,
                PRCCD : "DEL",
                RAND : _randHist,
                HIST : sParent.zTREE
            };

            //UNDO 이력 추가.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("AI_INSERT", _sUndoHist);

            //부모 UI에서 선택한 aggregation에 해당하는 UI 제거 처리.
            sParent.zTREE = sParent.zTREE.filter( item => item.UIATK !== _sResAggr.sAggr.UIATK );
        }
        

    }

    
    //Aggregation 정보로부터 _s0014 및 _s0015 구조 구성
    var _s0015 = setRootEmbeddedAggregation(_s0014, _s0022, _sResAggr.sAggr);

    sAppData.T_0015.splice(0, 0, _s0015);


    let _sParams = {};


    //AI로 부터 전달받은 파라메터 정보.
    _sParams.LIBDATA = sAppData;


    //UI 추가 대상 OBJECT의 TREE 정보 얻기.
    _sParams.ROOT = sParent;

    
    // //ROOT UI 파라메터 변경 처리.
    // changeRootUIObject(_sParams);

    

    //현재 화면에 출력된 tree를 itab화.
    _sParams.aT_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);


    _sParams.aT_0015 = [];

    //현재 UI의 매핑된 ATTR 정보 수집 처리.
    for (let i = 0; i < _sParams.aT_0014.length; i++) {

        let _s0014 = _sParams.aT_0014[i];

        _sParams.aT_0015 = _sParams.aT_0015.concat(oAPP.attr.prev[_s0014.OBJID]._T_0015);
        
    }

    //14, 15 정보를 통한 UI 재구성 처리.
    await rebuildAppData(_sParams, _randHist);

    return _sRes;
    
}



/*********************************************************
 * @function - ROOT가 아닌 대상 UI에 AI와 통신을 통한 UI 생성 처리.
 ********************************************************/
async function createUiFromDrop(sAppData){

    
    var _sRes = JSON.parse(JSON.stringify(TY_RET));
    

    //라인 선택건 정보 얻기.
    var sParent = oAPP.fn.getTreeData(sAppData.OBJID);

    if(typeof sParent === "undefined"){

        _sRes.RETCD = "E";

        //$$MSG
        _sRes.RTMSG = "선택한 라인이 존재하지 않습니다.";

        return _sRes;

    }


    //AI로 부터 받은 데이터의 ROOT UI 정보 얻기.
    let _s0014 = sAppData.T_0014[0];

    //대상 UI 검색.
    let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === _s0014.UILIB );

    if(typeof _s0022 !== "undefined"){
        _s0014.UIOBK = _s0022.UIOBK;
    }   

    //대상 UI의 추가될 aggregation 정보 얻기.
    var _sResAggr = await getEmbeddedAggregation(_s0014, sParent);


    //AGGR 팝업에서 선택한 aggregation의 child가 존재하는지 확인.
    var _found = sParent.zTREE.findIndex( item  => item.UIATK === _sResAggr.sAggr.UIATK );

    
    
    let _randHist = oAPP.fn.getRandomKey();


    //선택한 AGGREGATION에 UI가 존재하는경우.
    if(_found !== -1){

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        //$$MSG
        var _msg = `${sParent.OBJID}의 ${_sResAggr.sAggr.UIATT} 영역에 UI가 존재 합니다.\n` + 
                `UI를 초기화 처리 후 AI로 부터 전달받은 UI 정보를 추가 하시겠습니까?`;

        //확인 팝업 호출.(YES / NO / CANCEL)
        var _param = await new Promise(function(resConfirm){
            parent.showMessage(sap, 40, "I", _msg, async function(params){
                return resConfirm(params);
            });
        });

        //확인 팝업에서 취소 처리를 한 경우.
        if(!_param || _param === "CANCEL"){

            _sRes.RETCD = "E";

            //$$MSG
            _sRes.RTMSG = "취소함";

            return _sRes;

        }

        
        parent.setBusy("X");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(true);


        //확인 팝업에서 YES를 선택 한 경우.
        if(_param === "YES"){
            
            var _sUndoHist = {
                ROOT : sParent.OBJID,
                PRCCD : "DEL",
                RAND : _randHist,
                HIST : sParent.zTREE
            };

            //UNDO 이력 추가.
            parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("AI_INSERT", _sUndoHist);

            //부모 UI에서 선택한 aggregation에 해당하는 UI 제거 처리.
            sParent.zTREE = sParent.zTREE.filter( item => item.UIATK !== _sResAggr.sAggr.UIATK );
        }
        

    }

    
    //Aggregation 정보로부터 _s0014 및 _s0015 구조 구성
    var _s0015 = setRootEmbeddedAggregation(_s0014, _s0022, _sResAggr.sAggr);

    sAppData.T_0015.splice(0, 0, _s0015);


    let _sParams = {};


    //AI로 부터 전달받은 파라메터 정보.
    _sParams.LIBDATA = sAppData;


    //UI 추가 대상 OBJECT의 TREE 정보 얻기.
    _sParams.ROOT = sParent;

    
    // //ROOT UI 파라메터 변경 처리.
    // changeRootUIObject(_sParams);

    

    //현재 화면에 출력된 tree를 itab화.
    _sParams.aT_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);


    _sParams.aT_0015 = [];

    //현재 UI의 매핑된 ATTR 정보 수집 처리.
    for (let i = 0; i < _sParams.aT_0014.length; i++) {

        let _s0014 = _sParams.aT_0014[i];

        _sParams.aT_0015 = _sParams.aT_0015.concat(oAPP.attr.prev[_s0014.OBJID]._T_0015);
        
    }


    //14, 15 정보를 통한 UI 재구성 처리.
    await rebuildAppData(_sParams, _randHist);

    return _sRes;


}