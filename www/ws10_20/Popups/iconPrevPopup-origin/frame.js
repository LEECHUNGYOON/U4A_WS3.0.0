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

    let sap;

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        PARWIN = CURRWIN.getParentWindow(),
        IPCRENDERER = require('electron').ipcRenderer;

    function fnwait() {

        return new Promise((resolve) => {


            setTimeout(() => {
                resolve();
            }, 3000);

        });

    }


    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    IPCRENDERER.on('if-icon-prev', async (events, oInfo) => {       

        oAPP.attr.sServerPath = oInfo.sServerPath;

        oAPP.attr.WS_LANGU = await WSUTIL.getWsLanguAsync();

        oAPP.fn.fnFrameLoad();

        CURRWIN.setParentWindow(null);

    });

    oAPP.fn.fnFrameLoad = () => {

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        let sServerPath = oAPP.attr.sServerPath,
            sServerHtmlUrl = sServerPath + "/getP13nPreviewHTML";

        let oForm = document.getElementById("u4asendform");

        let aParam = [
            { NAME: "LIBRARY", VALUE: "sap.m, sap.f, sap.ui.table" },
            { NAME: "LANGU", VALUE: oAPP.attr.WS_LANGU },
            { NAME: "THEME", VALUE: "sap_horizon" },
            { NAME: "CALLBACKFUNC", VALUE: "parent.oAPP.fn.onFrameLoadSuccess();" },
        ]

        for (var i = 0; i < aParam.length; i++) {

            let oParam = aParam[i],
                oInput = document.createElement("input");

            oInput.setAttribute("type", "hidden");
            oInput.setAttribute("name", oParam.NAME);
            oInput.setAttribute("value", oParam.VALUE);
            oForm.appendChild(oInput);

        }

        oForm.setAttribute("action", sServerHtmlUrl);

        oForm.submit();        

    };

    oAPP.fn.onFrameLoadSuccess = () => {

        debugger;

        var oWs_frame = document.getElementById("ws_frame");

        sap = oWs_frame.contentWindow.sap;

    }; // end of oAPP.fn.onFrameLoadSuccess

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

    window.onbeforeunload = function () {

        if (PARWIN && PARWIN.isDestroyed()) {
            return;
        }

        PARWIN.off("closed", oAPP.fn.fnOnParentWindowClosedEvent);

        PARWIN.focus();

    }; // end of window.onbeforeunload

    PARWIN.on("closed", oAPP.fn.fnOnParentWindowClosedEvent);

    window.oAPP = oAPP;

    return oAPP;

})(window);