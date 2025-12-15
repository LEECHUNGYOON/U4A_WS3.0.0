const FS    = require("fs");
const spawn = require("child_process").spawn;

// 공통 응답 구조
const TY_RES = {
    PRCCD: "",      // 수행중인 프로세스 코드
    RETCD: "",      // 수행 결과에 대한 코드    
    ACTCD: "",      // 수행중인 행위에 대한 코드    
    STCOD: "",      // 수행 결과에 대한 상태 코드    
    RTMSG: "",      // 수행 결과에 대한 메시지
    MSGNR: "",      // 메시지 번호
    PARAM: "",      // 수행 결과에 대한 데이터 
};


// 프로세스 Enum
const PRC = {

    // 오류
    ERROR       : "ERROR",

    // Document 실행
    OPEN_DOCU   : "OPEN_DOCU",

    // 프로그래스바 Dialog Open
    PROG_DIALOG_OPEN: "PROG_DIALOG_OPEN",

    // 프로그래스바 Dialog Close
    PROG_DIALOG_CLOSE: "PROG_DIALOG_CLOSE",

    // 프로그래스바 데이터 설정
    SET_PROG_DATA: "SET_PROG_DATA",

    // 다운로드 중 콘솔오류 대상
    UPDATE_ERROR_CONSOLE: "update-error-console" 

};


/**
 * Worker onmessage 
 */
self.onmessage = async function(e){

    // 공통 응답 구조
    var oRES = JSON.parse(JSON.stringify(TY_RES));        

    // 필수 파라미터 누락!!
    var oIF_DATA = e?.data || undefined;

    if(!oIF_DATA){

        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = "onmessage-E001";    
        oRES.RTMSG = "필수 파라미터 누락!!"; 
        oRES.MSGNR = "M06"; // Help Document 버젼 파일 생성중 오류 발생

        self.postMessage(oRES);

        return;
    }

    // 프로세스 코드가 없다면 오류!!
    if(!oIF_DATA?.PRCCD){

        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = "onmessage-E002";
        oRES.RTMSG = "필수 파라미터 누락!!";
        oRES.MSGNR = "M06"; // Help Document 버젼 파일 생성중 오류 발생
     
        self.postMessage(oRES);

        return;
    }


    try {

        let oPARAM = oIF_DATA.PARAM;

        self[oIF_DATA.PRCCD](oPARAM);
        
    } catch (error) {
    
        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = "onmessage-E003";
        oRES.RTMSG = "잘못된 PRCCD";
        oRES.MSGNR = "M06"; // Help Document 버젼 파일 생성중 오류 발생

        // Error Log
        var sErrLog = error && error?.toString() || "";
            sErrLog += error && error?.stack || "";

        oRES.PARAM = {
            LOG: sErrLog
        }

        self.postMessage(oRES);

        return;

    }    

};


//File 존재여부 점검
async function gfn_file_existence(oFS, FOLD_PATH, CHK_FNAME) {
    return new Promise((resolve, reject) => {
        oFS.readdir(FOLD_PATH, (err, files) => {
            var isFnd = false;
            files.forEach(file => {
                if (file === CHK_FNAME) {
                    isFnd = true;

                }
            });

            resolve(isFnd);

        });
    });

}

//파일 삭제 
async function gfn_fileDel(oFS, PATH) {
    return new Promise((resolve, reject) => {

        try {
            oFS.unlink(PATH, (e) => { });
        } catch (error) {

        }

        resolve();

    });
}

//파일 이동
async function gfn_FileMove(oFS, NEW_PATH, OLD_PATH) {
    return new Promise((resolve, reject) => {

        oFS.rename(OLD_PATH, NEW_PATH, function (err) {
            if (err) { }

            resolve();

        });

    });
}

/**
 * PowerShell을 이용해서 Help Document를 가져온다.
 */
