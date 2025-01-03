let oFrame = document.getElementById('ws_frame');

let oAPP = oFrame.contentWindow.oAPP;

let sap = oFrame.contentWindow.sap;

/*********************************************************
 * @module - Use init pre-screen event 사용 여부 확인 팝업 호출.
 ********************************************************/
module.exports = function(sAttr){

    //232	Apply
    let _confirm = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "232");

    //003  Cancel
    let _cancel = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "003");

    //display 모드일경우 버튼 text를 close로 변경.
    if(oAPP.attr.oModel.oData.IS_EDIT === false){
        //A39	056
        _cancel = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "056");
    }

    //254   Configure the init pre-screen event.
    let _txt01 = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "254");


    let _oDialog = new sap.m.Dialog({
        contentWidth: "40%",
        contentHeight: "50%",
        type : "Message",
        draggable: true,
        resizable: true,
        verticalScrolling: false,
        beforeOpen : function(){

            //팝업의 모델 초기값 설정.
            setInitPopupModelData(_oModel, sAttr);
        },
        afterOpen: function(){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");
        },
        afterClose: function(){
            //DIALOG 제거 처리.
            _oDialog.destroy();
        },
        customHeader: new sap.m.Toolbar({
            content: [
                new sap.m.Title({
                    text: "Use init pre-screen event"
                }),

                new sap.m.ToolbarSpacer(),

                new sap.m.Button({
                    icon: "sap-icon://decline",
                    type: "Reject",
                    tooltip: _cancel,
                    press : function(){
                        //팝업 종료 처리.
                        _oDialog.close();

                    }
                })

            ]
        }),
        content: [
            new sap.ui.core.HTML({
                content: "{/INFO_MSG}"
            }),

            new sap.m.HBox({
                alignItems: "Center",
                wrap: "Wrap",
                items: [
                    new sap.m.Title({
                        titleStyle: "H4",
                        text : _txt01,
                        tooltip: _txt01,
                    }).addStyleClass("sapUiTinyMarginEnd"),
                    new sap.m.Switch({
                        state: "{/INTFT_STATE}",
                        enabled : "{/EDIT}"
                    })
                ]
            }).addStyleClass("sapUiSmallMargin")
            
        ],
        buttons:[
            new sap.m.Button({
                icon: "sap-icon://accept",
                text: _confirm,
                tooltip : _confirm,
                type: "Accept",
                visible : "{/EDIT}",
                press: function(){

                    parent.setBusy("X");

                    //단축키 잠금 처리.
                    oAPP.fn.setShortcutLock(true);

                    // Use init pre-screen event 사용 여부 처리.
                    setInitPreScreen(_oModel, sAttr);

                    //팝업 종료 처리.
                    _oDialog.close();
                }
            }),

            new sap.m.Button({
                icon: "sap-icon://decline",
                text: _cancel,
                tooltip: _cancel,
                type: "Reject",
                press : function(){
                    //팝업 종료 처리.
                    _oDialog.close();
                }
            })

        ]
    }).addStyleClass("sapUiSizeCompact");


    let _oModel = new sap.ui.model.json.JSONModel();

    _oDialog.setModel(_oModel);


    _oDialog.open();


};




/*********************************************************
 * @function - HTML PATH 구성.
 ********************************************************/
function setHTMLPath(){

    var l_langu = oAPP.oDesign.settings.GLANGU || "EN";


    //HTML파일 PATH 구성.
    var l_path = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", 
        "html", "documents", l_langu, "initPreScreenPopup", "index.html");

    //HTML 파일이 존재하지 않는경우 EXIT.
    if(parent.FS.existsSync(l_path) !== true){
        
        return "";
    }

    //파일이 존재하는경우 path return.
    return l_path;

}   //HTML PATH 구성.




/*********************************************************
 * @function - 팝업의 모델 초기값 설정.
 ********************************************************/
function setInitPopupModelData(oModel, sAttr){

    //init pre-screen event를 사용하는경우 switch 값을 true로 설정 처리.
    let _state = sAttr.UIATV === "X" ? true : false;


    //HTML PATH 구성.
    let _htmlPath = setHTMLPath();


    // let _msg = `<div style="width:100%;"><h2>테스트 메시지 입니다.</h2></div>`;
    let _msg = `<iframe style="width:100%; height:90%; border: 0px;" src="${_htmlPath}">`;


    oModel.setData({
        INFO_MSG : _msg,
        INTFT_STATE : _state,        
        EDIT : oAPP.attr.oModel.oData.IS_EDIT
    });

}




/*********************************************************
 * @function - Use init pre-screen event 사용 여부 처리.
 ********************************************************/
function setInitPreScreen(oModel, sAttr){

    
    //Use init pre-screen event를 사용하는경우 X값을, 사용하지 않는경우 공백값 매핑.
    sAttr.UIATV = oModel.oData.INTFT_STATE === true ? "X"  : "";


    //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
    oAPP.fn.attrChangeProc(sAttr);


    //20240621 pes.
    //바인딩 팝업의 디자인 영역 갱신처리.
    oAPP.fn.updateBindPopupDesignData();


}