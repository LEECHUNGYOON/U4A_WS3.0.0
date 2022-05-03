// 이벤트 생성 팝업 호출.
oAPP.fn.createEventPopup = function(is_attr, f_callBack){

  //팝업 종료.
  function lf_dialogClose(bSkipMsg){
    
    oDlg.close();

    if(bSkipMsg === true){return;}

    //001	Cancel operation
    parent.showMessage(sap,10, "I", "Cancel operation");
  }



  //입력값 점검.
  function lf_chkInputVal(){

    var l_erflag = false;
    var ls_event = oModel.getProperty("/event");

    //메소드명 대문자 변환 처리.
    ls_event.meth = ls_event.meth.toUpperCase();

    ls_event.meth_stat = "None";
    ls_event.meth_text = "";
    ls_event.desc_stat = "None";
    ls_event.desc_text = "";

    //이벤트 메소드명을 입력하지 않은경우.
    if(ls_event.meth === ""){
      ls_event.meth_stat = "Error";
      ls_event.meth_text = "Method Name dose not exits.";
      l_erflag = true;  //오류 flag 매핑.
    }

    //이벤트 메소드 description을 입력하지 않은경우.
    if(ls_event.desc === ""){
      ls_event.desc_stat = "Error";
      ls_event.desc_text = "Description dose not exists.";
      l_erflag = true;  //오류 flag 매핑.
    }


    var l_event = ls_event.meth;

    //이벤트메소드명 앞에 이벤트명 prefix가 없는경우.
    if(l_event.substr(0,3) !== "EV_"){
      //이벤트명 prefix 추가.
      l_event = "EV_" + l_event;
    }
    
    //서버 이벤트 항목 검색.
    var lt_ddlb = oAPP.fn.getServerEventList();

    //이벤트 중복건 존재 여부 확인.
    if(lt_ddlb.findIndex( a => a.KEY === l_event) !== -1){

      ls_event.meth_stat = "Error";
      ls_event.meth_text = "Method name is duplicated.";
      l_erflag = true;  //오류 flag 매핑.

    }

    //메소드명에 특수문자가 입력된 경우.
    var reg = /[^\w]/;
    if(reg.test(ls_event.meth) === true){
      ls_event.meth_stat = "Error";
      ls_event.meth_text = "Special characters are not allowed.";
      l_erflag = true;  //오류 flag 매핑.
    }

    //오류건이 존재하는 경우.
    if(l_erflag === true){
      oModel.setProperty("/event", ls_event);
      parent.showMessage(sap, 20, "E", "Check valid value.");
      return l_erflag;
    }

  } //입력값 점검.



  //cts 선택 팝업 호출.
  function lf_callCtsPopup(){

    //CTS 팝업 호출.
    oAPP.fn.fnCtsPopupOpener(function(param){

      //이벤트 메소드 생성 처리.
      lf_createEventMethod(param.TRKORR);

    });


  }


  //서버이벤트 생성 처리.
  function lf_createEventMethod(REQNO){

    // //wait on 처리.
    // parent.setBusy("X");
    
    //busy dialog open.
    oAPP.common.fnSetBusyDialog(true);


    //화면에서 입력한 값 얻기.
    var ls_event = oModel.getProperty("/event");

    var l_event = ls_event.meth.toUpperCase();

    //이벤트메소드명 앞에 이벤트명 prefix가 없는경우.
    if(l_event.substr(0,3) !== "EV_"){
      //이벤트명 prefix 추가.
      l_event = "EV_" + l_event;
    }

    //클래스명 서버 전송 데이터에 구성.
    var oFormData = new FormData();
    oFormData.append("CLSNM", oAPP.attr.appInfo.CLSID);

    //package 정보 매핑.
    oFormData.append("PACKG", oAPP.attr.appInfo.PACKG);

    var l_REQNO = oAPP.attr.appInfo.REQNO;
    if(REQNO){
      l_REQNO = REQNO;
    }

    //request No 정보 매핑.
    oFormData.append("REQNO", l_REQNO);

    //메소드명.
    oFormData.append("METH", l_event);

    //메소드 description.
    oFormData.append("DESC", ls_event.desc);


    //서버 생성 처리.
    sendAjax(oAPP.attr.servNm + "/createEventMethod", oFormData, function(param){

      // //wait off 처리.
      // parent.setBusy("");
      
      //busy dialog close.
      oAPP.common.fnSetBusyDialog(false);

      //오류가 발생한 경우, eval 처리 script가 존재하지 않는경우.
      if(param.RETCD === "E" && typeof param.SCRIPT === "undefined"){
        ls_event.meth_stat = "Error";
        ls_event.meth_text = param.RTMSG;
        oModel.setProperty("/event", ls_event);
        return;
      }

      //오류가 발생한 경우, eval 처리 script가 존재하는경우.
      if(param.RETCD === "E" && typeof param.SCRIPT !== "undefined"){
        eval(param.SCRIPT);
        return;
      }

      //서버이벤트 DDLB 항목에 생성한 이벤트 메소드 정보 추가.
      //oAPP.attr.T_EVT.push({KEY:param.METHOD, TEXT:param.METHOD, DESC:ls_event.desc});

      if(typeof param.MLIST !== "undefined" && param.MLIST.length !== 0){
        
        //기존 서버 이벤트가 존재하는경우.
        if(oAPP.attr.T_EVT.length !== 0){

          //기존 서버이벤트에서 삭제된 서버 이벤트가 존재하는지 여부 확인.
          for(var i=oAPP.attr.T_EVT.length-1; i>=0; i--){

            //빈값인경우 skip.
            if(oAPP.attr.T_EVT[i].KEY === ""){continue;}

            //서버에서 전달받은 서버이벤트 항목에 현재 수집한 이벤트가 존재하지 않는경우.
            if(param.MLIST.findIndex( a=> a.EVTNM === oAPP.attr.T_EVT[i].KEY ) === -1){
              //해당 라인 삭제 처리.
              oAPP.attr.T_EVT.splice(i, 1);
            }           

          }

        }
        
        //서버에서 구성한 이벤트 항목에서 수집되지 않은 이벤트 수집처리.
        for(var i=0, l=param.MLIST.length; i<l; i++){
          //기존 수집한 서버이벤트 없는 이벤트 항목인경우.
          if(oAPP.attr.T_EVT.findIndex( a=> a.KEY === param.MLIST[i].EVTNM ) === -1){

            //해당 항목 수집 처리.
            var l_ddlb = {};
            l_ddlb.KEY = param.MLIST[i].EVTNM;
            l_ddlb.TEXT = param.MLIST[i].EVTNM;
            l_ddlb.DESC = param.MLIST[i].DESC;
            oAPP.attr.T_EVT.push(l_ddlb);
            l_ddlb = {};
          }
          
        }

      }

      //CALLBACK function 호출.
      if(typeof f_callBack !== "undefined"){
        f_callBack(is_attr, param.METHOD);
      }

      //attribute 영역에서 호출된건이 아닌경우.
      if(!is_attr){
        //attribute영역 갱신 처리.
        oAPP.attr.oModel.refresh();
      }

      //DIALOG 종료.
      lf_dialogClose(true);

      //메시지 처리.
      if(typeof param.RTMSG !== "undefined" && param.RTMSG !== ""){
        parent.showMessage(sap, 10, "S", param.RTMSG);
      }

      //RETURN 받은 CTS번호가 존재하는경우.
      if(typeof param.REQNO !== "undefined" && param.REQNO !== ""){
        //해당 CTS 번호 매핑 처리.
        oAPP.attr.appInfo.REQNR = param.REQNO;
        oAPP.attr.appInfo.REQNO = param.REQNO;
      }


    },"");

  } //서버이벤트 생성 처리.



  //서버 이벤트 ddlb 항목을 구성하지 않은경우.
  if(!oAPP.attr.T_EVT){
    //서버 이벤트 ddlb 구성.
    oAPP.fn.getServerEventList();
  }

  //이벤트 메소드 생성 dialog UI.
  var oDlg = new sap.m.Dialog({
    draggable:true,
    icon:"sap-icon://add-document",
    contentWidth:"30%"
  });

  var oTool = new sap.m.Toolbar();
  oDlg.setCustomHeader(oTool);
  
  var oTitle = new sap.m.Title({text:"Server Event Create"});

  oTool.addContent(oTitle);

  oTool.addContent(new sap.m.ToolbarSpacer());

  //우상단 닫기버튼.
  var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
  oTool.addContent(oBtn0);

  //닫기 버튼 선택 이벤트.
  oBtn0.attachPress(function(){
    
    lf_dialogClose();
    

  });

  var oModel = new sap.ui.model.json.JSONModel();
  oDlg.setModel(oModel);

  sap.ui.getCore().loadLibrary("sap.ui.table");
  sap.ui.getCore().loadLibrary("sap.ui.layout");

  var oForm = new sap.ui.layout.form.Form({
    editable:true,
    layout: new sap.ui.layout.form.ResponsiveGridLayout()
  });
  oDlg.addContent(oForm);

  var oFmCont = new sap.ui.layout.form.FormContainer();
  oForm.addFormContainer(oFmCont);

  var oFmElem1 = new sap.ui.layout.form.FormElement({
    label : new sap.m.Label({design:"Bold",text:"Method Name",required:true})
  });
  oFmCont.addFormElement(oFmElem1);

  //Method Name 입력필드.
  var oFmInp1 = new sap.m.Input({
    value:"{/event/meth}",
    valueState:"{/event/meth_stat}",
    valueStateText:"{/event/meth_text}",
    maxLength:27
  });
  oFmElem1.addField(oFmInp1);

  //Method Name 입력필드 엔터 이벤트
  oFmInp1.attachSubmit(function(){
    //desc로 포커스 처리.
    oFmInp2.focus();
  });


  var oFmElem2 = new sap.ui.layout.form.FormElement({
    label : new sap.m.Label({design:"Bold",text:"Description",required:true})
  });
  oFmCont.addFormElement(oFmElem2);

  //method desc 입력필드.
  var oFmInp2 = new sap.m.Input({
    value:"{/event/desc}",
    valueState:"{/event/desc_stat}",
    valueStateText:"{/event/desc_text}",
    maxLength:40
  });
  oFmElem2.addField(oFmInp2);


  //Method desc 입력필드 엔터 이벤트
  oFmInp2.attachSubmit(function(){
    //생성 버튼으로 focus 처리.
    oBtn1.focus();
  });

  //이벤트 생성 버튼.
  var oBtn1 = new sap.m.Button({type:"Accept",icon:"sap-icon://accept"});
  oDlg.addButton(oBtn1);

  //이벤트 생성 이벤트
  oBtn1.attachPress(function(){
    
    // //wait on 처리.
    // parent.setBusy("X");
    
    //busy dialog open.
    oAPP.common.fnSetBusyDialog(true);


    //입력값 점검 오류가 발생한 경우 exit.
    if(lf_chkInputVal() === true){
      // //wait off 처리.
      // parent.setBusy("");
      
      //busy dialog close.
      oAPP.common.fnSetBusyDialog(false);
      return;
    }

    //서버이벤트 생성 처리.
    lf_createEventMethod();

    
  }); //이벤트 생성 이벤트



  //팝업 종료 버튼.
  var oBtn2 = new sap.m.Button({type:"Reject",icon:"sap-icon://decline"});
  oDlg.addButton(oBtn2);

  //팝업 종료 이벤트.
  oBtn2.attachPress(function(){
    lf_dialogClose();
  });


  oModel.setData({"event":{"meth":"","desc":"",
    "meth_stat":"None","meth_text":"","desc_stat":"None","desc_text":""}});


  //dialog 호출시 이벤트.
  oDlg.attachAfterOpen(function(){
    //메소드명에 focus 처리.
    oFmInp1.focus();
  });
  

  //서버이벤트 생성 팝업 호출.
  oDlg.open();



};  // 이벤트 생성 팝업 호출.


