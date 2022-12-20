/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : u4aDocPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/

var zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    oAPP.settings = {};

    let PATH = oAPP.PATH,
        APPPATH = oAPP.APPPATH,
        USERDATA = oAPP.USERDATA,
        APP = oAPP.APP,
        FS = oAPP.FS,
        SHELL = oAPP.SHELL,
        require = parent.require;

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
        oScript.setAttribute("data-sap-ui-theme", oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m");

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
    oAPP.fn.fnInitModelBinding = (aFileList) => {

        let oModelData = {
            aFileList: aFileList
        };

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oModelData);

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = () => {

        let oTable = oAPP.fn.fnGetTable();

        let oApp = new sap.m.App(),
            oPage = new sap.m.Page({
                showHeader: false,
                content: [
                    oTable
                ]
            });

        oApp.addPage(oPage);

        oApp.placeAt("content");

        oAPP.setBusy('');

        setTimeout(() => {

            $('#content').fadeIn(1000, 'linear');

        }, 100);

    }; // end of oAPP.fn.fnInitRendering

    /************************************************************************
     * 출력 리스트 테이블
     ************************************************************************/
    oAPP.fn.fnGetTable = () => {

        var StickyEnum = sap.m.Sticky;

        return new sap.m.Table({

            // properties
            // mode: sap.m.ListMode.SingleSelectMaster,
            alternateRowColors: true,
            autoPopinMode: true,
            growing: true,
            growingScrollToLoad: true,
            sticky: [
                StickyEnum.ColumnHeaders,
                // StickyEnum.HeaderToolbar,
                // StickyEnum.InfoToolbar
            ],
            backgroundDesign: sap.m.BackgroundDesign.Transparent,
            columns: [
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B65"), // Document
                        design: sap.m.LabelDesign.Bold
                    })
                })
            ],
            items: {
                path: '/aFileList',
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Link({
                            emphasized: true,
                            text: "{FNAME}",
                            press: oAPP.events.ev_pressDocuList
                        })
                    ]
                })
            }
        });

    }; // end of oAPP.fn.fnGetTable

    /************************************************************************
     * Help Document 파일을 읽는다
     ************************************************************************/
    oAPP.fn.fnGetFileList = () => {

        return new Promise((resolve, reject) => {
           
            let oSettingsPath = PATH.join(APPPATH, "settings", "ws_settings.json"),
                oSettings = require(oSettingsPath),
                sHelpDocFolderPath = PATH.join(USERDATA, oSettings.path.u4aHelpDocFolderPath);

            FS.readdir(sHelpDocFolderPath, {
                withFileTypes: true

            }, (err, aFiles) => {

                if (err) {
                    reject(err.toString());
                    return;
                }

                let iFileLength = aFiles.length;
                if (iFileLength == 0) {

                    let sMsg = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D18"); // Document File
                    oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "073", sMsg); // &1 does not exist.

                    reject(sMsg);

                    return;
                }

                let aFileList = [];
                for (var i = 0; i < iFileLength; i++) {

                    let sFile = aFiles[i].name;
                    if (!sFile.endsWith(".chm")) {
                        continue;
                    }

                    let sFilePath = PATH.join(sHelpDocFolderPath, sFile),
                        sFileName = sFile.split(".")[0];

                    aFileList.push({
                        FNAME: sFileName,
                        FPATH: sFilePath
                    });
                }

                resolve(aFileList);

            }); // end of FS.readdir

        }); // end of promise

    }; // end of oAPP.fn.fnGetFileList

    /************************************************************************
     * Document List Click Event
     ************************************************************************/
    oAPP.events.ev_pressDocuList = (oEvent) => {

        let oCtx = oEvent.getSource().getBindingContext();
        if (oCtx == null) {
            return;
        }

        let oBindData = oAPP.fn.fnGetModelProperty(oCtx.sPath),
            sFilePath = oBindData.FPATH;

        SHELL.openPath(sFilePath);

    }; // end of oAPP.events.ev_pressDocuList

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            // u4a help document의 파일 리스트를 구한다.
            oAPP.fn.fnGetFileList().then((aFileList) => {

                // 초기 모델 바인딩
                oAPP.fn.fnInitModelBinding(aFileList);

                // 초기 화면 그리기
                oAPP.fn.fnInitRendering();

            }).catch((e) => {

                console.error(e);

                let sTitle = "[Critical Error]: ";
                sTitle += "Please contact the solution team.";

                let sErrorMsg = e;

                oAPP.DIALOG.showMessageBox(oAPP.CURRWIN, {
                    title: sTitle,
                    message: sErrorMsg,
                    type: "error"
                }).then(() => {

                    oAPP.CURRWIN.close();

                });

            });

        });

    };

})(window, oAPP);