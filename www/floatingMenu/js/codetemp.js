// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 ★★★★★★★★★★★★★★★★★★
let oAPP,
    GLV_UI = {},
    GLV_FN = {},
    GLV_T_ORIGINALDATA = [],
    GLV_BINDATA = {},
    GLV_OLDDATA = {},
    GLV_DATACHECK = {},
    GLV_NEWDATA = {},
    GLV_DELETEDATA = [],
    ROWIDX = '',
    zoom = 1,
    ZOOM_SPEED = 0.1,
    GLV_ZOOM = '1',
    XMLVS = '',
    GLV_CHDATA = [],
    GLV_SELECT = '',
    GLV_UPDTSELECT = '',
    GLV_UPIDX = '';


oAPP = parent.parent.gfn_parent();

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

// 바인딩 데이터 펑션
BINDING_DATA();

createUi();

// ★★★★★★★★★★★★★★★★★★ 바인딩 데이터 ★★★★★★★★★★★★★★★★★★
function BINDING_DATA() {

    GLV_BINDATA.SAVECANCLE = [{
        ICON: "sap-icon://save",
        TYPE: sap.m.ButtonType.Emphasized,
        ACTIVE: false,
        VISIBLE: false,
        KEY: "SAVE",
        ID: "SAVE"
    }, ];

    GLV_BINDATA.SELECTDESC = {
        ICON: 'sap-icon://document',
        KEY: '',
        ACTIVE: 'DISPLAY',
        VISIBLE: false
    };
};

// ★★★★★★★★★★★★★★★★★★ abap user.xml 데이터 체크 ★★★★★★★★★★★★★★★★★★
function CODETEMP_DATA(UPDATE) {

    // debugger;

    // let data = oAPP.fs.readFileSync("C:\\temp\\ELECTRON\\FloatingMenu\\v22\\www\\floatingMenu\\ABAP Editor\\abap_user1.xml", 'utf8');
    let data = oAPP.fs.readFileSync("C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml" , 'utf8');
    let json = JSON.parse(oAPP.convert.xml2json(data));

    XMLVS = json.declaration.attributes.version;

    // 테스트 중 변수 변경
    let eleDom = json.elements.filter(a => a.type === "element" && a.elements !== undefined)[0];

    if (eleDom) {

        let expDom = eleDom.elements.filter(a => a.name === "EXPANDS")[0];

        if (expDom !== undefined) {

            let expChDom = expDom.elements.filter(a => a.name === "Expand");
            let desDom = expDom.elements.filter(a => a.name === "Descr")[0];
            let txtDom = expDom.elements.filter(a => a.name === "Text")[0];

            if (expChDom && desDom === undefined && txtDom === undefined) {

                GET_DATA(expChDom, UPDATE);

            };

            return;

        };

        return;

    } else {

        return;

    }

};

