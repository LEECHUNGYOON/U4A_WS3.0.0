// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 ★★★★★★★★★★★★★★★★★★
let oAPP,
    GLV_UI = {},
    GLV_FN = {},
    GLV_BINDATA = {},
    GLV_INFO = {},
    zoom = 1,
    ZOOM_SPEED = 0.1,
    GLV_ZOOM = '1';
    GLV_BINDATA.DELETEDATA = [],
    oSettingInfo = parent.WSUTIL.getWsSettingsInfo();

// var xmlPath = "C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor";
var xmlPath = oSettingInfo.SAP.abapEditorRoot;

oAPP = parent.parent.gfn_parent();

jQuery.sap.require("sap.m.MessageBox");

createUi();

// ★★★★★★★★★★★★★★★★★★ 펑션 ★★★★★★★★★★★★★★★★★★
// 데이터 체크하기
// => 너는 데이터만 가지고와서 정상적으로 있는지만 판단해
GLV_FN.CHECK_DATA = (oUPDLG) => {

    // 현재는 하드코딩 추 후 수정
    let data = oAPP.fs.readFileSync(xmlPath + "\\abap_user.xml" , 'utf8');
    let json = JSON.parse(oAPP.convert.xml2json(data));

    GLV_INFO.XMLVS = json.declaration.attributes.version;

    let eleDom = json.elements.filter(a => a.type === "element" && a.elements !== undefined)[0];

    if (eleDom) {

        let expDom = eleDom.elements.filter(a => a.name === "EXPANDS")[0];

        if (expDom !== undefined) {

            let expChDom = expDom.elements.filter(a => a.name === "Expand");
            let desDom = expDom.elements.filter(a => a.name === "Descr")[0];
            let txtDom = expDom.elements.filter(a => a.name === "Text")[0];

            if (expChDom && desDom === undefined && txtDom === undefined) {

                GLV_FN.DETACH_DATA(expChDom, oUPDLG);

            };

            return;

        };

        return;

    } else {

        return;

    };

};


// 데이터 분리하기RIGHTBARDATA
// => 너는 데이터를 영역에 맞게 나누기만 해
GLV_FN.DETACH_DATA = (expChDom, oUPDLG) => {

    GLV_BINDATA.KEYWORDDATA = [];
    GLV_BINDATA.ACTIVEDATA = [];

    for(var i = 0; i < expChDom.length; i++) {

        let keyDom = expChDom[i],
            nameKey = keyDom.attributes.key,
            oDscr = keyDom.elements.find(a => a.name === 'Descr'),
            oTxt = keyDom.elements.find(a => a.name === 'Text'),
            oDtxt = '',
            oTtxt = '';

            if(oDscr.elements !== undefined) {

                oDtxt = oDscr.elements.find(a => a.text).text;
        
            }; 
                
            if(oTxt.elements !== undefined) {
        
                oTtxt = oTxt.elements.find(a => a.text).text;
        
            };

        // 좌측 리스트 구성할 기본 데이터 틀
        let S_HEAD = {

            KEY: nameKey,
            ORGKEY: nameKey,
            EDIT: false,
            ICON:'sap-icon://edit',
            VISIBLE: true,
            VISIBLE2: false,
            S_ITEM: {
                CONTENT: oDtxt,
                TITLE: oTtxt
            },
            FN: function(){
                // KEY => 좌측 리스트의 텍스트 ==> 인풋 입력 시 변경
                // ORGKEY => 저장 하지 않을 때 원복하기 위해 필요한 원본 데이터
                // EDIT => 활성화 여부
                // ICON => 클릭 시 변경되는 수정 버튼
                // VISIBLE => 텍스트 UI에 대한 VISIBLE 값
                // VISIBLE2 => 인풋 UI에 대한 VISIBLE 값
                // S_ITEM => 해당 해더의 자식인 디스크립션과 텍스트
            }

        };

        GLV_BINDATA.KEYWORDDATA[i] = S_HEAD;

    };

    // 좌측 리스트 오름차순 정렬
    GLV_BINDATA.KEYWORDDATA = GLV_BINDATA.KEYWORDDATA.sort((a, b) => a.KEY > b.KEY ? 1 : -1);

    // 바 영역의 상태 텍스트 데이터 틀
    let activeTxt = {
        ICON: 'sap-icon://document',
        KEY: '',
        ACTIVE: 'DISPLAY',
        VISIBLE: false,
        S_ITEM: {
            CONTENT: "",
            TITLE: "",
            VISIBLE: false
        }
    };

    GLV_BINDATA.ACTIVEDATA = activeTxt;

    GLV_FN.DATASETTING(oUPDLG);

};


