
const oFrame = document.getElementById('ws_frame');

const oAPP = oFrame.contentWindow.oAPP;

const T_XXX_FUNC = [
    'oAPP.fn',
    'oAPP.fn',
];

//처리결과 메시지 구조.
const TY_RET = {
    RETCD : "",
    RTMSG : "",
};


/*********************************************************
 * @module - 
 ********************************************************/
// module.exports = function(oEvent){
oAPP.oDesign.fn.testAI = function(oEvent, sROOT){

    return new Promise(async function(resolve){

        //입력 파라메터 점검 처리.
        let _sRes = checkLibData(oEvent);

        if(_sRes.RETCD === "E"){
            return resolve(_sRes);
        }


        let _sROOT = sROOT;

        //ROOT UI 파라메터 변경 처리.
        changeRootUIObject(_sROOT, oEvent.data.LIBDATA);


        //입력받은 ROOT UI의 EMBEDDED AGGREGATION 설정.
        await setRootEmbeddedAggregation(oEvent, _sROOT);

 
        //최상위 UI를 선택한 경우, 최상위를 제외한 나머지 UI 제거.
        if(_sROOT.OBJID === "ROOT" || _sROOT.OBJID === "APP"){
            
            _sROOT = oAPP.fn.getTreeData("APP");
            
            _sROOT.zTREE = [];
        
        }

        //현재 화면에 출력된 tree를 itab화.
        let _aT_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);

        
        let _aT_0015 = [];

        for (let i = 0; i < _aT_0014.length; i++) {

            let _s0014 = _aT_0014[i];

            _aT_0015 = _aT_0015.concat(oAPP.attr.prev[_s0014.OBJID]._T_0015);
            
        }


        for (let i = 0, l = oEvent.data.LIBDATA.T_0014.length; i < l; i++) {
            
            let _s0014 = oEvent.data.LIBDATA.T_0014[i];

            //Web Application ID
            _s0014.APPID = oAPP.attr.appInfo.APPID;

            //Guid Number
            _s0014.GUINR = oAPP.attr.appInfo.GUINR;

            //대상 UI 검색.
            let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === _s0014.UILIB );

            if(typeof _s0022 === "undefined"){
                continue;
            }

            if(_s0022.ISDEP === "X"){
                continue;
            }

            //이전 UI 정보.
            let _BEFORE_OBJID = _s0014.OBJID;


            //object id 다시 채번.
            let _OBJID = setOBJID(_BEFORE_OBJID, _aT_0014);

            _s0014.OBJID = _OBJID;


            let _aChild = oEvent.data.LIBDATA.T_0014.filter( item => item.POBID === _BEFORE_OBJID );

            for (let index = 0; index < _aChild.length; index++) {
                let _sChild = _aChild[index];

                _sChild.NEW_POBID = _OBJID;
                
            }


            let _a0015 = oEvent.data.LIBDATA.T_0015.filter( item => item.OBJID === _BEFORE_OBJID );

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


            _aT_0014.push(_s0014);
            
        }


        for (let i = 0, l = oEvent.data.LIBDATA.T_0014.length; i < l; i++) {

            let _s0014 = oEvent.data.LIBDATA.T_0014[i];

            if(typeof _s0014.NEW_POBID !== "undefined"){
                _s0014.POBID = _s0014.NEW_POBID;
            }

            delete _s0014.NEW_POBID;

            //부모 UI OBJECT KEY가 없는경우 최상위.
            //호출처에서 만들어진 UI
            if(_s0014.POBID === ""){
                _s0014.POBID = _sROOT.OBJID;
                _s0014.PUIOK = _sROOT.UIOBK;

                continue;
            }

            
            //부모 instance 검색.
            let _sParent = _aT_0014.find( item => item.OBJID === _s0014.POBID );

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


        for (let i = 0, l = oEvent.data.LIBDATA.T_0015.length; i < l; i++) {

            let _s0015 = oEvent.data.LIBDATA.T_0015[i];

            if(typeof _s0015.NEW_OBJID !== "undefined"){
                _s0015.OBJID = _s0015.NEW_OBJID;
            }

            delete _s0015.NEW_OBJID;

            //Web Application ID
            _s0015.APPID = oAPP.attr.appInfo.APPID;

            //Guid Number
            _s0015.GUINR = oAPP.attr.appInfo.GUINR;


            //대상 UI 검색.
            let _s0014 = _aT_0014.find( item => item.OBJID === _s0015.OBJID );

            if(typeof _s0014 === "undefined"){
                continue;
            }

            let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.UIOBK === _s0014.UIOBK );

            if(typeof _s0022 === "undefined"){
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

            _aT_0015.push(_s0015);

        }


        oAPP.attr.oModel.oData.TREE = _aT_0014;

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

        oAPP.DATA.APPDATA.T_0015 = [];

        oAPP.DATA.APPDATA.T_0015 = _aT_0015;


        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();


        oAPP.attr.prev = {};

        //미리보기 화면 구성.
        await oAPP.attr.ui.frame.contentWindow.drawPreview();

        return resolve(_sRes);

    });

};



