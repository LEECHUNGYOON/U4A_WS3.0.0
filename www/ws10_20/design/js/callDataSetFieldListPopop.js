/* ================================================================= */
// 설치 npm 
// npm install mime-types
/* ================================================================= */


/* ================================================================= */
// I/F 필드 정의 
/* ================================================================= */
/*

*/
/* ================================================================= */


/* ================================================================= */
// 사용 예시 
// var ret = require(oAPP.path.join(__dirname, 'js/DataSet.js'));
//     ret.send(p1);
//                     
/* ================================================================= */


/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */


var sap = global[0].sap;

var oAPP = global[0].oAPP;

//dataset의 view(table)명을 입력한 경우 입력 tab에 해당하는 검색조건 리스트 출력.
async function lf_chkdataset(is_dataSet){

    return new Promise((resolve, reject) => {
        
        // VIEW(TABLE)명이 입력되지 않은경우 EXIT.
        if(!is_dataSet || !is_dataSet.TABNM || is_dataSet.TABNM === ""){
            resolve({RETCD:"E"});
            return;
        }

        //서버에서 호출전 화면 잠금 처리.
        sap.ui.getCore().lock();

        //busy dialog open.
        oAPP.common.fnSetBusyDialog(true);

        //VIEW(TABLE)명 서버전송 데이터 구성.
        var oFormData = new FormData();
        oFormData.append("TABNM", is_dataSet.TABNM);
        
        var l_TABTY = "";

        switch (true) {
            case is_dataSet.RB01:
                //DATABASE VIEW를 선택한 경우.
                l_TABTY = "V";
                break;
            
            case is_dataSet.RB02:
                //TRASNPARENT TABLE을 선택한 경우.
                l_TABTY = "T";
                break;
        
            default:
                break;
        }

        oFormData.append("TABTY", l_TABTY);

        //application 생성을 위한 서버 호출.
        global[0].sendAjax(parent.getServerPath() + "/getDataSetSearchList", oFormData, function(ret){

            //서버에서 클라이언트 도착 후 화면 잠금 해제 처리.
            sap.ui.getCore().unlock();

            //busy dialog close.
            oAPP.common.fnSetBusyDialog(false);

            //wait off 처리.
            parent.setBusy("");
            
            //async function 결과 return.
            resolve(ret);


        }); //application 생성을 위한 서버 호출.


    });

}  //dataset의 view(table)명을 입력한 경우 입력 tab에 해당하는 검색조건 리스트 출력.



