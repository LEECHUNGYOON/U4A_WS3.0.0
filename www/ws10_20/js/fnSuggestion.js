/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnSuggestion.js
 * - file Desc : Suggestion 관련 js
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),
        FS = parent.FS,
        APPCOMMON = oAPP.common;

    const
        EVENTSUGG_PATH = parent.getPath("EVENTSUGG"),
        P13N_ROOT = PATH.join(USERDATA, "p13n"),
        SUGG_ROOT = PATH.join(P13N_ROOT, "suggestion");

    const SUGGMAXLENGTH = 10;

    /************************************************************************
     * Add Event Method의 Suggestion 저장
     ************************************************************************/
    oAPP.fn.fnAddEventSuggSave = (sEventName) => {

        let sJsonPath = EVENTSUGG_PATH,
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            aSuggData = JSON.parse(sJsonData);

        if (Array.isArray(aSuggData) == false) {
            aSuggData = [];
        }

        // 저장된 데이터 중 같은 값이 있는지 확인한다.
        var iFindIndex = aSuggData.findIndex(a => a.NAME == sEventName);

        // 같은 값이 있고 Array에 첫번째이면 그냥 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        // 저장하려는 값이 이미 있고 Array에 첫번째가 아니면 
        // 기존 저장된 위치의 ID 정보를 삭제
        if (iFindIndex > 0) {
            aSuggData.splice(iFindIndex, 1);
        }

        var iBeforeCnt = aSuggData.length,
            oEventName = {
                NAME: sEventName
            },

            aNewArr = [];

        // 저장된 Suggestion 갯수가 MaxLength 이상이면
        // 마지막거 지우고 최신거를 1번째로 저장한다.
        if (iBeforeCnt >= SUGGMAXLENGTH) {

            for (var i = 0; i < SUGGMAXLENGTH - 1; i++) {
                aNewArr.push(aSuggData[i]);
            }

        } else {

            for (var i = 0; i < iBeforeCnt; i++) {
                aNewArr.push(aSuggData[i]);
            }

        }

        aNewArr.unshift(oEventName);

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(aNewArr));

    }; // end of oAPP.fn.fnAddEventSuggSave

    /************************************************************************
     * Add Event Method의 저장된 Suggestion 읽어오기
     ************************************************************************/
    oAPP.fn.fnAddEventSuggRead = () => {

        let sJsonPath = EVENTSUGG_PATH,
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            aSuggData = JSON.parse(sJsonData);

        if (Array.isArray(aSuggData) == false) {
            return [];
        }

        return aSuggData;

    }; // end of oAPP.fn.fnAddEventSuggRead

    /************************************************************************
     * Suggestion 데이터 저장
     * **********************************************************************
     * @param {String} sJsonFile  
     * - json 파일 명
     * 
     * @param {any} oData 
     * - Suggestion 저장할 데이터
     ************************************************************************/
    oAPP.fn.fnSuggestionSave = (sJsonFile, oData) => {

        var sSavePath = PATH.join(SUGG_ROOT, `${sJsonFile}.json`);

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sSavePath, JSON.stringify(oData));

    }; // end of oAPP.fn.fnSuggestionSave

    /************************************************************************
     * Suggestion 데이터 읽어오기
     * **********************************************************************
     * @param {String} sJsonFile  
     * - json 파일 명
     * 
     * @return {any} oData 
     * - 저장된 Suggestion 데이터
     ************************************************************************/
    oAPP.fn.fnSuggestionRead = (sJsonFile) => {

        var sReadPath = PATH.join(SUGG_ROOT, `${sJsonFile}.json`);

        if (!FS.existsSync(sReadPath)) {
            return;
        }

        var sReadData = FS.readFileSync(sReadPath, 'utf-8');

        return JSON.parse(sReadData);

    } // end of oAPP.fn.fnSuggestionRead

    oAPP.fn.fnReadTCodeSuggestion = () => {

        const
            SUGGNAME = "tcode";

        return oAPP.fn.fnSuggestionRead(SUGGNAME);

    };

    oAPP.fn.fnSaveTCodeSuggestion = (sTcode) => {

        const
            SUGGNAME = "tcode",
            TCODESUGGMAXLEN = 20;

        var aSuggData = oAPP.fn.fnSuggestionRead(SUGGNAME);

        // 저장된 데이터 중 같은 값이 있는지 확인한다.
        var iFindIndex = aSuggData.findIndex(a => a.TCODE == sTcode);

        // 같은 값이 있고 Array에 첫번째이면 그냥 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        // 저장하려는 값이 이미 있고 Array에 첫번째가 아니면 
        // 기존 저장된 위치의 ID 정보를 삭제
        if (iFindIndex > 0) {
            aSuggData.splice(iFindIndex, 1);
        }

        var iBeforeCnt = aSuggData.length,
            oEventName = {
                TCODE: sTcode
            },

            aNewArr = [];

        // 저장된 Suggestion 갯수가 MaxLength 이상이면
        // 마지막거 지우고 최신거를 1번째로 저장한다.
        if (iBeforeCnt >= TCODESUGGMAXLEN) {

            for (var i = 0; i < TCODESUGGMAXLEN - 1; i++) {
                aNewArr.push(aSuggData[i]);
            }

        } else {

            for (var i = 0; i < iBeforeCnt; i++) {
                aNewArr.push(aSuggData[i]);
            }

        }

        aNewArr.unshift(oEventName);

        oAPP.fn.fnSuggestionSave(SUGGNAME, aNewArr);

    };

})(window, $, oAPP);