// ***********************************************************************************************
// 전역 변수 설명 ********************************************************************************
// ***********************************************************************************************
// oAPP = > electrion api 리소스 할당
// oBEFORESIZE => 플로팅 메뉴의 이전 사이즈
// GLV_DATA => UI나 function등 정보를 담을 전역 변수
// GLV_DATA.UI = {};            => 전체 UI 객체
// GLV_DATA.FN = {};            => 펑션 객체
// GLV_DATA.INFO = {};          => 
// GLV_DATA.T_MENUDATA = [];    =>
// GLV_DATA.DATA = {};          =>

// ***********************************************************************************************
// 전역 변수 *************************************************************************************
// ***********************************************************************************************

let oAPP,
    oBEFORESIZE,
    GLV_DATA = {},
    GLV_SIZEINFO = {};

GLV_DATA.UI = {};
GLV_DATA.FN = {};
GLV_DATA.INFO = {};
GLV_DATA.T_MENUDATA = [];
GLV_DATA.DATA = {};
GLV_DATA.DB_CLICK = null;
GLV_DATA.DBV_CLICK = null;

// ***********************************************************************************************
// [시작] 메인 플로우  *****************************************************************
// ***********************************************************************************************

    //electron api 리소스 할당
    oAPP = parent.gfn_parent();

    // 생성된 윈도우 창
    oAPP.WIN = oAPP.remote.getCurrentWindow();
    
    //초기 Data 설정 !!!
    gfn_initData();

    //UI 생성 시작!!
    createUi();

// ***********************************************************************************************
// [종료] 메인 플로우 *****************************************************************
// ***********************************************************************************************

// [수정] 여기 다시!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ***********************************************************************************************
// 초기 Data 펑션!!!!!!! *****************************************************************
// ***********************************************************************************************
function gfn_initData() {

    GLV_DATA.T_MENUDATA.__DEFULT_MENU = [
        {
            menu_icon:     'sap-icon://favorite-list',   // 메뉴 버튼 아이콘
            sysid:         '',                           // 시스템 아이디
            key:           'favorite_list',              // 라인키 
            title:         '개인화',                     // 해더에 보여질 타이틀
            desc:          '개인화',                     // 디스크립션
            view_fld_path: 'views/BASE',                 // 뷰스 폴더 패스
            tabid: ''                                    // 탭 아이디
        }
    ]
};

// ***********************************************************************************************
// 내부 사용 펑션!!!!!!! *****************************************************************
// ***********************************************************************************************

// '스플리트 바' 로 리사이징 펑션
GLV_DATA.FN.SPLITTBAR_DOWN = () => {
    /*  oVertDom => 가장 밖의 세로 스플리터 돔
        oVertRect => 가장 밖의 세로 스플리터의 rect정보
        oHorizDom => 가장 밖의 가로 스플리터 돔
        oHorizOB => 가장 밖의 가로 스플리터의 바
        oHorizOvB => 가장 밖의 가로 스플리터의 오버 바 */

    let oVertDom = GLV_DATA.UI.SPLITTER2.getDomRef(),
        oVertRect = oVertDom.children[2].getBoundingClientRect(),
        oHorizDom = GLV_DATA.UI.SPLITTER.getDomRef(),
        oHorizOB = oHorizDom.children[1],
        oHorizOvB = oHorizDom.children[3];

    const anime = setInterval(() => {
        let oVertMRect = oVertDom.children[2].getBoundingClientRect(),
            oVertMHt = oVertDom.children[2].offsetHeight;


        if (GLV_DATA.INFO.pos != oVertRect.y) {

            oHorizOB.style.height = (oVertMHt + 32) + 'px';
            oHorizOB.style.top = (oVertMRect.y - 16) + 'px';
            oHorizOvB.style.height = (oVertMHt + 32) + 'px';
            oHorizOvB.style.top = (oVertMRect.y - 16) + 'px';

        };

        return;
        
    }, 10);
};


// '스플리트 바' 리사이징을 위한 마우스 무브 펑션
GLV_DATA.FN.MOUSEMOVING = (e) => {

    let oTPageLD = GLV_DATA.UI.PAGE4.getLayoutData(),
        oMPageLD = GLV_DATA.UI.PAGE5.getLayoutData(),
        oBPageLD = GLV_DATA.UI.PAGE6.getLayoutData();

    if(GLV_DATA.DBV_CLICK !== 'expanded') {

        GLV_SIZEINFO.TOPSIZE = oTPageLD.getSize();
        GLV_SIZEINFO.MIDSIZE = oMPageLD.getSize();
        GLV_SIZEINFO.BOTSIZE = oBPageLD.getSize();

    };

    /* oMouseY => 마우스 y좌표 */
    let oMouseY = e.clientY;
    
    GLV_DATA.INFO.pos = oMouseY;

};

