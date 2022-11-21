(function(){

    //검색조건, 검색결과 광역 구조.
	var gs_find = {T_TREE:[], position:0, keyword:"", equal:false, dirUp:false};

    //focus된 UI정보.
    var go_focusedUI;

    //검색된 UI 항목 표현 ENUM정보.
    const C_FOUND = "Indication03";

    //검색된 UI의 CURRENT LINE 표현 ENUM 정보.
    const C_CURRENT = "Indication07";

    //입력필드 SUGGESTION 갯수.
    const C_SUGGEST_CNT = 5;

    //검색방향 여부에 따른 검색 position 값 return.
    function lf_getDirectionPos(oUi){
        //default 아래로 검색.
        var l_dir = 1;

        //위로 검색 checkbox가 선택됐다면.
        if(oUi.getSelected() === true){
            //위로 검색.
            l_dir = -1;
        }

        return l_dir;

    }   //검색방향 여부에 따른 검색 position 값 return.



    //검색조건 갱신 여부 확인.
    function lf_isRefresh(oInput, oChk1){

        //이전 입력조건이 변경됐거나, equal 검색 체크박스 선택건이 변경됐다면.
        if(gs_find.keyword !== oInput.getValue() || gs_find.equal !== oChk1.getSelected()){

            //현재 입력 키워드 광역변수에 매핑.
            gs_find.keyword = oInput.getValue();

            //현재 euqal 체크박스 선택건 광역변수에 매핑.
            gs_find.equal = oChk1.getSelected();
            
            gs_find.T_TREE = [];
            gs_find.position = 0;

            //갱신 flag return.
            return true;
        }

        //갱신 처리 안함 flag return.
        return false;

    }   //검색조건 갱신 여부 확인.



    //좌측 design tree의 스크롤 변경 이벤트
    function lf_designTreeScrollEvent(){

        //포커스된 UI정보가 존재하지 않는경우 exit.
        if(!go_focusedUI){return;}

        go_focusedUI.focus();        

    }   //좌측 design tree의 스크롤 변경 이벤트




    //좌측 design tree의 row update 이벤트.
    function lf_designTreeRowsUpdated(){

        //현재 design tree의 row 정보 얻기.
        var lt_rows = oAPP.attr.ui.oLTree1.getRows();

        for(var i=0, l=lt_rows.length; i<l; i++){

            //find로 검색한 UI의 현재 선택됨 css 제거.
            lt_rows[i].removeStyleClass("cl_ws_find_marker");

            if(!lt_rows[i].mAggregations._settings){continue;}

            var l_highlight = lt_rows[i].mAggregations._settings.getHighlight();

            //검색되어 현재 focus 표현한 라인인경우 css 추가.
            if(l_highlight === C_CURRENT){
                lt_rows[i].addStyleClass("cl_ws_find_marker");
            }

        }

    }   //좌측 design tree의 row update 이벤트.




    //검색조건에 해당하는 OBJECT ID 수집.
    function lf_designCollectFindOBJID(){

        //검색조건에 해당하는 TREE 정보 수집.
		function lf_collectOBJID(is_tree){

            is_tree.highlight = "None";

            //equal 검색인경우.
            if(gs_find.equal === true){
                //입력 키워드와 동일한 경우 수집 처리.
                if(is_tree.OBJID === l_OBJID){
                    gs_find.T_TREE.push(is_tree);
                }

            }else{
                //TREE 라인이 검색조건에 포함하는경우 수집처리.
                if(is_tree.OBJID.indexOf(l_OBJID) !== -1){
                    gs_find.T_TREE.push(is_tree);
                }
            }

            
            //CHILD 정보가 존재하지 않는경우 EXIT.
			if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}
			
            //CHILD를 탐색하며 검색조건에 포함되는 라인 정보 수집.
			for(var i=0, l=is_tree.zTREE.length; i<l; i++){				
				lf_collectOBJID(is_tree.zTREE[i]);
				
			}					
		
		}   //검색조건에 해당하는 TREE 정보 수집.

        //수집건 초기화.
        gs_find.T_TREE = [];

        //검색조건 대문자 처리.
        var l_OBJID = gs_find.keyword.toUpperCase();

        //수집 처리.
        lf_collectOBJID(oAPP.attr.oModel.oData.zTREE[0]);

    }  //검색조건에 해당하는 OBJECT ID 수집.




    //검색조건에 해당하는 OBJID 찾기.
	function lf_designFindOBJID(oUi, POS, bRefresh){
		
        //검색조건을 입력하지 않은경우.
        if(gs_find.keyword === ""){
            //design tree UI 마킹 초기화 처리.
            lf_designRemoveFilterUI();
            return;
        }
		

        // //suggest 입력건 저장 처리.
        // oAPP.fn.saveUiSuggest("designTreeFindUIInpit", gs_find.keyword, C_SUGGEST_CNT, oUi);

        // //suggestion 닫기.
        // oUi.closeSuggestions();


		//검색 키워드가 변경됐다면.
		if(bRefresh === true){
			//검색조건으로 신규 검색.
            lf_designCollectFindOBJID();
		
		}
		

		//검색된 결과가 없다면.
		if(gs_find.T_TREE.length === 0){
			//오류 메시지 처리.
            //174 Target object can not be found.
			//parent.showMessage(sap, 10, "E", "Target object can not be found.");
            sap.m.MessageToast.show("Target object can not be found.",{of:oUi, my:"center top"});

            //모델 갱신 처리.
            oAPP.attr.oModel.refresh();
			return;
		}


        //신규 검색이 아닌경우 검색 position 변경.
        if(bRefresh === false){
            //position + 1(position + -1).
		    gs_find.position += POS;

        }


        //마지막 위치까지 도달한 경우.
        if(gs_find.position === gs_find.T_TREE.length){
            //검색건 position 초기화.
            gs_find.position = 0;
        
        }else if(bRefresh === false && gs_find.position === -1){
            //최상위까지 도달한 경우 검색건의 마지막으로 이동.
            gs_find.position = gs_find.T_TREE.length - 1;

        }


        //검색건의 표시처리 default로 변경.
        for(var i=0, l= gs_find.T_TREE.length; i<l; i++){            
            gs_find.T_TREE[i].highlight = C_FOUND;
        }
        
        //현재 검색되는 라인 색상 처리.
        gs_find.T_TREE[gs_find.position].highlight = C_CURRENT;
        
        //모델 갱신 처리.
        oAPP.attr.oModel.refresh();	


        //검색조건이 변경되어 재검색된 경우.
        if(bRefresh === true){
            //검색 건수 메시지 출력.
            parent.showMessage(sap, 10, "S", "Match results : " + gs_find.T_TREE.length);

            //tree 전체 펼침 처리.
            oAPP.attr.ui.oLTree1.expandToLevel(999999999999);

        }
        
        //design영역의 UI 총 갯수 얻기.
        var l_max = oAPP.fn.designGetTreeItemCount();

        //design tree의 바인딩 정보 얻기.
        var lt_ctxt = oAPP.attr.ui.oLTree1._getContexts(0, l_max);

        var l_indx = 0;

        //design tree의 바인딩정보에서 현재 검색한 UI의 라인 위치 얻기.
        for(var i=0, l= lt_ctxt.length; i<l; i++){
            if(lt_ctxt[i].context.getProperty("OBJID") === gs_find.T_TREE[gs_find.position].OBJID){
                l_indx = i;
                break;
            }
        }
        
        //design tree의 라인 이동 처리.
        oAPP.fn.desginSetFirstVisibleRow(l_indx, gs_find.T_TREE[gs_find.position]);
		
	}  //검색조건에 해당하는 OBJID 찾기.





    //design tree UI 검색 초기화 처리.
    function lf_designRemoveFilterUI(){
    
        //하위를 탐색하며 filter된 라인 초기화 처리.
		function lf_collectOBJID(is_tree){

            //초기화 처리.
            is_tree.highlight = "None";

            //CHILD 정보가 존재하지 않는경우 EXIT.
            if(!is_tree.zTREE || is_tree.zTREE.length === 0){return;}

            //CHILD를 탐색하며 검색조건에 포함되는 라인 마킹처리.
            for(var i=0, l=is_tree.zTREE.length; i<l; i++){				
                lf_collectOBJID(is_tree.zTREE[i]);

            }

        }   //하위를 탐색하며 filter된 라인 초기화 처리.

        //기존 filter로 마킹한건 제거 처리.
        lf_collectOBJID(oAPP.attr.oModel.oData.zTREE[0]);


        //현재 tree의 row 정보 얻기.
        var lt_rows = oAPP.attr.ui.oLTree1.getRows();

        for(var i=0, l=lt_rows.length; i<l; i++){
            //find로 검색한 UI의 현재 선택됨 css 제거.
            lt_rows[i].removeStyleClass("cl_ws_find_marker");

        }

        //모델 갱신 처리.
        oAPP.attr.oModel.refresh();

    }  //design tree UI 검색 초기화 처리.





    //design tree의 라인 검색 팝업.
	oAPP.fn.callDesignTreeFindPopup = function(oUi){

        //광역 구조 정보 초기화.
        gs_find = {T_TREE:[], position:0, keyword:"", equal:false, dirUp:false};
		
		var oPop = new sap.m.ResponsivePopover({placement:"Auto", contentWidth:"450px", modal:false, placement:"Auto", offsetY:-30});

        //팝업 호출 전 이벤트.
        oPop.attachBeforeOpen(function(){
            //design tree의 스크롤 이벤트 등록 처리.
            oAPP.attr.ui.oLTree1.attachFirstVisibleRowChanged(lf_designTreeScrollEvent);

            //design tree의 row update 이벤트 해제 처리.
            oAPP.attr.ui.oLTree1.attachRowsUpdated(lf_designTreeRowsUpdated);

        }); //팝업 호출 전 이벤트.

        //팝업 종료 전 이벤트.
        oPop.attachBeforeClose(function(){

            //검색조건, 검색결과 광역 구조 초기화.
            gs_find = {T_TREE:[], position:0, keyword:"", equal:false, dirUp:false};

            //focus된 UI 초기화.
            go_focusedUI = null;

            //design tree의 스크롤 이벤트 해제 처리.
            oAPP.attr.ui.oLTree1.detachFirstVisibleRowChanged(lf_designTreeScrollEvent);

            //design tree의 row update 이벤트 해제 처리.
            oAPP.attr.ui.oLTree1.detachRowsUpdated(lf_designTreeRowsUpdated);

            //design tree UI 마킹 초기화 처리.
            lf_designRemoveFilterUI();

        }); //팝업 종료 전 이벤트.

        //팝업 호출후 이벤트.
        oPop.attachAfterOpen(function(){
            //input ui 포커스됨 광역변수 처리.
            go_focusedUI = oInp;

            //팝업 호출 후 검색조건 필드에 포커스 처리.
            oInp.focus();

        }); //팝업 호출후 이벤트.
        

        var oTool = new sap.m.Toolbar();
        oPop.setCustomHeader(oTool);

        var oTitle = new sap.m.Title({text:"Find UI"});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        oTool.addContent(new sap.m.ToolbarSpacer());

        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip: "Close"});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){            
            oPop.close();

        }); //닫기 버튼 선택 이벤트.


        var oGrid = new sap.ui.layout.Grid({defaultSpan:"XL6 L6 M6 S12", hSpacing:0.5, vSpacing:0});
        oPop.addContent(oGrid);

        //검색조건 필드.
        var oInp = new sap.m.Input({placeholder:"Please enter search criteria.",
            layoutData: new sap.ui.layout.GridData({span:"XL8 L8 M8 S8"})});
        oGrid.addContent(oInp);

        //검색조건 필드 엔터 이벤트.
        oInp.attachSubmit(function(){
            //input ui 포커스됨 광역변수 처리.
            go_focusedUI = oInp;
        
            //design tree에서 입력된 값에 해당하는건 찾기.
            lf_designFindOBJID(oInp, lf_getDirectionPos(oChk2), lf_isRefresh(oInp, oChk1));
            
        }); //검색조건 필드 엔터 이벤트.

        //검색조건 필드 key down 이벤트.
        oInp.attachBrowserEvent("keydown", function(oEvent){

            //입력값이 존재하지 않는경우 exit.
            if(this.getValue() === ""){
                return;
            }

            switch (oEvent.keyCode) {
                case 38:    //키보드 방향키 위.
                    //design tree에서 입력된 값에 해당하는건 찾기.
                    lf_designFindOBJID(oInp, -1, lf_isRefresh(oInp, oChk1));
                    break;
                
                case 40:    //키보드 방향키 아래.
                    //design tree에서 입력된 값에 해당하는건 찾기.
                    lf_designFindOBJID(oInp, 1, lf_isRefresh(oInp, oChk1));
                    break;
            
                default:
                    break;
            }

        }); //검색조건 필드 key down 이벤트.

        // //검색조건 필드의 suggest 기능 추가.
        // oAPP.fn.setUiSuggest(oInp, "designTreeFindUIInpit");


        //검색 버튼.
        var oBtn1 = new sap.m.Button({icon:"sap-icon://accept", type:"Accept", width:"100%",
            tooltip:"Filter Value", layoutData: new sap.ui.layout.GridData({span:"XL4 L4 M4 S4"})});
            oGrid.addContent(oBtn1);

        //검색 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //버튼 ui 포커스됨 광역변수 처리.
            go_focusedUI = oBtn1;

            //design tree에서 입력된 값에 해당하는건 찾기.					
            lf_designFindOBJID(oInp, lf_getDirectionPos(oChk2), lf_isRefresh(oInp, oChk1));
            
        }); //검색 버튼 선택 이벤트.
        
        
        //equal 검색 체크박스.
        var oChk1 = new sap.m.CheckBox({text:"Search equal value", tooltip:"Search equal value",
            layoutData: new sap.ui.layout.GridData({span:"XL4 L4 M4 S4"})});
        oGrid.addContent(oChk1);

        //equal 검색 체크박스 선택 이벤트.
        oChk1.attachSelect(function(){
            go_focusedUI = oInp;
            oInp.focus();
        }); //equal 검색 체크박스 선택 이벤트.


        //아래로 검색 체크박스(input의 enter이벤트, 검색버튼 선택시 적용)
        var oChk2 = new sap.m.CheckBox({text:"direction up", tooltip:"Direction Up", 
            layoutData: new sap.ui.layout.GridData({span:"XL4 L4 M4 S4"})});
        oGrid.addContent(oChk2);

        //아래로 검색 체크박스 선택 이벤트.
        oChk2.attachSelect(function(){
            go_focusedUI = oInp;
            oInp.focus();
        }); //아래로 검색 체크박스 선택 이벤트.


        //위로 검색 버튼.
        var oBtn3 = new sap.m.Button({icon:"sap-icon://arrow-top", tooltip:"up", width:"100%",
            layoutData: new sap.ui.layout.GridData({span:"XL2 L2 M2 S2"})});
        oGrid.addContent(oBtn3);

        //위로 검색 버튼 선택 이벤트.
        oBtn3.attachPress(function(){

            //버튼 ui 포커스됨 광역변수 처리.
            go_focusedUI = oBtn3;
        
            //design tree에서 입력된 값에 해당하는건 찾기.
            lf_designFindOBJID(oInp, -1, lf_isRefresh(oInp, oChk1));

        }); //위로 검색 버튼 선택 이벤트.


        //아래로 검색 버튼.
        var oBtn4 = new sap.m.Button({icon:"sap-icon://arrow-bottom",tooltip:"down", width:"100%",
            layoutData: new sap.ui.layout.GridData({span:"XL2 L2 M2 S2"})});
        oGrid.addContent(oBtn4);

        //아래로 검색 버튼 선택 이벤트.
        oBtn4.attachPress(function(){

            //버튼 ui 포커스됨 광역변수 처리.
            go_focusedUI = oBtn4;
        
            //design tree에서 입력된 값에 해당하는건 찾기.
            lf_designFindOBJID(oInp, 1, lf_isRefresh(oInp, oChk1));

        }); //아래로 검색 버튼 선택 이벤트.


        //팝업 호출 처리.
        oPop.openBy(oUi);

    };  //design tree의 라인 검색 팝업.

})();