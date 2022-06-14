/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_common.js
 * - file Desc : ws 공통 스크립트
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    oAPP.common = {};

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        APPCOMMON = oAPP.common;

    /************************************************************************
     * Child Window를 활성/비활성 처리 한다.
     * **********************************************************************
     * @param {Boolean} bIsShow 
     * - true : child window 보이기
     * - false : child window 숨김
     * **********************************************************************/
    oAPP.common.fnIsChildWindowShow = function (bIsShow) {

        var oCurrWin = REMOTE.getCurrentWindow(),
            aChild = oCurrWin.getChildWindows(),
            iChildCnt = aChild.length;

        if (iChildCnt <= 0) {
            return;
        }

        for (var i = 0; i < iChildCnt; i++) {
            var oChild = aChild[i];

            if (bIsShow) {
                oChild.show();
            } else {
                oChild.hide();
            }

        }

    }; // end of oAPP.common.fnIsChildWindowShow

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
    oAPP.common.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

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
    oAPP.common.fnGetModelProperty = function (sModelPath) {
        return sap.ui.getCore().getModel().getProperty(sModelPath);
    };

    /************************************************************************
     * 메시지 클래스 번호에 해당하는 메시지 리턴
     * **********************************************************************
     * @param {String} sMsgNum  
     * - Message Class Number
     * 
     * @return {String}
     * - Message Text
     ************************************************************************/
    oAPP.common.fnGetMsgClassTxt = function (sMsgNum) {

        // 메시지 클래스 내용이 없으면 리턴
        if (!oAPP.attr.oMsgClass) {
            return;
        }

        // 파라미터 타입이 String이 아니면 리턴
        if (typeof sMsgNum !== "string") {
            return;
        }

        var sRetMsg = oAPP.attr.oMsgClass[sMsgNum];

        // 메시지 클래스 번호에 해당하는 메시지가 없으면 리턴
        if (!sRetMsg) {
            return;
        }

        return sRetMsg;

    }; // end of oAPP.common.fnGetMsgClassTxt

    /************************************************************************
     * 메타데이터의 메시지 클래스 번호에 해당하는 메시지 리턴 
     * **********************************************************************
     * @param {String} sMsgNum  
     * - Message Class Number
     * 
     * @param {String} "P1 P2 P3 P4"
     * - Replace Text (총 4개만 가능)
     * 
     * @return {String}
     * - Message Text
     ************************************************************************/
    oAPP.common.fnGetMsgClsTxt = function (sMsgNum, p1, p2, p3, p4) {

        // Metadata에서 메시지 클래스 정보를 구한다.
        var oMeta = parent.getMetadata(),
            aMsgClsTxt = oMeta["MSGCLS"];

        if (!aMsgClsTxt || !aMsgClsTxt.length) {
            return;
        }

        // 메시지 넘버에 해당하는 메시지 클래스 정보를 구한다.
        var oMsgTxt = aMsgClsTxt.find(a => a.MSGNR == sMsgNum);
        if (!oMsgTxt) {
            return;
        }

        var sText = oMsgTxt.TEXT,
            aWithParam = [];

        // 파라미터로 전달 받은 Replace Text 수집
        aWithParam.push(p1 == null ? "" : p1);
        aWithParam.push(p2 == null ? "" : p2);
        aWithParam.push(p3 == null ? "" : p3);
        aWithParam.push(p4 == null ? "" : p4);
        // if(p1){ aWithParam.push(p1); }        
        // if(p2){ aWithParam.push(p2); }
        // if(p3){ aWithParam.push(p3); }
        // if(p4){ aWithParam.push(p4); }

        var iWithParamLenth = aWithParam.length;
        if (iWithParamLenth == 0) {
            return sText;
        }

        // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
        for (var i = 0; i < iWithParamLenth; i++) {

            var index = i + 1,
                sParamTxt = aWithParam[i];

            var sRegEx = "&" + index,
                oRegExp = new RegExp(sRegEx, "g");

            sText = sText.replace(oRegExp, sParamTxt);

        }

        sText = sText.replace(new RegExp("&\\d+", "g"), "");

        // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
        for (var i = 0; i < iWithParamLenth; i++) {

            var sParamTxt = aWithParam[i];

            sText = sText.replace(new RegExp("&", "i"), sParamTxt);

        }

        sText = sText.replace(new RegExp("&", "g"), "");

        return sText;

    }; // end of oAPP.common.fnGetMsgClsTxt

    /************************************************************************
     * z-Index 구하기
     * **********************************************************************/
    oAPP.common.fnGetZIndex = function () {
        return sap.ui.core.Popup.getNextZIndex();
    };

    /************************************************************************
     * 각 페이지 이동 시 푸터 메시지가 있으면 숨김처리
     ************************************************************************/
    oAPP.common.fnHideFloatingFooterMsg = function () {

        if (oAPP.attr.footerMsgTimeout) {
            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;
        }

        // Footer 메시지 모델 초기화
        oAPP.common.fnSetModelProperty("/FMSG", {});


        // var oApp = sap.ui.getCore().byId("WSAPP");

        // if (!oApp) {
        //     return;
        // }

        // var aPages = oApp.getPages(),
        //     iPgCnt = aPages.length;

        // if (iPgCnt == 0) {
        //     return;
        // }

        // // 전체 페이지(10번, 20번)에 Footer를 숨긴다.
        // for (var i = 0; i < iPgCnt; i++) {

        //     var oPage = aPages[i],
        //         bIsShow = oPage.getShowFooter();

        //     if (!bIsShow) {
        //         continue;
        //     }

        //     oPage.setProperty("showFooter", false, true);

        //     // Footer 메시지 모델 초기화
        //     oAPP.common.fnSetModelProperty("/FMSG", {});

        //     var oPageDom = oPage.getDomRef(),

        //         $footer = jQuery(oPageDom).find(".sapMPageFooter").last();

        //     $footer.removeClass("sapMPageFooterControlShow");
        //     $footer.addClass("sapMPageFooterControlHide");

        // }

    }; // end of oAPP.common.fnHideFloatingFooterMsg

    /************************************************************************
     * 멀티 푸터 메시지 닫기
     ************************************************************************/
    oAPP.common.fnMultiFooterMsgClose = function () {

        var sPopupName = "ERRMSGPOP";

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            oResult.WINDOW.close();
        }

        // let oMultiFooterMsgSplit = sap.ui.getCore().byId("u4aWs20MultiFootSplitLayoutData");
        // if (oMultiFooterMsgSplit == null) {
        //     return;
        // }

        // oMultiFooterMsgSplit.setSize("0px");
        // oMultiFooterMsgSplit.setMinSize(0);
        // oMultiFooterMsgSplit.setResizable(false);

        // oAPP.common.fnSetModelProperty("/FMTMSG", []);

    }; // end of oAPP.common.fnMultiFooterMsgClose

    /************************************************************************
     * 각 페이지의 짧은 푸터 메시지
     * **********************************************************************
     * @param {CHAR1} TYPE  
     * - S : success
     * - E : error
     * - W : warning
     * - I : information
     * @param {String} POS
     * - footer message를 실행할 화면 위치 정보
     * 예) WS10, WS20
     * @param {String} MSG  
     ************************************************************************/
    oAPP.common.fnShowFloatingFooterMsg = function (TYPE, POS, MSG) {

        oAPP.common.fnHideFloatingFooterMsg();

        var oMsg = {};

        // 메시지 타입별 아이콘 및 아이콘 색상 지정
        switch (TYPE) {
            case "S":
                oMsg.ICON = "sap-icon://message-success";
                oMsg.ICONCOLOR = "#abe2ab";

                parent.setSoundMsg('01'); // sap sound(success)
                break;

            case "E":
                oMsg.ICON = "sap-icon://message-error";
                oMsg.ICONCOLOR = "#f88";

                parent.setSoundMsg('02'); // sap sound(error)
                break;

            case "W":
                oMsg.ICON = "sap-icon://message-warning";
                oMsg.ICONCOLOR = "#f9a429";
                parent.setSoundMsg('01'); // sap sound(success)		

                break;

            case "I":
                oMsg.ICON = "sap-icon://message-information";
                oMsg.ICONCOLOR = "#346187";
                parent.setSoundMsg('01'); // sap sound(success)

                break;
        }

        oMsg.ISSHOW = true;
        oMsg.TXT = MSG;

        // 메시지 정보를 모델에 세팅
        oAPP.common.fnSetModelProperty("/FMSG/" + POS, oMsg);

        // 이전 timeout이 존재하면 일단 다 날리고 시작
        if (oAPP.attr.footerMsgTimeout) {
            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;
        }

        // timeout 시간이 도래되면 Footer Message를 지운다.
        oAPP.attr.footerMsgTimeout = setTimeout(function () {

            oAPP.common.fnHideFloatingFooterMsg();

            clearTimeout(oAPP.attr.footerMsgTimeout);
            delete oAPP.attr.footerMsgTimeout;

        }, 10000);

    }; // end of oAPP.common.fnShowFloatingFooterMsg

    // /************************************************************************
    //  * window open
    //  ************************************************************************/
    // oAPP.common.fnWindowOpen = function () {

    //     var oServerInfo = parent.getServerInfo(),
    //         oUserInfo = parent.getUserInfo(),
    //         oMeta = oAPP.common.fnGetModelProperty("/METADATA"),

    //         // 실행시킬 호스트명 + U4A URL 만들기
    //         sHost = "http://" + oMeta.HOST + ":80" + oServerInfo.INSTANCENO,
    //         sPath = encodeURI(sHost + "/zu4a_acs/icon_exp");
    //     // sPath = encodeURI(sHost + "/zu4a_acs/icon_exp?sap-user=" + oUserInfo.ID + "&sap-password=" + oUserInfo.PW);

    //     var aParams = [{
    //             NAME: "sap-user",
    //             VALUE: oUserInfo.ID
    //         },
    //         {
    //             NAME: "sap-password",
    //             VALUE: oUserInfo.PW
    //         },
    //     ];

    //     oAPP.fn.fnCallBrowserOpenPost(sPath, aParams);

    // }; // end of oAPP.common.fnWindowOpen

    /*************************************************************************
     * [공통] 단축키 실행 할지 말지 여부 체크
     **************************************************************************/
    oAPP.common.fnCheckShortCutExeAvaliable = () => {

        return new Promise((resolve, reject) => {

            // Busy Indicator가 실행중인지 확인
            if (parent.getBusy() == 'X') {
                resolve("X");
                return;
            }

            // 현재 Dialog Popup이 실행 되어 있는지 확인.
            var $oOpendDialog = $(".sapMDialogOpen");
            if ($oOpendDialog.length) {
                resolve("X");
                return;
            }

            resolve("");

        });

    }; // end of oAPP.common.fnCheckShortCutExeAvaliable

    /*************************************************************************
     * Shortcut 설정
     **************************************************************************/
    oAPP.common.getShortCutList = function (sPgNo) {

        let IS_DEV = APPCOMMON.fnGetModelProperty("/USERINFO/USER_AUTH/IS_DEV");

        var aShortCutWS10 = [{
                    KEY: "Ctrl+F12", // Application Create
                    fn: () => {

                        oAPP.common.fnCheckShortCutExeAvaliable().then((result) => {

                            if (result == "X") {
                                console.log("실행 불가!!");
                                return;
                            }

                            console.log("실행 가능!!");

                            var oAppCreateBtn = sap.ui.getCore().byId("appCreateBtn");
                            if (!oAppCreateBtn || !oAppCreateBtn.getEnabled() || !oAppCreateBtn.getVisible()) {
                                return;
                            }

                            oAppCreateBtn.firePress();

                        });

                        return;

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppCreateBtn = sap.ui.getCore().byId("appCreateBtn");
                        if (!oAppCreateBtn || !oAppCreateBtn.getEnabled() || !oAppCreateBtn.getVisible()) {
                            return;
                        }

                        oAppCreateBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+Shift+F1", // Application Change
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppChangeBtn = sap.ui.getCore().byId("appChangeBtn");
                        if (!oAppChangeBtn || !oAppChangeBtn.getEnabled() || !oAppChangeBtn.getVisible()) {
                            return;
                        }

                        oAppChangeBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F10", // Application Delete
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppDelBtn = sap.ui.getCore().byId("appDelBtn");
                        if (!oAppDelBtn || !oAppDelBtn.getEnabled() || !oAppDelBtn.getVisible()) {
                            return;
                        }

                        oAppDelBtn.firePress();
                    }
                },
                {
                    KEY: "Shift+F11", // Application Copy
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppCopyBtn = sap.ui.getCore().byId("appCopyBtn");
                        if (!oAppCopyBtn || !oAppCopyBtn.getEnabled() || !oAppCopyBtn.getVisible()) {
                            return;
                        }

                        oAppCopyBtn.firePress();
                    }
                },
                {
                    KEY: "F7", // Display Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oDisplayBtn = sap.ui.getCore().byId("displayBtn");
                        if (!oDisplayBtn || !oDisplayBtn.getEnabled() || !oDisplayBtn.getVisible()) {
                            return;
                        }

                        oDisplayBtn.firePress();
                    }
                },
                {
                    KEY: "F8", // Application Execution
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppExecBtn = sap.ui.getCore().byId("appExecBtn");
                        if (!oAppExecBtn || !oAppExecBtn.getEnabled() || !oAppExecBtn.getVisible()) {
                            return;
                        }

                        oAppExecBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F1", // Example Open
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oExamBtn = sap.ui.getCore().byId("examBtn");
                        if (!oExamBtn || !oExamBtn.getEnabled() || !oExamBtn.getVisible()) {
                            return;
                        }

                        oExamBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F3", // Multi Preview
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oMultiPrevBtn = sap.ui.getCore().byId("multiPrevBtn");
                        if (!oMultiPrevBtn || !oMultiPrevBtn.getEnabled() || !oMultiPrevBtn.getVisible()) {
                            return;
                        }

                        oMultiPrevBtn.firePress();
                    }
                }

            ],
            aShortCutWS20 = [{
                    KEY: "Ctrl+F2", // Syntax Check Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oSyntaxCheckBtn = sap.ui.getCore().byId("syntaxCheckBtn");
                        if (!oSyntaxCheckBtn || !oSyntaxCheckBtn.getEnabled() || !oSyntaxCheckBtn.getVisible()) {
                            return;
                        }

                        oSyntaxCheckBtn.firePress();

                    }
                },

                {
                    KEY: "F3", // Back Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oBackBtn = sap.ui.getCore().byId("backBtn");
                        if (!oBackBtn || !oBackBtn.getEnabled() || !oBackBtn.getVisible()) {
                            return;
                        }

                        oBackBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F1", // Display or Change Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oChangeModeBtn = sap.ui.getCore().byId("changeModeBtn"),
                            oDisplayBtn = sap.ui.getCore().byId("displayModeBtn");

                        if (!oChangeModeBtn && !oDisplayBtn) {
                            return;
                        }

                        var bIsChgVisi = oChangeModeBtn.getVisible(),
                            bIsDisVisi = oDisplayBtn.getVisible();

                        if (bIsChgVisi == true) {
                            oChangeModeBtn.firePress();
                            return;
                        }

                        if (bIsDisVisi == true) {
                            oDisplayBtn.firePress();
                            return;
                        }

                    }
                },
                {
                    KEY: "Ctrl+F3", // Activate Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oActivateBtn = sap.ui.getCore().byId("activateBtn");

                        if (!oActivateBtn || !oActivateBtn.getEnabled() || !oActivateBtn.getVisible()) {
                            return;
                        }

                        oActivateBtn.focus();
                        oActivateBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+S", // Save Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oSaveBtn = sap.ui.getCore().byId("saveBtn");
                        if (!oSaveBtn || !oSaveBtn.getEnabled() || !oSaveBtn.getVisible()) {
                            return;
                        }

                        oSaveBtn.focus();
                        oSaveBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+Shift+F12", // Mime Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oMimeBtn = sap.ui.getCore().byId("mimeBtn");
                        if (!oMimeBtn || !oMimeBtn.getEnabled() || !oMimeBtn.getVisible()) {
                            return;
                        }

                        oMimeBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F12", // Controller Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oControllerBtn = sap.ui.getCore().byId("controllerBtn");
                        if (!oControllerBtn || !oControllerBtn.getEnabled() || !oControllerBtn.getVisible()) {
                            return;
                        }

                        oControllerBtn.firePress();
                    }
                },
                {
                    KEY: "F8", // Application Execution Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAppExecBtn = sap.ui.getCore().byId("ws20_appExecBtn");
                        if (!oAppExecBtn || !oAppExecBtn.getEnabled() || !oAppExecBtn.getVisible()) {
                            return;
                        }

                        oAppExecBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F5", // Multi Preview Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oMultiPrevBtn = sap.ui.getCore().byId("ws20_multiPrevBtn");
                        if (!oMultiPrevBtn || !oMultiPrevBtn.getEnabled() || !oMultiPrevBtn.getVisible()) {
                            return;
                        }

                        oMultiPrevBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+Shift+F10", // Icon List Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oIconListBtn = sap.ui.getCore().byId("iconListBtn");
                        if (!oIconListBtn || !oIconListBtn.getEnabled() || !oIconListBtn.getVisible()) {
                            return;
                        }

                        oIconListBtn.firePress();
                    }
                },
                {
                    KEY: "Shift+F1", // Add Server Event Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oAddEventBtn = sap.ui.getCore().byId("addEventBtn");
                        if (!oAddEventBtn || !oAddEventBtn.getEnabled() || !oAddEventBtn.getVisible()) {
                            return;
                        }

                        oAddEventBtn.firePress();
                    }
                },
                {
                    KEY: "F9", // Runtime Class Navigator Event Button
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oRuntimeBtn = sap.ui.getCore().byId("runtimeBtn");
                        if (!oRuntimeBtn || !oRuntimeBtn.getEnabled() || !oRuntimeBtn.getVisible()) {
                            return;
                        }

                        oRuntimeBtn.firePress();
                    }
                },
                {
                    KEY: "Ctrl+F", // Find
                    fn: () => {

                        // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
                        if (parent.getBusy() == 'X') {
                            return;
                        }

                        var oFindBtn = sap.ui.getCore().byId("ws20_findBtn");
                        if (!oFindBtn || !oFindBtn.getEnabled() || !oFindBtn.getVisible()) {
                            return;
                        }

                        oFindBtn.firePress();
                    }
                }

            ];

        var oShortcutList = {
            "WS10": aShortCutWS10,
            "WS20": aShortCutWS20
        };

        return oShortcutList[sPgNo];

    }; // end of oAPP.common.getShortCutList

    /************************************************************************
     * 현재 페이지 별 단축키 설정
     * **********************************************************************
     * @param {String} sPgNo  
     * - page 명
     * 예) WS10, WS20     
     ************************************************************************/
    oAPP.common.setShortCut = function (sPgNo) {

        var oShortcut = oAPP.attr.oShortcut;

        var aShortcutList = oAPP.common.getShortCutList(sPgNo),
            iLength = aShortcutList.length;

        for (var i = 0; i < iLength; i++) {

            var oShortcutInfo = aShortcutList[i];

            oShortcut.add(oShortcutInfo.KEY, oShortcutInfo.fn);

        }

    }; // end of oAPP.common.setShortCut

    /************************************************************************
     * 해당 페이지의 단축키 제거
     * **********************************************************************
     * @param {String} sPgNo  
     * - page 명
     * 예) WS10, WS20     
     ************************************************************************/
    oAPP.common.removeShortCut = function (sPgNo) {

        var oShortcut = oAPP.attr.oShortcut;

        var aShortcutList = oAPP.common.getShortCutList(sPgNo),
            iLength = aShortcutList.length;

        for (var i = 0; i < iLength; i++) {

            var oShortcutInfo = aShortcutList[i];

            oShortcut.remove(oShortcutInfo.KEY);

        }

    }; // end of oAPP.common.removeShortCut

    /************************************************************************
     * 로그인 상태 체크
     ************************************************************************/
    oAPP.common.sendAjaxLoginChk = function (fnCallback) {

        var sPath = parent.getServerPath() + "/wsloginchk";

        sendAjax(sPath, undefined, (oReturn) => {

            if (typeof fnCallback == "function") {
                fnCallback(oReturn);
            }

        });

    }; // end of oAPP.common.sendAjaxLoginChk

    /************************************************************************
     * 에디터 타입별로 이미 오픈된 팝업이 있는지 확인
     * 있으면 새창을 띄우지 말고 focus 를 준다.
     * **********************************************************************
     * @param {Object} oEditInfo
     * - 오픈 하려는 에디터의 타입 정보
     * 
     * @return {Object} 
     *  - ISOPEN {Boolean} 
     *      true : 같은 타입의 오픈된 에디터 팝업이 이미 있는 경우.
     *      false : 같은 타입의 오픈된 에디터 팝업이 없는 신규일 경우.
     * 
     *  - WINDOW {Object}
     *      BrowserWindow Instance
     *  
     ************************************************************************/
    oAPP.common.getCheckAlreadyOpenWindow = function (OBJTY) {

        var oCurrWin = REMOTE.getCurrentWindow(), // 현재 window
            aChildWin = oCurrWin.getChildWindows(), // 현재 window의 child window           
            iChildWinCnt = aChildWin.length,
            sObjType = OBJTY;

        if (iChildWinCnt <= 0) {
            return {
                ISOPEN: false
            };
        }

        for (var i = 0; i < iChildWinCnt; i++) {

            var oWin = aChildWin[i],
                oWebCon = oWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sType = oWebPref.OBJTY;

            if (sObjType != sType) {
                continue;
            }

            oWin.focus();

            return {
                ISOPEN: true,
                WINDOW: oWin
            };

        }

        return {
            ISOPEN: false
        };

    }; // end of oAPP.common.onCheckAlreadyOpenEditor

    /************************************************************************
     *  컨트롤러 클래스 실행
     * **********************************************************************
     * @param {String} METHNM
     * - 클래스의 메소드 명
     * @param {String} INDEX
     * - 클래스 메소드 내의 소스 인덱스
     ************************************************************************/
    oAPP.common.execControllerClass = function (METHNM, INDEX) {

        var oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = parent.require(oSettingsPath),
            oVbsInfo = oSettings.vbs,
            sVbsPath = oVbsInfo.rootPath,
            sVbsFileName = oVbsInfo.controllerClassVbs,
            sAppPath = APP.getPath("userData"),
            sVbsFullPath = PATH.join(sAppPath, sVbsPath, sVbsFileName);

        var oServerInfo = parent.getServerInfo(),
            oAppInfo = parent.getAppInfo(),
            oUserInfo = parent.getUserInfo();

        if (!oAppInfo) {
            return;
        }

        var aParam = [
            sVbsFullPath, // VBS 파일 경로
            oServerInfo.SERVERIP, // Server IP
            oServerInfo.SYSTEMID, // SYSTEM ID
            oServerInfo.INSTANCENO, // INSTANCE Number
            oServerInfo.CLIENT, // CLIENT
            oUserInfo.ID.toUpperCase(), // SAP ID    
            oUserInfo.PW, // SAP PW
            oServerInfo.LANGU, // LANGUAGE
            oAppInfo.APPID, // Application Name
            (typeof METHNM == "undefined" ? "" : METHNM),
            (typeof INDEX == "undefined" ? "0" : INDEX),
            oAppInfo.IS_EDIT // Edit or Display Mode
        ];

        var child_process = parent.SPAWN('cscript.exe', aParam);

        child_process.stdout.on("data", function (data) {
            console.log(data.toString());
        }); // 실행 결과

        child_process.stderr.on("data", function (data) {
            console.error(data.toString());
        }); // 실행 >에러

    }; // end of oAPP.common.execControllerClass

    /************************************************************************
     * 세션타임아웃 후 전체 로그아웃 및 같은 세션 창 전체 닫기
     * **********************************************************************/
    oAPP.common.setSessionTimeout = function () {

        // 세션 타임 아웃 시, logoff 처리
        var sPath = parent.getServerPath() + '/logoff';

        fetch(sPath);

        fn_logoff_success('X');

    }; // end of oAPP.common.setSessionTimeout    

    /************************************************************************
     * APP 전체 대상 글로벌 Shortcut 지정하기
     * **********************************************************************/
    oAPP.common.fnSetGlobalShortcut = function () {

        var oShortcut = oAPP.attr.oShortcut;

        // 새창 띄우기
        oShortcut.add("Ctrl+N", () => {

            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            parent.onNewWindow();

        });

        // 브라우저 창 닫기
        oShortcut.add("Ctrl+W", () => {

            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            var oCurrWin = parent.REMOTE.getCurrentWindow();
            oCurrWin.close();

        });

        // 브라우저 zoom 기본설정
        oShortcut.add("Ctrl+0", () => {

            // Busy Indicator가 실행중이면 하위 로직 수행 하지 않는다.
            if (parent.getBusy() == 'X') {
                return;
            }

            // 브라우저 zoom을 0으로 설정            
            oAPP.fn.setBrowserZoomZero();

            // 설정된 zoom 값을 저장
            oAPP.fn.setPersonWinZoom("S");

        });

        // Busy 켜기
        oShortcut.add("Ctrl+Shift+X", () => {
            parent.setBusy('X');
        });

        // Busy 끄기
        oShortcut.add("Ctrl+Shift+Z", () => {
            parent.setBusy('');
        });

    }; // end of oAPP.common.fnSetGlobalShortcut

    /************************************************************************
     * APP 전체 대상 글로벌 Shortcut 삭제
     * **********************************************************************/
    oAPP.common.fnRemoveGlobalShortcut = function () {

        var oShortcut = parent.GLOBALSHORTCUT;

        oShortcut.unregisterAll();

    }; // end of oAPP.common.fnRemoveGlobalShortcut

    /**
     * Gif Busy Dialog
     * @param {Boolean} bIsOpen 
     * 
     * @param {Function} fnExecFunc 
     */
    oAPP.common.fnSetBusyDialog = function (bIsOpen) {

        const BusyDialogID = "u4aWsBusyDialog";

        var oDialog = sap.ui.getCore().byId(BusyDialogID);
        if (oDialog) {

            if (oDialog.isOpen() == bIsOpen) {
                return;
            }

            if (bIsOpen) {

                oDialog.open();

                // 작업표시줄에 progress bar 실행
                parent.setProgressBar("S", bIsOpen);

                return;
            }

            // 작업표시줄에 progress bar 중지
            parent.setProgressBar("S", bIsOpen);

            oDialog.close();

            return;

        }

        var sLoaderGif = PATH.join(APPPATH, "\\img\\loader.gif"),
            oBusyDialog = new sap.m.Dialog(BusyDialogID, {

                // properties
                showHeader: false,
                escapeHandler: function () {


                },

                // aggregations
                content: [

                    new sap.m.VBox({
                        justifyContent: sap.m.FlexJustifyContent.Center,
                        alignItems: sap.m.FlexAlignItems.Center,
                        items: [

                            new sap.m.Avatar({
                                customDisplaySize: "10rem",
                                customFontSize: "3rem",
                                displaySize: sap.m.AvatarSize.Custom,
                                src: sLoaderGif
                            }).addStyleClass("u4aWsAvatarBusy")

                        ]

                    })

                ]

            }).addStyleClass(BusyDialogID);

        if (oBusyDialog.isOpen() == bIsOpen) {
            return;
        }

        if (bIsOpen) {

            oBusyDialog.open();

            // 작업표시줄에 progress bar 실행
            parent.setProgressBar("S", bIsOpen);

            return;
        }

        // 작업표시줄에 progress bar 중지
        parent.setProgressBar("S", bIsOpen);

        oBusyDialog.close();

    }; // end of oAPP.common.fnSetBusyDialog

})(window, $, oAPP);

