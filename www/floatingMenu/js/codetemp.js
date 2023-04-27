// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 ★★★★★★★★★★★★★★★★★★
let oAPP,
    GO_UI = {}, // 전체 UI 리스트
    GO_IF = {}, // 셀렉트 정보 |
    oSettingInfo = parent.WSUTIL.getWsSettingsInfo();

var xmlPath = oSettingInfo.SAP.abapEditorRoot;

// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 끝 ★★★★★★★★★★★★★★★★★★


oAPP = parent.parent.gfn_parent();

jQuery.sap.require("sap.m.MessageBox");

createUi();

function fn_get_item_types() { // 우측 모델 타입

    var S_ITEM                      = {};
    S_ITEM.VISIBLE                  = false;                    // 우측 상단 바 VISIBLE 여부
    S_ITEM.EDITABLE                 = false;                    // 우측 하단 영역 EDITABLE 여부
    S_ITEM.ICON                     = 'sap-icon://document';    // 우측 상단 바 ICON 텍스트
    S_ITEM.CONTENT                  = '';                       // 우측 하단 코드에디터 텍스트
    S_ITEM.DESC                     = '';                       // 우측 하단 인풋 텍스트
    S_ITEM.TITLE                    = '';                       // 우측 상단 텍스트

    return S_ITEM;

}

function fn_get_head_types() { // 좌측 모델 타입

    var S_HEAD                      = {};
    S_HEAD.KEY                      = '';                       // 좌측 해더 인풋 키
    S_HEAD.ORGKEY                   = '';                       // 좌측 해더 텍스트 키
    S_HEAD.EDIT                     = false;                    // 좌측 해더 편집 여부
    S_HEAD.SELECT                   = false;                    // 좌측 해더 행 선택 여부
    S_HEAD.EDITVIS                  = true;                     // 좌측 해더 편집 버튼 
    S_HEAD.DELVIS                   = true;                     // 좌측 해더 삭제 버튼
    S_HEAD.ICON                     = 'sap-icon://edit';        // 좌측 해더 수정 아이콘
    S_HEAD.VISIBLE                  = true;                     // 좌측 해더 텍스트 VISIBLE 여부
    S_HEAD.VISIBLE2                 = false;                    // 좌측 해더 인풋 VISIBLE 여부
    S_HEAD.ISFOCUS                  = false;                    // 좌측 해더 포커스 여부

    return S_HEAD;

};

function fn_get_xml_types() { // 수정이 될 xml의 데이터 타입

    var LS_HEADNODE                 = {};

    LS_HEADNODE.type                = 'element';
    LS_HEADNODE.name                = 'Expand';
    LS_HEADNODE.attributes          = {key: ''};
    LS_HEADNODE.elements            = [];

    // [수정] 여기 부분 다시    
    var LS_ITEM                     = {};
    LS_ITEM.name                    = '';
    LS_ITEM.type                    = 'element';
    LS_ITEM.elements                = [{type: 'text', text: ''}];

    var LS_ITEM2                    = {};
    LS_ITEM2.name                   = '';
    LS_ITEM2.type                   = 'element';
    LS_ITEM2.elements               = [{type: 'text', text: ''}];

    LS_HEADNODE.elements.push(LS_ITEM);
    LS_HEADNODE.elements.push(LS_ITEM2);

    return LS_HEADNODE;

};

