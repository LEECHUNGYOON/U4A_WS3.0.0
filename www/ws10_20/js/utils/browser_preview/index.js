
const { CLBrowserPreview, BrowserPreviewStatusCode } = require("./lib/preview");

const { CLIpcHandler } = parent.require(parent.PATH.join(parent.PATHINFO.JS_ROOT, "utils", "ipc-handler"));

// module.exports = { CLBrowserPreview };


const IPC_HANDLER = new CLIpcHandler();


const BROWSER_MAP = new Map();


IPC_HANDLER.on("naviTo", (event, params) => {
	
	let scope = "browserPreview";

	console.log(`${scope} - on`, params);


    //#region ☝️ 선행 체크
    //#endregion
    /**
     * 선행 체크
     * 
     * 1. 같은 세션의 브라우저에서 왔는지?
     */
    
    // 화면 이동이 감지되면 전체 브라우저 미리보기 윈도우를 닫는다.
    BROWSER_MAP.forEach((oBrowser, id) => {

        if (oBrowser && typeof oBrowser.close === 'function') {
            oBrowser.close();
        }
    });

});

module.exports = async function(oParams){

    const oAPP = oParams.oAPP;
    
    
    let oPreview = new CLBrowserPreview(oParams.browserOptions);    

    oPreview.on('action', function(action){

        // 현재 실행 중인 페이지가 WS20번일 경우에만 동작!!!

        //#region ☝️ 선행 체크
        //#endregion
        /**
         * 선행 체크
         * 
         * 1. 현재 화면이 WS20번 인지 ?
         */

        console.log("브라우저 미리보기 액션", action);

        // oAPP.fn.setSelectTreeItem(action.OBJID, action.UIATK, null);

    });

    oPreview.on('close', function(){

        BROWSER_MAP.delete(oPreview.getId());

        console.log("브라우저 미리보기 닫힘!!");

    });

    oPreview.on('err', function(error){

        console.log("브라우저 미리보기 실행 중 오류 발생!!");

    });

    
    BROWSER_MAP.set(oPreview.getId(), oPreview);


    
    let oLaunchRes = await oPreview.launchPage();

    console.log("브라우저 미리보기 종료!!");

};



