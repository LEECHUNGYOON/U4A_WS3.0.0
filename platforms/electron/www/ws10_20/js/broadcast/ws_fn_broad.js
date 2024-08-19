(function(oAPP){
    "use strict";

    /********************************************************
     * 브로드 캐스트 이벤트 걸기
     ********************************************************/
    oAPP.fn.fnBroadCast_Attach_Event_Handler = function(){

        oAPP.attr.oMainBroad = new BroadcastChannel(`broadcast-to-child-window_${parent.getBrowserKey()}`);

        // 메인 브라우저 닫기 버튼
        let _oMainCloseBtn = sap.ui.getCore().byId("mainWinClose");

        oAPP.attr.oMainBroad.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;
    
            if(typeof _PRCCD === "undefined"){
                return;
            }
    
            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":
                    //BUSY ON을 요청받은경우.         
                    // 메인 브라우저 닫기 버튼 비활성
                    _oMainCloseBtn.setEnabled(false);

                    parent.setBusy("X");
    
                    break;
    
                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.

                    // 메인 브라우저 닫기 버튼 활성
                    _oMainCloseBtn.setEnabled(true);

                    parent.setBusy("");
    
                    break;
    
                default:
                    break;
            }
    
        };

    }; // end of oAPP.fn.fnBroadCast_Attach_Event_Handler


})(oAPP);
