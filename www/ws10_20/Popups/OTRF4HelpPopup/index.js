/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/index.js
 ************************************************************************/



/************************************************************************
 * 에러 감지 (index.js)
 ************************************************************************/
let zconsole = parent.WSERR(window, document, console);

//var oAPP = parent.oAPP;
var oAPP = parent.gfn_getParent();

(function (window, oAPP) {

	oAPP.settings = {};

	let PATH = oAPP.PATH,
		APP = oAPP.APP,
		PATHINFO = parent.PATHINFO,
		require = parent.require;

	/************************************************************************
	 * 모델 데이터 set
	 * **********************************************************************
	 * @param {String} sModelPath  
	 * - Model Path 명
	 * 예) /WS10/APPDATA
	 * @param {Object} oModelData
	 * 
	 * @param {Boolean} bIsRefresh 
	 * model Refresh 유무
	 ************************************************************************/
	oAPP.fn.fnSetModelProperty = function (sModelPath, oModelData, bIsRefresh) {

		var oCoreModel = sap.ui.getCore().getModel();
		oCoreModel.setProperty(sModelPath, oModelData);

		if (bIsRefresh) {
			oCoreModel.refresh(true);
		}

	}; // end of oAPP.common.fnSetModelProperty

	/************************************************************************
	 * 모델 데이터 get
	 * **********************************************************************
	 * @param {String} sModelPath  
	 * - Model Path 명
	 * 예) /WS10/APPDATA
	 ************************************************************************/
	oAPP.fn.fnGetModelProperty = function (sModelPath) {

		return sap.ui.getCore().getModel().getProperty(sModelPath);

	}; // end of oAPP.fn.fnGetModelProperty

	/************************************************************************
	 * ws의 설정 정보를 구한다.
	 ************************************************************************/
	oAPP.fn.getSettingsInfo = function () {

		// Browser Window option
		var sSettingsJsonPath = PATHINFO.WSSETTINGS,

			// JSON 파일 형식의 Setting 정보를 읽는다..
			oSettings = require(sSettingsJsonPath);
		if (!oSettings) {
			return;
		}

		return oSettings;

	}; // end of oAPP.fn.getSettingsInfo

	// /************************************************************************
	//  * UI5 BootStrap 
	//  ************************************************************************/
	oAPP.fn.fnLoadBootStrapSetting = function () {

		var oSettings = oAPP.fn.getSettingsInfo(),
			oSetting_UI5 = oSettings.UI5,
			oBootStrap = oSetting_UI5.bootstrap,
			oUserInfo = oAPP.attr.oUserInfo,
			oThemeInfo = oAPP.fn.getThemeInfo(),
			// oThemeInfo = oAPP.attr.oThemeInfo,
			sLangu = oUserInfo.LANGU;

		var oScript = document.createElement("script");
		oScript.id = "sap-ui-bootstrap";

		// 공통 속성 적용
		for (const key in oBootStrap) {
			oScript.setAttribute(key, oBootStrap[key]);
		}

		// 로그인 Language 적용
		oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
		oScript.setAttribute("data-sap-ui-language", sLangu);
		oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.table, sap.ui.layout");
		oScript.setAttribute("src", oSetting_UI5.resourceUrl);

		document.head.appendChild(oScript);

	}; // end of fnLoadBootStrapSetting


	/************************************************************************
	 * 초기 모델 바인딩
	 ************************************************************************/
	oAPP.fn.fnInitModelBinding = function () {

		// var oFind2Data = oAPP.fn.fnGetFindData2();

		// var oModelData = {
		//     SELKEY: C_FIND_MENU1_ID,
		//     MENULIST: oAPP.fn.fnGetFindMenuList(), // find의 메뉴 리스트       
		//     FIND1TABLE: oAPP.fn.fnGetFindData1(),
		//     FIND2LEFT: oFind2Data.LEFT,
		//     FIND2RIGHT: oFind2Data.RIGHT,
		//     FIND3TABLE: oAPP.fn.fnGetFindData3(),
		//     FIND4TABLE: oAPP.fn.fnGetFindData4(),
		// };

		// var oJsonModel = new sap.ui.model.json.JSONModel();
		// oJsonModel.setData({
		//     FIND: oModelData
		// });

		// sap.ui.getCore().setModel(oJsonModel);

	}; // end of oAPP.fn.fnInitModelBinding

	/************************************************************************
	 * 화면 초기 렌더링
	 ************************************************************************/
	oAPP.fn.fnInitRendering = function () {



	}; // end of oAPP.fn.fnInitRendering



	function sendAjax(sPath, oFormData, fn_success) {

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () { // 요청에 대한 콜백
			if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
				if (xhr.status === 200 || xhr.status === 201) {

					fn_success(JSON.parse(xhr.response));

				}
			}
		};


		// test..
		xhr.withCredentials = true;

		// FormData가 없으면 GET으로 전송
		xhr.open("post", sPath, true);

		xhr.send(oFormData);


	} // end of sendAjax


	/*************************************************************
     * @function - SYSID에 해당하는 테마 변경 IPC 이벤트
     *************************************************************/
    function _onIpcMain_if_p13n_themeChange(){ 

        let oThemeInfo = oAPP.fn.getThemeInfo();
        if(!oThemeInfo){
            return;
        }

        let sWebConBodyCss = `html, body { margin: 0px; height: 100%; background-color: ${oThemeInfo.BGCOL}; }`;
        let oBrowserWindow = oAPP.REMOTE.getCurrentWindow();
            oBrowserWindow.webContents.insertCSS(sWebConBodyCss);

        sap.ui.getCore().applyTheme(oThemeInfo.THEME);

    } // end of _onIpcMain_if_p13n_themeChange
	

	/*************************************************************
     * @function - IPC Event 등록
     *************************************************************/
    function _attachIpcEvents(){

        let oUserInfo = parent.process.USERINFO;
        let sSysID = oUserInfo.SYSID;

        // SYSID에 해당하는 테마 변경 IPC 이벤트를 등록한다.
        oAPP.IPCMAIN.on(`if-p13n-themeChange-${sSysID}`, _onIpcMain_if_p13n_themeChange); 

    } // end of _attachIpcEvents


	/************************************************************************
	 * -- Start of Program
	 ************************************************************************/

	// // UI5 Boot Strap을 로드 하고 attachInit 한다.
	oAPP.fn.fnLoadBootStrapSetting();

	window.onload = function () {

		sap.ui.getCore().attachInit(function () {

			oAPP.fn.setBusyIndicator("X");

			// IPC Event 등록
            _attachIpcEvents();

			//oAPP.fn.callOTRListPopup("ZHU4A_OTR_INF", "ZHU4A_OTR_INF", [], []);
			oAPP.fn.callOTRListPopup("/U4A/H_OTR_INF", "/U4A/H_OTR_INF", [], []);

			// oAPP.fn.fnInitModelBinding();

			// oAPP.fn.fnInitRendering();

			// 브라우저 처음 실행 시 보여지는 Busy Indicator 끄기
			parent.oAPP.fn.setBusyLoading('');

		});

		parent.oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oAPP.BROWSKEY}`);        

        parent.oAPP.broadToChild.onmessage = function(oEvent){

            var _PRCCD = oEvent?.data?.PRCCD || undefined;

            if(typeof _PRCCD === "undefined"){
                return;
            }

            //프로세스에 따른 로직분기.
            switch (_PRCCD) {
                case "BUSY_ON":

                    //BUSY ON을 요청받은경우.
                    parent.oAPP.fn.setBusyIndicator("X", {ISBROAD:true});
                    break;

                case "BUSY_OFF":
                    //BUSY OFF를 요청 받은 경우.
                    parent.oAPP.fn.setBusyIndicator("",  {ISBROAD:true});
                    break;

                default:
                    break;
            }

        };

	};
   

	

	//OTR 검색 팝업 호출.
	oAPP.fn.callOTRListPopup = function (I_SHLPNAME, I_SHLP_DEF, IT_SHLP, IT_FIELDDESCR, f_clientCallbak) {

		//검색조건 필드 구성.
		function lf_setSearchCondition(SHLPNAME, it_fdesc) {

			//검색조건 영역 제거.
			oForm.removeAllContent();

			for (var i = 0, l = it_fdesc.length; i < l; i++) {

				//검색조건 필드정보가 아닌경우 skip.
				if (it_fdesc[i].SHLPSELPOS === 0) {
					continue;
				}

				var oLb = new sap.m.Label({ design: "Bold" });

				//default 검색조건 필드명.
				var l_lbtx = it_fdesc[i].SCRTEXT_M;


				//검색조건 라벨 text 구성.
				oLb.setText(l_lbtx);

				//form에 label 추가.
				oForm.addContent(oLb);

				//일반 필드의 경우 value 프로퍼티에 바인딩 처리.
				var l_prop = "value";

				//data type에따른 검색필드 분기.
				switch (it_fdesc[i].DATATYPE) {
					case "D":
						// DATE TYPE인경우.
						var oSFld = new sap.m.DatePicker({ valueFormat: "yyyyMMdd", displayFormat: "yyyy.MM.dd" });
						break;

					case "T":
						// TIME인경우.
						var oSFld = new sap.m.TimePicker({ valueFormat: "HHmmss", displayFormat: "HH:mm:ss" });
						break;

					default:
						// DEFAULT INPUT필드.
						var oSFld = new sap.m.Input({ type: "Text", valueLiveUpdate: true, maxLength: it_fdesc[i].OUTPUTLEN });

						//enter event
						oSFld.attachSubmit(function () { LF_getServerData(); });
						break;
				}


				var l_path = it_fdesc[i].FIELDNAME;

				//필드명에 /가 있다면 x로 변환 처리.
				if (l_path.indexOf("/") !== -1) {
					l_path = l_path.replace(/\//g, "x");
				}

				//검색조건 필드 바인딩 처리.
				oSFld.bindProperty(l_prop, { path: "/param/" + l_path });

				//form에 검색필드 추가.
				oForm.addContent(oSFld);

				//PARAMETER에 설정된 default 값을 기본으로 구성.
				var l_dfval = it_fdesc[i].DFVAL;

				//기본값이 구성된 경우.
				if (l_dfval !== "") {
					oSFld.setProperty(l_prop, l_dfval);
					oSFld.updateProperty(l_prop, true);
				}

			}

		}   //검색조건 필드 구성.


		//결과리스트 컬럼 설정.
		function lf_setTableColumn(SHLPNAME, it_fdesc) {

			for (var i = 0, l = it_fdesc.length; i < l; i++) {

				//결과리스트 필드정보가 아닌경우 skip.
				if (it_fdesc[i].SHLPLISPOS === 0) {
					continue;
				}

				//column UI정보.
				var oCol = new sap.ui.table.Column({ autoResizable: true });

				//header text UI정보.
				var oLab = new sap.m.Label();

				//default 컬럼 텍스트.
				var l_txt = it_fdesc[i].SCRTEXT_S;


				//header text 구성.
				oLab.setText(l_txt);

				//column에 header text UI추가.
				oCol.setLabel(oLab);

				//table에 column정보 추가.
				oTable.addColumn(oCol);

				var l_type, l_len = 0;

				// ABAP TYPE에 따른 로직 분기.
				switch (it_fdesc[i].DATATYPE) {
					case "DATS":  //DATE 타입인경우.
						l_type = "D";
						l_len = 8;
						break;

					case "TIMS":  //TIME 타입인경우.
						l_type = "T";
						l_len = 6;
						break;

					default:  //DEFAULT는 STRING.
						l_type = "STRING";
						l_len = 0;
						break;

				}

				var l_path = it_fdesc[i].FIELDNAME;

				//필드명에 /가 있다면 x로 변환 처리.
				if (l_path.indexOf("/") !== -1) {
					l_path = l_path.replace(/\//g, "X");
				}

				//TABLE CELL 출력 TEXT UI.
				var oTxt = new sap.m.Text({ text: { path: l_path } });

				//column list item에 text ui 추가.
				oCol.setTemplate(oTxt);

			}

		}   //결과리스트 컬럼 설정.



		//-검색 서버 조회 전송 처리 스크립트 펑션 생성
		function LF_getServerData() {

			oAPP.fn.setBusyIndicator("X");

			oTable.setBusy(true);
			SerchBT1.setBusy(true);

			//application명 서버전송 데이터 구성.
			var oFormData = new FormData();
			oFormData.append("trgubun", "D");

			oFormData.append("_SHLPNAME", I_SHLPNAME);

			//구성한 현재 F4 HELP명 수집.
			oFormData.append("_SHLPSUB", I_SHLPNAME);

			//~MAX ROW
			oFormData.append("_MAXROWS", ZF4SH_input01.getValue());

			//검색조건 입력정보 수집.
			for (var i in ZF4searchModle.oData.param) {
				oFormData.append(i, ZF4searchModle.oData.param[i]);
			}


			//검색조건에 따른 결과 리스트 검색을 위한 서버 호출.
			sendAjax(oAPP.attr.servNm + "/f4serverData", oFormData, function (param) {
				//~조회 정보 존재시 data 처리

				//A73  Search Result
				var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A73", "", "", "", "");

				if (param.TEXT[0].NAME == "REFDATA") {

					modeloTable.oData.TF4LIST = [];
					var visiRow = Number(param.TEXT[1].VALUE);
					var Ltext = l_txt + " : " + visiRow;
					ZF4SH_LBresult.setText(Ltext);
					if (visiRow > 5) { oPanel.setExpanded(false); }
					if (visiRow > 10) { visiRow = 10; }
					var jsonData = param.TEXT[0].VALUE;
					modeloTable.setData(JSON.parse(jsonData));
				}

				//~조회 data 처리 누락이라면 ..
				if (param.TEXT[0].NAME == "NOTFOUND") {
					ZF4SH_LBresult.setText(l_txt + " : 0");

					modeloTable.oData.TF4LIST = [];
					modeloTable.refresh();
					var Ltxt = param.TEXT[0].VALUE;

					//~Message 처리
					sap.m.MessageToast.show(Ltxt);

				}

				oTable.setBusy(false);
				SerchBT1.setBusy(false);

				oAPP.fn.setBusyIndicator("");

			}); //검색조건에 따른 결과 리스트 검색을 위한 서버 호출.


		}   //-검색 서버 조회 전송 처리 스크립트 펑션 생성



		//f4 help 필드정보 얻기.
		function lf_getF4Field() {

			//application명 서버전송 데이터 구성.
			var oFormData = new FormData();
			oFormData.append("trgubun", "F");

			// oFormData.append("sap-user", "PES");
			// oFormData.append("sap-password", "dmstjq8!");
			// oFormData.append("sap-language", "EN");

			//대표 f4 help명.
			oFormData.append("_SHLPNAME", I_SHLPNAME);

			//현재 선택한 f4 help명수집.
			oFormData.append("_SHLPSUB", I_SHLPNAME);


			//f4 help 필드정보 검색.
			sendAjax(oAPP.attr.servNm + "/f4serverData", oFormData, function (param) {

				//~조회입력 패널 펼침
				oPanel.setExpanded(true);

				//검색조건 영역 재설정.
				lf_setSearchCondition(I_SHLPNAME, param);

				//결과리스트 컬럼 재설정.
				lf_setTableColumn(I_SHLPNAME, param);

				//ipc로 메인 호출처로 로딩 완료여부 전송.

				var CURRWIN = oAPP.REMOTE.getCurrentWindow(),
					PARWIN = CURRWIN.getParentWindow();

				PARWIN.webContents.send("if-otr-callback", "X");

				//~witing mode 제거
				oPage.setBusy(false);

				oAPP.fn.setBusyIndicator("");

                // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
                parent.oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 


			});

		} //f4 help 필드정보 얻기.


		// function lf_UIUpdated(){

		// 	//호출 이후 이벤트 제거 처리.
		// 	sap.ui.getCore().detachEvent("UIUpdated", lf_UIUpdated);
				
		// 	//검색조건, 결과리스트 필드 정보 얻기.
		// 	lf_getF4Field();

		// }


		// //UI화면 갱신 이후 이벤트 처리.
		// sap.ui.getCore().attachEvent("UIUpdated", lf_UIUpdated);


		var oApp = new sap.m.App();
		oApp.placeAt("content");

		//366  Alias can be copied by double-clicking the result list.
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "366", "", "", "", "");

		//dialog 생성.
		var oPage = new sap.m.Page({ title: l_txt, busy:true, busyIndicatorDelay:0});
		oApp.addPage(oPage);
		oPage.addStyleClass("sapUiSizeCompact");



		var oHbox1 = new sap.m.HBox({ height: "100%", direction: "Column", renderType: "Bare" });
		oPage.addContent(oHbox1);

		//D47  Selection
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D47", "", "", "", "");

		//검색조건 panel.
		var oPanel = new sap.m.Panel({ expandable: true, expanded: true, headerText: l_txt });
		oHbox1.addItem(oPanel);

		var SerchOVtoolbar = new sap.m.OverflowToolbar({ width: "100%" });
		oPanel.setHeaderToolbar(SerchOVtoolbar);

		//D47  Selection
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D47", "", "", "", "");

		//검색버튼 label.
		var SerLB = new sap.m.Label({
			design: "Bold", required: false, text: l_txt, tooltip: l_txt
		});
		SerchOVtoolbar.addContent(SerLB);


		//A75  Search
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A75", "", "", "", "");

		//검색 버튼.
		var SerchBT1 = new sap.m.Button({
			icon: "sap-icon://search",
			text: l_txt, tooltip: l_txt, type: "Emphasized", busyIndicatorDelay: 1
		});

		//검색버튼 선택 이벤트.
		SerchBT1.attachEvent("press", function (oEvent) {
			LF_getServerData();
		});

		SerchOVtoolbar.addContent(SerchBT1);

		//~조회필드 FORM 영역 생성
		var oForm = new sap.ui.layout.form.SimpleForm({
			columnsM: 1, editable: true, singleContainerFullSize: false,
			labelSpanL: 3, labelSpanM: 3, adjustLabelSpan: false,
			layout: "ResponsiveGridLayout"
		});
		oPanel.addContent(oForm);

		//검색조건 model.
		var ZF4searchModle = new sap.ui.model.json.JSONModel();
		ZF4searchModle.oData.param = {};
		oForm.setModel(ZF4searchModle);


		//조회조건 필드 구성.
		lf_setSearchCondition(I_SHLPNAME, IT_FIELDDESCR);



		var ZF4SH_ovtoolbar = new sap.m.OverflowToolbar({ width: "100%" });

		//A76  Maximum No, of Hits
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A76", "", "", "", "");

		//Maximum No, of Hits label.
		var olb01 = new sap.m.Label({ design: "Bold", text: l_txt, tooltip: l_txt });
		ZF4SH_ovtoolbar.addContent(olb01);

		//max Hits
		var ZF4SH_input01 = new sap.m.Input({ type: "Number", width: "60px" });

		//최대 검색건수 설정.
		ZF4SH_input01.setValue(200);
		ZF4SH_ovtoolbar.addContent(ZF4SH_input01);
		ZF4SH_ovtoolbar.addContent(new sap.m.ToolbarSpacer());

		//A73  Search Result
		var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A73", "", "", "", "");

		//결과 건수 text
		var ZF4SH_LBresult = new sap.m.Label({ design: "Bold", text: l_txt + " : 0" });
		ZF4SH_ovtoolbar.addContent(ZF4SH_LBresult);


		//★~F4 조회 리스트 테이블 ui 생성
		var oTable = new sap.ui.table.Table({
			selectionMode: "None", visibleRowCountMode: "Auto", alternateRowColors: true,
			layoutData: new sap.m.FlexItemData({ growFactor: 1 })
		});

		//table 더블클릭 이벤트.
		oTable.attachBrowserEvent("dblclick", function (oEvent) {

			//이벤트 발생 UI 정보 얻기.
			var l_ui = oAPP.fn.getUiInstanceDOM(oEvent.target, sap.ui.getCore());

			//UI정보를 얻지 못한 경우 exit.
			if (!l_ui) { return; }

			//바인딩정보 얻기.
			var l_ctxt = l_ui.getBindingContext();

			//바인딩 정보를 얻지 못한 경우 exit.
			if (!l_ctxt) { return; }

			var ls_line = l_ctxt.getProperty();
			if (!ls_line) { return; }


			//alias가 없는경우 메시지 처리 후 exit.
			if (!ls_line.ALIAS_NAME || ls_line.ALIAS_NAME === "") {
				//E07  Alias
				//196  &1 does not exist.
				sap.m.MessageToast.show(oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "196",
					oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E07", "", "", "", ""), "", "", ""));
				return;
			}

			//OTR 클립보드 복사 처리.
			oAPP.fn.setClipBoardTextCopy("$OTR:" + ls_line.ALIAS_NAME);

			//E06  copied
			//메시지 처리.
			sap.m.MessageToast.show("$OTR:" + ls_line.ALIAS_NAME + " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E06", "", "", "", ""));

		}); //table 더블클릭 이벤트.


		oHbox1.addItem(oTable);
		oTable.setToolbar(ZF4SH_ovtoolbar);

		//~table 모델 설정
		var modeloTable = new sap.ui.model.json.JSONModel();
		oTable.setModel(modeloTable);


		oTable.bindAggregation("rows", { path: "/TF4LIST", template: new sap.ui.table.Row() });


		let oDelegate = {
            onAfterRendering : function(){

                oApp.removeEventDelegate(oDelegate);

				oAPP.CURRWIN.show();

				oAPP.WSUTIL.setBrowserOpacity(oAPP.CURRWIN);

				//검색조건, 결과리스트 필드 정보 얻기.
				lf_getF4Field();

            }
        };

        oApp.addEventDelegate(oDelegate);

	};  //OTR 검색 팝업 호출.




	//text 클립보드 복사 처리.
	oAPP.fn.setClipBoardTextCopy = (sText, fnCallback) => {

		if (typeof sText !== "string") {
			return;
		}

		var oTextArea = document.createElement("textarea");
		oTextArea.value = sText;

		document.body.appendChild(oTextArea);

		oTextArea.select();

		document.execCommand('copy');

		document.body.removeChild(oTextArea);

		if (typeof fnCallback === "function") {
			fnCallback();
		}

	};	//text 클립보드 복사 처리.



	//UI DOM을 기준으로 UI instance 정보 얻기.
	oAPP.fn.getUiInstanceDOM = function (oDom, oCore) {

		//DOM 정보가 존재하지 않는경우 exit.
		if (typeof oDom === "undefined") { return; }

		//DOM id로부터 UI정보 검색.
		var l_ui = oCore.byId(oDom.id);

		//UI를 찾은경우 해당 UI정보 return
		if (typeof l_ui !== "undefined") {
			return l_ui;
		}

		//UI정보를 찾지못한 경우 상위 부모를 탐색하며 UI instance정보 검색.
		return oAPP.fn.getUiInstanceDOM(oDom.parentElement, oCore);


	};  //UI DOM을 기준으로 UI instance 정보 얻기.




	//table 컬럼 재조정 처리.
	oAPP.fn.autoResize = function (oTab, iTime) {

		if (!oTab) { return; }

		setTimeout(() => {
			for (var i = oTab.getColumns().length - 1; i >= 0; i--) {

				oTab.autoResizeColumn(i);

			}

		}, iTime);

	} //table 컬럼 재조정 처리.

})(window, oAPP);