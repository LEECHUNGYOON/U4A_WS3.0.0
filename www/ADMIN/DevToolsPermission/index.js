/* ***************************************************************** */
// 설치 npm 
// 
/* ***************************************************************** */


/* ***************************************************************** */
// I/F 필드 정의 
/* ***************************************************************** */
/*
 */
/* ***************************************************************** */

/* ***************************************************************** */
/* 사용 예시 
        var oDEVTOOL = require(oAPP.path.join(__dirname, "ADMIN", "DevToolsPermission", "index.js"));

        //파일 업로드 형식 - 디렉토리 선택 
        var sRETURN = await oDEVTOOL.excute01(oAPP.remote);

        //수기 입력 형식 
        var sRETURN = await oDEVTOOL.excute02(oAPP.remote, "암호화 값");

        // 후속 처리
        if(sRETURN.RETCD === "E"){ alert(sRETURN.RTMSG); }

      
*/
/* ***************************************************************** */

/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */

const AES128SECRETKEY = "U4A*RND*WS30";

const MSGCLS = {
    M01: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "350", "", "", "", ""), // "잘못된 파일 형식입니다",  //350
    M02: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "351", "", "", "", ""), // "만료시간 종료되었습니다", //351
    M03: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "352", "", "", "", ""), // "잘못된 System ID 입니다", //352
    M04: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "353", "", "", "", ""), // "잘못된 Instance Number 입니다", //353
    M05: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "354", "", "", "", ""), // "복호화 처리 오류 입니다", //354
    M06: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "357", "", "", "", ""), // "관리자 권한 파일 선택", //357
    M07: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "355", "", "", "", ""), // "선택", //355
    M08: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "161", "", "", "", ""), // "작업취소", //161
    M09: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "356", "", "", "", ""), // "복호화 파일 업로드 과정에서 오류발생" //356
    M10: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D87", "", "", "", ""), // U4A Admin DevTools
};

let oServerInfo = parent.getServerInfo();

let SYSID = oServerInfo.SYSID, //현재 서버에 시스템 ID - 문자 형식 
    INSTNO = oServerInfo.INSTANCENO; //현재 서버에 인스턴스 번호 - 문자 형식 

/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

//콘솔창 실행여부에 대한 (암호화=>복호화) 
function fn_decrypt(CryptoJS, encryptData) {

    const aes128Iv = "";

    debugger;

    var cipher = CryptoJS.AES.decrypt(encryptData, CryptoJS.enc.Utf8.parse(AES128SECRETKEY), {
        iv: CryptoJS.enc.Utf8.parse(aes128Iv), // [Enter IV (Optional) 지정 방식]
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC // [cbc 모드 선택]
    });

    //복호화 실패 
    if (cipher.sigBytes < 0) {
        return {
            "RETCD": "E",
            "RTMSG": MSGCLS.M01
        };

    }

    let Ldecrypt = cipher.toString(CryptoJS.enc.Utf8);

    //복호화 실패 
    if (Ldecrypt === "") {
        return {
            "RETCD": "E",
            "RTMSG": MSGCLS.M01
        };

    }

    try {
        var oDescrypt = JSON.parse(Ldecrypt);
    } catch (e) {
        return {
            "RETCD": "E",
            "RTMSG": MSGCLS.M01
        };
    }

    //정상적으로 복호화
    return {
        "RETCD": "S",
        "DECRYPT": oDescrypt
    };

}

//현재 년월일시분 - 만료여부 점검용
function fn_checkTime() {

    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1; // 월
    let date = today.getDate(); // 날짜
    let hours = today.getHours(); // 시
    let minutes = today.getMinutes(); // 분

    return Number(year.toString() + month.toString() + date.toString() + hours.toString() + minutes.toString());

}