function _getHelpDocuDataFromPowerShell(oPARAM){

    return new Promise(function(resolve){
        
        // 다운로드 대상 Document 파일 헤더 정보
        let HEAD_DATA = oPARAM.HEAD_DATA;

        // 다운로드 대상 Document 파일 정보
        let FILE_INFO = HEAD_DATA.DATA;

        // 다운로드 수행 횟수
        let iCount = 0;

        // 파일 전체 갯수
        let iTotal = FILE_INFO.BLOBCNT;

        var oRES = JSON.parse(JSON.stringify(TY_RES)); 

        oRES.PRCCD = PRC.SET_PROG_DATA; // 프로그래스바 데이터 설정
        oRES.PARAM = {
            TOTAL: iTotal,
            COUNT: iCount
        };

        self.postMessage(oRES);

        var aParams = [
            "-ExecutionPolicy", "Bypass",
            "-File", oPARAM.PS_DOC_PATH,
            "-BaseUrl", oPARAM.BASE_URL,
            "-sapClient", oPARAM.SAP_CLIENT,
            "-sapUser", oPARAM.SAP_USER,
            "-sapPassword", oPARAM.SAP_PW,
            "-dPath", oPARAM.TMP_ROOT_PATH,
            "-JsonInput", JSON.stringify(FILE_INFO),
            "-logPath", oPARAM.LOG_FLD_PATH
        ];

        /**
         * @since   2025-12-10 18:01:22
         * @version v3.5.6-17
         * @author  soccerhs
         * @description
         * 
         * 파워쉘로 패치 업데이트용 쉘 실행 시 https 인증서 오류 회피 파라미터 추가
         * 
         */
        if(oPARAM.SKIP_CERT === true){
            aParams.push("-SkipCertificateCheck");
        }        

        // PowerShell 프로세스 생성
        const ps = spawn("powershell.exe", aParams);

        // 실행 결과 출력
        ps.stdout.on("data", (data) => {

            // 분할 다운로드 수행 횟수에 상관없이 공백이 날라오는 경우가 있음.
            // 테스트 결과 공백일 경우는 리턴해도 수행 해야할 총 횟수에는 영향이 없음.
            if(!data?.toString()?.trim()){                
                return;
            }
            
            let sData = data?.toString();

            /**
             * @since   2025-11-05
             * @version v3.5.6-16
             * @author  soccerhs
             * 
             * @description
             *  [기존] 
             *      - powershell에서 패치 파일 다운로드 진행 중,
             *        Write-Host 출력(stdout)을 다운로드 성공 신호로 인식하여 퍼센트 계산함
             *  [변경]
             *      - stdout 로그 중 단순 로그 용으로 Write-Host를 사용하는 경우가 있어서,
             *        특정 키워드(CHUNK_DOWN_OK) 포함 시에만 다운로드 성공으로 간주하도록 수정함
             */
            if(sData.includes("CHUNK_DOWN_OK") === true){

                // 다운로드 수행 횟수 증가
                iCount++;
            
            }

            let sLog = `Help Document 다운로드 중: ${data.toString()}`;

            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.PRCCD = PRC.SET_PROG_DATA; // 프로그래스바 데이터 설정
            oRES.PARAM = {
                TOTAL: iTotal,
                COUNT: iCount,
                LOG  : sLog
            };

            self.postMessage(oRES);            
            
        });

        // 에러 메시지 출력
        ps.stderr.on("data", (data) => {

            let sLog = `Document 다운로드 중 에러: ${data.toString()}`;

            // console.error(sLog);            
            // console.trace();

            // if (!ps.killed) {              
            //     ps.kill();
            //     console.log("kill-1");
            // }

            // return resolve({ SUBRC: 999, LOG: sLog });

            /**
             * @since   2025-11-05
             * @version v3.5.6-16
             * @author  soccerhs
             * 
             * @description
             * - powershell 에서 발생되는 오류 메시지를 받으면 child_process를 중지 시키지 않고 
             *   콘솔 오류만 발생시키는 로직으로 수정함             
             */
            var oRES = JSON.parse(JSON.stringify(TY_RES)); 

            oRES.PRCCD = PRC.UPDATE_ERROR_CONSOLE; // 다운로드 중 콘솔오류 대상
            oRES.PARAM = {
                LOG: sLog
            };

            self.postMessage(oRES);

        });

        // 실행 완료 이벤트 처리
        ps.on("close", (code) => {
            
            console.log(`Document 다운로드 종료: ${code}`);            

            if (!ps.killed) {              
                ps.kill();
            }

            return resolve({ SUBRC: code });

        });

    });

}; // end of _getHelpDocuDataFromPowerShell

/**
 * U4A Help Document Download 
 */
