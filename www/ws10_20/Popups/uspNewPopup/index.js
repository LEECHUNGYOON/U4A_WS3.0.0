/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : findPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/
let zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    oAPP.settings = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        require = parent.require;

    const
        APPCOMMON = oAPP.common;

    oAPP.setBusy = (bIsBusy) => {

        sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            sap.ui.core.BusyIndicator.show(0);

            return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        sap.ui.core.BusyIndicator.hide();

    }; // end of oAPP.fn.setBusy

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

    }; // end of APPCOMMON.fnSetModelProperty

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

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            oThemeInfo = oAPP.attr.oThemeInfo,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        // 로그인 Language 적용
        oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
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

        var oModelData = {
            APPINFO: oAPP.attr.APPINFO,
            TREEDATA: oAPP.attr.TREEDATA
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oModelData);

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        let oApp = new sap.m.App(),
            oPageContent = fnGetPageContents(),
            oPage = new sap.m.Page({
                
                customHeader: new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Title({
                            text: "{/APPINFO/SPATH}",
                        }),
                        new sap.m.Title().bindProperty("text", "/APPINFO/ACTST", function (ACTST) {

                            if (ACTST == "A") {
                                return APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B66"); // Active
                            }

                            return APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B67"); // Inactive

                        }).addStyleClass("sapUiSmallMarginEnd"),
                        new sap.m.Title().bindProperty("text", "/APPINFO/IS_EDIT", function (IS_EDIT) {

                            if (IS_EDIT == "X") {
                                return APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02"); // Change
                            }

                            return APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05"); // Display

                        }).addStyleClass("sapUiSmallMarginEnd"),
                    ],
                    contentRight: [
                        new sap.m.Button({
                            icon: "sap-icon://save",
                            press: () => {
                                fnSetUspSave();
                            }
                        }).bindProperty("enabled", "/APPINFO/IS_EDIT", function (IS_EDIT) {

                            let bIsEdit = (IS_EDIT == "X" ? true : false);

                            return bIsEdit;

                        })
                    ]
                }),
                content: [
                    oPageContent
                ]
            });

        oApp.addEventDelegate({
            onAfterRendering: () => {
                oAPP.setBusy(false);
            }
        });

        oApp.addPage(oPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnInitRendering     

    function fnSetUspSave() {

        debugger;




    }

    function fnGetPageContents() {

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor("new_codeeditor", {
                height: "100%",
                width: "100%",
                syntaxHints: true,
                // type: "{/TREEDATA/USPDATA/EXTEN}",
                value: "{/TREEDATA/CONTENT}",
            })
            .bindProperty("type", "/TREEDATA/MIME", _fnCodeEditorBindPropertyType)
            .addEventDelegate({
                onAfterRendering: function (oControl) {

                    var oEditor = oControl.srcControl,
                        _oAceEditor = oEditor._oEditor;

                    if (!_oAceEditor) {
                        return;
                    }

                    _oAceEditor.setFontSize(20);

                }
            });

        return [

            oCodeEditor

        ];

    } // end of fnGetPageContents

    /************************************************************************
     *데이터 유형에 따른  Code Editor 타입 설정
     ************************************************************************/
    function _fnCodeEditorBindPropertyType(EXTEN) {

        this.setSyntaxHints(true);

        switch (EXTEN) {

            case "js":
                return "javascript";

            case "ts":
                return "typescript";

            case "css":
                return "css";

            case "htm":
            case "html":
                return "html";

            case "vbs":
                return "vbscript";

            case "xml":
                return "xml";

            case "svg":
                return "svg";

            case "txt":
                return "text";

            default:

                this.setSyntaxHints(false);

                return;

        }

    } // end of _fnCodeEditorBindPropertyType

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            oAPP.setBusy(true);

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            setTimeout(() => {
                $('#content').fadeIn(300, 'linear');
            }, 100);

        });

    };

    window.onbeforeunload = function () {

    };

})(window, oAPP);