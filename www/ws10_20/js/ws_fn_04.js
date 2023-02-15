/**************************************************************************                                           
 * ws_fn_04.js
 **************************************************************************/
(function(window, $, oAPP) {
    "use strict";

    const
        require = parent.require,
        PATH = parent.PATH,
        APP = parent.APP,
        REMOTEMAIN = parent.REMOTEMAIN,
        REMOTE = parent.REMOTE,
        APPPATH = parent.APPPATH,
        APPCOMMON = oAPP.common,
        IPCRENDERER = parent.IPCRENDERER,
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        SETTINGS = require(PATHINFO.WSSETTINGS);

    /************************************************************************
     * SAP GUI 멀티 로그인 체크
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheck = () => {

        return new Promise((resolve, reject) => {

            var sPath = parent.getServerPath() + '/chk_mlogin_of_gui',
                oUserInfo = parent.getUserInfo(),
                sId = oUserInfo.ID.toUpperCase(),
                sPw = oUserInfo.PW,
                sComputerName = parent.COMPUTERNAME;

            var oFormData = new FormData();
            oFormData.append("sap-user", sId);
            oFormData.append("sap-password", sPw);
            oFormData.append("PC_NAME", sComputerName);

            sendAjax(
                sPath,
                oFormData,
                (oResult) => { // success

                    if (oResult.RETCD == "E") {

                        reject(oResult);
                        return;
                    }

                    resolve(oResult);

                },
                true, // is Busy
                true, // bIsAsync
                "POST", // meth,
                () => { // error

                    reject();


                }
            );

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheck    

    /************************************************************************
     * SAP GUI 멀티 로그인 체크 성공시
     ************************************************************************/
    oAPP.fn.fnSapGuiMultiLoginCheckThen = async function(oResult) {

        // sapgui 실행시, 레지스트리에 브라우저키를 저장하고 삭제 시점을 감지한다.
        await oAPP.fn.fnSapGuiRegistryParamCheck();

        var oMetadata = parent.getMetadata(),
            oSettingsPath = PATH.join(APPPATH, "settings") + "\\ws_settings.json",
            oSettings = parent.require(oSettingsPath),
            oVbsInfo = oSettings.vbs,
            sVbsPath = oVbsInfo.rootPath,
            sVbsFileName = oVbsInfo.controllerClassVbs,
            sNewSessionVbs = oVbsInfo.newSessionVbs;

        // 서버가 신규 네임 스페이스 적용 서버가 아닌경우
        if (oMetadata.IS_NAME_SPACE !== "X") {
            sVbsFileName = "asis_" + sVbsFileName;
            sNewSessionVbs = "asis_" + sNewSessionVbs;
        }

        var sAppPath = APP.getPath("userData"),
            sVbsFullPath = PATH.join(sAppPath, sVbsPath, sVbsFileName),
            sNewSessionVbsFullPath = PATH.join(sAppPath, sVbsPath, sNewSessionVbs);

        var oServerInfo = parent.getServerInfo(),
            oSvrInfoDetail = oServerInfo.SERVER_INFO_DETAIL,
            oAppInfo = parent.getAppInfo(),
            oUserInfo = parent.getUserInfo();

        var METHNM = this.METHNM,
            INDEX = this.INDEX,
            TCODE = this.TCODE,
            BROWSKEY = this.BROWSKEY, // 브라우저 키
            oParamAppInfo = this.oAppInfo;

        if (oParamAppInfo) {
            oAppInfo = oParamAppInfo;
        }

        // App 정보가 없다면 빈 Object로 초기화..
        if (!oAppInfo) {
            oAppInfo = {};
        }

        var aParam = [
            sNewSessionVbsFullPath, // VBS 파일 경로
            oServerInfo.SYSTEMID, // SYSTEM ID  
            oServerInfo.CLIENT, // CLIENT
            oUserInfo.ID.toUpperCase(), // SAP ID    
            oAppInfo.APPID || "", // Application Name
            (typeof METHNM == "undefined" ? "" : METHNM),
            (typeof INDEX == "undefined" ? "0" : INDEX),
            oAppInfo.IS_EDIT || "", // Edit or Display Mode
            TCODE || "", // T-CODE
            // oResult.RTVAL, // SAPGUI Multi Login Check Value
            oResult.MAXSS, // 최대 세션창 갯수
            BROWSKEY, // 현재 브라우저키
        ];

        //1. 이전 GUI 세션창 OPEN 여부 VBS 
        var vbs = parent.SPAWN('cscript.exe', aParam);
        vbs.stdout.on("data", function(data) {


        });

        //GUI 세션창이 존재하지않다면 ...
        vbs.stderr.on("data", function(data) {

            //VBS 리턴 오류 CODE / MESSAGE 
            var str = data.toString(),
                Tstr = str.split(":"),
                len = Tstr.length - 1;

            if (len !== 0) {

                str = Tstr[len];
                if (str.indexOf("|") != -1) {
                    return;
                }

            }

            var aParam = [
                sVbsFullPath, // VBS 파일 경로
                oSvrInfoDetail.host,
                oSvrInfoDetail.port,
                oSvrInfoDetail.systemid,
                (oSvrInfoDetail.msgsvr && oSvrInfoDetail.msgsvr.host ? oSvrInfoDetail.msgsvr.host : ""),
                (oSvrInfoDetail.msgsvr && oSvrInfoDetail.msgsvr.port ? oSvrInfoDetail.msgsvr.port : ""),
                (oSvrInfoDetail.router && oSvrInfoDetail.router.router ? oSvrInfoDetail.router.router : ""),
                oUserInfo.CLIENT,
                oUserInfo.UNAME,
                oUserInfo.PW,
                oUserInfo.LANGU,
                oAppInfo.APPID || "", // Application Name
                (typeof METHNM == "undefined" ? "" : METHNM),
                (typeof INDEX == "undefined" ? "0" : INDEX),
                oAppInfo.IS_EDIT || "", // Edit or Display Mode,
                TCODE || "", // T-CODE
                oResult.RTVAL, // SAPGUI Multi Login Check Value
                oResult.MAXSS, // 최대 세션창 갯수
                BROWSKEY, // 현재 브라우저키
            ];

            var vbs = parent.SPAWN('cscript.exe', aParam);
            vbs.stdout.on("data", function(data) {


            });

            vbs.stderr.on("data", function(data) {

                // 이전에 돌고 있는 인터벌이 혹시나 있으면 삭제
                _clearIntervalSapGuiCheck();

                // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
                _sendIpcRendererIllustedMsgDlgClose();

                //VBS 리턴 오류 CODE / MESSAGE 
                var str = data.toString(),
                    Tstr = str.split(":"),
                    len = Tstr.length - 1;

                if (len !== 0) {

                    str = Tstr[len];

                    if (str.indexOf("|") != -1) {
                        return;
                    }

                }

            });

        });

    }; // end of oAPP.fn.fnSapGuiMultiLoginCheckThen

    // 이전에 돌고 있는 인터벌이 혹시나 있으면 삭제
    function _clearIntervalSapGuiCheck() {

        if (oAPP.attr.sapguiInterval) {
            clearInterval(oAPP.attr.sapguiInterval);
            delete oAPP.attr.sapguiInterval;
        }

    } // end of _clearIntervalSapGuiCheck

    // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
    function _sendIpcRendererIllustedMsgDlgClose() {

        let oServerInfo = parent.getServerInfo(),
            oSendData = {
                PRCCD: "02",
                CLIENT: oServerInfo.CLIENT,
                SYSID: oServerInfo.SYSID,
            };

        // 같은 client && SYSID 창에 IllustedMsgDialog를 닫는다
        parent.IPCRENDERER.send("if-browser-interconnection", oSendData);

    } // end of _sendIpcRendererIllustedMsgDlgClose

    /************************************************************************
     * SAP GUI VBS 실행 시 저장한 Registry 값이 있는지 확인
     ************************************************************************/
    oAPP.fn.fnSapGuiRegistryParamCheck = async () => {

        let oServerInfo = parent.getServerInfo(),
            oSendData = {
                PRCCD: "03",
                CLIENT: oServerInfo.CLIENT,
                SYSID: oServerInfo.SYSID,
            };

        return new Promise(async (resolve) => {

            const
                Regedit = parent.require('regedit').promisified,
                sRegPath = SETTINGS.regPaths.cSession,                
                BROWSKEY = parent.getBrowserKey();

            // 레지스트리 폴더 생성
            await Regedit.createKey([sRegPath]);

            let oRegData = {};
            oRegData[sRegPath] = {};
            oRegData[sRegPath][BROWSKEY] = {
                value: "1",
                type: "REG_SZ"
            };

            // 레지스트리 데이터 저장
            await Regedit.putValue(oRegData);

            // 이전에 돌고 있는 인터벌이 혹시나 있으면 삭제
            _clearIntervalSapGuiCheck();

            let sIllustDesc = "",
                oIllustMsg = sap.ui.getCore().byId("u4aWsIllustedMsg");

            if (oIllustMsg) {
                sIllustDesc = oIllustMsg.getDescription();
            }

            let iMaxTime = 30,
                iCurrTime = 0;

            oAPP.attr.sapguiInterval = setInterval(async () => {

                iCurrTime += 1;

                if (oIllustMsg) {

                    let sDesc = `${sIllustDesc}..........(${iCurrTime} / ${iMaxTime})`;

                    oSendData.MSG = sDesc;

                    // 같은 client && SYSID 창에 일러스트 메시지를 뿌린다!!
                    parent.IPCRENDERER.send("if-browser-interconnection", oSendData);

                }

                // iMaxTime초 이후에도 dialog가 닫히지 않았다면 강제로 닫아준다.
                if (iCurrTime >= iMaxTime) {

                    iCurrTime = 0;

                    // 인터벌 죽이기
                    _clearIntervalSapGuiCheck();

                    // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
                    _sendIpcRendererIllustedMsgDlgClose();

                    return;

                }

                // 레지스트리 목록을 구한다
                const oResult = await Regedit.list(sRegPath);

                // 레지스트리의 값 중, 현재 브라우저 키의 정보가 있는지 확인한다.
                let oSession = oResult[sRegPath];
                if (!oSession) {

                    // 인터벌 죽이기
                    _clearIntervalSapGuiCheck();

                    // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
                    _sendIpcRendererIllustedMsgDlgClose();

                    return;

                }

                let oSessionValue = oResult[sRegPath].values;
                if (!oSession) {

                    // 인터벌 죽이기
                    _clearIntervalSapGuiCheck();

                    // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
                    _sendIpcRendererIllustedMsgDlgClose();

                    return;
                }

                // 레지스트리에 키값이 존재한다면 아직 SAPGUI가 안뜬 상태이므로 여기서 빠져나가서
                // 다시 인터벌을 돌게한다.
                let oSessionKey = oSessionValue[BROWSKEY];
                if (oSessionKey) {
                    return;
                }

                // 인터벌 죽이기
                _clearIntervalSapGuiCheck();

                // 같은 SYSID && CLIENT에 해당하는 브라우저에 IPC를 전송하여 IllustedMsgDialog를 끈다. 
                _sendIpcRendererIllustedMsgDlgClose();

            }, 1000); // end of oAPP.attr.sapguiInterval

            resolve();

        }); // end of Promise

    }; // end of oAPP.fn.fnSapGuiRegistryParamCheck 

    /************************************************************************
     * 브라우저에 내장된 세션 정보를 클리어 한다.
     ************************************************************************/
    oAPP.fn.fnClearSessionStorageData = () => {

        var currwin = parent.CURRWIN,
            webcon = currwin.webContents,
            sess = webcon.session;

        sess.clearStorageData([]);

    }; // end of oAPP.fn.fnClearSessionStorageData

    /************************************************************************
     * TCODE Suggestion 구성
     ************************************************************************/
    oAPP.fn.fnOnInitTCodeSuggestion = () => {

        let sSuggName = "tcode";

        var aSuggData = oAPP.fn.fnSuggestionRead(sSuggName);

        if (Array.isArray(aSuggData) == false) {
            oAPP.fn.fnSuggestionSave(sSuggName, []);
            return;
        }

        APPCOMMON.fnSetModelProperty("/SUGG/TCODE", aSuggData);

    }; // end of oAPP.fn.fnOnInitTCodeSuggestion

    /************************************************************************
     * ServerList Focus
     ************************************************************************/
    oAPP.fn.fnSetFocusServerList = () => {

        var sPopupName = "SERVERLIST";

        // 1. 현재 떠있는 브라우저 갯수를 구한다.
        var aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowsLen = aBrowserList.length;

        for (var i = 0; i < iBrowsLen; i++) {

            var oBrows = aBrowserList[i];
            if (oBrows.isDestroyed()) {
                continue;
            }

            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

            if (oWebPref.OBJTY !== sPopupName) {
                continue;
            }

            oBrows.show();
            oBrows.focus();

            return;

        }

    }; // end of oAPP.fn.fnSetFocusServerList

    /************************************************************************
     * 30번 페이지 생성
     ************************************************************************/
    oAPP.fn.fnWs30Creator = () => {

        // Application Copy Popup Open
        if (oAPP.fn.fnCreateWs30) {
            oAPP.fn.fnCreateWs30();
            return;
        }

        oAPP.fn.fnCreateWs30();

    }; // end of oAPP.fn.fnWs30Creator

    /************************************************************************
     * 윈도우의 프레임을 투명하게 만들고 배경을 선택할 수 있게 만드는 기능
     ************************************************************************/
    oAPP.fn.fnSetHideWindow = () => {

        let sPopupName = "WINSHOWHIDE";

        // 기존 팝업이 열렸을 경우 새창 띄우지 말고 해당 윈도우에 포커스를 준다.
        let oResult = APPCOMMON.getCheckAlreadyOpenWindow(sPopupName);
        if (oResult.ISOPEN) {
            return;
        }

        let win = parent.REMOTE.getCurrentWindow(),
            oThemeInfo = parent.getThemeInfo(), // theme 정보 
            SESSKEY = parent.getSessionKey(),
            BROWSKEY = parent.getBrowserKey(),
            oUserInfo = parent.getUserInfo();

        // 윈도우에 클릭 이벤트 무시 여부
        win.setIgnoreMouseEvents(true);

        win.setAlwaysOnTop(true);

        var oBrowserOptions = {
            "height": 120,
            "width": 288,
            "maxWidth": 288,
            "minWidth": 288,

            "maxHeight": 180,
            "minHeight": 180,

            // "maxHeight": 120,
            // "minHeight": 120,           

            "backgroundColor": oThemeInfo.BGCOL,
            "acceptFirstMouse": true,
            "alwaysOnTop": true,
            "maximizable": false,
            "minimizable": false,
            "frame": false,
            "transparent": true,
            "parent": win,
            "webPreferences": {
                "OBJTY": sPopupName,
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
                "partition": SESSKEY,
                "browserkey": BROWSKEY,
                "USERINFO": parent.process.USERINFO
            }
        };

        // 브라우저 오픈
        var oBrowserWindow = new parent.REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // oBrowserWindow.setMenuBarVisibility(false);

        // 실행할 URL 적용
        // var sUrlPath = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20/Popups/winShowHidePopup/test1.html");
        // var sUrlPath = parent.getPath("WINHIDE2");
        var sUrlPath = parent.getPath("WINHIDE");

        oBrowserWindow.loadURL(sUrlPath);

        // // no build 일 경우에는 개발자 툴을 실행한다.
        // if (!APP.isPackaged) {
        //     oBrowserWindow.webContents.openDevTools();
        // }

        // oBrowserWindow.webContents.openDevTools();

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oBrowserWindow.once('ready-to-show', () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

            oBrowserWindow.show();

        });

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function() {

            let oSendData = {
                DEFAULT_OPACITY: 0.3,
                oUserInfo: oUserInfo,
                oThemeInfo: oThemeInfo,
            };

            oBrowserWindow.webContents.send('if_showHidePopup', oSendData);

            oBrowserWindow.show();

            // oBrowserWindow.setOpacity(1.0);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oBrowserWindow, oBrowserOptions);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            let bIsPin = APPCOMMON.fnGetModelProperty("/SETTING/ISPIN");

            win.focus();
            win.setOpacity(1);
            win.setIgnoreMouseEvents(false);

            if (!bIsPin) {
                win.setAlwaysOnTop(false);
            }

            oBrowserWindow = null;

        });

    }; // end of oAPP.fn.fnSetToggleFrameWindow

    /************************************************************************
     * [Admin] OpenDevTool Popup Open
     ************************************************************************/
    oAPP.fn.fnOpenDevTool = () => {

        const
            DIALOG_ID = "u4aAdminDevToolDlg";

        // 초기 모델 설정
        let oModelData = {
                KEY: "",
                RDBTNINDEX: 0,
                FNAME: "",
                RDLIST: [{
                        text: "Key In"
                    },
                    {
                        text: "File Drag"
                    },
                    {
                        text: "Attach File"
                    },
                ]
            },
            oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData(oModelData);

        // 이미 Dialog가 그려진게 있다면 Open한다.
        var oDialog = sap.ui.getCore().byId(DIALOG_ID);
        if (oDialog) {

            oDialog.setModel(oJsonModel);

            oDialog.open();

            return;
        }

        var oDialog = new sap.m.Dialog(DIALOG_ID, {
            title: "Administrator DevTool",
            icon: "sap-icon://key-user-settings",
            contentWidth: "500px",
            draggable: true,
            resizable: true,
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://key-user-settings",
                    }),
                    new sap.m.Title({
                        text: "Administrator OpenDevTool"
                    })
                ],
                contentRight: [

                    new sap.m.Button({
                        type: sap.m.ButtonType.Reject,
                        icon: "sap-icon://decline",
                        press: function(oEvent) {

                            var oDialog = sap.ui.getCore().byId(DIALOG_ID);
                            if (oDialog) {
                                oDialog.close();
                            }

                        }
                    }),
                ]
            }),
            content: [

                new sap.m.RadioButtonGroup({
                    columns: 3,
                    selectedIndex: "{/RDBTNINDEX}",
                    buttons: {
                        path: "/RDLIST",
                        template: new sap.m.RadioButton({
                            text: "{text}"
                        })
                    },
                    // buttons: [
                    //     new sap.m.RadioButton({
                    //         text: "Key In"
                    //     }),
                    //     new sap.m.RadioButton({
                    //         text: "File Drag"
                    //     }),
                    //     new sap.m.RadioButton({
                    //         text: "Attach File"
                    //     }),
                    // ],
                    select: (oEvent) => {

                        let iSelectedIndex = oEvent.getParameter("selectedIndex");
                        if (iSelectedIndex == 2) {
                            oAPP.fn.fnOpenDevToolFileAttach();
                            return;
                        }

                    }
                }),

                // 수기 입력 
                new sap.m.Input({
                    value: "{/KEY}",
                    submit: () => {
                        oAPP.fn.fnSetOpenDevToolSubmit();
                    }
                }).bindProperty("visible", "/RDBTNINDEX", function(INDEX) {

                    if (INDEX !== 0) {
                        return false;
                    }

                    this.getModel().setProperty("/FNAME", "");

                    return true;

                }),
                // 파일 드래그 앤 드롭 영역
                new sap.m.HBox({
                    renderType: sap.m.FlexRendertype.Bare,
                    height: "100px",
                    alignItems: sap.m.FlexAlignItems.Center,
                    justifyContent: sap.m.FlexAlignItems.Center,
                    dragDropConfig: [
                        new sap.ui.core.dnd.DropInfo({
                            drop: (oEvent) => {
                                oAPP.fn.fnOpenDevToolFileDrop(oEvent);
                            }
                        }),
                    ],
                    items: [
                        new sap.m.Text({
                            text: "Drop the File!"
                        })
                    ]
                }).bindProperty("visible", "/RDBTNINDEX", function(INDEX) {

                    if (INDEX !== 1) {
                        return false;
                    }

                    this.getModel().setProperty("/KEY", "");

                    return true;

                }).addEventDelegate({
                    ondragover: () => {

                        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
                        if (l_dom === null || l_dom.length === 0) {
                            return;
                        }

                        let oDom = l_dom[0];

                        let iLastZIndex = sap.ui.core.Popup.getLastZIndex() + 1;
                        oDom.style.zIndex = iLastZIndex;

                        oDom.classList.remove("u4aWsDisplayNone");

                    },
                    ondragleave: () => {

                        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
                        if (l_dom === null || l_dom.length === 0) {
                            return;
                        }

                        let oDom = l_dom[0];

                        oDom.classList.remove("u4aWsDisplayNone");
                        oDom.classList.add("u4aWsDisplayNone");

                    }
                }).addStyleClass("u4aWsDropArea")

            ],
            buttons: [

                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: function(oEvent) {

                        var oDialog = sap.ui.getCore().byId(DIALOG_ID);
                        if (oDialog) {
                            oDialog.close();
                        }

                    }
                }),

            ]

        });

        oDialog.addStyleClass("sapUiContentPadding");

        oDialog.setModel(oJsonModel);

        oDialog.open();

    }; // end of oAPP.fn.fnOpenDevTool

    /************************************************************************
     * [Admin] OpenDevTool 팝업의 파일 Drop
     ************************************************************************/
    oAPP.fn.fnOpenDevToolFileDrop = (oEvent) => {

        let oBrowserEvent = oEvent.getParameter("browserEvent"),
            oDataTransfer = oBrowserEvent.dataTransfer,
            aFiles = oDataTransfer.files,
            iFileLength = aFiles.length;

        if (iFileLength == 0) {
            return;
        }

        let oFile = aFiles[0];

        let oFileReader = new FileReader();
        oFileReader.onload = (event) => {

            let sFileText = event.target.result;

            oAPP.fn.fnSetOpenDevTool(sFileText);

        };

        oFileReader.readAsText(oFile);

    }; // end of oAPP.fn.fnOpenDevToolFileDrop

    /************************************************************************
     * [Admin] OpenDevTool Key In
     ************************************************************************/
    oAPP.fn.fnSetOpenDevToolSubmit = () => {

        const
            DIALOG_ID = "u4aAdminDevToolDlg";

        let oDialog = sap.ui.getCore().byId(DIALOG_ID);
        if (!oDialog) {
            return;
        }

        let oDialogModel = oDialog.getModel();
        if (!oDialogModel) {
            return;
        }

        let oModelData = oDialogModel.getData(),
            sKeyIn = oModelData.KEY;

        oAPP.fn.fnSetOpenDevTool(sKeyIn);

    }; // end of oAPP.fn.fnSetOpenDevToolSubmit

    /************************************************************************
     * [Admin] OpenDevTool의 파일 첨부
     ************************************************************************/
    oAPP.fn.fnOpenDevToolFileAttach = async () => {

        const
            DIALOG_ID = "u4aAdminDevToolDlg";

        let oDialog = sap.ui.getCore().byId(DIALOG_ID);
        if (!oDialog) {
            return;
        }

        let oDEVTOOL = parent.require(PATH.join(APPPATH, "ADMIN", "DevToolsPermission", "index.js")),
            sRETURN = await oDEVTOOL.excute01(REMOTE);

        if (sRETURN.RETCD !== "S") {
            parent.showMessage(sap, 20, sRETURN.RETCD, sRETURN.RTMSG);
        }

        oDialog.close();

    }; // end of oAPP.fn.fnOpenDevToolFileAttach

    /************************************************************************
     * [Admin] 입력한 Key 의 유효성 점검 후 OpenDevTool 열기
     ************************************************************************/
    oAPP.fn.fnSetOpenDevTool = async (sText) => {

        const
            DIALOG_ID = "u4aAdminDevToolDlg";

        let oDialog = sap.ui.getCore().byId(DIALOG_ID);
        if (!oDialog) {
            return;
        }

        let oDEVTOOL = parent.require(PATH.join(APPPATH, "ADMIN", "DevToolsPermission", "index.js")),
            sRETURN = await oDEVTOOL.excute02(REMOTE, sText);

        if (sRETURN.RETCD !== "S") {
            parent.showMessage(sap, 20, sRETURN.RETCD, sRETURN.RTMSG);
        }

        oDialog.close();

    }; // end of oAPP.fn.fnSetOpenDevTool

})(window, $, oAPP);