// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 파라미터 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. REMOTE  => oAPP.remote의 전체 속성
    2. oPARENT => oUI.PRGBT
               => 개인화 영역의 페이지
    3. PARAMS  => 해당 메뉴의 value값
               => PRCCD, SSID, CARRAY
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
(function(o){

    o.REMOVEPESO = (REMOTE, oPARENT, PARAMS, PATH) => {
        // 서버 영역의 버튼
        let sevBoxItem = oUI.svBtn.getItems();

        for (var i = 0; i < sevBoxItem.length; i++) {
            // 삭제하려는 해당 메뉴의 서버가 있어? ┓
            if (sevBoxItem[i].getText() === PARAMS.SSID) {

                return;
            };
        };
    };

})(oFn)