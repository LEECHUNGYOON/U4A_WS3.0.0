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
    sSERVER_TBL_ID = "serverlist_table",
    sBINDROOT = "/SAVEDATA";

const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

(function(oAPP) {
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

        // 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
        oAPP.fn.fnOnListupSapLogon();

        // setTimeout(async () => {

        //     // // 기 저장된 SAPLogon 정보를 구한다.
        //     // await oAPP.fn.fnGetSavedSapLogon();

        //     // 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
        //     oAPP.fn.fnOnListupSapLogon();

        // }, 1000);

    }; // end of oAPP.fn.fnOnMainStart

    // oAPP.fn.fnGetSavedSapLogon = () => {

    //     return new Promise((resolve) => {

    //         resolve();

    //     });

    // }; // end of oAPP.fn.fnGetSavedSapLogon

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
     ************************************************************************/
    oAPP.fn.fnOnListupSapLogon = () => {

        oAPP.setBusy(true);

        // 레지스트리에 등록된 SAPLogon 정보를 읽는다.
        oAPP.fn.fnGetRegInfoForSAPLogon().then(oAPP.fn.fnGetRegInfoForSAPLogonThen).catch(oAPP.fn.fnPromiseError);

    }; // end of oAPP.fn.fnOnListupSapLogon

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

            oAPP.fn.fnShowMessageBox("E", sMsg);

            return;
        }

        let sLandscapeFilePath = oLandscapeFile.value;

        // SAPLogon xml 파일이 존재하지 않을 경우 오류
        if (!FS.existsSync(sLandscapeFilePath)) {

            var sMsg = `Does not have exists. [${sLandscapeFilePath}]`;

            // 오류 메시지 출력
            oAPP.fn.fnShowMessageBox("E", sMsg);

            return;
        }

        // SAP Login XML 파일 정보 변경 감지
        if (!oAPP.isWatch) {
            FS.watch(sLandscapeFilePath, oAPP.fn.fnSapLogonFileChange);
            oAPP.isWatch = true;
        }

        // xml 정보를 읽는다
        oAPP.fn.fnReadSAPLogonData("LandscapeFile", sLandscapeFilePath)
            .then(oAPP.fn.fnReadSAPLogonDataThen)
            .catch(oAPP.fn.fnPromiseError);

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogonThen

    /************************************************************************
     * SAP LOGIN XML 파일이 바뀔때 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnSapLogonFileChange = (current, previous) => {

        oAPP.fn.fnOnListupSapLogon();

    }; // end of oAPP.fn.fnSapLogonFileChange

    /************************************************************************
     * SAP LOGIN XML 파일 읽기 성공
     ************************************************************************/
    oAPP.fn.fnReadSAPLogonDataThen = (oResult) => {

        if (oAPP.data.SAPLogon[oResult.fileName]) {
            oAPP.data.SAPLogon[oResult.fileName] = undefined;
        }

        // Landscape 정보를 글로벌 object에 저장
        oAPP.data.SAPLogon[oResult.fileName] = oResult.Result;

        // 결과 리스트
        oAPP.fn.fnGetSAPLogonLandscapeList();

        // WorkSpace Tree 구조 만들기
        oAPP.fn.fnGetSAPLogonWorkspace();

        // 데이터 갱신 후 화면도 갱신
        oAPP.fn.fnSetRefreshSelectTreeItem();

        oAPP.setBusy(false);

    }; // end of oAPP.fn.fnReadSAPLogonDataThen

    oAPP.fn.fnSetRefreshSelectTreeItem = () => {

        let oTreeTable = sap.ui.getCore().byId("WorkTree");
        if (!oTreeTable) {
            return;
        }

        let aSelectedIndex = oTreeTable.getSelectedIndices(),
            iSelectIndexLength = aSelectedIndex.length;

        if (iSelectIndexLength == 0) {
            return;
        }

        oTreeTable.clearSelection();

        oTreeTable.setSelectionInterval(aSelectedIndex[0], aSelectedIndex[0]);

    }; // end of oAPP.fn.fnSetRefreshSelectTreeItem

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
            oCoreModel.setProperty("/ServerList", aBindData);
            // oCoreModel.refresh(true);
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

        // alert(oError);

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogonError

    oAPP.fn.fnPromiseError = (oError) => {

        oAPP.setBusy(false);

        console.log(oError);

        // alert(oError);

    }; // end of oAPP.fn.fnPromiseError

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

            rowSelectionChange: (oEvent) => {

                // 좌측 트리 선택 이벤트
                oAPP.fn.fnPressWorkSpaceTreeItem(oEvent);

                // 우측 서버 리스트 전체 선택 해제
                oAPP.fn.fnServerListUnselect();

            }


        });

    }; // end of oAPP.fn.fnGetWorkSpaceTreeTable

    /************************************************************************
     * 우측 서버 리스트 전체 선택 해제
     ************************************************************************/
    oAPP.fn.fnServerListUnselect = () => {

        let oTable = sap.ui.getCore().byId(sSERVER_TBL_ID);
        if (oTable) {
            oTable.removeSelections();
        }

    }; // end of oAPP.fn.fnServerListUnselect

    /************************************************************************
     * WorkSpace Tree Item Select Event
     ************************************************************************/
    oAPP.fn.fnPressWorkSpaceTreeItem = (oEvent) => {

        let oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        let oTable = oEvent.getSource(),
            oTableModel = oTable.getModel(),
            iSelIndx = oTable.getSelectedIndex();

        // 선택된 라인이 없을 경우 우측 리스트 모델 초기화
        if (iSelIndx == -1) {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;
        }

        var sBindPath = oRowCtx.sPath,
            oSelectItemData = oTableModel.getProperty(sBindPath),
            oSelectSubItem = oSelectItemData.Item;

        // 선택된 라인에 해당하는 서버 리스트 값이 없을 경우 우측 리스트 모델 초기화
        if (typeof oSelectSubItem == "undefined") {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;

        }

        var iSelectSubItemLength = oSelectSubItem.length;

        // 선택한 Tree Item이 없을 경우 우측 테이블 클리어
        if (!oSelectSubItem) {
            oTableModel.setProperty("/SAPLogonItems", []);
            return;
        }

        var aServerList = oTableModel.getProperty("/ServerList"),
            aItemList = [];

        let aSavedAllData = [];

        // 기 저장된 값 전체를 구한다.
        let oSavedAllReturn = oAPP.fn.fnGetSavedServerListDataAll();
        if (oSavedAllReturn.RETCD == "S") {
            aSavedAllData = oSavedAllReturn.RETDATA;
        }

        // Item이 배열이 아닌 경우 (폴더의 하위 서버 정보 데이터가 1건만 있을 경우 object로 저장되어 있음.)       
        if (typeof iSelectSubItemLength == "undefined") {

            var oFindItem = aServerList.find(element => element.uuid == oSelectSubItem._attributes.serviceid);
            if (oFindItem) {

                let oFindCopyItem = jQuery.extend(true, {}, oFindItem);

                // 기 저장된 서버 정보가 있을 경우 저장 플래그를 심는다.
                let oSavedData = aSavedAllData.find(element => element.uuid == oFindCopyItem.uuid);
                if (oSavedData) {
                    oFindCopyItem.ISSAVE = true;
                }

                aItemList.push(oFindCopyItem);
                oTableModel.setProperty("/SAPLogonItems", aItemList);
            }

            return;
        }

        // 기 저장된 서버 호스트 정보가 있을 경우 저장 플래그를 심는다.
        for (var i = 0; i < iSelectSubItemLength; i++) {

            var oItem = oSelectItemData.Item[i], // 현재 선택된 메뉴의 서브 아이템
                sServiceid = oItem._attributes.serviceid;

            // 저장된 서버 호스트 정보를 찾는다.
            var oFindItem = aServerList.find(element => element.uuid == sServiceid);
            if (!oFindItem) {
                continue;
            }

            // 저장된 서버 호스트 정보가 있다면 저장 플래그를 심는다.
            let oFindCopyItem = jQuery.extend(true, {}, oFindItem),
                oSavedData = aSavedAllData.find(element => element.uuid == oFindCopyItem.uuid);

            if (oSavedData) {
                oFindCopyItem.ISSAVE = true;
            }

            aItemList.push(oFindCopyItem);

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

        return new sap.m.Table(sSERVER_TBL_ID, {
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: true,
            headerToolbar: oToolbar,
            mode: sap.m.ListMode.SingleSelectMaster,
            sticky: [sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar],
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

        let oTable = sap.ui.getCore().byId(sSERVER_TBL_ID);
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
        let oCtxData = oCtx.getProperty(oCtx.getPath()),
            oJsonModel = new sap.ui.model.json.JSONModel();

        var DEF_VS_STATE = {
            host_vs: sap.ui.core.ValueState.None,
            host_vst: "",
            port_vs: sap.ui.core.ValueState.None,
            port_vst: ""
        };

        let oModelData = {
            SERVER: oCtxData,
            oCtx: oCtx,
            SAVEDATA: {
                protocol: "http",
                host: "",
                port: "",
            },
            DEF_VS: jQuery.extend(true, {}, DEF_VS_STATE),
            VS_STATE: jQuery.extend(true, {}, DEF_VS_STATE),
        };

        // 이미 저장된 데이터가 있다면 저장된값으로 팝업을 띄운다
        let oSavedData = oAPP.fn.fnGetSavedServerListData(oCtxData.uuid);
        if (oSavedData.RETCD == "S") {

            let oFindData = oSavedData.RETDATA;

            oModelData.SAVEDATA.protocol = oFindData.protocol;
            oModelData.SAVEDATA.host = oFindData.host;
            oModelData.SAVEDATA.port = oFindData.port;

        }

        oJsonModel.setData(oModelData);

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
                            fields: new sap.m.Input("hostInput", {
                                value: `{${sBINDROOT}/host}`,
                                valueState: "{/VS_STATE/host_vs}",
                                valueStateText: "{/VS_STATE/host_vst}",
                                submit: () => {
                                    oAPP.fn.fnPressSave();
                                }
                            })
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: "Bold",
                                text: "Port"
                            }),
                            fields: new sap.m.Input("portInput", {
                                maxLength: 5,
                                type: sap.m.InputType.Number,
                                value: `{${sBINDROOT}/port}`,
                                valueState: "{/VS_STATE/port_vs}",
                                valueStateText: "{/VS_STATE/port_vs}",

                                submit: () => {
                                    oAPP.fn.fnPressSave();
                                }
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
            initialFocus: "hostInput",
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
        // oDialog.bindElement("/");
        oDialog.open();

    }; // end of oAPP.fn.fnEditDialogOpen

    /************************************************************************
     * 기 저장된 Server 정보 중 uuid 와 같은 데이터를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSavedServerListData = (pUUID) => {

        // 로컬에 저장된 서버리스트 정보 JSON PATH
        let sPathInfoUrl = PATH.join(APPPATH, "Frame", "pathInfo.js"),
            oPathInfo = require(sPathInfoUrl),
            sLocalJsonPath = oPathInfo.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류
            return {
                RETCD: "E",
                RTMSG: "ServerList file not exists."
            };

        }

        // JSON 파일을 읽는다.
        // let aSavedJsonData = REMOTE.require(sLocalJsonPath);
        let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
            aSavedJsonData = JSON.parse(sReadFileData);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            return {
                RETCD: "E",
                RTMSG: "not exists save file."
            };

        }

        let oFindData = aSavedJsonData.find(elem => elem.uuid == pUUID);
        if (!oFindData) {

            return {
                RETCD: "E",
                RTMSG: "not exists save file."
            };

        }

        return {
            RETCD: "S",
            RETDATA: oFindData
        };

    }; // end of oAPP.fn.fnGetSavedServerListData

    /************************************************************************
     * 기 저장된 서버리스트 데이터 전체를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSavedServerListDataAll = () => {

        // 로컬에 저장된 서버리스트 정보 JSON PATH
        let sPathInfoUrl = PATH.join(APPPATH, "Frame", "pathInfo.js"),
            oPathInfo = require(sPathInfoUrl),
            sLocalJsonPath = oPathInfo.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류
            return {
                RETCD: "E",
                RTMSG: "ServerList file not exists."
            };

        }

        // JSON 파일을 읽는다.        
        let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
            aSavedJsonData = JSON.parse(sReadFileData);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            return {
                RETCD: "E",
                RTMSG: "not exists save file."
            };

        }

        return {
            RETCD: "S",
            RETDATA: aSavedJsonData
        };

    }; // end of oAPP.fn.fnGetSavedServerListDataAll

    /************************************************************************
     * 서버 리스트 저장/수정 팝업 닫기
     ************************************************************************/
    oAPP.fn.fnEditDialogClose = () => {

        let oDialog = sap.ui.getCore().byId(sPOPID);
        if (!oDialog) {
            return;
        }

        if (oDialog.isOpen()) {
            oDialog.close();
        }

    }; // end of oAPP.fn.fnEditDialogClose

    /************************************************************************
     * 서버 리스트 저장
     ************************************************************************/
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
            oCtx = oModelData.oCtx,
            sBindPath = oCtx.getPath();

        let oDefault_VS = oModel.getProperty("/DEF_VS");
        oModel.setProperty("/VS_STATE", oDefault_VS);
        // oModel.refresh(true);

        let oValid = await oAPP.fn.fnCheckValid(oSaveData, oModel);
        if (oValid.RETCD == "E") {

            // 오류 메시지 출력
            // oAPP.fn.fnShowMessageBox(oValid.RETCD, oValid.RTMSG);

            // 오류 사운드
            oAPP.setSoundMsg("02");

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

        // 로컬에 저장된 서버리스트 정보 JSON PATH
        let sPathInfoUrl = PATH.join(APPPATH, "Frame", "pathInfo.js"),
            oPathInfo = require(sPathInfoUrl),
            sLocalJsonPath = oPathInfo.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류
            oAPP.fn.fnShowMessageBox("E", "server List file not exists. restart now!");

            oAPP.setBusy(false);

            return;
        }

        // JSON 파일을 읽는다.          
        let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
            aSavedJsonData = JSON.parse(sReadFileData);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            // 입력한 서버 호스트 정보를 로컬 JSON 파일로 저장한다.
            let oWriteFileResult = await oAPP.fn.fnWriteFile(sLocalJsonPath, JSON.stringify([oLocalSaveData]));
            if (oWriteFileResult.RETCD != "S") {

                // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
                oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG);

                oAPP.setBusy(false);

                return;

            }

            // 저장여부 플래그 값을 저장한다.
            var oCtxData = oCtx.getProperty(sBindPath);
            oCtxData.ISSAVE = true;

            oCtx.getModel().setProperty(sBindPath, oCtxData);

            // dialog를 닫는다.
            oAPP.fn.fnEditDialogClose();

            oAPP.setBusy(false);

            // 저장 완료 메시지!
            oAPP.fn.fnShowMessageBox("S", "saved Success!");

            // // 테이블 Row 선택 표시 해제
            // let oTable = sap.ui.getCore().byId(sSERVER_TBL_ID);
            // if (oTable) {
            //     oTable.removeSelections(true);
            // }

            return;

        } // JSON 파일 읽어보니 Array 타입이 아닌경우 -- end 

        let oFindData = aSavedJsonData.find(elem => elem.uuid == oLocalSaveData.uuid);
        if (oFindData) {

            // 입력한 데이터가 이미 저장되어 있었다면 overwrite를 한다.            
            oFindData = Object.assign(oFindData, oLocalSaveData);

        } else { // 기존에 저장된게 없다면 Append
            aSavedJsonData.push(oLocalSaveData);
        }

        // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
        let oWriteFileResult = await oAPP.fn.fnWriteFile(sLocalJsonPath, JSON.stringify(aSavedJsonData));
        if (oWriteFileResult.RETCD != "S") {

            // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
            oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG);

            return;

        }

        // 저장여부 플래그 값을 저장한다.
        var oCtxData = oCtx.getProperty(sBindPath);
        oCtxData.ISSAVE = true;
        oCtx.getModel().setProperty(sBindPath, oCtxData);

        // dialog를 닫는다.
        oAPP.fn.fnEditDialogClose();

        oAPP.setBusy(false);

        // 저장 완료 메시지!
        oAPP.fn.fnShowMessageBox("S", "saved Success!");

        // // 테이블 Row 선택 표시 해제
        // let oTable = sap.ui.getCore().byId(sSERVER_TBL_ID);
        // if (oTable) {
        //     oTable.removeSelections(true);
        // }

    }; // end of oAPP.fn.fnPressSave

    /************************************************************************
     * 파일 생성
     ************************************************************************/
    oAPP.fn.fnWriteFile = (path, file, option) => {

        let oDefaultOptions = {
            encoding: "utf-8",
            mode: 0o777,
            flag: "w"
        };

        let oOptions = Object.assign({}, oDefaultOptions, option);

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

    /************************************************************************
     * 입력값 Validation check
     ************************************************************************/
    oAPP.fn.fnCheckValid = (oSaveData, oModel) => {

        return new Promise((resolve) => {

            var oHostInput = sap.ui.getCore().byId("hostInput"),
                oPortInput = sap.ui.getCore().byId("portInput");

            let sHost = oSaveData.host,
                VS_STATE = {
                    host_vs: sap.ui.core.ValueState.None,
                    host_vst: "",
                    port_vs: sap.ui.core.ValueState.None,
                    port_vst: ""
                };

            // 입력된 값이 없을 경우
            if (!sHost || sHost == "") {

                var oResult = {
                    RETCD: "E",
                    RTMSG: "host is required!"
                };

                // Value State
                VS_STATE.host_vs = sap.ui.core.ValueState.Error;
                VS_STATE.host_vst = oResult.RTMSG;

                oModel.setProperty("/VS_STATE", VS_STATE);
                // oModel.refresh(true);

                resolve(oResult);

                // Host 입력 input에 포커스를 준다.
                setTimeout(() => {
                    if (oHostInput) {
                        oHostInput.focus();
                    }
                }, 0);


                return;
            }

            // 공백 문자 포함 여부 체크
            if (sHost.match(/\s/g)) {

                var oResult = {
                    RETCD: "E",
                    RTMSG: "Do not include Empty string!"
                };

                // Value State
                VS_STATE.host_vs = sap.ui.core.ValueState.Error;
                VS_STATE.host_vst = oResult.RTMSG;

                oModel.setProperty("/VS_STATE", VS_STATE);
                // oModel.refresh(true);

                resolve(oResult);

                // Host 입력 input에 포커스를 준다.
                setTimeout(() => {
                    if (oHostInput) {
                        oHostInput.focus();
                    }
                }, 0);

                return;

            }


            // 등록한 서버에 접속을 시도한다.





            



            resolve({
                RETCD: "S"
            });

        });

    }; // end of oAPP.fn.fnCheckValid

    /************************************************************************
     * 서버리스트 더블 클릭 이벤트
     ************************************************************************/
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

    /************************************************************************
     * 메시지 박스 공통 function
     ************************************************************************/
    oAPP.fn.fnShowMessageBox = (TYPE, sMsg, fnCallback) => {

        let fnCloseCallback = (oAction) => {

            if (typeof fnCallback === "function") {
                fnCallback(oAction);
            }

        };

        switch (TYPE) {

            case "S":

                sap.m.MessageBox.success(sMsg, {
                    title: "Success", // default
                    onClose: fnCloseCallback, // default
                    styleClass: "", // default
                    actions: sap.m.MessageBox.Action.OK, // default
                    emphasizedAction: sap.m.MessageBox.Action.OK, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                // 성공 사운드
                oAPP.setSoundMsg("01");

                break;

            case "E": // 에러 박스

                sap.m.MessageBox.error(sMsg, {
                    title: "Error", // default
                    onClose: fnCloseCallback, // default
                    styleClass: "", // default
                    actions: sap.m.MessageBox.Action.CLOSE, // default
                    emphasizedAction: null, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                // 오류 사운드
                oAPP.setSoundMsg("02");

                break;

            default:
                break;
        }

    }; // end of oAPP.fn.fnShowMessageBox

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