// 플로팅 메뉴의 우측 최하단 숨김 또는 보임 토글 펑션
GLV_DATA.FN.SHOWTOGGLEBTN = (e) => {
    /* oFloatLD => 결과적으로 보여지는 오른쪽의 플로팅 메뉴의 레이아웃 데이터
       oFloatVertLD => 플로팅 메뉴의 오른쪽 전체 영역 레이아웃 데이터 
       oVertDom => 가장 밖의 세로 스플리터 돔 */

    let oFloatLD = GLV_DATA.UI.PAGE3.getLayoutData(),
        oFloatVertLD = GLV_DATA.UI.PAGE5.getLayoutData(),
        oVertDom = GLV_DATA.UI.SPLITTER2.getDomRef();

    // 버튼에 rotate클래스가 없다면 rotate클래스 추가
    if (e.getSource().hasStyleClass('rotate') === false) {

        oBEFORESIZE = oFloatLD.getSize();
        e.getSource().addStyleClass('rotate');
        oVertDom.style.top = '100%';
        oFloatVertLD.setResizable(false);
        oFloatLD.setSize('100px');
        oFloatLD.setResizable(false);

        return;

    };

    // 버튼에 rotate클래스가 있다면 rotate클래스 제거
    oVertDom.style.top = '0';
    oFloatVertLD.setResizable(true);
    oFloatLD.setSize(oBEFORESIZE);
    GLV_DATA.UI.BUTTON.removeStyleClass('rotate');
    
    GLV_DATA.FN.SPLITTBAR_DOWN();
    
    setTimeout(() => {
        
        oFloatLD.setResizable(true);

    }, 100);
};

// 플로팅 메뉴의 우측 하단 서버 버튼 활성화 펑션
GLV_DATA.FN.SERVER_ACTIVE = (e) => {

    /* eKey => 시스템 아이디
       oServVBox => 우측 하단 서버 영역 VBox UI
       oServBtns => 서버 버튼 UI 리스트
       oContTitle => 메인 컨텐트 영역 상단 타이틀
       oContVS => 메인 컨텐트 NODATA영역 WS 버전 */

    // let eKey,
    let eKey = e.getSource().getText(),
        SVBTNITM = oAPP.UI.SVBTN.getItems(),
        oServVBox = GLV_DATA.UI.PAGE10.getContent()[0],
        oServBtns = oServVBox.getItems(),
        oContTitle = sap.ui.getCore().byId('wsy_svTxt'),
        oContVS = sap.ui.getCore().byId('ws_versionTitle');

    // 우측 하단 서버 버튼 활성화 체크
    if (e.getSource().hasStyleClass('sevActive') === false) {

        for (var i = 0; i < oServBtns.length; i++) {

            if (oServBtns[i].hasStyleClass('sevActive')) {

                oServBtns[i].removeStyleClass('sevActive');

            };

        };

        e.getSource().addStyleClass('sevActive');

        oContTitle.setText(eKey);
        // 메인 컨텐트 영역 모든 컨텐트 삭제
        GLV_DATA.UI.PAGE7.removeAllContent();

        // 메인 컨텐트 영역에 NODATA영역 삽입
        GLV_DATA.UI.PAGE7.addContent(GLV_DATA.UI.NODATA);

        // 메인 컨텐트 영역의 서브 해더 show 속성 true
        GLV_DATA.UI.PAGE7.setShowSubHeader(true);



        // 우측 상단 서버별 기본 메뉴 구성 펑션
        GLV_DATA.FN.DEFAULT_MENU(eKey);
        // 우측 하단 서버 버튼별 개인화 영역 업데이트
        GLV_DATA.FN.SERVER_ITEM_ZONE(eKey);

    };


    oContVS.setText(eKey);

};

// 우측 하단 서버 버튼 클릭 시 개인화 영역 업데이트
GLV_DATA.FN.SERVER_ITEM_ZONE = (eKey) => {

    let oJsonModel = new sap.ui.model.json.JSONModel();

    oJsonModel.setData({

        eKey: GLV_DATA.T_MENUDATA[`${eKey}`]

    });

    GLV_DATA.UI.PAGE9.setModel(oJsonModel);

    let ePath = `/eKey`;
    
    // GLV_DATA.UI.PAGE9.removeContent(GLV_DATA.UI.PRGBT);

    GLV_DATA.UI.PRGBT = new sap.m.Page({
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        content: {
            path: ePath,
            template: new sap.m.Button({
                width: '100%',
                type: sap.m.ButtonType.Transparent,
                icon: '{menu_icon}',
                tooltip: '{desc}',
                // customData: new sap.ui.core.CustomData({
                //     key: '{key}'
                // }),
                press: function(e) {
                    GLV_DATA.FN.SERVERITEM_BUTTON_CLICK(e);
                }
            }).addStyleClass('prgbtn')
        }
    }).addStyleClass('program_btn_page');

    // 우측 상단 영역 생성 버튼 삽입
    GLV_DATA.UI.PAGE9.addContent(GLV_DATA.UI.PRGBT);

    // 메인 컨텐트 영역에 NODATA영역 삽입
    GLV_DATA.UI.PAGE7.addContent(GLV_DATA.UI.NODATA);

    // 우측 상단 기본 메뉴 버튼 커스텀 데이터 value 세팅 펑션
    // GLV_DATA.FN.DEFAULT_MENU_CUSTOMDATA(eKey);

};

