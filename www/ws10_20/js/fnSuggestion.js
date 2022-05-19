/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnSuggestion.js
 * - file Desc : Suggestion 관련 js
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),
        FS = parent.FS,
        APPCOMMON = oAPP.common;
        
    const EVENTSUGG_PATH = parent.getPath("EVENTSUGG");
    
    const SUGGMAXLENGTH = 10;

    /************************************************************************
     * Add Event Method의 Suggestion 저장
     ************************************************************************/
    oAPP.fn.fnAddEventSuggSave = (sEventName) => {

        let sJsonPath = EVENTSUGG_PATH,
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            aSuggData = JSON.parse(sJsonData);

        if (aSuggData instanceof Array == false) {
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

        if (aSuggData instanceof Array == false) {
            return [];
        }

        return aSuggData;

    }; // end of oAPP.fn.fnAddEventSuggRead

})(window, $, oAPP);