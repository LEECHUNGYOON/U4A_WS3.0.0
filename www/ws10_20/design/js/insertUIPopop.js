(function(){

  //UI 생성 최대 갯수.
  const CV_MAX_CNT = 100;

  //UI 생성 갯수 INPUT의 maxLength
  const CV_MAX_LEN = 3;

  //UI 생성 팝업
  oAPP.fn.callUIInsertPopup = function(UIOBK, retFunc){


    //Aggregation Name DDLB 바인딩 정보 구성.
    var lt_sel = oAPP.DATA.LIB.T_0023.filter(a => a.UIOBK === UIOBK && a.UIATY === "3" && a.ISDEP !== "X" );


    if(lt_sel.length === 0){
      //280	입력 가능한 Aggregation이 존재하지 않습니다.
      parent.showMessage(sap, 10, "W", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "280", "", "", "", ""));

      //단축키 잠금 해제처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }


    var ls_sel = JSON.stringify(lt_sel[0]);
    ls_sel = JSON.parse(ls_sel);
    for(var i in ls_sel){
      ls_sel[i] = "";
    }

    //Aggregation DDLB에 빈값 라인 추가.
    lt_sel.splice(0,0,ls_sel);


    sap.ui.getCore().loadLibrary("sap.ui.layout");
    sap.ui.getCore().loadLibrary("sap.ui.table");
    sap.ui.getCore().loadLibrary("sap.m");

    var oDlg = new sap.m.Dialog({
      resizable:true, 
      draggable:true,
      contentWidth:"50%", 
      contentHeight:"60%", 
      verticalScrolling:false,
      afterClose : function(params) {
        oAPP.fn.setShortcutLock(false);
      }
    });
    oDlg.addStyleClass("sapUiSizeCompact");

    oDlg.data("INSERT_UI_POPUP", true);

    //dialog open이후 이벤트.
    oDlg.attachAfterOpen(function(){

      oDlg.setInitialFocus("");

      //aggregation name ddlb 선택 처리.
      oSel1.focus();

      
      parent.setBusy("");


    });

    var oTool = new sap.m.Toolbar();
    oDlg.setCustomHeader(oTool);

    //A38	Aggregation List
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A38", "", "", "", "");
    
    var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
    oTitle.addStyleClass("sapUiTinyMarginBegin");

    oTool.addContent(oTitle);

    oTool.addContent(new sap.m.ToolbarSpacer());

    //우상단 닫기버튼.
    //A39	Close
    var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
    oTool.addContent(oBtn0);

    //닫기 버튼 선택 이벤트.
    oBtn0.attachPress(function(){

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);
      
      oDlg.close();
      oDlg.destroy();
      //001	Cancel operation
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

    });


    var oVbox1 = new sap.m.VBox({height:"100%", renderType:"Bare"});
    oDlg.addContent(oVbox1);

    //dialog 타이틀 설정.
    var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === UIOBK);
    if(ls_0022){

      //D97  UI Object Select
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D97", "", "", "", "");

      oTitle.setText(l_txt + " - " + ls_0022.UIOBJ);

      oTitle.setTooltip(l_txt + " - " + ls_0022.UIOBJ);

    }

    var oMdl = new sap.ui.model.json.JSONModel();
    oDlg.setModel(oMdl);

    oMdl.setData({"T_SEL":lt_sel});

    var oFrm1 = new sap.ui.layout.form.Form({editable:true});
    oVbox1.addItem(oFrm1);

    var oRspLay1 = new sap.ui.layout.form.ResponsiveGridLayout(
      {singleContainerFullSize:false, adjustLabelSpan:false, labelSpanL:4, labelSpanM:4, columnsL:2});

    oFrm1.setLayout(oRspLay1);

    var oFrmCont1 = new sap.ui.layout.form.FormContainer();
    oFrm1.addFormContainer(oFrmCont1);

    var oFrmElem1 = new sap.ui.layout.form.FormElement();
    oFrmCont1.addFormElement(oFrmElem1);

    //D98  Aggregation Name
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D98", "", "", "", "");

    var oLab1 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    oFrmElem1.setLabel(oLab1);

    var oSel1 = new sap.m.Select({width:"100%"});
    oFrmElem1.addField(oSel1);

    //Aggregation Name DDLB 선택 이벤트.
    oSel1.attachChange(function(){

      oMdl.oData.T_LIST = [];
      oMdl.setData({"T_LIST":[]}, true);

      //테이블 라인선택 초기화.
      oTab1.clearSelection();

      //결과리스트 테이블 sort, 필터 초기화.
      oAPP.fn.resetUiTableFilterSort(oTab1);

      //Aggregation name DDLB 선택값 얻기.
      var l_skey = oSel1.getSelectedKey();

      //빈값을 선택한 경우 exit.
      if(l_skey === ""){
        oFrmElem2.setVisible(false);
        return;
      }

      //DDLB선택건에 해당하는 라인정보 얻기.
      var ls_sel = oMdl.oData.T_SEL.find(a => a.UIATK === l_skey);
      if(!ls_sel){return;}

      var l_vis01 = false;
      //n건 입력 가능한경우.
      if(ls_sel.ISMLB === "X"){
        l_vis01 = true;
      }

      //Generated Cnt 입력필드 활성여부 설정.
      oFrmElem2.setVisible(l_vis01);

      //default UI생성 갯수 1건 으로 설정.
      if(l_vis01 === false){
        oInp1.setValue(1);
      }

      //AGGREGATION NAME DDLB에서 선택한 KEY를 대문자 변환 처리.
      var l_uifnd = ls_sel.UIADT.toUpperCase();

      //AGGREGATION의 TYPE에 해당하는 UI 검색.
      var ls_0022 = oAPP.DATA.LIB.T_0022.find(a => a.UIFND === l_uifnd);
      if(!ls_0022){return;}

      //해당 UI에 입력 가능한 UI 정보 검색.
      var lt_0027t = oAPP.DATA.LIB.T_0027.filter( a => a.SGOBJ === ls_0022.UIOBK && ( a.TOBTY === "3" || a.TOBTY === "4" || a.TOBTY === "5" ));
      if(!lt_0027t){return;}

      var lt_0022 = [],
          ls_0022 = {},
          ls_list = {};

        
      //DEFAULT 허용 가능 오브젝트 유형.
      //(1:CLASS, 4:Final Class)
      var _aOBJTY = ["1", "4"];

      //1.120.21 버전 이후 패치의 경우 허용 가능 오브젝트 유형을 Abstract 클래스도 허용 가능함.
      //(1:CLASS, 2:Abstract, 4:Final Class)
      if(oAPP.common.checkWLOList("C", "UHAK900877") === true){
        _aOBJTY = ["1", "2", "4"];
      }


      //입력 가능한 UI정보를 기준으로 실제 UI의 입력 가능 여부 확인.
      for(var i = 0, l = lt_0027t.length; i < l; i++){

        //대상 UI검색.
        ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === lt_0027t[i].TGOBJ );

        //대상 UI를 찾지 못한 경우 SKIP.
        if(typeof ls_0022 === "undefined"){continue;}

        
        //20250309 PES -START.
        //sap.ui.core.Control로부터 파생된 UI일지라도
        //특정 UI에만 추가 되야 하는경우만 UI 리스트를 구성하도록 로직 처리.

        //UI의 허용 가능 부모 정보 항목에 해당하는 UI인지 여부 확인.
        var _aUW02 = oAPP.attr.S_CODE.UW03.filter( item => item.FLD01 === ls_0022.UIOBK && item.FLD06 !== "X" );
  
        //허용가능 UI건인경우.
        if(_aUW02.length > 0){

          //현재 추가 하려는 UI에 가능한 항목인지 확인.
          var _sUW02 = _aUW02.find( item => item.FLD03 === UIOBK );

          //추가 하려는 UI에 허용 불가능한 경우 skip.
          if(typeof _sUW02 === "undefined"){
            continue;
          }

          //허용 대상 aggregation과 다른 경우 skip.
          if(_sUW02.FLD05 !== ls_sel.UIATT){
            continue;
          }
          
        }
        //20250309 PES -END.

        //기존로직 주석 처리.
        // //대상 UI가 폐기된경우, UI TYPE이 Class, Final Class가 아닌경우 SKIP.
        // if(ls_0022.ISDEP === "X" || ls_0022.ISSTP === "X" || ( ls_0022.OBJTY !== "1" && ls_0022.OBJTY !== "4" )){
        //   continue;
        // }

        //허용 가능 object에 해당되지 않는건은 수집 skip.
        if(ls_0022.ISDEP === "X" || ls_0022.ISSTP === "X" || _aOBJTY.indexOf(ls_0022.OBJTY) === -1){
          continue;
        }

        //라이브러리 정보 검색.
        var ls_0020 = oAPP.DATA.LIB.T_0020.find( a => a.UILIK === ls_0022.UILIK );

        //해당 라이브러리가 사용되지 않는경우 skip.
        if(ls_0020.NUSED === "X"){continue;}

        ls_list.UICON = oAPP.fn.fnGetSapIconPath(ls_0022.UICON);
        ls_list.UIOBJ = ls_0022.UIOBJ;
        ls_list.LIBNM = ls_0022.LIBNM;
        ls_list.UIOBK = ls_0022.UIOBK;


        //추가 가능한 경우 해당 UI 수집 처리.
        lt_0022.push(ls_list);
        ls_list = {};

      }

      oMdl.setData({"T_LIST":lt_0022},true);

      //UI명 검색필드로 FOCUS처리.
      oInp2.focus();

    }); //Aggregation Name DDLB 선택 이벤트.



    var oItm1 = new sap.ui.core.Item({key:"{UIATK}", text:"{UIATT}"});


    oSel1.bindAggregation("items", {path:"/T_SEL", template:oItm1});



    var oFrmElem2 = new sap.ui.layout.form.FormElement({visible:false});
    oFrmCont1.addFormElement(oFrmElem2);

    //D99  Generated Cnt
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D99", "", "", "", "");

    var oLab2 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    oFrmElem2.setLabel(oLab2);

    //B25  Max
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B25", "", "", "", "");

    //UI 추가 건수 입력필드.
    // var oInp1 = new sap.m.Input({type:"Number", maxLength:CV_MAX_LEN, value:1, description:l_txt + " : " + CV_MAX_CNT});
    var oInp1 = new sap.m.StepInput({max:CV_MAX_CNT, min:1, value:1, description:l_txt + " : " + CV_MAX_CNT});
    oFrmElem2.addField(oInp1);

    //UI 추가 건수 입력필드 변경 이벤트.
    oInp1.attachChange(function(){
      //입력값 얻기.
      var l_val = this.getValue();

      //입력값이 공백인경우 DEFAULT 1로 설정 후 EXIT.
      if(l_val === ""){
        oInp1.setValue(1);
        oInp2.focus();
        return;
      }

      // //문자 제거.
      // l_val = l_val.replace(/[^0-9.]/g, "");

      //숫자로 변환 처리.
      l_val = parseInt(l_val);

      //100건이상을 입력했다면 MAX 100으로 설정.
      if(l_val > CV_MAX_CNT){
        l_val = CV_MAX_CNT;
      }

      //1보다 작은값 입력식 1로 설정.
      if(l_val < 1){
        l_val = 1;
      }

      //세팅된 값을 재 매핑 처리.
      oInp1.setValue(l_val);

      oInp2.focus();

    }); //UI 추가 건수 입력필드 변경 이벤트.



    var oFrmElem3 = new sap.ui.layout.form.FormElement();
    oFrmCont1.addFormElement(oFrmElem3);

    //E01  UI Object
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E01", "", "", "", "");

    var oLab9 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    oFrmElem3.setLabel(oLab9);

    var oInp2 = new sap.m.Input();
    oFrmElem3.addField(oInp2);

    //ui 검색 필드 Suggest 처리.
    oAPP.fn.setUiSuggest(oInp2, "insertUiName");

    
    //20240721 PES.
    //change -> submit으로 이벤트 변경,
    //ui 검색 이벤트.
    // oInp2.attachChange(function(){
    oInp2.attachSubmit(function(){

        //결과리스트 테이블 sort, 필터 초기화.
        oAPP.fn.resetUiTableFilterSort(oTab1);

        var l_val = this.getValue();


        var l_bind = oTab1.getBinding("rows");
        if(!l_bind){return;}

        var l_filter;
        if(l_val !== ""){
          l_filter = new sap.ui.model.Filter({path:"UIOBJ", operator:"Contains", value1:l_val});
        }

        l_bind.filter(l_filter);

    }); //ui 검색 이벤트.


    //Suggestion 선택 이벤트.
    oInp2.attachSuggestionItemSelected((oEvent)=>{
      //Suggestion 선택시 sumit 이벤트 호출.

      //Suggestion 선택 정보가 존재하지 않는경우 exit.
      if(typeof oEvent?.mParameters?.selectedItem?.getKey !== "function"){
        return;
      }

      //Suggestion 선택 라인의 key 정보 얻기.
      var _key = oEvent.mParameters.selectedItem.getKey();


      //ui 검색 인풋에 해당 값 매핑.
      oInp2.setValue(_key);

      //submit 이벤트 호출.
      oInp2.fireSubmit();

    });


    //결과 테이블
    var oTab1 = new sap.ui.table.Table({selectionMode:"Single", selectionBehavior:"Row", rowHeight:30,
      visibleRowCountMode:"Auto", layoutData:new sap.m.FlexItemData({growFactor:1})});
    

    oDlg.data("INSERT_UI_POPUP_TABLE", oTab1);

    //테이블 필터 이벤트.
    oTab1.attachFilter(lf_tablefilter);


    //테이블 스크롤 이벤트.
    oTab1.attachFirstVisibleRowChanged(function(){
      //현재 선택된 DOM focus out 처리.
      document.activeElement.blur();
    });

    //table 더블클릭 이벤트.
    oTab1.attachBrowserEvent("dblclick", function(oEvent){

      parent.setBusy("X");

      var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

      //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
      _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215"); 

      //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

      var _oTarget = oEvent?.target || undefined;

      if(typeof _oTarget === "undefined"){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        parent.setBusy("");
        return;
      }

      //이벤트 발생 UI 정보 얻기.
      var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

      //UI정보를 얻지 못한 경우 exit.
      if(!l_ui){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        parent.setBusy("");

        return;
      }
      
      //아이콘을 더블클릭한 경우 exit.
      if(l_ui.data("ico")){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        parent.setBusy("");

        return;
      }

      //바인딩정보 얻기.
      var l_ctxt = l_ui.getBindingContext();

      //바인딩 정보를 얻지 못한 경우 exit.
      if(!l_ctxt){

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        parent.setBusy("");

        return;
      }

      //선택 처리건에 대한 return.
      lf_selectUi(l_ctxt.getProperty());


    }); //tree 더블클릭 이벤트.   


    oVbox1.addItem(oTab1);

    
    var oLTDrag1 = new sap.ui.core.dnd.DragInfo({sourceAggregation:"rows"});
    oTab1.addDragDropConfig(oLTDrag1);

    //drag start 이벤트
    oLTDrag1.attachDragStart(function(oEvent){
      //결과리스트 table 라인 drag start 처리.
      lf_rowDragStart(oEvent, oDlg, oInp1);

    }); //drag start 이벤트
    

    //drag end 이벤트
    oLTDrag1.attachDragEnd(function(oEvent){      
      //결과리스트 table 라인 drag end 처리.
      lf_rowDragEnd(oDlg);

    }); //drag end 이벤트

    //UI 이미지 컬럼.
    var oCol1 = new sap.ui.table.Column({hAlign:"Center", width:"80px"});
    oTab1.addColumn(oCol1);

    var oImage = new sap.m.Image({src:"{UICON}", width:"19px"}).data("ico", true);
    oCol1.setTemplate(oImage);

    //E31	Symbol
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E31", "", "", "", "");

    var oLab4 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    oCol1.setLabel(oLab4);

    
    // //ui info 컬럼.
    // var oCol5 = new sap.ui.table.Column({hAlign:"Center", width:"80px", visible:true});
    // oTab1.addColumn(oCol5);

    // //A67  Preview
    // var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67", "", "", "", "");

    // var oLab8 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    // oCol5.setLabel(oLab8);

    // var oIcon2 = new sap.ui.core.Icon({src:"sap-icon://picture", color:"#2b7c2b", height:"20px", visible:"{visible_help}"});
    // oCol5.setTemplate(oIcon2);

    oImage.attachPress((oEvent)=>{

      parent.setBusy("X");

      //단축키도 같이 잠금 처리.
      oAPP.fn.setShortcutLock(true);


      var l_ui = oEvent?.oSource;

      if(typeof l_ui === "undefined" || l_ui === null){

        //단축키도 같이 잠금해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;

      }

      var l_ctxt = l_ui.getBindingContext();
      if(!l_ctxt){

        //단축키도 같이 잠금해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
      }

      var ls_line = l_ctxt.getProperty();

      //UI 미리보기 팝업 function이 존재하는경우 즉시 호출.
      if(typeof oAPP.fn.callUiPreviewImagePopup !== "undefined"){
        oAPP.fn.callUiPreviewImagePopup(l_ui, ls_line.UIOBK);
        return;
      }

      //UI 미리보기 팝업 function이 존재하지 않는경우 js 로드 후 호출.
      oAPP.fn.getScript("design/js/callUiPreviewImagePopup",function(){
          oAPP.fn.callUiPreviewImagePopup(l_ui, ls_line.UIOBK);
      });

    });


    //UI 오브젝트명 컬럼.
    var oCol2 = new sap.ui.table.Column({autoResizable:true, filterProperty:"UIOBJ", sortProperty:"UIOBJ"});
    oTab1.addColumn(oCol2);

    //E01  UI Object
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E01", "", "", "", "");

    var oLab3 = new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt});
    oCol2.setLabel(oLab3);

    var oTxt1 = new sap.m.Text({text:"{UIOBJ}"});
    oCol2.setTemplate(oTxt1);


    //UI 라이브러리명 컬럼.
    var oCol3 = new sap.ui.table.Column({autoResizable:true, filterProperty:"LIBNM", sortProperty:"LIBNM"});
    oTab1.addColumn(oCol3);

    //E03  UI Object(Fullname)
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E03", "", "", "", "");

    var oLab6 = new sap.m.Label({design: "Bold", text:l_txt, tooltip:l_txt});
    oCol3.setLabel(oLab6);

    var oTxt2 = new sap.m.Text({text:"{LIBNM}"});
    oCol3.setTemplate(oTxt2);

    var oCol4 = new sap.ui.table.Column({hAlign:"Center", width:"120px", filterProperty:"UIOBK", sortProperty:"UIOBK"});
    oTab1.addColumn(oCol4);

    //E04  UI Key
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E04", "", "", "", "");

    var oLab7 = new sap.m.Label({design: "Bold", text:l_txt, tooltip:l_txt});
    oCol4.setLabel(oLab7);

    var oTxt4 = new sap.m.Text({text:"{UIOBK}"});
    oCol4.setTemplate(oTxt4);


    var oRow1 = new sap.ui.table.Row();
    oTab1.bindAggregation("rows", {path:"/T_LIST",template:oRow1});

    //A40  Confirm
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A40", "", "", "", "");

    //확인 버튼
    var oBtn1 = new sap.m.Button({icon:"sap-icon://accept", text:l_txt, tooltip:l_txt, type:"Accept"});
    oDlg.addButton(oBtn1);

    oBtn1.attachPress(function(){

      parent.setBusy("X");

      var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

      //215	디자인 화면에서 UI 추가 처리 작업을 진행하고 있습니다.
      _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "215");

      //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

      //table의 선택 라인 index 얻기.
      var l_sidx = oTab1.getSelectedIndex();

      //선택한 라인이 없는경우 오류 처리.
      if(l_sidx === -1){
        //268	Selected line does not exists.
        parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", ""));

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        parent.setBusy("");

        return;
      }
            
      //선택 처리건에 대한 return.
      lf_selectUi(oTab1.getContextByIndex(l_sidx).getProperty());

    });


    //A41  Cancel
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "");

    //종료버튼
    var oBtn2 = new sap.m.Button({icon:"sap-icon://decline", text:l_txt, type:"Reject", tooltip:l_txt});
    oDlg.addButton(oBtn2);
    oBtn2.attachPress(function(){

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      oDlg.close();
      oDlg.destroy();
      //001	Cancel operation
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));
    });

    oDlg.open();




    //UI 선택처리 FUNCTION.
    function lf_selectUi(is_UI){
      
      //aggregation ddlb 선택 Key 값 얻기.
      var l_selky = oSel1.getSelectedKey();

      //ddlb 선택한정보(23번 테이블 구조)
      var ls_0023 = oAPP.DATA.LIB.T_0023.find(a => a.UIATK === l_selky);
      
      //리스트 선택정보(22번 테이블 구조)
      var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === is_UI.UIOBK );

      //리스트에서 선택한 ui가 갖고 있는 aggr 정보(23번 테이블)
      var lt_0023 = oAPP.DATA.LIB.T_0023.filter(a => a.UIOBK === ls_0022.UIOBK && a.UIATY === "3" && a.ISDEP !== "X");

      //반복해서 만들 ui 갯수
      var l_cnt = parseInt(oInp1.getValue());

      //ui 검색필드 suggest 정보 저장 처리.
      oAPP.fn.saveUiSuggest("insertUiName", ls_0022.UIOBJ, 10);


      //팝업 종료.
      oDlg.close();
      oDlg.destroy();

      //return parameter 전달.
      retFunc(ls_0022, ls_0023, l_cnt, lt_0023);


    } //UI 선택처리 FUNCTION.



    //테이블 필터 이벤트.
    function lf_tablefilter(oEvent){
  
      //컬럼 필터 입력값이 없다면 exit.
      if(typeof oEvent?.mParameters?.value === "undefined"){
        return;
      }

      //컬럼 필터 입력값이 없다면 exit.
      if(oEvent?.mParameters?.value === null){
        return;
      }

      //컬럼 필터 입력값이 없다면 exit.
      if(oEvent?.mParameters?.value === ""){
        return;
      }

      //필터된 컬럼 정보가 없다면 exit.
      if(typeof oEvent.mParameters.column === "undefined"){
        return;
      }

      //필터된 컬럼 정보가 없다면 exit.
      if(oEvent.mParameters.column === null){
        return;
      }

      //컬럼의 필터 필드명 얻기.
      var _fldName = oEvent.mParameters.column.getFilterProperty();

      //필터 필드명이 존재하지 않는경우 exit.
      if(typeof _fldName === "undefined"){
        return;
      }

      //필터 필드명이 존재하지 않는경우 exit.
      if(_fldName === null){
        return;
      }

      //필터 필드명이 존재하지 않는경우 exit.
      if(_fldName === ""){
        return;
      }

      //테이블의 바인딩 정보 얻기.
      var _oBind = oTab1.getBinding("rows");

      //테이블의 바인딩 정보가 없다면 exit.
      if(typeof _oBind === "undefined" || _oBind === null){
        return;
      }

      //기존 필터 이벤트 처리 skip.
      oEvent.preventDefault();

      var _aCol = oTab1.getColumns();

      //컬럼의 필터 초기화.
      for(var i = 0, l = _aCol.length; i < l; i++){
        
        var _oCol = _aCol[i];

        _oCol.setFiltered(false);

      }

      //현재 이벤트가 발생한 컬럼의 필터 처리.
      oEvent.mParameters.column.setFiltered(true);


      var _val = oInp2.getValue();

      var _aFilter = [];

      //object id 검색 필드에 값이 존재하는경우 필터 구성.
      if(_val !== ""){
        _aFilter.push(new sap.ui.model.Filter({path:"UIOBJ", operator:"Contains", value1:_val}));
      }

      //컬럼에 입력한 정보를 필터 구성.
      _aFilter.push(new sap.ui.model.Filter({path:_fldName, operator:"Contains", value1:oEvent.mParameters.value}));

      _oBind.filter(new sap.ui.model.Filter(_aFilter, true));

    }

  };  //UI 생성 팝업


  //결과리스트 table 라인 drag start 처리.
  function lf_rowDragStart(oEvent, oDlg, oInp1){

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

    //반복해서 만들 ui 갯수
    var l_cnt = parseInt(oInp1.getValue());

    //DRAG한 UI 정보 세팅.
    event.dataTransfer.setData("text/plain", "callUIInsertPopup|" + ls_0022.UIOBK + "|" + l_cnt + "|" + oAPP.attr.DnDRandKey);

    //drag 시작시 drop 가능건에 대한 제어 처리.
    oAPP.fn.designTreeDragStart({OBJID:undefined, UIOBK:ls_drag.UIOBK});

    if(!oDlg.oPopup){return;}

    oDlg.focus();

    oDlg.oPopup.setModal(false);

  } //결과리스트 table 라인 drag start 처리.



  //결과리스트 table 라인 drag end 처리.
  function lf_rowDragEnd(oDlg){
    
    //drag 종료 처리.
    oAPP.fn.designDragEnd();

    if(!oDlg.oPopup){return;}

    oDlg.oPopup.setModal(true);



  } //결과리스트 table 라인 drag end 처리.


})();