// ★★★★★★★★★★★★★★★★★★ abap user.xml 데이터 가져오기 ★★★★★★★★★★★★★★★★★★
function GET_DATA(expChDom, UPDATE) { 

    // SAP 쪽에서 수정이 있을 때
    if(GLV_BINDATA.ALLDATA && UPDATE) {

        GLV_FN.ABAPCHANGE(expChDom);

    } else if(GLV_BINDATA.RECENTDATA) {

        SAVENEWDATA(expChDom);
        
        GLV_FN.DATASETTING(UPDATE);

        return;
    };


    // 좌측 리스트 데이터
    KEYLISTDATA(expChDom);

    // 우측 디스크립션 데이터
    DESCDATA();

    // 전체 데이터
    GET_ALLDATA(expChDom);

    GLV_FN.DATASETTING(UPDATE);

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 데이터 ★★★★★★★★★★★★★★★★★★
function KEYLISTDATA(expChDom) {

    GLV_BINDATA.KEYWORDDATA = [];

    for (var i = 0; i < expChDom.length; i++) {
        let oKey = expChDom[i].attributes.key;

        let keywordKey = {
            KEY: oKey,
            EDIT: false,
            ICON: 'sap-icon://edit',
            VISIBLE: true,
            VISIBLE2: false,
            INUM: i,
            MODF: '',
            ORGKEY: oKey,
            NEW: ''
        };

        GLV_BINDATA.KEYWORDDATA[i] = keywordKey;

    };

};

// ★★★★★★★★★★★★★★★★★★ 우측 디스크립션 데이터 ★★★★★★★★★★★★★★★★★★
function DESCDATA() {

    let descData = {
        KEY: '',
        DESC: '',
        TEXT: '',
        EDIT: false,
        VISIBLE: false
    };

    GLV_BINDATA.DESCRDATA = descData;

};

// ★★★★★★★★★★★★★★★★★★ 전체 데이터 ★★★★★★★★★★★★★★★★★★
function GET_ALLDATA(expChDom) {

    GLV_BINDATA.ALLDATA = [];

    for (var i = 0; i < expChDom.length; i++) {

        let oDscr = expChDom[i].elements.find(a => a.name === 'Descr'),
            oTxt = expChDom[i].elements.find(a => a.name === 'Text'),
            oDtxt = '',
            oTtxt = '';

        if(oDscr.elements !== undefined) {

            oDtxt = oDscr.elements.find(a => a.text).text;
    
        }; 
            
        if(oTxt.elements !== undefined) {
    
            oTtxt = oTxt.elements.find(a => a.text).text;
    
        };

        let allDATA = {
            KEY: expChDom[i].attributes.key,
            DESC: oDtxt,
            TEXT: oTtxt,
            INUM: i,
            MODF: '',
            ORGKEY: expChDom[i].attributes.key,
            NEW: ''
        };

        GLV_BINDATA.ALLDATA[i] = allDATA;

    };

};

// ★★★★★★★★★★★★★★★★★★ 저장 시 새로 받아온 신규 데이터가 있다면 ★★★★★★★★★★★★★★★★★★
function SAVENEWDATA(expChDom) {

    for (var i = 0; i < expChDom.length; i++) {

        let oDscr = expChDom[i].elements.find(a => a.name === 'Descr'),
            oTxt = expChDom[i].elements.find(a => a.name === 'Text'),
            oDtxt = '',
            oTtxt = '';

        if(oDscr.elements !== undefined) {

            oDtxt = oDscr.elements.find(a => a.text).text;
    
        }; 
            
        if(oTxt.elements !== undefined) {
    
            oTtxt = oTxt.elements.find(a => a.text).text;
    
        };

        let oRecentDATA = {
            KEY: expChDom[i].attributes.key,
            DESC: oDtxt,
            TEXT: oTtxt,
        };

        GLV_BINDATA.RECENTDATA[i] = oRecentDATA;

    }

};

// ★★★★★★★★★★★★★★★★★★ JSONModel에 데이터 새팅 ★★★★★★★★★★★★★★★★★★
GLV_FN.DATASETTING = (UPDATE) => {

    let oLPageModel = new sap.ui.model.json.JSONModel();

    oLPageModel.setData({

        l_listData: GLV_BINDATA.KEYWORDDATA,
        r_btnDaTA: GLV_BINDATA.SAVECANCLE,
        r_editData: GLV_BINDATA.DESCRDATA,
        r_selectDesc: GLV_BINDATA.SELECTDESC

    });

    GLV_UI.PAGE.setModel(oLPageModel);

    GLV_UI.UITABLE.bindRows('/l_listData');

    GLV_UI.UITABLE.getColumns()[0].setTemplate(new sap.m.HBox({
        items: [
            new sap.m.Text({
                text: '{KEY}',
                visible: '{VISIBLE}'
            }),
            new sap.m.Input({
                value: '{KEY}',
                visible: '{VISIBLE2}',
                // valueState: '{VSTATE}',
                change: function(e) {
                    GLV_FN.KEYINPUTCHANGE(e);
                }
            })
        ]
    }));

    setTimeout(() => {

        if(UPDATE !== undefined) {
            UPDATE.close();
        }
        
    },1000);

};

// ★★★★★★★★★★★★★★★★★★ ABAP쪽에서 수정이 있을 때 ★★★★★★★★★★★★★★★★★★
GLV_FN.ABAPCHANGE = (expChDom) => {

    GLV_T_ORIGINALDATA = GLV_BINDATA.ALLDATA;
    GLV_BINDATA.CHANGEDATA = [];

    for(var i = 0; i < expChDom.length; i++) {

        let oDscr = expChDom[i].elements.find(a => a.name === 'Descr'),
            oTxt = expChDom[i].elements.find(a => a.name === 'Text'),
            oDtxt = '',
            oTtxt = '';

        if(oDscr.elements !== undefined) {

            oDtxt = oDscr.elements.find(a => a.text).text;
    
        }; 
            
        if(oTxt.elements !== undefined) {
    
            oTtxt = oTxt.elements.find(a => a.text).text;
    
        };

        let changeDATA = {
            KEY: expChDom[i].attributes.key,
            DESC: oDtxt,
            TEXT: oTtxt,
            INUM: i,
            MODF: '',
            ORGKEY: expChDom[i].attributes.key,
            NEW: ''
        };

        GLV_BINDATA.CHANGEDATA[i] = changeDATA;

    };

    GLV_FN.COMPAREDATA();
    // debugger;

};

// ★★★★★★★★★★★★★★★★★★ 수정된 데이터와 기존 데이터 비교 ★★★★★★★★★★★★★★★★★★
GLV_FN.COMPAREDATA = () => {

    for(var i = 0; i < GLV_BINDATA.ALLDATA.length; i++) {

        // debugger;

        let chKey = GLV_BINDATA.CHANGEDATA.filter(a => a.KEY === GLV_BINDATA.ALLDATA[i].KEY),
            chDesc = GLV_BINDATA.CHANGEDATA.filter(a => a.DESC === GLV_BINDATA.ALLDATA[i].DESC),        
            chText = GLV_BINDATA.CHANGEDATA.filter(a => a.TEXT === GLV_BINDATA.ALLDATA[i].TEXT);        

        if(chKey.length === 0) { // 키 값이 수정

            var a = {
                KEY: 'KEY',
                DATA: GLV_BINDATA.ALLDATA[i]
            };

            GLV_FN.CHANGEIDX(a);

        } else if (chDesc.length === 0) { // 디스크립션 수정

            var a = {
                KEY: 'DESC',
                DATA: GLV_BINDATA.ALLDATA[i]
            };

            GLV_FN.CHANGEIDX(a);
            
        } else if (chText.length === 0) { // 코드 에디터 텍스트 수정

            var a = {
                KEY: 'TEXT',
                DATA: GLV_BINDATA.ALLDATA[i]
            };

            GLV_FN.CHANGEIDX(a);

        };

    };

};

// ★★★★★★★★★★★★★★★★★★ 바뀐 데이터 인덱스 값 얻기 ★★★★★★★★★★★★★★★★★★
GLV_FN.CHANGEIDX = (oParams) => {

    // debugger;

    if(oParams === undefined) {

        return;

    };

    GLV_UPIDX = oParams.DATA;

};


// ★★★★★★★★★★★★★★★★★★ 펑션 ★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ★★★★★★★★★★★★★★★★★★ 좌측 비활성화 리스트 클릭 ★★★★★★★★★★★★★★★★★★
GLV_FN.KEYWORDCLICK = (e) => {

    let ePram = e.getParameter('rowContext'),
    // let eIdx = GLV_UI.UITABLE.getSelectedIndex(),
    //     ePram = GLV_UI.UITABLE.getRows()[eIdx].getBindingContext(),
        eIdx = e.getParameter('rowIndex'),
        codDom = GLV_UI.RCODEEDITOR.getDomRef(),
        codZoom = codDom.style.zoom;

        GLV_SELECT = eIdx;
        GLV_UPDTSELECT = eIdx;

    if (ePram === null) {

        return;

    };

    // 클릭한 리스트 프로퍼티
    let eProp = ePram.getProperty(),

        slpth = ePram.sPath,

        // 디스크립션 인풋
        oDipt = GLV_UI.RHINPUT,

        // 디스크립션 바인딩 컨텍스트
        oDiptctxt = oDipt.getBindingContext(),

        // 디스크립션 바인딩 프로퍼티
        oDiptPrp = oDiptctxt.getProperty(),

        // 왼쪽 리스트의 바인딩 데이터 중 VISIBLE2가 true같은 요소가 있는 지
        oEditBool = GLV_BINDATA.KEYWORDDATA.find(a => a.VISIBLE2 === true),

        oRData = GLV_BINDATA.ALLDATA.find(a => a.KEY === eProp.KEY && a.INUM === eProp.INUM);


    // 활성화 리스트가 있다면 해당 리스트만 셀렉트
    if (Boolean(oEditBool) === true) {
        let b = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);

        GLV_UI.UITABLE.setSelectedIndex(b);

        return;
    } else if (ROWIDX === slpth) {

        GLV_UI.UITABLE.setSelectedIndex(eIdx);

        return;
    };

    
    oDiptPrp.KEY = eProp.KEY;
    oDiptPrp.DESC = oRData.DESC;
    oDiptPrp.TEXT = oRData.TEXT;

    GLV_FN.BARDESC(eProp);

    GLV_UI.RHINPUT.getModel().setProperty("", oDiptPrp, oDiptctxt);

    ROWIDX = slpth;

};

