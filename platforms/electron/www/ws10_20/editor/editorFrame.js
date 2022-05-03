var oAPP = {};
oAPP.attr = {};
oAPP.fn = {};
oAPP.events = {};

oAPP.REMOTE = require('@electron/remote');
oAPP.FS = oAPP.REMOTE.require('fs');
oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
oAPP.IPCRENDERER = require('electron').ipcRenderer;
oAPP.APP = oAPP.REMOTE.app;
oAPP.PATH = oAPP.REMOTE.require('path');
oAPP.RANDOM = require("random-key");


function getEditorInfo() {
    return oAPP.attr.oEditorInfo;
}

function setEditorInfo(oEditorInfo) {
    oAPP.attr.oEditorInfo = oEditorInfo;
}

function getSessionKey() {

    var oCurrWin = oAPP.REMOTE.getCurrentWindow(),
        oWebCon = oCurrWin.webContents,
        oWebPref = oWebCon.getWebPreferences();

    return oWebPref.partition;

}

function getBrowserKey() {

    var oCurrWin = oAPP.REMOTE.getCurrentWindow(),
        oWebCon = oCurrWin.webContents,
        oWebPref = oWebCon.getWebPreferences();

    return oWebPref.browserkey;

}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    var oWs_frame = document.getElementById("ws_editorframe");
    if (!oWs_frame) {
        return;
    }

    oWs_frame.src = "editor.html";

}

oAPP.IPCRENDERER.on('if-editor-info', function (event, res) {

    setEditorInfo(res);

});