// 데이터 세팅
// => 넌 세팅만 해
GLV_FN.DATASETTING = (oUPDLG) => {

    let oLPageModel = new sap.ui.model.json.JSONModel();

    oLPageModel.setData({

        l_listData: GLV_BINDATA.KEYWORDDATA,
        r_activeData: GLV_BINDATA.ACTIVEDATA

    });

    GLV_UI.PAGE.setModel(oLPageModel);

    setTimeout(() => {

        if(oUPDLG !== undefined) {
    
            oUPDLG.close();
            GLV_FN.WATCH_DATA();
    
        };

    },1000);

};


// sap => 데이터 변경
GLV_FN.WATCH_DATA = () => {
    // GLV_BINDATA.HISTORYEDIT
    let selectIdx = GLV_UI.UITABLE.getSelectedIndex(),
        actdata = GLV_BINDATA.ACTIVEDATA;

    if(selectIdx === -1) {return;};

    GLV_FN.EDIT_CHECK();

    console.log(selectIdx);

    let selectProp = GLV_BINDATA.KEYWORDDATA[selectIdx];

    actdata.S_ITEM.CONTENT = selectProp.S_ITEM.CONTENT;
    actdata.S_ITEM.TITLE = selectProp.S_ITEM.TITLE;

    GLV_FN.BAR_TEXT(selectProp);

};


// sap => 활성화가 있는지
GLV_FN.EDIT_CHECK = () => {

    if(GLV_BINDATA.HISTORYEDIT === undefined) {return;};

    let editProp = GLV_BINDATA.KEYWORDDATA.find(a => a.KEY === GLV_BINDATA.HISTORYEDIT.KEY);
    
    GLV_FN.NAMEINPUTACTIVE(editProp);
};


// 좌측 리스트 클릭 펑션
GLV_FN.LIST_CLICK = (e) => {

    let ePram = e.getParameter('rowContext');

    if(ePram === null) {
        return;
    };

    let eIdx = e.getParameter('rowIndex'),
        eProp = ePram.getProperty(),
        slpth = ePram.sPath,
        ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty(),
        oEditing = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);

        // 활성화 상태가 있을 때
        if(oEditing !== undefined) {

            let oEditT = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);

            GLV_UI.UITABLE.setSelectedIndex(oEditT);

            return;

        } else if (GLV_INFO.SELECTIDX === slpth) { // 비활성화이지만 같은 리스트를 클릭
    
            GLV_UI.UITABLE.setSelectedIndex(eIdx);
    
            return;

        };

        rpageprop.S_ITEM.CONTENT = eProp.S_ITEM.CONTENT;
        rpageprop.S_ITEM.TITLE = eProp.S_ITEM.TITLE;

        GLV_INFO.SELECTIDX = slpth;

        GLV_FN.BAR_TEXT(eProp);

};


// 우측 바 영역 삽입 펑션
GLV_FN.BAR_TEXT = (eProp) => {

    let oActDes = GLV_UI.SELDESC,
    oActDesctxt = oActDes.getBindingContext(),
    oActPrp = oActDesctxt.getProperty(),
    oKeyData = GLV_BINDATA.KEYWORDDATA,
    oEditT = oKeyData.find(a => a.EDIT === true);

    // 활성화 상태가 없을 때
    if (oEditT === undefined) {

        oActPrp.ICON = 'sap-icon://document';
        oActPrp.VISIBLE = true;
        oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'DISPLAY';

    } else if (eProp.ORGKEY === '') { // 신규일때

        oActPrp.ICON = 'sap-icon://add-document';
        oActPrp.VISIBLE = true;
        oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'ACTIVE';

    } else {

        oActPrp.ICON = 'sap-icon://document';
        oActPrp.VISIBLE = true;
        oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'ACTIVE';

    };

    oActDes.getModel().setProperty("", oActPrp, oActDesctxt);

};


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 수정 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 좌측 수정 버튼 클릭
GLV_FN.EDITBTN_CLICK = (e) => {

    let eSource = e.getSource(),
        eBindContext = eSource.getBindingContext(),
        eProperty = eBindContext.getProperty(),
        oEditing = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);

        // 수정 중에 저장하지 않고 다른 수정 버튼 클릭 했을 때
        if(oEditing !== undefined && eProperty.EDIT === false) {

            GLV_FN.MESSAGE_POPUP('EDIT', 'OTHER', eProperty);

            return;

        };

        // 바인딩 된 프로퍼티 중 EDIT 상태
        switch(eProperty.EDIT) {
            
            case false:

                // 선택 리스트 활성화
                GLV_FN.NAMEINPUTACTIVE(eProperty);

            break;

            case true:

                // 저장 하지 않았을 때
                GLV_FN.CLOSENOSAVE(eProperty);

            break;

        };

        // 현재 활성화 상태에 따른 우측 텍스트 변경
        GLV_FN.BAR_TEXT(eProperty);

        eSource.getModel().setProperty("", eProperty, eBindContext);

};


