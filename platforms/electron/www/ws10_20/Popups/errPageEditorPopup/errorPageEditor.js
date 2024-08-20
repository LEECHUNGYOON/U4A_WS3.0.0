/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : editorPageEditor.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/
let zconsole = parent.WSERR(window, document, console);

var oAPP = parent.oAPP,
    PATHINFO = parent.PATHINFO;

(function (window, oAPP) {
    "use strict";

    oAPP.settings = {};
    oAPP.ui = {};

    const APPCOMMON = oAPP.common;

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        require = parent.require,
        oTimer = "";

    // *-메시지 팝업
    oAPP.fn.fnMsgPopup = function (txt) {

        var x = document.getElementById("snackbar");
        if (!x) {
            return;
        }

        x.innerHTML = txt;
        x.className = "show";

        oTimer = setTimeout(function () {
            clearTimeout(oTimer);
            oTimer = null;

            x.className = x.className.replace("show", "");
        }, 3000);

    };

    /***********************************************************
     * Busy 켜기 끄기
     ***********************************************************/
    oAPP.fn.setBusyIndicator = function(IsBusy, sOption){

        oAPP.attr.isBusy = IsBusy;

        var _ISBROAD = sOption?.ISBROAD || undefined;

        if(IsBusy === "X"){

            sap.ui.getCore().lock();

            oAPP.ui.MAIN_APP.setBusy(true);

            // 브라우저 창 닫기 버튼 비활성
            oAPP.CURRWIN.closable = false;

            //다른 팝업의 BUSY ON 요청 처리.
            //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});
            }
            
            return;
        }

        // 브라우저 창 닫기 버튼 활성
        oAPP.CURRWIN.closable = true;

        //다른 팝업의 BUSY OFF 요청 처리.
        //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
        if(typeof _ISBROAD === "undefined"){
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});
        }

        oAPP.ui.MAIN_APP.setBusy(false);       

        sap.ui.getCore().unlock();

        
    };

    /************************************************************************
     * 모델 데이터 set
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     * @param {Object} oModelData
     * 
     * @param {Boolean} bIsRefresh 
     * model Refresh 유무
     ************************************************************************/
    oAPP.fn.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of oAPP.common.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.fn.fnGetModelProperty = function (sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function () {

        // Browser Window option
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    /************************************************************************
     * UI5 BootStrap 
     ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,            
            oBootStrap = oSetting_UI5.bootstrap,
            oEditorInfo = oAPP.fn.fnGetEditorInfo(),
            oThemeInfo = parent.oAPP.attr.oThemeInfo,
            oUserInfo = oEditorInfo.USERINFO,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.codeeditor");
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);
        
        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function () {

        var oModelData = oAPP.fn.fnGetEditorInfo(),

            oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData(oModelData);

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oMasterPage = oAPP.fn.fnGetErrorPageEditorMasterPage(),
            oDetailPage = oAPP.fn.fnGetErrorPageEditorDetailPage();

        var oSplitApp = new sap.m.SplitApp("MAIN_APP", {
            busyIndicatorDelay: 0,            
            mode: sap.m.SplitAppMode.HideMode,
            masterPages: [
                oMasterPage
            ],
            detailPages: [
                oDetailPage
            ]

        }).addStyleClass("sapUiSizeCompact");

        oAPP.ui.MAIN_APP = oSplitApp;

        oSplitApp.placeAt("content");

        let oDelegate = {
            onAfterRendering : function(){
        
                oSplitApp.removeEventDelegate(oDelegate);

                oAPP.CURRWIN.show();

                oAPP.WSUTIL.setBrowserOpacity(oAPP.CURRWIN); 

                oAPP.fn.setBusyIndicator("");
        
                // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                parent.oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 
        
            }
        };
        
        oSplitApp.addEventDelegate(oDelegate);

    }; // end of oAPP.fn.fnInitRendering 

    /************************************************************************
     * Error Page Editor의 SplitApp에서 MasterPage
     ************************************************************************/
    oAPP.fn.fnGetErrorPageEditorMasterPage = function () {

        var aMasterPageContents = oAPP.fn.fnGetErrorPageEditorMasterPageContents();

        var oMasterPage = new sap.m.Page({
            showHeader: false,
            content: aMasterPageContents

        }).addStyleClass("sapUiContentPadding");

        return oMasterPage;

    }; // end of oAPP.fn.fnGetErrorPageEditorMasterPage

    /************************************************************************
     * Error Page Editor의 SplitApp에서 MasterPage의 Contents
     ************************************************************************/
    oAPP.fn.fnGetErrorPageEditorMasterPageContents = function () {

        var oHBox = new sap.m.HBox({
            alignItems: sap.m.FlexAlignItems.Center,
            items: [
                new sap.m.Avatar({
                    fallbackIcon: "sap-icon://media-play",
                    press: oAPP.events.ev_errorPageEditorMasterAvatarPress
                }),
                new sap.m.Title({
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67", "", "", "", ""), // Preview
                    titleStyle: sap.ui.core.TitleLevel.H2,
                }).addStyleClass("sapUiTinyMarginBegin")
            ]
        }),

            sHeaderTxt = "[ " + APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D33") + " ] ", // How to Use

            oPanel = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerText: sHeaderTxt,
                content: [
                    new sap.m.VBox({
                        wrap: sap.m.FlexWrap.Wrap,
                        items: [
                            new sap.m.Text({
                                text: "1. APP 실행 중 발생되는 오류(시스템 오류 포함)페이지 재구성 필요시 우측 HTML 에디터를 사용한다."
                            }).addStyleClass("sapUiTinyMarginTop"),
                            new sap.m.Text({
                                text: "2. 만약 오류 본문 내 시스템 메시지를 출력 필요시 해당 위치에 매개변수 \"<%=MSG=%>\"를 입력한다."
                            }).addStyleClass("sapUiTinyMarginTop"),
                            new sap.m.Text({
                                text: "3. 만약 에디터 HTML 코딩에 대한 미리보기를 원할 시 \"Preview\" 아이콘을 클릭한다."
                            }).addStyleClass("sapUiTinyMarginTop"),
                            new sap.m.Text({
                                text: "4. 완성된 HTML 코딩을 시스템에 적용 시 \"Enable Error Page\" 체크박스 체크 후 \"SAVE\" 버튼을 클릭한다."
                            }).addStyleClass("sapUiTinyMarginTop"),

                            new sap.m.Text({
                                text: "1. If you need to reorganize the page errors (including system errors) that occur while running the APP, use the HTML editor on the right."
                            }).addStyleClass("sapUiSmallMarginTop"),
                            new sap.m.Text({
                                text: "2. If you need to output the system message in the error body, enter the parameter \"<%=MSG=%>\" in the corresponding location"
                            }).addStyleClass("sapUiTinyMarginTop"),
                            new sap.m.Text({
                                text: "3. If you want to preview the HTML coding, click the \"Preview\" icon."
                            }).addStyleClass("sapUiTinyMarginTop"),
                            new sap.m.Text({
                                text: "4. When applying the completed HTML coding to the system, check the \"Enable Error Page\" checkbox and click the \"SAVE\" button."
                            }).addStyleClass("sapUiTinyMarginTop"),
                        ]
                    })
                ]
            }).addStyleClass("sapUiSmallMarginTop");

        return [
            oHBox,
            oPanel
        ];

    }; // end of oAPP.fn.fnGetErrorPageEditorMasterPageContents

    /************************************************************************
     * Error Page Editor의 SplitApp에서 DetailPage 
     ************************************************************************/
    oAPP.fn.fnGetErrorPageEditorDetailPage = function () {

        var oCustomHeader = new sap.m.Toolbar({
            content: [
                new sap.ui.core.Icon({
                    src: "sap-icon://arrow-left"
                }),
                new sap.m.Title({
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D34", "", "", "", ""), // Read me
                }),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C25", "", "", "", ""), // Pretty Print

                    press: function () {

                        var oCodeEditor = sap.ui.getCore().byId("ErrorPageEditor");
                        if (!oCodeEditor) {
                            return;
                        }

                        oCodeEditor.prettyPrint();

                    }
                }).bindProperty("enabled", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.CheckBox({
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D35", "", "", "", ""), // Enable Error Page
                    select: oAPP.events.ev_errorPageEditorEnableCheckBoxSelect
                })
                    .bindProperty("selected", "/EDITDATA/IS_USE", oAPP.fn.fnUiVisibleBinding)
                    .bindProperty("enabled", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", ""), // Save
                    type: sap.m.ButtonType.Emphasized,
                    press: oAPP.events.ev_setErrorPageSave
                }).bindProperty("enabled", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

            ]
        });

        var oDetailContents = oAPP.fn.fnGetErrorPageEditorDetailPageContents();

        var oDetailPage = new sap.m.Page({
            customHeader: oCustomHeader,
            content: [
                oDetailContents
            ]
        });

        return oDetailPage;

    };

    /************************************************************************
     * Error Page Editor의 SplitApp에서 DetailPage의 Contents
     ************************************************************************/
    oAPP.fn.fnGetErrorPageEditorDetailPageContents = function () {

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor("ErrorPageEditor", {
            type: "html",
            value: "{/EDITDATA/HTML}"
        }).bindProperty("editable", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding);

        oCodeEditor.addDelegate({
            onAfterRendering: function (oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            }
        });

        return oCodeEditor;

    }; // end of oAPP.fn.fnGetErrorPageEditorDetailPageContents

    /************************************************************************
     * Change or Display 모드에 따른 UI 보이기 숨기기 bindProperty function
     ************************************************************************/
    oAPP.fn.fnUiVisibleBinding = function (bIsDispMode) {

        if (bIsDispMode == null) {
            return false;
        }

        var bIsDisp = (bIsDispMode == "X" ? true : false);

        return bIsDisp;

    }; // end of oAPP.fn.fnCssLinkAddPopupUiVisibleBinding

    /************************************************************************
     * 클라이언트 세션 유지를 위한 function
     * **********************************************************************/
    oAPP.fn.fnKeepClientSession = function () {

        // 브라우저의 세션 키
        var sSessionKey = oAPP.fn.getSessionKey();

        // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
        oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

        // 윈도우 클릭 이벤트 해제
        window.removeEventListener("click", oAPP.fn.fnWindowClickEventListener);
        window.removeEventListener("keyup", oAPP.fn.fnWindowClickEventListener);

        // 윈도우 클릭 이벤트 걸기
        window.addEventListener("click", oAPP.fn.fnWindowClickEventListener);
        window.addEventListener("keyup", oAPP.fn.fnWindowClickEventListener);

    }; // end of oAPP.fn.fnKeepClientSession

    /************************************************************************
     * 브라우저에서 키보드, 마우스 클릭 이벤트를 감지하여 클라이언트 세션을 유지한다.
     * **********************************************************************/
    oAPP.fn.fnWindowClickEventListener = function () {

        // 브라우저의 세션 키
        var sSessionKey = oAPP.fn.getSessionKey();

        // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
        oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

    }; // end of oAPP.fn.fnWindowClickEventListener

    /************************************************************************
     * Error Page Editor의 SplitApp에서 MasterPage의 Avatar 클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_errorPageEditorMasterAvatarPress = function () {

        // 오류 페이지 미리보기 팝업을 띄우는 동안 재 실행을 방지하기 위해
        // busy를 킨 후 미리 보기 팝업을 오픈 하라고 신호를 보낸다.
        // busy를 끄는 시점은 미리보기 팝업이 로드가 된 후에 IPC로 끈다.
        oAPP.fn.setBusyIndicator("X");

        var BROWSKEY = oAPP.BROWSKEY,
            oSaveData = oAPP.fn.fnGetModelProperty("/EDITDATA");
            
        oAPP.IPCRENDERER.send("if-ErrorPage-Preview", {
            BROWSKEY: BROWSKEY,
            SAVEDATA: oSaveData
        });

    }; // end of oAPP.events.ev_ErrorPageEditorMasterAvatarPress

    /************************************************************************
     * Error Page Editor의 저장 버튼 이벤트
     ************************************************************************/
    oAPP.events.ev_setErrorPageSave = function () {

        var oCodeEditor = sap.ui.getCore().byId("ErrorPageEditor");
        if (!oCodeEditor) {
            return;
        }

        var BROWSKEY = oAPP.BROWSKEY,
            oSaveData = oAPP.fn.fnGetModelProperty("/EDITDATA");
            // CURRWIN = parent.REMOTE.getCurrentWindow();

        oAPP.IPCRENDERER.send("if-ErrorPageEditor-Save", {
            BROWSKEY: BROWSKEY,
            SAVEDATA: oSaveData            
        });

        let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", "", ""); // Saved success

        oAPP.fn.fnMsgPopup(sMsg);

    }; // end of oAPP.events.ev_setErrorPageSave

    /************************************************************************
     * Error Page Editor의 Enable Error Page CheckBox Select 이벤트
     ************************************************************************/
    oAPP.events.ev_errorPageEditorEnableCheckBoxSelect = function (oEvent) {

        var bIsSelect = oEvent.getParameter("selected"),
            oCheckBox = oEvent.getSource(),
            oBindInfo = oCheckBox.getBindingInfo("selected");

        if (!oBindInfo || !oBindInfo.binding) {
            return;
        }

        var sBindPath = oBindInfo.binding.sPath,
            sIsSelect = "";

        if (bIsSelect == true) {
            sIsSelect = "X";
        }

        oAPP.fn.fnSetModelProperty(sBindPath, sIsSelect);

    }; // end of oAPP.events.ev_errorPageEditorEnableCheckBoxSelect

    
    oAPP.events.fnIpc_errorPageEditor_setBusy = function(event, res){

        if(res === "X"){
            oAPP.fn.setBusyIndicator("X");
            return;
        }

        oAPP.fn.setBusyIndicator("");

    };

    /**************************************************
     * BroadCast Event 걸기
     ***************************************************/
    function _attachBroadCastEvent(){

        oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oAPP.BROWSKEY}`);        

        oAPP.broadToChild.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;

            if(typeof _PRCCD === "undefined"){
                return;
            }

            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":

                    //BUSY ON을 요청받은경우.
                    oAPP.fn.setBusyIndicator("X", {ISBROAD:true});
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    oAPP.fn.setBusyIndicator("",  {ISBROAD:true});
                    break;

                default:
                    break;
            }

        };

    } // end of _attachBroadCastEvent

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    // 클라이언트 세션 유지를 위한 function
    oAPP.fn.fnKeepClientSession();

    window.onload = function () {        

        // BroadCast Event 걸기
        _attachBroadCastEvent();

        sap.ui.getCore().attachInit(function () {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();            

            // busy를 UI Busy를 사용하기 때문에 Rendering 펑션 호출 후에 Busy를 킴
            oAPP.fn.setBusyIndicator("X");

            // 화면 초기 실행 시 한번만 수행 되는 메인 Busy를 끈다.
            oAPP.setBusyLoading('');

            setTimeout(() => {
                $('#content').fadeIn(1000, 'linear');
            }, 100);

        });

    };

    // 오류페이지 미리보기에서 현재 에디터로 busy를 끄기 위한 IPC 이벤트
    // 미리보기 띄우는 이벤트에서 Busy를 먼저 걸고 미리보기 팝업 실행이 완료 될때 
    // 에디터 쪽으로 busy를 끄라고 신호를 받기 위한 이벤트
    oAPP.IPCMAIN.on(`if-errorPageEditor-setBusy-${oAPP.BROWSKEY}`, oAPP.events.fnIpc_errorPageEditor_setBusy);

    window.onbeforeunload = function(){

        // Busy가 실행 중이면 창을 닫지 않는다.
        if(oAPP.fn.getBusy() === "X"){
            return false;
        }

        oAPP.IPCMAIN.off(`if-errorPageEditor-setBusy-${oAPP.BROWSKEY}`, oAPP.events.fnIpc_errorPageEditor_setBusy);

    };

})(window, oAPP);