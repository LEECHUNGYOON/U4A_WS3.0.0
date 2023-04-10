// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 ★★★★★★★★★★★★★★★★★★
let oAPP,
    GLV_UI = {},
    GLV_FN = {},
    GLV_BINDATA = {},
    XMLVS = '',
    zoom = 1,
    ZOOM_SPEED = 0.1,
    GLV_ZOOM = '1';
    GLV_BINDATA.DELETEDATA = [];


oAPP = parent.parent.gfn_parent();

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

createUi();

// ★★★★★★★★★★★★★★★★★★ 펑션 ★★★★★★★★★★★★★★★★★★
// 데이터 체크하기
// => 너는 데이터만 가지고와서 정상적으로 있는지만 판단해
GLV_FN.CHECK_DATA = (oUPDLG) => {

    // 현재는 하드코딩 추 후 수정
    let data = oAPP.fs.readFileSync("C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml" , 'utf8');
    let json = JSON.parse(oAPP.convert.xml2json(data));

    XMLVS = json.declaration.attributes.version;

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
        let keywordKey = {

            KEY: nameKey,
            EDIT: false,
            ICON:'sap-icon://edit',
            VISIBLE: true,
            VISIBLE2: false,
            STATUS: '',
            T_ITEM: [
                {
                    DESC: oDtxt,
                    TEXT: oTtxt
                }
            ]
            
        };

        GLV_BINDATA.KEYWORDDATA[i] = keywordKey;

    };

    // 좌측 리스트 오름차순 정렬
    GLV_BINDATA.KEYWORDDATA = GLV_BINDATA.KEYWORDDATA.sort((a, b) => a.KEY > b.KEY ? 1 : -1);

    // 바 영역의 상태 텍스트 데이터 틀
    let activeTxt = {
        ICON: 'sap-icon://document',
        KEY: '',
        ACTIVE: 'DISPLAY',
        VISIBLE: false
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

    // GLV_FN.WATCHBUSY(oUPDLG);

};


// 좌측 리스트 클릭 펑션
GLV_FN.LIST_CLICK = (e) => {
    debugger;

    let ePram = e.getParameter('rowContext'),
        eIdx = e.getParameter('rowIndex'),
        eProp = ePram.getProperty(),
        slpth = ePram.sPath,
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty();

};


// busydialog가 켜져있다면
GLV_FN.WATCHBUSY = (oUPDLG) => {

    setTimeout(() => {

        if(oUPDLG !== undefined) {
    
            oUPDLG.close();
    
            GLV_HISTORYDATA.SELECTLINE = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.KEY === GLV_HISTORYDATA.SELECTKEY);
            GLV_UI.UITABLE.setSelectedIndex(GLV_HISTORYDATA.SELECTLINE);
    
        };

    },1000);

};


// sap에서 데이터가 바뀌었을 때 우측 데이터 삽입
GLV_FN.WATCHDESCDATA = () => {

    if(GLV_HISTORYDATA.SELECTLINE === -1) { return; };

    let selProp = GLV_BINDATA.KEYWORDDATA[GLV_HISTORYDATA.SELECTLINE],
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty(),
        oRData = GLV_BINDATA.ALLDATA.find(a => a.KEY === selProp.KEY && a.INUM === selProp.INUM);

        oDiptPrp.KEY = selProp.KEY;
        oDiptPrp.DESC = oRData.DESC;
        oDiptPrp.ORGDESC = oRData.DESC;
        oDiptPrp.TEXT = oRData.TEXT;
        oDiptPrp.ORGTEXT = oRData.TEXT;

        GLV_FN.BARDESC(selProp);
        
        GLV_UI.RHINPUT.getModel().setProperty("", oDiptPrp, oDiptctxt);

};


