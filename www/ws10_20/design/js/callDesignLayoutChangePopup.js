(function(){

    //디자인 레이아웃 변경 팝업.
    oAPP.fn.callDesignLayoutChangePopup = function(){

        //디자인영역 레이아웃 dialog UI 생성.
        var oDlg = new sap.m.Dialog({draggable:true, verticalScrolling:false});

        //모델 생성.
        var oMdl = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oMdl);

        //팝업 호출전 이벤트 처리.
        oDlg.attachBeforeOpen(function(){
            //레이아웃 설정정보 얻기.
            lf_getLayout(oDlg, oMdl);

        });


        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);

        oTool.addContent(new sap.m.Title({text:"Change Layout"}));

        oTool.addContent(new sap.m.ToolbarSpacer());

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){        
            //팝업 종료 처리.
            lf_close(oDlg);

        });


        //tile D&D 가능처리.
        sap.m.GenericTile.getMetadata().dnd.draggable = true;
        sap.m.GenericTile.getMetadata().dnd.droppable = true;

        var oTile1 = new sap.m.GenericTile({header:"{NAME}", headerImage:"{IMAGE}", state:"Disabled"});
        oTile1.addStyleClass("sapUiTinyMargin");

        //drag UI 생성.
        var oDrag1 = new sap.ui.core.dnd.DragInfo();
        oTile1.addDragDropConfig(oDrag1);


        //drop UI 생성.
        var oDrop1 = new sap.ui.core.dnd.DropInfo();
        oTile1.addDragDropConfig(oDrop1);

        //drop 이벤트.
        oDrop1.attachDrop(function(oEvent){
            //drop 처리.
            lf_drop(oEvent, oDlg, oMdl);

        });

        
        //tile 바인딩 처리.
        oDlg.bindAggregation("content",{path:"/T_LAYOUT", template:oTile1});



        //초기화 버튼.
        var oBtn1 = new sap.m.Button({text:"Default", icon:"sap-icon://reset", type:"Emphasized",tooltip:"Default"});
        oDlg.addButton(oBtn1);


        //초기화 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //초기화 처리.
            var lt_layout = [{NAME:"designTree", IMAGE:"sap-icon://text-align-right", POSIT:0, UIID:"oDesignTree", SID:"designTree"},
                            {NAME:"Preview", IMAGE:"sap-icon://header", POSIT:1, UIID:"oDesignPreview", SID:"designPreview"},
                            {NAME:"Attribute", IMAGE:"sap-icon://customize", POSIT:2, UIID:"oDesignAttr", SID:"designAttr"}];
                
            //layout 데이터 바인딩.
            oMdl.setData({T_LAYOUT:lt_layout});

        });


        //저장버튼.
        var oBtn2 = new sap.m.Button({text:"Save", icon:"sap-icon://save", type:"Accept",tooltip:"Save"});
        oDlg.addButton(oBtn2);

        //저장버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            //저장 처리.
            lf_save(oDlg, oMdl);            
        });


        //팝업 종료 버튼.
        var oBtn3 = new sap.m.Button({text:"Close", type:"Reject",icon:"sap-icon://decline", tooltip:"Close"});
        oDlg.addButton(oBtn3);

        //팝업 종료버튼 선택 이벤트.
        oBtn3.attachPress(function(){
            //팝업 종료처리.
            lf_close(oDlg);
        });


        //팝업 호출.
        oDlg.open();


    };  //디자인 레이아웃 변경 팝업.




    //팝업 종료 처리.
    function lf_close(oDlg, bSkip){
        //팝업 종료 처리.
        oDlg.close();

        if(bSkip){return;}

        //001	Cancel operation
        parent.showMessage(sap,10, "I", "Cancel operation");

    }   //팝업 종료 처리.




    //저장 처리.
    function lf_save(oDlg, oMdl){

        //010	Do you want to save it?

        //저장전 확인 팝업 호출.
        parent.showMessage(sap, 30, "I", "Do you want to save it?", function(param){

            if(param !== "YES"){return;}

            //화면 잠금 처리.
            oAPP.fn.designAreaLockUnlock(true);

            //POSITION 으로 정렬처리.
            oMdl.oData.T_LAYOUT.sort(function(a,b){
                return a.POSIT - b.POSIT;
            });

            var oSplit = sap.ui.getCore().byId("designSplit");

            //모든 영역 제거 처리.
            oSplit.removeAllContentAreas();

            //첫번째 영역 붙이기.
            setTimeout(function(){oSplit.addContentArea(oAPP.attr.ui[oMdl.oData.T_LAYOUT[0].UIID]);}, 0);

            //두번째 영역 붙이기.
            setTimeout(function(){oSplit.addContentArea(oAPP.attr.ui[oMdl.oData.T_LAYOUT[1].UIID]);}, 0);

            //세번째 영역 붙이기.
            setTimeout(function(){oSplit.addContentArea(oAPP.attr.ui[oMdl.oData.T_LAYOUT[2].UIID]);}, 0);

            //팝업 종료 처리.
            lf_close(oDlg, true);

            //구성한 design layout 정보 저장 처리.
            parent.setP13nData("designLayout", oMdl.oData.T_LAYOUT);

        }); //저장전 확인 팝업 호출.
        


    }   //저장 처리.



    //drop 처리.
    function lf_drop(oEvent, oDlg, oMdl){

        //drag tile 정보 얻기.
        var l_tile = oEvent.mParameters.dragSession.getDragControl();
        if(!l_tile){return;}

        //drag tile의 context정보 얻기.
        var l_drag_ctxt = l_tile.getBindingContext();

        //drag tile이 몇번째 UI 인지 확인.
        var l_drag_index = oDlg.indexOfContent(l_tile);

        //drop context 정보 얻기.
        var l_drop_ctxt = oEvent.mParameters.droppedControl.getBindingContext();

        //drop tile이 몇번째 UI인지 확인.
        var l_drop_index = oDlg.indexOfContent(oEvent.mParameters.droppedControl);

        //drag 바인딩의 position 정보 업데이트
        oMdl.setProperty("POSIT", l_drop_index, l_drag_ctxt);

        //drop 바인딩의 position 정보 업데이트
        oMdl.setProperty("POSIT", l_drag_index, l_drop_ctxt);

        
        //순서 재정렬 처리.
        lf_sort(oDlg);


    }   //drop 처리.




    //레이아웃 설정정보 얻기.
    function lf_getLayout(oDlg, oMdl){
        
        //이전 저장한 레이아웃정보 얻기.
        var lt_layout = parent.getP13nData("designLayout");


        //이전에 저장한 정보가 없다면 default로 세팅.
        if(!lt_layout){
            lt_layout = [{NAME:"designTree", IMAGE:"sap-icon://text-align-right", POSIT:0, UIID:"oDesignTree", SID:"designTree"},
                        {NAME:"Preview", IMAGE:"sap-icon://header", POSIT:1, UIID:"oDesignPreview", SID:"designPreview"},
                        {NAME:"Attribute", IMAGE:"sap-icon://customize", POSIT:2, UIID:"oDesignAttr", SID:"designAttr"}];
        }
        
        //layout 데이터 바인딩.
        oMdl.setData({T_LAYOUT:lt_layout});

        //순서 정렬 처리.
        lf_sort(oDlg);


    }   //레이아웃 설정정보 얻기.




    //layout 순서 정렬 처리.
    function lf_sort(oDlg){
        //popup의 바인딩 정보 얻기.
        var l_bind = oDlg.getBinding("content");
        if(!l_bind){return;}

        //position 기준으로 정렬 처리.
        l_bind.sort(new sap.ui.model.Sorter("POSIT",false));

    }   //layout 순서 정렬 처리.

})();