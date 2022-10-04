(function(oNavCon, oNavConList) {
    "use strict";

    const
        REMOTE = oAPP.remote,
        OCTOKIT = REMOTE.require("@octokit/core").Octokit;

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

                console.log(err);

                resolve({
                    ISCDN: ""
                });

            });

        });

    }; // end of oAPP.fn.fnConnectionGithub

    /************************************************************************
     * Github 연결을 시도 하여 on-premise 인지 CDN인지 확인
     ************************************************************************/
    oAPP.fn.fnConnectionGithubThen = function(fnCallback, oReturn) {

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

        let sBindRoot = "/OPTS/CDN",
            oModelData = {
                TITLE: "CDN Settings",
                DESC: "bulla~~ bulla~~~",
                MORE: "bulla~~ bulla~~~ bulla~~~ bulla~~~ bulla~~~",
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

            oGridList = new sap.f.GridList({
                items: [
                    new sap.f.GridListItem({
                        content: [
                            oHbox
                        ]
                    })
                ]
            }),

            oFooter = new sap.m.Bar({

                contentRight: [
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

    oAPP.fn.fnPressApplyCB = (oAction) => {

        if (oAction !== "OK") {
            return;
        }

        var oPage = oAPP.ui.oPage;
        if (oPage instanceof sap.m.Page === false) {
            return;
        }

        var oModel = oPage.getModel();
        if (!oModel) {
            return;
        }

        var oModelData = oModel.getData();





    }; // end of oAPP.fn.fnPressApplyCB

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








    oAPP.fn.fnCheckConnectionCDN(function(oReturn) {

        // CDN Option Page 그리기
        oAPP.fn.fnInitRendering(oReturn);

    });

})(oUI5.NVCNT, oUI5.NAVIGATIONLIST);