// ★★★★★★★★★★★★★★★★★★ 신규 데이터 가져오기 ★★★★★★★★★★★★★★★★★★
function fn_REFRESH_HEAD () {
  
    //1. xml data 추출 
    let LS_DATA = oAPP.fs.readFileSync(xmlPath + "\\abap_user.xml" , 'utf8'),
        LO_DATA = JSON.parse(oAPP.convert.xml2json(LS_DATA));

        // 1. JSON이 있는지 먼저 확인

        // 1_1. 없으면 메세지 알림 => 리턴
        if(!LO_DATA) {
            return; //[추후] 메세지 처리
        };

        // 1_2. 있으면 제대로 왔는지 체크를

        let LT_XMLNODES = undefined;

        if(LO_DATA.elements) {
            
            LT_XMLNODES = LO_DATA.elements.find(a => a.type === "element" && a.elements !== undefined);

        };

        if(typeof LT_XMLNODES === 'undefined') {

            return;

        };

        let LT_EXPANDS = undefined;

        if(LT_XMLNODES.elements) {

            LT_EXPANDS = LT_XMLNODES.elements.find(a => a.name === "EXPANDS");

        };

        if(typeof LT_EXPANDS === 'undefined') {

            return;

        };

        let LO_EXPAND = undefined;

        if(LT_EXPANDS.elements) {

            LO_EXPAND = LT_EXPANDS.elements.filter(a => a.name === "Expand");

            let LS_EXPANDNODE = LO_EXPAND.find(a => a.elements),
            LS_DESC = LS_EXPANDNODE.elements.find(a => a.name === "Descr"),
            LS_TEXT = LS_EXPANDNODE.elements.find(a => a.name === "Text");

            if(!LS_DESC || !LS_TEXT) {
                return;
            };

        };

        if(typeof LO_EXPAND === 'undefined') {

            GO_UI.BUSYDILOG.close();

            GO_UI.PAGE.setBusy(false);

            LO_EXPAND = [];

            // return;

        };

     

        fn_DATA_HANDLING(LO_EXPAND);

}; 
// ★★★★★★★★★★★★★★★★★★ 신규 데이터 가져오기 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 데이터 분기 처리 ★★★★★★★★★★★★★★★★★★
function fn_DATA_HANDLING (LO_EXPAND) {

    //2. 해더 아이템 구성 
    let LO_MODEL                    = {};
        LO_MODEL.T_HEAD             = [],
        LO_MODEL.S_ITEM;
    
    if(LO_EXPAND.length > 0){

        for (let i = 0; i < LO_EXPAND.length; i++) {
    
            let LO_EXPANDNODE           = LO_EXPAND[i],
                LO_NODEKEY              = LO_EXPANDNODE.attributes.key,
                LO_DESCNODE             = LO_EXPAND[i].elements.find(a => a.name === 'Descr').elements,
                LO_TEXTNODE             = LO_EXPAND[i].elements.find(a => a.name === 'Text').elements,
                LV_DESC                 = '',
                LV_CONTENT              = '';
    
            if(LO_DESCNODE){
                LV_DESC                 = LO_DESCNODE[0].text;
            };
    
            if(LO_TEXTNODE){
                LV_CONTENT              = LO_TEXTNODE[0].text;
            };
            
            
            //1. 모델에 세팅할 oModel.T_HEAD <-- 라인 정보 구성
            var S_HEAD = fn_get_head_types();
            // var S_HEAD = {};
    
            // 키 값 세팅
            S_HEAD.KEY                  = LO_NODEKEY;   // 인풋 키
            S_HEAD.ORGKEY               = LO_NODEKEY;   // 텍스트 키
    
            //2. oModel.T_HEAD.S_ITEM <-- 우측에 삽입 될 데이터 구성
    
            S_HEAD.S_ITEM = {};
    
            S_HEAD.S_ITEM.DESC          = LV_DESC; 
            S_HEAD.S_ITEM.CONTENT       = LV_CONTENT; 
    
            LO_MODEL.T_HEAD.push(S_HEAD);
              
        };
        
    };




    LO_MODEL.S_ITEM = fn_get_item_types();


    LO_MODEL.S_ITEM.VISIBLE         = false; // 우측 상단 바 영역
    LO_MODEL.S_ITEM.EDITABLE        = false;
    LO_MODEL.S_ITEM.ICON            = 'sap-icon://document';
    LO_MODEL.S_ITEM.DESC            = '';
    LO_MODEL.S_ITEM.CONTENT         = '';
    LO_MODEL.S_ITEM.TITLE           = '';


    let oLPageModel = new sap.ui.model.json.JSONModel();

    // oModel <-- 데이터 세팅
    oLPageModel.setData(LO_MODEL);

    GO_UI.PAGE.setModel(oLPageModel);

    if(GO_UI.BUSYDILOG) {

        fn_UPDATE_AFTER();

        setTimeout(() => {

            GO_UI.BUSYDILOG.close();

            GO_UI.PAGE.setBusy(false);

            GO_IF = {};

        },500);
    };

};
// ★★★★★★★★★★★★★★★★★★ 데이터 분기 처리 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ watch 이후 ★★★★★★★★★★★★★★★★★★
function fn_UPDATE_AFTER () {

        let LO_MODELDATA                = GO_UI.PAGE.getModel().oData,
            LS_ITEM                     = LO_MODELDATA.S_ITEM,
            LO_SAVEBTN                  = sap.ui.getCore().byId('saveBtn');

        // 1. 이전 EDIT 여부
        if(GO_IF.EDIT) {

            let LS_EDITLINE             = LO_MODELDATA.T_HEAD.find(a => a.KEY === GO_IF.EDIT.KEY),
                LS_EDITIDX              = LO_MODELDATA.T_HEAD.findIndex(a => a.KEY === GO_IF.EDIT.KEY),
                LV_ROWCOUNT             = GO_UI.UITABLE.getProperty('visibleRowCount');

            if(LS_EDITLINE) {

                LS_EDITLINE.EDIT        = true;
                LS_EDITLINE.SELECT      = true;
                LS_EDITLINE.VISIBLE     = false;
                LS_EDITLINE.VISIBLE2    = true;
                LS_EDITLINE.ISFOCUS     = true;
                LS_EDITLINE.ICON        = 'sap-icon://decline';

                LS_ITEM.EDITABLE        = true;
                LS_ITEM.VISIBLE         = true;
                LS_ITEM.DESC            = LS_EDITLINE.S_ITEM.DESC;
                LS_ITEM.CONTENT         = LS_EDITLINE.S_ITEM.CONTENT;
                LS_ITEM.TITLE           = LS_EDITLINE.KEY;

                LO_SAVEBTN.setVisible(true);

                GO_UI.PAGE.getModel().refresh();

                GO_UI.UITABLE.setFirstVisibleRow(LS_EDITIDX);
        
    
                // EDIT라인 셀렉트
                GO_UI.UITABLE.setSelectedIndex(LS_EDITIDX);

                fn_FOCUS_INP();

                return;

            };

            GO_UI.UITABLE.setFirstVisibleRow(LS_EDITIDX);

            sap.m.MessageToast.show('name이 변경 되었습니다.', {
                duration: 1000,
                animationDuration: 500,
            });

        };

        // 2. 이전 SELECT 여부 
        if(GO_IF.SELECT) {

            let LS_SELECTLINE           = LO_MODELDATA.T_HEAD.find(a => a.KEY === GO_IF.SELECT.KEY),
                LS_SELECTIDX            = LO_MODELDATA.T_HEAD.findIndex(a => a.KEY === GO_IF.SELECT.KEY),
                LV_ROWCOUNT             = GO_UI.UITABLE.getProperty('visibleRowCount');

            if(LS_SELECTLINE) {

                LS_SELECTLINE.SELECT    = true;

                LS_ITEM.EDITABLE        = false;
                LS_ITEM.VISIBLE         = true;
                LS_ITEM.DESC            = LS_SELECTLINE.S_ITEM.DESC;
                LS_ITEM.CONTENT         = LS_SELECTLINE.S_ITEM.CONTENT;
                LS_ITEM.TITLE           = LS_SELECTLINE.KEY;

                GO_UI.PAGE.getModel().refresh();
                
                GO_UI.UITABLE.setFirstVisibleRow(LS_SELECTIDX);
    
                // EDIT라인 셀렉트
                GO_UI.UITABLE.setSelectedIndex(LS_SELECTIDX);

                return;

            };

            GO_UI.UITABLE.setFirstVisibleRow(LS_SELECTIDX);

            sap.m.MessageToast.show('name이 변경 되었습니다.', {
                duration: 1000,
                animationDuration: 500,
            });

        };

        LO_SAVEBTN.setVisible(false);

        GO_UI.UITABLE.setSelectedIndex(-1);

        GO_UI.NAVCONT.to(GO_UI.ILLUSTPAGE);

};
// ★★★★★★★★★★★★★★★★★★ watch 이후 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ SORT CHANGE ★★★★★★★★★★★★★★★★★★
function fn_CHANGE_SORT() {

    // (sort를 통한 로우 변경)

    let LT_HEADDATA         = GO_UI.PAGE.getModel().oData.T_HEAD,
        LV_ROWCOUNT         = GO_UI.UITABLE.getProperty('visibleRowCount');

    // 1. UI TABLE에 바인딩 되어있는 인덱스 값들 추출
    let LT_INDICES = GO_UI.UITABLE.getBinding().aIndices;

    // 2. 전체 모델에서 EDIT 여부 추출
    let LS_EDIT_LINE = LT_HEADDATA.find(a => a.EDIT === true);

    // 2_1. EDIT 라인이 있다면
    if(LS_EDIT_LINE) {

        let LS_EDIT_IDX = LT_HEADDATA.findIndex(a => a.EDIT === true);

        // 2_2. UI TABLE에 셀렉트 적용
        let LV_IDX = LT_INDICES.findIndex(a => a === LS_EDIT_IDX);

        GO_UI.UITABLE.setFirstVisibleRow(LV_IDX);

        fn_FOCUS_INP();

        GO_UI.UITABLE.setSelectedIndex(LV_IDX);

        GO_UI.UITABLE.detachRowsUpdated(fn_CHANGE_SORT);

        return;
    };

    // 3. 전체 모델에서 SELECT 여부 추출
    let LS_SELECT_LINE = LT_HEADDATA.find(a => a.SELECT === true);

    // 3_1. SELECT라인이 있다면
    if(LS_SELECT_LINE) {

        let LS_SELECT_IDX = LT_HEADDATA.findIndex(a => a.SELECT === true);

        // 3_2. UI TABLE에 셀렉트 적용
        let LV_IDX = LT_INDICES.findIndex(a => a === LS_SELECT_IDX);

        GO_UI.UITABLE.setFirstVisibleRow(LV_IDX);

        fn_FOCUS_INP();

        GO_UI.UITABLE.setSelectedIndex(LV_IDX);

        GO_UI.UITABLE.detachRowsUpdated(fn_CHANGE_SORT);

        return;
    };

};
// ★★★★★★★★★★★★★★★★★★ SORT CHANGE 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ EDIT INPUT FOCUS ★★★★★★★★★★★★★★★★★★
function fn_FOCUS_INP() {

    sap.ui.table.utils._HookUtils.register(GO_UI.UITABLE, sap.ui.table.utils._HookUtils.Keys.Signal, function(e) {

        setTimeout(() => {

            fn_SETTABLEINPFOCUS(e);

        },0);
    });

};
// ★★★★★★★★★★★★★★★★★★ EDIT INPUT FOCUS 끝 ★★★★★★★★★★★★★★★★★★

