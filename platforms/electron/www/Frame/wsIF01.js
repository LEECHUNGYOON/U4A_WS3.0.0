/**
 *  선언적 Function 
 */

// 1. 메시지 호출
function showMessage(oUI5, KIND, TYPE, MSG, fn_callback) {
    oWS.utill.fn.showMessage(oUI5, KIND, TYPE, MSG, fn_callback);
}

// 2. 서버 정보를 구한다.
function getServerInfo() {
    return oWS.utill.fn.getServerInfo();
}

// 3. 서버 URL을 구한다.
function getServerPath() {
    return oWS.utill.fn.getServerPath();
}

// 서버의 호스트를 구한다.
function getServerHost() {
    return oWS.utill.fn.getServerHost();
}

// 4. Page 이동
function onMoveToPage(sPagePath) {
    oWS.utill.fn.onMoveToPage(sPagePath);
}

// 5. Electron Instance return.
function getElectronRemote() {
    return oWS.utill.fn.getElectronRemote();
}

// 6. NODE JS 'require' return.
function getRequire() {
    return oWS.utill.fn.getRequire();
}

// 7. AppID 및 Create, Change, Display 모드 정보 저장
function setAppInfo(oAppInfo) {
    oWS.utill.fn.setAppInfo(oAppInfo);
}

// 8. AppID 및 Create, Change, Display 모드 정보 구하기
function getAppInfo() {
    return oWS.utill.fn.getAppInfo();
}

// 9. SAP ICON Path
function getSapIconPath(sIconName) {
    return oWS.utill.fn.getSapIconPath(sIconName);
}

// 10. Window Header Menu Setting
function setBrowserMenu(aTemplate) {
    oWS.utill.fn.setBrowserMenu(aTemplate);
}

// 11. 현재 dirname 구하기
function getDirName() {
    return oWS.utill.fn.getDirName();
}

// 12. Page Path 구하기
function getPath(sPagePath) {
    return oWS.utill.fn.getPath(sPagePath);
}

// 13. ajax 통신 (FormData, success callback)
function sendAjax(sPath, oFormData, fn_callback) {
    oWS.utill.fn.sendAjax(sPath, oFormData, fn_callback);
}

// 14. 서버에서 App 정보를 구한다.
function getAppDataFromServer(oFormData, fn_success) {
    oWS.utill.fn.getAppDataFromServer(oFormData, fn_success);
}

// 15. 새창 띄우기
function onNewWindow() {
    oWS.utill.fn.onNewWindow();
}

/** 
 * 16. 새창 띄울때 현재 세션 추가하기
 * @param {*} TYPE
 *  - A : +
 *  - D : -  
 */
function setSessionCount(TYPE) {
    return oWS.utill.fn.setSessionCount(TYPE);
}

// // 17. error page 호출
// function setErrorPage(sErrMsg) {
//     oWS.utill.fn.setErrorPage(sErrMsg);
// }

// 18. error message 가져오기
function getErrorMsg() {
    return oWS.utill.fn.getErrorMsg();
}

// 19. Busy Indicator 실행
function setBusy(bIsBusy) {
    oWS.utill.fn.setBusy(bIsBusy);
}

// 현재 Busy Indicator 상태를 구한다.
function getBusy() {
    return oWS.utill.fn.getBusy();
}

// 20. Page Loading 실행
function showLoadingPage(bIsShow) {
    oWS.utill.fn.showLoadingPage(bIsShow);
}

// 21. 에디터 정보 저장
function setWsConfigInfo(oWsConfInfo) {
    oWS.utill.fn.setWsConfigInfo(oWsConfInfo);
}

// 22. 에디터 정보 구하기
function getWsConfigInfo() {
    return oWS.utill.fn.getWsConfigInfo();
}

// 23. sap sound
function setSoundMsg(TYPE) {
    oWS.utill.fn.setSoundMsg(TYPE);
}

