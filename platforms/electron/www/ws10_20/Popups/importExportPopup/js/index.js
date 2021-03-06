const oAPP = {
    onStart: function () {
        this.remote = require('@electron/remote');
        this.ipcRenderer = require('electron').ipcRenderer;
        this.fs = this.remote.require('fs');
        this.path = this.remote.require('path');
        this.oWIN = oAPP.remote.getCurrentWindow();
        this.FilePath = "";
        this.APPID = "";
        this.SERVPATH = "";
        this.BROWSKEY = "";
        this.SHELL = this.remote.shell;
        this.oIMG = document.getElementById("LOAD_IMG");

        //WS Main 에서 호출받은 기본 I/F Data 
        this.ipcRenderer.on('export_import-INITDATA', (event, IF_DATA) => {

            this.BROWSKEY = IF_DATA.BROWSKEY;
            this.SERVPATH = IF_DATA.SERVPATH;

            switch (IF_DATA.PRCCD) {
                case "IMPORT": // U4A Application 등록 
                    oAPP.onIMPORT();
                    break;

                case "EXPORT": // U4A Application 다운
                    oAPP.onEXPORT(IF_DATA.APPID);
                    break;

                default:
                    oAPP.oWIN.close();
                    break;
            }


        });


    },
    onIMPORT: () => {
        //======================================================//
        // U4A Application 등록 
        //======================================================//  

        //로딩 이미지 활성
        oAPP.oIMG.src = "img/flying.gif";
        oAPP.oIMG.style.width = "350px";
        oAPP.oIMG.style.display = "";

        let options = {
            // See place holder 1 in above image
            title: "U4A Application Import",

            // See place holder 4 in above image
            filters: [{
                name: 'U4A Application',
                extensions: ['u4a', 'U4A']
            }],
            properties: ['openFile']
        };

        //file 선택 팝업 실행 
        oAPP.remote.dialog.showOpenDialog(oAPP.oWIN, options).then(result => {

            if (result.canceled) {
                oAPP.oWIN.close();
            }

            oAPP.FilePath = result.filePaths[0];

            //upload 
            oAPP.fs.readFile(oAPP.FilePath, null, function (err, data) {

                if (err) {
                    oAPP.remote.dialog.showErrorBox('An error has occurred', 'There is a problem with the uploaded file. Please try again.');
                    oAPP.oWIN.close();

                }

                let sURL = oAPP.path.join(oAPP.SERVPATH, "app_export_import?ACTCD=IMPORT"),
                    oformData = new FormData();

                var oBin = new Blob([Buffer.from(data)]);
                oformData.append('files', oBin, oAPP.path.basename(oAPP.FilePath));
                oBin = null;

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {

                    if (xhr.readyState == XMLHttpRequest.DONE) {

                        try {
                            //서버에서 요청받은 Data 
                            var sData = JSON.parse(xhr.response);

                            //오류 발생?
                            if (sData.RETCD === "E") {
                                oAPP.remote.dialog.showErrorBox('An error has occurred', sData.RTMSG);
                                oAPP.oWIN.close();
                            }

                        } catch (e) {
                            //오류 발생?
                            oAPP.remote.dialog.showErrorBox('An error has occurred', 'Error updating IMPORT server response');
                            oAPP.oWIN.close();

                        }

                        //정상처리 메시지 
                        oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-IMPORT`, {
                            APPID: sData.APPID,
                            RTMSG: sData.RTMSG
                        });

                        //창 종료 
                        setTimeout(() => {
                            oAPP.oWIN.close();
                        }, 500);


                    }

                };

                xhr.open('POST', sURL, true);
                xhr.send(oformData);


            });


        }).catch(err => {
            console.log(err);
            oAPP.oWIN.close();

        });


    },
    onEXPORT: (APPID) => {
        //======================================================//
        // U4A Application 다운
        //======================================================// 

        if (APPID === "") {

            oAPP.remote.dialog.showErrorBox('An error has occurred', 'Select the download destination app id');
            oAPP.oWIN.close();

        }

        //로딩 이미지 활성
        oAPP.oIMG.src = "img/flying.gif";
        oAPP.oIMG.style.width = "350px";
        oAPP.oIMG.style.display = "";

        //Application ID 광역 할당 
        oAPP.APPID = APPID;

        // 디렉토리 선택 팝업 옵션 설정 
        let options = {
            // See place holder 1 in above image
            title: "U4A Application Export - " + oAPP.APPID,

            // 폴더 
            properties: ['openDirectory', '']
        };

        //file 선택 팝업 실행 
        oAPP.remote.dialog.showOpenDialog(oAPP.oWIN, options).then(result => {

            if (result.canceled) {
                oAPP.oWIN.close();
            }

            //저장 파일 경로 설정 
            oAPP.FilePath = result.filePaths[0];
            oAPP.FilePath = oAPP.path.join(oAPP.FilePath, `${oAPP.APPID}.U4A`);

            try {
                oAPP.fs.statSync(oAPP.FilePath);
                var IsfileExt = true;
            } catch (error) {
                var IsfileExt = false;

            }

            //기존 파일이 존재한다면 ..
            if (IsfileExt) {

                var LpopMsg = "Same file exists Do you ignore the existing file and proceed?";
                var Ret = oAPP.remote.dialog.showMessageBoxSync(oAPP.oWIN, {
                    type: "question",
                    message: LpopMsg,
                    buttons: ['YES', 'NO']
                });
                if (Ret !== 0) {
                    oAPP.oWIN.close();
                }

            }

            let sURL = oAPP.path.join(oAPP.SERVPATH, `app_export_import?ACTCD=EXPORT&APPID=${oAPP.APPID}`);

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {

                if (xhr.readyState == XMLHttpRequest.DONE) {

                    try {
                        //서버에서 요청받은 Data 
                        var sData = JSON.parse(xhr.response);

                        //오류 발생?
                        if (sData.RETCD === "E") {
                            oAPP.remote.dialog.showErrorBox('An error has occurred', sData.RTMSG);
                            oAPP.oWIN.close();
                        }

                    } catch (e) {

                        if (xhr.getResponseHeader('RETCD') !== "S") {
                            oAPP.remote.dialog.showErrorBox('An error has occurred', 'During the download process there is a critical problem');
                            oAPP.oWIN.close();
                            return;
                        }

                        var Lmsg = xhr.getResponseHeader('RTMSG');

                        var oBuff = Buffer.from(xhr.response);
                        oAPP.fs.writeFileSync(oAPP.FilePath, oBuff, null, function (err) {});

                        // 파일 다운받은 폴더를 오픈한다.
                        oAPP.SHELL.showItemInFolder(oAPP.FilePath);

                        oAPP.ipcRenderer.send(`${oAPP.BROWSKEY}--export_import-EXPORT`, {
                            RETCD: "S",
                            RTMSG: Lmsg
                        });

                        setTimeout(() => {
                            oAPP.oWIN.close();
                        }, 500);

                    }


                }

            };

            xhr.open('GET', sURL, true);
            xhr.responseType = "arraybuffer";
            xhr.send(null);


        });

    }


};

//Device ready 
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    oAPP.onStart();

}