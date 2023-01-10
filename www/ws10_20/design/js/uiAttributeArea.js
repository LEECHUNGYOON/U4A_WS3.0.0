(function(){
  //우측 페이지(attribute 영역) 구성
  oAPP.fn.uiAttributeArea = function(oRPage){
    
    var oRDynTitle = new sap.f.DynamicPageTitle();
    oRPage.setTitle(oRDynTitle);

    //sap.f.DynamicPage의 header 영역 UI 생성.
    var oRDynHead = new sap.f.DynamicPageHeader({pinnable:true});
    oRPage.setHeader(oRDynHead);

    /************************************************************************
     * ui Info 영역.
     * **********************************************************************
     ************************************************************************/
    //ui info form.
    // var oRFm = new sap.ui.layout.form.Form({editable:true,
    //   layout: new sap.ui.layout.form.ResponsiveGridLayout({labelSpanL:12,labelSpanM:12,columnsL:1})});
    // oRDynHead.addContent(oRFm);

    // //우상단 UI명, UI Description 영역
    // //var oRCtn1 = new sap.ui.layout.form.FormContainer({title:"{/uiinfo/OBJID}"});
    // var oRCtn1 = new sap.ui.layout.form.FormContainer();
    // oRFm.addFormContainer(oRCtn1);

    var oRCTool = new sap.m.Toolbar();
    //oRCtn1.setToolbar(oRCTool);
    oRDynTitle.addExpandedContent(oRCTool);

    //tree 선택 라인의 아이콘 표현.
    var oRAvatar1 = new sap.m.Avatar({src:"{/uiinfo/src}", displayShape:"Square", displaySize:"Custom", customDisplaySize:"20px"});
    oRCTool.addContent(oRAvatar1);
    
    //tree 선택 라인의 UIOBJECT명.
    var oRTitle1 = new sap.m.Title({text:"{/uiinfo/OBJID}", tooltip:"{/uiinfo/OBJID}"});
    oRCTool.addContent(oRTitle1);
    

    oRCTool.addContent(new sap.m.ToolbarSpacer());

    //B15  UI5 library Reference
    //라이브러리명 text.
    var oRLibText = new sap.m.Text({text:"{/uiinfo/UILIB}", visible:"{/uiinfo/vis01}", 
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B15", "", "", "", "")});
    oRCTool.addContent(oRLibText);

    //라이브러리 더블클릭 이벤트.
    oRLibText.attachBrowserEvent("dblclick", function(){
      //라이브러리명 복사 처리.
      oAPP.fn.attrCopyText(this.getText());

    });

    //B16  UI Sample
    //라이브러리 sample 버튼.
    var oRLibBtn2 = new sap.m.Button({icon:"sap-icon://example", visible:"{/uiinfo/vis01}",
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B16", "", "", "", "")});
    oRCTool.addContent(oRLibBtn2);

    //라이브러리 sample 버튼 선택 이벤트.
    oRLibBtn2.attachPress(function(){
      //샘플 팝업 호출.
      oAPP.fn.attrCallUiSample();
    });


    // //UI INFO 영역 접힘/펼침 버튼.
    // var oRLibBtn3 = new sap.m.Button({icon:"sap-icon://collapse-group",tooltip:"Expand/Collapse"});
    // oRCTool.addContent(oRLibBtn3);

    // oRLibBtn3.attachPress(function(){
    //   //UI INFO 영역 접힘/펼침 처리.
    //   switch (oRCtn1.getExpanded()) {
    //     case true:
    //         oRCtn1.setExpanded(false);
    //         oRLibBtn3.setIcon("sap-icon://expand-group");
    //       break;
    //     case false:
    //         oRCtn1.setExpanded(true);
    //         oRLibBtn3.setIcon("sap-icon://collapse-group");
    //         break;
    //     default:
    //       break;
    //   }
    // });

    //dynamic page title의 접힘 영역에 toolbar를 복사하여 추가 처리.
    oRDynTitle.addSnappedContent(oRCTool.clone());

    // var oRElm1 = new sap.ui.layout.form.FormElement({label:new sap.m.Label({text:"Object id",design:"Bold"})});
    // oRCtn1.addFormElement(oRElm1);

    // //OBJID 입력필드
    // var oRInp1 = new sap.m.Input({value:"{/uiinfo/OBJID}",editable:"{/uiinfo/edit01}",
    //   enabled:"{/IS_EDIT}",valueState:"{/uiinfo/OBJID_stat}",valueStateText:"{/uiinfo/OBJID_stxt}",
    //   layoutData:new sap.ui.layout.GridData({span:"XL11 L11 M11 S11"})});
    // oRElm1.addField(oRInp1);

    // //OBJID를 변경 이벤트.
    // oRInp1.attachChange(function(oEvent){
    //   //OBJID 변경건 처리.
    //   oAPP.fn.attrChnageOBJID();

    // }); //OBJID를 변경 이벤트.

    // //OBJID 복사 버튼.
    // var oRBtn0 = new sap.m.Button({icon:"sap-icon://copy", layoutData:new sap.ui.layout.GridData({span:"XL1 L1 M1 S1"})});
    // oRElm1.addField(oRBtn0);

    // //OBJID 복사 버튼 선택 이벤트.
    // oRBtn0.attachPress(function(){
    //   //라이브러리명 복사 처리.
    //   oAPP.fn.attrCopyText(oRInp1.getValue());
    // }); //OBJID 복사 버튼 선택 이벤트.



    // var oRElm2 = new sap.ui.layout.form.FormElement({label:new sap.m.Label({text:"Descriptions",design:"Bold"})});
    // oRCtn1.addFormElement(oRElm2);

    // //Description 입력 TextArea
    // var oRTAr1 = new sap.m.TextArea({width:"100%",rows:4,value:"{/uiinfo/DESC}",editable:"{/uiinfo/edit02}",enabled:"{/IS_EDIT}"});
    // oRElm2.addField(oRTAr1);


    // //Description 변경 이벤트.
    // oRTAr1.attachChange(function(){
    //   //Description 등록처리.
    //   oAPP.fn.setDesc(oRInp1.getValue(), this.getValue());

    //   //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
    //   oAPP.fn.setChangeFlag();

    // }); //Description 변경 이벤트.


    
    var oRGrid = new sap.ui.layout.Grid({defaultSpan:"XL12 L12 M12 S12", vSpacing:0, hSpacing:0.5});
    oRDynHead.addContent(oRGrid);

    oRGrid.addStyleClass("sapUiTinyNegativeMarginBeginEnd");

    //A84  UI Object ID
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84", "", "", "", "");

    oRGrid.addContent(new sap.m.Label({text:l_txt, tooltip:l_txt, design:"Bold"}));

    //OBJID 입력필드
    var oRInp1 = new sap.m.Input({value:"{/uiinfo/OBJID}", tooltip:"{/uiinfo/OBJID}", editable:"{/uiinfo/edit01}",
      enabled:"{/IS_EDIT}", valueState:"{/uiinfo/OBJID_stat}", valueStateText:"{/uiinfo/OBJID_stxt}",
      layoutData:new sap.ui.layout.GridData({span:"XL11 L11 M11 S11"})});
    oRGrid.addContent(oRInp1);

    //OBJID를 변경 이벤트.
    oRInp1.attachChange(function(oEvent){
      //OBJID 변경건 처리.
      oAPP.fn.attrChnageOBJID();

    }); //OBJID를 변경 이벤트.


    //A04  Copy
    //OBJID 복사 버튼.
    var oRBtn0 = new sap.m.Button({icon:"sap-icon://copy", width:"100%",
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04", "", "", "", ""),
      layoutData:new sap.ui.layout.GridData({span:"XL1 L1 M1 S1"})});
    oRGrid.addContent(oRBtn0);

    //OBJID 복사 버튼 선택 이벤트.
    oRBtn0.attachPress(function(){
      //라이브러리명 복사 처리.
      oAPP.fn.attrCopyText(oRInp1.getValue());

    }); //OBJID 복사 버튼 선택 이벤트.

    //A35  Description
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", "");

    oRGrid.addContent(new sap.m.Label({text:l_txt, tooltip:l_txt, design:"Bold"}));

    //Description 입력 TextArea
    var oRTAr1 = new sap.m.TextArea({width:"100%", rows:4, value:"{/uiinfo/DESC}", 
      tooltip:"{/uiinfo/DESC}", editable:"{/uiinfo/edit02}", enabled:"{/IS_EDIT}"});
    oRGrid.addContent(oRTAr1);


    //Description 변경 이벤트.
    oRTAr1.attachChange(function(){
      //Description 등록처리.
      oAPP.fn.setDesc(oRInp1.getValue(), this.getValue());

      //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
      oAPP.fn.setChangeFlag();

    }); //Description 변경 이벤트.


    /************************************************************************
     * attribute table 영역.
     * **********************************************************************
     ************************************************************************/
    //attribute table UI.
    var oRTab1 = new sap.m.Table({mode:"SingleSelectMaster", alternateRowColors:true, sticky:["HeaderToolbar"]});
    oRPage.setContent(oRTab1);
    oAPP.attr.ui.oRTab1 = oRTab1;

    //attribute table의 drop css 제거 처리 기능 추가.
    oAPP.fn.clearDropEffectUI(oRTab1);

    //table 더블클릭 이벤트 처리.
    oAPP.attr.ui.oRTab1.attachBrowserEvent("dblclick", function(oEvent){
      //table의 더블클릭에 따른 이벤트 처리.
      oAPP.fn.attrDblclickEvent(oEvent);

    }); //table 더블클릭 이벤트 처리.


    //context menu ui 생성 function이 존재하는경우.
    if(typeof oAPP.fn.callAttrContextMenu !== "undefined"){
      //context menu ui 생성 처리.
      oAPP.attr.ui.oAttrMenu = oAPP.fn.callAttrContextMenu();

    }else{
      //context menu ui 생성 function이 존재하지 않는경우 script 호출.
      oAPP.fn.getScript("design/js/callAttrContextMenu",function(){
        //context menu ui 생성 처리.
        oAPP.attr.ui.oAttrMenu = oAPP.fn.callAttrContextMenu();
      });

    }


    //attribute context menu 호출 이벤트.
    oRTab1.attachBrowserEvent("contextmenu", function(oEvent){

      //attribute의 context menu 호출전 처리.
      oAPP.fn.attrBeforeContextMenu(oEvent);

    }); //attribute context menu 호출 이벤트.


    //drop UI 생성.
    var oDrop1 = new sap.ui.core.dnd.DropInfo({targetAggregation:"items", enabled:"{/IS_EDIT}"});
    oAPP.attr.ui.oRTab1.addDragDropConfig(oDrop1);

    //drag UI가 다른라인에 올라갔을때 이벤트.
    oDrop1.attachDrop(function(oEvent){
      //attribute에 drag UI가 올라갔을때 이벤트.
      oAPP.fn.attrDrop(oEvent);

    }); //drag UI가 다른라인에 올라갔을때 이벤트.


    //attribute toolbar UI.
    var oRTTool = new sap.m.Toolbar();
    oRTab1.setHeaderToolbar(oRTTool);

    //B17  Reset
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B17", "", "", "", "");

    //attribute 초기화 버튼.
    var oRTBtn1 = new sap.m.Button({text:l_txt, tooltip:l_txt, icon:"sap-icon://reset", 
      type:"Accept", enabled:"{/IS_EDIT}", visible:"{/uiinfo/vis02}"});
    oRTTool.addContent(oRTBtn1);

    oRTBtn1.attachPress(function(){
      //attribute 초기화 처리.
      oAPP.fn.attrResetAttr();
    });


    //attribute명 컬럼.
    //var oRCol1 = new sap.m.Column({width:"30%"});
    var oRCol1 = new sap.m.Column();
    oRTab1.addColumn(oRCol1);

    //attribute입력 컬럼
    var oRCol2 = new sap.m.Column();
    oRTab1.addColumn(oRCol2);

    //attribute 첫번째 아이콘(바인딩, 서버 이벤트)
    var oRCol3 = new sap.m.Column({width:"40px", hAlign:"Center"});
    oRTab1.addColumn(oRCol3);

    //attribute 두번째 아이콘(프로퍼티 help, 클라이언트 이벤트)
    var oRCol4 = new sap.m.Column({width:"40px", hAlign:"Center"});
    oRTab1.addColumn(oRCol4);

    //attribute 출력 List Item.
    var oRListItem1 = new sap.m.ColumnListItem();

    //attribute명.
    var oRObjStat1 = new sap.m.ObjectStatus({text:"{UIATT}", icon:"{UIATT_ICON}"});
    oRListItem1.addCell(oRObjStat1);

    //context menu 호출 위치를 알기위한 custom data 매핑.
    oRObjStat1.addCustomData(new sap.ui.core.CustomData({key:"AT01"}));

    //attribute 입력 hbox
    var oRHbox1 = new sap.m.HBox({width:"100%", direction:"Column", renderType:"Bare", alignItems:"Center"});
    oRListItem1.addCell(oRHbox1);

    //attribute 직접입력 필드
    var oRInp2 = new sap.m.Input({value:"{UIATV}", editable:"{edit}", visible:"{inp_visb}", tooltip:"{UIATV}",
      showValueHelp:"{showF4}", enabled:"{/IS_EDIT}", valueState:"{valst}", valueStateText:"{valtx}"});
    oRHbox1.addItem(oRInp2);

    //attr 입력필드 이벤트.
    oRInp2.attachChange(function(){
      //ATTRIBUTE 입력건에 대한 처리.
      oAPP.fn.attrChange(this.getBindingContext().getProperty(), "INPUT");

    }); //attr 입력필드 이벤트.

    //input f4 help 이벤트
    oRInp2.attachValueHelpRequest(function(oEvent){
      //f4 help 버튼 선택 이벤트.
      oAPP.fn.attrCallValueHelp(oEvent, this.getBindingContext().getProperty());

    }); //input f4 help 이벤트

    //context menu 호출 위치를 알기위한 custom data 매핑.
    oRInp2.addCustomData(new sap.ui.core.CustomData({key:"AT02"}));


    //Attribute DDLB UI
    var oRSel1 = new sap.m.ComboBox({showSecondaryValues:true, width:"100%", selectedKey:"{UIATV}", tooltip:"{UIATV}",
      editable:"{edit}", visible:"{sel_visb}", enabled:"{/IS_EDIT}", tooltip:"{UIATV}", value:"{comboval}",
      valueState:"{valst}", valueStateText:"{valtx}"});

    //DDLB 선택 이벤트.
    oRSel1.attachChange(function(){
      //ATTRIBUTE 입력건에 대한 처리.
      oAPP.fn.attrChange(this.getBindingContext().getProperty(), "DDLB");

    }); //DDLB 선택 이벤트.

    //context menu 호출 위치를 알기위한 custom data 매핑.
    oRSel1.addCustomData(new sap.ui.core.CustomData({key:"AT02"}));


    //DDLB ITEM.
    var oRItm1 = new sap.ui.core.ListItem({key:"{KEY}", text:"{TEXT}", additionalText:"{DESC}"});
    oRSel1.bindAggregation("items", {path:"T_DDLB", template:oRItm1, templateShareable:true});
    oRHbox1.addItem(oRSel1);

    //Attribute Button UI
    var oRBtn1 = new sap.m.Button({icon:"sap-icon://popup-window", width:"100%", type:"Attention", text:"{UIATV}",visible:"{btn_visb}"});
    oRHbox1.addItem(oRBtn1);

    //버튼 선택 이벤트.
    oRBtn1.attachPress(function(oEvent){
      //attribute 입력건에 대한 처리.
      oAPP.fn.attrChange(this.getBindingContext().getProperty(), "BUTTON");

    }); //버튼 선택 이벤트.


    //Attribute checkbox UI
    var oRChk1 = new sap.m.CheckBox({selected:"{UIATV_c}", editable:"{edit}", visible:"{chk_visb}",
      enabled:"{/IS_EDIT}", valueState:"{valst}"});
    oRHbox1.addItem(oRChk1);

    //체크박스 선택 이벤트
    oRChk1.attachSelect(function(){
      //attribute 입력건에 대한 처리.
      oAPP.fn.attrChange(this.getBindingContext().getProperty(), "CHECK");

    }); //체크박스 선택 이벤트


    //바인딩(서버 이벤트) 아이콘
    var oRIcon1 = new sap.ui.core.Icon({src:"{icon1_src}", color:"{icon1_color}", visible:"{icon1_visb}", tooltip:"{icon1_ttip}"});
    oRListItem1.addCell(oRIcon1);

    //바인딩(서버 이벤트) 아이콘 선택 이벤트
    oRIcon1.attachPress(function(oEvent){
      //바인딩 팝업, 서버이벤트 팝업 호출 등에 대한 처리.
      oAPP.fn.attrIcon1Proc(this.getBindingContext().getProperty());

    }); //바인딩(서버 이벤트) 아이콘 선택 이벤트
    
    //context menu 호출 위치를 알기위한 custom data 매핑.
    oRIcon1.addCustomData(new sap.ui.core.CustomData({key:"AT03"}));

    //help(script 이벤트) 아이콘
    var oRIcon2 = new sap.ui.core.Icon({src:"{icon2_src}", color:"{icon2_color}", visible:"{icon2_visb}", tooltip:"{icon2_ttip}"});
    oRListItem1.addCell(oRIcon2);

    oRIcon2.addStyleClass("sapUiLargeMarginEnd");

    //help(script 이벤트) 아이콘 선택 이벤트
    oRIcon2.attachPress(function(oEvent){
      //property Help document, client event icon에 대한 처리.
      oAPP.fn.attrIcon2Proc(this.getBindingContext().getProperty());      

    }); //help(script 이벤트) 아이콘 선택 이벤트

    //context menu 호출 위치를 알기위한 custom data 매핑.
    oRIcon2.addCustomData(new sap.ui.core.CustomData({key:"AT04"}));



    //attribute출력 tab에 바인딩 처리.
    oRTab1.bindAggregation("items", {path:"/T_ATTR", template:oRListItem1});

  };  //우측 페이지(attribute 영역) 구성




  /************************************************************************
   * attribute 입력건에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   * @param {string} uityp - 이벤트 발생 UI의 유형(DDLB, INPUT, CHECK)
   * @param {boolean} bSkipRefresh - 모델 갱신 처리 skip 여부.
   * @param {boolean} bForceUpdate - model.RefResh(true) 처리 여부.
   ************************************************************************/
  oAPP.fn.attrChange = function(is_attr, uityp, bSkipRefresh, bForceUpdate){
    
    //오류 표현 필드 초기화 처리.
    oAPP.fn.attrClearErrorField();

    //document의 attr에 대한 처리.
    if(oAPP.fn.attrDocumentProc(is_attr)){return;}
    
    //autoGrowing 프로퍼티 변경건 예외처리.
    if(oAPP.fn.attrChangeAutoGrowingProp(is_attr)){return;}

    //dropAble 프로퍼티 변경건 예외처리.
    if(oAPP.fn.attrChangeDropAbleProp(is_attr)){return;}


    //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
    oAPP.fn.attrChangeProc(is_attr, uityp, bSkipRefresh, bForceUpdate);

  
  }; //attribute 입력건에 대한 처리.




  /************************************************************************
   * attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   * @param {string} uityp - 이벤트 발생 UI의 유형(DDLB, INPUT, CHECK)
   * @param {boolean} bSkipRefresh - 모델 갱신 처리 skip 여부.
   * @param {boolean} bForceUpdate - model.RefResh(true) 처리 여부.
   ************************************************************************/
  oAPP.fn.attrChangeProc = function(is_attr, uityp, bSkipRefresh, bForceUpdate){

    //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
    oAPP.fn.setChangeFlag();

    //attr 변경처리.
    oAPP.fn.attrChgAttrVal(is_attr, uityp);

    //DDLB 변경 라인 STYLE 처리.
    oAPP.fn.attrSetLineStyle(is_attr);

    //F4 HELP 버튼 활성여부 처리.
    oAPP.fn.attrSetShowValueHelp(is_attr);

    //입력필드 입력 가능여부 처리.
    oAPP.fn.setAttrEditable(is_attr);

    //미리보기 화면의 대상 ui의 프로퍼티 변경처리.
    oAPP.fn.previewUIsetProp(is_attr);

    //모델 갱신처리 SKIP건인경우 EXIT.
    if(bSkipRefresh){return;}

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh(bForceUpdate);

  };  //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.



  /************************************************************************
   * 바인딩팝업, 서버이벤트 호출 icon에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   * @param {string} uityp - 이벤트 발생 UI의 유형(DDLB, INPUT, CHECK)
   ************************************************************************/
  oAPP.fn.attrIcon1Proc = function(is_attr){

    //오류 표현 필드 초기화 처리.
    oAPP.fn.attrClearErrorField(true);

    //appcontainer의 AppID 프로퍼티인경우 f4 help 팝업 호출.
    if(oAPP.fn.attrAppf4Popup(is_attr)){return;}

    //sap.m.Tree, sap.ui.table.TreeTable의 parent, child 프로퍼티 바인딩처리건 점검.
    if(oAPP.fn.attrChkTreeProp(is_attr)){return;}

    //select option2의 F4HelpID 프로퍼티의 팝업 호출 처리.
    if(oAPP.fn.attrSelOption2F4HelpID(is_attr)){return;}

    //select option2의 F4HelpReturnFIeld 프로퍼티의 예외 처리.
    if(oAPP.fn.attrSelOption2F4HelpReturnFIeld(is_attr)){return;}

    //HTML UI의 content 프로퍼티에 바인딩 처리시 점검.
    if(oAPP.fn.attrChkHTMLContent(is_attr, true, oAPP.fn.attrBindProp)){return;}

    //프로퍼티 바인딩 처리건
    if(oAPP.fn.attrBindProp(is_attr)){return;}

    //이벤트 팝업 호출 처리건
    if(oAPP.fn.attrCallEventPopup(is_attr)){return;}

    //aggregation 바인딩 처리건
    if(oAPP.fn.attrBindAggr(is_attr)){return;}

  };  //바인딩팝업, 서버이벤트 호출 icon에 대한 처리.




  //이벤트 생성 아이콘 선택 function.
  oAPP.fn.attrCallEventPopup = function(is_attr){

    //해당 라인이 이벤트 라인이 아닌경우 exit.
    if(is_attr.UIATY !== "2"){return;}

    //현재 이벤트 영역이 편집 불가능하다면 exit.
    if(is_attr.edit !== true){return;}

    //화면이 편집상태가 아닌경우 exit.
    if(oAPP.attr.oModel.oData.IS_EDIT !== true){
      //function 호출처 skip 처리.
      return true;
    }

    //trial 버전인경우 서버이벤트 메소드 생성 금지 처리.
    if(oAPP.fn.fnOnCheckIsTrial()){return;}

    //대상 function이 존재하는경우 호출 처리.
    if(typeof oAPP.fn.createEventPopup !== "undefined"){
      oAPP.fn.createEventPopup(is_attr, oAPP.fn.attrCreateEventCallBack);
      //function 호출처 skip 처리.
      return true;
    }

    //대상 function이 존재하지 않는경우 script 호출.
    oAPP.fn.getScript("design/js/createEventPopup",function(){
      oAPP.fn.createEventPopup(is_attr, oAPP.fn.attrCreateEventCallBack);
    });

    //function 호출처 skip 처리.
    return true;

  };  ////이벤트 생성 아이콘 선택 function.




  //attribute 초기화 기능.
  oAPP.fn.attrResetAttr = function(){

    //112	Resets all properties to their default values.
    var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "112", "", "", "", "") + " \n ";

    //113  The registered value will be lost. Do you want to proceed?
    l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "113", "", "", "", "");

    //초기화전 확인팝업 호출.
    parent.showMessage(sap, 30, "I", l_msg, function(param){

      //YES를 선택하지 않은경우 EXIT.
      if(param !== "YES"){return;}

      //현재 ATTRIBUTE 항목중 PROPERTY 항목에 대해 직접 입력하여 값을 변경했다면, DEFAULT 값으로 초기화 처리.
      for(var i=0, l=oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){

        //프로퍼티가 아닌경우 skip.
        if(oAPP.attr.oModel.oData.T_ATTR[i].UIATY !== "1"){continue}

        //바인딩 처리된건인경우 skip.
        if(oAPP.attr.oModel.oData.T_ATTR[i].ISBND === "X"){continue;}

        var l_UIATK = oAPP.attr.oModel.oData.T_ATTR[i].UIATK;

        //직접 입력 가능한 attribute 여부확인(AT000002650_1 형식으로 구성됨)
        if(l_UIATK.indexOf("_") !== -1){
          //_1 부분 제거.
          l_UIATK = l_UIATK.substr(0, l_UIATK.indexOf("_"));
        }

        //현재 attribute 정보 검색.
        var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_UIATK );
        if(!ls_0023){continue;}

        //직접 입력 가능한 AGGREGATION인경우 값을 입력했다면.
        if(ls_0023.ISSTR === "X" && oAPP.attr.oModel.oData.T_ATTR[i].UIATV !== ""){
          //입력값 초기화.
          oAPP.attr.oModel.oData.T_ATTR[i].UIATV = "";

          //attribute 변경건 처리.
          oAPP.fn.attrChangeProc(oAPP.attr.oModel.oData.T_ATTR[i], "", true);

          continue;
        }

        //현재 attribute값과 default값이 같다면 skip.
        if(oAPP.attr.oModel.oData.T_ATTR[i].UIATV === ls_0023.DEFVL){continue;}

        //attribute의 값을 변경한 경우 default 값으로 변환 처리.
        oAPP.attr.oModel.oData.T_ATTR[i].UIATV = ls_0023.DEFVL;

        //attribute 변경건 처리.
        oAPP.fn.attrChangeProc(oAPP.attr.oModel.oData.T_ATTR[i], "", true);

      }

      //모델 갱신 처리.
      oAPP.attr.oModel.refresh(true);

    });


  };  //attribute 초기화 기능.




  //attribute의 context menu 호출전 처리.
  oAPP.fn.attrBeforeContextMenu = function(oEvent){

    //편집모드가 아닌경우 EXIT.
    if(oAPP.attr.oModel.oData.IS_EDIT !== true){
      return;
    }

    //이벤트 발생 dom에 해당하는 UI정보 얻기.
    var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

    //UI정보를 얻지 못한 경우 exit.
    if(!l_ui){return;}

    //해당 UI의 바인딩 정보 얻기.
    var l_ctxt = l_ui.getBindingContext();

    //바인딩 정보를 얻지 못한 경우 exit.
    if(!l_ctxt){return;}

    var ls_attr = l_ctxt.getProperty();

    //DOCUMENT에서 CONTEXT MENU를 호출한 경우 EXIT.
    if(ls_attr.OBJID === "ROOT"){return;}

    //custom data 설정건 정보 얻기.
    var lt_cdata = l_ui.getCustomData();

    //cusom data 설정건 정보가 존재하지 않는경우 exit.
    if(lt_cdata.length === 0){return;}


    //메뉴 호출전 메뉴 활성여부 설정.
    if(oAPP.fn.attrSetContextMenu(oAPP.attr.ui.oAttrMenu, ls_attr, lt_cdata[0].getKey()) === true){
      return; 
    }


    //메뉴 호출 처리.
    oAPP.attr.ui.oAttrMenu.openBy(oEvent.target);


  };  //attribute의 context menu 호출전 처리.


  //프로퍼티 바인딩 팝업 호출 처리 function.
  oAPP.fn.attrBindProp = function(is_attr){

    //프로퍼티에서 바인딩 처리 호출한게 아닌경우 exit.
    if(is_attr.UIATY !== "1"){return;}

    //trial 인경우 exit.
    if(oAPP.fn.fnOnCheckIsTrial()){return;}

    //B18  Data Binding / Unbinding
    var l_title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B18", "", "", "", "") + " - ";

    //A52  Property
    l_title += oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A52", "", "", "", "") + " : " + is_attr.UIATT;

    var l_CARDI = "F";

    //SELECT OPTION2의 VALUE에 바인딩처리 하는경우.
    if(is_attr.UIATK === "EXT00001161"){
      //RANGE TABLE만 바인딩 가능 FLAG 처리.
      l_CARDI = "R";
    }

    //프로퍼티가 ARRAY로 입력 가능한 경우, 프로퍼티 타입이 숫자 유형이 아니면.
    if(is_attr.ISMLB === "X" && (is_attr.UIADT !== "int" && is_attr.UIADT !== "float")){
      //STRING_TABLE 바인딩 가능 FLAG 처리.
      l_CARDI = "ST";
    }

    //대상 function이 존재하는경우 호출 처리.
    if(typeof oAPP.fn.callBindPopup !== "undefined"){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBackProp, is_attr.UIATK);
      //function 호출처 skip 처리.
      return true;
    }

    //대상 function이 존재하지 않는경우 script 호출.
    oAPP.fn.getScript("design/js/callBindPopup",function(){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBackProp, is_attr.UIATK);
    });

    //function 호출처 skip 처리.
    return true;

  };  //프로퍼티 바인딩 팝업 호출 처리 function.




  //aggregation 바인딩 팝업 호출 처리 function.
  oAPP.fn.attrBindAggr = function(is_attr){

    //aggregation에서 바인딩 처리 호출한게 아닌경우 exit.
    if(is_attr.UIATY !== "3"){return;}

    //trial 인경우 exit.
    if(oAPP.fn.fnOnCheckIsTrial()){return;}

    //aggregation 바인딩 처리 가능여부 점검.
    if(oAPP.fn.attrChkBindAggrPossible(is_attr)){return;}

    //B18  Data Binding / Unbinding
    var l_title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B18", "", "", "", "") + " - ";

    //B19  Aggregation
    l_title += oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B19", "", "", "", "") + " : " + is_attr.UIATT;

    var l_CARDI = "T";

    //대상 function이 존재하는경우 호출 처리.
    if(typeof oAPP.fn.callBindPopup !== "undefined"){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBackAggr, is_attr.UIATK);
      //function 호출처 skip 처리.
      return true;
    }

    //대상 function이 존재하지 않는경우 script 호출.
    oAPP.fn.getScript("design/js/callBindPopup",function(){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBackAggr, is_attr.UIATK);
    });

    //function 호출처 skip 처리.
    return true;

  };  //aggregation 바인딩 팝업 호출 처리 function.

  


  /************************************************************************
   * property Help document, client event icon에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   * @param {string} uityp - 이벤트 발생 UI의 유형(DDLB, INPUT, CHECK)
   ************************************************************************/
   oAPP.fn.attrIcon2Proc = function(is_attr){

    //오류 표현 필드 초기화 처리.
    oAPP.fn.attrClearErrorField(true);

    //선택한 라인이 이벤트인경우.
    if(oAPP.fn.attrClientEventPopup(is_attr)){return;}

    //sap.ui.core.HTML UI의 content 프로퍼티의 icon선택시 HTML source 팝업 호출.
    if(oAPP.fn.attrChkHTMLContent(is_attr, false, oAPP.fn.attrHTMLConentPopup)){return;}

    //select option2 UI의 예외처리.
    if(oAPP.fn.attrSelOption2F4HelpIDDel(is_attr)){return;}
    
    //u4a.m.UsageArea의 AppID프로퍼티 삭제 예외처리.
    if(oAPP.fn.attrAppF4Del(is_attr)){return;}

    //property help DOCUMENT 팝업 호출.
    if(oAPP.fn.attrPropHelpPopup(is_attr)){return;}


  };  //property Help document, client event icon에 대한 처리.



  
  /************************************************************************
   * document의 attr에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   * @return {boolean} function 호출처의 하위 로직skip을 위한 flag(true = skip)
   ************************************************************************/
  oAPP.fn.attrDocumentProc = function(is_attr){

    //입력 attribute key에따른 로직 분기.
    switch(is_attr.UIATK){
      case "DH001022":
        //CSS Link Add 팝업 호출.
        oAPP.fn.fnCssJsLinkAddPopupOpener("CSS");

        //function 호출처 skip을위한 flag 처리.
        return true;

      case "DH001023":
        //JS Link Add 팝업 호출.
        oAPP.fn.fnCssJsLinkAddPopupOpener("JS");

        //function 호출처 skip을위한 flag 처리.
        return true;

      case "DH001026":
        //Web Security Settings 팝업 호출.
        oAPP.fn.fnWebSecurityPopupOpener();

        //function 호출처 skip을위한 flag 처리.
        return true;

      case "DH001021":
        //DDLB 선택건이 DOCUMENT의 UI Theme를 변경한건인경우.

        //미리보기 테마 변경처리.
        oAPP.attr.ui.frame.contentWindow.setPreviewUiTheme(is_attr.UIATV);

        //function 호출처 skip 처리 안함.
        return;
      
      default:
        return;

    } //입력 attribute key에따른 로직 분기.

  };  //document 영역의 팝업 호출 처리건 수행.




  /************************************************************************
   * attribute table의 더블클릭에 따른 이벤트 처리.
   * **********************************************************************
   * @param {object} oEvent - dblclick 이벤트 발생시 파라메터.
   ************************************************************************/
  oAPP.fn.attrDblclickEvent = function(oEvent){

    //더블클릭 이벤트 발생 위치의 UI정보 얻기.
    var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

    //UI INSTANCE를 얻지 못한 경우 EXIT.
    if(!l_ui){return;}

    //바인딩 정보 얻기.
    var l_ctxt = l_ui.getBindingContext();

    //바인딩 정보를 얻지 못한 경우 exit.
    if(!l_ctxt){return;}

    //이벤트 발생 라인의 attribute 정보 얻기.
    var ls_attr = l_ctxt.getProperty();

    //style class 더블클릭 처리.
    if(oAPP.fn.attrDblClickStyleClass(ls_attr)){return;}

    //바인딩필드 더블클릭 처리.
    if(oAPP.fn.attrDblClickBindField(ls_attr)){return;}

    //서버이벤트 더블클릭 처리.
    if(oAPP.fn.attrDblClickServerEvent(ls_attr)){return;}


  };  //attribute table의 더블클릭에 따른 이벤트 처리.



  //style class 더블클릭 처리.
  oAPP.fn.attrDblClickStyleClass = function(is_attr){
    
    //프로퍼티가 아닌경우 exit.
    if(is_attr.UIATY !== "1"){return;}

    //styleClass 프로퍼티가 아닌경우 exit.
    if(is_attr.UIASN !== "STYLECLASS"){return;}

    //바인딩 처리가 된경우 EXIT.
    if(is_attr.ISBND === "X"){return;}

    //style class 프로퍼티에 입력값이 존재하지 않는경우 exit.
    if(is_attr.UIATV === ""){return;}

    // 에디터 정보를 담는 구조
    var oEditorInfo = {
        OBJID: is_attr.OBJID + is_attr.UIASN,
        OBJTY: "CS",
        OBJNM: "CSS"
    };

    //style class 호출처리.
    oAPP.fn.fnEditorPopupOpener(oEditorInfo, is_attr.UIATV);

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;


  };  //style class 더블클릭 처리.




  //바인딩필드 더블클릭 처리.
  oAPP.fn.attrDblClickBindField = function(is_attr){

    //바인딩처리가 안된경우, 바인딩 필드가 존재하지 않는경우 exit.
    if(is_attr.ISBND !== "X" || is_attr.UIATV === ""){return;}

    //trial 버전인경우 exit.
    if(oAPP.fn.fnOnCheckIsTrial()){return;}

    //클래스명 서버 전송 데이터에 구성.
    var oFormData = new FormData();
    oFormData.append("CLSID", oAPP.attr.appInfo.CLSID);

    //바인딩 필드명 서버 전송 데이터에 구성.
    oFormData.append("FLD_PATH", is_attr.UIATV);


    //서버에서 해당 바인딩 필드의 위치 정보 얻기.
    sendAjax(oAPP.attr.servNm + "/get_bind_fld_postion", oFormData, function(param){

      //wait 종료 처리.
      parent.setBusy("");

      //서버에서 오류가 발생한 경우.
      if(param.RETCD === "E"){
        //오류 메시지 출력.
        parent.showMessage(sap, 20, "E", param.RTMSG);
        return;
      }

      //해당 파라메터를 갖고 서버 호출 펑션 수행 해야함.
      console.log(param.PROGNM, param.LINE);


    }); //서버에서 해당 바인딩 필드의 위치 정보 얻기.


    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //바인딩필드 더블클릭 처리.




  //서버이벤트 더블클릭 처리.
  oAPP.fn.attrDblClickServerEvent = function(is_attr){

    //이벤트가 아닌경우 EXIT.
    if(is_attr.UIATY !== "2"){return;}

    //입력한 서버이벤트가 존재하지 않는경우 EXIT.
    if(is_attr.UIATV === ""){return;}

    //trial 버전인경우 exit.
    if(oAPP.fn.fnOnCheckIsTrial()){return;}

    //해당 이벤트로 네비게이션 처리.
    oAPP.common.execControllerClass(is_attr.UIATV);


  };  //서버이벤트 더블클릭 처리.


  /************************************************************************
   * autoGrowing 프로퍼티 변경건에 대한 예외처리.
   * **********************************************************************
   * @param {object} is_attr - 이벤트 발생한 attribute의 라인 정보.
   * @return {boolean} autoGrowing프로퍼티 변경건인경우 function 호출처의
   * 하위로직 skip을 위한 true값 return.
   ************************************************************************/
  oAPP.fn.attrChangeAutoGrowingProp = function(is_attr){

    //autoGrowing 프로퍼티 변경건이 아닌경우 EXIT.
    if(is_attr.UIATK !== "EXT00001347" && //sap.ui.table.Table
       is_attr.UIATK !== "EXT00001348" && //sap.m.Table
       is_attr.UIATK !== "EXT00001349"){  //sap.m.List
      return;
    }

    //바인딩 처리된경우 exit.(바인딩 처리는 안되지만 점검함.)
    if(is_attr.ISBND === "X"){return;}

    //autoGrowing을 true로 설정하지 않은경우 exit.
    if(is_attr.UIATV !== "true"){
      //autoGrowing 프로퍼티 값에 따른 예외처리.
      oAPP.fn.attrSetAutoGrowingException(is_attr, true);
      return;
    }


    //283	autoGrowing을 설정할 경우 이전에 설정한 서버이벤트 및 클라이언트 이벤트가 초기화 됩니다. 진행하시겠습니까?
    //autoGrowing을 true로 설정한 경우 확인 팝업 호출.
    parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "283", "", "", "", ""), function(param){

      //질문 팝업에서 YES를 누르지 않은경우(취소한경우)
      if(param !== "YES"){

        //default false 처리.
        is_attr.UIATV = "false";

        //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
        oAPP.fn.attrChangeProc(is_attr, "DDLB");

        return;

      }

      //autoGrowing 프로퍼티 값에 따른 예외처리.
      oAPP.fn.attrSetAutoGrowingException(is_attr, true, true);

      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr, "DDLB");

    }); //autoGrowing을 true로 설정한 경우 확인 팝업 호출.
    

    //function 사용처의 하위로직 skip을 위한 flag return.
    return true;

  };  //autoGrowing 프로퍼티 변경건에 대한 예외처리.




  /************************************************************************
   * dropAble 프로퍼티 변경건에 대한 예외처리.
   * **********************************************************************
   * @param {object} is_attr - 이벤트 발생한 attribute의 라인 정보.
   * @return {boolean} dropAble프로퍼티 변경건인경우 function 호출처의
   * 하위로직 skip을 위한 true값 return.
   ************************************************************************/
   oAPP.fn.attrChangeDropAbleProp = function(is_attr){

    //dropAble 프로퍼티 변경건이 아닌경우 EXIT.
    if(is_attr.UIASN !== "DROPABLE"){
      return;
    }

    oAPP.fn.attrSetDropAbleException(is_attr, true, true);
    return true;
  };




  /************************************************************************
   * autoGrowing 프로퍼티 값에 따른 예외처리.
   * **********************************************************************
   * @param {object} is_attr - attribute의 라인 정보.
   * @param {boolean} bModelRefresh - 모델 갱신 여부(true : 갱신 처리)
   * @param {boolean} bClear - 대상 이벤트 초기화 여부(true : 초기화함)
   ************************************************************************/
  oAPP.fn.attrSetAutoGrowingException = function(is_attr, bModelRefresh, bClear){

    //입력 ATTRIBUTE 라인 정보가 없는경우.
    if(!is_attr){
      
      //현재 ATTRIBUTE에 출력된 UI정보를 기준으로 autoGrowing 판단 대상건 여부 확인.
      switch (oAPP.attr.oModel.oData.uiinfo.UIOBK) {
        case "UO00326": //sap.m.List
          is_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === "EXT00001349" );
          break;

        case "UO00447": //sap.m.Table
          is_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === "EXT00001348" );
          break;

        case "UO01139": //sap.ui.table.Table
          is_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === "EXT00001347" );
          break;
      
        default:
          //autoGrowing처리 대상 UI가 아닌경우 EXIT.
          return;
      }
    }

    //autoGrowing attribute를 찾지 못한 경우 exit.
    if(!is_attr){return;}

    var lt_UIATK = [];

    //autoGrowing 프로퍼티 KEY에 따른 점검대상 ATTR의 key정보 구성.
    switch(is_attr.UIATK){
      case "EXT00001347": //sap.ui.table.Table의 autoGrowing.        
        //firstVisibleRowChanged
        lt_UIATK = ["AT000013085"];
        break;

      case "EXT00001348": //sap.m.Table의 autoGrowing.
        //growingStarted, growingFinished, updateStarted, updateFinished
        lt_UIATK = ["AT000005916", "AT000005917", "AT000005918", "AT000005919"];
        break;

      case "EXT00001349": //sap.m.List의 autoGrowing.
        //growingStarted, growingFinished, updateStarted, updateFinished
        lt_UIATK = ["AT000003866", "AT000003867", "AT000003868", "AT000003869"];
        break;

      default:
        //autoGrowing이 아닌경우 exit.
        return;

    }
    
    //default 입력 가능 처리.
    var l_edit = true;

    //autoGrowing값이 true인경우.
    if(is_attr.UIATV === "true"){
      //입력 불가 처리.
      l_edit = false;
    }

    //점검대상 event 항목에 대한 처리.
    for(var i=0, l=lt_UIATK.length; i<l; i++){
      //대상 이벤트 검색.
      var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === lt_UIATK[i] );

      //대상 이벤트를 찾지못한 경우 skip.
      if(typeof ls_attr === "undefined"){continue;}

      //입력 불가 처리.
      ls_attr.edit = l_edit;

      //서버이벤트 아이콘 비활성 처리.
      ls_attr.icon1_visb = l_edit;

      //클라이언트 이벤트 아이콘 비활성 처리.
      ls_attr.icon2_visb = l_edit;

      //초기화 처리가 아닌경우 skip.
      if(bClear !== true){continue}

      //서버이벤트 입력건 초기화.
      ls_attr.UIATV = "";

      //클라이언트 이벤트 SOURCE TYPE 초기화.
      ls_attr.ADDSC = "";
      
      //UI에 수집되어있는 해당 이벤트 삭제.
      oAPP.fn.attrDelClientEvent(ls_attr, "JS");

      //클라이언트 수집건 여부 확인 후 삭제.
      oAPP.fn.attrChgAttrVal(ls_attr, "DDLB");

      //해당 라인의 style 처리.
      oAPP.fn.attrSetLineStyle(ls_attr);

    } //점검대상 event 항목에 대한 처리.


    //모델 갱신처리 flag가 없는경우 exit.
    if(!bModelRefresh){return;}

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh();


  };  //autoGrowing 프로퍼티 값에 따른 예외처리.




  /************************************************************************
   * 클라이언트 이벤트 삭제 처리.
   * **********************************************************************
   * @param {object} is_attr - 이벤트 발생한 attribute의 라인 정보.
   ************************************************************************/
  oAPP.fn.attrDelClientEvent = function(is_attr, OBJTY){

    //수집된 클라이언트 이벤트가 존재하지 않는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    //클라이언트 이벤트 존재여부 확인.
    var l_index = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === OBJTY );

    //클라이언트 이벤트가 존재하지 않는경우 EXIT.
    if(l_index === -1){return;}
    
    //클라이언트 이벤트 존재시 해당 라인 삭제 처리.
    oAPP.DATA.APPDATA.T_CEVT.splice(l_index, 1);

  };  //클라이언트 이벤트 삭제 처리.




  /************************************************************************
   * dropAble 프로퍼티 입력건에 따른 예외처리.
   * **********************************************************************
   * @param {object} is_attr - attribute의 라인 정보.
   ************************************************************************/
  oAPP.fn.attrSetDropAbleException = function(is_attr, bModelRefresh, bClear){

    //입력 파라메터가 존재하지 않는경우.
    if(typeof is_attr === "undefined"){
      //현재 attr 리스트에서 dropAble 프로퍼티 검색.
      is_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIASN === "DROPABLE" );

    }

    //attr 파라메터가 존재하지 않는경우 exit.
    if(typeof is_attr === "undefined"){return;}

    //dropAble 프로퍼티 변경건이 아닌경우 exit.
    if(is_attr.UIASN !== "DROPABLE"){return;}

    //default 변경 변경 가능 처리.
    var l_edit = true;

    //dropAble의 값이 false인경우 drop 이벤트 입력 불가 처리.
    if(is_attr.UIATV === "false"){
      l_edit = false;
    }

    //초기화 flag가 입력된 경우.
    if(bClear){
      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr, "DDLB", true);

    }

    //drop 이벤트 라인 찾기.
    var ls_drop = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIASN === "DNDDROP" );

    if(!ls_drop){return;}

    //drop 이벤트 edit 가능여부 처리.
    ls_drop.edit = l_edit;

    //기존 이벤트 입력건 초기화 여부 FLAG가 존재하는경우, 입력 불가시.
    if(bClear === true && l_edit === false){

      //입력된 이벤트 초기화 처리.
      ls_drop.UIATV = "";

      //클라이언트 이벤트 SOURCE TYPE 초기화.
      ls_drop.ADDSC = "";

      //drop의 클라이언트 이벤트 삭제 처리.
      oAPP.fn.attrDelClientEvent(ls_drop, "JS");

      //클라이언트 수집건 여부 확인 후 삭제.
      oAPP.fn.attrChgAttrVal(ls_drop, "DDLB");

      //해당 라인의 style 처리.
      oAPP.fn.attrSetLineStyle(ls_drop);

      
    } //기존 이벤트 입력건 초기화 여부 FLAG가 존재하는경우, 입력 불가시.


    //모델 갱신 FLAG가 입력된 경우.
    if(bModelRefresh){
      oAPP.attr.oModel.refresh(true);
    }

    //해당 FUNCTION 호출처의 하위 로직 SKIP을 위한 FLAG RETURN.
    return true;

  };  //dropAble 프로퍼티 입력건에 따른 예외처리.




  /************************************************************************
   * 입력받은 attr 라인의 모델 갱신 처리.
   * **********************************************************************
   * @param {object} is_attr - 이벤트 발생한 attribute의 라인 정보.
   ************************************************************************/
  oAPP.fn.attrUpdateLine = function(is_attr){
    
    //입력받은 attribute 항목을 model에서 검색.
    var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a=> a.UIATK === is_attr.UIATK );

    //찾지못한 경우 exit.
    if(typeof ls_attr === "undefined"){return;}

    //찾은경우 입력받은 attr을 모델의 해당 라인에 매핑.
    oAPP.fn.moveCorresponding(is_attr, ls_attr);

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh();

  };  //입력받은 attr 라인의 모델 갱신 처리.




  //sap.ui.core.HTML UI의 content 프로퍼티에서 바인딩, editor 호출전 점검.
  oAPP.fn.attrChkHTMLContent = function(is_attr, bFlag, fnCallback){

    //HTML UI의 content 프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "AT000011858"){return;}

    var l_chk = false, l_msg = "";

    //바인딩 팝업전 호출한 경우.
    if(bFlag === true){

      //UI명 + 프로퍼티명으로 OBJID 구성.
      var l_objid = is_attr.OBJID + is_attr.UIASN;

      //HTML editor 입력건 존재여부 확인.
      l_chk = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJTY === "HM" && a.OBJID === l_objid) !== -1 ? true : false;
      
      //284	HTML Editor에 입력한 정보가 존재합니다. 바인딩 처리를 진행하시겠습니까?
      l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "284", "", "", "", "");
      

    //HTML editor 팝업전 호출한 경우.
    }else if(bFlag === false){

      //바인딩건이 존재하는경우.
      if(is_attr.ISBND === "X" && is_attr.UIATV !== ""){
        l_chk = true;
      }

      //285	바인딩 정보가 존재합니다. HTML Source 입력처리를 진행하시겠습니까?
      l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "285", "", "", "", "");

    }

    //확인 불필요상태면 입력 function 호출 후 exit.
    if(l_chk !== true){

      fnCallback(is_attr);

      //function 호출처 skip을 위한 flag return.
      return true;
    }

    //확인이 필요한경우 메시지 팝업 호출.
    parent.showMessage(sap, 30, "I", l_msg, function(param){
      if(param !== "YES"){return;}

      fnCallback(is_attr);

    });

    //function 호출처 skip을 위한 flag return.
    return true;


  };  //sap.ui.core.HTML UI의 content 프로퍼티에서 바인딩, editor 호출전 점검.




  //sap.ui.core.HTML UI의 content 프로퍼티의 icon선택시 HTML source 팝업 호출.
  oAPP.fn.attrHTMLConentPopup = function(is_attr){

    //HTML UI의 content 프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "AT000011858"){return;}

    //UI명 + 프로퍼티명으로 OBJID 구성.
    var l_objid = is_attr.OBJID + is_attr.UIASN;

    //현재 display 상태인경우.
    if(oAPP.attr.oModel.oData.IS_EDIT === false){
      //content에 입력한 HTML이 존재하는지 확인.
      if(oAPP.DATA.APPDATA.T_CEVT.findIndex( a=> a.OBJID === l_objid && a.OBJTY === "HM" ) === -1){
        //존재하지 않는경우 exit.
        return true;
      }

    }

    //클라이언트 스크립트 호출 FUNCTION 호출.
    oAPP.fn.fnClientEditorPopupOpener("HM", l_objid, function(param){

      //값을 삭제한 경우.
      if(param === ""){
        //입력값 초기화 처리.
        is_attr.UIATV = "";
        is_attr.ADDSC = "";

        //ATTR 변경처리.
        oAPP.fn.attrChangeProc(is_attr, "INPUT");
        return;

      }

      //값을 입력한 경우.
      if(param === "X"){
        
        //입력한 HTML CONTENT 정보 검색.
        var l_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === l_objid && a.OBJTY === "HM" );

        is_attr.UIATV = l_cevt.DATA.substr(0,30) + "..";

        //HTML content 추가됨 flag 구성.
        is_attr.ADDSC = "HM";
        is_attr.MPROP = "";
        is_attr.ISBND = "";

        //ATTR 변경처리.
        oAPP.fn.attrChangeProc(is_attr, "INPUT");
        return;

      }

    }); //클라이언트 스크립트 호출 FUNCTION 호출.


    //function 사용처의 하위로직 skip을 위한 flag return.
    return true;

  };  //sap.ui.core.HTML UI의 content 프로퍼티의 icon선택시 HTML source 팝업 호출.




  //property help DOCUMENT 팝업 호출.
  oAPP.fn.attrPropHelpPopup = function(is_attr){

    //선택한 라인이 프로퍼티건이 아닌경우 EXIT.
    if(is_attr.UIATY !== "1"){return;}

    //UI5 bootstrap 라이브러리 관리 정보(MIME PATH) 얻기.
    var ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" &&
      a.FLD01 === "APP" && a.FLD06 === "X" );

    if(typeof ls_ua025 === "undefined"){return;}

    //version.
    var l_url = "/ZU4A_ACS/U4A_API_DOCUMENT?VER=" + ls_ua025.FLD07;

    //ATTRIBUTE의 UI DESIGN 영역 정보 얻기.
    var ls_tree = oAPP.fn.getTreeData(is_attr.OBJID);
    if(typeof ls_tree === "undefined"){return;}

    //UI 라이브러리 명, PROPERTY 구분, 프로퍼티명, UI OBJECT KEY
    l_url = l_url + "&CLSNM=" + ls_tree.UILIB + "&GUBUN=1&PROPID=" + is_attr.UIATT + "&UIOBK=" + is_attr.UIOBK;

    //HELP 팝업 호출.
    fn_PropHelpPopup(l_url);

    //function 사용처의 하위로직 skip을 위한 flag return.
    return true;

  };  //property help DOCUMENT 팝업 호출.


  //client event popup 호출처리.
  oAPP.fn.attrClientEventPopup = function(is_attr){

    //이벤트건이 아닌경우 exit.
    if(is_attr.UIATY !== "2"){return;}

    //현재 편집 가능 상태인경우.
    if(oAPP.attr.oModel.oData.IS_EDIT === true){
      //현재 이벤트 영역이 편집 불가능하다면 exit.
      if(is_attr.edit !== true){return true;}
    }

    //OBJID + 이벤트명 대문자 로 client이벤트 script ID 구성.
    var l_objid = is_attr.OBJID + is_attr.UIASN;

    //현재 display 상태인경우.
    if(oAPP.attr.oModel.oData.IS_EDIT === false){
      //입력된 클라이언트 이벤트가 존재하는지 확인.
      if(oAPP.DATA.APPDATA.T_CEVT.findIndex( a=> a.OBJID === l_objid && a.OBJTY === "JS" ) === -1){
        //존재하지 않는경우 exit.
        return true;
      }

    }    

    //클라이언트 스크립트 호출 FUNCTION 호출.
    oAPP.fn.fnClientEditorPopupOpener("JS", l_objid,function(param){

      if(param === "X"){
        is_attr.ADDSC = "JS";

      }else if(param === ""){
        is_attr.ADDSC = "";

      }

      //call back 이후 attr 갱신 처리.
      oAPP.fn.attrChangeProc(is_attr, "", false, true);

    });

    //function 사용처의 하위로직 skip을 위한 flag return.
    return true;

  }; //client event popup 호출처리.




  //DOCUMENT의 F4 HELP 호출 처리.
  oAPP.fn.attrCallValueHelpDOC = function(is_attr){
    
    //DOCUMENT에서 f4 help 호출한건이 아닌경우 exit.
    if(is_attr.OBJID !== "ROOT"){return;}

    //f4 help callback 이벤트.
    function lf_returnDOC(param){

        var l_fldnm = "";
        switch(ls_ua003.ITMCD){
          case "DH001040":  //Code Page
            l_fldnm = "CPATTR";
            break;

          case "DH001100":  //Authorization Group
            l_fldnm = "P_GROUP";
            break;

          default:
            return;

        }

        //f4 help에서 선택한 라인의 codepage 정보 매핑.
        is_attr.UIATV = param[l_fldnm];

        //ATTR 변경처리.
        oAPP.fn.attrChangeProc(is_attr, "INPUT");


    }   //f4 help callback 이벤트.



    //코드마스터 DOCUMENT항목의 해당하는 itmcd 정보 얻기.
    var ls_ua003 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA003" && a.ITMCD === is_attr.UIATK );

    //가능엔트리 항목이 존재하지 않는경우 EXIT.
    if(!ls_ua003 || ls_ua003.FLD05 === ""){
      return;
    }

    var l_func;

    //edit 상태인경우 callback function 매핑.
    if(oAPP.attr.oModel.oData.IS_EDIT === true){
      l_func = lf_returnDOC;
    }

    //f4 help팝업을 load한경우.
    if(typeof oAPP.fn.callF4HelpPopup !== "undefined"){
      //f4 help 팝업 호출.
      oAPP.fn.callF4HelpPopup(ls_ua003.FLD05, ls_ua003.FLD05, [], [], l_func);
      //하위 로직 skip처리를 위한 flag return.
      return true;
    }

    //f4help 팝업을 load하지 못한경우.
    oAPP.fn.getScript("design/js/callF4HelpPopup",function(){
        //f4 help 팝업 function load 이후 팝업 호출.
        oAPP.fn.callF4HelpPopup(ls_ua003.FLD05, ls_ua003.FLD05, [], [], l_func);
    });

    //하위 로직 skip처리를 위한 flag return.
    return true;

  };  //DOCUMENT의 F4 HELP 호출 처리.




  //color popup f4 help 호출 처리.
  oAPP.fn.attrCallValueHelpColor = function(oEvent, is_attr){

    //프로퍼티가 아닌경우, 바인딩처리한경우 exit.
    if(is_attr.UIATY !== "1" || is_attr.ISBND === "X"){return;}

    //enum정보가 구성된경우 exit.
    if(typeof is_attr.T_DDLB !== "undefined" && is_attr.T_DDLB.length !== 0){return;}

    //현재 프로퍼티가 color 관련 프로퍼티가 아닌경우 exit.
    if(oAPP.fn.attrIsColorProp(is_attr) !== true){
      return;
    }

    jQuery.sap.require("sap.ui.unified.ColorPickerPopover");

    //color picker 팝업 UI생성.
    var oColPic = new sap.ui.unified.ColorPickerPopover();

    //팝업에서 색상 선택 이벤트.
    oColPic.attachChange(function(oEvent){

      //선택 색상 매핑.
      is_attr.UIATV = oEvent.getParameter("hex");

      //ATTR 변경처리.
      oAPP.fn.attrChangeProc(is_attr, "INPUT");

    });

    //f4 help선택 위치에 color picker 팝업 open처리.
    oColPic.openBy(oEvent.oSource);

    //이전에 선택한 색상 코드가 존재하는경우 팝업에 마킹 처리.
    if(is_attr.UIATV !== ""){
      oColPic.setColorString(is_attr.UIATV);
    }

    //하위 로직 skip처리를 위한 flag return.
    return true;

  };  //color popup f4 help 호출 처리.




  //icon 선택처리 팝업 호출.
  oAPP.fn.attrCallValueHelpIcon = function(is_attr){

    //icon popup의 callback function.
    function lf_callback(sIcon){
      //전달받은 아이콘명이 존재하지 않는경우 exit.
      if(typeof sIcon === "undefined" || sIcon === null || sIcon === ""){return;}

      //아이콘 매핑.
      is_attr.UIATV = sIcon;

      //ATTR 변경처리.
      oAPP.fn.attrChangeProc(is_attr, "INPUT");


    } //icon popup의 callback function.

    

    //프로퍼티가 아닌경우, 바인딩처리한경우 exit.
    if(is_attr.UIATY !== "1" || is_attr.ISBND === "X"){return;}

    //DDLB 출력 대상 라인인경우 EXIT.
    if(is_attr.ISLST === "X"){return;}

    //enum정보가 구성된경우 exit.
    if(typeof is_attr.T_DDLB !== "undefined" && is_attr.T_DDLB.length !== 0){return;}

    //현재 프로퍼티가 icon 관련 프로퍼티가 아닌 경우exit.
    if(oAPP.fn.attrIsIconProp(is_attr) !== true){
      return;
    }

    //icon list popup function이 존재하는 경우.
    if(typeof oAPP.fn.callIconListPopup !== "undefined"){
      //icon list popup 호출.
      oAPP.fn.callIconListPopup(is_attr.UIATT, lf_callback);
      //하위 로직 skip처리를 위한 flag return.
      return true;
    }

    //icon list popup function이 존재하지 않는 경우.
    oAPP.fn.getScript("design/js/callIconListPopup",function(){
        //icon list popup function load 이후 팝업 호출.
        oAPP.fn.callIconListPopup(is_attr.UIATT, lf_callback);
    });


    //하위 로직 skip처리를 위한 flag return.
    return true;


  };  //icon 선택처리 팝업 호출.




  //프로퍼티 f4 help 호출 처리.
  oAPP.fn.attrCallValueHelp = function(oEvent, is_attr){

    //오류 표현 필드 초기화 처리.
    oAPP.fn.attrClearErrorField(true);

    //DOCUMENT의 f4 help 호출건인경우 하위 로직 skip.
    if(oAPP.fn.attrCallValueHelpDOC(is_attr)){return;}
  
    //color popup f4 help 호출 처리.
    if(oAPP.fn.attrCallValueHelpColor(oEvent, is_attr)){return;}

    //icon popup 호출 처리.
    if(oAPP.fn.attrCallValueHelpIcon(is_attr)){return;}
      

  };  //프로퍼티 f4 help 호출 처리.




  //OBJID 입력건 처리.
  oAPP.fn.attrChnageOBJID = function(){
    
    ls_uiinfo = oAPP.attr.oModel.getProperty("/uiinfo");

    //대문자 변환 처리.
    ls_uiinfo.OBJID = ls_uiinfo.OBJID.toUpperCase();

    ls_uiinfo.OBJID_stat = "None";
    ls_uiinfo.OBJID_stxt = "";

    var l_sep = "";

    //OBJID의 첫번째 문자가 숫자인경우 오류 처리.
    if(isNaN(ls_uiinfo.OBJID.substr(0,1)) !== true){
      ls_uiinfo.OBJID_stat = "Error";
      //091	Can not start with a numeric value.
      ls_uiinfo.OBJID_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "091", "", "", "", "");
      l_sep = "\r\n";
    }

    var reg = /[^A-Z0-9]/;

    //특수문자가 입력된경우 오류 처리.
    if(reg.test(ls_uiinfo.OBJID) === true){
      ls_uiinfo.OBJID_stat = "Error";
      //278	Special characters are not allowed.
      ls_uiinfo.OBJID_stxt = ls_uiinfo.OBJID_stxt + l_sep + oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "278", "", "", "", "");
      l_sep = "\r\n";
    }

    //동일 OBJID 존재여부 확인.
    if(ls_uiinfo.OBJID !== ls_uiinfo.OBJID_bf){
      
      //tree design영역에 중복된 OBJID건 존재하는경우.
      if(typeof oAPP.fn.getTreeData(ls_uiinfo.OBJID) !== "undefined"){
        ls_uiinfo.OBJID_stat = "Error";
        //069	Duplicate values exist.
        ls_uiinfo.OBJID_stxt = ls_uiinfo.OBJID_stxt + l_sep + oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "069", "", "", "", "");
      }
    }

    //오류가 발생한 경우 exit.
    if(ls_uiinfo.OBJID_stat === "Error"){
      oAPP.attr.oModel.setProperty("/uiinfo", ls_uiinfo);
      parent.showMessage(sap, 10, "E", ls_uiinfo.OBJID_stxt);
      return;
    }

    //이전에 입력한 이름과 지금 입력한 이름이 같으면 exit.
    if(ls_uiinfo.OBJID === ls_uiinfo.OBJID_bf){
      return;
    }

    //이전 UI OBJECT에 수집된 ATTR 정보가 존재하는경우.
    if(oAPP.attr.prev[ls_uiinfo.OBJID_bf]._T_0015.length !== 0){
      //ATTR의 OBJECT ID를 변경건으로 매핑.
      for(var i=0, l= oAPP.attr.prev[ls_uiinfo.OBJID_bf]._T_0015.length; i<l; i++){
        oAPP.attr.prev[ls_uiinfo.OBJID_bf]._T_0015[i].OBJID = ls_uiinfo.OBJID;
      }

    }

    //변경된 이름으로 UI 수집 처리.
    oAPP.attr.prev[ls_uiinfo.OBJID] = oAPP.attr.prev[ls_uiinfo.OBJID_bf];

    //UI의 OBJECT ID매핑건 변경 처리.
    oAPP.attr.prev[ls_uiinfo.OBJID]._OBJID = ls_uiinfo.OBJID;

    //이전 이름의 UI 제거.
    delete oAPP.attr.prev[ls_uiinfo.OBJID_bf];

    //DESIGN영역의 변경전 OBJID에 해당하는건 검색.
    var l_tree = oAPP.fn.getTreeData(ls_uiinfo.OBJID_bf);

    //OBJID ID 변경건으로 매핑.
    l_tree.OBJID = ls_uiinfo.OBJID;

    //CHILD 정보가 존재하는 경우.
    if(l_tree.zTREE.length !== 0){
      //CHILD의 부모 OBJECT ID 를 변경 처리.
      for(var i=0,l=l_tree.zTREE.length; i<l; i++){
        l_tree.zTREE[i].POBID = ls_uiinfo.OBJID;
      }
    }

    //클라이언트 이벤트 수집건 objid 변경.
    oAPP.fn.attrChgClientEventOBJID(ls_uiinfo.OBJID, ls_uiinfo.OBJID_bf);

    //desc 입력건 정보 objid 변경.
    oAPP.fn.changeDescOBJID(ls_uiinfo.OBJID, ls_uiinfo.OBJID_bf);

    //현재 출력된 attribute 리스트의 OBJID 변경 처리.
    for(var i=0, l=oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){
      oAPP.attr.oModel.oData.T_ATTR[i].OBJID = ls_uiinfo.OBJID;
    }
    

    //이전 OBJID를 변경된 ID로 업데이트.
    ls_uiinfo.OBJID_bf = ls_uiinfo.OBJID;

    //MODEL 갱신 처리.
    oAPP.attr.oModel.setProperty("/uiinfo", ls_uiinfo);
    oAPP.attr.oModel.refresh();

    //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
    oAPP.fn.setChangeFlag();

  };  //OBJID 입력건 처리.



  //클라이언트 이벤트의 OBJECT ID 변경 처리.
  oAPP.fn.attrChgClientEventOBJID = function(OBJID, OLDOBJID){
  
    //클라이언트 이벤트가 존재하지 않는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    //대상 OBJID의 ATTR 변경건이 존재하지 않는경우 EXIT.
    if(oAPP.attr.prev[OBJID]._T_0015.length === 0){return;}

    //이벤트 입력건, sap.ui.core.HTML의 content 프로퍼티 입력건 존재여부 확인.
    lt_attr = oAPP.attr.prev[ls_uiinfo.OBJID]._T_0015.filter( a => a.UIATY === "2" || a.UIATK === "AT000011858" );

    //이벤트, sap.ui.core.HTML의 content프로퍼티 입력건이 존재하지 않는경우 exit.
    if(lt_attr.length === 0){return;}

    for(var i=0, l=lt_attr.length; i<l; i++){

      //이전 OBJECTID로 입력된 클라이언트 이벤트, HTML CONTENT 입력건 존재여부 확인.
      var l_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a=> a.OBJID === OLDOBJID + lt_attr[i].UIASN );

      //존재하지 않는경우 다음건 확인.
      if(typeof l_cevt === "undefined"){continue;}

      //존재하는경우 변경된 OBJECT ID로 매핑 처리.
      l_cevt.OBJID = OBJID + lt_attr[i].UIASN;      

    }

  };  //클라이언트 이벤트의 OBJECT ID 변경 처리.



  //바인딩 처리.
  oAPP.fn.attrBindAttr = function(is_attr, is_tree){

    //바인딩 팝업에서 선택한 PATH 정보.
    is_attr.UIATV = is_tree.CHILD;

    //바인딩됨 FLAG 처리.
    is_attr.ISBND = "X";

    //추가속성정의
    is_attr.MPROP = "";

    //프로퍼티인경우, 바인딩 추가 속성 정의가 존재하는경우.
    if(is_attr.UIATY === "1" && is_tree.MPROP !== ""){
      //바인딩 추가 속성 정의값 매핑.
      is_attr.MPROP = is_tree.MPROP;
    }

    //이벤트가 아닌경우.
    if(is_attr.UIATY !== "2"){
      //화면 잠금 처리.
      is_attr.edit = false;
    }


    //sap.ui.core.HTML UI의 content 프로퍼티에 바인딩 처리한경우.
    if(is_attr.UIATK === "AT000011858"){
      //UI에 수집되어있는 해당 이벤트 삭제.
      oAPP.fn.attrDelClientEvent(is_attr, "HM");
    }


    //프로퍼티의 DDLB 항목에서 바인딩 처리한경우.
    if(is_attr.UIATY === "1" && typeof is_attr.T_DDLB !== "undefined"){
      //DDLB항목에 바인딩한 정보 추가.
      is_attr.T_DDLB.push({KEY:is_attr.UIATV, TEXT:is_attr.UIATV, ISBIND:"X"});
    }

    //변경건 대한 후속 처리.
    oAPP.fn.attrChange(is_attr);

    if(is_attr.UIATY === "1"){
      //property에서 바인딩 처리 한 경우.

      //n건 바인딩 처리건인경우 부모 UI에 현재 UI 매핑 처리.
      oAPP.fn.setModelBind(oAPP.attr.prev[is_attr.OBJID]);

    }else if(is_attr.UIATY === "3"){
      //Aggregation에서 바인딩 처리 한 경우.

      //자신 UI에 N건 바인딩 처리함 매핑.
      oAPP.fn.setAggrBind(oAPP.attr.prev[is_attr.OBJID],is_attr.UIATT, is_attr.UIATV);

      //n건 바인딩 처리건인경우 부모 UI에 현재 UI 매핑 처리.
      oAPP.fn.setModelBind(oAPP.attr.prev[is_attr.OBJID]);

    }


  };  //바인딩 처리.




  //프로퍼티 바인딩 처리.
  oAPP.fn.attrSetBindProp = function(is_attr, is_bInfo){

    //이전 바인딩 정보가 존재하는경우.
    if(is_attr.ISBND === "X"){
      //n건 바인딩 처리 정보 얻기.
      var l_model = oAPP.fn.getParentAggrBind(oAPP.attr.prev[is_attr.OBJID]);

      //n건 바인딩 정보가 존재하는경우.
      if(typeof l_model !== "undefined" && l_model !== ""){

        //현재 attr가 아닌 다른 바인딩된 UI가 N건 바인딩 처리됐는지 여부 확인.
        var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex(  a=> a.ISBND === "X" && a.UIATK !== is_attr.UIATK 
          && a.UIATV.substr(0, l_model.length) === l_model );


        //다른 바인딩 설정건중 n건 바인딩 처리건이 없으면서 바인딩 팝업에서 선택한건도 n건 바인딩에 파생된건이 아닌경우.
        if(l_indx === -1 && is_bInfo.CHILD.substr(0, l_model.length) !== l_model){

          //부모에서 현재 n건 바인딩 정보 제거 처리.
          oAPP.fn.attrUnbindProp(is_attr);

        }

      }

    }

    //DDLB로 출력된 프로퍼티의 이전값이 바인딩된 값인경우.
    if(is_attr.UIATY === "1" && is_attr.ISBND === "X" && is_attr.T_DDLB){

      //바인딩값을 ddlb에 추가한 항목을 찾아 제거 처리.
      for(var i=is_attr.T_DDLB.length-1; i>=0; i--){
        if(is_attr.T_DDLB[i].ISBIND === "X"){
          is_attr.T_DDLB.splice(i, 1);
        }
      }

    }

    //바인딩 팝업에서 선택한 PATH 정보.
    is_attr.UIATV = is_bInfo.CHILD;

    //바인딩됨 FLAG 처리.
    is_attr.ISBND = "X";

    //추가속성정의
    is_attr.MPROP = "";

    //프로퍼티인경우, 바인딩 추가 속성 정의가 존재하는경우.
    if(is_attr.UIATY === "1" && is_bInfo.MPROP !== ""){
      //바인딩 추가 속성 정의값 매핑.
      is_attr.MPROP = is_bInfo.MPROP;
    }

    //화면 잠금 처리.
    is_attr.edit = false;

    //sap.ui.core.HTML UI의 content 프로퍼티에 바인딩 처리한경우.
    if(is_attr.UIATK === "AT000011858"){
      //UI에 수집되어있는 해당 이벤트 삭제.
      oAPP.fn.attrDelClientEvent(is_attr, "HM");
    }

    

    //프로퍼티의 DDLB 항목에서 바인딩 처리한경우.
    if(is_attr.UIATY === "1" && typeof is_attr.T_DDLB !== "undefined"){
      //DDLB항목에 바인딩한 정보 추가.
      is_attr.T_DDLB.push({KEY:is_attr.UIATV, TEXT:is_attr.UIATV, ISBIND:"X"});
    }

    //변경건 대한 후속 처리.
    oAPP.fn.attrChange(is_attr, "", false, true);

    //n건 바인딩 처리건인경우 부모 UI에 현재 UI 매핑 처리.
    oAPP.fn.setModelBind(oAPP.attr.prev[is_attr.OBJID]);


  };  //프로퍼티 바인딩 처리.



  //프로퍼티 바인딩 해제 처리.
  oAPP.fn.attrSetUnbindProp = function(is_attr){
    
    //n건 바인딩 처리 정보 얻기.
    var l_model = oAPP.fn.getParentAggrBind(oAPP.attr.prev[is_attr.OBJID]);

    //n건 바인딩 정보가 존재하는경우.
    if(typeof l_model !== "undefined" && l_model !== ""){

      //현재 attr이 아닌 다른 바인딩된 UI가 N건 바인딩 처리됐는지 여부 확인.
      var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex(  a=> a.ISBND === "X" && a.UIATK !== is_attr.UIATK 
        && a.UIATV.substr(0, l_model.length) === l_model );


      //다른 바인딩 설정건중 n건 바인딩 처리건이 없는경우.
      if(l_indx === -1){

        //부모에서 현재 n건 바인딩 정보 제거 처리.
        oAPP.fn.attrUnbindProp(is_attr);

      }

    }

    //DDLB로 출력된 프로퍼티의 이전값이 바인딩된 값인경우.
    if(is_attr.UIATY === "1" && is_attr.ISBND === "X" && is_attr.T_DDLB){

      //바인딩값을 ddlb에 추가한 항목을 찾아 제거 처리.
      for(var i=is_attr.T_DDLB.length-1; i>=0; i--){
        if(is_attr.T_DDLB[i].ISBIND === "X"){
          is_attr.T_DDLB.splice(i, 1);
        }
      }

    }


    //바인딩 팝업에서 선택한 PATH 정보 초기화.
    is_attr.UIATV = "";

    //combo box 입력값 초기화.
    is_attr.comboval = "";

    //프로퍼티의 DEFAULT VALUE 검색.
    var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === is_attr.UIATK );

    //DEFAULT VALUE가 존재하는경우 해당 값 매핑.
    if(ls_0023 && ls_0023.DEFVL !== ""){
      is_attr.UIATV = ls_0023.DEFVL;
    }

    //바인딩됨 FLAG 해제.
    is_attr.ISBND = "";

    //추가속성정의 초기화.
    is_attr.MPROP = "";

    //변경건 대한 후속 처리.
    oAPP.fn.attrChange(is_attr, "", false, true);


  };  //프로퍼티 바인딩 해제 처리.




  //프로퍼티 바인딩 callback 이벤트
  oAPP.fn.attrBindCallBackProp = function(bIsbind, is_tree, is_attr){

    //unbind 처리된경우.
    if(bIsbind === false){
      //unbind 처리.
      oAPP.fn.attrSetUnbindProp(is_attr);
      return;
    }

    //프로퍼티 바인딩 처리.
    oAPP.fn.attrSetBindProp(is_attr, is_tree);


  };  //프로퍼티 바인딩 callback 이벤트




  //sap.m.Tree, sap.ui.table.TreeTable의 경우 예외처리 unbind.
  oAPP.fn.attrUnbindTree = function(is_attr){

    var lt_UIATK = [];

    switch (is_attr.UIATK) {
      case "AT000006260": //sap.m.Tree  items

        //PARENT, CHILD 프로퍼티 KEY 정보 구성.
        lt_UIATK = ["EXT00001190", "EXT00001191"];

        break;

      case "AT000013146": //sap.ui.table.TreeTable  rows

        //PARENT, CHILD 프로퍼티 KEY 정보 구성.
        lt_UIATK = ["EXT00001192", "EXT00001193"];

        break;
    
      default:
        return;
    }


    for(var i=0, l=lt_UIATK.length; i<l; i++){

      var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === lt_UIATK[i] );

      //PARENT, CHILD ATTRIBUTE에 바인딩이 구성되어 있다면.
      if(ls_attr && ls_attr.UIATV !== "" && ls_attr.ISBND === "X" ){

        //변경건 대한 후속 처리.
        oAPP.fn.attrSetUnbindProp(ls_attr);

      }

    } 

  };  //sap.m.Tree, sap.ui.table.TreeTable의 경우 예외처리 unbind.



  //aggregation 바인딩 callback 처리.
  oAPP.fn.attrBindCallBackAggr = function(bIsbind, is_tree, is_attr){

    //unbind 처리건인경우.
    if(bIsbind === false){

      //n건 바인딩 처리한 UI가 존재하는경우(GT_OTAB-F01).
      if(typeof oAPP.attr.prev[is_attr.OBJID]._BIND_AGGR[is_attr.UIATT] !== "undefined" && 
        oAPP.attr.prev[is_attr.OBJID]._BIND_AGGR[is_attr.UIATT].length !== 0){

          //122	Change the model, the binding that exists in the child is initialized.
          var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

          //123	Do you want to continue?
          l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

          //확인 팝업 호출.
          parent.showMessage(sap, 30, "I", l_msg, function(param){
            
            //확인팝업에서 YES를 안누른경우 EXIT.
            if(param !== "YES"){return;}

            //unbind 처리.
            oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID], is_attr.UIATT, is_attr.UIATV);

            //변경건 대한 후속 처리.
            oAPP.fn.attrSetUnbindProp(is_attr);

            //TREE의 PARENT, CHILD 프로퍼티 예외처리.
            oAPP.fn.attrUnbindTree(is_attr);
            

          });

          return;

      }

      //N건 바인딩 처리한 UI가 없으면 확인팝업 없이 unbind 처리.
      oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID], is_attr.UIATT, is_attr.UIATV);

      //변경건 대한 후속 처리.
      oAPP.fn.attrSetUnbindProp(is_attr);

      //TREE의 PARENT, CHILD 프로퍼티 예외처리.
      oAPP.fn.attrUnbindTree(is_attr);

      return;

    }

  
    //이전 바인딩 정보가 존재하는경우.
    if(is_attr.UIATV !== "" && is_attr.ISBND === "X"){

      //122	Change the model, the binding that exists in the child is initialized.
      var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

      //123	Do you want to continue?
      l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

      //확인 팝업 호출.
      parent.showMessage(sap, 30, "I", l_msg, function(param){
        
        //확인팝업에서 YES를 안누른경우 EXIT.
        if(param !== "YES"){return;}

        //UNBIND 처리.
        oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID],is_attr.UIATT, is_attr.UIATV);

        //TREE의 PARENT, CHILD 프로퍼티 예외처리.
        oAPP.fn.attrUnbindTree(is_attr);

        //AGGREGATION 바인딩 처리.
        oAPP.fn.attrSetBindProp(is_attr, is_tree);
        

        oAPP.attr.prev[is_attr.OBJID]._MODEL[is_attr.UIATT] = is_attr.UIATV;

      });

      return;

    }

    //이전 바인딩 정보가 존재하지 않는경우 바로 바인딩 처리.
    oAPP.fn.attrSetBindProp(is_attr, is_tree);

    oAPP.attr.prev[is_attr.OBJID]._MODEL[is_attr.UIATT] = is_attr.UIATV;


  };  //aggregation 바인딩 callback 처리.




  //바인딩 팝업 Call Back 이벤트
  oAPP.fn.attrBindCallBack = function(bIsbind, is_tree, is_attr){

    //unbind 처리된경우.
    if(bIsbind === false){
  
      //프로퍼티의 경우 즉시 UNBIND 처리.
      if(is_attr.UIATY === "1"){
        //unbind 처리.
        oAPP.fn.attrUnbindAttr(is_attr);

        return;
      }

      //aggregation의 경우 확인 팝업 호출 후 바인딩 해제 처리.
      if(is_attr.UIATY === "3"){

        //122	Change the model, the binding that exists in the child is initialized.
        var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

        //123	Do you want to continue?
        l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

        parent.showMessage(sap, 30, "I", l_msg, function(param){

          if(param !== "YES"){return;}

          //unbind 처리.
          oAPP.fn.attrUnbindAttr(is_attr);

        });

      }

      return;
      
    }

    //프로퍼티에서 바인딩 처리한경우.
    if(is_attr.UIATY === "1"){
      oAPP.fn.attrBindAttr(is_attr, is_tree);
      return;
    }

    //AGGREGATION에 기존 바인딩건이 존재하지 않는경우.
    if(is_attr.UIATY === "3" && is_attr.UIATV === ""){
      oAPP.fn.attrBindAttr(is_attr, is_tree);
      return;
    }

    //aggregation의 경우 확인 팝업 호출 후 바인딩 해제 처리.
    if(is_attr.UIATY === "3" && is_attr.UIATV !== ""){

      //122	Change the model, the binding that exists in the child is initialized.
      var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

      //123	Do you want to continue?
      l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

      parent.showMessage(sap, 30, "I", l_msg, function(param){
        
        if(param !== "YES"){return;}

        //unbind 처리.
        oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID],is_attr.UIATT, is_attr.UIATV);

        oAPP.fn.attrBindAttr(is_attr, is_tree);

      });

      return;

    }    

  }; //바인딩 팝업 Call Back 이벤트



  //n건 바인딩한 프로퍼티 해제 처리.
  oAPP.fn.attrUnbindProp = function(is_attr){

    function lf_findModelBindParent(oParent){

      if(!oParent){return;}

      //N건 바인딩 정보가 존재하지 않는경우 상위 UI를 탐색.
      if(jQuery.isEmptyObject(oParent._BIND_AGGR) === true){
        lf_findModelBindParent(oParent.__PARENT);
        return;
      }

      //N건 바인딩 정보가 존재하는경우 입력 UI가 존재하는지 여부 확인.
      for(var i in oParent._BIND_AGGR){

        //현재 UI가 N건 바인딩 처리됐는지 확인.
        var l_indx = oParent._BIND_AGGR[i].findIndex( a => a === oAPP.attr.prev[is_attr.OBJID] );

        //N건 바인딩 처리 안된경우 SKIP.
        if(l_indx === -1){continue;}

        //부모의 N건 바인딩 수집건에서 현재 UI 제거 처리.
        oParent._BIND_AGGR[i].splice(l_indx, 1);
        return;

      }

      //N건 바인딩 정보에 입력 UI가 존재하지 않는경우 상위 UI 탐색.
      lf_findModelBindParent(oParent.__PARENT);

    }

    //상위 부모를 탐색하며 n건 바인딩 UI 수집건 제거.
    lf_findModelBindParent(oAPP.attr.prev[is_attr.OBJID].__PARENT);


  };  //n건 바인딩한 프로퍼티 해제 처리.




  //바인딩 해제 재귀호출.
  oAPP.fn.attrUnbindAggr = function(oUi, UIATT, UIATV){

    //T_0015의 바인딩 수집건 제거 처리.
    function lf_clearBindData(oUi){

      if(!oUi){return;}

      if(typeof oUi._T_0015 === "undefined"){return;}

      if(oUi._T_0015.length === 0){return;}

      //현재 UI에 설정된 N건 바인딩 해제 처리.
      for(var i=oUi._T_0015.length-1; i>=0; i--){

        //바인딩된건이 아닌경우 SKIP.
        if(oUi._T_0015[i].ISBND !== "X"){continue;}

        //바인딩건인경우 N건 바인딩 처리된 건인지 판단.
        if(oAPP.fn.chkBindPath(UIATV, oUi._T_0015[i].UIATV) === true){
          //N건 바인딩된 건인경우 바인딩 해제 처리.
          oUi._T_0015.splice(i,1);
        }

      }

    } //T_0015의 바인딩 수집건 제거 처리.


    //n건 바인딩이 없는경우 exit.
    if(!oUi._BIND_AGGR[UIATT] || oUi._BIND_AGGR[UIATT].length === 0){

      //n건 바인딩 초기화 처리.
      lf_clearBindData(oUi);

      //Aggregation에 n건 바인딩 처리 제거.
      if(oAPP.fn.chkBindPath(UIATV, oUi._MODEL[UIATT]) === true){
        delete oUi._MODEL[UIATT];
      }

      return;
    }


    //N건 바인딩 설정한 하위 UI가 존재하는경우.
    for(var i=oUi._BIND_AGGR[UIATT].length-1; i>=0; i--){

      //해당 UI로 파생된 N건 바인딩처리 UI가 없는경우.
      if(jQuery.isEmptyObject(oUi._BIND_AGGR[UIATT][i]._BIND_AGGR) === true){
        //n건 바인딩 초기화 처리.
        lf_clearBindData(oUi._BIND_AGGR[UIATT][i]);

        //n건 바인딩 수집건에서 제거 처리.
        oUi._BIND_AGGR[UIATT].splice(i, 1);

        continue;

      }


      //해당 UI로 파생된 N건 바인딩처리 UI가 있는경우.
      for(var j in oUi._BIND_AGGR[UIATT][i]._BIND_AGGR){
        //하위를 탐색하며 n건 바인딩 수집 제거 처리.  
        oAPP.fn.attrUnbindAggr(oUi._BIND_AGGR[UIATT][i], j, UIATV);
      }

      //n건 바인딩 초기화 처리.
      lf_clearBindData(oUi._BIND_AGGR[UIATT][i]);

      //n건 바인딩 수집건에서 제거 처리.
      oUi._BIND_AGGR[UIATT].splice(i, 1);


    } //N건 바인딩 설정한 하위 UI가 존재하는경우.


    //n건 바인딩 초기화 처리.
    lf_clearBindData(oUi);

    
    //Aggregation에 n건 바인딩 처리 제거.
    if(oAPP.fn.chkBindPath(UIATV, oUi._MODEL[UIATT]) === true){
      delete oUi._MODEL[UIATT];
    }

  };  //바인딩 해제 재귀호출.




  //부모를 탐색하며, 현재 UI가 N건 바인딩 처리됐는지 여부 확인.
  oAPP.fn.attrFindBindAggr = function(oUi){

    function lf_chkBindAggr(oParent){

      //최상위에 도달한경우 EXIT.
      if(!oParent){return;}

      //UI의 N건 바인딩 처리건 수집을 확인.
      for(var i in oParent._BIND_AGGR){

        //현재 UI가 N건 바인딩에 수집된경우.
        if(oParent._BIND_AGGR[i].findIndex( a => a === oUi) !== -1){
          //해당 MODEL 바인딩 PATH를 RETURN.
          return {POBID: oParent._OBJID, UIATT:i, UIATV:oParent._MODEL[i]};
        }

      }

      return lf_chkBindAggr(oParent.__PARENT);

    }

    //부모를 탐색하며 N건 바인딩 여부 확인.
    return lf_chkBindAggr(oUi.oParent);


  };  //부모를 탐색하며, 현재 UI가 N건 바인딩 처리됐는지 여부 확인.



  //바인딩 해제 처리 function.
  oAPP.fn.attrUnbindAttr = function(is_attr){
    
    //DDLB로 출력된 프로퍼티의 이전값이 바인딩된 값인경우.
    if(is_attr.UIATY === "1" && is_attr.ISBND === "X" && is_attr.T_DDLB){

      //바인딩값을 ddlb에 추가한 항목을 찾아 제거 처리.
      for(var i=is_attr.T_DDLB.length-1; i>=0; i--){
        if(is_attr.T_DDLB[i].ISBIND === "X"){
          is_attr.T_DDLB.splice(i, 1);
        }
      }

    }

    //Aggregation에서 unbind처리한 경우 자기 하위 ui를 탐색하면서 n건 바인딩 해제 처리.
    if(is_attr.UIATY === "3"){
      oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID],is_attr.UIATT, is_attr.UIATV);
    }

    //이전 정보가 바인딩 처리된건이라면.
    if(is_attr.ISBND === "X" && is_attr.UIATV !== ""){
      //바인딩 정보 초기화.
      is_attr.UIATV = "";

      //일반 프로퍼티의 경우.
      if(is_attr.UIATY === "1"){
        //프로퍼티의 DEFAULT VALUE 검색.
        var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === is_attr.UIATK );

        //DEFAULT VALUE가 존재하는경우 해당 값 매핑.
        if(ls_0023 && ls_0023.DEFVL !== ""){
          is_attr.UIATV = ls_0023.DEFVL;
        }
      }
      
      //바인딩 FLAG 초기화.
      is_attr.ISBND = "";

      //property의 바인딩 추가속성 정의 초기화.
      is_attr.MPROP = "";

    }


    //Aggregation에서 호출되지 않은경우.
    if(is_attr.UIATY !== "3"){
      //값을 직접 입력 가능 처리.
      is_attr.edit = true;
    }
    
    //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
    oAPP.fn.attrChange(is_attr);


  }; //바인딩 해제 처리 function.




  //프로퍼티가 아이콘관련 프로퍼티인지 여부 확인.
  oAPP.fn.attrIsIconProp = function(is_attr){

    //PROPERTY가 아닌경우, 바인딩처리된경우 EXIT. 
    if(is_attr.UIATY !== "1"){return;}

    var l_UIATT = is_attr.UIATT.toUpperCase();

    //프로퍼티명에 ICON 관련 키워드가 포함안되는경우 exit.
    if(l_UIATT.indexOf("ICON") === -1 && l_UIATT.indexOf("IMAGE") === -1 && l_UIATT.indexOf("SRC") === -1){return;}

    //type이 int, float, boolean유형은 처리 하지 않음.
    if(is_attr.UIADT === "int" || is_attr.UIADT === "float" || is_attr.UIADT === "boolean"){return;}

    //프로퍼티 타입이 width, height 관련 타입인경우 exit.
    if(is_attr.UIADT === "sap.ui.core.CSSSize"){return;}

    //프로퍼티 타입이 색상관련 타입인경우 exit.
    if(is_attr.UIADT === "sap.ui.core.CSSColor"){return;}

    //아이콘 관련 프로퍼티임 flag return.
    return true;

  };  //프로퍼티가 아이콘관련 프로퍼티인지 여부 확인.




  //프로퍼티가 컬러관련 프로퍼티인지 여부 확인.
  oAPP.fn.attrIsColorProp = function(is_attr){

    //PROPERTY가 아닌경우, 바인딩처리된경우 EXIT. 
    if(is_attr.UIATY !== "1"){return;}

    var l_UIATT = is_attr.UIATT.toUpperCase();

    //프로퍼티명에 컬러 관련 키워드가 포함안되는경우 exit.
    if(l_UIATT.indexOf("COLOR") === -1){return;}

    //type이 int, float, boolean유형은 처리 하지 않음.
    if(is_attr.UIADT === "int" || is_attr.UIADT === "float" || is_attr.UIADT === "boolean"){return;}

    //프로퍼티 타입이 width, height 관련 타입인경우 exit.
    if(is_attr.UIADT === "sap.ui.core.CSSSize"){return;}

    //프로퍼티 타입이 아이콘 관련 타입인경우 exit.
    if(is_attr.UIADT === "sap.ui.core.URI"){return;}    

    //컬러관련 프로퍼티임 flag return.
    return true;

  };  //프로퍼티가 컬러관련 프로퍼티인지 여부 확인.




  //프로퍼티의 입력필드 f4 help 설정 여부.
  oAPP.fn.attrSetShowValueHelp = function(is_attr){
    //deflaut f4 help 버튼 비활성 처리.
    is_attr.showF4 = false;

    //PROPERTY가 아닌경우, 바인딩처리된경우 EXIT. 
    if(is_attr.UIATY !== "1" || is_attr.ISBND === "X"){return;}

    //DDLB 출력 대상 라인인경우 EXIT.
    if(is_attr.ISLST === "X"){return;}

    //DDLB가 설정된 경우 EXIT.
    if(typeof is_attr.T_DDLB !== "undefined" && is_attr.T_DDLB.length !== 0){return;}

    //프로퍼티가 아이콘관련 프로퍼티인지 여부 확인.
    if(oAPP.fn.attrIsIconProp(is_attr) === true){
      //f4 help 버튼 활성화.
      is_attr.showF4 = true;
      return;
    }

    //프로퍼티가 컬러관련 프로퍼티인지 여부 확인.
    if(oAPP.fn.attrIsColorProp(is_attr) === true){
      //f4 help 버튼 활성화.
      is_attr.showF4 = true;
    }
    
  };  //프로퍼티의 입력필드 f4 help 설정 여부.



  //바인딩 & 이벤트 팝업 호출 처리 function.
  oAPP.fn.attrBindNEvtPopup = function(is_attr){

    //event 팝=인경우 display상태인경우 exit.
    if(is_attr.UIATY === "2" && oAPP.attr.oModel.oData.IS_EDIT === false){
      return;
    }

    //Aggregation의 바인딩 팝업 버튼 선택시.
    if(is_attr.UIATY === "3"){

      //현재 ui의 tree 정보 얻기.
      var l_tree = oAPP.fn.getTreeData(is_attr.OBJID);

      //CHILD 정보가 존재하는경우.
      if(l_tree.zTREE.length !== 0){

        //현재 바인딩 아이콘을 선택한 AGGREGATION에 추가된 UI정보 얻기.
        var lt_filter = l_tree.zTREE.filter( a => a.UIATK === is_attr.UIATK);

        //현재 aggregation에 2개 이상의 UI가 추가된경우.
        if(lt_filter.length >= 2){

          //023	If you have one or more child objects, you can not specify a model.
          parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "023", "", "", "", ""));
          return;
        }

      }

    } //Aggregation의 바인딩 팝업 버튼 선택시.


    //이벤트 영역에서 이벤트 발생한 경우.
    if(is_attr.UIATY === "2"){

      //대상 function이 존재하는경우 호출 처리.
      if(typeof oAPP.fn.createEventPopup !== "undefined"){
        oAPP.fn.createEventPopup(is_attr, oAPP.fn.attrCreateEventCallBack);
        return;
      }

      //대상 function이 존재하지 않는경우 script 호출.
      oAPP.fn.getScript("design/js/createEventPopup",function(){
        oAPP.fn.createEventPopup(is_attr, oAPP.fn.attrCreateEventCallBack);
      });

      return;

    }


    var l_title = "", l_CARDI = "";

    switch(is_attr.UIATY){
      case "1": //property
        //B18  Data Binding / Unbinding
        l_title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B18", "", "", "", "") + " - ";

        //A52  Property
        l_title += oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A52", "", "", "", "");

        l_CARDI = "F";

        //SELECT OPTION2의 VALUE에 바인딩처리 하는경우.
        if(is_attr.UIATK === "EXT00001161"){
          //RANGE TABLE만 바인딩 가능 FLAG 처리.
          l_CARDI = "R";
        }

        //프로퍼티가 ARRAY로 입력 가능한 경우, 프로퍼티 타입이 숫자 유형이 아니면.
        if(is_attr.ISMLB === "X" && (is_attr.UIADT !== "int" && is_attr.UIADT !== "float")){
          //STRING_TABLE 바인딩 가능 FLAG 처리.
          l_CARDI = "ST";
        }

        break;

      case "3": //Aggregation
        //B18  Data Binding / Unbinding
        l_title = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B18", "", "", "", "") + " - ";

        //B19  Aggregation
        l_title += oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B19", "", "", "", "");

        l_CARDI = "T";
        break;

      default:
        return;

    } //UI Attribute Type에 따른 분기.


    //대상 function이 존재하는경우 호출 처리.
    if(typeof oAPP.fn.callBindPopup !== "undefined"){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBack, is_attr.UIATK);
      return;
    }

    //대상 function이 존재하지 않는경우 script 호출.
    oAPP.fn.getScript("design/js/callBindPopup",function(){
      oAPP.fn.callBindPopup(l_title, l_CARDI, oAPP.fn.attrBindCallBack, is_attr.UIATK);
    });

  
  }; //바인딩 & 이벤트 팝업 호출 처리 function.




  //이벤트 팝업 call back 이벤트
  oAPP.fn.attrCreateEventCallBack = function(is_attr, evtnm){

    //입력한 이벤트명 매핑.
    is_attr.UIATV = evtnm;

    //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
    oAPP.fn.attrChangeProc(is_attr);

  }; //이벤트 팝업 call back 이벤트




  //property, event, Aggregation 입력값 처리.
  oAPP.fn.attrChgAttrVal = function(is_attr, uitp){

    //ATTRIBUTE 수집처리.
    function lf_add_T_0015(){

      //수집건이 존재하는경우.
      if(l_indx !== -1){
        //해당 이벤트 매핑.
        oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].UIATV = is_attr.UIATV;
        oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ISBND = is_attr.ISBND;
        oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].MPROP = is_attr.MPROP;
        oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ADDSC = is_attr.ADDSC;
        oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ISWIT = is_attr.ISWIT;
        return;
      }

      //수집건이 존재하지 않는경우 신규 라인 생성 처리.
      var ls_0015 = oAPP.fn.crtStru0015();

      //attr의 입력값 매핑.
      oAPP.fn.moveCorresponding(is_attr, ls_0015);

      //이벤트 입력건 수집 처리.
      ls_0015.APPID = oAPP.attr.appInfo.APPID;
      ls_0015.GUINR = oAPP.attr.appInfo.GUINR;

      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === is_attr.UIOBK );

      if(ls_0022){
        ls_0015.UILIK = ls_0022.UILIK;
      }

      oAPP.attr.prev[is_attr.OBJID]._T_0015.push(ls_0015);

    } //ATTRIBUTE 수집처리.



    //COMBO BOX에 입력한 값이 존재하는경우, COMBO BOX의 선택건이 없다면.
    if(is_attr.comboval !== "" && is_attr.UIATV === ""){
      //COMBO BOX에 입력값 초기화.
      is_attr.comboval = "";
    }

    //기존 수집건 존재 여부 확인.
    var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex( a => a.OBJID === is_attr.OBJID &&
      a.UIATT === is_attr.UIATT && a.UIATY === is_attr.UIATY );
    

    //이벤트인경우 값이 입력됐다면.
    if(is_attr.UIATY === "2" && is_attr.UIATV !== ""){
      //입력값 수집 처리.
      lf_add_T_0015();
      return;

    }

    //AGGREGATION인경우 값이 입력됐다면.
    if(is_attr.UIATY === "3" && is_attr.UIATV !== ""){
      //입력값 수집 처리.
      lf_add_T_0015();
      return;

    }
    

    //이벤트에 라인의 입력값이 존재하지 않는경우.
    if(is_attr.UIATY === "2" && is_attr.UIATV === ""){
      
      //클라이언트 이벤트 검색.
      var l_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === "JS" );
      
      //클라이언트 이벤트가 존재하는경우 이벤트 수집처리.
      if(l_cevt){
        //서버이벤트 공백처리만 함.
        lf_add_T_0015();
        return;
      }

      //수집건이 존재하지 않는경우 exit.
      if(l_indx === -1){return;}

      //수집건존재, 서버이벤트, 클라이언트 이벤트가 없는경우 해당 라인 삭제 처리.
      oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx, 1);
      return;

    }

    
    //AGGREGATION인경우 입력값이 존재하지 않는경우 수집건 존재시.
    if(is_attr.UIATY === "3" && is_attr.UIATV === "" && l_indx !== -1){
      //수집된 라인 삭제 처리.
      oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx, 1);
      return;
    }


    //checkbox에서 발생한 이벤트인경우.
    if(uitp === "CHECK"){
      //checkbox를 선택한경우 abap_true로, 선택하지 않은경우 abap_false 처리.
      is_attr.UIATV = is_attr.UIATV_c === true ? "X":"";
    }

    
    var ls_0023, l_dval = "", l_ISLST = "";

    //ROOT가 아닌경우, 직접 입력가능한 aggregation이 아닌경우 default 값 얻기.
    if(is_attr.OBJID !== "ROOT" && is_attr.UIATK.indexOf("_1") === -1){
      ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === is_attr.UIATK );

    }

    if(ls_0023){
      l_dval = ls_0023.DEFVL;
      l_ISLST = ls_0023.ISLST;
    }


    //프로퍼티 입력건 정합성 점검.
    if(oAPP.fn.chkValidProp(is_attr) === false){
      
      //DDLB로 표현되는건이 아닌경우.
      if(l_ISLST !== "X"){
        //입력 불가능한 값인경우 default 값으로 변경 처리.
        is_attr.UIATV = l_dval;
      }

    }

    //default 값과 동일한 경우 수집항목이 존재하지 않는경우 exit.
    if(l_dval === is_attr.UIATV && l_indx === -1){
      return;
    }

    //default 값과 동일한 경우 수집항목이 존재하는경우 해당 라인 제거 후 exit.
    if(l_dval === is_attr.UIATV && l_indx !== -1){
      var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx,1);
      return;
    }

    //프로퍼티 type이 숫자 유형인경우.
    if(is_attr.UIATY === "1" && is_attr.ISBND === "" && ( is_attr.UIADT === "int" || is_attr.UIADT === "float")){
      //입력값 숫자 유형으로 변경 처리.                
      is_attr.UIATV  = String(Number(is_attr.UIATV));
    }


    //입력값이 존재하지 않는경우, default 값과 다르다면.
    if(is_attr.UIATV === "" && l_dval !== is_attr.UIATV){
      //SPACE 입력됨 FLAG 처리.
      is_attr.ISSPACE = "X";
    }


    //OTR 입력건인경우 ALIAS 대문자 변환 처리.
    oAPP.fn.attrSetOTRAlias(is_attr);


    //attr 입력건 수집 처리.
    lf_add_T_0015();


  }; //property, event, Aggregation 입력값 처리.




  //OTR 입력건인경우 ALIAS 대문자 변환 처리.
  oAPP.fn.attrSetOTRAlias = function(is_attr){

    //프로퍼티가 아닌경우 EXIT.
    if(is_attr.UIATY !== "1"){return;}

    //바인딩 처리된경우 EXIT.
    if(is_attr.ISBND === "X"){return;}

    //프로퍼티 입력값이 존재하지 않는경우 EXIT.
    if(is_attr.UIATV === ""){return;}

    //$OTR: 키워드로 시작하지 않는경우 EXIT.
    if(is_attr.UIATV.substr(0,5) !== "$OTR:"){return;}

    //OTR 입력값 대문자 변환 처리.
    is_attr.UIATV = is_attr.UIATV.toUpperCase();


  };  //OTR 입력건인경우 ALIAS 대문자 변환 처리.



  //입력값이 프로퍼티 유형에 맞는지 점검.
  oAPP.fn.chkValidProp = function(is_attr){

    //프로퍼티가 아닌경우, 바인딩 처리건인경우 EXIT.
    if(is_attr.UIATY !== "1" || is_attr.ISBND === "X"){return;}

    var l_val = is_attr.UIATV;

    switch(is_attr.UIADT.toUpperCase()){
      case "BOOLEAN":

        //입력값이 true인경우.
        if(is_attr.UIATV === "true"){
          l_val = true;          

        //입력값이 false 이거나 값이 입력되지 않은경우.
        }else if(is_attr.UIATV === "false" || is_attr.UIATV === ""){
          l_val = false;
        
        }

        break;

      case "INT":
        //int로 변환처리.
        l_val = Number(is_attr.UIATV);

        if(isNaN(l_val)){
          return false;
        }
        break;

      case "FLOAT":
        //float로 변환 처리.
        l_val = Number(is_attr.UIATV);

        if(isNaN(l_val)){
          return false;
        }

        break;

    }

    var l_type = sap.ui.base.DataType.getType(is_attr.UIADT);
    if(!l_type){return;}

    //입력값 가능여부 return. true: 가능, false: 불가능.
    return l_type.isValid(l_val);


  };  //입력값이 프로퍼티 유형에 맞는지 점검.


  //appcontainer 호출 이벤트.
  oAPP.fn.attrAppf4Popup = function(is_attr){
    //appcontainer의 AppID 프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "EXT00000030"){return;}

    //appcontainer callback 이벤트.
    function lf_appCallback(param){

      //편집상태가 아닌경우 exit.
      if(!oAPP.attr.oModel.oData.IS_EDIT){return;}

      //APPLICATION ID 매핑.
      is_attr.UIATV = param.APPID;

      //ATTR 변경처리.
      oAPP.fn.attrChangeProc(is_attr, "INPUT");

      //AppDescript 프로퍼티 정보 얻기.
      var ls_desc = oAPP.attr.oModel.oData.T_ATTR.find( a=> a.UIATK === "EXT00000031");
      if(typeof ls_desc === "undefined"){return;}

      //APPLICATION DESC 정보 매핑.
      ls_desc.UIATV = param.APPNM;

      //ATTR 변경처리.
      oAPP.fn.attrChangeProc(ls_desc, "INPUT");

    } //appcontainer callback 이벤트.

    var l_opt = {autoSearch:true, initCond:{PACKG:"", APPID:"", APPNM:"", ERUSR:"", HITS:500}};

    //application f4 help 팝업 호출.
    if (typeof oAPP.fn.fnAppF4PopupOpen !== "undefined") {
      oAPP.fn.fnAppF4PopupOpen(l_opt, lf_appCallback);
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //js load후 application f4 help 팝업 호출.
    oAPP.loadJs("fnAppF4PopupOpen", function() {
      oAPP.fn.fnAppF4PopupOpen(l_opt, lf_appCallback);
    });

    //하위로직 skip처리를 위한 flag return
    return true;

  };  //appcontainer 호출 이벤트.



  //u4a.m.UsageArea의 AppID프로퍼티 삭제 예외처리.
  oAPP.fn.attrAppF4Del = function(is_attr){
    
    //appcontainer의 AppID 프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "EXT00000030"){return;}

    //편집상태가 아닌경우 exit.
    if(!oAPP.attr.oModel.oData.IS_EDIT){
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //입력값 초기화 처리.
    is_attr.UIATV = "";

    //ATTR 변경처리.
    oAPP.fn.attrChangeProc(is_attr, "INPUT");

    //AppDescript 프로퍼티 정보 얻기.
    var ls_desc = oAPP.attr.oModel.oData.T_ATTR.find( a=> a.UIATK === "EXT00000031");
    if(typeof ls_desc === "undefined"){return;}

    //APPLICATION DESC 정보 초기화.
    ls_desc.UIATV = "";

    //ATTR 변경처리.
    oAPP.fn.attrChangeProc(ls_desc, "INPUT");

    //하위로직 skip처리를 위한 flag return
    return true;


  };  //u4a.m.UsageArea의 AppID프로퍼티 삭제 예외처리.




  //tree의 parent, child 바인딩시 점검.
  oAPP.fn.attrChkTreeProp = function(is_attr){
    var l_UIATK = "";

    //B19  Aggregation
    var l_msg = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B19", "", "", "", "");

    //attribute key에 따른 로직 분기.
    switch(is_attr.UIATK){
      case "EXT00001190":   //sap.m.Tree의 parent
      case "EXT00001191":   //sap.m.Tree의 child

        //items Aggregation의 attribute key 매핑.
        l_UIATK = "AT000006260";
        l_msg = l_msg + " items";
        break;

      case "EXT00001192":   //sap.ui.table.TreeTable의 parent
      case "EXT00001193":   //sap.ui.table.TreeTable의 child

        //rows Aggregation의 attribute key 매핑.
        l_UIATK = "AT000013146";
        l_msg = l_msg + " rows";
        break;

      default:
        //sap.m.Tree, sap.ui.table.TreeTable의 parent, child 프로퍼티가 아닌경우 exit.
        return false;

    }

    //편집상태가 아닌경우 exit.
    if(!oAPP.attr.oModel.oData.IS_EDIT){return;}    

    //점검대상 Aggregation 검색.
    var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a=> a.UIATK === l_UIATK);

    //해당 Aggregation에 N건 바인딩 처리를 하지 않은경우.
    if(!ls_attr || ls_attr.UIATV === ""){

      is_attr.valst = "Error";
      //054	Model information does not exist in &.
      is_attr.valtx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "054", l_msg, "", "", "");
      oAPP.attr.oModel.refresh();

      //Model information does not exist in Aggregation items.
      parent.showMessage(sap, 20, "E", is_attr.valtx);

      //하위로직 skip처리를 위한 flag return
      return true;

    }

  };  //tree의 parent, child 바인딩시 점검.




  //select option2의 F4HelpID 프로퍼티의 팝업 호출 처리.
  oAPP.fn.attrSelOption2F4HelpID = function(is_attr){
    
    //selectOption2의 F4HelpID프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "EXT00001188"){return;}

    //편집상태가 아닌경우 exit.
    if(!oAPP.attr.oModel.oData.IS_EDIT){
      //하위로직 skip처리를 위한 flag return
      return true;
    }
    
    //f4 help callback function.
    function lf_returnDOC(param){

      //F4 HELP에서 입력한 값매핑.
      is_attr.UIATV = param.SHLPNAME;

      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr);

    } //f4 help callback function.
    
    
    var l_func;

    //edit인경우 callback function 매핑.
    if(oAPP.attr.oModel.oData.IS_EDIT === true){
      l_func = lf_returnDOC;

    }

    //f4 help팝업을 load한경우.
    if(typeof oAPP.fn.callF4HelpPopup !== "undefined"){
      //f4 help 팝업 호출.
      oAPP.fn.callF4HelpPopup("DD_SHLP", "DD_SHLP", [], [], l_func);
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //f4help 팝업을 load하지 못한경우.
    oAPP.fn.getScript("design/js/callF4HelpPopup",function(){
        //f4 help 팝업 function load 이후 팝업 호출.
        oAPP.fn.callF4HelpPopup("DD_SHLP", "DD_SHLP", [], [], l_func);
    });

    //하위로직 skip처리를 위한 flag return
    return true;

  };  //select option2의 F4HelpID 프로퍼티의 팝업 호출 처리.




  //select option2의 F4HelpReturnFIeld 프로퍼티의 팝업 호출 처리.
  oAPP.fn.attrSelOption2F4HelpReturnFIeld = function(is_attr){

    //CALLBACK FUNCTION.
    function lf_callback(param){

      //리스트에서 선택한 필드명 매핑.
      is_attr.UIATV = param.FIELDNAME;

      //오류 표현 필드 초기화 처리.
      oAPP.fn.attrClearErrorField();

      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr);

    } //CALLBACK FUNCTION.

    
    //selectOption2의 F4HelpReturnFIeld프로퍼티가 아닌경우 exit.
    if(is_attr.UIATK !== "EXT00001189"){return;}
    
    //편집상태가 아닌경우 exit.
    if(!oAPP.attr.oModel.oData.IS_EDIT){
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //F4HelpID 프로퍼티 정보 얻기.
    var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === "EXT00001188" );

    //F4HelpID 프로퍼티 입력값이 존재하지 않는경우 EXIT.
    if(ls_attr.UIATV === ""){
      ls_attr.valst = "Error";

      //A37	Search Help ID
      //053	Value & is missing.
      ls_attr.valtx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "053", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A37"), "", "", "");

      //005	Job finished.
      parent.showMessage(sap, 10, "E", ls_attr.valtx);

      //모델 갱신 처리.
      oAPP.attr.oModel.refresh();

      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //A28  Field List
    var l_title = ls_attr.UIATV + " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A28", "", "", "", "");

    //동적 리스트 팝업이 존재하는경우.
    if(typeof oAPP.fn.callDynListPopup !== "undefined"){
      //f4 help 리스트 팝업 호출.
      oAPP.fn.callDynListPopup("GETF4HELPFIELD", l_title, [{NAME:"SHLPNAME", VALUE:ls_attr.UIATV}], lf_callback);
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //동적 리스트 팝업을 load하지 못한경우.
    oAPP.fn.getScript("design/js/callDynListPopup",function(){
        //동적 리스트 팝업 function load 이후 팝업 호출.
        oAPP.fn.callDynListPopup("GETF4HELPFIELD", l_title, [{NAME:"SHLPNAME", VALUE:ls_attr.UIATV}], lf_callback);
    });
    

    //하위로직 skip처리를 위한 flag return
    return true;

  };  //select option2의 F4HelpReturnFIeld 프로퍼티의 팝업 호출 처리.




  //select option2의 F4HelpID, F4HelpReturnFIeld 프로퍼티의 예외처리.
  oAPP.fn.attrSelOption2F4HelpIDDel = function(is_attr){
    //F4HelpID, F4HelpReturnFIeld 프로퍼티가 아닌경우 EXIT.
    if(is_attr.UIATK !== "EXT00001188" && is_attr.UIATK !== "EXT00001189"){
      return;
    }

    //편집상태가 아닌경우 exit.
    if(!oAPP.attr.oModel.oData.IS_EDIT){
      //하위로직 skip처리를 위한 flag return
      return true;
    }

    //F4HelpID프로퍼티인경우.
    if(is_attr.UIATK === "EXT00001188"){

      //기존 입력건 초기화.
      is_attr.UIATV = "";

      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr);

      //F4HelpReturnFIeld ATTRIBUTE 검색.
      var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === "EXT00001189" );

      if(typeof ls_attr !== "undefined"){
        //F4HelpReturnFIeld 입력건 초기화.
        ls_attr.UIATV = "";

        //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
        oAPP.fn.attrChangeProc(ls_attr);

      }

      //function 호출처 skip을 위한 flag return.
      return true;

    }

    //F4HelpReturnFIeld 프로퍼티 인경우.
    if(is_attr.UIATK === "EXT00001189"){
      //기존 입력건 초기화.
      is_attr.UIATV = "";

      //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
      oAPP.fn.attrChangeProc(is_attr);

      //function 호출처 skip을 위한 flag return.
      return true;

    }


  };  //select option2의 F4HelpReturnFIeld 프로퍼티의 팝업 호출 처리.


  //visible, editable등의 attribute 처리 전용 바인딩 필드 생성 처리.
  oAPP.fn.attrCreateAttrBindField = function(is_0015){

    //아이콘 활성여부 필드.
    is_0015.icon1_visb = false;  //바인딩(서버이벤트) 아이콘 invisible
    is_0015.icon2_visb = false;  //help(클라이언트이벤트) 아이콘 invisible

    //아이콘 src 필드.
    is_0015.icon1_src = undefined;  //바인딩(서버이벤트) 아이콘 필드
    is_0015.icon2_src = undefined;  //help(클라이언트이벤트) 아이콘 필드

    //아이콘 색상 필드.
    is_0015.icon1_color = undefined;  //바인딩(서버이벤트) 색상 필드
    is_0015.icon2_color = undefined;  //help(클라이언트이벤트) 색상 필드

    //edit 비활성 처리 여부 필드.
    is_0015.edit = false;

    //input의 F4 help 활성여부 필드.
    is_0015.showF4 = false;

    //input(ddlb,checkbox) valueState 필드.
    is_0015.valst = undefined;

    //input(ddlb,checkbox) valueStateText 필드.
    is_0015.valtx = undefined;

    is_0015.btn_icon = undefined; //버튼 아이콘 필드.

    is_0015.UIATT_ICON = undefined; //attribute 아이콘.

    //attribute 표현 UI default 비활성처리 필드.
    is_0015.inp_visb = false; //input invisible
    is_0015.sel_visb = false; //DDLB invisible
    is_0015.chk_visb = false; //checkbox invisible
    is_0015.btn_visb = false; //버튼 invisible

    is_0015.dropEnable = false;

  };  //visible, editable등의 attribute 처리 전용 바인딩 필드 생성 처리.


  
  //오류 필드 초기화 처리.
  oAPP.fn.attrClearErrorField = function(bRefresh){

    for(var i=0, l=oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){
      oAPP.attr.oModel.oData.T_ATTR[i].valst = undefined;
      oAPP.attr.oModel.oData.T_ATTR[i].valtx = undefined;
    }

    if(!bRefresh){return;}

    oAPP.attr.oModel.refresh();

  };  //오류 필드 초기화 처리.


  //DOCUMENT에 대한 ATTR 정보 구성.
  oAPP.fn.updateDOCAttrList = function(OBJID){

    //코드마스터 기준 DDLB 정보 구성.
    function lf_DDLB(CATCD, USEFLD, KEY, TEXT){

      //코드마스터 기준 DDLB 값 검색.
      if(typeof USEFLD === "undefined"){
        var lt_ITM = oAPP.DATA.LIB.T_9011.filter( a => a.CATCD === CATCD);

      }else{
        var lt_ITM = oAPP.DATA.LIB.T_9011.filter( a => a.CATCD === CATCD && a[USEFLD] === "X");
      }

      var lt_ddlb = [],
          ls_ddlb = {};

      //코드마스터 항목 기준으로 ddlb 항목 구성.
      for(var i=0, l=lt_ITM.length; i<l; i++){

        ls_ddlb.KEY  = lt_ITM[i][KEY];
        ls_ddlb.TEXT = lt_ITM[i][TEXT];
        lt_ddlb.push(ls_ddlb);
        ls_ddlb = {};

      }

      return lt_ddlb;

    } //코드마스터 기준 DDLB 정보 구성.



    //공통코드의 DOCUMENT 구성 정보 검색.
    var lt_ua003 = oAPP.DATA.LIB.T_9011.filter( a => a.CATCD === "UA003" );

    //세팅된 DOCUMENT 정보 검색.
    var lt_0015 = oAPP.attr.prev[OBJID]._T_0015.filter( a => a.OBJID === OBJID );

    //코드마스터의 UI5 Document 속성 정보 기준으로 attributes 정보 구성.
    for(var i=0, l= lt_ua003.length; i<l; i++){

      //신규라인 생성.
      var ls_0015 = oAPP.fn.crtStru0015();

      //attribute 화면제어 필드 생성.
      oAPP.fn.attrCreateAttrBindField(ls_0015);

      //세팅된 DOCUMENT 정보 존재 여부 확인.
      var ls_temp = lt_0015.find( a => a.UIATK === lt_ua003[i].ITMCD );

      //수정불가 값에 따른 EDIT 가능여부 처리.
      if(lt_ua003[i].FLD06 === ""){
        ls_0015.edit = true;
      }

      //f4 help 가능여부에 따른 f4 help 처리.
      if(lt_ua003[i].FLD04 === "X"){
        ls_0015.showF4 = true;
      }

      switch(lt_ua003[i].ITMCD){
        case "DH001021":  //UI Theme
          //DDLB visible 처리.
          ls_0015.sel_visb = true;

          //UI 테마 DDLB 구성.
          ls_0015.T_DDLB = lf_DDLB("UA007", undefined, "FLD01", "FLD01");
          break;

        case "DH001022":  //CSS Link Add
        case "DH001023":  //JS Link Add
        case "DH001026":  //Web Security Settings
          //버튼 visible 처리.
          ls_0015.btn_visb = true;
          break;

        case "DH001105":  //Wait Type
          //DDLB visible 처리.
          ls_0015.sel_visb = true;
          ls_0015.T_DDLB = lf_DDLB("UA034", "FLD03", "FLD01", "FLD02");

          break;

        case "DH001107":  //Touch style
          //DDLB visible 처리.
          ls_0015.sel_visb = true;

          //B20  Circle
          //Touch style DDLB 항목 구성.
          ls_0015.T_DDLB = [{KEY:"", TEXT:""}, 
            {KEY:"circle_ripple", TEXT:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B20", "", "", "", "")}];

          break;

        case "DH001109":  //Body Background Color
          ls_0015.showF4 = true;
          ls_0015.inp_visb = true;
          break;

        case "DH001024":  //Init not Loding Waiting
        case "DH001101":  //Whether to use Router
        case "DH001102":  //Whether to use Skeleton Screen
        case "DH001103":  //Whether to use Mobile Zoom

          ls_0015.chk_visb = true;
          break;

        case "DH001025": //Request/Task
          ls_0015.UIATV = oAPP.attr.appInfo.REQNO;

        default:
          //기본 input visible 처리.
          ls_0015.inp_visb = true;
          break;
      }

      //존재하는건인경유.
      if(ls_temp){
        oAPP.fn.moveCorresponding(ls_temp, ls_0015);

        //체크박스 처리 대상항목인경우.
        //DH001024 - Init not Loding Waiting
        //DH001101 - Whether to use Router
        //DH001102 - Whether to use Skeleton Screen
        //DH001103 - Whether to use Mobile Zoom
        if(lt_ua003[i].ITMCD === "DH001024" || lt_ua003[i].ITMCD === "DH001101" || 
          lt_ua003[i].ITMCD === "DH001102" || lt_ua003[i].ITMCD === "DH001103"){
          ls_0015.UIATV_c = false;
          if(ls_0015.UIATV === "X"){

            ls_0015.UIATV_c = true;

          }

        }

        //Request/Task
        if(lt_ua003[i].ITMCD === "DH001025"){
          ls_0015.UIATV = ls_0015.UIATV = oAPP.attr.appInfo.REQNO;          

        }

        oAPP.attr.oModel.oData.T_ATTR.push(ls_0015);

        ls_0015 = {};
        continue;
      }

      ls_0015.APPID = oAPP.attr.appInfo.APPID;
      ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
      ls_0015.UIATK = lt_ua003[i].ITMCD;
      ls_0015.UIATT = lt_ua003[i].FLD01;
      ls_0015.UIATY = "1";
      ls_0015.UIOBK = OBJID;
      ls_0015.OBJID = OBJID;
      ls_0015.UIADT = "string"
      ls_0015.UIASN = ls_0015.UIATT.toUpperCase();

      //Init not Loding Waiting 항목인경우.
      if(lt_ua003[i].ITMCD === "DH001024" || lt_ua003[i].ITMCD === "DH001101" || lt_ua003[i].ITMCD === "DH001102"){
        ls_0015.UIATV_c = false;
      }


      oAPP.attr.oModel.oData.T_ATTR.push(ls_0015);
      ls_0015 = {};

    } //코드마스터의 UI5 Document 속성 정보 기준으로 attributes 정보 구성.



    oAPP.attr.oModel.refresh(true);

    //attribute 영역 그룹핑 처리.
    oAPP.fn.setAttrModelSort();

  };  //DOCUMENT에 대한 ATTR 정보 구성.



  
  //attribute 항목의 DDLB 정보 구성.
  oAPP.fn.attrSetDDLBList = function(VALKY, UIATY, DEFVL){
    var lt_ddlb = [],
        ls_ddlb = {};

    //attribute가 이벤트건인경우.
    if(UIATY === "2"){
      //서버이벤트 항목 return.
      return oAPP.attr.T_EVT;

    }

    //attribute가 프로퍼티건인경우 enum항목에서 검색.
    var lt_0024 = oAPP.DATA.LIB.T_0024.filter( a => a.VALKY === VALKY);

    //enum 항목에 존재하지 않는경우 return.
    if(lt_0024.length === 0){return [];}

    //default value가 없는경우 ddlb에 빈라인 추가.
    if(DEFVL === ""){
      lt_ddlb.push({KEY:"", TEXT:""});
    }

    //검색한 enum항목을 기준으로 ddlb 항목 구성.
    for(var i=0, l=lt_0024.length; i<l; i++){
      ls_ddlb.KEY = lt_0024[i].VALUE;
      ls_ddlb.TEXT = lt_0024[i].VALUE;
      lt_ddlb.push(ls_ddlb);
      ls_ddlb = {};

    }

    //구성항 DDLB 항목 return
    return lt_ddlb;

  };  //attribute 항목의 DDLB 정보 구성.




  //attr 라인에 따른 style 처리.
  oAPP.fn.attrSetLineStyle = function(is_attr){

    //DOCUMENT의 ATTRIBUTE는 ICON 설정 불필요에 의해 EXIT 처리.
    if(is_attr.OBJID === "ROOT"){return;}

    //UI 타입에 따른 로직 분기.
    switch(is_attr.UIATY){
      case "1": //프로퍼티
        //바인딩 아이콘 처리

        is_attr.icon1_src = "sap-icon://fallback";
        is_attr.icon1_color = "#dec066";  //바인딩(서버이벤트) 색상 필드

        //help 아이콘 처리.
        is_attr.icon2_src = "sap-icon://sys-help";
        is_attr.icon2_color = "#40baf3";  //바인딩(서버이벤트) 색상 필드

        //프로퍼티 아이콘 처리.
        is_attr.UIATT_ICON = "sap-icon://customize";

        //프로퍼티에 바인딩 처리된건이 존재하는경우.
        if(is_attr.UIATV !== "" && is_attr.ISBND === "X"){
          is_attr.icon1_color = "yellow";  //바인딩(서버이벤트) 색상 필드
        }

        //appcontainer의 AppID 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00000030"){

          //상세보기 아이콘 처리.
          is_attr.icon1_src = "sap-icon://inspection";
          is_attr.icon2_src = "sap-icon://delete";
          return;

        }

        //appcontainer의 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00000031" ||  //AppDescript
          is_attr.UIATK === "EXT00000032" ||  //height
          is_attr.UIATK === "EXT00000033" ){  //width

          //상세보기 아이콘 처리.
          is_attr.icon1_src = undefined;
          is_attr.icon2_src = undefined;
          is_attr.icon1_visb = false;
          is_attr.icon2_visb = false;
          return;

        }


        //selectOption2의 F4HelpID, F4HelpReturnFIeld 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00001188" ||   //F4HelpID
            is_attr.UIATK === "EXT00001189"){    //F4HelpReturnFIeld

            //상세보기 아이콘 처리.
            is_attr.icon1_src = "sap-icon://inspection";
            is_attr.icon2_src = "sap-icon://delete";

            return;
        }


        //TABLE의 autoGrowing 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00001347" ||   //sap.ui.table.Table autoGrowing
          is_attr.UIATK === "EXT00001348" ||   //sap.m.Table autoGrowing
          is_attr.UIATK === "EXT00001349"){    //sap.m.List autoGrowing

          //상세보기 아이콘 처리.
          is_attr.icon1_src = undefined;
          is_attr.icon2_src = undefined;
          is_attr.icon1_visb = false;
          is_attr.icon2_visb = false;

          return;
        }

        //useBackToTopButton 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00002374" ||   //sap.m.Page useBackToTopButton
          is_attr.UIATK === "EXT00002378" ||   //sap.uxap.ObjectPageLayout useBackToTopButton
          is_attr.UIATK === "EXT00002379"){    //sap.f.DynamicPage

          //상세보기 아이콘 처리.
            is_attr.icon1_src = undefined;
            is_attr.icon2_src = undefined;
            is_attr.icon1_visb = false;
            is_attr.icon2_visb = false;

          return;
        }


        //sap.ui.core.HTML UI의 content 프로퍼티인경우.
        if(is_attr.UIATK === "AT000011858"){

          //help 아이콘 -> 상세 아이콘 처리.
          is_attr.icon2_src = "sap-icon://inspection";
          
          //drop 가능 처리.
          is_attr.dropEnable = true;

          return;

        }

        //drop 가능 처리.
        is_attr.dropEnable = true;
        

        break;

      case "2": //이벤트
        //서버이벤트 아이콘 처리.
        is_attr.icon1_src = "sap-icon://developer-settings";
        is_attr.icon1_color = "#c9e088";  //바인딩(서버이벤트) 색상 필드

        //서버 이벤트가 존재하는경우.
        if(is_attr.UIATV !== ""){
          is_attr.icon1_color = "blue";  //바인딩(서버이벤트) 색상 필드
        }

        //클라이언트이벤트 아이콘 처리.
        is_attr.icon2_src = "sap-icon://syntax";
        is_attr.icon2_color = "#acaba7";  //바인딩(클라이언트 이벤트) 색상 필드

        //클라이언트 이벤트 검색.
        var l_indx = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === "JS" );

        //클라이언트 이벤트가 존재하는경우.
        if(l_indx !== -1){
          is_attr.icon2_color = "red";  //바인딩(클라이언트 이벤트) 색상 필드
        }

        //이벤트 아이콘 처리.
        is_attr.UIATT_ICON = "sap-icon://border";

        //이벤트에 WAIT OFF 기능을 사용한 경우.
        if(is_attr.ISWIT === "X"){
          //WAIT OFF 사용건 아이콘 처리.
          is_attr.UIATT_ICON = "sap-icon://accept";

        }

        break;

      case "3": //Aggregation
        //N개의 UI가 추가되는 Aggregation인경우
        if(is_attr.ISMLB === "X"){
          //바인딩 아이콘 처리
          is_attr.icon1_src = "sap-icon://fallback";
          is_attr.icon1_color = "#dec066";  //바인딩(서버이벤트) 색상 필드
        }

        //help 아이콘 처리.
        is_attr.icon2_src = "sap-icon://warning2";

        //직접 입력 가능한 Aggregation이 아닌경우 ICON 처리.
        if(is_attr.ISSTR !== "X"){
          is_attr.UIATT_ICON = "sap-icon://color-fill";
        }
      
        //Aggregation cardinality 0:N건인경우.
        if(is_attr.ISMLB === "X"){
          //N건 아이콘 처리.
          is_attr.UIATT_ICON = "sap-icon://dimension";
        }

        //AGGREGATION에 바인딩 처리된건이 존재하는경우.
        if(is_attr.UIATV !== ""){
          is_attr.icon1_color = "green";  //바인딩(서버이벤트) 색상 필드
        }

        //drop 가능 처리.
        is_attr.dropEnable = true;

        break;

      default:
        break;

    } //UI 타입에 따른 로직 분기.


  };  //attr 라인에 따른 style 처리.




  //sap.m.UploadCollection, sap.ui.unified.FileUploader UI의 uploadUrl 프로퍼티 예외처리.
  oAPP.fn.attrUploadUrlException = function(OBJID, UIOBK){

    if(UIOBK !== "UO01180" && UIOBK !== "UO00469"){return;}

    var l_UIATK = "";
    switch (UIOBK) {
      case "UO00469": //sap.m.UploadCollection
        l_UIATK = "AT000006316";
        break;

      case "UO01180": //sap.ui.unified.FileUploader
        l_UIATK = "AT000013501";
        break;
    
      default:
        return;

    }

    //uploadUrl 프로퍼티 수집건 존재여부 확인.
    var ls_0015 = oAPP.attr.prev[OBJID]._T_0015.find( a => a.UIATK === l_UIATK );

    //수집건이 존재하는경우.
    if(ls_0015){
      //바인딩 처리된경우 EXIT.
      if(ls_0015.UIATV !== "" && ls_0015.ISBND === "X"){
        return;
      }

      //수집건은 존재하나 값이 존재하지 않는경우.
      if(ls_0015.UIATV === ""){
        ls_0015.UIAT = "/zu4a_srs/" + oAPP.attr.appInfo.APPID.toLocaleLowerCase();
        return;
      }

      //uploadUrl 프로퍼티의 값이 U4A에서 기본 세팅한 값이 아닌경우 EXIT.
      if(ls_0015.UIATV.indexOf("/zu4a_srs/") === -1){
        return;
      }

      // '/zu4a_srs/' + appliciaton id 조합 에서 /zu4a_srs/ 부분을 제외
      var l_appid = ls_0015.UIATV.replace(/\/zu4a_srs\//i, "").toUpperCase();

      //기존의 프로퍼티에 등록한 application id와 현재 application id가 다른경우.
      if(l_appid !== oAPP.attr.appInfo.APPID){
        //현재 application id로 매핑 처리.
        ls_0015.UIAT = "/zu4a_srs/" + oAPP.attr.appInfo.APPID.toLocaleLowerCase();
      }

      return;
    }

    //uploadUrl property 정보 검색.
    var ls_0023 = oAPP.DATA.LIB.T_0023.find( a=> a.UIATK === l_UIATK );

    ls_0015 = oAPP.fn.crtStru0015();

    oAPP.fn.moveCorresponding(ls_0023, ls_0015);

    var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === UIOBK );

    ls_0015.APPID = oAPP.attr.appInfo.APPID;
    ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
    ls_0015.OBJID = OBJID;
    ls_0015.UILIK = ls_0022.UILIK;
    ls_0015.UIATV = "/zu4a_srs/" + oAPP.attr.appInfo.APPID.toLocaleLowerCase();


    //uploadUrl 프로퍼티 수집 처리.
    oAPP.attr.prev[OBJID]._T_0015.push(ls_0015);


  };  //sap.m.UploadCollection, sap.ui.unified.FileUploader UI의 uploadUrl 프로퍼티 예외처리.




  //서버 이벤트 항목 검색.
  oAPP.fn.getServerEventList = function(f_cb){

    //서버이벤트 호출전 lock처리.
    oAPP.fn.designAreaLockUnlock(true);

    var lt_ddlb = [{KEY:"", TEXT:"", DESC:""}];

    //클래스명 서버 전송 데이터에 구성.
    var oFormData = new FormData();
    oFormData.append("CLSNM", oAPP.attr.appInfo.CLSID);

    //sendAjax파라메터 리스트
    //sPath, 
    //oFormData, 
    //fn_success, 
    //bIsBusy, 
    //bIsAsync, 
    //meth,   <-POST, GET(DEFAULT POST)
    //fn_error, 
    //bIsBlob <- true인경우 파일전송
    //컨트롤러 클래스의 서버 이벤트 항목 정보 검색.
    sendAjax(oAPP.attr.servNm + "/getServerEventList", oFormData, function(param){

      //lock 해제 처리.
      oAPP.fn.designAreaLockUnlock();

      if(param.RETCD !== "S"){return;}

      var ls_evt_DDLB = {};

      for(var i=0, l=param.EVTLT.length; i<l; i++){

        ls_evt_DDLB.KEY = ls_evt_DDLB.TEXT = param.EVTLT[i].EVTNM;
        ls_evt_DDLB.DESC = param.EVTLT[i].DESC;
        lt_ddlb.push(ls_evt_DDLB);
        ls_evt_DDLB = {};

      }

      if(!f_cb){return;}

      f_cb(lt_ddlb);

    }, "", true, "POST", function(e){
      //오류 발생시 lock 해제.
      oAPP.fn.designAreaLockUnlock();

    }); //컨트롤러 클래스의 서버 이벤트 항목 정보 검색.
      

  };  //서버 이벤트 항목 검색.




  //선택한 UI에 해당하는 attribute 리스트 업데이트 처리.
  oAPP.fn.updateAttrList = function(UIOBK, OBJID, UIATK, TYPE, f_cb){

    //이전 선택건 초기화 처리.
    oAPP.attr.ui.oRTab1.removeSelections();

    oAPP.attr.oModel.oData.T_ATTR = [];

    //DOCUMENT를 선택한 경우.
    if(OBJID === "ROOT"){

      //DOCUMENT ATTRIBUTE LIST 구성.
      oAPP.fn.updateDOCAttrList(OBJID);
      
      //attribute 영역 선택처리(UIATK가 입력된경우 선택처리)
      oAPP.fn.setAttrFocus(UIATK, TYPE, f_cb);

      //화면 잠금 해제 처리.
      oAPP.fn.designAreaLockUnlock();
      return;
      
    }
    
    //서버 이벤트 항목 검색.
    oAPP.fn.getServerEventList(lf_setAttr);

    function lf_setAttr(T_EVT){

      oAPP.attr.oModel.oData.T_ATTR = [];

      oAPP.attr.T_EVT = T_EVT;

      //file uploader UI의 uploaderUrl 프로퍼티 예외처리.
      oAPP.fn.attrUploadUrlException(OBJID, UIOBK);


      //UI에 해당하는 property, event, Aggregation 정보 얻기.
      var lt_0023 = oAPP.DATA.LIB.T_0023.filter( a => a.UIOBK === UIOBK && a.ISDEP !== "X" && a.UIATY !== "4");

      //얻은 정보 기준으로 attribute 항목 구성.
      for(var i=0, l=lt_0023.length; i<l; i++){

        var ls_0015 = oAPP.fn.crtStru0015();
        oAPP.fn.moveCorresponding(lt_0023[i], ls_0015);

        ls_0015.APPID = oAPP.attr.appInfo.APPID;
        ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
        ls_0015.OBJID = OBJID;
        ls_0015.UIATV = lt_0023[i].DEFVL;

        ls_0015.comboval = "";

        //visible, editable등의 attribute 처리 전용 바인딩 필드 생성 처리.
        oAPP.fn.attrCreateAttrBindField(ls_0015);

        //아이콘 활성여부 처리.
        ls_0015.bind_visb = true;  //바인딩 아이콘 visible
        ls_0015.help_visb = true;  //help 아이콘 visible


        //input or DDLB 활성여부 처리.
        if(lt_0023[i].ISLST === "X" || ls_0015.UIATY === "2"){
        //DDLB출력건인경우 DDLB visible
          ls_0015.sel_visb = true;

          //DDLB 항목 구성.
          ls_0015.T_DDLB = oAPP.fn.attrSetDDLBList(lt_0023[i].VALKY, ls_0015.UIATY, lt_0023[i].DEFVL);

        }else if(lt_0023[i].ISLST === ""){
          //DDLB출력건이 아닌경우 input visible
          ls_0015.inp_visb = true;

        }

        //Aggregation이 아닌경우 입력필드 입력 가능 처리.
        oAPP.fn.setAttrEditable(ls_0015);

        //aggregation이 아닌경우 default 입력가능 처리.
        if(ls_0015.UIATY !== "3"){
          ls_0015.edit = true;
        }

        //DEFAULT 아이콘 활성 처리.
        ls_0015.icon1_visb = true;
        ls_0015.icon2_visb = true;


        oAPP.attr.oModel.oData.T_ATTR.push(ls_0015);

        //직접 입력 가능한 Aggregation이 아닌경우 skip.
        if(lt_0023[i].ISSTR !== "X"){continue;}

        //직접입력 가능한 Aggregation인경우 이전 구조 복사.
        ls_0015 = Object.assign({},ls_0015);

        //직접입력 가능한 Aggregation 키 변경.
        ls_0015.UIATK = ls_0015.UIATK + "_1";
        ls_0015.UIATY = "1";

        ls_0015.edit = true;

        //바인딩 아이콘 처리
        ls_0015.icon1_src = "sap-icon://fallback";
        ls_0015.icon1_color = "#dec066";  //바인딩 색상 필드

        //help 아이콘 처리.
        ls_0015.icon2_src = "sap-icon://sys-help";
        ls_0015.icon2_color = "#40baf3";  //help 색상 필드

        //PROPERTY 아이콘 처리.
        ls_0015.UIATT_ICON = "sap-icon://customize";


        oAPP.attr.oModel.oData.T_ATTR.push(ls_0015);

      } //얻은 정보 기준으로 attribute 항목 구성.

      //embed Aggregation 정보 검색.
      if(OBJID !== "APP"){
        if(typeof oAPP.attr.prev[OBJID] === "undefined" || typeof oAPP.attr.prev[OBJID]._T_0015 === "undefined"){
          parent.REMOTE.getCurrentWindow().webContents.openDevTools();
          alert(oAPP.attr.appInfo.APPID + " " + OBJID);
        }

        var ls_0015 = oAPP.fn.crtStru0015();
        oAPP.fn.moveCorresponding(oAPP.attr.prev[OBJID]._T_0015.find( a=> a.OBJID === OBJID && a.UIATY === "6"), ls_0015);

        //visible, editable등의 attribute 처리 전용 바인딩 필드 생성 처리.
        oAPP.fn.attrCreateAttrBindField(ls_0015);

        //checkbox visible
        ls_0015.chk_visb = true;

        //체크박스 선택 처리.
        ls_0015.UIATV_c = true;

        //편집 불가 처리.
        ls_0015.edit = false;

        //embed Aggregation 정보 추가.
        oAPP.attr.oModel.oData.T_ATTR.push(ls_0015);
        

      }

      //대상 UI에 매핑되어있는 프로퍼티, 이벤트 항목에 대한건 ATTRIBUTE영역에 매핑.
      for(var i=0, l=oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){

        if(typeof oAPP.attr.prev[OBJID] === "undefined" || typeof oAPP.attr.prev[OBJID]._T_0015 === "undefined"){
          parent.REMOTE.getCurrentWindow().webContents.openDevTools();
          alert(oAPP.attr.appInfo.APPID + " " + OBJID);
        }

        //대상 UI에 해당하는 입력건 검색.
        var ls_0015 = oAPP.attr.prev[OBJID]._T_0015.find( a => a.UIATK === oAPP.attr.oModel.oData.T_ATTR[i].UIATK && 
          a.UIATY === oAPP.attr.oModel.oData.T_ATTR[i].UIATY );

        if(typeof ls_0015 === "undefined"){continue;}

        oAPP.fn.moveCorresponding(ls_0015, oAPP.attr.oModel.oData.T_ATTR[i]);

        // //입력값 매핑.
        // oAPP.attr.oModel.oData.T_ATTR[i].UIATV = ls_0015.UIATV;
        // oAPP.attr.oModel.oData.T_ATTR[i].ADDSC = ls_0015.ADDSC;
        // oAPP.attr.oModel.oData.T_ATTR[i].ISWIT = ls_0015.ISWIT;
        // oAPP.attr.oModel.oData.T_ATTR[i].ISSPACE = ls_0015.ISSPACE;

        //이벤트인경우 설정된 이벤트가 존재시.
        if(ls_0015.UIATY === "2" && ls_0015.UIATV !== ""){
          //서버이벤트 항목에 해당하는지 여부 확인.
          if(oAPP.attr.T_EVT.findIndex( a=> a.KEY === ls_0015.UIATV ) === -1 ){
            //서버이벤트 항목에 존재하지 않는 이벤트인경우 이벤트 강제 추가.
            oAPP.attr.T_EVT.push({KEY:ls_0015.UIATV, TEXT:ls_0015.UIATV, DESC:""});

          }

        }

        //바인딩처리된경우 하위 로직 수행.
        if(ls_0015.ISBND !== "X"){continue;}

        // //바인딩 구성정보 매핑.
        // oAPP.attr.oModel.oData.T_ATTR[i].ISBND = ls_0015.ISBND;
        // oAPP.attr.oModel.oData.T_ATTR[i].MPROP = ls_0015.MPROP;

        //프로퍼티의 DDLB 항목에서 바인딩 처리한경우.
        if(oAPP.attr.oModel.oData.T_ATTR[i].UIATY === "1" && typeof oAPP.attr.oModel.oData.T_ATTR[i].T_DDLB !== "undefined"){
          //DDLB항목에 바인딩한 정보 추가.
          oAPP.attr.oModel.oData.T_ATTR[i].T_DDLB.push({KEY:ls_0015.UIATV, TEXT:ls_0015.UIATV, ISBIND:"X"});
        }

        // //입력 비활성 처리.
        // oAPP.attr.oModel.oData.T_ATTR[i].edit = false;

        // //입력필드 활성화 처리.
        // oAPP.attr.oModel.oData.T_ATTR[i].inp_visb = true;

        // //checkbox 비활성 처리.
        // oAPP.attr.oModel.oData.T_ATTR[i].chk_visb = false;

        // //버튼 비활성 처리.
        // oAPP.attr.oModel.oData.T_ATTR[i].btn_visb = false;

        // //ddlb 비활성 처리.
        // oAPP.attr.oModel.oData.T_ATTR[i].sel_visb = false;


      } //대상 UI에 매핑되어있는 프로퍼티, 이벤트 항목에 대한건 ATTRIBUTE영역에 매핑.


      //attr 입력 가능 여부 처리.
      for(var i=0, l=oAPP.attr.oModel.oData.T_ATTR.length; i<l; i++){

        //F4 HELP 버튼 활성여부 처리.
        oAPP.fn.attrSetShowValueHelp(oAPP.attr.oModel.oData.T_ATTR[i]);

        //입력필드 입력 가능여부 처리.
        oAPP.fn.setAttrEditable(oAPP.attr.oModel.oData.T_ATTR[i]);

        //icon 처리.
        oAPP.fn.setExcepAttr(oAPP.attr.oModel.oData.T_ATTR[i]);
        
        //attr 라인에 따른 style 처리.
        oAPP.fn.attrSetLineStyle(oAPP.attr.oModel.oData.T_ATTR[i]);

      }
      
      //autoGrowing 프로퍼티 입력값 여부에 따른 attr 잠금처리.
      oAPP.fn.attrSetAutoGrowingException();

      //dropAble 프로퍼티 입력값 여부에 따른 attr 잠금처리.
      oAPP.fn.attrSetDropAbleException();

      //모델 갱신 처리.
      oAPP.attr.oModel.refresh(true);

      //attribute 영역 그룹핑 처리.
      oAPP.fn.setAttrModelSort();

      //attribute 영역 선택처리(UIATK가 입력된경우 선택처리)
      oAPP.fn.setAttrFocus(UIATK, TYPE, f_cb);

    }

  };  //선택한 UI에 해당하는 attribute 리스트 업데이트 처리.




  //attribute 영역 그룹핑 처리.
  oAPP.fn.setAttrModelSort = function(){

    var l_bind = oAPP.attr.ui.oRTab1.getBinding("items");

    //attribute 영역 그룹핑 처리.
    l_bind.sort([new sap.ui.model.Sorter("UIATY", false, function(oContext){
      var text, key = oContext.getProperty("UIATY");

      switch(key){
        case "1":
          text = "Properties";
          break;

        case "2":
          text = "Events";
          break;

        case "3":
          text = "Aggregations";
          break;

        case "6":
          text = "Embedded Aggregations";
          break;
      }

      return {key:key, text:text};

    }),new sap.ui.model.Sorter("UIATK", false)]);

  };  //attribute 영역 그룹핑 처리.




  //UI Info 영역 정보 구성.
  oAPP.fn.setUIInfo = function(is_tree){

    var ls_uiinfo = {};

    //UI명.
    ls_uiinfo.OBJID_bf = ls_uiinfo.OBJID = is_tree.OBJID;

    //UI OBJECT KEY.
    ls_uiinfo.UIOBK = is_tree.UIOBK;
    

    //DOCUMENT, APP인경우 UI명 변경 불가 처리.
    ls_uiinfo.ENAB01 = true;
    if(is_tree.OBJID === "ROOT" || is_tree.OBJID === "APP"){
      ls_uiinfo.edit01 = false;
    }

    //UI에 해당하는 DESCRIPT 정보.
    ls_uiinfo.DESC = oAPP.fn.getDesc(is_tree.OBJID);

    //UI5 library Reference정보 구성.
    ls_uiinfo.UILIB = is_tree.UILIB;
    
    //UI 대문자.
    ls_uiinfo.UIFND = is_tree.UIFND;

    ls_uiinfo.vis01 = false;  //UI Library & sample 비활성.

    ls_uiinfo.vis02 = false;  //attribute 초기화 비활성.

    ls_uiinfo.src = is_tree.UICON;  //아이콘 바인딩 필드.

    //DOCUMENT가 아닌경우(UI인경우)만 UI정보 검색.
    if(is_tree.OBJID !== "ROOT"){
      //UI Library & sample 활성.
      ls_uiinfo.vis01 = true;

      //attribute 초기화 활성.
      ls_uiinfo.vis02 = true;

    }

    //display상태인경우.
    if(oAPP.attr.oModel.oData.IS_EDIT === false){
      //attribute 초기화 비활성.
      ls_uiinfo.vis02 = false;
      
    }

    oAPP.attr.oModel.oData.uiinfo = ls_uiinfo;
    oAPP.attr.oModel.refresh();

  };  //UI Info 영역 정보 구성.




  //UI에 바인딩처리된경우 부모 UI에 해당 정보 매핑.
  oAPP.fn.setModelBind = function(oUi){

    //부모 model 바인딩 정보에 해당 UI 매핑 처리 function.
    function lf_getParentAggrModel(UIATV, EMBED_AGGR, parent){

      if(!parent){return;}

      //대상 Aggregation에 N건 바인딩 처리가 안된경우 상위 부모 탐색.
      if(!parent._MODEL[EMBED_AGGR]){

        //부모가 sap.ui.table.Column인경우 sap.ui.table.Table(TreeTable)의
        //row Aggregation에 N건 바인딩 처리됐는지 여부 판단.
        if(parent.getMetadata()._sClassName === "sap.ui.table.Column"){

          //ui table(tree table의 columns에 바인딩처리가 안된경우.)
          if(!parent.__PARENT._MODEL["coloums"]){
            return lf_getParentAggrModel(UIATV, "rows", parent.__PARENT);
          }

        }

        return lf_getParentAggrModel(UIATV, parent._EMBED_AGGR, parent.__PARENT);
      }

      //대상 Aggregation에 N건 바인딩 Path가 다른경우 상위 부모 탐색.
      if(oAPP.fn.chkBindPath(parent._MODEL[EMBED_AGGR], UIATV) !== true){
        return lf_getParentAggrModel(UIATV, parent._EMBED_AGGR, parent.__PARENT);
      }

      //model 정보 수집된건이 없는경우.
      if(!parent._BIND_AGGR[EMBED_AGGR]){
        //구조 생성.
        parent._BIND_AGGR[EMBED_AGGR] = [];
      }

      //이미 model정보가 수집되어있는경우 exit.
      if(parent._BIND_AGGR[EMBED_AGGR].findIndex( a=> a === oUi) !== -1){
        return true;
      }

      //현재 UI 수집처리.
      parent._BIND_AGGR[EMBED_AGGR].push(oUi);
      return true;

    } //부모 model 바인딩 정보에 해당 UI 매핑 처리 function.



    //현재 UI의 property에 바인딩된 정보 얻기.
    var lt_0015 = oUi._T_0015.filter( a => a.ISBND === "X" && a.UIATV !== "" );

    //바인딩된 정보가 존재하지 않는경우 exit.
    if(lt_0015.length === 0){return;}


    //바인딩된 정보를 기준으로 부모를 탐색하며 N건 바인딩 여부 확인.
    for(var i=0,l=lt_0015.length; i<l; i++){
      
      //N건 바인딩 처리되어 parent에 현재 UI를 추가한 경우 exit.
      if(lf_getParentAggrModel(lt_0015[i].UIATV, oUi._EMBED_AGGR, oUi.__PARENT) === true){
        return;
      }

    }

  };  //UI에 바인딩처리된경우 부모 UI에 해당 정보 매핑.




  //Aggregation에 N건 모델 바인딩 처리시 모델정보 ui에 매핑 처리.
  oAPP.fn.setAggrBind = function(oUI, UIATT, UIATV){

    //모델명, 바인딩 OTAB명이 입력된 경우.
    if(UIATT && UIATV){
      oUI._MODEL[UIATT] = UIATV;
      return;
    }

    if(oUI._T_0015.length === 0){return;}

    //Aggregation에 바인딩처리된 정보 얻기.
    var lt_0015 = oUI._T_0015.filter( a => a.UIATY === "3" && a.ISBND === "X" && a.UIATV !== "" );

    if(lt_0015.length === 0){return;}

    for(var i=0, l=lt_0015.length; i<l; i++){

      oUI._MODEL[lt_0015[i].UIATT] = lt_0015[i].UIATV;

    }

  };  //Aggregation에 N건 모델 바인딩 처리시 모델정보 ui에 매핑 처리.




  //대상 UI로부터 부모를 탐색하며 n건 바인딩 값 얻기.
  oAPP.fn.getParentAggrBind = function(oUI, UIATT){

    if(!oUI){return;}

    if(!oUI._MODEL[UIATT]){

      var l_meta = oUI.getMetadata();

      //sap.ui.table.Column의 template Aggregation에서 부모를 탐색하는경우.
      if(typeof l_meta !== "undefined" &&
         l_meta._sClassName === "sap.ui.table.Column" &&
         typeof oUI.__PARENT !== "undefined" &&
         UIATT === "template"){

        l_meta = oUI.__PARENT.getMetadata();

        //sap.ui.table.Column의 상위 부모가 sap.ui.table.Table이라면.
        if(typeof l_meta !== "undefined" &&
         l_meta._sClassName === "sap.ui.table.Table" ||
         l_meta._sClassName === "sap.ui.table.TreeTable"){

          //상위 부모의 columns에 바인딩 처리안된경우 rows aggregation으로 판단.
          if(typeof oUI.__PARENT._MODEL["columns"] === "undefined"){
            //rows에 바인딩 처리됐는지 확인.
            return oAPP.fn.getParentAggrBind(oUI.__PARENT, "rows");
          }

        }

      }

      return oAPP.fn.getParentAggrBind(oUI.__PARENT, oUI._EMBED_AGGR);
    }

    //모델에 n건 바인딩이 구성된 경우.
    if(oUI._MODEL[UIATT] !== ""){
      return oUI._MODEL[UIATT];
    }

    return oAPP.fn.getParentAggrBind(oUI.__PARENT, oUI._EMBED_AGGR);

  };  //대상 UI로부터 부모를 탐색하며 n건 바인딩 값 얻기.




  //부모 path로부터 파생된 child path 여부 확인.
  oAPP.fn.chkBindPath = function(parent, child){
    //부모 path를 -로 분리.
    if(typeof parent === "undefined" || parent === ""){return;}
    if(typeof child === "undefined" || child === ""){return;}

    var l_sp1 = parent.split("-");

    //CHILD path를 -로 분리.
    var l_sp2 = child.split("-");

    //부모 path 부분만 남김.
    l_sp2.splice(l_sp1.length);

    //부모 path로부터 파생된 child path인경우.
    if(parent === l_sp2.join("-")){
      //부모 path로부터 파생됨 flag return
      return true;
    }

  };  //부모 path로부터 파생된 child path 여부 확인.




  //Description 세팅.
  oAPP.fn.setDesc = function(OBJID, desc){

    var l_desc = oAPP.DATA.APPDATA.T_DESC.find( a=> a.OBJID === OBJID );

    //존재하지 않는경우.
    if(typeof l_desc === "undefined"){
      //해당 OBJID에 따른 DESCRIPTION 생성 처리.
      l_desc = {};
      l_desc.OBJID = OBJID;
      oAPP.DATA.APPDATA.T_DESC.push(l_desc);

    }

    //DESCRIPTION 초기화.
    l_desc.DESCPT = [];


    //입력 DESCRIPTION의 글자수가 255자 이하인경우.
    if(desc.length <= 255){
      //입력 DESCRIPTION 매핑 후 exit.
      l_desc.DESCPT = [{LINE:desc}];
      return;
    }

    //255자가 넘는경우.
    var l_txt = desc,
        ls_stru= {};

    //255자리씩 끊으며 DESCPT에 수집 처리.
    while(l_txt !== ""){
      ls_stru.LINE = l_txt.substr(0,255);
      l_desc.DESCPT.push(ls_stru);
      ls_stru = {};

      l_txt = l_txt.substr(255);

      if(l_txt === ""){
        return;
      }

    }

  }; //Description 세팅.




  //Description 삭제.
  oAPP.fn.delDesc = function(OBJID){

    //OBJID의 위치 검색.
    var l_indx = oAPP.DATA.APPDATA.T_DESC.findIndex( a=> a.OBJID === OBJID );

    //못찾은경우 EXIT.
    if(l_indx === -1){return;}

    //찾은경우 해당 라인 삭제.
    oAPP.DATA.APPDATA.T_DESC.splice(l_indx,1);


  };  //Description 삭제.




  //Description 검색.
  oAPP.fn.getDesc = function(OBJID){

    var l_desc = oAPP.DATA.APPDATA.T_DESC.find( a=> a.OBJID === OBJID );

    if(typeof l_desc === "undefined"){
      return "";
    }

    var l_txt = "";

    for(var i=0, l=l_desc.DESCPT.length; i<l; i++){
      l_txt += l_desc.DESCPT[i].LINE;
    }

    return l_txt;

  }; //Description 검색.




  //Description 복사.
  oAPP.fn.copyDesc = function(ORG_OBJID, OBJID){

    //원본 OBJID에 해당하는 Description 정보 존재 여부 확인.
    var l_desc = oAPP.fn.getDesc(ORG_OBJID);

    //Description 정보가 존재하지 않는경우 exit.
    if(l_desc === ""){return;}


    //원본 Description을 복사대상건으로 복사 처리.
    oAPP.fn.setDesc(OBJID, l_desc);


  };  //Description 복사.




  //Description의 OBJECT ID 변경 처리.
  oAPP.fn.changeDescOBJID = function(OBJID, OLDOBJID){

    //원본 OBJID에 해당하는 Description 정보 존재 여부 확인.
    var l_desc = oAPP.DATA.APPDATA.T_DESC.find( a=> a.OBJID === OLDOBJID );

    //Description 정보가 존재하지 않는경우 exit.
    if(typeof l_desc === "undefined"){return;}

    //변경하고자 하는 OBJECT ID로 매핑.
    l_desc.OBJID = OBJID;


  };  //Description OBJECT ID 변경 처리.




  // attribute 예외처리
  oAPP.fn.setExcepAttr = function(is_attr, is_0023){

    //appcontainer의 AppID 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00000030"){

      //상세보기 아이콘 처리.
      is_attr.icon1_src = "sap-icon://inspection";
      is_attr.icon2_src = "sap-icon://delete";

      return;
    }


    //appcontainer의 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00000031" ||  //AppDescript
       is_attr.UIATK === "EXT00000032" ||  //height
       is_attr.UIATK === "EXT00000033" ){  //width

       //상세보기 아이콘 처리.
       is_attr.icon1_src = undefined;
       is_attr.icon2_src = undefined;
       is_attr.icon1_visb = false;
       is_attr.icon2_visb = false;
       return;

    }

    //selectOption2의 F4HelpID, F4HelpReturnFIeld 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00001188" ||   //F4HelpID
       is_attr.UIATK === "EXT00001189"){    //F4HelpReturnFIeld

       //상세보기 아이콘 처리.
       is_attr.icon1_src = "sap-icon://inspection";
       is_attr.icon2_src = "sap-icon://delete";

       return;
    }


    //TABLE의 autoGrowing 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00001347" ||   //sap.ui.table.Table autoGrowing
       is_attr.UIATK === "EXT00001348" ||   //sap.m.Table autoGrowing
       is_attr.UIATK === "EXT00001349"){    //sap.m.List autoGrowing

       //상세보기 아이콘 처리.
       is_attr.icon1_src = undefined;
       is_attr.icon2_src = undefined;
       is_attr.icon1_visb = false;
       is_attr.icon2_visb = false;

       return;
    }


    //useBackToTopButton 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00002374" ||   //sap.m.Page useBackToTopButton
       is_attr.UIATK === "EXT00002378" ||   //sap.uxap.ObjectPageLayout useBackToTopButton
       is_attr.UIATK === "EXT00002379"){    //sap.f.DynamicPage

      //상세보기 아이콘 처리.
       is_attr.icon1_src = undefined;
       is_attr.icon2_src = undefined;
       is_attr.icon1_visb = false;
       is_attr.icon2_visb = false;

      return;
    }


    //sap.ui.core.HTML UI의 content 프로퍼티인경우.
    if(is_attr.UIATK === "AT000011858"){

      //help 아이콘 -> 상세 아이콘 처리.
      is_attr.icon2_src = "sap-icon://inspection";

      return;

    }


    //bind 처리된건인경우.
    if(is_attr.ISBND === "X"){

      //바인딩 아이콘 처리
      is_attr.icon1_src = "sap-icon://complete";
      is_attr.icon1_color = "#66ff66";  //바인딩(서버이벤트) 색상 필드

      return;

    }


    //이벤트건인경우.
    if(is_attr.UIATY === "2"){
       //이벤트가 설정되어있다면 아이콘 색상 처리.
       if(is_attr.UIATV !== ""){
        is_attr.icon1_color = "#66ff66";  //바인딩(서버이벤트) 색상 필드
       }

       //클라이언트 이벤트 존재여부 확인.
       var l_find = oAPP.DATA.APPDATA.T_CEVT.find( a=> a.OBJID === is_attr.OBJID + is_attr.UIASN );

       if(typeof l_find !== "undefined"){

         //클라이언트 이벤트 아이콘, 색상 처리.
         is_attr.icon2_src = "sap-icon://syntax";
         is_attr.icon2_color = "#66ff66";  //바인딩(서버이벤트) 색상 필드

       }

    }

  };  // attribute 예외처리




  //attribute 입력 가능 여부 설정.
  oAPP.fn.setAttrEditable = function(is_attr){

    //default 입력 불가 처리.
    is_attr.edit = false;

    //편집 가능 상태가 아닌경우 exit.
    if(oAPP.attr.oModel.oData.IS_EDIT !== true){
      return;
    }

    //Aggregation인경우 exit.
    if(is_attr.UIATY === "3"){
      return;
    }

    //Embed Aggregation인경우 exit.
    if(is_attr.UIATY === "6"){
      return;
    }

    //바인딩 처리가 된경우 exit.
    if(is_attr.ISBND === "X"){
      return;
    }

    //sap.ui.core.HTML UI의 content 프로퍼티인경우 exit.
    if(is_attr.UIATK === "AT000011858"){
      return;
    }


    //selectOption2의 F4HelpID, F4HelpReturnFIeld 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00001188" ||   //F4HelpID
       is_attr.UIATK === "EXT00001189" ||   //F4HelpReturnFIeld
       is_attr.UIATK === "EXT00001161" ){   //value

       return;
    }


    //appcontainer의 AppID 프로퍼티인경우.
    if(is_attr.UIATK === "EXT00000030" || //AppID
       is_attr.UIATK === "EXT00000031" ){ //AppDescript
      return;
    }


    //sap.m.Tree, sap.ui.table.TreeTable의 parent, child 프로퍼티는 입력 불가 처리
    if(is_attr.UIATK === "EXT00001190" ||  //sap.m.Tree의 parent
       is_attr.UIATK === "EXT00001191" ||  //sap.m.Tree의 child
       is_attr.UIATK === "EXT00001192" ||  //sap.ui.table.TreeTable의 parent
       is_attr.UIATK === "EXT00001193" ){  //sap.ui.table.TreeTable의 child
       return;

    }


    //default 입력 가능 처리.
    is_attr.edit = true;

  };  //attribute 입력 가능 여부 설정.




  //ATTRIBUTE FOCUS 처리.
  oAPP.fn.setAttrFocus = function(UIATK, TYPE, f_cb){
    
    //UI Attribute Internal Key가 입력안된경우 exit.
    if(typeof UIATK === "undefined"){return;}

    //attribute 정보 얻기.
    var lt_item = oAPP.attr.ui.oRTab1.getItems();

    //attribute 정보가 없는경우 exit.
    if(lt_item.length === 0){return;}

    
    for(var i=0, l=lt_item.length; i<l; i++){
      //대상 라인의 바인딩 정보 얻기.
      var l_ctxt = lt_item[i].getBindingContext();
      if(typeof l_ctxt === "undefined"){continue;}

      //UIATK 값 얻기.
      var l_attr = l_ctxt.getProperty();
      if(!l_attr){continue;}

      //focus 대상 UIATK가 아닌경우 다음건 확인.
      if(l_attr.UIATK !== UIATK){continue;}

      //default value state 처리.
      l_attr.valst = undefined;
      l_attr.valtx = undefined;        

      //type에 따른 value state 처리.
      switch(TYPE){
        case "E":
          l_attr.valst = "Error";
          break;

        case "S":
          l_attr.valst = "Success";
          break;

        case "I":
          l_attr.valst = "Information";
          break;

        case "W":
          l_attr.valst = "Warning";
          break;

        default:
          break;
      }

      //focus 처리대상건인경우 해당 라인 focus 처리.
      oAPP.attr.ui.oRTab1.setSelectedItem(lt_item[i]);

      var l_pos;

      //활성화된 ui에 따른 ui 위치 값 매핑.
      switch(true){
        case l_attr.inp_visb: //input이 활성화된경우.
          l_pos = 0;
          break;

        case l_attr.sel_visb: //ddlb가 활성화된경우.
          l_pos = 1;
          break;

        case l_attr.btn_visb: //button이 활성화된경우.
          l_pos = 2;
          break;

        case l_attr.chk_visb: //checkbox가 활성화된경우.
          l_pos = 3;
          break;

        default:
          return;
      }
      
      //해당 라인의 활성화된 입력필드에 focus 처리.
      setTimeout(() => {
        lt_item[i].mAggregations.cells[1].mAggregations.items[l_pos].focus();

        var l_dom = lt_item[i].mAggregations.cells[1].mAggregations.items[l_pos].getDomRef();
        if(l_dom){
          l_dom.scrollIntoView(true);
        }

        //callback function이 존재하지 않는경우 exit.
        if(typeof f_cb === "undefined"){return;}

        //callback function 수행 처리.
        f_cb();

      }, 0);

      break;

    }

    //타입이 존재하지 않는경우 exit.
    if(typeof TYPE === "undefined" || TYPE === ""){return;}

    //타입이 존재하는경우 모델 갱신 처리.
    oAPP.attr.oModel.refresh();

  };  //ATTRIBUTE FOCUS 처리.



  /************************************************************************
   * DOCUMENT 영역의 ATTRIBUTE 갱신 처리.
   * **********************************************************************
   * @param {array} it_attr - document영역의 갱신대상 attribute항목
   * 예) [{"UIATK":"DH001020","UIATV":"00003"},...]
   ************************************************************************/
  oAPP.fn.attrUpdateDocAttr = function(it_attr){

    //갱신처리 attribute 정보가 존재하지 않는경우 exit.
    if(it_attr.length === 0){return;}

    //갱신처리 대상건을 기준으로 ROOT에 수집된 attribute 갱신처리.
    for(var i=0, l=it_attr.length; i<l; i++){

      switch(it_attr[i].UIATK){
        case "DH001020":  //Web Application Version
          oAPP.attr.appInfo.APPVR = it_attr[i].UIATV;
          break;

        case "DH001025":  //Request/Task
          oAPP.attr.appInfo.REQNR = it_attr[i].UIATV;
          oAPP.attr.appInfo.REQNO = it_attr[i].UIATV;
          break;

        case "DH001140":  //Change User
          oAPP.attr.appInfo.AEUSR = it_attr[i].UIATV;
          break;

        case "DH001150":  //Change Date
          oAPP.attr.appInfo.AEDAT = it_attr[i].UIATV;
          break;

        case "DH001160":  //Change Time
          oAPP.attr.appInfo.AETIM = it_attr[i].UIATV;
          break;
      }

      //기존에 수집되어있는 ATTRIBUTE항목 확인.
      var ls_attr = oAPP.attr.prev.ROOT._T_0015.find( a=> a.UIATK === it_attr[i].UIATK );

      //기존 수집 항목의 값을 갱신 처리.
      if(ls_attr){
        ls_attr.UIATV = it_attr[i].UIATV;
        continue;
      }

      //기존에 수집된 항목에 존재하지 않는경우 코드마스터에서 document attr정보 얻기.
      var ls_ua003 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA003" && a.ITMCD === it_attr[i].UIATK );
      
      //코드마스터에 존재하지 않는경우 skip.
      if(!ls_ua003){continue;}

      //기존에 수집된 항목에 존재하지 않는경우 신규 라인 생성 처리.
      ls_attr = oAPP.fn.crtStru0015();      

      ls_attr.APPID = oAPP.attr.appInfo.APPID;
      ls_attr.GUINR = oAPP.attr.appInfo.GUINR;
      ls_attr.OBJID = "ROOT";
      ls_attr.UIATK = it_attr[i].UIATK;
      ls_attr.UIATV = it_attr[i].UIATV;
      ls_attr.UIOBK = "ROOT";
      ls_attr.UIATT = ls_ua003.FLD01;
      ls_attr.UIASN = ls_attr.UIATT.toUpperCase();
      ls_attr.UIASN = ls_attr.UIASN.substr(0,18);
      ls_attr.UIADT = "string";
      ls_attr.UIATY = "1";
      oAPP.attr.prev.ROOT._T_0015.push(ls_attr);

    }

    //현재 선택한 TREE가 ROOT가 아닌경우 EXIT.
    if(oAPP.attr.oModel.oData.uiinfo.OBJID !== "ROOT"){return;}

    //갱신처리 대상건을 기준으로 ATTRIBUTE 영역의 출력정보 갱신 처리.
    for(var i=0, l=it_attr.length; i<l; i++){
      
      //대상 ATTRIBUTE 라인 얻기.
      var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === it_attr[i].UIATK );
      
      //해당 라인을 얻지못한 경우 SKIP.
      if(!ls_attr){continue;}

      //갱신값 매핑.
      ls_attr.UIATV = it_attr[i].UIATV;

    }

    //모델 갱신 처리.
    oAPP.attr.oModel.refresh();


  };  //DOCUMENT 영역의 ATTRIBUTE 갱신 처리.




  //attribute에 drag UI가 올라갔을때 이벤트.
  oAPP.fn.attrDrop = function(oEvent){

    //drop UI 정보 얻기.
    var l_row = oEvent.mParameters.dragSession.getDropControl();

    //drop UI를 얻지 못한 경우 exit.
    if(!l_row){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //바인딩 정보 얻기.
    var l_ctxt = l_row.getBindingContext();

    //바인딩 정보가 존재하지 않는경우 exit.
    if(!l_ctxt){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //현재 라인이 drop 가능한건 인지 확인.
    var ls_attr = l_ctxt.getProperty();

    //drop 불가능한 경우 exit.
    if(!ls_attr.dropEnable){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }


    //drag 정보 얻기.
    var l_json = event.dataTransfer.getData("prc001");

    //drag 정보를 얻지 못한 경우 exit.
    if(typeof l_json === "undefined" || l_json === ""){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //json 형식 parse, 실패시 exit.
    try{
      l_json = JSON.parse(l_json);

    }catch(e){
      //265	Binding attributes does not exist.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "265", "", "", "", ""));
      return;
    }

    //바인딩 팝업에서 drag한게 아닌경우 exit.
    if(l_json.PRCCD !== "PRC001"){
      //265	Binding attributes does not exist.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "265", "", "", "", ""));
      return;
    }


    //다른 application의 바인딩 팝업에서 D&D한경우.
    if(l_json.DnDRandKey !== oAPP.attr.DnDRandKey){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //kind path가 존재하지 않는경우 exit.
    if(typeof l_json.IF_DATA.KIND_PATH === "undefined"){
      //265	Binding attributes does not exist.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "265", "", "", "", ""));
      return;
    }

    //바인딩 팝업에서 최상위를 drag한경우, structure를 drag한경우 exit.
    if(l_json.IF_DATA.KIND === "" || l_json.IF_DATA.KIND === "S"){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //aggregation인경우 TABLE을 DROP하지 않았다면.
    if(ls_attr.UIATY === "3" && l_json.IF_DATA.KIND !== "T" ){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    //n건 바인딩 처리된 UI인지 여부 확인.
    var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[ls_attr.OBJID]);

    var l_isTree = false;

    //현재 UI의 라인 정보 얻기.
    var ls_tree = oAPP.fn.getTreeData(ls_attr.OBJID);

    //drop한 프로퍼티가 attribute정보가 sap.m.Tree의 parent, child인경우.
    if(ls_attr.UIATK === "EXT00001190" ||  //parent
      ls_attr.UIATK === "EXT00001191"){   //child

      //items aggregation에 바인딩된 정보 매핑.
      l_path = oAPP.attr.prev[ls_attr.OBJID]._MODEL["items"];

      l_isTree = true;

    //drop한 프로퍼티가 sap.ui.table.TreeTable의 parent, child인경우.
    }else if(ls_attr.UIATK === "EXT00001192" || //parent
      ls_attr.UIATK === "EXT00001193"){  //child

      //rows aggregation에 바인딩된 정보 매핑.
      l_path = oAPP.attr.prev[ls_attr.OBJID]._MODEL["rows"];

      l_isTree = true;

    //drop한 프로퍼티가 sap.ui.table.Column의 markCellColor인경우.
    }else if(ls_attr.UIATK === "EXT00002382" && 
      oAPP.attr.prev[ls_attr.OBJID].__PARENT){

      //rows aggregation에 바인딩된 정보 매핑.
      l_path = oAPP.attr.prev[ls_attr.OBJID].__PARENT._MODEL["rows"];

      l_isTree = true;

    }else if(ls_tree.PUIATK === "AT000022249" || ls_tree.PUIATK === "AT000022258"){
      //sap.ui.table.Table(sap.ui.table.TreeTable)의 rowSettingsTemplate aggregation에 속한 UI인경우.
      l_path = oAPP.attr.prev[ls_tree.POBID]._MODEL["rows"];

      l_isTree = true;

    }

    //tree의 parent, child에 drop한경우 n건 바인딩 정보가 존재하지 않는경우.
    if(l_isTree && !l_path){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    
    var lt_split1, lt_split2;

    //drag한 UI가 table로부터 파생된 필드인경우.
    if(l_json.IF_DATA.isTabField === true){

      //현재 UI가 N건 바인딩처리된건이 아닌경우 EXIT.
      if(typeof l_path === "undefined" || l_path === "" || l_path === null){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }

      //현재 UI가 N건 바인딩 처리됐다면 
      if(l_path !== l_json.IF_DATA.CHILD.substr(0, l_path.length)){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }

      //현재 UI의 N건 바인딩 PATH를 구분자로 분리.(STRU-STRU-TAB 형식)
      lt_split1 = l_path.split("-");

      //DRAG한 UI의 KIND PATH 정보를 구분자로 분리.(S-S-T-T-E 형식)
      lt_split2 = l_json.IF_DATA.KIND_PATH.split("-");

      //현재 UI의 N건 바인딩 PATH 위치까지를 제거.(S-S-T 부분까지 제거)
      lt_split2.splice(0, lt_split1.length);

    }

    //drop위치의 attribute가 property인경우.
    if(ls_attr.UIATY === "1"){
      
      //selectOption2의 value에 바인딩 처리되는경우.
      if(ls_attr.UIATK === "EXT00001161"){
        //drag한 필드가 range table이 아닌경우 exit.
        if(l_json.IF_DATA.EXP_TYP !== "RANGE_TAB"){
          //214  Unable to bind.
          oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
          return;
        }

        
        if(typeof lt_split2 !== "undefined"){
          //마지막 필드 제거(마지막필드는 range table이므로)
          lt_split2.splice(lt_split2.length - 1, 1);

          //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
          if(lt_split2.findIndex( a=> a === "T" ) !== -1){
            //214  Unable to bind.
            oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
            return;
          }

        }        
        
        //프로퍼티 바인딩 처리.
        oAPP.fn.attrSetBindProp(ls_attr, l_json.IF_DATA);
        oEvent.preventDefault(true);
        return;

      }
      
      //프로퍼티가 ARRAY로 입력 가능한 경우, 프로퍼티 타입이 숫자 유형이 아님.
      if((ls_attr.ISMLB === "X" && (ls_attr.UIADT !== "int" && ls_attr.UIADT !== "float"))){
        //string_table이 아닌경우 exit.
        if(l_json.IF_DATA.EXP_TYP !== "STR_TAB"){
          //214  Unable to bind.
          oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
          return;
        }

        //STRING_TABLE이지만 부모가 ROOT인경우 EXIT.(바인딩 가능한건은 STRU-FIELD or TABLE-FIELD만 가능)
        if(l_json.IF_DATA.EXP_TYP === "STR_TAB" && l_json.IF_DATA.PARENT === "Attribute"){
          //214  Unable to bind.
          oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
          return;
        }

        if(typeof lt_split2 !== "undefined"){
          //마지막 필드 제거(마지막필드는 string_table이므로)
          lt_split2.splice(lt_split2.length - 1, 1);

          //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
          if(lt_split2.findIndex( a=> a === "T" ) !== -1){
            //214  Unable to bind.
            oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
            return;
          }

        }

        //프로퍼티 바인딩 처리.
        oAPP.fn.attrSetBindProp(ls_attr, l_json.IF_DATA);
        oEvent.preventDefault(true);
        return;
      }

      //일반 프로퍼티의 경우 Elementary Type 이 아닌경우 EXIT.
      if(l_json.IF_DATA.KIND !== "E"){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }

      //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
      if(typeof lt_split2 !== "undefined" && lt_split2.findIndex( a=> a === "T" ) !== -1){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }


      //tree인경우 n건 바인딩 path와 다른 경우 exit.
      if(l_isTree && l_path && l_path !== l_json.IF_DATA.CHILD.substr(0, l_path.length)){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }

      //sap.ui.core.HTML의 content프로퍼티에 drop된경우 예외처리.
      if(oAPP.fn.attrChkHTMLContent(ls_attr, true, function(){oAPP.fn.attrSetBindProp(ls_attr, l_json.IF_DATA);})){return;}

      //프로퍼티 바인딩 처리.
      oAPP.fn.attrSetBindProp(ls_attr, l_json.IF_DATA);
      oEvent.preventDefault(true);

    } //drop위치의 attribute가 property인경우.


    //AGGREGATION인경우 N건 들어가는 AGGREGATION이 아닌경우 EXIT.
    if(ls_attr.UIATY === "3" && ls_attr.ISMLB !== "X"){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }

    
    //AGGREGATION에 string_table을 drop한경우.
    if(ls_attr.UIATY === "3" && l_json.IF_DATA.EXP_TYP === "STR_TAB"){
      //214  Unable to bind.
      oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
      return;
    }


    //drop위치의 attribute가 aggregation인경우.
    if(ls_attr.UIATY === "3" && l_json.IF_DATA.KIND === "T"){

      //aggregation 바인딩 처리 가능여부 점검.
      if(oAPP.fn.attrChkBindAggrPossible(ls_attr, true)){
        //214  Unable to bind.
        oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
        return;
      }

      if(typeof lt_split2 !== "undefined"){
        //마지막 필드 제거(마지막필드는 TABLE이므로)
        lt_split2.splice(lt_split2.length - 1, 1);

        //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
        if(lt_split2.findIndex( a=> a === "T" ) !== -1){
          //214  Unable to bind.
          oAPP.common.fnShowFloatingFooterMsg("E", "WS20", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "214", "", "", "", ""));
          return;
        }

      }

      //aggregation 바인딩 처리.
      oAPP.fn.attrBindCallBackAggr(true, l_json.IF_DATA, ls_attr);
      oEvent.preventDefault(true);
    }


  };  //attribute에 drag UI가 올라갔을때 이벤트.




  //aggregation 바인딩 처리 가능여부 점검.
  oAPP.fn.attrChkBindAggrPossible = function(is_attr, bSkipMsg){

    //현재 ui의 tree 정보 얻기.
    var l_tree = oAPP.fn.getTreeData(is_attr.OBJID);

    //CHILD 정보가 없는경우 exit.
    if(l_tree.zTREE.length === 0){return;}

    //현재 바인딩 아이콘을 선택한 AGGREGATION에 추가된 UI정보 얻기.
    var lt_filter = l_tree.zTREE.filter( a => a.UIATK === is_attr.UIATK);

    //현재 aggregation에 2개 이상의 UI가 추가된경우.
    if(lt_filter.length >= 2){
      if(!bSkipMsg){
        //023	If you have one or more child objects, you can not specify a model.
        parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "023", "", "", "", ""));
      }
      
      //오류 FLAG RETURN.
      return true;
    }


  };  //aggregation 바인딩 처리 가능여부 점검.




  //attribute 입력건에 오류가발생한 경우 초기값으로 변경 처리.
  oAPP.fn.attrClearErrorValue = function(){

    if(!document.activeElement || !document.activeElement.id){return;}

    //현재 focus된 UI정보 얻기.
    var l_ui = oAPP.fn.getUiInstanceDOM(document.activeElement, sap.ui.getCore());

    //UI 정보를 얻지 못한 경우 exit.
    if(!l_ui){return;}

    //해당 UI의 바인딩 context 정보 얻기.
    var l_ctxt = l_ui.getBindingContext();

    //바인딩 정보를 얻지 못한 경우 exit.
    if(!l_ctxt){return;}

    //해당 UI가 attribute 영역건이 아닌경우 exit.
    if(l_ctxt.sPath.substr(0,7) !== "/T_ATTR"){
      return;
    }

    //attr 정보  얻기.
    var ls_attr = l_ctxt.getProperty();

    //정보를 얻지 못한 경우, 프로퍼티가 아닌경우 EXIT.
    if(!ls_attr || ls_attr.UIATY !== "1"){return;}

    var l_dval = "", ls_0023;

    //ROOT가 아닌경우, 직접 입력가능한 aggregation이 아닌경우 default 값 얻기.
    if(ls_attr.UIATK.indexOf("_1") === -1){
      ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === ls_attr.UIATK );

    }

    if(ls_0023){
      l_dval = ls_0023.DEFVL;
    }

    //DEFAULT 값으로 복원 처리.
    ls_attr.UIATV = l_dval;

    //바인딩 해제 처리.
    ls_attr.ISBND = "";
    ls_attr.MPROP = "";

    //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
    oAPP.fn.attrChangeProc(ls_attr, "", false, true);


  };  //attribute 입력건에 오류가발생한 경우 초기값으로 변경 처리.




  //샘플 팝업 호출.
  oAPP.fn.attrCallUiSample = function(){

    //UI5 bootstrap 라이브러리 활성화건 검색.
    var ls_UA025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" && a.FLD01 === "APP" && a.FLD06 === "X" );

    if(!ls_UA025){return;}

    var oFormData = new FormData();
    
    //활성화된 라이브러리 버전.
    oFormData.append("UIVER", ls_UA025.FLD07);

    //라이브러리명.
    oFormData.append("UILIB", oAPP.attr.oModel.oData.uiinfo.UILIB);

    //UI 대문자.
    oFormData.append("UIFND", oAPP.attr.oModel.oData.uiinfo.UIFND);

    //서버에서 SAMPLE 정보 검색.
    sendAjax(oAPP.attr.servNm + "/getLibSampleInfo", oFormData, function(param){
      
      //wait 종료 처리.
      parent.setBusy("");

      //SAMPLE 정보 검색에 실패한 경우.
      if(param.RETCD === "E"){
        //오류 메시지 호출.
        parent.showMessage(sap, 10, "E", param.RTMSG);
        return;
      }

      //BROWSER 호출.
      oAPP.fn.fnExeBrowser(param.PATH, param.PARAM);

    }); //서버에서 SAMPLE 정보 검색.

  };  //샘플 팝업 호출.




  //text 복사(ctrl + c) 처리.
  oAPP.fn.attrCopyText =function(sText){
    
    //text 정보가 없는경우 exit.
    if(!sText || sText === ""){return;}

    //ui 라이브러리명 복사 처라.
    parent.setClipBoardTextCopy(sText);

    //메시지 처리.
    //272	&1 has been copied.
    parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "272", sText, "", "", ""));

  };  //text 복사(ctrl + c) 처리.


})();
