/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : bindPopup/index.js
 ************************************************************************/

/************************************************************************
 * 에러 감지
 ************************************************************************/
var zconsole = parent.WSERR(window, document, console);

let oAPP = parent.oAPP;

(function (window, oAPP) {
    "use strict";

    oAPP.settings = {};

    let PATH = oAPP.PATH,
        APP = oAPP.APP,
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
        var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

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
            sVersion = oSetting_UI5.version,
            sTestResource = oSetting_UI5.testResource,
            sReleaseResource = `../../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
            bIsDev = oSettings.isDev,
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

        // 로그인 Language 적용
        oScript.setAttribute("data-sap-ui-theme", oThemeInfo.THEME);
        oScript.setAttribute("data-sap-ui-language", sLangu);
        oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.table, sap.ui.layout");

        // 개발일때와 release 할 때의 Bootstrip 경로 분기
        if (bIsDev) {
            oScript.setAttribute("src", sTestResource);
        } else {
            oScript.setAttribute("src", sReleaseResource);
        }

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

    //바인딩 팝업 화면 구성.
    oAPP.fn.callBindPopup = function () {

        //최상위 UI.
        var oApp = new sap.m.App();
        oApp.placeAt("content");
        oApp.addStyleClass("sapUiSizeCompact");

        //모델 정보 세팅.
        oAPP.attr.oModel = new sap.ui.model.json.JSONModel();
        oApp.setModel(oAPP.attr.oModel);

        //바인딩 팝업 table 출력 page.
        var oPage = new sap.m.Page({
            enableScrolling: false
        });
        oApp.addPage(oPage);


        //바인딩 tree toolabar 정보.
        var oTool = new sap.m.Toolbar();
        oPage.setCustomHeader(oTool);


        //전체펼침
        var oToolBtn1 = new sap.m.Button({
            text: "Expand All",
            icon: "sap-icon://expand-all",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: "Expand",
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn1);

        //tree 전체펼침 이벤트
        oToolBtn1.attachPress(function () {

            oAPP.attr.oTree.expandToLevel(99999);

            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setTreeAutoResizeCol(100);

        });

        //전체접힘
        var oToolBtn2 = new sap.m.Button({
            text: "Collapse All",
            icon: "sap-icon://collapse-all",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: "Collapse",
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn2);

        //tree 전체접힘 이벤트
        oToolBtn2.attachPress(function () {
            oAPP.attr.oTree.collapseAll();
        });


        oTool.addContent(new sap.m.ToolbarSeparator());


        //갱신버튼
        var oToolBtn3 = new sap.m.Button({
            text: "Refresh",
            icon: "sap-icon://refresh",
            type: "Emphasized",
            busy: "{/busy}",
            tooltip: "Refresh",
            busyIndicatorDelay: 1
        });
        oTool.addContent(oToolBtn3);

        //갱신버튼 이벤트
        oToolBtn3.attachPress(function () {
            //서버에서 바인딩 정보 얻기.
            oAPP.fn.getBindFieldInfo();
        });


        var oSpt1 = new sap.ui.layout.Splitter();
        oPage.addContent(oSpt1);

        //바인딩 tree 정보.
        oAPP.attr.oTree = new sap.ui.table.TreeTable({
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            rowHeight: 30,
            title: new sap.m.Label({
                text: "※ Table, Field를 Drag하여 Property, Aggregation에 Drop시 바인딩 할 수 있습니다."
            }),
            rowSelectionChange: oAPP.fn.selTabRow
        });
        oSpt1.addContentArea(oAPP.attr.oTree);


        oAPP.attr.oTree.attachFilter(function () {
            //tee에서 필터 처리시 전체 펼침 처리.
            this.expandToLevel(99999);
        });

        var l_edit = false;

        if (oAPP.attr.oAppInfo.IS_EDIT === "X") {
            l_edit = true;
        }

        //drag UI 생성.
        var oDrag = new sap.ui.core.dnd.DragInfo({
            enabled: l_edit,
            sourceAggregation: "rows"
        });
        oAPP.attr.oTree.addDragDropConfig(oDrag);


        //drag start 이벤트
        oDrag.attachDragStart(function (oEvent) {
            //drag 처리.
            oAPP.fn.setDragStart(oEvent);

        }); //drag start 이벤트


        var oLay1 = new sap.ui.layout.SplitterLayoutData({
            size: "{/width}",
            resizable: "{/resize}"
        });
        oAPP.attr.oTree.setLayoutData(oLay1);

        //바인딩 필드 정보 컬럼.
        var oTreeCol1 = new sap.ui.table.Column({
            filterProperty: "NTEXT",
            autoResizable: true,
            label: new sap.m.Label({
                text: "Object Name",
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{NTEXT}"
            })
        });
        oAPP.attr.oTree.addColumn(oTreeCol1);

        //바인딩 필드 타입 컬럼.
        var oTreeCol2 = new sap.ui.table.Column({
            filterProperty: "TYPE",
            autoResizable: true,
            label: new sap.m.Label({
                text: "Type",
                design: "Bold"
            })
        });
        oAPP.attr.oTree.addColumn(oTreeCol2);

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
            text: "{TYPE}"
        });
        oCol2Hbox1.addItem(oHbox1Txt1);


        //필드 description 컬럼.
        var oTreeCol3 = new sap.ui.table.Column({
            filterProperty: "DESCR",
            autoResizable: true,
            label: new sap.m.Label({
                text: "Description",
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{DESCR}"
            })
        });
        oAPP.attr.oTree.addColumn(oTreeCol3);


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
        // oAPP.attr.oTree.addColumn(oTreeCol4);


        //바인딩 TREE 모델 바인딩 처리.
        oAPP.attr.oTree.bindAggregation("rows", {
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
            rowHeight: 30,
            layoutData: new sap.ui.layout.SplitterLayoutData()
        });
        oSpt1.addContentArea(oTab);


        //추가바인딩 속성의 Property 컬럼.
        var oTabCol1 = new sap.ui.table.Column({
            label: new sap.m.Label({
                text: "Property",
                design: "Bold"
            }),
            template: new sap.m.Text({
                text: "{prop}"
            })
        });
        oTab.addColumn(oTabCol1);

        //추가바인딩 속성의 value 컬럼.
        var oTabCol2 = new sap.ui.table.Column({
            label: new sap.m.Label({
                text: "Value",
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
        oTabCol2Inp1.attachChange(function () {
            //conversion명 대문자 변환 처리.
            oAPP.fn.setConvNameUpperCase(this);

            //바인딩 추가속성값 설정.
            oAPP.fn.setMPROP();

        });

        //추가속성정보 DDLB 필드.
        var oTabCol2Sel1 = new sap.m.Select({
            selectedKey: "{val}",
            visible: "{sel_vis}",
            editable: "{edit}",
            valueState: "{stat}",
            valueStateText: "{statTxt}",
            enabled: "{/edit}"
        });
        oTabCol2HBox1.addItem(oTabCol2Sel1);

        //바인딩 추가속성 정보 DDLB 선택 이벤트.
        oTabCol2Sel1.attachChange(function () {
            //바인딩 추가속성 정보 DDLB 선택 이벤트.
            oAPP.fn.setAddtBindInfoDDLB(this);

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
            template: new sap.ui.table.Row()
        });


        // //table Drag 설정.
        // oAPP.fn.setTreeDrag();


        //서버에서 바인딩 정보 얻기.
        oAPP.fn.getBindFieldInfo();



    }; //바인딩 팝업 화면 구성.




    //바인딩 추가 속성값 설정.
    oAPP.fn.setMPROP = function () {
        var l_indx = oAPP.attr.oTree.getSelectedIndex();
        if (l_indx === -1) {
            return;
        }

        var l_ctxt = oAPP.attr.oTree.getContextByIndex(l_indx);
        if (!l_ctxt) {
            return;
        }

        var ls_tree = l_ctxt.getProperty();

        if (ls_tree.KIND !== "E") {
            return;
        }

        //Bind type 라인 얻기.
        var ls_p04 = oAPP.attr.oModel.oData.T_MPROP.find(a => a.ITMCD === "P04");
        if (!ls_p04) {
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //Reference Field name 라인 얻기.
        var ls_p05 = oAPP.attr.oModel.oData.T_MPROP.find(a => a.ITMCD === "P05");
        if (!ls_p05) {
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //Bind type이 구성된경우 Reference Field name이 존재하지 않는다면.
        if (ls_p04.val !== "" && ls_p05.val === "") {
            //추가속성정보 제거 처리.
            oAPP.attr.oModel.setProperty("MPROP", "", l_ctxt);
            return;
        }

        //추가속성 세팅된 값을 취합.
        for (var i = 3, l = oAPP.attr.oModel.oData.T_MPROP.length, l_array = []; i < l; i++) {
            //바인딩 추가 속성 정보 수집.
            l_array.push(oAPP.attr.oModel.oData.T_MPROP[i].val);

        }

        //return 파라메터에 바인딩 추가 속성 정보 매핑.
        ls_tree.MPROP = l_array.join("|");

        //tree의 해당 라인에 바인딩 추가속성값 매핑.
        oAPP.attr.oModel.setProperty("MPROP", ls_tree.MPROP, l_ctxt);


    }; //바인딩 추가 속성값 설정.


    //conversion명 대문자 변환 처리.
    oAPP.fn.setConvNameUpperCase = function (oUi) {

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
    oAPP.fn.chkStringTable = function (is_tree) {

        //TABLE이 아닌경우 EXIT.
        if (is_tree.KIND !== "T") {
            return;
        }

        //부모가 ROOT인경우 EXIT.(바인딩 가능한건은 STRU-FIELD or TABLE-FIELD만 가능)
        if (is_tree.PARENT === "Attribute") {
            return;
        }

        //현재 라인이 STRING_TABLE인경우 STRING_TABLE FLAG RETURN.
        if (is_tree.EXP_TYP === "STR_TAB") {
            return true;
        }

    }; //STRING_TABLE 여부 확인.




    //range table 여부 확인.
    oAPP.fn.chkRangeTable = function (is_tree) {

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
    oAPP.fn.selTabRow = function (oEvent) {

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
        oAPP.fn.setAdditLayout(ls_tree);


        var l_path = l_ctxt.getPath();

        l_path = l_path.substr(0, l_path.lastIndexOf("/"));

        //추가속성 정보 출력 처리.
        oAPP.fn.setAdditBindInfo(ls_tree, oAPP.attr.oModel.getProperty(l_path));

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
            var lt_col = oAPP.attr.oTree.getColumns();

            if (lt_col.length === 0) {
                return;
            }

            for (var i = lt_col.length - 1; i >= 0; i--) {
                oAPP.attr.oTree.autoResizeColumn(i);
            }

        }, iTime);


    }; //tree table 컬럼길이 재조정 처리.




    //tree drag 처리.
    oAPP.fn.setTreeDrag = function () {

        function lf_setDraggable() {
            console.log(111);
            var lt_row = oAPP.attr.oTree.getRows();

            if (lt_row.length == 0) {
                return;
            }

            for (var i = 0, l = lt_row.length; i < l; i++) {

                var l_dom = lt_row[i].getDomRef();
                if (!l_dom) {
                    continue;
                }

                l_dom.draggable = false;

                var l_ctxt = lt_row[i].getBindingContext();
                if (!l_ctxt) {
                    continue;
                }

                var l_binfo = l_ctxt.getProperty();

                l_dom.draggable = l_binfo.enable;


            }


        }

        var l_meta = sap.ui.table.Row.getMetadata();
        l_meta.dnd.draggable = true;

        var l_bind = oAPP.attr.oTree.getBinding();

        if (!l_bind) {
            return;
        }

        l_bind.attachChange(lf_setDraggable);

        oAPP.attr.oTree.attachToggleOpenState(lf_setDraggable);
        oAPP.attr.oTree.attachFirstVisibleRowChanged(lf_setDraggable);



    }; //tree drag 처리.


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


    /************************************************************************
     * -- Start of Program
     ************************************************************************/

    // // UI5 Boot Strap을 로드 하고 attachInit 한다.
    oAPP.fn.fnLoadBootStrapSetting();

    window.onload = function () {

        sap.ui.getCore().attachInit(function () {

            //바인딩 팝업 화면 구성.
            oAPP.fn.callBindPopup();

            // oAPP.fn.fnInitModelBinding();

            // oAPP.fn.fnInitRendering();

            oAPP.setBusy('');

        });

    };




    //추가속성 table layout 설정.
    oAPP.fn.setAdditLayout = function (is_tree) {

        if (!is_tree) {
            //좌측 tree 영역 100%으로 설정(우측 바인딩 세부정보 비활성 처리)
            oAPP.attr.oModel.oData.width = "100%";
            oAPP.attr.oModel.oData.resize = false;
            oAPP.attr.oModel.refresh();
            return;
        }

        //일반 필드가 아닌경우.
        if (is_tree.KIND !== "E") {
            //바인딩 추가 구성 정보 초기화.
            oAPP.attr.oModel.oData.T_MPROP = [];

            //좌측 tree 영역 100%으로 설정(우측 바인딩 세부정보 비활성 처리)
            oAPP.attr.oModel.oData.width = "100%";
            oAPP.attr.oModel.oData.resize = false;
            oAPP.attr.oModel.refresh();

            //선택 해제 처리.
            oAPP.attr.oTree.clearSelection();

            return;
        }

        //프로퍼티에서 바인딩 팝업 호출시 추가속성 정보 활성 처리.
        if (is_tree.KIND === "E") {
            oAPP.attr.oModel.oData.width = "65%";
            oAPP.attr.oModel.oData.resize = true;
        }

        oAPP.attr.oModel.refresh();


    }; //추가속성 table layout 설정.




    //추가속성 정보 출력 처리.
    oAPP.fn.setAdditBindInfo = function (is_tree, it_parent) {

        oAPP.attr.oModel.oData.T_MPROP = [];

        //바인딩 팝업 호출 ATTR의 타입이 프로퍼티가 아닌경우 EXIT.
        if (is_tree.KIND !== "E") {
            oAPP.attr.oModel.refresh();
            return;
        }


        //바인딩 추가속성 리스트 얻기.
        var lt_ua028 = oAPP.attr.T_9011.filter(a => a.CATCD === "UA028");

        var ls_mprop = {},
            lt_split = [];

        //바인딩 추가 속성 정의건이 존재하는 경우.
        if (is_tree.MPROP) {
            lt_split = is_tree.MPROP.split("|");
        }

        //nozero 불가능 항목.
        var l_nozero = "Cg";

        //number format 가능항목.
        var l_numfmt = "IP";

        for (var i = 0, l = lt_ua028.length, l_cnt = 0; i < l; i++) {

            ls_mprop.ITMCD = lt_ua028[i].ITMCD;
            ls_mprop.prop = lt_ua028[i].FLD01;
            ls_mprop.val = "";
            ls_mprop.stat = "None";
            ls_mprop.statTxt = "";

            ls_mprop.edit = false;
            ls_mprop.inp_vis = false;
            ls_mprop.sel_vis = false;
            ls_mprop.txt_vis = false;

            //조회모드 여부 (예:X) 가 아닌경우 화면 edit 처리.
            if (lt_ua028[i].FLD02 !== "X") {
                ls_mprop.edit = true;
            }

            switch (lt_ua028[i].ITMCD) {

                case "P01": //Field name
                    ls_mprop.val = is_tree.NTEXT;
                    ls_mprop.txt_vis = true;
                    break;

                case "P02": //Field path
                    ls_mprop.val = is_tree.CHILD;
                    ls_mprop.txt_vis = true;
                    break;

                case "P03": //type
                    ls_mprop.val = is_tree.TYPE;
                    ls_mprop.txt_vis = true;
                    break;

                case "P04": //Bind type
                    if (is_tree.MPROP) {
                        ls_mprop.val = lt_split[0];
                    }
                    ls_mprop.sel_vis = true;

                    //P 타입이 아닌경우 입력 필드 잠금 처리.
                    if (is_tree.TYPE_KIND !== "P") {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = [{
                            "KEY": "",
                            "TEXT": ""
                        },
                        {
                            "KEY": "sap.ui.model.type.Currency",
                            "TEXT": "sap.ui.model.type.Currency"
                        },
                        {
                            "KEY": "ext.ui.model.type.Quantity",
                            "TEXT": "ext.ui.model.type.Quantity"
                        }
                    ];

                    break;

                case "P05": //Reference Field name
                    if (is_tree.MPROP) {
                        ls_mprop.val = lt_split[1];
                    }
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

                    ls_mprop.val = is_tree.CONVE;

                    ls_mprop.maxlen = 5;

                    if (is_tree.MPROP) {
                        ls_mprop.val = lt_split[2];
                    }
                    ls_mprop.inp_vis = true;
                    break;

                case "P07": //Nozero
                    if (is_tree.MPROP) {
                        ls_mprop.val = lt_split[3];
                    }

                    //값이 존재하지 않는경우 default false
                    if (ls_mprop.val === "") {
                        ls_mprop.val = "false";
                    }

                    ls_mprop.sel_vis = true;

                    //Nozero 가능항목에 속하지 않는 타입인경우 입력필드 잠금 처리.
                    if (l_nozero.indexOf(is_tree.TYPE_KIND) !== -1) {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = [{
                            "KEY": "true",
                            "TEXT": "true"
                        },
                        {
                            "KEY": "false",
                            "TEXT": "false"
                        }
                    ];

                    break;

                case "P08": //Is number format?
                    if (is_tree.MPROP) {
                        ls_mprop.val = lt_split[4];
                    }

                    //값이 존재하지 않는경우 default false
                    if (ls_mprop.val === "") {
                        ls_mprop.val = "false";
                    }

                    ls_mprop.sel_vis = true;

                    //number format 가능항목에 속하지 않는 타입인경우 입력필드 잠금 처리.
                    if (l_numfmt.indexOf(is_tree.TYPE_KIND) === -1) {
                        ls_mprop.edit = false;
                    }

                    ls_mprop.T_DDLB = [{
                            "KEY": "true",
                            "TEXT": "true"
                        },
                        {
                            "KEY": "false",
                            "TEXT": "false"
                        }
                    ];

                    break;
            }

            oAPP.attr.oModel.oData.T_MPROP.push(ls_mprop);
            ls_mprop = {};

        }

        oAPP.attr.oModel.refresh();

    }; //추가속성 정보 출력 처리.




    //서버에서 바인딩 attr 정보 얻기.
    oAPP.fn.getBindFieldInfo = function () {

        //화면 잠금 처리.
        oAPP.attr.oModel.setProperty("/busy", true);

        //클래스명 서버 전송 데이터에 구성.
        var oFormData = new FormData();
        oFormData.append("CLSNM", oAPP.attr.oAppInfo.CLSID);
        oFormData.append("APPID", oAPP.attr.oAppInfo.APPID);

        //바인딩 필드 정보 검색.
        sendAjax(oAPP.attr.servNm + "/getBindAttrData", oFormData, function (param) {

            var l_model = oAPP.attr.oModel;

            //오류가 발생한 경우.
            if (param.RETCD === "E") {
                //오류 메시지 처리.
                sap.m.MessageToast.show(param.RTMSG, {
                    duration: 3000,
                    at: "center center"
                });

                //tree 정보 공백 처리.
                l_model.oData.zTREE = [];

                //화면 잠금 해제 처리.
                l_model.oData.busy = false;

                //모델 정보 바인딩 처리.
                l_model.refresh(true);

                return;
            }

            l_model.oData.TREE = param.T_ATTR;

            //default 화면 편집 불가능.
            l_model.oData.edit = false;

            //workbench 화면이 편집상태인경우.
            if (oAPP.attr.oAppInfo.IS_EDIT === "X") {
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
                sap.m.MessageToast.show("Binding attributes dose not exist.", {
                    duration: 3000,
                    at: "center center"
                });

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
            oAPP.attr.oTree.collapseAll();

            //이전 선택 라인정보 초기화.
            oAPP.attr.oTree.clearSelection();

            //tee에서 필터 처리시 전체 펼침 처리.
            oAPP.attr.oTree.expandToLevel(99999);

            //화면 잠금 해제 처리.
            l_model.oData.busy = false;

            //모델 정보 바인딩 처리.
            l_model.refresh(true);

            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setTreeAutoResizeCol(500);

            //추가속성 table layout 설정.
            oAPP.fn.setAdditLayout();


        }); //바인딩 필드 정보 검색.

    }; //서버에서 바인딩 attr 정보 얻기.




    //바인딩 가능여부 flag 처리.
    oAPP.fn.setBindEnable = function (it_tree, l_path, l_model, KIND_PATH, KIND) {

        if (it_tree.length === 0) {
            return;
        }

        for (var i = 0, l = it_tree.length; i < l; i++) {

            it_tree[i].isTabField = false;

            //table로부터 파생된 필드인경우.
            if (KIND === "T") {
                //table로부터 팡생된 필드임 flag 처리.
                it_tree[i].isTabField = true;
            }

            if (KIND_PATH === "") {
                it_tree[i].KIND_PATH = it_tree[i].KIND;

            } else {

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
    oAPP.fn.setAddtBindInfoDDLB = function (oUi) {

        var l_ctxt = oUi.getBindingContext();

        var ls_line = l_ctxt.getProperty();

        //Bind type DDLB을 선택하지 않은경우 exit.
        if (ls_line.ITMCD !== "P04") {
            return;
        }

        //Reference Field name 라인 정보 얻기.
        var ls_P05 = oAPP.attr.oModel.oData.T_MPROP.find(a => a.ITMCD === "P05");
        if (!ls_P05) {
            return;
        }

        //Reference Field name 라인 정보 얻기.
        var ls_P06 = oAPP.attr.oModel.oData.T_MPROP.find(a => a.ITMCD === "P06");
        if (!ls_P06) {
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
        oAPP.attr.oModel.refresh();

    }; //바인딩 추가속성 정보 DDLB 선택 이벤트.




    //drag 정보 처리.
    oAPP.fn.setDragStart = function (oEvent) {

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

    }; //drag 정보 처리.


    //drag 종료시 css 잔상 제거.
    window.ondragend = function () {
        oAPP.IPCRENDERER.send("if-dragEnd");
    }; //drag 종료시 css 잔상 제거.


})(window, oAPP);