// ★★★★★★★★★★★★★★★★★★ 코드 에디터 줌 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.CODEEDITZOOM = () => {

    let codDom = GLV_UI.RCODEEDITOR.getDomRef();

    codDom.style.zoom = GLV_ZOOM;

};

// ★★★★★★★★★★★★★★★★★★ 우측 상단 바 영역 텍스트 ★★★★★★★★★★★★★★★★★★
GLV_FN.BARDESC = (eProp) => {

    // 우측 상단 바 영역 hbox
    let oActDes = GLV_UI.SELDESC,

        // hbox의 바인딩 컨텍스트
        oActDesctxt = oActDes.getBindingContext(),

        // hbox의 바인딩 프로퍼티
        oActPrp = oActDesctxt.getProperty(),

        // 좌측 키워드 데이터
        oKeyData = GLV_BINDATA.KEYWORDDATA,

        // 좌측 활성화 여부
        oEditT = oKeyData.find(a => a.EDIT === true);

    if (eProp.NEW !== '') {

        oActPrp.ICON = 'sap-icon://add-document';
        oActPrp.VISIBLE = true;
        // oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'ACTIVE';

    } else if (oEditT === undefined) {

        oActPrp.ICON = 'sap-icon://document';
        oActPrp.VISIBLE = true;
        oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'DISPLAY';

    } else {

        oActPrp.ICON = 'sap-icon://document';
        oActPrp.VISIBLE = true;
        oActPrp.KEY = eProp.KEY;
        oActPrp.ACTIVE = 'ACTIVE';

    };
};

// ★★★★★★★★★★★★★★★★★★ 좌측 수정 버튼 클릭 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.KEYWORDEDIT = (e) => {

    // 현재 이벤트가 걸린 UI
    let oETarget = e.getSource(),

        // UI의 바인딩 정보
        oETBindCont = oETarget.getBindingContext(),

        // UI의 바인딩 프로퍼티
        oETBCProp = oETBindCont.getProperty(),

        // 첫 페이지 UI의 모델
        oPGModel = GLV_UI.PAGE.getModel(),

        // 리스트 중에 활성화 된 상태가 있다면
        oEditBool = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);



    // 수정 중에 다른 수정 버튼 클릭 체크
    if (Boolean(oEditBool) === true && oETBCProp.EDIT === false) {

        // confirm('수정 중 입니다.');
        sap.m.MessageBox.confirm('저장하지 않은 내용은 삭제 됩니다', {
            title: "수정",
            actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CLOSE
            ],
            onClose: function(ACTION) {
                console.log(ACTION);

                switch (ACTION) {
                    case "OK":

                        GLV_FN.MESSAGEOK(oETBCProp);

                        break;

                    case "CLOSE":

                        break;
                }
            }

        })

        return;
    };

    // UI의 바인딩 프로퍼티 중 EDIT의 BOOLEAN이 뭐냐
    switch (oETBCProp.EDIT) {
        case false:

            GLV_FN.KEYWORDUNLOCK(oETBCProp);

            break;

        case true:

            GLV_FN.KEYWORDLOCK(oETBCProp);

            break;
    };

    GLV_FN.BARDESC(oETBCProp);

    e.getSource().getModel().setProperty("", oETBCProp, oETBindCont);

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 활성화 ★★★★★★★★★★★★★★★★★★
GLV_FN.KEYWORDUNLOCK = (oETBCProp) => {

    // debugger;

    /* oETBCProp => UI의 바인딩 프로퍼티
       oPGMode => 첫 페이지 UI의 모델 */

    oETBCProp.EDIT = true;
    oETBCProp.VISIBLE = false;
    oETBCProp.VISIBLE2 = true;
    oETBCProp.ICON = 'sap-icon://decline';

    // 현채 클릭한 리스트의 인덱스 값
    let slNum = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.KEY === oETBCProp.KEY);

    // 해당 인덱스의 로우에 셀렉트 해준다.
    GLV_UI.UITABLE.setSelectedIndex(slNum);

    // 우측 영역 활성화
    GLV_FN.DESCUNLOCK(oETBCProp);
};

// ★★★★★★★★★★★★★★★★★★ 우측 영역 활성화  ★★★★★★★★★★★★★★★★★★
GLV_FN.DESCUNLOCK = (oETBCProp) => {

    // 디스크립션 인풋
    let oDipt = GLV_UI.RHINPUT,

    // 디스크립션 바인딩 컨텍스트
    oDiptctxt = oDipt.getBindingContext(),

    // 디스크립션 바인딩 프로퍼티
    oDiptPrp = oDiptctxt.getProperty();

    // 우측 input & codeeditor의 visible 바인딩 데이터 true
    oDiptPrp.VISIBLE = true;

    // 우측 초기화 버튼 활성화
    GLV_FN.RESETUNLOCK();

    // 데이터 삽입
    GLV_FN.DESCDATAPUSH(oETBCProp, oDiptPrp);

};