/*********************************************************
 * @function - 전달받은 라이브러리 정보 점검.
 ********************************************************/
function checkLibData(oEvent){

    let _sRet = JSON.parse(JSON.stringify(TY_RET));
    
    if(typeof oEvent?.data?.LIBDATA === "undefined"){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "라이브러리 파라메터가 존재하지 않습니다.";

        return;
    }


    if(oEvent?.data?.LIBDATA === null){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "라이브러리 파라메터가 존재하지 않습니다.";

        return;
    }


    if(oEvent?.data?.LIBDATA?.RETCD === "E"){
        _sRet.RETCD = oEvent.data.LIBDATA.RETCD;

        _sRet.RTMSG = oEvent.data.LIBDATA.RTMSG;

        return;
    }


    if(typeof oEvent?.data?.LIBDATA?.T_0014 === "undefined"){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return;
    }


    if(Array.isArray(oEvent?.data?.LIBDATA?.T_0014) !== true){

        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return;
    }


    if(oEvent?.data?.LIBDATA?.T_0014.length === 0){
        _sRet.RETCD = "E";

        //$$MSG
        _sRet.RTMSG = "UI 정보가 존재하지 않습니다.";

        return;
    }


    //전달받은 ROOT UI 점검.
    _sRet = checkRootUIObject(oEvent);


    return _sRet;
    

}



/*********************************************************
 * @function - 전달받은 ROOT UI 점검.
 ********************************************************/
