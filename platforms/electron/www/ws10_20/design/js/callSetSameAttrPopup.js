(function(){

    //동일 ATTRIBUTE 동기화 처리 팝업.
    oAPP.fn.callSetSameAttrPopup = function(is_attr){
        
        var lt_list = [];

        //design에서 구성한 UI의 동일 ATTRIBUTE명 수집.
        setSameAttrData(oAPP.attr.oModel.oData.zTREE[0].zTREE, lt_list);

        //동일한 attribute 항목이 존재하지 않는경우.
        if(lt_list.length === 0){
            //메시지 처리.
            parent.showMessage(sap, 10, "W", "처리대상건이 존재하지 않습니다.");
            return;
        }


        //동일속성 동기화 처리 POPUP UI 생성. 
        var oDlg = new sap.m.Dialog({resizable:true, draggable:true, contentWidth:"60%",
            contentHeight:"60%",verticalScrolling:false});
        
        //모델 생성.
        var oMdl = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oMdl);

        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);

        oTool.addContent(new sap.m.Title({text:"Property replace all"}));

        oTool.addContent(new sap.m.ToolbarSpacer());

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject"});
        oTool.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){        
            //팝업 종료 처리.
            lf_close();

        });

        var oVbox1 = new sap.m.VBox({height:"100%",renderType:"Bare"});
        oDlg.addContent(oVbox1);


        jQuery.sap.require("sap.ui.layout.form.Form");
        var oForm = new sap.ui.layout.form.Form({editable:true});
        oVbox1.addItem(oForm);

        var oLay = new sap.ui.layout.form.ResponsiveGridLayout({adjustLabelSpan:false,
            singleContainerFullSize:false});
        oForm.setLayout(oLay);

        var oCont = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oCont);

        //ATTRIBUTE 명.
        var oElem1 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:"Attribute ID"})});
        oElem1.addField(new sap.m.Text({text:"{/UIATT}"}));
        oCont.addFormElement(oElem1);

        //ATTRIBUTE TYPE.
        var oElem2 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:"Attribute Type"})});
        oElem2.addField(new sap.m.Text({text:"{/UIADT}"}));
        oCont.addFormElement(oElem2);

        //해당 ATTRIBUTE의 입력값.
        var oElem3 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:"Change value"})});        
        oCont.addFormElement(oElem3);


        //동일속성 프로퍼티 출력 테이블.
        var oTab1 = new sap.ui.table.Table({selectionBehavior:"Row",rowHeight:30,
            visibleRowCountMode:"Auto",layoutData:new sap.m.FlexItemData({growFactor:1})});
        oVbox1.addItem(oTab1);


        //UI OBJECT ID(TABLE1) 컬럼.
        var oCol1 = new sap.ui.table.Column({sortProperty:"OBJID", filterProperty:"OBJID",
        label: new sap.m.Label({design:"Bold", text:"UI Object ID"})});
        oCol1.setTemplate(new sap.m.Text({text:"{OBJID}"}));
        oTab1.addColumn(oCol1);


        //해당 프로퍼티의 입력값 컬럼.
        var oCol2 = new sap.ui.table.Column({sortProperty:"UIATV", filterProperty:"UIATV", 
            label: new sap.m.Label({design:"Bold", text:"Value"})});
        oCol2.setTemplate(new sap.m.Text({text:"{UIATV}"}));
        oTab1.addColumn(oCol2);


        //UI 라이브러리명(sap.m.Table) 컬럼.
        var oCol3 = new sap.ui.table.Column({sortProperty:"UILIB", filterProperty:"UILIB", 
            label: new sap.m.Label({design:"Bold", text:"UI Object Module"})});
        oCol3.setTemplate(new sap.m.Text({text:"{UILIB}"}));
        oTab1.addColumn(oCol3);


        //UI OBJECT KEY 컬럼(UO01139) 컬럼.
        var oCol4 = new sap.ui.table.Column({sortProperty:"UIOBK", filterProperty:"UIOBK", 
            label: new sap.m.Label({design:"Bold", text:"UI Object Key"})});
        oCol4.setTemplate(new sap.m.Text({text:"{UIOBK}"}));
        oTab1.addColumn(oCol4);


        //부모 라이브러리명(sap.m.Page) 컬럼.
        var oCol5 = new sap.ui.table.Column({sortProperty:"POBID", filterProperty:"POBID", 
            label: new sap.m.Label({design:"Bold", text:"Parent UI Object ID"})});
        oCol5.setTemplate(new sap.m.Text({text:"{POBID}"}));
        oTab1.addColumn(oCol5);


        //부모 UI OBJECT KEY 컬럼(UO00389) 컬럼.
        var oCol6 = new sap.ui.table.Column({sortProperty:"PUIOK", filterProperty:"PUIOK", 
            label: new sap.m.Label({design:"Bold", text:"Parent Object Module"})});
        oCol6.setTemplate(new sap.m.Text({text:"{PUIOK}"}));
        oTab1.addColumn(oCol6);

        
        //TABLE 바인딩 처리.
        oTab1.bindAggregation("rows",{path:"/T_LIST",template: new sap.ui.table.Row()});


        //확인 버튼.
        var oBtn1 = new sap.m.Button({icon: "sap-icon://accept",text: "Confirm",type: "Accept"});
        oDlg.addButton(oBtn1);

        //확인버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            //동일 ATTRIBUTE 동기화 처리.
            lf_setSyncAttr();
        });


        //팝업 종료 버튼.
        var oBtn2 = new sap.m.Button({icon: "sap-icon://decline",text: "Cancel",type: "Reject"});
        oDlg.addButton(oBtn2);


        //팝업 종료 이벤트.
        oBtn2.attachPress(function(){
            //팝업 종료 처리.
            lf_close();
        });


        //dialog open전 이벤트.
        oDlg.attachAfterOpen(function(){
            //팝업에 출력할 값 바인딩 처리.
            lf_setBindVal();
        });


        //dialog 호출 처리.
        oDlg.open();




        //팝업에 출력할 값 바인딩 처리.
        function lf_setBindVal(){

            var ls_binfo = {};

            var l_UIATK = is_attr.UIATK;
            var l_UIATY = is_attr.UIATY;

            if(is_attr.UIATK.indexOf("_1") !== -1){
                l_UIATK = is_attr.UIATK.replace("_1", "");
                l_UIATY = "3";
            }

            //라이브러리에서 대상 프로퍼티정보 검색.
            var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_UIATK && a.UIATY === l_UIATY );

            if(!ls_0023){return;}

            //DDLB 구성이 필요한경우.
            if(ls_0023.ISLST === "X" && ls_0023.VALKY !== ""){
                //DDLB 구성.
                ls_binfo.T_DDLB = oAPP.fn.attrSetDDLBList(ls_0023.VALKY, is_attr.UIATY);

                //빈값을 최상위에 추가.
                ls_binfo.T_DDLB.splice(0, 0, {"KEY":"", "TEXT":""});

            }

            
            //DDLB로 표현이 필요한경우
            if(ls_0023.ISLST === "X"){
                var oSel = new sap.m.Select({selectedKey:"{/UIATV}"});
                oElem3.addField(oSel);

                oSel.bindAggregation("items",{path:"/T_DDLB", template: new sap.ui.core.Item({key:"{KEY}",text:"{TEXT}"})});

            }else{
                //일반 입력 필드인경우.

                var oInp = new sap.m.Input({value:"{/UIATV}",showValueHelp:"{/showF4}"});
                oElem3.addField(oInp);

                //input f4 help 이벤트.
                oInp.attachValueHelpRequest(function(){
                    callInputF4Help(this);
                });

                //input 입력값 처리 이벤트.
                oInp.attachChange(function(){
                    setInputVal(this);
                    
                });

            }


            //프로퍼티 명.
            ls_binfo.UIATT = is_attr.UIATT;

            var l_UIATT = is_attr.UIATT.toUpperCase();

            //프로퍼티명에 COLOR, ICON이 keyword가 존재하는경우.
            if(l_UIATT.indexOf("COLOR") !== -1 || l_UIATT.indexOf("ICON") !== -1 ||
                l_UIATT.indexOf("IMAGE") !== -1 || l_UIATT.indexOf("SRC") !== -1){
                    //input의 f4 help icon 활성화.
                    ls_binfo.showF4 = true;

            }

            //프로퍼티 타입.
            ls_binfo.UIADT = is_attr.UIADT;

            //프로퍼티 입력값.
            ls_binfo.UIATV = is_attr.UIATV;

            //프로퍼티 default 값.
            ls_binfo.DEFVL = ls_0023.DEFVL;

            //ddlb 처리 여부.
            ls_binfo.ISLST = ls_0023.ISLST;

            //동일 attribute 항목.
            ls_binfo.T_LIST = lt_list;
       
            //모델 데이터 구성 처리.
            oMdl.setData(ls_binfo);


        }   //팝업에 출력할 값 바인딩 처리.




        //input 입력값 처리 이벤트.
        function setInputVal(oUi){

            //프로퍼티 type이 숫자 유형인경우.
            if(is_attr.UIATY === "1" && ( is_attr.UIADT === "int" || is_attr.UIADT === "float")){
                //입력값 숫자 유형으로 변경 처리.                
                oMdl.oData.UIATV = String(Number(oMdl.oData.UIATV));
            }
            
            var ls_0015 = oAPP.fn.crtStru0015();

            oAPP.fn.moveCorresponding(is_attr, ls_0015);

            ls_0015.UIATV = oMdl.oData.UIATV;

            //프로퍼티 입력건 정합성 점검.
            if(oAPP.fn.chkValidProp(ls_0015) === false){
            
                //DDLB로 표현되는건이 아닌경우.
                if(oMdl.oData.ISLST !== "X"){
                    //입력 불가능한 값인경우 default 값으로 변경 처리.
                    oMdl.oData.UIATV = oMdl.oData.DEFVL;
                }
        
            }

            //모델 갱신 처리.
            oMdl.refresh();


        }   //input 입력값 처리 이벤트.




        //input f4 help 처리.
        function callInputF4Help(oUi){

            //색상 선택 팝업 호출건 처리.
            if(callInputF4HelpColor(oUi)){return;}

            //아이콘 선택 팝업 호출건 처리.
            if(callInputF4HelpIcon(oUi)){return;}
            

        }   //input f4 help 처리.



        //색상 선택 팝업 호출건 처리.
        function callInputF4HelpColor(oUi){

            var l_UIATK = is_attr.UIATT.toUpperCase();

            //프로퍼티명에 COLOR이 포함안된경우 EXIT.
            if(l_UIATK.indexOf("COLOR") === -1){return;}

            jQuery.sap.require("sap.ui.unified.ColorPickerPopover");

            //color picker 팝업 UI생성.
            var oColPic = new sap.ui.unified.ColorPickerPopover();

            //팝업에서 색상 선택 이벤트.
            oColPic.attachChange(function(oEvent){

                //선택 색상 매핑.
                oUi.setValue(oEvent.getParameter("hex"));                

            });

            //f4 help선택 위치에 color picker 팝업 open처리.
            oColPic.openBy(oUi);

            //function 호출처의 하위로직 skip을 위한 flag return.
            return true;

        }   //색상 선택 팝업 호출건 처리.



        //아이콘 선택 팝업 호출건 처리.
        function callInputF4HelpIcon(oUi){

            //아이콘 선택 팝업 callback function.
            function lf_callback(sIcon){

                //전달받은 아이콘명이 존재하지 않는경우 exit.
                if(typeof sIcon === "undefined" || sIcon === null || sIcon === ""){return;}

                oUi.setValue(sIcon);

            }   //아이콘 선택 팝업 callback function.

            var l_UIATT = is_attr.UIATT.toUpperCase();

            //프로퍼티명에 COLOR가 포함안되는경우 exit.
            if(l_UIATT.indexOf("ICON") === -1 && l_UIATT.indexOf("IMAGE") === -1 &&
                l_UIATT.indexOf("SRC") === -1){
                return;
            }

            //icon list popup function이 존재하는 경우.
            if(typeof oAPP.fn.callIconListPopup !== "undefined"){
                //icon list popup 호출.
                oAPP.fn.callIconListPopup(is_attr.UIATT, lf_callback);
                //하위 로직 skip처리를 위한 flag return.
                return true;
            }
        
            //icon list popup function이 존재하지 않는 경우.
            oAPP.fn.getScript("design/js/callIconListPopup",function(){
                //icon list popup function load 이후 팝업 호출.
                oAPP.fn.callIconListPopup(is_attr.UIATT, lf_callback);
            });

            //function 호출처의 하위로직 skip을 위한 flag return.
            return true;


        }   //아이콘 선택 팝업 호출건 처리.



        //동일 ATTRIBUTE 항목 구성.
        function setSameAttrData(it_tree, T_LIST){

            if(it_tree.length === 0){return;}

            //design tree의 UI를 기준으로 동일 프로퍼티명 존재시 리스트 구성.
            for(var i=0, l=it_tree.length; i<l; i++){
                //design영역에서 선택한 UI와 동일한건인경우 수집 skip 처리.
                if(it_tree[i].OBJID === is_attr.OBJID){
                    //하위 UI를 탐색하며 동일 프로퍼티명 수집 처리.
                    setSameAttrData(it_tree[i].zTREE, T_LIST);
                    continue;
                }

                var ls_list = {};

                
                //ATTRIBUTE 변경건 수집정보가 존재하는경우.
                if(oAPP.attr.prev[it_tree[i].OBJID]._T_0015.length !== 0){
                    //ATTRIBUTE 변경건 수집정보에서 동일한 attribute 명 정보 검색.
                    var ls_attr = oAPP.attr.prev[it_tree[i].OBJID]._T_0015.find( a=> a.UIATT === is_attr.UIATT && a.UIATY === is_attr.UIATY );

                    //수집된 정보가 존재하는경우.
                    if(ls_attr){

                        //바인딩 처리시.
                        if(ls_attr.ISBND === "X"){
                            //해당 UI는 skip처리, 하위 UI를 탐색하며 동일 attribute명에 대한 정보 수집.
                            setSameAttrData(it_tree[i].zTREE, T_LIST);
                            continue;
                        }

                        ls_list = oAPP.fn.crtStru0015();

                        oAPP.fn.moveCorresponding(ls_attr, ls_list);

                        //현재 TREE 라인의 LIBRARY명.
                        ls_list.UILIB = it_tree[i].UILIB;

                        //현재 TREE 라인의 부모 UI OBJECT ID.
                        ls_list.POBID = it_tree[i].POBID;

                        //현재 TREE 라인의 부모 UI OBJECT KEY.
                        ls_list.PUIOK = it_tree[i].PUIOK;

                        T_LIST.push(ls_list);
                        ls_list = {};

                        //하위 UI를 탐색하며 동일 attribute명에 대한 정보 수집.
                        setSameAttrData(it_tree[i].zTREE, T_LIST);

                        continue;


                    }

                }   //ATTRIBUTE 변경건 수집정보가 존재하는경우.

                //DEFAULT PROPERTY TYPE.
                var l_UIATY = "1";

                //직접 입력 가능한 AGGREGATION인경우.
                if(is_attr.UIATK.indexOf("_1") !== -1){
                    //AGGREGATION 검색을 위한 TYPE 변경.
                    l_UIATY = "3";
                }

                //LIBRARY에서 해당 ATTRIBUTE가 존재하는지 검색.
                var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIOBK === it_tree[i].UIOBK && 
                    a.UIATT === is_attr.UIATT && a.UIATY === l_UIATY  && a.ISDEP !== "X" );

                //존재하지 않는경우.
                if(!ls_0023){
                    //하위 UI를 탐색하며 동일 attribute명에 대한 정보 수집.
                    setSameAttrData(it_tree[i].zTREE, T_LIST);
                    continue;
                }


                ls_list = oAPP.fn.crtStru0015();

                oAPP.fn.moveCorresponding(ls_0023, ls_list);

                ls_list.APPID = oAPP.attr.appInfo.APPID;
                ls_list.GUINR = oAPP.attr.appInfo.GUINR;

                if(is_attr.UIATK.indexOf("_1") !== -1){
                    ls_list.UIATK = ls_list.UIATK + "_1";
                    ls_list.UIATY = "1";
                }

                //현재 TREE 라인의 UI OBJECT ID.
                ls_list.OBJID = it_tree[i].OBJID;

                var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === it_tree[i].UIOBK );
                
                //대상 프로퍼티의 DEFAULT 값.
                ls_list.UIATV = ls_0023.DEFVL;

                //UI Library Internal Key
                ls_list.UILIK = ls_0022.UILIK;

                //현재 TREE 라인의 LIBRARY명.
                ls_list.UILIB = it_tree[i].UILIB;

                //현재 TREE 라인의 UI OBJECT KEY.
                ls_list.UIOBK = it_tree[i].UIOBK;

                //현재 TREE 라인의 부모 UI OBJECT ID.
                ls_list.POBID = it_tree[i].POBID;

                //현재 TREE 라인의 부모 UI OBJECT KEY.
                ls_list.PUIOK = it_tree[i].PUIOK;

                T_LIST.push(ls_list);
                ls_list = {};

                //하위 UI를 탐색하며 동일 attribute명에 대한 정보 수집.
                setSameAttrData(it_tree[i].zTREE, T_LIST);

            }


        }   //동일 ATTRIBUTE 항목 구성.



        //팝업 종료처리.
        function lf_close(bSkipMsg){

            oDlg.close();
            oDlg.destroy();

            if(bSkipMsg === true){return;}

            //001	Cancel operation
            parent.showMessage(sap,10, "I", "Cancel operation");

        }   //팝업 종료처리.



        //동일 ATTRIBUTE 동기화 처리.
        function lf_setSyncAttr(){

            //선택한 라인 정보 얻기.
            var lt_sel = oTab1.getSelectedIndices();

            //라인선택건이 존재하지 않는경우.
            if(lt_sel.length === 0){
                //001	Cancel operation
                parent.showMessage(sap,10, "E", "선택된 라인이 존재하지 않습니다.");
                return;
            }

            var l_UIATV = oMdl.getProperty("/UIATV");

            
            //선택한 라인을 기준으로 입력값 동기화 처리.
            for(var i=0, l=lt_sel.length; i<l; i++){
                //선택 라인의 바인딩 정보 얻기.
                var l_ctxt = oTab1.getContextByIndex(lt_sel[i]);
                if(!l_ctxt){continue;}

                var ls_line = l_ctxt.getProperty();

                //라이브러리에서 해당 attribute 정보 얻기.
                var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === ls_line.UIATK && a.UIATY === ls_line.UIATY );

                //기존 수집건 존재여부 확인.
                var ls_0015 = oAPP.attr.prev[ls_line.OBJID]._T_0015.find( a => a.UIATK === ls_line.UIATK && a.UIATY === ls_line.UIATY );

                //기존 수집건이 존재하는 경우.
                if(ls_0015){

                    //기존 수집건이 바인딩 처리된경우 SKIP.
                    if(ls_0015.ISBND === "X"){
                        continue;
                    }

                    //입력값 변경 처리.
                    ls_0015.UIATV = l_UIATV;

                    //입력값이 존재하지 않는경우 해당 attribute의 default값이 존재시.
                    if(ls_0015.UIATV === "" && ls_0023.DEFVL !== ""){
                        //공백값 입력 flag 처리.
                        ls_0015.ISSPACE = "X";
                    }

                    //미리보기 화면 UI의 프로퍼티 변경 처리.
                    oAPP.fn.previewUIsetProp(ls_0015);

                    continue;
                }

                //신규 라인 생성.
                var ls_0015 = oAPP.fn.crtStru0015();

                oAPP.fn.moveCorresponding(ls_line, ls_0015);

                ls_0015.UIATV = l_UIATV;

                //입력값이 존재하지 않는경우 해당 attribute의 default값이 존재시.
                if(ls_0015.UIATV === "" && ls_0023.DEFVL !== ""){
                    //공백값 입력 flag 처리.
                    ls_0015.ISSPACE = "X";
                }

                //변경건 수집 처리.
                oAPP.attr.prev[ls_line.OBJID]._T_0015.push(ls_0015);

                //미리보기 화면 UI의 프로퍼티 변경 처리.
                oAPP.fn.previewUIsetProp(ls_0015);

                ls_0015 = {};

            }

            is_attr.UIATV = l_UIATV;

            oAPP.fn.attrChangeProc(is_attr, "", false, true);


            lf_close(true);

            //005	Job finished.
            parent.showMessage(sap,10, "S", "Job finished.");


        }



    };  //동일 ATTRIBUTE 동기화 처리 팝업.
    



})();