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
    var HelpDoc = require(oAPP.path.join(__dirname, 'HelpDocument/main.js'));

    Help Document 수행 
        - 파라메터 설명 
            REMOTE         : electron remote 오브젝트 
            DOWN_ROOT_PATH : 다운로드 처리할 폴더 경로 

        - 아래 펑션을 수행전  (busy indicator 수행) 처리함 

            var retdata = await HelpDoc.Excute(oAPP.remote, "D:\\DOWNLOAD"); 
            retdata.RETCD <-- E:오류 
            retdata.RTMSG <-- 처리 메시지 
      
        - (busy indicator 종료)
*/
/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */
const GS_MSG = {
    M01: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "367", "", "", "", ""), //"Help Document 처리 통신 오류",
    M02: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "368", "", "", "", ""), //"Help Document 다운로드 처리 과정에서 해더 정보 누락되었습니다",
    M03: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "369", "", "", "", ""), //"Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다.",
    M04: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "370", "", "", "", ""), //"Help Document 분할 다운로드 처리 과정에서 오류 발생",
    M05: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "371", "", "", "", ""), //"처리 완료",
    M06: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "372", "", "", "", ""), //"Help Document 버젼 파일 생성중 오류 발생",
    M07: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B44", "", "", "", ""), // U4A Help Document
    M08: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B78", "", "", "", ""), // Download
};

let GV_HOST = parent.getHost();

/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

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

//Help document 해더 정보 추출
async function gfn_getHeadData() {
    return new Promise((resolve, reject) => {

        var LV_URL = GV_HOST + "/zu4a_wbc/u4a_ipcmain/U4A_HELP_DOC_WS30?PRCCD=HEAD";
        var xhttp = new XMLHttpRequest();
        xhttp.onerror = (e) => {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M01
            });
        }; //통신오류
        xhttp.ontimeout = () => {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M01
            });
        }; //통신오류
        xhttp.onload = (e) => {

            try {
                var sDATA = JSON.parse(e.target.response);
            } catch (error) {
                resolve({
                    RETCD: "E",
                    RTMSG: GS_MSG.M01
                }); //통신오류
                return;
            }

            resolve({
                RETCD: "S",
                RTMSG: "",
                DATA: sDATA
            });
            return;

        };

        xhttp.open("GET", LV_URL, true);
        xhttp.withCredentials = true;
        xhttp.send();

    });
}

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

// 프로그레스바 다이얼로그 열기
function gfn_openProgressDialogOpen() {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.oAPP) {
        return;
    }

    let oAPP = oConWin.oAPP,
        sTitle = `${GS_MSG.M07} ${GS_MSG.M08}`;

    let oInitOptions = {
        description: sTitle,
        // title: sTitle,
        illustrationType: "tnt-Systems",
    };

    oAPP.common.fnProgressDialogOpen(oInitOptions);

} // end of gfn_openProgressDialog

// 프로그레스바 다이얼로그 닫기
function gfn_closeProgressDialog() {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.oAPP) {
        return;
    }

    let oAPP = oConWin.oAPP;
    if (!oAPP) {
        return;
    }

    oAPP.common.fnProgressDialogClose();

} // end of gfn_closeProgressDialog

function gfn_setProgressbar(iValue, iTotalValue) {

    let oFrame = document.getElementById("ws_frame");
    if (!oFrame) {
        return;
    }

    let oConWin = oFrame.contentWindow;
    if (!oConWin || !oConWin.sap) {
        return;
    }

    // sap 인스턴스 여부 확인
    let sap = oConWin.sap;
    if (!sap) {
        return;
    }

    // 혹시나 나눗셈 할때 0으로 나누는지 확인
    if (!isFinite(iValue / iTotalValue)) {
        return;
    }

    let sPerValue = (iValue / iTotalValue) * 100,
        sPrgressId = "u4aWsProg",
        oProgressbar = sap.ui.getCore().byId(sPrgressId);

    if (!oProgressbar) {
        return;
    }

    sPerValue = sPerValue.toFixed(2);

    oProgressbar.setPercentValue(sPerValue);

    let sMsg = `${GS_MSG.M08}.....${sPerValue}%`;

    oProgressbar.setDisplayValue(sMsg);

} // end of gfn_setProgressbar


