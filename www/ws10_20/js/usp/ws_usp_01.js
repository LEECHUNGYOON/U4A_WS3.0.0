/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp_01.js
 * - file Desc : u4a ws usp sub
 ************************************************************************/
(function (window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common,
        APP = parent.APP,
        FS = parent.FS,
        SESSKEY = parent.getSessionKey(),
        BROWSKEY = parent.getBrowserKey(),
        CURRWIN = parent.CURRWIN,
        REMOTE = parent.REMOTE,
        REMOTEMAIN = parent.REMOTEMAIN,
        PATH = parent.PATH,
        IPCMAIN = parent.IPCMAIN,
        WSUTIL = parent.WSUTIL;

    var gfSelectRowUpdate;

    // /***************************************************************************************
    // * [WS30] USP TREE에서 현재 선택한 Node의 상위 또는 하위 형제 Node의 접힘 펼침 정보를 구한다.
    // ***************************************************************************************
    // * @param {sap.ui.table.TreeTable} oTreeTable
    // * - 좌측 Usp Tree Instance
    // *
    // * @param {Array} aNodes
    // * - 현재 선택한 Node의 형제들 정보
    // *
    // * @param {Integer} iCurrIndex
    // * - 현재 선택한 Node의 Index 정보
    // *
    // * @param {Boolean} bIsUp
    // * - 현재 선택한 Node의 상위 형제의 펼침 상태 정보를 구할지에 대한 정보
    // * - ex) true : 상위 펼침 상태 정보
    // *       false: 하위 펼침 상태 정보
    // *
    // * @return {Boolean}
    // * - true : 펼침
    // * - false: 접힘
    // ***************************************************************************************/
    // function fnIsExpandedNode(oTreeTable, aNodes, iCurrIndex, bIsUp) {

    //     var oMoveNode = (bIsUp == true ? aNodes[iCurrIndex - 1] : aNodes[iCurrIndex + 1]),
    //         aRows = oTreeTable.getRows(),
    //         iRowLength = aRows.length;

    //     for (var i = 0; i < iRowLength; i++) {

    //         var oRow = aRows[i],
    //             oRowCtx = oRow.getBindingContext();

    //         if (!oRowCtx) {
    //             continue;
    //         }

    //         if (oMoveNode.OBJKY !== oRowCtx.getObject("OBJKY")) {
    //             continue;
    //         }

    //         return oTreeTable.isExpanded(i);

    //     }

    // } // end of fnIsExpandedUpNode

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Integer} pIndex
     * - 현재 선택한 Node의 Index 정보
     * 
     * @param {Integer} pMoveIndex
     * - 이동할 Index
     **************************************************************************/
    oAPP.fn.fnSetUspTreeNodeMove = (oTreeTable, pSelIndex, pMoveIndex) => {

        zconsole.log("Tree Node Move Position");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),

            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터

            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 이동하려는 Node의 위치와 이동할 Index가 같으면 이동할 필요가 없으므로 빠져나간다.
        if (iFindIndex == (pMoveIndex - 1)) {
            return;
        }

        // USPTREE 이전 데이터 수집
        if (!oAPP.attr.oBeforeUspTreeData) {

            oAPP.attr.oBeforeUspTreeData = jQuery.extend(true, [], oCtxModel.getProperty("/WS30/USPTREE"));

        }

        var iNodeLength = oResult.Nodes.length, // 같은 노드의 갯수
            iMoveIndex = pMoveIndex;
        // 이동 하려는 위치

        // 이동하려는 위치가 노드의 갯수보다 클 경우에는
        // 이동하려는 위치값을 노드의 총 갯수로 지정
        if (iNodeLength <= pMoveIndex - 1) {
            iMoveIndex = iNodeLength;
        }

        // 최종적으로 현재 이동하려는 노드와 이동할 index가 같으면 빠져나간다.
        if (iFindIndex == (iMoveIndex - 1)) {
            return;
        }

        var aItem = oResult.Nodes.splice(iFindIndex, 1),
            oMeItem = aItem[0];
        // 선택한 Node를 추출

        // 선택한 Node를 이전 위치에서 위로 이동 시킨다.
        oResult.Nodes.splice(iMoveIndex - 1, 0, oMeItem);

        // 변경한 정보를 갱신한다.
        oCtxModel.setProperty(oResult.Path, oResult.Nodes, oSelectedCtx, true);

        // 이동한 Node에 선택 표시를 하기 위한 이벤트 걸기
        gfSelectRowUpdate = _fnUspNodeSetSelectedIndex.bind(this, oMeItem);

        oTreeTable.attachRowsUpdated(gfSelectRowUpdate);

        // 앱 변경 플래그
        oAPP.fn.setAppChangeWs30("X");

    };
    // end of oAPP.fn.fnSetUspTreeNodeMove

    /**************************************************************************
     * [WS30] USP Tree의 위로 이동
     **************************************************************************
     * @param {sap.ui.table.TreeTable} oTreeTable
     * - 좌측 Usp Tree Instance
     * 
     * @param {Integer} pIndex
     * - 현재 선택한 Node의 Index 정보
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveUp = (oTreeTable, pSelIndex) => {

        console.log("Tree Node Up");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY);

        // 현재 선택한 Node가 최상위 일 경우는 빠져나간다.
        if (iFindIndex == 0) {
            return;
        }

        var pMoveIndex = iFindIndex;

        oAPP.fn.fnSetUspTreeNodeMove(oTreeTable, pSelIndex, pMoveIndex);

    };
    // end of oAPP.fn.fnUspTreeNodeMoveUp

    /**************************************************************************
     * [WS30] USP Tree의 아래로 이동
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMoveDown = (oTreeTable, pSelIndex) => {

        console.log("Tree Node Down");

        var oSelectedCtx = oTreeTable.getContextByIndex(pSelIndex), // 현재 선택한 Node
            oCtxModel = oSelectedCtx.getModel(),
            sSelectedBindPath = oSelectedCtx.sPath, // 현재 선택한 Node의 바인딩 패스
            oSelectedData = oCtxModel.getProperty(sSelectedBindPath), // 현재 선택한 Node에 바인딩된 데이터
            oResult = oAPP.fn._fnFindModelData(sSelectedBindPath),
            iFindIndex = oResult.Nodes.findIndex(arr => arr.OBJKY == oSelectedData.OBJKY),
            iNodeLength = oResult.Nodes.length;

        // 현재 선택한 Node가 최하위 일 경우는 빠져나간다.
        if (iFindIndex == iNodeLength - 1) {
            return;
        }

        var pMoveIndex = iFindIndex + 2;

        oAPP.fn.fnSetUspTreeNodeMove(oTreeTable, pSelIndex, pMoveIndex);

    }; // end of oAPP.fn.fnUspTreeNodeMoveDown

    // 이동한 Node에 선택 표시를 하기 위한 이벤트 걸기
    function _fnUspNodeSetSelectedIndex(oMeItem, oEvent) {

        console.log("_fnUspNodeSetSelectedIndex");

        var oTreeTable = oEvent.getSource(),
            aRows = oTreeTable.getRows(),
            iRowLength = aRows.length;

        for (var i = 0; i < iRowLength; i++) {

            var oRow = aRows[i];

            if (oRow.isEmpty()) {
                break;
            }

            var oCtx = oRow.getBindingContext(),
                oRowData = oCtx.getModel().getProperty(oCtx.getPath()),

                // Row의 Object Key
                sOBJKY = oRowData.OBJKY;

            // 현재 순서의 Row와 선택한 Row가 같을 경우
            if (sOBJKY === oMeItem.OBJKY) { // 현재 순서의 Row Index를 구한다.
                var iIndex = oRow.getIndex();

                // 현재 순서의 Row에 라인선택 설정
                oTreeTable.setSelectedIndex(iIndex);

                // oTreeTable.setFirstVisibleRow(iIndex);

                // RowUpdate 이벤트를 해제 한다.
                oTreeTable.detachRowsUpdated(gfSelectRowUpdate);

                gfSelectRowUpdate = undefined;

                return;

            }

        }

        // 호출 횟수 count
        if (typeof gfSelectRowUpdate._callCount === "undefined") {
            gfSelectRowUpdate._callCount = 0;
        } else {
            gfSelectRowUpdate._callCount++;
        }

        // 혹시라도 RowUpdate 호출 횟수가 5회 이상이면
        // 무한루프를 막기 위한 조치..
        if (gfSelectRowUpdate._callCount >= 5) {
            oTreeTable.detachRowsUpdated(gfSelectRowUpdate);
            gfSelectRowUpdate = undefined;
            return;
        }

        if (typeof gfSelectRowUpdate.iRowLength === "undefined") {
            gfSelectRowUpdate.iRowLength = 0;
        } else {
            gfSelectRowUpdate.iRowLength += iRowLength;
        }

        // 스크롤을 이동하여 다시 찾는다.
        oTreeTable.setFirstVisibleRow(gfSelectRowUpdate.iRowLength);

        setTimeout(() => {
            oTreeTable.fireRowsUpdated(oEvent, oMeItem);
        }, 0);

    }
    // end of _fnUspNodeSetSelectedIndex

    /**************************************************************************
     * [WS30] USP Tree의 이전 선택한 UspTree Data 글로벌 변수 초기화
     **************************************************************************/
    oAPP.fn.fnClearOnBeforeUspTreeData = () => {

        if (!oAPP.attr.oBeforeUspTreeData) {
            return;
        }

        delete oAPP.attr.oBeforeUspTreeData;

    };
    // end of oAPP.fn.fnClearOnBeforeUspTreeData

    /**************************************************************************
     * [WS30] USP Tree의 Node 이동 팝업
     **************************************************************************/
    oAPP.fn.fnUspTreeNodeMovePosition = (oTreeTable, pIndex) => {

        var sBindRootPath = "/WS30/MOVEPOS",
            oCtx = oTreeTable.getContextByIndex(pIndex);

        if (!oCtx) {
            return;
        }

        var oData = oTreeTable.getModel().getProperty(oCtx.sPath),
            oInitData = {
                SELIDX: pIndex,
                STEPVAL: 1,
                STEPVS: sap.ui.core.ValueState.None,
                STEPVST: ""
            };

        // USP 생성 팝업의 초기 데이터 모델 세팅
        APPCOMMON.fnSetModelProperty(sBindRootPath, oInitData);

        var oDialog = sap.ui.getCore().byId("ws30_movePosPopup");
        if (oDialog) {
            oDialog.open();
            return;
        }

        // USP Folder 생성 팝업
        var oDialog = new sap.m.Dialog("ws30_movePosPopup", {

            // properties
            draggable: true,
            resizable: true,
            icon: "sap-icon://outdent",
            title: "Move Position",
            // contentWidth: "500px",

            // aggregations
            buttons: [
                new sap.m.Button("ws30_movePosOk", {
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: ev_uspTreeNodeMovePosition.bind(this, oTreeTable)
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: ev_uspTreeNodeMovePosPopupClose
                }),
            ],

            content: [new sap.m.StepInput("ws30_step", {
                required: true,
                min: 1,
                value: `{${sBindRootPath}/STEPVAL}`,
                valueState: `{${sBindRootPath}/STEPVS}`,
                valueStateText: `{${sBindRootPath}/STEPVST}`
            }).attachBrowserEvent("keydown", ev_uspTreeNodeStepInputEnter)],

            // association
            initialFocus: "ws30_step",

            afterOpen: function (oEvent) {

                var oStepInput = sap.ui.getCore().byId("ws30_step");
                if (!oStepInput) {
                    return;
                }

                var oInputDom = oStepInput.getDomRef("input-inner");
                if (!oInputDom) {
                    return;
                }

                oInputDom.select();

            },

            // events
            afterClose: function () {

                APPCOMMON.fnSetModelProperty(sBindRootPath, {}, true);

            }

        });

        oDialog.open();

    };
    // end of oAPP.fn.fnUspTreeNodeMovePosition

    /**************************************************************************
     * [WS30] Usp Tree 데이터를 마지막 저장한 데이터로 복원한다.
     **************************************************************************/
    oAPP.fn.fnResetUspTree = () => {

        if (!oAPP.attr.oBeforeUspTreeData) {
            return;
        }

        APPCOMMON.fnSetModelProperty("/WS30/USPTREE", oAPP.attr.oBeforeUspTreeData, true);

        // 마지막 저장 전의 Usp Tree 정보를 초기화 한다.
        oAPP.fn.fnClearOnBeforeUspTreeData();

    };
    // end of oAPP.fn.fnResetUspTree

    /**************************************************************************
     * [WS30] USP New Window
     **************************************************************************/
    oAPP.fn.fnUspNewWindow = (oTreeTable, pIndex) => {

        debugger;

        let oCtx = oTreeTable.getContextByIndex(pIndex),
            oTreeModel = oTreeTable.getModel(),
            oTreeData = oTreeModel.getProperty(oCtx.sPath),
            oAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),

            sSpath = oTreeData.SPATH, // Usp Page Path
            sChanelID = BROWSKEY + sSpath; // IPC 통신 채널 ID

        sChanelID = btoa(sChanelID);

        let oThemeInfo = parent.getThemeInfo(), // theme 정보
            sSettingsJsonPath = parent.getPath("BROWSERSETTINGS"),
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow);

        oBrowserOptions.title = sSpath;
        oBrowserOptions.autoHideMenuBar = true;
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.parent = CURRWIN;
        oBrowserOptions.webPreferences.partition = SESSKEY;
        oBrowserOptions.webPreferences.browserkey = BROWSKEY;
        oBrowserOptions.webPreferences.CHANNELID = sChanelID;
        oBrowserOptions.webPreferences.USERINFO = parent.process.USERINFO;

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        let sUrlPath = parent.getPath("USPNEW");
        oBrowserWindow.loadURL(sUrlPath);

        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => { // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            let oSendData = {
                APPINFO: oAppInfo,
                TREEDATA: oTreeData,
                oUserInfo: parent.getUserInfo(),
                BROWSKEY: BROWSKEY,
                oThemeInfo: oThemeInfo,
                CHANNELID: sChanelID
            };

            oBrowserWindow.webContents.send('if-uspnew', oSendData);

            oBrowserWindow.show();

            oBrowserWindow.setOpacity(1.0);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => { // IPCMAIN 이벤트 해제
            IPCMAIN.removeListener(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

            oBrowserWindow = null;

        });


        IPCMAIN.on(sChanelID, oAPP.fn.fnUspNewWindowIPCEvent);

    }; // end of oAPP.fn.fnUspNewWindow

    oAPP.fn.fnUspNewWindowIPCEvent = (res, data) => {

        debugger;


    };
    // end of oAPP.fn.fnUspNewWindowIPCEvent

    /************************************************************************
     * 설치 폴더에 있는 기본 패턴을 읽어서 모델에 저장하기
     ************************************************************************/
    oAPP.fn.fnReadDefaultPattern = () => {

        return new Promise(async (resolve) => { // 기본 패턴이 있는 폴더목록을 읽는다.
            let sPatternPath = PATH.join(parent.USERDATA, "usp", "pattern", "files"),
                oResult = await WSUTIL.readDir(sPatternPath);

            if (oResult.RETCD == "E") {
                resolve(oResult);
                return;
            }

            // 폴더 목록의 파일들을 읽어서 리턴해준다.
            let aPatternList = oResult.RTDATA,
                iPattLength = aPatternList.length,
                aPatternInfo = [];

            for (var i = 0; i < iPattLength; i++) {

                let sFileName = aPatternList[i],
                    sFileKey = sFileName.split(".")[0],
                    sFilePath = sPatternPath + "\\" + sFileName;

                let oFileDataResult = await WSUTIL.readFile(sFilePath);
                if (oFileDataResult.RETCD == "E") {
                    continue;
                }

                let sFileData = oFileDataResult.RTDATA,
                    oPatternInfo = {
                        KEY: sFileKey,
                        DATA: sFileData
                    };

                aPatternInfo.push(oPatternInfo);

            }

            if (aPatternInfo.length == 0) {
                resolve({
                    RETCD: "E",
                    // RTMSG: "데이터 없음"
                });
                return;
            }

            resolve({
                RETCD: "S",
                RTMSG: "",
                RTDATA: aPatternInfo
            });

        });

    }; // end of oAPP.fn.fnReadDefaultPattern

    oAPP.fn.fnSaveUspPatternCtxMenuInfoLocalFolder = () => {

        return new Promise(async (resolve) => { // 이미 usp pattern 정보를 가져왔는지 확인
            let oPatternData = APPCOMMON.fnGetModelProperty("/PATTN");
            if (oPatternData) {
                resolve();
                return;
            }

            // 파일 확장자에 맞는 SVG 아이콘 정보를 가져온다.
            let oIconResult = await parent.WSUTIL.getFileExtSvgIcons();
            if (oIconResult.RETCD == "E") {
                resolve();
                return;
            }

            // 각 확장자에 맞는 svg 경로를 구한다.
            let aIcons = oIconResult.RTDATA,
                oHtmlIconInfo = aIcons.find(elem => elem.EXTNM === "html") || "",
                oJsIconInfo = aIcons.find(elem => elem.EXTNM === "js") || "",

                // 테스트 목적
                sUi5IconUrl = "https://sap.github.io/ui5-webcomponents/assets/images/ui5-logo.png";

            // 테스트 목적임!!!!
            if (parent.APP.isPackaged) {
                sUi5IconUrl = "";
            }

            let aPatternJson = [{
                "PKEY": "",
                "CKEY": "PATT001",
                "DESC": "Default Pattern"
            },
            {
                "PKEY": "PATT001",
                "CKEY": "PTN001",
                "DESC": "HTML",
                "ICON": oHtmlIconInfo.ICONPATH
            },
            {
                "PKEY": "PTN001",
                "CKEY": "PTN001_001",
                "DESC": "HTML 기본패턴",
                "ACTCD": "01"
            },
            {
                "PKEY": "PTN001",
                "CKEY": "PTN001_002",
                "DESC": "FORM 기본패턴",
                "ACTCD": "01"
            }, {
                "PKEY": "PTN001",
                "CKEY": "PTN001_003",
                "DESC": "Iframe 기본패턴",
                "ACTCD": "01"
            }, {
                "PKEY": "PTN001",
                "CKEY": "PTN001_004",
                "DESC": "UI5 기본패턴",
                "ACTCD": "01",
                "ICON": sUi5IconUrl
            }, {
                "PKEY": "PTN001_004",
                "CKEY": "PTN001_004_001",
                "DESC": "UI5 BootStrap",
                "ACTCD": "01"
            }, {
                "PKEY": "PATT001",
                "CKEY": "PTN002",
                "DESC": "JS",
                "ICON": oJsIconInfo.ICONPATH
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_001",
                "DESC": "JS 기본 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_002",
                "DESC": "즉시실행함수 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_003",
                "DESC": "Module js 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "PTN002",
                "CKEY": "PTN002_004",
                "DESC": "윈도우 이벤트 패턴",
                "ACTCD": "02"
            }, {
                "PKEY": "",
                "CKEY": "PATT002",
                "DESC": "Custom Pattern",
                "ISSTART": true
            }
            ];

            // JSON 모델 정보를 앱 설치 폴더의 패턴 폴더에 저장한다.
            // 기본 패턴이 있는 폴더목록을 읽는다.
            let sPatternRootPath = PATH.join(parent.USERDATA, "usp", "pattern"),
                sPatternJsonPath = PATH.join(sPatternRootPath, "pattern.json"),
                sPatternJsonData = JSON.stringify(aPatternJson);

            // 패턴 정보를 JSON으로 말아서 앱 설치 폴더에 저장
            await parent.WSUTIL.fsWriteFile(sPatternJsonPath, sPatternJsonData);

            resolve();

        });

    };
    // end of oAPP.fn.fnSaveUspPatternCtxMenuInfoLocalFolder

    /**************************************************************************
     * Usp Pattern 정보를 바인딩한다.
     **************************************************************************/
    oAPP.fn.fnModelBindingUspPattern = () => {

        return new Promise(async (resolve) => {

            let sPatternRootPath = PATH.join(parent.USERDATA, "usp", "pattern"),
                sPatternJsonPath = PATH.join(sPatternRootPath, "pattern.json"),
                sPatternJson = FS.readFileSync(sPatternJsonPath, 'utf-8');

            let aPatternJson;

            try {
                aPatternJson = JSON.parse(sPatternJson);
            } catch (error) {
                throw new Error(error);
            }

            let oPattDataResult = await oAPP.fn.fnReadDefaultPattern();
            if (oPattDataResult.RETCD == "S") {

                let aPatternData = oPattDataResult.RTDATA,
                    iPatternDataLength = aPatternData.length;

                for (var i = 0; i < iPatternDataLength; i++) {

                    let oPatternData = aPatternData[i];

                    let oPattern = aPatternJson.find(elem => elem.CKEY == oPatternData.KEY);
                    if (!oPattern) {
                        continue;
                    }

                    oPattern.DATA = oPatternData.DATA;

                }

            }

            APPCOMMON.fnSetModelProperty("/PATTN", aPatternJson);

            let oModel = sap.ui.getCore().getModel();
            parent.WSUTIL.parseArrayToTree(oModel, "PATTN", "CKEY", "PKEY", "PATTN");

            resolve();

        });

    }
    // end of oAPP.fn.fnModelBindingUspPattern

    /**************************************************************************
     * [WS30] USP Codeeditor ContextMenu Open
     **************************************************************************/
    oAPP.fn.fnUspCodeeditorContextMenuOpen = (oEvent, oCodeEditor) => {

        if (oAPP.attr.oCtxMenuClickEditor) {
            delete oAPP.attr.oCtxMenuClickEditor;
        }

        oAPP.attr.oCtxMenuClickEditor = oCodeEditor;

        let sMenuId = "uspCDECtxMenu";

        var oCtxMenu = sap.ui.getCore().byId(sMenuId);
        if (oCtxMenu) {

            let oUspAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),
                oCtxMenuModel = oCtxMenu.getModel();

            oCtxMenuModel.setProperty("/APPINFO", oUspAppInfo);

            oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);

            return;
        }

        var oCtxMenu = new sap.m.Menu({
            itemSelected: (oEvent) => { // USP Pattern Contextmenu Event
                oAPP.fn.fnUspPatternContextMenuClick(oEvent);

            },
            items: {
                path: "/PATTN",
                template: new sap.m.MenuItem({
                    key: "{CKEY}",
                    text: "{DESC}",
                    startsSection: "{ISSTART}",
                    icon: "{ICON}",
                    tooltip: "{DATA}",
                    items: {
                        path: "PATTN",
                        templateShareable: true,
                        template: new sap.m.MenuItem({
                            key: "{CKEY}",
                            text: "{DESC}",
                            startsSection: "{ISSTART}",
                            icon: "{ICON}",
                            tooltip: "{DATA}",
                            items: {
                                path: "PATTN",
                                templateShareable: true,
                                template: new sap.m.MenuItem({
                                    key: "{CKEY}",
                                    text: "{DESC}",
                                    startsSection: "{ISSTART}",
                                    icon: "{ICON}",
                                    tooltip: "{DATA}",
                                    items: {
                                        path: "PATTN",
                                        templateShareable: true,
                                        template: new sap.m.MenuItem({
                                            key: "{CKEY}",
                                            text: "{DESC}",
                                            startsSection: "{ISSTART}",
                                            icon: "{ICON}",
                                            tooltip: "{DATA}"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }).addStyleClass("u4aWsUspPatternMenu");

        let aPatterns = APPCOMMON.fnGetModelProperty("/PATTN"),
            oUspAppInfo = APPCOMMON.fnGetModelProperty("/WS30/APP"),
            oModel = new sap.ui.model.json.JSONModel();

        oModel.setData({
            PATTN: aPatterns,
            APPINFO: oUspAppInfo
        });

        oCtxMenu.setModel(oModel);

        oCtxMenu.openAsContextMenu(oEvent, oCodeEditor);

    }; // end of oAPP.fn.fnUspCodeeditorContextMenuOpen

    /**************************************************************************
     * [WS30] USP Pattern Context Menu Event
     **************************************************************************/
    oAPP.fn.fnUspPatternContextMenuClick = (oEvent) => {

        // 선택한 ContextMenu 정보를 구한다.
        let oSelectMenuItem = oEvent.getParameter("item"),
            oCtx = oSelectMenuItem.getBindingContext();

        if (!oCtx) {
            return;
        }

        // 현재 어플리케이션의 change 모드 여부를 확인한다.
        let oAppInfo = oCtx.getProperty("/APPINFO"),
            bIsEdit = (oAppInfo.IS_EDIT == "X" ? true : false);

        // 어플리케이션이 change 모드가 아니면 빠져나감.
        if (!bIsEdit) {
            return;
        }

        // 마우스 우클릭한 위치의 Editor 정보를 구한다.
        let oCodeEditor = oAPP.attr.oCtxMenuClickEditor;
        if (!oCodeEditor) {
            return;
        }

        let oBindData = oCtx.getProperty(oCtx.getPath()),
            oEditor = oCodeEditor._oEditor,
            oCursorPos = oEditor.getCursorPosition(),
            sInsertTxt = oBindData.DATA;

        if (!sInsertTxt) {
            return;
        }

        // Editor에 선택한 패턴을 출력해준다.
        oEditor.session.insert(oCursorPos, sInsertTxt);

        // Editor에 변경 이벤트를 발생시킨다.
        oCodeEditor.fireChange({
            value: oEditor.session.getValue()
        });

        // 앱 변경 사항 플래그 설정
        oAPP.fn.setAppChangeWs30("X");

    }; // end of oAPP.fn.fnUspPatternContextMenuClick

    /**************************************************************************
     * [WS30] 단축키로 save 및 active 시 마지막 선택한 커서의 위치가 에디터였다면 
     * 해당 에디터로 포커스를 준다!!
     **************************************************************************/
    oAPP.fn.fnLastActivateElementFocus = () => {

        debugger;

        /**
         * 단축키로 실행했을 경우 하위로직 수행
         */
        let oActiveDom = oAPP.attr.beforeActiveElement;
        if (!oActiveDom) {
            return;
        }

        let oCodeEditor1 = sap.ui.getCore().byId("ws30_codeeditor"),
            oCodeEditor2 = sap.ui.getCore().byId("ws30_codeeditor-clone1");

        // 에디터가 둘중에 하나라도 없다면 빠져나감.
        if (!oCodeEditor1 || !oCodeEditor2) {
            return;
        }

        // 이전 포커스의 위치 정보를 지운다.
        delete oAPP.attr.beforeActiveElement;

        // 현재 커서의 위치가 어떤 에디터인지 확인
        let $oCodeeditor1 = $(oActiveDom).closest(".u4aUspCodeeditor1");

        // 커서가 왼쪽 에디터에 있었을 경우
        if ($oCodeeditor1.length !== 0) {

            oCodeEditor1.focus();

            return;

        }

        oCodeEditor2.focus();

    }; // end of oAPP.fn.fnLastActivateElementFocus

    /**************************************************************************
     * [WS30] USP Move Position Popup Close
     **************************************************************************/
    function ev_uspTreeNodeMovePosPopupClose() {

        var oDialog = sap.ui.getCore().byId("ws30_movePosPopup");

        if (oDialog && oDialog.isOpen()) {
            oDialog.close();
        }

    } // end of ev_uspTreeNodeMovePosPopupClose

    /**************************************************************************
     * [WS30] USP Move Position Popup 확인 버튼 이벤트
     **************************************************************************/
    function ev_uspTreeNodeMovePosition(oTable) {

        const sMovePosModelPath = "/WS30/MOVEPOS";

        var oMovePos = APPCOMMON.fnGetModelProperty(sMovePosModelPath),
            iSelIndex = oMovePos.SELIDX,
            iStepValue = oMovePos.STEPVAL;

        if (iStepValue <= 0) {

            sap.ui.getCore().byId("ws30_step").focus();

            oMovePos.STEPVS = sap.ui.core.ValueState.Error;
            oMovePos.STEPVST = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "375"); // Please enter a numeric value of 1 or more.

            APPCOMMON.fnSetModelProperty(sMovePosModelPath, oMovePos);

            return;
        }

        oAPP.fn.fnSetUspTreeNodeMove(oTable, iSelIndex, iStepValue);

        ev_uspTreeNodeMovePosPopupClose();

    }
    // end of ev_uspTreeNodeMovePosition

    /**************************************************************************
     * [WS30] USP Move Position Step Input Enter 이벤트
     **************************************************************************/
    function ev_uspTreeNodeStepInputEnter(oEvent) {

        var iKeyCode = oEvent.keyCode;

        if (iKeyCode !== 13) {
            return;
        }

        var oBtn = sap.ui.getCore().byId("ws30_movePosOk");
        if (!oBtn) {
            return;
        }

        setTimeout(function () {
            oBtn.firePress();
        }, 0);

    } // end of ev_uspTreeNodeStepInputEnter

})(window, $, oAPP);