function checkRootUIObject(oEvent){

    let _sRet = JSON.parse(JSON.stringify(TY_RET));


    let _s0014 = oEvent.data.LIBDATA.T_0014[0];

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
function changeRootUIObject(sRoot, sLIBDATA){

    let _s0014 = sLIBDATA.T_0014[0];

    //전달받은 UI정보의 root가 sap.m.App가 아닌경우 exit.
    if(_s0014.UILIB !== "sap.m.App"){
        return;
    }

    //선택한 UI가 ROOT, APP가 아닌경우 EXIT.
    if(sRoot.OBJID !== "ROOT" && sRoot.OBJID !== "APP"){
        return;
    }


    //전달받은 UI의 root가 sap.m.App 이면서,
    //추가 대상 위치의UI가 최상위 위치인경우 하위 로직 수행.

    
    //전달받은 ROOT UI의 ATTRIBUTE 제외 처리.
    sLIBDATA.T_0015 = sLIBDATA.T_0015.filter( item => item.OBJID !== _s0014.OBJID );
    
    //현재 APPLICATION 최상위 APP의 attribute로 변경.
    sLIBDATA.T_0015 = sLIBDATA.T_0015.concat(JSON.parse(JSON.stringify(oAPP.attr.prev.APP._T_0015)));

    
    //최상위 APP 정보를 얻기.
    let _sAPP = oAPP.fn.getTreeData("APP");

    
    //root UI의 child 정보 얻기.
    let _aChild = sLIBDATA.T_0014.filter( item => item.POBID === _s0014.OBJID );
    
    for (let i = 0, l = _aChild.length; i < l; i++) {

        let _sChild = _aChild[i];

        //현재 APPLICATION의 OBJECT ID를 PARENT로 지정.
        _sChild.POBID = _sAPP.OBJID;
        
    }

    sLIBDATA.T_0014.splice(0, 1);


    // //현재 APPLICATION의 최상위 APP로 대체 처리.
    // _s0014.APPID   = _sAPP.APPID;
    // _s0014.GUINR   = _sAPP.GUINR;
    // _s0014.OBJID   = _sAPP.OBJID;
    // _s0014.POSIT   = _sAPP.POSIT;
    // _s0014.POBID   = _sAPP.POBID;
    // _s0014.UIOBK   = _sAPP.UIOBK;
    // _s0014.PUIOK   = _sAPP.PUIOK;
    // _s0014.ISAGR   = _sAPP.ISAGR;
    // _s0014.AGRID   = _sAPP.AGRID;
    // _s0014.ISDFT   = _sAPP.ISDFT;
    // _s0014.OBDEC   = _sAPP.OBDEC;
    // _s0014.AGTYP   = _sAPP.AGTYP;
    // _s0014.UIATK   = _sAPP.UIATK;
    // _s0014.UIATT   = _sAPP.UIATT;
    // _s0014.UIASN   = _sAPP.UIASN;
    // _s0014.UIATY   = _sAPP.UIATY;
    // _s0014.UIADT   = _sAPP.UIADT;
    // _s0014.UIADS   = _sAPP.UIADS;
    // _s0014.VALKY   = _sAPP.VALKY;
    // _s0014.ISLST   = _sAPP.ISLST;
    // _s0014.ISMLB   = _sAPP.ISMLB;
    // _s0014.TOOLB   = _sAPP.TOOLB;
    // _s0014.UIFND   = _sAPP.UIFND;
    // _s0014.PUIATK  = _sAPP.PUIATK;
    // _s0014.UILIB   = _sAPP.UILIB;
    // _s0014.ISEXT   = _sAPP.ISEXT;
    // _s0014.TGLIB   = _sAPP.TGLIB;
    // _s0014.DEL_UOK = _sAPP.DEL_UOK;
    // _s0014.DEL_POK = _sAPP.DEL_POK;
    // _s0014.ISECP   = _sAPP.ISECP;
    
}



function setUIObjectLineData(sLIBDATA, sParent, s0014){


    //Web Application ID
    s0014.APPID = oAPP.attr.appInfo.APPID;

    //Guid Number
    s0014.GUINR = oAPP.attr.appInfo.GUINR;

    //대상 UI 검색.
    let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === s0014.UILIB );

    if(typeof _s0022 === "undefined"){
        return;
    }

    if(_s0022.ISDEP === "X"){
        return;
    }


    //현재 UI의 UI OBJECT KEY 매핑.(UO00249)
    s0014.UIOBK = _s0022.UIOBK;

    //UI Object Find Value(SAP.M.BUTTON)
    s0014.UIFND = _s0022.UIFND;

    //Is Extension?(Yes : X)
    s0014.ISEXT = _s0022.ISEXT;

    //Target UI Object Library(sap.m)
    s0014.TGLIB = _s0022.TGLIB;

    //Is Exception UI?(Yes : X )
    s0014.ISECP = _s0022.ISECP;
    

    let _OBJID = s0014.OBJID.replace(/\d/g,"");

    //현재 UI의 OBJID 재 매핑.
    _OBJID = oAPP.fn.setOBJID(_OBJID);


    //바인딩 처리 필드 생성.
    oAPP.fn.crtTreeBindField(s0014);
    

    //UI의 ATTRIBUTE 정보 구성.
    setUIAttributeData(s0014, _OBJID);


    let _BEFORE_OBJID = s0014.OBJID;

    s0014.OBJID = _OBJID;

    //부모 정보에 현재 복사처리한 UI 수집처리.
    sParent.zTREE.push(s0014);


    //CHILD UI 정보 발췌.
    let _aChild = sLIBDATA.T_0014.filter( item => item.POBID === _BEFORE_OBJID );

    
    if(_aChild.length === 0){
        return;
    }

    for (let i = 0, l = _aChild.length; i < l; i++) {
        
        let _sChild = _aChild[i];

        setUIObjectLineData(sLIBDATA, s0014, _sChild);

        
    }

}



