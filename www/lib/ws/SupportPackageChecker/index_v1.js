// I/F 필드 정의 
/* ***************************************************************** */
/*
*/
/* ***************************************************************** */
/* ***************************************************************** */
/* 사용 예시 
    var spAutoUpdater = require(oAPP.path.join(__dirname, 'SupportPackageChecker/index.js'));
    
    spAutoUpdater.on("checking-for-update-SP", (e)=>{ debugger; });

    spAutoUpdater.on("update-available-SP", (e)=>{ debugger; });

    spAutoUpdater.on("update-not-available-SP", (e)=>{ debugger; });

    spAutoUpdater.on("download-progress-SP", (e)=>{ debugger; });
    
    spAutoUpdater.on("update-downloaded-SP", (e)=>{ debugger; });

    spAutoUpdater.on("update-error-SP", (e)=>{ debugger; });
    
    
    await spAutoUpdater.checkForUpdates(oAPP.remote, true, "v3.3.6", "00001");

    console.log(11);


      
*/

/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */
let REMOTE = undefined;
let FS     = undefined;
let PATH   = undefined;
let ISCDN  = false;
let VERSN  = "";
let SPLEV  = 0;
let ADMIN  = {};
let Octokit = undefined;
let ADMZIP  = undefined;

/* ***************************************************************** */
/* Custom Event  
/* ***************************************************************** */



/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

//[펑션] 기다려 
async function gf_waiting(t = 0){
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, t);
    });
}


//[펑션] 초기값 설정
function gf_initData(){

    Octokit = REMOTE.require("@octokit/core").Octokit;

        //sap config
        ADMIN.SAP = {};
        ADMIN.SAP.ID  = "shhong";
        ADMIN.SAP.PW  = "2wsxzaq1!";
        ADMIN.SAP.URL = "http://u4arnd.com:8000/zu4a_rnd/WS30_SUPPORT_PATCH_UPLOAD";

        if(REMOTE.app.isPackaged){
            ADMIN.SAP.ID  = "U4AIDE";
            ADMIN.SAP.PW  = "$u4aRnd$";
         
        }

        //git config
        ADMIN.GIT = {};
        ADMIN.GIT.AUTH = "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";
        ADMIN.BASE_PATH = "https://api.github.com/repos/hongsungho1/test";

        if(REMOTE.app.isPackaged){
            ADMIN.GIT.AUTH = "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";
            ADMIN.BASE_PATH = "https://api.github.com/repos/LEECHUNGYOON/U4A_WS3.0.0_SP";          
        }

}


//[펑션] (SAP) 패치 존재여부 점검 
async function gf_chkPatch_SAP(){
    return new Promise((res, rej) => {

    });
}


//[펑션] (SAP) 패치 존재여부 점검 
async function gf_download_SAP(){
    return new Promise((res, rej) => {

    });
}



//[펑션] (GIT) 패치 존재여부 점검 
async function gf_chkPatch_GIT(){
    return new Promise(async (res, rej) => {

        const octokit = new Octokit({ auth:ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.BASE_PATH + '/contents', {});

        } catch (err) {
            res({RETCD:"E", RTMSG:"[패치정보 추출] \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!"});
            return;
            
        }

        var LT_FILTER = ROOT.data.filter(e=> e.name === "latest.json");

        //패치 정보 누락일 경우 
        if(LT_FILTER.length == 0){
            res({RETCD:"W", RTMSG:"GIT 패치정보 없슴!!"});
            return;
        }

        var LS_INFO = LT_FILTER[0]; 

        try {
            var LV_DOWN_URL = LS_INFO.download_url + "?token=" + LS_INFO.sha;
            var LS_LATEST   = await octokit.request('GET '+ LV_DOWN_URL, {});
        } catch (err) {
            res({RETCD:"E", RTMSG:"GIT 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!"});
            return;
            
        }

        //GIT 등록된 패치번호 
        var LS_PATCH = JSON.parse(LS_LATEST.data);

        if(Number(LS_PATCH.SPLEV) > SPLEV){
            res({RETCD:"S", ISPATCH:true, RTMSG:"패치 존재"});
            return;

        }

        res({RETCD:"S", ISPATCH:false, RTMSG:"패치 미존재"});
        return;

    });
}


