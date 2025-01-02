
let oAPP = {
  fn: {},
  common: {},
//====================================================//
//[펑션] 스타트 
//====================================================//    
  onStart: ()=> {
    oAPP.remote = require('@electron/remote');
    oAPP.ipcRenderer = require('electron').ipcRenderer;
    oAPP.desktopCapturer = oAPP.remote.require('electron').desktopCapturer;
    oAPP.LOAD_THEME = "";

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- start
     *******************************************************/
    const
        REMOTE = oAPP.remote,
        PATH = REMOTE.require('path'),
        CURRWIN = REMOTE.getCurrentWindow(),
        WEBCON = CURRWIN.webContents,
        WEBPREF = WEBCON.getWebPreferences(),
        USERINFO = WEBPREF.USERINFO,
        APP = REMOTE.app,
        APPPATH = APP.getAppPath(),
        LANGU = USERINFO.LANGU,
        SYSID = USERINFO.SYSID;

    const
        WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
        WSUTIL = require(WSMSGPATH),
        WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

    oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

    /*******************************************************
     * 메시지클래스 텍스트 작업 관련 Object -- end
     *******************************************************/

    oAPP.IPCRENDERER = oAPP.ipcRenderer;
    oAPP.CURRWIN     = oAPP.remote.getCurrentWindow();
    oAPP.BROWSKEY    = oAPP.CURRWIN.webContents.getWebPreferences().browserkey;

    oAPP.USERINFO = USERINFO;

    //window 로딩 완료 이벤트 
    oAPP.ipcRenderer.on('IF-chkScrList', async (event, data) => {

      // 메인 화면 Busy 끄기
      oAPP.ipcRenderer.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" });

      // BroadCast를 통해서 다른 윈도우의 Busy 끄기
      oAPP.ipcRenderer.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "BROAD_BUSY", PRCCD: "BUSY_OFF" });
      
      oAPP.CURRWIN.closable = true;


      //WS3.0 로드된 테마명
      oAPP.LOAD_THEME = data.LOAD_THEME;
    
      //모니터(screen) 정보 기반으로 미리보기 화면 구성 
      await oAPP.onCreatePreview();       

    });

    // IPC Event 등록
    _attachIpcEvents();
    
  },

  //모니터(screen) 정보 기반으로 미리보기 화면 구성 
  onCreatePreview: async ()=>{
    return new Promise(async (RES, REJ) => {

      var oArea = document.getElementById("previewArea");

      oAPP.desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: screen.availWidth - 600, height: screen.availHeight - 300 } }).then(async sources => {

          //모니터(screen) 선택 이벤트
          function lfn_select(e){

              //이벤트 전파방지 
              if(e.stopPropagation){
                e.stopPropagation();
              }else{
                e.cancelBubble = true;
              }

              var IFDATA = {};
              IFDATA.SCREEN_ID  = e.currentTarget.getAttribute("_SCREEN_ID");
              IFDATA.DISPLAY_ID = e.currentTarget.getAttribute("_DISPLAY_ID");
              
              var oWin    = oAPP.remote.getCurrentWindow();
              var oParent = oWin.getParentWindow();
                  oParent.webContents.send("IF-chkScrList-SELECT", IFDATA);

                  oWin.close();

          }

          for (let i = 0; i < sources.length; i++) {
              var source = sources[i];

              var oLI = document.createElement("li");
                  oLI.className = "card";
        
              var oa1 = document.createElement("a");
                  oa1.className = "card-image";
                  oa1.href="javascript:void(0);";
                  oa1.target="";
                  oa1.setAttribute("_SCREEN_ID", source.id);
                  oa1.setAttribute("_DISPLAY_ID", source.display_id);
                  oa1.setAttribute("data-image-full", source.thumbnail.toDataURL());
                  oa1.onclick = lfn_select;
        
              var oIMG1 = document.createElement("img");
                  oIMG1.src = source.thumbnail.toDataURL();
                  oIMG1.setAttribute("_SCREEN_ID", source.id);
                  oIMG1.setAttribute("_DISPLAY_ID", source.display_id);
                  oIMG1.onclick = lfn_select;

                  oa1.appendChild(oIMG1);
                  oLI.appendChild(oa1);

                  oArea.appendChild(oLI);
        
          } //for (let i = 0; i < sources.length; i++) {
  
          //== 상위 Dom 기준으로 화면 기타 설정 
          var card_images = document.querySelectorAll('.card-image');
      
              // loop over each card image
              card_images.forEach(function(card_image) {

                var image_url = card_image.getAttribute('data-image-full');
                var content_image = card_image.querySelector('img');
                  
                    // change the src of the content image to load the new high res photo
                    content_image.src = image_url;
                  
                    // listen for load event when the new photo is finished loading
                    content_image.addEventListener('load', function() {
                      // swap out the visible background image with the new fully downloaded photo
                      card_image.style.backgroundImage = 'url(' + image_url + ')';
                      // add a class to remove the blur filter to smoothly transition the image change
                      card_image.className = card_image.className + ' is-loaded';

                    });
            
              });

      }); //oAPP.desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {

    });  //return new Promise(async (RES, REJ) => {

  }

}; //oAPP