/*=================================================================== */
// Export Module Function - Help document 서버 Data 추출후 다운로드 처리
/*=================================================================== */
exports.Excute = async function (REMOTE, DOWN_ROOT_PATH) {
    //REMOTE         : electron remote 오브젝트 
    //HEAD_DATA      : Help document 해더 Data => getHeadData <- 이 펑션에서 추출한 Data
    //DOWN_ROOT_PATH : 다운로드 처리할 폴더 경로 

    return new Promise(async (resolve, reject) => {

        //Help document 해더 정보 추출
        let HEAD_DATA = await gfn_getHeadData();

        //Help Document 다운로드 처리 과정에서 해더 정보 누락되었습니다
        if (typeof HEAD_DATA !== "object") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }
        if (typeof HEAD_DATA.DATA !== "object") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }
        if (typeof HEAD_DATA.DATA.RINDX === "undefined") {
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M02
            });
            return;
        }

        let oFS = REMOTE.require('fs'),
            oPATH = REMOTE.require('path');


        //다운로드 파일 처리 경로 설정 
        let LV_ROOT_PATH = oPATH.join(DOWN_ROOT_PATH, "U4A_HELP_DOC");
        let LV_DOWN_PATH = oPATH.join(LV_ROOT_PATH, HEAD_DATA.DATA.LOCFN);


        //Help Document 폴더 생성
        if (!oFS.existsSync(LV_ROOT_PATH)) {
            oFS.mkdirSync(LV_ROOT_PATH);
        }

        //다운로드 임시폴더 경로 설정 
        let LV_TMP_ROOT_PATH = oPATH.join(LV_ROOT_PATH, "U4A_HELP_DOC_TMP");
        let LV_TMP_DOWN_PATH = oPATH.join(LV_TMP_ROOT_PATH, HEAD_DATA.DATA.LOCFN);

        //Help Document 임시폴더 생성
        if (!oFS.existsSync(LV_TMP_ROOT_PATH)) {
            oFS.mkdirSync(LV_TMP_ROOT_PATH);
        }


        //Help document 버젼 파일 Path 설정 
        let LV_VESN_PATH = oPATH.join(LV_ROOT_PATH, "U4A_HELP_DOC_VER" + HEAD_DATA.DATA.VERSN + ".json");

        //Help document 버젼 파일 존재여부 점검 - 존재한다면 
        if (await gfn_file_existence(oFS, LV_ROOT_PATH, "U4A_HELP_DOC_VER" + HEAD_DATA.DATA.VERSN + ".json")) {

            //Help Document 파일이 존재한다면 
            if (await gfn_file_existence(oFS, LV_ROOT_PATH, HEAD_DATA.DATA.LOCFN)) {
                REMOTE.shell.openPath(LV_DOWN_PATH); //파일 실행 

                //성공 처리 
                resolve({
                    RETCD: "S",
                    RTMSG: ""
                });
                return;

            }

        }


        //버젼 파일 생성
        try {
            oFS.writeFileSync(LV_VESN_PATH, JSON.stringify(HEAD_DATA.DATA), 'utf-8');
        } catch (error) {
            //Help Document 버젼 파일 생성중 오류 발생
            resolve({
                RETCD: "E",
                RTMSG: GS_MSG.M06
            });
            return;
        }


        //릴레이션 해더키 
        let LV_RINDX = HEAD_DATA.DATA.RINDX.toString().padStart(10, '0');
        let LV_RELKY = 0;


        //이전 Help Document 임시 파일 삭제
        await gfn_fileDel(oFS, LV_TMP_DOWN_PATH);


        //프로그레스 UI OPEN
        gfn_openProgressDialogOpen();

        // HEAD_DATA.DATA.SPCNT < TOTAL 



        //Help Document 다운로드 분할 Data 추출 
        function lfn_getdata() {

            LV_RELKY = LV_RELKY + 1;

            var LV_RELKY_X = LV_RELKY.toString().padStart(4, '0');
            LV_RELKY_X = LV_RINDX + LV_RELKY_X;

            var LV_URL = GV_HOST + "/zu4a_wbc/u4a_ipcmain/U4A_HELP_DOC_WS30?PRCCD=ITEM" + "&RELKY=" + LV_RELKY_X;
            var xhttp = new XMLHttpRequest();
            xhttp.onerror = (e) => {

                //프로그레스 ERROR 종료 처리 
                gfn_closeProgressDialog();

                resolve({
                    RETCD: "E",
                    RTMSG: GS_MSG.M01
                });
            }; //통신오류
            xhttp.ontimeout = () => {

                //프로그레스 ERROR 종료 처리 
                gfn_closeProgressDialog();

                resolve({
                    RETCD: "E",
                    RTMSG: GS_MSG.M01
                });

            }; //통신오류
            xhttp.onload = async (e) => {

                var status = e.target.getResponseHeader("u4a_status");

                switch (status) {
                    case "ERR": //오류일 경우

                        //프로그레스 ERROR 종료 처리 
                        gfn_closeProgressDialog();

                        //"Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({
                            RETCD: "E",
                            RTMSG: GS_MSG.M03
                        });
                        break;


                    case "END": //추출 완료                        

                        //프로그레스 ERROR 종료 처리 
                        gfn_closeProgressDialog();

                        //서버측에 응답코드가 실제 Data 미존재? 아님 처리 완료? 알수 없기에
                        //Temp 폴더에 파일여부를 확인해본다 미존재하면 서버측에 Data가 없는것으로 추측함
                        if (!await gfn_file_existence(oFS, LV_TMP_ROOT_PATH, HEAD_DATA.DATA.LOCFN)) {
                            resolve({
                                RETCD: "E",
                                RTMSG: GS_MSG.M03
                            });
                            return;

                        }

                        //기존 파일 삭제
                        await gfn_fileDel(oFS, LV_DOWN_PATH);


                        //Help Document 임시파일 => 실제 폴더에 이관
                        await gfn_FileMove(oFS, LV_DOWN_PATH, LV_TMP_DOWN_PATH);


                        //Help Document 임시 파일 삭제
                        await gfn_fileDel(oFS, LV_TMP_DOWN_PATH);


                        //Help Document 실행
                        REMOTE.shell.openPath(LV_DOWN_PATH);


                        //정상처리 
                        resolve({
                            RETCD: "S",
                            RTMSG: GS_MSG.M05
                        });

                        break;

                    case "RUN": //추출 진행정 ..

                        //Help Document 다운로드 분할 Data 다운로드
                        var LS_RET = await lfn_download(e.target.response, LV_TMP_DOWN_PATH);
                        if (LS_RET.RETCD === "E") {

                            //프로그레스 ERROR 종료 처리                             
                            gfn_closeProgressDialog();

                            resolve(LS_RET);
                            return;
                        }

                        //프로그레스바 증가 로직삽입
                        gfn_setProgressbar(LV_RELKY, HEAD_DATA.DATA.SPCNT);

                        //[재수행] Help Document 다운로드 분할 Data 추출 
                        lfn_getdata();

                        break;

                    default: //오류로 간주

                        //프로그레스 ERROR 종료 처리 
                        gfn_closeProgressDialog();

                        //"Help Document 분할 파일정보를 가져오는 과정에서 오류가 발생하였습니다."
                        resolve({
                            RETCD: "E",
                            RTMSG: GS_MSG.M03
                        });
                        break;

                }

            };

            xhttp.open("GET", LV_URL, true);
            xhttp.withCredentials = true;
            xhttp.responseType = 'arraybuffer';
            xhttp.send();


        } //lfn_getdata


        //분할 다운로드
        async function lfn_download(BIN, PATH) {
            return new Promise((resolve, reject) => {
                oFS.appendFile(PATH, Buffer.from(BIN), function (err) {

                    if (err) {
                        //Help Document 다운로드 처리 과정에서 오류 발생
                        resolve({
                            RETCD: "E",
                            RTMSG: GS_MSG.M04
                        });
                        return;
                    }

                    resolve({
                        RETCD: "S",
                        RTMSG: ""
                    });

                });

            });
        } //lfn_download


        //Help Document Down 처리 시작
        lfn_getdata();


    }); //return new Promise( async (resolve, reject)


}; //exports.HelpDocDown