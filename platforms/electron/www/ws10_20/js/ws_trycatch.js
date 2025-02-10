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

    // if (APP.isPackaged) {
        // 오류 로그 감지
        WSLOG.start(REMOTE, console);
    // }

    // 무한 루프 오류 방지 flag
    var bIsError = false;

    /************************************************************************
     * critical 오류 팝업
     ************************************************************************/
    function showCriticalErrorDialog(sErrorMsg) {

        // 무한루프 오류 방지 Flag
        // 오류가 한번이라도 발생되었다면 그 다음 오류는 무시
        if (bIsError == true) {
            return;
        }

        bIsError = true;

        // //[임시 -- start] 오류 발생시 디버깅 창을 오픈한다.
        // let oWebContents = CURRWIN.webContents;
        // oWebContents.openDevTools();
        // //[임시 -- end]

        let sTitle = "[Critical Error]: ";
        sTitle += "Please contact the solution team.";

        DIALOG.showMessageBox(CURRWIN, {
            title: sTitle,
            message: sErrorMsg,
            type: "error"
        }).then(() => {
  
            bIsError = false;

            // CURRWIN.close();
            APP.exit();

        });

    } // end of showCriticalErrorDialog    

    // window onError 오류
    function onError(message, url, line, col, errorObj) {

        if (bIsError == true) {
            return;
        }

        let sErrMsg = `[onError]: ${message}\n${url}, ${line}:${col}`;

        console.error(sErrMsg);

        console.trace(`[onError]: `);

        // critical 오류이므로 창을 닫는다.
        showCriticalErrorDialog(sErrMsg);

    }

    // 비동기 오류
    function onunhandledrejection(event) {

        if (bIsError == true) {
            return;
        }
        
        let sErrorMsg = "";
        if (event.reason) {
            sErrorMsg = "[onunhandledrejection]: " + event?.reason?.stack?.toString();
        }

        console.trace(`[onunhandledrejection]: `);

        if (sErrorMsg == "") {
            sErrorMsg = "critical Error!";
        }

        console.error(sErrorMsg);

        // critical 오류이므로 창을 닫는다.
        showCriticalErrorDialog(sErrorMsg);

    }

    /************************************************************************
     * local console [R&D 전용 console.log]
     ************************************************************************/
    zconsole.log = function(sConsole) {

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        // console.log("[zconsole]: " + sConsole);
        console.log("[zconsole]: ", arguments);

    };

    zconsole.error = function(sConsole) {

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        console.error("[zconsole]: ", arguments);

    };

    zconsole.warn = function(sConsole){

        const
            APP = zconsole.APP;

        // 빌드 상태에서는 실행하지 않음.
        if (APP.isPackaged) {
            return;
        }

        console.warn("[zconsole]: ", arguments);

    };

    window.removeEventListener("unhandledrejection", onunhandledrejection);
    window.addEventListener("unhandledrejection", onunhandledrejection);

    window.onerror = onError;

    return zconsole;

};