// 수정 클릭 시 선택 라인 인풋 활성화
GLV_FN.NAMEINPUTACTIVE = (eProperty) => {

    // let selecIdx = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.KEY === eProperty.KEY);
    let selecIdx = GLV_BINDATA.KEYWORDDATA.findIndex(a => a === eProperty);

    // 해당 인덱스의 로우에 셀렉트 해준다.
    GLV_UI.UITABLE.setSelectedIndex(selecIdx);

    if(selecIdx === -1) {return;};

    // 현재 활성화 라인 프로퍼티 변경
    eProperty.EDIT = true;
    eProperty.VISIBLE = false;
    eProperty.VISIBLE2 = true;
    eProperty.ICON = 'sap-icon://decline';

    // 우측 영역 활성화
    GLV_FN.ACTIVEDESCTEXT(eProperty);

};


// 우측 영역 활성화
GLV_FN.ACTIVEDESCTEXT = () => {

    let ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty(),
        saveBtn = sap.ui.getCore().byId('saveBtn');

        rpageprop.VISIBLE = true;
        rpageprop.S_ITEM.VISIBLE = true;

        saveBtn.setVisible(true);

};


// 저장하지 않고 수정 버튼 닫을 때
GLV_FN.CLOSENOSAVE = (eProperty) => {

    // 수정 된 값이 없다
    if(eProperty.KEY === '') {

        let ACTIVE = 'NAME';

        GLV_FN.MESSAGE_POPUP(ACTIVE);

        return;

    } else if(eProperty.KEY === eProperty.ORGKEY) {

        GLV_FN.NAMEINPUTINACTIVE(eProperty);
            
        return;

    } else if(eProperty.ORGKEY === '') {

        GLV_BINDATA.KEYWORDDATA.shift();

        GLV_FN.NAMEINPUTACTIVE(eProperty);

        GLV_FN.BAR_TEXT(eProperty);

        GLV_UI.UITABLE.setSelectedIndex(-1);

    };

    GLV_FN.MESSAGE_POPUP('EDIT', 'SAME', eProperty);

};


// 수정 중인 해당 리스트 원복
GLV_FN.EDITLIST_RESET = (eProperty) => {

    let saveBtn = sap.ui.getCore().byId('saveBtn');

    eProperty.KEY = eProperty.ORGKEY;
    eProperty.EDIT = false;
    eProperty.VISIBLE = true;
    eProperty.VISIBLE2 = false;
    eProperty.ICON = 'sap-icon://edit';

    // 우측 저장 버튼 비활성화
    saveBtn.setVisible(false);

    // 우측 영역 비활성화
    GLV_FN.INACTIVEDESCTEXT();

    // 우측 상단 바 디스플레이 모드
    GLV_FN.BAR_TEXT(eProperty);

};


// 수정 라인 인풋 비활성화 => 너는 인풋 비활성화만 해
GLV_FN.NAMEINPUTINACTIVE = (eProperty) => {

    if(eProperty === undefined) {
        return;
    };

    // 현재 라인 프로퍼티 변경
    eProperty.EDIT = false;
    eProperty.VISIBLE = true;
    eProperty.VISIBLE2 = false;
    eProperty.ICON = 'sap-icon://edit';

    GLV_FN.INACTIVEDESCTEXT(eProperty);

};


