/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : Login.js
 * - file Desc : WS Login Page
 ************************************************************************/

let oAPP = (function () {
    "use strict";

    const
        require = parent.require,
        REMOTE = parent.REMOTE,
        APPPATH = parent.APPPATH,
        PATH = parent.PATH,
        REGEDIT = parent.REGEDIT,
        APP = parent.APP,
        USERDATA = APP.getPath("userData"),
        FS = parent.FS,
        PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        autoUpdater = REMOTE.require("electron-updater").autoUpdater,
        autoUpdaterSAP = require(parent.getPath("AUTOUPDSAP")).autoUpdaterSAP,
        SERVPATH = parent.getServerPath(),
        autoUpdaterServerUrl = `${SERVPATH}/update_check`,
        OCTOKIT = REMOTE.require("@octokit/core").Octokit;

    let oAPP = {};
    oAPP.fn = {};
    oAPP.attr = {};
    oAPP.events = {};

    /**
     * Default Browser 기준정보
     *  @ !! 위에서 부터 Default 값 우선 순위 브라우저임!! @@
     */
    oAPP.attr.aDefaultBrowsers = [{
            NAME: "CHROME",
            DESC: "Google Chrome Browser",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"
        },
        {
            NAME: "MSEDGE",
            DESC: "Microsoft Edge",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe"
        },
        {
            NAME: "IE",
            DESC: "Microsoft Internet Explorer",
            REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\IEXPLORE.EXE"
        },
    ];

    oAPP.fn.getDefaultBrowserInfo = () => {
        return oAPP.attr.aDefaultBrowsers;
    };

    // 현재 PC에 설치되어 있는 브라우저 설치 경로를 구한다.
    oAPP.fn.fnCheckIstalledBrowser = () => {

        return new Promise((resolve, reject) => {

            // Default Browser 정보를 구한다.
            var aDefaultBrowsers = oAPP.fn.getDefaultBrowserInfo(),
                iBrowsCnt = aDefaultBrowsers.length;

            var aPromise = [];

            // Default Browser 기준으로 현재 내 PC에 해당 브라우저가 설치되어 있는지 
            // 레지스트리를 확인하여 설치 경로를 구한다.
            for (var i = 0; i < iBrowsCnt; i++) {

                var oPromise = oAPP.fn.fnGetBrowserInfoPromise(aDefaultBrowsers, i);

                aPromise.push(oPromise);

            }

            Promise.all(aPromise).then((aValues) => {

                parent.setDefaultBrowserInfo(aValues);

                resolve();

            });

        });

    }; // end of fnCheckIstalledBrowser

    /************************************************************************
     * 레지스트리를 확인하여 각 브라우저별 설치 경로를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetBrowserInfoPromise = (aDefaultBrowsers, index) => {

        var oDefBrows = aDefaultBrowsers[index],
            sRegPath = oDefBrows.REGPATH;

        var oProm = new Promise((resolve, reject) => {

            REGEDIT.list(sRegPath, (err, result) => {

                var oRETURN = Object.assign({}, aDefaultBrowsers[index]);

                // 레지스터에 해당 패스가 없을 경우 오류 처리..
                if (err) {

                    resolve(oRETURN);
                    return;

                }

                // 해당 브라우저가 설치 되어있으면 실제 설치된 경로를 매핑한다.
                var sObjKey = Object.keys(result)[0],
                    oPathObj = result[sObjKey],
                    oExePathObj = oPathObj.values[""];

                if (oExePathObj != null) {
                    oRETURN.INSPATH = oExePathObj.value;
                }

                resolve(oRETURN);

            });

        });

        return oProm;

    }; // end of fn_onPromise

    /************************************************************************
     * WS의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.fnGetSettingsInfo = () => {

        // Browser Window option
        var oSettingsPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(oSettingsPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of fnGetSettingsInfo

    /************************************************************************
     * WS의 UI5 Bootstrap 정보를 생성한다.
     ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = () => {

        var oSettings = oAPP.fn.fnGetSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
            oBootStrap = oSetting_UI5.bootstrap,
            sLangu = navigator.language;

        sLangu = sLangu.toLowerCase().substring(0, 2); // 저장된 언어 값을 0부터 2까지 자르고 소문자로 변환하여 lang에 저장
        sLangu = sLangu.toUpperCase();

        var oScript = document.createElement("script");
        if (oScript == null) {
            return;
        }

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.f, sap.ui.layout, sap.tnt");
        oScript.setAttribute("data-sap-ui-theme", "sap_fiori_3");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting

    /************************************************************************
     * Illustration Pool에 TNT Theme를 등록한다.
     ************************************************************************/

    oAPP.fn.fnRegisterIllustrationPool = () => {

        jQuery.sap.require("sap.m.IllustrationPool");

        let oTntSet = {
            setFamily: "tnt",
            setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
        };

        let oPool = sap.m.IllustrationPool;

        // register tnt illustration set
        oPool.registerIllustrationSet(oTntSet, false);

    }; // end of oAPP.fn.fnRegisterIllustrationPool

    /************************************************************************
     * Icon Pool에 Fiori icon인 TNT ICON을 등록한다.
     ************************************************************************/
    oAPP.fn.fnRegisterFioriIconPool = () => {

        jQuery.sap.require("sap.ui.core.IconPool");

        let oTntSet = {
            collectionName: "SAP-icons-TNT",
            fontFamily: "SAP-icons-TNT",
            fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
            lazy: true
        };

        let oIconPool = sap.ui.core.IconPool;
        oIconPool.registerFont(oTntSet);

    }; // end of oAPP.fn.fnRegisterFioriIconPool

    /************************************************************************
     * 로그인 페이지의 form
     ************************************************************************/
    oAPP.fn.fnGetLoginForm = () => {

        return new sap.ui.layout.form.Form({
            editable: true,

            layout: new sap.ui.layout.form.ResponsiveGridLayout({
                labelSpanL: 12,
                labelSpanM: 12,
                labelSpanS: 12
            }),

            formContainers: [
                new sap.ui.layout.form.FormContainer({
                    formElements: [

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "CLIENT"
                            }),
                            fields: [
                                new sap.m.Input({
                                    type: sap.m.InputType.Number,
                                    value: "{CLIENT}",
                                    width: "100px",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "ID"
                            }),
                            fields: [

                                new sap.m.SearchField("ws_id", {
                                    value: "{ID}",
                                    showSearchButton: false,
                                    placeholder: "　",
                                    suggest: function (oEvent) {

                                        var sValue = oEvent.getParameter("suggestValue"),
                                            aFilters = [];

                                        if (sValue) {

                                            aFilters = [
                                                new sap.ui.model.Filter([
                                                    new sap.ui.model.Filter("ID", function (sText) {
                                                        return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                                                    }),
                                                ], false)
                                            ];

                                        }

                                        this.getBinding("suggestionItems").filter(aFilters);
                                        this.suggest();

                                    },
                                    search: function (oEvent) {

                                        var bIsPressClearBtn = oEvent.getParameter("clearButtonPressed");
                                        if (bIsPressClearBtn) {
                                            return;
                                        }

                                        var oSuggetionItem = oEvent.getParameter("suggestionItem");
                                        if (oSuggetionItem) {
                                            return;
                                        }

                                        var iKeyCode = event.keyCode;
                                        if (iKeyCode != 13) {
                                            return;
                                        }

                                        oAPP.events.ev_login();

                                    },
                                    enableSuggestions: true,
                                    suggestionItems: {
                                        path: "/LOGIN/IDSUGG",
                                        sorter: "{ path : '/LOGIN/IDSUGG/ID' }",
                                        template: new sap.m.SuggestionItem({
                                            key: "{ID}",
                                            text: "{ID}",
                                        })
                                    }
                                }),

                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "PASSWORD"
                            }),
                            fields: [
                                new sap.m.Input("ws_pw", {
                                    type: sap.m.InputType.Password,
                                    value: "{PW}",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "LANGUAGE"
                            }),
                            fields: [
                                new sap.m.Input({
                                    value: "{LANGU}",
                                    submit: oAPP.events.ev_login
                                })
                            ]
                        }),

                        new sap.ui.layout.form.FormElement({
                            label: new sap.m.Label({
                                design: sap.m.LabelDesign.Bold,
                                text: "Remember ID"
                            }),
                            fields: [
                                new sap.m.CheckBox({
                                    selected: "{REMEMBER}"
                                })
                            ]
                        }),

                    ]
                })

            ] // end of formContainers

        });

    }; // end of oAPP.fn.fnGetLoginForm

    /************************************************************************
     * U4A R&D Staff 자동 로그인 버튼
     ************************************************************************/
    oAPP.fn.fnGetStaffLoginButton = () => {

        return [

            new sap.m.Button({
                text: "영선",
                press: function () {
                    oAPP.fn.fnStaffLogin("yshong");
                }
            }),
            new sap.m.Button({
                text: "성호",
                press: function () {
                    oAPP.fn.fnStaffLogin("shhong");
                }
            }).addStyleClass("sapUiTinyMarginBeginEnd"),
            new sap.m.Button({
                text: "은섭",
                press: function () {
                    oAPP.fn.fnStaffLogin("pes");
                }
            }),
            new sap.m.Button({
                text: "청윤",
                press: function () {
                    oAPP.fn.fnStaffLogin("soccerhs");
                }
            }).addStyleClass("sapUiTinyMarginBeginEnd"),

        ];

    }; // end of oAPP.fn.fnGetStaffLoginButton

    /************************************************************************
     * U4A R&D Staff 자동 로그인
     ************************************************************************/
    oAPP.fn.fnStaffLogin = (sStaffID) => {

        var oId = sap.ui.getCore().byId("ws_id"),
            oPw = sap.ui.getCore().byId("ws_pw"),
            oLogInBtn = sap.ui.getCore().byId("ws_loginBtn");

        oId.setValue(sStaffID);

        switch (sStaffID) {
            case "yshong":
                oPw.setValue("1qazxsw2");
                break;

            case "shhong":
                oPw.setValue("2wsxzaq1!");
                break;

            case "pes":
                oPw.setValue("dmstjq8!");
                break;

            case "soccerhs":
                oPw.setValue("cjddbs12");
                break;

        }

        oLogInBtn.firePress();

    }; // end of oAPP.fn.fnStaffLogin

    /************************************************************************
     * 로그인 페이지의 form 영역을 감싸는 Card (sap.f.Card)
     ************************************************************************/
    oAPP.fn.fnGetLoginFormFCard = () => {
        
        var oForm = oAPP.fn.fnGetLoginForm(),
            aStaffBtns = oAPP.fn.fnGetStaffLoginButton();

        return new sap.f.Card({
            width: "50%",

            header: new sap.f.cards.Header({
                iconSrc: "../img/logo.png",
                title: "U4A Workspace Login",
                iconDisplayShape: sap.m.AvatarShape.Square,

            }),
            content: new sap.m.VBox({
                width: "100%",
                renderType: sap.m.FlexRendertype.Bare,

                layoutData: new sap.m.FlexItemData({
                    styleClass: "sapUiTinyMarginTop"
                }),
                items: [

                    oForm,

                    new sap.m.Button("ws_loginBtn", {
                        text: "LOGIN",
                        width: "100%",
                        type: sap.m.ButtonType.Emphasized,
                        press: oAPP.events.ev_login
                    }),

                    new sap.m.HBox({
                        items: aStaffBtns,
                        layoutData: new sap.m.FlexItemData({
                            styleClass: "sapUiTinyMarginTop"
                        }),
                    }).bindProperty("visible", {
                        parts: [
                            "/LOGIN/SYSID"
                        ],
                        formatter: function (SYSID) {
                            
                            // U4A 서버 일 경우에만 자동 로그인 버튼 보이기
                            switch (SYSID) {
                                case "UHA":
                                case "U4A":
                                    return true;

                                default:
                                    return false;
                            }

                        }
                    })

                ]

            })

        }).addStyleClass("u4aWsLoginFormFcard sapUiContentPadding");

    }; // end of oAPP.fn.fnGetLoginFormFCard

    /************************************************************************
     * 로그인 페이지
     ************************************************************************/
    oAPP.fn.fnGetLoginPage = () => {

        var oFcard = oAPP.fn.fnGetLoginFormFCard();

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

                        // new sap.m.Text({
                        //     text: "CLIENT: {/LOGIN/CLIENT}"
                        // }),

                        new sap.m.Text({
                            text: "SYSID: {/LOGIN/SYSID}"
                        }),

                    ]
                }).addStyleClass("sapUiSizeCompact")

            })
            .bindElement("/LOGIN")
            .addStyleClass("u4aWsLoginPage");

    }; // end of oAPP.fn.fnGetLoginPage

    /************************************************************************
     * 로그인 페이지 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnOnInitRendering = () => {

        var oApp = new sap.m.App({
            autoFocus: false,
        });

        var oLoginPage = oAPP.fn.fnGetLoginPage();

        oApp.addPage(oLoginPage);
        oApp.placeAt("content");

    }; // end of oAPP.fn.fnOnInitRendering   

    /************************************************************************
     * 로그인 페이지 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnOnInitModelBinding = () => {

        var oServerInfo = parent.getServerInfo(),
            bIsRemember = oAPP.fn.fnGetRememberCheck(),
            sRememberId = oAPP.fn.fnGetRememberID();

        var oLoginData = {
                CLIENT: oServerInfo.CLIENT,
                ID: sRememberId,
                PW: "",
                LANGU: oServerInfo.LANGU,
                SYSID: oServerInfo.SYSID,
                REMEMBER: bIsRemember,
                IDSUGG: []
            },

            oBusyPopInit = {
                TITLE: "Checking for updates...",
                ILLUSTTYPE: "sapIllus-BeforeSearch",
                PROGVISI: false,
                PERVALUE: 0
            },

            oBusyPopData = {
                TITLE: "Checking for updates...",
                ILLUSTTYPE: "sapIllus-BeforeSearch",
                PROGVISI: false,
                PERVALUE: 0
            };


        var aIDSugg = oAPP.fn.fnReadIDSuggData();

        oLoginData.IDSUGG = aIDSugg;

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            LOGIN: oLoginData,
            BUSYPOPINIT: oBusyPopInit,
            BUSYPOP: oBusyPopData
        });

        var oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            sap.ui.getCore().setModel(oJsonModel);
            return;
        }

        oCoreModel.setModel(oJsonModel);

    }; // end of oAPP.fn.fnOnInitModelBinding

    /************************************************************************
     * 로그인 버튼 클릭
     ************************************************************************/
    oAPP.events.ev_login = () => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            return;
        }

        let oLogInData = oCoreModel.getProperty("/LOGIN");
        if (oLogInData == null) {
            return;
        }

        var oResult = oAPP.fn.fnLoginCheck(oLogInData.ID, oLogInData.PW, oLogInData.CLIENT, oLogInData.LANGU);
        if (oResult.RETCD == 'E') {

            // 메시지 처리.. 
            parent.showMessage(null, 99, "E", oResult.MSG);
            parent.setBusy("");
            return;

        }

        var sServicePath = parent.getServerPath() + "/wsloginchk";

        var oFormData = new FormData();
        oFormData.append("sap-user", oLogInData.ID);
        oFormData.append("sap-password", oLogInData.PW);
        oFormData.append("sap-client", oLogInData.CLIENT);
        oFormData.append("sap-language", oLogInData.LANGU);

        parent.setBusy('X');

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { // 요청에 대한 콜백
            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    var oResult = JSON.parse(xhr.responseText);
                    if (oResult.TYPE == "E") {

                        // 오류 처리..                   
                        parent.showMessage(null, 99, "E", oResult.MSG);
                        parent.setBusy('');
                        return;
                    }

                    // 실제 접속한 클라이언트 정보를 저장한다.
                    var oServerInfo = parent.getServerInfo();
                    oServerInfo.CLIENT = oResult.MANDT;

                    parent.setServerInfo(oServerInfo);

                    // 여기까지 온건 로그인 성공했다는 뜻이니까 
                    // 권한 체크를 수행한다.
                    oAPP.fn.fnCheckAuthority().then((oAuthInfo) => {

                        // trial 버전 확인
                        var oWsSettings = oAPP.fn.fnGetSettingsInfo(),
                            bIsTrial = oWsSettings.isTrial,
                            bIsPackaged = APP.isPackaged;

                        oAuthInfo.IS_TRIAL = bIsTrial; // 유저 권한 정보에 Trial 정보를 저장한다.

                        // no build일 경우 혹은 Trial 버전일 경우는 최신 버전 체크를 하지 않는다.                        
                        if (!bIsPackaged || bIsTrial) {

                            parent.setBusy('');

                            oAPP.fn.fnCheckVersionFinished(oResult, oAuthInfo);

                            return;
                        }

                        // 개발자 권한 성공시
                        oAPP.fn.fnCheckAuthSuccess(oResult, oAuthInfo);

                    }).catch((e) => {

                        // 권한이 없으므로 오류 메시지를 띄운다.
                        oAPP.fn.fnShowNoAuthIllustMsg(e);

                        parent.setBusy('');

                    });

                } else {

                    parent.showMessage(null, 99, "E", xhr.responseText);
                    parent.setBusy('');
                }
            }
        };

        xhr.open('POST', sServicePath); // 메소드와 주소 설정
        xhr.send(oFormData); // 요청 전송         

    }; // end of oAPP.events.ev_login

    /************************************************************************
     * 개발 권한 체크
     ************************************************************************/
    oAPP.fn.fnCheckAuthority = () => {

        return new Promise((resolve, reject) => {

            var sServicePath = parent.getServerPath() + "/chk_u4a_authority";

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () { // 요청에 대한 콜백
                if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                    if (xhr.status === 200 || xhr.status === 201) {

                        // ***  ISLICEN <== 값이 없으면 !!! 메시지 처리후 화면 종료 !!!
                        // ***  DEV_KEY <== 개발자 KEY  !!! 메시지 처리후 화면 종료 !!!
                        // ***  RTMSG   <== 리턴 메시지
                        // ***  IS_DEV  <== 개발서버 여부 개발서버 : D / (조회만 가능)

                        // {"ISLICEN":"X","RTMSG":"","IS_DEV":"D","DEV_KEY":"39787814141386174101"}


                        var oResult = JSON.parse(xhr.responseText);

                        if (oResult.ISLICEN == "") {
                            reject(oResult.RTMSG);
                            return;
                        }

                        if (oResult.DEV_KEY == "") {
                            reject(oResult.RTMSG);
                            return;
                        }

                        resolve(oResult);

                    } else {

                        parent.showMessage(null, 99, "E", xhr.responseText);
                        parent.setBusy('');

                    }
                }
            };

            xhr.open('GET', sServicePath); // 메소드와 주소 설정
            xhr.send(); // 요청 전송   

        }); // end of promise

    }; // end of oAPP.fn.fnCheckAuthority

    /************************************************************************
     * 개발자 권한 체크 성공시 수행
     ************************************************************************/
    oAPP.fn.fnCheckAuthSuccess = (oResult, oAuthInfo) => {

        var oResultData = {
            oResult: oResult,
            oAuthInfo: oAuthInfo
        };

        // 고객사 라이센스를 체크한다.
        oAPP.fn.fnCheckCustomerLisence().then(oAPP.fn.fnCheckCustomerLisenceThen.bind(oResultData));

    }; // end of oAPP.fn.fnCheckAuthSuccess

    /************************************************************************
     * 고객사 라이센스 체크를 한다.
     ************************************************************************/
    oAPP.fn.fnCheckCustomerLisence = () => {

        // CHK_CUSTOMER_LICENSE
        return new Promise((resolve, reject) => {

            var sServicePath = parent.getServerPath() + "/chk_customer_license";

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () { // 요청에 대한 콜백
                if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                    if (xhr.status === 200 || xhr.status === 201) {

                        resolve(JSON.parse(xhr.responseText));

                    } else {

                        parent.showMessage(null, 99, "E", xhr.responseText);
                        parent.setBusy('');

                    }
                }
            };

            xhr.open('GET', sServicePath); // 메소드와 주소 설정
            xhr.send(); // 요청 전송   

        });

    }; // end of oAPP.fn.fnCheckCustomerLisence

    /************************************************************************
     * 고객사 라이센스 체크 성공
     ************************************************************************/
    oAPP.fn.fnCheckCustomerLisenceThen = function (oLicenseInfo) {

        // ISCDS TYPE C LENGTH 1, "on premise : space
        // RETCD TYPE C LENGTH 1, "처리 리턴 코드 : E 오류
        // RTMSG TYPE STRING,     "처리 리턴 메시지
        // REMIN TYPE STRING,     "라이센스 잔여 일
        // ISLIC TYPE C LENGTH 1, "라이센스 유효 여부 "X : 유효"

        // 오류 확인
        if (oLicenseInfo.RETCD == "E") {

            // 라이선스가 유효하지 않으면 오류 메시지와 함께 창 닫는다.
            oAPP.fn.fnShowNoAuthIllustMsg(oLicenseInfo.RTMSG);

            parent.setBusy('');

            return;
        }

        // 개인화 파일에 저장된 CDN 허용 여부 플래그를 구한다.
        // var bIsCDN = oAPP.fn.fnGetIsCDN();
        var bIsCDN = parent.getIsCDN();

        // CDN 허용 여부 플래그가 저장되지 않았을 경우.
        if (typeof bIsCDN == "undefined") {

            parent.setBusy("");

            parent.showMessage(sap, 30, "I", "Do you want to allow CDN Auto Update?", lf_msgCallback.bind(this));

            function lf_msgCallback(sAction) {

                parent.setBusy("X");

                var YES = sap.m.MessageBox.Action.YES,
                    bIsAction = (sAction == YES ? "X" : "");

                // CDN 허용여부 플래그 값을 개인화 폴더에 저장한다.
                // oAPP.fn.fnSetIsCDN(bIsAction);
                parent.setIsCDN(bIsAction);

                // CDN 허용일 경우 GitHub에 Ping을 수행.
                if (bIsAction == "X") {

                    oAPP.fn.fnConnectionGithub().then(oAPP.fn.fnConnectionGithubThen.bind(this));

                    return;

                }

                // CDN 허용이 아닐 경우 sap 서버에 최신 버전 체크 후 있다면 다운받기
                oAPP.fn.fnSetAutoUpdateForSAP().then(oAPP.fn.fnSetAutoUpdateForSAPThen.bind(this));

            } // end of lf_msgCallback

            return;

        }

        // CDN 플래그가 저장되어 있고, CDN 허용일 경우 GitHub에 Ping을 수행.
        if (bIsCDN == "X") {

            oAPP.fn.fnConnectionGithub().then(oAPP.fn.fnConnectionGithubThen.bind(this));

            return;

        }

        // sap 서버에 최신 버전 체크 후 있다면 다운받기
        oAPP.fn.fnSetAutoUpdateForSAP().then(oAPP.fn.fnSetAutoUpdateForSAPThen.bind(this));

    }; // end of oAPP.fn.fnCheckCustomerLisenceThen

    oAPP.fn.fnSetAutoUpdateForSAP = () => {

        return new Promise((resolve, reject) => {

            var oModel = sap.ui.getCore().getModel();

            //업데이트 확인
            autoUpdaterSAP.on('checking-for-update-sap', (e) => {
                console.log(e.params.message);
            });

            //업데이트 가능 
            autoUpdaterSAP.on('update-available-sap', (e) => {

                oModel.setProperty("/BUSYPOP/PROGVISI", true, true);

                // 로그인 페이지의 Opacity를 적용한다.
                $('.u4aWsLoginFormFcard').animate({
                    opacity: "0.3"
                }, 500, "linear");

                // Version Check Dialog를 띄운다.
                oAPP.fn.fnVersionCheckDialogOpen();

                parent.setBusy("");

                // console.log(e.params.message);
            });

            //현재 최신버전입니다
            autoUpdaterSAP.on('update-not-available-sap', (e) => {

                resolve();

            });

            //다운로드 ...
            autoUpdaterSAP.on('download-progress-sap', (e) => {

                var iToTal = e.params.TOTAL, // 전체 모수
                    iJobCnt = e.params.jobCnt, // 현재 전송된 데이터
                    iPerCnt = (iJobCnt / iToTal) * 100; // 백분율 구하기

                var iPer = parseFloat(iPerCnt).toFixed(2); // 소수점 2자리까지

                oModel.setProperty("/BUSYPOP/TITLE", "Downloading...", true);

                oModel.setProperty("/BUSYPOP/PERVALUE", iPer, true);

            });

            //다운로드 ...완료
            autoUpdaterSAP.on('update-downloaded-sap', (e) => {

                oModel.setProperty("/BUSYPOP/TITLE", "Update Complete! Restarting...", true);

                oModel.setProperty("/BUSYPOP/ILLUSTTYPE", "sapIllus-SuccessHighFive", true);

                console.log('업데이트가 완료되었습니다.');

                setTimeout(() => {

                    autoUpdaterSAP.quitAndInstall(); //<--- 자동 인스톨 

                }, 3000);

            });

            //오류
            autoUpdaterSAP.on('update-error-sap', (e) => {
                resolve();
            });

            let sVersion = REMOTE.app.getVersion();

            // 자동 업데이트 체크
            autoUpdaterSAP.checkForUpdates(sVersion);

        });

    }; // end of  oAPP.fn.fnSetAutoUpdateForSAP

    oAPP.fn.fnSetAutoUpdateForSAPThen = function () {

        var oResult = this.oResult,
            oAuthInfo = this.oAuthInfo;

        // 버전 체크 완료시
        oAPP.fn.fnCheckVersionFinished(oResult, oAuthInfo);

    }; // end of oAPP.fn.fnSetAutoUpdateForSAPThen

    /************************************************************************
     * Github 연결을 시도 하여 on-premise 인지 CDN인지 확인
     ************************************************************************/
    oAPP.fn.fnConnectionGithub = () => {

        return new Promise((resolve, reject) => {

            var oSettings = oAPP.fn.fnGetSettingsInfo(),
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
    oAPP.fn.fnConnectionGithubThen = function (oReturn) {

        // on-premise 일 경우 업데이트 URL을 서버쪽으로 바라본다.
        if (oReturn.ISCDN != "X") {

            // sap 서버에 최신 버전 체크 후 있다면 다운받기
            oAPP.fn.fnSetAutoUpdateForSAP().then(oAPP.fn.fnSetAutoUpdateForSAPThen.bind(this));

            return;

        }

        // 버전 체크 수행
        oAPP.fn.fnSetAutoUpdateForCDN().then(oAPP.fn.fnSetAutoUpdateForCDNThen.bind(this));

    }; // end of oAPP.fn.fnConnectionGithubThen

    // /************************************************************************
    //  * 개인화 파일에 저장된 CDN 허용 여부 플래그를 구한다.
    //  ************************************************************************/
    // oAPP.fn.fnGetIsCDN = () => {

    //     // 서버 접속 정보
    //     var oServerInfo = parent.getServerInfo(),
    //         sSysID = oServerInfo.SYSID;

    //     // P13N 파일 Path
    //     var sP13nPath = parent.getPath("P13N"),
    //         sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

    //         // 개인화 정보
    //         oP13nData = JSON.parse(sP13nJsonData);

    //     return oP13nData[sSysID].ISCDN;

    // }; // end of oAPP.fn.fnGetIsCDN

    // /************************************************************************
    //  * 개인화 파일에 저장된 CDN 허용 여부 플래그를 저장한다.
    //  ************************************************************************/
    // oAPP.fn.fnSetIsCDN = (bIsCDN) => {

    //     // 서버 접속 정보
    //     var oServerInfo = parent.getServerInfo(),
    //         sSysID = oServerInfo.SYSID;

    //     // P13N 파일 Path
    //     var sP13nPath = parent.getPath("P13N"),
    //         sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

    //         // 개인화 정보
    //         oP13nData = JSON.parse(sP13nJsonData);

    //     oP13nData[sSysID].ISCDN = bIsCDN;

    //     FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

    // }; // end of oAPP.fn.fnSetIsCDN

    /************************************************************************
     * WS Version을 확인한다.
     ************************************************************************/
    oAPP.fn.fnSetAutoUpdateForCDN = (sVersionCheckUrl) => {

        return new Promise((resolve, reject) => {

            var oModel = sap.ui.getCore().getModel();

            /* Updater Event 설정 ======================================================*/

            // 온프로미스 이면.
            if (typeof sVersionCheckUrl !== "undefined") {

                autoUpdater.setFeedURL(sVersionCheckUrl);

            }

            autoUpdater.on('checking-for-update', () => {

                console.log("업데이트 확인 중...");

            });

            autoUpdater.on('update-available', (info) => {

                oModel.setProperty("/BUSYPOP/PROGVISI", true, true);

                // 로그인 페이지의 Opacity를 적용한다.
                $('.u4aWsLoginFormFcard').animate({
                    opacity: "0.3"
                }, 500, "linear");

                // Version Check Dialog를 띄운다.
                oAPP.fn.fnVersionCheckDialogOpen();

                parent.setBusy("");

                console.log("업데이트가 가능합니다.");

            });

            autoUpdater.on('update-not-available', (info) => {

                resolve();

                console.log("현재 최신버전입니다.");

            });

            autoUpdater.on('error', (err) => {

                resolve();

                console.log('에러가 발생하였습니다. 에러내용 : ' + err);

            });

            autoUpdater.on('download-progress', (progressObj) => {

                var iPer = parseFloat(progressObj.percent).toFixed(2);

                oModel.setProperty("/BUSYPOP/TITLE", "Downloading...", true);

                oModel.setProperty("/BUSYPOP/PERVALUE", iPer, true);

            });

            autoUpdater.on('update-downloaded', (info) => {

                oModel.setProperty("/BUSYPOP/TITLE", "Update Complete! Restarting...", true);

                oModel.setProperty("/BUSYPOP/ILLUSTTYPE", "sapIllus-SuccessHighFive", true);

                console.log('업데이트가 완료되었습니다.');

                setTimeout(() => {

                    autoUpdater.quitAndInstall(); //<--- 자동 인스톨 

                }, 3000);

            });

            autoUpdater.checkForUpdates();

        });

    }; // oAPP.fn.fnSetAutoUpdateForCDN

    /************************************************************************
     * 버전 체크 성공시
     ************************************************************************/
    oAPP.fn.fnSetAutoUpdateForCDNThen = function () {

        var oResult = this.oResult,
            oAuthInfo = this.oAuthInfo;

        // 버전 체크 완료시
        oAPP.fn.fnCheckVersionFinished(oResult, oAuthInfo);

    }; // end of oAPP.fn.fnSetAutoUpdateForCDNThen

    /************************************************************************
     * 버전 체크 완료시
     ************************************************************************/
    oAPP.fn.fnCheckVersionFinished = (oResult, oAuthInfo) => {

        // 로그인 페이지의 Opacity를 적용한다.
        $('.u4aWsVersionCheckDialog,.u4aWsLoginFormFcard,.u4aWsGuestLoginCard').animate({
            opacity: "0"
        }, 500, "linear", () => {

            var oResultData = jQuery.extend(true, {}, oResult);

            oResultData.USER_AUTH = oAuthInfo;

            parent.showLoadingPage('X');

            parent.setBusy('');

            // 권한이 있으면 성공적으로 로그인 후 10번으로 이동
            oAPP.fn.fnOnLoginSuccess(oResultData);

        });

    }; // end of oAPP.fn.fnCheckVersionFinished    

    /************************************************************************
     * Version Check Dialog 를 실행한다.
     ************************************************************************/
    oAPP.fn.fnVersionCheckDialogOpen = () => {

        var sDialogId = "u4aWsVersionCheckDialog";

        var oDialog = sap.ui.getCore().byId(sDialogId);

        if (oDialog) {
            oDialog.open();
            return;
        }

        var oIllustMsg = new sap.m.IllustratedMessage({
            title: "{TITLE}",
            description: "　",
            illustrationSize: sap.m.IllustratedMessageSize.Dialog,
            illustrationType: "{ILLUSTTYPE}"

        }).addStyleClass(`${sDialogId}--illustMsg`);

        jQuery.sap.require("sap.m.ProgressIndicator");
        var oProgressbar = new sap.m.ProgressIndicator({
            visible: "{PROGVISI}",
            percentValue: "{PERVALUE}",
            displayOnly: true,
            state: "Success",
            displayValue: "Downloading... {PERVALUE}%"
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiMediumMarginBottom");

        new sap.m.Dialog(sDialogId, {

                // properties
                showHeader: false,
                horizontalScrolling: false,
                verticalScrolling: false,

                // aggregations
                content: [
                    oIllustMsg,

                    new sap.m.HBox({
                        renderType: "Bare",
                        items: [
                            oProgressbar
                        ]
                    }),

                ],

                // Events
                escapeHandler: () => {}, // esc 키 방지

            })
            .addStyleClass(sDialogId)
            .bindElement("/BUSYPOP")
            .open();

    }; // end of oAPP.fn.fnVersionCheckDialogOpen    

    /************************************************************************
     * 권한 없음 Illustration Message Popup Open
     ************************************************************************/
    oAPP.fn.fnShowNoAuthIllustMsg = (sMsg) => {

        let oAuthDialog = sap.ui.getCore().byId("authMsg");
        if (oAuthDialog) {
            return;
        }

        let oMsg = new sap.m.IllustratedMessage({
            title: "No Authority!",
            description: sMsg,
            illustrationSize: sap.m.IllustratedMessageSize.Dialog,
            illustrationType: "tnt-UnsuccessfulAuth",
            additionalContent: new sap.m.Button({
                text: "OK",
                press: oAPP.events.ev_attachIllustMsgOkBtn
            })
        });

        new sap.m.Dialog("authMsg", {
            showHeader: false,
            content: [
                oMsg
            ]
        }).open();

    }; // end of oAPP.fn.fnShowNoAuthIllustMsg

    /************************************************************************
     * 권한 없음 Illustration Message Popup Ok 버튼 press 이벤트
     ************************************************************************/
    oAPP.events.ev_attachIllustMsgOkBtn = () => {

        var oCurrWin = REMOTE.getCurrentWindow();
        oCurrWin.close();

    }; // end of oAPP.events.ev_attachIllustMsgOkBtn

    /************************************************************************
     * 로그인 성공시 
     ************************************************************************/
    oAPP.fn.fnOnLoginSuccess = (oResult) => {

        let oCoreModel = sap.ui.getCore().getModel();
        if (oCoreModel == null) {
            return;
        }

        let oLogInData = oCoreModel.getProperty("/LOGIN");
        if (oLogInData == null) {
            return;
        }

        // trial 버전이 아닐때만 수행
        var oWsSettings = oAPP.fn.fnGetSettingsInfo(),
            bIsTrial = oWsSettings.isTrial,
            oTrialServerInfo = oWsSettings.trialServerInfo;

        if (bIsTrial) {

            oResult.META.HOST = `http://${oTrialServerInfo.SERVERIP}:80${oTrialServerInfo.INSTANCENO}`;

        } else {

            // ID 저장 체크 박스값 저장
            oAPP.fn.fnSaveRememberCheck(oLogInData.REMEMBER);

            // 로그인 아이디 저장
            oAPP.fn.fnSaveIDSuggData(oLogInData.ID);
        }

        var oUserInfo = jQuery.extend({}, oResult, oLogInData);

        // 로그인 유저의 아이디/패스워드를 저장해둔다.    
        parent.setUserInfo(oUserInfo);

        // Metadata 정보 세팅 (서버 호스트명.. 또는 메시지 클래스 데이터 등..)
        if (oResult.META) {
            parent.setMetadata(oResult.META);
        }

        $('#content').css({
            "display": "none"
        });

        // 테마 설정
        oAPP.fn.fnP13nCreateTheme().then((oThemeInfo) => {

            // 테마 정보를 저장한다.
            parent.setThemeInfo(oThemeInfo);

            var oCurrWin = REMOTE.getCurrentWindow();
            oCurrWin.setBackgroundColor(oThemeInfo.BGCOL);

            parent.onMoveToPage("WS10");

            parent.showLoadingPage('');

        });

    }; // end of oAPP.fn.fnOnLoginSuccess

    /************************************************************************
     * 테마 정보 저장
     ************************************************************************/
    oAPP.fn.fnP13nCreateTheme = () => {

        return new Promise((resolve, reject) => {

            let oCoreModel = sap.ui.getCore().getModel(),
                oLogInData = oCoreModel.getProperty("/LOGIN"),
                sSysID = oLogInData.SYSID,
                sThemeJsonPath = PATH.join(USERDATA, "p13n", "theme", `${sSysID}.json`);

            // default Theme setting    
            let oWsSettings = oAPP.fn.fnGetSettingsInfo(),
                oDefThemeInfo = {
                    THEME: oWsSettings.defaultTheme,
                    BGCOL: oWsSettings.defaultBackgroundColor
                };

            // SYSTEM ID 테마 정보 JSON 파일 유무 확인
            if (!FS.existsSync(sThemeJsonPath)) {

                // 테마 정보가 없으면 신규 파일 생성 후 기본 테마 정보 전달
                FS.writeFile(sThemeJsonPath, JSON.stringify(oDefThemeInfo), {
                    encoding: "utf8",
                    mode: 0o777 // 올 권한
                }, function (err) {

                    if (err) {
                        reject(err.toString());
                        return;
                    }

                    resolve(oDefThemeInfo);

                });

                return;
            }

            // 테마 정보가 있을 경우 바로 읽어서 전달
            let oThemeInfo = parent.require(sThemeJsonPath);
            resolve(oThemeInfo);

        });

    }; // end of oAPP.fn.fnP13nCreateTheme

    /************************************************************************
     * 자연스러운 로딩
     ************************************************************************/
    oAPP.fn.fnOnSmoothLoading = () => {

        setTimeout(() => {
            $('#content').fadeIn(1000, 'linear');
        }, 100);

    }; // end of oAPP.fn.fnOnSmoothLoading 

    /************************************************************************
     *---------------------[ U4A WS Login Page Start ] ----------------------
     ************************************************************************/
    oAPP.fn.fnAttachInit = () => {

        sap.ui.getCore().attachInit(() => {

            // 개인화 폴더 체크 후 없으면 생성
            oAPP.fn.fnOnP13nFolderCreate();

            // Illustration Message TNT-svg register
            oAPP.fn.fnRegisterIllustrationPool();

            // IconPool Register Fiori icon
            oAPP.fn.fnRegisterFioriIconPool();

            // trial 버전 확인
            var oWsSettings = oAPP.fn.fnGetSettingsInfo();

            // trial 버전 로그인 페이지를 그린다.
            if (oWsSettings.isTrial) {

                oAPP.fn.fnOnTrialLoginPageRendering();

                // 자연스러운 로딩
                oAPP.fn.fnOnSmoothLoading();

                return;
            }

            // 초기값 바인딩
            oAPP.fn.fnOnInitModelBinding();

            // 로그인 페이지 초기 렌더링
            oAPP.fn.fnOnInitRendering();

            // 자연스러운 로딩
            oAPP.fn.fnOnSmoothLoading();

        });

    }; // end of oAPP.fn.fnAttachInit

    /************************************************************************
     * 로그인 정보 입력 체크
     ************************************************************************/
    oAPP.fn.fnLoginCheck = (ID, PW, CLIENT, LANGU) => {

        var oCheck = {
            RETCD: "S",
            MSG: ""
        };

        if (isEmpty(CLIENT) === true || isBlank(CLIENT) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Client is Required!";

            return oCheck;

        }

        if (isEmpty(ID) === true || isBlank(ID) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "ID is Required!";

            return oCheck;

        }

        if (isEmpty(PW) === true || isBlank(PW) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "PW is Required!";

            return oCheck;

        }

        if (isEmpty(LANGU) === true || isBlank(LANGU) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Language is Required!";

            return oCheck;

        }

        return oCheck;

    };


    oAPP.fn.fnGetRememberID = () => {

        var bIsRemember = oAPP.fn.fnGetRememberCheck();
        if (!bIsRemember) {
            return "";
        }

        var aIds = oAPP.fn.fnReadIDSuggData(),
            iIdLength = aIds.length;

        if (iIdLength <= 0) {
            return "";
        }

        return aIds[0].ID;

    };

    oAPP.fn.fnSaveRememberCheck = (bIsRemember) => {

        let sJsonPath = PATH.join(USERDATA, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo !== "object") {
            oLoginInfo = {};
        }

        oLoginInfo.bIsRemember = bIsRemember;

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

    };

    oAPP.fn.fnGetRememberCheck = () => {

        let sJsonPath = PATH.join(USERDATA, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo != "object" || oLoginInfo.bIsRemember == null) {
            return false;
        }

        return oLoginInfo.bIsRemember;

    }; // end of oAPP.fn.fnGetRememberCheck

    /************************************************************************
     * ID Suggestion Data Save
     ************************************************************************/
    oAPP.fn.fnSaveIDSuggData = (ID) => {

        const iIdSuggMaxCnt = 10;

        let sJsonPath = PATH.join(USERDATA, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo !== "object") {
            oLoginInfo = {};
        }

        if (oLoginInfo.aIds == null) {
            oLoginInfo.aIds = [];
            oLoginInfo.aIds.push({
                ID: ID
            });

            // login.json 파일에 ID Suggestion 정보 저장
            FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

            return;
        }

        let aIds = oLoginInfo.aIds;

        // 저장하려는 ID가 이미 있으면
        // 해당 ID를 Suggestion 최상단에 배치한다. 
        var iFindIndex = aIds.findIndex(a => a.ID == ID);

        // 저장하려는 ID가 이미 있고 Array에 가장 첫번째에 있으면 빠져나간다.    
        if (iFindIndex == 0) {
            return;
        }

        // 저장하려는 ID가 이미 있고 Array에 첫번째가 아니면 
        // 기존 저장된 위치의 ID 정보를 삭제
        if (iFindIndex > 0) {
            aIds.splice(iFindIndex, 1);
        }

        var iBeforeCnt = aIds.length,
            oNewData = {
                ID: ID
            },

            aNewArr = [];

        // 저장된 Suggestion 갯수가 MaxLength 이상이면
        // 마지막거 지우고 최신거를 1번째로 저장한다.
        if (iBeforeCnt >= iIdSuggMaxCnt) {

            for (var i = 0; i < iIdSuggMaxCnt - 1; i++) {
                aNewArr.push(aIds[i]);
            }

        } else {

            for (var i = 0; i < iBeforeCnt; i++) {
                aNewArr.push(aIds[i]);
            }

        }

        aNewArr.unshift(oNewData);

        oLoginInfo.aIds = aNewArr;

        // login.json 파일에 ID Suggestion 정보 저장
        FS.writeFileSync(sJsonPath, JSON.stringify(oLoginInfo));

    }; // end of oAPP.fn.fnSaveIDSuggData

    /************************************************************************
     * ID Suggestion Data Read
     ************************************************************************/
    oAPP.fn.fnReadIDSuggData = () => {

        let sJsonPath = PATH.join(USERDATA, "p13n", "login.json"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oLoginInfo = JSON.parse(sJsonData);

        if (typeof oLoginInfo != "object" || oLoginInfo.aIds == null) {
            return [];
        }

        return oLoginInfo.aIds;

    }; // end of oAPP.fn.fnReadIDSuggData

    /************************************************************************
     * 네트워크 연결 시 Network Indicator 해제
     * **********************************************************************/
    oAPP.fn.fnNetworkCheckerOnline = function () {

        // 네트워크 활성화 여부 flag
        oAPP.attr.bIsNwActive = true;

        var bIsNwActive = oAPP.attr.bIsNwActive;

        parent.setNetworkBusy(!bIsNwActive);

    }; // end of oAPP.fn.fnNetworkCheckerOnline

    /************************************************************************
     * 네트워크 연결 시 Network Indicator 실행
     * **********************************************************************/
    oAPP.fn.fnNetworkCheckerOffline = function () {

        // 네트워크 활성화 여부 flag
        oAPP.attr.bIsNwActive = false;

        var bIsNwActive = oAPP.attr.bIsNwActive;

        parent.setNetworkBusy(!bIsNwActive);

    }; // end of oAPP.fn.fnNetworkCheckerOffline    

    /************************************************************************
     * 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
     ************************************************************************/
    oAPP.fn.fnOnP13nFolderCreate = function () {

        var oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID;

        var sP13nfolderPath = PATH.join(USERDATA, "p13n"), // P13N 폴더 경로
            sP13nPath = parent.getPath("P13N"), // P13N.json 파일 경로
            bIsExists = FS.existsSync(sP13nPath); // P13N.json 파일 유무 확인.        

        // 파일이 있을 경우
        if (bIsExists) {

            // 파일이 있을 경우.. 파일 내용을 읽어본다.	
            var sSavedData = FS.readFileSync(sP13nPath, 'utf-8'),
                oSavedData = JSON.parse(sSavedData);

            if (oSavedData == "") {
                oSavedData = {};
            }

            // 파일 내용에 SYSTEM 아이디의 정보가 있으면 리턴.
            if (oSavedData[sSysID]) {
                return;
            }

            // 없으면 개인화 영역 Object 생성 후 Json 파일에 저장
            oSavedData[sSysID] = {};

            FS.writeFileSync(sP13nPath, JSON.stringify(oSavedData));

            return;
        }

        // 로그인 사용자의 개인화 정보가 없을 경우 
        var oP13N_data = {};
        oP13N_data[sSysID] = {};

        // P13N 폴더가 없으면 폴더부터 생성 		
        if (!FS.existsSync(sP13nfolderPath)) {
            FS.mkdirSync(sP13nfolderPath);
        }

        // p13n.json 파일에 브라우저 정보 저장
        FS.writeFileSync(sP13nPath, JSON.stringify(oP13N_data));

    }; // end of oAPP.fn.fnOnP13nFolderCreate

    return oAPP;

})();


function fnSetBusy(bIsShow) {

    var oLoadPg = document.getElementById("u4a_main_load");

    if (!oLoadPg) {
        return;
    }

    if (bIsShow == 'X') {
        oLoadPg.classList.remove("u4a_loadersInactive");
    } else {
        oLoadPg.classList.add("u4a_loadersInactive");
    }

}

fnSetBusy('X');

oAPP.fn.fnLoadBootStrapSetting();

window.addEventListener("load", () => {

    // Default Browser check
    oAPP.fn.fnCheckIstalledBrowser().then(() => {

        oAPP.fn.fnAttachInit();

    });

});

window.addEventListener("beforeunload", () => {

    window.removeEventListener("online", oAPP.fn.fnNetworkCheckerOnline);
    window.removeEventListener("offline", oAPP.fn.fnNetworkCheckerOffline);

});

/************************************************************************
 * 네트워크 연결 및 해제 시 발생되는 이벤트
 * **********************************************************************/
window.addEventListener("online", oAPP.fn.fnNetworkCheckerOnline, false);
window.addEventListener("offline", oAPP.fn.fnNetworkCheckerOffline, false);

document.addEventListener('DOMContentLoaded', function () {

    // 브라우저 zoom 레벨을 수정 한 후 로그인 페이지로 이동 시 기본 zoom 레벨 적용
    parent.WEBFRAME.setZoomLevel(0);

    console.log("DOMContentLoaded_1");

});

function isBlank(s) {
    return isEmpty(s.trim());
}

function isEmpty(s) {
    return !s.length;
}