/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지 (index.js)
 ************************************************************************/
let zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP,
    PATHINFO = parent.PATHINFO;

(function (window, oAPP) {
    "use strict";
    

    //바인딩 모드.
    const CS_BIND_MODE = {
        DEFAULT : "01", //일반 바인딩 모드.
        BULK    : "02"  //바인딩 일괄적용 모드.
    };


    //파일, 폴더 경로 정보.
    const CS_PATH_INFO = {
        ROOT   : "",    //ROOT 경로
        DESIGN : "",    //DESIGN TREE UI 경로
        ADDIT  : ""     //바인딩 추가속성 정보 UI 경로.
    };


    oAPP.settings = {};

    oAPP.attr.prev = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
        require = parent.require;

    //default 바인딩 모드.
    oAPP.attr.BIND_MODE = CS_BIND_MODE.BULK;

    /*************************************************************
     * @function - UI 구성 완료후 call back 처리.
     *************************************************************/
    function uiUpdateComplate(oUI){

        return new Promise((res)=>{
            
            if(typeof oUI === "undefined" || oUI === null){
                return res();
            }

            var _oDelegate = {
                onAfterRendering:(oEvent)=>{

                    // console.log(`${oUI.sId} onAfterRendering`);

                    //onAfterRendering 이벤트 제거.
                    oUI.removeEventDelegate(_oDelegate);

                    //onAfterRendering 정보 초기화.
                    oUI.data("_onAfterRendering", null);

                    return res();

                }
            };

            //onAfterRendering 추가.
            oUI.addEventDelegate(_oDelegate);
            
            //onAfterRendering 정보 매핑.
            oUI.data("_onAfterRendering", _oDelegate);

        });

    }



    /*************************************************************
     * @function - path 정보 구성.
     *************************************************************/
    function getPathInfo(){
        
        //ROOT 경로.
        CS_PATH_INFO.ROOT   = oAPP.APP.getAppPath();


        //design tree path 구성.
        CS_PATH_INFO.DESIGN = oAPP.PATH.join(CS_PATH_INFO.ROOT, 
            "ws10_20", "Popups", "bindPopup", "uiModule", "designTree.js");


        //바인딩 추가 속성  path 구성.
        CS_PATH_INFO.ADDIT  = oAPP.PATH.join(CS_PATH_INFO.ROOT, 
            "ws10_20", "Popups", "bindPopup", "uiModule", "bindAdditInfo.js");


    }   //path 정보 구성.


    /*************************************************************
     * @function - UI TABLE 라이브러리 예외처리.
     *************************************************************/
    function excepUiTableLibrary(){

        jQuery.sap.require("sap.ui.table.extensions.KeyboardDelegate");
        sap.ui.table.extensions.KeyboardDelegate.prototype.onkeyup = function(oEvent) {
            var oCellInfo = sap.ui.table.utils.TableUtils.getCellInfo(oEvent.target);
            var ModKey = {
                CTRL: 1,
                SHIFT: 2,
                ALT: 4
            };
            
            function startRangeSelectionMode(oTable) {
                var iFocusedRowIndex = sap.ui.table.utils.TableUtils.getRowIndexOfFocusedCell(oTable);
                var iDataRowIndex = oTable.getRows()[iFocusedRowIndex].getIndex();
                var oSelectionPlugin = oTable._getSelectionPlugin();

                /**
                 * Contains information that are used when the range selection mode is active.
                 * If this property is undefined the range selection mode is not active.
                 * @type {{startIndex: int, selected: boolean}}
                 * @property {int} startIndex The index of the data row in which the selection mode was activated.
                 * @property {boolean} selected True, if the data row in which the selection mode was activated is selected.
                 * @private
                 */
                oTable._oRangeSelection = {
                    startIndex: iDataRowIndex,
                    selected: oSelectionPlugin.isIndexSelected(iDataRowIndex)
                };
            }

            // End the range selection mode.
            if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SHIFT)) {
                delete this._oRangeSelection;
            }

            if (oCellInfo.isOfType(sap.ui.table.utils.TableUtils.CELLTYPE.COLUMNHEADER)) {
                if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE) || sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.ENTER)) {
                    sap.ui.table.utils.TableUtils.Menu.openContextMenu(this, oEvent.target);
                }
            } else if (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE)) {
                //sap.ui.table.extensions.KeyboardDelegate._handleSpaceAndEnter(this, oEvent);
                sap.ui.table.extensions.KeyboardDelegate.prototype.onsapenter.call(this, oEvent);
            } else if ( oCellInfo.rowIndex !== null && sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE, ModKey.SHIFT)) {
                sap.ui.table.utils.TableUtils.toggleRowSelection(this, this.getRows()[oCellInfo.rowIndex].getIndex());


                startRangeSelectionMode(this);
            } else if (this._legacyMultiSelection && !oCellInfo.isOfType(sap.ui.table.utils.TableUtils.CELLTYPE.COLUMNROWHEADER) &&
                        (sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.SPACE, ModKey.CTRL) ||
                        sap.ui.table.extensions.KeyboardDelegate._isKeyCombination(oEvent, jQuery.sap.KeyCodes.ENTER, ModKey.CTRL))) {
                //sap.ui.table.extensions.KeyboardDelegate._handleSpaceAndEnter(this, oEvent);
                sap.ui.table.extensions.KeyboardDelegate.prototype.onsapenter.call(this, oEvent);
            }
        };

    }


    
    /*************************************************************
     * @function - 컬럼 width 계산 처리.
     *************************************************************/
    function uiTableCalcColumnWidth(oTable, oCol){
        
        var $this = oTable.$();
        var $hiddenArea = jQuery("<div>").addClass("sapUiTableHiddenSizeDetector sapUiTableHeaderDataCell sapUiTableDataCell");
        
        var oDom = sap.ui.getCore().getStaticAreaRef();
        
        oDom.appendChild($hiddenArea[0]);
        
                        
        var $cells = $this.find("td[data-sap-ui-colid = \"" + oCol.getId() + "\"]")
                        .filter(function(index, element) {
                            return element.style.display != "none";
                        }).children().clone();


        $cells.removeAttr("id"); // remove all id attributes

        // Determine the column width
        var iWidth = $hiddenArea.append($cells).width() + 4; // widest cell + 4px for borders, padding and rounding
        
        iWidth = Math.max(iWidth + 4, sap.ui.table.utils.TableUtils.Column.getMinColumnWidth()); // not to small

        $hiddenArea.remove();
        

        return iWidth;
        
    }   //컬럼 width 계산 처리.



    /*************************************************************
     * @function - sap.ui.table.Table의 autoResize 처리 이후 초기화.
     *************************************************************/
    function uiTabclearColumResizing(oTable) {
        if (oTable._$colResize) {
            oTable._$colResize.toggleClass("sapUiTableColRszActive", false);
            oTable._$colResize = null;
        }
        oTable._bIsColumnResizerMoving = false;
        oTable.$().toggleClass("sapUiTableResizing", false);
        oTable._enableTextSelection();

        var $Document = jQuery(document);
        $Document.off("touchmove.sapUiTableColumnResize");
        $Document.off("touchend.sapUiTableColumnResize");
        $Document.off("mousemove.sapUiTableColumnResize");
        $Document.off("mouseup.sapUiTableColumnResize");
        
    }  //sap.ui.table.Table의 autoResize 처리 이후 초기화.



    /*************************************************************
     * @function - 컬럼 resize 처리.
     *************************************************************/
    function setResizeCol(oTable, oCol, indx){

        setTimeout(function(){
            
            //UI, COLUMN, COLUMN INDEX 정보가 존재하지 않는경우 EXIT.
            if(!oTable){return;}

            if(typeof indx === "undefined"){return;}
            
        
            //해당 컬럼이 autoResize처리가 안되거나, resize가 안되는경우 다음 컬럼을 최적화 처리.
            if(!oCol.getAutoResizable() || !oCol.getResizable()){
                return;
            }
            
            //컬럼의 width를 계산.
            var _width = uiTableCalcColumnWidth(oTable, oCol);
            
            //계산된 컬럼 width를 얻을 수 없다면 다음 컬럼을 최적화 처리.
            if(!_width){return;}

            
            //컬럼 width 최적화처리.
            sap.ui.table.utils.TableUtils.Column.resizeColumn(oTable, indx, _width);
            
            //컬럼 최적화 이후 clear처리.
            uiTabclearColumResizing(oTable);
        
        }, 0);
        
    }   //컬럼 resize 처리.



    /*************************************************************
     * @function - 바인딩된 정보 확인 팝업 호출.(테스트목적)
     *************************************************************/
    function callBindingListPopup(){

        var _aT_0015 = [];

        for (const key in oAPP.attr.prev) {

            var _oUi = oAPP.attr.prev[key];

            if(typeof _oUi._T_0015 === "undefined"){
                continue;
            }

            _aT_0015 = _aT_0015.concat(JSON.parse(JSON.stringify(_oUi._T_0015)));
                
        }

        _aT_0015 = _aT_0015.filter( item => item.ISBND !== "" );

        if(_aT_0015.length === 0){
            sap.m.MessageToast.show("바인딩 정보가 존재하지 않습니다.", 
                {my:"center center", at:"center center"});
            return;
        }


        var _oTab = new sap.ui.table.Table({
            selectionMode:"None",
            visibleRowCountMode:"Auto",
            extension:[
                new sap.m.OverflowToolbar({
                    content:[
                        new sap.m.Button({
                            text:"auto resize",
                            press:function(){
                                oAPP.fn.setUiTableAutoResizeColumn(_oTab);
                            }
                        })
                    ]
                })
            ],
            rows:{
                path:"/T_LIST",
                template: new sap.ui.table.Row()
            }
        });

        
        var _s0015 = oAPP.fn.crtStru0015();

        for (let fld in _s0015) {
            _oTab.addColumn(new sap.ui.table.Column({
                sortProperty: fld,
                filterProperty: fld,
                autoResizable: true,
                label: new sap.m.Label({
                    text: fld,
                    design:"Bold"
                }),
                template: new sap.m.Text({
                    text:`{${fld}}`,
                    tooltip:`{${fld}}`,
                    wrapping: false
                })
            }));
        }

        var oDialog = new sap.m.Dialog({
            draggable:true,
            resizable: true,
            verticalScrolling:false,
            contentHeight: "60%",
            afterOpen:function(){
                // _oTab.attachEventOnce("rowsUpdated", function(){
                //     console.log(123123);
                //     oAPP.fn.setUiTableAutoResizeColumn(_oTab);
                // });
            },
            afterClose:function(){
                oDialog.destroy();
            },
            content:[
                _oTab
            ],
            buttons:[
                new sap.m.Button({
                    text:"close",
                    press:function(){
                        oDialog.close();
                    }
                })
            ]
        }).addStyleClass("sapUiSizeCompact");

        oDialog.setModel(new sap.ui.model.json.JSONModel({
            T_LIST:_aT_0015
        }));

        oDialog.oPopup.setModal(false);

        oDialog.open();

    }


    /*************************************************************
     * @function - design tree 활성화 처리.
     *************************************************************/
    function setVisibleDesignTree(){

        //design 영역의 tree 정보가 존재하지 않는경우 exit.
        if(typeof oAPP?.attr?.oDesign?.ui?.ROOT === "undefined"){
            return;
        }

        //design tree 활성화 처리.
        oAPP.attr.oDesign.ui.ROOT.setVisible(true);

    }
    

    /************************************************************************
     * sap.ui.table.Table의 Column AutoResize 처리.
     *-----------------------------------------------------------------------
    * @param   {object} oTable             
    *  - Column AutoResize 처리할 table UI
    ***********************************************************************/
    oAPP.fn.setUiTableAutoResizeColumn = function(oTable){
        
        if(typeof oTable === "undefined"){return;}
        
        //TABLE의 컬럼 정보 얻기.
        var _aColumn = oTable.getColumns();

        //컬럼이 존재하지 않는경우 exit.
        if(_aColumn.length === 0){return;}
        
        for(var i = 0, l = _aColumn.length; i < l; i++){

            var _oColumn = _aColumn[i];

            setResizeCol(oTable, _oColumn, i);

        }
        
    };   //table의 컬럼 resize 처리.


    


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

        //테스트!!!!!!!!!!!!!!!!!!!!!!!!!!
        // Browser Window option
        var sSettingsJsonPath = PATHINFO.WSSETTINGS,

            // JSON 파일 형식의 Setting 정보를 읽는다..
            oSettings = require(sSettingsJsonPath);
        if (!oSettings) {
            return;
        }

        return oSettings;

        // var oSettings = {
        //     UI5:{
        //         bootstrap:{
        //             "data-sap-ui-language": "EN",
        //             "data-sap-ui-noDuplicateIds": "true",
        //             "data-sap-ui-preload": "async",
        //             "data-sap-ui-compatVersion": "edge",
        //             "data-sap-ui-theme": "sap_horizon_dark",
        //             "data-sap-ui-libs": "sap.m"
        //         }
        //     }
        // };
        // //테스트!!!!!!!!!!!!!!!!!!!!!!!!!!


        // return oSettings;


    }; // end of oAPP.fn.getSettingsInfo

    // /************************************************************************
    //  * UI5 BootStrap 
    //  ************************************************************************/
    oAPP.fn.fnLoadBootStrapSetting = async function () {

        var oSettings = oAPP.fn.getSettingsInfo(),
            oSetting_UI5 = oSettings.UI5,
            oBootStrap = oSetting_UI5.bootstrap,
            oUserInfo = oAPP.attr.oUserInfo,
            oThemeInfo = oAPP.attr.oThemeInfo,
            sLangu = oUserInfo.LANGU;

        var oScript = document.createElement("script");
        oScript.id = "sap-ui-bootstrap";

        // 공통 속성 적용
        for (const key in oBootStrap) {
            oScript.setAttribute(key, oBootStrap[key]);
        }

        oSetting_UI5.resourceUrl = "https://s000.smartils.kr:49999/public/lib/_org_files/sapui5-rt-1.107.1/resources/sap-ui-core.js";
        // oSetting_UI5.resourceUrl = "https://sapui5.hana.ondemand.com/1.108.32/resources/sap-ui-core.js";


        // 로그인 Language 적용
        oScript.setAttribute("data-sap-ui-theme", oThemeInfo.THEME);
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



    /*************************************************************
     * @function - 화면 busy 처리.
     *************************************************************/
    oAPP.fn.setBusy = function(bBusy){

        switch (bBusy) {
            case true:
                //busy on.

                oAPP.ui.APP.setBusy(true);
                
                break;
        
            case false:
                //busy off.

                oAPP.ui.APP.setBusy(false);

                break;
        }

    };  //화면 busy 처리.


    /*************************************************************
     * @function - UI화면 갱신 이후 이벤트 처리.
     *************************************************************/
    oAPP.fn.UIUpdated = function(){

        //UI화면 갱신 이후 이벤트 제거 처리.
		sap.ui.getCore().detachEvent("UIUpdated", oAPP.fn.UIUpdated);

        jQuery.sap.require("sap.m.MessageBox");

        //최초 실행 HTML 로딩바 종료.
        oAPP.setBusy('');

        //바인딩 팝업 Broadcast Channel 생성.
        parent.require("./wsDesignHandler/broadcastChannelBindPopup.js")("CHANNEL-CREATE");


        setTimeout(() => {
                
            //path 정보 구성.
            getPathInfo();


            //추가속성 table layout 설정.
            oAPP.fn.setAdditLayout('');


            //바인딩 모드 변경.
            oAPP.fn.changeBindingMode(oAPP.attr.BIND_MODE);


            //서버에서 바인딩 정보 얻기.
            oAPP.fn.getBindFieldInfo();
            
        }, 0);

    };  //UI화면 갱신 이후 이벤트 처리.



    /*************************************************************
     * @function - //바인딩 팝업 화면 layout 변경.
     *************************************************************/
    oAPP.fn.changeDesignLayout = function(bindMode){

        return new Promise(async (res)=>{

            let _aPromise = [];

            // //left splitter
            // _aPromise.push(uiUpdateComplate(oAPP.ui.oSptLeft));

            //right page 
            _aPromise.push(uiUpdateComplate(oAPP.ui.oPageRight));


            //추가속성정보 페이지 content 초기화.
            oAPP.ui.oPageAdit.removeAllAggregation("content", true);

            //좌측 splitter에 추가속성 정보 페이지 제거.
            // oAPP.ui.oSptLeft.removeAggregation("contentAreas", oAPP.ui.oPageAdit, true);
            oAPP.ui.oSptLeft.removeAllAggregation("contentAreas", true);


            var _oArea1 = oAPP.ui.oPageRight.data("area1");

            _oArea1.removeAllAggregation("content", true);

            var _oArea2 = oAPP.ui.oPageRight.data("area2");
            
            _oArea2.removeAllAggregation("content", true);
                        

            //우측 페이지 content 초기화.
            oAPP.ui.oPageRight.removeAllAggregation("content", true);


            // //좌측 splitter 갱신.
            // oAPP.ui.oSptLeft.invalidate();

            //우측 page 갱신.
            oAPP.ui.oPageRight.invalidate();


            //화면 제거를 기다림.
            await Promise.all(_aPromise);

            _aPromise = [];

            // //left splitter
            // _aPromise.push(uiUpdateComplate(oAPP.ui.oSptLeft));

            //right page 
            _aPromise.push(uiUpdateComplate(oAPP.ui.oPageRight));


            
            let _sArea = {};


            //화면 변환 구분자에 따른 UI구성.
            switch (bindMode) {
                
                case CS_BIND_MODE.DEFAULT: //기존 바인딩 화면.
                    
                    //우측 페이지.
                    _sArea.area1 = oAPP.ui.oPageRight;

                            
                    oAPP.attr.oModel.oData.resize = false;
                    oAPP.attr.oModel.oData.width  = "100%";

                    break;

                case CS_BIND_MODE.BULK:  //바인딩 일괄 적용 화면

                    //가운데 area 영역.
                    _sArea.area1 = oAPP.ui.oPageRight.data("area1");

                    //우측 area 영역.
                    _sArea.area2  = oAPP.ui.oPageRight.data("area2");

                    // //추가속성 정의 PAGE를 좌측 SPLITTER에 추가.
                    // oAPP.ui.oSptLeft.addAggregation("contentAreas", oAPP.ui.oPageAdit, true);

                    oAPP.ui.oSptLeft.addAggregation("contentAreas", _sArea.area1, true);
                    oAPP.ui.oSptLeft.addAggregation("contentAreas", oAPP.ui.oPageAdit, true);

                    

                    //우측 페이지에 design, 추가속성 일괄적용 테이블 추가.
                    oAPP.ui.oPageRight.addAggregation("content", oAPP.ui.oSptRight, true);
            
                    oAPP.attr.oModel.oData.resize = true;
                    oAPP.attr.oModel.oData.width  = "30%";
                    
                    break;
            
            }
                        
            oAPP.attr.oModel.refresh();


            // //좌측 splitter 갱신.
            // oAPP.ui.oSptLeft.invalidate();

            //우측 page 갱신.
            oAPP.ui.oPageRight.invalidate();

            //화면 구성을 기다림.
            await Promise.all(_aPromise);
            

            return res(_sArea);

        });

    };



    /*************************************************************
     * @function - 바인딩 모드 변경.
     *************************************************************/
    oAPP.fn.changeBindingMode = async function(bindMode){
        
        oAPP.fn.setBusy(true);

        
        //추가 속성 정보 초기화.
        oAPP.attr.oModel.oData.T_MPROP = [];

        oAPP.ui.oTree.clearSelection();
        oAPP.attr.oModel.refresh();
        

        //디자인 영역의 레이아웃 변경 처리.
        let _sArea = await oAPP.fn.changeDesignLayout(bindMode);


        switch (bindMode) {
            case CS_BIND_MODE.DEFAULT:
                //일반 바인딩 모드.

                //right page.
                var _oPromise = uiUpdateComplate(_sArea.area1);

                _sArea.area1.addAggregation("content", oAPP.ui.oAdditTab, true);

                _sArea.area1.invalidate();

                await _oPromise;

                
                break;
        
            case CS_BIND_MODE.BULK:
                //바인딩 일괄적용 모드.

                //module js 얻기.
                var _oContrArea1 = await import(CS_PATH_INFO.DESIGN);

                //design tree start.
                oAPP.attr.oDesign = await _oContrArea1.start(_sArea.area1);


                //module js 얻기.
                var _oContrArea2 = await import(CS_PATH_INFO.ADDIT);

                //바인딩 추가 속성  start.
                oAPP.attr.oAddit = await _oContrArea2.start(_sArea.area2, oAPP.ui.oAdditTab);



                //좌측 하단 페이지.
                var _oPromise = uiUpdateComplate(oAPP.ui.oPageAdit);

                oAPP.ui.oPageAdit.addAggregation("content", oAPP.ui.oAdditTab, true);

                oAPP.ui.oPageAdit.invalidate();

                await _oPromise;

                break;
        }


        oAPP.fn.setBusy(false);


    };


    //바인딩 팝업 화면 구성.
    oAPP.fn.callBindPopup = function () {

        //UI화면 갱신 이후 이벤트 처리.
		sap.ui.getCore().attachEvent("UIUpdated", oAPP.fn.UIUpdated);

        //최상위 UI.
        var oApp = new sap.m.App({busy:true, busyIndicatorDelay:0});
        oApp.placeAt("content");
        oApp.addStyleClass("sapUiSizeCompact");

        oAPP.ui.APP = oApp;

        //모델 정보 세팅.
        oAPP.attr.oModel = new sap.ui.model.json.JSONModel();
        oApp.setModel(oAPP.attr.oModel);


        //바인딩 팝업 table 출력 page.
        var oPage = new sap.m.Page({enableScrolling:false});
        oApp.addPage(oPage);


        //바인딩 tree toolabar 정보.
        var oTool = new sap.m.Toolbar();
        oPage.setCustomHeader(oTool);

        //A46  Expand All
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A46", "", "", "", "");

        //전체펼침
        var oToolBtn1 = new sap.m.Button({
            text: l_txt,
            icon: "sap-icon://expand-all",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: l_txt,
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn1);

        //tree 전체펼침 이벤트
        oToolBtn1.attachPress(function () {

            oAPP.ui.oTree.expandToLevel(99999);

            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setTreeAutoResizeCol(100);

        });

        //A47  Collapse All
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A47", "", "", "", "");

        //전체접힘
        var oToolBtn2 = new sap.m.Button({
            text: l_txt,
            icon: "sap-icon://collapse-all",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: l_txt,
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn2);

        //tree 전체접힘 이벤트
        oToolBtn2.attachPress(function () {
            oAPP.ui.oTree.collapseAll();
        });


        oTool.addContent(new sap.m.ToolbarSeparator());

        //A48  Refresh
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A48", "", "", "", "");

        //갱신버튼
        var oToolBtn3 = new sap.m.Button({
            text: l_txt,
            icon: "sap-icon://refresh",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: l_txt,
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn3);

        //갱신버튼 이벤트
        oToolBtn3.attachPress(function () {
            //서버에서 바인딩 정보 얻기.
            oAPP.fn.getBindFieldInfo();
        });


        var oBtn01 = new sap.m.Button({
            text: "바인딩 모드 변경",
            icon: "sap-icon://refresh",
            type: "Emphasized",
            tooltip: l_txt,
            busyIndicatorDelay: 1,
            visible : false,
            press:async function(){

                //테스트 모드.
                oAPP.attr.BIND_MODE = oAPP.attr.BIND_MODE === "01" ? "02" : "01";

                //바인딩 모드 변경.
                oAPP.fn.changeBindingMode(oAPP.attr.BIND_MODE);

            }
        });


        //테스트모드 인경우 테스트 버튼 추가.
        if(parent?.oAPP?.PES_DEV === "X"){
            oTool.addContent(oBtn01);
        }


        var oBtn02 = new sap.m.Button({
            text: "데이터 갱신",
            icon: "sap-icon://refresh",
            type: "Emphasized",
            tooltip: l_txt,
            busyIndicatorDelay: 1,
            press:async function(){

                oAPP.fn.setBusy(true);

                //design data 얻기.
                await new Promise((res)=>{
   
                    var oForm = new FormData();
                    
                    oForm.append("sap-user", "pes");
                    oForm.append("sap-password", "dmstjq8!");
                    oForm.append('appid', oAPP.attr.oAppInfo.APPID);
                    
                    sendAjax(oAPP.attr.servNm + "/getAppData", oForm, function (param) {
                        
                        
                        oAPP.attr.T_0014 = param.APPDATA.T_0014;
                        oAPP.attr.T_0015 = param.APPDATA.T_0015;
                        oAPP.attr.T_CEVT = param.APPDATA.T_CEVT;

                        res();

                    });
                    
                });

                //서버에서 바인딩 attr 정보 얻기.
                oAPP.fn.getBindFieldInfo();

            }
        });

        //테스트모드 인경우 테스트 버튼 추가.
        if(parent?.oAPP?.PES_DEV === "X"){
            oTool.addContent(oBtn02);
        }

        
        var oBtn03 = new sap.m.Button({
            text: "바인딩 정보 확인",
            type: "Emphasized",
            press:callBindingListPopup
        });

        //테스트모드 인경우 테스트 버튼 추가.
        if(parent?.oAPP?.PES_DEV === "X"){
            oTool.addContent(oBtn03);
        }


        //메인의 좌, 우 분할 Splitter.
        var oSpt1 = new sap.ui.layout.Splitter();
        oPage.addContent(oSpt1);

        oAPP.ui.oSptMain = oSpt1;

        //좌측 페이지.
        var oPageLeft = new sap.m.Page({showHeader:false});
        oSpt1.addContentArea(oPageLeft);


        // //좌측 트리의 상하 분할 Splitter.
        // oAPP.ui.oSptLeft = new sap.ui.layout.Splitter({orientation:"Vertical"});
        // oPageLeft.addContent(oAPP.ui.oSptLeft);
        


        //우측 페이지.
        oAPP.ui.oPageRight = new sap.m.Page({
            showHeader:false,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size:"auto"
            })
        });
        oSpt1.addContentArea(oAPP.ui.oPageRight);


        //우측 좌, 우 분할 Splitter.
        oAPP.ui.oSptRight = new sap.ui.layout.Splitter();
        oAPP.ui.oPageRight.addContent(oAPP.ui.oSptRight);

        //좌측 트리의 상하 분할 Splitter.
        oAPP.ui.oSptLeft = new sap.ui.layout.Splitter({orientation:"Vertical"});
        oAPP.ui.oSptRight.addContentArea(oAPP.ui.oSptLeft);


        var oPageArea1 = new sap.m.Page({
            showHeader: false,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                // size:"60%"
                minSize:300,
                size:"{/height}",
                resizable: "{/resize_v}"
            })
        });
        // oAPP.ui.oSptRight.addContentArea(oPageArea1);
        oAPP.ui.oSptLeft.addContentArea(oPageArea1);
        
        //가운데 영역 page에 등록.
        oAPP.ui.oPageRight.data("area1", oPageArea1);



        var oPageArea2 = new sap.m.Page({
            showHeader: false,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size:"30%"
            })
        });
        oAPP.ui.oSptRight.addContentArea(oPageArea2);

        //우측 영역 page에 등록.
        oAPP.ui.oPageRight.data("area2", oPageArea2);
        

        // //좌측 트리의 상하 분할 Splitter.
        // oAPP.ui.oSptLeft = new sap.ui.layout.Splitter({orientation:"Vertical"});
        // oPageArea1.addContent(oAPP.ui.oSptLeft);


        //바인딩 필드 TREE PAGE.
        var oPageTree = new sap.m.Page({
            showHeader:false,
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size:"auto"
            })
        });
        // oAPP.ui.oSptLeft.addContentArea(oPageTree);
        oPageLeft.addContent(oPageTree);


        //바인딩 추가속성 정보 페이지.
        var oPageAdit = new sap.m.Page({
            layoutData: new sap.ui.layout.SplitterLayoutData({
                size:"auto"
            }),
            customHeader : new sap.m.OverflowToolbar({
                content:[                    
                    new sap.m.Button({
                        text:"Collapse",       //$$OTR
                        tooltip:"Collapse",    //$$OTR
                        icon:"sap-icon://connected",
                        type:"Emphasized",
                        press: function(){

                            //추가속성 정보 초기화.
                            oAPP.attr.oModel.oData.T_MPROP = [];
                            
                            //추가속성 정보 필드 비활성 처리.
                            oAPP.fn.setAdditLayout('');

                        }
                    })
                ]
            })
            
        });
        oAPP.ui.oPageAdit = oPageAdit;

        // //!!!!!!!!!
        // oAPP.ui.oSptLeft.addContentArea(oAPP.ui.oPageAdit);


        //376	Table, Field를 Drag하여 Property, Aggregation에 Drop시 바인딩 할 수 있습니다.
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "376", "", "", "", "");

        //바인딩 tree 정보.
        oAPP.ui.oTree = new sap.ui.table.TreeTable({
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            width : "100%",
            rowHeight:35,
            // title:new sap.m.Label({text:l_txt, tooltip:l_txt}),
            extension: [
                new sap.m.OverflowToolbar({
                    content:[
                        
                        new sap.m.Button({
                            text:"Multi Binding",       //$$OTR
                            tooltip:"Multi Binding",    //$$OTR
                            icon:"sap-icon://connected",
                            type:"Emphasized",
                            enabled: "{/edit}",
                            press: oAPP.fn.onMultiBind
                        })
                    ]
                })
            ],
            rowSelectionChange: oAPP.fn.onSelTabRow
        });
        // oPageLeft.addContent(oAPP.ui.oTree);
        oPageTree.addContent(oAPP.ui.oTree);

        
        oAPP.ui.oTree.attachFilter(function () {
            //tee에서 필터 처리시 전체 펼침 처리.
            this.expandToLevel(99999);
        });

        var l_edit = false;

        if(oAPP.attr.oAppInfo.IS_EDIT === "X"){
            l_edit = true;
        }

        //drag UI 생성.
        var oDrag = new sap.ui.core.dnd.DragInfo({enabled:l_edit,
            sourceAggregation: "rows",
            //drag start 이벤트
            dragStart: oAPP.fn.setDragStart,

            //drag 종료 이벤트.
            dragEnd: oAPP.fn.onBindFieldDragEnd,

        });
        oAPP.ui.oTree.addDragDropConfig(oDrag);



        var oLay1 = new sap.ui.layout.SplitterLayoutData({
            size: "{/width}",
            resizable: "{/resize}"
        });
        // oAPP.ui.oTree.setLayoutData(oLay1);
        oPageLeft.setLayoutData(oLay1);

        //A50  Object Name
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A50", "", "", "", "");

        //바인딩 필드 정보 컬럼.
        var oTreeCol1 = new sap.ui.table.Column({
            filterProperty: "NTEXT",
            autoResizable: true,
            label: new sap.m.Label({
                text: l_txt,
                tooltip: l_txt,
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{NTEXT}",
                wrapping: false,
                tooltip: "{NTEXT}"
            })
        });
        oAPP.ui.oTree.addColumn(oTreeCol1);

        //A51  Type
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A51", "", "", "", "");

        //바인딩 필드 타입 컬럼.
        var oTreeCol2 = new sap.ui.table.Column({
            filterProperty: "TYPE",
            autoResizable: true,
            label: new sap.m.Label({
                text: l_txt,
                tooltip: l_txt,
                design: "Bold"
            })
        });
        oAPP.ui.oTree.addColumn(oTreeCol2);

        var oCol2Hbox1 = new sap.m.HBox({
            alignItems: "Center",
            renderType: "Bare"
        });
        oTreeCol2.setTemplate(oCol2Hbox1);

        var oHbox1Icon1 = new sap.ui.core.Icon({
            src: "{stat_src}",
            color: "{stat_color}"
        });
        oHbox1Icon1.addStyleClass("sapUiTinyMarginEnd");
        oCol2Hbox1.addItem(oHbox1Icon1);

        var oHbox1Txt1 = new sap.m.Text({
            text: "{TYPE}",
            wrapping: false,
            tooltip: "{TYPE}"
        });
        oCol2Hbox1.addItem(oHbox1Txt1);

        //A35  Description
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A35", "", "", "", "");

        //필드 description 컬럼.
        var oTreeCol3 = new sap.ui.table.Column({
            filterProperty: "DESCR",
            autoResizable: true,
            label: new sap.m.Label({
                text: l_txt,
                tooltip: l_txt,
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{DESCR}",
                wrapping: false,
                tooltip: "{DESCR}"
            })
        });
        oAPP.ui.oTree.addColumn(oTreeCol3);


        // //테스트 바인딩 가능 여부 필드.
        // var oTreeCol4 = new sap.ui.table.Column({
        //     label: new sap.m.Label({
        //         text: "enable",
        //         design: "Bold"
        //     }),
        //     template: new sap.m.Text({
        //         text: "{enable}"
        //     })
        // });
        // oAPP.ui.oTree.addColumn(oTreeCol4);


        //바인딩 TREE 모델 바인딩 처리.
        oAPP.ui.oTree.bindAggregation("rows", {
            path: "/zTREE",
            template: new sap.ui.table.Row(),
            parameters: {
                arrayNames: ["zTREE"]
            }
        });


        //바인딩 추가속성 정보 table.
        var oTab = new sap.ui.table.Table({
            selectionMode: "None",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            width: "100%",
            visible: "{/resize}",
            rowHeight:30,
            layoutData: new sap.ui.layout.SplitterLayoutData()
        });
        oAPP.ui.oPageRight.addContent(oTab);


        oAPP.ui.oAdditTab = oTab;

        //A52  Property
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A52", "", "", "", "");

        //추가바인딩 속성의 Property 컬럼.
        var oTabCol1 = new sap.ui.table.Column({
            label: new sap.m.Label({
                text: l_txt,
                tooltip: l_txt,
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{prop}"
            })
        });
        oTab.addColumn(oTabCol1);
        
        //A53  Value
        var l_txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A53", "", "", "", "");

        //추가바인딩 속성의 value 컬럼.
        var oTabCol2 = new sap.ui.table.Column({
            label: new sap.m.Label({
                text: l_txt,
                tooltip: l_txt,
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{val}"
            })
        });
        oTab.addColumn(oTabCol2);

        var oTabCol2HBox1 = new sap.m.HBox({
            justifyContent: "Center",
            renderType: "Bare",
            direction: "Column"
        });
        oTabCol2.setTemplate(oTabCol2HBox1);

        //추가속성정보 TEXT.
        var oTabCol2Txt1 = new sap.m.Text({
            text: "{val}",
            visible: "{txt_vis}"
        });
        oTabCol2HBox1.addItem(oTabCol2Txt1);

        //추가속성정보 입력 필드.
        var oTabCol2Inp1 = new sap.m.Input({
            value: "{val}",
            visible: "{inp_vis}",
            editable: "{edit}",
            maxLength: "{maxlen}",
            valueState: "{stat}",
            valueStateText: "{statTxt}",
            enabled: "{/edit}"
        });
        oTabCol2HBox1.addItem(oTabCol2Inp1);

        //바인딩 추가속성 정보 input 값변경 이벤트
        oTabCol2Inp1.attachChange(function (oEvent) {

            var _oUi = oEvent.oSource;

            //conversion명 대문자 변환 처리.
            oAPP.fn.setConvNameUpperCase(_oUi);

            // //바인딩 추가속성값 설정.
            // oAPP.fn.setMPROP();

        });

        //추가속성정보 DDLB 필드.
        var oTabCol2Sel1 = new sap.m.ComboBox({
            selectedKey: "{val}",
            visible: "{sel_vis}",
            editable: "{edit}",
            valueState: "{stat}",
            valueStateText: "{statTxt}",
            enabled: "{/edit}"
        });
        oTabCol2HBox1.addItem(oTabCol2Sel1);

        //바인딩 추가속성 정보 DDLB 선택 이벤트.
        oTabCol2Sel1.attachChange(function (oEvent) {

            var _oUi = oEvent.oSource;

            //바인딩 추가속성 정보 DDLB 선택 이벤트.
            oAPP.fn.setAddtBindInfoDDLB(_oUi);

            //바인딩 추가속성값 설정.
            oAPP.fn.setMPROP();

        });

        //DDLB ITEM 바인딩 처리.
        oTabCol2Sel1.bindAggregation("items", {
            path: "T_DDLB",
            template: new sap.ui.core.Item({
                key: "{KEY}",
                text: "{TEXT}"
            }),
            templateShareable: true
        });

        //추가속성 정보 바인딩 처리.
        oTab.bindAggregation("rows", {
            path: "/T_MPROP",
            templateShareable: true,
            template: new sap.ui.table.Row()
        });


        // //table Drag 설정.
        // oAPP.fn.setTreeDrag();


        // //서버에서 바인딩 정보 얻기.
        // oAPP.fn.getBindFieldInfo();



    };  //바인딩 팝업 화면 구성.



    /*************************************************************
     * @function - 바인딩 추가 속성 정보 입력값 점검.
     *************************************************************/
    oAPP.fn.chkAdditBindData = function(oModel){

        return new Promise(async (resolve)=>{

            let _sRes = {RETCD:"", RTMSG:""};

            if(typeof oModel?.oData?.T_MPROP === "undefined"){

                //$$MSG
                _sRes.RETCD = "E";            
                _sRes.RTMSG = "바인딩 추가 속성 정보가 존재하지 않습니다.";
                return resolve(_sRes);
            }

            var _aMPROP = oModel?.oData?.T_MPROP;

            //바인딩 추가속성 정보 오류 표현 필드 초기화.
            for (let i = 0, l = _aMPROP.length; i < l; i++) {

                var _sMPROP = _aMPROP[i];

                _sMPROP.stat    = null;
                _sMPROP.statTxt = "";
                
            }

            
            //추가속성 정보 입력건 존재 여부 확인.
            if(_aMPROP.findIndex( item => item.val !== "") === -1){
                //$$MSG
                _sRes.RETCD = "E";
                _sRes.RTMSG = "바인딩 추가 속성 정보 입력건이 존재하지 않습니다.";

                oModel.refresh();

                return resolve(_sRes);

            }


            //Bind type 라인 얻기.
            var ls_p04 = _aMPROP.find( a=> a.ITMCD === "P04");
            if(typeof ls_p04 === "undefined"){
                //$$MSG
                _sRes.RETCD = "E";
                _sRes.RTMSG = "바인딩 추가 속성 정보 Bind type이 존재하지 않습니다.";

                oModel.refresh();

                return resolve(_sRes);
            }


            //Reference Field name 라인 얻기.
            var ls_p05 = _aMPROP.find( a=> a.ITMCD === "P05");
            if(typeof ls_p05 === "undefined"){
                //$$MSG
                _sRes.RETCD = "E";
                _sRes.RTMSG = "바인딩 추가 속성 정보 Reference Field name이 존재하지 않습니다.";

                oModel.refresh();

                return resolve(_sRes);
            }


            //Bind type이 구성된경우 Reference Field name이 존재하지 않는다면.
            if(ls_p04.val !== "" && ls_p05.val === ""){

                //$$MSG
                var _msg = "If Bind type is selected, Reference Field name is required.";

                ls_p05.stat = "Error";
                ls_p05.statTxt = _msg;

                //$$MSG
                _sRes.RETCD = "E";
                _sRes.RTMSG = _msg;

                oModel.refresh();

                return resolve(_sRes);
            }


            //Conversion Routine 라인 얻기.
            var ls_p06 = _aMPROP.find( a=> a.ITMCD === "P06");
            if(typeof ls_p06 === "undefined"){
                //$$MSG
                _sRes.RETCD = "E";
                _sRes.RTMSG = "바인딩 추가 속성 정보 Conversion Routine이 존재하지 않습니다.";

                oModel.refresh();

                return resolve(_sRes);
            }


            //conversion routine이 입력된경우.
            if(ls_p06.val !== ""){

                var _sParam = await new Promise((res)=>{

                    //Conversion Routine명 서버전송 데이터 구성.
                    var oFormData = new FormData();
                    oFormData.append("CONVEXIT", ls_p06.val);

                    // Conversion Routine 존재여부 확인.
                    sendAjax(oAPP.attr.servNm + "/chkConvExit", oFormData,function(param){
                        
                        res(param);
                
                    },"",false);

                    
                });

                //잘못된 Conversion Routine을 입력한 경우.
                if(_sParam.RETCD === "E"){

                    ls_p06.stat    = "Error";
                    ls_p06.statTxt = _sParam.RTMSG;

                    _sRes.RETCD = _sParam.RETCD;
                    _sRes.RTMSG = _sParam.RTMSG;

                    oModel.refresh();

                    return resolve(_sRes);

                }

            }

            oModel.refresh();

            return resolve(_sRes);

        });

    };


    /*************************************************************
     * @function - 바인딩 추가 속성값 구성.
     *************************************************************/
    oAPP.fn.setAdditBindData = function(aMPROP){

        if(typeof aMPROP === "undefined"){
            return;
        }


        //필드 정보 row 제거(필터명, 필드 path, 필드 타입.)
        var _aMPROP = aMPROP.filter( item => item.isFieldInfo === false );

        //itmcd로 정렬 처리.
        _aMPROP.sort(function(a, b){

            return a.ITMCD.localeCompare(b.ITMCD);

        });

        
        var _aProp = [];

        for (let i = 0, l = _aMPROP.length; i < l; i++) {
            
            var _sMPROP = _aMPROP[i];

            _aProp.push(_sMPROP.val);

        }

        return _aProp.join("|");

    };
    

    //바인딩 추가 속성값 설정.
    oAPP.fn.setMPROP = function(){
        
        var l_indx = oAPP.ui.oTree.getSelectedIndex();
        if(l_indx === -1){return;}

        var l_ctxt = oAPP.ui.oTree.getContextByIndex(l_indx);
        if (!l_ctxt) {
            return;
        }

        var ls_tree = l_ctxt.getProperty();

        if(ls_tree.KIND !== "E"){return;}

        //Bind type 라인 얻기.
        var ls_p04 = oAPP.attr.oModel.oData.T_MPROP.find( a=> a.ITMCD === "P04");
        if(!ls_p04){
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //Reference Field name 라인 얻기.
        var ls_p05 = oAPP.attr.oModel.oData.T_MPROP.find( a=> a.ITMCD === "P05");
        if(!ls_p05){
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //Bind type이 구성된경우 Reference Field name이 존재하지 않는다면.
        if(ls_p04.val !== "" && ls_p05.val === ""){
            //추가속성정보 제거 처리.
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //추가속성 세팅된 값을 취합.
        for(var i=3, l=oAPP.attr.oModel.oData.T_MPROP.length, l_array = []; i<l; i++){
            //바인딩 추가 속성 정보 수집.
            l_array.push(oAPP.attr.oModel.oData.T_MPROP[i].val);
    
        }

        //return 파라메터에 바인딩 추가 속성 정보 매핑.
        ls_tree.MPROP = l_array.join("|");

        //tree의 해당 라인에 바인딩 추가속성값 매핑.
        oAPP.attr.oModel.setProperty("MPROP", ls_tree.MPROP, l_ctxt);


    };  //바인딩 추가 속성값 설정.


    //conversion명 대문자 변환 처리.
    oAPP.fn.setConvNameUpperCase = function(oUi) {

        if (!oUi) {
            return;
        }

        var l_ctxt = oUi.getBindingContext();

        var ls_line = l_ctxt.getProperty();

        //Conversion Routine에서 값을 입력한 경우 하위 로직 수행.
        if (ls_line.ITMCD !== "P06") {
            return;
        }

        //Conversion 명 대문자 변환 처리.
        ls_line.val = ls_line.val.toUpperCase();
        oUi.setValue(ls_line.val);

    }; //conversion명 대문자 변환 처리.




    //STRING_TABLE 여부 확인.
    oAPP.fn.chkStringTable = function(is_tree) {

        //TABLE이 아닌경우 EXIT.
        if (is_tree.KIND !== "T") {
            return;
        }

        //부모가 ROOT인경우 EXIT.(바인딩 가능한건은 STRU-FIELD or TABLE-FIELD만 가능)
        if(is_tree.PARENT === "Attribute"){return;}

        //현재 라인이 STRING_TABLE인경우 STRING_TABLE FLAG RETURN.
        if (is_tree.EXP_TYP === "STR_TAB") {
            return true;
        }

    }; //STRING_TABLE 여부 확인.




    //range table 여부 확인.
    oAPP.fn.chkRangeTable = function(is_tree) {

        //TABLE이 아닌경우 EXIT.
        if (is_tree.KIND !== "T") {
            return;
        }

        //현재 table의 하위 필드 정보 검색.
        var lt_filter = oAPP.attr.oModel.oData.TREE.filter(a => a.PARENT === is_tree.CHILD);

        //child가 4건이 아닌경우 exit.
        if (lt_filter.length !== 4) {
            return;
        }

        //SIGN, OPTION, LOW, HIGH 필드가 아닌 필드 검색.
        var l_indx = lt_filter.findIndex(a => a.NTEXT !== "SIGN" && a.NTEXT !== "OPTION" &&
            a.NTEXT !== "LOW" && a.NTEXT !== "HIGH");

        //SIGN, OPTION, LOW, HIGH 이외의 필드가 존재하지 않는경우.
        if (l_indx === -1) {

            //RANGE TABLE 처리.
            is_tree.EXP_TYP = "RANGE_TAB";

            //range table flag return
            return true;
        }

    }; //range table 여부 확인.



    //라인선택 이벤트
    oAPP.fn.onSelTabRow = function(oEvent) {

        //일반 바인딩 모드가 아닌경우 exit.
        if(oAPP.attr.BIND_MODE !== CS_BIND_MODE.DEFAULT){
            return;
        }

        var l_indx = this.getSelectedIndex();
        if (l_indx === -1) {
            return;
        }

        var l_bind = this.getBinding("rows");

        var l_ctxt = l_bind.getContextByIndex(l_indx);
        if (!l_ctxt) {
            return;
        }

        var ls_tree = l_ctxt.getProperty();

        //추가속성 table layout 설정.
        oAPP.fn.setAdditLayout(ls_tree.KIND);


        var l_path = l_ctxt.getPath();

        l_path = l_path.substr(0, l_path.lastIndexOf("/"));

        //추가속성 정보 출력 처리.
        oAPP.fn.setAdditBindInfo(ls_tree, ls_tree.MPROP, oAPP.attr.oModel.getProperty(l_path));

    }; //라인선택 이벤트



    //바인딩 추가속성정보 메시지 초기화.
    oAPP.fn.resetMPROPMsg = function () {

        if (typeof oAPP.attr.oModel.oData.T_MPROP === "undefined" ||
            oAPP.attr.oModel.oData.T_MPROP.length === 0) {
            return;
        }


        for (var i = 0, l = oAPP.attr.oModel.oData.T_MPROP.length; i < l; i++) {
            oAPP.attr.oModel.oData.T_MPROP[i].stat = "None";
            oAPP.attr.oModel.oData.T_MPROP[i].statTxt = "";
        }

    }; //바인딩 추가속성정보 메시지 초기화.


    //tree -> tab으로 변환.
    oAPP.fn.parseTree2Tab = function(aTree, childName) {
        var a = [];
        var t = function(e) {
            $.each(e, function(e, o) {
                o[childName] && (t(o[childName]),
                delete o[childName]);
                a.push(o);
            })
        };

        t(JSON.parse(JSON.stringify(aTree)));
        return a;
  
    };  //tree -> tab으로 변환.


    //tree 구성 function.
    oAPP.fn.setTreeJson = function (oModel, path, child, parent, treePath) {

        //"stru/table" 형식인경우 stru부분 발췌.
        var l_ppath = path.substr(0, path.lastIndexOf("/"));

        //원본 table 정보 얻기.
        var lt_org = oModel.getProperty("/" + path);

        //stru에 해당하는 정보 얻기.
        var tm2 = oModel.getProperty("/" + l_ppath);

        //원본 table 정보가 존재하지 않는경우.
        if (!lt_org || lt_org.length === 0) {
            //stru에 treePath이름으로 table 필드 생성.
            tm2[treePath] = [];

            //모델 갱신 처리 후 exit.
            oModel.refresh();
            return;

        }

        //table 복사 처리.
        var lt_copy = JSON.parse(JSON.stringify(lt_org));

        for (var e, h, u, a = [], c = {}, o = 0, f = lt_copy.length; f > o; o++) {

            e = lt_copy[o];

            h = e[child];

            u = e[parent] || 0;

            c[h] = c[h] || [];

            e[treePath] = c[h];

            0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
        }

        tm2[treePath] = a;

    }; //tree 구성 function.




    //tree table 컬럼길이 재조정 처리.
    oAPP.fn.setTreeAutoResizeCol = function (iTime) {

        setTimeout(() => {
            var lt_col = oAPP.ui.oTree.getColumns();

            if (lt_col.length === 0) {
                return;
            }

            for (var i = lt_col.length - 1; i >= 0; i--) {
                oAPP.ui.oTree.autoResizeColumn(i);
            }

        }, iTime);


    };  //tree table 컬럼길이 재조정 처리.




    //tree drag 처리.
    oAPP.fn.setTreeDrag = function(){

        function lf_setDraggable(){

            //row UI 정보 얻기.
            var lt_row = oAPP.ui.oTree.getRows();

            if(lt_row.length == 0){return;}

            for(var i = 0, l = lt_row.length; i < l; i++){
                
                //row의 DOM 얻기.
                var l_dom = lt_row[i].getDomRef();
                if(!l_dom){continue;}

                //dom의 default drag false 처리.
                l_dom.draggable = false;

                var l_ctxt = lt_row[i].getBindingContext();
                if(!l_ctxt){continue;}

                var l_binfo = l_ctxt.getProperty();

                l_dom.draggable = l_binfo.enable;


            }


        }

        var l_meta = sap.ui.table.Row.getMetadata();
        l_meta.dnd.draggable = true;

        var l_bind = oAPP.ui.oTree.getBinding();

        if(!l_bind){return;}

        l_bind.attachChange(lf_setDraggable);

        oAPP.ui.oTree.attachToggleOpenState(lf_setDraggable);
        oAPP.ui.oTree.attachFirstVisibleRowChanged(lf_setDraggable);



    };  //tree drag 처리.


    function sendAjax(sPath, oFormData, fn_success) {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { // 요청에 대한 콜백
            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    fn_success(JSON.parse(xhr.response));

                }
            }
        };
        
        xhr.withCredentials = true;

        // FormData가 없으면 GET으로 전송
        xhr.open("post", sPath, true);

        xhr.send(oFormData);


    } // end of sendAjax


    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            //UI TABLE 라이브러리 예외처리.
            excepUiTableLibrary();


            //바인딩 팝업 화면 구성.
            oAPP.fn.callBindPopup();

            // oAPP.fn.fnInitModelBinding();

            // oAPP.fn.fnInitRendering();

            // oAPP.setBusy('');

        });

    };




    //추가속성 table layout 설정.
    oAPP.fn.setAdditLayout = function(KIND){
        
        switch (oAPP.attr.BIND_MODE) {
            case CS_BIND_MODE.DEFAULT:
                //일반 바인딩 모드.

                //DEFAULT 화면 크기 설정.
                oAPP.attr.oModel.oData.width = "100%";
                oAPP.attr.oModel.oData.height = "100%";
                oAPP.attr.oModel.oData.resize = false;

                //선택한 라인의 데이터 유형이 일반 필드면 추가속성 정보 활성화.
                if(KIND === "E"){
                    oAPP.attr.oModel.oData.width = "65%";
                    oAPP.attr.oModel.oData.resize = true;
                }
                
                break;
            
            case CS_BIND_MODE.BULK:
                //바인딩 일괄적용 모드.

                //DEFAULT 화면 크기 설정.
                oAPP.attr.oModel.oData.width = "30%";
                oAPP.attr.oModel.oData.resize = true;

                oAPP.attr.oModel.oData.height = "100%";
                oAPP.attr.oModel.oData.resize_v = false;

                //선택한 라인의 데이터 유형이 일반 필드면 추가속성 정보 활성화.
                if(KIND === "E"){
                    oAPP.attr.oModel.oData.resize_v = true;
                    oAPP.attr.oModel.oData.height = "60%";
                }
                
                break;

            default:
                break;
        }

        oAPP.attr.oModel.refresh();

    };  //추가속성 table layout 설정.




    //추가속성 정보 출력 처리.
    oAPP.fn.setAdditBindInfo = function(is_tree, MPROP, it_parent) {

        oAPP.attr.oModel.oData.T_MPROP = [];

        //바인딩 팝업 호출 ATTR의 타입이 프로퍼티가 아닌경우 EXIT.
        if (is_tree.KIND !== "E") {
            oAPP.attr.oModel.refresh();
            return;
        }

        //바인딩 추가속성 정보 공통코드 발췌.
        var lt_ua022 = oAPP.attr.T_9011.filter( item => item.CATCD === "UA022" && item.FLD03 === "X" );

        var lt_refList = [{KEY:"", TEXT:""}];

        //참조필드 DDLB 구성.
        for (var i = 0, l = lt_ua022.length; i < l; i++) {
            var ls_ua022 = lt_ua022[i];
            
            lt_refList.push({
                KEY : ls_ua022.FLD01,
                TEXT: ls_ua022.FLD01
            });
            
        }

        //boolean ddlb 정보.
        var lt_bool = [
            {KEY:"true",  TEXT:"true"},
            {KEY:"false", TEXT:"false"}
        ];


        //바인딩 추가속성 리스트 얻기.
        var lt_ua028 = oAPP.attr.T_9011.filter(a => a.CATCD === "UA028");

        var ls_mprop = {},
            lt_split = [];

        var lt_mprop = [];

        // //바인딩 추가 속성 정의건이 존재하는 경우.
        // if (is_tree.MPROP) {
        //     lt_split = is_tree.MPROP.split("|");
        // }

        if(typeof MPROP !== "undefined" && MPROP !== ""){
            lt_split = MPROP.split("|");
        }

        //nozero 불가능 항목.
        var l_nozero = "Cg";

        //number format 가능항목.
        var l_numfmt = "IP";

        for (var i = 0, l = lt_ua028.length; i < l; i++) {

            ls_mprop.ITMCD       = lt_ua028[i].ITMCD;
            ls_mprop.prop        = lt_ua028[i].FLD01;

            ls_mprop.val         = "";
            ls_mprop.stat        = "None";
            ls_mprop.statTxt     = "";
            ls_mprop.isFieldInfo = false;

            ls_mprop.edit        = false;
            ls_mprop.inp_vis     = false;
            ls_mprop.sel_vis     = false;
            ls_mprop.txt_vis     = false;

            //조회모드 여부 (예:X) 가 아닌경우 화면 edit 처리.
            if (lt_ua028[i].FLD02 !== "X") {
                ls_mprop.edit = true;
            }

            switch (lt_ua028[i].ITMCD) {

                case "P01": //Field name
                    ls_mprop.val         = is_tree.NTEXT;
                    ls_mprop.txt_vis     = true;
                    ls_mprop.isFieldInfo = true;
                    break;

                case "P02": //Field path
                    ls_mprop.val         = is_tree.CHILD;
                    ls_mprop.txt_vis     = true;
                    ls_mprop.isFieldInfo = true;
                    break;

                case "P03": //type
                    ls_mprop.val         = is_tree.TYPE;
                    ls_mprop.txt_vis     = true;
                    ls_mprop.isFieldInfo = true;
                    break;

                case "P04": //Bind type
                    // if (is_tree.MPROP) {
                    //     ls_mprop.val = lt_split[0];
                    // }

                    if(lt_split.length > 0){
                        ls_mprop.val = lt_split[0];
                    }


                    //추가 속성정보 재수집.
                    lt_mprop.push(ls_mprop.val);

                    ls_mprop.sel_vis = true;

                    //P 타입이 아닌경우 입력 필드 잠금 처리.
                    if (is_tree.TYPE_KIND !== "P") {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = JSON.parse(JSON.stringify(lt_refList));

                    break;

                case "P05": //Reference Field name
                    // if (is_tree.MPROP) {
                    //     ls_mprop.val = lt_split[1];
                    // }

                    if(lt_split.length > 0){
                        ls_mprop.val = lt_split[1];
                    }

                    //추가 속성정보 재수집.
                    lt_mprop.push(ls_mprop.val);

                    ls_mprop.sel_vis = true;

                    //구조(TAB) 안에 있는 필드 중 CUKY, UNIT 타입이 없으면 잠김.
                    var lt_filt = it_parent.filter(a => a.DATATYPE === "CUKY" || a.DATATYPE === "UNIT");

                    //금액, UNIT 참조필드가 존재하지 않는경우 화면 잠금 처리.

                    ls_mprop.edit = false;

                    if (lt_filt.length !== 0) {

                        ls_mprop.edit = true;

                        ls_mprop.T_DDLB = [{
                            "KEY": "",
                            "TEXT": ""
                        }];

                        for (var j = 0, l2 = lt_filt.length, ls_ddlb = {}; j < l2; j++) {

                            ls_ddlb.KEY = ls_ddlb.TEXT = lt_filt[j].CHILD;
                            ls_mprop.T_DDLB.push(ls_ddlb);
                            ls_ddlb = {};

                        }

                    }

                    if (lt_split.length === 0 || lt_split[0] === "") {
                        ls_mprop.edit = false;
                    }

                    break;

                case "P06": //Conversion Routine

                    // //해당 필드가 갖고 있는 conversion명을 default로 매핑.
                    // ls_mprop.val = is_tree.CONVE;

                    //입력 길이 제한(5자)
                    ls_mprop.maxlen = 5;

                    // if (is_tree.MPROP) {
                    //     ls_mprop.val = lt_split[2];
                    // }

                    if(lt_split.length > 0){
                        ls_mprop.val = lt_split[2];
                    }

                    //추가 속성정보 재수집.
                    lt_mprop.push(ls_mprop.val);

                    ls_mprop.inp_vis = true;
                    break;

                case "P07": //Nozero
                    // if (is_tree.MPROP) {
                    //     ls_mprop.val = lt_split[3];
                    // }

                    if(lt_split.length > 0){
                        ls_mprop.val = lt_split[3];
                    }

                    //값이 존재하지 않는경우 default false
                    if (ls_mprop.val === "") {
                        ls_mprop.val = "false";
                    }

                    //추가 속성정보 재수집.
                    lt_mprop.push(ls_mprop.val);

                    ls_mprop.sel_vis = true;

                    //Nozero 가능항목에 속하지 않는 타입인경우 입력필드 잠금 처리.
                    if (l_nozero.indexOf(is_tree.TYPE_KIND) !== -1) {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = JSON.parse(JSON.stringify(lt_bool));

                    break;

                case "P08": //Is number format?
                    // if (is_tree.MPROP) {
                    //     ls_mprop.val = lt_split[4];
                    // }

                    if(lt_split.length > 0){
                        ls_mprop.val = lt_split[4];
                    }

                    //값이 존재하지 않는경우 default false
                    if (ls_mprop.val === "") {
                        ls_mprop.val = "false";
                    }

                    //추가 속성정보 재수집.
                    lt_mprop.push(ls_mprop.val);

                    ls_mprop.sel_vis = true;

                    //number format 가능항목에 속하지 않는 타입인경우 입력필드 잠금 처리.
                    if (l_numfmt.indexOf(is_tree.TYPE_KIND) === -1) {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = JSON.parse(JSON.stringify(lt_bool));

                    break;
            }

            oAPP.attr.oModel.oData.T_MPROP.push(ls_mprop);
            ls_mprop = {};

        }


        //기존 바인딩 팝업일경우만 필드에 추가속성 정보 매핑.
        if(oAPP.attr.BIND_MODE === CS_BIND_MODE.DEFAULT){
                
            //재구성된 바인딩 추가 속성 정보가 존재하는경우 해당 라인에 바인딩 추가 속성정보 재매핑.
            if(lt_mprop.length > 0){
                is_tree.MPROP = lt_mprop.join("|");
            }
            
        }

        oAPP.attr.oModel.refresh();

    }; //추가속성 정보 출력 처리.



/********************************************************************
 * ******************************************************************
 * ******************************************************************
 *📝 바인딩 추가 기능 관련 로직 -START.
 ********************************************************************
 ********************************************************************
 ********************************************************************/

    //부모 path로부터 파생된 child path 여부 확인.
    oAPP.fn.chkBindPath = function(parent, child){
        //부모 path를 -로 분리.
        if(typeof parent === "undefined" || parent === ""){return;}
        if(typeof child === "undefined"  || child === ""){return;}

        var l_sp1 = parent.split("-");

        //CHILD path를 -로 분리.
        var l_sp2 = child.split("-");

        //부모 path 부분만 남김.
        l_sp2.splice(l_sp1.length);

        //부모 path로부터 파생된 child path인경우.
        if(parent === l_sp2.join("-")){
            //부모 path로부터 파생됨 flag return
            return true;
        }

    };  //부모 path로부터 파생된 child path 여부 확인.

    

    //Aggregation에 N건 모델 바인딩 처리시 모델정보 ui에 매핑 처리.
    oAPP.fn.setAggrBind = function(oUI){

        if(typeof oUI?._T_0015 === "undefined"){
            return;
        }

        if(oUI._T_0015.length === 0){return;}

        //Aggregation에 바인딩처리된 정보 얻기.
        var lt_0015 = oUI._T_0015.filter( a => a.UIATY === "3" && a.ISBND === "X" && a.UIATV !== "" );

        if(lt_0015.length === 0){return;}

        for(var i = 0, l = lt_0015.length; i < l; i++){

            oUI._MODEL[lt_0015[i].UIATT] = lt_0015[i].UIATV;

        }

    };  //Aggregation에 N건 모델 바인딩 처리시 모델정보 ui에 매핑 처리.


    //UI에 바인딩처리된경우 부모 UI에 해당 정보 매핑.
    oAPP.fn.setModelBind = function(oUi){

        //부모 model 바인딩 정보에 해당 UI 매핑 처리 function.
        function lf_getParentAggrModel(UIATV, EMBED_AGGR, parent){

            if(!parent){return;}

            //대상 Aggregation에 N건 바인딩 처리가 안된경우 상위 부모 탐색.
            if(!parent._MODEL[EMBED_AGGR]){

                var l_name = parent._UILIB;

                //부모가 sap.ui.table.Column인경우 sap.ui.table.Table(TreeTable)의
                //row Aggregation에 N건 바인딩 처리됐는지 여부 판단.
                if(l_name === "sap.ui.table.Column"){

                    //ui table(tree table의 columns에 바인딩처리가 안된경우.)
                    if(!parent.__PARENT._MODEL["coloums"]){
                        return lf_getParentAggrModel(UIATV, "rows", parent.__PARENT);
                    }

                }

                if(l_name === "sap.ui.table.RowAction" && !parent._MODEL["items"]){
                    //부모가 sap.ui.table.RowAction 인경우 items에 바인딩 처리가 안됐다면.
                    //그 상위 부모인 table(tree table)의 rows aggregation에 N건 바인딩 처리 됐는지 여부 판단
                    return lf_getParentAggrModel(UIATV, "rows", parent.__PARENT);

                }

                if((l_name === "sap.ui.table.Table" || l_name === "sap.ui.table.TreeTable" ) &&
                    (EMBED_AGGR === "rowActionTemplate" || EMBED_AGGR === "rowSettingsTemplate")){
                
                    //부모가 table, tree table이면서 현재 UI가 rowActionTemplate, rowSettingsTemplate에 존재하는경우.
                    //rows rows aggregation에 N건 바인딩 처리 됐는지 여부 판단.
                    return lf_getParentAggrModel(UIATV, "rows", parent);

                }

                return lf_getParentAggrModel(UIATV, parent._EMBED_AGGR, parent.__PARENT);
            }

            //대상 Aggregation에 N건 바인딩 Path가 다른경우 상위 부모 탐색.
            if(oAPP.fn.chkBindPath(parent._MODEL[EMBED_AGGR], UIATV) !== true){
                return lf_getParentAggrModel(UIATV, parent._EMBED_AGGR, parent.__PARENT);
            }

            //model 정보 수집된건이 없는경우.
            if(!parent._BIND_AGGR[EMBED_AGGR]){
                //구조 생성.
                parent._BIND_AGGR[EMBED_AGGR] = [];
            }

            //이미 model정보가 수집되어있는경우 exit.
            if(parent._BIND_AGGR[EMBED_AGGR].findIndex( a=> a === oUi) !== -1){
                return true;
            }

            //현재 UI 수집처리.
            parent._BIND_AGGR[EMBED_AGGR].push(oUi);

            return true;

        } //부모 model 바인딩 정보에 해당 UI 매핑 처리 function.

        
        //현재 UI의 property에 바인딩된 정보 얻기.
        var lt_0015 = oUi._T_0015.filter( a => a.ISBND === "X" && a.UIATV !== "" );

        //바인딩된 정보가 존재하지 않는경우 exit.
        if(lt_0015.length === 0){return;}


        //바인딩된 정보를 기준으로 부모를 탐색하며 N건 바인딩 여부 확인.
        for(var i = 0, l = lt_0015.length; i < l; i++){
        
            //N건 바인딩 처리되어 parent에 현재 UI를 추가한 경우 exit.
            if(lf_getParentAggrModel(lt_0015[i].UIATV, oUi._EMBED_AGGR, oUi.__PARENT) === true){
                return;
            }

        }

    };  //UI에 바인딩처리된경우 부모 UI에 해당 정보 매핑.



    //대상 UI로부터 부모를 탐색하며 n건 바인딩 값 얻기.
    oAPP.fn.getParentAggrBind = function(oUI, UIATT){

        if(!oUI){return;}

        if(!oUI._MODEL[UIATT]){

            //sap.ui.table.Column의 template Aggregation에서 부모를 탐색하는경우.
            if(oUI._UILIB === "sap.ui.table.Column" &&
                typeof oUI.__PARENT !== "undefined" &&
                UIATT === "template"){

                //sap.ui.table.Column의 상위 부모가 sap.ui.table.Table이라면.
                if(oUI.__PARENT._UILIB === "sap.ui.table.Table" ||
                    oUI.__PARENT._UILIB === "sap.ui.table.TreeTable"){

                    //상위 부모의 columns에 바인딩 처리안된경우 rows aggregation으로 판단.
                    if(typeof oUI.__PARENT._MODEL["columns"] === "undefined"){
                        //rows에 바인딩 처리됐는지 확인.
                        return oAPP.fn.getParentAggrBind(oUI.__PARENT, "rows");
                    }

                }

            }

            if(oUI._UILIB === "sap.ui.table.RowAction" || oUI._UILIB === "sap.ui.table.RowSettings"){

                if(oUI.__PARENT._UILIB === "sap.ui.table.Table" ||
                    oUI.__PARENT._UILIB === "sap.ui.table.TreeTable"){

                    //rows에 바인딩 처리됐는지 확인.
                    return oAPP.fn.getParentAggrBind(oUI.__PARENT, "rows");

                }

            }

            return oAPP.fn.getParentAggrBind(oUI.__PARENT, oUI._EMBED_AGGR);
        }

        //모델에 n건 바인딩이 구성된 경우.
        if(oUI._MODEL[UIATT] !== ""){
            return oUI._MODEL[UIATT];
        }

        return oAPP.fn.getParentAggrBind(oUI.__PARENT, oUI._EMBED_AGGR);

    };  //대상 UI로부터 부모를 탐색하며 n건 바인딩 값 얻기.



    //대상 UI로부터 자식을 탐색하며 바인딩 가능 여부 점검.
    oAPP.fn.getChildAggrBind = function(OBJID, BINDFIELD){
        
        //입력 OBJECT의 CHILD UI 정보 얻기.
        var _aChild = oAPP.attr.T_0014.filter( item => item.POBID ===  OBJID );

        //CHILD 정보가 없다면 EXIT.
        if(_aChild.length === 0){
            return;
        }

        for (let i = 0; i < _aChild.length; i++) {

            var sChild = _aChild[i];

            //CHILD에 매핑된 모델 바인딩 정보를 확인.
            for (const key in oAPP.attr.prev[sChild.OBJID]._MODEL) {

                var _sModel = oAPP.attr.prev[sChild.OBJID]._MODEL[key];

                //CHILD에 매핑된 모델 바인딩건과 현재 입력한 모델 PATH가 같다면.
                if(_sModel === BINDFIELD){
                    
                    //같은 PATH 정보 바인딩됨 FLAG RETURN.
                    return true;
                }                       

            }

            //하위를 탐색하며 입력 모델 PATH와 같은 바인딩이 설정 됐는지 확인.
            var _found = oAPP.fn.getChildAggrBind(sChild.OBJID, BINDFIELD);

            if(_found === true){
                return _found;
            }

        }

    };



    //aggregation 바인딩 처리 가능여부 점검.
    oAPP.fn.attrChkBindAggrPossible = function(is_attr){

        //파라메터 정보가 잘못됀 경우 오류 flag RETURN.
        if(typeof is_attr?.OBJID === "undefined" || is_attr?.OBJID === ""){
            return true;
        }

        //파라메터 정보가 잘못됀 경우 오류 flag RETURN.
        if(typeof is_attr?.UIATK === "undefined" || is_attr?.UIATK === ""){
            return true;
        }


        //DESIGN TREE에서 입력한 OBJECT ID의 CHILD UI정보 얻기.
        var _aChild = oAPP.attr.oDesign.oModel.oData.TREE_DESIGN.filter( item => 
            item.DATYP === "01" && item.S_14_POBID === is_attr.OBJID );

        //CHILD 정보가 없는경우 exit.
        if(_aChild.length === 0){
            return false;
        }
        
        //현재 바인딩 아이콘을 선택한 AGGREGATION에 추가된 UI정보 얻기.
        var _afilter = _aChild.filter( a => a.S_14_UIATK === is_attr.UIATK);

        //현재 aggregation에 2개 이상의 UI가 추가된경우.
        if(_afilter.length >= 2){
            
            //오류 FLAG RETURN.
            return true;
        }

        return false;


    };  //aggregation 바인딩 처리 가능여부 점검.


    //design tree 정보에서 UI명에 해당하는건 검색.
    oAPP.fn.getDesignTreeData = function(OBJID, is_tree){

        //최초 호출상태인경우.
        if(typeof is_tree === "undefined"){
            //ROOT를 매핑.
            is_tree = oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN[0];
        }

        //현재 TREE가 검색대상건인경우 해당 TREE정보 RETURN.
        if(is_tree.OBJID === OBJID && is_tree.DATYP === "01"){
            return is_tree;
        }

        //child가 존재하지 않는경우 exit.
        if(!is_tree.zTREE_DESIGN || is_tree.zTREE_DESIGN.length === 0){return;}

        //현재 TREE가 검색대상이 아닌경우 CHILD를 탐색하며 OBJID에 해당하는 TREE정보 검색.
        for(var i = 0, l = is_tree.zTREE_DESIGN.length; i < l; i++){
        
            var ls_tree = oAPP.fn.getDesignTreeData(OBJID, is_tree.zTREE_DESIGN[i]);
            
            if(typeof ls_tree  !== "undefined"){
                return ls_tree;
            }

        }

    };  //design tree 정보에서 UI명에 해당하는건 검색.



    //design tree 정보에서 UI명에 해당하는 attr 정보 검색.
    oAPP.fn.getDesignTreeAttrData = function(OBJID, UIATK, is_tree){

        //최초 호출상태인경우.
        if(typeof is_tree === "undefined"){
            //ROOT를 매핑.
            is_tree = oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN[0];
        }

        //현재 TREE가 검색대상건인경우 해당 TREE정보 RETURN.
        if(is_tree.OBJID === OBJID && is_tree.UIATK === UIATK && is_tree.DATYP === "02"){
            return is_tree;
        }

        //child가 존재하지 않는경우 exit.
        if(!is_tree.zTREE_DESIGN || is_tree.zTREE_DESIGN.length === 0){return;}

        //현재 TREE가 검색대상이 아닌경우 CHILD를 탐색하며 OBJID에 해당하는 TREE정보 검색.
        for(var i = 0, l = is_tree.zTREE_DESIGN.length; i < l; i++){
        
            var ls_tree = oAPP.fn.getDesignTreeAttrData(OBJID, UIATK, is_tree.zTREE_DESIGN[i]);
            
            if(typeof ls_tree  !== "undefined"){
                return ls_tree;
            }

        }

    };  //design tree 정보에서 UI명에 해당하는건 검색.


    //sap.ui.core.HTML UI의 content 프로퍼티에서 바인딩, editor 호출전 점검.
    oAPP.fn.attrChkHTMLContent = function(is_attr, bFlag, fnCallback){

        //HTML UI의 content 프로퍼티가 아닌경우 exit.
        if(is_attr.UIATK !== "AT000011858"){return;}

        var l_chk = false, l_msg = "";

        //바인딩 팝업전 호출한 경우.
        if(bFlag === true){

            //UI명 + 프로퍼티명으로 OBJID 구성.
            var l_objid = is_attr.OBJID + is_attr.UIASN;

            //HTML editor 입력건 존재여부 확인.
            l_chk = oAPP.attr.T_CEVT.findIndex( a => a.OBJTY === "HM" && a.OBJID === l_objid) !== -1 ? true : false;
            
            //284	HTML Editor에 입력한 정보가 존재합니다. 바인딩 처리를 진행하시겠습니까?
            l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "284", "", "", "", "");

            if(oAPP.APP.isPackaged === false){
                l_msg = `HTML Editor에 입력한 정보가 존재합니다. 바인딩 처리를 진행하시겠습니까?`;
            }
        

        //HTML editor 팝업전 호출한 경우.
        }else if(bFlag === false){

            //바인딩건이 존재하는경우.
            if(is_attr.ISBND === "X" && is_attr.UIATV !== ""){
                l_chk = true;
            }

            //285	바인딩 정보가 존재합니다. HTML Source 입력처리를 진행하시겠습니까?
            l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "285", "", "", "", "");
            
            if(oAPP.APP.isPackaged === false){
                l_msg = `바인딩 정보가 존재합니다. HTML Source 입력처리를 진행하시겠습니까?`;
            }

        }

        //확인 불필요상태면 입력 function 호출 후 exit.
        if(l_chk !== true){

            fnCallback(is_attr);

            //function 호출처 skip을 위한 flag return.
            return true;
        }

        

        //확인이 필요한경우 메시지 팝업 호출.
        // parent.showMessage(sap, 30, "I", l_msg, function(param){
        sap.m.MessageBox.confirm(l_msg, function(param){
            // if(param !== "YES"){return;}
            if(param !== "OK"){return;}

            fnCallback(is_attr);

        });

        //function 호출처 skip을 위한 flag return.
        return true;


    };  //sap.ui.core.HTML UI의 content 프로퍼티에서 바인딩, editor 호출전 점검.



    //aggregation 바인딩 callback 처리.
    oAPP.fn.attrBindCallBackAggr = async function(bIsbind, is_tree, is_attr){

        //unbind 처리건인경우.
        if(bIsbind === false){

            //n건 바인딩 처리한 UI가 존재하는경우(GT_OTAB-F01).
            if(typeof oAPP.attr.prev[is_attr.OBJID]._BIND_AGGR[is_attr.UIATT] !== "undefined" && 
                oAPP.attr.prev[is_attr.OBJID]._BIND_AGGR[is_attr.UIATT].length !== 0){

                //122	Change the model, the binding that exists in the child is initialized.
                var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

                //123	Do you want to continue?
                l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

                if(oAPP.APP.isPackaged === false){
                    l_msg = `Change the model, the binding that exists in the child is initialized.\n` +
                        `Do you want to continue?`;
                }


                var _param = await new Promise(function(res){
                    //확인 팝업 호출.
                    // parent.showMessage(sap, 30, "I", l_msg, function(param){
                    sap.m.MessageBox.confirm(l_msg, function(param){
                        return res(param);
                    });

                });
        
                //확인팝업에서 YES를 안누른경우 EXIT.
                // if(param !== "YES"){return;}
                if(_param !== "OK"){return;}

                //unbind 처리.
                oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID], is_attr.UIATT, is_attr.UIATV);

                //변경건 대한 후속 처리.
                oAPP.fn.attrSetUnbindProp(is_attr);

                //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                oAPP.fn.attrUnbindTree(is_attr);
                    
                return;

            }

            //N건 바인딩 처리한 UI가 없으면 확인팝업 없이 unbind 처리.
            oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID], is_attr.UIATT, is_attr.UIATV);

            //변경건 대한 후속 처리.
            oAPP.fn.attrSetUnbindProp(is_attr);

            //TREE의 PARENT, CHILD 프로퍼티 예외처리.
            oAPP.fn.attrUnbindTree(is_attr);

            return;

        }

    
        //이전 바인딩 정보가 존재하는경우.
        if(is_attr.UIATV !== "" && is_attr.ISBND === "X"){

            //122	Change the model, the binding that exists in the child is initialized.
            var l_msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

            //123	Do you want to continue?
            l_msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");

            if(oAPP.APP.isPackaged === false){
                l_msg = `Change the model, the binding that exists in the child is initialized.\n` +
                    `Do you want to continue?`;
            }

            var _param = await new Promise(function(res){
                //확인 팝업 호출.
                // parent.showMessage(sap, 30, "I", l_msg, function(param){
                sap.m.MessageBox.confirm(l_msg, function(param){
                    return res(param);
                });

            });

            
            //확인팝업에서 YES를 안누른경우 EXIT.
            // if(param !== "YES"){return;}
            if(_param !== "OK"){return;}

            //UNBIND 처리.
            oAPP.fn.attrUnbindAggr(oAPP.attr.prev[is_attr.OBJID],is_attr.UIATT, is_attr.UIATV);

            //TREE의 PARENT, CHILD 프로퍼티 예외처리.
            oAPP.fn.attrUnbindTree(is_attr);

            //AGGREGATION 바인딩 처리.
            oAPP.fn.attrSetBindProp(is_attr, is_tree);
            

            oAPP.attr.prev[is_attr.OBJID]._MODEL[is_attr.UIATT] = is_attr.UIATV;

            return;

        }

        //이전 바인딩 정보가 존재하지 않는경우 바로 바인딩 처리.
        oAPP.fn.attrSetBindProp(is_attr, is_tree);

        oAPP.attr.prev[is_attr.OBJID]._MODEL[is_attr.UIATT] = is_attr.UIATV;


    };  //aggregation 바인딩 callback 처리.



    //프로퍼티 바인딩 처리.
    oAPP.fn.attrSetBindProp = function(is_attr, is_bInfo){

        //이전 바인딩 정보가 존재하는경우.
        if(is_attr.ISBND === "X"){
            //n건 바인딩 처리 정보 얻기.
            var l_model = oAPP.fn.getParentAggrBind(oAPP.attr.prev[is_attr.OBJID]);

            //n건 바인딩 정보가 존재하는경우.
            if(typeof l_model !== "undefined" && l_model !== ""){

                //현재 attr가 아닌 다른 바인딩된 UI가 N건 바인딩 처리됐는지 여부 확인.
                var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex(  a=> a.ISBND === "X" && a.UIATK !== is_attr.UIATK 
                    && a.UIATV.substr(0, l_model.length) === l_model );


                //다른 바인딩 설정건중 n건 바인딩 처리건이 없으면서 바인딩 팝업에서 선택한건도 n건 바인딩에 파생된건이 아닌경우.
                if(l_indx === -1 && is_bInfo.CHILD.substr(0, l_model.length) !== l_model){

                    //부모에서 현재 n건 바인딩 정보 제거 처리.
                    oAPP.fn.attrUnbindProp(is_attr);

                }

            }

        }

        //바인딩 팝업에서 선택한 PATH 정보.
        is_attr.UIATV = is_bInfo.CHILD;

        //바인딩됨 FLAG 처리.
        is_attr.ISBND = "X";

        //추가속성정의
        is_attr.MPROP = "";

        //프로퍼티인경우, 바인딩 추가 속성 정의가 존재하는경우.
        if(is_attr.UIATY === "1" && is_bInfo.MPROP !== ""){
            //바인딩 추가 속성 정의값 매핑.
            is_attr.MPROP = is_bInfo.MPROP || "";
        }


        //sap.ui.core.HTML UI의 content 프로퍼티에 바인딩 처리한경우.
        if(is_attr.UIATK === "AT000011858"){
            //UI에 수집되어있는 해당 이벤트 삭제.
            oAPP.fn.attrDelClientEvent(is_attr, "HM");
        }

        

        //프로퍼티의 DDLB 항목에서 바인딩 처리한경우.
        if(is_attr.UIATY === "1" && typeof is_attr.T_DDLB !== "undefined"){
            //DDLB항목에 바인딩한 정보 추가.
            is_attr.T_DDLB.push({KEY:is_attr.UIATV, TEXT:is_attr.UIATV, ISBIND:"X"});
        }

        //변경건 대한 후속 처리.
        oAPP.fn.attrChange(is_attr);

        //n건 바인딩 처리건인경우 부모 UI에 현재 UI 매핑 처리.
        oAPP.fn.setModelBind(oAPP.attr.prev[is_attr.OBJID]);


    };  //프로퍼티 바인딩 처리.



    //프로퍼티 바인딩 해제 처리.
    oAPP.fn.attrSetUnbindProp = function(is_attr){
        
        //n건 바인딩 처리 정보 얻기.
        var l_model = oAPP.fn.getParentAggrBind(oAPP.attr.prev[is_attr.OBJID]);

        //n건 바인딩 정보가 존재하는경우.
        if(typeof l_model !== "undefined" && l_model !== ""){

            //현재 attr이 아닌 다른 바인딩된 UI가 N건 바인딩 처리됐는지 여부 확인.
            var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex(  a=> a.ISBND === "X" && a.UIATK !== is_attr.UIATK 
                && a.UIATV.substr(0, l_model.length) === l_model );


            //다른 바인딩 설정건중 n건 바인딩 처리건이 없는경우.
            if(l_indx === -1){

                //부모에서 현재 n건 바인딩 정보 제거 처리.
                oAPP.fn.attrUnbindProp(is_attr);

            }

        }


        //바인딩 팝업에서 선택한 PATH 정보 초기화.
        is_attr.UIATV = "";

        //바인딩됨 FLAG 해제.
        is_attr.ISBND = "";

        //추가속성정의 초기화.
        is_attr.MPROP = "";

        //변경건 대한 후속 처리.
        oAPP.fn.attrChange(is_attr);

        //aggregation인경우 N건 바인딩 모델 정보 초기화.
        if(is_attr.UIATY === "3"){
            delete oAPP.attr.prev[is_attr.OBJID]._MODEL[is_attr.UIATT];
        }


    };  //프로퍼티 바인딩 해제 처리.



    //바인딩 해제 재귀호출.
    oAPP.fn.attrUnbindAggr = function(oUi, UIATT, UIATV){

        //T_0015의 바인딩 수집건 제거 처리.
        function lf_clearBindData(oUi){

            if(!oUi){return;}

            if(typeof oUi._T_0015 === "undefined"){return;}

            if(oUi._T_0015.length === 0){return;}

            //현재 UI에 설정된 N건 바인딩 해제 처리.
            for(var i = oUi._T_0015.length - 1; i >= 0; i--){

                //바인딩된건이 아닌경우 SKIP.
                if(oUi._T_0015[i].ISBND !== "X"){continue;}

                //바인딩건인경우 N건 바인딩 처리된 건인지 판단.
                if(oAPP.fn.chkBindPath(UIATV, oUi._T_0015[i].UIATV) === true){

                    var _s0015 = oUi._T_0015[i];

                    var _sTree = oAPP.fn.getDesignTreeAttrData(_s0015.OBJID, _s0015.UIATK);
                    if(typeof _sTree === "undefined"){
                        continue;
                    }

                    if(_sTree.UIATV === "3"){
                        oAPP.fn.attrUnbindAggr(oUi, _sTree.UIATT, _sTree.UIATV);

                    }

                    oAPP.fn.attrSetUnbindProp(_sTree);

                    // //N건 바인딩된 건인경우 바인딩 해제 처리.
                    // oUi._T_0015.splice(i, 1);
                }

            }

        } //T_0015의 바인딩 수집건 제거 처리.


        //n건 바인딩이 없는경우 exit.
        if(!oUi._BIND_AGGR[UIATT] || oUi._BIND_AGGR[UIATT].length === 0){

            //현재 UI에 수집된 ATTR 정보 초기화 로직 주석.
            //해당 FUNCTION 수행 이후 ATTR 수집건 처리 FUNCTION에 판단함.
            // //n건 바인딩 초기화 처리.
            // lf_clearBindData(oUi);

            //Aggregation에 n건 바인딩 처리 제거.
            if(oAPP.fn.chkBindPath(UIATV, oUi._MODEL[UIATT]) === true){
                delete oUi._MODEL[UIATT];
            }

            return;
        }


        //N건 바인딩 설정한 하위 UI가 존재하는경우.
        for(var i = oUi._BIND_AGGR[UIATT].length - 1; i >= 0; i--){

            //해당 UI로 파생된 N건 바인딩처리 UI가 없는경우.
            if(jQuery.isEmptyObject(oUi._BIND_AGGR[UIATT][i]._BIND_AGGR) === true){
                
                //n건 바인딩 초기화 처리.
                lf_clearBindData(oUi._BIND_AGGR[UIATT][i]);

                //n건 바인딩 수집건에서 제거 처리.
                oUi._BIND_AGGR[UIATT].splice(i, 1);

                continue;

            }


            //해당 UI로 파생된 N건 바인딩처리 UI가 있는경우.
            for(var j in oUi._BIND_AGGR[UIATT][i]._BIND_AGGR){
                //하위를 탐색하며 n건 바인딩 수집 제거 처리.  
                oAPP.fn.attrUnbindAggr(oUi._BIND_AGGR[UIATT][i], j, UIATV);
            }

            //n건 바인딩 초기화 처리.
            lf_clearBindData(oUi._BIND_AGGR[UIATT][i]);

            //n건 바인딩 수집건에서 제거 처리.
            oUi._BIND_AGGR[UIATT].splice(i, 1);


        } //N건 바인딩 설정한 하위 UI가 존재하는경우.


        //현재 UI에 수집된 ATTR 정보 초기화 로직 주석.
        //해당 FUNCTION 수행 이후 ATTR 수집건 처리 FUNCTION에 판단함.
        // //n건 바인딩 초기화 처리.
        // lf_clearBindData(oUi);

        
        //Aggregation에 n건 바인딩 처리 제거.
        if(oAPP.fn.chkBindPath(UIATV, oUi._MODEL[UIATT]) === true){
            delete oUi._MODEL[UIATT];
        }

    };  //바인딩 해제 재귀호출.


    //sap.m.Tree, sap.ui.table.TreeTable의 경우 예외처리 unbind.
    oAPP.fn.attrUnbindTree = function(is_attr){

        var lt_UIATK = [];

        switch (is_attr.UIATK) {
            case "AT000006260": //sap.m.Tree  items

                //PARENT, CHILD 프로퍼티 KEY 정보 구성.
                lt_UIATK = ["EXT00001190", "EXT00001191"];

                break;

            case "AT000013146": //sap.ui.table.TreeTable  rows

                //PARENT, CHILD 프로퍼티 KEY 정보 구성.
                lt_UIATK = ["EXT00001192", "EXT00001193"];

                break;
            
            default:
                return;
        }


        for(var i = 0, l = lt_UIATK.length; i < l; i++){

            //design tree 정보에서 UI명에 해당하는 attr 정보 검색.
            var ls_attr = oAPP.fn.getDesignTreeAttrData(is_attr.OBJID, lt_UIATK[i]);

            if(typeof ls_attr === "undefined"){
                continue;
            }


            //PARENT, CHILD ATTRIBUTE에 바인딩이 구성되어 있다면.
            if(ls_attr.UIATV !== "" && ls_attr.ISBND === "X" ){

                //변경건 대한 후속 처리.
                oAPP.fn.attrSetUnbindProp(ls_attr);

            }

        } 

    };  //sap.m.Tree, sap.ui.table.TreeTable의 경우 예외처리 unbind.


    /************************************************************************
   * attribute 입력건에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   ************************************************************************/
    oAPP.fn.attrChange = function(is_attr){

        //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
        oAPP.fn.attrChangeProc(is_attr);

    
    }; //attribute 입력건에 대한 처리.


    /************************************************************************
     * 바인딩 정보에 따른 기능 버튼 활성여부 설정.
     * **********************************************************************/
    oAPP.fn.setDesignTreeEnableButton = function(is_attr){
        
        //default 동일속성 적용 버튼 비활성.
        is_attr._bind_visible   = false;

        //default 바인딩 해제 버튼 비활성.
        is_attr._unbind_visible = false;

        //바인딩 처리가 되지 않은경우 exit.
        if(is_attr.ISBND !== "X"){
            return;
        }

        //바인딩 처리 된경우, 바인딩 해제 버튼 활성.
        is_attr._unbind_visible = true;

        //property가 아닌경우 동일속성 바인딩 버튼 활성화 처리 하지 않음.
        if(is_attr.UIATY !== "1"){
            return;
        }

        //select option2의 value 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00001161"){
            //동일속성 바인딩 적용버튼 활성화 처리 하지 않음.
            return;
        }

        //select option3의 value 프로퍼티인경우.
        if(is_attr.UIATK === "EXT00002507"){
            //동일속성 바인딩 적용버튼 활성화 처리 하지 않음.
            return;
        }

        //N건 입력 가능한 프로퍼티인경우 EXIT.
        if(is_attr.UIATY === "1" && is_attr.ISMLB === "X"){
            //동일속성 바인딩 적용버튼 활성화 처리 하지 않음.
            return;
        }

        
                    
        //동일속성 적용 버튼 활성.
        is_attr._bind_visible   = true;

        
    };


    /************************************************************************
   * attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.
   * **********************************************************************
   * @param {object} is_attr - 처리대상 attribute 라인 정보
   ************************************************************************/
  oAPP.fn.attrChangeProc = function(is_attr){

        //attr 변경처리.
        oAPP.fn.attrChgAttrVal(is_attr);


        //바인딩 정보에 따른 기능 버튼 활성여부 설정.
        oAPP.fn.setDesignTreeEnableButton(is_attr);


    };  //attribute 입력건에 대한 미리보기, attr 라인 style 등에 대한 처리.



    //property, event, Aggregation 입력값 처리.
    oAPP.fn.attrChgAttrVal = function(is_attr){

        //ATTRIBUTE 수집처리.
        function lf_add_T_0015(){

            //수집건이 존재하는경우.
            if(l_indx !== -1){
                //해당 이벤트 매핑.
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].UIATV = is_attr.UIATV;
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ISBND = is_attr.ISBND;
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].MPROP = is_attr.MPROP;
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ADDSC = is_attr.ADDSC;
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ISWIT = is_attr.ISWIT;
                oAPP.attr.prev[is_attr.OBJID]._T_0015[l_indx].ISSPACE = is_attr.ISSPACE;
                return;
            }

            //수집건이 존재하지 않는경우 신규 라인 생성 처리.
            var ls_0015 = oAPP.fn.crtStru0015();

            //attr의 입력값 매핑.
            oAPP.fn.moveCorresponding(is_attr, ls_0015);

            //이벤트 입력건 수집 처리.
            ls_0015.APPID = oAPP.attr.oAppInfo.APPID;
            ls_0015.GUINR = oAPP.attr.oAppInfo.GUINR;

            var ls_0022 = oAPP.attr.T_0022.find( a => a.UIOBK === is_attr.UIOBK );

            if(ls_0022){
                ls_0015.UILIK = ls_0022.UILIK;
            }

            oAPP.attr.prev[is_attr.OBJID]._T_0015.push(ls_0015);

        } //ATTRIBUTE 수집처리.


        //기존 수집건 존재 여부 확인.
        var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.findIndex( a => a.OBJID === is_attr.OBJID &&
            a.UIATT === is_attr.UIATT && a.UIATY === is_attr.UIATY );
        
        //바인딩 해제 건인경우.
        if(is_attr.UIATV === ""){

            //수집건 존재시.
            if(l_indx !== -1){
                //수집된 라인 삭제 처리.
                oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx, 1);

            }

            //바인딩 표현 필드 초기화.
            is_attr.UIATV   = "";
            is_attr.ISBND   = "";
            is_attr.ISSPACE = "";
            is_attr.MPROP   = "";
            is_attr.ADDSC   = "";
            is_attr.MPROP   = "";
            is_attr.ISWIT   = "";

            return;

        }


        //이벤트인경우 값이 입력됐다면.
        if(is_attr.UIATY === "2" && is_attr.UIATV !== ""){
            //입력값 수집 처리.
            lf_add_T_0015();
            return;

        }

        //AGGREGATION인경우 값이 입력됐다면.
        if(is_attr.UIATY === "3" && is_attr.UIATV !== ""){
            //입력값 수집 처리.
            lf_add_T_0015();
            return;

        }
        

        //이벤트에 라인의 입력값이 존재하지 않는경우.
        if(is_attr.UIATY === "2" && is_attr.UIATV === ""){
        
            //클라이언트 이벤트 검색.
            var l_cevt = oAPP.DATA.APPDATA.T_CEVT.find( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === "JS" );
            
            //클라이언트 이벤트가 존재하는경우 이벤트 수집처리.
            if(l_cevt){
                //서버이벤트 공백처리만 함.
                lf_add_T_0015();
                return;
            }

            //수집건이 존재하지 않는경우 exit.
            if(l_indx === -1){return;}

            //수집건존재, 서버이벤트, 클라이언트 이벤트가 없는경우 해당 라인 삭제 처리.
            oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx, 1);
            return;

        }

            
        //AGGREGATION인경우 입력값이 존재하지 않는경우 수집건 존재시.
        if(is_attr.UIATY === "3" && is_attr.UIATV === "" && l_indx !== -1){
            //수집된 라인 삭제 처리.
            oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx, 1);
            return;
        }

        
        var ls_0023, l_dval = "", l_ISLST = "";

        //ROOT가 아닌경우, 직접 입력가능한 aggregation이 아닌경우 default 값 얻기.
        if(is_attr.OBJID !== "ROOT" && is_attr.UIATK.indexOf("_1") === -1){
            ls_0023 = oAPP.attr.T_0023.find( a => a.UIATK === is_attr.UIATK );

        }

        if(ls_0023){
            l_dval = ls_0023.DEFVL;
            l_ISLST = ls_0023.ISLST;
        }

        //default 값과 동일한 경우 수집항목이 존재하지 않는경우 exit.
        if(l_dval === is_attr.UIATV && l_indx === -1){
            return;
        }

        //default 값과 동일한 경우 수집항목이 존재하는경우 해당 라인 제거 후 exit.
        if(l_dval === is_attr.UIATV && l_indx !== -1){
            var l_indx = oAPP.attr.prev[is_attr.OBJID]._T_0015.splice(l_indx,1);
            return;
        }

        //프로퍼티 type이 숫자 유형인경우.
        if(is_attr.UIATY === "1" && is_attr.ISBND === "" && is_attr.ISMLB === "" &&
        ( is_attr.UIADT === "int" || is_attr.UIADT === "float")){
            //입력값 숫자 유형으로 변경 처리.
            is_attr.UIATV  = String(Number(is_attr.UIATV));
        }


        is_attr.ISSPACE = "";

        //입력값이 존재하지 않는경우, default 값과 다르다면.
        if(is_attr.UIATV === "" && l_dval !== is_attr.UIATV){
            //SPACE 입력됨 FLAG 처리.
            is_attr.ISSPACE = "X";
        }


        //attr 입력건 수집 처리.
        lf_add_T_0015();


    }; //property, event, Aggregation 입력값 처리.


    //n건 바인딩한 프로퍼티 해제 처리.
    oAPP.fn.attrUnbindProp = function(is_attr){

        function lf_findModelBindParent(oParent){

            if(!oParent){return;}

            //N건 바인딩 정보가 존재하지 않는경우 상위 UI를 탐색.
            if(jQuery.isEmptyObject(oParent._BIND_AGGR) === true){
                lf_findModelBindParent(oParent.__PARENT);
                return;
            }

            //N건 바인딩 정보가 존재하는경우 입력 UI가 존재하는지 여부 확인.
            for(var i in oParent._BIND_AGGR){

                //현재 UI가 N건 바인딩 처리됐는지 확인.
                var l_indx = oParent._BIND_AGGR[i].findIndex( a => a === oAPP.attr.prev[is_attr.OBJID] );

                //N건 바인딩 처리 안된경우 SKIP.
                if(l_indx === -1){continue;}

                //부모의 N건 바인딩 수집건에서 현재 UI 제거 처리.
                oParent._BIND_AGGR[i].splice(l_indx, 1);
                return;

            }

            //N건 바인딩 정보에 입력 UI가 존재하지 않는경우 상위 UI 탐색.
            lf_findModelBindParent(oParent.__PARENT);

        }

        //상위 부모를 탐색하며 n건 바인딩 UI 수집건 제거.
        lf_findModelBindParent(oAPP.attr.prev[is_attr.OBJID].__PARENT);


    };  //n건 바인딩한 프로퍼티 해제 처리.


    /************************************************************************
     * 클라이언트 이벤트 삭제 처리.
     * **********************************************************************
     * @param {object} is_attr - 이벤트 발생한 attribute의 라인 정보.
     ************************************************************************/
    oAPP.fn.attrDelClientEvent = function(is_attr, OBJTY){

        //수집된 클라이언트 이벤트가 존재하지 않는경우 exit.
        if(oAPP.attr.T_CEVT.length === 0){return;}

        //클라이언트 이벤트 존재여부 확인.
        var l_index = oAPP.attr.T_CEVT.findIndex( a => a.OBJID === is_attr.OBJID + is_attr.UIASN && a.OBJTY === OBJTY );

        //클라이언트 이벤트가 존재하지 않는경우 EXIT.
        if(l_index === -1){return;}
        
        //클라이언트 이벤트 존재시 해당 라인 삭제 처리.
        oAPP.attr.T_CEVT.splice(l_index, 1);

    };  //클라이언트 이벤트 삭제 처리.




    //15번 정보 구조 생성.
    oAPP.fn.crtStru0015 = function(){

        return {"APPID":"","GUINR":"","OBJID":"","UIATK":"","UIATV":"","ISBND":"","UILIK":"",
                "UIOBK":"","UIATT":"","UIASN":"","UIADT":"","RVALU":"","BPATH":"","ADDSC":"",
                "UIATY":"","ISMLB":"","ISEMB":"","DEL_LIB":"","DEL_UOK":"","DEL_ATT":"",
                "ISWIT":"","ISSPACE":"","FTYPE":"","REFFD":"","CONVR":"","MPROP":""};
  
    };  //15번 정보 구조 생성.
  


    //MOVE-CORRESPONDING
    oAPP.fn.moveCorresponding = function(source,target){

        for(var i in source){
            if(typeof target[i] === "undefined"){continue;}
            target[i] = source[i];
        }
  
    };  //MOVE-CORRESPONDING


    /************************************************************************
     * sap.ui.table.Table의 SORT, FILTER초기화.(sap.ui.table.TreeTable도 가능)
     *-----------------------------------------------------------------------
    * @param {object} oTable - sort, filter를 초기화 할 대상 table UI
    ***********************************************************************/
     oAPP.fn.resetUiTableFilterSort = function(oTable) {

        if (typeof oTable === "undefined") { return; }

        //table 바인딩 sort 해제 처리.
        oTable.sort();

        //table의 컬럼 정보 얻기.
        var _aCol = oTable.getColumns();

        for (var i = 0, l = _aCol.length; i < l; i++) {

            var _oCol = _aCol[i];

            //필터 초기화.
            oTable.filter(_oCol);

            //sort 초기화.
            _oCol.setSorted(false);
        }


    }   //end of resetUiTableFilterSort     결과리스트 테이블의 SORT, FILTER초기화.



    /*************************************************************
     * @function - 모델 바인딩 필드 정보 검색.
     *************************************************************/
    oAPP.fn.getModelBindData = function(CHILD, aTree){

        for (let i = 0, l = aTree.length; i < l; i++) {
            
            var _sTree = aTree[i];

            //검색대상 모델 바인딩 필드 정보인경우.
            if(_sTree.CHILD === CHILD){
                //해당 라인 return.
                return _sTree;
            }


            //검색 대상 바인딩 필드가 아닌경우 하위를 탐색하며 검색. 
            var _sFound = oAPP.fn.getModelBindData(CHILD, _sTree.zTREE);

            //검색건이 존재한 경우 해당 라인 정보 return.
            if(typeof _sFound !== "undefined"){
                return _sFound;
            }
            
        }

    };

    