// 수정 중 메세지 박스 OK 클릭
GLV_FN.EDITMESSBOXOK = (eProperty) => {

    let ui_rInp = GLV_UI.RHINPUT,
        rInpctxt = ui_rInp.getBindingContext(),
        rInprop = rInpctxt.getProperty(),
        oKeyData = GLV_BINDATA.KEYWORDDATA,
        oEditT = oKeyData.find(a => a.EDIT === true),
        selecIdx = oKeyData.findIndex(a => a.KEY === eProperty.KEY);

        if(oEditT.ORGKEY === '') {

            oKeyData.shift();

            GLV_FN.NAMEINPUTACTIVE(eProperty);

            GLV_FN.BAR_TEXT(eProperty);

            GLV_UI.UITABLE.setSelectedIndex(selecIdx);

            return;
        };

        // 이전 프로퍼티 변경
        oEditT.EDIT = false;
        oEditT.VISIBLE = true;
        oEditT.VISIBLE2 = false;
        oEditT.ICON = 'sap-icon://edit';

        GLV_FN.NOSAVE_DATARESET(oEditT);

        GLV_FN.NAMEINPUTACTIVE(eProperty);

        GLV_FN.BAR_TEXT(eProperty);

        ui_rInp.getModel().setProperty("", rInprop, rInpctxt);

};


// 우측 영역 비활성화
GLV_FN.INACTIVEDESCTEXT = (eProperty) => {

    let ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty(),
        saveBtn = sap.ui.getCore().byId('saveBtn');

        rpageprop.S_ITEM.VISIBLE = false;

        saveBtn.setVisible(false);

};


// 저장하지 않은 데이터 원복
GLV_FN.NOSAVE_DATARESET = (oEditT) => {

    // 좌측 리스트에 수정 된 값이 있을 때
    if(oEditT.KEY === oEditT.ORGKEY) {return;};

    oEditT.KEY = oEditT.ORGKEY;

};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 수정 관련 끝  ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 팝업 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 메세지 팝업
GLV_FN.MESSAGE_POPUP = (ACTION, C, P1, P2) => {
    
    switch (ACTION) {
        case 'NAME':
            sap.m.MessageBox.error('Name은 필수 값 입니다', {
                title: '중요',
                actions: [
                    sap.m.MessageBox.Action.OK
                ]
            });
        break;

        case 'EDIT':
            sap.m.MessageBox.confirm('저장하지 않은 내용은 삭제 됩니다', {
                title: "수정",
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CLOSE
                ],
                onClose: function(ACT) {
        
                    switch (ACT) {
                        case "OK":
                            GLV_FN.EDITE_POPUP(C, P1);
                        break;
                    }
                }
        
            });
        break;

        case 'ADD':
            sap.m.MessageBox.confirm('수정 중에는 추가할 수 없습니다.', {
                title: "수정",
                actions: [
                    sap.m.MessageBox.Action.CLOSE
                ]
            });
        break;

        case 'DELETE':
            sap.m.MessageBox.confirm('정말 삭제하시겠습니까?', {
                title: '삭제',
                actions: [
                    sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.NO
                ],
                onClose: function(ACTION) {
                    console.log(ACTION);
        
                    switch (ACTION) {
                        case "OK":
                            GLV_FN.LIST_DELETE(P1, P2);
                        break;
                    }
                }
    
            });
        break;

        case 'SAVE':
            sap.m.MessageToast.show('저장 되었습니다', {
                duration: 1500,
                animationDuration: 1500,
                at: sap.ui.core.Popup.Dock.CenterCenter
            });
        break;
    }

};


// EDITE 팝업 분류
GLV_FN.EDITE_POPUP = (C, P1) => {
    
    switch(C) {
        
        case 'SAME':
            GLV_FN.EDITLIST_RESET(P1);
        break;

        case 'OTHER':
            GLV_FN.EDITMESSBOXOK(P1);
        break;

    };

};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 팝업 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 추가 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 추가 => 버튼 클릭
GLV_FN.ADDBTN_CLICK = (e) => {

    let oKeyData = GLV_BINDATA.KEYWORDDATA,
        oEditT = oKeyData.find(a => a.EDIT === true);

        if(!oKeyData) {
            return;
        };

        if(Boolean(oEditT) === true) {

            GLV_FN.MESSAGE_POPUP('ADD');

            return;
        };

        GLV_FN.CREATE_LIST(oKeyData);

};


