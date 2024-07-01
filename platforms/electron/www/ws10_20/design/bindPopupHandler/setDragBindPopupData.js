
//WS 3.0 메인 프레임.
const oWS_FRAME = document.getElementById('ws_frame').contentWindow;


//oAPP 정보 광역화.
const oAPP = oWS_FRAME.oAPP;


/*************************************************************
 * @module - 바인딩 팝업에 전송할 DRAG 데이터 구성.
 *************************************************************/
module.exports = function(is_drag){
    
    var _sParam = {
        RETCD      : "", 
        RTMSG      : "",
        
        //다른 세션에 D&D 처리 방지용 랜덤키.
        DnDRandKey : oAPP.attr.DnDRandKey, 
        T_0014     : [], 
        T_0015     : [], 
        T_CEVT     : []
    };
      
      
    //바인딩 팝업 전송전 drag 라인 점검.
    var _sRes = checkBindPopupDragAppData(is_drag);

    //DRAG 라인 점검 오류건이 존재하는경우.
    if(_sRes.RETCD === "E"){

        //오류코드, 오류 메시지 매핑.
        _sParam.RETCD = _sRes.RETCD;
        _sParam.RETCD = _sRes.RTMSG;

        //바인딩 팝업에 전송할 데이터 구성.(WS20 -> 바인딩 팝업)
        oWS_FRAME.event.dataTransfer.setData("prc002", JSON.stringify(_sRes));

        return;

    }

    //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
    var _sData = setBindPopupDragAppData(is_drag);

    _sParam.T_0014  = _sData.T_0014;
    _sParam.T_0015  = _sData.T_0015;
    _sParam.T_CEVT  = _sData.T_CEVT;

    //바인딩 팝업에 전송할 데이터 구성.(WS20 -> 바인딩 팝업)
    oWS_FRAME.event.dataTransfer.setData("prc002", JSON.stringify(_sParam));


};


/*************************************************************
 * @function - 바인딩 팝업 전송전 drag 라인 점검.
 *************************************************************/
function checkBindPopupDragAppData(is_drag){

    var _sRes = {RETCD: "", RTMSG:""};

    if(typeof is_drag === "undefined"){
        _sRes.RETCD = "E";

        //099	Drag 정보가 존재하지 않습니다.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "097");

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

        //163	부모 UI에 MODEL BINDING 처리되어 UI를 구성할 수 없습니다.
        _sRes.RTMSG = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "163");
        

        return _sRes;

    }

    return _sRes;      

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