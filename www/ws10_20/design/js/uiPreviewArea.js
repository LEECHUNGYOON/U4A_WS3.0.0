(function(){
  //가운데 페이지(미리보기 영역) 구성
  oAPP.fn.uiPreviewArea = function(oMPage){

    //미리보기 영역 구성.
    var oMfrm1 = new sap.ui.core.HTML({content:"<div style='width:100%; height:100%; overflow:hidden;'>" +
      "<iframe id='prevHTML' style='width:100%; height:100%;' frameborder=0 " +
      "framespacing=0 marginheight=0 marginwidth=0 ></iframe></div>"});
    oMPage.addContent(oMfrm1);

    var oTool = new sap.m.Toolbar();
    oMPage.setCustomHeader(oTool);

    var oTitle = new sap.m.Title({text:"preview"});
    oTool.addContent(oTitle);

    oTool.addContent(new sap.m.ToolbarSpacer());

    var oBtn = new sap.m.Button({icon:"sap-icon://refresh"});
    oTool.addContent(oBtn);

    oBtn.attachPress(function(){
      oSlid.setValue(1);
      oAPP.attr.ui.frame.contentWindow.setPreviewZoom(1);
    })

    var oSlid = new sap.m.Slider({width:"200px",min:0.1,max:2,step:0.1,value:1});
    oTool.addContent(oSlid);

    //slider변경 이벤트
    oSlid.attachChange(function(){

      oAPP.attr.ui.frame.contentWindow.setPreviewZoom(this.getValue());

    });


  };  //가운데 페이지(미리보기 영역) 구성





  //미리보기 iframe 영역 구성.
  oAPP.fn.loadPreviewFrame = function(){

     //미리보기 html 정보가 로드되지 않은경우.
     if(!oAPP.attr.ui.frame || !oAPP.attr.ui.frame.contentWindow){
      oAPP.attr.ui.frame = document.getElementById("prevHTML");

      var l_info = parent.getUserInfo();

      //미리보기 서버 URL 정보 구성.
      oAPP.attr.ui.frame.src = parent.getServerHost() + "/zu4a_wbc/getPrevHTML?" +
        "sap-client=" + l_info.CLIENT +  
        "&sap-language=" + l_info.LANGU + 
        "&sap-user=" + l_info.ID +
        "&sap-password=" + l_info.PW +
        "&LIBPATH=" + oAPP.fn.getBootStrapUrl() + 
        "&LIBRARY=" + oAPP.fn.getUi5Libraries(true) +
        "&THEME=" + encodeURIComponent(oAPP.DATA.APPDATA.S_0010.UITHM);

      return;
    }

    //미리보기 화면 구성.
    if(oAPP.attr.ui.frame.contentWindow && oAPP.attr.ui.frame.contentWindow._loaded === true){

      //테마 구성.
      oAPP.attr.ui.frame.contentWindow.setPreviewUiTheme(oAPP.DATA.APPDATA.S_0010.UITHM);

      //라이브러리 로드 처리.
      oAPP.attr.ui.frame.contentWindow.setUiLoadLibraries(oAPP.fn.getUi5Libraries());

      //미리보기 ui 구성
      oAPP.attr.ui.frame.contentWindow.drawPreview();

    }


  };  //미리보기 iframe 영역 구성.
  


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
      return encodeURIComponent(lt_lib.join(","));
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
      return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
    }

    //-2차 필터 패키지
    ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" 
      && a.FLD01 === "WOK_" + oAPP.attr.appInfo.PACKG
      && a.FLD06 === "X" );

    if(typeof ls_ua025 !== "undefined"){
      return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
    }

    //-3차 필터 전체대상
    ls_ua025 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA025" 
      && a.FLD01 === "WOK" && a.FLD06 === "X" );

    if(typeof ls_ua025 !== "undefined"){
      return encodeURIComponent(ls_ua025.FLD04 + ls_ua025.FLD05);
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

    //프로퍼티 otr 입력값 존재시 text 검색.
    var l_prop = oAPP.fn.prevGetOTRText(is_attr) || is_attr.UIATV;

    //프로퍼티 타입에 따른 입력값 parse 처리.
    switch(is_attr.UIADT){

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
        l_UIATV = ls_cevt.DATA;
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

  };  //미리보기 화면 UI의 프로퍼티 변경 처리.




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

    //HTML content에 입력한 정보가 존재하는경우 return.
    l_find = JSON.stringify(l_find.DATA);

    return l_find.substr(1,l_find.length-2);

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
    oChart.dataProvider = [{"f1": "sample01","f2": 10},{"f1": "sample02","f2": 20},{"f1": "sample03","f2": 30}];

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
    oChart.dataProvider = [{"f1":"sample01","f2":10,"f3":30},
      {"f1":"sample02","f2":20,"f3":20},{"f1":"sample03","f2":30,"f3":10}];

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
    oChart.dataProvider = [{"f1":"sample01","f2":10,"f3":30},
      {"f1":"sample02","f2":20,"f3":20},{"f1":"sample03","f2":30,"f3":10}];

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
    oChart.dataProvider = [{"f1":"sample01","f2":10,"f3":30},
      {"f1":"sample02","f2":20,"f3":20},{"f1":"sample03","f2":30,"f3":10}];

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
    oChart.dataProvider = [{"f1": "sample01","f2": 10},{"f1": "sample02","f2": 20},{"f1": "sample03","f2": 30}];

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

    //프로퍼티가 아닌경우 EXIT.
    if(is_attr.UIATY !== "1"){return;}

    //입력값이 존재하지 않는경우 EIXT.
    if(is_attr.UIATV === ""){return;}

    //바인딩 처리된경우 EXIT.
    if(is_attr.ISBND === "X"){return;}

    //프로퍼티의 시작값이 $OTR:로 시작하지 않는경우 EXIT.
    if(is_attr.UIATV.substr(0,5) !== "$OTR:"){return;}
    
    //OTR alias 정보 구성.
    var oFormData = new FormData();
    oFormData.append("ALIAS", is_attr.UIATV.substr(5));
    
    var l_text;

    //OTR text 검색을 위한 서버 호출.
    sendAjax(oAPP.attr.servNm + "/getOTRText", oFormData, function(param){

      //wait 종료 처리.
      parent.setBusy("");

      //오류가 발생한 경우 EXIT.
      if(param.RETCD === "E"){
        return;
      }
      
      //검색에 성공한 경우 TEXT 정보 RETURN.
      l_text = param.TEXT;
      
    },"",false);

    return l_text;

  };  //OTR TEXT 검색 처리.




  //현재 출력된 미리보기 화면을 Skeleton Screen으로 설정처리.
  oAPP.fn.prevSetSkeletonScreen = function(){

    var l_msg = "현재 미리보기 화면 레이아웃 기준으로 Skeleton Screen 으로 설정 하시겠습니까?";

    //설정전 확인 팝업 호출.
    parent.showMessage(sap, 30, "I", l_msg, function(param){

      //YES를 선택하지 않은경우 EXIT.
      if(param !== "YES"){return;}

      //현재 출력된 미리보기 화면 기준 Skeleton Screen 저장 정보 구성.
      oAPP.DATA.APPDATA.T_SKLE = oAPP.attr.ui.frame.contentWindow._get_skeleton_tag_info();

      //005	Job finished.
      parent.showMessage(sap, 10, "S","Job finished.");

      //변경 flag 처리.
      oAPP.fn.setChangeFlag();

    });

  };  //현재 출력된 미리보기 화면을 Skeleton Screen으로 설정처리.


})();
