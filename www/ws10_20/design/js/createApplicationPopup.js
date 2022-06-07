(function(){
  //application 생성시 추가 입력정보 팝업 호출.
  oAPP.fn.createApplicationPopup = function(appid){

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

      }

      //application 생성전 입력값 점검.
      function lf_chkValue(){
        var ls_appl = oModel.getProperty("/CREATE");

        //valueState 바인딩 필드 초기화.
        lf_resetValueStateField(ls_appl);

        var l_err = false;

        //Web Application Name 이 입력되지 않은경우.
        if(ls_appl.APPNM === ""){
          ls_appl.APPNM_stat = "Error";
          ls_appl.APPNM_stxt = "Application Name is required entry value.";
          l_err = true;
        }


        //Package가 입력되지 않은 경우.
        if(ls_appl.PACKG === ""){
          ls_appl.PACKG_stat = "Error";
          ls_appl.PACKG_stxt = "Package is required entry value.";
          l_err = true;
        }

        //Y, Z 이외의 패키지명을 입력한 경우.
        if(lf_chkPackageStandard(ls_appl) === true){
          l_err = true;      
        }      

        //개발 패키지를 입력한경우 CTS번호를 입력하지 않은경우.
        if(ls_appl.PACKG !== "$TMP" && ls_appl.PACKG !== "" && ls_appl.REQNR === ""){
          ls_appl.REQNR_stat = "Error";
          ls_appl.REQNR_stxt = "If not a local object, Request No. is required entry value.";
          l_err = true;
        }

        //입력값에 오류 사항이 존재하는 경우 exit.
        if(l_err === true){
          oModel.setData({"CREATE":ls_appl});
          parent.showMessage(sap, 20, "E", "Check input value.");
          return l_err;
        }

      }

      //standard package 입력 여부 점검.
      function lf_chkPackageStandard(is_appl){

        //로컬 PACKAGE가 아닌경우 Y, Z 이외의 패키지명을 입력한 경우.
        if(is_appl.PACKG !== "" &&
          is_appl.PACKG !== "$TMP" &&
          is_appl.PACKG.substr(0,1) !== "Y" &&
          is_appl.PACKG.substr(0,1) !== "Z"){

            is_appl.PACKG_stat = "Error";
            is_appl.PACKG_stxt = "Standard package cannot be entered.";

            //오류 flag return.
            return true;
        }

      } //standard package 입력 여부 점검.


      //초기값 설정.
      function lf_setDefaultVal(){

        var ls_appl = {};

        //Web Application Name
        ls_appl.APPNM = "";

        //Language Key
        ls_appl.LANGU = "EN";

        //Character Format
        ls_appl.CODPG = "utf-8";

        //UI5 UI Theme
        ls_appl.UITHM = "sap_fiori_3";

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
                          ];


        oModel.setData({"CREATE":ls_appl});

      }

      //dialog 종료 처리.
      function lf_closeDialog(bSkipMsg){
        oCreateDialog.close();
        oCreateDialog.destroy();

        if(bSkipMsg === true){return;}
        
        //001	Cancel operation
        parent.showMessage(sap,10, "I", "Cancel operation");

      }

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


      //Package Input Field
      var oInpPack = new sap.m.Input({
        value:"{/CREATE/PACKG}",
        valueState:"{/CREATE/PACKG_stat}",
        valueStateText:"{/CREATE/PACKG_stxt}",
        editable:"{/CREATE/PACKG_edit}"
      });

      oInpPack.attachChange(function(){

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

      });

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


      var oCreateDialogForm = new sap.ui.layout.form.Form({
        editable: true,
        layout : new sap.ui.layout.form.ResponsiveGridLayout({
          labelSpanXL: 2,
          labelSpanL: 3,
          labelSpanM: 3,
          labelSpanS: 12,
          singleContainerFullSize: false
        }),
        formContainers: [
          new sap.ui.layout.form.FormContainer({
            formElements : [
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  required: true,
                  design: "Bold",
                  text: "Web Application Name"
                }),
                fields : oInpDesc
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: "Language Key"
                }),
                fields : oInpLang
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: "Character Format"
                }),
                fields : oSelFormat
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: "UI5 UI Theme",
                }),
                fields : oSelTheme
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  required: true,
                  design: "Bold",
                  text: "Package",
                }),
                fields : oInpPack
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: "Request No.",
                }),
                fields : oInpReqNo
              }),
              new sap.ui.layout.form.FormElement({
                label : new sap.m.Label({
                  design: "Bold",
                  text: "Request Desc.",
                }),
                fields : oInpReqTx
              })
            ]
          }),
        ]
      });

      //application 생성처리를 위한 서버 호출.
      function lf_createAppData(){
        

        var l_create = oModel.getProperty("/CREATE");
        var l_appdata = {};
        l_appdata.APPID = appid;
        l_appdata.APPNM = l_create.APPNM;
        l_appdata.LANGU = l_create.LANGU;
        l_appdata.CODPG = l_create.CODPG;
        l_appdata.UITHM = l_create.UITHM;
        l_appdata.PACKG = l_create.PACKG;
        l_appdata.REQNR = l_create.REQNR;


        //application명 서버전송 데이터 구성.
        var oFormData = new FormData();
        oFormData.append("APPDATA", JSON.stringify(l_appdata));

        //application 생성을 위한 서버 호출.
        sendAjax(parent.getServerPath() + "/createAppData",oFormData, function(ret){

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

        },"");

      } //application 생성처리를 위한 서버 호출.

      

      function lf_chkPackage(is_create){
        //application명 서버전송 데이터 구성.
        
        //busy dialog open.
        oAPP.common.fnSetBusyDialog(true);

        var oFormData = new FormData();
        oFormData.append("PACKG", is_create.PACKG);

        sendAjax(parent.getServerPath() + "/chkPackage",oFormData, function(ret){

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


        },"");

      }

      // Application 생성 Dialog
      var oCreateDialog = new sap.m.Dialog({
        draggable: true,
        resizable: true,
        contentWidth: "50%",
        title: "UI5 Application Create Option Selection",
        titleAlignment: "Center",
        icon: "sap-icon://document",
        buttons: [
          new sap.m.Button({
            type: "Accept",
            icon: "sap-icon://accept",
            press : function(){

              //busy dialog true.
              oAPP.common.fnSetBusyDialog(true);

              //application 생성 처리전 입력값 점검.
              if( lf_chkValue() === true){
                //busy dialog close.
                oAPP.common.fnSetBusyDialog(false);
                return;
              }

              //application 생성 처리.
              lf_createAppData();

            }
          }),
          new sap.m.Button({
            type: "Reject",
            icon: "sap-icon://decline",
            press: lf_closeDialog
          }),
        ],

        content: [
          oCreateDialogForm
        ]

      });


      var oTool = new sap.m.Toolbar();
      oCreateDialog.setCustomHeader(oTool);
      
      var oTitle = new sap.m.Title({text:"UI5 Application Create Option Selection"});

      oTool.addContent(oTitle);

      oTool.addContent(new sap.m.ToolbarSpacer());

      //우상단 닫기버튼.
      var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
      oTool.addContent(oBtn0);

      //닫기 버튼 선택 이벤트.
      oBtn0.attachPress(function(){
        
        lf_closeDialog();

      });

      var oModel = new sap.ui.model.json.JSONModel();
      oCreateDialog.setModel(oModel);

      //default 정보 바인딩.
      lf_setDefaultVal();

      oCreateDialog.open();

  };
})();