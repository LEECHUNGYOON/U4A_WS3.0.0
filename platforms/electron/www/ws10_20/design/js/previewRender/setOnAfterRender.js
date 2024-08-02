var oFrame = document.getElementById('ws_frame');

var oAPP = oFrame.contentWindow.oAPP;

var sap = oAPP.attr.ui?.frame?.contentWindow?.sap;

/*********************************************************
 * @module - onAfterRendering 이벤트 등록 처리.
 ********************************************************/
module.exports.setAfterRendering = function(oTarget){

    return new Promise((resolve)=>{
			
		if(typeof oTarget === "undefined"){
			return resolve();
		}

		if(typeof oTarget?.addEventDelegate !== "function"){
			return resolve();
		}

		if(typeof oTarget?.onAfterRendering !== "function"){
			return resolve();
		}

		
		//RichTextEditor UI 인경우.
		if(oTarget.isA("sap.ui.richtexteditor.RichTextEditor") === true){

			oTarget.attachEventOnce("readyRecurring", async function(){

				return resolve();

            });
			
			return;
			
		}		
		
		var _oDelegate = {
			onAfterRendering: async function(){
				oTarget.removeEventDelegate(_oDelegate);

				//현재 호출될 dialog 안에 richTextEditor가 없다면
				//afterOpen이벤트 등록 후 해당 이벤트 호출까지 대기.
				//(dialog UI 안에 richTextEditor가 있다면
				//dialog의 afterOpen 호출전에 richTextEditor의 readyRecurring 이벤트가 호출되어
				//문제가 발생됨)
				await attachEventDialogAfterOpen(oTarget);

				return resolve();
			}
		};
		
		oTarget.addEventDelegate(_oDelegate);
		
	});

};




/*********************************************************
 * @module - onAfterRendering 이벤트 등록 대상 UI 얻기.
 ********************************************************/
module.exports.getTargetAfterRenderingUI = function(oTarget){

    if(typeof oTarget === "undefined" || oTarget === null){
		return;
	}

	var _oTarget = oTarget;
	
	
	//UI에 onAfterRendering이 존재하지 않는경우.
	//상위 부모의 onAfterRendering을 확인.
	//대상 UI가 sap.ui.base.ManagedObject.prototype.invalidate function을 사용하고 있다면,
	//상위 부모를 찾아야함(sap.ui.base.ManagedObject.prototype.invalidate은 상위 부모를 invalidate 처리 하기때문)
	while(typeof _oTarget?.onAfterRendering === "undefined" || _oTarget?.invalidate === sap?.ui?.base?.ManagedObject?.prototype?.invalidate){
		
		_oTarget = _oTarget?.oParent;
        
        //부모를 찾지 못한 경우 exit.
		if(typeof _oTarget === "undefined" || _oTarget === null){
			return;
		}
	}

	var _OBJID = _oTarget?._OBJID;
	
	//예외처리 대상 UI에 해당하는건인경우.
	switch(true){
		case typeof _oTarget._oDialog !== "undefined" && _oTarget._oDialog != null:
            //UI 내부에 DIALOG UI가 존재하는경우(sap.m.BusyDialog)
			_oTarget = _oTarget._oDialog;
            
			break;
		
		case typeof _oTarget._oPopover !== "undefined" && _oTarget._oPopover != null:
            //UI 내부에 POPOVER UI가 존재하는경우(sap.m.QuickView)
			_oTarget = _oTarget._oPopover;

			break;
			
		case typeof _oTarget._getMenu === "function" && typeof _oTarget._initAllMenuItems === "function":
			//UI 내부에 MENU UI를 얻는 function이 존재하는경우(sap.m.Menu)

			if (!_oTarget._bIsInitialized) {
				_oTarget._initAllMenuItems();
				_oTarget._bIsInitialized = true;
			}
			
			_oTarget = _oTarget._getMenu();
		
			break;
			
		case typeof _oTarget._getDialog === "function":
            //UI 내부에 dialog UI를 얻는 function이 존재하는경우(sap.m.ViewSettingsDialog)
			_oTarget = _oTarget._getDialog();
		
			break;
			
		case typeof _oTarget._oControl !== "undefined" && _oTarget._oControl !== null:
			//UI 내부에 control UI가 존재하는경우(sap.m.ResponsivePopover)
			_oTarget = _oTarget._oControl;
		
			break;

		case typeof _oTarget.isA === "function" && _oTarget.isA("sap.ui.unified.MenuItemBase") === true:
			//sap.ui.unified.MenuItemBase으로 파생된 UI인경우(sap.ui.unified.MenuItem, sap.ui.unified.MenuTextFieldItem)
			_oTarget = _oTarget.oParent;
		
			break;
		
	}
	
	if(typeof _oTarget === "undefined" || _oTarget === null){
		return;
	}

	_oTarget._OBJID = _OBJID;
	
		
	return _oTarget;

};



