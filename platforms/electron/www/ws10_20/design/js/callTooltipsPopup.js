(function(){

    /************************************************************************
    * 도움말 팝업 호출.
    * **********************************************************************
    * @param {object} oUi - 도움말 팝업 선택 UI instance.
    * @param {string} sArea - 도움말 HTML 문서명.
    * @param {string} sCODE - 도움말 팝업 title의 text element
    ************************************************************************/
    oAPP.fn.callTooltipsPopup = function(oUi, sArea, sCODE){

        //팝업 호출 ui가 존재하지 않는경우 exit.
        if(!oUi){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //도움말 html의 파일 경로 구성.
        var l_path = lf_setHTMLPath(sArea, sCODE);
        if(!l_path){
            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

            return;
        }

        //도움말 html 팝업 title 구성.
        var l_title = lf_setHTMLTitle(sCODE);
        

        var opt = {
            "height": 760,
            "width": 800,
            "modal": false,
            "show": false,
            "opacity": 0.0,
            "minHeight":750,
            "minWidth":500,
            "icon": "www/img/logo.png",
            "title":l_title,
            "autoHideMenuBar": true,
            "parent": parent.REMOTE.getCurrentWindow(), 
            "webPreferences":{
                "devTools": true,
                "nodeIntegration": true,
                "contextIsolation": false,
                "nativeWindowOpen": true,
                "webSecurity": false
            }
           
        };

        
        var oWin = new parent.REMOTE.BrowserWindow(opt);

        oWin.setMenu(null);

        oWin.loadURL(l_path);
        // oWin.webContents.on("did-finish-load", ()=> {
        //     oWin.show();
        // });

        // 브라우저가 활성화 될 준비가 될때 타는 이벤트
        oWin.once("ready-to-show", () => {

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oWin, opt);

        });
        

        // 브라우저가 오픈이 다 되면 타는 이벤트
        oWin.webContents.on("did-finish-load", function() {
            
            oWin.show();

            // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
            parent.WSUTIL.setBrowserOpacity(oWin);

            // 부모 위치 가운데 배치한다.
            oAPP.fn.setParentCenterBounds(oWin, opt);

            //단축키 잠금 해제처리.
            oAPP.fn.setShortcutLock(false);

            parent.setBusy("");

        });


    };  //도움말 팝업 호출.



    //HTML PATH 구성.
    function lf_setHTMLPath(sArea, sCODE){

        var l_langu = parent.getUserInfo().LANGU;

        //HTML파일 PATH 구성.
        var l_path = parent.PATH.join(parent.REMOTE.app.getAppPath(), "ws10_20", "design", 
            "html", "helper", l_langu, sArea, "index.html");

        //HTML 파일이 존재하지 않는경우 EXIT.
        if(parent.FS.existsSync(l_path) !== true){
            
            //377  &1 tooltips HTML file does not exist.
            parent.showMessage(sap, 10, "E", 
                oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "377", 
                oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", sCODE, "", "", "", ""), "", "", ""));

            return;
        }

        //파일이 존재하는경우 path return.
        return l_path;

    }   //HTML PATH 구성.



    //도움말 html 팝업 title 구성.
    function lf_setHTMLTitle(S_CODE){
        
        //E20  Tooltips
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E20", "", "", "", "");

        var l_stitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", S_CODE, "", "", "", "");

        return l_txt + " - " + l_stitle;


    }   //도움말 html 팝업 title 구성.

})();