/************************************************************************
 * 부모의 APP 객체 할당
 ************************************************************************/
var oParentAPP = parent.fnGetApp();

var oAPP = {};
    oAPP.fn = {};
    oAPP.common = {};


// 메시지 클래스 정보 구하기
let LANGU = oParentAPP.attr.IF_DATA.USER_LOGIN_INFO.LANGU;
let SYSID = oParentAPP.attr.IF_DATA.USER_LOGIN_INFO.SYSID;
let WSMSG = new parent.WSUTIL.MessageClassText(SYSID, LANGU);

oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

// 메시지 클래스 정보 구하는 function
let fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

/************************************************************************
 * UI5 Bootstrap Load
 ************************************************************************/
var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";    
    oScript.setAttribute("src", oParentAPP.attr.IF_DATA.WS30_BOOT_PATH);

let sTheme = oParentAPP.attr.IF_DATA.THEME_INFO.THEME;
let sLangu = oParentAPP.attr.IF_DATA.USER_INFO.LANGU;

let oBootStrap =  {
    "data-sap-ui-language": sLangu,
    "data-sap-ui-noDuplicateIds": "true",
    "data-sap-ui-preload": "async",
    "data-sap-ui-compatVersion": "edge",
    "data-sap-ui-theme": sTheme,
    "data-sap-ui-libs": "sap.m",
};

for (const key in oBootStrap) {
    oScript.setAttribute(key, oBootStrap[key]);
}

document.head.appendChild(oScript);

/*******************************************************
 * @function - 창을 닫았다는 지시자 IFC 전송
 *******************************************************/
oAPP.fn.sendIfcDataBrowserClose = function(){

    // IF PARAM을 구성하여 미리보기 쪽에 전송
    let IF_PARAM = {
        PRCCD: "CLOSE",
        DATA: []
    };

    let sChennalId = `${oParentAPP.attr.IF_DATA.BROWSKEY}--if-ui5css`;

    parent.IPCRENDERER.send(sChennalId, IF_PARAM);

}; // end of oAPP.fn.sendIfcDataBrowserClose

/*******************************************************
 * @function - 창을 닫았다는 지시자 IFC 전송
 *******************************************************/
oAPP.fn.removeLocalStorage = function(){

    // 브라우저키 + 스토리지 저장 prefix값으로 로컬스토리지 전체 삭제
    let sStorageKey = oParentAPP.attr.IF_DATA.BROWSKEY + oParentAPP.attr.IF_DATA.STORAGE_KEY_PREFIX;

    localStorage.removeItem(sStorageKey);

}; // end of oAPP.fn.removeLocalStorage

/************************************************************************
 * window load
 ************************************************************************/
window.addEventListener("load", function(){

    sap.ui.getCore().attachInit(async function(){
        
        let sViewPath = parent.PATH.join(parent.__dirname, "views", "view.js");

        let oView = await import(sViewPath);
  
        jQuery.extend(true, oAPP, oView.oContr);

        oAPP.fn.setBusy(true);

        let oDelegate = {
            onAfterRendering: function(){
                
                parent.CURRWIN.show();

                parent.WSUTIL.setBrowserOpacity(parent.CURRWIN);

                oAPP.ui.ROOT.removeEventDelegate(oDelegate);

                oAPP.onViewReady();

            }
        };

        oAPP.ui.ROOT.addEventDelegate(oDelegate);

        oAPP.ui.ROOT.placeAt("Content");

        oParentAPP.attr.isLoad = true;
        
    });

    oParentAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oParentAPP.attr.IF_DATA.BROWSKEY}`);    
    
    oParentAPP.broadToChild.onmessage = function(oEvent){

        var _PRCCD = oEvent?.data?.PRCCD || undefined;

        if(typeof _PRCCD === "undefined"){
            return;
        }

        //프로세스에 따른 로직분기.
        switch (_PRCCD) {
            case "BUSY_ON":
                //BUSY ON을 요청받은경우.
                // oAPP.setBusyIndicator(true, {ISBROAD:true});

                oAPP.fn.setBusy(true, {ISBROAD: true});

                break;

            case "BUSY_OFF":
                //BUSY OFF를 요청 받은 경우.
                // oAPP.setBusyIndicator(false, {ISBROAD:true});

                oAPP.fn.setBusy(false, {ISBROAD: true});

                break;

            default:
                break;
        }

    };


});


// 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
function _setBroadCastBusy(){

    // 브라우저 닫는 시점에 busy가 켜있을 경우
    if(parent.fnGetBusy() === true){

        //다른 팝업의 BUSY OFF 요청 처리.
        oParentAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        return;

    }

    if(typeof window?.sap?.m?.InstanceManager?.getOpenDialogs !== "function"){
        return;
    }

    // 현재 호출된 dialog 정보 얻기.
    var _aDialog = sap.m.InstanceManager.getOpenDialogs();

    //호출된 dialog가 없다면 exit.
    if(typeof _aDialog === "undefined" || _aDialog?.length === 0){
        return;
    }

    // 내가 띄운 MessageBox 가 있을 경우 Busy OFF
    if(_aDialog.findIndex( item => typeof item.getType === "function" && 
        item.getType() === "Message") !== -1){
        
        //취소를 선택한 경우 다른 팝업의 BUSY OFF 요청 처리.
        oParentAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        // 메인 영역 Busy 끄기
        parent.IPCRENDERER.send(`if-send-action-${oParentAPP.attr.IF_DATA.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" });

    }

}


/************************************************************************
 * window 창의 X 버튼 클릭시 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function(){

    // 로컬스토리지에 저장된 데이터 삭제
    oAPP.fn.removeLocalStorage();

    // 창을 닫았다는 지시자 IFC 전송
    oAPP.fn.sendIfcDataBrowserClose();

    // 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
    _setBroadCastBusy();

};