// ★★★★★★★★★★★★★★★★★★ 우측 영역 데이터 삽입 ★★★★★★★★★★★★★★★★★★
GLV_FN.DESCDATAPUSH = (oETBCProp, oDiptPrp) => {

    let oDescEdit = GLV_BINDATA.ALLDATA.find(a => a.KEY === oETBCProp.KEY && a.INUM === oETBCProp.INUM),
        oDesc = oDescEdit.DESC,
        oText = oDescEdit.TEXT;

    // KEY값이 없을 때
    // 신규 추가했을 때
    if (oETBCProp.KEY === '') {

        oDiptPrp.KEY = '';
        oDiptPrp.DESC = '';
        oDiptPrp.TEXT = '';

        return;
    };

    oDiptPrp.KEY = oETBCProp.KEY;
    oDiptPrp.DESC = oDesc;
    oDiptPrp.TEXT = oText;

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 비활성화 ★★★★★★★★★★★★★★★★★★
GLV_FN.KEYWORDLOCK = (oETBCProp) => {

    // 

    /* oETBCProp => UI의 바인딩 프로퍼티
       oPGMode => 첫 페이지 UI의 모델 */

    if (oETBCProp === undefined) { return; }

    if (oETBCProp.KEY === '') {

        sap.m.MessageBox.error('Name은 필수 값 입니다', {
            title: '중요',
            actions: [
                sap.m.MessageBox.Action.OK
            ]
        });

        return;
    }



    oETBCProp.EDIT = false;
    oETBCProp.VISIBLE = true;
    oETBCProp.VISIBLE2 = false;
    oETBCProp.ICON = 'sap-icon://edit';

    // 우측 초기화 버튼 비활성화
    GLV_FN.RESETLOCK();

    // 우측 영역 비활성화
    GLV_FN.DESCLOCK(oETBCProp);

    // 해당 인덱스의 로우에 셀렉트를 제거한다.
    GLV_UI.UITABLE.setSelectedIndex(-1);

};

// ★★★★★★★★★★★★★★★★★★ 우측 영역 비활성화  ★★★★★★★★★★★★★★★★★★
GLV_FN.DESCLOCK = (oETBCProp) => {

    // 디스크립션 인풋
    let oDipt = GLV_UI.RHINPUT,

        // 디스크립션 바인딩 컨텍스트
        oDiptctxt = oDipt.getBindingContext(),

        // 디스크립션 바인딩 프로퍼티
        oDiptPrp = oDiptctxt.getProperty();

    oDiptPrp.VISIBLE = false;

    GLV_UI.PAGE.getModel().refresh();

};

// ★★★★★★★★★★★★★★★★★★ 메세지 박스를 통한 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.MESSAGEOK = (oETBCProp) => {

    /* oETBCProp => UI의 바인딩 프로퍼티
       oPGMode => 첫 페이지 UI의 모델 */

    // debugger;

    let oEditT = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true),

        oAllData = GLV_BINDATA.ALLDATA.find(a => a.KEY === oEditT.KEY && a.INUM === oEditT.INUM),

        // 디스크립션 인풋
        oDipt = GLV_UI.RHINPUT,

        // 디스크립션 바인딩 컨텍스트
        oDiptctxt = oDipt.getBindingContext(),

        // 디스크립션 바인딩 프로퍼티
        oDiptPrp = oDiptctxt.getProperty();

    // GLV_OLDDATA

    oEditT.KEY = oEditT.ORGKEY;
    oEditT.EDIT = false;
    oEditT.VISIBLE = true;
    oEditT.VISIBLE2 = false;
    oEditT.ICON = 'sap-icon://edit';

    if(GLV_OLDDATA.KEYWORDLIST !== undefined) {

        oEditT.KEY = GLV_OLDDATA.KEYWORDLIST;
        
        oAllData.KEY  = GLV_OLDDATA.KEYWORDLIST;
        oAllData.DESC = GLV_OLDDATA.DESCLIST;
        oAllData.TEXT = GLV_OLDDATA.TEXTLIST;
        
        oDiptPrp.KEY = GLV_OLDDATA.KEYWORDLIST;
        oDiptPrp.DESC = GLV_OLDDATA.DESCLIST;
        oDiptPrp.TEXT = GLV_OLDDATA.TEXTLIST;

    };

    GLV_FN.KEYWORDUNLOCK(oETBCProp);

    GLV_FN.BARDESC(oETBCProp);

    // 새로 구성된 데이터 바인딩
    GLV_UI.PAGE.getModel().refresh();

};

// ★★★★★★★★★★★★★★★★★★ 우측 버튼 활성화 ★★★★★★★★★★★★★★★★★★
GLV_FN.RESETUNLOCK = () => {

    let saveBtn = GLV_BINDATA.SAVECANCLE.find(a => a.KEY === "SAVE");

    saveBtn.VISIBLE = true;

    // 새로 구성된 데이터 바인딩
    GLV_UI.PAGE.getModel().refresh();

};

// ★★★★★★★★★★★★★★★★★★ 우측 초기화 버튼 비활성화 ★★★★★★★★★★★★★★★★★★
GLV_FN.RESETLOCK = () => {

    let saveBtn = GLV_BINDATA.SAVECANCLE.find(a => a.KEY === "SAVE");

    saveBtn.VISIBLE = false;

    GLV_UI.PAGE.getModel().refresh();

};

// ★★★★★★★★★★★★★★★★★★ 좌측 추가 버튼 ★★★★★★★★★★★★★★★★★★
GLV_FN.ADDCLICK = (e) => {

    // 좌측 리스트에 바인딩 되어있는 데이터
    let oLData = GLV_BINDATA.KEYWORDDATA,

        oETBCProp = oLData.find(a => a.EDIT === true);

    GLV_UI.UITABLE.setSelectedIndex(0);

    // 데이터가 없으면 리턴
    if (!oLData) {

        return;

    };

    if (Boolean(oETBCProp) === true) {

        if (oETBCProp.KEY === '') {
            sap.m.MessageBox.error('Name은 필수 값 입니다', {
                title: '중요',
                actions: [
                    sap.m.MessageBox.Action.OK
                ]
            });

            return;
        }

        // confirm('수정 중 입니다.');
        sap.m.MessageBox.confirm('저장하지 않은 내용은 삭제 됩니다', {
            title: "수정",
            actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CLOSE
            ],
            onClose: function(ACTION) {
                console.log(ACTION);

                switch (ACTION) {
                    case "OK":

                        GLV_FN.KEYWORDLOCK(oETBCProp);

                        GLV_FN.ADDLIST(oLData);

                        break;

                    case "CLOSE":

                        break;
                }
            }

        })

        return;
    };

    GLV_FN.ADDLIST(oLData);

};

