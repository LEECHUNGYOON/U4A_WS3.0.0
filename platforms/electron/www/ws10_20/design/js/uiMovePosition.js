//UI move Position 메뉴 선택시 팝업 UI
oAPP.fn.uiMovePosition = function(OBJID, pos, max, f_callBack, i_x, i_y){

  //dialog 종료.
  function lf_close(){

    oDlg.close();
    oDlg.destroy();

  }
  
  //ui 위치이동 dialog UI 생성.
  sap.ui.getCore().loadLibrary("sap.m");
  oDlg = new sap.m.Dialog({draggable:true, resizable:true, horizontalScrolling:false, verticalScrolling:false});
  oDlg.addStyleClass("sapUiSizeCompact");

  //DIALOG OPEN전 이벤트.
  oDlg.attachBeforeOpen(function(oEvent){
      
    //X, Y 좌표값이 존재하지 않는경우 EXIT.
    if(typeof i_x === "undefined"){return;}
    if(typeof i_y === "undefined"){return;}

    //x, y 좌표에 의해 dialog 위치를 변경하기 위한 처리.
    this._bDisableRepositioning = true;    
    this._oManuallySetPosition = {x:i_x, y:i_y};
    this.oPopup.setPosition("begin top", {top:i_x, left:i_y}, oAPP.attr.ui.oLTree1, "0 0");

  }); //DIALOG OPEN전 이벤트.
  

  //MODEL 생성.
  var oMdl = new sap.ui.model.json.JSONModel();
  oDlg.setModel(oMdl);

  var oTool = new sap.m.Toolbar();
  oDlg.setCustomHeader(oTool);

  //A57  Move Position
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A57", "", "", "", "") + " - " + OBJID;

  var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
  oTitle.addStyleClass("sapUiTinyMarginBegin");
  oTool.addContent(oTitle);

  oTool.addContent(new sap.m.ToolbarSpacer());

  //A39  Close
  //우상단 닫기버튼.
  var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
    tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
  oTool.addContent(oBtn0);

  //닫기 버튼 선택 이벤트.
  oBtn0.attachPress(function(){
    
    //dialog 종료 처리.
    lf_close();
    
    //001	Cancel operation
    parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

  });

  oGrid = new sap.ui.layout.Grid({defaultSpan:"XL12 L12 M12 S12", vSpacing:0.5, hSpacing:0.5});
  oGrid.addStyleClass("sapUiTinyMarginTopBottom");
  oDlg.addContent(oGrid);


  //B25  Max
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B25", "", "", "", "") + max;

  //최대 이동 위치 label.
  var oLab1 = new sap.m.Label({text:l_txt, tooltip:l_txt, design:"Bold"});
  oGrid.addContent(oLab1);

  //이동위치 입력필드.
  var oStepInp = new sap.m.StepInput({min:1, max:"{/move/max}", value:"{/move/pos}"});
  oGrid.addContent(oStepInp);

  //입력필드 keydown 이벤트.
  oStepInp.attachBrowserEvent('keydown', function(){
    //엔터 입력이 아닌경우 EXIT.
    if(window.event.keyCode === 13){
      //확인버튼으로 포커스 이동 처리.
      oBtn1.focus();  
    }

  }); //입력필드 keydown 이벤트.


  //이동위치 slider.
  var oSlide = new sap.m.Slider({min:1, max:"{/move/max}", value:"{/move/pos}", enableTickmarks:true});
  oGrid.addContent(oSlide);

  //A40  Confirm
  //확인 버튼
  var oBtn1 = new sap.m.Button({icon:"sap-icon://accept", type:"Accept", 
    tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A40", "", "", "", "")});
  oDlg.addButton(oBtn1);

  //확인 버튼 선택 이벤트.
  oBtn1.attachPress(function(){

    var l_pos = oMdl.getProperty("/move/pos") - 1;

    //0 미만인경우 or max값을 초과한경우.
    if(l_pos < 0 || l_pos > max){
      //274	Check input value.
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "274", "", "", "", ""));
      return;
    }

    //위치 정보 call back function으로 return
    f_callBack(l_pos);

    //dialog 종료.
    lf_close();

  }); //확인 버튼 선택 이벤트.


  //A39  Close
  //닫기 버튼
  var oBtn2 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
    tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
  oDlg.addButton(oBtn2);

  //닫기 버튼 선택 이벤트.
  oBtn2.attachPress(function(){
    
    //dialog 종료 처리.
    lf_close();
    
    //001	Cancel operation
    parent.showMessage(sap,10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

  }); //닫기 버튼 선택 이벤트.


  oMdl.setData({"move":{"pos":pos, "max":max}});

  //dailog 호출전 이벤트.
  oDlg.attachAfterOpen(function(){
    //입력필드에 focus 처리.
    oStepInp.focus();

    var l_dom = oStepInp.getDomRef("input-inner");
    if(!l_dom || !l_dom.select){return;}

    l_dom.select();

  }); //dailog 호출전 이벤트.

  
  //팝업 호출.
  oDlg.open();


};  //UI move Position 메뉴 선택시 팝업 UI
