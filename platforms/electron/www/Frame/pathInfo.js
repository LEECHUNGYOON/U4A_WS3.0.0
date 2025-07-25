/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : pathInfo.js
 * - file Desc : Path 경로 관리
 ************************************************************************/

/**
 * ## 각종 Path 들
 *  @ 패스 지정 방법..
 *    1. 기존 있는 파일 패스를 만들 경우
 *      - PATH.join(__dirname, '../Login/Login.html') 이와 같은 방식.
 * 
 *    2. 동적으로 개인화 파일 등을 만들때..
 *      - APP.getPath("userData") + "\\경로명"
 */

module.exports = (() => {
    "use strict";

    const
        REMOTE = require('@electron/remote'),
        PATH = REMOTE.require('path'),
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),

        WS10_20 = PATH.join(APPPATH, "ws10_20"),
        JS_ROOT = PATH.join(WS10_20, "js"),
        POPUP_ROOT = PATH.join(WS10_20, "Popups"),
        P13N_ROOT = PATH.join(USERDATA, "p13n"),
        SUGG_ROOT = PATH.join(P13N_ROOT, "suggestion"),
        USP_ROOT = PATH.join(JS_ROOT, "usp"),
        PATTERN_ROOT = PATH.join(USP_ROOT, "pattern"),
        USERDATA_PATTERN_ROOT = PATH.join(USERDATA, "p13n", "pattern"),
        CONF_ROOT = PATH.join(PATH.join(USERDATA, "conf")),
        MODULES_ROOT = PATH.join(JS_ROOT, "modules"),
        COMMON_MODULES_ROOT = PATH.join(JS_ROOT, "common_modules");

    return {

        LOGIN: PATH.join(APPPATH, '/Login/Login.html'),
        LOGIN2: PATH.join(APPPATH, '/Login/Login2.html'),
        MAINFRAME: PATH.join(APPPATH, "Frame", "Frame.html"),
        WS10: PATH.join(APPPATH, '/ws10_20/ws10_20.html'),
        EXTOPEN: PATH.join(APPPATH, '/ws10_20/extopen.html'),
        ERRORPAGE: PATH.join(APPPATH, '/ws10_20/errorpage.html'),
        JQUERYUI: PATH.join(APPPATH, '/js/jquery-ui.min.js'),
        JQUERYUICSS: PATH.join(APPPATH, '/css/jquery-ui.min.css'),
        MSG: PATH.join(APPPATH, '/msg'),
        WSMSG_ROOT: PATH.join(APPPATH, "MSG"),
        BROWSERSETTINGS: PATH.join(APPPATH, '/settings/BrowserWindow/BrowserWindow-settings.json'),
        // WSSETTINGS: PATH.join(APPPATH, "settings", "ws_settings.json"),        
        WSSETTINGS: PATH.join(CONF_ROOT, "ws_settings.json"),
        SERVERLIST: PATH.join(APPPATH, '/ServerList/ServerFrame.html'),
        SERVERLIST_v2: PATH.join(APPPATH, '/ServerList_v2/ServerFrame.html'),
        COMMONCSS: PATH.join(APPPATH, "css", "common.css"),
        AUTOUPDSAP: PATH.join(APPPATH, "lib", "ws", "electron-updater-sap.js"),
        WS_SP_UPD: PATH.join(APPPATH, "lib", "ws", "SupportPackageChecker", "index.js"),
        WS_LOGO: PATH.join(APPPATH, "img", "logo.png"),
        PATTERN_ROOT: PATTERN_ROOT,
        USERDATA_PATT_FILES: PATH.join(USERDATA_PATTERN_ROOT, "default_pattern_files"),
        USP_ROOT: USP_ROOT,
        CONF_ROOT: CONF_ROOT,
        COMMON_MODULES_ROOT: COMMON_MODULES_ROOT,
        MODULES_ROOT: MODULES_ROOT,

        // User Data Paths..
        CLIPBOARD: PATH.join(USERDATA, "clipboard.json"),
        THEME: PATH.join(P13N_ROOT, "theme"),
        P13N: PATH.join(P13N_ROOT, "p13n.json"),
        P13N_ROOT: P13N_ROOT,
        P13N_ICONFAV: PATH.join(P13N_ROOT, "iconFavorite"),
        SERVERINFO_V2: PATH.join(P13N_ROOT, "ServerInfo-v2.json"),

        // Popup Paths..        
        ERRPAGE: PATH.join(POPUP_ROOT, "errPageEditorPopup", "errorPageEditorFrame.html"),
        ERRPAGEPREV: PATH.join(POPUP_ROOT, "errPageEditorPopup", "errorPageEditorPreview.html"),
        UIFIND: PATH.join(POPUP_ROOT, "findPopup", "frame.html"),
        RTMCLS: PATH.join(POPUP_ROOT, "runtimeClassNavigator", "frame.html"), // runtime class navigator  
        BINDPOPUP: PATH.join(POPUP_ROOT, "bindPopup", "frame.html"), // bind popup
        TXTSRCH: PATH.join(POPUP_ROOT, "textSearchPopup", "index.html"),
        APPDOCU: PATH.join(POPUP_ROOT, "docPopup", "frame.html"),
        WSOPTS: PATH.join(POPUP_ROOT, "optionPopup", "optionM.html"),
        EDITPOP: PATH.join(POPUP_ROOT, "editorPopup", "editorFrame.html"),
        ERRMSGPOP: PATH.join(POPUP_ROOT, "errMsgPopup", "frame.html"),
        U4ADOCU: PATH.join(POPUP_ROOT, "u4aDocPopup", "frame.html"),
        IMPEXPPOP: PATH.join(POPUP_ROOT, "importExportPopup", "index.html"),
        ABOUTU4APOP: PATH.join(POPUP_ROOT, "aboutU4APopup", "index.html"),
        RELNOTEPOP: PATH.join(POPUP_ROOT, "releaseNotePopup", "index.html"),
        U4AOTRPOP: PATH.join(POPUP_ROOT, "OTRF4HelpPopup", "frame.html"),
        UI5CSSPOP: PATH.join(POPUP_ROOT, "ui5CssPopup", "frame.html"),
        UI5CSSPOP_V2: PATH.join(POPUP_ROOT, "ui5CssPopup_v2", "main", "frame.html"),
        SHORTCUTPOP: PATH.join(POPUP_ROOT, "ShortCutCreator", "index.html"),
        DESIGNTREEUISRCH: PATH.join(POPUP_ROOT, "designTreeUiSearchPopup", "index.html"),
        VIDEOREC: PATH.join(POPUP_ROOT, "ScreenRecord", "ScreenRecording.js"),
        WINHIDE: PATH.join(POPUP_ROOT, "winShowHidePopup", "frame.html"),
        WINHIDE2: PATH.join(POPUP_ROOT, "winShowHidePopup", "test1.html"),
        USPNEW: PATH.join(POPUP_ROOT, "uspNewPopup", "frame.html"),
        PATTPOPUP: PATH.join(POPUP_ROOT, "patternPopup", "frame.html"),
        ICONPREV: PATH.join(POPUP_ROOT, "iconPrevPopup", "index.html"), // 아이콘 리스트 팝업
        ILLUST_MSG_PREV: PATH.join(POPUP_ROOT, "illustMsgPopup", "index.html"), // 일러스트 메시지 팝업

        // JS Paths..
        UI5CSSPOP_V2_CONTROL: PATH.join(POPUP_ROOT, "ui5CssPopup_v2", "control.js"),
        WSTRYCATCH: PATH.join(JS_ROOT, "ws_trycatch.js"),
        WSUTIL: PATH.join(JS_ROOT, "ws_util.js"),
        USP_UTIL: PATH.join(USP_ROOT, "ws_usp_util.js"),
        U4AHELP: PATH.join(APPPATH, "help", "u4a_helpdoc", "main.js"),
        FLTMENU: PATH.join(APPPATH, "floatingMenu", "js", "handle.js"),

        // Json Path..
        EVENTSUGG: PATH.join(SUGG_ROOT, "events.json"),
        TCODESUGG: PATH.join(SUGG_ROOT, "tcode.json"),
        DEF_PATT: PATH.join(USERDATA_PATTERN_ROOT, "default_pattern.json"), // usp default pattern file
        CUST_PATT: PATH.join(USERDATA_PATTERN_ROOT, "custom_pattern.json"), // usp custom pattern file

        // common module paths...
        MODULE_WS_SETTINGS: PATH.join(COMMON_MODULES_ROOT, "ws_settings.js"),

        // Root Paths...
        POPUP_ROOT: POPUP_ROOT,
        JS_ROOT: JS_ROOT,
        WORKER_ROOT: PATH.join(JS_ROOT, "workers"),
        WS10_20_ROOT: WS10_20,
        // U4AICON_ROOT: PATH.join(WS10_20, "icons", "u4a")
        U4AICON_ROOT: PATH.join(USERDATA, "ext_api", "icons", "u4a")

    };

})();