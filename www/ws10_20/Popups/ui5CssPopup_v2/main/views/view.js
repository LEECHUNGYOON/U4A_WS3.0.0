
export var oContr = await new Promise(async function(resolve){

/************************************************************************
 * 💖 컨트롤러 호출
 ************************************************************************/

    let sControlPath = "./control.js";

    const oRes = await import(sControlPath);
    const oContr = oRes.oContr;
   

/************************************************************************
 * 💖 화면 그리기
 ************************************************************************/

    let APP = new sap.m.App({
        busy: true,
        busyIndicatorDelay: 0,
        autoFocus: false,
    });

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    let PAGE1 = new sap.m.Page({
        enableScrolling: false,
        showFooter: false,
    });    
    PAGE1.addStyleClass("u4aWsCssPage");

    PAGE1.setModel(oContr.oModel);
    
    APP.addPage(PAGE1);

    // 메인 헤더툴바
    let TOOLBAR1 = new sap.m.OverflowToolbar();
    PAGE1.setCustomHeader(TOOLBAR1);
    
    let BUTTON1 = new sap.m.Button({
        icon: "sap-icon://menu2",
        press: function(){

            oContr.fn.setSideMenuExpToggle();

        }
    });
    TOOLBAR1.addContent(BUTTON1);

    let TITLE1 = new sap.m.Title({
        text: "UI5 Standard Predefined CSS Preview"
    });
    TOOLBAR1.addContent(TITLE1);

    TOOLBAR1.addContent(new sap.m.ToolbarSpacer());

    // 자식창 전체 닫기
    let BUTTON10 = new sap.m.Button({
        icon: "sap-icon://clear-all",
        type: "Negative",
        press: function(){

            oContr.fn.clearAllChildWindow();

        }
    });

    TOOLBAR1.addContent(BUTTON10);

    // // 메인 푸터툴바
    // let TOOLBAR2 = new sap.m.OverflowToolbar();
    // PAGE1.setFooter(TOOLBAR2);

    // let BUTTON2 = new sap.m.Button({    
    //     text: "[TEST] 메인 툴바"
    // });
    // TOOLBAR2.addContent(BUTTON2);

    /*****************************************
     * 📑 Splitter 영역
     *****************************************/
    let SPLITTER1 = new sap.ui.unified.SplitContainer({
        showSecondaryContent: true,
        secondaryContentWidth: "350px",
    });
    PAGE1.addContent(SPLITTER1);

    /*****************************************
     * 📑 Splitter 좌측 메뉴 페이지
     *****************************************/
    let PAGE2 = new sap.m.Page({
        enableScrolling: false,
        showHeader: false,
    });
    SPLITTER1.addSecondaryContent(PAGE2);

    // 좌측 메뉴영역의 네비 컨테이너 (추후 페이지 확장 고려)
    let NAVCON1 = new sap.m.NavContainer({
        autoFocus: false,
    });
    PAGE2.addContent(NAVCON1);

    // Splitter 좌측 메뉴 NAVCON 의 첫번째 페이지
    let PAGE3 = new sap.m.Page({
        showHeader: false
    });
    NAVCON1.addPage(PAGE3);

    // 좌측 메뉴 페이지 => NAVCON => 첫번째 페이지 헤더 툴바
    let TOOLBAR3 = new sap.m.OverflowToolbar();
    PAGE3.setCustomHeader(TOOLBAR3);

    // 좌측 메뉴 페이지 => NAVCON => 첫번째 페이지 푸터 툴바
    let TOOLBAR4 = new sap.m.OverflowToolbar();
    PAGE3.setFooter(TOOLBAR4);

    let BUTTON3 = new sap.m.Button({
        icon: "sap-icon://sys-help",
        text: "Other CSS Guides",  // [MSG]
        press: function(oEvent){

            let oButton = oEvent.getSource();

            oContr.fn.onOtherCssGuideButton(oButton);

        }
    });
    TOOLBAR4.addContent(BUTTON3);


    // let TITLE2 = new sap.m.Title({
    //     text: "[TEST] MASTER 메뉴",        
    // });
    // TOOLBAR3.addContent(TITLE2);
    
    // 좌측 메뉴 페이지 => NAVCON => 첫번째 페이지 컨텐츠의 List
    let LIST1 = new sap.m.List({
        mode: "SingleSelectMaster",
        items: {
            path: "/T_LMENU_LIST",
            template: new sap.m.StandardListItem({
                title: "{TITLE}",
                info: "{INFO}",                
            })
        },
        selectionChange: function(oEvent){

            oContr.fn.onListMenuSelectChange(oEvent);

        }

    });
    PAGE3.addContent(LIST1);


    /*****************************************
     * 📑 Splitter 우측 디테일 페이지
     *****************************************/
    let PAGE4 = new sap.m.Page({
        enableScrolling: false,
        showHeader: false,
    });
    SPLITTER1.addContent(PAGE4);

    // 우측 디테일 영역의 네비 컨테이너 (추후 페이지 확장 고려)
    let NAVCON2 = new sap.m.NavContainer({
        autoFocus: false,
    });
    PAGE4.addContent(NAVCON2);

    // 더미 페이지
    let DUMPG1 = new sap.m.Page({
        showHeader: false,
    });
    NAVCON2.addPage(DUMPG1);

    // 데이터 없음 페이지
    let NODATAPG1 = new sap.m.Page({
        showHeader: false,
    });
    NAVCON2.addPage(NODATAPG1);

    NODATAPG1.addStyleClass("NoDataPage");

    let VBOX2 = new sap.m.VBox({
        renderType: "Bare",
        height: "100%",
        alignItems: "Center",
        justifyContent: "Center"
    });
    NODATAPG1.addContent(VBOX2);

    let ILLUST1 = new sap.m.Illustration({
        type: "NoSearchResults",
        set: "sapIllus",
        media: "Scene"
    });
    VBOX2.addItem(ILLUST1);


    // 우측 디테일 페이지 => NAVCON => 첫번째 페이지
    let DTLPG1 = new sap.m.Page();
    NAVCON2.addPage(DTLPG1);

    // 우측 디테일 페이지 => NAVCON => 첫번째 페이지 헤더 툴바
    let TOOLBAR5 = new sap.m.OverflowToolbar();
    DTLPG1.setCustomHeader(TOOLBAR5);

    let TITLE3 = new sap.m.Title({
        text : "{/S_PRC/dtl_tit}"
    });
    TOOLBAR5.addContent(TITLE3);

    TOOLBAR5.addContent(new sap.m.ToolbarSpacer());

    // 테마 DDLB
    let SELECT1 = new sap.m.Select({
        selectedKey: "{/S_DETAIL/selectedTheme}",
        maxWidth: "300px",
        width: "200px",
        wrapItemsText: true,
        change: function(oEvent){
            
            let oSelectedItem = oEvent.getParameter("selectedItem");
            if(!oSelectedItem){
                return;
            }

            let sTheme = oSelectedItem.getKey();

            oContr.fn.setDetailThemeChange(sTheme);

        },       
        items: {
            path: "/S_DETAIL/T_THEME",
            template: new sap.ui.core.ListItem({
                key: "{key}",
                text: "{text}"
            })
        }
    });
    TOOLBAR5.addContent(SELECT1);
    
    TOOLBAR5.addContent(new sap.m.ToolbarSeparator());

    // 디테일 영역 새창 버튼
    let BUTTON5 = new sap.m.Button({
        icon: "sap-icon://popup-window",
        type: "Emphasized",
        press: function(oEvent){

            // 좌측 메뉴의 UI 인스턴스
            let oList = oContr.ui.LIST1;

            // 좌측 메뉴에서 선택한 메뉴 정보
            let oListItem = oList.getSelectedItem();
            if(!oListItem){
                oContr.fn.setBusy(false);
                return;
            }

            // 선택한 메뉴 정보의 모델 컨텍스트
            let oCtx = oListItem.getBindingContext();
            if(!oCtx){
                oContr.fn.setBusy(false);
                return;
            }

            // 선택한 메뉴 정보의 모델 데이터
            let oItemData = oCtx.getObject();

            oContr.fn.openNewBrowserMenu(oItemData);

        }
    });
    TOOLBAR5.addContent(BUTTON5);

    // 우측 디테일 페이지 => NAVCON => 첫번째 페이지 푸터 툴바
    let TOOLBAR6 = new sap.m.OverflowToolbar();
    DTLPG1.setFooter(TOOLBAR6);

    TOOLBAR6.addContent(new sap.m.ToolbarSpacer());

    // unselect 버튼
    let BUTTON4 = new sap.m.Button({        
        text: "Unselect ALL",
        icon: "sap-icon://refresh",
        press: function(oEvent){

            oContr.fn.onUnselectAll();                     

        }

    });
    TOOLBAR6.addContent(BUTTON4);

    // Preview 버튼
    let BUTTON6 = new sap.m.Button({        
        text: "Preview",        
        icon: "sap-icon://personnel-view",
        type: "Neutral",
        press: function(oEvent){

            oContr.fn.setCssPreview();            

        }

    });
    TOOLBAR6.addContent(BUTTON6);
    
    // Copy ClipBoard 버튼
    let BUTTON8 = new sap.m.Button({        
        text: "Copy ClipBoard",        
        icon: "sap-icon://copy",
        type: "Emphasized",
        press: function(oEvent){

            oContr.fn.setSelectedItemsCopyClipboard();

        }
    });
    TOOLBAR6.addContent(BUTTON8);

    // Accept 버튼
    let BUTTON7 = new sap.m.Button({        
        text: "Apply",        
        icon: "sap-icon://accept",
        type: "Accept",
        press: function(oEvent){

            oContr.fn.onApply();                      

        }
    });
    TOOLBAR6.addContent(BUTTON7);

    // Cancel 버튼
    let BUTTON9 = new sap.m.Button({        
        text: "Cancel",        
        icon: "sap-icon://decline",
        type: "Negative",
        press: function(oEvent){

            oContr.fn.setCssCancel();

        }
    });
    TOOLBAR6.addContent(BUTTON9);        



    // 우측 디테일 페이지 HTML
    let HTML1 = new sap.ui.core.HTML();
    let sHtml = `<iframe id="u4aWsCssPrevFrame" name="u4aWsCssPrevFrame" style="border:none;width:100%;height:100%;"></iframe>`;
    HTML1.setContent(sHtml);
    
    let VBOX1 = new sap.m.VBox({
        height: "100%",
        renderType:"Bare",
    });
    DTLPG1.addContent(VBOX1);

    VBOX1.addItem(HTML1);
    
    



    oContr.ui.SPLITTER1 = SPLITTER1;

    oContr.ui.SELECT1 = SELECT1;

    oContr.ui.LIST1 = LIST1;

    oContr.ui.DTLPG1 = DTLPG1;

    oContr.ui.NAVCON2 = NAVCON2;

    oContr.ui.NODATAPG1 = NODATAPG1;
    
    oContr.ui.ROOT = APP;

    resolve(oContr);

});