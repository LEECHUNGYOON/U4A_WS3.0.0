
//WS 3.0 메인 프레임.
const oWS_FRAME = document.getElementById('ws_frame').contentWindow;


//oAPP 정보 광역화.
const oAPP = oWS_FRAME.oAPP;

var sap = oWS_FRAME.sap;

/*************************************************************
 * @module - 디자인 영역에서 수행된 action에 따라 
 *           undo, redo를 위한 이력 저장 처리.
 *************************************************************/
module.exports.saveActionHistoryData = function(ACTCD, oParam){

    //redo history 초기화.
    oWS_FRAME.__ACT_REDO_HIST = [];


    switch (ACTCD) {
        case "INSERT":
            //UI 추가.
            CL_INSERT_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, oParam);
            break;

        case "DELETE":
            //UI 삭제.
            CL_DELETE_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, [oParam]);
            break;

        case "MULTI_DELETE":

            //멀티 삭제 파라메터 정보 구성.
            var _aParam = CL_DELETE_UI.getMultiDeleteParam(oAPP.attr.oModel.oData.zTREE);

            //UI 삭제.
            CL_DELETE_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, _aParam);
            break;        

        case "MOVE":
            //UI 이동 처리.(MOVE, MOVE POSITION)
            CL_MOVE_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, oParam);
            break;

        case "PASTE":
            //UI 붙여넣기.
            CL_INSERT_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, [oParam]);
            break;

        case "COPY":
            //CTRL + D&D로 UI 복사 처리.
            CL_INSERT_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, [oParam]);
            break;

        case "WIZARD_INSERT":
            //WIZARD UI 추가.
            CL_INSERT_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, oParam);
            break;

        case "INSERT_PERS":
            //개인화 UI 추가.
            CL_INSERT_UI.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, [oParam]);
            break;

        case "DRAG_DROP":
            //UI DRAG & DROP.
            CL_DRAG_DROP.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, oParam);
            break;

        case "CHANGE_OBJID":
            //UI 이름 변경.
            CL_CHANGE_OBJID.saveActionHistoryData(oWS_FRAME.__ACT_UNDO_HIST, oParam);
            break;
    
        default:
            //잘못된 ACTION CODE를 전달받았을때의 로직 처리.
            //(강제 오류 발생 처리등..)

    }


    console.warn("UNDO 이력");
    console.log(oWS_FRAME.__ACT_UNDO_HIST);

    console.warn("REDO 이력");
    console.log(oWS_FRAME.__ACT_REDO_HIST);

};



/*************************************************************
 * @module - UNDO, REDO의 이전 HISTORY 수행 처리.
 * @param PRCCD - (UNDO:실행취소, REDO:다시샐행)
 *************************************************************/
module.exports.executeHistory = function(PRCCD){

    parent.setBusy("X");

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);


    var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //208	디자인 화면에서 UI 변경 작업을 진행하고 있습니다.
    _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "208");

    //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);
    

    
    //이력 정보가 존재하지 않는경우 exit.
    if(typeof oWS_FRAME.__ACT_UNDO_HIST === "undefined" || 
        typeof oWS_FRAME.__ACT_REDO_HIST === "undefined"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
    }


    //UNDO, REDO 이력이 둘다 없다면 EXIT.
    if(oWS_FRAME.__ACT_UNDO_HIST.length === 0 && 
        oWS_FRAME.__ACT_REDO_HIST.length === 0){

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
            _sHist = oWS_FRAME.__ACT_UNDO_HIST.pop();

            //REDO history array.
            _sEventParam.T_HIST = oWS_FRAME.__ACT_REDO_HIST;

            break;

        case "REDO":
            //REDO의 마지막 이력 정보 얻기.
            _sHist = oWS_FRAME.__ACT_REDO_HIST.pop();

            //UNDO history array.
            _sEventParam.T_HIST = oWS_FRAME.__ACT_UNDO_HIST;
            
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
    
        default:
            //잘못된 ACTION CODE를 전달받았을때의 로직 처리.
            //(강제 오류 발생 처리등..)
        
    }


    console.warn("UNDO 이력");
    console.log(oWS_FRAME.__ACT_UNDO_HIST);

    console.warn("REDO 이력");
    console.log(oWS_FRAME.__ACT_REDO_HIST);


};




