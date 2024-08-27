//최대 이력 저장 갯수.
const C_MAX_HISTORY = 100;

//WS 3.0 메인 프레임.
var oWS_FRAME = document.getElementById('ws_frame').contentWindow;


//oAPP 정보 광역화.
var oAPP = oWS_FRAME.oAPP;


//테스트!!!!!!!!!!!!!!!!!!!!!!!!
//UNDO 이력 저장 ARRAY.
window.__ACT_UNDO_HIST = [];

//REDO 이력 저장 ARRAY.
window.__ACT_REDO_HIST = [];
//테스트!!!!!!!!!!!!!!!!!!!!!!!!


/*************************************************************
 * @module - 이력 초기화.
 *************************************************************/
module.exports.clearHistory = function(){

    //UNDO 이력 초기화.
    __ACT_UNDO_HIST = [];


    //REDO 이력 초기화.
    __ACT_REDO_HIST = [];

};


/*************************************************************
 * @module - undo, redo 버튼 활성여부 처리.
 *************************************************************/
module.exports.setUndoRedoButtonEnable = function(){

    //undo, redo 버튼 활성여부 처리.
    CL_COMMON.setUndoRedoButtonEnable();

};



/*************************************************************
 * @module - 디자인 영역에서 수행된 action에 따라 
 *           undo, redo를 위한 이력 저장 처리.
 *************************************************************/
module.exports.saveActionHistoryData = function(ACTCD, oParam){

    switch (ACTCD) {
        case "INSERT":
            //UI 추가.
            CL_INSERT_UI.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;

        case "DELETE":
            //UI 삭제.
            CL_DELETE_UI.saveActionHistoryData(__ACT_UNDO_HIST, [oParam]);
            break;

        case "MULTI_DELETE":
            //UI 멀티 삭제.
            CL_DELETE_UI.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;        

        case "MOVE":
            //UI 이동 처리.(MOVE, MOVE POSITION)
            CL_MOVE_UI.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;

        case "PASTE":
            //UI 붙여넣기.
            CL_INSERT_UI.saveActionHistoryData(__ACT_UNDO_HIST, [oParam]);
            break;

        case "COPY":
            //CTRL + D&D로 UI 복사 처리.
            CL_INSERT_UI.saveActionHistoryData(__ACT_UNDO_HIST, [oParam]);
            break;

        case "WIZARD_INSERT":
            //WIZARD UI 추가.
            CL_INSERT_UI.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;

        case "INSERT_PERS":
            //개인화 UI 추가.
            CL_INSERT_UI.saveActionHistoryData(__ACT_UNDO_HIST, [oParam]);
            break;

        case "DRAG_DROP":
            //UI DRAG & DROP.
            CL_DRAG_DROP.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;

        case "CHANGE_OBJID":
            //UI 이름 변경.
            CL_CHANGE_OBJID.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;

        case "CHANGE_ATTR":
            CL_CHANGE_ATTR.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            //attrubyte 변경.
            break;

        case "RESET_ATTR":
            //attr 초기화.
            CL_CHANGE_ATTR.saveActionHistoryData(__ACT_UNDO_HIST, oParam);
            break;
    
        default:
            //잘못된 ACTION CODE를 전달받았을때의 로직 처리.
            //(강제 오류 발생 처리등..)

    }


};



/*************************************************************
 * @module - UNDO, REDO의 이전 HISTORY 수행 처리.
 * @param PRCCD - (UNDO:실행취소, REDO:다시샐행)
 *************************************************************/
module.exports.executeHistory = async function(PRCCD){

    parent.setBusy("X");
    

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);


    var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //208	디자인 화면에서 UI 변경 작업을 진행하고 있습니다.
    _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "208");

    //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);
    

    
    //이력 정보가 존재하지 않는경우 exit.
    if(typeof __ACT_UNDO_HIST === "undefined" || 
        typeof __ACT_REDO_HIST === "undefined"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
    }


    //UNDO, REDO 이력이 둘다 없다면 EXIT.
    if(__ACT_UNDO_HIST.length === 0 && 
        __ACT_REDO_HIST.length === 0){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);
        
        parent.setBusy("");

        return;
    }


    var _sHist = undefined;
    

    var _sEventParam = {};

    //UNDO, REDO 구분자 코드.
    _sEventParam.PRCCD  = PRCCD;

    //UNDO, REDO HISTORY 구성 ARRAY.
    _sEventParam.T_HIST = [];
    

    switch (PRCCD) {
        case "UNDO":
            //UNDO의 마지막 이력 정보 얻기.
            _sHist = __ACT_UNDO_HIST.pop();

            //REDO history array.
            _sEventParam.T_HIST = __ACT_REDO_HIST;

            break;

        case "REDO":
            //REDO의 마지막 이력 정보 얻기.
            _sHist = __ACT_REDO_HIST.pop();

            //UNDO history array.
            _sEventParam.T_HIST = __ACT_UNDO_HIST;
            
            break;
        default:
            break;
    }


    //history 처리 정보가 존재하지 않는경우.
    if(typeof _sHist === "undefined"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);
        
        parent.setBusy("");

        return;
    }


console.log(1111111);
    //마지막 이력의 ACTION 코드에 따른 로직 분기.
    switch (_sHist.ACTCD) {
        case "INSERT":
            //UI 추가.
            CL_INSERT_UI.executeHistory(_sEventParam, _sHist);
            break;

        case "DELETE":
            //UI 삭제.
            CL_DELETE_UI.executeHistory(_sEventParam, _sHist);
            break;

        case "MOVE":
            //UI 이동 처리.(MOVE, MOVE POSITION)
            CL_MOVE_UI.executeHistory(_sEventParam, _sHist);
            break;

        case "DRAG_DROP":
            //UI DRAG & DROP.
            CL_DRAG_DROP.executeHistory(_sEventParam, _sHist);
            break;

        case "CHANGE_OBJID":
            //UI 이름 변경.
            CL_CHANGE_OBJID.executeHistory(_sEventParam, _sHist);            
            break;

        case "CHANGE_ATTR":
            //ATTRIBUTE 변경.
            CL_CHANGE_ATTR.executeHistory(_sEventParam, _sHist);
            break;
    
        default:
            //잘못된 ACTION CODE를 전달받았을때의 로직 처리.
            //(강제 오류 발생 처리등..)
        
    }

};



/*************************************************************
 * @module - 멀티 삭제시 파라메터 정보 구성.
 *************************************************************/
