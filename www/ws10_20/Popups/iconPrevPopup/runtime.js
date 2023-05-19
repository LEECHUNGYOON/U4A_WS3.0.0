
/************************************************************************
 * Global..
 ************************************************************************/
var oAPP = parent.oAPP;

if (!oAPP) {
    oAPP = {};
    oAPP.fn = {};
    oAPP.msg = {};
    oAPP.attr = {};

    window.oAPP = oAPP;
}

const
    require = parent.require,
    REMOTE = require('@electron/remote'),
    CLIPBOARD = REMOTE.clipboard,
    PATH = REMOTE.require('path'),
    FS = REMOTE.require("fs"),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    zconsole = WSERR(window, document, console),
    WSUTIL = require(PATHINFO.WSUTIL),
    IPCRENDERER = require('electron').ipcRenderer,
    CURRWIN = parent.CURRWIN,
    PARWIN = parent.PARWIN;

let oIntersectionObserverOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0,
},
    oIntersectionObserver = new IntersectionObserver(fnIntersectionObserverCallback, oIntersectionObserverOptions);

// test
var G_bIsMe = "";


/**
* 아이콘 리스트 팝업을 콜백으로 실행했을 경우 타는 이벤트 핸들러
*/
IPCRENDERER.on("if-icon-isCallback", function (events, isCallback) {

    oAPP.attr.isCallback = isCallback;

    let oCoreModel = sap.ui.getCore().getModel();
    if (oCoreModel) {
        oCoreModel.setProperty("/PRC/MINI_INVISI", oAPP.attr.isCallback);
    }

    if (oAPP.attr.isCallback === "X") {
        CURRWIN.setParentWindow(PARWIN);
        return;
    }

    CURRWIN.setParentWindow(null);

});


function fnWait() {

    return new Promise((resolve) => {

        setTimeout(() => {

            resolve();

        }, 3000);

    });

}



/************************************************************************
 * Attach Init
 ************************************************************************/
oAPP.fn.attachInit = async () => {

    // await fnWait();

    // 테마별 색상 정보 구하기
    _fnGetThemeColors();

    // 현재 브라우저의 이벤트 핸들러 
    _attachCurrentWindowEvents();

    await oAPP.fn.getWsMessageList(); // 반드시 이 위치에!!

    oAPP.fn.fnInitRendering();

    oAPP.fn.fnInitModelBinding();

    /**
     * 무조건 맨 마지막에 수행 되어야 함!!
     */

    // 자연스러운 로딩
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, _fnUIupdatedCallback);

}; // end of oAPP.fn.attachInit

/************************************************************************
 * 아이콘을 사용할 수 있도록 IconPool에 등록한다.
 ************************************************************************/
function _fnRegisterIconPool() {

    jQuery.sap.require("sap.ui.core.IconPool");

    // Tnt Icons
    var oIconSet1 = {
        collectionName: "SAP-icons-TNT",
        fontFamily: "SAP-icons-TNT",
        fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
        lazy: true
    };

    var oIconPool = sap.ui.core.IconPool;
    oIconPool.registerFont(oIconSet1);

    // BusinessSuite Icons
    var oIconSet2 = {
        collectionName: "BusinessSuiteInAppSymbols",
        fontFamily: "BusinessSuiteInAppSymbols",
        fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts"),
        lazy: true
    };

    oIconPool.registerFont(oIconSet2);

} // end of _fnRegisterIconPool

/************************************************************************
 * 서버에서 U4A Icon 정보를 구한다.
 ************************************************************************/
function fnGetFontAwesomeIcon() {

    return new Promise(async (resolve) => {

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            oU4ASettingsInfo = oSettingInfo.U4A,
            oU4AIconsInfo = oU4ASettingsInfo.icons,
            oFwInfo = oU4AIconsInfo.fontAwesome,
            oFwCollNames = oFwInfo.collectionNames,
            oFwList = oFwInfo.fontList;

        // fontawesome 아이콘 추가
        let sUrlRoot = oFwInfo.rootPath,
            sBrandsColName = oFwCollNames.brands,
            sRegularColName = oFwCollNames.regular,
            sSolidColName = oFwCollNames.solid;

        sap.ui.core.IconPool.registerFont({
            collectionName: sRegularColName,
            fontFamily: oFwList.regular,
            fontURI: sUrlRoot,
            lazy: false
        });

        sap.ui.core.IconPool.registerFont({
            collectionName: sBrandsColName,
            fontFamily: oFwList.brands,
            fontURI: sUrlRoot,
            lazy: false
        });

        sap.ui.core.IconPool.registerFont({
            collectionName: sSolidColName,
            fontFamily: oFwList.solid,
            fontURI: sUrlRoot,
            lazy: false
        });


        // 서버에서 가져올 JSON 경로를 설정
        let sFwRoot = oFwInfo.rootPath,
            aJsonUrlInfo = [
                { path: `${sFwRoot}/${oFwList.regular}.json`, name: oFwList.regular, collectionName: oFwCollNames.regular },
                { path: `${sFwRoot}/${oFwList.brands}.json`, name: oFwList.brands, collectionName: oFwCollNames.brands },
                { path: `${sFwRoot}/${oFwList.solid}.json`, name: oFwList.solid, collectionName: oFwCollNames.solid },
            ],
            aPromise = [];

        // 서버가서 관련 Json 가져오기 
        for (var i = 0; i < aJsonUrlInfo.length; i++) {

            let oJsonInfo = aJsonUrlInfo[i],
                oParam = {
                    url: oJsonInfo.path,
                    responseType: "json",
                    method: "GET",
                    collectionName: oJsonInfo.collectionName,
                };

            // 서버 호출
            aPromise.push(getJsonAsync(oJsonInfo.path, oParam));

        }

        // 서버 호출 결과
        let aResult = await Promise.all(aPromise),
            iResLength = aResult.length,
            sIconSrcPrefix = "sap-icon://",
            aIcons = [];

        // 아이콘 정보를 합친다.
        for (var i = 0; i < iResLength; i++) {

            let oResult = aResult[i];

            if (oResult.RETCD == "E") {
                continue;
            }

            let oParam = oResult.PARAM,
                oIcons = oResult.RTDATA;

            for (var j in oIcons) {

                let oIconInfo = {};
                oIconInfo.ICON_NAME = j;
                oIconInfo.ICON_SRC = `${sIconSrcPrefix}${oParam.collectionName}/${j}`;
                oIconInfo.RATVAL = 0;
                aIcons.push(oIconInfo);

            }

        }

        // 메타 정보를 구한다.
        let oGetMeta = await getJsonAsync(oFwInfo.iconMetaJson);

        /**
         * 메타데이터와 아이콘 정보가 있을 경우
         * 아이콘 정보에 연관 키워드 정보를 매핑한다.
         */
        if (oGetMeta.RETCD === "S" && aIcons.length !== 0) {

            let oMetadata = oGetMeta.RTDATA;

            for (var i in oMetadata) {

                let oIconMeta = oMetadata[i],
                    sLabel = oIconMeta.label;

                let oFound = aIcons.find(elem => elem.ICON_NAME === sLabel);
                if (!oFound) {
                    continue;
                }

                let aKeyWords = oIconMeta?.search?.terms || [],
                    iKeyWordLength = aKeyWords.length,
                    sSeparator = "|";

                oFound.KEYWORDS = [];

                for (var i = 0; i < iKeyWordLength; i++) {

                    let sKeyWord = aKeyWords[i];

                    oFound.KEYWORDS.push({
                        NAME: sKeyWord
                    });

                }

                oFound.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

            }

        }

        // 기 저장된 아이콘 정보가 있을 경우 저장된 값을 매핑한다.
        let aSavedIconFavData = oAPP.attr.aSavedIconFavData;
        if (aSavedIconFavData && Array.isArray(aSavedIconFavData) == true) {

            let iSavedIconLength = aSavedIconFavData.length;
            for (var i = 0; i < iSavedIconLength; i++) {

                let oSavedIcon = aSavedIconFavData[i];

                var oFind = aIcons.find(elem => elem.ICON_SRC == oSavedIcon.ICON_SRC);
                if (!oFind) {
                    continue;
                }

                oFind.RATVAL = oSavedIcon.RATVAL;

            }

        }

        let oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/ICONS/U4A", aIcons);

        resolve();

    });

} // end of fnGetFontAwesomeIcon

