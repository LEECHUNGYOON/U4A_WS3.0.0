var oAPP = {};
oAPP.attr = {};
oAPP.fn = {};
oAPP.events = {};
oAPP.common = {};

// 현재 비지 상태 
oAPP.attr.isBusy = "";

oAPP.REMOTE = require('@electron/remote');
oAPP.FS = oAPP.REMOTE.require('fs');
oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
oAPP.IPCRENDERER = require('electron').ipcRenderer;
oAPP.APP = oAPP.REMOTE.app;
oAPP.PATH = oAPP.REMOTE.require('path');
oAPP.RANDOM = require("random-key");
oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
oAPP.BROWSKEY = oAPP.CURRWIN.webContents.getWebPreferences().browserkey;

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

    oAPP.WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    oAPP.WSUTIL = require(oAPP.WSMSGPATH),
    oAPP.WSMSG = new oAPP.WSUTIL.MessageClassText(SYSID, LANGU);

// const
//     WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
//     WSUTIL = require(WSMSGPATH),
//     WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

oAPP.common.fnGetMsgClsText = oAPP.WSMSG.fnGetMsgClsText.bind(oAPP.WSMSG);

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

    try {

        var oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();    

    } catch (error) {
        return;
    }    

    return oWebPref.partition;

}

function getBrowserKey() {

    let oCurrWin = oAPP.REMOTE.getCurrentWindow();
    if (oCurrWin.isDestroyed()) {
        return;
    }

    try {

        var oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences();    

    } catch (error) {
        return;
    }
    

    return oWebPref.browserkey;

}


/***********************************************************
 * Busy 실행 여부 정보 리턴
 ***********************************************************/
oAPP.fn.getBusy = function(){

    return oAPP.attr.isBusy;

};

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    // console.log("onDeviceReady");

    var oWs_frame = document.getElementById("ws_editorframe");
    if (!oWs_frame) {
        return;
    }

    oWs_frame.src = "editor.html";

}

oAPP.IPCRENDERER.on('if-editor-info', function (event, res) {

    // console.log("if-editor-info");

    setEditorInfo(res);

    onDeviceReady();

});

document.addEventListener('DOMContentLoaded', function () {

    // console.log("DOMContentLoaded");

});