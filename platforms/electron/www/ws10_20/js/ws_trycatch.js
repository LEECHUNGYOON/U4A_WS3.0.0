module.exports = function (window, document, console) {

    /************************************************************************
     * onError 관련 공통 로직
     ************************************************************************/
    var REMOTE = require('@electron/remote'),
        PATH = REMOTE.require('path'),
        DIALOG = REMOTE.require('electron').dialog,
        CURRWIN = REMOTE.getCurrentWindow(),
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        WSLOG = require(PATH.join(APPPATH, "ws10_20", "js", "ws_log.js"));

    // [R&D 전용 console.log]
    var zconsole = {};
    zconsole.APP = APP;

    // 오류 로그 감지
    WSLOG.start(REMOTE, console);

    // 무한 루프 오류 방지 flag
    var bIsError = false;

    /************************************************************************
     * critical 오류 팝업
     ************************************************************************/
    function showCriticalErrorDialog(sErrorMsg) {

        let sTitle = "[Critical Error]: ";
        sTitle += "Please contact the solution team.";

        DIALOG.showMessageBox(CURRWIN, {
            title: sTitle,
            message: sErrorMsg,
            type: "error"
        }).then(() => {

            console.error(sErrorMsg);

            CURRWIN.close();

        });

    } // end of showCriticalErrorDialog    

    function onError(message, url, line, col, errorObj) {

        if (bIsError) {
            return;
        }

        bIsError = true;

        let sErrMsg = `${message}\n${url}, ${line}:${col}`;

        console.error(sErrMsg);

        // critical 오류이므로 창을 다 닫는다.
        showCriticalErrorDialog(sErrMsg);

    }

    function onunhandledrejection(event) {

        if (bIsError) {
            return;
        }

        bIsError = true;

        let sErrorMsg = "";
        if (event.reason) {
            sErrorMsg = event.reason.stack.toString();
        }

        if (sErrorMsg == "") {
            sErrorMsg = "critical Error!";
        }

        console.error(sErrorMsg);

        // critical 오류이므로 창을 다 닫는다.
        showCriticalErrorDialog(sErrorMsg);

    }

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

    window.removeEventListener("unhandledrejection", onunhandledrejection);
    window.addEventListener("unhandledrejection", onunhandledrejection);

    window.onerror = onError;
    document.onerror = onError;

    return zconsole;

};