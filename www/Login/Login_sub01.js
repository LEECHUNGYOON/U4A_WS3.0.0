(function(window, $, oAPP) {
    "use strict";

    const
        REMOTE = parent.REMOTE,
        APPPATH = parent.APPPATH,
        PATH = parent.PATH,
        REGEDIT = parent.REGEDIT,
        APP = parent.APP,
        USERDATA = APP.getPath("userData"),
        FS = parent.FS,
        PATHINFO = parent.require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
        autoUpdater = REMOTE.require("electron-updater").autoUpdater,
        SERVPATH = parent.getServerPath(),
        autoUpdaterServerUrl = SERVPATH + "/update_check",
        OCTOKIT = REMOTE.require("@octokit/core").Octokit,
        require = parent.require;


    oAPP.fn.fnTrialLogin = () => {



        

    };



})(window, $, oAPP);