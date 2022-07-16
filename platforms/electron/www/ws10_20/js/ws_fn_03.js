/**************************************************************************
 * ws_fn_03.js
 **************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    var PATH = parent.PATH,
        APP = parent.APP,
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        APPCOMMON = oAPP.common,
        CURRWIN = REMOTE.getCurrentWindow(),
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        IPCMAIN = REMOTE.require('electron').ipcMain;

    /************************************************************************
     * 설정된 세션 타임아웃 시간 체크
     * **********************************************************************/
    oAPP.fn.fnSessionTimeoutCheck = function () {

        setTimeout(() => {

            // 브라우저의 세션 키
            var sSessionKey = parent.getSessionKey();

            // 설정된 세션 timeout 시간 도래 여부를 체크하기 위한 워커 생성
            oAPP.attr._oWorker = new Worker('./js/workers/u4aWsClientSessionWorker.js');

            // // 윈도우 클릭 이벤트 걸기
            // $(window).unbind("click", oAPP.fn.fnWindowClickEventListener);
            // $(window).unbind("keyup", oAPP.fn.fnWindowClickEventListener);

            // $(window).bind("click", oAPP.fn.fnWindowClickEventListener);
            // $(window).bind("keyup", oAPP.fn.fnWindowClickEventListener);

            // Session Time Worker onmessage 이벤트
            oAPP.attr._oWorker.onmessage = oAPP.fn.fnSessionTimeWorkerOnMessage;

            // 이벤트를 받으면 세션 타임을 초기화 한다.
            parent.IPCMAIN.on('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

            // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
            parent.IPCRENDERER.send("if-session-time", sSessionKey);

        }, 0);

    }; // end of oAPP.fn.fnSessionTimeoutCheck

    /************************************************************************
     * Session Time Worker onmessage 이벤트
     * **********************************************************************/
    oAPP.fn.fnSessionTimeWorkerOnMessage = function (e) {

        if (e.data != "X") {
            return;
        }

        console.log("세션종료!! -> " + Math.floor(+new Date() / 1000));

        // 워커 종료
        if (oAPP.attr._oWorker) {
            oAPP.attr._oWorker.terminate();
            delete oAPP.attr._oWorker;
        }

        // 서버 세션 워커 종료
        if (oAPP.attr._oServerWorker) {
            oAPP.attr._oServerWorker.terminate();
            delete oAPP.attr._oServerWorker;
        }

        // window 이벤트 해제
        $(window).unbind("click", oAPP.fn.fnWindowClickEventListener);
        $(window).unbind("keyup", oAPP.fn.fnWindowClickEventListener);

        // IPC MAIN 이벤트의 세션 타임 관련 이벤트 해제        
        parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

        //세션타임아웃 후 전체 로그아웃 및 같은 세션 창 전체 닫기
        oAPP.common.setSessionTimeout();

        // // Session Logoff 처리..
        // fn_logoff_success('X');

    }; // end of oAPP.fn.fnSessionTimeWorkerOnMessage

    /************************************************************************
     * 클릭 & 키보드 이벤트 발생 시 세션 타임 초기화 시킨다.
     * **********************************************************************/
    oAPP.fn.fnWindowClickEventListener = function () {

        console.log("윈도우 클릭했다!!");

        var sSessionKey = parent.getSessionKey();

        // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
        parent.IPCRENDERER.send("if-session-time", sSessionKey);

    }; // end of oAPP.fn.fnWindowClickEventListener  

    /************************************************************************
     * UI COPY
     ************************************************************************
     * @param {String}  sFromKey
     * - 복사하는 영역
     * 
     * @param {Array}   aTarget
     * - 붙이기 가능한 영역
     * 
     * @param {Object}  ODATA
     * - 저장하려는 데이터
     ************************************************************************/
    oAPP.fn.setCopyData = function (sFromKey, aTarget, ODATA) {

        var FS = parent.FS,
            sClipboardJsonPath = parent.getPath("CLIPBOARD"),
            bIsExists = FS.existsSync(sClipboardJsonPath);

        // Clipboard.json 파일이 없다면 생성
        if (!bIsExists) {
            FS.writeFileSync(sClipboardJsonPath, JSON.stringify({}));
        }

        var oCopiedData = JSON.parse(FS.readFileSync(sClipboardJsonPath, 'utf-8'));

        // 이미 저장된 키가 있으면 지우고 시작한다.
        if (oCopiedData[sFromKey]) {
            delete oCopiedData[sFromKey];
        }

        // UI Copy 정보 기본 구조
        var oCopyData = {
            OBJTY: "",
            FROM: sFromKey, // 복사한 영역
            TARGET: aTarget || [], // 복사한 UI가 붙여넣기 할 수 있는 영역 리스트
            DATA: ODATA // 복사한 UI 정보
        }

        oCopiedData[sFromKey] = oCopyData;

        FS.writeFileSync(sClipboardJsonPath, JSON.stringify(oCopiedData));

        var sMsg = oAPP.common.fnGetMsgClassTxt("0017"); // "Clipboard Copy Success!"

        parent.showMessage(sap, 10, 'S', sMsg);

    }; // end of oAPP.fn.setCopyData

    /************************************************************************
     * Copy 한 UI 정보 구하기
     ************************************************************************
     * @param {String}  sTarget
     * - 붙여 넣을 영역 
     * 
     * @return {Array} 
     * - 붙여 넣을 영역에 해당하는 Copy 데이터들 수집하여 리턴
     ************************************************************************/
    oAPP.fn.getCopyData = function (sTarget) {

        var FS = parent.FS,
            sClipboardJsonPath = parent.getPath("CLIPBOARD"),
            bIsExists = FS.existsSync(sClipboardJsonPath);

        // clipboard.json 파일이 없으면 리턴..
        if (!bIsExists) {
            return [];
        }

        var oCopiedData = JSON.parse(FS.readFileSync(sClipboardJsonPath, 'utf-8'));

        var aKeys = [];

        for (var i in oCopiedData) {

            var sKeynm = i,
                oKeyData = oCopiedData[sKeynm];

            if (oKeyData == null) {
                continue;
            }

            if (sKeynm.startsWith("U4AWS") == false) {
                continue;
            }

            var aTargetData = oKeyData.TARGET;

            // Target 데이터가 Array 타입이 아니면 continue..
            if (aTargetData instanceof Array == false) {
                continue;
            }

            if (!aTargetData.find(TARGET => TARGET == sTarget)) {
                continue;
            }

            aKeys.push(oKeyData);

        }

        return aKeys;

    }; // end of oAPP.fn.getCopyData

    /************************************************************************
     * 해당 영역에 기 저장된 UI 정보가 있는지 확인하는 function
     ************************************************************************
     * @param {String}  sAreaKey
     * - 영역 구분 키
     * 
     * @return {Boolean} 
     * - true  : 해당 영역에 저장된 UI 정보가 있을 경우.
     * - false : 해당 영역에 저장된 UI 정보가 없을 경우.
     ************************************************************************/
    oAPP.fn.isExistsCopyData = function (sAreaKey) {

        var aCopyData = oAPP.fn.getCopyData(sAreaKey);

        if (aCopyData.length <= 0) {
            return false;
        }

        return true;

    }; // end of oAPP.fn.isExistsCopyData    

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function () {

        // Browser Window option
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    /************************************************************************
     * UI5로 만든 Window Menu를 닫는다.
     ************************************************************************/
    oAPP.fn.fnWindowMenuClose = function () {

        var $oWMenu = $(".u4aWsWindowMenu"),
            iMenuLength = $oWMenu.length;

        if (iMenuLength <= 0) {
            return;
        }

        for (var i = 0; i < iMenuLength; i++) {

            var oMenu = $oWMenu[i],
                sId = oMenu.id;

            var oMenuUI = sap.ui.getCore().byId(sId);
            if (oMenuUI == null) {
                continue;
            }

            if (oMenuUI instanceof sap.ui.unified.Menu == false) {
                continue;
            }

            oMenuUI.close();

        }

    }; // end of  oAPP.fn.fnWindowMenuClose

    /************************************************************************
     * U4A R&D 여부
     ************************************************************************/
    oAPP.fn.fnIsStaff = function () {

        var oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase();

        switch (sUserId) {
            case "YSHONG":
            case "SHHONG":
            case "PES":
            case "SOCCERHS":
            case "ZAESTFT201":
            case "ZAESTFT202":
            case "ZAESTFT203":
            case "ZAESTFT204":
                return true;
            default:
                return false;
        }

    }; // end of oAPP.fn.fnIsStaff

    /************************************************************************
     * 현재 화면에 Open 된 Dialog가 있는지 여부 확인
     ************************************************************************/
    oAPP.fn.fnCheckIsDialogOpen = function () {

        var $oDialog = $(".sapMDialogOpen"),
            iDialogLength = $oDialog.length;

        if (iDialogLength <= 0) {
            return false;
        }

        return true;

    }; // end of oAPP.fn.fnCheckIsDialogOpen

    /************************************************************************
     * SAP Icon Image 경로를 주는 펑션
     ************************************************************************/
    oAPP.fn.fnGetSapIconPath = function (sIcon) {

        if (sIcon == null) {
            return;
        }

        var sIconName = sIcon + ".gif";

        return PATH.join(APP.getAppPath(), "icons", sIconName);

    }; // end of oAPP.fn.fnGetSapIconPath

    // /************************************************************************
    //  * Application Save & Activate
    //  ************************************************************************/
    // oAPP.fn.fnSetAppSaveAndActivate = function(oEvent) {

    //     var ISACT = oEvent.getParameter("ISACT"), // 저장 하고 activate 할 경우
    //         ISBACK = oEvent.getParameter("ISBACK"), // 저장후 뒤로 갈 경우 (20 -> 10)
    //         ISDISP = oEvent.getParameter("ISDISP"), // 저장후 Display 모드로 전환일 경우
    //         TRKORR = oEvent.getParameter("TRKORR"); // CTS 번호

    //     var sPath = parent.getServerPath() + '/saveappdata',
    //         oFormData = new FormData();

    //     if (ISACT) {
    //         oFormData.append("IS_ACT", ISACT);
    //     }

    //     if (TRKORR) {
    //         oFormData.append("TRKORR", TRKORR);
    //     }

    //     oFormData.append("APPDATA", JSON.stringify(oAPP.fn.getSaveData()));

    //     // Ajax 서버 호출
    //     sendAjax(sPath, oFormData, lf_getAppInfo);

    //     // 서버 호출 callback
    //     function lf_getAppInfo(DATA) {

    //         // 푸터 메시지가 있을 경우 닫기
    //         oAPP.common.fnHideFloatingFooterMsg();

    //         // Multi Footer 메시지 영역이 있으면 삭제.
    //         oAPP.events.fnPressMultiFooterMsgCloseBtn();

    //         // 저장후 10번 페이지로 이동이면..
    //         if (ISBACK == 'X') {

    //             oAPP.fn.fnMoveToWs10();

    //             return;
    //         }

    //         // Busy 끄기
    //         parent.setBusy('');

    //         // 오류 일 경우..
    //         if (DATA.RETCD != 'S') {

    //             // 오류 처리..
    //             parent.showMessage(sap, 20, 'E', DATA.RTMSG);
    //             return;
    //         }

    //         // change Flag 초기화
    //         var oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());
    //         oAppInfo.IS_CHAG = '';

    //         var sMsg = "";

    //         // Activate를 누른경우 ISACT 플래그 변경
    //         if (ISACT == 'X') {

    //             oAppInfo.ACTST = 'A';
    //             sMsg = oAPP.common.fnGetMsgClsTxt("031"); // "Activity success"

    //         } else {

    //             sMsg = oAPP.common.fnGetMsgClsTxt("002"); // "Saved success"

    //         }

    //         // WS20 페이지 Lock 풀고 Display Mode로 전환
    //         if (ISDISP == 'X') {

    //             oAPP.fn.fnSetAppDisplayMode();
    //             return;
    //         }

    //         oAPP.common.fnShowFloatingFooterMsg('S', "WS20", sMsg);

    //         /**
    //          * APP 정보 갱신
    //          */
    //         parent.setAppInfo(oAppInfo);

    //         oAppInfo = jQuery.extend(true, {}, parent.getAppInfo());

    //         oAPP.common.fnSetModelProperty("/WS20/APP", oAppInfo);

    //     } // end of lf_getAppInfo

    // }; // end of oAPP.fn.fnSetAppSaveAndActivate

    // /************************************************************************
    //  * 패키지 정보를 확인하여 cts 대상 인지 아닌지 체크한다.
    //  ************************************************************************/
    // oAPP.fn.fnCheckAssignPackageAndCts = function(oEvent) {

    //     return new Promise(function(resolve, reject) {

    //         debugger;

    //         var oEvent = this;

    //         var sPath = parent.getServerPath() + '/chkpackage',
    //             oFormData = new FormData();

    //         var o0010 = oAPP.DATA.APPDATA.S_0010,
    //             sPackg = o0010.PACKG;

    //         oFormData.append("PACKG", sPackg);

    //         // Ajax 서버 호출
    //         sendAjax(sPath, oFormData, function(oResult) {

    //             debugger;

    //             parent.setBusy('X');

    //             // 오류가 존재 한다면..
    //             if (oResult.ERFLG == "X") {

    //                 // 오류 메시지 출력..
    //                 parent.showMessage(sap, 20, "E", oResult.ERMSG);

    //                 // true: next 프로세스 실행, false: 실행 중지
    //                 resolve(false);

    //                 return;

    //             }

    //             // 패키지가 local 패키지 일 경우
    //             if (oResult.ISLOCAL == "X") {

    //                 // true: next 프로세스 실행, false: 실행 중지
    //                 resolve(true);

    //                 return;
    //             }

    // CTS Popup을 Open 한다.
    // oAPP.fn.fnCtsPopupOpener(function(oResult) {

    //     debugger;

    //     var oEvent = this;

    //     oEvent.mParameters.TRKORR = oResult.TRKORR;

    //     // true: next 프로세스 실행, false: 실행 중지
    //     resolve(true);

    // }.bind(oEvent));

    //         });

    //     }.bind(oEvent));

    // }; // end of oAPP.fn.fnCheckAssignPackageAndCts

    // /************************************************************************
    //  * 패키지 확인(local인지 아닌지...)
    //  ************************************************************************/
    // oAPP.fn.fnCheckIsLocalPackage = function (sPackg) {

    //     return new Promise(function (resolve, reject) {

    //         debugger;

    //         var sPath = parent.getServerPath() + '/chkpackage',
    //             oFormData = new FormData();

    //         var o0010 = oAPP.DATA.APPDATA.S_0010,
    //             sPackg = o0010.PACKG;

    //         oFormData.append("PACKG", sPackg);

    //         // Ajax 서버 호출
    //         sendAjax(sPath, oFormData, function (oResult) {

    //             debugger;

    //             parent.setBusy('X');

    //             resolve(oResult);                

    //         });

    //     });

    // }; // end of oAPP.fn.fnCheckIsLocalPackage

    // /************************************************************************
    //  * Application ABAP Syntax Check
    //  ************************************************************************/
    // oAPP.fn.fnCheckAppSyntax = function() {

    //     // syntax 점검 결과 리턴
    //     var lf_result = function(oResult) {

    //         var resolve = this;

    //         if (oResult.RETCD == "S") {

    //             // true: 오류가 존재함, false: 오류 없음
    //             resolve(false);
    //             return;

    //         }

    //         // 푸터에 오류 리스트를 출력한다.
    //         oAPP.fn.fnMultiFooterMsg(oResult.DATA);

    //         // true: 오류가 존재함, false: 오류 없음
    //         resolve(true);

    //     }; // end of lf_result

    //     return new Promise(function(resolve, reject) {

    //         var sPath = parent.getServerPath() + '/chk_ws_syntx',
    //             oFormData = new FormData();

    //         // 저장할 전체 데이터를 가지고 syntax 점검을 한다.
    //         var oAPPDATA = oAPP.fn.getSaveData(),
    //             sAppdataJson = JSON.stringify(oAPPDATA);

    //         oFormData.append("APPDATA", sAppdataJson);

    //         // Ajax 서버 호출
    //         sendAjax(sPath, oFormData, lf_result.bind(resolve));

    //     });

    // }; // end of oAPP.fn.fnCheckAppSyntax

    // /************************************************************************
    //  * 서버에서 eval 처리 하는 CTS Popup Open 공통 펑션
    //  ************************************************************************/
    // oAPP.fn.fnCtsPopup = function (oEvent) {

    //     debugger;

    //     var lo_Event = oEvent;

    //     // CTS Popup을 Open 한다.
    //     oAPP.fn.fnCtsPopupOpener(function (oResult) {

    //         debugger;

    //         var oEvent = this,
    //             IS_ACT = oEvent.getParameter("IS_ACT");

    //         oEvent.mParameters.TRKORR = oResult.TRKORR;

    //         if (IS_ACT == 'X') {
    //             oAPP.events.ev_pressActivateBtn(IS_ACT);
    //             return;
    //         }

    //         oAPP.events.ev_pressSaveBtn(oEvent);

    //     }.bind(lo_Event));

    // }; // end of oAPP.fn.fnCtsPopup

    /************************************************************************
     * WS20의 Change or Display 모드에 따른 UI 보이기 숨기기 bindProperty function
     ************************************************************************/
    oAPP.fn.fnUiVisibleBinding = function (bIsDispMode) {

        if (bIsDispMode == null) {
            return false;
        }

        var bIsDisp = (bIsDispMode == "X" ? true : false);

        return bIsDisp;

    }; // end of oAPP.fn.fnCssLinkAddPopupUiVisibleBinding     

    /************************************************************************
     * BIND 대상 모델 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetBindAttrData = function () {

        return new Promise(function (resolve, reject) {

            var sServerUrl = parent.getServerPath() + '/getBindAttrData',
                oAppInfo = parent.getAppInfo(),
                oFormData = new FormData();

            oFormData.append("CLSNM", oAppInfo.CLSID);

            sendAjax(sServerUrl, oFormData, function (oRes) {

                parent.setBusy('');

                resolve(oRes);

            });

        });

    }; // end of oAPP.fn.fnGetBindAttrData

    /************************************************************************
     * Dom 정보의 변화를 감지
     ************************************************************************/
    oAPP.fn.fnSetMutationObserver = function () {

        // sap-ui-static 영역만 감지한다.
        var oSapUiStatic = document.getElementById("sap-ui-static");
        if (oSapUiStatic == null) {
            return;
        }

        // 감시자 인스턴스 만들기
        var observer = new MutationObserver(function (mutations) {

            // Dialog 가 Open 되면 child window 전체를 숨긴다.
            var $oOpendDialog = $(".sapMDialogOpen");
            if (!$oOpendDialog.length) {
                oAPP.fn.fnChildWindowShow(true);
                return;
            }

            // Open 된 Dialog가 없으면 숨겼던 child window 전체를 보여준다.
            oAPP.fn.fnChildWindowShow(false);

        });

        // 감지할 대상 DOM의 하위가 변화될때 감지하라는 옵션
        var config = {
            childList: true,
        };

        observer.observe(oSapUiStatic, config);

    }; // end of oAPP.fn.fnSetMutationObserver

    /************************************************************************
     * Illustration Pool에 TNT Theme를 등록한다.
     ************************************************************************/
    oAPP.fn.fnRegisterIllustrationPool = () => {

        jQuery.sap.require("sap.m.IllustrationPool");

        let oTntSet = {
            setFamily: "tnt",
            setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
        };

        let oPool = sap.m.IllustrationPool;

        // register tnt illustration set
        oPool.registerIllustrationSet(oTntSet, false);

    }; // end of oAPP.fn.fnRegisterIllustrationPool

    /************************************************************************
     * Illustration Message Dialog
     ************************************************************************
     * @param {String}  sTitle
     * - 메시지 제목
     * 
     * @param {String}   sDesc
     * - 메시지 내용
     * 
     * @param {String}  sIllustType
     * - illustration Type (sapui5 library 참조) 
     * 
     * @param {Function}  fnCallback
     * - 메시지 Dialog에서 확인 버튼 눌렀을때 콜백 펑션
     ************************************************************************/
    oAPP.fn.fnShowIllustMsgDialog = (sTitle, sDesc, sIllustType, sIllustSize, fnCallback) => {

        var oDialog = sap.ui.getCore().byId("illustMsg");
        if (oDialog) {

            if (!oDialog.isOpen()) {
                oDialog.open();
            }

            return;
        }

        let oMsg = new sap.m.IllustratedMessage({
            title: sTitle,
            description: sDesc,
            illustrationSize: sIllustSize,
            illustrationType: sIllustType,
            additionalContent: new sap.m.Button({
                text: "OK",
                press: function () {

                    let oIllustMsg = sap.ui.getCore().byId("illustMsg");
                    if (oIllustMsg) {
                        oIllustMsg.close();
                    }

                    if (typeof fnCallback == "function") {
                        fnCallback();
                    }

                }
            })
        });

        new sap.m.Dialog("illustMsg", {
            title: sTitle,
            state: sap.ui.core.ValueState.Error,
            content: [
                oMsg
            ],
            escapeHandler: () => {}, // esc 키 방지
            afterClose: function () {

                let oIllustMsg = sap.ui.getCore().byId("illustMsg");
                if (oIllustMsg) {
                    oIllustMsg.destroy();
                }

            }
        }).open();

    }; // end of oAPP.fn.fnShowIllustMsgDialog

    /****************************************************************************
     * Trial Version을 체크 하여 맞으면 메시지를 출력 후 기능 동작을 못하게 한다.
     ****************************************************************************
     * @return {Boolean}  bIsTrial
     * - Trial Version 여부 Flag
     ****************************************************************************/
    oAPP.fn.fnOnCheckIsTrial = () => {

        var bIsTrial = parent.getIsTrial();

        if (!bIsTrial) {
            return bIsTrial;
        }

        var sTitle = "Trial Version",
            sDesc = "Does not Support in this Trial Version.",
            sIllustType = "tnt-Lock",
            sIllustSize = sap.m.IllustratedMessageSize.Spot;

        oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize);

        return bIsTrial;

    }; // end of oAPP.fn.fnOnCheckIsTrial

    // oAPP.fn.fnMovePageWs20(sAppID, "D", true);

    /************************************************************************
     * Example용 WS20 페이지로 이동
     ************************************************************************
     * @param {String} sAppID
     * - WS20 페이지로 이동할 어플리케이션 ID
     *          
     ************************************************************************/
    oAPP.fn.fnExamMoveToPageWs20 = (sAppID) => {

        var oAppInput = sap.ui.getCore().byId("AppNmInput"),
            oDispModeBtn = sap.ui.getCore().byId("displayBtn");

        if (!oAppInput && !oDispModeBtn) {
            return;
        }

        var sAppID = sAppID.toUpperCase();

        oAppInput.setValue(sAppID);

        oDispModeBtn.firePress();

    }; // end of oAPP.fn.fnExamMoveToPageWs20

    /************************************************************************
     * [WS20 SIDEMENU] Split Position Change
     ************************************************************************/
    oAPP.fn.fnWs20SideMENUITEM_10 = (oEvent) => {

        oAPP.fn.callDesignLayoutChangePopupOpener();

    }; // end of oAPP.fn.fnWs20SideMENUITEM_10

    /************************************************************************
     * [WS20 SIDEMENU] 접속 서버 정보 Popover
     ************************************************************************/
    oAPP.fn.fnWs20SideFIXITM_10 = (oEvent) => {

        var oSelectedItem = oEvent.getParameter("item");

        var oServerInfoPopup = sap.ui.getCore().byId("serverInfoPopover");
        if (oServerInfoPopup) {
            oServerInfoPopup.openBy(oSelectedItem);
            return;
        }

        var oServerInfoPopup = new sap.m.ResponsivePopover("serverInfoPopover", {

            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://it-system",

                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.Title({
                        text: "Server Information"
                    })
                ]
            }),

            content: [

                new sap.ui.layout.form.Form({
                    width: "300px",
                    editable: true,

                    layout: new sap.ui.layout.form.ResponsiveGridLayout({
                        labelSpanS: 4,
                        labelSpanM: 4,
                        labelSpanL: 4,
                        columnsM: 1,
                        columnsL: 2
                    }), // end of layout

                    formContainers: [

                        new sap.ui.layout.form.FormContainer({
                            formElements: [

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: "Bold",
                                        text: "Client"
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{CLIENT}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: "Bold",
                                        text: "System ID"
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{SYSID}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: "Bold",
                                        text: "USER"
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            // text: "{ID}"
                                        }).bindProperty("text", "ID", function(sId){

                                            if(typeof sId !== "string"){
                                                return "";
                                            }

                                            return sId.toUpperCase();

                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: "Bold",
                                        text: "Language"
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{LANGU}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                            ]

                        })

                    ] // end of formContainers

                }) // end of sap.ui.layout.form.Form

            ]

        }); // end of popover

        oServerInfoPopup.bindElement("/USERINFO");

        oServerInfoPopup.openBy(oSelectedItem);

    }; // end of oAPP.fn.fnWs20SideFIXITM_10

    /************************************************************************
     * 서버 호스트 등록 여부 체크
     ************************************************************************/
    oAPP.fn.fnCheckServerHost = () => {

        parent.setBusy("X");
        
        var oMetadata = parent.getMetadata(),
            sServerHost = oMetadata.HOST,
            oUserInfo = parent.getUserInfo(),
            sUrl = `${sServerHost}/zu4a_wbc/ping_check?sap-user=${oUserInfo.ID}&sap-password=${oUserInfo.PW}&sap-client=${oUserInfo.MANDT}&sap-language=${oUserInfo.LANGU}`;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        // ajax call 실패 할 경우
        xhr.onerror = function () {

            var oServerInfo = parent.getServerInfo();
            var sTitle = "Host File Check",
                sIllustType = "sapIllus-SimpleReload",
                sIllustSize = "Dialog",
                sDesc = "호스트를 등록하세요!!\n\n";

            sDesc += "Server IP : " + oServerInfo.SERVERIP + "\n";
            sDesc += "Server Host : " + sServerHost;

            oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, () => {

                fn_logoff_success();

            });

            parent.setBusy("");

        };

        xhr.onreadystatechange = function (a, b, c, d, e) { // 요청에 대한 콜백         

            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    parent.setBusy("");

                }
            }

        };

        try {

            xhr.open('GET', sUrl, true);

        } catch (e) {

            parent.showMessage(null, 99, "E", e.message);

            parent.setBusy("");

            return;
        }

        xhr.send();

    }; // end of oAPP.fn.fnCheckServerHost

})(window, $, oAPP);