// 우측 상단 개인화 영역의 버튼 클릭 펑션
GLV_DATA.FN.SERVERITEM_BUTTON_CLICK = (e) => {
    
    /*  eKey => 우측 상단 영역의 클릭한 버튼에 커스텀데이터 value
        oServItmBtns => 우측 상단 영역 버튼 */

    // 변수 명 바꿔야 함!!!!!!!!!!!!!!!!!!! 지금은 테스트로 그냥 지정
    let oMainContCD = GLV_DATA.UI.PAGE7.getContent()[0].getModel();
    
    // 우측 상단 서버별 버튼 활성화 체크
    if (e.getSource().hasStyleClass('active') === false) {

        let oBtn = e.getSource(),
            oBtnCtxt = oBtn.getBindingContext(),
            eKey = oBtnCtxt.getProperty(),
            prg_btn = GLV_DATA.UI.PRGBT;

            if(prg_btn) {
                oServItmBtns = prg_btn.getContent();

                for (var i = 0; i < oServItmBtns.length; i++) {

                    if (oServItmBtns[i].hasStyleClass('active')) {
            
                        oServItmBtns[i].removeStyleClass('active');
        
                    };
        
                };
            };
            // oServItmBtns = GLV_DATA.UI.PRGBT.getContent();

        e.getSource().addStyleClass('active');

        

        // 이 부분 순서 다시 고려
        if(oMainContCD !== undefined) {
            
            // 이미 활성화가 되어있다면 그려져있는 개인화 페이지를 삭제해라
            GLV_DATA.UI.PAGE7.getContent()[0].getContent()[0].removeAllPages();
        };

        // 우측 상단 개인화 영역 버튼 클릭 시 컨텐트 삽입 펑션
        GLV_DATA.FN.MAIN_PUSH_CONTENT(eKey);

        return;
    };
};

// 우측 상단 개인화 영역 버튼 클릭 시 컨텐트 삽입 펑션
GLV_DATA.FN.MAIN_PUSH_CONTENT = (eKey, RECALLID) => {
   
    /* eKey.key => favorite_list, newly_list, total_list => key의 이름으로 명해진 모듈 js*/

    // oFn[eKey.key]가 없으면 ┓
    if(typeof GLV_DATA.FN[eKey.key] === "undefined"){
        var Lpath = oAPP.path.join(oAPP.__dirname, `${eKey.view_fld_path}/${eKey.key}.js`);

        jQuery.getScript(Lpath,function(){
            GLV_DATA.FN[eKey.key](oAPP, oAPP.remote, GLV_DATA.UI.PAGE7, eKey);
        });

        return;

    };

    // oFn[eKey.key]가 있으면 ┓
    GLV_DATA.FN[eKey.key](oAPP, oAPP.remote, GLV_DATA.UI.PAGE7, eKey);  

};


// 플로팅 메뉴의 정보 팝업 펑션 => 여기 부분은 나중에 고려
GLV_DATA.FN.FLOAT_INFO_POPUP = () => {
    let actBt = document.querySelector('.sevActive'),
        userKey = '',
        serverId = '',
        client = '',
        language = '',
        wsVersion = '',
        host = '';

    if (actBt) {
        sysId = actBt.innerText;
    };

    for (var i = 0; i < oAPP.INFO.length; i++) {
        if (oAPP.INFO[i].sevId === sysId) {
            userKey = oAPP.INFO[i].user;
            serverId = oAPP.INFO[i].sevId;
            client = oAPP.INFO[i].client;
            language = oAPP.INFO[i].language;
            wsVersion = oAPP.INFO[i].wsVersion;
            host = oAPP.INFO[i].host;
        }
    };

    GLV_DATA.UI.POPOVER = new sap.m.ResponsivePopover({
        contentWidth: '250px',
        contentHeight: '230px',
        placement: sap.m.PlacementType.Auto,
        verticalScrolling: false,
        title: 'System Information',
        content: new sap.m.VBox({
            width: '100%',
            height: '100%',
            alignItems: sap.m.FlexAlignItems.Center,
            justifyContent: sap.m.FlexJustifyContent.Center,
            renderType: sap.m.FlexRendertype.Bare,
            items: [
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'Version',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${wsVersion}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'USER',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${userKey}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'System ID',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${serverId}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'Client',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${client}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'Language',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${language}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
                new sap.m.HBox({
                    width: '80%',
                    renderType: sap.m.FlexRendertype.Bare,
                    items: [
                        new sap.m.Text({
                            text: 'Host',
                            width: '65px'
                        }).addStyleClass('sapUiTinyMarginEnd'),
                        new sap.m.Text({
                            text: `: ${host}`
                        }),
                    ]
                }).addStyleClass('sapUiTinyMarginTopBottom'),
            ]
        })
    });
    GLV_DATA.UI.POPOVER.openBy(wsy_userInfo);
};

// 플로팅 메뉴 도움말 팝오버 펑션 => 여기 부분은 나중에 고려
GLV_DATA.FN.FLOAT_HELP_POPUP = (eKey) => {
    if(typeof GLV_DATA.FN[eKey] === 'undefined'){
        var Lpath = oAPP.path.join(oAPP.__dirname, `layout/${eKey}.js`);

        jQuery.getScript(Lpath,function(){
            GLV_DATA.FN[eKey](oAPP.remote);
        });

        return;
    };

    GLV_DATA.FN[eKey](oAPP.remote);
};

// 플로팅 메뉴 도움말 닫기 버튼 => 여기 부분은 나중에 고려
GLV_DATA.FN.FLOAT_HELP_POPUP_CLOSE = () => {
    let HELPOVERLAY = document.getElementById('help_content');

    HELPOVERLAY.style.display = 'none';
};


