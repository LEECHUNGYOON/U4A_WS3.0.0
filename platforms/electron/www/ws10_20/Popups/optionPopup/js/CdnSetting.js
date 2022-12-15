(function (oNavCon, oNavConList) {
    "use strict";
   
    const
        REMOTE = oAPP.remote,
        OCTOKIT = REMOTE.require("@octokit/core").Octokit,
        BINDROOT = "/OPTS/CDN";

    jQuery.sap.require("sap.m.MessageBox");

    oAPP.fn.fnGetSettingsInfo = () => {

        let oAPP = parent.fn_getParent(),
            PATH = oAPP.path,
            APPPATH = oAPP.apppath;

        // Browser Window option
        let sSettingsJsonPath = PATH.join(APPPATH, "/settings/ws_settings.json"),

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = parent.require(sSettingsJsonPath);

        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.fnGetSettingsInfo

    /************************************************************************
     * Github 연결을 시도 하여 on-premise 인지 CDN인지 확인
     ************************************************************************/
    oAPP.fn.fnConnectionGithub = () => {

        return new Promise((resolve, reject) => {

            let oSettings = oAPP.fn.fnGetSettingsInfo(),
                oGitSettings = oSettings.GITHUB,
                sGitDevKey = oGitSettings.devKey,
                sLatestUrl = oGitSettings.latestUrl

            const octokit = new OCTOKIT({
                auth: atob(sGitDevKey)
            });

            octokit.request(sLatestUrl, {
                org: "octokit", //기본값  
                type: "Public", //github repositories type private /  Public 
            }).then((data) => {

                resolve({
                    ISCDN: "X"
                });

            }).catch((err) => {

                console.error(err);

                resolve({
                    ISCDN: ""
                });

            });

        });

    }; // end of oAPP.fn.fnConnectionGithub

    /************************************************************************
     * Github 연결을 시도 하여 on-premise 인지 CDN인지 확인
     ************************************************************************/
    oAPP.fn.fnConnectionGithubThen = function (fnCallback, oReturn) {

        if (typeof fnCallback === "function") {
            fnCallback(oReturn);
        }

        // Busy Indicator Off
        oAPP.fn.fnSetBusy(false);

    }; // end of oAPP.fn.fnConnectionGithubThen

    /************************************************************************
     * CDN Option Page 그리기
     ************************************************************************/
    oAPP.fn.fnInitRendering = (oReturn) => {


        let sMoreTxt = "U4A WS 3.0 Application Upgrade Infrastructure setting. \n\n";
        sMoreTxt += "If you Available External Internet Connection and You Want to always upgrade for latest version\n\n You can choice CDN Setting Switch Button turn On. \n\n";
        sMoreTxt += "If you want to only Upgrade for on-premise, You can choice CDN Setting Switch Button turn off.\n\n\n";

        sMoreTxt += "U4A WS 3.0 Application Upgrade 환경설정 \n\n";
        sMoreTxt += "외부망 연결이 가능하고, 항상 최신버전으로 업그레이드를 원할 경우, CDN Setting 스위치 버튼을 On으로 저장하세요. \n\n";
        sMoreTxt += "만약, 외부망 연결이 불가능한 환경이거나, SAP 서버에 설치되어 있는 버전으로만 업그레이드를 원할 경우 CDN Setting 스위치 버튼을 Off로 저장하세요.";

        let sBindRoot = BINDROOT,
            oModelData = {
                TITLE: "CDN Setting",
                DESC: "U4A WS 3.0 Application Upgrade Setting.",
                MORE: sMoreTxt,
                ISCDN: oAPP.IF_DATA.ISCDN,
                ISPING: oReturn.ISCDN
            },

            oVBox = new sap.m.VBox({
                items: [
                    new sap.m.Title({
                        text: `{${sBindRoot}/TITLE}`
                    }),

                    new sap.m.Text({
                        text: `{${sBindRoot}/DESC}`
                    })
                ]
            }),

            oSwitch = new sap.m.Switch({
                change: (oEvent) => {

                    var bState = oEvent.getParameter("state"),
                        sConvState = (bState ? "X" : "");

                    oAPP.ui.oPage.getModel().setProperty(`${sBindRoot}/ISCDN`, sConvState);

                }
            })
            .bindProperty("state", {
                parts: [
                    `${sBindRoot}/ISCDN`
                ],
                formatter: (ISCDN) => {

                    let bIsCdn = (ISCDN == "X" ? true : false);

                    return bIsCdn;

                }
            }).bindProperty("enabled", {
                parts: [
                    `${sBindRoot}/ISPING`
                ],
                formatter: (ISPING) => {

                    let bIsCdn = (ISPING == "X" ? true : false);

                    return bIsCdn;

                }
            }),

            oHbox = new sap.m.HBox({
                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                items: [
                    oVBox,
                    oSwitch
                ]
            }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBeginEnd"),

            oPanel = new sap.m.Panel({
                expandable: true,
                expanded: true,
                headerText: "More Info",
                content: [
                    new sap.m.Text({
                        text: `{${sBindRoot}/MORE}`
                    })
                ]
            }).addStyleClass("sapUiTinyMarginTop"),

            oGridList = new sap.f.GridList({
                items: [
                    new sap.f.GridListItem({
                        content: [
                            oHbox,
                            oPanel
                        ]
                    })
                ]
            }),

            oFooter = new sap.m.Bar({

                contentRight: [

                    new sap.m.Button({
                        icon: "sap-icon://refresh",
                        text: "Refresh",
                        press: (oEvent) => {

                            oAPP.fn.fnSetBusy(true);

                            // 외부망 접속이 되는지 확인한다.
                            oAPP.fn.fnCheckConnectionCDN(function (oReturn) {

                                // 외부망 접속 가능 여부 값을 모델에 저장한다.
                                oAPP.ui.oPage.getModel().setProperty(`${sBindRoot}/ISPING`, oReturn.ISCDN, true);

                                oAPP.fn.fnSetBusy(false);

                                // 외부망 접속이 안될 경우
                                if (oReturn.ISCDN == "") {

                                    let sMsg = "Check your network to see if an external network connection is available.";

                                    // 외부망 접속을 확인하세요 메시지 팝업
                                    sap.m.MessageBox.error(sMsg, {
                                        title: "Error", // default
                                        onClose: null, // default
                                        styleClass: "", // default
                                        actions: sap.m.MessageBox.Action.CLOSE, // default
                                        emphasizedAction: null, // default
                                        initialFocus: null, // default
                                        textDirection: sap.ui.core.TextDirection.Inherit // default
                                    });

                                }

                            });

                        }
                    }),

                    new sap.m.Button({
                        icon: "sap-icon://accept",
                        text: "Apply",
                        type: sap.m.ButtonType.Emphasized,
                        press: (oEvent) => {
                            oAPP.fn.fnPressApply(oEvent);
                        }
                    }).bindProperty("enabled", {
                        parts: [
                            `${sBindRoot}/ISPING`
                        ],
                        formatter: (ISPING) => {

                            let bIsCdn = (ISPING == "X" ? true : false);

                            return bIsCdn;

                        }
                    })
                ]
            }),

            oJsonModel = new sap.ui.model.json.JSONModel(),

            oPage = new sap.m.Page({
                showHeader: false,
                icon: "sap-icon://download-from-cloud",
                title: "CDN Settings",
                content: [
                    oGridList
                ],
                footer: oFooter

            }).addStyleClass("sapUiContentPadding");

        oJsonModel.setData({
            OPTS: {
                CDN: oModelData
            }
        });

        oPage.setModel(oJsonModel);

        oNavCon.addPage(oPage);

        oAPP.ui.oPage = oPage;

    }; // end of oAPP.fn.fnInitRendering

    /************************************************************************
     * CDN Setting 적용 버튼
     ************************************************************************/
    oAPP.fn.fnPressApply = (oEvent) => {

        let sMsg = "do you want to save it?";

        sap.m.MessageBox.confirm(sMsg, {
            title: "Confirm", // default                     
            actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CANCEL
            ], // default         
            onClose: oAPP.fn.fnPressApplyCB
        });

    }; // end of oAPP.fn.fnPressApply

    /************************************************************************
     * IPCRENDERER를 이용하여 CDN Setting 저장 
     ************************************************************************/
    oAPP.fn.fnPressApplyCB = (oAction) => {

        var oPage = oAPP.ui.oPage;
        if (oPage instanceof sap.m.Page === false) {
            return;
        }

        var oModel = oPage.getModel();
        if (!oModel) {
            return;
        }

        // 저장 팝업에서 취소 눌렀을 경우 기 저장된 값으로 변경
        if (oAction !== "OK") {
            oModel.setProperty(`${BINDROOT}/ISCDN`, oAPP.IF_DATA.ISCDN);
            return;
        }

        var oModelData = oModel.getProperty(BINDROOT);

        // CDN 여부를 저장 하기 위해 메인렌더러에 CDN 여부 값을 전송
        oAPP.ipcRenderer.send(`${oAPP.IF_DATA.BROWSKEY}-cdn-save`, {
            ISCDN: oModelData.ISCDN,
            BROWSKEY: oAPP.IF_DATA.BROWSKEY
        });

        oAPP.fn.fnSetBusy(true);

        // CDN 저장 결과 Callback 이벤트를 건다.
        oAPP.ipcRenderer.on(`${oAPP.IF_DATA.BROWSKEY}-cdn-save-callback`, oAPP.fn.IpcRendererCdnSaveCallback);

    }; // end of oAPP.fn.fnPressApplyCB

    /************************************************************************
     * CDN 저장 후 콜백
     ************************************************************************/
    oAPP.fn.IpcRendererCdnSaveCallback = (oEvent, oRes) => {

        oAPP.IF_DATA.ISCDN = oRes.ISCDN;

        oAPP.ipcRenderer.off(`${oAPP.IF_DATA.BROWSKEY}-cdn-save-callback`, oAPP.fn.IpcRendererCdnSaveCallback);

        oAPP.fn.fnSetBusy(false);

        // 성공 메시지..
        sap.m.MessageToast.show("complete", {
            duration: 10000
        });

    }; // end of oAPP.fn.IpcRendererCdnSaveCallback

    /************************************************************************
     * 화면 Loading Mode 설정 
     ************************************************************************/
    oAPP.fn.fnSetBusy = (a) => {

        oNavCon.setBusy(a);
        oNavConList.setBusy(a);

    }; // end of oAPP.fn.fnSetBusy  

    /************************************************************************
     * CDN 여부 확인
     ************************************************************************/
    oAPP.fn.fnCheckConnectionCDN = (fnCallback) => {

        oAPP.fn.fnConnectionGithub().then(oAPP.fn.fnConnectionGithubThen.bind(this, fnCallback));

    }; // end of oAPP.fn.fnCheckConnectionCDN








    oAPP.fn.fnCheckConnectionCDN(function (oReturn) {

        // CDN Option Page 그리기
        oAPP.fn.fnInitRendering(oReturn);

    });

})(oUI5.NVCNT, oUI5.NAVIGATIONLIST);