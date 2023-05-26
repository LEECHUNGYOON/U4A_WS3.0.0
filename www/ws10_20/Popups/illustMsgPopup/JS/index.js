oAPP.FN = {};
oAPP.UI = {};

oAPP.SELKEY = undefined;

sap.ui.getCore().attachInit(() => {
    
    oAPP.WIN = oAPP.remote.getCurrentWindow();

    // 현재 브라우저의 이벤트 핸들러
    _attachCurrentWindowEvents();

    createUi();    // ▶ UI 생성

});


// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ 펑션 Group ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣
// ▶ [펑션] SAP 전체 테마 정보 추출(추출해서 모델 세팅까지만)
function GET_THEMEINFO() {

    let LT_THEMEINFO = [],
    
        LT_THEME = sap.ui.getVersionInfo().supportedThemes;

    for(var i = 0; i < LT_THEME.length; i++) {

        let LS_THEME = {};

        LS_THEME.THEME = LT_THEME[i];

        LT_THEMEINFO.push(LS_THEME);

    };

    let themeModle = new sap.ui.model.json.JSONModel();

    themeModle.setData({

        THEME : LT_THEMEINFO

    });

    let LO_THEMESELECT = sap.ui.getCore().byId("themeSelect");

    LO_THEMESELECT.setModel(themeModle);

};

// sap.m.IllustratedMessageSize
// ▶ [펑션] 일러스트 메세지 사이즈 추출
function GET_ILLUSTSIZE() {

    let LT_ILLUSTSIZE = [];

    let LS_ILLUSTSIZE = sap.m.IllustratedMessageSize;                // ▶ SAP 기본 일러스트 메세지 타입

    if(JSON.stringify(LS_ILLUSTSIZE) === '{}') {
        return; // [추후] 알림 메세지 작업
    };

    let LO_SIZEMODDEL = new sap.ui.model.json.JSONModel();

    for(var i in LS_ILLUSTSIZE) {

        if(LS_ILLUSTSIZE[i] === "Base") {
            continue;
        };

        let LS_SIZE = {};

        LS_SIZE.SIZE = LS_ILLUSTSIZE[i];

        LT_ILLUSTSIZE.push(LS_SIZE);

    };

    LO_SIZEMODDEL.setData({

        SIZE: LT_ILLUSTSIZE

    });

    let LO_SIZEMENU = sap.ui.getCore().byId('sizeSelect');

    LO_SIZEMENU.setModel(LO_SIZEMODDEL);



};

// ▶ [펑션] 사이즈 셀렉트
function SELECT_SIZE(e){

    let LS_SELITEM      = e.getParameter("item"),               // ▶ 이벤트가 발생한 메뉴 아이템
        LV_SELKEY       = LS_SELITEM.getKey(),                  // ▶ 선택된 메뉴 아이템의 key값
        LO_SIZEMENUBTN  = sap.ui.getCore().byId('sizeSelect');  // ▶ ID => sizeSelect인 메뉴 버튼

    oAPP.FN.SETTING_SIZE(LV_SELKEY);

    LO_SIZEMENUBTN.setText(LV_SELKEY);

};

// ▶ [펑션] 테마 셀렉트
function SELECT_THEME(e) {

    let LV_SELKEY           = e.getParameter("item").mProperties.key,       // ▶ 셀렉트 된 테마 정보 추출
        LO_THEMESELECT      = sap.ui.getCore().byId("themeSelect");         // ▶ MENUBUTTON UI => THEME

    oAPP.FRAMETHEME = LV_SELKEY;


    LO_THEMESELECT.setText(LV_SELKEY);                                      // ▶ MENU UI에 현재 적용 테마 세팅

    sap.ui.getCore().applyTheme(LV_SELKEY);

    oAPP.FN.SETTING_THEME();

};

// ▶ [펑션] 최상단 메뉴 버튼 클릭
function SELECT_KEY(event){

    let LV_SELEKEY      = event.getParameter('item').getKey(),                  // ▶ MENUBUTTON UI의 값
        LV_SELETXT      = event.getParameter('item').getText(),                 // ▶ SELECT UI의 텍스트
        LO_MENUBTN      = sap.ui.getCore().byId('u4aSWMenuBtn'),                // ▶ MENU BUTTON UI
        LO_MENUTXT      = LO_MENUBTN.getProperty('text');                       // ▶ MENU UI에 입력되어있는 텍스트

    if(typeof oAPP.SELKEY !== 'undefined' && oAPP.SELKEY === LV_SELEKEY) {

        return;
    };

    if(LV_SELETXT === LO_MENUTXT) {

        return;
    };

    CHECK_HEADER(LV_SELEKEY, LV_SELETXT, LO_MENUBTN);

};

