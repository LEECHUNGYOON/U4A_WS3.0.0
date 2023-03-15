// I/F 필드 정의 
/* ***************************************************************** */
/*
*/
/* ***************************************************************** */
/* ***************************************************************** */

/* 
    설치 nodejs 
    npm gh-release-assets 
    npm adm-zip
    npm arraybuffer-to-buffer

*/

/* 사용 예시 

  var spAutoUpdater = require(oAPP.path.join(__dirname, 'SupportPackageChecker/index.js'));
    
      spAutoUpdater.on("checking-for-update-SP", (e)=>{ console.log("업데이트 확인중"); debugger; });
   
      spAutoUpdater.on("update-available-SP", (e)=>{ console.log("업데이트 항목이 존재합니다"); debugger; });
   
      spAutoUpdater.on("update-not-available-SP", (e)=>{ console.log("현재 최신버전입니다."); debugger; });
   
      spAutoUpdater.on("download-progress-SP", (e)=>{

                   CDN 인 경우                    
                   팝업인데 ......

                  CDN 아닌경우 
                  e.detail.file_info.TOTAL  <-- 모수 
                  e.detail.file_info.TRANSFERRED <-- 현재 진행중 갯수 
 
                   console.log("다운로드중");  
      });
      
      spAutoUpdater.on("update-downloaded-SP", (e)=>{  

        //app 재실행 
        //debugger; 
      });
   
      spAutoUpdater.on("update-error-SP", (e)=>{ console.log("오류 " + e.detail.message);  debugger; });
      
      파라메터 설명 
      1. electron remote
      2. CDN  = true; SAP  = false;
      3. WS.30 현재 버젼 
      4. WS.30 현재 패치 번호
    
      spAutoUpdater.checkForUpdates(oAPP.remote, false, "v3.3.6", "00003");

*/

/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */
let REMOTE = undefined;
let FS     = undefined;
let PATH   = undefined;
let ISCDN  = false;
let VERSN  = ""; //현재 빌드된 WS3.0 버젼 
let SPLEV  = 0;  //현재 WS3.0 패치 번호
let ADMIN  = {};
let Octokit = undefined;
let ADMZIP  = undefined;


const GS_MSG = {
    M01 : "처리 통신 오류",
    M02 : "다운로드 처리 과정에서 해더 정보 누락되었습니다",
    M03 : "(패치) 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.",
    M04 : "(패치) 분할 다운로드 처리 과정에서 오류 발생",
    M05 : "처리 완료",
    M06 : "버젼 파일 생성중 오류 발생",
    M07 : "패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다",
    M08 : "WS 빌드버전 과 업데이트 패치에 등록되있는 WS 빌드버전이 상이 합니다  \n 관리자에게 문의하세요",
    M09 : "다운로드중",
    M10 : "패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요",
    M11 : "(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!",
    M12 : "(패치) GIT 다운로드 파일이 존재하지않습니다", 
    M13 : "GIT (app.zip) 패치 파일 추출하는동안 오류 발생 \n 관리자에게 문의!!",
    M14 : "GIT (node_modules.zip) 패치 파일 추출하는동안 오류 발생 \n 관리자에게 문의!!",
    M15 : "(패치) 업데이트 확인중",
    M16 : "(패치) 현재 최신버전입니다.",
    M17 : "(패치) 업데이트 항목이 존재합니다",
    M18 : "(패치) 업데이트가 완료되었습니다.",
    M19 : "(패치) 업데이트 설치중",
    M20 : "app.asar 소스 압축해제 하는 과정에서 오류가 발생하였습니다",
    M21 : "app.asar 소스 압축 하는 과정에서 오류가 발생하였습니다"
    
};



/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

//[펑션] 랜덤키 생성
function fn_random(length = 15){

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';

    for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

}

//[펑션] 기다려 
async function gf_waiting(t = 0){
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, t);
    });
}