// 좌측 리스트 클릭 펑션
GLV_FN.L_LISTCLICK = (e) => {

    // debugger;

    let ePram = e.getParameter('rowContext');

    if (ePram === null) {return;};

    let eIdx = e.getParameter('rowIndex'),
        eProp = ePram.getProperty(),
        slpth = ePram.sPath,
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty(),
        oEditBool = GLV_BINDATA.KEYWORDDATA.find(a => a.VISIBLE2 === true),
        oRData = GLV_BINDATA.ALLDATA.find(a => a.ORGKEY === eProp.KEY && a.INUM === eProp.INUM),
        // oRData = GLV_BINDATA.ALLDATA.find(a => a.KEY === eProp.KEY && a.INUM === eProp.INUM),
        codDom = GLV_UI.RCODEEDITOR.getDomRef();
        codDom.style.zoom;


        if (Boolean(oEditBool) === true) {
            let editli = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);
    
            GLV_UI.UITABLE.setSelectedIndex(editli);
    
            return;
        } else if (GLV_HISTORYDATA.ROWIDX === slpth) {
    
            GLV_UI.UITABLE.setSelectedIndex(eIdx);
    
            return;
        };

        GLV_HISTORYDATA.SELECTKEY = eProp.KEY;

        oDiptPrp.KEY = eProp.KEY;
        oDiptPrp.DESC = oRData.DESC;
        oDiptPrp.ORGDESC = oRData.DESC;
        oDiptPrp.TEXT = oRData.TEXT;
        oDiptPrp.ORGTEXT = oRData.TEXT;
        
        GLV_FN.BARDESC(eProp);
        
        GLV_UI.RHINPUT.getModel().setProperty("", oDiptPrp, oDiptctxt);
        
        GLV_HISTORYDATA.ROWIDX = slpth;

};


// 좌측 리스트 클릭에 따라 우츨 바 영역 텍스트 변경 펑션
GLV_FN.BARDESC = (eProp) => {

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

    } else if (eProp.NEW !== '') { // 신규일때

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

};


// 좌측 수정 버튼 클릭
GLV_FN.EDIT_CLICK = (e) => {

    let oETarget = e.getSource(),
        oETBindCont = oETarget.getBindingContext(),
        oETBCProp = oETBindCont.getProperty(),
        oEditBool = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true);

    // 수정 중에 다른 수정 버튼 클릭 체크
    if (Boolean(oEditBool) === true && oETBCProp.EDIT === false) {

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

    GLV_HISTORYDATA.SELECTKEY = oETBCProp.KEY;

    // UI의 바인딩 프로퍼티 중 EDIT의 BOOLEAN이 뭐냐
    switch (oETBCProp.EDIT) {
        case false:

            GLV_FN.KEYINPUTACTIVE(oETBCProp);

            break;

        case true:

            GLV_FN.NOSAVECLOSE(oETarget, oETBindCont, oETBCProp);

            break;
    };

    GLV_FN.BARDESC(oETBCProp);

    e.getSource().getModel().setProperty("", oETBCProp, oETBindCont);

};

// 저장하지 않고 수정 버튼을 닫을 때
GLV_FN.NOSAVECLOSE = (oETarget, oETBindCont, oETBCProp) => {

    // let oEdit = GLV_BINDATA.ALLDATA.filter(a => a.MODF === true);
    let oEdit = GLV_BINDATA.ALLDATA.find(a => a.MODF === true);

    // 수정한 값이 있다면
    // if(oEdit.length > 0) {
    if(oEdit !== undefined) {

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
    
                        GLV_FN.DELETENODATA(oETarget, oETBindCont, oETBCProp, oEdit);
    
                        break;
    
                    case "CLOSE":
    
                        break;
                }
            }
    
        });


        return;
    };

    // 수정한 값이 없다면
    GLV_FN.KEYINPUTINACTIVE(oETBCProp);

};

// 저장하지 않은 내용 삭제
GLV_FN.DELETENODATA = (oETarget, oETBindCont, oETBCProp, oEdit) => {

    let oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty(),
        oActDes = GLV_UI.SELDESC,
        oActDesctxt = oActDes.getBindingContext(),
        oActPrp = oActDesctxt.getProperty(),
        oModf = GLV_BINDATA.ALLDATA.find(a => a.MODF === true);

    oETBCProp.KEY = oETBCProp.ORGKEY;
    oETBCProp.ICON = 'sap-icon://edit';
    oETBCProp.EDIT = false;
    oETBCProp.VISIBLE = true;
    oETBCProp.VISIBLE2 = false;

    oModf.KEY = GLV_BINDATA.DESCRDATA.KEY;
    oModf.DESC = GLV_BINDATA.DESCRDATA.DESC;
    oModf.TEXT = GLV_BINDATA.DESCRDATA.TEXT;

    oDiptPrp.DESC = oDiptPrp.ORGDESC;
    oDiptPrp.TEXT = oDiptPrp.ORGTEXT;
    oDiptPrp.VISIBLE = false;

    oActPrp.ICON = 'sap-icon://document';
    oActPrp.VISIBLE = true;
    oActPrp.KEY = oETBCProp.ORGKEY;
    oActPrp.ACTIVE = 'DISPLAY';

    oEdit.MODF = '';
    oEdit.NEW = '';

    oETarget.getModel().setProperty("", oETBCProp, oETBindCont);

};