//DATASET의 VIEW(TABLE)명에 해당하는 검색조건 필드 선택 팝업.
exports.callDataSetFieldListPopop = async function(is_dataSet, oAPP){
    
    return new Promise( async(resolve, reject) => {

        //입력 TABLE명에 해당하는 필드정보 얻기.
        var ls_ret = await lf_chkdataset(is_dataSet);

        //필드정보를 얻지 못한 경우 EXIT.
        if(ls_ret.RETCD === "E"){
            //async function 결과 return.
            resolve(ls_ret);
            return;
        }

        sap.ui.getCore().loadLibrary("sap.m");
        sap.ui.getCore().loadLibrary("sap.ui.table");

        //검색조건 필드 선택 리스트 팝업.
        var oDlg = new sap.m.Dialog({resizable:true, draggable:true, 
            contentWidth:"40%", contentHeight:"50%", escapeHandler:function(){}});
        oDlg.addStyleClass("sapUiSizeCompact");

        var oModel = new sap.ui.model.json.JSONModel();
        oDlg.setModel(oModel);

        //팝업 상단 툴바.
        var oTool = new sap.m.Toolbar();
        oDlg.setCustomHeader(oTool);

        //B30  Choose Search Field
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B30", "", "", "", "");

        //검색조건 컬럼 radio 선택건에 따른 title 추가.
        switch(is_dataSet.SCCNT){
            case 0:
                //E12	One Column
                l_txt = l_txt + " - " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E12", "", "", "", "");
                break;
            case 1:
                //E13	Two Columns
                l_txt = l_txt + " - " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E13", "", "", "", "");
                break;
            case 2:
                //E14	Three Columns
                l_txt = l_txt + " - " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E14", "", "", "", "");;
                break;
            case 3:
                //E15	Four Columns
                l_txt = l_txt + " - " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E15", "", "", "", "");
                break;
        }

        //팝업 상단 타이틀.
        var oTitle = new sap.m.Title({text:l_txt, tooltip:l_txt});
        oTitle.addStyleClass("sapUiTinyMarginBegin");
        oTool.addContent(oTitle);

        oTool.addContent(new sap.m.ToolbarSpacer());

        //A39  Close
        //팝업 상단 닫기버튼.
        var oBtn0 = new sap.m.Button({type:"Reject", icon:"sap-icon://decline", 
            tooltip:oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A39", "", "", "", "")});
        oTool.addContent(oBtn0);

        //팝업 상단 닫기버튼 선택 이벤트.
        oBtn0.attachPress(function(){
            //팝업 종료 처리.
            lf_close(oDlg);

            //001	Cancel operation
            resolve({RETCD:"C", RTMSG:oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", "")});

        }); //팝업 상단 닫기버튼 선택 이벤트.


        //A40  Confirm
        //확인버튼.
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A40", "", "", "", "");
        var oBtn1 = new sap.m.Button({type:"Accept", icon:"sap-icon://accept", text:l_txt, tooltip:l_txt});
        oDlg.addButton(oBtn1);

        //확인버튼 선택 이벤트.
        oBtn1.attachPress(function(){

            //리스트 입력건 점검.
            if(lf_chkList(oModel) === true){return;}

            //팝업 종료 처리.
            lf_close(oDlg, true);
            
            //검색조건으로 사용할 필드 리스트를 return 처리.
            resolve({RETCD:"S", TDESC:ls_ret.TDESC, FLIST: lf_getSelectedList(oModel)});


        }); //확인버튼 선택 이벤트.
        

        //A41  Cancel
        //취소버튼.
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A41", "", "", "", "");
        var oBtn2 = new sap.m.Button({type:"Reject", icon:"sap-icon://decline", text:l_txt, tooltip:l_txt});
        oDlg.addButton(oBtn2);

        //취소버튼버튼 선택 이벤트.
        oBtn2.attachPress(function(){
            //팝업 종료 처리.
            lf_close(oDlg);

            //001	Cancel operation
            resolve({RETCD:"C", RTMSG:oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", "")});

        }); //취소버튼 선택 이벤트.

        
        var oPage = new sap.m.Page({showHeader:false});
        oDlg.addContent(oPage);

        var oVbox = new sap.m.VBox({height:"100%", width:"100%", renderType:"Bare"});
        oPage.addContent(oVbox);


        //검색조건 리스트 table.
        var oTab = new sap.ui.table.Table({selectionMode:"None", visibleRowCountMode:"Auto",
            layoutData: new sap.m.FlexItemData({growFactor:1})});
        oVbox.addItem(oTab);

        oTab.addStyleClass("sapUiTinyMarginBeginEnd");

        //테이블 toolbar.
        var oTool1 = new sap.m.Toolbar();
        oTab.setToolbar(oTool1);


        //B33  Select All
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B33", "", "", "", "");

        //전체선택 버튼.
        var oBtn3 = new sap.m.Button({type:"Emphasized", icon:"sap-icon://multiselect-all", text:l_txt, tooltip:l_txt});
        oTool1.addContent(oBtn3);

        //전체선택 버튼 이벤트.
        oBtn3.attachPress(function(){
            //table 전체 선택 처리.
            lf_selectionAll(oModel, oTab, true);

            //token update 처리.
            lf_tokenUpdate(oModel);

        }); //전체선택 버튼 이벤트.


        //B23  Clear selection
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B23", "", "", "", "");

        //전체선택 해제 버튼.
        var oBtn4 = new sap.m.Button({type:"Emphasized", icon:"sap-icon://multiselect-none", text:l_txt, tooltip:l_txt});
        oTool1.addContent(oBtn4);

        //전체선택 해제 버튼 이벤트.
        oBtn4.attachPress(function(){
            //전체 선택 해제 처리.
            lf_selectionAll(oModel, oTab, false);

            //token update 처리.
            lf_tokenUpdate(oModel);

        }); //전체선택 해제 버튼 이벤트.


        oTool1.addContent(new sap.m.ToolbarSeparator());

        //라인 선택건 표현 TEXT.
        oTool1.addContent(new sap.m.Title({text:"{/SEL_CNT}"}));

        oTool1.addContent(new sap.m.ToolbarSpacer());
        
        //전체 라인수 표현 TEXT.
        oTool1.addContent(new sap.m.Label({design:"Bold", text:"{/TOT_CNT}"}).addStyleClass("sapUiTinyMarginEnd"));


        //체크박스 컬럼.
        var oCol1 = new sap.ui.table.Column({width:"60px", hAlign:"Center"});
        oTab.addColumn(oCol1);

        //라인별 선택 CHECKBOX.
        var oChk1 = new sap.m.CheckBox({selected:"{SEL}", enabled:"{ENAB_SEL}"});
        oCol1.setTemplate(oChk1);

        //체크박스 선택 이벤트.
        oChk1.attachSelect(function(oEvent){

            //체크박스 선택에 따른 표현 처리.
            lf_setHighlightLine(this, oModel);

            //체크박스 선택건 카운팅.
            lf_checkboxSelectedCount(oModel);

            //token update 처리.
            lf_tokenUpdate(oModel);

        }); //체크박스 선택 이벤트.


        //D68  Field Name
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D68", "", "", "", "");

        //필드명 컬럼.
        var oCol2 = new sap.ui.table.Column({
            label:new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt}),
            template:new sap.m.Text({text:"{FLDNM}", tooltip:"{FLDNM}"}),
            sortProperty:"FLDNM", filterProperty:"FLDNM"
        });
        oTab.addColumn(oCol2);

        //E16  Key Field
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E16", "", "", "", "");

        //key 여부 컬럼.
        var oCol3 = new sap.ui.table.Column({
            width:"80px", hAlign:"Center",
            label:new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt}),
            template:new sap.m.CheckBox({selected:"{isKey}", enabled:false})
        });
        oTab.addColumn(oCol3);

        //A35  Description
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", "");

        //필드내역 컬럼.
        var oCol4 = new sap.ui.table.Column({
            label:new sap.m.Label({design:"Bold", text:l_txt, tooltip:l_txt}),
            template:new sap.m.Text({text:"{FLDTX}", tooltip:"{FLDTT}"}),
            sortProperty:"FLDTX", filterProperty:"FLDTX"
        });
        oTab.addColumn(oCol4);

        //필드 리스트 테이블 바인딩 처리.
        oTab.bindAggregation("rows", {path:"/T_LIST", template:new sap.ui.table.Row()});

        //row 선택에 관련된 표현을 위한 UI 추가.
        oTab.setRowSettingsTemplate(new sap.ui.table.RowSettings({highlight:"{highlight}"}));


        //필드 선택건 표시 token.
        var oHbox = new sap.m.HBox({wrap:"Wrap"});
        oVbox.addItem(oHbox);

        oHbox.addStyleClass("sapUiTinyMarginBegin");

        var oToken = new sap.m.Token({key:"{KEY}", text:"{TEXT}"});
        oToken.addStyleClass("sapUiTinyMarginEnd");

        //token 삭제 이벤트.
        oToken.attachDelete(function(oEvent){
            //token 삭제 및 체크박스 해제 처리.
            lf_delToken(this, oModel);

            //체크박스 선택건 카운팅.
            lf_checkboxSelectedCount(oModel);

        }); //token 삭제 이벤트.


        //필드 선택건 표시 token 바인딩 처리.
        oHbox.bindAggregation("items", {path:"/T_TOKEN", template:oToken});

        //model data 구성.
        oModel.setData({T_LIST:lf_setBindList(ls_ret.T_LIST)});

        //체크박스 선택건 카운팅.
        lf_checkboxSelectedCount(oModel);

        //필드 검색건수 카운팅.
        lf_setTotalCount(oModel);

        //팝업 호출.
        oDlg.open();


    });


};  //DATASET의 VIEW(TABLE)명에 해당하는 검색조건 필드 선택 팝업.



//리스트 입력건 점검.
function lf_chkList(oModel){

    var lt_list = oModel.getProperty("/T_LIST");
    if(!lt_list || lt_list.length === 0){
        //227  Result not found.
        parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "227", "", "", "", ""));
        return true;
    }

    //선택 라인정보 얻기.
    var lt_filt = lt_list.filter( a=> a.SEL === true );

    //체크박스 선택건이 존재하지 않는경우.
    if(lt_filt.length === 0){
        //268  Selected line does not exists.
        parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", ""));
        return true;
    }

    //체크박스 선택건이 30건을 초과하는 경우.
    if(lt_filt.length > 30 ){
        //300	Choose no more than 30 entries
        parent.showMessage(sap, 20, "E", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "300", "", "", "", ""));
        return true;
    }

}   //리스트 입력건 점검.



