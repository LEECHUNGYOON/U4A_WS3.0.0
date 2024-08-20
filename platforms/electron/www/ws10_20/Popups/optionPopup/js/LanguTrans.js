(function(oNavCon, oNavConList) {
    "use strict";

    const
        REMOTE = oAPP.remote,
        BINDROOT = "/OPTS/TRANS",
        APPCOMMON = oAPP.common;

    jQuery.sap.require("sap.m.MessageBox");

    /************************************************************************
     * 화면 Loading Mode 설정 
     ************************************************************************/
    function setBusy(a) {

        // oNavCon.setBusy(a);
        // oNavConList.setBusy(a);

        oAPP.fn.setBusy(a);

    }; // end of oAPP.fn.fnSetBusy  

    /************************************************************************
     * onStart!!
     ************************************************************************/
    function onStart() {

        // 초기 화면 그리기
        onInitRendering();

        // 초기 모델 바인딩
        onInitModelBing();


        setBusy(false);

    } // end of onStart

    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    function onInitModelBing() {

        let oPage = oAPP.ui.oLanguTransPage;
        if (!oPage) {
            return;
        }

        let oUserInfo = oAPP.IF_DATA.oUserInfo,
        sLangu = oUserInfo.LANGU;

        let sBindRoot = BINDROOT,
            oModelData = {
                // TITLE: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D19"), // CDN Setting,
                // DESC: sDesc,
                // MORE: sMoreTxt,
                // ISCDN: oAPP.IF_DATA.ISCDN,
                // ISPING: oReturn.ISCDN
                aLangu: [
                    { KEY: "EN", TEXT: "EN" },
                    { KEY: "KO", TEXT: "KO" },
                ],
                selectedKey : sLangu
            };

        let oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            OPTS: {
                TRANS: oModelData
            }
        });

        oPage.setModel(oJsonModel);

    } // end of onInitModelBing

    /************************************************************************
     * 초기 화면 그리기
     ************************************************************************/
    function onInitRendering() {

        let aPageContent = _getPageContents(),
            oFooter = _getPageFooter();

        let oPage = new sap.m.Page({
            showHeader: true,
            title: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E17"), // Language Translate
            content: aPageContent,
            footer: oFooter

        }).addStyleClass("sapUiContentPadding");

        oNavCon.addPage(oPage);

        if (oAPP.ui.oLanguTransPage) {
            delete oAPP.ui.oLanguTransPage;
        }

        oAPP.ui.oLanguTransPage = oPage;

    } // end of onInitRendering

    /************************************************************************
     * 적용버튼 이벤트
     ************************************************************************/
    function ev_pressApplyBtn(oEvent) {

        debugger;





    } // end of ev_pressApplyBtn


    /************************************************************************
     * 페이지 컨텐츠
     ************************************************************************/
    function _getPageContents() {

        return [

            new sap.m.Select({
                showSecondaryValues: true,
                selectedKey: `${BINDROOT}/selectedKey`,
                items: {
                    path: `${BINDROOT}/aLangu`,
                    template: new sap.ui.core.ListItem({
                        key: "{KEY}",
                        text: "{TEXT}",
                        additionalText: ""
                    })
                }
            }),

        ];

    } // end of _getPageContents

    /************************************************************************
     * 페이지 푸터 
     ************************************************************************/
    function _getPageFooter() {

        return new sap.m.Bar({
            contentRight: [
                new sap.m.Button({
                    text: APPCOMMON.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C63"), // Apply
                    type: "Emphasized",
                    icon: "sap-icon://accept",
                    press: (oEvent) => {
                        ev_pressApplyBtn(oEvent);
                    }
                })
            ]
        });

    } // end of _getPageFooter


    /**
     * Start!!!!
     */
    onStart();

})(oUI5.NVCNT, oUI5.NAVIGATIONLIST);