module.exports.getMultiDeleteParam = function(){

    //멀티 삭제 파라메터 정보 구성.
    //(체크박스 선택건 정보 구성, 부모선택시 child는 수집 생략)
    return CL_DELETE_UI.getMultiDeleteParam(oAPP.attr.oModel.oData.zTREE);

};


/*************************************************************
 * @module - attr 초기화시 파라메터 정보 구성.
 *************************************************************/
module.exports.getResetAttrParam = function(){

    //attr 초기화시 파라메터 정보 구성.
    return CL_CHANGE_ATTR.getResetAttrParam();

};




/*************************************************************
 * @class - INSERT UI 처리 CLASS.
 *************************************************************/
class CL_INSERT_UI{
    
    //INSERT DATA 구조.
    static TY_INSERT_DATA = {
        
        S_DESIGN     : {},      //DESIGN TREE 라인 정보.

        BEFORE_POSIT : null,    //UI가 위치한 INDEX 정보.

        T_0015       : [],      //DESIGN TREE로부터 CHILD UI의 ATTR 변경건 수집 ARRAY
        T_CEVT       : [],      //DESIGN TREE로부터 CHILD UI의 클라이언트 이벤트 수집 ARRAY.
        T_DESC       : []       //DESIGN TREE로부터 CHILD UI의 DESC 정보 수집 ARRAY.

    };


    /*************************************************************
     * @method - INSERT에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, oParam) {

        //파라메터 정보가 존재하는지 확인.
        if(typeof oParam === "undefined" || oParam === null){
            return;
        }

        if(Array.isArray(oParam) !== true){
            return;
        }

        if(oParam.length === 0){
            return;
        }


        var _sSaveParam = {};

        //UNDO, REDO시 수행할 ACTION 코드.
        _sSaveParam.ACTCD   = "DELETE";

        //INSERT한 UI OBJECT ID 수집 ARRAY.
        _sSaveParam.T_OBJID = [];

        for (let i = 0, l = oParam.length; i < l; i++) {

            var _sParam = oParam[i];

            //object id만 수집 처리.
            _sSaveParam.T_OBJID.push(_sParam.OBJID);

        }


        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sSaveParam);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };



    /*************************************************************
     * @method - INSERT 처리.
     *************************************************************/
    static async executeHistory(sEvent, oParam){

        //전달받은 파라메터가 없다면 EXIT.
        if(typeof oParam?.T_INSERT_DATA === "undefined"){

            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }

        if(Array.isArray(oParam.T_INSERT_DATA) !== true){

            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;

        }

        if(oParam.T_INSERT_DATA.length === 0){

            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;

        }

        var _aDesign = [];


        for (let i = 0, l = oParam.T_INSERT_DATA.length; i < l; i++) {
            var _sInsertData = oParam.T_INSERT_DATA[i];

            _aDesign.push(_sInsertData.S_DESIGN);
            
        }

        
        //REDO HISTORY 등록 처리.
        CL_INSERT_UI.saveActionHistoryData(sEvent.T_HIST, _aDesign);


        //UI 추가 대상 부모 정보 얻기.
        var _aParent = CL_COMMON.collectParent(_aDesign);


        //대상 UI에 onAfterRendering 이벤트 등록 처리.
        var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);



        for (let i = 0, l = oParam.T_INSERT_DATA.length; i < l; i++) {
            
            var _sInsertData = oParam.T_INSERT_DATA[i];
            
            //design tree 및 미리보기 UI 생성, 추가 처리.
            CL_INSERT_UI.insertUiObject(_sInsertData);

        }


        oAPP.attr.oModel.refresh();


        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();

    
        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);


        //마지막 이력정보 얻기.
        var _sInsertData = oParam.T_INSERT_DATA[oParam.T_INSERT_DATA.length - 1 ];


        //라인 선택 처리.
        await oAPP.fn.setSelectTreeItem(_sInsertData.S_DESIGN.OBJID);

        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


    };



    /*************************************************************
     * @method - design tree 및 미리보기 UI 생성, 추가 처리.
     *************************************************************/
    static insertUiObject = function(sInsertData){

        
        var _sDesign = sInsertData.S_DESIGN;
        
        //INSERT 처리 대상 UI의 부모 정보 얻기.
        var _sParent = oAPP.fn.getTreeData(_sDesign.POBID);


        //부모 위치에 추가.
        _sParent.zTREE.splice(sInsertData.BEFORE_POSIT, 0, _sDesign);


        var _aT_0015 = sInsertData.T_0015.filter( item => item.OBJID === _sDesign.OBJID );

        //UI 생성 처리.
        oAPP.attr.ui.frame.contentWindow.createUIInstance(_sDesign, _aT_0015);
        

        //CHILD 정보의 UI INSTANCE 생성 처리.
        CL_INSERT_UI.createPreviewUI(_sDesign.zTREE, sInsertData.T_0015);


        //클라이언트 이벤트 원복 처리.
        oAPP.DATA.APPDATA.T_CEVT = oAPP.DATA.APPDATA.T_CEVT.concat(sInsertData.T_CEVT);

        //desc 정보 원복 처리.
        oAPP.DATA.APPDATA.T_DESC = oAPP.DATA.APPDATA.T_CEVT.concat(sInsertData.T_DESC);


        //현재 추가하고자 하는 aggregation만 필터링.
        var _aChild = _sParent.zTREE.filter( a => a.UIATK === _sDesign.UIATK );

        //해당 aggr에 추가될 UI의 INDEX 위치 확인.
        var _indx = _aChild.findIndex( item => item.OBJID === _sDesign.OBJID );


        //부모에 생성한 UI 추가.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(_sDesign.OBJID, _sDesign.UILIB, _sDesign.POBID, 
            _sDesign.PUIOK, _sDesign.UIATT, _indx, _sDesign.ISMLB, _sDesign.UIOBK, true);


        //UI에 N건 바인딩 처리된경우 부모 UI에 해당 UI 매핑 처리.
        oAPP.fn.setModelBind(oAPP.attr.prev[_sDesign.OBJID]);


    };


    
    /*************************************************************
     * @method - 미리보기 UI 생성 처리.
     *************************************************************/
    static createPreviewUI(aDesignTree, aT_0015){

        if(typeof aDesignTree === "undefined"){
            return;
        }

        if(aDesignTree.length === 0){
            return;
        }

        for (let i = 0, l = aDesignTree.length; i < l; i++) {
            
            var _sDesignTree = aDesignTree[i];

            var _aT_0015 = aT_0015.filter( item => item.OBJID === _sDesignTree.OBJID );

            //UI 생성 처리.
            oAPP.attr.ui.frame.contentWindow.createUIInstance(_sDesignTree, _aT_0015);

            //CHILD 정보의 UI INSTANCE 생성 처리.
            CL_INSERT_UI.createPreviewUI(_sDesignTree.zTREE, aT_0015);

            //부모 UI에 추가 처리.
            oAPP.attr.ui.frame.contentWindow.setUIParent(_sDesignTree);
            
        }

    };

};




