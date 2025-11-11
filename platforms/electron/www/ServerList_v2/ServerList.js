/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ServerList.js
 * - file Desc : U4A Workspace Logon Pad
 ************************************************************************/

var oAPP = parent.oAPP;

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
    SPAWN = require("child_process").spawn,

    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    WSUTIL = parent.require(PATHINFO.WSUTIL),
    SETTINGS = require(PATHINFO.WSSETTINGS),
    XHR = new XMLHttpRequest(),   
    oU4ASERV = require(PATH.join(APPPATH, "ServerList_v2", "modules", "Server", "net", "index.js"));
    // SYSTEMDRIVE = parent.process.env.SystemDrive;

/************************************************************************
 * 에러 감지
 ************************************************************************/
   
    var WSERR = parent.require(PATHINFO.WSTRYCATCH);

    var zconsole = WSERR(window, document, console);

XHR.withCredentials = true;

const
    SAPGUIVER = 7700,
    POPID = "editPopup",
    SERVER_TBL_ID = "serverlist_table",
    BINDROOT = "/SAVEDATA";

// // PowerShell 파일 루트 경로
// let PS_ROOT_PATH = PATH.join(APPPATH, "ext_api", "ps");

// // 패키징일 경우의 PowerShell 파일 루트 경로
// if(APP.isPackaged){
//     PS_ROOT_PATH = PATH.join(parent.process.resourcesPath, "www", "ext_api", "ps");
// }

/**
 * @since   2025-04-24
 * @version 3.5.5-sp0
 * @author  soccerhs
 * 
 * @description
 * ## Powershell 경로 변경
 *
 * - 기존: [extraResource]/www/ext_api
 * - 변경: [UserData]/ext_api
 */
let PS_ROOT_PATH = PATH.join(APP.getPath("userData"), "ext_api", "ps");

// PowerShell 관련 실행 파일 경로 구조
const PS_PATH = {  
    GET_SAPGUI_INFO : oAPP.PATH.join(PS_ROOT_PATH, "WS_SAPGUI_INFO", "get_sapgui_inf.ps1"),
};


const vbsDirectory = PATH.join(PATH.dirname(APP.getPath('exe')), 'resources/regedit/vbs');
REGEDIT.setExternalVBSLocation(vbsDirectory);

