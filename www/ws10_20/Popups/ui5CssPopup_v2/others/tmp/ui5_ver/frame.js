/************************************************************************
 * 부모의 APP 객체 할당
 ************************************************************************/
var oParentAPP = parent.fnGetApp();

var oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.IF_DATA = parent.IF_DATA;

// 테마 정보
let sTheme = oAPP.IF_DATA.THEME_INFO.THEME;

// 로그인 언어 정보
let sLangu = oAPP.IF_DATA.USER_INFO.LANGU;

/************************************************************************
 * UI5 Bootstrap Load
 ************************************************************************/
var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";    
    oScript.setAttribute("src", oAPP.IF_DATA.WS30_BOOT_PATH);

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

/************************************************************************
 * window load
 ************************************************************************/
window.addEventListener("load", function(){

    if(typeof sap === "undefined"){
        alert("bootstrap 로드 오류!!");
        return;
    }

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