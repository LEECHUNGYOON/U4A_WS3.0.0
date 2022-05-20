let oAPP = (() => {
    "use strict";

    var oAPP = {};
    oAPP.fn = {};    

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        PARWIN = CURRWIN.getParentWindow(),
        PARCON = PARWIN.webContents;


    var gSearchText = "";

    oAPP.fn.fnTextSearchClose = () => {

        PARCON.stopFindInPage("clearSelection");

        PARCON.off("found-in-page", oAPP.fn.fnFindInPage);

        CURRWIN.close();

        PARCON.focus();

    };

    oAPP.fn.fnEnterTxtSearch = (oInput) => {

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }
        
        var sValue = oInput.value;
        if (sValue == "") {
            PARCON.stopFindInPage("clearSelection");
            oFindTxt.innerHTML = "";            
            return;
        }

        var bIsFindNext = false;

        if(gSearchText != sValue){
            bIsFindNext = true;
        }

        var oFindOptions = {
            forward: true,
            findNext: bIsFindNext
        };

        gSearchText = sValue;

        PARCON.findInPage(sValue, oFindOptions);

    };

    oAPP.fn.fnFindInPage = (event, result) => {

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