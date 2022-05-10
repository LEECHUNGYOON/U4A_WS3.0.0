(function(oAPP){
  //미리보기 메인 function
  oAPP.fn.main = function(){

    oAPP.attr.prev = {}; //미리보기 정보
    oAPP.attr.popup = [];  //팝업 정보

    oAPP.attr.ui = {};  //work space ui정보(미리보기 제외)

    oAPP.attr.bfselUI = undefined; //이전 선택 UI 정보
    oAPP.attr.UA015UI = undefined; //이전 미리보기 예외 UI정보

    //APPLICATION의 세부 정보 광역화.
    oAPP.attr.appInfo = {};

    //path prefix 정보.
    oAPP.attr.servNm = parent.getServerPath();

    //프로퍼티 점검 항목 수집 object.
    oAPP.attr.chkProp = {};

    //10번 정보 구조 생성.
    oAPP.fn.crtStru0010 = function(){

      return {"APPID":"","APPNM":"","APPVR":"","LANGU":"","APPTY":"","CODPG":"","ACTST":"",
              "PACKG":"","CLSID":"","LCKFL":"","PGMID":"","OBJTY":"","AUTHG":"","UITHM":"",
              "ISWIT":"","WITTY":"","TUCTY":"","SHCUT":"","ERUSR":"","ERDAT":"","ERTIM":"",
              "AEUSR":"","AEDAT":"","AETIM":""};

    };  //10번 정보 구조 생성.




    //14번 정보 구조 생성.
    oAPP.fn.crtStru0014 = function(){

      return {"APPID":"","GUINR":"","OBJID":"","POSIT":"","POBID":"","UIOBK":"","PUIOK":"",
              "ISAGR":"","AGRID":"","ISDFT":"","OBDEC":"","AGTYP":"","UIATK":"","UIATT":"",
              "UIASN":"","UIATY":"","UIADT":"","UIADS":"","VALKY":"","ISLST":"","ISMLB":"",
              "TOOLB":"","UIFND":"","PUIATK":"","UILIB":"","ISEXT":"","TGLIB":"","DEL_UOK":"",
              "DEL_POK":"","ISECP":""};

    };  //14번 정보 구조 생성.




    //15번 정보 구조 생성.
    oAPP.fn.crtStru0015 = function(){

      return {"APPID":"","GUINR":"","OBJID":"","UIATK":"","UIATV":"","ISBND":"","UILIK":"",
              "UIOBK":"","UIATT":"","UIASN":"","UIADT":"","RVALU":"","BPATH":"","ADDSC":"",
              "UIATY":"","ISMLB":"","ISEMB":"","DEL_LIB":"","DEL_UOK":"","DEL_ATT":"",
              "ISWIT":"","ISSPACE":"","FTYPE":"","REFFD":"","CONVR":"","MPROP":""};

    };  //15번 정보 구조 생성.




    //UI의 attribute(property, event, aggregation, assosication)에 해당하는 펑션 이름 얻기.
    oAPP.fn.getUIAttrFuncName = function(UIOBJ,UIATY,UIATT,param){

      var l_meta = UIOBJ.getMetadata(),
          l_getfunc = "";

      switch(UIATY){

        case "1":
          //property
          l_getfunc = "getProperty";
          break;

        case "2":
          //event
          l_getfunc = "getEvent";
          break;

        case "3":
          //aggregation
          l_getfunc = "getAggregation";
          break;

        case "4":
          //assosication
          l_getfunc = "getAssociation";
          break;

        default:
          return;
      }

      try{
        return l_meta[l_getfunc](UIATT)[param];
      }catch(e){

      }

    };  //UI의 attribute(property, event, aggregation, assosication)에 해당하는 펑션 이름 얻기.




    //MOVE-CORRESPONDING
    oAPP.fn.moveCorresponding = function(source,target){

      for(var i in source){
        if(typeof target[i] === "undefined"){continue;}
        target[i] = source[i];
      }

    };  //MOVE-CORRESPONDING




    //UI에 해당하는 ATTRIBUTE(ZSU4A0015) 정보 구성
    oAPP.fn.crtAttrInfo = function(UIOBK,OBJID){

      var lt_0023 = oAPP.DATA.LIB.T_0023.filter(a => a.UIOBK === UIOBK && a.ISDEP !== "X");

      var lt_0015 = [],ls_0015 = {};

      for(var i=0, l=lt_0023.length; i<l; i++){
        ls_0015 = oAPP.fn.crtStru0015();

        //MOVE-CORRESPONDING
        oAPP.fn.moveCorresponding(lt_0023[i], ls_0015);

        ls_0015.APPID = oAPP.attr.appInfo.APPID;
        ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
        ls_0015.UIOBK = UIOBK;
        ls_0015.OBJID = OBJID;
        lt_0015.push(ls_0015);
        ls_0015 = {};

      }

      return lt_0015;

    };  //UI에 해당하는 ATTRIBUTE(ZSU4A0015) 정보 구성




    //tree -> tab으로 변환.
    oAPP.fn.parseTree2Tab = function(e) {
      var a = [];
        t = function(e) {
          $.each(e, function(e, o) {
              o.zTREE && (t(o.zTREE),
              delete o.zTREE);
              a.push(o);
          })
      };
      t(JSON.parse(JSON.stringify(e)));
      return a;

    };  //tree -> tab으로 변환.




    //js 파일 load
    oAPP.fn.getScript = function(fname,callbackFunc,bSync){
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

    };  //js 파일 load




    //tree 구성 function.
    oAPP.fn.setTreeJson = function(oModel, path, child, parent, treePath){

      //"stru/table" 형식인경우 stru부분 발췌.
      var l_ppath = path.substr(0,path.lastIndexOf("/"));

      //원본 table 정보 얻기.
      var lt_org = oModel.getProperty("/" + path);

      //stru에 해당하는 정보 얻기.
      var tm2 = oModel.getProperty("/" + l_ppath);

      //원본 table 정보가 존재하지 않는경우.
      if(!lt_org || lt_org.length === 0){
          //stru에 treePath이름으로 table 필드 생성.
          tm2[treePath] = [];

          //모델 갱신 처리 후 exit.
          oModel.refresh();
          return;

      }

      //table 복사 처리.
      var lt_copy = JSON.parse(JSON.stringify(lt_org));

      for (var e, h, u, a = [], c = {}, o = 0, f = lt_copy.length; f > o; o++){

          e = lt_copy[o];

          h = e[child];

          u = e[parent] || 0;

          c[h] = c[h] || [];

          e[treePath] = c[h];

          0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
      }

      tm2[treePath] = a;

    };  //tree 구성 function.




    //어플리케이션 정보 검색.
    oAPP.fn.getAppData = function(){

      //application명 서버전송 데이터 구성.
      var oFormData = new FormData();
      oFormData.append("APPID", oAPP.attr.APPID);

      //서버 호출.
      sendAjax(oAPP.attr.servNm + "/getAppData", oFormData, function(param){

        console.log("app 데이터 완료 : " + new Date());

        for(var i=param.APPDATA.T_0014.length-1; i>=0; i--){
          
          //StyleCSS, HTMLCode, ScriptCode UI가 존재하는경우.
          if(param.APPDATA.T_0014[i].UIOBK === "UO99997" || param.APPDATA.T_0014[i].UIOBK === "UO99998" || 
            param.APPDATA.T_0014[i].UIOBK === "UO99999"){
            //해당 라인 삭제.
            param.APPDATA.T_0014.splice(i,1);
            continue;
          }

        }

        oAPP.DATA.APPDATA = param.APPDATA;

        //application ui design, attribute 정보 매핑.
        oAPP.attr.oModel.oData.TREE = oAPP.DATA.APPDATA.T_0014;

        var l_edit = true;


        //edit 불가능 상태인경우.
        if(oAPP.attr.appInfo.IS_EDIT === ""){
          l_edit = false;
        }

        //edit 가능여부 매핑.
        oAPP.attr.oModel.oData.IS_EDIT = l_edit;


        //tree 바인딩 정보 구성.
        oAPP.fn.setTreeJson(oAPP.attr.oModel,"TREE","OBJID","POBID","zTREE");

        //tree drag & drop 처리 활성여부 처리.
        oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);

        //UI design tree영역 체크박스 활성여부 처리.
        oAPP.fn.setTreeChkBoxEnable(oAPP.attr.oModel.oData.zTREE[0]);

        //UI design tree 영역 UI에 따른 ICON 세팅.
        oAPP.fn.setTreeUiIcon(oAPP.attr.oModel.oData.zTREE[0]);

        //모델 갱신 처리.
        oAPP.attr.oModel.refresh();


        //ui design tree 전체 접힘 처리.
        oAPP.attr.ui.oLTree1.collapseAll();

        //ui design tree 2레벨만 처리.
        //(접은뒤 펼쳐야 2레벨만 펼쳐짐 5레벨까지 펼쳐진상태에서 2레벨 펼치면 그냥 그대로 있음)
        oAPP.attr.ui.oLTree1.expandToLevel(2);

        
        console.log("좌측 tree 완료 : " + new Date());



        //미리보기 화면 구성.
        oAPP.fn.loadPreviewFrame();

        //wait off 처리.
        //parent.setBusy('');

      }); //서버 호출.

    };  //어플리케이션 정보 검색.




    //라이브러리 정보 검색.
    oAPP.fn.getLibData = function(it_lib, is_tab, dbtot, dbcnt, fkey, skey){

      //다른 db 검색 실패 여부 확인.
      var l_err = it_lib.findIndex( a => a.ERROR === "X");

      //다른 db 검색이 실패 했다면 현재 db 검색도 중지 처리.
      if(l_err !== -1){
        return;
      }

      var oFormData = new FormData();
      oFormData.append("tabnm", is_tab.tabnm);

      //db 총 검색건수 정보가 존재하는경우.
      if(typeof dbtot !== "undefined"){
        oFormData.append("dbtot", dbtot);
      }

      //db 검색한 건수 정보가 존재하는경우.
      if(typeof dbcnt !== "undefined"){
        oFormData.append("dbcnt", dbcnt);
      }

      //다음 검색대상 첫번째 key 정보가 존재하는경우.
      if(typeof fkey !== "undefined"){
        oFormData.append("fkey", fkey);
      }

      //다음 검색대상 두번째 key 정보가 존재하는경우.
      if(typeof skey !== "undefined"){
        oFormData.append("skey", skey);
      }

      //라이브러리가 로드되지 않은경우 라이브러리 정보 로드를 위한 서버 호출.
      sendAjax(oAPP.attr.servNm + "/getLibData", oFormData, function(param){
        
        console.log(is_tab.alias + " : " + console.log(new Date()));

        //다른 db 검색 실패 여부 확인.
        var l_err = it_lib.findIndex( a => a.ERROR === "X");

        //다른 db 검색이 실패 했다면 현재 db 검색도 중지 처리.
        if(l_err !== -1){
          return;
        }

        //DB 검색에 실패한 경우.
        if(param.ERROR === "X"){
          is_tab.ERROR = param.ERROR;
          showMessage(sap, 20, "E", "Fail to Library load.");
          return;
        }


        //최초 DB 정보 매핑건인경우.
        if(typeof oAPP.DATA.LIB[is_tab.alias] === "undefined"){
          oAPP.DATA.LIB[is_tab.alias] = param.T_DATA;

        }else{
          //추가 DB 정보가 존재하는경우 APPEND처리.
          oAPP.DATA.LIB[is_tab.alias] = oAPP.DATA.LIB[is_tab.alias].concat(param.T_DATA);

        }

        //해당 DB를 검색 완료한 경우.
        if(param.END === "X"){
          //완료됨 FLAG 처리.
          is_tab.END = param.END;
        }

        //db 검색이 완료되지 않은건 검색.
        var l_find = it_lib.findIndex( a => a.END === "");

        //모든 table이 load완료한 경우.
        if(l_find === -1){
          //라이브러리 정보에 실제 라이브러리명 필드를 추가하여 매핑 처리(sap/m/Input -> sap.m.Input)
          for(var i=0, l=oAPP.DATA.LIB.T_0022.length; i<l; i++){
            oAPP.DATA.LIB.T_0022[i].LIBNM = oAPP.DATA.LIB.T_0022[i].UIOMD.replace(/\//g, ".");
          }

          //어플리케이션 정보 구성을 위한 서버 호출.
          oAPP.fn.getAppData();
          return;
        }

        //해당 DB의 검색이 완료된경우 하위 로직 SKIP.
        if(param.END === "X"){          
          return;
        }

        //다음 라이브러리 table 정보 검색.
        oAPP.fn.getLibData(it_lib, is_tab, param.dbtot, param.dbcnt, param.fkey, param.skey);


      }); //라이브러리가 로드되지 않은경우 라이브러리 정보 로드를 위한 서버 호출.

    };  //라이브러리 정보 검색.




    //UI 영역 편집여부 설정.
    oAPP.fn.setUIAreaEditable = function(isRefresh){

      //APPLICATION의 세부 정보 광역화.
      oAPP.attr.appInfo = parent.getAppInfo();

      //어플리케이션 정보가 출력된 상태에서 변경된 내용 없이 display로 전환된경우
      if(oAPP.attr.appInfo.IS_EDIT === "" &&
         oAPP.attr.appInfo.IS_CHAG === "" &&
         typeof oAPP.DATA.APPDATA !== "undefined" &&
         isRefresh !== "X" ){

         oAPP.attr.oModel.oData.IS_EDIT = false;

         //UI design tree영역 drag & drop 처리.
         oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);

         //UI design tree영역 체크박스 활성여부 처리.
         oAPP.fn.setTreeChkBoxEnable(oAPP.attr.oModel.oData.zTREE[0]);

         //미리보기 UI의 drop 제거 처리.
         oAPP.attr.ui.frame.contentWindow.removeDropConfig();

         //모델 갱신 처리.
         oAPP.attr.oModel.refresh();

         //wait off 처리.
         parent.setBusy("");

         return;

      } //어플리케이션 정보가 출력된 상태에서 변경된 내용 없이 display로 전환된경우

      //라이브러리 정보가 로드된 경우.
      if(jQuery.isEmptyObject(oAPP.DATA.LIB) !== true){
        //어플리케이션 정보 구성을 위한 서버 호출.
        oAPP.fn.getAppData();
        return;
      }

      oAPP.DATA.LIB = {};

      //검색 대상 라이브러리 정보 구성.
      var lt_lib = [];
      lt_lib.push({tabnm:"ZTU4A9011",alias:"T_9011",END:"",ERROR:""});
      lt_lib.push({tabnm:"ZTU4A0020",alias:"T_0020",END:"",ERROR:""});
      lt_lib.push({tabnm:"ZTU4A0022",alias:"T_0022",END:"",ERROR:""});
      lt_lib.push({tabnm:"ZTU4A0023",alias:"T_0023",END:"",ERROR:""});
      lt_lib.push({tabnm:"ZTU4A0024",alias:"T_0024",END:"",ERROR:""});
      lt_lib.push({tabnm:"ZTU4A0027",alias:"T_0027",END:"",ERROR:""});


      //구성된 라이브러리 정보를 기준으로 검색.
      for(var i=0, l=lt_lib.length; i<l; i++){
        //라이브러리 정보 검색.
        oAPP.fn.getLibData(lt_lib, lt_lib[i]);

      }

    };  //UI 영역 편집여부 설정.




    //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.
    oAPP.fn.setChangeFlag = function(){
      //초상위 부모의 application 정보 얻기(항상 최신 정보를 얻기위함).
      oAPP.attr.appInfo = parent.getAppInfo();

      //변경됨 flag 처리.
      oAPP.attr.appInfo.IS_CHAG = "X";

      //부모의 구조에 change 여부 업데이트 처리.
      parent.setAppInfo(oAPP.attr.appInfo);

    };  //화면에서 UI추가, 이동, 삭제 및 attr 변경시 변경 flag 처리.




    //model, 미리보기 정보 제거.
    oAPP.fn.removeContent = function(){
      //미리보기 화면 제거.
      oAPP.attr.ui.frame.contentWindow.removePreviewPage();      

      oAPP.attr.prev = {}; //미리보기 정보
      oAPP.attr.popup = [];  //팝업 정보
      oAPP.attr.bfselUI = undefined; //이전 선택 UI 정보
      oAPP.attr.UA015UI = undefined; //이전 미리보기 예외 UI정보

      //APPLICATION의 세부 정보 광역화.
      oAPP.attr.appInfo = {};

      //모델 초기화.
      oAPP.attr.oModel.oData = {};

      //서버이벤트 리스트 제거.
      delete oAPP.attr.T_EVT;

      //application 정보 제거.
      delete oAPP.DATA.APPDATA;

      oAPP.attr.oModel.refresh();


    };  //model, 미리보기 정보 제거.




    //UI 저장 정보 구성.
    oAPP.fn.getSaveData = function(){

      //순번 정보(POSIT) 재정의 재귀호출 function
      function lf_setUIPos(it_tree){

        if(!it_tree || it_tree.length === 0){return;}

        //TREE 디자인 영역의 같은 레벨 기준으로 순번 설정.
        for(var i=0, l=it_tree.length; i<l; i++){

          //순번 + 1
          l_pos += 1;

          //순번정보 매핑.
          it_tree[i].POSIT = l_pos;


        } //TREE 디자인 영역의 같은 레벨 기준으로 순번 설정.

        //CHILD UI가 존재하는 경우 재귀호출 탐색하며 순번 매핑.
        for(var i=0, l=it_tree.length; i<l; i++){
          lf_setUIPos(it_tree[i].zTREE);

        }

      } //순번 정보(POSIT) 재정의 재귀호출 function
      
      var l_pos = 0;

      //UI POSTION 정보 재매핑 처리.
      lf_setUIPos(oAPP.attr.oModel.oData.zTREE);

      
      //design tree 정보를 기준으로 ZY04A0014 저장 정보 구성.
      var lt_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);
      

      //어플리케이션 정보 테이블 구조 생성.
      var ls_0010 = oAPP.fn.crtStru0010();

      //어플리케이션 상태 광역정보를 어플리케이션 저장 정보로 매핑.
      oAPP.fn.moveCorresponding(oAPP.attr.appInfo, ls_0010);


      //DOCUMENT에 입력된 정보중 ZTU4A0010 테이블에 매핑 정보 구성 처리.
      for(var i=0, l= oAPP.attr.prev.ROOT._T_0015.length; i<l; i++){

        var ls_ua003 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA003" && a.ITMCD === oAPP.attr.prev.ROOT._T_0015[i].UIATK );

        ls_0010[ls_ua003.FLD08] = oAPP.attr.prev.ROOT._T_0015[i].UIATV;

      }


      //UI에 구성한 attr 정보 수집 처리.
      var lt_0015 = oAPP.fn.getAttrChangedData();


      return {"TU4A0010":ls_0010,
              "YU4A0014":lt_0014,
              "YU4A0015":lt_0015,
              "T_EDIT":oAPP.DATA.APPDATA.T_EDIT,
              "S_ERHTML":oAPP.DATA.APPDATA.S_ERHTML,
              "T_CEVT":oAPP.DATA.APPDATA.T_CEVT,
              "T_JSLK":oAPP.DATA.APPDATA.T_JSLK,
              "T_CSLK":oAPP.DATA.APPDATA.T_CSLK,
              "T_DESC":oAPP.DATA.APPDATA.T_DESC, 
              "S_WSO": oAPP.DATA.APPDATA.S_WSO};

    };  //UI 저장 정보 구성.
   



    //attribute의 변경된건 수집 처리.
    oAPP.fn.getAttrChangedData = function(){
      //UI에 구성한 attr 정보 수집 처리.
      var lt_0015 = [];

      //생성한 UI를 기준으로 ATTRIBUTE 수집건 취합.
      for(var i in oAPP.attr.prev){
        
        //attribute 수집건이 존재하지 않는경우 skip.
        if(oAPP.attr.prev[i]._T_0015.length === 0){continue;}

        //attribute 수집건을 기준으로 ZYU4A0015 정보 구성.
        for(var j=0, l2= oAPP.attr.prev[i]._T_0015.length; j<l2; j++){
          
          //ZSU4A0015 구조 생성.
          var ls_0015 = oAPP.fn.crtStru0015();

          //수집건을 생성한 구조에 옮김.
          oAPP.fn.moveCorresponding(oAPP.attr.prev[i]._T_0015[j], ls_0015);

          //RETURN 처리 결과에 수집.
          lt_0015.push(ls_0015);

        }        

      }

      //수집된 정보 return 처리.
      return lt_0015;

    };  //attribute의 변경된건 수집 처리.




    //UI DOM을 기준으로 UI instance 정보 얻기.
    oAPP.fn.getUiInstanceDOM = function(oDom,oCore){

      //DOM 정보가 존재하지 않는경우 exit.
      if(typeof oDom === "undefined"){return;}

      //DOM id로부터 UI정보 검색.
      var l_ui = oCore.byId(oDom.id);

      //UI를 찾은경우 해당 UI정보 return
      if(typeof l_ui !== "undefined"){
        return l_ui;
      }

      //UI정보를 찾지못한 경우 상위 부모를 탐색하며 UI instance정보 검색.
      return oAPP.fn.getUiInstanceDOM(oDom.parentElement, oCore);


    };  //UI DOM을 기준으로 UI instance 정보 얻기.



    //workbench 화면을 구성할 UI가 존재하지 않는경우 exit.
    if(!oAPP.attr.oArea){return;}


    sap.ui.getCore().loadLibrary("sap.ui.layout");
    sap.ui.getCore().loadLibrary("sap.m");    
    sap.ui.getCore().loadLibrary("sap.f");


    var oSApp = new sap.ui.layout.Splitter();
    oAPP.attr.oArea.addContent(oSApp);

    oAPP.attr.oModel = new sap.ui.model.json.JSONModel();
    oAPP.attr.oModel.setSizeLimit(100000);
    oSApp.setModel(oAPP.attr.oModel);

    //좌측 페이지(UI Design 영역)
    var oLPage = new sap.m.Page({enableScrolling:false,showHeader:false,layoutData:new sap.ui.layout.SplitterLayoutData({size:"25%",minSize:300})});
    oSApp.addContentArea(oLPage);

    //가운데 페이지(미리보기 영역)
    var oMPage = new sap.m.Page({title:"preview"});
    oSApp.addContentArea(oMPage);

    //우측 페이지(attribute 영역)
    var oRPage = new sap.f.DynamicPage({preserveHeaderStateOnScroll:true,layoutData:new sap.ui.layout.SplitterLayoutData({size:"30%",minSize:300})});
    oSApp.addContentArea(oRPage);


    //ui design area(좌측 TREE 영역)
    oAPP.fn.getScript("design/js/uiDesignArea",function(){oAPP.fn.uiDesignArea(oLPage);});

    //ui preview area(가운데 미리보기 영역)
    oAPP.fn.getScript("design/js/uiPreviewArea",function(){oAPP.fn.uiPreviewArea(oMPage);});

    //ui attribute area(우측 ui 속성정보 영역)
    oAPP.fn.getScript("design/js/uiAttributeArea",function(){oAPP.fn.uiAttributeArea(oRPage);});


  };  //미리보기 메인 function




})(oAPP);