// ★★★★★★★★★★★★★★★★★★ 좌측 추가 리스트 구성 ★★★★★★★★★★★★★★★★★★
GLV_FN.ADDLIST = (oLData) => {

    let oAllData = GLV_BINDATA.ALLDATA,

        // 디스크립션 인풋
        oDipt = GLV_UI.RHINPUT,

        // 디스크립션 바인딩 컨텍스트
        oDiptctxt = oDipt.getBindingContext(),

        // 디스크립션 바인딩 프로퍼티
        oDiptPrp = oDiptctxt.getProperty();

    for (var i = 0; i < oLData.length; i++) {
        let oLDataIdx = oLData[i].INUM,
            oALDataIdx = oAllData[i].INUM;

        oLData[i].INUM = oLDataIdx + 1;
        oAllData[i].INUM = oALDataIdx + 1;
    };

    let addtemp = {
        KEY: '',
        EDIT: true,
        ICON: 'sap-icon://decline',
        VISIBLE: false,
        VISIBLE2: true,
        // VSTATE: sap.ui.core.ValueState.None,
        INUM: 0,
        MODF: true,
        ORGKEY: '',
        NEW: true
    };

    GLV_NEWDATA = {
        KEY: '',
        DESC: '',
        TEXT: '',
        INUM: 0,
        ORGKEY: '',
        NEW: true
    };

    // 기존의 좌측 구성 데이터 배열의 앞에 추가
    oLData.unshift(addtemp);

    // 전체 데이터 배열의 앞에 추가
    oAllData.unshift(GLV_NEWDATA);

    // 우측 영역 활성화
    oDiptPrp.VISIBLE = true;
    oDiptPrp.KEY = '';
    oDiptPrp.DESC = '';
    oDiptPrp.TEXT = '';

    let oNData = GLV_BINDATA.KEYWORDDATA[0];

    GLV_FN.RESETUNLOCK();

    GLV_FN.BARDESC(oNData);

    GLV_UI.RHINPUT.getModel().setProperty("", oDiptPrp, oDiptctxt);

    GLV_UI.UITABLE.setFirstVisibleRow(0);
    GLV_UI.UITABLE.setSelectedIndex(0);



};

// ★★★★★★★★★★★★★★★★★★ 좌측 삭제 버튼 클릭 ★★★★★★★★★★★★★★★★★★
GLV_FN.DELETECLICK = (e) => {

    // 현재 이벤트가 걸린 UI
    let oETarget = e.getSource(),

        // UI의 바인딩 정보
        oETBindCont = oETarget.getBindingContext(),

        // UI의 바인딩 프로퍼티
        oETBCProp = oETBindCont.getProperty();

    GLV_UI.UITABLE.setSelectedIndex(oETBCProp.INUM);

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

                    GLV_FN.DELETELIST(oETBCProp);

                    break;

                case "NO":

                    break;
            }
        }
    });

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트에서 선택 리스트 삭제 ★★★★★★★★★★★★★★★★★★
GLV_FN.DELETELIST = (oETBCProp) => {

    let oFindDel = GLV_BINDATA.KEYWORDDATA.findIndex(a => a === oETBCProp),

    // 현재 셀렉트가 된 리스트
    oselIDX = GLV_UI.UITABLE.getSelectedIndex(),

    // 우측 상단 바 영역 hbox
    oActDes = GLV_UI.SELDESC,

    // hbox의 바인딩 컨텍스트
    oActDesctxt = oActDes.getBindingContext(),

    // hbox의 바인딩 프로퍼티
    oActPrp = oActDesctxt.getProperty(),

    // 디스크립션 인풋
    oDipt = GLV_UI.RHINPUT,

    // 디스크립션 바인딩 컨텍스트
    oDiptctxt = oDipt.getBindingContext(),

    // 디스크립션 바인딩 프로퍼티
    oDiptPrp = oDiptctxt.getProperty(); // 여기까지가 선언부


    // 삭제 데이터 모으기
    GLV_DELETEDATA.push(GLV_BINDATA.ALLDATA[oFindDel]);

    // 기존 데이터에서 삭제 할 데이터 제거
    GLV_BINDATA.KEYWORDDATA.splice(oFindDel, 1);
    GLV_BINDATA.ALLDATA.splice(oFindDel, 1);

    // GLV_FN.SAVEBTN();

    GLV_FN.SELECTBOOL(oselIDX, oETBCProp, oDiptPrp, oActPrp);
    
    GLV_FN.DELETE_UPDATA();
    
};

// ★★★★★★★★★★★★★★★★★★ 삭제 => 셀렉트 여부 ★★★★★★★★★★★★★★★★★★
GLV_FN.SELECTBOOL = (oselIDX, oETBCProp, oDiptPrp, oActPrp) => {

    // 현재 셀렉트가 된 리스트가 없어
    if(oselIDX === -1) {

        GLV_UI.UITABLE.setSelectedIndex(-1);

    } else { // 현재 셀렉트가 된 리스트가 있어

        // 활성화 여부 체크
        GLV_FN.EDITBOOL(oETBCProp, oDiptPrp, oActPrp);
        
    }

};

// ★★★★★★★★★★★★★★★★★★ 삭제 => 활성화 여부 ★★★★★★★★★★★★★★★★★★
GLV_FN.EDITBOOL = (oETBCProp, oDiptPrp, oActPrp) => {

    // 활성화 상태가 있는지 여부
    let oEditT = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true),
        oEditIDX = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);

    // 활성화 상태가 없다면
    if(oEditT === undefined) {

        // 저장 버튼 비활성화
        GLV_FN.RESETLOCK();
        oDiptPrp.DESC = '';
        oDiptPrp.TEXT = '';

        oActPrp.VISIBLE = false;
        GLV_UI.UITABLE.getModel().refresh();
        
    } else { // 활성화 상태가 있으면

        // 활성화 리스트와 삭제 리스트가 같아
        if(oETBCProp === oDiptPrp) {

            GLV_UI.UITABLE.setSelectedIndex(-1);

            oActPrp.VISIBLE = false;
            GLV_UI.UITABLE.getModel().refresh();

        } else { // 활성화 리스트와 삭제 리스트가 달라

            GLV_UI.UITABLE.getModel().refresh();
            GLV_UI.UITABLE.setSelectedIndex(oEditIDX);

        }

    }

};

// ★★★★★★★★★★★★★★★★★★ 좌측 리스트 바인딩 데이터 재구성 ★★★★★★★★★★★★★★★★★★
GLV_FN.DELETE_UPDATA = () => {

    let oKeyData = GLV_BINDATA.KEYWORDDATA,

        oAllData = GLV_BINDATA.ALLDATA,

        oKeyDataLeng = oKeyData.length;

    for (var i = 0; i < oKeyDataLeng; i++) {

        oKeyData[i].INUM = i;
        oAllData[i].INUM = i;

    };

};

// 여기부터 다시

