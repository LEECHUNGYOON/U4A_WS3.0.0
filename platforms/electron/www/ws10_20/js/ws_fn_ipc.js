/**************************************************************************
 * ws_fn_ipc.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Electron IPCMAIN의 세션 타임 체크 관련 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_session_time = function (event, res) {

        var iSessionTime = oAPP.attr.iSessionTimeout; // 세션 타임아웃 시간

        var sSessionKey = parent.getSessionKey();
        if (sSessionKey != res) {
            return;
        }

        console.log("시작!! -> " + Math.floor(+new Date() / 1000));

        // oAPP.attr._oWorker.postMessage(0.5);
        if (oAPP.attr._oWorker) {
            oAPP.attr._oWorker.postMessage(iSessionTime);
        }

    }; // end of oAPP.fn.fnIpcMain_if_session_time

    /************************************************************************
     *  Electron IPCMAIN의 Exam 팝업에서 샘플 리스트의 WorkBench Move 버튼 실행 시 수행 되는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_exam_move = function (event, res) {

        console.log("fnIpcMain_if_exam_move");

        var oMsg = res,
            MODE = oMsg.MODE,
            sAppID = oMsg.APPID,
            BROWSERKEY = parent.getBrowserKey();

        // 다른 브라우저에서 실행한 이벤트면 리턴 시킨다.
        if (res.BROWSERKEY != BROWSERKEY) {
            return;
        }

        switch (MODE) {
            case "A": // 브라우저 띄우기

                oAPP.fn.fnOnExecApp(sAppID);

                break;

            case "B": // WS 디자인 영역으로 이동

                onAppCrAndChgMode(sAppID);

                break;
        }

    }; // end of oAPP.fn.fnIpcMain_if_exam_move

    /************************************************************************
     * Error Page Popup의 Table Click Event
     ************************************************************************/
    oAPP.fn.fnIpcMain_errmsg_click = (event, res) => {

        let oRowData = res.oRowData;

        switch (oRowData.GRCOD) {

            case "CLS_SNTX":
            case "METH":
            case "CLSD":
            case "CPRO":
            case "CPUB":

                oAPP.common.execControllerClass(oRowData.OBJID, oRowData.LINE);
                return;

            default:

                oAPP.fn.setSelectTreeItem(oRowData.OBJID, oRowData.UIATK, oRowData.TYPE);
                return;

        }

    }; // end of oAPP.fn.fnIpcMain_errmsg_click

})(window, $, oAPP);


/*************************************************************************
 * Electron IPC events..
 **************************************************************************/

/*************************************************************************
 * Example 팝업
 * - 브라우저 실행
 * - WS 디자인 영역으로 이동
 **************************************************************************/
parent.IPCMAIN.on("if-exam-move", oAPP.fn.fnIpcMain_if_exam_move);