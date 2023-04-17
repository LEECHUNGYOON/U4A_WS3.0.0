/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : patternPopup/frame.js
 ************************************************************************/
let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.msg = {};
    oAPP.events = {};

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        PARWIN = CURRWIN.getParentWindow(),
        IPCRENDERER = require('electron').ipcRenderer;

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    IPCRENDERER.on('if-icon-prev', (events, oInfo) => {

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

        CURRWIN.setParentWindow(null);

    });

    window.onbeforeunload = function () {

        if (PARWIN && PARWIN.isDestroyed()) {
            return;
        }

        PARWIN.off("closed", oAPP.fn.fnOnParentWindowClosedEvent);

        PARWIN.focus();

    }; // end of window.onbeforeunload

    /************************************************************************
     * 부모 윈도우 관련 이벤트 --- start 
     ************************************************************************/

    // 부모창 닫기 이벤트
    oAPP.fn.fnOnParentWindowClosedEvent = () => {

        if (CURRWIN && CURRWIN.isDestroyed()) {
            return;
        }

        CURRWIN.close();

    }; // end of oAPP.fn.fnOnParentWindowClosedEvent

    /************************************************************************
     * 부모 윈도우 관련 이벤트 --- End
     ************************************************************************/

    PARWIN.on("closed", oAPP.fn.fnOnParentWindowClosedEvent);

    window.oAPP = oAPP;

    return oAPP;

})(window);