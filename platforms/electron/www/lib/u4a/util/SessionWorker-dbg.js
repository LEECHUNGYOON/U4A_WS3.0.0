//Copyright 2017. INFOCG Inc. all rights reserved.

sap.ui.define("u4a.util.SessionWorker",[
"sap/ui/core/Control"

], function(Control){
    "use strict";

    var SessionWorker = Control.extend("u4a.util.SessionWorker", {
        metadata : {
            library : "u4a.util",
            properties : {
               minute : { type: "int", defaultValue: 0 },
               activeWorker : { type : "boolean", defaultValue : true },
            },
            events : {
                finished : {
                    allowPreventDefault: true,
                }
            }

        }, // end of metadata

        _oWorker : null,

        init : function(){

            // 브라우저가 Worker를 지원하는지 여부 확인
            if(!window.Worker) {
                console.log("Does not support this browser.");
                return;
            }

        }, // end of init

        renderer : function(oRm, oWorker){
			
            oRm.write("<div");
            oRm.writeControlData(oWorker);
            oRm.writeAttribute("visibility", "hidden");
			oRm.addStyle("display", 'none');
			oRm.writeStyles();
            oRm.write(">");
            oRm.write("</div>");
			
        },

        setActiveWorker : function(bActive){
			
            var oMsgParam = {};

            if(!bActive){
                if(this._oWorker != null){

                    oMsgParam.isActive = false;

                    this._oWorker.postMessage(oMsgParam); // Worker Interval을 중지한다.
                    this._oWorker.terminate();
                    this._oWorker = null;
                }

                return;
            }

            this.createWorker();

        },

        createWorker : function(){
			
            var oMsgParam = {};
            var iKeepTime = this.getMinute();
			
			if(this._oWorker instanceof Worker){
				this._oWorker.terminate();
				this._oWorker = null;
            }
			
			if(iKeepTime == 0){
				return;
			}

            this._oWorker = new Worker('/zu4a_imp/publish/CommonJS/workers/SessionWorker.js');

            oMsgParam.keeptime = iKeepTime;

            this._oWorker.postMessage(oMsgParam);  // 워커에 메시지를 보낸다.

            this._oWorker.onmessage = function(e){
                this.onMessage(e);
            }.bind(this);

        },

        onMessage : function(e){

            var receiveData = e.data;

            if(receiveData != "X"){
                return;
            }
			
			this.fireFinished();
			
        }, // end of onMessage
		
		onAfterRendering : function(){
			
			this.createWorker();
			
		},
		
		exit : function(){
			
			if(this._oWorker){
				this._oWorker.terminate();
				this._oWorker = null;
			}
			
		}

    });

    return SessionWorker;

});