// 드래그앤드 펑션
GLV_DATA.FN.DRAGEND = () => {

    console.log('end');
    // debugger;
    //사용자 마지막 마우스 위치(x,y)
    var LS_POS = oAPP.remote.screen.getCursorScreenPoint();

    //현재 윈도우 위치 정보 추출 
    var oWIN    = oAPP.remote.getCurrentWindow();
    var oBounds = oWIN.getBounds();

        //마우스 위치 정보에 해당하는 모니터 디스플레이 위치 정보 얻기
        oBounds.x = LS_POS.x;
        oBounds.y = LS_POS.y;

    var oDisp = oAPP.remote.screen.getDisplayNearestPoint(oBounds);

    //변경된 위치로 윈도우 창 이동 
    oBounds.x      = oDisp.bounds.x;
    oBounds.y      = oDisp.bounds.y;
    oBounds.width  = oDisp.bounds.width;
    oBounds.height = oDisp.bounds.height;

    oWIN.setBounds(oBounds);

    setTimeout(()=>{

        oBounds.height = screen.availHeight;
        oBounds.width = screen.availWidth;
        oWIN.setBounds(oBounds);
        document.body.style.opacity = "1";
        //oWIN.setOpacity(1);
        
    }, 0);

};

// 드래그스타트 펑션
GLV_DATA.FN.START = () => {
    // debugger;
    console.log('start');
    document.body.style.opacity = "0.1";

};

// ***********************************************************************************************
// 외부로부터 받는 펑션!!!!!!! *****************************************************************
// ***********************************************************************************************

// 3.0으로부터 신호를 받을 때 플로팅 메뉴가 숨겨져 있는지 여부 체크 펑션
// 숨겨져 있다면 보여주고 해당 컨텐트로 이동
GLV_DATA.FN.CALL_FLOAT_TOGGLE = (RECALLID) => {
    /* oFloatLD => 결과적으로 보여지는 오른쪽의 플로팅 메뉴의 레이아웃 데이터
       oFloatVertLD => 플로팅 메뉴의 오른쪽 전체 영역 레이아웃 데이터 
       oVertDom => 가장 밖의 세로 스플리터 돔 
       oRotatBtn => 클래스 rotate가 있는 버튼 */

    let oFloatLD = GLV_DATA.UI.PAGE3.getLayoutData(),
        oFloatVertLD = GLV_DATA.UI.PAGE5.getLayoutData(),
        oRotatBtn = document.querySelector('.rotate'),
        oVertDom = GLV_DATA.UI.SPLITTER2.getDomRef();

    // 여기서 분기 처리 => 플로팅이 보이는지 OR 숨겨져있는지
    // 플로팅 메뉴가 펼쳐져 있는 상태
    if(!oRotatBtn) {
        // 신호 받은 탭 영역으로 이동하는 펑션
        GLV_DATA.FN.MOVE_TAB_CONTENT(RECALLID);

    } else {
        // 플로팅 메뉴가 접혀져 있는 상태
        oVertDom.style.top = '0';
        oFloatVertLD.setResizable(true);
        oFloatLD.setSize(oBEFORESIZE);
        GLV_DATA.UI.BUTTON.removeStyleClass('rotate');

        GLV_DATA.FN.SPLITTBAR_DOWN();
        
        setTimeout(() => {
            
            oFloatLD.setResizable(true);

        }, 100);

        // 신호 받은 탭 영역으로 이동하는 펑션
        GLV_DATA.FN.MOVE_TAB_CONTENT(RECALLID);

    };
};

// 받아온 신호 값에 맞게 탭 이동하는 펑션
GLV_DATA.FN.MOVE_TAB_CONTENT = (RECALLID) => {
    // debugger;
     /*  oServItmBtns => 우측 상단 영역 버튼
         eKey => 우측 상단 영역의 클릭한 버튼에 커스텀데이터 value */

    let oServItmBtns = GLV_DATA.UI.PRGBT.getContent();

    // 개인화 버튼 활성화 시키고 컨텐트 삽입 펑션
    for(var i = 0; i < oServItmBtns.length; i++) {

        oServItmBtns[i].removeStyleClass('active');

        // 여기 부분 수정 !!!!!!!!!!!!!!!!!!!!!!!!!!!!! 꼭 봐!!!!!!!!!!!!!!
        if(oServItmBtns[i].getTooltip() === '개인화') {
            // debugger;

            oServItmBtns[i].addStyleClass('active');
            let eKey = oServItmBtns[0].getModel().oData.eKey[0],
                aaa = document.querySelector('.perstab_bar');

                // console.log(aaa);
            
            // 우측 상단 개인화 영역 버튼 클릭 시 컨텐트 삽입 펑션
            GLV_DATA.FN.MAIN_PUSH_CONTENT(eKey, RECALLID);

        };
    };
};

