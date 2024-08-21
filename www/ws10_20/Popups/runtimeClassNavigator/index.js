/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : runtimeClassNavigator/index.js
 ************************************************************************/
/************************************************************************
 * 에러 감지
 ************************************************************************/
var zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    // oAPP.settings = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        APPCOMMON = oAPP.common,
        PATHINFO = parent.PATHINFO,
        require = parent.require;

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

    }; // end of oAPP.common.fnSetModelProperty

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

    // oAPP.fn.fnGetThemeInfo = function(){

    //     PATHINFO.THEME


    // };

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

        var oModelData = {
            SRCH: "",
            RUNTIMEDATA: oAPP.attr.aRuntime
        };

        var oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData(oModelData);

        sap.ui.getCore().setModel(oJsonModel);

    }; // end of oAPP.fn.fnInitModelBinding

    /************************************************************************
     * 화면 초기 렌더링
     ************************************************************************/
    oAPP.fn.fnInitRendering = function () {

        var oApp = new sap.m.App({
            busyIndicatorDelay: 0,
        });

        oAPP.ui.APP = oApp;

        var oPage = new sap.m.Page({
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A14"), // Runtime Class Navigator
            icon: "sap-icon://browse-folder",
            titleAlignment: sap.m.TitleAlignment.Center
        });

        var oPanel = oAPP.fn.fnGetSearchPanel(), // 상단 조회조건 영역(Panel)
            oTable = oAPP.fn.fnGetResultTable(); // 하단 결과리스트 (m.Table)

        oPage.addContent(oPanel);
        oPage.addContent(oTable);

        oPage.bindElement("/");
        oApp.addPage(oPage);
        oApp.placeAt("content");

        oAPP.fn.setBusy(true);

        let oDelegate = {
            onAfterRendering : function(){

                oApp.removeEventDelegate(oDelegate);

                oAPP.CURRWIN.show();

                oAPP.WSUTIL.setBrowserOpacity(oAPP.CURRWIN); 

                oAPP.fn.setBusy(false);

                // oAPP.setBusyIndicator("");

                // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                parent.oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

            }
        };

        oApp.addEventDelegate(oDelegate);

    }; // end of oAPP.fn.fnRenderingRuntimeClassNavigator

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
     * 상단 조회조건 영역(Panel)
     ************************************************************************/
    oAPP.fn.fnGetSearchPanel = function () {

        return new sap.m.Panel({
            content: [

                new sap.m.HBox({
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [

                        new sap.m.Input("runtimeSrchInput", {
                            value: "{SRCH}",
                            submit: oAPP.events.ev_runTimeClassSearchBtn,
                            liveChange: oAPP.events.ev_runTimeClassLiveSearch
                        }),
                        new sap.m.Button({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A75"), // Search
                            icon: "sap-icon://search",
                            press: oAPP.events.ev_runTimeClassSearchBtn,
                        }).addStyleClass("sapUiSmallMarginBegin")

                    ]
                }),

                new sap.m.HBox({
                    renderType: sap.m.FlexRendertype.Bare,
                    height: "100px",
                    alignItems: sap.m.FlexAlignItems.Center,
                    justifyContent: sap.m.FlexAlignItems.Center,
                    dragDropConfig: [
                        new sap.ui.core.dnd.DropInfo({
                            drop: oAPP.events.fnRuntimeDropEvent
                        }),
                    ],
                    items: [
                        new sap.m.Text({
                            text: APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "314"), // Drag the UI from the UX Design Area.
                        })
                    ]
                }).addEventDelegate({
                    ondragover: () => {

                        //focus된 dom focus 해제 처리.
                        if (document.activeElement && document.activeElement.blur) {
                            document.activeElement.blur();
                        }

                        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
                        if (l_dom === null || l_dom.length === 0) {
                            return;
                        }

                        let oDom = l_dom[0];

                        oDom.classList.remove("u4aWsDisplayNone");

                    },
                    ondragleave: () => {

                        //focus된 dom focus 해제 처리.
                        if (document.activeElement && document.activeElement.blur) {
                            document.activeElement.blur();
                        }

                        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
                        if (l_dom === null || l_dom.length === 0) {
                            return;
                        }

                        let oDom = l_dom[0];

                        oDom.classList.remove("u4aWsDisplayNone");
                        oDom.classList.add("u4aWsDisplayNone");

                    }
                }).addStyleClass("sapUiSmallMarginTop u4aWsRuntimeDropArea")

            ]
        });

    }; // end of oAPP.fn.fnGetSearchPanel

    /************************************************************************
     * 하단 조회조건 영역(m.Table)
     ************************************************************************/
    oAPP.fn.fnGetResultTable = function () {

        var StickyEnum = sap.m.Sticky;

        var oTable = new sap.m.Table("runtimeClassTable", {

            // properties
            mode: sap.m.ListMode.SingleSelectMaster,
            alternateRowColors: true,
            autoPopinMode: true,
            growing: true,
            growingScrollToLoad: true,
            sticky: [
                StickyEnum.ColumnHeaders,
                // StickyEnum.HeaderToolbar,
                // StickyEnum.InfoToolbar
            ],
            backgroundDesign: sap.m.BackgroundDesign.Transparent,

            // aggregations
            headerToolbar: new sap.m.Toolbar({
                content: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://message-information"
                    }),
                    new sap.m.Text({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "315"), // Double-click in the search list to copy to clipboard.//"조회 리스트에서 더블클릭 해야 클립보드 복사됩니다."
                    }).addStyleClass("sapUiTinyMarginBegin")
                ]
            }),
            columns: [
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84"), // UI Object ID
                        design: sap.m.LabelDesign.Bold
                    })
                }),
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Tablet",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A85"), // UI Object Module
                        design: sap.m.LabelDesign.Bold
                    })
                }),
                new sap.m.Column({
                    demandPopin: true,
                    minScreenWidth: "Desktop",
                    header: new sap.m.Label({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B00"), // Object Runtime Class
                        design: sap.m.LabelDesign.Bold
                    })
                })
            ],
            items: {
                path: '/RUNTIMEDATA',
                template: new sap.m.ColumnListItem({
                    type: sap.m.ListType.Active,
                    cells: [
                        new sap.m.Text({
                            text: "{UIOBJ}"
                        }),
                        new sap.m.Text({
                            text: "{LIBNM}"
                        }),
                        new sap.m.Text({
                            text: "{CLASS}"
                        })
                    ]
                })
            }
        });

        // sap.m.Table의 Row 더블클릭 이벤트
        oTable.attachBrowserEvent("dblclick", oAPP.events.ev_runtimeClassListDblclickEvent);

        return oTable;

    }; // end of oAPP.fn.fnGetResultTable

    /************************************************************************
     * runtime Class 검색
     ************************************************************************/
    oAPP.fn.fnRuntimeSearch = function (bIsDrop) {

        var FilterOperator = sap.ui.model.FilterOperator;

        // runtime 검색 input 
        var oSrchInput = sap.ui.getCore().byId("runtimeSrchInput");
        if (!oSrchInput) {
            return;
        }

        // runtime 검색결과 table
        var oRuntimeTable = sap.ui.getCore().byId("runtimeClassTable");
        if (!oRuntimeTable) {
            return;
        }


        // runtime 검색결과 item
        var oBindItems = oRuntimeTable.getBinding("items");
        if (!oBindItems) {
            return;
        }

        // runtime 검색할 text
        var sSrchValue = oSrchInput.getValue(),
            aFilters = [
                new sap.ui.model.Filter("UIOBJ", FilterOperator.Contains, sSrchValue),
                new sap.ui.model.Filter("LIBNM", FilterOperator.Contains, sSrchValue),
                new sap.ui.model.Filter("CLASS", FilterOperator.Contains, sSrchValue)
            ];

        // drop 이벤트를 통해 실행된 경우
        if (bIsDrop) {
            aFilters = [new sap.ui.model.Filter("LIBNM", FilterOperator.EQ, sSrchValue)];
        }

        oBindItems.filter([new sap.ui.model.Filter(aFilters, false)]);

    }; // end of oAPP.fn.fnRuntimeSearch

    /************************************************************************
     * 선택한 Row의 정보를 클립보드 복사
     ************************************************************************/
    oAPP.fn.fnSetClipBoardCopyRowData = function (oRowData) {

        var sClsNm = oRowData.CLASS, // 런타임 클래스명
            sObjNm = oRowData.UIOBJ.toUpperCase(), // UI 명(대문자)
            sInstNm = "LO_" + sObjNm, // ABAP 클래스의 인스턴스 명
            sCopyText = "DATA " + sInstNm + " TYPE REF TO " + sClsNm + ". \n"; // ABAP 클래스 선언문

        var oMetadata = oAPP.attr.oMetadata;

        // 신규 NAMESPACE 대상인 경우.
        if (oMetadata && oMetadata.IS_NAME_SPACE == "X") {
            sCopyText += sInstNm + " ?= ME->/U4A/IF_SERVER~AR_VIEW->GET_UI_INSTANCE( I_ID = '' ).";
        } else {
            sCopyText += sInstNm + " ?= ME->ZIF_U4A_SERVER~AR_VIEW->GET_UI_INSTANCE( I_ID = '' ).";
        }

        var oTextArea = document.createElement("textarea");
        oTextArea.value = sCopyText;

        document.body.appendChild(oTextArea);

        oTextArea.select();

        document.execCommand('copy');

        document.body.removeChild(oTextArea);

        // Clipboard transfer complete. Perform [CTRL + V] on the target area. 
        let sMsg = APPCOMMON.fnGetMsgClsText("/U4A/MSG_WS", "316");

        sap.m.MessageToast.show(sMsg);

    }; // end of oAPP.fn.fnSetClipBoardCopyRowData

    /************************************************************************
     * IPC event : DragEnd 했을 경우 타는 이벤트
     ************************************************************************/
    oAPP.fn.fnIpc_if_dialog_DragEnd = () => {

        //focus된 dom focus 해제 처리.
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }

        var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
        if (l_dom === null || l_dom.length === 0) {
            return;
        }

        l_dom[0].setAttribute("style", "");
        l_dom[0].style.display = "none";

    };

    /************************************************************************
     * - Event Section
     ************************************************************************/

    /************************************************************************
     * Runtime Class 검색 버튼 이벤트
     ************************************************************************/
    oAPP.events.ev_runTimeClassSearchBtn = function (oEvent) {

        var bIsDrop = oEvent.getParameter('ISDROP'); // Drop 여부

        oAPP.fn.fnRuntimeSearch(bIsDrop);

    }; // end of oAPP.event.ev_runTimeClassSearch

    /************************************************************************
     * Runtime Class 실시간 검색 이벤트
     ************************************************************************/
    oAPP.events.ev_runTimeClassLiveSearch = function () {

        oAPP.fn.fnRuntimeSearch();

    }; // end of oAPP.event.ev_runTimeClassLiveSearch

    /************************************************************************
     * UX Design 영역에서 UI를 Drag 하여 Runtime Class 검색
     ************************************************************************/
    oAPP.events.fnRuntimeDropEvent = function (oEvent) {

        var oBrowserEvent = oEvent.getParameter("browserEvent"),
            sDragData = oBrowserEvent.dataTransfer.getData("rtmcls");

        if (!sDragData) {
            return;
        }

        var oSrchInput = sap.ui.getCore().byId("runtimeSrchInput");
        if (!oSrchInput) {
            return;
        }

        oSrchInput.setValue(sDragData);
        oSrchInput.fireSubmit({
            ISDROP: true
        });

    }; // end of oAPP.event.fnRuntimeDropEvent

    /************************************************************************
     * 조회된 Runtime Class List의 Row 더블클릭 이벤트
     ************************************************************************/
    oAPP.events.ev_runtimeClassListDblclickEvent = function (oEvent) {

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

        // 선택한 Row의 정보를 클립보드 복사            
        oAPP.fn.fnSetClipBoardCopyRowData(oRowData);

    }; // end of oAPP.event.ev_runtimeClassListDblclickEvent

    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

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

            // 화면 초기 실행 시 한번만 수행 되는 메인 Busy를 끈다.
            oAPP.setBusyLoading('');

            setTimeout(() => {

                $('#content').fadeIn(1000, 'linear');

            }, 100);

            oAPP.IPCMAIN.on("if-Dialog-dragEnd", oAPP.fn.fnIpc_if_dialog_DragEnd);

        });

        

    };

    /************************************************************************
     * window 창 닫을때 호출 되는 이벤트
     ************************************************************************/
    window.onbeforeunload = () => {

        // Busy가 실행 중이면 창을 닫지 않는다.
        if(oAPP.fn.getBusy() === true){
            return false;
        }

        oAPP.IPCMAIN.off("if-Dialog-dragEnd", oAPP.fn.fnIpc_if_dialog_DragEnd);

    };

})(window, oAPP);