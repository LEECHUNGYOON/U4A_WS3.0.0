/****************************************************************************
 * 🔥 Global Variables
 ****************************************************************************/
    const NET = require("net");   

    const TY_RES = {
        PRCCD: "",      // 수행중인 프로세스 코드
        ACTCD: "",      // 수행중인 행위에 대한 코드
        RETCD: "",      // 수행 결과에 대한 코드
        STCOD: "",      // 수행 결과에 대한 상태 코드    
        RTMSG: "",      // 수행 결과에 대한 메시지 
        RDATA: "",      // 수행 결과에 대한 데이터
    };

    // 서버 파이프 명
    var PIPENAME = '\\\\.\\pipe\\u4aws\\serverlist';

    var oAPP = {};

    oAPP.REMOTE = require('@electron/remote');
    oAPP.APP = oAPP.REMOTE.app;
    oAPP.APPPATH = oAPP.APP.getAppPath();
    oAPP.PATH = require("path");


    // EDU 프로그램과의 인터페이스간, 프로세스별 동작에 대한 로직이 있는 모듈js 경로
    oAPP.PRC_MOD_PATH = oAPP.PATH.join(__dirname, "PRC_MODULES");

    // EDU 프로그램과의 인터페이스간, 오류 발생에 대한 로직이 있는 모듈js 경로
    oAPP.ERR_MOD_PATH = oAPP.PATH.join(oAPP.PRC_MOD_PATH, "ERROR", "index.js");


    // 패키지가 아닐 경우에는 파이프명을 개발 이름으로 올린다.
    if(!oAPP.APP.isPackaged){

        PIPENAME += "_dev";

    }

/****************************************************************************
 * 🔥 Private functions
 ****************************************************************************/






/****************************************************************************
 * 🔥 Public functions
 ****************************************************************************/

    oAPP.createServer = function(){

        return new Promise(function(resolve){
            
            var oServer = NET.createServer((oStream, a) => {

                zconsole.log("Server", 'Client connected.');
    
                // 응답 구조 복사
                let _oRES = JSON.parse(JSON.stringify(TY_RES));
    

                /******************************************************
                 * ⚡[Server] 요청 데이터 수신 이벤트
                 ******************************************************/
                oStream.on('data', function (data){
                    
                    // 요청 데이터 JSON 파싱
                    try {

                        var _oIF_DATA = JSON.parse(data.toString());

                        zconsole.log("DATA", _oIF_DATA);

                    } catch (oError) {

                        let sConsoleErr  = `- [code]: E001\n`;
                            sConsoleErr += `- [path]: www/ServerList_v2/modules/Server/net/index.js => oAPP.createServer => oStream.on('data')\n`;          
                            sConsoleErr += `- [desc]: 요청 데이터 JSON 파싱 오류`;

                        zconsole.error(sConsoleErr, oError);
                        console.trace();

                        // 오류 리턴
                        _oRES.RETCD = "E";
                        _oRES.STCOD = "E001"; // 잘못된 요청 데이터 (JSON 포맷이 아닐때)
                    
                        // 오류 모듈 실행
                        require(oAPP.ERR_MOD_PATH)(oStream, _oRES);

                        return;
                    }


                    // 요청 데이터의 PRCCD 코드별 호출 분기
                    try {

                        // PRC_MODULES 폴더를 ROOT로 해서 하위 PRC별 프로세스 수행
                        // 예: PRCCD : "/SEND" or "SEND" ===> "www/PRC_MODULES/[SEND]/index.js" 모듈 실행
                        let _sModulePath = oAPP.PATH.join(oAPP.PRC_MOD_PATH, _oIF_DATA.PRCCD, "index.js");
                        
                        require(_sModulePath)(oStream, _oIF_DATA);

                    } catch (oError) {

                        let sConsoleErr  = `- [code]: E002\n`;
                            sConsoleErr += `- [path]: www/ServerList_v2/modules/Server/net/index.js => oAPP.createServer => oStream.on('data')\n`;          
                            sConsoleErr += `- [desc]: 지원하지 않는 PRCCD`;

                        zconsole.error(sConsoleErr, oError);
                        console.trace();
                        
                        _oRES.RETCD = "E";
                        _oRES.STCOD = "E002"; // 잘못된 경로 호출

                        // 오류 모듈 실행
                        require(oAPP.ERR_MOD_PATH)(oStream, _oRES);

                    }

    
                }); // end of oStream 'data' Event
    
    
                /*****************************************************************
                 * ⚡[Server] 클라이언트와 연결이 끊어졌을 경우 호출되는 이벤트
                 ****************************************************************/
                oStream.on('end', function (data){
                    
                    zconsole.log("stream end", data);
    
                    // // 연결 해제 되었다는 About 실행
                    // if(oAPP.DISCON_ABORT){
                    //     oAPP.DISCON_ABORT.abort();
                    // }                              
    
                    // // 연결이 종료된 oStream 객체가 기존에 연결되어 있는 객체라면
                    // // 글로벌 변수에 있는 스트림 객체를 삭제한다.
                    // if(oStream.CONID){
    
                    //     delete oAPP.oStream;
                        
                    //     // // [async] 연결 종료시 초기화 작업
                    //     // oAPP.fn.onDisconnectAI();
                        
                    // }
                    
    
                });
    
    
                /*****************************************************************
                 * ⚡[Server] 클라이언트와 연결이 끊어졌을 경우 
                 *    end 이벤트 이후에 호출됨.
                 ****************************************************************/
                oStream.on("close", function(oEvent){
    
                    // // 화면 출력용 -------------
                    // document.getElementById("CONCNT").innerText = oAPP.oServer._connections;
                    // // 화면 출력용 -------------
    
                });
    
                /******************************************************
                 * ⚡ [Server] 요청 Stream에 대한 오류 이벤트
                 *    
                 * - 테스트 해서 발견된 여기 타는 케이스
                 * 
                 * 1. 이미 클라이언트에서 end 처리 했는데
                 *    서버에서 클라이언트로 write 또는 end 할 경우
                 ******************************************************/
                oStream.on('error', function(oError){

                    let sConsoleErr = `www/ServerList_v2/modules/Server/u4aedu/index.js => createServer => oStream.on('error')`;
                    
                    zconsole.error(sConsoleErr, oError);
    
                }); // end of oStream 'error' Event
         
            });
    
    
            /******************************************************
             * ⚡ [Server] 서버 오류에 대한 이벤트
             * 
             * - 테스트 해서 발견된 여기 타는 케이스
             * 
             * 1. 이미 올린 서버를 또 올렸을 때
             * 
             ******************************************************/
            oServer.on('error', function(err){   
                
                
    
    
            });
            
            oServer.listen(PIPENAME, () => {

                zconsole.log("U4A Net Server(ServerList) Listen on", `${PIPENAME}`);

                resolve(oServer);
        
            });

            oAPP.oServer = oServer;
            

        });

    }; // end of oAPP.createServer



    module.exports = oAPP;