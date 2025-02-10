(function(){

    //UI where use 팝업.
    oAPP.fn.callUiWhereUsePopup = function(is_tree){

        var oDlg = new sap.m.Dialog({draggable: true, resizable: true, busyIndicatorDelay:0,
            verticalScrolling:false, contentWidth:"60%", contentHeight:"60%", busy:"{/busy}"});

        oDlg.attachAfterOpen(function(){
            //대상 ui 사용처 리스트 검색.
            lf_getWhereUseList(oDlg, oModel, is_tree);

        });

        //dialog 종료 이후 이벤트.
        oDlg.attachAfterClose(function(){
            //dialog destroy 처리.
            oDlg.destroy();
        });

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        var oTool = new sap.m.Toolbar({busyIndicatorDelay:1, busy:"{/busy}"});
        oDlg.setCustomHeader(oTool);

        //A89	UI Where use list
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A89", "", "", "", "") + " - " + is_tree.UILIB;
        
        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);
    
        oTool.addContent(new sap.m.ToolbarSpacer());
        
        //A39	Close
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", busyIndicatorDelay:1, busy:"{/busyButton}",
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //dialog 닫기 처리.
            lf_close(oDlg);
    
        });


        //결과리스트 테이블.
        var oTab = new sap.ui.table.Table({visibleRowCountMode:"Auto", alternateRowColors: true,
            selectionMode:"None"});
        oDlg.addContent(oTab);

        //A90	Web Application ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A90", "", "", "", "");

        var oCol1 = new sap.ui.table.Column({sortProperty:"APPID", filterProperty:"APPID", 
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oTab.addColumn(oCol1);

        var oTxt1 = new sap.m.Text({text:"{APPID}", tooltip:"{APPID}"});
        oCol1.setTemplate(oTxt1);


        //A91	APP Description
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A91", "", "", "", "");

        var oCol2 = new sap.ui.table.Column({sortProperty:"APPNM", filterProperty:"APPNM", 
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oTab.addColumn(oCol2);

        var oTxt2 = new sap.m.Text({text:"{APPNM}", tooltip:"{APPNM}"});
        oCol2.setTemplate(oTxt2);


        //A92	Assigned Class Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A92", "", "", "", "");

        var oCol3 = new sap.ui.table.Column({sortProperty:"CLSID", filterProperty:"CLSID", 
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oTab.addColumn(oCol3);

        var oTxt3 = new sap.m.Text({text:"{CLSID}", tooltip:"{CLSID}"});
        oCol3.setTemplate(oTxt3);


        oTab.bindAggregation("rows", {path:"/T_DATA", template: new sap.ui.table.Row()});

        //dialog open.
        oDlg.open();



    };  //UI where use 팝업.


    //대상 ui 사용처 리스트 검색.
    function lf_getWhereUseList(oDlg, oModel, is_tree){
        
        //busy on.
        oModel.setData({busy:true, busyButton: true});

        
        //클래스명 서버 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("APPID", oAPP.attr.appInfo.APPID);

        oFormData.append("UIFND", is_tree.UIFND);

        //사용처 리스트 검색.
        sendAjax(oAPP.attr.servNm + "/uiWhereUseList", oFormData, function(param){

            //사용처 리스트 검색에 오류가 발생한 경우.
            if(param.RETCD === "E"){
                //오류 메시지 출력.
                parent.showMessage(sap, 10, "E", param.RTMSG);
            }

            //결과정보 바인딩.
            oModel.setData({T_DATA:param.T_DATA, busy:false , busyButton: false},true);
                        
            oAPP.fn.setShortcutLock(false);
            
            parent.setBusy("");


        },""); //사용처 리스트 검색.

    }   //대상 ui 사용처 리스트 검색.



    //팝업 종료.
    function lf_close(oDlg){

        oDlg.close();
        //001	Cancel operation
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

    }   //팝업 종료.


})();