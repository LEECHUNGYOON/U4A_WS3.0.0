const
    REMOTE = require('@electron/remote'),
    FS = require('fs-extra'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"),
    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    WSUTIL = require(PATHINFO.WSUTIL);

module.exports = {

    /**
     * Default Pattern Json Data
     */
    getDefaultPatternJsonData: function () {

        return new Promise(async (resolve) => {          
          
            // 각 확장자에 맞는 svg 경로를 구한다.
            let aIcons,
                oHtmlIconInfo = {},
                oJsIconInfo = {},

                // 테스트 목적
                sUi5IconUrl = "https://sap.github.io/ui5-webcomponents/assets/images/ui5-logo.png";

            // 파일 확장자에 맞는 SVG 아이콘 정보를 가져온다.
            let oIconResult = await parent.WSUTIL.getFileExtSvgIcons();
            if (oIconResult.RETCD == "S") {

                aIcons = oIconResult.RTDATA;
                oHtmlIconInfo = aIcons.find(elem => elem.EXTNM === "html") || {};
                oJsIconInfo = aIcons.find(elem => elem.EXTNM === "js") || {};

            }

            // 테스트 목적임!!!!
            if (APP.isPackaged) {
                sUi5IconUrl = "";
            }

            let aPatternJson = [{
                "PKEY": "",
                "CKEY": "PATT001",
                "TYPE": "ROOT",
                "DESC": oAPP?.common?.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E10") // Default Pattern
            }, {
                "PKEY": "PATT001",
                "CKEY": "PTN001",
                "DESC": "HTML",
                "ICON": oHtmlIconInfo.ICONPATH || ""
            },
            {
                "PKEY": "PTN001",
                "CKEY": "PTN001_001",
                "DESC": "HTML 기본패턴",
                "ACTCD": "01"
            },
            {
                "PKEY": "PTN001",
                "CKEY": "PTN001_002",
                "DESC": "FORM 기본패턴",
                "ACTCD": "01"
            }, {
                "PKEY": "PTN001",
                "CKEY": "PTN001_003",
                "DESC": "Iframe 기본패턴",
                "ACTCD": "01"
            }, {
                "PKEY": "PTN001",
                "CKEY": "PTN001_004",
                "DESC": "UI5 기본패턴",
                "ACTCD": "01",
                "ICON": sUi5IconUrl
            }, {
                "PKEY": "PTN001_004",
                "CKEY": "PTN001_004_001",
                "DESC": "UI5 BootStrap",
                "ACTCD": "01"
            }, {
                "PKEY": "PATT001",
                "CKEY": "PTN002",
                "DESC": "JS",
                "ICON": oJsIconInfo.ICONPATH || ""
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_001",
                "DESC": "JS 기본 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_002",
                "DESC": "즉시실행함수 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_003",
                "DESC": "Module js 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_004",
                "DESC": "윈도우 이벤트 패턴",
                "ACTCD": "02"
            }
            ];

            resolve({ RETCD: "S", RTDATA: aPatternJson });

        });

    },

    /**
     * Custom Pattern Json Data
     */
    getCustomPatternInitData: function () {

        return [{
            "PKEY": "",
            "CKEY": "PATT002",
            "TYPE": "ROOT",
            "DESC": oAPP?.common?.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E11"), // Custom Pattern
            "ISSTART": true
        }];

    },

    getDefaultPatternData: function () {

        return new Promise(async (resolve) => {

            // 1. 기본 패턴 array 정보를 구한다.
            let oDefPatt = await this.getDefaultPatternJsonData(),
                aDefPattData = oDefPatt.RTDATA;

            // 2. 기본 패턴 파일 정보를 구한다. 
            // 앱 내에 설치되어 있는 기본 패턴 정보의 파일을 읽어서 Array와 매칭 시킨다.
            let oDefPattFileDataResult = await this.getDefaultPatternFileData();
            if (oDefPattFileDataResult.RETCD == "S") {

                let aDefPattFileData = oDefPattFileDataResult.RTDATA,
                    iDefPattFileDataLength = aDefPattFileData.length;

                for (var i = 0; i < iDefPattFileDataLength; i++) {

                    let oDefPattFileData = aDefPattFileData[i];

                    // 3. 같은 Key값을 비교하여 1, 2를 매칭 시킨다.
                    let oDefPattData = aDefPattData.find(elem => elem.CKEY == oDefPattFileData.KEY);
                    if (!oDefPattData) {
                        continue;
                    }

                    oDefPattData.DATA = oDefPattFileData.DATA;

                }

            }

            resolve({ RETCD: "S", RTMSG: "", RTDATA: aDefPattData });

        });

    }, // end of getDefaultPatternData

    /**
     * 설치 폴더에 있는 기본 패턴파일 데이터 읽기
     */
    getDefaultPatternFileData: function () {

        return new Promise(async (resolve) => {

            let sPatternPath = PATHINFO.USERDATA_PATT_FILES,
                oResult = await WSUTIL.readDir(sPatternPath);

            if (oResult.RETCD == "E") {
                resolve(oResult);
                return;
            }

            // 폴더 목록의 파일들을 읽어서 리턴해준다.
            let aPatternList = oResult.RTDATA,
                iPattLength = aPatternList.length,
                aPatternInfo = [];

            for (var i = 0; i < iPattLength; i++) {

                let sFileName = aPatternList[i],
                    sFileKey = sFileName.split(".")[0],
                    sFilePath = sPatternPath + "\\" + sFileName;

                let oFileDataResult = await WSUTIL.readFile(sFilePath);
                if (oFileDataResult.RETCD == "E") {
                    continue;
                }

                let sFileData = oFileDataResult.RTDATA,
                    oPatternInfo = {
                        KEY: sFileKey,
                        DATA: sFileData
                    };

                aPatternInfo.push(oPatternInfo);

            }

            if (aPatternInfo.length == 0) {
                resolve({
                    RETCD: "E",
                    // RTMSG: "데이터 없음"
                });
                return;
            }

            resolve({
                RETCD: "S",
                RTMSG: "",
                RTDATA: aPatternInfo
            });

        });

    }, // end of readDefaultPatternFiles




};