// 좌측 인풋 활성화
GLV_FN.KEYINPUTACTIVE = (oETBCProp) => {

    // debugger;

    // 현채 클릭한 리스트의 인덱스 값
    let slNum = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.KEY === oETBCProp.KEY);

    oETBCProp.EDIT = true;
    oETBCProp.VISIBLE = false;
    oETBCProp.VISIBLE2 = true;
    oETBCProp.ICON = 'sap-icon://decline';

    // 해당 인덱스의 로우에 셀렉트 해준다.
    GLV_UI.UITABLE.setSelectedIndex(slNum);

    // 우측 영역 활성화
    GLV_FN.DESCACTIVE(oETBCProp);

};


// 우측 영역 활성화
GLV_FN.DESCACTIVE = (oETBCProp) => {

    let oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty();

        oDiptPrp.VISIBLE = true;

        // 저장 버튼 활성화
        GLV_FN.SAVEBTNACTIVE();

        // 데이터 삽입
        GLV_FN.DESCDATAPUSH(oETBCProp, oDiptPrp);

};


// 저장 버튼 활성화
GLV_FN.SAVEBTNACTIVE = () => {

    let sctxt = GLV_UI.RHBAR.getBindingContext(),
        sProp = sctxt.getProperty();

        sProp.VISIBLE = true;

        GLV_UI.RHBAR.getModel().setProperty('', sProp, sctxt);

};


// 데이터 삽입
GLV_FN.DESCDATAPUSH = (oETBCProp, oDiptPrp) => {

    let oDescEdit = GLV_BINDATA.ALLDATA.find(a => a.KEY === oETBCProp.KEY && a.INUM === oETBCProp.INUM);

    if(oDescEdit === undefined) {return;};

    let oDesc = oDescEdit.DESC,
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
    oDiptPrp.ORGDESC = oDesc;
    oDiptPrp.TEXT = oText;
    oDiptPrp.ORGTEXT = oText;

};


// 좌측 인풋 비활성화
GLV_FN.KEYINPUTINACTIVE = (oETBCProp) => {

    if (oETBCProp === undefined) { return; }

    if (oETBCProp.KEY === '') {

        sap.m.MessageBox.error('Name은 필수 값 입니다', {
            title: '중요',
            actions: [
                sap.m.MessageBox.Action.OK
            ]
        });

        return;
    };

    oETBCProp.EDIT = false;
    oETBCProp.VISIBLE = true;
    oETBCProp.VISIBLE2 = false;
    oETBCProp.ICON = 'sap-icon://edit';

    // 저장 버튼 비활성화
    GLV_FN.SAVEBTNINACTIVE();

    // 우측 영역 비활성화
    GLV_FN.DESCINACTIVE(oETBCProp);

};


// 저장 버튼 비활성화
GLV_FN.SAVEBTNINACTIVE = () => {

    let sctxt = GLV_UI.RHBAR.getBindingContext(),
        sProp = sctxt.getProperty();

        sProp.VISIBLE = false;

        GLV_UI.RHBAR.getModel().setProperty('', sProp, sctxt);

};


// 우측 영역 비활성화
GLV_FN.DESCINACTIVE = () => {

    let oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty();

        oDiptPrp.VISIBLE = false;

        GLV_UI.RHINPUT.getModel().setProperty('', oDiptPrp, oDiptctxt);
};


