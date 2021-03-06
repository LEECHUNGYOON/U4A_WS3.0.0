/**************************************************************************
 * ws_fn_02.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        CURRWIN = REMOTE.getCurrentWindow(),
        REMOTEMAIN = parent.REMOTEMAIN;

    /************************************************************************
     * Application Display or Change mode 
     * **********************************************************************
     * @param {String} APPID  
     * - Application 명
     * 
     * @param {Char} ISEDIT
     * - 'X': Edit mode, ' ': Display Mode
     ************************************************************************/
    oAPP.fn.fnOnEnterDispChangeMode = function (APPID, ISEDIT) {

        var bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            return;
        }

        var sRandomKey = parent.getRandomKey(),
            SSID = APPID + "_" + sRandomKey;

        // SSID 저장
        parent.setSSID(SSID);

        var oFormData = new FormData();
        oFormData.append("APPID", APPID);
        oFormData.append("ISEDIT", ISEDIT);
        oFormData.append("SSID", SSID);

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, lf_success);

        function lf_success(oAppInfo) {

            var sCurrPage = parent.getCurrPage();

            // application 이 없을 경우 메시지 처리.
            if (oAppInfo.MSGTY == "N") {

                // 페이지 푸터 메시지
                oAPP.common.fnShowFloatingFooterMsg("E", sCurrPage, oAppInfo.MESSAGE);

                // Busy Indicator 닫기
                parent.setBusy('');

                return;

            }

            // Change 모드로 들어왔는데 APP가 Lock 걸려 있는 경우.
            if (ISEDIT == "X" && oAppInfo.IS_EDIT == "") {

                var sMsg = "Editing by " + oAppInfo.APPID;

                // 페이지 푸터 메시지
                oAPP.common.fnShowFloatingFooterMsg("E", "WS20", sMsg);

            }

            // Application 이 존재 할 경우
            // 리턴받은 APP 정보를 Frame에 저장한다.
            parent.setAppInfo(oAppInfo);

            // WS20 기본 모델 데이터
            var oWs20 = oAPP.main.fnGetWs20InitData();
            oWs20.APP = oAppInfo;

            // 모델에 데이터 업데이트
            oAPP.common.fnSetModelProperty("/WS20", oWs20);

            // WS10 페이지의 APPID 입력 필드에 Suggestion을 구성할 데이터를 저장한다.
            oAPP.fn.fnOnSaveAppSuggestion(oAppInfo.APPID);

            // WS20번 페이지로 이동한다.
            oAPP.fn.fnOnMoveToPage("WS20");

            // 브라우저 상단 메뉴 구성
            // oAPP.common.fnOnLoadBrowserMenu("WS20");

            // 단축키 삭제
            oAPP.common.removeShortCut("WS10");

            // 단축키 설정
            oAPP.common.setShortCut("WS20");

            // 20번 페이지 인스턴스
            var oMainPage = sap.ui.getCore().byId("WS20_MAIN");
            if (!oMainPage) {
                return;
            }

            // 디자인 영역을 구성한다.
            if (oAPP.attr.oArea) {
                oAPP.attr.APPID = oAppInfo.APPID;
                oAPP.fn.setUIAreaEditable();
                return;
            }

            // 공유 Object에 20번 페이지 인스턴스를 넣는다.
            oAPP.attr.oArea = oMainPage;

            // 20번 페이지에 보여질 APPID를 입력한다.
            oAPP.attr.APPID = oAppInfo.APPID;

            // 20번 페이지를 그린다.
            oAPP.fn.main();

            // WS20 페이지의 EDIT/DISPLAY 설정(차장님 부분)
            oAPP.fn.setUIAreaEditable();

        } // end of lf_success

    }; // end of oAPP.fn.fnOnEnterDispChangeMode

    /************************************************************************
     * 페이지 이동 (WS10 -> WS20, WS20 -> WS10)
     * **********************************************************************
     * @param {String} sPgNo  
     * - page 명
     * 예) WS10, WS20     
     ************************************************************************/
    oAPP.fn.fnOnMoveToPage = function (sPgNm) {

        var oApp = sap.ui.getCore().byId("WSAPP");
        if (!oApp) {
            return;
        }

        oApp.to(sPgNm);

    }; // end of oAPP.fn.fnOnMoveToPage

    /************************************************************************
     * WS10 페이지의 APPID 입력 필드에 Suggestion을 구성할 데이터를 저장한다.
     * **********************************************************************
     * @param {String} sAppID  
     * - Application Name      
     ************************************************************************/
    oAPP.fn.fnOnSaveAppSuggestion = function (sAppID) {

        var FS = parent.FS;

        // 서버 접속 정보
        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        // P13N 파일 Path
        var sP13nPath = parent.getPath("P13N"),
            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        // 개인화 정보 중, Default Browser 정보가 있는지 확인한다.	
        if (!oP13nData[sSysID].APPSUGG) {

            // 없으면 신규생성
            oP13nData[sSysID].APPSUGG = [{
                APPID: sAppID
            }];

            // suggustion save
            lf_saveSuggestion();

            return;
        }

        // 있으면 추가한다.

        // 기 저장된 APPID 정보를 읽는다.
        var aBeforeAppIds = oP13nData[sSysID].APPSUGG;

        // 저장하려는 APPID가 이미 있으면
        // 해당 APPID를 Suggestion 최상단에 배치한다. 
        var iFindIndex = aBeforeAppIds.findIndex(a => a.APPID == sAppID);

        // 저장하려는 APP가 이미 있고 Array에 가장 첫번째에 있으면 빠져나간다.    
        if (iFindIndex == 0) {
            return;
        }

        // 저장하려는 APP가 이미 있고 Array에 첫번째가 아니면 
        // 기존 저장된 위치의 APPID 정보를 삭제
        if (iFindIndex > 0) {
            aBeforeAppIds.splice(iFindIndex, 1);
        }

        var iBeforeCnt = aBeforeAppIds.length,
            oAppID = {
                APPID: sAppID
            },

            aNewArr = [];

        var SUGGMAXLENGTH = oAPP.attr.iAppSuggMaxCnt;

        // 저장된 Suggestion 갯수가 MaxLength 이상이면
        // 마지막거 지우고 최신거를 1번째로 저장한다.
        if (iBeforeCnt >= SUGGMAXLENGTH) {

            for (var i = 0; i < SUGGMAXLENGTH - 1; i++) {
                aNewArr.push(aBeforeAppIds[i]);
            }

        } else {

            for (var i = 0; i < iBeforeCnt; i++) {
                aNewArr.push(aBeforeAppIds[i]);
            }

        }

        aNewArr.unshift(oAppID);

        oP13nData[sSysID].APPSUGG = aNewArr;

        // suggustion save
        lf_saveSuggestion();

        function lf_saveSuggestion() {

            oAPP.common.fnSetModelProperty("/WS10/APPSUGG", oP13nData[sSysID].APPSUGG);

            // p13n.json 파일에 APPID Suggestion 정보 저장
            FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

        }

    }; // end of oAPP.fn.fnOnSaveAppSuggestion

    /************************************************************************
     * WS10 페이지로 이동
     * **********************************************************************/
    oAPP.fn.fnMoveToWs10 = function () {

        // Busy 실행
        parent.setBusy('X');

        // 10번 페이지로 이동할때 서버 한번 콜 해준다. (서버 세션 죽이기)
        oAPP.fn.fnKillUserSession(lf_success);

        function lf_success() {

            /**
             * 페이지 이동 시, CHANGE 모드였다면 현재 APP의 Lock Object를 해제한다.
             */
            var oAppInfo = parent.getAppInfo();

            if (oAppInfo.IS_EDIT == 'X') {
                ajax_unlock_app(oAppInfo.APPID);
            }

            // WS20 화면에서 떠있는 Dialog, Popup 종류, Electron Browser들 전체 닫는 function
            oAPP.fn.fnCloseAllWs20Dialogs();

            // WS20 페이지 삭제
            oAPP.fn.removeContent();

            // App Info 초기화
            parent.setAppInfo({});

            // WS20에 대한 모델 정보 초기화
            // oAPP.common.fnSetModelProperty("/WS20/APP", {});
            oAPP.common.fnSetModelProperty("/WS20", {});

            // 샘플 여부 플래그를 삭제한다.
            oAPP.common.fnSetModelProperty("/IS_EXAM", "");

            // 10번 프로그램으로 이동한다.        
            oAPP.fn.fnOnMoveToPage("WS10");

            // 브라우저 상단 메뉴 구성
            // oAPP.common.fnOnLoadBrowserMenu("WS10");

            // 20번 프로그램 단축키 삭제
            oAPP.common.removeShortCut("WS20");

            // 10번 프로그램 단축키 설정
            oAPP.common.setShortCut("WS10");

            // Busy 끄기
            parent.setBusy('');

        } // end of lf_success

    }; // end of oAPP.fn.fnMoveToWs10

    // 20 -> 10번 페이지로 이동 시 서버 세션 죽이기 위한 공통 펑션
    oAPP.fn.fnKillUserSession = function (fn_callback) {

        // var oAppInfo = parent.getAppInfo();
        var SSID = parent.getSSID();

        parent.setSSID("");

        var oFormData = new FormData();
        oFormData.append("SSID", SSID);
        oFormData.append("EXIT", 'X');

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, fn_callback);

    }; // end of oAPP.fn.fnKillUserSession

    /************************************************************************
     * Application Name 정합성 체크
     * **********************************************************************
     * @param {String} sAppID  
     * - Application Name
     * 
     * @returns {Object}
     * - RETCD : 상태값 (Boolean)
     * - RETMSG: 상태 메시지 (String)
     ************************************************************************/
    oAPP.fn.fnCheckValidAppName = function (sAppID) {

        var oRetData = {
            RETCD: false,
            RETMSG: ""
        };

        var sValue = sAppID;

        if (typeof sValue !== "string" || sValue == "") {
            oRetData.RETMSG = oAPP.common.fnGetMsgClsTxt("050", "Application Name");
            return oRetData;
        }

        // 특수문자 존재 여부 체크
        var reg = /[^\w]/;
        if (reg.test(sValue)) {
            oRetData.RETMSG = oAPP.common.fnGetMsgClassTxt("0010"); // Do not include special character in Application Name.
            return oRetData;
        }

        // AppID 자릿수가 15 이상일 경우 오류
        if (sValue.length > oAPP.attr.iAppNameMaxLength) {
            oRetData.RETMSG = oAPP.common.fnGetMsgClsTxt("115"); // "Application ID can only be 15 characters or less !!"         
            return oRetData;
        }

        var sValueUpper = sValue.toUpperCase(),

            bIsStartZ = jQuery.sap.startsWith(sValueUpper, "Z"),
            bIsStartY = jQuery.sap.startsWith(sValueUpper, "Y");

        // Application 명 시작이 Z 이나 Y로 시작하는지 확인한다.
        if (!bIsStartZ && !bIsStartY) {

            oRetData.RETMSG = oAPP.common.fnGetMsgClsTxt("009"); // "The application ID must start with Z or Y."
            return oRetData;
        }

        oRetData.RETCD = true;
        return oRetData;

    }; // end of oAPP.fn.fnCheckValidAppName

    /************************************************************************
     * Application Name 입력 체크
     ************************************************************************/
    oAPP.fn.fnCheckAppName = function () {

        var oAppNmInput = sap.ui.getCore().byId("AppNmInput");
        if (!oAppNmInput) {
            return false;
        }

        var sValue = oAppNmInput.getValue(),
            sCurrPage = parent.getCurrPage();

        // 어플리케이션 명 정합성 체크
        var oValid = oAPP.fn.fnCheckValidAppName(sValue);

        if (oValid.RETCD == false) {
            // 페이지 푸터 메시지
            oAPP.common.fnShowFloatingFooterMsg("E", sCurrPage, oValid.RETMSG);
            return false;
        }

        return true;

    }; // end of oAPP.fn.fnCheckAppName

    /************************************************************************
     * APP 상태를 점검한다. 
     * - Lock 여부
     * - Edit or Display 모드 여부
     ************************************************************************/
    oAPP.fn.fnSetAppChangeMode = function () {

        var oAppInfo = parent.getAppInfo(),
            sCurrPage = parent.getCurrPage();

        var oFormData = new FormData();
        oFormData.append("APPID", oAppInfo.APPID);
        oFormData.append("ISEDIT", 'X');

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, lf_success);

        function lf_success(oAppInfo) {

            parent.setBusy('');

            if (oAppInfo.IS_EDIT != "X") {

                var sMsg = "Editing by " + oAppInfo.APPID;

                // 페이지 푸터 메시지
                oAPP.common.fnShowFloatingFooterMsg("E", sCurrPage, sMsg);

                return false;

            }

            // App 정보 갱신
            parent.setAppInfo(oAppInfo);

            oAPP.common.fnSetModelProperty("/WS20/APP", oAppInfo);

            // 현재 떠있는 Electron Browser들 전체 닫는 function
            oAPP.fn.fnChildWindowClose();

            // 푸터 메시지 처리            
            // var sMsg = oAPP.common.fnGetMsgClassTxt("0013"); // "Switch to edit mode."
            var sMsg = oAPP.common.fnGetMsgClsTxt("020"); // "Switch to edit mode."

            oAPP.common.fnShowFloatingFooterMsg("S", sCurrPage, sMsg);

            oAPP.fn.setUIAreaEditable(); // Change Mode 모드로 변환

        }

    }; // end of oAPP.fn.fnSetAppChangeMode

    /************************************************************************
     * WS20 페이지 Lock 풀고 Display Mode로 전환
     * **********************************************************************/
    oAPP.fn.fnSetAppDisplayMode = function () {

        var oAppInfo = parent.getAppInfo(),
            sCurrPage = parent.getCurrPage();

        var oFormData = new FormData();
        oFormData.append("APPID", oAppInfo.APPID);

        // Lock을 해제한다.
        ajax_unlock_app(oAppInfo.APPID, lf_success);

        function lf_success(RETURN) {

            if (RETURN.RTCOD == 'E') {
                // 오류..1
                parent.showMessage(sap, 20, RETURN.RTCOD, RETURN.RTMSG);
                return;
            }

            RETURN.IS_EDIT = ""; // Display Mode FLAG
            RETURN.IS_CHAG = "";

            parent.setAppInfo(RETURN); // Application 정보 갱신

            oAPP.common.fnSetModelProperty("/WS20/APP", RETURN); // 모델 정보 갱신

            // 현재 떠있는 Electron Browser들 전체 닫는 function
            oAPP.fn.fnChildWindowClose();

            var sMsg = oAPP.common.fnGetMsgClsTxt("020"); // "Switch to display mode."

            // 푸터 메시지 처리
            oAPP.common.fnShowFloatingFooterMsg("S", sCurrPage, sMsg);

            oAPP.fn.setUIAreaEditable(oAppInfo.IS_CHAG); // Display 모드로 변환

        }

    }; // end of oAPP.fn.fnSetAppDisplayMode

    /************************************************************************
     * 어플리케이션 존재 유뮤 체크
     * **********************************************************************
     * @param {String} APPID  
     * - APPID 명
     *   
     * @param {Function} fnCallback 
     * - 성공시 실행되는 Callback Function 
     ************************************************************************/
    oAPP.fn.fnCheckAppExists = function (APPID, fnCallback) {

        var oFormData = new FormData();
        oFormData.append("APPID", APPID);

        // 서버에서 App 정보를 구한다.
        ajax_init_prc(oFormData, lf_success);

        function lf_success(oAppInfo) {

            var oResult = {
                RETCD: "",
                RETURN: oAppInfo
            };

            // application 이 없을 경우 메시지 처리.
            if (oAppInfo.MSGTY == "N") {

                oResult.RETCD = "E";

                fnCallback(oResult);

                return;

            }

            oResult.RETCD = "S";

            fnCallback(oResult);

        }

    }; // end of oAPP.fn.fnCheckAppExists

    /************************************************************************
     * Electron 브라우저로 Window Open
     * **********************************************************************
     * @param {Object} oBrowserOption  
     * - Electron window Browser Option 참고
     ************************************************************************/
    oAPP.fn.fnExternalOpen = function (oBrowserOptions) {

        function lf_external_open(oBrowserOptions) {

            var sPath = oBrowserOptions.url,

                // sPath = parent.getServerPath() + "/external_open?URL=" + sExtUrl,
                sExtOpenHtmlUrl = parent.getPath('EXTOPEN');

            // 브라우저 오픈
            var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
            REMOTEMAIN.enable(oBrowserWindow.webContents);

            // 팝업 위치를 부모 위치에 배치시킨다.
            var oParentBounds = CURRWIN.getBounds();
            oBrowserWindow.setBounds({
                x: Math.round((oParentBounds.x + oParentBounds.width / 2) - (oBrowserOptions.width / 2)),
                y: Math.round(((oParentBounds.height / 2) + oParentBounds.y) - (oBrowserOptions.height / 2))
            });

            oBrowserWindow.setMenu(null);

            oBrowserWindow.loadURL(sExtOpenHtmlUrl);

            // oBrowserWindow.webContents.openDevTools();

            // 브라우저가 오픈이 다 되면 타는 이벤트
            oBrowserWindow.webContents.on('did-finish-load', function () {
                // 오픈할 URL 파라미터 전송
                oBrowserWindow.webContents.send('if-extopen-url', sPath);
            });

            // 브라우저를 닫을때 타는 이벤트
            oBrowserWindow.on('closed', () => {
                oBrowserWindow = null;
            });

        } // end of lf_external_open

        function lf_success(oReturn) {

            if (oReturn.TYPE != "S") {
                return;
            }

            parent.setBusy('');

            lf_external_open(oBrowserOptions);

        } // end of lf_success

        // 로그인 세션 유지 상태 체크
        oAPP.common.sendAjaxLoginChk(lf_success);

    }; // end of oAPP.fn.fnExternalOpen

    /************************************************************************
     * 현재 파일에 저장되어있는 Default Browser 정보 기준으로 브라우저를 실행한다.
     * **********************************************************************
     * @param {String} APPID  
     * - APPID 명
     * 
     * @param {Boolean} bIsMulti
     * - true: Multi Preview로 실행
     * - false: 기본 브라우저 실행  
     ************************************************************************/
    oAPP.fn.fnOnExecApp = function (APPID, bIsMulti) {

        // 기본 브라우저 설정        
        oAPP.fn.fnOnInitP13nSettings();

        var SPAWN = parent.SPAWN, // pc 제어하는 api
            aComm = []; // 명령어 수집

        APPID = APPID.toLowerCase(); // APPID를 대문자로 변환

        var oServerInfo = parent.getServerInfo(),
            oServerHost = parent.getServerHost(),

            // 실행시킬 호스트명 + U4A URL 만들기   
            sHost = oServerHost,
            sPath = `${sHost}/zu4a/${APPID}?sap-language=${oServerInfo.LANGU}&sap-client=${oServerInfo.CLIENT}`;

        if (bIsMulti) {
            sPath = `${sHost}/zu4a_imp/ui5multipreview?applid=${APPID}`;          
        }

        var oDefBrows = oAPP.common.fnGetModelProperty("/DEFBR"),
            sSelectedBrows = oDefBrows.find(a => a.SELECTED == true);

        // 실행전 명령어 수집
        aComm.push(sPath);

        // APP 실행		
        SPAWN(sSelectedBrows.INSPATH, aComm);

    }; // end of oAPP.fn.fnOnExecApp

    /************************************************************************
     * APP SearchHelp의 App List Table Object Return
     ************************************************************************  
     * 예)oAPP.fn.fnSetTreeJson(oModel, "WS20.MIMETREE", "CHILD", "PARENT", "MIMETREE");
     * 
     * @param {*} m Core Model Instance
     * @param {*} p Tree를 구성할 원본 Model Path (Deep 은 [.] 점으로 구분)
     * @param {*} r CHILD
     * @param {*} t PARENT
     * @param {*} z 재구성할 MODEL PATH 명
     *************************************************************************/
    oAPP.fn.fnSetTreeJson = function (m, p, r, t, z) {

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

    }; // end of oAPP.fn.fnSetTreeJson

    /************************************************************************
     * 현재 떠있는 브라우저 중, 같은 세션의 브라우저의 인스턴스를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSameBrowsers = function () {

        // 1. 현재 떠있는 브라우저 갯수를 구한다.
        var sKey = parent.getSessionKey(),
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

            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

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

    }; // end of oAPP.fn.fnGetSameBrowsers

    /** 
     * @param {String} sUrl 
     * - window Open 시 실행할 URL
     * 
     * @param {Array} aParams 
     * - Post로 전송할 파라미터
     * - 형식 [{ NAME:"", VALUE:""}, ... ]
     */
    oAPP.fn.fnCallBrowserOpenPost = function (sUrl, aParams) {

        // dummy로 생성한 form이 있으면 지우고 시작
        var oDummyForm = document.getElementById('dummyform');
        if (oDummyForm) {
            document.body.removeChild(oDummyForm);
        }

        // window.open시 부여할 id
        var sWinKey = parent.getRandomKey(10);

        //동적 폼 생성
        var oDummyForm = document.createElement("form");
        oDummyForm.setAttribute("method", "POST");
        oDummyForm.setAttribute("id", "dummyform");
        oDummyForm.setAttribute("action", sUrl);
        oDummyForm.setAttribute("target", sWinKey);
        oDummyForm.setAttribute("name", sWinKey);

        document.body.appendChild(oDummyForm);

        // 동적 파라미터 생성
        if (aParams) {

            var iParlen = aParams.length;

            for (var i = 0; i < iParlen; i++) {

                var oParam = aParams[i],
                    oFormInput = document.createElement("input");

                oFormInput.setAttribute("type", "hidden");
                oFormInput.setAttribute("name", oParam.NAME);
                oFormInput.setAttribute("value", oParam.VALUE);

                oDummyForm.appendChild(oFormInput);

            }

        }

        // window open 실행
        var oWin = window.open("", sWinKey);

        // window open 후 focus 주기
        if (oWin) {
            oWin.focus();
        }

        // window open 후 Form Submit
        oDummyForm.submit();

        try {

            var oDummyForm = document.getElementById('dummyform');
            if (oDummyForm) {
                document.body.removeChild(oDummyForm);
            }

            aParams = null;

        } catch (err) {

        }

    }; // end of oAPP.fn.fnCallBrowserOpenPost    

    /************************************************************************
     * 화면에 떠있는 Dialog 들이 있을 경우 모두 닫는다.
     * **********************************************************************/
    oAPP.fn.fnCloseAllDialog = function () {

        var $OpenDialogs = $(".sapMDialogOpen"),
            iDialogLen = $OpenDialogs.length;

        if (iDialogLen <= 0) {
            return;
        }

        for (var i = 0; i < iDialogLen; i++) {

            var $oDialog = $OpenDialogs[i],
                sDialogId = $oDialog.id,

                oDialog = sap.ui.getCore().byId(sDialogId);

            if (!oDialog) {
                continue;
            }

            oDialog.close();
            oDialog.destroy();

        }

    }; // end of oAPP.fn.fnCloseAllDialog

    /************************************************************************
     * Electron Browser들 전체 닫는 function
     ************************************************************************/
    oAPP.fn.fnChildWindowClose = function () {

        var oCurrWin = parent.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        var aChild = oCurrWin.getChildWindows(),
            iChildCnt = aChild.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {
            var oChild = aChild[i];
            if (oChild.isDestroyed()) {
                continue;
            }

            oChild.close();
        }

    }; // end of oAPP.fn.fnChildWindowClose

    /************************************************************************
     * Electron Browser들 전체 활성/비활성화
     ************************************************************************/
    oAPP.fn.fnChildWindowShow = function (bShow) {

        var oCurrWin = REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        var aChild = oCurrWin.getChildWindows(),
            iChildCnt = aChild.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {

            var oChild = aChild[i],
                bIsDestroyed = oChild.isDestroyed();

            if (bIsDestroyed) {
                continue;
            }

            var isVisible = oChild.isVisible();

            // 숨기려는 경우
            if (!bShow) {

                // 이미 숨겨져 있다면 빠져나간다
                if (!isVisible) {
                    continue;
                }

                oChild.hide();

                continue;
            }


            if (isVisible) {
                continue;
            }

            oChild.show();

        }

    }; // end of oAPP.fn.fnChildWindowShow

    /************************************************************************
     * WS20 화면에서 떠있는 Dialog, Popup 종류, Electron Browser들 전체 닫는 function
     ************************************************************************/
    oAPP.fn.fnCloseAllWs20Dialogs = function () {

        // Dialog가 있을 경우 닫는다.
        oAPP.fn.fnCloseAllDialog();

        // footer 메시지가 열려 있을 경우 닫는다.
        oAPP.common.fnHideFloatingFooterMsg();

        // Multi Footer 메시지 영역이 있으면 삭제.
        oAPP.common.fnMultiFooterMsgClose();

        // Electron Browser들 전체 닫는 function
        oAPP.fn.fnChildWindowClose();

    }; // end of oAPP.fn.fnCloseAllWs20Dialogs

})(window, $, oAPP);