(() => {
    "use strict";

    window.oAPP = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCRENDERER = require('electron').ipcRenderer;

    oAPP.IPCRENDERER.on('if_showHidePopup', (events, oInfo) => {

        oAPP.info = oInfo;

    });

    oAPP.close = () => {

        let bIsPin = oAPP.info.ISPIN,
            oCurrWin = oAPP.REMOTE.getCurrentWindow(),
            oParentWin = oCurrWin.getParentWindow();

        oParentWin.setOpacity(1);
        oParentWin.setIgnoreMouseEvents(false);

        if (!bIsPin) {
            oParentWin.setAlwaysOnTop(false);
        }

        oParentWin.focus();

        oCurrWin.close();

    };

})();