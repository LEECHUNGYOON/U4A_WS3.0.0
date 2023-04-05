/**************************************************************************
 * intro.js
 * ************************************************************************
 * - Application Intro
 **************************************************************************/
(function () {
    "use strict";

    let oAPP = {};
    oAPP.fn = {};
    oAPP.msg = {};

    const
        REMOTE = require('@electron/remote'),
        CURRWIN = REMOTE.getCurrentWindow(),
        REMOTEMAIN = REMOTE.require('@electron/remote/main'),
        APP = REMOTE.app,
        DIALOG = REMOTE.dialog,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),

        FS = REMOTE.require('fs-extra'),
        REGEDIT = require('regedit'),
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        WSUTIL = require(PATHINFO.WSUTIL),
        USP_UTIL = require(PATHINFO.USP_UTIL),
        RANDOM = require("random-key");

    const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
    REGEDIT.setExternalVBSLocation(vbsDirectory);

    oAPP.fn.fnOnDeviceReady = function () {

        oAPP.fn.fnOnStart();


    }; // end of oAPP.fn.fnOnDeviceReady

    function _fnwait() {

        return new Promise((resolve) => {

            setTimeout(() => {

                resolve();

            }, 3000);

        });

    }


    // function _test01() {
    //     return new Promise(async (resolve) => {

    //         debugger;

    //         var langu = await WSUTIL.getWsLanguAsync(); // ws에 저장된 언어 레지스트리에서 구하기
    //         var aa = WSUTIL.getWsMsgClsTxt(langu, "ZWSMSG_001", "000", "aa", "bb", "cc", "dd");


    //     });
    // }

    async function WLO_test() {

        debugger;

        let bIsExe1 = await WSUTIL.getWsWhiteListObjectAsync("UHA", "aaaa");

        debugger;

        let bIsExe2 = await WSUTIL.getWsWhiteListObjectAsync("U4A", "/U4A/WS000001|_GETMETA");

        debugger;

        let bIsExe3 = await WSUTIL.getWsWhiteListObjectAsync("UHA", "/U4A/WS000001|_GETMETA");

        debugger;

        let bIsExe4 = await WSUTIL.getWsWhiteListObjectAsync();

        debugger;

    }

    oAPP.fn.fnOnStart = async () => {

        // await _fnwait();

        // WLO_test();

        // return;

        oAPP.startTime = new Date().getTime();

        // ws setting Info를 UserData에 저장
        await _saveWsSettingsInfo(); // <--- 반드시 여기에 위치해야함!!

        // 현재 버전 보여주기
        oAPP.fn.fnDisplayCurrentVersion();

        // WS Settings 에 있는 레지스트리 저장 Path 정보를 가지고 기본 레지스트리 정보를 생성한다.
        await _registryRelated();

        await oAPP.fn.getWsMessageList(); // <--- 반드시 여기에 위치해야함!!        

        // 소스 패턴 관련작업
        await _sourcePatternRelated();

        // 실행 기준 3개월이 지난 로그가 있다면 삭제한다.
        await _oldLogDelete();

        let oGlobalSettings = await WSUTIL.getWsGlobalSettingInfoAsync();

        // 초기 설치(기본 폴더, vbs 옮기기 등등)
        oAPP.fn.setInitInstall(() => {

            oAPP.endTime = new Date().getTime();

            let iTime = 3000,
                timeDiff = oAPP.endTime - oAPP.startTime;

            if (iTime - timeDiff >= 0) {
                iTime = iTime - timeDiff;
            } else {
                iTime = 0;
            }

            // WS 세팅 정보
            var oWsSettings = oAPP.fn.fnGetSettingsInfo();

            // Trial 버전 여부 확인
            if (oWsSettings.isTrial) {

                setTimeout(() => {
                    oAPP.fn.fnTrialLogin();
                }, iTime);

                return;
            }

            setTimeout(() => {
                oAPP.fn.fnOpenServerList(oGlobalSettings);
            }, iTime);

        });

    }; // end of oAPP.fn.fnOnStart   

    /************************************************************************
     * WS 글로벌 메시지 목록 구하기
     ************************************************************************/
    oAPP.fn.getWsMessageList = () => {

        return new Promise(async (resolve) => {

            let sWsLangu = await WSUTIL.getWsLanguAsync();

            oAPP.msg.M01 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "032"); // Restart
            oAPP.msg.M02 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "033"); // App Close
            oAPP.msg.M03 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "034"); // Ignore
            oAPP.msg.M04 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "015"); // Please contact U4A Solution Team!
            oAPP.msg.M05 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "035"); // Default Pattern File Copy Error!
            oAPP.msg.M06 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "036"); // Pattern Json File Write Error!
            oAPP.msg.M07 = "";
            oAPP.msg.M08 = "";
            oAPP.msg.M09 = "";
            oAPP.msg.M10 = "";

            resolve();

        });

    }; // end of oAPP.fn.getWsMessageList

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
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

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

        let oPackageJson = REMOTE.require("./package.json");

        let oVerTable = document.getElementById("verTable"),
            oVerTextArea = document.getElementById("verTextArea"),
            oRelVer = document.getElementById("relver"),
            oPatVer = document.getElementById("patver"),
            oVerTxt = document.getElementById("versionTxt"),
            oPatVerTr = document.getElementById("patVerTr"),

            sVersion = APP.getVersion(), // 앱 버전
            oWsSettings = oAPP.fn.fnGetSettingsInfo(), // WS Setting 정보
            iSupportPatch = Number(oWsSettings.patch_level || 0);

        // no build 상태에서는 버전 정보를 package.json에서 읽는다.
        if (!APP.isPackaged) {
            sVersion = oPackageJson.version;
        }

        // Trial 버전 여부 확인
        if (oWsSettings.isTrial) {

            oVerTxt.innerHTML = `Trial version`;

            // 버전 테이블 영역 숨기기
            oVerTable.style.display = "none";

            return;
        }

        // Trial Version 영역 숨기기
        oVerTextArea.style.display = "none";

        oRelVer.innerHTML = sVersion;

        // 빌드된 상태에서 실행했을 경우에만 Support Package version을 보여준다.
        // if (APP.isPackaged) {

        oPatVerTr.style.display = "";
        oPatVer.innerHTML = iSupportPatch;

        // }

    }; // end of oAPP.fn.fnDisplayCurrentVersion  

    /************************************************************************
     * 서버 리스트를 오픈한다.
     ************************************************************************/
    oAPP.fn.fnOpenServerList = function (oGlobalSettings) {

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

        oWin.loadURL(PATHINFO.SERVERLIST_v2);

        // server list v2
        // oWin.webContents.openDevTools();
        // no build 일 경우에는 개발자 툴을 실행한다.

        // if (!APP.isPackaged) {
        //     oWin.webContents.openDevTools();
        // }

        oWin.webContents.on('did-finish-load', async function () {

            // 글로벌 설정 정보를 ServerList에 전달한다.
            oWin.webContents.send('if-globalSetting-info', oGlobalSettings);

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

            let oSettings = oAPP.fn.fnGetSettingsInfo(),
                sRegPath = oSettings.regPaths,
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
     * 초기 글로벌 설정값 세팅
     ************************************************************************/
    function _initRegistryGlobalSettings() {

        return new Promise(async (resolve) => {

            // 레지스트리의 글로벌 세팅 경로 구하기
            let oSettings = oAPP.fn.fnGetSettingsInfo(),
                sRegPath = oSettings.regPaths,
                sGlobalSettingPath = sRegPath.globalSettings;

            // 레지스트리에 저장된 글로벌 세팅 정보 구하기
            let oRegList = await WSUTIL.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            var oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            // WS Language 정보 저장
            if (!oSettingValues.language) {

                let oRegData = {};
                oRegData[sGlobalSettingPath] = {};
                oRegData[sGlobalSettingPath]["language"] = {
                    value: oSettings.defaultLanguage || "EN",
                    type: "REG_SZ"
                };

                await WSUTIL.putRegeditValue(oRegData);

            }

            // WS Theme 정보 저장
            if (!oSettingValues.theme) {

                let oRegData = {};
                oRegData[sGlobalSettingPath] = {};
                oRegData[sGlobalSettingPath]["theme"] = {
                    value: oSettings.defaultTheme || "sap_horizon_dark",
                    type: "REG_SZ"
                };

                await WSUTIL.putRegeditValue(oRegData);

            }

            resolve();

        });


    } // end of _initRegistryGlobalSettings


    function _testGetReg() {

        return new Promise(async (resolve) => {

            let oSettings = oAPP.fn.fnGetSettingsInfo(),
                sRegPath = oSettings.regPaths,
                sSystems = sRegPath.systems,
                sUHA = sSystems + "\\UHA";

            // let oRegList = await WSUTIL.getRegeditList([sUHA]);
            // if (oRegList.RETCD == "E") {
            //     resolve();
            // }

            // let oRetData = oRegList.RTDATA,
            //     oRegData = oRetData[sUHA],
            //     oRegValue = oRegData.values;

            // let A1 = oRegValue.T_REG_THEME.value,
            //     A2 = oRegValue.T_REG_WLO.value;

            // try {
            //     var A1_parse = JSON.parse(A1);
            //     var A2_parse = JSON.parse(A2);
            // } catch (error) {
            //     throw new Error(error);
            // }

            await WSUTIL.getRegeditAsync("HKCU", "SOFTWARE", "U4A", "WS", "Systems", "UHA");

        });

    }

    /************************************************************************
     * 초기 레지스트리 폴더 생성
     ************************************************************************/
    function _initCreateRegistryFolders() {

        return new Promise(async (resolve) => {

            let aKeys = [];

            let oSettings = oAPP.fn.fnGetSettingsInfo(),
                sRegPath = oSettings.regPaths;

            aKeys.push(sRegPath.systems);
            aKeys.push(sRegPath.LogonSettings);
            aKeys.push(sRegPath.globalSettings);

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
             */

            // 초기 글로벌 설정값 세팅
            await _initRegistryGlobalSettings();

            // if (!APP.isPackaged) {
            //     await _testGetReg();
            // }


            resolve();

        });


    } // end of _checkRegistry

    function _setGlobalSettingInfo(oSettings) {

        return new Promise(async (resolve) => {

            oSettings.globalLanguage = await WSUTIL.getWsLanguAsync();
            oSettings.globalTheme = await WSUTIL.getWsThemeAsync();

            resolve();

        });

    } // end of _setGlobalSettingInfo

    /************************************************************************
     * WS Setting 정보를 Json 파일로 저장
     ************************************************************************/
    function _saveWsSettingsInfo() {

        return new Promise(async (resolve) => {

            if (!FS.existsSync(PATHINFO.CONF_ROOT)) {
                FS.mkdirSync(PATHINFO.CONF_ROOT);
            }

            let sConfPath = PATH.join(USERDATA, "conf", "ws_settings.json"),
                oSettings = require(PATH.join(APPPATH, "settings", "ws_settings.json"));

            /**
             * 여기서 Setting정보 추가할것. -- start
             */

            // WS Global Setting 관련 정보
            await _setGlobalSettingInfo(oSettings);

            // UI5 Bootstrap Url 구성
            _setUI5BootStrapUrl(oSettings);

            // 각종 루트 패스 등의 패스 정보 구성
            _setCommonPaths(oSettings);

            /**
             *  -- end
             */

            let sSettingJson = JSON.stringify(oSettings),
                oWriteFileResult = await WSUTIL.fsWriteFile(sConfPath, sSettingJson);

            if (oWriteFileResult.RETCD == "E") {
                throw new Error("[intro] WS Setting Info File Write Error!");
            }

            resolve();

        });

    } // end of _saveWsSettingsInfo

    function _setUI5BootStrapUrl(oSettings) {

        // 탑재된 UI5 Library 경로
        let sSettingUi5BootUrl = PATH.join(process.resourcesPath, oSettings.UI5.localResource);

        sSettingUi5BootUrl = sSettingUi5BootUrl.replaceAll("\\", "/");
        sSettingUi5BootUrl = `file:///${sSettingUi5BootUrl}`;

        oSettings.UI5.resourceUrl = sSettingUi5BootUrl;

        // test url
        // let sTestUrl = PATH.join(process.env.TEMP, "v11071", "resources", "sap-ui-core.js");
        // sTestUrl = sTestUrl.replaceAll("\\", "/");
        // sTestUrl = `file:///${sTestUrl}`;

        // oSettings.UI5.resourceUrl = sTestUrl;

        // 개발 모드일 경우, UI5 CDN 경로
        if (oSettings.isDev) {
            oSettings.UI5.resourceUrl = oSettings.UI5.testResource;
        }

    } // end of _setUI5BootStrapUrl

    /************************************************************************
     * 공통으로 사용할 패스 정보 구성
     ************************************************************************/
    function _setCommonPaths(oSettings) {

        if (!oSettings.path) {
            oSettings.path = {};
        }

        oSettings.path = Object.assign(oSettings.path, PATHINFO);

    } // end of _setCommonPaths

    /************************************************************************
     * 패턴 관련 작업
     ************************************************************************/
    function _sourcePatternRelated() {

        return new Promise(async (resolve) => {

            // 기본 패턴 파일을 설치폴더 경로에 옮기기
            let oResult1 = await _sourceDefaultPatternFileDown();
            if (oResult1.RETCD == "E") {

                let sMsg = "[intro] " + oAPP.msg.M05; // Default Pattern File Copy Error!

                // 패턴 관련 작업 중 오류 발생 시 공통 메시지 출력
                lf_sourcePatternErrorMsg(resolve, sMsg);

                console.error("[Intro] WWW에 있는 기본 패턴파일을 USERDATA에 복사하다가 오류");

                return;

            }

            // 패턴 관련 JSON 파일을 만든다.
            let oResult2 = await _saveSourcePatternJson();
            if (oResult2.RETCD == "E") {

                let sMsg = "[intro] " + oAPP.msg.M06; // Pattern Json File Write Error!

                // 패턴 관련 작업 중 오류 발생 시 공통 메시지 출력
                lf_sourcePatternErrorMsg(resolve, sMsg);

                return;

            }

            resolve();

        });

    } // end of _sourcePatternRelated    

    // 패턴 관련 작업 중 오류 발생 시 공통 메시지 출력
    async function lf_sourcePatternErrorMsg(resolve, sMsg) {

        let sTxt1 = oAPP.msg.M01, // Restart
            sTxt2 = oAPP.msg.M02, // App Close
            sTxt3 = oAPP.msg.M03, // Ignore
            sTxt4 = oAPP.msg.M04; // Please contact U4A Solution Team!

        let options = {
            buttons: [sTxt1, sTxt2, sTxt3],
            message: sMsg,
            detail: sTxt4
        };

        let oMsgResult = await showMessageBox("E", options),
            iResponse = oMsgResult.response;

        switch (iResponse) {
            case 0: // App Restart

                APP.relaunch();
                APP.exit();
                return;

            case 1: // App Close

                APP.exit();
                return;

            case 2: // Ignore

                resolve();
                return;
        }

    }


    function showMessageBox(messageTypes, pOptions) {

        return new Promise((resolve) => {

            let sMsgType = "";

            switch (messageTypes) {
                case "I":
                    sMsgType = "info";
                    break;

                case "S":
                    sMsgType = "info";
                    break;

                case "W":
                    sMsgType = "warning";
                    break;

                case "E":
                    sMsgType = "error";
                    break;

                default:
                    sMsgType = "none";
                    break;
            }

            let options = {
                title: "U4A Workspace",
                type: sMsgType,
                message: "",
                detail: ""
            };

            options = Object.assign({}, options, pOptions);

            DIALOG.showMessageBox(CURRWIN, options).then((e) => {

                resolve(e);

            });

        });

    } // end of showMessageBox

    /************************************************************************
     * 기본 패턴 파일을 설치폴더 경로에 옮기기
     ************************************************************************/
    function _sourceDefaultPatternFileDown() {

        return new Promise(async (resolve) => {

            let sPattnFolderSourcePath = PATHINFO.PATTERN_ROOT, // WWW에 기본 패턴 파일이 있는 폴더
                sPattnFolderTargetPath = PATHINFO.USERDATA_PATT_FILES; // USERDATA의 패턴 파일들이 저장될 폴더

            // USERDATA의 패턴 파일들이 저장될 폴더가 없으면 생성
            const isExists = FS.existsSync(sPattnFolderTargetPath);
            if (!isExists) {
                FS.mkdirSync(sPattnFolderTargetPath, {
                    recursive: true
                });
            }

            var ncp = require('ncp').ncp;

            ncp.limit = 16; // 한번에 처리하는 수?  

            // WWW에 있는 패턴 파일을 USERDATA 폴더에 복사한다.
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

        });

    } // end of _sourceDefaultPatternFileDown

    /************************************************************************
     * 패턴 관련 JSON 파일을 만든다.
     ************************************************************************/
    function _saveSourcePatternJson() {

        return new Promise(async (resolve) => {

            /**
             * Default Pattern JSON 만들기
             */

            // Usp 기본 패턴 정보를 구한다.
            let oDefPattDataResult = await USP_UTIL.getDefaultPatternData();
            if (oDefPattDataResult.RETCD == "E") {
                resolve(oDefPattDataResult);
                console.error("[Intro] 기본 패턴 정보 오류");
                return;
            }

            let aDefPattData = oDefPattDataResult.RTDATA,
                sDefPattJsonPath = PATHINFO.DEF_PATT,
                sDefPattJsonData = JSON.stringify(aDefPattData);

            // Usp 기본 패턴 정보를 Json 파일로 저장한다.
            let oWriteJsonResult = await WSUTIL.fsWriteFile(sDefPattJsonPath, sDefPattJsonData);
            if (oWriteJsonResult.RETCD == "E") {
                resolve(oDefPattDataResult);
                console.error("[Intro] 기본패턴 정보 JSON 저장하다가 오류");
                return;
            }

            /**
             * Custom Pattern
             */

            let aCustomPatternInitData = await USP_UTIL.getCustomPatternInitData(), // 커스텀 패턴 기본 정보 구하기
                sCustPattInitJsonData = JSON.stringify(aCustomPatternInitData); // 커스텀 패턴 기본 정보 JSON 변환

            // 커스텀 패턴 파일이 없으면 신규 생성
            let sCustPattJsonPath = PATHINFO.CUST_PATT,
                bIsFileExist = FS.existsSync(sCustPattJsonPath);

            if (!bIsFileExist) {

                // 커스텀 패턴 정보를 JSON으로 말아서 앱 설치 폴더에 저장
                let oWriteResult = await WSUTIL.fsWriteFile(sCustPattJsonPath, sCustPattInitJsonData);
                if (oWriteResult.RETCD == "E") {
                    resolve(oWriteResult);
                    console.error("[Intro] 커스텀 패턴 파일 저장하다가 오류");
                    return;
                }

            }

            // 기존에 저장된 개인화 패턴 정보가 있을 경우, 개인화 패턴 ROOT의 Description을 Ws language에 맞게 변경
            let sCustPattJsonData = FS.readFileSync(sCustPattJsonPath, 'utf-8');

            try {
                var aCustPattData = JSON.parse(sCustPattJsonData);
            } catch (error) {
                console.error("[Intro] 기 저장된 커스텀 패턴 파일읽어서 JSON 파싱하다가 오류");
                throw new Error(error.toString());
            }

            // 커스텀 패턴 ROOT의 Description을 WS Language 언어에 맞게 매핑
            aCustPattData[0] = aCustomPatternInitData[0];

            let sCustPattJson = JSON.stringify(aCustPattData);

            // 커스텀 패턴 정보를 Json 파일로 저장한다.
            let oWriteCustJsonResult = await WSUTIL.fsWriteFile(sCustPattJsonPath, sCustPattJson);
            if (oWriteCustJsonResult.RETCD == "E") {
                resolve(oWriteCustJsonResult);
                console.error("[Intro] 기본패턴 정보 JSON 저장하다가 오류");
                return;
            }


            resolve({ RETCD: "S" });

        });

    } // end of _saveSourcePatternJson

    /************************************************************************
     * 3개월 전 로그는 삭제한다.
     ************************************************************************/
    function _oldLogDelete() {

        return new Promise(async (resolve) => {

            let sLogPath = PATH.join(USERDATA, "logs"),
                oResult = await WSUTIL.readDir(sLogPath);

            if (oResult.RETCD == "E") {
                resolve();
                return;
            }

            let aLogList = oResult.RTDATA,
                iLogListLength = aLogList.length;

            if (iLogListLength < 0) {
                resolve();
                return;
            }


            // 오늘 날짜의 3개월 전 날짜
            let oBefore3Month = new Date();
            oBefore3Month.setMonth(oBefore3Month.getMonth() - 3);

            for (var i = 0; i < iLogListLength; i++) {

                let sLogFileName = aLogList[i],
                    sLogFilePath = PATH.join(sLogPath, sLogFileName);

                const oFileStatus = await WSUTIL.fsStat(sLogFilePath);
                if (oFileStatus.RETCD == "E") {
                    continue;
                }

                const oStatus = oFileStatus.RTDATA;

                let mtime = oStatus.mtime; // 로그 파일의 마지막 수정 날짜

                if (mtime - oBefore3Month > 0) {
                    continue;
                }

                // sLogFilePath <-- 이 경로를 지울것!!
                const oRemoveResult = await WSUTIL.fsRemove(sLogFilePath);

            }

            resolve();

        });


    } // end of _oldLogCheck




    document.addEventListener('deviceready', oAPP.fn.fnOnDeviceReady, false);

})();


(function () {
    "use strict";

    String.prototype.string = function (len) {
        var s = '',
            i = 0;
        while (i++ < len) {
            s += this;
        }
        return s;
    };
    String.prototype.zf = function (len) {
        return "0".string(len - this.length) + this;
    };
    Number.prototype.zf = function (len) {
        return this.toString().zf(len);
    };

    Date.prototype.format = function (f) {

        if (!this.valueOf()) return " ";

        var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
            weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"],
            weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            d = this;

        return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {

            var h = "";

            switch ($1) {

                case "yyyy":
                    return d.getFullYear(); // 년 (4자리)

                case "yy":
                    return (d.getFullYear() % 1000).zf(2); // 년 (2자리)

                case "MM":
                    return (d.getMonth() + 1).zf(2); // 월 (2자리)

                case "dd":
                    return d.getDate().zf(2); // 일 (2자리)

                case "KS":
                    return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)

                case "KL":
                    return weekKorName[d.getDay()]; // 요일 (긴 한글)

                case "ES":
                    return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)

                case "EL":
                    return weekEngName[d.getDay()]; // 요일 (긴 영어)

                case "HH":
                    return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)

                case "hh":
                    return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)

                case "mm":
                    return d.getMinutes().zf(2); // 분 (2자리)

                case "ss":
                    return d.getSeconds().zf(2); // 초 (2자리)

                case "a/p":
                    return d.getHours() < 12 ? "AM" : "PM"; // 오전/오후 구분

                default:
                    return $1;

            }

        });

    };

})();