/************************************************************************
 * Array 구조의 키워드 정보를 String으로 변환
 ************************************************************************/
function fnGetKeyWordToString(aKeyWords, sSeparator) {

    if (!Array.isArray(aKeyWords)) {
        return "";
    }

    let iKeyWordLength = aKeyWords.length;
    if (iKeyWordLength === 0) {
        return "";
    }

    let sKeyWordString = "";
    for (var i = 0; i < iKeyWordLength; i++) {

        let sKeyWord = aKeyWords[i];
        sKeyWordString += sKeyWord + sSeparator;

    }

    return sKeyWordString;

} // end of fnGetKeyWordToString

/************************************************************************
 * U4A Icon 관련 설정
 ************************************************************************/
function fnU4AIconConfig() {

    return new Promise(async (resolve) => {

        // Font Awesome 아이콘 등록 및 구하기
        await fnGetFontAwesomeIcon();

        resolve();

    });

} // end of fnU4AIconConfig

/************************************************************************
 * SAP ICON 정보를 구성한다.
 ************************************************************************/
function fnSAPIconConfig() {

    return new Promise(async (resolve) => {

        let aIconNames = sap.ui.core.IconPool.getIconNames(),
            iIconLength = aIconNames.length;

        let aIcons = [];
        for (var i = 0; i < iIconLength; i++) {

            let sIconName = aIconNames[i];

            let oIconInfo = {
                ICON_NAME: sIconName,
                ICON_SRC: `sap-icon://${sIconName}`,
                RATVAL: 0
            }

            aIcons.push(oIconInfo);

        }

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            sUI5IconTagsJsonPath = jQuery.sap.getResourcePath(oSettingInfo.UI5.UI5IconTagsJsonPath);

        let oIconTagsResult = await getJsonAsync(sUI5IconTagsJsonPath);
        if (oIconTagsResult.RETCD == "E") {
            resolve();
            return;
        }

        oAPP.attr.oIconTagData = oIconTagsResult.RTDATA;

        let oIconTags = oAPP.attr.oIconTagData;

        for (var i in oIconTags) {

            let oIconMeta = oIconTags[i],
                oFound = aIcons.find(elem => elem.ICON_NAME === i);

            if (!oFound) {
                continue;
            }

            let aKeyWords = oIconMeta.tags || [],
                iKeyWordLength = aKeyWords.length,
                sSeparator = "|";

            oFound.KEYWORDS = [];

            for (var i = 0; i < iKeyWordLength; i++) {

                let sKeyWord = aKeyWords[i];

                oFound.KEYWORDS.push({
                    NAME: sKeyWord
                });

            }

            oFound.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

        }

        // 기 저장된 아이콘 정보가 있을 경우
        let aSavedIconFavData = oAPP.attr.aSavedIconFavData;
        if (aSavedIconFavData && Array.isArray(aSavedIconFavData) == true) {

            let iSavedIconLength = aSavedIconFavData.length;
            for (var i = 0; i < iSavedIconLength; i++) {

                let oSavedIcon = aSavedIconFavData[i];

                var oFind = aIcons.find(elem => elem.ICON_SRC == oSavedIcon.ICON_SRC);
                if (!oFind) {
                    continue;
                }

                oFind.RATVAL = oSavedIcon.RATVAL;

            }

        }

        let oCoreModel = sap.ui.getCore().getModel();

        oCoreModel.setProperty("/ICONS/ICON_LIST", aIcons);
        oCoreModel.setProperty("/ICONS/SAP", aIcons);

        resolve();

    });

} // end of fnSAPIconConfig

/************************************************************************
 * SAP Tnt Icon 구하기
 ************************************************************************/
function fnGetSapTntIcons() {

    return new Promise(async (resolve) => {

        // 아이콘 목록이 저장되어있는 JSON 파일을 읽는다.
        let sUrl = sap.ui.require.toUrl("sap/tnt/themes/base/fonts/SAP-icons-TNT.json"),
            oIconListResult = await getJsonAsync(sUrl);

        if (oIconListResult.RETCD == "E") {
            resolve();
            return;
        }

        let oIconList = oIconListResult.RTDATA,
            aIcons = [];

        // 가져온 JSON 목록을 추가 정보를 구성하여 Array에 저장한다.
        for (var sIconName in oIconList) {

            let oIconInfo = {
                ICON_NAME: sIconName,
                ICON_SRC: `sap-icon://SAP-icons-TNT/${sIconName}`,
                RATVAL: 0
            }

            aIcons.push(oIconInfo);

        }

        let iIconlength = aIcons.length;
        if (iIconlength == 0) {
            resolve();
            return;
        }

        // 각각 아이콘에 맞는 keyword를 매핑한다.
        let oIconTags = oAPP.attr.oIconTagData;

        for (var i = 0; i < iIconlength; i++) {

            let oIconItem = aIcons[i],
                oIconMeta = oIconTags[oIconItem.ICON_NAME];

            if (!oIconMeta) {
                continue;
            }

            let aKeyWords = oIconMeta.tags || [],
                iKeyWordLength = aKeyWords.length,
                sSeparator = "|";

            oIconItem.KEYWORDS = [];

            for (var j = 0; j < iKeyWordLength; j++) {

                let sKeyWord = aKeyWords[j];

                oIconItem.KEYWORDS.push({
                    NAME: sKeyWord
                });

            }

            oIconItem.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

        }

        // 기 저장된 아이콘 정보가 있을 경우
        let aSavedIconFavData = oAPP.attr.aSavedIconFavData;
        if (aSavedIconFavData && Array.isArray(aSavedIconFavData) == true) {

            let iSavedIconLength = aSavedIconFavData.length;
            for (var i = 0; i < iSavedIconLength; i++) {

                let oSavedIcon = aSavedIconFavData[i];

                var oFind = aIcons.find(elem => elem.ICON_SRC == oSavedIcon.ICON_SRC);
                if (!oFind) {
                    continue;
                }

                oFind.RATVAL = oSavedIcon.RATVAL;

            }

        }

        var oCoreModel = sap.ui.getCore().getModel(),
            aSAPIcons = oCoreModel.getProperty("/ICONS/SAP");

        aSAPIcons = aSAPIcons.concat(aIcons);

        oCoreModel.setProperty("/ICONS/SAP", aSAPIcons);
        oCoreModel.setProperty("/ICONS/ICON_LIST", aSAPIcons);

        resolve();

    });

} // end of fnGetSapTntIcons

