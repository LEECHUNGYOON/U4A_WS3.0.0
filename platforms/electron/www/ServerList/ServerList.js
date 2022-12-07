/**************************************************************************
 * ServerList.js
 **************************************************************************/
(function () {
    "use strict";

    let oAPP = parent.oAPP;

    let REMOTE = oAPP.REMOTE,
        REMOTEMAIN = oAPP.REMOTEMAIN,
        FS = REMOTE.require('fs'),
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        PATH = REMOTE.require('path'),
        PATHINFO = parent.require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        MENU = REMOTE.Menu,
        RANDOM = oAPP.RANDOM,
        CURRWIN = REMOTE.getCurrentWindow(),
        xhr = new XMLHttpRequest();

    xhr.withCredentials = true;

    let USERDATA = APP.getPath("userData"),
        sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로  
        sServerInfoPath = PATH.join(USERDATA, "p13n", "ServerInfo.json");

    /**************************************************************************
     * 서버 리스트 개인화 정보 설정
     **************************************************************************/
    function fnOnP13nConfig() {

        // P13N 폴더가 없으면 폴더부터 생성
        if (!FS.existsSync(sP13nfolderPath)) {
            FS.mkdirSync(sP13nfolderPath);
        }

        // server info 파일이 없으면 리턴
        if (!FS.existsSync(sServerInfoPath)) {
            return;
        }

        // server info 파일이 있을 경우 내용을 읽어서 테이블에 뿌린다.
        var sSavedData = FS.readFileSync(sServerInfoPath, 'utf-8'),
            SERVERINFO = JSON.parse(sSavedData);

        fnSetModelProperty("/SERVERINFO", SERVERINFO);

    } // end of fnOnP13nConfig

    /**************************************************************************
     * 서버 리스트 초기 화면 그리기
     **************************************************************************/
    function fnOnInitRendering() {

        var oApp = new sap.m.App(),
            oPage = new sap.m.Page({
                title: "{/MSGCLS/0001}" // "U4A Workspace ServerInfo"                
                // title: "U4A Workspace Server Informations" // "U4A Workspace ServerInfo"                
            });

        oApp.addPage(oPage);
        oApp.placeAt("content");

        var oTable = fnGetServerInfoTable(),
            oForm = fnGetServerInfoForm(),
            oDialog = fnGetServerInfoDialog();

        oDialog.addContent(oForm);
        oPage.addContent(oDialog);
        oPage.addContent(oTable);

    } // end of fnOnInit

    // UI5의 필요한 Object 로드
    function fnOnInitUi5LibraryPreload() {

        jQuery.sap.require("sap.m.MessageBox");

    } // end of fnOnInitUi5LibraryPreload

    // 서버 리스트 테이블 인스턴스 만들기
    function fnGetServerInfoTable() {

        var oTable = new sap.m.Table("servlist", {
            mode: "SingleSelectMaster",
            alternateRowColors: true,
            autoPopinMode: true,
            backgroundDesign: "Transparent",
            headerToolbar: new sap.m.OverflowToolbar({
                content: [
                    new sap.m.Button({
                        icon: "sap-icon://add-document",
                        tooltip: "{/MSGCLS/0006}", // "new"
                        // tooltip: "new",
                        press: ev_pressAddServer
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://edit",
                        tooltip: "{/MSGCLS/0007}", // "Edit"
                        // tooltip: "Edit",
                        press: ev_pressUpdateServer
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        tooltip: "{/MSGCLS/0008}", // "Delete"
                        // tooltip: "Delete",
                        press: ev_pressDeleteServer
                    }),
                ]
            }),
            columns: [
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: "{/MSGCLS/0002}", // "Server Name",
                        // text: "Server Name",
                        design: "Bold"
                    })
                }),
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: "{/MSGCLS/0003}", // "System ID",
                        // text: "System ID",
                        design: "Bold"
                    })
                }),
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: "{/MSGCLS/0004}", // "Server IP",
                        // text: "Server IP",
                        design: "Bold"
                    })
                }),
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: "{/MSGCLS/0005}", // "Instance No",
                        // text: "Instance No",
                        design: "Bold"
                    })
                }),
            ],
            items: {
                path: '/SERVERINFO',
                template: new sap.m.ColumnListItem({
                    type: "Active",
                    cells: [
                        new sap.m.Text({
                            text: "{SERVNM}"
                        }),
                        new sap.m.Text({
                            text: "{SYSID}"
                        }),
                        new sap.m.Text({
                            text: "{SERVIP}"
                        }),
                        new sap.m.Text({
                            text: "{INSNO}"
                        }),
                    ]
                })
            }
        });

        // sap.m.Table의 Row 더블클릭 이벤트
        oTable.attachBrowserEvent("dblclick", fnServerInfoTableDblclickEvent);

        return oTable;

    } // end of fnGetServerInfoTable

    /**************************************************************************
     * Server Info Table의 더블클릭 이벤트
     **************************************************************************/
    function fnServerInfoTableDblclickEvent(oEvent) {

        var oTarget = oEvent.target,
            $SelectedRow = $(oTarget).closest(".sapMListTblRow");

        if (!$SelectedRow.length) {
            return;
        }

        var oRow = $SelectedRow[0],
            oSelectedRow = sap.ui.getCore().byId(oRow.id);

        if (!oSelectedRow) {
            return;
        }

        var oCtx = oSelectedRow.getBindingContext(),
            oRowData = oSelectedRow.getModel().getProperty(oCtx.sPath);

        var sServerIP = oRowData.SERVIP,
            sInsNo = oRowData.INSNO,
            sServerUrl = "http://" + sServerIP + ":80" + sInsNo + "/zu4a_wbc/u4a_ipcmain";

        var oFormData = new FormData();
        oFormData.append("SYSCHK", 'X');

        fnSetBusy('X');

        fnSendAjax(sServerUrl, oFormData, fnServerCheckSuccess, fnServerCheckError, fnServerCheckCancel);

    } // end of fnServerInfoTableDblclickEvent

    /**************************************************************************
     * 서버 체크 성공시
     **************************************************************************/
    function fnServerCheckSuccess(oResponse) {

        fnSetBusy('');

        var oResult;

        try {

            oResult = JSON.parse(oResponse);

            if (oResult.TYPE != "S") {
                sap.m.MessageToast.show(oResult.MSG);
                return;
            }

        } catch (e) {

        }

        var oTable = sap.ui.getCore().byId("servlist");
        if (!oTable) {
            return;
        }

        var oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            return;
        }

        debugger;

        // 테이블에 선택된 Row 데이터 구하기
        var oCtx = oSelectedItem.getBindingContext(),
            oItemData = oTable.getModel().getProperty(oCtx.sPath);

        // 서버 정보
        var oSAPServerInfo = {
            NAME: oItemData.SERVNM,
            SERVERIP: oItemData.SERVIP,
            INSTANCENO: oItemData.INSNO,
            SYSTEMID: oItemData.SYSID,
            CLIENT: "",
            LANGU: "",
            SYSID: oItemData.SYSID
        };

        if (oResult && oResult.SYSINFO) {
            oSAPServerInfo.CLIENT = oResult.SYSINFO.CLIENT;
            oSAPServerInfo.LANGU = oResult.SYSINFO.LANGU;
        }

        fnP13nCreateTheme(oItemData.SYSID).then((oThemeInfo) => {

            oSAPServerInfo.oThemeInfo = oThemeInfo;

            fnLoginPage(oSAPServerInfo);

        });

    } // end of fnServerCheckSuccess

    /**************************************************************************
     * 서버 체크 실패시
     **************************************************************************/
    function fnServerCheckError(sErrMsg) {

        fnSetBusy('');

        var sMsg = fnGetLanguClassTxt("0020") // "Server Connection Fail!";

        if (sErrMsg) {
            sMsg = sErrMsg;
        }

        // 메시지 박스 옵션
        var oMsgBoxOpts = {
            title: fnGetLanguClassTxt("0021"), //"Server Connection",
            actions: [
                sap.m.MessageBox.Action.OK,
            ],
            emphasizedAction: sap.m.MessageBox.Action.OK
        };

        sap.m.MessageBox.error(sMsg, oMsgBoxOpts);

    } // end of fnServerCheckFail

    function fnServerCheckCancel() {

        fnSetBusy('');

        var oMsgOpts = {
            my: "center center",
            at: "center center",
            width: "30rem"
        };

        sap.m.MessageToast.show(fnGetLanguClassTxt("0022"), oMsgOpts); // "Server Connection Cancelled!!"

    } // end of fnServerCheckCancel

    /**************************************************************************
     * 서버 체크 성공시 로그인 팝업 실행하기
     **************************************************************************/
    function fnLoginPage(oSAPServerInfo) {

        const WINDOWSTATE = REMOTE.require('electron-window-state');

        // 창 크기 기본값 설정
        let mainWindowState = WINDOWSTATE({
            defaultWidth: 800,
            defaultHeight: 800
        });

        var SESSKEY = RANDOM.generate(40),
            BROWSERKEY = RANDOM.generate(10);

        // Browser Options..        
        var sSettingsJsonPath = PATHINFO.BROWSERSETTINGS,
            oDefaultOption = parent.require(sSettingsJsonPath),
            oBrowserOptions = jQuery.extend(true, {}, oDefaultOption.browserWindow),
            oWebPreferences = oBrowserOptions.webPreferences,
            oThemeInfo = oSAPServerInfo.oThemeInfo;

        // 브라우저 윈도우 기본 사이즈
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;
        oBrowserOptions.x = mainWindowState.x;
        oBrowserOptions.y = mainWindowState.y;
        oBrowserOptions.width = mainWindowState.width;
        oBrowserOptions.height = mainWindowState.height;
        oBrowserOptions.minWidth = 1000;
        oBrowserOptions.minHeight = 800;
        oBrowserOptions.show = false;
        oBrowserOptions.opacity = 0.0;
        oWebPreferences.partition = SESSKEY;
        oWebPreferences.browserkey = BROWSERKEY;

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 브라우저 윈도우 기본 사이즈 감지
        mainWindowState.manage(oBrowserWindow);

        oBrowserWindow.loadURL(PATHINFO.MAINFRAME);

        // oBrowserWindow.once('ready-to-show', () => {
        //     oBrowserWindow.show();
        // });

        // oBrowserWindow.webContents.openDevTools();

        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
            oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            var oMetadata = {
                SERVERINFO: oSAPServerInfo,
                THEMEINFO: oSAPServerInfo.oThemeInfo, // 테마 개인화 정보
                EXEPAGE: "LOGIN",
                SESSIONKEY: SESSKEY,
                BROWSERKEY: BROWSERKEY
            };

            // 메타 정보를 보낸다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);

            oBrowserWindow.setOpacity(1.0);

            oBrowserWindow.show();

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    } // end of fnLoginPage

    /**************************************************************************
     * ajax 호출 펑션
     **************************************************************************/
    function fnSendAjax(sUrl, oFormData, fnSuccess, fnError, fnCancel) {

        // ajax call 취소할 경우..
        xhr.onabort = function () {

            if (typeof fnCancel == "function") {
                fnCancel();
            }

        };

        // ajax call 실패 할 경우
        xhr.onerror = function () {

            if (typeof fnError == "function") {
                fnError();
            }

        };

        xhr.onreadystatechange = function (a, b, c, d, e) { // 요청에 대한 콜백         

            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    if (typeof fnSuccess == "function") {
                        fnSuccess(xhr.responseText);
                    }

                }
            }

        };

        try {

            xhr.open('POST', sUrl, true);

        } catch (e) {

            if (typeof fnError == "function") {
                fnError(e.message);
            }

            return;
        }

        xhr.send(oFormData);

    }; // end of fnSendAjax

    /**************************************************************************
     * 서버 추가 Dialog Instance 만들기
     **************************************************************************/
    function fnGetServerInfoDialog() {

        var oDialog = new sap.m.Dialog("serverDlg", {
                icon: "{/SERVDLG/ICON}",
                resizable: true,
                draggable: true,
                buttons: [
                    new sap.m.Button("serverDlgSaveBtn", {
                        icon: "sap-icon://save",
                        tooltip: "{/MSGCLS/0018}", // save
                        press: ev_pressServerDlgSave
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        tooltip: "{/MSGCLS/0019}", // cancel
                        press: function (oEvent) {

                            var oDialog = oEvent.getSource().getParent();

                            ev_pressServerDlgClose(oDialog);

                        }
                    })
                ]

            })
            .bindProperty("title", "/SERVDLG/TRCOD", function (TITLE) {

                if (!TITLE) {
                    return;
                }

                switch (TITLE) {
                    case "C":
                        return fnGetLanguClassTxt("0009"); // "Add Server Information"

                    case "U":
                        return fnGetLanguClassTxt("0010"); // "Update Server Information"

                    default:
                        return "";
                }

            })
            .addStyleClass("u4aWsAddServerDialog");

        return oDialog;

    } // end of fnGetAddServerDialog

    /**************************************************************************
     * 서버 추가 Dialog Instance 만들기
     **************************************************************************/
    function fnGetServerInfoForm() {

        var oForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 2,
                labelSpanL: 3,
                labelSpanM: 3,
                labelSpanS: 4,
                singleContainerFullSize: true
            }),
            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "{/MSGCLS/0016}" // "Description"
                            }),
                            fields: new sap.m.Input({
                                value: "{/SERVDLGFORM/SERVNM}",
                                submit: ev_pressServerInfoSaveSubmit
                            })
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "{/MSGCLS/0017}" // "Application Server"
                            }),
                            fields: new sap.m.Input({
                                value: "{/SERVDLGFORM/SERVIP}",
                                valueState: "{/SERVDLGFORM/SERVIP_VS}",
                                valueStateText: "{/SERVDLGFORM/SERVIP_VSTXT}",
                                required: true,
                                submit: ev_pressServerInfoSaveSubmit,
                            })
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "{/MSGCLS/0005}" //"Instance Number"
                            }),
                            fields: new sap.m.MaskInput({
                                value: "{/SERVDLGFORM/INSNO}",
                                valueState: "{/SERVDLGFORM/INSNO_VS}",
                                valueStateText: "{/SERVDLGFORM/INSNO_VSTXT}",
                                mask: "99",
                                required: true,
                            })
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "{/MSGCLS/0003}", // "System ID"
                            }),
                            fields: new sap.m.Input({
                                value: "{/SERVDLGFORM/SYSID}",
                                valueState: "{/SERVDLGFORM/SYSID_VS}",
                                valueStateText: "{/SERVDLGFORM/SYSID_VSTXT}",
                                maxLength: 3,
                                required: true,
                                submit: ev_pressServerInfoSaveSubmit,
                                liveChange: function (oEvent) {

                                    var sValue = oEvent.getParameter("value");

                                    this.setValue(sValue.toUpperCase());

                                }
                            })
                        }),
                    ]
                }),
            ]
        });

        return oForm;

    } // end of fnGetServerInfoForm

    /**************************************************************************
     * Server Info Dialog 의 Input Field submit 이벤트
     **************************************************************************/
    function ev_pressServerInfoSaveSubmit() {

        var oSaveBtn = sap.ui.getCore().byId("serverDlgSaveBtn");
        if (!oSaveBtn) {
            return;
        }

        oSaveBtn.firePress();

    } // end of ev_pressServerInfoSaveSubmit

    /**************************************************************************
     * Server Info Dialog Close Event
     **************************************************************************/
    function ev_pressServerDlgClose(oDialog) {

        oDialog.close();

    } // end of ev_pressServerDlgClose

    /**************************************************************************
     * 서버 추가 버튼 이벤트
     **************************************************************************/
    function ev_pressAddServer() {

        var oDialog = sap.ui.getCore().byId("serverDlg");
        if (!oDialog) {
            return;
        }

        var oServInfo = {
            TITLE: fnGetLanguClassTxt("0009"), // "Add Server Information"            
            TRCOD: "C",
            ICON: "sap-icon://add-document"
        };

        // Dialog 정보 (헤더 텍스트) 설정
        fnSetModelProperty("/SERVDLG", oServInfo);

        // 서버 정보 입력 필드 초기화
        fnSetModelProperty("/SERVDLGFORM", {});

        oDialog.open();

    } // end of ev_addServer

    /**************************************************************************
     * 서버 정보 수정 이벤트
     **************************************************************************/
    function ev_pressUpdateServer() {

        var oDialog = sap.ui.getCore().byId("serverDlg");
        if (!oDialog) {
            return;
        }

        var oTable = sap.ui.getCore().byId("servlist");
        if (!oTable) {
            return;
        }

        var oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            return;
        }

        // Dialog 헤더 텍스트, 아이콘 변경
        var oServInfo = {
            TITLE: fnGetLanguClassTxt("0010"), // "Update Server Information"
            TRCOD: "U",
            ICON: "sap-icon://edit",
        };

        fnSetModelProperty("/SERVDLG", oServInfo);

        // 테이블에 선택된 Row 데이터 구하기
        var oCtx = oSelectedItem.getBindingContext(),
            oItemData = oTable.getModel().getProperty(oCtx.sPath);

        // Update Flag
        oItemData.TRCOD = "U";

        // 서버 정보 입력 필드 초기화
        fnSetModelProperty("/SERVDLGFORM", jQuery.extend(true, {}, oItemData));

        oDialog.open();

    } // end of ev_updateServer

    /**************************************************************************
     * 서버 정보 삭제 이벤트
     **************************************************************************/
    function ev_pressDeleteServer() {

        var oTable = sap.ui.getCore().byId("servlist");
        if (!oTable) {
            return;
        }

        var oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            return;
        }

        // 메시지 박스 옵션
        var oMsgBoxOpts = {
            title: fnGetLanguClassTxt("0011"), // "Delete Server Information"
            onClose: fnCallbackServerListDel,
            actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CANCEL,
            ],
            emphasizedAction: sap.m.MessageBox.Action.OK
        };

        sap.m.MessageBox.error(
            fnGetLanguClassTxt("0012"), // "Do you want to Delete?"
            oMsgBoxOpts
        );

    } // end of ev_deleteServer

    function fnCallbackServerListDel(oAction) {

        if (oAction != "OK") {
            return false;
        }

        var oTable = sap.ui.getCore().byId("servlist");
        if (!oTable) {
            return;
        }

        var oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            return;
        }

        // 테이블에 선택된 Row 데이터 구하기
        var oCtx = oSelectedItem.getBindingContext(),
            oItemData = oTable.getModel().getProperty(oCtx.sPath);

        var aServerInfo = fnGetModelProperty("/SERVERINFO"),
            iInfoLen = aServerInfo.length;

        for (var i = 0; i < iInfoLen; i++) {

            var oInfo = aServerInfo[i];

            if (oInfo.KEY != oItemData.KEY) {
                continue;
            }

            aServerInfo.splice(i, 1);
            break;

        }

        // ServerInfo.json 파일에 서버 정보 저장
        FS.writeFileSync(sServerInfoPath, JSON.stringify(aServerInfo));

        fnSetModelProperty("/SERVERINFO", aServerInfo);

        oTable.removeSelections(true);

    } // end of fnCallbackServerListDel

    /**************************************************************************
     * 서버 정보 저장 버튼 이벤트
     **************************************************************************/
    function ev_pressServerDlgSave() {

        var oFormData = fnGetModelProperty("/SERVDLGFORM");

        var sValueStatusNone = sap.ui.core.ValueState.None,
            sValueStatusError = sap.ui.core.ValueState.Error;

        // 각 필드별 Value State 값 초기화
        oFormData.SERVIP_VS = sValueStatusNone;
        oFormData.SERVIP_VSTXT = "";
        oFormData.INSNO_VS = sValueStatusNone;
        oFormData.INSNO_VSTXT = "";
        oFormData.SYSID_VS = sValueStatusNone;
        oFormData.SYSID_VSTXT = "";

        // IP 입력 확인
        if (!oFormData.SERVIP || oFormData.SERVIP == "") {

            oFormData.SERVIP_VS = sValueStatusError;
            oFormData.SERVIP_VSTXT = fnGetLanguClassTxt("0013"); // "You must Enter IP"

            sap.m.MessageToast.show(oFormData.SERVIP_VSTXT);

            fnSetModelProperty("/SERVDLGFORM", oFormData);
            return;
        }

        // Instance No 확인
        if (!oFormData.INSNO || oFormData.INSNO == "") {

            oFormData.INSNO_VS = sValueStatusError;
            oFormData.INSNO_VSTXT = fnGetLanguClassTxt("0014"); // "You must Enter Instance Number"

            sap.m.MessageToast.show(oFormData.INSNO_VSTXT);

            fnSetModelProperty("/SERVDLGFORM", oFormData);
            return;
        }

        // SYSTEM ID 확인
        if (!oFormData.SYSID || oFormData.SYSID == "") {

            oFormData.SYSID_VS = sValueStatusError;
            oFormData.SYSID_VSTXT = fnGetLanguClassTxt("0015"); // "You must Enter System ID"

            sap.m.MessageToast.show(oFormData.SYSID_VSTXT);

            fnSetModelProperty("/SERVDLGFORM", oFormData);
            return;
        }

        // 서버 정보 신규 저장시, 키를 부여한다.
        if (!oFormData.KEY) {
            oFormData.KEY = RANDOM.generate(10);
        }

        // 서버 정보를 PC에 저장한다.
        fnSaveP13nServerInfo(oFormData, oFormData.TRCOD);

        var oDialog = sap.ui.getCore().byId("serverDlg");
        if (!oDialog) {
            return;
        }

        oDialog.close();

        var oTable = sap.ui.getCore().byId("servlist");
        if (!oTable) {
            return;
        }

        oTable.removeSelections(true);

    } // end of ev_pressServerDlgSave

    /**************************************************************************
     * 초기값 바인딩
     **************************************************************************/
    function fnOnInitBinding() {

        var sValueStatusNone = sap.ui.core.ValueState.None;

        var oServDlg = {
            SERVDLG: {
                TITLE: "",
                TRCOD: ""
            },
            SERVDLGFORM: {
                SERVNM: "",
                SYSID: "",
                SYSID_VS: sValueStatusNone,
                SYSID_VSTXT: "",
                SERVIP_VS: sValueStatusNone,
                SERVIP_VSTXT: "",
                INSNO: "",
                INSNO_VS: sValueStatusNone,
                INSNO_VSTXT: "",
            }
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oServDlg);

        sap.ui.getCore().setModel(oJsonModel);

    } // end of fnOnInitBinding

    /**************************************************************************
     * Model에 값 세팅 및 변경
     **************************************************************************/
    function fnSetModelProperty(sModelPath, oModelData, bIsRef) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRef) {
            oCoreModel.refresh(true);
        }

    } // end of fnSetModelProperty

    /**************************************************************************
     * 해당 path의 모델 데이터 구하기
     **************************************************************************/
    function fnGetModelProperty(sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    } // end of fnGetModelProperty

    /**************************************************************************
     * 등록한 서버 정보 리스트를 pc에 파일로 저장
     **************************************************************************/
    function fnSaveP13nServerInfo(oServerInfo, TRCOD) {

        // server info 파일이 없으면 리턴
        if (!FS.existsSync(sServerInfoPath)) {

            var aServerInfo = [oServerInfo];

            // ServerInfo.json 파일에 서버 정보 저장
            FS.writeFileSync(sServerInfoPath, JSON.stringify(aServerInfo));

            fnSetModelProperty("/SERVERINFO", aServerInfo);

            return;

        }

        // server info 파일이 있을 경우 내용을 읽어서 테이블에 뿌린다.
        var sSavedData = FS.readFileSync(sServerInfoPath, 'utf-8'),
            aServerInfo = JSON.parse(sSavedData);

        if (aServerInfo == "") {
            aServerInfo = [];
        }

        if (TRCOD == "U") {

            aServerInfo = lf_update(aServerInfo, oServerInfo);

        } else {

            aServerInfo.push(oServerInfo);

        }

        // ServerInfo.json 파일에 서버 정보 저장
        FS.writeFileSync(sServerInfoPath, JSON.stringify(aServerInfo));

        fnSetModelProperty("/SERVERINFO", aServerInfo, true);


        // 업데이트 처리
        function lf_update(aServerInfo, oServerInfo) {

            var iInfoLen = aServerInfo.length;

            for (var i = 0; i < iInfoLen; i++) {

                var oInfo = aServerInfo[i];

                if (oInfo.KEY != oServerInfo.KEY) {
                    continue;
                }

                delete oServerInfo.TRCOD;

                aServerInfo[i] = oServerInfo;

                break;

            }

            return aServerInfo;

        } // end of lf_update

    } // end of fnSaveP13nServerInfo

    /**************************************************************************
     * Busy Indicator Function
     **************************************************************************/
    function fnSetBusy(bIsBusy) {

        // Busy Dialog 의 연결중 text를 설정한 언어에 맞게 보여주기
        oAPP.BUSYDIALOG.setText(
            fnGetLanguClassTxt("0023") //"Connecting...",
        );

        if (bIsBusy == 'X') {
            oAPP.BUSYDIALOG.open();
        } else {
            oAPP.BUSYDIALOG.close();
        }

    } // end of fnSetBusy

    /**************************************************************************
     * 브라우저 상단 메뉴 구성
     **************************************************************************/
    function fnOnBrowserMenuList() {

        var aWindowHeaderMenu = [{
            label: "Settings",
            submenu: [{
                key: "HMWS10",
                label: "Languages",
                submenu: [{
                        key: "en",
                        // key: "HMWS10_10",
                        // type: "checkbox",
                        // checked: true,
                        label: "ENGLISH",
                        click: fnLanguageSetting
                    },
                    {
                        key: "ko",
                        // key: "HMWS10_20",
                        // type: "checkbox",
                        label: "KOREAN",
                        click: fnLanguageSetting
                    }
                ]
            }, ]
        }];

        var oMenu = MENU.buildFromTemplate(aWindowHeaderMenu);

        var oCurrWin = REMOTE.getCurrentWindow();
        oCurrWin.setMenu(oMenu);

    } // end of fnOnBrowserMenuList

    /**************************************************************************
     * 언어 선택 이벤트
     **************************************************************************/
    function fnLanguageSetting(oEvent) {

        var sKey = oEvent.key;

        fnLoadLanguClass(sKey);

    } // end of fnLanguageSetting

    /**************************************************************************
     * 초기 로딩 시, 필요한 인스턴스 생성
     **************************************************************************/
    function fnOnInitInstanceCreate() {

        oAPP.BUSYDIALOG = new sap.m.BusyDialog({
            // title: "Server Connection",
            // titleAlignment: sap.m.TitleAlignment.Center,
            text: fnGetLanguClassTxt("0023"), //"Connecting...",
            // customIcon: "sap-icon://connected",
            showCancelButton: true,
            close: function () {
                xhr.abort();
            }
        });

    } // end of fnOnInitInstanceCreate

    /************************************************************************
     * 언어별 텍스트 목록 구하기
     * **********************************************************************
     * @param {String} sLangu  
     * - 언어키     * 
     ************************************************************************/
    function fnLoadLanguClass(sLangu) {

        // 언어별 텍스트가 저장되있는 json파일의 경로를 구한다.
        var sLanguPath = fnGetLanguClassFilePath(sLangu),
            bIsExists = FS.existsSync(sLanguPath);

        // 전달된 언어키에 대한 json 파일이 없으면 기본값 'en' (영어) 으로 구한다.
        if (!bIsExists) {
            sLangu = "en";
            sLanguPath = fnGetLanguClassFilePath("en");
        }

        // 해당 언어키에 맞는 json 파일을 읽어서 모델에 저장해둔다.
        var sLanguTxt = FS.readFileSync(sLanguPath, 'utf-8'),
            oLanguClsData = JSON.parse(sLanguTxt);

        fnSetModelProperty("/MSGCLS", oLanguClsData, true);

        // 현재 접속 언어를 글로벌에 저장해둔다.
        oAPP.language = sLangu;

    } // end of fnGetLanguClassFilePath

    /************************************************************************
     * 언어 클래스 파일 경로 구하기
     * **********************************************************************
     * @return {String} 
     * - 전달받은 언어키에 해당하는 메시지 클래스 파일 경로
     ************************************************************************/
    function fnGetLanguClassFilePath(sLangu) {

        var sLanguFileName = './i18n/' + sLangu + ".json",
            sLanguRealPath = PATH.join(parent.__dirname, sLanguFileName);

        return sLanguRealPath;

    } // end of fnGetLanguClassFilePath

    /************************************************************************
     * 언어별 클래스에서 해당 메시지 번호에 대한 언어 텍스트를 구한다.
     * **********************************************************************
     * @param {String} sMsgNo  
     * - 언어 클래스 번호
     *   
     * @return {String} 
     * - 메시지 번호에 해당하는 메시지 텍스트를 리턴한다.
     ************************************************************************/
    function fnGetLanguClassTxt(sMsgNo) {

        var oLanguClsData = fnGetModelProperty("/MSGCLS");
        if (!oLanguClsData) {
            return "";
        }

        return oLanguClsData[sMsgNo];

    } // end of fnGetLanguClassTxt

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    function fnGetSettingsInfo() {

        // Browser Window option
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = parent.require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    } // end of fnGetSettingsInfo

    /************************************************************************
     * WS의 UI5 Bootstrap 정보를 생성한다.
     ************************************************************************/
    function fnLoadBootStrapSetting() {

        var oSettings = fnGetSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            sLangu = navigator.language;

        sLangu = sLangu.toLowerCase().substring(0, 2); // 저장된 언어 값을 0부터 2까지 자르고 소문자로 변환하여 lang에 저장
        sLangu = sLangu.toUpperCase();

        var oScript = document.createElement("script");
        if (oScript == null) {
            return;
        }

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    } // end of fnLoadBootStrapSetting

    /************************************************************************
     * 공통 css을 적용한다.
     ************************************************************************/
    function fnLoadCommonCss() {

        var sCommonCssUrl = PATHINFO.COMMONCSS,
            oCss = document.createElement("link");

        oCss.setAttribute("rel", "stylesheet");
        oCss.setAttribute("href", sCommonCssUrl);

        document.head.appendChild(oCss);

    } // end of fnLoadCommonCss  

    /************************************************************************
     * 테마 정보 생성
     ************************************************************************/
    function fnP13nCreateTheme(SYSID) {

        return new Promise((resolve, reject) => {

            let sSysID = SYSID,
                sThemeJsonPath = PATH.join(USERDATA, "p13n", "theme", `${sSysID}.json`);

            // default Theme setting    
            let oWsSettings = fnGetSettingsInfo(),
                oDefThemeInfo = {
                    THEME: oWsSettings.defaultTheme,
                    BGCOL: oWsSettings.defaultBackgroundColor
                };

            // SYSTEM ID 테마 정보 JSON 파일 유무 확인
            if (!FS.existsSync(sThemeJsonPath)) {

                // 테마 정보가 없으면 신규 파일 생성 후 기본 테마 정보 전달
                FS.writeFile(sThemeJsonPath, JSON.stringify(oDefThemeInfo), {
                    encoding: "utf8",
                    mode: 0o777 // 올 권한
                }, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve(oDefThemeInfo);

                });

                return;
            }

            // // 테마 정보가 있을 경우 바로 읽어서 전달
            // var oThemeInfo1 = parent.require(sThemeJsonPath);
            // resolve(oThemeInfo1);
            FS.readFile(sThemeJsonPath, {
                encoding: "utf8",
            }, (err, data) => {

                if (err) {
                    reject(err.toString());
                    return;
                }

                resolve(JSON.parse(data));

            });


        });


    }


    /************************************************************************
     * ------------------------ [ Server List Start ] ------------------------
     * **********************************************************************/
    function fnOnInit() {

        sap.ui.getCore().attachInit(function () {

            // 초기값 바인딩
            fnOnInitBinding();

            // 브라우저 상단 메뉴 구성
            fnOnBrowserMenuList();

            // 초기 로딩 시, 필요한 인스턴스 생성
            fnOnInitInstanceCreate();

            // UI5의 필요한 Object 로드
            fnOnInitUi5LibraryPreload();

            // 언어별 텍스트 목록 구하기
            // fnLoadLanguClass(navigator.language);

            fnLoadLanguClass("EN");

            // 서버 리스트 개인화 정보 설정
            fnOnP13nConfig();

            // 서버 리스트 초기 화면 그리기
            fnOnInitRendering();

            setTimeout(() => {
                $('#content').fadeIn(1000, 'linear');
            }, 100);

        });

    } // end of fnOnInit

    // Bootstrap Setting
    fnLoadBootStrapSetting();

    // 공통 css load
    fnLoadCommonCss();

    // Window onload
    window.addEventListener("load", fnOnInit);

})();