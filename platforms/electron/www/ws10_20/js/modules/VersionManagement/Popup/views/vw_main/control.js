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
        STATUS  : "",
        APPID   : "",
        CLSID   : "",
        CTSNO   : "",
        CTSTX   : "",
        ERDAT   : "",
        ERTIM   : "",
        ERUSR   : "",
        PACKG   : "",
        TAPPID  : "",
        TCLSID  : "",
        VPOSN   : ""
    };


    oContr.oModel = new sap.ui.model.json.JSONModel({
        T_APP_VER_LIST: []
    });

    oContr.oModel.setSizeLimit(Infinity);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/

    /*************************************************************
     * @function - 서버에서 버전 정보 구하기
     *************************************************************/
    function _getAppVerList(){

        return new Promise(function(resolve){

            // 서버 호출 URL
            let sServicePath = oAPP.IF_DATA.sServerPath + "/get_app_ver_list";

            // 어플리케이션 정보
            let oAppInfo = oAPP.IF_DATA.oAppInfo;

            // ajax 결과
            var oResult = undefined;

            let oFormData = new FormData();
                oFormData.append("APPID", oAppInfo.APPID);

            jQuery.ajax({
                async: false,
                method: "POST",
                url: sServicePath,
                data: oFormData,
                cache: false,
                contentType: false,
                processData: false,
                success : function(data, textStatus, xhr) {
                    oResult = { success : true, data : data, status : textStatus, statusCode : xhr && xhr.status, xhr: xhr };
                },
                error : function(xhr, textStatus, error) {
                    oResult = { success : false, data : undefined, status : textStatus, error : error, statusCode : xhr.status, errorResponse :  xhr.responseText, xhr: xhr };
                }
            });            
            
            // 연결 실패일 경우
            if(oResult.success === false){
            
                return resolve({
                    RETCD: "E",
                    STCOD: "E999",
                });
            
            }

            // status 값이 있다면 서버에서 오류 발생
            let u4a_status = oResult.xhr.getResponseHeader("u4a_status");
            if(u4a_status){

                switch (u4a_status) {
                    case "UA0001": // 지원하지 않는 서비스

                        // [MSG]
                        let sErrMsg = "이 서버는 이 기능을 지원하지 않으므로 U4A 팀에 문의하세요.";

                        sap.m.MessageBox.warning(sErrMsg, {
                            onClose: function(){
                    
                                parent.CURRWIN.close();
                                
                            }
                        });

                        oAPP.fn.setBusy("");
                        
                        return;
                
                    default:
                        break;
                }
                
            }

            return resolve(oResult.data);

        });

    } // end of _getAppVerList

    /*************************************************************
     * @function - 버전 정보 구성하기
     *************************************************************/
    function _setVersionList(){

        return new Promise(async function(resolve){

            // 서버에서 어플리케이션 버전 목록을 구한다.
            let oAppVerResult = await _getAppVerList();
         
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

                return;
            }

            let _aVersionList = oAppVerResult.T_APP_VER_LIST;

            let aVerList = [];

            for(const oVersionItem of _aVersionList){

                let _oVerItem = JSON.parse(JSON.stringify(oContr.types.T_APP_VER_LIST));

                _oVerItem.STATUS = "None";

                // 버전 정보 중 현재 Current 버전인 경우는 상태 표시를 녹색으로 표시
                if(oVersionItem.VPOSN === 0){
                    _oVerItem.STATUS = "Indication04";
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



/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        // 버전 정보 구성하기
        await _setVersionList();

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady



    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/



    /*************************************************************
     * @function - 어플리케이션 명 선택
     *************************************************************/
    oContr.fn.onSelectApp = function(oEvent){

        oAPP.fn.setBusy("X");

        let oUi = oEvent.getSource();
        if(!oUi){

            oAPP.fn.setBusy("");

            return;
        }

        let oBindCtx = oUi.getBindingContext();
        if(!oBindCtx){

            oAPP.fn.setBusy("");

            return;
        }

        let oBindData = oBindCtx.getObject();
        if(!oBindData){            

            oAPP.fn.setBusy("");

            return;
        }

        // let TAPPID = oBindData.TAPPID;

        // 버전관리용 어플리케이션 생성  블라블라~~~ 처리 완료 후 IPC로 APP 정보를 전달하여 새창으로 띄우게 하기
        parent.IPCRENDERER.send(`${parent.BROWSKEY}-if-version-management-new-window`, oBindData);

        // 연속 클릭 방지용
        setTimeout(() => {
            
            oAPP.fn.setBusy("");

        }, 3000);

        // parent.CURRWIN.close();

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