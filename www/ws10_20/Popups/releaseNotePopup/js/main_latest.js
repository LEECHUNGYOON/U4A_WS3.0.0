let oAPP = {};
let oHandle = {};
oHandle.UI = {};

/************************************************************************
 * UI5 BootStrap 
 ************************************************************************/
function onLoadBootStrapSetting() {

    var oSettings = oAPP.fnGetSettingsInfo(),
        oSetting_UI5 = oSettings.UI5,     
        oBootStrap = oSetting_UI5.bootstrap,
        oUserInfo = oAPP.attr.oUserInfo,
        oThemeInfo = oAPP.attr.oThemeInfo,
        sLangu = oUserInfo.LANGU;

    var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";

    // 공통 속성 적용
    for (const key in oBootStrap) {
        oScript.setAttribute(key, oBootStrap[key]);
    }

    // 로그인 Language 적용
    oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
    oScript.setAttribute("data-sap-ui-language", sLangu);
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.suite.ui.commons, sap.ui.commons, sap.ui.core, sap.ui.layout, sap.f, sap.tnt");
    oScript.setAttribute("src", oSetting_UI5.resourceUrl);

    document.head.appendChild(oScript);

} // end of onLoadBootStrapSetting

document.addEventListener('DOMContentLoaded', () => {
    debugger;

    //electron API 오브젝트 
    oAPP = parent.fn_getParent();

    oAPP.Octokit = oAPP.remote.require("@octokit/core").Octokit;

    //Releases Update data 통신방식 
    oHandle.isCDN = oAPP.fnGetIsCDN();

    var oSettings = oAPP.fnGetSettingsInfo(),
        oGitSettings = oSettings.GITHUB,
        sGitDevKey = oGitSettings.devKey;

    //GITHUB     
    oHandle.DEVKEY = atob(sGitDevKey);
    oHandle.OWNER = oGitSettings.OWNER; //기본값
    oHandle.REPO = oGitSettings.REPO; //폴더명

    //현재 WS3.0 버젼 
    oHandle.curVER = `v${oSettings.appVersion}`;
    // oHandle.curVER = `v${oAPP.APP.getVersion()}`;

    var sServerPath = oAPP.fnGetServerPath();

    //SAP 서버 통신 URL     
    oHandle.sapURL = `${sServerPath}/GET_WS_RELEASE_DATA`;

    // UI5 BootStrap 
    onLoadBootStrapSetting();

});

window.addEventListener("load", () => {

    debugger;

    //UI5 Start 
    sap.ui.getCore().attachInit(function () {
        gfn_crtUI_Main();
    });

});

//==================================================================//
// Functions 
//==================================================================//


//Main UI 생성 - TimeLine body 생성 
function gfn_crtUI_Main() {

    let IsFirstRender = false;

    var APP = new sap.m.App({
        busyIndicatorDelay: 1,
        busy: false
    });

    oHandle.UI.DYNAMICPAGE1 = new sap.f.DynamicPage({
        busyIndicatorDelay: 1,
        fitContent: true,
        toggleHeaderOnTitleClick: false,
        busy: true
    });

    var DYNAMICPAGETITLE1 = new sap.f.DynamicPageTitle({
        areaShrinkRatio: "1:1.6:1.6"
    });
    oHandle.UI.DYNAMICPAGE1.setTitle(DYNAMICPAGETITLE1);

    var HBOX1 = new sap.m.HBox({
        alignContent: "Center",
        alignItems: "Center",
        justifyContent: "Center"
    });
    DYNAMICPAGETITLE1.setHeading(HBOX1);

    let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D30"); // Version
    sTitle += " :";

    var TITLE1 = new sap.m.Title({
        text: sTitle,
        titleStyle: "H4"
    });
    HBOX1.addItem(TITLE1);

    //릴리즈 버젼 
    oHandle.UI.TITLE2 = new sap.m.Title({
        text: "",
        titleStyle: "H4"
    });
    oHandle.UI.TITLE2.addStyleClass("sapUiTinyMarginBegin");
    HBOX1.addItem(oHandle.UI.TITLE2);

    var INFOLABEL1 = new sap.tnt.InfoLabel({
        text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D42"), // Latest
    });
    INFOLABEL1.addStyleClass("sapUiSmallMarginBegin");
    HBOX1.addItem(INFOLABEL1);


    var VBOX1 = new sap.m.VBox();

    //릴리즈 업데이트 제목 
    oHandle.UI.TITLE3 = new sap.m.Title({
        text: "",
        titleStyle: "H5"
    });
    oHandle.UI.TITLE3.addStyleClass("sapUiMediumMarginTop");
    VBOX1.addItem(oHandle.UI.TITLE3);

    //릴리즈 파일 등록 시간 
    oHandle.UI.LABEL1 = new sap.m.Label({
        text: ""
    });
    VBOX1.addItem(oHandle.UI.LABEL1);

    DYNAMICPAGETITLE1.addExpandedContent(VBOX1);

    var FLEXBOX1 = new sap.m.FlexBox({
        width: "100%",
        height: "100%"
    });

    //본문 
    oHandle.UI.HTML1 = new sap.ui.core.HTML({
        content: ""
    });
    FLEXBOX1.addItem(oHandle.UI.HTML1);
    oHandle.UI.DYNAMICPAGE1.setContent(FLEXBOX1);


    oHandle.UI.DYNAMICPAGE1.addEventDelegate({
        onAfterRendering: function (e) {
            if (IsFirstRender) {
                return;
            }
            IsFirstRender = true;
            gfn_crtUI_Item();
        }
    }, this);

    APP.addPage(oHandle.UI.DYNAMICPAGE1);
    APP.placeAt("Content", "only");

}