//필드 리스트 바인딩정보 구성.
function lf_setBindList(T_LIST){

    if(!T_LIST || T_LIST.length === 0){return [];}

    var lt_list=[], ls_list = {};

    for(var i=0, l=T_LIST.length; i<l; i++){

        //VIEW(TABLE)명.
        ls_list.TABNM = T_LIST[i].TABNM;

        //필드명.
        ls_list.FLDNM = T_LIST[i].FLDNM;

        //필드 내역.
        ls_list.FLDTX = T_LIST[i].FLDTX;

        //필드 내역 tooltip.
        ls_list.FLDTT = T_LIST[i].FLDTT;

        //default keyfield 여부 false.
        ls_list.isKey = false;

        //KEY FIELD인경우.
        if(T_LIST[i].ISKEY === "X"){
            ls_list.isKey = true;
        }

        //default checkbox 선택 가능 처리.
        ls_list.ENAB_SEL = true;

        //default 선택 해제 처리.
        ls_list.SEL = false;

        //checkbox 선택 불가능건인경우.
        if(T_LIST[i].ENAB01 === ""){
            //checkbox 선택 불가 처리.
            ls_list.ENAB_SEL = false;

        }

        //체크박스 선택 가능 여부 표현.
        ls_list.highlight = lf_setHighlight(ls_list);

        lt_list.push(ls_list);
        ls_list = {};

    }

    //결과리스트 return.
    return lt_list;

}   //필드 리스트 바인딩정보 구성.



