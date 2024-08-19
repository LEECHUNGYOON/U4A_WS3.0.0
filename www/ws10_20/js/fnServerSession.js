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
        
        var sServerPath = parent.getServerPath() + "/dummycall";

        var oSendParam = {
            SERVPATH: sServerPath,
            USERINFO : parent.getUserInfo()
        };

        // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
        oAPP.attr._oServerWorker = new Worker("./js/workers/u4aWsServerSessionWorker.js");

        // Session Time Worker onmessage 이벤트        
        oAPP.attr._oServerWorker.onmessage = oAPP.fn.fnServerSessionTimeOut;

        // 워커에 값 전달
        oAPP.attr._oServerWorker.postMessage(oSendParam);

    }; // end of oAPP.fn.oAPP.fn.fnServerSession

    oAPP.fn.fnServerSessionTimeOut = (oRes) => {

        let oData = oRes.data;

        console.error(oData.RTMSG);

        // 세션 유지 실패 시, 나를 제외한 나머지는 다 죽인다
        parent.IPCRENDERER.send('if-browser-close', {
            ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
            SESSKEY: parent.getSessionKey(),
            BROWSKEY: parent.getBrowserKey()
        });

        // 세션 타임 아웃 팝업을 띄운다.
        let sTitle = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "147"), // The session has terminated.
            sDesc = oData.RTMSG,
            sIllustType = "tnt-SessionExpired",
            sIllustSize = sap.m.IllustratedMessageSize.Dialog;

        oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, lfSessionTimeOutDialogOk);

        function lfSessionTimeOutDialogOk(){

            fn_logoff_success("");
            
        }

        // 세션 타임아웃 시, 워커를 죽인다.
        if (oAPP.attr._oServerWorker && oAPP.attr._oServerWorker) {
            oAPP.attr._oServerWorker.terminate();
            delete oAPP.attr._oServerWorker;
        }

    };

})(window, $, oAPP);