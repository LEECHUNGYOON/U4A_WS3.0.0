/*************************************************************
 * @module - 바인딩 팝업에서 구성한 바인딩정보(T_0014, T_0015 정보)
 *           호출처에 전달.
 *************************************************************/
module.exports = function(is_attr){
    
    var _sData = {};

    //디자인 트리 전송 data(T_0014) 구성.
    _sData.T_0014 = set0014Data();


    //attribute data(T_0015) 구성.
    _sData.oPrev = setPrevdata();


    //데이터 동기화 프로세스 코드.
    _sData.PRCCD = "DATA_SYNC";


    //호출처에 바인딩 구성 정보 전달.
    oAPP.broadcast.postMessage(_sData);


};


/*************************************************************
 * @module - 디자인 트리 전송 data(T_0014) 구성.
 *************************************************************/
function set0014Data(){

    //디자인 트리 -> table화.
    var _aTree = oAPP.fn.parseTree2Tab(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN, "zTREE_DESIGN");

    //14번 정보만 발췌.
    _aTree = _aTree.filter( item => item.DATYP === "01");
    
    var _aT_0014 = [];


    for (let i = 0, l = _aTree.length; i < l; i++) {

        var _sTree = _aTree[i];

        var _s0014 = {};

        _s0014.APPID   = _sTree.S_14_APPID;
        _s0014.GUINR   = _sTree.S_14_GUINR;
        _s0014.OBJID   = _sTree.S_14_OBJID;
        _s0014.POSIT   = _sTree.S_14_POSIT;
        _s0014.POBID   = _sTree.S_14_POBID;
        _s0014.UIOBK   = _sTree.S_14_UIOBK;
        _s0014.PUIOK   = _sTree.S_14_PUIOK;
        _s0014.ISAGR   = _sTree.S_14_ISAGR;
        _s0014.AGRID   = _sTree.S_14_AGRID;
        _s0014.ISDFT   = _sTree.S_14_ISDFT;
        _s0014.OBDEC   = _sTree.S_14_OBDEC;
        _s0014.AGTYP   = _sTree.S_14_AGTYP;
        _s0014.UIATK   = _sTree.S_14_UIATK;
        _s0014.UIATT   = _sTree.S_14_UIATT;
        _s0014.UIASN   = _sTree.S_14_UIASN;
        _s0014.UIATY   = _sTree.S_14_UIATY;
        _s0014.UIADT   = _sTree.S_14_UIADT;
        _s0014.UIADS   = _sTree.S_14_UIADS;
        _s0014.VALKY   = _sTree.S_14_VALKY;
        _s0014.ISLST   = _sTree.S_14_ISLST;
        _s0014.ISMLB   = _sTree.S_14_ISMLB;
        _s0014.TOOLB   = _sTree.S_14_TOOLB;
        _s0014.UIFND   = _sTree.S_14_UIFND;
        _s0014.PUIATK  = _sTree.S_14_PUIATK;
        _s0014.UILIB   = _sTree.S_14_UILIB;
        _s0014.ISEXT   = _sTree.S_14_ISEXT;
        _s0014.TGLIB   = _sTree.S_14_TGLIB;
        _s0014.DEL_UOK = _sTree.S_14_DEL_UOK;
        _s0014.DEL_POK = _sTree.S_14_DEL_POK;
        _s0014.ISECP   = _sTree.S_14_ISECP;

        _aT_0014.push(_s0014);
        _s0014 = null;
        
    }

    return _aT_0014;

}


/*************************************************************
 * @module - attribute data(T_0015) 구성.
 *************************************************************/
function setPrevdata(){

    //15번 정보 발췌.
    var _oPrev = {};

    for (const key in oAPP.attr.prev) {

        var _oUi = oAPP.attr.prev[key];

        if(typeof _oUi._T_0015 === "undefined"){
            continue;
        }
                

        _oPrev[key] = {};

        var _sParam = _oPrev[key];

        //attr 수집정보.
        _sParam._T_0015    = _oUi._T_0015;

        //모델 바인딩 정보.
        _sParam._MODEL     = _oUi._MODEL;

        //N바인딩된 UI정보.
        _sParam._BIND_AGGR = {};

        //N건 바인딩된 정보 수집.
        setBindAggrData(_sParam, _oUi);

            
    }

    return _oPrev;

}



/*************************************************************
 * @module - N건 바인딩된 정보 수집.
 *************************************************************/
function setBindAggrData(sParam, oUi){

    if(Object.entries(oUi._BIND_AGGR).length === 0){
        return;
    }


    for (const key in oUi._BIND_AGGR) {

        var _aAggr =  oUi._BIND_AGGR[key];

        sParam[key] = [];
        
        for (let i = 0, l = _aAggr.length; i < l; i++) {
            
            var _sAggr = _aAggr[i];

            sParam[key].push(_sAggr._OBJID);
            
        }

    }
    

}