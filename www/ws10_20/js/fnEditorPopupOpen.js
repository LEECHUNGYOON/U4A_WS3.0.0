/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnEditorPopupOpen.js
 * - file Desc : CSS, JAVASCRIPT, HTML Editor
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";


    const
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        IPCMAIN = parent.IPCMAIN,
        PATH = parent.PATH,
        APP = parent.APP;

    /************************************************************************
     * 에디터 오픈 (html, css, javascript Editor)
     * **********************************************************************
     * @param {Object} oEditInfo
     * - 오픈 하려는 에디터의 타입 정보
     ************************************************************************/
    oAPP.fn.fnEditorPopupOpen = function (oEditInfo) {

        // 기존에 Editor 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        var oResult = oAPP.common.getCheckAlreadyOpenWindow(oEditInfo.OBJTY);
        if (oResult.ISOPEN) {
            return;
        }


        let oCurrWin = REMOTE.getCurrentWindow(),
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oAppInfo = parent.getAppInfo(),
            sBrowserTitle = oAppInfo.APPID + " - " + oEditInfo.OBJNM + " Editor";

        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/BrowserWindow/BrowserWindow-settings.json"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = sBrowserTitle;
        oBrowserOptions.autoHideMenuBar = true;

        oBrowserOptions.parent = oCurrWin;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.OBJTY = oEditInfo.OBJTY;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        oBrowserWindow.loadURL(`file://${parent.__dirname}/../ws10_20/editor/editorFrame.html`);

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            // 에디터 타입에 해당하는 데이터를 구한다.
            var oGetEditorData = oAPP.fn.fnGetEditorData(oEditInfo.OBJTY);

            // 에디터 타입에 맞는 데이터를 저장한다.
            oEditInfo.DATA = oGetEditorData && oGetEditorData.DATA ? oGetEditorData.DATA : "";

            var oEditorInfo = {
                APPINFO: oAppInfo,
                EDITORINFO: oEditInfo,
            };

            oBrowserWindow.webContents.send('if-editor-info', oEditorInfo);

        });

        // EDITOR의 저장을 위한 IPC 이벤트
        IPCMAIN.on("if-editor-save", oAPP.fn.fnIpcMain_EditorSave);

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            // IPCMAIN 이벤트 해제
            IPCMAIN.removeListener("if-editor-save", oAPP.fn.fnIpcMain_EditorSave);

        });

    }; // end of oAPP.fn.fnEditorPopupOpen

    /************************************************************************
     * Editor 팝업의 저장 버튼 이벤트를 수행하기 위한 IPCMAIN 이벤트
     * **********************************************************************/
    oAPP.fn.fnIpcMain_EditorSave = function (event, res) {

        var BROWSKEY = parent.getBrowserKey();

        if (BROWSKEY != res.BROWSKEY) {
            return;
        }

        // 저장할 데이터
        var oSaveData = res.SAVEDATA;

        // CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 저장
        oAPP.fn.fnSetEditorData(oSaveData);

        // 어플리케이션 정보에 변경 플래그 
        parent.setAppChange(res.IS_CHAG);

    }; // end of oAPP.fn.fnIpcMain_EditorSave

    /************************************************************************
     * CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 구하기
     ************************************************************************
     * @param {String}  OBJTY
     * - 에디터 타입
     * 
     * @return {Object || undefined} 
     * - 에디터 타입에 따른 에디터 정보 리턴
     * - 에디터 타입에 따른 에디터 정보가 없으면 undefined
     ************************************************************************/
    oAPP.fn.fnGetEditorData = function (OBJTY) {

        // 세개의 오브젝트 중에 하나라도 없으면 빠져나감.
        if (!OBJTY || !oAPP.DATA || !oAPP.DATA.APPDATA || !oAPP.DATA.APPDATA.T_EDIT) {
            return;
        }

        // 에디터 데이터가 Array 가 아니면 빠져나감.
        var aEditorData = oAPP.DATA.APPDATA.T_EDIT;
        if (!aEditorData instanceof Array) {
            return;
        }

        return aEditorData.find(oEditorData => oEditorData.OBJTY == OBJTY);

    }; // end of oAPP.fn.fnGetEditorDvata

    /************************************************************************
     * CSS & JAVASCRIPT && HTML 각 에디터 타입별 해당 데이터 저장
     ************************************************************************
     * @param {Object}  oSaveData
     * - 저장할 에디터 정보와 데이터     
     ************************************************************************/
    oAPP.fn.fnSetEditorData = function (oSaveData) {

        // 세개의 오브젝트 중에 하나라도 없으면 빠져나감.
        if (!oAPP.DATA || !oAPP.DATA.APPDATA || !oAPP.DATA.APPDATA.T_EDIT) {
            return;
        }

        // 에디터 데이터가 Array 가 아니면 빠져나감.
        var aEditorData = oAPP.DATA.APPDATA.T_EDIT;
        if (!aEditorData instanceof Array) {
            return;
        }

        var oBeforeData = oAPP.fn.fnGetEditorData(oSaveData.OBJTY);

        if (typeof oBeforeData === "undefined") {

            oBeforeData = {};
            oBeforeData.OBJID = oSaveData.OBJID;
            oBeforeData.OBJTY = oSaveData.OBJTY;
            oBeforeData.DATA = oSaveData.DATA;

            oAPP.DATA.APPDATA.T_EDIT.push(oBeforeData);
        }

        oBeforeData.DATA = oSaveData.DATA;

        switch (oSaveData.OBJTY) {
            case "CS":
                oAPP.attr.ui.frame.contentWindow.setCSSSource(oSaveData.DATA);
                break;
        }

    }; // end of oAPP.fn.fnSetEditorData

})(window, $, oAPP);