//checkbox 전체선택 처리.
function lf_selectionAll(oModel, oTab, bSel){

    var l_bind = oTab.getBinding();
    if(!l_bind){return;}

    var lt_ctxt = l_bind.getAllCurrentContexts();

    if(lt_ctxt.length === 0){return;}

    for(var i=0, l=lt_ctxt.length; i<l; i++){

        //체크박스 선택 불가능건은 SKIP.
        if(lt_ctxt[i].getProperty("ENAB_SEL") === false){continue;}

        var ls_list = lt_ctxt[i].getProperty();

        ls_list.SEL = bSel;

        //체크박스 선택 표현 처리.
        ls_list.highlight = lf_setHighlight(ls_list);

        //라인 선택 처리.
        oModel.setProperty("", ls_list, lt_ctxt[i]);

    }

    //체크박스 선택건 카운팅.
    lf_checkboxSelectedCount(oModel);


}   //checkbox 전체선택 처리.



//checkbox 선택건의 필드 정보 얻기.
function lf_getSelectedList(oModel){

    var lt_list = oModel.getProperty("/T_LIST");
    
    if(!lt_list || lt_list.length === 0){return;}

    var lt_fld = [];

    for(var i=0, l= lt_list.length; i<l; i++){

        //checkbox 선택 안된건은 수집 skip.
        if(lt_list[i].SEL !== true){continue;}

        //checkbox 선택건의 필드정보 수집.
        lt_fld.push(lt_list[i].FLDNM);

    }

    //수집한 필드정보 return.
    return lt_fld.join("|");


}   //checkbox 선택건의 필드 정보 얻기.



