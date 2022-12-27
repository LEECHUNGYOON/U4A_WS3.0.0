/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws10_20.js
 * - file Desc : U4A Workspace Main Start
 ************************************************************************/
((oAPP) => {
    "use strict";

    /************************************************************************
     * 마우스 휠 이벤트 적용하기 (줌 기능)
     ************************************************************************/
    oAPP.fn.fnAttachMouseWheelEvent = () => {

        var remote = parent.REMOTE;

        var web = remote.getCurrentWebContents();

        oAPP.attr.scale = web.getZoomLevel();

        document.addEventListener('mousewheel', (ev) => {

            if (ev.ctrlKey) {

                oAPP.attr.scale += ev.deltaY * -0.01;
                oAPP.attr.scale = Math.min(Math.max(-10, oAPP.attr.scale), 10);
                
                web.setZoomLevel(oAPP.attr.scale);

                // zoom 정보 저장
                if (oAPP.attr.zoomSetTimeOut) {
                    clearTimeout(oAPP.attr.zoomSetTimeOut);
                    delete oAPP.attr.zoomSetTimeOut;
                }

                oAPP.attr.zoomSetTimeOut = setTimeout(() => {

                    oAPP.fn.setPersonWinZoom("S");                    

                    zconsole.log("zoom 저장!!");

                }, 500);

            }

        });

    }; // end of oAPP.fn.fnAttachMouseWheelEvent

    /************************************************************************
     * 화면 보호기 감지 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorEvent = () => {

        var oPowerMonitor = parent.POWERMONITOR;

        // 대기모드로 전환 감지 이벤트
        oPowerMonitor.addListener('lock-screen', oAPP.fn.fnAttachPowerMonitorLockScreen);

        oPowerMonitor.addListener('unlock-screen', oAPP.fn.fnAttachPowerMonitorUnLockScreen);

    }; // end of oAPP.fn.fnAttachPowerMonitorEvent

    /************************************************************************
     * 화면 보호기 대기모드로 전환될 때 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorLockScreen = () => {

        // 세션 타임아웃 체크
        oAPP.fn.fnSessionTimeoutCheck(); // #[ws_fn_03.js]

        zconsole.log("워커가 켜졌다!!");

    }; // end of oAPP.fn.fnAttachPowerMonitorLockScreen

    /************************************************************************
     * 화면 보호기 대기모드가 아닐때 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnAttachPowerMonitorUnLockScreen = () => {

        // 이벤트를 받으면 세션 타임을 초기화 한다.
        parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

        // 워커가 있을 경우에만 실행
        if (!oAPP.attr._oWorker) {
            return;
        }

        // 워커 종료
        oAPP.attr._oWorker.terminate();

        delete oAPP.attr._oWorker;

        zconsole.log("워커 죽었다!!!!");

    }; // end of oAPP.fn.fnAttachPowerMonitorUnLockScreen    

    /************************************************************************/

    // 마우스 휠 이벤트 적용하기 (줌 기능)
    oAPP.fn.fnAttachMouseWheelEvent();

    // 화면 보호기 감지 이벤트
    oAPP.fn.fnAttachPowerMonitorEvent();

})(oAPP);