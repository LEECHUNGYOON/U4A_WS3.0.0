// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 파라미터 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. REMOTE  => oAPP.remote의 전체 속성
    2. oPARENT => sap.ui.getCore().byId('prgContPg');
               => content 좌측 영역 --> 사용자 메뉴 선택시 해당 내용 영역
    3. PARAMS  => 해당 메뉴의 value값
               => menu_icon, sysid, key, title, desc, view_fld_path
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
(function(o){

    o.total_list = (REMOTE, oPARENT, PARAMS) => {

        // 받아와야 할 데이터 => 내 생각
        // => 프로그램 명
        // => 프로그램 디스크립션

        // 받아온 PARAMS가 없어?? 리턴해
        if(PARAMS === 'undefined'){ console.log("total_list.js 에러"); return;};

        // SVTEXT => 좌측 header영역의 contentleft 텍스트 UI
        let SVTEXT = sap.ui.getCore().byId('wsy_svTxt');

        SVTEXT.setText(PARAMS.title);

        // oPARENT => sap.ui.getCore().byId('prgContPg');
        // 아래 소스는 추 후 수정
        // oPARENT의 모든 content를 지우겠다.
        oPARENT.removeAllContent();

        oUI.TREE = new sap.m.Tree({
            items: {
                path: '/tree',
                templateShareable: false,
                template: new sap.m.StandardTreeItem({
                    title: "{text}"
                })
            }
        });

        oPARENT.setShowSubHeader(true);
        oPARENT.addContent(oUI.TREE);
    };

})(oFn);