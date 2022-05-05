/**************************************************************************
 * editorPageEditor.js
 **************************************************************************/

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    oAPP.settings = {};

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
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

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
            sVersion = oSetting_UI5.version,
            oBootStrap = oSetting_UI5.bootstrap,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oEditorInfo = oAPP.fn.fnGetEditorInfo(),
            oUserInfo = oEditorInfo.USERINFO,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }
        
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.codeeditor");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

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

        var oSplitApp = new sap.m.SplitApp({
            mode: sap.m.SplitAppMode.HideMode,
            masterPages: [
                oMasterPage
            ],
            detailPages: [
                oDetailPage
            ]

        }).addStyleClass("sapUiSizeCompact");

        oSplitApp.placeAt("content");

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
                        text: "Preview",
                        titleStyle: sap.ui.core.TitleLevel.H2,
                    }).addStyleClass("sapUiTinyMarginBegin")
                ]
            }),
            oPanel = new sap.m.Panel({
                backgroundDesign: sap.m.BackgroundDesign.Transparent,
                headerText: "[ How to Use ]",
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
                    text: "Read me"
                }),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    text: "Pretty Print",

                    press: function () {

                        var oCodeEditor = sap.ui.getCore().byId("ErrorPageEditor");
                        if (!oCodeEditor) {
                            return;
                        }

                        oCodeEditor.prettyPrint();

                    }
                }).bindProperty("enabled", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.CheckBox({
                    text: "Enable Error Page",
                    select: oAPP.events.ev_errorPageEditorEnableCheckBoxSelect
                })
                .bindProperty("selected", "/EDITDATA/IS_USE", oAPP.fn.fnUiVisibleBinding)
                .bindProperty("enabled", "/APPINFO/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    text: "Save",
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

        var BROWSKEY = oAPP.fn.fnGetBrowserKey(),
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

        var BROWSKEY = oAPP.fn.fnGetBrowserKey(),
            oSaveData = oAPP.fn.fnGetModelProperty("/EDITDATA");

        oAPP.IPCRENDERER.send("if-ErrorPageEditor-Save", {
            BROWSKEY: BROWSKEY,
            SAVEDATA: oSaveData
        });

        oAPP.fn.fnMsgPopup("Save Success");

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

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    // 클라이언트 세션 유지를 위한 function
    oAPP.fn.fnKeepClientSession();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            oAPP.setBusy('');

        });

    };

})(window, oAPP);