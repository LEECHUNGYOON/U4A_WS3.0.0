var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

/*********************************************************
 * @module - onAfterRendering 이벤트 등록 대상 UI 얻기.
 ********************************************************/
module.exports = function(oTarget){

    return new Promise((resolve)=>{
			
		if(typeof oTarget === "undefined"){
			return resolve();
		}

		//RichTextEditor UI 인경우.
		if(oTarget.isA("sap.ui.richtexteditor.RichTextEditor") === true){

			oTarget.attachEventOnce("readyRecurring", async function(){
                console.log("리치 에디터 도착");

				console.log(oTarget.getDomRef("textarea_ifr"));

				return resolve();

            });

			// oTarget.invalidate();
			
			return;
			
		}		
		
		var _oDelegate = {
			onAfterRendering: async function(){
				oTarget.removeEventDelegate(_oDelegate);
				console.log("onAfterRendering 도착");

				//현재 호출될 dialog 안에 richTextEditor가 없다면
				//afterOpen이벤트 등록 후 해당 이벤트 호출까지 대기.
				//(dialog UI 안에 richTextEditor가 있다면
				//dialog의 afterOpen 호출전에 richTextEditor의 readyRecurring 이벤트가 호출되어
				//문제가 발생됨)
				await attachEventDialogAfterOpen(oTarget);

				console.log(oTarget.getDomRef());
				

				return resolve();
			}
		};
		
		oTarget.addEventDelegate(_oDelegate);
		
	});

};



/*********************************************************
 * @function - 현재 호출될 dialog 안에 richTextEditor가 없다면
 * 				afterOpen이벤트 등록 후 해당 이벤트 호출까지 대기.
 ********************************************************/
function attachEventDialogAfterOpen(oTarget){

	return new Promise((resolve)=>{

		
		//현재 UI의 tree 정보 얻기.
		var _sTree = oAPP.fn.getTreeData(oTarget._OBJID);

		if(typeof _sTree === "undefined"){
			return resolve();
		}

		//Workbench 미리보기 화면 예외로직의 팝업류 UI가 아닌경우 EXIT.
		if(oAPP.attr.S_CODE.UA015.findIndex( item => item.FLD01 === _sTree.UIFND && item.FLD03 !== "" ) === -1){
			return resolve();
		}

		//AfterOpen 이벤트가 없다면 exit.
		if(typeof oTarget.attachAfterOpen !== "function"){
			return resolve();
		}

		//open 확인 function이 없다면 exit.
		if(typeof oTarget.isOpen !== "function"){
			return resolve();
		}

		//현재 dialog성 UI가 open 됐다면 exit.
		if(oTarget.isOpen() === true){
			return resolve();
		}

		//dialog 안에 richtexteditor이 존재하는 경우 exit.
		if(findRichTextEditor(_sTree) === true){
			return resolve();
		}

		//dialog의 AfterOpen 이벤트 등록.
		oTarget.attachEventOnce("afterOpen", async function(){
			console.log("afterOpen 도착");

			console.log(oTarget.getDomRef());

			return resolve();
		});

	});

}


/*********************************************************
 * @function - child에 richTextEditor이 존재하는지 확인.
 ********************************************************/
function findRichTextEditor(sTree){

	//tree 정보가 존재하지 않는경우 exit.
	if(typeof sTree === "undefined"){
		return false;
	}

	//SAP.UI.RICHTEXTEDITOR.RICHTEXTEDITOR 인경우 찾음 flag return.
	if(sTree.UIOBK === "UO01786"){
		return true;
	}

	//child 정보가 존재하지 않는경우 exit.
	if(typeof sTree.zTREE === "undefined"){
		return false;
	}

	//child 정보가 존재하지 않는경우 exit.
	if(sTree.zTREE.length === 0){
		return false;
	}

	//child를 탐색하여 RICHTEXTEDITOR가 존재하는지 확인.
	for (let i = 0, l = sTree.zTREE.length; i < l; i++) {
		
		var _sTree = sTree.zTREE[i];

		//재귀 호출을 통해 RICHTEXTEDITOR 존재여부 확인.
		var _found = findRichTextEditor(_sTree);

		//존재하는경우 exit.
		if(_found === true){
			return true;
		}

	}

	return false;

}