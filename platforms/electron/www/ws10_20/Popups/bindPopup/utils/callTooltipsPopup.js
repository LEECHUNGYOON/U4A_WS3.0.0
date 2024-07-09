/*************************************************************
 * @module - tooltip 팝업 호출.
 *************************************************************/
module.exports = function(sArea, sCODE){

    oAPP.fn.setBusy(true);

    //도움말 html의 파일 경로 구성.
    var l_path = setHTMLPath(sArea, sCODE);
    if(!l_path){
        oAPP.fn.setBusy(false);
        return;
    }

    //도움말 html 팝업 title 구성.
    var l_title = setHTMLTitle(sCODE);
    

    var opt = {
        "height": 760,
        "width": 1260,
        "modal": false,
        "show": false,
        "opacity": 0.0,
        "minHeight":750,
        "minWidth":500,
        "icon": "www/img/logo.png",
        "title":l_title,
        "autoHideMenuBar": true,
        "parent": oAPP.REMOTE.getCurrentWindow(), 
        "webPreferences":{
            "devTools": true,
            "nodeIntegration": true,
            "contextIsolation": false,
            "nativeWindowOpen": true,
            "webSecurity": false
        }
       
    };

    
    var oWin = new oAPP.REMOTE.BrowserWindow(opt);

    oWin.setMenu(null);

    oWin.loadURL(l_path);
    oWin.webContents.on("did-finish-load", ()=> {
        oWin.show();
    });

    // 브라우저가 활성화 될 준비가 될때 타는 이벤트
    oWin.once("ready-to-show", () => {

        // 부모 위치 가운데 배치한다.
        setParentCenterBounds(oWin, opt);

    });

     // 브라우저가 오픈이 다 되면 타는 이벤트
     oWin.webContents.on("did-finish-load", function() {
        
        oAPP.fn.setBusy(false);

        oWin.show();

        // 윈도우 오픈할때 opacity를 이용하여 자연스러운 동작 연출
        oAPP.WSUTIL.setBrowserOpacity(oWin);

        // 부모 위치 가운데 배치한다.
        setParentCenterBounds(oWin, opt);

    });

};


//도움말 html 팝업 title 구성.
function setHTMLTitle(S_CODE){
        
    //207  Tooltips
    var l_txt = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "207");

    var l_stitle = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", S_CODE);

    return l_txt + " - " + l_stitle;


}   //도움말 html 팝업 title 구성.



//HTML PATH 구성.
function setHTMLPath(sArea, sCODE){

    var l_langu = oAPP.attr.GLANGU;

    //HTML파일 PATH 구성.
    var l_path = oAPP.PATH.join(oAPP.APP.getAppPath(), "ws10_20", "design", 
        "html", "helper", l_langu, "bindPopup", sArea, "index.html");

    //HTML 파일이 존재하지 않는경우 EXIT.
    if(oAPP.FS.existsSync(l_path) !== true){
        
        //199	툴팁 &1의  HTML 파일이 존재하지 않습니다.
        oAPP.fn.showErrorMessage( 
            oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "199", 
            oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", sCODE, "", "", "", ""), "", "", ""));

        return;
    }

    //파일이 존재하는경우 path return.
    return l_path;

}   //HTML PATH 구성.


/************************************************************************
 * 부모 윈도우 위치의 가운데 배치한다.
 ************************************************************************/
function setParentCenterBounds(oBrowserWindow, oBrowserOptions){
    
    let oCurrWin = oAPP.REMOTE.getCurrentWindow();

    // 팝업 위치를 부모 위치에 배치시킨다.
    var oParentBounds = oCurrWin.getBounds(),
        xPos = Math.round((oParentBounds.x + (oParentBounds.width / 2)) - (oBrowserOptions.width / 2)),
        yPos = Math.round((oParentBounds.y + (oParentBounds.height / 2)) - (oBrowserOptions.height / 2)),
        oWinScreen = window.screen,
        iAvailLeft = oWinScreen.availLeft;

    if (xPos < iAvailLeft) {
        xPos = iAvailLeft;
    }

    if (oParentBounds.y > yPos) {
        yPos = oParentBounds.y + 10;
    }

    oBrowserWindow.setBounds({
        x: xPos,
        y: yPos
    });


}