//팝업 종료 처리.
function lf_close(oDialog, bSkipMsg){

    if(!oDialog){return;}

    //dialog 종료 처리.
    oDialog.close();

    //메시지 skip 처리건인경우 exit.
    if(bSkipMsg){return;}
    
    //001  Cancel operation
    //메시지 출력.
    parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "001", "", "", "", ""));

}   //팝업 종료 처리.



//체크박스 선택건 카운팅.
function lf_checkboxSelectedCount(oModel){

    var lt_list = oModel.getProperty("/T_LIST");

    var lt_selected = lt_list.filter( a => a.SEL === true);

    //E08  Selected lines
    var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E08", "", "", "", "");
    
    oModel.setProperty("/SEL_CNT", l_txt + " : " + lt_selected.length);

}   //체크박스 선택건 카운팅.



//필드명 선택건 token 업데이트.
function lf_tokenUpdate(oModel){

    var lt_list = oModel.getProperty("/T_LIST");

    var lt_token = [];

    for(var i=0, l=lt_list.length; i<l; i++){
        //선택되지 않은건은 수집 SKIP.
        if(lt_list[i].SEL === false){continue;}
    
        //선택건 수집처리.
        lt_token.push({KEY:lt_list[i].FLDNM, TEXT:lt_list[i].FLDNM});

    }

    oModel.setProperty("/T_TOKEN", lt_token);

}   //필드명 선택건 token 업데이트.



//token 삭제 이벤트.
function lf_delToken(oUi, oModel){

    //이벤트 발생 라인 정보 얻기.
    var l_ctxt = oUi.getBindingContext();
    if(!l_ctxt){return;}

    //이벤트 발생 라인의 KEY얻기.
    var l_key = l_ctxt.getProperty("KEY");
    

    //token에서 삭제 대상 라인 index 얻기.
    var l_indx = oModel.oData.T_TOKEN.findIndex( a=> a.KEY === l_key );

    //삭제 대상 라인을 찾은경우 해당 라인 삭제 처리.
    if(l_indx !== -1){
        oModel.oData.T_TOKEN.splice(l_indx, 1);
    }

    //필드 리스트에서 KEY에 해당하는 라인 정보 얻기.
    var ls_list = oModel.oData.T_LIST.find( a=> a.FLDNM === l_key );
    
    if(ls_list){
        //대상 라인 선택 해제 처리.
        ls_list.SEL = false;

        //체크박스 선택 표현 처리.
        ls_list.highlight = lf_setHighlight(ls_list);

    }

    //모델 갱신.
    oModel.refresh();

}   //token 삭제 이벤트.



//체크박스 선택에 따른 표현 처리.
function lf_setHighlightLine(oUi, oModel){

    //이벤트 발생 라인 정보 얻기.
    var l_ctxt = oUi.getBindingContext();
    if(!l_ctxt){return;}

    //라인 정보얻기.
    var ls_list = l_ctxt.getProperty();

    //체크박스 선택에 따른 선택 표현 처리 정보 바인딩.
    oModel.setProperty("highlight", lf_setHighlight(ls_list), l_ctxt);

}   //체크박스 선택에 따른 표현 처리.



//체크박스 선택 표현 정보 구성.
function lf_setHighlight(is_line){

    //선택불가능건인경우.
    if(is_line.ENAB_SEL === false){
        return "Warning";
    }

    //선택된경우.
    if(is_line.SEL === true){
        return "Success";
    }

    //default 선택 가능 표현.
    return "Information";

}   //체크박스 선택 표현 정보 구성.



//필드 검색건수 카운팅.
function lf_setTotalCount(oModel){
    
    if(!oModel.oData || !oModel.oData.T_LIST || typeof oModel.oData.T_LIST.length === "undefined"){return;}

    //결과리스트 라인수.
    var l_len = oModel.oData.T_LIST.length;

    //D94  Results    
    var l_txt1 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D94", "", "", "", "");

    //D90  Rows
    var l_txt2 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D90", "", "", "", "");

    //결과리스트 총 필드수 매핑(Results : 100 Rows)
    oModel.setProperty("/TOT_CNT", l_txt1 + " : " + l_len + " " + l_txt2);    

}   //필드 검색건수 카운팅.