//복호화 기준으로 점검로직 수행후 콘솔창 (실행/비실행)
function fn_exCuteDevTools(REMOTE, DECRYPT, resolve) {

    //내용 점검
    if (typeof DECRYPT.SYSID === "undefined" || typeof DECRYPT.EXPIRY_TIME === "undefined") {
        resolve({
            "RETCD": "E",
            "RTMSG": MSGCLS.M01
        });
        return;
    }

    //현재 => 년월일시분 
    var curentTime = fn_checkTime();


    //만료 시간이 종료된 파일 이라면 ..
    if (DECRYPT.EXPIRY_TIME < curentTime) {
        resolve({
            "RETCD": "E",
            "RTMSG": MSGCLS.M02
        });
        return;

    }

    if (DECRYPT.SYSID !== "*") {

        //SAP 시스템 ID 점검 
        if (DECRYPT.SYSID !== SYSID) {
            resolve({
                "RETCD": "E",
                "RTMSG": MSGCLS.M03
            });
            return;

        }

        //SAP 인스턴스 번호 점검 
        if (DECRYPT.INSTNO !== INSTNO) {
            resolve({
                "RETCD": "E",
                "RTMSG": MSGCLS.M04
            });
            return;

        }

    }

    //콘솔창 실행
    var oWin = REMOTE.getCurrentWindow();
    oWin.openDevTools();


    //프로미스 종료 
    resolve({
        "RETCD": "S",
        "RTMSG": ""
    });

}


//access 처리 방법 - 파일 업로드 형식
function fn_access01(REMOTE, resolve) {

    let options = {
        // See place holder 1 in above image
        title: MSGCLS.M06,

        // See place holder 3 in above image
        buttonLabel: MSGCLS.M07,

        // See place holder 4 in above image
        filters: [{
            name: MSGCLS.M10,
            extensions: ['U4A_WS_DEVOPEN']
        }],
        properties: ['openFile', '']
    };

    //권한 설정 파일 업로드
    REMOTE.dialog.showOpenDialog(REMOTE.getCurrentWindow(), options).then((e) => {

        //작업취소 
        if (e.canceled) {
            resolve({
                "RETCD": "W",
                "RTMSG": MSGCLS.M08
            });
            return;
        }

        const fs = REMOTE.require('fs');
        const path = REMOTE.require('path');
        const CryptoJS = require(path.join(__dirname, 'crypto-js.min.js'));

        //file 읽기 
        fs.readFile(e.filePaths[0], 'utf8', function (err, data) {
            if (err) {
                resolve({
                    "RETCD": "E",
                    "RTMSG": MSGCLS.M09
                }); //M09:"복호화 파일 업로드 오류"
                return;
            }

            //복호화 
            let sRET = fn_decrypt(CryptoJS, data);
            if (sRET.RETCD === "E") {
                resolve(sRET);
                return;
            }


            //암호화 파일 삭제 처리 
            fs.unlink(e.filePaths[0], (e) => {});


            //복호화 기준으로 점검로직 수행후 콘솔창 (실행/비실행)
            fn_exCuteDevTools(REMOTE, sRET.DECRYPT, resolve);


        });

    });


}


//access 처리 방법 - 수기 입력 형식
function fn_access02(REMOTE, encryptData, resolve) {

    const path = REMOTE.require('path');
    const CryptoJS = require(path.join(__dirname, 'crypto-js.min.js'));

    //복호화 
    let sRET = fn_decrypt(CryptoJS, encryptData);
    if (sRET.RETCD === "E") {
        resolve(sRET);
        return;
    }

    //복호화 기준으로 점검로직 수행후 콘솔창 (실행/비실행)
    fn_exCuteDevTools(REMOTE, sRET.DECRYPT, resolve);

}


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */

//파일 업로드 형식 
exports.excute01 = async function (REMOTE) {
    return new Promise((resolve, reject) => {
        fn_access01(REMOTE, resolve);

    }); //return new Promise((resolve, reject) => {

}; //export01


//수기 입력 형식
exports.excute02 = async function (REMOTE, ENCRYPT) {
    return new Promise((resolve, reject) => {
        fn_access02(REMOTE, ENCRYPT, resolve);

    }); //return new Promise((resolve, reject) => {

}; //export02