(function(){

    //A65	Design Tree
    const C_DESIGNTREE = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A65", "", "", "", "");

    //A66	Attribute
    const C_ATTRIBUTE = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A66", "", "", "", "");

    //A67	Preview
    const C_PREVIEW = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A67", "", "", "", "");

    //광역 모델 정보.
    let oModel;

    //광역 dialog UI정보.
    let oDialog;

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

        //A62	Change Layout
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A62", "", "", "", "");

        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        oTool.addContent(new sap.m.ToolbarSpacer());

        //A39	Close
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){

            //팝업 종료 처리.
            lf_close(oDlg);

        });


        //tile D&D 가능처리.
        sap.m.GenericTile.getMetadata().dnd.draggable = true;
        sap.m.GenericTile.getMetadata().dnd.droppable = true;

        var oTile1 = new sap.m.GenericTile({header:"{NAME}", headerImage:"{IMAGE}", state:"Disabled", tooltip:"{NAME}"});
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


        //A63	Default
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A63", "", "", "", "");

        //초기화 버튼.
        var oBtn1 = new sap.m.Button({text:l_txt, icon:"sap-icon://reset", type:"Emphasized", tooltip:l_txt});
        oDlg.addButton(oBtn1);


        //초기화 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //초기화 처리.
            var lt_layout = [{NAME:C_DESIGNTREE, IMAGE:"sap-icon://text-align-right", POSIT:0, UIID:"oDesignTree", SID:"designTree"},
                            {NAME:C_PREVIEW, IMAGE:"sap-icon://header", POSIT:1, UIID:"oDesignPreview", SID:"designPreview"},
                            {NAME:C_ATTRIBUTE, IMAGE:"sap-icon://customize", POSIT:2, UIID:"oDesignAttr", SID:"designAttr"}];
                
            //layout 데이터 바인딩.
            oMdl.setData({T_LAYOUT:lt_layout});

        }); //초기화 버튼 선택 이벤트.


        //A64	Save
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", "");

        //저장버튼.
        var oBtn2 = new sap.m.Button({text:l_txt, icon:"sap-icon://save", type:"Accept", tooltip:l_txt});
        oDlg.addButton(oBtn2);

        //저장버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            //저장 처리.
            lf_save(oDlg, oMdl);

        }); //저장버튼 선택 이벤트.


        //A39	Close
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

        //팝업 종료 버튼.
        var oBtn3 = new sap.m.Button({text:l_txt, type:"Reject",icon:"sap-icon://decline", tooltip:l_txt});
        oDlg.addButton(oBtn3);

        //팝업 종료버튼 선택 이벤트.
        oBtn3.attachPress(function(){

            //팝업 종료처리.
            lf_close(oDlg);

        }); //팝업 종료버튼 선택 이벤트.


        //팝업 호출.
        oDlg.open();


    };  //디자인 레이아웃 변경 팝업.




    //팝업 종료 처리.
    function lf_close(oDlg, bSkip){
        
        // //팝업 종료 처리.
        // oDlg.close();

        oDlg.destroy();

        if(bSkip){return;}

        //001	Cancel operation
        parent.showMessage(sap,10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

    }   //팝업 종료 처리.




    //저장버튼 선택 -> design영역의 page 삭제 이후 이벤트.
    function lf_after(){


        //삭제 이후 이벤트 제거 처리.
        sap.ui.getCore().detachEvent("UIUpdated", lf_after);

        //design layout 재정의 이후 이벤트 추가.
        sap.ui.getCore().attachEvent("UIUpdated", lf_frame);

        var oSplit = sap.ui.getCore().byId("designSplit");

        //구성한 정보를 기준으로 화면 구성 처리.
        for(var i=0, l=oModel.oData.T_LAYOUT.length; i<l; i++){
            oSplit.addContentArea(oAPP.attr.ui[oModel.oData.T_LAYOUT[i].UIID]);
        }

        //구성한 design layout 정보 저장 처리.
        parent.setP13nData("designLayout", oModel.oData.T_LAYOUT);

        //팝업 종료 처리.
        lf_close(oDialog, true);
        

    }   //저장버튼 선택 -> design영역의 page 삭제 이후 이벤트.




    //design layout 재정의 이후 이벤트
    function lf_frame(){

        //design layout 재정의 이후 이벤트 제거 처리.
        sap.ui.getCore().detachEvent("UIUpdated", lf_frame);

        //미리보기에서 사용되고 있는 UI정보 제거 처리.
        delete oAPP.attr.ui.prevRootPage;
        delete oAPP.attr.ui._page1;
        delete oAPP.attr.ui.prevPopupArea;
        delete oAPP.attr.ui._hbox1;
        delete oAPP.attr.ui.oMenu;
        oAPP.attr.popup = [];

        //미리보기 iframe 다리 load 처리.
        oAPP.fn.loadPreviewFrame(true);


    }   //design layout 재정의 이후 이벤트




    //저장 처리.
    function lf_save(oDlg, oMdl){

        //저장전 확인 팝업 호출.
        //010	Do you want to save it?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "010", "", "", "", ""), function(param){

            if(param !== "YES"){return;}

            parent.setBusy("X");

            //단축키 잠금 처리.
            oAPP.fn.setShortcutLock(true);

            //POSITION 으로 정렬처리.
            oMdl.oData.T_LAYOUT.sort(function(a,b){
                return a.POSIT - b.POSIT;
            });

            var oSplit = sap.ui.getCore().byId("designSplit");

            //UI 광역화.
            oModel = oMdl;
            oDialog = oDlg;

            //삭제 이후 이벤트 추가.
            sap.ui.getCore().attachEvent("UIUpdated", lf_after);

            //모든 영역 제거 처리.
            oSplit.removeAllContentAreas();

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
            lt_layout = [{NAME:C_DESIGNTREE, IMAGE:"sap-icon://text-align-right", POSIT:0, UIID:"oDesignTree", SID:"designTree"},
                        {NAME:C_PREVIEW, IMAGE:"sap-icon://header", POSIT:1, UIID:"oDesignPreview", SID:"designPreview"},
                        {NAME:C_ATTRIBUTE, IMAGE:"sap-icon://customize", POSIT:2, UIID:"oDesignAttr", SID:"designAttr"}];
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