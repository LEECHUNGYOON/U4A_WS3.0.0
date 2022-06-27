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
        PARWIN = CURRWIN.getParentWindow(),
        PARCON = PARWIN.webContents;

    var gBeforeSearchText = ""; // 이전 검색한 텍스트    

    /************************************************************************
     * 텍스트 검색
     ************************************************************************/
    oAPP.fn.fnEnterTxtSearch = (oInput) => {

        // esc 키를 눌렀다면 검색창 닫기
        if (event.keyCode == 27) {
            oAPP.fn.fnTextSearchClose();
        }

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }

        // 현재 입력한 값을 글로벌에 저장
        gBeforeSearchText = sValue;

        // 입력된 값이 없을경우
        var sValue = oInput.value;
        if (sValue == "") {

            PARCON.stopFindInPage("clearSelection");

            oFindTxt.innerHTML = "";

            return;
        }

        var bIsFindNext = false;

        // 현재 입력한 텍스트가 이전에 검색한 텍스트와 다를경우 검색 옵션값 설정
        if (gBeforeSearchText != sValue) {
            bIsFindNext = true;
        }

        var oFindOptions = {
            forward: true,
            findNext: bIsFindNext
        };

        PARCON.findInPage(sValue, oFindOptions);

    }; // end of oAPP.fn.fnEnterTxtSearch

    /************************************************************************
     * 텍스트 검색창 닫기
     ************************************************************************/
    oAPP.fn.fnTextSearchClose = () => {

        // 검색된 텍스트에 블럭들을 제거한다.
        PARCON.stopFindInPage("clearSelection");

        // 검색 이벤트 핸들러를 제거한다.
        PARCON.off("found-in-page", oAPP.fn.fnFoundInPage);

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

    /************************************************************************
     * 텍스트 검색 이벤트 핸들러
     ************************************************************************/
    oAPP.fn.fnFoundInPage = (event, result) => {

        var oFindTxt = document.getElementById("searchCnt");
        if (oFindTxt == null) {
            return;
        }

        oFindTxt.innerHTML = `${result.activeMatchOrdinal} / ${result.matches}`;

    }; // end of oAPP.fn.fnFoundInPage

    oAPP.onLoad = () => {

        var oSrchInput = document.getElementById("srchInput");
        if (oSrchInput == null) {
            return;
        }

        oSrchInput.focus();

    };

    PARCON.on("found-in-page", oAPP.fn.fnFoundInPage);

    return oAPP;

})();

window.addEventListener('load', oAPP.onLoad, false);

window.addEventListener('beforeunload', () => {

    oAPP.fn.fnTextSearchClose();

});