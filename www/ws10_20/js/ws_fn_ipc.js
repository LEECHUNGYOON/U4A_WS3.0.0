/**************************************************************************
 * ws_fn_ipc.js
 **************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Electron IPCMAIN의 세션 타임 체크 관련 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_session_time = function(event, res) {

        // var iSessionTime = oAPP.attr.iSessionTimeout; // 세션 타임아웃 시간
        var iSessionTime = 0.1;

        var sSessionKey = parent.getSessionKey();
        if (sSessionKey != res) {
            return;
        }

        console.log("시작!! -> " + Math.floor(+new Date() / 1000));

        if (oAPP.attr._oWorker) {

            oAPP.attr._oWorker.postMessage(iSessionTime);

        }

    }; // end of oAPP.fn.fnIpcMain_if_session_time

    /************************************************************************
     *  Electron IPCMAIN의 Exam 팝업에서 샘플 리스트의 WorkBench Move 버튼 실행 시 수행 되는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_if_exam_move = function(event, res) {

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

                // onAppCrAndChgMode(sAppID);

                // 샘플에 대한 WS20 페이지 이동
                oAPP.fn.fnExamMoveToPageWs20(sAppID);

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

    /************************************************************************
     * Application Import 성공시 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_export_import_IMPORT = (event, res) => {

        // 페이지 이동 처리..
        onAppCrAndChgMode(res.APPID);

        // 푸터 메시지
        oAPP.common.fnShowFloatingFooterMsg("S", "WS20", res.RTMSG);

    }; // end of oAPP.fn.fnIpcMain_export_import_IMPORT

    /************************************************************************
     * Application Export 성공시 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpcMain_export_import_EXPORT = (event, res) => {

        // oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-EXPORT`, { RETCD: "S", RTMSG: Lmsg });

        let sCurrPage = parent.getCurrPage();

        // 푸터 메시지
        oAPP.common.fnShowFloatingFooterMsg(res.RETCD, sCurrPage, res.RTMSG);

    }; // end of oAPP.fn.fnIpcMain_export_import_EXPORT

    oAPP.fn.fnIpcMain_Attach_if_browser_close = () => {

        oAPP.attr.aSessionKeys = [];

        // 여러창일때 나를 제외한 윈도우를 닫고 싶을때 
        parent.IPCMAIN.on('if-browser-close', oAPP.fn.fnIpcMain_if_browser_close);

    };

    oAPP.fn.fnIpcMain_if_browser_close = (event, res) => {

        var oCurrWin = parent.CURRWIN,
            sType = res.ACTCD,
            sCurrSessionKey = parent.getSessionKey(),
            sCurrBrowsKey = parent.getBrowserKey();

        if (res.SESSKEY !== sCurrSessionKey) {
            return;
        }

        switch (sType) {

            case "A": // 같은 세션 키를 가진 브라우저 중 나를 제외한 나머지 창을 전부 닫기

                if (sCurrBrowsKey == res.BROWSKEY) {
                    return;
                }

                // onBeforeunload event 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                // 브라우저에 내장된 세션 정보를 클리어 한다.
                oAPP.fn.fnClearSessionStorageData(); // #[ws_fn_04.js]

                oCurrWin.close();

                break;


            case "B": // 같은 세션 키를 가진 브라우저 중, 전달받은 키가 나와 같으면 나만 죽인다.

                if (sCurrBrowsKey !== res.BROWSKEY) {
                    return;
                }

                // onBeforeunload event 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                oCurrWin.close();

                break;

            case "C": // 같은 세션을 가진 브라우저 중 로그오프가 된 브라우저의 키를 수집한다.

                var aSameBrowsers = oAPP.fn.fnGetSameBrowsersAll(), // #[ws_fn_02.js]
                    iSameBrowserLength = aSameBrowsers.length;

                oAPP.attr.aSessionKeys.push(res.BROWSKEY);

                var iSessionKeyLength = oAPP.attr.aSessionKeys.length;

                console.log(`같은 브라우저 총 갯수 : ${iSameBrowserLength} `);
                console.log(`수집된 키 총 갯수 : ${iSessionKeyLength} `);

                if (iSameBrowserLength != iSessionKeyLength) {
                    return;
                }

                console.log("전체 키 수집!!!");

                // 현재 떠있는 브라우저 갯수와 수집된 브라우저 키의 갯수가 동일 하다면..
                if (iSessionKeyLength == 1) {

                    fn_logoff_success("X");

                    return;

                }

                var aSortKeys = oAPP.attr.aSessionKeys.sort(),
                    sChoiceKey = aSortKeys[0];

                parent.IPCRENDERER.send('if-browser-close', {
                    ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
                    SESSKEY: parent.getSessionKey(),
                    BROWSKEY: sChoiceKey
                });

                // beforeUnload 이벤트 해제
                oAPP.main.fnDetachBeforeunloadEvent();

                // 현재 브라우저에 걸려있는 shortcut, IPCMAIN 이벤트 등 각종 이벤트 핸들러를 제거 하고, 
                // 현재 브라우저의 화면이 20번 페이지일 경우는 서버 세션 죽이고 Lock도 해제한다.
                oAPP.main.fnBeforeunload();

                // 브라우저에 내장된 세션 정보를 클리어 한다.
                oAPP.fn.fnClearSessionStorageData(); // #[ws_fn_04.js]

                // 현재 세션에서 파생된 Childwindow를 닫는다.
                oAPP.fn.fnChildWindowClose();

                if (oAPP.attr._oWorker && oAPP.attr._oWorker.terminate) {
                    oAPP.attr._oWorker.terminate();
                    delete oAPP.attr._oWorker;
                }

                if (oAPP.attr._oServerWorker && oAPP.attr._oServerWorker) {
                    oAPP.attr._oServerWorker.terminate();
                    delete oAPP.attr._oServerWorker;
                }

                let sTitle = "Session Timeout",
                    sDesc = "Please Try Login Again!",
                    sIllustType = "tnt-SessionExpired",
                    sIllustSize = sap.m.IllustratedMessageSize.Dialog;

                oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, fnSessionTimeOutDialogOk);
                
                break;

            default:
                break;
                
        }


    };

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