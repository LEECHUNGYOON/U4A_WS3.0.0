(function(){

    //동적 리스트 팝업.
    oAPP.fn.callDynListPopup = function(sName, f_callBack){

        var oDlg = new sap.m.Dialog({draggable: true,resizable: true, busyIndicatorDelay:1,
            verticalScrolling:false, contentWidth:"60%", contentHeight:"60%"});

        oDlg.attachBeforeOpen(function(){
            //동적 테이블 구성.
            lf_getDynList(oDlg, oTab, oModel, sName);

        });

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);
        
        var oTitle = new sap.m.Title({text:"UI Where use list - " + is_tree.UILIB});
    
        oTool.addContent(oTitle);
    
        oTool.addContent(new sap.m.ToolbarSpacer());
    
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip:"Close"});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //dialog 닫기 처리.
            lf_close(oDlg);
    
        });

        var oHbox1 = new sap.m.HBox({height:"100%", direction:"Column", renderType:"Bare"});
        oDlg.addContent(oHbox1);

        var oTab = new sap.ui.table.Table();
        oHbox1.addItem(oTab);

        //table 더블클릭 이벤트.
        oTab.attachBrowserEvent("dblclick", lf_tabDblClick);


        //팝업 호출.
        oDlg.open();
        


    };  //동적 리스트 팝업.




    //dialog 종료.
    function lf_close(oDlg){

        oDlg.close();

        //001	Cancel operation
        parent.showMessage(sap, 10, "I", "Cancel operation");

    }   //dialog 종료.




    //동적 테이블 구성 정보 검색.
    function lf_getDynList(oDlg, oTab, oModel, sName){

        //busy dialog open.
        oAPP.common.fnSetBusyDialog(true);

        //동적 테이블 구성 구분자 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("DYNNAM", sName);

        //동적 테이블 구성 정보 검색.
        sendAjax(oAPP.attr.servNm + "/getDynList", oFormData, function(param){

            //busy dialog close.
            oAPP.common.fnSetBusyDialog(false);

            //테이블 구성정보를 얻지 못한 경우.
            if(param.RETCD === "E"){
                //오류 메시지 출력.
                parent.showMessage(sap, 10, "E", param.RTMSG);
                return;
            }

            //동적 table 구성.
            lf_setDynList(oTab, oModel, param);



        },"");  //동적 테이블 구성 정보 검색.



    }   //동적 테이블 구성 정보 검색.




    //동적 table 구성.
    function lf_setDynList(oTab, oModel, param){



    }   //동적 table 구성.




    //table 더블클릭 이벤트.
    function lf_tabDblClick(oEvent){

        //callback function이 존재하지 않는경우 exit.
        if(typeof f_callBack === "undefined"){return;}

        //이벤트 발생 UI 정보 얻기.
        var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target,sap.ui.getCore());
    
        //UI정보를 얻지 못한 경우 exit.
        if(!l_ui){return;}

        //바인딩정보 얻기.
        var l_ctxt = l_ui.getBindingContext();

        //바인딩 정보를 얻지 못한 경우 exit.
        if(!l_ctxt){return;}

        //선택 처리건에 대한 return.
        f_callBack(l_ctxt.getProperty());

    }   //table 더블클릭 이벤트.



})();