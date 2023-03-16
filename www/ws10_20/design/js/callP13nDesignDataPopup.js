(function(){

    //개인화 처리 대상 tree 라인 정보.
    let ls_tree = {};

    //개인화 폴더명.
    const C_FOLDER = "U4A_UI_PATTERN";

    //개인화 파일명.
    const C_HEADER_FILE = "header.json";

    let l_frameID = "";
    
    //UI 개인화 정보 저장 팝업.
    oAPP.fn.callP13nDesignDataPopup = function(is_tree){

        //ROOT는 개인화 저장 불가.
        if(is_tree.OBJID === "ROOT"){
            //This line cannot be selected.
            parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "266", "", "", "", ""));
            return;
        }

        //개인화 팝업.
        var oDlg = new sap.m.Dialog({resizable:true, draggable: true, verticalScrolling:false,
            contentWidth:"70%", contentHeight:"60%"}).addStyleClass("sapUiSizeCompact");

        oDlg.attachBrowserEvent("dblclick", function(){
            //이벤트 전파 방지.
            event.preventDefault();
            event.stopPropagation();
        });
        
        //팝업 호출 후 이벤트.
        oDlg.attachAfterOpen(function(){
            //개인화 팝업 호출 이후 미리보기 HTML 구성.    
            lf_setPrevHTML(oModel, oTree, is_tree);

        }); //팝업 호출 후 이벤트.

        //팝업 종로 후 이벤트.
        oDlg.attachAfterClose(function(){
            this.destroy();
        }); //팝업 종로 후 이벤트.


        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        var oTool0 = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool0);


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
            lf_setPopupResize(oDlg, oBtn3);
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
            lf_close(oDlg, "001");

        }); //닫기 버튼 선택 이벤트.


        //A64  Save
        //개인화 저장 버튼.
        var oBtn1 = new sap.m.Button({type:"Accept", icon:"sap-icon://save", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", "")});
        oDlg.addButton(oBtn1);

        //저장버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            lf_saveP13nData(oDlg, oFeed.getValue());
        }); //저장버튼 선택 이벤트.


        //A39  Close
        //팝업 종료 버튼.
        var oBtn2 = new sap.m.Button({type:"Reject", icon:"sap-icon://decline", 
            tooltip: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oDlg.addButton(oBtn2);

        //팝업 종료 이벤트.
        oBtn2.attachPress(function(){
            //팝업 종료 처리.
            //001  Cancel operation
            lf_close(oDlg, "001");
        });

        //개인화 팝업 좌, 우 화면 분할 Splitter UI.
        var oSApp = new sap.ui.layout.Splitter();
        oDlg.addContent(oSApp);

        //좌측 design tree 및 desc 입력 영역.
        var oPage1 = new sap.m.Page({showHeader:false, enableScrolling:false,
            layoutData:new sap.ui.layout.SplitterLayoutData({size:"30%", minSize:300})});
        oSApp.addContentArea(oPage1);

        var oVBox = new sap.m.VBox({height:"100%", width:"100%"});
        oPage1.addContent(oVBox);

        //design tree UI.
        var oTree = new sap.ui.table.TreeTable({selectionMode:"None", 
            visibleRowCountMode:"Auto", columnHeaderVisible:false,
            layoutData: new sap.m.FlexItemData({growFactor:1})});
        oVBox.addItem(oTree);


        //개인화 desc 입력 필드.
        var oFeed = new sap.m.FeedInput({icon:"sap-icon://document-text", rows:3,
            buttonTooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", ""),  //A64  Save
            placeholder:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", ""),    //A35  Description
            growing:true, growingMaxLines:5, maxLength:300, showExceededText:false});
        oVBox.addItem(oFeed);

        //desc post 버튼 선택 이벤트.
        oFeed.attachPost(function(){
            lf_saveP13nData(oDlg, this.getValue());
        }); //desc post 버튼 선택 이벤트.


        var oTool1 = new sap.m.Toolbar();
        oTree.setToolbar(oTool1);

        //A46	Expand All
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A46", "", "", "", "");

        //전체펼침
        var oToolBtn1 = new sap.m.Button({text:l_txt, icon:"sap-icon://expand-all",
            type:"Emphasized", busy:"{/busy}", tooltip:l_txt});
            oTool1.addContent(oToolBtn1);

        //tree 전체펼침 이벤트
        oToolBtn1.attachPress(function(){
            oTree.expandToLevel(99999);
        });


        //A47	Collapse All
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A47", "", "", "", "");

        //전체접힘
        var oToolBtn2 = new sap.m.Button({text:l_txt, icon:"sap-icon://collapse-all",
            type:"Emphasized", busy:"{/busy}", tooltip:l_txt});
            oTool1.addContent(oToolBtn2);

        //tree 전체접힘 이벤트
        oToolBtn2.attachPress(function(){
            oTree.collapseAll();
            oTree.expand(0);
        });


        //A84  UI Object ID
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A84", "", "", "", "");

        //UI Object ID 컬럼.        
        var oLCol1 = new sap.ui.table.Column();
        oTree.addColumn(oLCol1);

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
        var oLtxt1 = new sap.m.Text({text:"{OBJID}"});
        oHbox2.addItem(oLtxt1);


        //embedded aggregation.
        var oStat = new sap.m.ObjectStatus({text:"{UIATT}", icon:"{UIATT_ICON}"});
        oHbox1.addItem(oStat);

        oTree.bindAggregation("rows", {path:"/zTREE", template: new sap.ui.table.Row(),
            parameters: {arrayNames:["zTREE"]}});


        //E25  Personalization Preview
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E25", "", "", "", "");

        //개인화 미리보기 page.
        var oPage2 = new sap.m.Page().addStyleClass("u4aP13nPreview sapUiContentPadding");
        oSApp.addContentArea(oPage2);

        var oTool2 = new sap.m.Toolbar();
        oPage2.setCustomHeader(oTool2);

        oTool2.addContent(new sap.m.Title({title:l_txt, tooltip:l_txt}));
        // oTool2.addContent(new sap.m.ToolbarSpacer());

        // var oSwitch = new sap.m.Switch({customTextOff:"IH", customTextOn:"OH"});
        // oTool2.addContent(oSwitch);

        // oSwitch.attachChange(function(){
        //     oAPP.fn.P13nPrevLoaded(this.getState());
        // });



        //iframe id 랜덤으로 생성.
        l_frameID = "prev" + oAPP.fn.getRandomKey();

        //미리보기 표현 html.
        var oHTML = new sap.ui.core.HTML({
            content:"<div style='width:100%; height:100%; overflow:hidden;'>" +
            // "<iframe id='P13nPrevHTML' name='P13nPrevHTML' style='overflow:hidden;overflow-x:hidden;" + 
            "<iframe id='" + l_frameID + "' name='" + l_frameID + "' style='overflow:hidden;overflow-x:hidden;" + 
            "overflow-y:hidden;height:100%;width:100%;" + 
            "top:0px;left:0px;right:0px;bottom:0px;border:none;'></iframe></div>"});
        oPage2.addContent(oHTML);

        //팝업 호출 처리.
        oDlg.open();
        

    };  //UI 개인화 정보 저장 팝업.




    //개인화 UI의 미리보기용 HTML 정보 구성.
    function lf_getUiHTML(){

        if(!oAPP.attr.prev[ls_tree.OBJID].getDomRef){return;}

        //미리보기의 DOM 정보 얻기.
        var l_dom = oAPP.attr.prev[ls_tree.OBJID].getDomRef();
        if(!l_dom){return;}

        //HTML 내용 return.
        // return l_dom[l_fldnm];
        return l_dom.innerHTML;

    }   //개인화 UI의 미리보기용 HTML 정보 구성.



    //패턴 개인화 미리보기 화면 load 완료시 호출 function.
    oAPP.fn.P13nPrevLoaded = function(){

        //개인화 UI의 미리보기용 HTML 정보 구성.
        var l_html = lf_getUiHTML();
        if(!l_html){return;}

        //패턴 개인화 미리보기 IFRAME 정보 얻기.
        // var l_frame = document.getElementById("P13nPrevHTML");
        var l_frame = document.getElementById(l_frameID);
        if(!l_frame){return;}

        //미리보기 HTML 표현 div 정보 얻기.
        var l_prev = l_frame.contentDocument.getElementById("prev");
        if(!l_prev){return;}

        //패턴 개인화 미리보기 HTML 정보 매핑.
        l_prev.innerHTML = l_html;

        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === ls_tree.UIOBK );
        if(!ls_0022){return;}
        
        //개인화를 위해 선택한 UI가 POPUP 유형인지 확인.
        if(oAPP.attr.S_CODE.UA026.findIndex( a=> a.FLD01 === ls_0022.LIBNM && a.FLD02 !== "X" ) !== -1){
            //팝업 유형인경우 innerHTML 값으로 처리.
            //(팝업의 outerHTML으로 미리보기 화면을 구성하는 경우 css의 top, left 등의 값 때문에
            //화면 중앙에 위치하지 않는 문제가 있기에 innerHTML으로 미리보기 화면을 구성함)
            l_prev.children[0].style.cssText = "width:100%; height:100%;";
        }


    };  //패턴 개인화 미리보기 화면 load 완료시 호출 function.



    
    //개인화 미리보기 html 파라메터 구성.
    function lf_setParam(oForm, name, value){

        var iput = document.createElement("input");
            iput.setAttribute("name", name);
            iput.setAttribute("value", value);
            iput.setAttribute("type", "hidden");
            oForm.appendChild(iput);

    }   //개인화 미리보기 html 파라메터 구성.



    //패턴 개인화 팝업 미리보기 html 호출.
    function lf_setPrevHTML(oModel, oTree, is_tree){
        
        //tree 데이터 바인딩.
        oModel.setData({zTREE:[is_tree], desc:""});

        //전체 펼침 처리.
        oTree.expandToLevel(99999999);
        
        //패턴 개인화 대상 tree 라인정보 광역화.
        ls_tree = is_tree;

        var l_info = parent.getUserInfo();

        // var l_dom = document.getElementById("P13nPrevHTML");
        var l_dom = document.getElementById(l_frameID);

        var oform = document.createElement("form");
        oform.setAttribute("id",     "prvSendForm");
        oform.setAttribute("target", l_dom.id);
        oform.setAttribute("method", "POST");
        oform.setAttribute("action", parent.getHost() + "/zu4a_wbc/u4a_ipcmain/getP13nPreviewHTML");
        oform.style.display = "none";

        //client 파라메터 추가.
        lf_setParam(oform, "sap-client", l_info.CLIENT);

        //접속 언어 파라메터 추가.
        lf_setParam(oform, "sap-language", l_info.LANGU);

        //SAP 접속 ID 파라메터 추가.
        lf_setParam(oform, "sap-user", l_info.ID);

        //SAP 접속 PW 파라메터 추가.
        lf_setParam(oform, "sap-password", l_info.PW);

        //라이브러리 bootstrap 경로 파라메터 추가.
        lf_setParam(oform, "LIBPATH", oAPP.fn.getBootStrapUrl());

        //LOAD 대상 LIBRARY 항목 파라메터 추가.
        lf_setParam(oform, "LIBRARY", oAPP.fn.getUi5Libraries(true));

        //미리보기 THEME 정보 파라메터 추가.
        lf_setParam(oform, "THEME", oAPP.DATA.APPDATA.S_0010.UITHM);
        
        document.body.appendChild(oform);

        oform.submit();

    }   //개인화 미리보기 html 호출.




    //개인화 정보 저장 처리.
    function lf_saveP13nData(oUi, sDesc){

        //UI 개인화 저장 json 구조.
        var ls_save = {is_tree:lf_collectSaveData(ls_tree), HTML:"", title:sDesc};

        //개인화 UI의 미리보기용 HTML 정보 구성.
        var l_html = lf_getUiHTML();
        if(l_html){
            ls_save.HTML = l_html;
        }        

        //U4A UI 개인화 폴더 path 구성.
        var l_folderPath = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER);

        //U4A UI 개인화 폴더가 존재하지 않는다면 폴더 생성 처리.
        if(!parent.FS.existsSync(l_folderPath)){
            parent.FS.mkdirSync(l_folderPath);
        }

        //U4A UI 개인화 header 파일 path 구성.
        var l_filePath = parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, C_HEADER_FILE);


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
        lt_head.push({fileName:l_fileName, title:sDesc});

        //header 정보 저장 처리.
        parent.FS.writeFileSync(l_filePath, JSON.stringify(lt_head));

        //개인화 폴더에 json 형식으로 저장 처리.
        parent.FS.writeFileSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, l_fileName), JSON.stringify(ls_save));
    

        //저장됐다면 floating menu를 갱신 처리.

        //002  Saved success
        //팝업 종료 처리.
        lf_close(oUi, "002");

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
                if(parent.FS.existsSync(parent.PATH.join(parent.getPath("P13N_ROOT"), C_FOLDER, l_fname))){
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
    function lf_close(oUi, sMSGNO){
        
        oUi.close();
        oUi.destroy();

        //개인화 tree 라인 광역 정보 초기화.
        ls_tree = {};

        //랜덤 frame id 초기화.
        l_frameID = "";

        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", sMSGNO, "", "", "", ""));

    }   //팝업 종료 처리.




    //팝업 사이즈 변경처리.
    function lf_setPopupResize(oDlg, oBtn){
        
        var l_dom = oDlg.getDomRef();

        switch(oDlg.__fullSize){
            case true:  //전체화면 상태인경우.

                //버튼 아이콘 변경.
                oBtn.setIcon("sap-icon://full-screen");

                //전체화면 상태 flag 해제 처리.
                oDlg.__fullSize = false;

                //이전 팝업창 크기값 매핑.
                l_dom.style.width = oDlg.__width;
                l_dom.style.height = oDlg.__height;
                break;

            case false: //전체화면이 아닌경우.
            default:

                //버튼 아이콘 변경.
                oBtn.setIcon("sap-icon://exit-full-screen");

                //전체화면 상태 flag 처리.
                oDlg.__fullSize = true;

                //이전 팝업창 크기 정보.
                oDlg.__width = l_dom.style.width;
                oDlg.__height = l_dom.style.height;

                //팝업창 size를 최대로 변경.
                l_dom.style.width = "100%";
                l_dom.style.height = "100%";

        }

        oDlg._positionDialog();

    }   //팝업 사이즈 변경처리.


})();