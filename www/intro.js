/**************************************************************************
 * intro.js
 * ************************************************************************
 * - Application Intro
 **************************************************************************/

(function () {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};

    const
        REMOTE = require('@electron/remote'),
        autoUpdater = REMOTE.require("electron-updater").autoUpdater,
        REMOTEMAIN = REMOTE.require('@electron/remote/main'),
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),
        FS = REMOTE.require('fs-extra'),
        IPCRENDERER = require('electron').ipcRenderer,
        OCTOKIT = REMOTE.require("@octokit/core").Octokit,
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js"));

    var oProgressBar = document.getElementById("progressBar_dynamic"),
        bIsPackaged = APP.isPackaged;

    oAPP.fn.fnOnDeviceReady = function () {

        // 현재 버전 보여주기
        oAPP.fn.fnDisplayCurrentVersion();

        // on-premise 인지 CDN인지 확인
        oAPP.fn.fnConnectionGithub().then((oResult) => {

            IPCRENDERER.send("setCDN", oResult.ISCDN);

            oAPP.fn.fnOnStart();

        });

    }; // end of oAPP.fn.fnOnDeviceReady 

    oAPP.fn.fnOnStart = () => {

        // 초기 설치(기본 폴더, vbs 옮기기 등등)
        oAPP.fn.setInitInstall(() => {

            setTimeout(() => {
                oAPP.fn.fnOpenServerList();
            }, 3000);

        });

    }; // end of oAPP.fn.fnOnStart

    oAPP.fn.fnConnectionGithub = () => {

        return new Promise((resolve, reject) => {
            
            const octokit = new OCTOKIT({
                auth: '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'
            });

            octokit.request("https://api.github.com/repos/LEECHUNGYOON/U4A_WS3.0.0/releases/latest", {
                org: "octokit", //기본값  
                type: "Public", //github repositories type private /  Public 
            }).then((data) => {                

                resolve({
                    ISCDN: "X"
                });

            }).catch((err) => {

                resolve({
                    ISCDN: ""
                });

            });

        });

    }; // end of oAPP.fn.fnConnectionGithub

    /************************************************************************
     * 현재 설치된 WS Version을 화면에 표시
     ************************************************************************/
    oAPP.fn.fnDisplayCurrentVersion = () => {

        let oVerTxt = document.getElementById("versionTxt");
        if (oVerTxt == null) {
            return;
        }

        let oAppInfo = require("./package.json"),
            sVersion = oAppInfo.version;

        oVerTxt.innerHTML = `version ${sVersion}`;

    }; // end of oAPP.fn.fnDisplayCurrentVersion

    /************************************************************************
     * WS Version을 확인한다.
     ************************************************************************/
    oAPP.fn.fnCheckVersion = () => {

        return new Promise((resolve, reject) => {

            /* Updater Event 설정 ======================================================*/

            autoUpdater.on('checking-for-update', () => {

                // status Text
                oAPP.fn.fnSetStatusText("Checking for updates...");

                console.log("업데이트 확인 중...");

            });

            autoUpdater.on('update-available', (info) => {

                // 프로그래스 바를 활성화 한다.
                let oProgressBar = document.getElementById("progressBar");
                if (oProgressBar == null) {
                    return;
                }

                oProgressBar.classList.remove("invisible");

                console.log("업데이트가 가능합니다.");

            });

            autoUpdater.on('update-not-available', (info) => {

                resolve();

                console.log("현재 최신버전입니다.");

            });

            autoUpdater.on('error', (err) => {

                resolve();

                console.log('에러가 발생하였습니다. 에러내용 : ' + err);

            });

            autoUpdater.on('download-progress', (progressObj) => {

                // let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;

                // log_message = log_message + ' - 현재 ' + progressObj.percent + '%';

                // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';

                let sPer = `${parseFloat(progressObj.percent).toFixed(2)}%`;

                oAPP.fn.fnSetStatusText(`downloading... ${sPer} `);

                oProgressBar.style.width = sPer;

                // console.log(log_message);

            });

            autoUpdater.on('update-downloaded', (info) => {

                console.log('업데이트가 완료되었습니다.');

                oAPP.fn.fnSetStatusText(`Update Complete! Restarting...`);

                setTimeout(() => {

                    autoUpdater.quitAndInstall(); //<--- 자동 인스톨 

                }, 1000);


            });

            autoUpdater.checkForUpdates();

        });

    }; // oAPP.fn.fnCheckVersion

    /************************************************************************
     * 버전 체크 시 현재 상태 텍스트 적용
     * **********************************************************************
     * @param {String} sText 
     * - 상태 텍스트
     ************************************************************************/
    oAPP.fn.fnSetStatusText = (sText) => {

        let oStatusTxt = document.getElementById("statusText");
        if (oStatusTxt == null) {
            return;
        }

        oStatusTxt.innerHTML = sText;

    }; // end of oAPP.fn.fnSetStatusText

    /************************************************************************
     * 서버 리스트를 오픈한다.
     ************************************************************************/
    oAPP.fn.fnOpenServerList = function () {

        // Electron Browser Default Options        
        var sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oBrowserOptions = require(sSettingsJsonPath),
            oBrowserWindow = JSON.parse(JSON.stringify(oBrowserOptions.browserWindow));

        oBrowserWindow.backgroundColor = "#1c2228";
        oBrowserWindow.opacity = 0.0;
        // oBrowserWindow.show = false;

        // 인트로 화면 닫기
        let oCurrWindow = REMOTE.getCurrentWindow();
        oCurrWindow.hide();

        // Server List 화면 오픈
        let oWin = new REMOTE.BrowserWindow(oBrowserWindow);
        REMOTEMAIN.enable(oWin.webContents);

        // 브라우저 상단 메뉴 없애기
        oWin.setMenu(null);

        oWin.loadURL(PATHINFO.SERVERLIST);

        // oWin.webContents.openDevTools();

        oWin.webContents.on('did-finish-load', function () {

            oWin.webContents.send('window-id', oWin.id);

            oWin.setOpacity(1.0);

            oCurrWindow.close();

        });

        oWin.on('closed', () => {
            oWin = null;
            oCurrWindow.close();
        });

    };

    /************************************************************************
     * WS 초기 설치
     ************************************************************************
     * 1. WS 구동에 필요한 폴더를 생성 및 파일 복사를 수행
     * 2. 설치 경로는 WS가 설치된 userData
     *    예) C:\Users\[UserName]\AppData\Roaming\com.u4a_ws.app
     ************************************************************************/
    oAPP.fn.setInitInstall = function (fnCallback) {

        var oSettingsPath = PATHINFO.WSSETTINGS,
            oSettings = require(oSettingsPath),
            aPaths = oSettings.requireFolders, // 필수 폴더 리스트
            aFiles = oSettings.requireFiles, // 필수 파일 리스트
            iFileLength = aFiles.length,
            iPathLength = aPaths.length,
            sAppPath = APP.getPath("userData"); // 앱이 설치된 경로

        var aPromise = [],
            oMkdirOptions = {
                recursive: true, // 상위 폴더까지 자동 생성
                mode: 0o777 // 생성시 권한 부여
            };

        // 필수 폴더를 생성한다.
        for (var i = 0; i < iPathLength; i++) {

            var sPath = aPaths[i],
                sFullPath = PATH.join(sAppPath, sPath);

            if (FS.existsSync(sFullPath)) {
                continue;
            }

            aPromise.push(new Promise(function (resolve, reject) {

                FS.mkdir(sFullPath, oMkdirOptions, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve();

                });

            }));

        }

        // 필수 파일을 생성한다.
        for (var j = 0; j < iFileLength; j++) {

            var sFileName = aFiles[j],
                sFileFullPath = PATH.join(sAppPath, sFileName);

            if (FS.existsSync(sFileFullPath)) {
                continue;
            }

            aPromise.push(new Promise((resolve, reject) => {

                FS.writeFile(sFileFullPath, JSON.stringify(""), {
                    encoding: "utf8",
                    mode: 0o777 // 올 권한
                }, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve();

                });

            }));

        }

        let oHelpDocuPromise = oAPP.fn.fnInstallHelpDocument();

        aPromise.push(oHelpDocuPromise);

        // 상위 폴더를 생성 후 끝나면 실행
        Promise.all(aPromise).then(function (values) {

            oAPP.fn.copyVbsToLocalFolder(function (oResult) {

                if (oResult.RETCD == 'E') {
                    alert(oResult.MSG);
                    return;
                }

                fnCallback();

            });

        }).catch(function (err) {

            alert(err.toString());

        });

    }; // end of oAPP.fn.setInitInstall    

    /************************************************************************
     * build된 폴더에서 vbs 파일을 로컬 폴더로 복사한다.
     ************************************************************************/
    oAPP.fn.copyVbsToLocalFolder = function (fnCallback) {

        var sVbsFolderPath = PATH.join(APPPATH, "vbs"),
            aVbsFolderList = FS.readdirSync(sVbsFolderPath),
            iFileCount = aVbsFolderList.length;

        if (iFileCount <= 0) {
            return;
        }

        var oResult = {
            RETCD: "",
            MSG: ""
        };

        var aPromise = [];

        for (var i = 0; i < iFileCount; i++) {

            var sFile = aVbsFolderList[i];
            if (!sFile.endsWith(".vbs")) {
                continue;
            }

            var sVbsPath = sVbsFolderPath + "\\" + sFile;

            var oPromise = oAPP.fn.copyVbsPromise(sFile, sVbsPath);

            aPromise.push(oPromise);

        }

        Promise.all(aPromise).then((aValues) => {

            oResult.RETCD = 'S';

            fnCallback(oResult);

        }).catch(function (err) {

            oResult.RETCD = 'E';
            oResult.MSG = err.toString();

            fnCallback(oResult);

        });

    }; // end of oAPP.fn.copyVbsToLocalFolder

    oAPP.fn.copyVbsPromise = function (sFile, sVbsOrigPath) {

        var oSettingsPath = PATHINFO.WSSETTINGS,
            oSettings = require(oSettingsPath),
            sUserDataPath = APP.getPath("userData"),
            sVbsFolderPath = oSettings.vbs.rootPath,
            sVbsFullPath = PATH.join(sUserDataPath, sVbsFolderPath, sFile);

        return new Promise((resolve, reject) => {

            FS.copy(sVbsOrigPath, sVbsFullPath, {
                overwrite: true,
            }).then(function () {

                resolve("X");

            }).catch(function (err) {

                reject(err.toString());

            });

        });

    }; // end of oAPP.fn.copyVbsPromise

    /************************************************************************
     * U4A help document를 로컬에 설치한다.
     ************************************************************************/
    oAPP.fn.fnInstallHelpDocument = () => {

        return new Promise((resolve, reject) => {

            let lf_err = (e) => {
                    reject(err.toString());
                },

                // 파일 압축 풀기 성공 콜백
                lf_FileExtractSuccess = () => {
                    resolve();
                },

                // copy 성공 콜백
                lf_CopySuccess = () => {

                    oAPP.fn.fnCopyHelpDocFileExtract()
                        .then(lf_FileExtractSuccess)
                        .catch(lf_err);
                };

            // help docu file 복사    
            oAPP.fn.fnCopyHelpDocFile()
                .then(lf_CopySuccess)
                .catch(lf_err);

        }); // end of promise

    }; // end of oAPP.fn.fnInstallHelpDocument

    /************************************************************************
     * U4A help document 파일을 로컬에 복사
     ************************************************************************/
    oAPP.fn.fnCopyHelpDocFile = () => {

        return new Promise((resolve, reject) => {

            var oSettingsPath = PATHINFO.WSSETTINGS,
                oSettings = require(oSettingsPath),
                sHelpDocOriginFile = PATH.join(APPPATH, oSettings.path.u4aHelpDocFilePath),
                sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

            //1. Document File을 복사한다.
            FS.copy(sHelpDocOriginFile, sHelpDocTargetPath, {
                overwrite: true,
            }).then(function () {

                resolve();

            }).catch(function (err) {
                reject(err.toString());
            });

        });

    }; // end of oAPP.fn.fnCopyHelpDocFile

    /************************************************************************
     * U4A help document 파일을 로컬에 복사
     ************************************************************************/
    oAPP.fn.fnCopyHelpDocFileExtract = () => {

        return new Promise((resolve, reject) => {

            var oSettingsPath = PATHINFO.WSSETTINGS,
                oSettings = require(oSettingsPath),
                sHelpDocFolderPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFolderPath),
                sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

            let ZIP = require("zip-lib"),
                UNZIP = new ZIP.Unzip({
                    // Called before an item is extracted.
                    onEntry: function (event) {
                        console.log(event.entryCount, event.entryName);
                    }
                });

            UNZIP.extract(sHelpDocTargetPath, sHelpDocFolderPath, {
                    overwrite: true
                })
                .then(function () {

                    resolve();

                }, function (err) {

                    reject(err.toString());

                });

        }); // end of promise

    }; // end of oAPP.fn.fnCopyHelpDocFileExtract

    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);
})();