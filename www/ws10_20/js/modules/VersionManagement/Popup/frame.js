/************************************************************************
 * 에러 감지
 ************************************************************************/

const
    require = parent.require,
    REMOTE = require('@electron/remote'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL),
    WSERR = require(PATHINFO.WSTRYCATCH),
    WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
    WSUTIL = require(WSMSGPATH);

var zconsole = WSERR(window, document, console);

let oAPP = parent.oAPP;

/*********************************************************
 * - BootStrap Load
 *********************************************************/    

var oSettings = WSUTIL.getWsSettingsInfo(),
    oSetting_UI5 = oSettings.UI5,
    oBootStrap = oSetting_UI5.bootstrap,
    oThemeInfo = oAPP.fn.getThemeInfo();
    // oThemeInfo = oAPP.attr.oThemeInfo;
    // sTheme = oSettings.globalTheme,
    // sLangu = oSettings.globalLanguage;
let oUserInfo = parent.process.USERINFO;
let sLangu = oUserInfo.LANGU;

var oScript = document.createElement("script");
oScript.id = "sap-ui-bootstrap";

// 공통 속성 적용
for (const key in oBootStrap) {
    oScript.setAttribute(key, oBootStrap[key]);
}

// 로그인 Language 적용
oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
oScript.setAttribute("data-sap-ui-language", sLangu);
oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.codeeditor, sap.ui.table, sap.ui.layout");
oScript.setAttribute("src", oSetting_UI5.resourceUrl);

document.head.appendChild(oScript);