/*************************************************************
 * @function - 테마 정보를 구한다.
 *************************************************************/
oAPP.fn.getThemeInfo = function (){

    // let oUserInfo = parent.process.USERINFO;
    let oUserInfo = oAPP.USERINFO;
    let sSysID = oUserInfo.SYSID;
    
    // 해당 SYSID별 테마 정보 JSON을 읽는다.
    let sThemeJsonPath = oAPP.PATH.join(oAPP.USERDATA, "p13n", "theme", `${sSysID}.json`);
    if(oAPP.FS.existsSync(sThemeJsonPath) === false){
        return;
    }

    let sThemeJson = oAPP.FS.readFileSync(sThemeJsonPath, "utf-8");

    try {
    
        var oThemeJsonData = JSON.parse(sThemeJson);    

    } catch (error) {
        return;
    }

    return oThemeJsonData;

} // end of oAPP.fn.getThemeInfo


oAPP.REMOTE = require('@electron/remote');
oAPP.IPCRENDERER = require('electron').ipcRenderer;
oAPP.IPCMAIN = oAPP.REMOTE.require('electron').ipcMain,
oAPP.PATH = oAPP.REMOTE.require('path');
oAPP.FS = oAPP.REMOTE.require('fs');
oAPP.APP = oAPP.REMOTE.app;
oAPP.USERDATA = oAPP.APP.getPath("userData");
// oAPP.USERINFO = USERINFO;


/*************************************************************
 * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
 *************************************************************/
function _onIpcMain_if_p13n_themeChange(){ 

    let oThemeInfo = oAPP.fn.getThemeInfo();
    if(!oThemeInfo){
        return;
    }

    let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
    let oBrowserWindow = oAPP.REMOTE.getCurrentWindow();
        oBrowserWindow.webContents.insertCSS(sWebConBodyCss);
        oBrowserWindow.setBackgroundColor(oThemeInfo.BGCOL);

    // sap.ui.getCore().applyTheme(oThemeInfo.THEME);

} // end of _onIpcMain_if_p13n_themeChange


/*************************************************************
 * @function - IPC Event 등록
 *************************************************************/
function _attachIpcEvents(){

    // let oUserInfo = parent.process.USERINFO;
    let oUserInfo = oAPP.USERINFO;
    let sSysID = oUserInfo.SYSID;

    // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
    oAPP.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

} // end of _attachIpcEvents



/* ================================================================= */
/* dom ready
/* ================================================================= */
document.addEventListener('DOMContentLoaded', ()=> {    

    oAPP.onStart();

});



/*
document.addEventListener('DOMContentLoaded', async () => {

    var oArea = document.getElementById("previewArea");
    
    var oLI = document.createElement("li");
    oLI.className = "card";

    var oa1 = document.createElement("a");
    oa1.className = "card-image";
    oa1.href="javascript:void(0);";
    oa1.target="";
    oa1.setAttribute("data-image-full", "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310408/lets-go-100.jpg");

    var oIMG1 = document.createElement("img");
    oIMG1.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/310408/lets-go-100.jpg";
    oa1.appendChild(oIMG1);
    oLI.appendChild(oa1);


    var oa2 = document.createElement("a");
    oa2.className = "card-description";
    oa2.href="javascript:void(0);";
    oa2.target="";

    var oH2 = document.createElement("H2");
    oH2.innerText = "해더";
    oa2.appendChild(oH2);

    var oP = document.createElement("P");
    oP.innerText = "내역";
    oa2.appendChild(oP);

    oLI.appendChild(oa2);

    oArea.appendChild(oLI);


    setTimeout(lazyLoad, 500);


});

*/

/*
function lazyLoad() {
	var card_images = document.querySelectorAll('.card-image');
	
	// loop over each card image
	card_images.forEach(function(card_image) {
		var image_url = card_image.getAttribute('data-image-full');
		var content_image = card_image.querySelector('img');
		
		// change the src of the content image to load the new high res photo
		content_image.src = image_url;
		
		// listen for load event when the new photo is finished loading
		content_image.addEventListener('load', function() {
			// swap out the visible background image with the new fully downloaded photo
			card_image.style.backgroundImage = 'url(' + image_url + ')';
			// add a class to remove the blur filter to smoothly transition the image change
			card_image.className = card_image.className + ' is-loaded';
		});
		
	});
	
}

*/

