// 24. Login 유저 정보 저장 
function setUserInfo(oUserInfo) {
    oWS.utill.fn.setUserInfo(oUserInfo);
}

// 25. Login 유저 정보 구하기
function getUserInfo() {
    return oWS.utill.fn.getUserInfo();
}

// 27. random Key 생성
function getRandomKey(iLenth) {
    return oWS.utill.fn.getRandomKey(iLenth);
}

// 28. SSID Setting
function setSSID(SSID) {
    oWS.utill.fn.setSSID(SSID);
}

// 29. SSID 구하기
function getSSID() {
    return oWS.utill.fn.getSSID();
}

// 30. Browser Session Key를 구한다.
function getSessionKey() {
    return oWS.utill.fn.getSessionKey();
}

// Browser Session Key 정보를 set 한다.
function setSessionKey(sSessKey) {
    oWS.utill.fn.setSessionKey(sSessKey);
}

function getBrowserKey() {
    return oWS.utill.fn.getBrowserKey();
}

function setBrowserKey(sBrowserKey) {
    oWS.utill.fn.setBrowserKey(sBrowserKey);
}

// 31. 메시지 번호에 맞는 메시지 내용을 구한다.
function getMessage(MSGKY) {
    return oWS.utill.fn.getMessage(MSGKY);
}

// 32. 어플리케이션 실행 URL 리턴
function getAppExePath() {
    return oWS.utill.fn.getAppExePath();
}

// 33. Default Browser 정보 리턴
function getDefaultBrowserInfo() {
    return oWS.utill.fn.getDefaultBrowserInfo();
}

// 34. Default Browser 정보 저장
function setDefaultBrowserInfo(aDefaultBrowsInfo) {
    oWS.utill.fn.setDefaultBrowserInfo(aDefaultBrowsInfo);
}

// 35. 메타 정보 세팅
function setMetadata(METADATA) {
    oWS.utill.fn.setMetadata(METADATA);
}

// 36. 메타 정보 구하기
function getMetadata() {
    return oWS.utill.fn.getMetadata();
}

// Network 상태에 따른 Busy Indicator
function setNetworkBusy(bIsBusy, iZindex) {
    oWS.utill.fn.setNetworkBusy(bIsBusy, iZindex);
}

// 헤더 메뉴 보이기/ 숨기기 기능
function setHeaderMenuVisible(bIsVisi) {

    if (typeof bIsVisi !== "boolean") {
        return;
    }

    var oCurrWin = REMOTE.getCurrentWindow();

    oCurrWin.setMenuBarVisibility(bIsVisi);

}

function setCurrPage(sPageId) {
    oWS.utill.attr.currPage = sPageId;
}

function getCurrPage() {
    return oWS.utill.attr.currPage;
}

// 텍스트 클립보드 복사
function setClipBoardTextCopy(sText, fnCallback) {

    if (typeof sText !== "string") {
        return;
    }

    var oTextArea = document.createElement("textarea");
    oTextArea.value = sText;

    document.body.appendChild(oTextArea);

    oTextArea.select();

    document.execCommand('copy');

    document.body.removeChild(oTextArea);

    if (typeof fnCallback === "function") {
        fnCallback();
    }

}

// Application Change 모드 변경
function setAppChange(bIsChange) {

    if (typeof bIsChange !== "string") {
        return;
    }

    if (bIsChange != 'X' && bIsChange != '') {
        return;
    }

    // 어플리케이션 정보 가져오기
    var oAppInfo = getAppInfo();

    // 어플리케이션 정보에 변경 플래그 
    oAppInfo.IS_CHAG = bIsChange;

    setAppInfo(oAppInfo);

}

/************************************************************************
 *  작업표시줄에 ProgressBar
 * **********************************************************************
 * @param {CHAR1} TYPE
 * - ProgressBar Type 
 * - "S" : 일반 스타일, "E": "오류 스타일"
 * @param {Boolean}} bIsShow
 * - ProgressBar 실행/중지 
 * - true: 실행
 * - false: 중지
 ************************************************************************/
