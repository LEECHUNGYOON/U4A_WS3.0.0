/************************************************************************
 * 부모의 APP 객체 할당
 ************************************************************************/
var oParentAPP = parent.fnGetApp();
var oAPP = {};
    oAPP.fn = {};
    oAPP.common = {};

debugger;

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
        PRCCD: "CANCEL",
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

        let oDelegate = {
            onAfterRendering: function(){

                oAPP.ui.ROOT.removeEventDelegate(oDelegate);

                oAPP.onViewReady();

            }
        };

        oAPP.ui.ROOT.addEventDelegate(oDelegate);

        oAPP.ui.ROOT.placeAt("Content");

        oParentAPP.attr.isLoad = true;
        
    });

});

/************************************************************************
 * window 창의 X 버튼 클릭시 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function(){

    // 로컬스토리지에 저장된 데이터 삭제
    oAPP.fn.removeLocalStorage();

    // 창을 닫았다는 지시자 IFC 전송
    oAPP.fn.sendIfcDataBrowserClose();

};