// application 초기 정보
function ajax_init_prc(oFormData, fn_callback) {

    var sPath = parent.getServerPath() + '/init_prc';

    parent.setBusy('X');

    sendAjax(sPath, oFormData, (oReturn) => {

        if (typeof fn_callback == "function") {
            fn_callback(oReturn);
        }

    });

} // end of ajax_init_prc

function sendAjax(sPath, oFormData, fn_success, bIsBusy, bIsAsync, meth, fn_error, bIsBlob) {

    // Default Values
    var busy = 'X',
        sMeth = 'POST',
        IsAsync = true;

    // if(typeof bIsBusy !== "undefined"){
    if (bIsBusy != null) {
        // Busy Indicator 실행
        busy = bIsBusy;
    }

    parent.setBusy(busy);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () { // 요청에 대한 콜백
        if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
            if (xhr.status === 200 || xhr.status === 201) {

                if (xhr.responseType == 'blob') {
                    if (typeof fn_success == "function") {
                        fn_success(xhr.response);
                    }

                    return;

                }

                var oReturn = xhr.responseText;

                if (oReturn == "") {

                    //fn_logoff_success('X');

                    oReturn = JSON.stringify({});
                }

                try {
                    var oResult = JSON.parse(oReturn);

                } catch (e) {

                    if (typeof fn_success == "function") {
                        fn_success(xhr.responseText);
                    }

                }

                // 로그인 티켓 만료되면 로그인 페이지로 이동한다.
                if (oResult.TYPE == "E") {

                    // error 콜백이 있다면 호출
                    if (typeof fn_error == "function") {
                        fn_error();
                    }

                    // 현재 같은 세션으로 떠있는 브라우저 창을 전체 닫고 내 창은 Login 페이지로 이동.
                    fn_logoff_success('X');
                    return;

                }

                if (typeof fn_success == "function") {
                    fn_success(oResult);
                }

            } else {

                // 서버 세션이 죽었다면 오류 메시지 뿌리고 10번 화면으로 이동한다.
                parent.setBusy('');

                var sCleanHtml = parent.setCleanHtml(xhr.responseText);

                parent.showMessage(sap, 20, 'E', sCleanHtml, fn_callback);

                function fn_callback() {

                    // error 콜백이 있다면 호출
                    if (typeof fn_error == "function") {
                        fn_error();
                    }

                    // 화면에 떠있는 Dialog 들이 있을 경우 모두 닫는다.
                    oAPP.fn.fnCloseAllWs20Dialogs();

                    // 10번 페이지로 이동
                    oAPP.fn.fnOnMoveToPage("WS10");

                }

            }
        }
    };

    // if(typeof meth !== "undefined"){
    if (meth != null) {
        sMeth = meth;
    }

    // if(typeof bIsAsync !== "undefined"){
    if (bIsAsync != null) {
        IsAsync = bIsAsync;
    }

    // test..
    xhr.withCredentials = true;

    // FormData가 없으면 GET으로 전송
    xhr.open(sMeth, sPath, IsAsync);

    // blob 파일일 경우
    if (bIsBlob == 'X') {
        xhr.responseType = 'blob';
    }

    if (oFormData) {
        xhr.send(oFormData);
    } else {
        xhr.send();
    }

} // end of sendAjax

