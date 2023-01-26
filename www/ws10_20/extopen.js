/**************************************************************************
 * extopen.js
 * ************************************************************************
 * - Example Open Popup
 **************************************************************************/
var REMOTE = require('@electron/remote'),
    IPCRENDERER = require('electron').ipcRenderer;

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

    var oFrame = document.getElementById("ws_exam");
    if (!oFrame) {
        return;
    }

    setBusy(true);

    oFrame.onload = function () {

        oFrame.contentWindow.document.body.style.margin = "0px";

        setBusy(false);

    };

    oFrame.src = res;

});

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