// 추가 => 신규 리스트 생성
GLV_FN.CREATE_LIST = (oKeyData) => {

    let ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty();

    let S_HEAD = {

        KEY: '',
        ORGKEY: '',
        EDIT: true,
        ICON: 'sap-icon://decline',
        VISIBLE: false,
        VISIBLE2: true,
        S_ITEM: {
            CONTENT: '',
            TITLE: ''
        }

    };

    oKeyData.unshift(S_HEAD);

    // 우측 영역 활성화
    GLV_FN.ACTIVEDESCTEXT();

    rpageprop.S_ITEM.CONTENT = '';
    rpageprop.S_ITEM.TITLE = '';

    GLV_FN.BAR_TEXT(S_HEAD);

    GLV_UI.UITABLE.setSelectedIndex(0);
    GLV_UI.UITABLE.setFirstVisibleRow(0);

};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 추가 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 삭제 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 삭제 => 버튼 클릭
GLV_FN.DELETEBTN_CLICK = (e) => {

    let eSource = e.getSource(),
        eBindContext = eSource.getBindingContext(),
        eProperty = eBindContext.getProperty(),
        ui_table = GLV_UI.UITABLE,
        getTableBinding = ui_table.getBinding("rows"),
        getTableContext = getTableBinding.getContexts(),
        eIdx = getTableContext.findIndex(a => a === eBindContext);

        GLV_FN.MESSAGE_POPUP('DELETE','', eSource, eIdx);

};


// 삭제 => 해당 리스트 제거
GLV_FN.LIST_DELETE = (eSource, eIdx) => {

    // *******************************
    //  eBindContext => 삭제 할 행의 바인드 컨텍스트
    //  eProperty => 삭제 할 행의 프로퍼티
    //  eIdx => 삭제 할 행의 인덱스 값
    // *******************************
    
    let eBindContext = eSource.getBindingContext(),
        eProperty = eBindContext.getProperty();
        
        // 삭제 리스트의 데이터를 DELETEDATA배열에 추가
        GLV_BINDATA.DELETEDATA.push(eProperty);

        GLV_FN.DELTE_EDITCHECK(eProperty, eIdx);
        
};


// 삭제 => 활성화 상태 체크
GLV_FN.DELTE_EDITCHECK = (eProperty, eIdx) => {

    // *******************************
    //  oKeyData => name 리스트의 데이터
    //  oEditT => 활성화가 되어있는 리스트
    //  oEditIdx => 활성화가 되어있는 리스트의 인덱스 값
    //  ui_rpage => 우측 페이지 UI
    //  rpagectxt => 우측 페이지 UI의 바인드 컨텍스트
    //  rpageprop => 우측 페이지 UI의 프로퍼티
    // *******************************

    let oKeyData = GLV_BINDATA.KEYWORDDATA,
        oEditT = oKeyData.find(a => a.EDIT === true);

        // 활성화 상태가 없다면
        if(oEditT === undefined) {

            GLV_FN.DELETE_NOACTIVE(eIdx);
            
        } else {

            // 활성화 상태가 있을 때
            GLV_FN.DELETE_ACTIVE(eProperty, oKeyData, eIdx);

        };

};


// 삭제 => 활성화 상태가 없을 때
GLV_FN.DELETE_NOACTIVE = (eIdx) => {

    let selecIdx = GLV_UI.UITABLE.getSelectedIndex(),
        ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty(),
        getRPageModel = ui_rpage.getModel();

    // 셀렉트 체크
    if(selecIdx === eIdx) {

        GLV_UI.UITABLE.setSelectedIndex(-1);

        rpageprop.VISIBLE = false;

        // Name 리스트에서 해당 삭제 데이터 제거
        GLV_BINDATA.KEYWORDDATA.splice(eIdx, 1);

        getRPageModel.setProperty("", rpageprop, rpagectxt);
        
        return;
    };

    // Name 리스트에서 해당 삭제 데이터 제거
    GLV_BINDATA.KEYWORDDATA.splice(eIdx, 1);
    
    getRPageModel.setProperty("", rpageprop, rpagectxt);

    GLV_UI.UITABLE.setSelectedIndex(selecIdx);

};


