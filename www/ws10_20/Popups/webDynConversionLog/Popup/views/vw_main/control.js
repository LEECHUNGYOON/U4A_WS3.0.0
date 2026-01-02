export async function getControl() {

/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
// jQuery.sap.require("sap.m.MessageBox");
// jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

// sap.ui.getCore().loadLibrary("sap.m"); 
// sap.ui.getCore().loadLibrary("sap.f");
// sap.ui.getCore().loadLibrary("sap.ui.layout");
// sap.ui.getCore().loadLibrary("sap.ui.unified");    

    //#region DATA / ATTRIBUTE 선언부
    //#endregion
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

        oContr.attr.T_HEADER = [];

        oContr.attr.T_DETAIL = [];

    // 화면 일반 바인딩 정보.
    const TY_CONT = {
        LOGKY     : "",
        STEP_SHOW : true,
        COMPONENT_DESC : ""
    };


    // ACTION LIST ITEM TYPE
    const TY_ACTLOG = {
        LOGKY          : "",
        ACTCD          : "",
        TEXT           : "",
        COMPONENT_NAME : "",
        COMPONENT_DESC : ""
    };


    // STEP LIST TYPE
    const TY_STEP = {
        SEQ            : 0,
        LOGKY          : "",
        STPCD          : "",
        STPTX          : "",
        ACTCD          : "",
        APPID          : "",
        COMPONENT_NAME : "",
        COMPONENT_DESC : "",
        ERDAT          : "",
        ERNAM          : "",
        ERTIM          : ""
    };


    //LOG DETAIL TYPE
    const TY_DETAIL = {
        LOGTX : "",
        LOG_CNT : 0,
        LOG_SUC : 0,
        LOG_ERR : 0
    };


    //#region MODEL 선언부
    //#endregion
    oContr.oModel = new sap.ui.model.json.JSONModel({
        S_CONT   : {...TY_CONT},
        S_DETAIL : {...TY_DETAIL},
        T_ACTLOG : [],
        T_STEP   : []
    });

    oContr.oModel.setSizeLimit(10000000);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/




/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    //#region onViewReady
    //#endregion
    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        //LOG 정보 구성.
        await oContr.fn.setLogData();


        oContr.oModel.refresh();

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady



    //#region 🔊 step 리스트 선택 이벤트.
    //#endregion
    /************************************************************************
     * 🔊 step 리스트 선택 이벤트.
     ************************************************************************/
    oContr.fn.onSelectStep = function(oEvent){

        oAPP.fn.setBusy("X");

        var _oitem = oEvent.getParameter("listItem");

        //기존 DETAIL 정보 초기화.
        oContr.oModel.oData.S_DETAIL = {...TY_DETAIL};

        //기존 DETAIL 정보 초기화.
        oContr.attr.T_DETAIL = [];
        
        if(!_oitem){

            oContr.oModel.refresh();

            oAPP.fn.setBusy("");

            return;
        }

        var _sSTEP = oContr.fn.getContextData(_oitem);

        if(!_sSTEP){

            oContr.oModel.refresh();

            oAPP.fn.setBusy("");

            return;
        }

        //LOG DETAIL 정보 구성.
        oContr.fn.setLogDetailData(_sSTEP);

    };




    //#region 🔊 DETAIL LOG 전체건 출력 이벤트
    //#endregion
    /************************************************************************
     * 🔊 DETAIL LOG 전체건 출력 이벤트.
     ************************************************************************/
    oContr.fn.onPressLogCount = function(){

        oAPP.fn.setBusy("X");

        //LOG DETAIL TEXT 설정.
        oContr.fn.setLogDetailText();

        oContr.oModel.refresh();

        oAPP.fn.setBusy("");

    };




    //#region 🔊 DETAIL LOG 성공건 출력 이벤트
    //#endregion
    /************************************************************************
     * 🔊 DETAIL LOG 성공건 출력 이벤트.
     ************************************************************************/
    oContr.fn.onPressLogSuccessCount = function(){

        oAPP.fn.setBusy("X");

        //LOG DETAIL TEXT 설정.
        oContr.fn.setLogDetailText("S");

        oContr.oModel.refresh();

        oAPP.fn.setBusy("");

    };




    //#region 🔊 DETAIL LOG 오류건 출력 이벤트
    //#endregion
    /************************************************************************
     * 🔊 DETAIL LOG 오류건 출력 이벤트.
     ************************************************************************/
    oContr.fn.onPressLogErrorCount = function(){

        oAPP.fn.setBusy("X");

        //LOG DETAIL TEXT 설정.
        oContr.fn.setLogDetailText("E");

        oContr.oModel.refresh();

        oAPP.fn.setBusy("");

    };




    //#region 🔊 log header 선택 이벤트.
    //#endregion
    /************************************************************************
     * 🔊 log header 선택 이벤트.
     ************************************************************************/
    oContr.fn.onSelLogHeader = function(){

        oAPP.fn.setBusy("X");

        //상세 내역 초기화.
        oContr.oModel.oData.S_DETAIL = {...TY_DETAIL};
        
        //STEP LIST 구성.
        oContr.oModel.oData.T_STEP = oContr.fn.setStepList(oContr.oModel.oData.S_CONT.LOGKY);

        //web dynpro text 설정.
        oContr.fn.setWebDynText();


        oContr.oModel.refresh();

        oAPP.fn.setBusy("");


    };




    //#region 🔊 log 데이터 갱신.
    //#endregion
    /************************************************************************
     * 🔊 log 데이터 갱신.
     ************************************************************************/
    oContr.fn.onRefreshLogData = async function(){

        oAPP.fn.setBusy("X");

        //LOG 정보 구성.
        await oContr.fn.setLogData();


        oContr.oModel.refresh();

        oAPP.fn.setBusy("");

    };




    //#region 🔊 log 파일 다운로드
    //#endregion
    /************************************************************************
     * 🔊 log 파일 다운로드
     ************************************************************************/
    oContr.fn.onDownloadLogFile = function(){



    };




    //#region LOG 정보 구성.
    //#endregion
    /************************************************************************
     * LOG 정보 구성.
     ************************************************************************/
    oContr.fn.setLogData = async function(){

        
        //광역 변수 초기화.
        oContr.attr.T_HEADER = [];
        oContr.attr.T_DETAIL = [];

        oContr.oModel.oData.S_DETAIL = {...TY_DETAIL};

        oContr.oModel.oData.S_CONT.COMPONENT_DESC = "";


        //초기 데이터 구성.
        var _sRes = await oContr.fn.setInitData();

        //치명적 오류가 발생한 경우.
        if(_sRes.RETCD === "Z"){
            sap.m.MessageBox.error(_sRes.RTMSG);

            return;
        }

        
        if(_sRes.RETCD === "E"){
            sap.m.MessageToast.show(_sRes.RTMSG, {my:"center center", at:"center center"});

            return;
        }

        //검색한 LOG HEADER 정보 광역화.
        oContr.attr.T_HEADER = _sRes.T_HEADER;

        
        //팝업 초기 모델 바인딩 데이터 구성.
        oContr.fn.fnInitModelBinding();


    };



    //#region LOG DETAIL 정보 구성.
    //#endregion
    /************************************************************************
     * LOG DETAIL 정보 구성.
     ************************************************************************/
    oContr.fn.setLogDetailData = async function(sStep){

        //LOG DETAIL DATA 조회.
        var _sRes = await oContr.fn.getLogDetailData(sStep);

        //치명적 오류가 발생한 경우.
        if(_sRes.RETCD === "Z"){
            sap.m.MessageBox.error(_sRes.RTMSG);

            oContr.oModel.refresh();
            
            oAPP.fn.setBusy("");

            return;
        }
        
        if(_sRes.RETCD === "E"){
            sap.m.MessageToast.show(_sRes.RTMSG, {my:"center center", at:"center center"});

            oContr.oModel.refresh();

            oAPP.fn.setBusy("");

            return;
        }

        //검색한 LOG DETAIL 정보 광역화.
        oContr.attr.T_DETAIL = _sRes.T_DETAIL;


        //LOG DETAIL COUNT 설정.
        oContr.fn.setLogStateCount();


        //LOG STEP TEXT 설정.
        oContr.fn.setLogStepText(sStep);


        //실패건만 출력 처리.
        oContr.ui.ERR_STATE.firePress();


    };



    //#region LOG STEP TEXT 설정.
    //#endregion
    /************************************************************************
     * LOG STEP TEXT 설정.
     ************************************************************************/
    oContr.fn.setLogStepText = function(sStep){

        oContr.oModel.oData.S_DETAIL.STPTX = sStep.STPTX;

    };




    //#region web dynpro text 설정.
    //#endregion
    /************************************************************************
     * web dynpro text 설정.
     ************************************************************************/
    oContr.fn.setWebDynText = function(){

        oContr.oModel.oData.S_CONT.COMPONENT_DESC = "";

        //SELECT의 LOG KEY에 해당하는 ACTLOG 정보 추출.
        var _sACTLOG = oContr.oModel.oData.T_ACTLOG.find( item => item.LOGKY === oContr.oModel.oData.S_CONT.LOGKY );

        if(!_sACTLOG){
            return;
        }

        //WEB DYNPRO 컴포넌트명 및 내역 설정.
        oContr.oModel.oData.S_CONT.COMPONENT_DESC = `[${_sACTLOG.COMPONENT_NAME}] ${_sACTLOG.COMPONENT_DESC}`;

    };




    //#region LOG DETAIL DATA 조회.
    //#endregion
    /************************************************************************
     * LOG DETAIL DATA 조회.
     ************************************************************************/
    oContr.fn.getLogDetailData = async function(sStep){
                
        var _oFormData = new FormData();

        var _sAppData = {
            LOGKY : sStep.LOGKY,
            STPCD : sStep.STPCD
        };

        _oFormData.append("LOGDATA", JSON.stringify(_sAppData));

        try {

            var _url = oAPP.attr.oOptionData.serverPath + "/u4a_cvt_wdr/getConvLogDetail";

            if(parent.REMOTE.app.isPackaged === false){
                _url += `?sap-user=${oAPP.attr.oOptionData.oUserInfo.ID}&sap-password=${oAPP.attr.oOptionData.oUserInfo.PW}`;
            }

            var _sRes = await _sendAjax(_url, _oFormData);

        } catch (error) {
            return error;
        }


        return _sRes;


    };




    //#region LOG DETAIL TEXT 설정.
    //#endregion
    /************************************************************************
     * LOG DETAIL TEXT 설정.
     ************************************************************************/
    oContr.fn.setLogDetailText = function(RESCD){

        oContr.oModel.oData.S_DETAIL.LOGTX = "";

        var _aDETAIL = oContr.attr.T_DETAIL;

        if(RESCD){
            _aDETAIL = _aDETAIL.filter( item => item.RESCD === RESCD );
        }

        if(_aDETAIL.length === 0){
            return;
        }
        
        let _sLogText = "";

        var _sep = "";

        //465	Error
        var _error = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "465");

        //466	Success
        var _success = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "466");

        for (let i = 0, l = _aDETAIL.length; i < l; i++) {
            
            var _sDETAIL = _aDETAIL[i];

            var _sRESTX = "";

            switch (_sDETAIL.RESCD) {
                case "S":
                    _sRESTX = `<span style="background-color: rgb( 35 , 111 , 161 ) ; color: rgb( 236 , 240 , 241 )"><strong>${_success}</strong></span>`;
                    break;
                
                case "E":
                default:
                    _sRESTX = `<span style="background-color: rgb( 224 , 62 , 45 ) ; color: rgb( 236 , 240 , 241 )"><strong>${_error}</strong></span>`;
                    break;
            }

            var _date = `${_sDETAIL.ERDAT.substr(0, 4)}-${_sDETAIL.ERDAT.substr(4, 2)}-${_sDETAIL.ERDAT.substr(6, 2)}`;

            var _time = `${_sDETAIL.ERTIM.substr(0, 2)}:${_sDETAIL.ERTIM.substr(2, 2)}:${_sDETAIL.ERTIM.substr(4, 2)}`;

            _sLogText += `${_sep}[${_date} ${_time}] ${_sRESTX} (${_sDETAIL.SCOPE})<br>`;

            _sLogText += `<strong> - ${_sDETAIL.LOGTX}</strong>`;

            if(_sep === ""){
                _sep = "<br><br>";
            }

        }

        //LOG TEXT 설정.
        oContr.oModel.oData.S_DETAIL.LOGTX = _sLogText;

    };




    //#region LOG DETAIL COUNT 설정.
    //#endregion
    /************************************************************************
     * LOG DETAIL COUNT 설정.
     ************************************************************************/
    oContr.fn.setLogStateCount = function(){

        //전체 건수.
        oContr.oModel.oData.S_DETAIL.LOG_CNT = oContr.attr.T_DETAIL.length;

        //성공 건수.
        oContr.oModel.oData.S_DETAIL.LOG_SUC = oContr.attr.T_DETAIL.filter( item => item.RESCD === "S" ).length;

        //실패 건수.
        oContr.oModel.oData.S_DETAIL.LOG_ERR = oContr.attr.T_DETAIL.filter( item => item.RESCD === "E" ).length;

    };



    //#region 초기 데이터 구성
    //#endregion
    /************************************************************************
     * 초기 데이터 구성.
     ************************************************************************/
    oContr.fn.setInitData = async function(){

        var _oFormData = new FormData();

        var _sAppData = {
            APPID : oAPP.attr.oOptionData.oAppInfo.APPID,
            GUINR : oAPP.attr.oOptionData.oAppInfo.GUINR
        };

        _oFormData.append("APPDATA", JSON.stringify(_sAppData));

        try {

            var _url = oAPP.attr.oOptionData.serverPath + "/u4a_cvt_wdr/getConvLogHeader";

            if(parent.REMOTE.app.isPackaged === false){
                _url += `?sap-user=${oAPP.attr.oOptionData.oUserInfo.ID}&sap-password=${oAPP.attr.oOptionData.oUserInfo.PW}`;
            }
            
            var _sRes = await _sendAjax(_url, _oFormData);

        } catch (error) {
            return error;
        }


        return _sRes;
        

    };




    //#region 초기 모델 바인딩
    //#endregion
    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oContr.fn.fnInitModelBinding = function () {

        oContr.oModel.oData.S_CONT = {...TY_CONT};

        //ACTION LIST DDLB 리스트 구성.
        oContr.oModel.oData.T_ACTLOG = oContr.fn.setHeaderDDLBList();

        //기본 선택값 세팅.
        oContr.oModel.oData.S_CONT.LOGKY = oContr.oModel.oData.T_ACTLOG[0]?.LOGKY || "";

        //web dynpro text 설정.
        oContr.fn.setWebDynText();


        //STEP LIST 구성.
        oContr.oModel.oData.T_STEP = oContr.fn.setStepList(oContr.oModel.oData.S_CONT.LOGKY);


    }; // end of oContr.fn.fnInitModelBinding




    //#region ACTION LIST DDLB 리스트 구성.
    //#endregion
    /************************************************************************
     * ACTION LIST DDLB 리스트 구성.
     ************************************************************************/
    oContr.fn.setHeaderDDLBList = function(){

        let _aACTLOG = [];

        var _aLOGKY = [];

        //467	U4A APP Creation Web Dynpro Conversion
        var _acttx1 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "467");

        //468	Wizard Web Dynpro Conversion
        var _acttx2 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "468");

        for (let i = 0, l = oContr.attr.T_HEADER.length; i < l; i++) {
            
            var _sHeader = oContr.attr.T_HEADER[i];

            if(_aLOGKY.indexOf(_sHeader.LOGKY) !== -1){
                continue;
            }

            _aLOGKY.push(_sHeader.LOGKY);

            var _sACTLOG = {...TY_ACTLOG};

            //LOG KEY.
            _sACTLOG.LOGKY = _sHeader.LOGKY;

            //ACTION CODE.
            _sACTLOG.ACTCD = _sHeader.ACTCD;

            var _date = `${_sHeader.ERDAT.substr(0, 4)}-${_sHeader.ERDAT.substr(4, 2)}-${_sHeader.ERDAT.substr(6, 2)}`;

            var _time = `${_sHeader.ERTIM.substr(0, 2)}:${_sHeader.ERTIM.substr(2, 2)}:${_sHeader.ERTIM.substr(4, 2)}`;

            var _acttx = "";

            switch (_sACTLOG.ACTCD) {
                case "CREATE_APP":
                    _acttx = _acttx1;
                    break;

                case "WIZARD_CREATE":
                    _acttx = _acttx2;
                    break;
                default:
                    break;
            }


            //DDLB TEXT 구성.
            // _sACTLOG.TEXT  = `[${_sHeader.ERDAT}] ${_sHeader.ERTIM} - ${_sHeader.ACTCD}`;
            // _sACTLOG.TEXT  = `${_sHeader.COMPONENT_NAME} [${_date} ${_time}]`;
            _sACTLOG.TEXT  = `${_acttx} [${_date} ${_time}]`;

            //WEB DYNPRO 컴포넌트명.
            _sACTLOG.COMPONENT_NAME = _sHeader.COMPONENT_NAME;

            //WEB DYNPRO 컴포넌트 내역.
            _sACTLOG.COMPONENT_DESC = _sHeader.COMPONENT_DESC;

            _aACTLOG.push(_sACTLOG);
            
        }
        
        return _aACTLOG;

    };




    //#region Step List 구성.
    //#endregion
    /************************************************************************
     * Step List 구성.
     ************************************************************************/
    oContr.fn.setStepList = function(LOGKY){

        let _aSTEP = [];


        var _aHEADER = oContr.attr.T_HEADER.filter( item => item.LOGKY === LOGKY );

        if(_aHEADER.length === 0){
            return _aSTEP;
        }

        for (let i = 0, l = _aHEADER.length; i < l; i++) {

            const _sHEADER = _aHEADER[i];

            var _sSTEP = {...TY_STEP};

            //순번.
            _sSTEP.SEQ            = i + 1;

            //LOG KEY.
            _sSTEP.LOGKY          = _sHEADER.LOGKY;

            //STEP CODE.
            _sSTEP.STPCD          = _sHEADER.STPCD;

            //STEP TEXT.
            _sSTEP.STPTX          = _sHEADER.STPTX;

            //ACTION CODE.
            _sSTEP.ACTCD          = _sHEADER.ACTCD;

            //U4A APP ID.
            _sSTEP.APPID          = _sHEADER.APPID;

            //WEB DYN COMPONENT NAME.
            _sSTEP.COMPONENT_NAME = _sHEADER.COMPONENT_NAME;

            //생성 TIMESTAMP.
            _sSTEP.ERDAT          = _sHEADER.ERDAT;
            _sSTEP.ERNAM          = _sHEADER.ERNAM;
            _sSTEP.ERTIM          = _sHEADER.ERTIM;
            
            _aSTEP.push(_sSTEP);
            
        }

        return _aSTEP;

    };




    //#region BindingContext 에서 모델 데이터 발췌.
    //#endregion
    /************************************************************************
     * 모델 바인딩 처리된 ui의 BindingContext 에서 모델 데이터 발췌.
     ************************************************************************/
    oContr.fn.getContextData = function(oUi){

        if(typeof oUi === "undefined"){
            return;
        }

        let _oCtxt = oUi.getBindingContext() || undefined;

        if(typeof _oCtxt?.getProperty === "undefined"){
            return;
        }

        return _oCtxt.getProperty();

    };




/********************************************************************
 *💨 EXPORT
 *********************************************************************/
    return oContr;

}