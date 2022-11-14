/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : textSearchPopup/index.js
 ************************************************************************/

let oAPP = (() => {
    "use strict";

    var oAPP = {};
    oAPP.fn = {};

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        CURRCON = CURRWIN.webContents,
        BROWSKEY = CURRCON.getWebPreferences().browserkey,
        PARWIN = CURRWIN.getParentWindow(),
        PARCON = PARWIN.webContents,
        IPCRENDERER = require('electron').ipcRenderer;

    /************************************************************************
     * 텍스트 검색
     ************************************************************************/
    oAPP.fn.fnEnterTxtSearch = (oInput) => {

        // esc 키를 눌렀다면 검색창 닫기
        if (event.keyCode == 27) {
            oAPP.fn.fnTextSearchClose();
            return;
        }

        // 입력된 값이 없을경우
        var sValue = oInput.value;
        if (sValue == "") {
            return;
        }

        IPCRENDERER.send(`${BROWSKEY}--designTextSearch`, sValue);

    }; // end of oAPP.fn.fnEnterTxtSearch

    /************************************************************************
     * 텍스트 검색창 닫기
     ************************************************************************/
    oAPP.fn.fnTextSearchClose = () => {

        // 부모창에 포커스를 준다.
        PARCON.focus();

        if (!CURRWIN.isDestroyed()) {

            // 검색창을 닫는다.
            CURRWIN.close();

        }

    }; // end of oAPP.fn.fnTextSearchClose

    /************************************************************************
     * 검색된 텍스트 중 위로 찾기
     ************************************************************************/
    oAPP.fn.fnTextSearchUP = () => {

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }

        var oInput = document.getElementById("srchInput");
        if (oInput == null) {
            return;
        }

        var sValue = oInput.value;
        if (sValue == "") {
            PARCON.stopFindInPage("clearSelection");
            oFindTxt.innerHTML = "";
            return;
        }

        var oFindOptions = {
            forward: false,
            findNext: false,
        };

        PARCON.findInPage(sValue, oFindOptions);

    }; // end of oAPP.fn.fnTextSearchUP

    /************************************************************************
     * 검색된 텍스트 중 아래로 찾기
     ************************************************************************/
    oAPP.fn.fnTextSearchDOWN = () => {

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }

        var oInput = document.getElementById("srchInput");
        if (oInput == null) {
            return;
        }

        var sValue = oInput.value;
        if (sValue == "") {
            PARCON.stopFindInPage("clearSelection");
            oFindTxt.innerHTML = "";
            return;
        }

        var oFindOptions = {
            forward: true,
            findNext: false,
        };

        PARCON.findInPage(sValue, oFindOptions);

    }; // end of oAPP.fn.fnTextSearchDOWN    

    oAPP.onLoad = () => {

        var oSrchInput = document.getElementById("srchInput");
        if (oSrchInput == null) {
            return;
        }

        oSrchInput.focus();

    };

    return oAPP;

})();

window.addEventListener('load', oAPP.onLoad, false);

window.addEventListener('beforeunload', () => {

    oAPP.fn.fnTextSearchClose();

});