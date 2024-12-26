/* ================================================================= */
// 설치 npm 
// npm install electron-log
/* ================================================================= */


/* ================================================================= */
// 사용 예시 
/* var ret = require(oAPP.path.join(__dirname, 'js/ws_log.js'));
    
    1. 시작 펑션 수행  
       ret.start(oAPP.remote, console);
       파라메터 console <<= 로그추출을 원하는 위치에 윈도우 console 객체를 던진다
       만일 iframe 안에 console 에 대해서 처리 할 경우도 
       해당 iframe 안에 frame.window.console 객체를 던짐 
       예) ret.start(oAPP.remote, document.querySelector("iframe").contentWindow.console);  
         
    2. 로그 폴더 제어 
    2.1 await ret.openLOG(false); <= 오늘날짜에 로그파일을 실행함 
    2.2 await ret.openLOG(true);  <= 로그 폴더를 open 함


    3. 펑션에 리턴 구조 
      RETCD : "S" / "E"
      RTMSG : ""
      
*/ 
/* ================================================================= */



/* ================================================================= */
/* 내부 전역 변수 
/* ================================================================= */
let PATH = undefined;
let FS   = undefined;
let REMOTE = undefined;
let APP = undefined;
let RESOLVE_FOLD = "";  //log 파일 폴더 
let RESOLVE_PATH = "";  //log 파일 저장위치

/* ================================================================= */
/* 내부 전역 펑션
/* ================================================================= */

/*[펑션] 랜덤키 생성  */
function _random(length = 8){

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
  
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return str;

}

/*[펑션] 현재 일자  */
function _getDate(){

    //오늘 일자 
    let today = new Date();
    let year = today.getFullYear();   // 년도
    let month = today.getMonth() + 1; // 월
    let date = today.getDate();       // 날짜

    //문자열로 변경 
    year  = year.toString();
    month = month.toString();
    date  = date.toString();
    date  = date.padStart(2, '0'); // 0붙이기
    
    return year + "_" + month + "_" + date;

}


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */

/* Main procces */
exports.start = async function(REMOTE_OBJ, CONSOLE){
   
    let log = require('electron-log');

    if(typeof REMOTE === "undefined"){
        REMOTE = REMOTE_OBJ;
        APP = REMOTE.app;
    }

    if(typeof PATH === "undefined"){
        PATH = REMOTE.require('path');
    }

    if(typeof FS === "undefined"){
        FS = REMOTE.require('fs');
    }

    //출력 포멧 
    log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
    log.transports.console.level  = 'error';
    
    //로그 저장위치 경로 
    if((typeof RESOLVE_PATH === "undefined") || RESOLVE_PATH === ""){
        
        RESOLVE_FOLD = PATH.join(process.env.APPDATA, REMOTE.app.getName());
        if(!FS.existsSync(RESOLVE_FOLD)){
            FS.mkdirSync(RESOLVE_FOLD);
        }

        RESOLVE_FOLD = PATH.join(RESOLVE_FOLD, "logs");
        if(!FS.existsSync(RESOLVE_FOLD)){
            FS.mkdirSync(RESOLVE_FOLD);
        }

        var fileName = "U4A_WS_" + _getDate() + ".log";
        RESOLVE_PATH = PATH.join(RESOLVE_FOLD, fileName);

        //RESOLVE_PATH = log.transports.file.getFile().path;

    }


    //로그파일 저장위치 설정
    log.transports.file.resolvePath = () => RESOLVE_PATH;

    // 빌드일 경우에만 console 기능을 electron log에 할당한다.
    if(APP && APP.isPackaged){
        
        //window console 기능을 => electron log 할당
        Object.assign(CONSOLE, log.functions);

    }

    // //window console 기능을 => electron log 할당
    // Object.assign(CONSOLE, log.functions);


    return {RETCD:"S", RTMSG:""};
    
};


/* Log 저장위치 경로 추출 */
/*
exports.getFilePath = function(){
    return RESOLVE_PATH;

};
*/

/* Log 파일 or 폴더 실행 */
exports.openLOG = async function(ISFLD = false){

    if(typeof REMOTE === "undefined"){ return {RETCD:"E", RTMSG:"log 파일 없슴!!"}; }
    if(typeof FS === "undefined"){ return {RETCD:"E", RTMSG:"log 파일 없슴!!"}; }
    if(RESOLVE_FOLD === ""){ return {RETCD:"E", RTMSG:"log 폴더 없슴!!"}; }
    if(RESOLVE_PATH === ""){ return {RETCD:"E", RTMSG:"log 파일 없슴!!"}; }

    if(ISFLD){

        //폴더 미존재시 
        if(!FS.existsSync(RESOLVE_FOLD)){
            return {RETCD:"E", RTMSG:"U4A 로그폴더가 존재하지않습니다"};
        }

        //REMOTE.shell.showItemInFolder(RESOLVE_FOLD);
        REMOTE.shell.openPath(RESOLVE_FOLD);
        return {RETCD:"S", RTMSG:""};
   
    }
    

    async function _readFile(){
        return new Promise(async (res, rej) => {

            FS.readFile(RESOLVE_PATH, 'utf8', function (err,data) {
                if (err) {
                    res({RETCD:"E", RTMSG:"U4A 로그파일이 존재하지않습니다"});
                    return;
                }

                //로그 파일 열기 
                REMOTE.shell.openPath(RESOLVE_PATH);
                res({RETCD:"S", RTMSG:""});
           
            });

        });
    }

    return await _readFile();
    
    //REMOTE.shell.showItemInFolder(RESOLVE_PATH);

};



