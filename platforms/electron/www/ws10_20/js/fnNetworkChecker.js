/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnNetworkChecker.js
 * - file Desc : 네트워크 연결 상태에 따른 이벤트
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * 네트워크 연결 시 Network Indicator 해제
     * **********************************************************************/
    oAPP.fn.fnNetworkCheckerOnline = function(){
        
        // 네트워크 활성화 여부 flag
        oAPP.attr.bIsNwActive = true;
        
        var bIsNwActive = oAPP.attr.bIsNwActive;            

        // 현재 네트워크 상태에 따라 Child Window를 활성/비활성 처리 한다.        
        oAPP.common.fnIsChildWindowShow(bIsNwActive);

        parent.setNetworkBusy(!bIsNwActive);

    }; // end of oAPP.fn.fnNetworkCheckerOnline

    /************************************************************************
     * 네트워크 연결 시 Network Indicator 실행
     * **********************************************************************/
    oAPP.fn.fnNetworkCheckerOffline = function(){

        // 네트워크 활성화 여부 flag
        oAPP.attr.bIsNwActive = false;

        var bIsNwActive = oAPP.attr.bIsNwActive;

        // z-index 구하기
        var iZindex = oAPP.common.fnGetZIndex();

        // 현재 네트워크 상태에 따라 Child Window를 활성/비활성 처리 한다.        
        oAPP.common.fnIsChildWindowShow(bIsNwActive);

        parent.setNetworkBusy(!bIsNwActive, iZindex);

    }; // end of oAPP.fn.fnNetworkCheckerOffline    

})(window, $, oAPP);