// [수정] 변수 명 변경
function fn_SETTABLEINPFOCUS(e){
	
    if(e !== "EndTableUpdate"){
        return;
    };

    sap.ui.table.utils._HookUtils.deregister(GO_UI.UITABLE, fn_SETTABLEINPFOCUS());

    var lt_row = GO_UI.UITABLE.getRows();           // UITABLE의 rows 추출

    if(lt_row.length === 0){return;}

    var l_row;

    for(var i=0, l=lt_row.length; i<l; i++){	

        var l_ctxt = lt_row[i].getBindingContext();
        if(!l_ctxt){continue;}

        var ls_head = l_ctxt.getProperty();
        
        if(!ls_head.ISFOCUS){continue;}

        l_row = lt_row[i];
        break;
        
    }

    if(!l_row){return;}
    
    var l_cell = l_row.getCells()[0];  // 포커스 인풋이 있는 HBOX
    
    if(!l_cell){return;}

    var lt_item = l_cell.getItems(); // HBOX 안에 TEXT 와 INPUT

    if(lt_item.length === 0){return;}

    var l_ui = fn_FOCUSUI(lt_item, ls_head);

    let LS_INTV = setInterval(()=>{

        if(l_ui.getAccessKeysFocusTarget()) {

            clearInterval(LS_INTV);

            l_inp = l_ui.getAccessKeysFocusTarget();

            l_inp.focus();
        };

    });


};