// 수정 중 팝업 OK 클릭 펑션
GLV_FN.MESSAGEOK = (oETBCProp) => {

    // debugger;

    let oEditT = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true),
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty();
        oModf = GLV_BINDATA.ALLDATA.find(a => a.MODF === true);

        oEditT.KEY = oEditT.ORGKEY;
        oEditT.EDIT = false;
        oEditT.VISIBLE = true;
        oEditT.VISIBLE2 = false;
        oEditT.ICON = 'sap-icon://edit';

        // oModf.KEY = GLV_BINDATA.DESCRDATA.KEY;
        // oModf.DESC = GLV_BINDATA.DESCRDATA.DESC;
        // oModf.TEXT = GLV_BINDATA.DESCRDATA.TEXT;

        console.log(GLV_BINDATA.ALLDATA);

        GLV_FN.REMOVE_NEWLIST();

        GLV_FN.KEYINPUTACTIVE(oETBCProp);
        
        GLV_FN.BARDESC(oETBCProp);
        
        GLV_FN.REMOVE_AFTERLIST();

        // if(oModf.length > 0) {
        if(oModf !== undefined) {

            oModf.MODF = false;

            // oModf.KEY = GLV_BINDATA.DESCRDATA.KEY;
            // oModf.DESC = GLV_BINDATA.DESCRDATA.DESC;
            // oModf.TEXT = GLV_BINDATA.DESCRDATA.TEXT;

        };


        GLV_UI.RHINPUT.getModel().setProperty('', oDiptPrp, oDiptctxt);

};


// 좌측 추가버튼 클릭 펑션
GLV_FN.ADDBTN_CLICK = (e) => {

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
    
                            GLV_FN.REMOVE_NEWLIST();

                            GLV_FN.KEYINPUTINACTIVE(oETBCProp);
    
                            GLV_FN.ADD_LIST(oLData);
    
                            break;
    
                        case "CLOSE":
    
                            break;
                    }
                }
    
            })
    
            return;
        };

        GLV_FN.ADD_LIST(oLData);

};


// 신규 => 저장 하지 않은 리스트 삭제
GLV_FN.REMOVE_NEWLIST = () => {

    let oNBool = GLV_BINDATA.ALLDATA.find(a => a.NEW === true);

    if(oNBool === undefined) {

        return;

    };

    GLV_BINDATA.KEYWORDDATA.shift();
    GLV_BINDATA.ALLDATA.shift();

};

// 신규 => 저장 하지 않은 리스트 삭제 후 재구성
GLV_FN.REMOVE_AFTERLIST = () => {

    let oLData = GLV_BINDATA.KEYWORDDATA,
        oAllData = GLV_BINDATA.ALLDATA;

    for (var i = 0; i < oLData.length; i++) {

        oLData[i].INUM = i;
        oAllData[i].INUM = i;

    };

    let selIdx = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);

    GLV_UI.UITABLE.setSelectedIndex(selIdx);

};


// 추가 리스트 구성
GLV_FN.ADD_LIST = (oLData) => {

    let oAllData = GLV_BINDATA.ALLDATA,
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
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
        INUM: 0,
        MODF: true,
        ORGKEY: '',
        NEW: true
    };

    let newdata = {
        KEY: '',
        DESC: '',
        TEXT: '',
        INUM: 0,
        MODF: true,
        ORGKEY: '',
        ORGDESC: '',
        ORGTEXT: '',
        NEW: true
    };

    // 기존의 좌측 구성 데이터 배열의 앞에 추가
    oLData.unshift(addtemp);

    // 전체 데이터 배열의 앞에 추가
    oAllData.unshift(newdata);

    // 우측 영역 활성화
    oDiptPrp.VISIBLE = true;
    oDiptPrp.KEY = '';
    oDiptPrp.DESC = '';
    oDiptPrp.TEXT = '';
    oDiptPrp.ORGDESC = '';
    oDiptPrp.ORGTEXT = '';
    oDiptPrp.NEW = true;

    let oNData = GLV_BINDATA.KEYWORDDATA.find(a => a.NEW === true);

    GLV_FN.SAVEBTNACTIVE();

    GLV_FN.BARDESC(oNData);

    GLV_UI.RHINPUT.getModel().setProperty("", oDiptPrp, oDiptctxt);

    GLV_UI.UITABLE.setFirstVisibleRow(0);
    GLV_UI.UITABLE.setSelectedIndex(0);

};

// 좌측 인풋 입력 펑션
GLV_FN.KEYINPUTCHANGE = (e) => {

    let eValue = e.getParameter('value'),
        oETarget = e.getSource(),
        oETBindCont = oETarget.getBindingContext(),
        oETBCProp = oETBindCont.getProperty(),
        aldt = GLV_BINDATA.ALLDATA.find(a => a.ORGKEY === oETBCProp.ORGKEY);


        // 입력 받은 리스트가 신규이면
        if(oETBCProp.NEW === true) {

            GLV_FN.NEWINPUTCHANGE(eValue, oETBCProp);

            return;

        };

        // 입력 받은 리스트가 신규가 아니라면
        aldt.MODF = true;
        aldt.KEY = eValue;

        GLV_FN.BARDESC(oETBCProp);

};

