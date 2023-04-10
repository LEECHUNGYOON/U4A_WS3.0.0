// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 채널 명 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. INIT => 최초 로드 시 공통 세팅만 담당 !!!!!!! 공통은 최대한 여기에 !!!!!!!!
    2. NEW_SERVER => 서버 버튼 생성 담당
    3. CLOSESERVER => 오픈 된 서버 창 닫기 담당
    4. ADDPESO
    5. REMOVEPESO
    6. RECALL => 개인화 영역 재호출 담당
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

let oAPP = {};

// 최초 로드 시 공통 부분 => 공통 부분은 최대한 여기에 !!!! 중요!!!!!
// 기본적인 플로팅 메뉴 틀 등등... !!!!!!!!!!!!!!!!!!!!
exports.INIT = (UI, REMOTE, GLV_FN) => {
    console.log(UI);
    console.log(REMOTE);

    oAPP = REMOTE;
    oAPP.UI = UI;
    oAPP.FN = GLV_FN;
    oAPP.T_WRAPSYSID = [];
    oAPP.T_SYSID = [];
    oAPP.T_SID = [];
    oAPP.T_OID = {};
    oAPP.O_PRESS = null;
    oAPP.SELECTED = undefined;
};

// 서버 생성
exports.NEW_SERVER = (DATA) => {

    // 오픈 된 창의 sysid를 oAPP.T_WRAPSYSID에 누적
    // 이 배열은 중복 창 닫을 때 필요
    console.log(DATA);
    oAPP.T_WRAPSYSID.push(DATA.SSID);

    SERVERLIST_UPDATE(DATA);
};

