(function(){

    //description 원어(EN).
    const C_EN = "EN";

    //attribute 설명글 팝업 호출.
    oAPP.fn.callAttrDescPopup = async function(oUi, is_attr){
        
        //openBy 처리 UI가 존재하지 않는경우 exit.
        if(!oUi){return;}

        //대상 attribute의 라이브러리명 탐색.
        var l_LIBNM = lf_getLibraryName(is_attr);

        //라이브러리명을 찾지 못한 경우 exit.
        if(!l_LIBNM){
            //A35  Description
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", 
            oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
            oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", ""), "", "", ""));
            return;
        }        

        //원어에 해당하는 DESC 정보 검색.
        var ls_desc1 = lf_getDescData(C_EN, l_LIBNM, is_attr.UIATT);

        var ls_desc2;

        //세팅된 언어 정보 얻기.
        var l_LANGU = await parent.WSUTIL.getWsLanguAsync();

        //세팅된 언어가 원어와 다른경우 번역본에 해당하는 DESC정보 검색.
        if(l_LANGU !== C_EN){
            ls_desc2 = lf_getDescData(l_LANGU, l_LIBNM, is_attr.UIATT);
        }

        //두 언어 다 desc정보를 찾지 못한 경우.
        if((!ls_desc1 && !ls_desc2) || (ls_desc1?.DESCR === "" && ls_desc2?.DESCR === "")){
            //A35  Description
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", 
                oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", ""), "", "", ""));
            return;
        }


        //description 팝업.
        var oPop = new sap.m.ResponsivePopover({placement:"Auto", 
            contentWidth:"50%", verticalScrolling:false});

        //팝업 호출 이후 팝업에 focus 처리.
        oPop.attachAfterOpen(function(){
            oPop.focus();
        });

        oPop.attachBeforeOpen(function(){
            //팝업의 바인딩 정보 구성.
            lf_setBindData(oModel, is_attr, ls_desc1, ls_desc2);
        });


        var oModel = new sap.ui.model.json.JSONModel();
        oPop.setModel(oModel);

        var oTool0 = new sap.m.Toolbar();
        oPop.setCustomHeader(oTool0);

        //TOOLBAR TITLE 표현 UI(properties > text(string) 형식으로 표현되는 title)
        var oBread = new sap.m.Breadcrumbs({separatorStyle:"GreaterThan", currentLocationText:"{/TITLE2}"});
        oTool0.addContent(oBread);
        oBread.addLink(new sap.m.Link({text:"{/TITLE1}"}));

        oTool0.addContent(new sap.m.ToolbarSpacer());

        //A39	Close
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "");

        //우상단 닫기버튼.
        var oBtn0 = new sap.m.Button({icon:"sap-icon://decline", type:"Reject", tooltip: l_txt});
        oTool0.addContent(oBtn0);

        //닫기 버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //팝업 종료 처리.
            oPop.close();
            oPop.destroy();

        }); //닫기 버튼 선택 이벤트.

        var oHBox2 = new sap.m.HBox({width:"100%", renderType:"Bare"});
        oPop.addContent(oHBox2);
        
        var oTArea1 = new sap.m.TextArea({editable:false, width:"100%", 
            growing:true, value:"{/LDESCR}", visible:"{/LVSIBL}"});
        oTArea1.addStyleClass("sapUiSmallMargin");
        oHBox2.addItem(oTArea1);
    

        var oTArea2 = new sap.m.TextArea({editable:false, width:"100%", 
            growing:true, value:"{/RDESCR}", visible:"{/RVSIBL}"});
        oTArea2.addStyleClass("sapUiSmallMargin");
        oHBox2.addItem(oTArea2);

        //팝업 호출.
        oPop.openBy(oUi);

    };  //attribute 설명글 팝업 호출.



    //ATTR DESC JSON 정보에서 대상 DESC 검색.
    function lf_getDescData(i_lang, LIBNM, UIATT){
        
        //desc 파일 path 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "json", "ATTR_DESC", i_lang, "UI5_UI_DESCR.json");
        
        //해당 파일이 존재하지 않는다면 exit.
        if(parent.FS.existsSync(l_path) !== true){
            return;
        }

        //파일 정보 얻기.
        var l_json = parent.require(l_path);
        if(!l_json){return;}

        //대상 DESC 검색.
        return l_json.find( a=> a.LIBNM === LIBNM && a.UIATT === UIATT );

    } //ATTR DESC JSON 정보에서 대상 DESC 검색.



    //팝업의 바인딩 정보 구성.
    function lf_setBindData(oModel, is_attr, is_desc1, is_desc2){

        var ls_desc = {LDESCR:"", RDESCR:"", LVSIBL:false, RVSIBL:false, 
            UIATT:"", UIADT:"", TITLE1:"", TITLE2:""};

        //좌측 원어 desc정보가 존재하는경우.
        if(is_desc1 && is_desc1.DESCR !== ""){
            ls_desc.LDESCR = is_desc1.DESCR;
            ls_desc.LVSIBL = true;
        }

        //우측 번역 desc정보가 존재하는경우.
        if(is_desc2 && is_desc2.DESCR !== ""){
            ls_desc.RDESCR = is_desc2.DESCR;
            ls_desc.RVSIBL = true;
        }

        //TOOLBAR TITLE(properties, aggregations, events, associations)
        ls_desc.TITLE1 = oAPP.fn.attrUIATYDesc(is_attr.UIATY);

        ls_desc.TITLE2 = is_attr.UIATT;

        //attribute의 type이 존재하는경우.
        if(is_attr.UIADT !== ""){
            //A51	Type
            ls_desc.TITLE2 = ls_desc.TITLE2 + " (" +
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A51", "", "", "", "") +
             " : " + is_attr.UIADT + ")";
        }

        oModel.setData(ls_desc);

    } //팝업의 바인딩 정보 구성.



    //라이브러리명 검색.
    function lf_getLibraryName(is_attr){

        //ROOT는 ROOT의 OBJECT ID를 RETURN 처리함.
        if(is_attr.OBJID === "ROOT"){
            return is_attr.OBJID;
        }

        var l_UIATK = is_attr.UIATK;
        var l_UIATY = is_attr.UIATY;
        var l_UIOBK = is_attr.UIOBK;

        //직접 입력이 가능한 AGGREGATION인경우.
        if(l_UIATK.indexOf("_1") !== -1 ){
            //UIATK 구분자 제거.
            l_UIATK = l_UIATK.replace("_1", "");
            l_UIATY = "3";
        }

        //선택 ATTR의 DB정보 검색.
        var ls_0023 = oAPP.DATA.LIB.T_0023.find( a => a.UIATK === l_UIATK );

        //ATTR 정보를 찾지 못한 경우.
        if(!ls_0023){return;}

        //Embedded Aggregations인경우.
        if(is_attr.UIATY === "6"){
            //Aggregations으로 변경.
            l_UIATY = "3";
            //Aggregations의 UI OBJECT KEY로 변경.
            l_UIOBK = ls_0023.UIOBK;
        }
        
        //styleClass EXTENSION PROPERTY 인경우.
        if(ls_0023.UIASN === "STYLECLASS" && ls_0023.ISEXT === "X"){
            return "sap.ui.core.Control";
        }

        //dragAble EXTENSION PROPERTY 인경우.
        if(ls_0023.UIASN === "DRAGABLE" && ls_0023.ISEXT === "X"){
            return "sap.m.NavContainer";
        }

        //dropAble EXTENSION PROPERTY 인경우.
        if(ls_0023.UIASN === "DROPABLE" && ls_0023.ISEXT === "X"){
            return "sap.m.NavContainer";
        }

        //DnDDrop EXTENSION PROPERTY 인경우.
        if(ls_0023.UIASN === "DNDDROP" && ls_0023.ISEXT === "X"){
            return "sap.m.NavContainer";
        }

        //현재 UI정보 검색.
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === l_UIOBK );
        
        //현재 UI정보가 DB에 존재하지 않는경우 EXIT.
        if(!ls_0022){return;}

        //ATTR 정보가 자신UI것인경우(부모로 부터 상속받은 정보가 아닌경우.)
        if(ls_0023.ISINH === ""){
            //자신 UI 라이브러리명 RETURN.
            return ls_0022.LIBNM;
        }
        
        //부모 UI정보를 얻기.
        var lt_parent = oAPP.DATA.LIB.T_0027.filter( a=> a.TGOBJ === l_UIOBK && a.TOBTY === "3" );

        //부모정보를 찾지 못한 경우exit.
        if(lt_parent.length === 0){
            return;
        }       

        //부모 UI를 탐색하며 ATTR의 주인이 누군지 확인.
        for(var i=0, l=lt_parent.length; i<l; i++){

            //ATTR이 자기걸로 존재하는 부모 정보 검색.
            var ls_0023t = oAPP.DATA.LIB.T_0023.find( a => a.UIATT === is_attr.UIATT && 
                a.UIOBK === lt_parent[i].SGOBJ && a.UIATY === l_UIATY && a.ISINH === "" );
            
            //ATTR을 찾은경우 STOP.
            if(ls_0023t){break;}

        }

        //부모에서 해당 attr을 찾지 못한경우 exit.
        if(!ls_0023t){return;}


        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a=> a.UIOBK === ls_0023t.UIOBK );
        if(!ls_0022){return;}

        return ls_0022.LIBNM;

    }   //라이브러리명 검색.

})();