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

        // 에디터 정보를 담는 구조
        var oEditorInfo = {
            OBJID: "STYLECSS1",
            OBJTY: "CS",
            OBJNM: "CSS"
        };

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

    }; // end of oAPP.fn.fnHmws20_30_10

    // Javascript Editor
    oAPP.fn.fnHmws20_30_20 = function (oEvent) {

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

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

    }; // end of oAPP.fn.fnHmws20_30_20

    // HTML Editor
    oAPP.fn.fnHmws20_30_30 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var oEditorInfo = {
            OBJID: "HTMLCODE1",
            OBJTY: "HM",
            OBJNM: "Html",
            DATA: ""
        }

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

    }; // end of oAPP.fn.fnHmws20_30_30

    // Error Page Editor
    oAPP.fn.fnHmws20_30_40 = function (oEvent) {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

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
     * [WS10] Close Browser
     ************************************************************************/
    oAPP.fn.fnWS10WMENU30_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

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

        oAPP.fn.fnWsOptionsPopupOpener();

    }; // end of oAPP.fn.fnWS10WMENU30_03

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

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

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

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

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

        // Editor Popup Open
        if (oAPP.fn.fnEditorPopupOpen) {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
            return;
        }

        oAPP.loadJs("fnEditorPopupOpen", function () {
            oAPP.fn.fnEditorPopupOpen(oEditorInfo);
        });

    }; // end of oAPP.fn.fnWS20WMENU30_03

    /************************************************************************
     * [WS20] Error Page Editor
     ************************************************************************/
    oAPP.fn.fnWS20WMENU30_04 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        // Error Page Editor Popup Open
        oAPP.fn.fnErrorPageEditorPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU30_04

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
     * [WS20] Close Browser
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_02 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        var oCurrWin = parent.REMOTE.getCurrentWindow();
        oCurrWin.close();

    }; // end of oAPP.fn.fnWS20WMENU40_02

    /************************************************************************
     * [WS20] User Profile
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_03 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

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
     * [WS20] Options...
     ************************************************************************/
    oAPP.fn.fnWS20WMENU40_05 = () => {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

        oAPP.fn.fnWsOptionsPopupOpener();

    }; // end of oAPP.fn.fnWS20WMENU40_05

    /************************************************************************
     * [WS20] Application Help
     ************************************************************************/
    oAPP.fn.fnWS20WMENU50_01 = function () {

        // Busy Indicator가 실행중이면 빠져나간다.
        if (parent.getBusy() == 'X') {
            return;
        }

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

    /***************************************************************************************************************************************************************
     **************************************** Test Menu.. **********************************************************************************************************     
     ***************************************************************************************************************************************************************/

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

    /************************************************************************
     * Document Popup
     ************************************************************************/
    oAPP.fn.fnWS20doc01 = function () {

        oAPP.fn.fnDocuPopupOpener();

    }; // end of oAPP.fn.fnWS20doc01


})(window, $, oAPP);