/**************************************************************************
 * ws_fn_test.js
 ************************************************************************** 
 * BrowserWindow Test Menu Events (Staff Only!!)
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    // Busy 강제 종료.. 
    oAPP.fn.fnTest99 = function () {
        parent.setBusy('');
    };

    // 로그아웃 (세션 죽이기)
    oAPP.fn.fnTest98 = function () {
        oAPP.events.ev_LogoutTest();
    };

    // 개발툴 실행
    oAPP.fn.fnTest97 = function () {
        var oCurrWin = parent.REMOTE.getCurrentWindow();
        oCurrWin.webContents.openDevTools();
    };

    // CTS popup Test
    oAPP.fn.fnTest95 = function () {

        oAPP.fn.fnCtsPopupOpener(lf_success);

        function lf_success(data) {

            debugger;


        }
    };

    // // show Error Page
    // oAPP.fn.fnTest92 = function() {
    //     oAPP.events.ev_ErrorPage();
    // };

    // Property 도움말 테스트
    oAPP.fn.fnTest91 = function () {
        oAPP.fn.fnPropertyHelpPopup();
    };

    // Busy Indicator 강제 실행
    oAPP.fn.fnTest90 = function () {

        // Busy 가 이미 실행 중이면 빠져나간다.
        var isBusy = parent.getBusy();
        if (isBusy == 'X') {
            return;
        }

        parent.setBusy('X');

    };

    // usp
    oAPP.fn.fnTest96 = () => {

        // 30번 페이지로 이동
        oAPP.fn.fnMoveToWs30(); //#[ws_fn_02.js]

    };

    oAPP.fn.fnTest94 = () => {

        var sPath = parent.getServerPath() + "/ttt";

        sendAjax(sPath, undefined, (oReturn) => {

            if (typeof fnCallback == "function") {
                fnCallback(oReturn);
            }

        });

    };

})(window, $, oAPP);