self.WS_HELP_DOCU_DOWN = async function (oPARAM) {    

    // 공통 응답 구조
    var oRES = JSON.parse(JSON.stringify(TY_RES));

    // let oPATH = PATH;
    let oFS = FS;

    // Document Header Data
    let HEAD_DATA    = oPARAM.HEAD_DATA;      

    // Help Document 다운로드 파일 처리 루트 경로
    let LV_ROOT_PATH = oPARAM.ROOT_PATH;

    // Help Document 다운로드 경로
    let LV_DOWN_PATH = oPARAM.DOWN_PATH;

    // Help Document 폴더 생성
    if (!oFS.existsSync(LV_ROOT_PATH)) {
        oFS.mkdirSync(LV_ROOT_PATH);
    }

    //다운로드 임시폴더 경로 설정 
    let LV_TMP_ROOT_PATH = oPARAM.TMP_ROOT_PATH;
    let LV_TMP_DOWN_PATH = oPARAM.TMP_DOWN_PATH;

    //Help Document 임시폴더 생성
    if (!oFS.existsSync(LV_TMP_ROOT_PATH)) {
        oFS.mkdirSync(LV_TMP_ROOT_PATH);
    }

    //Help document 버젼 파일 존재여부 점검 - 존재한다면 
    if (await gfn_file_existence(oFS, LV_ROOT_PATH, "U4A_HELP_DOC_VER" + HEAD_DATA.DATA.VERSN + ".json")) {

        //Help Document 파일이 존재한다면 
        if (await gfn_file_existence(oFS, LV_ROOT_PATH, HEAD_DATA.DATA.LOCFN)) {
            
            // Document 파일 실행
            oRES.PRCCD = PRC.OPEN_DOCU;
            oRES.PARAM = {
                DOC_FILE_PATH: LV_DOWN_PATH
            };

            self.postMessage(oRES);
      
            return;

        }

    }

    // Help document 버젼 파일 Path 설정 
    let LV_VESN_PATH = oPARAM.VESN_PATH;

    //버젼 파일 생성
    try {

        oFS.writeFileSync(LV_VESN_PATH, JSON.stringify(HEAD_DATA.DATA), 'utf-8');

    } catch (error) {
       
        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = "WS_HELP_DOCU_DOWN-E001";
        oRES.MSGNR = "M06"; // Help Document 버젼 파일 생성중 오류 발생

        // Error Log
        var sErrLog = error && error?.toString() || "";
            sErrLog += error && error?.stack || "";

        oRES.PARAM = {
            LOG: sErrLog
        }

        self.postMessage(oRES);
    
        return;
    }

    //이전 Help Document 임시 파일 삭제
    await gfn_fileDel(oFS, LV_TMP_DOWN_PATH);

    // 프로그래스바 Dialog Open
    oRES.PRCCD = PRC.PROG_DIALOG_OPEN;

    self.postMessage(oRES);


    /**
     * PowerShell로 HelpDocument 파일을 다운한다.
     */
    let oShellResult = await _getHelpDocuDataFromPowerShell(oPARAM);
    if(oShellResult.SUBRC !== 0){

        // Document 파일 실행
        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = `WS_HELP_DOCU_DOWN-E002-SUBRC:${oShellResult.SUBRC}`;
        oRES.MSGNR = "M03"; // Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.
        oRES.PARAM = {
            LOG: oShellResult?.LOG || "" // PowerShell 오류 로그
        };

        self.postMessage(oRES);  

        return;

    }
        

    // 프로그래스바 Dialog Close
    oRES.PRCCD = PRC.PROG_DIALOG_CLOSE;

    self.postMessage(oRES);
    

    //서버측에 응답코드가 실제 Data 미존재? 아님 처리 완료? 알수 없기에
    //Temp 폴더에 파일여부를 확인해본다 미존재하면 서버측에 Data가 없는것으로 추측함
    if (!await gfn_file_existence(oFS, LV_TMP_ROOT_PATH, HEAD_DATA.DATA.LOCFN)) {

        // Document 파일 실행
        oRES.PRCCD = PRC.ERROR;
        oRES.STCOD = "WS_HELP_DOCU_DOWN-E003";
        oRES.MSGNR = "M03"; // Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.

        self.postMessage(oRES);  

        return;

    }

    //기존 파일 삭제
    await gfn_fileDel(oFS, LV_DOWN_PATH);

    //Help Document 임시파일 => 실제 폴더에 이관
    await gfn_FileMove(oFS, LV_DOWN_PATH, LV_TMP_DOWN_PATH);

    //Help Document 임시 파일 삭제
    await gfn_fileDel(oFS, LV_TMP_DOWN_PATH);

    // Document 파일 실행
    oRES.PRCCD = PRC.OPEN_DOCU;
    oRES.PARAM = {
        DOC_FILE_PATH: LV_DOWN_PATH
    };

    self.postMessage(oRES);    

};