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


let oThemeInfo = oParentAPP.fn.getThemeInfo();
let sTheme = oThemeInfo.THEME;
// let sTheme = oParentAPP.attr.IF_DATA.THEME_INFO.THEME;

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


/*************************************************************
 * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
 *************************************************************/
function _onIpcMain_if_p13n_themeChange(){

    let oThemeInfo = oParentAPP.fn.getThemeInfo();
    if(!oThemeInfo){
        return;
    }

    let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
    let oBrowserWindow = oParentAPP.REMOTE.getCurrentWindow();
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

    sap.ui.getCore().applyTheme(oThemeInfo.THEME);


    let oModel = oAPP?.oModel || undefined;
    if(!oModel){
        return;
    }

    oModel.setProperty("/S_DETAIL/selectedTheme", oThemeInfo.THEME);

    oAPP.fn.setDetailThemeChange(oThemeInfo.THEME);

} // end of _onIpcMain_if_p13n_themeChange


/*************************************************************
 * @function - IPC Event 등록
 *************************************************************/
function _attachIpcEvents(){

    let oUserInfo = parent.process.USERINFO;
    let sSysID = oUserInfo.SYSID;

    // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
    oParentAPP.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

} // end of _attachIpcEvents

/**************************************************
 * BroadCast Event 걸기
 ***************************************************/
function _attachBroadCastEvent(){

    oParentAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oParentAPP.attr.IF_DATA.BROWSKEY}`);    
    
    oParentAPP.broadToChild.onmessage = function(oEvent){

        var _PRCCD = oEvent?.data?.PRCCD || undefined;

        if(typeof _PRCCD === "undefined"){
            return;
        }

        //프로세스에 따른 로직분기.
        switch (_PRCCD) {
            case "BUSY_ON":
          
                oAPP.fn.setBusy(true, {ISBROAD: true});

                break;

            case "BUSY_OFF":
         
                oAPP.fn.setBusy(false, {ISBROAD: true});

                break;

            default:
                break;
        }

    };
    
} // end of _attachBroadCastEvent


/***********************************************************************
 * @function - 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
 ***********************************************************************/
function _setBroadCastBusy(){

    // 브라우저 닫는 시점에 busy가 켜있을 경우
    if(parent.fnGetBusy() === true){

        // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
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
        
        // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
        oParentAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        // 메인 영역 Busy 끄기
        parent.IPCRENDERER.send(`if-send-action-${oParentAPP.attr.IF_DATA.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" });

    }

} // end of _setBroadCastBusy


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
 * @function - 로컬스토리지에 저장된 데이터 삭제
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

    // BroadCast Event 걸기
    _attachBroadCastEvent();
    
    sap.ui.getCore().attachInit(async function(){

        // IPC Event 등록
        _attachIpcEvents();        
        
        let sViewPath = parent.PATH.join(parent.__dirname, "views", "view.js");

        let oView = await import(sViewPath);
  
        jQuery.extend(true, oAPP, oView.oContr);

        oAPP.fn.setBusy(true);

        let oDelegate = {
            onAfterRendering: function(){

                oAPP.ui.ROOT.removeEventDelegate(oDelegate);
                
                parent.CURRWIN.show();

                parent.WSUTIL.setBrowserOpacity(parent.CURRWIN);                

                oAPP.onViewReady();

            }
        };

        oAPP.ui.ROOT.addEventDelegate(oDelegate);

        oAPP.ui.ROOT.placeAt("Content");

        oParentAPP.attr.isLoad = true;
        
    });    

});


/************************************************************************
 * window 창 닫을때 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function(){

    // Busy가 실행 중이면 창을 닫지 않는다.
    if(parent.fnGetBusy() === true){
        return false;
    }

    // 로컬스토리지에 저장된 데이터 삭제
    oAPP.fn.removeLocalStorage();

    // 창을 닫았다는 지시자 IFC 전송
    oAPP.fn.sendIfcDataBrowserClose();

    // 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
    _setBroadCastBusy();

};