(function (oAPP) {
    "use strict";

    oAPP.setBusy = (bIsBusy) => {

        // sap.ui.core.BusyIndicator.iDEFAULT_DELAY_MS = 0;

        if (bIsBusy) {

            // 화면 Lock 걸기
            // sap.ui.getCore().lock();
            document.body.style.pointerEvents = "none";

            parent.oAPP.fn.setBusyIndicator("X");
            // sap.ui.core.BusyIndicator.show(0);

            return;
        }

        // 화면 Lock 해제
        // sap.ui.getCore().unlock();
        document.body.style.pointerEvents = "";

        parent.oAPP.fn.setBusyIndicator("");
        // sap.ui.core.BusyIndicator.hide();

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


    function _fnWait(itime = 3000){

        return new Promise((resolve) => {

            setTimeout(() => {
                resolve();
            }, itime);

        });

    }

    /**************************************************************************
     * /etc/services에 있는 메시지 서버관련 정보를 추출한다.
     **************************************************************************/
    async function _getSys32Services(){

        return new Promise((resolve) => {
        
            const { exec } = require('child_process');

            let servicePath = PATH.join(oAPP.data.SystemRootPath, 'System32', 'Drivers', 'etc', 'services');

            let cmd = `findstr "^sapms*" ${servicePath}`;

            exec(cmd, (err, stdout, stderr) => {

                if (err) {
                    return resolve({
                        RETCD : "E"
                    });
                }

                return resolve({
                    RETCD: "S",
                    RDATA: stdout
                });

            });

        });

    } // end of _getSys32Services

    /**************************************************************************
     * /etc/services에 있는 메시지 서버관련 정보를 추출하여 SYSID 별 PORT 정보를 
     * Array 구조로 만든다.
     **************************************************************************/
    async function _getMsgServPortList(){
        
        // /etc/services에 있는 메시지 서버관련 정보를 추출
        let oSys32Services = await _getSys32Services();
        if(oSys32Services.RETCD === "E"){
            return;
        }

        let sServices = oSys32Services.RDATA;
        //     sServices = sServices.replace(/'/g, "''");
        //     sServices = sServices.replace(/\r/g, "");
        //     sServices = sServices.replace(/\t/g, " ");

        // let aServices = sServices.split("\n");
        
        // let aServ = [];
        // for(const sItem of aServices){

        //     let sServ = sItem;
    
        //     if(!sServ){
        //         continue;
        //     }
            
        //     let aServItem = sServ.split(" ");
    
        //     if(aServItem.length !== 2){
        //        continue;
        //     }
    
        //     let sMsg_serv_name = aServItem[0];
        //     if(!sMsg_serv_name){
        //         continue;
        //     }
    
        //     sMsg_serv_name = sMsg_serv_name.replace(/sapms/g, "");
            
        //     let sMsg_serv_port = aServItem[1];
        //     if(!sMsg_serv_port){
        //         continue;
        //     }
    
        //     sMsg_serv_port = sMsg_serv_port.replace(/\/.*/g, "");
    
        //     let oServices = {};
        //     oServices.SYSID = sMsg_serv_name;
        //     oServices.PORT  = sMsg_serv_port;
    
        //     aServ.push(oServices);
        // }

        /**
         * @since   2025-05-15
         * @version v3.5.6-6
         * @author  soccerhs
         * 
         * @description
         * 
         *  /Windows/System32/drivers/etc/services
         * 
         * 위 경로에 있는 파일의 데이터 중, message Server의 SYSID와 Port 정보 추출 개선
         *  
         */
        const lines = sServices.split('\n');
        const sapmsEntries = lines.filter(line => line.trim().startsWith('sapms'))
            .map(line => {
                // 예: "sapmsNEP 3601/tcp #Retail System"
                const match = line.match(/^sapms(\w+)\s+(\d+)\/tcp/);
                if (match) {
                    return {
                        SYSID: match[1],
                        PORT: match[2]
                    };
                }
                return null;
            })
            .filter(entry => entry !== null);

        oAPP.data.SAPLogon.aSys32MsgServPort = sapmsEntries;

        console.log("[/Windows/System32/drivers/etc/services] entries: ", oAPP.data.SAPLogon.aSys32MsgServPort);

    } // end of _getMsgServPortList


    /************************************************************************
     * ------------------------ [ Server List Start ] ------------------------
     * **********************************************************************/
    //#region 📑📑 프로그램 시작!!!!!
    oAPP.fn.fnOnMainStart = async () => {

        oAPP.setBusy(true);

        jQuery.sap.require("sap.m.MessageBox");
        
        // WS Global 메시지 글로벌 변수 설정
        await oAPP.fn.fnWsGlobalMsgList();
        
        // Illustration Pool에 TNT Theme를 등록한다.
        oAPP.fn.fnRegisterIllustrationPool();

        // 작업표시줄 메뉴 생성하기
        _createTaskBarMenu();

        // 현재 브라우저의 이벤트 핸들러
        _attachCurrentWindowEvents();

        // 초기 모델 구성
        await oAPP.fn.fnOnInitModeling();

        // 초기 화면 먼저 그리기
        oAPP.fn.fnOnInitRendering();

        // /etc/services에 있는 메시지 서버 포트 정보를 추출한다.
        await _getMsgServPortList();

        // 레지스트리에 등록된 SAPLogon 정보를 화면에 출력
        await oAPP.fn.fnOnListupSapLogon();

        // U4A EDU와 인터페이스를 위한 서버를 올린다.
        // 서버 리스트에 모델 데이터 세팅이 다 끝난 이후에 실행한다.        
        await oU4ASERV.createServer();
    
        oAPP.setBusy(false);
        
        CURRWIN.focus();

    }; // end of oAPP.fn.fnOnMainStart
    //#endregion 📑📑 프로그램 시작!!!!!


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
            oAPP.msg.M15 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "080"); // Do you want to Delete?
            oAPP.msg.M16 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "206"); // 전체종료            
            oAPP.msg.M270 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "270"); // 언어 적용을 서버 로그인 언어 기준으로 할 것인지에 대한 체크 입니다.
            oAPP.msg.M271 = WSUTIL.getWsMsgClsTxt(sWsLangu, "ZMSG_WS_COMMON_001", "271"); // 서버 로그인 언어 사용
            

            oAPP.msg.M017 = "A problem occurred while saving the server settings.";

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
    oAPP.fn.fnOnListupSapLogon = async function() {

        // 전체 바인딩 모델 clear
        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel) {
            oCoreModel.setProperty("/SAPLogon", {});
            oCoreModel.setProperty("/ServerList", []);
            oCoreModel.setProperty("/SAPLogonItems", []);
            oCoreModel.refresh(true);
        }

        try {

            // 레지스트리에 등록된 SAPLogon 정보를 읽는다.            
            var oResult = await oAPP.fn.fnGetRegInfoForSAPLogon();    

        } catch (error) {    

            return oAPP.fn.fnPromiseError(error);

        }

        await oAPP.fn.fnGetRegInfoForSAPLogonThen(oResult);

    }; // end of oAPP.fn.fnOnListupSapLogon

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
                    reject(sErrMsg);
                    return;
                }

                resolve(oSapLogon.values);

            });

        });

    }; // end of oAPP.fn.fnGetRegInfoForSAPLogon

    oAPP.fn.fnGetRegInfoForSAPLogonThen = function(oResult){

        return new Promise(async function(resolve){

            let oLandscapeFile = oResult.LandscapeFile,
                oLandscapeFileGlobal = oResult.LandscapeFileGlobal,
                sLandscapeFilePath = oLandscapeFile.value,
                sErrMsg = oAPP.msg.M03; //"Please Check the SAPGUI is Installed and whether saved Server is exsists!";

            if (typeof oLandscapeFile == "undefined") {

                oAPP.setBusy(false);

                oAPP.fn.fnShowMessageBox("E", sErrMsg, () => {
                    oAPP.fn.fnEditDialogClose();
                });

                return;
            }

            // SAPLogon xml 파일이 존재하지 않을 경우 오류
            if (!FS.existsSync(sLandscapeFilePath)) {

                oAPP.setBusy(false);

                // 오류 메시지 출력
                oAPP.fn.fnShowMessageBox("E", sErrMsg, () => {
                    oAPP.fn.fnEditDialogClose();
                });

                return;
            }

            // // SAP Login XML 파일 정보 변경 감지
            // if (!oAPP.isWatch) {
            //     FS.watch(sLandscapeFilePath, oAPP.fn.fnSapLogonFileChange);
            //     oAPP.isWatch = true;
            // }

            /**
             * @since   2025-11-09 22:17:55
             * @version vNAN-NAN
             * @author  soccerhs
             * @description
             *  기존에 watch 이벤트가 등록되어 있을 경우에는
             *  기존 watch를 종료시키고 다시 이벤트를 건다
             */
            if(oAPP.oSapLogonWatch){
                oAPP.oSapLogonWatch.close();
                delete oAPP.oSapLogonWatch;
            }

            oAPP.oSapLogonWatch = FS.watch(sLandscapeFilePath, oAPP.fn.fnSapLogonFileChange);

            try {

                var oReadResult = await oAPP.fn.fnReadSAPLogonData("LandscapeFile", sLandscapeFilePath);

            } catch (error) {

                oAPP.fn.fnPromiseError(error);

                return;
            }

            await oAPP.fn.fnReadSAPLogonDataThen(oReadResult);

            resolve();

        });

    };

    /************************************************************************
     * SAP LOGIN XML 파일이 바뀔때 타는 이벤트
     ************************************************************************/
    //#region - SAP LOGIN XML 변경 감지
    oAPP.fn.fnSapLogonFileChange = (current, previous) => {

        /**
         * @since   2025-11-09 22:10:52
         * @version vNAN-NAN
         * @author  soccerhs
         * @description
         * 
         * SAPGUI 실행시 LOGON XML파일 접근을 여러번 하는지 
         * Watch 이벤트가 순간적으로 여러번 발생되어 횟수를 줄이고자
         * setTimeout을 이용해서 xml 파일 변경시 1번만 수행하고자
         * 사용함.
         * 
         */
        if(typeof oAPP.iSapLogonChangeTimeout !== "undefined"){
            clearTimeout(oAPP.iSapLogonChangeTimeout);
            delete oAPP.iSapLogonChangeTimeout;
        }

        oAPP.iSapLogonChangeTimeout = setTimeout(function(){

            oAPP.fn.fnOnListupSapLogon();

        }, 1000);        

    }; // end of oAPP.fn.fnSapLogonFileChange
    //#endregion - SAP LOGIN XML 변경 감지

    /************************************************************************
     * SAP LOGIN XML 파일 읽기 성공
     ************************************************************************/
    oAPP.fn.fnReadSAPLogonDataThen = (oResult) => {

        return new Promise(async function(resolve){

            // sapgui 버전을 체크한다.
            // let oCheckVer = oAPP.fn.fnCheckSapguiVersion(oResult.Result);

            /**
             * @since   2025-03-14
             * @version 3.5.1-sp3
             * @author  soccerhs
             * 
             * @description
             * ## sapgui 버전 체크 변경
             * 
             * - 기존: SAP Landscape.xml에 있는 버전을 읽어서 버전 체크함.
             * - 변경: Powershell을 이용하여 설치된 SAPGUI 버전을 체크함.
             *  
             */
            let oCheckVer = await oAPP.fn.fnCheckSapguiVersion();
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
                sGUIPath = oRegPaths.GUIPath,
                cSessionPath = oRegPaths.cSession;

            let SAPGUIVER = oCheckVer.RTVER,
                SAPGUIPATH = oCheckVer.RTPATH,
                sRegPath1 = sGUIVerPath, // "HKCU\\SOFTWARE\\U4A\\WS\\GUIVer",
                sRegPath2 = cSessionPath, // "HKCU\\SOFTWARE\\U4A\\WS\\cSession";
                sRegPath3 = sGUIPath;

            const Regedit = parent.require('regedit').promisified;

            // 레지스트리 폴더 생성
            await Regedit.createKey([sRegPath1]);
            await Regedit.createKey([sRegPath2]);
            await Regedit.createKey([sRegPath3]);

            // 레지스트리에 SAPGUI 버전 정보 저장
            await Regedit.putValue({
                "HKCU\\SOFTWARE\\U4A\\WS\\GUIVer": {
                    "GUIVer": {
                        value: SAPGUIVER,
                        type: "REG_DEFAULT"
                    }
                }
            });

            // 레지스트리에 SAPGUI 설치 경로 정보 저장
            await Regedit.putValue({
                "HKCU\\SOFTWARE\\U4A\\WS\\GUIPath": {
                    "GUIVer": {
                        value: SAPGUIPATH,
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
            let oLogonResult = oAPP.fn.fnSetSAPLogonLandscapeList();
            if (oLogonResult.RETCD == "E") {

                oAPP.fn.fnShowMessageBox("E", oLogonResult.RTMSG);

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

            let oWorkTree = sap.ui.getCore().byId("WorkTree");
            if (oWorkTree) {
                oWorkTree.attachEventOnce("rowsUpdated", oAPP.fn.fnAttachRowsUpdateOnce);
            }

            resolve();

        });

    }; // end of oAPP.fn.fnReadSAPLogonDataThen    

    /************************************************************************
     * sapgui Version 체크
     * sapgui 770버전 이하는 지원 불가!!
     ************************************************************************/
    // oAPP.fn.fnCheckSapguiVersion = (oResult) => {

    //     // 성공 실패 공통 리턴 구조
    //     let oErr = {
    //         RETCD: "E",
    //         RTMSG: oAPP.msg.M04, // "Server information does not exist in the SAPGUI logon file."
    //     },
    //         oSucc = {
    //             RETCD: "S",
    //             RTMSG: ""
    //         };

    //     if (!oResult) {
    //         return oErr;
    //     }

    //     // xml의 attribute
    //     let oAttribute = oResult._attributes;
    //     if (!oAttribute) {
    //         return oErr;
    //     }

    //     let sGenerator = oAttribute.generator;
    //     if (!sGenerator || sGenerator == "") {
    //         return oErr;
    //     }

    //     // // 버전 정보를 정규식으로 발췌한다.               
    //     // let oRegex = new RegExp(/(?<=v)(.*?)(?=\.)/g, "i"),
    //     //     aVersion = oRegex.exec(sGenerator);

    //     // 버전 정보를 정규식으로 발췌한다.               
    //     let sVerRegex = /(?<=v)(.*)/g,
    //         aVersion = sGenerator.match(sVerRegex);

    //     // 정규식으로 null 값이면 버전정보가 없다고 간주함.
    //     if (aVersion == null) {
    //         oErr.RTMSG = oAPP.msg.M05; // "No SAPGUI version information.";
    //         return oErr;
    //     }

    //     // 정규식으로 버전 정보를 찾았다면 Array 타입
    //     if (Array.isArray(aVersion) == false) {
    //         oErr.RTMSG = oAPP.msg.M05; // "No SAPGUI version information.";
    //         return oErr;
    //     }

    //     let sVer = aVersion[0],
    //         parseVer = parseInt(sVer);

    //     if (isNaN(parseVer)) {

    //         oErr.RTMSG = oAPP.msg.M06; // "SAPGUI version information not Found.";
    //         return oErr;
    //     }

    //     // 770 보다 낮다면 지원 불가
    //     if (parseVer < SAPGUIVER) {

    //         //"Not supported lower than SAPGUI 770 versions. \n Please upgrade SAPGUI 770 or Higher";
    //         oErr.RTMSG = oAPP.msg.M07 + " \n " + oAPP.msg.M08;
    //         return oErr;
    //     }

    //     // SAPGUI 버전을 리턴한다.
    //     oSucc.RTVER = sVer;

    //     return oSucc;

    // }; // end of oAPP.fn.fnCheckSapguiVersion

    /*************************************************************
     * @function - SAPGUI 버전 체크 (Shell 방식)
     *************************************************************/
    function _checkSapGuiInfoShell(){

        return new Promise(async function(resolve){

            let sPsRoot = PS_ROOT_PATH;

            if(!APP.isPackaged){
                sPsRoot = "C:\\";
            }
            
            const psOptions = {
                cwd : sPsRoot   
            };

            // PowerShell 프로세스 생성
            const ps = SPAWN("powershell.exe", [
                "-ExecutionPolicy", "Bypass",
                "-File", PS_PATH.GET_SAPGUI_INFO,               
            ], psOptions);

            // 쉘에서 전달하는 콘솔을 수집할 공간
            let aShellConsole = [];

            // 실행 결과 출력
            ps.stdout.on("data", (data) => {

                if(!data?.toString()?.trim()){                
                    return;
                }                

                let sLog = `${data.toString()}`;
                
                console.log(sLog);

                if(!sLog){
                    return;
                }

                // 문자열에 개행문자가 있을 경우 나눈다.
                let aSplit = sLog.split(/\r?\n/).filter(e => e !== "");

                aShellConsole = aShellConsole.concat(aSplit);

                // // 쉘에서 전달하는 콘솔을 수집한다.
                // aShellConsole.push(sLog);

            });

            // 에러 메시지 출력
            ps.stderr.on("data", (data) => {
        
                let sLog = `${data.toString()}`;
                
                console.error(sLog);            
                console.trace();

                if (!ps.killed) {              
                    ps.kill(9);
                    console.log("ps-stderr");
                }

                return resolve({ SUBRC: 999, LOG: sLog });

            });

            // 실행 완료 이벤트 처리
            ps.on("close", (code) => {

                if (!ps.killed) {              
                    ps.kill(9);
                    console.log("ps-close");
                }

                // SAPGUI 버전정보 구하기
                let sSapGuiVer = "";

                let oFoundVer = aShellConsole?.find(item => item.includes("SAPGUI_VER|"));
                if (oFoundVer) {
                    sSapGuiVer = oFoundVer?.split("SAPGUI_VER|")[1]?.trim();
                }

                // SAPGUI 경로 구하기
                let sSapGuiPath = "";
                let oFoundPath = aShellConsole?.find(item => item.includes("SAPGUI_PATH|"));
                if (oFoundPath) {
                    sSapGuiPath = oFoundPath?.split("SAPGUI_PATH|")[1]?.trim();
                }

                // 리턴 데이터
                let oRDATA = {
                    SAPGUI_VER:  sSapGuiVer,     // 설치된 SAPGUI 버전
                    SAPGUI_PATH: sSapGuiPath     // 설치된 SAPGUI 경로
                }

                return resolve({ SUBRC: code, RDATA: oRDATA });

            });

        });

    } // end of _checkSapGuiInfoShell


    /************************************************************************
     * sapgui Version 체크
     * sapgui 770버전 이하는 지원 불가!!
     ************************************************************************/
    oAPP.fn.fnCheckSapguiVersion = function(){

        return new Promise(async function(resolve){

            // 리턴 구조
            var oRES = {};

            oRES.RETCD = "E";

            // (PowerShell) 설치된 SAPGUI 버전 체크
            let oCheckSapVer = await _checkSapGuiInfoShell();

            // 콘솔용 로그 메시지
            var aConsoleMsg = [             
                `[PATH]: www/ServerList_v2/ServerList.js`,  
                `=> oAPP.fn.fnCheckSapguiVersion`,
                `=> _checkSapGuiInfoShell`,
                `=> SUBRC: ${oCheckSapVer?.SUBRC}`,
                `=> RETURN`,
                `${JSON.stringify(oCheckSapVer)}`
            ];

            console.log(aConsoleMsg.join("\r\n"));                 

            // SUBRC 8 이면 미설치
            if(oCheckSapVer.SUBRC === 8){                
                
                oRES.RTMSG = oAPP.msg.M04; // "Server information does not exist in the SAPGUI logon file."

                return resolve(oRES);

            }

            // SAPGUI 버전
            let sSapGuiVer = oCheckSapVer?.RDATA?.SAPGUI_VER;

            // SAPGUI 설치 경로
            let sSapGuiPath = oCheckSapVer?.RDATA?.SAPGUI_PATH || "";

            // SAPGUI 버전 정보가 없을 경우
            if(!sSapGuiVer){

                oRES.RTMSG = oAPP.msg.M05; // "No SAPGUI version information.";

                return resolve(oRES);
            }

            // 버전 값을 숫자로 변환
            let parseVer = parseInt(sSapGuiVer);
            if (isNaN(parseVer)) {

                oRES.RTMSG = oAPP.msg.M06; // "SAPGUI version information not Found.";

                return resolve(oRES);
            }

            // 770 보다 낮다면 지원 불가
            if (parseVer < SAPGUIVER) {

                //"Not supported lower than SAPGUI 770 versions. \n Please upgrade SAPGUI 770 or Higher";
                oRES.RTMSG = oAPP.msg.M07 + " \n " + oAPP.msg.M08;

                return resolve(oRES);
            }

            // SAPGUI 버전, 설치 경로를 리턴한다.
            oRES.RETCD = "S";
            oRES.RTVER = sSapGuiVer;
            oRES.RTPATH = sSapGuiPath;

            return resolve(oRES);

        });

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

    // SAP의 서버 정보가 있는 XML을 읽어서 모델에 저장한다.
    oAPP.fn.fnSetSAPLogonLandscapeList = () => {

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

            /**
             * @since   2025-10-01
             * @version v3.5.6-11
             * @author  soccerhs
             * 
             * @description
             * - 내용: 
             * SAPUILandscape.xml 파일을 읽은 후, "Services" 리스트 항목 중, 
             * 속성 값에(attribute) "routerid" 가 있다면 Routers Array에 라우터 정보가
             * 무조건 있다는 가정하에서 발생된 오류 보완
             *  
             * - 수정: 
             * "routerid"와 "Services" 리스트 항목이 둘다 있는지 확인하는 로직으로 보완함.
             */
            if (oServiceAttr.routerid && oAPP?.data?.SAPLogon?.aRouters) {

                var oRouter = oAPP.data.SAPLogon.aRouters.find(element => element._attributes.uuid == oServiceAttr.routerid);

                oServiceAttr.router = (oRouter == null ? {} : oRouter._attributes);

            }

            // 메시지 서버 id가 있다면 메시지 서버정보 저장..

            /**
             * @since   2025-10-01
             * @version v3.5.6-11
             * @author  soccerhs
             * 
             * @description
             * - 내용: 
             * SAPUILandscape.xml 파일을 읽은 후, "Message servers" 리스트 항목 중, 
             * 속성 값에(attribute) "msid" 가 있다면 Message servers Array에 메시지 서버 정보가
             * 무조건 있다는 가정하에서 발생된 오류 보완
             *  
             * - 수정: 
             * "msid"와 "Message servers" 리스트 항목이 둘다 있는지 확인하는 로직으로 보완함.
             */            
            if (oServiceAttr.msid && oAPP?.data?.SAPLogon?.aMessageservers) {

                var oMsgSvr = oAPP.data.SAPLogon.aMessageservers.find(element => element._attributes.uuid == oServiceAttr.msid);

                oServiceAttr.msgsvr = (oMsgSvr == null ? {} : oMsgSvr._attributes);

                // // Host와 port를 구한다.
                // oServiceAttr.host = oServiceAttr.msgsvr.host;
                // oServiceAttr.port = oServiceAttr.msgsvr.port;

                // MessageServer가 있을 경우는 host를 server(logon_group)이름으로 매핑한다.
                oServiceAttr.host = oServiceAttr.server;
                oServiceAttr.port = oServiceAttr.msgsvr.port;
                
                // 메시지 서버 포트가 없을 경우는 system32의 services에서 추출한 port 번호를 매핑한다.
                if(!oServiceAttr.port){

                    if(oAPP.data.SAPLogon.aSys32MsgServPort && Array.isArray(oAPP.data.SAPLogon.aSys32MsgServPort) === true){

                        let aSys32Port = oAPP.data.SAPLogon.aSys32MsgServPort;

                        let oPortInfo = aSys32Port.find(e=>e.SYSID === oServiceAttr.systemid);
                        if(oPortInfo){
                            oServiceAttr.port = oPortInfo.PORT;
                            oServiceAttr.msgsvr.port = oPortInfo.PORT;
                        }

                    }
                }


                oServiceAttr.msgsvr.port = oServiceAttr.msgsvr.port ? oServiceAttr.msgsvr.port : "3600";

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

    }; // end of oAPP.fn.fnSetSAPLogonLandscapeList

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

                                    try {
                                        
                                        var oWebCon = oBrows.webContents,
                                            oWebPref = oWebCon.getWebPreferences();

                                    } catch (error) {
                                        continue;
                                    }                                    

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
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/001}", // Language
                                        visible: true
                                    }),
                                    new sap.m.MenuItem({
                                        key: "WSTHEME",
                                        icon: "sap-icon://palette",
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/005}" // Theme
                                    }),
                                    new sap.m.MenuItem({
                                        key: "WSSOUND",
                                        icon: "sap-icon://sound-loud",
                                        text: "{/WSLANGU/ZMSG_WS_COMMON_001/204}" // Sound
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

                // 모든 팝업 및 드롭다운 등등의 실행 영역을 페이지 컨텐츠 영역으로 제한
                // 상단 헤더에는 electron 헤더 영역으로 클릭이 되지 않아
                // 영역 제한을 하지 않을 경우 팝업 또는 드롭다운이 선택이 되지 않을 수 있음.
                let oPageContentDom = oMainPage.getDomRef("cont");
                if(oPageContentDom){                    
                    sap.ui.core.Popup.setWithinArea(oPageContentDom);
                }
                
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

                //[async] 좌측 트리 선택 이벤트
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
    //#region - WorkSpace Tree Item 선택 이벤트
    //#endregion 
    oAPP.fn.fnPressWorkSpaceTreeItem = async (oEvent) => {

        let oRowCtx = oEvent.getParameter("rowContext");
        if (oRowCtx == null) {
            return;
        }

        let oTable = oEvent.getSource(),
            oTableModel = oTable.getModel(),
            iSelIndx = oTable.getSelectedIndex();

        oTableModel.setProperty("/SAPLogonItems", []);

        // 선택된 라인이 없을 경우 우측 리스트 모델 초기화
        if (iSelIndx == -1) {           
            return;
        }

        var sBindPath = oRowCtx.sPath,
            oSelectItemData = oTableModel.getProperty(sBindPath),
            oSelectSubItem = oSelectItemData.Item;

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

        // 선택한 라인 위치를 개인화 파일에 저장한다.
        await oAPP.fn.setRegistryLastSelectedNodeKey(LastSelectedNodeKey);

        if (!oSelectSubItem) {            
            return;
        }

        var iSelectSubItemLength = oSelectSubItem.length;

        var aServerList = oTableModel.getProperty("/ServerList"),
            aItemList = [];

        /**
         * @since   2025-11-07 09:57:20
         * @version vNAN-NAN
         * @author  soccerhs
         * @description
         *  기 저장된 서버 정보를 구해서 서버리스트에 active 표시 처리 로직을
         *  서버리스트 테이블의 onAfterRendering으로 이사감
         *  한쪽에서 관리하기 위한 목적으로 아래 소스 주석처리
         * 
         */

        // Item이 배열이 아닌 경우 (폴더의 하위 서버 정보 데이터가 1건만 있을 경우 object로 저장되어 있음.)       
        if (typeof iSelectSubItemLength === "undefined") {

            var oFindItem = aServerList.find(element => element.uuid == oSelectSubItem._attributes.serviceid);
            if (oFindItem) {

                let oFindCopyItem = jQuery.extend(true, {}, oFindItem);

                aItemList.push(oFindCopyItem);

                oTableModel.setProperty("/SAPLogonItems", aItemList);
                oTableModel.refresh();
            }

            // SAPGUI 서버 리스트 정보와 기 저장된 서버 정보 데이터를 동기화
            _syncSavedServerInfo(oTableModel);

            return;
        }

        // 기 저장된 서버 호스트 정보가 있을 경우 저장 플래그를 심는다.
        for (var i = 0; i < iSelectSubItemLength; i++) {

            let oItem = oSelectItemData.Item[i], // 현재 선택된 메뉴의 서브 아이템
                sServiceid = oItem._attributes.serviceid;

            // 저장된 서버 호스트 정보를 찾는다.
            let oFindItem = aServerList.find(element => element.uuid == sServiceid);
            if (!oFindItem) {
                continue;
            }

            // 저장된 서버 호스트 정보가 있다면 저장 플래그를 심는다.
            let oFindCopyItem = jQuery.extend(true, {}, oFindItem);

            aItemList.push(oFindCopyItem);

        }

        // name 기준으로 오름차순 정렬
        aItemList.sort((a,b) => {
            return a.name.localeCompare(b.name);
        });

        oTableModel.setProperty("/SAPLogonItems", aItemList);   
        
        // SAPGUI 서버 리스트 정보와 기 저장된 서버 정보 데이터를 동기화
        _syncSavedServerInfo(oTableModel);

    }; // end of oAPP.fn.fnPressWorkSpaceTreeItem


    /************************************************************************
     * 선택한 라인 위치를 개인화 파일에 저장한다.
     ************************************************************************/
    oAPP.fn.setRegistryLastSelectedNodeKey = async function(sSelectedNodeKey) {

        let oWsSettings = fnGetSettingsInfo(),
            oRegPaths = oWsSettings.regPaths,
            sSettingsPath = oRegPaths.LogonSettings;

        let oRegData = {};
        oRegData[sSettingsPath] = {};
        oRegData[sSettingsPath]["LastSelectedNodeKey"] = {
            value: sSelectedNodeKey,
            type: "REG_SZ"
        };

        const RegeditPromisified = parent.require('regedit').promisified;

        // 레지스트리 데이터 저장
        await RegeditPromisified.putValue(oRegData);


    }; // end of oAPP.fn.setRegistryLastSelectedNodeKey

    /************************************************************************
     * 선택한 라인 위치를 개인화 파일에 저장한다.
     ************************************************************************/
    // oAPP.fn.fnSetSaveSelectedItemPosition = async (oSelectItemData) => {

    //     if (!oSelectItemData) {
    //         return;
    //     }

    //     if (!oSelectItemData._attributes) {
    //         return;
    //     }

    //     // 선택한 라인의 UUID를 구한다.
    //     let oSelectedItem = oSelectItemData._attributes,
    //         sUUID = oSelectedItem.uuid, // 선택한 UUID
    //         LastSelectedNodeKey = sUUID;

    //     let oWsSettings = fnGetSettingsInfo(),
    //         oRegPaths = oWsSettings.regPaths,
    //         sSettingsPath = oRegPaths.LogonSettings;

    //     let oRegData = {};
    //     oRegData[sSettingsPath] = {};
    //     oRegData[sSettingsPath]["LastSelectedNodeKey"] = {
    //         value: LastSelectedNodeKey,
    //         type: "REG_SZ"
    //     };

    //     const RegeditPromisified = parent.require('regedit').promisified;

    //     // 레지스트리 데이터 저장
    //     await RegeditPromisified.putValue(oRegData);


    // }; // end of oAPP.fn.fnSetSaveSelectedItemPosition

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

        let oColumnListItem = new sap.m.ColumnListItem({
            type: sap.m.ListType.Active,
        });

        let oCell1 = new sap.m.ObjectStatus({
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
        });
        oColumnListItem.addCell(oCell1);

        oCell1.addStyleClass("u4aWsServerList");
        
        let oCell2 = new sap.m.Text({
            text: "{name}"
        });
        oColumnListItem.addCell(oCell2);

        let oCell3 = new sap.m.Text({
            text: "{systemid}"
        });
        oColumnListItem.addCell(oCell3);

        let oCell4 = new sap.m.Text({
            text: "{host}"
        });
        oColumnListItem.addCell(oCell4);

        let oCell5 = new sap.m.Text({
            text: "{insno}"
        });
        oColumnListItem.addCell(oCell5);

        let oCell6 = new sap.m.Button({
            icon: "sap-icon://settings",
            press: async function(oEvent){

                let oUI         = oEvent.getSource();
                let oParUI      = oUI.getParent();
                let oModel      = oUI.getModel();
                let oBindCtx    = oUI.getBindingContext();
                let oBindData   = oBindCtx.getObject();

                // 선택한 영역 라인 선택표시
                let oTable = sap.ui.getCore().byId(SERVER_TBL_ID);
                if(oTable){
                    oTable.setSelectedItem(oParUI);
                }                

                let oSettings = oBindData?.settings || {};

                let oOptions = {
                    
                    // Popup Header 정보
                    headers: { title: oBindData.name },

                    // 서버 설정 정보
                    settings: JSON.parse(JSON.stringify(oSettings)),
                    
                };                

                let oResult = await oAPP.fn.fnOpenServerSettings(oOptions);
                let oRDATA = oResult.RDATA;

                switch (oResult.ACTCD) {

                    case "CANCEL":
                        return;                        

                    case "SAVE":

                        let oSaveResult = await _saveServerSettings(oBindData.uuid, oRDATA);
                        if(oSaveResult.RETCD === "E"){

                            let sErrMsg = oAPP.msg.M017; // A problem occurred while saving the server settings.

                            sap.m.MessageToast.show(sErrMsg);

                            // 실패 사운드
                            oAPP.setSoundMsg("02");

                            return;
                        }                        

                        oBindData.settings = oOptions.settings;

                        oModel.refresh();

                        // 저장 성공

                        // 성공 사운드
                        oAPP.setSoundMsg("01");

                        sap.m.MessageToast.show(oAPP.msg.M01 /*"saved Success!"*/);

                        return;
                
                }

            }
        }).bindProperty("enabled", {
            parts: [
                { path: "ISSAVE" }
            ],
            formatter: function(ISSAVE){
                return !!ISSAVE;
            }
        });
        oColumnListItem.addCell(oCell6);

        let oTable = new sap.m.Table(SERVER_TBL_ID, {
            fixedLayout: false,
            alternateRowColors: true,
            autoPopinMode: true,
            headerToolbar: oToolbar,
            mode: sap.m.ListMode.SingleSelectMaster,
            sticky: [sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar],
            items: {
                path: "/SAPLogonItems",
                template: oColumnListItem
            }

        }).addEventDelegate({
            ondblclick: oAPP.fn.fnPressServerListItem,
        }).addStyleClass("u4aWsServerListTbl");

        /**
         * Columns
         */
        let oColumn1 = new sap.m.Column({
            width: "150px",
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "STATUS"      // #no text
            })
        });
        oTable.addColumn(oColumn1);

        let oColumn2 = new sap.m.Column({
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "SERVER NAME" // #no text
            })
        });
        oTable.addColumn(oColumn2);

        let oColumn3 = new sap.m.Column({
            hAlign: sap.ui.core.TextAlign.Center,
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "SID"         // #no text
            })
        });
        oTable.addColumn(oColumn3);

        let oColumn4 = new sap.m.Column({
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "HOST(Or IP)" // #no text
            })
        });
        oTable.addColumn(oColumn4);

        let oColumn5 = new sap.m.Column({
            hAlign: sap.ui.core.TextAlign.Center,
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "SNO"         // #no text
            })
        });
        oTable.addColumn(oColumn5);

        let oColumn6 = new sap.m.Column({
            hAlign: sap.ui.core.TextAlign.Center,
            header: new sap.m.Label({
                design: sap.m.LabelDesign.Bold,
                text: "Settings"    // #no text
            })
        });
        oTable.addColumn(oColumn6);

        return oTable;

    }; // end of oAPP.fn.fnGetSAPLogonListTable


    /**
     * @since   2025-11-07 00:50:44
     * @version vNAN-NAN
     * @author  soccerhs
     * @description
     * 
     * SAPGUI 서버 리스트 정보와 기 저장된 서버 정보 데이터를 동기화     
     * 
     */
    function _syncSavedServerInfo(oModel){

        let aServerList = oModel.getProperty("/SAPLogonItems");
        if(!aServerList || Array.isArray(aServerList) === false || aServerList.length === 0){
            return;
        }

        // 기 저장된 서버 정보를 담을 구조
        let aSavedServerList = [];

        // 기 저장된 서버 정보 전체를 구한다.
        let oSavedAllReturn = oAPP.fn.fnGetSavedServerListDataAll();
        if(oSavedAllReturn.RETCD !== "S"){
            return;
        }

        // 저장된 서버 정보가 없다면 빠져나감.
        aSavedServerList = oSavedAllReturn.RETDATA;

        if(aSavedServerList.length === 0){
            return;
        }

        // 저장된 서버 리스트 기준으로 현재 서버 목록에 있는 데이터와 동기화 한다.
        for(var oSavedServer of aSavedServerList){
            
            let oServerInfo = aServerList.find(e => e.uuid === oSavedServer.uuid);
            if(!oServerInfo){
                continue;
            }

            // 저장 여부 플래그
            oServerInfo.ISSAVE = true;

            // 기타 옵션 정보
            if(oSavedServer.settings) {
                oServerInfo.settings = oSavedServer.settings;
            }
            
        }

        oModel.refresh();

    } // end of _syncSavedServerInfo


    /**
     * @since   2025-11-07 11:53:55
     * @version vNAN-NAN
     * @author  soccerhs
     * @description
     * 
     * 서버 설정 정보 저장
     * 
     */
    //#region - 서버 설정 정보 저장
    async function _saveServerSettings(sUUID, oSettings){

        console.log("서버 설정 정보 저장");
    
        // 기 저장된 데이터 전체를 구한다.
        let oSavedData = oAPP.fn.fnGetSavedServerListDataAll();

        if(oSavedData.RETCD === "E"){

            // 콘솔용 오류 메시지
            var aConsoleMsg = [             
                `[STACK]: ${new Error("저장된 서버 리스트 구하는 중 오류 발생").stack},`
                `[응답결과]: ${JSON.stringify(oSavedData)}`
            ];

            console.error(aConsoleMsg.join("\r\n"));

            return {RETCD: "E", STCOD: "E001"};
        }

        let aSavedServer = oSavedData.RETDATA;

        let oFindServer = aSavedServer.find(e => e.uuid === sUUID);
        if(!oFindServer){

            // 콘솔용 오류 메시지
            var aConsoleMsg = [             
                `[STACK]: ${new Error("저장된 서버 리스트 정보가 없음").stack},`
            ];

            console.error(aConsoleMsg.join("\r\n"));

            return {RETCD: "E", STCOD: "E002"};
        }

        oFindServer.settings = oSettings.settings;

        // 로컬 디렉토리에 서버 정보 저장
        let oSaveResult = await _setSavedServerList(aSavedServer);        
        if(oSaveResult.RETCD === "E"){

            // 콘솔용 오류 메시지
            var aConsoleMsg = [             
                `[STACK]: ${new Error("로컬 디렉토리에 서버 정보 저장중 오류 발생").stack},`
                `[응답결과]: ${JSON.stringify(oSaveResult)}`
            ];

            console.error(aConsoleMsg.join("\r\n"));

            return {RETCD: "E", STCOD: "E003"};
        }

        return {RETCD: "S"};

        
    } // end of _saveServerSettings
    //#endregion - 서버 설정 정보 저장


    async function _setSavedServerList(aSaveServerData){

        const sJsonPath = PATHINFO.SERVERINFO_V2;

        try {

            FS.writeFileSync(sJsonPath, JSON.stringify(aSaveServerData), 'utf-8');

            return {
                RETCD: "S"
            }

        } catch (error) {
            return {RETCD: "E"};
        }

    } // end of _setSavedServerList

    /**
     * @since   2025-11-07 11:06:21
     * @version vNAN-NAN
     * @author  soccerhs
     * @description
     * 
     * 서버의 옵션 팝업 실행
     * 
     */
    //#region - 서버의 옵션 팝업 실행    
    oAPP.fn.fnOpenServerSettings = function(oOptions){

        return new Promise(function(resolve){        

            let oModel = new sap.ui.model.json.JSONModel({
                headers: oOptions.headers,
                settings: oOptions.settings,                
            });

            let oDialog = new sap.m.Dialog({
                draggable: true,
                resizable: true,
                contentWidth: "500px",
                escapeHandler: (oEvent) => {

                    oDialog.close();

                    return resolve({
                        ACTCD: "CANCEL"
                    });
                    
                },
                afterClose: function(){
                    oDialog.destroy();
                }
            });
            oDialog.setModel(oModel);

            
            // #region - 헤더 영역
            let oHeaderToolbar = new sap.m.Toolbar();
            oDialog.setCustomHeader(oHeaderToolbar);

            let oHeaderIcon = new sap.ui.core.Icon({
                src: "sap-icon://settings"
            });
            oHeaderToolbar.addContent(oHeaderIcon);

            let oHeaderTxt = new sap.m.Title({
                // text: "{/headers/title}"
            });
            oHeaderToolbar.addContent(oHeaderTxt);

            oHeaderTxt.bindProperty("text", {
                parts: [
                    { path: "/headers" }
                ],
                formatter: function(headers){

                    let sHeadTxt = headers?.title || "";

                    return `Settings - ${sHeadTxt}`;

                }
            });            
            //#endregion - 헤더 영역


            //#region - Content 영역
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
                                    required: false,
                                    design: "Bold",
                                    text: "use Internal"
                                }),
                                fields: new sap.m.CheckBox({
                                    selected: "{/settings/useInternal}"
                                })
                            }),
                        

                        ] // end of formElements

                    }),

                ] // end of formContainers

            }); 
            oDialog.addContent(oForm);
            //#endregion - Content 영역
            

            //#region - 버튼 영역        
            let oAcceptBtn = new sap.m.Button({
                type: sap.m.ButtonType.Emphasized,
                icon: "sap-icon://accept",
                press: (oEvent) => {

                    oDialog.close();

                    return resolve({
                        ACTCD: "SAVE",
                        RDATA: oEvent.getSource().getModel().getProperty("/")
                    });

                }
            });
            oDialog.addButton(oAcceptBtn);

            let oCloseBtn = new sap.m.Button({
                type: sap.m.ButtonType.Reject,
                icon: "sap-icon://decline",
                press: () => {
                    
                    oDialog.close();

                    return resolve({
                        ACTCD: "CANCEL"
                    });
                    
                }
            });
            //#endregion - 버튼 영역

            oDialog.addButton(oCloseBtn);

            oDialog.open();

        });

    }; // end of oAPP.fn.fnOpenServerSettings
    //#endregion - 서버의 옵션 팝업 실행

    /************************************************************************
     * 서버 리스트 테이블의 헤더 툴바 영역
     ************************************************************************/
    oAPP.fn.fnGetSAPLogonListTableToolbar = () => {

        return new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://edit",
                    type: "Emphasized",
                    press: () => {
                        oAPP.fn.fnPressEdit();
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://delete",
                    type: "Negative",
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
            // let sMsg = "Do you want to Delete?";
            let sMsg = oAPP.msg.M15; // Do you want to Delete?

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
        // oTable.getModel().refresh();


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
    // oAPP.fn.fnPressSave = async () => {

    //     oAPP.setBusy(true);

    //     let oDialog = sap.ui.getCore().byId(POPID);
    //     if (!oDialog) {
    //         oAPP.setBusy(false);
    //         return;
    //     }

    //     let oModel = oDialog.getModel(),
    //         oModelData = oModel.getData(),
    //         oServer = oModelData.SERVER,
    //         oSaveData = oModelData.SAVEDATA,
    //         oCtx = oModelData.oCtx,
    //         sBindPath = oCtx.getPath();

    //     let oDefault_VS = oModel.getProperty("/DEF_VS");
    //     oModel.setProperty("/VS_STATE", oDefault_VS);

    //     // 입력값 정합성 체크
    //     let oValid = await oAPP.fn.fnCheckValid(oSaveData, oModel);
    //     if (oValid.RETCD == "E") {

    //         // 오류 사운드
    //         oAPP.setSoundMsg("02");

    //         oAPP.setBusy(false);

    //         return;

    //     }

    //     debugger;

    //     //#region - 저장 데이터 구조        
    //     // 입력한 데이터를 로컬 JSON 파일에 저장한다.
    //     let oLocalSaveData = {
    //         uuid: oServer.uuid,
    //         protocol: oSaveData.protocol,
    //         host: oSaveData.host,
    //         port: oSaveData.port,
    //         settings: {
    //             useInternal: !!oSaveData.useInternal
    //         }            
    //     };
    //     //#endregion - 저장 데이터 구조

    //     // 로컬에 저장된 서버리스트 정보 JSON PATH
    //     let sLocalJsonPath = PATHINFO.SERVERINFO_V2 || "";

    //     // 파일 존재 유무 확인
    //     let bIsFileExist = FS.existsSync(sLocalJsonPath);
    //     if (!bIsFileExist) {

    //         // 파일이 없습니다 오류
    //         oAPP.fn.fnShowMessageBox("E", oAPP.msg.M10 /*"server List file not exists. restart now!"*/, () => {
    //             oAPP.fn.fnEditDialogClose();
    //         });

    //         oAPP.setBusy(false);

    //         return;
    //     }

    //     // JSON 파일을 읽는다.          
    //     let sReadFileData = FS.readFileSync(sLocalJsonPath, 'utf-8') || JSON.stringify(""),
    //         aSavedJsonData = JSON.parse(sReadFileData);

    //     // JSON 파일 읽어보니 Array 타입이 아닌경우
    //     if (!Array.isArray(aSavedJsonData)) {

    //         // 입력한 서버 호스트 정보를 로컬 JSON 파일로 저장한다.
    //         let oWriteFileResult = await oAPP.fn.fnWriteFile(sLocalJsonPath, JSON.stringify([oLocalSaveData]));
    //         if (oWriteFileResult.RETCD != "S") {

    //             // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
    //             oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG, () => {
    //                 oAPP.fn.fnEditDialogClose();
    //             });

    //             oAPP.setBusy(false);

    //             return;

    //         }

    //         // 저장여부 플래그 값을 저장한다.
    //         var oCtxData = oCtx.getProperty(sBindPath);
    //         oCtxData.ISSAVE = true;

    //         oCtxData = Object.assign(oCtxData, oLocalSaveData);

    //         oCtx.getModel().setProperty(sBindPath, oCtxData);

    //         // dialog를 닫는다.
    //         oAPP.fn.fnEditDialogClose();

    //         oAPP.setBusy(false);

    //         // 성공 사운드
    //         oAPP.setSoundMsg("01");

    //         sap.m.MessageToast.show(oAPP.msg.M01 /*"saved Success!"*/);

    //         return;

    //     } // JSON 파일 읽어보니 Array 타입이 아닌경우 -- end 

    //     let oFindData = aSavedJsonData.find(elem => elem.uuid == oLocalSaveData.uuid);
    //     if (oFindData) {

    //         // 입력한 데이터가 이미 저장되어 있었다면 overwrite를 한다.            
    //         oFindData = Object.assign(oFindData, oLocalSaveData);

    //     } else { // 기존에 저장된게 없다면 Append
    //         aSavedJsonData.push(oLocalSaveData);
    //     }

    //     // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
    //     let oWriteFileResult = await oAPP.fn.fnWriteFile(sLocalJsonPath, JSON.stringify(aSavedJsonData));
    //     if (oWriteFileResult.RETCD != "S") {

    //         // 파일 저장에 실패 했을 경우 오류메시지 출력후 빠져나간다.
    //         oAPP.fn.fnShowMessageBox("E", oWriteFileResult.RTMSG, () => {
    //             oAPP.fn.fnEditDialogClose();
    //         });

    //         return;

    //     }

    //     // 저장여부 플래그 값을 저장한다.
    //     var oCtxData = oCtx.getProperty(sBindPath);

    //     oCtxData.ISSAVE = true;

    //     oCtx.getModel().setProperty(sBindPath, oCtxData);

    //     // dialog를 닫는다.
    //     oAPP.fn.fnEditDialogClose();        

    //     // 성공 사운드
    //     oAPP.setSoundMsg("01");

    //     sap.m.MessageToast.show(oAPP.msg.M01 /*"saved Success!"*/);

    //     oAPP.setBusy(false);

    // }; // end of oAPP.fn.fnPressSave

    /**
     * Title: fnPressSave
     * Description: 서버 정보 입력값을 검증하고 로컬 JSON 파일에 저장하는 함수
     * Author: CHUNGYOON LEE
     * Revised on: 2025-11-07
     */
    //#region - 서버 리스트 저장  
    oAPP.fn.fnPressSave = async () => {

        oAPP.setBusy(true);

        const oDialog = sap.ui.getCore().byId(POPID);
        if (!oDialog) return oAPP.setBusy(false);

        const oModel = oDialog.getModel(),
            oData  = oModel.getData(),
            oCtx   = oData.oCtx,
            sPath  = oCtx.getPath();

        // 초기 상태 설정
        oModel.setProperty("/VS_STATE", oModel.getProperty("/DEF_VS"));

        // 입력값 검증
        const oValid = await oAPP.fn.fnCheckValid(oData.SAVEDATA, oModel);
        if (oValid.RETCD === "E") {
            oAPP.setSoundMsg("02");
            return oAPP.setBusy(false);
        }

        // 저장 데이터 구성
        const oLocalSaveData = {
            uuid: oData.SERVER.uuid,
            protocol: oData.SAVEDATA.protocol,
            host: oData.SAVEDATA.host,
            port: oData.SAVEDATA.port,
            settings: { useInternal: !!oData.SAVEDATA.useInternal }
        };

        const sJsonPath = PATHINFO.SERVERINFO_V2 || "";

        // JSON 파일 존재 여부 확인
        if (!FS.existsSync(sJsonPath)) {
            oAPP.fn.fnShowMessageBox("E", oAPP.msg.M10, oAPP.fn.fnEditDialogClose);
            return oAPP.setBusy(false);
        }

        // 파일 읽기
        const sFileContent = FS.readFileSync(sJsonPath, "utf-8") || "[]";
        let aSavedData;
        try {
            aSavedData = JSON.parse(sFileContent);
        } catch {
            aSavedData = [];
        }

        // 배열이 아닐 경우 초기화
        if (!Array.isArray(aSavedData)) {
            aSavedData = [];
        }

        // 기존 데이터 갱신 또는 신규 추가
        const iIdx = aSavedData.findIndex(e => e.uuid === oLocalSaveData.uuid);
        if (iIdx >= 0) {
            aSavedData[iIdx] = Object.assign(aSavedData[iIdx], oLocalSaveData);
        } else {
            aSavedData.push(oLocalSaveData);
        }

        // 파일 쓰기
        const oWriteResult = await oAPP.fn.fnWriteFile(sJsonPath, JSON.stringify(aSavedData));
        if (oWriteResult.RETCD !== "S") {
            oAPP.fn.fnShowMessageBox("E", oWriteResult.RTMSG, oAPP.fn.fnEditDialogClose);
            return oAPP.setBusy(false);
        }

        // 모델 업데이트
        const oCtxData = Object.assign(oCtx.getProperty(sPath), oLocalSaveData, { ISSAVE: true });
        oCtx.getModel().setProperty(sPath, oCtxData);

        // UI 처리
        oAPP.fn.fnEditDialogClose();
        oAPP.setSoundMsg("01");
        sap.m.MessageToast.show(oAPP.msg.M01);
        oAPP.setBusy(false);
    };
    //#endregion - 서버 리스트 저장

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

        // 로그인시 필요한 파라미터 정보
        var oLoginInfo = {
            NAME: oBindData.name,
            SERVER_INFO: oRetData,
            SERVER_INFO_DETAIL: oBindData,
            INSTANCENO: oBindData.insno,
            SYSTEMID: oBindData.systemid,
            CLIENT: "",
            LANGU: "",
            SYSID: oBindData.systemid,
            SETTINGS: oBindData?.settings || undefined
        };

        zconsole.log(oLoginInfo);

        // 사용자 테마 정보를 읽어온다.
        let oP13nThemeInfo = await fnP13nCreateTheme(oLoginInfo.SYSID);
        if (oP13nThemeInfo.RETCD == "S") {
            oLoginInfo.oThemeInfo = oP13nThemeInfo.RTDATA;
        }

        // 선택한 정보를 레지스트리에 저장한다.
        await _registSelectedSystemInfo(oLoginInfo);

        fnLoginPage(oLoginInfo);

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

            case "WSSOUND":
                
                // WS Sound 설정 팝업 오픈
                _openWsSoundSettingPopup();

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
            aLangu: [
                {
                    KEY: "EN"
                },
                {
                    KEY: "KO"
                },
            ],
        };

        // 메시지 폴더를 경로를 구한다.
        let sMsgDirPath = PATH.join(APPPATH, "MSG", "WS_COMMON");

        // 메시지 폴더 경로가 있다면 하위 디렉토리(언어별) 폴더 목록을 구한다.
        if(FS.existsSync(sMsgDirPath) === true){

            try {
                
                let aLanguDir = FS.readdirSync(sMsgDirPath);

                let aLangu = [];
                for(const sLangu of aLanguDir){

                    aLangu.push({ KEY: sLangu });

                }

                oInitModelData.aLangu = aLangu;
                
            } catch (error) {
                
            }

        }

        // 레지스트리에 저장된 WS LANGU 정보를 구한다.
        // let sWsLangu = await WSUTIL.getWsLanguAsync();
        let oWsLangu = await WSUTIL.getGlobalSettingInfo("language");

        oInitModelData.sSelectedKey = oWsLangu?.value;

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

                // new sap.m.MessageStrip({
                //     showIcon: true,
                //     text: "{/WSLANGU/ZMSG_WS_COMMON_001/037}" // The selected language applies only to after restarting application.
                // }).addStyleClass("sapUiTinyMargin"),

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
                                    fields: new sap.m.Select({
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
                        }),
                     
                    ] // end of formContainers

                }), // end of Form

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

                // new sap.m.MessageStrip({
                //     showIcon: true,
                //     text: "{/WSLANGU/ZMSG_WS_COMMON_001/037}" // This setting is applies only to after restarting application.
                // }).addStyleClass("sapUiTinyMargin"),

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
                                    // fields: new sap.m.ComboBox({
                                    fields: new sap.m.Select({
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
     * Sound Setting Popup Open
     ************************************************************************/
    function _openWsSoundSettingPopup(){

        let _oDialog = new sap.m.Dialog({            
            contentWidth: "350px",
            draggable: true,
            resizable: true,
        });        

        let _oCustomHeader = new sap.m.Bar({
            contentLeft: [
                new sap.ui.core.Icon({
                    src: "sap-icon://sound-loud"
                }),
                new sap.m.Title({
                    text: "{/WSLANGU/ZMSG_WS_COMMON_001/205}" // Sound Settings
                })
            ]
        });
        _oDialog.setCustomHeader(_oCustomHeader);

        // let _oMsgStrip = new sap.m.MessageStrip({
        //     showIcon: true,
        //     text: "{/WSLANGU/ZMSG_WS_COMMON_001/037}" // The selected language applies only to after restarting application.
        // }).addStyleClass("sapUiTinyMargin");
        // _oDialog.addContent(_oMsgStrip);

        let _oForm = new sap.ui.layout.form.Form({
            editable: true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanXL: 2,
                labelSpanL: 3,
                labelSpanM: 3,
                labelSpanS: 12,
                singleContainerFullSize: true
            })

        }); // end of Form
        _oDialog.addContent(_oForm);

        let _oFormCont1 = new sap.ui.layout.form.FormContainer();
        _oForm.addFormContainer(_oFormCont1);

        let _oFormElem1 = new sap.ui.layout.form.FormElement();
        _oFormCont1.addFormElement(_oFormElem1);

        let _oLabel1 = new sap.m.Label({
            design: sap.m.LabelDesign.Bold,
            text: "{/WSLANGU/ZMSG_WS_COMMON_001/205}" // Sound Settings
        });
        _oFormElem1.setLabel(_oLabel1);

        let _oSwitch1 = new sap.m.Switch({
            busyIndicatorDelay:0,
            busy: true

        });
        _oFormElem1.addField(_oSwitch1);


        let _oBtn1 = new sap.m.Button({
            type: sap.m.ButtonType.Emphasized,
            text: "{/WSLANGU/ZMSG_WS_COMMON_001/002}", // "OK",
            press: async function (oEvent) {

                _oSwitch1.setBusy(true);

                let _bState = _oSwitch1.getState();
                let _sState = _bState === true ? "X" : "";

                // Setting Json 데이터를 구한다.
                let oSettingInfo = WSUTIL.getWsSettingsInfo();

                // Setting Json에 글로벌 사운드 변경 정보를 갱신한다.
                oSettingInfo.globalSound = _sState;

                // 변경된 글로벌 사운드 정보를 Setting Json에 저장한다.
                WSUTIL.setWsSettingsInfo(oSettingInfo);

                // 선택한 글로벌 사운드값을 레지스트리에 저장
                await WSUTIL.saveGlobalSettingInfo("sound", _sState);

                _oSwitch1.setBusy(false);

                sap.m.MessageToast.show(oAPP.msg.M01); // Saved success

                _oDialog.close();

            }
        });
        _oDialog.addButton(_oBtn1);        

        let _oBtn2 = new sap.m.Button({
            text: "{/WSLANGU/ZMSG_WS_COMMON_001/003}", // "Cancel"
            press: function () {

                _oDialog.close();

            }
        });
        _oDialog.addButton(_oBtn2);


        _oDialog.attachEvent("afterOpen", async function(){

            _oSwitch1.setState(false);

            let oResult = await WSUTIL.getGlobalSettingInfo("sound");

            if(!oResult || !oResult.value){
                _oSwitch1.setBusy(false);
                return;
            }            

            if(oResult.value === "X"){
                _oSwitch1.setState(true);
            }

            _oSwitch1.setBusy(false);

            // console.log("afterOpen");

        });

        _oDialog.attachEvent("afterClose", function(){

            // console.log("afterClose");

            _oDialog.destroy();

        });


        _oDialog.open();

    } // end of _openWsSoundSettingPopup


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

        // Setting Json 데이터를 구한다.
        let oSettingInfo = WSUTIL.getWsSettingsInfo();
        
        // Setting Json에 글로벌 언어 변경 정보를 갱신한다.
        oSettingInfo.globalLanguage = sSelectedKey;

        // 변경된 글로벌 언어 정보를 Setting Json에 저장한다.
        WSUTIL.setWsSettingsInfo(oSettingInfo);
   
        // 선택한 글로벌 언어값을 레지스트리에 저장
        await WSUTIL.saveGlobalSettingInfo("language", sSelectedKey);

        // 변경된 언어에 맞게 메시지 재구성
        await oAPP.fn.fnWsGlobalMsgList();

        // 초기 모델 구성
        await oAPP.fn.fnOnInitModeling();

        oDialog.close();

        oAPP.setBusy(false);

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

        // Setting Json 데이터를 구한다.
        let oSettingInfo = WSUTIL.getWsSettingsInfo();

        // Setting Json에 글로벌 테마 변경 정보를 갱신한다.
        oSettingInfo.globalTheme = sSelectedTheme;

        // 변경된 글로벌 테마 정보를 Setting Json에 저장한다.
        WSUTIL.setWsSettingsInfo(oSettingInfo);
       
        // 선택한 글로벌 테마값을 레지스트리에 저장
        await WSUTIL.saveGlobalSettingInfo("theme", sSelectedTheme);

        oDialog.close();

        oAPP.setBusy(false);

        // UI5 테마 적용
        sap.ui.getCore().applyTheme(sSelectedTheme);

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
                tooltip: oAPP.msg.M16, // Shutt Down
                icon: PATH.join(APPPATH, "img", "shutdown.png"),
                click() {

                    CURRWIN.setAlwaysOnTop(true);
                    CURRWIN.show();
                    CURRWIN.setAlwaysOnTop(false);

                    _showShuttdownAskPopup(); // 프로그램 종료 질문 팝업
                }
            },

        ]);

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

        try {
        
            var oWebCon = oWin.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sOBJTY = oWebPref.OBJTY;      
        
            oWin.blur();

            if (sOBJTY == "FLTMENU") {
                oWin.setAlwaysOnTop(true);
                return;
            }

            oWin.setAlwaysOnTop(false);

        } catch (error) {
            return;
        }

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
    function fnLoginPage(oLoginInfo) {

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
            oThemeInfo = oLoginInfo.oThemeInfo;

        // 브라우저 윈도우 기본 사이즈
        oBrowserOptions.opacity = 0.0;
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
        oWebPreferences.SYSID = oLoginInfo.SYSID;

        // // 새창띄울때 공통사항으로 USERINFO 정보를 담는데
        // // 메인인 경우는 로그인하기 전에는 모르므로
        // // 기존 공통사항과 구조를 맞추기 위해서 아래와 같이 구조를 구성함.
        // oWebPreferences.USERINFO = {
        //     SYSID: oLoginInfo.SYSID
        // };

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
                SERVERINFO: oLoginInfo,
                THEMEINFO: oLoginInfo.oThemeInfo, // 테마 개인화 정보
                EXEPAGE: "LOGIN",
                SESSIONKEY: SESSKEY,
                BROWSERKEY: BROWSERKEY
            };

            // 메타 정보를 보낸다.
            oBrowserWindow.webContents.send('if-meta-info', oMetadata);

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            // WSUTIL.setBrowserOpacity(oBrowserWindow);
            
            // session samesite 회피
            configureSession(oBrowserWindow);

            oBrowserWindow.setOpacity(1.0);

            oBrowserWindow.show();

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {
            oBrowserWindow = null;
        });

    } // end of fnLoginPage

    oAPP.fn.fnLoginPage = fnLoginPage;

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

    oAPP.fn.fnP13nCreateTheme = fnP13nCreateTheme;

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

            /**
             * 여기를 수행 중에 오류 발생된 경우는 창이 이미 죽었는데 실행하려는 것으로
             * try...catch로 오류 발생을 방지함.
             */
            try {

                oChildWin.setAlwaysOnTop(true);
                oChildWin.show();
                oChildWin.setAlwaysOnTop(false);
                
            } catch (error) {
                
            }
            

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

            try {
            
                var oWebCon = oBrows.webContents,
                    oWebPref = oWebCon.getWebPreferences();
            
                if (oWebPref.OBJTY == "SERVERLIST") {
                    continue;
                }

                oBrows.show();

            } catch (error) {
                continue;
            }

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

            try {                
            
                let oWebCon = oBrows.webContents,
                    oWebPref = oWebCon.getWebPreferences();

                if (oWebPref.OBJTY !== "MAIN") {
                    continue;
                }

                oBrows.show();

            } catch (error) {
                continue;   
            }

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

