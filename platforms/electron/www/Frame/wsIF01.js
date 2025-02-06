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

function setServerInfo(oServerInfo) {
    oWS.utill.fn.setServerInfo(oServerInfo);
}

function setBeforeServerInfo(oServerInfo) {
    oWS.utill.fn.setBeforeServerInfo(oServerInfo);
}

function getBeforeServerInfo() {
    return oWS.utill.fn.getBeforeServerInfo();
}


// 3. 서버 URL을 구한다.
function getServerPath(bIsStateLess) {
    return oWS.utill.fn.getServerPath(bIsStateLess);
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

// // 9. SAP ICON Path // oAPP.fn.fnGetSapIconPath()으로 대체함
// function getSapIconPath(sIconName) {
//     return oWS.utill.fn.getSapIconPath(sIconName);
// }

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

// // 13. ajax 통신 (FormData, success callback)
// function sendAjax(sPath, oFormData, fn_callback) {
//     oWS.utill.fn.sendAjax(sPath, oFormData, fn_callback);
// }

// 14. 서버에서 App 정보를 구한다.
function getAppDataFromServer(oFormData, fn_success) {
    oWS.utill.fn.getAppDataFromServer(oFormData, fn_success);
}

// 15. 새창 띄우기
function onNewWindow(IF_DATA) {
    oWS.utill.fn.onNewWindow(IF_DATA);
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
// - 파라미터에 Option이 존재할 경우는 busyDialog로 호출함
function setBusy(bIsBusy, oOptions) {    

    zconsole.warn("setBusy", `bIsBusy: "${bIsBusy}", oOptions: ${oOptions}`);

    //현재 busy가 on 상태인경우, 다시 on 처리시 return.
    if(oWS.utill.fn.getBusy() === "X" && bIsBusy === "X"){
        
        //현재 busy dialog가 open 된 상태인경우.
        if(typeof oWS.utill.attr.oBusyDlg !== "undefined" && typeof oOptions !== "undefined"){

            //busy dialog 재호출(text 변경 목적).
            oWS.utill.fn.setBusyDialog(bIsBusy, oOptions);
        
        }
        
        return;
    }    
    
    //busy on 처리 건인경우.
    if(bIsBusy === "X"){
        // 파라미터에 옵션을 추가했을 경우는 BusyDialog로 호출함!!
        if(typeof oOptions === "object"){
            oWS.utill.fn.setBusyDialog(bIsBusy, oOptions);
            return;
        }
        
        oWS.utill.fn.setBusy(bIsBusy);
        
        return;
    }
    
    
    //busy dialog 종료처리.
    oWS.utill.fn.setBusyDialog("", oOptions);
    
    //기존 busy 종료 처리.
    oWS.utill.fn.setBusy("");

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

// // 32. 어플리케이션 실행 URL 리턴
// function getAppExePath() {
//     return oWS.utill.fn.getAppExePath();
// }

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
 * 새창 실행 시, IF_DATA 된 정보 저장
 ************************************************************************/
function setNewBrowserIF_DATA(IF_DATA){

    oWS.utill.attr.NEW_BROWS_IF_DATA = IF_DATA;

} // end of setNewBrowserIF_DATA

/************************************************************************
 * 새창 실행 시, IF_DATA 저장된 데이터 구하기
 ************************************************************************/
function getNewBrowserIF_DATA(){

    return oWS.utill.attr.NEW_BROWS_IF_DATA || undefined;

} // end of getNewBrowserIF_DATA


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

/************************************************************************
 * HTML 문서에서 HTML 태그만 없애고 순수 text만 리턴
 ************************************************************************/
function setCleanHtml(msgtxt) {

    /**************************************** 
        @2020.11.17 by soccerhs
        - html에서 텍스트만 추출하는 Regex
    *****************************************/

    if (!msgtxt) {
        return;
    }

    /* html 부터 head 태그 날리기 */
    msgtxt = msgtxt.replace(/(<html>|<html)(\s|\S)*?<\/head>/igm, "\n");

    /* script영역 날리기 */
    msgtxt = msgtxt.replace(/(<script>|<script)(\s|\S)*?<\/script>/igm, "\n");

    /* Table Tag만 따로 수집한다 */
    var aTableTag = [];

    msgtxt = msgtxt.replace(/(<table>|<table)(\s|\S)*?<\/table>/igm, function (full) {

        var iTableCnt = aTableTag.length;

        aTableTag.push(full);

        return "\n&&table" + iTableCnt + "&&\n";

    });

    /* html의 END 태그를 개행 시키기 */
    msgtxt = msgtxt.replace(/\s*<\/[^>]+>\s*/igm, "\n");

    /* html 태그 날리기 */
    msgtxt = msgtxt.replace(/\s*<[^>]+>/igm, "\n");

    /* 여러 개행 문자를 하나의 개행문자로 축소하기 */
    msgtxt = msgtxt.replace(/[\n$]+[\n$]/igm, "\n");

    /* 추출된 문자열의 첫번째와 마지막의 개행 문자를 제거하기 */
    msgtxt = msgtxt.replace(/(^\n|\n$)/igm, "");

    // msgtxt = msgtxt.replace(/\n/g, '<br>');

    /* Table 태그가 있을 경우 원래 위치로 replace 수행 */
    if (aTableTag.length != 0) {

        var iLen = aTableTag.length,
            regex = "";

        for (var i = 0; i < iLen; i++) {

            var oTag = aTableTag[i],
                oDom = document.createElement("div");

            oDom.innerHTML = oTag;

            var oTagData = lf_removeStyleAttr(oDom);
            aTableTag[i] = oTagData.innerHTML;

            regex = "&&table" + i + "&&";
            msgtxt = msgtxt.replace(regex, aTableTag[i]);

        }

    }

    function lf_removeStyleAttr(oDom) {

        var aChild = oDom.childNodes,
            iChildCnt = aChild.length;

        if (iChildCnt == 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {

            var oChild = aChild[i],
                aAttr = oChild.attributes;

            if (aAttr == null) {
                continue;
            }

            var iAttrLen = aAttr.length;

            /* Dom이 가지고 있는 속성을 확인한다. */
            if (iAttrLen != 0) {

                for (var j = iAttrLen - 1; j >= 0; j--) {

                    /* width, height 속성을 제외하고 나머지 속성 전체 제거 */
                    var sAttrName = aAttr[j].name;

                    if (sAttrName == null ||
                        sAttrName == "" ||
                        sAttrName == "width" ||
                        sAttrName == "height" ||
                        sAttrName == "background") {
                        continue;
                    }

                    oChild.removeAttribute(sAttrName);

                }

            }

            if (oChild.childNodes.length == 0) {
                continue;
            }

            lf_removeStyleAttr(oChild);
        }

        return oDom;

    }; /* end of f_removeStyle */

    return msgtxt;

}

/************************************************************************
 * trial 모드 여부 플래그
 ************************************************************************/
function getIsTrial() {

    // trial 버전이 아닐때만 수행
    var oWsSettings = getSettingsInfo(),
        bIsTrial = oWsSettings.isTrial;

    return bIsTrial;

}

/************************************************************************
 * ws setting 정보
 ************************************************************************/
function getSettingsInfo() {

    // Browser Window option
    var oSettingsPath = PATHINFO.WSSETTINGS,

        // JSON 파일 형식의 Setting 정보를 읽는다..
        oSettings = require(oSettingsPath);
    if (!oSettings) {
        return;
    }

    return oSettings;

}

/************************************************************************
 * 개인화 파일에 저장된 CDN 허용 여부 플래그를 가져온다.
 ************************************************************************/
function getIsCDN() {

    // 서버 접속 정보
    var oServerInfo = getServerInfo(),
        sSysID = oServerInfo.SYSID;

    // P13N 파일 Path
    var sP13nPath = getPath("P13N"),
        sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

        // 개인화 정보
        oP13nData = JSON.parse(sP13nJsonData);

    return oP13nData[sSysID].ISCDN;

}; // end of oAPP.fn.fnGetIsCDN

/************************************************************************
 * 개인화 파일에 저장된 CDN 허용 여부 플래그를 저장한다.
 ************************************************************************/
function setIsCDN(bIsCDN) {

    // 서버 접속 정보
    var oServerInfo = getServerInfo(),
        sSysID = oServerInfo.SYSID;

    // P13N 파일 Path
    var sP13nPath = getPath("P13N"),
        sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

        // 개인화 정보
        oP13nData = JSON.parse(sP13nJsonData);

    oP13nData[sSysID].ISCDN = bIsCDN;

    FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

}; // end of oAPP.fn.fnSetIsCDN

/************************************************************************
 *  개인화 파일에 저장.
 * **********************************************************************
 * @param {String} sName
 * - 개인화 구분자명 
 * 
 * @param {any} anyData
 * - 저장하고 싶은 형태 자유.
 ************************************************************************/
function setP13nData(sName, anyData) {

    // 서버 접속 정보
    var oServerInfo = getServerInfo(),
        sSysID = oServerInfo.SYSID;

    // P13N 파일 Path
    var sP13nPath = getPath("P13N"),
        sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

        // 개인화 정보
        oP13nData = JSON.parse(sP13nJsonData);

    oP13nData[sSysID][sName] = anyData;

    FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

}

/************************************************************************
 *  저장된 개인화 파일 읽기
 * **********************************************************************
 * @param {String} sName
 * - 개인화 구분자명 
 * 
 * @return {any}
 * - 저장했던 구조
 ************************************************************************/
function getP13nData(sName) {

    // 서버 접속 정보
    var oServerInfo = getServerInfo(),
        sSysID = oServerInfo.SYSID;

    // P13N 파일 Path
    var sP13nPath = getPath("P13N"),
        sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

        // 개인화 정보
        oP13nData = JSON.parse(sP13nJsonData);

    return oP13nData[sSysID][sName];

}

/************************************************************************
 * 호스트 정보를 구한다.
 ************************************************************************/
function getHost() {

    return getServerHost();

}

/************************************************************************
 * 공백 여부
 ************************************************************************/
function isBlank(s) {
    return isEmpty(s.trim());
}

/************************************************************************
 * 빈값 여부
 ************************************************************************/
function isEmpty(s) {
    return !s.length;
}

/************************************************************************
 * CONV Base64 -> ArrayBuffer
 ************************************************************************/
function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/************************************************************************
 * 같은 세션의 브라우저 인스턴스 구하기
 ************************************************************************/
function getSameBrowsers() {

    // 1. 현재 떠있는 브라우저 갯수를 구한다.
    var sKey = getSessionKey(),
        oMeBrows = REMOTE.getCurrentWindow(), // 현재 나의 브라우저
        aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
        iBrowsLen = aBrowserList.length;

    var iSamekeys = 0,
        aSameBrows = [];

    for (var i = 0; i < iBrowsLen; i++) {

        var oBrows = aBrowserList[i];
        if (oBrows.isDestroyed()) {
            continue;
        }

        try {
        
            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

        } catch (error) {
            continue;
        }
        

        // 팝업같은 경우는 카운트 하지 않는다.
        if (oWebPref.OBJTY) {
            continue;
        };

        // session 정보가 없으면 skip.
        var sSessionKey = oWebPref.partition;
        if (!sSessionKey) {
            continue;
        }

        // 브라우저가 내 자신이라면 skip.
        if (oBrows.id == oMeBrows.id) {
            // oMeBrowser = oBrows;
            continue;
        }

        // 현재 브라우저의 session key 와 동일하지 않으면 (다른 서버창) skip.
        if (sKey != sSessionKey) {
            continue;
        }

        // 같은 세션키를 가진 브라우저 갯수를 카운트한다.
        iSamekeys++;
        aSameBrows.push(oBrows);
    }

    return aSameBrows;

}

/************************************************************************
 * electron native object에 접속한 User 정보를 저장한다
 ************************************************************************/
function setProcessEnvUserInfo(oUserInfo) {

    process.USERINFO = oUserInfo;

    const      
        PATH = REMOTE.require('path'),                 
        USERINFO = process.USERINFO
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        LANGU = USERINFO.LANGU,
        SYSID = USERINFO.SYSID;

    const
        WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        WSUTIL = require(WSMSGPATH),
        WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

}

/************************************************************************
 * 기 저장한 electron native object에 접속 User 정보를 구한다
 ************************************************************************/
function getProcessEnvUserInfo() {
    return process.USERINFO;
}

/************************************************************************
 * local console [R&D 전용 console.log]
 ************************************************************************/
// zconsole.log = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     console.log("[zconsole]: " + sConsole);

// };

// zconsole.error = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     console.error("[zconsole]: " + sConsole);

// };

// zconsole.warn = (sConsole) => {

//     const
//         APP = zconsole.APP;

//     // 빌드 상태에서는 실행하지 않음.
//     if (APP.isPackaged) {
//         return;
//     }

//     console.warn("[zconsole]: " + sConsole);

// };

// function fnGetMsgClsText(sMsgCls, sMsgNum, p1, p2, p3, p4) {

//     // Metadata에서 메시지 클래스 정보를 구한다.
//     var oMeta = getMetadata(),
//         sLangu = oMeta.LANGU,
//         aMsgClsTxt = oMeta["MSGCLS"];

//     if (!aMsgClsTxt || !aMsgClsTxt.length) {
//         return sMsgCls + "|" + sMsgNum;
//     }

//     let sDefLangu = "E"; // default language    

//     // 현재 접속한 언어로 메시지를 찾는다.
//     let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sLangu && a.MSGNR == sMsgNum);

//     // 현재 접속한 언어로 메시지를 못찾은 경우
//     if (!oMsgTxt) {

//         // 접속한 언어가 영어일 경우 빠져나간다.
//         if (sDefLangu == sLangu) {
//             return sMsgCls + "|" + sMsgNum;

//         }

//         // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
//         oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sDefLangu && a.MSGNR == sMsgNum);

//         // 그래도 없다면 빠져나간다.
//         if (!oMsgTxt) {
//             return sMsgCls + "|" + sMsgNum;
//         }

//     }

//     var sText = oMsgTxt.TEXT,
//         aWithParam = [];

//     // 파라미터로 전달 받은 Replace Text 수집
//     aWithParam.push(p1 == null ? "" : p1);
//     aWithParam.push(p2 == null ? "" : p2);
//     aWithParam.push(p3 == null ? "" : p3);
//     aWithParam.push(p4 == null ? "" : p4);

//     var iWithParamLenth = aWithParam.length;
//     if (iWithParamLenth == 0) {
//         return sText;
//     }

//     // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
//     for (var i = 0; i < iWithParamLenth; i++) {

//         var index = i + 1,
//             sParamTxt = aWithParam[i];

//         var sRegEx = "&" + index,
//             oRegExp = new RegExp(sRegEx, "g");

//         sText = sText.replace(oRegExp, sParamTxt);

//     }

//     sText = sText.replace(new RegExp("&\\d+", "g"), "");

//     // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
//     for (var i = 0; i < iWithParamLenth; i++) {

//         var sParamTxt = aWithParam[i];

//         sText = sText.replace(new RegExp("&", "i"), sParamTxt);

//     }

//     sText = sText.replace(new RegExp("&", "g"), "");

//     return sText;

// } // end of oAPP.common.fnTestGetMsgClsText