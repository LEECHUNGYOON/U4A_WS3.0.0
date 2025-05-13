/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
jQuery.sap.require("sap.m.MessageBox");

sap.ui.getCore().loadLibrary("sap.ui.table");

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
    oContr.types.T_APP_VER_LIST = {
        _STATUS         : "",
        _STATUS_ICON    : "",
        APPID           : "",
        CLSID           : "",
        CTSNO           : "",
        CTSTX           : "",
        ERDAT           : "",
        ERTIM           : "",
        ERUSR           : "",
        PACKG           : "",
        TAPPID          : "",
        TCLSID          : "",
        VPOSN           : ""
    };


    oContr.oModel = new sap.ui.model.json.JSONModel({
        T_APP_VER_LIST: []
    });

    oContr.oModel.setSizeLimit(Infinity);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @function - 공통 메시지 구성
     *************************************************************/
    function _getWsMsg(){

        let sLANGU = parent.LANGU;

        oContr.msg.M290 = parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "290"); // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.



    } // end of _getWsMsg


    /*************************************************************
     * @function - 공통 ajax
     *************************************************************/
    function _sendAjax(sUrl, oFormData, oOptions){

        return new Promise(function(resolve){

            // default 10 분
            let iTimeout = 1000 * 600;

            if(oOptions && oOptions.iTimeout){
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
                success : function(data, textStatus, xhr) {

                    oResult = { success : true, data : data, status : textStatus, statusCode : xhr && xhr.status, xhr: xhr };

                    // status 값이 있다면 서버에서 오류 발생
                    let u4a_status = oResult.xhr.getResponseHeader("u4a_status");
                    if(u4a_status){

                        switch (u4a_status) {
                            case "UA0001": // 지원하지 않는 서비스

                                // [MSG]
                                var sErrMsg = "이 서버는 이 기능을 지원하지 않으므로 U4A 팀에 문의하세요.";

                                sap.m.MessageBox.warning(sErrMsg, {
                                    onClose: function(){
                            
                                        parent.CURRWIN.close();
                                        
                                    }
                                });

                                oAPP.fn.setBusy("");
                                
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

                                // [MSG]
                                var sErrMsg = "알 수 없는 오류가 발생하였습니다. 문제가 지속될 경우 U4A 팀에 문의하세요.";

                                sap.m.MessageBox.error(sErrMsg, {
                                    onClose: function(){
                            
                                        parent.CURRWIN.close();
                                        
                                    }
                                });

                                oAPP.fn.setBusy("");

                                return;
                        }
                        
                    }

                    return resolve(oResult.data);

                },
                error : function(xhr, textStatus, error) {

                    oResult = { success : false, data : undefined, status : textStatus, error : error, statusCode : xhr.status, errorResponse :  xhr.responseText, xhr: xhr };

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
                    if(oResult.success === false){

                        // [MSG]
                        var sErrMsg = "통신 오류가 발생하였습니다. 네트워크 상태를 확인하시고 문제가 지속 될 경우 U4A 팀에 문의하세요.";

                        sap.m.MessageBox.error(sErrMsg, {
                            onClose: function(){
                    
                                parent.CURRWIN.close();
                                
                            }
                        });

                        oAPP.fn.setBusy("");

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
     * @function - 서버에서 버전 정보 구하기
     *************************************************************/
    // function _getAppVerList(){

    //     return new Promise(function(resolve){

    //         // 서버 호출 URL
    //         let sServicePath = oAPP.IF_DATA.sServerPath + "/get_app_ver_list";

    //         // 어플리케이션 정보
    //         let oAppInfo = oAPP.IF_DATA.oAppInfo;

    //         // ajax 결과
    //         var oResult = undefined;

    //         let oFormData = new FormData();
    //             oFormData.append("APPID", oAppInfo.APPID);

    //         jQuery.ajax({
    //             async: false,
    //             method: "POST",
    //             url: sServicePath,
    //             data: oFormData,
    //             cache: false,
    //             contentType: false,
    //             processData: false,
    //             success : function(data, textStatus, xhr) {
    //                 oResult = { success : true, data : data, status : textStatus, statusCode : xhr && xhr.status, xhr: xhr };
    //             },
    //             error : function(xhr, textStatus, error) {
    //                 oResult = { success : false, data : undefined, status : textStatus, error : error, statusCode : xhr.status, errorResponse :  xhr.responseText, xhr: xhr };
    //             }
    //         });            
            
    //         // 연결 실패일 경우
    //         if(oResult.success === false){

    //             var sConsoleMsg = 
    //             `[
    //                 PATH: www/ws10_20/js/modules/VersionManagement/Popup/views/vw_main/control.js => _getAppVerList => error callback
    //                 - REQ_URL : ${sUrl}
    //             ]`;

    //             console.error(sConsoleMsg);
                
    //             // [MSG]
    //             var sErrMsg = "통신 오류가 발생하였습니다. 네트워크 상태를 확인하시고 문제가 지속 될 경우 U4A 팀에 문의하세요.";

    //             sap.m.MessageBox.error(sErrMsg, {
    //                 onClose: function(){
            
    //                     parent.CURRWIN.close();
                        
    //                 }
    //             });

    //             oAPP.fn.setBusy("");

    //             return;

    //             // return resolve({
    //             //     RETCD: "E",
    //             //     STCOD: "E999",
    //             // });
            
    //         }

    //         // status 값이 있다면 서버에서 오류 발생
    //         let u4a_status = oResult.xhr.getResponseHeader("u4a_status");
    //         if(u4a_status){

    //             switch (u4a_status) {
    //                 case "UA0001": // 지원하지 않는 서비스

    //                     // [MSG]
    //                     var sErrMsg = "이 서버는 이 기능을 지원하지 않으므로 U4A 팀에 문의하세요.";

    //                     sap.m.MessageBox.warning(sErrMsg, {
    //                         onClose: function(){
                    
    //                             parent.CURRWIN.close();
                                
    //                         }
    //                     });

    //                     oAPP.fn.setBusy("");
                        
    //                     return;
                
    //                 default:

    //                     var sConsoleMsg = 
    //                     `[
    //                         PATH: www/ws10_20/js/modules/VersionManagement/Popup/views/vw_main/control.js => _getAppVerList
    //                         DESC: response header에 'u4a_status' 값이 ${u4a_status} 값으로 날라옴.
    //                     ]`;

    //                     console.error(sConsoleMsg);

    //                     // [MSG]
    //                     var sErrMsg = "알 수 없는 오류가 발생하였습니다. 문제가 지속될 경우 U4A 팀에 문의하세요.";

    //                     sap.m.MessageBox.error(sErrMsg, {
    //                         onClose: function(){
                    
    //                             parent.CURRWIN.close();
                                
    //                         }
    //                     });

    //                     oAPP.fn.setBusy("");

    //                     return;
    //             }
                
    //         }

    //         return resolve(oResult.data);

    //     });

    // } // end of _getAppVerList

    /*************************************************************
     * @function - 버전 정보 구성하기
     *************************************************************/
    function _setVersionList(){

        return new Promise(async function(resolve){

            // 서버 호출 URL
            let sServerPath = oAPP.IF_DATA.sServerPath + "/get_app_ver_list";

            // 어플리케이션 정보
            let oAppInfo = oAPP.IF_DATA.oAppInfo;

            let oFormData = new FormData();
                oFormData.append("APPID", oAppInfo.APPID);

            // 서버에서 어플리케이션 버전 목록을 구한다.
            let oAppVerResult = await _sendAjax(sServerPath, oFormData);

            // 서버에서 버전 정보 구하는 중 통신 등의 오류가 발생한 경우..
            if(oAppVerResult.RETCD === "E"){

                // [MSG]
                let sErrMsg = "어플리케이션 버전 정보를 구성하는 중, 문제가 발생하였습니다. \n다시 실행 하시거나 문제가 지속되면 U4A팀으로 문의해주세요.";
                sap.m.MessageBox.error(sErrMsg, {
                    onClose: function(){

                        parent.CURRWIN.close();

                    }
                });

                oAPP.fn.setBusy("");

                // 콘솔용 오류 메시지
                var aConsoleMsg = [
                    `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,  
                    `=> _setVersionList`,
                    `=> let oAppVerResult = await _sendAjax(sServerPath, oFormData);`,
                    `=> oAppVerResult: ${JSON.stringify(oCheckSapVer)}`,
                ];

                console.error(aConsoleMsg.join("\r\n"));
                console.trace();

                return;
            }

            let _aVersionList = oAppVerResult.T_APP_VER_LIST;

            let aVerList = [];

            for(const oVersionItem of _aVersionList){

                let _oVerItem = JSON.parse(JSON.stringify(oContr.types.T_APP_VER_LIST));

                _oVerItem._STATUS       = "Warning";
                _oVerItem._STATUS_ICON  = "sap-icon://project-definition-triangle-2";

                // 버전 정보 중 현재 Current 버전인 경우는 상태 표시를 녹색으로 표시
                if(oVersionItem.VPOSN === 0){
                    _oVerItem._STATUS       = "Success";
                    _oVerItem._STATUS_ICON  = "sap-icon://color-fill";
                }   

                _oVerItem.APPID     = oVersionItem.APPID; 
                _oVerItem.CLSID     = oVersionItem.CLSID;
                _oVerItem.CTSNO     = oVersionItem.CTSNO;
                _oVerItem.CTSTX     = oVersionItem.CTSTX;
                _oVerItem.ERDAT     = oVersionItem.ERDAT;
                _oVerItem.ERTIM     = oVersionItem.ERTIM;
                _oVerItem.ERUSR     = oVersionItem.ERUSR;
                _oVerItem.PACKG     = oVersionItem.PACKG;
                _oVerItem.TAPPID    = oVersionItem.TAPPID;
                _oVerItem.TCLSID    = oVersionItem.TCLSID;
                _oVerItem.VPOSN     = oVersionItem.VPOSN;

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



/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        // 메시지 구성
        _getWsMsg();

        // 버전 정보 구성하기
        await _setVersionList();

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady



    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/



    /*************************************************************
     * @function - 선택한 버전을 새창으로 오픈
     *************************************************************/
    oContr.fn.openSelectedVersion = async function(){

        let oTable = oContr.ui.TABLE1;

        let aSelIdx = oTable.getSelectedIndices();

        let iSelLength = aSelIdx.length;
        if(iSelLength === 0){

            // [MSG]
            let sMsg = "선택된 버전 항목이 없습니다.";            

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            return;

        }

        // 하나만 선택되어야 함.
        if(iSelLength > 1){

            // [MSG]
            let sMsg = "한개만 선택하세요.";            

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            return;

        }

        let iSelIdx = aSelIdx[0];

        let oBindCtx = oTable.getContextByIndex(iSelIdx);
        if(!oBindCtx){
            return;
        }

        let oBindData = oBindCtx.getObject();        
        if(oBindData.TAPPID === ""){

            // [MSG]
            let sMsg = "현재 버전은 선택할 수 없습니다.";

            // 메시지 토스트 출력
            _showMsgToastCenter(sMsg);

            return;
        }

        let sServerPath = oAPP.IF_DATA.sServerPath + "/create_temp_ver_app";

        let oFormData = new FormData();
            oFormData.append("APPID", oBindData.APPID);
            oFormData.append("VPOSN", oBindData.VPOSN);

        let oResult = await _sendAjax(sServerPath, oFormData);

        if(oResult.RETCD === "E"){

            // 콘솔용 오류 메시지
            var aConsoleMsg = [
                `[PATH]: www/ws10_20/Popups/versionManagement/Popup/views/vw_main/control.js`,  
                `=> oContr.fn.openSelectedVersion`,
                `=> let oResult = await _sendAjax(sServerPath, oFormData);`,
                `=> REQ_URL: ${sServerPath}`,
                `=> oResult: ${JSON.stringify(oResult)}`,
                `=>`,
                `=>`,
                `=>`,
                `=>`,
                `=>`,
                `=>`,
                `=>`,
                `=> oAppVerResult: ${JSON.stringify(oCheckSapVer)}`,
            ];

            console.error(aConsoleMsg.join("\r\n"));
            console.trace();

            let sErrMsg = `[${oResult.STCOD}]: ` + parent.WSUTIL.getWsMsgClsTxt(parent.LANGU, "ZMSG_WS_COMMON_001", oResult.MSGNR) + "\n";
                sErrMsg += oContr.msg.M290; // 다시시도하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.

            sap.m.MessageBox.error(sErrMsg);
            
            oAPP.fn.setBusy("");

            return;

        }

        let oRDATA = oResult.RDATA;

        let TAPPID = oRDATA.TAPPID;

        // 버전관리용 어플리케이션 생성  블라블라~~~ 처리 완료 후 IPC로 APP 정보를 전달하여 새창으로 띄우게 하기
        parent.IPCRENDERER.send(`${parent.BROWSKEY}-if-version-management-new-window`, {TAPPID: TAPPID});

        // 연속 클릭 방지용
        setTimeout(() => {
            
            oAPP.fn.setBusy("");

        }, 3000);
     

    }; // end of oContr.fn.onSelectApp


    /*************************************************************
     * @function - 현재 버전과 비교하기
     *************************************************************/
    oContr.fn.onCompareCurrVersion = function(oEvent){                

        let oUi = oEvent.getSource();
        if(!oUi){
            return;
        }

        let oBindCtx = oUi.getBindingContext();
        if(!oBindCtx){
            return;
        }

        let oBindData = oBindCtx.getObject();
        if(!oBindData){            
            return;
        }

        debugger;

        // 페이지로 이동

        




    }; // end of oContr.fn.onCompareCurrVersion



/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };