/**************************************************************************
 * ServerFrame.js
 **************************************************************************/

// [R&D 전용 console.log]
var zconsole = {};

let oAPP = (function (window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.REMOTEMAIN = oAPP.REMOTE.require('@electron/remote/main');
    oAPP.RANDOM = oAPP.REMOTE.require("random-key");
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.APPPATH = oAPP.APP.getAppPath();

    const WSLOG = require(oAPP.PATH.join(oAPP.APPPATH, "ws10_20", "js", "ws_log.js"));

    // 오류 로그 감지
    WSLOG.start(oAPP.REMOTE, console);

    // [R&D 전용 console.log]
    zconsole.APP = oAPP.APP;

    /************************************************************************
     * local console [R&D 전용 console.log]
     ************************************************************************/
    zconsole.log = (sConsole) => {

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        console.log("[zconsole]: " + sConsole);

    };

    zconsole.error = (sConsole) => {

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        console.error("[zconsole]: " + sConsole);

    };

    zconsole.warn = (sConsole) => {

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        console.warn("[zconsole]: " + sConsole);

    };

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