function setUIAttributeData(s0014, OBJID){

    let _aT_0015 = sLIBDATA.T_0015.filter( item => item.OBJID === s0014.OBJID );

    if(_aT_0015.length === 0){
        return;
    }

    for (let i = 0, l = _aT_0015.length; i < l; i++) {

        let _s0015 = _aT_0015[i];

        //Web Application ID
        _s0015.APPID = oAPP.attr.appInfo.APPID;

        //Guid Number
        _s0015.GUINR = oAPP.attr.appInfo.GUINR;


        _s0015.OBJID = oAPP.attr.appInfo.OBJID;


        let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.UIOBK === s0014.UIOBK );

        if(typeof _s0022 === "undefined"){
            continue;
        }


        //DEFAULT 현재 UI의 UI OBJECT KEY.
        let _UIOBK = s0014.UIOBK;

        //DEFAULT 현재 ATTRIBUTE의 TYPE.
        let _UIATY = s0014.UIATY;

        //embedded Aggregation인경우.
        if(_UIATY === "6"){

            //부모 UI의 UI OBJECT KEY.
            _UIOBK = s0014.PUIOK;

            //부모 UI의 aggregation 검색을 위한 type 변경.
            _UIATY = s0014.UIATY;
        }


        let _s0023 = oAPP.DATA.LIB.T_0023.find( item => 
            item.UIOBK === _UIOBK &&
            item.UIATT === _s0015.UIATT &&
            item.UIATY === _UIATY
        );

        if(typeof _s0023 === "undefined"){
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

    }

}



/*********************************************************
 * @function - 생성한 UI명 채번
 ********************************************************/
function setOBJID(objid, aT_0014){

    let _cnt = 1;
    var _upper = objid.toUpperCase();

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
 * @function - 입력받은 ROOT UI의 EMBEDDED AGGREGATION 설정.
 ********************************************************/
function setRootEmbeddedAggregation(oEvent, sROOT){

    return new Promise(async function(resolve){

        if(oEvent.data.LIBDATA.ACTCD !== "02"){
            return resolve();
        }

        //UI 추가 팝업 정보가 존재하지 않는다면 JS 호출 후 팝업 호출.
        await new Promise(function(resJSLoad){

            oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
                resJSLoad();
            });

        });

        let _s0014 = oEvent.data.LIBDATA.T_0014[0];

        //대상 UI 검색.
        let _s0022 = oAPP.DATA.LIB.T_0022.find( item => item.LIBNM === _s0014.UILIB );

        if(typeof _s0022 !== "undefined"){
            _s0014.UIOBK = _s0022.UIOBK;
        }        

        let _sResAggr = await new Promise(function(resSelAggr){

            //aggregation 선택 팝업 호출.
            oAPP.fn.aggrSelectPopup(_s0014, sROOT, function(sAggr, sChild, sParent){
                
                parent.setBusy("X");

                let _sRes = {};

                _sRes.sAggr   = sAggr;
                _sRes.sChild  = sChild;
                _sRes.sParent = sParent;
                
                resSelAggr(_sRes);

            });

        });

        
        //UI Attribute Internal Key
        _s0014.UIATK  = _sResAggr.sAggr.UIATK;

        //UI Attribute ID.
        _s0014.UIATT  = _sResAggr.sAggr.UIATT;

        //UI Attribute ID (Upper Case Short)
        _s0014.UIASN  = _sResAggr.sAggr.UIASN;

        //UI Attribute Type
        _s0014.UIATY  = _sResAggr.sAggr.UIATY;

        //UI Object Property Data Type (Real)
        _s0014.UIADT  = _sResAggr.sAggr.UIADT;

        //UI Object Property Data Type (SAP Internal)
        _s0014.UIADS  = _sResAggr.sAggr.UIADS;

        //UI Object Property Value Key
        _s0014.VALKY  = _sResAggr.sAggr.VALKY;

        //Is List Box Support? (Yes : X)
        _s0014.ISLST  = _sResAggr.sAggr.ISLST;

        //Is Multie Value Bind? (Yes : X)
        _s0014.ISMLB  = _sResAggr.sAggr.ISMLB;

        //UI Attribute Internal Key
        _s0014.PUIATK = _sResAggr.sAggr.UIATK;


        let _s0015 = oAPP.fn.crtStru0015();

        _s0015.OBJID = _s0014.OBJID;

        _s0015.UIATK = _sResAggr.sAggr.UIATK;
        _s0015.UIATT = _sResAggr.sAggr.UIATT;
        _s0015.UIASN = _sResAggr.sAggr.UIASN;
        _s0015.UIATY = "6";
        _s0015.UIADT = _sResAggr.sAggr.UIADT;
        _s0015.UIADS = _sResAggr.sAggr.UIADS;
        _s0015.ISMLB = _sResAggr.sAggr.ISMLB;
        
        oEvent.data.LIBDATA.T_0015.splice(0, 0, _s0015);
        
        resolve();

    });

}