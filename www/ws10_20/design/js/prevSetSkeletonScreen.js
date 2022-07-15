(function(){

    //Skeleton Screen 사용 팝업.
    oAPP.fn.prevSetSkeletonScreen.oppner = function(){

        //dialog UI.
        var oDlg = new sap.m.Dialog({draggable:true,
            icon:"sap-icon://add-document",
            contentWidth:"30%"});

        //dialog open전 이벤트.
        oDlg.attachBeforeOpen(function(){
            //화면 출력 정보 구성.
            lf_getSkeletonData(oModel);
        });

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);


        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);

        var oTitle = new sap.m.Title({text:"Skeleton Screen Configration"});

        oTool.addContent(oTitle);

        oTool.addContent(new sap.m.ToolbarSpacer());

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip: "Close"});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            oDlg.close();
        });

        var oForm = new sap.ui.layout.form.Form({
            editable:true,
            layout: new sap.ui.layout.form.ResponsiveGridLayout({labelSpanM:3})
        });
        oDlg.addContent(oForm);
        
        var oFmCont = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oFmCont);

        var l_txt = "Based on the current preview screen layout" + 
                    "Do you want to set it to Skeleton Screen ?";

        //설명.
        var oFmElem0 = new sap.ui.layout.form.FormElement({
            //label : new sap.m.Label(),
            fields : new sap.m.Text({text:l_txt})
        });
        oFmCont.addFormElement(oFmElem0);
        


        //skeleton 영역부터 wait 사용할지 여부.
        var oFmElem1 = new sap.ui.layout.form.FormElement({
            label : new sap.m.Label({design:"Bold",text:"waiting mode effect"})
        });
        oFmCont.addFormElement(oFmElem1);
        
        //skeleton 영역부터 wait 사용할지 여부 checkbox.
        var oFmChk1 = new sap.m.CheckBox({selected:"{/opt/OPT_IS_WAIT}"});
        oFmElem1.addField(oFmChk1);

          
        //흐리기 효과.
        var oFmElem2 = new sap.ui.layout.form.FormElement({
        label : new sap.m.Label({design:"Bold",text:"Use of glass"})
        });
        oFmCont.addFormElement(oFmElem2);
        
        //흐리기 효과 사용여부 checkbox.
        var oFmChk2 = new sap.m.CheckBox({selected:"{/opt/OPT_USE_GLASS}"});
        oFmElem2.addField(oFmChk2);
                                    
          
        //흐리기 정도.
        var oFmElem3 = new sap.ui.layout.form.FormElement({
            label : new sap.m.Label({design:"Bold",text:"glass concentration"})
        });

        oFmCont.addFormElement(oFmElem3);

        //흐리기정도 입력필드.
        var oStep = new sap.m.StepInput({step:0.1, displayValuePrecision:1,value:"{/opt/OPT_GLASS_DENSITY}"});
        oFmElem3.addField(oStep);

    
        l_txt = "Glass Concentration ?\n" + 
                "I mean transparency in the skeleton screen\n" +
                "Examples of values are 0.0 to 100.0\n" +
                "Higher values make it blurry.\n" +
                "(Only one digit is allowed for the source point)";
        

        //설명.
        var oFmElem3 = new sap.ui.layout.form.FormElement({
            label : new sap.m.Label(),
            fields : new sap.m.Text({text:l_txt})
        });

        oFmCont.addFormElement(oFmElem3);


        //skeleton 설정 버튼
        var oBtn1 = new sap.m.Button({type:"Accept",icon:"sap-icon://accept", tooltip: "Apply setting"});
        oDlg.addButton(oBtn1);

        //skeleton 설정 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            lf_setSkeletonData(oModel, oDlg);
        });
        
        //팝업 종료 버튼.
        var oBtn2 = new sap.m.Button({type:"Reject",icon:"sap-icon://decline", tooltip: "Close"});
        oDlg.addButton(oBtn2);

        //팝업 종료 버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            oDlg.close();
        });

        //팝업 호출.
        oDlg.open();


    };  //Skeleton Screen 사용 팝업.




    //화면 출력 정보 구성.
    function lf_getSkeletonData(oModel){

        var ls_opt = {};

        //waiting mode effect
        ls_opt.OPT_IS_WAIT = false;

        //Use of glass
        ls_opt.OPT_USE_GLASS = false;

        //Glass concentration
        ls_opt.OPT_GLASS_DENSITY = 0;

        //이전 Skeleton 세팅정보가 존재하지 않는경우.
        if(oAPP.DATA.APPDATA.T_SKLE.length === 0){
            //default 정보 바인딩 후 exit.
            oModel.setData({opt:ls_opt});
            return;
        }

        //waiting mode effect
        var l_find = oAPP.DATA.APPDATA.T_SKLE.find( a => a.NAME === "OPT_IS_WAIT" );
        if(l_find && l_find.VALUE === "X"){
            ls_opt.OPT_IS_WAIT = true;
        }


        //Use of glass
        var l_find = oAPP.DATA.APPDATA.T_SKLE.find( a => a.NAME === "OPT_USE_GLASS" );
        if(l_find && l_find.VALUE === "X"){
            ls_opt.OPT_USE_GLASS = true;
        }

        //Glass concentration
        var l_find = oAPP.DATA.APPDATA.T_SKLE.find( a => a.NAME === "OPT_GLASS_DENSITY" );
        if(l_find){
            ls_opt.OPT_GLASS_DENSITY = parseFloat(l_find.VALUE);
        }

        //구성된 정보 바인딩 처리.
        oModel.setData({opt:ls_opt});

    }   //화면 출력 정보 구성.




    //화면에서 선택한 정보를 기준으로 skeleton 저장정보 구성.
    function lf_setSkeletonData(oModel, oDlg){
        
        var l_msg = "현재 미리보기 화면 레이아웃 기준으로 Skeleton Screen 으로 설정 하시겠습니까?";

        //설정전 확인 팝업 호출.
        parent.showMessage(sap, 30, "I", l_msg, function(param){

            //YES를 선택하지 않은경우 EXIT.
            if(param !== "YES"){return;}

            var ls_opt = {};

            //waiting mode effect
            ls_opt.OPT_IS_WAIT = "";

            if(oModel.oData.opt.OPT_IS_WAIT === true){
                ls_opt.OPT_IS_WAIT = "X";
            }

            //Use of glass
            ls_opt.OPT_USE_GLASS = "";

            if(oModel.oData.opt.OPT_USE_GLASS === true){
                ls_opt.OPT_USE_GLASS = "X";
            }

            //Glass concentration
            ls_opt.OPT_GLASS_DENSITY = oModel.oData.opt.OPT_GLASS_DENSITY;

            //현재 출력된 미리보기 화면 기준 Skeleton Screen 저장 정보 구성.
            oAPP.DATA.APPDATA.T_SKLE = oAPP.attr.ui.frame.contentWindow._get_skeleton_tag_info(ls_opt);

            //005	Job finished.
            parent.showMessage(sap, 10, "S","Job finished.");

            //변경 flag 처리.
            oAPP.fn.setChangeFlag();

            //팝업 종료 처리.
            oDlg.close();

        }); //설정전 확인 팝업 호출.


    }   //화면에서 선택한 정보를 기준으로 skeleton 저장정보 구성.

})();