// /************************************************************************
//  * WS의 UI5 Bootstrap 정보를 생성한다.
//  ************************************************************************/
// function fnLoadBootStrapSetting() {

//     var oSettings = SETTINGS,
//         oSetting_UI5 = oSettings.UI5,
//         oBootStrap = oSetting_UI5.bootstrap,
//         sLangu = navigator.language;

//     sLangu = sLangu.toLowerCase().substring(0, 2); // 저장된 언어 값을 0부터 2까지 자르고 소문자로 변환하여 lang에 저장
//     sLangu = sLangu.toUpperCase();

//     var oScript = document.createElement("script");
//     if (oScript == null) {
//         return;
//     }

//     // 공통 속성 적용
//     for (const key in oBootStrap) {
//         oScript.setAttribute(key, oBootStrap[key]);
//     }

//     let oWsGlobalSettings = oAPP.data.GlobalSettings,
//         oThemeInfo = oWsGlobalSettings.theme,
//         oLanguInfo = oWsGlobalSettings.language,
//         sTheme = (typeof oThemeInfo === "undefined" ? oSettings.defaultTheme || "sap_horizon_dark" : oThemeInfo.value);

//     sLangu = (typeof oLanguInfo === "undefined" ? oSettings.defaultLanguage || "EN" : oLanguInfo.value);

