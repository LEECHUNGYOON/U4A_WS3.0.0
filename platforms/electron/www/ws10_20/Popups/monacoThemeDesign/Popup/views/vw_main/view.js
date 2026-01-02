export async function getView(){

/************************************************************************
 * 💖 컨트롤러 호출
 ************************************************************************/

    let sControlPath = "./control.js";

    const oRes   = await import(sControlPath);
    const oContr = await oRes.getControl();

    //317	Standard Theme
    const C_STANDARD_THEME = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "317");

    //318	Custom Theme
    const C_CUSTOM_THEME = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "318");

/************************************************************************
 * 💖 화면 그리기
 ************************************************************************/
    
    sap.ui.requireSync("sap/m/MessageBox");

    let APP = new sap.m.App({
        // busy: true,
        // busyIndicatorDelay: 0,
        autoFocus: false,
    }).addStyleClass("sapUiSizeCompact");

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    let oPage = new sap.m.Page({
        enableScrolling: false,
        showFooter: false,
        showHeader: false
    });

    oPage.setModel(oContr.oModel);    
    APP.addPage(oPage);

    var SPLITTER1 = new sap.ui.layout.Splitter({
        resize : function(oEvent){
            oContr.fn.onSplitterResize(oEvent);
        }
    });
    oPage.addContent(SPLITTER1);



    /************************************************************************
     * 에디터 미리보기 페이지.
     ************************************************************************/
    var PAGE1 = new sap.m.Page({
        showHeader : false,
        layoutData : new sap.ui.layout.SplitterLayoutData({
            minSize : 300
        })
    });
    SPLITTER1.addContentArea(PAGE1);


    var HBOX1 = new sap.m.HBox({
        alignItems:"Center"
    }).addStyleClass("sapUiTinyMargin");
    PAGE1.addContent(HBOX1);

    //001	Language
    var _text = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "001");

    HBOX1.addItem(new sap.m.Label({        
        text:_text,
        tooltip:_text,
        design:"Bold"
    }).addStyleClass("sapUiTinyMarginEnd"));

    
    var COMBOBOX1 = new sap.m.ComboBox({                        
        selectedKey : "{/S_THEME/LANGUAGE}",
        showSecondaryValues : true,
        selectionChange : function(oEvent){

            //Langage ddlb 변경 이벤트.
            oContr.fn.onChangeLangage(oEvent);

        },
        items: {
            path : "/T_LANGAGE",
            template : new sap.ui.core.ListItem({
                key: "{KEY}",
                text : "{TEXT}"
            })
        }
    });   
    HBOX1.addItem(COMBOBOX1);

    //콤보박스 클릭시 DDLB 펼침 처리.
    COMBOBOX1.addEventDelegate({onclick: function(oEvent){
        
        if(typeof oEvent?.srcControl?.isOpen === "undefined"){
            return;
        }

        if(oEvent.srcControl.isOpen() === true){
            return;
        }

        oEvent.srcControl.open();

    }});

    let _sFrameHtml1 = `<div style="height:calc(100% - 50px)"><iframe class="EDITOR_FRAME1" ` +
    `onload="oAPP.views.VW_MAIN.fn.onFrameLoad(event)" src="./../monaco/index.html" ` +
    `style="border:none;width:100%;height:100%;"></iframe></div>`;

    var HTML1 = new sap.ui.core.HTML({
        content: _sFrameHtml1
    });
    PAGE1.addContent(HTML1);


    /************************************************************************
     * 테마 설정 페이지.
     ************************************************************************/
    var PAGE2 = new sap.m.Page({
        showHeader : false,
        layoutData : new sap.ui.layout.SplitterLayoutData({
            minSize : 300,
            size : "50%"
        })
    });
    SPLITTER1.addContentArea(PAGE2);

    var WIZARD1 = new sap.m.Wizard({
        //315	Save
        finishButtonText:oAPP.WSUTIL.getWsMsgClsTxt("EN", "ZMSG_WS_COMMON_001", "315"),
        height:"100%",
        stepActivate : function(){
            oContr.fn.onThemeStepComplete();
        },
        complete : function(){
            oContr.fn.onSaveTheme();
        }
    });
    PAGE2.addContent(WIZARD1);

    oContr.ui.WIZARD1 = WIZARD1;

    /************************************************************************
     * 테마 선택 WIZARD STEP.
     ************************************************************************/

    var WIZARDSTEP1 = new sap.m.WizardStep({
        //316	Choose theme
        title:oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "316")
    });
    WIZARD1.addStep(WIZARDSTEP1);

    oContr.ui.WIZARDSTEP1 = WIZARDSTEP1;


    var HBOX2 = new sap.m.HBox({
        alignItems:"Center"
    });    
    WIZARDSTEP1.addContent(HBOX2);

    //005	Theme
    var _text = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "005");

    HBOX2.addItem(new sap.m.Label({        
        text : _text,
        tooltip : _text,
        design:"Bold",
        required:true
    }).addStyleClass("sapUiTinyMarginEnd"));



    var COMBOBOX2 = new sap.m.ComboBox({
        showSecondaryValues : true,
        selectedKey : "{/S_THEME/NAME}",
        valueState : "{/S_THEME/NAME_VS}",
        valueStateText : "{/S_THEME/NAME_VT}",
        selectionChange : function(oEvent){

            //테마 ddlb 변경 이벤트.
            oContr.fn.onChangeTheme(oEvent);

        },
        items: {
            path : "/T_THEME",
            template : new sap.ui.core.ListItem({
                key: "{KEY}",
                text : "{TEXT}",
                additionalText: "{SUBTX}"
            }),
            sorter : [
                new sap.ui.model.Sorter("IS_STANDARD", false, function(oContext){
                    
                    var _key = oContext.getProperty("IS_STANDARD");

                    var _text = _key === true ? C_STANDARD_THEME : C_CUSTOM_THEME;

                    return {key:_key, text:_text};

                })
            ]
        }
    }).addStyleClass("sapUiTinyMarginEnd");
    HBOX2.addItem(COMBOBOX2);


    //콤보박스 클릭시 DDLB 펼침 처리.
    COMBOBOX2.addEventDelegate({onclick: function(oEvent){

        if(typeof oEvent?.srcControl?.isOpen === "undefined"){
            return;
        }

        if(oEvent.srcControl.isOpen() === true){
            return;
        }

        oEvent.srcControl.open();

    }});

    
    HBOX2.addItem(new sap.m.Text({
        text:"{/S_THEME/THEME_SUBTX}",
    }));
    


    /************************************************************************
     * 테마 설정 WIZARD STEP.
     ************************************************************************/
    var WIZARDSTEP2 = new sap.m.WizardStep({
        //319	Setting theme properties
        title:oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "319")
    });
    WIZARD1.addStep(WIZARDSTEP2);

    oContr.ui.WIZARDSTEP2 = WIZARDSTEP2;

    var PANEL1 = new sap.m.Panel({
        expandable: true,
        expanded : true,
        //320	Rules
        headerText : oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "320")
    }).addStyleClass("sapUiSmallMarginBottom");
    WIZARDSTEP2.addContent(PANEL1);


    //321	Keyword
    var _text1 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "321");

    //322	Foreground Color
    var _text2 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "322");

    //323	Background Color
    var _text3 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "323");

    //324	Font Style
    var _text4 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "324");

    var TABLE1 = new sap.ui.table.Table({
        selectionMode : "None",
        minAutoRowCount : 1,
        visibleRowCount : "{/S_LIST/RULE_ROW_CNT}",
        columns: [
            new sap.ui.table.Column({
                sortProperty: "TOKEN_TX",
                filterProperty: "TOKEN_TX",
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text1,
                    tooltip: _text1
                }),
                template : new sap.m.Text({
                    text: "{TOKEN_TX}"
                })
            }),

            new sap.ui.table.Column({
                hAlign : "Center",
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text2,
                    tooltip : _text2
                }),
                template : new sap.ui.core.Icon({
                    size : "30px",
                    src : "sap-icon://color-fill",
                    color : "{FGROUND_COLOR}",
                    visible: "{FGROUND_VISIBLE}",
                    press : function(){
                        oContr.fn.onChangeForegroundColor(this);
                    }
                }),
            }),

            new sap.ui.table.Column({
                hAlign : "Center",
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text3,
                    tooltip : _text3
                }),
                template : new sap.ui.core.Icon({
                    size : "30px",
                    src : "sap-icon://color-fill",
                    color : "{BGROUND_COLOR}",
                    visible: "{BGROUND_VISIBLE}",
                    press : function(){
                        oContr.fn.onChangeBackgroundColor(this);
                    }
                }),
            }),

            new sap.ui.table.Column({
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text4,
                    tooltip : _text4
                }),
                template : new sap.m.Select({
                    width : "100%",
                    selectedKey : "{fontStyle}",
                    items : {
                        path : "/T_FONT_STYLE",
                        templateShareable: true,
                        template : new sap.ui.core.Item({
                            key : "{KEY}",
                            text : "{TEXT}"
                        })
                    },
                    change : function(){
                        oContr.fn.onChangeFontStyle(this);
                    }
                })
            })
        ],
        rows : {
            path : "/T_RULES",
            template : new sap.ui.table.Row()
        }
    });
    PANEL1.addContent(TABLE1);


    //325	Colors
    var _text2 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "325");

    //326	Color
    var _text3 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "326");


    var PANEL2 = new sap.m.Panel({
        expandable: true,
        expanded : true,
        headerText : _text2
    });
    WIZARDSTEP2.addContent(PANEL2);

    var TABLE2 = new sap.ui.table.Table({
        selectionMode : "None",
        minAutoRowCount : 1,
        visibleRowCount : "{/S_LIST/COLOR_ROW_CNT}",
        columns: [
            new sap.ui.table.Column({
                sortProperty: "TOKEN_TX",
                filterProperty: "TOKEN_TX",
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text1,
                    tooltip : _text1
                }),
                template : new sap.m.Text({
                    text: "{TOKEN_TX}"
                })
            }),

            new sap.ui.table.Column({
                hAlign : "Center",
                label : new sap.m.Label({
                    design : "Bold",
                    text : _text3,
                    tooltip : _text3
                }),
                template : new sap.ui.core.Icon({
                    size : "30px",
                    src : "sap-icon://color-fill",
                    color : "{color}",
                    press : function(){
                        oContr.fn.onChangeColor(this);
                    }
                })
            }),
        ],
        rows : {
            path : "/T_COLORS",
            template : new sap.ui.table.Row()
        }
    });
    PANEL2.addContent(TABLE2);



    /************************************************************************
     * 커스텀 테마명 입력 WIZARD STEP.
     ************************************************************************/

    //327	Custom Theme Name
    var _text = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "327");

    var WIZARDSTEP3 = new sap.m.WizardStep({
        title : _text
    });
    WIZARD1.addStep(WIZARDSTEP3);

    oContr.ui.WIZARDSTEP3 = WIZARDSTEP3;


    var HBOX3 = new sap.m.HBox({
        alignItems:"Center"
    });
    
    WIZARDSTEP3.addContent(HBOX3);

    var LABEL2 = new sap.m.Label({
        text:_text,
        tooltip : _text,
        design:"Bold",
        required:true
    });
    LABEL2.addStyleClass("sapUiTinyMarginEnd");
    HBOX3.addItem(LABEL2);

    var INPUT1 = new sap.m.Input({
        value : "{/S_THEME/CUSTOM_NAME}",
        valueState : "{/S_THEME/CUSTOM_NAME_VS}",
        valueStateText : "{/S_THEME/CUSTOM_NAME_VT}",
        enabled : "{/S_THEME/CUSTOM_NAME_EDIT}",
        showClearIcon : true
    });
    HBOX3.addItem(INPUT1);

    oContr.ui.CUSTOM_THEME_NAME = INPUT1;


    /************************************************************************
     *  footer 영역.
     ************************************************************************/

    //328	Reset
    var _text1 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "328");

    //056	Close
    var _text2 = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "056");

    var TOOLBAR1 = new sap.m.Toolbar({
        content : [
            new sap.m.ToolbarSpacer(),

            new sap.m.Button({
                text : _text1,
                tooltip : _text1,
                type : "Accept",
                icon : "sap-icon://reset",

                press : function(){
                    oContr.fn.onResetThemeData();
                }

            }),

            new sap.m.Button({
                text : _text2,
                tooltip : _text2,
                type : "Reject",
                icon : "sap-icon://decline",

                press : function(){
                    oContr.fn.onCloseThemeEditorPopup();
                }

            })
        ]
    });

    PAGE2.setFooter(TOOLBAR1);


    oContr.ui.APP = APP;

    return oContr;
    
}