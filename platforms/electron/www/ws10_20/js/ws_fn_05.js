/**************************************************************************                                           
 * ws_fn_05.js
 **************************************************************************/
(function(window, $, oAPP) {


    oAPP.fn.setConnectionAI = async function(bIsState){

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        let _oSwitch = sap.ui.getCore().byId("ws20_ai_con_btn");
        if(!_oSwitch){
            return;
        }

        
        // AI 서버 연결 시도
        if(bIsState === true){

            // AI 서버에 요청할 데이터
            let _oPARAM = {
                CONID: parent.getBrowserKey(),
                USERINFO: parent.getUserInfo(),
                SERVER_INFO: parent.getServerInfo(),

            }

            debugger;


            let _oClient = await parent.UAI.connect(_oPARAM);
            if(_oClient.RETCD === "E"){

                _oSwitch.setState(false);

                // console.error("connect", _oClient);

                switch (_oClient.ERRCD) {

                    case "E003":    // AI 서버가 실행되지 않았을 경우

                        sap.m.MessageToast.show("AI 서버가 실행되지 않았습니다!!");

                        parent.setBusy(false);

                        break;

                    case "E004":    // AI 서버에 요청 보냈는데 응답이 없을 경우.

                        sap.m.MessageToast.show("AI 서버가 응답이 없습니다!!");

                        parent.setBusy(false);

                        break;

                    // AI 서버에서 에서 응답한 코드
                    case "AIE04":

                        sap.m.MessageToast.show("이미 다른 서버에서 연결되어 있습니다!!");

                        parent.setBusy(false);

                        break;
                
                    default:
                        break;
                }

                return;
            }        

            sap.m.MessageToast.show("연결 성공!!");
            
            parent.setBusy(false);

            return;
        }

        // AI 연결 해제

        // AI 서버에 요청할 데이터
        let _oPARAM = {
            CONID: parent.getBrowserKey()
        }

        let _oClient = await parent.UAI.disconnect(_oPARAM);
        if(_oClient.RETCD === "E"){

            _oSwitch.setState(false);

            switch (_oClient.ERRCD) {

                            case "E005": // AI 서버와 연결된 상태가 아닐 경우
                                
                                sap.m.MessageToast.show("연결된 상태가 아닙니다!!");
            
                                parent.setBusy(false);
            
                                return;
                        
                            default:
                                break;
                        }
            
                        parent.setBusy(false);
            
                        return;
                    }

    }; // end of oAPP.fn.setConnectionAI


})(window, $, oAPP);