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

    //UI5 Standard Predefined CSS Preview 팝업에서 css 적용건 수집 array.
    oAPP.attr.prevCSS = [];

    //D&D용 랜덤키 광역변수.
    oAPP.attr.DnDRandKey = "";

    oAPP.attr.POSIT = 0;

    //모듈 js path 수집 object.
    oAPP.attr.modulePath = {};

    //디자인상세화면(20화면) <-> BINDPOPUP 통신 모듈 PATH.
    oAPP.attr.modulePath.broadcastChannelBindPopup = "";

    //onAfterRendering 이벤트 등록 대상 UI 검색 모듈 PATH.
    oAPP.attr.modulePath.getTargetAfterRenderingUI = "";

    //대상 UI에 onAfterRendering 이벤트 등록 처리 모듈 PATH.
    oAPP.attr.modulePath.setAfterRendering = "";

    //RichTextEditor 미리보기 출력 예외처리로직 모듈 PATH.
    oAPP.attr.modulePath.renderingRichTextEditor = "";

    
    //sap core 정보 광역화.
    oAPP.attr.oCore = sap.ui.getCore();

    //10번 정보 구조 생성.
    oAPP.fn.crtStru0010 = function(){

      return {"APPID":"","APPNM":"","APPVR":"","LANGU":"","APPTY":"","CODPG":"","ACTST":"",
              "PACKG":"","CLSID":"","LCKFL":"","PGMID":"","OBJTY":"","AUTHG":"","UITHM":"",
              "ISWIT":"","WITTY":"","TUCTY":"","SHCUT":"","BDCOR":"","USERT":"","USESK":"","STFTP":"",
              "USEZM":"","ERUSR":"","ERDAT":"","ERTIM":"","AEUSR":"","AEDAT":"","AETIM":""};

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



    
    //오류 출력 구조 생성.
    oAPP.fn.crtErrorSyntaxStru = function(){
      return {"GRCOD":"", "TYPE":"", "FNAME":"", "DESC":"","LINE":"", 
              "METHOD":"", "OBJID":"", "UIATK":"", "GUBN":""};

    };  //오류 출력 구조 생성.




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
    oAPP.fn.getScript = function(fname, callbackFunc, bSync){
      var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            eval(this.responseText);
            callbackFunc();
          }else{
            //화면 잠금 해제 처리.
            oAPP.fn.designAreaLockUnlock();
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

      //application정보 구성전 화면 잠금 처리.
      oAPP.fn.designAreaLockUnlock(true);

      //application명 서버전송 데이터 구성.
      var oFormData = new FormData();
      oFormData.append("APPID", oAPP.attr.APPID);

      //서버 호출.
      sendAjax(oAPP.attr.servNm + "/getAppData", oFormData, function(param){

        //application정보 구성전 화면 잠금 처리.
        oAPP.fn.designAreaLockUnlock(true);

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

        //UI design tree 영역의 action icon 활성여부 처리.
        oAPP.fn.designSetActionIcon(oAPP.attr.oModel.oData.zTREE[0]);

        //design tree의 row action 활성여부 설정.
        oAPP.fn.designTreeSetRowAction();

        //모델 갱신 처리.
        oAPP.attr.oModel.refresh();


        //ui design tree 전체 접힘 처리.
        oAPP.attr.ui.oLTree1.collapseAll();

        //ui design tree 2레벨만 처리.
        //(접은뒤 펼쳐야 2레벨만 펼쳐짐 5레벨까지 펼쳐진상태에서 2레벨 펼치면 그냥 그대로 있음)
        oAPP.attr.ui.oLTree1.expandToLevel(2);

        
        //design tree 선택 처리 해제
        oAPP.attr.ui.oLTree1.clearSelection();


        //attribute 선택 처리 해제.
        oAPP.attr.ui.oRTab1.removeSelections();
        

        //design 영역 invalidate 처리.
        oAPP.fn.invalidateDesignArea();


        //미리보기 화면 구성.
        oAPP.fn.loadPreviewFrame();


        //세션 랜덤키 얻기.
        oAPP.attr.DnDRandKey = parent.getSSID();

        //wait off 처리.
        //parent.setBusy("");

      }, "X", true, "POST", function(e){
        //오류 발생시 lock 해제.
        oAPP.fn.designAreaLockUnlock();
      
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
        
        //다른 db 검색 실패 여부 확인.
        var l_err = it_lib.findIndex( a => a.ERROR === "X");

        //다른 db 검색이 실패 했다면 현재 db 검색도 중지 처리.
        if(l_err !== -1){
          return;
        }

        //DB 검색에 실패한 경우.
        if(param.ERROR === "X"){

          is_tab.ERROR = param.ERROR;
          //281	Fail to Library load.
          parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "281", "", "", "", ""));
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

          //코드마스터 정보 코드별로 재구성 처리.
          oAPP.fn.setCodeMasterData();

          //UI 프로퍼티에 대한 Value 필수항목 대상 추가 정의.
          oAPP.fn.setCodeMasterDataUA035();

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


      }, "X", true, "POST", function(e){
        //오류 발생시 lock 해제.
        oAPP.fn.designAreaLockUnlock();

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

          //display flag 설정.
          oAPP.attr.oModel.oData.IS_EDIT = false;

          //UI design tree영역 drag & drop 처리.
          oAPP.fn.setTreeDnDEnable(oAPP.attr.oModel.oData.zTREE[0]);

          //UI design tree영역 체크박스 활성여부 처리.
          oAPP.fn.setTreeChkBoxEnable(oAPP.attr.oModel.oData.zTREE[0]);

          //UI design tree 영역의 action icon 활성여부 처리.
          oAPP.fn.designSetActionIcon(oAPP.attr.oModel.oData.zTREE[0]);

          //미리보기 UI의 drop 제거 처리.
          oAPP.attr.ui.frame.contentWindow.removeDropConfig();

          //css 미리보기 적용건 해제 처리.
          oAPP.fn.prevStyleClassApply([]);

          //attribute 초기화버튼 비활성처리.
          oAPP.attr.oModel.oData.uiinfo.vis02 = false;

          //design tree의 row action 활성여부 설정.
          oAPP.fn.designTreeSetRowAction();

          //모델 갱신 처리.
          oAPP.attr.oModel.refresh();

          //wait off 처리.
          parent.setBusy("");

          return;

      } //어플리케이션 정보가 출력된 상태에서 변경된 내용 없이 display로 전환된경우

      //라이브러리 정보가 로드된 경우.
      if(jQuery.isEmptyObject(oAPP.DATA.LIB) !== true){
        
        //design 레이아웃 순서 설정.
        oAPP.fn.setDesignLayout();

        //어플리케이션 정보 구성을 위한 서버 호출.
        oAPP.fn.getAppData();

        return;

      }

      
      //라이브러리 구성전 화면 잠금 처리.
      oAPP.fn.designAreaLockUnlock(true);

      //라이브러리 수집 object 초기화.
      oAPP.DATA.LIB = {};

      //meta 정보 검색.
      var l_meta = parent.getMetadata();

      //DEFAULT 라이브러리 TABLE 명 구성(ZTU4AXXXX)
      var l_tabPreFix = "ZTU4A";

      //해당 서버의 NAME SPACE가 적용된경우.
      if(l_meta && l_meta.IS_NAME_SPACE === "X"){
        // (/U4A/TXXXX) 형식의 라이브러리 테이블명 구성.
        l_tabPreFix = "/U4A/T";
      }

      //검색 대상 라이브러리 정보 구성.
      var lt_lib = [];
      lt_lib.push({tabnm:l_tabPreFix + "9011",alias:"T_9011",END:"",ERROR:""});
      lt_lib.push({tabnm:l_tabPreFix + "0020",alias:"T_0020",END:"",ERROR:""});
      lt_lib.push({tabnm:l_tabPreFix + "0022",alias:"T_0022",END:"",ERROR:""});
      lt_lib.push({tabnm:l_tabPreFix + "0023",alias:"T_0023",END:"",ERROR:""});
      lt_lib.push({tabnm:l_tabPreFix + "0024",alias:"T_0024",END:"",ERROR:""});
      lt_lib.push({tabnm:l_tabPreFix + "0027",alias:"T_0027",END:"",ERROR:""});


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




    //디자인 area의 잠금/잠금해제 처리.
    oAPP.fn.designAreaLockUnlock = function(bLock){

      //잠금 flag 처리된경우.
      if(bLock){        
        //단축키도 같이 잠금 처리.
        oAPP.fn.setShortcutLock(true);

        //화면 잠금 처리.
        oAPP.attr.oCore.lock();

        return;
      }

      //잠금 flag가 없는경우 잠금 해제 처리.      
      oAPP.attr.oCore.unlock();
      
      //단축키도 같이 잠금 햐제 처리.
      oAPP.fn.setShortcutLock();

    };  //디자인 area의 잠금/잠금해제 처리.




    //단축키 잠금 처리 기능.
    //true = 잠금, false = 잠금 해제.
    oAPP.fn.setShortcutLock = function(bLock){
      oAPP.attr.isShortcutLock = bLock || false;

    };  //단축키 잠금 처리 기능.


   

    //model, 미리보기 정보 제거.
    oAPP.fn.removeContent = function(){

      //라인 선택 이벤트 해제(이벤트 수행 처리 회피 목적)
      oAPP.attr.ui.oLTree1.detachRowSelectionChange(oAPP.fn.onDesignTreeRowSelChange);
      
      //design tree 선택 처리 해제
      oAPP.attr.ui.oLTree1.clearSelection();

      //라인 선택 이벤트 재등록.
      oAPP.attr.ui.oLTree1.attachRowSelectionChange(oAPP.fn.onDesignTreeRowSelChange);

      //design tree 필터 해제 처리.
      oAPP.fn.designSetFilter("");


      //attribute 선택 처리 해제.
      oAPP.attr.ui.oRTab1.removeSelections();


      oAPP.attr.prev = {}; //미리보기 정보
      oAPP.attr.popup = [];  //팝업 정보
      oAPP.attr.bfselUI = undefined; //이전 선택 UI 정보
      oAPP.attr.UA015UI = undefined; //이전 미리보기 예외 UI정보

      //D&D용 랜덤키 초기화.
      oAPP.attr.DnDRandKey = "";

      //UI5 Standard Predefined CSS Preview 팝업에서 css 적용건 수집 array 초기화.
      oAPP.attr.prevCSS = [];

      //APPLICATION의 세부 정보 광역화.
      oAPP.attr.appInfo = {};

      //모델 초기화.
      oAPP.attr.oModel.oData = {};

      //서버이벤트 리스트 제거.
      delete oAPP.attr.T_EVT;

      //application 정보 제거.
      delete oAPP.DATA.APPDATA;
      

      oAPP.attr.oModel.refresh();

      
      
      //20230116 pes -start.
      //미리보기 src 초기화.
      //미리보기 frame를 유지하며 ui만 제거하는 로직을 대체하여 frame 자체를 초기화 하는 내용을 추가함.
      document.getElementById("prevHTML").src = "";
      document.getElementById("prevHTML").style.display = "none";

      delete oAPP.attr.ui.prevRootPage;
      delete oAPP.attr.ui._page1;
      delete oAPP.attr.ui.prevPopupArea;
      delete oAPP.attr.ui._hbox1;
      delete oAPP.attr.ui.oMenu;

      //oAPP.attr.ui.frame.src = "";

      //미리보기 frame 초기화.
      oAPP.attr.ui.frame = null;

      //미리보기 화면을 제거하는 시간이 오래 걸림에 따라 frame를 유지하며 ui만 제거 하는 로직 주석처리.
      // //미리보기 화면 제거.
      // oAPP.attr.ui.frame.contentWindow.removePreviewPage();

      // //미리보기 테마 초기화(sap_fiori_3로 설정함).
      // oAPP.attr.ui.frame.contentWindow.setPreviewUiTheme("sap_fiori_3");
      
      // //미리보기 css 제거 처리.
      // oAPP.attr.ui.frame.contentWindow.setCSSLink([],true);
      // oAPP.attr.ui.frame.contentWindow.setCSSSource("");
      //20230116 pes -end.


    };  //model, 미리보기 정보 제거.




    //순번 정보(POSIT) 재정의 재귀호출 function
    oAPP.fn.setUIPOSIT = function(it_tree){

      if(!it_tree || it_tree.length === 0){return;}

      //TREE 디자인 영역의 같은 레벨 기준으로 순번 설정.
      for(var i=0, l=it_tree.length; i<l; i++){

        //순번 + 1
        oAPP.attr.POSIT += 1;

        //순번정보 매핑.
        it_tree[i].POSIT = oAPP.attr.POSIT;

      } //TREE 디자인 영역의 같은 레벨 기준으로 순번 설정.

      //CHILD UI가 존재하는 경우 재귀호출 탐색하며 순번 매핑.
      for(var i=0, l=it_tree.length; i<l; i++){
        oAPP.fn.setUIPOSIT(it_tree[i].zTREE);

      }

    };  //순번 정보(POSIT) 재정의 재귀호출 function




    //UI 저장 정보 구성.
    oAPP.fn.getSaveData = function(){

      oAPP.attr.POSIT = 0;

      //UI POSTION 정보 재매핑 처리.
      oAPP.fn.setUIPOSIT(oAPP.attr.oModel.oData.zTREE);

      oAPP.attr.POSIT = 0;

      
      //design tree 정보를 기준으로 ZY04A0014 저장 정보 구성.
      var lt_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);

      //POSITION 으로 정렬처리.
      lt_0014.sort(function(a,b){
        return a.POSIT - b.POSIT;
      });
      

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
              "S_WSO": oAPP.DATA.APPDATA.S_WSO,
              "T_SKLE":oAPP.DATA.APPDATA.T_SKLE};

    };  //UI 저장 정보 구성.
   



    //attribute의 변경된건 수집 처리.
    oAPP.fn.getAttrChangedData = function(){
      
      //document인경우 ZTU4A0010 테이블에 존재하는 필드 여부 확인.
      function lf_chkDocAttr(OBJID, is_0015, is_0010){
        //ROOT(DOCUMENT) 인경우 하위 로직 수행.
        if(OBJID !== "ROOT"){return;}

        //UI5 Document 속성 정보 검색.
        var ls_ua003 = oAPP.DATA.LIB.T_9011.find( a => a.CATCD === "UA003" && a.ITMCD === is_0015.UIATK );

        //UI5 Document 속성 정보를 찾지 못한 경우 EXIT.
        if(!ls_ua003){return;}

        if(typeof is_0010[ls_ua003.FLD08] === "undefined"){
          return true;
        }

      } //document인경우 ZTU4A0010 테이블에 존재하는 필드 여부 확인.



      //UI에 구성한 attr 정보 수집 처리.
      var lt_0015 = [];

      //ROOT(DOCUMENT) 정보 저장건 구성을 위한 ZTU4A0010구조 생성
      //(ZTU4A0010의 필드 기준으로 ROOT(DOCUMENT)의 15번 저장정보를 구성함).
      var ls_0010 = oAPP.fn.crtStru0010();
      

      //생성한 UI를 기준으로 ATTRIBUTE 수집건 취합.
      for(var i in oAPP.attr.prev){

        //attribute 수집건이 존재하지 않는경우 skip.
        if(oAPP.attr.prev[i]._T_0015.length === 0){continue;}

        //attribute 수집건을 기준으로 ZYU4A0015 정보 구성.
        for(var j=0, l2= oAPP.attr.prev[i]._T_0015.length; j<l2; j++){

          //ROOT의 경우 ZTU4A0010 테이블 기준의 필드만 저장 가능.
          if(lf_chkDocAttr(i, oAPP.attr.prev[i]._T_0015[j], ls_0010) === true){
            continue;
          }
          
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




    //코드마스터정보 코드별로 재구성 처리.
    oAPP.fn.setCodeMasterData = function(){
	
      oAPP.attr.S_CODE = {};
      
      //코드마스터 데이터가 존재하지 않는경우 EXIT.
      if(oAPP.DATA.LIB.T_9011.length === 0){
        return;
      }
      
      //코드마스터 전체 검색건을 코드별로 수집 처리.
      for(var i=0, l=oAPP.DATA.LIB.T_9011.length; i<l; i++){		
        
        //해당 코드가 수집되지 않았다면 수집 ARRAY 구성.
        if(typeof oAPP.attr.S_CODE[oAPP.DATA.LIB.T_9011[i].CATCD] === "undefined"){
          oAPP.attr.S_CODE[oAPP.DATA.LIB.T_9011[i].CATCD] = [];
        }
        
        //코드에 해당하는 데이터 수집 처리.
        oAPP.attr.S_CODE[oAPP.DATA.LIB.T_9011[i].CATCD].push(oAPP.DATA.LIB.T_9011[i]);
        
      }	
      
    };  //END OF oAPP.fn.setCodeMasterData //코드마스터정보 코드별로 재구성 처리.




    //UI 프로퍼티에 대한 Value 필수항목 대상 추가 정의.
    oAPP.fn.setCodeMasterDataUA035 = function(){

      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000001", FLD01:"SelectOption2", FLD02:"UO99992", FLD03:"value", FLD04:"EXT00001161", FLD05:"X"});
      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000002", FLD01:"Tree", FLD02:"UO00467", FLD03:"Parent", FLD04:"EXT00001190", FLD05:"X"});
      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000003", FLD01:"Tree", FLD02:"UO00467", FLD03:"Child", FLD04:"EXT00001191", FLD05:"X"});
      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000004", FLD01:"TreeTable", FLD02:"UO01142", FLD03:"Parent", FLD04:"EXT00001192", FLD05:"X"});
      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000005", FLD01:"TreeTable", FLD02:"UO01142", FLD03:"Child", FLD04:"EXT00001193", FLD05:"X"});
      oAPP.attr.S_CODE.UA035.push({CATCD:"UA035", ITMCD:"CK90000006", FLD01:"SelectOption3", FLD02:"UO99984", FLD03:"value", FLD04:"EXT00002507", FLD05:"X"});
     
    };  //UI 프로퍼티에 대한 Value 필수항목 대상 추가 정의.



    //UI DOM을 기준으로 UI instance 정보 얻기.
    oAPP.fn.getUiInstanceDOM = function(oDom, oCore){

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




    /************************************************************************
     * attribute 점검 항목 영역 -start.
      GRCOD(20) TYPE C,       "내부 그룹코드
      TYPE      TYPE SYMSGTY, "오류 타입
      FNAME     TYPE STRING,  "오류 필드명
      DESC      TYPE STRING,  "내역
      LINE      TYPE I,       "오류 Index
      METHOD    TYPE STRING,  "메소드명
      OBJID     TYPE STRING,  "UI OBJECT ID
      UIATK     TYPE ZTU4A0023-UIATK, "오류 대상 프로퍼티 내부KEY
      GUBN(1)   TYPE C. "A:UI 디자인 영역 B:컨트롤러 EDIT
     ************************************************************************/
    //attribute 예외처리 항목 점검 function.
    oAPP.fn.chkExcepionAttr = function(){

      var lt_err = [];

      //ui table 예외처리 프로퍼티 점검.
      oAPP.fn.chkExcepUiTable(lt_err);

      //오류 점검 결과 RETURN.
      return lt_err;


    };  //attribute 예외처리 항목 점검 function.



    //ui table 예외처리 프로퍼티 점검.
    oAPP.fn.chkExcepUiTable = function(it_err){

      //design tree 정보를 기준으로 ZY04A0014 저장 정보 구성.
      var lt_0014 = oAPP.fn.parseTree2Tab(oAPP.attr.oModel.oData.zTREE);

      if(lt_0014.length === 0){return;}

      //sap.ui.table.Table 정보 존재여부 확인.
      var lt_tab = lt_0014.filter( a=> a.UIOBK === "UO01139" );

      //sap.ui.table.Table이 존재하지 않는경우 exit.
      if(lt_tab.length === 0){return;}
      
      //sap.ui.table.Table의 예외처리 프로퍼티 입력값 점검.
      for(var i=0, l=lt_tab.length; i<l; i++){
        
        if(!oAPP.attr.prev[lt_tab[i].OBJID]._T_0015){continue;}
        
        //대상 TABLE의 autoColumnResize 프로퍼티 입력건 확인.
        var ls_0015 = oAPP.attr.prev[lt_tab[i].OBJID]._T_0015.find( a => a.UIATK === "EXT00002289" );

        //입력건이 존재하지 않는경우 SKIP.
        if(!ls_0015){continue;}

        //바인딩처리된건, 입력값이 존재하지 않는건인경우 SKIP.
        if(ls_0015.ISBND === "X" || ls_0015.UIATV === ""){continue;}

        //autoColumnResize를 사용하고자 설정한 경우.
        if(ls_0015.UIATV !== "true"){continue;}

        //해당 TABLE의 columns Aggregation에 속한 UI 검색.
        var lt_col = lt_0014.filter( a => a.POBID === lt_tab[i].OBJID && a.UIATK === "AT000013067" );

        //columns Aggregation ui가 존재하지 않는경우 skip.
        if(lt_col.length === 0){continue;}

        var l_found = false;

        //대상 table의 column에 autoColumnResize 프로퍼티 입력건 확인.
        for(var j=0, l2 = lt_col.length; j<l2; j++){
          if(!oAPP.attr.prev[lt_col[j].OBJID]._T_0015){continue;}

          //autoResizable 프러퍼티 입력건 존재 여부 확인.
          var l_attr = oAPP.attr.prev[lt_col[j].OBJID]._T_0015.find( a=> a.UIATK === "AT000012975");

          //입력건이 존재하지 않는경우 skip.
          if(!l_attr){continue;}

          //autoResizable 프로퍼티에 바인딩 처리된경우.
          if(l_attr.ISBND === "X" && l_attr.UIATV !== ""){
            //찾름 flag 처리 후 loop exit.
            l_found = true;
            break;
          }

          //autoResizable 프로퍼티를 true로 설정한 건이 존재하는경우.
          if(l_attr.UIATV === "true"){
            //찾름 flag 처리 후 loop exit.
            l_found = true;
            break;
          }

        }

        //autoResizable프로퍼티 입력건이 존재하는 경우 skip.
        if(l_found === true){continue;}

        //대상 table의 autoColumnResize 프로퍼티를 설정한경우,
        //column UI의 autoResizable 프로퍼티를 true로 설정한건이 한건도 없다면 오류 처리.

        //오류 필드 생성 처리.
        var ls_err = oAPP.fn.crtErrorSyntaxStru();

        //오류 수집 처리.
        ls_err.GRCOD   = "PROG";
        ls_err.TYPE    = "E";
        ls_err.FNAME   = "";
        
        //296  When the UI Table property “AutoColumnResize” value is “true”,
        ls_err.DESC    = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "296", "", "", "", "");

        //297  it must be “true” in “autoResizable” among the column properties.
        ls_err.DESC    += " " + oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "297", "", "", "", "");

        ls_err.LINE    = "0";
        ls_err.METHOD  = "";
        ls_err.OBJID   = lt_tab[i].OBJID;
        ls_err.UIATK   = ls_0015.UIATK;
        ls_err.GUBN    = "A";
        it_err.push(ls_err);
        ls_err = {};

      } //sap.ui.table.Table의 예외처리 프로퍼티 입력값 점검.


    };  //ui table 예외처리 프로퍼티 점검.

    /************************************************************************
     * attribute 점검 항목 영역 -end.
     ************************************************************************/

    

    //ui suggestion 등록 처리.
    oAPP.fn.setUiSuggest = function(oUi, sSuggName){

      var l_meta = oUi.getMetadata();
      if(l_meta._sClassName === "sap.m.Input"){
        oUi.setStartSuggestion(0);
        oUi.setShowSuggestion(true);
        oUi.setFilterSuggests(false);

      }else if(l_meta._sClassName === "sap.m.SearchField"){
        oUi.setEnableSuggestions(true);
        oUi.attachSuggest(function(oEvent){
          var sValue = oEvent.getParameter("suggestValue"),
          aFilters = [];

          if (sValue) {

              aFilters = [
                  new sap.ui.model.Filter([
                      new sap.ui.model.Filter("APPID", function (sText) {
                          return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                      }),
                  ], false)
              ];

          }

          this.getBinding("suggestionItems").filter(aFilters);
          this.suggest();
          
        });
      }

      var oModel = new sap.ui.model.json.JSONModel();
      oUi.setModel(oModel, sSuggName);

      oUi.bindAggregation("suggestionItems", {path: sSuggName + ">/t_sugg", 
        template:new sap.m.SuggestionItem({key:"{" + sSuggName + ">NAME}", text:"{" + sSuggName +">NAME}"})});

      var lt_sugg = oAPP.fn.fnSuggestionRead(sSuggName) || [];

      oModel.setData({t_sugg:lt_sugg});

    };  //ui suggestion 등록 처리.



    //ui suggestion 저장 처리.
    oAPP.fn.saveUiSuggest = function(sSuggName, sVal, iCnt, oUi){

      //이전 suggestion항목 얻기.
      var lt_sugg = oAPP.fn.fnSuggestionRead(sSuggName) || [];

      //현재 입력한 값과 동일한 값 존재여부 확인.
      var l_indx = lt_sugg.findIndex( a=> a.NAME === sVal );

      //존재하는경우 해당 라인 제거.
      if(l_indx !== -1){
        lt_sugg.splice(l_indx,  1);
      }

      //맨 위에 입력값 추가.
      lt_sugg.splice(0, 0, {NAME:sVal});
      
      //수집한 suggestion 항목이 기준값보다 큰경우.
      if(lt_sugg.length > iCnt){
        //기준값 이후 라인 제거 처리.
        lt_sugg.splice(iCnt, lt_sugg.length);
      }

      //suggestion 저장 처리.
      oAPP.fn.fnSuggestionSave(sSuggName, lt_sugg);


      //모델 갱신을 위한 UI정보가 입력되지 않은경우 exit.
      if(!oUi){return;}

      //대상 ui의 모델정보 얻기.
      var l_model = oUi.getModel(sSuggName);

      //모델 갱신 처리.
      l_model.setData({t_sugg:lt_sugg});

    };  //ui suggestion 저장 처리.

    

    
    //이벤트 발생시 마우스의 x, y 좌표 값 얻기.
    oAPP.fn.getMousePosition = function(){
      
      var l_x, l_y;

      //미리보기에서 이벤트가 발생한 경우.
      if (oAPP.attr.ui.frame.contentWindow.event){
        //iframe의 위치 정보 얻기.
        var l_rect1 = oAPP.attr.ui.frame.getBoundingClientRect();

        //미리보기에서 발생한 이벤트 좌표 + iframe의 좌표값 계산.
        l_x = oAPP.attr.ui.frame.contentWindow.event.clientX + l_rect1.x;
        l_y = oAPP.attr.ui.frame.contentWindow.event.clientY + l_rect1.y;
      
      }else if(window.event){
        //그외 영역에서 이벤트가 발생한경우.
        l_x = window.event.clientX;
        l_y = window.event.clientY;

      }

      //x, y 좌표값 return.
      return {x:l_x, y:l_y};


    };  //이벤트 발생시 마우스의 x, y 좌표 값 얻기.



    /*************************************************************
     * @function - UI TABLE 라이브러리 예외처리.
     *************************************************************/
    oAPP.fn.excepUiTableLibrary = function(){

      jQuery.sap.require("sap.ui.table.extensions.KeyboardDelegate");
      sap.ui.table.extensions.KeyboardDelegate.prototype.onkeyup = function(oEvent) {
          var oCellInfo = sap.ui.table.utils.TableUtils.getCellInfo(oEvent.target);
          var ModKey = {
              CTRL: 1,
              SHIFT: 2,
              ALT: 4
          };
          
          function startRangeSelectionMode(oTable) {
              var iFocusedRowIndex = sap.ui.table.utils.TableUtils.getRowIndexOfFocusedCell(oTable);
              var iDataRowIndex = oTable.getRows()[iFocusedRowIndex].getIndex();
              var oSelectionPlugin = oTable._getSelectionPlugin();

              /**
               * Contains information that are used when the range selection mode is active.
               * If this property is undefined the range selection mode is not active.
               * @type {{startIndex: int, selected: boolean}}
               * @property {int} startIndex The index of the data row in which the selection mode was activated.
               * @property {boolean} selected True, if the data row in which the selection mode was activated is selected.
               * @private
               */
              oTable._oRangeSelection = {
                  startIndex: iDataRowIndex,
                  selected: oSelectionPlugin.isIndexSelected(iDataRowIndex)
              };
          }

          // End the range selection mode.
          if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SHIFT)) {
              delete this._oRangeSelection;
          }

          if (oCellInfo.isOfType(sap.ui.table.utils.TableUtils.CELLTYPE.COLUMNHEADER)) {
              if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE) || sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.ENTER)) {
                  sap.ui.table.utils.TableUtils.Menu.openContextMenu(this, oEvent.target);
              }
          } else if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE)) {
              //sap.ui.table.extensions.KeyboardDelegate._handleSpaceAndEnter(this, oEvent);
              sap.ui.table.extensions.KeyboardDelegate.prototype.onsapenter.call(this, oEvent);
          } else if ( oCellInfo.rowIndex !== null && sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE, ModKey.SHIFT)) {
              sap.ui.table.utils.TableUtils.toggleRowSelection(this, this.getRows()[oCellInfo.rowIndex].getIndex());


              startRangeSelectionMode(this);
          } else if (this._legacyMultiSelection && !oCellInfo.isOfType(sap.ui.table.utils.TableUtils.CELLTYPE.COLUMNROWHEADER) &&
                      (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE, ModKey.CTRL) ||
                      sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.ENTER, ModKey.CTRL))) {
              //sap.ui.table.extensions.KeyboardDelegate._handleSpaceAndEnter(this, oEvent);
              sap.ui.table.extensions.KeyboardDelegate.prototype.onsapenter.call(this, oEvent);
          }
      };

    };


    /*************************************************************
     * @function - busy open 시간 대기.
     *************************************************************/
    oAPP.fn.waitBusyOpened = function(){

      return new Promise((res)=>{

        setTimeout(() => {
          res();
        }, 20);        

      });

    };



    //design 영역 순서 설정.
    oAPP.fn.setDesignLayout = function(){

      //design 영역의 split container UI 얻기.
      var l_split = sap.ui.getCore().byId("designSplit");
      
      //현재 design영역의 page정보 얻기.
      var lt_cont = l_split.getContentAreas();

      // design 영역 순서 customize 정보 얻기.
      var lt_layout = parent.getP13nData("designLayout");

      //customizing 하지 않은경우, design영역의 page정보가 없는경우 default 순서로 설정.
      if(!lt_layout && lt_cont.length === 0){
        oSApp.addContentArea(oAPP.attr.ui.oDesignTree);
        oSApp.addContentArea(oAPP.attr.ui.oDesignPreview);
        oSApp.addContentArea(oAPP.attr.ui.oDesignAttr);
        return;
      }

      //customize가 없으면서 이미 design영역에 page가 존재하면 exit.
      if(!lt_layout && lt_cont.length > 0){
        return;
      }

      //POSITION 으로 정렬처리.
      lt_layout.sort(function(a,b){
        return a.POSIT - b.POSIT;
      });


      //customize한 design 배치와 현재 design 배치가 변경됐는지 여부 확인.
      if(lt_cont.length !== 0){
        
        var l_changed = false;
        for(var i=0, l=lt_layout.length; i<l; i++){
          if( lt_layout[i].SID !== lt_cont[i].sId){
            l_changed = true;
            break;
          }
        }

        //변경되지 않았다면 exit.
        if(l_changed === false){
          return;
        }

      }
      

      //모든 영역 제거 처리.
      l_split.removeAllContentAreas();

      for(var i=0, l=lt_layout.length; i<l; i++){
        l_split.addContentArea(oAPP.attr.ui[lt_layout[i].UIID]);
      }


    };  //design 영역 순서 설정.




    //design 영역 invalidate 처리.
    //(10번화면과 20번 화면을 이동하면서 선택 처리건
    //잔상이 남기에 다시 그리기로 잔상 제거 처리 목적)
    oAPP.fn.invalidateDesignArea = function(){

      //좌측 DESIGN TREE 영역 invalidate 처리.
      oAPP.attr.ui.oDesignTree.invalidate();

      //우측 ATTRIBUTE 영역 invalidate 처리.
      oAPP.attr.ui.oDesignAttr.invalidate();


    };  //design 영역 invalidate 처리.




    // random key 생성.
    oAPP.fn.getRandomKey = function(){

      return new Date().getTime() + window.crypto.getRandomValues(new Uint32Array(1)).toString();

    };  // random key 생성.




    //drop 가능 css 제거 처리.
    oAPP.fn.ClearDropEffect = function(){

      //focus된 dom focus 해제 처리.
      document.activeElement.blur();

      var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
      if(l_dom === null || l_dom.length === 0){return;}

      l_dom[0].setAttribute("style", "");
      l_dom[0].style.display = "none";

    };  //drop 가능 css 제거 처리.




    //입력 언어에 따른 language Conversion값 return.
    oAPP.fn.convLanguage = function(i_lang){

      //대문자 전환(ko-kr => KO-KR)
      var l_lang = i_lang.toUpperCase();

      //구분자 분리(KO-KR => KO) 후 앞의 언어키를 return
      //(구분자가 없는경우는 없는대로 return 처리 EN => EN)
      return l_lang.split("-")[0];

    };  //window의 언어에 따른 language Conversion값 return.



    //UI의 drop 가능 css 제거 처리.
    oAPP.fn.clearDropEffectUI = function(oUi){

      if(!oUi || !oUi.addEventDelegate){return;}

      oUi.addEventDelegate({
        ondragover:function(oEvent){

          //focus된 dom focus 해제 처리.
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
  
          var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
          if (l_dom === null || l_dom.length === 0) {
            return;
          }
  
          let oDom = l_dom[0];
  
          oDom.classList.remove("u4aWsDisplayNone");
  
        },
        ondragleave:function(oEvent){

          //focus된 dom focus 해제 처리.
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
  
          var l_dom = document.getElementsByClassName("sapUiDnDIndicator");
          if (l_dom === null || l_dom.length === 0) {
              return;
          }
  
          let oDom = l_dom[0];
  
          oDom.classList.remove("u4aWsDisplayNone");
          oDom.classList.add("u4aWsDisplayNone");
  
        }
      });

    };  //UI의 drop 가능 css 제거 처리.


    
    /*************************************************************
     * @function - 바인딩 팝업 통신 관련 module path 구성.
     *************************************************************/
    oAPP.fn.getBindingPopupBroadcastModulePath = function(){
      
      //디자인상세화면(20화면) <-> BINDPOPUP 통신 모듈 PATH가 존재하는경우 해당 path return.
      if(oAPP.attr.modulePath.broadcastChannelBindPopup !== ""){
        return oAPP.attr.modulePath.broadcastChannelBindPopup;
      }

      //WS 3.0 메인 PATH 얻기.
      var _channelPath = parent.getPath("WS10_20_ROOT");

      //디자인상세화면(20화면) <-> BINDPOPUP 통신 모듈 PATH 구성.
      oAPP.attr.modulePath.broadcastChannelBindPopup = parent.PATH.join(_channelPath, "design", "bindPopupHandler", "broadcastChannelBindPopup.js");

      return oAPP.attr.modulePath.broadcastChannelBindPopup;

    };


    /*************************************************************
     * @function - onAfterRendering 이벤트 등록 대상 UI 검색 모듈 PATH 구성.
     *************************************************************/
    oAPP.fn.getTargetAfterRenderingUIPath = function(){

      //구성된 path가 존재하는경우 해당 path return.
      if(oAPP.attr.modulePath.getTargetAfterRenderingUI !== ""){
        return oAPP.attr.modulePath.getTargetAfterRenderingUI;
      }

      //WS 3.0 메인 PATH 얻기.
      var _channelPath = parent.getPath("WS10_20_ROOT");

      //onAfterRendering 이벤트 등록 대상 UI 검색 모듈 PATH 구성.
      oAPP.attr.modulePath.getTargetAfterRenderingUI = parent.PATH.join(_channelPath, "design", "js", "getTargetAfterRenderingUI.js");

      return oAPP.attr.modulePath.getTargetAfterRenderingUI;

    };


    /*************************************************************
     * @function - 대상 UI에 onAfterRendering 이벤트 등록 처리 모듈 PATH 구성.
     *************************************************************/
    oAPP.fn.setAfterRenderingPath = function(){

      //구성된 path가 존재하는경우 해당 path return.
      if(oAPP.attr.modulePath.setAfterRendering !== ""){
        return oAPP.attr.modulePath.setAfterRendering;
      }

      //WS 3.0 메인 PATH 얻기.
      var _channelPath = parent.getPath("WS10_20_ROOT");

      //대상 UI에 onAfterRendering 이벤트 등록 처리 모듈 PATH 구성.
      oAPP.attr.modulePath.setAfterRendering = parent.PATH.join(_channelPath, "design", "js", "setAfterRendering.js");

      return oAPP.attr.modulePath.setAfterRendering;

    };


    /*************************************************************
     * @function - RichTextEditor 미리보기 출력 예외처리로직 모듈 PATH 구성.
     *************************************************************/
    oAPP.fn.renderingRichTextEditorPath = function(){

      //구성된 path가 존재하는경우 해당 path return.
      if(oAPP.attr.modulePath.renderingRichTextEditor !== ""){
        return oAPP.attr.modulePath.renderingRichTextEditor;
      }

      //WS 3.0 메인 PATH 얻기.
      var _channelPath = parent.getPath("WS10_20_ROOT");

      //대상 UI에 RichTextEditor 미리보기 출력 예외처리로직 모듈 PATH 구성.
      oAPP.attr.modulePath.renderingRichTextEditor = parent.PATH.join(_channelPath, "design", "js", "renderingRichTextEditor.js");

      return oAPP.attr.modulePath.renderingRichTextEditor;

    };
    


    /*************************************************************
     * @function - onAfterRendering 이벤트 등록 대상 UI 검색.
     *************************************************************/
    oAPP.fn.getTargetAfterRenderingUI = function(oTarget){

      return parent.require(oAPP.fn.getTargetAfterRenderingUIPath())(oTarget);

    };


    /*************************************************************
     * @function - 대상 UI에 onAfterRendering 이벤트 등록 처리.
     *************************************************************/
    oAPP.fn.setAfterRendering = function(oTarget){
      
      return parent.require(oAPP.fn.setAfterRenderingPath())(oTarget);

    };


    /*************************************************************
     * @function - RichTextEditor 미리보기 출력 예외처리로직.
     *************************************************************/
    oAPP.fn.renderingRichTextEditor = function(oTarget){
      
      return parent.require(oAPP.fn.renderingRichTextEditorPath())(oTarget);

    };



    //workbench 화면을 구성할 UI가 존재하지 않는경우 exit.
    if(!oAPP.attr.oArea){return;}


    sap.ui.getCore().loadLibrary("sap.ui.layout");
    sap.ui.getCore().loadLibrary("sap.m");    
    sap.ui.getCore().loadLibrary("sap.f");


    var oSApp = new sap.ui.layout.Splitter("designSplit");
    oAPP.attr.oArea.addContent(oSApp);

    oAPP.attr.oModel = new sap.ui.model.json.JSONModel();
    oAPP.attr.oModel.setSizeLimit(100000);
    oSApp.setModel(oAPP.attr.oModel);

    //좌측 페이지(UI Design 영역)
    oAPP.attr.ui.oDesignTree = new sap.m.Page("designTree", {enableScrolling:false, showHeader:false,
      layoutData:new sap.ui.layout.SplitterLayoutData({size:"25%", minSize:300})}).addStyleClass("u4aWsDesignTree");
    // oSApp.addContentArea(oAPP.attr.ui.oDesignTree);

    //A67	Preview
    //가운데 페이지(미리보기 영역)
    oAPP.attr.ui.oDesignPreview = new sap.m.Page("designPreview").addStyleClass("u4aWsDesignPreview");
    // oSApp.addContentArea(oAPP.attr.ui.oDesignPreview);

    //우측 페이지(attribute 영역)
    oAPP.attr.ui.oDesignAttr = new sap.f.DynamicPage("designAttr", {preserveHeaderStateOnScroll:false,
      layoutData:new sap.ui.layout.SplitterLayoutData({size:"30%", minSize:300})}).addStyleClass("u4aWsDesignAttr");
    // oSApp.addContentArea(oAPP.attr.ui.oDesignAttr);


    //design 영역 순서 설정.
    oAPP.fn.setDesignLayout();


    //ui design area(좌측 TREE 영역)
    oAPP.fn.getScript("design/js/uiDesignArea",function(){oAPP.fn.uiDesignArea(oAPP.attr.ui.oDesignTree);});

    //ui preview area(가운데 미리보기 영역)
    oAPP.fn.getScript("design/js/uiPreviewArea",function(){oAPP.fn.uiPreviewArea(oAPP.attr.ui.oDesignPreview);});

    //ui attribute area(우측 ui 속성정보 영역)
    oAPP.fn.getScript("design/js/uiAttributeArea",function(){oAPP.fn.uiAttributeArea(oAPP.attr.ui.oDesignAttr);});


  };  //미리보기 메인 function




})(oAPP);