/*************************************************************
 * @class - DELETE UI 처리 CLASS.
 *************************************************************/
class CL_DELETE_UI{

    /*************************************************************
     * @method - DELETE에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, oParam) {

        if(typeof oParam === "undefined"){
            return;
        }

        if(oParam === null){
            return;
        }

        if(Array.isArray(oParam) !== true){
            return;
        }

        if(oParam.length === 0){
            return;
        }


        var _sSaveParam = {};

        //UNDO, REDO시 수행할 ACTION 코드.
        _sSaveParam.ACTCD         = "INSERT";

        _sSaveParam.T_INSERT_DATA = [];


        for (let i = 0, l = oParam.length; i < l; i++) {
            
            var _sParam = oParam[i];

            //전달받은 파라메터의 UI OBJECT ID에 해당하는 DESIGN TREE 라인 데이터 얻기.
            var _sDesign = oAPP.fn.getTreeData(_sParam.OBJID);

            
            if(typeof _sDesign === "undefined"){
                return;
            }

            
            //대상 UI의 CHILD를 탐색하며, ATTR 변경건 수집 처리.
            var _aT_0015 = CL_COMMON.collect0015Data(_sDesign);
            

            //현재 UI가 부모의 몇번째 INDEX인지 확인.
            var _posit = oAPP.fn.getTreeIndexOfChild(_sDesign.OBJID);

            
            //desc 정보 수집 처리.
            var _aDESC = CL_COMMON.collectDescData(_sDesign);


            //클라이언트 이벤트 수집 처리.
            var _aCEVT = CL_COMMON.collectClientEventData(_aT_0015);
            

            var _sInsertData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            //이전 위치 정보.
            _sInsertData.BEFORE_POSIT = _posit;

            //design tree 라인 정보.
            _sInsertData.S_DESIGN     = JSON.parse(JSON.stringify(_sDesign));

            //design tree로부터 하위의 attr 변경건 정보 수집건.
            _sInsertData.T_0015       = JSON.parse(JSON.stringify(_aT_0015));

            //클라이언트 이벤트.
            _sInsertData.T_CEVT       = JSON.parse(JSON.stringify(_aCEVT));

            //desc 정보.
            _sInsertData.T_DESC       = JSON.parse(JSON.stringify(_aDESC));


            _sSaveParam.T_INSERT_DATA.push(_sInsertData);

            _sInsertData = null;

        }
        
        
        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sSaveParam);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };


    /*************************************************************
     * @method - DELETE 처리.
     *************************************************************/
    static async executeHistory(sEvent, oParam){

        if(typeof oParam?.T_OBJID === "undefined"){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        if(oParam?.T_OBJID === null){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        if(Array.isArray(oParam?.T_OBJID) !== true){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        if(oParam.T_OBJID?.length === 0){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        //003	Do you really want to delete the object?
        var _msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "003", "", "", "", "");

        parent.setBusy("");

        var _res = await new Promise((resolve)=>{

            parent.showMessage(oWS_FRAME.sap, 30, "I", _msg, async function(oEvent){

                parent.setBusy("X");

                resolve(oEvent);
            });

        });


        //삭제를 취소한 경우.
        if(_res !== "YES"){

            //이전 history에 다시 추가 처리. 
            switch (sEvent.PRCCD) {
                case "UNDO":
                    __ACT_UNDO_HIST.push(oParam);
                    break;
            
                case "REDO":
                    __ACT_REDO_HIST.push(oParam);
                    break;
            }

            //UNDO, REDO 버튼 활성화 처리.
            CL_COMMON.setUndoRedoButtonEnable();
            
            oAPP.attr.oModel.refresh();

            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");


            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        var _aParam = [];

        for (let i = 0, l = oParam.T_OBJID.length; i < l; i++) {
            
            var _OBJID = oParam.T_OBJID[i];

            _aParam.push(oAPP.fn.getTreeData(_OBJID));

        }

        //이력 정보 저장 처리.
        CL_DELETE_UI.saveActionHistoryData(sEvent.T_HIST, _aParam);
        

        //현재 우측에 출력한 UI의 TREE 정보 얻기.
        var _stree = oAPP.fn.getTreeData(oAPP.attr.oModel.oData.uiinfo.OBJID);

        //현재 선택건의 OBJID 매핑.
        var _SEL_OBJID = _stree?.OBJID || undefined;
            
        //해당 라인의 삭제를 위해 선택된경우.
        if(_stree?.chk === true){
            //선택 라인으로부터 가장 직전의 선택하지 않은 라인 정보 얻기.    
            _SEL_OBJID = oAPP.fn.designGetPreviousTreeItem(_stree.OBJID);

        }

        //직전 라인 정보를 얻지 못한 경우 ROOT를 선택 처리.
        if(typeof _SEL_OBJID === "undefined"){
            _SEL_OBJID = "ROOT";
        }


        //삭제 대상 UI의 부모 정보 수집 처리.
        var _aParent = CL_COMMON.collectParent(oParam.T_OBJID);


        //대상 UI에 onAfterRendering 이벤트 등록 처리.
        var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);


        for (let i = 0, l = oParam.T_OBJID.length; i < l; i++) {
            
            var _OBJID = oParam.T_OBJID[i];

            //design tree 및 미리보기 UI 삭제 처리.
            CL_DELETE_UI.deleteUiObject(_OBJID);

        }


        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();

        
        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();


        for (let i = 0, l = _aParent.length; i < l; i++) {
            
            var _sParent = _aParent[i];
            
            oAPP.attr.prev[_sParent.OBJID].invalidate();

        }


        //미리보기 화면 변경 대기 처리.
        await Promise.all(_aPromise);
        

        //라인 선택 처리.
        await oAPP.fn.setSelectTreeItem(_SEL_OBJID);

        
        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


    };



    /*************************************************************
     * @method - design tree 및 미리보기 UI 삭제 처리.
     *************************************************************/    
    static deleteUiObject = function(OBJID){
        
        //전달받은 파라메터의 UI OBJECT ID에 해당하는 DESIGN TREE 라인 데이터 얻기.
        var ls_tree = oAPP.fn.getTreeData(OBJID); 


        //내 부모가 자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 처리. 
        oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_tree.PUIOK, ls_tree.POBID, undefined, undefined, true);

        //현재 UI가 자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 처리.
        oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_tree.UIOBK, ls_tree.OBJID, undefined, undefined, true);

        //미리보기 화면 UI 제거.
        oAPP.attr.ui.frame.contentWindow.delUIObjPreView(ls_tree.OBJID, ls_tree.POBID, ls_tree.PUIOK, ls_tree.UIATT, ls_tree.ISMLB, ls_tree.UIOBK);


        //부모 TREE 라인 정보 얻기.
        var ls_parent = oAPP.fn.getTreeData(ls_tree.POBID);

        
        //선택라인의 삭제대상 OBJECT 제거 처리.
        CL_DELETE_UI.deleteTreeLine(ls_tree);
        
        //부모에서 현재 삭제대상 라인이 몇번째 라인인지 확인.
        var l_fIndx = ls_parent.zTREE.findIndex( a => a.OBJID === ls_tree.OBJID );

        if(l_fIndx !== -1){
            //부모에서 현재 삭제 대상건 제거.
            ls_parent.zTREE.splice(l_fIndx, 1);
        }

        //미리보기의 직접 입력 가능한 UI의 직접 입력건 반영처리.
        oAPP.fn.previewSetStrAggr(ls_tree);


    };



    /*************************************************************
     * @method - 선택라인의 삭제대상 OBJECT 제거 처리.
     *************************************************************/
    static deleteTreeLine = function (is_tree) {

        //child정보가 존재하는경우.
        if(is_tree.zTREE.length !== 0){
            //하위 TREE 정보가 존재하는경우
            for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                //재귀호출 탐색하며 삭제 처리.
                CL_DELETE_UI.deleteTreeLine(is_tree.zTREE[i]);
    
            }

        }

        //클라이언트 이벤트 및 sap.ui.core.HTML의 프로퍼티 입력건 제거 처리.
        oAPP.fn.delUiClientEvent(is_tree);

        //Description 삭제.
        oAPP.fn.delDesc(is_tree.OBJID);

        //해당 UI의 바인딩처리 수집건 제거 처리.
        oAPP.fn.designUnbindLine(is_tree);

        //미리보기 UI destroy 처리.
        oAPP.attr.ui.frame.contentWindow.destroyUIPreView(is_tree.OBJID);

        //팝업 수집건에서 해당 UI 제거 처리.
        oAPP.fn.removeCollectPopup(is_tree.OBJID);

        //미리보기 UI 수집항목에서 해당 OBJID건 삭제.
        delete oAPP.attr.prev[is_tree.OBJID];

        //현재 미리보기 예외처리 대상 UI가 삭제되는 UI인경우.
        if(oAPP.attr?.UA015UI?._OBJID === is_tree.OBJID){
            //예외처리 UI 정보 제거.
            delete oAPP.attr.UA015UI;
        }
        
    };

    

