
/****************************************************************************
 * 🔥 Global Variables
 ****************************************************************************/

    // 부모의 oAPP 상속
    var oAPP = parent.oAPP;

    // 오류 감지 객체
    var WSERR = parent.require(parent.PATHINFO.WSTRYCATCH);

    // 오류 감지 및 zconsole
    var zconsole = WSERR(window, document, console);


/****************************************************************************
 * 🔥 BootStrap Load
 ****************************************************************************/

    let oSettings = parent.WSUTIL.getWsSettingsInfo(),
        oSetting_UI5 = oSettings.UI5,
        oBootStrap = oSetting_UI5.bootstrap,
        oThemeInfo = oAPP.fn.getThemeInfo();
        
    let oUserInfo = parent.USERINFO;
    let sLangu = oUserInfo.LANGU;

    let oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";
    
    for (const key in oBootStrap) {
        oScript.setAttribute(key, oBootStrap[key]);
    }
    
    oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
    oScript.setAttribute("data-sap-ui-language", sLangu);
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.ui.layout, sap.ui.table");
    oScript.setAttribute("src", oSetting_UI5.resourceUrl);

    document.head.appendChild(oScript);


/****************************************************************************
 * 🔥 Private functions
 ****************************************************************************/


    /********************************************************************
     * @function - 랜덤 문자열 구성.
     ********************************************************************/
    function _getRandomValue(length = 8) {

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';

        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;

    } // end of _getRandomValue


    /***********************************************************************
     * @function - 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
     ***********************************************************************/
    function _setBroadCastBusy(){

        // 브라우저 닫는 시점에 busy가 켜있을 경우
        if(oAPP.fn.getBusy() === "X"){

            // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
            oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

            return;

        }

        if(typeof window?.sap?.m?.InstanceManager?.getOpenDialogs !== "function"){
            return;
        }

        // 현재 호출된 dialog 정보 얻기.
        var _aDialog = sap.m.InstanceManager.getOpenDialogs();

        //호출된 dialog가 없다면 exit.
        if(typeof _aDialog === "undefined" || _aDialog?.length === 0){
            return;
        }

        // 내가 띄운 MessageBox 가 있을 경우 Busy OFF
        if(_aDialog.findIndex( item => typeof item.getType === "function" && 
            item.getType() === "Message") !== -1){
            
            // 브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

            // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
            parent.IPCRENDERER.send(`if-send-action-${parent.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

        }

    } // end of _setBroadCastBusy


    /*************************************************************
     * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
     *************************************************************/
    function _onIpcMain_if_p13n_themeChange(){

        let oThemeInfo = oAPP.fn.getThemeInfo();
        if(!oThemeInfo){
            return;
        }

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        let oBrowserWindow = parent.REMOTE.getCurrentWindow();
            oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        sap.ui.getCore().applyTheme(oThemeInfo.THEME);

    } // end of _onIpcMain_if_p13n_themeChange


    /*************************************************************
     * @function - IPC Event 등록
     *************************************************************/
    function _attachIpcEvents(){

        let oUserInfo = parent.USERINFO;
        let sSysID = oUserInfo.SYSID;

        // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
        parent.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

    } // end of _attachIpcEvents


    /***********************************************************************
     * @function - BroadCast Event 걸기
     ***********************************************************************/
    function _attachBroadCastEvent(){

        oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${parent.BROWSKEY}`);        

        oAPP.broadToChild.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;

            if(typeof _PRCCD === "undefined"){
                return;
            }

            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":

                    //BUSY ON을 요청받은경우.
                    oAPP.fn.setBusy("X", { ISBROAD:true });
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    oAPP.fn.setBusy("",  { ISBROAD:true });
                    break;

                default:
                    break;
            }

        };

    } // end of _attachBroadCastEvent


/****************************************************************************
 * 🔥 Public functions
 ****************************************************************************/

    /********************************************************************
     * @function - Busy 켜기 끄기
     ********************************************************************
     * sOption
     * - 옵션에 ISBROAD 값이 있으면, 
     *   내 브라우저의 BroadCast onMessage 이벤트에서 Busy를 킨 것으로,
     *   그럴때는 나만 Busy 키고 다시 BrodCast의 PostMessage를 하지 않는다.
     *********************************************************************/
    oAPP.fn.setBusy = (isBusy, sOption) => {

        oAPP.attr.isBusy = isBusy;

        if (isBusy === "X") {

            // 화면 Lock 걸기
            sap.ui.getCore().lock();

            // 브라우저 창 닫기 버튼 비활성
            parent.CURRWIN.closable = false;

            sap.ui.core.BusyIndicator.show(0);      

        } else {

            // 브라우저 창 닫기 버튼 활성
            parent.CURRWIN.closable = true;

            sap.ui.core.BusyIndicator.hide();

            // 화면 Lock 해제
            sap.ui.getCore().unlock();

        }

        // var _ISBROAD = sOption?.ISBROAD || undefined;
        // if(typeof _ISBROAD !== "undefined"){
        //     return;
        // }

        // if(isBusy === "X"){

        //     oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});

        // } else {

        //     oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        // }
  
    }; // end of oAPP.fn.setBusy



/****************************************************************************
 * ⚡ window Events
 ****************************************************************************/
window.addEventListener("load", function(){

    // BroadCast Event 걸기
    _attachBroadCastEvent();

    // Events after UI5 CORE libraries have been loaded.
    sap.ui.getCore().attachInit(async () => {

        oAPP.fn.setBusy("X");

        // IPC Event 등록
        _attachIpcEvents();

        parent.CURRWIN.show();

        parent.CURRWIN.setOpacity(1);

        // parent.WSUTIL.setBrowserOpacity(parent.CURRWIN); 

        let sViewPath = parent.PATH.join(parent.__dirname, "views", "vw_main", "view.js");

        let oView = await import(sViewPath);

        oAPP.views.VW_MAIN = {};

        oAPP.views.VW_MAIN = oView.oContr;  


        let oMainAPP = oAPP.views.VW_MAIN.ui.APP;

        let oDelegate = {
            onAfterRendering: async function(){

                oMainAPP.removeEventDelegate(oDelegate);
                
                let oContentDom = document.getElementById("content");

                jQuery(oContentDom).fadeIn({ duration: 1500 });                

                await oAPP.views.VW_MAIN.onViewReady();

            }
        };


        oMainAPP.addEventDelegate(oDelegate);

        oMainAPP.placeAt("content");

    });

});


/************************************************************************
 * window 창 닫을때 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function() {

    // Busy가 실행 중이면 창을 닫지 않는다.
    if(oAPP.fn.getBusy() === "X"){
        return false;
    }

    // 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
    _setBroadCastBusy();

};