// 릴리즈 노트 라인 아이템 구성 
function gfn_crtUI_Item() {

    switch (oHandle.isCDN) {
        case "X":
            gfn_crtUI_Item_GITHUB();
            break;

        case "":
            gfn_crtUI_Item_SAP();
            break;

    }

}

// 릴리즈 노트 라인 아이템 구성 - SAP 
function gfn_crtUI_Item_SAP() {

    let oSettings = oAPP.fnGetSettingsInfo();    

    let oformData = new FormData();
    oformData.append('VER', oHandle.curVER);
    oformData.append('ISADM', oAPP.ISADM);
    oformData.append('WSVER', oSettings.appVersion);
    oformData.append('WSPATCH_LEVEL', oSettings.patch_level);

    // // User Info가 있을 경우.
    // if (oAPP.attr.oUserInfo) {

    //     // Server 설정이 HTTP ONLY 일 경우 서버 호출 시 
    //     // ID, PW를 던진다.
    //     let oLogInData = oAPP.attr.oUserInfo;
    //     if (oLogInData.HTTP_ONLY && oLogInData.HTTP_ONLY == "1") {
    //         oformData.append("sap-user", oLogInData.ID);
    //         oformData.append("sap-password", oLogInData.PW);
    //         oformData.append("sap-client", oLogInData.CLIENT);
    //         oformData.append("sap-language", oLogInData.LANGU);

    //     }
    // }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", oHandle.sapURL, true);
    xhr.onreadystatechange = function (oEvent) {

        if (xhr.readyState == XMLHttpRequest.DONE) {

            try {

                debugger;

                var sDATA = JSON.parse(xhr.response);

                //릴리즈 버젼 
                oHandle.UI.TITLE2.setText(sDATA.VERSN);

                //릴리즈 업데이트 제목
                oHandle.UI.TITLE3.setText(sDATA.VRTIL);

                //릴리즈 파일 등록 시간 
                var Lyear = Number(sDATA.ERDAT.substr(0, 4)),
                    Lmon = Number(sDATA.ERDAT.substr(4, 2)),
                    Lmon = Lmon - 1,
                    Lday = Number(sDATA.ERDAT.substr(6, 2)),
                    Lhour = Number(sDATA.ERTIM.substr(0, 2)),
                    Lmin = Number(sDATA.ERTIM.substr(2, 2));
                var oDate = new Date(Lyear, Lmon, Lday, Lhour, Lmin);

                oHandle.UI.LABEL1.setText(oDate.toDateString());

                //본문
                var LONGTXT = "<div style='margin:1em;'>" + sDATA.LONGTXT + "</div>";
                oHandle.UI.HTML1.setContent(LONGTXT);

                //waiting off
                oHandle.UI.DYNAMICPAGE1.setBusy(false);


            } catch (err) {
                //waiting off
                oHandle.UI.DYNAMICPAGE1.setBusy(false);
            }

        }

    };

    xhr.send(oformData);

}


// 릴리즈 노트 라인 아이템 구성 - GITHUB
async function gfn_crtUI_Item_GITHUB() {

    debugger;

    let regex = /[^0-9]/g;
    let LcurVER = Number(oHandle.curVER.replace(regex, ""));

    var octokit = new oAPP.Octokit({
        auth: oHandle.DEVKEY
    });

    var URL = "https://api.github.com/repos/" + oHandle.OWNER + "/" + oHandle.REPO + "/releases/latest";

    try {
        var response = await octokit.request(URL, {
            owner: oHandle.OWNER, //기본값
            repo: oHandle.REPO, //github 설치 폴더명

        });
    } catch (error) {
        //waiting off
        oHandle.UI.DYNAMICPAGE1.setBusy(false);
        return;

    }


    //릴리즈 버젼 
    oHandle.UI.TITLE2.setText(response.data.tag_name);

    //릴리즈 업데이트 제목
    oHandle.UI.TITLE3.setText(response.data.name);

    //릴리즈 파일 등록 시간 
    var oDate = new Date(response.data.published_at);
    oHandle.UI.LABEL1.setText(oDate.toDateString());

    //본문
    var LONGTXT = "<div style='margin:1em;'>" + response.data.body + "</div>";
    oHandle.UI.HTML1.setContent(LONGTXT);

    //waiting off
    oHandle.UI.DYNAMICPAGE1.setBusy(false);


}