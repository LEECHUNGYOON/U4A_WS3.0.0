(function(){

    //application의 package 변경 팝업.
    oAPP.fn.changeAppPackagePopup = function(APPID){

        parent.setBusy("X");

        //라이브러리 로드.
        sap.ui.getCore().loadLibrary("sap.m");
        sap.ui.getCore().loadLibrary("sap.ui.layout");

        //application의 package 변경 dialog UI 생성.
        var oDlg = new sap.m.Dialog({draggable:true, resizable:true, contentWidth:"50%", busyIndicatorDelay:0, busy:true});

        //popup 열기전 이벤트.
        oDlg.attachBeforeOpen(function(){
            lf_getInitData(APPID, oDlg);
        });

        //model 설정.
        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        //popup toolbar UI 생성.
        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);

        //A93	Application Package Change
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A93", "", "", "", "");
        
        //popup title UI 생성.
        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        oTool.addContent(new sap.m.ToolbarSpacer());

        //A39	Close
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oTool.addContent(oBtn0);

        //닫기버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            lf_closePopup(oDlg);
        });

        //application의 package 변경 입력 form UI 생성.
        var oForm = new sap.ui.layout.form.Form({editable:true});
        oDlg.addContent(oForm);

        //form layout 설정.
        oForm.setLayout(new sap.ui.layout.form.ResponsiveGridLayout({adjustLabelSpan:false, labelSpanL:2, labelSpanM:3}));

        //form container UI 생성.
        var oCont = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oCont);

        //A90	Web Application ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90", "", "", "", "");

        //form element UI 생성.
        oElem1 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCont.addFormElement(oElem1);

        //application 명 출력 input UI 생성.
        var oInp1 = new sap.m.Input({value:"{/bind/APPID}", fieldWidth:"30%", editable:false, description:"{/bind/APPNM}"});
        oElem1.addField(oInp1);


        //A94	Current Package
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A94", "", "", "", "");

        //form element UI 생성.
        oElem2 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCont.addFormElement(oElem2);

        //현재 package명 출력 input UI 생성.
        var oInp2 = new sap.m.Input({value:"{/bind/PACKG}", fieldWidth:"30%", editable:false, description:"{/bind/OLDPN}"});
        oElem2.addField(oInp2);


        //A95	New Package
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A95", "", "", "", "");

        //form element UI 생성.
        oElem3 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", required:true, text:l_txt, tooltip:l_txt})});
        oCont.addFormElement(oElem3);

        //신규 package 명 입력 input UI 생성.
        var oInp3 = new sap.m.Input({showClearIcon : true, value:"{/bind/NEWPK}", showValueHelp:true, valueState:"{/bind/NEWPK_vs}",
            valueStateText:"{/bind/NEWPK_tx}", fieldWidth:"30%", description:"{/bind/NEWPN}"});
        oElem3.addField(oInp3);

        //신규 package 명 change 이벤트.
        oInp3.attachChange(function(){
            //입력값 대문자 변환처리.
            lf_setUpperCase(this);
        });

        //신규 package 명 f4 help 선택 이벤트.
        oInp3.attachValueHelpRequest(function(){
            //package f4 help 팝업 호출.
            lf_PackageF4help(oModel);

        }); //신규 package 명 f4 help 선택 이벤트.


        //A96	Change Request No.
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A96", "", "", "", "");

        //form element UI 생성.
        oElem4 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", required:true, text:l_txt, tooltip:l_txt})});
        oCont.addFormElement(oElem4);

        //change Request No. 출력 input UI 생성.
        var oInp4 = new sap.m.Input({value:"{/bind/CREQN}", showValueHelp:true, valueHelpOnly:true, valueState:"{/bind/CREQN_vs}",
            showClearIcon : true, valueStateText:"{/bind/CREQN_tx}", editable:"{/bind/edit01}", fieldWidth:"30%", description:"{/bind/REQTX}"});
        oElem4.addField(oInp4);

        //change Request No. change 이벤트.
        oInp4.attachChange(function(){
            //입력값 대문자 변환처리.
            lf_setUpperCase(this);
        });

        //change Request No. f4 help 선택 이벤트.
        oInp4.attachValueHelpRequest(function(){
            //Request No 팝업 호출.
            lf_RequestNoF4help(oModel);
        });


        //A97	Change Package
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A97", "", "", "", "");

        //package 변경 확인 버튼.
        var oBtn1 = new sap.m.Button({text:l_txt, tooltip:l_txt, icon:"sap-icon://journey-change", type:"Accept"});
        oDlg.addButton(oBtn1);

        //package 변경버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            lf_changePackage(oDlg);
        });


        //A39	Close
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

        //닫기버튼.
        var oBtn2 = new sap.m.Button({text:l_txt, tooltip:l_txt, icon:"sap-icon://decline", type:"Reject"});
        oDlg.addButton(oBtn2);

        //닫기버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            lf_closePopup(oDlg);
        });


        //popup 호출.
        oDlg.open();



    };  //application의 package 변경 팝업.




    //dialog 종료.
    function lf_closePopup(oUi){
        if(!oUi){return;}

        oUi.close();
        oUi.destroy();

    }   //dialog 종료.




    //초기 데이터 검색.
    function lf_getInitData(APPID, oUi){

        var oModel = oUi.getModel();

        //application명 서버전송 데이터 구성.
        var oFormData = new FormData();
        oFormData.append("APPID", APPID);

        oFormData.append("ACTCD", "INIT");

        //서버 호출 처리.
        sendAjax(parent.getServerPath() + "/package_change", oFormData, function(param){

            //오류가 발생한 경우.
            if(param.RETCD === "E"){

                //스크립트 처리건이 존재하는경우.
                if(typeof param.SCRIPT !== "undefined" && param.SCRIPT !== ""){
                    eval(param.SCRIPT);

                    //팝업 종료 처리.
                    lf_closePopup(oUi);
                    
                    parent.setBusy("");

                    oUi.setBusy(false);

                    return;
                }


                //서버로 부터 전달받은 메시지 번호가 존재하는경우.
                if(typeof param?.MSGNO !== "undefined"){

                    //메시지 출력 처리.
                    parent.showMessage(sap, 20, 'E',
                        parent.WSUTIL.getWsMsgClsTxt("", "ZMSG_WS_COMMON_001", param.MSGNO));

                    //팝업 종료 처리.
                    lf_closePopup(oUi);
                    
                    parent.setBusy("");

                    oUi.setBusy(false);

                    return;

                }

                //오류 메시지 출력.
                parent.showMessage(sap, 20, "E", param.RTMSG);

                //팝업 종료 처리.
                lf_closePopup(oUi);
                
                parent.setBusy("");

                oUi.setBusy(false);

                return;
            }

            var l_bind = {};

            l_bind.APPID = param.PRC_INFO.APPID;    //application ID
            l_bind.APPNM = param.PRC_INFO.APPNM;    //application Desc.
            l_bind.PACKG = param.PRC_INFO.PACKG;    //Current_Package
            l_bind.OLDPN = param.PRC_INFO.OLDPN;    //Current_Package Desc.
            l_bind.NEWPK = param.PRC_INFO.NEWPK;    //New Package
            l_bind.NEWPN = param.PRC_INFO.NEWPN;    //New Package Desc.
            l_bind.CREQN = param.PRC_INFO.CREQN;    //Change Request_No.
            l_bind.REQTX = param.PRC_INFO.REQTX;    //Change Request_No. Desc.

            l_bind.edit01 = true;   //Change Request_No. editable.

            //오류 표시 필드 초기화.
            lf_resetErrorField(l_bind);

            if(param.PRC_INFO.REQNR !== "" && param.PRC_INFO.TRANF === ""){
                l_bind.edit01 = false;
            }

            //결과 바인딩 처리.
            oModel.setData({bind:l_bind, PRC_INFO:param.PRC_INFO});

            parent.setBusy("");

            oUi.setBusy(false);

        }); //서버 호출 처리.


    }   //초기 데이터 검색.




    //package 변경 처리.
    function lf_changePackage(oDlg){

        var oModel = oDlg.getModel();

        //바인딩 정보 얻기.
        var l_bind = oModel.getProperty("/bind");

        //입력값 점검.
        if(lf_chkValue(oModel, l_bind) === true){return;}

        //변경전 확인팝업 호출.
        //273	Package will be changed. Do you want to continue?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "273", "", "", "", ""), function(oEvent){

            //YES를 선택하지 않은경우 EXIT.
            if(oEvent !== "YES"){return;}

            parent.setBusy("X");

            //서버 전송 구조 정보 얻기.
            var l_PRC_INFO = oModel.getProperty("/PRC_INFO");

            //화면에서 입력한 정보 매핑.
            l_PRC_INFO.NEWPK = l_bind.NEWPK;    //New Package
            l_PRC_INFO.NEWPN = l_bind.NEWPN;    //New Package Desc.
            l_PRC_INFO.CREQN = l_bind.CREQN;    //Change Request_No.
            l_PRC_INFO.REQTX = l_bind.REQTX;    //Change Request_No. Desc.


            //application명 서버전송 데이터 구성.
            var oFormData = new FormData();

            oFormData.append("APPID", l_bind.APPID);

            oFormData.append("ACTCD", "CHNG_PACK");

            oFormData.append("PRC_INFO", JSON.stringify(l_PRC_INFO));

            //서버 호출 처리.
            sendAjax(parent.getServerPath() + "/package_change", oFormData, function(param){

                if(param.RETCD === "E" && (typeof param.SCRIPT !== "undefined" && param.SCRIPT !== "")){
                    eval(param.SCRIPT);

                    parent.setBusy("");

                    return;
                }

                //오류가 발생한 경우.
                if(param.RETCD === "E"){
                    //오류 메시지 출력.
                    parent.showMessage(sap, 20, "E", param.RTMSG);

                    parent.setBusy("");

                    return;
                }

                //성공시 메시지 처리.
                oAPP.common.fnShowFloatingFooterMsg("S", "WS10", param.RTMSG);

                //팝업 종료 처리.
                lf_closePopup(oDlg);

                parent.setBusy("");


            }); //서버 호출 처리.

        }); //변경전 확인팝업 호출.


    }   //package 변경 처리.




    //입력값 점검 처리.
    function lf_chkValue(oModel, i_bind){

        var l_err = false;

        //오류 표시 필드 초기화.
        lf_resetErrorField(i_bind);

        //신규 PACKAGE를 입력하지 않은경우.
        if(i_bind.NEWPK === ""){
            //오류 발생 flag 처리.
            l_err = true;

            //package 미입력 오류 표시.
            i_bind.NEWPK_vs = "Error";

            //A22	Package
            //050	& is required.
            i_bind.NEWPK_tx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "050", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A22", "", "", "", ""), "", "", "");
        }

        //local package를 입력한경우.
        if(i_bind.NEWPK === "$TMP"){
            //오류 발생 flag 처리.
            l_err = true;

            //package 미입력 오류 표시.
            i_bind.NEWPK_vs = "Error";

            //229	Local package cannot be entered.            
            i_bind.NEWPK_tx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "229", "", "", "", "");
        }

        //이전 package와 동일한 package를 입력한 경우.
        if(i_bind.NEWPK === i_bind.PACKG){
            //오류 발생 flag 처리.
            l_err = true;

            //package 미입력 오류 표시.
            i_bind.NEWPK_vs = "Error";
            
            //295	Entered the same package as the previous package.
            i_bind.NEWPK_tx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "295", "", "", "", "");
        }

        //Change request No.를 입력하지 않은경우.
        if(i_bind.CREQN === ""){
            //오류 발생 flag 처리.
            l_err = true;

            //Change request No. 미입력 오류 표시.
            i_bind.CREQN_vs = "Error";
            
            //A96	Change Request No.
            //050	& is required.
            i_bind.CREQN_tx = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "050", oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A96", "", "", "", ""), "", "", "");

        }


        //오류건이 존재하는경우.
        if(l_err === true){
            //오류 결과 바인딩.
            oModel.setProperty("/bind", i_bind);
        }

        //오류 여부 flag return.
        return l_err;

    }   //입력값 점검 처리.




    //입력값 대문자 변환 처리.
    function lf_setUpperCase(oUi){
        if(!oUi){return;}

        var l_val = oUi.getValue();

        l_val = l_val.toUpperCase();

        oUi.setValue(l_val);

    }   //입력값 대문자 변환 처리.




    //오류 표현 필드 초기화.
    function lf_resetErrorField(i_bind){
        //New Package 오류 표시 필드 초기화.
        i_bind.NEWPK_vs = undefined;
        i_bind.NEWPK_tx = "";

        //Change Request_No. 오류 표시 필드 초기화.
        i_bind.CREQN_vs = undefined;
        i_bind.CREQN_tx = "";

    }   //오류 표현 필드 초기화.




    //Request No 팝업 호출.
    function lf_RequestNoF4help(oModel){

        //Request No 팝업 호출.
        oAPP.fn.fnCtsPopupOpener(function(param){
          
            //return받은 Request No 반영.
            oModel.setProperty("/bind/CREQN", param.TRKORR);

            //return받은 Request Desc 반영.
            oModel.setProperty("/bind/REQTX", param.AS4TEXT);

        });


    }   //Request No 팝업 호출.




    //package f4 help 팝업 호출.
    function lf_PackageF4help(oModel){

        //callback function.
        function lf_callback(param){

            //package 명.
            oModel.setProperty("/bind/NEWPK", param.DEVCLASS);

            //package Desc.
            oModel.setProperty("/bind/NEWPN", param.CTEXT);

        }
        
        //f4 help팝업을 load한경우.
        if(typeof oAPP.fn.callF4HelpPopup !== "undefined"){
            //f4 help 팝업 호출.
            oAPP.fn.callF4HelpPopup("DEVCLASS", "DEVCLASS", [], [], lf_callback);
            //하위 로직 skip처리를 위한 flag return.
            return true;
        }
       

        //f4help 팝업을 load하지 못한경우.
        lf_getScript("design/js/callF4HelpPopup",function(){
            //f4 help 팝업 function load 이후 팝업 호출.
            oAPP.fn.callF4HelpPopup("DEVCLASS", "DEVCLASS", [], [], lf_callback);
        });


    }   //package f4 help 팝업 호출.




    //js 파일 load
    function lf_getScript(fname, callbackFunc, bSync){
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
  
    }  //js 파일 load

})();