// [수정] 변수 명 변경
function fn_FOCUSUI(it_item, ls_head){

    if(it_item.length === 0){return;}
    if(!ls_head){return;}

    if(it_item.length === 0 || !ls_head){return;}

    for(var i=0, l=it_item.length; i<l; i++){

        var l_meta = it_item[i]?.getMetadata();
        if(!l_meta){continue;}

        // if(l_meta._sClassName === ls_head.focusUIName){
        if(l_meta._sClassName === "sap.m.Input"){

            return it_item[i];

        }

    };

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 클릭 ★★★★★★★★★★★★★★★★★★
// ACTNAME => 'U' => UPDATE, 'D' => DELETE, 'R' => ROW
function fn_CLICK_LIST (e, ACTNAME) {

    // 최초에 로딩
    GO_UI.PAGE.setBusy(true);

    switch (ACTNAME) {
        case 'D':
            fn_CLICK_DELBTN(e, ACTNAME);
        break;
    
        case 'R':
            fn_CLICK_ROW(e, ACTNAME);
        break;

        case 'U':
            fn_CLICK_EDITBTN(e, ACTNAME);
        break;
        
        default:
            //[크리티컬];
            console.error = '크리티컬 에러'
         break;
    };

    if(ACTNAME !== 'D') {

        GO_UI.NAVCONT.to(GO_UI.CONTENTPAGE);

    };


    GO_UI.PAGE.getModel().refresh();
    
    GO_UI.PAGE.setBusy(false);

};
// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ TYPE이 수정 버튼일 때 ★★★★★★★★★★★★★★★★★★
// e            => 클릭한 수정 버튼 리스트의 프로퍼티
// ACTCD        => 'U' => UPDATE, 'D' => DELETE, 'R' => ROW
function fn_CLICK_EDITBTN (e, ACTCD) {
  
    //(수정 및 조회 전환)  

    // 추가 버튼 비활성화
    GO_UI.ADDBTN.setBusyIndicatorDelay(0);
    GO_UI.ADDBTN.setBusy(true);

    // 좌측 리스트 비활성화 상태일 때 FLAG 값 false
    let LV_ISEDIT = false;

    //현재 라인에 수정 중인지 ? 
    //전체 모델에 EDIT 여부 값 추출  
    let LT_EDITLINE = GO_UI.PAGE.getModel().oData.T_HEAD.filter(a => a.EDIT === true);

    // 1. 현재 라인의 수정이 있다면
    if(LT_EDITLINE.length > 0 ) {
        LV_ISEDIT = true;

    };

    // 2. 현재 라인이 조회라면
    if(!LV_ISEDIT){
        fn_setItemData(e, ACTCD);

        return;
    };

    //해더 라인정보 추출 
    let LS_SELLINEDATA              = e.getSource().getBindingContext().getProperty(),
        LS_EDITLINE                 = GO_UI.PAGE.getModel().oData.T_HEAD.find(a => a.EDIT === true),
        LS_ITEM                     = GO_UI.PAGE.getModel().oData.S_ITEM;

    //1. 현재 작업중인 값 점검 - 수정 중일 경우 
    if(LS_EDITLINE.KEY === LS_SELLINEDATA.ORGKEY && LS_EDITLINE.KEY !== '') {

        let LO_SAVEBTN              = sap.ui.getCore().byId('saveBtn'),
            LT_HEADDATA         = GO_UI.PAGE.getModel().oData.T_HEAD,
            LS_EDITLINE         = LT_HEADDATA.filter(a => a.EDIT === true);
        
        // 조회로 바꾸기
        LS_SELLINEDATA.EDIT         = false;
        LS_SELLINEDATA.VISIBLE      = true;
        LS_SELLINEDATA.VISIBLE2     = false;
        LS_SELLINEDATA.ISFOCUS      = false;
        LS_SELLINEDATA.ICON         = 'sap-icon://edit';

        LS_ITEM.CONTENT             = LS_SELLINEDATA.S_ITEM.CONTENT;
        LS_ITEM.DESC                = LS_SELLINEDATA.S_ITEM.DESC;
        LS_ITEM.TITLE               = LS_SELLINEDATA.KEY;
        LS_ITEM.EDITABLE            = false;
        LS_ITEM.VISIBLE             = true;

        LO_SAVEBTN.setVisible(false);

        GO_UI.ADDBTN.setBusy(false);

        for(var idx = 0; idx < LS_EDITLINE.length; idx++) {
        
            for(var i = 0; i < LT_HEADDATA.length; i++) {
    
                if(LS_EDITLINE[idx].KEY !== LT_HEADDATA[i].KEY) {
                    
                    LT_HEADDATA[i].DELVIS = true;
    
                };
    
            };
    
        };

        return;

    };

    //1-2 현재 작업중인 라인이 수정여부 점검 후 
    //    질문팝업을 통해 이동처리 
    if(LV_ISEDIT === true) {

        fn_MSG_POPUP('C', '저장하지 않은 내용은 손실됩니다. 그래도 이동하시겠습니까?', (ACT) => {
            if(ACT !== "OK") {

                let LT_HEADDATA         = GO_UI.PAGE.getModel().oData.T_HEAD,   // 좌측 T_HEAD 데이터 추출
                    LV_EDITLINEIDX      = LT_HEADDATA.findIndex(a => a.EDIT === true),  // 전체 모델에 EDIT 인덱스 값 추출
                    LV_ROWCOUNT         = GO_UI.UITABLE.getProperty('visibleRowCount'); // visibleRowCount 값 추출

                // 수정 중인 라인이 테이블의 visibleRowCount보다 작을 때
                GO_UI.UITABLE.setFirstVisibleRow(LV_EDITLINEIDX);

                fn_FOCUS_INP();

                return;

            };

            // 현재 라인이 수정이라면
            // 이전의 우측영역에 바인딩 되어있던 데이터 패턴 제거
            delete GO_UI.PAGE.getModel().oData.S_ITEM;

            // LS_ITEM에 우측 데이터 패턴 추가
            let LS_ITEM = fn_get_item_types();

            GO_UI.PAGE.getModel().oData.S_ITEM = LS_ITEM;

            // 1. 전체 모델에서 EDIT 여부 추출
            let LT_EDITLINE = GO_UI.PAGE.getModel().oData.T_HEAD.find(a => a.EDIT === true);

            // 1_1. EDIT KEY 값 원복
            LT_EDITLINE.KEY             = LT_EDITLINE.ORGKEY;

            // 1_2. DESC 및 CONTENT 값 원복
            LS_ITEM.DESC                = LT_EDITLINE.S_ITEM.DESC;
            LS_ITEM.CONTENT             = LT_EDITLINE.S_ITEM.CONTENT;
            LS_ITEM.TITLE               = LT_EDITLINE.ORGKEY;
            LS_ITEM.VISIBLE             = true;

            // 1_3. EDIT 및 VISIBLE 초기화
            LT_EDITLINE.EDIT            = false;
            LT_EDITLINE.DELVIS          = false;
            LT_EDITLINE.VISIBLE         = true;
            LT_EDITLINE.VISIBLE2        = false;
            LT_EDITLINE.ISFOCUS         = false;
            LT_EDITLINE.ICON            = 'sap-icon://edit';

            // 1_4. 저장 버튼 VISIBLE 초기화
            let LO_SAVEBTN = sap.ui.getCore().byId('saveBtn');

            LO_SAVEBTN.setVisible(false);

            // 2. 클릭한 라인의 KEY 값이 이전 수정 라인의 KEY 값과 다르면
            if(LS_SELLINEDATA.ORGKEY !== LT_EDITLINE.ORGKEY) {

                LT_EDITLINE.SELECT          = false;

                LS_SELLINEDATA.EDIT         = true;
                LS_SELLINEDATA.DELVIS       = true;
                LS_SELLINEDATA.SELECT       = true;
                LS_SELLINEDATA.VISIBLE      = false;
                LS_SELLINEDATA.VISIBLE2     = true;
                LS_SELLINEDATA.ISFOCUS      = true;
                LS_SELLINEDATA.ICON         = 'sap-icon://decline';

                LS_ITEM.DESC                = LS_SELLINEDATA.S_ITEM.DESC;
                LS_ITEM.CONTENT             = LS_SELLINEDATA.S_ITEM.CONTENT;
                LS_ITEM.TITLE               = LS_SELLINEDATA.ORGKEY;
                LS_ITEM.EDITABLE            = true;

                LO_SAVEBTN.setVisible(true);
            };

            let LS_EDITLINEIDX = GO_UI.PAGE.getModel().oData.T_HEAD.findIndex(a => a.EDIT === true);

            // 좌측 해더 데이터의 EDIT값이 true인 라인이 없다면
            if(LS_EDITLINEIDX === -1) {

                LS_EDITLINEIDX = GO_UI.UITABLE.getSelectedIndex();

            };

            GO_UI.UITABLE.setSelectedIndex(LS_EDITLINEIDX);

            GO_UI.PAGE.getModel().refresh();
        });

    };


};
// ★★★★★★★★★★★★★★★★★★ TYPE이 수정 버튼일 때 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 우측 영역에 데이터 세팅 ★★★★★★★★★★★★★★★★★★
// e        => 이벤트가 발생한 오브젝트
// ACTCD    => U : EDIT BUTTON, R : ROW, D: DELETE
function fn_setItemData(e, ACTCD) {
    
    // 이전의 우측영역에 바인딩 되어있던 데이터 패턴 제거
    delete GO_UI.PAGE.getModel().oData.S_ITEM;

    let LS_ITEM                         = fn_get_item_types(), // LS_ITEM에 우측 모델 타입을 기준으로 구성
        LS_SELECTLINE                   = GO_UI.PAGE.getModel().oData.T_HEAD.find(a => a.SELECT === true),
        LS_SELLINEDATA                  = undefined;

    if(e.getSource().getBindingContext()) {

        LS_SELLINEDATA = e.getSource().getBindingContext().getProperty();

    } ;

    //상위에서 로직에서 얻지못햇다면..
    if(typeof LS_SELLINEDATA === "undefined") {

        LS_SELLINEDATA = e.getParameter('rowContext').getProperty();

    };


    switch (ACTCD) {
        case 'R': // 조회

        LS_ITEM.CONTENT                 = LS_SELLINEDATA.S_ITEM.CONTENT;
        LS_ITEM.DESC                    = LS_SELLINEDATA.S_ITEM.DESC;
        LS_ITEM.TITLE                   = LS_SELLINEDATA.KEY;
        LS_ITEM.EDITABLE                = false;
        LS_ITEM.VISIBLE                 = true;
            
        break;

        case 'U': // 수정 및 조회

        let LO_saveBtn = sap.ui.getCore().byId('saveBtn');

        if(LS_SELECTLINE) {
            
            LS_SELECTLINE.SELECT        = false;

        };


        LS_SELLINEDATA.EDIT             = true;
        LS_SELLINEDATA.SELECT           = true;
        LS_SELLINEDATA.VISIBLE          = false;
        LS_SELLINEDATA.VISIBLE2         = true;
        LS_SELLINEDATA.ISFOCUS          = true;
        LS_SELLINEDATA.ICON             = 'sap-icon://decline';

        LS_ITEM.CONTENT                 = LS_SELLINEDATA.S_ITEM.CONTENT;
        LS_ITEM.DESC                    = LS_SELLINEDATA.S_ITEM.DESC;
        LS_ITEM.TITLE                   = LS_SELLINEDATA.KEY;
        LS_ITEM.EDITABLE                = true;
        LS_ITEM.VISIBLE                 = true;

        LO_saveBtn.setVisible(true);

        GO_IF.EDITTING = true;

        break;
    
        default:
            console.error('크리티컬 에러');
        break;
    };

    let LT_HEADDATA         = GO_UI.PAGE.getModel().oData.T_HEAD,
        LT_INDICES          = GO_UI.UITABLE.getBinding().aIndices,
        LS_EDITLINEIDX      = LT_HEADDATA.findIndex(a => a.EDIT === true),
        LS_EDITLINE         = LT_HEADDATA.filter(a => a.EDIT === true),
        LV_IDX              = LT_INDICES.findIndex(a => a === LS_EDITLINEIDX);
    
    GO_UI.UITABLE.setSelectedIndex(LV_IDX);

    for(var idx = 0; idx < LS_EDITLINE.length; idx++) {
        
        for(var i = 0; i < LT_HEADDATA.length; i++) {

            if(LS_EDITLINE[idx].KEY !== LT_HEADDATA[i].KEY) {
                
                LT_HEADDATA[i].DELVIS = false;

            };

        };

    };

    GO_UI.PAGE.getModel().oData.S_ITEM = LS_ITEM;


};
// ★★★★★★★★★★★★★★★★★★ 우측 영역에 데이터 세팅 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ TYPE이 ROW일 때 ★★★★★★★★★★★★★★★★★★[수정]
// e        => 이벤트가 발생한 오브젝트
// ACTCD    => U : EDIT BUTTON, R : ROW, D: DELETE
function fn_CLICK_ROW (e, ACTCD) {
 
    // (조회)

    let LT_INDICES = GO_UI.UITABLE.getBinding().aIndices;

    if(GO_IF.EDITTING === true) {

        let LV_EDITLINEIDX      = GO_UI.PAGE.getModel().oData.T_HEAD.findIndex(a => a.EDIT === true),
            LV_IDX              = LT_INDICES.findIndex(a => a === LV_EDITLINEIDX);

        GO_UI.UITABLE.setSelectedIndex(LV_IDX);

        fn_FOCUS_INP();

        GO_IF.EDITTING = false;

        return;
    };

    let LT_HEADDATA             = GO_UI.PAGE.getModel().oData.T_HEAD,   // 좌측 T_HEAD 데이터 추출
        LS_SELLINEINFO          = e.getParameter('rowContext');         // 클릭한 라인 정보 추출

    if(!LS_SELLINEINFO) {
     
        return;
        
    };
    
    let LS_ROWDATA              = LS_SELLINEINFO.getProperty(),             // 클릭한 라인 속성 추출
        LS_EDITLINE             = LT_HEADDATA.filter(a => a.EDIT === true), // 전체 모델에 EDIT 여부 값 추출
        LS_EDITLINEDATA         = LS_EDITLINE.find(a => a);                 // EDIT라인의 데이터

    if(LS_EDITLINE.length > 0) {

        let LV_EDITLINEIDX      = LT_HEADDATA.findIndex(a => a.EDIT === true),  // 전체 모델에 EDIT 인덱스 값 추출
            LV_ROWCOUNT         = GO_UI.UITABLE.getProperty('visibleRowCount'), // visibleRowCount 값 추출
            LV_IDX              = LT_INDICES.findIndex(a => a === LV_EDITLINEIDX);

        GO_UI.UITABLE.setSelectedIndex(LV_IDX);

        if(LS_ROWDATA.KEY !== LS_EDITLINEDATA.KEY) {

            sap.m.MessageToast.show('편집 중 입니다.', {
                width: '30%',
                duration: 1000,
                animationDuration: 500,
                at: sap.ui.core.Popup.Dock.CenterCenter
            });

        };

        // 수정 중인 라인이 테이블의 visibleRowCount보다 작을 때
        GO_UI.UITABLE.setFirstVisibleRow(LV_IDX);

        fn_FOCUS_INP();

        return;
    };


    // 3. 클릭한 라인 정보 점검

    // LS_SELLINEDATA => 셀렉트가 된 라인의 바인딩 데이터
    let LS_SELLINEDATA = LT_HEADDATA.find(a => a.KEY === LS_ROWDATA.KEY);

    // 3_1. 현재 해더영역에 선택 한 라인이라면
    if(LS_SELLINEDATA.SELECT === true) {

        // LV_lineIdx => SELECT값이 true인 라인의 인덱스 값
        let LV_LINEIDX          = LT_HEADDATA.findIndex(a => a.SELECT === true),
            LV_IDX              = LT_INDICES.findIndex(a => a === LV_LINEIDX);

        GO_UI.UITABLE.setSelectedIndex(LV_IDX);

        return;
    };

    // 3_2. SELECT정보 초기화
    let LV_SELLINE = LT_HEADDATA.filter(a => a.SELECT === true);

    if(LV_SELLINE.length > 0) {

        for(var i = 0; i < LV_SELLINE.length; i++) {
            LV_SELLINE[i].SELECT = false;
        }

    };

    // 3_3. 셀렉트 된 라인이 없을 경우
    let LV_SELLINEIDX       = LT_HEADDATA.findIndex(a => a.KEY === LS_ROWDATA.KEY),
        LV_IDX              = LT_INDICES.findIndex(a => a === LV_SELLINEIDX);

    GO_UI.UITABLE.setSelectedIndex(LV_IDX);

    LS_SELLINEDATA.SELECT = true;



    // 4. 우측 영역 데이터, LT_EDITLINE 세팅
    fn_setItemData(e, ACTCD);

};
// ★★★★★★★★★★★★★★★★★★ TYPE이 ROW일 때 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ TYPE이 삭제 버튼일 때 ★★★★★★★★★★★★★★★★★★
function fn_CLICK_DELBTN (e, ACTNAME) {

    // (삭제)

    let LV_ISEDIT           = false,                                    // 1. FLAG 값 false => 좌측 비활성화
        LT_HEAD             = GO_UI.PAGE.getModel().oData.T_HEAD,       // 2. 좌측 T_HEAD 데이터 추출
        LS_EDITLINE         = LT_HEAD.filter(a => a.EDIT === true);     // 3. 전체 모델에서 EDIT 여부 추출

    if(LS_EDITLINE.length > 0) { // 편집중인 라인이 있다면

        LV_ISEDIT = true; // FLAG 값 true

    };

    let LS_DELLINEDATA = e.getSource().getBindingContext().getProperty(); // 4. 클릭한 라인 정보 추출

    // 5. EDIT 값이 true인 라인이 있으면
    if(LV_ISEDIT === true) {

        // 5_1. 삭제할 라인이 신규 이면
        if(LS_DELLINEDATA.NEW === true) {

            let LO_SAVEBTN = sap.ui.getCore().byId('saveBtn');

            LT_HEAD.splice(0,1);

            GO_UI.PAGE.getModel().refresh();

            GO_UI.NAVCONT.to(GO_UI.ILLUSTPAGE);

            GO_UI.ADDBTN.setBusy(false);

            GO_IF.DEL = true;

            LO_SAVEBTN.setVisible(false);

            return;
        };

        // 5_2. 삭제할 라인이 EDIT true라면 => 빠져나가~
    
    };


    // 6. 질문 팝업을 통해 삭제처리
    fn_MSG_POPUP("C", "삭제하시겠습니까?", (ACT) => {
                    
        if(ACT !== "OK") {return;};

        let LV_DELLINEIDX = LT_HEAD.findIndex(a => a.KEY === LS_DELLINEDATA.KEY); // 삭제 할 좌측 라인의 인덱스 값 추출

        LT_HEAD.splice(LV_DELLINEIDX,1);

        let LV_SELLINIDX = LT_HEAD.findIndex(a => a.SELECT === true); // 전체 모델에서 SELECT 여부 값 추출

        GO_UI.PAGE.getModel().refresh();
          
        if(LV_SELLINIDX === -1) {
            
            GO_UI.NAVCONT.to(GO_UI.ILLUSTPAGE);
            
        };

        // 저장 버튼 VISIBLE 초기화
        let LO_SAVEBTN = sap.ui.getCore().byId('saveBtn');

        LO_SAVEBTN.setVisible(false);
        
        GO_UI.UITABLE.setSelectedIndex(LV_SELLINIDX);

        GO_UI.ADDBTN.setBusy(false);

        GO_IF.DEL = true;

        fn_CLICK_SAVE();

    });   

};
// ★★★★★★★★★★★★★★★★★★ TYPE이 삭제 버튼일 때 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 추가 버튼 클릭 ★★★★★★★★★★★★★★★★★★
function fn_ADD_HEADITEM(e) {

    // (추가)

    GO_UI.ADDBTN.setBusyIndicatorDelay(0);
    GO_UI.ADDBTN.setBusy(true);

    // 1. 우측 영역 페이지 추출
    let LS_NAVCONTPAGE = GO_UI.NAVCONT.getCurrentPage();

    // 1_1. 우측 영역 페이지가 일러스트 페이지라면
    if(LS_NAVCONTPAGE.sId === 'noData') {
        
        fn_CREATE_HEADITEM();

        GO_UI.NAVCONT.to(GO_UI.CONTENTPAGE);

    };

    // 1_2. 우측 영역 페이지가 일러스트 페이지가 아니라면
    if(LS_NAVCONTPAGE.sId !== 'noData') {

        // 2. 전체 모델에서 EDIT 여부 추출
        let LT_EDITLINE = GO_UI.PAGE.getModel().oData.T_HEAD.filter(a => a.EDIT === true);
    
        // 2_2. EDIT가 없으면 해더 타입을 통해 신규 리스트 구성 => 신규 해더 데이터에 NEW 값 추가
        fn_CREATE_HEADITEM();

    };

    // 3. 셀렉트 여부 추출
    let LT_SELECTLINE = GO_UI.PAGE.getModel().oData.T_HEAD.filter(a => a.SELECT === true);

    if(LT_SELECTLINE.length > 0){

        for(var i = 0; i < LT_SELECTLINE.length; i++) {

            LT_SELECTLINE[i].SELECT = false;

        };

    };


    // 4. 우측 영역 데이터 추출
    let LS_ITEMDATA = GO_UI.PAGE.getModel().oData.S_ITEM;

    // 4_1. 우측 영역 신규 구성
    LS_ITEMDATA.VISIBLE             = true;
    LS_ITEMDATA.EDITABLE            = true;
    LS_ITEMDATA.TITLE               = '';
    LS_ITEMDATA.CONTENT             = '';
    LS_ITEMDATA.DESC                = '';
    LS_ITEMDATA.ICON                = 'sap-icon://add-document';

    // 5. 저장 버튼 활성화
    let LO_SAVEBTN = sap.ui.getCore().byId('saveBtn');

    LO_SAVEBTN.setVisible(true);

    // 6. 전체 모델 리프레시
    GO_UI.PAGE.getModel().refresh();

    // 7. 신규 영역으로 포커싱
    GO_UI.UITABLE.setFirstVisibleRow(0);
    GO_UI.UITABLE.setSelectedIndex(0);

};
// ★★★★★★★★★★★★★★★★★★ 추가 버튼 클릭 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 신규 리스트 생성 ★★★★★★★★★★★★★★★★★★
function fn_CREATE_HEADITEM() {

    // (신규 생성)

    // 1. 해더 모델 데이터 추출
    let LT_HEAD = GO_UI.PAGE.getModel().oData.T_HEAD;

    // 2. 해더 타입을 통해 신규 리스트 데이터 구성
    var S_HEAD                  = fn_get_head_types();
    S_HEAD.ICON                 = '';
    S_HEAD.EDIT                 = true;
    S_HEAD.SELECT               = true;
    S_HEAD.EDITVIS              = false;
    S_HEAD.VISIBLE              = false;
    S_HEAD.VISIBLE2             = true;
    S_HEAD.ISFOCUS              = true;
    S_HEAD.NEW                  = true;

    S_HEAD.S_ITEM               = {};

    S_HEAD.S_ITEM.DESC          = ''; 
    S_HEAD.S_ITEM.CONTENT       = '';

    // 3. 기존 해더 모델 데이터에 추가
    LT_HEAD.unshift(S_HEAD);

    GO_UI.PAGE.getModel().refresh();

};
// ★★★★★★★★★★★★★★★★★★ 신규 리스트 생성 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 저장 버튼 클릭 ★★★★★★★★★★★★★★★★★★
function fn_CLICK_SAVE(ACTNAME) {

    // (저장)

    let LS_MODELDATA        = GO_UI.PAGE.getModel().oData,              // 1. 전체 모델 데이터 추출
        LT_HEADDATA         = LS_MODELDATA.T_HEAD,                      // 1_1. 좌측 T_HEAD 데이터 추출
        LT_ITEMDATA         = LS_MODELDATA.S_ITEM,                      // 1_2. 우측 S_ITEM 데이터 추출
        LS_EDITLINE         = LT_HEADDATA.find(a => a.EDIT === true);   // 1_3. EDIT 여부 값 추출

    // 2. EDIT 중인 라인이 있다면
    if(LS_EDITLINE) {

        // 2-1. 현재 선택한 라인(작업중) 필수항목이 누락되었는지 점검
        if(LS_EDITLINE.KEY === '') {

            fn_MSG_POPUP("E", "Name은 필수 값 입니다.");
        
            return;
        
        };

        let LT_EDITNAME = LT_HEADDATA.filter(a => a.KEY === LS_EDITLINE.KEY);

        // if(LT_HEADDATA.find(a => a.ORGKEY === LS_EDITLINE.KEY)) {
        if(LT_EDITNAME.length > 1) {

            fn_MSG_POPUP("E", "Name이 중복되었습니다.");
        
            return;

        };

        // 2_2. 해더 수정된 데이터 체크
        if(LS_EDITLINE.KEY !== LS_EDITLINE.ORGKEY) {
    
            LS_EDITLINE.ORGKEY = LS_EDITLINE.KEY;
    
        };
    
        // 2_3. 아이템 수정된 데이터 체크
    
        // 2_3_1. DESC 값 비교
        if(LS_EDITLINE.S_ITEM.DESC !== LT_ITEMDATA.DESC) {
    
            LS_EDITLINE.S_ITEM.DESC = LT_ITEMDATA.DESC;
    
        };
    
        // 2_3_2. CONTENT 값 비교
        if(LS_EDITLINE.S_ITEM.CONTENT !== LT_ITEMDATA.CONTENT) {
    
            LS_EDITLINE.S_ITEM.CONTENT = LT_ITEMDATA.CONTENT;
    
        };

        let LO_SAVEBTN                  = sap.ui.getCore().byId('saveBtn');

            LS_EDITLINE.EDIT            = false;
            LS_EDITLINE.SELECT          = true;
            LS_EDITLINE.VISIBLE         = true;
            LS_EDITLINE.VISIBLE2        = false;

            LT_ITEMDATA.EDITABLE        = false;

            LO_SAVEBTN.setVisible(false);

    };

    // 4. XML에서 추출한 타입으로 새로운 데이터 구성
    fn_JSON_XML(LT_HEADDATA);

};
// ★★★★★★★★★★★★★★★★★★ 저장 버튼 클릭 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ XML에서 추출한 타입으로 새로운 데이터 구성 ★★★★★★★★★★★★★★★★★★
function fn_JSON_XML(T_HEAD) {

        let LT_XMLNODE = [];

        // 1. xml data 추출
        let LS_DATA = oAPP.fs.readFileSync(xmlPath + "\\abap_user.xml" , 'utf8'),
            LO_DATA = JSON.parse(oAPP.convert.xml2json(LS_DATA));


        let LT_XMLNODES = undefined;

        if(LO_DATA.elements) {
            
            LT_XMLNODES = LO_DATA.elements.find(a => a.type === "element" && a.elements !== undefined);

        };

        if(typeof LT_XMLNODES === 'undefined') {

            return;

        };

        let LT_EXPANDS = undefined;

        if(LT_XMLNODES.elements) {

            LT_EXPANDS = LT_XMLNODES.elements.find(a => a.name === "EXPANDS");

        };

        if(typeof LT_EXPANDS === 'undefined') {

            return;

        };

        let LO_EXPAND = undefined;

        if(LT_EXPANDS.elements) {

            LO_EXPAND = LT_EXPANDS.elements.filter(a => a.name === "Expand");

        };

        if(typeof LO_EXPAND === 'undefined') {
            // 최종적으로 에러 => [메세지: EX) 관리자에게 문의하세요]
            // return;
        };

        LT_EXPANDS.elements = [];
        
        // 1. 해더 데이터를 통해 Expand 구성
        for(var i = 0; i < T_HEAD.length; i++) {

            var LS_XMLNODE  = fn_get_xml_types();

            if(!LS_XMLNODE) {
                // [추후] 에러 메세지
                return;
            };

            LS_XMLNODE.attributes.key                   = T_HEAD[i].KEY;

            LS_XMLNODE.elements[0].elements[0].text     = T_HEAD[i].S_ITEM.DESC;

            LS_XMLNODE.elements[0].name                 = "Descr";

            LS_XMLNODE.elements[1].elements[0].text     = T_HEAD[i].S_ITEM.CONTENT;

            LS_XMLNODE.elements[1].name                 = "Text";
            

            LT_XMLNODE.push(LS_XMLNODE);
        
        };
    
        LT_EXPANDS.elements = LT_XMLNODE;

        // 2. XML 구조 구성

        let LV_STRDATA = JSON.stringify(LO_DATA);

        let LV_STRXML = oAPP.convert.json2xml(LV_STRDATA, {spaces: 4});

        oAPP.fs.writeFileSync(xmlPath + "\\abap_user.xml", LV_STRXML);

        GO_UI.ADDBTN.setBusy(false);

        sap.m.MessageToast.show('저장 되었습니다', {
            duration: 1000,
            animationDuration: 500,
            at: sap.ui.core.Popup.Dock.CenterCenter
        });

};
// ★★★★★★★★★★★★★★★★★★ XML에서 추출한 타입으로 새로운 데이터 구성 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ 팝업 관련 ★★★★★★★★★★★★★★★★★★
function fn_MSG_POPUP (TYPE, MTXT, CALLBACK) {

    let LV_MSGICON = '',
        LT_MSTACT = [],
        PRAM;

    switch (TYPE) {
        case "E": // name 필수 팝업

            LV_MSGICON = sap.m.MessageBox.Icon.ERROR;
            LT_MSTACT.push(sap.m.MessageBox.Action.CLOSE);

            break;

        case "C": // 저장 안됨 팝업

            LV_MSGICON = sap.m.MessageBox.Icon.WARNING;
            LT_MSTACT.push(sap.m.MessageBox.Action.OK);
            LT_MSTACT.push(sap.m.MessageBox.Action.NO);

            break;

        case "A":

            LV_MSGICON = sap.m.MessageBox.Icon.WARNING;
            LT_MSTACT.push(sap.m.MessageBox.Action.CLOSE);

            break;

    };
    // MTXT => 팝업 상태 글
    sap.m.MessageBox.show(MTXT, {
        icon: LV_MSGICON,
        actions: LT_MSTACT,
        onClose: (ACT) => {
        
            // 콜백 펑션 호출이 없을 경우 리턴
            if(!CALLBACK) {
                return;
            };

            // 콜백 펑션을 사용하는 경우 호출.
            CALLBACK(ACT);
            
        },
    });

};
// ★★★★★★★★★★★★★★★★★★ 팝업 관련 끝 ★★★★★★★★★★★★★★★★★★




// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 ★★★★★★★★★★★★★★★★★★
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    fn_REFRESH_HEAD();

    oAPP.WATCH = oAPP.fs.watch(xmlPath, { "recursive":true } ,async (a,b)=>{
       
        // 받아온 파라미터 값 중 b의 값이 'abap_user.xml' 아니라면 리턴
        if(b !== 'abap_user.xml'){return;};

        GO_UI.PAGE.setBusy(true);

        let LT_HEADDATA = GO_UI.PAGE.getModel().oData.T_HEAD;

        // 해당 경로에 abap_user.xml 파일이 있는지 체크
        let LV_FILEFIND = oAPP.fs.existsSync(`${xmlPath}\\abap_user.xml`); // 결과 값 true or false

        // 없다면? 크리티컬 오류 !!!!!!!
        if(LV_FILEFIND !== true) {

            fn_MSG_POPUP("E", "에러 메세지 추가해야함!!!!."); // [수정]
            // GO_UI.PAGE.setBusy(true);

            return;
        };

        // 전체 모델에서 SELECT 여부 추출
        let LS_SELECTLINE = LT_HEADDATA.find(a => a.SELECT === true);

        if(LS_SELECTLINE) {
            GO_IF.SELECT = LS_SELECTLINE;
        };

        // 전체 모델에서 EDIT 여부 추출
        let LS_EDITLINE = LT_HEADDATA.find(a => a.EDIT === true);

        if(LS_EDITLINE) {
            GO_IF.EDIT = LS_EDITLINE;
        }

        // 이전 해더 데이터값 저장
        GO_IF.HEAD_DATA = LT_HEADDATA;

        GO_UI.BUSYDILOG.open();

        fn_REFRESH_HEAD();
    
    }); 

    GO_UI.CONTENTPAGE.bindElement('/S_ITEM');

    GO_UI.PAGE.setBusy(false);


}; // fn_UIUPdated() END
// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 끝 ★★★★★★★★★★★★★★★★★★