// 좌측 신규 인풋 입력 펑션
GLV_FN.NEWINPUTCHANGE = (eValue, oETBCProp) => {

    // let aldt = GLV_BINDATA.ALLDATA,
    let aldt = GLV_BINDATA.ALLDATA.find(a => a.NEW === true),
        oActDes = GLV_UI.SELDESC,
        oActDesctxt = oActDes.getBindingContext(),
        oActPrp = oActDesctxt.getProperty();

    oETBCProp.KEY = eValue;
    aldt.KEY = eValue;
    aldt.ORGKEY = eValue;
    oActPrp.KEY = eValue;

    oActDes.getModel().setProperty("", oActPrp, oActDesctxt);

};


// 우측 인풋 입력 펑션
GLV_FN.DESCINPUTCHANGE = (e) => {

    let eValue = e.getParameter('value'),
        oETarget = e.getSource(),
        oETBindCont = oETarget.getBindingContext(),
        oETBCProp = oETBindCont.getProperty(),
        aldt = GLV_BINDATA.ALLDATA.find(a => a.DESC === oETBCProp.ORGDESC);

        // 입력 받은 리스트가 신규이면
        if(oETBCProp.NEW === true) {

            GLV_FN.NEWDESCCHANGE(eValue, oETBCProp);

            return;

        };

        aldt.MODF = true;
        aldt.DESC = eValue;

};


// 우측 신규 인풋 디스크립션 입력 펑션
GLV_FN.NEWDESCCHANGE = (eValue, oETBCProp) => {

    // let aldt = GLV_BINDATA.ALLDATA;
    let aldt = GLV_BINDATA.ALLDATA.find(a => a.NEW === true);

    oETBCProp.KEY = eValue;
    aldt.DESC = eValue;
    aldt.ORGDESC = eValue;

};


// 우측 코드에디터 입력 펑션
GLV_FN.CODEEDITORCHANGE = (e) => {

    let eValue = e.getParameter('value'),
        oETarget = e.getSource(),
        oETBindCont = oETarget.getBindingContext(),
        oETBCProp = oETBindCont.getProperty(),
        aldt = GLV_BINDATA.ALLDATA.find(a => a.TEXT === oETBCProp.ORGTEXT);

        // 입력 받은 리스트가 신규이면
        if(oETBCProp.NEW === true) {

            GLV_FN.NEWTEXTCHANGE(eValue, oETBCProp);

            return;

        };

        aldt.MODF = true;
        aldt.TEXT = eValue;

};


// 우측 신규 코드에디터 입력 펑션
GLV_FN.NEWTEXTCHANGE = (eValue, oETBCProp) => {

    // let aldt = GLV_BINDATA.ALLDATA;
    let aldt = GLV_BINDATA.ALLDATA.find(a => a.NEW === true);

    oETBCProp.KEY = eValue;
    aldt.TEXT = eValue;
    aldt.ORGTEXT = eValue;

};

// 좌측 삭제 버튼 클릭
GLV_FN.DELETE_CLICK = (e) => {

    let oETarget = e.getSource(),
        oETBindCont = oETarget.getBindingContext(),
        oETBCProp = oETBindCont.getProperty();

        // 삭제 할 리스트 셀렉트
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
    
                        GLV_FN.DELETE_LIST(oETBCProp);
    
                        break;
    
                    case "NO":
    
                        break;
                }
            }
        });

};

// 좌측 리스트에서 선택 행 삭제
GLV_FN.DELETE_LIST = (oETBCProp) => {

    let oFindDel = GLV_BINDATA.KEYWORDDATA.findIndex(a => a === oETBCProp),
        oselIDX = GLV_UI.UITABLE.getSelectedIndex(),
        oActDes = GLV_UI.SELDESC,
        oActDesctxt = oActDes.getBindingContext(),
        oActPrp = oActDesctxt.getProperty(),
        oDipt = GLV_UI.RHINPUT,
        oDiptctxt = oDipt.getBindingContext(),
        oDiptPrp = oDiptctxt.getProperty();

        // 삭제 데이터 array
        GLV_BINDATA.DELETEDATA.push(GLV_BINDATA.ALLDATA[oFindDel]);
        
        GLV_BINDATA.KEYWORDDATA.splice(oFindDel, 1);
        GLV_BINDATA.ALLDATA.splice(oFindDel, 1);

        GLV_FN.SELECT_BOOL(oselIDX, oETBCProp, oDiptPrp, oActPrp, oActDesctxt);
    
        GLV_FN.DELETE_UPDATA();

};


