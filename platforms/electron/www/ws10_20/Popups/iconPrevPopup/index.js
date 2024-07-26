/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : iconPrevPopup/index.js
 ************************************************************************/

/************************************************************************
 * Global..
 ************************************************************************/

var oAPP = {};
oAPP.fn = {};
oAPP.msg = {};
oAPP.attr = {};
oAPP.data = {};

window.oAPP = oAPP;

var
    REMOTE = require('@electron/remote'),
    CLIPBOARD = REMOTE.clipboard,
    PATH = REMOTE.require('path'),
    FS = REMOTE.require("fs"),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    zconsole = WSERR(window, document, console),
    WSUTIL = require(PATHINFO.WSUTIL),
    CURRWIN = REMOTE.getCurrentWindow(),
    PARWIN = CURRWIN.getParentWindow(),
    IPCRENDERER = require('electron').ipcRenderer;

/************************************************************************
 * IPCRENDERER Events..
 ************************************************************************/
IPCRENDERER.on('if-icon-prev', async (events, oInfo) => {

    oAPP.attr.sServerPath = oInfo.sServerPath; // 서버 경로
    oAPP.attr.sServerHost = oInfo.sServerHost; // 서버 호스트 경로
    oAPP.attr.sDefTheme = oInfo.sDefTheme; // 기본 테마 정보
    oAPP.attr.USERINFO = process.USERINFO; // 접속 사용자 정보
    oAPP.attr.isCallback = oInfo.isCallback;

    let oSettingInfo = WSUTIL.getWsSettingsInfo();

    // ws 글로벌 언어 설정정보
    oAPP.attr.WS_LANGU = oSettingInfo.globalLanguage;

    oAPP.fn.fnFrameLoad();

    if (oAPP.attr.isCallback === "X") {
        CURRWIN.setParentWindow(PARWIN);
        return;
    }

    CURRWIN.setParentWindow(null);

});

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- start 
 ************************************************************************/

// 부모창 닫기 이벤트
oAPP.fn.fnOnParentWindowClosedEvent = () => {

    if (!CURRWIN || CURRWIN.isDestroyed()) {
        return;
    }

    oAPP.attr.isPressWindowClose = "X";

    CURRWIN.close();

}; // end of oAPP.fn.fnOnParentWindowClosedEvent

/************************************************************************
 * 부모 윈도우 관련 이벤트 --- End
 ************************************************************************/

if (PARWIN && !PARWIN.isDestroyed()) {
    PARWIN.on("closed", oAPP.fn.fnOnParentWindowClosedEvent);
}

/************************************************************************
 * frame Load 수행 
 ************************************************************************/
oAPP.fn.fnFrameLoad = () => {

    let sServerPath = oAPP.attr.sServerPath,
        sServerHtmlUrl = sServerPath + "/getP13nPreviewHTML",
        oForm = document.getElementById("u4asendform"),
        aParam = [
            { NAME: "LIBRARY", VALUE: "sap.m, sap.f, sap.ui.table" },
            { NAME: "LANGU", VALUE: oAPP.attr.WS_LANGU },
            { NAME: "THEME", VALUE: "sap_horizon" },
            { NAME: "CALLBACKFUNC", VALUE: "parent.oAPP.fn.onFrameLoadSuccess();" },
        ]

    for (var i = 0; i < aParam.length; i++) {

        let oParam = aParam[i],
            oInput = document.createElement("input");

        oInput.setAttribute("type", "hidden");
        oInput.setAttribute("name", oParam.NAME);
        oInput.setAttribute("value", oParam.VALUE);
        oForm.appendChild(oInput);

    }

    oForm.setAttribute("action", sServerHtmlUrl);

    oForm.submit();

}; // end of oAPP.fn.fnFrameLoad

/************************************************************************
 * 서버 부트스트랩 로드 성공 시
 ************************************************************************/
oAPP.fn.onFrameLoadSuccess = () => {

    let oWs_frame = document.getElementById("ws_frame"),

        // content div 생성
        oContWindow = oWs_frame.contentWindow,
        oContentDocu = oWs_frame.contentDocument,
        oContentDiv = oContentDocu.createElement("div");

    oContentDiv.id = "content";
    oContentDiv.style.display = "none";

    oContentDocu.body.appendChild(oContentDiv);

    // css 파일 넣기
    let sCssLinkPath = PATH.join(PATHINFO.POPUP_ROOT, "iconPrevPopup", "index.css"),
        sCssData = FS.readFileSync(sCssLinkPath, "utf-8");

    let oStyle = oContentDocu.createElement("style");
    oStyle.innerHTML = sCssData;

    oContentDocu.head.appendChild(oStyle);

    // frame 영역에서 동작할 js를 읽어서 eval 처리 한다.
    let sRuntimeJsPath = PATH.join(PATHINFO.POPUP_ROOT, "iconPrevPopup", "runtime.js"),
        sJsData = FS.readFileSync(sRuntimeJsPath, "utf-8");

    oContWindow["___u4a_ws_eval___"](sJsData);

}; // end of oAPP.fn.onFrameLoadSuccess

window.onbeforeunload = () => {

    // if(oAPP.attr.isCallback !== "X") {


    // }



    // // 브라우저의 닫기 버튼을 누른게 아니라면 종료 하지 않음
    // if (oAPP.attr.isPressWindowClose !== "X") {
    //     return false;
    // }

}; // end of window.onbeforeunload