// application unlock
function ajax_unlock_app(APPID, fn_callback) {

    var sPath = parent.getServerPath() + '/unlock_app';

    var oFormData = new FormData();
    oFormData.append('APPID', APPID);

    sendAjax(sPath, oFormData, (oReturn) => {

        if (typeof fn_callback == "function") {
            fn_callback(oReturn);
        }

    });

} // end of ajax_unlock_app

// logoff
function ajax_logoff() {

    parent.setBusy('X');

    var sPath = parent.getServerPath() + '/logoff';

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () { // 요청에 대한 콜백
        if (xhr.readyState === xhr.DONE) { // 요청이 완료되면

            if (xhr.status === 200 || xhr.status === 201) {

                parent.setBusy('');

                var sRes = xhr.responseText;

                // 로그아웃 버튼으로 호출 된 경우
                if (sRes == "") {

                    // 로그오프 성공시 타는 펑션
                    fn_logoff_success();

                    return;

                }

                // 세션이 이미 날라간 경우
                // SSO 만료일 경우.
                // 로그인 쪽으로 왔을 경우.
                var oResult = JSON.parse(sRes);

                if (oResult.TYPE == "E") {

                    //1. 전체 다 닫는다.
                    fn_logoff_success("X");
                    return;

                }

            } else {

                // 전체 브라우저를 닫는다.
                fn_logoff_success("X");

            }

        }

    };

    xhr.open('GET', sPath); // 메소드와 주소 설정
    xhr.send();

} // end of ajax_logoff