//[펑션] 초기값 설정
function gf_initData(oLoginInfo){

        debugger;

		let oSettings = getSettingsInfo(),
            oGitInfo = oSettings.GITHUB,
            sGitAuth =  atob(oGitInfo.devKey),
            sPatch_repo_url = oGitInfo.PATCH_REPO_URL,
            sServerHost = getHost();
			
        Octokit = REMOTE.require("@octokit/core").Octokit;

        ADMIN.PATCH_SEP = "💛";

        //sap config
        ADMIN.SAP = {};
        //ADMIN.SAP.ID   = "shhong";
        //ADMIN.SAP.PW   = "2wsxzaq1!";
        ADMIN.SAP.HOST = sServerHost;      
        ADMIN.SAP.URL  = ADMIN.SAP.HOST + "/zu4a_wbc/u4a_ipcmain/WS_SUPPORT_PATCH";

        if(REMOTE.app.isPackaged){
            //ADMIN.SAP.ID  = "U4AIDE";
            //ADMIN.SAP.PW  = "$u4aRnd$";
         
        }

        ADMIN.SAP.ID   = "";
        ADMIN.SAP.PW   = "";

        ADMIN.GIT = {};

        if(REMOTE.app.isPackaged){
            ADMIN.GIT.AUTH       = sGitAuth;
            ADMIN.GIT.BASE_PATH  = sPatch_repo_url;    
        }

}


//[펑션] (SAP) 패치 존재여부 점검 
async function gf_chkPatch_SAP(){
    return new Promise((resolve, rej) => {

        //패치 확인
        let oformData = new FormData();

        if(!REMOTE.app.isPackaged){
            oformData.append('sap-user', ADMIN.SAP.ID);
            oformData.append('sap-password', ADMIN.SAP.PW);
        }

        oformData.append('PRCCD', '01');        

        var xhttp = new XMLHttpRequest();
        xhttp.onload  = (e)=>{ 

            if(e.target.status != 200 || e.target.response === ""){
                resolve({RETCD:"E",RTMSG:GS_MSG.M07}); //패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다
                return;
            }

            try {
                var LS_DATA = JSON.parse(e.target.response);
            } catch (err) {
                resolve({RETCD:"E",RTMSG:GS_MSG.M07}); //패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다
                return;
                
            }

            if(LS_DATA.RETCD === "E"){
                resolve({RETCD:"E",RTMSG:LS_DATA.RTMSG});
                return;
            }

            //WS3.0 버젼
            if(LS_DATA.VERSN != VERSN){
                resolve({RETCD:"E",RTMSG:GS_MSG.M08}); //WS 빌드버전 과 업데이트 패치에 등록되있는 WS 빌드버전이 상이 합니다  \n 관리자에게 문의하세요
                return;

            }

            if(Number(LS_DATA.SPLEV) > SPLEV){
                resolve({ RETCD:"S", ISPATCH:true, RTMSG:"패치 존재",S_INFO:LS_DATA });
                return;
    
            }
    
            resolve({RETCD:"S", ISPATCH:false, RTMSG:"패치 미존재"});

        };

        xhttp.onerror = (e)=>{ 
            resolve({RETCD:"E",RTMSG:GS_MSG.M07}); //패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다

        };  

        xhttp.open("POST", ADMIN.SAP.URL, true);
        xhttp.send(oformData);
        

    });
}