    /*************************************************************
     * @method - 삭제 대상 라인으로 부터 하위의 ATTR 변경 데이터 수집.
     *************************************************************/
    static getMultiDeleteParam = function(aDesign, aParam = []) {

        if(typeof aDesign === "undefined"){
            return aParam;
        }

        if(aDesign.length === 0){
            return aParam;
        }

        for (let i = 0, l = aDesign.length; i < l; i++) {
            
            var _sDesign = aDesign[i];

            //라인선택한 건인 경우.
            if(_sDesign.chk === true){
                //수집 처리 후 하위 탐색 skip.
                aParam.push(_sDesign);
                continue;
            }

            //라인을 선택하지 않은 경우 하위를 탐색하며 수집 처리.
            aParam = CL_DELETE_UI.getMultiDeleteParam(_sDesign.zTREE, aParam);
            
        }

        return aParam;

    };

};




/*************************************************************
 * @class - UI 이동 처리 CLASS.(MOVE UP, MOVE DOWN, MOVE POSITION)
 *************************************************************/
class CL_MOVE_UI{

    /*************************************************************
     * @method - UI 이동 처리에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, oParam) {

        //파라메터 정보가 존재하는지 확인.
        if(typeof oParam?.OBJID === "undefined" || oParam?.OBJID === null){
            return;
        }

        //현재 UI가 부모의 몇번째 INDEX인지 확인.
        var _posit = oAPP.fn.getTreeIndexOfChild(oParam.OBJID);

        //저장 데이터구성.
        var _sParam = {
            ACTCD        : "MOVE",
            OBJID        : oParam.OBJID,
            BEFORE_POSIT : _posit
        };


        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sParam);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };


    /*************************************************************
     * @method - UI 이동 처리.
     *************************************************************/
    static executeHistory(sEvent, oParam){

        if(typeof oParam?.OBJID === "undefined"){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");
            return;
        }

        if(oParam?.OBJID === null){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");
            return;
        }

        if(oParam?.OBJID === ""){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");
            return;
        }

        //이력 정보 저장 처리.
        CL_MOVE_UI.saveActionHistoryData(sEvent.T_HIST, oParam);


        //이동할 OBJECT ID 매핑 처리.
        oAPP.attr.oModel.setProperty("/lcmenu/OBJID", oParam?.OBJID);


        //현재 UNDO, REDO 처리 프로세스 정보 파라메터 처리.
        var _sProcess = {
            PRCCD: "UNDO_REDO"
        };


        //해당 UI 이전 위치로 이동 처리.
        oAPP.fn.contextMenuUiMove(undefined, oParam.BEFORE_POSIT, _sProcess);


    };


};



/*************************************************************
 * @class - UI 이름 변경.
 *************************************************************/
class CL_CHANGE_OBJID{

