var oAPP = {};
oAPP.attr = {};
oAPP.fn = {};
oAPP.events = {};
oAPP.common = {};

oAPP.REMOTE = require('@electron/remote');
oAPP.FS = oAPP.REMOTE.require('fs');
oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
oAPP.IPCRENDERER = require('electron').ipcRenderer;
oAPP.APP = oAPP.REMOTE.app;
oAPP.PATH = oAPP.REMOTE.require('path');
oAPP.RANDOM = require("random-key");

/*******************************************************
 * 메시지클래스 텍스트 작업 관련 Object -- start
 *******************************************************/
const
    CURRWIN = REMOTE.getCurrentWindow(),
    WEBCON = CURRWIN.webContents,
    WEBPREF = WEBCON.getWebPreferences(),
    USERINFO = WEBPREF.USERINFO,
    LANGU = USERINFO.LANGU,
    SYSID = USERINFO.SYSID;

const
    WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    WSUTIL = require(WSMSGPATH),
    WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

/*******************************************************
 * 메시지클래스 텍스트 작업 관련 Object -- end
 *******************************************************/

function getEditorInfo() {
    return oAPP.attr.oEditorInfo;
}

function setEditorInfo(oEditorInfo) {
    oAPP.attr.oEditorInfo = oEditorInfo;
}

function getSessionKey() {

    let oCurrWin = oAPP.REMOTE.getCurrentWindow();
    if (oCurrWin.isDestroyed()) {
        return;
    }

    let oWebCon = oCurrWin.webContents,
        oWebPref = oWebCon.getWebPreferences();

    return oWebPref.partition;

}

function getBrowserKey() {

    let oCurrWin = oAPP.REMOTE.getCurrentWindow();
    if (oCurrWin.isDestroyed()) {
        return;
    }

    let oWebCon = oCurrWin.webContents,
        oWebPref = oWebCon.getWebPreferences();

    return oWebPref.browserkey;

}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    console.log("onDeviceReady");

    var oWs_frame = document.getElementById("ws_editorframe");
    if (!oWs_frame) {
        return;
    }

    oWs_frame.src = "editor.html";

}

oAPP.IPCRENDERER.on('if-editor-info', function (event, res) {

    console.log("if-editor-info");

    setEditorInfo(res);

    onDeviceReady();

});

document.addEventListener('DOMContentLoaded', function () {

    console.log("DOMContentLoaded");

});