/*********************************************************
 * @module - RichTextEditor 미리보기 출력 예외처리로직.
 ********************************************************/
module.exports.renderingRichTextEditor = function(is_tree){
    
    //미리보기 화면에 출력될 RichTextEditor의 readyRecurring 이벤트 등록 처리
    return refreshRichTextEditor(is_tree);
    
};



/*********************************************************
 * @module - 미리보기 화면 테마 변경 이벤트 등록 처리.
 ********************************************************/
module.exports.previewThemeChanged = function(is_attr){

	return new Promise((resolve)=>{

		//테마 변경 callback 이벤트 function.
		function _previewThemeChanged(){

			//이벤트 제거.
			sap.ui.getCore().detachThemeChanged(_previewThemeChanged);

			return resolve();

		}	//테마 변경 callback 이벤트 function.


		//attribute정보가 존재하지 않는경우 exit.
		if(typeof is_attr === "undefined"){
			return resolve();
		}

		//DOCUMENT의 UI theme attribute가 아닌경우 exit.
		if(is_attr?.UIATK !== "DH001021"){
			return resolve();
		}

		//테마 입력값이 존재하지 않는경우 exit.
		if(typeof is_attr?.UIATV === "undefined" || is_attr?.UIATV === ""){
			return resolve();
		}


		//미리보기 sap 라이브러리가 존재하지 않는경우 exit.
		if(typeof sap === "undefined" || sap === null){
			return resolve();
		}

		//테마 변경 이벤트 등록.
		sap.ui.getCore().attachThemeChanged(_previewThemeChanged);


	});

};



/*********************************************************
 * @function - 미리보기 화면에 출력될 RichTextEditor의 
 *             readyRecurring 이벤트 등록 처리 내부 function.
 ********************************************************/
function refreshRichTextEditor(is_tree, aPromise = []){

    if(typeof is_tree === "undefined"){
        return aPromise;
    }
    
    if(typeof is_tree.zTREE.length === 0){
        return aPromise;
    }


    var _oTarget = oAPP.attr.prev[is_tree.OBJID];

    //UI가 존재하지 않는경우 exit.
    if(typeof _oTarget === "undefined"){
        return aPromise;
    }

    if(typeof _oTarget.getDomRef !== "function"){
        return aPromise;
    }
    
    //현재 UI가 미리보기 화면에 출력 됐는지 확인.
    var _oDom = _oTarget.getDomRef();

    //미리보기 화면에 출력되지 않은경우(dom이 없는경우) exit.
    if(typeof _oDom === "undefined" || _oDom === null){
        return aPromise;
    }

    
    //처리 대상 child에 richTextEditor 존재 여부 확인.
    //(richTextEditor가 화면에 출력되지 않는상황(visible:false) 이거나,
    //richTextEditor의 부모가 화면에 출력되지 않는상황(dom을 그리지 않음)
    //인경우 onAfterRendering이벤트를 등록하지 않음)
    for(var i = 0, l = is_tree.zTREE.length; i < l; i ++){
      
        var _sChild = is_tree.zTREE[i];


        var _oChild = oAPP.attr.prev[_sChild.OBJID];


        //UI정보가 존재하지 않는경우 skip.
        if(typeof _oChild === "undefined"){
            continue;
        }


        if(typeof _oChild.getDomRef === "undefined"){
            continue;
        }

        //화면에 출력된 dom 정보 확인.
        var _oDom = _oChild.getDomRef();

        //화면에 출력된 UI가 아닌경우(dom 정보가 없는경우) skip.
        if(typeof _oDom === "undefined" || _oDom === null){
            continue;
        }


        //현재 UI가 richTextEditor라면 readyRecurring 이벤트 등록처리.
        if(_sChild.UIOBK === "UO01786"){
            aPromise.push(module.exports.setAfterRendering(_oChild));

        }

        //하위를 탐색하며 richTextEditor의 readyRecurring 이벤트 등록처리.
        refreshRichTextEditor(_sChild, aPromise);    

    }
    
    return aPromise;

}

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