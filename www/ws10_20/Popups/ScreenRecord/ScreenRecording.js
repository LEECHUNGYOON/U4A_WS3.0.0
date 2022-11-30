/* ================================================================= */
// 설치 npm 
// npm install mime-types
/* ================================================================= */


/* ================================================================= */
// 사용 예시
/* 
    var ret = require(oAPP.path.join(__dirname, 'ScreenRecord/ScreenRecording.js'));
        ret.start(oAPP.remote,"테마 명");
                       
*/
/* ================================================================= */

//WS3.0 로드된 테마명
let LOAD_THEME = ""; // sap_belize_plus, sap_horizon_dark


let oAPP = {};

oAPP.ipcRenderer = require('electron').ipcRenderer;

let oScreenWindow,
    oScreenMulti;

/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */


//모니터(screen) 정보 추출 
async function _getMonitorScrInfo(REMOTE){
    return new Promise(async (RES, REJ) => {

        var desktopCapturer = REMOTE.require('electron').desktopCapturer;
            desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {

                var T_INFO = [];

                //screen count
                for (let i = 0; i < sources.length; i++) {
                    var source = sources[i];
                    T_INFO.push({ "SOURCE_ID":source.id, "DISPLAY_ID":source.display_id });

                }

                RES(T_INFO); 

            });

    });
}


//멀티 모니터 여부 점검
async function _chk_MultiScr(REMOTE){
    return new Promise(async (RES, REJ) => {

        // 이미 실행되어 있는 Screen Record 창이 있을 경우 빠져나감
        if(oScreenWindow && oScreenWindow.focus){
            
            // 작업표시줄 깜빡임
            oScreenWindow.flashFrame(true);

            oScreenWindow.focus();            

            RES({RETCD:"E", RTMSG:"", PRCCD:""});
            
            return;

        }

        let SCREEN_INFO = {};

        //모니터(screen) 갯수 추출
        var T_INFO = await _getMonitorScrInfo(REMOTE);

        //모니터 스크린정보가 없다면 치명적인 오류!!
        if( T_INFO.length == 0 ){ RES({RETCD:"E", RTMSG:"", PRCCD:""}); return; }

        //멀티 모니터가 아닐 경우 
        if( T_INFO.length == 1 ){ 

            SCREEN_INFO.SCREEN_ID  = T_INFO[0].SOURCE_ID;  //모니터 스크린 ID 
            SCREEN_INFO.DISPLAY_ID = T_INFO[0].DISPLAY_ID; //모니터 스크린 내부 Code

            RES({RETCD:"S", RTMSG:"", PRCCD:"01", SELECT_SCR: SCREEN_INFO });

            return; 

        }

        var Lwidth = 300 * T_INFO.length;

        //멀티 모니터 일 경우는 
        //모니터(screen) 선택 팝업호출 
        var op = {
            "height": 300,
            "width": Lwidth,
            "resizable": false,
            "fullscreenable": true,
            "alwaysOnTop":true,
            "maximizable": false,
            "minimizable": false,
            "show":false,
            "modal":true,
            "parent": REMOTE.getCurrentWindow(),

            "webPreferences":{
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule":true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
                "DISPNM" : "MULTIPOPUP"
            }        

        };

        var oWIN = new REMOTE.BrowserWindow(op);
        oWIN.setMenuBarVisibility(false);    

        //WS3.0 로드된 테마별에 따른 윈도우 백그라운드 컬러 정의 
        switch (LOAD_THEME) {
            case "sap_horizon_dark":
                oWIN.setBackgroundColor('#12171c');
                break;

            case "sap_belize_plus":
                oWIN.setBackgroundColor('#fafafa');
                break;
        
            default:
                break;
        }

        //모니터(Screen) 선택시 대한 이벤트 설정
        function onIPC_SELECT(event, data){
            oAPP.ipcRenderer.removeListener('IF-chkScrList-SELECT', onIPC_SELECT);
            SCREEN_INFO = data;
        }
        oAPP.ipcRenderer.on('IF-chkScrList-SELECT', onIPC_SELECT);
        
        var url = `file://${__dirname}/ScrList.html`;
        oWIN.loadURL(url);
        oWIN.webContents.on('did-finish-load', function () {
            oWIN.show();

            // //개발모드일 경우만 .. 콘솔창 수행
            // if(!REMOTE.app.isPackaged){
            //     oWIN.webContents.openDevTools();
            // }   

            //전송 값 구성 
            var opt = {"LOAD_THEME": LOAD_THEME };

            oWIN.webContents.send('IF-chkScrList', opt);

        });

        //종료 이벤트
        oWIN.on("close", (e)=>{

            //모니터(screen) 선택정보 누락이라면 
            if(typeof SCREEN_INFO.SCREEN_ID === "undefined"){  
                RES({RETCD:"S", RTMSG:"", PRCCD:"03"}); 
                return; 
            }

            RES({RETCD:"S", RTMSG:"", PRCCD:"02", SELECT_SCR: SCREEN_INFO });           

        });

        REMOTE.require('@electron/remote/main').enable(oWIN.webContents);


    });
}

