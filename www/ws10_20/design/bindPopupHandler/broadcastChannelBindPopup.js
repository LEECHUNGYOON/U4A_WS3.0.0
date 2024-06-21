const
    REMOTE = parent.REMOTE,

    //WS 3.0메인 윈도우 객체.
    CURRWIN = REMOTE.getCurrentWindow();


//디자인상세화면(20화면) <-> BINDPOPUP 통신 채널 키 정보 구성.
//(브라우저창의 세션키 + 디자인상세화면(20화면) + bindpopup)
const C_CHID = `${CURRWIN.webContents.getWebPreferences().browserkey}_ws20_bindpop`;


//WS 3.0 메인 프레임.
const oWS_FRAME = document.getElementById('ws_frame').contentWindow;


//oAPP 정보 광역화.
const oAPP = oWS_FRAME.oAPP;


//바인딩 팝업 디자인 영역의 ROOT OBJID 정보.
let DESIGN_ROOT_OBJID = "";

/*************************************************************
 * @class - 디자인상세화면(20화면) <-> BINDPOPUP 통신을 위한 CLASS.
 *************************************************************/
class CL_WS20_BINDPOPUP{

    static oChannel = undefined;

    //디자인상세화면(20화면) <-> BIND POPUP 통신을 위한 broadcast Channel생성.
    static createChannel = function () {

        //디자인상세화면(20화면) 조회 모드 인경우 채널 생성하지 않음.
        if(oAPP.attr.appInfo.IS_EDIT === ""){
            return;
        }

        console.log("WS20 -> 바인딩 팝업 채널 생성");
        
        this.oChannel = new BroadcastChannel(C_CHID);

        //MESSAGE 이벤트 구성.
        this.oChannel.onmessage = function(oEvent) {
            
            //바인딩 팝업 Broadcast Channel 응답 처리.
            resBroadcastChannelBindPopup(oEvent);

        };

    };


    //BIND POPUP에 데이터 전송 처리.
    static sendPostMessage = function (oData) {

        var _sRes = {RETCD:"", RTMSG:""};

        if(typeof this.oChannel === "undefined"){

            _sRes.RETCD = "E";
            _sRes.RTMSG = "";
            return _sRes;
        }

        this.oChannel.postMessage(oData);

        return _sRes;
        
    };


    //채널 종료 처리.
    static closeChannel = function(){

        if(typeof this.oChannel === "undefined"){
            return;
        }

        //채널 종료 처리.
        this.oChannel.close();
        console.log("채널 종료함.");

        //채널 instance 초기화.
        this.oChannel = undefined;

    };


    //채널 생성됨 여부.
    static isCreateChannel = function(){
        
        if(typeof this.oChannel === "undefined"){
            return false;
        }

        return true;
        
    };


};



/************************************************************************
 * 바인딩 팝업 Broadcast Channel 응답 처리.
 ************************************************************************/
function resBroadcastChannelBindPopup(oEvent){
        
    console.log(oEvent.data);

    if(typeof oEvent?.data?.PRCCD === "undefined"){
        return;
    }

    //busy off 응답을 받은 경우.
    if(responseBindPopupBusyOff(oEvent) === true){
        return;
    }


    //busy on 응답을 받은 경우.
    if(responseBindPopupBusyOn(oEvent) === true){
        return;
    }

    //APP DATA 갱신 요청에 대한 처리.
    if(updateAppData(oEvent) === true){
        return;
    }


    //바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 전송건에 대한 처리.
    if(updateRootObjectID(oEvent) === true){
        return;
    }


}


/************************************************************************
 * busy off 요청건에 대한 처리.
 ************************************************************************/
function responseBindPopupBusyOff(oEvent){

    //BUSY OFF 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "BUSY_OFF"){
        return false;
    }


    //busy off.
    oAPP.fn.setBusy(false);

    
    //busy off 요청임 flag return.
    return true;

}


/************************************************************************
 * busy on 요청건에 대한 처리.
 ************************************************************************/
function responseBindPopupBusyOn(oEvent){

    //BUSY ON 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "BUSY_ON"){
        return false;
    }


    //busy on.
    oAPP.fn.setBusy(true);


    //busy on 요청임 flag return.
    return true;

}


/************************************************************************
 * APP DATA 갱신 요청에 대한 처리.
 ************************************************************************/
