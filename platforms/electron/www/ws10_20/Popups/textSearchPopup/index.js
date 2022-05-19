let oAPP = (() => {
    "use strict";

    var oAPP = {};
    oAPP.fn = {};

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        PARWIN = CURRWIN.getParentWindow(),
        PARCON = PARWIN.webContents;



    oAPP.fn.fnTextSearchClose = () => {

        PARCON.stopFindInPage({
            action: "clearSelection"
        });

        PARCON.off("found-in-page", oAPP.fn.fnFindInPage);

        CURRWIN.close();

    };

    oAPP.fn.fnEnterTxtSearch = (oInput) => {

        var sValue = oInput.value;
        if (sValue == "") {
            return;
        }

        var oFindOptions = {
            forward: true,
            findNext: true
        };

        PARCON.findInPage(sValue, oFindOptions);

    };

    oAPP.fn.fnFindInPage = (event, result) => {

        debugger;

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }

        oFindTxt.innerHTML = `${result.activeMatchOrdinal} / ${result.matches}`;

    };

    oAPP.onDeviceReady = () => {

        var oSrchInput = document.getElementById("srchInput");
        if (oSrchInput == null) {
            return;
        }

        oSrchInput.focus();

    };

    PARCON.on("found-in-page", oAPP.fn.fnFindInPage);

    return oAPP;

})();



window.addEventListener('load', oAPP.onDeviceReady, false);
// document.addEventListener('deviceready', oAPP.onDeviceReady, false);