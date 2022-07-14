/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_bsp.js
 * - file Desc : bsp 생성
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";


    oAPP.fn.fnCreateBsp = () => {

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput"),
            sAppID = oAppNmInput.getValue();

        oAPP.fn.fnOnEnterDispChangeMode(sAppID, "X");


    };


})(window, $, oAPP);