(function(){
  //가운데 페이지(미리보기 영역) 구성
  oAPP.fn.uiPreviewArea = function(oMPage){

    //미리보기 영역 구성.
    var oMfrm1 = new sap.ui.core.HTML({content:"<div style='width:100%; height:100%; overflow:hidden;'>" +
      "<iframe id='prevHTML' name='prevHTML' style='width:100%; height:100%;' frameborder=0 " +
      "framespacing=0 marginheight=0 marginwidth=0 ></iframe></div>"});
    oMPage.addContent(oMfrm1);

    var oTool = new sap.m.Toolbar();
    oMPage.setCustomHeader(oTool);

    var oTitle = new sap.m.Title({text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67", "", "", "", "")});
    oTool.addContent(oTitle);

    oTool.addContent(new sap.m.ToolbarSpacer());

    //B17  Reset
    //미리보기 확대 축소 초기화.
    var oBtn = new sap.m.Button({icon:"sap-icon://refresh", 
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B17", "", "", "", "")});
    oTool.addContent(oBtn);

    oBtn.attachPress(function(){
      oSlid.setValue(1);
      oAPP.attr.ui.frame.contentWindow.setPreviewZoom(1);
    })

    //미리보기 확대 축소 비율 조절 slider.
    var oSlid = new sap.m.Slider({width:"200px", min:0.1, max:2, step:0.1, value:1});
    oTool.addContent(oSlid);

    //slider변경 이벤트
    oSlid.attachChange(function(){

      oAPP.attr.ui.frame.contentWindow.setPreviewZoom(this.getValue());

    }); //slider변경 이벤트


    //미리보기 전체화면 스위치.
    //C23	Full Screen
    var oBtnFull = new sap.m.Switch({tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C23", "", "", "", "")});
    oTool.addContent(oBtnFull);

    //미리보기 전체화면 스위치 변경 이벤트.
    oBtnFull.attachChange(function(){
      oAPP.fn.prevFullScreen(this.getState());
    });//미리보기 전체화면 스위치 변경 이벤트.


    //B39	Help
    //도움말 버튼.
    var oLBtnHelp = new sap.m.Button({icon:"sap-icon://question-mark", 
      // visible:parent.REMOTE.app.isPackaged ? false : true,
      tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B39", "", "", "", "")});
    oTool.addContent(oLBtnHelp);

    //도움말 버튼 선택 이벤트.
    oLBtnHelp.attachPress(function(){

      parent.setBusy("X");

      //단축키 잠금 처리.
      oAPP.fn.setShortcutLock(true);

      var l_ui = this;

      //attribute 도움말 팝업 function이 존재하는경우.
      if(typeof oAPP.fn.callTooltipsPopup !== "undefined"){
        //attribute 도움말 팝업 호출.
        //E22  Preview Area
        oAPP.fn.callTooltipsPopup(l_ui, "prevTooltip", "E22");
        return;
      }

      //attribute 도움말 팝업 function이 존재하지 않는경우 script 호출.
      oAPP.fn.getScript("design/js/callTooltipsPopup",function(){
        //attribute 도움말 팝업 호출.
        //E22  Preview Area
        oAPP.fn.callTooltipsPopup(l_ui, "prevTooltip", "E22");
      });

    }); //도움말 버튼 선택 이벤트.


  };  //가운데 페이지(미리보기 영역) 구성





  //미리보기 iframe 영역 구성.
  oAPP.fn.loadPreviewFrame = function(bReset){

    //🦺자주 사용할 내용에 대해서 util로 기능을 빼놓기.
    function lf_setParam(oForm, name, value){

      var iput = document.createElement("input");
          iput.setAttribute("name", name);
          iput.setAttribute("value", value);
          iput.setAttribute("type", "hidden");
          oForm.appendChild(iput);

    }

    //초기화 처리 하는경우.
    if(bReset === true){

      //미리보기 영역 onAfterRendering 제거.
      oAPP.attr.ui.oDesignPreview.removeEventDelegate(oAPP.fn.prevFrameReload);

      //frame 정보 초기화.
      oAPP.attr.ui.frame = null;
    }

    //미리보기 html 정보가 로드되지 않은경우.
    if(!oAPP.attr.ui.frame || !oAPP.attr.ui.frame.contentWindow){
      oAPP.attr.ui.frame = document.getElementById("prevHTML");

      var l_info = parent.getUserInfo();

      var oform = document.createElement("form");
      oform.setAttribute("id",     "prvSendForm");
      oform.setAttribute("target", oAPP.attr.ui.frame.id);
      oform.setAttribute("method", "POST");
      oform.setAttribute("action", parent.getHost() + "/zu4a_wbc/u4a_ipcmain/getPrevHTML");
      oform.style.display = "none";

      //client 파라메터 추가.
      lf_setParam(oform, "sap-client", l_info.CLIENT);

      //접속 언어 파라메터 추가.
      lf_setParam(oform, "sap-language", l_info.LANGU);

      //SAP 접속 ID 파라메터 추가.
      lf_setParam(oform, "sap-user", l_info.ID);

      //SAP 접속 PW 파라메터 추가.
      lf_setParam(oform, "sap-password", l_info.PW);

      //라이브러리 bootstrap 경로 파라메터 추가.
      lf_setParam(oform, "LIBPATH", oAPP.fn.getBootStrapUrl());

      
      //20250117 PES -START.
      //U4A, SAPUI6 라이브러리 PATH 정보 추가 처리.
      var sUA025 = oAPP.attr.S_CODE.UA025.find( a => a.FLD01 === "U4A_LIB"  && a.FLD06 === "X" );

      if(typeof sUA025 !== "undefined"){
        //U4A 라이브러리 PATH 정보 구성.
        lf_setParam(oform, "LIBPATH_U4A", sUA025.FLD04 + sUA025.FLD05);
      }
      

      var sUA025 = oAPP.attr.S_CODE.UA025.find( a => a.FLD01 === "UI6_LIB"  && a.FLD06 === "X" );

      if(typeof sUA025 !== "undefined"){
        //SAPUI6 라이브러리 PATH 정보 구성.
        lf_setParam(oform, "LIBPATH_UI6", sUA025.FLD04 + sUA025.FLD05);
      }      
      //20250117 PES -END.


      //20250212 PES -START.
      //AM5 차트의 라이브러리 정보도 서버 전송 데이터에 구성 처리.
      var sUA025 = oAPP.attr.S_CODE.UA025.find( a => a.FLD01 === "AM5CHART"  && a.FLD06 === "X" );

      if(typeof sUA025 !== "undefined"){
        //SAPUI6 라이브러리 PATH 정보 구성.
        lf_setParam(oform, "LIBPATH_AM5", sUA025.FLD04 + sUA025.FLD05);
      }      
      //20250212 PES -END.


      //LOAD 대상 LIBRARY 항목 파라메터 추가.
      lf_setParam(oform, "LIBRARY", oAPP.fn.getUi5Libraries(true));

      //미리보기 THEME 정보 파라메터 추가.
      lf_setParam(oform, "THEME", oAPP.DATA.APPDATA.S_0010.UITHM);
      
      document.body.appendChild(oform);

      oform.submit();

      //미리보기 영역이 onAfterRendering 호출되는경우 다시 미리보기 영역을 load처리.
      oAPP.attr.ui.oDesignPreview.addEventDelegate(oAPP.fn.prevFrameReload);

      //🦺body에 추가 하는게 아니라 이런 용도로 보이지 않는 dom을 만들어
      //해당 영역에 추가.
      //그리고 나갈때 삭제 한다던가 해야함.
      setTimeout(() => {
        document.body.removeChild(oform);
      }, 0);

 
      // //미리보기 서버 URL 정보 구성.
      // oAPP.attr.ui.frame.src = parent.getHost() + "/zu4a_wbc/u4a_ipcmain/getPrevHTML?" +
      //   "sap-client=" + l_info.CLIENT +  
      //   "&sap-language=" + l_info.LANGU + 
      //   "&sap-user=" + l_info.ID +
      //   "&sap-password=" + l_info.PW +
      //   "&LIBPATH=" + oAPP.fn.getBootStrapUrl() + 
      //   "&LIBRARY=" + oAPP.fn.getUi5Libraries(true) +
      //   "&THEME=" + encodeURIComponent(oAPP.DATA.APPDATA.S_0010.UITHM);

      return;

    }

    //미리보기 화면 구성.
    if(oAPP.attr.ui.frame.contentWindow && oAPP.attr.ui.frame.contentWindow._loaded === true){
      
      //미리보기 화면 제거.
      oAPP.attr.ui.frame.contentWindow.removePreviewPage();

      //테마 구성.
      oAPP.attr.ui.frame.contentWindow.setPreviewUiTheme(oAPP.DATA.APPDATA.S_0010.UITHM);

      //라이브러리 로드 처리.
      oAPP.attr.ui.frame.contentWindow.setUiLoadLibraries(oAPP.fn.getUi5Libraries());

      //미리보기 ui 구성
      oAPP.attr.ui.frame.contentWindow.drawPreview();

    }


  };  //미리보기 iframe 영역 구성.




  //미리보기 영역 다시 로드 처리.
  oAPP.fn.prevFrameReload = {onAfterRendering:function(){

    //미리보기에서 사용하는 광역 변수 초기화.
    delete oAPP.attr.ui.prevRootPage;
    delete oAPP.attr.ui._page1;
    delete oAPP.attr.ui.prevPopupArea;
    delete oAPP.attr.ui._hbox1;
    delete oAPP.attr.ui.oMenu;
    oAPP.attr.popup = [];

    //미리보기 iframe 다시 load 처리.
    oAPP.fn.loadPreviewFrame(true);

  }};  //미리보기 영역 다시 로드 처리.
  



  //sap.ui.getCore().loadLibrary 처리 대상건 구성.
  oAPP.fn.getUi5Libraries = function(bFirst){

    var lt_lib = [], l_indx;

    for(var i=0, l=oAPP.DATA.APPDATA.T_0014.length; i<l; i++){

      if(oAPP.DATA.APPDATA.T_0014[i].TGLIB === ""){continue;}

      if(oAPP.DATA.APPDATA.T_0014[i].TGLIB.indexOf("u4a") !== -1){continue;}

      if(oAPP.DATA.APPDATA.T_0014[i].TGLIB.indexOf("sapui6") !== -1){continue;}

      l_indx = lt_lib.findIndex( a => a  === oAPP.DATA.APPDATA.T_0014[i].TGLIB );

      if(l_indx !== -1){continue;}

      lt_lib.push(oAPP.DATA.APPDATA.T_0014[i].TGLIB);

    }

    if(bFirst){
      //return encodeURIComponent(lt_lib.join(","));
      return lt_lib.join(",");
    }

    return lt_lib;

  } //sap.ui.getCore().loadLibrary 처리 대상건 구성.




  //UI5 bootstrap URL정보 얻기.
  oAPP.fn.getBootStrapUrl = function(){
    var ls_ua025;

    //-1차 필터 별도 Application
    ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" 
      && a.FLD01 === "WOK_" + oAPP.attr.appInfo.APPID
      && a.FLD06 === "X" );

    if(typeof ls_ua025 !== "undefined"){
      // return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
      return ls_ua025.FLD04 + ls_ua025.FLD05;
    }

    //-2차 필터 패키지
    ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" 
      && a.FLD01 === "WOK_" + oAPP.attr.appInfo.PACKG
      && a.FLD06 === "X" );

    if(typeof ls_ua025 !== "undefined"){
      // return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
      return ls_ua025.FLD04 + ls_ua025.FLD05;
    }

    //-3차 필터 전체대상
    ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" 
      && a.FLD01 === "WOK" && a.FLD06 === "X" );

    if(typeof ls_ua025 !== "undefined"){
      // return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
      return ls_ua025.FLD04 + ls_ua025.FLD05;
    }

  };  //UI5 bootstrap URL정보 얻기.



  //프로퍼티 설정 skip 처리 항목.
  oAPP.fn.prevSkipProp = function(is_attr){

    switch (is_attr.UIATK) {
      case "EXT00001188": //selectOption2 F4HelpID
      case "EXT00001189": //selectOption2 F4HelpReturnFIeld
      case "EXT00001190": //sap.m.Tree  Parent
      case "EXT00001191": //sap.m.Tree  Child
      case "EXT00001192": //sap.ui.table.TreeTable  Parent
      case "EXT00001193": //sap.ui.table.TreeTable  Child
      case "EXT00001213": //sap.m.App ChgAppToNavCont
      case "EXT00001214": //sap.m.NavContainer ChgAppToNavCont
      case "EXT00001347": //sap.ui.table.Table  autoGrowing
      case "EXT00001348": //sap.m.Table autoGrowing
      case "EXT00001349": //sap.m.List  autoGrowing
      case "EXT00001499": //sap.m.TreeItemBase  expandable
      case "EXT00001500": //sap.m.TreeItemBase  expandedIcon
      case "EXT00001501": //sap.m.TreeItemBase  collapsedIcon
      case "EXT00001502": //sap.m.TreeItemBase  treeIconColor
      case "EXT00001503": //sap.m.StandardTreeItem  expandable
      case "EXT00001504": //sap.m.StandardTreeItem  expandedIcon
      case "EXT00001505": //sap.m.StandardTreeItem  collapsedIcon
      case "EXT00001506": //sap.m.StandardTreeItem  treeIconColor
      case "EXT00001507": //sap.m.CustomTreeItem  expandable
      case "EXT00001508": //sap.m.CustomTreeItem  expandedIcon
      case "EXT00001509": //sap.m.CustomTreeItem  collapsedIcon
      case "EXT00001510": //sap.m.CustomTreeItem  treeIconColor
      case "EXT00001511": //sap.ui.table.Column rowSpanProperty
      case "EXT00001512": //sap.ui.table.Column rowSpanAlign
      case "EXT00001530": //sap.ui.table.Column colSpanProperty
      case "EXT00001531": //sap.ui.table.Column colSpanAlign
      case "EXT00002289": //sap.ui.table.Table autoColumnResize
      case "EXT00002373": //sap.m.Dialog noEscClose
      case "EXT00002374": //sap.m.Page  useBackToTopButton
      case "EXT00002378": //sap.uxap.ObjectPageLayout useBackToTopButton
      case "EXT00002379": //sap.f.DynamicPage useBackToTopButton
      case "EXT00002382": //sap.ui.table.Column markCellColor
      case "EXT00002394": //sap.m.Input preventKeypad
      case "EXT00002451": //sap.m.ComboBox preventKeypad
      case "EXT00002452": //sap.m.DatePicker preventKeypad
      case "EXT00002453": //sap.m.DateRangeSelection preventKeypad
      case "EXT00002454": //sap.m.DateTimePicker preventKeypad
      case "EXT00002455": //sap.m.MaskInput preventKeypad
      case "EXT00002456": //sap.m.MultiComboBox preventKeypad
      case "EXT00002457": //sap.m.MultiInput preventKeypad
      case "EXT00002458": //sap.m.SearchField preventKeypad
      case "EXT00002459": //sap.m.TextArea preventKeypad
      case "EXT00002460": //sap.m.TimePicker preventKeypad

      case "EXT00002534": //u4a.m.SelectOption3 F4HelpID
      case "EXT00002535": //u4a.m.SelectOption3 F4HelpReturnFIeld
      case "EXT00002536": //u4a.m.SelectOption3 optPopupWidth
      case "EXT00002537": //u4a.m.SelectOption3 optPopupHeight
      case "EXT00002538": //u4a.m.SelectOption3 optPopupTitle
      case "EXT00002539": //u4a.m.SelectOption3 optButtonType
      case "EXT00002540": //u4a.m.SelectOption3 optButtonIcon
      case "EXT00002541": //u4a.m.SelectOption3 showOptButton
            
        return true;
    
      default:
        break;
    }    

  };  //프로퍼티 설정 skip 처리 항목.




  //미리보기 화면 UI의 프로퍼티 변경 처리.
  oAPP.fn.previewUIsetProp = function(is_attr){
    
    //프로퍼티가 아닌경우 exit. 
    if(is_attr.UIATY !== "1"){return;}

    //최상위인 경우 exit.
    if(is_attr.OBJID === "ROOT"){return;}

    //styleClass 프로퍼티에 값을 입력한 경우.
    if(is_attr.UIATK.substr(0,3) === "EXT" && is_attr.UIASN === "STYLECLASS"){
      //미리보기 화면의 UI STYLECLASS 처리.
      oAPP.fn.previewUIaddStyleClass(is_attr);
      return;
    }

    //dragAble, dropAble 프로퍼티의 경우 처리할건이 존재하지 않기에 exit 처리.
    if(is_attr.UIASN === "DRAGABLE" || is_attr.UIASN === "DROPABLE"){
      return;
    }

    
    //20230119 PES.
    //미리보기 고정값에 해당하는 프로퍼티를 변경한 경우 미리보기 적용 SKIP 처리.
    //(미리보기에서 프로퍼티를 고정하는 이유는 미리보기에서 오류가 발생할 수 있기때문임)
    if(oAPP.attr.S_CODE.UA018.findIndex( a => a.FLD05 === is_attr.UIOBK && a.FLD02 === is_attr.UIATT ) !== -1){
      return;
    }

    
    //20230508 PES.
    //SELECT OPTION3 UI의 프로퍼티 예외처리건인경우 예외처리 후 하위 로직 SKIP.
    if(oAPP.fn.prevSetSelOpt3ExceptProp(is_attr)){return;}


    //직접 입력 가능한 aggregation인경우 해당 aggregation에 child UI가 존재하는지 여부 확인.
    if(is_attr.UIATK.indexOf("_1") !== -1){

      //현재 선택 라인 정보 얻기.
      var ls_tree = oAPP.fn.getTreeData(is_attr.OBJID);

      //직접 입력 가능 aggr의 임시 key 부분 제거.
      var l_UIATK = is_attr.UIATK.replaceAll("_1", "");

      if(ls_tree.zTREE.length !== 0){
        //직접 입력 가능한 aggr에 UI가 존재하는지 여부 확인.
        var l_child = ls_tree.zTREE.find( a => a.PUIATK === l_UIATK );

        //UI가 존재하는경우 EXIT.
        if(l_child){return;}

      }

    }

    //default property
    var l_uiaty = "1";

    //직접 입력가능한 aggregation인경우 UIATY을 aggregation으로 변경.
    if(is_attr.UIATK.indexOf("_1") !== -1){
      l_uiaty = "3";
    }

    //setProperty 명 얻기.
    var l_propnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[is_attr.OBJID], l_uiaty, is_attr.UIATT, "_sMutator");

    //바인딩 처리된 경우.
    if(is_attr.ISBND === "X"){
      //대상 프로퍼티 초기화 처리.
      try{
        oAPP.attr.prev[is_attr.OBJID][l_propnm]();
      }catch(e){
        
      }
      
      return;
    }


    //20250210 PES -START.
    //OTR 정보를 검색하기 위해 sync로 서버 호출 하는 로직 async로 변경 처리.
    //프로퍼티 otr 입력값 존재시 text 검색.
    // var l_prop = oAPP.fn.prevGetOTRText(is_attr) || is_attr.UIATV;
    oAPP.fn.prevGetOTRText(is_attr).then(function(OTRText){
      //20250210 PES -END.


      var l_prop = OTRText;

      if(typeof OTRText === "undefined"){
        l_prop = is_attr.UIATV;
      }


      var l_UIADT = is_attr.UIADT;

      //N건 입력이 가능한 프로퍼티 인경우.
      if(is_attr.ISMLB === "X"){
        //프로퍼티 TYPE에 []이 없다면 추가.
        if(l_UIADT.indexOf("[]") === -1){
          l_UIADT += "[]";
        }
      }

      //프로퍼티 타입에 따른 입력값 parse 처리.
      switch(l_UIADT){

        case "boolean":
          l_prop = false;
          if(is_attr.UIATV === "true"){
            l_prop = true;
          }
          break;

        case "int":
          l_prop = parseInt(is_attr.UIATV) || 0;
          break;

        case "float":
          l_prop = parseFloat(is_attr.UIATV) || 0;
          break;

        default:
          break;
      }


      //예외처리 대상 프로퍼티입력건 여부 확인.
      var l_ua032 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA032" && a.FLD01 === is_attr.UIOBK && a.FLD03 === is_attr.UIATT && a.FLD06 !== "X" );
      
      //예외처리 대상 프로퍼티를 입력한 경우.
      if(l_ua032 && l_ua032.FLD07 !== ""){
        //해당 function을 수행한 결과값으로 변경 처리.
        l_prop = oAPP.attr.ui.frame.contentWindow[l_ua032.FLD07](l_prop);
        
      }

      //sap.ui.core.HTML의 content 프로퍼티 입력값인경우.
      if(is_attr.UIATK === "AT000011858"){
        //HTML CONTENT 입력건 검색.
        var ls_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === "HM" );

        var l_UIATV = "";

        if(typeof ls_cevt !== "undefined"){
          //20230303 pes.
          //sap.ui.core.HTML의 content에 입력값을 반영하는 과정에서
          //ls_cevt.DATA 안에 HTML tag가 없이 text만이 존재할때 
          //.이 있으면 오류가 나는 문제가 있기에 <div> tag로 감싸는 로직 추가.
          //(HTML.setContent("asdasd.")); -> HTML.setContent("<div>" + "asdasd." + "</div>"));
          //l_UIATV = ls_cevt.DATA;        
          l_UIATV = "<div>" + ls_cevt.DATA + "</div>";
        }

        oAPP.attr.prev[is_attr.OBJID][l_propnm](l_UIATV);
        return;

      }


      //프로퍼티 입력값 정합성 점검.
      if(oAPP.fn.chkValidProp(is_attr) === false){
        //입력 불가능한 프로퍼티를 입력한 경우.

        //프로퍼티 정보 검색.
        var ls_0023 = oAPP.DATA.LIB.T_0023.find( a=> a.UIATK === is_attr.UIATK );

        //프로퍼티 정보를 찾은경우.
        if(ls_0023){
          //해당 프로퍼티의 default value를 매핑.
          l_prop = ls_0023.DEFVL;
        }

      }

      //UI.setProperty(value); 처리.
      try{
        oAPP.attr.prev[is_attr.OBJID][l_propnm](l_prop);
      }catch(e){

      }

    });
    
  };  //미리보기 화면 UI의 프로퍼티 변경 처리.




  //직접 입력 가능한 aggregation의 UI가 제거될때 이전 직접 입력건 존재시 해당 값으로 세팅.
  oAPP.fn.previewSetStrAggr = function(is_tree){

    //EMBED AGGREGATION의 UI ATTRIBUTE KEY가 없다면 EXIT.
    if(is_tree.PUIATK === ""){return;}

    //부모 UI정보가 없다면 EXIT.
    if(is_tree.POBID === ""){return;}
    if(!oAPP.attr.prev[is_tree.POBID]){return;}

    //부모 UI의 ATTR 변경건 정보가 없다면 EXIT.
    if(!oAPP.attr.prev[is_tree.POBID]._T_0015){return;}
    if(oAPP.attr.prev[is_tree.POBID]._T_0015.length === 0){return;}

    //부모 ATTR 변경건중 직접 입력 가능한 AGGR 입력건 존재 여부 확인.
    var ls_0015 = oAPP.attr.prev[is_tree.POBID]._T_0015.find( a=> a.UIATK === is_tree.PUIATK + "_1" );

    //직접 입력가능한 AGGR 입력건이 존재하지 않는경우 EXIT.
    if(!ls_0015){return;}

    //존재하는경우 미리보기 변경처리.
    oAPP.fn.previewUIsetProp(ls_0015);


  };  //직접 입력 가능한 aggregation의 UI가 제거될때 이전 직접 입력건 존재시 해당 값으로 세팅.




  //미리보기 UI styleClass 프로퍼티 처리.
  oAPP.fn.previewUIaddStyleClass = function(is_attr){

    var l_ui = oAPP.attr.prev[is_attr.OBJID];

    //이전에 적용한 style class 제거 처리.
    if(l_ui.aCustomStyleClasses){
      l_ui.removeStyleClass(l_ui.aCustomStyleClasses.join(" "));
    }

    l_ui.addStyleClass(is_attr.UIATV);

  };  //미리보기 UI styleClass 프로퍼티 처리.




  //대상 UI instnace의 UIOBJ명 얻기.
  oAPP.fn.getUIOBJname = function(oUI){

    for(var i in oAPP.attr.prev){

      if(oAPP.attr.prev[i] === oUI){
        return i;
      }

    }

  };  //대상 UI instnace의 UIOBJ명 얻기.




  //프로퍼티에 값 구성시 따옴표 처리 여부.
  oAPP.fn.setPropDoqu = function(UIADT){

    //프로퍼티 타입에 따른 따옴표 적용여부.
    switch(UIADT){

      case "boolean":
      case "int":
      case "float":
        //따옴표 적용 불필요.
        return "";
        break;

      default:
        //그외건인경우 따옴표 적용.
        return '"';
        break;

    }

  };  //프로퍼티에 값 구성시 따옴표 처리 여부.




  //sap.ui.core.HTML UI의 content 프로퍼티 입력건 검색.
  oAPP.fn.setHTMLContentProp = function(is_0015){
    
    //sap.ui.core.HTML UI의 content 프로퍼티가 아닌경우 exit.
    if(is_0015.UIATK !== "AT000011858"){return;}

    //HTML, script 구성건이 존재하지 않는경우 exit.
    if(oAPP.DATA.APPDATA.T_CEVT.length === 0){return;}

    //sap.ui.core.HTML UI의 content 프로퍼티 입력건에 해당하는 정보 검색.
    var l_find = oAPP.DATA.APPDATA.T_CEVT.find( a=> a.OBJTY === "HM" && a.OBJID === is_0015.OBJID + is_0015.UIASN);

    //찾지못한경우 exit.
    if(typeof l_find === "undefined"){return;}

    //20230303 pes.
    //sap.ui.core.HTML의 content에 입력값을 반영하는 과정에서
    //ls_cevt.DATA 안에 HTML tag가 없이 text만이 존재할때 
    //.이 있으면 오류가 나는 문제가 있기에 <div> tag로 감싸는 로직 추가.
    //(HTML.setContent("asdasd.")); -> HTML.setContent("<div>" + "asdasd." + "</div>"));
    let _UIATV = "<div>" + l_find.DATA + "</div>";

    return _UIATV;

    //HTML content에 입력한 정보가 존재하는경우 return.
    l_find = JSON.stringify(l_find.DATA);

    return l_find.substr(1, l_find.length - 2);

  };  //sap.ui.core.HTML UI의 content 프로퍼티 입력건 검색.




  //미리보기 예외처리 UI 추가 draw 처리.
  oAPP.fn.prevDrawExceptionUi = function(UIOBK, OBJID){

    //AppContain, IFrame UI에 대한 미리보기 추가 draw 처리.
    if(oAPP.fn.prevSetUiExcepMark(UIOBK, OBJID)){return;}


    //am radar chart 미리보기 화면 그리기 처리.
    if(oAPP.fn.prevAmRadarChartsDraw(UIOBK, OBJID)){return;}


    //am radar chart 미리보기 화면 그리기 처리.
    if(oAPP.fn.prevAmSerialChartStackDraw(UIOBK, OBJID)){return;}


    //Am Serial Chart Composite 미리보기 화면 그리기 처리.
    if(oAPP.fn.prevAmSerialChartCompositeDraw(UIOBK, OBJID)){return;}


    //Am Serial Chart 미리보기 화면 그리기 처리.
    if(oAPP.fn.prevAmSerialChartDraw(UIOBK, OBJID)){return;}


    ////Am Pie Chart 미리보기 화면 그리기 처리.
    if(oAPP.fn.prevAmPieChartDraw(UIOBK, OBJID)){return;}


  };  //미리보기 예외처리 UI 추가 draw 처리.




  //am radar chart 미리보기 화면 그리기.
  oAPP.fn.prevAmRadarChartsDraw = function(UIOBK, OBJID){

    //AmRadarCharts가 아닌경우 EXIT.
    if(UIOBK !== "UO99985"){return;}

    //UI, AM CHART UI가 구성되지 않은경우 EXIT.
    if(!oAPP.attr.prev[OBJID] && !oAPP.attr.prev[OBJID]._c){
      return;
    }

    var oChart = oAPP.attr.prev[OBJID]._c;
    
    //미리보기에 출력할 차트 DATA 구성.
    oChart.dataProvider = [{"f1":"sample01", "f2":10},
                           {"f1":"sample02", "f2":20},
                           {"f1":"sample03", "f2":30}];

    oChart.categoryField = "f1";

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //RADAR 그래프 정보 생성.
    grph.valueField = "f2";
    grph.bullet = "round";
    grph.fillColors = "#678BC7";
    grph.fillAlphas = "0.5";
    grph.lineAlphas = 1;
    grph.lineThickness = 1;
    grph.lineColor = "#678BC7";
    grph.title = "graph1";
    oChart.addGraph(grph);
    oChart.validateData();
    oChart.validateNow();

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //am radar chart 미리보기 화면 그리기.




  //Am Serial Chart Stack 미리보기 화면 그리기.
  oAPP.fn.prevAmSerialChartStackDraw = function(UIOBK, OBJID){

    //AmSerialChartStack가 아닌경우 EXIT.
    if(UIOBK !== "UO99987"){return;}

    //UI, AM CHART UI가 구성되지 않은경우 EXIT.
    if(!oAPP.attr.prev[OBJID] && !oAPP.attr.prev[OBJID]._c){
      return;
    }

    var oChart = oAPP.attr.prev[OBJID]._c;
    
    //미리보기에 출력할 차트 DATA 구성.
    oChart.dataProvider = [{"f1":"sample01", "f2":10, "f3":30},
                           {"f1":"sample02", "f2":20, "f3":20},
                           {"f1":"sample03", "f2":30, "f3":10}];

    oChart.categoryField = "f1";

    var axis = new oAPP.attr.ui.frame.contentWindow.AmCharts.ValueAxis();
    axis.stackType = "regular";
    oChart.addValueAxis(axis);

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //누적막대 그래프 정보 생성.
    grph.valueField = "f2";
    grph.fillColors = "#678BC7";
    grph.fillAlphas = "1";
    grph.lineAlphas = 1;
    grph.lineThickness = 1;
    grph.lineColor = "#678BC7";
    grph.title = "graph1";
    grph.type = "column";    
    oChart.addGraph(grph);

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //누적막대 그래프 정보 생성.
    grph.valueField = "f3";
    grph.fillColors = "#925ACE";
    grph.fillAlphas = "1";
    grph.lineAlphas = 1;
    grph.lineThickness = 1;
    grph.lineColor = "#925ACE";
    grph.title = "graph2";
    grph.type = "column";
    oChart.addGraph(grph);

    oChart.validateData();
    oChart.validateNow();

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //Am Serial Chart Stack 미리보기 화면 그리기.




  //Am Serial Chart Composite 미리보기 화면 그리기.
  oAPP.fn.prevAmSerialChartCompositeDraw = function(UIOBK, OBJID){

    //AmSerialChartComposite가 아닌경우 EXIT.
    if(UIOBK !== "UO99988"){return;}

    //UI, AM CHART UI가 구성되지 않은경우 EXIT.
    if(!oAPP.attr.prev[OBJID] && !oAPP.attr.prev[OBJID]._c){
      return;
    }

    var oChart = oAPP.attr.prev[OBJID]._c;
    
    //미리보기에 출력할 차트 DATA 구성.
    oChart.dataProvider = [{"f1":"sample01", "f2":10, "f3":30},
                           {"f1":"sample02", "f2":20, "f3":20},
                           {"f1":"sample03", "f2":30, "f3":10}];

    oChart.categoryField = "f1";

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //막대 그래프 정보 생성.
    grph.valueField = "f2";
    grph.fillColors = "#678BC7";
    grph.fillAlphas = "1";
    grph.lineAlphas = 1;
    grph.lineThickness = 1;
    grph.lineColor = "#678BC7";
    grph.title = "graph1";
    grph.type = "column";    
    oChart.addGraph(grph);

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //꺾은선 그래프 정보 생성.
    grph.valueField = "f3";
    grph.lineAlphas = 1;
    grph.lineThickness = 5;
    grph.lineColor = "#925ACE";
    grph.title = "graph2";
    grph.type = "line";
    oChart.addGraph(grph);

    oChart.validateData();
    oChart.validateNow();

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //Am Serial Chart Composite 미리보기 화면 그리기.




  //Am Serial Chart 미리보기 화면 그리기.
  oAPP.fn.prevAmSerialChartDraw = function(UIOBK, OBJID){

    //AmSerialChart가 아닌경우 EXIT.
    if(UIOBK !== "UO99990"){return;}

    //UI, AM CHART UI가 구성되지 않은경우 EXIT.
    if(!oAPP.attr.prev[OBJID] && !oAPP.attr.prev[OBJID]._c){
      return;
    }

    var oChart = oAPP.attr.prev[OBJID]._c;
    
    //미리보기에 출력할 차트 DATA 구성.
    oChart.dataProvider = [{"f1":"sample01", "f2":10, "f3":30},
                           {"f1":"sample02", "f2":20, "f3":20},
                           {"f1":"sample03", "f2":30, "f3":10}];

    oChart.categoryField = "f1";

    var grph = new oAPP.attr.ui.frame.contentWindow.AmCharts.AmGraph();

    //RADAR 그래프 정보 생성.
    grph.valueField = "f2";
    grph.fillColors = "#678BC7";
    grph.fillAlphas = "1";
    grph.lineAlphas = 1;
    grph.lineThickness = 1;
    grph.lineColor = "#678BC7";
    grph.title = "graph1";
    grph.type = "column";    
    oChart.addGraph(grph);
    
    oChart.validateData();
    oChart.validateNow();

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //Am Serial Chart 미리보기 화면 그리기.




  //Am Pie Chart 미리보기 화면 그리기.
  oAPP.fn.prevAmPieChartDraw = function(UIOBK, OBJID){

    //AmPieChart가 아닌경우 EXIT.
    if(UIOBK !== "UO99989"){return;}

    //UI, AM CHART UI가 구성되지 않은경우 EXIT.
    if(!oAPP.attr.prev[OBJID] && !oAPP.attr.prev[OBJID]._c){
      return;
    }

    var oChart = oAPP.attr.prev[OBJID]._c;
    
    //미리보기에 출력할 차트 DATA 구성.
    oChart.dataProvider = [{"f1":"sample01", "f2":10},
                           {"f1":"sample02", "f2":20},
                           {"f1":"sample03", "f2":30}];

    oChart.titleField = "f1";
    oChart.valueField = "f2";
 
    oChart.validateData();
    oChart.validateNow();

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;

  };  //Am Pie Chart 미리보기 화면 그리기.



  //미리보기 예외처리 UI 표시.
  oAPP.fn.prevSetUiExcepMark = function(UIOBK, OBJID){

    var l_text = "";
    switch(UIOBK){
      case "UO99993": //AppContain
        l_text = "Application Container";
        break;

      case "UO99996": //IFrame
        l_text = "IFRAME";
        break;

      default:
        return;
    }

    //onAfterRendering에서 dom에 text를 직접 매핑 처리.
    oAPP.attr.prev[OBJID].addEventDelegate({onAfterRendering:function(e){

      //dom 정보 얻기.
      var l_dom = e.srcControl.getDomRef();

      //dom 정보를 얻지 못한 경우 exit.
      if(!l_dom){return;}

      //구성한 text 매핑.
      l_dom.innerHTML = l_text;

      //text 가운데 정렬.
      l_dom.style.textAlign = "center";

    }});

    //function 호출처의 하위로직 skip을 위한 flag return.
    return true;


  }; //미리보기 예외처리 UI 표시.




  //OTR TEXT정보 검색.
  oAPP.fn.prevParseOTRValue = function(is_0015){

    //검색한 OTR 항목이 존재하지 않는경우 EXIT.
    if(oAPP.DATA.APPDATA.T_OTR.length === 0){return;}

    //프로퍼티가 아닌경우  EXIT.
    if(is_0015.UIATY !== "1"){return;}

    //바인딩 처리가 된경우 EXIT.
    if(is_0015.ISBND === "X"){return;}

    //프로퍼티의 시작값이 $OTR:로 시작하지 않는경우 EXIT.
    if(is_0015.UIATV.substr(0,5) !== "$OTR:"){return;}

    //서버에서 수집한 OTR 정보 검색.
    var l_otr = oAPP.DATA.APPDATA.T_OTR.find( a => a.NAME === is_0015.UIATV.substr(5));

    //검색한 결과가 존재하지 않는경우 EXIT.
    if(!l_otr){return;}

    //OTR 정보를 찾은경우 찾은 TEXT 정보 RETURN.
    return l_otr.VALUE;

  };  //OTR TEXT정보 검색.




  //OTR TEXT 검색.
  oAPP.fn.prevGetOTRText = function(is_attr){

    return new Promise(function(resolve){

      //프로퍼티가 아닌경우 EXIT.
      if(is_attr.UIATY !== "1"){
        return resolve();
      }

      //입력값이 존재하지 않는경우 EIXT.
      if(is_attr.UIATV === ""){
        return resolve();
      }

      //바인딩 처리된경우 EXIT.
      if(is_attr.ISBND === "X"){
        return resolve();
      }

      //프로퍼티의 시작값이 $OTR:로 시작하지 않는경우 EXIT.
      if(is_attr.UIATV.substr(0,5) !== "$OTR:"){
        return resolve();
      }
      
      //OTR alias 정보 구성.
      var oFormData = new FormData();
      oFormData.append("ALIAS", is_attr.UIATV.substr(5));
      
      var l_text;

      //OTR text 검색을 위한 서버 호출.
      sendAjax(oAPP.attr.servNm + "/getOTRText", oFormData, function(param){

        //오류가 발생한 경우 EXIT.
        if(param.RETCD === "E"){
          return resolve();
        }
        
        //검색에 성공한 경우 TEXT 정보 RETURN.
        return resolve(param.TEXT);
        
      });
      
    });

  };  //OTR TEXT 검색 처리.




  //현재 출력된 미리보기 화면을 Skeleton Screen으로 설정처리.
  oAPP.fn.prevSetSkeletonScreen = function(){

    //Skeleton 팝업 정보가 존재하는경우 호출 처리.
    if( typeof oAPP.fn.prevSetSkeletonScreen.oppner !== "undefined"){
      oAPP.fn.prevSetSkeletonScreen.oppner();
      return;
    }

    //Skeleton 팝업을 load하지 못한경우.
    oAPP.fn.getScript("design/js/prevSetSkeletonScreen",function(){
      //Skeleton 팝업 LOAD 후 호출 처리.
      oAPP.fn.prevSetSkeletonScreen();
    });
    
  };  //현재 출력된 미리보기 화면을 Skeleton Screen으로 설정처리.



  /************************************************************************
   * 미리보기 css 적용 처리.
   * **********************************************************************
   * @param {array} it_css - 적용할 css 정보
   * @param {boolean} bSave - 실제 적용처리 flag(true = styleClass 프로퍼티에 값 반영)
   ************************************************************************/
  oAPP.fn.prevStyleClassApply = function(it_css, bSave){

    //이전 선택한 건에 대해서 CSS 원복 처리.
    for(var i=0, l=oAPP.attr.prevCSS.length; i<l; i++){
      
      //UI가 존재하지 않는경우(미리보기 적용 이후 UI를 삭제 한경우) SKIP.
      if(!oAPP.attr.prev[oAPP.attr.prevCSS[i].OBJID]){continue;}

      //styleClass 프로퍼티 수집건 존재여부 확인.
      var ls_attr = oAPP.attr.prev[oAPP.attr.prevCSS[i].OBJID]._T_0015.find( a=> a.UIATT === "styleClass" );

      //이전에 적용한 styleClass 프로퍼티에 바인딩 처리를 한경우 skip.
      if(ls_attr && ls_attr.ISBND === "X"){
        continue;
      }

      //EXTENSTION PROPERTY인경우.
      if(oAPP.attr.prevCSS[i].ISEXT === "X"){
        //이전에 적용한 CSS 제거 처리.
        oAPP.attr.prev[oAPP.attr.prevCSS[i].OBJID].removeStyleClass(oAPP.attr.prevCSS[i].CSS);

        //기존에 styleClass프로퍼티 입력건이 존재하는경우.
        if(oAPP.attr.prevCSS[i].UIATV !== ""){
          //해당 styleClass 다시 add 처리.
          oAPP.attr.prev[oAPP.attr.prevCSS[i].OBJID].addStyleClass(oAPP.attr.prevCSS[i].UIATV);
        }
        
      }else{
        //EXTENSTION PROPERTY가 아닌경우 이전에 적용한 CSS로 적용 처리.
        oAPP.attr.prev[oAPP.attr.prevCSS[i].OBJID].setStyleClass(oAPP.attr.prevCSS[i].UIATV);
      }

    } //이전 선택한 건에 대해서 CSS 원복 처리.


    //css 원복 처리 이후 CSS적용 수집건 초기화 처리.
    oAPP.attr.prevCSS = [];


    //적용 처리 대상 CSS 가 존재하지 않는경우 exit.
    if(typeof it_css === "undefined" || it_css.length === 0){return;}

    var lt_OBJID = [];

    //CHECKBOX 선택건 수집 처리.
    oAPP.fn.designGetCheckedLine(true, lt_OBJID);


    //CHECKBOX 선택건이 존재하지 않는경우.
    if(lt_OBJID.length === 0){
      //오류 메시지 처리.
      //286	Check box not selected.
      parent.showMessage(sap, 20, "W", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "286", "", "", "", ""));
      return;

    }

    //STYLE CLASS 병합처리.
    var l_css = it_css.join(" ");

    var l_changed = false, l_UIATV = "", l_sep = "";

    //DESIGN영역의 CHECKBOX 선택건을 대상으로 CSS 적용 처리.
    for(var i=0, l=lt_OBJID.length; i<l; i++){

      //선택 라인의 styleClass 프로퍼티 정보 검색.
      var ls_0023 = oAPP.DATA.LIB.T_0023.find( a=> a.UIOBK === lt_OBJID[i].UIOBK &&
        a.UIATT === "styleClass" && a.UIATY === "1" && a.ISDEP !== "X" );

      //선택 UI의 styleClass프로퍼가 존재하지 않는경우 SKIP.
      if(!ls_0023){continue;}
      
      //styleClass 프로퍼티 수집건 존재여부 확인.
      var ls_0015 = oAPP.attr.prev[lt_OBJID[i].OBJID]._T_0015.find( a=> a.UIATK === ls_0023.UIATK );

      //CHKBOX 선택한 UI의 styleClass 프로퍼티가 바인딩이 걸려있다면 SKIP 처리.
      if(ls_0015 && ls_0015.ISBND === "X"){
        continue;
      }

      //styleClass 프로퍼티에 직접 입력한 값이 존재하는경우.
      l_UIATV = "";
      l_sep = "";
      if(ls_0015 && ls_0015.UIATV){
        l_UIATV = ls_0015.UIATV;
        l_sep = " ";
      }
      
      //EXTEND PROPERTY인경우.
      if(ls_0023.ISEXT === "X"){
        //적용하고자 하는 CSS를 ADD.
        oAPP.attr.prev[lt_OBJID[i].OBJID].addStyleClass(l_css);

      }else{
        //이전에 적용한 css + 적용할 CSS를 같이 적용 처리.

        oAPP.attr.prev[lt_OBJID[i].OBJID].setStyleClass(l_UIATV + l_sep + l_css);

      }
      
      //실제 적용 처리가 아닌경우 CSS 적용건 수집 처리.
      if(!bSave){
        oAPP.attr.prevCSS.push({OBJID:lt_OBJID[i].OBJID, CSS:l_css, ISEXT:ls_0023.ISEXT, UIATV:l_UIATV});
        continue;
      }

      //실제 적용 처리인경우.

      //실제 적용시 현재 DESIGN에서 선택한 UI가 CSS 적용대상건인경우.
      if(bSave && oAPP.attr.oModel.oData.uiinfo.OBJID === lt_OBJID[i].OBJID){
        //ATTRIBUTE 항목의 styleClass 프로퍼티 건 검색.
        var ls_attr = oAPP.attr.oModel.oData.T_ATTR.find( a => a.UIATK === ls_0023.UIATK );

        if(ls_attr){

          //변경 FLAG 처리.
          l_changed = true;

          //이전 CSS 입력건이 존재하는경우 공백 추가.
          if(ls_attr.UIATV !== ""){
            ls_attr.UIATV += " ";
          }

          //이전에 입력한 CSS + 적용처리 CSS.
          ls_attr.UIATV += l_css;

          //ATTR 변경처리.
          oAPP.fn.attrChange(ls_attr, "INPUT");

          //해당 ATTR FOCUS 처리.
          oAPP.fn.setAttrFocus(ls_attr.UIATK, "");

          continue;

        }

      }

      //이전 styleClass 입력건이 존재하는경우.
      if(ls_0015){
        
        if(ls_0015.UIATV !== ""){
          ls_0015.UIATV += " ";
        }

        ls_0015.UIATV += l_css;

      }else{
        //이전 styleClass 입력건이 존재하지 않는경우.

        ls_0015 = oAPP.fn.crtStru0015();
        oAPP.fn.moveCorresponding(ls_0023, ls_0015);

        ls_0015.OBJID = lt_OBJID[i].OBJID;

        ls_0015.UIATV = l_css;

      }
  
      //attr 변경처리.
      oAPP.fn.attrChgAttrVal(ls_0015, "INPUT");

      //변경 FLAG 처리.
      l_changed = true;
      

    } //DESIGN영역의 CHECKBOX 선택건을 대상으로 CSS 적용 처리.

    //변경된건이 존재하는경우.
    if(l_changed){
      //change flag 설정.
      oAPP.fn.setChangeFlag();
    }

  };  //미리보기 css 적용 처리.
    

  //20240809 PES 주석 처리!!!!!!!!!!!!!!!!!
  //로직이 완성되지 않아 주석 처리함.
  // //주석.
  // if(oAPP.common.checkWLOList("C", "UHAK900788") === true){

  //   /************************************************************************
  //    * 미리보기 css 적용 처리.
  //    * **********************************************************************
  //    * @param {array} aCSS - 적용할 css 정보
  //    * @param {string} PRCCD - 프로세스 코드(PREVIEW: 미리보기 적용, SAVE:저장, CLOSE: 취소)
  //    ************************************************************************/
  //   oAPP.fn.prevStyleClassApply = function(aCSS, PRCCD){

  //     //미리보기만 적용



  //     //적용버튼 선택하여 CSS 값 반영.




  //     //  취소.1




  //   };

  // }


  //미리보기 전체화면 처리.
  oAPP.fn.prevFullScreen = function(bState){

    //default design tree 영역 설정.
    var l_treeSize = "25%";
    var l_treeMinSize = 300;
    var l_treeResize = true;

    //default attr 영역 설정.
    var l_attrSize = "30%";
    var l_attrMinSize = 300;
    var l_attrResize = true;

    //미리보기 전체화면을 설정한 경우.
    if(bState === true){
      //design tree 영역 최소화.
      l_treeSize = "0px";
      l_treeMinSize = 0;
      l_treeResize = false;

      //attr 영역 최소화.
      l_attrSize = "0px";
      l_attrMinSize = 0;
      l_attrResize = false;

    }    
    
    oAPP.attr.ui.oDesignTree.getLayoutData().setSize(l_treeSize);
    oAPP.attr.ui.oDesignTree.getLayoutData().setMinSize(l_treeMinSize);
    oAPP.attr.ui.oDesignTree.getLayoutData().setResizable(l_treeResize);

    oAPP.attr.ui.oDesignAttr.getLayoutData().setSize(l_treeSize);
    oAPP.attr.ui.oDesignAttr.getLayoutData().setMinSize(l_treeMinSize);
    oAPP.attr.ui.oDesignAttr.getLayoutData().setResizable(l_attrResize);

  };  //미리보기 전체화면 처리.




  //selectOption3 UI의 예외처리 프로퍼티 설정.
  oAPP.fn.prevSetSelOpt3ExceptProp = function(is_attr){

    //selectOption3 UI가 아닌경우 EXIT.
    if(is_attr.UIOBK !== "UO99984"){return;}

    //selectOption3 팝업 호출 버튼 ui 얻기.
    var l_ui = oAPP.attr.prev[is_attr.OBJID].data("optButton");
    if(!l_ui){return;}

    
    var l_prop = is_attr.UIATV;

    //해당 ATTRIBUTE의 라이브러리 정보 얻기.
    var ls_0023 = oAPP.DATA.LIB.T_0023.find( a=> a.UIATK === is_attr.UIATK );
    if(!ls_0023){return;}

    
    var l_propnm;

    //ATTRIBUTE 유형에 따른 분기.
    switch (is_attr.UIATK) {
      case "EXT00002539": //optButtonType
        l_propnm = "setType";
        break;

      case "EXT00002540": //optButtonIcon
        l_propnm = "setIcon";
        break;

      case "EXT00002541": //showOptButton
        l_propnm = "setVisible";
        break;
        
      default:
        //이외 ATTRIBUTE의 경우 처리 안함.
        return;
    }


    //바인딩 처리가 됐다면 DEFAULT 값으로 설정.
    if(is_attr.ISBND === "X"){
      l_prop = ls_0023.DEFVL;
    }


    //프로퍼티 타입이 boolean인경우.
    if(is_attr.UIADT === "boolean"){
      l_prop = false;
      if(is_attr.UIATV === "true"){
        l_prop = true;
      }
    }


    //UI.setProperty(value); 처리.
    try{
      l_ui[l_propnm](l_prop);
    }catch(e){

    }

    //FUNCTION 호출처의 하위로직 수행 SKIP을 위한 FLAG RETURN.
    return true;

  };  //selectOption3 UI의 예외처리 프로퍼티 설정.



  //미리보기 영역 lock 설정/해제 처리.
  oAPP.fn.prevSetLockUnlock = function(bLock){

    //미리보기의 sap 라이브러리 정보가 존재하지 않는경우 exit.
    if(oAPP.attr.ui?.frame?.contentWindow?.sap?.ui?.getCore){
      return;
    }

    //lock 처리에 따른 분기.
    switch (bLock) {
      case true:  //lock 처리건인경우.
        oAPP.attr.ui.frame.contentWindow.sap.ui.getCore().lock();    
        break;

      case false: //unlock 처리건인경우.
        oAPP.attr.ui.frame.contentWindow.sap.ui.getCore().unlock();    
        break;
    }   

  };


})();