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