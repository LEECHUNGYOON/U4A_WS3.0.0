const { contextBridge, ipcRenderer } = require("electron");	
	
//webview 에 load 된 영역에서 => preload 영역 아래 펑션을 호출 할수있음 !!!
contextBridge.exposeInMainWorld(
    "U4AEDU", {

        test: function(){

            let IF_DATA = {
                PRCCD: "TEST"
            }

            ipcRenderer.send("if-app-to-webview", JSON.stringify(IF_DATA));
            
        },

        // 로그오프
        logoff: function(){

            let IF_DATA = {
                PRCCD: "LOGOFF"
            }

            ipcRenderer.send("if-app-to-webview", JSON.stringify(IF_DATA));

        },

        // u4a workspace 에 파라미터 전송
        send_ws: function(oPARAM){

            let IF_DATA = {
                PRCCD: "SEND_WS",
                PARAM: oPARAM
            }

            ipcRenderer.send("if-app-to-webview", JSON.stringify(IF_DATA));

        },

        // 현재 프로그램 새창 열기
        new_browser: (oPARAM) => {

            let IF_DATA = {
                PRCCD: "NEW_BROWSER",
                PARAM: oPARAM
            }

            ipcRenderer.send("if-app-to-webview", JSON.stringify(IF_DATA));
          

        },

    }
);