function setProgressBar(TYPE, bIsShow) {

    if (typeof TYPE !== "string") {
        return;
    }

    if (typeof bIsShow !== "boolean") {
        return;
    }

    var oCurrWin = REMOTE.getCurrentWindow();

    var oOptions = {
            mode: "error"
        },
        iStatus = (bIsShow ? 1 : 0);

    // 현재 Busy Indicator 상태정보를 글로벌 변수에 저장한다.
    oWS.utill.attr.isBusy = (bIsShow == true ? "X" : "");

    switch (TYPE) {
        case "S":
            oOptions.mode = "normal";
            iStatus = (bIsShow ? 2 : 0);
            break;

        case "E":
            oOptions.mode = "error";
            break;

        default:
            oOptions.mode = "none";
            break;
    }

    oCurrWin.setProgressBar(iStatus, oOptions);

} // end of oAPP.common.setProgressBar


function onLoadBusyIndicator() {

    var oCurrWin = REMOTE.getCurrentWindow(),
        SESSKEY = getSessionKey();

    var sIndicatorPath = APPPATH + "\\Frame\\BusyIndicator.html";

    // 브라우저 옵션 설정
    var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/BrowserWindow/BrowserWindow-settings.json"),
        oOptions = require(sSettingsJsonPath),
        oBrowserOptions = jQuery.extend(true, {}, oOptions.browserWindow);

    oBrowserOptions.modal = true;
    oBrowserOptions.show = false;
    oBrowserOptions.resizable = false;
    oBrowserOptions.frame = false;
    oBrowserOptions.transparent = true;
    oBrowserOptions.thickFrame = false;
    oBrowserOptions.maximizable = false;
    oBrowserOptions.minimizable = false;
    oBrowserOptions.autoHideMenuBar = true;
    oBrowserOptions.devTools = false;
    oBrowserOptions.parent = oCurrWin;
    oBrowserOptions.webPreferences.partition = SESSKEY;
    oBrowserOptions.webPreferences.nodeIntegration = false;

    // 브라우저 오픈
    var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
    REMOTEMAIN.enable(oBrowserWindow.webContents);

    // 브라우저 상단 메뉴 없애기
    oBrowserWindow.setMenu(null);

    oBrowserWindow.loadURL(sIndicatorPath);

    // 브라우저가 오픈이 다 되면 타는 이벤트
    oBrowserWindow.webContents.on('did-finish-load', function () {        
        oBrowserWindow.setContentBounds(oCurrWin.getBounds());
    });

    // 브라우저를 닫을때 타는 이벤트
    oBrowserWindow.on('closed', () => {

        oBrowserWindow = null;

        if (oWS.utill.attr.oBusyIndicator) {
            delete oWS.utill.attr.oBusyIndicator;
        }

    });

    oWS.utill.attr.oBusyIndicator = oBrowserWindow;

}

//Window Move 이벤트 on/off 설정 펑션 
function fn_onWinMove(on, oWin) {

    if (typeof oWin === "undefined") {
        return;
    }

    if (typeof oWin.__fnWinMove === "undefined") {

        oWin.__fnWinMove = function () {

            fn_setWinMinSize(oWin);

        };

    }

    if (on) {

        fn_setWinMinSize(oWin);

        oWin.on("move", oWin.__fnWinMove);

    } else {

        oWin.setMinimumSize(800, 800);

        var oSize = oWin.getBounds();
        oSize.width = 800;
        oSize.height = 800;

        oWin.setBounds(oSize);

        oWin.off("move", oWin.__fnWinMove);

        delete oWin.__fnWinMove;
        delete screen.__width;

    }

}

