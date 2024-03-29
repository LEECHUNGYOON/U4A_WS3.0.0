
document.addEventListener('DOMContentLoaded', () => {

    (() => {
        "use strict";

        window.oAPP = {};

        oAPP.REMOTE = require('@electron/remote');
        oAPP.CURRWIN = oAPP.REMOTE.getCurrentWindow();
        oAPP.PARWIN = oAPP.CURRWIN.getParentWindow();
        oAPP.IPCRENDERER = require('electron').ipcRenderer;

        oAPP.IPCRENDERER.on('if_showHidePopup', (events, oInfo) => {

            const DEFAULT_OPACITY = oInfo.DEFAULT_OPACITY;

            let oRange = document.getElementById("range");
            if (oRange) {
                oRange.value = DEFAULT_OPACITY * 100;
            }

            let oCurrWin = oAPP.REMOTE.getCurrentWindow(),
                oParentWin = oCurrWin.getParentWindow();

            oParentWin.setOpacity(DEFAULT_OPACITY);

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

            if(opa == 1){
                oAPP.PARWIN.setIgnoreMouseEvents(false);
                return;
            }

        };

    })();



});