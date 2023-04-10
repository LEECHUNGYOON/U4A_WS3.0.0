// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 파라미터 설명 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*
    1. REMOTE  => oAPP.remote의 전체 속성
    2. PARAMS  => help_overlay
*/
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

(function(o){

    o.help_overlay = (REMOTE, PARAMS) => {
        // debugger;

        // 체크할 돔 영역 및 위치 정보
        let T_CODEINP = document.getElementById('wsy_t_codeInp'),
            T_CODEINPRECT = T_CODEINP.getBoundingClientRect(),
            LOGOUTBTN = document.getElementById('wsy_logOut'),
            LOGOUTBTNRECT = LOGOUTBTN.getBoundingClientRect();

        // 생성할 돔
        let HELPOVERLAY = document.getElementById('help_content');

        // 팝오버 띄울 때 먼저 초기화
        HELPOVERLAY.innerHTML = '';

        // T-CODE input 설명
        let T_CODEDESC = document.createElement('div');
        T_CODEDESC.innerHTML = 'T-CODE 입력 시 해당 화면으로 이동';
        T_CODEDESC.className = 't_codesc';

        // popoverlay 닫기 버튼
        let HELPCLOSE = document.createElement('div'),
            HELPCLOSEBT = document.createElement('button');
        HELPCLOSEBT.innerHTML = 'X';
        HELPCLOSEBT.className = 'closebt';
        HELPCLOSE.className = 'close';
        HELPCLOSE.append(HELPCLOSEBT);

        // floating layout
        let FLOATINGLAYOUT = document.createElement('div'), // 코치마크 플로팅 레이아웃
            FLOATINGL = document.createElement('div'), // 플로팅 메뉴의 메인 컨텐트 영역
            FLOATINGR = document.createElement('div'), // 플로팅 메뉴의 서버 및 개인화 영역
            FLOATINGLH = document.createElement('div'), // 플로팅 메뉴의 메인 컨텐트 영역 헤더 영역
            FLOATINGLMH = document.createElement('div'), // 플로팅 메뉴의 메인 컨텐트 영역 메인 헤더
            FLOATINGLSH = document.createElement('div'), // 플로팅 메뉴의 메인 컨텐트 영역 서브 헤더
            FLOATINGRP = document.createElement('div'), // 플로팅 메뉴의 개인화 영역
            FLOATINGRS = document.createElement('div'), // 플로팅 메뉴의 서버 영역
            LOGOUTBT = document.createElement('div'),
            SERVERID = document.createElement('div'),
            TCODEINP = document.createElement('input');
        
        TCODEINP.setAttribute('placeholder','SAP T-CODE');
        TCODEINP.className = 'wsy_overlaytcode'
        SERVERID.innerText = 'SERVER NAME';
        SERVERID.className = 'wsy_overlayserverid';
        LOGOUTBT.className = 'wsy_overlayLogout';
        FLOATINGLSH.className = 'wsy_overlayfloatingLSH';
        FLOATINGLMH.className = 'wsy_overlayfloatingLMH';
        FLOATINGLH.className = 'wsy_overlayfloatingLH';
        FLOATINGL.className = 'wsy_overlayfloatingL';
        FLOATINGR.className = 'wsy_overlayfloatingR';
        FLOATINGRP.className = 'wsy_overlayfloatingRP';
        FLOATINGRS.className = 'wsy_overlayfloatingRS';
        FLOATINGLAYOUT.className = 'wsy_overlayfloating';

        FLOATINGR.append(FLOATINGRP);
        FLOATINGR.append(FLOATINGRS);
        FLOATINGLSH.append(TCODEINP);
        FLOATINGLMH.append(SERVERID);
        FLOATINGLMH.append(LOGOUTBT);
        FLOATINGLH.append(FLOATINGLMH);
        FLOATINGLH.append(FLOATINGLSH);
        FLOATINGL.append(FLOATINGLH);
        FLOATINGLAYOUT.append(FLOATINGL);
        FLOATINGLAYOUT.append(FLOATINGR);

        let LOGOUTBTNDESC = document.createElement('div');

        HELPOVERLAY.append(FLOATINGLAYOUT);
        HELPOVERLAY.append(HELPCLOSE);
        HELPOVERLAY.append(T_CODEDESC);
        HELPOVERLAY.append(LOGOUTBTNDESC);

        HELPOVERLAY.style.display = 'block';

        // MENU CONTENT 헤더영역 설명
        let LOGOUTBTNLINE = document.createElement('div'),
            LOGOUTBTNCHECK = document.createElement('div'),
            LOGOUTRECT = LOGOUTBT.getBoundingClientRect();

        LOGOUTBTNDESC.innerHTML = '플로팅 화면만 닫는 버튼';
        LOGOUTBTNDESC.className = 'logout_desc';
        LOGOUTBTNCHECK.className = 'wsy_logcheck';
        LOGOUTBTNCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        LOGOUTBTNCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        LOGOUTBTNCHECK.style.left = (LOGOUTRECT.x) + 'px';
        LOGOUTBTNCHECK.style.top = ((LOGOUTRECT.y + LOGOUTRECT.width) - 25) + 'px';

        let T_CODELINE = document.createElement('div'),
            T_CODCHECK = document.createElement('div');

        T_CODCHECK.className = 'wsy_domcheck';
        T_CODCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        T_CODCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        T_CODCHECK.style.left = (T_CODEINPRECT.x + (T_CODEINPRECT.width / 2) - 10) + 'px';
        T_CODCHECK.style.top = (T_CODEINPRECT.y + (T_CODEINPRECT.height / 2) - 10) + 'px';
        T_CODEDESC.style.top = (T_CODEINPRECT.y + (T_CODEINPRECT.height * 4) - 10) + 'px';

        // MENU CONTENT MAIN 영역 설명
        let FLOATINGLRECT = FLOATINGL.getBoundingClientRect(),
            FLOATINGLCHECK = document.createElement('div'),
            FLOATINGLDESC = document.createElement('div');
    
        FLOATINGLDESC.innerHTML = '메뉴를 클릭 시 해당 구성 내용이 보여지는 영역';
        FLOATINGLDESC.className = 'mainLayout_desc';
        FLOATINGLCHECK.className = 'wsy_mainareacheck';
        FLOATINGLCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        FLOATINGLCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        FLOATINGLCHECK.style.left = (FLOATINGLRECT.x + (FLOATINGLRECT.width / 2) - 10) + 'px';
        FLOATINGLCHECK.style.top = (FLOATINGLRECT.y + (FLOATINGLRECT.height / 2) + 60) + 'px';
        FLOATINGLDESC.style.top = (FLOATINGLRECT.y + (FLOATINGLRECT.height / 2) + 30) + 'px';

        // FLOATING BAR 설명
        let SPLIITBARCHECK = document.createElement('div'),
            SPLITTBARDESC = document.createElement('div');

        SPLITTBARDESC.innerHTML = '플로팅 화면의 크기를 조절할 수 있는 바';
        SPLITTBARDESC.className = 'splittbar_desc';
        SPLIITBARCHECK.className = 'wsy_splittercheck';
        SPLIITBARCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        SPLIITBARCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        SPLIITBARCHECK.style.left = (FLOATINGLRECT.x) + 'px';
        SPLIITBARCHECK.style.top = (FLOATINGLRECT.y + (FLOATINGLRECT.height / 2) - 10) + 'px';
        SPLITTBARDESC.style.top = (FLOATINGLRECT.y + (FLOATINGLRECT.height / 2) - 140) + 'px';

        // 개인화 영역 설명
        let FLOATINGRPCHECK = document.createElement('div'),
            FLOATINGRPDESC = document.createElement('div'),
            FLOATINGRPRECT = FLOATINGRP.getBoundingClientRect();

        FLOATINGRPDESC.innerHTML = '활성화 되어있는 서버에 대한 메뉴 리스트';
        FLOATINGRPDESC.className = 'prgarea_desc';
        FLOATINGRPCHECK.className = 'wsy_prgareacheck';
        FLOATINGRPCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        FLOATINGRPCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        FLOATINGRPCHECK.style.top = (FLOATINGRPRECT.y + (FLOATINGRPRECT.height / 2) - 10) + 'px';
        FLOATINGRPCHECK.style.left = (FLOATINGRPRECT.x + (FLOATINGRPRECT.width / 2) - 10) + 'px';

        // 서버 영역 설명
        // let FLOATINGRSCHECK = document.createElement('div'),
        //     FLOATINGRSDESC = document.createElement('div'),
        //     FLOATINGRSRECT = FLOATINGRS.getBoundingClientRect();
        //     FLOATINGRPDESC.innerHTML = '현재 OPEN이 되어있는 서버 리스트 동일 서버가 여러개 OPEN되어있어도 마지막 하나가 닫히기 전까지는 버튼이 존재';
        // FLOATINGRPDESC.className = 'prgarea_desc';
        // FLOATINGRPCHECK.className = 'wsy_prgareacheck';
        // FLOATINGRPCHECK.style.width = (LOGOUTRECT.width / 2) + 'px';
        // FLOATINGRPCHECK.style.height = (LOGOUTRECT.width / 2) + 'px';
        // FLOATINGRPCHECK.style.top = (FLOATINGRPRECT.y + (FLOATINGRPRECT.height / 2) - 10) + 'px';
        // FLOATINGRPCHECK.style.left = (FLOATINGRPRECT.x + (FLOATINGRPRECT.width / 2) - 10) + 'px';

        HELPOVERLAY.append(FLOATINGRPDESC);
        HELPOVERLAY.append(FLOATINGRPCHECK);
        HELPOVERLAY.append(SPLITTBARDESC);
        HELPOVERLAY.append(SPLIITBARCHECK);
        HELPOVERLAY.append(FLOATINGLDESC);
        HELPOVERLAY.append(FLOATINGLCHECK);
        HELPOVERLAY.append(LOGOUTBTNLINE);
        HELPOVERLAY.append(LOGOUTBTNCHECK);
        HELPOVERLAY.append(T_CODCHECK);

        let closeHelpbt = document.querySelector('.closebt');
        closeHelpbt.addEventListener('click',function(e){
            e.preventDefault();
            GLV_DATA.FN.FLOAT_HELP_POPUP_CLOSE();        
        });
    }

})(GLV_DATA.FN);