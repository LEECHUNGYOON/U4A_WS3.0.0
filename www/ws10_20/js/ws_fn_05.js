/**************************************************************************                                           
 * ws_fn_05.js
 **************************************************************************/
(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * 현재 AI와 연결되어 있는 브라우저를 찾아서 해당 브라우저에 focus를 준다.
     ************************************************************************/
    function _focusOnAIBrowser(sBrowsKey){

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

            try {               
            
                var _oWebCon = _oWin.webContents;
                var _oWebPref = _oWebCon.getWebPreferences();
                var _sBrowsKey = _oWebPref.browserkey;

            } catch (error) {
                continue;
            }

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

    } // end of _focusOnAIBrowser
    

    /************************************************************************
     * AI 연결 시도 이후에 연결 대기를 위한 인터벌 제거
     ************************************************************************/
    function _clearIntervaliUAIConn() {

        if (oAPP.attr.iUAIConnInterval) {
            clearInterval(oAPP.attr.iUAIConnInterval);
            delete oAPP.attr.iUAIConnInterval;
        }

    } // end of _clearIntervalSapGuiCheck


    /************************************************************************
     * AI 연결을 위한 딥링크용 Iframe 제거
     ************************************************************************/
    function _clearAiDeepLinkIframe(){

        let _oFrameDom = document.getElementById("uai-conn");
        if(!_oFrameDom){
            return;
        }

        document.body.removeChild(_oFrameDom);

    } // end of _clearAiDeepLinkIframe


    /************************************************************************
     * AI 연결 스위치 버튼 이벤트
     ************************************************************************/
    oAPP.fn.onAiConnSwitchBtn = function(oEvent){        

        // Busy On
        parent.setBusy("X", {});

        // 전체 자식 윈도우에 Busy 킨다.
        oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_ON" });


        let bIsState = oEvent.getParameter("state");

        let _oSwitch = oEvent.getSource();
        if(!_oSwitch){
            
            // 스위치 버튼 연결 해제 표시
            oAPP.common.fnSetModelProperty("/UAI/state", false);

            // Busy Off
            parent.setBusy("");

            // 전체 자식 윈도우에 Busy 끈다
            oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

            return;
        }

       
        // AI와 연동 or 연동 해제
        oAPP.fn.setConnectionAI(bIsState);

    }; // end of oAPP.fn.onAiConnSwitchBtn

    
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
        
        // 브라우저 키 정보
        let _sBrowsKey = parent.getBrowserKey();

        // 연결 해제일 경우
        if(bIsState == false){

            // AI 서버에 요청할 데이터
            let _oPARAM = {
                CONID: _sBrowsKey
            };

            let _oClient = await parent.UAI.disconnect(_oPARAM);
            if(_oClient.RETCD === "E"){

                // 스위치 버튼 연결 해제 표시
                oAPP.common.fnSetModelProperty("/UAI/state", false);

                switch (_oClient.STCOD) {

                    case "AI-DISCONNECT-E001": // AI 서버와 연결된 상태가 아닐 경우
                        
                        var _sErrMsg = "연결된 상태가 아닙니다!!"; // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);

                        // Busy Off
                        parent.setBusy("");

                        // 전체 자식 윈도우에 Busy 끈다
                        oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

                        return;
                
                    default:
                        break;
                }
        
                // Busy Off
                parent.setBusy("");

                // 전체 자식 윈도우에 Busy 끈다
                oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });
            
            }

            // Busy Off
            parent.setBusy("");

            // 전체 자식 윈도우에 Busy 끈다
            oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

            return;
        }


        // [private] 연결 시도
        async function lf_setConnect(_oPARAM){

            let _oClient = await parent.UAI.connect(_oPARAM);
            if(_oClient.RETCD === "E"){

                // 스위치 버튼 연결 해제 표시
                oAPP.common.fnSetModelProperty("/UAI/state", false);

                switch (_oClient.STCOD) {

                    // [AI에서 전달한 코드]
                    // 이미 다른 서버에서 연결 되어 있을 경우
                    case "AI-CONNECT-E002":

                        var _sErrMsg = "이미 다른 서버에서 연결되어 있습니다!!"; // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);

                        /**
                         * 현재 연결되어있는 브라우저를 찾아서 focus를 준다.
                         */

                        // 리턴 받은 파라미터
                        let _oPARAM = _oClient.PARAM;

                        // 현재 AI와 연결되어 있는 브라우저의 키
                        let _sCurrConnId = _oPARAM.CURR_CONID;

                        // 현재 AI와 연결되어 있는 브라우저를 찾아서 해당 브라우저에 focus를 준다.
                        let _oFindResult = _focusOnAIBrowser(_sCurrConnId);
                        if(_oFindResult.RETCD !== "E"){
                            
                            let _oFoundWindow = _oFindResult.RDATA;

                            _oFoundWindow.show();

                        }

                        // 이전에 돌고 있는 인터벌을 삭제한다.
                        _clearIntervaliUAIConn();

                        // 딥링크 실행용 iframe을 삭제한다.
                        _clearAiDeepLinkIframe();

                        // 연결 시도 횟수 초기화
                        delete oAPP.attr.iUAIConnRetryCount;

                        // Busy Off
                        parent.setBusy("");  

                        // 전체 자식 윈도우에 Busy 끈다
                        oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });
                        
                        return;
                        

                    // [UAI.connect => _sendConnectInfo => AI.iConnTimeout 부분]
                    // 연결은 됐는데 AI에서 아무런 응답이 없을 경우                    
                    // case "E004":                        
                    case "AI-CONNECT-E999":

                        var _sErrMsg = "AI 프로그램에서 응답이 없습니다.";  // [MSG]

                        sap.m.MessageToast.show(_sErrMsg);

                        // 이전에 돌고 있는 인터벌을 삭제한다.
                        _clearIntervaliUAIConn();

                        // 딥링크 실행용 iframe을 삭제한다.
                        _clearAiDeepLinkIframe();

                        // 연결 시도 횟수 초기화
                        delete oAPP.attr.iUAIConnRetryCount;

                        // Busy Off
                        parent.setBusy("");  

                        // 전체 자식 윈도우에 Busy 끈다
                        oAPP.attr.oMainBroad.postMessage({ PRCCD: "BUSY_OFF" });

                        // AI 연결 해제
                        await parent.UAI.disconnect({ CONID: parent.getBrowserKey() });
                  
                        return;
                
                }
        
                var _sFrameId = "uai-conn";
                var _oFrameDom = document.getElementById(_sFrameId);

                // 딥링크 실행할 iframe이 없을 경우에만 동적 생성 후 실행
                if(!_oFrameDom){

                    var _oFrameDom = document.createElement("iframe");
                        _oFrameDom.id = _sFrameId;


                    // TEST ---- Start
                    _oFrameDom.src = "uai-suite://yoon_test";
                    // TEST ---- End
                
                    // 딥링크를 호출한다.
                    document.body.appendChild(_oFrameDom);

                }

                // 이전에 돌고 있는 인터벌을 삭제한다.
                _clearIntervaliUAIConn();
                
                // 연결 시도 최대 횟수
                let iMaxTime = 60;        

                // 연결 시도 횟수 초기화
                if(typeof oAPP.attr.iUAIConnRetryCount === "undefined"){
                    oAPP.attr.iUAIConnRetryCount = 0;
                }    

                // 인터벌로 1분동안 재귀 돌린다.
                oAPP.attr.iUAIConnInterval = setInterval(async function(){

                    // 연결 시도 횟수
                    oAPP.attr.iUAIConnRetryCount += 1;

                    // Busy On
                    let _sDescMsg = `AI 응답 대기중... ( ${oAPP.attr.iUAIConnRetryCount} / ${iMaxTime} )`;    // [MSG]

                    parent.setBusy("X", { DESC: _sDescMsg });

                    // console.log("ai 대기시간", oAPP.attr.iUAIConnRetryCount);

                    // iMaxTime초 이후에도 dialog가 닫히지 않았다면 강제로 닫아준다.
                    // if (iCurrTime >= iMaxTime) {
                    if (oAPP.attr.iUAIConnRetryCount >= iMaxTime) {

                        // 스위치 버튼 연결 해제 표시
                        oAPP.common.fnSetModelProperty("/UAI/state", false);

                        // 이전에 돌고 있는 인터벌을 삭제한다.
                        _clearIntervaliUAIConn();

                        // 딥링크 실행용 iframe을 삭제한다.
                        _clearAiDeepLinkIframe();

                        // 연결 시도 횟수 초기화
                        delete oAPP.attr.iUAIConnRetryCount;

                        // [MSG]
                        let _sMsg = "AI와 연결할 수 없습니다. 잠시후 다시 시도 하세요.";

                        sap.m.MessageBox.warning(_sMsg);

                        // Busy Off
                        parent.setBusy("");

                        // 전체 자식 윈도우에 Busy 끈다
                        oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

                        return;

                    }

                    await lf_setConnect(_oPARAM);

                }, 1000);

                return;

            }

            // 이전에 돌고 있는 인터벌을 삭제한다.
            _clearIntervaliUAIConn();

            // 딥링크 실행용 iframe을 삭제한다.
            _clearAiDeepLinkIframe();

            // 연결 시도 횟수 초기화
            delete oAPP.attr.iUAIConnRetryCount;

            var _sMsg = "연결 성공!!"; // [MSG]

            sap.m.MessageToast.show(_sMsg);
        
            // 스위치 버튼 연결 성공
            oAPP.common.fnSetModelProperty("/UAI/state", true);

            // Busy Off
            parent.setBusy("");

            // 전체 자식 윈도우에 Busy 끈다
            oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

        } // end of lf_setConnect     



        // Busy On
        var _sDescMsg = "AI 설치 확인중...";    // [MSG]

        parent.setBusy("X", { DESC: _sDescMsg });

        // AI 설치 유무를 체크 하기 위한 경로
        let _sAI_InstPath = parent.PATH.join(parent.USERDATA, "..", "com.uai.app");

        // AI 설치 유무 확인
        if(parent.FS.existsSync(_sAI_InstPath) === false){

            // 스위치 버튼 연결 해제 표시
            oAPP.common.fnSetModelProperty("/UAI/state", false);

            // [MSG]
            let _sMsg = "AI가 설치되지 않았습니다. 설치 후 다시 실행해 주세요.";

            parent.showMessage(sap, 20, "W", _sMsg);

            parent.setBusy("");

            // 전체 자식 윈도우에 Busy 끈다
            oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

            return;

        }

        // AI 서버에 전달할 파라미터
        let _oPARAM = {
            CONID: _sBrowsKey,
            USER_INFO   : parent.getUserInfo(),         // 로그인 유저 정보
            SERVER_INFO : parent.getServerInfo(),       // 접속 서버 정보
            SERVER_HOST : parent.getServerHost(),       // 접속 서버의 호스트 정보
            SERVER_PATH : parent.getServerPath(),       // 접속 서버 호출 URL 정보
            BROWSKEY    : _sBrowsKey,                   // AI와 연결할 Workspace의 Browser Key
            FROM        : parent.getCurrPage(),         // 호출처 정보 (현재 페이지 정보, WS10, WS20, WS30)

            // PARAM: {
            //     USER_INFO   : parent.getUserInfo(),         // 로그인 유저 정보
            //     SERVER_INFO : parent.getServerInfo(),       // 접속 서버 정보
            //     SERVER_HOST : parent.getServerHost(),       // 접속 서버의 호스트 정보
            //     SERVER_PATH : parent.getServerPath(),       // 접속 서버 호출 URL 정보
            //     BROWSKEY    : _sBrowsKey,                   // AI와 연결할 Workspace의 Browser Key
            //     FROM        : parent.getCurrPage()          // 호출처 정보 (현재 페이지 정보, WS10, WS20, WS30)
            // }

        };

        // Busy On
        var _sDescMsg = "AI 연결중...";    // [MSG]

        parent.setBusy("X", { DESC: _sDescMsg });

        await lf_setConnect(_oPARAM);

    }; // end of oAPP.fn.setConnectionAI


})(window, $, oAPP);