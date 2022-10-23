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
    XMLJS = require('xml-js'),
    FS = REMOTE.require('fs'),

    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    SETTINGS = require(PATHINFO.WSSETTINGS);


const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

(function(oAPP) {
    "use strict";

    oAPP.setBusy = (bIsBusy) => {

        sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {
            sap.ui.core.BusyIndicator.show();
            return;
        }

        sap.ui.core.BusyIndicator.hide();

    }; // end of oAPP.fn.setBusy

    /************************************************************************
     * ------------------------ [ Server List Start ] ------------------------
     * **********************************************************************/
    oAPP.fn.fnOnMainStart = () => {

        jQuery.sap.require("sap.m.MessageBox");

        // 초기 화면 먼저 그리기
        oAPP.fn.fnOnInitRendering();

        setTimeout(() => {

            oAPP.fn.fnOnListupSapLogon();

        }, 1000);

    }; // end of oAPP.fn.fnOnMainStart

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

        if(!oAPP.isWatch){
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

        debugger;

        oAPP.fn.fnOnListupSapLogon();

    };

    oAPP.fn.fnReadSAPLogonDataThen = (oResult) => {

        // Landscape 정보를 글로벌 object에 저장
        oAPP.data.SAPLogon[oResult.fileName] = oResult.Result;

        // 결과 리스트
        oAPP.fn.fnGetSAPLogonLandscapeList();

        //test
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
            oTable = oAPP.fn.fnGetSAPLogonListTable(),
            oTreeTable = oAPP.fn.fnTestGetTreeTable(),
            oMainPage = new sap.m.Page({
                title: "SAPLogon Landscape List",
                content: [
                    new sap.ui.layout.Splitter({
                        height: "100%",
                        width: "100%",

                        contentAreas: [
                            oTreeTable,
                            oTable
                        ]

                    }),

                ]
            });

        oApp.addPage(oMainPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnOnInitRendering

    // [test] Workspace Tree Table
    oAPP.fn.fnTestGetTreeTable = () => {

        return new sap.ui.table.TreeTable("WorkTree", {

            // properties
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            alternateRowColors: true,
            columnHeaderVisible: false,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size: "300px",
                minSize: 300
            }),
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

    }; // end of oAPP.fn.fnTestGetTreeTable

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

    // [test] WorkSpace Tree 구조 만들기
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

        oWorkSpace.Node = oAPP.fn.fnWorkSpaceSort(oWorkSpace.Node);

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/SAPLogon", oWorkSpace);

        var oTreeTable = sap.ui.getCore().byId("WorkTree");
        oTreeTable.expandToLevel(1);

    }; // end of oAPP.fn.fnGetSAPLogonWorkspace

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

    // 로그온 정보 테이블 그리기
    oAPP.fn.fnGetSAPLogonListTable = () => {

        return new sap.m.Table({
            fixedLayout: false,
            sticky: [sap.m.Sticky.ColumnHeaders],
            columns: [

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

        // 선택한 서버정보가 sap shortcut 이면..

        if (!oBindData.domain) {





            return;

        }

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