function updateAppData(oEvent){

    //APP DATA 갱신 요청건이 아닌경우 EXIT.
    if(oEvent.data.PRCCD !== "DATA_SYNC"){
        return false;
    }

    //BUSY ON, LOCK ON
    oAPP.common.fnSetBusyLock("X");

    for (const key in oEvent.data.oPrev) {

        //미리 보기 ui 정보.
        var _oUi         = oAPP.attr.prev[key];

        var _sParam      = oEvent.data.oPrev[key];


        //attr 정보 갱신.
        _oUi._T_0015     = _sParam._T_0015;

        //모델 정보 갱신.
        _oUi._MODEL      = _sParam._MODEL;

        //N건 바인딩된 UI 정보 초기화.
        _oUi._BIND_AGGR  = [];


        //바인딩 팝업에 전달받은 N건 바인딩된 UI정보로 갱신 처리.
        for (var aggr in _sParam._BIND_AGGR) {

            var _aList = _sParam._BIND_AGGR[aggr];

            for (let i = 0, l =_aList.length; i < l; i++) {
                
                var _list = _aList[i];

                _oUi._BIND_AGGR.push(oAPP.attr.prev[_list]);
                
            }
            
        }                    

    }


    //클라이언트이벤트, sap.ui.core.HTML 의 content 입력정보.
    oAPP.DATA.APPDATA.T_CEVT = oEvent.data.T_CEVT;


    //현재 선택한 UI정보.
    var _OBJID = oAPP.attr.oModel.oData.uiinfo.OBJID;

    //BIND POPUP으로 부터 받은 UI 정보중 현재 선택건이 포함되어 있다면.
    if(oEvent.data.T_0014.findIndex( item => item.OBJID === _OBJID ) !== -1){
        //tree item 선택 처리.
        oAPP.fn.setSelectTreeItem(oAPP.attr.oModel.oData.uiinfo.OBJID);
    }


    //BUSY OFF 요청 처리.
    oEvent.currentTarget.postMessage({PRCCD:"BUSY_OFF"});


    //BUSY OFF, LOCK OFF
    oAPP.common.fnSetBusyLock("");

    return true;

}

/*************************************************************
 * @function - 바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 갱신.
 *************************************************************/
function updateRootObjectID(oEvent){
    
    //바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "ROOT_OBJID"){
        return false;
    }


    //최상위 UI정보 갱신 처리.
    DESIGN_ROOT_OBJID = oEvent.data.OBJID;
    console.log(DESIGN_ROOT_OBJID);


    //최상위 UI 갱신건 flag return.
    return true;

}



/*************************************************************
 * @function - 바인딩 팝업 데이터 전송전 라인값 점검.
 *************************************************************/
function checkBindPopupDragAppData(is_drag){

    var _sRes = {RETCD: "", RTMSG:""};

    if(typeof is_drag === "undefined"){
        _sRes.RETCD = "E";
        _sRes.RTMSG = "갱신 처리 대상 UI가 존재하지 않습니다."; //$$MSG
        return _sRes;
    }


    //최상위 root가 인경우 점검 불필요.
    if(is_drag.OBJID === "ROOT"){
        return _sRes;
    }

    
    var _UIATT = undefined;

    var _OBJID = is_drag.OBJID;

    //sap.ui.table.Column인경우, CHILD에 TEMPLATE이 존재하는경우.
    if(is_drag.UILIB === "sap.ui.table.Column" && is_drag.zTREE.findIndex( item => item.UIATT === "template" ) !== -1){

        //부모(sap.ui.table.Table / sap.ui.table.TreeTable)로 변경.
        _OBJID = is_drag.POBID;

        //점검 대상 aggr을 rows로 구성.
        _UIATT = "rows";

    }

    //현재 선택한 라인의 부모에 N건 바인딩 처리 됐는지 여부 확인.
    var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[_OBJID], _UIATT);

    //N건 바인딩 처리 된경우.
    if(typeof l_path !== "undefined" && l_path !== ""){

        _sRes.RETCD = "E";
        _sRes.RTMSG = "부모 UI에 MODEL BINDING 처리되어 UI를 구성할 수 없습니다."; //$$MSG

        return _sRes;

    }

    return _sRes;      

}



/*************************************************************
 * @function - 바인딩 팝업의 ROOT UI를 기준으로 APP DATA 구성 처리.
 *************************************************************/
