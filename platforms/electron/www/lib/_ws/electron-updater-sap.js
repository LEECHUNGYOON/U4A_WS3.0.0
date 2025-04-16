//=================
// 확인 사항!!!
// oAPP.remote <-- 확인 
//__ofs = oAPP.remote.require('fs'); <-- 확인 
//oAPP.remote.require('electron').shell.openExternal(__downPath); <-- 확인 

// sap 서버 통신 url 확인 
//let _sURL_V = "http://27.102.205.26:8000/ZU4A_WBC/UPDATE_CHECK?sap-user=shhong&sap-password=2wsxzaq1!", //버젼 파일 get 
//    _sURL_U = "http://27.102.205.26:8000/ZU4A_WBC/WS_UPDATE_FILE_GET";    //update 파일 get 

//==================



//----------------------------------------------------------------//
// 로컬 전역 변수 
//----------------------------------------------------------------//

const
    HOST = parent.getServerHost(),
    PATH = parent.PATH,
    REMOTE = parent.REMOTE;

let __updateFilename = "",
    __appVer = "",
    __oWriter,
    __ofs,
    __jobCnt = 0, //sap 서버 호출 수행 count
    __total = 0, //스트림 다운 전체 건수
    __downPath = "", //업데이트 파일(exe) 다운로드 경로
    __downFldPath = ""; //업데이트 파일(exe) 다운로드 폴더 경로

// let __sap_id_pw = "sap-user=shhong&sap-password=2wsxzaq1!"; //WS3.0 이관후 삭제대상!!!
let __sap_id_pw = ""; //WS3.0 이관후 삭제대상!!!

// sap 서버 통신 url 
let _sURL_V = `${HOST}/zu4a_wbc/u4a_ipcmain/update_check`,
    _sURL_U = `${HOST}/zu4a_wbc/u4a_ipcmain/ws_update_file_get`;

//----------------------------------------------------------------//
// 로컬 전역 펑션 
//----------------------------------------------------------------//

//procces event call
function __fireEvent(node, eventName, param) {

    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9) {
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }
    if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";
        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
            case "checking-for-update-sap": //업데이트 확인 
            case "update-available-sap": //업데이트 가능 
            case "update-not-available-sap": //최신버젼 
            case "download-progress-sap": //다운로드중 ..
            case "update-downloaded-sap": //다운로드중 완료 
            case "update-error-sap": //오류  
                eventClass = "HTMLEvents";
                break;
            default:
                throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                break;
        }
        var event = doc.createEvent(eventClass);
        event.params = param;

        var bubbles = eventName == "change" ? false : true;
        event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.
        event.synthetic = true; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
    } else if (node.fireEvent) {
        // IE-old school style
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
    }
}


//get update file - exe
function __getUpdateFile() {

    //다운로드 경로 
    if (__downPath === "") {
        __downPath = PATH.join(__downFldPath, __updateFilename);

    }

    var Lfirst = "";
    if (__jobCnt === 0) {

        //처음 실행 flg 
        Lfirst = "X";

        //이전 파일 삭제 
        try {
            __ofs.unlinkSync(__downPath);
        } catch (err) {

        }


    }

    //분활 처리 count
    __jobCnt++;

    var url = _sURL_U +
        "?JOBCNT=" + __jobCnt +
        "&FIRST=" + Lfirst +
        "&" +
        __sap_id_pw;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState == XMLHttpRequest.DONE) {

            if (xhr.status !== 200) {
                __jobCnt = 0;
                __total = 0;
                //업데이트 오류 발생 ..event 핸들러 call
                __fireEvent(document, 'update-error-sap', {
                    message: "허용하지 않는 서비스 호출됨!! 서비스 url 확인바람"
                });
                return;

            }

            try {

                //정상적으로 파싱된다는건 서버측에서 처리 오류 메시지를 리턴  의미임 !!
                var sRET = JSON.parse(xhr.response);
                __jobCnt = 0;
                __total = 0;
                //업데이트 오류 발생 ..event 핸들러 call
                // __fireEvent(document, 'update-error-sap', sRET);
                
                // 20240708 soccerhs: 오류 발생시 오류 메시지 데이터를 공통 구조로 매핑함
                __fireEvent(document, 'update-error-sap', {
                    message: sRET.RTMSG
                });
                return;

            } catch (err) {

                if (xhr.getResponseHeader('ACTCD') === "END") {
                    __jobCnt = 0;
                    __total = 0;
                    __WriteStream(xhr.response, 'X');

                    //다운로드중 완료 ..event 핸들러 call
                    __fireEvent(document, 'update-downloaded-sap', {
                        message: "다운로드 완료"
                    });


                    return;

                }

                //전체 건수 
                if (__total == 0) {
                    __total = Number(xhr.getResponseHeader('TOTAL'));
                }

                //다운로드중 ..event 핸들러 call
                __fireEvent(document, 'download-progress-sap', {
                    TOTAL: __total,
                    jobCnt: __jobCnt
                });

                __WriteStream(xhr.response, '');

            }

        }
    };


    xhr.send();

}


