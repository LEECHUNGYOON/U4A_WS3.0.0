(() => {
    "use strict";

    var oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.common = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
    oAPP.PARWIN = oAPP.CURRWIN.getParentWindow();
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain,
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.FS = oAPP.REMOTE.require('fs');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.USERDATA = oAPP.APP.getPath("userData");

    var
        REMOTE = oAPP.REMOTE,
        CURRWIN = REMOTE.getCurrentWindow(),
        WEBCON = CURRWIN.webContents,
        WEBPREF = WEBCON.getWebPreferences();

    oAPP.USERINFO = WEBPREF.USERINFO;



    oAPP.IPCRENDERER.on('if_showHidePopup', (events, oInfo) => {

        oAPP.attr.DEFAULT_OPACITY = oInfo.DEFAULT_OPACITY;
        oAPP.attr.oUserInfo = oInfo.oUserInfo;
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo;


        // const DEFAULT_OPACITY = oInfo.DEFAULT_OPACITY;

        // let oRange = document.getElementById("range");
        // if (oRange) {
        //     oRange.value = DEFAULT_OPACITY * 100;
        // }

        // let oCurrWin = oAPP.REMOTE.getCurrentWindow(),
        //     oParentWin = oCurrWin.getParentWindow();

        // oParentWin.setOpacity(DEFAULT_OPACITY);

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });


    /*************************************************************
     * @function - 테마 정보를 구한다.
     *************************************************************/
    oAPP.fn.getThemeInfo = function (){

        let oUserInfo = oAPP.USERINFO;
        let sSysID = oUserInfo.SYSID;
        
        // 해당 SYSID별 테마 정보 JSON을 읽는다.
        let sThemeJsonPath = oAPP.PATH.join(oAPP.USERDATA, "p13n", "theme", `${sSysID}.json`);
        if(oAPP.FS.existsSync(sThemeJsonPath) === false){
            return;
        }

        let sThemeJson = oAPP.FS.readFileSync(sThemeJsonPath, "utf-8");

        try {
        
            var oThemeJsonData = JSON.parse(sThemeJson);    

        } catch (error) {
            return;
        }

        return oThemeJsonData;

    } // end of oAPP.fn.getThemeInfo


    oAPP.close = () => {

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        oCurrWin.close();

    };

    oAPP.sliderChange = (e) => {

        oAPP.PARWIN.setIgnoreMouseEvents(true);

        let oCurrWin = oAPP.REMOTE.getCurrentWindow(),
            oParentWin = oCurrWin.getParentWindow();

        let iValue = parseInt(e.value),
            opa = iValue / 100;

        oParentWin = oCurrWin.getParentWindow();

        oParentWin.setOpacity(opa);

        if (opa == 1) {
            oAPP.PARWIN.setIgnoreMouseEvents(false);
            return;
        }

    };

    window.oAPP = oAPP;

})();