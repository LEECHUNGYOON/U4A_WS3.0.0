var oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.IF_DATA = parent.IF_DATA;

/************************************************************************
 * UI5 Bootstrap Load
 ************************************************************************/
var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";    
    oScript.setAttribute("src", oAPP.IF_DATA.WS30_BOOT_PATH);

let oBootStrap =  {
    "data-sap-ui-language": "EN",
    "data-sap-ui-noDuplicateIds": "true",
    "data-sap-ui-preload": "async",
    "data-sap-ui-compatVersion": "edge",
    "data-sap-ui-theme": "sap_horizon_dark",
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

        let APP = new sap.m.App();
        let PAGE = new sap.m.Page({
            title: "aaaaaaaaacccff"
        });

        APP.addPage(PAGE);
        APP.placeAt("Content");

        
    });

});