// 삭제 => 셀렉트 여부
GLV_FN.SELECT_BOOL = (oselIDX, oETBCProp, oDiptPrp, oActPrp, oActDesctxt) => {

    // 현재 셀렉트가 된 리스트가 없어
    if(oselIDX === -1) {

        GLV_UI.UITABLE.setSelectedIndex(-1);

    } else { // 현재 셀렉트가 된 리스트가 있어

        // 활성화 여부 체크
        GLV_FN.EDIT_BOOL(oETBCProp, oDiptPrp, oActPrp, oActDesctxt);
        
    }

};

// 삭제 => 활성화 여부
GLV_FN.EDIT_BOOL = (oETBCProp, oDiptPrp, oActPrp, oActDesctxt) => {

    // 활성화 상태가 있는지 여부
    let oEditT = GLV_BINDATA.KEYWORDDATA.find(a => a.EDIT === true),
        oEditIDX = GLV_BINDATA.KEYWORDDATA.findIndex(a => a.EDIT === true);

        // 활성화 상태가 없다면
        if(oEditT === undefined) {

            // 저장 버튼 비활성화
            GLV_FN.SAVEBTNINACTIVE();
            oDiptPrp.DESC = '';
            oDiptPrp.TEXT = '';

            oActPrp.VISIBLE = false;
            GLV_UI.UITABLE.getModel().refresh();

        } else { // 활성화 상태가 있으면

            // 활성화 리스트와 삭제 리스트가 같아
            if(oETBCProp === oDiptPrp) {

                GLV_UI.UITABLE.setSelectedIndex(-1);

                oActPrp.VISIBLE = false;
                GLV_UI.SELDESC.getModel().setProperty("", oActPrp, oActDesctxt);

            } else { // 활성화 리스트와 삭제 리스트가 달라

                GLV_UI.SELDESC.getModel().setProperty("", oActPrp, oActDesctxt);
                GLV_UI.UITABLE.setSelectedIndex(oEditIDX);

            }

        }

};


// 삭제 => 좌측 리스트 재구성
GLV_FN.DELETE_UPDATA = () => {

    let oKeyData = GLV_BINDATA.KEYWORDDATA,

        oAllData = GLV_BINDATA.ALLDATA,

        oKeyDataLeng = oKeyData.length;

    for (var i = 0; i < oKeyDataLeng; i++) {

        oKeyData[i].INUM = i;
        oAllData[i].INUM = i;

    };

};


// 우측 저장 버튼 클릭
GLV_FN.SAVEBTN_CLICK = (e) => {

    let oNList = GLV_BINDATA.ALLDATA.find(a => a.NEW === true);

    if(!oNList) {
        
        GLV_HISTORYDATA.SELECTIDX = GLV_UI.UITABLE.getSelectedIndex();

    };

    GLV_BINDATA.RECENTDATA = [];

    // 최신 데이터 가져오기
    GLV_FN.CHECK_DATA();

    let oKeyData = GLV_BINDATA.KEYWORDDATA,
        oETBCProp = oKeyData.find(a => a.EDIT === true),
        oNoKey = oKeyData.find(a => a.KEY === ''),
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

            GLV_FN.DATA_CHECK(oOrigData);
            GLV_FN.KEYINPUTINACTIVE(oETBCProp);

            break;
        };

};


// 수정한 데이터가 있는지 체크
GLV_FN.DATA_CHECK = (oOrigData) => {

    // 내쪽의 기존 가져온 전체 데이터
    let oAllData = GLV_BINDATA.ALLDATA,
    // 수정 한 값이 있는 아이 찾기
    oModf = oAllData.find(a => a.MODF === true);

    if (Boolean(oModf) === true) { // 수정 한 값 있어!!!!!!!!

        GLV_FN.DATA_COMP(oAllData, oOrigData);


    } else { // 수정한 값 없어!!!!!!!

        // 데이터 저장
        GLV_FN.DATA_DELETE(oOrigData);

    };

};


// 최신 데이터와 수정 데이터 비교
GLV_FN.DATA_COMP = (oAllData, oOrigData) => {

    let editRow = GLV_BINDATA.ALLDATA.find(a => a.MODF === true);

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
    GLV_FN.NEW_DATA(oOrigData);

    // 삭제 데이터 체크
    GLV_FN.DATA_DELETE(oOrigData, editRow);
};