    /*************************************************************
     * @method - UI 이름 변경 처리에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, oParam) {

        //파라메터 정보가 존재하는지 확인.
        if(typeof oParam?.BEFORE_OBJID === "undefined" || oParam?.BEFORE_OBJID === null || oParam?.BEFORE_OBJID === ""){
            return;
        }

        if(typeof oParam?.OBJID === "undefined" || oParam?.OBJID === null || oParam?.OBJID === ""){
            return;
        }


        //저장 데이터구성.
        var _sParam = {
            ACTCD        : "CHANGE_OBJID",
            BEFORE_OBJID : oParam.BEFORE_OBJID,
            OBJID        : oParam.OBJID
        };


        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sParam);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };


    /*************************************************************
     * @method - UI 이름 변경 처리.
     *************************************************************/
    static async executeHistory(sEvent, oParam){

        //파라메터 정보가 존재하는지 확인.
        if(typeof oParam?.BEFORE_OBJID === "undefined" || oParam?.BEFORE_OBJID === null || oParam?.BEFORE_OBJID === ""){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");
            return;
        }

        if(typeof oParam?.OBJID === "undefined" || oParam?.OBJID === null || oParam?.OBJID === ""){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");
            return;
        }


        //저장 데이터구성.
        var _sParam = {
            ACTCD        : "CHANGE_OBJID",
            BEFORE_OBJID : oParam.OBJID,
            OBJID        : oParam.BEFORE_OBJID
        };


        //이력 정보 저장 처리.
        CL_CHANGE_OBJID.saveActionHistoryData(sEvent.T_HIST, _sParam);


        //변경된 이름으로 UI 수집 처리.
        oAPP.attr.prev[oParam.BEFORE_OBJID] = oAPP.attr.prev[oParam.OBJID];

        //UI의 OBJECT ID매핑건 변경 처리.
        oAPP.attr.prev[oParam.BEFORE_OBJID]._OBJID = oParam.BEFORE_OBJID;

        //DESIGN영역의 변경전 OBJID에 해당하는건 검색.
        var l_tree = oAPP.fn.getTreeData(oParam.OBJID);

        //OBJID ID 변경건으로 매핑.
        l_tree.OBJID = oParam.BEFORE_OBJID;

        //CHILD 정보가 존재하는 경우.
        if(l_tree.zTREE.length !== 0){
            //CHILD의 부모 OBJECT ID 를 변경 처리.
            for(var i=0,l=l_tree.zTREE.length; i<l; i++){
                l_tree.zTREE[i].POBID = oParam.BEFORE_OBJID;
            }
        }

        //클라이언트 이벤트 수집건 objid 변경.
        oAPP.fn.attrChgClientEventOBJID(oParam.BEFORE_OBJID, oParam.OBJID);

        
        //이전 이름의 UI 제거.
        delete oAPP.attr.prev[oParam.OBJID];


        //desc 입력건 정보 objid 변경.
        oAPP.fn.changeDescOBJID(oParam.BEFORE_OBJID, oParam.OBJID);

        var ls_uiinfo = oAPP.attr.oModel.getProperty("/uiinfo");


        //현재 선택한 라인이 아닌경우.
        if(ls_uiinfo.OBJID !== oParam.OBJID){
        
            oAPP.attr.oModel.refresh();

            //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
            await oAPP.fn.designRefershModel();
        
            //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
            oAPP.fn.setChangeFlag();

            //20240621 pes.
            //바인딩 팝업의 디자인 영역 갱신처리.
            oAPP.fn.updateBindPopupDesignData();

            return;
        }
        

        //현재 UI명을 이전으로 되돌림.
        ls_uiinfo.OBJID    = oParam.BEFORE_OBJID;
        ls_uiinfo.OBJID_bf = oParam.BEFORE_OBJID;


        //현재 출력된 attribute 리스트의 OBJID 변경 처리.
        for(var i = 0, l = oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){
            oAPP.attr.oModel.oData.T_ATTR[i].OBJID = oParam.BEFORE_OBJID;

        }
        
        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


        //MODEL 갱신 처리.
        oAPP.attr.oModel.setProperty("/uiinfo", ls_uiinfo);
        oAPP.attr.oModel.refresh();

        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();


        //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
        oAPP.fn.setChangeFlag();

        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();
        

    };


};




/*************************************************************
 * @class - UI DRAG & DROP 처리.
 *************************************************************/
class CL_DRAG_DROP{

    /*************************************************************
     * @method - UIDRAG & DROP 처리에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, oParam) {

        if(typeof oParam === "undefined"){
            return;
        }


        //저장 데이터구성.
        var _sDNDParam = {};

        _sDNDParam.ACTCD           = "DRAG_DROP";

        
        //대상 UI의 CHILD를 탐색하며, ATTR 변경건 수집 처리.
        var _aT_DRAG_0015 = CL_COMMON.collect0015Data(oParam.S_DRAG);

        var _aT_DROP_0015 = CL_COMMON.collect0015Data(oParam.S_DROP);


        _sDNDParam.S_DRAG          = JSON.parse(JSON.stringify(oParam.S_DRAG));

        //부모의 몇번째 CHILD 위치 정보.
        _sDNDParam.BEFORE_DRAG_POS = oAPP.fn.getTreeIndexOfChild(oParam.S_DRAG.OBJID);

        //drag한 UI로부터 하위 UI의 ATTR 변경건 수집.
        _sDNDParam.T_DRAG_0015     = JSON.parse(JSON.stringify(_aT_DRAG_0015));


        _sDNDParam.S_DROP          = JSON.parse(JSON.stringify(oParam.S_DROP));

        //drop한 UI로부터 하위 UI의 ATTR 변경건 수집.
        _sDNDParam.T_DROP_0015     = JSON.parse(JSON.stringify(_aT_DROP_0015));

        _sDNDParam.BEFORE_DROP_POS = oAPP.fn.getTreeIndexOfChild(oParam.S_DROP.OBJID);

        
        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sDNDParam);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };


    /*************************************************************
     * @method - UI DRAG & DROP 처리.
     *************************************************************/
    static async executeHistory(sEvent, oParam){


        if(typeof oParam?.S_DRAG === "undefined"){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }


        //drag UI의 현재 라인 정보 얻기.
        var _sDesign = oAPP.fn.getTreeData(oParam.S_DRAG.OBJID);
        
        var _sParam = {};

        //현재 UI 정보를 얻어 매핑 처리.
        _sParam.S_DRAG = _sDesign;

        _sParam.S_DROP = oAPP.fn.getTreeData(oParam.S_DROP.OBJID);


        //이력 정보 저장 처리.
        CL_DRAG_DROP.saveActionHistoryData(sEvent.T_HIST, _sParam);
        
        
        //DRAG, DROP의 부모가 다르거나, aggregation이 다른경우.
        if(oParam.S_DRAG.POBID !== oParam.S_DROP.POBID ||
            oParam.S_DRAG.UIATK !== oParam.S_DROP.UIATK){
            
            var _aParent = [];


            //현재 UI의 부모 정보 얻기.
            _aParent.push(oAPP.fn.getTreeData(_sDesign.POBID));


            //부모의 onAfterRendering 이벤트 등록 처리.
            var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);

            
            //현재 UI를 삭제 처리.
            CL_DELETE_UI.deleteUiObject(oParam.S_DRAG.OBJID);


            //부모의 onAfterRendering 처리 대기.
            await Promise.all(_aPromise);
            

            var _sInsertData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            _sInsertData.S_DESIGN     = oParam.S_DRAG;

            _sInsertData.BEFORE_POSIT = oParam.BEFORE_DRAG_POS;
            
            //drag한 UI로부터 하위 UI의 ATTR 변경건.
            _sInsertData.T_0015       = oParam.T_DRAG_0015;


            //이전 부모에 UI를 추가 처리.
            CL_INSERT_UI.insertUiObject(_sInsertData);


            var _aParent = [];

            //UI의 이전 부모 정보 얻기.
            _aParent.push(oAPP.fn.getTreeData(oParam.S_DRAG.POBID));


            //부모의 onAfterRendering 이벤트 등록 처리.
            var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);
               