//     oScript.setAttribute("data-sap-ui-language", sLangu);
//     oScript.setAttribute('data-sap-ui-theme', sTheme);
//     oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout, sap.ui.table");
//     oScript.setAttribute("src", oSetting_UI5.resourceUrl);

//     document.head.appendChild(oScript);

// } // end of fnLoadBootStrapSetting

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
        oLanguInfo = oWsGlobalSettings.language;

    // let sTheme = (typeof oThemeInfo === "undefined" ? oSettings.defaultTheme || "sap_horizon_dark" : oThemeInfo.value);
    let sTheme = "sap_horizon_dark";

    if(typeof oThemeInfo === "object" && oThemeInfo?.value !== ""){
        sTheme = oThemeInfo?.value;
    } else {
        sTheme = oSettings.defaultTheme;
    }

    // sLangu = (typeof oLanguInfo === "undefined" ? oSettings.defaultLanguage || "EN" : oLanguInfo.value);

    if(typeof oLanguInfo === "object" && oLanguInfo?.value !== ""){
        sLangu = oLanguInfo?.value;
    } else {
        sLangu = "EN";
    }    

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
    sCommonCssUrl = encodeURI(sCommonCssUrl);

    oCss.setAttribute("rel", "stylesheet");
    oCss.setAttribute("href", sCommonCssUrl);

    document.head.appendChild(oCss);

} // end of fnLoadCommonCss  