GLV_DATA.FN.TAB_SELECT = () => {
    // debugger;
    let oITBAR = GLV_DATA.UI.PAGE7.getContent()[0],
        SELECTKEY = oITBAR.getSelectedKey(),
        oITCONT = oITBAR.getContent()[0],
        oITPAGES = oITCONT.getPages(),
        oITSLPG;
        // SVTEXT = sap.ui.getCore().byId('wsy_svTxt');

    for(var i = 0; i < oITPAGES.length; i++) {
        if(oITPAGES.find(a => a.getModel().oData.root[i].key === SELECTKEY)) {

            oITSLPG = oITPAGES[i];

        };
    };

    if(oAPP.SELECTED !== undefined){
        oITBAR.setSelectedKey(oAPP.SELECTED);

        for(var i = 0; i < oITPAGES.length; i++) {
            if(oITPAGES.find(a => a.getModel().oData.root[i].key === oAPP.SELECTED)) {
    
                oITSLPG = oITPAGES[i];
    
            };
        };
    };
    
    oAPP.SELECTED = undefined;

    oITCONT.to(oITSLPG);
    // oITBAR.getContent()[0].to(oITSLPG);
};

// 3.0에서 갱신화 추가 수정 !!!!!!!!!!!!!!!!!!!!!!!!
// GLV_DATA.FN.ADD_SERVER_ITEM = (addSevId) => {
//     // debugger;
//     var sevBoxItem = GLV_DATA.UI.SVBTN.getItems();
//     for (var i = 0; i < sevBoxItem.length; i++) {
//         // 갱신할 서버만 확인
//         if (sevBoxItem.find(a => a.getModel().oData.root[0].key) === addSevId.getData.SSID) {
//             console.log('수정 중');
//             return;
//         };
//     }
// };

// 3.0에서 갱신화 삭제 수정 !!!!!!!!!!!!!!!!!!!!!!!!
// GLV_DATA.FN.REMOVE_SERVER_ITEM = (removeSevId) => {
//     // debugger;
//     var sevBoxItem = GLV_DATA.UI.SVBTN.getItems();
//     for (var i = 0; i < sevBoxItem.length; i++) {
//         // 갱신할 서버만 확인
//         if (sevBoxItem[i].getCustomData()[0].getKey() === removeSevId.SSID) {
//             console.log('수정 중');
//             return;
//         };
//     };
// };


// ***********************************************************************************************
// [펑션] UI 생성이 완료가 된 후 생성 된 UI에 이벤트 *********************************************
// ***********************************************************************************************

