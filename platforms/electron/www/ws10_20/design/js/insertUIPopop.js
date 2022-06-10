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
      parent.showMessage(sap,10,"W", "입력 가능한 Aggregation이 존재하지 않습니다.");
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

    var oDlg = new sap.m.Dialog({resizable:true,draggable:true,
      contentWidth:"50%",contentHeight:"60%",verticalScrolling:false});
    oDlg.addStyleClass("sapUiSizeCompact");

    //dialog open이후 이벤트.
    oDlg.attachAfterOpen(function(){
      //aggregation name ddlb 선택 처리.
      oSel1.focus();
    });

    var oTool = new sap.m.Toolbar();
    oDlg.setCustomHeader(oTool);
    
    var oTitle = new sap.m.Title({text:"Aggregation List"});

    oTool.addContent(oTitle);

    oTool.addContent(new sap.m.ToolbarSpacer());

    //우상단 닫기버튼.
    var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip:"Close"});
    oTool.addContent(oBtn0);

    //닫기 버튼 선택 이벤트.
    oBtn0.attachPress(function(){
      
      oDlg.close();
      oDlg.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", "Cancel operation");

    });


    var oVbox1 = new sap.m.VBox({height:"100%",renderType:"Bare"});
    oDlg.addContent(oVbox1);

    //dialog 타이틀 설정.
    var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === UIOBK);
    if(ls_0022){
      oTitle.setText("UI Object Select - " + ls_0022.UIOBJ);
    }

    var oMdl = new sap.ui.model.json.JSONModel();
    oDlg.setModel(oMdl);

    oMdl.setData({"T_SEL":lt_sel});

    var oFrm1 = new sap.ui.layout.form.Form({editable:true});
    oVbox1.addItem(oFrm1);

    var oRspLay1 = new sap.ui.layout.form.ResponsiveGridLayout(
      {singleContainerFullSize:false,adjustLabelSpan:false,labelSpanL:4,labelSpanM:4,columnsL:2});

    oFrm1.setLayout(oRspLay1);

    var oFrmCont1 = new sap.ui.layout.form.FormContainer();
    oFrm1.addFormContainer(oFrmCont1);

    var oFrmElem1 = new sap.ui.layout.form.FormElement();
    oFrmCont1.addFormElement(oFrmElem1);

    var oLab1 = new sap.m.Label({design: "Bold",text: "Aggregation Name"});
    oFrmElem1.setLabel(oLab1);

    var oSel1 = new sap.m.Select({width:"100%"});
    oFrmElem1.addField(oSel1);

    //Aggregation Name DDLB 선택 이벤트.
    oSel1.attachChange(function(){

      oMdl.oData.T_LIST = [];
      oMdl.setData({"T_LIST":[]},true);

      //테이블 라인선택 초기화.
      oTab1.clearSelection();

      //테이블 sort 초기화.
      oTab1.sort();

      //테이블 filter 초기화.
      for(var i=0,l=oTab1.mAggregations.columns.length; i<l;i++){
        oTab1.filter(oTab1.mAggregations.columns[i]);
      }

      //Aggregation name DDLB 선택값 얻기.
      var l_skey = oSel1.getSelectedKey();

      //빈값을 선택한 경우 exit.
      if(l_skey === ""){return;}

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

      //입력 가능한 UI정보를 기준으로 실제 UI의 입력 가능 여부 확인.
      for(var i=0, l=lt_0027t.length; i<l; i++){

        //대상 UI검색.
        ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === lt_0027t[i].TGOBJ );

        //대상 UI를 찾지 못한 경우 SKIP.
        if(typeof ls_0022 === "undefined"){continue;}

        //대상 UI가 폐기된경우, UI TYPE이 Class, Final Class가 아닌경우 SKIP.
        if(ls_0022.ISDEP === "X" || ls_0022.ISSTP === "X" || ( ls_0022.OBJTY !== "1" && ls_0022.OBJTY !== "4" )){
          continue;
        }

        //라이브러리 정보 검색.
        var ls_0020 = oAPP.DATA.LIB.T_0020.find( a => a.UILIK === ls_0022.UILIK );

        //해당 라이브러리가 사용되지 않는경우 skip.
        if(ls_0020.NUSED === "X"){continue;}

        ls_list.UICON = oAPP.fn.fnGetSapIconPath(ls_0022.UICON);
        ls_list.UIOBJ = ls_0022.UIOBJ;
        ls_list.UIOMD = ls_0022.UIOMD;
        ls_list.UIOBK = ls_0022.UIOBK;


        //추가 가능한 경우 해당 UI 수집 처리.
        lt_0022.push(ls_list);
        ls_list = {};

      }

      oMdl.setData({"T_LIST":lt_0022},true);

      //UI명 검색필드로 FOCUS처리.
      oInp2.focus();

    }); //Aggregation Name DDLB 선택 이벤트.



    var oItm1 = new sap.ui.core.Item({key:"{UIATK}",text:"{UIATT}"});
    oSel1.bindAggregation("items",{path:"/T_SEL",template:oItm1});

    var oFrmElem2 = new sap.ui.layout.form.FormElement({visible:false});
    oFrmCont1.addFormElement(oFrmElem2);

    var oLab2 = new sap.m.Label({design: "Bold",text: "Generated Cnt"});
    oFrmElem2.setLabel(oLab2);

    //UI 추가 건수 입력필드.
    var oInp1 = new sap.m.Input({type:"Number", maxLength:CV_MAX_LEN, value:1,description:"Max : " + CV_MAX_CNT});
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

      //문자 제거.
      l_val = l_val.replace(/[^0-9.]/g, "");

      //숫자로 변환 처리.
      l_val = parseInt(l_val);

      //10건이상을 입력했다면 MAX 10으로 설정.
      if(l_val > CV_MAX_CNT){
        l_val = CV_MAX_CNT;
      }

      //세팅된 값을 재 매핑 처리.
      oInp1.setValue(l_val);

      oInp2.focus();

    }); //UI 추가 건수 입력필드 변경 이벤트.




    var oFrmElem3 = new sap.ui.layout.form.FormElement();
    oFrmCont1.addFormElement(oFrmElem3);

    var oLab9 = new sap.m.Label({design: "Bold",text: "UI Object"});
    oFrmElem3.setLabel(oLab9);

    var oInp2 = new sap.m.Input();
    oFrmElem3.addField(oInp2);

    //ui 검색 필드 Suggest 처리.
    oAPP.fn.setUiSuggest(oInp2, "insertUiName");

    //ui 검색 이벤트.
    oInp2.attachChange(function(){
        var l_val = this.getValue();

        var l_bind = oTab1.getBinding("rows");
        if(!l_bind){return;}

        var l_filter;
        if(l_val !== ""){
          l_filter = new sap.ui.model.Filter({path:"UIOBJ",operator:"Contains",value1:l_val});
        }

        l_bind.filter(l_filter);

    }); //ui 검색 이벤트.




    //결과 테이블
    var oTab1 = new sap.ui.table.Table({selectionMode: "Single",selectionBehavior:"Row",rowHeight:30,
      visibleRowCountMode:"Auto",layoutData:new sap.m.FlexItemData({growFactor:1})});

    //테이블 스크롤 이벤트.
    oTab1.attachFirstVisibleRowChanged(function(){
      //현재 선택된 DOM focus out 처리.
      document.activeElement.blur();
    });

    //table 더블클릭 이벤트.
    oTab1.attachBrowserEvent("dblclick",function(oEvent){

      //이벤트 발생 UI 정보 얻기.
      var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target,sap.ui.getCore());

      //UI정보를 얻지 못한 경우 exit.
      if(!l_ui){return;}

      //바인딩정보 얻기.
      var l_ctxt = l_ui.getBindingContext();

      //바인딩 정보를 얻지 못한 경우 exit.
      if(!l_ctxt){return;}

      //선택 처리건에 대한 return.
      lf_selectUi(l_ctxt.getProperty());


    }); //tree 더블클릭 이벤트.


    oVbox1.addItem(oTab1);

    var oCol1 = new sap.ui.table.Column({hAlign:"Center",width:"80px"});
    oTab1.addColumn(oCol1);

    var oImage = new sap.m.Image({src:"{UICON}",width:"19px"});
    oCol1.setTemplate(oImage);

    var oLab4 = new sap.m.Label({design: "Bold",text: "Img"});
    oCol1.setLabel(oLab4);

    var oCol2 = new sap.ui.table.Column({autoResizable:true,filterProperty:"UIOBJ",sortProperty:"UIOBJ"});
    oTab1.addColumn(oCol2);

    var oLab3 = new sap.m.Label({design: "Bold",text: "UI Object"});
    oCol2.setLabel(oLab3);

    var oTxt1 = new sap.m.Text({text:"{UIOBJ}"});
    oCol2.setTemplate(oTxt1);

    var oCol3 = new sap.ui.table.Column({autoResizable:true,filterProperty:"UIOMD",sortProperty:"UIOMD"});
    oTab1.addColumn(oCol3);

    var oLab6 = new sap.m.Label({design: "Bold",text: "UI Object(Fullname)"});
    oCol3.setLabel(oLab6);

    var oTxt2 = new sap.m.Text({text:"{UIOMD}"});
    oCol3.setTemplate(oTxt2);

    var oCol4 = new sap.ui.table.Column({hAlign:"Center",width:"120px",filterProperty:"UIOBK",sortProperty:"UIOBK"});
    oTab1.addColumn(oCol4);

    var oLab7 = new sap.m.Label({design: "Bold",text: "UI Key"});
    oCol4.setLabel(oLab7);

    var oTxt4 = new sap.m.Text({text:"{UIOBK}"});
    oCol4.setTemplate(oTxt4);

    var oCol5 = new sap.ui.table.Column({hAlign:"Center",width:"80px"});
    oTab1.addColumn(oCol5);

    var oLab8 = new sap.m.Label({design: "Bold",text: "UI Info"});
    oCol5.setLabel(oLab8);

    var oIcon2 = new sap.ui.core.Icon({src:"sap-icon://sys-help",height:"20px"});
    oCol5.setTemplate(oIcon2);

    var oRow1 = new sap.ui.table.Row();
    oTab1.bindAggregation("rows",{path:"/T_LIST",template:oRow1});

    //확인 버튼
    var oBtn1 = new sap.m.Button({icon: "sap-icon://accept",text: "Confirm",type: "Accept", tooltip:"Confirm"});
    oDlg.addButton(oBtn1);

    oBtn1.attachPress(function(){
      //table의 선택 라인 index 얻기.
      var l_sidx = oTab1.getSelectedIndex();

      //선택한 라인이 없는경우 오류 처리.
      if(l_sidx === -1){
        parent.showMessage(sap, 20, "E", "라인을 선택해 주십시오.");
        return;
      }
            
      //선택 처리건에 대한 return.
      lf_selectUi(oTab1.getContextByIndex(l_sidx).getProperty());


    });


    //종료버튼
    var oBtn2 = new sap.m.Button({icon: "sap-icon://decline",text: "Cancel",type: "Reject", tooltip:"Cancel"});
    oDlg.addButton(oBtn2);
    oBtn2.attachPress(function(){
      oDlg.close();
      oDlg.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", "Cancel operation");
    });

    oDlg.open();


    

    //UI 선택처리 FUNCTION.
    function lf_selectUi(is_UI){

      var l_ret = {};

      var l_selky = oSel1.getSelectedKey();

      //ddlb 선택한정보(23번 테이블 구조)
      l_ret.E_EMB_AGGR = oAPP.DATA.LIB.T_0023.find(a => a.UIATK === l_selky);

      
      //리스트 선택정보(22번 테이블 구조)
      l_ret.E_UIOBJ = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === is_UI.UIOBK );

      //리스트에서 선택한 ui가 갖고 있는 aggr 정보(23번 테이블)
      l_ret.E_AGGRT = oAPP.DATA.LIB.T_0023.filter(a => a.UIOBK === l_ret.E_UIOBJ.UIOBK && a.UIATY === "3" && a.ISDEP !== "X");

      //반복해서 만들 ui 갯수
      l_ret.E_CRTCNT = oInp1.getValue();

      //ui 검색필드 suggest 정보 저장 처리.
      oAPP.fn.saveUiSuggest("insertUiName", l_ret.E_UIOBJ.UIOBJ, 10)


      //팝업 종료.
      oDlg.close();
      oDlg.destroy();

      //return parameter 전달.
      retFunc(l_ret);


    } //UI 선택처리 FUNCTION.

  };

})();