/************************************************************************
 * SAP Business Icon 구하기
 ************************************************************************/
function fnGetSapBusinessIcons() {

    return new Promise(async (resolve) => {

        // 아이콘 목록이 저장되어있는 JSON 파일을 읽는다.
        let sUrl = sap.ui.require.toUrl("sap/ushell/themes/base/fonts/BusinessSuiteInAppSymbols.json"),
            oIconListResult = await getJsonAsync(sUrl);

        if (oIconListResult.RETCD == "E") {
            resolve();
            return;
        }

        let oIconList = oIconListResult.RTDATA,
            aIcons = [];

        // 가져온 JSON 목록을 추가 정보를 구성하여 Array에 저장한다.
        for (var sIconName in oIconList) {

            let oIconInfo = {
                ICON_NAME: sIconName,
                ICON_SRC: `sap-icon://BusinessSuiteInAppSymbols/${sIconName}`,
                RATVAL: 0
            }

            aIcons.push(oIconInfo);

        }

        let iIconlength = aIcons.length;
        if (iIconlength == 0) {
            resolve();
            return;
        }

        // 각각 아이콘에 맞는 keyword를 매핑한다.
        let oIconTags = oAPP.attr.oIconTagData;

        for (var i = 0; i < iIconlength; i++) {

            let oIconItem = aIcons[i],
                oIconMeta = oIconTags[oIconItem.ICON_NAME];

            if (!oIconMeta) {
                continue;
            }

            let aKeyWords = oIconMeta.tags || [],
                iKeyWordLength = aKeyWords.length,
                sSeparator = "|";

            oIconItem.KEYWORDS = [];

            for (var j = 0; j < iKeyWordLength; j++) {

                let sKeyWord = aKeyWords[j];

                oIconItem.KEYWORDS.push({
                    NAME: sKeyWord
                });

            }

            oIconItem.KEYWORD_STRING = fnGetKeyWordToString(aKeyWords, sSeparator);

        }

        // 기 저장된 아이콘 정보가 있을 경우
        let aSavedIconFavData = oAPP.attr.aSavedIconFavData;
        if (aSavedIconFavData && Array.isArray(aSavedIconFavData) == true) {

            let iSavedIconLength = aSavedIconFavData.length;
            for (var i = 0; i < iSavedIconLength; i++) {

                let oSavedIcon = aSavedIconFavData[i];

                var oFind = aIcons.find(elem => elem.ICON_SRC == oSavedIcon.ICON_SRC);
                if (!oFind) {
                    continue;
                }

                oFind.RATVAL = oSavedIcon.RATVAL;

            }

        }

        var oCoreModel = sap.ui.getCore().getModel(),
            aSAPIcons = oCoreModel.getProperty("/ICONS/SAP");

        aSAPIcons = aSAPIcons.concat(aIcons);

        oCoreModel.setProperty("/ICONS/SAP", aSAPIcons);
        oCoreModel.setProperty("/ICONS/ICON_LIST", aSAPIcons);

        resolve();

    });

} // end of fnGetSapBusinessIcons

/************************************************************************
 * 추가할 SAP ICON 정보를 구성한다.
 ************************************************************************/
function _fnAdditionalSAPIconConfig() {

    setTimeout(() => {

        let oProm1 = fnGetSapTntIcons(),
            oProm2 = fnGetSapBusinessIcons();

        Promise.all([oProm1, oProm2]).then((result) => {

            let oCoreModel = sap.ui.getCore().getModel();
            oCoreModel.refresh();

        });

    }, 500);

} // end of _fnAdditionalSAPIconConfig

/************************************************************************
 * 저장된 즐겨찾기 정보를 구한다.
 ************************************************************************/
