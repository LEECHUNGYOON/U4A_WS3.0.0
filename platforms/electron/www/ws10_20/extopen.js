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
    oAPP.fn = {};
    oAPP.attr = {};

    oAPP.attr.isBusy = ""; // 현재 busy 상태



/***********************************************************
 * 스르륵 나타나게 하는 효과
 ***********************************************************/
function setFadeIn(element, duration = 400) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let start = null;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);

        if (progress < duration) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}


/***********************************************************
 * 현재 Busy의 상태를 구한다.
 ***********************************************************/
oAPP.fn.getBusy = function(){

    return oAPP.attr.isBusy;

}; // end of oAPP.fn.getBusy


/***********************************************************
 * 브라우저 처음 실행 시 보여지는 Busy Indicator
 ***********************************************************/
oAPP.fn.setBusyLoading = function(bIsBusy) {

    var oBusy = document.getElementById("u4a_main_load");
    if (!oBusy) {
        return;
    }

    if (bIsBusy) {

        oBusy.classList.remove("u4a_loadersInactive");
        return;

    }

    oBusy.classList.add("u4a_loadersInactive");

}; // end of oAPP.fn.setBusyLoading

/***********************************************************
 * Busy 켜기 끄기
 ***********************************************************/
oAPP.fn.setBusyIndicator = function(bIsBusy, sOption){

    oAPP.attr.isBusy = bIsBusy;

    var _ISBROAD = sOption?.ISBROAD || undefined;

    var oBusy = document.getElementById("u4aWsBusyIndicator");

    if (!oBusy) {
        return;
    }

    if (bIsBusy === "X") {

        oBusy.style.visibility = "visible";

        // 브라우저 창 닫기 버튼 비활성
        CURRWIN.closable = false;

        //다른 팝업의 BUSY ON 요청 처리.
        if(typeof _ISBROAD === "undefined"){
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});
        }      

    } else {

        oBusy.style.visibility = "hidden";

        // 브라우저 창 닫기 버튼 활성
        CURRWIN.closable = true;

        //다른 팝업의 BUSY OFF 요청 처리.            
        if(typeof _ISBROAD === "undefined"){
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});
        }

    }

}; // end of oAPP.fn.setBusyIndicator

// 전달받은 html 경로를 Iframe의 경로로 변경한다.
IPCRENDERER.on('if-extopen-url', (event, res) => {

    // BroadCast Event 걸기
    _attachBroadCastEvent();    

    var oFrame = document.getElementById("ws_exam");
    if (!oFrame) {
        return;
    }
    
    // 화면 처음 시작 시 실행되는 loadingbar 실행
    oAPP.fn.setBusyLoading(true);

    oFrame.onload = function () {

        oFrame.contentWindow.document.body.style.margin = "0px";        

        // 브라우저 활성화
        // CURRWIN.show();
        
        // WSUTIL.setBrowserOpacity(CURRWIN);

        // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
        IPCRENDERER.send(`if-send-action-${BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

        IPCRENDERER.send(`if-send-action-${BROWSKEY}`, { ACTCD: "BROAD_BUSY", PRCCD: "BUSY_OFF" });        

        // 화면 처음 시작 시 실행되는 loadingbar 실행 종료
        oAPP.fn.setBusyLoading(false);

        // 화면이 스르륵 나타나게 하는 효과
        setFadeIn(oFrame);

        // 현재 윈도우의 닫기 버튼 활성화
        CURRWIN.closable = true;

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
                oAPP.fn.setBusyIndicator("X", {ISBROAD:true});
                break;

            case "BUSY_OFF":

                //BUSY OFF를 요청 받은 경우.
                oAPP.fn.setBusyIndicator("",  {ISBROAD:true});
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

window.onbeforeunload = function(){

    // 창 닫을 때 현재 Busy가 켜있다면 종료시키지 못하게 한다.
    if(oAPP.fn.getBusy() === "X"){
        return false;
    }


};