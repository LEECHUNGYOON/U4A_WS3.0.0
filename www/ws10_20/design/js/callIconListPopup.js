(function(){

    //아이콘 리스트 팝업.
    oAPP.fn.callIconListPopup = function(UIATT, retfunc){

        //아이콘 리스트 정보 얻기.
        var lt_icon = oAPP.attr.ui.frame.contentWindow.getIconList();

        //아이콘 리스트가 존재하지 않는경우 exit.
        if(typeof lt_icon === "undefined" || lt_icon.length === 0){return;}

        //메뉴 잠금 처리.

        //icon popup UI 생성.
        var oDlg = new sap.m.Dialog({resizable:true, draggable:true,
          contentWidth:"500px", contentHeight:"40%", horizontalScrolling:false});

        var oTool0 = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool0);
        
        var oTitle = new sap.m.Title({text:"UI5 Icon List - " + UIATT});
    
        oTool0.addContent(oTitle);
    
        oTool0.addContent(new sap.m.ToolbarSpacer());
    
        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
        oTool0.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
        
            oDlg.close();
            //001	Cancel operation
            parent.showMessage(sap,10, "I", "Cancel operation");
    
        });

        //dialog open전 icon list 구성.
        oDlg.attachBeforeOpen(function(){

            var lt_list = [], ls_list = {};
            
            //icon 정보를 기준으로 model data 구성.
            for(var i=0, l=lt_icon.length; i<l; i++){

                ls_list.nam = lt_icon[i];
                ls_list.src = "sap-icon://" + lt_icon[i];
                lt_list.push(ls_list);
                ls_list = {};

            }

            //model에 icon리스트 정보 세팅.
            oModel.setData({"T_ICON":lt_list});

        }); //dialog open전 icon list 구성.


        //model 정보.
        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);


        //icon List UI 생성.
        var oTab = new sap.m.Table({growing:true, growingScrollToLoad:true, alternateRowColors:true,sticky:["HeaderToolbar"]});
        oDlg.addContent(oTab);

        //아이콘 선택(더블클릭) 이벤트.
        oTab.attachBrowserEvent("dblclick",function(oEvent){

            //callback function이 존재하지 않는경우 exit.
            if(typeof retfunc === "undefined"){return;}

            //더블클릭한 dom으로부터 UI 검색.
            var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target,sap.ui.getCore());

            //UI를 찾지 못한 경우 exit.
            if(typeof l_ui === "undefined"){return;}

            //해당 ui의 바인딩 정보 얻기.
            var l_ctxt = l_ui.getBindingContext();

            //바인딩 정보를 얻지 못한 경우 exit.
            if(typeof l_ctxt === "undefined"){return;}

            //icon 정보 얻기.
            var ls_icon = l_ctxt.getProperty();

            //검색조건 필드 Suggest 저장 처리.
            oAPP.fn.saveUiSuggest("iconListSearch", ls_icon.nam, 20);

            //callback function에 선택한 icon명 전달.
            retfunc(ls_icon.src);

            //아이콘 팝업 종료 처리.
            oDlg.close();

            //메시지 처리.
            parent.showMessage(sap, 10, "I", ls_icon.src + " selected.");

            //메뉴 잠금 해제 처리.

        }); //아이콘 선택(더블클릭) 이벤트.



        //검색조건 toolbar영역.
        var oTool = new sap.m.Toolbar();
        oTab.setHeaderToolbar(oTool);

        //검색조건 필드.
        var oSearch = new sap.m.SearchField({placeholder:"Search Icon"});
        oTool.addContent(oSearch);

        //검색조건 필드 Suggest 등록 처리.
        oAPP.fn.setUiSuggest(oSearch, "iconListSearch");

        //검색 아이콘 선택 이벤트.
        oSearch.attachSearch(function(oEvent){
            //아이콘 검색 처리.
            lf_search(this, oTab);
            
        }); //검색 아이콘 선택 이벤트.


        //검색 이벤트.
        oSearch.attachLiveChange(function(){
            //아이콘 검색 처리.
            lf_search(this, oTab);

        }); //검색 이벤트.



        //List Item UI 생성.
        var oCItem = new sap.m.ColumnListItem({vAlign:"Middle"});
        oTab.bindAggregation("items",{path:"/T_ICON",template:oCItem});

        //icon 컬럼.
        var oCol1 = new sap.m.Column({width:"50px"});
        oTab.addColumn(oCol1);

        //icon명 컬럼.
        var oCol2 = new sap.m.Column();
        oTab.addColumn(oCol2);

        //copy 버튼 컬럼.
        var oCol3 = new sap.m.Column({width:"120px"});
        oTab.addColumn(oCol3);


        //icon.
        var oIcon = new sap.ui.core.Icon({size:"30px",src:"{src}"});
        oCItem.addCell(oIcon);

        //icon text.
        var oText = new sap.m.Text({text:"{src}"});
        oCItem.addCell(oText);

        //copy 버튼.
        var oCopy = new sap.m.Button({text:"Copy text", icon:"sap-icon://copy"});
        oCItem.addCell(oCopy);

        //copy 버튼 선택 이벤트.
        oCopy.attachPress(function(){

            //버튼선택 라인의 바인딩정보에 해당하는 값 얻기.
            var ls_icon = this.getBindingContext().getProperty();

            //icon src 복사 처리.
            parent.setClipBoardTextCopy(ls_icon.src);

            //메시지 처리.
            parent.showMessage(sap, 10, "I", ls_icon.src + " copied.");

        }); //copy 버튼 선택 이벤트.



        //닫기 버튼.
        var oClose = new sap.m.Button({text:"Close",icon:"sap-icon://decline",type:"Reject"});
        oDlg.addButton(oClose);

        //닫기버튼 이벤트.
        oClose.attachPress(function(){
            oDlg.close();
        });  //닫기버튼 이벤트.



        //icon list popup open.
        oDlg.open();


        //dialog open 이후 이벤트.
        oDlg.attachAfterOpen(function(){
            //검색조건에 focus 처리.
            oSearch.focus();

        });


    };  //아이콘 리스트 팝업.




    //아이콘 검색 처리.
    function lf_search(oSearch, oTab){

        //결과리스트 바인딩 정보 얻기.
        var l_bind = oTab.getBinding("items");

        //바인딩 정보를 얻지 못한 경우 exit.
        if(typeof l_bind === "undefined"){return;}

        //검색조건 입력값 얻기.
        var l_val = oSearch.getValue();

        //검색조건 값이 입력안된 경우 필터 해제 처리.
        if(l_val === ""){
            l_bind.filter();
            return;
        }            

        var lt_filter = [];

        lt_filter.push(new sap.ui.model.Filter({path:"nam",operator:"Contains",value1:l_val}));
        lt_filter.push(new sap.ui.model.Filter({path:"src",operator:"Contains",value1:l_val}));

        //model 필터 처리.
        l_bind.filter([new sap.ui.model.Filter(lt_filter,false)]);

    }   //아이콘 검색 처리.

})();