function fnGetSavedFavIconInfo() {

    return new Promise((resolve) => {

        let sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
            SYSID = parent.oAPP.attr.USERINFO.SYSID,
            sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`);

        if (!FS.existsSync(sIconFavFilePath)) {
            resolve();
            return;
        }

        try {

            var sIconFavJsonData = FS.readFileSync(sIconFavFilePath, 'utf-8'),
                aIconFavData = JSON.parse(sIconFavJsonData);

        } catch (error) {

            let sErrMsg = "[Saved Icon Read Error]: \n \n " + error.toString();
            console.error(sErrMsg);

            throw new Error(sErrMsg);

        }

        oAPP.attr.aSavedIconFavData = aIconFavData;

        resolve();

    });

} // end of fnGetSavedFavIconInfo

/************************************************************************
 * UI5 버전 및 테마별 색상 정보를 구한다.
 ************************************************************************/
function _fnGetThemeColors() {

    oAPP.attr.themeColors = sap.ui.core.theming.Parameters.get();

} // end of _fnGetThemeColors

/************************************************************************
 * 즐겨찾기 저장할 Json 파일을 생성한다.
 ************************************************************************/
function _fnWriteFavJsonFile() {

    let sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
        SYSID = parent.oAPP.attr.USERINFO.SYSID,
        sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`);

    // 파일이 없으면 생성
    if (!FS.existsSync(sIconFavFilePath)) {

        FS.writeFileSync(sIconFavFilePath, JSON.stringify([]));

    }

} // end of _fnWriteFavJsonFile

/************************************************************************
 * 즐거찾기 저장된 Json 파일을 감지한다.
 ************************************************************************/
function _fnWatchFavJsonFile() {

    let sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
        SYSID = parent.oAPP.attr.USERINFO.SYSID,
        sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`);

    FS.watch(sIconFavFilePath, fnWatchFavJsonFile);

} // end of _fnWatchFavJsonFile

/************************************************************************
 * 즐거찾기 저장된 Json 파일을 감지되면 발생하는 이벤트
 ************************************************************************/
function fnWatchFavJsonFile() {

    debugger;

    if (G_bIsMe == "X") {
        G_bIsMe = "";
        return;
    }


} // end of fnWatchFavJsonFile



/************************************************************************
 * 현재 브라우저의 이벤트 핸들러
 ************************************************************************/
function _attachCurrentWindowEvents() {

    CURRWIN.on("maximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://value-help");

    });

    CURRWIN.on("unmaximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://header");

    });

} // end of _attachCurrentWindowEvents

function _fnUIupdatedCallback() {

    setTimeout(() => {
        $('#content').fadeIn(300, 'linear');
    }, 300);

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, _fnUIupdatedCallback);

    setTimeout(async () => {

        // sap tnt 아이콘을 로드 한다.
        _fnRegisterIconPool();

        // 저장된 즐겨찾기 정보를 구한다.
        await fnGetSavedFavIconInfo();

        // SAP ICON 관련 정보 구성
        await fnSAPIconConfig();

        // U4A ICON 관련 정보 구성
        await fnU4AIconConfig();

        // 추가할 SAP ICON 정보를 구성한다.
        _fnAdditionalSAPIconConfig();

        // 즐겨찾기 저장할 Json 파일을 생성한다.
        _fnWriteFavJsonFile();

        // 즐거찾기 저장된 Json 파일을 감지한다.
        _fnWatchFavJsonFile();

        parent.document.getElementById("u4aWsBusyIndicator").style.visibility = "hidden";

        oAPP.setBusy("");

    }, 500);

} // end of _fnUIupdatedCallback

/************************************************************************
 * 초기 모델 바인딩
 ************************************************************************/
oAPP.fn.fnInitModelBinding = function () {

    // 현재 버전에서 지원되는 테마 목록
    let aSupportedThemes = sap.ui.getVersionInfo().supportedThemes,
        iThemeLength = aSupportedThemes.length;

    // 테마 정보를 바인딩 구조에 맞게 변경
    let aThemes = [];
    for (var i = 0; i < iThemeLength; i++) {

        let sThemeName = aSupportedThemes[i];

        aThemes.push({
            KEY: sThemeName,
            THEME: sThemeName
        });

    }

    let oModelData = {
        PRC: {
            MenuSelectedKey: "SAP",
            MINI_INVISI: oAPP.attr.isCallback
        },
        THEME: {
            THEME_KEY: oAPP.attr.sDefTheme,
            THEME_LIST: aThemes
        },

        ICONS: {
            ICON_LIST: [],
            SAP: [],
            U4A: []
        }
    };


    let oJsonModel = new sap.ui.model.json.JSONModel();
    oJsonModel.setData(oModelData);
    oJsonModel.setSizeLimit(100000);

    sap.ui.getCore().setModel(oJsonModel);

}; // end of oAPP.fn.fnInitModelBinding

/************************************************************************
* 화면 초기 렌더링
************************************************************************/
oAPP.fn.fnInitRendering = function () {

    var oApp = new sap.m.App({
        autoFocus: false,
    }),
        oPage = new sap.m.Page({
            // properties
            showHeader: true,
            enableScrolling: false,
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.Image({
                        width: "25px",
                        src: PATHINFO.WS_LOGO
                    }),
                    new sap.m.Title({
                        text: oAPP.msg.M047 //"Icon List"
                    }),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.MenuButton("hdMenuBtn", {
                        text: "SAP Icons",
                        menu: new sap.m.Menu("hdMenu", {
                            itemSelected: ev_HeaderMenuSelected,
                            items: [
                                new sap.m.MenuItem({
                                    // icon: "sap-icon://sap-logo-shape",
                                    key: "SAP",
                                    text: "SAP Icons"
                                }),
                                new sap.m.MenuItem({
                                    key: "U4A",
                                    text: "U4A Icons"
                                }),
                            ]
                        })
                    }),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://less",
                        press: function () {

                            CURRWIN.minimize();

                        }
                    }).bindProperty("visible", "/PRC/MINI_INVISI", function (MINI_INVISI) {

                        return (MINI_INVISI === "X" ? false : true);

                    }),
                    new sap.m.Button("maxWinBtn", {
                        icon: "sap-icon://header",
                        press: function (oEvent) {

                            let bIsMax = CURRWIN.isMaximized();

                            if (bIsMax) {
                                CURRWIN.unmaximize();
                                return;
                            }

                            CURRWIN.maximize();

                        }
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {

                            if (CURRWIN.isDestroyed()) {
                                return;
                            }

                            CURRWIN.hide();

                            // 콜백 메소드가 있는지 확인
                            if (oAPP.attr.isCallback !== "X") {
                                return;
                            }

                            // Parent가 존재하는지 확인
                            if (!PARWIN || PARWIN.isDestroyed()) {
                                return;
                            }

                            PARWIN.webContents.send("if-icon-url-callback", { RETCD: "C", RTDATA: "" });

                            CURRWIN.setParentWindow(null);

                        }
                    }),
                ]
            }).addStyleClass("u4aWsBrowserDraggable"),

            content: fnGetMainPageContents()

        }).addStyleClass("u4aWsIconListMainPage");

    oApp.addPage(oPage);

    oApp.placeAt("content");

}; // end of oAPP.fn.fnInitRendering

function fnGetMainPageContents() {

    let oDynamicPage = fnGetDynamicPage();

    let oIconTabBar = new sap.m.IconTabBar("iconListTabBar", {
        busyIndicatorDelay: 0,
        selectedKey: "K1",
        expandable: false,
        expanded: true,
        stretchContentHeight: true,
        applyContentPadding: false,
        backgroundDesign: "Transparent",
        items: [
            new sap.m.IconTabFilter({
                icon: "sap-icon://grid",
                text: "Grid",
                key: "K1"
            }),
            new sap.m.IconTabFilter({
                icon: "sap-icon://list",
                text: "Details",
                key: "K2"
            }),
        ],
        content: [
            oDynamicPage
        ],

        select: ev_iconListIconTabSelectEvent

    });

    return [
        oIconTabBar
    ];

} // end of fnGetMainPageContents

function fnGetDynamicPage() {

    return new sap.f.DynamicPage({
        headerExpanded: true,
        fitContent: true,

        title: new sap.f.DynamicPageTitle({
            expandedContent: [
                new sap.m.HBox({
                    renderType: "Bare",
                    items: [
                        new sap.m.SearchField("iconSearchField", {
                            liveChange: function () {

                                ev_iconFilter();

                            }


                            // ev_searchFieldLiveChange
                        }),
                        new sap.m.CheckBox("favCheckbox", {
                            text: "Favorite only",
                            select: function () {

                                ev_iconFilter();

                            }

                        }),
                        new sap.m.Select({
                            selectedKey: "{/THEME/THEME_KEY}",
                            items: {
                                path: "/THEME/THEME_LIST",
                                template: new sap.ui.core.Item({
                                    key: "{KEY}",
                                    text: "{THEME}"
                                })
                            },

                            layoutData: new sap.m.FlexItemData({
                                styleClass: "sapUiTinyMarginBegin",
                                baseSize: "50%"
                            }),
                            change: ev_themeSelectChangeEvent
                        })
                    ]
                })
            ]
        }),

        content: fnGetDynamicPageContent()

    }).addStyleClass("u4aWsIconListDynamicPage");

}  // end of fnGetDynamicPage


function fnGetDynamicPageContent() {

    jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

    let oGridListPage = new sap.m.Page("K1", {
        showHeader: false,
        content: [
            new sap.f.GridList("iconGridList", {
                growing: true,
                growingScrollToLoad: true,
                growingThreshold: 200,
                customLayout: new sap.ui.layout.cssgrid.GridBoxLayout({
                    boxWidth: "8.125rem"
                }),

                // growingFinished: ev_gridListGrowingFinished,

                items: {
                    path: "/ICONS/ICON_LIST",
                    template: new sap.f.GridListItem({
                        content: [
                            new sap.m.VBox({
                                direction: "Column",
                                alignItems: "Center",
                                items: [
                                    new sap.ui.core.Icon({
                                        src: "{ICON_SRC}",
                                        size: "2.5rem",
                                        layoutData: new sap.m.FlexItemData({
                                            styleClass: "sapUiTinyMarginTop"
                                        })
                                    }),
                                    new sap.m.Label({
                                        text: "{ICON_NAME}",
                                        textAlign: "Center",
                                        design: "Bold",
                                        width: "6rem"
                                    }),
                                    new sap.m.HBox({
                                        renderType: "Bare",
                                        alignItems: "Center",
                                        items: [

                                            new sap.ui.core.Icon({
                                                size: "20px",
                                                press: ev_iconFavoChange
                                            }).bindProperty("src", "RATVAL", function (RATVAL) {
                                                return;
                                                let activeColor = oAPP.attr?.themeColors?.sapUiContentRatedColor || "#000",
                                                    inactiveColor = oAPP.attr?.themeColors?.sapUiContentUnratedColor || "#FFF",

                                                    sUnfavIcon = "sap-icon://unfavorite",
                                                    sFavIcon = "sap-icon://favorite";

                                                if (!RATVAL) {

                                                    this.setColor(inactiveColor);

                                                    return sUnfavIcon;
                                                }

                                                if (RATVAL == 1) {

                                                    this.setColor(activeColor);

                                                    return sFavIcon;

                                                }

                                                this.setColor(inactiveColor);

                                                return sUnfavIcon;

                                            }).addStyleClass("sapUiTinyMarginEnd"),

                                            // new sap.m.RatingIndicator({
                                            //     visualMode: "Full",
                                            //     maxValue: 1,
                                            //     value: "{RATVAL}",
                                            //     change: ev_iconFavoChange,
                                            // }).addStyleClass("sapUiTinyMarginEnd"),

                                            // .bindProperty("value", "RATVAL", function (ISFAV) {

                                            //     if (ISFAV == null) {
                                            //         return 0;
                                            //     }

                                            //     return (ISFAV == true ? 1 : 0);

                                            // }),

                                            new sap.m.Button({
                                                icon: "sap-icon://copy",
                                                press: ev_iconClipBoardCopy
                                            })

                                        ]
                                    }),

                                ] // end of VBox items

                            }) // end of VBox

                        ] // end of end of GridListItem content

                    }).addEventDelegate({
                        onAfterRendering: ev_gridListItemAfterRendering
                    }) // end of GridListItem   

                } // end of GridList items

            }) // end of GridList
                .addEventDelegate({
                    ondblclick: ev_iconGridListDblClick,
                })

        ] // end of Page Content

    }).addStyleClass("sapUiContentPadding");

    let oTableListPage = new sap.m.Page("K2", {

        visible: false,
        showHeader: false,
        content: [

            new sap.ui.table.Table("iconListTable", {

                // properties
                selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                selectionMode: sap.ui.table.SelectionMode.Single,
                minAutoRowCount: 1,
                alternateRowColors: true,
                rowHeight: 50,
                fixedColumnCount: 1,

                columns: [
                    new sap.ui.table.Column({
                        width: "100px",
                        hAlign: "Center",
                        label: "Icon",
                        template: new sap.ui.core.Icon({
                            src: "{ICON_SRC}",
                            size: "45px"
                        })
                    }),

                    new sap.ui.table.Column({
                        label: "Name",
                        template: new sap.m.Label({
                            design: "Bold",
                            text: "{ICON_NAME}"
                        })
                    }),

                    new sap.ui.table.Column({
                        label: "Code",
                        template: new sap.m.Text({
                            text: "{ICON_SRC}"
                        })
                    }),

                    // new sap.ui.table.Column({
                    //     label: "Key Words",
                    //     template: new sap.m.HBox({
                    //         items: {
                    //             path: "KEYWORDS",
                    //             templateShareable: true,
                    //             template: new sap.m.GenericTag({
                    //                 text: "{NAME}"
                    //             }).addStyleClass("sapUiTinyMarginEnd")
                    //         }
                    //     })
                    // }),

                    new sap.ui.table.Column({
                        width: "100px",
                        hAlign: "Center",
                        label: "Copy",
                        template: new sap.m.Button({
                            icon: "sap-icon://copy",
                            press: ev_iconClipBoardCopy
                        })
                    }),

                ],

                rowSelectionChange: function (oEvent) {

                    var iRowIndex = oEvent.getParameter("rowIndex"),
                        oTable = oEvent.getSource();

                    if (oTable.getSelectedIndex() == -1) {
                        oTable.setSelectedIndex(iRowIndex);
                    }

                },

                rows: {
                    path: "/ICONS/ICON_LIST",
                },

            }).addEventDelegate({
                ondblclick: ev_iconListTableDblClick
            })

        ]

    }).addStyleClass("sapUiContentPadding");

    return new sap.m.NavContainer("IconListNavCon", {
        autoFocus: false,
        pages: [

            oGridListPage,

            oTableListPage

        ],
        afterNavigate: ev_iconListPageNavigation
    })

} // end of fnGetDynamicPageContent

/************************************************************************
 * 스크롤 탑으로 올릴것 모음
 ************************************************************************/
function fnSetScrollTop() {

    // Grid Page의 스크롤을 최 상위로 올린다.
    let oGridPage = sap.ui.getCore().byId("K1");
    oGridPage.scrollTo(0);

    // List Table의 스크롤을 최 상위로 올린다.
    let oListTable = sap.ui.getCore().byId("iconListTable");
    oListTable.setFirstVisibleRow(0);

} // end of fnSetScrollTop

/************************************************************************
 * IntersectionObserver Callback
 ************************************************************************/
function fnIntersectionObserverCallback(aObservEntry) {

    let iEntryLength = aObservEntry.length;
    if (iEntryLength == 0) {
        return;
    }

    for (var i = 0; i < iEntryLength; i++) {

        let oObservEntry = aObservEntry[i],
            oTarget = oObservEntry.target;

        if (!oTarget) {
            continue;
        }

        //dom에 해당하는 UI정보 얻기.
        var oItem = sap.ui.getCore().byId(oTarget.id);
        if (!oItem) { return; }

        // 해당 요소가 화면에 나오는 경우
        if (oObservEntry.isIntersecting) {

            //dom에 해당하는 UI정보 얻기.
            var l_ui = sap.ui.getCore().byId(oTarget.id);
            if (!l_ui) { return; }

            //dom 갱신 처리.
            l_ui.invalidate();
            continue;

        }

        oTarget.style.width = jQuery(oTarget).width();
        oTarget.style.height = jQuery(oTarget).height();

        //dom의 child정보가 없다면 하위 로직 skip.
        if (oTarget.children.length === 0) {
            continue;
        }

        if (!oItem) { return; }

        setTimeout(function () {

            let l_dom = this;

            jQuery(l_dom).empty();

        }.bind(oTarget), 0);

    }

} // end of fnObserverCallback

function ev_gridListItemAfterRendering(oEvent) {

    console.log("aaa");

    if (oEvent?.srcControl?.isObserve) {
        return;
    }

    let oItem = oEvent.srcControl,
        oItemDOM = oItem.getDomRef();

    if (!oItemDOM) {
        return;
    }

    oIntersectionObserver.observe(oItemDOM);

    oItem.isObserve = "X";

} // end of ev_gridListItemAfterRendering

/************************************************************************
 * 아이콘 리스트 테이블의 더블클릭 이벤트
 ************************************************************************/
function ev_iconListTableDblClick(oEvent) {

    var oTarget = oEvent.target,
        $SelectedRow = $(oTarget).closest(".sapUiTableRow");

    if (!$SelectedRow.length) {
        return;
    }

    var oRow = $SelectedRow[0],

        sRowId1 = oRow.getAttribute("data-sap-ui-related"),
        sRowId2 = oRow.getAttribute("data-sap-ui"),
        sRowId = "";

    if (sRowId1 == null && sRowId2 == null) {
        return;
    }

    if (sRowId1) {
        sRowId = sRowId1;
    }

    if (sRowId2) {
        sRowId = sRowId2;
    }

    var oRow = sap.ui.getCore().byId(sRowId);
    if (!oRow) {
        return;
    }

    // 바인딩 정보가 없으면 빠져나간다.
    if (oRow.isEmpty()) {
        return;
    }

    var oCtx = oRow.getBindingContext(),
        sIconSrc = oCtx.getObject("ICON_SRC");

    // 콜백 여부에 따라 아이콘 url를 리턴
    _sendIconSrc(sIconSrc);

} // end of ev_iconListTableDblClick

/************************************************************************
 * 아이콘 그리드 리스트의 더블클릭 이벤트
 ************************************************************************/
function ev_iconGridListDblClick(oEvent) {

    let oTarget = oEvent.target,
        $SelectedGrid = $(oTarget).closest(".sapMLIB");

    if (!$SelectedGrid.length) {
        return;
    }

    let oGridListItemDOM = $SelectedGrid[0],

        sGridListItemId1 = oGridListItemDOM.getAttribute("data-sap-ui-related"),
        sGridListItemId2 = oGridListItemDOM.getAttribute("data-sap-ui"),
        sGridListItemId = "";

    if (sGridListItemId1 == null && sGridListItemId2 == null) {
        return;
    }

    if (sGridListItemId1) {
        sGridListItemId = sGridListItemId1;
    }

    if (sGridListItemId2) {
        sGridListItemId = sGridListItemId2;
    }

    let oGridListItem = sap.ui.getCore().byId(sGridListItemId);
    if (!oGridListItem) {
        return;
    }

    let oCtx = oGridListItem.getBindingContext();
    if (!oCtx) {
        return;
    }

    let sIconSrc = oCtx.getObject("ICON_SRC");

    // 콜백 여부에 따라 아이콘 url를 리턴
    _sendIconSrc(sIconSrc);

} // end of ev_iconGridListDblClick


/************************************************************************
 * 헤더 메뉴 버튼 클릭 이벤트
 ************************************************************************/
function ev_HeaderMenuSelected(oEvent) {

    let oHdMenuBtn = sap.ui.getCore().byId("hdMenuBtn"),
        oSelectedItem = oEvent.getParameter("item"),
        sSelectedKey = oSelectedItem.getProperty("key"),
        sSelectedTxt = oSelectedItem.getProperty("text");

    oHdMenuBtn.setText(sSelectedTxt);

    let oCoreModel = sap.ui.getCore().getModel(),
        oPrc = oCoreModel.getProperty("/PRC"),
        sBeforeSelectedKey = oPrc.MenuSelectedKey;

    // 이전 선택한 값이 같으면 그냥 빠져나간다
    if (sBeforeSelectedKey == sSelectedKey) {
        return;
    }

    // 스크롤 최 상단으로 이동
    fnSetScrollTop();

    // 출력 모델 클리어
    oCoreModel.setProperty("/ICONS/ICON_LIST", []);

    switch (sSelectedKey) {
        case "SAP":

            let aSapIcons = oCoreModel.getProperty("/ICONS/SAP");

            oCoreModel.setProperty("/ICONS/ICON_LIST", aSapIcons);

            break;

        case "U4A":

            let aU4aIcons = oCoreModel.getProperty("/ICONS/U4A");

            oCoreModel.setProperty("/ICONS/ICON_LIST", aU4aIcons);

            break;

    }

    oCoreModel.setProperty("/PRC/MenuSelectedKey", sSelectedKey);

} // end of ev_HeaderMenuSelected

/************************************************************************
 * 아이콘 탭 바 선택 이벤트
 ************************************************************************/
function ev_iconListIconTabSelectEvent(oEvent) {

    let sPrevKey = oEvent.getParameter("previousKey"),
        sCurrKey = oEvent.getParameter("selectedKey");

    if (sPrevKey === sCurrKey) {
        return;
    }

    // IconTabBar Busy
    _setIconTabBarBusy(true);

    let oPrevPage = sap.ui.getCore().byId(sPrevKey);
    oPrevPage.setVisible(false);

    setTimeout(() => {

        let oNavi = sap.ui.getCore().byId("IconListNavCon");
        oNavi.to(sCurrKey);

        // 아이콘 필터를 수행
        ev_iconFilter();

    }, 100);

} // end of ev_iconListIconTabSelectEvent

/************************************************************************
 * GridList의 클립보드 복사 버튼 이벤트
 ************************************************************************/
function ev_iconClipBoardCopy(oEvent) {

    let oUI = oEvent.getSource(),
        oCtx = oUI.getBindingContext();

    if (!oCtx) {
        return;
    }

    let sIconSrc = oCtx.getObject("ICON_SRC");

    CLIPBOARD.writeText(sIconSrc);

    sap.m.MessageToast.show(oAPP.msg.M031); // Clipboard Copy Success!

    // 콜백 여부에 따라 아이콘 url를 리턴
    _sendIconSrc(sIconSrc);

} // end of ev_iconClipBoardCopy

function _fnIconWorkerOnMessage(oEvent) {

    let oBindParam = this,
        oWorker = oBindParam.oWorker;

    if (oEvent.data == "E") {

        G_bIsMe = "";
        oWorker.terminate();

        return;
    }

    oWorker.terminate();

} // end of _fnIconWorkerOnMessage

/************************************************************************
 * 즐겨찾기 버튼 클릭 이벤트
 ************************************************************************/
function ev_iconFavoChange(oEvent) {
    
    

    debugger;

    let oIcon = oEvent.getSource(),
        oFavModel = oIcon.getModel();

    if (!oFavModel) {
        return;
    }

    let oCtx = oIcon.getBindingContext();
    if (!oCtx) {
        return;
    }

    G_bIsMe = "X";

    // 선택한 아이콘의 바인딩 정보를 구한다.
    let oSelectedFavInfo = oCtx.getObject(),
        // sIconSrc = oSelectedFavInfo.ICON_SRC,
        iRATVAL = oSelectedFavInfo.RATVAL || 0;

    iRATVAL = (iRATVAL == 0 ? 1 : 0);

    oFavModel.setProperty(oCtx.getPath() + "/RATVAL", iRATVAL);

    let aSAPIconFav = oFavModel.getProperty("/ICONS/SAP"), // SAP Icon
        aU4AIconFav = oFavModel.getProperty("/ICONS/U4A"), // U4A Icon
        aIcons = aSAPIconFav.concat(aU4AIconFav), // SAP Icon + U4A Icon

        sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
        SYSID = parent.oAPP.attr.USERINFO.SYSID,

        sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`),
        sWorkerPath = PATH.join(PATHINFO.WORKER_ROOT, "u4aWsFavIconWorker.js"),

        // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
        oIconFavWorker = new Worker(sWorkerPath);

    let oIconFavBindParam = {
        oWorker: oIconFavWorker, // Worker Instance
        // oCtx: oCtx, // Binding Context
    };

    // Worker Message Event
    oIconFavWorker.onmessage = _fnIconWorkerOnMessage.bind(oIconFavBindParam);

    // Send to Worker Data
    let oSendData = {
        aIcons: aIcons,
        // sIconSrc: sIconSrc,
        sSaveFilePath: sIconFavFilePath
    };

    // 워커에 값 전달
    oIconFavWorker.postMessage(oSendData);










    // let oSelectedFavInfo = oCtx.getObject(),
    //     sBindPath = oCtx.getPath(),
    //     iRATVAL = oSelectedFavInfo.RATVAL || 0;

    // iRATVAL = (iRATVAL == 0 ? 1 : 0);

    // oFavModel.setProperty(sBindPath + "/RATVAL", iRATVAL);

    // let SYSID = parent.oAPP.attr.USERINFO.SYSID;

    // if (!oFavModel) {
    //     return;
    // }

    // let aSAPIconFav = oFavModel.getProperty("/ICONS/SAP"),
    //     aU4AIconFav = oFavModel.getProperty("/ICONS/U4A"),
    //     sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
    //     sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`),
    //     sWorkerPath = PATH.join(PATHINFO.WORKER_ROOT, "u4aWsFavIconWorker.js"),

    //     // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
    //     oIconFavWorker = new Worker(sWorkerPath);

    // oIconFavWorker.onmessage = _fnIconWorkerOnMessage.bind(oIconFavWorker);

    // let oSendData = {
    //     aSAPIconFav: aSAPIconFav,
    //     aU4AIconFav: aU4AIconFav,
    //     sSaveFilePath: sIconFavFilePath
    // };

    // // 워커에 값 전달
    // oIconFavWorker.postMessage(oSendData);

    return;

    /**
     * 원본
     */


    // let oRating = oEvent.getSource(),
    //     oFavModel = oRating.getModel(),
    //     SYSID = parent.oAPP.attr.USERINFO.SYSID;

    // if (!oFavModel) {
    //     return;
    // }

    // let aRatingModelData = oFavModel.getProperty("/ICONS/SAP"),
    //     aRatingFilter = aRatingModelData.filter(elem => elem.RATVAL == 1),

    //     sIconFavFolderPath = PATHINFO.P13N_ICONFAV,
    //     sIconFavFilePath = PATH.join(sIconFavFolderPath, `${SYSID}.json`),
    //     sWorkerPath = PATH.join(PATHINFO.WORKER_ROOT, "u4aWsFavIconWorker.js"),

    //     // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
    //     oIconFavWorker = new Worker(sWorkerPath);

    // oIconFavWorker.onmessage = function () {

    //     oIconFavWorker.terminate();

    // };

    // let oSendData = {
    //     aIconFav: aRatingFilter,
    //     sSaveFilePath: sIconFavFilePath
    // };

    // // 워커에 값 전달
    // oIconFavWorker.postMessage(oSendData);

} // end of ev_iconFavoChange