// ★★★★★★★★★★★★★★★★★★ ui 생성 ★★★★★★★★★★★★★★★★★★
function createUi() {

    // UI가 다 생성이 되고나면 fn_UIUPdated를 실행
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    GO_UI.APP = new sap.m.App().addStyleClass('codeTempNoScrolling');

    GO_UI.PAGE = new sap.m.Page({
        busy: true,
        busyIndicatorDelay: 0,
        showHeader: false
    });

    GO_UI.SPLITTER = new sap.ui.layout.Splitter();

    // UI - 리스트 페이지
    GO_UI.LISTPAGE = new sap.m.Page({
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: '300px',
            minSize: 200
        })

    }).addStyleClass('listPage');

    // UI - 리스트 해더 바
    GO_UI.LISTBAR = new sap.m.Bar();

    // UI - 리스트 추가 버튼
    GO_UI.ADDBTN = new sap.m.Button({
        icon: "sap-icon://add",
        type: 'Emphasized',
        press: function(e) {
            fn_ADD_HEADITEM(e);
        }
    });

    // UI - 리스트 ui 테이블
    GO_UI.UITABLE = new sap.ui.table.Table({
        extension: [
            GO_UI.LISTBAR
        ],
        columns: new sap.ui.table.Column({
            width: '100%',
            minWidth: 80,
            label: new sap.m.Label({
                text: 'Name'
            }),
            sorted: true,
            sortProperty: 'KEY',
            template: new sap.m.HBox({
                items: [
                    new sap.m.Text({
                        text: '{ORGKEY}',
                        visible: '{VISIBLE}'
                    }),
                    new sap.m.Input({
                        value: '{KEY}',
                        visible: '{VISIBLE2}'
                    }).addStyleClass('selectInp')
                ]
            })
        }),
        rows: {
            path: '/T_HEAD'
        },
        rowActionTemplate: new sap.ui.table.RowAction({
            items: [
                new sap.ui.table.RowActionItem({
                    icon: "{ICON}",
                    type: 'Custom',
                    visible: "{EDITVIS}",
                    press: function(e) {
                        fn_CLICK_LIST(e, 'U');
                    }
                }),
                new sap.ui.table.RowActionItem({
                    icon: "sap-icon://delete",
                    type: 'Delete',
                    visible: "{DELVIS}",
                    press: function(e) {
                        fn_CLICK_LIST(e, 'D');
                    }
                })
            ]
        }).addStyleClass('actionBtn'),
        rowSelectionChange: function(e) {
            fn_CLICK_LIST(e, 'R');
        },
        sort: function() {
            GO_UI.UITABLE.attachRowsUpdated(fn_CHANGE_SORT);
        },
        rowHeight: 50,
        rowActionCount: 2,
        selectionMode: 'Single',
        selectionBehavior: 'Row',
        visibleRowCountMode: 'Auto',
        minAutoRowCount: 1
    });

    // 네비컨테이너
    GO_UI.NAVCONT = new sap.m.NavContainer({
        width: '100%',
        height: '100%',
        layoutData: new sap.ui.layout.SplitterLayoutData({
            minSize: 250
        })
    });

    GO_UI.ILLUSTPAGE = new sap.m.Page('noData',{
        showHeader: false,
    });

    GO_UI.ILLUSTMSG = new sap.m.IllustratedMessage({
        illustrationType: sap.m.IllustratedMessageType.EmptyList,
        title: '선택한 리스트가 없습니다',
        description: '왼쪽의 리스트를 클릭하시길 바랍니다.'
    }).addStyleClass('float_illustmsg');

    // 컨텐트 및 타이틀 페이지
    GO_UI.CONTENTPAGE = new sap.m.Page('item_page',{
        showHeader: false,
    });

    // 컨텐트 페이지 해더 바
    GO_UI.CONTENTBAR = new sap.m.Bar({
        contentRight: new sap.m.Button('saveBtn',{
            icon: 'sap-icon://save',
            type: sap.m.ButtonType.Emphasized,
            visible: false,
            press: function(e) {
                fn_CLICK_SAVE(e);
            }
        })
    });

    // 컨텐트 페이지 해더 바 좌측 텍스트라인
    GO_UI.DESCBOX = new sap.m.HBox({
        width: '200px',
        renderType: 'Bare',
        alignItems: 'Center',
        items: [
            new sap.ui.core.Icon({
                src: '{ICON}'
            }).addStyleClass('sapUiSmallMarginEnd'),
            new sap.m.Title({
                level: 'H1',
                text: '{TITLE}'
            }).addStyleClass('sapUiSmallMarginEnd'),
            // new sap.m.Title({
            //     level: 'H1',
            //     text: '{ACTIVE}'
            // })
        ],
        visible: '{VISIBLE}'
    });

    // 우측 인풋 영역 및 코드 에디터 VBOX
    GO_UI.RVBOX = new sap.m.VBox({
        renderType: 'Bare',
        height: 'calc(100% - 50px)'
    });

    // 라벨 및 인풋 영역 HBOX
    GO_UI.RHBOX = new sap.m.HBox({
        renderType: 'Bare',
        alignItems: 'Center',
        height: "50px",
        items: [
            new sap.m.Label({
                text: 'Description',
                width: '100px'
            })
        ]
    });

    // 디스크립션 인풋
    GO_UI.DESCINPUT = new sap.m.Input({
        editable: "{EDITABLE}",
        value: "{DESC}"
    });

    // 코드 에디터
    GO_UI.RCODEEDITOR = new sap.ui.codeeditor.CodeEditor({
        type: "abap",
        height: '100%',
        editable: "{EDITABLE}",
        value: "{CONTENT}",
    });


    GO_UI.BUSYDILOG = new sap.m.BusyDialog({
        text:'정보 업데이트 중...',
        customIconRotationSpeed: 1000,
    });

    
    GO_UI.RHBOX.addItem(GO_UI.DESCINPUT);
    GO_UI.RVBOX.addItem(GO_UI.RHBOX).addItem(GO_UI.RCODEEDITOR);
    GO_UI.CONTENTBAR.addContentLeft(GO_UI.DESCBOX);
    GO_UI.CONTENTPAGE.addContent(GO_UI.CONTENTBAR).addContent(GO_UI.RVBOX);
    GO_UI.ILLUSTPAGE.addContent(GO_UI.ILLUSTMSG);
    GO_UI.NAVCONT.addPage(GO_UI.ILLUSTPAGE).addPage(GO_UI.CONTENTPAGE);
    GO_UI.LISTBAR.addContentLeft(GO_UI.ADDBTN);
    GO_UI.LISTPAGE.addContent(GO_UI.UITABLE);
    GO_UI.SPLITTER.addContentArea(GO_UI.LISTPAGE).addContentArea(GO_UI.NAVCONT);
    GO_UI.PAGE.addContent(GO_UI.SPLITTER);
    GO_UI.APP.addPage(GO_UI.PAGE);
    GO_UI.APP.placeAt('content');

}; // createUi() END
// ★★★★★★★★★★★★★★★★★★ ui 생성 끝 ★★★★★★★★★★★★★★★★★★