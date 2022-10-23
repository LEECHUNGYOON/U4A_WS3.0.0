/**************************************************************************
 * ServerFrame.js
 **************************************************************************/
(function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.data = {};
    oAPP.data.SAPLogon = {};

    oAPP.REMOTE = require('@electron/remote');   

    oAPP.fn.fnOnDeviceReady = function() {

        var oWs_frame = document.getElementById("ws_serverframe");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "ServerList.html";

    };

    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

    window.oAPP = oAPP;

})(window);