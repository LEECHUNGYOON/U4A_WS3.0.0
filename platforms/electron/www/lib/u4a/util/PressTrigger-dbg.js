//Copyright 2017. INFOCG Inc. all rights reserved.

sap.ui.define("u4a.util.PressTrigger", [
"sap/ui/core/Control",

], function(Control){
	"use strict";

	var PressTrigger = Control.extend("u4a.util.PressTrigger",{
		metadata : {
			library : "u4a.util",
			properties : {
				second : { type: "int", defaultValue: 0 },
				immediateRun : { type : "boolean", defaultValue : true }
			},
			events : {
				finished : {
					allowPreventDefault: true,
				}
			}
		}, // end of metadata

		renderer : function(oRm, oControl){

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeAttribute("visibility", "hidden");
			oRm.addStyle("display", 'none');
			oRm.writeStyles();
            oRm.write(">");
            oRm.write("</div>");

        }, // end of renderer

		onAfterRendering : function(e){

			var oActionTrigger = e.srcControl;

			// Browser Document 이벤트를 설정한다.
			oActionTrigger._setBrowserDocumentEvent();

			// ActionTrigger 실행
			oActionTrigger._runActionTrigger();

		}, // end of onAfterRendering

		_setBrowserDocumentEvent : function(){
	
			var sDeviceName = sap.ui.Device.os.name;

			this.EventHandler = this._documentEventTriggered.bind(this);

			if(this.getImmediateRun() == true){

				// 이벤트 설정
				if(sDeviceName == 'win'){
					$(window).bind("click" , this.EventHandler);
				}
				else {
					$(window).bind("touchstart" , this.EventHandler);
				}

					$(document).on("keyup", this.EventHandler);
			}
			else {

				// 이벤트 해제
				if(sDeviceName == 'win'){
					$(window).unbind("click");
				}
				else {
					$(window).unbind("touchstart");
				}

				$(document).off("keyup");
			}

		}, // end of _setBrowserDocumentEvent

		_runActionTrigger : function(){

			var iSec = this.getSecond() * 1000,
				isRun = this.getImmediateRun();

			if(this.TriggerInterval){
				clearInterval(this.TriggerInterval);
				this.TriggerInterval = null;
			}

			if(isRun == false){
				return;
			}

			// Minute 시간 후에 호출한 페이지에 데이터를 보낸다.
			this.TriggerInterval = setInterval(function() {
				
				// 실행 중지
				this.setImmediateRun(false);

				// 인터벌 삭제
				clearInterval(this.TriggerInterval);
				this.TriggerInterval = null;

				// 이벤트
				this.fireFinished();

			}.bind(this), iSec);

		}, // end of _runActionTrigger

		_documentEventTriggered : function(e){
		  
			this._runActionTrigger();

		}, // end of _documentEventTriggered

	});

	return PressTrigger;

});