const oAPP = {
    attr: {},
    onStart:function(){
        this.remote = require('@electron/remote');
        this.ipcRenderer = require('electron').ipcRenderer;
        this.fs = this.remote.require('fs');
        this.app = this.remote.app;
        this.apppath = this.app.getAppPath();
        this.path = this.remote.require('path');
        this.__dirname = __dirname;
        this.USERDATA_PATH = this.remote.app.getPath("userData");
        

        //WS Main 에서 호출받은 기본 I/F Data 
        oAPP.ipcRenderer.on('option-initData', (event, data) => {

            //Parent I/F data
            oAPP.IF_DATA = data;

            //Frame set 
            var oFrma = document.getElementById('mainFRAME');
            oFrma.src = "optionS.html";
            oFrma.style.display = "";

        });

        // user 정보 받기
        oAPP.ipcRenderer.on("if-ws-options-info", (event, data) => {
            oAPP.attr.oUserInfo = data.oUserInfo; // User 정보(필수)
        });
        
    }    
    
};

//Device ready 
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    oAPP.onStart();
   
}

function fn_getParent(){

    return oAPP;
}