
/**
 * 오류 코드 정의
 * 
 * E001: 전송 데이터 포맷 오류
 * E002: PRCCD 필수값 오류
 * E003: AI 서버가 실행되지 않았을 경우
 * E004: 응답 없음 오류!!
 * E005: AI 서버와 연결된 상태가 아닐 경우
 * E006: AI 서버에서 잘못된 응답을 준 경우
 */


/******************************************************************************
 *  💖 DATA / ATTRIBUTE 선언부
 ******************************************************************************/

// AI 서버와 통신하기 위한 채널ID
const C_PIPE_NANE = '\\\\.\\pipe\\u4a_ai';

// AI 서버와 통신 시 응답 대기 시간
const C_AI_CB_WAIT_TIME = 10000;

const NET = require("net");

// AI간 IF 시, custom event 를 사용하기 위한 DOM
let oAI_IF_DOM = document.getElementById("ai_if_dom");

// AI 서버 연결 클라이언트 인스턴스
let CLIENT = undefined;

// AI 대표 Object
let AI = {};




/******************************************************************************
 *  💖 PRIVITE FUNCTION 선언부
 ******************************************************************************/


    /****************************************************************
     * @private function - AI 프로그램에 연결 시, 연결 정보 전송
     ****************************************************************/
    function _sendConnectInfo(oPARAM, fCallback){
            
        // AI 서버에 요청 수행 타임아웃 변수 초기화
        if(AI.iConnTimeout){
            clearTimeout(AI.iConnTimeout);
            delete AI.iConnTimeout;
        }

        // 커스텀 이벤트 명
        let _sEventName = `ai-${oPARAM.PRCCD}`;

        // 커스텀 이벤트 콜백
        let _fCallback = function(oEvent){

            // AI 서버에 요청 수행 타임아웃 변수 초기화
            if(AI.iConnTimeout){
                clearTimeout(AI.iConnTimeout);
                delete AI.iConnTimeout;
            }

            // 커스텀 이벤트 지우기
            oAI_IF_DOM.removeEventListener(_sEventName, _fCallback);

            // AI 서버에서 전달받은 데이터
            let _oIF_DATA = oEvent.detail;

            /*********************************************************************************
             * 연결이 성공일 경우에만 CLIENT의 end 이벤트를 건다.
             *********************************************************************************
             * - AI 모듈 API의 connect를 수행 할때, 
             *   createConnection을 생성하면서 CLIENT.end 이벤트를 걸어 놓으면,
             *   기존에 다른 브라우저가 이미 연결된 상태에서 연결을 시도 시, AI서버에서 이미 연결된
             *   브라우저가 있다고 오류 코드와 함께 Stream.end를 전송하면,
             *   해당 파라미터를 AI 모듈 API의 connect의 콜백으로 받아서
             *   메시지 처리 등의 후속 프로세스를 처리하려고 하는데
             *   AI에서 Stream.end를 수행 했기 때문에 나의 CLIENT.end 이벤트도 호출되어
             *   결과적으로 이벤트가 두번 타는 현상이 생기기 때문에,
             *   연결 성공할때만 CLIENT.end를 걸고, 실패할 경우는 CLIENT.end 이벤트를 안걸면
             *   위와 같은 혼선이 없어서 이렇게 처리함.
             *********************************************************************************/
            if(_oIF_DATA?.RETCD === "S"){

                // CLIENT.end 이벤트 걸기
                attachEndEvent();

            }

            if(typeof fCallback === "function"){
                fCallback(_oIF_DATA);
            }

        } // end of _fCallback

        oAI_IF_DOM.addEventListener(_sEventName, _fCallback);

        // 연결 정보 전달
        CLIENT.write(JSON.stringify(oPARAM));

        // AI 서버에 요청 수행 후 응답 대기
        AI.iConnTimeout = setTimeout(function(){

            // 응답이 없습니다 연결 실패!!

            // AI 서버에 요청 수행 타임아웃 변수 초기화
            if(AI.iConnTimeout){
                clearTimeout(AI.iConnTimeout);
                delete AI.iConnTimeout;
            }

            // 커스텀 이벤트 지우기
            oAI_IF_DOM.removeEventListener(_sEventName, _fCallback);

            if(typeof fCallback === "function"){            

                fCallback({
                    RETCD: "E",
                    ERRCD: "E004" // 응답 없음 오류!!
                });
            }

        }, C_AI_CB_WAIT_TIME);

    } // end of _sendConnectInfo

    /*************************************************************
     * @function - AI 서버와 연결된 이후에 
     *             AI 서버와 연결이 해제 되었을 경우에 대한 화면 핸들링
     *************************************************************/
    function _connectionCloseHandle(){

        // 아래 로직에 대한 내용 설명은
        // AI.connect => _sendConnectInfo 의 주석 참조
        let bIsDisconnMsgShow = true;
        if(CLIENT && CLIENT.bIsDisconnMsgShow === false){
            bIsDisconnMsgShow = false;
        }


        // 연결이 끊어졌을 경우 CLIENT 전역 객체 초기화
        CLIENT = undefined;

        let _oFrame = document.getElementById("ws_frame");
        if(!_oFrame){
            return;
        }

        let _oFrameWin = _oFrame?.contentWindow;
        if(!_oFrameWin){
            return;
        }

        if(!_oFrameWin?.sap){
            return;
        }

        if(typeof _oFrameWin?.oAPP?.common !== "undefined"){

            // 스위치 버튼 연결 해제 표시
            _oFrameWin.oAPP.common.fnSetModelProperty("/UAI/state", false);

        }        

        // let _oAI_Switch_Btn = _oFrameWin.sap.ui.getCore().byId("ws20_ai_con_btn");
        // if(!_oAI_Switch_Btn){
        //     return;
        // }

        // _oAI_Switch_Btn.setState(false);

        var _sMsg = "AI와 연결이 해제 되었습니다."; // [MSG]

        if(bIsDisconnMsgShow === true){
            setTimeout(function(){
                _oFrameWin.sap.m.MessageToast.show(_sMsg);
            },0);            
        }        

        // busy 끄고 Lock 풀기
        _oFrameWin.oAPP.common.fnSetBusyLock("");

    } // end of _connectionCloseHandle


