/********************************************************************
 *📝 design 영역 구성.
********************************************************************/
export async function start(is_attr){

    return new Promise(async (res) => {

        //design 영역 화면 구성.
        var _oContr = await designView(is_attr);


        return res(_oContr);

    });

}



/********************************************************************
 *📝 design 영역 control 정보 구성.
********************************************************************/
function designControl(is_attr){

    return new Promise(async (res) => {

        
        const 
            oContr         = {};
            oContr.ui      = {};
            oContr.ui.ROOT = undefined;
            oContr.fn      = {};
            oContr.attr    = {};

            oContr.attr.is_attr    = is_attr;


            oContr.types   = {};

            oContr.types.TY_ATTR = {
                OBJID : "",
                UIATT : "",
                UIADT : "",
                UIATV : "",
                MPROP : "",
                UIATY : ""
            };
            

            oContr.types.TY_LIST = {
                OBJID : "",
                UIATT : "",
                UIATK : "",
                UIATV : "",
                UILIB : "",
                UIOBK : "",
                POBID : "",
                PUIOK : ""

            };


            //동일속성 정보 적용 영역 바인딩 정보.
            oContr.oModel = new sap.ui.model.json.JSONModel({
                T_LIST  : []
            });



            /********************************************************************
             *📝 PRIVITE FUNCTION 선언부
            *******************************************************************/

                /*******************************************************
                * @function - 모델 데이터 구성.
                *******************************************************/  
                function setModelData(){

                    var _oData = oContr.oModel.oData;

                    _oData.S_ATTR = {};

                    _oData.T_LIST = [];
                    

                    _oData.S_ATTR.OBJID =  oContr.attr.is_attr.OBJID;
                    _oData.S_ATTR.UIATT =  oContr.attr.is_attr.UIATT;
                    _oData.S_ATTR.UIADT =  oContr.attr.is_attr.UIADT;
                    _oData.S_ATTR.UIATV =  oContr.attr.is_attr.UIATV;
                    _oData.S_ATTR.MPROP =  oContr.attr.is_attr.MPROP;
                    _oData.S_ATTR.UIATY =  oContr.attr.is_attr.UIATY;

                    //동일속성 attr 항목 검색.
                    _oData.T_LIST = parent.require("./synchronizionArea/getSameAttrList.js")(oContr.attr.is_attr);

                }

           

        /*************************************************************
         * @FlowEvent - View Start 
         *************************************************************/
        oContr.onViewReady = async function(){
            
            return new Promise((res)=>{


                //모델 데이터 구성.
                setModelData();


                //default 화면 편집 불가능.
                oContr.oModel.oData.edit = false;

                //workbench 화면이 편집상태인경우.
                if(oAPP.attr.oAppInfo.IS_EDIT === "X"){
                    //화면 편집 가능 flag 처리.
                    oContr.oModel.oData.edit = true;
                }

               
                //모델 갱신 처리.
                oContr.oModel.refresh();


                return res();

            });

        };


        /*************************************************************
         * @FlowEvent - View exit 
         *************************************************************/
        oContr.onViewExit = function(){

            return new Promise((res)=>{

                //현재 ui 제거.
                oContr.ui.ROOT.destroy();

                return res();

            });

        };


        /*************************************************************
         * @event - 팝업 종료 이벤트.
         *************************************************************/
        oContr.fn.onClosePopup = function(){
            oContr.ui.ROOT.close();
        };



        /*************************************************************
         * @event - 컬럼 최적화 버튼 선택 이벤트.
         *************************************************************/
        oContr.fn.onAutoResizeColumn = function(oEvent){

            var _oUi = oEvent?.oSource;

            if(typeof _oUi === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            var _oParent = _oUi.getParent();

            //부모를 탐색하며 UI TABLE 정보 찾기.
            while (!_oParent.isA("sap.ui.table.Table")) {
                
                _oParent = _oParent.getParent();

                if(typeof _oParent === "undefined"){
                    return;
                }

            }

            if(typeof _oParent === "undefined"){
                return;
            }


            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setUiTableAutoResizeColumn(_oParent);
        };


        /*************************************************************
         * @event - 확인 버튼 선택 이벤트.
         *************************************************************/
        oContr.fn.onSetSyncAttr = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent?.oSource;

            if(typeof _oUi === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            var _oParent = _oUi.getParent();

            //부모를 탐색하며 UI TABLE 정보 찾기.
            while (!_oParent.isA("sap.ui.table.Table")) {
                
                _oParent = _oParent.getParent();

                if(typeof _oParent === "undefined"){
                    return;
                }

            }

            //라인 선택건 얻기.
            var lt_sel = _oParent.getSelectedIndices();

            //라인선택건이 존재하지 않는경우.
            if(lt_sel.length === 0){

                oAPP.fn.setBusy(false);

                //268	Selected line does not exists.
                sap.m.MessageBox.error(oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", ""));
                return;
            }


            oAPP.fn.setBusy(false);

            //159	동일속성 바인딩 일괄적용 하시겠습니까?
            var _msg = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "159");
            
            let _actcd = await new Promise((resolve) => {
                sap.m.MessageBox.confirm(_msg, {
                    onClose: (actcd) => {
                        resolve(actcd);
                    }
                });
            });


            if (_actcd !== "OK") {
                return;
            }

            oAPP.fn.setBusy(true);


            //바인딩 필드의 모델 필드 정보 얻기.
            var _sField = oAPP.fn.getModelBindData(oContr.oModel.oData.S_ATTR.UIATV, oAPP.attr.oModel.oData.zTREE);

            _sField = JSON.parse(JSON.stringify(_sField));

            //해당 attr에 추가속성 정보가 존재하는경우.
            if(typeof oContr.oModel.oData.S_ATTR.MPROP !== "undefined" && oContr.oModel.oData.S_ATTR.MPROP !== ""){
                _sField.MPROP = oContr.oModel.oData.S_ATTR.MPROP;
            }


            //선택한 라인을 기준으로 입력값 동기화 처리.
            for(var i=0, l=lt_sel.length; i<l; i++){

                
                //선택 라인의 바인딩 정보 얻기.
                var l_ctxt = oContr.ui.LIST.getContextByIndex(lt_sel[i]);
                if(!l_ctxt){continue;}

                var ls_line = l_ctxt.getProperty();               


                //디자인 영역에 해당 라인 찾기.
                var _sTree = oAPP.fn.getDesignTreeAttrData(ls_line.OBJID, ls_line.UIATK);


                switch (_sTree.UIATY) {
                    case "1":
                        //프로퍼티 바인딩 처리.
                        oAPP.fn.attrSetBindProp(_sTree, _sField);
                        break;

                    case "3":

                        if(_sTree.UIATV !== "" && _sTree.ISBND === "X"){

                            //UNBIND 처리.
                            oAPP.fn.attrUnbindAggr(oAPP.attr.prev[_sTree.OBJID],_sTree.UIATT, _sTree.UIATV);

                            //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                            oAPP.fn.attrUnbindTree(_sTree);

                        }
                        
                        //AGGREGATION 바인딩 처리.
                        oAPP.fn.attrSetBindProp(_sTree, _sField);
                        

                        oAPP.attr.prev[_sTree.OBJID]._MODEL[_sTree.UIATT] = _sTree.UIATV;

                        break;
                
                    default:
                        break;
                }


                //바인딩 처리된 값 매핑.
                ls_line.UIATV = _sTree.UIATV;
                
            }


            oAPP.attr.oDesign.oModel.refresh(true);

            oContr.oModel.refresh();


            //라인 선택 해제 처리.
            _oParent.clearSelection();

            //160	동일속성 바인딩 처리를 완료 했습니다.
            sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "160"), 
                {duration: 3000, at:"center center", my:"center center"});  


            //디자인 영역으로 이동 처리.
            await oAPP.attr.oDesign.fn.moveDesignPage();

            oAPP.fn.setBusy(false);


        };



        /*************************************************************
         * @event - 뒤로가기 버튼 선택 이벤트.
         *************************************************************/
        oContr.fn.onMoveDesignPage = async function(){

            oAPP.fn.setBusy(true);

            //디자인 영역으로 이동 처리.
            await oAPP.attr.oDesign.fn.moveDesignPage();

            oAPP.fn.setBusy(false);

        };


        /*************************************************************
         * @event - 동일속성 적용 팝업으로 호출.
         *************************************************************/
        oContr.fn.onCallSyncBindPopup = async function(){

            oAPP.fn.setBusy(true);

            //A80	Property replace all
            var l_A80 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A80", "", "", "", "");

            //A41	Cancel
            var l_A41 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "");


            var _oDialog = new sap.m.Dialog({
                resizable:true, 
                draggable:true, 
                contentWidth:"60%",
                contentHeight:"60%",
                verticalScrolling:false,
                afterOpen: function(){
                    oAPP.fn.setBusy(false);
                },
                afterClose: function(){
                    _oDialog.destroy();
                },
                // customHeader: new sap.m.OverflowToolbar({
                customHeader: new sap.m.Toolbar({
                    content:[

                        new sap.m.Title({
                            text:l_A80,
                            tooltip:l_A80
                        }).addStyleClass("sapUiTinyMarginBegin"),

                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            icon:"sap-icon://decline", 
                            type:"Reject", 
                            
                            //A39	Close
                            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", ""),
                            press: function(){
                                _oDialog.close();
                            }
                        })
                    ]
                }),
                buttons:[

                    //팝업 종료 버튼.
                    new sap.m.Button({
                        icon: "sap-icon://decline", 
                        text:l_A41, 
                        tooltip:l_A41, 
                        type: "Reject",
                        press: function(){
                            _oDialog.close();
                        }
                    })
                ]

            }).addStyleClass("sapUiSizeCompact");

            _oDialog.setModel(oContr.oModel);


            //DIALOG MODAL 해제.
            _oDialog.oPopup.setModal(false);


            //동일속성 화면 복사 처리.
            var _oClone = oContr.ui.VB_MAIN.clone();


            _oDialog.addContent(_oClone);

            
            _oDialog.open();


            //디자인 영역으로 이동 처리.
            await oAPP.attr.oDesign.fn.moveDesignPage();

            oAPP.fn.setBusy(false);

        };

        
        /*************************************************************
         * @function - UI 구성 완료후 call back 처리.
         *************************************************************/
        oContr.fn.uiUpdateComplate = function(oUI){

            return new Promise((res)=>{
                
                if(typeof oUI === "undefined" || oUI === null){
                    return res();
                }

                var _oDelegate = {
                    onAfterRendering:(oEvent)=>{

                        //onAfterRendering 이벤트 제거.
                        oUI.removeEventDelegate(_oDelegate);

                        //onAfterRendering 정보 초기화.
                        oUI.data("_onAfterRendering", null);

                        return res();

                    }
                };

                //onAfterRendering 추가.
                oUI.addEventDelegate(_oDelegate);
                
                //onAfterRendering 정보 매핑.
                oUI.data("_onAfterRendering", _oDelegate);

            });

        };


        return res(oContr);


    });
}


