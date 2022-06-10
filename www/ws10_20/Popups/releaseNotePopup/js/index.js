const oAPP = {
    attr: {},

    onStart: function () {

        this.remote = require('@electron/remote');
        this.IPCRENDERER = require('electron').ipcRenderer;
        this.PATH = this.remote.require('path');
        this.APP = this.remote.app;
        this.APPPATH = this.APP.getAppPath();
        this.PATHINFO = require(this.PATH.join(this.APPPATH, "Frame", "pathInfo.js"));        
        
    },
    // CDN 여부 플래그
    fnGetIsCDN: () => {

        return oAPP.attr.ISCDN || "";

    }, // end of oAPP.fn.fnGetIsCDN

    // 서버 Path
    fnGetServerPath: () => {

        return oAPP.attr.sServerPath;

    },
    // end of oAPP.fn.fnGetServerPath

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    fnGetSettingsInfo: () => {

        // Browser Window option
        var oSettingsPath = oAPP.PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(oSettingsPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    } // end of fnGetSettingsInfo

};

oAPP.attachIpcRender = () => {

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-relnote-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.USERINFO;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;
        oAPP.attr.sServerPath = oInfo.SERVPATH;
        oAPP.attr.ISCDN = oInfo.ISCDN;

        // oAPP.ISADM = oInfo.USERINFO.ISADM;
        oAPP.ISADM = "X";

        var oMainFrame = document.getElementById("mainFRAME");

        switch (oAPP.ISADM) {
            case "X":
                oMainFrame.src = "main.html";
                break;

            default:
                oMainFrame.src = "main_latest.html";
                break;
        }

    });

};

//Device ready 
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    oAPP.onStart();
    oAPP.attachIpcRender();
}

function fn_getParent() {
    return oAPP;

}