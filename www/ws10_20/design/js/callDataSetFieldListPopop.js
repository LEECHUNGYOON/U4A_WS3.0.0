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
            
            //application 생성중 오류가 발생한 경우.
            if(ret.RETCD === "E"){
                //오류 메시지 출력.
                parent.showMessage(sap, 20, "E", ret.RTMSG);

            }

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

            resolve({RETCD:"E"});

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
            resolve({RETCD:"S", FLIST: lf_getSelectedList(oModel)});


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

            resolve({RETCD:"E"});

        }); //취소버튼 선택 이벤트.

        
        var oPage = new sap.m.Page({showHeader:false});
        oDlg.addContent(oPage);


        //검색조건 리스트 table.
        var oTab = new sap.ui.table.Table({selectionMode:"None", visibleRowCountMode:"Auto"});
        oPage.addContent(oTab);

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
            lf_selectionAll(oModel);

        }); //전체선택 버튼 이벤트.


        //B23  Clear selection
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B23", "", "", "", "");

        //전체선택 해제 버튼.
        var oBtn4 = new sap.m.Button({type:"Emphasized", icon:"sap-icon://multiselect-none", text:l_txt, tooltip:l_txt});
        oTool1.addContent(oBtn4);

        //전체선택 해제 버튼 이벤트.
        oBtn4.attachPress(function(){
            lf_clearSelection(oModel);

        }); //전체선택 해제 버튼 이벤트.


        //체크박스 컬럼.
        var oCol1 = new sap.ui.table.Column({width:"60px", hAlign:"Center"});
        oTab.addColumn(oCol1);

        //라인별 선택 CHECKBOX.
        var oChk1 = new sap.m.CheckBox({selected:"{SEL}", enabled:"{ENAB_SEL}"});
        oCol1.setTemplate(oChk1);

        //필드명 컬럼.
        var oCol2 = new sap.ui.table.Column({
            label:new sap.m.Label({design:"Bold", text:"Field Name"}),
            template:new sap.m.Text({text:"{FLDNM}", tooltip:"{FLDNM}"})
        });
        oTab.addColumn(oCol2);

        //필드내역 컬럼.
        var oCol3 = new sap.ui.table.Column({
            label:new sap.m.Label({design:"Bold", text:"Field Desc."}),
            template:new sap.m.Text({text:"{FLDTX}", tooltip:"{FLDTT}"})
        });
        oTab.addColumn(oCol3);

        //필드 리스트 테이블 바인딩 처리.
        oTab.bindAggregation("rows", {path:"/T_LIST", template:new sap.ui.table.Row()});

        //model data 구성.
        oModel.setData({T_LIST:lf_setBindList(ls_ret.T_LIST)});

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

        //default checkbox 선택 가능 처리.
        ls_list.ENAB_SEL = true;

        //checkbox 선택 불가능건인경우.
        if(T_LIST[i].ENAB01 === ""){
            //checkbox 선택 불가 처리.
            ls_list.ENAB_SEL = false;
        }

        lt_list.push(ls_list);
        ls_list = {};

    }

    //결과리스트 return.
    return lt_list;

}   //필드 리스트 바인딩정보 구성.



//checkbox 선택건 초기화.
function lf_clearSelection(oModel){

    var lt_list = oModel.getProperty("/T_LIST");
    
    if(!lt_list || lt_list.length === 0){return;}

    //리스트의 checkbox 선택건 해제 처리.
    for(var i=0, l=lt_list.length; i<l; i++){
        lt_list[i].SEL = false;
    }

    //모델에 반영 처리.
    oModel.setProperty("/T_LIST", lt_list);

}   //checkbox 선택건 초기화.



//checkbox 전체선택 처리.
function lf_selectionAll(oModel){

    var lt_list = oModel.getProperty("/T_LIST");
    
    if(!lt_list || lt_list.length === 0){return;}

    //리스트의 checkbox 전체 선택 처리.
    for(var i=0, l=lt_list.length; i<l; i++){
        //체크박스 선택 불가능건은 SKIP.
        if(lt_list[i].ENAB_SEL === false){continue;}

        lt_list[i].SEL = true;

    }

    //모델에 반영 처리.
    oModel.setProperty("/T_LIST", lt_list);


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