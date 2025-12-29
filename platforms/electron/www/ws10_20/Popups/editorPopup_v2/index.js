
const 
    PATH = require("path"),
    IPCMAIN = parent.IPCMAIN,
    SESSKEY = parent.getSessionKey(),    
    BROWSKEY = parent.getBrowserKey();

let oAPP = undefined;

module.exports = function(REMOTE, oAPP, oParams){

    oAPP = oAPP;

    // busy 키고 Lock 걸기
    oAPP.common.fnSetBusyLock("X");

    // 전체 자식 윈도우에 Busy 킨다.
    oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_ON" });

    const oAppInfo = parent.getAppInfo();
    const oEditInfo = oParams.oEditorInfo;
    const sSearchValue = oParams.sSearchValue;

    // 브라우저 타이틀
    let sBrowserTitle = oAppInfo.APPID + " - " + oEditInfo.OBJNM;
        sBrowserTitle += " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D23"); // Editor

    let CURRWIN = REMOTE.getCurrentWindow();

    // 팝업 고유 이름
    let sPopupName = oEditInfo.OBJTY;

    // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
    let oResult = oAPP.common.getCheckAlreadyOpenWindow(sPopupName);
    if (oResult.ISOPEN) {

        if (oEditInfo.OBJTY === "CS") {
            lf_webContentSend(oResult.WINDOW, sSearchValue);
        }

        // 부모 위치 가운데 배치한다.            
        parent.WSUTIL.setParentCenterBounds(REMOTE, oResult.WINDOW);

        // busy 끄고 Lock 풀기
        oAPP.common.fnSetBusyLock("");

        // 전체 자식 윈도우에 Busy 끈다.
        oAPP.attr.oMainBroad.postMessage({ PRCCD:"BUSY_OFF" });

        return;
    }

    // theme 정보
    let oThemeInfo = parent.getThemeInfo(); 

    // Browswer Options
    let sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
        oDefaultOption = parent.require(sSettingsJsonPath),
        oBrowserOptions = JSON.parse(JSON.stringify(oDefaultOption.browserWindow));        

        oBrowserOptions.title = sBrowserTitle;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.parent = CURRWIN;        
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL; //테마별 색상 처리
        oBrowserOptions.modal = true;
        oBrowserOptions.closable = false;
        
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;

        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = sPopupName;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;        

    // 브라우저 오픈
    let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions); 
    parent.REMOTEMAIN.enable(oBrowserWindow.webContents);

    // 오픈할 브라우저 백그라운드 색상을 테마 색상으로 적용
    let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
    oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

    // 브라우저 상단 메뉴 없애기
    oBrowserWindow.setMenu(null);

    let sPopupPath = PATH.join(__dirname, "Popup", "index.html");

    oBrowserWindow.loadURL(sPopupPath);

    // no build 일 경우에는 개발자 툴을 실행한다.
    if (!REMOTE.app.isPackaged) {
        oBrowserWindow.webContents.openDevTools();
    }

    oBrowserWindow.once('ready-to-show', () => {
        
        // 부모 위치 가운데 배치한다.
        parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

    });

    // 브라우저가 오픈이 다 되면 타는 이벤트
    oBrowserWindow.webContents.on('did-finish-load', function () {
        
        let oOptionData = {
            // BROWSKEY: BROWSKEY, // 브라우저 고유키 
            // oUserInfo: oUserInfo, // 로그인 사용자 정보
            // oServerInfo: oServerInfo, // 서버 정보                
            oThemeInfo: oThemeInfo, // 테마 정보                
        };
        
        // oBrowserWindow.webContents.send('if-version-management', oOptionData);

        lf_webContentSend(oBrowserWindow, sSearchValue);

        // 부모 위치 가운데 배치한다.
        parent.WSUTIL.setParentCenterBounds(REMOTE, oBrowserWindow);

    });

    // EDITOR의 저장을 위한 IPC 이벤트
    IPCMAIN.on("if-editor-save", _ipcMain_EditorSave);

    // 브라우저를 닫을때 타는 이벤트
    oBrowserWindow.on('closed', () => {

        // IPCMAIN 이벤트 해제
        IPCMAIN.removeListener("if-editor-save", _ipcMain_EditorSave);

        oBrowserWindow = null;

        CURRWIN.focus();

    });

    function lf_webContentSend(oBrowserWindow, sSearchValue) {

        // 에디터 타입에 해당하는 데이터를 구한다.
        var oGetEditorData = _getEditorData(oEditInfo.OBJTY);

        // 에디터 타입에 맞는 데이터를 저장한다.
        oEditInfo.DATA = oGetEditorData && oGetEditorData.DATA ? oGetEditorData.DATA : "";

        var oEditorInfo = {
            THEME_INFO: oThemeInfo, // 테마정보
            APPINFO: oAppInfo,
            EDITORINFO: oEditInfo,
            SRCHVAL: sSearchValue // 선택한 style class의 검색용 데이터
        };

        oBrowserWindow.webContents.send('if-editor-info', oEditorInfo);

    }
};


