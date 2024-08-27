(function(oAPP){
    "use strict";

    /********************************************************
     * 브로드 캐스트 이벤트 걸기
     ********************************************************/
    oAPP.fn.fnBroadCast_Attach_Event_Handler = function(){

        oAPP.attr.oMainBroad = new BroadcastChannel(`broadcast-to-child-window_${parent.getBrowserKey()}`);

        oAPP.attr.oMainBroad.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;
    
            if(typeof _PRCCD === "undefined"){
                return;
            }
    
            //프로세스에 따른 로직분기.
            switch (_PRCCD) {

                //BUSY ON을 요청 받은 경우.
                case "BUSY_ON":

                    //BUSY DIALOG를 호출하는경우.
                    if(oEvent?.data?.TYPE === "DIALOG"){

                        var _sOption = {};

                        _sOption.TITLE = oEvent?.data?.TITLE || "";
                        _sOption.DESC  = oEvent?.data?.DESC || "";

                        parent.setBusy("X", _sOption);

                        return;
                    }
                
                    parent.setBusy("X");
    
                    break;
    
                case "BUSY_OFF":

                    //BUSY OFF를 요청 받은 경우.
                    parent.setBusy("");
    
                    break;
    
                default:
                    break;
            }
    
        };

    }; // end of oAPP.fn.fnBroadCast_Attach_Event_Handler


})(oAPP);