// 신규 데이터 체크
GLV_FN.NEW_DATA = (oOrigData) => {

    //  신규 추가 체크
    // let oNewList = GLV_BINDATA.ALLDATA.filter(a => a.NEW === true),
    let oNewList = GLV_BINDATA.ALLDATA.filter(a => a.NEW === true),
        oKeyList = GLV_BINDATA.KEYWORDDATA.filter(a => a.NEW === true);

    // 신규 추가가 없을 때 리턴
    if(oNewList === undefined || oNewList.length === 0){
        return;
    };

    GLV_HISTORYDATA.NEWKEY = oNewList.KEY;

    for (var i = 0; i < oNewList.length; i++) {

        let addList = {
            KEY: oNewList[i].KEY,
            DESC: oNewList[i].DESC,
            TEXT: oNewList[i].TEXT
        }

        oOrigData.push(addList);

        // 신규와 수정 되었다는 값 제거(xml 데이터 삽입 했을 때)
        oNewList[i].NEW = '';
        oNewList[i].MODF = '';
        oKeyList[i].NEW = '';
        oKeyList[i].MODF = '';

    };

};


// 삭제 데이터 체크
GLV_FN.DATA_DELETE = (oOrigData, editRow) => {

    editRow = editRow;
    
    // 삭제 된 값이 없을 때
    if (GLV_BINDATA.DELETEDATA.length === 0) {
        
        // let editRow = GLV_BINDATA.ALLDATA.find(a => a.MODF === true);

        // 데이터 저장
        GLV_FN.DATA_SAVE(editRow);

        return;
    };


    // 삭제 된 값이 있을 때
    
    for (var idx = 0; idx < GLV_BINDATA.DELETEDATA.length; idx++) {

        for (var i = 0; i < oOrigData.length; i++) {

            if (oOrigData[i].KEY === GLV_BINDATA.DELETEDATA[idx].ORGKEY) {
                oOrigData.splice(i, 1);
            };

        };

    };

    GLV_BINDATA.DELETEDATA = [];

    // 데이터 저장
    GLV_FN.DATA_SAVE();

};


// 데이터 저장
GLV_FN.DATA_SAVE = (editRow) => {

    let oRecent = GLV_BINDATA.RECENTDATA,
        oUpArray = oRecent.sort((a, b) => a.KEY > b.KEY ? 1 : -1);

    console.log(oUpArray);

    let nXML = `<?xml version="${XMLVS}"?>\n`;
    nXML += '<?xml-stylesheet type="text/xsl" href="lang_user.xslt"?>\n';
    nXML += '<XMLConfigSettings>\n';
    nXML += '  <FILEINFO>\n';
    nXML += '      <Author>SAP</Author>\n      <Type>LangUser</Type>\n     <Language>ABAP</Language>\n     <Desc>User specific settings for ABAP</Desc>\n';
    nXML += '  </FILEINFO>\n';
    nXML += '  <EXPANDS>\n';

    for (var i = 0; i < oUpArray.length; i++) {
        nXML += `      <Expand key="${oUpArray[i].KEY}">\n`;
        nXML += `          <Descr>${oUpArray[i].DESC}</Descr>\n`;
        nXML += `          <Text>${oUpArray[i].TEXT}</Text>\n`;
        nXML += '      </Expand>\n';
    };

    nXML += '  </EXPANDS>\n';
    nXML += '</XMLConfigSettings>\n';

    oAPP.fs.writeFileSync("C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor\\abap_user.xml", nXML);

    sap.m.MessageToast.show('저장 되었습니다', {
        duration: 1500,
        animationDuration: 1500,
        at: sap.ui.core.Popup.Dock.CenterCenter
    });

    GLV_FN.SAVE_AFTERBAR();

    setTimeout(() => {

        GLV_FN.SAVE_AFTERSELECT(editRow);

    },0);


};


