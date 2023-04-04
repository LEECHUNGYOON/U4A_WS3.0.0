(function(){

  //DATASET의 검색조건 LAYOUT의 미리보기 이미지 경로.
  const DATASET_IMG_PREFIX = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", "DATASET");

  const LAYOUT_IMG1 = "COL1.jpg";
  const LAYOUT_IMG2 = "COL2.jpg";
  const LAYOUT_IMG3 = "COL3.jpg";
  const LAYOUT_IMG4 = "COL4.jpg";


  //application 생성시 추가 입력정보 팝업 호출.
  oAPP.fn.createApplicationPopup = function(appid){

    //UI 구성정보 매핑 OBJECT.
    var oUIobj = {gen:{}, dataset:{}};
    

    // Application 생성 Dialog
    oUIobj.oCreateDialog = new sap.m.Dialog({draggable: true, resizable: true,
      contentWidth: "70%", contentHeight: "60%", verticalScrolling: false});
    
    oUIobj.oCreateDialog.addStyleClass("sapUiSizeCompact");

    var oModel = new sap.ui.model.json.JSONModel();
    oUIobj.oCreateDialog.setModel(oModel);

    //toolbar.
    var oTool = new sap.m.Toolbar();
    oUIobj.oCreateDialog.setCustomHeader(oTool);

    //B05	Create Option
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B05", "", "", "", "") 
      + " : " + appid;
    
    //application 생성팝업 title.
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
      //팝업 종료 처리.
      lf_closeDialog(oUIobj.oCreateDialog);

    }); //닫기 버튼 선택 이벤트.

    
    //생성팝업 content용 page.
    var oPage1 = new sap.m.Page();
    oUIobj.oCreateDialog.addContent(oPage1);


    //생성팝업 category용 icon tab header.
    var oHead = new sap.m.IconTabHeader({selectedKey:"{/selHKey}"});
    oPage1.setCustomHeader(new sap.m.Toolbar({content:[oHead]}));

    //header item 선택 이벤트.
    oHead.attachSelect(function(){

      switch(this.getSelectedKey()){ 
        case "K01": //General
          oNav.to(oGenPage);
          break;
        case "K02": //dataset.
          oNav.to(oDatesetPage);
          break;
      }

    }); //header item 선택 이벤트.

    
    //일반 application 생성 정보 tab.
    var oFilter1 = new sap.m.IconTabFilter({key:"K01", text:"General"});
    oHead.addItem(oFilter1);

    //B26  Data Set
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B26", "", "", "", "");
    //dataset 생성 정보 tab.    
    var oFilter2 = new sap.m.IconTabFilter({key:"K02", text:l_txt});
    oHead.addItem(oFilter2);


    var oNav = new sap.m.NavContainer();
    oPage1.addContent(oNav);

    //일반 정보 영역 page.
    var oGenPage = new sap.m.Page({showHeader:false});
    oNav.addPage(oGenPage);
    
    //application 일반 정보 UI 영역 구성.
    lf_createGenUI(oGenPage, oUIobj);


    //dataset 영역 page.
    var oDatesetPage = new sap.m.Page({showHeader:false});
    oNav.addPage(oDatesetPage);

    //application dataset UI 영역 구성.
    lf_createDatasetUI(oDatesetPage, oUIobj);



    
    var oFoot = new sap.m.Toolbar({content:[new sap.m.ToolbarSpacer()]});
    oPage1.setFooter(oFoot);
    oFoot.addStyleClass("sapUiTinyMargin");

    //B06  Local Object
    //B07  Create Local Application
    //application 로컬로 생성하기 버튼.
    var oLocal = new sap.m.Button({icon:"sap-icon://sys-monitor", 
      text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B06", "", "", "", ""),
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B07", "", "", "", "")});
    oFoot.addContent(oLocal);

    //로컬로 생성하기 버튼 선택 이벤트.
    oLocal.attachPress(function(){
      //application 로컬로 생성 처리.
      lf_createApplication(oModel, oUIobj, appid, true);

    }); //로컬로 생성하기 버튼 선택 이벤트.

    oFoot.addContent(new sap.m.ToolbarSeparator());

    //A01  Create
    //B08  Create Application
    //application 생성버튼.
    var oCreate = new sap.m.Button({type: "Accept", icon: "sap-icon://accept",
      text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A01", "", "", "", ""), 
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B08", "", "", "", "")});
    oFoot.addContent(oCreate);

    //application 생성버튼 선택 이벤트.
    oCreate.attachPress(function(){
      //application 생성 처리.
      lf_createApplication(oModel, oUIobj, appid);

    }); //application 생성버튼 선택 이벤트.


    //A39  Close
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

    //application 생성팝업 종료 버튼.
    var oClose = new sap.m.Button({text:l_txt, type: "Reject", icon: "sap-icon://decline", tooltip:l_txt});
    oFoot.addContent(oClose);

    //닫기 버튼 선택 이벤트.
    oClose.attachPress(function(){
      lf_closeDialog(oUIobj.oCreateDialog);

    }); //닫기 버튼 선택 이벤트.

    

    //default 정보 바인딩.
    lf_setDefaultVal(oModel);

    //팝업 호출.
    oUIobj.oCreateDialog.open();

  };  //application 생성시 추가 입력정보 팝업 호출.


  

  /************************************************************************
   * application 일반 정보 UI 영역
    ************************************************************************/
  function lf_createGenUI(oPage, oUIobj){

    //기본정보 form UI.
    var oGenForm = new sap.ui.layout.form.Form({editable:true, width:"100%",
      layout : new sap.ui.layout.form.ResponsiveGridLayout({
        labelSpanXL: 3, labelSpanL: 3, labelSpanM: 4, labelSpanS: 12, columnsL:1,
        singleContainerFullSize: false, adjustLabelSpan: false, backgroundDesign:"Transparent"})});
    
    oPage.addContent(oGenForm);
    
    var oCont1 = new sap.ui.layout.form.FormContainer();
    oGenForm.addFormContainer(oCont1);
    
    //APP Description.
    oUIobj.gen.oInpDesc = new sap.m.Input({value:"{/CREATE/APPNM}", valueState:"{/CREATE/APPNM_stat}",
      valueStateText:"{/CREATE/APPNM_stxt}", maxLength:40});

    //A91	APP Description
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oInpDesc],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Language Key Input Field
    oUIobj.gen.oInpLang = new sap.m.ComboBox({selectedKey:"{/CREATE/LANGU}", valueState:"{/CREATE/LANGU_stat}",
      valueStateText:"{/CREATE/LANGU_stxt}"});

    oUIobj.gen.oInpLang.bindAggregation("items", {path:"/T_LANGU", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //A98  Language Key
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A98", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oInpLang],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Character Format DDLB
    oUIobj.gen.oSelFormat = new sap.m.Select({selectedKey:"{/CREATE/CODPG}", valueState:"{/CREATE/CODPG_stat}",
      valueStateText:"{/CREATE/CODPG_stxt}"});

    oUIobj.gen.oSelFormat.bindAggregation("items", {path:"/T_CODPG", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //A99  Character Format
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A99", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oSelFormat],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    //UI5 UI Theme
    oUIobj.gen.oSelTheme = new sap.m.Select({selectedKey:"{/CREATE/UITHM}", valueState:"{/CREATE/UITHM_stat}",
      valueStateText:"{/CREATE/UITHM_stxt}"});

    oUIobj.gen.oSelTheme.bindAggregation("items", {path:"/T_UITHM", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //B01  UI5 UI Theme
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B01", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oSelTheme],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Web Application Type
    oUIobj.gen.oSelType = new sap.m.Select({selectedKey:"{/CREATE/APPTY}", enabled:"{/CREATE/APPTY_edit}"});


    oUIobj.gen.oSelType.bindAggregation("items", {path:"/T_APPTY", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //B02  Web Application Type
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B02", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oSelType],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Package Input Field
    oUIobj.gen.oInpPack = new sap.m.Input({value:"{/CREATE/PACKG}", valueState:"{/CREATE/PACKG_stat}",
      valueStateText:"{/CREATE/PACKG_stxt}", editable:"{/CREATE/PACKG_edit}", maxLength:30});

    //package 입력값 변경 이벤트.
    oUIobj.gen.oInpPack.attachChange(function(){      
      //package 입력값 변경 이벤트.
      lf_packageChangeEvent(this.getModel());

    }); //package 입력값 변경 이벤트.

    //A22  Package
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oInpPack],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Request No. Input Field
    oUIobj.gen.oInpReqNo = new sap.m.Input({value:"{/CREATE/REQNR}", valueState:"{/CREATE/REQNR_stat}",
      required:"{/CREATE/REQNR_requ}", editable:"{/CREATE/REQNR_edit}", showValueHelp:true, 
      valueHelpOnly:true, maxLength:20});
    
    //Request No f4 help 이벤트.
    oUIobj.gen.oInpReqNo.attachValueHelpRequest(function(){      
      lf_RequestF4help(this.getModel());

    }); //Request No f4 help 이벤트.

    //B03  Request No
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B03", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oInpReqNo],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));


    //Request Desc. Input Field
    oUIobj.gen.oInpReqTx = new sap.m.Input({value:"{/CREATE/REQTX}", editable:false});

    //B04  Request Desc.
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B04", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.gen.oInpReqTx],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));


  } //application 일반 정보 UI 영역




  /************************************************************************
   * application dataset 정보 UI 영역.
    ************************************************************************/
  function lf_createDatasetUI(oPage, oUIobj){
    
    //dataset form UI.
    var oDatasetForm = new sap.ui.layout.form.Form({editable:true, width:"100%",
      layout : new sap.ui.layout.form.ResponsiveGridLayout({
        labelSpanXL: 3, labelSpanL: 4, labelSpanM: 4, labelSpanS: 12, columnsL:2,
        singleContainerFullSize: false, adjustLabelSpan: false, backgroundDesign:"Transparent"})});
    
    oPage.addContent(oDatasetForm);

    var oCont1 = new sap.ui.layout.form.FormContainer();
    oDatasetForm.addFormContainer(oCont1);
    
    //obecjt 유형 radio button group.
    oUIobj.dataset.oRG01 = new sap.m.RadioButtonGroup({columns:2});

    oUIobj.dataset.oRG01.attachSelect(function(){
      //Object Type radio 선택건에 따른 object name desc 구성.
      lf_setObjectNameDesc(this.getModel());
    });

    //B28  Database View
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B28", "", "", "", "");
    var oRb01 = new sap.m.RadioButton({text:l_txt, tooltip:l_txt, selected:"{/DATASET/RB01}"});
    oRb01.addStyleClass("sapUiTinyMarginEnd");
    oUIobj.dataset.oRG01.addButton(oRb01);

    //B29  Transparent Table
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B29", "", "", "", "");
    var oRb02 = new sap.m.RadioButton({text:l_txt, tooltip:l_txt, selected:"{/DATASET/RB02}"});
    oUIobj.dataset.oRG01.addButton(oRb02);

    //B27  Object Type
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B27", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oRG01],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));

    

    //OBJECT NAME INPUT FIELD(VIEW, TABLE명 입력필드.)
    oUIobj.dataset.oInp1 = new sap.m.Input({showValueHelp:true, fieldWidth:"40%", value:"{/DATASET/TABNM}",
      valueState:"{/DATASET/TABNM_stat}", valueStateText:"{/DATASET/TABNM_stxt}", description:"{/DATASET/TABTX}", maxLength:16});
    
    //OBJECT NAME change 이벤트.
    oUIobj.dataset.oInp1.attachChange(function(){
      //VIEW(TABLE) 입력건 대문자 변환 처리.
      this.setValue(this.getValue().toUpperCase());

    }); //OBJECT NAME change 이벤트.

    //OBJECT NAME F4 HELP 이벤트.
    oUIobj.dataset.oInp1.attachValueHelpRequest(function(){
      //OBJECT NAME F4 HELP 이벤트.
      lf_ObjNameF4Help(this.getModel(), this);

    }); //OBJECT NAME F4 HELP 이벤트.

    
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInp1],
      label: new sap.m.Label({required:true, design:"Bold", text:"{/DATASET/OBJNM}", tooltip:"{/DATASET/OBJNM}"})}));



    //APP Description.
    oUIobj.dataset.oInpDesc = new sap.m.Input({value:"{/DATASET/APPNM}", valueState:"{/DATASET/APPNM_stat}",
      valueStateText:"{/DATASET/APPNM_stxt}", maxLength:40});

    //A91	APP Description
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInpDesc],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Language Key Input Field
    oUIobj.dataset.oInpLang = new sap.m.ComboBox({selectedKey:"{/DATASET/LANGU}", valueState:"{/DATASET/LANGU_stat}",
      valueStateText:"{/DATASET/LANGU_stxt}"});

    oUIobj.dataset.oInpLang.bindAggregation("items", {path:"/T_LANGU", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //A98  Language Key
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A98", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInpLang],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Character Format DDLB
    oUIobj.dataset.oSelFormat = new sap.m.Select({selectedKey:"{/DATASET/CODPG}", valueState:"{/DATASET/CODPG_stat}",
      valueStateText:"{/DATASET/CODPG_stxt}"});

    oUIobj.dataset.oSelFormat.bindAggregation("items", {path:"/T_CODPG", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //A99  Character Format
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A99", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oSelFormat],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    //UI5 UI Theme
    oUIobj.dataset.oSelTheme = new sap.m.Select({selectedKey:"{/DATASET/UITHM}", valueState:"{/DATASET/UITHM_stat}",
      valueStateText:"{/DATASET/UITHM_stxt}"});

    oUIobj.dataset.oSelTheme.attachChange(function(){
      //라디오 버튼 선택에 따른 이미지 변경 처리.
      lf_setSearchLayoutImage(this.getModel());
    });

    oUIobj.dataset.oSelTheme.bindAggregation("items", {path:"/T_UITHM", templateShareable:true,
      template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

    //B01  UI5 UI Theme
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B01", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oSelTheme],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Package Input Field
    oUIobj.dataset.oInpPack = new sap.m.Input({value:"{/DATASET/PACKG}", valueState:"{/DATASET/PACKG_stat}",
      valueStateText:"{/DATASET/PACKG_stxt}", editable:"{/DATASET/PACKG_edit}", maxLength:30});

    //package 입력값 변경 이벤트.
    oUIobj.dataset.oInpPack.attachChange(function(){      
      //package 입력값 변경 이벤트.
      lf_packageChangeEvent(this.getModel());

    }); //package 입력값 변경 이벤트.

    //A22  Package
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInpPack],
      label: new sap.m.Label({required:true, design:"Bold", text:l_txt, tooltip:l_txt})}));



    //Request No. Input Field
    oUIobj.dataset.oInpReqNo = new sap.m.Input({value:"{/DATASET/REQNR}", valueState:"{/DATASET/REQNR_stat}",
      required:"{/DATASET/REQNR_requ}", editable:"{/DATASET/REQNR_edit}", showValueHelp:true, 
      valueHelpOnly:true, maxLength:20});
    
    //Request No f4 help 이벤트.
    oUIobj.dataset.oInpReqNo.attachValueHelpRequest(function(){      
      lf_RequestF4help(this.getModel());

    }); //Request No f4 help 이벤트.

    //B03  Request No
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B03", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInpReqNo],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));


    //Request Desc. Input Field
    oUIobj.dataset.oInpReqTx = new sap.m.Input({value:"{/DATASET/REQTX}", editable:false});

    //B04  Request Desc.
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B04", "", "", "", "");
    oCont1.addFormElement( new sap.ui.layout.form.FormElement({fields:[oUIobj.dataset.oInpReqTx],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));



    var oCont2 = new sap.ui.layout.form.FormContainer();
    oDatasetForm.addFormContainer(oCont2);
    
    

    var oHbox3 = new sap.m.HBox({direction:"Column"});

    //E12	One Column
    var l_txt1 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E12", "", "", "", "");

    //E13	Two Columns
    var l_txt2 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E13", "", "", "", "");

    //E14	Three Columns
    var l_txt3 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E14", "", "", "", "");

    //E15	Four Columns
    var l_txt4 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E15", "", "", "", "");

    //검색조건 layout 선택 radio button group.
    var oRG02 = new sap.m.RadioButtonGroup({columns:4, selectedIndex:"{/DATASET/SCCNT}",
      buttons:[
      new sap.m.RadioButton({text:l_txt1, tooltip:l_txt1}),
      new sap.m.RadioButton({text:l_txt2, tooltip:l_txt2}),
      new sap.m.RadioButton({text:l_txt3, tooltip:l_txt3}),
      new sap.m.RadioButton({text:l_txt4, tooltip:l_txt4})
    ]});

    oHbox3.addItem(oRG02);

    //라디오 버튼 그룹 선택 이벤트.
    oRG02.attachSelect(function(){
      //라디오 버튼 선택에 따른 이미지 변경 처리.
      lf_setSearchLayoutImage(this.getModel());

    }); //라디오 버튼 그룹 선택 이벤트.

    //E09  Search Layout
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E09", "", "", "", "");
    oCont2.addFormElement( new sap.ui.layout.form.FormElement({fields:[oHbox3],
      label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})}));


    
    //검색조건 영역 미리보기 이미지.
    var oImg = new sap.m.Image({src:"{/DATASET/imgsrc}", height:"250px", width:"100%",
      detailBox:new sap.m.LightBox({imageContent:new sap.m.LightBoxItem({imageSrc:"{/DATASET/imgsrc}"})})});
        
    oCont2.addFormElement( new sap.ui.layout.form.FormElement({fields:[oImg]}));


  } //dataset 영역 UI 구성.
  



  //js 파일 load
  function lf_getScript(fname, callbackFunc, bSync){
    //js 파일 load
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        eval(this.responseText);
        callbackFunc();
      }
    };

    var l_async = true;
    if(bSync === true){
      l_async = false;
    }

    xhttp.open("GET", fname + ".js", l_async);
    xhttp.send();

  } //js 파일 load




  /************************************************************************
   * 점검 로직 -start.
   ************************************************************************/
  //standard package 입력 여부 점검.
  function lf_chkPackageStandard(is_appl){

    //로컬 PACKAGE가 아닌경우 Y, Z 이외의 패키지명을 입력한 경우.
    if(is_appl.PACKG !== "" &&
      is_appl.PACKG !== "$TMP" &&
      is_appl.PACKG.substr(0,1) !== "Y" &&
      is_appl.PACKG.substr(0,1) !== "Z"){

        is_appl.PACKG_stat = "Error";
        //275	Standard package cannot be entered.
        is_appl.PACKG_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "275", "", "", "", "");

        //오류 flag return.
        return true;
    }

  } //standard package 입력 여부 점검.




  //application 생성전 입력값 점검.
  function lf_chkValue(oModel, oUIobj){

    var l_stru = "";
    var l_selHKey = oModel.getProperty("/selHKey");
    var oFocusUI, ls_ui;

    //icon header의 선택건에 따른 분기.
    switch(l_selHKey){
      case "K01": //일반 app 생성건.
        l_stru = "/CREATE";
        ls_ui = oUIobj["gen"];
        break;

      case "K02": //dataset app 생성건.
        l_stru = "/DATASET";
        ls_ui = oUIobj["dataset"];
        break;

      default:
        return;
    }

    var ls_appl = oModel.getProperty(l_stru);
    
    //valueState 바인딩 필드 초기화.
    lf_resetValueStateField(ls_appl);

    var l_err = false;

    //dataset의 table명을 입력하지 않은경우.
    if(l_selHKey === "K02" && ls_appl.TABNM === ""){
      ls_appl.TABNM_stat = "Error";
      //A33	Application name
      //014	& is required entry value.
      ls_appl.TABNM_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A33"), "", "", "");
      l_err = true;

      oFocusUI = ls_ui.oInp1;

    }

    //Web Application Name 이 입력되지 않은경우.
    //(dataset의 Object Name입력됐다면 view, table의 desc를 Web Application Name으로 대체.)
    if(ls_appl.APPNM === "" && l_selHKey === "K01"){
      ls_appl.APPNM_stat = "Error";
      //A33	Application name
      //014	& is required entry value.
      ls_appl.APPNM_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A33"), "", "", "");
      l_err = true;

      if(!oFocusUI){oFocusUI = ls_ui.oInpDesc;}

    }

    //langage가 존재하지 않는경우.
    if(ls_appl.LANGU === ""){
      ls_appl.LANGU_stat = "Error";
      //A98	Language Key
      //014	& is required entry value.
      ls_appl.LANGU_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A98"), "", "", "");
      l_err = true;

      if(!oFocusUI){oFocusUI = ls_ui.oInpLang;}

    }

    //Package가 입력되지 않은 경우.
    if(ls_appl.PACKG === ""){
      ls_appl.PACKG_stat = "Error";
      //A22	Package
      //014	& is required entry value.
      ls_appl.PACKG_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22"), "", "", "");
      l_err = true;

      if(!oFocusUI){oFocusUI = ls_ui.oInpPack;}

    }

    //Y, Z 이외의 패키지명을 입력한 경우.
    if(lf_chkPackageStandard(ls_appl) === true){
      l_err = true;

      if(!oFocusUI){oFocusUI = ls_ui.oInpPack;}

    }

    //개발 패키지를 입력한경우 CTS번호를 입력하지 않은경우.
    if(ls_appl.PACKG !== "$TMP" && ls_appl.PACKG !== "" && ls_appl.REQNR === ""){
      ls_appl.REQNR_stat = "Error";
      //277	If not a local object, Request No. is required entry value.
      ls_appl.REQNR_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "277", "", "", "", "");
      l_err = true;

      if(!oFocusUI){oFocusUI = ls_ui.oInpReqNo;}

    }

    //입력값에 오류 사항이 존재하는 경우 exit.
    if(l_err === true){
      oModel.setProperty(l_stru, ls_appl);
      //274	Check input value.
      parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "274", "", "", "", ""), function(){
        if(oFocusUI){oFocusUI.focus();}
      });
      return l_err;
    } 

    oModel.setProperty(l_stru, ls_appl);

  } //application 생성전 입력값 점검.



  //입력 package 점검 function.
  function lf_chkPackage(oModel, is_create){
    //application명 서버전송 데이터 구성.
    
    //서버호출전 화면 잠금 처리.
    sap.ui.getCore().lock();

    //busy dialog open.
    oAPP.common.fnSetBusyDialog(true);

    var oFormData = new FormData();
    oFormData.append("PACKG", is_create.PACKG);

    //package 입력건 점검을 위한 서버 호출.
    sendAjax(parent.getServerPath() + "/chkPackage", oFormData, function(ret){

      //서버에서 클라이언트 도착 후 화면 잠금 해제 처리.
      sap.ui.getCore().unlock();

      //busy dialog close.
      oAPP.common.fnSetBusyDialog(false);
      

      //icon header의 선택건에 따른 모델 구조명 얻기.
      var ls_stru = lf_getStruName(oModel);
      if(!ls_stru){return;}

      //잘못된 PACKAGE를 입력한 경우.
      if(ret.ERFLG === "X"){
        is_create.PACKG_stat = "Error"; 
        is_create.PACKG_stxt = ret.ERMSG;        

        oModel.setProperty(ls_stru, is_create);

        //오류 메시지 처리.
        parent.showMessage(sap, 20, "E", ret.ERMSG);
        
        return;
      }

      //로컬 PACKAGE를 입력한 경우.
      if(ret.ISLOCAL === "X"){
        is_create.REQNR_edit = false; //Request No. 잠금 처리.
        is_create.REQNR_requ = false; //Request No. 필수입력 false 처리
        is_create.REQNR = "";   //기존 입력 Request No. 초기화.
        is_create.REQTX = "";   //기존 입력 Request Desc. 초기화.
        
      //로컬 package가 아닌경우.
      }else if(ret.ISLOCAL === ""){

        is_create.REQNR_edit = true; //Request No. edit 처리.
        is_create.REQNR_requ = true; //Request No. 필수입력 처리
      }

      //모델 갱신 처리.
      oModel.setProperty(ls_stru, is_create);


    },"", true, "POST", function(e){
      //오류 발생시 lock 해제.
      sap.ui.getCore().unlock();

    }); //package 입력건 점검을 위한 서버 호출.

  } //입력 package 점검 function.




  //package 입력값 변경 이벤트.
  function lf_packageChangeEvent(oModel){

    //icon header의 선택건에 따른 모델 구조명 얻기.
    var ls_stru = lf_getStruName(oModel);
    if(!ls_stru){
      return;
    }
        
    //화면 입력정보 얻기.
    var l_create = oModel.getProperty(ls_stru);

    //오류 출력 필드 초기화.
    lf_resetValueStateField(l_create);
    
    //default Request No. 입력불가능, 필수 해제처리.
    l_create.REQNR_edit = false;
    l_create.REQNR_requ = false;

    //패키지명이 입력되지 않은경우 exit.
    if(l_create.PACKG === ""){
      oModel.setProperty(ls_stru, l_create);
      return;
    }
    
    //입력 패키지명 대문자 변환 처리.
    l_create.PACKG = l_create.PACKG.toUpperCase();

    //로컬 패키지를 입력한 경우.
    if(l_create.PACKG === "$TMP"){
      l_create.REQNR = "";   //기존 입력 Request No. 초기화.
      l_create.REQTX = "";   //기존 입력 Request Desc. 초기화.
      oModel.setProperty(ls_stru, l_create);
      return;
    }
   

    //standard package를 입력한 경우.
    if(lf_chkPackageStandard(l_create) === true){
      oModel.setProperty(ls_stru, l_create);
      return;
    }


    //로컬 PACKAGE를 입력하지 않은경우 Y,Z으로 입력한 PACKAGE의 정합성 점검.
    lf_chkPackage(oModel, l_create);

  } //package 입력값 변경 이벤트.
  /************************************************************************
   * 점검 로직 -end.
   ************************************************************************/




  //valueState 바인딩 필드 초기화.
  function lf_resetValueStateField(cs_appl){

    //valueState 바인딩 필드.
    cs_appl.APPNM_stat = null;  //Web Application Name
    cs_appl.LANGU_stat = null;  //Language Key
    cs_appl.CODPG_stat = null;  //Character Format
    cs_appl.UITHM_stat = null;  //UI5 UI Theme
    cs_appl.PACKG_stat = null;  //Package
    cs_appl.REQNR_stat = null;  //Request No.

    //valueStateText 바인딩 필드.
    cs_appl.APPNM_stxt = null;  //Web Application Name
    cs_appl.LANGU_stxt = null;  //Language Key
    cs_appl.CODPG_stxt = null;  //Character Format
    cs_appl.UITHM_stxt = null;  //UI5 UI Theme
    cs_appl.PACKG_stxt = null;  //Package
    cs_appl.REQNR_stxt = null;  //Request No.

    if(cs_appl.itemKey === "K02"){
      //VIEW(TABLE)의 오류 표현 필드 초기화.
      cs_appl.TABNM_stat = null;  
      cs_appl.TABNM_stxt = null;
    }    

  } //valueState 바인딩 필드 초기화.




  //초기값 설정.
  function lf_setDefaultVal(oModel){

    //General 초기값 구성.
    var ls_appl = lf_setDefaultValGeneral();

    //dataset 초기값 구성.
    var ls_dataset = lf_setDefaultValDataset();

    var l_userInfo = parent.getUserInfo();

    //Language Key DDLB 리스트
    // var T_LANGU = [{KEY:"EN",TEXT:"English"},
    //                {KEY:"KO",TEXT:"Korean"}
    //               ];

    var T_LANGU = [];

    //SAP 서버의 설치된 언어 정보를 기준으로 DDLB 항목 구성.
    for(var i=0, l= l_userInfo.META.T_LANGU.length; i<l; i++){
      T_LANGU.push({KEY:l_userInfo.META.T_LANGU[i].SPRAS, TEXT:l_userInfo.META.T_LANGU[i].SPTXT});
    }
    

    //Character Format DDLB 리스트
    var T_CODPG = [{KEY:"utf-8", TEXT:"utf-8"},
                   {KEY:"EUC-KR", TEXT:"EUC-KR"}
                  ];

    //UI5 UI Theme DDLB 리스트
    // var T_UITHM = [{KEY:"base",TEXT:"base"},
    //                 {KEY:"sap_belize",TEXT:"sap_belize"},
    //                 {KEY:"sap_belize_hcb",TEXT:"sap_belize_hcb"},
    //                 {KEY:"sap_belize_hcw",TEXT:"sap_belize_hcw"},
    //                 {KEY:"sap_belize_plus",TEXT:"sap_belize_plus"},
    //                 {KEY:"sap_bluecrystal",TEXT:"sap_bluecrystal"},
    //                 {KEY:"sap_hcb",TEXT:"sap_hcb"},
    //                 {KEY:"sap_fiori_3",TEXT:"sap_fiori_3"},
    //                 {KEY:"sap_fiori_3_dark",TEXT:"sap_fiori_3_dark"},
    //                 {KEY:"sap_fiori_3_hcb",TEXT:"sap_fiori_3_hcb"},
    //                 {KEY:"sap_fiori_3_hcw",TEXT:"sap_fiori_3_hcw"},
    //                 {KEY:"sap_horizon",TEXT:"sap_horizon"},
    //                 {KEY:"sap_horizon_dark",TEXT:"sap_horizon_dark"},
    //                 {KEY:"sap_horizon_hcb",TEXT:"sap_horizon_hcb"},
    //                 {KEY:"sap_horizon_hcw",TEXT:"sap_horizon_hcw"}
    //                 ];

    var T_UITHM = [];

    //서버의 테마 공통코드 항목을 기준으로 DDLB 리스트 구성.
    for(var i=0, l= l_userInfo.META.T_REG_THEME.length; i<l; i++){
      T_UITHM.push({KEY:l_userInfo.META.T_REG_THEME[i].THEME, TEXT:l_userInfo.META.T_REG_THEME[i].THEME});
    }

    //Web Application Type DDLB 리스트.
    // var T_APPTY = [{KEY:"M",TEXT:"U4A Application"},
    //                    {KEY:"U",TEXT:"U4A Server Page"}
    //                   ];

    var T_APPTY = [];

    //Web Application Type DDLB 리스트.
    for(var i=0, l= l_userInfo.META.T_APPTY.length; i<l; i++){
      T_APPTY.push({KEY:l_userInfo.META.T_APPTY[i].KEY, TEXT:l_userInfo.META.T_APPTY[i].TEXT});
    }


    oModel.setData({"selHKey":"K01",
                    "CREATE":ls_appl, 
                    "DATASET":ls_dataset,
                    "T_LANGU":T_LANGU,
                    "T_CODPG":T_CODPG,
                    "T_UITHM":T_UITHM,
                    "T_APPTY":T_APPTY
                    });

  } //초기값 설정.




  //General 초기값 설정.
  function lf_setDefaultValGeneral(){

    var ls_appl = {};

    //일반정보 tab의 key 정보.
    ls_appl.itemKey = "K01";

    //Web Application Name
    ls_appl.APPNM = "";

    //접속 유저 정보 얻기.
    var ls_userInfo = parent.getUserInfo();

    //Language Key default EN
    ls_appl.LANGU = "E";

    //접속 유저 정보, 접속 language가 존재하는경우.
    if(ls_userInfo && ls_userInfo.META.LANGU){
      //해당 language를 default language로 설정.
      ls_appl.LANGU = ls_userInfo.META.LANGU;

    }

    //Character Format
    ls_appl.CODPG = "utf-8";

    //UI5 UI Theme
    ls_appl.UITHM = "sap_horizon";

    //default 테마 정보 검색.
    var ls_theme = ls_userInfo.META.T_REG_THEME.find( a=> a.ISDEF === "X" );

    //default 테마정보를 검색한 경우 해당 테마를 선택 처리.
    if(ls_theme){
      ls_appl.UITHM = ls_theme.THEME;
    }

    //Web Application Type
    ls_appl.APPTY = "M";

    //DEFAULT DDLB 활성화.
    ls_appl.APPTY_edit = true;

    //Package
    ls_appl.PACKG = "";

    //default Package 입력 가능처리.
    ls_appl.PACKG_edit = true;

    //trial 버전 인경우.
    if(parent.getIsTrial()){
      //로컬 패키지 고정.
      ls_appl.PACKG = "$TMP";

      //패키지 입력 불가 처리.
      ls_appl.PACKG_edit = false;
    }

    //Request No.
    ls_appl.REQNR = "";

    //Request Desc.
    ls_appl.REQTX = "";

    //Request No. 입력 가능 여부 바인딩 필드.
    ls_appl.REQNR_edit = false;

    //Request No. 필수 입력 여부 바인딩 필드.
    ls_appl.REQNR_requ = false;

    //valueState 바인딩 필드 초기화.
    lf_resetValueStateField(ls_appl);

    return ls_appl;

  } //General 초기값 설정.




  //dataset 초기값 설정.
  function lf_setDefaultValDataset(){

    var ls_appl = {};

    //dataset tab의 key 정보.
    ls_appl.itemKey = "K02";

    //Web Application Name
    ls_appl.APPNM = "";

    //접속 유저 정보 얻기.
    var ls_userInfo = parent.getUserInfo();

    //Language Key default EN
    ls_appl.LANGU = "E";

    //접속 유저 정보, 접속 language가 존재하는경우.
    if(ls_userInfo && ls_userInfo.META.LANGU){
      //해당 language를 default language로 설정.
      ls_appl.LANGU = ls_userInfo.META.LANGU;

    }

    //Character Format
    ls_appl.CODPG = "utf-8";

    //UI5 UI Theme
    ls_appl.UITHM = "sap_horizon";

    //default 테마 정보 검색.
    var ls_theme = ls_userInfo.META.T_REG_THEME.find( a=> a.ISDEF === "X" );

    //default 테마정보를 검색한 경우 해당 테마를 선택 처리.
    if(ls_theme){
      ls_appl.UITHM = ls_theme.THEME;
    }

    //Web Application Type
    ls_appl.APPTY = "M";

    //Package
    ls_appl.PACKG = "";

    //default Package 입력 가능처리.
    ls_appl.PACKG_edit = true;

    //trial 버전 인경우.
    if(parent.getIsTrial()){
      //로컬 패키지 고정.
      ls_appl.PACKG = "$TMP";

      //패키지 입력 불가 처리.
      ls_appl.PACKG_edit = false;
    }

    //Request No.
    ls_appl.REQNR = "";

    //Request Desc.
    ls_appl.REQTX = "";

    //Request No. 입력 가능 여부 바인딩 필드.
    ls_appl.REQNR_edit = false;

    //Request No. 필수 입력 여부 바인딩 필드.
    ls_appl.REQNR_requ = false;

    //Database View 선택 처리.
    ls_appl.RB01 = true;

    //Transparent Table 선택 해제 처리.
    ls_appl.RB02 = false;
    
    //view(table)명.
    ls_appl.TABNM = "";

    //view(table) desc.
    ls_appl.TABTX = "";

    //필드 리스트 정보.
    ls_appl.FLIST = "";

    //검색조건 컬럼 radio 선택 index.
    ls_appl.SCCNT = 0;

    //이미지 경로.
    ls_appl.imgsrc = DATASET_IMG_PREFIX + "/" + ls_appl.UITHM + "/" + LAYOUT_IMG1;

    //B28  Database View
    ls_appl.OBJNM = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B28", "", "", "", "");

    //valueState 바인딩 필드 초기화.
    lf_resetValueStateField(ls_appl);

    return ls_appl;

  } //dataset 초기값 설정.





  //dialog 종료 처리.
  function lf_closeDialog(oUI, bSkipMsg){
    oUI.close();
    oUI.destroy();

    if(bSkipMsg === true){return;}
    
    //001	Cancel operation
    parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

  } //dialog 종료 처리.




  //dataset 파라메터 추가 처리.
  function lf_setDatasetParam(oModel, oForm){

    //DATASET으로 생성되는건이 아닌경우 EXIT.
    if(oModel.getProperty("/selHKey") !== "K02"){return;}

    //dataset 추가 속성 정보 얻기.
    var l_dataset = oModel.getProperty("/DATASET");

    //DATASET의 VIEW(TABLE)이 입력되지 않은경우 EXIT.
    if(l_dataset.TABNM === ""){return;}

    var l_param = {};

    //view(table)명.
    l_param.TABNM = l_dataset.TABNM;

    //검색조건 필드 항목.
    l_param.FLIST = l_dataset.FLIST;

    //검색조건 컬럼 숫자 매핑.
    l_param.SCCNT = l_dataset.SCCNT + 1;

    //radio를 선택한건에 따른 유형 분기.
    switch (true) {
      case l_dataset.RB01:
          //DATABASE VIEW를 선택한 경우.
          l_param.TABTY = "V";
          break;
      
      case l_dataset.RB02:
          //TRASNPARENT TABLE을 선택한 경우.
          l_param.TABTY = "T";
          break;
  
      default:
          break;
    }

    //dataset 파라메터 추가.
    oForm.append("DATASET", JSON.stringify(l_param));

    //DATASET의 VIEW(TABLE) TEMPLATE 정보 얻기.
    var l_layo = parent.require(parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "template", "dataset", "databaseview_layo01.json"));

    if(!l_layo){return;}

    oForm.append("DATASET_LAYO", JSON.stringify(l_layo));
    

  } //dataset 파라메터 추가 처리.




  //application 생성처리를 위한 서버 호출.
  function lf_createAppData(oModel, oUIobj, appid){

    //생성전 화면 lock 처리.
    sap.ui.getCore().lock();

    //busy dialog close.
    oAPP.common.fnSetBusyDialog(true);

    //icon header의 선택건에 따른 모델 구조명 얻기.
    var ls_stru = lf_getStruName(oModel);
    if(!ls_stru){return;}

    var l_create = oModel.getProperty(ls_stru);
    var l_appdata = {};
    l_appdata.APPID = appid;          //Web Application ID
    l_appdata.APPNM = l_create.APPNM; //Web Application Name    
    l_appdata.LANGU = l_create.LANGU; //Language Key
    l_appdata.APPTY = l_create.APPTY; //Web Application Type
    l_appdata.CODPG = l_create.CODPG; //Identifier for Character Format (UTF-8, UCS-2, ...)
    l_appdata.UITHM = l_create.UITHM; //UI5 UI Theme
    l_appdata.PACKG = l_create.PACKG; //Package
    l_appdata.REQNR = l_create.REQNR; //Request/Task

    //default application 생성 path.
    var l_path = "/createAppData";

    //Web Application Type을 U4A Server Page로 설정한경우.
    if(l_appdata.APPTY === "U"){
      //U4A Server Page 생성 path로 변경.
      l_path = "/USP_CREATEAPPDATA";
    }


    //application명 서버전송 데이터 구성.
    var oFormData = new FormData();
    oFormData.append("APPDATA", JSON.stringify(l_appdata));

    //dataset 파라메터 추가 처리.
    lf_setDatasetParam(oModel, oFormData);


    //application 생성을 위한 서버 호출.
    sendAjax(parent.getServerPath() + l_path, oFormData, function(ret){

      //서버에서 클라이언트 도착 후 화면 잠금 해제 처리.
      sap.ui.getCore().unlock();

      //busy dialog close.
      oAPP.common.fnSetBusyDialog(false);
      
      //application 생성중 오류가 발생한 경우.
      if(ret.RETCD === "E"){
        //오류 메시지 출력.
        parent.showMessage(sap, 20, "E", ret.RTMSG);

        //wait off 처리.
        parent.setBusy("");

        return;
      }

      //생성 처리 성공 이후 work space UI editor 화면으로 이동 처리.
      onAppCrAndChgMode(appid);

      //dialog 종료 처리.
      lf_closeDialog(oUIobj.oCreateDialog, true);

    },"", true, "POST", function(e){
      //오류 발생시 lock 해제.
      sap.ui.getCore().unlock();

    }); //application 생성을 위한 서버 호출.

  } //application 생성처리를 위한 서버 호출.




  //어플리케이션 생성 처리.
  async function lf_createApplication(oModel, oUIobj, appid, bIsLocal){

    //생성전 화면 lock 처리.
    sap.ui.getCore().lock();

    //busy dialog true.
    oAPP.common.fnSetBusyDialog(true);

    //icon header의 선택건에 따른 모델 구조명 얻기.
    var l_stru = lf_getStruName(oModel);
    if(!l_stru){
      //모델정보를 얻지 못한경우 화면 unlock 처리 후 exit.
      sap.ui.getCore().unlock();
        
      //busy dialog true.
      oAPP.common.fnSetBusyDialog(false);
      return;
    }


    //바인딩 정보 얻기.
    var l_create = oModel.getProperty(l_stru);

    if(!l_create){
      //모델정보를 얻지 못한경우 화면 unlock 처리 후 exit.
      sap.ui.getCore().unlock();
      
      //busy dialog true.
      oAPP.common.fnSetBusyDialog(false);

      return;

    }


    //로컬로 생성하는경우.
    if(bIsLocal === true){
      //로컬로 생성하고자 package명을 $TMP로 고정 후 CTS 번호 입력란 잠금 처리 및 CTS번호 초기화.
      l_create.PACKG = "$TMP";
      l_create.REQNR_edit = false; //Request No. 잠금 처리.
      l_create.REQNR_requ = false; //Request No. 필수입력 false 처리
      l_create.REQNR = "";   //기존 입력 Request No. 초기화.
      l_create.REQTX = "";   //기존 입력 Request Desc. 초기화.

      oModel.setProperty(l_stru, l_create);

    }
    

    //application 생성 처리전 입력값 점검.
    if(lf_chkValue(oModel, oUIobj) === true){

      //입력값 오류 발생시 lock해제.
      sap.ui.getCore().unlock();

      //busy dialog close.
      oAPP.common.fnSetBusyDialog(false);
      return;
    }


    //입력값 오류 발생시 lock해제.
    sap.ui.getCore().unlock();

    //busy dialog close.
    oAPP.common.fnSetBusyDialog(false);


    //VIEW(TABLE)명을 입력했다면 검색필드 선택 팝업 호출.
    if(oModel.getProperty("/selHKey") === "K02"){
      
      //필드 리스트 POPUP정보가 존재하지 않는경우 JS READ.
      if(typeof oAPP.fn._DATASET === "undefined"){
        oAPP.fn._DATASET = parent.require(parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "js", "callDataSetFieldListPopop.js"));
      }

      //DATASET을 설정한 경우 입력 OBJECT NAME의 검색조건 리스트 정보 얻기.
      var ls_return = await oAPP.fn._DATASET.callDataSetFieldListPopop(oModel.getProperty("/DATASET"), oAPP);

      //팝업에서 닫기(취소)를 선택한경우.
      if(ls_return.RETCD === "C"){
        //001	Cancel operation
        parent.showMessage(sap, 10, "I", ls_return.RTMSG);
        return;
      }

      //필드 리스트 팝업에서 오류가 발생한 경우 exit.
      if(ls_return.RETCD === "E"){
        //오류 메시지 출력.
        oModel.setProperty("/DATASET/TABNM_stat", "Error");
        oModel.setProperty("/DATASET/TABNM_stxt", ls_return.RTMSG);
        parent.showMessage(sap, 20, "E", ls_return.RTMSG, function(){
          oUIobj.dataset.oInp1.focus();
        });

        return;
      }

      //필드 리스트 정보 매핑(없는경우 빈값으로 매핑)
      oModel.setProperty("/DATASET/FLIST", ls_return.FLIST || "");

      //Web Application Name을 입력하지 않은경우.
      if(l_create.APPNM === ""){
        //VIEW(TABLE)의 DESC를 매핑.
        oModel.setProperty("/DATASET/APPNM", ls_return.TDESC);
      }

    }

    //생성전 확인팝업 호출.
    //276	Create &1 application?
    parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "276", appid, "", "", ""), function(param){
      
      //YES를 선택하지 않은경우 EXIT.
      if(param !== "YES"){return;}
      
      //application 생성 처리.
      lf_createAppData(oModel, oUIobj, appid);

    }); //생성전 확인팝업 호출.


  } //어플리케이션 생성 처리.




  //object name f4 help 이벤트.
  function lf_ObjNameF4Help(oModel, oUi){
        
    // f4 help callback function.
    function lf_callback(param){
      //파라메터를 전달받지 못한 경우 exit.
      if(!param){return;}

      //파라메터의 필드명에 해당하는 값 매핑.
      oUi.setValue(param[l_fldnm]);
      oUi.setDescription(param["DDTEXT"]);

      //APP Description에 값이 없는경우.
      if(oModel.getProperty("/DATASET/APPNM") === "" && param["DDTEXT"] && param["DDTEXT"] !== ""){
        //view(table)의 description을 매핑.
        oModel.setProperty("/DATASET/APPNM", param["DDTEXT"]);
      }

    } // f4 help callback function.


    //모델의 바인딩 값 얻기.
    var ls_data = oModel.getProperty("/DATASET");

    var l_f4help = "";
    var l_fldnm = "";

    //라디오 버튼 선택건에 따른 로직분기.
    switch(true){
      case ls_data.RB01: 
        //Database view를 선택한 경우 view 검색 f4 help명.
        l_f4help = "SGENCLP_SRC_DB_VIEW";
        l_fldnm = "VIEWNAME";
        break;

      case ls_data.RB02:
        //Transparent Table를 선택한 경우 table 검색 f4 help명.
        l_f4help = "SGENCLP_SRC_TAB";
        l_fldnm = "TABNAME";
        break;
    }

    //f4 help팝업을 load한경우.
    if(typeof oAPP.fn.callF4HelpPopup !== "undefined"){
      //f4 help 팝업 호출.
      oAPP.fn.callF4HelpPopup(l_f4help, l_f4help, [], [], lf_callback);
      //하위 로직 skip처리를 위한 flag return.
      return true;
    }

    //f4help 팝업을 load하지 못한경우.
    lf_getScript("design/js/callF4HelpPopup",function(){
        //f4 help 팝업 function load 이후 팝업 호출.
        oAPP.fn.callF4HelpPopup(l_f4help, l_f4help, [], [], lf_callback);
    });


  } //object name f4 help 이벤트.




  //라디오 버튼 선택에 따른 이미지 변경 처리.
  function lf_setSearchLayoutImage(oModel){
    
    var l_SCCNT = oModel.getProperty("/DATASET/SCCNT");

    var l_imgsrc = "";

    //테마 선택건 정보.
    var l_them = oModel.getProperty("/DATASET/UITHM");

    //라디오 선택건에 따른 이미지 src 분기.
    switch(l_SCCNT){
      case 0: //1 column
        l_imgsrc = DATASET_IMG_PREFIX + "/" + l_them + "/" + LAYOUT_IMG1;
        break;
      case 1: //2 columns
      l_imgsrc = DATASET_IMG_PREFIX + "/" + l_them + "/" + LAYOUT_IMG2;
        break;
      case 2: //3 columns
      l_imgsrc = DATASET_IMG_PREFIX + "/" + l_them + "/" + LAYOUT_IMG3;
        break;
      case 3: //4 columns
      l_imgsrc = DATASET_IMG_PREFIX + "/" + l_them + "/" + LAYOUT_IMG4;
        break;
    }

    oModel.setProperty("/DATASET/imgsrc", l_imgsrc);

  } //라디오 버튼 선택에 따른 이미지 변경 처리.


  

  //CTS 번호 F4 HELP.
  function lf_RequestF4help(oModel){
    //Request No 팝업 호출.
    oAPP.fn.fnCtsPopupOpener(function(param){
      
      //icon header의 선택건에 따른 모델 구조명 얻기.
      var ls_stru = lf_getStruName(oModel);
      if(!ls_stru){return;}
      
      //return받은 Request No 반영.
      oModel.setProperty(ls_stru + "/REQNR", param.TRKORR);

      //return받은 Request Desc 반영.
      oModel.setProperty(ls_stru + "/REQTX", param.AS4TEXT);

    });

  } //CTS 번호 F4 HELP.




  //icon header의 선택건에 따른 모델 구조명 얻기.
  function lf_getStruName(oModel){

    //icon header의 선택건에 따른 분기.
    switch(oModel.getProperty("/selHKey")){
      case "K01": //일반 app 생성건.
        return "/CREATE";

      case "K02": //dataset app 생성건.
        return "/DATASET";

      default:
        return;
    }

  } //icon header의 선택건에 따른 모델 구조명 얻기.




  //Object Type radio 선택건에 따른 object name desc 구성.
  function lf_setObjectNameDesc(oModel){

    var ls_appl = oModel.getProperty("/DATASET");

    switch(true){
      case ls_appl.RB01:
        //B28  Database View
        oModel.setProperty("/DATASET/OBJNM", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B28", "", "", "", ""));
        break;
      case ls_appl.RB02:
        //B29  Transparent Table
        oModel.setProperty("/DATASET/OBJNM", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B29", "", "", "", ""));
        break;
    }


  } //Object Type radio 선택건에 따른 object name desc 구성.


})();