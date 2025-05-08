/****************************************************************************
 * 🔥 Npm Library
 ****************************************************************************/        
	const PATH = parent.PATH;
	const FS = parent.FS;
	const PATHINFO = parent.PATHINFO;
	const IPCRENDERER = parent.IPCRENDERER;    


/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
jQuery.sap.require("sap.m.MessageBox");

sap.ui.getCore().loadLibrary("sap.m"); 
sap.ui.getCore().loadLibrary("sap.ui.layout");
sap.ui.getCore().loadLibrary("sap.ui.table");


/******************************************************************************
 *  💖 DATA / ATTRIBUTE 선언부
 ******************************************************************************/

    const USERINFO = parent.USERINFO;
    const WSUTIL = parent.WSUTIL;

    
const 
    oContr          = {};
    oContr.msg      = {};
    oContr.ui       = {};
    oContr.fn       = {};
    oContr.types    = {};
    oContr.attr     = {};


    // 스니펫 등록 정보 구조
	oContr.types.TY_SNIPPET = {

		// 내부 키
		_key: "",

		snippet_langu: "",			// 스니펫 언어
		_snippet_langu_vs: "None", 
		_snippet_langu_vst: "",

		snippet_name: "",			// 스니펫 이름
		_snippet_name_vs: "None",
		_snippet_name_vst: "",

		snippet_desc: "",			// 스니펫 설명
		_snippet_desc_vs: "None",
		_snippet_desc_vst: "",

		snippet_code: "",			// 스니펫 코드
		_snippet_code_vs: "None",
		_snippet_code_vst: "",


		_isSelectedRow: false,

		_isnew: false,
		_ischg: false,

		_snippet_langu_edit: false,
		_snippet_name_edit: false,
		_snippet_desc_edit: false,

	};

    // 스니펫 등록 페이지 헤더 영역 핸들링 관련 구조
	oContr.types.TY_PAGE_HDR_HNDL = {
		newBtn_enable: false,	// 신규 버튼 Edit
		delBtn_enable: false,	// 삭제 버튼 Edit
		saveBtn_enable: false,	// 저장 버튼 Edit
		cancBtn_enable: false,	// 취소 버튼 Edit				        
	};

    // 스니펫 등록 페이지의 언어 선택 DDLB 구조
    oContr.types.TY_SNIPPET_LANGU_DDLB = [
		{ key: "" },
		{ key: "javascript" },
		{ key: "css" },
		{ key: "html" }
	];


	// 스니펫 변경 신호를 전송할 BroadCast 객체
	// oContr.attr.SNIPPET_CHANGE_BROADCAST = new BroadcastChannel(`broadcast-snippet-change`);

	// 공통 모델
    oContr.oModel = new sap.ui.model.json.JSONModel({

		T_SNIPPET_LANGU_DDLB: [],

		T_SNIPPET_LIST: [],

		S_SNIPPET: {},

		S_PAGE_HDR_HNDL: {},

    });

    oContr.oModel.setSizeLimit(Infinity);


/******************************************************************************
 *  💖 Paths
 ******************************************************************************/
	const MONACO_EDITOR_SNIPPET_P13N_ROOT = PATH.join(PATHINFO.P13N_ROOT, "monaco", "snippet");



