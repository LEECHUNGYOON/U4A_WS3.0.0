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

//디자인상세화면(20화면) <-> BIND POPUP 통신을 위한 broadcast Channel instance.
let oChannel = undefined;


//바인딩 팝업 디자인 영역의 ROOT OBJID 정보.
let DESIGN_ROOT_OBJID = "";


/*************************************************************
 * @function - 디자인상세화면(20화면) <-> BIND POPUP 통신을 위한 
 *          broadcast Channel생성.
 *************************************************************/
function createChannel() {
        
    oChannel = new BroadcastChannel(C_CHID);

    //MESSAGE 이벤트 구성.
    oChannel.onmessage = function(oEvent) {
                    
        console.log(oEvent.data);

        if(typeof oEvent?.data?.PRCCD === "undefined"){
            return;
        }

        switch (oEvent.data.PRCCD) {
            case "BUSY_ON":
                //바인딩 팝업 -> WS20의 busy on 응답을 받은 경우.
                responseBindPopupBusyOn(oEvent);
                break;

            case "BUSY_OFF":
                //바인딩 팝업 -> WS20의 busy off 응답을 받은 경우.
                responseBindPopupBusyOff(oEvent);
                break;

            case "UPDATE-DESIGN-DATA":
                //바인딩 팝업 -> WS20의 APP DATA 갱신 요청에 대한 처리.
                updateAppData(oEvent);
                break;

            case "ROOT_OBJID":
                //바인딩 팝업 -> WS20의 디자인 영역에 그려진 최상위 UI 정보 전송건에 대한 처리.
                updateRootObjectID(oEvent);
                break;

            case "DESIGN-TREE-SELECT-OBJID":
                //바인딩 팝업 -> WS20의 디자인 영역 UI선택 처리.
                responeSelectDesignTreeOBJID(oEvent);
                break;
        
            default:
                //정해지지 않은 프로세스 코드가 호출된 경우,
                //크리티컬 오류 메시지 처리 해야함.
                break;
        }

    };

}



/*************************************************************
 * @function - 디자인상세화면(20화면) => BIND POPUP에 데이터 전송 처리.
 *************************************************************/
sendPostMessage = function (oData) {

    //디자인상세화면(20화면) <=> BIND POPUP 통신을 위한 BROADCAST는
    //바인딩 팝업이 종료되기 전까지는 반드시 존재 해야함.
    //따라서 해당 INSTANCE가 없을경우 치명적 오류를 발생 처리함.
    if(typeof oChannel === "undefined" || oChannel === null){

        var _errMsg = 
            `ws10_20\\bindPopupHandler\\broadcastChannelBindPopup.js` +
            `\nWS20 => BIND POPUP 통신을 위한 채널 정보가 존재하지 않습니다.`;

        if(typeof oData?.PRCCD !== "undefined"){
            _errMsg += `\n처리 Process Code : ${oData.PRCCD}`;
        }

        throw(new Error(_errMsg));

    }

    try {
        oChannel.postMessage(oData);    

    } catch (error) {

        var _errMsg = 
            `ws10_20\\bindPopupHandler\\broadcastChannelBindPopup.js` +
            `\nWS20 => BIND POPUP oChannel.postMessage 오류`;

        if(typeof oData?.PRCCD !== "undefined"){
            _errMsg += `\n처리 Process Code : ${oData.PRCCD}`;
        }

        if(typeof error?.message !== "undefined"){
            _errMsg += `\n${error.message}`;
        }

        throw(new Error(_errMsg));
    }
    
}



/*************************************************************
 * @function - 디자인상세화면(20화면) 채널 종료 처리.
 *************************************************************/
function closeChannel(){

    if(typeof oChannel === "undefined" || oChannel === null){
        return;
    }

    //바인딩 팝업 디자인 영역의 ROOT OBJID 정보 초기화.
    DESIGN_ROOT_OBJID = "";

    //채널 종료 처리.
    oChannel.close();

    //채널 instance 초기화.
    oChannel = undefined;

}



/*************************************************************
 * @function - 디자인상세화면(20화면) 채널 생성됨 여부.
 *************************************************************/
function isCreateChannel(){
    
    //broadcast 채널이 생성되지 않은경우 생성되지 않음 flag return.
    if(typeof oChannel === "undefined" || oChannel === null){
        return false;
    }

    return true;
    
}



/************************************************************************
 * busy off 요청건에 대한 처리.
 ************************************************************************/
function responseBindPopupBusyOff(oEvent){

    //BUSY OFF 요청건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "BUSY_OFF"){
        return false;
    }

    //단축키도 같이 잠금 해제처리.
    oAPP.fn.setShortcutLock(false);

    var _sOption = undefined;

    if(typeof oEvent.data.OPTION !== "undefined"){
        _sOption = oEvent.data.OPTION;
    }

    //busy off.
    parent.setBusy("", _sOption);

    
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

    var _sOption = undefined;

    //BUSY DIALOG 처리용 파라메터가 존재하는경우.
    if(typeof oEvent.data.OPTION !== "undefined"){
        _sOption = JSON.parse(JSON.stringify(oEvent.data.OPTION));
    }

    //busy on.
    parent.setBusy("X", _sOption);


    //busy on 요청임 flag return.
    return true;

}


