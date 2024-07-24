export var oContr = await new Promise(async function(resolve){

    /************************************************************************
     * 💖 컨트롤러 호출
     ************************************************************************/
    
        let sControlPath = "./control.js";
    
        const oRes = await import(sControlPath);
        const oContr = oRes.oContr;
       
    
    /************************************************************************
     * 💖 화면 그리기
     ************************************************************************/
    
        let APP = new sap.m.App({
            busy: true,
            busyIndicatorDelay: 0,
            autoFocus: false,
        });

        var PAGE1 = new sap.m.Page({
            // title: "{/TITLE} ( Please resize the browser window !! )",
            content: {
                  path: "/T_CSS_LIST",
                  template: new sap.m.Panel({
                        headerText: "{text}",
                        backgroundDesign: sap.m.BackgroundDesign.Transparent,
                        headerToolbar: new sap.m.Toolbar({
                            content: [
                                new sap.m.Title({
                                    text : "{text}"
                                }),
                            ]
                        }),
                        content: [
                             new sap.m.Text({
                                  text: "{desc}"
                             })
                        ]
                  }).bindProperty("headerText", {
                        parts: [
                            "cssnm"
                        ],
                        formatter: function(cssnm){

                            this.addStyleClass(cssnm);

                            return cssnm;

                        }

                  }).addStyleClass("sapUiLargeMarginBottom")
            }
        }).addStyleClass("sapUiContentPadding");
        APP.addPage(PAGE1);

        let TOOLBAR1 = new sap.m.Toolbar();
        PAGE1.setCustomHeader(TOOLBAR1);

        let TITLE1 = new sap.m.Title({
            text: `{/TITLE} ( ${oContr.msg.E34} !! )` // Please resize the browser window
            // text: "{/TITLE} ( Please resize the browser window !! )"
        });
        TOOLBAR1.addContent(TITLE1);

        PAGE1.setModel(oContr.oModel);

        oContr.ui.ROOT = APP;   

        
    resolve(oContr);
    
});