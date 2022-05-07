/**************************************************************************
 * ServerFrame.js
 **************************************************************************/
let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.REMOTEMAIN = oAPP.REMOTE.require('@electron/remote/main');
    oAPP.RANDOM = oAPP.REMOTE.require("random-key");
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app,
        oAPP.APPPATH = oAPP.APP.getAppPath();

    oAPP.fn.fnOnDeviceReady = function () {

        var oWs_frame = document.getElementById("ws_serverframe");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "ServerList.html";
        
    };

    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

    window.oAPP = oAPP;

    return oAPP;

})(window);