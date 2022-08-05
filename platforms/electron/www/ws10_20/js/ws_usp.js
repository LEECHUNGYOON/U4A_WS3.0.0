/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp.js
 * - file Desc : u4a ws usp
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    oAPP.fn.fnCreateWs30 = (fnCallback) => {
        debugger;

        // 30번 페이지 존재 유무 체크
        var oWs30 = sap.ui.getCore().byId("WS30");
        if (oWs30 && typeof fnCallback === "function") {
            fnCallback();
            return;
        }

        // 없으면 렌더링부터..
        oAPP.fn.fnInitRenderingWs30();

        if (typeof fnCallback === "function") {
            fnCallback();
        }

    }; // end of oAPP.fn.fnCreateWs30

    oAPP.fn.fnInitRenderingWs30 = () => {

        var oApp = sap.ui.getCore().byId("WSAPP");
        if (!oApp) {
            return;
        }

        var oCustomHeader = oAPP.fn.fnGetCustomHeaderWs30();

        var oWs30 = new sap.m.Page("WS30", {
            title: "WS30!!!",

            customHeader : oCustomHeader



        });

        oApp.addPage(oWs30);

    }; // end of oAPP.fn.fnInitRenderingWs30

    oAPP.fn.fnGetCustomHeaderWs30 = () => {

        return new sap.m.Bar({
            contentLeft: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: oAPP.events.ev_pressWs30Back
                })
            ]

        });

    }; // end of oAPP.fn.fnGetCustomHeaderWs30













    oAPP.events.ev_pressWs30Back = () => {

        oAPP.fn.fnOnMoveToPage("WS10");

    };

})(window, $, oAPP);