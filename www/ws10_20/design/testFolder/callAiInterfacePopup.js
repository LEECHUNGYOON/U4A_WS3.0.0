
var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

const WSUTIL = parent.require(parent.PATHINFO.WSUTIL);
const CURRWIN = REMOTE.getCurrentWindow();


module.exports = function(){

    //broad cast 설정.

        
    var sPopupName = "TESTAIPOPUP";
    // var sPopupName = "BINDPOPUP";

    // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
    var oResult = oAPP.common.getCheckAlreadyOpenWindow(sPopupName);
    if (oResult.ISOPEN) {

        // 전체 자식 윈도우에 Busy 끈다.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});
        
        parent.setBusy("", {});

        return;
    }

    // // Binding Popup 에서 콜백 받을 준비를 한다.
    // IPCRENDERER.on("if-bindPopup-callback", oAPP.fn.fnBindPopupIpcCallBack);

    let oThemeInfo = parent.getThemeInfo(); // theme 정보

    var sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
        oDefaultOption = parent.require(sSettingsJsonPath);
    
        oBrowserOptions = JSON.parse(JSON.stringify(oDefaultOption.browserWindow));

    oBrowserOptions.title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A15"); // Binding Popup
    // oBrowserOptions.width = 1000;
    oBrowserOptions.width = 1280;
    oBrowserOptions.height = 700;
    oBrowserOptions.minWidth = 900;
    oBrowserOptions.minHeight = 650;
    oBrowserOptions.autoHideMenuBar = true;
    oBrowserOptions.parent = REMOTE.getCurrentWindow();
    oBrowserOptions.opacity = 0;
    // oBrowserOptions.closable = false;
    oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
    oBrowserOptions.webPreferences.partition = parent.getSessionKey();
    oBrowserOptions.webPreferences.browserkey = parent.getBrowserKey();
    oBrowserOptions.webPreferences.OBJTY = sPopupName;
    oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

    // 브라우저 오픈
    var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
    REMOTEMAIN.enable(oBrowserWindow.webContents);

    // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
    let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
    oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

    // 브라우저 상단 메뉴 없애기
    oBrowserWindow.setMenu(null);

    // 실행할 URL 적용
    var sUrlPath = parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
            "testFolder", "AiInterface", "frame.html");

    // var sUrlPath = parent.getPath(sPopupName);
    oBrowserWindow.loadURL(sUrlPath);


    //broadcase 통신 API 모듈 js path 정보.
    //(design/bindPopupHandler/broadcastChannelBindPopup.js)
    var _channelKey = parent.getSessionKey() + "_TEST_AI";


    // // no build 일 경우에는 개발자 툴을 실행한다.
    // if (!APP.isPackaged) {
    //     oBrowserWindow.webContents.openDevTools();
    // }

    // parent.require(parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
    //     "testFolder", "testAI.js"));
    
    // 채널이름 설정
    const broadcast = new BroadcastChannel(_channelKey);

    // 메시지 수신
    broadcast.onmessage = async function(oEvent){
        console.log(oEvent);

        parent.setBusy("X");

        // let _sRoot;

        // let _OBJID = oEvent?.data?.LIBDATA?.OBJID || "APP";

        // if(typeof _sRoot === "undefined"){
        //     alert("OBJID 없음...");

        //     parent.setBusy("");

        //     return;
        // }

        require(parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
            "UAI", "parseAiLibraryData.js"))(oEvent.data.LIBDATA, oAPP);


        // require(parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
        //     "UAI", "testAI.js")).call(oAPP, oEvent);

    };


    // 브라우저가 활성화 될 준비가 될때 타는 이벤트
    oBrowserWindow.once('ready-to-show', () => {

        // // 부모 위치 가운데 배치한다.
        // oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        // 부모 위치 가운데 배치한다.
        WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

    });

    // 브라우저가 오픈이 다 되면 타는 이벤트
    oBrowserWindow.webContents.on('did-finish-load', function () {

        // 부모 위치 가운데 배치한다.
        WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

        // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
        WSUTIL.setBrowserOpacity(oBrowserWindow);

        var oBindPopupData = {
            oUserInfo: parent.getUserInfo(), // 로그인 사용자 정보 (필수)
            oThemeInfo: oThemeInfo, // 테마 개인화 정보
            oAppInfo: parent.getAppInfo(),
            servNm: parent.getServerPath(),
            SSID: parent.getSSID(),
            channelKey : _channelKey
        };

        oBrowserWindow.webContents.send('if_AItest', oBindPopupData);

        
        // 전체 자식 윈도우에 Busy 끈다.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});
        
        parent.setBusy("", {});

        
        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }



    });

    // 브라우저를 닫을때 타는 이벤트
    oBrowserWindow.on('closed', () => {

        oBrowserWindow = null;

        broadcast.close();

        // // Binding Popup 에서 콜백 이벤트 해제
        // IPCRENDERER.off("if-bindPopup-callback", oAPP.fn.fnBindPopupIpcCallBack);
        
        CURRWIN.focus();
        
        parent.setBusy("", {});

    });

};