/**************************************************************************
 * ServerList.js
 **************************************************************************/
let oAPP = parent.oAPP;


const
    require = parent.require,
    REMOTE = oAPP.REMOTE,
    REMOTEMAIN = REMOTE.require('@electron/remote/main'),
    RANDOM = REMOTE.require("random-key"),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    REGEDIT = require('regedit'),
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"),
    XMLJS = require('xml-js'),
    FS = REMOTE.require('fs'),

    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    SETTINGS = require(PATHINFO.WSSETTINGS);

const
    sPOPID = "editPopup",
    sBINDROOT = "/SAVEDATA";

const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

(function (oAPP) {
    "use strict";

    oAPP.setBusy = (bIsBusy) => {

        sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            sap.ui.core.BusyIndicator.show();
            return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        sap.ui.core.BusyIndicator.hide();

    }; // end of oAPP.fn.setBusy

    /************************************************************************
     * ------------------------ [ Server List Start ] ------------------------
     * **********************************************************************/
    oAPP.fn.fnOnMainStart = () => {

        oAPP.setBusy(true);

        jQuery.sap.require("sap.m.MessageBox");

        // 초기 화면 먼저 그리기
        oAPP.fn.fnOnInitRendering();

        setTimeout(async () => {

            // 기 저장된 SAPLogon 정보를 구한다.
            await oAPP.fn.fnGetSavedSapLogon();

            // 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
            oAPP.fn.fnOnListupSapLogon();

        }, 1000);

    }; // end of oAPP.fn.fnOnMainStart

    oAPP.fn.fnGetSavedSapLogon = () => {

        return new Promise((resolve) => {

            resolve();

        });

    }; // end of oAPP.fn.fnGetSavedSapLogon

    oAPP.fn.fnOnListupSapLogon = () => {

        oAPP.setBusy(true);

        // 레지스트리에 등록된 SAPLogon 정보를 읽는다.
        oAPP.fn.fnGetRegInfoForSAPLogon().then(oAPP.fn.fnGetRegInfoForSAPLogonThen).catch(oAPP.fn.fnPromiseError);

    };

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon 정보를 읽는다.
     ************************************************************************/
    oAPP.fn.fnGetRegInfoForSAPLogon = () => {

        return new Promise((resolve, reject) => {

            let sSaplogonPath = SETTINGS.regPaths.saplogon;

            REGEDIT.list(sSaplogonPath, (err, result) => {

                if (err) {
                    reject(err.toString());
                    return;
                }

                // 레지스트리에 SAPLogon 정보가 있는지 확인
                var oSapLogon = result[sSaplogonPath];

                if (typeof oSapLogon == "undefined" || oSapLogon.exists == false) {
                    reject(`Does not have exists. [${sSaplogonPath}]`);
                    return;
                }

                resolve(oSapLogon.values);

            });

        });

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogon

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon 정보를 구했을 경우
     ************************************************************************/
    oAPP.fn.fnGetRegInfoForSAPLogonThen = (oResult) => {

        let oLandscapeFile = oResult.LandscapeFile,
            oLandscapeFileGlobal = oResult.LandscapeFileGlobal;

        if (typeof oLandscapeFile == "undefined") {

            var sMsg = `Does not have exists. [LandscapeFile]`;

            sap.m.MessageBox.error(sMsg, {
                title: "Error", // default
                onClose: null, // default
                styleClass: "", // default
                actions: sap.m.MessageBox.Action.CLOSE, // default
                emphasizedAction: null, // default
                initialFocus: null, // default
                textDirection: sap.ui.core.TextDirection.Inherit // default
            });

            return;
        }

        let sLandscapeFilePath = oLandscapeFile.value;

        // SAPLogon xml 파일이 존재하지 않을 경우 오류
        if (!FS.existsSync(sLandscapeFilePath)) {

            var sMsg = `Does not have exists. [${sLandscapeFilePath}]`;

            sap.m.MessageBox.error(sMsg, {
                title: "Error", // default
                onClose: null, // default
                styleClass: "", // default
                actions: sap.m.MessageBox.Action.CLOSE, // default
                emphasizedAction: null, // default
                initialFocus: null, // default
                textDirection: sap.ui.core.TextDirection.Inherit // default
            });

            return;
        }

        if (!oAPP.isWatch) {
            FS.watch(sLandscapeFilePath, oAPP.fn.fnSapLogonFileChange);
            oAPP.isWatch = true;
        }

        // // SAPLogon xml 파일 내용 변경을 감지한다.
        // FS.watch(sLandscapeFilePath, oAPP.fn.fnSapLogonFileChange);

        // xml 정보를 읽는다
        oAPP.fn.fnReadSAPLogonData("LandscapeFile", sLandscapeFilePath)
            .then(oAPP.fn.fnReadSAPLogonDataThen)
            .catch(oAPP.fn.fnPromiseError);

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogonThen

    oAPP.fn.fnSapLogonFileChange = (current, previous) => {

        oAPP.fn.fnOnListupSapLogon();

    };

    oAPP.fn.fnReadSAPLogonDataThen = (oResult) => {

        // Landscape 정보를 글로벌 object에 저장
        oAPP.data.SAPLogon[oResult.fileName] = oResult.Result;

        // 결과 리스트
        oAPP.fn.fnGetSAPLogonLandscapeList();

        // WorkSpace Tree 구조 만들기
        oAPP.fn.fnGetSAPLogonWorkspace();

        oAPP.setBusy(false);

    }; // end of oAPP.fn.fnReadSAPLogonDataThen

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon xml 파일 정보를 JSON 데이터로 변환
     ************************************************************************/
    oAPP.fn.fnReadSAPLogonData = (sFileName, sFilePath) => {

        return new Promise((resolve, reject) => {

            FS.readFile(sFilePath, {
                "encoding": "utf8"
            }, (err, data) => {

                if (err) {
                    reject(err.toString());
                    return;
                }

                let xmlOption = {
                    ignoreComment: true,
                    ignoreDeclaration: true,
                    compact: true,
                    spaces: 4
                };

                var sResult = XMLJS.xml2json(data, xmlOption),
                    oResult = JSON.parse(sResult);

                resolve({
                    "fileName": sFileName,
                    "Result": oResult.Landscape
                });

            });

        }); // end of return new Promise

    }; // end of oAPP.fn.fnReadSAPLogonData

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon xml 파일 정보를 JSON 데이터로 변환
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonLandscapeList = () => {

        var oSAPLogonLandscape = oAPP.data.SAPLogon;
        if (oSAPLogonLandscape == null) {
            return;
        }

        var oLandscapeFile = oSAPLogonLandscape.LandscapeFile;
        if (oLandscapeFile == null) {
            return;
        }

        // 서비스 정보(등록된 서버 전체 목록)을 구한다.
        var aServices = oLandscapeFile.Services.Service,
            iServiceLength = aServices.length;

        if (iServiceLength == 0) {
            return;
        }

        oAPP.data.SAPLogon.aServices = oLandscapeFile.Services.Service;

        // 라우터 정보가 있을 경우..
        if (oLandscapeFile.Routers) {
            oAPP.data.SAPLogon.aRouters = oLandscapeFile.Routers.Router;
        }

        // 메시지 서버 정보가 있을 경우..
        if (oLandscapeFile.Messageservers) {
            oAPP.data.SAPLogon.aMessageservers = oLandscapeFile.Messageservers.Messageserver;
        }

        var aBindData = [];
        for (var i = 0; i < iServiceLength; i++) {

            var oService = aServices[i],
                oServiceAttr = oService._attributes;

            if (oServiceAttr == null) {
                continue;
            }

            // shortcut은 제외
            if (oServiceAttr.shortcut && oServiceAttr.shortcut == "1") {
                continue;
            }

            // mode가 1이면..
            if (oServiceAttr.mode && oServiceAttr.mode == "1") {

                var aServer = oServiceAttr.server.split(":");

                // Host와 port를 구한다.
                oServiceAttr.host = aServer[0];
                oServiceAttr.port = aServer[1];

            }

            // 라우터 id가 있다면 라우터 정보를 저장.. 
            if (oServiceAttr.routerid) {

                var oRouter = oAPP.data.SAPLogon.aRouters.find(element => element._attributes.uuid == oServiceAttr.routerid);

                oServiceAttr.router = (oRouter == null ? {} : oRouter._attributes);

            }

            // 메시지 서버 id가 있다면 메시지 서버정보 저장..
            if (oServiceAttr.msid) {

                var oMsgSvr = oAPP.data.SAPLogon.aMessageservers.find(element => element._attributes.uuid == oServiceAttr.msid);

                oServiceAttr.msgsvr = (oMsgSvr == null ? {} : oMsgSvr._attributes);

                // Host와 port를 구한다.
                oServiceAttr.host = oServiceAttr.msgsvr.host;
                oServiceAttr.port = oServiceAttr.msgsvr.port;

            }

            // port 가 있다면 instance no 구하기
            if (oServiceAttr.port) {
                oServiceAttr.insno = oServiceAttr.port.substring(2, 4);
            }

            aBindData.push(oServiceAttr);

        }

        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel) {
            oCoreModel.setProperty("ServerList", aBindData);
            oCoreModel.refresh();
            return;
        }

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            "ServerList": aBindData
        });

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnGetSAPLogonLandscapeList

    oAPP.fn.fnGetRegInfoForSAPLogonError = (oError) => {

        oAPP.setBusy(false);

        console.log(oError);

        alert(oError);

    };

    oAPP.fn.fnPromiseError = (oError) => {

        oAPP.setBusy(false);

        console.log(oError);

        alert(oError);

    };

    // 초기 화면 그리기
    oAPP.fn.fnOnInitRendering = () => {

        var oApp = new sap.m.App(),
            oTreeTable = oAPP.fn.fnGetWorkSpaceTreeTable(), // 좌측 폴더 Tree
            oTable = oAPP.fn.fnGetSAPLogonListTable(), // 우측 서버 리스트 테이블
            oPage1 = new sap.m.Page({
                showHeader: false,
                layoutData: new sap.ui.layout.SplitterLayoutData({
                    size: "30%",
                }),
                content: [
                    oTreeTable
                ]

            }),
            oPage2 = new sap.m.Page({
                showHeader: false,
                layoutData: new sap.ui.layout.SplitterLayoutData({

                }),
                content: [
                    oTable
                ]

            }),
            oMainPage = new sap.m.Page({
                enableScrolling: false,
                title: "SAPLogon Workspace View",
                content: [
                    new sap.ui.layout.Splitter({
                        height: "100%",
                        width: "100%",

                        contentAreas: [
                            oPage1,
                            oPage2
                        ]

                    }),

                ]
            });

        oApp.addPage(oMainPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnOnInitRendering

    // Workspace Tree Table
    oAPP.fn.fnGetWorkSpaceTreeTable = () => {

        return new sap.ui.table.TreeTable("WorkTree", {

            // properties
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            alternateRowColors: true,
            columnHeaderVisible: false,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            // layoutData: new sap.ui.layout.SplitterLayoutData({
            //     size: "300px",
            //     minSize: 300
            // }),
            columns: [
                new sap.ui.table.Column({
                    // width: "600px",
                    label: "Name",
                    template: new sap.m.Text({
                        text: "{_attributes/name}"
                    }),
                }),
            ],
            rows: {
                path: "/SAPLogon",
                parameters: {
                    arrayNames: ['Node']
                },
            },

            rowSelectionChange: oAPP.fn.fnPressWorkSpaceTreeItem

        });

    }; // end of oAPP.fn.fnGetWorkSpaceTreeTable

    // WorkSpace Tree Item Select Event
    oAPP.fn.fnPressWorkSpaceTreeItem = (oEvent) => {

        var oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        var oTable = oEvent.getSource(),
            oTableModel = oTable.getModel(),
            iSelIndx = oTable.getSelectedIndex();

        if (iSelIndx == -1) {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;
        }

        var sBindPath = oRowCtx.sPath,
            oSelectData = oTableModel.getProperty(sBindPath),
            oSelectItem = oSelectData.Item;

        if (typeof oSelectItem == "undefined") {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;

        }

        var iSelectItemLength = oSelectData.Item.length;

        // 선택한 Tree Item이 없을 경우 우측 테이블 클리어
        if (!oSelectItem) {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;
        }

        var aServerList = oTableModel.getProperty("/ServerList"),
            aItemList = [];

        // Item이 배열이 아닌 경우        
        if (typeof iSelectItemLength == "undefined") {

            var oFindItem = aServerList.find(element => element.uuid == oSelectItem._attributes.serviceid);
            if (oFindItem) {
                aItemList.push(oFindItem);
                oTableModel.setProperty("/SAPLogonItems", aItemList);
            }

            return;
        }

        for (var i = 0; i < iSelectItemLength; i++) {

            var oItem = oSelectData.Item[i],
                sServiceid = oItem._attributes.serviceid;

            var oFindItem = aServerList.find(element => element.uuid == sServiceid);
            if (!oFindItem) {
                continue;
            }

            aItemList.push(oFindItem);

        }

        oTableModel.setProperty("/SAPLogonItems", aItemList);

    }; // end of oAPP.fn.fnPressWorkSpaceTreeItem

    /************************************************************************
     * WorkSpace Tree 구조 만들기
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonWorkspace = () => {

        var aWorkSpace = oAPP.data.SAPLogon.LandscapeFile.Workspaces.Workspace;

        var oWorkSpace = {
            Node: [{
                _attributes: {
                    name: "Workspace",
                },
                Node: aWorkSpace
            }]
        };

        // 각 Node 별 데이터 정렬
        oWorkSpace.Node = oAPP.fn.fnWorkSpaceSort(oWorkSpace.Node);

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/SAPLogon", oWorkSpace);

        var oTreeTable = sap.ui.getCore().byId("WorkTree");
        oTreeTable.expandToLevel(1);

    }; // end of oAPP.fn.fnGetSAPLogonWorkspace

    /************************************************************************
     * 각 Node 별 데이터 정렬
     ************************************************************************/
    oAPP.fn.fnWorkSpaceSort = (aNode) => {

        var iNodeLength = aNode.length;

        if (iNodeLength == 0) {
            return;
        }

        // Node가 두개 이상이면 정렬을 한다.
        if (iNodeLength >= 2) {

            aNode = aNode.sort((a, b) => {

                var keyA = a._attributes.name.toUpperCase(),
                    keyB = b._attributes.name.toUpperCase();

                if (keyA < keyB) {
                    return -1;
                }

                if (keyA > keyB) {
                    return 1;
                }

                // 이름이 같을 경우
                return 0;

            });

        }

        for (var i = 0; i < iNodeLength; i++) {

            var oNode = aNode[i];
            if (!oNode.Node) {
                continue;
            }

            oAPP.fn.fnWorkSpaceSort(oNode.Node);

        }

        return aNode;

    }; // end of oAPP.fn.fnWorkSpaceSort

    /************************************************************************
     * 서버 리스트 테이블 그리기
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonListTable = () => {

        let oToolbar = oAPP.fn.fnGetSAPLogonListTableToolbar();

        return new sap.m.Table("serverlist_table", {
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: true,
            headerToolbar: oToolbar,
            mode: sap.m.ListMode.SingleSelectMaster,
            sticky: [sap.m.Sticky.ColumnHeaders],
            columns: [

                new sap.m.Column({
                    width: "150px",
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "status"
                    })
                }),

                new sap.m.Column({
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "name"
                    })
                }),

                new sap.m.Column({
                    hAlign: sap.ui.core.TextAlign.Center,
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "systemid"
                    })
                }),

                new sap.m.Column({
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "host"
                    })
                }),

                new sap.m.Column({
                    hAlign: sap.ui.core.TextAlign.Center,
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "insno"
                    })
                }),

            ],

            items: {
                path: "/SAPLogonItems",
                template: new sap.m.ColumnListItem({
                    type: sap.m.ListType.Active,
                    cells: [

                        new sap.m.ObjectStatus({
                            icon: "sap-icon://circle-task-2",
                        }).bindProperty("text", {
                            parts: [
                                "ISSAVE"
                            ],
                            formatter: (ISSAVE) => {

                                let sStatusTxt = "Not Saved";

                                if (ISSAVE == true) {
                                    sStatusTxt = "Saved";
                                }

                                return sStatusTxt;

                            }
                        }).bindProperty("state", {
                            parts: [
                                "ISSAVE"
                            ],
                            formatter: (ISSAVE) => {

                                let sState = sap.ui.core.ValueState.None;

                                if (ISSAVE == true) {
                                    sState = sap.ui.core.ValueState.Success;
                                }

                                return sState;

                            }
                        }).addStyleClass("u4aWsServerList"),

                        new sap.m.Text({
                            text: "{name}"
                        }),
                        new sap.m.Text({
                            text: "{systemid}"
                        }),
                        new sap.m.Text({
                            text: "{host}"
                        }),
                        new sap.m.Text({
                            text: "{insno}"
                        }),

                    ],

                })
            }
        }).attachBrowserEvent("dblclick", oAPP.fn.fnPressServerListItem);

    }; // end of oAPP.fn.fnGetSAPLogonListTable

    /************************************************************************
     * 서버 리스트 테이블의 헤더 툴바 영역
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonListTableToolbar = () => {

        return new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://edit",
                    press: (oEvent) => {

                        oAPP.fn.fnPressEdit();

                    }
                })
            ]
        });

    }; // end of oAPP.fn.fnGetSAPLogonListTableToolbar

    /************************************************************************
     * 서버 리스트 수정 버튼
     ************************************************************************/
    oAPP.fn.fnPressEdit = () => {

        let oTable = sap.ui.getCore().byId("serverlist_table");
        if (!oTable) {
            return;
        }

        // 선택한 라인 체크
        let oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            return;
        }

        // 선택한 라인의 바인딩 정보 체크
        let oCtx = oSelectedItem.getBindingContext();
        if (!oCtx) {
            return;
        }

        oAPP.fn.fnEditDialogOpen(oCtx);

    }; // end of oAPP.fn.fnPressEdit

    /************************************************************************
     * 서버 리스트 수정 팝업
     ************************************************************************/
    oAPP.fn.fnEditDialogOpen = (oCtx) => {

        // 선택한 라인의 바인딩 데이터
        let oCtxData = oCtx.getProperty(oCtx.getPath());

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            SERVER: oCtxData,
            oCtx: oCtx,
            SAVEDATA: {
                protocol: "http",
                host: "",
                port: ""
            },
        });

        var oDialog = sap.ui.getCore().byId(sPOPID);
        if (oDialog) {

            oDialog.setModel(oJsonModel);

            oDialog.open();

            return;
        }

        let oForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 12,
                labelSpanL: 12,
                labelSpanM: 12,
                labelSpanS: 12,
                singleContainerFullSize: false
            }),

            formContainers: [

                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: true,
                                design: "Bold",
                                text: "Protocol"
                            }),
                            fields: new sap.m.Select({
                                selectedKey: `{${sBINDROOT}/protocol}`,
                                items: [
                                    new sap.ui.core.Item({
                                        key: "http",
                                        text: "http"
                                    }),
                                    new sap.ui.core.Item({
                                        key: "https",
                                        text: "https"
                                    })
                                ]
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: true,
                                design: "Bold",
                                text: "Host"
                            }),
                            fields: new sap.m.Input({
                                value: `{${sBINDROOT}/host}`
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                required: true,
                                design: "Bold",
                                text: "Port"
                            }),
                            fields: new sap.m.Input({
                                maxLength: 5,
                                type: sap.m.InputType.Number,
                                value: `{${sBINDROOT}/port}`
                            })
                        }),

                    ] // end of formElements

                }),

            ] // end of formContainers

        });

        var oDialog = new sap.m.Dialog(sPOPID, {
            // properties
            draggable: true,
            resizable: true,
            title: "{/SERVER/name}",
            contentWidth: "500px",

            // aggregations
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: () => {

                        oAPP.fn.fnPressSave();

                    }
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: () => {

                        let oDialog = sap.ui.getCore().byId(sPOPID);
                        if (!oDialog) {
                            return;
                        }

                        oDialog.close();

                    }
                }),
            ],

            content: [
                oForm
            ],

            // association
            // initialFocus: "ws30_crname",
            // events

            afterClose: () => {

                let oDialog = sap.ui.getCore().byId(sPOPID);
                if (!oDialog) {
                    return;
                }

                let oDialogModel = oDialog.getModel();

                oDialogModel.setProperty(sBINDROOT, {});

            }

        });

        oDialog.setModel(oJsonModel);

        oDialog.open();

    }; // end of oAPP.fn.fnEditDialogOpen

    oAPP.fn.fnPressSave = async () => {

        oAPP.setBusy(true);

        let oDialog = sap.ui.getCore().byId(sPOPID);
        if (!oDialog) {
            oAPP.setBusy(false);
            return;
        }

        let oModel = oDialog.getModel(),
            oModelData = oModel.getData(),
            oServer = oModelData.SERVER,
            oSaveData = oModelData.SAVEDATA,
            oCtx = oModelData.oCtx;

        let oValid = await oAPP.fn.fnCheckValid(oSaveData);
        if (oValid.RETCD == "E") {

            // 오류 메시지 출력

            oAPP.setBusy(false);
            return;

        }

        // 입력한 데이터를 로컬 JSON 파일에 저장한다.
        let oLocalSaveData = {
            uuid: oServer.uuid,
            protocol: oSaveData.protocol,
            host: oSaveData.host,
            port: oSaveData.port,
        };

        debugger;

        // 

        let sPathInfoUrl = PATH.join(APPPATH, "Frame", "pathInfo.js");

        let oPathInfo = require(sPathInfoUrl);

        // 로컬에 저장된 서버리스트 정보 JSON PATH
        let sLocalJsonPath = oPathInfo.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류

            return;
        }

        // JSON 파일을 읽는다.
        let aSavedJsonData = REMOTE.require(sLocalJsonPath);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            // p13n.json 파일에 APPID Suggestion 정보 저장
            FS.writeFileSync(sLocalJsonPath, JSON.stringify([oLocalSaveData]));

            // 저장 완료 메시지!
            oAPP.setBusy(false);

            return;

        }

        aSavedJsonData.push(oLocalSaveData);



        oAPP.setBusy(false);

    }; // end of oAPP.fn.fnPressSave

    oAPP.fn.fnWriteFile = (path, file, option) => {

        let oDefaultOptions = {
            encoding: "utf-8",
            mode: 0o777,
            flag: "w"
        };

        let oOptions = Object.assign(oDefaultOptions, option);

        return new Promise((resolve) => {

            FS.writeFile(path, file, oOptions, (err) => {

                // 오류시
                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                // 성공시
                resolve({
                    RETCD: "S"
                });

            });

            // mode: 0o777
        });

    };

    oAPP.fn.fnCheckValid = (oSaveData) => {

        return new Promise((resolve) => {

            setTimeout(() => {

                resolve({
                    RETCD: "S"
                });

            }, 1000);


        });

    }; // end of oAPP.fn.fnCheckValid

    oAPP.fn.fnPressServerListItem = (oEvent) => {

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

        var oCtx = oSelectedRow.getBindingContext();
        if (oCtx == null) {
            return;
        }

        var sBindPath = oCtx.sPath,
            oCoreModel = sap.ui.getCore().getModel(),
            oBindData = oCoreModel.getProperty(sBindPath);

        console.log(oBindData);

        debugger;




    }; // end of oAPP.fn.fnPressServerListItem

})(oAPP);

/************************************************************************
 * WS의 UI5 Bootstrap 정보를 생성한다.
 ************************************************************************/
function fnLoadBootStrapSetting() {

    var oSettings = SETTINGS,
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
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout, sap.ui.table");

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

// Bootstrap Setting
fnLoadBootStrapSetting();

// 공통 css load
fnLoadCommonCss();

// Window onload
window.addEventListener("load", () => {
    sap.ui.getCore().attachInit(oAPP.fn.fnOnMainStart);
});