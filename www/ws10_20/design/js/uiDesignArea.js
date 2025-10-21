(function(){
  //좌측 페이지(UI Design 영역) 구성.
  oAPP.fn.uiDesignArea = function(oLPage){

    var oModel = oLPage.getModel();

    //UI TABLE 라이브러리 LOAD.
    sap.ui.getCore().loadLibrary("sap.ui.table");
    
    //UI TABLE 라이브러리 예외처리.
    oAPP.fn.excepUiTableLibrary();

    //design tree UI.
    var oLTree1 = new sap.ui.table.TreeTable({selectionMode:"Single", 
      selectionBehavior:"RowOnly", 
      //20240819 PES.
      //sap.ui.table.RowAction을 사용시 간헐적으로 특정 row의 rowActionItem이 보이지 않기에
      //sap.ui.table.Column으로 대체 처리함에 따라 기존 rowActionCount 프로퍼티 세팅 주석 처리.
      // rowActionCount:2,
      columnHeaderVisible:false, visibleRowCountMode:"Auto", 
      alternateRowColors:true, rowHeight:40});
    oLPage.addContent(oLTree1);


    //tree item 선택 이벤트.
    oLTree1.attachCellClick(async function(oEvent){

      parent.setBusy("X");

      //단축키도 같이 잠금 처리.
      oAPP.fn.setShortcutLock(true);
      
      // 전체 자식 윈도우에 Busy 킨다.
      oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_ON"});
    
      //데이터 출력 라인을 선택하지 않은경우 exit.
      if(!oEvent?.mParameters?.rowBindingContext?.getProperty){

        // 전체 자식 윈도우에 Busy 종료.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});
        
        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);
        
        parent.setBusy("");

        return;
      }
      
      //선택 라인 정보 얻기.
      var ls_tree = oEvent.mParameters.rowBindingContext.getProperty();

      //라인선택에 따른 각 화면에 대한 처리.
      await oAPP.fn.designTreeItemPress(ls_tree);

      //20240527 PES
      //바인딩 팝업에 UI 라인 선택 처리.
      oAPP.fn.selectBindingPopupOBJID(ls_tree);


      // 전체 자식 윈도우에 Busy 종료.
      oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");

    }); //tree item 선택 이벤트.



    //tree 접힘/펼침 이벤트.
    oLTree1.attachToggleOpenState(function(){
      //drop 가능여부 css 처리.
      oAPP.fn.designSetDropStyle();

    }); //tree 접힘/펼침 이벤트.

    //20240819 PES -START.
    //sap.ui.table.RowAction을 사용시 간헐적으로 특정 row의 rowActionItem이 보이지 않기에
    //기존 로직 주석 처리함.
    // //table에 hook 이벤트 추가.
    // sap.ui.table.utils._HookUtils.register(oLTree1, 
    //   sap.ui.table.utils._HookUtils.Keys.Signal, function(oEvent){

    //   //design tree의 row action icon style 처리.
    //   oAPP.fn.designSetRowActionIconStyle(oEvent);
           
    // });
    //20240819 PES -END.

    
    //tree 라인선택 예외처리.
    oLTree1.attachRowSelectionChange(oAPP.fn.onDesignTreeRowSelChange); //tree 라인선택 예외처리.



    //TREE TABLE이 아닌 다른 영역을 더블클릭 이후 ROW 선택시
    // 선택되지 않는 문제 해결을 위한 예외처리 로직.
    oLTree1.attachBrowserEvent("click", function(){
        window.getSelection().removeAllRanges();
    });


    //20240819 PES -START.
    //sap.ui.table.RowAction을 사용시 간헐적으로 특정 row의 rowActionItem이 보이지 않기에
    //기존 로직 주석 처리함.
    // //라인별 action 버튼.
    // var oAct = new sap.ui.table.RowAction();
    // oLTree1.setRowActionTemplate(oAct);

    // //A54  Insert Element
    // //UI 추가 버튼.
    // var oItem1 = new sap.ui.table.RowActionItem({icon:"sap-icon://add", visible:"{visible_add}",
    //     text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A54", "", "", "", "")});
    // oAct.addItem(oItem1);

    // //ui 추가 버튼 선택 이벤트.
    // oItem1.attachPress(function(oEvent){

    //   parent.setBusy("X");

    //   //단축키 잠금 처리.
    //   oAPP.fn.setShortcutLock(true);

    //   var l_ctxt = this.getBindingContext();
    //   if(!l_ctxt){

    //     //단축키 잠금 해제처리.
    //     oAPP.fn.setShortcutLock(false);

    //     parent.setBusy("");

    //     return;
    //   }

    //   //ui 추가 버튼 선택 이벤트 처리.
    //   oAPP.fn.designUIAdd(l_ctxt.getProperty());

    // }); //ui 추가 버튼 선택 이벤트.


    // //A03  Delete
    // //삭제 버튼.
    // var oItem2 = new sap.ui.table.RowActionItem({icon:"sap-icon://delete", visible:"{visible_delete}",
    //     text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});
    // oAct.addItem(oItem2);

    // //ui 삭제 버튼 선택 이벤트.
    // oItem2.attachPress(function(oEvent){
      
    //   parent.setBusy("X");

    //   var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //   //213	디자인 화면에서 UI 삭제처리를 진행하고 있습니다.
    //   _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "213");

    //   //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    //   parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

    //   //단축키 잠금.
    //   oAPP.fn.setShortcutLock(true);

    //   var l_ctxt = this.getBindingContext();
    //   if(!l_ctxt){

    //     //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
    //     parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
        
    //     //단축키 잠금 해제 처리.
    //     oAPP.fn.setShortcutLock(false);

    //     parent.setBusy("");

    //     return;
    //   }

    //   //ui 삭제 버튼 선택 이벤트 처리.
    //   oAPP.fn.designUIDelete(l_ctxt.getProperty());

    // }); //ui 삭제 버튼 선택 이벤트.
    //20240819 PES -END.


    //tree instance 정보 광역화.
    oAPP.attr.ui.oLTree1 = oLTree1;

    //checkbox Column.
    var oLCol1 = new sap.ui.table.Column({autoResizable:true});
    oLTree1.addColumn(oLCol1);

    var oLHbox1 = new sap.m.HBox({width:"100%", alignItems:"Center", tooltip:"{OBJID}", 
      justifyContent:"SpaceBetween", wrap:"NoWrap"}).addStyleClass("sapUiTinyMarginEnd");
    oLCol1.setTemplate(oLHbox1);

    var oLHbox2 = new sap.m.HBox({renderType:"Bare", alignItems:"Center"});
    oLHbox1.addItem(oLHbox2);
    // oLCol1.setTemplate(oLHbox2);

    //라인 선택 checkbox
    var oChk1 = new sap.m.CheckBox({visible:"{chk_visible}", selected:"{chk}"});
    oLHbox2.addItem(oChk1);

    //UI 아이콘
    var oImage = new sap.m.Image({src:"{UICON}", width:"19px", visible:"{icon_visible}"});
    oLHbox2.addItem(oImage);

    oImage.addStyleClass("sapUiTinyMarginEnd");
    
    //checkbox 선택 이벤트.
    oChk1.attachSelect(function(oEvent){

      //이벤트 발생 라인의 UI정보 얻기.
      var ls_tree = this.getBindingContext().getProperty();
      
      //design 영역 체크박스 선택에 따른 parent, child의 check 선택/해제 처리.
      oAPP.fn.designTreeSelChkbox(ls_tree);

    }); //checkbox 선택 이벤트.

    
    //UI명.
    var oLtxt1 = new sap.m.Text({text:"{OBJID}", tooltip:"{OBJID}"});
    oLHbox2.addItem(oLtxt1);

    // var oLCol2 = new sap.ui.table.Column({autoResizable:true, hAlign:"End"});
    // oLTree1.addColumn(oLCol2);
    
    //부모 Aggregation text UI.
    //var oLtxt2 = new sap.m.Text({text:"{UIATT}"});
    var oLtxt2 = new sap.m.ObjectStatus({text:"{UIATT}", icon:"{UIATT_ICON}"});
    oLHbox1.addItem(oLtxt2);
    // oLCol2.setTemplate(oLtxt2);


    //20240819 PES -START.
    //sap.ui.table.RowAction을 사용시 간헐적으로 특정 row의 rowActionItem이 보이지 않기에
    //sap.ui.table.Column으로 대체 처리.
    oLTree1.addColumn(new sap.ui.table.Column({
      width: "60px",
      visible: "{/IS_EDIT}",
      template: new sap.m.HBox({
        width : "100%",
        renderType : "Bare",
        justifyContent : "SpaceBetween",
        items:[
          new sap.ui.core.Icon({
            src : "sap-icon://add",
            color : "#4db1ff",
            visible : "{visible_add}",

            //A54  Insert Element
            tooltip : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A54", "", "", "", ""),
            press: function(oEvent){

              parent.setBusy("X");

              //단축키 잠금 처리.
              oAPP.fn.setShortcutLock(true);

              var l_ctxt = this.getBindingContext();
              if(!l_ctxt){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return;
              }

              //ui 추가 버튼 선택 이벤트 처리.
              oAPP.fn.designUIAdd(l_ctxt.getProperty());
            }
          }),
          new sap.ui.core.Icon({
            src : "sap-icon://delete",
            color : "Negative",
            visible :"{visible_delete}",

            //A03  Delete
            tooltip  :oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", ""),
            press: function(oEvent){
              
              parent.setBusy("X");

              var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

              //213	디자인 화면에서 UI 삭제처리를 진행하고 있습니다.
              _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "213");

              //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
              parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

              //단축키 잠금.
              oAPP.fn.setShortcutLock(true);

              var l_ctxt = this.getBindingContext();
              if(!l_ctxt){

                //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
                parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
                
                //단축키 잠금 해제 처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return;
              }

              //ui 삭제 버튼 선택 이벤트 처리.
              oAPP.fn.designUIDelete(l_ctxt.getProperty());
            }
          })
        ]
      })
    }));

    //20240819 PES -END.
    

    //drag UI 생성.
    var oLTDrag1 = new sap.ui.core.dnd.DragInfo({sourceAggregation:"rows"});
    oAPP.attr.ui.oLTree1.addDragDropConfig(oLTDrag1);


    //design tree의 drop css 제거 처리 기능 추가.
    oAPP.fn.clearDropEffectUI(oAPP.attr.ui.oLTree1);


    // //drop UI 생성.
    // var oLTDrop1 = new sap.ui.core.dnd.DropInfo({targetAggregation:"rows"});
    // oAPP.attr.ui.oLTree1.addDragDropConfig(oLTDrop1);

    //drop UI 생성.
    var oLTDrop1 = new sap.ui.core.dnd.DropInfo({targetAggregation:"rows", dropPosition:"OnOrBetween"});
    oAPP.attr.ui.oLTree1.addDragDropConfig(oLTDrop1);
    
    //drag start 이벤트
    oLTDrag1.attachDragStart(function(oEvent){

      if(typeof oEvent?.mParameters?.target?.getBindingContext !== "function"){
        return;
      }

      //drag한 위치의 바인딩 정보 얻기.
      var l_ctxt = oEvent.mParameters.target.getBindingContext();
      if(!l_ctxt){return;}

      //drag한 TREE 정보 얻기.
      var ls_drag = l_ctxt.getProperty();
      if(!ls_drag){return;}

      //실제 라이브러리의 정보 검색.
      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === ls_drag.UIOBK);

      if(ls_0022){
        //DRAG한 UI의 라이브러리명 정보 세팅(Runtime Class Navigator 기능에서 사용)
        event.dataTransfer.setData("rtmcls", ls_0022.LIBNM);
      }

      //테스트주석처리!!!!!!!!!!!!!!!!!!!!
      //text/plain 을 사용하는용도가 바인딩 팝업 쪽인데, 바인딩 팝업은 setDragBindPopupData.js에서 처리 하고 있기에 주석 처리.
      //사용처를 다시 확인해서 사용처 없으면 제거 처리.
      //DRAG한 UI ID 정보 세팅.
      event.dataTransfer.setData("text/plain", "designTree|" + ls_drag.OBJID + "|" + oAPP.attr.DnDRandKey);
      
      //테스트주석처리!!!!!!!!!!!!!!!!!!!!
      //design tree에서 drag 해서 abap editor쪽에 D&D 하면 아래 소스를 완성하는것.
      //
      // var data1 = 
      //             `DATA LO_PAGE TYPE REF TO /U4A/CL_UO00389.\n`
      //                 + `LO_PAGE ?= AR_VIEW->GET_UI_INSTANCE( I_ID = 'PAGE1' ).`;
      
      //ws3.0 -> gui.
      // event.dataTransfer.setData("text/plain", data1);


      //drag 시작시 drop 가능건에 대한 제어 처리.
      oAPP.fn.designTreeDragStart(ls_drag);
      

      //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
      oAPP.fn.setDragAppData(ls_drag);


    }); //drag start 이벤트



    //drag 종료이벤트
    oLTDrag1.attachDragEnd(function(oEvent){

      //drag 종료 처리.
      oAPP.fn.designDragEnd();

    }); //drag 종료이벤트
    

    
    //drag UI가 다른라인에 올라갔을때 이벤트.
    oLTDrop1.attachDragEnter(function(oEvent){

      //drag UI가 다른라인에 올라갔을때 이벤트.
      oAPP.fn.designDragEnter(oEvent);

    }); //drag UI가 다른라인에 올라갔을때 이벤트.



    //drag UI가 drop위치에 올려졌을때 이벤트.
    oLTDrop1.attachDragOver(function(oEvent){
      
      //default move 표시.
      var l_effect = "Move";

      //컨트롤키 눌렀다면.
      if(event.ctrlKey){
        //copy 표시.
        l_effect = "Copy";
      }

      //drop effect 설정.
      this.setDropEffect(l_effect);

      //tree에 drop effect 설정.
      oAPP.attr.ui.oLTree1.__dropEffect = l_effect;

    }); //drag UI가 drop위치에 올려졌을때 이벤트.



    //drop 이벤트.
    oLTDrop1.attachDrop(async function(oEvent){

      parent.setBusy("X");


      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      
      var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

      //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
      _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215"); 

      //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

      
      if(typeof oEvent?.mParameters?.droppedControl.getBindingContext !== "function"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
      }


      //DROP한 라인 정보 얻기.
      var ls_drop = oEvent.mParameters.droppedControl.getBindingContext().getProperty();
      if(!ls_drop){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
      }


      //테스트!!!!!!!!!!!!!!!!!!!!!!!!!
      var _drag = oEvent.mParameters.browserEvent.dataTransfer.getData("text/plain");

      //AI 테스트.
      if(oAPP.oDesign.fn.testAIDataDrop(_drag, ls_drop) === true){
        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");
        return;
      }       
      //테스트!!!!!!!!!!!!!!!!!!!!!!!!!



      //미리보기, design tree에서 D&D 했다면 DROP 처리.
      if(oAPP.fn.UIDrop(oEvent, ls_drop.OBJID)){
        return;
      }

      //UI Insert popup에서 Drop했다면 UI 추가 처리.
      if(oAPP.fn.designUIDropInsertPopup(oEvent, ls_drop.OBJID)){return;}


      //개인화 화면에서 Drop했다면 UI 추가 처리.
      if(oAPP.fn.designUIDropP13nList(oEvent, ls_drop)){return;}


      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");


    }); //drop 이벤트.


    //테스트!!!!!!!!!!!!!!!!!!!!!!!!!
    oAPP.oDesign.fn.testAIDataDrop = function(appData, sDrop){
      
      //패키징 처리됐다면 exit.
      if(parent.REMOTE.app.isPackaged !== false){
        return;
      }

      try {
        var _sAppData = JSON.parse(appData);
      } catch (error) {
        return;
      }

      //AI를 통해 생성된 UI 정보를 구성하는 경우가 아니라면 EXIT.
      if(_sAppData?.PRCCD !== "AI_APP_DATA"){
        return;
      }

      if(typeof _sAppData?.T_0014 === "undefined"){
        return;
      }

      if(typeof _sAppData?.T_0015 === "undefined"){
        return;
      }

      var _sAiData = {};

      _sAiData.ACTCD = "DESIGN_DROP";

      _sAiData.T_0014 = _sAppData.T_0014;

      _sAiData.T_0015 = _sAppData.T_0015;

      _sAiData.OBJID = sDrop.OBJID;

      _sAiData.THEME_NAME = _sAppData?.THEME_NAME || "";

      _sAiData.oAPP  = oAPP;


      //AI로 부터 전달받은 데이터를 통해 UI 생성 처리.
      parent.require(parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
            "UAI", "parseAiLibraryData.js"))(_sAiData);


      return true;

    };
    //테스트!!!!!!!!!!!!!!!!!!!!!!!!!
    


    //tree toolbar UI.
    var oLTBar1 = new sap.m.OverflowToolbar();
    oLTree1.setToolbar(oLTBar1);

    //B21  Expand
    //펼침 버튼.
    // var oLBtn1 = new sap.m.Button({icon:"sap-icon://expand-group", 
    var oLBtn1 = new sap.m.OverflowToolbarButton({icon:"sap-icon://expand-group", 
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B21", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B21", "", "", "", "")});
    oLTBar1.addContent(oLBtn1);

    //펼침 이벤트.
    oLBtn1.attachPress(function(){

      //선택 라인의 하위 UI 펼침처리.
      oAPP.fn.expandTreeItem();

    }); //펼침 이벤트



    //B22  Collapse
    //접힘 버튼.
    // var oLBtn2 = new sap.m.Button({icon:"sap-icon://collapse-group", 
    var oLBtn2 = new sap.m.OverflowToolbarButton({icon:"sap-icon://collapse-group", 
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B22", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B22", "", "", "", "")});
    oLTBar1.addContent(oLBtn2);

    //접힘 버튼 선택 이벤트.
    oLBtn2.attachPress(function(){
      //선택한 라인을 접힘 처리.
      oAPP.attr.ui.oLTree1.collapse(oAPP.attr.ui.oLTree1.getSelectedIndex());

    }); //접힘 이벤트

    //구분자 추가.
    oLTBar1.addContent(new sap.m.ToolbarSeparator());

    
    //A70  Find UI
    //UI FILTER 버튼.
    // var oLBtn6 = new sap.m.Button({icon:"sap-icon://search", 
    var oLBtn6 = new sap.m.OverflowToolbarButton({icon:"sap-icon://search", 
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A70", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A70", "", "", "", "")});
    oLTBar1.addContent(oLBtn6);

    //UI FILTER 버튼 선택 이벤트.
    oLBtn6.attachPress(function(){

      
      parent.setBusy("X");

      oAPP.fn.setShortcutLock(true);


      if(typeof oAPP.fn.callDesignTreeFindPopup !== "undefined"){
        //검색 팝업 호출.
        oAPP.fn.callDesignTreeFindPopup(oLBtn6);
        return;
      }

      oAPP.fn.getScript("design/js/callDesignTreeFindPopup",function(){
        //검색 팝업 호출.
        oAPP.fn.callDesignTreeFindPopup(oLBtn6);        
        
      });

    }); //UI FILTER 버튼 선택 이벤트.


    // //구분자 추가.
    // oLTBar1.addContent(new sap.m.ToolbarSeparator({visible:"{/IS_EDIT}"}));


    //B23  Clear selection
    //전체선택 해제 버튼.
    // var oLBtn5 = new sap.m.Button({icon:"sap-icon://multiselect-none", visible:"{/IS_EDIT}", 
    var oLBtn5 = new sap.m.OverflowToolbarButton({icon:"sap-icon://multiselect-none", visible:"{/IS_EDIT}", 
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B23", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B23", "", "", "", "")});
    oLTBar1.addContent(oLBtn5);

    //전체 선택 헤제 버튼 이벤트.
    oLBtn5.attachPress(function(oEvent){
      //design tree의 체크박스 전체 선택 해제 처리.
      oAPP.fn.designClearCheckAll();

    }); //전체 선택 헤제 버튼 이벤트.



    // //구분자 추가.
    // oLTBar1.addContent(new sap.m.ToolbarSeparator({visible:"{/IS_EDIT}"}));

    //A03  Delete
    //삭제 버튼.
    // var oLBtn3 = new sap.m.Button({icon:"sap-icon://delete", visible:"{/IS_EDIT}", type:"Reject",
    var oLBtn3 = new sap.m.OverflowToolbarButton({icon:"sap-icon://delete", visible:"{/IS_EDIT}", type:"Reject",
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});
    oLTBar1.addContent(oLBtn3);

    //삭제버튼 선택 이벤트
    oLBtn3.attachPress(function(oEvent){

      parent.setBusy("X");

      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

      //213	디자인 화면에서 UI 삭제처리를 진행하고 있습니다.
      _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "213"); 

      //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

      //멀티 삭제 처리.
      oAPP.fn.designTreeMultiDeleteItem();

    });


    // //구분자 추가.
    // oLTBar1.addContent(new sap.m.ToolbarSeparator({visible:"{/IS_EDIT}"}));


    //B24  UI Template Wizard
    //wizard 버튼 추가.
    // var oLBtn4 = new sap.m.Button({icon:"sap-icon://responsive", visible:"{/IS_EDIT}", type:"Accept",
    var oLBtn4 = new sap.m.OverflowToolbarButton({icon:"sap-icon://responsive", visible:"{/IS_EDIT}", type:"Accept",
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B24", "", "", "", "")});
    oLTBar1.addContent(oLBtn4);


    //wizard 버튼 선택 이벤트.
    oLBtn4.attachPress(function(oEvent){

      // busy 키고 Lock 켜기
      parent.setBusy("X");

      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);
            
      if(typeof oAPP.fn.designCallWizardPopup !== "undefined"){
        //위자드 팝업 호출.
        oAPP.fn.designCallWizardPopup();
        return;
      }

      oAPP.fn.getScript("design/js/designCallWizardPopup",function(){
        //위자드 팝업 호출.
        oAPP.fn.designCallWizardPopup();

      });
      
    }); //wizard 버튼 선택 이벤트.

    
    //E28  UI Personalization List
    //개인화 팝업 호출 버튼.
    // var oLBtn7 = new sap.m.Button({icon:"sap-icon://user-settings",
    var oLBtn7 = new sap.m.OverflowToolbarButton({icon:"sap-icon://user-settings",
      // visible:parent.REMOTE.app.isPackaged ? false : true, //no build mode 일때만 활성화 처리(작업 완료후 해제 필요)
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E28", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E28", "", "", "", "")});
    oLTBar1.addContent(oLBtn7);

    oLBtn7.attachPress(function(){

      // busy 키고 Lock 켜기
      parent.setBusy("X");

      //UI 개인화 저장 팝업 function이 존재하는경우 즉시 호출.
      if(typeof oAPP.fn.callP13nDesignDataPopup !== "undefined"){
        oAPP.fn.callP13nDesignDataPopup("R");
        return;
      }

      //UI 개인화 저장 팝업 function이 존재하지 않는경우 js 로드 후 호출.
      oAPP.fn.getScript("design/js/callP13nDesignDataPopup",function(){
        oAPP.fn.callP13nDesignDataPopup("R");
      });

    });


    oLTBar1.addContent(new sap.m.ToolbarSeparator({
      visible:"{/IS_EDIT}",
    }));


    //접속 유저 정보 얻기.
    //(임시로직, 추후 시스템 언어로 통합 해야함)
    var _sInfo = parent.getUserInfo();

    //SAP 접속 언어 매핑(존재하지 않으면 DEFAULT EN)
    var _LANGU = _sInfo?.LANGU || "EN";

    //EN, KO 이외의 언어로 로그인 한경우 DEFAULT EN 처리.
    if("EN|KO".indexOf(_LANGU) === -1 ){
      _LANGU = "EN";
    }
    //(임시로직, 추후 시스템 언어로 통합 해야함)


    //UNDO 버튼 생성.
    // oLTBar1.addContent(new sap.m.Button({
    oLTBar1.addContent(new sap.m.OverflowToolbarButton({
      icon:"sap-icon://undo",
      //247	실행취소 (Ctrl+Z)
      text : parent.WSUTIL.getWsMsgClsTxt(_LANGU, "ZMSG_WS_COMMON_001", "247"),
      tooltip: parent.WSUTIL.getWsMsgClsTxt(_LANGU, "ZMSG_WS_COMMON_001", "247"),
      visible:"{/IS_EDIT}",
      enabled:{
        path:"/designTree/undo",
        formatter:function(params) {
          return params === true ? true : false;
        }
      },
      press: function(){
        parent.require(oAPP.oDesign.pathInfo.undoRedo).executeHistory("UNDO");
      }
    }));

    //REDO 버튼 생성.
    // oLTBar1.addContent(new sap.m.Button({
    oLTBar1.addContent(new sap.m.OverflowToolbarButton({
      icon:"sap-icon://redo",
      //248	재실행 (Ctrl+Y)
      text: parent.WSUTIL.getWsMsgClsTxt(_LANGU, "ZMSG_WS_COMMON_001", "248"),
      tooltip: parent.WSUTIL.getWsMsgClsTxt(_LANGU, "ZMSG_WS_COMMON_001", "248"),
      visible:"{/IS_EDIT}",
      enabled:{
        path:"/designTree/redo",
        formatter:function(params) {
          return params === true ? true : false;
        }
      },
      press: function(){
        parent.require(oAPP.oDesign.pathInfo.undoRedo).executeHistory("REDO");
      }
    }));

    oLTBar1.addContent(new sap.m.ToolbarSeparator());


    oLTBar1.addContent(new sap.m.ToolbarSpacer());

    
    if(parent.REMOTE.app.isPackaged === false){
      //AI 관련 테스트 버튼.
      // oLTBar1.addContent(new sap.m.Button({
      oLTBar1.addContent(new sap.m.OverflowToolbarButton({
        icon:"sap-icon://laptop",
        text:"AI 테스트",
        press: function(){

          // busy 키고 Lock 걸기
          oAPP.common.fnSetBusyLock("X");

          // 전체 자식 윈도우에 Busy 킨다.
          oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_ON"});

          //
          parent.require(parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, 
            "testFolder", "callAiInterfacePopup.js"))();
        }
      }));

    }

    
    //469	Web Dynpro Conversion Log
    var _txt = parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", "469"); 


    var _enabled = false;

    var _sUserInfo = parent.getUserInfo();

    //접속한 서버에 웹딘 -> U4A 컨버전 플러그인이 설치되어 있는경우 탭 활성화.
    if(_sUserInfo.META?.T_PLIST?.find?.( item => item === "U4A_CVT_WDR")){
      _enabled = true;
    }

    //#region WEBDYN 컨버전 로그 확인.
    //WEBDYN 컨버전 로그 확인 버튼.
    //#endregion 20251020 WEBDYN 컨버전 로그 확인.
    oLTBar1.addContent(new sap.m.OverflowToolbarButton({
      icon:"sap-icon://detail-view",
      text : _txt,
      tooltip: _txt,
      enabled: _enabled,
      press: function(){

        let oSettingsInfo = parent.getSettingsInfo();

        var _path = parent.PATH.join(oSettingsInfo.path.POPUP_ROOT, "webDynConversionLog", "index.js");

        parent.require(_path)(parent.REMOTE, oAPP);

      }
    }));


    //B39	Help
    //도움말 버튼.
    // var oLBtn8 = new sap.m.Button({icon:"sap-icon://question-mark", 
    var oLBtn8 = new sap.m.OverflowToolbarButton({icon:"sap-icon://question-mark", 
      // visible:parent.REMOTE.app.isPackaged ? false : true,
      text : oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39", "", "", "", "")});
    oLTBar1.addContent(oLBtn8);

    //도움말 버튼 선택 이벤트.
    oLBtn8.attachPress(function(){

      parent.setBusy("X");

      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      var l_ui = this;

      //attribute 도움말 팝업 function이 존재하는경우.
      if(typeof oAPP.fn.callTooltipsPopup !== "undefined"){
        //attribute 도움말 팝업 호출.
        //E21  Design Area
        oAPP.fn.callTooltipsPopup(l_ui, "designTooltip", "E21");
        return;
      }

      //attribute 도움말 팝업 function이 존재하지 않는경우 script 호출.
      oAPP.fn.getScript("design/js/callTooltipsPopup",function(){
        //attribute 도움말 팝업 호출.
        //E21  Design Area
        oAPP.fn.callTooltipsPopup(l_ui, "designTooltip", "E21");
      });

    }); //도움말 버튼 선택 이벤트.


    //context menu ui 생성 function이 존재하는경우.
    if(typeof oAPP.fn.callDesignContextMenu !== "undefined"){
      //context menu ui 생성 처리.
      oAPP.attr.ui.designMenu = oAPP.fn.callDesignContextMenu.call(this);
    }else{
      //context menu ui 생성 function이 존재하지 않는경우 script 호출.
      oAPP.fn.getScript("design/js/callDesignContextMenu",function(){
        //context menu ui 생성 처리.
        oAPP.attr.ui.designMenu = oAPP.fn.callDesignContextMenu.call(this);
      });

    }

    
    
    //context menu 호출 이벤트.
    oLTree1.attachBrowserEvent("contextmenu", async function(oEvent){

      parent.setBusy("X");

      var _oTarget = oEvent?.target || undefined;

      if(typeof _oTarget === "undefined"){
        parent.setBusy("");
        return;
      }

      var l_ui = oAPP.fn.getUiInstanceDOM(_oTarget, sap.ui.getCore());
      if(!l_ui){
        parent.setBusy("");
        return;
      }

      //해당 라인의 바인딩 정보 얻기.
      var l_ctxt = l_ui.getBindingContext();
      if(!l_ctxt){
        parent.setBusy("");
        return;
      }

      //tree 정보 얻기.
      var ls_tree = l_ctxt.getProperty();
      if(!ls_tree){
        parent.setBusy("");
        return;
      }


      //라인 선택 처리.
      await oAPP.fn.setSelectTreeItem(ls_tree.OBJID);


      //context menu 호출전 메뉴 선택 가능 여부 설정.
      oAPP.fn.enableDesignContextMenu(oAPP.attr.ui.designMenu, ls_tree.OBJID);


      parent.setBusy("");


      //20250211 PES -START.
      //oMenu.openBy전 busy off처리를 수행을 기다린뒤
      //oMenu.openBy처리 하기위해 로직 추가.
      //busy off 처리 후 즉시 메뉴를 호출하게 되면
      //메뉴가 종료되는 문제가 존재하기에 예외 로직 추가.
      await new Promise((res)=>{
        setTimeout(() => {
          res();
        }, 0);
      });
      //20250211 PES -END.


      //메뉴 호출 처리.
      oAPP.attr.ui.designMenu.openBy(_oTarget);


    }); //context menu 호출 이벤트.

    
    
    //design tree 스크롤 이벤트.
    oLTree1.attachFirstVisibleRowChanged(function(){
      
      //context menu가 open되어있다면 close 처리.
      oAPP.fn.contextMenuClosePopup(oAPP.attr.ui.designMenu);

      //drop 가능 여부에 따른 라인 css 처리.
      oAPP.fn.designSetDropStyle();

      //현재 선택된 DOM focus out 처리.
      document.activeElement.blur();

    }); //design tree 스크롤 이벤트.


    oLTree1.bindAggregation("rows", {path:"/zTREE", template:new sap.ui.table.Row(), parameters:{arrayNames:["zTREE"]}});

    
    //tree의 라인 선택 표시를 위한 UI 추가.
    oLTree1.setRowSettingsTemplate(new sap.ui.table.RowSettings({highlight:"{highlight}"}));


  };  //좌측 페이지(UI Design 영역) 구성.



  /*************************************************************
   * @function - design tree row 선택 이벤트.
   *************************************************************/
  oAPP.fn.onDesignTreeRowSelChange = function(oEvent){

    //라인선택이 해제 안된경우 EXIT.
    if(this.getSelectedIndex() !== -1){return;}

    if(typeof oEvent?.mParameters?.rowIndex === "undefined"){
      return;
    }

    var l_indx = oEvent?.mParameters?.rowIndex;

    if(typeof oEvent?.mParameters?.rowIndices !== "undefined" && oEvent?.mParameters?.rowIndices?.length !== 0){
      l_indx = oEvent.mParameters.rowIndices[0];
    }

    //라인 선택이 해제 된경우 이벤트 발생 라인 선택 처리.
    this.setSelectedIndex(l_indx);

    var l_bind = oAPP.attr.ui.oLTree1.getBinding();
    if(!l_bind){return;}

    var l_ctxt = l_bind.getContextByIndex(l_indx);
    if(!l_ctxt){return;}

    var ls_tree = l_ctxt.getProperty();
    if(!ls_tree){return;}

    //design tree의 라인 이동 처리.
    oAPP.fn.desginSetFirstVisibleRow(l_indx, ls_tree);

  };



  //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
  oAPP.fn.setBindPopupDragAppData = function(is_drag){

    var _aTree = JSON.parse(JSON.stringify([is_drag]));

    oAPP.attr.POSIT = 0;

    //UI POSTION 정보 재매핑 처리.
    oAPP.fn.setUIPOSIT(_aTree);

    oAPP.attr.POSIT = 0;

    //선택한 라인을 기준으로 tree -> table화.
    var _aTree = oAPP.fn.parseTree2Tab(_aTree);

    
    //POSITION 으로 정렬처리.
    _aTree.sort(function(a,b){
      return a.POSIT - b.POSIT;
    });

    var _sRes = {
      T_0014 : [],
      T_0015 : [],
      T_CEVT : [],
    };

    for (let i = 0, l = _aTree.length; i < l; i++) {
      
      var _sTree = _aTree[i];

      var _s0014 = oAPP.fn.crtStru0014();

      _s0014.APPID   = _sTree.APPID;
      _s0014.GUINR   = _sTree.GUINR;
      _s0014.OBJID   = _sTree.OBJID;
      _s0014.POSIT   = _sTree.POSIT;
      _s0014.POBID   = _sTree.POBID;
      _s0014.UIOBK   = _sTree.UIOBK;
      _s0014.PUIOK   = _sTree.PUIOK;
      _s0014.ISAGR   = _sTree.ISAGR;
      _s0014.AGRID   = _sTree.AGRID;
      _s0014.ISDFT   = _sTree.ISDFT;
      _s0014.OBDEC   = _sTree.OBDEC;
      _s0014.AGTYP   = _sTree.AGTYP;
      _s0014.UIATK   = _sTree.UIATK;
      _s0014.UIATT   = _sTree.UIATT;
      _s0014.UIASN   = _sTree.UIASN;
      _s0014.UIATY   = _sTree.UIATY;
      _s0014.UIADT   = _sTree.UIADT;
      _s0014.UIADS   = _sTree.UIADS;
      _s0014.VALKY   = _sTree.VALKY;
      _s0014.ISLST   = _sTree.ISLST;
      _s0014.ISMLB   = _sTree.ISMLB;
      _s0014.TOOLB   = _sTree.TOOLB;
      _s0014.UIFND   = _sTree.UIFND;
      _s0014.PUIATK  = _sTree.PUIATK;
      _s0014.UILIB   = _sTree.UILIB;
      _s0014.ISEXT   = _sTree.ISEXT;
      _s0014.TGLIB   = _sTree.TGLIB;
      _s0014.DEL_UOK = _sTree.DEL_UOK;
      _s0014.DEL_POK = _sTree.DEL_POK;
      _s0014.ISECP   = _sTree.ISECP;

      _sRes.T_0014.push(_s0014);


      var _aT0015 = oAPP.attr.prev[_s0014.OBJID]._T_0015;

      for (let j = 0, jl = _aT0015.length; j < jl; j++) {
        
        var _s0015t = _aT0015[j];

        //ZSU4A0015 구조 생성.
        var _s0015 = oAPP.fn.crtStru0015();

        _s0015.APPID    = _s0015t.APPID;
        _s0015.GUINR    = _s0015t.GUINR;
        _s0015.OBJID    = _s0015t.OBJID;
        _s0015.UIATK    = _s0015t.UIATK;
        _s0015.UIATV    = _s0015t.UIATV;
        _s0015.ISBND    = _s0015t.ISBND;
        _s0015.UILIK    = _s0015t.UILIK;
        _s0015.UIOBK    = _s0015t.UIOBK;
        _s0015.UIATT    = _s0015t.UIATT;
        _s0015.UIASN    = _s0015t.UIASN;
        _s0015.UIADT    = _s0015t.UIADT;
        _s0015.RVALU    = _s0015t.RVALU;
        _s0015.BPATH    = _s0015t.BPATH;
        _s0015.ADDSC    = _s0015t.ADDSC;
        _s0015.UIATY    = _s0015t.UIATY;
        _s0015.ISMLB    = _s0015t.ISMLB;
        _s0015.ISEMB    = _s0015t.ISEMB;
        _s0015.DEL_LIB  = _s0015t.DEL_LIB;
        _s0015.DEL_UOK  = _s0015t.DEL_UOK;
        _s0015.DEL_ATT  = _s0015t.DEL_ATT;
        _s0015.ISWIT    = _s0015t.ISWIT;
        _s0015.ISSPACE  = _s0015t.ISSPACE;
        _s0015.FTYPE    = _s0015t.FTYPE;
        _s0015.REFFD    = _s0015t.REFFD;
        _s0015.CONVR    = _s0015t.CONVR;
        _s0015.MPROP    = _s0015t.MPROP;

        _sRes.T_0015.push(_s0015);
        
      }

    }

    //클라이언트 이벤트(HTML CONTENT) 정보 매핑.
    _sRes.T_CEVT = JSON.parse(JSON.stringify(oAPP.DATA.APPDATA.T_CEVT));

    return _sRes;

  };


  //바인딩 팝업에서 UI 구성을 위한 design tree 데이터 구성.
  oAPP.fn.setDragAppData = function(is_drag){
    
    //WS 3.0 메인 PATH 얻기.
    var _channelPath = parent.getPath("WS10_20_ROOT");

    //디자인상세화면(20화면) <-> BINDPOPUP 통신 모듈 PATH 구성.
    _channelPath = parent.PATH.join(_channelPath, "design", "bindPopupHandler", "setDragBindPopupData.js");

    //바인딩 팝업에 APP DATA 전송.
    parent.require(_channelPath)(is_drag);

  };


  //바인딩 팝업의 디자인 영역 갱신처리.
  oAPP.fn.updateBindPopupDesignData = async function(){

    //바인딩 팝업에 APP DATA 전송.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("UPDATE-DESIGN-DATA");

  };
  

  //design tree의 drag over 이벤트.
  oAPP.fn.designDragOver = function(oEvent){

    //현재 ui의 하단에 drag가 된 상황이면.
    if(oEvent.mParameters.dropPosition === "After"){
      
      //drag over한 ui 정보 얻기.
      var l_row = oEvent.mParameters.dragSession.getDropControl();
      if(!l_row){return;}

      //drag over한 UI의 바인딩 정보 얻기.
      var l_ctxt = l_row.getBindingContext();
      if(!l_ctxt){return;}

      var l_dragover = l_ctxt.getProperty();


      //DRAG한 UI의 OBJID 매핑건이 없는경우 EXIT.
      if(!oAPP.attr.ui.oLTree1.__isdragOBJID){
        oEvent.oSource.setDropEffect("None");
        return;
      }

      //OBJID에 해당하는 TREE 라인 정보 얻기.
      l_drag = oAPP.fn.getTreeData(oAPP.attr.ui.oLTree1.__isdragOBJID);
      if(!l_drag){
        oEvent.oSource.setDropEffect("None");
        return;
      }

      //내 밑에 들어갈 수 없다면 drop 불가 처리.
      if(oAPP.fn.chkAggrRelation(l_dragover.UIOBK, l_dragover.OBJID, l_drag.UIOBK).length === 0){
        oEvent.oSource.setDropEffect("None");
        return;
      }

    }
    

    //default move 표시.
    var l_effect = "Move";

    //컨트롤키 눌렀다면.
    if(event.ctrlKey){
      //copy 표시.
      l_effect = "Copy";
    }
    
    //drop effect 설정.
    oEvent.oSource.setDropEffect(l_effect);

    //tree에 drop effect 설정.
    oAPP.attr.ui.oLTree1.__dropEffect = l_effect;


  };  //design tree의 drag over 이벤트.




  //팝업 수집건 제거 처리.
  oAPP.fn.removeCollectPopup = function(OBJID){

    //팝업 수집건이 존재하지 않는경우 exit.
    if(oAPP.attr.popup.length === 0){return;}

    //팝업 수집건에 입력 OBJID에 해당하는건 검색.
    var l_indx = oAPP.attr.popup.findIndex(a=> a._OBJID === OBJID);

    //찾지못한 경우 EXIT.
    if(l_indx === -1){return;}

    //찾은경우 해당 라인 제거 처리.
    oAPP.attr.popup.splice(l_indx, 1);

  };  //팝업 수집건 제거 처리.




  /************************************************************************
   * 라인 선택건 점검 처리.
   * **********************************************************************
   * @param {string} uName - wizard에서 생성처리할 UI명 구분자.
   * @return {object} 점검 처리결과.
   ************************************************************************/
  oAPP.fn.designChkSelLine = function(uName){

    var ls_ret = {SUBRC:"", MSG:""};

    //선택 라인 정보 얻기.
    var l_indx = oAPP.attr.ui.oLTree1.getSelectedIndex();

    //선택한 라인이 존재하지 않는경우 오류 메시지 처리.
    if(l_indx === -1){
      ls_ret.SUBRC = "E";
      //268  Selected line does not exists.
      ls_ret.MSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", "");
      return ls_ret;
    }

    //선택 라인의 tree 정보 얻기.
    var ls_tree = oAPP.attr.ui.oLTree1.getContextByIndex(l_indx).getProperty();

    //ROOT를 선택한 경우 오류 메시지 처리.
    if(ls_tree.OBJID === "ROOT"){
      ls_ret.SUBRC = "E";
      //A36  ROOT
      //056	& is not the target location.
      ls_ret.MSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "056", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A36", "", "", "", ""), "", "", "");
      return ls_ret;

    }

    //wizard 생성 유형이 입력안된경우 점검 결과 구조 RETURN.
    if(!uName){return ls_ret;}


    //wizard 생성 유형이 입력된경우.
    var l_UIOBK = "";
    switch (uName) {
      case "sap.m.Table":
        l_UIOBK = "UO00447";
        break;
      
      case "sap.ui.table.Table":
        l_UIOBK = "UO01139";
        break;

      case "sap.ui.table.TreeTable":
        l_UIOBK = "UO01142";
        break;

      case "LayoForm_01":
        l_UIOBK = "UO01001";
        break;

      case "SimpleForm":
        l_UIOBK = "UO01010";
        break;

      default:
        return ls_ret;
    }


    //UI를 추가 가능한 Aggregation 존재여부 확인.
    if(oAPP.fn.chkAggrRelation(ls_tree.UIOBK, ls_tree.OBJID, l_UIOBK).length === 0){
      ls_ret.SUBRC = "E";
      //280  입력 가능한 Aggregation이 존재하지 않습니다.
      ls_ret.MSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "280", "", "", "", "");

      //오류 정보 RETURN.
      return ls_ret;

    }

    //오류가 존재하지 않는경우 초기 구조 return.
    return ls_ret;

  };  //라인 선택건 점검 처리.




  /************************************************************************
   * design tree의 선택한 라인 정보 얻기.
   * **********************************************************************
   * @return {object} 선택한 라인 정보.
   ************************************************************************/
  oAPP.fn.designGetSelectedTreeItem = function(){

    //선택 라인 정보 얻기.
    var l_indx = oAPP.attr.ui.oLTree1.getSelectedIndex();
    if(l_indx === -1){
      return oAPP.fn.getTreeData(oAPP.attr.oModel.oData.uiinfo.OBJID);
    }

    //선택한 라인 정보값 return.
    return oAPP.attr.ui.oLTree1.getContextByIndex(l_indx).getProperty();


  };  //design tree의 선택한 라인 정보 얻기.




  //입력 UI OBJECT가 target UI OBJECT에 추가 가능한지 여부 확인.
  oAPP.fn.chkAggrRelation = function(tUIOBK, tOBJID, sUIOBK){

    var lt_sel = [];

    //입력 UI OBJECT KEY의 AGGREGATION 정보 얻기.
    var lt_0023 = oAPP.DATA.LIB.T_0023.filter(a => a.UIOBK === tUIOBK && a.UIATY === "3" && a.ISDEP !== "X" );


    //UI의 하위 AGGR 정보가 존재하지 않는경우 EXIT.
    if(lt_0023.length === 0){
      return lt_sel;
    }

    //입력 UI OBJECT의 상속관계 정보 얻기.
    var lt_0027 = oAPP.DATA.LIB.T_0027.filter( a => a.TGOBJ === sUIOBK && a.TOBTY !== "1" );

    //상속관계 정보가 존재하지 않는경우 exit.
    if(lt_0027.length === 0){
      return lt_sel;
    }

    //target AGGREGATION을 기준으로 점검.
    for(var i=0, l = lt_0023.length; i<l; i++){

      //get aggregation명 얻기.
      var l_agrnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[tOBJID], "3", lt_0023[i].UIATT, "_sGetter");

      //대상 UI의 AGGREGATION이 존재하지 않는경우 SKIP.
      if(!l_agrnm || !oAPP.attr.prev[tOBJID][l_agrnm]){continue;}

      //해당 aggregation의 child 정보 얻기.
      var l_child = oAPP.attr.prev[tOBJID][l_agrnm]();


      //해당 aggregation에 n건 바인딩이 설정된 경우
      //child UI가 이미 존재하는 경우 skip.
      if(oAPP.attr.prev[tOBJID]._MODEL[lt_0023[i].UIATT] &&
        (l_child !== null && l_child.length !== 0)){
        continue;
      }

      //0:1 aggregation에 이미 ui가 존재하는 경우 skip.
      //l_child._OBJID를 판단하는 이유는 공통코드 UA050항목에 의해
      //강제로 추가된 CHILD UI인경우 SKIP 처리를 하지 않기 위함.
      if(lt_0023[i].ISMLB === "" && l_child && typeof l_child._OBJID !== "undefined" ){
        continue;
      }

      //aggregation 타입 대문자 전환(SAP.UI.CORE.CONTROL)
      var l_upper = lt_0023[i].UIADT.toUpperCase();

      //라이브러리 테이블에서 해당 UI 검색.
      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIFND === l_upper);
      if(!ls_0022){continue;}

      //drag UI가 drop UI의 aggregation type과 동일한경우 수집 처리.
      if(sUIOBK === ls_0022.UIOBK){
        lt_sel.push(lt_0023[i]);
        continue;
      }

      ls_0027 = lt_0027.find( b => b.SGOBJ === ls_0022.UIOBK);
      if(!ls_0027){continue;}
      lt_sel.push(lt_0023[i]);

    }

    return lt_sel;


  };  //입력 UI OBJECT가 target UI OBJECT에 추가 가능한지 여부 확인.



  
  //tree embeded aggregation 아이콘 표현.
  oAPP.fn.setTreeAggrIcon = function(is_tree){
    
    //EMBED AGGREGATION 정보가 없는경우 exit.
    if(is_tree.UIATK === ""){return;}

    //DEFAULT 0:1 AGGREGATION 표현 아이콘.
    is_tree.UIATT_ICON = "sap-icon://color-fill";

    //0:N AGGREGATION인경우.
    if(is_tree.ISMLB === "X"){
      //MULTI 입력 표현 아이콘.
      is_tree.UIATT_ICON = "sap-icon://dimension";
    }

  };  //tree embeded aggregation 아이콘 표현.




  //[워크벤치] 특정 API / UI 에 대한 중복 대상 관리
  oAPP.fn.designChkUnique = function(UIOBK, iCnt){
    
    //[워크벤치] 특정 API / UI 에 대한 중복 대상 관리 여부건인지 확인.
    var ls_UA039 = oAPP.DATA.LIB.T_9011.find( a=> a.CATCD === "UA039" && a.FLD02 === UIOBK && a.FLD04 === "X");
    if(!ls_UA039){
      //대상건이 아닌경우 exit.
      return;
    }

    //생성 count 파라메터가 존재하는경우 2개 이상을 입력했다면 오류 flag 처리.
    if(typeof iCnt !== "undefined" && iCnt >= 2){
      //130	Target API and UI &1 does not allow one or more assign.
      parent.showMessage(sap,10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "130", ls_UA039.FLD01, "", "", ""));
      return true;
    }

    //design tree를 itab으로 변환.
    var lt_tree = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);

    if(!lt_tree){return;}

    //이미 해당 UI가 추가됐는지 확인.
    if(lt_tree.findIndex( a => a.UIOBK === UIOBK) !== -1){
      //추가 됐다면 존재함 flag return.
      //130	Target API and UI &1 does not allow one or more assign.
      parent.showMessage(sap,10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "130", ls_UA039.FLD01, "", "", ""));
      return true;
    }


  };  //[워크벤치] 특정 API / UI 에 대한 중복 대상 관리




  //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보
  oAPP.fn.designChkHiddenAreaUi = function(UIOBK, PUIOK, UIATT){

    //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 여부 확인.
    var ls_UA040 = oAPP.DATA.LIB.T_9011.find( a=> a.CATCD === "UA040" && a.FLD01 === UIOBK && a.FLD07 !== "X" );

    //대상건이 아닌경우 exit.
    if(!ls_UA040){return;}

    //U4A_HIDDEN_AREA DIV 영역에 추가대상건인경우 추가 가능한 부모 UI OBJECT KEY가 다르다면.
    if(ls_UA040.FLD04 !== PUIOK){
      //131	Target API and UI &1 can only target Location &2.
      parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "131", ls_UA040.FLD03, ls_UA040.FLD06, "", ""));
      return true;

    }

  } //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보




  //UI의 허용 가능 부모 정보
  //(특정 UI는 특정 부모에만 존재해야함.)
  oAPP.fn.designChkFixedParentUI = function(UIOBK, PUIOK, UIATT){

    //현재 UI가 특정 부모에만 존재해야하는건인지 확인.
    var lt_UW03 = oAPP.attr.S_CODE.UW03.filter( a=> a.FLD01 === UIOBK && a.FLD06 !== "X" );
    if(lt_UW03.length === 0){return;}

    //특정부모만 가능한경우 입력 부모 UIOBK가 해당되는지 확인.
    if(lt_UW03.findIndex( a=> a.FLD03 === PUIOK && a.FLD05 === UIATT) === -1){

      //해당되지 않는다면 오류 메시지 처리.
      var lt_msg = [];
      for(var i=0, l=lt_UW03.length; i<l; i++){
        lt_msg.push(lt_UW03[i].FLD04 + "-" + lt_UW03[i].FLD05);
      }

      //306	&1 UI is only allowed for &2 parent.
      parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "306", lt_UW03[0].FLD02, lt_msg.join(", "), "", ""));
      return true;

    }

  };  //UI의 허용 가능 부모 정보




  /************************************************************************
   * UI design tree 영역 UI에 따른 ICON 세팅.
   * **********************************************************************
   * @param {object} is_tree - 처리대상 tree 라인.
   ************************************************************************/
  oAPP.fn.setTreeUiIcon = function(is_tree){

    //tree embeded aggregation 아이콘 표현.
    oAPP.fn.setTreeAggrIcon(is_tree);

    //UI 라이브러리 정보 검색.
    var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === is_tree.UIOBK );
    
    //검색성공시 해당 아이콘 얻기.
    if(typeof ls_0022 !== "undefined" && ls_0022.UICON !== ""){
      is_tree.UICON = oAPP.fn.fnGetSapIconPath(ls_0022.UICON);

    }

    //default 아이콘 비활성 처리.
    is_tree.icon_visible = false;

    if(typeof is_tree.UICON !== "undefined" && is_tree.UICON !== ""){
      //아이콘이 존재하는경우 아이콘 활성 처리.
      is_tree.icon_visible = true;
    }

    if(is_tree.zTREE.length === 0){return;}

    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      oAPP.fn.setTreeUiIcon(is_tree.zTREE[i]);
    }

  };  //UI design tree 영역 UI에 따른 ICON 세팅.




  //drag 종료 처리.
  oAPP.fn.designDragEnd = function(){

    //tree drag & drop 가능여부 처리.
    oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);
    oAPP.attr.oModel.refresh();

    //drag 종료시 drop 불가능 css 제거 처리.
    oAPP.fn.designSetDropStyle(true);

    //DRAG START 구분자 제거.
    delete oAPP.attr.ui.oLTree1.__isdragStarted;

    //미리보기 영역 drop 영역 표시 잔상 제거.
    oAPP.attr.ui.frame.contentWindow.prevClearDropEffect();

    //호출된 dialog 정보 얻기.
    var _aDialog = sap.m.InstanceManager.getOpenDialogs();

    if(typeof _aDialog === "undefined" || _aDialog.length === 0){
      return;
    }

    
    //open된 dialog중 insert UI Popup 존재여부 확인.
    var _oDialog = _aDialog.find( oUi => oUi.data && oUi.data("INSERT_UI_POPUP") === true);

    if(typeof _oDialog === "undefined" || _oDialog === null){
      return;
    }

    //insert UI Popup UI의 결과리스트 table 정보 얻기
    var _oTable = _oDialog.data("INSERT_UI_POPUP_TABLE");

    if(typeof _oTable === "undefined" || _oTable === null){
      return;
    }

    var _aRows = _oTable.getRows();

    //insert UI Popup 결과리스트 테이블의 drag 잔상 css 제거.
    for (let i = 0, l = _aRows.length; i < l; i++) {
      var _oRow = _aRows[i];

      _oRow.removeStyleClass("sapUiDnDDragging");
      
    }
     

  };  //drag 종료 처리.

  
  //visible, editable등의 tree 처리 전용 바인딩 필드 생성 처리.
  oAPP.fn.crtTreeBindField = function(is_0014){

    is_0014.drag_enable = true;  //tree item drag 가능여부 필드
    is_0014.drop_enable = oAPP.attr.oModel.oData.IS_EDIT;  //tree item drop 가능여부 필드

    is_0014.chk_visible = oAPP.attr.oModel.oData.IS_EDIT;  //chkbox 활성여부 필드.

    is_0014.chk = false; //chkbox checked 바인딩 필드.

    is_0014.UICON = ""; //ui icon 바인딩 필드.

    is_0014.UIATT_ICON = ""; //aggregation cardinality 아이콘.
    
    is_0014.icon_visible = false; // icon 활성여부 필드.

    is_0014.highlight = "None"; //highlight 표현 필드.

    //TREE 하위 정보 구성.
    if(typeof is_0014.zTREE === "undefined"){
      is_0014.zTREE = []; //하위 TREE 정보
    }

  };  //visible, editable등의 tree 처리 전용 바인딩 필드 생성 처리.




  //체크박스 활성여부 처리.
  oAPP.fn.setTreeChkBoxEnable = function(is_tree){

    //default checkbox 비활성 처리.
    is_tree.chk_visible = false;

    //체크 선택 해제 처리.
    is_tree.chk = false;


    //편집 모드인경우 checkbox 활성 처리.
    if(oAPP.attr.appInfo.IS_EDIT === "X"){
      is_tree.chk_visible = true;
    }

    //root, APP는 체크박스 비활성 처리.
    if(is_tree.OBJID === "ROOT" || is_tree.OBJID === "APP"){
      is_tree.chk_visible = false;

    }

    //하위 UI가 존재하지 않는경우 exit.
    if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

    //하위 UI가 존재하는경우 재귀호출을 통해 checkbox 활성여부 처리.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      oAPP.fn.setTreeChkBoxEnable(is_tree.zTREE[i]);
    }

  };  //체크박스 활성여부 처리.




  //체크박스 전체 선택 해제 처리.
  oAPP.fn.designClearCheckAll = function(){

    //체크박스 선택 해제 재귀호출 function.
    function lf_clearChkRec(is_tree){

      //체크 선택 헤제 처리.
      is_tree.chk = false;

      //child가 존재하지 않는경우 exit.
      if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

      //chiled가 존재하는경우 하위를 탐색하며 checkbox 선택 해제 처리.
      for (var i=0, l=is_tree.zTREE.length; i<l; i++){

        lf_clearChkRec(is_tree.zTREE[i]);

      }

    } //체크박스 선택 해제 재귀호출 function.

    //화면 잠금 처리.
    oAPP.fn.designAreaLockUnlock(true);

    //ROOT를 시작으로 하위를 탐색하며 checkbox 선택 해제 처리.
    lf_clearChkRec(oAPP.attr.oModel.oData.zTREE[0]);

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh();

    //화면 잠금 해제 처리.
    oAPP.fn.designAreaLockUnlock();

  };  //체크박스 전체 선택 해제 처리.




  //tree drag & drop 가능여부 처리.
  oAPP.fn.setTreeDnDEnable = function(is_tree){

    //drag는 default 가능처리(display 상태일때도, runtime class navigator 기능 때문)
    is_tree.drag_enable = true;

    //drop는 현재 편집 가능상태일때만 drop 가능 처리.
    is_tree.drop_enable = oAPP.attr.oModel.oData.IS_EDIT;

    //root는 drag & drop 불가.
    if(is_tree.OBJID === "ROOT"){
      is_tree.drag_enable = false;
      is_tree.drop_enable = false;

    }

    //하위 UI가 존재하지 않는경우 exit.
    if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

    //하위 UI가 존재하는경우 재귀호출을 통해 drag & drop 가능여부 처리.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      oAPP.fn.setTreeDnDEnable(is_tree.zTREE[i]);
    }

  };  //tree drag & drop 가능여부 처리.




  //row Action Icon의 활성여부 설정.
  oAPP.fn.designSetActionIcon = function(is_tree){

    //default insert UI 버튼 편집 여부에 따른 활성화 처리.
    is_tree.visible_add = oAPP.attr.oModel.oData.IS_EDIT;

    //default delete UI 버튼 편집 여부에 따른 활성화 처리.
    is_tree.visible_delete = oAPP.attr.oModel.oData.IS_EDIT;

    //ROOT는 추가, 삭제 불가능.
    if(is_tree.OBJID === "ROOT"){

      //insert UI 버튼 비활성화 처리.
      is_tree.visible_add = false;

      //delete UI 버튼 비활성화 처리.
      is_tree.visible_delete = false;
    
    }else if(is_tree.OBJID === "APP"){
      //최상위 APP는 삭제 불가능.

      //delete UI 버튼 비활성화 처리.
      is_tree.visible_delete = false;
    }

    if(!is_tree.zTREE?.length){return;}

    //child 정보가 존재하는경우 하위를 탐색하며 아이콘 활성여부 설정.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      oAPP.fn.designSetActionIcon(is_tree.zTREE[i]);
    }

  };  //row Action Icon의 활성여부 설정.



  
  //tree 정보에서 UI명에 해당하는건 검색.
  oAPP.fn.getTreeData = function(OBJID, is_tree){
    //최초 호출상태인경우.
    if(typeof is_tree === "undefined"){
      //ROOT를 매핑.
      is_tree = oAPP.attr.oModel.oData.zTREE[0];
    }

    //현재 TREE가 검색대상건인경우 해당 TREE정보 RETURN.
    if(is_tree.OBJID === OBJID){
      return is_tree;
    }

    //child가 존재하지 않는경우 exit.
    if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

    //현재 TREE가 검색대상이 아닌경우 CHILD를 탐색하며 OBJID에 해당하는 TREE정보 검색.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      
      var ls_tree = oAPP.fn.getTreeData(OBJID, is_tree.zTREE[i]);
      if(typeof ls_tree  !== "undefined"){
        return ls_tree;
      }

    }    

  };  //tree 정보에서 UI명에 해당하는건 검색.




  //입력 OBJID가 부모의 몇번째 INDEX인지 확인.
  oAPP.fn.getTreeIndexOfChild = function(OBJID){

    //child를 탐색하며 OBJID의 위치 정보 확인.
    function lf_findItem(it_tree){

      //TREE에 값이 없는경우 EXIT.
      if(it_tree.length === 0){return;}

      //TREE 정보중 입력 OBJID건 존재여부 확인.
      for(var i=0, l=it_tree.length; i<l; i++){

        //현재 정보가 입력 OBJID와 동일한경우.
        if(it_tree[i].OBJID === OBJID){
          //해당 INDEX 정보 RETURN.
          return i;
        }

        //재귀호출을 통해 입력 OBJID에 해당하는 INDEX 정보 검색.
        var l_index = lf_findItem(it_tree[i].zTREE);

        //INDEX 정보를 찾은경우 RETURN.
        if(typeof l_index !== "undefined"){return l_index;}

      }

    } //child를 탐색하며 OBJID의 위치 정보 확인.


    //TREE를 탐색하며 입력 OBJID의 INDEX 정보 찾기.
    return lf_findItem(oAPP.attr.oModel.oData.zTREE);


  };  //입력 OBJID가 부모의 몇번째 INDEX인지 확인.



  //tree item 펼침 처리.
  oAPP.fn.expandTreeItem = function(){

    //화면 잠금 처리.
    oAPP.fn.designAreaLockUnlock(true);

    //선택한 라인을 기준으로 하위를 탐색하며 펼침 처리.
    function lf_expand(){

      //처리대상 라인의 node 정보 얻기.
      var l_node = l_bind.getNodeByIndex(l_indx);

      //node를 찾지 못한 경우 exit(모든 node 탐색).
      if(typeof l_node === "undefined"){return;}

      //선택한 라인에서 파생된건이 아닌경우 exit.
      if(l_group !== l_node.groupID.substr(0, l_group.length)){return;}
      
      //현재 node의 child가 존재, 해당 node가 펼쳐져있지 않다면.
      if(l_node.isLeaf === false && l_node.nodeState.expanded === false){
        //해당위치 펼침 처리.
        oAPP.attr.ui.oLTree1.expand(l_indx);

      }

      //다음 라인 정보 구성.
      l_indx += 1;

      //하위를 탐색하며 tree 펼첨 처리.
      lf_expand();
      
    } //선택한 라인을 기준으로 하위를 탐색하며 펼침 처리.


    //선택한 라인 index 얻기.
    var l_indx = oAPP.attr.ui.oLTree1.getSelectedIndex();

    //선택한 라인이 없는경우 exit.
    if(l_indx === -1){
      //화면 잠금 해제 처리.
      oAPP.fn.designAreaLockUnlock();
      return;
    }

    //tree 바인딩 정보 얻기.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding();

    if(typeof l_bind === "undefined" || l_bind === null){
      //화면 잠금 해제 처리.
      oAPP.fn.designAreaLockUnlock();
      return;
    }

    //선택한 라인의 바인딩 정보 얻기.
    var l_group = l_bind.getNodeByIndex(l_indx).groupID;

    //선택한 라인을 기준으로 하위를 탐색하며 펼침 처리.
    lf_expand();


    //화면 잠금 해제 처리.
    oAPP.fn.designAreaLockUnlock();


  };  //tree item 펼침 처리.




  //삭제 대상 UI의 클라이언트 이벤트 및 sap.ui.core.HTML의 content 수집 정보 삭제 처리.
  oAPP.fn.delUiClientEvent = function(is_tree){

    //클라이언트 이벤트가 존재하지 않는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    //프로퍼티 설정건이 존재하지 않는경우 EXIT.
    if(oAPP.attr.prev[is_tree.OBJID]._T_0015.length === 0){return;}


    //sap.ui.core.HTML UI인경우.
    if(is_tree.UIFND === "SAP.UI.CORE.HTML"){
      //content 프로퍼티에 직접 입력한 내용이 존재하는지 확인.
      var l_findx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_tree.OBJID + "CONTENT" && a.OBJTY === "HM");

      if(l_findx !== -1){
        //해당 HTML 삭제 처리.
        oAPP.DATA.APPDATA.T_CEVT.splice(l_findx, 1);
      }

    }

    //이벤트 설정건 존재여부 확인.
    var lt_evt = oAPP.attr.prev[is_tree.OBJID]._T_0015.filter( a => a.UIATY === "2" );

    //이벤트 설정건이 없는경우 exit.
    if(lt_evt.length === 0){return;}

    for(var i=0, l=lt_evt.length; i<l; i++){

      //클라이언트 이벤트 설정건 존재여부 확인.
      var l_findx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_tree.OBJID + lt_evt[i].UIASN && a.OBJTY === "JS");

      //설정건이 없는경우 continue
      if(l_findx === -1){continue;}

      //클라이언트 이벤트가 존재하는경우 해당 이벤트 삭제 처리.
      oAPP.DATA.APPDATA.T_CEVT.splice(l_findx, 1);

    }

  };  //삭제 대상 UI의 클라이언트 이벤트 및 sap.ui.core.HTML의 content 수집 정보 삭제 처리.




  //대상 UI의 클라이언트 이벤트 존재건 검색.
  oAPP.fn.getUiClientEvent = function(is_tree){

    //클라이언트 이벤트가 존재하지 않는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    var lt_CEVT = [];

    //sap.ui.core.HTML UI인경우.
    if(is_tree.UIFND === "SAP.UI.CORE.HTML"){
      //content 프로퍼티에 직접 입력한 내용이 존재하는지 확인.
      var l_findx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_tree.OBJID + "CONTENT" && a.OBJTY === "HM");

      if(l_findx !== -1){
        //해당 HTML 수집 처리.
        lt_CEVT.push(oAPP.DATA.APPDATA.T_CEVT[l_findx]);
      }

    }

    //이벤트 설정건 존재여부 확인.
    var lt_evt = oAPP.attr.prev[is_tree.OBJID]._T_0015.filter( a => a.UIATY === "2" );

    //이벤트 설정건이 없는경우 exit.
    if(lt_evt.length === 0){
      return lt_CEVT.length === 0 ? undefined : lt_CEVT;
    }


    for(var i=0, l=lt_evt.length; i<l; i++){

      //클라이언트 이벤트 설정건 존재여부 확인.
      var l_findx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_tree.OBJID + lt_evt[i].UIASN && a.OBJTY === "JS");

      //설정건이 없는경우 continue
      if(l_findx === -1){continue;}

      //클라이언트 이벤트가 존재하는경우 해당 이벤트 삭제 처리.
      lt_CEVT.push(oAPP.DATA.APPDATA.T_CEVT[l_findx]);

    }

    return lt_CEVT.length === 0 ? undefined : lt_CEVT;


  };  //대상 UI의 클라이언트 이벤트 존재건 검색.




  //클라이언트 이벤트, HTML정보 복사 처리.
  oAPP.fn.copyUiClientEvent = function(OBJID, is_tree){

    //클라이언트 이벤트, HTML정보가 한건도 없는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    //원본 UI의 HTML정보, 클라이언트 이벤트 존재여부 확인.
    var lt_event = oAPP.attr.prev[OBJID]._T_0015.filter( a=> a.ADDSC !== "");

    //원본 UI의 HTML정보, 클라이언트 이벤트가 없는경우 exit.
    if(lt_event.length === 0){return;}

    var ls_copy = {};

    //원본 UI의 HTML정보, 클라이언트 이벤트 기준으로 복사처리.
    for(var i=0, l=lt_event.length; i<l; i++){

      //HTML정보, 클라이언트 이벤트 정보 검색.
      var ls_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a=> a.OBJID === lt_event[i].OBJID + lt_event[i].UIASN );

      //HTML정보, 클라이언트 이벤트 정보가 없는경우 skip.
      if(typeof ls_cevt === "undefined"){continue;}

      //복사할 UI명 + attribute 대문자명.
      ls_copy.OBJID = is_tree.OBJID + lt_event[i].UIASN;

      //유형(HM:HTML, CS:CSS, JS:javascript)
      ls_copy.OBJTY = ls_cevt.OBJTY;

      //HTML정보, 클라이언트 이벤트 SCRIPT.
      ls_copy.DATA = ls_cevt.DATA;

      oAPP.DATA.APPDATA.T_CEVT.push(ls_copy);
      ls_copy = {};

    }


  };  //클라이언트 이벤트, HTML정보 복사 처리.



  //tree item 선택 처리
  oAPP.fn.setSelectTreeItem = function(OBJID, UIATK, TYPE){

    return new Promise(async (resolve)=>{

      // //tree item 선택 처리전 화면 잠금 처리.
      // oAPP.fn.designAreaLockUnlock(true);

      parent.setBusy("X");

      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      // 전체 자식 윈도우에 Busy 킨다.
      oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_ON"});
      
      
      //tree를 탐색하며 ROOT로부터 입력 OBJID 까지의 PATH 정보 구성
      function lf_getTreePath(it_tree){

        //tree 정보가 존재하지 않는경우 exit.
        if(jQuery.isArray(it_tree) !== true || it_tree.length === 0){
          return;
        }

        //tree 정보를 탐색하며 입력 OBJID와 동일건 검색.
        for(var i=0, l=it_tree.length, l_find; i<l; i++){

          //검색대상 OBJID에 해당하는경우 찾음 FLAG return.
          if(it_tree[i].OBJID === OBJID){
            //PATH를 수집.
            lt_path.unshift(it_tree[i].OBJID);
            return true;
          }

          //하위를 탐색하며 검색대상 OBJID에 해당하는건 검색.
          l_find = lf_getTreePath(it_tree[i].zTREE);

          //OBJID에 해당하는건을 찾은경우.
          if(l_find === true){
            //PATH를 수집.
            lt_path.unshift(it_tree[i].OBJID);
            return true;
          }
        }

      } //tree를 탐색하며 ROOT로부터 입력 OBJID 까지의 PATH 정보 구성

      

      //수집된 경로를 기준으로 child 정보 새로 검색.
      function lf_getNode(){

        //tree bind정보 새로 검색.
        var oBind = oAPP.attr.ui.oLTree1.getBinding();

        //start 경로 매핑.
        var lt_child = oBind._oRootNode;

        //수집된 경로를 기준으로 child를 다시 검색.
        for(var i=0, l=lt_route.length; i<l; i++){
          lt_child = lt_child.children[lt_route[i]];
        }

        //검색된 child return.
        return lt_child;

      } //수집된 경로를 기준으로 child 정보 새로 검색.

      

      //수집된 path를 기준으로 child를 탐색하며 펼침 처리.
      function lf_expand(is_child){

        if(typeof is_child?.context === "undefined" || is_child?.context === null){
          return;
        }

        //펼침 처리 대상 child의 OBJID 정보 검색.
        var l_objid = is_child.context.getProperty("OBJID");

        if(typeof l_objid === "undefined"){return;}
        
        //현재 CHILD가 펼침 처리 대상건인경우.
        if(l_objid === lt_path[0]){
          
          //입력UI와 동일건인경우. 선택 처리.
          if(OBJID === lt_path[0]){

            var _sTree = is_child.context.getProperty();
            
            return _sTree;
            
          }
          
          //수집건에서 삭제.
          lt_path.splice(0,1);
          
          if(lt_path.length === 0){
            return;
          }

          //해당 라인이 펼쳐져 있지 않다면.
          if(is_child.isLeaf === false && is_child.nodeState.expanded === false){          
            //TREE 펼첨 처리.
            oAPP.attr.ui.oLTree1.expand(l_cnt);
          }


          //현재 탐색중인 child의 경로 정보 수집.
          lt_route.push(is_child.positionInParent);

          //수집된 경로를 기준으로 child 정보 새로 검색.
          is_child = lf_getNode();

        }

        //expand 위치를 위한 counting.
        l_cnt += 1;

        //새로 검색된 child를 기준으로 하위를 탐색하며 expand 처리.
        for(var i = 0, l = is_child.children.length; i < l; i++){
          
          var _sTree = lf_expand(is_child.children[i]);

          if(typeof _sTree !== "undefined"){
            return _sTree;
          }

        }

      } //수집된 path를 기준으로 child를 탐색하며 펼침 처리.



      //OBJID가 존재하지 않는경우 EXIT.
      if(typeof OBJID === "undefined" || OBJID === null || OBJID === ""){

        // 전체 자식 윈도우에 Busy 종료.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});
        
        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return resolve();
      }

      var lt_route = [], lt_path = [], l_cnt = 0;

      //입력 UI명으로 부터 부모까지의 PATH 정보 검색.
      lf_getTreePath(oAPP.attr.oModel.oData.zTREE);

      //path 정보를 수집하지 않은경우 exit.
      if(lt_path.length === 0){

        // 전체 자식 윈도우에 Busy 종료.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return resolve();
      }

      var l_bind = oAPP.attr.ui.oLTree1.getBinding();
      if(!l_bind){

        // 전체 자식 윈도우에 Busy 종료.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return resolve();
      }

      //이전에 design tree에 필터가 적용됐다면.
      if(l_bind.aFilters.length !== 0){
        //필터 해제 처리.
        oAPP.fn.designSetFilter("");
      }
          
      //수집한 path를 기준으로 tree 펼첨 처리.
      var _sTree = lf_expand(l_bind._oRootNode.children[0]);

      if(typeof _sTree === "undefined"){

        // 전체 자식 윈도우에 Busy 종료.
        oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return resolve();

      }


      //라인 선택 처리.
      oAPP.attr.ui.oLTree1.setSelectedIndex(l_cnt);
      

      //attr 영역 갱신 및 미리보기 화면 갱신.
      await oAPP.fn.designTreeItemPress(_sTree);


      
      //design tree의 라인 이동 처리.
      oAPP.fn.desginSetFirstVisibleRow(l_cnt, _sTree);


      //20240527 PES
      //바인딩 팝업에 UI 라인 선택 처리.
      oAPP.fn.selectBindingPopupOBJID(_sTree);


      // 전체 자식 윈도우에 Busy 종료.
      oAPP.attr.oMainBroad.postMessage({PRCCD:"BUSY_OFF"});


      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      

      parent.setBusy("");


      //attribute 영역 선택처리(UIATK가 입력된경우 선택처리)
      oAPP.fn.setAttrFocus(UIATK, TYPE);


      return resolve();


    });


  };  //tree item 선택 처리




  //생성한 UI명 채번
  oAPP.fn.setOBJID = function(objid){

    var l_cnt = 1;
    var l_upper = objid.toUpperCase();
    var l_objid = l_upper + l_cnt;

    var l_found = false, l_stru;

    //design tree 정보를 ITAB 형식으로 변환.
    var lt_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);

    while(l_found !== true){

      //구성한 objid와 동일건 존재여부 확인.
      l_indx = lt_0014.findIndex( a => a.OBJID === l_objid );
      if(l_indx === -1){
        l_found = true;
        return l_objid;
      }

      l_cnt += 1;
      l_objid = l_upper + l_cnt;

    }

  };  //생성한 UI명 채번




  //design tree의 ui 복사 처리.
  oAPP.fn.designCopyUI = async function(is_t, is_p, aggrParam){

    //tree 라인 정보 복사 처리.
    function lf_copy0014(is_tree, is_parent, i_aggr){
      
      //신규 14번 구조 생성.
      var ls_14 = oAPP.fn.crtStru0014();

      //기존 복사건을 신규 14번 구조에 매핑.
      oAPP.fn.moveCorresponding(is_tree, ls_14);

      //바인딩 처리 필드 생성.
      oAPP.fn.crtTreeBindField(ls_14);


      //application 정보 재정의.
      ls_14.APPID = oAPP.attr.appInfo.APPID;
      ls_14.GUINR = oAPP.attr.appInfo.GUINR;

      //OBJID에 포함된 숫자 제거.
      ls_14.OBJID = ls_14.OBJID.replace(/\d/g,"");

      //현재 UI의 OBJID 재 매핑.
      ls_14.OBJID = oAPP.fn.setOBJID(ls_14.OBJID);

      //PARENT의 ID 매핑 처리.
      ls_14.POBID = is_parent.OBJID;

      //부모 UI OBJECT ID 매핑 처리.
      ls_14.PUIOK = is_parent.UIOBK;

      //UI에 해당하는 icon 설정.
      oAPP.fn.setTreeUiIcon(ls_14);

      ls_14.chk = false;
      ls_14.chk_visible = true;

      //추가버튼 활성화.
      ls_14.visible_add    = true;

      //삭제 버튼 활성화.
      ls_14.visible_delete = true;

      if(i_aggr){        
        //aggr 선택 팝업에서 선택한 aggregation정보 매핑.
        ls_14.UIATK = i_aggr.UIATK;
        ls_14.UIATT = i_aggr.UIATT;
        ls_14.UIASN = i_aggr.UIASN;
        ls_14.UIATY = i_aggr.UIATY;
        ls_14.UIADT = i_aggr.UIADT;
        ls_14.UIADS = i_aggr.UIADS;
        ls_14.ISMLB = i_aggr.ISMLB;
        ls_14.PUIATK = i_aggr.UIATK;
      }


      //attribute 복사 처리.
      lt_0015 = lf_copy0015(ls_14, is_tree, i_aggr);

      //tree embeded aggregation 아이콘 표현.
      oAPP.fn.setTreeAggrIcon(ls_14);

      //DESCRIPTION 정보 복사 처리.
      oAPP.fn.copyDesc(is_tree.OBJID, ls_14.OBJID);

      //클라이언트 이벤트 복사 처리.
      oAPP.fn.copyUiClientEvent(is_tree.OBJID, ls_14);

      if(typeof i_aggr === "undefined"){
        //부모 정보에 현재 복사처리한 UI 수집처리.
        is_parent.zTREE.push(ls_14);

      }else{
        //drop 위치의 index에 라인 추가.
        is_parent.zTREE.splice(_sDropLineInfo.dropIndex, 0, ls_14);

      }

      var l_UILIB = ls_14.UILIB;
      
      //UI 검색
      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UOBK === ls_14.UIOBK );

      //검색결과가 존재하는경우 라이브러리 명 매핑(sap.m.Button).
      if(ls_0022){
          l_UILIB = ls_0022.LIBNM;
      }


      if(typeof i_aggr === "undefined"){
        //미리보기 UI 추가
        oAPP.attr.ui.frame.contentWindow.addUIObjPreView(ls_14.OBJID, ls_14.UIOBK, l_UILIB, 
          ls_14.UIFND, ls_14.POBID, ls_14.PUIOK, ls_14.UIATT, lt_0015, lt_ua018, lt_ua032, lt_ua030, lt_ua026, lt_ua050);
      
      }else{

        //UI 생성 처리.
        oAPP.attr.ui.frame.contentWindow.createUIInstance(ls_14, lt_0015);


        //SAP.UI.RICHTEXTEDITOR.RICHTEXTEDITOR UI의 예외처리 script 구성.
        oAPP.attr.ui.frame.contentWindow.setRichTextEditorException(ls_14.UIOBK, ls_14.OBJID);


        //자식 UI가 필수인 UI에 자식이 없는경우 강제추가 예외처리.
        oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_14.UIOBK, ls_14.OBJID, ls_14.zTREE, oAPP.attr.S_CODE.UA050);


        var _aIndex = is_parent.zTREE.filter( a => a.UIATT === ls_14.UIATT );

        var _dragPos = _aIndex.findIndex( item => item.OBJID === ls_14.OBJID );


        var _cnt = 0;

        //같은 aggregation안에 있는 UI중 부모에 추가되지 않은 UI 존재 여부 확인.
        for(var i = 0; i < _dragPos; i++){

          var _sTree =  is_parent.zTREE[i];

          if(oAPP.attr.S_CODE.UA026.findIndex( item => item.FLD01 === _sTree.UILIB ) !== -1){
            continue;
          }

          _cnt++;

        }


        //부모에 생성한 UI 추가.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(ls_14.OBJID, ls_14.UILIB, ls_14.POBID, 
          ls_14.PUIOK, ls_14.UIATT, _cnt, ls_14.ISMLB, ls_14.UIOBK, true);

        //미리보기 예외처리 UI 추가 draw 처리.
        oAPP.fn.prevDrawExceptionUi(ls_14.UIOBK, ls_14.OBJID);

      }


      if(is_tree.zTREE && is_tree.zTREE.length !== 0){
        //하위 UI가 존재하는경우 하위를 탐색하며 UI 복사 처리.
        for(var i=0, l=is_tree.zTREE.length; i<l; i++){

          var l_child = lf_copy0014(is_tree.zTREE[i], ls_14);
          
        }
      }

      //UI 복사대상 시작점인경우 해당 정보 return.
      if(i_aggr){
        return ls_14;
      }

    } //tree 라인 정보 복사 처리.



    //attribute 복사 처리.
    function lf_copy0015(is_14, is_tree, i_aggr){

      if(oAPP.attr.prev[is_tree.OBJID]._T_0015.length === 0){return;}

      var lt_0015 = [];

      for(var i=0, l=oAPP.attr.prev[is_tree.OBJID]._T_0015.length; i<l; i++){

        //프로퍼티 구조 신규 생성.
        var ls_15 = oAPP.fn.crtStru0015();

        //기존 복사건을 신규 15번 구조에 매핑.
        oAPP.fn.moveCorresponding(oAPP.attr.prev[is_tree.OBJID]._T_0015[i], ls_15);

        ls_15.APPID = oAPP.attr.appInfo.APPID;
        ls_15.GUINR = oAPP.attr.appInfo.GUINR;
        ls_15.OBJID = is_14.OBJID;

        //복사된 ui의 최상위 정보의 aggregation 정보 변경처리.
        if(i_aggr && ls_15.UIATY === "6"){
          ls_15.UIATK = i_aggr.UIATK;
          ls_15.UIATT = i_aggr.UIATT;
          ls_15.UIASN = i_aggr.UIASN;
          ls_15.UIADT = i_aggr.UIADT;
          ls_15.UIADS = i_aggr.UIADS;
          ls_15.ISMLB = i_aggr.ISMLB;

        }

        //attribute 수집 처리.
        lt_0015.push(ls_15);

      }

      //복사하여 수집한 attr 정보 return.
      return lt_0015;

    } //attribute 복사 처리.


    var _sDropLineInfo = is_p?.dropLineInfo || undefined;
    delete is_p?.dropLineInfo;

    if(typeof _sDropLineInfo === "undefined"){

      _sDropLineInfo = {};

      _sDropLineInfo.dropPosition = undefined;
      _sDropLineInfo.dropIndex    = undefined;

      //기존 로직의 마지막 위치에 UI 추가를 위한 index 매핑.
      _sDropLineInfo.dropIndex = is_p.zTREE.length;

    }



    //공통코드 미리보기 UI Property 고정값 정보 검색.
    var lt_ua018 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA018");
            
    //부모 UI에 추가 불필요 대상 UI 정보 검색.
    var lt_ua026 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA026" && a.FLD02 !== "X" );

    //UI 프로퍼티 고정값 설정 정보 검색.
    var lt_ua030 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA030" && a.FLD06 !== "X" );

    //UI 프로퍼티 type 예외처리 정보 검색.
    var lt_ua032 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA032" && a.FLD06 !== "X" );

    //UI 프로퍼티 type 예외처리 정보 검색.
    var lt_ua050 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA050" && a.FLD08 !== "X" );



    //미리보기 onAfterRendering 처리 관련 module load.
    var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);


    //onAfterRendering 이벤트 등록 대상 UI 얻기.
    let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[is_p.OBJID]);
      
    let _oDom = undefined;

    if(typeof _oTarget?.getDomRef === "function"){
      _oDom = _oTarget.getDomRef();
    }
    
    
    //RichTextEditor 미리보기 출력 예외처리로직.
    var _aPromise = _oRender.renderingRichTextEditor(is_p);


    let _oPromise = undefined;
    
    //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
    if(typeof _oDom !== "undefined" && _oDom !== null){
      _oPromise = _oRender.setAfterRendering(_oTarget);
    }

    
    //ui 복사 처리.
    var ls_copy = lf_copy0014(is_t, is_p, aggrParam);


    //UNDO HISTORY 추가 처리.
    parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("COPY", ls_copy);


    // //MODEL 갱신 처리.
    // oAPP.attr.oModel.refresh();

    //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
    if(typeof _oPromise !== "undefined"){
      _oTarget.invalidate();
      
      //onAfterRendering 수행까지 대기.
      await _oPromise;
    }


    //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
    //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
    await Promise.all(_aPromise);


    //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
    await oAPP.fn.designRefershModel();


    //drag 종료 처리.
    oAPP.fn.designDragEnd();


    //변경 FLAG 처리.
    oAPP.fn.setChangeFlag();


    //20240621 pes.
    //바인딩 팝업의 디자인 영역 갱신처리.
    oAPP.fn.updateBindPopupDesignData();

    //drag한 UI 선택 처리.
    await oAPP.fn.setSelectTreeItem(ls_copy.OBJID);


    //design tree의 바인딩 정보 얻기.
    let _aRow = oAPP.attr.ui.oLTree1.getRows();


    //design tree의 바인딩정보에서 현재 검색한 UI의 라인 위치 얻기.
    for(let i = 0, l = _aRow.length; i < l; i++){

      let _oRow = _aRow[i];

      let _oCtxt = _oRow.getBindingContext();

      if(!_oCtxt){continue;}

      //대상 OBJECT ID건이 아닌경우 SKIP.
      if(_oCtxt.getProperty("OBJID") !== ls_copy.OBJID){continue;}

      let _oDom = _oRow.getDomRef() || undefined;

      if(typeof _oDom === "undefined"){
        console.error("(uiDesignArea.js oAPP.fn.designCopyUI)UI 복사->추가 처리 이후 ROW의 DOM 정보 취득 실패", ls_copy.OBJID);
        break;
      }

      //272  &1 has been copied.
      sap.m.MessageToast.show(oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "272", "UI", "", "", ""),
        {of:_oDom, my:"center top"});
      
      break;

    }
   

  };  //design tree의 ui 복사 처리.




  //drop callback 이벤트.
  oAPP.fn.drop_cb = async function(param, i_drag, i_drop){
    
    var _sDropLineInfo = i_drop?.dropLineInfo || undefined;
    delete i_drop?.dropLineInfo;

    if(typeof _sDropLineInfo === "undefined"){

      _sDropLineInfo = {};

      _sDropLineInfo.dropPosition = undefined;
      _sDropLineInfo.dropIndex    = undefined;

      //기존 로직의 마지막 위치에 UI 추가를 위한 index 매핑.
      _sDropLineInfo.dropIndex = i_drop.zTREE.length;

    }
    


    //tree에 매핑된 광역변수 로컬에 매핑.
    var l_effect = oAPP.attr.ui.oLTree1.__dropEffect;

    //tree에 매핑된 광역 변수 초기화.
    oAPP.attr.ui.oLTree1.__dropEffect = "";

    //선택가능 aggregation리스트가 존재하지 않는경우, drag, drop의 부모, aggregation이 동일한경우.
    if(typeof param === "undefined" && i_drag.POBID === i_drop.POBID && i_drag.UIATK === i_drop.UIATK){
      //drag UI와 dropUI의 위치를 변경 처리함.

      //drop 위치의 부모 정보 검색.
      var l_parent = oAPP.fn.getTreeData(i_drop.POBID);

      if(typeof l_parent === "undefined"){

        //106 &1 UI 정보를 찾을 수 없습니다.
        parent.showMessage(sap, 20, "E", 
          parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "106", i_drop.POBID));

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;

      }


      var _sParam = {};
      _sParam.S_DRAG = i_drag;
      _sParam.S_DROP = i_drop;

      //UNDO 이력 추가.
      parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("DRAG_DROP", _sParam);

      
      var l_funcnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[i_drag.POBID], "3", i_drag.UIATT, "_sIndexGetter");

      var _dragPos = oAPP.attr.prev[i_drag.POBID][l_funcnm](oAPP.attr.prev[i_drag.OBJID]);

      var _dropPos = oAPP.attr.prev[i_drop.POBID][l_funcnm](oAPP.attr.prev[i_drop.OBJID]);



      //DRAG된 UI 다시 생성 처리.
      oAPP.fn.reCreateUIObjInstance(i_drag);


      //DROP된 UI 다시 생성 처리.
      oAPP.fn.reCreateUIObjInstance(i_drop);


      //미리보기 onAfterRendering 처리 관련 module load.
      var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);

      //onAfterRendering 이벤트 등록 대상 UI 얻기.
      var _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[l_parent.OBJID]);

      var _oDom = undefined;

      if(typeof _oTarget?.getDomRef === "function"){
        _oDom = _oTarget.getDomRef();
      }
      
      var _oPromise = undefined;
      
      //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
      if(typeof _oDom !== "undefined" && _oDom !== null){
        _oPromise = _oRender.setAfterRendering(_oTarget);
      }

      //drag UI의 index 얻기.
      var l_dragIndex = l_parent.zTREE.findIndex( a=> a.OBJID === i_drag.OBJID);

      //drop UI의 index 얻기.
      var l_dropIndex = l_parent.zTREE.findIndex( a=> a.OBJID === i_drop.OBJID);

      //drag index가 drop index보다 큰경우.
      if(l_dragIndex > l_dropIndex){

        //부모에서 drag 위치 삭제.
        l_parent.zTREE.splice(l_dragIndex, 1);

        //부모에서 drop 위치 삭제.
        l_parent.zTREE.splice(l_dropIndex, 1);          

        //drag건을 drop위치에 추가.
        l_parent.zTREE.splice(l_dropIndex, 0, i_drag);

        //drop건을 drag위치에 추가.
        l_parent.zTREE.splice(l_dragIndex, 0, i_drop);
        

        //drag건 미리보기 위치이동.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drag.OBJID, i_drag.UILIB, i_drag.POBID, i_drag.PUIOK, i_drag.UIATT, _dropPos, i_drag.ISMLB, i_drag.UIOBK);

        //drop건 미리보기 위치이동.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drop.OBJID, i_drop.UILIB, i_drop.POBID, i_drop.PUIOK, i_drop.UIATT, _dragPos, i_drop.ISMLB, i_drop.UIOBK);

        //drop index가 drag index보다 큰경우.
      }else{
        
        //부모에서 drop 위치 삭제.
        l_parent.zTREE.splice(l_dropIndex, 1);
          
        //부모에서 drag 위치 삭제.
        l_parent.zTREE.splice(l_dragIndex, 1);
        
        //drop건을 drag위치에 추가.
        l_parent.zTREE.splice(l_dragIndex, 0, i_drop);

        //drag건을 drop위치에 추가.
        l_parent.zTREE.splice(l_dropIndex, 0, i_drag);

        var l_funcnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[i_drag.POBID], "3", i_drag.UIATT, "_sIndexGetter");

        //drop건 미리보기 위치이동.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drop.OBJID, i_drop.UILIB, i_drop.POBID, i_drop.PUIOK, i_drop.UIATT, _dragPos, i_drop.ISMLB, i_drop.UIOBK);

        //drag건 미리보기 위치이동.
        oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drag.OBJID, i_drag.UILIB, i_drag.POBID, i_drag.PUIOK, i_drag.UIATT, _dropPos, i_drag.ISMLB, i_drag.UIOBK);

      }


      // //MODEL 갱신 처리.
      // oAPP.attr.oModel.refresh();

      //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
      if(typeof _oPromise !== "undefined"){

        //RichTextEditor 미리보기 출력 예외처리로직.
        var _aPromise = _oRender.renderingRichTextEditor(l_parent);
        

        _oTarget.invalidate();
        
        //onAfterRendering 수행까지 대기.
        await _oPromise;

          
        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);

      }


      //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
      await oAPP.fn.designRefershModel();

      //design tree의 tree binding 정보 갱신 처리.
      var l_bind = oAPP.attr.ui.oLTree1.getBinding();
      l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

      
      //drag 종료 처리.
      oAPP.fn.designDragEnd();

      //변경 FLAG 처리.
      oAPP.fn.setChangeFlag();

      //20240621 pes.
      //바인딩 팝업의 디자인 영역 갱신처리.
      oAPP.fn.updateBindPopupDesignData();


      //drag한 UI 선택 처리.
      await oAPP.fn.setSelectTreeItem(i_drag.OBJID);
      
      //005  Job finished.
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));

      return;

    } //선택가능 aggregation리스트가 존재하지 않는경우, drag, drop의 부모, aggregation이 동일한경우.



    //UI가 입력 가능한 카디널리티 여부 확인.
    if(oAPP.fn.chkUiCardinality(i_drop, param.UIATK, param.ISMLB) === true){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }

    
    //UI의 허용 가능 부모 정보
    //(특정 UI는 특정 부모에만 존재해야함.)
    if(oAPP.fn.designChkFixedParentUI(i_drag.UIOBK, i_drop.UIOBK, param.UIATT) === true){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }


    //20240723 PES -START.
    //현재 UI의 대상 Aggregation에 추가 불가능한 UI여부 점검로직.
    var _sParam = {};

    //현재 UI.
    _sParam.UIOBK       = i_drop.UIOBK;

    //추가 대상 AGGREGATION.
    _sParam.UIATT       = param.UIATT;

    //추가 UI.
    _sParam.CHILD_UIOBK = i_drag.UIOBK;


    var _modulePath = parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, "js", "exception", "exceptionUI.js");

    //부모의 Aggregation에 추가 불가능한 UI인지 확인.
    var _deny = parent.require(_modulePath).checkDenyChildAggr(_sParam);

    if(_deny === true){
      
      //214	&1 UI는 &2의 &3 Aggregation에 추가 할 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(
        oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "214", i_drag.OBJID, i_drop.OBJID, param.UIATT));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");
      
      return;

    }
    //20240723 PES -END.



    //복사처리로 D&D한경우.
    if(l_effect === "Copy"){

      //drop 위치 정보 매핑.
      i_drop.dropLineInfo = _sDropLineInfo;

      //ui복사 처리.
      oAPP.fn.designCopyUI(i_drag, i_drop, param);
      return;
    }

    //drag UI의 부모 UI 정보 검색.
    var l_parent = oAPP.fn.getTreeData(i_drag.POBID);

    //drag UI의 부모 UI를 찾지 못한 경우 EXIT.
    if(typeof l_parent === "undefined"){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
      
    }

    //DRAG한 UI의 부모에서 DRAG UI의 INDEX 얻기.
    var l_indx = l_parent.zTREE.findIndex( a=> a.OBJID === i_drag.OBJID);

    //INDEX정보를 찾지 못한 경우 EXIT.
    if(l_indx === -1){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
      
    }


    var _sParam = {};
    _sParam.S_DRAG = i_drag;
    _sParam.S_DROP = i_drop;

    //UNDO 이력 추가.
    parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("DRAG_DROP", _sParam);


    //DRAG UI의 부모에서 DRAG UI정보 제거.
    l_parent.zTREE.splice(l_indx, 1);
    
    var lt_ua050 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA050" && a.FLD08 !== "X" );
        
    //자식 UI가 필수인 UI에 자식이 없는경우 강제추가 예외처리.
    oAPP.attr.ui.frame.contentWindow.setChildUiException(l_parent.UIOBK, l_parent.OBJID, l_parent.zTREE, lt_ua050);


    //미리보기의 직접 입력 가능한 UI의 직접 입력건 반영처리.
    oAPP.fn.previewSetStrAggr(i_drag);


    if(typeof i_drop.zTREE === "undefined"){
      i_drop.zTREE = [];
    }

    
    //기존 맨 밑에 라인 추가 로직 주석 처리.
    // //drop의 CHILD 영역에 DRAG UI를 추가.
    // i_drop.zTREE.push(i_drag);
    
    //대상 라인에 drag UI를 추가.
    i_drop.zTREE.splice(_sDropLineInfo.dropIndex, 0, i_drag);

    var _beforePOBID = i_drag.POBID;
    var _beforeUIATT = i_drag.UIATT;
  

    //DRAG UI의 부모정보 변경.
    i_drag.POBID = i_drop.OBJID;
    i_drag.PUIOK = i_drop.UIOBK;

    //DRAG UI의 부모 AGGREGATION정보 변경.
    i_drag.UIATK = param.UIATK;
    i_drag.UIATT = param.UIATT;
    i_drag.UIASN = param.UIASN;
    i_drag.UIATY = param.UIATY;
    i_drag.UIADT = param.UIADT;
    i_drag.UIADS = param.UIADS;
    i_drag.ISMLB = param.ISMLB;
    i_drag.PUIATK = param.UIATK;

    //tree embeded aggregation 아이콘 표현.
    oAPP.fn.setTreeAggrIcon(i_drag);


    //DRAG UI에서 EMBEDDED AGGREGATION 정보 찾기.
    var ls_embed = oAPP.attr.prev[i_drag.OBJID]._T_0015.find( a=> a.UIATY === "6");


    //drop UI의 aggregation 정보 매핑.
    oAPP.fn.moveCorresponding(param, ls_embed);
    ls_embed.UIATY = "6";

    var _UIATT = undefined;

    //현재 drag 한 UI가 column이면서 template aggregation에 UI가 존재하는경우.
    if(i_drag.UIOBK === "UO01127" && i_drag.zTREE.findIndex( item => item.UIATT === "template") !== -1){
      //N건 바인딩을 template으로 판단.
      _UIATT = "template";
    }

    //같은 부모의 같은 aggregation 이동건인경우 초기화.
    if(_beforePOBID === i_drop.OBJID && _beforeUIATT === param.UIATT){
      _UIATT = undefined;
    }

    //현재 UI가 N건 바인딩 처리 됐는지 여부 확인.
    var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[i_drag.OBJID], _UIATT);


    //drop ui의 N건 바인딩 여부 확인.
    var l_path2 = oAPP.fn.getParentAggrBind(oAPP.attr.prev[i_drop.OBJID], param.UIATT);

    //DEFAULT 바인딩 수집건 유지.
    var l_unbind = false;

    //n건 바인딩 정보가 존재하는경우. 이동 대상 ui의 path와 다르다면.
    if(l_path && l_path !== "" && l_path !== l_path2){
      //바인딩 수집건 제거 flag.
      l_unbind = true;
    }

    //TREE라인을 기준으로 N건 바인딩 해제 처리.
    oAPP.fn.designUnbindUi(i_drag, l_path, l_unbind);


    // //MODEL 갱신 처리.
    // oAPP.attr.oModel.refresh();

    //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
    await oAPP.fn.designRefershModel();


    //design tree의 tree binding 정보 갱신 처리.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding();
    l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());


    //미리보기 onAfterRendering 처리 관련 module load.
    var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);


    //drag한 UI의 이전 부모의 onAfterRendering 처리 대상 UI 얻기.
    var _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[l_parent.OBJID]);

    var _oDom = undefined;

    if(typeof _oTarget?.getDomRef === "function"){
      _oDom = _oTarget.getDomRef();
    }

    var _oPromise = undefined;

    //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
    if(typeof _oDom !== "undefined" && _oDom !== null){
      _oPromise = _oRender.setAfterRendering(_oTarget);
    }
    

    //미리보기 UI 다시 생성 처리.
    oAPP.fn.reCreateUIObjInstance(i_drag);


    //RichTextEditor 미리보기 출력 예외처리로직.
    var _aPromise = _oRender.renderingRichTextEditor(l_parent);



    //DRAG한 UI의 이전 부모를 다시 그리는것을 대기.
    if(typeof _oPromise !== "undefined"){
      _oTarget.invalidate();
      
      //onAfterRendering 수행까지 대기.
      await _oPromise;

    }

    //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
    //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
    await Promise.all(_aPromise);


    //기존 UI의 위치 정보 얻는 로직 주석 처리.
    //동일 AGGREGATION에 추가된 UI 갯수 얻기.
    // var l_indx = i_drop.zTREE.filter( a => a.UIATT === i_drag.UIATT );


    var _aIndex = i_drop.zTREE.filter( a => a.UIATT === i_drag.UIATT );

    var _dragPos = _aIndex.findIndex( item => item.OBJID === i_drag.OBJID );


    //onAfterRendering 이벤트 등록 대상 UI 얻기.
    var _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[i_drop.OBJID]);

    var _oDom = undefined;

    if(typeof _oTarget?.getDomRef === "function"){
      _oDom = _oTarget.getDomRef();
    }
    
    var _oPromise = undefined;
    
    //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
    if(typeof _oDom !== "undefined" && _oDom !== null){
      _oPromise = _oRender.setAfterRendering(_oTarget);
    }

    
    //RichTextEditor 미리보기 출력 예외처리로직.
    var _aPromise = _oRender.renderingRichTextEditor(i_drop);


    //미리보기 갱신 처리.
    // oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drag.OBJID, i_drag.UILIB, i_drag.POBID, 
    //   i_drag.PUIOK, i_drag.UIATT, l_indx.length, i_drag.ISMLB, i_drag.UIOBK, true);


    var _cnt = 0;

    //같은 aggregation안에 있는 UI중 부모에 추가되지 않은 UI 존재 여부 확인.
    for(var i = 0; i < _dragPos; i++){

      var _sTree =  i_drop.zTREE[i];

      if(oAPP.attr.S_CODE.UA026.findIndex( item => item.FLD01 === _sTree.UILIB ) !== -1){
        continue;
      }

      _cnt++;

    }


    //미리보기 갱신 처리.
    oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(i_drag.OBJID, i_drag.UILIB, i_drag.POBID, 
      i_drag.PUIOK, i_drag.UIATT, _cnt, i_drag.ISMLB, i_drag.UIOBK, true);


    //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
    if(typeof _oPromise !== "undefined"){
      _oTarget.invalidate();
      
      //onAfterRendering 수행까지 대기.
      await _oPromise;
    }


    //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
    //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
    await Promise.all(_aPromise);

    
    //현재 UI의 N건 바인딩 처리시 변경된 부모에 현재 UI 매핑 처리.
    oAPP.fn.setModelBind(oAPP.attr.prev[i_drag.OBJID]);
    
    //drag한 UI 선택 처리.
    await oAPP.fn.setSelectTreeItem(i_drag.OBJID);

    //drag 종료 처리.
    oAPP.fn.designDragEnd();

    //변경 FLAG 처리.
    oAPP.fn.setChangeFlag();

    //005  Job finished.
    parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));

    //20240621 pes.
    //바인딩 팝업의 디자인 영역 갱신처리.
    oAPP.fn.updateBindPopupDesignData();

  }; //drop callback 이벤트.



  //미리보기 UI 다시 생성 처리.
  oAPP.fn.reCreateUIObjInstance = function(is_tree){

    //해당 패치가 존재하지 않는경우 exit.
    if(oAPP.common.checkWLOList("C", "UHAK900681") !== true){
      return;
    }


    //미리보기 화면의 예외처리 대상건인경우.
    if(oAPP.attr.UA015UI && oAPP.attr.UA015UI._OBJID === is_tree.OBJID){
      //미리보기 예외처리 초기화.
      oAPP.attr.UA015UI = null;
    }

    //embeded Aggregation index 얻기.
    var _indx = oAPP.attr.prev[is_tree.OBJID]._T_0015.findIndex( item => item.UIATY === "6");

    //embeded Aggregation을 찾았다면 해당 라인 제거.
    //(redrawUIScript에서 부모에 추가하는 로직을 처리하지 않기 위함)
    if(_indx !== -1){
    
      //embeded Aggregation 정보 얻기.
      var ls_embed = oAPP.attr.prev[is_tree.OBJID]._T_0015[_indx];
  
  
      //수집된 항목에서 해당건 제거.
      oAPP.attr.prev[is_tree.OBJID]._T_0015.splice(_indx, 1);
      
    }
    

    //이전 UI를 유지하는 내용을 더이상 사용하지 않기에
    //이전에 생성된 UI를 DESTROY 하는 로직 추가.
    //DRAG할 UI를 DESTROY 처리.
    oAPP.attr.ui.frame.contentWindow.destroyUIPreView(is_tree.OBJID);

    //DRAG할 UI를 다시 생성 처리.
    oAPP.attr.ui.frame.contentWindow.redrawUIScript([is_tree]);

    //다시 생성한 UI의 child가 필수인 건에 대한 UI 추가 처리.
    oAPP.attr.ui.frame.contentWindow.setChildUiException(is_tree.UIOBK, is_tree.OBJID, is_tree.zTREE, oAPP.attr.S_CODE.UA050);

    //미리보기 예외처리 UI 추가 draw 처리.
    oAPP.fn.prevDrawExceptionUi(is_tree.UIOBK, is_tree.OBJID);
    
    //제거했던 embeded Aggregation을 다시 추가.
    if(_indx !== -1){
      oAPP.attr.prev[is_tree.OBJID]._T_0015.push(ls_embed);
    }

    oAPP.attr.prev[is_tree.OBJID].__PARENT = oAPP.attr.prev[is_tree.POBID];

  };



  //입력 TREE라인을 기준으로 N건 바인딩 해제 처리.
  oAPP.fn.designUnbindUi = function(is_tree, i_path, bUnbind){

    if(!i_path){return;}

    if(!oAPP.attr.prev[is_tree.OBJID]){return;}

    if(!oAPP.attr.prev[is_tree.OBJID]._T_0015){return;}

    if(oAPP.attr.prev[is_tree.OBJID]._T_0015.length === 0){return;}

    //현재 처리대상 tree의 child가 존재하는경우.
    if(is_tree.zTREE.length !== 0){
      //child를 탐색하면서 바인딩 해제 처리.
      for(var i=0, l=is_tree.zTREE.length; i<l; i++){
        oAPP.fn.designUnbindUi(is_tree.zTREE[i], i_path, bUnbind);
      }

    }

    for(var i=oAPP.attr.prev[is_tree.OBJID]._T_0015.length-1; i>=0; i--){

      //바인딩 처리되지 않은경우 skip.      
      if(oAPP.attr.prev[is_tree.OBJID]._T_0015[i].ISBND !== "X"){continue;}

      //현재 바인딩된건의 path가 n건 바인딩의 path로 파생되는건인경우.
      if(oAPP.attr.prev[is_tree.OBJID]._T_0015[i].UIATV.substr(0,i_path.length) === i_path){
        //해당 UI의 바인딩처리 수집건 제거 처리.        
        oAPP.fn.attrUnbindProp(oAPP.attr.prev[is_tree.OBJID]._T_0015[i]);

        if(!bUnbind){continue;}

        //현재 라인 제거 처리.
        oAPP.attr.prev[is_tree.OBJID]._T_0015.splice(i, 1);

      }

    }


  };  //입력 TREE라인을 기준으로 N건 바인딩 해제 처리.



  //UI design tree 라인 선택 이벤트.
  oAPP.fn.designTreeItemPress = async function(is_tree){

    return new Promise(async (resolve)=>{

      //우 상단 DynamicPage header 영역 펼침 처리.
      oAPP.fn.attrHeaderExpanded(true);


      //이전 선택한 UI의 선택 표현 CSS 제거 처리.
      oAPP.attr.ui.frame.contentWindow.oWS.sMark.fn_removeMark();


      //20번 화면의 drop 잔상 제거 처리.
      oAPP.fn.ClearDropEffect();


      //UI Info 영역 갱신 처리.
      oAPP.fn.setUIInfo(is_tree);


      //선택한 ui에 해당하는 attr로 갱신 처리.
      await oAPP.fn.updateAttrList(is_tree.UIOBK, is_tree.OBJID);


      //20231011 pes.
      //ui가 라이브러리 내부 로직에 의해 destroy 처리 되어 사용할 수 없는 상태일경우,
      //redrawUIScript function을 통해 UI를 다시 생성 처리.
      if(oAPP.common.checkWLOList("C", "UHAK900681") === true || parent.REMOTE.app.isPackaged === false){
        oAPP.attr.ui.frame.contentWindow.redrawUIScript(oAPP.attr.oModel.oData.zTREE);
      }


      //미리보기 화면 갱신 처리.
      await oAPP.attr.ui.frame.contentWindow.refreshPreview(is_tree);



      //20240716 pes.
      //미리보기 area 갱신 로직이 변경함에 따라 3.4.2 patch2
      //버전 정보가 존재하지 않는경우 이전 로직 수행 처리.
      //팝업 호출건 강제 종료 처리.
      if(oAPP.common.checkWLOList("C", "UHAK900788") !== true){
        oAPP.attr.ui.frame.contentWindow.closePopup();
      }


      //미리보기 ui 선택 처리
      await oAPP.attr.ui.frame.contentWindow.selPreviewUI(is_tree.OBJID);


      //처리 완료 resolve
      resolve();

    });


  };  //UI design tree 라인 선택 이벤트.




  //design tree의 라인 이동 처리.
  oAPP.fn.desginSetFirstVisibleRow = function(iIndex, is_tree){

    var lt_ctxt = oAPP.attr.ui.oLTree1._getRowContexts();

    if(lt_ctxt.length === 0){
      //해당 아이템으로 focus 처리.
      oAPP.attr.ui.oLTree1.setFirstVisibleRow(iIndex);
      return;
    }

    //tree에서 first visible row 이동 여부 확인.
    for(var i=0, l=lt_ctxt.length; i<l; i++){
      if(!lt_ctxt[i].context){continue;}

      //현재 보여지고 있는 tree에 이동대상 OBJID가 존재하는경우 이동 불필요 EXIT 처리.
      if(lt_ctxt[i].context.getProperty("OBJID") === is_tree.OBJID){return;}
      
    }    

    //해당 아이템으로 focus 처리.
    oAPP.attr.ui.oLTree1.setFirstVisibleRow(iIndex);

  };  //design tree의 라인 이동 처리.


  /*************************************************************
   * @function - 바인딩 팝업의 디자인 영역 UI선택 처리.
   *************************************************************/
  oAPP.fn.selectBindingPopupOBJID = function(is_tree){

    //디자인상세화면(20화면) <-> BINDPOPUP 통신 모듈 PATH 구성.
    var _channelPath = oAPP.fn.getBindingPopupBroadcastModulePath();

    //바인딩 팝업으로 다시 호출하여 알림 처리.
    parent.require(_channelPath)("DESIGN-TREE-SELECT-OBJID", is_tree.OBJID);

  };



  //design tree의 checkbox 선택 이벤트.
  oAPP.fn.designTreeSelChkbox = function(is_tree){

    //현재 UI의 하위를 전부 체크선택, 체크해제 처리
    function lf_setCheckAllChild(is_tree, bChecked){

      //현재 라인의 체크박스 선택/해제 처리.
      is_tree.chk = bChecked;

      //child 정보가 없는경우 exit.
      if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

      //child정보가 있는경우 하위를 탐색하며 체크박스 선택/해제 처리.
      for(var i=0, l=is_tree.zTREE.length; i<l; i++){
        lf_setCheckAllChild(is_tree.zTREE[i], bChecked);
      }

    } //현재 UI의 하위를 전부 체크선택, 체크해제 처리



    //현재 UI의 부모를 탐색하면서 체크박스 해제 처리.
    function lf_setCheckParent(oNode){
      //NODE 정보가 존재하지 않는경우 EXIT.
      if(typeof oNode === "undefined" || oNode === null || 
        typeof oNode.context === "undefined" ||
        oNode.context === null){
          return;
      }

      //찾은 부모의 체크박스 해제 처리.
      oAPP.attr.oModel.setProperty("chk", false, oNode.context);

      //부모를 탐색하면서 체크 해제 처리.
      lf_setCheckParent(oNode.parent);

    } //현재 UI의 부모를 탐색하면서 체크박스 해제 처리.

    

    //이벤트 발생 라인부터 하위를 탐색하며 체크박스 선택/해제 처리.
    lf_setCheckAllChild(is_tree, is_tree.chk);

    //선택해제건이 아닌경우 exit.
    if(is_tree.chk !== false){
      //화면 갱신 처리.
      oAPP.attr.oModel.refresh();
      return;

    }

    //현재 이벤트가 발생한 라인의 체크박스가 해제된경우.
    
    //TREE의 바인딩 정보 얻기.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding();

    //바인딩 정보를 얻지 못한 경우 EXIT.
    if(typeof l_bind === "undefined" || 
      Array.isArray(l_bind._aRowIndexMap) !== true || 
      l_bind._aRowIndexMap.length === 0){
        return;
    }


    for(var i=0, l_OBJID, l=l_bind._aRowIndexMap.length; i<l; i++){
      
      //CONTEXT 정보가 없으면 SKIP.
      if(typeof l_bind._aRowIndexMap[i] === "undefined" || l_bind._aRowIndexMap[i].context === null){continue;}

      //해당 라인의 OBJID 정보 얻기.
      l_OBJID = l_bind._aRowIndexMap[i].context.getProperty("OBJID");
      
      //체크박스 선택 라인의 OBJID와 다른경우 SKIP.
      if(l_OBJID !== is_tree.OBJID){continue;}

      //체크박스 선택 라인위치를 찾은경우 부모를 탐색하며 체크박스 해제 처리.
      lf_setCheckParent(l_bind._aRowIndexMap[i]);

      break;

    }

  };  //design tree의 checkbox 선택 이벤트.




  /************************************************************************
   * drop 가능여부 처리.
   * **********************************************************************
   * @param {object} is_tree - drag를 시작한 tree라인 정보
   ************************************************************************/
  oAPP.fn.setDropEnable = function(is_tree){

    //design tree영역의 drop 가능여부 판단 내부 function.
    function lf_setDropEnable(is_child, it_0027, bChild){
      
      //default drop 불가능 처리.
      is_child.drop_enable = false;

      //drag한 UI의 child인경우.
      if(bChild === true){
        if(is_child.zTREE.length === 0){return;}

        //child UI 존재시 하위를 탐색하며 drop 불가 처리.
        for(var i = 0, l = is_child.zTREE.length; i < l; i++){
          lf_setDropEnable(is_child.zTREE[i], it_0027, bChild);
        }

        return;

      }

      //현재 탐색하고 있는 UI가 drag한 UI인경우.
      if(is_child.OBJID === is_tree.OBJID){

        if(is_child.zTREE.length === 0){return;}

        //child UI 존재시 하위를 탐색하며 drop 불가 처리.
        for(var i = 0, l = is_child.zTREE.length; i < l; i++){
          lf_setDropEnable(is_child.zTREE[i], it_0027, true);
        }

        return;

      }


      //점검대상 라인의 입력가능한 aggregation정보 얻기.
      var lt_0023 = oAPP.DATA.LIB.T_0023.filter( a => a.UIOBK === is_child.UIOBK && a.UIATY === "3" && a.ISDEP !== "X" );

      if(lt_0023.length !== 0){

        for(var i = 0, l = lt_0023.length; i < l; i++){
          //점검대상 라인의 aggregation의 UIOBK정보 얻기.
          var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.LIBNM === lt_0023[i].UIADT );
          if(!ls_0022){continue;}

          //drag UI가 drop 가능한 UI인지 확인.
          //var ls_0027 = oAPP.DATA.LIB.T_0027.find( a => a.TGOBJ === ls_0022.UIOBK && a.SGOBJ === is_tree.UIOBK );
          var ls_0027 = it_0027.find( a => a.SGOBJ === ls_0022.UIOBK );

          //drop불가능한 UI인경우 다음 aggrgation의 drop여부 확인.
          if(!ls_0027){continue;}

          //20240808 PES -START.
          //DROP이 허용 가능한 AGGREGATION일경우, CHILD존재시,
          //해당 AGGREGATION의 CARDINALITY가 0:1 이면서 해당 AGGREGATION에 CHILD가 존재하는경우 DROP 불가능 처리.
          if(lt_0023[i].ISMLB === "" && is_child.zTREE.length > 0){

            //허용 가능한 AGGREGATION에 UI가 이미 추가됐다면 DROP 불가능 처리.
            if(is_child.zTREE.findIndex( item => item.UIATT === lt_0023[i].UIATT ) !== -1){
              continue;
            }

          }
          //20240808 PES -END.

          //drag한 UI가 drop 가능한 라인인경우 drop 가능 flag 처리. 
          is_child.drop_enable = true;
          break;

        }

      }

      if(is_child.zTREE.length === 0){return;}

      for(var i = 0, l = is_child.zTREE.length; i < l; i++){
        lf_setDropEnable(is_child.zTREE[i], it_0027, bChild);
      }

    } //design tree영역의 drop 가능여부 판단 내부 function.


    //화면 편집상태가 아닌경우 exit.
    if(oAPP.attr.oModel.oData.IS_EDIT !== true){return;}

    var lt_0027 = oAPP.DATA.LIB.T_0027.filter( a => a.TGOBJ === is_tree.UIOBK );

    //drag한 UI를 기준으로 tree의 drop가능한 라인 여부 판단.
    lf_setDropEnable(oAPP.attr.oModel.oData.zTREE[0], lt_0027);


  };  //drop 가능여부 처리.




  /************************************************************************
   * drop 가능여부 style 처리.
   * **********************************************************************
   * @param {boolean} bClear - css 제거 flag.(remove 후 다시 설정하지 않음)
   ************************************************************************/
  oAPP.fn.designSetDropStyle = function(bClear){

    //drag가 시작되지 않은경우 exit.
    if(!oAPP.attr.ui.oLTree1.__isdragStarted){return;}

    var lt_row = oAPP.attr.ui.oLTree1.getRows();
    if(lt_row.length === 0){return;}

    //tree의 row에 바인딩처리된 정보 얻기.
    var lt_ctxt = oAPP.attr.ui.oLTree1._getRowContexts();

    for(var i = 0, l = lt_row.length; i < l; i++){
      //기존 style 제거 처리.
      lt_row[i].removeStyleClass("u4aWsDisableTreeDrop");
      
      lt_row[i].removeStyleClass("sapUiDnDDragging");

      //css를 삭제 하는경우 하위 로직 skip.
      if(bClear){continue;}

      //해당 row에 binding context정보가 존재하지 않는경우 skip.
      if(!lt_ctxt[i] || !lt_ctxt[i].context){
        continue;
      }

      //drop 가능여부 확인.
      var l_drop_enable = lt_ctxt[i].context.getProperty("drop_enable");

      //drop 불가능 상태인경우 css 처리.
      if(l_drop_enable !== true){
        lt_row[i].addStyleClass("u4aWsDisableTreeDrop");
      }

    }


  };  //drop 가능여부 style 처리.



  //drag한 UI가 다른 라인에 올라갔을때 처리.
  oAPP.fn.designDragEnter = function(oEvent){

    var _oUi = oEvent.oSource || undefined;

    if(typeof _oUi === "undefined"){
      return;
    }

    if(typeof oEvent?.mParameters?.dragSession?.getDropControl !== "function"){
      oEvent.preventDefault();
      return;
    }

    var l_row = oEvent.mParameters.dragSession.getDropControl();
    if(!l_row){
      oEvent.preventDefault();
      return;
    }

    var l_ctxt = l_row.getBindingContext();

    if(!l_ctxt){
      oEvent.preventDefault();
      return;
    }

    

    var l_drop_enable = l_ctxt.getProperty("drop_enable");

    
    // if(!l_drop_enable){
    //   oEvent.preventDefault();
    //   return;
    // }
    

    //default 라인에 UI 추가, 라인 사이에 추가.
    var _position = "OnOrBetween";

    //해당 라인에 UI를 추가할 수 없는경우 라인 사이에 추가 처리.
    if(l_drop_enable !== true){
      _position = "Between";
    }
    
    _oUi.setDropPosition(_position);
    

  };  //drag한 UI가 다른 라인에 올라갔을때 처리.




  /************************************************************************
   * design tree item drag 시작 이벤트.
   * **********************************************************************
   * @param {object} OBJID - drag를 시작한 tree라인 정보
   ************************************************************************/
  oAPP.fn.designTreeDragStart = function(is_tree){
    
    //DRAG 시작됨 FLAG 처리.
    oAPP.attr.ui.oLTree1.__isdragStarted = true;

    //drag& drop 가능 처리 default 설정.
    oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);

    //drag한 UI가 drop가능한 라인 판단 처리.
    oAPP.fn.setDropEnable(is_tree);

    //drop 가능여부 css 처리.
    oAPP.fn.designSetDropStyle();


  };  //design tree item drag 시작 이벤트.




  //DnD 가능여부 확인.
  oAPP.fn.chkDnDPossible = function(it_tree, OBJID){

    if(it_tree.length === 0){return;}
      
    //drag UI의 child에 drop UI가 존재하는지 여부 확인.
    var l_indx =  it_tree.findIndex( a=> a.OBJID === OBJID );

    //존재하는경우 이동불가 flag return.
    if(l_indx !== -1){return true;}

    //존재하지 않는경우 하위를 탐색하며 drop UI가 존재하는지 여부 확인.
    for(var i=0, l=it_tree.length; i<l; i++){
      //재귀호출을 통해 drop UI가 존재하는경우.
      if(oAPP.fn.chkDnDPossible(it_tree[i].zTREE, OBJID)){
        //이동불가 flag return.
        return true;
      }
    }

  };  //DnD 가능여부 확인.




  //drag한 UI의 파라메터 정보 얻기.
  oAPP.fn.getDragParam = function(oEvent){

    if(!oEvent?.mParameters?.browserEvent?.dataTransfer?.getData){return;}

    //미리보기 영역에서 drag처리한 UI명(OBJID or UIOBK) + D&D random key 얻기.( + drag 영역)
    var l_dnd = oEvent.mParameters.browserEvent.dataTransfer.getData("text/plain");

    //입력받은 정보가 존재하지 않는경우 exit.
    if(!l_dnd){return;}

    //OBJID or UIOBK|D&D random key 로 조합된 형식 분리.
    var lt_split = l_dnd.split("|");

    //조합된 형식이 아닌경우 exit.
    if(lt_split.length < 2){return;}

    return lt_split;


  };  //drag한 UI의 OBJID 정보 얻기.




  //drop 처리 function.
  oAPP.fn.UIDrop = function(oEvent, i_OBJID){

    if(!i_OBJID){return;}

    //drop POSITION정보(On, Before, After)
    var _dropPosition = oEvent.mParameters.dropPosition;

    var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
    _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215"); 

    //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

    //drag 정보 얻기.
    var lt_dragInfo = oAPP.fn.getDragParam(oEvent);
    if(!lt_dragInfo || lt_dragInfo.length !== 3){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //design tree, 미리보기 영역에서 drag한 정보가 아닌경우 exit.
    if(lt_dragInfo[0] !== "designTree" && lt_dragInfo[0] !== "previewArea"){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //다른 세션에서 drag한 정보라면 exit.
    if(lt_dragInfo[2] !== oAPP.attr.DnDRandKey){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      
      //102	다른 영역에서의 Drag 정보는 처리할 수 없습니다.
      parent.showMessage(sap, 10, "E", 
        parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "102"));

      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //drag한 UI의 OBJECT ID 정보 얻기.
    var l_objid = lt_dragInfo[1];

    //OBJID를 얻지 못한 경우 EXIT.
    if(!l_objid){

      //103	Drag한 UI 정보가 존재하지 않습니다.
      parent.showMessage(sap, 10, "E", 
        parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "103"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //ui 구성정보에서 직접 검색.
    l_drag = oAPP.fn.getTreeData(l_objid);
    if(!l_drag){

      //103	Drag한 UI 정보가 존재하지 않습니다.
      parent.showMessage(sap, 10, "E", 
        parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "103"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }


    //drop한 UI의 라인정보 얻기.
    var l_drop = oAPP.fn.getTreeData(i_OBJID);
    if(!l_drop){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    
    
    var _sDNDInfo = {};
    
    _sDNDInfo.sDrag = l_drag;
    _sDNDInfo.sDrop = l_drop;
      
    var _sDropLineInfo = {};

    //drop position 정보.
    _sDropLineInfo.dropPosition = _dropPosition;

    //default drop index 정보 매핑.
    _sDropLineInfo.dropIndex    = l_drop.zTREE.length;
    
    _sDNDInfo.sDropLineInfo = _sDropLineInfo;
    

    //drop 대상 UI 얻기.(drop index 정보 매핑처리함)
    l_drop = oAPP.oDesign.fn.getDropTargetLine(_sDNDInfo);
      
    
    if(typeof l_drop === "undefined"){

      //245	DROP 처리 UI를 찾을 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "245"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }
    


    //dragUI명과 dropUI명이 같은경우 exit.
    if(l_drag.OBJID === l_drop.OBJID){

      delete l_drop.dropLineInfo;

      //246	해당 영역에 UI를 DROP 할 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "246"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.
    if(oAPP.fn.designChkHiddenAreaUi(l_drag.UIOBK, l_drop.UIOBK) === true){

      delete l_drop.dropLineInfo;

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //DRAG UI와 DROP UI의 이동 가능 여부 점검.
    if(oAPP.fn.chkDnDPossible(l_drag.zTREE, l_drop.OBJID)){

      delete l_drop.dropLineInfo;

      //246	해당 영역에 UI를 DROP 할 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "246"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }


    //drop 라인의 drop 가능 flag 처리가 되지 않은경우.
    if(l_drop.drop_enable === false){

      delete l_drop.dropLineInfo;
      
      //246	해당 영역에 UI를 DROP 할 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "246"));

      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }


    //이벤트 발생 x, y 좌표값 얻기.
    var l_pos = oAPP.fn.getMousePosition();

    //aggregation 선택 팝업 호출 처리.
    if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){
      oAPP.fn.aggrSelectPopup(l_drag, l_drop, oAPP.fn.drop_cb, l_pos.x, l_pos.y);
      return true;
    }

    //aggregation 선택 팝업 호출 처리.
    oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
      oAPP.fn.aggrSelectPopup(l_drag, l_drop, oAPP.fn.drop_cb, l_pos.x, l_pos.y);
    });

    return true;

  };  //drop 처리 function.




  //drop 대상 라인 정보 얻기.
  oAPP.oDesign.fn.getDropTargetLine = function(sDNDInfo){
	
    if(typeof sDNDInfo?.sDrop === "undefined"){
      return;
    }
    
    if(typeof sDNDInfo?.sDropLineInfo === "undefined"){
      return;
    }
    
    
    var _sTarget = sDNDInfo?.sDrop;
    
    var _sDropLineInfo = sDNDInfo.sDropLineInfo;
    
    
    //현재 DROP이 이전에 사용하는 DROP인경우(박스 형식의 DROP 이펙트)
    if(_sDropLineInfo.dropPosition === sap.ui.core.dnd.RelativeDropPosition.On){
      //DROP 라인에 DROP 이펙트, DROP INDEX 정보 매핑 후 RETURN.
      _sTarget.dropLineInfo = _sDropLineInfo;
      
      return _sTarget;
    }
  
    
    var _aRows = oAPP.attr.ui.oLTree1.getRows();
      
    //현재 drop 라인에 해당하는 위치 얻기.
    var _targetPos = _aRows.findIndex( oUi => oUi.getBindingContext && 
      oUi.getBindingContext().getProperty("OBJID") === _sTarget.OBJID );
    
    if(_targetPos === -1){
      return;
    }
    
    
    //drop의 라인 정보 얻기.
    var _oRow = _aRows[_targetPos];
    
    if(typeof _oRow === "undefined"){
      return;
    }
    
    
    //DROP 위치가 라인 이전(Before)인경우.
    if(_sDropLineInfo.dropPosition === sap.ui.core.dnd.RelativeDropPosition.Before){
        
      //drop의 직전 라인 얻기.
      var _oRow = _aRows[_targetPos - 1];
      
      if(typeof _oRow === "undefined"){
        return;
      }
      
      var _oCtxt = _oRow.getBindingContext();
      
      if(typeof _oCtxt === "undefined" || _oCtxt === null){
        return;
      }
      
      //직전 라인을 DROP 대상으로 설정.
      _sTarget = _oCtxt.getProperty();
            
    }	
    
    
    //design tree의 바인딩 정보 얻기.
    var _oBind = oAPP.attr.ui.oLTree1.getBinding();
    
    if(typeof _oBind === "undefined" || _oBind === null){
      return;
    }
  
    
    
    //현재 DROP design 라인이 펼침 상태 인경우
    if(_oRow.isExpanded() === true){
      
      _sDropLineInfo.dropIndex = 0;
      
      //DROP 라인에 DROP 이펙트, DROP INDEX 정보 매핑 후 RETURN.
      _sTarget.dropLineInfo = _sDropLineInfo;
      
      //현재 UI 정보 return.					
      return _sTarget;
    }
      
    
    //현재 DROP design 라인이 접힘 상태 인경우
      
    //부모 design 라인 정보를 drop design으로 판단.
    var _sParent = oAPP.fn.getTreeData(_sTarget.POBID);
          
    if(typeof _sParent === "undefined"){
      return;
    }
     
    
    //DROP 대상 UI가 부모의 몇번째 위치 인지 INDEX 발췌.
    _sDropLineInfo.dropIndex = _sParent.zTREE.findIndex( item => item.OBJID === _sTarget.OBJID );
    

    if(typeof sDNDInfo.sDrag === "undefined"){

      _sDropLineInfo.dropIndex++;

      _sParent.dropLineInfo = _sDropLineInfo;
    
      return _sParent;

    }
    

    //현재 부모에 DRAG UI의 위치 존재 여부 확인.
    var _beforeDragPos = _sParent.zTREE.findIndex( item => item.OBJID === sDNDInfo.sDrag.OBJID );
    
    
    if(_beforeDragPos === -1){
      //현재 부모에 drag UI가 존재하지 않는경우 DROP의 다음 위치에 UI 추가.
      _sDropLineInfo.dropIndex++;
      
    }else if(_beforeDragPos > _sDropLineInfo.dropIndex){
      //현재 부모에 drag UI가 존재하며, DRAG UI가 DROP 위치 다음에 존재하는경우, DROP의 다음 위치에 UI 추가.
      _sDropLineInfo.dropIndex++;

    }else if(_beforeDragPos <= _sDropLineInfo.dropIndex  && oAPP.attr.ui.oLTree1.__dropEffect === "Copy"){
      //현재 부모에 drag UI가 존재하며, DRAG UI가 DROP의 이전 위치에 존재하지만, COPY 처리된경우 DROP의 다음 위치에 UI 추가.
      _sDropLineInfo.dropIndex++;

    }

    
    _sParent.dropLineInfo = _sDropLineInfo;
    
    return _sParent;
      
    
  }; //drop 대상 라인 정보 얻기.




  //design tree의 체크박스 선택건 존재여부 확인 펑션.
  oAPP.fn.designCheckedLine = function(bFrist, is_tree){

    //function 최초 호출시.
    if(bFrist){
      //root를 시작점으로 설정.
      is_tree = oAPP.attr.oModel.oData.zTREE[0];
    }

    //선택 라인 정보가 존재하는 경우.
    if(is_tree.chk === true){
      //찾음 flag return
      return true;
    }

    //child정보가 존재하지 않는경우 exit.
    if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

    //child를 탐색하며 선택건 존재여부 확인.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
      var l_chk = oAPP.fn.designCheckedLine(false, is_tree.zTREE[i]);

      //선택건이 존재하는 경우 찾음 flag return
      if(l_chk === true){return true;}
    }

  };  //design tree의 체크박스 선택건 존재여부 확인 펑션.




  //대상 tree라인이 n건 바인딩 처리된경우 부모를 찾아 자신 UI의 바인딩 수집건 제거 처리.
  oAPP.fn.designUnbindLine = function(is_tree){

    //해당 UI의 바인딩처리 수집건 제거 처리.
    for(var i=0, l=oAPP.attr.prev[is_tree.OBJID]._T_0015.length; i<l; i++){
      //바인딩 처리건이 아닌경우 SKIP.
      if(oAPP.attr.prev[is_tree.OBJID]._T_0015[i].ISBND !== "X"){continue;}

      //바인딩 처리건인경우 UI에 N건 정보 수집 됐다면 해제 처리.
      oAPP.fn.attrUnbindProp(oAPP.attr.prev[is_tree.OBJID]._T_0015[i]);

    }

  };  //대상 tree라인이 n건 바인딩 처리된경우 부모를 찾아 자신 UI의 바인딩 수집건 제거 처리.



  
  //멀티 삭제 처리.
  oAPP.fn.designTreeMultiDeleteItem = function(){
    
    //선택라인 삭제처리.
    function lf_delSelLine(it_tree){

      if(it_tree.length === 0){return;}

      //DESIGN TREE에서 CHECKBOX 선택건 삭제 처리.
      for(var i=it_tree.length-1; i>=0; i--){

        //재귀호출하며 선택한 라인정보 삭제 처리.
        lf_delSelLine(it_tree[i].zTREE);


        //체크박스가 선택안된 경우 하위 로직 skip.
        if(it_tree[i].chk !== true){continue;}


        //클라이언트 이벤트 및 sap.ui.core.HTML의 프로퍼티 입력건 제거 처리.
        oAPP.fn.delUiClientEvent(it_tree[i]);

        //Description 정보 삭제.
        oAPP.fn.delDesc(it_tree[i].OBJID);

        //대상 tree라인이 n건 바인딩 처리된경우 부모를 찾아 자신 UI의 바인딩 수집건 제거 처리.
        oAPP.fn.designUnbindLine(it_tree[i]);

        //팝업 수집건에서 해당 UI 제거 처리.
        oAPP.fn.removeCollectPopup(it_tree[i].OBJID);
        

        //삭제건의 부모가 자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 처리.
        oAPP.attr.ui.frame.contentWindow.setChildUiException(it_tree[i].PUIOK, it_tree[i].POBID, undefined, undefined, true);

        //미리보기에 해당 UI삭제 처리.
        oAPP.attr.ui.frame.contentWindow.delUIObjPreView(it_tree[i].OBJID, it_tree[i].POBID, it_tree[i].PUIOK, it_tree[i].UIATT, it_tree[i].ISMLB, it_tree[i].UIOBK);

        //미리보기 UI destroy 처리.
        oAPP.attr.ui.frame.contentWindow.destroyUIPreView(it_tree[i].OBJID);

        //UI수집건에 해당 UI 제거 처리.
        delete oAPP.attr.prev[it_tree[i].OBJID];

        //현재 미리보기 예외처리 대상 UI가 삭제되는 UI인경우.
        if(oAPP.attr?.UA015UI?._OBJID === it_tree[i].OBJID){
          //예외처리 UI 정보 제거.
          delete oAPP.attr.UA015UI;
        }

        var ls_tree = it_tree[i];

        //해당 라인 삭제.
        it_tree.splice(i,1);

        //미리보기의 직접 입력 가능한 UI의 직접 입력건 반영처리.
        oAPP.fn.previewSetStrAggr(ls_tree);
        
      } //DESIGN TREE에서 CHECKBOX 선택건 삭제 처리.

    } //선택라인 삭제처리.


    //체크박스 선택건 존재여부 확인.
    if(oAPP.fn.designCheckedLine(true) !== true){
      //존재하지 않는경우 오류 메시지 처리.
      //286	Check box not selected.
      parent.showMessage(sap, 20, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "286", "", "", "", ""));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;

    }

    //현재 우측에 출력한 UI의 TREE 정보 얻기.
    var ls_tree = oAPP.fn.getTreeData(oAPP.attr.oModel.oData.uiinfo.OBJID);

    //현재 선택건의 OBJID 매핑.
    var l_objid = ls_tree.OBJID;
        
    //해당 라인의 삭제를 위해 선택된경우.
    if(ls_tree.chk === true){
      //선택 라인으로부터 가장 직전의 선택하지 않은 라인 정보 얻기.    
      l_objid = oAPP.fn.designGetPreviousTreeItem(ls_tree.OBJID);

    }

    //직전 라인 정보를 얻지 못한 경우 ROOT를 선택 처리.
    if(typeof l_objid === "undefined"){
      l_objid = "ROOT";
    }

    var lt_OBJID = [];

    //CHECKBOX 선택건 수집 처리.
    oAPP.fn.designGetCheckedLine(true, lt_OBJID);

    //378  &1 rows has been selected.
    //003	Do you really want to delete the object?
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "378", lt_OBJID.length, "", "", "") + "\n" +
      oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "003", "", "", "", "");

    lt_OBJID = [];

    
    parent.setBusy("");

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);

    //삭제전 확인팝업 호출.
    //003	Do you really want to delete the object?
    parent.showMessage(sap, 30, "I", l_txt, async function(oEvent){

      parent.setBusy("X");


      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      //YES를 선택하지 않은경우 EXIT.
      if(oEvent !== "YES"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
      }

            
      //멀티 삭제시 파라메터 정보 구성.
      var _aDeleteParam = parent.require(oAPP.oDesign.pathInfo.undoRedo).getMultiDeleteParam();

      //UNDO 이력 추가.
      parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("MULTI_DELETE", _aDeleteParam);
      
      
      //선택한 라인의 부모 정보 수집.
      var _aParent = oAPP.fn.collectSelectParent(oAPP.attr.oModel.oData.zTREE);


      //수집한 정보를 깊은 복사 처리.
      _aParent = JSON.parse(JSON.stringify(_aParent));


      //복사된 정보에서 선택된 라인 제거.
      oAPP.fn.deleteCheckedLine(_aParent);


      //멀티 삭제시 삭제UI의 부모에 onAfterRendering 처리.
      var _aPromise = oAPP.fn.addMultiDelAfterRendering(_aParent);


      //선택 라인 삭제 처리.
      lf_delSelLine(oAPP.attr.oModel.oData.zTREE);


      // //모델 갱신 처리.
      // oAPP.attr.oModel.refresh();


      //부모 UI가 다시 그려질때까지 대기.
      //(onAfterRendering 처리 대상건이 존재하지 않는경우 바로 하위 로직 수행됨)
      await Promise.all(_aPromise);

      
      //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
      await oAPP.fn.designRefershModel();


      //메뉴 선택 tree 위치 펼침 처리.
      await oAPP.fn.setSelectTreeItem(l_objid);

      //변경 FLAG 처리.
      oAPP.fn.setChangeFlag();      

      //005  Job finished.
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));


      //20240621 pes.
      //바인딩 팝업의 디자인 영역 갱신처리.
      oAPP.fn.updateBindPopupDesignData();


    }); //삭제전 확인팝업 호출.


  };  //멀티 삭제 처리.


  /*********************************************************
   * @function - 선택한 라인의 부모 정보 수집 처리.
   ********************************************************/
  oAPP.fn.collectSelectParent = function(aTree, aCollect = []){
    
    if(typeof aTree === "undefined"){
      return;
    }
    
    if(aTree.length === 0){
      return;
    }
    
    for(var i = 0, l = aTree.length; i < l; i++){
      
      var _sTree = aTree[i];
      
      //현재 라인이 선택된 경우.
      if(_sTree.chk === true){
        
        //선택건 수집 정보에 해당 라인이 존재하는지 확인.
        if(aCollect.findIndex( item => item.OBJID === _sTree.POBID) === -1){
          
          //현재 라인의 부모 라인 정보 얻기.
          var _sParent = oAPP.fn.getTreeData(_sTree.POBID);
          
          //존재하지 않는경우 수집 처리.
          aCollect.push(_sParent);
        }
        
        continue;
        
      }
      
      //하위를 탐색하며 선택된 라인 정보 수집.
      oAPP.fn.collectSelectParent(_sTree.zTREE, aCollect);
      
    }
    
    return aCollect;
    
  };



  /*********************************************************
   * @function - 멀티 삭제시 삭제UI의 부모에 onAfterRendering 처리.
   ********************************************************/
  oAPP.fn.addMultiDelAfterRendering = function(aParent){
    
    var _aPromise = [];
      
    //수집된 부모 UI 정보가 존재하지 않는경우 exit.
    if(typeof aParent === "undefined"){
      return _aPromise;
    }
    
    //수집된 부모 UI 정보가 존재하지 않는경우 exit.
    if(aParent.length === 0){
      return _aPromise;
    }
    

    //미리보기 onAfterRendering 처리 관련 module load.
    var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);

    
    //수집된 부모 UI가 화면에 출력된 UI인경우 onAfterRendering 이벤트 등록. 
    for( var i = 0, l = aParent.length; i < l; i++){
      
      var _sParent = aParent[i];
      
      //부모 UI 정보 얻기.
      var _oParent = oAPP.attr.prev[_sParent.OBJID];
      
      
      //부모 UI가 존재하지 않는경우 skip.
      if(typeof _oParent === "undefined"){
        continue;
      }

      
      //대상 UI의 onAfterRendering 처리 대상 UI 찾기.
      var _oTarget = _oRender.getTargetAfterRenderingUI(_oParent);

      if(typeof _oTarget === "undefined"){
        continue;
      }
      
      //부모 UI의 dom 정보 확인 function이 존재하지 않는경우 skip.
      if(typeof _oTarget?.getDomRef !== "function"){
        continue;
      }
      
      //부모 UI의 dom 정보 얻기.
      var _oDom = _oTarget.getDomRef();
      
      //부모 UI가 화면에 출력되지 않는경우 skip.
      if(typeof _oDom === "undefined" || _oDom === null){
        continue;
      }

      
      //화면에 출력된 UI라면 onAfterRendering 이벤트 등록. 
      _aPromise.push(_oRender.setAfterRendering(_oTarget));

      
      //현재 수집된 UI의 직속 child에 존재하는 richtexteditor UI에 readyRecurring이벤트 등록처리
      //(editor가 충분히 그려진 이후 이벤트).
      var _aRichProm = _oRender.renderingRichTextEditor(_sParent);
      
      if(_aRichProm.length > 0){
        _aPromise = _aPromise.concat(_aRichProm);
      }
      
      _oTarget.invalidate();
      
      
    }
    
    return _aPromise;
    
  };


  /*********************************************************
   * @function - 선택된 라인 제거.
   ********************************************************/
  oAPP.fn.deleteCheckedLine = function(aParent){
    
    //수집된 부모 UI 정보가 존재하지 않는경우 exit.
    if(typeof aParent === "undefined"){
      return;
    }
    
    //수집된 부모 UI 정보가 존재하지 않는경우 exit.
    if(aParent.length === 0){
      return;
    }
    
    
    for( var i = aParent.length - 1; i >= 0; i--){
      
      var _sParent = aParent[i];
      
      //라인이 선택된 경우 삭제 처리.
      if(_sParent.chk === true){
        aParent.splice(i , 1);
        continue;
      }
      
      //하위를 탐색하며 선택된 라인 제거.
      oAPP.fn.deleteCheckedLine(_sParent.zTREE);		
      
    }
    
  };


  //대상 OBJID의 직전 라인 OBJID 얻기.
  oAPP.fn.designGetPreviousTreeItem = function(OBJID){

    var l_bind = oAPP.attr.ui.oLTree1.getBinding(),
        l_ctxt, ls_tree, l_before;

    //현재 화면에 출력됐던 라인 정보를 기준으로 선택 안된 라인 판단.
    for(var i = 0, l = oAPP.fn.designGetTreeItemCount(); i < l; i++){

      //context 정보 얻기.
      l_ctxt = l_bind.getContextByIndex(i);
      if(!l_ctxt){break;}

      //해당 라인 정보 얻기.
      ls_tree = l_ctxt.getProperty();

      //현재 UI INFO에 출력되고 있는 UI명과 동일건 까지 탐색한 경우.
      if(OBJID === ls_tree.OBJID){
        //loop 종료.
        break;
      }

      //선택된건이 아닌경우.
      if(ls_tree.chk != true){
        //선택되지 않은건 정보 매핑.
        l_before = ls_tree.OBJID;
      }      

    }

    //직전 라인의 OBJID를 찾지 못한경우 ROOT정보 RETURN.
    return l_before || "ROOT";


  };  //대상 OBJID의 직전 라인의 OBJID 얻기.


  //design tree 영역의 item 수 계산.
  oAPP.fn.designGetTreeItemCount = function(){

    function lf_calcItem(it_tree){
      if(typeof it_tree === "undefined"){return;}

      l_cnt += it_tree.length;

      for(var i = 0, l = it_tree.length; i < l; i++){
        lf_calcItem(it_tree[i].zTREE);
      }

    }
    
    var l_cnt = 0;   
    
    lf_calcItem(oAPP.attr.oModel.oData.zTREE);

    return  l_cnt;


  };  //design tree 영역의 item 수 계산.


  //checkbox 선택처리된 항목 얻기.
  oAPP.fn.designGetCheckedLine = function(bFirst, et_chked, is_tree){

    //function 최초 호출 flag가 존재하는경우.
    if(bFirst){
      //ROOT를 시작점으로 설정.
      is_tree = oAPP.attr.oModel.oData.zTREE[0];
    }

    //현재 라인이 체크박스 선택된건인경우.
    if(is_tree.chk){
      //현재라인의 OBJID 수집 처리.
      et_chked.push({OBJID:is_tree.OBJID, UIOBK:is_tree.UIOBK});
    }

    //현재 라인의 CHILD가 존재하지 않는경우 EXIT.
    if(is_tree.zTREE.length === 0){return;}

    //CHILD가 존재하는경우.
    for(var i=0, l=is_tree.zTREE.length; i<l; i++){

      //하위를 탐색하며, CHECKBOX 선택건 수집 처리.
      oAPP.fn.designGetCheckedLine(false, et_chked, is_tree.zTREE[i]);

    }

  };  //checkbox 선택처리된 항목 얻기.




  //design tree 필터 처리.
  oAPP.fn.designSetFilter = function(sVal){
    
    //design tree의 바인딩 정보 검색.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding();
    if(!l_bind){return;}
    
    //입력값이 존재하지 않는경우.
    if(sVal === ""){
      //필터 해제 처리.
      l_bind.filter();
      return;
    }

    //입력값으로 design tree filter 처리.
    l_bind.filter(new sap.ui.model.Filter({path:"OBJID", operator:"Contains",value1:sVal}));

    //tree 전체 펼침 처리.
    oAPP.attr.ui.oLTree1.expandToLevel(999999999999);

  };  //design tree 필터 처리.



  //design tree의 move position 마크 처리.
  oAPP.fn.designMoveMark = function(is_parent, OBJID, pos, bReset){

    for(var i=0, l=is_parent.zTREE.length; i<l; i++){

      //초기화 처리 flag가 입력된경우 표현 제거.
      if(bReset === true){
        is_parent.zTREE[i].highlight = "None";
        continue;
      }

      //이동 가능 UI에 대한 표현 처리.
      is_parent.zTREE[i].highlight = "Indication04";

      //이동 대상 OBJID인경우.
      if(is_parent.zTREE[i].OBJID === OBJID){
        is_parent.zTREE[i].highlight = "Indication08";
      }

      //MOVE 대상 INDEX 인경우.
      if(i + 1 === pos){
        is_parent.zTREE[i].highlight = "Indication02";
      }

    }

    //초기화 처리가 아닌경우 OBJID에 해당하는 라인으로 scroll 처리.
    if(!bReset){
      oAPP.fn.designSetScrollPosOBJID(is_parent.zTREE[pos-1].OBJID);
    }

    oAPP.attr.oModel.refresh();
    
  };  //design tree의 move position 마크 처리.




  //design tree의 OBJID에 해당하는 라인으로 scroll 처리.
  //(화면에 OBJID가 존재하는경우 scroll 처리 안함)
  oAPP.fn.designSetScrollPosOBJID = function(OBJID){

    //tree의 child를 탐색하며 OBJID에 해당하는 라인 검색.
    function lf_findPos(oNode){

      //context 정보가 없다면 exit.
      if(!oNode?.context){return true;}

      //position + 1.
      l_pos++;

      //대상 라인을 찾은경우 exit.
      if(oNode.context.getProperty("OBJID") === OBJID){
        return true;
      }      
      
      if(oNode.children.length === 0){return;}

      //child가 존재한다면 하위를 탐색하며 OBJID에 해당하는 라인 검색.
      for(var i=0, l=oNode.children.length; i<l; i++){
        
        //CHILD에 해당 하는 라인인경우 position 계산 후 exit.
        if(oNode?.children[i]?.context?.getProperty("OBJID") === OBJID){
          l_pos++;
          return true;
        }

        //해당 라인이 펼쳐지지 않았다면 position 계산 후 하위 탐색 skip.
        if(!oNode?.children[i]?.nodeState?.expanded){
          l_pos++;
          continue;
        }        

        //해당 라인이 펼쳐져 있다면 하위를 탐색하며 OBJID에 해당하는건 탐색.
        if(lf_findPos(oNode.children[i])){
          return true;
        }

      }

    } //tree의 child를 탐색하며 OBJID에 해당하는 라인 검색.

    
    //현재 화면에 표현된 ROW정보 얻기.
    var lt_row = oAPP.attr.ui.oLTree1.getRows();

    if(lt_row.length === 0){return;}

    //화면에 표현된 ROW에 입력 OBJID가 해당되는지 확인.
    for(var i=0, l=lt_row.length; i<l; i++){
      
      var l_ctxt = lt_row[i].getBindingContext();
      if(!l_ctxt){return;}

      //현재 화면에 표현된 UI에 입력된 OBJID가 포함되면 SCROLL을 이동할 필요가 없기에 EXIT.
      if(l_ctxt.getProperty("OBJID") === OBJID){return;}

    }

    //화면에 표현된 ROW에 OBJID가 해당되지 않는다면.

    //바인딩 정보 얻기.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding("rows");
    if(!l_bind){return;}

    var l_pos = -1;

    //scroll 이동 position 계산처리.
    lf_findPos(l_bind._oRootNode.children[0]);

    //position 계산에 실패한경우 exit.
    if(l_pos === -1){return;}

    if(oAPP.attr.ui.oLTree1.getFirstVisibleRow() < l_pos){
      l_pos = l_pos - oAPP.attr.ui.oLTree1.getVisibleRowCount() + 1;
    }

    //해당 라인으로 이동 처리.
    oAPP.attr.ui.oLTree1.setFirstVisibleRow(l_pos);

  };  //design tree의 OBJID에 해당하는 라인으로 scroll 처리.



  //예외처리로 추가된 UI 제거 처리.
  oAPP.fn.destroyExcepChild = function(is_tree, sAggr) {

    //자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 항목에 해당하는건이 아닌경우 exit.
    if(oAPP.attr.S_CODE.UA050.findIndex( item => item.FLD01 === is_tree.UIOBK && item.FLD08 !== "X") === -1){
      return;
    }

    //getAggregation명 얻기.
    var _getAggrName = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[is_tree.OBJID], "3", sAggr.UIATT, "_sGetter");
    
    if(typeof _getAggrName === "undefined" || _getAggrName === ""){
      return;
    }

    //DESIGN에 그려전 CHILD UI 정보 얻기.
    var _aChild = oAPP.attr.prev[is_tree.OBJID][_getAggrName]();

    //child정보가 없다면 exit.
    if(typeof _aChild === "undefined" || _aChild === null){
      return;
    }

    //해당 child가 N건 입력 가능한 aggregation인경우 추가된 UI가 없다면 exit.
    if(Array.isArray(_aChild) === true && _aChild.length === 0){
      return;
    }

    //화면에 그려전 child 정보 중 공통코드 UA050의 예외처리로 그려진 UI건 제거.
    for (let i = 0; i < _aChild.length; i++) {
      
      var _oChild = _aChild[i];

      //UI에 매핑한 OBJECT ID 가 있다면 SKIP.
      if(typeof _oChild._OBJID !== "undefined"){
        continue;
      }

      //custom data에 매핑한 UI OBJECT ID가 있다면 SKIP.
      if(typeof _oChild.data === "function" && _oChild.data("OBJID") !== null){
        continue;
      }

      //예외처리로 그려진건 인경우 제거 처리.
      if(typeof _oChild.destroy === "function"){
        _oChild.destroy();
      }      
      
    }

  };



  //UI 추가 처리.
  oAPP.fn.designAddUIObject = async function(is_tree, is_0022, is_0023, i_cnt){


    var _sDropLineInfo = is_tree?.dropLineInfo || undefined;
    delete is_tree?.dropLineInfo;

    if(typeof _sDropLineInfo === "undefined"){

      _sDropLineInfo = {};

      _sDropLineInfo.dropPosition = undefined;
      _sDropLineInfo.dropIndex    = undefined;

      //기존 로직의 마지막 위치에 UI 추가를 위한 index 매핑.
      _sDropLineInfo.dropIndex = is_tree.zTREE.length;

    }



    //UI가 입력 가능한 카디널리티 여부 확인.
    if(oAPP.fn.chkUiCardinality(is_tree, is_0023.UIATK, is_0023.ISMLB) === true){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");

      return;
    }

    var l_cnt = i_cnt;

    //[워크벤치] 특정 API / UI 에 대한 중복 대상 관리 여부 확인.
    if(oAPP.fn.designChkUnique(is_0022.UIOBK, l_cnt) === true){    
      
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");

      return;
    }

    //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.
    if(oAPP.fn.designChkHiddenAreaUi(is_0022.UIOBK, is_tree.UIOBK) === true){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");

      return;
    }
    

    //UI의 허용 가능 부모 정보
    //(특정 UI는 특정 부모에만 존재해야함.)
    if(oAPP.fn.designChkFixedParentUI(is_0022.UIOBK, is_tree.UIOBK, is_0023.UIATT) === true){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      
      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");
      
      return;
    }


    //20240723 PES -START.
    //현재 UI의 대상 Aggregation에 추가 불가능한 UI여부 점검로직.
    var _sParam = {};

    //현재 UI.
    _sParam.UIOBK       = is_tree.UIOBK;

    //추가 대상 AGGREGATION.
    _sParam.UIATT       = is_0023.UIATT;

    //추가 UI.
    _sParam.CHILD_UIOBK = is_0022.UIOBK;


    var _modulePath = parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, "js", "exception", "exceptionUI.js");

    //부모의 Aggregation에 추가 불가능한 UI인지 확인.
    var _deny = parent.require(_modulePath).checkDenyChildAggr(_sParam);

    if(_deny === true){
      
      //214	&1 UI는 &2의 &3 Aggregation에 추가 할 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(
        oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "214", is_0022.UIOBJ, is_tree.OBJID, is_0023.UIATT));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("");
      
      return;

    }
    //20240723 PES -END.
    
    
    //context menu 호출 UI의 child 정보가 존재하지 않는경우 생성.
    if(!is_tree.zTREE){
      is_tree.zTREE = [];
    }

    //부모 UI의 입력한 AGGREGATION정보 얻기.
    var ls_0015 = oAPP.attr.prev[is_tree.OBJID]._T_0015.find( a => a.UIATK === is_0023.UIATK && a.UIATY === "3" );

    //대상 AGGREGATION에 바인딩 처리된경우 추가하고자 하는 UI를 2개 이상 입력했다면 알림 메시지, UI는 1개만 추가되게 처리.
    if(typeof ls_0015 !== "undefined" && ls_0015.UIATV !== "" && ls_0015.ISBND === "X" & l_cnt >= 2){
      l_cnt = 1;
      //021	The object is already specified in Aggrigation.
      parent.showMessage(sap, 10, "W", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "021", "", "", "", ""));
    }


    //미리보기 onAfterRendering 처리 관련 module load.
    var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);


    //onAfterRendering 이벤트 등록 대상 UI 얻기.
    let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[is_tree.OBJID]);
    
    let _oDom = undefined;

    if(typeof _oTarget?.getDomRef === "function"){
      _oDom = _oTarget.getDomRef();
    }
    
    let _oPromise = undefined;
    
    //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
    if(typeof _oDom !== "undefined" && _oDom !== null){
      _oPromise = _oRender.setAfterRendering(_oTarget);
    }

    
    var _aInsertChild = [];
    
    var _dropIndex = _sDropLineInfo.dropIndex;

    var _posit = 0;

    //같은 aggregation안에 있는 UI중 부모에 추가되지 않은 UI 존재 여부 확인.
    for(var i = 0; i < _dropIndex; i++){

      var _sTree =  is_tree.zTREE[i];

      if(oAPP.attr.S_CODE.UA026.findIndex( item => item.FLD01 === _sTree.UILIB ) !== -1){
        continue;
      }

      _posit++;

    }


    //UI 반복 횟수만큼 그리기.
    for(var i = 0; i < l_cnt; i++){

      //14번 저장 구조 생성.
      var l_14 = oAPP.fn.crtStru0014();

      //바인딩 처리 필드 생성.
      oAPP.fn.crtTreeBindField(l_14);


      l_14.APPID = oAPP.attr.appInfo.APPID;
      l_14.GUINR = oAPP.attr.appInfo.GUINR;

      //UI명 구성.
      l_14.OBJID = oAPP.fn.setOBJID(is_0022.UIOBJ);
      l_14.POBID = is_tree.OBJID;
      l_14.UIOBK = is_0022.UIOBK;
      l_14.PUIOK = is_tree.UIOBK;

      l_14.UIATK = is_0023.UIATK;
      l_14.UIATT = is_0023.UIATT;
      l_14.UIASN = is_0023.UIASN;
      l_14.UIATY = is_0023.UIATY;
      l_14.UIADT = is_0023.UIADT;
      l_14.UIADS = is_0023.UIADS;
      l_14.ISMLB = is_0023.ISMLB;

      l_14.UIFND = is_0022.UIFND;
      l_14.PUIATK = is_0023.UIATK;
      l_14.UILIB = is_0022.LIBNM;
      l_14.ISEXT = is_0022.ISEXT;
      l_14.TGLIB = is_0022.TGLIB;

      l_14.ISECP = is_0022.ISECP;

      //추가버튼 활성화.
      l_14.visible_add    = true;

      //삭제 버튼 활성화.
      l_14.visible_delete = true;

      //UI ICON 구성.
      l_14.UICON = oAPP.fn.fnGetSapIconPath(is_0022.UICON);

      //tree embeded aggregation 아이콘 표현.
      oAPP.fn.setTreeAggrIcon(l_14);

      //default 아이콘 비활성 처리.
      l_14.icon_visible = false;

      //아이콘이 존재하는 경우 아이콘 활성 처리.
      if(typeof l_14.UICON !== "undefined" && l_14.UICON !== ""){
        l_14.icon_visible = true;
      }

      
      // //context menu 호출 라인의 child에 추가한 UI정보 수집.
      // is_tree.zTREE.push(l_14);
      

      //대상 위치에 UI 추가 처리.
      is_tree.zTREE.splice(_dropIndex, 0, l_14);


      var ls_0015 = oAPP.fn.crtStru0015();
      
      //embed aggregation 정보 구성.
      ls_0015.APPID = oAPP.attr.appInfo.APPID;
      ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
      ls_0015.OBJID = l_14.OBJID;
      ls_0015.UIOBK = is_0022.UIOBK;
      ls_0015.UIATK = is_0023.UIATK;
      ls_0015.UILIK = is_0022.UILIK;
      ls_0015.UIATT = is_0023.UIATT;
      ls_0015.UIASN = is_0023.UIASN;
      ls_0015.UIADT = is_0023.UIADT;
      ls_0015.UIATY = "6";
      ls_0015.ISMLB = is_0023.ISMLB;
      ls_0015.ISEMB = "X";


      //기존에 부모의 맨 마지막에 UI를 추가하는 로직 주석 처리.
      //(개선된 UI 추가에서는 특정 위치에 UI를 추가할 수 있기때문)
      // //미리보기 UI 추가
      // oAPP.attr.ui.frame.contentWindow.addUIObjPreView(l_14.OBJID, l_14.UIOBK, l_14.UILIB, 
      //   l_14.UIFND, l_14.POBID, l_14.PUIOK, is_0023.UIATT, [ls_0015], 
      //   oAPP.attr.S_CODE.UA018, oAPP.attr.S_CODE.UA032, oAPP.attr.S_CODE.UA030, 
      //   oAPP.attr.S_CODE.UA026, oAPP.attr.S_CODE.UA050);

      //UI 생성 처리.
      oAPP.attr.ui.frame.contentWindow.createUIInstance(l_14, [ls_0015]);


      //SAP.UI.RICHTEXTEDITOR.RICHTEXTEDITOR UI의 예외처리 script 구성.
      oAPP.attr.ui.frame.contentWindow.setRichTextEditorException(l_14.UIOBK, l_14.OBJID);


      //자식 UI가 필수인 UI에 자식이 없는경우 강제추가 예외처리.
      oAPP.attr.ui.frame.contentWindow.setChildUiException(l_14.UIOBK, l_14.OBJID, l_14.zTREE, oAPP.attr.S_CODE.UA050);

      //부모에 생성한 UI 추가.
      oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(l_14.OBJID, l_14.UILIB, l_14.POBID, 
        l_14.PUIOK, l_14.UIATT, _posit, l_14.ISMLB, l_14.UIOBK, true);

      
      //미리보기 예외처리 UI 추가 draw 처리.
      oAPP.fn.prevDrawExceptionUi(l_14.UIOBK, l_14.OBJID);
        
      //부모에 추가할 index 증가 처리.
      _dropIndex++;

      _posit++;

      //aggregation 정보 초기화.
      ls_0015 = {};

      //file uploader UI의 uploaderUrl 프로퍼티 예외처리.
      oAPP.fn.attrUploadUrlException(l_14.OBJID, l_14.UIOBK);


      //UNDO시 추가된 UI 삭제를 위한 수집 처리.
      _aInsertChild.push(l_14);
      

    } //UI 반복 횟수만큼 그리기.


    //UNDO 이력 추가 처리.
    parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("INSERT", _aInsertChild);
        

    // //MODEL 갱신 처리.
    // oAPP.attr.oModel.refresh();


    //예외처리로 추가된 UI 제거 처리.
    oAPP.fn.destroyExcepChild(is_tree, is_0023);

    
    //RichTextEditor 미리보기 출력 예외처리로직.
    var _aPromise = _oRender.renderingRichTextEditor(is_tree);


    //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
    if(typeof _oPromise !== "undefined"){
      _oTarget.invalidate();
      
      //onAfterRendering 수행까지 대기.
      await _oPromise;

    }

    //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
    //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
    await Promise.all(_aPromise);


    //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
    await oAPP.fn.designRefershModel();


    //design tree의 tree binding 정보 갱신 처리.
    var l_bind = oAPP.attr.ui.oLTree1.getBinding();
    l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

    //신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
    //oAPP.attr.prev[l_14.OBJID].__isnew = "X";

    //메뉴 선택 tree 위치 펼침 처리.
    await oAPP.fn.setSelectTreeItem(l_14.OBJID);


    //변경 FLAG 처리.
    oAPP.fn.setChangeFlag();


    //20240621 pes.
    //바인딩 팝업의 디자인 영역 갱신처리.
    oAPP.fn.updateBindPopupDesignData();
 

  }; //UI 추가.



  //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
  oAPP.fn.designRefershModel = function(){

    return new Promise(async(resolve)=>{
      
      //MODEL 갱신 처리.
      oAPP.attr.oModel.refresh();


      //디자인 tree의 업데이트처리 대기.
      await new Promise((resolveTree)=>{
        oAPP.attr.ui.oLTree1.attachEventOnce("rowsUpdated", ()=>{
          return resolveTree();
        });
      });



      //미리보기 onAfterRendering 처리 관련 module load.
      var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);

      //attr table에 onAfterRendering 이벤트 등록 처리.
      var _oPromise = _oRender.setAfterRendering(oAPP.attr.ui.oRTab1);

      //attr 테이블 갱신 처리.
      oAPP.attr.ui.oRTab1.invalidate();

      await _oPromise;

      return resolve();

    });

  };


  //UI Insert popup에서 Drop했다면 UI 추가 처리.
  oAPP.fn.designUIDropInsertPopup = function(oEvent, OBJID){
    
    
    //drop POSITION정보(On, Before, After)
    var _dropPosition = oEvent.mParameters.dropPosition;


    //UI 추가.
    function lf_setChild(is_0023){

      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === l_UIOBK && a.ISDEP !== "X" && a.ISSTP !== "X" );

      //UI 추가 처리 FUNCTION 호출.
      oAPP.fn.designAddUIObject(ls_drop, ls_0022, is_0023, l_cnt);

      //drag 종료 처리.
      oAPP.fn.designDragEnd();

    } //UI 추가.


    var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
    _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215"); 

    //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

  
    //Drag한 정보 발췌.
    var lt_dragInfo = oAPP.fn.getDragParam(oEvent);
    if(!lt_dragInfo || lt_dragInfo.length !== 4){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //insert UI popup에서 drag한건이 아닌경우 exit.
    if(lt_dragInfo[0] !== "callUIInsertPopup"){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //다른 영역에서 drag했다면 exit.
    if(lt_dragInfo[3] !== oAPP.attr.DnDRandKey){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //drag한 UI의 object key.
    var l_UIOBK = lt_dragInfo[1];

    //추가할 UI 갯수.
    var l_cnt = parseInt(lt_dragInfo[2]);

    //이벤트 발생 라인 정보 얻기.
    ls_drop = oAPP.fn.getTreeData(OBJID);
    if(!ls_drop){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }


    
    var _sDNDInfo = {};
    
    _sDNDInfo.sDrag = undefined;
    _sDNDInfo.sDrop = ls_drop;
      
    var _sDropLineInfo = {};

    //drop position 정보.
    _sDropLineInfo.dropPosition = _dropPosition;

    //default drop index 정보 매핑.
    _sDropLineInfo.dropIndex    = ls_drop.zTREE.length;
    
    _sDNDInfo.sDropLineInfo = _sDropLineInfo;
    

    //drop 대상 UI 얻기.(drop index 정보 매핑처리함)
    ls_drop = oAPP.oDesign.fn.getDropTargetLine(_sDNDInfo);
      
    
    if(typeof ls_drop === "undefined"){

      //245	DROP 처리 UI를 찾을 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "245"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }
    


    //이벤트 발생 x, y 좌표값 얻기.
    var l_pos = oAPP.fn.getMousePosition();

    //aggregation 선택 팝업 호출.
    if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){
        oAPP.fn.aggrSelectPopup({UIOBK:l_UIOBK}, ls_drop, lf_setChild, l_pos.x, l_pos.y);
        return true;
    }

    //aggregation 선택 팝업이 존재하지 않는경우 js load후 호출.
    oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
        oAPP.fn.aggrSelectPopup({UIOBK:l_UIOBK}, ls_drop, lf_setChild, l_pos.x, l_pos.y);
    });

    return true;

  };  //UI Insert popup에서 Drop했다면 UI 추가 처리.




  //개인화 항목에서 D&D한 경우 UI 추가 처리.
  oAPP.fn.designUIDropP13nList = function(oEvent, is_tree){

    //drop POSITION정보(On, Before, After)
    var _dropPosition = oEvent.mParameters.dropPosition;

    var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

    //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
    _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215"); 

    //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
    parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);


    //Drag한 정보 발췌.
    var lt_dragInfo = oAPP.fn.getDragParam(oEvent);
    if(!lt_dragInfo || lt_dragInfo.length !== 3){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //개인화 리스트에서 Drag한건이 아닌경우 exit.
    if(lt_dragInfo[0] !== "P13nUIData"){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //다른 WS 세션에서 D&D 한경우 EXIT.
    if(lt_dragInfo[2] !== oAPP.attr.DnDRandKey){

      //102	다른 영역에서의 Drag 정보는 처리할 수 없습니다.
      parent.showMessage(sap, 10, "E", 
        parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "102"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    var l_itemKey = lt_dragInfo[1];

    var l_SYSID =  parent.getUserInfo()?.SYSID;
    if(!l_SYSID){
      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
      return;
    }

    //개인화 파일 정보 path 구성.
    var l_path = parent.PATH.join(parent.getPath("P13N_ROOT"), "U4A_UI_PATTERN", l_SYSID, l_itemKey);

    //실제 파일이 존재하지 않는다면 exit.
    if(!parent.FS.existsSync(l_path)){

      //017 Not exists save file.
      parent.showMessage(sap, 10, "E", 
        parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "017"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("X");

      return true;

    }

    //개인화 파일 정보 read.
    try{
      var ls_item = JSON.parse(parent.FS.readFileSync(l_path, "utf-8"));
    }catch(e){
      parent.showMessage(sap, 10, "E", e);

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("X");

      return true;
      
    }



    var _sDNDInfo = {};
    
    _sDNDInfo.sDrag = undefined;
    _sDNDInfo.sDrop = is_tree;
      
    var _sDropLineInfo = {};

    //drop position 정보.
    _sDropLineInfo.dropPosition = _dropPosition;

    //default drop index 정보 매핑.
    _sDropLineInfo.dropIndex    = is_tree.zTREE.length;
    
    _sDNDInfo.sDropLineInfo = _sDropLineInfo;
    

    //drop 대상 UI 얻기.(drop index 정보 매핑처리함)
    is_tree = oAPP.oDesign.fn.getDropTargetLine(_sDNDInfo);
      
    
    if(typeof is_tree === "undefined"){

      //245	DROP 처리 UI를 찾을 수 없습니다.
      parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "245"));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      parent.setBusy("X");

      return true;

    }


    //이벤트 발생 x, y 좌표값 얻기.
    var _sPos = oAPP.fn.getMousePosition();


    //대상 UI의 추가될 aggregation 정보 얻기.
    oAPP.fn.aggrSelectPopupOpener(ls_item.is_tree, is_tree, _sPos).then((sRes)=>{

      if(sRes.RETCD === "E"){
        //default 메시지 유형(messageToast)
        var _KIND = 10;

        //aggregation 선택 건이 존재하지 않는 return code를 받은경우.
        if(sRes.RCODE === "02"){
            //messageBox로 처리.
            _KIND = 20;
        }

        //편집 모드인 경우.
        parent.showMessage(sap, _KIND, "I", sRes.RTMSG);

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;

      }

      //UI 추가 처리.
      oAPP.fn.designAddTreeData(ls_item.is_tree, is_tree, sRes.sAggr);

    });


    return true;

  };  //개인화 항목에서 D&D한 경우 UI 추가 처리.


  

  //design에 tree 데이터 추가 처리.
  oAPP.fn.designAddTreeData = function(is_data, is_tree, sAggr){
        
    //UI의 attr 정보 복사 처리.
    function lf_copyAttrData(is_14, is_copied, aggrParam, bKeep){

        if(is_copied._T_0015.length === 0){return;}

        var lt_0015 = [];

        for(var i = 0, l = is_copied._T_0015.length; i < l; i++){
            
            //바인딩 정보를 유지 안하는경우.
            if(bKeep !== true){

                //바인딩 처리된건인경우 skip.
                if(is_copied._T_0015[i].ISBND === "X" && is_copied._T_0015[i].UIATV !== ""){
                    continue;
                }

                //서버 이벤트가 존재하는경우 skip.
                if(is_copied._T_0015[i].UIATY === "2" && is_copied._T_0015[i].UIATV !== ""){
                    continue;
                }

            }

            //프로퍼티 구조 신규 생성.
            var ls_15 = oAPP.fn.crtStru0015();

            //기존 복사건을 신규 15번 구조에 매핑.
            oAPP.fn.moveCorresponding(is_copied._T_0015[i], ls_15);

            ls_15.APPID = oAPP.attr.appInfo.APPID;
            ls_15.GUINR = oAPP.attr.appInfo.GUINR;
            ls_15.OBJID = is_14.OBJID;

            //복사된 ui의 최상위 정보의 aggregation 정보 변경처리.
            if(aggrParam && ls_15.UIATY === "6"){
                ls_15.UIATK = aggrParam.UIATK;
                ls_15.UIATT = aggrParam.UIATT;
                ls_15.UIASN = aggrParam.UIASN;
                ls_15.UIADT = aggrParam.UIADT;
                ls_15.UIADS = aggrParam.UIADS;
                ls_15.ISMLB = aggrParam.ISMLB;

            }

            //프로퍼티 복사건 재수집 처리.
            lt_0015.push(ls_15);
            
        }

        return lt_0015;

    }   //UI의 attr 정보 복사 처리.


    //복사된 ui를 붙여넣기 처리.
    function lf_setPasteCopiedData(is_parent, is_copied, aggrParam, it_ua018, it_ua026, it_ua030, it_ua032, it_ua050, bKeep){

        //신규 14번 구조 생성.
        var ls_14 = oAPP.fn.crtStru0014();

        //바인딩 처리 필드 생성.
        oAPP.fn.crtTreeBindField(ls_14);
        
        //기존 복사건을 신규 14번 구조에 매핑.
        oAPP.fn.moveCorresponding(is_copied, ls_14);
        ls_14.zTREE = [];

        //application 정보 재정의.
        ls_14.APPID = oAPP.attr.appInfo.APPID;
        ls_14.GUINR = oAPP.attr.appInfo.GUINR;


        if(aggrParam){
            //aggr 선택 팝업에서 선택한 aggregation정보 매핑.
            ls_14.UIATK = aggrParam.UIATK;
            ls_14.UIATT = aggrParam.UIATT;
            ls_14.UIASN = aggrParam.UIASN;
            ls_14.UIATY = aggrParam.UIATY;
            ls_14.UIADT = aggrParam.UIADT;
            ls_14.UIADS = aggrParam.UIADS;
            ls_14.ISMLB = aggrParam.ISMLB;
            ls_14.PUIATK = aggrParam.UIATK;
        }

        //OBJID에 포함된 숫자 제거.
        ls_14.OBJID = ls_14.OBJID.replace(/\d/g,"");

        //현재 UI의 OBJID 재 매핑.
        ls_14.OBJID = oAPP.fn.setOBJID(ls_14.OBJID);

        //PARENT의 ID 매핑 처리.
        ls_14.POBID = is_parent.OBJID;

        //부모 UI OBJECT ID 매핑 처리.
        ls_14.PUIOK = is_parent.UIOBK;

        ls_14.chk = false;
        ls_14.chk_visible = true;

        //attribute 입력건 복사 처리.
        var lt_0015 = lf_copyAttrData(ls_14, is_copied, aggrParam, bKeep);

        //20251001 PES -START.
        //UI에 대한 TREE 라인 정보 구성시 체크박스, 아이콘에 대한 세팅을
        //공통으로 사용하는 펑션을통해 설정 되야 하므로, 기존 로직 주석 처리함.
        // //UI의 아이콘 구성 처리.
        // ls_14.UICON = oAPP.fn.fnGetSapIconPath(ls_14.UICON);

        // ls_14.icon_visible = true;

        // //추가버튼 활성화.
        // ls_14.visible_add    = true;

        // //삭제 버튼 활성화.
        // ls_14.visible_delete = true;


        // //tree embeded aggregation 아이콘 표현.
        // oAPP.fn.setTreeAggrIcon(ls_14);

        //tree drag & drop 가능여부 처리.
        oAPP.fn.setTreeDnDEnable(ls_14);

        //UI design tree영역 체크박스 활성여부 처리.
        oAPP.fn.setTreeChkBoxEnable(ls_14);

        //UI design tree 영역 UI에 따른 ICON 세팅.
        oAPP.fn.setTreeUiIcon(ls_14);

        //UI design tree 영역의 action icon 활성여부 처리.
        oAPP.fn.designSetActionIcon(ls_14);
        //20251001 PES -END.

        
        // //부모 정보에 현재 복사처리한 UI 수집처리.
        // is_parent.zTREE.push(ls_14);
        
        
        //최초 호출하여 부모에 추가되는 건인경우.
        if(typeof aggrParam !== "undefined"){
          //부모의 해당 위치에 추가 처리.
          is_parent.zTREE.splice(_sDropLineInfo.dropIndex, 0, ls_14);

        }else{
          is_parent.zTREE.push(ls_14);
          
        }


        //UI DESC 정보가 존재하는경우.
        if(typeof is_copied._DESC !== "undefined"){
            //UI DESC 정보 구성.
            oAPP.fn.setDesc(ls_14.OBJID, is_copied._DESC);
        }


        //UI의 클라이언트 이벤트가 존재하는 경우 복사 처리.
        lf_copyClientEvent(ls_14.OBJID, is_copied);


        var l_UILIB = ls_14.UILIB;
        
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UOBK === ls_14.UIOBK );

        if(ls_0022){
            l_UILIB = ls_0022.LIBNM;
        }

        // //미리보기 UI 추가
        // oAPP.attr.ui.frame.contentWindow.addUIObjPreView(ls_14.OBJID, ls_14.UIOBK, l_UILIB, 
        //     ls_14.UIFND, ls_14.POBID, ls_14.PUIOK, ls_14.UIATT, lt_0015, it_ua018, it_ua032, it_ua030, it_ua026, it_ua050);

        if(typeof aggrParam !== "undefined"){
          
          //UI 생성 처리.
          oAPP.attr.ui.frame.contentWindow.createUIInstance(ls_14, lt_0015);

          //SAP.UI.RICHTEXTEDITOR.RICHTEXTEDITOR UI의 예외처리 script 구성.
          oAPP.attr.ui.frame.contentWindow.setRichTextEditorException(ls_14.UIOBK, ls_14.OBJID);


          //자식 UI가 필수인 UI에 자식이 없는경우 강제추가 예외처리.
          oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_14.UIOBK, ls_14.OBJID, ls_14.zTREE, oAPP.attr.S_CODE.UA050);


          var _aIndex = is_parent.zTREE.filter( a => a.UIATT === ls_14.UIATT );

          var _dragPos = _aIndex.findIndex( item => item.OBJID === ls_14.OBJID );

          var _cnt = 0;

          //같은 aggregation안에 있는 UI중 부모에 추가되지 않은 UI 존재 여부 확인.
          for(var i = 0; i < _dragPos; i++){

            var _sTree =  is_parent.zTREE[i];

            if(oAPP.attr.S_CODE.UA026.findIndex( item => item.FLD01 === _sTree.UILIB ) !== -1){
              continue;
            }

            _cnt++;

          }

  
          //부모에 생성한 UI 추가.
          oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(ls_14.OBJID, ls_14.UILIB, ls_14.POBID, 
            ls_14.PUIOK, ls_14.UIATT, _cnt, ls_14.ISMLB, ls_14.UIOBK, true);

          //미리보기 예외처리 UI 추가 draw 처리.
          oAPP.fn.prevDrawExceptionUi(ls_14.UIOBK, ls_14.OBJID);
        
        }else{

          //미리보기 UI 추가
          oAPP.attr.ui.frame.contentWindow.addUIObjPreView(ls_14.OBJID, ls_14.UIOBK, l_UILIB, 
            ls_14.UIFND, ls_14.POBID, ls_14.PUIOK, ls_14.UIATT, lt_0015, it_ua018, it_ua032, it_ua030, it_ua026, it_ua050);
  
  
        }
            
        //file uploader UI의 uploaderUrl 프로퍼티 예외처리.
        oAPP.fn.attrUploadUrlException(ls_14.OBJID, ls_14.UIOBK);


        //복사한 데이터의 CHILD 정보가 존재하지 않는경우.
        if(is_copied.zTREE.length === 0){
            //aggrParam 파라메터가 존재하는경우 현재 구성한 라인정보 RETURN.
            return aggrParam ? ls_14 : undefined;
        }

        //복사한 데이터의 CHILD정보가 존재하는경우 하위를 탐색하며 라인 정보 구성.
        for(var i=0, l=is_copied.zTREE.length; i<l; i++){
            lf_setPasteCopiedData(ls_14, is_copied.zTREE[i], undefined, it_ua018, it_ua026, it_ua030, it_ua032, it_ua050, bKeep);

        }

        //붙여넣기 데이터의 최상위인경우 해당 값 return.
        if(aggrParam){return ls_14;}

    }   //복사된 ui를 붙여넣기 처리.



    //붙여넣기 callback 이벤트.
    async function lf_paste_cb(param, i_cdata, bKeep){
        
        //공통코드 미리보기 UI Property 고정값 정보 검색.
        var lt_ua018 = oAPP.attr.S_CODE.UA018;
        
        //부모 UI에 추가 불필요 대상 UI 정보 검색.
        var lt_ua026 = oAPP.attr.S_CODE.UA026;

        //UI 프로퍼티 고정값 설정 정보 검색.
        var lt_ua030 = oAPP.attr.S_CODE.UA030;

        //UI 프로퍼티 type 예외처리 정보 검색.
        var lt_ua032 = oAPP.attr.S_CODE.UA032;

        //UI 프로퍼티 type 예외처리 정보 검색.
        var lt_ua050 = oAPP.attr.S_CODE.UA050;


        //복사한 UI 붙여넣기 처리.
        var ls_14 = lf_setPasteCopiedData(is_tree, i_cdata, param, lt_ua018, lt_ua026, lt_ua030, lt_ua032, lt_ua050, bKeep);

        // //model 갱신 처리.
        // oAPP.attr.oModel.refresh();


        //UNDO HISTORY 추가 처리.
        parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("INSERT_PERS", ls_14);


        //미리보기 onAfterRendering 처리 관련 module load.
        var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);


        //onAfterRendering 이벤트 등록 대상 UI 얻기.
        let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[is_tree.OBJID]);
          
        let _oDom = undefined;

        if(typeof _oTarget?.getDomRef === "function"){
          _oDom = _oTarget.getDomRef();
        }
        
        let _oPromise = undefined;
        
        //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
        if(typeof _oDom !== "undefined" && _oDom !== null){
          _oPromise = _oRender.setAfterRendering(_oTarget);
        }

        //RichTextEditor 미리보기 출력 예외처리로직.
        var _aPromise = _oRender.renderingRichTextEditor(is_tree);


        //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
        if(typeof _oPromise !== "undefined"){
          _oTarget.invalidate();
          
          //onAfterRendering 수행까지 대기.
          await _oPromise;
        }


        //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
        //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
        await Promise.all(_aPromise);

        
        //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
        await oAPP.fn.designRefershModel();


        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0, oAPP.fn.designGetTreeItemCount());
        

        //붙여넣기한 UI 선택 처리.
        await oAPP.fn.setSelectTreeItem(ls_14.OBJID);


        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();

        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();


    } //붙여넣기 callback 이벤트.


    //붙여넣기 정보의 OTR ALIAS검색.
    function lf_getOTRtext(param, i_cdata, bKeep){
        
        //붙여넣기 처리하려는 정보의 OTR ALIAS 수집 처리.
        function lf_getOTRAlise(is_tree){
            //ATTR 정보가 존재하지 않는경우 EXIT.
            if(is_tree._T_0015.length === 0){return;}

            //ATTR 정보를 기준으로 OTR ALIAS 수집 처리.
            for(var i = 0, l = is_tree._T_0015.length; i < l; i++){

                //프로퍼티, 바인딩처리안됨, 입력값이 $OTR:로 시작함.
                if(is_tree._T_0015[i].UIATY === "1" && 
                    is_tree._T_0015[i].ISBND !== "X" && 
                    is_tree._T_0015[i].UIATV.substr(0,5) === "$OTR:"){
                    
                    //ALIAS 정보 수집.
                    lt_alise.push(is_tree._T_0015[i].UIATV.substr(5));
                }

            }

        }   //붙여넣기 처리하려는 정보의 OTR ALIAS 수집 처리.

        
        
        //TREE를 기준으로 하위를 탐색하며, OTR ALIAS정보 수집.
        function lf_getOTRAlisetree(is_tree){
            //CHILD가 존재하는경우 CHILD의 OTR ALIAS정보 수집을 위한 탐색.
            if(is_tree.zTREE.length !== 0){
                for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                    lf_getOTRAlisetree(is_tree.zTREE[i]);
                }
            }

            //현재 TREE에 OTR정보가 존재하는지 수집 처리.
            lf_getOTRAlise(is_tree);

        }   //TREE를 기준으로 하위를 탐색하며, OTR ALIAS정보 수집.

        var lt_alise = [];

        //붙여넣기 정보에서 OTR ALIAS 수집.
        lf_getOTRAlisetree(i_cdata);

        //수집된 OTR ALIAS 정보가 없는경우 EXIT.
        if(lt_alise.length === 0){
            lf_paste_cb(param, i_cdata, bKeep);
            return;
        }
        

        var oFormData = new FormData();
        oFormData.append("ALIAS", JSON.stringify(lt_alise));

        //수집된 OTR ALIAS가 존재하는경우 서버에서 OTR ALIAS에 해당하는 TEXT 검색.
        sendAjax(oAPP.attr.servNm + "/getOTRTextsAlias", oFormData, function(oRet){

            if(oRet.RETCD === "E"){
              //메시지 출력.
              parent.showMessage(sap, 10, "W", oRet.RTMSG);
                
            }

            //서버에서 구성한 OTR ALISE에 해당하는 TEXT 정보 매핑.
            oAPP.DATA.APPDATA.T_OTR = oRet.T_OTR;

            //복사된 정보  붙여넣기 처리.
            lf_paste_cb(param, i_cdata, bKeep);

        }, "X", true, "POST", function(e){

            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");

          
        });  //수집된 OTR ALIAS가 존재하는경우 서버에서 OTR ALIAS에 해당하는 TEXT 검색.


    }   //붙여넣기 정보의 OTR ALIAS검색.


    //AGGR 선택 팝업의 CALLBACK FUNCTION.
    function lf_aggrPopup_cb(param, i_cdata){

        //단축키 잠금 처리.
        oAPP.fn.setShortcutLock(true);

        //이동 가능한 aggregation 정보가 존재하지 않는경우.
        if(typeof param === "undefined"){
            //오류 메시지 출력.
            //269	붙여넣기가 가능한 aggregation이 존재하지 않습니다.
            parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "269", "", "", "", ""));
            
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //UI가 입력 가능한 카디널리티 여부 확인.
        if(oAPP.fn.chkUiCardinality(is_tree, param.UIATK, param.ISMLB) === true){
          
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");
            return;
        }

        //UI의 허용 가능 부모 정보
        //(특정 UI는 특정 부모에만 존재해야함.)
        if(oAPP.fn.designChkFixedParentUI(i_cdata.UIOBK, is_tree.UIOBK, param.UIATT) === true){
            //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
            parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");
            return;
        }


        //20240723 PES -START.
        //현재 UI의 대상 Aggregation에 추가 불가능한 UI여부 점검로직.
        var _sParam = {};

        //현재 UI.
        _sParam.UIOBK       = is_tree.UIOBK;

        //추가 대상 AGGREGATION.
        _sParam.UIATT       = param.UIATT;

        //추가 UI.
        _sParam.CHILD_UIOBK = i_cdata.UIOBK;


        var _modulePath = parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, "js", "exception", "exceptionUI.js");

        //부모의 Aggregation에 추가 불가능한 UI인지 확인.
        var _deny = parent.require(_modulePath).checkDenyChildAggr(_sParam);

        if(_deny === true){
          
          //214	&1 UI는 &2의 &3 Aggregation에 추가 할 수 없습니다.
          parent.showMessage(sap, 10, "E", parent.WSUTIL.getWsMsgClsTxt(
            oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "214", i_cdata.OBJID, is_tree.OBJID, param.UIATT));

          //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
          parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

          //단축키 잠금 해제처리.
          oAPP.fn.setShortcutLock(false);

          parent.setBusy("");
          
          return;

        }
        //20240723 PES -END.


        //application이 같더라도 붙여넣기시 바인딩, 이벤트가 있으면 유지여부 확인팝업 호출에 의한 주석 처리-start.
        // //복사한 UI의 application이 현재 application과 같다면 바인딩 유지하면서 붙여넣기.
        // if(i_cdata.APPID === oAPP.attr.appInfo.APPID){
        //     //복사된 ui 붙여넣기 처리.
        //     lf_paste_cb(param, i_cdata, true);
        //     return;
        // }
        //application이 같더라도 붙여넣기시 바인딩, 이벤트가 있으면 유지여부 확인팝업 호출에 의한 주석 처리-end.


        //복사한 UI에 바인딩, 이벤트 정보가 존재하지 않는경우.
        if(lf_chkBindNEvent(i_cdata) !== true){
            //복사된 ui 붙여넣기 처리.
            //lf_paste_cb(param, i_cdata, false);
            lf_getOTRtext(param, i_cdata, false);
            return;
        }


        //trial 버전인경우.
        if(parent.getIsTrial()){
            //복사된 바인딩 정보, 서버이벤트 정보 제거 상태로 붙여넣기 처리.
            //lf_paste_cb(param, i_cdata, false);
            lf_getOTRtext(param, i_cdata, false);
            return;
        }
        
        //116	Copy and paste application is different.
        var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "116", "", "", "", "");

        //117	Do you want to keep the binding?.
        l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "117", "", "", "", "");

        //단축키 잠금 처리.
        oAPP.fn.setShortcutLock(true);

        //복사한 UI의 APPLICATION이 현재 APPLICATION과 다른 경우.
        //바인딩, 서버이벤트 초기화 여부 확인 팝업 호출.
        parent.showMessage(sap, 40, "I", l_msg, function(oEvent){

            parent.setBusy("X");

            //화면 잠금 처리.
            oAPP.fn.designAreaLockUnlock(true);

            //취소를 한경우 exit.
            if(oEvent === "CANCEL" || oEvent === null){

              //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
              parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

              //단축키 잠금 해제처리.
              oAPP.fn.setShortcutLock(false);
              
              parent.setBusy("");

              return;
            }

            //default 바인딩, 서버이벤트 해제 처리.
            var l_flag = false;

            //바인딩, 서버이벤트를 유지하는경우.
            if(oEvent === "YES"){
                l_flag = true;
            }

            //복사된 ui 붙여넣기 처리.
            //lf_paste_cb(param, i_cdata, l_flag);
            lf_getOTRtext(param, i_cdata, l_flag);

        }); //바인딩, 서버이벤트 초기화 여부 확인 팝업 호출.
        
        parent.setBusy("");

    }   //AGGR 선택 팝업의 CALLBACK FUNCTION.




    //바인딩, 이벤트 설정건 존재여부 확인.
    function lf_chkBindNEvent(is_tree){

        //attribute 입력건이 존재하는경우.
        if(typeof is_tree._T_0015 !== "undefined" && is_tree._T_0015.length !== 0 ){
            //바인딩된 정보가 존재하거나 이벤트가 존재하는건이 있는지 여부 확인
            if(is_tree._T_0015.findIndex( a => ( a.ISBND === "X" && a.UIATV !== "") || ( a.UIATY === "2" && a.UIATV !== "") ) !== -1 ){
                return true;
            }

        }

        //child UI가 존재하는경우.
        if(typeof is_tree.zTREE !== "undefined" && is_tree.zTREE.length !== 0){

            for(var i = 0, l = is_tree.zTREE.length; i < l; i++){
                var l_found = lf_chkBindNEvent(is_tree.zTREE[i]);

                if(l_found){return true;}
            }

        }

    }   //바인딩, 이벤트 설정건 존재여부 확인.



    //클라이언트 이벤트 복사 처리.
    function lf_copyClientEvent(OBJID, is_tree){
        //복사된 UI에 클라이언트가 없는경우 EXIT.
        if(typeof is_tree._CEVT === "undefined"){return;}

        //클라이언트 이벤트를 복사 처리.
        for(var i = 0, l = is_tree._CEVT.length; i < l; i++){
            //이전의 클라이언트 이벤트의 OBJID를 복사된 UI의 이름으로 변경처리.
            is_tree._CEVT[i].OBJID = is_tree._CEVT[i].OBJID.replace(is_tree.OBJID, OBJID);
        }

        //OBJID를 재구성한 클라이언트 이벤트 수집 처리.
        oAPP.DATA.APPDATA.T_CEVT = oAPP.DATA.APPDATA.T_CEVT.concat(is_tree._CEVT);

    }

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);



    var _sDropLineInfo = is_tree?.dropLineInfo || undefined;
    delete is_tree?.dropLineInfo;

    if(typeof _sDropLineInfo === "undefined"){

      _sDropLineInfo = {};

      _sDropLineInfo.dropPosition = undefined;
      _sDropLineInfo.dropIndex    = undefined;

      //기존 로직의 마지막 위치에 UI 추가를 위한 index 매핑.
      _sDropLineInfo.dropIndex = is_tree.zTREE.length;

    }

    

    //편집 불가능 상태일때는 exit.
    if(oAPP.attr.oModel.oData.IS_EDIT !== true){
      
        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");
        
        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
    }


    //복사한 UI가 이미 존재하는경우 붙여넣기 skip 처리.(공통코드 UA039에 해당하는 UI는 APP당 1개만 존재 가능)
    if(oAPP.fn.designChkUnique(is_data.UIOBK) === true){
      
        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");
        
        return;
    }

    //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.(공통코드 UA040에 해당하는 UI는 특정 UI 하위에만 존재가능)
    if(oAPP.fn.designChkHiddenAreaUi(is_data.UIOBK, is_tree.UIOBK) === true){
      
        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
    }


    lf_aggrPopup_cb(sAggr, is_data);

    //20251013 PES - START.
    // 부모의 추가될 AGGREGATION을 function 호출처에서 지정하도록 로직이 변경되어 기존 로직 주석 처리.
    // //이벤트 발생 x, y 좌표값 얻기.
    // var l_pos = oAPP.fn.getMousePosition();

    // //aggregation 선택 팝업 호출.
    // if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){
    //     oAPP.fn.aggrSelectPopup(is_data, is_tree, lf_aggrPopup_cb, l_pos.x, l_pos.y);
    //     return;
    // }

    // //aggregation 선택 팝업이 존재하지 않는경우 js load후 호출.
    // oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
    //     oAPP.fn.aggrSelectPopup(is_data, is_tree, lf_aggrPopup_cb, l_pos.x, l_pos.y);
    // });
    //20251013 PES - END.


  };  //context menu ui 붙여넣기 처리.




  //ui 추가 처리 이벤트.
  oAPP.fn.designUIAdd = function(is_tree){

    if(!is_tree){
      
      //단축키 잠금 해제처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }


    //UI 추가.
    function lf_setChild(is_0022, is_0023, i_cnt){

      //UI 추가 처리 FUNCTION 호출.
      oAPP.fn.designAddUIObject(is_tree, is_0022, is_0023, i_cnt);

    } //UI 추가.


    //UI추가 팝업 정보가 존재하는경우 팝업 호출.
    if(typeof oAPP.fn.callUIInsertPopup !== "undefined"){
      oAPP.fn.callUIInsertPopup(is_tree.UIOBK, lf_setChild);
      return;
    }
    
    //UI 추가 팝업 정보가 존재하지 않는다면 JS 호출 후 팝업 호출.
    oAPP.fn.getScript("design/js/insertUIPopop",function(){
      oAPP.fn.callUIInsertPopup(is_tree.UIOBK, lf_setChild);
    });

  };  //ui 추가 처리 이벤트.




  //ui 삭제 처리 이벤트.
  oAPP.fn.designUIDelete = function(is_tree_param){

    if(!is_tree_param){

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }

            
    //선택라인의 삭제대상 OBJECT 제거 처리.
    function lf_deleteTreeLine(is_tree){
        
      //child정보가 존재하는경우.
      if(is_tree.zTREE.length !== 0){
        //하위 TREE 정보가 존재하는경우
        for(var i=0, l=is_tree.zTREE.length; i<l; i++){
            //재귀호출 탐색하며 삭제 처리.
            lf_deleteTreeLine(is_tree.zTREE[i]);

        }

      }

      //클라이언트 이벤트 및 sap.ui.core.HTML의 프로퍼티 입력건 제거 처리.
      oAPP.fn.delUiClientEvent(is_tree);

      //Description 삭제.
      oAPP.fn.delDesc(is_tree.OBJID);

      //해당 UI의 바인딩처리 수집건 제거 처리.
      oAPP.fn.designUnbindLine(is_tree);

      //미리보기 UI destroy 처리.
      oAPP.attr.ui.frame.contentWindow.destroyUIPreView(is_tree.OBJID);

      //팝업 수집건에서 해당 UI 제거 처리.
      oAPP.fn.removeCollectPopup(is_tree.OBJID);

      //미리보기 UI 수집항목에서 해당 OBJID건 삭제.
      delete oAPP.attr.prev[is_tree.OBJID];

      //현재 미리보기 예외처리 대상 UI가 삭제되는 UI인경우.
      if(oAPP.attr?.UA015UI?._OBJID === is_tree.OBJID){
        //예외처리 UI 정보 제거.
        delete oAPP.attr.UA015UI;
      }

    } //선택라인의 삭제대상 OBJECT 제거 처리.


    var ls_tree = is_tree_param;


    parent.setBusy("");

    //단축키 잠금 처리.
    oAPP.fn.setShortcutLock(true);

    //UI삭제전 확인 팝업 호출. 메시지!!
    //003	Do you really want to delete the object?
    parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "003", "", "", "", ""), async function(oEvent){

      parent.setBusy("X");
     
      
      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      //확인 팝업에서 YES를 선택한 경우 하위 로직 수행.
      if(oEvent !== "YES"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;

      }

      
      //UNDO HISTORY 추가 처리.
      parent.require(oAPP.oDesign.pathInfo.undoRedo).saveActionHistoryData("DELETE", ls_tree);

      
      
      //미리보기 화면 UI 제거.
      oAPP.attr.ui.frame.contentWindow.delUIObjPreView(ls_tree.OBJID, ls_tree.POBID, ls_tree.PUIOK, ls_tree.UIATT, ls_tree.ISMLB, ls_tree.UIOBK);

      //내 부모가 자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 처리. 
      oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_tree.PUIOK, ls_tree.POBID, undefined, undefined, true);

      //현재 UI가 자식 UI가 필수인 UI에 자식이 없는경우 강제추가 script 처리.
      oAPP.attr.ui.frame.contentWindow.setChildUiException(ls_tree.UIOBK, ls_tree.OBJID, undefined, undefined, true);

      //삭제 이후 이전 선택처리 정보 얻기.
      var l_prev = oAPP.fn.designGetPreviousTreeItem(ls_tree.OBJID);


      //미리보기 onAfterRendering 처리 관련 module load.
      var _oRender = parent.require(oAPP.oDesign.pathInfo.setOnAfterRender);
      
      
      //onAfterRendering 이벤트 등록 대상 UI 얻기.
      let _oTarget = _oRender.getTargetAfterRenderingUI(oAPP.attr.prev[ls_tree.POBID]);
      
      let _oDom = undefined;

      if(typeof _oTarget?.getDomRef === "function"){
        _oDom = _oTarget.getDomRef();
      }      
      
      let _oPromise = undefined;
      
      //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
      if(typeof _oDom !== "undefined" && _oDom !== null){
        _oPromise = _oRender.setAfterRendering(_oTarget);
      }

      
      //선택라인의 삭제대상 OBJECT 제거 처리.
      lf_deleteTreeLine(ls_tree);

      //부모 TREE 라인 정보 얻기.
      var ls_parent = oAPP.fn.getTreeData(ls_tree.POBID);
      
      //RichTextEditor 미리보기 출력 예외처리로직.
      var _aPromise = _oRender.renderingRichTextEditor(ls_parent);

      
      //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
      if(typeof _oPromise !== "undefined"){
        _oTarget.invalidate();
        
        //onAfterRendering 수행까지 대기.
        await _oPromise;
      }

      //richtexteditor 미리보기 화면이 다시 그려질때까지 대기.
      //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
      await Promise.all(_aPromise);
            
      
      //부모에서 현재 삭제대상 라인이 몇번째 라인인지 확인.
      var l_fIndx = ls_parent.zTREE.findIndex( a => a.OBJID === ls_tree.OBJID );

      if(l_fIndx !== -1){
          //부모에서 현재 삭제 대상건 제거.
          ls_parent.zTREE.splice(l_fIndx, 1);
      }

      //미리보기의 직접 입력 가능한 UI의 직접 입력건 반영처리.
      oAPP.fn.previewSetStrAggr(ls_tree);
      
      // //모델 갱신 처리.
      // oAPP.attr.oModel.refresh(true);

      //디자인 영역 모델 갱신 처리 후 design tree, attr table 갱신 대기. 
      await oAPP.fn.designRefershModel();


      //삭제라인의 바로 윗 라인 선택 처리.
      await oAPP.fn.setSelectTreeItem(l_prev);

      //변경 FLAG 처리.
      oAPP.fn.setChangeFlag();

      
      //20240621 pes.
      //바인딩 팝업의 디자인 영역 갱신처리.
      oAPP.fn.updateBindPopupDesignData();
              

    }); //UI삭제전 확인 팝업 호출.


  }; //ui 삭제 처리 이벤트.



  //design tree의 row action icon style 처리.
  oAPP.fn.designSetRowActionIconStyle = function(oEvent){
    
    //아이콘 색상 처리.
    function lf_setActionItemColor(oRow){
        
      if(!oRow){return;}

      var oAct = oRow.getRowAction();
      if(!oAct){return;}

      var lt_icon = oAct.getAggregation("_icons");

      for(var i=0, l=lt_icon.length; i<l; i++){
        //ui 추가 버튼의 경우 margin 처리.
        if(lt_icon[i].getSrc() === "sap-icon://add"){
          lt_icon[i].removeStyleClass("sapUiTinyMarginEnd");
          lt_icon[i].addStyleClass("sapUiTinyMarginEnd");
        }
        
        //삭제 아이콘인경우 아이콘 색상 처리.
        if(lt_icon[i].getSrc() === "sap-icon://delete"){
          lt_icon[i].setColor("#fa6161");
        }

      }

    }   //아이콘 색상 처리.

  
    //테이블 업데이트 시작 시점이 아닌경우 exit.
    if(oEvent !== "StartTableUpdate"){return;}

    //아이콘 색상을 처리된경우 exit.
    if(oAPP.attr.ui.oLTree1.__ActIconColor){
        delete oAPP.attr.ui.oLTree1.__ActIconColor;
        return;
    }

    //아이콘 색상을 처리함 flag 마킹.
    oAPP.attr.ui.oLTree1.__ActIconColor = true;

    var lt_row = oAPP.attr.ui.oLTree1.getRows();
    if(lt_row.length === 0){return;}

    for(var i=0, l=lt_row.length; i<l; i++){

      //아이콘 색상 처리.
      lf_setActionItemColor(lt_row[i]);

    }

  };  //design tree의 row action icon style 처리.


  

  //design tree의 row action 활성여부 설정.
  oAPP.fn.designTreeSetRowAction = function(){

    //20240819 PES.
    //sap.ui.table.RowAction을 사용시 간헐적으로 특정 row의 rowActionItem이 보이지 않기에
    //컬럼으로 대체 처리함.
    //이에 따라 조회모드시 rowAction을 비활성 처리하는 로직 수행하지 않음.
    //(rowAction을 대체하는 컬럼의 visible 처리로 변경)
    return;

    //design tree의 row action count를 0으로 설정.
    var l_cnt = 0;
        
    //편집상태인경우 row action count를 2로 설정.
    if(oAPP.attr.oModel.oData.IS_EDIT){
      l_cnt = 2;
    }

    oAPP.attr.ui.oLTree1.setRowActionCount(l_cnt);

  };  //design tree의 row action 활성여부 설정.


})();