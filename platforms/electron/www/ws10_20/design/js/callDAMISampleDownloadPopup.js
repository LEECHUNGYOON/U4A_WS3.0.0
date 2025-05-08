(function(){

    var loAPP = {};

    loAPP.ui = {};

    loAPP.attr = {};

    let l_chromePath = "";

    //템플릿 폴더명.
    const C_TEMPLATE_FOLDER = "ui5app";

    //index.html icon tab item의 key 정보.
    const C_INDEX_HTML = "indexHTML";

    //index.css icon tab item의 key 정보.
    const C_INDEX_CSS = "indexCSS";

    //main/view.js icon tab item의 key 정보.
    const C_MAIN_VIEW_JS = "mainJS";


    //DAMI의 UI5 bootstrap 라이브러리 경로.
    const C_DAMI_LIB_SRC = "/public/lib/_org_files/sapui5-rt-1.120.21/resources/sap-ui-core.js";

    //DAMI의 UI5 bootstrap 라이브러리 data-sap-ui-resourceroots 의 경로.
    const C_DAMI_RESOURCE_ROOT = '"u4aApps":"./"';

    const C_NEWLINE = "\n";

    const C_TAB = "\t";

    //backend 폴더명.
    const C_BACKEND = "backend";

    //readme.md 파일명.
    const C_README = "readme.md";


    const C_BACKEND_README_PATH = "https://www.u4ainfo.com/LOTO/template/backendreadme.md";

    const C_APP_README_PATH = "https://www.u4ainfo.com/LOTO/template/appreadme.md";


    //DAMI에서 사용할 샘플파일 다운로드 팝업.
    oAPP.fn.callDAMISampleDownloadPopup = function(){

        //어플리케이션이 Active 상태가 아닌경우 exit.
        if(parent.getAppInfo().ACTST !== "A"){
            parent.showMessage(sap, 20, "E", "어플리케이션이 활성화된 상태에서만 해당 기능을 사용할 수 있습니다.");
            return;
        }

        //크롬 설치 경로 얻기.
        if(lf_getChromePath()){
            return;
        }

        //팝업 UI 생성.
        loAPP.ui.oDialog = new sap.m.Dialog({contentWidth:"60%", contentHeight:"60%", 
            draggable:true, resizable:true, verticalScrolling:false, 
            busy:true, busyIndicatorDelay:1});

        loAPP.ui.oDialog.addStyleClass("sapUiSizeCompact");

        loAPP.oModel = new sap.ui.model.json.JSONModel();
        loAPP.ui.oDialog.setModel(loAPP.oModel);
 
        //팝업 호출 이후 이벤트
        loAPP.ui.oDialog.attachAfterOpen(function(){
            lf_setInitData();
        }); //팝업 호출 이후 이벤트

        // //팝업 종료 이후 이벤트.
        // loAPP.ui.oDialog.attachAfterClose(function(){
        //     lf_afterClose();
        // }); //팝업 종료 이후 이벤트.

        //팝업 더블클릭 이벤트.
        loAPP.ui.oDialog.addEventDelegate({ondblclick: lf_setPopupResize});
        
        var oTool1 = new sap.m.Toolbar();
        loAPP.ui.oDialog.setCustomHeader(oTool1);

        var TITLE1 = new sap.m.Title({text:"DAMI 샘플 구성"});
        oTool1.addContent(TITLE1);

        oTool1.addContent(new sap.m.ToolbarSpacer());

        //056	닫기
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "056");

        //팝업 상단 닫기버튼.
        var oBtn1 = new sap.m.Button({tooltip:l_txt, icon:"sap-icon://decline", type:"Reject"});
        oTool1.addContent(oBtn1);

        //팝업 닫기 버튼 선택 이벤트.
        oBtn1.attachPress(function(){
            loAPP.ui.oDialog.close();
        }); //팝업 닫기 버튼 선택 이벤트.

        var oVBox = new sap.m.VBox({height: "100%", renderType: "Bare", width: "100%"});

        loAPP.ui.oDialog.addContent(oVBox);

        var oPanel = new sap.m.Panel({
           expandable: true,           // boolean
           expanded: true,             // boolean
           headerText: "기본정보",
           layoutData: new sap.m.FlexItemData({shrinkFactor:0,})
        });
        oVBox.addItem(oPanel);

        var oForm = new sap.ui.layout.form.Form({editable:true,
            layout:new sap.ui.layout.form.ResponsiveGridLayout({singleContainerFullSize:false})});
        oPanel.addContent(oForm);

        var oFCont1 = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oFCont1);

        var oFElem1 = new sap.ui.layout.form.FormElement();
        oFCont1.addFormElement(oFElem1);

        oFElem1.setLabel(new sap.m.Label({text:"파일명", design:"Bold", required:true}));
        oFElem1.addField(new sap.m.Input({value:"{/fileName}", valueState:"{/stat/st/fileName}", 
            showClearIcon : true, valueStateText:"{/stat/tx/fileName}"}));

        var oFElem2 = new sap.ui.layout.form.FormElement();
        oFCont1.addFormElement(oFElem2);

        //024	Title
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "024");

        oFElem2.setLabel(new sap.m.Label({text:l_txt, design:"Bold", required:true}));
        oFElem2.addField(new sap.m.Input({value:"{/title}", valueState:"{/stat/st/title}", 
            showClearIcon : true, valueStateText:"{/stat/tx/title}"}));

        var oFCont2 = new sap.ui.layout.form.FormContainer();
        oForm.addFormContainer(oFCont2);
        
        var oFElem3 = new sap.ui.layout.form.FormElement();
        oFCont2.addFormElement(oFElem3);

        oFElem3.setLabel(new sap.m.Label({text:"다운로드 경로", design:"Bold", required:true}));

        var oInp1 = new sap.m.Input({value:"{/downPath}", valueState:"{/stat/st/downPath}", 
            showClearIcon : true, valueStateText:"{/stat/tx/downPath}", showValueHelp:true, valueHelpOnly:true});
        oFElem3.addField(oInp1);

        //f4 help 선택 이벤트.
        oInp1.attachValueHelpRequest(function(){
            lf_callDirectoryBrowser();
        }); //f4 help 선택 이벤트.

        var oFElem4 = new sap.ui.layout.form.FormElement();
        oFCont2.addFormElement(oFElem4);

        //005	Theme
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "005");

        oFElem4.setLabel(new sap.m.Label({text:l_txt, design:"Bold"}));
        
        var oSel = new sap.m.Select({selectedKey:"{/theme}"});
        oFElem4.addField(oSel);

        //테마 ddlb 선택 이벤트.
        oSel.attachChange(function(){
            lf_selThemeDDLB();
        }); //테마 ddlb 선택 이벤트.


        oSel.bindAggregation("items", {path:"/T_THEM", 
            template: new sap.ui.core.Item({key:"{KEY}", text:"{TEXT}"})});

        var oTab = new sap.m.IconTabBar({applyContentPadding:false});
        oVBox.addItem(oTab);

        //icon tab bar 선택 이벤트.
        oTab.attachSelect(function(){
            lf_selTabBar(this.getSelectedKey());
        }); //icon tab bar 선택 이벤트.

        //index.html icon tab item.
        var oItem1 = new sap.m.IconTabFilter({key:C_INDEX_HTML, iconColor:"{/stat/st/" + C_INDEX_HTML + "}", 
            text:"index.html", icon:"sap-icon://source-code"});
        oTab.addItem(oItem1);

        //index.css icon tab item.
        var oItem2 = new sap.m.IconTabFilter({key:C_INDEX_CSS, iconColor:"{/stat/st/" + C_INDEX_CSS + "}", 
            text:"index.css", icon:"sap-icon://group-2"});
        oTab.addItem(oItem2);

        //main view.js icon tab item.
        var oItem3 = new sap.m.IconTabFilter({key:C_MAIN_VIEW_JS, iconColor:"{/stat/st/" + C_MAIN_VIEW_JS + "}", 
            text:"main/view.js", icon:"sap-icon://syntax"});
        oTab.addItem(oItem3);

        
        var oEditor1 = new sap.ui.codeeditor.CodeEditor({
            type: "{/editorType}",
            height: "500px",
            value: "{/editorValue}",
            layoutData: new sap.m.FlexItemData({growFactor:1})
        });

        //code editor 변경 이벤트.
        oEditor1.attachChange(function(){
            lf_changeEditor();
        }); //code editor 변경 이벤트.


        oVBox.addItem(oEditor1);

        oEditor1._oEditor.setFontSize(20);

        //샘플 다운로드 버튼.
        var oBtn4 = new sap.m.Button({text:"기본 패턴 다운로드", type:"Emphasized", icon:"sap-icon://download"});
        loAPP.ui.oDialog.addButton(oBtn4);

        oBtn4.attachPress(function(oEvent){
            lf_templateDownload();
        }); //샘플 다운로드 버튼 선택 이벤트.

        //샘플 다운로드 버튼.
        var oBtn2 = new sap.m.Button({text:"샘플 다운로드", type:"Accept", icon:"sap-icon://download"});
        loAPP.ui.oDialog.addButton(oBtn2);

        //샘플 다운로드 버튼 선택 이벤트.
        oBtn2.attachPress(function(oEvent){
            lf_sampleDownload();
        }); //샘플 다운로드 버튼 선택 이벤트.


        //003 Cancel
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "003");

        //팝업 하단 닫기 버튼.
        var oBtn3 = new sap.m.Button({text:l_txt, tooltip:l_txt, type:"Reject", icon:"sap-icon://decline"});
        loAPP.ui.oDialog.addButton(oBtn3);

        //팝업 닫기 버튼 선택 이벤트.
        oBtn3.attachPress(function(){
            loAPP.ui.oDialog.close();
        }); //팝업 닫기 버튼 선택 이벤트.

        //팝업 호출 처리.
        loAPP.ui.oDialog.open();

    };  //DAMI에서 사용할 샘플파일 다운로드 팝업.



    
    //크롬 설치 경로 얻기.
    function lf_getChromePath(){
    
        let aBrowserInfo = sap.ui.getCore().getModel().getData().DEFBR,
                oChromeInfo = aBrowserInfo.find(elem => elem.NAME == "CHROME"); // 크롬 브라우저 정보

            // 크롬 브라우저 설치 유무 확인
            if (!oChromeInfo) {
                sap.m.MessageToast.show("크롬 설치가 안되어 있음!!");
                return true;
            }
            if (!oChromeInfo.ENABLED) {
                sap.m.MessageToast.show("크롬 설치가 안되어 있음!!");
                return true;
            }

            // 크롬 설치 경로
            l_chromePath = oChromeInfo.INSPATH;

    }   //크롬 설치 경로 얻기.



    //팝업 종료 후 이벤트.
    function lf_afterClose(){
        //팝업 ui 제거 처리.
        loAPP.ui.oDialog.destroy();
        
        //팝업 ui의 모델 제거 처리.
        loAPP.oModel.destroy();
        
        loAPP = {};
        loAPP.ui = {};
        loAPP.attr = {};

    }   //팝업 종료 후 이벤트.




    //value state 정보구성.
    function lf_setValueState(is_data){

        var ls_state = {};
        ls_state.st = {};
        ls_state.tx = {};

        ls_state.st.fileName = "None";
        ls_state.st.title = "None";
        ls_state.st.downPath = "None";

        ls_state.st[C_INDEX_HTML] = "Default";
        ls_state.st[C_INDEX_CSS] = "Default";
        ls_state.st[C_MAIN_VIEW_JS] = "Default";

        ls_state.tx.fileName = "";
        ls_state.tx.title = "";
        ls_state.tx.downPath = "";

        return ls_state;

    }   //value state 정보구성.




    //팝업의 바인딩 초기값 구성.
    function lf_setInitData(){

        var ls_data = {};

        //value state 정보구성.
        ls_data.stat = lf_setValueState();

        //파일 명(default application명).
        ls_data.fileName = oAPP.attr.appInfo.APPID;

        //제목.
        ls_data.title = "";

        //root에 입력된 application의 description 정보 얻기.
        var ls_0015 = oAPP.attr.prev.ROOT._T_0015.find( a => a.UIATK === "DH001010" );
        if(ls_0015){
            ls_data.title = ls_0015.UIATV;
        }

        //다운로드 경로.
        ls_data.downPath = "";

        var lt_UA007 = [];

        if(oAPP.attr.S_CODE.UA007){
            lt_UA007 = oAPP.attr.S_CODE.UA007.filter( a => a.FLD03 === "X" );
        }else{
            lt_UA007 = oAPP.DATA.LIB.T_9011.filter( a => a.CATCD === "UA007" && a.FLD03 === "X" );
        }

        //테마 정보.
        ls_data.theme = "";

        ls_data.T_THEM = [];
        
        //테마 DDLB 항목 구성.
        for(var i=0, l=lt_UA007.length; i<l; i++){
            ls_data.T_THEM.push({KEY:lt_UA007[i].FLD01, TEXT:lt_UA007[i].FLD01});

            //DEFAULT 테마 정보건인경우.
            if(lt_UA007[i].FLD02 === "X"){
                ls_data.theme = lt_UA007[i].FLD01;
            }
        }


        // application에 설정된 테마 정보 얻기.
        var _theme = oAPP.attr.prev.ROOT._T_0015.find( a => a.UIATK === "DH001021" )?.UIATV || "";
        
        if(lt_UA007.findIndex( item => item.KEY === _theme) !== -1){
            ls_data.theme = _theme;
        }


        ls_data.source = {};

        //index.html 파일 정보 얻기.
        ls_data.source[C_INDEX_HTML] = lf_replaceTemplateHTML(ls_data);

        //index.css 파일 정보 얻기.
        ls_data.source[C_INDEX_CSS] = lf_replaceTemplateCSS(ls_data);

        //main view.js 파일 정보 얻기.
        ls_data.source[C_MAIN_VIEW_JS] = lf_replaceTemplateMainJS();


        
        ls_data.editorType = "html";

        ls_data.editorValue = ls_data.source[C_INDEX_HTML];

        ls_data.editorKey = C_INDEX_HTML;


        loAPP.oModel.setData(ls_data);

        loAPP.ui.oDialog.setBusy(false);

    }  //팝업의 바인딩 초기값 구성.




    //팝업 크기 변경 처리.
    function lf_setPopupResize(oEvent){

        //이벤트 발생 dom으로 부터 UI instance정보 얻기.
        var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

        //dialog의 toolbar에서 더블클릭 한경우.
        if(l_ui && l_ui.sParentAggregationName === "customHeader" && l_ui.oParent && l_ui.oParent.getMetadata()._sClassName === "sap.m.Dialog"){

            var l_dom = loAPP.ui.oDialog.getDomRef();

            switch(loAPP.ui.oDialog.data("fullSize")){
                case true:  //전체화면 상태인경우.

                    //전체화면 상태 flag 해제 처리.
                    loAPP.ui.oDialog.data("fullSize", false);

                    //이전 팝업창 크기값 매핑.
                    l_dom.style.width = loAPP.ui.oDialog.data("width");
                    l_dom.style.height = loAPP.ui.oDialog.data("height");
                    break;

                case false: //전체화면이 아닌경우.
                default:

                    //전체화면 상태 flag 처리.
                    loAPP.ui.oDialog.data("fullSize", true);

                    //이전 팝업창 크기 정보.
                    loAPP.ui.oDialog.data("width", l_dom.style.width);
                    loAPP.ui.oDialog.data("height", l_dom.style.height);

                    //팝업창 size를 최대로 변경.
                    l_dom.style.width = "100%";
                    l_dom.style.height = "100%";

            }

            loAPP.ui.oDialog._positionDialog();
        }

        //이벤트 전파 방지.
        event.preventDefault();
        event.stopPropagation();

    }   //팝업 크기 변경 처리.




    //icon tab bar 선택 이벤트.
    function lf_selTabBar(sKey, bRefresh){

        //이전 code editor 입력값 얻기.
        var l_val = loAPP.oModel.getProperty("/editorValue");

        //이전 item 선택 key 정보 얻기.
        var l_key = loAPP.oModel.getProperty("/editorKey");

        //현재 editor에 입력된 값을 이전 선택한 item 정보에 매핑 처리.
        loAPP.oModel.setProperty("/source/" + l_key, l_val);

        if(bRefresh){return;}

        //선택한 icon tab의 source 정보를 editor에 매핑 처리.
        loAPP.oModel.setProperty("/editorValue", loAPP.oModel.getProperty("/source/" + sKey));

        //선택한 icon tab key 정보 매핑 처리.
        loAPP.oModel.setProperty("/editorKey", sKey);

        //선택한 item에 따른 editor type 변경 처리.
        switch (sKey) {
            case C_INDEX_HTML:
                loAPP.oModel.setProperty("/editorType", "html");
                break;
            case C_INDEX_CSS:
                loAPP.oModel.setProperty("/editorType", "css");
                break;
            case C_MAIN_VIEW_JS:
                loAPP.oModel.setProperty("/editorType", "javascript");
                break;
            default:
                break;
        }
        
    }   //icon tab bar 선택 이벤트.



    
    //SCRIPT 구성 SKIP 여부.
    function lf_isSkip0014(is_tree){
        
        //ROOT는 SCRIPT 구성 SKIP.
        if(is_tree.OBJID === "ROOT"){return true;}
        
        //EXTENSION UI인경우 구성 SKIP.
        if(is_tree.ISEXT === "X"){return true;}
        
        //EXCEPTION UI인경우 구성 SKIP.
        if(is_tree.ISECP === "X"){return true;}

        //u4a UI인경우 구성 SKIP.
        if(is_tree.UILIB.substr(0, 3) === "u4a"){return true;}

        //sapui6 UI인경우 구성 SKIP.
        if(is_tree.UILIB.substr(0, 6) === "sapui6"){return true;}
        
    }	//SCRIPT 구성 SKIP 여부.




    //index.html 기본 패턴 정보.
    function lf_templateHTML(){        
        var l_txt = 
`<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="google" content="notranslate">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>&PATTERN001&</title>
        <link rel="icon" href="data:,">
        <style>
            * {
                margin: 0;
                padding: 0;
            }
        </style> 

        <!-- <script id="sap-ui-bootstrap"
            src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
            data-sap-ui-language="EN"
            data-sap-ui-preload="async"
            data-sap-ui-theme="&PATTERN003&"
            data-sap-ui-libs="&PATTERN004&"
            data-sap-ui-resourceroots='{&PATTERN005&}'>
        </script> -->

        <script id="sap-ui-bootstrap"
            src="&PATTERN002&"
            data-sap-ui-language="EN"
            data-sap-ui-preload="async"
            data-sap-ui-theme="&PATTERN003&"
            data-sap-ui-libs="&PATTERN004&"
            data-sap-ui-resourceroots='{&PATTERN005&}'>
        </script>

        <!-- <link rel="stylesheet" href="resources/css/index.css"> -->


    </head>
    <body>
        <div id="Content"></div>
        <script src="./index.js"></script>
    </body>
</html>`;

        return l_txt;

    }   //index.html 기본 패턴 정보.




    //main view.js 기본 패턴 정보.
    function lf_templateMainJS(){
        var l_txt = 
`sap.ui.define([
        "./control"
    ], function (oContr) {
        "use strict";

&PATTERN001&
        
        return oContr;

});`;

        return l_txt;
        
    }   //main view.js 기본 패턴 정보.



    //main control.js 기본 패턴 정보.
    function lf_templateControlJS(){
        var l_txt = 
`sap.ui.define([
    ], function () {
        "use strict";
        var oContr = {};
        oContr.ui = {};
        oContr.fn = {};
        oContr.attr = {};        
        oContr.attr.oModel = new sap.ui.model.json.JSONModel();

        return oContr;
        
});`;

        return l_txt;
        
    }   //main control.js 기본 패턴 정보.




    //index.js 기본 패턴 정보.
    function lf_templateIndexJS(){
        var l_txt = 
`//Events after UI5 CORE libraries have been loaded.
sap.ui.getCore().attachInit(function(){

    //Events after the UI is configured on the screen.
    function _updatedCallback(){
        //Remove events.
        _oRendering.detachUIUpdated(_updatedCallback);

    }

    
    let _oRendering = sap.ui.requireSync('sap/ui/core/Rendering');

    //Attach ui updated event.
    _oRendering.attachUIUpdated(_updatedCallback);

    //call main view js.
    sap.ui.requireSync('u4aApps/views/main/view').ui.APP.placeAt("Content");

});`

        return l_txt;
        
    }   //index.js 기본 패턴 정보.




    //템플릿 index.html 정보 구성.
    function lf_replaceTemplateHTML(is_data, bTemplate){

        //Library 정보 수집 처리.
        function lf_getLibraryList(it_child){

            for(var i=0, l=it_child.length; i<l; i++){
                    
                //하위를 탐색하며 라이브러리 정보 수집.
                lf_getLibraryList(it_child[i].zTREE);
                
                //skip 대상건인경우 수집 안함.
                if(lf_isSkip0014(it_child[i]) === true){continue;}
                
                //라이브러리명에 값이 없으면 skip.
                if(it_child[i].TGLIB === ""){continue;}
                
                //수집되지 않은 라이브러리만 수집 처리.
                if(lt_lib.findIndex( a => a === it_child[i].TGLIB ) === -1){
                    lt_lib.push(it_child[i].TGLIB);
    
                }
            }
        }


        //index.html 기본 패턴 정보 얻기.
        // var l_source = lf_readFileSync(loAPP.attr[C_INDEX_HTML]);
        var l_source = lf_templateHTML();

        //title 변경 처리.
        l_source = l_source.replaceAll("&PATTERN001&", is_data.title);

        //DAMI의 UI5 라이브러리 bootstrap 경로 구성
        l_source = l_source.replaceAll("&PATTERN002&", C_DAMI_LIB_SRC);

        //DAMI의 UI5 라이브러리 bootstrap data-sap-ui-theme 정보 구성
        l_source = l_source.replaceAll("&PATTERN003&", is_data.theme);

        var lt_lib = [];

        //라이브러리 정보 수집.
        if(!bTemplate){
            lf_getLibraryList(oAPP.attr.oModel.oData.zTREE);
        }        

        //data-sap-ui-libs 정보 구성.
        l_source = l_source.replaceAll("&PATTERN004&", lt_lib.join(","));

        //data-sap-ui-resourceroots 정보 구성.
        l_source = l_source.replaceAll("&PATTERN005&", C_DAMI_RESOURCE_ROOT);

        return l_source;

    }   //템플릿 index.html 정보 구성.




    //템플릿 index.css 정보 구성.
    function lf_replaceTemplateCSS(is_data){

        //index.css template sourcex 정보 얻기.
        // var l_source = lf_readFileSync(loAPP.attr[C_INDEX_CSS]);

        var l_source = "";

        var l_css = "";

        //css editor에 입력된 정보 얻기.
        var ls_edit = oAPP.DATA.APPDATA.T_EDIT.find( a => a.OBJID === "STYLECSS1" );

        if(ls_edit){
            l_css = ls_edit.DATA;
        }

        //css source 변경 처리.
        l_source = l_css;

        return l_source;

    }   //템플릿 index.css 정보 구성.
    



    //템플릿 main view.js 정보 구성.
    function lf_replaceTemplateMainJS(){

        //프로퍼티 값 구성시 쌍따옴표 적용 여부.
		function lf_setDoubleQuotation(UIADT){
			
			if(UIADT === "boolean"){return "";}
			if(UIADT === "int"){return "";}
			if(UIADT === "float"){return "";}
			
			return '"';
			
		}	//프로퍼티 값 구성시 쌍따옴표 적용 여부.



        //UI 생성 SCRIPT 구성.
		function lf_createUIInstance(is_tree, it_0015){
			
			//skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}
			
			//프로퍼티 정보 구성.
			var l_prop = lf_setProp(is_tree.OBJID, it_0015);

            //UI instance 생성 script 구성(var BUTTON1 = new sap.m.Button({text:"test"}); 형식의 script)
            var l_script = C_TAB + C_TAB + "var " + is_tree.OBJID + " = new " + is_tree.UILIB + "(" + l_prop + ");" + C_NEWLINE;

            // //UI5 버전별 jQuery.sap.require(); SCRIPT처리항목인경우 script 추가.
            // if(oAPP.attr.S_CODE.UA036.findIndex( a=> a.FLD01 === oAPP.attr.metadata.METADATA.LIBVER && a.FLD02 === is_tree.UIOBK ) !== -1){
            //     l_script = C_TAB + C_TAB + "jQuery.sap.require(\"" + is_tree.UILIB + "\");"+ C_NEWLINE + l_script;
            // }
			
			
			return l_script;
			
		}	//UI 생성 SCRIPT 구성.



        //부모에 추가 script 구성.
		function lf_setParent(is_tree, it_0015, is_parent){
			
			//skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}
			
			//EMBED Aggregation 정보 얻기.
			var l_parent = it_0015.find( a => a.OBJID === is_tree.OBJID && a.UIATY === "6" );
			
			//EMBED Aggregation 정보가 없는경우(최상위인경우)
			if(!l_parent){
                return C_TAB + C_TAB + "oContr.ui." + is_tree.OBJID + " = " + is_tree.OBJID + ";" + C_NEWLINE + C_NEWLINE + 
                    C_TAB + C_TAB + is_tree.OBJID + ".setModel(oContr.attr.oModel);" + C_NEWLINE + C_NEWLINE;
			}


            //EMBED Aggregation에 해당하는 부모의 aggregation 정보 얻기.
            var ls_0015 = it_0015.find( a=> a.OBJID === is_tree.POBID && a.UIATK === l_parent.UIATK );

            //부모의 aggregation에 바인딩 처리가 됐다면.
            if(ls_0015 && ls_0015.ISBND === "X" && ls_0015.UIATV !== ""){

                var l_param = C_TAB + C_TAB + "templateShareable: true" +  C_NEWLINE;

                //현재UI가 부모의 sap.m.Tree의 items aggregation에 존재하는경우, sap.ui.table.TreeTable의 rows aggregation에 존재하는경우.
                if((is_tree.PUIOK === "UO00467" && is_tree.UIATT === "items") || (is_tree.PUIOK === "UO01142" && is_tree.UIATT === "rows")){
                    l_param = 
                        C_TAB + C_TAB + "templateShareable: true," +  C_NEWLINE +
                        C_TAB + C_TAB + "parameters: {" + C_NEWLINE +
                        C_TAB + C_TAB + C_TAB + "collapseRecursive: false," + C_NEWLINE + 
                        C_TAB + C_TAB + C_TAB + `arrayNames: ["` + ls_0015.UIATV + `"]` + C_NEWLINE +
                        C_TAB + C_TAB + "}" + C_NEWLINE;
                }

                let _UIATV = lf_getBindPath(ls_0015);

                //PARENT.bindAggregation("aggregation name", {path:"bind path", template:CHILD});
                //형식의 SCRIPT 구성.
                return C_TAB + C_TAB + is_tree.POBID + 
                    `.bindAggregation("` + l_parent.UIATT + `", {` + C_NEWLINE +
                    C_TAB + C_TAB + C_TAB + `path: "` + _UIATV + `",` + C_NEWLINE +
                    C_TAB + C_TAB + C_TAB + "template: " + is_tree.OBJID + "," + C_NEWLINE +
                    l_param + 
                    C_TAB + C_TAB + "});" + C_NEWLINE + C_NEWLINE;
            }

			
			//set(add) aggregation명 얻기.
            var l_aggrnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[is_parent.OBJID], "3", l_parent.UIATT, "_sMutator");
			
			if(l_aggrnm){
				return C_TAB + C_TAB + is_tree.POBID + "." + l_aggrnm + "(" + is_tree.OBJID + ");" + C_NEWLINE + C_NEWLINE;
			}
						
		}	//부모에 추가 script 구성.



        //프로퍼티 값 구성.
        function lf_setPropVal(is_0015){

            //프로퍼티 타입 매핑.(n건 입력 가능한 구분자가 있다면 제거 처리)
            var l_UIADT = is_0015.UIADT.replace("[]", "");
            
            //상따옴표 적용 여부.
            var l_doqu = lf_setDoubleQuotation(l_UIADT);

            //단일 입력 가능한 프로퍼티인경우.
            if(is_0015.ISMLB === ""){

                //OTR TEXT 정보 반영.
				var l_UIATV = oAPP.fn.prevParseOTRValue(is_0015) || is_0015.UIATV;

                l_UIATV = l_UIATV.replace(/\"/g, "\\\"");

                return l_doqu + l_UIATV + l_doqu;
            }


            //프로퍼티가 N건 입력 가능한 경우.

            //N건 입력 가능한 프로퍼티지만 값을 입력하지 않은경우 빈 ARRAY 문자 RETURN.
            if(is_0015.UIATV === ""){
                return "[]";
            }

            var l_val = is_0015.UIATV;

            //array인경우 [로 시작하지 않다면 추가.
            if(l_val.substr(0, 1) !== "["){
                l_val = "[" + l_val;
            }

            //array인경우 ]로 끝나지 않다면 추가.
            if(l_val.substr(l_val.length - 1) !== "]"){
                l_val = l_val + "]";
            }

            return l_val;

        }   //프로퍼티 값 구성.



        //바인딩 path 구성 처리.
        function lf_getBindPath(s0015){

            let _UIATV = s0015.UIATV;

            //N건 모델 바인딩 처리 정보 얻기.
            let _modelBind = oAPP.fn.getParentAggrBind(oAPP.attr.prev[s0015.OBJID]);

            //N건 모델 바인딩 정보가 존재하는경우, 모델 필드명으로 파생되는 경우.
            if(_UIATV.startsWith(_modelBind) === true){
                //프로퍼티 바인딩 정보에서 해당 이름 제거 처리.
                _UIATV = _UIATV.replace(`${_modelBind}-`, "");
            
            }else{
                //그렇지 않은경우 structure 바인딩으로 처리되기에 맨 앞에 / 추가.
                _UIATV = "/" + _UIATV;
            }


            //필드명-필드명 => 필드명/필드명 형식으로 변경.
            _UIATV = _UIATV.replace(/-/, "/");

            return _UIATV;

        }



        //프로퍼티 정보 구성.
		function lf_setProp(OBJID, it_0015){
			
			//현재 UI의 변경한 프로퍼티 정보 발췌.
			var lt_0015 = it_0015.filter( a => a.OBJID === OBJID && a.UIATY === "1" 
                && a.UIATK.substr(0,2) === "AT" );
			
			//변경한 프로퍼티 정보가 없다면 exit.
			if(lt_0015.length === 0){return "";}
			
			var l_prop = "";
			var l_sep = "";	
						
			//프로퍼티명:"값", 프로퍼티명:값, ... 형식으로 구성.
			for(var i=0, l=lt_0015.length; i<l; i++){

                let _s0015 = lt_0015[i];

                //sap.ui.core.HTML UI의 content 프로퍼티인경우 skip.
                if(_s0015.UIATK === "AT000011858"){continue;}

                //값이 없다면 프로퍼티 구성 skip.
				if(_s0015.UIATV === ""){continue;}
                
                //바인딩 처리된 경우.
                if(_s0015.ISBND === "X"){

                    var _UIATV = lf_getBindPath(_s0015);

                    //프로퍼티명:"값" 형식의 SCRIPT 구성.
                    l_prop += l_sep + C_TAB + C_TAB + C_TAB + _s0015.UIATT + ':"{' + _UIATV + '}"';
                    
                    if(l_sep === ""){
                        l_sep = "," + C_NEWLINE;
                    }

                    continue;
                }
                
                //값에 { 문자가 포함된다면 구성 skip.
				if(_s0015.UIATV.indexOf("{") !== -1 ){continue;}

				
                //공통코드 예외처리 대상건인경우 처리 skip.
                if(oAPP.attr.S_CODE.UA032.findIndex( a => a.FLD01 === _s0015.UIOBK && a.FLD03 === _s0015.UIATT ) !== -1){
                    continue;
                }
                
				
                //프로퍼티명:"값" 형식의 SCRIPT 구성.
				l_prop += l_sep + C_TAB + C_TAB + C_TAB + _s0015.UIATT + ":" + lf_setPropVal(_s0015);
				
				if(l_sep === ""){
					l_sep = "," + C_NEWLINE;
				}
				
			}

            
            if(l_prop === ""){
                return "";
            }
			
			//구성한 프로퍼티 정보 return.
			return "{" + C_NEWLINE + l_prop + C_NEWLINE + C_TAB + C_TAB + "}";
			
			
		}	//프로퍼티 정보 구성.



        //UI.setProperty("값"); 처리.
        function lf_UIPropDirectly(is_tree, it_0015){

            //skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}

            //현재 UI의 변경한 프로퍼티 정보 발췌.
			var lt_0015 = it_0015.filter( a => a.OBJID === is_tree.OBJID && a.UIATY === "1" 
                && a.ISBND === "" );
            
            //변경한 프로퍼티 정보가 없다면 exit.
            if(lt_0015.length === 0){return "";}
            
            var l_prop = "";
                        
            //프로퍼티명:"값", 프로퍼티명:값, ... 형식으로 구성.
            for(var i=0, l=lt_0015.length; i<l; i++){

                //styleClass 프로퍼티에 값을 입력한 경우.
                if(lt_0015[i].UIATK.substr(0,3) === "EXT" && lt_0015[i].UIASN === "STYLECLASS"){

                    var _UIATV = lt_0015[i].UIATV;

                    _UIATV = _UIATV.replace(/\"/g, "\\\"");

                    //미리보기 화면의 UI STYLECLASS 처리.
                    l_prop += is_tree.OBJID + ".addStyleClass(\"" + _UIATV + "\");";
                    continue;
                }
                
                //sap.ui.core.HTML UI의 content 프로퍼티여부 확인.
                var l_html = oAPP.fn.setHTMLContentProp(lt_0015[i]);

                //sap.ui.core.HTML UI의 content인경우 script 구성.
                if(l_html){

                    l_html = l_html.replace(/\"/g, "\\\"");

                    l_prop += is_tree.OBJID + ".setContent(\"" + l_html + "\");";
                    continue;
                }

                //프로퍼티에 { 문자가 없다면 하위 로직 skip.
                if(lt_0015[i].UIATV.indexOf("{") === -1){continue;}

                //dragAble, dropAble 프로퍼티의 경우 처리할건이 존재하지 않기에 exit 처리.
                if(lt_0015[i].UIASN === "DRAGABLE" || lt_0015[i].UIASN === "DROPABLE"){
                    continue;
                }

                //공통코드 예외처리 대상건인경우 처리 skip.
                if(oAPP.attr.S_CODE.UA032.findIndex( a => a.FLD01 === lt_0015[i].UIOBK && a.FLD03 === lt_0015[i].UIATT ) !== -1){
                    continue;
                }

                //default property
                var l_uiaty = "1";

                //직접 입력가능한 aggregation인경우 UIATY을 aggregation으로 변경.
                if(lt_0015[i].UIATK.indexOf("_1") !== -1){
                    l_uiaty = "3";
                }
                
                //setProperty 명 얻기.
                var l_propnm = oAPP.fn.getUIAttrFuncName(oAPP.attr.prev[lt_0015[i].OBJID], l_uiaty, lt_0015[i].UIATT, "_sMutator");


                //UI.setValue(값); 형식의 script 구성.
                l_prop += is_tree.OBJID + "." + l_propnm + "(" + lf_setPropVal(lt_0015[i]) + ");";
                
                
            }
            
            //구성한 프로퍼티 정보 return.
            return C_TAB + C_TAB + l_prop + C_NEWLINE;
            
            
        }   //UI.setProperty("값"); 처리.



        //UI.attachEvent script 구성.
        function lf_UISetEvent(is_tree, it_0015){

            //skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}

            //현재 UI의 변경한 프로퍼티 정보 발췌.
			var lt_0015 = it_0015.filter( a => a.OBJID === is_tree.OBJID && a.UIATY === "2" 
                && a.UIATK.substr(0,2) === "AT" );

            if(lt_0015.length === 0){return "";}

            var l_event = "";

            for(var i=0, l=lt_0015.length; i<l; i++){

                var ls_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === is_tree.OBJID + lt_0015[i].UIASN && a.OBJTY === "JS");
                if(!ls_cevt){continue;}

                
                //event script 구성.
                l_event += C_TAB + C_TAB + is_tree.OBJID + ".attachEvent(\"" +  lt_0015[i].UIATT + "\", function(oEvent){" + C_NEWLINE;

                //\n 으로 분리.
                var lt_split = ls_cevt.DATA.split(C_NEWLINE);

                for(var j=0, jl=lt_split.length; j<jl; j++){
                    if(lt_split[j] === ""){
                        l_event += C_NEWLINE;
                        continue;
                    }

                    l_event += C_TAB + C_TAB + C_TAB + lt_split[j] + C_NEWLINE;

                }

                //event script 구성.
                l_event += C_TAB + C_TAB +  "});" + C_NEWLINE + C_NEWLINE;

            }

            return l_event;


        }   //UI.attachEvent script 구성.



        //tree를 하위 탐색하며 script 정보 구성.
		function lf_setUIScript(it_tree, it_0015, is_parent){
			
			var l_script = "";
			
			for(var i=0, l=it_tree.length; i<l; i++){
							
				//UI instance 생성 script 구성.
				l_script += lf_createUIInstance(it_tree[i], it_0015);

                //UI.setProperty(); script 구성.
                l_script += lf_UIPropDirectly(it_tree[i], it_0015);

                //UI.attachEvent script 구성.
                l_script += lf_UISetEvent(it_tree[i], it_0015);
				
				//부모 UI에 추가 처리.
				l_script += lf_setParent(it_tree[i], it_0015, is_parent);
				
				//CHILD 정보의 UI INSTANCE 생성 SCRIPT 구성.
				l_script += lf_setUIScript(it_tree[i].zTREE, it_0015, it_tree[i]);
				
				
			}		
			
			//구성한 script 정보 return.
			return l_script;
						
		}	//tree를 하위 탐색하며 script 정보 구성.


        //sap.ui.getCore().loadLibrary 처리 script 구성.
        function lf_getLibraryList(it_child){

            for(var i=0, l=it_child.length; i<l; i++){
                    
                //하위를 탐색하며 라이브러리 정보 수집.
                lf_getLibraryList(it_child[i].zTREE);
                
                //skip 대상건인경우 수집 안함.
                if(lf_isSkip0014(it_child[i]) === true){continue;}
                
                //라이브러리명에 값이 없으면 skip.
                if(it_child[i].TGLIB === ""){continue;}
                
                //수집되지 않은 라이브러리만 수집 처리.
                if(lt_lib.findIndex( a => a === it_child[i].TGLIB ) === -1){
                    lt_lib.push(it_child[i].TGLIB);

                    l_lib += C_TAB + C_TAB +  "sap.ui.getCore().loadLibrary(\"" + it_child[i].TGLIB + "\");" + C_NEWLINE;
    
                }
            }

        }   //sap.ui.getCore().loadLibrary 처리 script 구성.



        //jQuery.sap.require 처리 script 구성.
        function lf_getRequireList(it_child){

            for(var i=0, l=it_child.length; i<l; i++){
                    
                //하위를 탐색하며 라이브러리 정보 수집.
                lf_getRequireList(it_child[i].zTREE);
                
                //skip 대상건인경우 수집 안함.
                if(lf_isSkip0014(it_child[i]) === true){continue;}
            
                //jQuery.sap.require 대상 항목 여부 확인.
                if(oAPP.attr.S_CODE.UA036.findIndex( a=> a.FLD01 === l_info.META.LIBVER && 
                    a.FLD02 === it_child[i].UIOBK && a.FLD04 === "" ) === -1){
                    
                    //jQuery.sap.require 대상 건이 아닌경위 하위 로직 SKIP.
                    continue;

                }

                //수집되지 않은 라이브러리만 수집 처리.
                if(lt_require.findIndex( a => a === it_child[i].UILIB ) === -1){
                    lt_require.push(it_child[i].UILIB);

                    l_require += C_TAB + C_TAB +  "jQuery.sap.require(\"" + it_child[i].UILIB + "\");" + C_NEWLINE;
    
                }
            }

        }   //jQuery.sap.require 처리 script 구성.


        var l_lib = "";
        var lt_lib = [];

        var l_require = "";
        var lt_require = [];

        //접속 서버, 및 유저 정보 얻기.
        var l_info = parent.getUserInfo();

        //sap.ui.getCore().loadLibrary(""); 처리 script 구성.
        lf_getLibraryList(oAPP.attr.oModel.oData.zTREE);


        //jQuery.sap.require(""); 처리 script 구성.
        lf_getRequireList(oAPP.attr.oModel.oData.zTREE);

        //main view.js template source 정보 얻기.
        // var l_source = lf_readFileSync(loAPP.attr[C_MAIN_VIEW_JS]);
        var l_source = lf_templateMainJS();

        //현재 design 영역에 있는 UI를 기준으로 script 구성.
        var l_script = l_lib + C_NEWLINE + C_NEWLINE;

        if(l_require !== ""){
            l_script += l_require + C_NEWLINE + C_NEWLINE;
        }

        l_script += lf_setUIScript(oAPP.attr.oModel.oData.zTREE, oAPP.fn.getAttrChangedData());


        l_source = l_source.replaceAll("&PATTERN001&", l_script);


        return l_source;

    }   //템플릿 main view.js 정보 구성.




    //파일 다운로드 전 작업 처리 폴더명 얻기.
    function lf_getWorkFolderName(i_folderPath){

        var l_found = true;

        while(l_found){
            //랜덤 폴더명 구성.
            var l_folder = window.crypto.getRandomValues(new Uint32Array(1)).toString();
            
            //해당 폴더가 존재하는지 확인.
            l_found = lf_existsSync(parent.PATH.join(i_folderPath, l_folder));

            //존재하지 않는다면 해당 폴더명 return. 
            if(!l_found){
                return l_folder;
            }

        }

    };  //파일 다운로드 전 작업 처리 폴더명 얻기.




    //샘플 다운로드.
    function lf_sampleDownload(){

        //editor 입력건을 해당 source에 반영 처리.
        lf_selTabBar(loAPP.oModel.getProperty("/editorKey"), true);

        //다운로드전 입력값 점검.
        if(lf_chkValidate()){return;}

        //다운로드 경로에 파일명 존재여부 확인.
        if(lf_chkFileExistsSample()){return;}

        //다운로드 전 확인 팝업 호출.
        parent.showMessage(sap, 30, "I", "다운로드를 진행하시겠습니까?", lf_sampleDownloadCB);


    }   //샘플 다운로드.




    //템플릿 다운로드.
    function lf_templateDownload(){

        //editor 입력건을 해당 source에 반영 처리.
        lf_selTabBar(loAPP.oModel.getProperty("/editorKey"), true);

        //다운로드전 입력값 점검.
        if(lf_chkValidate()){return;}

        //다운로드 경로에 파일명 존재여부 확인.
        if(lf_chkFileExistsTemplate()){return;}

        //다운로드 전 확인 팝업 호출.
        parent.showMessage(sap, 30, "I", "다운로드를 진행하시겠습니까?", lf_templateDownloadCB);


    }   //템플릿 다운로드.




    //템플릿 다운로드 callback.
    async function lf_templateDownloadCB(param){
        
        //확인팝업에서 YES를 하지 않은 경우 EXIT.
        if(param !== "YES"){return;}

        loAPP.ui.oDialog.setBusy(true);

                
        //backend readme 파일 정보 얻기.
        var l_backend_readme = await lf_HtthpRequest(C_BACKEND_README_PATH + "?"+ oAPP.fn.getRandomKey()).catch(function(){
            loAPP.ui.oDialog.setBusy(false);            
            parent.showMessage(sap, 20, "E", "backend의 readme 파일 얻기 실패.");
            return;
        });


        //application의 readme 파일 정보 얻기.
        var l_app_readme = await lf_HtthpRequest(C_APP_README_PATH + "?"+ oAPP.fn.getRandomKey()).catch(function(){
            loAPP.ui.oDialog.setBusy(false);            
            parent.showMessage(sap, 20, "E", "application의 readme 파일 얻기 실패.");
            return;
        });

        
        var ls_data = loAPP.oModel.getData();

        ls_data.source = {};

        //index.html 파일 정보 얻기.
        ls_data.source[C_INDEX_HTML] = lf_replaceTemplateHTML(ls_data, true);

        //index.css 파일 정보 얻기.
        ls_data.source[C_INDEX_CSS] = "";

        //main view.js 파일 정보 얻기.
        ls_data.source[C_MAIN_VIEW_JS] = lf_templateMainJS();

        ls_data.source[C_MAIN_VIEW_JS] = ls_data.source[C_MAIN_VIEW_JS].replaceAll("&PATTERN001&", "");

        //작업 폴더명 구성.
        var l_folder = lf_getWorkFolderName(ls_data.downPath);

        //다운로드 경로 + 다운로드 폴더명의 path 구성.
        var l_downPath = parent.PATH.join(ls_data.downPath, l_folder);

        //작업 폴더 생성.
        if(lf_mkdirSync(l_downPath)){
            loAPP.ui.oDialog.setBusy(false);
            return;
        }

        //backend 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, C_BACKEND))){
            loAPP.ui.oDialog.setBusy(false);            
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //readme 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, C_BACKEND), C_README, l_backend_readme)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //login 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "login"))){
            loAPP.ui.oDialog.setBusy(false);            
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.html 파일 생성.
        if(lf_writeFileSync(l_downPath, "index.html", ls_data.source[C_INDEX_HTML])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //application의 readme 파일 생성.
        if(lf_writeFileSync(l_downPath, C_README, l_app_readme)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }


        //resources 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //resources 폴더 안에 images 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources", "images"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //resources 폴더 안에 CSS 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources", "css"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.css 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "resources", "css"), "index.css", ls_data.source[C_INDEX_CSS])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }
        
        //js 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "views"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.js source 구성.
        var l_indexJS = lf_templateIndexJS();

        // //index.js의 패턴 변환 처리.
        // l_indexJS = l_indexJS.replaceAll("&PATTERN001&", ls_data.fileName.toLowerCase());

        //index.js 파일 생성.
        if(lf_writeFileSync(l_downPath, "index.js", l_indexJS)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //js 폴더 안에 main 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "views", "main"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //main control.js source 구성.
        var l_controlJS = lf_templateControlJS();

        //control.js 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "views", "main"), "control.js", l_controlJS)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //view.js 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "views", "main"), "view.js", ls_data.source[C_MAIN_VIEW_JS])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //작업폴더 압축.
        var l_ret = await lf_executeZipFile(l_downPath, ls_data.fileName.toLowerCase(), parent.PATH.join(ls_data.downPath, ls_data.fileName.toLowerCase() + ".zip"));
        

        //압축 처리 종료 후 작업 폴더 삭제 
        try {
            parent.FS.rmdirSync(l_downPath, {recursive: true, force: true});
        } catch (error) {
        
        }


        loAPP.ui.oDialog.setBusy(false);

        //처리완료 메시지.
        parent.showMessage(sap, 30, "S", "다운로드를 완료 했습니다. 해당 폴더를 여시겠습니까?", lf_templateDownComplateCB);
        

    }   //템플릿 다운로드 callback.




    //다운로드 완료 후 폴더 열기 팝업 종료.
    function lf_templateDownComplateCB(param){

        
        if(param !== "YES"){
            lf_afterClose();
            return;
        }

        var ls_data = loAPP.oModel.getData();

        //다운로드한 폴더 열기.
        // parent.REMOTE.shell.showItemInFolder(parent.PATH.join(ls_data.downPath, ls_data.fileName + ".zip"));
        parent.REMOTE.shell.showItemInFolder(parent.PATH.join(ls_data.downPath, ls_data.fileName + ".zip"));


        lf_afterClose();

    }   //다운로드 완료 후 폴더 열기 팝업 종료.




    //폴더 생성 처리.
    function lf_mkdirSync(i_path){
        try {
            parent.FS.mkdirSync(i_path);
        } catch (e) {
            parent.showMessage(sap, 20, "E", "다운로드 작업 실패.");
            return true;
        }
    }   //폴더 생성 처리.




    //파일 정보 다운로드 처리.
    function lf_writeFileSync(i_path, i_fileName, i_content){

        try{
            //library-preload.js 파일 다운로드
            parent.FS.writeFileSync(parent.PATH.join(i_path, i_fileName), i_content, "utf-8");
    
        }catch(e){
            parent.showMessage(sap, 20, "E", "다운로드 작업 실패.");
            return true;
        }

    }   //파일 정보 다운로드 처리.




    //폴더 삭제.
    function lf_rmdirSync(i_path){

        try {
            parent.FS.rmdirSync(i_path, {recursive: true, force: true});
        } catch (error) {
        
        }

    }   //폴더 삭제.



    
    //미리보기 이미지 구성 처리.
    async function lf_setPreviewImage(){
                
        return new Promise(async (resolve, reject) => {

            //open 이후 callback 처리.
            async function lf_browserOpened(i_width, i_height){        
                
                var l_image;

                //화면 캡처 처리.
                try {
                    //open된 window의 내부 size를 화면에 맞게 변경 처리.
                    l_page.setViewport({width: i_width, height: i_height});

                } catch (error) {
   
                }


                setTimeout(async () => {
                    
                    try {
                        l_image = await l_page.screenshot();
                        
                        //호출된 창 종료.
                        l_page.close();
    
                        //browser 종료.
                        browser.close();
    
                        //이미지 정보 return.
                        resolve(l_image);
                        
                    } catch (error) {
                        
                    }
                    
                }, 1000);


        
            }   //open 이후 callback 처리.


            var puppeteer = parent.require("puppeteer-core");

            var browser = await puppeteer.launch({
                // headless: false,
                headless: true,
                args: ['--start-maximized'],
                executablePath: l_chromePath
            });


            var lt_page = await browser.pages();

            var l_page = lt_page[0];

            var ls_userInfo = parent.getUserInfo();

            var l_theme = loAPP.oModel.getProperty("/theme");

            //APPLICATION 호출 URL 정보 구성.
            var l_url = parent.getServerHost() + "/zu4a/" + oAPP.attr.APPID + 
                "?sap-language=" + ls_userInfo.LANGU + 
                "&sap-user=" + ls_userInfo.ID + 
                "&sap-password=" + ls_userInfo.PW +
                "&sap-ui-theme=" + l_theme;

            l_page.goto(l_url);


            var l_wait = 0;
            var l_switch = false;

            var intv = setInterval(async () => {

                l_wait += 10;
                
                //waiting on/off 상태 정보 확인.
                try{
                    var l_stat = await l_page.evaluate("(function(){if(typeof oU4A !== 'undefined' && oU4A.f_isWaiting){return oU4A.f_isWaiting();}})();");
                }catch(e){
                    return;
                }

                try {

                    var l_width = await l_page.evaluate("window.outerWidth");
            
                    var l_height = await l_page.evaluate("window.outerHeight");
                    
                } catch (e) {
                    return;
                }

                    
                //아직 로드 안됐음.	
                if(typeof l_stat === "undefined"){return;}
                
                
                //2초동안 setInterval을 수행 했다면.
                if(l_wait >= 2000){
                    //waiting 상태를 얻지 못했다 판단하여 종료 처리.
                    clearInterval(intv);
                    
                    setTimeout(function(){
                        //open 이후 callback 처리.
                        lf_browserOpened(l_width, l_height);
                    }, 3000); 
                
                    return;
            
                }
                    
                
                //최초 waiting off 상태 -> on 상태를 감지 했다면.
                if(!l_switch && l_stat){
                    //off -> on 됐음 flag 처리.
                    l_switch = true;
                    return;
                }
                
                //waiting on -> off 상태가 됐다면.
                if(l_switch && !l_stat){
                    
                    clearInterval(intv);
                
                    setTimeout(function(){
                        //open 이후 callback 처리.
                        lf_browserOpened(l_width, l_height);
                    }, 3000); 		
                
                    return;

                }
                
            }, 10);


        
        });


    }   //미리보기 이미지 구성 처리.




    //샘플 다운로드 callback event.
    async function lf_sampleDownloadCB(param){
        
        //확인팝업에서 YES를 하지 않은 경우 EXIT.
        if(param !== "YES"){return;}

        loAPP.ui.oDialog.setBusy(true);

        
        //이미지 bin 정보 얻기.
        var l_image = await lf_setPreviewImage();

        //이미지 정보를 얻지 못한 경우.
        if(!l_image){
            loAPP.ui.oDialog.setBusy(false);
            parent.showMessage(sap, 20, "E", "미리보기 이미지 구성 실패.");
            return;
        }

        
        //backend readme 파일 정보 얻기.
        var l_backend_readme = await lf_HtthpRequest(C_BACKEND_README_PATH + "?"+ oAPP.fn.getRandomKey()).catch(function(){
            loAPP.ui.oDialog.setBusy(false);            
            parent.showMessage(sap, 20, "E", "backend의 readme 파일 얻기 실패.");
            return;
        });


        //application의 readme 파일 정보 얻기.
        var l_app_readme = await lf_HtthpRequest(C_APP_README_PATH + "?"+ oAPP.fn.getRandomKey()).catch(function(){
            loAPP.ui.oDialog.setBusy(false);            
            parent.showMessage(sap, 20, "E", "application의 readme 파일 얻기 실패.");
            return;
        });

        
        var ls_data = loAPP.oModel.getData();

        //작업 폴더명 구성.
        // var l_folder = lf_getWorkFolderName(ls_data.downPath);

        var l_folder = ls_data.fileName.toLowerCase();

        //다운로드 경로 + 다운로드 폴더명의 path 구성.
        var l_downPath = parent.PATH.join(ls_data.downPath, l_folder);

        //작업 폴더 생성.
        if(lf_mkdirSync(l_downPath)){
            loAPP.ui.oDialog.setBusy(false);
            return;
        }

        //backend 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, C_BACKEND))){
            loAPP.ui.oDialog.setBusy(false);            
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //readme 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, C_BACKEND), C_README, l_backend_readme)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //login 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "login"))){
            loAPP.ui.oDialog.setBusy(false);            
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.html 파일 생성.
        if(lf_writeFileSync(l_downPath, "index.html", ls_data.source[C_INDEX_HTML])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //application의 readme 파일 생성.
        if(lf_writeFileSync(l_downPath, C_README, l_app_readme)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //preview 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "preview"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }


        //preview 이미지 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "preview"), "preview.png", l_image)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //resources 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //resources 폴더 안에 images 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources", "images"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //resources 폴더 안에 CSS 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "resources", "css"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.css 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "resources", "css"), "index.css", ls_data.source[C_INDEX_CSS])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }
        
        //js 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "views"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //index.js source 구성.
        var l_indexJS = lf_templateIndexJS();

        // //index.js의 패턴 변환 처리.
        // l_indexJS = l_indexJS.replaceAll("&PATTERN001&", ls_data.fileName.toLowerCase());

        //index.js 파일 생성.
        if(lf_writeFileSync(l_downPath, "index.js", l_indexJS)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //js 폴더 안에 main 폴더 생성.
        if(lf_mkdirSync(parent.PATH.join(l_downPath, "views", "main"))){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //main control.js source 구성.
        var l_controlJS = lf_templateControlJS();

        //control.js 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "views", "main"), "control.js", l_controlJS)){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }

        //view.js 파일 생성.
        if(lf_writeFileSync(parent.PATH.join(l_downPath, "views", "main"), "view.js", ls_data.source[C_MAIN_VIEW_JS])){
            loAPP.ui.oDialog.setBusy(false);
            //폴더 생성 실패시 작업 폴더 삭제.
            lf_rmdirSync(l_downPath);
            return;
        }
        

        // //작업폴더 압축.
        // var l_ret = await lf_executeZipFile(l_downPath, ls_data.fileName.toLowerCase(), parent.PATH.join(ls_data.downPath, ls_data.fileName.toLowerCase() + ".zip"));

        // //command로 tar 파일 생성 처리.
        // if(lf_createTar(ls_data.downPath, ls_data.fileName)){

        //     loAPP.ui.oDialog.setBusy(false);
            
        //     //폴더 생성 실패시 작업 폴더 삭제.
        //     lf_rmdirSync(l_downPath);

        //     //폴더 생성 실패시 sample folder 삭제.
        //     lf_rmdirSync(l_sampleFolder);

        //     return;

        // }


        // //압축 파일을 sample 폴더로 copy 처리.
        // if(lf_copyFileSync(parent.PATH.join(ls_data.downPath, l_folder + ".tar"), parent.PATH.join(l_downPath, l_folder + ".tar"))){

        // }
        

        // //압축 처리 종료 후 작업 폴더 삭제 
        // try {
        //     parent.FS.rmdirSync(parent.PATH.join(ls_data.downPath, l_folder + ".tar"), {recursive: true, force: true});
        // } catch (error) {
        
        // }


        loAPP.ui.oDialog.setBusy(false);

        //처리완료 메시지.
        parent.showMessage(sap, 30, "S", "다운로드를 완료 했습니다. 해당 폴더를 여시겠습니까?", lf_downComplateCB);
        

    }   //샘플 다운로드 callback event.




    //tar 파일 생성 처리.
    function lf_createTar(i_downPath, i_fileName){

        //다운로드 경로를 분리 처리.
        var l_parse = parent.PATH.parse(i_downPath);

        //분리된 정보가 존재하지 않는경우 exit.
        if(!l_parse || !l_parse.root){return true;}

        //root 드라이브(c:\\ or c:/ 형식에서 / 제거)
        var l_root = l_parse.root.replace(/\//g, "");

        //root 드라이브(c:\\ or c:/ 형식에서 \\ 제거)
        l_root = l_root.replace(/\\/g, "");

        //command 처리 node js require처리.
        var cmd = parent.require('node-cmd');

        if(!cmd){return true;}

        //(최상위 드라이브 이동 -> 다운로드한 최상위 드라이브로 이동 -> 다운로드한 폴더 위치로 이동 -> 압축 처리)
        var l_command = "CD\\ & " + l_root + " & CD " + i_downPath + " & tar -czcvf " + i_fileName + ".tar " + i_fileName;

        try{
            cmd.runSync(l_command);
        }catch(e){
            parent.showMessage(sap, 20, "E", "다운로드 작업 실패.");
            return true;
        }
        

    }   //tar 파일 생성 처리.




    //파일 복사 처리.
    function lf_copyFileSync(i_source, i_target){
        
        try {
            parent.FS.copyFileSync(i_source, i_target);
        } catch (error) {
            parent.showMessage(sap, 20, "E", "다운로드 작업 실패.");
            return true;
        }

    }   //파일 복사 처리.




    //처리완료후 폴더 open 여부 callback.
    function lf_downComplateCB(param){

        if(param !== "YES"){
            lf_afterClose();
            return;
        }

        var ls_data = loAPP.oModel.getData();

        //다운로드한 폴더 열기.
        // parent.REMOTE.shell.showItemInFolder(parent.PATH.join(ls_data.downPath, ls_data.fileName + ".zip"));
        parent.REMOTE.shell.showItemInFolder(parent.PATH.join(ls_data.downPath, ls_data.fileName, "index.html"));


        lf_afterClose();


    }   //처리완료후 폴더 open 여부 callback.


    

    //zip 파일 생성.
    async function lf_executeZipFile(i_sourceFolder, i_fileName, i_target){

        return new Promise((resolve, reject) => {

            //zip instnace 생성.
            try {
                var oZipLib = parent.require("zip-lib");

                var zip = new oZipLib.Zip();
                
            } catch (e) {
                parent.showMessage(sap, 20, "E", e);
                return;
            }

            zip.addFolder(i_sourceFolder, i_fileName);

            zip.archive(i_target).then(function () {
                    resolve("S");
                }, function (err) {
                    resolve("E");
            });

        });    

    }  //zip 파일 생성.



    //입력값 점검.
    function lf_chkValidate(){

        //바인딩 정보 얻기.
        var ls_data = loAPP.oModel.getData();

        //value state 정보 초기화.
        ls_data.stat = lf_setValueState();

        var l_err = false;


        //파일명 입력이 누락됐다면.
        if(ls_data.fileName === ""){
            
            //오류 flag 처리.
            l_err = true;

            ls_data.stat.st.fileName = "Error";

            //027	&1 is required entry value
            ls_data.stat.tx.fileName = parent.WSUTIL.getWsMsgClsTxt(
                oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "027", "파일명");

        }


        //파일명 입력이 누락됐다면.
        if(ls_data.title === ""){
            
            //오류 flag 처리.
            l_err = true;

            ls_data.stat.st.title = "Error";

            //027	&1 is required entry value
            //024	Title
            ls_data.stat.tx.title = parent.WSUTIL.getWsMsgClsTxt(
                oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "027", 
                parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "024"));

        }


        //다운로드 경로 입력이 누락됐다면.
        if(ls_data.downPath === ""){
            
            //오류 flag 처리.
            l_err = true;

            ls_data.stat.st.downPath = "Error";

            //027	&1 is required entry value
            ls_data.stat.tx.downPath = parent.WSUTIL.getWsMsgClsTxt(
                oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "027", "다운로드 경로");

        }


        //index.html 정보가 없는경우.
        if(ls_data.source[C_INDEX_HTML] === ""){
            //오류 flag 처리.
            l_err = true;

            ls_data.stat.st[C_INDEX_HTML] = "Critical";

            //027	&1 is required entry value
            ls_data.stat.tx[C_INDEX_HTML] = parent.WSUTIL.getWsMsgClsTxt(
                oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "027", "index.html source");

        }


        //index.js 정보가 없는경우.
        if(ls_data.source[C_MAIN_VIEW_JS] === ""){
            //오류 flag 처리.
            l_err = true;

            ls_data.stat.st[C_MAIN_VIEW_JS] = "Critical";

            //027	&1 is required entry value
            ls_data.stat.tx[C_MAIN_VIEW_JS] = parent.WSUTIL.getWsMsgClsTxt(
                oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "027", "main view.js source");

        }


        //모델 갱신 처리.
        loAPP.oModel.setData(ls_data);

        //필수 입력값 누락건이 존재하는경우.
        if(l_err){
            //138 Check for errors
            parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "138", "", "", "", ""));
            return true;
        }

    }   //입력값 점검.




    //다운로드 할 경로에 파일명이 존재하는지 여부 확인.
    function lf_chkFileExistsSample(){

        var ls_data = loAPP.oModel.getData();

        // var l_path = parent.PATH.join(ls_data.downPath, ls_data.fileName + ".zip");

        //다운로드 경로에 입력 폴더명이 존재하는지 확인.
        var l_path = parent.PATH.join(ls_data.downPath, ls_data.fileName);

        //다운로드 경로 + 파일명.zip 의 파일이 존재한다면.
        if(lf_existsSync(l_path)){

            ls_data.stat.st.fileName = "Error";
            ls_data.stat.st.downPath = "Error";

            // ls_data.stat.tx.fileName = "다운로드 경로에 처리대상 파일명이 존재합니다." + "\n" +
            ls_data.stat.tx.fileName = "다운로드 경로에 입력한 폴더명이 존재합니다." + "\n" +
                "(" + l_path + ")";

            ls_data.stat.tx.downPath = ls_data.stat.tx.fileName;

            parent.showMessage(sap, 20, "E", ls_data.stat.tx.fileName);

            loAPP.oModel.setProperty("/stat", ls_data.stat);

            //오류 flag return.
            return true;

        }

        //다운로드 경로에 입력 폴더명이 존재하는지 확인.
        var l_path = parent.PATH.join(ls_data.downPath, ls_data.fileName + ".tar");

        //다운로드 경로 + 파일명.tar 의 파일이 존재한다면.
        if(lf_existsSync(l_path)){

            ls_data.stat.st.fileName = "Error";
            ls_data.stat.st.downPath = "Error";

            ls_data.stat.tx.fileName = "다운로드 경로에 처리대상 파일명이 존재합니다." + "\n" +
                "(" + l_path + ")";

            ls_data.stat.tx.downPath = ls_data.stat.tx.fileName;

            parent.showMessage(sap, 20, "E", ls_data.stat.tx.fileName);

            loAPP.oModel.setProperty("/stat", ls_data.stat);

            //오류 flag return.
            return true;

        }

    }   //다운로드 할 경로에 파일명이 존재하는지 여부 확인.




    //다운로드 할 경로에 파일명이 존재하는지 여부 확인.
    function lf_chkFileExistsTemplate(){

        var ls_data = loAPP.oModel.getData();

        //다운로드 경로에 입력 폴더명이 존재하는지 확인.
        var l_path = parent.PATH.join(ls_data.downPath, ls_data.fileName + ".zip");

        //다운로드 경로 + 파일명.zip 의 파일이 존재한다면.
        if(lf_existsSync(l_path)){

            ls_data.stat.st.fileName = "Error";
            ls_data.stat.st.downPath = "Error";

            ls_data.stat.tx.fileName = "다운로드 경로에 처리대상 파일명이 존재합니다." + "\n" +
                "(" + l_path + ")";

            ls_data.stat.tx.downPath = ls_data.stat.tx.fileName;

            parent.showMessage(sap, 20, "E", ls_data.stat.tx.fileName);

            loAPP.oModel.setProperty("/stat", ls_data.stat);

            //오류 flag return.
            return true;

        }

    }   //다운로드 할 경로에 파일명이 존재하는지 여부 확인.




    //파일, 폴더 존재여부 확인.
    function lf_existsSync(i_path){

        try {
            return parent.FS.existsSync(i_path);
            
        } catch (e) {
            return false;
        }

    }   //파일, 폴더 존재여부 확인.




    //파일 정보 얻기.
    function lf_readFileSync(i_path){

        try {
            return parent.FS.readFileSync(i_path, "utf-8");
            
        } catch (e) {
        }

    }   //파일 정보 얻기.




    //다운로드 폴더 선택 팝업 호출.
    function lf_callDirectoryBrowser(){

        var options = {
            title : "경로 선택",
            defaultPath : loAPP.oModel.getProperty("/downPath"),
            properties: ["openDirectory"]
        };
        
        parent.REMOTE.dialog.showOpenDialog(parent.REMOTE.getCurrentWindow(), options).then((e)=>{ 

            if(!e || !e.filePaths || !e.filePaths.length){
                return;
            }

            loAPP.oModel.setProperty("/downPath", e.filePaths[0]);

            //폴더 경로가 존재하는경우 메시지 초기화.
            if(e.filePaths[0]){                
                loAPP.oModel.setProperty("/stat/st/downPath", "None");
                loAPP.oModel.setProperty("/stat/tx/downPath", "");
            }

        });

    }   //다운로드 폴더 선택 팝업 호출.




    //테마 ddlb 선택 이벤트.
    function lf_selThemeDDLB(){

        var ls_data = loAPP.oModel.getData();

        //index.html SOURCE 재구성.
        ls_data.source[C_INDEX_HTML] = lf_replaceTemplateHTML(ls_data);

        //현재 선택한 ICON TAB이 index.html이면 화면 갱신 처리.
        if(ls_data.editorKey === C_INDEX_HTML){
            ls_data.editorValue = ls_data.source[C_INDEX_HTML];
        }

        loAPP.oModel.setData(ls_data);

    }   //테마 ddlb 선택 이벤트.




    //code editor 변경 이벤트.
    function lf_changeEditor(){

        //모델 정보 얻기.
        var ls_data = loAPP.oModel.getData();

        //code editor에 입력한 값을 해당 source에 업데이트 처리.
        ls_data.source[ls_data.editorKey] = ls_data.editorValue;

        loAPP.oModel.setData(ls_data);

    }   //code editor 변경 이벤트.




    //HTTP 요청.
    async function lf_HtthpRequest(sUrl){

        return new Promise((resolve, reject) => {
            var xhttp = new XMLHttpRequest();
            xhttp.addEventListener("load", (params)=>{
                if (xhttp.status === 200) {
                    resolve(params.target.responseText);
                }else{
                    reject();    
                }
                
            });

            xhttp.addEventListener("error", (params)=>{
                reject();
            });

            xhttp.open("GET", sUrl);
            xhttp.send();

        });

    }   //HTTP 요청.


})();