/******************************************************************************
 *  💖 PUBLIC FUNCTION 선언부
 ******************************************************************************/


    /*************************************************************
     * @function - AI 서버가 이미 연결 되어있는 상태인지 확인
     *************************************************************/
    // AI.isconnected = function(){

    //     return new Promise(function(resolve){

    //         let _oClient = NET.createConnection(C_PIPE_NANE);

    //         /**************************************************
    //          * AI 서버에서 응답 받을 이벤트
    //          **************************************************/
    //         _oClient.on('data', function(data){

    //             console.log("isconnected - data", data);

    //             try {

    //                 var _oIF_DATA = JSON.parse(data.toString());

    //             } catch (error) {

    //                 console.error("isconnected - AI 응답 오류", error);

    //                 // AI 서버에서 잘못된 값을 던질 경우는
    //                 // 다시 AI 서버로 전송한다.
    //                 CLIENT.write(JSON.stringify({
    //                     RETCD: "E",
    //                     ERRCD: "E001" // 전송 데이터 포맷 오류
    //                 }));

    //                 return resolve({ RETCD: "E" });

    //             }

    //             if(typeof _oIF_DATA?.PRCCD === "undefined"){

    //                 console.error("isconnected - AI 응답 시 필수 필드 오류!", error);

    //                 // AI 서버에서 잘못된 값을 던질 경우는
    //                 // 다시 AI 서버로 전송한다.
    //                 CLIENT.write(JSON.stringify({
    //                     RETCD: "E",
    //                     ERRCD: "E002" // PRCCD 필수값 오류
    //                 }));

    //                 return resolve({ RETCD: "E" });

    //             }

    //             return resolve(_oIF_DATA);

    //         });

    //         /*******************************************************
    //          * AI 서버가 실행되어 있지 않을 경우 바로 여기가 호출됨.
    //          *******************************************************/
    //         _oClient.on('error', function(oError){

    //             console.log("isconnected - error", oError);

    //             return resolve({ RETCD: "E" });

    //         });

    //         let _oPARAM = {
    //             PRCCD: "ISCONNECT"
    //         }

    //         _oClient.write(JSON.stringify(_oPARAM));

    //     });


    // }; // end of AI.isconnected


    /*************************************************************
     * @function - AI 서버 연결
     *************************************************************/
    AI.connect = function(oPARAM){

        return new Promise(async (resolve) => {
            
            // 필수 파라미터 오류인 경우는 크리티컬 오류를 발생시킨다.
            if(typeof oPARAM !== "object" || !oPARAM?.CONID){
                
                let _sErrMsg = "[critical error!!] AI.connect 수행 시, 필수 파라미터 누락!!";

                throw new Error(_sErrMsg);

            }        

            CLIENT = NET.createConnection(C_PIPE_NANE, function(e){
                
                // 서버와 연결이 가능한 상태일 경우

                // 연결 요청 정보 전달
                oPARAM.PRCCD = "CONNECT";

                // console.log("AI", 'Connected to server.', arguments);            

                _sendConnectInfo(oPARAM, function(oResult){                    
                    
                    // 연결 시도하다가 다른 서버에서 이미 연결이 되어있는 상태일 경우
                    // AI 서버에서 client end를 하는데..
                    // 그러면 3.0의 client의 end 이벤트도 연결 끊었을 때 이벤트를 호출 하여
                    // 그 이벤트에서 연결 해제 메시지 출력을 할지 말지 정하는 플래그를 설정함.
                    if(oResult.PRCCD === "CONNECT" && 
                       oResult.ERRCD === "AIE04" /* AIE04: AI와 이미 연결된 상태라는 의미의 코드 */){
                        CLIENT.bIsDisconnMsgShow = false;
                    }                    

                    return resolve(oResult);

                });                
                
            });


            /*********************************************************************
             * AI 서버에서 보낸 데이터를 수신받는 이벤트
             *********************************************************************
            * - WS30에서 요청 후 수신 받아야할 상황일 경우,
            *   수신받다가 오류 발생하면 오류 내용을 AI에 다시 전달하고,
            *   WS30에서는 응답을 못받게 되어 일정시간 지난 뒤 응답 없음 오류를 발생시킴         
            *********************************************************************/        
            CLIENT.on('data', function(data){
       
                try {

                    let _sData = data.toString();

                    var _oIF_DATA = JSON.parse(_sData);

                } catch (error) {
              
                    // AI 서버에서 잘못된 값을 던질 경우는
                    // 다시 AI 서버로 전송한다.
                    CLIENT.write(JSON.stringify({
                        RETCD: "E",
                        ERRCD: "E001" // 전송 데이터 포맷 오류
                    }));

                    return;         

                }    

                if(typeof _oIF_DATA?.PRCCD === "undefined"){

                    // AI 서버에서 잘못된 값을 던질 경우는
                    // 다시 AI 서버로 전송한다.
                    CLIENT.write(JSON.stringify({
                        RETCD: "E",
                        ERRCD: "E002" // PRCCD 필수값 오류
                    }));

                    return;
            
                }

                let oCustom = new CustomEvent(`ai-${_oIF_DATA.PRCCD}`, { detail: _oIF_DATA });

                oAI_IF_DOM.dispatchEvent(oCustom);
            
            });
      

            /*********************************************************************
             * AI 서버가 실행되어 있지 않을 경우 바로 여기가 호출됨.
             *********************************************************************/
            CLIENT.on('error', function(oError){

                return resolve({
                    RETCD: "E",
                    ERRCD: "E003" // AI 서버가 실행되지 않았을 경우
                });

            });


            // CLIENT.on('end', function(oEvent){

            //     // console.log("error", oEvent);
            //     // console.log("2");
            //     // 연결 이후 AI 서버가 끊어졌을 경우에 대한 UI 핸들링                
            //     _connectionCloseHandle();

            // });


        });


    }; // end of AI.connect


    function attachEndEvent (){

        if(typeof CLIENT === "undefined"){
            return;
        }

        CLIENT.on('end', function(oEvent){

            // 연결 이후 AI 서버가 끊어졌을 경우에 대한 UI 핸들링                
            _connectionCloseHandle();

        });

    }


    /*************************************************************
     * @function - AI 서버 연결 해제
     *************************************************************/
    AI.disconnect = function(oPARAM){

        //1. 연결 버튼 활성.. 
        // 내 화면 부터 연결 버튼 활성
        //2.현재 떠있는 브라우저에 전체 전송해서 연결 버튼 활성 등....

        return new Promise(function(resolve){

            oPARAM.PRCCD = "DISCONNECT";

            // 연결된 상태가 아닐 경우
            if(typeof CLIENT === "undefined"){
                return resolve({ RETCD: "E", ERRCD: "E005" });
            }

            // AI 서버에 요청 수행 타임아웃 변수 초기화
            if(AI.iDisconTimeout){
                clearTimeout(AI.iDisconTimeout);
                delete AI.iDisconTimeout;
            }

            // 커스텀 이벤트 명
            let _sEventName = `ai-${oPARAM.PRCCD}`;

            // 커스텀 이벤트 콜백
            let _fCallback = function(oEvent){

                // AI 서버에 요청 수행 타임아웃 변수 초기화
                if(AI.iDisconTimeout){
                    clearTimeout(AI.iDisconTimeout);
                    delete AI.iDisconTimeout;
                }

                // 커스텀 이벤트 지우기
                oAI_IF_DOM.removeEventListener(_sEventName, _fCallback);

                // AI 서버에서 전달받은 데이터
                let _oIF_DATA = oEvent.detail;

                CLIENT = undefined;

                return resolve(_oIF_DATA);

            };

            oAI_IF_DOM.addEventListener(_sEventName, _fCallback);

            // 연결 정보 전달
            CLIENT.write(JSON.stringify(oPARAM));

            // AI 서버에 요청 수행 후 응답 대기
            AI.iDisconTimeout = setTimeout(function(){

                // 응답이 없습니다 연결 실패!!

                // AI 서버에 요청 수행 타임아웃 변수 초기화
                if(AI.iDisconTimeout){
                    clearTimeout(AI.iDisconTimeout);
                    delete AI.iDisconTimeout;
                }

                // 커스텀 이벤트 지우기
                oAI_IF_DOM.removeEventListener(_sEventName, _fCallback);

                return resolve({
                    RETCD: "E",
                    ERRCD: "E004" // 응답 없음 오류!!
                });

            }, C_AI_CB_WAIT_TIME);

        });

    }; // end of AI.disconnect



module.exports = AI;