//[펑션] (SAP) 패치 다운로드 
async function gf_download_SAP(PATCH){
    return new Promise( async(resolve, rej) => {
        
        var LV_RELKY = 0;

        var LS_FILE_INFO = {};
            LS_FILE_INFO.VERSN       = PATCH.S_INFO.VERSN;
            LS_FILE_INFO.SPLEV       = PATCH.S_INFO.SPLEV;
            LS_FILE_INFO.TOTAL       = PATCH.S_INFO.TOTAL;
            LS_FILE_INFO.TRANSFERRED = 0;
 
        //이벤트 트리거 - 다운로드중
        document.dispatchEvent(new CustomEvent('download-progress-SP', {detail: { message: GS_MSG.M09, file_info:LS_FILE_INFO } }));


        //(APP)다운로드 파일 경로 설정 
        var LV_TMP_DOWN_APP  = PATH.join(process.resourcesPath, "app.zip");

        //(NODE_MODULES)다운로드 파일 경로 설정 
        var LV_TMP_DOWN_NODE = PATH.join(process.resourcesPath, "node_modules.zip");       


        //[펑션] WS3.0 패치 분할(SP) Data 추출
        function Lfn_getdata_SP(){ 

            LV_RELKY = LV_RELKY + 1;
            var LV_RELKY_X = LV_RELKY.toString().padStart(10, '0');
            var LV_URL = ADMIN.SAP.URL + "?PRCCD=02" + "&RELID=SP" + "&RELKY=" + LV_RELKY_X;

            var xhttp = new XMLHttpRequest();
            xhttp.onerror   = (e)=>{ resolve({RETCD:"E", RTMSG:GS_MSG.M07});   }; //패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다
            xhttp.ontimeout = ()=> { resolve({RETCD:"E",  RTMSG:GS_MSG.M07 }); }; //패치 정보 추출시 SAP 서버 통신 실패!! \n 관리자 문의 \n 현재창 종료 합니다

            xhttp.onload    = async (e)=>{  

                var status = e.target.getResponseHeader("u4a_status");

                switch (status) {
                    case "ERR": //오류일 경우
                        
                        //(패치) 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({RETCD:"E",  RTMSG:GS_MSG.M03 });
                        break;


                    case "END": //추출 완료

                        //app.ZIP 파일 압축 해제
                        try {
                            var zip = new ADMZIP(LV_TMP_DOWN_APP);
                        } catch (err) {
                            resolve({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
                            return;
                        }

                        try {
                            zip.extractAllTo(process.resourcesPath, true);
                        } catch (err) {
                            resolve({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
                            return;
                        }

                        //app.zip 다운로드처리 전 이전 쓰레기 File 제거
                        try { FS.unlinkSync(LV_TMP_DOWN_APP); } catch (err) {}

                        //파일 분할KEY 초기값 설정 
                        LV_RELKY = 0;

                        //WS3.0 패치 분할(ND - node_modules) Data 추출
                        Lfn_getdata_ND();

                        break;

                    case "RUN": //추출 진행정 

                        LS_FILE_INFO.TRANSFERRED = LS_FILE_INFO.TRANSFERRED + 1;

                        //이벤트 트리거 - 다운로드중...
                        document.dispatchEvent(new CustomEvent('download-progress-SP', {detail: { message: GS_MSG.M09, file_info:LS_FILE_INFO } }));
                        
                        //파일 다운로드 (분할)
                        var LS_RET = await Lfn_download(e.target.response, LV_TMP_DOWN_APP);
                        if(LS_RET.RETCD === "E"){
                            resolve(LS_RET);
                            return;
                        }


                        //[재수행] 분할 Data 추출 
                        Lfn_getdata_SP();

                        break;

                    default: //오류로 간주

                        //"Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({RETCD:"E",  RTMSG:GS_MSG.M03 });
                        break;

                }


            };

            xhttp.open("GET", LV_URL, true);
            xhttp.withCredentials = true;
            xhttp.responseType    = 'arraybuffer';
            xhttp.send();

        } //Lfn_getdata_SP


        //[펑션] WS3.0 패치 분할(ND - node_modules) Data 추출
        function Lfn_getdata_ND(){ 

            LV_RELKY = LV_RELKY + 1;
            var LV_RELKY_X = LV_RELKY.toString().padStart(10, '0');
            var LV_URL = ADMIN.SAP.URL + "?PRCCD=02" + "&RELID=ND" + "&RELKY=" + LV_RELKY_X;

            var xhttp = new XMLHttpRequest();
            xhttp.onerror   = (e)=>{ resolve({RETCD:"E", RTMSG:GS_MSG.M01});   }; //통신오류
            xhttp.ontimeout = ()=> { resolve({RETCD:"E",  RTMSG:GS_MSG.M01 }); }; //통신오류
            xhttp.onload    = async (e)=>{  

                var status = e.target.getResponseHeader("u4a_status");

                switch (status) {
                    case "ERR": //오류일 경우
                        
                        //분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({RETCD:"E",  RTMSG:GS_MSG.M03 });
                        break;


                    case "END": //추출 완료

                        //node_modules.ZIP 파일 압축 해제
                        try {
                            var zip = new ADMZIP(LV_TMP_DOWN_NODE);
                        } catch (err) {
                            resolve({RETCD:"W", RTMSG:"압축 파일 미존재"});
                            return;
                        }

                        try {
                            zip.extractAllTo(process.resourcesPath, true);
                        } catch (err) {
                            resolve({RETCD:"E", RTMSG:"압축 파일 미존재"});
                            return;
                        }

                        //node_modules.zip 다운로드처리 전 이전 쓰레기 File 제거
                        try { FS.unlinkSync(LV_TMP_DOWN_NODE); } catch (err) {}


                        //정상처리 
                        resolve({RETCD:"S",  RTMSG:GS_MSG.M05 });
                 
                        break;

                    case "RUN": //추출 진행정 ..

                        LS_FILE_INFO.TRANSFERRED = LS_FILE_INFO.TRANSFERRED + 1;

                        //이벤트 트리거 - 다운로드중
                        document.dispatchEvent(new CustomEvent('download-progress-SP', {detail: { message: GS_MSG.M09, file_info:LS_FILE_INFO } }));
                        

                        var LS_RET = await Lfn_download(e.target.response, LV_TMP_DOWN_NODE);
                        if(LS_RET.RETCD === "E"){
                            resolve(LS_RET);
                            return;
                        }


                        //[재수행] 분할 Data 추출 
                        Lfn_getdata_ND();

                        break;

                    default: //오류로 간주

                        //(패치) 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({RETCD:"E",  RTMSG:GS_MSG.M03 });
                        break;

                }


            };

            xhttp.open("GET", LV_URL, true);
            xhttp.withCredentials = true;
            xhttp.responseType    = 'arraybuffer';
            xhttp.send();

        } //Lfn_getdata_ND


        //[펑션] 분할 다운로드
        async function Lfn_download(BIN, PATH){
            return new Promise( (resolve, reject) => {
                FS.appendFile(PATH, Buffer.from(BIN), function (err) {

                    if (err) {
                        //(패치) 분할 다운로드 처리 과정에서 오류 발생
                        resolve({RETCD:"E", RTMSG:GS_MSG.M04});
                        return;
                    }
                    
                    resolve({RETCD:"S", RTMSG:""});

                });

            });
        } //Lfn_download


        //WS3.0 패치 분할(SP) Data 추출
        Lfn_getdata_SP();

    });
}



//[펑션] (GIT) 패치 존재여부 점검 
async function gf_chkPatch_GIT(){
    return new Promise(async (res, rej) => {

        const octokit = new Octokit({ auth:ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.GIT.BASE_PATH + '/releases/latest', {});

        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M11}); //(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!
            return;
            
        }

        if(ROOT.data.assets.length == 0 ){
            resolve({RETCD:"W", RTMSG:"GIT 이전 패치정보 없슴!!"});
            return;
        } 


        //패치번호 추출 => WS3.0 버젼 + 💛 + 00001 구성된상태
        var LT_PATCH = ROOT.data.tag_name.split(ADMIN.PATCH_SEP);


        //현재 WS3.0 빌드 버젼과 업데이트 패치에 등록된 WS3.0 버젼이 다르다면 치명적 오류 !!!
        if(LT_PATCH[0] !== VERSN){
            res({RETCD:"E", RTMSG:GS_MSG.M08}); //WS 빌드버전 과 업데이트 패치에 등록되있는 WS 빌드버전이 상이 합니다  \n 관리자에게 문의하세요
            return;

        }


        //패치 여부 점검 
        if(Number(LT_PATCH[1]) > SPLEV){
            res({RETCD:"S", ISPATCH:true, RTMSG:"패치 존재"});
            return;

        }

        res({RETCD:"S", ISPATCH:false, RTMSG:"패치 미존재"});

    
    });
}


//[펑션] (GIT) 패치 다운로드
async function gf_download_GIT(){
    return new Promise(async (res, rej) => {

        const octokit = new Octokit({ auth:ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.GIT.BASE_PATH + '/releases/latest', {});

        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M11}); //(패치) \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!
            return;
            
        }

  
        //이벤트 트리거 - 다운로드중..
        document.dispatchEvent(new CustomEvent('download-progress-SP', {detail: { message: GS_MSG.M09, file_info:ROOT.data.assets } })); 


        /* ========================================================================= */
        //1. app.zip 파일 =========================================================== */
        /* ========================================================================= */
        var LT_FILTER = ROOT.data.assets.filter(e=> e.name === "app.zip");

        //app.zip 다운로드 파일 누락이라면..
        if(LT_FILTER.length == 0){
            res({RETCD:"E", RTMSG:GS_MSG.M12}); //(패치) GIT 다운로드 파일이 존재하지않습니다
            return;
        }


        //app.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0];
        try {
            var LS_FILE_INFO = await octokit.request('GET ' + LS_INFO.browser_download_url, {});
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M13}); //GIT (app.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!
            return;
            
        }

        //app.zip 다운로드 경로 설정
        var LV_DOWN_PATH = PATH.join(process.resourcesPath, LS_INFO.name);

        //app.zip 다운로드처리 전 이전 쓰레기 File 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}

        //app.zip 다운로드
        FS.writeFileSync(LV_DOWN_PATH, Buffer.from(LS_FILE_INFO.data), 'binary');

        //테스트 모드 일 경우는 다운로드 위치 폴더 OPEN
        if(!REMOTE.app.isPackaged){
            REMOTE.shell.showItemInFolder(LV_DOWN_PATH);
        }

        //APP.ZIP 파일 압축 해제
        try {
            var zip = new ADMZIP(LV_DOWN_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }

        try {
            zip.extractAllTo(process.resourcesPath, true);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }
        
        //app.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}


        /* ========================================================================= */
        //2. node_modules.zip 파일 ================================================= */
        /* ========================================================================= */        
        var LT_FILTER = ROOT.data.assets.filter(e=> e.name === "node_modules.zip"); 

        //node_modules.zip 다운로드 파일 누락이라면..
        if(LT_FILTER.length == 0){
            res({RETCD:"W", RTMSG:"node_modules 미존재"});
            return;
        }

        //node_modules.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0]; 
        try {
            var LS_FILE_INFO = await octokit.request('GET ' + LS_INFO.browser_download_url, {});
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M14}); //GIT (node_modules.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!
            return;
            
        }

        //node_modules.zip 다운로드 경로 설정
        var LV_DOWN_PATH = PATH.join(process.resourcesPath, LS_INFO.name);

        //node_modules.zip 다운로드처리 전 이전 쓰레기 File 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}

        //node_modules.zip 다운로드
        FS.writeFileSync(LV_DOWN_PATH, Buffer.from(LS_FILE_INFO.data), 'binary');

 
        //node_modules.zip 파일 압축 해제
        try {
            var zip = new ADMZIP(LV_DOWN_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }

        try {
            zip.extractAllTo(process.resourcesPath, true);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M10}); //패치 압축 파일을 푸는 과정에 문제가 발생하였습니다 \n 관리자에게 문의하세요
            return;
        }
        
        //node_modules.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}
        

        res({RETCD:"S", RTMSG:""});

    });
}


