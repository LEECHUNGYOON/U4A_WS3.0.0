// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 파라미터 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. REMOTE  => oAPP.remote의 전체 속성
    2. oPARENT => GLV_DATA.UI.PAGE7;
               => content 좌측 영역 --> 사용자 메뉴 선택시 해당 내용 영역
    3. PARAMS  => 해당 메뉴의 value값
               => menu_icon, sysid, key, title, desc, view_fld_path
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 필요한 정보값은
// => 즐겨찾기한 프로그램 아이디 
// => 즐겨찾기한 프로그램 디스크립션
// => 즐겨찾기한 프로그램 키 값
// => 

(function (o) {

    o.favorite_list = (oAPP, REMOTE, oPARENT, PARAMS) => {

        // 아이콘 탭바의 컨텐트를 구성할 데이터
        let personalTab = [
            {
                title: 'Source Patterns',
                framePath: "<iframe src='USP.html' style='width:100%; height:100%; padding:15px; box-sizing:border-box; border:none;'></iframe>",
                key: 'USP'
            },
            {
                title: 'Code Templates',
                framePath: "<iframe src='ABAP.html' style='width:100%; height:100%; padding:15px; box-sizing:border-box; border:none;'></iframe>",
                key: 'ABAP'
            }
        ];

        if (oAPP.WATCH !== undefined) {
            oAPP.WATCH.close();
        };

        let oJsonModel = new sap.ui.model.json.JSONModel();

        oJsonModel.setData({

            root: personalTab

        });

        let oParentCont = oPARENT.getContent()[0],
            oParentContCD = oParentCont.getModel();

        // 이미 아이콘 탭 바가 그려져 있는지 체크
        if (oParentContCD !== undefined) {

            return;
        }

        // 받아온 PARAMS가 없어?? 리턴해
        if (PARAMS === undefined) { console.log("favorite_list.js 에러"); return; };

        let oPersTab = new sap.m.IconTabBar({
            stretchContentHeight: true,
            expandable: false,
            select: function () {
                GLV_DATA.FN.TAB_SELECT();
            }
        }).addStyleClass('perstab_bar');

        // 탭 바 영역에 모델 바인딩
        oPersTab.setModel(oJsonModel);

        let oITBTN_USP = new sap.m.IconTabFilter({
            text: 'USP',
            key: 'USP'
        });

        let oITBTN_ABAP = new sap.m.IconTabFilter({
            text: 'ABAP',
            key: 'ABAP'
        });

        let oITCONT = new sap.m.NavContainer({
            width: '100%',
            height: '100%',
            pages: {
                path: '/root',
                template: new sap.m.Page({
                    title: '{title}',
                    enableScrolling: false,
                    content: new sap.ui.core.HTML({
                        blocked: true,
                        content: '{framePath}'
                    })
                })
            }
        });

        oPARENT.removeAllContent();
        oPersTab.addContent(oITCONT);
        oPersTab.addItem(oITBTN_USP).addItem(oITBTN_ABAP);
        oPARENT.setShowSubHeader(false);
        oPARENT.addContent(oPersTab);

    };

})(GLV_DATA.FN);