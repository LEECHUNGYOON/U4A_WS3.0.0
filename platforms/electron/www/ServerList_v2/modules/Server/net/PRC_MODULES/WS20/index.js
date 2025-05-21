const TY_RES = {
    PRCCD: "",      // 수행중인 프로세스 코드
    ACTCD: "",      // 수행중인 행위에 대한 코드
    RETCD: "",      // 수행 결과에 대한 코드
    STCOD: "",      // 수행 결과에 대한 상태 코드    
    RTMSG: "",      // 수행 결과에 대한 메시지 
    RDATA: "",      // 수행 결과에 대한 데이터
};

/****************************************************************************
 * 🔥 Remote / Modules
 ****************************************************************************/
    const REMOTE = require("@electron/remote");
    const APP = REMOTE.app;
    const PATH = require("path");
    const FS = require("fs");


    const IPCMAIN = REMOTE.require('electron').ipcMain;
    const IPCRENDERER = require('electron').ipcRenderer;

module.exports = async function(oStream, oIF_DATA){  

    // 응답 구조 복사
    let _oRES = JSON.parse(JSON.stringify(TY_RES));

    // PRCCD 코드 필수!!
    if(!oIF_DATA || !oIF_DATA?.PRCCD){
        return;
    }

    // _oRES.PRCCD = oIF_DATA.PRCCD;

    // // 연결 성공!!
    // _oRES.RETCD = "S";    

    // oStream.write(JSON.stringify(_oRES));
    
    // console.log("connect success!!");

    // var bb = REMOTE.BrowserWindow;
    // var ff = bb.getFocusedWindow();
    // if(!ff){

    //     console.log("포커스 윈도우 없음!!");
        
    //     return;
    // }

    // var ww = ff.webContents;

    // if(!ww){

    //     console.log("포커스 webContents 없음!!");
    //     return;
    // }


    // var cc = ww.getWebPreferences();

    // console.log(cc.OBJTY);

    

   




    // IPCRENDERER.send('if-ws20-get', oIF_DATA.PARAM);

    // IPCMAIN.on('if-ws20-set', function(oEvent, oRes){

    //     debugger;

    //     _oRES.PRCCD = oIF_DATA.PRCCD;

    //     oStream.write(JSON.stringify(_oRES));

    // });

    // IPCRENDERER.once('if-ws20-set', function(oEvent, oRes){

    //     console.log(`IPCRENDERER.once('if-ws20-get')`);

    //     debugger;

        

    //     oEvent.sender.send(oRes);


    // });


// bb = REMOTE.BrowserWindow
// ff = bb.getFocusedWindow()
// ff.webContents
// ww = ff.webContents
// ww.getWebPreferences()

    var oBrowserWindow;

    var aWins = REMOTE.BrowserWindow.getAllWindows();
    for(var oWin of aWins){

        var ww = oWin.webContents;

        var pp = ww.getWebPreferences();

        var sobjty = pp.OBJTY;
        if(sobjty === "MAIN"){

            oBrowserWindow = oWin;

            break;
        }

    }

    debugger;

    oBrowserWindow.webContents.send('if-ws20-get', oIF_DATA);

    oBrowserWindow.webContents.on("yoon", function(oEvent, oRes){

        debugger;        

    });    

    IPCRENDERER.on("yoon", function(oEvent, oRes){

        debugger;        

    });

    IPCMAIN.on('yoon', function(oEvent, oRes){

        debugger;

    });


};