// 삭제 => 활성화 상태가 있을 때
GLV_FN.DELETE_ACTIVE = (eProperty, oKeyData, eIdx) => {

    let oEditT = oKeyData.find(a => a.EDIT === true),
        oEditIdx = oKeyData.findIndex(a => a.EDIT === true),
        ui_rpage = GLV_UI.RPAGE,
        rpagectxt = ui_rpage.getBindingContext(),
        rpageprop = rpagectxt.getProperty(),
        saveBtn = sap.ui.getCore().byId('saveBtn'),
        getRPageModel = ui_rpage.getModel();

    // 활성화 리스트가 삭제 리스트랑 같을 때
    if(eProperty === oEditT) {

        rpageprop.VISIBLE = false;

        rpageprop.S_ITEM.CONTENT = '';
        rpageprop.S_ITEM.TITLE = '';
        rpageprop.S_ITEM.VISIBLE = false;

        saveBtn.setVisible(false);

        // Name 리스트에서 해당 삭제 데이터 제거
        oKeyData.splice(eIdx, 1);

        getRPageModel.setProperty("", rpageprop, rpagectxt);

        GLV_UI.UITABLE.setSelectedIndex(-1);
        return;
    };

    // Name 리스트에서 해당 삭제 데이터 제거
    oKeyData.splice(eIdx, 1);

    // 활성화 리스트가 삭제 리스트가 다를 때
    getRPageModel.setProperty("", rpageprop, rpagectxt);

    GLV_UI.UITABLE.setSelectedIndex(oEditIdx);

};


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 삭제 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 저장 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 저장 => 버튼 클릭
GLV_FN.SAVEBTN_CLICK = (e) => {

    let oKeyData = GLV_BINDATA.KEYWORDDATA,
        oNoKey = oKeyData.find(a => a.KEY === ''),
        oEdit= oKeyData.find(a => a.EDIT === true);

        GLV_FN.SAVE_DESCTEXT(oEdit);

        switch(Boolean(oNoKey)) {
            case true:

                GLV_FN.MESSAGE_POPUP('NAME');

            break;

            case false:
                GLV_FN.SAVE_DATA(oKeyData);
            break;
        }

};


// 저장 => 디스크립션 및 텍스트 저장
GLV_FN.SAVE_DESCTEXT = (oEdit) => {

    let ACTDATA = GLV_BINDATA.ACTIVEDATA;

    oEdit.S_ITEM.CONTENT = ACTDATA.S_ITEM.CONTENT;
    oEdit.S_ITEM.TITLE = ACTDATA.S_ITEM.TITLE;

};


// 저장 => 데이터 저장
GLV_FN.SAVE_DATA = (oKeyData) => {

    let nXML = `<?xml version="${GLV_INFO.XMLVS}"?>\n`;
    nXML += '<?xml-stylesheet type="text/xsl" href="lang_user.xslt"?>\n';
    nXML += '<XMLConfigSettings>\n';
    nXML += '  <FILEINFO>\n';
    nXML += '      <Author>SAP</Author>\n      <Type>LangUser</Type>\n     <Language>ABAP</Language>\n     <Desc>User specific settings for ABAP</Desc>\n';
    nXML += '  </FILEINFO>\n';
    nXML += '  <EXPANDS>\n';

    for (var i = 0; i < oKeyData.length; i++) {
        nXML += `      <Expand key="${oKeyData[i].KEY}">\n`;
        nXML += `          <Descr>${oKeyData[i].S_ITEM.CONTENT}</Descr>\n`;
        nXML += `          <Text>${oKeyData[i].S_ITEM.TITLE}</Text>\n`;
        nXML += '      </Expand>\n';
    };

    nXML += '  </EXPANDS>\n';
    nXML += '</XMLConfigSettings>\n';

    oAPP.fs.writeFileSync(xmlPath + "\\abap_user.xml", nXML);

    GLV_FN.MESSAGE_POPUP('SAVE');

    // 저장 이후 
    GLV_FN.SAVE_AFTER();

};


// 저장 => 저장 이후
GLV_FN.SAVE_AFTER = () => {

    GLV_FN.SAVE_RESET();
    GLV_FN.SAVE_AFTERBAR();

};


// 저장 => 셀렉트 및 활성화 초기화
GLV_FN.SAVE_RESET = () => {

    let oEditBool = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);

        GLV_FN.NAMEINPUTINACTIVE(oEditBool);

        // GLV_UI.UITABLE.setSelectedIndex(-1);


};


// 저장 => 우측 바
GLV_FN.SAVE_AFTERBAR = () => {

    let oActDes = GLV_UI.SELDESC,
        oActDesctxt = oActDes.getBindingContext(),
        oActPrp = oActDesctxt.getProperty();

        oActPrp.ICON = 'sap-icon://document';
        oActPrp.ACTIVE = 'DISPLAY';

        oActDes.getModel().setProperty('', oActPrp, oActDesctxt);

        GLV_UI.UITABLE.setSelectedIndex(-1);

};

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 저장 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// RowActionItem 스타일 클래스 추가
GLV_FN.UITABLE_HOOKUITILS = (oEvent) => {

    if(oEvent !== "StartTableUpdate") {

        // debugger;
    }

};


// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 ★★★★★★★★★★★★★★★★★★
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    GLV_FN.CHECK_DATA();

    // let watchPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor';

    oAPP.WATCH = oAPP.fs.watch(xmlPath, { "recursive":true } ,async (a,b)=>{
       
        // 받아온 파라미터 값 중 b의 값이 'abap_user.xml' 아니라면 리턴
        if(b !== 'abap_user.xml'){return;};

        // 해당 경로에 abap_user.xml 파일이 있는지 체크
        let oFileFind = oAPP.fs.existsSync(`${xmlPath}\\abap_user.xml`);

        // 없다면?
        if(oFileFind !== true) {

            GLV_UI.PAGE.setBusy(true);

            return;
        };

        let oUPDLG = new sap.m.BusyDialog({
            text:'정보 업데이트 중...',
            customIconRotationSpeed: 1000
        });

        oUPDLG.open();

        GLV_BINDATA.HISTORYEDIT = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);

        // GLV_HISTORYDATA.SELECTLINE = GLV_UI.UITABLE.getSelectedIndex();

        GLV_FN.CHECK_DATA(oUPDLG);
    
    }); 

    GLV_UI.RPAGE.bindElement('/r_activeData');

    GLV_UI.RCODEEDITOR.addEventDelegate({

        // onAfterRendering: function(e) {
        //     GLV_FN.CODEEDITZOOM();
        // }

    });


    GLV_UI.PAGE.setBusy(false);

}; // fn_UIUPdated end


        //table에 hook 이벤트 추가. 
        sap.ui.table.utils._HookUtils.register(GLV_UI.UITABLE,  

            sap.ui.table.utils._HookUtils.Keys.Signal, function(oEvent){ 
          
                GLV_FN.UITABLE_HOOKUITILS(oEvent);
              //콜백 펑션 
          
        }); 