// ★★★★★★★★★★★★★★★★★★ 좌측 인풋 입력 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.KEYINPUTCHANGE = (e) => {
    // 인풋의 입력 값
    // debugger;
    let oNewKey = e.getParameter('value'),

        // 현재 이벤트가 걸린 UI
        oETarget = e.getSource(),

        // UI의 바인딩 정보
        oETBindCont = oETarget.getBindingContext(),

        // UI의 바인딩 프로퍼티
        oETBCProp = oETBindCont.getProperty(),

        // 디스크립션 인풋
        oDipt = GLV_UI.RHINPUT,

        // 디스크립션 바인딩 컨텍스트
        oDiptctxt = oDipt.getBindingContext(),

        // 디스크립션 바인딩 프로퍼티
        oDiptPrp = oDiptctxt.getProperty(),

        // 우측 상단 바 영역 hbox
        oActDes = GLV_UI.SELDESC,

        // hbox의 바인딩 컨텍스트
        oActDesctxt = oActDes.getBindingContext(),

        // hbox의 바인딩 프로퍼티
        oActPrp = oActDesctxt.getProperty();

    // 수정 되기 전의 KEY값 저장
    GLV_OLDDATA.KEYWORDLIST = oNewKey;
    GLV_OLDDATA.DESCLIST = oDiptPrp.DESC;
    GLV_OLDDATA.TEXTLIST = oDiptPrp.TEXT;

    oDiptPrp.KEY = oETBCProp.KEY;

    let oAllData = GLV_BINDATA.ALLDATA.find(a => a.INUM === oETBCProp.INUM);

    if(oAllData.NEW === true) {
        oAllData.ORGKEY = oNewKey;
    };

    GLV_OLDDATA.ORIGINALKEY = oAllData.ORGKEY;

    // 전체 데이터의 맞는 인덱스의 키 값 변경
    oAllData.KEY = oNewKey;
    oAllData.MODF = true;
    oActPrp.KEY = oNewKey;


    e.getSource().getModel().setProperty('', oETBCProp, oETBindCont);
};

// ★★★★★★★★★★★★★★★★★★ 우측 디스크립션 인풋 입력 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.DESCINPUTCHANGE = (e) => {
    // debugger;
    // 인풋의 입력 값
    let oNewDesc = e.getParameter('value'),

        oSelNum = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true).INUM,

        oAllData = GLV_BINDATA.ALLDATA.find(a => a.KEY === GLV_BINDATA.DESCRDATA.KEY && a.INUM === oSelNum);

    // 수정 되기 전의 DESC값 저장
    GLV_OLDDATA.KEYWORDLIST = oAllData.KEY;
    GLV_OLDDATA.DESCLIST = oNewDesc;
    GLV_OLDDATA.TEXTLIST = oAllData.TEXT;
    GLV_OLDDATA.ORIGINALKEY = oAllData.ORGKEY;

    // 전체 데이터의 맞는 인덱스의 디스크립션 값 변경
    oAllData.DESC = oNewDesc;
    oAllData.MODF = true;

};

// ★★★★★★★★★★★★★★★★★★ 우측 코드에디터 입력 펑션 ★★★★★★★★★★★★★★★★★★
GLV_FN.CODEEDITCHANGE = (e) => {
    // debugger;
    // 인풋의 입력 값
    let oNewText = e.getParameter('value'),

        oSelNum = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true).INUM,

        oAllData = GLV_BINDATA.ALLDATA.find(a => a.KEY === GLV_BINDATA.DESCRDATA.KEY && a.INUM === oSelNum);

    // 수정 되기 전의 TEXT값 저장
    
    GLV_OLDDATA.KEYWORDLIST = oAllData.KEY;
    GLV_OLDDATA.DESCLIST = oAllData.DESC;
    GLV_OLDDATA.TEXTLIST = oNewText;
    GLV_OLDDATA.ORIGINALKEY = oAllData.ORGKEY;

    // 전체 데이터의 맞는 인덱스의 디스크립션 값 변경
    oAllData.TEXT = oNewText;
    oAllData.MODF = true;
};

// ★★★★★★★★★★★★★★★★★★ 우측 버튼 클릭 ★★★★★★★★★★★★★★★★★★
GLV_FN.RBTNCLICK = (e) => {

    let oETarget = e.getSource(),

        oETBindCont = oETarget.getBindingContext(),

        oETBCProp = oETBindCont.getProperty(),

        oETBCKey = oETBCProp.KEY;

    switch (oETBCKey) {
        case 'SAVE':

            GLV_FN.SAVEBTN();

            break;

        case 'RESET':

            GLV_FN.RESETBTN();

            break;
    }
};

// 저장 중요!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ★★★★★★★★★★★★★★★★★★ 우측 저장 버튼 클릭 ★★★★★★★★★★★★★★★★★★
GLV_FN.SAVEBTN = () => {
    
    // GLV_BINDATA.RECENTDATA => 최신 데이터 가져옴
    GLV_BINDATA.RECENTDATA = [];

    CODETEMP_DATA();

    // 좌측 리스트 바인딩 데이터
    // 추가 또는 삭제 반영 데이터가 이쪽 !!!!!!!!!!!!!
    let oKeyData = GLV_BINDATA.KEYWORDDATA,

        // 활성화가 되어있는 리스트 정보
        oETBCProp = oKeyData.find(a => a.EDIT === true),

        // 좌측에 Name이 빈 값인 리스트의 유무
        oNoKey = oKeyData.find(a => a.KEY === ''),

        // 최신 데이터
        oOrigData = GLV_BINDATA.RECENTDATA;


    // 키워드에 빈 값이 있는지 체크 로직
    switch (Boolean(oNoKey)) {
        // 좌측에 Name이 빈 값인 리스트가 있다
        case true:

            sap.m.MessageBox.error('Name은 필수 값 입니다', {
                title: '중요',
                actions: [
                    sap.m.MessageBox.Action.OK
                ]
            });

            break;

            // 좌측에 Name이 빈 값이 리스트가 없다.
        case false:

            GLV_FN.DATACHECK(oOrigData);
            GLV_FN.KEYWORDLOCK(oETBCProp);

            break;
    }
};

