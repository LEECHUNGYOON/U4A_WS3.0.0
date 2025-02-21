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


const CURRWIN = REMOTE.getCurrentWindow(),
    WEBCON = CURRWIN.webContents,
    WEBPREF = WEBCON.getWebPreferences(),
    USERINFO = WEBPREF.USERINFO;

process.USERINFO = USERINFO;

if(!process.USERINFO){
    process.USERINFO = parent.getUserInfo && parent.getUserInfo()
}

// if (USERINFO) {
//     process.USERINFO = USERINFO;
// }

let oAPP = {};



module.exports = {

    /**********************************************
     * @class - IndexDB Class
     **********************************************/
    IndexDB : class {

        /*********************************************************
         * 공통 리턴구조         
         *********************************************************/
        static getResInfo (){

            return {
                RETCD: "",
                PRCCD: "",
                RTMSG: "",
                RDATA: "",
            }

        } // end of static getResInfo

        
        /*********************************************************
         * @method - IndexDB 생성
         *********************************************************          
         * @param {Object} oParams
         * {
         *    DB_NAME   :   @type {String}  Database Name    (* 필수)
         *    TABLE_NAME:   @type {String}  Table Name       (* 필수)
         *    VER       :   @type {Integer} Database Version (옵션)
         * }
         *********************************************************/
        static createIndexDB (oParams){

            var that = this;

            return new Promise((resolve) => {

                // 공통 리턴 구조
                let _oRES = that.getResInfo();

                // E 박고 시작
                _oRES.RETCD = "E";

                // 파라미터 필수값 체크
                let _oCheckResult = that._checkCreateIndexDbParams(oParams);
                if(_oCheckResult.RETCD === "E"){

                    let _sErrMsg = "";

                    switch (_oCheckResult.PRCCD) {

                        case "E01":
                            _sErrMsg = "Parameter가 없습니다.";
                            break;

                        case "E02":
                            _sErrMsg = "Parameter 가 Object 타입이 아닙니다";
                            break;

                        case "E03":
                            _sErrMsg = "'DB_NAME' 파라미터가 없거나 String 타입이 아닙니다.";
                            break;

                        case "E04":
                            _sErrMsg = "'TABLE_NAME' 파라미터가 없거나 String 타입이 아닙니다";
                            break;

                        case "E05":
                            _sErrMsg = "버전 파라미터는 숫자타입만 가능합니다.";
                            break;

                    }

                    console.error(_sErrMsg);

                    _oRES.RETCD = "E";
                    _oRES.RTMSG = _sErrMsg;

                    return resolve(_oRES);
                }

                let _sDbName = oParams.DB_NAME;
                let _sTbName = oParams.TABLE_NAME;
                let _iVer = oParams.VER || 1;

                let _oRequest = indexedDB.open(_sDbName, _iVer);
            
                _oRequest.onsuccess = async function(oEvent) {
                    
                    const _oDatabase = _oRequest.result;                    

                    // 테이블이 잘 생성되었는지 확인
                    let _bIsExists = _oRequest.result.objectStoreNames.contains(_sTbName);
                    if(!_bIsExists){

                        _oDatabase.close();

                        var iVersion = _oDatabase.version;

                        oParams.VER = iVersion + 1;

                        // let _sErrMsg = "테이블이 생성되지 않았습니다.";

                        // console.error(_sErrMsg);

                        // _oRES.RETCD = "E";
                        // _oRES.RTMSG = _sErrMsg;                        
    
                        return resolve(await that.createIndexDB(oParams));
                    }

                    _oDatabase.close();

                    _oRES.RETCD = "S";
                    _oRES.RDATA = oEvent;

                    return resolve(_oRES);
                };
                
                _oRequest.onupgradeneeded = function(oEvent) {

                    const _oDatabase = _oRequest.result;

                    _oDatabase.createObjectStore(_sTbName, { autoIncrement: true });

                };
                
                _oRequest.onerror = (error) => {                    
                    
                    console.error(error);

                    _oRES.RETCD = "E";
                    _oRES.RTMSG = error && error?.target?.error?.toString() || "";

                    return resolve(_oRES);

                };
                
            });

        } // end of static createIndexDB

        /*********************************************************
         * @method - Check for CreateIndexDb Parameter
         *********************************************************/
        static _checkCreateIndexDbParams(oParams) {

            // DB_NAME   :   @type {String} Database Name     (* 필수)
            // TABLE_NAME:   @type {String} Table Name        (* 필수)
            // VERSION   :   @type {Integer} Database Version (옵션)

            // 공통 리턴 구조
            let _oRES = this.getResInfo();

            // 파라미터가 없을 경우 오류!!
            if(!oParams){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E01";
                // _oRES.RTMSG = "Parameter가 없습니다.";
                
                return _oRES;
            }

            // 파라미터 타입 체크
            if(!oParams.constructor.toString().includes("Object")){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E02";
                // _oRES.RTMSG = "Parameter 가 Object 타입이 아닙니다";

                return _oRES;
            }

            if(!oParams.DB_NAME || typeof oParams.DB_NAME !== "string"){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E03";            
                // _oRES.RTMSG = "'DB_NAME' 파라미터가 없거나 String 타입이 아닙니다"

                return _oRES; 
            }

            if(!oParams.TABLE_NAME || typeof oParams.TABLE_NAME !== "string"){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E04";
                // _oRES.RTMSG = "'TABLE_NAME' 파라미터가 없거나 String 타입이 아닙니다"

                return _oRES;
            }

            // 버전 정보가 있을 경우 타입 체크
            if(oParams.VER){

                if(oParams.VER.constructor.name !== "Number"){

                    _oRES.RETCD = "E";
                    _oRES.PRCCD = "E05";
                    // _oRES.RTMSG = "버전 파라미터는 숫자타입만 가능합니다."

                    return _oRES;
                }
            }
            
            _oRES.RETCD = "S";

            return _oRES;

        } // end of static _checkCreateIndexDbParams
        

        /*********************************************************
         * @method - Insert
         *********************************************************
         * @param {Object} oParams
         * {
         *    DB_NAME   :   @type {String} Database Name    (* 필수)
         *    TABLE_NAME:   @type {String} Table Name       (* 필수)
         *    DATA      :   @type {Array}  Insert Data      (* 필수)
         *    KEY       :   @type {String} Key              (옵션)
         * }
         * 
         * @returns {Object}
         * {
         *    RETCD:        // 리턴코드 'S': 성공, 'E': 실패
         *    RTMSG:        // 리턴 메시지
         * }
         *********************************************************/
        static insert(oParams) {

            var that = this;

            return new Promise(async (resolve) => {            

                // 공통 리턴 구조
                let _oRES = that.getResInfo();

                // E 박고 시작
                _oRES.RETCD = "E";                

                // Insert 파라미터 필수값 체크
                let _oCheckResult = that._checkInsertParams(oParams);
                if(_oCheckResult.RETCD === "E"){
                    
                    let _sErrMsg = "";

                    switch (_oCheckResult.PRCCD) {

                        case "E01":
                            _sErrMsg = "Parameter가 없습니다.";
                            break;

                        case "E02":
                            _sErrMsg = "Parameter 가 Object 타입이 아닙니다";
                            break;

                        case "E03":
                            _sErrMsg = "'DB_NAME' 파라미터가 없거나 String 타입이 아닙니다.";
                            break;

                        case "E04":
                            _sErrMsg = "'TABLE_NAME' 파라미터가 없거나 String 타입이 아닙니다";
                            break;

                        case "E05":
                            _sErrMsg = "'DATA' 파라미터가 없거나 Array 타입이 아닙니다";
                            break;

                        case "E06":
                            _sErrMsg = "'KEY' 파라미터가 없거나 String 타입이 아닙니다";
                            break;
                    }

                    console.error(_sErrMsg);

                    _oRES.RETCD = "E";
                    _oRES.RTMSG = _sErrMsg;

                    return resolve(_oRES);
                }

                let _sDbName       = oParams.DB_NAME;
                let _sTbName       = oParams.TABLE_NAME;
                let _sKey          = oParams.KEY;
                let _aInsertData   = oParams.DATA;

                // Database Open
                let _oDbResult = await that._openDatabase(_sDbName);
                if(_oDbResult.RETCD === "E"){
                    
                    console.error(_oDbResult.RTMSG);

                    _oRES.RETCD = "E";
                    _oRES.RTMSG = _oDbResult.RTMSG;

                    return resolve(_oRES);
                }

                let _oDatabase = _oDbResult.RDATA;

                try {
                    
                    const _oTransaction = _oDatabase.transaction(_sTbName, 'readwrite');

                    // transaction 성공일 경우에만 발생되는 이벤트(실패할 경우는 타지 않음!!)
                    _oTransaction.oncomplete = function() {

                        _oDatabase.close();

                        return resolve(_oRES);
                    };

                    const _oStore = _oTransaction.objectStore(_sTbName);

                    var _oREQ = undefined;
                    
                    if(_sKey){
                        _oREQ = _oStore.add(_aInsertData, _sKey);
                    } else {
                        _oREQ = _oStore.add(_aInsertData);
                    }

                    _oREQ.onsuccess = function(event) {

                        _oRES.RETCD = "S";
                        _oRES.RDATA = event.target.result || "";

                    };

                    _oREQ.onerror = function(event){

                        _oDatabase.close();

                        _oRES.RETCD = "E";

                        let _sErrMsg = "";
                        if( event && 
                            event.target && 
                            event.target.error && 
                            event.target.error.toString){
                            
                            _sErrMsg = event.target.error.toString();
                        }

                        _oRES.RTMSG = _sErrMsg || "Insert Error!!";

                        return resolve(_oRES);
                    };            


                } catch (error) {
                    
                    _oDatabase.close();

                    _oRES.RETCD = "E";
                    _oRES.RTMSG = (error ? error.toString() : "Insert Error!!");

                    return resolve(_oRES);
                }

            });


        } // end of static insert

        /*************************************************
         * Database Open
         ************************************************** 
        * @param {String} _sDbName 
        *************************************************/
        static _openDatabase(_sDbName) {

            return new Promise((resolve) => {

                var oDb = indexedDB.open(_sDbName, 1);
    
                oDb.onsuccess = function() {
    
                    return resolve({
                        RETCD : "S",
                        RDATA : oDb.result
                    });
    
                };
    
                oDb.onerror = function(error) { 
    
                    return resolve({
                        RETCD : "E",
                        RTMSG : error
                    });       
    
                };
    
            });

        } // end of static _openDatabase

        /*********************************************************
         * @method - Check for Insert Parameter
         *********************************************************/
        static _checkInsertParams(oParams){

            // 공통 리턴 구조
            let _oRES = this.getResInfo();
            
            // DB_NAME   :   @type {String} Database Name    (* 필수)
            // TABLE_NAME:   @type {String} Table Name       (* 필수)
            // DATA      :   @type {Array}  Insert Data      (* 필수)
            // KEY       :   @type {String} Key              (옵션)

            // 파라미터가 없을 경우 오류!!
            if(!oParams){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E01";
                // _oRES.RTMSG = "Parameter가 없습니다.";
                
                return _oRES;
            }

            // 파라미터 타입 체크
            if(!oParams.constructor.toString().includes("Object")){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E02";
                // _oRES.RTMSG = "Parameter 가 Object 타입이 아닙니다";

                return _oRES;
            }

            if(!oParams.DB_NAME || typeof oParams.DB_NAME !== "string"){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E03";            
                // _oRES.RTMSG = "'DB_NAME' 파라미터가 없거나 String 타입이 아닙니다"

                return _oRES; 
            }

            if(!oParams.TABLE_NAME || typeof oParams.TABLE_NAME !== "string"){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E04";
                // _oRES.RTMSG = "'TABLE_NAME' 파라미터가 없거나 String 타입이 아닙니다"

                return _oRES;
            }

            if(!oParams.DATA || Array.isArray(oParams.DATA) === false){

                _oRES.RETCD = "E";
                _oRES.PRCCD = "E05";
                // _oRES.RTMSG = "'DATA' 파라미터가 없거나 Array 타입이 아닙니다"

                return _oRES;
            }

            if(oParams.KEY){

                if(typeof oParams.KEY !== "string"){
                    
                    _oRES.RETCD = "E";
                    _oRES.PRCCD = "E06";
                    // _oRES.RTMSG = "'KEY' 파라미터가 없거나 String 타입이 아닙니다"

                    return _oRES;                    
                }

            }

            _oRES.RETCD = "S";

            return _oRES;       

        } // end of static _checkInsertParams

        static read() {



        }

        static readAll(){



        }        

        static delete(){



        }

        static deleteAll() {



        }

    },

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

            // // 메시지 언어를 서버 로그인 언어로 할지 플래그
            // let bIsServer = parent?.process?.USERINFO?.isServDependLangu;

            // if(bIsServer === ""){
            //     this.LANGU = parent.process.USERINFO.GLOBAL_LANGU;
            // }

            // 클래스의 필드(프로퍼티)
            this.SYSID = pSysID;
            this.LANGU = pLangu;

            if(parent?.process?.USERINFO?.LANGU){
                this.LANGU = parent?.process?.USERINFO?.LANGU;
            }

            // 로컬에 있는 메시지 json 파일을 읽어서 this.aMsgClsTxt; <-- 여기에 저장해둔다.
            this._fnReadMsgClassTxt();

        }

        setMsgClassTxt(aMsgClsTxt) {
            this._aMsgClsTxt = aMsgClsTxt;
        }

        getMsgClassTxt() {
            return this._aMsgClsTxt;
        }

        getWsSettingsInfo() {

            let sSetttingJsonData = FS.readFileSync(PATHINFO.WSSETTINGS, 'utf-8'),
                oSettings = JSON.parse(sSetttingJsonData);
    
            return oSettings;
    
        }

        /**
         * APP 설치 폴더에 있는 메시지 클래스 json 파일을 읽어서 전역 변수에 저장한다.
         *  
         * @private
         */
        _fnReadMsgClassTxt() { // APPPATH 경로를 구한다.

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

        }
        // end of _fnReadMsgClassTxt

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

            // default language
            // let sDefLangu = "E";
            let sDefLangu = "EN";

            // 현재 접속한 언어로 메시지를 찾는다.
            let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.LANGU == sLangu && a.MSGNR == sMsgNum);

            // 현재 접속한 언어로 메시지를 못찾은 경우
            if (!oMsgTxt) { // 접속한 언어가 영어일 경우 빠져나간다.
                if (sDefLangu == sLangu) {
                    return sMsgCls + "|" + sMsgNum;

                }

                // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
                oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.LANGU == sDefLangu && a.MSGNR == sMsgNum);

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

            case "I": sap.m.MessageBox.information(oOptions.MSG || "", oOptions);
                break;

            case "S": sap.m.MessageBox.success(oOptions.MSG || "", oOptions);
                break;

            case "W": sap.m.MessageBox.warning(oOptions.MSG || "", oOptions);
                break;

            case "E": sap.m.MessageBox.error(oOptions.MSG || "", oOptions);
                break;

            default: sap.m.MessageBox.show(oOptions.MSG || "", oOptions);
                break;

        }

    },
    // end of showMessageBox

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

    },
    // end of getThemeBackgroundColor

    /**
     * 레지스트리에서 WS Global Theme 구하기   
     */
    getWsThemeAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

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

    },
    // end of getWsThemeAsync

    /**
     * 레지스트리에서 WS Global Language 구하기     
     */
    getWsLanguAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            // 레지스트리에 GlobalSetting 정보가 있는지 확인
            let oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            let sLangu = "EN";
            // WS Language 기본값

            // 레지스트리에 저장된 WS language 값
            if (oSettingValues.language) {
                sLangu = oSettingValues.language.value;
            }

            resolve(sLangu);

        });

    },
    // end of getWsLanguAsync

    /**
     * WS Global Language를 레지스트리에 저장
     */
    setWsLanguAsync: function (sWsLangu) {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

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

    },
    // end of setWsLanguAsync

    /*********************************************************
     * Key값에 해당하는 글로벌 설정 값을 구한다.
     *********************************************************/
    getGlobalSettingInfo : function(key){

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            // 레지스트리에 GlobalSetting 정보가 있는지 확인
            let oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            // 레지스트리에 저장된 WS language 값
            if (!oSettingValues[key]) {
                return resolve();
            }

            return resolve(oSettingValues[key]);

        });


    },

    /*********************************************************
     * 글로벌 설정값을 저장하는 함수
     *********************************************************/
    saveGlobalSettingInfo : function(key, value){

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

            // 저장할 레지스트리 데이터
            let oRegData = {};
            oRegData[sGlobalSettingPath] = {};
            oRegData[sGlobalSettingPath][key] = {
                value: value,
                type: "REG_SZ"
            };

            try {

                await this.putRegeditValue(oRegData);

            } catch (error) {
                
                resolve({
                    RETCD: "E",
                    RTMSG: error && error.toString() || "Register Save Error!!"
                });

                return;
            }            

            resolve({ RETCD: "S" });

        });


    },

    /**
     * WS 3.0 전용 메시지 리턴
     */
    getWsMsgClsTxt: function (LANGU, ARBGB, MSGNR, p1, p2, p3, p4) { // www에 내장되어 있는 WS 메시지 경로

        // let oSettingInfo = this.getWsSettingsInfo();

        // // 메시지 언어를 서버 로그인 언어로 할지 플래그
        // let bIsServer = parent?.process?.USERINFO?.isServDependLangu;

        // // 메시지 언어를 글로벌 언어로 할 경우
        //  if(bIsServer === "X"){        
        //     LANGU = parent.process.USERINFO.LANGU;
        // }
        // else {
        //     LANGU = oSettingInfo.globalLanguage;
        // }

        if(parent?.process?.USERINFO?.LANGU){
            LANGU = parent?.process?.USERINFO?.LANGU;
        }

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
        if (sText.includes("&")) { // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다.
            for (let i = 0; i < iWithParamLenth; i++) {

                let sParamTxt = aWithParam[i];

                sText = sText.replace(new RegExp("&", "i"), sParamTxt);

            }

        }

        sText = sText.replace(new RegExp("&", "g"), "");

        return sText;

    },
    // end of getWsMsgClsTxt

    /**
     * WS 3.0 전용 메시지 모델 정보 구조
     */
    getWsMsgModelData: function () {

        return new Promise(async (resolve) => {

            let oSettingInfo = this.getWsSettingsInfo();
            let sWsLangu = oSettingInfo.globalLanguage; // WS Language 설정 정보
            
            // // 메시지 언어를 서버 로그인 언어로 할지 플래그
            // let bIsServer = parent?.process?.USERINFO?.isServDependLangu;

            // //  메시지 언어를 서버 로그인 언어로 할 경우
            // if(bIsServer === "X"){            
            //     sWsLangu = parent.process.USERINFO.LANGU;
            // }

            if(parent?.process?.USERINFO?.LANGU){
                sWsLangu = parent?.process?.USERINFO?.LANGU;
            }

            let sWsMsgPath = PATH.join(PATHINFO.WSMSG_ROOT, "WS_COMMON", sWsLangu); // www에 내장되어 있는 WS 메시지 경로

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

            resolve({ RETCD: "S", RTDATA: oLanguJsonData });

        });

    }, // end of getWsMsgModelData

    getWsRegisterU4AIcons: function (sap) {

        let oSettingInfo = this.getWsSettingsInfo(),
            oU4ASettingsInfo = oSettingInfo.U4A,
            oU4AIconsInfo = oU4ASettingsInfo.icons,
            oFwInfo = oU4AIconsInfo.fontAwesome,
            oFwCollNames = oFwInfo.collectionNames,
            oFwList = oFwInfo.fontList;

        // fontawesome 아이콘 추가
        let sUrlRoot = PATHINFO.U4AICON_ROOT,
            sBrandsColName = oFwCollNames.brands,
            sRegularColName = oFwCollNames.regular,
            sSolidColName = oFwCollNames.solid;

        sap.ui.requireSync("sap/ui/core/IconPool");

        // 로컬 경로 Protocol 변경
        sUrlRoot = sUrlRoot.replaceAll("\\", "/");
        sUrlRoot = `file:///${sUrlRoot}`;
        sUrlRoot = encodeURI(sUrlRoot);

        sap.ui.core.IconPool.registerFont({ collectionName: sRegularColName, fontFamily: oFwList.regular, fontURI: sUrlRoot, lazy: true });

        sap.ui.core.IconPool.registerFont({ collectionName: sBrandsColName, fontFamily: oFwList.brands, fontURI: sUrlRoot, lazy: true });

        sap.ui.core.IconPool.registerFont({ collectionName: sSolidColName, fontFamily: oFwList.solid, fontURI: sUrlRoot, lazy: true });

    },


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

        for (var e, h, u, a = [], c =
            {}, o = 0, f = n.length; f > o; o++) {
            e = n[o],
                h = e[r],
                u = e[t] || 0,
                c[h] = c[h] || [],
                e[z] = c[h],
                0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
        }

        tm2[z] = a;

    },
    // end of parseArrayToTree

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

                    o[sArrName] && (t(o[sArrName]), delete o[sArrName]);
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

    },
    // end of parseTreeToArray

    /**
     * Electron Browser Window Open 시 Opacity를 이용하여 자연스러운 동작 연출
     * @param {BrowserWindow} oBrowserWindow 
     * 
     * @fnFinish {Function} - 옵션
     * - opacity가 끝났을 때 호출 해준다.
     */
    setBrowserOpacity: function (oBrowserWindow, fnFinish) {

        let iOpa = 0.0,
            iInterval;


        iInterval = setInterval(() => {

            if (iOpa > 1) {                

                if (iInterval) {

                    clearInterval(iInterval);
                    iInterval = undefined;
                    
                    if(oBrowserWindow.isDestroyed()){                        
                        return;    
                    }

                    // Browser에 opacity를 주다가 외부에서 메소드로 browser.close()를 하면
                    // 막을 방법이 없으므로 어짜피 닫힐 녀석이면 isDestroyed 체크가 걸려서 빠져나갈 놈이였기 때문에
                    // 순간 찰나에 여기를 탔다 하더라도 원래 isDestroyed 체크가 걸린것과 동일하게 빠져나가기 위해
                    //  try catch로 예외처리 함.
                    try {                       

                        oBrowserWindow.setOpacity(1.0);                       

                        if(typeof fnFinish === "function"){
                            fnFinish();
                        }

                    } catch (error) {
                        
                        if(typeof fnFinish === "function"){
                            fnFinish();
                        }
                    }
                    
                }

                return;
            }

            iOpa += 0.02;

            if(oBrowserWindow.isDestroyed()){
                clearInterval(iInterval);
                iInterval = undefined;
                return;    
            }

            // Browser에 opacity를 주다가 외부에서 메소드로 browser.close()를 하면
            // 막을 방법이 없으므로 어짜피 닫힐 녀석이면 isDestroyed 체크가 걸려서 빠져나갈 놈이였기 때문에
            // 순간 찰나에 여기를 탔다 하더라도 원래 isDestroyed 체크가 걸린것과 동일하게 빠져나가기 위해
            //  try catch로 예외처리 함.
            try {
                oBrowserWindow.setOpacity(iOpa);    
            } catch (error) {
                clearInterval(iInterval);
                iInterval = undefined;          
                return; 
            }            

        }, 10);

    },
    // end of setBrowserOpacity

    /**
     * 부모 윈도우 위치의 가운데 배치한다.
     * @param {REMOTE} REMOTE
     * - REMOTE 객체
     * 
     * @param {BrowserWindow} oChildWinow
     * - 부모 윈도우 위치에 가운데 배치할 자식 윈도우 인스턴스
     * 
     * @param {Object} oBrowserOptions
     * - 자식 윈도우 인스턴스의 브라우저 옵션
     */
    setParentCenterBounds: function (REMOTE, oChildWinow, oBrowserOptions) {

        var oMainWindow = REMOTE.getCurrentWindow();

        var SCREEN = REMOTE.require("electron").screen;

        // 부모 창의 위치와 크기 가져오기
        const [parentX, parentY] = oMainWindow.getPosition();
        const [parentWidth, parentHeight] = oMainWindow.getSize();

        zconsole.log("parentX", parentX);
        zconsole.log("parentY", parentY);

        // 부모 창의 중앙 위치
        const parentCenterX = parentX + parentWidth / 2;
        const parentCenterY = parentY + parentHeight / 2;

        // 부모 창이 위치한 디스플레이들을 찾기
        const displays = SCREEN.getAllDisplays();
        let displayA, displayB;
        for (const display of displays) {
            const { x, y, width, height } = display.workArea;
            if (parentCenterX >= x && parentCenterX < x + width && parentCenterY >= y && parentCenterY < y + height) {
                if (!displayA) {
                    displayA = display;
                } else {
                    displayB = display;
                    break;
                }
            }
        }

        // 자식 창의 위치, 크기 정보
        let oChildBounds = oChildWinow.getBounds();        

        // 자식 창의 크기 설정
        const childWidth = oChildBounds.width;
        const childHeight = oChildBounds.height;        

        // 자식 창의 위치를 부모 창의 가운데로 설정, 배율을 고려하여 계산
        let childX = Math.round(parentX + (parentWidth - childWidth) / 2);
        let childY = Math.round(parentY + (parentHeight - childHeight) / 2);

        // 자식 창의 위치를 디스플레이 작업 영역 안에 있도록 조정
        if (displayA) {
            const { x: displayAX, y: displayAY, width: displayAWidth, height: displayAHeight } = displayA.workArea;
            if (childX < displayAX) childX = displayAX;
            if (childY < displayAY) childY = displayAY;
            if (childX + childWidth > displayAX + displayAWidth) childX = displayAX + displayAWidth - childWidth;
            if (childY + childHeight > displayAY + displayAHeight) childY = displayAY + displayAHeight - childHeight;
        }

        if (displayB) {
            const { x: displayBX, y: displayBY, width: displayBWidth, height: displayBHeight } = displayB.workArea;
            if (childX < displayBX) childX = displayBX;
            if (childY < displayBY) childY = displayBY;
            if (childX + childWidth > displayBX + displayBWidth) childX = displayBX + displayBWidth - childWidth;
            if (childY + childHeight > displayBY + displayBHeight) childY = displayBY + displayBHeight - childHeight;
        }

        let oBounds = {
            width: childWidth,
            height: childHeight,
            x: childX,
            y: childY,    
        }

        var oCurrScreen = displayA || displayB;
        var oCurrScreenBound = oCurrScreen?.bounds;

        // 계산된 자식의 y위치보다 부모의 y가 더 크다면 부모 y로 조정
        if(oBounds.y <= parentY){
            
            oBounds.y = parentY;

            if(oCurrScreenBound && oBounds.y <= oCurrScreenBound.y){

                oBounds.y = oCurrScreenBound.y;

            }
            
        }

        oChildWinow.setBounds(oBounds);

    },
    // end of setParentCenterBounds

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
                    resolve({ RETCD: "E", RTMSG: err.toString() })
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

                resolve({ RETCD: "S", RTDATA: aFileExtInfo });

            });


        });

    },
    // end of getFileExtSvgIcons

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

    },
    // end of getRandomKey

    /**
     * WS Setting 정보     
     */
    getWsSettingsInfo: function () {

        let sSetttingJsonData = FS.readFileSync(PATHINFO.WSSETTINGS, 'utf-8'),
            oSettings = JSON.parse(sSetttingJsonData);

        return oSettings;

    },
    // end of getWsSettingsInfo

    
    setWsSettingsInfo: function(oSettingInfo){

        var sSettingJson = JSON.stringify(oSettingInfo);

        FS.writeFileSync(PATHINFO.WSSETTINGS, sSettingJson);

    },

    /**
     * WS Global Setting 정보 [레지스트리에 설정된 값 구하기]
     */
    getWsGlobalSettingInfoAsync: function () {

        return new Promise(async (resolve) => {

            let oSettings = this.getWsSettingsInfo(), // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings;
            // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await this.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            // 레지스트리에 GlobalSetting 정보가 있는지 확인
            let oGlobalSettingRegData = oRetData[sGlobalSettingPath],
                oSettingValues = oGlobalSettingRegData.values;

            resolve(oSettingValues);

        });

    },
    // getWsGlobalSettingInfoAsync

    /**
     * 레지스트리에 저장된 whiteList Object 목록에 존재 여부 확인
     */
    checkWLOListAsync: function (SYSID = "", REGTYP = "", CHGOBJ = "") {

        return new Promise(async (resolve) => { // 레지스트리에 저장된 whiteList Object 목록을 구한다.
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

    },
    // end of checkWLOListAsync

    /**
     * 레지스트리에 저장된 whiteList Object 목록
     */
    getWsWLOListAsync: function (SYSID = "") {

        return new Promise(async (resolve) => { // 레지스트리의 WS SYSTEM 경로를 구한다.
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

    },
    // end of getWsWLOListAsync

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

                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });

                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: files });

            });

        });

    },
    // end of readdir

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

                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });

                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: data });

            });

        });

    },
    // end of readFile

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

                resolve({ RETCD: "S", RTMSG: "", RTDATA: "" });

            }).catch(function (err) {

                resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });

            });


        });

    },
    // end of fsCopy

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
                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });
                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: "" });

            });


        });

    }, // end of fsWriteFile

    fsStat: function (sFilePath) {

        return new Promise(async (resolve) => {

            FS.stat(sFilePath, (err, stats) => {

                if (err) {
                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });
                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: stats });

            });

        });


    }, // end of fsStat

    fsRemove: function (sRemovePath) {

        return new Promise(async (resolve) => {

            FS.remove(sRemovePath, (err) => {

                if (err) {
                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });
                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: "" });

            });

        });

    },
    // end of fsRemove

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

                resolve({ RETCD: "E", RTMSG: "", RTDATA: "" });

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
                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });
                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: result[sRegPath] });

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
                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });
                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: result });

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

                    resolve({ RETCD: "E", RTMSG: err.toString(), RTDATA: "" });

                    return;
                }

                resolve({ RETCD: "S", RTMSG: "", RTDATA: "" });

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

    /**
     * 아이콘 리스트 즐겨찾기 정보 개인화 저장
     * @param {String} SYSID     
     *  - 접속 서버의 SYSTEM ID
     * 
     * @param {String} ICON_SRC
     *  - 저장 할 Icon Src
     *  
     * @param {Boolean} bIsFav 
     *  - 저장 유무
     */
    setIconFavorite: function (SYSID, aIconInfo) {

        // P13N_ICONFAV
        let sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
            sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`);

        try {

            // 파일이 없으면 생성
            if (!FS.existsSync(sIconFavFilePath)) {

                this.fsWriteFile(sIconFavFilePath, JSON.stringify([]));

            }

            this.fsWriteFile(sIconFavFilePath, JSON.stringify(aIconInfo));

        } catch (error) {

            let _sErrMsg = "[Icon Favorite save]: " + error.toString() + " \n\n ";
            console.log("아이콘 즐겨찾기 저장 오류", _sErrMsg);
            throw new Error(error);
        }

    }, // end of setIconFavorite

    /**
     * SYSID 별 아이콘 즐겨찾기 정보를 구한다.
     * @param {String} SYSID 
     * @returns {Array}
     */
    getIconFavorite: function (SYSID) {

        // P13N_ICONFAV
        let sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
            sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`);

        // 파일이 없으면 생성
        if (!FS.existsSync(sIconFavFilePath)) {
            return [];
        }

        try {

            var sJsonData = FS.readFileSync(sIconFavFilePath, 'utf-8'),
                aFavIcon = JSON.parse(sJsonData);

        } catch (error) {

            return [];

        }

        return aFavIcon;

    }, // end of getIconFavorite

    /*****************************************************
     * IPC 통신으로 현재 시스템 접속 관련 정보를 얻는다.
     *****************************************************/
    getSysInfoIPC : function(IF_DATA){

        return new Promise((resolve) => {
            
            // IF_DATA 타입이 Object 가 아니면 빠져나감!!
            if(typeof IF_DATA !== "object"){
                return resolve();
            }

            // PRCCD는 필수!!
            if(!IF_DATA?.PRCCD){
                return resolve();
            }

            // BROWSKEY 필수!!
            if(!IF_DATA?.BROWSKEY){
                return resolve();
            }

            let lf_ipc_callback = function(event, res){
                
                IPCRENDERER.off(`if-get-sys-info-result-${IF_DATA.BROWSKEY}`, lf_ipc_callback);

                resolve(res);

            };

            let oIF_DATA = {};

            oIF_DATA.TO_CHID = `if-get-sys-info-result-${IF_DATA.BROWSKEY}`;

            Object.assign(oIF_DATA, IF_DATA);

            IPCRENDERER.send(`if-get-sys-info-${IF_DATA.BROWSKEY}`, oIF_DATA);

            IPCRENDERER.on(`if-get-sys-info-result-${IF_DATA.BROWSKEY}`, lf_ipc_callback);

        });

    }, // end of getSysInfoIPC


};
