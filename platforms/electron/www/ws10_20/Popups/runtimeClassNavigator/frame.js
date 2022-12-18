/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : runtimeClassNavigator/frame.js
 ************************************************************************/

let oAPP = (function(window) {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};
    oAPP.common = {};
    oAPP.attr.aRuntime = [];

    oAPP.REMOTE = require('@electron/remote');
    oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain;
    oAPP.IPCRENDERER = require('electron').ipcRenderer;
    oAPP.PATH = oAPP.REMOTE.require('path');
    oAPP.APP = oAPP.REMOTE.app;

    oAPP.setBusy = function(bIsShow) {

        var oLoadPg = document.getElementById("u4a_main_load");

        if (!oLoadPg) {
            return;
        }

        if (bIsShow == 'X') {
            oLoadPg.classList.remove("u4a_loadersInactive");
        } else {
            oLoadPg.classList.add("u4a_loadersInactive");
        }

    };

    oAPP.common.fnGetMsgClsText = (sMsgCls, sMsgNum, p1, p2, p3, p4) => {

        // Metadata에서 메시지 클래스 정보를 구한다.
        var oMeta = getMetadata(),
            sLangu = oMeta.LANGU,
            aMsgClsTxt = oMeta["MSGCLS"];

        if (!aMsgClsTxt || !aMsgClsTxt.length) {
            return sMsgCls + "|" + sMsgNum;
        }

        let sDefLangu = "E"; // default language    

        // 현재 접속한 언어로 메시지를 찾는다.
        let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sLangu && a.MSGNR == sMsgNum);

        // 현재 접속한 언어로 메시지를 못찾은 경우
        if (!oMsgTxt) {

            // 접속한 언어가 영어일 경우 빠져나간다.
            if (sDefLangu == sLangu) {
                return sMsgCls + "|" + sMsgNum;

            }

            // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
            oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sDefLangu && a.MSGNR == sMsgNum);

            // 그래도 없다면 빠져나간다.
            if (!oMsgTxt) {
                return sMsgCls + "|" + sMsgNum;
            }

        }

        var sText = oMsgTxt.TEXT,
            aWithParam = [];

        // 파라미터로 전달 받은 Replace Text 수집
        aWithParam.push(p1 == null ? "" : p1);
        aWithParam.push(p2 == null ? "" : p2);
        aWithParam.push(p3 == null ? "" : p3);
        aWithParam.push(p4 == null ? "" : p4);

        var iWithParamLenth = aWithParam.length;
        if (iWithParamLenth == 0) {
            return sText;
        }

        // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
        for (var i = 0; i < iWithParamLenth; i++) {

            var index = i + 1,
                sParamTxt = aWithParam[i];

            var sRegEx = "&" + index,
                oRegExp = new RegExp(sRegEx, "g");

            sText = sText.replace(oRegExp, sParamTxt);

        }

        sText = sText.replace(new RegExp("&\\d+", "g"), "");

        // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
        for (var i = 0; i < iWithParamLenth; i++) {

            var sParamTxt = aWithParam[i];

            sText = sText.replace(new RegExp("&", "i"), sParamTxt);

        }

        sText = sText.replace(new RegExp("&", "g"), "");

        return sText;

    }; // end of oAPP.common.fnTestGetMsgClsText

    function getMetadata() {

        return oAPP.attr.oMetadata;

    }

    /************************************************************************
     * IPCRENDERER Events..
     ************************************************************************/
    oAPP.IPCRENDERER.on('if-runtime-info', (events, oInfo) => {

        oAPP.attr.oUserInfo = oInfo.oUserInfo; // 접속 로그인 정보
        oAPP.attr.oThemeInfo = oInfo.oThemeInfo; // 테마 개인화 정보
        oAPP.attr.oMetadata = oInfo.oMetadata; // Sap 접속 System Meta 정보

        let aRuntimeData = oInfo.aRuntimeData;

        // 전달받은 Runtime 데이터가 Array 형식이 아니면 리턴.
        if (aRuntimeData instanceof Array == false) {
            return;
        }

        var sPrefixClassNm = "ZCL_U4A_";

        // 신규 NAMESPACE 대상인 경우.
        if (oAPP.attr.oMetadata && oAPP.attr.oMetadata.IS_NAME_SPACE == "X") {
            sPrefixClassNm = "/U4A/CL_";
        }

        var iRuntimeCnt = aRuntimeData.length,
            aRuntime = [];

        // Runtime Class 정보 구성
        for (var i = 0; i < iRuntimeCnt; i++) {

            // Object Type이 "1" 인것만 수집
            var oRuntime = aRuntimeData[i];
            if (oRuntime.OBJTY != "1") {
                continue;
            }

            aRuntime.push({
                UIOBJ: oRuntime.UIOBJ, // UI 명
                LIBNM: oRuntime.LIBNM, // UI5 Library 명
                CLASS: sPrefixClassNm + oRuntime.UIOBK
            });

        }

        // Runtime Class 정보 Global 변수에 저장
        oAPP.attr.aRuntime = aRuntime;

        var oWs_frame = document.getElementById("ws_frame");
        if (!oWs_frame) {
            return;
        }

        oWs_frame.src = "index.html";

    });

    window.oAPP = oAPP;

    return oAPP;

})(window);