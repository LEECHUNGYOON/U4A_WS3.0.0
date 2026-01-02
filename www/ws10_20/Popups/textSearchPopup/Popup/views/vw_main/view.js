export async function getView(){

/************************************************************************
 * 💖 컨트롤러 호출
 ************************************************************************/

    let sControlPath = "./control.js";

    const oRes   = await import(sControlPath);
    const oContr = await oRes.getControl();


/************************************************************************
 * 💖 화면 그리기
 ************************************************************************/

    let APP = new sap.m.App({        
        autoFocus: false,
    });

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    let PAGE1 = new sap.m.Page({
        enableScrolling: false,
        showFooter: false,
        showHeader: false,
    });

    PAGE1.setModel(oContr.oModel);
    
    APP.addPage(PAGE1);

     let HBOX1 = new sap.m.HBox({
        renderType: "Bare"
    });
    PAGE1.addContent(HBOX1);

    HBOX1.addStyleClass("u4aTextSearchToolbarWapper");

    let TOOLBAR1 = new sap.m.Toolbar({
        design: "Transparent"
    });
    HBOX1.addItem(TOOLBAR1);

    TOOLBAR1.addStyleClass("u4aTextSearchToolbar sapUiSizeCompact");

    /**
     * 👉 텍스트 검색 Input
     */
    let INPUT1 = new sap.m.Input({
        width: "250px",
        autocomplete: false,
        fieldWidth: "60%",
        description : "",
        showClearIcon: true,
        liveChange: oContr.fn.onTextSearch,
        submit: oContr.fn.onTextSearch
    });

    INPUT1.addEventDelegate({
        onkeydown: oContr.fn.onTextSearchKeyDown,
    });

    oContr.ui.INPUT1 = INPUT1;

    TOOLBAR1.addContent(INPUT1);

    INPUT1.addStyleClass("sapUiSizeCompact");

    TOOLBAR1.addContent(new sap.m.ToolbarSeparator());

    /**
     * 👉 텍스트 검색 n개 중 이전 찾기
     */
    let BUTTON2 = new sap.m.Button({
        icon: "sap-icon://navigation-up-arrow",
        press: function(){
            oContr.fn.textSearchUp();
        }
    });
    TOOLBAR1.addContent(BUTTON2);

    oContr.ui.SEARCH_UP_BTN = BUTTON2;

    /**
     * 👉 텍스트 검색 n개 중 다음 찾기
     */
    let BUTTON3 = new sap.m.Button({
        icon: "sap-icon://navigation-down-arrow",
        press: function(){
            oContr.fn.textSearchDown();
        }
    });
    TOOLBAR1.addContent(BUTTON3);

    oContr.ui.SEARCH_DOWN_BTN = BUTTON3;

    /**
     * 👉 텍스트 검색 팝업 닫기
     */
    let BUTTON4 = new sap.m.Button({
        icon: "sap-icon://decline",
        press: function(){
            oContr.fn.fnTextSearchClose();
        }
    });
    TOOLBAR1.addContent(BUTTON4);

    oContr.ui.APP = APP;

    return oContr;
    
}