            oAPP.attr.oModel.refresh();


            //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
            await oAPP.fn.designRefershModel();

        
            //부모의 onAfterRendering 처리 대기.
            await Promise.all(_aPromise);


            //라인 선택 처리.
            await oAPP.fn.setSelectTreeItem(oParam.S_DRAG.OBJID);


            //20240621 pes.
            //바인딩 팝업의 디자인 영역 갱신처리.
            oAPP.fn.updateBindPopupDesignData();
           

            return;

        }


        var _aParent = [];

        //현재 UI의 부모 정보 얻기.
        _aParent.push(oAPP.fn.getTreeData(oParam.S_DRAG.POBID));


        //부모의 onAfterRendering 이벤트 등록 처리.
        var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);

        var _aDNDData = [];


        //부모와 aggregation이 같은경우.

        //DRAG ui의 위치가 큰 경우
        if(oParam.BEFORE_DRAG_POS > oParam.BEFORE_DROP_POS){
           
            var _sDNDData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            _sDNDData.S_DESIGN     = oParam.S_DROP;

            _sDNDData.BEFORE_POSIT = oParam.BEFORE_DROP_POS;
            
            _sDNDData.T_0015       = oParam.T_DROP_0015;

            _aDNDData.push(_sDNDData);


            var _sDNDData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            _sDNDData.S_DESIGN     = oParam.S_DRAG;

            _sDNDData.BEFORE_POSIT = oParam.BEFORE_DRAG_POS;
            
            _sDNDData.T_0015       = oParam.T_DRAG_0015;

            _aDNDData.push(_sDNDData);

        }else{
            
            var _sDNDData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            _sDNDData.S_DESIGN     = oParam.S_DRAG;

            _sDNDData.BEFORE_POSIT = oParam.BEFORE_DRAG_POS;
            
            _sDNDData.T_0015       = oParam.T_DRAG_0015;

            _aDNDData.push(_sDNDData);

            
            var _sDNDData = JSON.parse(JSON.stringify(CL_INSERT_UI.TY_INSERT_DATA));

            _sDNDData.S_DESIGN     = oParam.S_DROP;

            _sDNDData.BEFORE_POSIT = oParam.BEFORE_DROP_POS;
            
            _sDNDData.T_0015       = oParam.T_DROP_0015;

            _aDNDData.push(_sDNDData);


        }


        //drag, drop ui 삭제 처리.
        for (let i = 0, l = _aDNDData.length; i < l; i++) {
            
            var _sDNDData = _aDNDData[i];

            //대상 UI를 삭제 처리.
            CL_DELETE_UI.deleteUiObject(_sDNDData.S_DESIGN.OBJID);
            
        }


        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);

        var _aParent = [];

        //현재 UI의 부모 정보 얻기.
        _aParent.push(oAPP.fn.getTreeData(oParam.S_DRAG.POBID));


        //부모의 onAfterRendering 이벤트 등록 처리.
        var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);

        //drag, drop ui 추가 처리.
        for (let i = 0, l = _aDNDData.length; i < l; i++) {

            var _sDNDData = _aDNDData[i];
            
            //이전 부모에 UI를 추가 처리.
            CL_INSERT_UI.insertUiObject(_sDNDData);

        }

       
        oAPP.attr.oModel.refresh();


        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();

    
        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);


        //라인 선택 처리.
        await oAPP.fn.setSelectTreeItem(oParam.S_DRAG.OBJID);
       

        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


    };


};



/*************************************************************
 * @class - ATTRIBUTE 변경.
 *************************************************************/
class CL_CHANGE_ATTR{

    /*************************************************************
     * @method - ATTRIBUTE 변경 처리에 대한 이력 저장 처리.
     *************************************************************/
    static saveActionHistoryData(aTargetHist, aParam) {

        if(typeof aParam === "undefined"){
            return;
        }

        if(Array.isArray(aParam) !== true){
            return;
        }

        if(aParam.length === 0){
            return;
        }


        var _sSaveHist = {};

        //UNDO, REDO시 수행할 ACTION 코드.
        _sSaveHist.ACTCD   = "CHANGE_ATTR";

        _sSaveHist.T_ATTR  = [];


        for (let i = 0, l = aParam.length; i < l; i++) {
            
            var _sParam = aParam[i];

            var _sATTR = {};

            //UI OBJECT ID.
            _sATTR.OBJID  = _sParam.OBJID;

            //ATTRIBUTE KEY.
            _sATTR.UIATK  = _sParam.UIATK;

            //ATTRIBUTE TYPE.
            _sATTR.UIATY  = _sParam.UIATY;

            //ATTRIBUTE NAME.
            _sATTR.UIATT  = _sParam.UIATT;

            //ATTRIBUTE 대문자명.
            _sATTR.UIASN  = _sParam.UIASN;

            //ATTR 변경건 수집정보.
            _sATTR.S_0015 = undefined;

            //클라이언트 이벤트.
            _sATTR.T_CEVT = [];
                

            //현재 attr 수집건 정보 존재 여부 확인.
            var _s0015 = oAPP.attr.prev[_sParam.OBJID]._T_0015.find( item => item.UIATK === _sParam.UIATK );


            //수집된 정보가 존재하는경우.
            if(typeof _s0015 !== "undefined"){
                _sATTR.S_0015 = JSON.parse(JSON.stringify(_s0015));

                //클라이언트 이벤트 수집 처리.
                _sATTR.T_CEVT =JSON.parse(JSON.stringify(CL_COMMON.collectClientEventData([_s0015])));

            }

            _sSaveHist.T_ATTR.push(_sATTR);

            
        }

        //이력 저장 처리.
        CL_COMMON.setHistoryData(aTargetHist, _sSaveHist);


        //UNDO, REDO 버튼 활성화 처리.
        CL_COMMON.setUndoRedoButtonEnable();

    };