// ▶ [펑션] 페이지 커스텀 헤더 visible 변경
function CHECK_HEADER(LV_SELEKEY, LV_SELETXT, LO_MENUBTN) {

    // debugger;

    let LO_FRAMECONT    = sap.ui.getCore().byId("frameCont");

    LO_FRAMECONT.setContent(`<iframe src=${LV_SELEKEY}.html style='width:100%; height:100%; border:none;'></iframe>`);
    
    LO_MENUBTN.setText(LV_SELETXT);

    oAPP.SELKEY = LV_SELEKEY;

    let LO_SAPTOOLBAR = sap.ui.getCore().byId("lo_sapToolBar"),
        LO_U4ATOOLBAR = sap.ui.getCore().byId("lo_u4aToolBar");

    // ▶ 최상단 메뉴버튼의 키값 분류
    switch(LV_SELEKEY) {
        case "selectSAP":

            LO_SAPTOOLBAR.setVisible(true);
            LO_U4ATOOLBAR.setVisible(false);
            
            let LO_SAPFIELD = sap.ui.getCore().byId('sapField');

            a = LO_SAPFIELD.getItems().find(a => a);

            a.setValue();

        break;

        case "selectU4A":

            LO_SAPTOOLBAR.setVisible(false);
            LO_U4ATOOLBAR.setVisible(true);

            let LO_U4AFIELD = sap.ui.getCore().byId('u4aField');

            b = LO_U4AFIELD.getItems().find(a => a);

            b.setValue();

        break;

        default:

        break;
    };

};

// ▶ [펑션] 선택한 탭 영역에 맞게 컨텐트 이동
function CHANGE_TAB(event){

    let LO_TABBAR   = sap.ui.getCore().byId('tabBar'),
        LS_PREVKEY  = event.getParameter('previousKey'),
        LS_CURRKEY  = event.getParameter('selectedKey');

    // ▶ 이전 키와 클릭한 키가 같을 때
    if(LS_PREVKEY === LS_CURRKEY) {
        return;
    };

    LO_TABBAR.setBusy(true);

    SET_TABPAGEVIS(LS_CURRKEY);

    oAPP.TABKEY = LS_CURRKEY;

};

// ▶ [펑션] 활성화 탭 키에 맞는 컨텐트 visible
function SET_TABPAGEVIS(LS_CURRKEY){

    let LO_GRIDPAGE     = oAPP.UI.LO_GRIDBOX,
        LO_DETAILPAGE   = oAPP.UI.LO_DETAILBOX,
        LO_SIZEBOX      = sap.ui.getCore().byId('sizeBox');
        // LO_FAVORITE     = sap.ui.getCore().byId("check");

    switch(LS_CURRKEY){
        case "GRID":
            LO_SIZEBOX.setVisible(true);
            // LO_FAVORITE.setVisible(true);

            LO_DETAILPAGE.setVisible(false);
            LO_GRIDPAGE.setVisible(true);
        break;

        case "DETAILS":
            LO_SIZEBOX.setVisible(false);
            // LO_FAVORITE.setVisible(false);

            LO_GRIDPAGE.setVisible(false);
            LO_DETAILPAGE.setVisible(true);
        break;

        default:

        break;
    };

    oAPP.UI.NAVCONT.to(LS_CURRKEY);
};

// ▶ [펑션] 서치필드 라이브 체인지 이벤트
function SEARCH_VALUE(e) {

    let LO_SEARCH = sap.ui.getCore().byId('search'),
        LO_VALUE  = LO_SEARCH.getValue();
        // LO_CKBOX  = sap.ui.getCore().byId('check'),
        // LO_CHECK  = LO_CKBOX.getSelected();

    let LO_CARDBOX      = oAPP.UI.LO_GRIDBOX,
        LO_UITABLE      = oAPP.UI.LO_DETAILBOX;

        LO_CARDBOX.getModel().refresh();

    let LS_CARDBIND     = LO_CARDBOX.getBinding("items"),
        LS_TABLEBIND    = LO_UITABLE.getBinding("rows");

    //바인딩 정보를 얻지 못한 경우 exit.
    if(!LS_CARDBIND || !LS_TABLEBIND){return;}

    //검색조건 값이 입력안된 경우 필터 해제 처리.
    if(LO_VALUE === ""){
        LS_CARDBIND.filter();
        LS_TABLEBIND.filter();

        return;
    };
    
    var LT_FILTER = [];

    // if(LO_CHECK === true) {
        
    //     LT_FILTER.push(new sap.ui.model.Filter({path:"VALUE", operator:"EQ", value1:1}));

    //     LS_TABLEBIND.filter();

    // };

    // if(LO_VALUE !== '') {

    //     if(LO_CKBOX.getVisible() === false) {

    //         LT_FILTER = [];
            
    //     };

        
    //     LT_FILTER.push(new sap.ui.model.Filter({path:"NAME", operator:"Contains", value1:LO_VALUE}));
    //     LT_FILTER.push(new sap.ui.model.Filter({path:"TYPE", operator:"Contains", value1:LO_VALUE}));
        
    //     LS_TABLEBIND.filter([new sap.ui.model.Filter(LT_FILTER, false)]);
    // };
    
    LT_FILTER.push(new sap.ui.model.Filter({path:"NAME", operator:"Contains", value1:LO_VALUE}));
    LT_FILTER.push(new sap.ui.model.Filter({path:"TYPE", operator:"Contains", value1:LO_VALUE}));
    
    
    
    //model 필터 처리.
    LS_CARDBIND.filter([new sap.ui.model.Filter(LT_FILTER, true)]);
    LS_TABLEBIND.filter([new sap.ui.model.Filter(LT_FILTER, false)]);

    // let LO_GRID = oAPP.UI.LO_GRIDBOX.getParent();

    // LO_GRID.scrollTo("Top");

};

// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ UI생성 후 ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    let LV_SETKEY = sap.ui.getCore().getConfiguration().getTheme();         // ▶ 현재 적용되어있는 테마의 정보

    oAPP.THEME = LV_SETKEY;                                                 // ▶ 

    GET_THEMEINFO();                                                        // ▶ 전체 테마 정보 추출
    
    GET_ILLUSTSIZE();                                                       // ▶ 일러스트 사이즈 정보 추출

    let LO_THEMESELECT      = sap.ui.getCore().byId("themeSelect");         // ▶ MENUBUTTON UI => THEME

    LO_THEMESELECT.setText(oAPP.THEME);                                     // ▶ MENU UI에 현재 적용 테마 세팅

    let LO_THEMEMENU        = sap.ui.getCore().byId("themeMenu");           // ▶ MENU UI

    LO_THEMEMENU.attachItemSelected(SELECT_THEME);                          // ▶ MENU UI에 itemSelected 이벤트

    oAPP.TABBAR             = sap.ui.getCore().byId('tabBar');              // ▶ ICON TAB BAR UI

    oAPP.TABKEY             = oAPP.TABBAR.getSelectedKey();

    oAPP.MENUBTN            = sap.ui.getCore().byId('lo_u4aThemeSelect');

    oAPP.CHECK              = sap.ui.getCore().byId('check');

    oAPP.WIN.show();

    let frameContent = document.querySelector('.won_content');

    var idx = 0;

    let contOpacity = setInterval(function() {

        if (frameContent.style.opacity === '0.9') {
            frameContent.style.opacity = '1';
            clearInterval(contOpacity);
            return;
        };

        frameContent.style.opacity = `0.${idx}`;

        idx++;

    }, 50);

};

/************************************************************************
 * 현재 브라우저의 이벤트 핸들러
 ************************************************************************/
function _attachCurrentWindowEvents() {

    CURRWIN.on("maximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://value-help");

    });

    CURRWIN.on("unmaximize", () => {

        if (typeof sap === "undefined") {
            return;
        }

        let oMaxBtn = sap.ui.getCore().byId("maxWinBtn");
        if (!oMaxBtn) {
            return;
        }

        oMaxBtn.setIcon("sap-icon://header");

    });

} // end of _attachCurrentWindowEvents

// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ UI생성 ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣
function createUi() {

    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    // ▶ App 생성
    let LO_APP = new sap.m.App("u4aFApp",),
        LO_FPAGE = new sap.m.Page("u4aFPAGE",{
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.m.Image({
                        width: "25px",
                        src: PATHINFO.WS_LOGO
                    }),
                    new sap.m.Title({
                        text: oAPP.ICON_MSG.M018 // Image Icons
                    }),
                ],
                contentMiddle: [
                    new sap.m.HBox({
                        width: "100%",
                        alignItems: "Center",
                        justifyContent: "Center",
                        renderType: "Bare",
                        items: [
                            new sap.m.MenuButton('u4aSWMenuBtn',{
                                text: oAPP.ICON_MSG.M002, //"SAP ICONS",
                                menu: new sap.m.Menu('selectKey',{
                                    items: [
                                        new sap.m.MenuItem({
                                            key: "selectSAP",
                                            text: oAPP.ICON_MSG.M002 //"SAP ICONS",
                                        }),
                                        // new sap.m.MenuItem({
                                        //     key: "selectU4A",
                                        //     text: "U4A ICONS"
                                        // }),
                                    ],
                                    itemSelected: SELECT_KEY
                                })
                            })
                        ]
                    })
                ],
                contentRight: [
                    new sap.m.Button({
                        icon: "sap-icon://less",
                        press: function () {

                            CURRWIN.minimize();

                        }
                    }),
                    new sap.m.Button("maxWinBtn", {
                        icon: "sap-icon://header",
                        press: function () {

                            let bIsMax = CURRWIN.isMaximized();

                            if (bIsMax) {
                                CURRWIN.unmaximize();
                                return;
                            }

                            CURRWIN.maximize();

                        }
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        press: function () {

                            if (CURRWIN.isDestroyed()) {
                                return;
                            }

                            CURRWIN.hide();

                        }
                    }),

                ]
            }).addStyleClass("u4aWsBrowserDraggable")
        }),
        LO_TABBAR = new sap.m.IconTabBar('tabBar',{
            expandable: false,
            expanded: true,
            stretchContentHeight: true,
            applyContentPadding: false,
            busyIndicatorDelay: 0,
            items: [
                new sap.m.IconTabFilter({
                    icon: "sap-icon://grid",
                    text: oAPP.ICON_MSG.M003, // "Grid"
                    key: "GRID"
                }),
                new sap.m.IconTabFilter({
                    icon: "sap-icon://list",
                    text: oAPP.ICON_MSG.M004, // "Details"
                    key: "DETAILS"
                }),
            ],
            select: CHANGE_TAB
        }),
        LO_TABCONT = new sap.m.Page('tabCont',{
            enableScrolling: false,
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.HBox('lo_sapToolBar',{
                        width: "100%",
                        renderType: "Bare",
                        justifyContent: "SpaceBetween",
                        items: [
                            new sap.m.HBox('sapField',{
                                width: "100%",
                                renderType: "Bare",
                                items: [
                                    new sap.m.SearchField('search',{
                                        liveChange: function(e){
                                            SEARCH_VALUE(e)
                                        }
                                    })
                                ]
                            }),
                            // new sap.m.CheckBox('check',{
                            //     visible: true,
                            //     text: "favorite",
                            //     select: function(e) {
                            //         SEARCH_VALUE(e);
                            //     }
                            // }),
                            new sap.m.HBox('sizeBox',{
                                width: "100px",
                                renderType: "Bare",
                                items: [
                                    new sap.m.MenuButton('sizeSelect',{
                                        width: "100%",
                                        type: "Transparent",
                                        text: "Auto",
                                        menu: new sap.m.Menu('sizeMenu',{
                                            items: {
                                                path: '/SIZE',
                                                template: new sap.m.MenuItem({
                                                    text: '{SIZE}',
                                                    key: '{SIZE}'
                                                })
                                            },
                                            itemSelected: SELECT_SIZE
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMarginBegin"),
                            new sap.m.HBox({
                                width: "180px",
                                renderType: "Bare",
                                items: [
                                    new sap.m.MenuButton('themeSelect',{
                                        width: "100%",
                                        type: "Transparent",
                                        menu: new sap.m.Menu('themeMenu',{
                                            items: {
                                                path: '/THEME',
                                                template: new sap.m.MenuItem({
                                                    text: '{THEME}',
                                                    key: '{THEME}'
                                                })
                                            },
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMarginBegin")
                        ]
                    }),
                    new sap.m.HBox('lo_u4aToolBar',{
                        width: "100%",
                        renderType: "Bare",
                        justifyContent: "SpaceBetween",
                        visible: false,
                        items: [
                            new sap.m.HBox('u4aField',{
                                width: "100%",
                                renderType: "Bare",
                                items: [
                                    new sap.m.SearchField({
                                        liveChange: function(e){
                                            SEARCH_VALUE(e)
                                        }
                                    })
                                ]
                            }),
                            new sap.m.HBox({
                                width: "140px",
                                renderType: "Bare",
                                items: [
                                    new sap.m.MenuButton('lo_u4aThemeSelect',{
                                        width: "100%",
                                        buttonMode: "Split",
                                        type: "Transparent",
                                        menu: new sap.m.Menu('lo_u4aThemeMenu',{
                                            items: [
                                                new sap.m.MenuItem({
                                                    text: oAPP.ICON_MSG.M006, //"Dark Mode"
                                                    key: "Dark Mode"
                                                }),
                                                new sap.m.MenuItem({
                                                    text: oAPP.ICON_MSG.M007, //"Light Mode"
                                                    key: "Light Mode"
                                                })
                                            ],
                                            itemSelected: function(event) {
                                                oAPP.FN.SELECT_MODE(event)
                                            }
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMarginBegin")
                        ]
                    })
                ]
            }),
            content: new sap.ui.core.HTML('frameCont',{
                blocked: true,
                content: "<iframe src='selectSAP.html' style='width:100%; height:100%; border:none;'></iframe>"
            })
        });

    LO_TABBAR.addContent(LO_TABCONT);
    LO_FPAGE.addContent(LO_TABBAR);
    LO_APP.addPage(LO_FPAGE);
    LO_APP.placeAt('content');

};