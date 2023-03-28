(function(){

    //개인화 폴더명.
    const C_P13N = "p13n";

    //U4A 개인화 폴더명.
    const C_FOLDER = "U4A_UI_PATTERN";

    //개인화 파일명.
    const C_HEADER_FILE = "header.json";

    //SYSTEM ID.
    const C_SYSID = parent.getUserInfo().SYSID;

    var loApp = {ui:{}, attr:{is_tree:{}, frameID:"", theme:"", bootPath:"", T_THEME:[], HTML:"", mode:""}};
    
    //UI 개인화 정보 저장 팝업.
    oAPP.fn.callP13nDesignDataPopup = function(is_tree, sMode){

        //ROOT는 개인화 저장 불가.
        if(is_tree.OBJID === "ROOT"){
            //This line cannot be selected.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "266", "", "", "", ""));
            return;
        }
        
        //초기값 구성.
        lf_setInitData(is_tree, sMode);

        //개인화 팝업.
        loApp.ui.oDlg = new sap.m.Dialog({resizable:true, draggable: true, verticalScrolling:false,
            contentWidth:"70%", contentHeight:"60%"}).addStyleClass("sapUiSizeCompact");

        //팝업 더블클릭 이벤트.
        loApp.ui.oDlg.attachBrowserEvent("dblclick", function(){
            //이벤트 전파 방지.
            event.preventDefault();
            event.stopPropagation();
        });

        //팝업 호출 후 이벤트.
        loApp.ui.oDlg.attachAfterOpen(function(){

            //modal 해제 처리.
            this.oPopup.setModal(false);

            //개인화 팝업 호출 이후 미리보기 HTML 구성. 
            lf_setP13nData(loApp.attr.is_tree, true);


        }); //팝업 호출 후 이벤트.

        //팝업 종로 후 이벤트.
        loApp.ui.oDlg.attachAfterClose(function(){
            lf_afterClose(this);
        }); //팝업 종로 후 이벤트.


        loApp.oModel = new sap.ui.model.json.JSONModel();
        loApp.ui.oDlg.setModel(loApp.oModel);

        var oTool0 = new sap.m.Toolbar();
        loApp.ui.oDlg.setCustomHeader(oTool0);


        //E24  UI Personalization
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E24", "", "", "", "") 
            + " - " + is_tree.OBJID;

        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTool0.addContent(oTitle);

        oTool0.addContent(new sap.m.ToolbarSpacer());

        //팝업 전체화면/이전화면 버튼.
        var oBtn3 = new sap.m.Button({icon:"sap-icon://full-screen"});
        oTool0.addContent(oBtn3);

        oBtn3.attachPress(function(){
            //팝업 사이즈 변경처리.
            lf_setPopupResize(oBtn3);
        });

        //A39	Close
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip: l_txt});
        oTool0.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //001  Cancel operation
            //팝업 종료 처리.
            lf_close("001");

        }); //닫기 버튼 선택 이벤트.


        //A64  Save
        //개인화 저장 버튼.
        var oBtn1 = new sap.m.Button({type:"Accept", icon:"sap-icon://save", visible: "{/is_edit/head_save}", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", "")});
        loApp.ui.oDlg.addButton(oBtn1);

        //저장버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            lf_setHeaderSave();
        }); //저장버튼 선택 이벤트.


        //A39  Close
        //팝업 종료 버튼.
        var oBtn2 = new sap.m.Button({type:"Reject", icon:"sap-icon://decline", 
            tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        loApp.ui.oDlg.addButton(oBtn2);

        //팝업 종료 이벤트.
        oBtn2.attachPress(function(){
            //팝업 종료 처리.
            //001  Cancel operation
            lf_close("001");
        });

        //개인화 팝업 좌, 우 화면 분할 Splitter UI.
        var oSApp = new sap.ui.layout.Splitter();
        loApp.ui.oDlg.addContent(oSApp);

        //좌측 개인화 리스트 팝업.
        var oPage0 = new sap.m.Page({showHeader:false,
            layoutData:new sap.ui.layout.SplitterLayoutData({size:"30%", minSize:30})});
        oSApp.addContentArea(oPage0);

        
        //개인화 리스트 table.
        var oTab = new sap.ui.table.Table({visibleRowCountMode:"Auto",
            selectionBehavior:"Row", selectionMode:"{/is_edit/head_mode}"});
        oPage0.addContent(oTab);

        //라인선택 이벤트.
        oTab.attachRowSelectionChange(function(oEvent){

            var l_indx = oEvent.mParameters.rowIndex;

            if(typeof oEvent.mParameters.rowIndices !== "undefined" && oEvent.mParameters.rowIndices.length !== 0){
                l_indx = oEvent.mParameters.rowIndices[0];
            }

            //라인 선택이 해제 된경우 이벤트 발생 라인 선택 처리.
            this.setSelectedIndex(l_indx);

            var l_ctxt = this.getContextByIndex(l_indx);
            if(!l_ctxt){return;}

            lf_selHeaderLine(l_ctxt.getProperty());

        }); //라인선택 이벤트.

        oTab.setRowSettingsTemplate(new sap.ui.table.RowSettings({highlight:"{highlight}"}));
        

        var oTool3 = new sap.m.Toolbar();
        oTab.setToolbar(oTool3);


        //B38  Edit
        //편집버튼.
        var oEdit = new sap.m.Button({icon: "sap-icon://edit", visible: "{/is_edit/head_edit}", 
            type:"Success", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B38", "", "", "", "")});

        //편집버튼 선택 이벤트.
        oEdit.attachPress(function(){
            //편집상태로 변경 처리.
            lf_setHeaderEdit();
        }); //편집버튼 선택 이벤트.

        oTool3.addContent(oEdit);


        //A41  Cancel
        //취소버튼.
        var oCancel = new sap.m.Button({icon: "sap-icon://sys-cancel", visible: "{/is_edit/head_canc}",
            type:"Reject", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "")});

        //취소버튼 선택 이벤트.
        oCancel.attachPress(function(){
            lf_setHeaderCancel();
        }); //취소버튼 선택 이벤트.

        oTool3.addContent(oCancel);


        //A64  Save
        //저장버튼.
        var oSave = new sap.m.Button({icon: "sap-icon://save", visible: "{/is_edit/head_save}", 
            type:"Accept", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", "")});

        //저장버튼 선택 이벤트.
        oSave.attachPress(function(){
            lf_setHeaderSave();
        }); //저장버튼 선택 이벤트.

        oTool3.addContent(oSave);


        //A03  Delete
        //삭제버튼.
        var oDelete = new sap.m.Button({icon: "sap-icon://delete", visible: "{/is_edit/head_dele}",
            type:"Negative", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});

        //삭제버튼 선택 이벤트.
        oDelete.attachPress(function(){
            lf_setHeaderDelete();
        }); //삭제버튼 선택 이벤트.

        oTool3.addContent(oDelete);


        //A48  Refresh
        //갱신버튼.
        var oRefresh = new sap.m.Button({icon: "sap-icon://refresh", visible: "{/is_edit/head_refr}",
            type:"Emphasized", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A48", "", "", "", "")});

        //갱신버튼 선택 이벤트.
        oRefresh.attachPress(function(){
            lf_setHeaderRefresh();
        }); //갱신버튼 선택 이벤트.

        oTool3.addContent(oRefresh);


        var oCol1 = new sap.ui.table.Column({label:"Description", sortProperty:"", filterProperty:""});
        oTab.addColumn(oCol1);

        var oHBox3 = new sap.m.HBox({direction:"Column", height:"auto"});
        oCol1.setTemplate(oHBox3);
    
        //header text.    
        var oExpTxt1 = new sap.m.ExpandableText({text:"{title}", visible:"{visible_txt}",
            maxCharacters: 30});
        oHBox3.addItem(oExpTxt1);

        //A35  Description
        //header text area.
        var oTxtArea1 = new sap.m.TextArea({value:"{title}", visible:"{visible_inp}",
            width:"100%", rows:5, maxLength:300, growing:true, growingMaxLines:10,
            placeholder:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", "")});
        oHBox3.addItem(oTxtArea1);

        oTxtArea1.attachChange(function(){
            lf_headerChangeLine.call(this);
        });

        oTab.bindAggregation("rows", {path:"/T_HEAD", template:new sap.ui.table.Row()});


        //가운데 미리보기 page.
        var oPage2 = new sap.m.Page().addStyleClass("u4aP13nPreview sapUiContentPadding");
        oSApp.addContentArea(oPage2);

        var oTool2 = new sap.m.Toolbar();
        oPage2.setCustomHeader(oTool2);

        //E25  Personalization Preview
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E25", "", "", "", "");
        oTool2.addContent(new sap.m.Title({text:l_txt, tooltip:l_txt}));
        oTool2.addContent(new sap.m.ToolbarSpacer());

        //E27  Choose Theme
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E27", "", "", "", "");
        oTool2.addContent(new sap.m.Label({text:l_txt, tooltip:l_txt, design:"Bold"}).addStyleClass("sapUiTinyMarginEnd"));

        //테마선택 ddlb.
        var oCombo = new sap.m.ComboBox({selectedKey:"{/THEME}"});
        oTool2.addContent(oCombo);

        oCombo.attachChange(function(){
            oAPP.fn.P13nChangeTheme(this.getSelectedKey());
        });

        oCombo.bindAggregation("items", {path:"/T_THEME", template: new sap.ui.core.Item({key:"{key}", text:"{key}"})});


        //iframe id 랜덤으로 생성.
        loApp.attr.frameID = "prev" + oAPP.fn.getRandomKey();

        //미리보기 표현 html.
        var oHTML = new sap.ui.core.HTML({
            content:"<div style='width:100%; height:100%; overflow:hidden;'>" +
            "<iframe id='" + loApp.attr.frameID + "' name='" + loApp.attr.frameID + "' style='overflow:hidden;overflow-x:hidden;" + 
            "overflow-y:hidden;height:100%;width:100%;" + 
            "top:0px;left:0px;right:0px;bottom:0px;border:none;'></iframe></div>"});
        oPage2.addContent(oHTML);


        //우측 design tree 및 desc 입력 영역.
        var oPage1 = new sap.m.Page({showHeader:false, enableScrolling:false,
            layoutData:new sap.ui.layout.SplitterLayoutData({size:"30%", minSize:30})});
        oSApp.addContentArea(oPage1);

        //design tree UI.
        loApp.ui.oTree = new sap.ui.table.TreeTable({selectionMode:"None", 
            visibleRowCountMode:"Auto", columnHeaderVisible:false});
        oPage1.addContent(loApp.ui.oTree);

        var oTool1 = new sap.m.Toolbar();
        loApp.ui.oTree.setToolbar(oTool1);

        //A46	Expand All
        //전체펼침
        var oToolBtn1 = new sap.m.Button({icon:"sap-icon://expand-all", type:"Emphasized", busy:"{/busy}",             
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A46", "", "", "", "")});
            oTool1.addContent(oToolBtn1);

        //tree 전체펼침 이벤트
        oToolBtn1.attachPress(function(){
            loApp.ui.oTree.expandToLevel(99999);
        });


        //A47	Collapse All
        //전체접힘
        var oToolBtn2 = new sap.m.Button({icon:"sap-icon://collapse-all", type:"Emphasized", busy:"{/busy}",            
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A47", "", "", "", "")});
            oTool1.addContent(oToolBtn2);

        //tree 전체접힘 이벤트
        oToolBtn2.attachPress(function(){
            loApp.ui.oTree.collapseAll();
            loApp.ui.oTree.expand(0);
        });


        //A84  UI Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84", "", "", "", "");

        //UI Object ID 컬럼.        
        var oLCol1 = new sap.ui.table.Column();
        loApp.ui.oTree.addColumn(oLCol1);

        var oHbox1 = new sap.m.HBox({width:"100%", alignItems:"Center", 
            justifyContent:"SpaceBetween", wrap:"NoWrap"});
        oLCol1.setTemplate(oHbox1);

        var oHbox2 = new sap.m.HBox({renderType:"Bare", alignItems:"Center"});
        oHbox1.addItem(oHbox2);

        //UI 아이콘
        var oImage = new sap.m.Image({src:"{UICON}", width:"19px", visible:"{icon_visible}"});
        oHbox2.addItem(oImage);

        oImage.addStyleClass("sapUiTinyMarginEnd");

        //UI명.
        var oLtxt1 = new sap.m.Text({text:"{OBJID}", wrapping:false});
        oHbox2.addItem(oLtxt1);


        //embedded aggregation.
        var oStat = new sap.m.ObjectStatus({text:"{UIATT}", icon:"{UIATT_ICON}"});
        oHbox1.addItem(oStat);

        loApp.ui.oTree.bindAggregation("rows", {path:"/zTREE", template: new sap.ui.table.Row(),
            parameters: {arrayNames:["zTREE"]}});


        //팝업 호출 처리.
        loApp.ui.oDlg.open();
        

    };  //UI 개인화 정보 저장 팝업.




    //팝업 종료 이벤트.
    function lf_afterClose(){
        
        //팝업 UI 제거.
        loApp.ui.oDlg.destroy();

        //광역 구조 초기화.
        loApp = {ui:{}, attr:{is_tree:{}, frameID:"", theme:"", bootPath:"", T_THEME:[], HTML:"", mode:""}};

    }   //팝업 종료 이벤트.




    //개인화 UI의 미리보기용 HTML 정보 구성.
    function lf_getUiHTML(){

        if(!oAPP.attr.prev[loApp.oModel.oData?.zTREE[0]?.OBJID]?.getDomRef){return;}

        //미리보기의 DOM 정보 얻기.
        var l_dom = oAPP.attr.prev[loApp.oModel.oData.zTREE[0].OBJID].getDomRef();
        if(!l_dom){return;}

        loApp.attr.HTML = new XMLSerializer().serializeToString(l_dom);

        //HTML 내용 return.
        return loApp.attr.HTML;
        

    }   //개인화 UI의 미리보기용 HTML 정보 구성.




    //개인화 미리보기 화면 구성.
    function lf_setP13nPrevHTML(sHTML){
        //패턴 개인화 미리보기 IFRAME 정보 얻기.
        var l_frame = document.getElementById(loApp.attr.frameID);
        if(!l_frame){return;}

        //개인화 미리보기의 DOM 정보 얻기.
        var l_prev = l_frame.contentDocument.getElementById("prev");

        //DOM 정보를 얻지 못한 경우 생성 처리.
        if(!l_prev){
            l_prev = document.createElement("div");
    
            l_prev.id = "prev";
    
            l_prev.style.width = "100%";
            l_prev.style.height = "100%";
    
            l_frame.contentDocument.body.appendChild(l_prev);
        }

        //패턴 개인화 미리보기 HTML 정보 매핑.
        l_prev.innerHTML = sHTML;

        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === loApp.attr.is_tree.UIOBK );
        if(!ls_0022){return;}
        
        //개인화를 위해 선택한 UI가 POPUP 유형인지 확인.
        if(oAPP.attr.S_CODE.UA026.findIndex( a=> a.FLD01 === ls_0022.LIBNM && a.FLD02 !== "X" ) !== -1){
            //팝업 유형인경우 innerHTML 값으로 처리.
            //(팝업의 outerHTML으로 미리보기 화면을 구성하는 경우 css의 top, left 등의 값 때문에
            //화면 중앙에 위치하지 않는 문제가 있기에 innerHTML으로 미리보기 화면을 구성함)
            l_prev.children[0].style.cssText = "width:100%; height:100%;";
        }

    }   //개인화 미리보기 화면 구성.



    //패턴 개인화 미리보기 화면 load 완료시 호출 function.
    oAPP.fn.P13nPrevLoaded = function(){

        //개인화 UI의 미리보기용 HTML 정보 구성.
        var l_html = lf_getUiHTML();
        if(!l_html){return;}


        //개인화 미리보기 화면 구성.
        lf_setP13nPrevHTML(l_html);


    };  //패턴 개인화 미리보기 화면 load 완료시 호출 function.




    //개인화 미리보기 테마 변경 function.
    oAPP.fn.P13nChangeTheme = function(sTheme){

        var l_frame = document.getElementById(loApp.attr.frameID);
        if(!l_frame){return;}

        l_frame.contentWindow.sap.ui.getCore().applyTheme(sTheme);

    };  //개인화 미리보기 테마 변경 function.




    //header edit/display 처리.
    function lf_toggleHeaderEditable(bEdit, bSkipSetData){

        //default display 처리.
        var ls_vis = {
            head_edit: true,                //편집버튼 활성.
            head_save: true,                //저장버튼 활성.
            head_canc: false,               //취소버튼 비활성
            head_dele: false,               //삭제버튼 비활성.
            head_refr: true,                //갱신버튼 활성.
            head_mode: "Single",            //header 단일 선택 처리.

        };

        if(loApp.attr.mode !== "C"){
            ls_vis.head_save = false;
        }

        //편집 flag가 입력된경우.
        if(bEdit){
            ls_vis = {
                head_edit: false,           //편집버튼 비활성.
                head_save: true,            //저장버튼 활성.
                head_canc: true,            //취소버튼 활성
                head_dele: true,            //삭제버튼 활성.
                head_refr: false,           //갱신버튼 비활성.
                head_mode: "MultiToggle",   //header 멀티 선택 처리.
            };
        }

        //모델에 반영 skip flag가 입력된 경우 구성한 정보 return.
        if(bSkipSetData){
            return ls_vis;
        }

        //모델에 반영 처리.
        loApp.oModel.setData({is_edit: ls_vis}, true);

    }  //header edit/display 처리.




    //개인화 미리보기 html 파라메터 구성.
    function lf_setParam(oForm, name, value){

        var iput = document.createElement("input");
            iput.setAttribute("name", name);
            iput.setAttribute("value", value);
            iput.setAttribute("type", "hidden");
            oForm.appendChild(iput);

    }   //개인화 미리보기 html 파라메터 구성.




    //초기값 설정.
    function lf_setInitData(is_tree, sMode){
        
        //패턴 개인화 대상 tree 라인정보 광역화.
        loApp.attr.is_tree = is_tree;

        //진입시 모드 설정.(C, R)
        loApp.attr.mode = sMode;
        
        //bootstrap url path.
        loApp.attr.bootPath = oAPP.fn.getBootStrapUrl();

        //default 테마 정보 매핑.
        loApp.attr.theme = oAPP.attr.prev.ROOT._T_0015.find( a => a.UIATK === "DH001021" )?.UIATV || "sap_horizon";
        
        //테마 ddlb 정보 구성.
        loApp.attr.T_THEME = [];
        for(var i=0, l=oAPP.attr.S_CODE.UA007.length; i<l; i++){
            loApp.attr.T_THEME.push({key:oAPP.attr.S_CODE.UA007[i].FLD01});
        }

    }   //초기값 설정.




    //패턴 개인화 팝업 세팅.
    function lf_setP13nData(is_tree, bFirst){

        //처음 개인화 팝업을 호출한 경우.
        if(bFirst){
            sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, lf_loadP13nPrevHTML);
        }

        var lt_tree = [];
        if(is_tree){
            lt_tree.push(is_tree);
        }
        
        //tree 데이터 바인딩.
        loApp.oModel.setData({zTREE:lt_tree, 
                        desc:"", 
                        T_THEME:loApp.attr.T_THEME, 
                        T_HEAD: lf_getP13nHeaderData(bFirst),
                        is_edit: lf_toggleHeaderEditable(false, true),
                        THEME:loApp.attr.theme});

        //전체 펼침 처리.
        loApp.ui.oTree.expandToLevel(99999999);
        

    }   //패턴 개인화 팝업 세팅.




    //개인화 header list 정보 구성.
    function lf_getP13nHeaderData(bFirst, bChange){

        
        //개인화 파일 PATH 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

        //개인화 파일이 존재하지 않는다면.
        if(parent.FS.existsSync(l_path) !== true){

            //최초 호출건인경우.
            if(bFirst && loApp.attr.mode === "C"){
                return [{title:"", fileName:"", selected:false, highlight:"Information",
                    edit:true, visible_txt:false, visible_inp:true, isNew:true}];
            }
            
            //E29  Personalization
            //196  &1 does not exist.
            var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E29", "", "", "", ""), "", "", "");

            parent.showMessage(sap, 10, "I", l_txt);
            return [];
        }

        //파일정보 read.
        var l_file = parent.FS.readFileSync(l_path, "utf-8");

        //파일 정보를 read 하지 못한 경우.
        if(!l_file){

            //최초 호출건인경우.
            if(bFirst && loApp.attr.mode === "C"){
                return [{title:"", fileName:"", selected:false, highlight:"Information",
                    edit:true, visible_txt:false, visible_inp:true, isNew:true}];
            }
            
            //E29  Personalization
            //196  &1 does not exist.
            var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E29", "", "", "", ""), "", "", "");

            parent.showMessage(sap, 10, "I", l_txt);
            return [];
        }

        var lt_head = JSON.parse(l_file);

        for(var i=0, l=lt_head.length; i<l; i++){
            lt_head[i].selected = false;
            lt_head[i].highlight = "None";
            lt_head[i].edit = false;
            lt_head[i].visible_txt = true;
            lt_head[i].visible_inp = false;

            //편집 flag가 입력된경우.
            if(bChange){
                lt_head[i].edit = true;
                lt_head[i].visible_txt = false;
                lt_head[i].visible_inp = true;
            }

        }

        //편집 flag가 입력된 경우 현재 head의 최상위가 신규 라인인경우.
        if(bChange && loApp.oModel?.oData?.T_HEAD[0].isNew){
            //신규 라인 유지 처리.
            lt_head.splice(0, 0, loApp.oModel?.oData?.T_HEAD[0]);
        }


        //팝업오픈 후 최초 head를 구성하는 경우, 생성을 위한 호출인경우 신규라인 추가.
        if(bFirst){
            lt_head.splice(0, 0, {title:"", fileName:"", selected:false, highlight:"Information",
            edit:true, visible_txt:false, visible_inp:true, isNew:true});
        }        

        //개인화 header 정보 return.
        return lt_head;

    }   //개인화 header list 정보 구성.




    //개인화 미리보기 html load.
    function lf_loadP13nPrevHTML(){

        //이벤트 제거 처리.
        sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, lf_loadP13nPrevHTML);


        //접속 유저 정보 얻기.
        var l_info = parent.getUserInfo();

        //개인화 미리보기 iframe dom 정보 얻기.
        var l_dom = document.getElementById(loApp.attr.frameID);

        var oForm = document.createElement("form");
        oForm.setAttribute("id",     "prvSendForm");
        oForm.setAttribute("target", l_dom.id);
        oForm.setAttribute("method", "POST");
        oForm.setAttribute("action", parent.getHost() + "/zu4a_wbc/u4a_ipcmain/getP13nPreviewHTML");
        oForm.style.display = "none";

        //client 파라메터 추가.
        lf_setParam(oForm, "sap-client", l_info.CLIENT);

        //접속 언어 파라메터 추가.
        lf_setParam(oForm, "sap-language", l_info.LANGU);
        
        //SAP 접속 ID 파라메터 추가.
        lf_setParam(oForm, "sap-user", l_info.ID);

        //SAP 접속 PW 파라메터 추가.
        lf_setParam(oForm, "sap-password", l_info.PW);

        //라이브러리 bootstrap 경로 파라메터 추가.
        lf_setParam(oForm, "LIBPATH", loApp.attr.bootPath);

        //LOAD 대상 LIBRARY 항목 파라메터 추가.
        lf_setParam(oForm, "LIBRARY", oAPP.fn.getUi5Libraries(true));

        //미리보기 THEME 정보 파라메터 추가.
        lf_setParam(oForm, "THEME", loApp.attr.theme);

        //미리보기에 적용할 언어 정보.
        lf_setParam(oForm, "LANGU", l_info.LANGU);

        //미리보기 HTML LOAD 이후 호출할 CALLBACK FUNCTION 구성.
        lf_setParam(oForm, "CALLBACKFUNC", "parent.oAPP.fn.P13nPrevLoaded();");
        
        document.body.appendChild(oForm);

        oForm.submit();

        document.body.removeChild(oForm);

    }   //개인화 미리보기 html load.




    //개인화 정보 저장 처리.
    function lf_saveP13nData(){
        
        //UI 개인화 저장 json 구조.
        var ls_save = {is_tree:lf_collectSaveData(loApp.attr.is_tree), 
            HTML:loApp.attr.HTML || "",
            THEME:loApp.oModel.oData.THEME,
            bootPath:loApp.attr.bootPath};

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            parent.FS.mkdirSync(l_folderPath);
        }

        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, C_HEADER_FILE);


        //default 개인화 파일 header 정보.
        var lt_head = [];

        //개인화 파일이 header 존재하는 경우 해당 파일 read.
        if(parent.FS.existsSync(l_filePath)){
            lt_head = JSON.parse(parent.FS.readFileSync(l_filePath, "utf-8"));
            
            //기존 header 파일 제거 처리.
            parent.FS.unlinkSync(l_filePath);

        }

        //파일명 구성.
        var l_fileName = lf_getFileName(lt_head);

        //파일명 정보 추가.
        lt_head.splice(0, 0, {fileName:l_fileName, title:loApp.oModel.oData.T_HEAD[0].title});

        try{
            //header 정보 저장 처리.
            parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));
        }catch(e){
            parent.showMessage(sap, 10, "I", e);
            return;
        }
        
        try{
            //개인화 폴더에 json 형식으로 저장 처리.
            parent.FS.writeFileSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, l_fileName),
                JSON.stringify(ls_save));
        }catch(e){
            parent.showMessage(sap, 10, "I", e);
            return;
        }


        //저장 후 다시 검색하여 결과리스트 갱신 처리.
        lf_setP13nData(loApp.attr.is_tree);
    
        //002  Saved success
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", "", ""));

    }   //개인화 정보 저장 처리.



    //파일명 구성.
    function lf_getFileName(it_head){
        var l_fname = "",
            l_temp = "";

        while(l_fname === ""){

            //랜덤으로 json 파일명구성.
            l_temp = oAPP.fn.getRandomKey() + ".json";

            //header json 정보에 랜덤 파일명이 존재하지 않는다면.
            if(it_head.findIndex( a => a.fileName === l_temp ) === -1){
                l_fname = l_temp;

                //실제 파일이 존재하는경우 파일명을 다시 구성.
                if(parent.FS.existsSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, l_fname))){
                    l_fname = "";
                }
                
            }
        }

        return l_fname;
        
    }   //파일명 구성.



    //tree 저장 데이터 구성.
    function lf_collectSaveData(is_tree){

        var ls_0014 = oAPP.fn.crtStru0014();

        oAPP.fn.moveCorresponding(is_tree, ls_0014);

        //UI의 아이콘.
        //(full path에서 아이콘 파일명만 발췌 d:\\..\\..\\..\\ICON_DIALGHELP.gif 에서 ICON_DIALGHELP.gif 만 발췌함)
        ls_0014.UICON = parent.PATH.basename(is_tree.UICON);

        //확장자 제거.
        ls_0014.UICON = ls_0014.UICON.replace(".gif", "");

        //embedded aggregation 아이콘.
        ls_0014.UIATT_ICON = is_tree.UIATT_ICON;

        //실제 라이브러리의 정보 검색.
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === ls_0014.UIOBK);
        
        //실제 라이브러리명을 재 매핑(sap.m.Button)
        if(ls_0022){            
            ls_0014.UILIB = ls_0022.LIBNM;
        }          

        //바인딩, 이벤트 항목 제외.
        ls_0014._T_0015 = oAPP.attr.prev[is_tree.OBJID]._T_0015.filter( a=> a.ISBND !== "X" && a.UIATY !== "2" );

        if(is_tree.zTREE.length === 0){return ls_0014;}

        ls_0014.zTREE = [];

        //child가 존재하는경우 하위를 탐색하며 저장정보 구성.
        for(var i=0, l=is_tree.zTREE.length; i<l; i++){
            ls_0014.zTREE.push(lf_collectSaveData(is_tree.zTREE[i]));
        }

        return ls_0014;

    }   //tree 저장 데이터 구성.



    //팝업 종료 처리.
    function lf_close(sMSGNO){
        
        loApp.ui.oDlg.close();

        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", sMSGNO, "", "", "", ""));

    }   //팝업 종료 처리.




    //팝업 사이즈 변경처리.
    function lf_setPopupResize(oBtn){
        
        var l_dom = loApp.ui.oDlg.getDomRef();

        switch(loApp.ui.oDlg.__fullSize){
            case true:  //전체화면 상태인경우.

                //버튼 아이콘 변경.
                oBtn.setIcon("sap-icon://full-screen");

                //전체화면 상태 flag 해제 처리.
                loApp.ui.oDlg.__fullSize = false;

                //이전 팝업창 크기값 매핑.
                l_dom.style.width = loApp.ui.oDlg.__width;
                l_dom.style.height = loApp.ui.oDlg.__height;
                break;

            case false: //전체화면이 아닌경우.
            default:

                //버튼 아이콘 변경.
                oBtn.setIcon("sap-icon://exit-full-screen");

                //전체화면 상태 flag 처리.
                loApp.ui.oDlg.__fullSize = true;

                //이전 팝업창 크기 정보.
                loApp.ui.oDlg.__width = l_dom.style.width;
                loApp.ui.oDlg.__height = l_dom.style.height;

                //팝업창 size를 최대로 변경.
                l_dom.style.width = "100%";
                l_dom.style.height = "100%";

        }

        loApp.ui.oDlg._positionDialog();

    }   //팝업 사이즈 변경처리.




    //header 정보 변경건 존재 여부 확인.
    function lf_getHeaderChangedData(){
        if(!loApp.oModel.oData.T_HEAD){return;}

        //header 변경건 정보 존재시 true return.
        return loApp.oModel.oData.T_HEAD.findIndex( a=> a.isNew === true || a.isChange === true) !== -1 ? true : false;

    }   //header 정보 변경건 존재 여부 확인.




    //편집 버튼 선택 이벤트.
    function lf_setHeaderEdit(){

        //header 정보 재구성.
        var lt_head = lf_getP13nHeaderData(false, true);

        //편집 처리.
        var ls_edit = lf_toggleHeaderEditable(true, true);

        //모델 갱신 처리.
        loApp.oModel.setData({is_edit:ls_edit, T_HEAD: lt_head}, true);

    }   //편집 버튼 선택 이벤트.
    
    

    //header 취소버튼 선택 이벤트.
    function lf_setHeaderCancel(){

        //변경건이 존재하지 않는경우.
        if(lf_getHeaderChangedData() !== true){

            //저장 이후 화면 재구성.
            lf_setP13nData(loApp.attr.is_tree);
            return;
        }

        //063  Changes are not saved. Do you want to continue?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "063", "", "", "", ""), function(sParam){
            
            //YES를 선택하지 않은경우 EXIT.
            if(sParam !== "YES"){return;}

            //화면 재구성 처리.
            lf_setP13nData();

        });

    }   //header 취소버튼 선택 이벤트.



    //header 저장버튼 선택 이벤트.
    function lf_setHeaderSave(){

        //header 정보가 존재하지 않는경우.
        if(loApp.oModel.oData.T_HEAD.length === 0){
            //A64  Save
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", ""), "", "", ""));
            return;
        }

        //변경건이 존재하지 않는경우.
        if(lf_getHeaderChangedData() !== true){
            //A02  Change
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A02", "", "", "", ""), "", "", ""));
            return;
        }


        //010  Do you want to save it?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "010", "", "", "", ""), lf_setHeaderSaveCB);

    }  //header 저장버튼 선택 이벤트.




    //item 저장 처리.
    function lf_saveItemData(is_head){
        
        var ls_item = {};

        //tree 저장 정보 구성.
        ls_item.is_tree = lf_collectSaveData(loApp.attr.is_tree);

        //미리보기 HTML정보.
        ls_item.HTML = loApp.attr.HTML;

        //미리보기 테마 선택건.
        ls_item.THEME = loApp.oModel.oData.THEME;

        //미리보기 bootPath정보.
        ls_item.bootPath = loApp.attr.bootPath;

            
        try{
            //개인화 폴더에 json 형식으로 저장 처리.
            parent.FS.writeFileSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, is_head.fileName),
                JSON.stringify(ls_item));
        }catch(e){
            parent.showMessage(sap, 10, "I", e);
            return;
        }

    }   //item 저장 처리.




    //header 저장전 확인팝업 callback 이벤트.
    function lf_setHeaderSaveCB(sParam){

        //YES를 선택하지 않은경우 EXIT.
        if(sParam !== "YES"){return;}

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            parent.FS.mkdirSync(l_folderPath);
        }


        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

        //default 개인화 파일 header 정보.
        var lt_head = [];

        //개인화 파일이 header 존재하는 경우 해당 파일 read.
        if(parent.FS.existsSync(l_filePath)){
            lt_head = JSON.parse(parent.FS.readFileSync(l_filePath, "utf-8"));
            
            //기존 header 파일 제거 처리.
            parent.FS.unlinkSync(l_filePath);

        }

        //header 정보를 기준으로 저장 정보 구성.
        for(var i=0, l=loApp.oModel.oData.T_HEAD.length; i<l; i++){

            var l_title = loApp.oModel.oData.T_HEAD[i].title;
            var fileName = loApp.oModel.oData.T_HEAD[i].fileName;

            //신규건인경우.
            if(loApp.oModel.oData.T_HEAD[i].isNew){
                //파일명 구성.
                fileName = lf_getFileName(lt_head);

                //header 최상위에 라인 추가.
                lt_head.splice(0, 0, {title:l_title, fileName:fileName});
   
                //아이템 저장 처리.
                lf_saveItemData({title:l_title, fileName:fileName});

                continue;
            }

            //변경 flag가 존재하지 않는다면 header에 업데이트 skip.
            if(loApp.oModel.oData.T_HEAD[i].isChange !== true){
                continue;
            }

            //기존 저장건에서 현재 header와 같은 라인 정보 얻기.
            var l_indx = lt_head.findIndex( a=> a.fileName === fileName);
            
            //현재 head 정보와 같은 라인 정보가 있다면.
            if(l_indx !== -1){
                //title 업데이트.
                lt_head[l_indx].title = l_title;
            }

        }

        try{
            //header 정보 저장 처리.
            parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));
        }catch(e){
            //header 정보 저장중 오류발생시 오류 메시지 처리.
            parent.showMessage(sap, 20, "E", e);
            return;
        }

        //저장 이후 화면 재구성.
        lf_setP13nData(loApp.attr.is_tree);

        //002  Saved success
        parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", ""));


    }  //header 저장전 확인팝업 callback 이벤트.



    //header 삭제버튼 선택 이벤트.
    function lf_setHeaderDelete(){

        //라인 선택건이 존재하지 않는경우.
        if(loAPP.oModel.oData.T_HEAD.findIndex( a=> a.selected === true ) === -1){
            //268  Selected line does not exists.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", ""));
            return;
        }
        
        //379  Delete selected rows?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "379", "", "", "", ""), lf_setHeaderDeleteCB);

    }   //header 삭제버튼 선택 이벤트.




    //header 삭제전 확인팝업 callback 이벤트.
    function lf_setHeaderDeleteCB(sParam){

        //YES를 선택하지 않은경우 EXIT.
        if(sParam !== "OK"){return;}

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER_NAME, C_SYSID);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            parent.FS.mkdirSync(l_folderPath);
        }


        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER_NAME, C_SYSID, C_HEAD_FILE_NAME);

        //default 개인화 파일 header 정보.
        var lt_head = [];

        //개인화 파일이 header 존재하는 경우 해당 파일 read.
        if(parent.FS.existsSync(l_filePath)){
            lt_head = JSON.parse(parent.FS.readFileSync(l_filePath, "utf-8"));
            
            //기존 header 파일 제거 처리.
            parent.FS.unlinkSync(l_filePath);

        }

        //header 정보를 기준으로 삭제 정보 구성.
        for(var i=LoAPP.oModel.oData.T_HEAD.length-1; i>=0; i--){

            if(LoAPP.oModel.oData.T_HEAD[i].selected !== true){continue;}

            var l_title = LoAPP.oModel.oData.T_HEAD[i].title;
            var fileName = LoAPP.oModel.oData.T_HEAD[i].fileName;

            //기존 저장건에서 현재 header와 같은 라인 정보 얻기.
            var l_indx = lt_head.findIndex( a=> a.fileName === fileName);
            
            //현재 head 정보와 같은 라인 정보가 있다면.
            if(l_indx !== -1){
                //해당 라인 삭제 처리.
                lt_head.splice(l_indx, 1);
            }

            LoAPP.oModel.oData.T_HEAD.splice(i,1);

            
            //개인화 item 정보를 얻기위한 path 구성.
            var l_path = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER_NAME, C_SYSID, fileName);

            try{
                //기존 header 파일 제거 처리.
                parent.FS.unlinkSync(l_path);
            }catch(e){

            }
        }

        try{
            //header 정보 저장 처리.
            parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));
        }catch(e){
            //header 정보 저장중 오류발생시 오류 메시지 처리.
            parent.showMessage(sap, 20, "E", e);
            return;
        }


        //저장 이후 화면 재구성.
        lf_setP13nData();

        //015  Removed.
        parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "015", "", "", ""));

        
    }   //header 삭제전 확인팝업 callback 이벤트.




    //갱신 버튼 선택 이벤트.
    function lf_setHeaderRefresh(){

    }   //갱신 버튼 선택 이벤트.



    //header text 변경 이벤트.
    function lf_headerChangeLine(){

        var l_ctxt = this.getBindingContext();
        if(!l_ctxt){return;}

        //변경 flag 처리.
        loApp.oModel.setProperty("isChange", true, l_ctxt);

    }   //header text 변경 이벤트.




    //header 라인선택 이벤트.
    function lf_selHeaderLine(is_head){

        if(!is_head){return;}

        //신규 라인인경우.
        if(is_head.isNew){
            //tree 갱신 처리.
            loApp.oModel.setData({zTREE:[loApp.attr.is_tree]},true);

            //미리보기 화면 갱신.
            lf_setP13nPrevHTML(loApp.attr.HTML);
            return;
        }

        //header의 item 정보 얻기.
        var ls_item = lf_getItemData(is_head);

        //tree의 아이콘 구성 처리.
        oAPP.fn.setTreeUiIcon(ls_item.is_tree);

        //tree 갱신 처리.
        loApp.oModel.setData({zTREE:[ls_item.is_tree]},true);

        //미리보기 화면 갱신.
        lf_setP13nPrevHTML(ls_item.HTML);
        
    }   //header 라인선택 이벤트.




    //header의 item 정보 얻기.
    function lf_getItemData(is_head){

        //개인화 item 정보를 얻기위한 path 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, is_head.fileName);

        //개인화 파일이 존재하지 않는다면.
        if(parent.FS.existsSync(l_path) !== true){
            //메시지 처리.
            //E29  Personalization
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E29", "", "", "", ""), "", "", ""));

            return;
        }


        //파일정보 read.
        var l_file = parent.FS.readFileSync(l_path, "utf-8");

        //파일 정보를 read 하지 못한 경우.
        if(!l_file){
            //메시지 처리.
            //E29  Personalization
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "018", "", "", "", ""));

            return;
        }

        //개인화 header 정보 return.
        return JSON.parse(l_file);


    }   //header의 item 정보 얻기.












})();