// 데이터 저장 이후 셀렉트
GLV_FN.SAVE_AFTERSELECT = (editRow) => {

    // 신규일 경우
    if(GLV_HISTORYDATA.NEWKEY != undefined) {

        GLV_HISTORYDATA.SELECTIDX = GLV_BINDATA.ALLDATA.findIndex(a => a.KEY === GLV_HISTORYDATA.NEWKEY);

    // 삭제했을 경우
    } else if(editRow === undefined) {

        GLV_HISTORYDATA.SELECTIDX = -1;

    // 수정했을 경우
    } else {

        GLV_HISTORYDATA.SELECTIDX = GLV_BINDATA.ALLDATA.findIndex(a => a.KEY === editRow.KEY)
    
    };

    GLV_UI.UITABLE.setSelectedIndex(GLV_HISTORYDATA.SELECTIDX);

    GLV_HISTORYDATA.NEWKEY = undefined;

    if(GLV_HISTORYDATA.SELECTIDX > 9) {

        let selRow = (GLV_HISTORYDATA.SELECTIDX +1) - 10;

        GLV_UI.UITABLE.setFirstVisibleRow(selRow);

    };

};


// 저장 이후 우측 바 변경
GLV_FN.SAVE_AFTERBAR = () => {

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


// 코드에디터 줌
GLV_FN.CODEEDITZOOM = () => {

    let codDom = GLV_UI.RCODEEDITOR.getDomRef();

    codDom.style.zoom = GLV_ZOOM;

};

// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 ★★★★★★★★★★★★★★★★★★
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    GLV_FN.CHECK_DATA();

    let watchPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor';

    oAPP.WATCH = oAPP.fs.watch(watchPath, { "recursive":true } ,async (a,b)=>{
       
        // 받아온 파라미터 값 중 b의 값이 'abap_user.xml' 아니라면 리턴
        if(b !== 'abap_user.xml'){return;};

        // 해당 경로에 abap_user.xml 파일이 있는지 체크
        let oFileFind = oAPP.fs.existsSync(`${watchPath}\\abap_user.xml`);

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

        GLV_HISTORYDATA.SELECTLINE = GLV_UI.UITABLE.getSelectedIndex();

        GLV_FN.CHECK_DATA(oUPDLG);

        setTimeout(() => {
            
            GLV_FN.WATCHDESCDATA();

        },100);

        if(GLV_HISTORYDATA.SELECTLINE > 9) {

            let selRow = (GLV_HISTORYDATA.SELECTLINE +1) - 10;

            GLV_UI.UITABLE.setFirstVisibleRow(selRow);

        };
    
    }); 

    GLV_UI.RVBOX.bindElement('/r_editData');
    GLV_UI.RHBAR.bindElement('/r_btnDaTA');
    GLV_UI.SELDESC.bindElement('/r_selectDesc');

    GLV_UI.RCODEEDITOR.addEventDelegate({

        onAfterRendering: function(e) {
            GLV_FN.CODEEDITZOOM();
        }

    });

    GLV_UI.PAGE.setBusy(false);

}; // fn_UIUPdated end


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
                        change: function(e) {
                            GLV_FN.KEYINPUTCHANGE(e);
                        }
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
                        GLV_FN.EDIT_CLICK(e);
                    }
                }),
                new sap.ui.table.RowActionItem({
                    icon: "sap-icon://delete",
                    type: sap.ui.table.RowActionType.Delete,
                    press: function(e) {
                        GLV_FN.DELETE_CLICK(e);
                    }
                })
            ]
        }).addStyleClass('actionBtn'),
        rowSelectionChange: function(e) {
            GLV_FN.LIST_CLICK(e);
        },
        rowHeight: 64,
        rowActionCount: 2,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.Row,
    });


    // 4_4. LIST PAGE ROWACTIONTEMPLATE 생성
    GLV_UI.ROWACTION = new sap.ui.table.RowAction();


    // 5. DESCRIPTION & TEXT PAGE 생성
    GLV_UI.RPAGE = new sap.m.Page({
        showHeader: false
    });


    // 5_1. DESCRIPTION & TEXT PAGE BAR 생성
    GLV_UI.RHBAR = new sap.m.Bar({
        contentRight: new sap.m.Button({
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
        editable: '{VISIBLE}',
        value: '{DESC}',
        change: function(e) {
            GLV_FN.DESCINPUTCHANGE(e);
        }
    });


    // 5_6. DESCRIPTION & TEXT PAGE CODEEDITOR 생성
    GLV_UI.RCODEEDITOR = new sap.ui.codeeditor.CodeEditor({
        type: "abap",
        height: '100%',
        editable: '{VISIBLE}',
        value: '{TEXT}',
        change: function(e) {
            GLV_FN.CODEEDITORCHANGE(e);
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
}; // createUi end