/************************************************************************
 * APP DATA 갱신 요청에 대한 처리.
 ************************************************************************/
async function updateAppData(oEvent){

    //APP DATA 갱신 요청건이 아닌경우 EXIT.
    if(oEvent.data.PRCCD !== "UPDATE-DESIGN-DATA"){
        return false;
    }

    // //BUSY ON
    // parent.setBusy("X");


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


        for (let i = 0, l = _oUi._T_0015.length; i < l; i++) {
            
            var _s0015 = _oUi._T_0015[i];

            //미리보기 화면 재 갱신 처리.
            oAPP.fn.previewUIsetProp(_s0015);
            
        }

    }


    //클라이언트이벤트, sap.ui.core.HTML 의 content 입력정보.
    oAPP.DATA.APPDATA.T_CEVT = oEvent.data.T_CEVT;


    //현재 선택한 UI정보.
    var _OBJID = oAPP.attr.oModel.oData.uiinfo.OBJID;

    //BIND POPUP으로 부터 받은 UI 정보중 현재 선택건이 포함되어 있다면.
    if(oEvent.data.T_0014.findIndex( item => item.OBJID === _OBJID ) !== -1){

        //선택한 UI의 TREE 라인 정보 얻기.
        var _sTree = oAPP.fn.getTreeData(_OBJID);

        if(typeof _sTree !== "undefined"){
            //UI design tree 라인 선택 이벤트 수행.
            await oAPP.fn.designTreeItemPress(_sTree);
        }

    }

    
    //BUSY OFF 요청 처리.
    sendBindPopupBusyOff();


    //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
    oAPP.fn.setChangeFlag();
    
    //BUSY DIALOG OFF  
    parent.setBusy("", {});


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

    //BUSY ON, LOCK ON
    oAPP.common.fnSetBusyLock("X");


    //최상위 UI정보 갱신 처리.
    DESIGN_ROOT_OBJID = oEvent.data.OBJID;
    
    //BUSY OFF, LOCK OFF
    oAPP.common.fnSetBusyLock("");


    //최상위 UI 갱신건 flag return.
    return true;

}


/************************************************************************
 * @function - 디자인 영역 UI선택 처리.
 ************************************************************************/
function responeSelectDesignTreeOBJID(oEvent){

    //디자인 영역 UI선택 처리 건이 아닌경우 exit.
    if(oEvent.data.PRCCD !== "DESIGN-TREE-SELECT-OBJID"){
        return false;
    }

    parent.setBusy("X");

    //전달받은 파라메터가 존재하지 않는경우 exit.
    if(typeof oEvent.data.OBJID === "undefined" || oEvent.data.OBJID === ""){
        parent.setBusy("");
        return true;
    }


    //tree item 선택 처리
    oAPP.fn.setSelectTreeItem(oEvent.data.OBJID);


    return true;

}



/*************************************************************
 * @function - 바인딩 팝업 데이터 전송전 라인값 점검.
 *************************************************************/
function checkBindPopupDragAppData(sTree){

    var _sRes = {RETCD: "", RTMSG:""};

    if(typeof sTree === "undefined"){

        //디자인 영역의 object ID 초기화.
        DESIGN_ROOT_OBJID = "";

        _sRes.RETCD = "E";
        
        //164	갱신 처리 대상 UI가 존재하지 않습니다.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "164");

        return _sRes;
    }


    //최상위 root가 인경우 점검 불필요.
    if(sTree.OBJID === "ROOT"){
        return _sRes;
    }

    
    var _UIATT = undefined;

    var _OBJID = sTree.OBJID;

    //sap.ui.table.Column인경우, CHILD에 TEMPLATE이 존재하는경우.
    if(sTree.UILIB === "sap.ui.table.Column" && sTree.zTREE.findIndex( item => item.UIATT === "template" ) !== -1){

        //부모(sap.ui.table.Table / sap.ui.table.TreeTable)로 변경.
        _OBJID = sTree.POBID;

        //점검 대상 aggr을 rows로 구성.
        _UIATT = "rows";

    }

    //현재 선택한 라인의 부모에 N건 바인딩 처리 됐는지 여부 확인.
    var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[_OBJID], _UIATT);

    //N건 바인딩 처리 된경우.
    if(typeof l_path !== "undefined" && l_path !== ""){

        _sRes.RETCD = "E";

        //163	부모 UI에 MODEL BINDING 처리되어 UI를 구성할 수 없습니다.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "163");

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
async function updateBindPopupDesignData(oData){

    parent.setBusy("X");

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);

    //바인딩 팝업 채널이 구성되지 않은경우 exit.
    //(바인딩 팝업이 호출되지 않은경우)
    if(isCreateChannel() === false){

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        //busy off.
        parent.setBusy("");

        return;
    }
    
    var _sParam = {
        PRCCD  : "UPDATE_DESIGN_DATA",
        RETCD  : "",
        RTMSG  : "",
        T_0014 : [],
        T_0015 : [],
        T_CEVT : []
    };


    //바인딩 팝업의 ROOT UI를 기준으로 APP DATA 구성 처리.
    var _sRes = setBindPopupDesignAppData();

    
    //바인딩 팝업의 ROOT UI를 기준으로 APP DATA 구성에 실패한 경우.
    if(_sRes.RETCD === "E"){

        _sParam.RETCD = _sRes.RETCD;
        _sParam.RTMSG = _sRes.RTMSG;

        //바인딩 팝업에 데이터 전송.
        sendPostMessage(_sParam);

        return;

    }


    //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
    var _sData = setBindPopupDragAppData(_sRes.S_TREE);

    _sParam.T_0014 = _sData.T_0014;
    _sParam.T_0015 = _sData.T_0015;
    _sParam.T_CEVT = _sData.T_CEVT;

    //바인딩 팝업에 데이터 전송.
    sendPostMessage(_sParam);

}



