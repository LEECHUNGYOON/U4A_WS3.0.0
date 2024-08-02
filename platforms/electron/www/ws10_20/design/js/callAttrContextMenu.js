(function(){

    //attribute 영역의 context menu 생성 처리.
    oAPP.fn.callAttrContextMenu = function(){

        //MENU UI생성.
        var oMenu1 = new sap.m.Menu();

        oMenu1.addStyleClass("sapUiSizeCozy");

        var oModel = new sap.ui.model.json.JSONModel();      

        //context menu popover에 모델 설정.
        oMenu1.setModel(oModel);

        //menu item 선택 이벤트.
        oMenu1.attachItemSelected(function(oEvent){

            parent.setBusy("X");
      
            //단축키 잠금 처리.
            oAPP.fn.setShortcutLock(true);

            
            var _oUi = oEvent?.oSource;

            if(typeof _oUi === "undefined" || _oUi === null){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return;

            }


            if(typeof oEvent?.mParameters?.item?.getKey !== "function"){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return;
            }


            var _key = oEvent?.mParameters?.item?.getKey();
            
            //메뉴 item선택건에 따른 기능 분기 처리.
            oAPP.fn.attrCtxtMenuItemPress(_oUi, _key);

            this.close();

        }); //menu item 선택 이벤트.


        //CONTEXT MENU 선택한 ATTRIBUTE 명
        var oMItem0 = new sap.m.MenuItem({key:"M00", icon:"sap-icon://menu2", text:"{/atmenu/UIATT}", enabled:false, startsSection:true});
        oMenu1.addItem(oMItem0);


        //A42	Turn on or off WAIT mode
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A42", "", "", "", "");

        //wait off 처리
        var oMItem1 = new sap.m.MenuItem({key:"M01", icon:"sap-icon://lateness", text:l_txt, tooltip:l_txt, visible:"{/atmenu/vis01}", startsSection:true});
        oMenu1.addItem(oMItem1);


        //A43	Unbind
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A43", "", "", "", "");

        //unbind 처리
        var oMItem2 = new sap.m.MenuItem({key:"M02", icon:"sap-icon://disconnected", text:l_txt + "　　　　　　　", tooltip:l_txt, visible:"{/atmenu/vis02}", startsSection:true});
        oMenu1.addItem(oMItem2);


        //A44	동일속성 프로퍼티 동기화 설정
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A44", "", "", "", "");

        //프로퍼티 동일 속성 동기화 처리
        var oMItem3 = new sap.m.MenuItem({key:"M03", icon:"sap-icon://paste", text:l_txt, tooltip:l_txt, visible:"{/atmenu/vis03}", startsSection:true});
        oMenu1.addItem(oMItem3);


        //A45	Remove Event JS Script
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A45", "", "", "", "");

        //클라이언트 이벤트 해제 처리
        var oMItem4 = new sap.m.MenuItem({key:"M04", icon:"sap-icon://delete", text:l_txt, tooltip:l_txt, visible:"{/atmenu/vis04}", startsSection:true});
        oMenu1.addItem(oMItem4);



        //생성한 menu UI return.
        return oMenu1;

    };  //attribute 영역의 context menu 생성 처리.




    //attribute 영역의 context menu 선택 이벤트
    oAPP.fn.attrCtxtMenuItemPress = function(oUi, key){

        //선택 menu key에따른 로직 분기.
        switch(key){
            case "M01": //wait off 처리.
                oAPP.fn.attrContextMenuWaitOnOff(oUi);
                break;
            
            case "M02": //unbind 처리.
                oAPP.fn.attrContextMenuUnbind(oUi);
                break;
            
            case "M03": //프로퍼티 동일 속성 동기화 처리.
                oAPP.fn.attrContextMenuSetSameAttr(oUi);
                break;
            
            case "M04": //클라이언트 이벤트 해제 처리.
                oAPP.fn.attrContextMenuRemoveClientEvent(oUi);
                break;

            default:
                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");

                return;

        }   //선택 menu key에따른 로직 분기.

    };  //attribute 영역의 context menu 선택 이벤트





    //attribute의 context menu 활성여부 설정.
    oAPP.fn.attrSetContextMenu = function(oMenu, is_attr, sKey){

        var ls_menu = {};

        var oModel = oMenu.getModel();

        //context menu 호출한 attribute명.
        ls_menu.UIATT = is_attr.UIATT;

        ls_menu.vis01 = false;  //wait off 처리
        ls_menu.vis02 = false;  //unbind 처리
        ls_menu.vis03 = false;  //프로퍼티 동일 속성 동기화 처리
        ls_menu.vis04 = false;  //클라이언트 이벤트 해제 처리

        //CONTEXT MENU 호출처에 따른 로직 분기.
        switch (sKey) {
            case "AT01":
                //ui attribute text 에서 context 메뉴 호출한 경우.
                
                //이벤트가 아닌경우 exit.
                if(is_attr.UIATY !== "2"){
                    return true;
                }

                //해당 라인이 편집 가능한 상태가 아닌경우 exit.
                if(is_attr.edit !== true){
                    return true;
                }

                //ATTRIBUTE TYPE이 이벤트인경우.
                if(is_attr.UIATY === "2"){
                    //WAIT MODE ON/OFF 활성화 처리.
                    ls_menu.vis01 = true;
                }

                break;
            
            case "AT02":
                //프로퍼티, 이벤트 aggregation 입력란에서 context 메뉴 호출한 경우.

                //프로퍼티, aggregation이 아닌경우 exit.
                if(is_attr.UIATY !== "1" && is_attr.UIATY !== "3"){
                    return true;
                }

                //ATTRIBUTE TYPE이 프로퍼티이면서 바인딩 처리가 안된경우.
                if(is_attr.UIATY === "1" && is_attr.ISBND === ""){
                    //프로퍼티 동일 속성 동기화 메뉴 활성화 처리.

                    //프로퍼티 정보 검색.
                    var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === is_attr.UIATK );

                    //extand 프로퍼티인경우 exit.
                    if(ls_0023 && ls_0023.ISEXT === "X"){
                        return true;
                    }

                    ls_menu.vis03 = true;

                    
                }else if(is_attr.UIATY === "1" && is_attr.ISBND === "X"){
                    //ATTRIBUTE TYPE이 프로퍼티이면서 바인딩 처리건인경우.

                    //unbind 메뉴 활성화 처리.
                    ls_menu.vis02 = true; 

                }else if(is_attr.UIATY === "3" && is_attr.ISBND === "X"){
                    //ATTRIBUTE TYPE이 프로퍼티이면서 바인딩 처리건인경우.

                    //unbind 메뉴 활성화 처리.
                    ls_menu.vis02 = true;  

                }
            
                break;

            case "AT03":
                //바인딩아이콘(서버이벤트 아이콘)에서 context menu 호출한 경우.

                return true;        
                

            case "AT04":
                //document help(클라이언트 이벤트)에서 context menu 호출한 경우.
                
                //프로퍼티, 이벤트가 아닌경우 exit.
                if(is_attr.UIATY !== "1" && is_attr.UIATY !== "2"){
                    return true;
                }
                
                var l_OBJTY = "JS";

                if(is_attr.UIATK === "AT000011858"){
                    l_OBJTY = "HM";
                }

                //입력한 클라이언트 이벤트 정보 검색.
                var l_index = oAPP.DATA.APPDATA.T_CEVT.findIndex( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === l_OBJTY );

                //클라이언트 이벤트가 존재하지 않는경우 EXIT.
                if(l_index === -1){
                    return true;
                }

                
                //클라이언트 이벤트가 존재하는경우.
                if(l_index !== -1){
                    //클라이언트 이벤트 해제 메뉴 활성화 처리.
                    ls_menu.vis04 = true;  
                }

                break;

            default:
                return true;

        }   //CONTEXT MENU 호출처에 따른 로직 분기.

        
        //모델 바인딩 처리.
        oModel.setData({atmenu:ls_menu, attr: is_attr});


    };  //attribute의 context menu 활성여부 설정.




    //이벤트의 WAIT ON/OFF 메뉴 선택 처리.
    oAPP.fn.attrContextMenuWaitOnOff = function(oMenu){

        var oModel = oMenu.getModel();
        if(!oModel){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //이벤트 발생 attribute 라인 정보 얻기.
        var ls_attr = oModel.getProperty("/attr");


        //WAIT OFF 사용 여부에 따른 분기.
        switch (ls_attr.ISWIT) {
            case "X":   //기존 WAIT OFF 사용처리인경우.
                //WAIT OFF 사용 해제.
                ls_attr.ISWIT = "";
                break;
            
            case "":    //기존 WAIT OFF 미사용인경우.
                //WAIT OFF 사용 처리.
                ls_attr.ISWIT = "X";
        
            default:
                break;
        }

        //ATTRIBUTE 변경 후속 처리.
        oAPP.fn.attrChange(ls_attr);


    };  //이벤트의 WAIT ON/OFF 메뉴 선택 처리.




    //property, aggregation의 unbind 처리.
    oAPP.fn.attrContextMenuUnbind = function(oMenu){

        var oModel = oMenu.getModel();
        if(!oModel){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");
            return;
        }

        //이벤트 발생 attribute 라인 정보 얻기.
        var ls_attr = oModel.getProperty("/attr");

        //UNBIND 처리여부 확인 팝업 호출.
        //263	Do you want to continue unbind?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "263", "", "", "", ""),function(param){

            parent.setBusy("X");

            //YES를 선택하지 않은경우 EXIT.
            if(param !== "YES"){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");
                return;
            }

            //프로퍼티인경우.
            if(ls_attr.UIATY ==="1"){
                //unbind 처리.
                oAPP.fn.attrSetUnbindProp(ls_attr);

                //005	Job finished.
                parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));

                return;
            }

            //AGGREGATION인경우.
            if(ls_attr.UIATY ==="3"){
                //unbind 처리.
                oAPP.fn.attrUnbindAggr(oAPP.attr.prev[ls_attr.OBJID], ls_attr.UIATT, ls_attr.UIATV);

                //변경건 대한 후속 처리.
                oAPP.fn.attrSetUnbindProp(ls_attr);

                //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                oAPP.fn.attrUnbindTree(ls_attr);

                //005 Job finished.
                parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));
                
            }

        }); //UNBIND 처리여부 확인 팝업 호출.

        parent.setBusy("");

    };  //property, aggregation의 unbind 처리.




    //클라이언트 이벤트 해제 처리.
    oAPP.fn.attrContextMenuRemoveClientEvent = function(oMenu){

        var oModel = oMenu.getModel();
        if(!oModel){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //이벤트 발생 attribute 라인 정보 얻기.
        var ls_attr = oModel.getProperty("/attr");

        
        //클라이언트 이벤트 삭제전 확인 팝업 호출.
        //264	Remove Event Javascript source?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "264", "", "", "", ""),function(param){
            
            parent.setBusy("X");

            //YES를 선택하지 않은경우 EXIT.
            if(param !== "YES"){

                //단축키 잠금 해제처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");
                return;
            }

            var l_OBJTY = "JS";

            //sap.ui.core.HTML UI의 content 프로퍼티인경우.
            if(ls_attr.UIATK === "AT000011858"){
                l_OBJTY = "HM";
            }

            //클라이언트 이벤트 삭제 처리.
            oAPP.fn.attrDelClientEvent(ls_attr, l_OBJTY);
            
            //js 설정됨 flag 제거 처리.
            ls_attr.ADDSC = "";

            //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
            oAPP.fn.attrChange(ls_attr, "", false, true);

            //005 Job finished.
            parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "005", "", "", "", ""));

        });

        parent.setBusy("");


    };  //클라이언트 이벤트 해제 처리.




    //프로퍼티 동일 속성 동기화 처리.
    oAPP.fn.attrContextMenuSetSameAttr = function(oMenu){

        //모델 정보 얻기.
        var oModel = oMenu.getModel();
        if(!oModel){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //이벤트 발생 attribute 라인 정보 얻기.
        var ls_attr = oModel.getProperty("/attr");


        if(typeof oAPP.fn.callSetSameAttrPopup !== "undefined"){
            //프로퍼티 동일 속성 동기화 처리 팝업 호출.
            oAPP.fn.callSetSameAttrPopup(ls_attr);
            return;
        }

        oAPP.fn.getScript("design/js/callSetSameAttrPopup",function(){
            //프로퍼티 동일 속성 동기화 처리 팝업 호출.
            oAPP.fn.callSetSameAttrPopup(ls_attr);
    
        });


    };  //프로퍼티 동일 속성 동기화 처리.


})();