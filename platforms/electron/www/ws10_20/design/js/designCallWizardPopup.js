(function(){
    /************************************************************************
     * 위자드 팝업 호출 버튼 이벤트.
     * **********************************************************************
     ************************************************************************/
    oAPP.fn.designCallWizardPopup = function(){

        //선택값에 대한 가능여부 점검.
        var ls_ret = oAPP.fn.designChkSelLine();

        //오류가 발생한 경우 오류 메시지 출력 후 EXIT.
        if(ls_ret.SUBRC === "E"){
            parent.showMessage(sap, 10, "E", ls_ret.MSG);
            return;
        }

        //선택 라인 정보 얻기.
        var l_indx = oAPP.attr.ui.oLTree1.getSelectedIndex();

        //선택한 라인이 존재하지 않는경우 오류 메시지 처리.
        if(l_indx === -1){
            //073 &1 does not exist.
            parent.showMessage(sap, 10, "E", "Selected line does not exist.");
            return;
        }

        //선택 라인의 tree 정보 얻기.
        var ls_tree = oAPP.attr.ui.oLTree1.getContextByIndex(l_indx).getProperty();

        //DOCUMENT를 선택한 경우 오류 메시지 처리.
        if(ls_tree.OBJID === "ROOT"){
            //056	& is not the target location.
            parent.showMessage(sap, 10, "E", "DOCUMENT is not the target location.");
            return;
        }


        //application명 서버전송 데이터 구성.
        var oFormData = new FormData();
        oFormData.append("ACTCD", "WZD_CHKER");

        //UI OBJECT KEY.
        oFormData.append("UIOBK", ls_tree.UIOBK);

        //UI OBJECT ID.
        oFormData.append("UIOBJ", ls_tree.OBJID);

        //CONTROLLER CLASS NAME.
        oFormData.append("CLSID", oAPP.attr.appInfo.CLSID);

        //서버 호출.
        sendAjax(oAPP.attr.servNm + "/ui_temp_wzd", oFormData, function(param){
            //WIZARD 데이터구성에 실패한 경우.
            if(param.RETCD === "E"){
                //오류에 대한 메시지 처리.
                parent.showMessage(sap, 10, "E", param.RTMSG);
                return;
            }
            
            //성공이 아닌경우 exit.
            if(param.RETCD !== "S"){
                return;
            }
            
            //template wizard 팝업 호출.
            oAPP.fn.fnUiTempWizardPopupOpener(param);

        });

    };  //위자드 팝업 호출.




    /************************************************************************
     * 위자드 팝업 callback 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {function} fnCallback - callback function.
     ************************************************************************/
    oAPP.fn.designWizardCallback = function(oReturn, fnCallback){

        //aggregation 선택 팝업 callback function.
        function lf_aggrCallback(aggr){

            //busy dialog open.
            oAPP.common.fnSetBusyDialog(true);

            //wizard 생성 유형에 따른 분기.
            switch (oReturn.uName) {
                case "sap.m.Table":
                    //wizard m table 생성 처리.
                    oAPP.fn.designWizardMTable(oReturn, aggr);
                    break;
                
                case "sap.ui.table.Table":
                    //wizard ui table 생성 처리.
                    oAPP.fn.designWizardUiTable(oReturn, aggr);
                    break;

                case "sap.ui.table.TreeTable":
                    //wizard ui tree table 생성 처리.
                    oAPP.fn.designWizardUiTreeTable(oReturn, aggr);
                    break;

                case "LayoForm_01":
                    //wizard form UI 생성 처리.
                    oAPP.fn.designWizardUiLayotForm01(oReturn, aggr);
                    break;

                case "SimpleForm":
                    //wizard simple form 생성 처리.
                    oAPP.fn.designWizardUiLayotSimpleForm(oReturn, aggr);
                    break;

                default:
                    break;

            }   //wizard 생성 유형에 따른 분기.


            //성공 FLAG 처리.
            ls_ret.SUBRC = "S";
            ls_ret.MSG = "UI 생성처리 성공";

            //WIZARD 팝업의 CALLBACK FUNCTION.
            fnCallback(ls_ret);


        }   //aggregation 선택 팝업 callback function.



        //선택값에 대한 가능여부 점검.
        var ls_ret = oAPP.fn.designChkSelLine(oReturn.uName);

        //선택건 점검 오류가 발생한 경우 오류 FLAG, 메시지 RETURN 후 EXIT.
        if(ls_ret.SUBRC === "E"){
            fnCallback(ls_ret);
            return;
        }
        
        var ls_0014 = oAPP.fn.crtStru0014();

        //wizard 생성 유형에 따른 분기.
        switch (oReturn.uName) {
            case "sap.m.Table":
                //sap.m.Table의 UI OBJECT KEY 매핑.
                ls_0014.UIOBK = "UO00447";
                break;
            
            case "sap.ui.table.Table":
                //sap.ui.table.Table의 UI OBJECT KEY 매핑.
                ls_0014.UIOBK = "UO01139";
                break;

            case "sap.ui.table.TreeTable":
                //sap.ui.table.TreeTable의 UI OBJECT KEY 매핑.
                ls_0014.UIOBK = "UO01142";
                break;

            case "LayoForm_01":
                //sap.ui.layout.form.Form의 UI OBJECT KEY 매핑.
                ls_0014.UIOBK = "UO01001";
                break;

            case "SimpleForm":
                //sap.ui.layout.form.SimpleForm의 UI OBJECT KEY 매핑.
                ls_0014.UIOBK = "UO01010";
                break;

            default:
                break;

        }   //wizard 생성 유형에 따른 분기.
        
        //선택한 라인의 tree 정보 얻기.
        var ls_tree = oAPP.fn.designGetSelectedTreeItem();
        
        //WIZARD 정상 수행 FLAG 처리.
        ls_ret.SUBRC = "S";

        //AGGREGATION 선택 팝업 호출 처리.
        if(typeof oAPP.fn.aggrSelectPopup !== "undefined"){
            oAPP.fn.aggrSelectPopup(ls_0014, ls_tree, lf_aggrCallback);
            return;

        }
    
        oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
            oAPP.fn.aggrSelectPopup(ls_0014, ls_tree, lf_aggrCallback);

        });

        

    };  //위자드 팝업 callback 처리.




    /************************************************************************
     * UI 라인정보 생성.
     * **********************************************************************
     * @param {object} is_parent - design tree의 부모 정보
     * @param {string} UIOBK - 생성 UI OBJECT KEY.
     * @param {string} UIATK - 부모에 추가될 Aggregation attribute key
     * @param {Array} T_0015 - 생성할 UI에 추가할 attribute 정보.
     ************************************************************************/
    oAPP.fn.createUiLine = function(is_parent, UIOBK, UIATK, T_0015){

        //SAP.M.TABLE 라인 추가를 위한 라인 정보 생성.
        var l_14 = oAPP.fn.crtStru0014();

        //DESIGN TREE 바인딩 필드 생성 처리.
        oAPP.fn.crtTreeBindField(l_14);

        //SAP.M.TABLE의 LIBRARY 정보 검색.
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === UIOBK );
        
        //embed aggregation 정보 검색.
        var ls_aggr = oAPP.DATA.LIB.T_0023.find( a=> a.UIATK === UIATK );
        

        l_14.APPID = oAPP.attr.appInfo.APPID;
        l_14.GUINR = oAPP.attr.appInfo.GUINR;

        //UI명 구성.
        l_14.OBJID = oAPP.fn.setOBJID(ls_0022.UIOBJ);
        l_14.POBID = is_parent.OBJID;
        l_14.UIOBK = ls_0022.UIOBK;
        l_14.PUIOK = is_parent.UIOBK;

        l_14.UIATK = ls_aggr.UIATK;
        l_14.UIATT = ls_aggr.UIATT;
        l_14.UIASN = ls_aggr.UIASN;
        l_14.UIATY = ls_aggr.UIATY;
        l_14.UIADT = ls_aggr.UIADT;
        l_14.UIADS = ls_aggr.UIADS;
        l_14.ISMLB = ls_aggr.ISMLB;

        l_14.UIFND = ls_0022.UIFND;
        l_14.PUIATK = ls_aggr.UIATK;
        l_14.UILIB = ls_0022.LIBNM;
        l_14.ISEXT = ls_0022.ISEXT;
        l_14.TGLIB = ls_0022.TGLIB;
        l_14.LIBNM = ls_0022.LIBNM;

        //UI ICON 구성.
        l_14.UICON = oAPP.fn.fnGetSapIconPath(ls_0022.UICON);

        //default 아이콘 비활성 처리.
        l_14.icon_visible = false;

        //아이콘이 존재하는 경우 아이콘 활성 처리.
        if(typeof l_14.UICON !== "undefined" && l_14.UICON !== ""){
            l_14.icon_visible = true;
        }


        //부모에 현재 UI 추가 처리.
        is_parent.zTREE.push(l_14);

        var ls_0015 = oAPP.fn.crtStru0015();
        
        var lt_0015 = T_0015 || [];
                
        //embed aggregation 정보 구성.
        ls_0015.APPID = oAPP.attr.appInfo.APPID;
        ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
        ls_0015.OBJID = l_14.OBJID;
        ls_0015.UIOBK = l_14.UIOBK;
        ls_0015.UIATK = ls_aggr.UIATK;
        ls_0015.UILIK = ls_0022.UILIK;
        ls_0015.UIATT = ls_aggr.UIATT;
        ls_0015.UIASN = ls_aggr.UIASN;
        ls_0015.UIADT = ls_aggr.UIADT;
        ls_0015.UIATY = "6";
        ls_0015.ISMLB = ls_aggr.ISMLB;
        ls_0015.ISEMB = "X";
        lt_0015.push(ls_0015);

        //attribute 파라메터 구성건이 존재하는경우.
        if(typeof T_0015 !== "undefined"){
            for(var i=0, l=lt_0015.length; i<l; i++){
                //새로 생성한 OBJID 정보 매핑.
                lt_0015[i].OBJID = l_14.OBJID;
                lt_0015[i].UILIK = ls_0022.UILIK;
            }
        }
        

        //미리보기 UI 추가
        oAPP.attr.ui.frame.contentWindow.addUIObjPreView(l_14.OBJID, l_14.UIOBK, l_14.UILIB, 
            l_14.UIFND, l_14.POBID, l_14.PUIOK, l_14.UIATT, lt_0015);
        

        return l_14;

    };  //UI 라인정보 생성.




    /************************************************************************
     * UI attribute 정보 생성.
     * **********************************************************************
     * @param {string} UIATK - 생성할 attribute key
     * @param {string} UIATV - attribute에 입력할 값.
     * @param {string} ISBND - 바인딩 처리여부
     ************************************************************************/
    oAPP.fn.setUiAttr = function(UIATK, UIATV, ISBND){

        var ls_0015 = oAPP.fn.crtStru0015();

        //sap.m.Label의 text property 정보 검색.
        var ls_0023 = oAPP.DATA.LIB.T_0023.find( a=> a.UIATK === UIATK );

        oAPP.fn.moveCorresponding(ls_0023, ls_0015);

        ls_0015.APPID = oAPP.attr.appInfo.APPID;
        ls_0015.GUINR = oAPP.attr.appInfo.GUINR;
        ls_0015.UIATV = UIATV;
        ls_0015.ISBND = ISBND;
        
        return ls_0015;

    };  //UI attribute 정보 생성.




    /************************************************************************
     * wizard sap.m.Table 생성 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {object} aggr - 부모에 추가될 영역의 aggregation 정보.
     ************************************************************************/
    oAPP.fn.designWizardMTable = function(oReturn, aggr){

        //선택한 라인의 tree 정보 얻기.
        var ls_parent = oAPP.fn.designGetSelectedTreeItem();
        

        //sap.m.Table의 items에 바인딩 정보 구성.
        var lt_0015 = [];
        lt_0015.push(oAPP.fn.setUiAttr("AT000005907", oReturn.mName, "X"));

        //sap.m.Table UI 생성.
        var ls_tab = oAPP.fn.createUiLine(ls_parent, "UO00447", aggr.UIATK, lt_0015);

        //sap.m.ColumnListItem UI 생성.
        var ls_item = oAPP.fn.createUiLine(ls_tab, "UO00255", "AT000005907");
        

        //wizard에서 선택한 필드를 기준으로 UI 생성 처리.
        for(var i=0, l=oReturn.selTab.length; i<l; i++){

            //sap.m.Column 생성.
            var ls_col = oAPP.fn.createUiLine(ls_tab, "UO00254", "AT000005885");

            lt_0015 = [];

            //sap.m.Label의 design Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003781", "Bold", ""));

            //sap.m.Label의 text Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003782", oReturn.selTab[i].FTEXT, ""));

            //sap.m.Label 생성.
            oAPP.fn.createUiLine(ls_col, "UO00319", "AT000002813", lt_0015);
            
            
            //생성 처리할 UI 정보 검색.
            var ls_ddlb = oReturn.uiDDLB.find( a => a.VAL1 === oReturn.selTab[i].UITYP );


            //바인딩 필드 정보 구성.
            lt_0015 = [];
            lt_0015.push(oAPP.fn.setUiAttr(ls_ddlb.VAL5, oReturn.mName + "-" + oReturn.selTab[i].FNAME, "X"));

            //sap.m.ColumnListItem UI에 UI 생성 처리.
            oAPP.fn.createUiLine(ls_item, ls_ddlb.VAL2, "AT000002822", lt_0015);
            

        }   //wizard에서 선택한 필드를 기준으로 UI 생성 처리.


        //모델 갱신 처리.
        oAPP.attr.oModel.refresh(true);

        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

        ////신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
        //oAPP.attr.prev[ls_tab.OBJID].__isnew = "X";

        //메뉴 선택 tree 위치 펼침 처리.
        oAPP.fn.setSelectTreeItem(ls_tab.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();

    };  //wizard sap.m.Table 생성 처리.




    /************************************************************************
     * sap.ui.table.Table 생성 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {object} aggr - 부모에 추가될 영역의 aggregation 정보.
     ************************************************************************/
    oAPP.fn.designWizardUiTable = function(oReturn, aggr){

        //선택한 라인의 tree 정보 얻기.
        var ls_parent = oAPP.fn.designGetSelectedTreeItem();

        //sap.ui.table.Table의 rows에 바인딩 정보 구성.
        var lt_0015 = [];
        lt_0015.push(oAPP.fn.setUiAttr("AT000013068", oReturn.mName, "X"));

        //sap.ui.table.Table UI 생성.
        var ls_tab = oAPP.fn.createUiLine(ls_parent, "UO01139", aggr.UIATK, lt_0015);

        //sap.ui.table.Row UI 생성.
        oAPP.fn.createUiLine(ls_tab, "UO01131", "AT000013068");


        //wizard에서 선택한 필드를 기준으로 UI 생성 처리.
        for(var i=0, l=oReturn.selTab.length; i<l; i++){

            //sap.ui.table.Column 생성.
            var ls_col = oAPP.fn.createUiLine(ls_tab, "UO01127", "AT000013067");

            lt_0015 = [];

            //sap.m.Label의 design Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003781", "Bold", ""));

            //sap.m.Label의 text Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003782", oReturn.selTab[i].FTEXT, ""));

            //sap.m.Label 생성.
            oAPP.fn.createUiLine(ls_col, "UO00319", "AT000012976", lt_0015);


            //생성 처리할 UI 정보 검색.
            var ls_ddlb = oReturn.uiDDLB.find( a => a.VAL1 === oReturn.selTab[i].UITYP );


            //바인딩 필드 정보 구성.
            lt_0015 = [];
            lt_0015.push(oAPP.fn.setUiAttr(ls_ddlb.VAL5, oReturn.mName + "-" + oReturn.selTab[i].FNAME, "X"));

            //sap.ui.table.Column UI에 UI 생성 처리.
            oAPP.fn.createUiLine(ls_col, ls_ddlb.VAL2, "AT000012978", lt_0015);


        }   //wizard에서 선택한 필드를 기준으로 UI 생성 처리.

        //모델 갱신 처리.
        oAPP.attr.oModel.refresh(true);

        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

        ////신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
        //oAPP.attr.prev[ls_tab.OBJID].__isnew = "X";

        //메뉴 선택 tree 위치 펼침 처리.
        oAPP.fn.setSelectTreeItem(ls_tab.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();


    };  //sap.ui.table.Table.




    /************************************************************************
     * sap.ui.table.TreeTable 생성 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {object} aggr - 부모에 추가될 영역의 aggregation 정보.
     ************************************************************************/
    oAPP.fn.designWizardUiTreeTable = function(oReturn, aggr){

        //선택한 라인의 tree 정보 얻기.
        var ls_parent = oAPP.fn.designGetSelectedTreeItem();

        //sap.ui.table.Table의 rows에 바인딩 정보 구성.
        var lt_0015 = [];
        lt_0015.push(oAPP.fn.setUiAttr("AT000013146", oReturn.mName, "X"));

        var ls_sel = oReturn.selTab.find( a => a.PARENT === "X" );

        //parent 필드정보 구성.
        lt_0015.push(oAPP.fn.setUiAttr("EXT00001192", oReturn.mName + "-" + ls_sel.FNAME, "X"));

        var ls_sel = oReturn.selTab.find( a => a.CHILD === "X" );

        //child 필드정보 구성.
        lt_0015.push(oAPP.fn.setUiAttr("EXT00001193", oReturn.mName + "-" + ls_sel.FNAME, "X"));

        //sap.ui.table.Table UI 생성.
        var ls_tab = oAPP.fn.createUiLine(ls_parent, "UO01142", aggr.UIATK, lt_0015);

        //sap.ui.table.Row UI 생성.
        oAPP.fn.createUiLine(ls_tab, "UO01131", "AT000013146");


        //wizard에서 선택한 필드를 기준으로 UI 생성 처리.
        for(var i=0, l=oReturn.selTab.length; i<l; i++){

            //sap.ui.table.Column 생성.
            var ls_col = oAPP.fn.createUiLine(ls_tab, "UO01127", "AT000013145");

            lt_0015 = [];

            //sap.m.Label의 design Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003781", "Bold", ""));

            //sap.m.Label의 text Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003782", oReturn.selTab[i].FTEXT, ""));

            //sap.m.Label 생성.
            oAPP.fn.createUiLine(ls_col, "UO00319", "AT000012976", lt_0015);


            //생성 처리할 UI 정보 검색.
            var ls_ddlb = oReturn.uiDDLB.find( a => a.VAL1 === oReturn.selTab[i].UITYP );


            //바인딩 필드 정보 구성.
            lt_0015 = [];
            lt_0015.push(oAPP.fn.setUiAttr(ls_ddlb.VAL5, oReturn.mName + "-" + oReturn.selTab[i].FNAME, "X"));

            //sap.ui.table.Column UI에 UI 생성 처리.
            oAPP.fn.createUiLine(ls_col, ls_ddlb.VAL2, "AT000012978", lt_0015);


        }   //wizard에서 선택한 필드를 기준으로 UI 생성 처리.

        //모델 갱신 처리.
        oAPP.attr.oModel.refresh(true);

        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

        ////신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
        //oAPP.attr.prev[ls_tab.OBJID].__isnew = "X";

        //메뉴 선택 tree 위치 펼침 처리.
        oAPP.fn.setSelectTreeItem(ls_tab.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();


    };  //sap.ui.table.TreeTable.




    /************************************************************************
     * sap.ui.layout.form.Form 생성 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {object} aggr - 부모에 추가될 영역의 aggregation 정보.
     ************************************************************************/
    oAPP.fn.designWizardUiLayotForm01 = function(oReturn, aggr){

        //선택한 라인의 tree 정보 얻기.
        var ls_parent = oAPP.fn.designGetSelectedTreeItem();


        var lt_0015 = [];
        //editable 프로퍼티 true로 구성.
        lt_0015.push(oAPP.fn.setUiAttr("AT000012587", "true", ""));

        //sap.ui.layout.form.Form UI 생성.
        var ls_form = oAPP.fn.createUiLine(ls_parent, "UO01001", aggr.UIATK, lt_0015);

        //sap.ui.layout.form.ResponsiveGridLayout UI 생성.
        oAPP.fn.createUiLine(ls_form, "UO01008", "AT000012591");

        //wizard에서 선택한 필드를 기준으로 UI 생성 처리.
        for(var i=0, l=oReturn.selTab.length; i<l; i++){

            //sap.ui.layout.form.FormContainer UI 생성.
            var ls_cont = oAPP.fn.createUiLine(ls_form, "UO01002", "AT000012588");


            //sap.ui.layout.form.FormElement UI 생성.
            var ls_elem = oAPP.fn.createUiLine(ls_cont, "UO01003", "AT000012607");

            lt_0015 = [];

            //sap.m.Label의 design Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003781", "Bold", ""));

            //sap.m.Label의 text Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003782", oReturn.selTab[i].FTEXT, ""));

            //sap.m.Label 생성.
            oAPP.fn.createUiLine(ls_elem, "UO00319", "AT000012618", lt_0015);

            
            //생성 처리할 UI 정보 검색.
            var ls_ddlb = oReturn.uiDDLB.find( a => a.VAL1 === oReturn.selTab[i].UITYP );

            //바인딩 필드 정보 구성.
            lt_0015 = [];
            lt_0015.push(oAPP.fn.setUiAttr(ls_ddlb.VAL5, oReturn.mName + "-" + oReturn.selTab[i].FNAME, "X"));

            //sap.ui.table.Column UI에 UI 생성 처리.
            oAPP.fn.createUiLine(ls_elem, ls_ddlb.VAL2, "AT000012619", lt_0015);

        }   //wizard에서 선택한 필드를 기준으로 UI 생성 처리.


        //모델 갱신 처리.
        oAPP.attr.oModel.refresh(true);

        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

        ////신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
        //oAPP.attr.prev[ls_tab.OBJID].__isnew = "X";

        //메뉴 선택 tree 위치 펼침 처리.
        oAPP.fn.setSelectTreeItem(ls_form.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();


    };  //sap.ui.layout.form.Form




    /************************************************************************
     * sap.ui.layout.form.SimpleForm 생성 처리.
     * **********************************************************************
     * @param {object} oReturn - wizard 팝업에서 선택한 정보.
     * @param {object} aggr - 부모에 추가될 영역의 aggregation 정보.
     ************************************************************************/
    oAPP.fn.designWizardUiLayotSimpleForm = function(oReturn, aggr){

        //선택한 라인의 tree 정보 얻기.
        var ls_parent = oAPP.fn.designGetSelectedTreeItem();


        var lt_0015 = [];
        //editable 프로퍼티 true로 구성.
        lt_0015.push(oAPP.fn.setUiAttr("AT000012709", "true", ""));

        //sap.ui.layout.form.SimpleForm UI 생성.
        var ls_form = oAPP.fn.createUiLine(ls_parent, "UO01010", aggr.UIATK, lt_0015);


        //wizard에서 선택한 필드를 기준으로 UI 생성 처리.
        for(var i=0, l=oReturn.selTab.length; i<l; i++){

            lt_0015 = [];
            //sap.m.Label의 design Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003781", "Bold", ""));

            //sap.m.Label의 text Property 정보 구성.
            lt_0015.push(oAPP.fn.setUiAttr("AT000003782", oReturn.selTab[i].FTEXT, ""));

            //sap.m.Label 생성.
            oAPP.fn.createUiLine(ls_form, "UO00319", "AT000012729", lt_0015);

            
            //생성 처리할 UI 정보 검색.
            var ls_ddlb = oReturn.uiDDLB.find( a => a.VAL1 === oReturn.selTab[i].UITYP );

            //바인딩 필드 정보 구성.
            lt_0015 = [];
            lt_0015.push(oAPP.fn.setUiAttr(ls_ddlb.VAL5, oReturn.mName + "-" + oReturn.selTab[i].FNAME, "X"));

            //sap.ui.table.Column UI에 UI 생성 처리.
            oAPP.fn.createUiLine(ls_form, ls_ddlb.VAL2, "AT000012729", lt_0015);

        }   //wizard에서 선택한 필드를 기준으로 UI 생성 처리.


        //모델 갱신 처리.
        oAPP.attr.oModel.refresh(true);

        //design tree의 tree binding 정보 갱신 처리.
        var l_bind = oAPP.attr.ui.oLTree1.getBinding();
        l_bind._buildTree(0,oAPP.fn.designGetTreeItemCount());

        ////신규로 생성된 UI의 미리보기에서 UI 선택 처리를 위한 FLAG 처리.
        //oAPP.attr.prev[ls_tab.OBJID].__isnew = "X";

        //메뉴 선택 tree 위치 펼침 처리.
        oAPP.fn.setSelectTreeItem(ls_form.OBJID);

        //변경 FLAG 처리.
        oAPP.fn.setChangeFlag();


    };  //sap.ui.layout.form.SimpleForm

})();