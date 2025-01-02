/************************************************************************
 * 부모의 APP 객체 할당
 ************************************************************************/
var oParentAPP = parent.fnGetApp();

var oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.IF_DATA = parent.IF_DATA;

// 테마 정보
let oThemeInfo = oParentAPP.fn.getThemeInfo();

// let sTheme = oAPP.IF_DATA.THEME_INFO.THEME;
let sTheme = oThemeInfo.THEME;

// 로그인 언어 정보
let sLangu = oAPP.IF_DATA.USER_INFO.LANGU;

/************************************************************************
 * UI5 Bootstrap Load
 ************************************************************************/
var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";    
    oScript.setAttribute("src", oAPP.IF_DATA.WS30_BOOT_PATH);

let oBootStrap = {
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


/************************************************************************
 * window load
 ************************************************************************/
window.addEventListener("load", function(){

    if(typeof sap === "undefined"){
        alert("bootstrap 로드 오류!!");
        return;
    }

    sap.ui.getCore().attachInit(async function(){

        // IPC Event 등록
        _attachIpcEvents();
        
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