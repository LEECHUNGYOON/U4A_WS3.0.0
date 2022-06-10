(function(){

    //디자인영역(미리보기)의 CONTEXT MENU UI 구성.
    oAPP.fn.callDesignContextMenu = function(){
        
        //MENU UI생성.
        var oMenu1 = new this.sap.m.Menu({title:"{/lcmenu/title}"});

        var oModel = new this.sap.ui.model.json.JSONModel();

        //context menu popover에 모델 설정.
        oMenu1.setModel(oModel);

        //menu item 선택 이벤트.
        oMenu1.attachItemSelected(function(oEvent){
            //메뉴 item선택건에 따른 기능 분기 처리.
            oAPP.fn.contextMenuItemPress(oEvent);

            //메뉴 선택 후 popup종료 처리.
            oAPP.fn.contextMenuClosePopup(oMenu1);

        }); //menu item 선택 이벤트.

        //UI 추가 메뉴
        var oMItem1 = new this.sap.m.MenuItem({key:"M01", icon:"sap-icon://add", text:"Insert Element", enabled:"{/lcmenu/enab01}"});
        oMenu1.addItem(oMItem1);

        //UI 삭제 메뉴
        var oMItem2 = new this.sap.m.MenuItem({key:"M02", icon:"sap-icon://delete", text:"Delete", enabled:"{/lcmenu/enab02}"});
        oMenu1.addItem(oMItem2);

        //UI up
        var oMItem3 = new this.sap.m.MenuItem({key:"M03", icon:"sap-icon://navigation-up-arrow", text:"Up", enabled:"{/lcmenu/enab03}",startsSection:true});
        oMenu1.addItem(oMItem3);

        //UI down
        var oMItem4 = new this.sap.m.MenuItem({key:"M04", icon:"sap-icon://navigation-down-arrow", text:"Down",enabled:"{/lcmenu/enab04}"});
        oMenu1.addItem(oMItem4);

        //UI move Position
        var oMItem5 = new this.sap.m.MenuItem({key:"M05", icon:"sap-icon://outdent", text:"Move Position",enabled:"{/lcmenu/enab05}"});
        oMenu1.addItem(oMItem5);

        //copy 메뉴.
        var oMItem6 = new this.sap.m.MenuItem({key:"M06", icon:"sap-icon://copy", text:"Copy",enabled:"{/lcmenu/enab06}",startsSection:true});
        oMenu1.addItem(oMItem6);

        //paste 메뉴.
        var oMItem7 = new this.sap.m.MenuItem({key:"M07", icon:"sap-icon://paste", text:"Paste", enabled:"{/lcmenu/enab07}"});
        oMenu1.addItem(oMItem7);
        
        //UI where use 메뉴.
        var oMItem8 = new this.sap.m.MenuItem({key:"M08", icon:"sap-icon://search", text:"UI Where use", startsSection:true, enabled:"{/lcmenu/enab08}"});
        oMenu1.addItem(oMItem8);

        //관리자 메뉴.
        var oMItem9 = new this.sap.m.MenuItem({key:"M09", icon:"sap-icon://paste", text:"관리자", startsSection:true});
        oMenu1.addItem(oMItem9);

        //관리자 서브 메뉴.
        var oMItem10 = new this.sap.m.MenuItem({key:"M10", icon:"sap-icon://paste", text:"Wizard Template 등록"});
        oMItem9.addItem(oMItem10);


        //생성한 popup 정보 return;
        return oMenu1;


    };  //디자인영역(미리보기)의 CONTEXT MENU 기능.



    
    //context menu popup 종료 처리.
    oAPP.fn.contextMenuClosePopup = function(oUi){
        //메뉴 정보 얻기.
        var oMenu = oUi._getMenu();

        //메뉴정보를 못얻은경우, 메뉴가 열려있지 않은경우 exit.
        if(!oMenu || !oMenu.bOpen){return;}
        
        //popup 닫기.
        oUi.close();

    };  //context menu popup 종료 처리.




    //메뉴 item선택건에 따른 기능 분기 처리.
    oAPP.fn.contextMenuItemPress = function(oEvent){
        
        //선택한 menu item의 KEY 정보 얻기.
        var l_key = oEvent.mParameters.item.getKey();

        switch(l_key){
            case "M01": //UI 추가 메뉴
                //UI 추가 처리.
                oAPP.fn.contextMenuInsertUI();
                break;
            
            case "M02": //UI 삭제 메뉴
                //UI 삭제 처리.
                oAPP.fn.contextMenuDeleteUI();
                break;
            
            case "M03": //UI up
                oAPP.fn.contextMenuUiMove("-");
                break;
            
            case "M04": //UI down
                oAPP.fn.contextMenuUiMove("+");
                break;
            
            case "M05": //UI move Position
                oAPP.fn.contextMenuUiMovePosition();
                break;
            
            case "M06": //copy 메뉴.
                oAPP.fn.contextMenuUiCopy();
                break;

            case "M07": //paste 메뉴.
                oAPP.fn.contextMenuUiPaste();
                break;
            
            case "M08": //UI Where use 메뉴.
                oAPP.fn.contextMenuUiWhereUse();
                break;

        }

    };  //메뉴 item선택건에 따른 기능 분기 처리.




    //디자인영역 context menu 활성여부 설정.
    oAPP.fn.enableDesignContextMenu = function(oMenu, OBJID){

        var ls_menu = {};

        var oModel = oMenu.getModel();

        //context menu의 TITLE 정보.
        ls_menu.title = OBJID;

        //context menu를 호출한 OBJID 정보.
        ls_menu.OBJID = OBJID;

        //default 메뉴 항목 잠금 상태로 설정.
        ls_menu.enab01 = false;   //ui추가 불가
        ls_menu.enab02 = false;   //ui삭제 불가
        ls_menu.enab03 = false;   //ui up 불가
        ls_menu.enab04 = false;   //ui down 불가
        ls_menu.enab05 = false;   //ui move position 불가
        ls_menu.enab06 = false;   //copy 불가
        ls_menu.enab07 = false;   //paste 불가
        ls_menu.enab08 = false;   //UI where used 불가.

        //ROOT(DOCUMENT)영역인경우 모든 CONTEXT MENU 비활성 처리.
        if(OBJID === "ROOT"){
            oModel.setProperty("/lcmenu",ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu",ls_menu);

            //TREE ITEM 선택처리.
            oAPP.fn.setSelectTreeItem(OBJID);
            return;
        }

        //ROOT가 아닌경우 EDIT 여부와 상관없이 UI WHERE USE 가능.
        ls_menu.enab08 = true; //UI where used 가능.

        //edit 상태인경우.(APP에서 CONTEXT MENU호출건을 처리하기위함)
        if(oAPP.attr.oModel.oData.IS_EDIT === true){
            ls_menu.enab01 = true; //ui추가 가능

            //복사된건 history 존재여부에 따른 붙여넣기 메뉴 활성화 여부 설정.
            ls_menu.enab07 = oAPP.fn.isExistsCopyData("U4AWSuiDesignArea");

        }

        //APP에서 menu 호출한 경우 편집 여부에 따라 UI추가, UI붙여넣기 메뉴만 사용 가능.
        if(OBJID === "APP"){
            oModel.setProperty("/lcmenu",ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu",ls_menu);

            //TREE ITEM 선택처리.
            oAPP.fn.setSelectTreeItem(OBJID);
            return;
        }

        //DOCUMENT, APP가 아닌 영역에서 CONTEXT MENU 호출시 display 상태인경우 메뉴 비활성 처리.
        if(oAPP.attr.oModel.oData.IS_EDIT === false){
            ls_menu.enab06 = true; //copy 가능
            oModel.setProperty("/lcmenu",ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu",ls_menu);

            //TREE ITEM 선택처리.
            oAPP.fn.setSelectTreeItem(OBJID);
            return;
        }

        //DOCUMENT, APP가 아닌 영역에서 편집 가능한 상태일때 CONTEXT MENU 호출시 하위 로직 수행.

        //현재 라인 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(OBJID);

        //부모 정보 얻기
        var l_parent = oAPP.fn.getTreeData(ls_tree.POBID);

        //menu 선택한 위치 얻기.
        var l_pos = l_parent.zTREE.findIndex( a=> a.OBJID === OBJID);

        //default 설정.
        ls_menu.enab01 = true;   //ui추가 가능
        ls_menu.enab02 = true;   //ui삭제 가능
        ls_menu.enab03 = true;   //ui up 가능
        ls_menu.enab04 = true;   //ui down 가능
        ls_menu.enab05 = true;   //ui move position 가능
        ls_menu.enab06 = true;   //ui copy 활성화.

        //복사된건 history 존재여부에 따른 붙여넣기 메뉴 활성화 여부 설정.
        ls_menu.enab07 = oAPP.fn.isExistsCopyData("U4AWSuiDesignArea");

        //부모의 child정보가 1건인경우.
        if(l_parent.zTREE.length === 1){
            ls_menu.enab03 = false;   //ui up 불가능
            ls_menu.enab04 = false;   //ui down 불가능
            ls_menu.enab05 = false;   //ui down 불가능

        }else if(l_pos === 0){
            //menu를 선택한 위치가 child중 첫번째라면
            ls_menu.enab03 = false; //ui up 불가능

        }else if(l_pos+1 === l_parent.zTREE.length){
            //menu를 선택한 위치가 child중 마지막이라면.
            ls_menu.enab04 = false;   //ui down 불가능

        }

        //context menu 정보 바인딩.
        oModel.setProperty("/lcmenu",ls_menu);
        oAPP.attr.oModel.setProperty("/lcmenu",ls_menu);

        //context menu를 호출한 UI 선택 처리.
        oAPP.fn.setSelectTreeItem(OBJID);

    };  //디자인영역 context menu 활성여부 설정.




    /************************************************************************
   * UI가 입력 가능한 카디널리티 여부 확인.
   * **********************************************************************
   * @param {object} is_parent - 점검 대상 부모 tree 정보.
   * @param {string} UIATK - 부모 추가하려는 aggregation KEY
   * @param {abap_bool} ISMLB - 카디널리티 ("X" = 0:N, "" = 0:1)
   ************************************************************************/
    oAPP.fn.chkUiCardinality = function(is_parent, UIATK, ISMLB){

        //n건 입력가능하거나, 부모의 child정보가 한건도 없는경우 exit.
        if(is_parent.zTREE.length === 0){return;}

        //현재 추가하고자 하는 aggregation에 UI가 존재하는지 여부 확인.
        var l_indx = is_parent.zTREE.findIndex( a => a.UIATK === UIATK );

        //부모의 대상 aggregation에 이미 UI가 추가된경우 오류 처리(0:1 aggregation의 경우 1개의 UI만 추가 가능).
        if(ISMLB === "" && l_indx !== -1){
            //022	Can not specify more than one object in the corresponding Aggrigation.
            parent.showMessage(sap, 10, "W", "Can not specify more than one object in the corresponding Aggrigation.");

            //오류 flag return
            return true;

        }

        //N건이 추가 가능한 AGGREGATION인경우.
        if(ISMLB === "X"){

            //부모 UI의 입력한 AGGREGATION정보 얻기.
            var ls_0015 = oAPP.attr.prev[is_parent.OBJID]._T_0015.find( a => a.UIATK === UIATK && a.UIATY === "3" );

            //대상 AGGREGATION에 바인딩처리가 됐으며, 이미 대상 AGGREGATION에 UI가 추가된경우.
            if(typeof ls_0015 !== "undefined" && ls_0015.UIATV !== "" && ls_0015.ISBND === "X" && l_indx !== -1){

                //021	The object is already specified in Aggrigation.
                parent.showMessage(sap, 10, "W", "The object is already specified in Aggrigation.");

                //오류 flag return
                return true;

            }

        }

    };  //UI가 입력 가능한 카디널리티 여부 확인.

    
    //UI 추가 메뉴 선택 처리.
    oAPP.fn.contextMenuInsertUI = function(){
      
        //UI 추가.
        function lf_setChild(param){

            //UI가 입력 가능한 카디널리티 여부 확인.
            if(oAPP.fn.chkUiCardinality(ls_tree, param.E_EMB_AGGR.UIATK, param.E_EMB_AGGR.ISMLB) === true){
                return;
            }

            var l_cnt = parseInt(param.E_CRTCNT);

            //[워크벤치] 특정 API / UI 에 대한 중복 대상 관리 여부 확인.
            if(oAPP.fn.designChkUnique(param.E_UIOBJ.UIOBK, l_cnt) === true){        
                return;
            }

            //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.
            if(oAPP.fn.designChkHiddenAreaUi(param.E_UIOBJ.UIOBK, ls_tree.UIOBK) === true){
                return;
            }
            
            //context menu 호출 UI의 child 정보가 존재하지 않는경우 생성.
            if(!ls_tree.zTREE){
                ls_tree.zTREE = [];
            }            

            //부모 UI의 입력한 AGGREGATION정보 얻기.
            var ls_0015 = oAPP.attr.prev[ls_tree.OBJID]._T_0015.find( a => a.UIATK === param.E_EMB_AGGR.UIATK && a.UIATY === "3" );

            //대상 AGGREGATION에 바인딩 처리된경우 추가하고자 하는 UI를 2개 이상 입력했다면 알림 메시지, UI는 1개만 추가되게 처리.
            if(typeof ls_0015 !== "undefined" && ls_0015.UIATV !== "" && ls_0015.ISBND === "X" & l_cnt >= 2){
                l_cnt = 1;
                //021	The object is already specified in Aggrigation.
                parent.showMessage(sap, 10, "W", "The object is already specified in Aggrigation.");
            }

            //공통코드 미리보기 UI Property 고정값 정보 검색.
            var lt_ua018 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA018");
            
            //부모 UI에 추가 불필요 대상 UI 정보 검색.
            var lt_ua026 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA026" && a.FLD02 !== "X" );

            //UI 프로퍼티 고정값 설정 정보 검색.
            var lt_ua030 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA030" && a.FLD06 !== "X" );

            //UI 프로퍼티 type 예외처리 정보 검색.
            var lt_ua032 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA032" && a.FLD06 !== "X" );

            //UI 프로퍼티 type 예외처리 정보 검색.
            var lt_ua050 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA050" && a.FLD08 !== "X" );

            //UI 반복 횟수만큼 그리기.
            for(var i=0; i<l_cnt; i++){

                //14번 저장 구조 생성.
                var l_14 = oAPP.fn.crtStru0014();

                //바인딩 처리 필드 생성.
                oAPP.fn.crtTreeBindField(l_14);


                l_14.APPID = oAPP.attr.appInfo.APPID;
                l_14.GUINR = oAPP.attr.appInfo.GUINR;

                //UI명 구성.
                l_14.OBJID = oAPP.fn.setOBJID(param.E_UIOBJ.UIOBJ);
                l_14.POBID = ls_tree.OBJID;
                l_14.UIOBK = param.E_UIOBJ.UIOBK;
                l_14.PUIOK = ls_tree.UIOBK;

                l_14.UIATK = param.E_EMB_AGGR.UIATK;
                l_14.UIATT = param.E_EMB_AGGR.UIATT;
                l_14.UIASN = param.E_EMB_AGGR.UIASN;
                l_14.UIATY = param.E_EMB_AGGR.UIATY;
                l_14.UIADT = param.E_EMB_AGGR.UIADT;
                l_14.UIADS = param.E_EMB_AGGR.UIADS;
                l_14.ISMLB = param.E_EMB_AGGR.ISMLB;

                l_14.UIFND = param.E_UIOBJ.UIFND;
                l_14.PUIATK = param.E_EMB_AGGR.UIATK;
                l_14.UILIB = param.E_UIOBJ.LIBNM;
                l_14.ISEXT = param.E_UIOBJ.ISEXT;
                l_14.TGLIB = param.E_UIOBJ.TGLIB;

                //UI ICON 구성.
                l_14.UICON = oAPP.fn.fnGetSapIconPath(param.E_UIOBJ.UICON);

                //tree embeded aggregation 아이콘 표현.
                oAPP.fn.setTreeAggrIcon(l_14);

                //default 아이콘 비활성 처리.
                l_14.icon_visible = false;

                //아이콘이 존재하는 경우 아이콘 활성 처리.
                if(typeof l_14.UICON !== "undefined" && l_14.UICON !== ""){
                    l_14.icon_visible = true;
                }

                //context menu 호출 라인의 child에 추가한 UI정보 수집.
                ls_tree.zTREE.push(l_14);

                var ls_0015 = oAPP.fn.crtStru0015();
                
                //embed aggregation 정보 구성.
                ls_0015.APPID = oAPP.attr.appInfo.APPID;
                ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
                ls_0015.OBJID = l_14.OBJID;
                ls_0015.UIOBK = param.E_UIOBJ.UIOBK;
                ls_0015.UIATK = param.E_EMB_AGGR.UIATK;
                ls_0015.UILIK = param.E_UIOBJ.UILIK;
                ls_0015.UIATT = param.E_EMB_AGGR.UIATT;
                ls_0015.UIASN = param.E_EMB_AGGR.UIASN;
                ls_0015.UIADT = param.E_EMB_AGGR.UIADT;
                ls_0015.UIATY = "6";
                ls_0015.ISMLB = param.E_EMB_AGGR.ISMLB;
                ls_0015.ISEMB = "X";


                //미리보기 UI 추가
                oAPP.attr.ui.frame.contentWindow.addUIObjPreView(l_14.OBJID, l_14.UIOBK, l_14.UILIB, 
                    l_14.UIFND, l_14.POBID, l_14.PUIOK, param.E_EMB_AGGR.UIATT, [ls_0015], lt_ua018, lt_ua032, lt_ua030, lt_ua026, lt_ua050);

                //aggregation 정보 초기화.
                ls_0015 = {};

                //file uploader UI의 uploaderUrl 프로퍼티 예외처리.
                oAPP.fn.attrUploadUrlException(l_14.OBJID, l_14.UIOBK);

            } //UI 반복 횟수만큼 그리기.
            
  
            //MODEL 갱신 처리.
            oAPP.attr.oModel.refresh();

            //design tree의 tree binding 정보 갱신 처리.
            var l_bind = oAPP.attr.ui.oLTree1.getBinding();
            l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

            //신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
            //oAPP.attr.prev[l_14.OBJID].__isnew = "X";

            //메뉴 선택 tree 위치 펼침 처리.
            oAPP.fn.setSelectTreeItem(l_14.OBJID);

            //변경 FLAG 처리.
            oAPP.fn.setChangeFlag();

        } //UI 추가.
  
  


        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);
        
        
        //UI추가 팝업 정보가 존재하는경우 팝업 호출.
        if(typeof oAPP.fn.callUIInsertPopup !== "undefined"){        
            oAPP.fn.callUIInsertPopup(ls_tree.UIOBK, lf_setChild);
            return;
        }
        
        //UI 추가 팝업 정보가 존재하지 않는다면 JS 호출 후 팝업 호출.
        oAPP.fn.getScript("design/js/insertUIPopop",function(){
            oAPP.fn.callUIInsertPopup(ls_tree.UIOBK, lf_setChild);
        });
  
    };  //UI 추가 메뉴 선택 처리.



    //contet menu UI삭제 메뉴 선택 이벤트.
    oAPP.fn.contextMenuDeleteUI = function(){
  
        //선택라인의 삭제대상 OBJECT 제거 처리.
        function lf_deleteTreeLine(is_tree){
            
            //child정보가 존재하는경우.
            if(is_tree.zTREE.length !== 0){
                //하위 TREE 정보가 존재하는경우
                for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                    //재귀호출 탐색하며 삭제 처리.
                    lf_deleteTreeLine(is_tree.zTREE[i]);

                }

            }

            //클라이언트 이벤트 및 sap.ui.core.HTML의 프로퍼티 입력건 제거 처리.
            oAPP.fn.delUiClientEvent(is_tree);

            //Description 삭제.
            oAPP.fn.delDesc(is_tree.OBJID);

            //해당 UI의 바인딩처리 수집건 제거 처리.
            for(var i=0, l=oAPP.attr.prev[is_tree.OBJID]._T_0015.length; i<l; i++){
                //바인딩 처리건이 아닌경우 SKIP.
                if(oAPP.attr.prev[is_tree.OBJID]._T_0015[i].ISBND !== "X"){continue;}

                //바인딩 처리건인경우 UI에 N건 정보 수집 됐다면 해제 처리.
                oAPP.fn.attrUnbindProp(oAPP.attr.prev[is_tree.OBJID]._T_0015[i]);

            }


            //미리보기 UI 수집항목에서 해당 OBJID건 삭제.
            delete oAPP.attr.prev[is_tree.OBJID];

        } //선택라인의 삭제대상 OBJECT 제거 처리.
  
  
  
        //UI삭제전 확인 팝업 호출. 메시지!!
        parent.showMessage(sap, 30, "I", "선택한 라인을 삭제하시겠습니까?.",function(oEvent){
            
            //확인 팝업에서 YES를 선택한 경우 하위 로직 수행.
            if(oEvent !== "YES"){return;}
            
            //context menu를 호출한 라인의 OBJID 얻기.
            var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

            //OBJID에 해당하는 TREE 정보 얻기.
            var ls_tree = oAPP.fn.getTreeData(l_OBJID);

            //미리보기 화면 UI 제거.
            oAPP.attr.ui.frame.contentWindow.delUIObjPreView(ls_tree.OBJID, ls_tree.POBID, ls_tree.PUIOK, ls_tree.UIATT, ls_tree.ISMLB, ls_tree.UIOBK);

            //삭제 이후 이전 선택처리 정보 얻기.
            var l_prev = oAPP.fn.designGetPreviousTreeItem(ls_tree.OBJID);

            //선택라인의 삭제대상 OBJECT 제거 처리.
            lf_deleteTreeLine(ls_tree);
            
            //부모 TREE 라인 정보 얻기.
            var ls_parent = oAPP.fn.getTreeData(ls_tree.POBID);
            
            //부모에서 현재 삭제대상 라인이 몇번째 라인인지 확인.
            var l_fIndx = ls_parent.zTREE.findIndex( a => a.OBJID === ls_tree.OBJID );

            if(l_fIndx !== -1){
                //부모에서 현재 삭제 대상건 제거.
                ls_parent.zTREE.splice(l_fIndx, 1);
            }
            
            //모델 갱신 처리.
            oAPP.attr.oModel.refresh(true);

            //삭제라인의 바로 윗 라인 선택 처리.
            oAPP.fn.setSelectTreeItem(l_prev);

            //변경 FLAG 처리.
            oAPP.fn.setChangeFlag();
  
        }); //UI삭제전 확인 팝업 호출.
  
  
    };  //contet menu UI삭제 메뉴 선택 이벤트.


    

    //ui 이동처리 function
    oAPP.fn.contextMenuUiMove = function(sign, pos){

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);
        
        //부모 TREE 정보 얻기.
        var l_parent = oAPP.fn.getTreeData(ls_tree.POBID);

        //현재 UI가 부모의 몇번째에 위치해있는지 확인.
        var l_pos = l_parent.zTREE.findIndex( a => a.OBJID === ls_tree.OBJID );

        //현재 이동하는 UI의 동일 AGGR건 얻기.
        var lt_filt = l_parent.zTREE.filter( a => a.UIATT === ls_tree.UIATT );
        
        //이동전 ui 위치 확인.
        var l_indx1 = lt_filt.findIndex( a => a.OBJID === ls_tree.OBJID );

        //현재 UI를 부모에서 제거 처리.
        l_parent.zTREE.splice(l_pos,1);
        
        //이전 위치로 이동하는경우.
        if(sign === "-"){
            //이전 위치를 position으로 설정.
            l_pos -= 1;            
            
        //다음 위치로 이동하는경우.
        }else if(sign === "+"){
            //다음 위치를 position으로 설정.
            l_pos +=1;
                        
        //대상 position으로 이동하는경우.
        }else if(typeof pos !== "undefined"){
            //입력된 position을 이동 위치로 설정.
            l_pos = pos;
  
        }

        //현재 UI를 대상 위치로 이동.
        l_parent.zTREE.splice(l_pos, 0, ls_tree);
        
        //모델 갱신 처리.
        oAPP.attr.oModel.refresh();
        
        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());
  
        var lt_filt = l_parent.zTREE.filter( a => a.UIATT === ls_tree.UIATT );
        
        //이동 후 ui 위치 확인.
        var l_indx2 = lt_filt.findIndex( a => a.OBJID === ls_tree.OBJID );
        
        //AGGREGATION상에서 위치가 변경된경우.
        if(l_indx1 !== l_indx2){
            //미리보기 갱신 처리.
            oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(ls_tree.OBJID, ls_tree.UILIB, ls_tree.POBID, ls_tree.PUIOK, ls_tree.UIATT, l_indx2, ls_tree.UIOBK);

            //미리보기 ui 선택.
            oAPP.attr.ui.frame.contentWindow.selPreviewUI(ls_tree.OBJID);

        }

        //design영역 tree item 선택 재선택 처리.
        oAPP.fn.setSelectTreeItem(ls_tree.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();
 

    };  //ui 이동처리 function



    
    //UI 위치 이동 처리.
    oAPP.fn.contextMenuUiMovePosition = function(){

        //CALL BACK FUNCTION.
        function lf_callback(pos){
            //대상 위치로 UI 이동 처리.
            oAPP.fn.contextMenuUiMove(undefined, pos);

        }   //CALL BACK FUNCTION.

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);
        
        //부모 TREE 정보 얻기.
        var l_parent = oAPP.fn.getTreeData(ls_tree.POBID);

        //현재 UI가 부모의 몇번째에 위치해있는지 확인.
        var l_pos = l_parent.zTREE.findIndex( a => a.OBJID === ls_tree.OBJID ) + 1;
                
        
        //UI위치 이동 function이 존재하는경우 호출 처리.
        if(typeof oAPP.fn.uiMovePosition !== "undefined"){
            oAPP.fn.uiMovePosition(ls_tree.OBJID, l_pos, l_parent.zTREE.length, lf_callback);
            return;

        }

        //UI위치 이동 function이 존재하지 않는경우 js 호출 후 function 호출.
        oAPP.fn.getScript("design/js/uiMovePosition",function(){
            oAPP.fn.uiMovePosition(ls_tree.OBJID, l_pos, l_parent.zTREE.length, lf_callback);
        });

    };  //UI 위치 이동 처리.




    //context menu ui복사처리.
    oAPP.fn.contextMenuUiCopy = function(){
    
        //TREE ITEM에 해당하는 UI의 ATTRIBUTE정보 매핑 처리.
        function lf_setTreeItemAttr(is_tree){

            //TREE ITEM에 UI정보가 존재하는경우.
            if(typeof oAPP.attr.prev[is_tree.OBJID] !== "undefined"){
                //해당 UI의 ATTRIBUTE정보 매핑.
                is_tree._T_0015 = oAPP.attr.prev[is_tree.OBJID]._T_0015;

            }

            //현재 UI의 DESCRIPTION 정보 얻기.
            var l_desc = oAPP.fn.getDesc(is_tree.OBJID);

            //DESCRIPTION정보가 존재하는경우.
            if(l_desc !== ""){
                //DESCRIPTION정보 추가.
                is_tree._DESC = l_desc;
            }

            //CLIENT EVENT 정보 얻기.
            var lt_CEVT = oAPP.fn.getUiClientEvent(is_tree);

            //CLIENT EVENT 정보가 존재하는경우.
            if(typeof lt_CEVT !== "undefined"){
                //CLIENT EVENT 정보 추가.
                is_tree._CEVT = lt_CEVT;
            }

            //CHILD정보가 없다면 EXIT.
            if(is_tree.zTREE.length === 0){return;}

            //CHILD정보가 존재하는경우 하위를 탐색하며 UI의 ATTRIBUTE정보 매핑 처리.
            for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                lf_setTreeItemAttr(is_tree.zTREE[i]);
            }

        }   //TREE ITEM에 해당하는 UI의 ATTRIBUTE정보 매핑 처리.



        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);
        
        //DOCUMENT, APP에서 COPY한경우 EXIT.
        if(ls_tree.OBJID === "ROOT" || ls_tree.OBJID === "APP"){
            return;
        }

        //현재 라인에 해당하는 UI복사 처리.
        ls_tree = JSON.parse(JSON.stringify(ls_tree));

        ////TREE ITEM에 해당하는 UI의 ATTRIBUTE정보 매핑 처리.
        lf_setTreeItemAttr(ls_tree);

        //현재 라인 정보를 복사 처리.
        oAPP.fn.setCopyData("U4AWSuiDesignArea", ["U4AWSuiDesignArea"], ls_tree);


    };  //context menu ui복사처리.




    //context menu ui 붙여넣기 처리.
    oAPP.fn.contextMenuUiPaste = function(){
        
        //UI의 attr 정보 복사 처리.
        function lf_copyAttrData(is_14, is_copied, aggrParam, bKeep){

            if(is_copied._T_0015.length === 0){return;}

            var lt_0015 = [];

            for(var i=0, l=is_copied._T_0015.length; i<l; i++){
                
                //바인딩 정보를 유지 안하는경우.
                if(bKeep !== true){

                    //바인딩 처리된건인경우 skip.
                    if(is_copied._T_0015[i].ISBND === "X" && is_copied._T_0015[i].UIATV !== ""){
                        continue;
                    }

                    //서버 이벤트가 존재하는경우 skip.
                    if(is_copied._T_0015[i].UIATY === "2" && is_copied._T_0015[i].UIATV !== ""){
                        continue;
                    }

                }

                //프로퍼티 구조 신규 생성.
                var ls_15 = oAPP.fn.crtStru0015();

                //기존 복사건을 신규 15번 구조에 매핑.
                oAPP.fn.moveCorresponding(is_copied._T_0015[i], ls_15);

                ls_15.APPID = oAPP.attr.appInfo.APPID;
                ls_15.GUINR = oAPP.attr.appInfo.GUINR;
                ls_15.OBJID = is_14.OBJID;

                //복사된 ui의 최상위 정보의 aggregation 정보 변경처리.
                if(aggrParam && ls_15.UIATY === "6"){
                    ls_15.UIATK = aggrParam.UIATK;
                    ls_15.UIATT = aggrParam.UIATT;
                    ls_15.UIASN = aggrParam.UIASN;
                    ls_15.UIADT = aggrParam.UIADT;
                    ls_15.UIADS = aggrParam.UIADS;
                    ls_15.ISMLB = aggrParam.ISMLB;

                }

                //프로퍼티 복사건 재수집 처리.
                lt_0015.push(ls_15);
                
            }

            return lt_0015;

        }   //UI의 attr 정보 복사 처리.


        //복사된 ui를 붙여넣기 처리.
        function lf_setPasteCopiedData(is_parent, is_copied, aggrParam, it_ua018, it_ua026, it_ua030, it_ua032, it_ua050, bKeep){

            //신규 14번 구조 생성.
            var ls_14 = oAPP.fn.crtStru0014();

            //바인딩 처리 필드 생성.
            oAPP.fn.crtTreeBindField(ls_14);
            
            //기존 복사건을 신규 14번 구조에 매핑.
            oAPP.fn.moveCorresponding(is_copied, ls_14);
            ls_14.zTREE = [];

            //application 정보 재정의.
            ls_14.APPID = oAPP.attr.appInfo.APPID;
            ls_14.GUINR = oAPP.attr.appInfo.GUINR;

            if(aggrParam){
                //aggr 선택 팝업에서 선택한 aggregation정보 매핑.
                ls_14.UIATK = aggrParam.UIATK;
                ls_14.UIATT = aggrParam.UIATT;
                ls_14.UIASN = aggrParam.UIASN;
                ls_14.UIATY = aggrParam.UIATY;
                ls_14.UIADT = aggrParam.UIADT;
                ls_14.UIADS = aggrParam.UIADS;
                ls_14.ISMLB = aggrParam.ISMLB;
                ls_14.PUIATK = aggrParam.UIATK;                
            }

            //OBJID에 포함된 숫자 제거.
            ls_14.OBJID = ls_14.OBJID.replace(/\d/g,"");

            //현재 UI의 OBJID 재 매핑.
            ls_14.OBJID = oAPP.fn.setOBJID(ls_14.OBJID);

            //PARENT의 ID 매핑 처리.
            ls_14.POBID = is_parent.OBJID;

            //부모 UI OBJECT ID 매핑 처리.
            ls_14.PUIOK = is_parent.UIOBK;

            ls_14.chk = false;
            ls_14.chk_visible = true;

            //attribute 입력건 복사 처리.
            var lt_0015 = lf_copyAttrData(ls_14, is_copied, aggrParam, bKeep);


            //tree embeded aggregation 아이콘 표현.
            oAPP.fn.setTreeAggrIcon(ls_14);


            //부모 정보에 현재 복사처리한 UI 수집처리.
            is_parent.zTREE.push(ls_14);


            //UI DESC 정보가 존재하는경우.
            if(typeof is_copied._DESC !== "undefined"){
                //UI DESC 정보 구성.
                oAPP.fn.setDesc(ls_14.OBJID, is_copied._DESC);
            }


            //UI의 클라이언트 이벤트가 존재하는 경우 복사 처리.
            lf_copyClientEvent(ls_14.OBJID, is_copied);


            var l_UILIB = ls_14.UILIB;
            
            var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UOBK === ls_14.UIOBK );

            if(ls_0022){
                l_UILIB = ls_0022.LIBNM;
            }

            //미리보기 UI 추가
            oAPP.attr.ui.frame.contentWindow.addUIObjPreView(ls_14.OBJID, ls_14.UIOBK, l_UILIB, 
                ls_14.UIFND, ls_14.POBID, ls_14.PUIOK, ls_14.UIATT, lt_0015, it_ua018, it_ua032, it_ua030, it_ua026, it_ua050);

                
            //file uploader UI의 uploaderUrl 프로퍼티 예외처리.
            oAPP.fn.attrUploadUrlException(ls_14.OBJID, ls_14.UIOBK);


            //복사한 데이터의 CHILD 정보가 존재하지 않는경우.
            if(is_copied.zTREE.length === 0){
                //aggrParam 파라메터가 존재하는경우 현재 구성한 라인정보 RETURN.
                return aggrParam ? ls_14 : undefined;
            }

            //복사한 데이터의 CHILD정보가 존재하는경우 하위를 탐색하며 라인 정보 구성.
            for(var i=0, l=is_copied.zTREE.length; i<l; i++){
                lf_setPasteCopiedData(ls_14, is_copied.zTREE[i], undefined, it_ua018, it_ua026, it_ua030, it_ua032, it_ua050, bKeep);

            }

            //붙여넣기 데이터의 최상위인경우 해당 값 return.
            if(aggrParam){return ls_14;}

        }   //복사된 ui를 붙여넣기 처리.



        //붙여넣기 callback 이벤트.
        function lf_paste_cb(param, i_cdata, bKeep){
            
            //공통코드 미리보기 UI Property 고정값 정보 검색.
            var lt_ua018 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA018");
            
            //부모 UI에 추가 불필요 대상 UI 정보 검색.
            var lt_ua026 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA026" && a.FLD02 !== "X" );

            //UI 프로퍼티 고정값 설정 정보 검색.
            var lt_ua030 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA030" && a.FLD06 !== "X" );

            //UI 프로퍼티 type 예외처리 정보 검색.
            var lt_ua032 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA032" && a.FLD06 !== "X" );

            //UI 프로퍼티 type 예외처리 정보 검색.
            var lt_ua050 = oAPP.DATA.LIB.T_9011.filter( a=> a.CATCD === "UA050" && a.FLD08 !== "X" );


            //복사한 UI 붙여넣기 처리.
            var ls_14 = lf_setPasteCopiedData(ls_tree, i_cdata, param, lt_ua018, lt_ua026, lt_ua030, lt_ua032, lt_ua050, bKeep);

            //model 갱신 처리.
            oAPP.attr.oModel.refresh();

            //design tree의 tree binding 정보 갱신 처리.
            var l_bind = oAPP.attr.ui.oLTree1.getBinding();
            l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

            
            //붙여넣기한 UI의 신규 생성됨 flag 처리.
            //oAPP.attr.prev[ls_14.OBJID].__isnew = "X";

            //붙여넣기한 UI 선택 처리.
            oAPP.fn.setSelectTreeItem(ls_14.OBJID);

            //변경 FLAG 처리.
            oAPP.fn.setChangeFlag();


        } //붙여넣기 callback 이벤트.



        //AGGR 선택 팝업의 CALLBACK FUNCTION.
        function lf_aggrPopup_cb(param, i_cdata){

            //이동 가능한 aggregation 정보가 존재하지 않는경우.
            if(typeof param === "undefined"){
                //오류 메시지 출력.
                parent.showMessage(sap, 10, "I", "붙여넣기가 가능한 aggregation이 존재하지 않습니다.");
                return;                
            }

            //UI가 입력 가능한 카디널리티 여부 확인.
            if(oAPP.fn.chkUiCardinality(ls_tree, param.UIATK, param.ISMLB) === true){
                return;
            }


            //application이 같더라도 붙여넣기시 바인딩, 이벤트가 있으면 유지여부 확인팝업 호출에 의한 주석 처리-start.
            // //복사한 UI의 application이 현재 application과 같다면 바인딩 유지하면서 붙여넣기.
            // if(i_cdata.APPID === oAPP.attr.appInfo.APPID){
            //     //복사된 ui 붙여넣기 처리.
            //     lf_paste_cb(param, i_cdata, true);
            //     return;
            // }
            //application이 같더라도 붙여넣기시 바인딩, 이벤트가 있으면 유지여부 확인팝업 호출에 의한 주석 처리-end.


            //복사한 UI에 바인딩, 이벤트 정보가 존재하지 않는경우.
            if(lf_chkBindNEvent(i_cdata) !== true){
                //복사된 ui 붙여넣기 처리.
                lf_paste_cb(param, i_cdata, false);
                return;
            }


            //trial 버전인경우.
            if(parent.getIsTrial()){
                //복사된 바인딩 정보, 서버이벤트 정보 제거 상태로 붙여넣기 처리.
                lf_paste_cb(param, i_cdata, false);
                return;
            }
            

            //복사한 UI의 APPLICATION이 현재 APPLICATION과 다른 경우.
            //바인딩, 서버이벤트 초기화 여부 확인 팝업 호출.
            parent.showMessage(sap, 40, "I", "Copy and paste application is different.Do you want to keep the binding?.",function(oEvent){

                //취소를 한경우 exit.
                if(oEvent === "CANCEL"){return;}

                //default 바인딩, 서버이벤트 해제 처리.
                var l_flag = false;

                //바인딩, 서버이벤트를 유지하는경우.
                if(oEvent === "YES"){
                    l_flag = true;
                }

                //복사된 ui 붙여넣기 처리.
                lf_paste_cb(param, i_cdata, l_flag);

            });


        }   //AGGR 선택 팝업의 CALLBACK FUNCTION.




        //바인딩, 이벤트 설정건 존재여부 확인.
        function lf_chkBindNEvent(is_tree){

            //attribute 입력건이 존재하는경우.
            if(typeof is_tree._T_0015 !== "undefined" && is_tree._T_0015.length !== 0 ){
                //바인딩된 정보가 존재하거나 이벤트가 존재하는건이 있는지 여부 확인
                if(is_tree._T_0015.findIndex( a => ( a.ISBND === "X" && a.UIATV !== "") || ( a.UIATY === "2" && a.UIATV !== "") ) !== -1 ){
                    return true;
                }

            }

            //child UI가 존재하는경우.
            if(typeof is_tree.zTREE !== "undefined" && is_tree.zTREE.length !== 0){

                for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                    return lf_chkBindNEvent(is_tree.zTREE[i]);
                }

            }

        }   //바인딩, 이벤트 설정건 존재여부 확인.



        //클라이언트 이벤트 복사 처리.
        function lf_copyClientEvent(OBJID, is_tree){
            //복사된 UI에 클라이언트가 없는경우 EXIT.
            if(typeof is_tree._CEVT === "undefined"){return;}

            //클라이언트 이벤트를 복사 처리.
            for(var i=0, l=is_tree._CEVT.length; i<l; i++){
                //이전의 클라이언트 이벤트의 OBJID를 복사된 UI의 이름으로 변경처리.
                is_tree._CEVT[i].OBJID = is_tree._CEVT[i].OBJID.replace(is_tree.OBJID, OBJID);
            }

            //OBJID를 재구성한 클라이언트 이벤트 수집 처리.
            oAPP.DATA.APPDATA.T_CEVT = oAPP.DATA.APPDATA.T_CEVT.concat(is_tree._CEVT);

        }


        //편집 불가능 상태일때는 exit.
        if(oAPP.attr.oModel.oData.IS_EDIT !== true){
            return;
        }

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");
        
        //DOCUMENT영역에 PASTE한경우 EXIT.
        if(l_OBJID === "ROOT"){
            return;
        }

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //붙여넣기 정보 얻기.
        var l_cpoied = oAPP.fn.getCopyData("U4AWSuiDesignArea");

        //붙여넣기 정보가 존재하지 않는경우.
        if(!l_cpoied){
            return;
        }

        //복사된 정보중 tree에 관련된 정보 발췌.
        var l_cdata = l_cpoied[0].DATA;


        //복사한 UI가 이미 존재하는경우 붙여넣기 skip 처리.
        if(oAPP.fn.designChkUnique(l_cdata.UIOBK) === true){
            return;
        }

        //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.
        if(oAPP.fn.designChkHiddenAreaUi(l_cdata.UIOBK, ls_tree.UIOBK) === true){
            return;
        }
        

        //aggregation 선택 팝업 호출.
        if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){

            oAPP.fn.aggrSelectPopup(l_cdata, ls_tree, lf_aggrPopup_cb);
            return;
        }

        //aggregation 선택 팝업이 존재하지 않는경우 js load후 호출.
        oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
            oAPP.fn.aggrSelectPopup(l_cdata, ls_tree, lf_aggrPopup_cb);
        });


    };  //context menu ui 붙여넣기 처리.




    //ui 사용처 리스트 메뉴.
    oAPP.fn.contextMenuUiWhereUse = function(){

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");
        
        //DOCUMENT영역에 PASTE한경우 EXIT.
        if(l_OBJID === "ROOT"){
            return;
        }

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //aggregation 선택 팝업 호출.
        if(typeof oAPP.fn.callUiWhereUsePopup !== "undefined"){

            oAPP.fn.callUiWhereUsePopup(ls_tree);
            return;
        }

        //aggregation 선택 팝업이 존재하지 않는경우 js load후 호출.
        oAPP.fn.getScript("design/js/callUiWhereUsePopup",function(){
            oAPP.fn.callUiWhereUsePopup(ls_tree);
        });

    };  //ui 사용처 리스트 메뉴.


})();