/************************************************************************
 * 테마 선택 이벤트
 ************************************************************************/
function ev_themeSelectChangeEvent(oEvent) {

    let oPrevSelectedItem = oEvent.getParameter("previousSelectedItem"),
        oSelectedItem = oEvent.getParameter("selectedItem"),

        sPrevKey = oPrevSelectedItem.getProperty("key"),
        sSelectedKey = oSelectedItem.getProperty("key");

    if (sPrevKey === sSelectedKey) {
        return;
    }

    sap.ui.getCore().applyTheme(sSelectedKey);

} // end of ev_themeSelectChangeEvent

/************************************************************************
 * 페이지 이동 후 발생하는 이벤트
 ************************************************************************/
function ev_iconListPageNavigation(oEvent) {

    let oToPage = oEvent.getParameter("to");

    oAPP.attr.oDelegate = {

        onAfterRendering: function (oEvent) {

            let oPage = oEvent.srcControl;

            // IconTabBar Busy
            _setIconTabBarBusy(false);

            oPage.removeEventDelegate(oAPP.attr.oDelegate);

        }

    };

    oToPage.addEventDelegate(oAPP.attr.oDelegate);

    oToPage.setVisible(true);

} // end of ev_iconListPageNavigation

/************************************************************************
 * 아이콘 검색 기능
 ************************************************************************/
