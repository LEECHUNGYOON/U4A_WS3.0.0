
oAPP.SVG        = [];
oAPP.UI         = {};
oAPP.FN         = {};

let LV_SAVEFOLDER   = oAPP.path.join(oAPP.__dirname, "JSONS"),
    LV_SAVEPATH     = `${LV_SAVEFOLDER}//favorite.json`;


sap.ui.getCore().attachInit(() => {

    SETTING_TNT();

    createUi();             // ▶ UI 생성

});

// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ 펑션 Group ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣

// ▶ [펑션] TNT 등록
function SETTING_TNT() {

    jQuery.sap.require("sap.m.IllustrationPool");

    let oTntSet = {
        setFamily: "tnt",
        setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
    };

    let oPool = sap.m.IllustrationPool;

    // register tnt illustration set
    oPool.registerIllustrationSet(oTntSet, false);

};

// ▶ [펑션] SAP 일러스트 메세지 데이터 추출
function GET_ILLUSTDATA() {

    // ▶ SAP 기본 일러스트 메세지 타입
    let LS_ILLUSTMSG = sap.m.IllustratedMessageType;           

    let LT_GRIDMSG = [],
        LT_TABLEMSG = [];

    if(JSON.stringify(LS_ILLUSTMSG) === '{}') {
        // return; // [추후] 알림 메세지 작업
    };

    for(var i in LS_ILLUSTMSG) {

        let LS_MSG  = {},
            LS_TMSG = {};

        // 안나오는 메세지 예외처리
        if(LS_ILLUSTMSG[i] === 'sapIllus-SimpleNotFoundMagnifier' || LS_ILLUSTMSG[i] === "sapIllus-EmptyPlanningCalendar"){
            continue;
        };

        LS_MSG.NAME     = LS_ILLUSTMSG[i];

        LS_MSG.TYPE     = i;

        LS_MSG.SIZE     = "Spot";

        LS_MSG.VALUE    = 0;

        LS_TMSG.NAME    = LS_ILLUSTMSG[i];

        LS_TMSG.TYPE    = i;

        LS_TMSG.VALUE    = 0;

        LT_GRIDMSG.push(LS_MSG);
        LT_TABLEMSG.push(LS_TMSG);

    };

    // ▶ TNT 일러스트 타입 추출
    let LV_TNTILLUSURL  = sap.ui.require.toUrl("sap/tnt/themes/base/illustrations/metadata.json"),
    LS_TNTILLUSJSON = jQuery.sap.syncGetJSON(LV_TNTILLUSURL);

    if(!LS_TNTILLUSJSON.success){
        // [추후] 알림 메세지 작업
        // return;
    };

    // ▶ 기본 일러스트 메세지와 tnt 둘 다 없을 때
    if(JSON.stringify(LS_ILLUSTMSG) === '{}' && !LS_TNTILLUSJSON.success){
        return;
    };

    let LS_TNTDATA = LS_TNTILLUSJSON.data.symbols;

    for(var i in LS_TNTDATA) {

        let LS_MSG      = {};

        LS_MSG.NAME     = "tnt-" + LS_TNTDATA[i];

        LS_MSG.TYPE     = LS_TNTDATA[i];

        LS_MSG.VALUE    = 0;

        LS_MSG.SIZE     = "Spot";

        LT_GRIDMSG.push(LS_MSG);
        LT_TABLEMSG.push(LS_MSG);

    }; 

    GET_FAVORITE(LT_GRIDMSG);

    // debugger;
    let msgModle = new sap.ui.model.json.JSONModel();

    msgModle.setData({
        DEFAULT : LT_GRIDMSG,
        TABLE   : LT_TABLEMSG
    },true);

    
    let LO_SAPICON = sap.ui.getCore().byId("topApp");               // ▶ SAP 아이콘 페이지
    
    LO_SAPICON.setModel(msgModle);                                  // ▶ SAP 아이콘 페이지에 모델 세팅
};

