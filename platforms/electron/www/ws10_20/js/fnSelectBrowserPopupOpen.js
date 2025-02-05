/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : fnSelectBrowserPopupOpen.js
 * - file Desc : 기본 브라우저 설정 팝업
 ************************************************************************/

(function(window, $, oAPP) {
    "use strict";

    const
        APPCOMMON = oAPP.common;

    oAPP.fn.fnSelectBrowserPopupOpen = function() {

        var FS = parent.FS,

            oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID,

            // 로그인 유저 정보
            oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase(),

            sP13nPath = parent.getPath("P13N"),

            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        APPCOMMON.fnSetModelProperty("/DEFBR", oP13nData[sSysID].DEFBR);

        var oDialog = sap.ui.getCore().byId("selBrwsDlg");

        // Dialog가 이미 만들어졌을 경우
        if (oDialog) {

            // 이미 오픈 되있다면 return.
            if (oDialog.isOpen()) {
                return;
            }

            oDialog.open();
            return;

        }

        // 실행 브라우저 선택 팝업
        var oDialog = new sap.m.Dialog("selBrwsDlg", {

            // Properties
            draggable: true,
            resizable: true,    
            customHeader: new sap.m.Toolbar({
                content: [
            
                    new sap.ui.core.Icon({
                        src: "sap-icon://internet-browser"
                    }),

                    new sap.m.Title({
                        text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C99"), // Select Default Browser
                    }).addStyleClass("sapUiTinyMarginBegin"),

                    new sap.m.ToolbarSpacer(),

                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function() {

                            var oDialog = sap.ui.getCore().byId("selBrwsDlg");
                            if (oDialog == null) {
                                return;
                            }

                            if (oDialog.isOpen()) {
                                oDialog.close();
                            }

                        }
                    })
                ]
            }),
            buttons: [
                new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    icon: "sap-icon://accept",
                    press: oAPP.events.ev_selectBrowserSave
                }),
                new sap.m.Button({
                    type: sap.m.ButtonType.Reject,
                    icon: "sap-icon://decline",
                    press: oAPP.events.ev_selectBrowserClose
                }),
            ],
            // content: [
            //     oVbox
            // ]

        }).addStyleClass("sapUiContentPadding");

        let oPanelTemplate = new sap.m.Panel({
            backgroundDesign: "Transparent"
        });

        let oToolbarTemplate = new sap.m.Toolbar();
        oPanelTemplate.setHeaderToolbar(oToolbarTemplate);

        oToolbarTemplate.addStyleClass("u4awsSelBrowsPanHdr");

        oToolbarTemplate.addEventDelegate({
            onclick: function(oEvent){

                let oUi = oEvent.srcControl;
                if(!oUi){
                    return;
                }
                
                let oBindCtx = oUi.getBindingContext();
                if(!oBindCtx){
                    return;
                }

                let oBindData = oBindCtx.getObject();
                if(!oBindData){
                    return;
                }

                oBindData.SELECTED = true;

                oBindCtx.getModel().setProperty(oBindCtx.getPath(), oBindData);

            }
        });

        // 기본 브라우저 선택 라디오 버튼
        let oRdoBtn1 = new sap.m.RadioButton({
            // text: "{DESC}",
            selected: "{SELECTED}",
            groupName: "defaultBrowserRbg",
            valueState: "Information",
            select: function(oEvent){

                let oUi = oEvent.getSource();
                if(!oUi){
                    return;
                }

                let oBindCtx = oUi.getBindingContext();
                if(!oBindCtx){
                    return;
                }

                let oModel = oBindCtx.getModel();
                if(!oModel){
                    return;
                }

                let aDEFBR = oModel.getProperty("/DEFBR");
                if(!aDEFBR || Array.isArray(aDEFBR) === false){
                    return;
                }

                for(var oDEF of aDEFBR){
                    oDEF.APP_MODE = false;
                }

                oModel.setProperty("/DEFBR", aDEFBR);

            }
        });
        oToolbarTemplate.addContent(oRdoBtn1);

        // 브라우저 설치 유무에 따른 UI 활성 비활성 처리
        oRdoBtn1.bindProperty("enabled", "ENABLED", function(values) {

            if (!values) {
                this.setSelected(values);
            }

            return values;

        });

        let oIcon1 = new sap.ui.core.Icon();
        oToolbarTemplate.addContent(oIcon1);

        oIcon1.bindProperty("src", "NAME", function(values){

            if(!values){
                return;
            }

            switch (values) {

                case "CHROME":
                    return "sap-icon://u4a-fw-brands/Chrome";

                case "MSEDGE":                    
                    return "sap-icon://u4a-fw-brands/Edge Legacy Browser";
            
                default:
                    return;
            }

        });

        let oTitle1 = new sap.m.Title({
            text: "{DESC}",
            titleStyle: "H6"

        });
        oToolbarTemplate.addContent(oTitle1);


        // 앱모드 사용 유무 체크박스
        let oCheckBox1 = new sap.m.CheckBox({
            text: parent.WSUTIL.getWsMsgClsTxt(oUserInfo.LANGU, "ZMSG_WS_COMMON_001", "281"), // 앱모드 활성            
            selected: "{APP_MODE}"
        });        

        oPanelTemplate.addContent(oCheckBox1);
        
        oCheckBox1.bindProperty("enabled", {
            parts: [
                "ENABLED",      // 브라우저 설치 여부
                "SELECTED"      // 사용 선택 여부
            ],
            formatter: function(ENABLED, SELECTED){

                if (!ENABLED) {
                    return this.setSelected(values);
                }

                if(SELECTED === false){
                    return false;
                }

                return true; 

            }
        });

          // 브라우저 설치 유무에 따른 UI 활성 비활성 처리
        // oCheckBox1.bindProperty("enabled", "ENABLED", function(values) {

        //     if (!values) {
        //         this.setSelected(values);
        //     }

        //     return values;

        // });

        let oVBox1 = new sap.m.VBox({
            renderType: "Bare",
            items: {
                path: "/DEFBR",
                template: oPanelTemplate
            }
        });

        oDialog.addContent(oVBox1);

        oDialog.open();

    }; // end of oAPP.fn.fnSelectBrowserPopupOpen

    /************************************************************************
     * 기본 브라우저 저장 이벤트
     ************************************************************************/
    oAPP.events.ev_selectBrowserSave = function(oEvent) {

        // 개인화 폴더 생성 및 로그인 사용자별 개인화 Object 만들기
        oAPP.fn.fnOnP13nFolderCreate();

        var FS = parent.FS,

            oServerInfo = parent.getServerInfo(),
            sSysID = oServerInfo.SYSID,

            // 로그인 유저 정보
            oUserInfo = parent.getUserInfo(),
            sUserId = oUserInfo.ID.toUpperCase(),
            sP13nPath = parent.getPath("P13N"),
            sP13nJsonData = FS.readFileSync(sP13nPath, 'utf-8'),

            // 개인화 정보
            oP13nData = JSON.parse(sP13nJsonData);

        oP13nData[sSysID].DEFBR = APPCOMMON.fnGetModelProperty("/DEFBR");

        FS.writeFileSync(sP13nPath, JSON.stringify(oP13nData));

        oEvent.getSource().getParent().close();

    }; // end of oAPP.events.ev_selectBrowserSave

    /************************************************************************
     * 기본 브라우저 선택 팝업 닫기
     ************************************************************************/
    oAPP.events.ev_selectBrowserClose = function(oEvent) {

        oEvent.getSource().getParent().close();

    }; // end of oAPP.events.ev_selectBrowserClose

})(window, $, oAPP);