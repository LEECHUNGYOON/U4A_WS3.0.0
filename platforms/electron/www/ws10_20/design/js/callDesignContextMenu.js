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

            parent.setBusy("X");
            
            //단축키 잠금 처리.
            oAPP.fn.setShortcutLock(true);

            //이벤트 발생 x, y 좌표값 얻기.
            var ls_pos = oAPP.fn.getMousePosition();

            //메뉴 item선택건에 따른 기능 분기 처리.
            oAPP.fn.contextMenuItemPress(oEvent, ls_pos.x, ls_pos.y);

            //메뉴 선택 후 popup종료 처리.
            oAPP.fn.contextMenuClosePopup(oMenu1);

        }); //menu item 선택 이벤트.


        //context menu 제목.
        var oMItem0 = new this.sap.m.MenuItem({key:"M00", icon:"sap-icon://menu2", 
            text:"{/lcmenu/title}", enabled:false});
        oMenu1.addItem(oMItem0);

        
        //A54	Insert Element
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A54", "", "", "", "");

        //UI 추가 메뉴
        var oMItem1 = new this.sap.m.MenuItem({key:"M01", icon:"sap-icon://add", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab01}", startsSection:true});
        oMenu1.addItem(oMItem1);


        //A03	Delete
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "");

        //UI 삭제 메뉴
        var oMItem2 = new this.sap.m.MenuItem({key:"M02", icon:"sap-icon://delete", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab02}"});
        oMenu1.addItem(oMItem2);

        
        //A55	Up
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A55", "", "", "", "");

        //UI up
        var oMItem3 = new this.sap.m.MenuItem({key:"M03", icon:"sap-icon://navigation-up-arrow", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab03}",startsSection:true});
        oMenu1.addItem(oMItem3);


        //A56	Down
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A56", "", "", "", "");

        //UI down
        var oMItem4 = new this.sap.m.MenuItem({key:"M04", icon:"sap-icon://navigation-down-arrow", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab04}"});
        oMenu1.addItem(oMItem4);


        //A57	Move Position
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A57", "", "", "", "");

        //UI move Position
        var oMItem5 = new this.sap.m.MenuItem({key:"M05", icon:"sap-icon://outdent", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab05}"});
        oMenu1.addItem(oMItem5);


        //A04	Copy
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A04", "", "", "", "");

        //copy 메뉴.
        var oMItem6 = new this.sap.m.MenuItem({key:"M06", icon:"sap-icon://copy", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab06}", startsSection:true});
        oMenu1.addItem(oMItem6);


        //A58	Paste
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A58", "", "", "", "");

        //paste 메뉴.
        var oMItem7 = new this.sap.m.MenuItem({key:"M07", icon:"sap-icon://paste", 
            text:l_txt, tooltip:l_txt, enabled:"{/lcmenu/enab07}"});
        oMenu1.addItem(oMItem7);


        //A59	UI Where use
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A59", "", "", "", "");
        
        //UI where use 메뉴.
        var oMItem8 = new this.sap.m.MenuItem({key:"M08", icon:"sap-icon://search", 
            text:l_txt, tooltip:l_txt, startsSection:true, enabled:"{/lcmenu/enab08}"});
        oMenu1.addItem(oMItem8);


        //E19  My Pattern
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E19", "", "", "", "");
        
        //UI 개인화 저장.
        var oMItem11 = new this.sap.m.MenuItem({key:"M11", icon:"sap-icon://save", 
            // visible:parent.REMOTE.app.isPackaged ? false : true,    //no build mode 일때만 활성화 처리(작업 완료후 해제 필요)
            text:l_txt, tooltip:l_txt, startsSection:true, enabled:"{/lcmenu/enab11}"});
        oMenu1.addItem(oMItem11);


        // //A60	Admin
        // var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A60", "", "", "", "");

        // //관리자 메뉴.
        // var oMItem9 = new this.sap.m.MenuItem({key:"M09", icon:"sap-icon://paste", 
        //     visible:parent.getUserInfo().ISADM === "X" ? true : false,  //admin인경우만 관리자 메뉴 활성화.
        //     text:l_txt, tooltip:l_txt, startsSection:true});
        // oMenu1.addItem(oMItem9);


        // //A61	Register Wizard Template
        // var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A61", "", "", "", "");

        // //관리자 서브 메뉴.
        // var oMItem10 = new this.sap.m.MenuItem({key:"M10", icon:"sap-icon://paste", 
        //     text:l_txt, tooltip:l_txt});
        // oMItem9.addItem(oMItem10);


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
    oAPP.fn.contextMenuItemPress = function(oEvent, i_x, i_y){
        
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
                oAPP.fn.contextMenuUiMovePosition(i_x, i_y);
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
            
            case "M11": //UI 개인화 저장.
                oAPP.fn.contextMenuP13nDesignPopup();
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
        ls_menu.enab11 = false;   //My Pattern(UI 개인화)default 불가.

        //ROOT(DOCUMENT)영역인경우 모든 CONTEXT MENU 비활성 처리.
        if(OBJID === "ROOT"){
            oModel.setProperty("/lcmenu", ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu", ls_menu);

            // //TREE ITEM 선택처리.
            // oAPP.fn.setSelectTreeItem(OBJID);
            return;
        }

        //ROOT가 아닌경우 EDIT 여부와 상관없이 UI WHERE USE 가능.
        ls_menu.enab08 = true; //UI where used 가능.

        //ROOT가 아닌경우 EDIT 여부와 상관없이 My Pattern(UI 개인화) 가능.
        ls_menu.enab11 = true;

        //edit 상태인경우.(APP에서 CONTEXT MENU호출건을 처리하기위함)
        if(oAPP.attr.oModel.oData.IS_EDIT === true){
            ls_menu.enab01 = true; //ui추가 가능

            //복사된건 history 존재여부에 따른 붙여넣기 메뉴 활성화 여부 설정.
            ls_menu.enab07 = oAPP.fn.isExistsCopyData("U4AWSuiDesignArea");

        }

        //APP에서 menu 호출한 경우 편집 여부에 따라 UI추가, UI붙여넣기 메뉴만 사용 가능.
        if(OBJID === "APP"){
            oModel.setProperty("/lcmenu", ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu", ls_menu);

            // //TREE ITEM 선택처리.
            // oAPP.fn.setSelectTreeItem(OBJID);
            return;
        }

        //DOCUMENT, APP가 아닌 영역에서 CONTEXT MENU 호출시 display 상태인경우 메뉴 비활성 처리.
        if(oAPP.attr.oModel.oData.IS_EDIT === false){
            ls_menu.enab06 = true; //copy 가능
            oModel.setProperty("/lcmenu", ls_menu);
            oAPP.attr.oModel.setProperty("/lcmenu", ls_menu);

            // //TREE ITEM 선택처리.
            // oAPP.fn.setSelectTreeItem(OBJID);
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
        oModel.setProperty("/lcmenu", ls_menu);
        oAPP.attr.oModel.setProperty("/lcmenu", ls_menu);

        // //context menu를 호출한 UI 선택 처리.
        // oAPP.fn.setSelectTreeItem(OBJID);

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
            parent.showMessage(sap, 10, "W", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "022", "", "", "", ""));

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
                parent.showMessage(sap, 10, "W", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "021", "", "", "", ""));

                //오류 flag return
                return true;

            }

        }

    };  //UI가 입력 가능한 카디널리티 여부 확인.

    
    //UI 추가 메뉴 선택 처리.
    oAPP.fn.contextMenuInsertUI = function(){
        
        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //ui 추가 처리.
        oAPP.fn.designUIAdd(ls_tree);
  
    };  //UI 추가 메뉴 선택 처리.



    //context menu UI삭제 메뉴 선택 이벤트.
    oAPP.fn.contextMenuDeleteUI = function(){

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //ui 삭제 처리.
        oAPP.fn.designUIDelete(ls_tree);  
  
    };  //contet menu UI삭제 메뉴 선택 이벤트.


    

    //ui 이동처리 function
    oAPP.fn.contextMenuUiMove = async function(sign, pos){

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

            var l_cnt = l_indx2;

            //부모 UI에 추가 불필요 대상 UI 정보 얻기.
            var lt_UA026 = oAPP.DATA.LIB.T_9011.filter( a => a.CATCD === "UA026" && a.FLD02 !== "X" );

            //같은 aggregation안에 있는 UI중 부모에 추가되지 않은 UI 존재 여부 확인.
            for(var i=0; i<l_indx2; i++){
                if(lt_UA026.findIndex( a => a.FLD01 === lt_filt[i].UILIB ) !== -1){
                    //부모에 추가되지 않은 UI인경우 PARENT.insertAggregation(UI, index) 처리할 index -1.
                    l_cnt -= 1;
                }

            }

            
            //UI 다시 생성 처리.
            oAPP.fn.reCreateUIOjInstance(ls_tree);


            //onAfterRendering 이벤트 등록 대상 UI 얻기.
            let _oTarget = oAPP.fn.getTargetAfterRenderingUI(oAPP.attr.prev[l_parent.OBJID]);
            
            let _oDom = _oTarget.getDomRef();
            
            let _oPromise = undefined;
            
            //대상 UI가 화면에 출력된경우 onAfterRendering 이벤트 등록.
            if(typeof _oDom !== "undefined" && _oDom !== null){
                _oPromise = oAPP.fn.setAfterRendering(_oTarget);
            }

            //RichTextEditor 미리보기 출력 예외처리로직.
            var _aPromise = oAPP.fn.renderingRichTextEditor(l_parent);

            //미리보기 갱신 처리.
            oAPP.attr.ui.frame.contentWindow.moveUIObjPreView(ls_tree.OBJID, ls_tree.UILIB, ls_tree.POBID, ls_tree.PUIOK, ls_tree.UIATT, l_cnt, ls_tree.ISMLB, ls_tree.UIOBK);

            //대상 UI가 화면에 출력되어 onAfterRendering 이벤트가 등록된 경우.
            if(typeof _oPromise !== "undefined"){
                _oTarget.invalidate();
                
                //onAfterRendering 수행까지 대기.
                await _oPromise;
            }


            //richtexteditor 미리보기 화면이 다시 그려질떄까지 대기.
            //(richtexteditor가 없다면 즉시 하위 로직 수행 처리됨)
            await Promise.all(_aPromise);

            //미리보기 ui 선택.
            //oAPP.attr.ui.frame.contentWindow.selPreviewUI(ls_tree.OBJID);

        }

        //design영역 tree item 선택 재선택 처리.
        await oAPP.fn.setSelectTreeItem(ls_tree.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();

        //20240621 pes.
        //바인딩 팝업의 디자인 영역 갱신처리.
        oAPP.fn.updateBindPopupDesignData();
 

    };  //ui 이동처리 function



    
    //UI 위치 이동 처리.
    oAPP.fn.contextMenuUiMovePosition = function(i_x, i_y){

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
            oAPP.fn.uiMovePosition(l_parent, ls_tree.OBJID, l_pos, l_parent.zTREE.length, lf_callback, i_x, i_y);
            return;

        }

        //UI위치 이동 function이 존재하지 않는경우 js 호출 후 function 호출.
        oAPP.fn.getScript("design/js/uiMovePosition",function(){
            oAPP.fn.uiMovePosition(l_parent, ls_tree.OBJID, l_pos, l_parent.zTREE.length, lf_callback, i_x, i_y);
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



        //화면 lock 처리.
        oAPP.fn.designAreaLockUnlock(true);

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);
        
        //DOCUMENT, APP에서 COPY한경우 EXIT.
        if(ls_tree.OBJID === "ROOT" || ls_tree.OBJID === "APP"){

            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);
            return;
        }

        //현재 라인에 해당하는 UI복사 처리.
        ls_tree = JSON.parse(JSON.stringify(ls_tree));

        ////TREE ITEM에 해당하는 UI의 ATTRIBUTE정보 매핑 처리.
        lf_setTreeItemAttr(ls_tree);

        //현재 라인 정보를 복사 처리.
        oAPP.fn.setCopyData("U4AWSuiDesignArea", ["U4AWSuiDesignArea"], ls_tree);


        parent.setBusy("");

        //화면 lock 해제 처리.
        oAPP.fn.designAreaLockUnlock(false);


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
        async function lf_paste_cb(param, i_cdata, bKeep){
            
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
            await oAPP.fn.setSelectTreeItem(ls_14.OBJID);

            //변경 FLAG 처리.
            oAPP.fn.setChangeFlag();


            //20240621 pes.
            //바인딩 팝업의 디자인 영역 갱신처리.
            oAPP.fn.updateBindPopupDesignData();


        } //붙여넣기 callback 이벤트.


        //붙여넣기 정보의 OTR ALIAS검색.
        function lf_getOTRtext(param, i_cdata, bKeep){

            //화면 잠금 처리.
            oAPP.fn.designAreaLockUnlock(true);
            
            //붙여넣기 처리하려는 정보의 OTR ALIAS 수집 처리.
            function lf_getOTRAlise(is_tree){
                //ATTR 정보가 존재하지 않는경우 EXIT.
                if(is_tree._T_0015.length === 0){return;}

                //ATTR 정보를 기준으로 OTR ALIAS 수집 처리.
                for(var i=0, l=is_tree._T_0015.length; i<l; i++){

                    //프로퍼티, 바인딩처리안됨, 입력값이 $OTR:로 시작함.
                    if(is_tree._T_0015[i].UIATY === "1" && 
                        is_tree._T_0015[i].ISBND !== "X" && 
                        is_tree._T_0015[i].UIATV.substr(0,5) === "$OTR:"){
                        
                        //ALIAS 정보 수집.
                        lt_alise.push(is_tree._T_0015[i].UIATV.substr(5));
                    }

                }

            }   //붙여넣기 처리하려는 정보의 OTR ALIAS 수집 처리.

            
            
            //TREE를 기준으로 하위를 탐색하며, OTR ALIAS정보 수집.
            function lf_getOTRAlisetree(is_tree){
                //CHILD가 존재하는경우 CHILD의 OTR ALIAS정보 수집을 위한 탐색.
                if(is_tree.zTREE.length.length !== 0){
                    for(var i=0, l=is_tree.zTREE.length; i<l; i++){
                        lf_getOTRAlisetree(is_tree.zTREE[i]);
                    }
                }

                //현재 TREE에 OTR정보가 존재하는지 수집 처리.
                lf_getOTRAlise(is_tree);

            }   //TREE를 기준으로 하위를 탐색하며, OTR ALIAS정보 수집.

            var lt_alise = [];

            //붙여넣기 정보에서 OTR ALIAS 수집.
            lf_getOTRAlisetree(i_cdata);

            //수집된 OTR ALIAS 정보가 없는경우 EXIT.
            if(lt_alise.length === 0){
                lf_paste_cb(param, i_cdata, bKeep);
                return;
            }
            

            var oFormData = new FormData();
            oFormData.append("ALIAS", JSON.stringify(lt_alise));

            //수집된 OTR ALIAS가 존재하는경우 서버에서 OTR ALIAS에 해당하는 TEXT 검색.
            sendAjax(oAPP.attr.servNm + "/getOTRTextsAlias", oFormData, function(oRet){

                //화면 잠금 처리.
                oAPP.fn.designAreaLockUnlock(true);


                if(oRet.RETCD === "E"){
                    //메시지 출력.
                    parent.showMessage(sap, 10, "W", oRet.RTMSG);
                    
                }

                //서버에서 구성한 OTR ALISE에 해당하는 TEXT 정보 매핑.
                oAPP.DATA.APPDATA.T_OTR = oRet.T_OTR;

                //복사된 정보  붙여넣기 처리.
                lf_paste_cb(param, i_cdata, bKeep);

            }, "X", true, "POST", function(e){
                //오류 발생시 lock 해제.
                oAPP.fn.designAreaLockUnlock();
              
            });  //수집된 OTR ALIAS가 존재하는경우 서버에서 OTR ALIAS에 해당하는 TEXT 검색.


        }   //붙여넣기 정보의 OTR ALIAS검색.


        //AGGR 선택 팝업의 CALLBACK FUNCTION.
        function lf_aggrPopup_cb(param, i_cdata){

            //화면 잠금 처리.
            oAPP.fn.designAreaLockUnlock(true);

            //이동 가능한 aggregation 정보가 존재하지 않는경우.
            if(typeof param === "undefined"){
                //오류 메시지 출력.
                //269	붙여넣기가 가능한 aggregation이 존재하지 않습니다.
                parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "269", "", "", "", ""));

                parent.setBusy("");

                //화면 unlock 처리.
                oAPP.fn.designAreaLockUnlock(false);
                return;
            }

            //UI가 입력 가능한 카디널리티 여부 확인.
            if(oAPP.fn.chkUiCardinality(ls_tree, param.UIATK, param.ISMLB) === true){
                parent.setBusy("");

                //화면 unlock 처리.
                oAPP.fn.designAreaLockUnlock(false);
                return;
            }

            //UI의 허용 가능 부모 정보
            //(특정 UI는 특정 부모에만 존재해야함.)
            if(oAPP.fn.designChkFixedParentUI(i_cdata.UIOBK, ls_tree.UIOBK, param.UIATT) === true){
                parent.setBusy("");

                //화면 unlock 처리.
                oAPP.fn.designAreaLockUnlock(false);
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
                //lf_paste_cb(param, i_cdata, false);
                lf_getOTRtext(param, i_cdata, false);
                return;
            }


            //trial 버전인경우.
            if(parent.getIsTrial()){
                //복사된 바인딩 정보, 서버이벤트 정보 제거 상태로 붙여넣기 처리.
                //lf_paste_cb(param, i_cdata, false);
                lf_getOTRtext(param, i_cdata, false);
                return;
            }
            
            //116	Copy and paste application is different.
            var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "116", "", "", "", "");

            //117	Do you want to keep the binding?.
            l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "117", "", "", "", "");

            parent.setBusy("");

            //lock 해제.
            oAPP.fn.designAreaLockUnlock();

            //단축키 잠금 처리.
            oAPP.fn.setShortcutLock(true);

            //복사한 UI의 APPLICATION이 현재 APPLICATION과 다른 경우.
            //바인딩, 서버이벤트 초기화 여부 확인 팝업 호출.
            parent.showMessage(sap, 40, "I", l_msg, function(oEvent){

                //화면 잠금 처리.
                oAPP.fn.designAreaLockUnlock(true);

                parent.setBusy("X");

                //취소를 한경우 exit.
                if(oEvent === "CANCEL" || oEvent === null){

                    parent.setBusy("");

                    //화면 잠금 해제 처리.
                    oAPP.fn.designAreaLockUnlock(false);
                    
                    return;
                }

                //default 바인딩, 서버이벤트 해제 처리.
                var l_flag = false;

                //바인딩, 서버이벤트를 유지하는경우.
                if(oEvent === "YES"){
                    l_flag = true;
                }

                //복사된 ui 붙여넣기 처리.
                //lf_paste_cb(param, i_cdata, l_flag);
                lf_getOTRtext(param, i_cdata, l_flag);

            }); //바인딩, 서버이벤트 초기화 여부 확인 팝업 호출.


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
                    var l_found = lf_chkBindNEvent(is_tree.zTREE[i]);

                    if(l_found){return true;}
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
            
            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);

            return;
        }

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");
        
        //DOCUMENT영역에 PASTE한경우 EXIT.
        if(l_OBJID === "ROOT"){
            
            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);

            return;
        }

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //붙여넣기 정보 얻기.
        var l_cpoied = oAPP.fn.getCopyData("U4AWSuiDesignArea");

        //붙여넣기 정보가 존재하지 않는경우.
        if(!l_cpoied){
            
            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);

            return;
        }

        //복사된 정보중 tree에 관련된 정보 발췌.
        var l_cdata = l_cpoied[0].DATA;


        //복사한 UI가 이미 존재하는경우 붙여넣기 skip 처리.(공통코드 UA039에 해당하는 UI는 APP당 1개만 존재 가능)
        if(oAPP.fn.designChkUnique(l_cdata.UIOBK) === true){
            
            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);

            return;
        }

        //U4A_HIDDEN_AREA DIV 영역에 추가대상 UI 정보 확인.(공통코드 UA040에 해당하는 UI는 특정 UI 하위에만 존재가능)
        if(oAPP.fn.designChkHiddenAreaUi(l_cdata.UIOBK, ls_tree.UIOBK) === true){
            
            parent.setBusy("");

            //화면 unlock 처리.
            oAPP.fn.designAreaLockUnlock(false);

            return;
        }

        
        //이벤트 발생 x, y 좌표값 얻기.
        var l_pos = oAPP.fn.getMousePosition();

        //aggregation 선택 팝업 호출.
        if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){
            oAPP.fn.aggrSelectPopup(l_cdata, ls_tree, lf_aggrPopup_cb, l_pos.x, l_pos.y);
            return;
        }

        //aggregation 선택 팝업이 존재하지 않는경우 js load후 호출.
        oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
            oAPP.fn.aggrSelectPopup(l_cdata, ls_tree, lf_aggrPopup_cb, l_pos.x, l_pos.y);
        });


    };  //context menu ui 붙여넣기 처리.




    //ui 사용처 리스트 메뉴.
    oAPP.fn.contextMenuUiWhereUse = function(){
        
        parent.setBusy("");

        //화면 unlock 처리.
        oAPP.fn.designAreaLockUnlock(false);

        //단축키 잠금 처리.
        oAPP.fn.setShortcutLock(true);

        //사용처 확인전 질문팝업 호출.
        //123 Do you want to continue?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", ""), function(param){

            //화면 lock 처리.
            oAPP.fn.designAreaLockUnlock(true);
            
            parent.setBusy("X");

            //YES를 선택하지 않은경우 EXIT.
            if(param !== "YES"){
                
                parent.setBusy("");
                
                //화면 unlock 처리.
                oAPP.fn.designAreaLockUnlock(false);
                return;
            }

            //context menu를 호출한 라인의 OBJID 얻기.
            var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");
            
            //DOCUMENT영역에 PASTE한경우 EXIT.
            if(l_OBJID === "ROOT"){

                parent.setBusy("");

                //화면 unlock 처리.
                oAPP.fn.designAreaLockUnlock(false);
                return;
            }

            //OBJID에 해당하는 TREE 정보 얻기.
            var ls_tree = oAPP.fn.getTreeData(l_OBJID);

            //ui 사용처 팝업 function이 존재하는경우 즉시 호출.
            if(typeof oAPP.fn.callUiWhereUsePopup !== "undefined"){
                oAPP.fn.callUiWhereUsePopup(ls_tree);
                return;
            }

            //ui 사용처 팝업 function이 존재하지 않는경우 js 로드 후 호출.
            oAPP.fn.getScript("design/js/callUiWhereUsePopup",function(){
                oAPP.fn.callUiWhereUsePopup(ls_tree);
            });

        });

    };  //ui 사용처 리스트 메뉴.




    //UI 개인화 저장 메뉴.
    oAPP.fn.contextMenuP13nDesignPopup = function(){

        //개인화 폴더명.
        const C_P13N = "p13n";

        //U4A 개인화 폴더명.
        const C_FOLDER = "U4A_UI_PATTERN";

        //개인화 파일명.
        const C_HEADER_FILE = "header.json";

        //SYSTEM ID.
        const C_SYSID = parent.getUserInfo().SYSID;


        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            try{
                parent.FS.mkdirSync(l_folderPath);
            }catch(e){
                parent.showMessage(sap, 10, "E", e);

                parent.setBusy("");

                oAPP.fn.setShortcutLock(false);

                return true;
            }
        }


        //U4A UI 개인화 폴더(시스템)path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            try{
                parent.FS.mkdirSync(l_folderPath);
            }catch(e){
                parent.showMessage(sap, 10, "E", e);

                parent.setBusy("");

                oAPP.fn.setShortcutLock(false);

                return true;
            }
        }

        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

        //개인화 파일이 header 존재하지 않는경우.
        if(!parent.FS.existsSync(l_filePath)){
                        
            try{
                //header 파일 생성 처리.
                parent.FS.writeFileSync(l_filePath, JSON.stringify([]));
            }catch(e){
                parent.showMessage(sap, 10, "E", e);

                parent.setBusy("");

                oAPP.fn.setShortcutLock(false);

                return true;
            }

        }

        var lockFile = parent.require("proper-lockfile");

        //HEADER 파일 PATH 구성.
        var l_path = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, C_HEADER_FILE);

        //이미 파일이 잠겨 있다면.
        if(lockFile.checkSync(l_path)){
            //382	Personalizing UI on other screens.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "382", "", "", "", ""));

            parent.setBusy("");

            oAPP.fn.setShortcutLock(false);

            return;

        }

        //context menu를 호출한 라인의 OBJID 얻기.
        var l_OBJID = oAPP.attr.oModel.getProperty("/lcmenu/OBJID");
            
        //DOCUMENT영역에 PASTE한경우 EXIT.
        if(l_OBJID === "ROOT"){
            
            parent.setBusy("");

            oAPP.fn.setShortcutLock(false);

            return;
        }

        //OBJID에 해당하는 TREE 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(l_OBJID);

        //UI 개인화 저장 팝업 function이 존재하는경우 즉시 호출.
        if(typeof oAPP.fn.callP13nDesignDataPopup !== "undefined"){
            oAPP.fn.callP13nDesignDataPopup("C", ls_tree);
            return;
        }

        //UI 개인화 저장 팝업 function이 존재하지 않는경우 js 로드 후 호출.
        oAPP.fn.getScript("design/js/callP13nDesignDataPopup",function(){
            oAPP.fn.callP13nDesignDataPopup("C", ls_tree);
        });


    };  //UI 개인화 저장 메뉴.

})();