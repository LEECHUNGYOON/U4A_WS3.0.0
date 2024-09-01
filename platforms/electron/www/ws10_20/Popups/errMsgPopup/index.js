/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : errMsgPopup/index.js
 ************************************************************************/
/************************************************************************
 * 에러 감지
 ************************************************************************/
const zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP,
    APPCOMMON = oAPP.common;

(function (window, oAPP) {
    "use strict";

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        APPPATH = APP.getAppPath(),
        PATHINFO = parent.PATHINFO,
        require = parent.require;


    /************************************************************************
     * Multi Footer Message 더블클릭
     ************************************************************************/
    function _multiFooterMsgDblclick (oEvent){

        var oTarget = oEvent.target,
            $SelectedRow = $(oTarget).closest(".sapMListTblRow");

        if (!$SelectedRow.length) {
            return;
        }

        var oRow = $SelectedRow[0],
            oSelectedRow = sap.ui.getCore().byId(oRow.id);

        if (!oSelectedRow) {
            return;
        }

        var oCtx = oSelectedRow.getBindingContext(),
            oRowData = oSelectedRow.getModel().getProperty(oCtx.sPath);

        let oCurrWin = oAPP.REMOTE.getCurrentWindow();
        if (oCurrWin.isDestroyed()) {
            return;
        }

        let oWebCon = oCurrWin.webContents,
            oWebPref = oWebCon.getWebPreferences(),
            sBrowserKey = oWebPref.browserkey,
            IPCRENDERER = oAPP.IPCRENDERER;

        IPCRENDERER.send(`${sBrowserKey}--errormsg--click`, {
            oRowData: oRowData
        });

    } // end of _multiFooterMsgDblclick


    /************************************************************************
     * 모델 데이터 set
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     * @param {Object} oModelData
     * 
     * @param {Boolean} bIsRefresh 
     * model Refresh 유무
     ************************************************************************/
    oAPP.fn.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

        var oCoreModel = sap.ui.getCore().getModel();
        oCoreModel.setProperty(sModelPath, oModelData);

        if (bIsRefresh) {
            oCoreModel.refresh(true);
        }

    }; // end of APPCOMMON.fnSetModelProperty

    /************************************************************************
     * 모델 데이터 get
     * **********************************************************************
     * @param {String} sModelPath  
     * - Model Path 명
     * 예) /WS10/APPDATA
     ************************************************************************/
    oAPP.fn.fnGetModelProperty = function (sModelPath) {

        return sap.ui.getCore().getModel().getProperty(sModelPath);

    }; // end of oAPP.fn.fnGetModelProperty

    /************************************************************************
     * ws의 설정 정보를 구한다.
     ************************************************************************/
    oAPP.fn.getSettingsInfo = function () {

        // Browser Window option
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

    }; // end of oAPP.fn.getSettingsInfo

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
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
        oScript.setAttribute("src", oSetting_UI5.resourceUrl);

        document.head.appendChild(oScript);

    }; // end of fnLoadBootStrapSetting


    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oAPP.fn.fnInitModelBinding = function () {

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            FMTMSG: oAPP.attr.aMsg
        });

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oToolbar = new sap.m.Toolbar({
            content: [
                // new sap.m.Text({
                //     text: "Error Footer Message"
                // }),
                new sap.m.ObjectStatus({
                    // inverted: true,
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D25"), // Error Message
                    state: sap.ui.core.ValueState.Error,
                    icon: "sap-icon://alert"
                }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    icon: "sap-icon://decline",
                    press: function () {

                        var oCurrWin = oAPP.REMOTE.getCurrentWindow();
                        oCurrWin.close();
                    }
                    // press: oAPP.events.fnPressMultiFooterMsgCloseBtn
                })
            ]
        })
            // .addStyleClass("u4aWsMsgFooter_HeaderToolbar"),
            .addStyleClass("u4aWsMsgFooter_HeaderToolbar u4aWsWindowHeaderDraggable"),

            oTable = new sap.m.Table("footerMsgTable", {
                sticky: [sap.m.Sticky.ColumnHeaders, sap.m.Sticky.HeaderToolbar],
                fixedLayout: true,
                headerToolbar: oToolbar,
                columns: [
                    new sap.m.Column({
                        width: "100px",
                        hAlign: sap.ui.core.TextAlign.Center,
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D26"), // Error Type
                        })
                    }),
                    new sap.m.Column({
                        width: "80px",
                        hAlign: sap.ui.core.TextAlign.Center,
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D27"), // Line
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({
                            design: sap.m.LabelDesign.Bold,
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35"), // Description
                        })
                    }),
                ],
                items: {
                    path: "/FMTMSG",
                    template: new sap.m.ColumnListItem({
                        type: sap.m.ListType.Active,
                        // press: oAPP.events.ev_pressFooterMsgColListItem,
                        cells: [
                            new sap.m.Text({
                                text: '{TYPE}'
                            }),
                            new sap.m.Text({
                                text: '{LINE}'
                            }),
                            new sap.m.Text({
                                text: '{DESC}'
                            }),
                        ]
                    })
                }

            }).addStyleClass("sapUiSizeCompact");

        // Multi Footer Message 더블클릭
        oTable.attachBrowserEvent("dblclick", _multiFooterMsgDblclick);

        var oPage = new sap.m.Page({
            showHeader: false,
            content: [
                oTable
            ]
        }).addStyleClass("u4aWsErrMsgPopupPage");

        let oApp = new sap.m.App({
            autoFocus: false,
            busyIndicatorDelay: 0,
            pages: [
                oPage
            ]
        });

        oAPP.ui.APP = oApp;
        
        oApp.placeAt("content");

        let oDelegate = {
            onAfterRendering : function(){
        
                oApp.removeEventDelegate(oDelegate);

                oAPP.fn.setBusy(false);
        
                // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 
        
            }
        };
        
        oApp.addEventDelegate(oDelegate);

    }; // end of oAPP.fn.fnInitRendering     
    
    /*******************************************************
     * @function - Busy indicator 실행
     *******************************************************/
    oAPP.fn.setBusy = function(bIsBusy, sOption){

        // 현재 Busy 실행 여부 플래그
        oAPP.attr.isBusy = bIsBusy;

        // 브로드 캐스트 객체
        var _ISBROAD = sOption?.ISBROAD || undefined;

        if(bIsBusy === true){
            
            sap.ui.getCore().lock();

            // 브라우저 닫기 버튼 비활성
            oAPP.CURRWIN.closable = false;

            oAPP.ui.APP.setBusy(true);

            //다른 팝업의 BUSY ON 요청 처리.
            //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});
            }      

        } else {

            sap.ui.getCore().unlock();

            // 브라우저 닫기 버튼 활성
            oAPP.CURRWIN.closable = true;
            
            oAPP.ui.APP.setBusy(false);

            //다른 팝업의 BUSY OFF 요청 처리.
            //(다른 팝업에서 이벤트가 발생될 경우 WS20 화면의 BUSY를 먼저 종료 시키는 문제를 방지하기 위함)
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});
            }

        }

    }; // end of oAPP.fn.setBusy

    /************************************************************************
     * 공통 css을 적용한다.
     ************************************************************************/
    oAPP.fn.fnLoadCommonCss = () => {

        var sCommonCssUrl = PATH.join(APPPATH, "css", "common.css");

        sCommonCssUrl = sCommonCssUrl.replaceAll("\\", "/");
        sCommonCssUrl = `file:///${sCommonCssUrl}`;
        sCommonCssUrl = encodeURI(sCommonCssUrl);

        var oCss = document.createElement("link");
        oCss.setAttribute("rel", "stylesheet");
        oCss.setAttribute("href", sCommonCssUrl);

        document.head.appendChild(oCss);

    }; // end of oAPP.fn.fnLoadCommonCss

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    // 공통 CSS를 적용한다.
    oAPP.fn.fnLoadCommonCss();

    window.onload = function () {

        oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oAPP.BROWSKEY}`);        

        oAPP.broadToChild.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;

            if(typeof _PRCCD === "undefined"){
                return;
            }

            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":

                    //BUSY ON을 요청받은경우.
                    // oAPP.setBusyIndicator(true, {ISBROAD:true});
                    oAPP.fn.setBusy(true, {ISBROAD:true});
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    oAPP.fn.setBusy(false, {ISBROAD:true});
                    break;

                default:
                    break;
            }

        };

        sap.ui.getCore().attachInit(function () {

            oAPP.fn.fnInitModelBinding();

            oAPP.fn.fnInitRendering();

            // Busy 킨다.
            oAPP.fn.setBusy(true);

            oAPP.setBusyLoading('');

            // 자연스러운 로딩
            setTimeout(() => {

                $('#content').fadeIn(300, 'linear');

            }, 100);

        });

    };

})(window, oAPP);