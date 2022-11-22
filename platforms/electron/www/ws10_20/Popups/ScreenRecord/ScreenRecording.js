/* ================================================================= */
// 설치 npm 
// npm install mime-types
/* ================================================================= */


/* ================================================================= */
// 사용 예시
/* 
    var ret = require(oAPP.path.join(__dirname, 'ScreenRecord/ScreenRecording.js'));
        ret.start(oAPP.remote);
                       
*/
/* ================================================================= */



/* ================================================================= */
/* 내부 펑션 
/* ================================================================= */



/* ================================================================= */
/* 글로벌 변수 
/* ================================================================= */

let goRecordPopup;


/* ================================================================= */
/* Export Module Function - 스크린 레코딩 시작
/* ================================================================= */
exports.start = async function(REMOTE){

    //예외처리: 한번 실행점검 

        if(goRecordPopup){            
            goRecordPopup.focus();
            return;
        }

        var op = {
            "height": screen.availHeight,
            "width": screen.availWidth,
            //"height": 500,
            //"width": 500,
            "resizable": false,
            "fullscreenable": true,
            "alwaysOnTop":true,
            "maximizable": false,
            "minimizable": false,
            "show":true,
            "transparent": true,
            "frame": false,
            "parent": REMOTE.getCurrentWindow(),

            "webPreferences":{
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule":true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true
            }        
    

        };



        //부모 디비깅 창 임시 닫기
        REMOTE.getCurrentWindow().closeDevTools();

        var oWIN = new REMOTE.BrowserWindow(op);
        oWIN.setMenuBarVisibility(false);

        var url = `file://${__dirname}/index.html`;
        oWIN.loadURL(url);
	    oWIN.webContents.on('did-finish-load', function () {
            oWIN.show();
            // oWIN.webContents.openDevTools();
        });

        oWIN.on("close", ()=>{
            //debugger;

            goRecordPopup = null;

        });

        goRecordPopup = oWIN;

        REMOTE.require('@electron/remote/main').enable(oWIN.webContents);


};