// ★★★★★★★★★★★★★★★★★★ 내쪽에서 수정한 데이터가 있는지 체크 ★★★★★★★★★★★★★★★★★★
GLV_FN.DATACHECK = (oOrigData) => {
    // debugger;

        // 내쪽의 기존 가져온 전체 데이터
    let oAllData = GLV_BINDATA.ALLDATA,

        // 수정 한 값이 있는 아이 찾기
        oModf = oAllData.find(a => a.MODF === true);

    if (Boolean(oModf) === true) { // 수정 한 값 있어!!!!!!!!

        GLV_FN.DATACOMP(oAllData, oOrigData);


    } else { // 수정한 값 없어!!!!!!!

        // 데이터 저장
        GLV_FN.DATADELETE(oOrigData);

    };

};

// ★★★★★★★★★★★★★★★★★★ 최신 데이터와 수정 데이터 비교 ★★★★★★★★★★★★★★★★★★
GLV_FN.DATACOMP = (oAllData, oOrigData) => {

    for (var i = 0; i < oOrigData.length; i++) {

        for (var idx = 0; idx < oAllData.length; idx++) {

            // 최신 데이터의 키값이 수정한 데이터의 오리지날 키 값과 같을 때
            if (oOrigData[i].KEY === oAllData[idx].ORGKEY && oAllData[idx].MODF === true) {

                oOrigData[i].KEY = oAllData[idx].KEY;
                oOrigData[i].DESC = oAllData[idx].DESC;
                oOrigData[i].TEXT = oAllData[idx].TEXT;

            };

        };

    };

    // 신규 체크
    GLV_FN.NEWDATA(oOrigData);

    GLV_FN.DATADELETE(oOrigData);
};

// ★★★★★★★★★★★★★★★★★★ 신규 데이터 체크 ★★★★★★★★★★★★★★★★★★
GLV_FN.NEWDATA = (oOrigData) => {

    //  신규 추가 체크
    let oNewList = GLV_BINDATA.ALLDATA.filter(a => a.NEW === true),
        oKeyList = GLV_BINDATA.KEYWORDDATA.filter(a => a.NEW === true);

    // 신규 추가가 없을 때 리턴
    if(oNewList === undefined){
        return;
    };

    for (var i = 0; i < oNewList.length; i++) {

        let addList = {
            KEY: oNewList[i].KEY,
            DESC: oNewList[i].DESC,
            TEXT: oNewList[i].TEXT
        }

        oOrigData.push(addList);
        // GLV_NEWLIST.push(addList);

        // 신규와 수정 되었다는 값 제거(xml 데이터 삽입 했을 때)
        oNewList[i].NEW = '';
        oNewList[i].MODF = '';
        oKeyList[i].NEW = '';
        oKeyList[i].MODF = '';

    };

};

// ★★★★★★★★★★★★★★★★★★ 데이터 삭제 ★★★★★★★★★★★★★★★★★★
GLV_FN.DATADELETE = (oOrigData) => {

    // debugger;

    // 삭제 된 값이 없을 때
    if (GLV_DELETEDATA.length === 0) {

        GLV_FN.DATASAVE();

        GLV_FN.SAVEAFTERBAR();

        return;
    };


    // 삭제 된 값이 있을 때
    
    for (var idx = 0; idx < GLV_DELETEDATA.length; idx++) {

        for (var i = 0; i < oOrigData.length; i++) {

            if (oOrigData[i].KEY === GLV_DELETEDATA[idx].ORGKEY) {
                oOrigData.splice(i, 1);
            };

        };

    };

    GLV_DELETEDATA = [];

    GLV_FN.DATASAVE();

    GLV_FN.SAVEAFTERBAR();


};

// ★★★★★★★★★★★★★★★★★★ 데이터 저장 ★★★★★★★★★★★★★★★★★★
GLV_FN.DATASAVE = () => {
    // 
    // xml 구조 => 접근 방법이 아닌것 같음
    // 여기 다시!!!!!!!!!!!!!!!!!
    // debugger;
    let oRecent = GLV_BINDATA.RECENTDATA,
        oUpArray = oRecent.sort((a, b) => a.KEY > b.KEY ? 1 : -1);

    console.log(oUpArray);

    let a = `<?xml version="${XMLVS}"?>\n`;
    a += '<?xml-stylesheet type="text/xsl" href="lang_user.xslt"?>\n';
    a += '<XMLConfigSettings>\n';
    a += '  <FILEINFO>\n';
    a += '      <Author>SAP</Author>\n      <Type>LangUser</Type>\n     <Language>ABAP</Language>\n     <Desc>User specific settings for ABAP</Desc>\n';
    a += '  </FILEINFO>\n';
    a += '  <EXPANDS>\n';

    for (var i = 0; i < oUpArray.length; i++) {
        a += `      <Expand key="${oUpArray[i].KEY}">\n`;
        a += `          <Descr>${oUpArray[i].DESC}</Descr>\n`;
        a += `          <Text>${oUpArray[i].TEXT}</Text>\n`;
        a += '      </Expand>\n';
    };

    a += '  </EXPANDS>\n';
    a += '</XMLConfigSettings>\n';

    oAPP.fs.writeFileSync("C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml", a);
    // oAPP.fs.writeFileSync('C:\\temp\\ELECTRON\\FloatingMenu\\v22\\www\\floatingMenu\\ABAP Editor\\abap_user1.xml', a);

    sap.m.MessageToast.show('저장 되었습니다', {
        duration: 1500,
        animationDuration: 1500,
        at: sap.ui.core.Popup.Dock.CenterCenter
    });

};

// ★★★★★★★★★★★★★★★★★★ 저장 이후 우측 바 변경 ★★★★★★★★★★★★★★★★★★
GLV_FN.SAVEAFTERBAR = () => {

    // 우측 상단 바 영역 hbox
    let oActDes = GLV_UI.SELDESC,

    // hbox의 바인딩 컨텍스트
    oActDesctxt = oActDes.getBindingContext(),

    // hbox의 바인딩 프로퍼티
    oActPrp = oActDesctxt.getProperty();

    oActPrp.ICON = 'sap-icon://document';
    oActPrp.ACTIVE = 'DISPLAY';

    GLV_UI.SELDESC.getModel().setProperty('', oActPrp, oActDesctxt);

};

