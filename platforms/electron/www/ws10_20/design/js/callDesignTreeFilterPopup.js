(function(){

    //design tree 필터 처리 팝업.
    oAPP.fn.callDesignTreeFilterPopup = function(oUi){

        var oPop = new sap.m.ResponsivePopover({showHeader:false, placement:"Auto", contentWidth:"300px"});

        //팝업 호출후 이벤트.
        oPop.attachAfterOpen(function(){
            //팝업 호출 후 검색조건 필드에 포커스 처리.
            oInp.focus();

        }); //팝업 호출후 이벤트.
        

        //294	Please enter search criteria.
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "294", "", "", "", "");
        //필터 검색조건 필드.

        var oInp = new sap.m.Input({placeholder:l_txt, tooltip:l_txt, showClearIcon : true});
        oPop.addContent(oInp);

        //필터 엔터 이벤트.
        oInp.attachSubmit(function(){
            //입력된 값으로 design tree 필터 처리.
            oAPP.fn.designSetFilter(this.getValue());

        }); //필터 엔터 이벤트.
        

        var oHbox = new sap.m.HBox({width:"100%", renderType:"Bare"});
        oPop.addContent(oHbox);

        //A68	Filter Value
        //필터 검색 버튼.
        var oBtn1 = new sap.m.Button({icon:"sap-icon://accept", type:"Accept", width:"100%", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A68", "", "", "", "")});
        oHbox.addItem(oBtn1);

        //필터 검색 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //입력된 값으로 design tree 필터 처리.
            oAPP.fn.designSetFilter(oInp.getValue());

        }); //필터 검색 버튼 선택 이벤트.


        //A69	Clear Filter
        //필터 초기화 버튼.
        var oBtn2 = new sap.m.Button({icon:"sap-icon://refresh", type:"Neutral", width:"100%", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A69", "", "", "", "")});
        oHbox.addItem(oBtn2);

        //필터 검색 초기화 버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            //design tree 필터 해제 처리.
            oAPP.fn.designSetFilter("");

        }); //필터 검색 초기화 버튼 선택 이벤트.


        //팝업 호출 처리.
        oPop.openBy(oUi);

    };  //design tree 필터 처리 팝업.


})();