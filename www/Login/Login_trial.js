(function (window, oAPP) {
    "use strict";

    oAPP.fn.fnOnTrialLoginPageRendering = () => {

        var oApp = new sap.m.App({
            autoFocus: false,
        });

        var oLoginPage = oAPP.fn.fnGetTrialLoginPage();

        oApp.addPage(oLoginPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnOnTrialLoginPageRendering

    oAPP.fn.fnGetTrialLoginPage = () => {

        var oFcard = oAPP.fn.fnGetTrialLoginFormFCard();

        return new sap.m.Page({

            // properties
            showHeader: false,
            showFooter: true,
            backgroundDesign: sap.m.PageBackgroundDesign.Transparent,

            // aggregations
            content: [

                new sap.m.VBox({

                    // properties
                    alignItems: sap.m.FlexAlignItems.Center,
                    renderType: sap.m.FlexRendertype.Bare,
                    alignItems: sap.m.FlexAlignItems.Center,
                    justifyContent: sap.m.FlexJustifyContent.Center,
                    width: "100%",
                    height: "100%",

                    // Aggregations
                    items: [
                        oFcard
                    ]

                })

            ],
            footer: new sap.m.Toolbar({
                content: [
                    new sap.m.Text({
                        text: "Copyright 2022. Infocg inc. all rights reserved."
                    }),

                    new sap.m.ToolbarSpacer(),

                    new sap.tnt.InfoLabel({
                        text: "Trial Version"
                    })
                    // new sap.m.Text({
                    //     text: "Trial Version"
                    // }),

                ]
            }).addStyleClass("sapUiSizeCompact")

        });

    }; // end of oAPP.fn.fnGetTrialLoginPage

    oAPP.fn.fnGetTrialLoginFormFCard = () => {

        return new sap.f.Card({
            width: "25rem",

            header: new sap.f.cards.Header({
                iconSrc: "../img/logo.png",
                title: "U4A Workspace Guest Login",
                iconDisplayShape: sap.m.AvatarShape.Square,
                // statusText: "Trial Version"

            }),
            content: new sap.m.VBox({
                width: "100%",
                height: "100%",
                renderType: sap.m.FlexRendertype.Bare,
                justifyContent: sap.m.FlexJustifyContent.Center,
                alignItems: sap.m.FlexAlignItems.Center,
                items: [

                    new sap.m.Avatar({
                        displaySize: sap.m.AvatarSize.Custom,
                        backgroundColor: sap.m.AvatarColor.Accent4,
                        customFontSize: "8.125rem",
                        customDisplaySize: "15rem",
                        src: "sap-icon://accept",
                        tooltip: "Click to Guest Login",
                        press: oAPP.fn.fnOnPressGuestLogin

                    }).addStyleClass("sapUiLargeMargin")

                ]

            })

        }).addStyleClass("u4aWsGuestLoginCard sapUiContentPadding");

    }; // end of oAPP.fn.fnGetTrialLoginFormFCard

    oAPP.fn.fnOnPressGuestLogin = () => {

        // parent.setBusy('X');

        // 서버 연결이 되는지 먼저 확인
        oAPP.fn.fnCheckServerAvaliable().then(oAPP.fn.fnCheckServerAvaliableThen);

    }; // end of oAPP.fn.fnOnPressGuestLogin

    oAPP.fn.fnCheckServerAvaliable = () => {

        return new Promise((resolve, reject) => {

            var sServicePath = parent.getServerPath();

            var oFormData = new FormData();
            oFormData.append("SYSCHK", 'X');

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () { // 요청에 대한 콜백
                if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                    if (xhr.status === 200 || xhr.status === 201) {

                        var oResult = JSON.parse(xhr.responseText);
                        resolve(oResult);

                    } else {

                        parent.showMessage(null, 99, "E", xhr.responseText);
                        // parent.setBusy('');

                    }
                }
            };

            xhr.open('POST', sServicePath); // 메소드와 주소 설정
            xhr.send(oFormData); // 요청 전송    


        });

    }; // end of oAPP.fn.fnCheckServerAvaliable

    oAPP.fn.fnCheckServerAvaliableThen = (oResult) => {

        if (oResult.TYPE != "S") {
            sap.m.MessageToast.show(oResult.MSG);
            return;
        }

        oAPP.fn.fnOnTrialLogin();

    }; // end of oAPP.fn.fnCheckServerAvaliableThen

    oAPP.fn.fnOnTrialLogin = () => {

        var oWsSettings = oAPP.fn.fnGetSettingsInfo(),
            trialServerInfo = oWsSettings.trialServerInfo;

        var oLoginData = {
            CLIENT: trialServerInfo.CLIENT,
            ID: trialServerInfo.ID,
            PW: trialServerInfo.PW,
            LANGU: trialServerInfo.LANGU,
            SYSID: trialServerInfo.SYSID
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData({
            "LOGIN": oLoginData
        });

        sap.ui.getCore().setModel(oJsonModel);

        oAPP.events.ev_login(); 

    }; // end of oAPP.fn.fnOnTrialLogin

})(window, oAPP);