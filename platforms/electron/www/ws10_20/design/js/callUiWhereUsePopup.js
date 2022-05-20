(function(){

    //UI where use 팝업.
    oAPP.fn.callUiWhereUsePopup = function(is_tree){

        var oDlg = new sap.m.Dialog({draggable: true,resizable: true, busyIndicatorDelay:1,
            verticalScrolling:false, contentWidth:"60%", contentHeight:"60%",busy:"{/busy}"});

        oDlg.attachBeforeOpen(function(){
            //대상 ui 사용처 리스트 검색.
            lf_getWhereUseList(oDlg, oModel, is_tree);

        });

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        var oTool = new sap.m.Toolbar({busyIndicatorDelay:1, busy:"{/busy}"});
        oDlg.setCustomHeader(oTool);
        
        var oTitle = new sap.m.Title({text:"UI Where use list - " + is_tree.UILIB});
    
        oTool.addContent(oTitle);
    
        oTool.addContent(new sap.m.ToolbarSpacer());
    
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
            busyIndicatorDelay:1});
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

        var oCol1 = new sap.ui.table.Column({sortProperty:"APPID", filterProperty:"APPID", 
            label: new sap.m.Label({design:"Bold", text:"Web Application ID"})});
        oTab.addColumn(oCol1);

        var oTxt1 = new sap.m.Text({text:"{APPID}"});
        oCol1.setTemplate(oTxt1);

        var oCol2 = new sap.ui.table.Column({sortProperty:"APPNM", filterProperty:"APPNM", 
            label: new sap.m.Label({design:"Bold", text:"Web Application Name"})});
        oTab.addColumn(oCol2);

        var oTxt2 = new sap.m.Text({text:"{APPNM}"});
        oCol2.setTemplate(oTxt2);

        var oCol3 = new sap.ui.table.Column({sortProperty:"CLSID", filterProperty:"CLSID", 
            label: new sap.m.Label({design:"Bold", text:"Assigned Class Object ID"})});
        oTab.addColumn(oCol3);

        var oTxt3 = new sap.m.Text({text:"{CLSID}"});
        oCol3.setTemplate(oTxt3);


        oTab.bindAggregation("rows",{path:"/T_DATA", template: new sap.ui.table.Row()});

        //dialog open.
        oDlg.open();



    };  //UI where use 팝업.


    //대상 ui 사용처 리스트 검색.
    function lf_getWhereUseList(oDlg, oModel, is_tree){

        //busy on.
        oModel.setData({busy:true});

        //busy dialog open.
        oAPP.common.fnSetBusyDialog(true);
        
        //클래스명 서버 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("APPID", oAPP.attr.appInfo.APPID);

        oFormData.append("UIFND", is_tree.UIFND);

        //사용처 리스트 검색.
        sendAjax(oAPP.attr.servNm + "/uiWhereUseList", oFormData, function(param){

            //busy off.
            oModel.setData({busy:false});

            //busy dialog close.
            oAPP.common.fnSetBusyDialog(false);

            //사용처 리스트 검색에 오류가 발생한 경우.
            if(param.RETCD === "E"){
                //오류 메시지 출력.
                parent.showMessage(sap, 10, "E", param.RTMSG);
            }

            //결과정보 바인딩.
            oModel.setData({T_DATA:param.T_DATA},true);

        },""); //사용처 리스트 검색.

    }   //대상 ui 사용처 리스트 검색.



    //팝업 종료.
    function lf_close(oDlg){

        oDlg.close();
        //001	Cancel operation
        parent.showMessage(sap,10, "I", "Cancel operation");

    }   //팝업 종료.


})();