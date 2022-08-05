(function(){

    //design tree 필터 처리 팝업.
    oAPP.fn.callDesignTreeFilterPopup = function(oUi){

        var oPop = new sap.m.ResponsivePopover({showHeader:false});

        //팝업 호출후 이벤트.
        oPop.attachAfterOpen(function(){
            //팝업 호출 후 검색조건 필드에 포커스 처리.
            oInp.focus();

        }); //팝업 호출후 이벤트.
        

        //필터 검색조건 필드.
        var oInp = new sap.m.Input({placeholder:"Please enter search criteria."});
        oPop.addContent(oInp);

        //필터 엔터 이벤트.
        oInp.attachSubmit(function(){
            //입력된 값으로 design tree 필터 처리.
            oAPP.fn.designSetFilter(this.getValue());

        }); //필터 엔터 이벤트.
        

        var oHbox = new sap.m.HBox({width:"100%", renderType:"Bare"});
        oPop.addContent(oHbox);

        //필터 검색 버튼.
        var oBtn1 = new sap.m.Button({icon:"sap-icon://accept", type:"Accept", width:"100%", tooltip:"Filter Value"});
        oHbox.addItem(oBtn1);

        //필터 검색 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //입력된 값으로 design tree 필터 처리.
            oAPP.fn.designSetFilter(oInp.getValue());

        }); //필터 검색 버튼 선택 이벤트.


        //필터 초기화 버튼.
        var oBtn2 = new sap.m.Button({icon:"sap-icon://refresh", type:"Neutral", width:"100%", tooltip:"Filter Clear"});
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