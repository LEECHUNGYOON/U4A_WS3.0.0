
const REMOTE = require('@electron/remote');
const FS = REMOTE.require("fs");
const PATH = REMOTE.require("path");
const PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js"));
const APP = REMOTE.app;


const { CLIpcHandler } = require(PATH.join(PATHINFO.JS_ROOT, "utils", "ipc-handler"));


module.exports = function (oParams){



};