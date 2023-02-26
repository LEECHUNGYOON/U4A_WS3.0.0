/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs');
const path = require('path');
const {
    cordova
} = require('./package.json');
// Module to control application life, browser window and tray.
const {
    app,
    BrowserWindow,
    protocol,
    ipcMain,
    session
} = require('electron');

app.disableHardwareAcceleration();


// 참고 https://www.electronjs.org/docs/latest/api/command-line-switches
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('ignore-certificate-errors'); // https 인증서 오류 무시
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required'); // 오디오 자동실행 오류 정책 회피

// app.commandLine.appendSwitch('force_high_performance_gpu'); // gpu 사용

const remote = require('@electron/remote/main');
remote.initialize();

// Electron settings from .json file.
const cdvElectronSettings = require('./cdv-electron-settings.json');
const reservedScheme = require('./cdv-reserved-scheme.json');

const devTools = cdvElectronSettings.browserWindow.webPreferences.devTools ?
    require('electron-devtools-installer') :
    false;

const scheme = cdvElectronSettings.scheme;
const hostname = cdvElectronSettings.hostname;
const isFileProtocol = scheme === 'file';

/**
 * The base url path.
 * E.g:
 * When scheme is defined as "file" the base path is "file://path-to-the-app-root-directory"
 * When scheme is anything except "file", for example "app", the base path will be "app://localhost"
 *  The hostname "localhost" can be changed but only set when scheme is not "file"
 */
const basePath = (() => isFileProtocol ? `file://${__dirname}` : `${scheme}://${hostname}`)();

if (reservedScheme.includes(scheme)) throw new Error(`The scheme "${scheme}" can not be registered. Please use a non-reserved scheme.`);

if (!isFileProtocol) {
    protocol.registerSchemesAsPrivileged([{
        scheme,
        privileges: {
            standard: true,
            secure: true
        }
    }]);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// samesite 회피
function configureSession() {

    const filter = {
        urls: ["http://*/*", "https://*/*"]
    };

    session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {

        let cookies = (details.responseHeaders['set-cookie'] || []).map((cookie) => {

            if (cookie.indexOf("SameSite=OFF") > 0 || cookie.indexOf("SameSite=None") > 0) {
                return cookie;
            }

            let sCookie = cookie;

            sCookie = sCookie.replace('SameSite=Strict', 'SameSite=None');
            sCookie = sCookie.replace('SameSite=Lax', 'SameSite=None');

            return sCookie;

        });

        if (cookies.length > 0) {
            details.responseHeaders['set-cookie'] = cookies;
        }

        callback({
            cancel: false,
            responseHeaders: details.responseHeaders
        });

    });
}

function createWindow() {
    // Create the browser window.
    let appIcon;
    if (fs.existsSync(`${__dirname}/img/app.png`)) {
        appIcon = `${__dirname}/img/app.png`;
    } else if (fs.existsSync(`${__dirname}/img/icon.png`)) {
        appIcon = `${__dirname}/img/icon.png`;
    } else {
        appIcon = `${__dirname}/img/logo.png`;
    }

    const browserWindowOpts = Object.assign({}, cdvElectronSettings.browserWindow, {
        icon: appIcon,
        alwaysOnTop: true,
        transparent: true,
        show: false,
        frame: false,
        movable: true,
        resizable: false,
        width: 850,
        height: 500,
        minWidth: 850,
        minHeight: 500,
    });

    // browserWindowOpts.webPreferences.preload = path.join(app.getAppPath(), 'cdv-electron-preload.js');
    browserWindowOpts.webPreferences.contextIsolation = false;

    // samesite 회피
    configureSession();

    mainWindow = new BrowserWindow(browserWindowOpts);
    // mainWindow.webContents.setFrameRate(50);
    remote.enable(mainWindow.webContents);

    // Load a local HTML file or a remote URL.
    const cdvUrl = cdvElectronSettings.browserWindowInstance.loadURL.url;
    // const loadUrl = cdvUrl.includes('://') ? cdvUrl : `${basePath}/${cdvUrl}`;
    const loadUrlOpts = Object.assign({}, cdvElectronSettings.browserWindowInstance.loadURL.options);

    const loadUrl = `${__dirname}\\intro3.html`;
    mainWindow.loadURL(loadUrl, loadUrlOpts);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })

    // // Open the DevTools.  
    // if (!app.isPackaged) {
        // mainWindow.webContents.openDevTools();
    // }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

function configureProtocol() {
    protocol.registerFileProtocol(scheme, (request, cb) => {
        const url = request.url.substr(basePath.length + 1);
        cb({
            path: path.normalize(`${__dirname}/${url}`)
        });
    });

    protocol.interceptFileProtocol('file', (_, cb) => {
        cb(null);
    });
}


/**
 * single instance lock 요청
 * 
 * 프로그램을 한 프로세스만 켜지도록 만드는 작업.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
                mainWindow.show();
            }
            mainWindow.focus();
        }
    });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    if (!isFileProtocol) {
        configureProtocol();
    }

    if (devTools && cdvElectronSettings.devToolsExtension) {
        const extensions = cdvElectronSettings.devToolsExtension.map(id => devTools[id] || id);
        devTools.default(extensions) // default = install extension
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    }

    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        if (!isFileProtocol) {
            configureProtocol();
        }

        createWindow();
    }
});

ipcMain.handle('cdv-plugin-exec', async (_, serviceName, action, ...args) => {
    if (cordova && cordova.services && cordova.services[serviceName]) {
        const plugin = require(cordova.services[serviceName]);

        return plugin[action] ?
            plugin[action](args) :
            Promise.reject(new Error(`The action "${action}" for the requested plugin service "${serviceName}" does not exist.`));
    } else {
        return Promise.reject(new Error(`The requested plugin service "${serviceName}" does not exist have native support.`));
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.