// ▶ [펑션] 일러스트 메세지 사이즈 세팅
oAPP.FN.SETTING_SIZE = (SELSIZE) => {

    let LO_SAPICON  = sap.ui.getCore().byId("topApp"),               // ▶ SAP 아이콘 페이지
        LS_BINDDATA = LO_SAPICON.getModel().oData,
        LO_GRIDBOX  = sap.ui.getCore().byId('gridBox');

    for(var i = 0; i < LS_BINDDATA.DEFAULT.length; i++) {

        switch(SELSIZE) {
            case "Scene":

                LS_BINDDATA.DEFAULT[i].SIZE = SELSIZE;
    
                LO_GRIDBOX.getCustomLayout().setBoxWidth('22rem');
    
            break;
    
            case "Auto":

                LS_BINDDATA.DEFAULT[i].SIZE = "Spot";
    
                LO_GRIDBOX.getCustomLayout().setBoxWidth('17rem');
    
            break;
    
            case "Spot":

                LS_BINDDATA.DEFAULT[i].SIZE = SELSIZE;
    
                LO_GRIDBOX.getCustomLayout().setBoxWidth('17rem');
    
            break;
    
            case "Dialog":
    
                // let LV_NOSVGIDX = LS_BINDDATA.DEFAULT.findIndex(a => a.NAME === "sapIllus-EmptyPlanningCalendar");
    
                // if(LV_NOSVGIDX !== -1) {
    
                //     LS_BINDDATA.DEFAULT.splice(LV_NOSVGIDX,1);
    
                // };
    
                LS_BINDDATA.DEFAULT[i].SIZE = SELSIZE;
    
                LO_GRIDBOX.getCustomLayout().setBoxWidth('19rem');
    
            break;
    
            default:
    
                console.error(`${SELSIZE} 에러`);
    
            break;
    
        };

    };  

    LO_SAPICON.getModel().refresh();

};

// ▶ [펑션] 테마 세팅
oAPP.FN.SETTING_THEME = () => {

    if(oAPP.FRAMETHEME) {

        oAPP.THEME = oAPP.FRAMETHEME;

    };

    sap.ui.getCore().applyTheme(oAPP.THEME);                                // ▶ 현재 적용 테마 세팅

};

// ▶ [펑션] 선택된 탭에 맞게 컨텐트 변경
function CHANGE_CONTENT(){

    let LO_NAVCONT      = sap.ui.getCore().byId('iconNavCont'),
        LO_GRIDPAGE     = sap.ui.getCore().byId('GRID'),
        LO_DETAILPAGE   = sap.ui.getCore().byId('DETAILS');

    switch(oAPP.TABKEY) {
        case 'DETAILS':

            LO_NAVCONT.addPage(LO_DETAILPAGE).addPage(LO_GRIDPAGE);

        break;

        case 'GRID':

            LO_NAVCONT.addPage(LO_GRIDPAGE).addPage(LO_DETAILPAGE);

        break;

        default:
            console.error("select_tab 펑션 오류");
        break;
    };

};

// ▶ [펑션] 네비컨테이너 네비게이션 이후
// function SETTING_NAVPAGE(e) {

//     // debugger;

//     let LV_FROM   = e.getParameter('from'),
//         LV_TO     = e.getParameter('to');

//         // LV_FROM.setVisible(false);
//         // LV_TO.setVisible(true);

//     if(LV_TO.sId === "DETAILS") {

//         let LS_GRIDBINDITEM = oAPP.UI.LO_GRIDBOX.getBinding("items");
            
//         LS_GRIDBINDITEM.filter();

//     };


// };

// ▶ [펑션] 복사 & 붙여넣기
function CLICK_COPYBTN(event) {

    let LV_CPNAME = event.getSource().getBindingContext().getProperty().NAME;           // ▶ 클릭한 버튼의 일러스트 메세지 타입
    
    oAPP.remote.clipboard.writeText(LV_CPNAME);                                     // ▶ 선택한 메세지 타입 복사

    sap.m.MessageToast.show(oAPP.ICON_MSG.M001, { //"복사 되었습니다."
        duration: 1000,
        animationDuration: 500,
    });

};

// ▶ [펑션] 즐겨찾기 클릭
// function CLICK_FAVORITE(e) {

//     // debugger;

//     let LS_ICON         = e.getSource(),
//         LS_ICONCONTEXT  = LS_ICON.getBindingContext(),
//         LS_ICONPROP     = LS_ICONCONTEXT.getProperty(),
//         LS_BINMODEL     = oAPP.UI.LO_GRIDBOX.getModel();