    /*************************************************************
     * @method - ATTRIBUTE 변경 처리.
     *************************************************************/
    static async executeHistory(sEvent, oParam){

        if(typeof oParam === "undefined"){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }

        if(Array.isArray(oParam?.T_ATTR) !== true){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }

        if(oParam.T_ATTR.length === 0){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

            return;
        }
        

        //이력 정보 저장 처리.
        CL_CHANGE_ATTR.saveActionHistoryData(sEvent.T_HIST, oParam.T_ATTR);

        

        var _aOBJID = [];

        //현재 OBJECT ID 정보 수집.
        for (let i = 0, l = oParam.T_ATTR.length; i < l; i++) {

            var _sATTR = oParam.T_ATTR[i];

            //프로퍼티 변경건만 수집 처리.
            //(프로퍼티 세팅으로 미리보기 갱신을 위함)
            if(_sATTR.UIATY === "1"){
                _aOBJID.push(_sATTR.OBJID);
            }

        }

        
        //UI 추가 대상 부모 정보 얻기.
        var _aParent = CL_COMMON.collectParent(_aOBJID);



        for (let i = 0, l = oParam.T_ATTR.length; i < l; i++) {

            var _sATTR = oParam.T_ATTR[i];


            var _OBJID = _sATTR.OBJID + _sATTR.UIASN;

            //현재 attr의 클라이언트 이벤트(html content 정보) 존재 여부 확인.
            var _indx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === _OBJID );

            //존재시 이전 수집 정보 제거.
            if(_indx !== -1){
                oAPP.DATA.APPDATA.T_CEVT.splice(_indx, 1);
            }
            
            //이전 이력 정보 매핑.
            oAPP.DATA.APPDATA.T_CEVT = oAPP.DATA.APPDATA.T_CEVT.concat(_sATTR.T_CEVT);

            

            //이전 ATTR 변경건 위치 확인.
            var _indx = oAPP.attr.prev[_sATTR.OBJID]._T_0015.findIndex( item => item.UIATK === _sATTR.UIATK );


            //존재시 이전 수집 정보 제거.
            if(_indx !== -1){
                oAPP.attr.prev[_sATTR.OBJID]._T_0015.splice(_indx, 1);
            }


            //이전에 수집한 attribute 정보가 존재하는경우.
            if(typeof _sATTR.S_0015 !== "undefined"){
                //attr 변경건에 추가 처리.
                oAPP.attr.prev[_sATTR.OBJID]._T_0015.push(_sATTR.S_0015);

            }
            

            var _s0015 = _sATTR.S_0015;

            //이전 attr 정보가 존재하지 않는경우.
            //(_T_0015에 변경건 수집이 안된경우)
            if(typeof _s0015 === "undefined"){

                _s0015 = oAPP.fn.crtStru0015();

                var _UIATK = _sATTR.UIATK.replace(/_1/, "");

                var _s0023 = oAPP.DATA.LIB.T_0023.find( item => item.UIATK === _UIATK );

                Object.assign(_s0015, JSON.parse(JSON.stringify(_s0023)));

                _s0015.OBJID = _sATTR.OBJID;
                _s0015.UIATV = _s0023.DEFVL;

            }

            //n건 바인딩 처리건인경우 부모 UI에 현재 UI 매핑 처리.
            oAPP.fn.setModelBind(oAPP.attr.prev[_sATTR.OBJID]);

            
            //미리보기 화면의 대상 ui의 프로퍼티 변경처리.
            oAPP.fn.previewUIsetProp(_s0015);
            
            
        }


        
        //미리보기 onAfterRendering 처리 관련 module load.
        var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);


        var _aPromise = [];

        for (let i = 0; i < _aParent.length; i++) {
            
            var _sParent = _aParent[i];

            //onAfterRendering 이벤트 등록 대상 UI 얻기.
            let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[_sParent.OBJID]);
            
            let _oDom = undefined;

            if(typeof _oTarget?.getDomRef === "function"){
                _oDom = _oTarget.getDomRef();
            }
            
            
            //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
            if(typeof _oDom !== "undefined" && _oDom !== null){
                _aPromise.push(_oRender.setAfterRendering(_oTarget));

                //RichTextEditor 미리보기 출력 예외처리로직.
                _aPromise = _aPromise.concat(_oRender.renderingRichTextEditor(_sParent));

                _oTarget.invalidate();

            }
            
        }
           

        //onAfterRendering 수행까지 대기.
        await Promise.all(_aPromise);


        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();

        
        //DESIGN tree item 선택 처리
        await oAPP.fn.setSelectTreeItem(oParam.T_ATTR[0].OBJID);


    };



    /*************************************************************
     * @method - attr 초기화시 파라메터 정보 구성.
     *************************************************************/
    static getResetAttrParam = function(){

        var _aATTR = [];

        //현재 ATTRIBUTE 항목중 PROPERTY 항목에 대해 직접 입력하여 값을 변경했다면, DEFAULT 값으로 초기화 처리.
        for(var i = 0, l = oAPP.attr.oModel.oData.T_ATTR.length; i < l; i++){

            var _sATTR = oAPP.attr.oModel.oData.T_ATTR[i];

            //프로퍼티가 아닌경우 skip.
            if(_sATTR.UIATY !== "1"){continue}

            //바인딩 처리된건인경우 skip.
            if(_sATTR.ISBND === "X"){continue;}

            var l_UIATK = _sATTR.UIATK;

            //직접 입력 가능한 attribute 여부확인(AT000002650_1 형식으로 구성됨)
            if(l_UIATK.indexOf("_") !== -1){
                //_1 부분 제거.
                l_UIATK = l_UIATK.substr(0, l_UIATK.indexOf("_"));
            }

            //현재 attribute 정보 검색.
            var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_UIATK );
            if(!ls_0023){continue;}

            //직접 입력 가능한 AGGREGATION인경우 값을 입력했다면.
            if(ls_0023.ISSTR === "X" && _sATTR.UIATV !== ""){

                _aATTR.push(_sATTR);

                continue;
            }

            //현재 attribute값과 default값이 같다면 skip.
            if(_sATTR.UIATV === ls_0023.DEFVL){continue;}

            _aATTR.push(_sATTR);

        }

        return _aATTR;

    };


};



/*************************************************************
 * @class - COMMON CLASS.
 *************************************************************/
class CL_COMMON{


