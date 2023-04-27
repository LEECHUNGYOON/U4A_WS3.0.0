/*
    var floatMenu = require(oAPP.path.join(__dirname, 'floatingMenu/js/open.js'));
    floatMenu.winOpt(REMOTE, SCREEN, _DIRNAME);
    정확히 알고있어야 설명도 가능!!!!!
    설명 ******************
    REMOTE => 현재 oAPP.remote 이다
    SCREEN => 사용자의 화면 정보를 담는 파라미터
    _DIRNAME => floating 메뉴 폴더 직전의 경로 www까지
*/

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 채널 명 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. OPEN => 파라미터를 받아서 새로운 브라우저를 오픈해라
    2. close => 외부에서 플로팅 메뉴를 닫아라
    3. SEND => 플로팅 메뉴쪽으로 보내라
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/* ================================================================= */
/* 내부 전역 변수 
/* ================================================================= */
// let oWIN = null,
//     oToggle = null,
//     oNum = 1;

/* ================================================================= */
/* 내부 전역 펑션 
/* ================================================================= */

// 플로팅 window 종료 처리
// 펑션을 광역으로 빼주는 이유는 문제가 있을 시 이 곳만 집중하면 되기때문 !!!!! && 이벤트를 add했으면 remove도 해줘야 하기 때문
function gfn_close() {
  
    if (typeof floatwin(REMOTE) === 'undefined') { return; }

    //추가 로직이 잇으면 넣어야함!!!!
    //
    //

    floatwin(REMOTE).close();
    // oWIN = null;

};

// 플로팅 메뉴가 이미 열려있는지 확인
// 없으면 null
// 있으면 "floatingMenu": true
floatwin = (REMOTE) =>{

    // let f_browserWindow = oAPP.remote.BrowserWindow, 
    let f_browserWindow = REMOTE.BrowserWindow, 
        o_allWindows = f_browserWindow.getAllWindows(),
        o_allWindowsLeng = o_allWindows.length;

    for(var i=0; i < o_allWindowsLeng; i++) {

        let o_webContents = o_allWindows[i].webContents,
            o_webPreferences = o_webContents.getWebPreferences();
            
        if(typeof o_webPreferences.floatingMenu === "undefined"){continue;}
    
        return o_allWindows[i];
        
    };

    return undefined;
}


/* ================================================================= */
/* Export Module Function - 플로팅 메뉴 실행 
/* ================================================================= */

// REMOTE   => oAPP.remote
// SCREEN   => 사용자의 윈도우 스크린
// _DIRNAME => 일렉트론의 www까지의 주소
// SSID     => 시스템 아이디
exports.open = function(REMOTE, SCREEN, _DIRNAME, SSID) {
    console.log('2. 오픈 할 때 여기를 타');

    let oFloatWin = floatwin(REMOTE);
    
    //현재 윈도우가 이전에 호출 된 상태여부 점검
    if (typeof oFloatWin !== "undefined") {
        //이전에 호출 된 상태라면 I/F 코드 호출
        oFloatWin.webContents.send("IF-WS30-FLOARTMENU", { PRCCD: "NEW_SERVER", SSID: SSID});

        oFloatWin.focus();

        return;

    };

    // webPreferences의 floatingMenu는 플로팅 메뉴가 생성이 됐는지 여부
    var op = {
        "x": 0,
        "y": 0,
        "height": SCREEN.availHeight,
        "width": SCREEN.availWidth,
        "transparent": true,
        "show": false,
        "modal":false,
        "frame": false,
        "maximizable": false,
        "minimizable": false,
        'resizable': false,
        "title": "U4A Workspace - Floating Menu",
        "icon":"www/img/logo.png",
        "webPreferences": {
            "devTools": true,
            "nodeIntegration": true,
            "enableRemoteModule": true,
            "contextIsolation": false,
            "nativeWindowOpen": true,
            "webSecurity": false,
            "webviewTag": true,
            "floatingMenu": true,
            "OBJTY" : "FLTMENU"
        }
    };

    var oWIN = new REMOTE.BrowserWindow(op); // 상단의 옵션을 갖는 새로운 윈도우 창

    var url = `file://${_DIRNAME}/floatingMenu/index.html`;

    oWIN.loadURL(url); // 해당 url을 로드 해
    // 브라우저 로드 밑에
    // remote소스 쓰기 !!!!!!
    var remote = require('@electron/remote');
    remote.require('@electron/remote/main').enable(oWIN.webContents);

    oWIN.webContents.on('did-finish-load', function() {
        //호출대상 윈도우 oWIN(현재 상태는 index.html)  <<<<<<=====
        //로드가 완료되면 수행되는 이벤트!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        console.log('호출대상 윈도우가 로드가 완료되면 수행돼는 이벤트!!!!');

        // 일렉트론이 노빌드인 상태에서만
        if (!REMOTE.app.isPackaged) {
            oWIN.webContents.openDevTools();
        };

        oWIN.webContents.send('IF-WS30-FLOARTMENU', { PRCCD: "INIT", SSID: SSID});

    });

    oWIN.focus();
};


exports.isOPEND = ()=>{

    var isOpen = false;

    if(typeof floatwin(REMOTE) !== "undefined"){
        isOpen = true;
    }

    return  isOpen;

}

/* ================================================================= */
/* Export Module Function - 플로팅 메뉴 종료 
/* ================================================================= */
exports.close = function() {

    if (typeof floatwin(REMOTE) === "undefined") { return; };

    gfn_close();

};


/* ================================================================= */
/* Export Module Function - 메인 -> 플로팅 메뉴 I/F 통신
/* ================================================================= */
exports.send = function(chid, params) {

    if (typeof floatwin(REMOTE) === "undefined") {
        return;
    };

    floatwin(REMOTE).webContents.send(chid, params);
};