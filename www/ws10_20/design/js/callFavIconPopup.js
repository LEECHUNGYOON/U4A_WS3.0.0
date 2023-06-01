(function(){

    let loApp = {ui:{}, attr:{}};

    //attribute 설명글 팝업 호출.
    oAPP.fn.callFavIconPopup = function(oUi, is_attr, f_cb){
        
        //attr 초기화 처리.
        loApp.attr = {};

        //openBy 처리 UI가 존재하지 않는경우 exit.
        if(!oUi){return;}

        //입력 attr 정보 광역화.
        loApp.attr.is_attr = is_attr;

        //callback function정보 광역화.
        loApp.attr.f_cb = f_cb;

        //아이콘 즐겨찾기 항목 검색.
        loApp.attr.T_ICON = parent.WSUTIL.getIconFavorite(parent.WSUTIL.getWsSettingsInfo().globalLanguage);

        //즐겨찾기 항목이 존재하지 않는다면.
        if(loApp.attr.T_ICON.length === 0){

            //078  Icon favorite list
            //079  &1 does not exist.
            parent.showMessage(sap, 10, "E", 
                parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "079", 
                    parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "078")
                , "", "", ""));

            return;
        }


        //광역화된 팝업 정보가 존재하는경우.
        //(이전에 팝업을 생성하여 호출한적이 있는경우)
        if(loApp.ui.oPop){

            //새로 그리지 않고 이전 팝업 정보로 open 처리.
            loApp.ui.oPop.openBy(oUi);
            return;
        }

        //description 팝업.
        var oPop = new sap.m.ResponsivePopover({placement:"Auto", contentHeight:"40%", 
            contentWidth:"20%", verticalScrolling:false, resizable:false});

        //팝업 UI 광역화.
        loApp.ui.oPop = oPop;

        //팝업 호출 이후 팝업에 focus 처리.
        oPop.attachAfterOpen(function(){
            //팝업의 바인딩 정보 구성.
            lf_setBindData();
            oPop.focus();
        });


        loApp.oModel = new sap.ui.model.json.JSONModel();
        oPop.setModel(loApp.oModel);

        var oTool0 = new sap.m.Toolbar();
        oPop.setCustomHeader(oTool0);

        //078   Icon favorite list
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "078");

        //팝업 타이틀.
        oTool0.addContent(new sap.m.Title({text:l_txt, tooltip:l_txt}).addStyleClass("sapUiTinyMarginBegin"));
        
        oTool0.addContent(new sap.m.ToolbarSpacer());

        //A39	Close
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip: l_txt});
        oTool0.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //팝업 종료 처리.
            oPop.close();

        }); //닫기 버튼 선택 이벤트.

        var oVBox = new sap.m.VBox({width:"100%", height:"100%",renderType:"Bare"});
        oPop.addContent(oVBox);

        //365  Double-click the line in the icon list to add an icon.
        //결과리스트 테이블.
        var oTab = new sap.ui.table.Table({selectionMode:"None", minAutoRowCount:1, alternateRowColors:true,
            visibleRowCountMode:"Auto", columnHeaderVisible:false, rowHeight:48,
            footer:new sap.m.Label({design:"Bold", text:oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "365", "", "", "", "")}),
            layoutData:new sap.m.FlexItemData({growFactor:1})});
        oVBox.addItem(oTab);

        //아이콘 선택(더블클릭) 이벤트.
        oTab.addEventDelegate({ondblclick:function(oEvent){
            lf_selLine(oEvent);
        }}); //아이콘 선택(더블클릭) 이벤트.


        var oCol = new sap.ui.table.Column();
        oTab.addColumn(oCol);

        var oHBox1 = new sap.m.HBox({width:"100%", renderType:"Bare", justifyContent:"SpaceBetween", alignItems:"Center"});
        oCol.setTemplate(oHBox1);

        var oHBox2 = new sap.m.HBox({width:"100%", height:"45px", renderType:"Bare", alignItems:"Center"});
        oHBox1.addItem(oHBox2);

        var oIcon = new sap.ui.core.Icon({src:"{ICON_SRC}", size:"35px",
            layoutData:new sap.m.FlexItemData({minWidth:"40px"})}).addStyleClass("sapUiSmallMarginEnd");
        oHBox2.addItem(oIcon);

        var oTxt = new sap.m.Text({text:"{ICON_NAME}"});
        oHBox2.addItem(oTxt);

        //A79	Copy Text
        //copy 버튼.
        var oCopy = new sap.m.Button({icon:"sap-icon://copy"});
        // oCItem.addCell(oCopy);
        oHBox1.addItem(oCopy);

        //copy 버튼 선택 이벤트.
        oCopy.attachPress(function(){
            lf_copyText(this);
        }); //copy 버튼 선택 이벤트.


        oTab.bindAggregation("rows", {path:"/T_ICON", template:new sap.ui.table.Row()});


        //팝업 호출.
        oPop.openBy(oUi);

    };  //attribute 설명글 팝업 호출.




    //팝업의 바인딩 정보 구성.
    function lf_setBindData(){

        var LT_ICON = [];

        for(var i=0, l=loApp.attr.T_ICON.length; i<l; i++){
            LT_ICON.push({ICON_NAME:loApp.attr.T_ICON[i].ICON_NAME, ICON_SRC:loApp.attr.T_ICON[i].ICON_SRC});
        }

        //아이콘 리스트 바인딩 처리.
        loApp.oModel.setData({T_ICON:LT_ICON});

    } //팝업의 바인딩 정보 구성.



    //table 더블클릭 이벤트 처리.
    function lf_selLine(oEvent){
        
        //편집모드가 아닌경우 exit.
        if(!oAPP.attr.oModel.oData.IS_EDIT){return;}

        //callback function이 존재하지 않는경우 exit.
        if(typeof loApp.attr.f_cb === "undefined"){return;}

        //더블클릭한 dom으로부터 UI 검색.
        var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

        //UI를 찾지 못한 경우 exit.
        if(typeof l_ui === "undefined"){return;}

        //해당 ui의 바인딩 정보 얻기.
        var l_ctxt = l_ui.getBindingContext();

        //바인딩 정보를 얻지 못한 경우 exit.
        if(typeof l_ctxt === "undefined"){return;}

        //icon 정보 얻기.
        var ls_icon = l_ctxt.getProperty();

        //callback function에 선택한 icon명 전달.
        loApp.attr.f_cb(ls_icon.ICON_SRC);

        //아이콘 팝업 종료 처리.
        loApp.ui.oPop.close();

        //메시지 처리.
        //271	&1 has been selected.
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "271", ls_icon.ICON_SRC, "", "", ""));

        //메뉴 잠금 해제 처리.

    }   //table 더블클릭 이벤트 처리.




    //복사버튼 선택 이벤트.
    function lf_copyText(oUi){

        
        loApp.ui.oPop.setModal(true);

        //버튼선택 라인의 바인딩정보에 해당하는 값 얻기.
        var ls_icon = oUi.getBindingContext().getProperty();

        //icon src 복사 처리.
        parent.setClipBoardTextCopy(ls_icon.ICON_SRC);

        // 메시지 처리.
        // 272	&1 has been copied.
        parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "272", ls_icon.ICON_SRC, "", "", ""));

        loApp.ui.oPop.setModal(false);

    }   //복사버튼 선택 이벤트.


})();