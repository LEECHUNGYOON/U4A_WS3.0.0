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

    o.ADDPESO = (REMOTE, oPARENT, PARAMS, PATH) => {
        // debugger;
        // 서버 영역의 버튼
        let sevBoxItem = oUI.svBtn.getItems(),
            sMenuData = JSON.stringify(oMenuData.__DEFULT_MENU[0]),
            oNMenuData = JSON.parse(sMenuData);

        for (var i = 0; i < sevBoxItem.length; i++) {
            // 추가하려는 해당 메뉴의 서버가 있어? ┓
            if (sevBoxItem[i].getText() === PARAMS.getData.SSID) {
     
                oNMenuData.menu_icon = PARAMS.getData.CMenuIcon;
                oNMenuData.sysid = PARAMS.getData.SSID;
                oNMenuData.key = PARAMS.getData.CMenuKey;
                oNMenuData.title = `[ ${PARAMS.getData.SSID} ]  ${PARAMS.getData.Title}`;
                oNMenuData.desc = PARAMS.getData.CMenuDesc;

                oMenuData[`${PARAMS.getData.SSID}`].push(oNMenuData);
                // oMenuData.__COPY_MENU.push(oNMenuData);

                oFn.fn_prgBtnCall(PARAMS.getData.SSID);
                oFn.fn_CreateFile(PARAMS.getData);

                // return;
            };
        };

        // 생성된 메뉴의 BASE 파일 생성
    };

})(oFn)