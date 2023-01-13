(function(){
    
    /************************************************************************
   * 동적 리스트 팝업.
   * **********************************************************************
   * @param {string} sName - 서버에서 동적으로 호출할 perform 명.
   * @param {string} sTitle - 팝업 제목.
   * @param {array} it_param - 서버전송 추가 파라메터정보 [{NAME:"",VALUE:""}]
   * @param {function} f_callBack - 결과리스트 라인선택시 해당 
   *                                라인정보 받을 call back function
   ************************************************************************/
    oAPP.fn.callDynListPopup = function(sName, sTitle, it_param, f_callBack){

        var oDlg = new sap.m.Dialog({draggable: true, resizable: true, busyIndicatorDelay:1,
            verticalScrolling:false, contentWidth:"40%", contentHeight:"40%"});

        oDlg.attachBeforeOpen(function(){
            //동적 테이블 구성.
            lf_getDynLayout(oDlg, oTab, oModel, sName, it_param);

        });

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);
        
        
        var oTitle = new sap.m.Title();
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        if(typeof sTitle !== "undefined"){
            oTitle.setText(sTitle);
        }        
    
        oTool.addContent(new sap.m.ToolbarSpacer());
        
        //A39	Close
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //dialog 닫기 처리.
            oDlg.close();

            //001	Cancel operation
            parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));
    
        }); //닫기 버튼 선택 이벤트.


        var oHbox1 = new sap.m.HBox({height:"100%", direction:"Column", renderType:"Bare"});
        oDlg.addContent(oHbox1);

        //결과 테이블.
        var oTab = new sap.ui.table.Table({visibleRowCountMode:"Auto", selectionMode:"None",
            layoutData: new sap.m.FlexItemData({growFactor:1})});
        oHbox1.addItem(oTab);


        //table 더블클릭 이벤트.
        oTab.attachBrowserEvent("dblclick", function(oEvent){
            lf_tabDblClick(oEvent, oDlg, f_callBack);
        });

        oTab.bindAggregation("rows",{path:"/T_DATA", template: new sap.ui.table.Row()});


        //팝업 호출.
        oDlg.open();


    };  //동적 리스트 팝업.




    //동적 테이블 구성 정보 검색.
    function lf_getDynLayout(oDlg, oTab, oModel, sName, it_param){

        //busy dialog open.
        oAPP.common.fnSetBusyDialog(true);

        //동적 테이블 구성 구분자 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("DYNNAM", sName);

        //서버전송 추가 파라메터가 존재하는경우.
        if(it_param){
            for(var i=0, l=it_param.length; i<l; i++){
                oFormData.append(it_param[i].NAME, it_param[i].VALUE);
            }
        }

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



        }, "");  //동적 테이블 구성 정보 검색.



    }   //동적 테이블 구성 정보 검색.




    //동적 table 구성.
    function lf_setDynList(oTab, oModel, param){

        if(!param.T_LIST){return;}

        //입력 파라메터 기준으로 컬럼 생성.
        for(var i=0, l=param.T_LIST.length; i<l; i++){

            var l_fld = "{" + param.T_LIST[i].FIELD + "}";

            //컬럼 ui 생성 처리.
            var oCol = new sap.ui.table.Column({template:new sap.m.Text({text:l_fld})});
            oTab.addColumn(oCol);

            //컬럼 label 생성 처리.
            var oLab = new sap.m.Label();
            oLab.setText(param.T_LIST[i].TEXT);
            oCol.setLabel(oLab);

        }

        //table 리스트 바인딩 처리.
        oModel.setData({T_DATA:param.T_DATA});


    }   //동적 table 구성.




    //table 더블클릭 이벤트.
    function lf_tabDblClick(oEvent, oDlg, f_callBack){

        //callback function이 존재하지 않는경우 exit.
        if(typeof f_callBack === "undefined"){return;}

        //edit 상태가 아닌경우 exit.
        if(oAPP.attr.oModel.oData.IS_EDIT === false){return;}

        //이벤트 발생 UI 정보 얻기.
        var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());
    
        //UI정보를 얻지 못한 경우 exit.
        if(!l_ui){return;}

        //바인딩정보 얻기.
        var l_ctxt = l_ui.getBindingContext();

        //바인딩 정보를 얻지 못한 경우 exit.
        if(!l_ctxt){return;}

        //선택 처리건에 대한 return.
        f_callBack(l_ctxt.getProperty());

        //팝업 종료 처리.
        oDlg.close();

        //005	Job finished.
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));


    }   //table 더블클릭 이벤트.



})();