function fn_UIUPdated() {
    /*  oHorizDom => 가장 밖의 가로 스플리터 돔
        oHorizOB => 가장 밖의 가로 스플리터의 바
        oVertDom => 가장 밖의 세로 스플리터 돔
        oVertTB => 가장 밖의 세로 스플리터의 상단 바
        oVertBB => 가장 밖의 세로 스플리터의 하단 바 */

    console.log('너는 4번 UI 생성 후 이벤트');
    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    if(oAPP.WATCH !== undefined) {
        oAPP.WATCH.close();
    };

    let oHorizDom = GLV_DATA.UI.SPLITTER.getDomRef(),
        oHorizOB = oHorizDom.children[1],
        oVertDom = GLV_DATA.UI.SPLITTER2.getDomRef(),
        oVertTB = oVertDom.children[1],
        oVertOVB = oVertDom.children[5],
        oVertBB = oVertDom.children[3];

    oHorizOB.classList.add('outSpBar');

    oVertTB.addEventListener('mousedown', function() {
        
        GLV_DATA.FN.SPLITTBAR_DOWN();
    });

    oVertBB.addEventListener('mousedown', function() {
        
        GLV_DATA.FN.SPLITTBAR_DOWN();
    });

    window.addEventListener('mousemove', function(e) {
        GLV_DATA.FN.MOUSEMOVING(e);
    });


    // 우측 하단 서버 버튼 생성 펑션
    GLV_DATA.FN.SERVER_BUTTON_CREATE = (SYSID) => {
   
        let CRETSERV = oAPP.T_SID,
            oJsonModel = new sap.ui.model.json.JSONModel();
        oJsonModel.setData({
            root: CRETSERV
        });

        // GLV_DATA.UI.PAGE10 => 서버 버튼이 생성되는 영역
        GLV_DATA.UI.PAGE10.removeContent(GLV_DATA.UI.SVBTN);
        GLV_DATA.UI.PAGE10.setModel(oJsonModel);

        GLV_DATA.UI.SVBTN = new sap.m.VBox({
            width: '100%',
            items: {
                path: '/root',
                template: new sap.m.Button({
                    width: '100%',
                    type: sap.m.ButtonType.Transparent,
                    text: '{text}',
                    tooltip: new sap.ui.core.TooltipBase({
                        visible: false
                    }),
                    press: function(e) {
                        console.log('눌렸어');
                        GLV_DATA.FN.SERVER_ACTIVE(e);
                    }
                }).addStyleClass('serverButton')
            }
        });

        GLV_DATA.UI.PAGE10.addContent(GLV_DATA.UI.SVBTN);

        // GLV_DATA.UI.PAGE7.getContent()[0].getContent()[0].removeAllPages();
        if(oAPP.T_SID.length !== 0) {

            GLV_DATA.UI.PAGE7.removeAllContent();

        }

        // 우측 하단 서버 버튼의 수에 따라 해당 영역의 높이 조절 펑션
        GLV_DATA.FN.SERVER_ZONE_HEIGHT();
    };

    // 우측 하단 서버 버튼의 수에 따라 해당 영역의 높이 조절 펑션
    GLV_DATA.FN.SERVER_ZONE_HEIGHT = () => {
        /*  oServZoneHt => 우측 하단 서버 버튼 영역의 레이아웃 데이터
            oServBtns => 우측 하단 서버 버튼 UI 리스트
            oServBtnLeng => 우측 하단 서버 버튼의 개수
            oServZoneAtHt => 우측 하단 서버 버튼 영역의 자동 높이 값 */

        let oServZoneHt = GLV_DATA.UI.PAGE10.getLayoutData(),
            oServBtns = GLV_DATA.UI.SVBTN.getItems(),
            oServBtnLeng = oServBtns.length,
            oServZoneAtHt = oServBtnLeng * 44;

        oServZoneAtHt = `${oServZoneAtHt}px`;
        oServZoneHt.setSize(oServZoneAtHt);
        oServZoneHt.setMinSize(oServBtnLeng * 44);

    };

    // 우측 상단 서버 별 기본 메뉴 구성 펑션
    GLV_DATA.FN.DEFAULT_MENU = (SERVERID, TABID) => {
        // debugger;
        let sMenuData = JSON.stringify(GLV_DATA.T_MENUDATA.__DEFULT_MENU),
            oNMenuData = JSON.parse(sMenuData);

        // GLV_DATA.T_MENUDATA 배열 내에 이미 SERVERID 값이 있다면 리턴
        // if(Boolean(GLV_DATA.T_MENUDATA[`${SERVERID}`]) === true){
        //     return;
        // }

        for(var i = 0; i < oNMenuData.length; i++) {
            oNMenuData[i].sysid = SERVERID;
            oNMenuData[i].title = `[ ${SERVERID} ]  ${GLV_DATA.T_MENUDATA.__DEFULT_MENU[i].title}`;
            oNMenuData[i].tabid = TABID;
        };

        GLV_DATA.T_MENUDATA[`${SERVERID}`] = oNMenuData;
    };

    //모니터 변경 감지 이벤트 설정 
    oAPP.remote.screen.on("display-metrics-changed", ()=>{
        var oWIN = oAPP.remote.getCurrentWindow();
        var oBounds  = oWIN.getBounds();
        oBounds.height = screen.availHeight;
        oBounds.width  = screen.availWidth;
        oWIN.setBounds(oBounds);
        GLV_DATA.UI.SPLITTER2.resetContentAreasSizes();

    
    });

    let oScreen = oAPP.remote.screen;
  
    if(oScreen.getAllDisplays().length > 1) {

        GLV_DATA.UI.DNDBTN = new sap.ui.core.dnd.DragDropInfo({
            dragEnd: function() {
            
                GLV_DATA.FN.DRAGEND();
    
            },
            dragStart: function() {
    
                GLV_DATA.FN.START();
    
            }
        });

        // 숨김 버튼에 드래그 드롭
        GLV_DATA.UI.BUTTON.addDragDropConfig(GLV_DATA.UI.DNDBTN);

        var l_meta = GLV_DATA.UI.SPLITTER4.getMetadata();
        l_meta.dnd.draggable = true;
        l_meta.dnd.droppable = true;

        // 우측 버튼 영역에 드래그 드롭
        GLV_DATA.UI.SPLITTER4.addDragDropConfig(GLV_DATA.UI.DNDBTN.clone());

    };



    oAPP.WIN.show();

    let frameContent = document.querySelector('.wonRental_content');

    var idx = 0;
    let contOpacity = setInterval(function() {
        // 
        if (frameContent.style.opacity === '0.9') {
            frameContent.style.opacity = '1';
            clearInterval(contOpacity);
            return;
        }
        frameContent.style.opacity = `0.${idx}`;
        idx++;
    }, 50);

    // 여기에 로직을 둔 이유 =>
    // remote의 속성도 가져오고
    // ui의 정보도 가져왔을 때
    // 결과적으로 안전한 위치
    if(oAPP.PRC.PRCCD === "INIT"){

        oAPP.PRC.INIT(GLV_DATA.UI, oAPP, GLV_DATA.FN);

        oAPP.PRC.PRCCD = "";

        oAPP.PRC.NEW_SERVER(oAPP.PRC._IF_DATA);
    }
    


}; // function fn_UIUPdate END

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 확인해 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// [펑션] UI 생성 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function createUi() {

    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    // app 생성 *********************************************************************************
    GLV_DATA.UI.APP = new sap.m.App('wsy_f_App').addStyleClass('floatingApp');

    // page 생성 ********************************************************************************
    GLV_DATA.UI.PAGE = new sap.m.Page('wsy_f_Page', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent
    }).addStyleClass('floatingPage');

    // splitter 생성 ****************************************************************************
    GLV_DATA.UI.SPLITTER = new sap.ui.layout.Splitter('wsy_outSplitt').addStyleClass('outSplitter').addEventDelegate({
        ondblclick: function(e) {
            let oTarget = e.target,
                bTarget = oTarget.classList.contains('outSplitter'),
                oLPageLD = GLV_DATA.UI.PAGE2.getLayoutData(),
                oRPageLD = GLV_DATA.UI.PAGE3.getLayoutData(),
                oRPageSize = oRPageLD.getSize();
                screenSize = `${screen.width - 16}px`;


            if (bTarget === true) {

                if(oRPageSize === screenSize){

                    oRPageLD.setSize('100px');

                    return;
                };

                oRPageLD.setSize('100%');
            };

        }
    });

    // page 생성 ********************************************************************************
    GLV_DATA.UI.PAGE2 = new sap.m.Page('wsy_f_Page2', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page2_spData')
    }).addStyleClass('floatingPage');

    // page 생성 ********************************************************************************
    // 결과적으로 보여지는 플로팅 메뉴(밖의 스플리터 기준 오른쪽 영역)
    GLV_DATA.UI.PAGE3 = new sap.m.Page('wsy_f_Page3', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page3_spData', {
            size: '900px',
            minSize: 100
        })
    }).addStyleClass('floatingPage mainPage');

    // splitter 생성 ****************************************************************************
    // 세로 방향 스플리트
    GLV_DATA.UI.SPLITTER2 = new sap.ui.layout.Splitter('wsy_sideSplitt', {
        orientation: sap.ui.core.Orientation.Vertical
    }).addStyleClass('sideSp').addEventDelegate({
        ondblclick: function(e) {

            // debugger;
            
            let oTarget = e.target,
                bTarget = oTarget.classList.contains('sideSp'),
                oTPageLD = GLV_DATA.UI.PAGE4.getLayoutData(),
                oMPageLD = GLV_DATA.UI.PAGE5.getLayoutData(),
                oBPageLD = GLV_DATA.UI.PAGE6.getLayoutData();

            if (bTarget === true) {

                if(GLV_DATA.DBV_CLICK === 'expanded'){

                    oTPageLD.setSize(GLV_SIZEINFO.TOPSIZE);
                    oMPageLD.setSize(GLV_SIZEINFO.MIDSIZE);
                    oBPageLD.setSize(GLV_SIZEINFO.BOTSIZE);

                    GLV_DATA.DBV_CLICK = null;

                    return;

                };

                oTPageLD.setSize('0px');
                oMPageLD.setSize('100%');
                oBPageLD.setSize('0px');

            };
            
            GLV_DATA.DBV_CLICK = 'expanded';
            
        }
    });

    // page 생성 ********************************************************************************
    // 세로 스플리트의 상단 영역
    GLV_DATA.UI.PAGE4 = new sap.m.Page('wsy_f_Page4', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page4_spData', {
            size: '0px'
        })
    });

    // page 생성 ********************************************************************************
    // 결과적으로 보여지는 스플리트 영역(세로 스플리트 기준 중간 영역 | 위 아래 영역은 0 세팅)
    GLV_DATA.UI.PAGE5 = new sap.m.Page('wsy_f_Page5', {
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page5_spData', {
            size: '100%'
        })
    });

    // splitter 생성 ****************************************************************************
    // 플로팅 메뉴 안의 가로 스플리트(컨텐트 영역과 서버 및 메뉴 영역)
    GLV_DATA.UI.SPLITTER3 = new sap.ui.layout.Splitter('wsy_contentSplitt').addStyleClass('contSp');

    // page 생성 ********************************************************************************
    // 컨텐트 영역
    GLV_DATA.UI.PAGE7 = new sap.m.Page('wsy_prgContPg', {
        showHeader: true,
        showSubHeader: false,
        customHeader: new sap.m.Bar('wsy_prgContHeader',{
            contentLeft: new sap.m.Text('wsy_svTxt', {
                text: ''
            }).addStyleClass('serverTitle'),
            contentRight: [
                new sap.m.Button('wsy_helpInfo',{
                    icon: 'sap-icon://information',
                    type: sap.m.ButtonType.Transparent,
                    tooltip: '도움말',
                    press: function(){
                        eKey = 'help_overlay';
                        // 플로팅 메뉴 도움말 팝오버 펑션
                        // GLV_DATA.FN.FLOAT_HELP_POPUP(eKey);
                    }
                })
            ]
        }),
        subHeader: new sap.m.Bar({
            contentRight: [
                new sap.ui.core.Icon({
                    src: 'sap-icon://sap-logo-shape'
                }).addStyleClass('sapIcon'),
                new sap.m.Input('wsy_t_codeInp', {
                    placeholder: 'SAP T-CODE',
                    width: '100%'
                })
            ]
        }),
        footer: new sap.m.Bar({
            contentLeft: new sap.m.Button('wsy_userInfo', {
                icon: 'sap-icon://activity-individual',
                type: sap.m.ButtonType.Transparent,
                ariaHasPopup: sap.ui.core.aria.HasPopup.Dialog,
                tooltip: 'System Information',
                press: function() {
                    // 플로팅 메뉴의 정보 팝업 펑션
                    // GLV_DATA.FN.FLOAT_INFO_POPUP();
                    console.log('아직 준비 중');
                }
            })
        })
    }).addStyleClass('prgContent');

    // 플로팅 내부에서 예로 즐겨찾기 메뉴에 있는 프로그램들 중 편집(삭제)하고 싶은
    // 프로그램에 대한 edit버튼
    GLV_DATA.UI.HEDITBUTTON = new sap.m.Button({
        icon: 'sap-icon://edit',
        tooltip: '편집',
        visible: false,
        press: function(e){
            // alert('편집 소스 준비 중');
        }
    });

    // page 생성 ********************************************************************************
    // 서버 및 메뉴 영역
    GLV_DATA.UI.PAGE8 = new sap.m.Page('wsy_sideContPg', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: '100px',
            resizable: false
        })
    }).addStyleClass('ws_sideContent');

    // 세팅 버튼 생성 ********************************************************************************
    GLV_DATA.UI.SETTINGBUTTON = new sap.m.Button({
        width: '100px',
        icon: 'sap-icon://action-settings',
        type: sap.m.ButtonType.Transparent,
        tooltip: '세팅',
    }).addStyleClass('ws_settingBtn');

    // splitter 생성 ****************************************************************************
    // 서버 및 메뉴를 나누는 세로 스플리트
    GLV_DATA.UI.SPLITTER4 = new sap.ui.layout.Splitter('wsy_sideContSplitt', {
        orientation: sap.ui.core.Orientation.Vertical,
        height: 'calc(100% - 94px)'
    });

    // page 생성 ********************************************************************************
    // 메뉴 영역
    GLV_DATA.UI.PAGE9 = new sap.m.Page('prgPg', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        content: [
            new sap.m.VBox('persVBox',{
                width: '100%',
                height: '50px',
                items: [
                    new sap.m.Button('favorite_list',{
                        width: '100%',
                        type: sap.m.ButtonType.Transparent,
                        tooltip: '개인화',
                        icon: 'sap-icon://person-placeholder',
                        press: function(e) {

                            // [수정]
                            oKEY = GLV_DATA.T_MENUDATA.__DEFULT_MENU[0];

                            GLV_DATA.FN.MAIN_PUSH_CONTENT(oKEY);
                            // GLV_DATA.FN.SERVERITEM_BUTTON_CLICK(oKEY);
                        }
                    })
                ]
            }),
        ]
    }).addStyleClass('programPage');

    // 개인화 버튼 생성 ********************************************************************************
    // GLV_DATA.UI.PERSPAGE = new sap.m.Page({
        
    // })

    // page 생성 ********************************************************************************
    // 서버 영역
    GLV_DATA.UI.PAGE10 = new sap.m.Page('wsy_serverPg', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page10_spData', {
            minSize: 50,
        })
    }).addStyleClass('serverPage');

  
    // button 생성 ******************************************************************************
    // 최소화 최대화 로테이트 버튼
    GLV_DATA.UI.BUTTON = new sap.m.Button('wsy_rotateBt', {
        width: '100px',
        type: sap.m.ButtonType.Transparent,
        icon: 'sap-icon://expand-group',
        press: function(e) {
            GLV_DATA.FN.SHOWTOGGLEBTN(e);
            return;
        }
    }).addEventDelegate({
        onAfterRendering: function(oEvent){

            let oThemeColor = sap.ui.core.theming.Parameters.get();

            let oBtn = oEvent.srcControl;
            
            oBtn.$().css({"background-color": oThemeColor.sapBackgroundColor});

        }
    }).addStyleClass('rotateButton');

    // page 생성 ********************************************************************************
    // 세로 스플리트의 하단 영역
    GLV_DATA.UI.PAGE6 = new sap.m.Page('wsy_f_Page6', {
        showHeader: false,
        backgroundDesign: sap.m.PageBackgroundDesign.Transparent,
        layoutData: new sap.ui.layout.SplitterLayoutData('wsy_f_Page6_spData', {
            size: '0px'
        })
    });

    // 데이터가 없을 시 아이템 ******************************************************************
    GLV_DATA.UI.NODATA = new sap.m.VBox('wsy_noData', {
        width: '100%',
        height: '100%',
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        justifyContent: sap.m.FlexJustifyContent.Center,
        items: [
            new sap.m.Title({
                level: 'H1',
                text: 'U4A WORK SPACE'
            }),
            new sap.m.Title('ws_versionTitle',{
                level: 'H3'
            })
        ]
    });

    // 생성한 ui들을 차례차례 추가
    GLV_DATA.UI.SPLITTER4.addContentArea(GLV_DATA.UI.PAGE9).addContentArea(GLV_DATA.UI.PAGE10);
    GLV_DATA.UI.PAGE8.addContent(GLV_DATA.UI.SETTINGBUTTON).addContent(GLV_DATA.UI.SPLITTER4).addContent(GLV_DATA.UI.BUTTON);
    GLV_DATA.UI.PAGE7.addContent(GLV_DATA.UI.NODATA);
    GLV_DATA.UI.PAGE7.getCustomHeader().addContentLeft(GLV_DATA.UI.HEDITBUTTON);
    GLV_DATA.UI.SPLITTER3.addContentArea(GLV_DATA.UI.PAGE7).addContentArea(GLV_DATA.UI.PAGE8);
    GLV_DATA.UI.PAGE5.addContent(GLV_DATA.UI.SPLITTER3);
    GLV_DATA.UI.SPLITTER2.addContentArea(GLV_DATA.UI.PAGE4).addContentArea(GLV_DATA.UI.PAGE5).addContentArea(GLV_DATA.UI.PAGE6);
    GLV_DATA.UI.PAGE3.addContent(GLV_DATA.UI.SPLITTER2);
    GLV_DATA.UI.SPLITTER.addContentArea(GLV_DATA.UI.PAGE2).addContentArea(GLV_DATA.UI.PAGE3);
    GLV_DATA.UI.PAGE.addContent(GLV_DATA.UI.SPLITTER);
    GLV_DATA.UI.APP.addPage(GLV_DATA.UI.PAGE);
    GLV_DATA.UI.APP.placeAt('content');
} // function createUi END

