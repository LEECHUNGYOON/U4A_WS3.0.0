
let oAPP = null;

oAPP = {
//====================================================//
//[펑션] 스타트 
//====================================================//    
  onStart: ()=> {
    oAPP.remote = require('@electron/remote');
    oAPP.ipcRenderer = require('electron').ipcRenderer;
    oAPP.fs = oAPP.remote.require('fs');
    oAPP.path = oAPP.remote.require('path');
    oAPP.desktopCapturer = oAPP.remote.require('electron').desktopCapturer;
    oAPP.SCREEN_ID = "";

    //window 로딩 완료 이벤트 
    oAPP.ipcRenderer.on('IF-REC-READY', async (event, data) => {

        //사용자 선택 모니터(Screen) ID
        oAPP.SCREEN_ID = data.SCREEN_ID;
    
        //초기값 설정 
        oAPP.onInitData();

        //Window 화면에 서명패드 
        oAPP.onSignaturePad();

        //레코딩 화면 구성 
        oAPP.onScrCreate();


        //드로잉 설정 여부 체크박스 이벤트 
        document.getElementsByClassName("drow-checkbox")[0].addEventListener("click", (e)=>{

              var isCHK = document.getElementById("check1").checked;
                  // console.log(isCHK);

                  //드로잉 체크박스 값에 따른 드로잉 초기화 버튼 활성/비활성 처리
                  if(isCHK){  //드로잉 설정

                      //드로잉 초기화 버튼 활성 
                      setTimeout(() => {
                        document.getElementsByClassName("drow-initial-Button")[0].style.display = "";
                      }, 0); 
                      
                      //드로잉 설정 레이어 활성 
                      setTimeout(() => {
                        document.getElementById("SIGN_CTNR").className = "signature-on";
                      }, 0);
                  

                  }else{     //드로잉 해제 

                      setTimeout(() => {
                        document.getElementsByClassName("drow-initial-Button")[0].style.display = "none"; //해제
                      }, 0);
                      
                      //드로잉 설정해제 
                      setTimeout(() => {
                        document.getElementById("SIGN_CTNR").className = "signature-off";
                      }, 0);

                      //드로잉 값 초기화 
                      setTimeout(() => {
                        oAPP.signaturePad.clear();
                      }, 0);
                    
                  }

        });


        //드로잉 초기화 버튼 이벤트 
        document.getElementsByClassName("drow-initial-Button")[0].addEventListener("click", (e)=>{
            e.preventDefault();
            oAPP.signaturePad.clear();

        });


        //레코딩 종료  
        document.getElementsByClassName("recording-close-Button")[0].addEventListener("click", (e)=>{
            e.preventDefault();
            //윈도우 종료 
            oAPP.remote.getCurrentWindow().close();

        });

        //TextArea 추가 버튼 이벤트 설정  
        document.getElementsByClassName("textarea-open-Button")[0].addEventListener("click", (e)=>{
          e.preventDefault();

          return;

          let oDIV_TOP = document.createElement("div");
              //oDIV_TOP.setAttribute("id","shhong");
              oDIV_TOP.style.position = "absolute";
              oDIV_TOP.style.top = "50px";
              oDIV_TOP.style.left = "50px";


          let oDIV_01  = document.createElement("div");
              oDIV_01.setAttribute("for","comment_text");
              oDIV_01.setAttribute("style","background:blue; color:white; height:30px; width:200px; cursor:pointer;");

          let oSPAN_01 = document.createElement("span");
              oSPAN_01.innerText = "drag area";
              oSPAN_01.setAttribute("style","margin-left:10px;");

              oDIV_01.appendChild(oSPAN_01);
              oDIV_TOP.appendChild(oDIV_01);

          let oTXTAREA_01 = document.createElement("textarea");
              oTXTAREA_01.setAttribute("style","min-width:100px; position: absolute; cursor:pointer; z-Index:100000;");
              oTXTAREA_01.setAttribute("id","comment_text");
              oTXTAREA_01.setAttribute("name","comment_text");
              oTXTAREA_01.setAttribute("row","6");
              oTXTAREA_01.setAttribute("cols","50");
              oTXTAREA_01.setAttribute("placeholder","This is an awesome comment box");

              oDIV_TOP.appendChild(oTXTAREA_01);


              oDIV_01.onmousedown = function(event) {
                      event.preventDefault();
                      oDIV_01.style.position = 'absolute';
              
                      oDIV_01.style.zIndex = 100000;
              
                      document.body.appendChild(oDIV_01);
              
                      moveAt(event.pageX, event.pageY);
              
                      oDIV_01.addEventListener('mousemove', onMouseMove);
              
                      oDIV_01.onmouseup = function() {
                              event.preventDefault();
                              oDIV_01.removeEventListener('mousemove', onMouseMove);
                              oDIV_01.onmouseup = null;
                      };
  
              };
            
              oDIV_01.ondragstart = function() {
                  return false;
              };
          
  
              function moveAt(pageX, pageY) {
                  
                  var offwidth  = oDIV_01.offsetWidth;
                  var offHeight = oDIV_01.offsetHeight;
  
                  var left = pageX - offwidth  / 2 + 'px';
                  var top  = pageY - offHeight / 2 + 'px';
                  
                  oDIV_01.style.left = left;
                  oDIV_01.style.top  = top;
  
                  var left2 = pageX - offwidth  / 2 + 'px';
                  var top2  = pageY - offHeight / 2;
                      top2  = top2  + 30;
                      top2  = top2 + "px";
  
                      oTXTAREA_01.style.left = left2;
                      oTXTAREA_01.style.top  = top2;
      
              }
  
              function onMouseMove(event) {
                      event.preventDefault();
                      moveAt(event.pageX, event.pageY);
              }


              document.body.appendChild(oDIV_TOP);


        });


    });
    
  },

//====================================================//
//[펑션] 초기 값 설정 
//====================================================// 
  onInitData: ()=>{

    var oSIGN = document.getElementById("signature-pad");
        oSIGN.setAttribute("width",  screen.availWidth);
        oSIGN.setAttribute("height", screen.availHeight);
   
        oAPP.saveDirectory = oAPP.path.join(process.env.APPDATA, oAPP.remote.app.name, "video");
        
        return;

    //레코딩 비디오파일 저장 폴더 경로
    if(process.env.LOCALAPPDATA !== ""){
      oAPP.saveDirectory = oAPP.path.join(process.env.LOCALAPPDATA, oAPP.remote.app.name, "video");
      
    }else{
      oAPP.saveDirectory = oAPP.path.join(process.env.APPDATA, oAPP.remote.app.name, "video");

    }

  },
//====================================================//
//[펑션] 레코딩 시작 
//====================================================// 
  onRecordStart: async ()=>{

      //드로잉 여부 체크박스 해제 
      setTimeout(() => { document.getElementById("check1").checked = false; }, 0);  
      
      //드로잉 체크박스 활성 
      setTimeout(() => { document.getElementsByClassName("drow-checkbox")[0].style.display = ""; }, 0);
      
      //Text Area 생성 버튼 활성 
      setTimeout(() => { document.getElementsByClassName("textarea-open")[0].style.display = ""; }, 0);  

      //드로잉 설정해제 
      setTimeout(() => { document.getElementById("SIGN_CTNR").className = "signature-off"; }, 0); 

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
    function _onHandleError (e) {
      
      var EMSG = e.toString();
      console.error("동영상 수행 오류 => " + EMSG);
      var oMsgPop = oAPP.remote.dialog.showMessageBox(oAPP.remote.getCurrentWindow(), {
        title: 'Application Error',
        type: 'error',
        defaultId: 1,
        message: 'Video recording error => ' + EMSG,
        buttons: ["close"],
       })
       .then((e)=>{
            window.close();
          
       });

    }
                
    //미디어 스트림
    async function _onHandleStream (stream) {

        //저장처리 파일명 구성  
        var fileName = oAPP.onRandom(20) + "_" +oAPP.onDateTime() + ".mp4";
        //var fileName = oAPP.onRandom(20) + "_" +oAPP.onDateTime() + ".webm";
        
            fileName = oAPP.path.join(oAPP.saveDirectory, fileName);

        //비디오 레코딩 객체 생성
        oAPP.REC = new MediaRecorder(stream);

        //비디오 레코딩 시작
        oAPP.REC.addEventListener("dataavailable", async (e) => { 

              oAPP.fs.appendFile(fileName, Buffer.from(await e.data.arrayBuffer()), function (err) {
                if (err) {return;};
                // console.log('Saved!');
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
  onRecordStop: ()=>{

      //레코딩 다운 종료 
      oAPP.REC.stop();
      delete oAPP.REC;
      var toggleButton = document.getElementById("toggle-button");
          toggleButton.className = "clickable movedown";

      //드로잉 설정해제 
      setTimeout(() => { document.getElementById("SIGN_CTNR").className = "signature-off"; }, 0); 
      

      //드로잉 여부 체크박스 숨김 처리
      setTimeout(() => { document.getElementById("check1").checked = false;
                         document.getElementsByClassName("drow-checkbox")[0].style.display = "none";
                      }, 0);


      //TextArea 추가 버튼 숨김 처리 
      setTimeout(() => { document.getElementsByClassName("textarea-open")[0].style.display = "none"; }, 0); 

 
      //드로잉 초기화 버튼 숨김 처리
      setTimeout(() => { document.getElementsByClassName("drow-initial-Button")[0].style.display = "none"; }, 0); 
      

      //드로잉 값 초기화 
      oAPP.signaturePad.clear();

      //등록 저장위치 폴더 실행
      oAPP.remote.shell.openPath(oAPP.saveDirectory);


  },

//====================================================//
//레코딩 화면 구성
//====================================================//   
  onScrCreate: ()=> {
     
      let touchstartX = 0;
      let touchstartY = 0;
      let touchendX = 0;
      let touchendY = 0;
      
      const gestureZone = document.getElementById("app-cover");
      const toggleButton = document.getElementById("toggle-button");
      const recText = document.getElementsByClassName("rec-text");
      const activeText = document.getElementById("active-text");
      const clickaBleElements = document.getElementsByClassName("clickable");
      
      toggleButton.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          
          //저장 등록 폴더 생성 
          if(!oAPP.fs.existsSync(oAPP.saveDirectory)){
              oAPP.fs.mkdirSync(oAPP.saveDirectory);

          }

          //클래스 정보가 누락이라면 레코딩 시작으로 간주 
          if(typeof toggleButton.classList[1] === "undefined"){ oAPP.onRecordStart(); return; }

          switch (toggleButton.classList[1]) {
            case "moveup":
              oAPP.onRecordStop();  //레코딩 종료
              break;
          
            case "movedown":
              oAPP.onRecordStart(); //레코딩 시작
              break;

          }
          
        },
        false
      );
      
      
      var timerInterval = null,
        swipeDir = -1,
        toggle = false,
        cElms = clickaBleElements.length;
      
      gestureZone.addEventListener(
        "touchstart",
        function (event) {
          touchstartX = event.changedTouches[0].screenX;
          touchstartY = event.changedTouches[0].screenY;
        },
        false
      );
      
      gestureZone.addEventListener(
        "touchend",
        function (event) {
          touchendX = event.changedTouches[0].screenX;
          touchendY = event.changedTouches[0].screenY;
          handleGesture();
        },
        false
      );
      
      function startRecorder() {
        var sec = "00",
          min = 0;
        activeText.classList.add("lspace");
        activeText.innerText = min + ":" + sec;
        timerInterval = setInterval(function () {
          sec = parseInt(sec);
          ++sec;
          if (sec == 60) {
            sec = "00";
            ++min;
          } else {
            if (sec < 10) sec = "0" + sec;
          }
      
          activeText.innerText = min + ":" + sec;
        }, 1000);
      }
      
      function swipeUp() {
        if (swipeDir == 2) return;
        else swipeDir = 2;
      
        toggleButton.classList.remove("movedown");
        toggleButton.classList.add("moveup");
        setTimeout(function () {
          recText[1].classList.remove("active");
          activeText.classList.add("active");
          startRecorder();
        }, 600);
      }
      
      function swipeDown() {
        if (swipeDir == -1 || swipeDir == 1) return;
        else swipeDir = 1;
      
        toggleButton.classList.remove("moveup");
        toggleButton.classList.add("movedown");
        clearInterval(timerInterval);
        setTimeout(function () {
          recText[0].classList.remove("active");
          document.getElementById("stop-text").classList.add("active");
        }, 600);
      
        setTimeout(function () {
          activeText.classList.remove("lspace");
          activeText.innerText = "Record";
        }, 900);
      }
      
      function handleGesture() {
        if (touchendY <= touchstartY) swipeUp();
      
        if (touchendY >= touchstartY) swipeDown();
      }
      
      function toggleRecorder() {
        if (
          this.id == "toggle-button" ||
          (this.id == "stop-text" && toggle == true) ||
          (this.id == "active-text" && toggle == false)
        )
          _toggleRecorder();
        else return;
      }
      
      function _toggleRecorder() {
        if (toggle) {
          swipeDown();
          toggle = false;
        } else {
          swipeUp();
          toggle = true;
        }
      }
      
      for (i = 0; i < cElms; i++) {
        clickaBleElements[i].addEventListener("click", toggleRecorder, false);
      }    

  },


//================================================= //
//  랜덤키 생성  //
//================================================= //
  onRandom: (length = 8)=> {
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
  onDateTime: ()=> {

      let today = new Date();   
      let year  = today.getFullYear();    // 년도
      let month = today.getMonth() + 1;  // 월
      let date  = today.getDate();        // 날짜

      let hours = today.getHours();      // 시
      let minutes = today.getMinutes();  // 분
      let seconds = today.getSeconds();  // 초

      return year.toString() + month.toString() + date.toString() +  "_" + hours.toString() + minutes.toString() + seconds.toString();

  },

//================================================= //
// Window 서명패드 
//================================================= //
  onSignaturePad: ()=> {

      var SignaturePad = (function(document) {
        "use strict";
    
        var log = console.log.bind(console);
    
        var SignaturePad = function(canvas, options) {
            var self = this,
                opts = options || {};
    
            this.velocityFilterWeight = opts.velocityFilterWeight || 0.7;
            this.minWidth = opts.minWidth || 0.5;
            this.maxWidth = opts.maxWidth || 2.5;
            this.dotSize = opts.dotSize || function() {
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
            this._handleMouseDown = function(event) {
                if (event.which === 1) {
                    self._mouseButtonDown = true;
                    self._strokeBegin(event);
                }
            };
    
            var _handleMouseMove = function(event) {
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
    
            this._handleMouseUp = function(event) {
                if (event.which === 1 && self._mouseButtonDown) {
                    self._mouseButtonDown = false;
                    self._strokeEnd(event);
                }
            };
    
            this._handleTouchStart = function(event) {
                if (event.targetTouches.length == 1) {
                    var touch = event.changedTouches[0];
                    self._strokeBegin(touch);
                }
            };
    
            var _handleTouchMove = function(event) {
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
    
            this._handleTouchEnd = function(event) {
                var wasCanvasTouched = event.target === self._canvas;
                if (wasCanvasTouched) {
                    event.preventDefault();
                    self._strokeEnd(event);
                }
            };
    
            this._handleMouseEvents();
            this._handleTouchEvents();
        };
    
        SignaturePad.prototype.clear = function() {
            var ctx = this._ctx,
                canvas = this._canvas;
    
            ctx.fillStyle = this.backgroundColor;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            this._reset();
        };
    
        SignaturePad.prototype.showPointsToggle = function() {
            this.arePointsDisplayed = !this.arePointsDisplayed;
        };
    
        SignaturePad.prototype.toDataURL = function(imageType, quality) {
            var canvas = this._canvas;
            return canvas.toDataURL.apply(canvas, arguments);
        };
    
        SignaturePad.prototype.fromDataURL = function(dataUrl) {
            var self = this,
                image = new Image(),
                ratio = window.devicePixelRatio || 1,
                width = this._canvas.width / ratio,
                height = this._canvas.height / ratio;
    
            this._reset();
            image.src = dataUrl;
            image.onload = function() {
                self._ctx.drawImage(image, 0, 0, width, height);
            };
            this._isEmpty = false;
        };
    
        SignaturePad.prototype._strokeUpdate = function(event) {
            var point = this._createPoint(event);
            if(this._isPointToBeUsed(point)){
                this._addPoint(point);
            }
        };
    
        var pointsSkippedFromBeingAdded = 0;
        SignaturePad.prototype._isPointToBeUsed = function(point) {
            // Simplifying, De-noise
            if(!this.minPointDistance)
                return true;
    
            var points = this.points;
            if(points && points.length){
                var lastPoint = points[points.length-1];
                if(point.distanceTo(lastPoint) < this.minPointDistance){
                    // log(++pointsSkippedFromBeingAdded);
                    return false;
                }
            }
            return true;
        };
    
        SignaturePad.prototype._strokeBegin = function(event) {
            this._reset();
            this._strokeUpdate(event);
            if (typeof this.onBegin === 'function') {
                this.onBegin(event);
            }
        };
    
        SignaturePad.prototype._strokeDraw = function(point) {
            var ctx = this._ctx,
                dotSize = typeof(this.dotSize) === 'function' ? this.dotSize() : this.dotSize;
    
            ctx.beginPath();
            this._drawPoint(point.x, point.y, dotSize);
            ctx.closePath();
            ctx.fill();
        };
    
        SignaturePad.prototype._strokeEnd = function(event) {
            var canDrawCurve = this.points.length > 2,
                point = this.points[0];
    
            if (!canDrawCurve && point) {
                this._strokeDraw(point);
            }
            if (typeof this.onEnd === 'function') {
                this.onEnd(event);
            }
        };
    
        SignaturePad.prototype._handleMouseEvents = function() {
            this._mouseButtonDown = false;
    
            this._canvas.addEventListener("mousedown", this._handleMouseDown);
            this._canvas.addEventListener("mousemove", this._handleMouseMove);
            document.addEventListener("mouseup", this._handleMouseUp);
        };
    
        SignaturePad.prototype._handleTouchEvents = function() {
            // Pass touch events to canvas element on mobile IE11 and Edge.
            this._canvas.style.msTouchAction = 'none';
            this._canvas.style.touchAction = 'none';
    
            this._canvas.addEventListener("touchstart", this._handleTouchStart);
            this._canvas.addEventListener("touchmove", this._handleTouchMove);
            this._canvas.addEventListener("touchend", this._handleTouchEnd);
        };
    
        SignaturePad.prototype.on = function() {
            this._handleMouseEvents();
            this._handleTouchEvents();
        };
    
        SignaturePad.prototype.off = function() {
            this._canvas.removeEventListener("mousedown", this._handleMouseDown);
            this._canvas.removeEventListener("mousemove", this._handleMouseMove);
            document.removeEventListener("mouseup", this._handleMouseUp);
    
            this._canvas.removeEventListener("touchstart", this._handleTouchStart);
            this._canvas.removeEventListener("touchmove", this._handleTouchMove);
            this._canvas.removeEventListener("touchend", this._handleTouchEnd);
        };
    
        SignaturePad.prototype.isEmpty = function() {
            return this._isEmpty;
        };
    
        SignaturePad.prototype._reset = function() {
            this.points = [];
            this._lastVelocity = 0;
            this._lastWidth = (this.minWidth + this.maxWidth) / 2;
            this._isEmpty = true;
            this._ctx.fillStyle = this.penColor;
        };
    
        SignaturePad.prototype._createPoint = function(event) {
            var rect = this._canvas.getBoundingClientRect();
            return new Point(
                event.clientX - rect.left,
                event.clientY - rect.top
            );
        };
    
        SignaturePad.prototype._addPoint = function(point) {
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
    
        SignaturePad.prototype._calculateCurveControlPoints = function(s1, s2, s3) {
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
    
        SignaturePad.prototype._addCurve = function(curve) {
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
    
        SignaturePad.prototype._drawPoint = function(x, y, size) {
            var ctx = this._ctx;
    
            ctx.moveTo(x, y);
            ctx.arc(x, y, size, 0, 2 * Math.PI, false);
            this._isEmpty = false;
        };
    
        SignaturePad.prototype._drawMark = function(x, y, size) {
            var ctx = this._ctx;
    
            ctx.save();
            ctx.moveTo(x, y);
            ctx.arc(x, y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fill();
            ctx.restore();
        };
    
        SignaturePad.prototype._drawCurve = function(curve, startWidth, endWidth) {
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
    
        SignaturePad.prototype._strokeWidth = function(velocity) {
            return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
        };
    
        var Point = function(x, y, time) {
            this.x = x;
            this.y = y;
            this.time = time || new Date().getTime();
        };
    
        Point.prototype.velocityFrom = function(start) {
            return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
        };
    
        Point.prototype.distanceTo = function(start) {
            return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
        };
    
        var Bezier = function(startPoint, control1, control2, endPoint) {
            this.startPoint = startPoint;
            this.control1 = control1;
            this.control2 = control2;
            this.endPoint = endPoint;
        };
    
        // Returns approximated length.
        Bezier.prototype.length = function() {
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
    
        Bezier.prototype._point = function(t, start, c1, c2, end) {
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
document.addEventListener('DOMContentLoaded', ()=> {    
    oAPP.onStart();

});


