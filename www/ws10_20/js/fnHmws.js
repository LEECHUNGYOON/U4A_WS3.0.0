/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnHmws.js
 * - file Desc : 브라우저 상단 메뉴 이벤트
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APPCOMMON = oAPP.common,
        REMOTEMAIN = parent.REMOTEMAIN;

    // App. Package Change
    oAPP.fn.fnHmws10_10_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }


    };

    // App. Importing
    oAPP.fn.fnHmws10_10_20_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }


    };

    // App. Exporting
    oAPP.fn.fnHmws10_10_20_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };

    // U4A Help Document
    oAPP.fn.fnHmws10_10_30 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };

    // U4A Shortcut Create
    oAPP.fn.fnHmws10_10_40_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };

    // QR Code Maker
    oAPP.fn.fnHmws10_10_40_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };

    // new Window
    oAPP.fn.fnHmws10_30_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        parent.onNewWindow();
    };

    // Theme Designer
    oAPP.fn.fnHmws20_10_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }



    };

    // Font Style Wizard
    oAPP.fn.fnHmws20_10_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnFontStyleWizardPopupOpener();

    }; // end of oAPP.fn.fnHmws20_10_20

    // Select Browser Type
    oAPP.fn.fnHmws20_20_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnSelectBrowserPopupOpen) {
            oAPP.fn.fnSelectBrowserPopupOpen();
            return;
        }

        oAPP.loadJs("fnSelectBrowserPopupOpen", function () {
            oAPP.fn.fnSelectBrowserPopupOpen();
        });

    }; // end of oAPP.fn.fnHmws20_20_10    

    // CSS Editor
    oAPP.fn.fnHmws20_30_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // 에디터 정보를 담는 구조
        var oEditorInfo = {
            OBJID: "STYLECSS1",
            OBJTY: "CS",
            OBJNM: "CSS"
        };

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnHmws20_30_10

    // Javascript Editor
    oAPP.fn.fnHmws20_30_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oEditorInfo = {
            OBJID: "SCRIPTCODE1",
            OBJTY: "JS",
            OBJNM: "Javascript",
            DATA: ""
        }

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnHmws20_30_20

    // HTML Editor
    oAPP.fn.fnHmws20_30_30 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        var oEditorInfo = {
            OBJID: "HTMLCODE1",
            OBJTY: "HM",
            OBJNM: "Html",
            DATA: ""
        }

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnHmws20_30_30

    // Error Page Editor
    oAPP.fn.fnHmws20_30_40 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // Error Page Editor Popup Open
        oAPP.fn.fnErrorPageEditorPopupOpener();

    }; // end of oAPP.fn.fnHmws20_30_40

    // // New Browser <-- fnHmws10_30_10 과 통합
    // oAPP.fn.fnHmws20_40_10 = function(oEvent) {
    //     parent.onNewWindow();
    // };

    // Close Browser
    oAPP.fn.fnHmws20_40_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var oCurrWin = parent.REMOTE.getCurrentWindow();
        oCurrWin.close();

    };

    // User Profile
    oAPP.fn.fnHmws20_40_30 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };

    // Logoff
    oAPP.fn.fnHmws20_40_40 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.events.ev_Logout();
    };

    // Application Help
    oAPP.fn.fnHmws20_50_10 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }


    };

    // Settings..
    oAPP.fn.fnHmws20_50_20 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    };


    /***************************************************************************************************************************************************************
     * 신규 ********************************************************************************************************************************************************     
     ***************************************************************************************************************************************************************/

    /************************************************************************
     * [WS10] App. Package Change
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_01 = () => {

        // Trial Version Check
        if (oAPP.fn.fnOnCheckIsTrial()) {
            return;
        }

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // application명 정합성 체크
        let bCheckAppNm = oAPP.fn.fnCheckAppName();
        if (!bCheckAppNm) {
            return;
        }

        let sAppId = APPCOMMON.fnGetModelProperty("/WS10/APPID");

        if (oAPP.fn.changeAppPackagePopup) {
            oAPP.fn.changeAppPackagePopup(sAppId);
            return;
        }

        $.getScript("design/js/changeAppPackagePopup.js", function () {
            oAPP.fn.changeAppPackagePopup(sAppId);
        });

    }; // end of oAPP.fn.fnWS10WMENU10_01

    /************************************************************************
     * [WS10] Import
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_02_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnWsImportExportPopupOpener("IMPORT");

    }; // end of oAPP.fn.fnWS10WMENU10_02_01

    /************************************************************************
     * [WS10] Export
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_02_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnWsImportExportPopupOpener("EXPORT");

    }; // end of oAPP.fn.fnWS10WMENU10_02_02

    /************************************************************************
     * [WS10] U4A Help Document
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_03 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnU4AHelpDocuPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU10_03

    /************************************************************************
     * [WS10] About U4A
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_05 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnAboutU4APopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU10_05

    /************************************************************************
     * [WS10] Select Browser Type
     ************************************************************************/
    oAPP.fn.fnWS10WMENU20_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnSelectBrowserPopupOpen) {
            oAPP.fn.fnSelectBrowserPopupOpen();
            return;
        }

        oAPP.loadJs("fnSelectBrowserPopupOpen", function () {
            oAPP.fn.fnSelectBrowserPopupOpen();
        });

    }; // end of oAPP.fn.fnWS10WMENU20_01

    /************************************************************************
     * [WS10] Video Record
     ************************************************************************/
    oAPP.fn.fnWS10WMENU20_03 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // // busy 키고 Lock 걸기
        // oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnOpenVideoRecord();

    }; // end of oAPP.fn.fnWS10WMENU20_03

    // /************************************************************************
    //  * [WS10] Icon List
    //  ************************************************************************/
    // oAPP.fn.fnWS10WMENU20_04 = () => {

    //     // Busy Indicator가 실행중이면 빠져나간다.
    //     if (parent.getBusy() == 'X') {
    //         return;
    //     }

    //     oAPP.fn.fnIconPreviewPopupOpener();

    // }; // end of oAPP.fn.fnWS10WMENU20_04

    /************************************************************************
    * [WS20] Icon List
    ************************************************************************/
    oAPP.fn.fnWS10WMENU20_04_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }        

        oAPP.fn.fnIconPreviewPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU20_04_01

    /************************************************************************
     * [WS20] Image Icons
     ************************************************************************/
    oAPP.fn.fnWS10WMENU20_04_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnIllustedMsgPrevPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU20_04_02

    /************************************************************************
     * [WS10] Source Pattern
     ************************************************************************/
    oAPP.fn.fnWS10WMENU20_05 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnSourcePatternPopupOpener(); // [async]

    }; // end of oAPP.fn.fnWS10WMENU20_05

    /************************************************************************
     * [WS10] New Window
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        parent.onNewWindow();

    }; // end of oAPP.fn.fnWS10WMENU30_01

    /************************************************************************
     * [WS10] Close Window
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // 브라우저의 닫기 버튼 눌렀다는 플래그
        oAPP.attr.isPressWindowClose = "X";

        var oCurrWin = parent.REMOTE.getCurrentWindow();
        oCurrWin.close();

    }; // end of oAPP.fn.fnWS10WMENU30_02

    /************************************************************************
     * [WS10] Options..
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_03 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnWsOptionsPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU30_03

    /************************************************************************
     * [WS10] Logoff
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_04 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.events.ev_Logout();

    }; // end of oAPP.fn.fnWS10WMENU30_04    

    /************************************************************************
     * [WS10] administrator
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_06 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        APPCOMMON.fnAdminHeaderMenu();

    }; // end of oAPP.fn.fnWS10WMENU30_06

    /************************************************************************
     * [WS10] 개발자 툴 열기
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_06_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnOpenDevTool();

    }; // end of oAPP.fn.fnWS10WMENU30_06_01

    /************************************************************************
     * [WS10] Release Note..
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_06_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnReleaseNotePopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU30_06_02

    /************************************************************************
     * [WS10] Error log
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_06_03 = async () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        parent.setBusy("X");

        let oResult = await parent.WSLOG.openLOG(true);
        console.log(oResult);

        parent.setBusy("");

    }; // end of oAPP.fn.fnWS10WMENU30_06_03

    /************************************************************************
     * [WS10] System Information
     ************************************************************************/    
    oAPP.fn.fnWS10WMENU30_07 = function(){

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnServerInfoDialogOpen();        

    }; // end of oAPP.fn.fnWS10WMENU30_07

    /************************************************************************
     * [WS10] U4A Help Document
     ************************************************************************/
    oAPP.fn.fnWS10WMENU50_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnU4AHelpDocuPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU50_01

    /************************************************************************
     * [WS10] U4A Shortcut create
     ************************************************************************/
    oAPP.fn.fnWS10WMENU10_04_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }   

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnAppShortCutDownPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU10_04_01

    /************************************************************************
     * [WS20] Theme Designer
     ************************************************************************/
    oAPP.fn.fnWS20WMENU10_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    }; // end of oAPP.fn.fnWS20WMENU10_01

    /************************************************************************
     * [WS20] Font Style Wizard
     ************************************************************************/
    oAPP.fn.fnWS20WMENU10_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnFontStyleWizardPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU10_02

    /************************************************************************
     * [WS20] UI5 Predefined Css
     ************************************************************************/
    oAPP.fn.fnWS20WMENU10_03 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // u4a workspace 3.4.2 - sp2 이상일 경우는 신규 CSS 팝업을 띄운다
        if(oAPP.common.checkWLOList("C", "UHAK900788")){

            oAPP.fn.fnUI5PreCssPopupOpener();
            return;
        }

        oAPP.fn.fnUI5PredefinedCssPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU10_03

    /************************************************************************
     * [WS20] Select Browser Type
     ************************************************************************/
    oAPP.fn.fnWS20WMENU20_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        if (oAPP.fn.fnSelectBrowserPopupOpen) {
            oAPP.fn.fnSelectBrowserPopupOpen();
            return;
        }

        oAPP.loadJs("fnSelectBrowserPopupOpen", function () {
            oAPP.fn.fnSelectBrowserPopupOpen();
        });

    }; // end of oAPP.fn.fnWS20WMENU20_01

    /************************************************************************
     * [WS20] OTR Manager Popup
     ************************************************************************/
    oAPP.fn.fnWS20WMENU20_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnOtrManagerPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU20_02

    /************************************************************************
     * [WS20] Video Record
     ************************************************************************/
    oAPP.fn.fnWS20WMENU20_03 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // // busy 키고 Lock 걸기
        // oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnOpenVideoRecord();

    }; // end of oAPP.fn.fnWS20WMENU20_03

    // /************************************************************************
    //  * [WS20] Icon List
    //  ************************************************************************/
    // oAPP.fn.fnWS20WMENU20_04 = () => {

    //     // Busy Indicator가 실행중이면 빠져나간다.
    //     if (parent.getBusy() == 'X') {
    //         return;
    //     }

    //     oAPP.fn.fnIconPreviewPopupOpener();

    // }; // end of oAPP.fn.fnWS20WMENU20_04

    /************************************************************************
    * [WS20] Icon List
    ************************************************************************/
    oAPP.fn.fnWS20WMENU20_04_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnIconPreviewPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU20_04_01

    /************************************************************************
     * [WS20] Image Icons
     ************************************************************************/
    oAPP.fn.fnWS20WMENU20_04_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnIllustedMsgPrevPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU20_04_02

    /************************************************************************
     * [WS20] Source Pattern 
     ************************************************************************/
    oAPP.fn.fnWS20WMENU20_05 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnSourcePatternPopupOpener(); // [async]

    }; // end of oAPP.fn.fnWS20WMENU20_05

    /************************************************************************
     * [WS20] Editor
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // 에디터 정보를 담는 구조
        var oEditorInfo = {
            OBJID: "STYLECSS1",
            OBJTY: "CS",
            OBJNM: "CSS"
        };

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnWS20WMENU30_01

    /************************************************************************
     * [WS20] Javascript Editor
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var oEditorInfo = {
            OBJID: "SCRIPTCODE1",
            OBJTY: "JS",
            OBJNM: "Javascript",
            DATA: ""
        }

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnWS20WMENU30_02

    /************************************************************************
     * [WS20] HTML Editor
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_03 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var oEditorInfo = {
            OBJID: "HTMLCODE1",
            OBJTY: "HM",
            OBJNM: "Html",
            DATA: "",
        }

        oAPP.fn.fnEditorPopupOpener(oEditorInfo);

    }; // end of oAPP.fn.fnWS20WMENU30_03

    /************************************************************************
     * [WS20] Error Page Editor
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_04 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        // Error Page Editor Popup Open
        oAPP.fn.fnErrorPageEditorPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU30_04

    /************************************************************************
     * [WS20] Skeleton Scr Setting
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_05 = () => {

        oAPP.fn.prevSetSkeletonScreen();

    }; // end of oAPP.fn.fnWS20WMENU30_05

    /************************************************************************
     * [WS20] new Window
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        parent.onNewWindow();

    }; // end of oAPP.fn.fnWS20WMENU40_01

    /************************************************************************
     * [WS20] Close Window
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // 브라우저의 닫기 버튼 눌렀다는 플래그
        oAPP.attr.isPressWindowClose = "X";

        var oCurrWin = parent.REMOTE.getCurrentWindow();
        oCurrWin.close();

    }; // end of oAPP.fn.fnWS20WMENU40_02

    /************************************************************************
     * [WS20] Options
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_03 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnWsOptionsPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU40_03

    /************************************************************************
     * [WS20] Logoff
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_04 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.events.ev_Logout();

    }; // end of oAPP.fn.fnWS20WMENU40_04

    /************************************************************************
     * [WS20] Release Note..
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_06_02 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnReleaseNotePopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU40_06_02

    // /************************************************************************
    //  * [WS20] Administrator
    //  ************************************************************************/
    // oAPP.fn.fnWS20WMENU40_06 = () => {

    //     // Busy Indicator가 실행중이면 빠져나간다.
    //     if (parent.getBusy() == 'X') {
    //         return;
    //     }

    //     APPCOMMON.fnAdminHeaderMenu();

    // }; // end of oAPP.fn.fnWS20WMENU40_06

    /************************************************************************
     * [WS20] 개발자 툴 열기
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_06_01 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnOpenDevTool();

    }; // end of oAPP.fn.fnWS20WMENU40_06_01

    /************************************************************************
     * [WS20] Error Log
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_06_03 = async () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        parent.setBusy("X");

        await parent.WSLOG.openLOG(true);

        parent.setBusy("");

    }; // end of oAPP.fn.fnWS20WMENU40_06_03

    /************************************************************************
     * [WS10] System Information
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_07 = function(){

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnServerInfoDialogOpen(); 

    }; // end of oAPP.fn.fnWS20WMENU40_07

    /************************************************************************
     * [WS20] U4A Help Document
     ************************************************************************/
    oAPP.fn.fnWS20WMENU50_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnU4AHelpDocuPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU50_01

    /************************************************************************
     * [WS20] Settings
     ************************************************************************/
    oAPP.fn.fnWS20WMENU50_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

    }; // end of oAPP.fn.fnWS20WMENU50_02

    /************************************************************************
     * [WS20] Current App Technical Document
     ************************************************************************/
    oAPP.fn.fnWS20WMENU50_03 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // busy 키고 Lock 걸기
        oAPP.common.fnSetBusyLock("X");

        oAPP.fn.fnDocuPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU50_03

    /***************************************************************************************************************************************************************
     **************************************** Test Menu.. **********************************************************************************************************     
     ***************************************************************************************************************************************************************/

    /************************************************************************
     * USP (U4A Server Page)
     ************************************************************************/
    oAPP.fn.fnWS10Test96 = () => {

        oAPP.fn.fnTest96();

    }; // end of oAPP.fn.fnWS10Test96

    /************************************************************************
     * Busy 강제실행
     ************************************************************************/
    oAPP.fn.fnWS10Test90 = function () {

        oAPP.fn.fnTest90();

    }; // end of oAPP.fn.fnWS10Test90

    /************************************************************************
     * Busy 강제종료
     ************************************************************************/
    oAPP.fn.fnWS10Test99 = function () {

        oAPP.fn.fnTest99();

    }; // end of oAPP.fn.fnWS10Test99

    /************************************************************************
     * 세션 끊기
     ************************************************************************/
    oAPP.fn.fnWS10Test98 = function () {

        oAPP.fn.fnTest98();

    }; // end of oAPP.fn.fnWS10Test98

    /************************************************************************
     * 개발툴
     ************************************************************************/
    oAPP.fn.fnWS10Test97 = function () {

        oAPP.fn.fnTest97();

    }; // end of oAPP.fn.fnWS10Test97

    /************************************************************************
     * CTS Popup
     ************************************************************************/
    oAPP.fn.fnWS10Test95 = function () {

        oAPP.fn.fnTest95();

    }; // end of oAPP.fn.fnWS10Test95

    /************************************************************************
     * 잘못된 Url 호출 테스트
     ************************************************************************/
    oAPP.fn.fnWS10Test94 = function () {

        oAPP.fn.fnTest94();

    }; // end of oAPP.fn.fnWS10Test94

    /************************************************************************
     * abap 펑션 버젼 확인
     ************************************************************************/
    oAPP.fn.fnWS10Test93 = () => {

        let sUrl = "https://www.sapdatasheet.org/abap/func/index-a.html";
        _callbrowser(sUrl);

    };

    /************************************************************************
     * abap syntax 버젼 확인
     ************************************************************************/
    oAPP.fn.fnWS10Test92 = () => {

        let sUrl = "https://help.sap.com/doc/abapdocu_740_index_htm/7.40/en-US/index.htm";
        _callbrowser(sUrl);

    };

    /************************************************************************
     * Source Pattern Popup
     ************************************************************************/
    oAPP.fn.fnWS10Test91 = () => {

        oAPP.fn.fnSourcePatternPopupOpener(); // [async]

    };

    /************************************************************************
     * IconPreviewPopup
     ************************************************************************/
    oAPP.fn.fnWS10Test89 = () => {

        oAPP.fn.fnIconPreviewPopupOpener();

    };

    /************************************************************************
    * IconPreviewPopup (callback)
    ************************************************************************/
    oAPP.fn.fnWS10Test88 = () => {

        parent.setBusy("X");

        oAPP.fn.fnIconPreviewPopupOpener(function (e) {

            if (e.RETCD === "C") { // C : 취소
                parent.setBusy("");
                return;
            }

            sap.m.MessageToast.show(e.RTDATA);

            parent.setBusy("");

        });

    };

    function _callbrowser(sUrl) {

        var SPAWN = parent.SPAWN, // pc 제어하는 api
            aComm = []; // 명령어 수집

        var oDefBrows = APPCOMMON.fnGetModelProperty("/DEFBR"),
            sSelectedBrows = oDefBrows.find(a => a.SELECTED == true);

        if (!sSelectedBrows || !sSelectedBrows?.INSPATH) {

            // 설치된 브라우저가 없습니다 오류 메시지
            let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "333"); // Installed browser information not found.
            parent.showMessage(sap, 20, 'E', sMsg);

            return;
        }

        // 실행전 명령어 수집
        aComm.push(sUrl);

        // APP 실행		
        SPAWN(sSelectedBrows.INSPATH, aComm, { detached: true });

    }

    /************************************************************************
     * Busy 강제실행
     ************************************************************************/
    oAPP.fn.fnWS20Test90 = function () {

        oAPP.fn.fnTest90();

    }; // end of oAPP.fn.fnWS20Test90

    /************************************************************************
     * Busy 강제종료
     ************************************************************************/
    oAPP.fn.fnWS20Test99 = function () {

        oAPP.fn.fnTest99();

    }; // end of oAPP.fn.fnWS20Test99

    /************************************************************************
     * 로그아웃 (세션 죽이기)
     ************************************************************************/
    oAPP.fn.fnWS20Test98 = function () {

        oAPP.fn.fnTest98();

    }; // end of oAPP.fn.fnWS20Test98

    /************************************************************************
     * 개발툴 실행
     ************************************************************************/
    oAPP.fn.fnWS20Test97 = function () {

        oAPP.fn.fnTest97();

    }; // end of oAPP.fn.fnWS20Test97

    /************************************************************************
     * 스크립트 오류
     ************************************************************************/
    oAPP.fn.fnWS20Test96 = () => {

        TEST();

    }; // end of oAPP.fn.fnWS20Test96

    /************************************************************************
     * sample script download Popup
     ************************************************************************/
    oAPP.fn.fnWS20Test94 = () => {

        //DAMI에서 사용할 샘플파일 다운로드 팝업 function이 존재하는경우.
        if (typeof oAPP.fn.callDAMISampleDownloadPopup !== "undefined") {
            //DAMI에서 사용할 샘플파일 다운로드 팝업 호출.
            oAPP.fn.callDAMISampleDownloadPopup();
            return;
        }

        //DAMI에서 사용할 샘플파일 다운로드 팝업 function이 존재하지 않는경우 script 호출.
        oAPP.fn.getScript("design/js/callDAMISampleDownloadPopup", function () {
            //DAMI에서 사용할 샘플파일 다운로드 팝업 호출.
            oAPP.fn.callDAMISampleDownloadPopup();
        });

    }; // end of oAPP.fn.fnWS20Test94

    /************************************************************************
     * CTS popup Test
     ************************************************************************/
    oAPP.fn.fnWS20Test95 = function () {

        oAPP.fn.fnTest95();

    }; // end of oAPP.fn.fnWS20Test95    

    /************************************************************************
     * Property 도움말 테스트
     ************************************************************************/
    oAPP.fn.fnWS20Test91 = function () {

        oAPP.fn.fnTest91();

    }; // end of oAPP.fn.fnWS20Test91


    // /************************************************************************
    //  * Document Popup
    //  ************************************************************************/
    // oAPP.fn.fnWS20doc01 = function () {

    //     oAPP.fn.fnDocuPopupOpener();

    // }; // end of oAPP.fn.fnWS20doc01


})(window, $, oAPP);