//[펑션] (GIT) 패치 다운로드
async function gf_download_GIT(){
    return new Promise(async (res, rej) => {

        //이벤트 트리거 - 다운로드중
        document.dispatchEvent(new CustomEvent('download-progress-SP', {detail: {message: '다운로드중'} })); 

        const octokit = new Octokit({ auth:ADMIN.GIT.AUTH });

        try {
            var ROOT = await octokit.request('GET ' + ADMIN.BASE_PATH + '/contents', {});

        } catch (err) {
            res({RETCD:"E", RTMSG:"[패치정보 추출] \n GIT 서비스 통신 오류 발생 \n 관리자에게 문의바람!!"});
            return;
            
        }

        //1. app.zip 파일 =========================================================== */
        var LT_FILTER = ROOT.data.filter(e=> e.name === "app.zip");

        //app.zip 다운로드 파일 누락이라면..
        if(LT_FILTER.length == 0){
            res({RETCD:"E", RTMSG:"GIT 다운로드 파일이 존재하지않습니다"});
            return;
        }


        //app.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0];
        try {
            var LV_DOWN_URL  = LS_INFO.download_url + "?token=" + LS_INFO.sha;
            var LS_FILE_INFO = await octokit.request('GET '+ LV_DOWN_URL, {});
        } catch (err) {
            res({RETCD:"E", RTMSG:"GIT (app.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!"});
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

        debugger;
        //APP.ZIP 파일 압축 해제
        try {
            var zip = new ADMZIP(LV_DOWN_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:"압축 파일 미존재"});
            return;
        }

        try {
            zip.extractAllTo(process.resourcesPath, true);
        } catch (err) {
            res({RETCD:"E", RTMSG:"압축 파일 미존재"});
            return;
        }
        
        //app.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}


        //2. node_modules.zip 파일 =========================================================== */
        var LT_FILTER = ROOT.data.filter(e=> e.name === "node_modules.zip");  

        //node_modules.zip 다운로드 파일 누락이라면..
        if(LT_FILTER.length == 0){
            res({RETCD:"W", RTMSG:"node_modules 미존재"});
            return;
        }


        //node_modules.zip 물리적 파일 data 얻기 
        var LS_INFO = LT_FILTER[0]; 
        try {
            var LV_DOWN_URL  = LS_INFO.download_url + "?token=" + LS_INFO.sha;
            var LS_FILE_INFO = await octokit.request('GET '+ LV_DOWN_URL, {});
        } catch (err) {
            res({RETCD:"E", RTMSG:"GIT (node_modules.zip) 패치 파일 추출하는동안 오류 발생 관리자에게 문의!!"});
            return;
            
        }

        //node_modules.zip 다운로드 경로 설정
        var LV_DOWN_PATH = PATH.join(process.resourcesPath, LS_INFO.name);

        //node_modules.zip 다운로드처리 전 이전 쓰레기 File 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}

        //node_modules.zip 다운로드
        FS.writeFileSync(LV_DOWN_PATH, Buffer.from(LS_FILE_INFO.data), 'binary');

        debugger;
        //node_modules.zip 파일 압축 해제
        try {
            var zip = new ADMZIP(LV_DOWN_PATH);
        } catch (err) {
            res({RETCD:"E", RTMSG:"압축 파일 미존재"});
            return;
        }

        try {
            zip.extractAllTo(process.resourcesPath, true);
        } catch (err) {
            res({RETCD:"E", RTMSG:"압축 파일 미존재"});
            return;
        }
        
        //node_modules.zip 다운로드 파일 제거
        try { FS.unlinkSync(LV_DOWN_PATH); } catch (err) {}
        

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
exports.checkForUpdates = async function(remote, iscdn = false, versn, splev = 0){

        document.dispatchEvent(new CustomEvent('checking-for-update-SP', {detail: {message: '업데이트 확인중'} })); 

        //electron resource
        REMOTE = remote;       
        ISCDN  = iscdn;          //CDN 여부 
        VERSN  = versn;          //WS3.0 버젼(current) 
        SPLEV  = Number(splev);  //패치 번호(current)


        //초기값 설정
        gf_initData();


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
            document.dispatchEvent(new CustomEvent('update-not-available-SP', {detail: {message: '현재 최신버전입니다.'} }));
            return; 
        }


        //사용 API 리소스 
        FS     = REMOTE.require('fs');
        PATH   = REMOTE.require('path');
        ADMZIP = REMOTE.require("adm-zip");
        

        //이벤트 트리거 - 업데이트 항목 존재 
        document.dispatchEvent(new CustomEvent('update-available-SP', {detail: {message: '업데이트 항목이 존재합니다'} })); 


        //업데이트 방식에 따른 분기
        switch (ISCDN) {
            case true: //GIT
                var LS_STATUS = await gf_download_GIT();
                break;
        
            default:   //SAP
                var LS_STATUS = await gf_download_SAP();
                break;
        }

        if(LS_CHKER.RETCD === "E"){
            document.dispatchEvent(new CustomEvent('update-error-SP', { detail: { message: LS_STATUS.RTMSG } }));
            return;
        }


        //이벤트 트리거 - 업데이트가 완료되었습니다.
        document.dispatchEvent(new CustomEvent('update-downloaded-SP', {detail: {message: '업데이트가 완료되었습니다.'} })); 


};



