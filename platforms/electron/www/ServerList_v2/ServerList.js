/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ServerList.js
 * - file Desc : U4A Workspace Logon Pad
 ************************************************************************/

let oAPP = parent.oAPP;

const
    require = parent.require,
    REMOTE = oAPP.REMOTE,
    CURRWIN = REMOTE.getCurrentWindow(),
    // session = REMOTE.require('electron').session,
    REMOTEMAIN = REMOTE.require('@electron/remote/main'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    REGEDIT = require('regedit'),
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"),
    XMLJS = require('xml-js'),
    FS = REMOTE.require('fs'),
    RANDOM = require("random-key"),
    IPCRENDERER = require('electron').ipcRenderer,

    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    WSUTIL = parent.require(PATHINFO.WSUTIL),
    SETTINGS = require(PATHINFO.WSSETTINGS),
    XHR = new XMLHttpRequest();

XHR.withCredentials = true;

const
    SAPGUIVER = 7700,
    POPID = "editPopup",
    SERVER_TBL_ID = "serverlist_table",
    BINDROOT = "/SAVEDATA";

const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

(function (oAPP) {
    "use strict";

    oAPP.setBusy = (bIsBusy) => {

        sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            sap.ui.core.BusyIndicator.show(0);

            return;
        }

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        sap.ui.core.BusyIndicator.hide();

    }; // end of oAPP.fn.setBusy    

    /**************************************************************************
     * ajax 호출 펑션
     **************************************************************************/
    oAPP.fn.sendAjax = (sUrl, fnSuccess, fnError, fnCancel) => {

        // ajax call 취소할 경우..
        XHR.onabort = function () {

            if (typeof fnCancel == "function") {
                fnCancel();
            }

        };

        // ajax call 실패 할 경우
        XHR.onerror = function () {

            if (typeof fnError == "function") {
                fnError();
            }

        };

        XHR.onload = function () {

            if (typeof fnSuccess == "function") {
                fnSuccess(XHR.response);
            }

        };

        try {

            XHR.open('POST', sUrl, true);

            XHR.withCredentials = false;

        } catch (e) {

            if (typeof fnError == "function") {
                fnError(e.message);
            }

            return;
        }

        XHR.send();

    }; // end of fnSendAjax


    function _fnWait() {
        return new Promise((resolve) => {

            setTimeout(() => {
                resolve();
            }, 3000);

        });
    }

    /************************************************************************
     * ------------------------ [ Server List Start ] ------------------------
     * **********************************************************************/
    oAPP.fn.fnOnMainStart = async () => {

        jQuery.sap.require("sap.m.MessageBox");

        // 작업표시줄 메뉴 생성하기
        _createTaskBarMenu();

        // 현재 브라우저의 이벤트 핸들러
        _attachCurrentWindowEvents();

        // WS Global 메시지 글로벌 변수 설정
        await oAPP.fn.fnWsGlobalMsgList();

        // 초기 모델 구성
        await oAPP.fn.fnOnInitModeling();

        // 초기 화면 먼저 그리기
        oAPP.fn.fnOnInitRendering();

        // 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
        oAPP.fn.fnOnListupSapLogon(); // [내부 로직에 비동기가 있음]

        CURRWIN.focus();

    }; // end of oAPP.fn.fnOnMainStart


    /************************************************************************
     * WS Global 메시지 글로벌 변수 설정
     ************************************************************************/
    oAPP.fn.fnWsGlobalMsgList = () => {

        return new Promise(async (resolve) => {

            // 레지스트리에서 WS Global language 구하기
            let sWsLangu = await WSUTIL.getWsLanguAsync();

            oAPP.msg.M01 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "007"); // Saved success
            oAPP.msg.M02 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "008"); // Delete success
            oAPP.msg.M03 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "009"); // Please Check the SAPGUI is Installed and whether saved Server is exsists!
            oAPP.msg.M04 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "010"); // Server information does not exist in the SAPGUI logon file.
            oAPP.msg.M05 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "011"); // No SAPGUI version information.
            oAPP.msg.M06 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "012"); // SAPGUI version information not Found.
            oAPP.msg.M07 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "013"); // Not supported lower than SAPGUI 770 versions.
            oAPP.msg.M08 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "014"); // SAPGUI version information not Found.
            oAPP.msg.M09 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "015"); // Please contact U4A Solution Team!
            oAPP.msg.M10 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "016"); // Server List file not exists. restart now!
            oAPP.msg.M11 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "017"); // Not exists save file.
            oAPP.msg.M12 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "018"); // Server List file not exists.
            oAPP.msg.M13 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "019"); // host is required!
            oAPP.msg.M14 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "020"); // Do not include Empty string!







            resolve();

        });

    }; // end of oAPP.fn.fnWsGlobalMsgList

    oAPP.fn.fnOnInitModeling = () => {

        return new Promise(async (resolve) => {

            // WS Global Setting Lauguage에 맞는 메시지 텍스트 정보를 구한다.
            let oLanguTextResult = await WSUTIL.getWsMsgModelData();
            if (oLanguTextResult.RETCD == "E") {
                resolve();
                return;
            }

            let oLanguJsonData = oLanguTextResult.RTDATA,
                oCoreModel = sap.ui.getCore().getModel(),
                oJsonModel = new sap.ui.model.json.JSONModel();

            if (!oCoreModel) {

                oJsonModel.setData({
                    WSLANGU: oLanguJsonData
                });

                sap.ui.getCore().setModel(oJsonModel);

                resolve();

                return;
            }

            oCoreModel.setProperty("/WSLANGU", oLanguJsonData);
            resolve();

        });

    }; // end of oAPP.fn.fnOnInitModeling

    oAPP.fn.fnRegisterIllustrationPool = () => {

        jQuery.sap.require("sap.m.IllustrationPool");

        let oTntSet = {
            setFamily: "tnt",
            setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
        };

        let oPool = sap.m.IllustrationPool;

        // register tnt illustration set
        oPool.registerIllustrationSet(oTntSet, false);

    }; // end of oAPP.fn.fnRegisterIllustrationPool

    oAPP.fn.fnAttachRowsUpdateOnce = async (oControl) => {

        let oWorkTree = oControl.getSource(),
            oTreeModel = oWorkTree.getModel();

        if (!oTreeModel) {
            return;
        }

        let oWsSettings = fnGetSettingsInfo(),
            oRegPaths = oWsSettings.regPaths,
            sLogonSettingsPath = oRegPaths.LogonSettings;

        // 레지스트리에 Logon setting 정보를 읽는다.
        let oResult = await _getRegeditList([sLogonSettingsPath]);
        if (oResult.RETCD == "E") {
            return;
        }

        let oRegData = oResult.RTDATA[sLogonSettingsPath];
        if (!oRegData) {
            return;
        }

        // 마지막 선택한 노드의 키값을 구한다.
        let oValues = oRegData.values["LastSelectedNodeKey"];
        if (!oValues) {
            return;
        }

        let sLastSelectNodeKey = oValues.value, // 마지막 선택한 노드 키
            oTreeModelData = oTreeModel.getProperty("/SAPLogon");

        if (!oTreeModelData || !oTreeModelData.Node) {
            return;
        }

        let aPaths = [];

        // 마지막 선택한 노드를 찾았는지 여부 플래그
        oAPP.bFindNode = false;

        // 마지막 선택한 경로의 패스를 만든다.
        _findLastSelectedPath(oTreeModelData.Node, sLastSelectNodeKey, aPaths);

        let iRowIndex = 0;

        let iPathLength = aPaths.length;
        for (var i = 0; i < iPathLength; i++) {

            const sPath = aPaths[i];

            let oTreeBinding = oWorkTree.getBinding(),
                iTreeLength = oTreeBinding.getLength();

            for (var j = iRowIndex; j < iTreeLength; j++) {

                let oNode = oTreeBinding.getNodeByIndex(j),
                    oCtx = oNode.context,
                    sUUID = oCtx.getProperty("_attributes/uuid");

                if (sUUID !== sPath) {
                    continue;
                }

                // 마지막 선택한 노드를 찾지 못한 경우에만 expand 하고
                // 찾은 경우는 하지 않는다.
                if (j !== iPathLength - 1) {

                    let oNodeState = oNode.nodeState,
                        bIsExpanded = oNodeState.expanded;

                    if (!bIsExpanded) {
                        oWorkTree.expand(j);
                    }

                }

                iRowIndex = j + 1;

                break;

            }

        }

        let iFindIndex = iRowIndex - 1;
        oWorkTree.setSelectedIndex(iFindIndex);
        oWorkTree.setFirstVisibleRow(iFindIndex);

    }; // end of oAPP.fn.fnAttachRowsUpdateOnce

    function _findLastSelectedPath(aTreeData, sLastSelectNodeKey, aPaths) {

        if (!Array.isArray(aTreeData) && typeof aTreeData === "object") {

            var uuid = aTreeData._attributes.uuid;

            if (uuid === sLastSelectNodeKey) {
                aPaths.push(uuid);
                oAPP.bFindNode = true;
                return;
            }

            if (!aTreeData.Node) {
                return;
            }

            if (uuid) {
                aPaths.push(uuid);
            }

            if (!aTreeData.Node) {
                return;
            }

            _findLastSelectedPath(aTreeData.Node, sLastSelectNodeKey, aPaths);

            // 이미 찾았다면 빠져나감.
            if (oAPP.bFindNode == true) {
                return;
            }

            aPaths.pop();
            return;

        }

        let iTreeLength = aTreeData.length;
        if (iTreeLength == 0) {
            return;
        }

        for (var i = 0; i < iTreeLength; i++) {

            // 이미 찾았다면 빠져나감.
            if (oAPP.bFindNode == true) {
                return;
            }

            const elem = aTreeData[i];

            if (!elem._attributes) {
                continue;
            }

            if (!elem._attributes.uuid) {

                if (elem.Node) {
                    _findLastSelectedPath(elem.Node, sLastSelectNodeKey, aPaths);
                    return;
                }

                continue;

            }

            if (elem._attributes.uuid === sLastSelectNodeKey) {
                aPaths.push(elem._attributes.uuid);
                oAPP.bFindNode = true;
                return;
            }

            if (!elem.Node) {
                continue;
            }

            if (elem._attributes.uuid) {
                aPaths.push(elem._attributes.uuid);
            }

            _findLastSelectedPath(elem.Node, sLastSelectNodeKey, aPaths);

            // 이미 찾았다면 빠져나감.
            if (oAPP.bFindNode == true) {
                return;
            }

            aPaths.pop();

        }

    }

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
     ************************************************************************/
    oAPP.fn.fnOnListupSapLogon = () => {

        // 전체 바인딩 모델 clear
        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel) {
            oCoreModel.setProperty("/SAPLogon", {});
            oCoreModel.setProperty("/ServerList", []);
            oCoreModel.refresh(true);
        }

        // 좌측 테이블 선택 라인 표시 
        oAPP.fn.fnSetRefreshSelectTreeItem();

        // 우측 테이블 모델 클리어
        oAPP.fn.fnMTableModelClear();

        oAPP.setBusy(true);

        // 레지스트리에 등록된 SAPLogon 정보를 읽는다.
        oAPP.fn.fnGetRegInfoForSAPLogon().then(oAPP.fn.fnGetRegInfoForSAPLogonThen).catch(oAPP.fn.fnPromiseError);

    }; // end of oAPP.fn.fnOnListupSapLogon

    /************************************************************************
     * 우측 테이블 초기화
     ************************************************************************/
    oAPP.fn.fnMTableModelClear = () => {

        let oTable = sap.ui.getCore().byId(SERVER_TBL_ID);
        if (!oTable) {
            return;
        }

        let oTableModel = oTable.getModel();
        if (!oTableModel) {
            return;
        }

        oTableModel.setProperty("/SAPLogonItems", []);

    }; // end of oAPP.fn.fnMTableModelClear

    /************************************************************************
     * 레지스트리에 등록된 SAPLogon 정보를 읽는다.
     ************************************************************************/
    oAPP.fn.fnGetRegInfoForSAPLogon = () => {

        return new Promise((resolve, reject) => {

            let sSaplogonPath = SETTINGS.regPaths.saplogon,
                sErrMsg = oAPP.msg.M03; //"Please Check the SAPGUI is Installed and whether saved Server is exsists!";

            REGEDIT.list(sSaplogonPath, (err, result) => {

                if (err) {

                    reject(sErrMsg);
                    return;
                }

                // 레지스트리에 SAPLogon 정보가 있는지 확인
                var oSapLogon = result[sSaplogonPath];

                if (typeof oSapLogon == "undefined" || oSapLogon.exists == false) {

                    // reject(`Does not have exists. [${sSaplogonPath}]`);

                    // let sMsg = "Please Check the SAPGUI is Installed and whether saved Server is exsists!";

                    reject(sErrMsg);
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
            oLandscapeFileGlobal = oResult.LandscapeFileGlobal,
            sLandscapeFilePath = oLandscapeFile.value,
            sErrMsg = oAPP.msg.M03; //"Please Check the SAPGUI is Installed and whether saved Server is exsists!";

        if (typeof oLandscapeFile == "undefined") {

            oAPP.setBusy(false);

            // var sMsg = `Does not have exists. [LandscapeFile] \n Please Restart`;           

            oAPP.fn.fnShowMessageBox("E", sErrMsg, () => {
                oAPP.fn.fnEditDialogClose();
            });

            return;
        }

        // SAPLogon xml 파일이 존재하지 않을 경우 오류
        if (!FS.existsSync(sLandscapeFilePath)) {

            oAPP.setBusy(false);

            // var sMsg = `Does not have exists. [${sLandscapeFilePath}] \n Please Restart`;
            // let sMsg = "Please Check the SAPGUI is Installed and whether saved Server is exsists!";

            // 오류 메시지 출력
            oAPP.fn.fnShowMessageBox("E", sErrMsg, () => {
                oAPP.fn.fnEditDialogClose();
            });

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
    oAPP.fn.fnReadSAPLogonDataThen = async (oResult) => {

        // sapgui 버전을 체크한다.
        let oCheckVer = oAPP.fn.fnCheckSapguiVersion(oResult.Result);
        if (oCheckVer.RETCD == "E") {

            oAPP.fn.fnShowMessageBox("E", oCheckVer.RTMSG, () => {

                APP.exit();

            });

            console.error(oCheckVer.RTMSG);

            oAPP.setBusy(false);

            return;
        }

        let oWsSettings = fnGetSettingsInfo(),
            oRegPaths = oWsSettings.regPaths,
            sGUIVerPath = oRegPaths.GUIVer,
            cSessionPath = oRegPaths.cSession;

        let SAPGUIVER = oCheckVer.RTVER,
            sRegPath1 = sGUIVerPath, // "HKCU\\SOFTWARE\\U4A\\WS\\GUIVer",
            sRegPath2 = cSessionPath; // "HKCU\\SOFTWARE\\U4A\\WS\\cSession";

        const Regedit = parent.require('regedit').promisified;

        // 레지스트리 폴더 생성
        await Regedit.createKey([sRegPath1]);
        await Regedit.createKey([sRegPath2]);

        // 레지스트리 데이터 저장
        await Regedit.putValue({
            "HKCU\\SOFTWARE\\U4A\\WS\\GUIVer": {
                "GUIVer": {
                    value: SAPGUIVER,
                    type: "REG_DEFAULT"
                }
            }
        });

        if (oAPP.data.SAPLogon[oResult.fileName]) {
            oAPP.data.SAPLogon[oResult.fileName] = undefined;
        }

        // Landscape 정보를 글로벌 object에 저장
        oAPP.data.SAPLogon[oResult.fileName] = oResult.Result;

        // 결과 리스트
        let oLogonResult = oAPP.fn.fnGetSAPLogonLandscapeList();
        if (oLogonResult.RETCD == "E") {

            // oAPP.fn.fnShowMessageBox("E", oLogonResult.RTMSG);

            console.error(oLogonResult.RTMSG);

            oAPP.setBusy(false);

            return;
        }

        // WorkSpace Tree 구조 만들기
        oAPP.fn.fnCreateWorkspaceTree();

        // Tree Node 펼치기
        var oTreeTable = sap.ui.getCore().byId("WorkTree");
        if (oTreeTable) {
            oTreeTable.expandToLevel(1);
        }

        // 데이터 갱신 후 화면도 갱신
        oAPP.fn.fnSetRefreshSelectTreeItem();

        oAPP.setBusy(false);

        let oWorkTree = sap.ui.getCore().byId("WorkTree");
        if (oWorkTree) {
            oWorkTree.attachEventOnce("rowsUpdated", oAPP.fn.fnAttachRowsUpdateOnce);
        }

    }; // end of oAPP.fn.fnReadSAPLogonDataThen    

    /************************************************************************
     * sapgui Version 체크
     * sapgui 770버전 이하는 지원 불가!!
     ************************************************************************/
    oAPP.fn.fnCheckSapguiVersion = (oResult) => {

        // 성공 실패 공통 리턴 구조
        let oErr = {
            RETCD: "E",
            RTMSG: oAPP.msg.M04, // "Server information does not exist in the SAPGUI logon file."
        },
            oSucc = {
                RETCD: "S",
                RTMSG: ""
            };

        if (!oResult) {
            return oErr;
        }

        // xml의 attribute
        let oAttribute = oResult._attributes;
        if (!oAttribute) {
            return oErr;
        }

        let sGenerator = oAttribute.generator;
        if (!sGenerator || sGenerator == "") {
            return oErr;
        }

        // // 버전 정보를 정규식으로 발췌한다.               
        // let oRegex = new RegExp(/(?<=v)(.*?)(?=\.)/g, "i"),
        //     aVersion = oRegex.exec(sGenerator);

        // 버전 정보를 정규식으로 발췌한다.               
        let sVerRegex = /(?<=v)(.*)/g,
            aVersion = sGenerator.match(sVerRegex);

        // 정규식으로 null 값이면 버전정보가 없다고 간주함.
        if (aVersion == null) {
            oErr.RTMSG = oAPP.msg.M05; // "No SAPGUI version information.";
            return oErr;
        }

        // 정규식으로 버전 정보를 찾았다면 Array 타입
        if (Array.isArray(aVersion) == false) {
            oErr.RTMSG = oAPP.msg.M05; // "No SAPGUI version information.";
            return oErr;
        }

        let sVer = aVersion[0],
            parseVer = parseInt(sVer);

        if (isNaN(parseVer)) {

            oErr.RTMSG = oAPP.msg.M06; // "SAPGUI version information not Found.";
            return oErr;
        }

        // 770 보다 낮다면 지원 불가
        if (parseVer < SAPGUIVER) {

            //"Not supported lower than SAPGUI 770 versions. \n Please upgrade SAPGUI 770 or Higher";
            oErr.RTMSG = oAPP.msg.M07 + " \n " + oAPP.msg.M08;
            return oErr;
        }

        // SAPGUI 버전을 리턴한다.
        oSucc.RTVER = sVer;

        return oSucc;

    }; // end of oAPP.fn.fnCheckSapguiVersion

    /************************************************************************
     * 좌측 workspace의 Tree Item을 선택 해제 후 재선택하여 Refresh 효과를 준다.
     ************************************************************************/
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

        // 성공 실패 공통 리턴 구조
        let oErr = {
            RETCD: "E",
            RTMSG: oAPP.msg.M04 // "Server information does not exist in the SAPGUI logon file."
        },
            oSucc = {
                RETCD: "S",
                RTMSG: ""
            };

        var oSAPLogonLandscape = oAPP.data.SAPLogon;
        if (oSAPLogonLandscape == null) {
            return oErr;
        }

        var oLandscapeFile = oSAPLogonLandscape.LandscapeFile;
        if (oLandscapeFile == null) {
            return oErr;
        }

        if (!oLandscapeFile.Services) {
            return oErr;
        }

        // 서비스 정보(등록된 서버 전체 목록)을 구한다.
        var aServices = oLandscapeFile.Services.Service;
        if (!aServices) {
            return oErr;
        }

        // 서비스 정보가 있을 경우..
        if (Array.isArray(aServices) == true) {
            oAPP.data.SAPLogon.aServices = oLandscapeFile.Services.Service;
        } else {
            oAPP.data.SAPLogon.aServices = [aServices];
        }

        // 라우터 정보가 있을 경우..
        if (oLandscapeFile.Routers) {

            if (Array.isArray(oLandscapeFile.Routers.Router) == true) {
                oAPP.data.SAPLogon.aRouters = oLandscapeFile.Routers.Router;
            } else {
                oAPP.data.SAPLogon.aRouters = [oLandscapeFile.Routers.Router];
            }

        }

        // 메시지 서버 정보가 있을 경우..
        if (oLandscapeFile.Messageservers) {

            if (Array.isArray(oLandscapeFile.Messageservers.Messageserver) == true) {
                oAPP.data.SAPLogon.aMessageservers = oLandscapeFile.Messageservers.Messageserver;
            } else {
                oAPP.data.SAPLogon.aMessageservers = [oLandscapeFile.Messageservers.Messageserver];
            }

        }

        var aBindData = [],
            aServices = oAPP.data.SAPLogon.aServices,
            iServiceLength = aServices.length;

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
            return oSucc;
        }

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            "ServerList": aBindData
        });

        sap.ui.getCore().setModel(oJsonModel);

        return oSucc;

    }; // end of oAPP.fn.fnGetSAPLogonLandscapeList

    oAPP.fn.fnGetRegInfoForSAPLogonError = (oError) => {

        let sMsg = oError.toString();

        sMsg += " \n " + oAPP.msg.M09; //"Please contact U4A Solution Team!";

        // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
        oAPP.fn.fnShowMessageBox("E", sMsg, () => {

            APP.exit();

        });

        oAPP.setBusy(false);

        zconsole.log(oError);

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogonError

    oAPP.fn.fnPromiseError = (oError) => {

        let sMsg = oError.toString();

        sMsg += " \n " + oAPP.msg.M09; //"Please contact U4A Solution Team!";

        // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
        oAPP.fn.fnShowMessageBox("E", sMsg, () => {

            APP.exit();

        });

        oAPP.setBusy(false);

        zconsole.log(oError);

    }; // end of oAPP.fn.fnPromiseError

    // 초기 화면 그리기
    oAPP.fn.fnOnInitRendering = () => {

        var oApp = new sap.m.App({
            autoFocus: false,
        }),
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
                customHeader: new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Image({
                            width: "25px",
                            src: PATHINFO.WS_LOGO
                        }),
                        new sap.m.Title({
                            text: "U4A Workspace"
                        }),
                    ],
                    contentRight: [
                        new sap.m.Button({
                            icon: "sap-icon://less",
                            press: function () {

                                CURRWIN.minimize();

                            }
                        }),
                        new sap.m.Button("maxWinBtn", {
                            icon: "sap-icon://header",
                            press: function (oEvent) {

                                let bIsMax = CURRWIN.isMaximized();

                                if (bIsMax) {
                                    CURRWIN.unmaximize();
                                    return;
                                }

                                CURRWIN.maximize();

                            }
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://decline",
                            press: function () {

                                let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
                                    iBrowserListLength = aBrowserList.length,
                                    iChildLength = 0;

                                for (var i = 0; i < iBrowserListLength; i++) {

                                    const oBrows = aBrowserList[i];

                                    if (oBrows.isDestroyed()) {
                                        continue;
                                    }

                                    var oWebCon = oBrows.webContents,
                                        oWebPref = oWebCon.getWebPreferences();

                                    // 서버리스트, Floting menu는 카운트 제외
                                    if (oWebPref.OBJTY == "SERVERLIST" || oWebPref.OBJTY == "FLTMENU") {
                                        continue;
                                    }

                                    ++iChildLength;

                                }

                                if (iChildLength == 0) {
                                    APP.exit();
                                    return;
                                }

                                oAPP.fn.showIllustratedMsg();

                            }
                        }),
                    ]
                }).addStyleClass("u4aWsBrowserDraggable"),
                subHeader: new sap.m.Bar({
                    contentLeft: [
                        new sap.m.Title({
                            text: "{/WSLANGU/ZMSG_WS_COMMON_001/004}" // U4A Workspace Logon Pad
                        }),
                    ],
                    contentRight: [
                        new sap.m.MenuButton({
                            icon: "sap-icon://action-settings",
                            menu: new sap.m.Menu({
                                items: [
                                    new sap.m.MenuItem({
                                        key: "WSLANGU",
                                        icon: "sap-icon://translate",
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/001}" // Language
                                    }),
                                    new sap.m.MenuItem({
                                        key: "WSTHEME",
                                        icon: "sap-icon://palette",
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/005}" // Theme
                                    }),
                                    new sap.m.MenuItem({
                                        key: "ABOUTWS",
                                        icon: "sap-icon://hint",
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/044}" // About WS..
                                    })
                                ],

                                itemSelected: function (oEvent) {
                                    ev_settingItemSelected(oEvent);
                                }
                            })
                        })
                    ]
                }),
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

        oApp.addEventDelegate({
            onAfterRendering: function () {

                setTimeout(() => {
                    $('#content').fadeIn(300, 'linear');
                }, 300);

            }
        });

    }; // end of oAPP.fn.fnOnInitRendering

    // Workspace Tree Table
    oAPP.fn.fnGetWorkSpaceTreeTable = () => {

        let oWorkTree = new sap.ui.table.TreeTable("WorkTree", {

            // properties
            selectionMode: sap.ui.table.SelectionMode.Single,
            selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
            alternateRowColors: true,
            columnHeaderVisible: false,
            visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,

            // aggregations
            columns: [
                new sap.ui.table.Column({
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

                // 우측 서버 리스트 전체 선택 해제
                oAPP.fn.fnServerListUnselect();

                // 좌측 트리 선택 이벤트
                oAPP.fn.fnPressWorkSpaceTreeItem(oEvent);

            }

        });

        // oWorkTree.attachEventOnce("rowsUpdated", oAPP.fn.fnAttachRowsUpdateOnce);

        return oWorkTree;

    }; // end of oAPP.fn.fnGetWorkSpaceTreeTable

    /************************************************************************
     * 우측 서버 리스트 전체 선택 해제
     ************************************************************************/
    oAPP.fn.fnServerListUnselect = () => {

        let oTable = sap.ui.getCore().byId(SERVER_TBL_ID);
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

        // 선택한 라인 위치를 개인화 파일에 저장한다.
        oAPP.fn.fnSetSaveSelectedItemPosition(oSelectItemData);

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
     * 선택한 라인 위치를 개인화 파일에 저장한다.
     ************************************************************************/
    oAPP.fn.fnSetSaveSelectedItemPosition = async (oSelectItemData) => {

        if (!oSelectItemData) {
            return;
        }

        if (!oSelectItemData._attributes) {
            return;
        }

        // 선택한 라인의 UUID를 구한다.
        let oSelectedItem = oSelectItemData._attributes,
            sUUID = oSelectedItem.uuid, // 선택한 UUID
            LastSelectedNodeKey = sUUID;

        let oWsSettings = fnGetSettingsInfo(),
            oRegPaths = oWsSettings.regPaths,
            sSettingsPath = oRegPaths.LogonSettings;

        let oRegData = {};
        oRegData[sSettingsPath] = {};
        oRegData[sSettingsPath]["LastSelectedNodeKey"] = {
            value: LastSelectedNodeKey,
            type: "REG_SZ"
        };

        const RegeditPromisified = parent.require('regedit').promisified;

        // 레지스트리 데이터 저장
        await RegeditPromisified.putValue(oRegData);


    }; // end of oAPP.fn.fnSetSaveSelectedItemPosition

    /************************************************************************
     * WorkSpace Tree 구조 만들기
     ************************************************************************/
    oAPP.fn.fnCreateWorkspaceTree = () => {

        let aWorkSpace = oAPP.data.SAPLogon.LandscapeFile.Workspaces.Workspace,
            oWorkSpace = {
                Node: [{
                    _attributes: {
                        name: "Workspace",
                        uuid: "WorkspaceROOT"
                    },
                    Node: aWorkSpace
                }]
            };

        // 각 Node 별 데이터 정렬
        oWorkSpace.Node = oAPP.fn.fnWorkSpaceSort(oWorkSpace.Node);

        let oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty("/SAPLogon", oWorkSpace);

    }; // end of oAPP.fn.fnCreateWorkspaceTree

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

        return new sap.m.Table(SERVER_TBL_ID, {
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
                        text: "STATUS"
                    })
                }),

                new sap.m.Column({
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "SERVER NAME"
                    })
                }),

                new sap.m.Column({
                    hAlign: sap.ui.core.TextAlign.Center,
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "SID"
                    })
                }),

                new sap.m.Column({
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "HOST(Or IP)"
                    })
                }),

                new sap.m.Column({
                    hAlign: sap.ui.core.TextAlign.Center,
                    header: new sap.m.Label({
                        design: sap.m.LabelDesign.Bold,
                        text: "SNO"
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

                                let sStatusTxt = "Inactive";

                                if (ISSAVE == true) {
                                    sStatusTxt = "Active";
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

        }).addEventDelegate({
            ondblclick: oAPP.fn.fnPressServerListItem
        }).addStyleClass("u4aWsServerListTbl");

    }; // end of oAPP.fn.fnGetSAPLogonListTable

    /************************************************************************
     * 서버 리스트 테이블의 헤더 툴바 영역
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonListTableToolbar = () => {

        return new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://edit",
                    press: () => {
                        oAPP.fn.fnPressEdit();
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://delete",
                    press: () => {
                        oAPP.fn.fnPressDelete();
                    }
                }),
            ]
        });

    }; // end of oAPP.fn.fnGetSAPLogonListTableToolbar

    /************************************************************************
     * 서버 리스트 수정 버튼
     ************************************************************************/
    oAPP.fn.fnPressEdit = () => {

        let oTable = sap.ui.getCore().byId(SERVER_TBL_ID);
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
     * 서버 리스트 삭제 버튼
     ************************************************************************/
    oAPP.fn.fnPressDelete = async () => {

        let oTable = sap.ui.getCore().byId(SERVER_TBL_ID);
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

        // 선택한 라인의 바인딩 데이터
        let oCtxData = oCtx.getProperty(oCtx.getPath());

        if (!oCtxData.ISSAVE) {
            return;
        }

        let oResult = await new Promise((resolve) => {

            // 삭제 메시지 팝업
            let sMsg = "Do you want to Delete?";

            oAPP.fn.fnShowMessageBox("C", sMsg, fnCallback);

            function fnCallback(sAction) {

                resolve(sAction);

            }

        });

        if (oResult != "OK") {
            return;
        }

        // 기 저장된 전체 목록을 구한다.
        let oSavedData = oAPP.fn.fnGetSavedServerListDataAll();
        if (oSavedData.RETCD !== "S") {

            oAPP.fn.fnShowMessageBox(oSavedData.RETCD, oSavedData.RTMSG);
            return;
        }

        // 전체 목록 중 삭제 대상 데이터를 찾는다.
        let aSavedData = oSavedData.RETDATA,
            iDelIndex = aSavedData.findIndex(elem => elem.uuid == oCtxData.uuid);

        if (iDelIndex < 0) {
            return;
        }

        // 로컬에 저장된 서버리스트 정보 JSON PATH
        let sPathInfoUrl = PATH.join(APPPATH, "Frame", "pathInfo.js"),
            oPathInfo = require(sPathInfoUrl),
            sLocalJsonPath = oPathInfo.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류
            oAPP.fn.fnShowMessageBox("E", oAPP.msg.M10 /*"server List file not exists. restart now!"*/, () => {
                oAPP.fn.fnEditDialogClose();
            });

            return;

        }

        // 선택한 데이터 삭제
        aSavedData.splice(iDelIndex, 1);

        // 입력한 서버 호스트 정보를 로컬 JSON 파일로 저장한다.
        let oWriteFileResult = await oAPP.fn.fnWriteFile(sLocalJsonPath, JSON.stringify(aSavedData));
        if (oWriteFileResult.RETCD != "S") {

            // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
            oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG, () => {
                oAPP.fn.fnEditDialogClose();
            });

            return;

        }

        // 성공 사운드
        oAPP.setSoundMsg("01");

        sap.m.MessageToast.show(oAPP.msg.M02 /*Delete Success!*/);

        // 좌측 workspace 트리 테이블을 갱신한다.
        oAPP.fn.fnSetRefreshSelectTreeItem();

    }; // end of oAPP.fn.fnPressDelete

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

        var oDialog = sap.ui.getCore().byId(POPID);
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
                                selectedKey: `{${BINDROOT}/protocol}`,
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
                                value: `{${BINDROOT}/host}`,
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
                                value: `{${BINDROOT}/port}`,
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

        var oDialog = new sap.m.Dialog(POPID, {
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

                        let oDialog = sap.ui.getCore().byId(POPID);
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

                let oDialog = sap.ui.getCore().byId(POPID);
                if (!oDialog) {
                    return;
                }

                let oDialogModel = oDialog.getModel();

                oDialogModel.setProperty(BINDROOT, {});

            }

        });

        oDialog.setModel(oJsonModel);
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
                RTMSG: oAPP.msg.M04 //"ServerList file not exists."
            };

        }

        // JSON 파일을 읽는다.        
        let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
            aSavedJsonData = JSON.parse(sReadFileData);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            return {
                RETCD: "E",
                RTMSG: oAPP.msg.M11 // "not exists save file."
            };

        }

        let oFindData = aSavedJsonData.find(elem => elem.uuid == pUUID);
        if (!oFindData) {

            return {
                RETCD: "E",
                RTMSG: oAPP.msg.M11 // "not exists save file."
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
                RTMSG: oAPP.msg.M12 // "ServerList file not exists."
            };

        }

        // JSON 파일을 읽는다.        
        let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
            aSavedJsonData = JSON.parse(sReadFileData);

        // JSON 파일 읽어보니 Array 타입이 아닌경우
        if (!Array.isArray(aSavedJsonData)) {

            return {
                RETCD: "E",
                RTMSG: oAPP.msg.M11 // "not exists save file."
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

        let oDialog = sap.ui.getCore().byId(POPID);
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

        let oDialog = sap.ui.getCore().byId(POPID);
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

        // 입력값 정합성 체크
        let oValid = await oAPP.fn.fnCheckValid(oSaveData, oModel);
        if (oValid.RETCD == "E") {

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
        let sLocalJsonPath = PATHINFO.SERVERINFO_V2 || "";

        // 파일 존재 유무 확인
        let bIsFileExist = FS.existsSync(sLocalJsonPath);
        if (!bIsFileExist) {

            // 파일이 없습니다 오류
            oAPP.fn.fnShowMessageBox("E", oAPP.msg.M10 /*"server List file not exists. restart now!"*/, () => {
                oAPP.fn.fnEditDialogClose();
            });

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
                oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG, () => {
                    oAPP.fn.fnEditDialogClose();
                });

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

            // 성공 사운드
            oAPP.setSoundMsg("01");

            sap.m.MessageToast.show(oAPP.msg.M01 /*"saved Success!"*/);

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
            oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG, () => {
                oAPP.fn.fnEditDialogClose();
            });

            return;

        }

        // 저장여부 플래그 값을 저장한다.
        var oCtxData = oCtx.getProperty(sBindPath);

        oCtxData.ISSAVE = true;

        oCtx.getModel().setProperty(sBindPath, oCtxData);

        // dialog를 닫는다.
        oAPP.fn.fnEditDialogClose();

        oAPP.setBusy(false);

        // 성공 사운드
        oAPP.setSoundMsg("01");

        sap.m.MessageToast.show(oAPP.msg.M01 /*"saved Success!"*/);

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

    }; // end of oAPP.fn.fnWriteFile

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
                    RTMSG: oAPP.msg.M13 // "host is required!"
                };

                // Value State
                VS_STATE.host_vs = sap.ui.core.ValueState.Error;
                VS_STATE.host_vst = oResult.RTMSG;

                oModel.setProperty("/VS_STATE", VS_STATE);

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
                    RTMSG: oAPP.msg.M14 //"Do not include Empty string!"
                };

                // Value State
                VS_STATE.host_vs = sap.ui.core.ValueState.Error;
                VS_STATE.host_vst = oResult.RTMSG;

                oModel.setProperty("/VS_STATE", VS_STATE);

                resolve(oResult);

                // Host 입력 input에 포커스를 준다.
                setTimeout(() => {
                    if (oHostInput) {
                        oHostInput.focus();
                    }
                }, 0);

                return;

            }

            resolve({
                RETCD: "S"
            });

        });

    }; // end of oAPP.fn.fnCheckValid

    /************************************************************************
     * 서버리스트 더블 클릭 이벤트
     ************************************************************************/
    oAPP.fn.fnPressServerListItem = async (oEvent) => {

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

        // 기 저장되지 않았다면 등록 팝업을 호출해준다.
        if (!oBindData.ISSAVE) {
            oAPP.fn.fnEditDialogOpen(oCtx);
            return;
        }

        let sUUID = oBindData.uuid,
            oSavedData = oAPP.fn.fnGetSavedServerListData(sUUID);

        // 기 저장되지 않았다면 등록 팝업을 호출해준다.
        if (oSavedData.RETCD == "E") {
            oAPP.fn.fnEditDialogOpen(oCtx);
            return;
        }

        oAPP.setBusy(true);

        let oRetData = oSavedData.RETDATA,
            sProtocol = oRetData.protocol,
            sHost = oRetData.host,
            sPort = oRetData.port,
            sUrl = `${sProtocol}://${sHost}`;

        if (sPort != "") {
            sUrl += `:${sPort}`;
        }

        // 서버 정보
        var oSAPServerInfo = {
            NAME: oBindData.name,
            SERVER_INFO: oRetData,
            SERVER_INFO_DETAIL: oBindData,
            INSTANCENO: oBindData.insno,
            SYSTEMID: oBindData.systemid,
            CLIENT: "",
            LANGU: "",
            SYSID: oBindData.systemid
        };

        // 사용자 테마 정보를 읽어온다.
        let oP13nThemeInfo = await fnP13nCreateTheme(oBindData.systemid);
        if (oP13nThemeInfo.RETCD == "S") {
            oSAPServerInfo.oThemeInfo = oP13nThemeInfo.RTDATA;
        }

        // 선택한 정보를 레지스트리에 저장한다.
        await _registSelectedSystemInfo(oSAPServerInfo);

        fnLoginPage(oSAPServerInfo);

    }; // end of oAPP.fn.fnPressServerListItem

    /************************************************************************
     * [Event] WS Global Setting 메뉴 선택
     ************************************************************************/
    function ev_settingItemSelected(oEvent) {

        let oSelectedItem = oEvent.getParameter("item"),
            sItemKey = oSelectedItem.getKey();

        switch (sItemKey) {
            case "WSLANGU":

                // WS Language 설정 팝업 오픈
                _openWsLanguSettingPopup();

                break;

            case "WSTHEME":

                // WS Theme 설정 팝업 오픈
                _openWSThemeSettingPopup();

                break;

            case "ABOUTWS":

                // About WS Popup 오픈
                _openAboutWsPopup();

            default:
                break;
        }

    } // end of ev_settingItemSelected

    /************************************************************************
     * [WS Global Setting] 언어 선택 팝업
     ************************************************************************/
    async function _openWsLanguSettingPopup() {

        let oCoreModel = sap.ui.getCore().getModel(),
            WSLANGU = oCoreModel.getProperty("/WSLANGU");

        // 기본 모델 데이터 구조
        var oInitModelData = {
            WSLANGU: WSLANGU,
            sSelectedKey: "EN",
            aLangu: [{
                KEY: "EN"
            },
            {
                KEY: "KO"
            },
            ],
        };

        // 레지스트리에 저장된 WS LANGU 정보를 구한다.
        let sWsLangu = await WSUTIL.getWsLanguAsync();

        oInitModelData.sSelectedKey = sWsLangu;

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oInitModelData);

        let sDialogId = "GlobalSettingWsLangu";

        var oDialog = sap.ui.getCore().byId(sDialogId);
        if (oDialog) {
            oDialog.setModel(oJsonModel);
            oDialog.open();
            return;
        }

        var oDialog = new sap.m.Dialog(sDialogId, {
            contentWidth: "350px",
            draggable: true,
            resizable: true,

            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://translate"
                    }),
                    new sap.m.Title({
                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/000}" // WS Language Settings
                    })
                ]
            }),

            content: [

                new sap.m.MessageStrip({
                    showIcon: true,
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/037}" // The selected language applies only to after restarting application.
                }).addStyleClass("sapUiTinyMargin"),

                new sap.ui.layout.form.Form({
                    editable: true,
                    layout: new sap.ui.layout.form.ResponsiveGridLayout({
                        labelSpanXL: 2,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        labelSpanS: 12,
                        singleContainerFullSize: true
                    }),

                    formContainers: [
                        new sap.ui.layout.form.FormContainer({
                            formElements: [
                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/001}" //"Language"
                                    }),
                                    fields: new sap.m.ComboBox({
                                        selectedKey: "{/sSelectedKey}",
                                        items: {
                                            path: "/aLangu",
                                            template: new sap.ui.core.Item({
                                                key: "{KEY}",
                                                text: "{KEY}"
                                            })
                                        }
                                    })
                                })
                            ]
                        })

                    ] // end of formContainers

                }) // end of Form

            ], // end of dialog content

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", // "OK",
                    press: function (oEvent) {

                        oAPP.setBusy(true);

                        //[async] 선택한 언어 저장
                        _saveWsLangu();

                    }
                }),
                new sap.m.Button({
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/003}", // "Cancel"
                    press: function () {

                        let sDialogId = "GlobalSettingWsLangu",
                            oDialog = sap.ui.getCore().byId(sDialogId);

                        oDialog.close();

                    }
                })
            ]

        }); // end of dialog

        oDialog.setModel(oJsonModel);

        oDialog.open();

    } // end of _settingPopupOpen

    function _getThemeInfoRegAsync() {

        return new Promise(async (resolve) => {

            let oSettings = SETTINGS, // ws 설정 정보
                sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
                sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로

            // 레지스트리 정보 구하기
            let oRegList = await WSUTIL.getRegeditList([sGlobalSettingPath]),
                oRetData = oRegList.RTDATA;

            // 여기서 오류면 크리티컬 오류
            if (oRegList.RETCD == "E") {
                throw new Error(oRegList.RTMSG);
            }

            let oRegValues = oRetData[sGlobalSettingPath].values,
                oRegTheme = oRegValues.theme,
                sTheme = oSettings.defaultTheme;

            if (oRegTheme) {
                sTheme = oRegTheme.value;
            }

            resolve(sTheme);

        });

    }

    /************************************************************************
     * [WS Global Setting] 테마 설정 팝업
     ************************************************************************/
    async function _openWSThemeSettingPopup() {

        let oCoreModel = sap.ui.getCore().getModel(),
            WSLANGU = oCoreModel.getProperty("/WSLANGU"), // WS 글로벌 Language 텍스트 정보
            aSupportedThemes = sap.ui.getVersionInfo().supportedThemes, // 현재 버전에서 지원되는 테마 목록
            iThemeLength = aSupportedThemes.length;

        // 테마 정보를 바인딩 구조에 맞게 변경
        let aThemes = [];
        for (var i = 0; i < iThemeLength; i++) {

            let sThemeName = aSupportedThemes[i];

            aThemes.push({
                KEY: sThemeName,
                THEME: sThemeName
            });

        }

        // 레지스트리에 저장된 테마 정보를 구한다.
        let sTheme = await _getThemeInfoRegAsync();

        let oInitModelData = {
            WSLANGU: WSLANGU,
            sSelectedTheme: sTheme || aSupportedThemes[0],
            aSupportThemes: aThemes,
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oInitModelData);

        let sDialogId = "GlobalSettingWsTheme";

        var oDialog = sap.ui.getCore().byId(sDialogId);
        if (oDialog) {
            oDialog.setModel(oJsonModel);
            oDialog.open();
            return;
        }

        var oDialog = new sap.m.Dialog(sDialogId, {
            contentWidth: "350px",
            draggable: true,
            resizable: true,

            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://palette"
                    }),
                    new sap.m.Title({
                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/006}" // Theme Settings
                    })
                ]
            }),

            content: [

                new sap.m.MessageStrip({
                    showIcon: true,
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/037}" // This setting is applies only to after restarting application.
                }).addStyleClass("sapUiTinyMargin"),

                new sap.ui.layout.form.Form({
                    editable: true,
                    layout: new sap.ui.layout.form.ResponsiveGridLayout({
                        labelSpanXL: 2,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        labelSpanS: 12,
                        singleContainerFullSize: true
                    }),

                    formContainers: [
                        new sap.ui.layout.form.FormContainer({
                            formElements: [
                                new sap.ui.layout.form.FormElement({
                                    label: new sap.m.Label({
                                        design: sap.m.LabelDesign.Bold,
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/005}" // Theme
                                    }),
                                    fields: new sap.m.ComboBox({
                                        selectedKey: "{/sSelectedTheme}",
                                        items: {
                                            path: "/aSupportThemes",
                                            template: new sap.ui.core.Item({
                                                key: "{KEY}",
                                                text: "{KEY}"
                                            })
                                        }
                                    })
                                })
                            ]
                        })

                    ] // end of formContainers

                }) // end of Form

            ], // end of dialog content

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", // "OK",
                    press: function (oEvent) {

                        oAPP.setBusy(true);

                        // [async] 선택한 테마 저장                        
                        _saveWsThemeInfo();

                    }
                }),
                new sap.m.Button({
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/003}", // "Cancel"
                    press: function () {

                        let oDialog = sap.ui.getCore().byId(sDialogId);

                        oDialog.close();

                    }
                })
            ]

        }); // end of dialog

        oDialog.setModel(oJsonModel);

        oDialog.open();

    } // end of _openWSThemeSettingPopup

    /************************************************************************
     * About WS Popup 오픈
     ************************************************************************/
    function _openAboutWsPopup() {

        let sDialogId = "aboutWsDialog";

        var oDialog = sap.ui.getCore().byId(sDialogId);
        if (oDialog) {
            oDialog.open();
            return;
        }

        var oDialog = new sap.m.Dialog(sDialogId, {
            contentWidth: "800px",
            contentHeight: "500px",
            draggable: true,
            resizable: false,
            verticalScrolling: false,
            horizontalScrolling: false,
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://hint"
                    }),
                    new sap.m.Title({
                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/044}" // About WS..
                    })
                ]
            }),

            content: [

                new sap.m.Page({
                    showHeader: false,
                    enableScrolling: true,
                    content: [

                        new sap.m.VBox({
                            height: "500px",
                            renderType: sap.m.FlexRendertype.Bare,
                            items: [
                                new sap.ui.core.HTML({
                                    content: _getAboutWsHtml()
                                })
                            ]
                        }),

                    ]

                }),

            ],

            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", // "OK",
                    press: function () {

                        let sDialogId = "aboutWsDialog",
                            oDialog = sap.ui.getCore().byId(sDialogId);

                        oDialog.close();
                        oDialog.destroy();

                    }
                }),
            ]

        });

        oDialog.setInitialFocus("");

        oDialog.open();

    } // end of _openAboutWsPopup

    function _getAboutWsHtml() {

        let sAboutHtmlPath = PATH.join(APPPATH, "aboutWs.html");

        return `<iframe src="${sAboutHtmlPath}" style='width:100%; height:100%; padding:15px; box-sizing:border-box; border:none;'></iframe>`;

    } // end of _getAboutWsHtml   

    /************************************************************************
     * [WS Global Setting] WS Language 저장
     ************************************************************************/
    async function _saveWsLangu() {

        let sDialogId = "GlobalSettingWsLangu",
            oDialog = sap.ui.getCore().byId(sDialogId);

        if (!oDialog) {
            oAPP.setBusy(false);
            return;
        }

        /**
         * 선택한 언어 정보를 레지스트리에 저장한다.
         */
        let oDialogModel = oDialog.getModel(),
            oModelData = oDialogModel.getData(),
            sSelectedKey = oModelData.sSelectedKey;

        // 선택한 언어값을 레지스트리에 저장
        await WSUTIL.setWsLanguAsync(sSelectedKey);

        // // 초기 모델 구성
        // await oAPP.fn.fnOnInitModeling();

        oDialog.close();

        oAPP.setBusy(false);

        // UI5 Language 변경
        // sap.ui.getCore().getConfiguration().setLanguage(sSelectedKey);

        sap.m.MessageToast.show(oAPP.msg.M01); // Saved success

    } // end of _saveWsLangu

    /************************************************************************
     * [WS Global Setting] WS Theme 저장
     ************************************************************************/
    async function _saveWsThemeInfo() {

        let sDialogId = "GlobalSettingWsTheme";

        // Dialog의 모델 정보를 구한다.
        let oDialog = sap.ui.getCore().byId(sDialogId),
            oModelData = oDialog.getModel().getData();

        let sSelectedTheme = oModelData.sSelectedTheme;

        let oSettings = WSUTIL.getWsSettingsInfo(),
            sRegPath = oSettings.regPaths, // 각종 레지스트리 경로
            sGlobalSettingPath = sRegPath.globalSettings; // globalsettings 레지스트리 경로        

        // 저장할 레지스트리 데이터
        let oRegData = {};
        oRegData[sGlobalSettingPath] = {};
        oRegData[sGlobalSettingPath]["theme"] = {
            value: sSelectedTheme,
            type: "REG_SZ"
        };

        // 레지스트리에 테마 정보 저장
        await WSUTIL.putRegeditValue(oRegData);

        oDialog.close();

        oAPP.setBusy(false);

        // // UI5 테마 적용
        // sap.ui.getCore().applyTheme(sSelectedTheme);

        sap.m.MessageToast.show(oAPP.msg.M01); // Saved success

    } // end of _saveWsThemeInfo

    function _registSelectedSystemInfo(oServerInfo) {

        // const RegeditPromisified = parent.require('regedit').promisified;

        return new Promise(async (resolve) => {

            let oWorkTree = sap.ui.getCore().byId("WorkTree");
            if (!oWorkTree) {
                resolve();
                return;
            }

            let iSelIdx = oWorkTree.getSelectedIndex(),
                oCtx = oWorkTree.getContextByIndex(iSelIdx);

            if (!oCtx) {
                resolve();
                return;
            }

            // let oCtxData = oCtx.getModel().getProperty(oCtx.getPath()),
            //     LastSelectedNodeKey = oCtxData._attributes.uuid;

            let oWsSettings = fnGetSettingsInfo(),
                oRegPaths = oWsSettings.regPaths,
                sSystemPath = oRegPaths.systems;
            // sSettingsPath = oRegPaths.LogonSettings;

            let sCreatePath = `${sSystemPath}\\${oServerInfo.SYSID}`,
                aKeys = [sCreatePath];

            // 레지스트리 폴더 생성
            await _regeditCreateKey(aKeys);

            // let oRegData = {};
            // oRegData[sSettingsPath] = {};
            // oRegData[sSettingsPath]["LastSelectedNodeKey"] = {
            //     value: LastSelectedNodeKey,
            //     type: "REG_SZ"
            // };

            // // 레지스트리 데이터 저장
            // await RegeditPromisified.putValue(oRegData);

            resolve();

        });

    } // end of _registSelectedSystemInfo

    function _getRegeditList(aPaths) {

        return new Promise((resolve) => {

            REGEDIT.list(aPaths, (err, result) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTDATA: result
                });

            });

        });

    } // end of _getRegeditList

    /************************************************************************
     * 레지스트리의 키값 생성
     ************************************************************************/
    function _regeditCreateKey(aKeys) {

        return new Promise((resolve) => {

            REGEDIT.createKey(aKeys, (err) => {

                if (err) {
                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });
                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "success!!"
                });

            });


        });

    } // end of _regeditCreateKey

    /************************************************************************
     * 현재 브라우저의 이벤트 핸들러
     ************************************************************************/
    function _attachCurrentWindowEvents() {

        CURRWIN.on("maximize", () => {

            if (typeof sap === "undefined") {
                return;
            }

            let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
            if (!oMaxBtn) {
                return;
            }

            oMaxBtn.setIcon("sap-icon://value-help");

        });

        CURRWIN.on("unmaximize", () => {

            if (typeof sap === "undefined") {
                return;
            }

            let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
            if (!oMaxBtn) {
                return;
            }

            oMaxBtn.setIcon("sap-icon://header");

        });

    } // end of _attachCurrentWindowEvents

    /************************************************************************
     * 작업표시줄 메뉴 만들기
     ************************************************************************/
    function _createTaskBarMenu() {

        CURRWIN.setThumbarButtons([
            {
                tooltip: 'Shutt Down',
                icon: PATH.join(APPPATH, "img", "shutdown.png"),
                click() {

                    CURRWIN.setAlwaysOnTop(true);
                    CURRWIN.show();
                    CURRWIN.setAlwaysOnTop(false);

                    _showShuttdownAskPopup(); // 프로그램 종료 질문 팝업
                }
            },

        ])

    } // end of _createTaskBarMenu

    /************************************************************************
     * 프로그램 종료 질문 팝업
     ************************************************************************/
    function _showShuttdownAskPopup() {

        let sDialogId = "u4aProgramExitDlg",
            oDialog = sap.ui.getCore().byId(sDialogId);

        if (oDialog) {

            if (oDialog.isOpen()) {
                return;
            }

            oDialog.open();
            return;

        }

        new sap.m.Dialog(sDialogId, {

            // properties
            showHeader: false,
            horizontalScrolling: false,
            verticalScrolling: false,

            // aggregations
            content: [
                new sap.m.IllustratedMessage({
                    // title: "{/WSLANGU/ZMSG_WS_COMMON_001/048} \n {/WSLANGU/ZMSG_WS_COMMON_001/049}", // "Unsaved data will be lost. Are you sure you want to exit the Program?",
                    // description: "　",
                    title: "　",
                    description: "{/WSLANGU/ZMSG_WS_COMMON_001/048} \n {/WSLANGU/ZMSG_WS_COMMON_001/049}", // "Unsaved data will be lost. Are you sure you want to exit the Program?"
                    illustrationType: "sapIllus-Connection",
                    illustrationSize: sap.m.IllustratedMessageSize.Dialog,

                }),
                new sap.m.HBox({
                    renderType: "Bare",
                    justifyContent: "Center",
                    items: [
                        new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", //"OK",
                            press: function () {

                                oAPP.fn.fnProgramShuttDown(); // 전체 프로그램 종료

                                if (oAPP.attr.windowCloseInterval) {
                                    clearInterval(oAPP.attr.windowCloseInterval);
                                    delete oAPP.attr.windowCloseInterval;
                                }

                                oAPP.attr.windowCloseInterval = setInterval(() => {

                                    // 10번 메인 프로그램이 다 죽었는지 체크
                                    if (!_checkMainProgramExit()) {
                                        return;
                                    }

                                    APP.exit();

                                }, 500);

                            }
                        }).addStyleClass("sapUiSmallMarginEnd"),
                        new sap.m.Button({
                            text: "{/WSLANGU/ZMSG_WS_COMMON_001/003}", //"CANCEL",
                            press: function () {

                                let sDialogId = "u4aProgramExitDlg",
                                    oDialog = sap.ui.getCore().byId(sDialogId);

                                oDialog.close();

                            }
                        }),
                    ]
                })
            ],

            // Events
            escapeHandler: () => { }, // esc 키 방지

        })
            .addStyleClass(sDialogId)
            .open();


    } // end of _showShuttdownAskPopup

    /************************************************************************
     * MAIN 프로그램이 종료 되었는지 확인
     ************************************************************************/
    function _checkMainProgramExit() {

        let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowserListLength = aBrowserList.length,
            iChildLength = 0;

        for (var i = 0; i < iBrowserListLength; i++) {

            const oBrows = aBrowserList[i];
            if (oBrows && oBrows.isDestroyed()) {
                continue;
            }

            try {

                var oWebCon = oBrows.webContents,
                    oWebPref = oWebCon.getWebPreferences();

            } catch (error) {
                continue;
            }

            if (oWebPref.OBJTY !== "MAIN") {
                continue;
            }

            ++iChildLength;

        }

        if (iChildLength === 0) {
            return true;
        }

        return false;

    } // end of _checkMainProgramExit

    // /************************************************************************
    //  * Electron App 이벤트 핸들러
    //  ************************************************************************/
    // function _attachBrowserWindowEventHandle() {

    //     APP.on("browser-window-focus", _attachBrowserWindowFocus); // 전체 윈도우의 focus 이벤트

    //     APP.on("browser-window-blur", _attachBrowserWindowBlur); // 전체 윈도우의 blur 이벤트

    // } // end of _attachBrowserWindowEventHandle

    /************************************************************************
     * 전체 윈도우의 focus 이벤트
     ************************************************************************/
    function _attachBrowserWindowFocus(oEvent) {

        let oWin = oEvent?.sender;

        if (typeof oWin === "undefined") {
            return;
        }

        if (oWin.isDestroyed()) {
            return;
        }

        try {

            var oWebCon = oWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sOBJTY = oWebPref.OBJTY;

        } catch (error) {

            return;

        }

        oWin.setAlwaysOnTop(true);


    } // end of _attachBrowserWindowFocus

    /************************************************************************
     * 전체 윈도우의 blur 이벤트
     ************************************************************************/
    function _attachBrowserWindowBlur(oEvent) {

        let oWin = oEvent.sender;
        if (oWin.isDestroyed()) {
            return;
        }

        let oWebCon = oWin.webContents,
            oWebPref = oWebCon.getWebPreferences(),
            sOBJTY = oWebPref.OBJTY;

        oWin.blur();

        if (sOBJTY == "FLTMENU") {
            oWin.setAlwaysOnTop(true);
            return;
        }

        oWin.setAlwaysOnTop(false);

        // oWin.minimize();

        // let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
        //     iBrowserListLength = aBrowserList.length;

        // for (var i = 0; i < iBrowserListLength; i++) {

        //     const oBrows = aBrowserList[i];

        //     if (oBrows.isDestroyed()) {
        //         continue;
        //     }

        //     var a = oBrows.webContents,
        //         b = a.getWebPreferences();

        //     
        //     if (b.OBJTY == "FLTMENU") {

        //         oWin.setAlwaysOnTop(false);
        //         oBrows.focus();

        //     }

        // }



        // oWin.setAlwaysOnTop(false, "modal-panel");
        // oWin.minimize();
        // oWin.restore();

        // oWin.setOpacity(0);
        // oWin.hide();
        // oWin.setIgnoreMouseEvents(true);
        // oWin.setIgnoreMouseEvents(false);
        // oWin.setOpacity(1);
        // oWin.showInactive();

        // setTimeout(() => {
        //     oWin.showInactive();
        //     oWin.setOpacity(1);
        // }, 1000);

    } // end of _attachBrowserWindowBlur

    // session samesite 회피
    function configureSession(oBrowserWindow) {

        let webcon = oBrowserWindow.webContents,
            session = webcon.session;

        const filter = {
            urls: ["http://*/*", "https://*/*"]
        };

        session.webRequest.onHeadersReceived(filter, (details, callback) => {

            let cookies = (details.responseHeaders['set-cookie'] || []).map((cookie) => {

                if (cookie.indexOf("SameSite=OFF") > 0 || cookie.indexOf("SameSite=None") > 0) {
                    return cookie;
                }

                let sCookie = cookie;

                sCookie = sCookie.replace('SameSite=Strict', 'SameSite=None');
                sCookie = sCookie.replace('SameSite=Lax', 'SameSite=None');

                return sCookie;

            });

            // const cookies = (details.responseHeaders['set-cookie'] || []).map(cookie => cookie.replace('SameSite=Strict', 'SameSite=None'));
            // cookies = (details.responseHeaders['set-cookie'] || []).map(cookie => cookie.replace('SameSite=Lax', 'SameSite=None'));

            if (cookies.length > 0) {
                details.responseHeaders['set-cookie'] = cookies;
            }

            callback({
                cancel: false,
                responseHeaders: details.responseHeaders
            });
        });

    } // end of configureSession

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
        oBrowserOptions.opacity = 0.0;
        oBrowserOptions.show = false;
        oBrowserOptions.backgroundColor = oThemeInfo.BGCOL;

        oBrowserOptions.titleBarStyle = 'hidden';
        oBrowserOptions.autoHideMenuBar = true;

        oBrowserOptions.x = mainWindowState.x;
        oBrowserOptions.y = mainWindowState.y;
        oBrowserOptions.width = mainWindowState.width;
        oBrowserOptions.height = mainWindowState.height;
        oBrowserOptions.minWidth = 1000;
        oBrowserOptions.minHeight = 800;

        oWebPreferences.partition = SESSKEY;
        oWebPreferences.browserkey = BROWSERKEY;
        oWebPreferences.OBJTY = "MAIN";

        // 브라우저 오픈
        var oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        // 브라우저 상단 메뉴 없애기
        oBrowserWindow.setMenu(null);

        // 브라우저 윈도우 기본 사이즈 감지
        mainWindowState.manage(oBrowserWindow);

        oBrowserWindow.loadURL(PATHINFO.MAINFRAME);

        // no build 일 경우에는 개발자 툴을 실행한다.
        if (!APP.isPackaged) {
        oBrowserWindow.webContents.openDevTools();
        }

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            oAPP.setBusy(false);

            var oMetadata = {
                SERVERINFO: oSAPServerInfo,
                THEMEINFO: oSAPServerInfo.oThemeInfo, // 테마 개인화 정보
                EXEPAGE: "LOGIN",
                SESSIONKEY: SESSKEY,
                BROWSERKEY: BROWSERKEY
            };

            // 메타 정보를 보낸다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);

            oBrowserWindow.show();

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            WSUTIL.setBrowserOpacity(oBrowserWindow);

            // session samesite 회피
            configureSession(oBrowserWindow);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    } // end of fnLoginPage

    function fnP13nCreateTheme(SYSID) {

        return new Promise((resolve) => {

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
                        resolve({
                            RETCD: "E",
                            RTMSG: err.toString()
                        });

                        return;
                    }

                    resolve({
                        RETCD: "S",
                        RTMSG: "",
                        RTDATA: oDefThemeInfo
                    });

                });

                return;
            }

            // 테마 정보가 있을 경우 바로 읽어서 전달
            FS.readFile(sThemeJsonPath, {
                encoding: "utf8",
            }, (err, data) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTMSG: "",
                    RTDATA: JSON.parse(data)
                });

            });

        });

    } // end of fnP13nCreateTheme

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
     * 메시지 박스 공통 function
     ************************************************************************/
    oAPP.fn.fnShowMessageBox = (TYPE, sMsg, fnCallback) => {

        var fnCloseCallback = (oAction) => {

            if (typeof fnCallback === "function") {
                fnCallback(oAction);
            }

        };

        switch (TYPE) {

            case "C": // confirm

                sap.m.MessageBox.confirm(sMsg, {
                    title: "Confirm", // default
                    onClose: (oAction) => {
                        fnCloseCallback(oAction);
                    }, // default
                    styleClass: "", // default
                    actions: [
                        sap.m.MessageBox.Action.OK,
                        sap.m.MessageBox.Action.CANCEL
                    ], // default
                    emphasizedAction: sap.m.MessageBox.Action.OK, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                break;

            case "S": // success

                sap.m.MessageBox.success(sMsg, {
                    title: "Success", // default
                    onClose: (oAction) => {
                        fnCloseCallback(oAction);
                    }, // default
                    styleClass: "", // default
                    actions: sap.m.MessageBox.Action.OK, // default
                    emphasizedAction: sap.m.MessageBox.Action.OK, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                // 성공 사운드
                oAPP.setSoundMsg("01");

                break;

            case "E": // error

                sap.m.MessageBox.error(sMsg, {
                    title: "Error", // default
                    onClose: (oAction) => {
                        fnCloseCallback(oAction);
                    }, // default
                    styleClass: "", // default
                    actions: sap.m.MessageBox.Action.CLOSE, // default
                    emphasizedAction: null, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                // 오류 사운드
                oAPP.setSoundMsg("02");

                break;

            case "W":

                sap.m.MessageBox.warning(sMsg, {
                    title: "Warning", // default
                    onClose: (oAction) => {
                        fnCloseCallback(oAction);
                    }, // default
                    styleClass: "", // default
                    actions: sap.m.MessageBox.Action.OK, // default
                    emphasizedAction: sap.m.MessageBox.Action.OK, // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                break;


            default:

                sap.m.MessageBox.show(sMsg, {
                    icon: sap.m.MessageBox.Icon.NONE, // default
                    title: "", // default
                    actions: sap.m.MessageBox.Action.OK, // default
                    emphasizedAction: sap.m.MessageBox.Action.OK, // default
                    onClose: (oAction) => {
                        fnCloseCallback(oAction);
                    }, // default                             
                    styleClass: "", // default
                    initialFocus: null, // default
                    textDirection: sap.ui.core.TextDirection.Inherit // default
                });

                break;
        }

    }; // end of oAPP.fn.fnShowMessageBox

    oAPP.fn.showIllustratedMsg = () => {

        let sDialogId = "u4aWsServListClsDlg",
            oDialog = sap.ui.getCore().byId(sDialogId);

        if (oDialog) {

            if (oDialog.isOpen()) {
                return;
            }

            oDialog.open();
            return;

        }

        new sap.m.Dialog(sDialogId, {

            // properties
            showHeader: false,
            horizontalScrolling: false,
            verticalScrolling: false,

            // aggregations
            content: [
                new sap.m.IllustratedMessage({
                    description: "{/WSLANGU/ZMSG_WS_COMMON_001/043}", // "An activated window exists. please close All activated windows first.",
                    illustrationType: "tnt-Teams",
                    illustrationSize: sap.m.IllustratedMessageSize.Dialog,
                    additionalContent: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", //"OK",
                        press: function () {

                            // 서버리스트에서 파생된 자식 윈도우를 활성화 시킨다.
                            // oAPP.fn.fnShowChildWindows();

                            // 전체 윈도우를 활성화 시킨다
                            // oAPP.fn.fnShowAllWindows();

                            // 메인 윈도우만 활성화 시킨다.
                            oAPP.fn.fnShowMainWindow();

                            let oDialog = sap.ui.getCore().byId(sDialogId);
                            oDialog.close();

                        }
                    }),

                })
            ],

            // Events
            escapeHandler: () => { }, // esc 키 방지

        })
            .addStyleClass(sDialogId)
            .open();

    }; // end of oAPP.fn.showIllustratedMsg

    /************************************************************************
     * 전체 프로그램 종료
     ************************************************************************/
    oAPP.fn.fnProgramShuttDown = () => {

        let oSendData = {
            PRCCD: "04",
        };

        IPCRENDERER.send("if-browser-interconnection", oSendData);

    }; // end of oAPP.fn.fnProgramShuttDown

    /************************************************************************
     * 서버리스트에서 파생된 자식 윈도우를 활성화 시킨다
     ************************************************************************/
    oAPP.fn.fnShowChildWindows = () => {

        let aChildWin = CURRWIN.getChildWindows(),
            iChildLength = aChildWin.length;

        if (iChildLength <= 0) {
            return;
        }

        for (var i = 0; i < iChildLength; i++) {

            let oChildWin = aChildWin[i];
            if (oChildWin.isDestroyed()) {
                continue;
            }

            oChildWin.setAlwaysOnTop(true);
            oChildWin.show();
            oChildWin.setAlwaysOnTop(false);

        }

    }; // end of oAPP.fn.fnShowChildWindows

    /************************************************************************
     * 전체 윈도우를 활성화 시킨다
     ************************************************************************/
    oAPP.fn.fnShowAllWindows = () => {

        let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowserListLength = aBrowserList.length;

        for (var i = 0; i < iBrowserListLength; i++) {

            const oBrows = aBrowserList[i];

            if (oBrows.isDestroyed()) {
                continue;
            }

            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

            if (oWebPref.OBJTY == "SERVERLIST") {
                continue;
            }

            oBrows.show();

            return;

        }

    }; // end of oAPP.fn.fnShowAllWindows

    /************************************************************************
     * 메인 윈도우만 활성화 시킨다.
     ************************************************************************/
    oAPP.fn.fnShowMainWindow = () => {

        let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
            iBrowserListLength = aBrowserList.length;

        for (var i = 0; i < iBrowserListLength; i++) {

            const oBrows = aBrowserList[i];
            if (oBrows.isDestroyed()) {
                continue;
            }

            let oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

            if (oWebPref.OBJTY !== "MAIN") {
                continue;
            }

            oBrows.show();

        }

    }; // end of oAPP.fn.fnShowMainWindow

    /************************************************************************
     * WS Floating Menu Open
     ************************************************************************/
    oAPP.fn.fnFloatingMenuOpen = () => {

        var sFloatingMenuJsPath = PATHINFO.FLTMENU,
            oFloatMenu = require(sFloatingMenuJsPath);

        oFloatMenu.open(REMOTE, screen, APPPATH);

    }; // end of oAPP.fn.fnFloatingMenuOpen

})(oAPP);

/************************************************************************
 * WS의 UI5 Bootstrap 정보를 생성한다.
 ************************************************************************/
function fnLoadBootStrapSetting() {

    var oSettings = SETTINGS,
        oSetting_UI5 = oSettings.UI5,
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

    let oWsGlobalSettings = oAPP.data.GlobalSettings,
        oThemeInfo = oWsGlobalSettings.theme,
        oLanguInfo = oWsGlobalSettings.language,
        sTheme = (typeof oThemeInfo === "undefined" ? oSettings.defaultTheme || "sap_horizon_dark" : oThemeInfo.value);

    sLangu = (typeof oLanguInfo === "undefined" ? oSettings.defaultLanguage || "EN" : oLanguInfo.value);

    oScript.setAttribute("data-sap-ui-language", sLangu);
    oScript.setAttribute('data-sap-ui-theme', sTheme);
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout, sap.ui.table");
    oScript.setAttribute("src", oSetting_UI5.resourceUrl);

    document.head.appendChild(oScript);

} // end of fnLoadBootStrapSetting

/************************************************************************
 * 공통 css을 적용한다.
 ************************************************************************/
function fnLoadCommonCss() {

    var sCommonCssUrl = PATHINFO.COMMONCSS,
        oCss = document.createElement("link");

    sCommonCssUrl = sCommonCssUrl.replaceAll("\\", "/");
    sCommonCssUrl = `file:///${sCommonCssUrl}`;

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

    sap.ui.getCore().attachInit(() => {

        // if (!APP.isPackaged) {
        //     // Floating Menu Open
        //     oAPP.fn.fnFloatingMenuOpen();
        // }

        // Illustration Pool에 TNT Theme를 등록한다.
        oAPP.fn.fnRegisterIllustrationPool();

        oAPP.fn.fnOnMainStart(); // [async]

    });

});

window.onbeforeunload = () => {

    // // 작업표시줄에서 닫기 눌렀을 경우
    // if(oEvent.defaultPrevented){
    //     return "";
    // }



    // REMOTE.getCurrentWindow().openDevTools();



    // console.log(oEvent);

    /**
     * 서버리스트 이외에 현재 실행되고 있는 브라우저가 있을 경우
     * 서버리스트를 끌 수 없게 막는다.
     * 
     * 다른 브라우저 없이 서버리스트만 있는 경우에만 닫게 한다.
     * 
     * 사유: samesite 관련 이벤트 핸들러가 서버리스트에 존재하기 때문에
     * 서버리스트를 닫으면 실행 어플리케이션에서 ajax 통신을 못하게 되는 문제가 발생함.
     */

    CURRWIN.setAlwaysOnTop(true);
    CURRWIN.show();
    CURRWIN.setAlwaysOnTop(false);

    let aBrowserList = REMOTE.BrowserWindow.getAllWindows(), // 떠있는 브라우저 전체
        iBrowserListLength = aBrowserList.length,
        iChildLength = 0;

    for (var i = 0; i < iBrowserListLength; i++) {

        const oBrows = aBrowserList[i];
        if (oBrows && oBrows.isDestroyed()) {
            continue;
        }

        try {

            var oWebCon = oBrows.webContents,
                oWebPref = oWebCon.getWebPreferences();

        } catch (error) {
            continue;
        }

        if (oWebPref.OBJTY == "SERVERLIST") {
            continue;
        }

        if (oWebPref.OBJTY == "FLTMENU") {
            continue;
        }

        ++iChildLength;

    }

    if (iChildLength === 0) {
        return false;
    }

    if (CURRWIN.isDestroyed()) {
        return false;
    }

    if (typeof sap === "undefined") {
        return false;
    }

    oAPP.fn.showIllustratedMsg();

    return false;

};