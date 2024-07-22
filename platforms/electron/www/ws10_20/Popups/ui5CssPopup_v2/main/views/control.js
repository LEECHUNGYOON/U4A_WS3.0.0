/********************************************************************
 *  📝 LIBRARY LOAD 선언부
 ********************************************************************/
    sap.ui.getCore().loadLibrary("sap.ui.unified");

    jQuery.sap.require("sap.m.MessageBox");
    jQuery.sap.require("sap.m.Illustration");


/********************************************************************
 * 💖 DATA / ATTRIBUTE 선언부
 ********************************************************************/
    const 
        oContr          = {};
        oContr.ui       = {};
        oContr.fn       = {};
        oContr.attr     = {};
        oContr.types    = {};
        oContr.broad    = {};

        oContr.IF_DATA  = {};

        // 공통 DDLB 구조
        oContr.types.TY_DDLB = {
            key: "",
            text:""
        };

        // PRC 구조
        oContr.types.TY_PRC = {

            dtl_tit : ""    // 디테일 페이지의 타이틀

        };

        // 디테일 영역 모델 구조
        oContr.types.TY_DETAIL = {
            selectedTheme: "",      // 선택한 테마
            T_THEME: []             // 지원가능한 테마 목록
        };
        

    // 디테일 영역의 HTML 경로
    const C_DETAIL_HTML_PATH = parent.PATH.join(parent.APPPATH, "ui5CssPopup", "detail", "frame.html");    

    oContr.oModel = new sap.ui.model.json.JSONModel({

        T_LMENU_LIST: [], // 좌측 메뉴

        T_FMENU_LIST: [], // 푸터 메뉴

        S_PRC : JSON.parse(JSON.stringify(oContr.types.TY_PRC)),

        // 디테일 영역
        S_DETAIL: JSON.parse(JSON.stringify(oContr.types.TY_DETAIL)),

    });

    oContr.oModel.setSizeLimit(Infinity);


/********************************************************************
 * 💖 PRIVATE FUNCTION 선언부
 ********************************************************************/

    /*******************************************************
     * @function - 서버에서 CSS MENU 정보 구하기
     *******************************************************/
    function _getCSSMenuList(){

        return new Promise(async (resolve) => {

            let sServerUrl = oContr.IF_DATA.sServerPath;
            let sServUrl = `${sServerUrl}${oContr.IF_DATA.sSubRootPath}`; // 서버 호출 url
    
            try {
                var oResult = await fetch(sServUrl);
            } catch (error) {
                resolve({ RETCD: "E", ERRCD: "E001", RTMSG: "통신오류!!" }); // [MSG]
                return;
            }

            if(oResult?.ok === false){
                resolve({ RETCD: "E", ERRCD: "E002", RTMSG: "통신오류!!" }); // [MSG]
                return;
            }

            try {
                
                var aMenu = await oResult.json();

            } catch (error) {
                resolve({ RETCD: "E", ERRCD: "E003", RTMSG: "JSON 응답 데이터 오류!!" }); // [MSG]
                return;
            }

            return resolve({ RETCD: "S", RDATA: aMenu });

        });

    } // end of _getMenuList

    /*******************************************************
     * @function - broadcast Instance All Clear
     *******************************************************/
    function _setBroadcastClear() {

        if(!oContr.broad){
            return;
        }

        for(var i in oContr.broad){
            
            if(!oContr.broad[i]) {
                continue;
            }

            oContr.broad[i].close();

            delete oContr.broad[i];

        }

    } // end of _setBroadcastClear

    /*******************************************************
     * @function - localstorage에 저장된 css 데이터 구하기
     *******************************************************/
    function _getSavedCssList (){

        let oRES = {
            RETCD: "E",
            RDATA: "",
            RTMSG: "",
            ERRCD: ""
        };

        // 브라우저키 + 스토리지 저장 prefix값으로 로컬스토리지 전체 읽기
        let sStorageKey = oContr.IF_DATA.BROWSKEY + oContr.IF_DATA.STORAGE_KEY_PREFIX;

        let sSavedCssList = localStorage.getItem(sStorageKey);

        try {

            var aSavedCssList = JSON.parse(sSavedCssList);

        } catch (error) {

            // JSON PARSE 오류
            oRES.ERRCD = "E01";

            return oRES;
        }

        if(!aSavedCssList || Array.isArray(aSavedCssList) === false || aSavedCssList.length === 0){

            // 저장된 데이터가 없음
            oRES.ERRCD = "E02";

            return oRES;
        }


        oRES.RETCD = "S";
        oRES.RDATA = aSavedCssList;

        return oRES;

    } // end of _getSavedCssList

    /*********************************************************
     * @function - 특정 Html 영역을 FadeIn 효과 주기
     *********************************************************
     * @param {DOM} oDomRef 
     * - DOM
     * @param {Integer} itime
     * - FadeIn 효과 적용 시 딜레이 타임 
     *********************************************************/
    function _domFadeIn(oDomRef, itime = 300) {

        return new Promise((resolve) => {

            $(oDomRef).fadeIn(itime, () => {
                resolve();
            });

        });

    } // end of _domFadeIn

    /*********************************************************
     * @function - 특정 Html 영역을 FadeOut 효과 주기
     *********************************************************
     * @param {DOM} oDomRef 
     * - DOM
     * @param {Integer} itime
     * - FadeOut 효과 적용 시 딜레이 타임 
     *********************************************************/
    function _domFadeOut(oDomRef, itime = 300) {

        return new Promise((resolve) => {

            $(oDomRef).fadeOut(itime, () => {
                resolve();
            });

        });

    } // end of _domFadeOut