//윈도우 최소 size 설정 펑션 
function fn_setWinMinSize(oWin) {

    if (typeof screen.__width === "undefined") {
        screen.__width = screen.width;
        screen.__height = screen.height;

        var Lwidth = screen.width / 2;
        var Lheight = screen.height / 2;

        oWin.setMinimumSize(Math.ceil(Lwidth), Math.ceil(Lheight));

        return;

    }

    //멀티 모니터 사용시 모니터별 해상도 변화가 감지 되었을경우 
    if (screen.__width != screen.width) {
        screen.__width = screen.width;
        screen.__height = screen.height;

        var Lwidth = screen.width / 2;
        var Lheight = screen.height / 2;

        var oSize = oWin.getBounds(),
            isRun = false;

        if (oSize.width < Lwidth) {
            isRun = true;
            oSize.width = Lwidth;
        }

        if (oSize.height < Lheight) {
            isRun = true;
            oSize.height = Lheight;
        }

        if (isRun) {
            oWin.setBounds(oSize);
        }

        oWin.setMinimumSize(Math.ceil(Lwidth), Math.ceil(Lheight));

    }

}

// window Size 개인화
function fn_setPersonalWinSize(oWin) {

    //차후 사용자 창 닫을때 마지막 윈도우창 SIZE을 읽는 로직이 필요함 

    var Lwidth = screen.width / 2;
    var Lheight = screen.height / 2;

    var oSize = oWin.getBounds(),
        isRun = false;
    if (oSize.width < Lwidth) {
        isRun = true;
        oSize.width = Lwidth;
    }
    if (oSize.height < Lheight) {
        isRun = true;
        oSize.height = Lheight;
    }
    if (isRun) {
        oWin.setBounds(oSize);
    }

}

//
function fnSaveEventSuggestion(sName, sValue) {

    const iMaxCnt = 20;

    let sJsonPath = PATH.join(USERDATA, "p13n", "events.json"),
        sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
        aEvents = JSON.parse(sJsonData);

    if (aEvents instanceof Array == false) {
        aEvents = [];
    }

    let iEventLength = aEvents.length;
    if (iEventLength == 0) {
        aEvents.push({
            name: sName,
            value: sValue
        });

        // events.json 파일에 Event Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(aEvents));
        return;
    }

    // 저장하려는 ID가 이미 있으면
    // 해당 ID를 Suggestion 최상단에 배치한다. 
    let iFindIndex = aEvents.findIndex(a => a.name == sName);

    // 저장하려는 ID가 이미 있고 Array에 가장 첫번째에 있으면 빠져나간다.    
    if (iFindIndex == 0) {
        return;
    }

    // 저장하려는 ID가 이미 있고 Array에 첫번째가 아니면 
    // 기존 저장된 위치의 ID 정보를 삭제
    if (iFindIndex > 0) {
        aEvents.splice(iFindIndex, 1);
    }

    // 저장된 Suggestion 갯수가 iIdSuggMaxCnt 이상이면
    // 마지막거 지우고 최신거를 1번째로 저장한다.
    let iBeforeCnt = aEvents.length;
    if (iBeforeCnt >= iMaxCnt) {
        aEvents.pop();
    }

    // ID를 Array의 가장 첫번째로 넣는다.
    aEvents.unshift({
        name: sName,
        value: sValue
    });

    // login.json 파일에 ID Suggestion 정보 저장
    FS.writeFileSync(sJsonPath, JSON.stringify(aEvents));

}

/************************************************************************
 * 서버 이벤트 Suggestion 데이터 읽기
 ************************************************************************/
function fnReadEventSuggestion(sName) {

    let sJsonPath = PATH.join(USERDATA, "p13n", "events.json"),
        sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
        aEvents = JSON.parse(sJsonData);

    if (aEvents instanceof Array == false) {
        return [];
    }

}

/************************************************************************
 * 테마 정보 저장
 ************************************************************************/
function setThemeInfo(oThemeInfo) {

    oWS.utill.attr.oThemeInfo = oThemeInfo;

}

/************************************************************************
 * 테마 정보 구하기
 ************************************************************************/
function getThemeInfo() {
    return oWS.utill.attr.oThemeInfo || {};
}