function ev_iconFilter() {

    let oSearchField = sap.ui.getCore().byId("iconSearchField"),
        oCheckBox = sap.ui.getCore().byId("favCheckbox"),
        oGridList = sap.ui.getCore().byId("iconGridList"),
        oTable = sap.ui.getCore().byId("iconListTable"),

        oGridListBindingInfo = oGridList.getBinding("items"),
        oTableBindingInfo = oTable.getBinding("rows"),

        sSearchValue = oSearchField.getValue(),
        bIsCheck = oCheckBox.getSelected();

    if (!oGridListBindingInfo || !oTableBindingInfo) {
        return;
    }

    if (sSearchValue === "" && !bIsCheck) {
        oGridListBindingInfo.filter();
        oTableBindingInfo.filter();
        return;
    }

    var aFilters1 = [],
        aFilters2 = [];

    if (bIsCheck) {
        aFilters1.push(new sap.ui.model.Filter({ path: "RATVAL", operator: "EQ", value1: 1 }));
    }

    aFilters2.push(new sap.ui.model.Filter({ path: "KEYWORD_STRING", operator: "Contains", value1: sSearchValue }));
    aFilters2.push(new sap.ui.model.Filter({ path: "ICON_SRC", operator: "Contains", value1: sSearchValue }));

    //model 필터 처리.
    oGridListBindingInfo.filter(
        [
            new sap.ui.model.Filter(aFilters1, true),
            new sap.ui.model.Filter(aFilters2, false)
        ]
    );

    oTableBindingInfo.filter(
        [
            new sap.ui.model.Filter(aFilters1, true),
            new sap.ui.model.Filter(aFilters2, false)
        ]
    );

} // end of ev_iconFilter

