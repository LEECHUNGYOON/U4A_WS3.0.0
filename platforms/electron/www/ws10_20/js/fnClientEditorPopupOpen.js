/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnClientEditorPopupOpen.js
 * - file Desc : UI Client Editor Popup
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        C_DLG_ID = "u4aWsClientEditorDialog",
        CLIENT_EDITOR_BIND_ROOT_PATH = "/WS20/CLIENTEDITOR",
        C_JS = "JS",
        C_HTML = "HM",
        C_CODEEDIT_ID = "ClientEditor";

    var EDITORDATA = {};

    var APPCOMMON = oAPP.common,
        GfnEditorCallback;

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) OPEN
     ************************************************************************/
    oAPP.fn.fnClientEditorPopupOpen = function(OBJTY, OBJID, fnCallback) {

        EDITORDATA.OBJTY = OBJTY;
        EDITORDATA.OBJID = OBJID;

        var oBindData = {
            TITLE: "",
            TYPE: "",
            OBJID : OBJID
        }

        // TYPE 에 따라 모델을 초기화 한다.
        switch (OBJTY) {
            case C_JS:

                oBindData.TITLE = "JAVASCRIPT EDITOR";
                oBindData.TYPE = "javascript";

                break;

            case C_HTML:

                oBindData.TITLE = "HTML EDITOR";
                oBindData.TYPE = "html";

                break;

            default:
                return;
        }


        if (typeof GfnEditorCallback !== "undefined") {
            GfnEditorCallback = undefined;
        }

        // callback function 글로벌 변수로 저장
        GfnEditorCallback = fnCallback;

        APPCOMMON.fnSetModelProperty(CLIENT_EDITOR_BIND_ROOT_PATH, oBindData);

        var oClientEditorDialog = sap.ui.getCore().byId(C_DLG_ID);
        if (oClientEditorDialog) {

            // Dialog가 열려 있으면 빠져나간다.
            if (oClientEditorDialog.isOpen() == true) {
                return;
            }

            oClientEditorDialog.open();
            return;
        }

        var oContents = oAPP.fn.fnClientEditorPopupContents();

        var oClientEditorDialog = new sap.m.Dialog(C_DLG_ID, {

            // Properties
            // title: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TITLE}",
            draggable: true,
            resizable: true,
            contentWidth: "50%",
            contentHeight: "500px",
            // icon: "sap-icon://syntax",
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.ToolbarSpacer(),

                    new sap.ui.core.Icon({
                        src: "sap-icon://syntax"
                    }),

                    new sap.m.Title({
                        text: `{${CLIENT_EDITOR_BIND_ROOT_PATH}/TITLE} -- {${CLIENT_EDITOR_BIND_ROOT_PATH}/OBJID}`
                        // text: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TITLE}"
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function() {

                            var oDialog = sap.ui.getCore().byId(C_DLG_ID);
                            if(oDialog == null){
                                return;
                            }

                            if(oDialog.isOpen()){
                                oDialog.close();
                            }

                        }
                    })

                ]
            }),

            // Aggregations
            buttons: [
                new sap.m.Button({
                    text: "Pretty Print",
                    press: oAPP.events.ev_pressClientEditorPrettyPrint
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_pressClientEditorSave
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    type: sap.m.ButtonType.Negative,
                    icon: "sap-icon://delete",
                    press: oAPP.events.ev_pressClientEditorDel
                }).bindProperty("visible", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding),

                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function(oEvent) {
                        var oDialog = oEvent.getSource().getParent();
                        oDialog.close();
                    }
                }),
            ],

            content: [
                oContents
            ],

            // Events
            afterOpen: function() {

                // Type에 따라 관련 데이터를 가져온다.
                switch (EDITORDATA.OBJTY) {
                    case C_JS:
                        oAPP.fn.fnGetClientJsData(EDITORDATA);
                        break;

                    case C_HTML:
                        oAPP.fn.fnGetClientHtmlData(EDITORDATA);
                        break;
                }

            },
            afterClose: function(oEvent) {

                EDITORDATA = {};

            },
            escapeHandler: function() {
                var oDialog = sap.ui.getCore().byId(C_DLG_ID);
                if (!oDialog) {
                    return;
                }
                oDialog.close();
            }

        }).addStyleClass(C_DLG_ID);

        oClientEditorDialog.open();

    }; // end of oAPP.fn.fnClientEditorPopupOpen

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Contents UI
     ************************************************************************/
    oAPP.fn.fnClientEditorPopupContents = function() {

        var oCodeEditor = new sap.ui.codeeditor.CodeEditor(C_CODEEDIT_ID, {
            colorTheme: "solarized_dark",
            type: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/TYPE}",
            value: "{" + CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA/DATA}",
        }).bindProperty("editable", "/WS20/APP/IS_EDIT", oAPP.fn.fnUiVisibleBinding);
        
        oCodeEditor.addDelegate({
            onAfterRendering: function(oControl) {

                var oEditor = oControl.srcControl,
                    _oAceEditor = oEditor._oEditor;

                if (!_oAceEditor) {
                    return;
                }

                _oAceEditor.setFontSize(20);

            }
        });

        return new sap.m.Page({
            showHeader: false,
            content: [
                oCodeEditor
            ]
        });

    }; // end of oAPP.fn.fnClientEditorPopupContents

    /************************************************************************
     * Getting Client Editor Javascript Data
     ************************************************************************/
    oAPP.fn.fnGetClientJsData = function(EDITORDATA) {

        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",

            aCliEvt = oAPP.DATA.APPDATA.T_CEVT,

            oFindScript = aCliEvt.find(a => a.OBJID == EDITORDATA.OBJID);

        if (typeof oFindScript === "undefined") {

            EDITORDATA.DATA = "";

            APPCOMMON.fnSetModelProperty(sEditorDataBindPath, EDITORDATA);

            return;
        }

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oFindScript);

    }; // end of oAPP.fn.fnGetClientJsData

    /************************************************************************
     * Getting Client Editor HTML Data
     ************************************************************************/
    oAPP.fn.fnGetClientHtmlData = function(EDITORDATA) {

        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",

            aCliEvt = oAPP.DATA.APPDATA.T_CEVT,

            oFindScript = aCliEvt.find(a => a.OBJID == EDITORDATA.OBJID);

        if (typeof oFindScript === "undefined") {

            EDITORDATA.DATA = "";

            APPCOMMON.fnSetModelProperty(sEditorDataBindPath, EDITORDATA);

            return;
        }

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oFindScript);

    }; // end of oAPP.fn.fnGetClientHtmlData

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Save Event
     ************************************************************************/
    oAPP.events.ev_pressClientEditorSave = function(oEvent) {
        
        if (typeof GfnEditorCallback !== "function") {
            return;
        }

        // Editor에 입력한 값을 구한다.
        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",
            oEditorData = APPCOMMON.fnGetModelProperty(sEditorDataBindPath);

        // 서버에서 수집된 Client 이벤트가 있는지 확인한다.
        var iFindIndex = oAPP.DATA.APPDATA.T_CEVT.findIndex(a => a.OBJID == oEditorData.OBJID);

        /******************************************************************
         * Editor에 입력한 값이 없을 경우.
         ******************************************************************/
        if (oEditorData.DATA == "") {

            // 서버에서 수집된 Client 이벤트가 있을 경우
            if (iFindIndex >= 0) {

                // 해당하는 index의 Client 이벤트 데이터를 삭제한다.
                oAPP.DATA.APPDATA.T_CEVT.splice(iFindIndex, 1);

                // 어플리케이션 정보에 변경 플래그 
                parent.setAppChange('X');

            }

            GfnEditorCallback('');

            parent.showMessage(sap, 10, "", "saved success!");

            return;

        }

        /******************************************************************
         * Editor에 입력한 값이 있을 경우.
         ******************************************************************/

        // 서버에서 수집된 Client 이벤트가 있을 경우
        if (iFindIndex >= 0) {

            // 해당 Array에 업데이트
            oAPP.DATA.APPDATA.T_CEVT[iFindIndex] = oEditorData;

        } else {

            // 해당 Array에 신규 추가
            oAPP.DATA.APPDATA.T_CEVT.push(oEditorData);

        }

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange('X');

        parent.showMessage(sap, 10, "", "saved success!");

        GfnEditorCallback('X');

    }; // end of oAPP.events.ev_pressClientEditorSave

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Delete Event
     ************************************************************************/
    oAPP.events.ev_pressClientEditorDel = function(oEvent) {

        var sEditorDataBindPath = CLIENT_EDITOR_BIND_ROOT_PATH + "/EDITDATA",
            oEditorData = APPCOMMON.fnGetModelProperty(sEditorDataBindPath),
            oEditorDeepCp = jQuery.extend(true, {}, oEditorData);

        // 이미 삭제가 되있는 경우는 빠져나간다.
        if (oEditorDeepCp.DATA == "") {
            return;
        }

        oEditorDeepCp.DATA = "";

        APPCOMMON.fnSetModelProperty(sEditorDataBindPath, oEditorDeepCp);

    }; // end of oAPP.events.ev_pressClientEditorDel

    /************************************************************************
     * Client Editor (HTML, JAVASCRIPT) Pretty Print 기능
     ************************************************************************/
    oAPP.events.ev_pressClientEditorPrettyPrint = function() {

        var oCodeEditor = sap.ui.getCore().byId(C_CODEEDIT_ID);
        if (!oCodeEditor) {
            return;
        }

        oCodeEditor.prettyPrint();

    };

})(window, $, oAPP);