// 로그오프 성공시 타는 펑션
function fn_logoff_success(TYPE) {

    if (!TYPE) {

        fnServerSessionClose();

        lf_OK();

        return;
    }

    if (TYPE == 'X') {

        fnServerSessionClose();

        let sTitle = "Session Timeout",
            sDesc = "Please Try Login Again!",
            sIllustType = "tnt-SessionExpired",
            sIllustSize = sap.m.IllustratedMessageSize.Dialog;

        parent.setBusy("");

        oAPP.fn.fnShowIllustMsgDialog(sTitle, sDesc, sIllustType, sIllustSize, lf_OK);

        return;

    }

    function lf_OK() {

        // 로그인페이지로 이동..			
        parent.onMoveToPage("LOGIN");

        var currwin = parent.CURRWIN,
            webcon = currwin.webContents,
            sess = webcon.session;

        sess.clearStorageData([]);

    }

    parent.setBusy('');

} // end of fn_logoff_success

function fnServerSessionClose() {

    /**
     * Flow Logic..
     * 
     *	1. 현재 떠있는 창이 몇개 있는지 확인한다. 
     *	2. 내가 아닌 다른 창은 다 닫는다.
     *	3. 나는 로그인 화면으로 전환한다.
     */
    var sKey = parent.getSessionKey(),
        oMeBrows = parent.REMOTE.getCurrentWindow(); // 현재 나의 브라우저

    if (oMeBrows.isDestroyed()) {
        return;
    }

    var aBrowserList = parent.REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
        iBrowsLen = aBrowserList.length;

    for (var i = 0; i < iBrowsLen; i++) {

        var oBrows = aBrowserList[i];
        if (oBrows.isDestroyed()) {
            continue;
        }

        var oWebCon = oBrows.webContents;
        if (oWebCon == null) {
            continue;
        }

        var oWebPref = oWebCon.getWebPreferences();

        // session 정보가 없으면 skip.
        var sSessionKey = oWebPref.partition;
        if (!sSessionKey) {
            continue;
        }

        // 브라우저가 내 자신이라면 skip.
        if (oBrows.id == oMeBrows.id) {
            continue;
        }

        // 현재 브라우저의 session key 와 동일하지 않으면 (다른 서버창) skip.
        if (sKey != sSessionKey) {
            continue;
        }

        if (!oBrows.isDestroyed()) {
            oBrows.close();
        }

    }

    // 현재 세션에서 파생된 Childwindow를 닫는다.
    oAPP.fn.fnChildWindowClose();

    // EXAM MOVE 이벤트 해제
    parent.IPCMAIN.off('if-exam-move', oAPP.fn.fnIpcMain_if_exam_move);

    // IPCMAIN 이벤트 해제    
    parent.IPCMAIN.off('if-session-time', oAPP.fn.fnIpcMain_if_session_time);

    // 현재 브라우저에 설정된 서버 세션 체크 전파 IPC이벤트를 해제한다.
    parent.IPCRENDERER.off('if-server-session-propagation', oAPP.fn.fnIpcRender_if_server_session_propagation);

    window.removeEventListener("beforeunload", oAPP.main.fnBeforeunload);

    if (oAPP.attr._oWorker && oAPP.attr._oWorker.terminate) {
        oAPP.attr._oWorker.terminate();
        delete oAPP.attr._oWorker;
    }

    if (oAPP.attr._oServerWorker && oAPP.attr._oServerWorker) {
        oAPP.attr._oServerWorker.terminate();
        delete oAPP.attr._oServerWorker;
    }

}

// 어플리케이션 생성 후 체인지 모드로 가는 펑션
function onAppCrAndChgMode(sAppID) {

    var oAppInput = sap.ui.getCore().byId("AppNmInput"),
        oChgModeBtn = sap.ui.getCore().byId("appChangeBtn");

    if (!oAppInput && !oChgModeBtn) {
        return;
    }

    sAppID = sAppID.toUpperCase();

    oAppInput.setValue(sAppID);
    oChgModeBtn.firePress();

} // end of onAppCrAndChgMode

// Property Help Popup
function fn_PropHelpPopup(sUrl) {

    oAPP.fn.fnPropertyHelpPopup(sUrl);

}