/************************************************************************
 * Editor 팝업의 저장 버튼 이벤트를 수행하기 위한 IPCMAIN 이벤트
 ************************************************************************/
function _ipcMain_EditorSave(event, res){

    var BROWSKEY = parent.getBrowserKey();

    if (BROWSKEY != res.BROWSKEY) {
        return;
    }

    // 저장할 데이터
    var oSaveData = res.SAVEDATA;

    // CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 저장
    _setEditorData(oSaveData);

    // 어플리케이션 정보에 변경 플래그 
    parent.setAppChange(res.IS_CHAG);

} // end of _ipcMain_EditorSave



/************************************************************************
 * CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 구하기
 ************************************************************************
 * @param {String}  OBJTY
 * - 에디터 타입
 * 
 * @return {Object || undefined} 
 * - 에디터 타입에 따른 에디터 정보 리턴
 * - 에디터 타입에 따른 에디터 정보가 없으면 undefined
 ************************************************************************/
function _getEditorData(OBJTY){

    // 세개의 오브젝트 중에 하나라도 없으면 빠져나감.
    if (!OBJTY || !oAPP.DATA || !oAPP.DATA.APPDATA || !oAPP.DATA.APPDATA.T_EDIT) {
        return;
    }

    // 에디터 데이터가 Array 가 아니면 빠져나감.
    var aEditorData = oAPP.DATA.APPDATA.T_EDIT;
    if (!Array.isArray(aEditorData)) {
        return;
    }

    return aEditorData.find(oEditorData => oEditorData.OBJTY == OBJTY);

} // end of _getEditorData


/************************************************************************
 * CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 저장
 ************************************************************************
 * @param {Object}  oSaveData
 * - 저장할 에디터 정보와 데이터     
 ************************************************************************/
function _setEditorData(oSaveData){

    // 세개의 오브젝트 중에 하나라도 없으면 빠져나감.
    if (!oAPP.DATA || !oAPP.DATA.APPDATA || !oAPP.DATA.APPDATA.T_EDIT) {
        return;
    }

    // 에디터 데이터가 Array 가 아니면 빠져나감.
    var aEditorData = oAPP.DATA.APPDATA.T_EDIT;
    if (!Array.isArray(aEditorData)) {
        return;
    }

    var oBeforeData = _getEditorData(oSaveData.OBJTY);

    if (typeof oBeforeData === "undefined") {

        oBeforeData = {};
        oBeforeData.OBJID = oSaveData.OBJID;
        oBeforeData.OBJTY = oSaveData.OBJTY;
        oBeforeData.DATA = oSaveData.DATA;

        oAPP.DATA.APPDATA.T_EDIT.push(oBeforeData);
    }

    oBeforeData.DATA = oSaveData.DATA;

    switch (oSaveData.OBJTY) {
        case "CS":
            oAPP.attr.ui.frame.contentWindow.setCSSSource(oSaveData.DATA);
            break;
    }


} // end of _setEditorData