/********************************************************************
 * 💖 PUBLIC FUNCTION 선언부
 ********************************************************************/


    /*******************************************************************
     *📝 Flow Event Definitions
     *******************************************************************/


    /*******************************************************
     * @function - 화면이 로드 될때 호출되는 function
     *******************************************************/
    oContr.onViewReady = function(){

        oContr.fn.onInit();

    }; // end of oContr.onViewReady
    

    /*******************************************************************
     *📝 Flow Procces Definitions
     *******************************************************************/


    /*******************************************************
     * @function - Application Init 
     *******************************************************/
    oContr.fn.onInit = async function(){

        // 부모에 저장된 IF_DATA 정보를 가져온다.
        oContr.IF_DATA = oParentAPP.attr.IF_DATA;

        // CSS메뉴 목록을 구한다.
        var oResult = await _getCSSMenuList();
        if(oResult.RETCD === "E"){

            oContr.fn.setBusy(false);

            sap.m.MessageBox.error(oResult.RTMSG);

            oContr.ui.NAVCON2.to(oContr.ui.NODATAPG1);

            return;
        }

        // CSS 메뉴 관련 정보가 없다면 빠져나간다.
        let oCssMenuInfo = oResult.RDATA;
        if(!oCssMenuInfo){

            oContr.fn.setBusy(false);

            // 디테일 영역에 데이터 없음 페이지로 이동
            oContr.ui.NAVCON2.to(oContr.ui.NODATAPG1);

            return;
        }

        // 좌측 메뉴 정보가 없다면 우측 디테일 화면에는 데이터 없음 페이지로 이동시킨다.
        let aLMenuList = oCssMenuInfo.LMENU;
        if(!aLMenuList || Array.isArray(aLMenuList) === false || aLMenuList.length === 0){

            aLMenuList = [];

            // 디테일 영역에 데이터 없음 페이지로 이동
            oContr.ui.NAVCON2.to(oContr.ui.NODATAPG1);

        }

        // 푸터 메뉴 정보
        let aFMenuList = oCssMenuInfo.FMENU;
        if(!aFMenuList || Array.isArray(aFMenuList) === false || aFMenuList.length === 0){

            aFMenuList = [];

        }

        // 서버 호스트
        let sServerHost = oContr.IF_DATA.sServerHost;

        // 서버 호출 경로        
        let sServerPath = oContr.IF_DATA.sServerPath;

        // 메뉴리스트 정보에 서버 bootstrap 정보를 추가한다.
        let sServerBootSrc = sServerHost + oContr.IF_DATA.sServerBootStrapUrl;        
        let sSubrootSrc = `${sServerPath}${oContr.IF_DATA.sSubRootPath}`;

        // 좌측 메뉴의 추가 정보를 저장한다.
        for(const oMenu of aLMenuList){

            oMenu.SERVER_BOOTSRC = sServerBootSrc;
            oMenu.SUBROOT_SRC = `${sSubrootSrc}&mid=${oMenu.KEY}&menunm=${oMenu.TITLE}`;
            oMenu.oThemeInfo = oContr.IF_DATA.oThemeInfo;

        }

        // 푸터 메뉴의 추가 정보를 저장한다.
        for(const oMenu of aFMenuList){

            oMenu.SERVER_BOOTSRC = sServerBootSrc;
            oMenu.SUBROOT_SRC = `${sSubrootSrc}&mid=${oMenu.KEY}&menunm=${oMenu.TITLE}`;
            oMenu.oThemeInfo = oContr.IF_DATA.oThemeInfo;

        }        

        oContr.oModel.oData.T_LMENU_LIST = aLMenuList;  // 좌측 메뉴
        oContr.oModel.oData.T_FMENU_LIST = aFMenuList;  // 푸터 메뉴


        // TEST -------- START
        oContr.fn.setTest();
        // TEST -------- END


        oContr.oModel.refresh();

        if(aLMenuList.length === 0){
            oContr.fn.setBusy(false);
            return;
        }

        oContr.ui.NAVCON2.to(oContr.ui.DTLPG1);

        oContr.ui.NAVCON2.attachEventOnce("afterNavigate", function(){            
               
            // 디테일 영역의 기본 테마 설정
            let oThemeInfo = oContr.IF_DATA.oThemeInfo;
            if(oThemeInfo){            
                oContr.oModel.oData.S_DETAIL.selectedTheme = oContr.IF_DATA.oThemeInfo.THEME; 
            }

            // 화면 처음 로드 시 첫번째 메뉴를 선택한 효과를 준다
            let oFirstItem = oContr.ui.LIST1.getItems()[0];
            if(!oFirstItem){
                oContr.fn.setBusy(false);
                return;
            }
            
            oContr.ui.LIST1.setSelectedItem(oFirstItem);
            oContr.ui.LIST1.fireSelectionChange({ listItem: oFirstItem });            

        });        

    }; // end of oContr.ui.onInit


    oContr.fn.setTest = function(){

        let oFS = parent.REMOTE.require("fs");
        let oPATH = parent.REMOTE.require("path");        
       
        let sAppPath = parent.REMOTE.app.getAppPath();

        let sOtherRootPath = oPATH.join(sAppPath, "ui5CssPopup", "others");

        let sMenuJsonPath = oPATH.join(sOtherRootPath, "menu.json");
        
        var sOtherMenuJson = oFS.readFileSync(sMenuJsonPath, {encoding: "utf-8"});

        var aOtherMenuList = JSON.parse(sOtherMenuJson);
        
        oContr.oModel.oData.T_FMENU_LIST = aOtherMenuList;

    };
    

    /*******************************************************
     * @function - Busy indicator 실행
     *******************************************************/
    oContr.fn.setBusy = function(bIsBusy){

        oAPP.ui.ROOT.setBusy(bIsBusy === true ? true : false);

        return bIsBusy === true ? sap.ui.getCore().lock() : sap.ui.getCore().unlock();

    }; // end of oContr.ui.setBusy


    /*******************************************************
     * @function - unified Splitter 좌측 메뉴 접기 펼치기 토글
     *******************************************************/
    oContr.fn.setSideMenuExpToggle = function(){

        return oAPP.ui.SPLITTER1.setShowSecondaryContent(!oAPP.ui.SPLITTER1.getShowSecondaryContent());
        
    }; // end of oContr.fn.setSideMenuExpToggle


    /*******************************************************
     * @function - 메뉴별 미리보기 실행
     *******************************************************/
    oContr.fn.showPrevMenuItem = async function(oItemData){

        // 선택한 메뉴의 메뉴명을 디테일 페이지 타이틀에 적용
        let oModel = oContr.oModel;
        let oPRC = oModel.oData.S_PRC;
        oPRC.dtl_tit = oItemData.TITLE;

        oModel.refresh();

        // 브로드캐스트 전역 변수 클리어
        _setBroadcastClear();

        // Prev iframe
        let oPrevFrame = document.getElementById("u4aWsCssPrevFrame");
        if(!oPrevFrame){
            oContr.fn.setBusy(false);
            return;
        }

        // 디테일 페이지 content영역을 스스륵 사라지는 효과
        let oDtlPgDom = oContr.ui.DTLPG1.getDomRef("cont");        
        if(oDtlPgDom){
            await _domFadeOut(oDtlPgDom);
        }           

        // 브라우저 키
        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        // Prev iframe에 src 지정
        oPrevFrame.src = `${C_DETAIL_HTML_PATH}?browskey=${sBrowsKey}&mid=${oItemData.KEY}`;

        // 브로드캐스트 channal Id
        let sChennalId = sBrowsKey + oItemData.KEY;
        
        // 기존에 브로드캐스트 객체가 있다면 삭제한다.
        let oBroadCast = oContr.broad[oItemData.KEY];
        if(oBroadCast){

            oBroadCast.close();
            
            delete oContr.broad[oItemData.KEY];
        }        

        // 브로드캐스트 객체 생성
        oContr.broad[oItemData.KEY] = new BroadcastChannel(sChennalId);

        // 브로드캐스트 메시지 수신
        oContr.broad[oItemData.KEY].onmessage = function(e){

            console.log(e.data);

        };

        oPrevFrame.onload = function(){

            // BroadCast에 전송할 파라미터
            let IF_DATA = JSON.parse(JSON.stringify(oItemData));

            jQuery.extend(true, IF_DATA, oContr.IF_DATA);

            // iframe 로드 후 broadcast 로 파라미터 전송
            oContr.broad[oItemData.KEY].postMessage(IF_DATA);
            
            // 파라미터 전송 후 종료
            oContr.broad[oItemData.KEY].close();

            // broadcast 객체 삭제
            delete oContr.broad[oItemData.KEY];

            let oContDoc = this.contentDocument;
            let oDetailFrame = oContDoc.getElementById("detail_frame");
            if(!oDetailFrame){
                oContr.fn.setBusy(false);
                return;
            }
        
            oDetailFrame.onload = async function(){

                // 디테일 페이지 content영역을 스스륵 나타나는 효과
                let oDtlPgDom = oContr.ui.DTLPG1.getDomRef("cont");
                if(oDtlPgDom){                
                    await _domFadeIn(oDtlPgDom);
                }            
                
                oContr.fn.setBusy(false);

            };       
    
        };

    }; // end of oContr.fn.showPrevMenuItem

    /*******************************************************
     * @function - 이미 실행한 자식 팝업이 있는지 체크
     *******************************************************/
    oContr.fn.checkIsExistsAlreadyOpen = function(oREMOTE, OBJTY){

        if(!oREMOTE || !OBJTY){
            return {
                RETCD: "E"
            };
        }

        // CSS 팝업 메인 윈도우
        let oCURRWIN = oREMOTE.getCurrentWindow();

        // CSS 팝업 메인 윈도우 자식 윈도우
        let aChildWindows = oCURRWIN.getChildWindows();
        if(!aChildWindows || Array.isArray(aChildWindows) === false || aChildWindows.length === 0){
            return {
                RETCD: "E"
            };
        }       

        for(const oChild of aChildWindows){

            if (oChild.isDestroyed()) {
                continue;
            }

            let oWebCon = oChild.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sType = oWebPref.OBJTY;

            if(sType !== OBJTY){
                continue;
            }

            return {
                RETCD: "S",
                WIN: oChild
            };

        }

        return {
            RETCD: "E"
        };

    }; // end of oContr.fn.checkIsExistsAlreadyOpen

    /*******************************************************
     * @function - 부모창이 위치한 모니터의 가운데로 이동
     *******************************************************/
    oContr.fn.moveToParentWin = function(oCHILD){
        
        const REMOTE = parent.REMOTE;
        const parentWindow = REMOTE.getCurrentWindow();
        const childWindow = oCHILD;
        const { screen } = REMOTE.require('electron');

        // 부모 창의 위치와 크기 확인
        const { x, y } = parentWindow.getBounds();
        
        // 부모 창이 위치한 모니터 정보 가져오기
        const display = screen.getDisplayNearestPoint({ x, y });
        const { workArea } = display;
        
        // 자식 창의 크기 확인
        const childWidth = childWindow.getBounds().width;
        const childHeight = childWindow.getBounds().height;
        
        // 자식 창의 위치 계산 (부모 창이 속한 모니터의 가운데)
        const childX = workArea.x + (workArea.width - childWidth) / 2;
        const childY = workArea.y + (workArea.height - childHeight) / 2;
        
        // 자식 창 이동
        childWindow.setBounds({ x: childX, y: childY, width: childWidth, height: childHeight });

    }; // end of oContr.fn.moveToParentWin

    /*******************************************************
     * @function - 메뉴별 미리보기 실행
     *******************************************************/
    oContr.fn.openNewBrowserMenu = function(oMenuData){

        oContr.fn.setBusy(true);

        const REMOTE = parent.REMOTE;
        const CURRWIN = REMOTE.getCurrentWindow();
        const REMOTEMAIN = REMOTE.require('@electron/remote/main');

        // 브라우저 키
        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        // 자식 브라우저의 고유 키 조합(부모 Browser Key + 메뉴 Key)
        let sChildKey = sBrowsKey + oMenuData.KEY;

        // 이미 실행한 팝업이 있다면 포커스를 준다.
        let oCheckIsOpen = oContr.fn.checkIsExistsAlreadyOpen(REMOTE, sChildKey);
        if(oCheckIsOpen.RETCD === "S"){

            // 부모창이 위치한 모니터의 가운데로 이동
            oContr.fn.moveToParentWin(oCheckIsOpen.WIN);

            oCheckIsOpen.WIN.focus();
            
            oContr.fn.setBusy(false);

            return;
        }

        let oBrowserOptions = {
            "browserWindow": {
                "width": 1000,
                "height": 800,            
                "icon": "www/img/logo.png",
                "webPreferences": {
                    "devTools": true,
                    "nodeIntegration": true,
                    "enableRemoteModule": true,
                    "contextIsolation": false,
                    "backgroundThrottling": false,
                    "nativeWindowOpen": true,
                    "webSecurity": false,
                    "autoplayPolicy": "no-user-gesture-required",
                    "OBJTY": sChildKey
                },
                parent: CURRWIN
            },
            "browserWindowInstance": {
        
            }        
        };

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions.browserWindow);
        REMOTEMAIN.enable(oBrowserWindow.webContents);        

        // BroadCast에 전송할 파라미터
        let IF_DATA = JSON.parse(JSON.stringify(oMenuData));

        jQuery.extend(true, IF_DATA, oContr.IF_DATA);

        // 현재 선택된 테마의 정보를 전달한다.
        IF_DATA.oThemeInfo.THEME = oContr.oModel.oData.S_DETAIL.selectedTheme;
        
        // 이 URL에 던지는 파라미터는 브로드캐스트 구분용으로 사용함.
        let sDetailUrl = `${C_DETAIL_HTML_PATH}?browskey=${sBrowsKey}&mid=${IF_DATA.KEY}`;

        oBrowserWindow.loadURL(sDetailUrl);

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oBrowserWindow.webContents.on('did-finish-load', function () {

            // 브로드캐스트 channal Id
            let sChennalId = sBrowsKey + IF_DATA.KEY;

            let oBroadCast = new BroadcastChannel(sChennalId);
                oBroadCast.postMessage(IF_DATA);
                oBroadCast.close();

            oContr.fn.setBusy(false);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    }; // end of oContr.fn.openNewBrowserMenu

    /*******************************************************
     * @function - Other CSS 팝업 띄우기
     *******************************************************/
    oContr.fn.openNewBrowserOthers = function(oMenuData){

        // // TEST ------
        // oContr.fn.openNewBrowserMenu(oMenuData);
        // // TEST ------

        // return; 

        oContr.fn.setBusy(true);

        const REMOTE = parent.REMOTE;
        const CURRWIN = REMOTE.getCurrentWindow();
        const REMOTEMAIN = REMOTE.require('@electron/remote/main');

        let oPATH = REMOTE.require("path");        
       
        let sAppPath = REMOTE.app.getAppPath();

        let sOtherRootPath = oPATH.join(sAppPath, "ui5CssPopup", "others");

        let sLoadUrl = oPATH.join(sOtherRootPath, oMenuData.PATH);

        // 브라우저 키
        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        // 자식 브라우저의 고유 키 조합(부모 Browser Key + 메뉴 Key)
        let sChildKey = sBrowsKey + oMenuData.KEY;

        // 이미 실행한 팝업이 있다면 포커스를 준다.
        let oCheckIsOpen = oContr.fn.checkIsExistsAlreadyOpen(REMOTE, sChildKey);
        if(oCheckIsOpen.RETCD === "S"){

            // 부모창이 위치한 모니터의 가운데로 이동
            oContr.fn.moveToParentWin(oCheckIsOpen.WIN);

            oCheckIsOpen.WIN.focus();
            
            oContr.fn.setBusy(false);

            return;
        }

        let oBrowserOptions = {
            "browserWindow": {
                "width": 1000,
                "height": 800,            
                "icon": "www/img/logo.png",
                "webPreferences": {
                    "devTools": true,
                    "nodeIntegration": true,
                    "enableRemoteModule": true,
                    "contextIsolation": false,
                    "backgroundThrottling": false,
                    "nativeWindowOpen": true,
                    "webSecurity": false,
                    "autoplayPolicy": "no-user-gesture-required",
                    "OBJTY": sChildKey
                },
                parent: CURRWIN
            },
            "browserWindowInstance": {
        
            }        
        };

        // 브라우저 오픈
        let oBrowserWindow = new REMOTE.BrowserWindow(oBrowserOptions.browserWindow);
        REMOTEMAIN.enable(oBrowserWindow.webContents);

        // BroadCast에 전송할 파라미터
        let IF_DATA = JSON.parse(JSON.stringify(oMenuData));

        jQuery.extend(true, IF_DATA, oContr.IF_DATA);

        // 이 URL에 던지는 파라미터는 브로드캐스트 구분용으로 사용함.
        let sDetailUrl = `${sLoadUrl}?browskey=${sBrowsKey}&mid=${IF_DATA.KEY}`;

        oBrowserWindow.loadURL(sDetailUrl);

         // 브라우저가 오픈이 다 되면 타는 이벤트
         oBrowserWindow.webContents.on('did-finish-load', function () {

            // 브로드캐스트 channal Id
            let sChennalId = sBrowsKey + IF_DATA.KEY;

            let oBroadCast = new BroadcastChannel(sChennalId);
                oBroadCast.postMessage(IF_DATA);
                oBroadCast.close();

            oContr.fn.setBusy(false);

        });

        // 브라우저를 닫을때 타는 이벤트
        oBrowserWindow.on('closed', () => {

            oBrowserWindow = null;

            CURRWIN.focus();

        });

    }; // end of oContr.fn.openNewBrowserOthers


    /*******************************************************
     * @function - 테마 변경
     *******************************************************/
    oContr.fn.setDetailThemeChange = function(sTheme){
        
        oContr.fn.setBusy(true);
     
        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        let aMenuList = oContr.oModel.oData.T_LMENU_LIST;
        if(!aMenuList || Array.isArray(aMenuList) === false || aMenuList.length === 0){
            oContr.fn.setBusy(false);
            return;
        }

        // 브로드캐스트를 전송하여 전체 테마 변경 지시
        let oBrodData = {
            PRCCD: "THEME_CHANGE",
            THEME: sTheme
        };      

        // 전체 메뉴에 대한 broadcast를 보내서 테마 변경
        for(const oMenuItem of aMenuList){

            // 브로드캐스트 channal Id
            let sChennalId = sBrowsKey + oMenuItem.KEY;

            let oBroadCast = new BroadcastChannel(sChennalId);
                oBroadCast.postMessage(oBrodData);
                oBroadCast.close();

        }

        setTimeout(function(){

            oContr.fn.setBusy(false);

        }, 300);        

    }; // end of oContr.fn.setDetailThemeChange


    /*******************************************************
     * @function - 선택한 items 들을 LocalStorage에 저장
     *******************************************************/
    oContr.fn.setSaveSelectedItemsLocal = function(sKey, aData){

        if(!sKey || Array.isArray(aData) === false){
            return;
        }

        let sSavedList = localStorage.getItem(sKey);

        try {

            /* 기존에 저장된 데이터를 구한다. */
            var aSavedList = JSON.parse(sSavedList);

        } catch (error) {
            aSavedList = [];
        }

        /* 기존에 저장된 데이터가 없을 경우 전달받은 데이터를 저장한다. */
        if(!aSavedList || (Array.isArray(aSavedList) === true && aSavedList.length === 0)){

            let aSaveData = aData.filter(e => e?.selected === true);

            localStorage.setItem(sKey, JSON.stringify(aSaveData));

            return;

        }

        /* 기 저장된 데이터 복사 */
        let aSaveTarget = JSON.parse(JSON.stringify(aSavedList));

        /* 삭제 대상 */
        let aDelTarget = aData.filter(e => e?.selected === false);
        if(aDelTarget && Array.isArray(aDelTarget) === true && aDelTarget.length !== 0){

            /*  기존에 저장된 데이터 중 삭제 대상건을 지운다 */
            for(const oDelData of aDelTarget){

                let iDelDataIdx = aSaveTarget.findIndex(e => e?.text === oDelData?.text);
                if(iDelDataIdx > -1){
                    aSaveTarget.splice(iDelDataIdx, 1);
                    continue;
                }

            }

        }

        /* 저장 대상 */
        let aSaveData = aData.filter(e => e?.selected === true);
        if(aSaveData && Array.isArray(aSaveData) === true && aSaveData.length !== 0){

            /* 저장 대상 중 기 저장된 데이터에 포함되지 않은 데이터만 push 한다. */
            for(const oSaveData of aSaveData){

                let oFindData = aSaveTarget.find(e => e?.text === oSaveData?.text);
                    if(oFindData){
                    continue;
                }

                aSaveTarget.push(oSaveData);
            }

        }

        localStorage.setItem(sKey, JSON.stringify(aSaveTarget));

    }; // end of oContr.fn.setSaveSelectedItemsLocal


    /*******************************************************
     * @function 
     *  - 선택한 items 들 전체 체크 해제
     *  - 기 저장된 로컬스토리지 전체 삭제
     *******************************************************/
    oContr.fn.setUnselectItemsAll = function(){

        oContr.fn.setBusy(true);

        // 브라우저키 + 스토리지 저장 prefix값으로 로컬스토리지 전체 삭제
        let sStorageKey = oContr.IF_DATA.BROWSKEY + oContr.IF_DATA.STORAGE_KEY_PREFIX;
        
        localStorage.removeItem(sStorageKey);

        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        let aMenuList = oContr.oModel.oData.T_LMENU_LIST;
        if(!aMenuList || Array.isArray(aMenuList) === false || aMenuList.length === 0){
            oContr.fn.setBusy(false);
            return;
        }

        // 브로드캐스트를 전송하여 선택 표시 재설정 하기
        let oBrodData = {
            PRCCD: "SEL_REF"
        };      

        // 전체 메뉴에 대한 broadcast를 보내서 선택 초기화 시키기
        for(const oMenuItem of aMenuList){

            // 브로드캐스트 channal Id
            let sChennalId = sBrowsKey + oMenuItem.KEY;

            let oBroadCast = new BroadcastChannel(sChennalId);
                oBroadCast.postMessage(oBrodData);
                oBroadCast.close();

        }

        // 좌측에 선택된 메뉴가 있을 경우
        // 브라우저키와 메뉴 key를 조합해서 broadcast를 만들고 
        // REFRESH 하라고 파라미터를 날린다.

        sap.m.MessageToast.show("Unselect");

        oContr.fn.setBusy(false);

    }; // end of oContr.fn.setUnselectItemsAll


    /*******************************************************
     * @function - 선택한 items 들을 미리보기에 적용
     *******************************************************/
    oContr.fn.setCssPreview = function(){

        oContr.fn.setBusy(true);

        // 기 저장된 CSS 정보를 구한다.
        let oCssResult = _getSavedCssList();
        if(oCssResult.RETCD === "E"){

            oContr.fn.setBusy(false);

            switch (oCssResult.ERRCD) {
                case "E01":  // JSON PARSE 오류

                    // [MSG] - JSON PARSE 오류!! 관리자에게 문의
                    var sErrMsg = "JSON PARSE 오류!! 관리자에게 문의";    

                    sap.m.MessageBox.error(sErrMsg);

                    break;
            
                case "E02": // 선택한 데이터 없음

                    // [MSG] - 선택한 데이터 없음!!
                    var sErrMsg = "선택한 데이터 없음";

                    sap.m.MessageToast.show(sErrMsg);

                    break;
            }

           
            return;
        }

        let aCssList = [];

        // 기 저장된 CSS 정보에서 CSS text만 추출
        let aSavedCssList = oCssResult.RDATA;
        for(const oCss of aSavedCssList){
            aCssList.push(oCss.text);
        }

        // IF PARAM을 구성하여 미리보기 쪽에 전송
        let IF_PARAM = {
            PRCCD: "PREVIEW",
            DATA: aCssList
        };

        // 전송!!
        let sChennalId = `${oContr.IF_DATA.BROWSKEY}--if-ui5css`;

        parent.IPCRENDERER.send(sChennalId, IF_PARAM);

        sap.m.MessageToast.show("Preview");

        oContr.fn.setBusy(false);

    }; // end of oContr.fn.setCssPreview


    /*******************************************************
     * @function - 선택한 items 들을 clipboard 복사
     *******************************************************/
    oContr.fn.setSelectedItemsCopyClipboard = function(){

        // 기 저장된 CSS 정보를 구한다.
        let oCssResult = _getSavedCssList();
        if(oCssResult.RETCD === "E"){

            oContr.fn.setBusy(false);

            switch (oCssResult.ERRCD) {
                case "E01":  // JSON PARSE 오류

                    // [MSG] - JSON PARSE 오류!! 관리자에게 문의
                    var sErrMsg = "JSON PARSE 오류!! 관리자에게 문의";    

                    sap.m.MessageBox.error(sErrMsg);

                    break;
            
                case "E02": // 선택한 데이터 없음

                    // [MSG] - 선택한 데이터 없음!!
                    var sErrMsg = "선택한 데이터 없음";

                    sap.m.MessageToast.show(sErrMsg);

                    break;
            }

           
            return;
        }

        let sCssString = "";

        // 기 저장된 CSS 정보에서 CSS text만 추출
        let aSavedCssList = oCssResult.RDATA;
        let iListLength = aSavedCssList.length;

        for(var i = 0; i < iListLength; i++){

            let oCSS = aSavedCssList[i];

            if(i === iListLength - 1){
                sCssString += oCSS.text;
                break;
            }

            sCssString += oCSS.text + " ";

        }

        // 클립보드 복사
        oContr.fn.setClipboardCopy(sCssString);

        sap.m.MessageToast.show("Copy ClipBoard");

        oContr.fn.setBusy(false);

    }; // end of oContr.fn.setSelectedItemsCopyClipboard


    /*******************************************************
     * @function - 선택한 items 들을 clipboard 복사
     *******************************************************/
    oContr.fn.setCssApply = function(){

        oContr.fn.setBusy(true);

        // 기 저장된 CSS 정보를 구한다.
        let oCssResult = _getSavedCssList();
        if(oCssResult.RETCD === "E"){

            oContr.fn.setBusy(false);

            switch (oCssResult.ERRCD) {
                case "E01":  // JSON PARSE 오류

                    // [MSG] - JSON PARSE 오류!! 관리자에게 문의
                    var sErrMsg = "JSON PARSE 오류!! 관리자에게 문의";    

                    sap.m.MessageBox.error(sErrMsg);

                    break;
            
                case "E02": // 선택한 데이터 없음

                    // [MSG] - 선택한 데이터 없음!!
                    var sErrMsg = "선택한 데이터 없음";

                    sap.m.MessageToast.show(sErrMsg);

                    break;
            }

           
            return;
        }

        let aCssList = [];

        // 기 저장된 CSS 정보에서 CSS text만 추출
        let aSavedCssList = oCssResult.RDATA;
        for(const oCss of aSavedCssList){
            aCssList.push(oCss.text);
        }       


        // IF PARAM을 구성하여 미리보기 쪽에 전송
        let IF_PARAM = {
            PRCCD: "SAVE",
            DATA: aCssList
        };

        // 전송!!

        let sChennalId = `${oContr.IF_DATA.BROWSKEY}--if-ui5css`;

        parent.IPCRENDERER.send(sChennalId, IF_PARAM);


        sap.m.MessageToast.show("Apply");

        oContr.fn.setBusy(false);      

    }; // end of oContr.fn.setCssApply


    /*******************************************************
     * @function - 선택한 items 취소(닫기)
     *******************************************************/
    oContr.fn.setCssCancel = function(){

        // 여기서 현재 떠있는 창을 닫으면 부모의 beforeunload 이벤트에서
        // 미리보기 쪽에 닫았다는 파라미터 정보를 던지므로 여기선 그냥
        // 윈도우 창닫기 로직만 존재함.        
        let oREMOTE = parent.REMOTE;

        // CSS 팝업 메인 윈도우
        let oCURRWIN = oREMOTE.getCurrentWindow();

        oCURRWIN.close();

        sap.m.MessageToast.show("Cancel");

    }; // end of oContr.fn.setCssCancel

    /*******************************************************
     * @function - 클립보드 복사
     *******************************************************/
    oContr.fn.setClipboardCopy = function(sText){

        // String 형태만 복사
        if(typeof sText !== "string"){
            return;
        }

        var oTextArea = document.createElement("textarea");
        oTextArea.value = sText;
  
        document.body.appendChild(oTextArea);
  
        oTextArea.select();
  
        document.execCommand('copy');
  
        document.body.removeChild(oTextArea);

    }; // end of oContr.fn.setClipboardCopy
    
    /*******************************************************
     * @function - 자식창 전체 닫기
     *******************************************************/
    oContr.fn.clearAllChildWindow = function(){
        
        let oREMOTE = parent.REMOTE;

        // CSS 팝업 메인 윈도우
        let oCURRWIN = oREMOTE.getCurrentWindow();

        // CSS 팝업 메인 윈도우 자식 윈도우
        let aChildWindows = oCURRWIN.getChildWindows();
        if(!aChildWindows || Array.isArray(aChildWindows) === false || aChildWindows.length === 0){
            return;
        }

        for(const oChild of aChildWindows){

            if (oChild.isDestroyed()) {
                continue;
            }

            oChild.close();

        }

    }; // end of oContr.fn.clearAllChildWindow

    /*******************************************************
     * @function - 좌측 메뉴 선택 이벤트
     *******************************************************/
    oContr.fn.onListMenuSelectChange = async function(oEvent){

        oContr.fn.setBusy(true);            

        let oListItem = oEvent.getParameter("listItem");
        if(!oListItem){
            oContr.fn.setBusy(false);
            return;
        }

        let oCtx = oListItem.getBindingContext();
        if(!oCtx){
            oContr.fn.setBusy(false);
            return;
        }

        let oItemData = oCtx.getObject();        

        // 미리 보기 영역
        await oContr.fn.showPrevMenuItem(oItemData);

        // 브라우저 키
        let sBrowsKey = oContr.IF_DATA.BROWSKEY;

        // 자식 브라우저의 고유 키 조합(부모 Browser Key + 메뉴 Key)
        let sChildKey = sBrowsKey + oItemData.KEY;

        // 기존에 띄운 새창 중, 
        // 선택한 메뉴에 해당하는 새창이 있다면 
        // 해당 브라우저를 focus를 준다.

        let REMOTE = parent.REMOTE;

        oContr.fn.setFocusChildWindow(REMOTE, sChildKey);

    }; // end of oContr.fn.onListMenuSelectChange


    /*******************************************************
     * @function - 자식창 focus 주기
     *******************************************************/
    oContr.fn.setFocusChildWindow = function(oREMOTE, OBJTY){

        if(!oREMOTE || !OBJTY){
            return;
        }

        // CSS 팝업 메인 윈도우
        let oCURRWIN = oREMOTE.getCurrentWindow();

        // CSS 팝업 메인 윈도우 자식 윈도우
        let aChildWindows = oCURRWIN.getChildWindows();
        if(!aChildWindows || Array.isArray(aChildWindows) === false || aChildWindows.length === 0){
            return;
        }

        for(const oChild of aChildWindows){

            if (oChild.isDestroyed()) {
                continue;
            }

            let oWebCon = oChild.webContents,
                oWebPref = oWebCon.getWebPreferences(),
                sType = oWebPref.OBJTY;

            if(sType !== OBJTY){
                continue;
            }          
            
            return oChild.focus();

        }

    }; // end of oContr.fn.setFocusChildWindow


    /*******************************************************
     * @function - Other Css 버튼 이벤트
     *******************************************************/
    oContr.fn.onOtherCssGuideButton = function(oUi){

        let POPOVER1 = new sap.m.ResponsivePopover({
            contentWidth: "330px",
            // modal: true,
            showHeader: false,
            placement: "Top",
            // resizable: true,            
            afterClose: function(){
                POPOVER1.destroy();
            }
        });

        let TOOLBAR1 = new sap.m.OverflowToolbar();
        POPOVER1.setCustomHeader(TOOLBAR1);

        let ICON1 = new sap.ui.core.Icon({
            src: "sap-icon://sys-help",
            size: "20px"
        });
        TOOLBAR1.addContent(ICON1);

        ICON1.addStyleClass("sapUiTinyMarginEnd");        

        let TITLE1 = new sap.m.Title({
            text: "Other CSS Guides" // [MSG]
        });
        TOOLBAR1.addContent(TITLE1);

        TOOLBAR1.addContent(new sap.m.ToolbarSpacer());

        let BUTTON1 = new sap.m.Button({
            type: "Negative",
            icon: "sap-icon://decline",
            press: function(){
                POPOVER1.close();
            }
        });

        TOOLBAR1.addContent(BUTTON1);

        let LIST1 = new sap.m.List({
            mode: "SingleSelectMaster",
            items: {
                path: "/T_FMENU_LIST",
                template: new sap.m.StandardListItem({
                    title: "{TITLE}",
                    info: "{INFO}",                
                })
            },
            selectionChange: function(oEvent){
    
                oContr.fn.onOtherMenuSelectChange(oEvent);            
    
            }
    
        });

        POPOVER1.setInitialFocus(POPOVER1);        

        POPOVER1.setModel(oContr.oModel);        

        POPOVER1.addContent(LIST1);

        POPOVER1.openBy(oUi);

    }; // end of oContr.fn.onOtherCssGuideButton


    /*******************************************************
     * @function - Other Css 팝오버 메뉴의 선택 이벤트
     *******************************************************/
    oContr.fn.onOtherMenuSelectChange = function(oEvent){

        oContr.fn.setBusy(true);

        let oSelectedItem = oEvent.getParameter("listItem");
        if(!oSelectedItem){
            oContr.fn.setBusy(false);
            return;
        }

        // 선택한 메뉴 정보의 모델 컨텍스트
        let oCtx = oSelectedItem.getBindingContext();
        if(!oCtx){
            oContr.fn.setBusy(false);
            return;
        }

        // 선택한 메뉴 정보의 모델 데이터
        let oMenuData = oCtx.getObject();

        oContr.fn.openNewBrowserOthers(oMenuData);

        // oContr.fn.openNewBrowserMenu(oItemData);

    }; // end of oContr.fn.onOtherMenuSelectChange



/********************************************************************
*💨 EXPORT
*********************************************************************/
export { oContr };