/*************************************************************
 * @function - 바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
 *************************************************************/
function setBindPopupDragAppData(sTree){

    var _aTree = JSON.parse(JSON.stringify([sTree]));

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
 * @function - 바인딩 팝업의 바인딩 추가속성 정보 오류건 처리.
 *************************************************************/
function sendAdditError(oData){

    var _sParam = {
        PRCCD   : "ERROR-ADDIT-DATA",
        T_ERMSG : oData
    };


    //바인딩 팝업에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @function - 바인딩 팝업의 디자인 영역 UI선택 처리.
 *************************************************************/
function selectDesignTreeOBJID(oData){

    //WS20 <-> 바인딩 팝업통신을 위한 BROADCAST 채널이 생성되지 않은경우EXIT
    //(바인딩 팝업을 호출하지 않은경우)
    if(isCreateChannel() === false){
        return;
    }

    var _sParam = {
        PRCCD   : "DESIGN-TREE-SELECT-OBJID",
        OBJID : oData
    };


    //바인딩 팝업에 데이터 전송.
    sendPostMessage(_sParam);

}



/*************************************************************
 * @function - 바인딩 팝업의 busy off 요청 처리.
 *************************************************************/
function sendBindPopupBusyOff(oData){

    //WS20 <-> 바인딩 팝업통신을 위한 BROADCAST 채널이 생성되지 않은경우EXIT
    //(바인딩 팝업을 호출하지 않은경우)
    if(isCreateChannel() === false){
        return;
    }

    var _sParam = {
        PRCCD   : "BUSY_OFF"
    };


    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @function - 바인딩 팝업의 busy on 요청 처리.
 *************************************************************/
function sendBindPopupBusyOn(oData){

    //WS20 <-> 바인딩 팝업통신을 위한 BROADCAST 채널이 생성되지 않은경우EXIT
    //(바인딩 팝업을 호출하지 않은경우)
    if(isCreateChannel() === false){
        return;
    }

    var _sParam = {
        PRCCD   : "BUSY_ON",
        OPTION  : undefined
    };

    //BUSY DIALOG 처리용 파라메터가 존재하는경우.
    if(typeof oData !== "undefined"){
        _sParam.OPTION = JSON.parse(JSON.stringify(oData));
    }


    //WS 3.0 디자인 영역에 데이터 전송.
    sendPostMessage(_sParam);

}


/*************************************************************
 * @module - 디자인상세화면(20화면) <-> BINDPOPUP 통신 처리 모듈.
 *************************************************************/
module.exports = function(PRCCD, oData){


    switch (PRCCD) {
        case "CHANNEL-CREATE":
            //채널 생성.
            createChannel(oData);
            break;

        case "SEND-APP-DATA":
            //BIND POPUP에 데이터 전송 처리.
            return sendPostMessage(oData);

        case "CHANNEL-CLOSE":
            //broadcast Channel 종료처리.
            closeChannel();
            break;

        case "GET-CHANNEL-ID":
            //채널 아이디 return.
            return C_CHID;

        case "IS-CHANNEL-CREATE":
            //채널 생성됨 여부 return.
            return isCreateChannel();

        case "UPDATE-DESIGN-DATA":
            //WS20 -> 바인딩 팝업 디자인 데이터 갱신 요청.
            updateBindPopupDesignData(oData);
            break;

        case "ERROR-ADDIT-DATA":
            //WS20 -> 바인딩 팝업의 바인딩 추가속성 정보 오류건 처리 요청.
            sendAdditError(oData);
            break;

        case "DESIGN-TREE-SELECT-OBJID":
            //WS20 -> 디자인 tree 영역 라인 선택 처리 요청.
            selectDesignTreeOBJID(oData);
            break;

        case "BUSY_OFF":
            //WS20 -> 바인딩 팝업에 busy off 요청 처리
            sendBindPopupBusyOff(oData);
            break;

        case "BUSY_ON":
            //WS20 -> 바인딩 팝업에 busy on 요청 처리
            sendBindPopupBusyOn(oData);
            break;

        default:
            break;
    }    

};