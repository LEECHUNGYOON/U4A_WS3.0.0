export let oContr = await new Promise(async (resolve)=>{

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
    let MAIN_PAGE = new sap.m.Page({
        showHeader: false,
        enableScrolling: false,
        showFooter: false,
    });

    APP.addPage(MAIN_PAGE);

    MAIN_PAGE.setModel(oContr.oModel);

    let NAVCON1 = new sap.m.NavContainer();
    MAIN_PAGE.addContent(NAVCON1);

    oContr.ui.NAVCON1 = NAVCON1;

    let PAGE = new sap.m.Page({
        enableScrolling: false
    });
    NAVCON1.addPage(PAGE);

    let OVERFLOWTOOLBAR1 = new sap.m.OverflowToolbar();
    PAGE.setCustomHeader(OVERFLOWTOOLBAR1);

    let TITLE1 = new sap.m.Title({
        text: oContr.msg.M005   // 버전 히스토리 [ APPID ];
    });

    OVERFLOWTOOLBAR1.addContent(TITLE1);

    let SPLITTER1 = new sap.ui.layout.Splitter({
        orientation: "Vertical"
    });
    SPLITTER1.addStyleClass("snippetSplitter");

    PAGE.addContent(SPLITTER1);

    let PAGE1 = new sap.m.Page({
        enableScrolling: false,
        showHeader: false
    });
    SPLITTER1.addContentArea(PAGE1);

    oContr.ui.VERLIST_PAGE = PAGE1;

    oContr.ui.SPLITTER1 = SPLITTER1;

    let TABLE1 = new sap.ui.table.Table({
        rowHeight: 45,
        // selectionMode: "Multi",
        selectionMode: "None",
        selectionBehavior: "Row",
        minAutoRowCount: 1,
        visibleRowCountMode: "Auto",
        fixedColumnCount: 4,
        columns: [

            // Status
            new sap.ui.table.Column({
                width: "80px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M006, // Status,
                    design: "Bold"
                }),
                template: new sap.m.ObjectStatus({
                    state: "{_STATUS}",
                    icon: "{_STATUS_ICON}"
                })
            }),

            // App ID
            new sap.ui.table.Column({
                width: "250px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M007,  // Application ID           
                    design: "Bold"
                }),
                template: new sap.m.HBox({
                    width: "100%",
                    alignItems: "Center",
                    justifyContent: "Center",
                    items: [
                        new sap.m.Title({
                            text: "{APPID}",
                            wrapping: false,
                            tooltip: "{APPID}"
                        }).addStyleClass("sapUiSmallMarginEnd"),

                        new sap.m.Button({
                            icon: "sap-icon://action",
                            press: function(oEvent){

                                let oBtn = oEvent.getSource();
                                if(!oBtn){
                                    return;
                                }

                                let oBindCtx = oBtn.getBindingContext();
                                if(!oBindCtx){
                                    return;
                                }

                                let oAppInfo = oBindCtx.getObject();
                                if(!oAppInfo){
                                    return;
                                }

                                oContr.fn.openAppNewBrowser(oAppInfo);

                            },
                            
                            tooltip: oContr.msg.M033    // 새창으로 보기

                        }).bindProperty("enabled", {
                            parts: [
                                { path: "TAPPID" },
                                { path: "TCLSID" },
                                { path: "VPOSN" },

                            ],
                            formatter: function(TAPPID, TCLSID, VPOSN){

                                if(TAPPID === "" && TCLSID === "" && VPOSN === 0){
                                    return false;
                                }

                                return true;

                            }
                        })
                    ]
                })
                
                // new sap.m.Title({
                //     text: "{APPID}",
                //     wrapping: false,
                //     tooltip: "{APPID}"
                // })
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

            // App Version
            new sap.ui.table.Column({
                width: "100px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M009,  // App Version
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{VPOSN}"
                })
            }),

            // Compare (Base/Target)
            new sap.ui.table.Column({
                width: "250px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M008,  // Compare (Base/Target)
                    design: "Bold"
                }),   
                template: new sap.m.HBox({
                    width: "100%",
                    alignItems: "Center",
                    justifyContent: "Center",
                    items: [

                        new sap.m.RadioButton({
                            selected: "{_ISSOURCE}",
                            groupName: "g1",
                            text: oContr.msg.M021,   // 비교 기준
                            // select: function (oEvent) {
                            //     // oContr.ui.TABLE1.clearSelection();
                            // }
                        }),

                        new sap.m.RadioButton({
                            selected: "{_ISTARGET}",
                            groupName: "g2",
                            text: oContr.msg.M022,   // 비교 대상
                            // select: function (oEvent) {
                            //     // oContr.ui.TABLE1.clearSelection();
                            // }
                        }),
                    ]
                })

            }),

            // Request
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M010,  // Request No.
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{CTSNO}",
                    wrapping: false,
                    tooltip: "{CTSNO}"
                })
            }),

            // Request Text
            new sap.ui.table.Column({
                width: "500px",
                hAlign: "Begin",
                label: new sap.m.Label({
                    text: oContr.msg.M011,  // Request Desc.
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    text: "{CTSTX}",
                    wrapping: false,
                    tooltip: "{CTSTX}"
                })
            }),

            // Package
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M012,  // Package
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
                    text: oContr.msg.M013,  // Create Date
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    // text: "{ERDAT}"
                    // text: {
                    //     path: "ERDAT",
                    //     type: "sap.ui.model.type.Date",
                    //     formatOptions: {
                    //         pattern: "yyyy-MM-dd",
                    //         source: {
                    //             pattern: "yyyyMMdd"
                    //         }
                    //     }
                    // }
                    wrapping: false,
                    tooltip: "{ERDAT}",
                }).bindProperty("text", "ERDAT", oContr.fn.formatterNoZeroDate),
            }),

            // Create Time
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M014,  // Create Time
                    design: "Bold"
                }),
                template: new sap.m.Text({
                    // text: "{ERTIM}"
                    // text: {
                    //     path: "ERTIM",
                    //     type: "sap.ui.model.type.Time",
                    //     formatOptions: {
                    //         pattern: "hh:mm:ss",
                    //         source: {
                    //             pattern: "HHmmss"
                    //         }
                    //     }
                    // }
                    wrapping: false,
                    tooltip: "{ERTIM}",
                }).bindProperty("text", "ERTIM", oContr.fn.formatterNoZeroTime)
            }),

            // Create User
            new sap.ui.table.Column({
                width: "120px",
                hAlign: "Center",
                label: new sap.m.Label({
                    text: oContr.msg.M015, // Create User
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

    /**
     * 선택한 기준/대상 비교 버튼
     */
    let BUTTON3 = new sap.m.Button({
        icon: "sap-icon://compare",
        type: "Emphasized",
        text: oContr.msg.M032,  // 비교하기
        tooltip: oContr.msg.M032,   // 비교하기
        press: function () {            

            oContr.fn.compareSelectedApp();

        }
    });
    TOOLBAR1.addContent(BUTTON3);

    /**
     * 해당 버전을 새창으로 실행하여 조회
     */
    // let BUTTON4 = new sap.m.Button({
    //     icon: "sap-icon://action",
    //     // type: "Emphasized",
    //     press: function (oEvent) {
            
    //         oContr.fn.openSelectedVersion(oEvent);            

    //     }
    // });
    // TOOLBAR1.addContent(BUTTON4);


    /**
     * 소스 비교 페이지
     */
    let PAGE2 = new sap.m.Page({
        enableScrolling: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: "50%",
            minSize: 200
        })
    });

    oContr.ui.COMPARE_PAGE = PAGE2;

    let OVERFLOWTOOLBAR17 = new sap.m.OverflowToolbar();
    PAGE2.setCustomHeader(OVERFLOWTOOLBAR17);

    // let TOOLBARSPACER12 = new sap.m.ToolbarSpacer();
    // OVERFLOWTOOLBAR17.addContent(TOOLBARSPACER12);

    let BUTTON28 = new sap.m.Button({
        icon: "sap-icon://navigation-down-arrow",
        press: function () { 
            oContr.fn.moveNextChangeCode();
        }
    });

    OVERFLOWTOOLBAR17.addContent(BUTTON28);

    let BUTTON27 = new sap.m.Button({
        icon: "sap-icon://navigation-up-arrow",
        press: function () { 
            oContr.fn.movePreviousChangeCode();
        }
    });

    OVERFLOWTOOLBAR17.addContent(BUTTON27);

    let TOOLBARSPACER1 = new sap.m.ToolbarSeparator();
    OVERFLOWTOOLBAR17.addContent(TOOLBARSPACER1);

    let TITLE2 = new sap.m.Title({
        text: "{/S_COMPARE_PAGE_HANDLE/hdr_title_base}"
    });

    OVERFLOWTOOLBAR17.addContent(TITLE2);

    TITLE2.addStyleClass("sapUiSmallMarginBegin");

    let OBJNUM1 = new sap.m.ObjectNumber({
        inverted: true,
        state: "Information",
        number: "{/S_COMPARE_PAGE_HANDLE/base_ver}"
    });
    OVERFLOWTOOLBAR17.addContent(OBJNUM1);

    OBJNUM1.addStyleClass("sapMObjectNumberLarge u4aCompareVer");

 
    let TOOLBARSPACER13 = new sap.m.ToolbarSpacer({ width: "50px" });
    OVERFLOWTOOLBAR17.addContent(TOOLBARSPACER13);

    let TITLE3 = new sap.m.Title({
        text: "{/S_COMPARE_PAGE_HANDLE/hdr_title_target}"
    });

    OVERFLOWTOOLBAR17.addContent(TITLE3);

    let OBJNUM2 = new sap.m.ObjectNumber({
        inverted: true,
        state: "Success",
        number: "{/S_COMPARE_PAGE_HANDLE/target_ver}"
    });   

    OVERFLOWTOOLBAR17.addContent(OBJNUM2);

    OBJNUM2.addStyleClass("sapMObjectNumberLarge u4aCompareVer");

    

    let TOOLBARSPACER12 = new sap.m.ToolbarSpacer();
    OVERFLOWTOOLBAR17.addContent(TOOLBARSPACER12);



    // sap-icon://legend
    let BUTTON21 = new sap.m.Button({
        icon: "sap-icon://legend",
        // type: "Negative",
        text: oContr.msg.M034,      // 범례
        tooltip: oContr.msg.M034,   // 범례
        press: function (oEvent) {

            let oBtn = oEvent.getSource();
            if(!oBtn){
                return;
            }
  
            oContr.fn.openSourceCompareLegendPopover(oBtn);

        }
    });
    OVERFLOWTOOLBAR17.addContent(BUTTON21);


    let BUTTON29 = new sap.m.Button({
        icon: "sap-icon://decline",
        type: "Negative",
        press: function () { 
            oContr.fn.closeSplitterComparePage();
        }
    });
    OVERFLOWTOOLBAR17.addContent(BUTTON29);


    let VBOX9 = new sap.m.VBox({
        height: "100%",
        width: "100%",
        renderType: "Bare"
    });

    PAGE2.addContent(VBOX9);

    let sEditorIndexPath1 = "./monaco/index.html";

    let sFrameHtml1 = `
    <div style="height: 100%">
        <iframe class="MONACO_EDITOR EDITOR_FRAME1" src="${sEditorIndexPath1}" onload="" style="border:none;width:100%;height:100%;">
        </iframe>
    </div>`;

    let HTML7 = new sap.ui.core.HTML();
    HTML7.setContent(sFrameHtml1);

    VBOX9.addItem(HTML7);
    
    

    /********************************************
     * Legend Popover
     ********************************************/

    let RESPONSIVEPOPOVER1 = new sap.m.ResponsivePopover({
        placement:"Auto",
        resizable:true,
        contentWidth:"300px"
    });
        
    RESPONSIVEPOPOVER1.addStyleClass("sourceCompareLegendPopover sapUiSizeCompact");

    RESPONSIVEPOPOVER1.setModel(oContr.oModel);

    oContr.ui.LEGEND_POPOVER = RESPONSIVEPOPOVER1;

    let OVERFLOWTOOLBAR14 = new sap.m.OverflowToolbar();
    RESPONSIVEPOPOVER1.setCustomHeader(OVERFLOWTOOLBAR14);

    let ICON1 = new sap.ui.core.Icon({
        src: "sap-icon://legend",
        size: "20px"
    });
    
    OVERFLOWTOOLBAR14.addContent(ICON1);

    let TITLE12 = new sap.m.Title({
        text: oContr.msg.M034 // 범례
    });
    
    OVERFLOWTOOLBAR14.addContent(TITLE12);

    let VBOX4 = new sap.m.VBox({
        renderType:"Bare"
    }).addStyleClass("legendListWrapperVBox");
    
    RESPONSIVEPOPOVER1.addContent(VBOX4);

    let TABLE6 = new sap.m.Table();
    TABLE6.addStyleClass("legendList");
    VBOX4.addItem(TABLE6);

    let COLUMNLISTITEM1 = new sap.m.ColumnListItem();
    TABLE6.bindAggregation("items", {
        path: "/T_LEGEND",
        template: COLUMNLISTITEM1,
        templateShareable: true
    });

    let HBOX4 = new sap.m.HBox({
        width:"100%"
    });
    
    COLUMNLISTITEM1.addCell(HBOX4);

    let FLEXITEMDATA1 = new sap.m.FlexItemData({
        growFactor:1,
        order:1,
        styleClass: "{colorStyleClass}"
    });
    
    HBOX4.setLayoutData(FLEXITEMDATA1);

    let DUMMYBOX = new sap.m.HBox();
    HBOX4.addItem(DUMMYBOX);

    DUMMYBOX.setLayoutData(FLEXITEMDATA1.clone());

    let TEXT28 = new sap.m.Text({
        text: "{desc}",
        wrapping:false
    });
    
    COLUMNLISTITEM1.addCell(TEXT28);

    let COLUMN31 = new sap.m.Column({
        width:"100px"
    });
    
    TABLE6.addColumn(COLUMN31);

    let LABEL31 = new sap.m.Label({
        design:"Bold",
        text: oContr.msg.M037 // 색상
    });
    
    COLUMN31.setHeader(LABEL31);

    let COLUMN32 = new sap.m.Column();
    TABLE6.addColumn(COLUMN32);

    let LABEL32 = new sap.m.Label({
        design:"Bold",
        text: oContr.msg.M038 // 설명
    });
    
    COLUMN32.setHeader(LABEL32);







    oContr.ui.APP = APP;

    resolve(oContr);

});