// ★★★★★★★★★★★★★★★★★★ 펑션 끝 ★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 ★★★★★★★★★★★★★★★★★★
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    // ★★★★★★★★★★★★★★★★★★ abap user.xml 데이터 가져오기 ★★★★★★★★★★★★★★★★★★
    CODETEMP_DATA();

    // watch로 바라보는 경로
    let watchPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor';
    // let watchPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml';

    oAPP.WATCH = oAPP.fs.watch(watchPath, { "recursive":true } ,async (a,b)=>{
        // debugger;
        // 받아온 파라미터 값 중 b의 값이 'abap_user.xml' 아니라면 리턴
        if(b !== 'abap_user.xml'){return;};

        // 해당 경로에 abap_user.xml 파일이 있는지 체크
        let oFileFind = oAPP.fs.existsSync(`${watchPath}\\abap_user.xml`);
        // let oFileFind = oAPP.fs.existsSync(`C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml`);

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

        CODETEMP_DATA(oUPDLG);

        ROWIDX = '';

        let A = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.ORGKEY === GLV_UPIDX.ORGKEY);

        GLV_UI.UITABLE.setSelectedIndex(A);

        GLV_UPIDX = '';
    
    }); 

    // ★★★★★★★★★★★★★★★★★★ m.List에 모델 세팅 END ★★★★★★★★★★★★★★★★★★

    // ★★★★★★★★★★★★★★★★★★ 코드 에디터 addEventDelegate ★★★★★★★★★★★★★★★★★★
    GLV_UI.RCODEEDITOR.addEventDelegate({

        onAfterRendering: function(e) {
            GLV_FN.CODEEDITZOOM();
        }

    });

    GLV_UI.RVBOX.bindElement('/r_editData');
    GLV_UI.SELDESC.bindElement('/r_selectDesc')

    GLV_UI.PAGE.setBusy(false);


} // fn_UIUPdated() END

// ★★★★★★★★★★★★★★★★★★ ui 생성 ★★★★★★★★★★★★★★★★★★
function createUi() {

    // UI가 다 생성이 되고나면 fn_UIUPdated를 실행
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    // ★★★★★★★★★★★★★★★★★★ App 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.APP = new sap.m.App().addStyleClass('codeTempNoScrolling');

    // ★★★★★★★★★★★★★★★★★★ 첫 Page 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.PAGE = new sap.m.Page({
        busy: true,
        busyIndicatorDelay: 0,
        showHeader: false

    });

    // ★★★★★★★★★★★★★★★★★★ 첫 Splitter 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.SPLITTER = new sap.ui.layout.Splitter();

    // ★★★★★★★★★★★★★★★★★★ Splitter lPage 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.LPAGE = new sap.m.Page({
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: '300px',
            minSize: 80
        })

    }).addStyleClass('listPage');

    // ★★★★★★★★★★★★★★★★★★ Splitter lPage bar 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.LHBAR = new sap.m.Bar();

    // ★★★★★★★★★★★★★★★★★★ Splitter lPage bar 추가 버튼 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.LADDBTN = new sap.m.Button({
        icon: "sap-icon://add",
        type: sap.m.ButtonType.Emphasized,
        press: function(e) {
            GLV_FN.ADDCLICK(e);
        }
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter lPage UI.TABLE 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.UITABLE = new sap.ui.table.Table({
        columns: new sap.ui.table.Column({
            width: '100%',
            minWidth: 80,
            label: new sap.m.Label({
                text: 'Name'
            }),
            sorted: true
        }),
        rowActionTemplate: new sap.ui.table.RowAction({
            items: [
                new sap.ui.table.RowActionItem({
                    icon: "{ICON}",
                    type: sap.ui.table.RowActionType.Custom,
                    press: function(e) {
                        // 
                        GLV_FN.KEYWORDEDIT(e);
                    }
                }),
                new sap.ui.table.RowActionItem({
                    icon: "sap-icon://delete",
                    type: sap.ui.table.RowActionType.Delete,
                    press: function(e) {
                        GLV_FN.DELETECLICK(e)
                    }
                })
            ]
        }).addStyleClass('actionBtn'),
        rowHeight: 64,
        rowActionCount: 2,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.Row,
        rowSelectionChange: function(e) {
            GLV_FN.KEYWORDCLICK(e);
        }
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter lPage UI.TABLE 로우엑션 템플릿 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.ROWACTION = new sap.ui.table.RowAction();

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RPAGE = new sap.m.Page({

        showHeader: false

    });

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage bar 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RHBAR = new sap.m.Bar({
        contentRight: {

            path: '/r_btnDaTA',
            template: new sap.m.Button({
                icon: '{ICON}',
                type: '{TYPE}',
                visible: '{VISIBLE}',
                press: function(e) {
                    GLV_FN.RBTNCLICK(e);
                }
            })
        }

    });

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

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage vbox 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RVBOX = new sap.m.VBox({
        renderType: sap.m.FlexRendertype.Bare,
        height: 'calc(100% - 50px)'
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage hbox 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RHBOX = new sap.m.HBox({
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        height: "50px"
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage hbox label 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RHLABEL = new sap.m.Label({
        text: 'Description',
        width: '100px'
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage hbox input 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RHINPUT = new sap.m.Input({
        editable: '{VISIBLE}',
        value: '{DESC}',
        change: function(e) {
            GLV_FN.DESCINPUTCHANGE(e);
        }
    });

    // ★★★★★★★★★★★★★★★★★★ Splitter rPage codeeditor 생성 ★★★★★★★★★★★★★★★★★★
    GLV_UI.RCODEEDITOR = new sap.ui.codeeditor.CodeEditor({
        type: "abap",
        height: '100%',
        editable: '{VISIBLE}',
        value: '{TEXT}',
        change: function(e) {
            GLV_FN.CODEEDITCHANGE(e);
        }
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
    GLV_UI.LPAGE.addContent(GLV_UI.LHBAR).addContent(GLV_UI.UITABLE);
    GLV_UI.RHBOX.addItem(GLV_UI.RHLABEL).addItem(GLV_UI.RHINPUT);
    GLV_UI.RVBOX.addItem(GLV_UI.RHBOX).addItem(GLV_UI.RCODEEDITOR);
    GLV_UI.RHBAR.addContentLeft(GLV_UI.SELDESC);
    GLV_UI.RPAGE.addContent(GLV_UI.RHBAR).addContent(GLV_UI.RVBOX);
    GLV_UI.SPLITTER.addContentArea(GLV_UI.LPAGE).addContentArea(GLV_UI.RPAGE)
    GLV_UI.PAGE.addContent(GLV_UI.SPLITTER);
    GLV_UI.APP.addPage(GLV_UI.PAGE);
    GLV_UI.APP.placeAt('content');
} // createUi() END