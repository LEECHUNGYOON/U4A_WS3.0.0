var REMOTE = require('@electron/remote'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    PATHINFOURL = PATH.join(APPPATH, "Frame", "pathInfo.js"),
    PATHINFO = require(PATHINFOURL);

module.exports = () => {

    let sSettingsJsonPath = PATHINFO.WSSETTINGS,
        oSettings = require(sSettingsJsonPath);

    return oSettings;

};