/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnServerSession.js
 * - file Desc : 서버 세션 유지
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    /************************************************************************
     * 서버 세션 유지를 위한 워커 실행
     ************************************************************************/
    oAPP.fn.fnServerSession = function (bIsForceRun) {

        // // 강제실행이 아닐 경우
        // if (!bIsForceRun) {

        //     // 브라우저 갯수 체크
        //     var aSameBrowser = oAPP.fn.fnGetSameBrowsers(),
        //         iSameCnt = aSameBrowser.length;

        //     if (iSameCnt != 0) {
        //         return;
        //     }

        // }

        // // 서버 세션 체크 중이다 라는 플래그..
        // // beforeunload 이벤트에서 이 플래그 가지고
        // // 서버 세션을 수행할지 말지를 구분하기 위한 용도임.
        // oAPP.attr.serverSessionCheckingMe = {};

        // // 서버세션 타임아웃 시간
        // var iSessionTime = oAPP.attr.iServerSessionTimeout * 60 * 1000;

        // // 1분 마다 한번씩 서버 호출        
        // iSessionTime = 1 * 60 * 1000;

        var sServerPath = parent.getServerPath() + '/dummycall';

        var oSendParam = {
            SERVPATH: sServerPath
        };

        // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
        oAPP.attr._oServerWorker = new Worker('./js/workers/u4aWsServerSessionWorker.js');

        // Session Time Worker onmessage 이벤트
        // oAPP.attr._oServerWorker.onmessage = oAPP.fn.fnServerSessionTimeOutOnMessage;
        oAPP.attr._oServerWorker.onmessage = oAPP.fn.fnServerSessionTimeOut;

        // 워커에 값 전달
        oAPP.attr._oServerWorker.postMessage(oSendParam);

    }; // end of oAPP.fn.oAPP.fn.fnServerSession

    // /************************************************************************
    //  * 서버 세션 체크를 하는 워커의 onmessage 이벤트
    //  ************************************************************************/
    // oAPP.fn.fnServerSessionTimeOutOnMessage = function (e) {

    //     if (e.data != "X") {
    //         return;
    //     }

    //     // 서버 세션 유지를 위한 서버 호출
    //     oAPP.fn.fnServerSessionMaintainCall();

    // }; // end of oAPP.fn.fnServerSessionTimeOutOnMessage


    oAPP.fn.fnServerSessionTimeOut = (e) => {  

        fn_logoff_success('X');

    };

    // /************************************************************************
    //  * 서버 세션 유지를 위한 서버 호출
    //  ************************************************************************/
    // oAPP.fn.fnServerSessionMaintainCall = function () {

    //     // 네트워크 연결 상태 flag
    //     var bIsNwActive = oAPP.attr.bIsNwActive;
    //     if (!bIsNwActive) {
    //         return;
    //     }

    //     var sPath = parent.getServerPath() + '/dummycall';


    //     fetch(sPath)
    //     .then((response) => {
    //         console.log(response)
    //     })
    //     .then((data) => console.log(data));



    //     // function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {


    //     // sendAjax(sPath, null, () => {
    //     //     console.log("server call: " + new Date());
    //     //     parent.setBusy('');
    //     // });

    //     // sendAjax(
    //     //     sPath,
    //     //     null,
    //     //     () => { // success callback
    //     //         console.log("server call: " + new Date());
    //     //     },
    //     //     null,
    //     //     null,
    //     //     null,
    //     //     () => { // error callback

    //     //         // Electron Browser들 전체 닫는 function
    //     //         oAPP.fn.fnChildWindowClose();

    //     //         // 세션 타임아웃 메시지 팝업 띄우기
    //     //         let sTitle = "Session Timeout",
    //     //             sDesc = "Please Try Login Again!",
    //     //             sIllustType = "tnt-SessionExpired";

    //     //         oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, oAPP.common.setSessionTimeoutOK);

    //     //     });


    //     // navigator.sendBeacon(sPath);

    //     // console.log("server call: " + new Date());

    // }; // end of oAPP.fn.fnServerSessionMaintainCall

    // /************************************************************************
    //  * 서버 세션 타임 아웃 체크 역할을 전파 받았을때 타는 이벤트
    //  ************************************************************************/
    // oAPP.fn.fnIpcRender_if_server_session_propagation = function (event, res) {

    //     // 서버 세션 유지를 위한 서버 호출
    //     oAPP.fn.fnServerSessionMaintainCall();

    //     // 서버 세션 유지를 위한 워커 실행
    //     oAPP.fn.fnServerSession(true);

    // }; // end of oAPP.fn.fnIpcRender_if_server_session_propagation

    // /************************************************************************
    //  * 서버 세션 타임 아웃 체크 역할을 전파 받을 준비하는 IPCRENDERER 이벤트 리스너 설정
    //  ************************************************************************/
    // parent.IPCRENDERER.on('if-server-session-propagation', oAPP.fn.fnIpcRender_if_server_session_propagation);

})(window, $, oAPP);