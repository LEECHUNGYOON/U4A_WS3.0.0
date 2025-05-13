/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
jQuery.sap.require("sap.m.MessageBox");

sap.ui.getCore().loadLibrary("sap.ui.table");
sap.ui.getCore().loadLibrary("sap.ui.layout");

// jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

// sap.ui.getCore().loadLibrary("sap.m"); 
// sap.ui.getCore().loadLibrary("sap.f");

// sap.ui.getCore().loadLibrary("sap.ui.unified");    


/******************************************************************************
*  💖 DATA / ATTRIBUTE 선언부
******************************************************************************/

const 
    oContr          = {};
    oContr.msg      = {};
    oContr.ui       = {};
    oContr.fn       = {};
    oContr.types    = {};
    oContr.attr     = {};


    // 앱 버전 리스트 정보 구조
    oContr.types.S_APP_VER_LIST = {

        _STATUS: "",        // 상태
        _STATUS_ICON: "",   // 상태 아이콘

        _ISSOURCE: false,   // 비교 기준
        _ISTARGET: false,   // 비교 대상

        APPID: "",      // APPID
        CLSID: "",      // 
        CTSNO: "",
        CTSTX: "",
        ERDAT: "",
        ERTIM: "",
        ERUSR: "",
        PACKG: "",
        TAPPID: "",
        TCLSID: "",
        VPOSN: ""
    };

    oContr.types.S_COMPARE_PAGE_HANDLE = {

        hdr_title_base: "",
        hdr_title_target: "",

        base_ver: "",
        target_ver: ""
    };

    oContr.oModel = new sap.ui.model.json.JSONModel({
        T_APP_VER_LIST: [],
        S_COMPARE_PAGE_HANDLE: {}
    });

    oContr.oModel.setSizeLimit(Infinity);

    // MonacoEditor와 커스텀 이벤트를 이용하여 I/F를 위한 Dom
    oContr.attr.oEditorIFDom = document.getElementById("if-editor");

    // 메시지 구성
    _getWsMsg();