/************************************************************************
 * 아이콘 탭바 Busy Indicator
 ************************************************************************/
function ev_searchFieldLiveChange(oEvent) {

    let oSearchField = oEvent.getSource(),
        sSearchValue = oSearchField.getValue();

    let oGridList = sap.ui.getCore().byId("iconGridList"),
        oTable = sap.ui.getCore().byId("iconListTable"),
        oGridListBindingInfo = oGridList.getBinding("items"),
        oTableBindingInfo = oTable.getBinding("rows");

    if (!oGridListBindingInfo || !oTableBindingInfo) {
        return;
    }

    if (sSearchValue === "") {
        oGridListBindingInfo.filter();
        oTableBindingInfo.filter();
        return;
    }

    var aFilters = [];

    aFilters.push(new sap.ui.model.Filter({ path: "KEYWORD_STRING", operator: "Contains", value1: sSearchValue }));
    aFilters.push(new sap.ui.model.Filter({ path: "ICON_SRC", operator: "Contains", value1: sSearchValue }));

    //model 필터 처리.
    oGridListBindingInfo.filter([new sap.ui.model.Filter(aFilters, false)]);
    oTableBindingInfo.filter([new sap.ui.model.Filter(aFilters, false)]);

} // end of ev_searchFieldLiveChange