    /*************************************************************
     * @method - 이력 저장 처리.
     *************************************************************/
    static setHistoryData = function(aHistory, oParam){

        //이력 저장 처리.
        aHistory.push(oParam);


        //저장된 이력 라인이 MAX 이력값을 초과한경우.
        if(aHistory.length > C_MAX_HISTORY){

            //가장 마지막 이력 제거 처리.
            aHistory.splice(0,  aHistory.length - C_MAX_HISTORY);

        }

    };


            
    /*************************************************************
     * @method - 입력 UI의 부모정보 수집 처리.
     *************************************************************/
    static collectParent = function (aDesign){

        var _aParent = [];

        for (let i = 0, l = aDesign.length; i < l; i++) {
            
            var _OBJID  = aDesign[i];

            //전달받은 파라메터의 UI OBJECT ID에 해당하는 DESIGN TREE 라인 데이터 얻기.
            var _sDesign = oAPP.fn.getTreeData(_OBJID);

            if(typeof _sDesign === "undefined"){
                continue;
            }

            var _sParent = oAPP.fn.getTreeData(_sDesign.POBID);

            if(typeof _sParent === "undefined"){
                continue;
            }

            //수집되지 않은경우만 수집 처리.
            if(_aParent.findIndex( item => item.OBJID === _sParent.OBJID) === -1){
                _aParent.push(_sParent);   
            }
            
        }

        return _aParent;
        
    };


    /*************************************************************
     * @method - 대상 UI에 onAfterRendering 이벤트 등록 처리.
     *************************************************************/
    static attachOnAfterRendering = function(aDesign) {
       
        //미리보기 onAfterRendering 처리 관련 module load.
        var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);

        var _aPromise = [];


        for (let i = 0; i < aDesign.length; i++) {
            
            var _sDesign = aDesign[i];
                        
            //onAfterRendering 이벤트 등록 대상 UI 얻기.
            let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[_sDesign.OBJID]);
            
            let _oDom = undefined;

            if(typeof _oTarget?.getDomRef === "function"){
                _oDom = _oTarget.getDomRef();
            }      
            
            
            //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
            if(typeof _oDom !== "undefined" && _oDom !== null){
                _aPromise.push(_oRender.setAfterRendering(_oTarget));

                //RichTextEditor 미리보기 출력 예외처리로직.
                _aPromise = _aPromise.concat(_oRender.renderingRichTextEditor(_sDesign));

            }
            
        }

        return _aPromise;
        
    };


    /*************************************************************
     * @method - undo, redo 버튼 활성여부 처리.
     *************************************************************/
    static setUndoRedoButtonEnable = function() {

        if(typeof oAPP.attr.oModel.oData.designTree === "undefined"){
            oAPP.attr.oModel.oData.designTree = {};
        }


        //default 비활성 처리.
        oAPP.attr.oModel.oData.designTree.undo = false;
        oAPP.attr.oModel.oData.designTree.redo = false;
        

        //undo 이력이 존재하는경우.
        if(__ACT_UNDO_HIST.length > 0){
            //undo 버튼 활성화.
            oAPP.attr.oModel.oData.designTree.undo = true;
        }


        //redo 이력이 존재하는 경우.
        if(__ACT_REDO_HIST.length > 0){
            //redo 버튼 활성화.
            oAPP.attr.oModel.oData.designTree.redo = true;
        }

        
    };


    
    /*************************************************************
     * @method - 대상 라인으로 부터 하위의 ATTR 변경 데이터 수집.
     *************************************************************/
    static collect0015Data = function(sDesign, aT_0015 = []){

        if(typeof sDesign === "undefined"){
            return aT_0015;
        }   

        if(typeof oAPP.attr.prev[sDesign.OBJID]?._T_0015 !== "undefined"){
            //ATTR 변경건 데이터 수집.
            aT_0015 = aT_0015.concat(oAPP.attr.prev[sDesign.OBJID]._T_0015);
        }


        //CHILD 정보가 존재하지 않는경우 EXIT.
        if(typeof sDesign.zTREE === "undefined"){
            return aT_0015;
        }

        //CHILD 정보가 존재하지 않는경우 EXIT.
        if(sDesign.zTREE.length === 0){
            return aT_0015;
        }

        for (let i = 0, l = sDesign.zTREE.length; i < l; i++) {

            var _sChild = sDesign.zTREE[i];

            //하위 ui를 탐색하며, ATTR 변경 데이터 수집 처리.
            aT_0015 = CL_COMMON.collect0015Data(_sChild, aT_0015);
            
        }

        return aT_0015;


    };



    /*************************************************************
     * @method - 대상 라인으로 부터 하위의 Desc 입력건 수집.
     *************************************************************/
    static collectDescData = function(sDesign, aT_DESC = []){

        if(typeof sDesign === "undefined"){
            return aT_DESC;
        }   

        //현재 UI의 desc 입력건 확인.
        var _sDESC = oAPP.DATA.APPDATA.T_DESC.find( item => item.OBJID === sDesign.OBJID);

        //입력건이 존재하는경우 수집 처리.
        if(typeof _sDESC !== "undefined"){
            aT_DESC.push(_sDESC);
        }


        //CHILD 정보가 존재하지 않는경우 EXIT.
        if(typeof sDesign.zTREE === "undefined"){
            return aT_DESC;
        }

        //CHILD 정보가 존재하지 않는경우 EXIT.
        if(sDesign.zTREE.length === 0){
            return aT_DESC;
        }

        for (let i = 0, l = sDesign.zTREE.length; i < l; i++) {

            var _sChild = sDesign.zTREE[i];

            //하위 ui를 탐색하며, Desc 입력건 수집.
            aT_DESC = CL_COMMON.collectDescData(_sChild, aT_DESC);
            
        }

        return aT_DESC;


    };



    /*************************************************************
     * @method - 대상 라인으로 부터 하위의 클라이언트 이벤트 수집.
     *************************************************************/
    static collectClientEventData = function(aATTR){

        var _aT_CEVT = [];

        //전제 수집된 클라이언트 이벤트가 없는경우 exit.
        if(oAPP.DATA.APPDATA.T_CEVT.length === 0){
            return _aT_CEVT;
        }
        

        for (let i = 0, l = aATTR.length; i < l; i++) {
            
            var _sATTR = aATTR[i];

            //UI OBJECT ID + EVENT명.(BUTTON1PRESS)
            var _OBJID = _sATTR.OBJID + _sATTR.UIASN;

            var _sCEVT = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === _OBJID );

            if(typeof _sCEVT === "undefined"){
                continue;
            }

            _aT_CEVT.push(_sCEVT);
            
        }

        return _aT_CEVT;

    };


};

