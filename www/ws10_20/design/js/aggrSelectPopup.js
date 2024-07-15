(function(){
  
  //AGGREGATION 선택 팝업.
  oAPP.fn.aggrSelectPopup = function(i_drag, i_drop, retfunc, i_x, i_y){

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
      //262	이동 가능한 aggregation이 존재하지 않습니다.
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "262", "", "", "", ""));

      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";

      parent.setBusy("");

      //화면 lock 해제 처리.
      oAPP.fn.designAreaLockUnlock(false);

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

    //DIALOG OPEN전 이벤트.
    oDlg1.attachBeforeOpen(function(oEvent){
      
      //팝업 호출전 모달 해제.
      //insert ui 팝업에서 D&D를 통해 UI를 추가하는 과정에서 modal 여부를 변경하기에
      //aggregation 선택팝업이 호출될때 최상위가 되기위해 modal을 재설정함.
      if(this.oPopup){
        this.oPopup.setModal(false);
      }


      //X, Y 좌표값이 존재하지 않는경우 EXIT.
      if(typeof i_x === "undefined"){return;}
      if(typeof i_y === "undefined"){return;}

      //x, y 좌표에 의해 dialog 위치를 변경하기 위한 처리.
      this._bDisableRepositioning = true;    
      this._oManuallySetPosition = {x:i_x, y:i_y};
      this.oPopup.setPosition("begin top", {top:i_x, left:i_y}, oAPP.attr.ui.oLTree1, "0 0");

    }); //DIALOG OPEN전 이벤트.

    //dialog open 이후 이벤트.
    oDlg1.attachAfterOpen(function(){

      //팝업 호출전 모달 재설정.
      //insert ui 팝업에서 D&D를 통해 UI를 추가하는 과정에서 modal 여부를 변경하기에
      //aggregation 선택팝업이 호출될때 최상위가 되기위해 modal을 재설정함.
      if(this.oPopup){
        this.oPopup.setModal(true);
      }
      
      //ddlb에 focus 처리.
      oSel1.focus();

        
      parent.setBusy("");

      //화면 lock 해제 처리.
      oAPP.fn.designAreaLockUnlock(false);

    });

    var oMdl = new sap.ui.model.json.JSONModel();
    oDlg1.setModel(oMdl);

    oMdl.setData({"T_SEL":lt_sel});

    var oTool = new sap.m.Toolbar();
    oDlg1.setCustomHeader(oTool);

    //A38	Aggregation List
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A38", "", "", "", "") + " - " + i_drop.OBJID;

    var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
    oTitle.addStyleClass("sapUiTinyMarginBegin");
    oTool.addContent(oTitle);

    oTool.addContent(new sap.m.ToolbarSpacer());

    //A39	Close
    //우상단 닫기버튼.
    var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
    oTool.addContent(oBtn0);

    //닫기 버튼 선택 이벤트.
    oBtn0.attachPress(function(){
      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";
      
      oDlg1.close();
      oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

    });

    
    //aggregation ddlb 구성.
    var oSel1 = new sap.m.Select({width:"100%"});

    var oItm1 = new sap.ui.core.Item({key:"{UIATK}", text:"{UIATT}"});
    oSel1.bindAggregation("items", {path:"/T_SEL", template:oItm1});
    
    oDlg1.addContent(oSel1);

    oSel1.setSelectedIndex(0);

    //aggr ddlb 선택시
    oSel1.attachChange(function(){
      //확인 버튼으로 focus 처리.
      oBtn1.focus();
    });


    //A40	Confirm
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A40", "", "", "", "");

    //확인버튼
    var oBtn1 = new sap.m.Button({icon: "sap-icon://accept", text:l_txt, type:"Accept", tooltip:l_txt});
    oDlg1.addButton(oBtn1);

    oBtn1.attachPress(function(){

      var l_sel = oSel1.getSelectedKey();

      ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_sel);
      if(!ls_0023){return;}

      oDlg1.close();
      oDlg1.destroy();

      retfunc(ls_0023, i_drag, i_drop);

    });


    //A41	Cancel
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "");

    //닫기버튼
    var oBtn2 = new sap.m.Button({icon: "sap-icon://decline", text:l_txt, type: "Reject", tooltip:l_txt});
    oDlg1.addButton(oBtn2);

    //닫기버튼 이벤트
    oBtn2.attachPress(function(){

      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";

      oDlg1.close();
      oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));
    });

    oDlg1.open();

  };  //AGGREGATION 선택 팝업.

})();
