const
    REMOTE = require('@electron/remote'),
    FS = require('fs-extra'),
    ZIPLIB = require("zip-lib"),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    REGEDIT = require('regedit'),
    USERDATA = APP.getPath("userData");

const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

/**
 * 테스트 -- start
 */
const
    CURRWIN = REMOTE.getCurrentWindow(),
    WEBCON = CURRWIN.webContents,
    WEBPREF = WEBCON.getWebPreferences(),
    USERINFO = WEBPREF.USERINFO;

if (USERINFO) {
    process.USERINFO = USERINFO;
}

let oAPP = {};

/**
 * 테스트 -- end
 */

module.exports = {

    /**
     * @class
     * 접속 언어별 다국어 지원 메시지를 생성하는 클래스
     */
    MessageClassText: class {

        _aMsgClsTxt = [];

        /**
         * constructor
         * @param {string} pSysID 접속 시스템 아이디
         * @param {string} pLangu 접속 시스템 언어
         */
        constructor(pSysID, pLangu) { // 인자를 받아 할당한다.                 

            if (!pSysID) {
                throw new Error("System ID is require!");
            }

            if (!pLangu) {
                throw new Error("Language is require!");
            }

            // 클래스의 필드(프로퍼티)
            this.SYSID = pSysID;
            this.LANGU = pLangu;

            // 로컬에 있는 메시지 json 파일을 읽어서 this.aMsgClsTxt; <-- 여기에 저장해둔다.
            this._fnReadMsgClassTxt();

        }

        setMsgClassTxt(aMsgClsTxt) {
            this._aMsgClsTxt = aMsgClsTxt;
        }

        getMsgClassTxt() {
            return this._aMsgClsTxt;
        }

        /**
         * APP 설치 폴더에 있는 메시지 클래스 json 파일을 읽어서 전역 변수에 저장한다.
         *  
         * @private
         */
        _fnReadMsgClassTxt() {

            // APPPATH 경로를 구한다.
            let sSysID = this.SYSID,
                sLangu = this.LANGU,
                sJsonFolderPath = PATH.join(USERDATA, "msgcls", sSysID, sLangu),
                sJsonPath = PATH.join(sJsonFolderPath, "msgcls.json");

            // 파일이 없을 경우 그냥 빠져나간다.
            if (!FS.existsSync(sJsonPath)) {
                console.error("not exists file => msgcls.json");
                return;
            }

            let sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
                aMsgClsTxt = JSON.parse(sJsonData);

            this.setMsgClassTxt(aMsgClsTxt);

        } // end of _fnReadMsgClassTxt

        /**
         * 메시지 클래스 명과 번호를 참조해서 메시지 텍스트를 리턴한다.
         * 
         * @param {string} sMsgCls - 메시지 클래스 명
         * @param {string} sMsgNum - 메시지 번호
         * @param {string} p1      - replace text param 1
         * @param {string} p2      - replace text param 2
         * @param {string} p3      - replace text param 3
         * @param {string} p4      - replace text param 4
         * @returns {string} Message Text
         * @public
         */
        fnGetMsgClsText(sMsgCls, sMsgNum, p1, p2, p3, p4) {

            let aMsgClsTxt = this.getMsgClassTxt(),
                sLangu = this.LANGU;

            if (!aMsgClsTxt || !aMsgClsTxt.length) {
                return sMsgCls + "|" + sMsgNum;
            }

            let sDefLangu = "E"; // default language    

            // 현재 접속한 언어로 메시지를 찾는다.
            let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sLangu && a.MSGNR == sMsgNum);

            // 현재 접속한 언어로 메시지를 못찾은 경우
            if (!oMsgTxt) {

                // 접속한 언어가 영어일 경우 빠져나간다.
                if (sDefLangu == sLangu) {
                    return sMsgCls + "|" + sMsgNum;

                }

                // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
                oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sDefLangu && a.MSGNR == sMsgNum);

                // 그래도 없다면 빠져나간다.
                if (!oMsgTxt) {
                    return sMsgCls + "|" + sMsgNum;
                }

            }

            var sText = oMsgTxt.TEXT,
                aWithParam = [];

            // 파라미터로 전달 받은 Replace Text 수집
            aWithParam.push(p1 == null ? "" : p1);
            aWithParam.push(p2 == null ? "" : p2);
            aWithParam.push(p3 == null ? "" : p3);
            aWithParam.push(p4 == null ? "" : p4);

            var iWithParamLenth = aWithParam.length;
            if (iWithParamLenth == 0) {
                return sText;
            }

            // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
            for (var i = 0; i < iWithParamLenth; i++) {

                var index = i + 1,
                    sParamTxt = aWithParam[i];

                var sRegEx = "&" + index,
                    oRegExp = new RegExp(sRegEx, "g");

                sText = sText.replace(oRegExp, sParamTxt);

            }

            sText = sText.replace(new RegExp("&\\d+", "g"), "");

            // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
            for (var i = 0; i < iWithParamLenth; i++) {

                var sParamTxt = aWithParam[i];

                sText = sText.replace(new RegExp("&", "i"), sParamTxt);

            }

            sText = sText.replace(new RegExp("&", "g"), "");

            return sText;

        } // end of getMsgClsText

    },
    /************** end of Class (MessageClassText) ***************/

    showMessageBox: function (sap, pOptions) {

        if (!sap?.m?.MessageBox) {
            sap.ui.requireSync("sap/m/MessageBox");
        }

        let oDefaultOptions = {
            icon: sap.m.MessageBox.Icon.NONE, // default
            title: "", // default
            actions: sap.m.MessageBox.Action.OK, // default
            emphasizedAction: sap.m.MessageBox.Action.OK, // default
            onClose: null, // default
            styleClass: "", // default
            initialFocus: null, // default
            textDirection: sap.ui.core.TextDirection.Inherit // default
        },
            oOptions = Object.assign({}, oDefaultOptions, pOptions);


        let sType = oOptions.TYPE || "I";

        switch (sType) {

            case "I":
                sap.m.MessageBox.information(oOptions.MSG || "", oOptions);
                break;

            case "S":
                sap.m.MessageBox.success(oOptions.MSG || "", oOptions);
                break;

            case "W":
                sap.m.MessageBox.warning(oOptions.MSG || "", oOptions);
                break;

            case "E":
                sap.m.MessageBox.error(oOptions.MSG || "", oOptions);
                break;

            default:
                sap.m.MessageBox.show(oOptions.MSG || "", oOptions);
                break;

        }

    }, // end of showMessageBox

    /**
     * 테마별 백그라운드 색상 구하기     
     */
    getThemeBackgroundColor: function (sTheme) {

        switch (sTheme) {
            case "sap_belize_plus":
                return "#fafafa";

            case "sap_horizon_dark":
                return "#12171c";

            case "sap_horizon":
                return "#f5f6f7";

            case "sap_belize":
                return "#fafafa";

            case "sap_fiori_3":
                return "#f7f7f7";

            case "sap_fiori_3_dark":
                return "#1c2228";

            default:
                return "#ffffff";

        }

    }, // end of getThemeBackgroundColor

    /**
     * 레지스트리에서 WS Global Theme 구하기   
     */
    getWsThemeAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            let oRegValues = oRetData[sGlobalSettingPath].values,
                oRegTheme = oRegValues.theme,
                sTheme = oSettings.defaultTheme;

            if (oRegTheme) {
                sTheme = oRegTheme.value;
            }

            resolve(sTheme);

        });

    }, // end of getWsThemeAsync

    /**
     * 레지스트리에서 WS Global Language 구하기     
     */
    getWsLanguAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            //  레지스트리에 GlobalSetting 정보가 있는지 확인
            let oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            let sLangu = "EN"; // WS Language 기본값

            // 레지스트리에 저장된 WS language 값
            if (oSettingValues.language) {
                sLangu = oSettingValues.language.value;
            }

            resolve(sLangu);

        });

    }, // end of getWsLanguAsync

    /**
     * WS Global Language를 레지스트리에 저장
     */
    setWsLanguAsync: function (sWsLangu) {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로           

            // 저장할 레지스트리 데이터
            let oRegData = {};
            oRegData[sGlobalSettingPath] = {};
            oRegData[sGlobalSettingPath]["language"] = {
                value: sWsLangu,
                type: "REG_SZ"
            };

            await this.putRegeditValue(oRegData);

            resolve();

        });

    }, // end of setWsLanguAsync

    /**
     * WS 3.0 전용 메시지 리턴
     */
    getWsMsgClsTxt: function (LANGU, ARBGB, MSGNR, p1, p2, p3, p4) {

        // www에 내장되어 있는 WS 메시지 경로
        let sWsMsgPath = PATH.join(PATHINFO.WSMSG_ROOT, "WS_COMMON", LANGU, ARBGB + ".json");

        // WS 메시지 존재 유무
        if (!FS.existsSync(sWsMsgPath)) {
            return `${ARBGB}|${MSGNR}`;
        }

        // ws 메시지를 읽는다.
        let aMsgList = require(sWsMsgPath),
            oFindTxt = aMsgList.find(elem => elem.MSGNR == MSGNR);

        // 메시지 넘버에 맞는 ws 메시지가 없으면 빠져나감.
        if (!oFindTxt) {
            return `${ARBGB}|${MSGNR}`;
        }

        // 전달 받은 P~ 파라미터 값 수집
        let sText = oFindTxt.TEXT,
            aWithParam = [];

        // 파라미터로 전달 받은 Replace Text 수집
        aWithParam.push(p1 == null ? "" : p1);
        aWithParam.push(p2 == null ? "" : p2);
        aWithParam.push(p3 == null ? "" : p3);
        aWithParam.push(p4 == null ? "" : p4);

        let iWithParamLenth = aWithParam.length;
        if (iWithParamLenth == 0) {
            return sText;
        }

        // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
        for (let i = 0; i < iWithParamLenth; i++) {

            let index = i + 1,
                sParamTxt = aWithParam[i];

            let sRegEx = "&" + index,
                oRegExp = new RegExp(sRegEx, "g");

            sText = sText.replace(oRegExp, sParamTxt);

        }

        sText = sText.replace(new RegExp("&\\d+", "g"), "");

        // 치환된 Text에 "&" 가 존재 할 경우 추가적인 치환을 한다.
        if (sText.includes("&")) {

            // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다.
            for (let i = 0; i < iWithParamLenth; i++) {

                let sParamTxt = aWithParam[i];

                sText = sText.replace(new RegExp("&", "i"), sParamTxt);

            }

        }

        sText = sText.replace(new RegExp("&", "g"), "");

        return sText;

    }, // end of getWsMsgClsTxt    

    /**
     * WS 3.0 전용 메시지 모델 정보 구조
     */
    getWsMsgModelData: function () {

        return new Promise(async (resolve) => {

            let sWsLangu = await this.getWsLanguAsync(), // WS Language 설정 정보                
                sWsMsgPath = PATH.join(PATHINFO.WSMSG_ROOT, "WS_COMMON", sWsLangu); // www에 내장되어 있는 WS 메시지 경로

            let oWsLanguDir = await this.readDir(sWsMsgPath);
            if (oWsLanguDir.RETCD == "E") {

                resolve(oWsLanguDir);
                return;

                // throw new Error("WS Language File not found!");
            }

            let aLanguFiles = oWsLanguDir.RTDATA,
                iLanguFileLength = aLanguFiles.length;

            let oLanguJsonData = {};
            for (var i = 0; i < iLanguFileLength; i++) {

                let sLanguFileFullName = aLanguFiles[i], // Language 폴더의 파일 목록
                    oPathParse = PATH.parse(sLanguFileFullName), // 파일명만 추출
                    sLanguFileName = oPathParse.name,

                    sLanguFilePath = PATH.join(sWsMsgPath, sLanguFileFullName),
                    aLanguJson = require(sLanguFilePath),
                    iLanguJsonLength = aLanguJson.length;


                /**
                 * 구조 예시
                 * {
                 *      "ZWSMSG_001" : {
                 *          "000" : "TEXT_000",
                 *          "001" : "TEXT_001",
                 *      },
                 *      "ZWSMSG_002" : {
                 *          "000" : "TEXT_000",
                 *          "001" : "TEXT_001",
                 *      }
                 * }
                 */
                oLanguJsonData[sLanguFileName] = {};

                for (var j = 0; j < iLanguJsonLength; j++) {

                    let oLanguJson = aLanguJson[j];

                    oLanguJsonData[sLanguFileName][oLanguJson.MSGNR] = oLanguJson.TEXT;

                }

            }

            resolve({
                RETCD: "S",
                RTDATA: oLanguJsonData
            });

        });

    }, // end of getWsMsgModelData

    /************************************************************************
     * Array를 Tree 구조로 변환
     ************************************************************************  
     * 예) parseArrayToTree(oModel, "WS20.MIMETREE", "CHILD", "PARENT", "MIMETREE");
     * 
     * @param {*} m Core Model Instance
     * @param {*} p Tree를 구성할 원본 Model Path (Deep 은 [.] 점으로 구분)
     * @param {*} r CHILD
     * @param {*} t PARENT
     * @param {*} z 재구성할 MODEL PATH 명
     *************************************************************************/
    parseArrayToTree: function (m, p, r, t, z) {

        var lp = p.replace(/[.\[\]]/g, '/');
        lp = lp.replace(/(\/\/)/g, '/');

        z = z.replace(/[\/]/g, 'x');
        r = r.replace(/[\/]/g, 'x');
        t = t.replace(/[\/]/g, 'x');

        var lp2 = lp.substr(0, lp.lastIndexOf('/'));

        var tm = m.getProperty('/' + lp);

        var tm2 = m.getProperty('/' + lp2);

        if (!tm || tm.length === 0) {
            tm2[z] = [];
            m.refresh();
            return;
        }

        var y = JSON.stringify(tm);

        var n = JSON.parse(y);

        for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) {
            e = n[o],
                h = e[r],
                u = e[t] || 0,
                c[h] = c[h] || [],
                e[z] = c[h],
                0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
        }

        tm2[z] = a;

    }, // end of parseArrayToTree

    /************************************************************************
     * Tree구조를 Array 구조로 변환
     ************************************************************************  
     * 예) parseTreeToArray(aUspTreeData, "USPTREE"),
     * 
     * @param {Array} Tree 구조로 되어 있는 Array
     * @param {String} Child 이름
     *************************************************************************/
    parseTreeToArray: function (e, sArrName) {

        var a = [],
            t = function (e) {

                e.forEach((o, e) => {

                    o[sArrName] && (t(o[sArrName]),
                        delete o[sArrName]);
                    a.push(o);

                });

                // $.each(e, function (e, o) {
                //     o[sArrName] && (t(o[sArrName]),
                //         delete o[sArrName]);
                //     a.push(o);
                // })

            };
        t(JSON.parse(JSON.stringify(e)));
        return a;

    }, // end of parseTreeToArray   

    /**
     * Electron Browser Window Open 시 Opacity를 이용하여 자연스러운 동작 연출
     * @param {BrowserWindow} oBrowserWindow 
     */
    setBrowserOpacity: function (oBrowserWindow) {

        let iOpa = 0.0,
            iInterval;

        if (iInterval) {
            clearInterval(iInterval);
        }

        iInterval = setInterval(() => {

            if (iOpa > 1) {

                if (iInterval) {
                    oBrowserWindow.setOpacity(1.0);
                    clearInterval(iInterval);
                }

                return;
            }

            iOpa += 0.02;

            oBrowserWindow.setOpacity(iOpa);

        }, 10);

    }, // end of setBrowserOpacity

    /**
     * 부모 윈도우 위치의 가운데 배치한다.
     * @param {REMOTE} REMOTE
     * @param {BrowserWindow} oBrowserWindow
     * @param {Object} oBrowserOptions
     */
    setParentCenterBounds: function (REMOTE, oBrowserWindow, oBrowserOptions) {

        let oCurrWin = REMOTE.getCurrentWindow();

        // 팝업 위치를 부모 위치에 배치시킨다.
        var oParentBounds = oCurrWin.getBounds(),
            xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
            yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
            oWinScreen = window.screen,
            iAvailLeft = oWinScreen.availLeft;

        if (xPos < iAvailLeft) {
            xPos = iAvailLeft;
        }

        if (oParentBounds.y > yPos) {
            yPos = oParentBounds.y + 10;
        }

        oBrowserWindow.setBounds({
            x: xPos,
            y: yPos
        });

    }, // end of setParentCenterBounds

    /**
     * 파일 확장자 svg icon 목록
     * @returns [{EXTNM : "확장자명", ICONPATH : "파일경로"}]
     */
    getFileExtSvgIcons: () => {

        return new Promise((resolve) => {

            var svgFolder = PATH.join(APP.getAppPath(), "svg");

            FS.readdir(svgFolder, {
                withFileTypes: false
            }, (err, aFiles) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    })
                    return;
                }

                let iFileLength = aFiles.length,
                    aFileExtInfo = [];

                for (var i = 0; i < iFileLength; i++) {

                    let sFileFullName = aFiles[i],
                        sFileName = sFileFullName.split(".")[0],
                        oFileExtInfo = {
                            EXTNM: sFileName,
                            ICONPATH: svgFolder + "\\" + sFileFullName
                        };

                    aFileExtInfo.push(oFileExtInfo);

                }

                resolve({
                    RETCD: "S",
                    RTDATA: aFileExtInfo
                });

            });


        });

    }, // end of getFileExtSvgIcons

    /**
     * SAP 아이콘 이미지 경로     
     */
    getSapIconPath: function (sIcon) {

        if (sIcon == null) {
            return;
        }

        var sIconName = sIcon + ".gif";

        return PATH.join(APP.getAppPath(), "icons", sIconName);

    },

    /**
     * 랜덤 값 구하기
     * @param {Integer} iLength 
     * - 랜덤값 길이 (Default: 50)   
     *
     */
    getRandomKey: function (iLength) {

        const RANDOM = require("random-key");

        let iDefLength = 50;

        if (iLength) {
            iDefLength = iLength;
        }

        return RANDOM.generateBase30(iDefLength);

    }, // end of getRandomKey

    /**
     * WS Setting 정보     
     */
    getWsSettingsInfo: function () {

        let sSetttingJsonData = FS.readFileSync(PATHINFO.WSSETTINGS, 'utf-8'),
            oSettings = JSON.parse(sSetttingJsonData);

        return oSettings;

    }, // end of getWsSettingsInfo

    /**
     * WS Global Setting 정보 [레지스트리에 설정된 값 구하기]
     */
    getWsGlobalSettingInfoAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            //  레지스트리에 GlobalSetting 정보가 있는지 확인
            let oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            resolve(oSettingValues);

        });

    }, // getWsGlobalSettingInfoAsync

    /**
     * 레지스트리에 저장된 whiteList Object 목록에 존재 여부 확인
     */
    checkWLOListAsync: function (SYSID = "", REGTYP = "", CHGOBJ = "") {

        return new Promise(async (resolve) => {

            // 레지스트리에 저장된 whiteList Object 목록을 구한다.
            let aWLO = await this.getWsWLOListAsync(SYSID);

            // Array 형식인지 여부 확인
            if (!Array.isArray(aWLO)) {
                resolve(false);
                return;
            }

            // 전달받은 파라미터에 해당하는 White List Object가 있는지 확인
            let oFindWLO = aWLO.find((elem) => {

                if (elem.REGTYP == REGTYP && elem.CHGOBJ == CHGOBJ) {
                    return true;
                }

                return false;

            });

            if (!oFindWLO) {
                resolve(false);
                return;
            }

            resolve(true);

        });

    }, // end of checkWLOListAsync

    /**
     * 레지스트리에 저장된 whiteList Object 목록
     */
    getWsWLOListAsync: function (SYSID = "") {

        return new Promise(async (resolve) => {

            // 레지스트리의 WS SYSTEM 경로를 구한다.
            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sWsSystemPath = sRegPath.systems;

            // 접속 SYSID에 해당하는 레지스트리 정보를 구한다.
            let oRegData = await this.getRegeditAsync(sWsSystemPath, SYSID);
            if (oRegData.RETCD == "E") {
                resolve([]);
                return;
            }

            // 레지스트리에 저장되어 있는 white list object 정보를 구한다.
            let oRegValues = oRegData.RTDATA.values,
                oWLO = oRegValues.T_REG_WLO;

            // 저장된 정보가 없으면 리턴
            if (!oWLO) {
                resolve([]);
                return;
            }

            let sWLOJson = oWLO.value;

            try {
                var aWLO = JSON.parse(sWLOJson);
            } catch (error) {
                resolve([]);
                return;
            }

            // 데이터 구조가 Array 인지 체크
            if (!Array.isArray(aWLO)) {
                resolve([]);
                return;
            }

            if (aWLO.length == 0) {
                resolve([]);
                return;
            }

            resolve(aWLO);

        });

    }, // end of getWsWLOListAsync

    /*************************************************************************
     * 파일시스템 관련 -- Start
     *************************************************************************/

    /**
     * 전달받은 경로의 디렉토리 정보를 구한다.
     * 
     * @param {String} sFolderPath 
     * - 읽을려는 폴더 경로
     * @returns {Object} { RETCD : "성공여부", RTDATA: "폴더내부의 정보리스트"}
     */
    readDir: function (sFolderPath) {

        return new Promise(async (resolve) => {

            FS.readdir(sFolderPath, {
                withFileTypes: false
            }, (err, files) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: files
                });

            });

        });

    }, // end of readdir

    /**
     * File 읽기
     * 
     * @param {String} sFilePath
     * - 읽을려는 파일의 경로
     */
    readFile: function (sFilePath) {

        return new Promise(async (resolve) => {

            FS.readFile(sFilePath, "utf-8", (err, data) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: data,
                });

            });

        });

    }, // end of readFile

    /**
     * 폴더 및 파일 복사 [deprecated] 빌드시 버그있음!!!!! 사용 금지!! 
     * 
     * @param {String} sSource 
     * - 복사 대상 원본 폴더 및 파일 경로
     * 
     * @param {String} sTarget 
     * - 복사 위치 폴더 및 파일 경로
     * 
     * @param {Object} options
     * - 옵션정보는 Nodejs의 fs 참조
     */
    fsCopy: function (sSource, sTarget, options) {

        return new Promise((resolve) => {

            FS.copy(sSource, sTarget, options).then(function () {

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: ""
                });

            }).catch(function (err) {

                resolve({
                    RETCD: "E",
                    RTMSG: err.toString(),
                    RTDATA: ""
                });

            });


        });

    }, // end of fsCopy

    /**
     * 파일 쓰기 
     * - 아래 파라미터는 nodejs의 fs 참조
     * @param {*} file 
     * @param {*} data 
     * @param {*} options      
     */
    fsWriteFile: function (file, data, options = {}) {

        return new Promise(async (resolve) => {

            FS.writeFile(file, data, options, (err) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: ""
                });

            });


        });

    }, // end of fsWriteFile

    fsStat: function (sFilePath) {

        return new Promise(async (resolve) => {

            FS.stat(sFilePath, (err, stats) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: stats
                });

            });

        });


    }, // end of fsStat

    fsRemove: function (sRemovePath) {

        return new Promise(async (resolve) => {

            FS.remove(sRemovePath, (err) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: ""
                });

            });

        });

    }, // end of fsRemove

    /*************************************************************************
     * 파일 시스템 관련 -- End
     *************************************************************************/


    /*************************************************************************
     * 레지스트리 관련 -- Start
     *************************************************************************/

    /** 
     * [async/arguments] 레지스트리 정보 가져오기     
     * 예: PATH.join("XX", "ZZ", "GGG") 처럼 파라미터 갯수 제한 없음
     * 파라미터가 하나도 없으면 오류
     */
    getRegeditAsync: function () {

        var aArgs = arguments,
            iArgLength = aArgs.length;

        return new Promise((resolve) => {

            if (iArgLength == 0) {

                resolve({
                    RETCD: "E",
                    RTMSG: "",
                    RTDATA: ""
                });

                return;

            }

            // arguments로 Path 조합
            let sRegPath = "";
            for (var i = 0; i < iArgLength; i++) {

                if (i == iArgLength - 1) {
                    sRegPath += aArgs[i];
                    continue;
                }

                sRegPath += aArgs[i] + "\\";
            }

            REGEDIT.list([sRegPath], (err, result) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: result[sRegPath]
                });

            });

        });

    },

    /**
     * 레지스트리 정보 가져오기
     * 
     * @param {Array} aPaths 
     * - 레지스트리 경로
     */
    getRegeditList: function (aPaths) {

        return new Promise((resolve) => {

            REGEDIT.list(aPaths, (err, result) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: result
                });

            });

        });

    },

    /**
     * 레지스트리 저장
     * 
     */
    putRegeditValue: function (oRegData) {

        return new Promise((resolve) => {

            REGEDIT.putValue(oRegData, (err) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString(),
                        RTDATA: ""
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: ""
                });

            });


        });

    },

    /*************************************************************************
     * 레지스트리 관련 -- End
     *************************************************************************/



    /*************************************************************************
     * Color 색상 Hex -> RGBA 변환
     *************************************************************************/
    hexToRgb: function (hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (0 <= alpha && alpha <= 1) {
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else {
            return `rgb(${r}, ${g}, ${b})`
        }
    },

    /**
     * zip 압축파일 풀기
     */
    zipExtract: function (sSourcePath, sTargetFolderPath) {

        return new Promise((resolve) => {

            ZIPLIB.extract(sSourcePath, sTargetFolderPath).then(function () {
                resolve({ RETCD: "S" });
            }, function (err) {
                resolve({ RETCD: "E", RTMSG: err.toString() });
            });

        });

    },




};