// ★★★★★★★★★★★★★★★★★★ ui 생성 ★★★★★★★★★★★★★★★★★★
function createUi() {

    // UI가 다 생성이 되고나면 fn_UIUPdated를 실행
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);


    // 1. APP 생성
    GLV_UI.APP = new sap.m.App().addStyleClass('codeTempNoScrolling');


    // 2. PAGE 생성
    GLV_UI.PAGE = new sap.m.Page({
        busy: true,
        busyIndicatorDelay: 0,
        showHeader: false

    });


    // 3. SPLITTER 생성
    GLV_UI.SPLITTER = new sap.ui.layout.Splitter();


    // 4. NAME LIST PAGE 생성
    GLV_UI.LPAGE = new sap.m.Page({
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: '300px',
            minSize: 80
        })

    }).addStyleClass('listPage');


    // 4_1. LIST PAGE BAR 생성
    GLV_UI.LHBAR = new sap.m.Bar();


    // 4_2. LIST PAGE BAR 추가 버튼 생성
    GLV_UI.LADDBTN = new sap.m.Button({
        icon: "sap-icon://add",
        type: sap.m.ButtonType.Emphasized,
        press: function(e) {
            GLV_FN.ADDBTN_CLICK(e);
        }
    });


    // 4_3. LIST PAGE UI TABLE 생성
    GLV_UI.UITABLE = new sap.ui.table.Table({
        extension: [
            GLV_UI.LHBAR
        ],
        columns: new sap.ui.table.Column({
            width: '100%',
            minWidth: 80,
            label: new sap.m.Label({
                text: 'Name'
            }),
            sorted: true,
            template: new sap.m.HBox({
                items: [
                    new sap.m.Text({
                        text: '{KEY}',
                        visible: '{VISIBLE}'
                    }),
                    new sap.m.Input({
                        value: '{KEY}',
                        visible: '{VISIBLE2}',
                        // change: function(e) {
                        //     GLV_FN.NAMEINPUTCHANGE(e);
                        // }
                    })
                ]
            })
        }),
        rows: {
            path: '/l_listData',
        },
        rowActionTemplate: new sap.ui.table.RowAction({
            items: [
                new sap.ui.table.RowActionItem({
                    icon: "{ICON}",
                    type: sap.ui.table.RowActionType.Custom,
                    press: function(e) {
                        GLV_FN.EDITBTN_CLICK(e);
                    }
                }),
                new sap.ui.table.RowActionItem({
                    icon: "sap-icon://delete",
                    type: sap.ui.table.RowActionType.Delete,
                    press: function(e) {
                        GLV_FN.DELETEBTN_CLICK(e);
                    }
                })
            ]
        }).addStyleClass('actionBtn'),
        rowSelectionChange: function(e) {
            GLV_FN.LIST_CLICK(e);
        },
        rowHeight: 50,
        rowActionCount: 2,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.Row,
        visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
        minAutoRowCount: 1
    });


    // 4_4. LIST PAGE ROWACTIONTEMPLATE 생성
    GLV_UI.ROWACTION = new sap.ui.table.RowAction();


    // 5. DESCRIPTION & TEXT PAGE 생성
    GLV_UI.RPAGE = new sap.m.Page({
        showHeader: false
    });


    // 5_1. DESCRIPTION & TEXT PAGE BAR 생성
    GLV_UI.RHBAR = new sap.m.Bar({
        contentRight: new sap.m.Button('saveBtn',{
            icon: 'sap-icon://save',
            type: sap.m.ButtonType.Emphasized,
            visible: false,
            press: function(e) {
                GLV_FN.SAVEBTN_CLICK(e);
            }
        })
    });


    // 5_2. DESCRIPTION & TEXT PAGE BAR LEFT CONTENT 생성
    GLV_UI.SELDESC = new sap.m.HBox({
        width: '200px',
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        items: [
            new sap.ui.core.Icon({
                src: '{ICON}'
            }).addStyleClass('sapUiTinyMarginEnd'),
            new sap.m.Title({
                level: sap.ui.core.TitleLevel.H1,
                text: '{KEY}'
            }).addStyleClass('sapUiSmallMarginEnd'),
            new sap.m.Title({
                level: sap.ui.core.TitleLevel.H1,
                text: '{ACTIVE}'
            })
        ],
        visible: '{VISIBLE}'
    });


    // 5_3. DESCRIPTION & TEXT PAGE VBOX 생성
    GLV_UI.RVBOX = new sap.m.VBox({
        renderType: sap.m.FlexRendertype.Bare,
        height: 'calc(100% - 50px)'
    });


    // 5_4. DESCRIPTION & TEXT PAGE HBOX 생성
    GLV_UI.RHBOX = new sap.m.HBox({
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        height: "50px"
    });


    // 5_5. DESCRIPTION & TEXT PAGE HBOX LABEL 생성
    GLV_UI.RHLABEL = new sap.m.Label({
        text: 'Description',
        width: '100px'
    });


    // 5_6. DESCRIPTION & TEXT PAGE HBOX INPUT 생성
    GLV_UI.RHINPUT = new sap.m.Input({
        editable: "{/r_activeData/S_ITEM/VISIBLE}",
        value: "{/r_activeData/S_ITEM/CONTENT}",
        // change: function(e) {
        //     GLV_FN.DESCINPUTCHANGE(e);
        // }
    });


    // 5_6. DESCRIPTION & TEXT PAGE CODEEDITOR 생성
    GLV_UI.RCODEEDITOR = new sap.ui.codeeditor.CodeEditor({
        type: "abap",
        height: '100%',
        editable: "{/r_activeData/S_ITEM/VISIBLE}",
        value: "{/r_activeData/S_ITEM/TITLE}",
        // change: function(e) {
        //     GLV_FN.CODEEDITORCHANGE(e);
        // }
    }).attachBrowserEvent('wheel', function(e) {
        let codDom = GLV_UI.RCODEEDITOR.getDomRef();

        if (e.ctrlKey === true) {
            if (e.originalEvent.deltaY > 0) {
                if (codDom.style.zoom === '1') {
                    return;
                }
                codDom.style.zoom = (zoom -= ZOOM_SPEED);
            } else {
                codDom.style.zoom = (zoom += ZOOM_SPEED);
            }

            GLV_ZOOM = codDom.style.zoom;
            return;
        };
    });

    GLV_UI.LHBAR.addContentLeft(GLV_UI.LADDBTN);
    // GLV_UI.LPAGE.addContent(GLV_UI.LHBAR).addContent(GLV_UI.UITABLE);
    GLV_UI.LPAGE.addContent(GLV_UI.UITABLE);
    GLV_UI.RHBOX.addItem(GLV_UI.RHLABEL).addItem(GLV_UI.RHINPUT);
    GLV_UI.RVBOX.addItem(GLV_UI.RHBOX).addItem(GLV_UI.RCODEEDITOR);
    GLV_UI.RHBAR.addContentLeft(GLV_UI.SELDESC);
    GLV_UI.RPAGE.addContent(GLV_UI.RHBAR).addContent(GLV_UI.RVBOX);
    GLV_UI.SPLITTER.addContentArea(GLV_UI.LPAGE).addContentArea(GLV_UI.RPAGE)
    GLV_UI.PAGE.addContent(GLV_UI.SPLITTER);
    GLV_UI.APP.addPage(GLV_UI.PAGE);
    GLV_UI.APP.placeAt('content');
}; // createUi end