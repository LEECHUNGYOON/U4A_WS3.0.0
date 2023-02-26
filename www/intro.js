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
        REMOTEMAIN = REMOTE.require('@electron/remote/main'),
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),

        FS = REMOTE.require('fs-extra'),
        REGEDIT = require('regedit'),
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        WSUTIL = parent.require(PATHINFO.WSUTIL),
        SETTINGS = require(PATHINFO.WSSETTINGS),
        RANDOM = require("random-key");

    const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
    REGEDIT.setExternalVBSLocation(vbsDirectory);

    oAPP.fn.fnOnDeviceReady = function () {

        // 현재 버전 보여주기
        oAPP.fn.fnDisplayCurrentVersion();

        oAPP.fn.fnOnStart();

    }; // end of oAPP.fn.fnOnDeviceReady     

    oAPP.fn.fnOnStart = async () => {

        // 레지스트리 관련작업
        await _registryRelated();

        // Usp 기본 패턴 파일을 설치폴더 경로에 옮기기
        await _uspPatternFileDown();

        // 초기 설치(기본 폴더, vbs 옮기기 등등)
        oAPP.fn.setInitInstall(() => {

            // WS 세팅 정보
            var oWsSettings = oAPP.fn.fnGetSettingsInfo();

            // Trial 버전 여부 확인
            if (oWsSettings.isTrial) {

                setTimeout(() => {
                    oAPP.fn.fnTrialLogin();
                }, 3000);

                return;
            }

            setTimeout(() => {
                oAPP.fn.fnOpenServerList();
            }, 3000);

        });

    }; // end of oAPP.fn.fnOnStart   

    /************************************************************************
     * Trial 버전의 로그인 페이지로 이동한다.
     ************************************************************************/
    oAPP.fn.fnTrialLogin = () => {

        var oWsSettings = oAPP.fn.fnGetSettingsInfo(),
            oServerInfo = oWsSettings.trialServerInfo;

        const WINDOWSTATE = REMOTE.require('electron-window-state');

        // 창 크기 기본값 설정
        let mainWindowState = WINDOWSTATE({
            defaultWidth: 800,
            defaultHeight: 800
        });

        var SESSKEY = RANDOM.generate(40),
            BROWSERKEY = RANDOM.generate(10);

        // Browser Options..        
        var sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oDefaultOption = parent.require(sSettingsJsonPath),
            // oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow),
            oBrowserOptions = JSON.parse(JSON.stringify(oDefaultOption.browserWindow)),
            oWebPreferences = oBrowserOptions.webPreferences;

        oBrowserOptions.backgroundColor = "#1c2228";
        oBrowserOptions.backgroundColor = "#f7f7f7";

        // 브라우저 윈도우 기본 사이즈
        oBrowserOptions.x = mainWindowState.x;
        oBrowserOptions.y = mainWindowState.y;
        oBrowserOptions.width = mainWindowState.width;
        oBrowserOptions.height = mainWindowState.height;
        oBrowserOptions.opacity = 0.0;
        oWebPreferences.partition = SESSKEY;
        oWebPreferences.browserkey = BROWSERKEY;

        // 인트로 화면 닫기
        let oCurrWindow = REMOTE.getCurrentWindow();
        oCurrWindow.hide();

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 브라우저 윈도우 기본 사이즈 감지
        mainWindowState.manage(oBrowserWindow);

        oBrowserWindow.loadURL(PATHINFO.MAINFRAME);

        // oBrowserWindow.webContents.openDevTools();

        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oMetadata = {
                SERVERINFO: oServerInfo,
                EXEPAGE: "LOGIN",
                SESSIONKEY: SESSKEY,
                BROWSERKEY: BROWSERKEY
            };

            // 메타 정보를 보낸다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);

            oBrowserWindow.setOpacity(1.0);

            oCurrWindow.close();

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    }; // end of oAPP.fn.fnTrialLogin

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSettingsInfo = () => {

        // Browser Window option
        var oSettingsPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(oSettingsPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of fnGetSettingsInfo

    /************************************************************************
     * 현재 설치된 WS Version을 화면에 표시
     ************************************************************************/
    oAPP.fn.fnDisplayCurrentVersion = () => {

        let oVerTxt = document.getElementById("versionTxt");
        if (oVerTxt == null) {
            return;
        }

        // let oAppInfo = require("./package.json"),
        //     sVersion = oAppInfo.version;

        let sVersion = APP.getVersion();

        // WS 세팅 정보
        var oWsSettings = oAPP.fn.fnGetSettingsInfo();

        // Trial 버전 여부 확인
        if (oWsSettings.isTrial) {
            oVerTxt.innerHTML = `Trial version`;
            return;
        }

        oVerTxt.innerHTML = `version ${sVersion}`;

    }; // end of oAPP.fn.fnDisplayCurrentVersion  

    /************************************************************************
     * 서버 리스트를 오픈한다.
     ************************************************************************/
    oAPP.fn.fnOpenServerList = function () {

        // Electron Browser Default Options        
        var sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oBrowserOptions = require(sSettingsJsonPath),
            oBrowserWindow = JSON.parse(JSON.stringify(oBrowserOptions.browserWindow));

        oBrowserWindow.backgroundColor = "#1c2228";
        oBrowserWindow.webPreferences.OBJTY = "SERVERLIST";
        oBrowserWindow.show = false;
        oBrowserOptions.opacity = 0.0;

        // 인트로 화면 닫기
        let oCurrWindow = REMOTE.getCurrentWindow();
        oCurrWindow.hide();

        // Server List 화면 오픈
        let oWin = new REMOTE.BrowserWindow(oBrowserWindow);
        REMOTEMAIN.enable(oWin.webContents);

        // 브라우저 상단 메뉴 없애기
        oWin.setMenu(null);

        // if (process.env.COMPUTERNAME.toUpperCase().startsWith("YOON") == true) {
        //     oWin.loadURL(PATHINFO.SERVERLIST_v2);
        // } else {
        //     oWin.loadURL(PATHINFO.SERVERLIST);
        // }

        // oWin.loadURL(PATHINFO.SERVERLIST);

        oWin.loadURL(PATHINFO.SERVERLIST_v2);

        // server list v2
        // oWin.webContents.openDevTools();
        // no build 일 경우에는 개발자 툴을 실행한다.

        // if (!APP.isPackaged) {
        //     oWin.webContents.openDevTools();
        // }

        oWin.webContents.on('did-finish-load', function () {

            oWin.webContents.send('window-id', oWin.id);

            oWin.setOpacity(1.0);

            oWin.show();

            oCurrWindow.close();

        });

        // oWin.once('ready-to-show', () => {
        //     oWin.show();
        // })

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

        // let oHelpDocuPromise = oAPP.fn.fnInstallHelpDocument();

        // aPromise.push(oHelpDocuPromise);

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

    // /************************************************************************
    //  * U4A help document를 로컬에 설치한다.
    //  ************************************************************************/
    // oAPP.fn.fnInstallHelpDocument = () => {

    //     return new Promise((resolve, reject) => {

    //         let lf_err = (err) => {
    //             reject(err.toString());
    //         },

    //             // 파일 압축 풀기 성공 콜백
    //             lf_FileExtractSuccess = () => {
    //                 resolve();
    //             },

    //             // copy 성공 콜백
    //             lf_CopySuccess = () => {

    //                 oAPP.fn.fnCopyHelpDocFileExtract()
    //                     .then(lf_FileExtractSuccess)
    //                     .catch(lf_err);
    //             };

    //         // help docu file 복사    
    //         oAPP.fn.fnCopyHelpDocFile()
    //             .then(lf_CopySuccess)
    //             .catch(lf_err);

    //     }); // end of promise

    // }; // end of oAPP.fn.fnInstallHelpDocument

    // /************************************************************************
    //  * U4A help document 파일을 로컬에 복사
    //  ************************************************************************/
    // oAPP.fn.fnCopyHelpDocFile = () => {

    //     return new Promise((resolve, reject) => {

    //         var oSettingsPath = PATHINFO.WSSETTINGS,
    //             oSettings = require(oSettingsPath),
    //             sHelpDocOriginFile = PATH.join(APPPATH, oSettings.path.u4aHelpDocFilePath),
    //             sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

    //         //1. Document File을 복사한다.
    //         FS.copy(sHelpDocOriginFile, sHelpDocTargetPath, {
    //             overwrite: true,
    //         }).then(function () {

    //             resolve();

    //         }).catch(function (err) {
    //             reject(err.toString());
    //         });

    //     });

    // }; // end of oAPP.fn.fnCopyHelpDocFile

    // /************************************************************************
    //  * U4A help document 파일을 로컬에 복사
    //  ************************************************************************/
    // oAPP.fn.fnCopyHelpDocFileExtract = () => {

    //     return new Promise((resolve, reject) => {

    //         var oSettingsPath = PATHINFO.WSSETTINGS,
    //             oSettings = require(oSettingsPath),
    //             sHelpDocFolderPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFolderPath),
    //             sHelpDocTargetPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFilePath);

    //         let ZIP = require("zip-lib"),
    //             UNZIP = new ZIP.Unzip({
    //                 // Called before an item is extracted.
    //                 onEntry: function (event) {
    //                     zconsole.log(event.entryCount, event.entryName);
    //                 }
    //             });

    //         UNZIP.extract(sHelpDocTargetPath, sHelpDocFolderPath, {
    //             overwrite: true
    //         })
    //             .then(function () {

    //                 resolve();

    //             }, function (err) {

    //                 reject(err.toString());

    //             });

    //     }); // end of promise

    // }; // end of oAPP.fn.fnCopyHelpDocFileExtract








    /**
     * Private functions
     */

    /************************************************************************
     * 레지스트리 키의 List를 구한다.
     ************************************************************************/
    function _getRegeditList(sRegPath) {

        return new Promise((resolve) => {

            REGEDIT.list(sRegPath, (err, result) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTDATA: result
                });

            });

        });

    } // end of _getRegeditList

    /************************************************************************
     * 레지스트리의 키값 생성
     ************************************************************************/
    function _regeditCreateKey(aKeys) {

        return new Promise((resolve) => {

            REGEDIT.createKey(aKeys, (err) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "success!!"
                });

            });


        });

    } // end of _regeditCreateKey

    /************************************************************************
     * 레지스트리의 값을 지우는 function
     ************************************************************************/
    function _regeditDeleteValue(aValues) {

        return new Promise((resolve) => {

            REGEDIT.deleteValue(aValues, (err) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "success!!"
                });

            });

        });

    } // end of _deleteRegeditKey

    /************************************************************************
     * 레지스트리의 cSession에 가비지가 있으면 클리어
     ************************************************************************/
    function _cSessionClear() {

        return new Promise(async (resolve) => {

            let sRegPath = SETTINGS.regPaths,
                cSessionPath = sRegPath.cSession;

            let oRegData = await _getRegeditList(cSessionPath);
            if (oRegData.RETCD == "E") {
                resolve();
                return;
            }

            let cSessionReg = oRegData.RTDATA[cSessionPath];
            if (!cSessionReg) {
                resolve();
                return;
            }

            let cSessionVal = cSessionReg.values,
                aValues = [];

            for (const i in cSessionVal) {
                aValues.push(`${cSessionPath}\\${i}`);
            }

            if (aValues.length == 0) {
                resolve();
                return;
            }

            // cSession에 있는 값들을 지운다.
            await _regeditDeleteValue(aValues);

            resolve();

        });

    } // end of _cSessionClear

    /************************************************************************
     * 초기 레지스트리 폴더 생성
     ************************************************************************/
    function _initCreateRegistryFolders() {

        return new Promise(async (resolve) => {

            let aKeys = [];

            let sRegPath = SETTINGS.regPaths;

            aKeys.push(sRegPath.systems);
            aKeys.push(sRegPath.LogonSettings);

            await _regeditCreateKey(aKeys);

            resolve();

        });

    } // end of _initCreateRegistryFolders

    /************************************************************************
     * 레지스트리 관련작업
     ************************************************************************/
    async function _registryRelated() {

        return new Promise(async (resolve) => {

            // 초기 레지스트리 폴더 생성
            await _initCreateRegistryFolders();

            // 레지스트리의 cSession에 가비지값 제거
            await _cSessionClear();


            /**
             * 레지스트리관련 로직 확장은 아래에 쭉 추가하면 됨
             * .
             * .
             * .
             * .
             * 
             */






            resolve();

        });


    } // end of _checkRegistry

    /************************************************************************
     * Usp 기본 패턴 파일을 설치폴더 경로에 옮기기
     ************************************************************************/
    function _uspPatternFileDown() {

        return new Promise(async (resolve) => {

            let sPattnFolderSourcePath = PATHINFO.PATTERN_ROOT,
                sPattnFolderTargetPath = PATH.join(USERDATA, "usp", "pattern", "files"),
                oOptions = {
                    overwrite: true,
                };

            const isExists = FS.existsSync(sPattnFolderTargetPath);
            if (!isExists) {
                FS.mkdirSync(sPattnFolderTargetPath, { recursive: true });
            }

            var ncp = require('ncp').ncp;

            ncp.limit = 16; // 한번에 처리하는 수?  

            ncp(sPattnFolderSourcePath, sPattnFolderTargetPath, function (err) {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: ""
                });

            });

            // // 앱내에 있는 USP 기본 패턴 폴더를 앱 설치 폴더내에 복사한다.
            // await WSUTIL.fsCopy(sPattnFolderSourcePath, sPattnFolderTargetPath, oOptions);

            resolve();

        });

    } // end of _uspPatternFileDown


    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

})();