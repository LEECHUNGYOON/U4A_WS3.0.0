/********************************************************************
 *📝 VIEW.JS    
    내역 : 웹딘 컨버전 화면 구성 영역
********************************************************************/
export async function createView(oParam){

    sap.ui.requireSync('sap/m/MessageBox');
    
    
    var _path = parent.PATH.join(parent.getPath("WS10_20_ROOT"), "design", 
      "createApplication", "conversionWebdynpro", "main", "control.js");


    const _oMudule = await import(_path);

    var _oContr = await _oMudule.createControl(oParam);

    //026	Create
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "026");

    var ROOT = new sap.m.Page({
        showHeader : false,
        footer : new sap.m.Bar({
            visible: "{/S_VIS/CREATE_WIZARD}",
            contentRight:[
                new sap.m.Button({
                    icon : "sap-icon://accept",
                    type : "Emphasized",
                    text : _txt,
                    tooltip: _txt,
                    press : function(oEvent){          
                        _oContr.fn.onCreateWebdynConvUI(oEvent);              
                    }
                })
            ]
        })
    });
    _oContr.ui.ROOT = ROOT;

    ROOT.setModel(_oContr.oModel);

    var _oDelegate = {
        onAfterRendering : async function(){

            ROOT.removeEventDelegate(_oDelegate);

            //onViewReady 실행
            await _oContr.onViewReady();
            
        }
    };

    ROOT.addEventDelegate(_oDelegate);

    
    var HBOX1 = new sap.m.HBox({
        direction:"Column",
        height:"100%"
    });
    
    ROOT.addContent(HBOX1);


    //438	웹딘프로 컴포넌트명을 입력 하여 View List조회
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "438");
    
    var FORM1 = new sap.ui.layout.form.Form({
        editable:true,
        toolbar : new sap.m.Toolbar({
            visible: "{/S_VIS/CREATE_WIZARD}",
            content: [
                new sap.m.ObjectStatus({
                    text : _txt,
                    tooltip: _txt,
                    state : "Indication05"
                })
            ]
        }),
        layout : new sap.ui.layout.form.ResponsiveGridLayout({
            labelSpanXL: 3, 
            labelSpanL: 3,
            labelSpanM: 4, 
            labelSpanS: 12, 
            columnsL: 1,
            backgroundDesign: "Transparent",
            adjustLabelSpan : false,
            singleContainerFullSize : false
        })
    });
    
    HBOX1.addItem(FORM1);

    
    var FORMCONTAINER1 = new sap.ui.layout.form.FormContainer();
    FORM1.addFormContainer(FORMCONTAINER1);


    //439	Web Dynpro 컴포넌트
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "439");

    //웹딘프로 컴포넌트명 입력.
    var FORMELEMENT1 = new sap.ui.layout.form.FormElement({
        label : new sap.m.Label({
            text:_txt,
            tooltip: _txt,
            design:"Bold",
            required:true
        }),
        fields : [
            new sap.m.Input({
                showValueHelp:true,
                showClearIcon:true,
                value:"{/S_UAWD/COMP_NAME}",
                valueState: "{/S_VALST/COMP_NAME}",
                valueStateText: "{/S_VALTX/COMP_NAME}",
                change : function(oEvent){
                    _oContr.fn.onChangeWebdynComp(oEvent);
                },
                valueHelpRequest : function(oEvent){
                    _oContr.fn.onValueHelpWDCompName(oEvent);
                }
            })
        ]
    });
    FORMCONTAINER1.addFormElement(FORMELEMENT1);


    //440	Web Dynpro Description
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "440");

    //웹딘프로 컴포넌트 설명 출력.
    var FORMELEMENT2 = new sap.ui.layout.form.FormElement({
        label : new sap.m.Label({
            text:_txt,
            tooltip: _txt,
            design:"Bold"
        }),
        fields : [
            new sap.m.Input({
                editable:false,
                value:"{/S_UAWD/COMP_DESC}"
            })
        ]
    });
    FORMCONTAINER1.addFormElement(FORMELEMENT2);


    //386	Package
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "386");

    //패키지 입력.
    var FORMELEMENT3 = new sap.ui.layout.form.FormElement({
        visible: "{/S_VIS/PACKG}",
        label : new sap.m.Label({
            text:_txt,
            tooltip:_txt,
            design:"Bold",
            required:true
        }),
        fields : [
            new sap.m.Input({
                showValueHelp:true,
                showClearIcon:true,
                value: "{/S_UAWD/PACKG}",
                valueState: "{/S_VALST/PACKG}",
                valueStateText: "{/S_VALTX/PACKG}",
                required: true,
                change : function(oEvent){
                    _oContr.fn.onChangePackage(oEvent);
                },
                valueHelpRequest : function(oEvent){
                    _oContr.fn.onValueHelpPackage(oEvent);
                }
            })
        ]
    });
    FORMCONTAINER1.addFormElement(FORMELEMENT3);


    //441	Request No
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "441");

    //Request No
    var FORMELEMENT4 = new sap.ui.layout.form.FormElement({
        visible: "{/S_VIS/REQNR}",
        label : new sap.m.Label({
            text:_txt,
            tooltip:_txt,
            design:"Bold"
        }),
        fields : [
            new sap.m.Input({
                showValueHelp:true,
                showClearIcon:true,
                valueHelpOnly:true,
                value: "{/S_UAWD/REQNR}",
                editable: "{/S_EDIT/REQNR}",                
                required: "{/S_UAWD/REQNR_REQ}",
                valueState: "{/S_VALST/REQNR}",
                valueStateText: "{/S_VALTX/REQNR}",
                valueHelpRequest : function(oEvent){
                    _oContr.fn.onValueHelpReqNumber(oEvent);
                }
            })
        ]
    });
    FORMCONTAINER1.addFormElement(FORMELEMENT4);

    //442	Request Description
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "442");

    //Request Desc.
    var FORMELEMENT5 = new sap.ui.layout.form.FormElement({
        visible: "{/S_VIS/REQTX}",
        label : new sap.m.Label({
            text:_txt,
            tooltip:_txt,
            design:"Bold"
        }),
        fields : [
            new sap.m.Input({
                editable:false,
                value: "{/S_UAWD/REQTX}"
            })
        ]
    });
    FORMCONTAINER1.addFormElement(FORMELEMENT5);


    //443	Select View → Select Create button to switch to U4A UI.
    var _txt1 = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "443");

    //444	Web Dynpro 뷰 항목
    var _txt2 = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "444");


    //VIEW 선택 리스트
    var TABLE1 = new sap.ui.table.Table({
        // visible: false,
        visible: "{/S_VIS/VLIST}",
        visibleRowCountMode: "Auto",
        selectionBehavior: "Row",
        selectionMode: "Single",
        extension:[
            new sap.m.Toolbar({
                content: [
                    new sap.m.ObjectStatus({
                        text : _txt1,
                        tooltip: _txt1,
                        state : "Indication05"
                    })
                ]
            }),
            new sap.m.Toolbar({
                content: [
                    new sap.m.Title({
                        text : _txt2,
                        tooltip: _txt2
                    })
                ]
            })
        ],
        rows: {
            path: "/T_VLIST",
            template : new sap.ui.table.Row(),
            templateShareable: true
        },
        layoutData : new sap.m.FlexItemData({
            growFactor:1
        })
    });
    TABLE1.addStyleClass("sapUiTinyMargin");
    HBOX1.addItem(TABLE1);

    _oContr.ui.VLIST = TABLE1;


    //445	View Name
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "445");

    //뷰 명 컬럼.
    var COLUMN1 = new sap.ui.table.Column({
        filterProperty : "VIEW_NAME",
        sortProperty : "VIEW_NAME",
        label : new sap.m.Label({
            design:"Bold",
            text:_txt,
            tooltip:_txt
        }),
        template : new sap.m.Text({
            text:"{VIEW_NAME}"
        })
    });
    TABLE1.addColumn(COLUMN1);

    
    //446	View Description
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "446");

    //뷰 description 컬럼.
    var COLUMN2 = new sap.ui.table.Column({
        filterProperty : "VIEW_DESC",
        sortProperty : "VIEW_DESC",
        label : new sap.m.Label({
            design:"Bold",
            text:_txt,
            tooltip:_txt
        }),
        template : new sap.m.Text({
            text:"{VIEW_DESC}"
        })
    });
    TABLE1.addColumn(COLUMN2);


    return _oContr;


};