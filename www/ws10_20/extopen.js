/**************************************************************************
 * extopen.js
 * ************************************************************************
 * - Example Open Popup
 **************************************************************************/
var REMOTE = require('@electron/remote'),
    IPCRENDERER = require('electron').ipcRenderer,
    CURRWIN = REMOTE.getCurrentWindow(),
    BROWSKEY = CURRWIN.webContents.getWebPreferences().browserkey;

var PATH = REMOTE.require('path');
var APP = REMOTE.app;
var APPPATH = APP.getAppPath();
var WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js");
var WSUTIL = require(WSMSGPATH);


var oAPP = {};


function setBusy(bIsBusy) {

    var oBusy = document.getElementById("u4a_main_load");
    if (!oBusy) {
        return;
    }

    if (bIsBusy) {

        oBusy.classList.remove("u4a_loadersInactive");
        return;

    }

    oBusy.classList.add("u4a_loadersInactive");

}

// 전달받은 html 경로를 Iframe의 경로로 변경한다.
IPCRENDERER.on('if-extopen-url', (event, res) => {

    // BroadCast Event 걸기
    _attachBroadCastEvent();

    CURRWIN.show();

    WSUTIL.setBrowserOpacity(CURRWIN);

    // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
    IPCRENDERER.send(`if-send-action-${BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

    IPCRENDERER.send(`if-send-action-${BROWSKEY}`, { ACTCD: "BROAD_BUSY", PRCCD: "BUSY_OFF" });

    // 현재 윈도우의 닫기 버튼 활성화
    CURRWIN.closable = true;

    var oFrame = document.getElementById("ws_exam");
    if (!oFrame) {
        return;
    }

    setBusy(true);

    oFrame.onload = function () {

        oFrame.contentWindow.document.body.style.margin = "0px";

        setBusy(false);

        // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
		IPCRENDERER.send(`if-send-action-${BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

    };

    oFrame.src = res;

});

/**************************************************
 * BroadCast Event 걸기
 **************************************************/
function _attachBroadCastEvent(){

    oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${BROWSKEY}`);        

    oAPP.broadToChild.onmessage = function(oEvent){

        var _PRCCD = oEvent?.data?.PRCCD || undefined;

        if(typeof _PRCCD === "undefined"){
            return;
        }

        //프로세스에 따른 로직분기.
        switch (_PRCCD) {
            case "BUSY_ON":

                //BUSY ON을 요청받은경우.
                // oAPP.fn.setBusyIndicator("X", {ISBROAD:true});
                break;

            case "BUSY_OFF":
                //BUSY OFF를 요청 받은 경우.
                // oAPP.fn.setBusyIndicator("",  {ISBROAD:true});
                break;

            default:
                break;
        }

    };

} // end of _attachBroadCastEvent

//부모 / 자식 영역 이벤트 수신 
window.addEventListener('message', function (e) {

    var oMsg = e.data,
        MODE = oMsg.MODE,
        oCurrWin = REMOTE.getCurrentWindow(),
        oWebCon = oCurrWin.webContents,
        oWebPref = oWebCon.getWebPreferences();

    // 다른곳에서 메시지 전송 시 스킵하기 위한 로직.
    if (oMsg.TRCOD != "ELEC") {
        return;
    }

    if (oMsg.MODE == "E") {
        return;

    }

    oMsg.BROWSERKEY = oWebPref.browserkey;

    IPCRENDERER.send("if-exam-move", oMsg);

    switch (MODE) {

        case "B":

            // oCurrWin.close();
            oCurrWin.hide();            

            break;
    }

});