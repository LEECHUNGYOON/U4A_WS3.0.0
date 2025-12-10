
const { CLBrowserPreview, BrowserPreviewStatusCode } = require("./lib/preview");

const { CLIpcHandler } = parent.require(parent.PATH.join(parent.PATHINFO.JS_ROOT, "utils", "ipc-handler"));

// module.exports = { CLBrowserPreview };


const IPC_HANDLER = new CLIpcHandler();


const BROWSER_MAP = new Map();


IPC_HANDLER.on("naviTo", (event, params) => {
	
	let scope = "browserPreview";

	console.log(`${scope} - on`, params);	
	
	debugger;
	
	
	

});

module.exports = function(oParams){


    debugger;
    
    let oPrev = new CLBrowserPreview(oParams);    

    BROWSER_MAP.set(oPrev.getId(), oPrev);


};