/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/
    
    // 로그인 언어별 메시지 구성
    _setWsMsgTextConfig();


    /*************************************************************
     * @function - 모델 초기 설정
     *************************************************************/
    function _initModel() {

		// 우측 스니펫 등록 페이지 툴바 핸들 모델 설정
		oContr.oModel.setProperty("/S_PAGE_HDR_HNDL", JSON.parse(JSON.stringify(oContr.types.TY_PAGE_HDR_HNDL)));

		// 우측 스니펫 DDLB 값 모델 설정
		oContr.oModel.setProperty("/T_SNIPPET_LANGU_DDLB", JSON.parse(JSON.stringify(oContr.types.TY_SNIPPET_LANGU_DDLB)));

		// 우측 스니펫 등록 페이지 모델 설정
		oContr.oModel.setProperty("/S_SNIPPET", JSON.parse(JSON.stringify(oContr.types.TY_SNIPPET)));

    } /* end of _initModel */


	/*************************************************************
     * @function - 스니펫 변경 신호를 전체 브라우저에 전송
     *************************************************************/
	function _sendSnippetChangeSignal(){

		// // scope code를 동봉하여 전송
		// let sScopeCode = oAPP?.IFDATA?.scopeCode || "";

		// oContr.attr.SNIPPET_CHANGE_BROADCAST.postMessage({ scopeCode: sScopeCode });

		let oSendData = {
			PRCCD: "MONACO_SNIPPET_CHANGE",
		};
	
		IPCRENDERER.send("if-browser-interconnection", oSendData);		

	} // end of _sendSnippetChangeSignal


	/*************************************************************
	 * @function - 포커스 제거
	 * 
	 * - 특정 영역 포커스 시 생기는 CSS로 그려진 파란 테두리를 
	 *   제거하기 위함
	 *************************************************************/
	function _activeElementBlur() {

		//  선택 테두리 제거
		if (document.activeElement && document.activeElement.blur) {
			document.activeElement.blur();
		}

	} // end of _activeElementBlur


    /*************************************************************
     * @function - 일정 시간동안 대기
     *************************************************************/
    function _waiting(iTime = 1000) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, iTime);
		});
	} // end of _waiting


	/************************************************************************
	 * @function - 화면 가운데에 출력되는 메시지 토스트
	 ************************************************************************/
	function _showMsgToastCenter(sMsg) {

		if (!sMsg || typeof sMsg !== "string") {
			return;
		}

		sap.m.MessageToast.show(sMsg, { my: "center center", at: "center center" });

	} // end of _showMsgToastCenter
    

	/************************************************************************
	 * @function - 메시지 박스 (Confirm)
	 ************************************************************************/
	function _showMsgBoxConfirm(sMsg, oOptions) {

		return new Promise(function (resolve) {

			let _sTitle = oOptions?.title;
			let _sStyleClass = oOptions?.styleClass || "";
			let _aActions = oOptions?.actions || [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL];
			let _sEmphasizedAction = oOptions?.emphasizedAction || sap.m.MessageBox.Action.OK;
			let _sInitialFocus = oOptions?.initialFocus;
			let _sTextDirection = oOptions?.textDirection || sap.ui.core.TextDirection.Inherit;

			sap.m.MessageBox.confirm(sMsg, {
				title: _sTitle,
				styleClass: _sStyleClass,
				actions: _aActions,
				emphasizedAction: _sEmphasizedAction,
				initialFocus: _sInitialFocus,
				textDirection: _sTextDirection,
				onClose: function (sAction) {
					resolve(sAction);
				},
			});

		});

	} // end of _showMsgBoxConfirm
    

	/*********************************************************
	 * @function - RandomKey 생성
	 *********************************************************
	 * @param {Integer} length
	 * - 숫자만큼 랜덤키 생성
	 *********************************************************/
     function getRandomKey(length) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	} // end of getRandomKey

	/************************************************************************
	 * @function - p13n 폴더에 저장된 Snippet 코드 정보를 구한다.
	 ************************************************************************/
	async function _getP13nSnippetCodeData(sKey) {
		
		let sSnippetCodeFile = PATH.join(MONACO_EDITOR_SNIPPET_P13N_ROOT, sKey);

		if(FS.existsSync(sSnippetCodeFile) === false){
			return "";
		}

		try {
			
			let sSavedSnippetCode = FS.readFileSync(sSnippetCodeFile, 'utf-8');

			return sSavedSnippetCode;

		} catch (error) {
			
			
		}

		return "";

	} // end of _getP13nSnippetCodeData


	/************************************************************************
	 * @function - p13n 폴더에 저장된 Snippet 코드 정보를 삭제한다.
	 ************************************************************************/
	async function _removeP13nSnippetCode(sKey) {
		
		let sSnippetCodeFile = PATH.join(MONACO_EDITOR_SNIPPET_P13N_ROOT, sKey);

		if(FS.existsSync(sSnippetCodeFile) === false){
			return;
		}

		try {
			
			let sSavedSnippetCode = FS.unlinkSync(sSnippetCodeFile, 'utf-8');

			return sSavedSnippetCode;

		} catch (error) {
			
			
		}

		return;

	} // end of _removeP13nSnippet


	/************************************************************************
	 * @function - p13n 폴더에 저장된 Snippet 정보를 구한다.
	 ************************************************************************/
    async function  _getP13nSnippetData() {
    
		let sSnippetListFile = PATH.join(MONACO_EDITOR_SNIPPET_P13N_ROOT, "list.json");
		if(FS.existsSync(sSnippetListFile) === false){
			return;
		}

		try {
			
			let sSavedSnippetList = FS.readFileSync(sSnippetListFile, 'utf-8');

			let aSavedSnippetList = JSON.parse(sSavedSnippetList);
			if(!aSavedSnippetList || Array.isArray(aSavedSnippetList) === false){
				return;
			}

			let aSnippetList = [];

			for(var oSavedSnippet of aSavedSnippetList){

				let oSnippet = JSON.parse(JSON.stringify(oContr.types.TY_SNIPPET));

				oSnippet._key = oSavedSnippet._key;
				oSnippet.snippet_langu = oSavedSnippet.snippet_langu;
				oSnippet.snippet_name = oSavedSnippet.snippet_name;
				oSnippet.snippet_desc = oSavedSnippet.snippet_desc;

				aSnippetList.push(oSnippet);

			}

			oContr.oModel.setProperty("/T_SNIPPET_LIST", aSnippetList);

		} catch (error) {
			
		}

        
    } // end of _getP13nSnippetData

	/************************************************************************
	 * @function - Snippet 목록 파일을 p13n 폴더에 저장
	 ************************************************************************/
	async function _saveP13nSnippetListData(aSnippetList) {		

		if(!aSnippetList || Array.isArray(aSnippetList) === false){
			return;
		}

		let aSaveSnippetList = [];

		for(var oItem of aSnippetList){

			let oSnippetItem = {};
			oSnippetItem._key = oItem._key;
			oSnippetItem.snippet_name = oItem.snippet_name;
			oSnippetItem.snippet_desc = oItem.snippet_desc;
			oSnippetItem.snippet_langu = oItem.snippet_langu;

			aSaveSnippetList.push(oSnippetItem);
		}

		// 스니펫 목록 저장
		try {
			
			let sSnippetListFilePath = PATH.join(MONACO_EDITOR_SNIPPET_P13N_ROOT, "list.json");

			FS.writeFileSync(sSnippetListFilePath, JSON.stringify(aSaveSnippetList), 'utf-8');    

		} catch (error) {			

			return { RETCD : "E" };

		}

		return { RETCD : "S" };

	} // end of _saveP13nSnippetListData


	/************************************************************************
	 * @function - Snippet Code를 p13n 폴더에 저장
	 ************************************************************************/
	async function _saveP13nSnippetCodeData(oSnippetData){
		
		// 스니펫 라인 정보 저장
		try {
			
			let sSnippetCodePath = PATH.join(MONACO_EDITOR_SNIPPET_P13N_ROOT, oSnippetData._key);

			FS.writeFileSync(sSnippetCodePath, oSnippetData.snippet_code, 'utf-8');	

		} catch (error) {

			return { RETCD : "E" };

		}

		return { RETCD : "S" };

	} // end of _saveP13nSnippetCodeData


	/************************************************************************
	 * @function - Snippet List & Snippet Item 데이터를 p13n 폴더에 저장
	 ************************************************************************/
    async function _saveP13nSnippetData(oSnippetData){		

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");
		if(!aSnippetList || Array.isArray(aSnippetList) === false){
			aSnippetList = [];
		}

		if(FS.existsSync(MONACO_EDITOR_SNIPPET_P13N_ROOT) === false){
            FS.mkdirSync(MONACO_EDITOR_SNIPPET_P13N_ROOT, { recursive: true });
        }

		// 스니펫 목록을 저장한다.
		let aSaveTargetList = [];
		
		for(var oItem of aSnippetList){

			if(oItem._isnew === true){
				continue;
			}

			aSaveTargetList.push(oItem);

		}

		// 기존에 저장된 스니펫 목록일 경우 update 한다.
		let oSnippetFound = aSaveTargetList.find(e => e._key === oSnippetData._key);
		if(oSnippetFound){
			oSnippetFound.snippet_name = oSnippetData.snippet_name;
			oSnippetFound.snippet_desc = oSnippetData.snippet_desc;
			oSnippetFound.snippet_langu = oSnippetData.snippet_langu;

		} else {
	
			aSaveTargetList.unshift(oSnippetData);

		}

		// 스니펫 목록 저장
		var oResult = await _saveP13nSnippetListData(aSaveTargetList);
		if(oResult.RETCD === "E"){
			return oResult;
		}

		// 스니펫 Item 저장
		var oResult = await _saveP13nSnippetCodeData(oSnippetData);
		if(oResult.RETCD === "E"){
			return oResult;
		}

		return { RETCD : "S" };

    } // end of _saveP13nSnippetData


	/************************************************************************
	 * @function - Snippet 저장 시 필수값 입력 및 데이터 정합성 체크
	 ************************************************************************/
	async function _checkSaveSnippetData() {

		let oSnippetData = oContr.oModel.getProperty('/S_SNIPPET');
		if (!oSnippetData) { 
			return { RETCD: "E" };
		}

		oSnippetData._snippet_langu_vs = "None";
		oSnippetData._snippet_name_vs = "None";
		oSnippetData._snippet_desc_vs = "None";
		oSnippetData._snippet_code_vs = "None";
		
		oSnippetData._snippet_langu_vst = "";
		oSnippetData._snippet_name_vst = "";
		oSnippetData._snippet_desc_vst = "";
		oSnippetData._snippet_code_vst = "";

		// 스니펫 언어 선택을 하지 않았을 경우
		if (!oSnippetData.snippet_langu) { 

			var sMsg = oContr.msg.M349; // 언어 선택은 필수 입니다.

			_showMsgToastCenter(sMsg);

			oSnippetData._snippet_langu_vs = "Error";
			oSnippetData._snippet_langu_vst = sMsg;

			oContr.oModel.refresh();

			await _waiting(0);

			oContr.ui.SELECT1.focus();			

			return { RETCD: "E" };
			
		}

		// 스니펫 이름을 지정하지 않았을 경우
		if (!oSnippetData.snippet_name) { 

			var sMsg = oContr.msg.M350; // 스니펫 이름은 필수 입니다.

			_showMsgToastCenter(sMsg);

			oSnippetData._snippet_name_vs = "Error";
			oSnippetData._snippet_name_vst = sMsg;

			oContr.oModel.refresh();

			await _waiting(0);

			oContr.ui.INPUT1.focus();

			return { RETCD: "E" };
		}

		if (/\s/.test(oSnippetData.snippet_name)) {

			var sMsg = oContr.msg.M351; // 스니펫 이름에 공백이 포함될 수 없습니다.

			_showMsgToastCenter(sMsg);

			oSnippetData._snippet_name_vs = "Error";
			oSnippetData._snippet_name_vst = sMsg;

			oContr.oModel.refresh();

			await _waiting(0);

			oContr.ui.INPUT1.focus();
			
			return { RETCD: "E" };
		}

		// 스니펫 코드를 입력하지 않았을 경우.
		if (!oSnippetData.snippet_code) {
			
			var sMsg = oContr.msg.M352;  // 스니펫의 코드를 입력하세요.

			_showMsgToastCenter(sMsg);

			oContr.oModel.refresh();

			await _waiting(0);

			oContr.fn.editorPostMessage({ actcd: "setFocus" });

			return { RETCD: "E" };

		}

		return { RETCD: "S" };

	} // end of _checkSaveSnippetData


	/*************************************************************
	 * @function - Row 선택 표시 (하이라이트) 제거
	 *************************************************************/
	function _removeAllSelectedRowHighlight() {

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");
		if (!aSnippetList || Array.isArray(aSnippetList) === false || aSnippetList.length === 0) {
			return;
		}

		let aSelectedRows = aSnippetList.filter(e => e._isSelectedRow === true);
		if (!aSelectedRows || Array.isArray(aSelectedRows) === false || aSelectedRows.length === 0) {
			return;
		}

		for (var oRow of aSelectedRows) {

			oRow._isSelectedRow = false;

		}

		oContr.oModel.refresh();

	} // end of _removeAllSelectedRowHighlight
    
    
	/*************************************************************
	 * @function - 스니펫 리스트에 신규건이면서 선택된 라인 데이터 구하기
	 *************************************************************/
	function _getNewLineSelectSnippetListItem() {

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");
		if (!aSnippetList || Array.isArray(aSnippetList) === false || aSnippetList.length === 0) {
			return { RETCD: "E" };
		}

		let oSelectedRow = aSnippetList.find(e => e._isSelectedRow === true && e._isnew === true);
		if (!oSelectedRow) {
			return { RETCD: "E" }
		}

		return { RETCD: "S", oRowData: oSelectedRow };

	} // end of _getNewLineSelectSnippetListItem


	/*************************************************************
	 * @function - 스니펫 리스트에 키 정보에 해당하는 라인을 선택표시
	 *************************************************************/
	function _setSelectedSnippetItem(sKey) {

		if (!sKey || typeof sKey !== "string") {
			return;
		}

		let oTable = oContr?.ui?.SLIPPET_TABLE;
		if (!oTable) {
			return;
		}

		let aItems = oTable.getItems();
		if (!aItems || Array.isArray(aItems) === false || aItems.length === 0) {
			return;
		}

		let oSelectItem;
		for (var oItem of aItems) {

			let oBindCtx = oItem.getBindingContext();
			if (!oBindCtx) {
				continue;
			}

			let oBindData = oBindCtx.getObject();
			if (!oBindData) {
				continue;
			}

			if (oBindData._key !== sKey) {
				continue;
			}

			oSelectItem = oItem;

			break;

		}

		if (!oSelectItem) {
			return;
		}

		oContr.ui.SLIPPET_TABLE.setSelectedItem(oSelectItem, true);

	} // end of _setSelectedSnippetItem
    
    
	/*************************************************************
	 * @function - 스니펫 리스트에서 키에 해당하는 Item 객체 리턴
	 *************************************************************/
	function _getSpippetListItemWithKey(sKey) {

		if (!sKey || typeof sKey !== "string") {
			return;
		}

		let oTable = oContr?.ui?.SLIPPET_TABLE;
		if (!oTable) {
			return;
		}

		let aItems = oTable.getItems();
		if (!aItems || Array.isArray(aItems) === false || aItems.length === 0) {
			return;
		}

		let oTargetItem;
		for (var oItem of aItems) {

			let oBindCtx = oItem.getBindingContext();
			if (!oBindCtx) {
				continue;
			}

			let oBindData = oBindCtx.getObject();
			if (!oBindData) {
				continue;
			}

			if (oBindData._key !== sKey) {
				continue;
			}

			oTargetItem = oItem;

			break;

		}

		return oTargetItem;

	} // end of _getSpippetListItemWithKey


    /*************************************************************
	 * @function - 로그인 언어별 메시지 구성
	 *************************************************************/
    function _setWsMsgTextConfig(){

        let sLoginLangu = USERINFO.LANGU;

        oContr.msg.M001 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "001");   // Language
        oContr.msg.M003 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "003");   // Cancel
        oContr.msg.M029 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "029");   // Delete
        oContr.msg.M073 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "073");   // Name
        oContr.msg.M080 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "080");   // 삭제하시겠습니까?        
        oContr.msg.M176 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "176");   // Description

        oContr.msg.M228 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "228");   // 문제가 지속될 경우, U4A 솔루션 팀에 문의하세요.
        oContr.msg.M349 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "349");   // 언어 선택은 필수 입니다.
        oContr.msg.M350 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "350");   // 스니펫 이름은 필수 입니다.
        oContr.msg.M351 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "351");   // 스니펫 이름에 공백이 포함될 수 없습니다.
        oContr.msg.M352 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "352");   // 스니펫의 코드를 입력하세요.
        oContr.msg.M353 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "353");   // 이미 추가된 신규건이 존재합니다.
        oContr.msg.M354 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "354");   // 입력한 정보는 초기화 됩니다. 계속하시겠습니까?
        oContr.msg.M355 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "355");   // 저장하지 않은 신규 데이터가 있습니다.
        oContr.msg.M356 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "356");   // 신규 항목을 무시하고 선택한 항목으로 이동하시겠습니까?
        oContr.msg.M357 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "357");   // 스니펫 삭제 후 개인화 파일 업데이트 중 오류가 발생하였습니다!
        oContr.msg.M358 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "358");   // 선택한 항목이 없습니다!
        oContr.msg.M359 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "359");   // 스니펫 목록 중, 하나를 선택하세요.
        oContr.msg.M360 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "360");   // 스니펫 리스트
        oContr.msg.M361 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "361");   // 신규 생성
        oContr.msg.M362 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "362");   // 스니펫 기본정보
        oContr.msg.M363 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "363");   // 스니펫 이름
        oContr.msg.M364 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "364");   // 스니펫 코드
        oContr.msg.M365 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "365");   // 저장
        oContr.msg.M366 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "366");   // 저장되었습니다!
        oContr.msg.M367 = WSUTIL.getWsMsgClsTxt(sLoginLangu, "ZMSG_WS_COMMON_001", "367");   // 스니펫 데이터 저장 중 문제가 발생하였습니다!






    } // end of _setWsMsgTextConfig