/********************************************************************
 *📝 design 영역 화면 구성.
********************************************************************/
function designView(is_attr){

    return new Promise(async (res)=>{

        //control 정보 구성.
        let oContr = await designControl(is_attr);

        // //동일속성 동기화 처리 POPUP UI 생성. 
        // oContr.ui.ROOT = new sap.m.Dialog({resizable:true, draggable:true, contentWidth:"60%",
        //     contentHeight:"60%",verticalScrolling:false});

        oContr.ui.ROOT = new sap.m.Page();

        oContr.ui.ROOT.setModel(oContr.oModel);


        var oTool = new sap.m.Toolbar();
        oContr.ui.ROOT.setCustomHeader(oTool);

        //E30  Back
        var _txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E30", "", "", "", "");

        //뒤로가기 버튼.
        var oBack = new sap.m.Button({
            text:_txt,      //E30  Back
            tooltip:_txt,   //E30  Back
            icon:"sap-icon://nav-back",
            type:"Emphasized",
            press:oContr.fn.onMoveDesignPage
        });

        oTool.addContent(oBack);


        // oTool.addContent(new sap.m.ToolbarSpacer());

        //140	동일속성 적용 팝업 호출
        var _txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "140");

        //동일속성 적용 팝업으로 호출.
        var oSyncBindPopup = new sap.m.Button({
            text:_txt,      //140	동일속성 적용 팝업 호출
            tooltip: _txt,  //140	동일속성 적용 팝업 호출
            icon:"sap-icon://popup-window",
            type:"Emphasized",
            press:oContr.fn.onCallSyncBindPopup
        });

        oTool.addContent(oSyncBindPopup);

        //A80	Property replace all
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A80", "", "", "", "");

        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        // oTool.addContent(new sap.m.ToolbarSpacer());

        oContr.ui.VB_MAIN = new sap.m.VBox({height:"100%",renderType:"Bare"});
        oContr.ui.ROOT.addContent(oContr.ui.VB_MAIN);


        var oPanel = new sap.m.Panel({expandable:true, expanded:true});
        oContr.ui.VB_MAIN.addItem(oPanel);

        var oTool1 = new sap.m.Toolbar();
        oPanel.setHeaderToolbar(oTool1);

        //Selected UI Object Info
        var l_txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "060");

        oTool1.addContent(new sap.m.Title({text:"▶ " + l_txt}).addStyleClass("sapUiTinyMarginBegin"));
        

        jQuery.sap.require("sap.ui.layout.form.Form");
        var oForm = new sap.ui.layout.form.Form({editable:true});
        // oContr.ui.VB_MAIN.addItem(oForm);
        oPanel.addContent(oForm);

        var oLay = new sap.ui.layout.form.ResponsiveGridLayout({adjustLabelSpan:false,
            singleContainerFullSize:false});
        oForm.setLayout(oLay);

        var oCont = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oCont);

        //A84  UI Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84", "", "", "", "");

        //UI OBJECT ID.
        var oElem0 = new sap.ui.layout.form.FormElement({
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oElem0.addField(new sap.m.Text({text:"{/S_ATTR/OBJID}"}));
        oCont.addFormElement(oElem0);

        //A81	Attribute ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A81", "", "", "", "");

        //ATTRIBUTE 명.
        var oElem1 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oElem1.addField(new sap.m.Text({text:"{/S_ATTR/UIATT}"}));
        oCont.addFormElement(oElem1);


        //A82	Attribute Type
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A82", "", "", "", "");

        //ATTRIBUTE TYPE.
        var oElem2 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oElem2.addField(new sap.m.Text({text:"{/S_ATTR/UIADT}"}));
        oCont.addFormElement(oElem2);


        //C55	Binding Field
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C55", "", "", "", "");

        //해당 ATTRIBUTE의 입력값.
        var oElem3 = new sap.ui.layout.form.FormElement({label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});        
        oCont.addFormElement(oElem3);


        var oTxt1 = new sap.m.Text({text:"{/S_ATTR/UIATV}"});
        oElem3.addField(oTxt1);


        //동일속성 프로퍼티 출력 테이블.
        oContr.ui.LIST = new sap.ui.table.Table({selectionBehavior:"Row", rowHeight:30,
            visibleRowCountMode:"Auto", layoutData:new sap.m.FlexItemData({growFactor:1})});
        oContr.ui.VB_MAIN.addItem(oContr.ui.LIST);

        var oTool2 = new sap.m.OverflowToolbar();
        oContr.ui.LIST.addExtension(oTool2);
        
        //141	일괄적용
        var _txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "141");

        //확인 버튼.
        var oBtn1 = new sap.m.Button({
            icon: "sap-icon://accept",
            text:_txt,      //141	일괄적용
            tooltip:_txt,   //141	일괄적용
            type: "Accept",
            press: oContr.fn.onSetSyncAttr
        });
        oTool2.addContent(oBtn1);


        oTool2.addContent(new sap.m.ToolbarSpacer());
                    
        //161	컬럼최적화
        //table autoresize.        
        var oBtn04 = new sap.m.Button({
            icon: "sap-icon://resize-horizontal",
            tooltip: oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "161"),
            busyIndicatorDelay: 1,
            press: oContr.fn.onAutoResizeColumn
        });

        oTool2.addContent(oBtn04);


        //Target Replace Properties
        var l_txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "061");

        var oTitle2 = new sap.m.Title({text:"▶ " + l_txt}).addStyleClass("sapUiMediumMarginBegin");
        oContr.ui.LIST.setTitle(oTitle2);



        //A84	UI Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84", "", "", "", "");

        //UI OBJECT ID(TABLE1) 컬럼.
        var oCol1 = new sap.ui.table.Column({sortProperty:"OBJID", filterProperty:"OBJID", autoResizable:true,
        label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol1.setTemplate(new sap.m.Text({text:"{OBJID}"}));
        oContr.ui.LIST.addColumn(oCol1);


        //A81	Attribute ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A81", "", "", "", "");

        //Attribute ID(text) 컬럼.
        var oCol1 = new sap.ui.table.Column({sortProperty:"UIATT", filterProperty:"UIATT", autoResizable:true,
        label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol1.setTemplate(new sap.m.Text({text:"{UIATT}"}));
        oContr.ui.LIST.addColumn(oCol1);


        //A53	Value
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A53", "", "", "", "");

        //해당 프로퍼티의 입력값 컬럼.
        var oCol2 = new sap.ui.table.Column({sortProperty:"UIATV", filterProperty:"UIATV",  autoResizable:true,
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol2.setTemplate(new sap.m.Text({text:"{UIATV}"}));
        oContr.ui.LIST.addColumn(oCol2);


        //A85	UI Object Module
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A85", "", "", "", "");

        //UI 라이브러리명(sap.m.Table) 컬럼.
        var oCol3 = new sap.ui.table.Column({sortProperty:"UILIB", filterProperty:"UILIB", autoResizable:true,
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol3.setTemplate(new sap.m.Text({text:"{UILIB}"}));
        oContr.ui.LIST.addColumn(oCol3);


        //A86	UI Object Key
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A86", "", "", "", "");

        //UI OBJECT KEY 컬럼(UO01139) 컬럼.
        var oCol4 = new sap.ui.table.Column({sortProperty:"UIOBK", filterProperty:"UIOBK", autoResizable:true,
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol4.setTemplate(new sap.m.Text({text:"{UIOBK}"}));
        oContr.ui.LIST.addColumn(oCol4);


        //A87	Parent UI Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A87", "", "", "", "");

        //부모 라이브러리명(sap.m.Page) 컬럼.
        var oCol5 = new sap.ui.table.Column({sortProperty:"POBID", filterProperty:"POBID", autoResizable:true,
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol5.setTemplate(new sap.m.Text({text:"{POBID}"}));
        oContr.ui.LIST.addColumn(oCol5);
        

        //A88	Parent Object Module
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A88", "", "", "", "");

        //부모 UI OBJECT KEY 컬럼(UO00389) 컬럼.
        var oCol6 = new sap.ui.table.Column({sortProperty:"PUIOK", filterProperty:"PUIOK", autoResizable:true,
            label: new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt})});
        oCol6.setTemplate(new sap.m.Text({text:"{PUIOK}"}));
        oContr.ui.LIST.addColumn(oCol6);

        
        //TABLE 바인딩 처리.
        oContr.ui.LIST.bindAggregation("rows", {
            path:"/T_LIST",
            template: new sap.ui.table.Row(),
            templateShareable : true
        });


        return res(oContr);

    });

}