/*************************************************************
 * @class - INSERT UI 처리 CLASS.
 *************************************************************/
class CL_INSERT_UI{

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
        aTargetHist.push(_sSaveParam);


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

            var _sDesign = _sInsertData.S_DESIGN;

            
            //INSERT 처리 대상 UI의 부모 정보 얻기.
            var _sParent = oAPP.fn.getTreeData(_sDesign.POBID);

            if(typeof _sParent === "undefined"){
                //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
                parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);
                
                parent.setBusy("");

                return;
            }

            //부모 위치에 추가.
            _sParent.zTREE.splice(_sInsertData.BEFORE_POSIT, 0, _sDesign);


            //CHILD 정보의 UI INSTANCE 생성 처리.
            CL_INSERT_UI.createPreviewUI([_sDesign], _sInsertData.T_0015);

            //클라이언트 이벤트 원복 처리.
            oAPP.DATA.APPDATA.T_CEVT = oAPP.DATA.APPDATA.T_CEVT.concat(_sInsertData.T_CEVT);

            //desc 정보 원복 처리.
            oAPP.DATA.APPDATA.T_DESC = oAPP.DATA.APPDATA.T_CEVT.concat(_sInsertData.T_DESC);


            //현재 추가하고자 하는 aggregation만 필터링.
            var _aChild = _sParent.zTREE.filter( a => a.UIATK === _sDesign.UIATK );

            //해당 aggr에 추가될 UI의 INDEX 위치 확인.
            var _indx = _aChild.findIndex( item => item.OBJID === _sDesign.OBJID );


            //부모에 생성한 UI 추가.
            oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(_sDesign.OBJID, _sDesign.UILIB, _sDesign.POBID, 
                _sDesign.PUIOK, _sDesign.UIATT, _indx, _sDesign.ISMLB, _sDesign.UIOBK, true);

            
        }



        oAPP.attr.oModel.refresh();

        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();

    
        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);

        //라인 선택 처리.
        await oAPP.fn.setSelectTreeItem(_sDesign.OBJID);


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
            var _aT_0015 = CL_DELETE_UI.collect0015Data(_sDesign);
            

            //현재 UI가 부모의 몇번째 INDEX인지 확인.
            var _posit = oAPP.fn.getTreeIndexOfChild(_sDesign.OBJID);

            
            //desc 정보 수집 처리.
            var _aDESC = CL_DELETE_UI.collectDescData(_sDesign);


            //클라이언트 이벤트 수집 처리.
            var _aCEVT = CL_DELETE_UI.collectClientEventData(_aT_0015);
            

            var _sInsertData = {};

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
        aTargetHist.push(_sSaveParam);

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

            parent.showMessage(sap, 30, "I", _msg, async function(oEvent){

                parent.setBusy("X");

                resolve(oEvent);
            });

        });


        //삭제를 취소한 경우.
        if(_res !== "YES"){

            //이전 history에 다시 추가 처리. 
            switch (sEvent.PRCCD) {
                case "UNDO":
                    oWS_FRAME.__ACT_UNDO_HIST.push(oParam);
                    break;
            
                case "REDO":
                    oWS_FRAME.__ACT_REDO_HIST.push(oParam);
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


        //삭제 대상 UI의 부모 정보 수집 처리.
        var _aParent = CL_COMMON.collectParent(oParam.T_OBJID);


        //대상 UI에 onAfterRendering 이벤트 등록 처리.
        var _aPromise = CL_COMMON.attachOnAfterRendering(_aParent);


        for (let i = 0, l = oParam.T_OBJID.length; i < l; i++) {
            
            var _OBJID = oParam.T_OBJID[i];

            //전달받은 파라메터의 UI OBJECT ID에 해당하는 DESIGN TREE 라인 데이터 얻기.
            var ls_tree = oAPP.fn.getTreeData(_OBJID); 


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

                       
        }


        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();

        
        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();


        //미리보기 화면 변경 대기 처리.
        await Promise.all(_aPromise);
        
        
        //삭제 이후 이전 선택처리 정보 얻기.
        var l_prev = oAPP.fn.designGetPreviousTreeItem(ls_tree.OBJID);

        
        //삭제라인의 바로 윗 라인 선택 처리.
        await oAPP.fn.setSelectTreeItem(l_prev);

        
        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


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
            aT_0015 = CL_DELETE_UI.collect0015Data(_sChild, aT_0015);
            
        }

        return aT_0015;


    };


    /*************************************************************
     * @method - 삭제 대상 라인으로 부터 하위의 Desc 입력건 수집.
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
            aT_DESC = CL_DELETE_UI.collectDescData(_sChild, aT_DESC);
            
        }

        return aT_DESC;


    };



    /*************************************************************
     * @method - 삭제 대상 라인으로 부터 하위의 클라이언트 이벤트 수집.
     *************************************************************/
    static collectClientEventData = function(aATTR){

        var _aT_CEVT = [];

        //전제 수집된 클라이언트 이벤트가 없는경우 exit.
        if(oAPP.DATA.APPDATA.T_CEVT.length === 0){
            return _aT_CEVT;
        }
        

        for (let i = 0, l = aATTR.length; i < l; i++) {
            
            var _sATTR = aATTR[i];

            var _OBJID = _sATTR.OBJID + _sATTR.UIASN;

            var _sCEVT = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === _OBJID );

            if(typeof _sCEVT === "undefined"){
                continue;
            }

            _aT_CEVT.push(_sCEVT);

            
        }

        return _aT_CEVT;


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
            //파라메터가 없는경우에 대한 처리를 어떻게 가져갈지 판단 해야함.
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
        aTargetHist.push(_sParam);

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
        aTargetHist.push(_sParam);

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

        // busy off Lock off
        parent.setBusy("");
        

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
        

        _sDNDParam.S_DRAG          = JSON.parse(JSON.stringify(oParam.S_DRAG));

        _sDNDParam.BEFORE_DRAG_POS = oAPP.fn.getTreeIndexOfChild(oParam.S_DRAG.OBJID);

        _sDNDParam.S_DROP          = JSON.parse(JSON.stringify(oParam.S_DROP));

        _sDNDParam.BEFORE_DROP_POS = oAPP.fn.getTreeIndexOfChild(oParam.S_DROP.OBJID);

        //이력 저장 처리.
        aTargetHist.push(_sDNDParam);

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

        
        var _sParam = {};
        _sParam.S_DRAG = oAPP.fn.getTreeData(oParam.S_DRAG.OBJID)
        _sParam.S_DROP = oAPP.fn.getTreeData(oParam.S_DROP.OBJID);


        //이력 정보 저장 처리.
        CL_DRAG_DROP.saveActionHistoryData(sEvent.T_HIST, _sParam);


        //현재 UNDO, REDO 처리 프로세스 정보 파라메터 처리.
        var _sProcess = {
            PRCCD           : "UNDO_REDO",
            BEFORE_DRAG_POS : oParam.BEFORE_DRAG_POS
        };


        //DRAG, DROP의 부모가 같으면서 같은 AGGREGATION에 존재하는경우.
        if(oParam.S_DRAG.POBID === oParam.S_DROP.POBID && oParam.S_DRAG.UIATK === oParam.S_DROP.UIATK){

            //이전 위치로 이동 처리.
            oAPP.fn.drop_cb(undefined, _sParam.S_DRAG, _sParam.S_DROP, _sProcess);
            return;

        }


        //현재 라인 정보 얻기.
        var _sDesign = oAPP.fn.getTreeData(oParam.S_DRAG.OBJID);


        //현재 라인의 부모 정보 얻기.
        var _sParent = oAPP.fn.getTreeData(oParam.S_DRAG.POBID);

        
        var _s0023 = oAPP.DATA.LIB.T_0023.find( item => item.UIATK === oParam.S_DRAG.UIATK);


        //이전 위치로 이동 처리.
        oAPP.fn.drop_cb(_s0023, _sDesign, _sParent, _sProcess);


    };


};






/*************************************************************
 * @class - COMMON CLASS.
 *************************************************************/
class CL_COMMON{
        
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
        if(oWS_FRAME.__ACT_UNDO_HIST.length > 0){
            //undo 버튼 활성화.
            oAPP.attr.oModel.oData.designTree.undo = true;
        }


        //redo 이력이 존재하는 경우.
        if(oWS_FRAME.__ACT_REDO_HIST.length > 0){
            //redo 버튼 활성화.
            oAPP.attr.oModel.oData.designTree.redo = true;
        }

        
    };

};