//     let worker = new Worker("JS/worker.js");    // ▶ worker 실행 준비

//     switch(e.getParameter("value")) {
//         case 0:

//             LS_ICONPROP.VALUE  = 0;

//         break;

//         case 1:

//             LS_ICONPROP.VALUE  = 1;

//         break;

//         default:
//             console.error(LS_ICONPROP.VALUE + "error");
//         break;
//     };

//     let LV_CHECK = oAPP.CHECK.getSelected();

//     if(LV_CHECK){

//         LS_BINMODEL.refresh();

//     };

//     let aIconData = LS_BINMODEL.getProperty("/DEFAULT");

//     var S_DATA = [
//         {PRCCD:"01", DATA:aIconData}
//     ];

//     worker.onmessage = (e) => {

//         // debugger;
//         for(var i = 0; i < e.data.length; i++){
//             console.log(e.data[i]);

//             switch(e.data[i].PRCCD){
//                 case "01":

//                     console.log("01번 응답");

//                 break;

//                 default:

//                 break;
//             }

//         };

//         worker.terminate();
//         worker = undefined;

//     };

//     worker.postMessage(S_DATA);

// };

// ▶ [펑션] 즐겨찾기 정보 추출
function GET_FAVORITE(GRIDMSG) {

    // ▶ 폴더 존재 여부 체크
    let LV_FILEFIND = oAPP.fs.existsSync(LV_SAVEFOLDER);

    if(!LV_FILEFIND) {
        return;
    };

    // ▶ 즐겨찾기 파일 체크
    let LV_TREE = oAPP.remote.require("directory-tree"),
        LO_TREE = LV_TREE(LV_SAVEFOLDER, {attributes:['mode', 'type']});

    // ▶ 선택한 폴더안에 파일이 존재하지 않을 때
    if(LO_TREE.children.length === 0) {

        return;

    };

    // ▶ 즐겨찾기 파일 추출
    let LV_FAVORITEJSON = oAPP.fs.readFileSync(LV_SAVEPATH , 'utf8'),
        LS_FAVORITEJSON = JSON.parse(LV_FAVORITEJSON);

        SETTING_FAVORITE(LS_FAVORITEJSON, GRIDMSG);
    
};

// ▶ [펑션] 즐겨찾기 정보 세팅
function SETTING_FAVORITE(FAVORITELIST, GRIDMSG) {

    for(var i = 0; i < GRIDMSG.length; i++) {

        for(var idx = 0; idx < FAVORITELIST.length; idx++) {

            if(GRIDMSG[i].NAME === FAVORITELIST[idx].NAME) {

                GRIDMSG[i].VALUE = 1;

            };
            
        };

    };

};

// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ UI생성 후 ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣
function fn_UIUPdated() {

    oAPP.attr._oRendering.detachUIUpdated(fn_UIUPdated);

    delete oAPP.attr._oRendering;

    // sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    GET_ILLUSTDATA();                                                       // ▶ SAP 기본 IllustratedMessage TYPE 추출

    oAPP.FN.SETTING_THEME();                                                // ▶ 테마 세팅

    oAPP.FRAMETHEME = oAPP.THEME;

    oAPP.UI.NAVCONT         = sap.ui.getCore().byId('iconNavCont');         // ▶ ID => iconNavCont인 네비 컨테이너

    CHANGE_CONTENT();                                                       // ▶ 활성화 탭에 맞게 컨텐트 변경

    // oAPP.UI.NAVCONT.attachAfterNavigate(SETTING_NAVPAGE);                   // ▶ 네비게이션 이후 펑션

    frameContent = document.getElementById('loadsection');

    frameContent.style.opacity = 0;

    setTimeout(() => {

        frameContent.style.display = "none";

    },2000);

};


// ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣ UI생성 ▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣
function createUi() {

    // sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    oAPP.attr._oRendering = sap.ui.requireSync('sap/ui/core/Rendering');    
    oAPP.attr._oRendering.attachUIUpdated(fn_UIUPdated);

    jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

    jQuery.sap.require("sap.m.IllustratedMessage");
    sap.m.IllustratedMessage.prototype._updateInternalIllustrationSetAndType = function (sValue) {

        if(!sValue){

            this._sIllustrationSet = "";
            this._sIllustrationType = "";

            return;
        }

		var aValues = sValue.split("-");

		this._sIllustrationSet = aValues[0];
		this._sIllustrationType = aValues[1];
        
	};

    let LO_APP = new sap.m.App('topApp',);                               // ▶ App 생성

    let LO_FPAGE = new sap.m.Page('sapPage',{                   // ▶ Page 생성
        showHeader:false,
        enableScrolling: true
    });

    // ▶ 내비 컨데이너 생성
    let LO_NAVCONT = new sap.m.NavContainer('iconNavCont',{
        height: '100%',
        autoFocus: false,
        busyIndicatorDelay: 0
    });   

    // ▶ 그리드 페이지
    let LO_GRIDPAGE = new sap.m.Page('GRID',{
        showHeader: false,
        busyIndicatorDelay: 0
    });

    // ▶ UI TABLE 페이지
    let LO_UITABLEPAGE = new sap.m.Page('DETAILS',{
        showHeader: false,
        busyIndicatorDelay: 0
    });

    oAPP.UI.LO_GRIDBOX = new sap.f.GridList('gridBox',{
        growing: true,
        growingScrollToLoad: false,
        growingThreshold: 200,
        // showNoData: false,
        customLayout: new sap.ui.layout.cssgrid.GridBoxLayout({
            boxWidth: "17rem",            
        }),
        items : {
            path: '/DEFAULT',
            template: new sap.f.GridListItem({
                content: [
                    new sap.m.VBox({
                        width: "100%",
                        height: "100%",
                        renderType: "Bare",
                        justifyContent: "SpaceBetween",
                        items: [
                            new sap.m.HBox({
                                width: '100%',
                                height: '40px',
                                wrap: "Wrap",
                                alignItems: "Center",
                                justifyContent: "Center",
                                renderType: "Bare",
                                items: [
                                    new sap.m.Title({
                                        width: "90%",
                                        textAlign: "Center",
                                        text: "{NAME}"
                                    })
                                ]
                            }),
                            new sap.m.HBox({
                                renderType: "Bare",                                
                                items: [
                                    new sap.m.IllustratedMessage({
                                        illustrationType: '{NAME}',
                                        title: ' ',
                                        description: '{TYPE}',
                                        illustrationSize: "{SIZE}"
                                    }).addStyleClass("u4aSWIllustMSG"),
                                ]
                            }),
                            new sap.m.HBox({
                                width: "100%",
                                height: "50px",
                                justifyContent: "Center",
                                alignItems: "Center",
                                items: [
                                    // new sap.m.RatingIndicator('fav',{
                                    //     maxValue: 1,
                                    //     visualMode: "Full",
                                    //     change: function(e) {
                                    //         CLICK_FAVORITE(e);
                                    //     }
                                    // }),
                                    new sap.m.Button({
                                        icon: "sap-icon://copy",
                                        tooltip: oAPP.ICON_MSG.M008, //"Copy"
                                        press: function(e){
                                            CLICK_COPYBTN(e);
                                        }
                                    }).addStyleClass("sapUiTinyMarginBegin")
                                ]
                            })
                        ],
                    })
                ],
                tooltip: "{NAME}"
            }).addEventDelegate({
                onAfterRendering : function(oEvent){

                    // let oItem       = oEvent.srcControl,                                // ▶ 현재 그려진 UI 오브젝트
                    //     oItemVal    = oItem.getBindingContext().getProperty().VALUE,    // ▶ 해당 UI의 바인딩 VALUE 값
                    //     oItemDOM    = oItem.getDomRef();                                // ▶ 해당 UI의 돔

                    // if(oItemVal === 1) {
                
                    //     let oItemDId    = oItemDOM.id;
                
                    //     let LT_SPLIT    = oItemDId.split("-");
                
                    //     let LV_CLONE    = LT_SPLIT[LT_SPLIT.length - 1];
                
                    //     let LO_FAVBTN   = sap.ui.getCore().byId(`fav-${LV_CLONE}`);
                
                    //     LO_FAVBTN.setValue(1);

                    // };

                }
            })
        }
    }).addEventDelegate({
        onAfterRendering: function(){
            oAPP.UI.LO_DETAILBOX.setVisible(false);
            oAPP.TABBAR.setBusy(false);
        }
    }).addStyleClass("sapUiContentPadding");

    // ▶ UI 테이블 생성
    oAPP.UI.LO_DETAILBOX = new sap.ui.table.Table('detailBox',{
        rowHeight: 200,
        selectionMode: 'Single',
        selectionBehavior: 'RowOnly',
        visibleRowCountMode: 'Auto',
        minAutoRowCount: 1,
        columnHeaderHeight: 50,
        // visible: false,
        rows: {
            path: '/TABLE'
        },
        columns: [
            new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: oAPP.ICON_MSG.M009, //"IllustratedMessage"
                    textAlign: "Center",
                    width: '100%'
                }),
                template: new sap.m.HBox({
                    width: "100%",
                    height: "100%",
                    fitContainer: true,
                    justifyContent: "Start",
                    items: [
                        new sap.m.HBox({
                            width: "20%",
                            height: "200px",
                            renderType: "Bare",
                            justifyContent: "Center",
                            alignItems: "End",
                            items: [
                                new sap.m.IllustratedMessage({
                                    enableVerticalResponsiveness: true,
                                    illustrationType: '{NAME}',
                                    title: '{TYPE}',
                                    description: ' ',
                                    illustrationSize: "Spot"
                                })
                            ],
                            layoutData: new sap.m.FlexItemData({
                                minWidth: "250px"
                            })
                        }).addStyleClass("u4aSWHboxNoPadding"),
                        new sap.m.HBox({
                            width: "70%",
                            height: "200px",
                            renderType: "Bare",
                            wrap: "Wrap",
                            alignItems: "Center",
                            justifyContent: "SpaceBetween",
                            items: [
                                new sap.m.HBox({
                                    width: "330px",
                                    alignItems: "Center",
                                    items: [
                                        new sap.m.Label({
                                            text: oAPP.ICON_MSG.M010 + " :", //"illustrationType"
                                            width: "120px"
                                        }),
                                        new sap.m.Text({
                                            text: '{NAME}'
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBegin"),
                                new sap.m.HBox({
                                    width: "280px",
                                    alignItems: "Center",
                                    items: [
                                        new sap.m.Label({
                                            text: oAPP.ICON_MSG.M011 + " :", //"title"
                                            width: "50px"
                                        }),
                                        new sap.m.Text({
                                            text: '{TYPE}'
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBegin"),
                                new sap.m.HBox({
                                    width: "270px",
                                    alignItems: "Center",
                                    items: [
                                        new sap.m.Label({
                                            text: oAPP.ICON_MSG.M012 + " :", //"illustrationSize"
                                            width: "120px"
                                        }),
                                        new sap.m.Text({
                                            text: 'Spot'
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBegin"),
                                new sap.m.HBox({
                                    width: "45px",
                                    alignItems: "Center",
                                    justifyContent: "Center",
                                    items: [
                                        new sap.m.Button({
                                            width: "45px",
                                            icon: "sap-icon://copy",
                                            tooltip: oAPP.ICON_MSG.M008, //"Copy"
                                            press: function(e) {
                                                CLICK_COPYBTN(e);
                                            }
                                        }).addStyleClass("u4aSWCopyBtn")
                                    ]
                                }).addStyleClass("sapUiSmallMarginBegin")
                            ]
                        })
                    ]
                })
            })
        ]
    }).addEventDelegate({
        onAfterRendering: function(){
            // debugger;
            // oAPP.UI.LO_GRIDBOX.setVisible(false);
            oAPP.TABBAR.setBusy(false);
        }
    });

    LO_UITABLEPAGE.addContent(oAPP.UI.LO_DETAILBOX);
    LO_GRIDPAGE.addContent(oAPP.UI.LO_GRIDBOX);
    LO_FPAGE.addContent(LO_NAVCONT);                            // ▶ 페이지에 VBox 컨텐트 추가
    LO_APP.addPage(LO_FPAGE);                                   // ▶ App에 페이지 생성
    LO_APP.placeAt("content");                                  // ▶ App 생성

};