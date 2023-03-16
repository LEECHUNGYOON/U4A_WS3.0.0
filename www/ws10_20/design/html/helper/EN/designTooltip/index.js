let LILIST = [];
let CLICKED = false;

let BODY = document.querySelector('body'), // body dom
    SECTION = document.querySelectorAll('.contentArea'),
    SECTIONLENG = SECTION.length,
    ULDOM = document.createElement('ul'); // create ul dom

// ul dom 클래스 추가
ULDOM.className = 'fast_button';

// body안에 섹션의 수 만큼 li 생성
for(var i = 0; i < SECTIONLENG; i++) {
    let LIDOM = document.createElement('li'),
        LILINK = document.createElement('a');

    LILINK.setAttribute('href',`#${SECTION[i].id}`);
    LIDOM.append(LILINK);
    LIDOM.setAttribute('title',SECTION[i].id);
    LIDOM.className = 'fastDot';

    LILIST[i] = LIDOM;
    ULDOM.append(LILIST[i]);
}

BODY.append(ULDOM);

let slideUl = document.querySelector('.fast_button'),
    slideLi = slideUl.getElementsByTagName('li'),
    contArea = document.querySelectorAll('.contentArea'),
    fastDot = document.querySelectorAll('.fastDot'),
    contents = document.querySelector('.content');

    // slideLi[0].children[0].classList.add('active');
    for(var i=0; i< slideLi.length; i++) {
        let dotActive = document.querySelector('.active'),
            CONTRECT = contArea[i].getBoundingClientRect();
        if(200 > CONTRECT.y && 0 <= CONTRECT.y) {
            if(dotActive){
                dotActive.classList.remove('active');
            };
            fastDot[i].children[0].classList.add('active');
        }

        slideLi[i].addEventListener('click',(e) => {
            e.preventDefault();

            // debugger;

            let TARGETELE = e.target.parentElement,
                TARGETELETITLE = TARGETELE.title,
                TARGETMOVELE = document.getElementById(TARGETELETITLE);
                
                TARGETMOVELE.scrollIntoView();

            slideDot(e);

            CLICKED = true;
        });
    };

// 우측 슬라이드 영역 클릭시 포커스
let slideDot = (e) => {
    let dotActive = document.querySelector('.active');
    if(dotActive){
        dotActive.classList.remove('active');
    }
    e.target.classList.add('active');
};

let cont = document.querySelector('.content');
let zoom = 1;
let ZOOM_SPEED = 0.1;
// 마우스 휠 이벤트
document.addEventListener('wheel',function(e){
    // 휠을 할 때 Ctrl키가 눌려있다면 zoom
    if(event.ctrlKey === true) {
        if(e.deltaY>0) {
            if(cont.style.zoom === '0.1'){
                return;
            }
            cont.style.zoom = (zoom -= ZOOM_SPEED);
        } else {
            cont.style.zoom = (zoom += ZOOM_SPEED);
        }
        return;
    } else {
        CLICKED = false;
    };
});

document.addEventListener('scroll',function(){
    scrllEle();

    // CLICKED = false;
    return;
});


// 스크롤 시 탑 0과 가까워지는 엘리먼트에 포커스
let scrllEle = () => {
    // debugger;
    if(CLICKED === true){
        return false;
    };
    let dotActive = document.querySelector('.active');
    for(var i=0; i<contArea.length; i++) {
        let CONTRECT = contArea[i].getBoundingClientRect();
        if(300 > CONTRECT.y && 0 <= CONTRECT.y) {
            if(dotActive){
                dotActive.classList.remove('active');
            };
            fastDot[i].children[0].classList.add('active');

            return;
        }
    }
};