/**
 * 🔒 애플리케이션 단일 인스턴스 실행 보장 함수
 * 
 * Electron의 `app.requestSingleInstanceLock()` 기능을 이용하여
 * 프로그램이 동시에 여러 번 실행되는 것을 방지합니다.
 * 
 * - 이미 실행 중인 인스턴스가 있을 경우, 새로 실행된 프로세스는 즉시 종료합니다.
 * - 최초 실행된 인스턴스일 경우, 이후 실행 시도 시 기존 창을 앞으로 가져옵니다.
 * 
 * 💡 일반적으로 패키징된 환경(app.isPackaged)에서만 사용하며,
 *    개발 중에는 중복 실행이 허용될 수 있습니다.
 * 
 * @returns {boolean} true: 메인 인스턴스로 계속 실행 / false: 중복 실행으로 종료됨
 */
function _ensureSingleInstance() {
    
    const app = APP;
    const mainWindow = CURRWIN;

    if(!app.isPackaged){
        return false;
    }

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
        return false;
    }

    app.on('second-instance', () => {

        try {
        
            if (mainWindow) {
                if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
                    mainWindow.show();
                }
                mainWindow.focus();
            }
            
        } catch (error) {
            
        }
        
    });

    return true;

} // end of _ensureSingleInstance


// Bootstrap Setting
fnLoadBootStrapSetting();

// 공통 css load
fnLoadCommonCss();

// Window onload
window.addEventListener("load", () => {

    // 애플리케이션 단일 인스턴스 실행 보장 함수
    _ensureSingleInstance();

    sap.ui.getCore().attachInit(async () => {

        oAPP.attr.sap = sap;

        // if (!APP.isPackaged) {
        //     // Floating Menu Open
        //     oAPP.fn.fnFloatingMenuOpen();
        // }        

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