function setBindPopupDesignAppData(){

    var _sData = {RETCD: "", RTMSG: "", S_TREE:{}};


    //바인딩 팝업의 design 출력 정보가 존재하지 않는경우.
    if(DESIGN_ROOT_OBJID === ""){
        _sData.RETCD = "E";
        return _sData;
    }


    //UI OBJECT ID를 변경한경우 바인딩 팝업에 출력된 UI가 변경 대상건인경우.
    if(oAPP.attr.oModel.oData.uiinfo.OBJID_bf === DESIGN_ROOT_OBJID){
        //바인딩 팝업에 출력된 UI를 변경처리.
        DESIGN_ROOT_OBJID = oAPP.attr.oModel.oData.uiinfo.OBJID;
    }


    //디자인상세화면(20화면) treed에서 root에 해당하는 라인 정보 얻기.
    var _sTree = oAPP.fn.getTreeData(DESIGN_ROOT_OBJID);

    
    //바인딩 팝업 데이터 전송전 라인값 점검.
    var _sRes = checkBindPopupDragAppData(_sTree);

    //점검 오류가 존재하는경우.
    if(_sRes.RETCD === "E"){

        _sData.RETCD = _sRes.RETCD;
        _sData.RTMSG = _sRes.RTMSG;
        return _sData;
    }

    
    //ROOT 라인 정보 매핑.
    _sData.S_TREE = JSON.parse(JSON.stringify(_sTree));


    return _sData;

}


/*************************************************************
 * @function - 바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
 *************************************************************/
function updateBindPopupDesignData(oData){

    //바인딩 팝업 채널이 구성되지 않은경우 exit.
    //(바인딩 팝업이 호출되지 않은경우)
    if(CL_WS20_BINDPOPUP.isCreateChannel() === false){
        return;
    }

    
    var _sParam = {
        PRCCD  : "UPDATE_DESIGN_DATA",
        T_0014 : [],
        T_0015 : [],
        T_CEVT : []
    };


    //바인딩 팝업의 ROOT UI를 기준으로 APP DATA 구성 처리.
    var _sRes = setBindPopupDesignAppData();

    
    //바인딩 팝업의 ROOT UI를 기준으로 APP DATA 구성에 실패한 경우.
    if(_sRes.RETCD === "E"){
        
        //바인딩 팝업에 데이터 전송.
        CL_WS20_BINDPOPUP.sendPostMessage(_sParam);

        return;

    }


    //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
    var _sData = setBindPopupDragAppData(_sRes.S_TREE);

    _sParam.T_0014 = _sData.T_0014;
    _sParam.T_0015 = _sData.T_0015;
    _sParam.T_CEVT = _sData.T_CEVT;

    //바인딩 팝업에 데이터 전송.
    CL_WS20_BINDPOPUP.sendPostMessage(_sParam);


}



/*************************************************************
 * @function - 바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
 *************************************************************/
