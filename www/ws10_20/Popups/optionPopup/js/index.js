/**
 * 2023-03-16
 * 기능 완료 후 아래 JSON 추가할 것
 * {"MCODE":"LanguTrans", "DESC":"Language Translate",  "ICON":"sap-icon://translate"} <-- json/MenuList.json에 추가할 것 
 */


const oAPP = {
    ui: {},
    fn: {},
    attr: {
        isBusy: false, // 현재 비지 상태 
    },
    common: {},
    onStart: function () {
        this.remote = require('@electron/remote');
        this.ipcRenderer = require('electron').ipcRenderer;
        this.fs = this.remote.require('fs');
        this.app = this.remote.app;
        this.apppath = this.app.getAppPath();
        this.path = this.remote.require('path');
        this.__dirname = __dirname;
        this.USERDATA_PATH = this.remote.app.getPath("userData");

        //WS Main 에서 호출받은 기본 I/F Data 
        oAPP.ipcRenderer.on('if-ws-options-info', (event, data) => {

            //Parent I/F data
            oAPP.IF_DATA = data;

            //Frame set 
            let oFrma = document.getElementById('mainFRAME');
            oFrma.src = "optionS.html";
            oFrma.style.display = "";

        });

        // // user 정보 받기
        // oAPP.ipcRenderer.on("if-ws-options-info", (event, data) => {
        //     oAPP.attr.oUserInfo = data.oUserInfo; // User 정보(필수)
        // });

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- start
         *******************************************************/
        const
            REMOTE = require('@electron/remote'),
            PATH = REMOTE.require('path'),
            CURRWIN = REMOTE.getCurrentWindow(),
            WEBCON = CURRWIN.webContents,
            WEBPREF = WEBCON.getWebPreferences(),
            USERINFO = WEBPREF.USERINFO,
            APP = REMOTE.app,
            APPPATH = APP.getAppPath(),
            LANGU = USERINFO.LANGU,
            SYSID = USERINFO.SYSID;

        // const
        //     WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        //     WSUTIL = require(WSMSGPATH),
        //     WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

        // oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

        oAPP.WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        oAPP.WSUTIL = require(oAPP.WSMSGPATH),
        oAPP.WSMSG = new oAPP.WSUTIL.MessageClassText(SYSID, LANGU);

        oAPP.common.fnGetMsgClsText = oAPP.WSMSG.fnGetMsgClsText.bind(oAPP.WSMSG);

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- end
         *******************************************************/
        
        oAPP.CURRWIN = REMOTE.getCurrentWindow();
        oAPP.IPCRENDERER = oAPP.ipcRenderer;
        oAPP.CURRWIN = REMOTE.getCurrentWindow();
        oAPP.BROWSKEY = oAPP.CURRWIN.webContents.getWebPreferences().browserkey;

    }

};


/***********************************************************
 * Busy 실행 여부 정보 리턴
 ***********************************************************/
oAPP.fn.getBusy = function(){

    return oAPP.attr.isBusy;

};

//Device ready 
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    oAPP.onStart();

}

function fn_getParent() {

    return oAPP;
}

/************************************************************************
 * window 창을 닫을때 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function(){

    // Busy가 실행 중이면 창을 닫지 않는다.
    if(oAPP.fn.getBusy() === true){
        return false;
    }


};