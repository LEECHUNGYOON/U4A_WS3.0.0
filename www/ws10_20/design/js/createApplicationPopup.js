(function(){


  const LAYOUT_IMG1 = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", "image01.jpg");
  const LAYOUT_IMG2 = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", "image02.jpg");
  const LAYOUT_IMG3 = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", "image03.jpg");
  const LAYOUT_IMG4 = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", "image04.jpg");


  //application 생성시 추가 입력정보 팝업 호출.
  oAPP.fn.createApplicationPopup = function(appid){

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

      } //valueState 바인딩 필드 초기화.



      //application 생성전 입력값 점검.
      function lf_chkValue(){

        var ls_appl = oModel.getProperty("/CREATE");

        //VIEW(TABLE)명 입력값 얻기.
        var l_TABNM = oModel.getProperty("/DATASET/TABNM");

        //valueState 바인딩 필드 초기화.
        lf_resetValueStateField(ls_appl);

        var l_err = false;

        //Web Application Name 이 입력되지 않은경우.
        //(dataset의 Object Name입력됐다면 view, table의 desc를 Web Application Name으로 대체.)
        if(ls_appl.APPNM === "" && l_TABNM === ""){
          ls_appl.APPNM_stat = "Error";
          //A33	Application name
          //014	& is required entry value.
          ls_appl.APPNM_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A33"), "", "", "");
          l_err = true;
        }


        //Package가 입력되지 않은 경우.
        if(ls_appl.PACKG === ""){
          ls_appl.PACKG_stat = "Error";
          //A22	Package
          //014	& is required entry value.
          ls_appl.PACKG_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "014", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22"), "", "", "");
          l_err = true;
        }

        //Y, Z 이외의 패키지명을 입력한 경우.
        if(lf_chkPackageStandard(ls_appl) === true){
          l_err = true;      
        }      

        //개발 패키지를 입력한경우 CTS번호를 입력하지 않은경우.
        if(ls_appl.PACKG !== "$TMP" && ls_appl.PACKG !== "" && ls_appl.REQNR === ""){
          ls_appl.REQNR_stat = "Error";
          //277	If not a local object, Request No. is required entry value.
          ls_appl.REQNR_stxt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "277", "", "", "", "");
          l_err = true;
        }

        //입력값에 오류 사항이 존재하는 경우 exit.
        if(l_err === true){
          oModel.setProperty("/CREATE", ls_appl);
          //274	Check input value.
          parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "274", "", "", "", ""));
          return l_err;
        }

        oModel.setProperty("/CREATE", ls_appl);

      } //application 생성전 입력값 점검.



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



      //초기값 설정.
      function lf_setDefaultVal(){

        var ls_appl = {};

        //Web Application Name
        ls_appl.APPNM = "";

        //접속 유저 정보 얻기.
        var ls_userInfo = parent.getUserInfo();

        //Language Key default EN
        ls_appl.LANGU = "EN";

        //접속 유저 정보, 접속 language가 존재하는경우.
        if(ls_userInfo && ls_userInfo.LANGU){
          //해당 language를 default language로 설정.
          ls_appl.LANGU = ls_userInfo.LANGU;

        }

        //Character Format
        ls_appl.CODPG = "utf-8";

        //UI5 UI Theme
        ls_appl.UITHM = "sap_horizon";

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

        //Language Key DDLB 리스트
        ls_appl.T_LANGU = [{KEY:"EN",TEXT:"English"},
                          {KEY:"KO",TEXT:"Korean"}
                          ];

        //Character Format DDLB 리스트
        ls_appl.T_CODPG = [{KEY:"utf-8",TEXT:"utf-8"},
                          {KEY:"EUC-KR",TEXT:"EUC-KR"}
                          ];

        //UI5 UI Theme DDLB 리스트
        ls_appl.T_UITHM = [{KEY:"base",TEXT:"base"},
                          {KEY:"sap_belize",TEXT:"sap_belize"},
                          {KEY:"sap_belize_hcb",TEXT:"sap_belize_hcb"},
                          {KEY:"sap_belize_hcw",TEXT:"sap_belize_hcw"},
                          {KEY:"sap_belize_plus",TEXT:"sap_belize_plus"},
                          {KEY:"sap_bluecrystal",TEXT:"sap_bluecrystal"},
                          {KEY:"sap_hcb",TEXT:"sap_hcb"},
                          {KEY:"sap_fiori_3",TEXT:"sap_fiori_3"},
                          {KEY:"sap_fiori_3_dark",TEXT:"sap_fiori_3_dark"},
                          {KEY:"sap_fiori_3_hcb",TEXT:"sap_fiori_3_hcb"},
                          {KEY:"sap_fiori_3_hcw",TEXT:"sap_fiori_3_hcw"},
                          {KEY:"sap_horizon",TEXT:"sap_horizon"},
                          {KEY:"sap_horizon_dark",TEXT:"sap_horizon_dark"},
                          {KEY:"sap_horizon_hcb",TEXT:"sap_horizon_hcb"},
                          {KEY:"sap_horizon_hcw",TEXT:"sap_horizon_hcw"}
                          ];

        //Web Application Type DDLB 리스트.
        ls_appl.T_APPTY = [{KEY:"M",TEXT:"U4A Application"},
                           {KEY:"U",TEXT:"U4A Server Page"}
                          ];


        oModel.setData({"CREATE":ls_appl, "DATASET":{"RB01":true, "RB02":false, 
          "TABNM":"", "TABTX":"","FLIST":"", "SCCNT":0, "enab01":true, 
          "imgsrc":LAYOUT_IMG1}});

      } //초기값 설정.



      //dialog 종료 처리.
      function lf_closeDialog(bSkipMsg){
        oCreateDialog.close();
        oCreateDialog.destroy();

        if(bSkipMsg === true){return;}
        
        //001	Cancel operation
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

      } //dialog 종료 처리.



      //dataset 파라메터 추가 처리.
      function lf_setDatasetParam(APPTY, oForm){

        //U4A 어플리케이션 생성건이 아닌경우 EXIT.
        if(APPTY !== "M"){return;}

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
      function lf_createAppData(){

        //생성전 화면 lock 처리.
        sap.ui.getCore().lock();

        //busy dialog close.
        oAPP.common.fnSetBusyDialog(true);

        var l_create = oModel.getProperty("/CREATE");
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
        lf_setDatasetParam(l_appdata.APPTY, oFormData);


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
          lf_closeDialog(true);

        },"", true, "POST", function(e){
          //오류 발생시 lock 해제.
          sap.ui.getCore().unlock();
  
        }); //application 생성을 위한 서버 호출.

      } //application 생성처리를 위한 서버 호출.

      

      //입력 package 점검 function.
      function lf_chkPackage(is_create){
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

          //잘못된 PACKAGE를 입력한 경우.
          if(ret.ERFLG === "X"){
            is_create.PACKG_stat = "Error"; 
            is_create.PACKG_stxt = ret.ERMSG;
            oModel.setProperty("/CREATE", is_create);

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
          oModel.setProperty("/CREATE", is_create);


        },"", true, "POST", function(e){
          //오류 발생시 lock 해제.
          sap.ui.getCore().unlock();
  
        }); //package 입력건 점검을 위한 서버 호출.

      } //입력 package 점검 function.



      //어플리케이션 생성 처리.
      async function lf_createApplication(bIsLocal){

        //생성전 화면 lock 처리.
        sap.ui.getCore().lock();

        //busy dialog true.
        oAPP.common.fnSetBusyDialog(true);

        var l_create = oModel.getProperty("/CREATE");

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

          oModel.setProperty("/CREATE", l_create);

        }
        

        //application 생성 처리전 입력값 점검.
        if( lf_chkValue() === true){

          //입력값 오류 발생시 lock해제.
          sap.ui.getCore().unlock();

          //busy dialog close.
          oAPP.common.fnSetBusyDialog(false);
          return;
        }

        //VIEW(TABLE)명 입력값 얻기.
        var l_TABNM = oModel.getProperty("/DATASET/TABNM");

        //입력값 오류 발생시 lock해제.
        sap.ui.getCore().unlock();

        //busy dialog close.
        oAPP.common.fnSetBusyDialog(false);


        //VIEW(TABLE)명을 입력했다면 검색필드 선택 팝업 호출.
        if(l_TABNM !== ""){
          
          //필드 리스트 POPUP정보가 존재하지 않는경우 JS READ.
          if(typeof oAPP.fn._DATASET === "undefined"){
            oAPP.fn._DATASET = parent.require(parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "js", "callDataSetFieldListPopop.js"));
          }

          //DATASET을 설정한 경우 입력 OBJECT NAME의 검색조건 리스트 정보 얻기.
          var ls_return = await oAPP.fn._DATASET.callDataSetFieldListPopop(oModel.getProperty("/DATASET"), oAPP);

          //필드 리스트 팝업에서 오류가 발생한 경우 exit.
          if(ls_return.RETCD === "E"){
            return;
          }

          //필드 리스트 정보 매핑(없는경우 빈값으로 매핑)
          oModel.setProperty("/DATASET/FLIST", ls_return.FLIST || "");

          //Web Application Name을 입력하지 않은경우.
          if(l_create.APPNM === ""){
            //VIEW(TABLE)의 DESC를 매핑.
            oModel.setProperty("/CREATE/APPNM", ls_return.TDESC);
          }

        }

        //생성전 확인팝업 호출.
        //276	Create &1 application?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "276", appid, "", "", ""), function(param){
          
          //YES를 선택하지 않은경우 EXIT.
          if(param !== "YES"){return;}
          
          //application 생성 처리.
          lf_createAppData();

        }); //생성전 확인팝업 호출.


      } //어플리케이션 생성 처리.



      //object name f4 help 이벤트.
      function lf_ObjNameF4Help(){
        
        // f4 help callback function.
        function lf_callback(param){
          //파라메터를 전달받지 못한 경우 exit.
          if(!param){return;}

          //파라메터의 필드명에 해당하는 값 매핑.
          oInp1.setValue(param[l_fldnm]);
          oInp1.setDescription(param["DDTEXT"]);

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



      //package 입력값 변경 이벤트.
      function lf_packageChangeEvent(){
        
        //화면 입력정보 얻기.
        var l_create = oModel.getProperty("/CREATE");

        //오류 출력 필드 초기화.
        lf_resetValueStateField(l_create);
        
        //default Request No. 입력불가능, 필수 해제처리.
        l_create.REQNR_edit = false;
        l_create.REQNR_requ = false;

        //패키지명이 입력되지 않은경우 exit.
        if(l_create.PACKG === ""){
          oModel.setProperty("/CREATE", l_create);
          return;
        }
        
        //입력 패키지명 대문자 변환 처리.
        l_create.PACKG = l_create.PACKG.toUpperCase();

        //로컬 패키지를 입력한 경우.
        if(l_create.PACKG === "$TMP"){
          l_create.REQNR = "";   //기존 입력 Request No. 초기화.
          l_create.REQTX = "";   //기존 입력 Request Desc. 초기화.
          oModel.setProperty("/CREATE", l_create);
          return;
        }
       

        //standard package를 입력한 경우.
        if(lf_chkPackageStandard(l_create) === true){
          oModel.setProperty("/CREATE", l_create);
          return;
        }


        //로컬 PACKAGE를 입력하지 않은경우 Y,Z으로 입력한 PACKAGE의 정합성 점검.
        lf_chkPackage(l_create);

      } //package 입력값 변경 이벤트.



      //DATASET 화면 제어 처리.
      function lf_setDatasetLayout(){

        //APPLICATION TYPE 입력값 얻기.
        var l_APPTY = oModel.getProperty("/CREATE/APPTY");

        //default 화면 잠금 처리.
        var l_enab = false;

        //APPLICATION TYPE을 U4A APPLICATION으로 입력한 경우.
        if(l_APPTY === "M"){
          //화면 입력 가능 처리.
          l_enab = true;
        }

        return l_enab;

      } //DATASET 화면 제어 처리.



      //DATASET 바인딩 값 초기화.
      function lf_resetDatasetVal(){
        //DATASET 화면 제어 처리 값 얻기.
        var l_enab = lf_setDatasetLayout();

        //dataset 입력값 초기화 처리.
        oModel.setProperty("/DATASET", {"RB01":true, "RB02":false, "TABNM":"", 
          "TABTX":"","FLIST":"", "SCCNT":0, "enab01":l_enab, 
          "imgsrc":LAYOUT_IMG1});

      } //DATASET 바인딩 값 초기화.



      //라디오 버튼 선택에 따른 이미지 변경 처리.
      function lf_setSearchLayoutImage(){
        var l_SCCNT = oModel.getProperty("/DATASET/SCCNT");

        var l_imgsrc = "";

        //라디오 선택건에 따른 이미지 src 분기.
        switch(l_SCCNT){
          case 0: //1 column
            l_imgsrc = LAYOUT_IMG1;
            break;
          case 1: //2 columns
            l_imgsrc = LAYOUT_IMG2;
            break;
          case 2: //3 columns
            l_imgsrc = LAYOUT_IMG3;
            break;
          case 3: //4 columns
            l_imgsrc = LAYOUT_IMG4;
            break;
        }

        oModel.setProperty("/DATASET/imgsrc", l_imgsrc);

      } //라디오 버튼 선택에 따른 이미지 변경 처리.


      /************************************************************************
       * application 생성 팝업 화면 구성 영역.
       * **********************************************************************
       ************************************************************************/

      //Web Application Name Input Field
      var oInpDesc = new sap.m.Input({
        value:"{/CREATE/APPNM}",
        valueState:"{/CREATE/APPNM_stat}",
        valueStateText:"{/CREATE/APPNM_stxt}"
      });

      //Language Key Input Field
      var oInpLang = new sap.m.ComboBox({
        selectedKey:"{/CREATE/LANGU}",
        valueState:"{/CREATE/LANGU_stat}",
        valueStateText:"{/CREATE/LANGU_stxt}"
      });

      oInpLang.bindAggregation("items", {
        path: "/CREATE/T_LANGU",
        template: new sap.ui.core.Item({
          key : "{KEY}",
          text : "{TEXT}"
        })
      });


      //Character Format DDLB
      var oSelFormat = new sap.m.Select({
          selectedKey: "{/CREATE/CODPG}",
          valueState:"{/CREATE/CODPG_stat}",
          valueStateText:"{/CREATE/CODPG_stxt}"
      });

      oSelFormat.bindAggregation("items", {
        path: "/CREATE/T_CODPG",
        template: new sap.ui.core.Item({
          key : "{KEY}",
          text : "{TEXT}"
        })
      });

      //UI5 UI Theme
      var oSelTheme = new sap.m.Select({
          selectedKey: "{/CREATE/UITHM}",
          valueState:"{/CREATE/UITHM_stat}",
          valueStateText:"{/CREATE/UITHM_stxt}"
      });

      oSelTheme.bindAggregation("items", {
        path: "/CREATE/T_UITHM",
        template: new sap.ui.core.Item({
          key : "{KEY}",
          text : "{TEXT}"
        })
      });


      //Web Application Type
      var oSelType = new sap.m.Select({
        selectedKey: "{/CREATE/APPTY}",
        enabled: "{/CREATE/APPTY_edit}"
      });

      //application type 변경 이벤트.
      oSelType.attachChange(function(){
        //dataset 입력값 초기화 처리.
        lf_resetDatasetVal();

      });

      oSelType.bindAggregation("items", {
        path: "/CREATE/T_APPTY",
        template: new sap.ui.core.Item({
          key : "{KEY}",
          text : "{TEXT}"
        })
      });


      //Package Input Field
      var oInpPack = new sap.m.Input({
        value:"{/CREATE/PACKG}",
        valueState:"{/CREATE/PACKG_stat}",
        valueStateText:"{/CREATE/PACKG_stxt}",
        editable:"{/CREATE/PACKG_edit}"
      });

      //package 입력값 변경 이벤트.
      oInpPack.attachChange(function(){
        
        //package 입력값 변경 이벤트.
        lf_packageChangeEvent();

      }); //package 입력값 변경 이벤트.



      //Request No. Input Field
      var oInpReqNo = new sap.m.Input({
        value:"{/CREATE/REQNR}",
        valueState:"{/CREATE/REQNR_stat}",
        required:"{/CREATE/REQNR_requ}",
        editable:"{/CREATE/REQNR_edit}",
        showValueHelp:true,valueHelpOnly:true
      });

      
      //Request No f4 help 이벤트.
      oInpReqNo.attachValueHelpRequest(function(){
        var oModel = this.getModel();
        //Request No 팝업 호출.
        oAPP.fn.fnCtsPopupOpener(function(param){
          
          //return받은 Request No 반영.
          oModel.setProperty("/CREATE/REQNR", param.TRKORR);

          //return받은 Request Desc 반영.
          oModel.setProperty("/CREATE/REQTX", param.AS4TEXT);

        });

      });


      //Request Desc. Input Field
      var oInpReqTx = new sap.m.Input({
        value:"{/CREATE/REQTX}",
        editable:false
      });

      
      //하위 추가 속성 정보 icon tab.
      var oIconTab = new sap.m.IconTabBar();

      //B26  Data Set
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B26", "", "", "", "");
      var oFilter1 = new sap.m.IconTabFilter({key:"K01", text:l_txt, tooltip:l_txt});
      oIconTab.addItem(oFilter1);

      //Database View(table) form 정보.
      var oForm1 = new sap.ui.layout.form.Form({editable:true, 
        layout:new sap.ui.layout.form.ResponsiveGridLayout({labelSpanXL:3, labelSpanL:4, columnsL:2,
          labelSpanM:4, singleContainerFullSize:false, adjustLabelSpan:false})});
      oFilter1.addContent(oForm1);
        
      var oCont1 = new sap.ui.layout.form.FormContainer();
      oForm1.addFormContainer(oCont1);
      
      //B27  Object Type
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B27", "", "", "", "") ;

      var oElem1 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
      oCont1.addFormElement(oElem1);

      var oRG01 = new sap.m.RadioButtonGroup({columns:2});
      oElem1.addField(oRG01);

      //B28  Database View
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B28", "", "", "", "");

      var oRb01 = new sap.m.RadioButton({text:l_txt, tooltip:l_txt, selected:"{/DATASET/RB01}", enabled:"{/DATASET/enab01}"});
      oRb01.addStyleClass("sapUiTinyMarginEnd");
      oRG01.addButton(oRb01);

      //B29  Transparent Table
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B29", "", "", "", "");

      var oRb02 = new sap.m.RadioButton({text:l_txt, tooltip:l_txt, selected:"{/DATASET/RB02}", enabled:"{/DATASET/enab01}"});
      oRG01.addButton(oRb02);

      //A50  Object Name
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A50", "", "", "", "");

      var oElem2 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
      oCont1.addFormElement(oElem2);

      //OBJECT NAME INPUT FIELD(VIEW, TABLE명 입력필드.)
      var oInp1 = new sap.m.Input({showValueHelp:true, fieldWidth:"40%", value:"{/DATASET/TABNM}", 
        description:"{/DATASET/TABTX}", enabled:"{/DATASET/enab01}"});
      oElem2.addField(oInp1);

      //OBJECT NAME change 이벤트.
      oInp1.attachChange(function(){

        //VIEW(TABLE) 입력건 대문자 변환 처리.
        this.setValue(this.getValue().toUpperCase());

      }); //OBJECT NAME change 이벤트.

      //OBJECT NAME F4 HELP 이벤트.
      oInp1.attachValueHelpRequest(function(){

        //OBJECT NAME F4 HELP 이벤트.
        lf_ObjNameF4Help();

      }); //OBJECT NAME F4 HELP 이벤트.
      
      //E09  Search Layout
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E09", "", "", "", "");

      var oElem3 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
      oCont1.addFormElement(oElem3);

      var oHbox3 = new sap.m.HBox({direction:"Column"});
      oElem3.addField(oHbox3);

      //검색조건 layout 선택 radio button group.
      var oRG02 = new sap.m.RadioButtonGroup({columns:4,selectedIndex:"{/DATASET/SCCNT}", enabled:"{/DATASET/enab01}",
        buttons:[
        new sap.m.RadioButton({text:"One Column"}),
        new sap.m.RadioButton({text:"Two Columns"}),
        new sap.m.RadioButton({text:"Three Columns"}),
        new sap.m.RadioButton({text:"Four Columns"})
      ]});

      oHbox3.addItem(oRG02);

      //라디오 버튼 그룹 선택 이벤트.
      oRG02.attachSelect(function(){
        //라디오 버튼 선택에 따른 이미지 변경 처리.
        lf_setSearchLayoutImage();
      });
      
      var oImg = new sap.m.Image({src:"{/DATASET/imgsrc}", height:"200px",
        detailBox:new sap.m.LightBox({imageContent:new sap.m.LightBoxItem({imageSrc:"{/DATASET/imgsrc}"})})});
      oHbox3.addItem(oImg);
      
      


      //A91  Web Application Name
      var l_txt1 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91", "", "", "", "");

      //A98  Language Key
      var l_txt2 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A98", "", "", "", "");

      //A99  Character Format
      var l_txt3 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A99", "", "", "", "");

      //B01  UI5 UI Theme
      var l_txt4 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B01", "", "", "", "");

      //B02  Web Application Type
      var l_txt5 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B02", "", "", "", "");
      
      //A22  Package
      var l_txt6 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22", "", "", "", "");

      //B03  Request No
      var l_txt7 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B03", "", "", "", "");

      //B04  Request Desc.
      var l_txt8 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B04", "", "", "", "");

      
      var oCreateDialogForm = new sap.ui.layout.form.Form({
        editable: true,
        width:"100%",
        layout : new sap.ui.layout.form.ResponsiveGridLayout({
          labelSpanXL: 3,
          labelSpanL: 4,
          labelSpanM: 4,
          labelSpanS: 12,
          columnsL:2,
          singleContainerFullSize: false,
          adjustLabelSpan: false,
          backgroundDesign:"Transparent"
        }),
        formContainers: [
          new sap.ui.layout.form.FormContainer({
            formElements : [
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  required: true,
                  design: "Bold", 
                  text: l_txt1,     //A91  Web Application Name
                  tooltip:l_txt1    //A91  Web Application Name
                }),
                fields : oInpDesc
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt2,     //A98  Language Key
                  tooltip:l_txt2    //A98  Language Key
                }),
                fields : oInpLang
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt3,     //A99  Character Format
                  tooltip:l_txt3    //A99  Character Format
                }),
                fields : oSelFormat
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt4,     //B01  UI5 UI Theme
                  tooltip:l_txt4    //B01  UI5 UI Theme
                }),
                fields : oSelTheme
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt5,     //B02  Web Application Type
                  tooltip:l_txt5    //B02  Web Application Type
                }),
                fields : oSelType
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  required: true,
                  design: "Bold",
                  text: l_txt6,     //A22  Package
                  tooltip:l_txt6    //A22  Package
                }),
                fields : oInpPack
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt7,     //B03  Request No
                  tooltip:l_txt7    //B03  Request No
                }),
                fields : oInpReqNo
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: l_txt8,     //B04  Request Desc.
                  tooltip:l_txt8    //B04  Request Desc.
                }),
                fields : oInpReqTx
              })              
            ]
          }),
          //dataset 내용 완성이 안되어있기에 nobuild 상태일때만 화면 활성화 처리.
          new sap.ui.layout.form.FormContainer({visible:parent.REMOTE.app.isPackaged ? false : true,
            formElements : [
              new sap.ui.layout.form.FormElement({
                fields : oIconTab
              })
            ]
          })
        ]
      });



      // Application 생성 Dialog
      var oCreateDialog = new sap.m.Dialog({draggable: true, resizable: true,
        contentWidth: "50%", contentHeight: "60%", verticalScrolling: false});
      
      oCreateDialog.addStyleClass("sapUiSizeCompact");

      //toolbar.
      var oTool = new sap.m.Toolbar();
      oCreateDialog.setCustomHeader(oTool);

      //B05  UI5 Application Create Option Selection
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B05", "", "", "", "");
      
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
        lf_closeDialog();

      }); //닫기 버튼 선택 이벤트.

      //var oHbox1 = new sap.m.HBox({height:"100%", width:"100%", direction:"Column", renderType:"Bare", justifyContent:"SpaceBetween"});
      var oPage1 = new sap.m.Page({showHeader:false});
      oCreateDialog.addContent(oPage1);

      //oHbox1.addItem(oCreateDialogForm);
      oPage1.addContent(oCreateDialogForm);



      var oFoot = new sap.m.Toolbar({content:[new sap.m.ToolbarSpacer()]});
      //oHbox1.addItem(oFoot);
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
        lf_createApplication(true);

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
        lf_createApplication();

      }); //application 생성버튼 선택 이벤트.


      //A39  Close
      var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

      //application 생성팝업 종료 버튼.
      var oClose = new sap.m.Button({text:l_txt, type: "Reject", icon: "sap-icon://decline", tooltip:l_txt});
      oFoot.addContent(oClose);

      //닫기 버튼 선택 이벤트.
      oClose.attachPress(function(){
        lf_closeDialog();

      }); //닫기 버튼 선택 이벤트.


      var oModel = new sap.ui.model.json.JSONModel();
      oCreateDialog.setModel(oModel);

      //default 정보 바인딩.
      lf_setDefaultVal();

      //팝업 호출.
      oCreateDialog.open();

  };  //application 생성시 추가 입력정보 팝업 호출.

})();