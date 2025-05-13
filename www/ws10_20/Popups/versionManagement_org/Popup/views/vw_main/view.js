export var oContr = await new Promise(async (resolve)=>{

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
        // busy: true,
        // busyIndicatorDelay: 0,
        autoFocus: false,
    });

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    let PAGE = new sap.m.Page({
        showHeader: false,
        enableScrolling: false,
        showFooter: false,
    });

    APP.addPage(PAGE);

    PAGE.setModel(oContr.oModel);

    let NAVCON1 = new sap.m.NavContainer();
    PAGE.addContent(NAVCON1);

    let PAGE1 = new sap.m.Page({

    });
    NAVCON1.addPage(PAGE1);

    let OVERFLOWTOOLBAR1 = new sap.m.OverflowToolbar();
    PAGE1.setCustomHeader(OVERFLOWTOOLBAR1);

    let TITLE1 = new sap.m.Title({
        text: `Version of ${oAPP.IF_DATA.oAppInfo.APPID}`  // [MSG]
    });
    
    OVERFLOWTOOLBAR1.addContent(TITLE1);

    let TABLE1 = new sap.ui.table.Table({
        rowHeight: 45,
        selectionMode: "Multi",
        minAutoRowCount: 1,
        visibleRowCountMode: "Auto",
        fixedColumnCount: 3,
        columns: [

            // Status
            new sap.ui.table.Column({
                width: "80px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Status", // [MSG]                 
                    design: "Bold"
                }),
                template: new sap.m.ObjectStatus({
                    state: "{_STATUS}",
                    icon : "{_STATUS_ICON}"
                })
            }),

            // App ID
            new sap.ui.table.Column({
                width: "200px",
                hAlign: "Begin",
                label: new sap.m.Label({
                    text: "App ID", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Title({
                    text: "{APPID}"
                })
                // template: new sap.m.Text({
                //     text: "{APPID}"
                // })
                // template: new sap.m.Link({
                //     text: "{APPID}",
                //     press: function (oEvent){

                //         // [async]
                //         oContr.fn.onSelectApp(oEvent);

                //     }
                // })
                // template: 
                //     new sap.m.ObjectStatus({
                //         text: "{APPID}",
                //         active: true,
                //         inverted: true
                //     }).addStyleClass("sapMObjectStatusLarge")
            }),

            // Compare
            new sap.ui.table.Column({
                width: "100px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Compare", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Button({
                    icon: "sap-icon://compare",
                    press: function(oEvent){

                        oContr.fn.onCompareCurrVersion(oEvent);

                    }
                })
            }),

            // App Version
            new sap.ui.table.Column({
                width: "100px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "App Version", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{VPOSN}"
                })
            }),

            // Request
            new sap.ui.table.Column({
                width: "200px",
                hAlign: "Begin",
                label: new sap.m.Label({
                    text: "Request", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{CTSNO}"
                })
            }),

            // Request Text
            new sap.ui.table.Column({
                width: "1000px",
                hAlign: "Begin",
                label: new sap.m.Label({
                    text: "Request Text", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{CTSTX}"
                })
            }),

            // Package
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Package", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{PACKG}"
                })
            }),

            // Create Date
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Create Date", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{ERDAT}"
                })
            }),

            // Create Time
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Create Time", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{ERTIM}"
                })
            }),

            // Create User
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: "Create User", // [MSG]                    
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{ERUSR}"
                })
            }),

        ],
        rows: {
            path: "/T_APP_VER_LIST",
        }
    });
    PAGE1.addContent(TABLE1);

    oContr.ui.TABLE1 = TABLE1;

    let TOOLBAR1 = new sap.m.OverflowToolbar();
    TABLE1.addExtension(TOOLBAR1);

    let BUTTON1 = new sap.m.Button({
        icon: "sap-icon://multiselect-all",
        press: function(){

            oContr.fn.setMultiSelectAll();

            sap.m.MessageToast.show(1);
        }
    });
    // TOOLBAR1.addContent(BUTTON1);

    let BUTTON2 = new sap.m.Button({
        icon: "sap-icon://multiselect-none",
        press: function(){

            sap.m.MessageToast.show(2);
        }
    });
    // TOOLBAR1.addContent(BUTTON2);

    let BUTTON3 = new sap.m.Button({
        icon: "sap-icon://compare",
        type: "Emphasized",
        press: function(){

            sap.m.MessageToast.show(3);

        }
    });
    TOOLBAR1.addContent(BUTTON3);


    let BUTTON4 = new sap.m.Button({
        icon: "sap-icon://action",
        // type: "Emphasized",
        press: function(oEvent){

            // oContr.fn.onSelectApp(oEvent);
            oContr.fn.openSelectedVersion(oEvent);

            // sap.m.MessageToast.show(4);

        }
    });
    TOOLBAR1.addContent(BUTTON4);



    oContr.ui.APP = APP;

    resolve(oContr);

});