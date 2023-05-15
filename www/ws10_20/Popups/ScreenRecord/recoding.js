let oAPP = null;

oAPP = {
    common: {},
    //====================================================//
    //[펑션] 스타트 
    //====================================================//    
    onStart: () => {
        oAPP.remote = require('@electron/remote');
        oAPP.ipcRenderer = require('electron').ipcRenderer;
        oAPP.fs = oAPP.remote.require('fs');
        oAPP.path = oAPP.remote.require('path');
        oAPP.WIN = oAPP.remote.getCurrentWindow();
        oAPP.desktopCapturer = oAPP.remote.require('electron').desktopCapturer;
        oAPP.SCREEN_ID = "";
        oAPP.FILE_PATH = ""; //저장 파일 경로 + 파일명

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- start
         *******************************************************/
        const
            REMOTE = oAPP.remote,
            PATH = REMOTE.require('path'),
            CURRWIN = REMOTE.getCurrentWindow(),
            WEBCON = CURRWIN.webContents,
            WEBPREF = WEBCON.getWebPreferences(),
            USERINFO = WEBPREF.USERINFO,
            APP = REMOTE.app,
            APPPATH = APP.getAppPath(),
            LANGU = USERINFO.LANGU,
            SYSID = USERINFO.SYSID;

        const
            WSMSGPATH = PATH.join(APPPATH, "ws10_20", "js", "ws_util.js"),
            WSUTIL = require(WSMSGPATH),
            WSMSG = new WSUTIL.MessageClassText(SYSID, LANGU);

        oAPP.common.fnGetMsgClsText = WSMSG.fnGetMsgClsText.bind(WSMSG);

        /*******************************************************
         * 메시지클래스 텍스트 작업 관련 Object -- end
         *******************************************************/

        //window 로딩 완료 이벤트 
        oAPP.ipcRenderer.on('IF-REC-READY', async (event, data) => {
            //oAPP.WIN.webContents.openDevTools();
            //사용자 선택 모니터(Screen) ID
            oAPP.SCREEN_ID = data.SCREEN_ID;

            //초기값 설정 
            oAPP.onInitData();

            //레코딩 액티브 표시 화면 호출
            oAPP.onRecordActive();

            //레코딩 콘트롤러 팝업 호출 
            oAPP.onControllerOpen();

        });

    },

    //====================================================//
    //[펑션] 레코딩 액티브 표시 화면 호출
    //====================================================//   
    onRecordActive: () => {


        let mainWIN = oAPP.remote.getCurrentWindow();
        var sBound = mainWIN.getBounds();
        sBound = JSON.parse(JSON.stringify(sBound));

        let X = sBound.x + screen.availWidth / 2;


        // 컨트롤러 윈도우 
        var op = {
            "x": X,
            "y": sBound.y,
            "height": 100,
            "width": 100,
            "resizable": false,
            "alwaysOnTop": true,
            "maximizable": false,
            "minimizable": false,
            "show": false,
            "transparent": true,
            "frame": false,
            "icon": "www/img/logo.png",
            // "parent": oAPP.remote.getCurrentWindow(),
            "webPreferences": {
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
                "USERINFO" : process.USERINFO
            }

        };

        var oWIN = new oAPP.remote.BrowserWindow(op);
        oWIN.setMenuBarVisibility(false);

        var url = `file://${__dirname}/RecordActive.html`;
        oWIN.loadURL(url);
        oWIN.webContents.on('did-finish-load', function () {
            oWIN.show();

        });


    },

    //====================================================//
    //[펑션] 레코딩 콘트롤러 팝업 호출 
    //====================================================//   
    onControllerOpen: () => {

        //oAPP.remote.getCurrentWindow().closeDevTools();

        // (컨트롤러 통신 => 비디오 레코딩) 통신 세션 ID 생성 
        oAPP.SSID = "IF-CONTROLLER-" + oAPP.onRandom(20);


        // (컨트롤러 통신 => 비디오 레코딩) IPC 이벤트 핸들러 설정
        oAPP.ipcRenderer.on(oAPP.SSID, oAPP.onIPC_Controller);

        //let mainWIN = oAPP.remote.getCurrentWindow();
        //var sBound = mainWIN.getBounds();

        // 컨트롤러 윈도우 
        var op = {
            //"x": sBound.x,
            //"y": sBound.y, 
            "icon": "www/img/logo.png",
            "title": oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C38", "", "", "", ""), // Controller     
            "height": 280,
            "width": 260,
            "maxHeight": 280,
            "maxWidth": 260,
            "resizable": true,
            "fullscreenable": true,
            "alwaysOnTop": true,
            "maximizable": false,
            "minimizable": false,
            "show": true,
            // "transparent": false,
            "frame": true,
            "parent": oAPP.remote.getCurrentWindow(),
            "webPreferences": {
                "devTools": true,
                "nodeIntegration": true,
                "enableRemoteModule": true,
                "contextIsolation": false,
                "webSecurity": false,
                "nativeWindowOpen": true,
                "USERINFO" : process.USERINFO
            }

        };

        var oWIN = new oAPP.remote.BrowserWindow(op);
        oWIN.setMenuBarVisibility(false);

        var url = `file://${__dirname}/controller.html`;
        oWIN.loadURL(url);
        oWIN.webContents.on('did-finish-load', function () {
            oWIN.show();
            oWIN.webContents.send('IF-REC-CONTROLLER', {
                SSID: oAPP.SSID
            });
            //oWIN.webContents.openDevTools();

        });


        //컨트롤러 윈도우 종료 이벤트시
        oWIN.on("close", () => {            

            let oCurrWin = oAPP.remote.getCurrentWindow(),
                oParentWindow = oCurrWin.getParentWindow();

            oParentWindow.focus();

            //레코딩 저장 파일명이 존재시
            if (typeof oAPP.FILE_PATH !== "") {

                if (oAPP.fs.existsSync(oAPP.FILE_PATH)) {

                    oAPP.remote.shell.beep();
                    //등록 저장위치 폴더 실행
                    //oAPP.remote.shell.openPath(oAPP.saveDirectory);
                    oAPP.remote.shell.showItemInFolder(oAPP.FILE_PATH);

                }

            }

            // (컨트롤러 통신 => 비디오 레코딩) IPC 이벤트 제거 
            oAPP.ipcRenderer.removeListener(oAPP.SSID, oAPP.onIPC_Controller);

            // 현재 윈도우 종료
            oAPP.remote.getCurrentWindow().close();

        });

        //electron 자원 할당 
        oAPP.remote.require('@electron/remote/main').enable(oWIN.webContents);

    },

    //====================================================//
    //[펑션]  (콘트롤러 => 레코딩) IPC 통신 이벤트 Callback  
    //====================================================//   
    onIPC_Controller: (event, data) => {

        switch (data.ACTCD) {
            case "01":
                //★ 레코딩 시작 
                oAPP.WIN.setOpacity(0);
                oAPP.onRecordStart();

                break;


            case "02":
                //★ 레코딩 종료
                oAPP.WIN.setOpacity(0);

                //드로잉 초기화 
                if (typeof oAPP.signaturePad !== "undefined") {
                    oAPP.signaturePad.clear();
                }

                //드로잉 패드 숨김처리 
                document.getElementById("SIGN_CTNR").className = "signature-on";

                //레코딩 STOP
                oAPP.onRecordStop();

                break;


            case "03":
                //★ 드로잉 설정

                //sing 라이브러리 로딩
                oAPP.onSignaturePad();

                const {
                    desktopCapturer
                } = oAPP.remote.require('electron');

                desktopCapturer.getSources({
                    types: ['screen'],
                    thumbnailSize: {
                        width: screen.availWidth,
                        height: screen.availHeight
                    }
                }).then(sources => {

                    let source = undefined;

                    //모니터 스크린 찾기 
                    for (let i = 0; i < sources.length; i++) {
                        source = sources[i];
                        if (source.id === oAPP.SCREEN_ID) {
                            break;

                        }

                    }

                    /*
                    nativeImage = oAPP.remote.require('electron').nativeImage;
                    var imgR = nativeImage.createFromDataURL(source.thumbnail.toDataURL());
                        imgR.resize({quality:"bette"});
                    */

                    document.body.style.backgroundImage = "url('" + source.thumbnail.toDataURL() + "')";
                    document.getElementById("SIGN_CTNR").className = "signature-on";

                    let Lopacity = 0;
                    let oInterval = setInterval(() => {
                        Lopacity = Lopacity + 1;
                        oAPP.WIN.setOpacity(Lopacity);

                        if (Lopacity >= 1) {
                            clearInterval(oInterval);
                            oInterval = null;
                        }

                    }, 100);

                });

                break;


            case "04":
                //★ 드로잉 해제
                debugger;
                oAPP.WIN.setOpacity(0);
                document.getElementById("SIGN_CTNR").className = "signature-off";

                //드로잉 초기화 
                if (typeof oAPP.signaturePad !== "undefined") {
                    oAPP.signaturePad.clear();
                }

                break;



            case "05":
                //★ 드로잉 초기화 
                if (typeof oAPP.signaturePad !== "undefined") {
                    oAPP.signaturePad.clear();
                }

                break;

        }

    },


    //====================================================//
    //[펑션] 초기 값 설정 
    //====================================================// 
    onInitData: () => {

        //동영상 저장 폴더 경로 설정 
        oAPP.saveDirectory = oAPP.path.join(process.env.APPDATA, oAPP.remote.app.name, "video");

        //저장 PC 폴더 생성 
        if (!oAPP.fs.existsSync(oAPP.saveDirectory)) {
            oAPP.fs.mkdirSync(oAPP.saveDirectory);

        }

    },


    //====================================================//
    //[펑션] 레코딩 시작 
    //====================================================// 
    onRecordStart: async () => {

        //드로잉 설정해제 
        setTimeout(() => {
            document.getElementById("SIGN_CTNR").className = "signature-off";
        }, 0);

        //미디어 스트림 객체 생성 
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: oAPP.SCREEN_ID,
                        minWidth: 600,
                        maxWidth: screen.availWidth - 200,
                        minHeight: 500,
                        maxHeight: screen.availHeight - 100
                    }
                }
            });

            _onHandleStream(stream);

        } catch (e) {
            _onHandleError(e);
        }

        //미디어 오류 
        function _onHandleError(e) {

            var EMSG = e.toString();
            console.error("동영상 수행 오류 => " + EMSG);

            let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D39", "", "", "", ""); // Video Recording Error

            var oMsgPop = oAPP.remote.dialog.showMessageBox(oAPP.remote.getCurrentWindow(), {
                    title: sTitle,
                    type: 'error',
                    defaultId: 1,
                    message: sTitle + " ==> " + EMSG,
                    buttons: ["close"],
                })
                .then((e) => {
                    window.close();

                });

        }

        //미디어 스트림
        async function _onHandleStream(stream) {

            //저장처리 파일명 구성  
            var fileName = oAPP.onRandom(20) + "_" + oAPP.onDateTime() + ".mp4";
            //var fileName = oAPP.onRandom(20) + "_" +oAPP.onDateTime() + ".webm";

            oAPP.FILE_PATH = oAPP.path.join(oAPP.saveDirectory, fileName);

            //비디오 레코딩 객체 생성
            oAPP.REC = new MediaRecorder(stream);

            //비디오 레코딩 시작
            oAPP.REC.addEventListener("dataavailable", async (e) => {

                oAPP.fs.appendFile(oAPP.FILE_PATH, Buffer.from(await e.data.arrayBuffer()), function (err) {
                    if (err) {
                        return;
                    };
                    zconsole.log('Saved!');
                });

            });

            //비디오 레코딩 스톱
            oAPP.REC.addEventListener("stop", async (e) => {


            });

            //레코딩 시작 
            oAPP.REC.start(3000);

        }


    },

    //====================================================//
    //[펑션] 레코딩 종료 
    //====================================================// 
    onRecordStop: () => {

        //레코딩 다운 종료 
        if(oAPP.REC && oAPP.REC.stop){
            oAPP.REC.stop();
        }

        // oAPP.REC.stop();
        delete oAPP.REC;

        //드로잉 설정해제 
        setTimeout(() => {
            document.getElementById("SIGN_CTNR").className = "signature-off";
        }, 0);

        //드로잉 값 초기화 
        if (typeof oAPP.signaturePad !== "undefined") {
            oAPP.signaturePad.clear();
        }


        //등록 저장위치 폴더 실행
        //   oAPP.remote.shell.openPath(oAPP.saveDirectory);
        oAPP.remote.shell.showItemInFolder(oAPP.FILE_PATH);

    },


    //================================================= //
    //  랜덤키 생성  //
    //================================================= //
    onRandom: (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';

        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;

    },

    //================================================= //
    // 현재 날짜 시간 
    //================================================= //
    onDateTime: () => {

        let today = new Date();
        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1; // 월
        let date = today.getDate(); // 날짜

        let hours = today.getHours(); // 시
        let minutes = today.getMinutes(); // 분
        let seconds = today.getSeconds(); // 초

        return year.toString() + month.toString() + date.toString() + "_" + hours.toString() + minutes.toString() + seconds.toString();

    },

    //================================================= //
    // Window 서명패드 
    //================================================= //
    onSignaturePad: () => {

        if (typeof oAPP.signaturePad !== "undefined") {
            return;
        }

        //드로잉 영역(canvas) 화면 전체 size 설정 
        var oSIGN = document.getElementById("signature-pad");
        oSIGN.setAttribute("width", screen.availWidth);
        oSIGN.setAttribute("height", screen.availHeight);

        var SignaturePad = (function (document) {
            "use strict";

            var log = console.log.bind(console);

            var SignaturePad = function (canvas, options) {
                var self = this,
                    opts = options || {};

                this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
                this.minWidth = opts.minWidth || 0.5;
                this.maxWidth = opts.maxWidth || 2.5;
                this.dotSize = opts.dotSize || function () {
                    return (self.minWidth + self.maxWidth) / 2;
                };
                this.penColor = opts.penColor || "black";
                this.backgroundColor = opts.backgroundColor || "rgba(0,0,0,0)";
                this.throttle = opts.throttle || 0;
                this.throttleOptions = {
                    leading: true,
                    trailing: true
                };
                this.minPointDistance = opts.minPointDistance || 0;
                this.onEnd = opts.onEnd;
                this.onBegin = opts.onBegin;

                this._canvas = canvas;
                this._ctx = canvas.getContext("2d");
                this._ctx.lineCap = 'round';
                this.clear();

                // we need add these inline so they are available to unbind while still having
                //  access to 'self' we could use _.bind but it's not worth adding a dependency
                this._handleMouseDown = function (event) {
                    if (event.which === 1) {
                        self._mouseButtonDown = true;
                        self._strokeBegin(event);
                    }
                };

                var _handleMouseMove = function (event) {
                    event.preventDefault();
                    if (self._mouseButtonDown) {
                        self._strokeUpdate(event);
                        if (self.arePointsDisplayed) {
                            var point = self._createPoint(event);
                            self._drawMark(point.x, point.y, 5);
                        }
                    }
                };

                this._handleMouseMove = _.throttle(_handleMouseMove, self.throttle, self.throttleOptions);
                //this._handleMouseMove = _handleMouseMove;

                this._handleMouseUp = function (event) {
                    if (event.which === 1 && self._mouseButtonDown) {
                        self._mouseButtonDown = false;
                        self._strokeEnd(event);
                    }
                };

                this._handleTouchStart = function (event) {
                    if (event.targetTouches.length == 1) {
                        var touch = event.changedTouches[0];
                        self._strokeBegin(touch);
                    }
                };

                var _handleTouchMove = function (event) {
                    // Prevent scrolling.
                    event.preventDefault();

                    var touch = event.targetTouches[0];
                    self._strokeUpdate(touch);
                    if (self.arePointsDisplayed) {
                        var point = self._createPoint(touch);
                        self._drawMark(point.x, point.y, 5);
                    }
                };
                this._handleTouchMove = _.throttle(_handleTouchMove, self.throttle, self.throttleOptions);
                //this._handleTouchMove = _handleTouchMove;

                this._handleTouchEnd = function (event) {
                    var wasCanvasTouched = event.target === self._canvas;
                    if (wasCanvasTouched) {
                        event.preventDefault();
                        self._strokeEnd(event);
                    }
                };

                this._handleMouseEvents();
                this._handleTouchEvents();
            };

            SignaturePad.prototype.clear = function () {
                var ctx = this._ctx,
                    canvas = this._canvas;

                ctx.fillStyle = this.backgroundColor;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                this._reset();
            };

            SignaturePad.prototype.showPointsToggle = function () {
                this.arePointsDisplayed = !this.arePointsDisplayed;
            };

            SignaturePad.prototype.toDataURL = function (imageType, quality) {
                var canvas = this._canvas;
                return canvas.toDataURL.apply(canvas, arguments);
            };

            SignaturePad.prototype.fromDataURL = function (dataUrl) {
                var self = this,
                    image = new Image(),
                    ratio = window.devicePixelRatio || 1,
                    width = this._canvas.width / ratio,
                    height = this._canvas.height / ratio;

                this._reset();
                image.src = dataUrl;
                image.onload = function () {
                    self._ctx.drawImage(image, 0, 0, width, height);
                };
                this._isEmpty = false;
            };

            SignaturePad.prototype._strokeUpdate = function (event) {
                var point = this._createPoint(event);
                if (this._isPointToBeUsed(point)) {
                    this._addPoint(point);
                }
            };

            var pointsSkippedFromBeingAdded = 0;
            SignaturePad.prototype._isPointToBeUsed = function (point) {
                // Simplifying, De-noise
                if (!this.minPointDistance)
                    return true;

                var points = this.points;
                if (points && points.length) {
                    var lastPoint = points[points.length - 1];
                    if (point.distanceTo(lastPoint) < this.minPointDistance) {
                        // log(++pointsSkippedFromBeingAdded);
                        return false;
                    }
                }
                return true;
            };

            SignaturePad.prototype._strokeBegin = function (event) {
                this._reset();
                this._strokeUpdate(event);
                if (typeof this.onBegin === 'function') {
                    this.onBegin(event);
                }
            };

            SignaturePad.prototype._strokeDraw = function (point) {
                var ctx = this._ctx,
                    dotSize = typeof (this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

                ctx.beginPath();
                this._drawPoint(point.x, point.y, dotSize);
                ctx.closePath();
                ctx.fill();
            };

            SignaturePad.prototype._strokeEnd = function (event) {
                var canDrawCurve = this.points.length > 2,
                    point = this.points[0];

                if (!canDrawCurve && point) {
                    this._strokeDraw(point);
                }
                if (typeof this.onEnd === 'function') {
                    this.onEnd(event);
                }
            };

            SignaturePad.prototype._handleMouseEvents = function () {
                this._mouseButtonDown = false;

                this._canvas.addEventListener("mousedown", this._handleMouseDown);
                this._canvas.addEventListener("mousemove", this._handleMouseMove);
                document.addEventListener("mouseup", this._handleMouseUp);
            };

            SignaturePad.prototype._handleTouchEvents = function () {
                // Pass touch events to canvas element on mobile IE11 and Edge.
                this._canvas.style.msTouchAction = 'none';
                this._canvas.style.touchAction = 'none';

                this._canvas.addEventListener("touchstart", this._handleTouchStart);
                this._canvas.addEventListener("touchmove", this._handleTouchMove);
                this._canvas.addEventListener("touchend", this._handleTouchEnd);
            };

            SignaturePad.prototype.on = function () {
                this._handleMouseEvents();
                this._handleTouchEvents();
            };

            SignaturePad.prototype.off = function () {
                this._canvas.removeEventListener("mousedown", this._handleMouseDown);
                this._canvas.removeEventListener("mousemove", this._handleMouseMove);
                document.removeEventListener("mouseup", this._handleMouseUp);

                this._canvas.removeEventListener("touchstart", this._handleTouchStart);
                this._canvas.removeEventListener("touchmove", this._handleTouchMove);
                this._canvas.removeEventListener("touchend", this._handleTouchEnd);
            };

            SignaturePad.prototype.isEmpty = function () {
                return this._isEmpty;
            };

            SignaturePad.prototype._reset = function () {
                this.points = [];
                this._lastVelocity = 0;
                this._lastWidth = (this.minWidth + this.maxWidth) / 2;
                this._isEmpty = true;
                this._ctx.fillStyle = this.penColor;
            };

            SignaturePad.prototype._createPoint = function (event) {
                var rect = this._canvas.getBoundingClientRect();
                return new Point(
                    event.clientX - rect.left,
                    event.clientY - rect.top
                );
            };

            SignaturePad.prototype._addPoint = function (point) {
                var points = this.points,
                    c2, c3,
                    curve, tmp;

                points.push(point);

                if (points.length > 2) {
                    // To reduce the initial lag make it work with 3 points
                    // by copying the first point to the beginning.
                    if (points.length === 3) points.unshift(points[0]);

                    tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
                    c2 = tmp.c2;
                    tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
                    c3 = tmp.c1;
                    curve = new Bezier(points[1], c2, c3, points[2]);
                    this._addCurve(curve);

                    // Remove the first element from the list,
                    // so that we always have no more than 4 points in points array.
                    points.shift();
                }
            };

            SignaturePad.prototype._calculateCurveControlPoints = function (s1, s2, s3) {
                var dx1 = s1.x - s2.x,
                    dy1 = s1.y - s2.y,
                    dx2 = s2.x - s3.x,
                    dy2 = s2.y - s3.y,

                    m1 = {
                        x: (s1.x + s2.x) / 2.0,
                        y: (s1.y + s2.y) / 2.0
                    },
                    m2 = {
                        x: (s2.x + s3.x) / 2.0,
                        y: (s2.y + s3.y) / 2.0
                    },

                    l1 = Math.sqrt(1.0 * dx1 * dx1 + dy1 * dy1),
                    l2 = Math.sqrt(1.0 * dx2 * dx2 + dy2 * dy2),

                    dxm = (m1.x - m2.x),
                    dym = (m1.y - m2.y),

                    k = l2 / (l1 + l2),
                    cm = {
                        x: m2.x + dxm * k,
                        y: m2.y + dym * k
                    },

                    tx = s2.x - cm.x,
                    ty = s2.y - cm.y;

                return {
                    c1: new Point(m1.x + tx, m1.y + ty),
                    c2: new Point(m2.x + tx, m2.y + ty)
                };
            };

            SignaturePad.prototype._addCurve = function (curve) {
                var startPoint = curve.startPoint,
                    endPoint = curve.endPoint,
                    velocity, newWidth;

                velocity = endPoint.velocityFrom(startPoint);
                velocity = this.velocityFilterWeight * velocity +
                    (1 - this.velocityFilterWeight) * this._lastVelocity;

                newWidth = this._strokeWidth(velocity);
                this._drawCurve(curve, this._lastWidth, newWidth);

                this._lastVelocity = velocity;
                this._lastWidth = newWidth;
            };

            SignaturePad.prototype._drawPoint = function (x, y, size) {
                var ctx = this._ctx;

                ctx.moveTo(x, y);
                ctx.arc(x, y, size, 0, 2 * Math.PI, false);
                this._isEmpty = false;
            };

            SignaturePad.prototype._drawMark = function (x, y, size) {
                var ctx = this._ctx;

                ctx.save();
                ctx.moveTo(x, y);
                ctx.arc(x, y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.fill();
                ctx.restore();
            };

            SignaturePad.prototype._drawCurve = function (curve, startWidth, endWidth) {
                var ctx = this._ctx,
                    widthDelta = endWidth - startWidth,
                    drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

                drawSteps = Math.floor(curve.length());
                ctx.beginPath();
                for (i = 0; i < drawSteps; i++) {
                    // Calculate the Bezier (x, y) coordinate for this step.
                    t = i / drawSteps;
                    tt = t * t;
                    ttt = tt * t;
                    u = 1 - t;
                    uu = u * u;
                    uuu = uu * u;

                    x = uuu * curve.startPoint.x;
                    x += 3 * uu * t * curve.control1.x;
                    x += 3 * u * tt * curve.control2.x;
                    x += ttt * curve.endPoint.x;

                    y = uuu * curve.startPoint.y;
                    y += 3 * uu * t * curve.control1.y;
                    y += 3 * u * tt * curve.control2.y;
                    y += ttt * curve.endPoint.y;

                    width = startWidth + ttt * widthDelta;
                    this._drawPoint(x, y, width);
                }
                ctx.closePath();
                ctx.fill();
            };

            SignaturePad.prototype._strokeWidth = function (velocity) {
                return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
            };

            var Point = function (x, y, time) {
                this.x = x;
                this.y = y;
                this.time = time || new Date().getTime();
            };

            Point.prototype.velocityFrom = function (start) {
                return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
            };

            Point.prototype.distanceTo = function (start) {
                return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
            };

            var Bezier = function (startPoint, control1, control2, endPoint) {
                this.startPoint = startPoint;
                this.control1 = control1;
                this.control2 = control2;
                this.endPoint = endPoint;
            };

            // Returns approximated length.
            Bezier.prototype.length = function () {
                var steps = 10,
                    length = 0,
                    i, t, cx, cy, px, py, xdiff, ydiff;

                for (i = 0; i <= steps; i++) {
                    t = i / steps;
                    cx = this._point(t, this.startPoint.x, this.control1.x, this.control2.x, this.endPoint.x);
                    cy = this._point(t, this.startPoint.y, this.control1.y, this.control2.y, this.endPoint.y);
                    if (i > 0) {
                        xdiff = cx - px;
                        ydiff = cy - py;
                        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
                    }
                    px = cx;
                    py = cy;
                }
                return length;
            };

            Bezier.prototype._point = function (t, start, c1, c2, end) {
                return start * (1.0 - t) * (1.0 - t) * (1.0 - t) +
                    3.0 * c1 * (1.0 - t) * (1.0 - t) * t +
                    3.0 * c2 * (1.0 - t) * t * t +
                    end * t * t * t;
            };

            return SignaturePad;
        })(document);



        oAPP.signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'red',
            velocityFilterWeight: .7,
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16, // max x milli seconds on event update, OBS! this introduces lag for event update
            minPointDistance: 3,
        });

    }


};


/* ================================================================= */
/* dom ready
/* ================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    oAPP.onStart();

});


/* ================================================================= */
/* window 종료
/* ================================================================= */
//window.addEventListener('beforeunload', ()=> {    


//});