function setBindPopupDragAppData(is_drag){

    var _aTree = JSON.parse(JSON.stringify([is_drag]));

    oAPP.attr.POSIT = 0;

    //UI POSTION 정보 재매핑 처리.
    oAPP.fn.setUIPOSIT(_aTree);

    oAPP.attr.POSIT = 0;

    //선택한 라인을 기준으로 tree -> table화.
    var _aTree = oAPP.fn.parseTree2Tab(_aTree);

    
    //POSITION 으로 정렬처리.
    _aTree.sort(function(a,b){
      return a.POSIT - b.POSIT;
    });

    var _sRes = {
      T_0014 : [],
      T_0015 : [],
      T_CEVT : [],
    };

    for (let i = 0, l = _aTree.length; i < l; i++) {
      
      var _sTree = _aTree[i];

      var _s0014 = oAPP.fn.crtStru0014();

      _s0014.APPID   = _sTree.APPID;
      _s0014.GUINR   = _sTree.GUINR;
      _s0014.OBJID   = _sTree.OBJID;
      _s0014.POSIT   = _sTree.POSIT;
      _s0014.POBID   = _sTree.POBID;
      _s0014.UIOBK   = _sTree.UIOBK;
      _s0014.PUIOK   = _sTree.PUIOK;
      _s0014.ISAGR   = _sTree.ISAGR;
      _s0014.AGRID   = _sTree.AGRID;
      _s0014.ISDFT   = _sTree.ISDFT;
      _s0014.OBDEC   = _sTree.OBDEC;
      _s0014.AGTYP   = _sTree.AGTYP;
      _s0014.UIATK   = _sTree.UIATK;
      _s0014.UIATT   = _sTree.UIATT;
      _s0014.UIASN   = _sTree.UIASN;
      _s0014.UIATY   = _sTree.UIATY;
      _s0014.UIADT   = _sTree.UIADT;
      _s0014.UIADS   = _sTree.UIADS;
      _s0014.VALKY   = _sTree.VALKY;
      _s0014.ISLST   = _sTree.ISLST;
      _s0014.ISMLB   = _sTree.ISMLB;
      _s0014.TOOLB   = _sTree.TOOLB;
      _s0014.UIFND   = _sTree.UIFND;
      _s0014.PUIATK  = _sTree.PUIATK;
      _s0014.UILIB   = _sTree.UILIB;
      _s0014.ISEXT   = _sTree.ISEXT;
      _s0014.TGLIB   = _sTree.TGLIB;
      _s0014.DEL_UOK = _sTree.DEL_UOK;
      _s0014.DEL_POK = _sTree.DEL_POK;
      _s0014.ISECP   = _sTree.ISECP;

      _sRes.T_0014.push(_s0014);


      var _aT0015 = oAPP.attr.prev[_s0014.OBJID]._T_0015;

      for (let j = 0, jl = _aT0015.length; j < jl; j++) {
        
        var _s0015t = _aT0015[j];

        //ZSU4A0015 구조 생성.
        var _s0015 = oAPP.fn.crtStru0015();

        _s0015.APPID    = _s0015t.APPID;
        _s0015.GUINR    = _s0015t.GUINR;
        _s0015.OBJID    = _s0015t.OBJID;
        _s0015.UIATK    = _s0015t.UIATK;
        _s0015.UIATV    = _s0015t.UIATV;
        _s0015.ISBND    = _s0015t.ISBND;
        _s0015.UILIK    = _s0015t.UILIK;
        _s0015.UIOBK    = _s0015t.UIOBK;
        _s0015.UIATT    = _s0015t.UIATT;
        _s0015.UIASN    = _s0015t.UIASN;
        _s0015.UIADT    = _s0015t.UIADT;
        _s0015.RVALU    = _s0015t.RVALU;
        _s0015.BPATH    = _s0015t.BPATH;
        _s0015.ADDSC    = _s0015t.ADDSC;
        _s0015.UIATY    = _s0015t.UIATY;
        _s0015.ISMLB    = _s0015t.ISMLB;
        _s0015.ISEMB    = _s0015t.ISEMB;
        _s0015.DEL_LIB  = _s0015t.DEL_LIB;
        _s0015.DEL_UOK  = _s0015t.DEL_UOK;
        _s0015.DEL_ATT  = _s0015t.DEL_ATT;
        _s0015.ISWIT    = _s0015t.ISWIT;
        _s0015.ISSPACE  = _s0015t.ISSPACE;
        _s0015.FTYPE    = _s0015t.FTYPE;
        _s0015.REFFD    = _s0015t.REFFD;
        _s0015.CONVR    = _s0015t.CONVR;
        _s0015.MPROP    = _s0015t.MPROP;

        _sRes.T_0015.push(_s0015);
        
      }

    }

    //클라이언트 이벤트(HTML CONTENT) 정보 매핑.
    _sRes.T_CEVT = JSON.parse(JSON.stringify(oAPP.DATA.APPDATA.T_CEVT));

    return _sRes;

}




/*************************************************************
 * @module - 디자인상세화면(20화면) <-> BINDPOPUP 통신 처리 모듈.
 *************************************************************/
module.exports = function(ACTCD, oData){

    switch (ACTCD) {
        case "CHANNEL-CREATE":
            //채널 생성.
            CL_WS20_BINDPOPUP.createChannel(oData);
            break;

        case "SEND-APP-DATA":
            //BIND POPUP에 데이터 전송 처리.
            return CL_WS20_BINDPOPUP.sendPostMessage(oData);

        case "CHANNEL-CLOSE":
            //broadcast Channel 종료처리.
            CL_WS20_BINDPOPUP.closeChannel();
            break;

        case "GET-CHANNEL-ID":
            //채널 아이디 return.
            return C_CHID;

        case "IS-CHANNEL-CREATE":
            //채널 생성됨 여부 return.
            return CL_WS20_BINDPOPUP.isCreateChannel();

        case "UPDATE-DESIGN-DATA":
            //바인딩 팝업 디자인 데이터 갱신.
            updateBindPopupDesignData(oData);
            break;

        default:
            break;
    }    

};







