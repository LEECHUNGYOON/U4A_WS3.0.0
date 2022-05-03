/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnAppCopyPopupOpen.js
 * - file Desc : Application Copy Popup Open
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    /************************************************************************
     * Root Variable Area..
     ************************************************************************/
    const
        C_BIND_ROOT_PATH = "/WS10/APPCOPY",
        C_APP_COPY_DLG_ID = "u4aWsAppCopyDlg",

        C_ENUM_VALUE_STATE = sap.ui.core.ValueState;

    var APPCOMMON = oAPP.common;


    /************************************************************************
     * Application Copy Popup Open
     ************************************************************************/
    oAPP.fn.fnAppCopyPopupOpen = function(sAppId) {

        // 푸터 메시지가 있을 경우 닫기
        APPCOMMON.fnHideFloatingFooterMsg();

        // Application Copy Init Model Setting
        var oBindData = {
            SOURCEID: sAppId,
            TARGETID: "",
            TARGETID_VS: C_ENUM_VALUE_STATE.None,
            TARGETID_VSTXT: "",
            PACKG: "$TMP",
            PACKG_VS: C_ENUM_VALUE_STATE.None,
            PACKG_VSTXT: ""
        };

        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oBindData);

        var oAppCopyDlg = sap.ui.getCore().byId(C_APP_COPY_DLG_ID);
        if (oAppCopyDlg) {
            oAppCopyDlg.open();
            return;
        }

        var oAppCopyForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                singleContainerFullSize: true
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "Source App. ID"
                            }),
                            fields: new sap.m.Input({
                                editable: false,
                                value: "{SOURCEID}"
                            })
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                required: true,
                                text: "Target App. ID"
                            }),
                            fields: new sap.m.Input({
                                value: "{TARGETID}",
                                valueState: "{TARGETID_VS}",
                                valueStateText: "{TARGETID_VSTXT}",
                                change: oAPP.events.ev_AppCopyDlgTargetInpChgEvt
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "Package",
                                required: true,
                            }),
                            fields: new sap.m.Input({
                                value: "{PACKG}",
                                valueState: "{PACKG_VS}",
                                valueStateText: "{PACKG_VSTXT}",
                                showValueHelp: true,
                                valueHelpRequest: oAPP.events.ev_packageSchpEvt,
                                change: oAPP.events.ev_AppCopyDlgTargetInpChgEvt
                            })
                        }),
                    ]
                }),
            ]
        });

        var oAppCopyDlg = new sap.m.Dialog(C_APP_COPY_DLG_ID, {

            // Properties
            draggable: true,
            resizable: true,
            contentWidth: "500px",
            contentHeight: "220px",
            // title: "Application Copy",
            // titleAlignment: sap.m.TitleAlignment.Center,
            // icon: "sap-icon://copy",

            // Aggregations
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://copy"
                    }),

                    new sap.m.Title({
                        text: "Application Copy"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: oAPP.events.ev_AppCopyDlgCancel
                    })
                ]
            }),

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_AppCopyDlgOK
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_AppCopyDlgCancel
                }),
            ],
            content: [
                oAppCopyForm
            ],

            // Events
            afterClose: oAPP.events.ev_AppCopyDlgAfterClose,

        }).addStyleClass(C_APP_COPY_DLG_ID);

        oAppCopyDlg.open();

        oAppCopyDlg.bindElement(C_BIND_ROOT_PATH);

    }; // end of oAPP.fn.fnAppCopyPopupOpen

    /************************************************************************
     * 어플리케이션 복사 수행
     ************************************************************************/
    oAPP.fn.fnSetAppCopy = function(oParam) {

        var sPath = parent.getServerPath() + '/app_copy',
            oFormData = new FormData();

        if (typeof oParam != "undefined") {
            oFormData.append("TRKORR", oParam.TRKORR);
        }

        var oBindData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH),
            sSourceAppId = oBindData.SOURCEID, // 복사 원본 APPID
            sTargetAppId = oBindData.TARGETID, // 복사 대상 APPID
            sPackg = oBindData.PACKG;

        oFormData.append("S_APPID", sSourceAppId);
        oFormData.append("T_APPID", sTargetAppId);
        oFormData.append("PACKG", sPackg);

        parent.setBusy('X');

        sendAjax(sPath, oFormData, function(oResult) {

            parent.setBusy('');

            // 스크립트가 있으면 eval 처리
            if (oResult.SCRIPT) {
                eval(oResult.SCRIPT);
            }

            // APP 복사가 성공이면 복사 팝업을 닫는다.
            if (oResult.RETCD == "S") {
                // Application Copy Dialog Close
                lf_AppCopyPopupClose();
            }

        });

        // APP 복사 전용 Cts Popup
        function lf_appCopyCtsPopup() {

            // CTS Popup을 Open 한다.
            oAPP.fn.fnCtsPopupOpener(function(oResult) {

                oAPP.fn.fnSetAppCopy(oResult);

            });

        }

    }; // end of oAPP.fn.fnSetAppCopy

    /************************************************************************
     * Application Copy Dialog Target ID Input Change Event
     ************************************************************************/
    oAPP.events.ev_AppCopyDlgTargetInpChgEvt = function(oEvent) {

        var oInput = oEvent.getSource(),
            sInputValue = oInput.getValue();

        if (!sInputValue) {
            return;
        }

        oInput.setValue(sInputValue.toUpperCase());

    }; // end of oAPP.events.ev_AppCopyDlgTargetInpChgEvt

    /************************************************************************
     * Application Copy Dialog After Close Event
     ************************************************************************/
    oAPP.events.ev_AppCopyDlgAfterClose = function() {

        // Application Copy Dialog Close
        lf_AppCopyPopupClose();

    }; // end of oAPP.events.ev_AppCopyDlgAfterClose

    /************************************************************************
     * Application Copy OK Button Event
     ************************************************************************/
    oAPP.events.ev_AppCopyDlgOK = function() {

        var oModelData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH),
            sTargetId = oModelData.TARGETID;

        // Target ID Input의 valueState 속성 초기값 설정
        oModelData.TARGETID_VS = C_ENUM_VALUE_STATE.None;
        oModelData.TARGETID_VSTXT = "";

        // PACKG의 valueState 속성 초기값 설정
        oModelData.PACKG_VS = C_ENUM_VALUE_STATE.None;
        oModelData.PACKG_VSTXT = "";

        // 어플리케이션 명 정합성 체크
        var oValid = oAPP.fn.fnCheckValidAppName(sTargetId);

        if (oValid.RETCD == false) {

            var oCurrWin = REMOTE.getCurrentWindow();
            oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

            parent.showMessage(sap, 10, "", oValid.RETMSG);

            lf_setTargetIdValueStateChange(C_ENUM_VALUE_STATE.Error, oValid.RETMSG);

            return;
        }

        // 패키지를 입력했는지 여부 확인
        if (oModelData.PACKG == "") {

            var sPackgMsg = oAPP.common.fnGetMsgClsTxt("050", "Package");
            parent.showMessage(sap, 10, "", sPackgMsg);

            oModelData.PACKG_VS = C_ENUM_VALUE_STATE.Error;
            oModelData.PACKG_VSTXT = sPackgMsg;

            APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oModelData);

            return;
        }

        var oFormData = new FormData();
        oFormData.append("APPID", sTargetId);

        // 복사 대상 APP 명 존재 유무 확인하여 없으면 복사 수행.
        ajax_init_prc(oFormData, function(oResult) {

            // 복사대상 어플리케이션이 존재 하는지 유무 확인
            var bIsAppExists = lf_getAppInfo(oResult);
            if (bIsAppExists == false) {
                return;
            }

            // 복사 대상 어플리케이션 명이 없을 경우에만 복사 수행
            oAPP.fn.fnSetAppCopy();

        });
        // ajax_init_prc(oFormData, lf_getAppInfo);

    }; // end of oAPP.events.ev_AppCopyDlgOK    

    /************************************************************************
     * Application Copy Cancel Button Event
     ************************************************************************/
    oAPP.events.ev_AppCopyDlgCancel = function(oEvent) {

        // Application Copy Dialog Close
        lf_AppCopyPopupClose();

    }; // end of oAPP.events.ev_AppCopyDlgCancel

    /************************************************************************
     * Package Search Help Popup valueHelp Event
     ************************************************************************/
    oAPP.events.ev_packageSchpEvt = function(oEvent) {

        oAPP.fn.fnPackgSchpPopupOpener(function(oResult) {

            var sPackage = oResult.DEVCLASS;

            var oModelData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH);
            oModelData.PACKG = sPackage;

            APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oModelData);

        });

    }; // end of oAPP.events.ev_packageSchpEvt

    //-------------------------------------------------------------------------------//
    //-------------------------------------------------------------------------------//

    /************************************************************************
     * (Local Function) Application Copy Dialog Close
     ************************************************************************/
    function lf_AppCopyPopupClose() {

        var oDialog = sap.ui.getCore().byId(C_APP_COPY_DLG_ID);
        if (!oDialog) {
            return;
        }

        oDialog.close();

    } // end of lf_AppCopyPopupClose

    /************************************************************************
     * (Local Function) Application ID 존재 유무 확인하여 없으면 복사 수행
     ************************************************************************/
    function lf_getAppInfo(oResult) {

        parent.setBusy('');

        if (oResult.MSGTY !== "N") {

            var oCurrWin = REMOTE.getCurrentWindow(),
                sMsg = oAPP.common.fnGetMsgClsTxt("035"); // "It is already registered application information."

            parent.showMessage(sap, 10, "", sMsg);

            oCurrWin.flashFrame(true); // 작업표시줄 깜빡임

            // Target APPID에 대한 정합성 체크 후 오류 시, ValueState를 Error 로 변경
            lf_setTargetIdValueStateChange(C_ENUM_VALUE_STATE.Error, sMsg);

            return false;
        }

        // Target APPID에 ValueState 초기화
        lf_setTargetIdValueStateChange(C_ENUM_VALUE_STATE.None, "");

        return true;

    } // end of lf_getAppInfo

    /************************************************************************
     * (Local Function) Target APPID Input 의 valueState 변경
     ************************************************************************/
    function lf_setTargetIdValueStateChange(sValueState, sValueStateTxt) {

        var oModelData = APPCOMMON.fnGetModelProperty(C_BIND_ROOT_PATH);

        // 정합성 체크 후 오류 시, ValueState를 Error 로 변경
        oModelData.TARGETID_VS = sValueState;
        oModelData.TARGETID_VSTXT = sValueStateTxt;

        APPCOMMON.fnSetModelProperty(C_BIND_ROOT_PATH, oModelData);

    } // end of lf_setTargetIdValueStateChange    

})(window, $, oAPP);