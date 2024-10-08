/**************************************************************************                                           
 * ws_fn_05.js
 **************************************************************************/
(function(window, $, oAPP) {
    "use strict";


    function _findMainWindowWithBrowsKey(sBrowsKey){

        // 리턴 구조
        let _oRET = {
            RETCD: "E",
            RDATA: ""
        };

        let _aAllWindows = parent.REMOTE.BrowserWindow.getAllWindows();
        if(_aAllWindows.length === 0){
            return _oRET;
        }

        

        for(const _oWin of _aAllWindows){

            if (_oWin.isDestroyed()) {
                continue;
            }

            let _oWebCon = _oWin.webContents;
            let _oWebPref = _oWebCon.getWebPreferences();
            let _sBrowsKey = _oWebPref.browserkey;

            // 브라우저에 Object Type이 없다면 다음 수행
            if(!_oWebPref.OBJTY){
                continue;
            }

            // 브라우저에 Object Type이 MAIN이 아닐 경우 다음 수행
            if(_oWebPref.OBJTY !== "MAIN"){
                continue;
            }

            // 브라우저에 브라우저 키가 없다면 다음 수행
            if(!_sBrowsKey){
                continue;
            }

            // 전달받은 브라우저 키와 다르다면 다음 수행
            if(_sBrowsKey !== sBrowsKey){
                continue;
            }

            _oRET.RETCD = "S";
            _oRET.RDATA = _oWin;
            
            return _oRET;

        }        

        return _oRET;

    } // end of _findMainWindowWithBrowsKey



    /************************************************************************
     * AI와 연동 or 연동 해제
     ************************************************************************
     * @param {Boolean} bIsState 
     * - true: AI와 연동
     * - false: AI와 연동 해제
     * 
     * @returns null
     ************************************************************************/
    oAPP.fn.setConnectionAI = async function(bIsState){

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        let _oSwitch = sap.ui.getCore().byId("ws20_ai_con_btn");
        if(!_oSwitch){
            return;
        }
        
        let _sBrowsKey = parent.getBrowserKey();

        // AI 서버 연결 시도
        if(bIsState === true){

            // AI 서버에 전달할 파라미터
            let _oPARAM = {
                CONID: _sBrowsKey,
                PARAM: {
                    USER_INFO   : parent.getUserInfo(),         // 로그인 유저 정보
                    SERVER_INFO : parent.getServerInfo(),       // 접속 서버 정보
                    SERVER_HOST : parent.getServerHost(),       // 접속 서버의 호스트 정보
                    SERVER_PATH : parent.getServerPath(),       // 접속 서버 호출 URL 정보
                    BROWSKEY    : _sBrowsKey,       // AI와 연결할 Workspace의 Browser Key
                }
            }

            let _oClient = await parent.UAI.connect(_oPARAM);
            if(_oClient.RETCD === "E"){

                _oSwitch.setState(false);

                switch (_oClient.ERRCD) {

                    case "E003":    // AI 서버가 실행되지 않았을 경우

                        var _sErrMsg = "AI 서버가 실행되지 않았습니다!!"; // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);

                        // busy 끄고 Lock 풀기
                        oAPP.common.fnSetBusyLock("");

                        break;

                    case "E004":    // AI 서버에 요청 보냈는데 응답이 없을 경우.

                        var _sErrMsg = "AI 서버가 응답이 없습니다!!"; // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);

                        // busy 끄고 Lock 풀기
                        oAPP.common.fnSetBusyLock("");

                        break;

                    // AI 서버에서 에서 응답한 코드
                    case "AIE04":

                        var _sErrMsg = "이미 다른 서버에서 연결되어 있습니다!!"; // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);


                        // 현재 연결되어있는 브라우저를 찾아서 focus를 준다.

                        // 리턴 받은 파라미터
                        let _oPARAM = _oClient.RDATA;

                        // 현재 AI와 연결되어 있는 브라우저의 키
                        let _sCurrConnId = _oPARAM.CURR_CONID;

                        // 현재 AI와 연결되어 있는 브라우저를 찾아서 해당 브라우저에 focus를 준다.
                        let _oFindResult = _findMainWindowWithBrowsKey(_sCurrConnId);
                        if(_oFindResult.RETCD !== "E"){
                            
                            let _oFoundWindow = _oFindResult.RDATA;

                            _oFoundWindow.show();

                        }

                        // busy 끄고 Lock 풀기
                        oAPP.common.fnSetBusyLock("");

                        break;
                
                    default:
                        break;
                }

                return;
            }        

            var _sMsg = "연결 성공!!"; // [MSG]

            sap.m.MessageToast.show(_sMsg);
            
            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // AI 연결 해제

        // AI 서버에 요청할 데이터
        let _oPARAM = {
            CONID: _sBrowsKey
        };

        let _oClient = await parent.UAI.disconnect(_oPARAM);
        if(_oClient.RETCD === "E"){

            _oSwitch.setState(false);

            switch (_oClient.ERRCD) {

                case "E005": // AI 서버와 연결된 상태가 아닐 경우
                    
                    var _sErrMsg = "연결된 상태가 아닙니다!!"; // [MSG]

                    sap.m.MessageToast.show(_sErrMsg);

                    // busy 끄고 Lock 풀기
                    oAPP.common.fnSetBusyLock("");

                    return;
            
                default:
                    break;
            }
    
            // busy 끄고 Lock 풀기
            oAPP.common.fnSetBusyLock("");

            return;
        }

        // 연결 해제 시, uai/index.js에서 연결이 끊어질 때 호출되는 
        // client.on('end') 이벤트에 공통적으로 호출되기 때문에 로직 이원화 방지를 위해
        // 연결이 끊어질 때의 이후 프로세스 로직을 넣음.

        // var _sMsg = "AI와 연결이 해제 되었습니다."; // [MSG]

        // sap.m.MessageToast.show(_sMsg);
        
        // oAPP.common.fnSetBusyLock("");

    }; // end of oAPP.fn.setConnectionAI


})(window, $, oAPP);