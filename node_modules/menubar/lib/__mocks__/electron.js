"use strict";
// https://github.com/electron/electron/issues/3909#issuecomment-190990825
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tray = exports.BrowserWindow = exports.app = exports.MOCK_APP_GETAPPPATH = void 0;
exports.MOCK_APP_GETAPPPATH = 'mock.app.getAppPath';
exports.app = {
    getAppPath: jest.fn(function () { return exports.MOCK_APP_GETAPPPATH; }),
    isReady: function () { return Promise.resolve(); },
    on: function () {
        /* Do nothing */
    },
};
var BrowserWindow = /** @class */ (function () {
    function BrowserWindow() {
    }
    BrowserWindow.prototype.loadURL = function () {
        // Do nothing
    };
    BrowserWindow.prototype.on = function () {
        // Do nothing
    };
    BrowserWindow.prototype.setVisibleOnAllWorkspaces = function () {
        // Do nothing
    };
    return BrowserWindow;
}());
exports.BrowserWindow = BrowserWindow;
var Tray = /** @class */ (function () {
    function Tray() {
    }
    Tray.prototype.on = function () {
        // Do nothing
    };
    Tray.prototype.setToolTip = function () {
        // Do nothing
    };
    return Tray;
}());
exports.Tray = Tray;
