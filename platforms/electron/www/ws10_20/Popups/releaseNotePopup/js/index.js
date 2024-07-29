const oAPP = {
    attr: {},
    common: {},
    onStart: function () {
        
        this.remote = require('@electron/remote');
        this.IPCRENDERER = require('electron').ipcRenderer;
        this.PATH = this.remote.require('path');
        this.APP = this.remote.app;
        this.APPPATH = this.APP.getAppPath();
        this.PATHINFO = require(this.PATH.join(this.APPPATH, "Frame", "pathInfo.js"));
        this.CURRWIN = this.remote.getCurrentWindow();
        this.BROWSKEY = this.CURRWIN.webContents.getWebPreferences().browserkey;

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- start
         *******************************************************/
        const
            REMOTE = oAPP.remote,
            PATH = REMOTE.require('path'),
            CURRWIN = REMOTE.getCurrentWindow(),
            WEBCON = CURRWIN.webContents,
            WEBPREF = WEBCON.getWebPreferences(),
            USERINFO = WEBPREF.USERINFO,
            APP = REMOTE.app,
            APPPATH = APP.getAppPath(),
            LANGU = USERINFO.LANGU,
            SYSID = USERINFO.SYSID;

        const
            WSUTILPATH = PATH.join(this.PATHINFO.WSUTIL),
            WSUTIL = require(WSUTILPATH),
            WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

        oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- end
         *******************************************************/

        // 브라우저 타이틀 적용
        let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B54"); // Release Note
        CURRWIN.setTitle(sTitle);
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