/************************************************************************
 * [private] 아이콘 탭바 Busy Indicator
 ************************************************************************/
function _setIconTabBarBusy(bIsBusy) {

    let oIconTabBar = sap.ui.getCore().byId("iconListTabBar");
    oIconTabBar.setBusy(bIsBusy);

} // end of _setIconTabBarBusy

/************************************************************************
 * 콜백 여부에 따라 아이콘 url를 리턴
 ************************************************************************/
function _sendIconSrc(sIconSrc) {

    if (oAPP.attr.isCallback === "X") {

        PARWIN.webContents.send("if-icon-url-callback", { RETCD: "S", RTDATA: sIconSrc });

        CURRWIN.hide();

        CURRWIN.setParentWindow(null);

        return;
    }

} // end of _sendIconSrc










/************************************************************************
 * [공통] busy indicator 수행
 ************************************************************************/
oAPP.setBusy = (isBusy) => {

    if (typeof sap === "undefined") {
        return;
    }

    let bIsBusy = (isBusy == "X" ? true : false);

    sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

    if (bIsBusy) {

        // 화면 Lock 걸기
        sap.ui.getCore().lock();

        sap.ui.core.BusyIndicator.show(0);

        return;
    }

    // 화면 Lock 해제
    sap.ui.getCore().unlock();

    sap.ui.core.BusyIndicator.hide();

}; // end of oAPP.fn.setBusy


/************************************************************************
 * WS 글로벌 메시지 목록 구하기
 ************************************************************************/
oAPP.fn.getWsMessageList = function () {

    return new Promise(async (resolve) => {

        let oSettingInfo = WSUTIL.getWsSettingsInfo(),
            sWsLangu = oSettingInfo.globalLanguage;

        oAPP.msg.M01 = "아이콘 즐겨찾기 저장 오류";
        oAPP.msg.M02 = "아이콘 즐겨찾기 저장시 오류가 발생하였습니다."

        oAPP.msg.M031 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "031"); // Clipboard Copy Success!
        oAPP.msg.M047 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "047"); // Icon List



        // oAPP.msg.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "007"); // Saved success
        // oAPP.msg.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "008"); // Delete success
        // oAPP.msg.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "038"); // YES
        // oAPP.msg.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "039"); // NO


        resolve();

    });

};


function getJsonAsync(sUrl, oParam) {

    return new Promise((resolve) => {

        let oResult = jQuery.sap.syncGetJSON(sUrl);
        if (oResult.error) {

            resolve({
                RETCD: "E",
                RTMSG: oResult.error.toString()
            });

            return;
        }

        resolve({
            RETCD: "S",
            RTDATA: oResult.data,
            PARAM: oParam
        });

        return;

    });

}

// function sendAjaxAsync(pOptions, oFormData) {

//     return new Promise((resolve) => {

//         /**
//          * 파라미터 종류
//          * 1. url
//          * 2. method
//          *  - POST, GET
//          * 3. responseType
//          *  - json
//          *  - blob
//          *  - arraybuffer
//          * 
//          * 4. FormData
//          * 
//          * 5. callback
//          *  - success
//          *  - fail
//          * 
//          */


//         let oDefOptions = {
//             url: "",
//             method: "GET",
//             responseType: "",
//             async: true,
//             withCredentials: true,
//             formData: oFormData
//         };

//         if ((typeof oDefOptions.formData === "undefined")) {
//             oDefOptions.formData = new FormData();
//         }

//         if (oDefOptions.formData instanceof FormData == false) {
//             oDefOptions.formData = new FormData();
//         }

//         let oOptions = { ...oDefOptions, ...pOptions };

//         var XHR = new XMLHttpRequest();

//         XHR.onreadystatechange = function () { // 요청에 대한 콜백
//             if (XHR.readyState === XHR.DONE) { // 요청이 완료되면
//                 if (XHR.status === 200 || XHR.status === 201) {

//                     resolve({ RETCD: "S", RTDATA: XHR.response, options: pOptions });

//                 }
//             }
//         };

//         // 오류 콜백
//         XHR.onerror = function (oEvent) {

//             resolve({ RETCD: "E" });

//         };

//         // Request Timeout 콜백
//         XHR.ontimeout = function (oEvent) {

//             resolve({ RETCD: "E" });

//         };

//         try {
//             // FormData가 없으면 GET으로 전송
//             XHR.open(oOptions.method, oOptions.url, oOptions.async);

//             XHR.withCredentials = oOptions.withCredentials;
//             XHR.timeout = 60000; // 1분
//             XHR.responseType = oOptions.responseType;

//             XHR.send(oOptions.formData);

//         } catch (error) {
//             resolve({ RETCD: "E" });
//             console.log(error.toString());
//         }

//     });

// } // end of sendAjax









oAPP.fn.attachInit();