//pc 디렉토리 스트림형식 파일 down 
function __WriteStream(LBIN, ISEND) {

    if (ISEND === "X") {
        if (typeof __oWriter !== "undefined") {
            __oWriter.close();
            __oWriter = "undefined";
        }
        return;
    }


    //스트리밍 객체 생성 
    if (typeof __oWriter === "undefined") {
        __oWriter = __ofs.createWriteStream(__downPath);

    }

    var oBuff = Buffer.from(LBIN);
    __oWriter.write(oBuff, null, (err) => {
        if (err) {
            //업데이트 오류 발생 ..event 핸들러 call
            __fireEvent(document, 'update-error-sap', {
                message: "스트리밍 다운로드 오류발생"
            });
            return;

        }

        //sap 서버 업데이트 파일 요청 펑션 재수행 
        __getUpdateFile();

    });

};


//----------------------------------------------------------------//
// 메인 
//----------------------------------------------------------------//
exports.autoUpdaterSAP = {

    //이벤트 핸들러 등록 
    on: function (evtNM, cb) {
        document.addEventListener(evtNM, cb);

    },

    //== 점검 수행 ==
    checkForUpdates: function (appVer, oServerInfo) {

        __jobCnt = 0;
        __total = 0;
        __downPath = "";

        //현재 WS3.0 앱 버전 
        __appVer = appVer;

        //업데이트 파일 다운로드 폴더 경로 
        __downFldPath = PATH.join(parent.process.env.APPDATA, REMOTE.require('electron').app.name);

        //업데이트 확인 이벤트 수행 
        __fireEvent(document, 'checking-for-update-sap', {
            message: "check version"
        });

        var oFormData = new FormData();

        // if (oServerInfo && oServerInfo.HTTPONLY && oServerInfo.HTTPONLY == "1") {

        //     let oLogInData = oServerInfo.LOGIN;

        //     oFormData.append("sap-user", oLogInData.ID);
        //     oFormData.append("sap-password", oLogInData.PW);
        //     oFormData.append("sap-client", oLogInData.CLIENT);
        //     oFormData.append("sap-language", oLogInData.LANGU);

        // }

        var xhr = new XMLHttpRequest();

        xhr.open("POST", _sURL_V, true);
        // xhr.open("GET", _sURL_V, true);

        xhr.onreadystatechange = function (oEvent) {
            if (xhr.readyState == XMLHttpRequest.DONE) {

                try {
                    //정상적으로 파싱된다는건 서버측에서 처리 오류 메시지를 리턴받앗다는 의미임 !!
                    var sRET = JSON.parse(xhr.response);

                    //업데이트 오류 발생 
                    // __fireEvent(document, 'update-error-sap', sRET);

                    // 20240708 soccerhs: 오류 발생시 오류 메시지 데이터를 공통 구조로 매핑함
                    __fireEvent(document, 'update-error-sap', {
                        message: sRET?.RTMSG || ""
                    });

                    return;

                } catch (error) {

                    var YAML = REMOTE.require('yamljs');

                    //download exe update file name 
                    __updateFilename = xhr.getResponseHeader('UPDT_FNAME');

                    var nativeObject = YAML.parse(xhr.response);

                    //var appVER = "V1.0.4";//현재 app 버젼  oAPP.remote.app.getVersion()
                    var appVer = "";
                    var updVER = nativeObject.version; //등록되있는 서버 업데이트 버젼 

                    var regex = /[^0-9]/g;
                    appVer = Number(__appVer.replace(regex, "")); //현재 app 버젼  oAPP.remote.app.getVersion()
                    updVER = Number(updVER.replace(regex, "")); //등록되있는 서버 업데이트 버젼  

                    if (appVer < updVER) {
                        //업데이트 가능 
                        __fireEvent(document, 'update-available-sap', {
                            message: "업데이트가능"
                        });

                        __ofs = REMOTE.require('fs');

                        //get update file - exe
                        __getUpdateFile();

                    } else {
                        //최신버젼 
                        __fireEvent(document, 'update-not-available-sap', {
                            message: "최신버젼",
                            verInfo: {                                
                                appVer: appVer,
                                updVER : updVER
                            }
                        });

                    }

                }

            }

        };

        xhr.send(oFormData);

    },
    quitAndInstall: function () {

        if (__downPath !== "") {

            // 재실행 할 파일경로를 지정한다.
            REMOTE.app.relaunch({
                execPath: __downPath
            });

            // 앱을 종료한다.
            REMOTE.app.exit(0);
        }

    }

};