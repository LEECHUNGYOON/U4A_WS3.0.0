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
    oAPP.fn.callP13nDesignDataPopup = function(sMode, is_tree){

        //ROOT는 개인화 저장 불가.
        if(is_tree && is_tree.OBJID === "ROOT"){
            //380  &1 cannot be personalized.
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "380", "ROOT", "", "", ""));

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");
            
            return;
        }

        //개인화 폴더 및 파일이 존재하지 않는경우 생성 처리.
        if(lf_createDefaultFolder()){
            //생성 과정에서 문제 발생시 exit.

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }
        
        //초기값 구성.
        lf_setInitData(sMode);

        //개인화 팝업.
        loApp.ui.oDlg = new sap.m.Dialog({resizable:true, draggable: true, verticalScrolling:false,
            contentWidth:"70%", contentHeight:"60%"}).addStyleClass("sapUiSizeCompact");

        loApp.ui.oDlg.setInitialFocus("");

        //팝업 더블클릭 이벤트.
        loApp.ui.oDlg.attachBrowserEvent("dblclick", function(oEvent){

            //이벤트 발생 dom으로 부터 UI instance정보 얻기.
            var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

            //dialog의 toolbar에서 더블클릭 한경우.
            if(l_ui && l_ui.sParentAggregationName === "customHeader" && l_ui.oParent && l_ui.oParent.getMetadata()._sClassName === "sap.m.Dialog"){

                //팝업 사이즈 변경.
                lf_setPopupResize(oBtn3);
            }

            //이벤트 전파 방지.
            event.preventDefault();
            event.stopPropagation();
        });
        

        //팝업 호출 후 이벤트.
        loApp.ui.oDlg.attachAfterOpen(function(){
            lf_dialogAfterOpen(is_tree);
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
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E24", "", "", "", "");

        if(is_tree){
            l_txt = l_txt + " - " + is_tree.OBJID;
        }

        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt}).addStyleClass("sapUiTinyMarginEnd");
        oTool0.addContent(oTitle);

        //A05  Display
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A05", "", "", "", "");
        var oTitle1 = new sap.m.Title({text:l_txt, tooltip:l_txt, visible:"{/visible_displayTitle}"});
        oTool0.addContent(oTitle1);

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
        }); //팝업 종료 이벤트.

        //개인화 팝업 좌, 우 화면 분할 Splitter UI.
        var oSApp = new sap.ui.layout.Splitter();
        loApp.ui.oDlg.addContent(oSApp);


        //좌측 NAVI CONTAINER.
        loApp.ui.oNav = new sap.m.NavContainer({
            layoutData:new sap.ui.layout.SplitterLayoutData({size:"33%", minSize:30})});
        oSApp.addContentArea(loApp.ui.oNav);

        //더미 페이지 추가.
        loApp.ui.oNav.addPage(new sap.m.Page({showHeader:false}));

        //개인화 title 등록 화면.
        loApp.ui.oRegPage = new sap.m.Page({enableScrolling:false}).addStyleClass("sapUiContentPadding");
        loApp.ui.oNav.addPage(loApp.ui.oRegPage);

        //화면 이동후 이벤트.
        loApp.ui.oNav.attachAfterNavigate(function(){
            lf_afterNavigate();
        }); //화면 이동후 이벤트.

        var oTool4 = new sap.m.Toolbar();
        loApp.ui.oRegPage.setCustomHeader(oTool4);

        //E30  Back
        //뒤로가기 버튼.
        var oBtn6 = new sap.m.Button({icon: "sap-icon://nav-back",
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E30", "", "", "", "")});
        oTool4.addContent(oBtn6);

        //뒤로가기 이벤트.
        oBtn6.attachPress(function(){
            lf_back();
        }); //뒤로가기 이벤트.

        oTool4.addContent(new sap.m.ToolbarSeparator());

        //A64  Save
        //저장
        var oBtn4 = new sap.m.Button({icon: "sap-icon://save",
            type:"Accept", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", "")});
        oTool4.addContent(oBtn4);

        //저장 버튼 선택 이벤트.
        oBtn4.attachPress(function(){
            lf_saveP13nData();
        }); //저장 버튼 선택 이벤트.


        //A03  Delete
        //삭제버튼.
        var oBtn5 = new sap.m.Button({icon: "sap-icon://delete", visible:"{/is_head/visible_delete}", 
            type:"Negative", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});
        oTool4.addContent(oBtn5);

        //삭제 버튼 선택 이벤트.
        oBtn5.attachPress(function(){
            lf_setHeaderLineDelete(loApp.oModel.oData.is_head.fileName);
        }); //삭제 버튼 선택 이벤트.


        //A35  Description
        var oTextArea = new sap.m.TextArea({width:"100%", height:"100%", value:"{/is_head/title}",
            placeholder:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", "")});
        loApp.ui.oRegPage.addContent(oTextArea);


        //좌측 개인화 리스트.
        loApp.ui.oHeadListPage = new sap.m.Page({showHeader:false});
        loApp.ui.oNav.addPage(loApp.ui.oHeadListPage);

        
        //개인화 리스트 table.
        loApp.ui.oTab = new sap.ui.table.Table({visibleRowCountMode:"Auto", rowActionCount:2,
            selectionBehavior:"RowOnly", selectionMode:"Single"});
        loApp.ui.oHeadListPage.addContent(loApp.ui.oTab);

        //Drag a personalization list item to drop it into the design tree.
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(parent.WSUTIL.getWsSettingsInfo().globalLanguage, "ZMSG_WS_COMMON_001", "062");

        loApp.ui.oTab.setFooter(new sap.m.Text({wrapping:false, text:l_txt, tooltip:l_txt}));

        //라인선택 이벤트.
        loApp.ui.oTab.attachRowSelectionChange(function(oEvent){
            //라인 선택 변경 이벤트 처리.
            lf_rowSelectionChange(oEvent);
        }); //라인선택 이벤트.

        

        //table에 hook 이벤트 추가.
        sap.ui.table.utils._HookUtils.register(loApp.ui.oTab, 
            sap.ui.table.utils._HookUtils.Keys.Signal, function(oEvent){

            //action icon 색상 처리.
            lf_setTableActionIconColor(oEvent);

            //테이블의 라인 style 처리.
            lf_setTableStyle(oEvent);
                 
        });


        //라인 선택 강조 ui.
        loApp.ui.oTab.setRowSettingsTemplate(new sap.ui.table.RowSettings({highlight:"{highlight}"}));


        //drop UI 생성.
        var oDrop = new sap.ui.core.dnd.DropInfo({enabled:false});
        loApp.ui.oHeadListPage.addDragDropConfig(oDrop);

        oDrop.attachDragEnter(function(oEvent){
            var l_dom = oEvent.mParameters.dragSession.getIndicator();
            if(!l_dom){return;}
            l_dom.classList.remove("u4aWsDisplayNone");
        }); //drop 이벤트.

        //drop 이벤트.
        oDrop.attachDrop(function(oEvent){
            lf_DropData(oEvent);
        }); //drop 이벤트.
        


        //라인별 action 버튼.
        var oAct = new sap.ui.table.RowAction();
        loApp.ui.oTab.setRowActionTemplate(oAct);

        //B38  Edit
        //편집 버튼.
        var oItem1 = new sap.ui.table.RowActionItem({icon:"sap-icon://edit", visible:"{visible_edit}",
            text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B38", "", "", "", "")});
            oItem1.data({key:"EDIT"});

        oAct.addItem(oItem1);

        //편집 버튼 선택 이벤트.
        oItem1.attachPress(function(oEvent){
            lf_setHeaderLineEdit(oEvent);
        }); //편집 버튼 선택 이벤트.


        //A03  Delete
        //삭제 버튼.
        var oItem2 = new sap.ui.table.RowActionItem({icon:"sap-icon://delete", visible:"{visible_delete}",
            text:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});
        oItem2.data({key:"DELETE"});
        oAct.addItem(oItem2);

        //삭제 버튼 선택 이벤트.
        oItem2.attachPress(function(oEvent){

            var l_ctxt = this.getBindingContext();
            if(!l_ctxt){return;}

            //라인 삭제 처리.
            lf_setHeaderLineDelete(l_ctxt.getProperty("fileName"));

        }); //삭제 버튼 선택 이벤트.


        //drag UI 생성.
        var oDrag1 = new sap.ui.core.dnd.DragInfo({sourceAggregation:"rows"});
        loApp.ui.oTab.addDragDropConfig(oDrag1);

        //drag start 이벤트
        oDrag1.attachDragStart(function(oEvent){
            //drag start 처리.
            lf_dragStart(oEvent);
        }); //drag start 이벤트


        //drag end 이벤트
        oDrag1.attachDragEnd(function(oEvent){
            //drag end 처리.
            lf_dragEnd(oEvent);
        }); //drag end 이벤트

        var oTool3 = new sap.m.Toolbar();
        loApp.ui.oTab.setToolbar(oTool3);


        // //A03  Delete
        // //삭제버튼.
        // var oDelete = new sap.m.Button({icon: "sap-icon://delete", visible: "{/is_edit/head_dele}",
        //     type:"Negative", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A03", "", "", "", "")});

        // //삭제버튼 선택 이벤트.
        // oDelete.attachPress(function(){
        //     lf_setHeaderDelete();
        // }); //삭제버튼 선택 이벤트.

        // oTool3.addContent(oDelete);


        //A48  Refresh
        //갱신버튼.
        var oRefresh = new sap.m.Button({icon: "sap-icon://refresh",
            type:"Emphasized", tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A48", "", "", "", "")});

        //갱신버튼 선택 이벤트.
        oRefresh.attachPress(function(){
            lf_setHeaderRefresh();
        }); //갱신버튼 선택 이벤트.

        oTool3.addContent(oRefresh);


        var oCol1 = new sap.ui.table.Column({label:"Description", sortProperty:"title", filterProperty:"title"});
        loApp.ui.oTab.addColumn(oCol1);

        //header text.    
        var oExpTxt1 = new sap.m.Text({text:"{title}", tooltip:"{tooltip}", wrapping:false});
        oCol1.setTemplate(oExpTxt1);


        loApp.ui.oTab.bindAggregation("rows", {path:"/T_HEAD", template:new sap.ui.table.Row()});

        //가운데 미리보기 영역 + 우측 tree의 영역.
        loApp.ui.oPrevNav = new sap.m.NavContainer();
        oSApp.addContentArea(loApp.ui.oPrevNav);

        loApp.ui.oPrevNav.attachAfterNavigate(function(){

            //iframe이 load되었다면 exit.
            if(loApp.attr.frameLoaded){
                
                //미리보기 화면 갱신.
                lf_setP13nPrevHTML(loApp.attr.HTML);
                
                parent.setBusy();

                return;
            }

            //iframe이 load 안됐다면 load함 flag 처리.
            loApp.attr.frameLoaded = true;

            //iframe load 처리.
            lf_loadP13nPrevHTML();

        });

        //더미 페이지 추가.
        loApp.ui.oInitPage = new sap.m.Page({showHeader:false})
        loApp.ui.oPrevNav.addPage(loApp.ui.oInitPage);

        var oHbox4 = new sap.m.HBox({width:"100%", height:"100%", 
            alignItems:"Center", alignContent:"Center", renderType:"Bare"});
        loApp.ui.oInitPage.addContent(oHbox4);

        var oImage = new sap.m.IllustratedMessage({illustrationType:"sapIllus-NoEntries"});
        oHbox4.addItem(oImage);

        loApp.ui.oDetail = new sap.ui.layout.Splitter();
        loApp.ui.oPrevNav.addPage(loApp.ui.oDetail);
        

        //가운데 미리보기 page.
        var oPage2 = new sap.m.Page().addStyleClass("u4aP13nPreview sapUiContentPadding");
        loApp.ui.oDetail.addContentArea(oPage2);

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
        loApp.ui.oDetail.addContentArea(oPage1);

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

        //기본 폴더 및 파일이 존재하지 않는경우 생성 처리.
        lf_createDefaultFolder();

        //파일 unlock 처리.
        lf_headerLock(true);
        
        //팝업 UI 제거.
        loApp.ui.oDlg.destroy();

        //광역 구조 초기화.
        loApp = {ui:{}, attr:{is_tree:{}, frameID:"", theme:"", bootPath:"", T_THEME:[], HTML:"", mode:""}};

    }   //팝업 종료 이벤트.




    //테이블의 라인 style 처리.
    function lf_setTableStyle(oEvent){
        
        //테이블 업데이트 종료 시점이 아닌경우 exit.
        if(oEvent !== "EndTableUpdate"){return;}

        //style class 처리된경우 exit.
        if(loApp.ui.oTab.__styled){
            delete loApp.ui.oTab.__styled;
            return;
        }

        //style 처리됨 flag 마킹.
        loApp.ui.oTab.__styled = true;

        var lt_row = loApp.ui.oTab.getRows();
        if(lt_row.length === 0){return;}

        for(var i=0, l=lt_row.length; i<l; i++){

            //style class 제거 처리.
            lf_setTableCellStyle(lt_row[i], "u4aP13nNegativeLine", true);

            //no text css 제거 처리.
            lf_setTableCellStyle(lt_row[i], "u4aP13nPreviewNoText", true);

            var l_ctxt = lt_row[i].getBindingContext();
            if(!l_ctxt){continue;}

            //description이 존재하지 않는경우.
            if(l_ctxt.getProperty("title") === ""){
                //no text css 추가 처리.
                lf_setTableCellStyle(lt_row[i], "u4aP13nPreviewNoText");
            }

            //UI 개인화 사용을 허용하지 않는 경우 CSS 처리.
            if(l_ctxt.getProperty("notAllow") === true){
                //style class 구성 처리.
                lf_setTableCellStyle(lt_row[i], "u4aP13nNegativeLine");    
            }

        }

    }   //테이블의 라인 style 처리.




    //table의 cell에 style class 구성, 제거 처리.
    function lf_setTableCellStyle(oRow, sStyleName, bRemove){

        if(!oRow){return;}

        //cell 정보 얻기.
        var lt_cell = oRow.getCells();

        if(lt_cell.length === 0){return;}

        //default css 추가 function.
        var l_func = "addStyleClass";

        //css 제거 flag가 입력된경우 css 제거 function.
        if(bRemove){
            l_func = "removeStyleClass";
        }

        //cell에 style 매핑.
        for(var i=0, l=lt_cell.length; i<l; i++){
            //addStyleClass(removeStyleClass) function이 존재하지 않는경우 skip.
            if(!lt_cell[i][l_func]){continue;}

            //addStyleClass(removeStyleClass) 처리.
            lt_cell[i][l_func](sStyleName);

        }

    }   //table의 cell에 style class 구성, 제거 처리.




    //테이블 아이콘 색상 처리.
    function lf_setTableActionIconColor(oEvent){

        //테이블 업데이트 시작 시점이 아닌경우 exit.
        if(oEvent !== "StartTableUpdate"){return;}

        //아이콘 색상을 처리된경우 exit.
        if(loApp.ui.oTab.__ActIconColor){
            delete loApp.ui.oTab.__ActIconColor;
            return;
        }

        //아이콘 색상을 처리함 flag 마킹.
        loApp.ui.oTab.__ActIconColor = true;

        var lt_row = loApp.ui.oTab.getRows();
        if(lt_row.length === 0){return;}

        for(var i=0, l=lt_row.length; i<l; i++){

            //아이콘 색상 처리.
            lf_setActionItemColor(lt_row[i]);

        }

    }

    
    //아이콘 색상 처리.
    function lf_setActionItemColor(oRow){
        
        if(!oRow){return;}

        var oAct = oRow.getRowAction();
        if(!oAct){return;}

        var lt_icon = oAct.getAggregation("_icons");

        for(var i=0, l=lt_icon.length; i<l; i++){

            //삭제 아이콘인경우.
            if(lt_icon[i].getSrc() === "sap-icon://delete"){
                //아이콘 색상 처리.
                lt_icon[i].setColor("#fa6161");
                break;
            }

        }

    }   //아이콘 색상 처리.




    //개인화 UI의 미리보기용 HTML 정보 구성.
    function lf_getUiHTML(is_tree){

        if(!oAPP.attr.prev[is_tree.OBJID]?.getDomRef){return;}

        //미리보기의 DOM 정보 얻기.
        var l_dom = oAPP.attr.prev[is_tree.OBJID].getDomRef();
        if(!l_dom){return;}

        var l_tempCSS;
        
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === is_tree.UIOBK );
        
        //개인화를 위해 선택한 UI가 POPUP 유형인지 확인.
        if(ls_0022 && oAPP.attr.S_CODE.UA026.findIndex( a=> a.FLD01 === ls_0022.LIBNM && a.FLD02 !== "X" ) !== -1){
            //팝업 유형인경우 innerHTML 값으로 처리.
            //(팝업의 outerHTML으로 미리보기 화면을 구성하는 경우 css의 top, left 등의 값 때문에
            //화면 중앙에 위치하지 않는 문제가 있기에 innerHTML으로 미리보기 화면을 구성함)

            //임시 기존 css 매핑.
            l_tempCSS = l_dom.style.cssText;

            l_dom.style.cssText = "width:100%; height:100%;";
        }

        loApp.attr.HTML = new XMLSerializer().serializeToString(l_dom);

        //기존 css가 존재하는 경우 원복처리.
        if(l_tempCSS){
            l_dom.style.cssText = l_tempCSS;
        }

    }   //개인화 UI의 미리보기용 HTML 정보 구성.


    //개인화 미리보기 화면 구성.
    function lf_setP13nPrevHTML(sHTML = ""){

        //패턴 개인화 미리보기 IFRAME 정보 얻기.
        var l_frame = document.getElementById(loApp.attr.frameID);
        if(!l_frame || !l_frame.contentDocument){return;}

        //extension 아이콘 등록처리.
        lf_setPrevExtIcon(l_frame.contentWindow);

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


    }   //개인화 미리보기 화면 구성.




    //extension 아이콘 등록처리.
    function lf_setPrevExtIcon(oWin){

        oWin.jQuery.sap.require("sap.ui.core.IconPool");
        oWin.jQuery.sap.require("sap.m.IllustrationPool");

        //TNT icon 등록 처리.
        oWin.sap.ui.core.IconPool.registerFont({
            collectionName:"SAP-icons-TNT", 
            fontFamily:"SAP-icons-TNT",
            fontURI:sap.ui.require.toUrl("sap/tnt/themes/base/fonts"), 
            lazy:true});
        
        //BusinessSuiteInAppSymbols icon 등록처리.
        oWin.sap.ui.core.IconPool.registerFont({
            collectionName:"BusinessSuiteInAppSymbols",
            fontFamily:"BusinessSuiteInAppSymbols",
            fontURI:sap.ui.require.toUrl("sap/ushell/themes/base/fonts"),
            lazy:true});

        //tnt 일러스트 정보 등록 처리.
        oWin.sap.m.IllustrationPool.registerIllustrationSet({
            setFamily:"tnt",
            setURI:sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")},false);


        //extension icon 정보가 존재하지 않는경우 exit.
        if(!oAPP.attr.S_CODE.UA053){return;}
        

        for(var i=0, l=oAPP.attr.S_CODE.UA053.length; i<l; i++){
            oWin.sap.ui.core.IconPool.registerFont({
                collectionName:oAPP.attr.S_CODE.UA053[i].FLD01,
                fontFamily:oAPP.attr.S_CODE.UA053[i].FLD02,
                fontURI:oAPP.attr.S_CODE.UA053[i].FLD03,lazy:true});
        }

    }   //extension 아이콘 등록처리.



    //패턴 개인화 미리보기 화면 load 완료시 호출 function.
    oAPP.fn.P13nPrevLoaded = function(){

        //개인화 미리보기 화면 구성.
        lf_setP13nPrevHTML(loApp.attr.HTML);

        parent.setBusy();

    };  //패턴 개인화 미리보기 화면 load 완료시 호출 function.




    //개인화 미리보기 테마 변경 function.
    oAPP.fn.P13nChangeTheme = function(sTheme){

        var l_frame = document.getElementById(loApp.attr.frameID);
        if(!l_frame){return;}

        l_frame.contentWindow.sap.ui.getCore().applyTheme(sTheme);

    };  //개인화 미리보기 테마 변경 function.




    //개인화 미리보기 html 파라메터 구성.
    function lf_setParam(oForm, name, value){

        var iput = document.createElement("input");
            iput.setAttribute("name", name);
            iput.setAttribute("value", value);
            iput.setAttribute("type", "hidden");
            oForm.appendChild(iput);

    }   //개인화 미리보기 html 파라메터 구성.




    //초기값 설정.
    function lf_setInitData(sMode){

        //진입시 모드 설정.(C, R)
        loApp.attr.mode = sMode;

        //파일 lock 처리 정보.
        loApp.attr.lockFile = parent.require("proper-lockfile");
        
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




    //header 파일 잠금/잠금해제 처리.
    function lf_headerLock(bUnlock){

        //HEADER 파일 PATH 구성.
        var l_path = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, C_HEADER_FILE);

        // 잠금 해제 처리건인경우, 현재 팝업에서 header 파일에 lock 처리한경우.
        if(bUnlock && loApp.attr.lock){

            try {
                //HEADER 파일 잠금 해제 처리.
                loApp.attr.lockFile.unlockSync(l_path);
            } catch (e) {
                //잠금 해제 실패 flag return;
                
            }

            return;         

        }


        //현재 팝업에서 header 파일에 lock 처리한경우.
        if(loApp.attr.lock){
            //하위 로직 skip.
            return;
        }

        //이미 파일이 잠겨 있다면.
        if(loApp.attr.lockFile.checkSync(l_path)){
            //382	Personalizing UI on other screens.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "382", "", "", "", ""));
            return;
        }

        try {
            //HEADER 파일 잠금 처리.
            loApp.attr.lockFile.lockSync(l_path);

            //광역변수에 현재 팝업에서 lock 설정함 flag 구성.
            loApp.attr.lock = true;

        } catch (e) {

        }        

    }   //header 파일 잠금/잠금해제 처리.




    //개인화 header list 정보 구성.
    function lf_getP13nHeaderData(){
        
        //개인화 파일 PATH 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

        //개인화 파일이 존재하지 않는다면.
        if(parent.FS.existsSync(l_path) !== true){

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
            //E29  Personalization
            //196  &1 does not exist.
            var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E29", "", "", "", ""), "", "", "");

            parent.showMessage(sap, 10, "I", l_txt);
            return [];
        }

        var lt_head = JSON.parse(l_file);
   
        //세팅정보 얻기.
        var ls_settting = parent.WSUTIL.getWsSettingsInfo();

        //HEADER 파일 PATH 구성.
        var l_path = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, C_HEADER_FILE);


        //header 파일 잠금 처리.
        lf_headerLock();


        //381  Library version of the personalization is not compatible.            
        var l_txt =  oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "381", "", "", "", "");

        for(var i=0, l=lt_head.length; i<l; i++){
            lt_head[i].selected = false;
            lt_head[i].highlight = "None";
            lt_head[i].tooltip = lt_head[i].title;
            lt_head[i].notAllow = false;
            lt_head[i].visible_edit = false;
            lt_head[i].visible_delete = false;
            
            //현재 화면에서 편집이 가능한 경우.
            if(loApp.attr.lock){
                //수정버튼 활성 처리.
                lt_head[i].visible_edit = true;

                //삭제버튼 활성처리.
                lt_head[i].visible_delete = true;
            }

            //UI 개인화의 라이브러리 버전과 현재 서버의 라이브러리 버전이 다른경우.
            if(lt_head[i].LibraryVersion !== ls_settting.UI5.version){
                //허용 불가 flag 처리.
                lt_head[i].notAllow = true;

                //수정버튼 비활성 처리.(삭제만 가능)
                lt_head[i].visible_edit = false;

                lt_head[i].tooltip +=  "\n\n 🚫" + l_txt + "🚫";

            }            

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
        if(!l_dom){return;}

        

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
        // lf_setParam(oForm, "CALLBACKFUNC", "___u4a_ws_eval___('function lf_zztest(){}'); parent.oAPP.fn.P13nPrevLoaded();");
        
        document.body.appendChild(oForm);

        oForm.submit();

        setTimeout(() => {
            document.body.removeChild(oForm);
        }, 0);
        

    }   //개인화 미리보기 html load.




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

        //현재 UI의 DESCRIPTION 정보 얻기.
        var l_desc = oAPP.fn.getDesc(is_tree.OBJID);

        //DESCRIPTION정보가 존재하는경우.
        if(l_desc !== ""){
            //DESCRIPTION정보 추가.
            ls_0014._DESC = l_desc;
        }

        //하위 정보.
        ls_0014.zTREE = [];

        //실제 라이브러리의 정보 검색.
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === ls_0014.UIOBK);
        
        //실제 라이브러리명을 재 매핑(sap.m.Button)
        if(ls_0022){            
            ls_0014.UILIB = ls_0022.LIBNM;
        }

        //바인딩, 이벤트 항목 제외.
        ls_0014._T_0015 = oAPP.attr.prev[is_tree.OBJID]._T_0015.filter( a=> a.ISBND !== "X" && a.UIATY !== "2" );

        //CLIENT EVENT 정보 얻기.
        var lt_CEVT = oAPP.fn.getUiClientEvent(is_tree);

        //CLIENT EVENT 정보가 존재하는경우.
        if(typeof lt_CEVT !== "undefined"){
            //CLIENT EVENT 정보 추가.
            ls_0014._CEVT = lt_CEVT.filter( a => a.OBJTY !== "JS" );
        }

        if(is_tree.zTREE.length === 0){return ls_0014;}

        

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


    

    //개인화 default 폴더 생성 처리.
    function lf_createDefaultFolder(){

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            try{
                parent.FS.mkdirSync(l_folderPath);
            }catch(e){
                parent.showMessage(sap, 10, "E", e);
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
                return true;
            }

        }

    }   //개인화 default 폴더 생성 처리.



    //저장버튼 선택 이벤트.
    function lf_saveP13nData(){

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            try{
                parent.FS.mkdirSync(l_folderPath);
            }catch(e){
                parent.showMessage(sap, 10, "E", e);
                return;
            }
        }


        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

        //default 개인화 파일 header 정보.
        var lt_head = [];

        //개인화 파일이 header 존재하는 경우 해당 파일 read.
        if(parent.FS.existsSync(l_filePath)){
            lt_head = JSON.parse(parent.FS.readFileSync(l_filePath, "utf-8"));
            
            try{
                //기존 header 파일 제거 처리.
                parent.FS.unlinkSync(l_filePath);
            }catch(e){
                parent.showMessage(sap, 10, "E", e);
                return;
            }

        }

        var ls_head = {};

        //신규로 등록하는경우.
        if(loApp.oModel.oData.is_head.isNew === true){
            
            //개인화 제목.
            ls_head.title = loApp.oModel.oData.is_head.title;

            //파일명 구성.
            ls_head.fileName = lf_getFileName(lt_head);

            //테마 선택 정보.
            ls_head.THEME = loApp.oModel.oData.THEME;
        
            //저장대상 UI의 최상위 UI OBJECT KEY.
            ls_head.UIOBK = loApp.oModel.oData.zTREE[0].UIOBK;

            //저장 대상 UI의 최상위 UI의 라이브러리명.
            ls_head.UILIB = loApp.oModel.oData.zTREE[0].UILIB;

            //미리보기 bootPath정보.
            ls_head.bootPath = loApp.attr.bootPath;

            var ls_settting = parent.WSUTIL.getWsSettingsInfo();

            //라이브러리 버전 정보.
            ls_head.LibraryVersion = ls_settting.UI5.version;

            //header 최상위에 라인 추가.
            lt_head.splice(0, 0, ls_head);

            //아이템 저장 처리.
            lf_saveItemData(ls_head);

        }else{
            //기존건을 수정하는 경우.
            
            //기존 header에서 해당 라인 찾기.
            var l_indx = lt_head.findIndex( a => a.fileName === loApp.oModel.oData.is_head.fileName );

            //찾지 못한 경우.
            if(l_indx === -1){
                //header 최상위에 라인 추가.
                lt_head.splice(0, 0, ls_head);
            }else{
                ls_head = lt_head[l_indx];
            }

            //개인화 제목.
            ls_head.title = loApp.oModel.oData.is_head.title;

            //파일명 구성.
            ls_head.fileName = loApp.oModel.oData.is_head.fileName;

            //테마 선택 정보.
            ls_head.THEME = loApp.oModel.oData.THEME;

            //대표 UI OBJECT KEY.
            ls_head.UIOBK = loApp.oModel.oData.is_head.UIOBK;
            
            //대표 UI 라이브러리명.
            ls_head.UILIB = loApp.oModel.oData.is_head.UILIB;

            //미리보기 bootPath정보.
            ls_head.bootPath = loApp.oModel.oData.is_head.bootPath;

            //라이브러리 버전정보.
            ls_head.LibraryVersion = loApp.oModel.oData.is_head.LibraryVersion;

        }

        try{
            //header 정보 저장 처리.
            parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));
        }catch(e){
            //header 정보 저장중 오류발생시 오류 메시지 처리.
            parent.showMessage(sap, 20, "E", e);
            return;
        }


        //저장 이후 조회모드로 설정.
        loApp.attr.mode = "R";

        //저장 이후 화면 재구성.
        lf_setModelData(loApp.attr.mode);


        //header라인 선택 처리.
        lf_setHeadLineSelect(ls_head.fileName);

        // table의 필터, sort 해제 처리.
        lf_clearTableFilterSorter();
        
        //002  Saved success
        parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "002", "", "", ""));
        

    }   //저장버튼 선택 이벤트.




    //item 저장 처리.
    function lf_saveItemData(is_head){
        
        var ls_item = {};

        //tree 저장 정보 구성.
        ls_item.is_tree = lf_collectSaveData(loApp.oModel.oData.zTREE[0]);

        //미리보기 HTML정보.
        ls_item.HTML = loApp.attr.HTML;

            
        try{
            //개인화 폴더에 json 형식으로 저장 처리.
            parent.FS.writeFileSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_SYSID, is_head.fileName),
                JSON.stringify(ls_item));
        }catch(e){
            parent.showMessage(sap, 10, "E", e);
            return;
        }

    }   //item 저장 처리.




    //갱신 버튼 선택 이벤트.
    function lf_setHeaderRefresh(){

        //조회 flag 처리.
        loApp.attr.mode = "R";

        //미리보기 html정보 매핑.
        loApp.attr.HTML = "";
        
        //미리보기 갱신 처리.
        lf_setP13nPrevHTML();

        //이전에 선택한 라인 정보 얻기.
        var l_fileName = loApp.ui.oTab.getContextByIndex(loApp.ui.oTab.getSelectedIndex())?.getProperty("fileName");

        //모델 갱신 처리.
        lf_setModelData(loApp.attr.mode, undefined, {});

        //라인 선택 (해제) 처리.
        lf_setHeadLineSelect(l_fileName);

        // table의 필터, sort 해제 처리.
        lf_clearTableFilterSorter();

        loApp.ui.oDlg.focus();


    }   //갱신 버튼 선택 이벤트.




    //header 라인선택 이벤트.
    function lf_selHeaderLine(is_head){

        if(!is_head){
            parent.setBusy();
            return;
        }

        //header의 item 정보 얻기.
        var ls_item = lf_getItemData(is_head);

        //tree의 아이콘 구성 처리.
        oAPP.fn.setTreeUiIcon(ls_item.is_tree);

        loApp.oModel.oData.zTREE = [];

        //tree 갱신 처리.
        loApp.oModel.setData({zTREE:[ls_item.is_tree]}, true);

        //미리보기 html 매핑.
        loApp.attr.HTML = ls_item.HTML;

        loApp.ui.oTree.collapseAll();
        loApp.ui.oTree.expandToLevel(1);
        
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




    //drag start 처리.
    function lf_dragStart(oEvent){
        
        //drag한 위치의 바인딩 정보 얻기.
        var l_ctxt = oEvent.mParameters.target.getBindingContext();
        if(!l_ctxt){return;}

        //drag한 TREE 정보 얻기.
        var ls_drag = l_ctxt.getProperty();
        if(!ls_drag){return;}

        //세팅정보 얻기.
        var ls_settting = parent.WSUTIL.getWsSettingsInfo();

        //등록당시 라이브러리 버전과 현재 사용중인 라이브러리 버전이 맞지 않는다면 drag 중지.
        if(ls_drag.LibraryVersion !== ls_settting.UI5.version){

            //381  Library version of the personalization is not compatible.            
            parent.showMessage(sap, 10, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "381", "", "", "", ""));

            oEvent.preventDefault();
            oEvent.cancelBubble();
            return;
        }

        //drag 시작시 drop 가능건에 대한 제어 처리.
        oAPP.fn.designTreeDragStart({OBJID:undefined, UIOBK:ls_drag.UIOBK});

        //DRAG한 UI의 라이브러리명 정보 세팅(Runtime Class Navigator 기능에서 사용)
        event.dataTransfer.setData("rtmcls", ls_drag.UILIB);

        //DRAG한 UI ID 정보 세팅.
        event.dataTransfer.setData("text/plain", "P13nUIData|" + ls_drag.fileName + "|" + oAPP.attr.DnDRandKey);

        //modal 해제 처리.
        loApp.ui.oDlg.oPopup.setModal(false);

    }   //drag start 처리.




    //drag end 이벤트
    function lf_dragEnd(oEvent){
        
        //design tree영역의 drag 종료 처리.
        oAPP.fn.designDragEnd();

        //modal 설정 처리.
        loApp.ui.oDlg.oPopup.setModal(true);

    }   //drag end 이벤트




    //모델 초기값 구성.
    function lf_setInitModelData(){
        
        //default 테마 정보 매핑.
        loApp.oModel.oData.THEME = loApp.attr.theme;

        //default 테마 정보 매핑.
        loApp.oModel.oData.T_THEME = loApp.attr.T_THEME;

    }   //모델 초기값 구성.




    //좌측 테이블의 row action 활성 여부 처리.
    function lf_setTableAction(){

        var l_cnt = 0;

        //현재 화면에서 lock을 구성한 경우.
        if(loApp.attr.lock){
            //row action 버튼 활성 처리.
            l_cnt = 2;
        }

        loApp.ui.oTab.setRowActionCount(l_cnt);

        var l_act = loApp.ui.oTab.getRowActionTemplate();

        loApp.ui.oTab.setRowActionTemplate();

        loApp.ui.oTab.setRowActionTemplate(l_act);

    }   //좌측 테이블의 row action 활성 여부 처리.




    //모델 데이터 구성.
    function lf_setModelData(sMode, is_head, is_tree){

        //팝업 화면 잠금 처리.
        parent.setBusy("X");

        var ls_data = {};

        ls_data.visible_displayTitle = false;

        ls_data.is_head = {};

        ls_data.is_head.title = "";
        ls_data.is_head.fileName = "";
        ls_data.is_head.UIOBK = "";
        ls_data.is_head.UILIB = "";
        ls_data.is_head.THEME = "";
        ls_data.is_head.bootPath = "";
        ls_data.is_head.LibraryVersion = "";

        ls_data.is_head.visible_delete = false;
        ls_data.is_head.isNew = true;

        //header 정보가 입력된 경우.(기존 개인화 정보를 수정하는경우.)
        if(is_head){
            ls_data.is_head.title = is_head.title;
            ls_data.is_head.fileName = is_head.fileName;
            ls_data.is_head.UIOBK = is_head.UIOBK;
            ls_data.is_head.UILIB = is_head.UILIB;

            //테마 정보.
            ls_data.is_head.THEME = is_head.THEME;

            //미리보기 bootPath정보.
            ls_data.is_head.bootPath = is_head.bootPath;

            //라이브러리 버전정보.
            ls_data.is_head.LibraryVersion = is_head.LibraryVersion;

            //삭제버튼 활성화.
            ls_data.is_head.visible_delete = true;

            //신규 flag false 처리.
            ls_data.is_head.isNew = false;

        }


        //tree 라인 정보가 입력된 경우.
        if(is_tree){
            //tree table 초기화 처리.
            loApp.oModel.oData.zTREE = [];

            ls_data.zTREE = [];
            ls_data.zTREE.push(is_tree);
        }

        //조회모드인경우.
        if(sMode === "R"){
            //HEADER table 초기화 처리.
            loApp.oModel.oData.T_HEAD = [];

            //header 리스트 정보 구성.
            ls_data.T_HEAD = lf_getP13nHeaderData();
        }

        //현재 화면에서 lock 처리를 하지 않은경우.
        if(!loApp.attr.lock){
            //display title 활성 처리.
            ls_data.visible_displayTitle = true;
        }

        //모델 바인딩 처리.
        loApp.oModel.setData(ls_data, true);


        //좌측 테이블의 row action 활성 여부 처리.
        lf_setTableAction();


        var l_page;

        //입력 모드에 따라서 좌측 화면 navigation 처리.
        switch(sMode){            
            case "C":   //개인화 등록으로 호출된경우.
                
                //등록 페이지로 이동 처리.
                l_page = loApp.ui.oRegPage;

                break;
                
            case "R":   //개인화 조회로 호출된경우.

                //header 리스트 페이지로 이동 처리.
                l_page = loApp.ui.oHeadListPage;
                break;
        }

        //현재 보여지고 있는 page가 이동 대상 페이지와 동일하다면.
        if(loApp.ui.oNav.getCurrentPage() === l_page){
            //팝업 화면 잠금 해제 처리.
            parent.setBusy();

        }else{
            //대상 페이지로 이동 처리.
            loApp.ui.oNav.to(l_page);
        }

        //우측 tree 1레벨만 펼침 처리.
        loApp.ui.oTree.collapseAll();
        loApp.ui.oTree.expandToLevel(1);
        

    }   //모델 데이터 구성.




    //화면 이동 이후 이벤트 처리.
    function lf_afterNavigate(){

        //팝업 화면 잠금 해제 처리.
        parent.setBusy();

    }   //화면 이동 이후 이벤트 처리.




    //header의 선택 라인 편집 처리.
    function lf_setHeaderLineEdit(oEvent){

        //화면 잠금 처리.
        parent.setBusy("X");

        var l_ui = oEvent.getSource();
        if(!l_ui){
            //화면 잠금 해제처리.
            parent.setBusy();
            return;
        }

        var l_ctxt = l_ui.getBindingContext();
        if(!l_ctxt){
            //화면 잠금 해제처리.
            parent.setBusy();
            return;
        }

        //header 정보 얻기.
        var ls_head = l_ctxt.getProperty();

        //아이템 정보 얻기.
        var ls_item = lf_getItemData(ls_head);

        //tree의 아이콘 구성 처리.
        oAPP.fn.setTreeUiIcon(ls_item.is_tree);

        //변경 flag 처리.
        loApp.attr.mode = "C";

        //미리보기 html정보 매핑.
        loApp.attr.HTML = ls_item.HTML;

        //모델 갱신 처리.
        lf_setModelData(loApp.attr.mode, ls_head, ls_item.is_tree);

        //화면 이동 처리.
        lf_setPrevNav();

    }   //header의 선택 라인 편집 처리.




    //header의 선택 라인 삭제 처리.
    function lf_setHeaderLineDelete(sFileName){

        //379  Delete selected rows?
        parent.showMessage(sap, 30, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "379", "", "", "", ""), function(sParam){
            
            //YES를 선택하지 않은경우 EXIT.
            if(sParam !== "YES"){return;}

            //U4A UI 개인화 폴더 path 구성.
            var l_folderPath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID);

            //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
            if(!parent.FS.existsSync(l_folderPath)){            
                try{
                    parent.FS.mkdirSync(l_folderPath);
                }catch(e){
                    parent.showMessage(sap, 10, "E", e);
                    return;
                }
            }


            //U4A UI 개인화 header 파일 path 구성.
            var l_filePath = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, C_HEADER_FILE);

            //default 개인화 파일 header 정보.
            var lt_head = [];

            //개인화 파일이 header 존재하는 경우 해당 파일 read.
            if(parent.FS.existsSync(l_filePath)){
                lt_head = JSON.parse(parent.FS.readFileSync(l_filePath, "utf-8"));
                
                try{
                    //기존 header 파일 제거 처리.
                    parent.FS.unlinkSync(l_filePath);
                }catch(e){
                    parent.showMessage(sap, 10, "E", e);
                    return;
                }

            }

            var l_indx = lt_head.findIndex( a=> a.fileName === sFileName );

            if(l_indx !== -1){

                //개인화 item 정보를 얻기위한 path 구성.
                var l_path = parent.PATH.join(parent.REMOTE.app.getPath("userData"), C_P13N, C_FOLDER, C_SYSID, sFileName);

                try{
                    //기존 item 파일 제거 처리.
                    parent.FS.unlinkSync(l_path);
                }catch(e){

                }

                //header에서 해당 라인 삭제 처리.
                lt_head.splice(l_indx, 1);

            }


            try{
                //header 정보 저장 처리.
                parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));
            }catch(e){
                //header 정보 저장중 오류발생시 오류 메시지 처리.
                parent.showMessage(sap, 20, "E", e);
                return;
            }


            //조회 flag 처리.
            loApp.attr.mode = "R";

            //미리보기 html정보 매핑.
            loApp.attr.HTML = "";
            
            //미리보기 갱신 처리.
            lf_setP13nPrevHTML();

            //라인선택 표현 해제 처리.
            lf_resetMarkLine();

            //모델 갱신 처리.
            lf_setModelData(loApp.attr.mode, undefined, {});

            //라인 선택 해제 처리.
            lf_setHeadLineSelect();

            // table의 필터, sort 해제 처리.
            lf_clearTableFilterSorter();

            loApp.ui.oDlg.focus();

            //화면 이동 처리.
            loApp.ui.oPrevNav.to(loApp.ui.oInitPage);

            //015  Removed.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "015", "", "", ""));

        });

    }   //header의 선택 라인 삭제 처리.




    //데이터 drop 이벤트
    function lf_DropData(oEvent){

        //header lock 처리.
        lf_headerLock();

        //현재 화면에서 lock을 설정하지 않았다면.
        if(loApp.attr.lock){
            return;
        }

        //Drag한 정보 발췌.
        var lt_dragInfo = oAPP.fn.getDragParam(oEvent);
        if(!lt_dragInfo || lt_dragInfo.length !== 3){return;}

        //design tree에서 drag한 정보가 아닌경우 exit.
        if(lt_dragInfo[0] !== "designTree"){return;}

        //다른 ws 세션에서 D&D한경우 exit.
        if(lt_dragInfo[2] !== oAPP.attr.DnDRandKey){return;}

        //tree 라인 정보 얻기.
        var ls_tree = oAPP.fn.getTreeData(lt_dragInfo[1]);
        if(!ls_tree){return;}

        //ROOT는 개인화 저장 불가.
        if(ls_tree.OBJID === "ROOT"){
            //380  &1 cannot be personalized.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "380", "ROOT", "", "", ""));
            return;
        }

        ls_tree = JSON.parse(JSON.stringify(ls_tree));

        //생성 모드로 변경.
        loApp.attr.mode = "C";

        //dialog 호출 이후 화면 구성.
        lf_setModelData(loApp.attr.mode, undefined, ls_tree);


        //미리보기 HTML 정보 구성.
        lf_getUiHTML(ls_tree);

        //화면 이동 처리.
        loApp.ui.oPrevNav.to(loApp.ui.oDetail);
        

    }   //데이터 drop 이벤트





    //header 테이블 라인 선택 처리.
    function lf_setHeadLineSelect(sFileName){

        //이전 라인 선택건 확인.
        var l_selIndex = loApp.ui.oTab.getSelectedIndex();

        //파일명이 입력되지 않은경우 라인 선택 초기화.
        if(!sFileName){

            //이전 선택건이 존재하는경우.
            if(l_selIndex !== -1){
                loApp.ui.oTab.__clearSelect = true;
                loApp.ui.oTab.clearSelection();
            }

            //화면 이동 처리.
            loApp.ui.oPrevNav.to(loApp.ui.oInitPage);

            return;
        }

        //라인선택 해제 처리.
        if(!loApp.oModel.oData.T_HEAD?.length){

            //이전 선택건이 존재하는경우.
            if(l_selIndex !== -1){
                loApp.ui.oTab.__clearSelect = true;
                loApp.ui.oTab.clearSelection();
            }

            //화면 이동 처리.
            loApp.ui.oPrevNav.to(loApp.ui.oInitPage);

            return;
        }

        //header 리스트에서 파일명이 해당하는 라인 위치 찾기.
        var l_indx = loApp.oModel.oData.T_HEAD.findIndex( a=> a.fileName === sFileName );

        //찾지 못한 경우 라인선택해제 처리.
        if(l_indx === -1){

            //이전 선택건이 존재하는경우.
            if(l_selIndex !== -1){
                loApp.ui.oTab.__clearSelect = true;
                loApp.ui.oTab.clearSelection();
            }

            //화면 이동 처리.
            loApp.ui.oPrevNav.to(loApp.ui.oInitPage);

            return;
        }

        //찾은 대상 라인 선택 처리.
        loApp.ui.oTab.setSelectedIndex(l_indx);


    }   //header 테이블 라인 선택 처리.




    //뒤로가기 이벤트.
    function lf_back(){

        //조회 flag 처리.
        loApp.attr.mode = "R";

        //미리보기 html정보 매핑.
        loApp.attr.HTML = "";
        
        //미리보기 갱신 처리.
        lf_setP13nPrevHTML();

        //입력했던 파일명 로컬에 매핑.
        var l_fileName = loApp.oModel.oData.is_head.fileName;

        //모델 갱신 처리.
        lf_setModelData(loApp.attr.mode, undefined, {});

        //라인 선택 처리.
        lf_setHeadLineSelect(l_fileName);

        // table의 필터, sort 해제 처리.
        lf_clearTableFilterSorter();

        loApp.ui.oDlg.focus();


    }   //뒤로가기 이벤트.




    //미리보기, tree 화면으로 navigation 처리.
    function lf_setPrevNav(){

        //현재 보여지고 있는 page가 이동 대상 페이지와 동일하다면.
        if(loApp.ui.oPrevNav.getCurrentPage() === loApp.ui.oDetail){
            //팝업 화면 잠금 해제 처리.
            
            //미리보기 화면 갱신.
            lf_setP13nPrevHTML(loApp.attr.HTML);

            parent.setBusy();
            return;

        }

        loApp.ui.oPrevNav.to(loApp.ui.oDetail);

    }   //미리보기, tree 화면으로 navigation 처리.




    //라인 선택 변경 이벤트 처리.
    function lf_rowSelectionChange(oEvent){
        
        parent.setBusy("X");

        var l_indx = loApp.ui.oTab.getSelectedIndex();

        if(l_indx === -1){

            //라인 선택 해제 처리 flag가 있다면 라인 다시 선택하는 로직 해제.
            if(loApp.ui.oTab.__clearSelect){
                delete loApp.ui.oTab.__clearSelect;
                parent.setBusy();
                return;
            }

            l_indx = oEvent.mParameters.rowIndex;

            if(typeof oEvent.mParameters.rowIndices !== "undefined" && oEvent.mParameters.rowIndices.length !== 0){
                l_indx = oEvent.mParameters.rowIndices[0];
            }

            loApp.ui.oTab.setSelectedIndex(l_indx);
            oEvent.preventDefault();
            parent.setBusy();
            return;
        }

        var l_ctxt = loApp.ui.oTab.getContextByIndex(l_indx);
        if(!l_ctxt){
            parent.setBusy();
            return;
        }


        //라인선택 표현 해제 처리.
        lf_resetMarkLine();

        //라인선택 표현 처리.
        loApp.oModel.setProperty("highlight", "Information", l_ctxt);

        //header 라인 정보 세팅.
        lf_selHeaderLine(l_ctxt.getProperty());

        
        //미리보기, tree 화면으로 navigation 처리.
        lf_setPrevNav();


    }   //라인 선택 변경 이벤트 처리.




    //라인선택 표현 해제 처리.
    function lf_resetMarkLine(){

        if(loApp.oModel.oData.T_HEAD.length === 0){return;}

        //라인선택 해제 처리.
        for(var i=0, l=loApp.oModel.oData.T_HEAD.length; i<l; i++){
            loApp.oModel.oData.T_HEAD[i].highlight = "None";
        }

    }   //라인선택 표현 해제 처리.




    //팝업 호출 후 이벤트 처리.
    function lf_dialogAfterOpen(is_tree){
        
        var ls_tree;

        if(is_tree){
            ls_tree = JSON.parse(JSON.stringify(is_tree));
        }
        

        //등록건으로 팝업이 호출된경우.
        if(loApp.attr.mode === "C"){

            //파일 lock 처리.
            lf_headerLock();

            //현재 화면에서 lock을 설정하지 못한 경우.
            if(!loApp.attr.lock){
                //조회 모드로 변경 처리.
                loApp.attr.mode = "R";

                //모델 초기값 구성.
                lf_setInitModelData();

                //dialog 호출 이후 화면 구성.
                lf_setModelData(loApp.attr.mode);
                
                return;

            }
            
            //미리보기 HTML 정보 구성.
            lf_getUiHTML(ls_tree);

            //화면 이동 처리.
            loApp.ui.oPrevNav.to(loApp.ui.oDetail);

        }

        //모델 초기값 구성.
        lf_setInitModelData();

        //dialog 호출 이후 화면 구성.
        lf_setModelData(loApp.attr.mode, undefined, ls_tree);


    }   //팝업 호출 후 이벤트 처리.




    // table의 필터, sort 해제 처리.
    function lf_clearTableFilterSorter(){

        var l_bind = loApp.ui.oTab.getBinding("rows");
        if(!l_bind){return;}

        //모델의 필터, sort 해제 처리.
        l_bind.filter();
        l_bind.sort();

        var lt_col = loApp.ui.oTab.getColumns();
        if(lt_col.length === 0){return;}

        for(var i=0, l=lt_col.length; i<l; i++){
            //필터 해제 처리.
            lt_col[i].setFiltered(false);
            lt_col[i].setFilterValue();

            //sort 해제 처리.
            lt_col[i].setSorted();

        }

    }   // table의 필터, sort 해제 처리.


})();