(function(window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APP = REMOTE.app,
        PATH = REMOTE.require('path'),
        APPPATH = APP.getAppPath(),
        USERDATA = APP.getPath("userData"),
        FS = parent.FS,
        APPCOMMON = oAPP.common;

    const C_AddEventSuggMaxLength = 10;

    oAPP.fn.fnAddEventSuggSave = (sEventName) => {
        
       
        let sJsonPath = parent.getPath("EVENTSUGG"),
            sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
            oSuggData = JSON.parse(sJsonData);

        if (typeof oSuggData !== "object") {
            oSuggData = {};
        }


    };

    oAPP.fn.fnSuggDataSave = (sName, oData) => {


        

    };

})(window, $, oAPP);