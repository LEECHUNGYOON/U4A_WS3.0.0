/*********************************************************
 * @module - onAfterRendering 이벤트 등록 대상 UI 얻기.
 ********************************************************/
module.exports = function(oTarget){

    return new Promise((res)=>{
			
		if(typeof oTarget === "undefined"){
			return res();
		}

		
		//dialog, popup유형의 UI인경우.
		if(typeof oTarget.attachAfterOpen === "function" && oTarget.isOpen && oTarget.isOpen() !== true){
            oTarget.attachEventOnce("afterOpen", function(){
                console.log("afterOpen 도착");
                res();
            });
            return;
        }


		//RichTextEditor UI 인경우.
		if(oTarget.isA("sap.ui.richtexteditor.RichTextEditor") === true){
			
			oTarget.attachEventOnce("readyRecurring", async function(){
                console.log("readyRecurring 도착");

				// await new Promise((ress)=>{
				// 	setTimeout(() => {
				// 		ress();
				// 	}, 3000);
				// });

                res();
            });
			
			return;
			
		}		
		
		var _oDelegate = {
			onAfterRendering: async function(){
				oTarget.removeEventDelegate(_oDelegate);

				// await new Promise((ress)=>{
				// 	setTimeout(() => {
				// 		ress();
				// 	}, 3000);
				// });

				console.log("onAfterRendering 도착");
							
				res();
			}
		};
		
		oTarget.addEventDelegate(_oDelegate);
		
	});

};