(function(){
  oAPP.fn.aggrSelectPopup = function(i_drag, i_drop, retfunc){


    //입력 UI의 UI 가능 AGGREGATION 정보 얻기.
    var lt_sel = oAPP.fn.chkAggrRelation(i_drop.UIOBK, i_drop.OBJID, i_drag.UIOBK);
    

    //선택가능 aggregation리스트가 존재하지 않는경우, drag, drop의 부모, aggregation이 동일한경우.
    if(lt_sel.length === 0 && i_drag.POBID === i_drop.POBID && i_drag.UIATK === i_drop.UIATK ){
      retfunc(undefined, i_drag, i_drop);
      return;
    }

    //선택가능 aggregation리스트가 존재하지 않는경우.
    if(lt_sel.length === 0){
      //오류 메시지 출력.
      parent.showMessage(sap, 10, "I", "이동 가능한 aggregation이 존재하지 않습니다.");
      return;
    }

    //선택 가능한 aggregation이 1건인경우 해당 aggregation return.
    if(lt_sel.length === 1){
      retfunc(lt_sel[0], i_drag, i_drop);
      return;
    }


    sap.ui.getCore().loadLibrary("sap.m");
    var oDlg1 = new sap.m.Dialog({draggable:true});
    oDlg1.addStyleClass("sapUiSizeCompact");

    //dialog open 이후 이벤트.
    oDlg1.attachAfterOpen(function(){
      //ddlb에 focus 처리.
      oSel1.focus();
    });

    var oMdl = new sap.ui.model.json.JSONModel();
    oDlg1.setModel(oMdl);

    oMdl.setData({"T_SEL":lt_sel});

    var oTool = new sap.m.Toolbar();
    oDlg1.setCustomHeader(oTool);

    oTool.addContent(new sap.m.Title({text:"Aggregation List"}));

    oTool.addContent(new sap.m.ToolbarSpacer());

    //우상단 닫기버튼.
    var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
    oTool.addContent(oBtn0);

    //닫기 버튼 선택 이벤트.
    oBtn0.attachPress(function(){
      
      oDlg1.close();
      oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", "Cancel operation");

    });

    
    //aggregation ddlb 구성.
    var oSel1 = new sap.m.Select({width:"100%"});

    var oItm1 = new sap.ui.core.Item({key:"{UIATK}",text:"{UIATT}"});
    oSel1.bindAggregation("items",{path:"/T_SEL",template:oItm1});
    
    oDlg1.addContent(oSel1);

    oSel1.setSelectedIndex(0);

    //aggr ddlb 선택시
    oSel1.attachChange(function(){
      //확인 버튼으로 focus 처리.
      oBtn1.focus();
    });


    //확인버튼
    var oBtn1 = new sap.m.Button({icon: "sap-icon://accept",text: "Confirm",type: "Accept"});
    oDlg1.addButton(oBtn1);

    oBtn1.attachPress(function(){

      var l_sel = oSel1.getSelectedKey();

      ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_sel);
      if(!ls_0023){return;}

      oDlg1.close();
      oDlg1.destroy();

      retfunc(ls_0023, i_drag, i_drop);

    });


    //닫기버튼
    var oBtn2 = new sap.m.Button({icon: "sap-icon://decline",text: "Cancel",type: "Reject"});
    oDlg1.addButton(oBtn2);

    //닫기버튼 이벤트
    oBtn2.attachPress(function(){
      oDlg1.close();
      oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", "Cancel operation");
    });

    oDlg1.open();

  };

})();