// 서버를 닫을 때 => 누적 sysid계산 =>
// 0일 경우 플로팅 메뉴를 닫는다.
exports.CLOSE_SERVER = (DATA) => {

    // 삭제할 서버가 없다면 리턴
    if(oAPP.T_WRAPSYSID.includes(DATA.SSID) === false) {
        return;
    }
    
    let delIDX = oAPP.T_WRAPSYSID.indexOf(DATA.SSID);

    oAPP.T_WRAPSYSID.splice(delIDX,1);

    SERVERLIST_UPDATE(DATA);
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 3.0에서 신호 받아서 개인화 탭 바 콜 !!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.RECALL = (DATA) => {
    // debugger;

    // 변수 명 바꿔야 함!!!!!!!!!!!!!!!!!!! 지금은 테스트로 그냥 지정
    let oMainContCD = oAPP.UI.PAGE7.getContent()[0].getModel(),
        oPrgbt = oAPP.UI.SVBTN.getItems(),
        oPressTxt;

    for(var i = 0; i < oPrgbt.length; i++) {
        if(oPrgbt.find(a => a.getModel().oData.root[i].ACTIVE === true)) {
            oPressTxt = oPrgbt[i].getModel().oData.root[i].key;
        }
    }

    // 받아온 신호의 서버가 플로팅 메뉴에 없으면
    if(oAPP.T_WRAPSYSID.includes(DATA.SSID) === false){
        return;
    };

    // 이 부분 순서 다시 고려
    if(oMainContCD !== undefined) {
        if(oPressTxt !== DATA.SSID) {
            // debugger;
            // 이미 활성화가 되어있다면 그려져있는 개인화 페이지를 삭제해라
            oAPP.UI.PAGE7.getContent()[0].getContent()[0].removeAllPages();
            oAPP.UI.PAGE7.getContent()[0].setModel();

        }
            
    };

    // 받아온 신호의 서버 강제 PRESS EVENT
    SERVERLIST_FIREVENT(DATA);

    // 우측 상단 서버 별 기본 메뉴 구성 및 커스텀 데이터 세팅
    oAPP.FN.DEFAULT_MENU(DATA.SSID, DATA.TABID);
    // oAPP.FN.DEFAULT_MENU_CUSTOMDATA(DATA.SSID);

    oAPP.FN.CALL_FLOAT_TOGGLE(DATA);
    
    // oAPP.FN.TAB_SELECT(DATA.TABID);
    TAB_FIRESELECT(DATA);

};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 개인화 추가 버튼 클릭 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.ADDPESO = function(DATA) {
    // 받아와야 할 값
    // => 활성화 되어있는 서버
    // => 추가 할 대상 : DATA.CARRAY
    let addSevId = DATA;

    oAPP.FN.ADD_SERVER_ITEM(addSevId);
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 개인화 삭제 버튼 클릭 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.REMOVEPESO = function(DATA) {
    // 받아와야 할 값
    // => 활성화 되어있는 서버
    // => 삭제 할 대상 : DATA.RARRAY

    // ;

    let removeSevId = DATA;

    oAPP.FN.REMOVE_SERVER_ITEM(removeSevId);
};


// 서버 추가 삭제 펑션
function SERVERLIST_UPDATE(DATA) {

    // 누적 배열의 길이가 0이면 플로팅 메뉴 종료
    if(oAPP.T_WRAPSYSID.length === 0) {

        oAPP.WIN.close();

        return;

    };

    // 서버 sysid 중복 제거 => 추가 & 삭제 동일
    oAPP.T_SYSID = oAPP.T_WRAPSYSID.filter((element, index) => {

        return oAPP.T_WRAPSYSID.indexOf(element) === index;

    });

    // CLOSE_SERVER 체크 로직
    if(DATA.PRCCD !== 'CLOSE_SERVER'){

        SERVER_ADD(DATA);

    } else {

        SERVER_CLOSE(DATA);

    };
};

// SERVERLIST_UPDATE의 파라미터 중 PRCCD가 CLOSE_SERVER가 아닐 때 펑션
function SERVER_ADD(DATA) {
    // debugger;
    let PRESSVALUE;
        // 변수 명 바꿔야 함!!!!!!!!!!!!!!!!!!! 지금은 테스트로 그냥 지정
        let oMainContCD = oAPP.UI.PAGE7.getContent()[0].getModel();

    // 추가하는 서버가 이미 활성화 되어있는 서버라면
    // 창 개수 만 늘려주고 리턴
    if(oAPP.O_PRESS !== null){
        PRESSVALUE = oAPP.O_PRESS.getModel().oData.root.find(a => a.ACTIVE === true).key;

        if(PRESSVALUE === DATA.SSID) {
            return;
        };
    };

    for(var i = 0; i < oAPP.T_SYSID.length; i++) {
        oAPP.T_OID = {
            text: oAPP.T_SYSID[i],            // 메뉴에 보여질 서버 텍스트
            key: oAPP.T_SYSID[i],             // 서버 버튼의 키 값
            ACTIVE: false
        };

        oAPP.T_SID[i] = oAPP.T_OID;
    };

    // 이 부분 순서 다시 고려
    if(oMainContCD !== undefined) {
            
        // 이미 활성화가 되어있다면 그려져있는 개인화 페이지를 삭제해라
        oAPP.UI.PAGE7.getContent()[0].getContent()[0].removeAllPages();
    };
    // 우측 하단 서버 버튼 생성 펑션
    oAPP.FN.SERVER_BUTTON_CREATE(DATA.SSID);
    // 우측 상단 서버 별 기본 메뉴 구성 펑션
    oAPP.FN.DEFAULT_MENU(DATA.SSID);
    // 우측 하단 서버 버튼 활성화 펑션
    SERVERLIST_FIREVENT(DATA);
};

// SERVERLIST_UPDATE의 파라미터 중 PRCCD가 CLOSE_SERVER가 맞을 때 펑션
function SERVER_CLOSE(DATA) {
    // debugger;
    // 활성화 되어있는 서버 버튼의 key값 매핑
    let pressid = oAPP.O_PRESS.getModel().oData.root.find(a => a.ACTIVE === true).key;

    // T_WRAPSYSIDArray => sysid가 같은 아이들끼리 묶어서 수량 체크
    let T_WRAPSYSIDArray = oAPP.T_WRAPSYSID.reduce((accu, curr) => {  

        accu[curr] = (accu[curr] || 0)+1; 
        
        return accu; 
        
    }, {});

    console.log(oAPP.T_WRAPSYSID);
    console.log(T_WRAPSYSIDArray);

    // 닫으려고 하는 창의 서버 아이디가 같은 창이 여러개 일 때
    if(oAPP.T_WRAPSYSID.includes(DATA.SSID) === true) {

        return SERVERLIST_FIREVENT(DATA);

    };

    // 서버 버튼 중에 DATA.SSID가 삭제되어 없다면
    if(T_WRAPSYSIDArray[DATA.SSID] === undefined) {
        // debugger;
        // T_SID 길이를 구해서 DATA.SSID와 같은 텍스트인 버튼 제거
        for(var i = 0; i < oAPP.T_SID.length; i++) {
            if(oAPP.T_SID[i].key === DATA.SSID) {
                oAPP.T_SID.splice(i,1);
            }
        }
        
    };

    if(pressid !== DATA.SSID){

        let oRemoveItm = oAPP.UI.SVBTN.getItems().find(a => a.getText() === DATA.SSID);
        
        oAPP.UI.SVBTN.removeItem(oRemoveItm);
        
        oAPP.FN.SERVER_ZONE_HEIGHT();

        return;

    } else {

        DATA.SSID = oAPP.T_SID[0].key;
        
    };

    // 우측 하단 서버 버튼 생성 펑션
    oAPP.FN.SERVER_BUTTON_CREATE(DATA.SSID);
    // 우측 상단 서버 별 기본 메뉴 구성 펑션
    oAPP.FN.DEFAULT_MENU(DATA.SSID);
    // 우측 하단 서버 버튼 활성화 펑션
    SERVERLIST_FIREVENT(DATA);    
};

// 오픈 된 서버에 대한 강제 EVENT 버튼
function SERVERLIST_FIREVENT(DATA){
    // debugger;
    let SERVBTTON = oAPP.UI.SVBTN,
        SERVBTTONITM = SERVBTTON.getItems();

        for(var i = 0; i < SERVBTTONITM.length; i++) {
            let SERVBTTONITMKEY = SERVBTTONITM[i].getModel().oData.root[i].key;

            if(SERVBTTONITMKEY === DATA.SSID){
                SERVBTTONITM[i].firePress();
                // press를 지우는 게 없어
                SERVBTTONITM[i].getModel().oData.root[i].ACTIVE = true;
                oAPP.O_PRESS = SERVBTTONITM[i];
                // return;
            } else {

                SERVBTTONITM[i].getModel().oData.root[i].ACTIVE = false;
            };
        };
};

// 아이콘 탭바 강제 EVENT
function TAB_FIRESELECT (RECALLID){
    // debugger;
    oAPP.SELECTED = RECALLID.TABID;

    let intver = setInterval(() => {
        let oMainCont = oAPP.UI.PAGE7.getContent()[0],
            oMainContBM = oMainCont.getModel();
        if(oMainContBM !== undefined){
            clearInterval(intver);
            oMainCont.fireSelect();
        }
    },0);

};