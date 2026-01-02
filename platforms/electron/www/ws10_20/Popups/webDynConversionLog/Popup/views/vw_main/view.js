export async function getView(){

/************************************************************************
 * 💖 컨트롤러 호출
 ************************************************************************/

    let sControlPath = "./control.js";

    const oRes   = await import(sControlPath);
    const oContr = await oRes.getControl();

/************************************************************************
 * 💖 화면 그리기
 ************************************************************************/
    
    sap.ui.requireSync("sap/m/MessageBox");
    sap.ui.getCore().loadLibrary("sap.tnt");
    sap.ui.getCore().loadLibrary("sap.ui.richtexteditor");
    sap.ui.getCore().loadLibrary("sap.ui.unified");

    let APP = new sap.m.App({
        busyIndicatorDelay: 0,
        autoFocus: false,
    }).addStyleClass("sapUiSizeCompact");

    APP.setModel(oContr.oModel);

    //#region STEP 리스트 페이지
    //#endregion
    var PAGE = new sap.m.Page();
    APP.addPage(PAGE);

    var SPLITCONTAINER1 = new sap.ui.unified.SplitContainer({
        showSecondaryContent:"{/S_CONT/STEP_SHOW}",
        secondaryContentSize:"400px"
    });
    
    PAGE.addContent(SPLITCONTAINER1);

    var PAGE2 = new sap.m.Page({
        showHeader:false
    });
    
    SPLITCONTAINER1.addSecondaryContent(PAGE2);

    //#region LOG STEP 리스트
    //#endregion
    var LIST1 = new sap.m.List({
        mode:"SingleSelectMaster",
        itemPress : function(oEvent){
            oContr.fn.onSelectStep(oEvent);
        },
        items : {
            path : "/T_STEP",
            templateShareable: true,
            template : new sap.m.CustomListItem({
                type:"Active",
                highlight:"Information",                
                
                content : [
                    new sap.m.HBox({
                        justifyContent:"SpaceBetween",
                        alignItems:"Center",
                        items : [
                            new sap.m.HBox({
                                alignItems:"Center",
                                items: [
                                    new sap.tnt.InfoLabel({
                                        text:"{SEQ}"
                                    }).addStyleClass("sapUiTinyMargin"),
                                    new sap.m.Title({
                                        text:"{STPTX}"
                                    })
                                ]
                            }),
                            new sap.m.HBox({
                                alignItems:"Center",
                                items : [
                                    new sap.m.VBox({
                                        items:[
                                            new sap.m.Button({
                                                type:"Emphasized",
                                                icon:"sap-icon://sys-help",
                                                visible:false
                                            }).addStyleClass("sapUiTinyMarginEnd")
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        }
    });
    
    PAGE2.addContent(LIST1);

    //#region LOG 출력 DETAIL 페이지
    //#endregion
    var PAGE1 = new sap.m.Page({
        showHeader:false,
        enableScrolling:false
    }).addStyleClass("sapUiContentPadding");
    SPLITCONTAINER1.addContent(PAGE1);

    var VBOX2 = new sap.m.VBox({
        height:"100%",
        width:"100%",
        renderType:"Bare"
    });
    
    PAGE1.addContent(VBOX2);

    //#region LOG 상태정보 OBJECTSTATUS
    //#endregion
    var HBOX5 = new sap.m.HBox({
        wrap:"Wrap"
    }).addStyleClass("sapUiTinyMarginBottom");
    VBOX2.addItem(HBOX5);

    //460	Log Count
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "460");

    var OBJECTSTATUS2 = new sap.m.ObjectStatus({
        title:_txt,
        tooltip:_txt,
        text:"{/S_DETAIL/LOG_CNT}",
        state:"Information",
        icon:"sap-icon://documents",
        active:true,
        press : function(){
            oContr.fn.onPressLogCount();
        }
    }).addStyleClass("sapUiSmallMargin");
    HBOX5.addItem(OBJECTSTATUS2);


    //461	Success Log
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "461");

    var OBJECTSTATUS3 = new sap.m.ObjectStatus({
        title:_txt,
        tooltip:_txt,
        text:"{/S_DETAIL/LOG_SUC}",
        state:"Success",
        icon:"sap-icon://message-success",
        active:true,
        press : function(){
            oContr.fn.onPressLogSuccessCount();
        }
    }).addStyleClass("sapUiSmallMargin");
    HBOX5.addItem(OBJECTSTATUS3);


    //462	Error Log
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "462");

    var OBJECTSTATUS4 = new sap.m.ObjectStatus({
        title:_txt,
        tooltip:_txt,
        text:"{/S_DETAIL/LOG_ERR}",
        state:"Error",
        icon:"sap-icon://error",
        active:true,
        press : function(){
            oContr.fn.onPressLogErrorCount();
        }
    }).addStyleClass("sapUiSmallMargin");
    HBOX5.addItem(OBJECTSTATUS4);

    oContr.ui.ERR_STATE = OBJECTSTATUS4;

    //#region LOG 출력 RichTextEditor
    //#endregion
    var RICHTEXTEDITOR1 = new sap.ui.richtexteditor.RichTextEditor({
        value:"{/S_DETAIL/LOGTX}",
        width:"100%",
        height:"100%",
        editable:false
    });
    
    VBOX2.addItem(RICHTEXTEDITOR1);


    //#region MAIN 페이지 툴바
    //#endregion
    var OVERFLOWTOOLBAR1 = new sap.m.OverflowToolbar();
    PAGE.setCustomHeader(OVERFLOWTOOLBAR1);

    //463	Menu Expand/Collapse
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "463");

    var OVERFLOWTOOLBARTOGGLEBUTTON1 = new sap.m.OverflowToolbarToggleButton({
        icon:"sap-icon://menu2",
        tooltip : _txt,
        pressed:"{/S_CONT/STEP_SHOW}",
        layoutData : new sap.m.OverflowToolbarLayoutData({
            priority:"NeverOverflow"
        })
    });
    
    OVERFLOWTOOLBAR1.addContent(OVERFLOWTOOLBARTOGGLEBUTTON1);

    OVERFLOWTOOLBAR1.addContent(new sap.m.ToolbarSeparator());

    //#region LOG ACTION SELECT
    //#endregion
    var SELECT1 = new sap.m.Select({
        selectedKey:"{/S_CONT/LOGKY}",
        showSecondaryValues : true,
        wrapItemsText : true,
        change : function(){
            oContr.fn.onSelLogHeader();
        },
        items : {
            path :"/T_ACTLOG",
            template : new sap.ui.core.ListItem({
                key:"{LOGKY}",
                text:"{TEXT}",
                tooltip : "{TEXT}",
                additionalText : "{COMPONENT_NAME}"

            })
        },
        layoutData : new sap.m.OverflowToolbarLayoutData({
            priority:"NeverOverflow"
        })
    });
    OVERFLOWTOOLBAR1.addContent(SELECT1);

    //171	Refresh
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "171");

    OVERFLOWTOOLBAR1.addContent(new sap.m.OverflowToolbarButton({
        icon:"sap-icon://refresh",
        type:"Emphasized",
        text:_txt,
        tooltip:_txt,
        press : function(){
            oContr.fn.onRefreshLogData();
        }
    }));


    OVERFLOWTOOLBAR1.addContent(new sap.m.ToolbarSeparator());

    var TITLE4 = new sap.m.Title({
        text:"{/S_CONT/COMPONENT_DESC}",
        tooltip:"{/S_CONT/COMPONENT_DESC}"
    }).addStyleClass("sapUiSmallMarginBegin");
    OVERFLOWTOOLBAR1.addContent(TITLE4);

    OVERFLOWTOOLBAR1.addContent(new sap.m.ToolbarSeparator());

    var TITLE3 = new sap.m.Title({
        text:"{/S_DETAIL/STPTX}",
        tooltip:"{/S_DETAIL/STPTX}"
    });
    OVERFLOWTOOLBAR1.addContent(TITLE3);

    OVERFLOWTOOLBAR1.addContent(new sap.m.ToolbarSpacer());

    //464	Download Log File
    var _txt = oAPP.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "464");

    var OVERFLOWTOOLBARBUTTON1 = new sap.m.OverflowToolbarButton({
        text:_txt,
        tooltip:_txt,
        type:"Accept",
        icon:"sap-icon://download",
        visible:false,
        press : function(){
            oContr.fn.onDownloadLogFile();
        }
    });
    
    OVERFLOWTOOLBAR1.addContent(OVERFLOWTOOLBARBUTTON1);


    oContr.ui.APP = APP;
    
    return oContr;
    
}