/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @function - 공통 메시지 구성
     *************************************************************/
    function _getWsMsg(){

        let sLANGU = parent.LANGU;

        oContr.msg.M290 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "290"); // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.

        oContr.msg.M001 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "376"); // 선택된 버전 항목이 없습니다.
        oContr.msg.M002 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "377"); // 하나의 어플리케이션만 선택하세요.
        oContr.msg.M003 = oContr.msg.M290;
        oContr.msg.M004 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "378"); // 선택한 버전은 최신 버전입니다. 다른버전을 선택하세요.
        oContr.msg.M005 = `${parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "379") /* 버전 히스토리 */} [ ${oAPP.IF_DATA.oAppInfo.APPID} ]`;

        oContr.msg.M006 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "380"); // 상태
        oContr.msg.M007 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "381"); // 어플리케이션 ID
        oContr.msg.M008 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "382"); // Compare (Base/Target)"; // "비교 기준/대상 선택";        
        oContr.msg.M009 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "383"); // App Version
        oContr.msg.M010 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "384"); // Request No.
        oContr.msg.M011 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "385"); // Request Desc.
        oContr.msg.M012 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "386"); // Package
        oContr.msg.M013 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "387"); // Create Date
        oContr.msg.M014 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "388"); // Create Time
        oContr.msg.M015 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "389"); // Create User

        oContr.msg.M016 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "390"); // 현재 서버는 이 기능을 지원하지 않으므로 U4A 솔루션 팀에 문의하세요.
        
        // 알 수 없는 오류가 발생하였습니다.
        oContr.msg.M017 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "314") + "\n\n" + oContr.msg.M290;
        oContr.msg.M018 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "391"); // 통신 오류가 발생하였습니다. 네트워크 상태를 확인하시고 문제가 지속 될 경우 U4A 솔루션 팀에 문의하세요.
        oContr.msg.M019 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "392") /* 어플리케이션 버전 정보를 구성하는 중, 문제가 발생하였습니다.*/ + "\n\n" + oContr.msg.M003;  // 다시 실행 하시거나 문제가 지속되면 U4A팀으로 문의해주세요.";

        oContr.msg.M020 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "393"); // 비교할 두개의 어플리케이션만 선택하세요.
        oContr.msg.M021 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "394"); // 비교 기준        
        oContr.msg.M022 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "395"); // 비교 대상

        oContr.msg.M023 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "396"); // 선택한 어플리케이션으로 이동하시겠습니까?
        oContr.msg.M024 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "397"); // 비교할 데이터가 없습니다.


        oContr.msg.M025 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "398"); // 비교 기준을 선택하세요.
        oContr.msg.M026 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "399"); // 비교 대상을 선택하세요.

        oContr.msg.M027 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "400"); // 비교 기준과 비교 대상이 동일합니다.
        oContr.msg.M028 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "401"); // 비교 기준 또는 비교대상을 다른 버전으로 선택하세요.
        oContr.msg.M029 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "402") /* 어플리케이션 버전 비교 데이터를 구성하는 중, 문제가 발생하였습니다*/ + "\n\n" + oContr.msg.M003;  // 다시 실행 하시거나 문제가 지속되면 U4A팀으로 문의해주세요.

    } // end of _getWsMsg


    /************************************************************************
     * @function - 메시지 박스 (Confirm)
     ************************************************************************/
    function _showMsgBoxConfirm(sMsg, oOptions) {

        return new Promise(function (resolve) {

            let _sTitle = oOptions?.title;
            let _sStyleClass = oOptions?.styleClass || "";
            let _aActions = oOptions?.actions || [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL];
            let _sEmphasizedAction = oOptions?.emphasizedAction || sap.m.MessageBox.Action.OK;
            let _sInitialFocus = oOptions?.initialFocus;
            let _sTextDirection = oOptions?.textDirection || sap.ui.core.TextDirection.Inherit;

            sap.m.MessageBox.confirm(sMsg, {
                title: _sTitle,
                styleClass: _sStyleClass,
                actions: _aActions,
                emphasizedAction: _sEmphasizedAction,
                initialFocus: _sInitialFocus,
                textDirection: _sTextDirection,
                onClose: function (sAction) {
                    resolve(sAction);
                },
            });

        });

    } // end of _showMsgBoxConfirm


    /*********************************************************
     * @function - 특정 Html 영역을 FadeIn 효과 주기 
     *             (스르륵 나타나는 효과)
     *********************************************************
     * @param {DOM} oDomRef 
     * - DOM
     * @param {Integer} itime
     * - FadeIn 효과 적용 시 딜레이 타임 
     *********************************************************/
    function domFadeIn(oDomRef, itime = 200) {

        return new Promise((resolve) => {

            $(oDomRef).fadeIn(itime, () => {
                resolve();
            });

        });

    } // end of domFadeIn

    
    /*********************************************************
     * @function - 특정 Html 영역을 FadeOut(스르륵 사라지는 효과)
     *             효과 주기   
     *********************************************************
     * @param {DOM} oDomRef 
     * - DOM
     * @param {Integer} itime
     * - FadeOut 효과 적용 시 딜레이 타임 
     *********************************************************/
    function domFadeOut(oDomRef, itime = 200) {

        return new Promise((resolve) => {

            $(oDomRef).fadeOut(itime, () => {
                resolve();
            });

        });

    } // end of domFadeOut


    /************************************************************************
     * @function - waiting
     ************************************************************************/
    function _fnWaiting(iTime = 1000) {

        return new Promise(function (resolve) {

            setTimeout(function () {

                resolve();

            }, iTime);

        });

    } // end of _fnWaiting


    /*************************************************************
     * @function - 공통 ajax
     *************************************************************/
    function _sendAjax(sUrl, oFormData, oOptions) {

        return new Promise(function (resolve) {

            // default 10 분
            let iTimeout = 10000 * 600;

            if (oOptions && oOptions.iTimeout) {
                iTimeout = iTimeout;
            }

            // ajax 결과
            var oResult = undefined;

            jQuery.ajax({
                async: true,
                method: "POST",
                url: sUrl,
                data: oFormData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data, textStatus, xhr) {

                    oResult = { success: true, data: data, status: textStatus, statusCode: xhr && xhr.status, xhr: xhr };

                    // status 값이 있다면 서버에서 오류 발생
                    let u4a_status = oResult.xhr.getResponseHeader("u4a_status");
                    if (u4a_status) {

                        switch (u4a_status) {
                            case "UA0001": // 지원하지 않는 서비스

                                // 현재 서버는 이 기능을 지원하지 않으므로 U4A 팀에 문의하세요.
                                var sErrMsg = oContr.msg.M016;

                                sap.m.MessageBox.warning(sErrMsg, {
                                    onClose: function () {

                                        parent.CURRWIN.close();

                                    }
                                });

                                oContr.fn.setBusy(false);

                                return;

                            default:

                                // 콘솔용 오류 메시지
                                var aConsoleMsg = [
                                    `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,
                                    `=> _sendAjax`,
                                    `=> success callback`,
                                    `=> response header에 'u4a_status' 값이 ${u4a_status} 값으로 날라옴.`,
                                    `=> REQ_URL : ${sUrl}`,
                                ];

                                console.error(aConsoleMsg.join("\r\n"));
                                console.trace();

                                // 알 수 없는 오류가 발생하였습니다. 문제가 지속될 경우 U4A 팀에 문의하세요.
                                var sErrMsg = oContr.msg.M017;

                                sap.m.MessageBox.error(sErrMsg, {
                                    onClose: function () {

                                        parent.CURRWIN.close();

                                    }
                                });

                                oContr.fn.setBusy(false);

                                return;
                        }

                    }

                    return resolve(oResult.data);

                },
                error: function (xhr, textStatus, error) {

                    oResult = { success: false, data: undefined, status: textStatus, error: error, statusCode: xhr.status, errorResponse: xhr.responseText, xhr: xhr };

                    // 콘솔용 오류 메시지
                    var aConsoleMsg = [
                        `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,
                        `=> _sendAjax`,
                        `=> error callback`,
                        `=> REQ_URL : ${sUrl}`,
                    ];

                    console.error(aConsoleMsg.join("\r\n"));
                    console.trace();

                    // 연결 실패일 경우
                    if (oResult.success === false) {

                        // 통신 오류가 발생하였습니다. 네트워크 상태를 확인하시고 문제가 지속 될 경우 U4A 팀에 문의하세요.
                        var sErrMsg = oContr.msg.M018;

                        sap.m.MessageBox.error(sErrMsg, {
                            onClose: function () {

                                parent.CURRWIN.close();

                            }
                        });

                        oContr.fn.setBusy(false);

                        return;

                        // return resolve({
                        //     RETCD: "E",
                        //     STCOD: "E999",
                        // });

                    }

                }
            });

        });

    } // end of _sendAjax


    /*************************************************************
     * @function - 에디터가 로드 되는 시점까지 기다린다.
     *************************************************************/
    function _waitToEditorFrameLoad() {

        return new Promise((resolve, reject) => {

            let iLoadCount = 1;

            let lf_editor_load = function () {

                iLoadCount = iLoadCount - 1;

                console.log("iLoadCount", iLoadCount);

                if (iLoadCount === 0) {

                    oContr.attr.oEditorIFDom.removeEventListener("EDITOR_LOAD", lf_editor_load);

                    return resolve();

                }

            }; // end of lf_editor_load

            oContr.attr.oEditorIFDom.addEventListener("EDITOR_LOAD", lf_editor_load);

        });

    } // end of _waitToEditorFrameLoad


    /*************************************************************
     * @function - 두개 어플리케이션 비교 데이터 구하기
     *************************************************************/
    async function _getCompareAppVersionData(oSourceApp, oTargetApp) {        

        // 서버 호출 URL        
        let sServerPath = oAPP.IF_DATA.sServerPath + "/compare_app_ctrl_abap";

        let oFormData = new FormData();
        oFormData.append("APPID", oSourceApp.APPID);    // 비교 대상 어플리케이션 명
        oFormData.append("VPOSN_A", oSourceApp.VPOSN);  // 비교 기준 버전
        oFormData.append("VPOSN_B", oTargetApp.VPOSN);  // 비교 대상 버전

        return await _sendAjax(sServerPath, oFormData);

    } // end of _setCompareAppVersion    


    /*************************************************************
     * @function - 버전 정보 구성하기
     *************************************************************/
    function _setVersionList() {

        return new Promise(async function (resolve) {

            // 서버 호출 URL
            let sServerPath = oAPP.IF_DATA.sServerPath + "/get_app_ver_list";

            // 어플리케이션 정보
            let oAppInfo = oAPP.IF_DATA.oAppInfo;

            let oFormData = new FormData();
            oFormData.append("APPID", oAppInfo.APPID);

            // 서버에서 어플리케이션 버전 목록을 구한다.
            let oAppVerResult = await _sendAjax(sServerPath, oFormData);

            // 서버에서 버전 정보 구하는 중 통신 등의 오류가 발생한 경우..
            if (oAppVerResult.RETCD === "E") {

                // 어플리케이션 버전 정보를 구성하는 중, 문제가 발생하였습니다. 
                // 다시 실행 하시거나 문제가 지속되면 U4A팀으로 문의해주세요.
                // let sErrMsg = oContr.msg.M019;
                let sErrMsg = `[${oAppVerResult.STCOD}]: ` + parent.WSUTIL.getWsMsgClsTxt(parent.LANGU, "ZMSG_WS_COMMON_001", oAppVerResult.MSGNR) + "\n\n";
                    sErrMsg += oContr.msg.M003; // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.
                
                sap.m.MessageBox.error(sErrMsg, {
                    onClose: function () {

                        parent.CURRWIN.close();

                    }
                });

                oContr.fn.setBusy(false);

                // 콘솔용 오류 메시지
                var aConsoleMsg = [
                    `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,
                    `=> _setVersionList`,
                    `=> let oAppVerResult = await _sendAjax(sServerPath, oFormData);`,
                    `=> oAppVerResult: ${JSON.stringify(oAppVerResult)}`,
                ];

                console.error(aConsoleMsg.join("\r\n"));
                console.trace();

                return;
            }

            let _aVersionList = oAppVerResult.T_APP_VER_LIST;

            let aVerList = [];

            for (const oVersionItem of _aVersionList) {

                let _oVerItem = JSON.parse(JSON.stringify(oContr.types.S_APP_VER_LIST));

                _oVerItem._STATUS = "Warning";
                _oVerItem._STATUS_ICON = "sap-icon://project-definition-triangle-2";

                // 버전 정보 중 현재 Current 버전인 경우는 상태 표시를 녹색으로 표시
                if (oVersionItem.VPOSN === 0) {
                    _oVerItem._STATUS = "Success";
                    _oVerItem._STATUS_ICON = "sap-icon://color-fill";
                }

                _oVerItem.APPID = oVersionItem.APPID;
                _oVerItem.CLSID = oVersionItem.CLSID;
                _oVerItem.CTSNO = oVersionItem.CTSNO;
                _oVerItem.CTSTX = oVersionItem.CTSTX;
                _oVerItem.ERDAT = oVersionItem.ERDAT;
                _oVerItem.ERTIM = oVersionItem.ERTIM;
                _oVerItem.ERUSR = oVersionItem.ERUSR;
                _oVerItem.PACKG = oVersionItem.PACKG;
                _oVerItem.TAPPID = oVersionItem.TAPPID;
                _oVerItem.TCLSID = oVersionItem.TCLSID;
                _oVerItem.VPOSN = oVersionItem.VPOSN;

                aVerList.push(_oVerItem);

            }

            oContr.oModel.oData.T_APP_VER_LIST = aVerList;

            oContr.oModel.refresh();

            resolve();

        });


    } // end of _setVersionList


    /*************************************************************
     * @function - 메시지 토스트 (가운데 출력)
     *************************************************************/
    function _showMsgToastCenter(sMsg){

        sap.m.MessageToast.show(sMsg, { 
            my: "center center",
            at: "center center",
        });

    }; // end of _showMsgToastCenter


    /*************************************************************
     * @function - 모델 초기 설정
     *************************************************************/    
    function _initModel() { 


        
        oContr.oModel.setProperty("/S_COMPARE_PAGE_HANDLE", JSON.parse(JSON.stringify(oContr.types.S_COMPARE_PAGE_HANDLE)));

    } // end of _initModel    



/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/


    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        // 모델 초기 설정
        _initModel();

        // 버전 정보 구성하기
        await _setVersionList();

        oContr.fn.setBusy(false);

    }; // end of oContr.onViewReady


	/*************************************************************
	 * @function - Busy Indicator
	 *************************************************************/
	oContr.fn.setBusy = function (bIsbusy) {

        let sIsBusy = (bIsbusy === true ? "X" : "");

		oAPP.fn.setBusy(sIsBusy);

	}; // end of oContr.fn.setBusy


    /*************************************************************
     * @function - 변경된 소스 다음 위치로 이동
     *************************************************************/
    oContr.fn.moveNextChangeCode = function () {

        oContr.fn.editorPostMessage({ actcd: "moveNextChangedCode" });

    }; // end of oContr.fn.moveNextChangeCode


    /*************************************************************
     * @function - 변경된 소스 다음 위치로 이동
     *************************************************************/
    oContr.fn.movePreviousChangeCode = function () {

        oContr.fn.editorPostMessage({ actcd: "movePreviousChangedCode" });

    }; // end of oContr.fn.movePreviousChangeCode
    

    /*************************************************************
     * @function - editor에 PostMessage 전송
     *************************************************************/
    oContr.fn.editorPostMessage = function (oPARAM) {

        if (!oPARAM || !oPARAM?.actcd) {
            return;
        }

        let aEditorFrames = document.querySelectorAll(".MONACO_EDITOR");
        if (!aEditorFrames.length) {
            return;
        }

        for (var oEditor of aEditorFrames) {

            if (!oEditor?.contentWindow) {
                continue;
            }

            oEditor.contentWindow.postMessage(oPARAM);

        }

    }; // end of oContr.fn.editorPostMessage
    
    
    /*************************************************************
     * @function - 소스 비교 페이지에 대한 splitter 영역 닫기
     *************************************************************/
    oContr.fn.closeSplitterComparePage = function () {

        oContr.ui.SPLITTER1.removeContentArea(oContr.ui.COMPARE_PAGE);

        // Splitter의 contentArea 영역에 페이지를 동적으로 삭제한 후 반드시 Resize 메소드를 수행해주어야
        // 처음 실행한 모습대로 그려짐
        oContr.ui.SPLITTER1.resetContentAreasSizes();

    }; // end of oContr.fn.splitterCloseComparePage
    
    
    /*************************************************************
     * @function - 선택한 두개의 버전을 비교
     *************************************************************/
    oContr.fn.compareSelectedApp = async function () {

        oContr.fn.setBusy(true);

        let aAppList = oContr.oModel.getProperty("/T_APP_VER_LIST");
        if (!aAppList || Array.isArray(aAppList) === false || aAppList.length === 0) {

            // 비교할 데이터가 없습니다.
            var sMsg = oContr.msg.M024;

            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;
        }

        // 비교 기준 선택 여부 확인
        let oSourceApp = aAppList.find(e => e._ISSOURCE === true);
        if (!oSourceApp) {

            // 비교 기준을 선택하세요.
            var sMsg = oContr.msg.M025;

            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;
        }

        // 비교 대상 선택 여부 확인
        let oTargetApp = aAppList.find(e => e._ISTARGET === true);
        if (!oTargetApp) {

            // 비교 대상을 선택하세요.
            var sMsg = oContr.msg.M026;

            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;

        }

        // 비교 기준과 대상이 동일한 경우
        if (oSourceApp.APPID === oTargetApp.APPID
            && oSourceApp.VPOSN === oTargetApp.VPOSN) {

            // 비교 기준과 비교 대상이 동일합니다.\n\n비교 기준 또는 비교대상을 다른 버전으로 선택하세요.";
            var sMsg = oContr.msg.M027 + "\n\n" + oContr.msg.M028;

            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;
        }

        // 비교 페이지가 Spitter 하단에 있었다면 지우고 페이지를 다시 붙인다.
        let iIndex = oContr.ui.SPLITTER1.indexOfContentArea(oContr.ui.COMPARE_PAGE);
        if (iIndex != -1) {

            // // 스르륵 사라지는 효과
            // await domFadeOut(oContr.ui.COMPARE_PAGE.getDomRef(), 300);

            oContr.ui.SPLITTER1.removeContentArea(oContr.ui.COMPARE_PAGE);
        }

        // splitter 하단에 상세 페이지를 붙인다.
        oContr.ui.SPLITTER1.addContentArea(oContr.ui.COMPARE_PAGE);    

        // 에디터가 로드 되는 시점까지 기다린다.
        await _waitToEditorFrameLoad();

        // // 스르륵 나타나는 효과
        // await domFadeIn(oContr.ui.COMPARE_PAGE.getDomRef(), 300);

        // 비교 데이터 소스를 구한다.
        let oCompareResult = await _getCompareAppVersionData(oSourceApp, oTargetApp);

        // 서버에서 비교 데이터 소스 구하는 중 통신 등의 오류가 발생한 경우..
        if (oCompareResult.RETCD === "E") {

            let sErrMsg = `[${oCompareResult.STCOD}]: ` + parent.WSUTIL.getWsMsgClsTxt(parent.LANGU, "ZMSG_WS_COMMON_001", oCompareResult.MSGNR) + "\n\n";
                sErrMsg += oContr.msg.M003; // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.


            sap.m.MessageBox.error(sErrMsg, {
                onClose: function () {

                    parent.CURRWIN.close();

                }
            });

            oContr.fn.setBusy(false);

            // 콘솔용 오류 메시지
            var aConsoleMsg = [
                `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,
                `=> _getCompareAppVersionData`,
                `=> let oCompareResult = await _sendAjax(sServerPath, oFormData);`,
                `=> oCompareResult: ${JSON.stringify(oCompareResult)}`,
            ];

            console.error(aConsoleMsg.join("\r\n"));
            console.trace();

            return;

        }

        let oRDATA = oCompareResult.RDATA;

        let sSourceA = oRDATA.ABAP_A;
        let sSourceB = oRDATA.ABAP_B;
        let aDeltaX = oRDATA.T_DELTA_X;
        let aDeltaY = oRDATA.T_DELTA_Y;

        let oPARAM = {
            sourceA: sSourceA,
            sourceB: sSourceB,
            deltaX: aDeltaX,
            deltaY: aDeltaY
        }

        // 소스와 delta값을 에디터에 전달한다.
        oContr.fn.editorPostMessage({ actcd: "setCompareData", PARAM: oPARAM });

        let sSourceTitle = `${oContr.msg.M021 /* Base */} ${oContr.msg.M009 /* App Version */}: `;
        let sTargetTitle = `${oContr.msg.M022 /* Target */} ${oContr.msg.M009/* App Version */}: `;

        let oCompareBindData = JSON.parse(JSON.stringify(oContr.types.S_COMPARE_PAGE_HANDLE));

        oCompareBindData.hdr_title_base = sSourceTitle;
        oCompareBindData.hdr_title_target = sTargetTitle;

        oCompareBindData.base_ver   = oSourceApp.VPOSN;
        oCompareBindData.target_ver = oTargetApp.VPOSN;

        oContr.oModel.setProperty("/S_COMPARE_PAGE_HANDLE", oCompareBindData);

        oContr.fn.setBusy(false);


    }; // end of oContr.fn.compareSelectedApp


    /*************************************************************
     * @function - 선택한 버전을 새창으로 오픈
     *************************************************************/
    oContr.fn.openSelectedVersion = async function () {

        oContr.fn.setBusy(true);

        let oTable = oContr.ui.TABLE1;

        let aSelIdx = oTable.getSelectedIndices();

        let iSelLength = aSelIdx.length;
        if (iSelLength === 0) {

            let sMsg = oContr.msg.M001; // 선택된 버전 항목이 없습니다.

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;

        }

        // 하나만 선택되어야 함.
        if (iSelLength > 1) {

            let sMsg = oContr.msg.M002; // 하나의 어플리케이션만 선택하세요.

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;

        }

        let iSelIdx = aSelIdx[0];

        let oBindCtx = oTable.getContextByIndex(iSelIdx);
        if (!oBindCtx) {

            oContr.fn.setBusy(false);

            return;
        }

        let oBindData = oBindCtx.getObject();

        // TAPPID가 없는 건은 새창으로 실행 후 해당 앱 생성 불가
        if (oBindData.TAPPID === "") {

            let sMsg = oContr.msg.M004; // 선택한 버전은 최신 버전입니다. 다른버전을 선택하세요.

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            oContr.fn.setBusy(false);

            return;
        }

        oContr.fn.setBusy(false);

        // 선택한 어플리케이션으로 이동하시겠습니까?
        var sMsg = oContr.msg.M023;

        let sAction = await _showMsgBoxConfirm(sMsg);
        if (sAction === "CANCEL") {
            return;
        }

        oContr.fn.setBusy(true);

        let sServerPath = oAPP.IF_DATA.sServerPath + "/create_temp_ver_app";

        let oFormData = new FormData();
        oFormData.append("APPID", oBindData.APPID);
        oFormData.append("VPOSN", oBindData.VPOSN);

        let oResult = await _sendAjax(sServerPath, oFormData);

        if (oResult.RETCD === "E") {

            // 콘솔용 오류 메시지
            var aConsoleMsg = [
                `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,
                `=> oContr.fn.openSelectedVersion`,
                `=> let oResult = await _sendAjax(sServerPath, oFormData);`,
                `=> REQ_URL: ${sServerPath}`,
                `=> oResult: ${JSON.stringify(oResult)}`,
            ];

            console.error(aConsoleMsg.join("\r\n"));
            console.trace();

            let sErrMsg = `[${oResult.STCOD}]: ` + parent.WSUTIL.getWsMsgClsTxt(parent.LANGU, "ZMSG_WS_COMMON_001", oResult.MSGNR) + "\n\n";
            sErrMsg += oContr.msg.M003; // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.

            // sap.m.MessageBox.error(sErrMsg);
            sap.m.MessageBox.error(sErrMsg, {
                onClose: function () {

                    parent.CURRWIN.close();

                }
            });

            oContr.fn.setBusy(false);

            return;

        }

        let oRDATA = oResult.RDATA;

        let TAPPID = oRDATA.TAPPID;

        // 버전관리용 어플리케이션 생성  블라블라~~~ 처리 완료 후 IPC로 APP 정보를 전달하여 새창으로 띄우게 하기
        parent.IPCRENDERER.send(`${parent.BROWSKEY}-if-version-management-new-window`, { TAPPID: TAPPID });

        // 연속 클릭 방지용
        setTimeout(() => {

            oContr.fn.setBusy(false);

        }, 3000);


    }; // end of oContr.fn.onSelectApp


/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };