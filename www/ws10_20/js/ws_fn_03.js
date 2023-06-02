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
        PATHINFO = parent.PATHINFO,
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

        zconsole.log("세션종료!! -> " + Math.floor(+new Date() / 1000));

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

        // IPC MAIN 이벤트의 세션 타임 관련 이벤트 해제        
        parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

        // Logout 버튼으로 Logout을 시도 했다는 Flag      
        oAPP.attr.isBrowserCloseLogoutMsgOpen = "X";

        // 세션 타임 아웃 팝업을 띄운다.
        let sTitle = "Session Timeout",
            sDesc = "Please Try Login Again!",
            sIllustType = "tnt-SessionExpired",
            sIllustSize = sap.m.IllustratedMessageSize.Dialog;

        oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, lfSessionTimeOutDialogOk);

        function lfSessionTimeOutDialogOk() {

            parent.IPCRENDERER.send('if-browser-close', {
                ACTCD: "A", // 나를 제외한 나머지는 다 죽인다.
                SESSKEY: parent.getSessionKey(),
                BROWSKEY: parent.getBrowserKey()
            });

            var sUrl = parent.getServerPath() + "/logoff";

            var option = {
                URL: sUrl
            };

            sendServerExit(option, () => {

                window.onbeforeunload = null;

                top.window.close();

            });

        }

        // //세션타임아웃 후 전체 로그아웃 및 같은 세션 창 전체 닫기
        // APPCOMMON.setSessionTimeout();

    }; // end of oAPP.fn.fnSessionTimeWorkerOnMessage

    /************************************************************************
     * 클릭 & 키보드 이벤트 발생 시 세션 타임 초기화 시킨다.
     * **********************************************************************/
    oAPP.fn.fnWindowClickEventListener = function () {

        zconsole.log("윈도우 클릭했다!!");

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

        // Clipboard Copy Success!
        var sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "303");

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
            if (Array.isArray(aTargetData) == false) {
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
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = parent.require(sSettingsJsonPath);
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

            // Open 된 Dialog가 없으면 숨겼던 child window 전체를 보여준다.
            var $oOpendDialog = $(".sapMDialogOpen");
            if (!$oOpendDialog.length) {
                oAPP.fn.fnChildWindowShow(true); // [ws_fn_02.js]
                return;
            }

            // Dialog 가 Open 되면 child window 전체를 숨긴다.
            oAPP.fn.fnChildWindowShow(false); // [ws_fn_02.js]

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
     * U4A icon 등록
     ************************************************************************/
    oAPP.fn.fnRegisterU4AIcons = () => {

        parent.WSUTIL.getWsRegisterU4AIcons(sap);

    }; // end of oAPP.fn.fnRegisterU4AIcons

    oAPP.fn.fnRegisterSAPIcons = () => {

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

    };

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

        let oIllustMsg = sap.ui.getCore().byId("u4aWsIllustMsg"),
            oDialog = sap.ui.getCore().byId("illustMsg");

        if (oDialog) {

            if (!oDialog.isOpen()) {
                oDialog.open();

                let oIllustMeta = oIllustMsg.getMetadata(),
                    oIllustProperties = oIllustMeta.getProperties();

                oIllustMsg.setTitle(sTitle || (oIllustProperties.title && oIllustProperties.title.defaultValue));
                oIllustMsg.setDescription(sDesc || (oIllustProperties.description && oIllustProperties.description.defaultValue));
                oIllustMsg.setIllustrationType(sIllustType || (oIllustProperties.illustrationType && oIllustProperties.illustrationType.defaultValue));
                oIllustMsg.setIllustrationSize(sIllustSize || (oIllustProperties.illustrationSize && oIllustProperties.illustrationSize.defaultValue));

            }

            return;
        }

        let oMsg = new sap.m.IllustratedMessage("u4aWsIllustMsg", {
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
            escapeHandler: () => { }, // esc 키 방지
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

        var sTitle = APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C85"), // Trial Version
            sDesc = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "311"), // Does not Support in this Trial Version.
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

        // Example로 실행 했다는 플래그
        oAPP.attr.isExam = "X";

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
            resizable: true,
            contentWidth: "350px",
            placement: sap.m.PlacementType.Auto,

            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://it-system",

                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C42") // Server Information
                    })
                ]
            }),

            content: [

                new sap.ui.layout.form.Form({
                    // width: "300px",
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
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C43") // WS Version
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{/USERINFO/WSVER}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E26") // Patch Level                                        
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{/USERINFO/WSPATCH_LEVEL}"
                                        })
                                    ] // end of fields

                                }).bindProperty("visible", {
                                    parts: [
                                        "/USERINFO/WSPATCH_LEVEL"
                                    ],
                                    formatter: function () {

                                        return true;
                                        // return APP.isPackaged;

                                    }
                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C44") // Client
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{/USERINFO/CLIENT}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C45") // System ID
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{/USERINFO/SYSID}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C46"), // USER
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text().bindProperty("text", "/USERINFO/ID", function (sId) {

                                            if (typeof sId !== "string") {
                                                return "";
                                            }

                                            return sId.toUpperCase();

                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C47") // Language
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text({
                                            text: "{/USERINFO/LANGU}"
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C48") // Host
                                    }), // end of label

                                    fields: [
                                        new sap.m.Text().bindProperty("text", {
                                            parts: [
                                                "/SERVERINFO/SERVER_INFO"
                                            ],
                                            formatter: (SERVERINFO) => {

                                                if (!SERVERINFO) {
                                                    return;
                                                }

                                                return SERVERINFO.host;

                                            }
                                        })
                                    ] // end of fields

                                }), // end of sap.ui.layout.form.FormElement

                            ]

                        })

                    ] // end of formContainers

                }) // end of sap.ui.layout.form.Form

            ]

        }); // end of popover

        // oServerInfoPopup.bindElement("/USERINFO");

        oServerInfoPopup.openBy(oSelectedItem);

    }; // end of oAPP.fn.fnWs20SideFIXITM_10

})(window, $, oAPP);