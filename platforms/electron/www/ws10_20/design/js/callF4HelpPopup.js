//DDIC f4 help popup 처리 function.
oAPP.fn.callF4HelpPopup = function(I_SHLPNAME, I_SHLP_DEF, IT_SHLP, IT_FIELDDESCR, f_clientCallbak){

  //검색조건 필드 구성.
  function lf_setSearchCondition(SHLPNAME, it_fdesc){

    //검색조건 영역 제거.
    oForm.removeAllContent();

    for(var i=0, l=it_fdesc.length; i<l; i++){

      //검색조건 필드정보가 아닌경우 skip.
      if(it_fdesc[i].SHLPSELPOS === 0){
        continue;
      }

      var oLb = new sap.m.Label({design:"Bold"});

      //default 검색조건 필드명.
      var l_lbtx =it_fdesc[i].SCRTEXT_M;


      //검색조건 라벨 text 구성.
      oLb.setText(l_lbtx);
      oLb.setTooltip(l_lbtx);

      //form에 label 추가.
      oForm.addContent(oLb);

      //일반 필드의 경우 value 프로퍼티에 바인딩 처리.
      var l_prop = "value";

      //data type에따른 검색필드 분기.
      switch (it_fdesc[i].DATATYPE){
        case "D":
          // DATE TYPE인경우.
          var oSFld = new sap.m.DatePicker({valueFormat:"yyyyMMdd", displayFormat:"yyyy.MM.dd"});
          break;

        case "T":
          // TIME인경우.
          var oSFld = new sap.m.TimePicker({valueFormat:"HHmmss", displayFormat:"HH:mm:ss"});
          break;

        default:
          // DEFAULT INPUT필드.
          var oSFld = new sap.m.Input({valueLiveUpdate:true, maxLength:it_fdesc[i].OUTPUTLEN});

          //enter event
          oSFld.attachSubmit(function(){ LF_getServerData();});
          break;
      }


      var l_path = it_fdesc[i].FIELDNAME;

      //필드명에 /가 있다면 x로 변환 처리.
      if(l_path.indexOf("/") !== -1){
        l_path = l_path.replace(/\//g, "x");
      }

      //검색조건 필드 바인딩 처리.
      oSFld.bindProperty(l_prop, {path:"/param/" + l_path});
      oSFld.bindProperty("tooltip", {path:"/param/" + l_path});

      //form에 검색필드 추가.
      oForm.addContent(oSFld);

      //PARAMETER에 설정된 default 값을 기본으로 구성.
      var l_dfval = it_fdesc[i].DFVAL;

      //기본값이 구성된 경우.
      if(l_dfval !== ""){
        oSFld.setProperty(l_prop, l_dfval);
        oSFld.updateProperty(l_prop, true);
      }

    }

  }   //검색조건 필드 구성.


  //결과리스트 컬럼 설정.
  function lf_setTableColumn(SHLPNAME, it_fdesc){

    for(var i=0, l=it_fdesc.length; i<l; i++){

      //결과리스트 필드정보가 아닌경우 skip.
      if(it_fdesc[i].SHLPLISPOS === 0){
        continue;
      }

      //column UI정보.
      var oCol = new sap.ui.table.Column();

      //header text UI정보.
      var oLab = new sap.m.Label();

      //default 컬럼 텍스트.
      var l_txt = it_fdesc[i].SCRTEXT_S;


      //header text 구성.
      oLab.setText(l_txt);
      oLab.setTooltip(l_txt);

      //column에 header text UI추가.
      oCol.setLabel(oLab);

      //table에 column정보 추가.
      oTable.addColumn(oCol);

      var l_type, l_len=0;

      // ABAP TYPE에 따른 로직 분기.
      switch(it_fdesc[i].DATATYPE){
        case "DATS":  //DATE 타입인경우.
          l_type = "D";
          l_len = 8;
          break;

        case "TIMS":  //TIME 타입인경우.
          l_type = "T";
          l_len = 6;
          break;

        default:  //DEFAULT는 STRING.
          l_type = "STRING";
          l_len = 0;
          break;

      }

      var l_path = it_fdesc[i].FIELDNAME;

      //필드명에 /가 있다면 x로 변환 처리.
      if(l_path.indexOf("/") !== -1){
        l_path = l_path.replace(/\//g, "x");
      }

      //TABLE CELL 출력 TEXT UI.
      var oTxt = new sap.m.Text({text:{path:l_path}});

      //column list item에 text ui 추가.
      oCol.setTemplate(oTxt);

    }

  }   //결과리스트 컬럼 설정.



  //-검색 서버 조회 전송 처리 스크립트 펑션 생성
  function LF_getServerData(){

    oTable.setBusy(true);
    SerchBT1.setBusy(true);

    //-멀티 조회일경우
    if(l_isMulti){
      ZF4SH_select.setBusy(true);
    }

    //application명 서버전송 데이터 구성.
    var oFormData = new FormData();
    oFormData.append("trgubun", "D");

    oFormData.append("_SHLPNAME", I_SHLPNAME);

    //~default 단일 서칭 헬프
    var l_f4sub = l_f4_def;

    //include f4 help가 존재하는 경우.
    if(l_isMulti){
      l_f4sub = ZF4SH_select.getSelectedKey();
    }

    //현재 F4 HELP명이 존재하지 않는경우.
    if(!l_f4sub){
      //대표 F4 HELP명으로 구성.
      l_f4sub = I_SHLPNAME;
    }

    //구성한 현재 F4 HELP명 수집.
    oFormData.append("_SHLPSUB", l_f4sub);

    //~MAX ROW
    oFormData.append("_MAXROWS", ZF4SH_input01.getValue());

    //검색조건 입력정보 수집.
    for(var i in ZF4searchModle.oData.param){
      oFormData.append(i, ZF4searchModle.oData.param[i]);
    }


    //검색조건에 따른 결과 리스트 검색을 위한 서버 호출.
    sendAjax(parent.getServerPath() + "/f4serverData", oFormData, function(param){
      //~조회 정보 존재시 data 처리

        //BUSY OFF.
        parent.setBusy(false);

        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A73", "", "", "", "");
        
        if(param.TEXT[0].NAME == "REFDATA"){

          modeloTable.oData.TF4LIST = [];
          var visiRow = Number(param.TEXT[1].VALUE);
          //A73	Search Result
          var Ltext = l_txt + " : " + visiRow;
          ZF4SH_LBresult.setText(Ltext);
          ZF4SH_LBresult.setTooltip(Ltext);
          if(visiRow > 5){oPanel.setExpanded(false);}
          if(visiRow > 10){visiRow = 10;}
          var jsonData = param.TEXT[0].VALUE;
          modeloTable.setData( JSON.parse(jsonData));
        }

        //~조회 data 처리 누락이라면 ..
        if(param.TEXT[0].NAME == "NOTFOUND"){
          //A73	Search Result
          ZF4SH_LBresult.setText(l_txt + " : 0");
          ZF4SH_LBresult.setTooltip(l_txt + " : 0");

          modeloTable.oData.TF4LIST = [];
          modeloTable.refresh();
          var Ltxt = param.TEXT[0].VALUE;

          //~Message 처리
          parent.showMessage(sap, 10, "E", Ltxt);
        }

        oTable.setBusy(false);
        SerchBT1.setBusy(false);

        //-멀티 조회일경우
        if(l_isMulti){
          ZF4SH_select.setBusy(false);
        }
    }); //검색조건에 따른 결과 리스트 검색을 위한 서버 호출.


  }   //-검색 서버 조회 전송 처리 스크립트 펑션 생성



  //f4 help 필드정보 얻기.
  function lf_getF4Field(){

    //application명 서버전송 데이터 구성.
    var oFormData = new FormData();
    oFormData.append("trgubun", "F");

    //대표 f4 help명.
    oFormData.append("_SHLPNAME", I_SHLPNAME);

    //현재 선택한 F4 HELP명.
    var l_f4sub = l_f4_def;

    //include f4 help가 존재하는경우.
    if(l_isMulti){
      //현재 ddlb에서 선택한 f4 help명.
      l_f4sub.ZF4SH_select.getSelectedKey();
    }

    //현재 선택한 f4 help가 존재하지 않는경우.
    if(!l_f4sub){
      //대표 f4 help명으로 매핑.
      l_f4sub = I_SHLPNAME;
    }

    //현재 선택한 f4 help명수집.
    oFormData.append("_SHLPSUB", l_f4sub);


    //f4 help 필드정보 검색.
    sendAjax(parent.getServerPath() + "/f4serverData", oFormData, function(param){

      //BUSY OFF.
      parent.setBusy(false);

      //~witing mode 제거
      oDialog.setBusy(false);

      //~조회입력 패널 펼침
      oPanel.setExpanded(true);

      //검색조건 영역 재설정.
      lf_setSearchCondition(l_f4_def, param);

      //결과리스트 컬럼 재설정.
      lf_setTableColumn(l_f4_def, param);

    });

  } //f4 help 필드정보 얻기.



  var l_f4_def = I_SHLP_DEF;

  //default 단일 f4 help
  var l_isMulti = false;

  //include f4 help건이 존재하는 경우.
  if(IT_SHLP.length > 1){
    //include f4 help flag 처리.
    l_isMulti = true;
  }

  sap.ui.getCore().loadLibrary("sap.m");
  sap.ui.getCore().loadLibrary("sap.ui.layout");
  sap.ui.getCore().loadLibrary("sap.ui.table");

  //dialog width
  var l_width =  "80%";

  //dialog height
  var l_height =  "80%";


  var l_title = "";

  //F4 HELP명, TEXT 항목에서 해당 F4 HELP명 검색.
  for(var i=0,l=IT_SHLP.length; i<l; i++){
    if(IT_SHLP[i].SHLPNAME === l_f4_def){
      l_title = IT_SHLP[i].DDTEXT;
      break;
    }
  }

  //dialog 생성.
  var oDialog = new sap.m.Dialog({
    draggable:true,
    resizable:true,
    verticalScrolling:false,
    contentHeight:l_height,
    contentWidth:l_width,
    icon:"sap-icon://search",
    state:"Success",
    type:"Message",
    title:l_title
  });

  oDialog.addStyleClass("sapUiSizeCompact");

  var oTool = new sap.m.Toolbar();
  oDialog.setCustomHeader(oTool);
  
  //A26	Search Help
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A26", "", "", "", "");

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
    
    oDialog.close();
    oDialog.destroy();
    //001	Cancel operation
    parent.showMessage(sap,10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

  });

  //window에서 실행된건이 아닌경우 false 처리.
  var l_val = sap.ui.Device.os.name !== "win" || false;

  oDialog.setStretchOnPhone(l_val);
  oDialog.setStretch(l_val);

  //include search help가 존재 하는경우.
  if(l_isMulti){
    var ZF4SH_hbar = new sap.m.Bar();
    oDialog.setCustomHeader(ZF4SH_hbar);

    //dialog title
    var ZF4SH_toptitle = new sap.m.Text({text:l_title});
    ZF4SH_hbar.addContentMiddle(ZF4SH_toptitle);

    //~f4엔트리 탭 리스트 정보로 select ui 생성
    var ZF4SH_select = new sap.m.Select({selectedKey:l_f4_def,busyIndicatorDelay:1});

    //-include f4 help select 선택 이벤트 설정
    ZF4SH_select.attachEvent("change", function(oEvent){

      //A73	Search Result
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A73", "", "", "", "");

      //title 변경 처리.      
      ZF4SH_LBresult.setText(l_txt + " : 0");
      ZF4SH_LBresult.setTooltip(l_txt + " : 0");
      var slekey = l_f4_def = ZF4SH_select.getSelectedKey();
      var sleid  = ZF4SH_select.getSelectedItemId();
      var sletxt = document.getElementById(sleid).innerText;

      //dialog title 설정.
      ZF4SH_toptitle.setText(sletxt);

      //-팝업  Wating Mode
      oDialog.setBusy(true);

      //-조회 영역 필드 초기화
      ZF4searchModle.oData.param = {};
      ZF4searchModle.refresh();
      oPanel.setExpanded(false);

      oForm.removeAllContent();

      //-테이블 모델 Data 바인딩 초기화
      modeloTable.oData.TF4LIST = [];
      modeloTable.refresh();

      //-테이블 item / 컬럼 삭제
      oTable.removeAllColumns();

      //f4 help 필드명 검색.
      lf_getF4Field();

    }); //-include f4 help select 선택 이벤트 설정



    ZF4SH_hbar.addContentRight(ZF4SH_select);

    //include f4 help item 구성.
    for(var i=0, l= IT_SHLP.length; i<l; i++){
      ZF4SH_select.addItem(new sap.m.MenuItem({key:IT_SHLP[i].SHLPNAME, text:IT_SHLP[i].DDTEXT}));
    }

  }   //include search help가 존재 하는경우.


  var oHbox1 = new sap.m.HBox({height:"100%", direction:"Column", renderType:"Bare"});
  oDialog.addContent(oHbox1);

  //A74	Search Condition
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A74", "", "", "", "");

  //검색조건 panel.
  var oPanel = new sap.m.Panel({expandable:true, expanded:true, headerText:l_txt, tooltip:l_txt});
  oHbox1.addItem(oPanel);

  var SerchOVtoolbar = new sap.m.OverflowToolbar({width:"100%"});
  oPanel.setHeaderToolbar(SerchOVtoolbar);

  //검색버튼 label.
  var SerLB = new sap.m.Label({
    design:"Bold", required:false, text:l_txt, tooltip:l_txt});
  SerchOVtoolbar.addContent(SerLB);

  //A75	Search
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A75", "", "", "", "");

  //검색 버튼.
  var SerchBT1 = new sap.m.Button({
    icon:"sap-icon://search", text:l_txt, tooltip:l_txt, type:"Emphasized", busyIndicatorDelay:1
  });

  //검색버튼 선택 이벤트.
  SerchBT1.attachEvent("press",function(oEvent){
    LF_getServerData();
  });

  SerchOVtoolbar.addContent(SerchBT1);

  //~조회필드 FORM 영역 생성
  var oForm = new sap.ui.layout.form.SimpleForm({
    columnsM:2,editable:true,
    labelSpanL:5,labelSpanM:5,
    layout:"ResponsiveGridLayout"});
  oPanel.addContent(oForm);

  //검색조건 model.
  var ZF4searchModle = new sap.ui.model.json.JSONModel();
  ZF4searchModle.oData.param = {};
  oForm.setModel(ZF4searchModle);


  //조회조건 필드 구성.
  lf_setSearchCondition(l_f4_def, IT_FIELDDESCR);



  var ZF4SH_ovtoolbar = new sap.m.OverflowToolbar({width:"100%"});

  //A76	Maximum No, of Hits
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A76", "", "", "", "");

  //Maximum No, of Hits label.
  var olb01 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
  ZF4SH_ovtoolbar.addContent(olb01);

  //max Hits
  var ZF4SH_input01 = new sap.m.Input({type:"Number", width:"60px"});

  //최대 검색건수 설정.
  ZF4SH_input01.setValue(200);
  ZF4SH_ovtoolbar.addContent(ZF4SH_input01);
  ZF4SH_ovtoolbar.addContent(new sap.m.ToolbarSpacer());


  //A73	Search Result
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A73", "", "", "", "");

  //결과 건수 text
  var ZF4SH_LBresult = new sap.m.Label({design:"Bold",text:l_txt + " : 0", tooltip: l_txt  + " : 0"});
  ZF4SH_ovtoolbar.addContent(ZF4SH_LBresult);

  //F4 테이블 툴바 ui 생성
  var ZF4SH_tabBAR = new sap.m.Bar({design:"Header"});
  oHbox1.addItem(ZF4SH_tabBAR);



  //★~F4 조회 리스트 테이블 ui 생성
  var oTable = new sap.ui.table.Table({selectionMode:"Single", visibleRowCountMode:"Auto", 
    layoutData: new sap.m.FlexItemData({growFactor:1})});


  oHbox1.addItem(oTable);
  oTable.setToolbar(ZF4SH_ovtoolbar);

  //~table 모델 설정
  var modeloTable = new sap.ui.model.json.JSONModel();
  oTable.setModel(modeloTable);

  //결과리스트 라인 선택 이벤트 추가.
  oTable.attachRowSelectionChange(function(oEvent){

    //CALLBACK FUNCTION이 존재하지 않는경우 exit.
    if(typeof f_clientCallbak === "undefined"){return;}

    //CALLBACK FUNCTION 수행.
    f_clientCallbak(oEvent.mParameters.rowContext.getProperty());

    //f4 help dialog 종료.
    oDialog.close();
    oDialog.destroy();

  }); //결과리스트 라인 선택 이벤트 추가.


  //table 더블클릭 이벤트.
  oTable.attachBrowserEvent("dblclick", function(oEvent){
    
    //CALLBACK FUNCTION이 존재하지 않는경우 exit.
    if(typeof f_clientCallbak === "undefined"){return;}

    //edit 상태가 아닌경우 exit.
    if(oAPP.attr.oModel.oData.IS_EDIT === false){return;}

    //이벤트 발생 UI 정보 얻기.
    var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

    //UI정보를 얻지 못한 경우 exit.
    if(!l_ui){return;}

    //바인딩정보 얻기.
    var l_ctxt = l_ui.getBindingContext();

    //바인딩 정보를 얻지 못한 경우 exit.
    if(!l_ctxt){return;}

    //선택 처리건에 대한 return.
    f_clientCallbak(l_ctxt.getProperty());


    //f4 help dialog 종료.
    oDialog.close();
    oDialog.destroy();

  });


  oTable.bindAggregation("rows", {path:"/TF4LIST", template:new sap.ui.table.Row()});

  //~출력리스트 컬럼 구성 텍스트 UI 생성
  lf_setTableColumn(l_f4_def, IT_FIELDDESCR);

  
  //A39	Close
  var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

  //~종료 버튼
  var oClose = new sap.m.Button({icon:"sap-icon://cancel", text:l_txt, tooltip:l_txt, type:"Reject"});

  //종료버튼 선택 이벤트.
  oClose.attachEvent("press", function(oEvent){

    oDialog.close();
    oDialog.destroy();

  });

  //종료버튼 dialog에 추가.
  oDialog.setEndButton(oClose);


  oDialog.attachAfterOpen(function(){
    //DAILOG OPEN 이후 검색 FUNCTION 호출.
    //LF_getServerData();

    //f4 help 필드명 검색.
    lf_getF4Field();

  });


  oDialog.open();

};  //DDIC f4 help popup 처리 function.
