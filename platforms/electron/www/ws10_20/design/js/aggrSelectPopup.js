(function(){

/*********************************************************
 * @function - AGGREGATION 선택 팝업.
 * @params i_drag     - 이동하고자 하는 UI의 라인 정보.
 * @params i_drop     - 이동 대상 부모 UI의 라인 정보.
 * @params retfunc    - AGGREGATION 정보가 1건만 존재하거나,
 *                      AGGREGATION을 선택 했을 경우 callback function.
 * @params i_x        - AGGREGATION 팝업을 호출할 x축 좌표(숫자값)
 * @params i_y        - AGGREGATION 팝업을 호출할 y축 좌표(숫자값)
 * @params cancelFunc - 선택할 aggregation이 존재하지 않거나, 
 *                      팝업에서 aggregation을 선택하지 않고
 *                      종료 처리 했을경우 호출하는 callback function.
 *                      (RCODE 01 : aggregation을 선택하지 않고 종료 
 *                       RCODE 02 : 선택할 aggregation이 존재하지 않음)
 ********************************************************/
  
  //AGGREGATION 선택 팝업.
  oAPP.fn.aggrSelectPopup = function(i_drag, i_drop, retfunc, i_x, i_y, cancelFunc){

    //입력 UI의 UI 가능 AGGREGATION 정보 얻기.
    var lt_sel = oAPP.fn.chkAggrRelation(i_drop.UIOBK, i_drop.OBJID, i_drag.UIOBK);
    

    //선택가능 aggregation리스트가 존재하지 않는경우, drag, drop의 부모, aggregation이 동일한경우.
    if(lt_sel.length === 0 && i_drag.POBID === i_drop.POBID && i_drag.UIATK === i_drop.UIATK ){
      retfunc(undefined, i_drag, i_drop);
      return;
    }

    //선택가능 aggregation리스트가 존재하지 않는경우.
    if(lt_sel.length === 0){

      delete i_drop?.dropLineInfo;


      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";

      
      //20250702 PES -START.
      //aggr 선택 팝업에서 취소를 통해 종료 처리시, 
      //취소 callback function을 지정한 경우 function 호출 처리.
      if(typeof cancelFunc === "function"){

        var _sRes = {};
        _sRes.RETCD = "E";

        //RCODE 02 : 선택할 aggregation이 존재하지 않음
        _sRes.RCODE = "02";

        //262	이동 가능한 aggregation이 존재하지 않습니다.
        _sRes.RTMSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "262", "", "", "", "");

        //취소 callback function 호출.
        cancelFunc(_sRes);

        return;

      }
      //20250702 PES -END.

      //오류 메시지 출력.
      //262	이동 가능한 aggregation이 존재하지 않습니다.
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "262", "", "", "", ""));

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제 처리.
      oAPP.fn.setShortcutLock(false);

      parent.setBusy("");

      return;
    }

    //선택 가능한 aggregation이 1건인경우 해당 aggregation return.
    if(lt_sel.length === 1){
      retfunc(lt_sel[0], i_drag, i_drop);
      return;
    }


    sap.ui.getCore().loadLibrary("sap.m");
    var oDlg1 = new sap.m.Dialog({
      draggable:true,
      //20250702 PES -START.
      escapeHandler : function(oEvent){
        
        //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
        oAPP.attr.ui.oLTree1.__dropEffect = "";

        //esc키를 통해 aggregation 선택 팝업 종료 처리.
        oEvent.resolve();

        //aggr 선택 팝업에서 취소를 통해 종료 처리시, 
        //취소 callback function을 지정한 경우 function 호출 처리.
        if(typeof cancelFunc === "undefined"){
          return;
        }

        var _sRes = {};
        _sRes.RETCD = "E";
        
        //RCODE 01 : aggregation을 선택하지 않고 종료.
        _sRes.RCODE = "01";
        
        //001	Cancel operation
        _sRes.RTMSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", "");

        //취소 callback function 호출.
        cancelFunc(_sRes);

      },
      //20250702 PES -END.
      afterClose: function(){

        delete i_drop?.dropLineInfo;

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제 처리.
        oAPP.fn.setShortcutLock(false);

        oDlg1.destroy();
        
      }
    });
    oDlg1.addStyleClass("sapUiSizeCompact");

    
    //DIALOG OPEN전 이벤트.
    oDlg1.attachBeforeOpen(function(oEvent){
      
      //X, Y 좌표값이 존재하지 않는경우 EXIT.
      if(typeof i_x === "undefined"){return;}
      if(typeof i_y === "undefined"){return;}

      
      //팝업 호출전 모달 해제.
      //insert ui 팝업에서 D&D를 통해 UI를 추가하는 과정에서 modal 여부를 변경하기에
      //aggregation 선택팝업이 호출될때 최상위가 되기위해 modal을 재설정함.
      //(aggregation 선택 팝업의 DDLB를 펼쳐지지 않는문제 해결을위함)
      if(this.oPopup){
        this.oPopup.setModal(false);
      }

      
      //20240726 PES -START.
      //y축 좌표값이 window height 끝에 근접한경우.
      if(window.innerHeight - i_y < 200){
        //y축 좌표값 보정 처리.
        i_y = window.innerHeight - 200;
      }

      //x축 좌표값이 window width 끝에 근접한경우.
      if(window.innerWidth - i_x < 400){
        //x축 좌표값 보정 처리.
        i_x = window.innerWidth - 400;
      }

      //20240726 PES -END.


      //x, y 좌표에 의해 dialog 위치를 변경하기 위한 처리.
      this._bDisableRepositioning = true;    
      this._oManuallySetPosition = {x:i_x, y:i_y};
      this.oPopup.setPosition("begin top", {top:i_x, left:i_y}, oAPP.attr.ui.oLTree1, "0 0");

    }); //DIALOG OPEN전 이벤트.

    //dialog open 이후 이벤트.
    oDlg1.attachAfterOpen(function(){
      
      //X, Y 좌표값이 존재하지 않는경우 EXIT.
      if(typeof i_x === "undefined"){
        parent.setBusy("");

        oSel1.focus();

        return;
      }


      if(typeof i_y === "undefined"){

        parent.setBusy("");

        oSel1.focus();

        return;
      
      }

      //팝업 호출전 모달 재설정.
      //insert ui 팝업에서 D&D를 통해 UI를 추가하는 과정에서 modal 여부를 변경하기에
      //aggregation 선택팝업이 호출될때 최상위가 되기위해 modal을 재설정함.
      //(aggregation 선택 팝업의 DDLB를 펼쳐지지 않는문제 해결을위함)
      if(this.oPopup){
        this.oPopup.setModal(true);
      }

      parent.setBusy("");

      oSel1.focus();

    });

    var oMdl = new sap.ui.model.json.JSONModel();
    oDlg1.setModel(oMdl);

    oMdl.setData({"T_SEL":lt_sel});

    var oTool = new sap.m.Toolbar();
    oDlg1.setCustomHeader(oTool);

    //A38	Aggregation List
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A38", "", "", "", "") + " - " + i_drop.OBJID;

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
      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";

      //20250702 PES -START.
      //aggr 선택 팝업에서 취소를 통해 종료 처리시, 
      //취소 callback function을 지정한 경우 function 호출 처리.
      if(typeof cancelFunc === "function"){

        oDlg1.close();
        
        var _sRes = {};
        _sRes.RETCD = "E";
        
        //RCODE 01 : aggregation을 선택하지 않고 종료 
        _sRes.RCODE = "01";

        //001	Cancel operation
        _sRes.RTMSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", "");

        //취소 callback function 호출.
        cancelFunc(_sRes);

        return;

      }
      //20250702 PES -END.

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");


      //단축키 잠금 해제처리.
      oAPP.fn.setShortcutLock(false);
      
      oDlg1.close();
      // oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));


    });

    
    //aggregation ddlb 구성.
    var oSel1 = new sap.m.Select({width:"100%"});

    var oItm1 = new sap.ui.core.Item({key:"{UIATK}", text:"{UIATT}"});
    oSel1.bindAggregation("items", {path:"/T_SEL", template:oItm1});
    
    oDlg1.addContent(oSel1);

    oSel1.setSelectedIndex(0);

    //aggr ddlb 선택시
    oSel1.attachChange(function(){
      //확인 버튼으로 focus 처리.
      oBtn1.focus();
    });


    //A40	Confirm
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A40", "", "", "", "");

    //확인버튼
    var oBtn1 = new sap.m.Button({icon: "sap-icon://accept", text:l_txt, type:"Accept", tooltip:l_txt});
    oDlg1.addButton(oBtn1);

    oBtn1.attachPress(function(){

      parent.setBusy("X");

      document.activeElement.blur();
      
      var _sOption = JSON.parse(JSON.stringify(oAPP.oDesign.types.TY_BUSY_OPTION));

      //208	디자인 화면에서 UI 변경 작업을 진행하고 있습니다.
      _sOption.DESC = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "208");

      //WS 20 -> 바인딩 팝업 BUSY ON 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_ON", _sOption);

      var l_sel = oSel1.getSelectedKey();

      ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_sel);
      if(!ls_0023){

        //치명적 오류 처리!!!!!!!!!

        //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
        parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

        //단축키 잠금 해제처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");

        return;
      }

      oDlg1.close();
      oDlg1.destroy();

      retfunc(ls_0023, i_drag, i_drop);

    });


    //A41	Cancel
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "");

    //닫기버튼
    var oBtn2 = new sap.m.Button({icon: "sap-icon://decline", text:l_txt, type: "Reject", tooltip:l_txt});
    oDlg1.addButton(oBtn2);

    //닫기버튼 이벤트
    oBtn2.attachPress(function(){

      //tree drop effect 초기화 처리(ctrl 누르고 drop시 복사를 위한 광역변수값).
      oAPP.attr.ui.oLTree1.__dropEffect = "";

      //20250702 PES -START.
      //aggr 선택 팝업에서 취소를 통해 종료 처리시, 
      //취소 callback function을 지정한 경우 function 호출 처리.
      if(typeof cancelFunc === "function"){

        oDlg1.close();

        var _sRes = {};
        _sRes.RETCD = "E";
        
        //RCODE 01 : aggregation을 선택하지 않고 종료 
        _sRes.RCODE = "01";

        //001	Cancel operation
        _sRes.RTMSG = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", "");

        //취소 callback function 호출.
        cancelFunc(_sRes);

        return;

      }
      //20250702 PES -END.

      //WS 20 -> 바인딩 팝업 BUSY OFF 요청 처리.
      parent.require(oAPP.oDesign.pathInfo.bindPopupBroadCast)("BUSY_OFF");

      //단축키 잠금 해제처리.
      oAPP.fn.setShortcutLock(false);

      oDlg1.close();
      // oDlg1.destroy();
      //001	Cancel operation
      parent.showMessage(sap,10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));


    });


    oDlg1.setInitialFocus(oSel1);

    oDlg1.open();
        

  };  //AGGREGATION 선택 팝업.

})();
