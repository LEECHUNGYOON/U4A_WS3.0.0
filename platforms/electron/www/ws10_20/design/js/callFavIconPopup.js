(function(){

    //즐겨찾기 팝업과 즐겨찾기 리스트(IFRAME)의 I/F를 위한 커스텀 이벤트명.
    const C_IF_FAV_ICON_EVT = "IF_FAV_ICON_EVT";


    let loApp = {};

    //ui instance 수집 object.
    loApp.ui = {};

    //attribute 수집 object.
    loApp.attr = {};



    /*********************************************************
     * @function - attribute 즐겨찾기 아이콘 팝업 호출.
     ********************************************************/
    oAPP.fn.callFavIconPopup = function(oUi, is_attr, f_cb){
        
        //attr 초기화 처리.
        loApp.attr = {};

        //openBy 처리 UI가 존재하지 않는경우 exit.
        if(!oUi){

            //단축키 잠금 해제 처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //입력 attr 정보 광역화.
        loApp.attr.is_attr = is_attr;

        //callback function정보 광역화.
        loApp.attr.f_cb = f_cb;

        //아이콘 즐겨찾기 항목 검색.
        loApp.attr.T_ICON = parent.WSUTIL.getIconFavorite(parent.getUserInfo().SYSID);

        //즐겨찾기 항목이 존재하지 않는다면.
        if(loApp.attr.T_ICON.length === 0){

            //078  Icon favorite list
            //079  &1 does not exist.
            parent.showMessage(sap, 10, "E", 
                parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "079", 
                    parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "078")
                , "", "", ""));

            //팝업 UI가 이미 호출되 있다면 종료 처리.
            if(loApp.ui.oFavIconPopup && loApp.ui.oFavIconPopup.isOpen()){
                loApp.ui.oFavIconPopup.close();
            }

            //단축키 잠금 해제 처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }


        //광역화된 팝업 정보가 존재하는경우.
        //(이전에 팝업을 생성하여 호출한적이 있는경우)
        if(loApp.ui.oFavIconPopup){

            //팝업 UI가 이미 호출되 있다면 exit.
            if(loApp.ui.oFavIconPopup && loApp.ui.oFavIconPopup.isOpen()){
                //단축키 잠금 해제 처리.
                oAPP.fn.setShortcutLock(false);

                parent.setBusy("");
                
            }

            //새로 그리지 않고 이전 팝업 정보로 open 처리.
            loApp.ui.oFavIconPopup.openBy(oUi);

            return;
        }


        //description 팝업.
        var oPop = new sap.m.ResponsivePopover({
            placement:"Auto", 
            contentHeight:"40%", 
            contentWidth:"30%", 
            verticalScrolling:false, 
            resizable:false,
            afterClose: function(){

                //테마 변경 이벤트 제거 처리.
                sap.ui.getCore().detachThemeChanged(lf_changeUI5Theme);

            },
            afterOpen: function(){

                //테마 변경 이벤트 등록 처리.
                sap.ui.getCore().attachThemeChanged(lf_changeUI5Theme);


                //1. 생성여부 점검.
                let _oPopupDom = this.getDomRef() || undefined;

                //popup의 dom이 존재하지 않는경우 exit.
                if(typeof _oPopupDom === "undefined"){

                    parent.setBusy("");

                    //단축키 잠금 해제 처리.
                    oAPP.fn.setShortcutLock(false);
                   
                    return;
                }

                //iframe DOM 생성 여부 확인.
                let _oFrameDom = _oPopupDom.querySelector("iframe") || undefined;

                //iframe DOM이 생성 됐다면 custom 이벤트 등록 처리 안함.
                if(typeof _oFrameDom !== "undefined"){
                    return;
                }


                //2. 이벤트 생성.
                //즐가찾기 리스트 출력 iframe과 통신을위한 커스텀 이벤트 설정 처리.
                _oPopupDom.addEventListener(C_IF_FAV_ICON_EVT, lf_FavIconCustomEvent);

                //popup의 content DOM 정보 얻기.
                let _oPopupCont = this.getDomRef("scroll") || undefined;

                if(typeof _oPopupCont === "undefined"){
                    return;
                }

                //3. frame 로드
                _oFrameDom = document.createElement("iframe");


                _oFrameDom.src = parent.PATH.join(oAPP.oDesign.pathInfo.designRootPath, "favIconPopup", "index.html");
                _oFrameDom.style.width = "100%";
                _oFrameDom.style.height = "calc(100% - 70px)";
                _oFrameDom.style.border = "0px";

                _oFrameDom.onload = function(){ 
                    
                    //팝업의 DOM ID를 CHILD의 WINDOW에 매핑 처리.
                    this.contentWindow.PARENT_DOM_ID = _oPopupDom.id;

                };

                _oPopupCont.appendChild(_oFrameDom);


                //팝업 호출 이후 팝업에 focus 처리.
                oPop.focus();
            }

        });


        //팝업 UI 광역화.
        loApp.ui.oFavIconPopup = oPop;


        loApp.oModel = new sap.ui.model.json.JSONModel();
        oPop.setModel(loApp.oModel);

        var oTool0 = new sap.m.Toolbar();
        oPop.setCustomHeader(oTool0);

        //078   Icon favorite list
        var l_txt = parent.WSUTIL.getWsMsgClsTxt(oAPP.oDesign.settings.GLANGU, "ZMSG_WS_COMMON_001", "078");

        //팝업 타이틀.
        oTool0.addContent(new sap.m.Title({text:l_txt, tooltip:l_txt}).addStyleClass("sapUiTinyMarginBegin"));
        
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

        }); //닫기 버튼 선택 이벤트.

        // var oVBox = new sap.m.VBox(C_FAV_ICON_POPUP_CONT_ID, {width:"100%", height:"90%",renderType:"Bare"});
        // oPop.addContent(oVBox);


        // var oHTML = new sap.ui.core.HTML({content:"{/favListHTML}"});
        // oVBox.addItem(oHTML);

        oPop.addContent(new sap.m.Title({
            titleStyle : "H4",
            text:oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "365", "", "", "", "")
        }).addStyleClass("sapUiSmallMargin"));

        //20250102 PES.
        // //365  Double-click the line in the icon list to add an icon.
        // //결과리스트 테이블.
        // var oTab = new sap.ui.table.Table({selectionMode:"None", minAutoRowCount:1, alternateRowColors:true,
        //     visibleRowCountMode:"Auto", columnHeaderVisible:false, rowHeight:48,
        //     footer:new sap.m.Label({design:"Bold", text:oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "365", "", "", "", "")}),
        //     layoutData:new sap.m.FlexItemData({growFactor:1})});
        // oVBox.addItem(oTab);

        // //아이콘 선택(더블클릭) 이벤트.
        // oTab.addEventDelegate({ondblclick:function(oEvent){
        //     lf_selLine(oEvent);
        // }}); //아이콘 선택(더블클릭) 이벤트.


        // var oCol = new sap.ui.table.Column();
        // oTab.addColumn(oCol);

        // var oHBox1 = new sap.m.HBox({width:"100%", renderType:"Bare", justifyContent:"SpaceBetween", alignItems:"Center"});
        // oCol.setTemplate(oHBox1);

        // var oHBox2 = new sap.m.HBox({width:"100%", height:"45px", renderType:"Bare", alignItems:"Center"});
        // oHBox1.addItem(oHBox2);

        // var oIcon = new sap.ui.core.Icon({src:"{ICON_SRC}", size:"35px",
        //     layoutData:new sap.m.FlexItemData({minWidth:"40px"})}).addStyleClass("sapUiSmallMarginEnd");
        // oHBox2.addItem(oIcon);

        // var oTxt = new sap.m.Text({text:"{ICON_NAME}"});
        // oHBox2.addItem(oTxt);

        // //A79	Copy Text
        // //copy 버튼.
        // var oCopy = new sap.m.Button({icon:"sap-icon://copy"});
        // // oCItem.addCell(oCopy);
        // oHBox1.addItem(oCopy);

        // //copy 버튼 선택 이벤트.
        // oCopy.attachPress(function(){
        //     lf_copyText(this);
        // }); //copy 버튼 선택 이벤트.


        // oTab.bindAggregation("rows", {path:"/T_ICON", template:new sap.ui.table.Row()});
        

        //팝업 호출.
        oPop.openBy(oUi);

    };  //attribute 즐겨찾기 아이콘 팝업 호출.




    /*********************************************************
     * @function - 즐겨찾기 팝업과 즐겨찾기 리스트(iframe)과의 I/F를 위한 커스텀 이벤트 callback function.
     ********************************************************/
    function lf_FavIconCustomEvent(oEvent){

        switch (oEvent?.detail?.ACTCD) {
            case "FAV_ICON_LIST_FRAME_LOADED":
                //즐겨찾기 아이콘 리스트 IFRAME 로드됨.

                //즐겨찾기 리스트 구성 처리.
                lf_setFavListData();
                break;

            case "FAV_ICON_LIST_SEL_LINE":
                //즐겨찾기 아이콘 리스트 라인 선택건.
                lf_selLine(oEvent.detail);
                break;
            
            case "FAV_ICON_CLIP_TXT_COPY":
                //즐겨찾기 아이콘 클립보드 카피 처리.
                lf_ClipBoardCopyText(oEvent.detail);
                break;

            case "BUSY_ON":

                //BUSY ON 처리.
                parent.setBusy("X");

                //단축키 잠금 처리.
                oAPP.fn.setShortcutLock(true);

                break;

            case "BUSY_OFF":

                //단축키 잠금 해제 처리.
                oAPP.fn.setShortcutLock(false);

                //BUSY OFF 처리.
                parent.setBusy("");

                break;
        
            default:
                //메시지 처리.
                break;
        }

    }




    /*********************************************************
     * @function - 즐겨찾기 리스트 출력 iframe DOM INSTANCE 얻기.
     ********************************************************/
    function lf_getFavListFrameDom(){

        let _oDom = loApp.ui.oFavIconPopup.getDomRef();


        //즐겨찾기 iframe DOM 정보 얻기.
        return _oDom.querySelector("iframe") || undefined;


    }
    

    /*********************************************************
     * @function - 즐겨찾기 리스트 출력 IFRAME으로 데이터 전송 처리.
     ********************************************************/
    function lf_sendDataToChild(oData){
        
        //즐겨찾기 리스트 출력 iframe DOM INSTANCE 얻기.
        let _oFrameDom = lf_getFavListFrameDom();

        if(typeof _oFrameDom?.contentDocument?.body === "undefined"){
            return;
        }


        let _oCustomEvt = new CustomEvent(C_IF_FAV_ICON_EVT, {detail: oData});


        _oFrameDom.contentDocument.body.dispatchEvent(_oCustomEvt);


    }



    /*********************************************************
     * @function - UI5 테마 변경 이벤트.
     ********************************************************/
    function lf_changeUI5Theme(){

        let _sParams = {};

        //테마 변경됨 액션 코드.
        _sParams.ACTCD = "THEME_CHANGE";

        
        //테마 정보 매핑.
        _sParams.S_THEME = parent.getThemeInfo();


        //즐겨찾기 아이콘 구성 처리건 전송.
        lf_sendDataToChild(_sParams);


    }




    /*********************************************************
     * @function - 즐겨찾기 아이콘 리스트 구성.
     ********************************************************/
    function lf_setFavListData(){


        let _sParams = {};

        //즐겨찾기 리스트 초기 구성.
        _sParams.ACTCD = "SET_INIT_FAV_LIST";
        

        //UI5에 적용된 테마 정보 얻기.
        _sParams.S_THEME = parent.getThemeInfo();


        //CSS 링크 정보 얻기.
        _sParams.T_CSS = lf_setFavIconListCSSLink();


        //U4A extension Icon 항목 구성.
        _sParams.T_STYLE = lf_setExtensionIconList();


        //즐겨찾기 아이콘 리스트 구성.
        _sParams.T_ICON_LIST = lf_setFavIconList();


        //즐겨찾기 아이콘 구성 처리건 전송.
        lf_sendDataToChild(_sParams);


    }




    /*********************************************************
     * @function - U4A extension Icon 항목 구성.
     ********************************************************/
    function lf_setExtensionIconList(){

        let _aExtIconList = [];

        let _aUA053 = oAPP.attr.S_CODE.UA053.filter( item => item.FLD04 !== "X" );

        if(_aUA053.length === 0){
            return _aExtIconList;
        }


        //URL의 앞부분 구성 처리.
        let _prePath = parent.getHost();

        //sap id, password 파라메터.
        var _param = lf_setLoginParam();


        for (let i = 0, l = _aUA053.length; i < l; i++) {
            
            let _sUA053 = _aUA053[i];

            let _sExtIconList = {};

            //icon collection명.
            _sExtIconList.collectionName = _sUA053.FLD01;

            //폰트 패밀리 이름.
            _sExtIconList.fontFamily = _sUA053.FLD02;

            //아이콘 경로.
            _sExtIconList.fontURI = `${_prePath}${_sUA053.FLD03}/${_sUA053.FLD02}.woff2?${_param}`;

            _aExtIconList.push(_sExtIconList);

            
        }

        return _aExtIconList;

    }




    /*********************************************************
     * @function - URL의 앞부분 구성 처리.
     ********************************************************/
    function lf_setURLPrePath(){

        let _path = "";

        //접속 host 정보 얻기.
        let _host = parent.getHost();

        if(typeof _host === "undefined"){
            return _path;
        }

        //UI5 bootstrap 라이브러리 정보 얻기.
        let _sUA025 = oAPP.attr.S_CODE.UA025.find( item => item.FLD01 === "APP" && item.FLD06 === "X" );

        if(typeof _sUA025 === "undefined"){
            return _path;
        }

        //라이브러리 path 정보 구성.
        var _libPath = `${_sUA025.FLD04}${_sUA025.FLD05}`;

        //sap-ui-core.js 제거 처리.
        _libPath = _libPath.replace(/sap-ui-core.js/, "");

        _path = `${_host}${_libPath}`;

        return _path;

    }


    

    /*********************************************************
     * @function - 사용자id, password 파라메터 구성 처리.
     ********************************************************/
    function lf_setLoginParam(){

        let _param = "";
        
        //접속한 사용자 정보 얻기.
        let _sUserInfo = parent.getUserInfo();

        if(typeof _sUserInfo === "undefined"){
            return _param;
        }

        //sap id, password 파라메터.
        _param = `sap-user=${_sUserInfo.UNAME}&sap-password=${_sUserInfo.PW}`;
        
        return _param;

    }




    /*********************************************************
     * @function - 즐겨찾기 아이콘 리스트 구성 처리.
     ********************************************************/
    function lf_setFavIconListCSSLink(){

        let _aLink = [];

        //URL의 앞부분 구성 처리.
        let _prePath = lf_setURLPrePath();
               
        //현재 WS 3.0에 적용된 테마 정보 얻기.
        var _theme = parent.getThemeInfo()?.THEME || "";

        //default 사용함 필드.
        let _FLD03 = "";

        //1.120.21 버전 이후 패치의 경우 허용 가능 테마 필드명 매핑.
        if(oAPP.common.checkWLOList("C", "UHAK900877") === true){
            _FLD03 = "X";
        }


        //WS 3.0에서 적용한 테마가 미리보기에서 사용 가능한 테마 인지 확인.
        if(oAPP.attr.S_CODE.UA007.findIndex( item => item.FLD01 === _theme && item.FLD03 === _FLD03 ) === -1){
            //사용 가능한 테마가 아닌경우,
            
            //DEFAULT 테마 정보 얻기.
            let _deafultTheme = oAPP.attr.S_CODE.UA007.find( item => item.FLD02 === "X" && item.FLD03 === _FLD03 )?.FLD01 || "sap_horizon";

            //DEFAULT 테마로 매핑 처리.
            _theme = _deafultTheme;

            //대문자 전환.
            let _themeUPP = _theme.toUpperCase();

            //default 테마검색 키워드.
            let _keyword = "SAP_";

            //현재 WS 3.0에서 적용한 테마가 dark 테마인경우.
            if(_themeUPP.indexOf("DARK") !== -1){
                //DARK 테마가 검색되도록 키워드 구성 처리.
                _keyword = "DARK";
            }
            
            //공통코드의 사용 가능한 테마중 테마 정보 읽기.
            _theme = oAPP.attr.S_CODE.UA007.find( item => item.FLD01.toUpperCase().indexOf(_keyword) !== -1 && item.FLD03 === _FLD03 )?.FLD01 || _deafultTheme;

        }


        //sap id, password 파라메터.
        var _param = lf_setLoginParam();
        

        //default icon 정보 구성 처리.
        var _sLink = {};

        _sLink.id   = "sap-ui-theme-sap.ui.core";
        _sLink.href = `${_prePath}sap/ui/core/themes/${_theme}/library.css?${_param}`;

        _aLink.push(_sLink);



        //BusinessSuite icon 정보 구성 처리.
        var _sLink = {};

        _sLink.id   = "sap-ui-theme-sap.ushell";
        _sLink.href = `${_prePath}sap/ushell/themes/${_theme}/library.css?${_param}`;

        _aLink.push(_sLink);



        //SAP-icons-TNT icon 정보 구성 처리.
        var _sLink = {};

        _sLink.id   = "sap-ui-theme-sap.tnt";
        _sLink.href = `${_prePath}sap/tnt/themes/${_theme}/library.css?${_param}`;

        _aLink.push(_sLink);


        return _aLink;

    }



    
    /*********************************************************
     * @function - 즐겨찾기 아이콘 리스트 구성.
     ********************************************************/
    function lf_setFavIconList(){

        let _aFavIconList = [];

        if(loApp.attr.T_ICON.length === 0){
            return _aFavIconList;
        }


        //미리보기의 아이콘 정보 얻는 function 지역화.
        let _getIconInfo = oAPP.attr.ui.frame.contentWindow.sap.ui.core.IconPool.getIconInfo;

        for (let i = 0, l = loApp.attr.T_ICON.length; i < l; i++) {
            
            let _Icon = loApp.attr.T_ICON[i];

            let _sFavIconList = {};


            //아이콘 이름.
            _sFavIconList.ICON_NAME = _Icon.ICON_NAME;

            //아이콘 SRC
            _sFavIconList.ICON_SRC = _Icon.ICON_SRC;

            //아이콘 폰트 패밀리.
            _sFavIconList.fontFamily  = "";

            //아이콘 폰트
            _sFavIconList.content = "";

            //아이콘의 상세 정보 얻기.
            let _sIconInfo = _getIconInfo(_sFavIconList.ICON_SRC) || undefined;
            

            if(typeof _sIconInfo !== "undefined"){
                //아이콘 폰트 패밀리.
                _sFavIconList.fontFamily = _sIconInfo.fontFamily;

                //아이콘 폰트
                _sFavIconList.content = _sIconInfo.content;

            }

            _aFavIconList.push(_sFavIconList);
            
        }

        return _aFavIconList;


    }




    /*********************************************************
     * @function - 아이콘 선택시 attribute에 값 매핑 처리.
     ********************************************************/
    function lf_selLine(oData){

        if(typeof oData?.sList?.ICON_SRC === "undefined"){
            return;
        }
        
        //편집모드가 아닌경우 exit.
        if(!oAPP.attr.oModel.oData.IS_EDIT){return;}

        //callback function이 존재하지 않는경우 exit.
        if(typeof loApp.attr.f_cb === "undefined"){return;}

        //callback function에 선택한 icon명 전달.
        loApp.attr.f_cb(oData.sList.ICON_SRC);

        //아이콘 팝업 종료 처리.
        loApp.ui.oFavIconPopup.close();

        //메시지 처리.
        //271	&1 has been selected.
        parent.showMessage(sap, 10, "I", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "271", oData.sList.ICON_SRC, "", "", ""));

        //메뉴 잠금 해제 처리.

    }   //table 더블클릭 이벤트 처리.




    /*********************************************************
     * @function - 복사버튼 선택 이벤트.
     ********************************************************/
    function lf_ClipBoardCopyText(oData){

        if(typeof oData?.sList?.ICON_SRC === "undefined"){
            return;
        }
        
        loApp.ui.oFavIconPopup.setModal(true);

        //icon src 복사 처리.
        parent.setClipBoardTextCopy(oData.sList.ICON_SRC);

        // 메시지 처리.
        // 272	&1 has been copied.
        parent.showMessage(sap, 10, "S", oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "272", oData.sList.ICON_SRC, "", "", ""));

        loApp.ui.oFavIconPopup.setModal(false);

    }   //복사버튼 선택 이벤트.


})();