/* ================================================================= */
/* Export Module Function - 스크린 레코딩 시작
/* ================================================================= */
exports.start = async function(REMOTE, P_THEME = "sap_horizon_dark"){

    //WS3.0 로드된 테마명
    LOAD_THEME = P_THEME;
    
    //멀티 스크린 점검
    let sINFO = await _chk_MultiScr(REMOTE);
    
    if(sINFO.RETCD === "E"){  return; }

    //멀티 모니터 선택 화면에서 취소를 선택했다면..
    if(sINFO.PRCCD === "03"){ return; }   

    //예외처리: 한번 실행점검 

        //동영상 처리수행할 윈도우를 모니터(디스플레이) 위치로 이동 
        const electron = REMOTE.require('electron');
        let displays = electron.screen.getAllDisplays();

       //선택 디스플레이 찾기 
        let selDisp = displays.filter(e =>e.id == sINFO.SELECT_SCR.DISPLAY_ID);

        //pc에 입장에 메인 모니터 찾기
        let mainDisp = displays.filter(e =>e.internal == true); 

        //주모니터 정보를 찾지못햇다면 
        if(mainDisp.length == 0){
            var dispInfo = {};
            dispInfo.bounds        = {};
            dispInfo.bounds.x      = selDisp[0].bounds.x;
            dispInfo.bounds.y      = selDisp[0].bounds.y;
            dispInfo.bounds.height = selDisp[0].bounds.height;
            dispInfo.bounds.width  = selDisp[0].bounds.width;
            dispInfo.scaleFactor   = selDisp[0].scaleFactor;
            mainDisp.push(dispInfo);
        }
       

        var op = {
            "x":mainDisp[0].bounds.x,
            "y":mainDisp[0].bounds.y,
            "height": mainDisp[0].bounds.height,
            "width":  mainDisp[0].bounds.width,
            "resizable": true,
            "fullscreenable": true,
            "alwaysOnTop":true,
            "maximizable": false,
            "minimizable": false,
            "show":false,
            "transparent": true,
            "frame": false,
            "parent": REMOTE.getCurrentWindow(),
            "webPreferences":{
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule":true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
                "DISPNM" : "VIDEOSCREEN",
                "OBJTY" : "VIDEOREC",
            }              

        };

        //부모 디비깅 창 임시 닫기
        //REMOTE.getCurrentWindow().closeDevTools();

        var oWIN = new REMOTE.BrowserWindow(op);
        oWIN.setMenuBarVisibility(false);
        
        // 현재 창을 잠시 글로벌에 둔다.
        oScreenWindow = oWIN;

        var url = `file://${__dirname}/index.html`;
        oWIN.loadURL(url);
      
	    oWIN.webContents.on('did-finish-load', function () {

            setTimeout(() => {
                
                var sBoundInfo = oWIN.getBounds();

                sBoundInfo.x = selDisp[0].bounds.x;
                sBoundInfo.y = selDisp[0].bounds.y;
    
                sBoundInfo.height = selDisp[0].bounds.height - 10;
                sBoundInfo.width  = selDisp[0].bounds.width;

                //사용자 선택 모니터 비율이 100% 인경우 
                if(selDisp[0].scaleFactor == 1){

                    //주모니터 비율이 100% 경우
                    if(mainDisp[0].scaleFactor == 1){
                        oWIN.setBounds(sBoundInfo);
                    }else{
                    //주모니터 비율이 100% 아닌 경우 
                        oWIN.setBounds(sBoundInfo);
                        oWIN.setBounds(sBoundInfo);
                    }

                }else{
                    //사용자 선택 모니터 비율이 100% 아닌 경우  
                    oWIN.setBounds(sBoundInfo);
                    oWIN.setBounds(sBoundInfo);

                }

                setTimeout(() => {
                    
                    oParams = {
                        "SCREEN_ID": sINFO.SELECT_SCR.SCREEN_ID,
                        "SCREEN_DISPLAY_ID": sINFO.SELECT_SCR.DISPLAY_ID
                      };

                    oWIN.webContents.send('IF-REC-READY', oParams);

                }, 100);

            }, 100);

            oWIN.show();
            
            //oWIN.webContents.openDevTools();

        });

        oWIN.on("close", ()=>{
            //debugger;

            // 글로벌 변수 초기화
            oScreenWindow = null;

        });

        REMOTE.require('@electron/remote/main').enable(oWIN.webContents);


};