/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @flowEvent - 화면이 로드 될때 타는 이벤트
     *************************************************************/
    oContr.onViewReady = async function () {

        await oContr.fn.setInit();

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady

    /**
     * 초기 설정
     */
    oContr.fn.setInit = async function () {

        /* 초기 모델 설정 */
        _initModel();

        await _getP13nSnippetData();

        // 에디터 영역에 readonly 적용
        oContr.fn.editorPostMessage({ actcd: "readonly", value: true });

        // 에디터 영역에 데이터 클리어 적용
		oContr.fn.editorPostMessage({ actcd: "clear" });

		// 상단 툴바 버튼 핸들
		oContr.fn.setPageToolHdrBtnHandle();

    }; /* end of oContr.fn.setInit */


	/*************************************************************
	 * @function - Busy Indicator
	 *************************************************************/
	oContr.fn.setBusy = function (bIsbusy) {

        let sIsBusy = (bIsbusy === true ? "X" : "");

		oAPP.fn.setBusy(sIsBusy);

	}; // end of oContr.fn.setBusy


	/*************************************************************
	 * @function - 상단 툴바 버튼 핸들
	 *************************************************************/
	oContr.fn.setPageToolHdrBtnHandle = function () {

		let oPageHdle = oContr.oModel.getProperty('/S_PAGE_HDR_HNDL');
		if (!oPageHdle) {
			return;
		}

		let oSnippetData = oContr.oModel.getProperty('/S_SNIPPET');
		if (!oSnippetData) {
			return;
		}

		if (oSnippetData._isnew === false) {
			oPageHdle.newBtn_enable = true;		// 신규 버튼 Edit
			oPageHdle.delBtn_enable = false;	// 삭제 버튼 Edit
			oPageHdle.saveBtn_enable = false;	// 저장 버튼 Edit
			oPageHdle.cancBtn_enable = false;	// 취소 버튼 Edit	
		}

		if (oSnippetData._isnew === true) {
			oPageHdle.newBtn_enable = false;	// 신규 버튼 Edit
			oPageHdle.delBtn_enable = false;	// 삭제 버튼 Edit
			oPageHdle.saveBtn_enable = true;	// 저장 버튼 Edit
			oPageHdle.cancBtn_enable = true;	// 취소 버튼 Edit	
		}

		// 키가 있다는건 삭제 가능?
		if (oSnippetData._key && oSnippetData._ischg === false && oSnippetData._isnew === false) {
			oPageHdle.delBtn_enable = true;
			oPageHdle.saveBtn_enable = true;
		}

		oContr.oModel.setProperty('/S_PAGE_HDR_HNDL', oPageHdle);

	}; // end of oContr.fn.setPageToolHdrBtnHandle
    
    
	/*************************************************************
	 * @function - 스니펫 목록 선택 이벤트
	 *************************************************************/
	oContr.fn.onPressDetail = async function (oSelectItem) {

		// Busy On
		oContr.fn.setBusy(true);		

		// 특정 영역 포커스 시 생기는 CSS로 그려진 파란 테두리를 제거하기 위한 포커스 제거
		_activeElementBlur();

		if (!oSelectItem) {
			// Busy Off
			oContr.fn.setBusy(false);
			return;
		}

		// 좌측 스니펫 목록
		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");

		// 우측 스니펫 상세
		let oSnippet = oContr.oModel.getProperty("/S_SNIPPET");
		if (!oSnippet) {
			// Busy Off
			oContr.fn.setBusy(false);
			return;
		}

		let oBindCtx = oSelectItem.getBindingContext();
		if (!oBindCtx) {
			// Busy Off
			oContr.fn.setBusy(false);
			return;
		}

		// 선택된 바인딩 정보 구하기
		let oBindData = oBindCtx.getObject();

		/**
		 * 선택한 라인이 기존에 선택된 라인이면서,
		 * 우측의 스니펫 정보의 내부키와 같을 경우에는 이미 선택되어 있는 라인이므로 빠져나간다.
		 */
		if (oBindData._isSelectedRow === true && oBindData._key === oSnippet._key) {

			// Busy Off
			oContr.fn.setBusy(false);

			return;

		}

		// 스니펫 리스트에서 선택된 라인 중, 신규 라인이 존재하는지 확인	
		var oCheckSelNewLine = _getNewLineSelectSnippetListItem();
		if (oCheckSelNewLine.RETCD === "S") {

			let oRowData = oCheckSelNewLine?.oRowData || undefined;

			// 스니펫 리스트에서 선택된 라인과 우측 스니펫 상세 데이터가 다를 경우에만 질문 팝업을 띄운다.
			if (oBindData._key !== oRowData._key) {

                // 저장하지 않은 신규 데이터가 있습니다.\n\n신규 항목을 무시하고 선택한 항목으로 이동하시겠습니까?
				var sMsg = oContr.msg.M355 + "\n\n" + oContr.msg.M356;

				// Busy Off
				oContr.fn.setBusy(false);

				let sAction = await _showMsgBoxConfirm(sMsg);
				if (sAction === "CANCEL") {

					// 기존라인 선택 표시			
					_setSelectedSnippetItem(oRowData._key);

					// 특정 영역 포커스 시 생기는 CSS로 그려진 파란 테두리를 제거하기 위한 포커스 제거
					_activeElementBlur();
					
					// Busy Off
					oContr.fn.setBusy(false);

					return;

				}

				// Busy On
				oContr.fn.setBusy(true);

				// 추가된 신규 라인 삭제
				aSnippetList = aSnippetList.filter(e => e._isnew !== true);

				oContr.oModel.setProperty("/T_SNIPPET_LIST", aSnippetList);

			}

		}

		// 기존 데이터 중, 변경된 데이터가 존재할 경우 경고 메시지 출력
		if (oSnippet._isnew === false && oSnippet._ischg === true) {

            var sMsg = oContr.msg.M354;   // 입력한 정보는 초기화 됩니다. 계속하시겠습니까?  

			// Busy Off
			oContr.fn.setBusy(false);

			let sAction = await _showMsgBoxConfirm(sMsg);

			if (sAction === "CANCEL") {

				let oBeforeSelectRowData = aSnippetList.find(e => e._isSelectedRow === true);
				if (oBeforeSelectRowData) {

					// 기존라인 선택 표시			
					_setSelectedSnippetItem(oBeforeSelectRowData._key);

					// 특정 영역 포커스 시 생기는 CSS로 그려진 파란 테두리를 제거하기 위한 포커스 제거
					_activeElementBlur();

				}

				// Busy Off
				oContr.fn.setBusy(false);

				return;

			}

			// Busy On
			oContr.fn.setBusy(true);

		}

		// Row 선택 표시 (하이라이트) 제거
		_removeAllSelectedRowHighlight();

		oBindData._isSelectedRow = true;

		// 스니펫 입력필드 활성화
		oBindData._snippet_langu_edit = true;
		oBindData._snippet_name_edit = true;
		oBindData._snippet_desc_edit = true;

		// 스니펫 코드 정보를 구한다.
		oBindData.snippet_code = await _getP13nSnippetCodeData(oBindData._key);

		// 선택된 바인딩 정보를 우측 화면에 출력
		oContr.oModel.setProperty('/S_SNIPPET', JSON.parse(JSON.stringify(oBindData)));

		// 상단 툴바 버튼 핸들
		oContr.fn.setPageToolHdrBtnHandle();

		// 기존라인 선택 표시			
		_setSelectedSnippetItem(oBindData._key);

		let oNavcon = oContr.ui.NAVCON1;
		let oSnippetPage = oContr.ui.SNIPPET_PAGE;

		// 기존에 스니펫 페이지가 있다면 지우고 다시 붙인다.
		let oPage = oNavcon.getPage(oSnippetPage.getId());
		if (oPage) { 
			oNavcon.removePage(oSnippetPage);
		}

		oNavcon.addPage(oSnippetPage);

		// 스니펫 등록 수정 화면으로 이동
		oNavcon.to(oSnippetPage);

		/**
		 * iFrame에 감싸진 EDITOR 가 로드 완료되는 시점을 감지
		 */
		let oIFDOM = document.getElementById("if-editor");

		let lf_editor_load = function () {			

			oIFDOM.removeEventListener("EDITOR_LOAD", lf_editor_load);

			// 에디터 영역 활성화		
			oContr.fn.editorPostMessage({ actcd: "readonly", value: false });

			// 선택된 스니펫 코드 정보를 에디터에 전송하여 출력
			oContr.fn.editorPostMessage({ actcd: "setValue", value: oBindData.snippet_code });

			// Busy Off
			oContr.fn.setBusy(false);

		};

		oIFDOM.addEventListener("EDITOR_LOAD", lf_editor_load);

	}; // end of oContr.fn.onPressDetail
    
    
	/*************************************************************
	 * @function - editor에 PostMessage 전송
	 *************************************************************/
	oContr.fn.editorPostMessage = function (oPARAM) {

		if (!oPARAM || !oPARAM?.actcd) {
			return;
		}

		let aEditorFrames = document.querySelectorAll(".MONACO_EDITOR");
		if (!aEditorFrames.length) {
			return;
		}

		for (var oEditor of aEditorFrames) {

			if (!oEditor?.contentWindow) {
				continue;
			}

			oEditor.contentWindow.postMessage(oPARAM);

		}

	}; // end of oContr.fn.editorPostMessage


	/*************************************************************
	 * @function - [공통] 스니펫 입력 필드 UI의 Change 이벤트
	 *************************************************************/
	oContr.fn.onSnippetInfoChange = async function (oUI) {		

		let oSnippetData = oContr.oModel.getProperty("/S_SNIPPET");
		if (!oSnippetData) {
			return;
		}

		// 변경 플래그 지정
		oSnippetData._ischg = true;

		/**
		 * ValueState 초기화
		 */
		oSnippetData._snippet_langu_vs  = "None";
		oSnippetData._snippet_langu_vst = "";

		oSnippetData._snippet_name_vs = "None";
		oSnippetData._snippet_name_vst = "";

		oSnippetData._snippet_desc_vs = "None";
		oSnippetData._snippet_desc_vst = "";

		oSnippetData._snippet_code_vs = "None";
		oSnippetData._snippet_code_vst = "";

		// UI ID 별 Change 이벤트 시 수행할 로직
		let sUI_ID = oUI.data("uid");

		switch (sUI_ID) {
			case "snippet_langu":			

				let sSelectedKey = oUI.getSelectedKey();
				if (sSelectedKey) {
					break;
				}			

				var sMsg = oContr.msg.M349; // 언어 선택은 필수 입니다.
				
				oSnippetData._snippet_langu_vs = "Error";
				oSnippetData._snippet_langu_vst = sMsg;				

				oContr.oModel.refresh();

				await _waiting(0);

				oUI.focus();

				_showMsgToastCenter(sMsg);
				
				break;

			case "snippet_name":

				var sValue = oUI.getValue();

				if (/\s/.test(sValue)) { 

					var sMsg = oContr.msg.M351; // 스니펫 이름에 공백이 포함될 수 없습니다.

					_showMsgToastCenter(sMsg);

					oSnippetData._snippet_name_vs = "Error";
					oSnippetData._snippet_name_vst = sMsg;

					oContr.oModel.refresh();

					await _waiting(0);

					oUI.focus();

					break;
				}
				
				break;

			default:

				break;				
				
		}		

		oContr.oModel.setProperty("/S_SNIPPET", oSnippetData);

	}; // end of oContr.fn.onSnippetInfoChange


	/*************************************************************
	 * @function - 에디터가 로드가 된 이후 호출 되는 function
	 *************************************************************/
	oContr.fn.onFrameLoadEditor = function () {		

	}; // end of oContr.fn.onFrameLoadEditor


	/*************************************************************
	 * @function - 신규버튼
	 *************************************************************/
	oContr.fn.newSnippet = async function () {

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");

		// 이미 신규건이 존재할 경우 해당 라인의 위치로 이동시킨 후 focus를 준다.
		let oNewSnippet = aSnippetList.find(e => e._isnew === true);
		if (oNewSnippet) {

			let sMsg = oContr.msg.M353; // 이미 추가된 신규건이 존재합니다.

			_showMsgToastCenter(sMsg);

			return;

		}

		// 스니펫 등록 정보를 구한다.
		var oSnippet = oContr.oModel.getProperty("/S_SNIPPET");
		if (!oSnippet) {
			return;
		}


		// 변경된 데이터가 존재할 경우 경고 메시지 출력
		if (oSnippet._ischg === true) {

			var sMsg = oContr.msg.M354;   // 입력한 정보는 초기화 됩니다. 계속하시겠습니까?  

			let sAction = await _showMsgBoxConfirm(sMsg);

			if (sAction === "CANCEL") {
				return;
			}

		}

		oContr.ui.SNIPPET_LIST_PAGE.scrollTo(0, 300);

		// 화면 초기 설정
		await oContr.fn.setInit();

		var oSnippet = oContr.oModel.getProperty("/S_SNIPPET");
		if (!oSnippet) {
			return;
		}

		oSnippet._key = getRandomKey(30);
		oSnippet._isnew = true;

		aSnippetList.unshift(oSnippet);

		oContr.oModel.setProperty("/T_SNIPPET_LIST", aSnippetList);

		// oContr.oModel.setProperty("/S_SNIPPET", oSnippet);

		var oTable = oContr.ui.SLIPPET_TABLE;

		var aItems = oTable.getItems();

		// 첫번째 라인을 선택 표시한다.
		var oSelectItem = aItems[0] || undefined;
		if (oSelectItem) {

			oContr.ui.SLIPPET_TABLE.setSelectedItem(oSelectItem, true);

			oSelectItem.fireDetailPress();

		}

	}; // end of oContr.fn.newSnippet    


	/*************************************************************
	 * @function - 스니펫 삭제 버튼
	 *************************************************************/
	oContr.fn.deleteSnippet = async function () {

		// 좌측 스니펫 목록
		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");
		if (!aSnippetList || Array.isArray(aSnippetList) === false || aSnippetList.length === 0) {
			return;
		}

		let oSelectItemData = aSnippetList.find(e => e._isSelectedRow === true);
		if (!oSelectItemData) {
			return;
		}

		// 삭제할 위치로 스크롤 이동
		let sItemKey = oSelectItemData?._key;
		if (sItemKey) { 

			// 해당 위치로 이동		
			let oNewItem = _getSpippetListItemWithKey(sItemKey);
			if (oNewItem) {
				oContr.ui.SNIPPET_LIST_PAGE.scrollToElement(oNewItem, 300, [0, -80]);
			}

		}

		// 삭제라인 선택 표시			
		_setSelectedSnippetItem(sItemKey);

		let sMsg = oContr.msg.M080; // 삭제하시겠습니까?
		let sAction = await _showMsgBoxConfirm(sMsg);
		if (sAction === "CANCEL") {
			return;
		}

		// 스니펫 목록에서 삭제대상 라인의 인덱스를 구한다.
		let iFindIndex = aSnippetList.findIndex(e => e._key === sItemKey);

		// 선택한 라인을 제거한다.
		aSnippetList = aSnippetList.filter(e => e._isSelectedRow !== true);

		// 제거한 나머지 스니펫 정보를 P13n에 저장한다.
		var oResult = await _saveP13nSnippetListData(aSnippetList);
		if(oResult.RETCD === "E"){

			// 스니펫 삭제 후 개인화 파일 업데이트 중 오류가 발생하였습니다!\n\n문제가 지속될 경우, U4A 솔루션 팀에 문의하세요.
			var sErrMsg = oContr.msg.M357 + "\n\n" +  oContr.msg.M228;

			sap.m.MessageBox.error(sErrMsg);

			return;
		}

		// P13n 폴더에 저장되어 있는 스니펫 코드 파일을 삭제한다.
		await _removeP13nSnippetCode(sItemKey);

		// 선택한 라인을 제거한 후 모델에 반영
		oContr.oModel.setProperty("/T_SNIPPET_LIST", aSnippetList);

		// Snippet 리스트 테이블 선택 표시 해제 하기
		oContr.ui.SLIPPET_TABLE.removeSelections();

		// 모델 초기화
		await oContr.fn.setInit();

		// 메시지 페이지 화면으로 이동효과
		oContr.ui.NAVCON1.to(oContr.ui.MSG_PAGE);

		let oSnippetData;

		// 삭제 대상 라인에서 다음 라인이 있을 경우 해당 라인을 선택 표시하고,
		// 없으면 상위 라인 선택 표시한다.
		if (iFindIndex <= 0) {

			oSnippetData = aSnippetList[0];	
				
		} else { 

			oSnippetData = aSnippetList[iFindIndex];

			if (!oSnippetData) { 
				oSnippetData = aSnippetList[iFindIndex - 1];				
			}

		}

		if (oSnippetData) { 

			let oSnippetItem = _getSpippetListItemWithKey(oSnippetData._key);
			oSnippetItem.fireDetailPress();

		}

		// 스니펫 변경 신호를 전체 브라우저에 전송
		_sendSnippetChangeSignal();

	}; // end of oContr.fn.deleteSnippet


	/*************************************************************
	 * @function - 스니펫 저장
	 *************************************************************/
	oContr.fn.saveSnippet = async function () {

		let oSnippet = oContr.oModel.getProperty("/S_SNIPPET");
		if (!oSnippet) {
			return;
		}

		let oCheckResult = await _checkSaveSnippetData();
		if (oCheckResult.RETCD === "E") { 
			return;
		}	

		oSnippet._isnew = false;
		oSnippet._ischg = false;

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");

		// 입력한 스니펫 정보를 우측의 테이블에 해당하는 라인정보에 업데이트 한다.
		let oSaveTarget = aSnippetList.find(e => e._key === oSnippet._key);
		if (!oSaveTarget) {
			return;
		}

		// 저장할 스니펫 정보 구조
        let oSaveData = {};

		oSaveData._key          = oSnippet._key;
		oSaveData.snippet_code  = oSnippet.snippet_code;
		oSaveData.snippet_desc  = oSnippet.snippet_desc;
		oSaveData.snippet_langu = oSnippet.snippet_langu;
		oSaveData.snippet_name  = oSnippet.snippet_name;

        // 입력한 정보를 p13n-> snippet에 저장
        let oSaveResult = await _saveP13nSnippetData(oSaveData);
		if(oSaveResult.RETCD === "E"){

			// 스니펫 데이터 저장 중 문제가 발생하였습니다!\n\n문제가 지속될 경우, U4A 솔루션 팀에 문의하세요.
			let sErrMsg = oContr.msg.M367 + "\n\n" + oContr.msg.M228;

			sap.m.MessageBox.error(sErrMsg);

			return;

		}

		// oSaveTarget.snippet_code    = oSnippet.snippet_code;
		oSaveTarget.snippet_desc    = oSnippet.snippet_desc;
		oSaveTarget.snippet_langu   = oSnippet.snippet_langu;
		oSaveTarget.snippet_name    = oSnippet.snippet_name;

		oSaveTarget._isnew = oSnippet._isnew;
		oSaveTarget._ischg = oSnippet._ischg;

		oContr.oModel.refresh();

		var sMsg = oContr.msg.M366; // 저장되었습니다!

		sap.m.MessageToast.show(sMsg, { my: "center center", at: "center center" });

		// 상단 툴바 버튼 핸들
		oContr.fn.setPageToolHdrBtnHandle();

		// 스니펫 변경 신호를 전체 브라우저에 전송
		_sendSnippetChangeSignal();
		
	}; // end of oContr.fn.saveSnippet


	/*************************************************************
	 * @function - 스니펫 등록 취소 버튼
	 *************************************************************/
	oContr.fn.cancelSnippet = async function () {

		let oSnippetData = oContr.oModel.getProperty('/S_SNIPPET');
		if (!oSnippetData) {
			return;
		}

		if (oSnippetData._ischg === true) {

			var sMsg = oContr.msg.M354; // 입력한 정보는 초기화 됩니다. 계속하시겠습니까?

			let sAction = await _showMsgBoxConfirm(sMsg);

			if (sAction === "CANCEL") {
				return;
			}

		}

		// Snippet 리스트 테이블 선택 표시 해제 하기
		oContr.ui.SLIPPET_TABLE.removeSelections();

		// 전체 모델 초기화 설정
		await oContr.fn.setInit();

		let aSnippetList = oContr.oModel.getProperty("/T_SNIPPET_LIST");

		aSnippetList = aSnippetList.filter(e => e._isnew !== true);

		oContr.oModel.setProperty("/T_SNIPPET_LIST", aSnippetList);

		// 메시지 페이지 화면으로 이동
		oContr.ui.NAVCON1.to(oContr.ui.MSG_PAGE);

	}; // end of oContr.fn.cancelSnippet


	/*************************************************************
	 * @function - 브라우저 닫기버튼
	 *************************************************************/
	oContr.fn.browserClose = function () {

		sap.m.MessageToast.show("Close Button pressed!");

	}; // end of oContr.fn.browserClose




    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/


/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };