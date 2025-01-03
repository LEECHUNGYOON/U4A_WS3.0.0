(function(){

    const C_FOLDER = "UI_PREVIEW";    

    var loApp = {ui:{}, attr:{}};

    //ui 미리보기 이미지 팝업.
    oAPP.fn.callUiPreviewImagePopup = function(oUi, UIOBK){

        //초기값 구성.
        lf_setInitData(UIOBK);

        
        //이미지 정보 구성을 실패한 경우.
        if(lf_getImageData(UIOBK) === false){
            //E32	Preview Image
            //196  &1 does not exist.
            parent.showMessage(sap, 10, "E", 
                oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E32", "", "", "", ""), "", "", ""));

            //단축키도 같이 잠금해제 처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }


        //이미 이미지 팝업을 구성했다면 팝업 즉시 호출.
        if(loApp.ui.oPop){

            //단축키도 같이 잠금해제 처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            loApp.ui.oPop.openBy(oUi);
            return;
        }

        //ui 미리보기 이미지 팝업.
        loApp.ui.oPop = new sap.m.ResponsivePopover({placement:"Auto", contentWidth:"40%",
            contentHeight:"40%", verticalScrolling:false});

        //이미지 팝업 호출 전 이벤트.
        loApp.ui.oPop.attachBeforeOpen(function(){
            lf_BeforeOpen();
        }); //이미지 팝업 호출 전 이벤트.

        //이미지 팝업 호출 후 이벤트.
        loApp.ui.oPop.attachAfterOpen(function(){
            lf_AfterOpen();
        }); //이미지 팝업 호출 후 이벤트.

        //팝업 종료전 이벤트.
        loApp.ui.oPop.attachBeforeClose(function(){            
            //Carousel Interval 초기화 처리.
            lf_setCarouselInterval(true);
        }); //팝업 종료전 이벤트.


        loApp.oModel = new sap.ui.model.json.JSONModel();
        loApp.ui.oPop.setModel(loApp.oModel);


        //상단 툴바 영역.
        var oTool0 = new sap.m.Toolbar();
        loApp.ui.oPop.setCustomHeader(oTool0);


        var oTitle = new sap.m.Title({text:"{/title}", tooltip:"{/title}"}).addStyleClass("sapUiTinyMarginEnd");
        oTool0.addContent(oTitle);


        oTool0.addContent(new sap.m.ToolbarSpacer());


        //040	Rotation On/Off
        oSwitch = new sap.m.Switch({state:"{/state}", 
            tooltip:parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "040")});
        oTool0.addContent(oSwitch);
        oSwitch.attachChange(function(){
            //switch on/off 여부에 따른 Carousel 자동넘김 처리.
            lf_setCarouselInterval(this.getState() ? false:true);
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
            // lf_close("001");

            loApp.ui.oPop.close();

        }); //닫기 버튼 선택 이벤트.


        loApp.ui.oCar = new sap.m.Carousel({loop:true});
        loApp.ui.oPop.addContent(loApp.ui.oCar);


        //Carousel 화면 전환전 이벤트.
        loApp.ui.oCar.attachBeforePageChanged(function(oEvent){
            //interval 재설정 처리.
            lf_setCarouselInterval();
        });

        var oImage = new sap.m.Image({src:"{src}"});
        loApp.ui.oCar.bindAggregation("pages", {path:"/T_IMAGE", template:oImage});

        
        //단축키도 같이 잠금해제 처리.
        oAPP.fn.setShortcutLock(false);

        parent.setBusy("");


        //팝업 호출 처리.
        loApp.ui.oPop.openBy(oUi);


    };  //ui 미리보기 이미지 팝업.




    //초기값 구성.
    function lf_setInitData(UIOBK){
        
        //라이브러리명 광역화.
        loApp.attr.UIOBK = UIOBK;

        //이미지 json array 생성.
        loApp.attr.T_DATA = [];


        //index.json 파일 경로 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", C_FOLDER, "index.json" );

        //해당 경로에 파일이 존재하지 않는경우 exit.
        if(!parent.FS.existsSync(l_path)){
            return false;
        }
        
        try{
            //이미지 json 정보 얻기.
            var lt_json = JSON.parse(parent.FS.readFileSync(l_path, "utf-8"));

        }catch(e){
            return false;
        }

        //json 정보가 잘못된 경우 exit.
        if(!lt_json || !jQuery.isArray(lt_json)){
            return false;
        }

        //JSON 정보 광역화.
        loApp.attr.T_DATA = lt_json;


    }   //초기값 구성.




    //팝업 종료 처리.
    function lf_close(sMSGNO){
        
        loApp.ui.oPop.close();

        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", sMSGNO, "", "", "", ""));

    }   //팝업 종료 처리.




    //이미지 정보 구성.
    function lf_getImageData(UIOBK){

        //이미지 json 정보가 존재하지 않는경우 exit.
        if(loApp.attr.T_DATA.length === 0){return false;}

        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === UIOBK);
        if(!ls_0022){return false;}

        for(var i=0, l=loApp.attr.T_DATA.length; i<l; i++){

            //이미지 정보가 없는경우 skip.
            if(!loApp.attr.T_DATA[i].T_IMG || loApp.attr.T_DATA[i].T_IMG.length === 0){
                continue;
            }
            
            //UIFND | UIFND ... 형식에서 공백 제거 후 |로 분리 처리.
            var lt_split = loApp.attr.T_DATA[i].UIFND.replaceAll(" ", "").split("|");

            //분리된 UI 정보에서 입력 라이브러리명이 존재하는지 확인.
            if(lt_split.findIndex( a => a === ls_0022.LIBNM ) !== -1){

                //찾은 이미지 정보 광역화.
                loApp.attr.image = loApp.attr.T_DATA[i];
                
                //찾음 flag return.
                return true;                
            }
        }

        //이미지 정보를 찾지 못한 경우 입력 ui의 부모 정보 검색.
        var ls_parent = oAPP.DATA.LIB.T_0027.find( a => a.SGOBJ === UIOBK && a.TOBTY === "1" );
        if(!ls_parent){
            return false;
        }

        //부모를 탐색하며 이미지 존재 여부 확인.
        return lf_getImageData(ls_parent.TGOBJ);


    }   //이미지 정보 구성.




    //팝업 호출 전 이벤트 처리.
    function lf_BeforeOpen(){

        //입력 ui object key의 상세 정보 얻기.
        var ls_0022 = oAPP.DATA.LIB.T_0022.find( a => a.UIOBK === loApp.attr.UIOBK );
        if(!ls_0022){return;}

        //결과 바인딩.
        loApp.oModel.setData({title: `${ls_0022.UIOBJ} (${ls_0022.LIBNM})`, state:true });


    }   //팝업 호출 전 이벤트 처리.




    //팝업 호출 이후 이벤트 처리.
    function lf_AfterOpen(){

        var lt_IMAGE = [];

        for(var i=0, l=loApp.attr.image.T_IMG.length; i<l; i++){
            //이미지 파일 경로 구성.
            var l_path = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", "image", 
                C_FOLDER, loApp.attr.image.T_IMG[i].FNAME_R );
            
            lt_IMAGE.push({src:l_path});
            
        }

        //결과 바인딩.
        loApp.oModel.setData({T_IMAGE:lt_IMAGE}, true);


        //2초마다 Carousel 넘기기.
        lf_setCarouselInterval();
        
        //첫번째 페이지로 이동 처리.
        loApp.ui.oCar._moveToPage(1);

        //팝업에 focus 처리.
        loApp.ui.oPop.focus();
        

    }   //팝업 호출 이후 이벤트 처리.




    //Carousel Interval 설정 처리.
    function lf_setCarouselInterval(bClose){

        //Carousel Interval 초기화 처리.
        clearInterval(loApp.attr.intv);

        //초기화 후 interval 처리를 안하는경우 exit.
        if(bClose){return;}

        if(!loApp.oModel.oData.state){return;}

        //2초마다 Carousel 넘기기.
        loApp.attr.intv = setInterval(()=>{
            loApp.ui.oCar.next();
        },2000);

    }   //Carousel Interval 설정 처리.


})();