//[펑션] asar 소스파일 압축해제 처리 
async function fn_asarDecompress(){
    return new Promise(async (res, rej) => {
        debugger;
        let asar = REMOTE.require("asar");

        //압축 해제 원복 처리할 폴더 생성
        var LV_APP_PATH = PATH.join(process.resourcesPath, "app");
        FS.mkdirSync(LV_APP_PATH);


        //압축 소스(asar) file 경로 구성  
        var LV_ASAR_PATH = PATH.join(process.resourcesPath, "app.asar");

        //압축 해제(소스 원복)
        try {
            await asar.extractAll(LV_ASAR_PATH, LV_APP_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M20}); //app.asar 소스 압축해제 하는 과정에서 오류가 발생하였습니다
            return;
        }

        res({RETCD:"S", RTMSG:""});
        
    });
}




//[펑션] asar 소스파일 압축 처리 
async function fn_asarCompress(){
    return new Promise(async (res, rej) => {

        //이벤트 트리거 - 업데이트 설치중 
        document.dispatchEvent(new CustomEvent('update-install-SP', {detail: {message:GS_MSG.M19} })); 

        //기다려 
        await gf_waiting(500);

        let asar = REMOTE.require("asar");

        //소스 압축 대상 처리할 폴더 경로 설정 
        var LV_APP_PATH  = PATH.join(process.resourcesPath, "app");

        //소스 압축 파일 생성 경로 설정 
        var LV_ASAR_PATH = PATH.join(process.resourcesPath, "app.asar");

        try {
            await asar.createPackage(LV_APP_PATH, LV_ASAR_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:GS_MSG.M21}); //app.asar 소스 압축 하는 과정에서 오류가 발생하였습니다
            return;
        }

        //압축 해제한 폴더 삭제 처리 
        FS.rmdir(LV_APP_PATH, {
            recursive: true, force: true
        }, (error) => {

        });

        res({RETCD:"S", RTMSG:""});

    });
}


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */

//이벤트 설정 
exports.on = function(evtnm, CB){
    document.addEventListener(evtnm, CB); 

};

//업데이트 점검 시작 
exports.checkForUpdates = async function(remote, iscdn = false, versn, splev = 0, oLoginInfo){	
		
        //업데이트 확인중 
        document.dispatchEvent(new CustomEvent('checking-for-update-SP', {detail: {message:GS_MSG.M15} })); 

        //electron resource
        REMOTE = remote;       
        ISCDN  = iscdn;          //CDN 여부 
        VERSN  = versn;          //WS3.0 버젼(current) 
        SPLEV  = Number(splev);  //패치 번호(current)

        //초기값 설정
        gf_initData(oLoginInfo);

        //업데이트 방식에 따른 분기
        switch (ISCDN) {
            case true: //GIT
                var LS_CHKER = await gf_chkPatch_GIT();
                break;
        
            default:   //SAP
                var LS_CHKER = await gf_chkPatch_SAP();
                break;
        }


        if(LS_CHKER.RETCD === "E"){
            document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_CHKER.RTMSG } }));
            return;
        }


        //업데이트 항목이 없을 경우 
        if(!LS_CHKER.ISPATCH){
            document.dispatchEvent(new CustomEvent('update-not-available-SP', {detail: {message: GS_MSG.M16} })); //현재 최신버전입니다.
            return; 
        }


        //사용 API 리소스 
        FS     = REMOTE.require('fs');
        PATH   = REMOTE.require('path');
        ADMZIP = REMOTE.require("adm-zip");
        

        //이벤트 트리거 - 업데이트 항목 존재 
        document.dispatchEvent(new CustomEvent('update-available-SP', {detail: {message: GS_MSG.M17} }));  //업데이트 항목이 존재합니다


        //asar 소스파일 압축해제 처리 
        var LS_STATUS = await fn_asarDecompress();

        if(LS_STATUS.RETCD === "E"){
            document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_STATUS.RTMSG } }));
            return;
        }

        //업데이트 방식에 따른 분기
        switch (ISCDN) {
            case true: //GIT
                var LS_STATUS = await gf_download_GIT();
                break;
        
            default:   //SAP
                var LS_STATUS = await gf_download_SAP(LS_CHKER);
                break;
        }

        if(LS_STATUS.RETCD === "E"){
            document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_STATUS.RTMSG } }));
            return;
        }

        
        //asar 소스파일 압축 처리 
        var LS_STATUS = await fn_asarCompress();
        
        if(LS_STATUS.RETCD === "E"){
            document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_STATUS.RTMSG } }));
            return;
        }


        //이벤트 트리거 - 업데이트가 완료되었습니다.
        document.dispatchEvent(new CustomEvent('update-downloaded-SP', {detail: {message: '업데이트가 완료되었습니다.'} })); 


};