/********************************************************************
 * ******************************************************************
 * ******************************************************************
 *📝 바인딩 추가 기능 관련 로직 -END.
 ********************************************************************
 ********************************************************************
 ********************************************************************/



    //서버에서 바인딩 attr 정보 얻기.
    oAPP.fn.getBindFieldInfo = function() {

        //화면 잠금 처리.
        oAPP.attr.oModel.setProperty("/busy", true);

        //바인딩 필드 정보 초기화.
        oAPP.attr.oModel.oData.zTREE       = [];
        oAPP.attr.oModel.oData.TREE        = [];

        //추가 속성 정보 초기화.
        oAPP.attr.oModel.oData.T_MPROP     = [];

        oAPP.attr.oModel.refresh();
        

        //클래스명 서버 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("CLSNM", oAPP.attr.oAppInfo.CLSID);
        oFormData.append("APPID", oAPP.attr.oAppInfo.APPID);

        //테스트!!!!!!!!!
        if(parent?.oAPP?.PES_DEV === "X"){

            oFormData.append("sap-user", "pes");
            oFormData.append("sap-password", "dmstjq8!");

        }
        //테스트!!!!!!!!!

        //바인딩 필드 정보 검색.
        sendAjax(oAPP.attr.servNm + "/getBindAttrData", oFormData, function (param) {

            var l_model = oAPP.attr.oModel;

            //오류가 발생한 경우.
            if(param.RETCD === "E"){
                //오류 메시지 처리.
                sap.m.MessageToast.show(param.RTMSG,{duration: 3000, at:"center center"});
                
                //tree 정보 공백 처리.
                l_model.oData.zTREE = [];

                //화면 잠금 해제 처리.
                l_model.oData.busy = false;
                
                //모델 정보 바인딩 처리.
                l_model.refresh(true);

                oAPP.fn.setBusy(false);

                var CURRWIN = oAPP.REMOTE.getCurrentWindow(),
                PARWIN = CURRWIN.getParentWindow();

                PARWIN.webContents.send("if-bindPopup-callback", "X");

                return;
            }

            l_model.oData.TREE = param.T_ATTR;

            //default 화면 편집 불가능.
            l_model.oData.edit = false;

            //workbench 화면이 편집상태인경우.
            if(oAPP.attr.oAppInfo.IS_EDIT === "X"){
                //화면 편집 가능 flag 처리.
                l_model.oData.edit = true;
            }

            //바인딩 정보가 존재하지 않는경우.
            if (l_model.oData.TREE.length === 0) {
                //tree 정보 공백 처리.
                l_model.oData.zTREE = [];

                //화면 잠금 해제 처리.
                l_model.oData.busy = false;

                //모델 정보 바인딩 처리.
                l_model.refresh(true);

                // //바인딩 필드가 존재하지 않음 메시지 처리.
                sap.m.MessageToast.show("Binding attributes dose not exist.", {duration: 3000, at:"center center"});

                oAPP.fn.setBusy(false);

                var CURRWIN = oAPP.REMOTE.getCurrentWindow(),
                PARWIN = CURRWIN.getParentWindow();

                PARWIN.webContents.send("if-bindPopup-callback", "X");

                return;

            }

            //controller의 바인딩 가능 attribute 정보가 존재하는경우.
            if (l_model.oData.TREE.length !== 0) {

                //2레벨의 TABLE, STRUCTURE정보만 발췌.
                var lt_filt = l_model.oData.TREE.filter(a => a.ZLEVEL === 2 && a.KIND !== "E");

                //TABLE, STRUCTURE를 탐색하며 선택 가능 여부 처리.
                oAPP.fn.setBindEnable(lt_filt, "", l_model, "");

                //tree 바인딩 정보 구성.
                oAPP.fn.setTreeJson(l_model, "TREE", "CHILD", "PARENT", "zTREE");

            }

            //tree 전체 접힘 처리.
            oAPP.ui.oTree.collapseAll();

            //이전 선택 라인정보 초기화.
            oAPP.ui.oTree.clearSelection();

            //tee에서 필터 처리시 전체 펼침 처리.
            oAPP.ui.oTree.expandToLevel(99999);

            //화면 잠금 해제 처리.
            l_model.oData.busy = false;

            //모델 정보 바인딩 처리.
            l_model.refresh(true);

            // //tree table 컬럼길이 재조정 처리.
            // oAPP.fn.setTreeAutoResizeCol(500);

            //추가속성 table layout 설정.
            oAPP.fn.setAdditLayout('');


            var CURRWIN = oAPP.REMOTE.getCurrentWindow(),
            PARWIN = CURRWIN.getParentWindow();

            PARWIN.webContents.send("if-bindPopup-callback", "X");
          
            
            oAPP.fn.setBusy(false);

        }); //바인딩 필드 정보 검색.

    }; //서버에서 바인딩 attr 정보 얻기.




    //바인딩 가능여부 flag 처리.
    oAPP.fn.setBindEnable = function(it_tree, l_path, l_model, KIND_PATH, KIND) {

        if (it_tree.length === 0) {
            return;
        }

        for (var i = 0, l = it_tree.length; i < l; i++) {
            
            it_tree[i].isTabField = false;

            //table로부터 파생된 필드인경우.
            if(KIND === "T"){
                //table로부터 팡생된 필드임 flag 처리.
                it_tree[i].isTabField = true;
            }

            if(KIND_PATH === ""){
                it_tree[i].KIND_PATH = it_tree[i].KIND;

            }else{
                
                it_tree[i].KIND_PATH = KIND_PATH + "-" + it_tree[i].KIND;
            }

            switch (it_tree[i].KIND) {
                case "T": //TABLE인경우.

                    it_tree[i].enable = true;
                    it_tree[i].stat_src = "sap-icon://status-positive";
                    it_tree[i].stat_color = "#01DF3A";

                    var lt_child = l_model.oData.TREE.filter(a => a.PARENT === it_tree[i].CHILD);

                    //range table 여부 확인.
                    oAPP.fn.chkRangeTable(it_tree[i]);

                    oAPP.fn.setBindEnable(lt_child, l_path, l_model, it_tree[i].KIND_PATH, it_tree[i].KIND);

                    break;

                case "S": //STRUCTURE인경우.

                    //structure은 drag false.
                    it_tree[i].enable = false;

                    //현재 path의 하위 path정보 얻기.
                    var lt_child = l_model.oData.TREE.filter(a => a.PARENT === it_tree[i].CHILD);

                    //하위 path를 탐색하며 선택 가능 flag 처리.
                    oAPP.fn.setBindEnable(lt_child, l_path, l_model, it_tree[i].KIND_PATH, KIND);
                    break;

                case "E": //일반 필드인경우.

                    it_tree[i].enable = true;
                    it_tree[i].stat_src = "sap-icon://status-positive";
                    it_tree[i].stat_color = "#01DF3A";


                    break;

            }

        }

    }; //바인딩 가능여부 flag 처리.




    //바인딩 추가속성 정보 DDLB 선택 이벤트.
    oAPP.fn.setAddtBindInfoDDLB = function(oUi) {
        
        var _oModel = oUi.getModel();

        if(typeof _oModel === "undefined"){
            return;
        }

        var l_ctxt = oUi.getBindingContext();

        if(typeof l_ctxt === "undefined"){
            return;
        }

        var ls_line = l_ctxt.getProperty();

        //오류 표현 초기화.
        ls_line.stat    = null;
        ls_line.statTxt = "";

        //Bind type DDLB을 선택하지 않은경우 exit.
        if (ls_line.ITMCD !== "P04") {

            //모델 갱신 처리.
            _oModel.refresh();

            return;
        }

        //Reference Field name 라인 정보 얻기.
        var ls_P05 = _oModel.oData.T_MPROP.find(a => a.ITMCD === "P05");
        if (typeof ls_P05 === "undefined"){
            return;
        }

        //Reference Field name 라인 정보 얻기.
        var ls_P06 = _oModel.oData.T_MPROP.find(a => a.ITMCD === "P06");
        if (typeof ls_P06 === "undefined") {
            return;
        }

        //Bind type DDLB을 빈값 선택한 경우.
        if (ls_line.val === "") {

            //Reference Field name DEFAULT 선택 불가능 처리.
            ls_P05.edit = false;

            //Reference Field name 선택값 초기화.
            ls_P05.val = "";

            //Conversion Routine 선택 가능 처리.
            ls_P06.edit = true;

        } else if (ls_line.val !== "") {
            //Bind type DDLB을 선택한 경우.

            //Reference Field name DEFAULT 선택 가능 처리.
            ls_P05.edit = true;

            //Conversion Routine 선택 불가 처리.
            ls_P06.edit = false;

            //Conversion Routine 선택값 초기화.
            ls_P06.val = "";

        }

        //모델 갱신 처리.
        _oModel.refresh();

    }; //바인딩 추가속성 정보 DDLB 선택 이벤트.




    //drag 정보 처리.
    oAPP.fn.setDragStart = async function(oEvent){

        //drag한 위치의 바인딩 정보 얻기.
        var l_ctxt = oEvent.mParameters.target.getBindingContext();
        if (!l_ctxt) {
            return;
        }

        //drag한 TREE 정보 얻기.
        var ls_drag = l_ctxt.getProperty();
        if (!ls_drag) {
            return;
        }

        //바인딩 필드 정보에서 drag 시작처리.
        oAPP.attr.oDesign.ui.ROOT.data("dragStart", true);

        var l_obj = {};

        //프로세스 코드.
        l_obj.PRCCD = "PRC001";

        //application session key 매핑.
        l_obj.DnDRandKey = oAPP.attr.DnDRandKey;

        //DRAG 한 라인 정보.
        l_obj.IF_DATA = ls_drag;

        var l_json = JSON.stringify(l_obj);

        //DRAG한 UI ID 정보 세팅.
        event.dataTransfer.setData("prc001", l_json);


        //design tree의 drop 가능 여부 초기화.
        oAPP.attr.oDesign.fn.resetDropFlag(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN);


        //design tree의 drop style 초기화.
        oAPP.attr.oDesign.fn.resetDropStyle();


        //drop 가능 여부 설정.
        oAPP.attr.oDesign.fn.setDropFlag(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN, ls_drag);


        //drop style 설정.
        oAPP.attr.oDesign.fn.setDropStyle();



    };  //drag 정보 처리.


    /*************************************************************
     * @event - drag 종료 이벤트.
     *************************************************************/
    oAPP.fn.onBindFieldDragEnd = function(oEvent){

        //바인딩 필드 정보에서 drag 종료처리.
        oAPP.attr.oDesign.ui.ROOT.data("dragStart", null);

        
        //drop 가능 flag 초기화.
        oAPP.attr.oDesign.fn.resetDropFlag(oAPP.attr.oDesign.oModel.oData.zTREE_DESIGN);


        //drop style 초기화.
        oAPP.attr.oDesign.fn.resetDropStyle();


    };



    /*************************************************************
     * @event - 멀티 바인딩 버튼 이벤트.
     *************************************************************/
    oAPP.fn.onMultiBind = function(){

    };


    //drag 종료시 css 잔상 제거.
    window.ondragend = function(){
        oAPP.IPCRENDERER.send("if-dragEnd");
    };  //drag 종료시 css 잔상 제거.



    /************************************************************************
     * SAP Icon Image 경로를 주는 펑션
     ************************************************************************/
    oAPP.fn.fnGetSapIconPath = function (sIcon) {

        if (sIcon == null) {
            return;
        }

        var sIconName = sIcon + ".gif";

        return PATH.join(APP.getAppPath(), "icons", sIconName);

    }; // end of oAPP.fn.fnGetSapIconPath



})(window, oAPP);