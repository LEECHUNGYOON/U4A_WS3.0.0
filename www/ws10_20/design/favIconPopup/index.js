//즐겨찾기 리스트 구성 대표 object.
const oAPP = {};

//attribute 구성 obecjt.
oAPP.attr = {};

//기능 function 구성 object.
oAPP.fn = {};

//즐겨찾기 팝업과 즐겨찾기 리스트(IFRAME)의 I/F를 위한 커스텀 이벤트명.
const C_IF_FAV_ICON_EVT = "IF_FAV_ICON_EVT";


/*********************************************************
 * @function - 즐겨찾기 html 로드시 이벤트 등록 처리.
 ********************************************************/
window.addEventListener("load", async function(){

    let _PARENT_DOM_ID = await new Promise(function(resolve){

        let _oIntv = setInterval(() => {

            //부모에서 구성한 팝업의 DOM ID가 존재하지 않는경우 EXIT.
            //(child의 onload 이벤트가 먼저 수행된 뒤, parent의 onload이벤트가 수행되어
            //부모에서 window에 매핑한 값을 child에서 기다림)
            if(typeof window?.PARENT_DOM_ID === "undefined"){
                return;
            }

            //interval 초기화.
            clearInterval(_oIntv);

            let _PARENT_DOM_ID = window.PARENT_DOM_ID;
            
            delete window.PARENT_DOM_ID;
            
            resolve(_PARENT_DOM_ID);
            
        }, 50);
    });


    //부모로 부터 전달받은 팝업의 DOM ID가 존재하지 않는경우 EXIT.
    if(typeof _PARENT_DOM_ID === "undefined"){
        return;
    }

    
    oAPP.attr.PARENT_DOM_ID = _PARENT_DOM_ID;
            
    
    //커스텀 이벤트 등록 처리.
    document.body.addEventListener(C_IF_FAV_ICON_EVT, oAPP.fn.favIconCustomEvent);


    //즐겨찾기 아이콘 리스트 iframe 로드 처리됨 이벤트 수행.
    oAPP.fn.fireIconListFrameLoaded();


});


/*********************************************************
 * @function - 즐겨찾기 팝업으로 데이터 전송 처리.
 ********************************************************/
oAPP.fn.sendDataToParent = function(oData){

    let _oParentDom = parent.document.getElementById(oAPP.attr.PARENT_DOM_ID) || undefined;

    if(typeof _oParentDom === "undefined"){
        return;
    }
    
    let _oCustomEvt = new CustomEvent(C_IF_FAV_ICON_EVT, {detail: oData});

    //즐겨찾기 팝업으로 데이터 전송 처리.
    _oParentDom.dispatchEvent(_oCustomEvt);


};




/*********************************************************
 * @function - //즐겨찾기 팝업과 즐겨찾기 리스트(iframe)과의 I/F를 위한 커스텀 이벤트 callback function.
 ********************************************************/
oAPP.fn.favIconCustomEvent = function(oEvent){
    
    switch (oEvent?.detail?.ACTCD) {
        case "SET_INIT_FAV_LIST":
            
            //즐겨찾기 아이콘 화면 초기 구성.
            oAPP.fn.setInitFavIconData(oEvent.detail);
            break;

        case "THEME_CHANGE":
            //테마 변경 처리.
            oAPP.fn.setTheme(oEvent.detail?.S_THEME);
            break;

        default:
            break;
    }

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 리스트 iframe 로드 처리됨 이벤트 수행.
 ********************************************************/
oAPP.fn.fireIconListFrameLoaded = function(){

    let _sParam = {};

    //즐겨찾기 아이콘 리스트 IFRAME 로드됨.
    _sParam.ACTCD = "FAV_ICON_LIST_FRAME_LOADED";


    //즐겨찾기 팝업으로 데이터 전송 처리.
    oAPP.fn.sendDataToParent(_sParam);

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 화면 초기 구성.
 ********************************************************/
oAPP.fn.setInitFavIconData = function(oData){


    //즐겨찾기 아이콘 CSS Link 제거.
    oAPP.fn.removeIconCSSLink();


    //즐겨찾기 아이콘 CSS STYLE 제거.
    oAPP.fn.removeIconStyle();


    //즐겨찾기 아이콘 리스트 초기화.
    oAPP.fn.removeFavList();


    //테마 적용 처리.
    oAPP.fn.setTheme(oData?.S_THEME);

    
    //즐겨찾기 아이콘 CSS Link 추가 처리.
    oAPP.fn.createIconCSSLink(oData?.T_CSS);


    //즐겨찾기 아이콘 CSS STYLE 구성 처리.
    oAPP.fn.createIconStyle(oData?.T_STYLE);


    //즐겨찾기 아이콘 리스트 데이터 출력 body 생성.
    oAPP.fn.createFavListBody();
    

    //즐겨찾기 아이콘 리스트 구성 처리.
    oAPP.fn.setFavList(oData?.T_ICON_LIST);


    let _oHTML = document.getElementsByTagName("html");

    //현재 HTML의 비활성 해제 처리.
    if(_oHTML.length > 0){
        _oHTML[0].style.display = "";
    }


    let _sParam = {};

    //BUSY OFF 액션코드 매핑.
    _sParam.ACTCD = "BUSY_OFF";
    
    //아이콘 즐겨찾기 팝업에 BOSY OFF 요청 처리.
    oAPP.fn.sendDataToParent(_sParam);

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 CSS STYLE 제거.
 ********************************************************/
oAPP.fn.removeIconStyle = function(){

    let _oStyle = document.head.querySelector('style[id^="ext_icon"]') || undefined;

    if(typeof _oStyle === "undefined"){
        return;
    }

    document.head.removeChild(_oStyle);


};




/*********************************************************
 * @function - 테마 적용 처리.
 ********************************************************/
oAPP.fn.setTheme = function(sTheme){

    if(typeof sTheme?.THEME === "undefined"){
        return;
    }

    //테마명 대문자 변환 처리.
    let _theme = String(sTheme.THEME).toUpperCase();
    
    //다크 테마 키워드가 존재하는경우.
    if(_theme.indexOf("DARK") !== -1){
        //즐겨찾기 리스트를 다크 테마로 적용.
        document.body.classList.replace('light-theme', 'dark-theme');
        return;
    }


    //다크 테마가 아닌경우, 밝은 테마로 적용.
    document.body.classList.replace('dark-theme', 'light-theme');


};




/*********************************************************
 * @function - 즐겨찾기 아이콘 CSS STYLE 구성 처리.
 ********************************************************/
oAPP.fn.createIconStyle = function(aFont = []){

    if(aFont.length === 0){
        return;
    }

    let _oStyle = document.createElement("style");

    _oStyle.id = "ext_icon";

    let _style = "";

    //EXTENSION 아이콘 처리를 위해 FONT CSS 구성 처리.
    for (let i = 0, l = aFont.length; i < l; i++) {

        let _sFont = aFont[i];

        _style += 
                `@font-face {` +
                    `font-family: '${_sFont.fontFamily}';` +
                    `src: url('${_sFont.fontURI}') format('woff2');` +
                    `font-weight: normal;` +
                    `font-style: normal;` +
                `}`;
    }

    
    _oStyle.innerHTML = _style;


    document.head.appendChild(_oStyle);


};




/*********************************************************
 * @function - 즐겨찾기 아이콘 CSS Link 제거.
 ********************************************************/
oAPP.fn.removeIconCSSLink = function(){

    //sap ui5 폰트 사용을 위한 테마 링크 css 정보 얻기.
    let _aLink = document.head.querySelectorAll('link[id^="sap-ui-theme"]');

    if(_aLink.length === 0){
        return;
    }

    //폰트 사용 테마 링크 정보 제거 처리.
    for (let i = 0, l = _aLink.length; i < l; i++) {
        
        let _oLink = _aLink[i];

        document.head.removeChild(_oLink);
        
    }

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 CSS Link 추가 처리.
 ********************************************************/
oAPP.fn.createIconCSSLink = function(aLinkPath = []){

    if(aLinkPath.length === 0){
        return;
    }

    //폰트 사용 테마 링크 정보 추가 처리.
    for (let i = 0, l = aLinkPath.length; i < l; i++) {
        
        let _sLinkPath = aLinkPath[i];

        let _oLink = document.createElement("link");

        _oLink.setAttribute("rel", "stylesheet");

        _oLink.setAttribute("href", _sLinkPath.href);

        _oLink.setAttribute("id", _sLinkPath.id);
            

        document.head.appendChild(_oLink);
        
    }

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 리스트 초기화.
 ********************************************************/
oAPP.fn.removeFavList = function(){

    let _oList = document.getElementById("favList") || undefined;

    if(typeof _oList === "undefined"){
        return;
    }


    let _oTBody = _oList.querySelector("tbody") || undefined;

    if(typeof _oTBody === "undefined"){
        return;
    }

    _oList.removeChild(_oTBody);

};




/*********************************************************
 * @function - 즐겨찾기 아이콘 리스트 데이터 출력 body 생성.
 ********************************************************/
oAPP.fn.createFavListBody = function(){
    
    let _oList = document.getElementById("favList") || undefined;

    if(typeof _oList === "undefined"){
        return;
    }

    let _oTBody = document.createElement("tbody");

    _oList.appendChild(_oTBody);
    
};




/*********************************************************
 * @function - 즐겨찾기 아이콘 리스트 데이터 출력 body 정보 얻기.
 ********************************************************/
oAPP.fn.getFavListBody = function(){
    
    let _oList = document.getElementById("favList") || undefined;

    if(typeof _oList === "undefined"){
        return;
    }

    return _oList.querySelector("tbody") || undefined;    
    
};




/*********************************************************
 * @function - 즐겨찾기 아이콘 리스트 구성 처리.
 ********************************************************/
oAPP.fn.setFavList = function(aFavIconList = []){

    //즐겨찾기 아이콘 리스트가 존재하지 않는경우 exit.
    if(aFavIconList.length === 0){
        return;
    }


    //즐겨찾기 아이콘 리스트 데이터 출력 body 정보 얻기.
    let _oTBody = oAPP.fn.getFavListBody();

    if(typeof _oTBody === "undefined"){
        return;
    }
    

    //즐겨찾기 아이콘 항목을 기준으로 list 구성.
    for (let i = 0, l = aFavIconList.length; i < l; i++) {

        let _sFavIconList = aFavIconList[i];
        
        let _oRow = document.createElement("tr");

        //현재 아이콘 라인 데이터를 dom에 매핑 처리.
        _oRow._sFavIconList = _sFavIconList;

        
        _oRow.classList.add("table-row");

        //더블클릭 이벤트 등록.
        // _oRow.addEventListener("dblclick", oAPP.onDblclickFavList);

        _oRow.ondblclick = oAPP.onDblclickFavList;

        _oTBody.appendChild(_oRow);


        //아이콘 이미지 출력 TD 생성.
        let _oIconImgCell = document.createElement("td");

        _oIconImgCell.classList.add("table-cell");

        _oRow.appendChild(_oIconImgCell);


        let _oIConImgSpan = document.createElement("span");

        //아이콘 출력 
        _oIConImgSpan.setAttribute("data-sap-ui-icon-content", _sFavIconList.content);

        //아이콘 출력을 위한 css 설정.
        _oIConImgSpan.classList.add("sapUiIcon");

        //아이콘 출력 font family 구성.
        _oIConImgSpan.style.fontFamily = _sFavIconList.fontFamily;

        //아이콘 크기 설정.
        _oIConImgSpan.style.fontSize = "35px";

        _oIconImgCell.appendChild(_oIConImgSpan);




        //아이콘 명 출력 TD 생성.
        let _oIconTextCell = document.createElement("td");

        _oIconTextCell.classList.add("table-cell");

        _oIconTextCell.innerText = _sFavIconList.ICON_NAME;

        _oRow.appendChild(_oIconTextCell);



        //아이콘 복사 cell 생성.
        let _oIconCopyCell = document.createElement("td");

        _oIconCopyCell.classList.add("table-cell");

        _oIconCopyCell.style.width = "50px";

        _oRow.appendChild(_oIconCopyCell);


        //아이콘 명 복사 버튼 생성.
        let _oCopyButton = document.createElement("button");

        //현재 아이콘 라인 데이터를 dom에 매핑 처리.
        _oCopyButton._sFavIconList = _sFavIconList;

        _oCopyButton.classList.add("theme-button");

        //버튼 클릭 이벤트 등록.
        _oCopyButton.onclick = oAPP.onClipBoardTextCopy;

        //TR 태그에 구성된 더블클릭과 이벤트 전파 방지를 위해 DUMMY 더블클릭 이벤트 등록 처리.
        _oCopyButton.ondblclick = function(){
            event.stopPropagation();
        };


        let _oCopyIcon = document.createElement("span");

        //버튼 아이콘 생성.
        _oCopyIcon.setAttribute("data-sap-ui-icon-content", "\ue245");
        
        _oCopyIcon.classList.add("sapUiIcon");

        _oCopyIcon.style.fontFamily = "SAP-icons";

        _oCopyIcon.style.cursor = "pointer";

        _oCopyButton.appendChild(_oCopyIcon);        

        

        _oIconCopyCell.appendChild(_oCopyButton);

        
    }

};




/*********************************************************
 * @event - 즐겨찾기 아이콘 리스트 더블클릭 이벤트.
 ********************************************************/
oAPP.onDblclickFavList = function(oEvent){

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // //버튼 클릭에서 발생한 더블클릭 방지 타이머가 종료되지 않은경우 exit.
    // if(typeof oAPP.attr.clickTimmer !== "undefined"){
    //     return;
    // }

    //라인 데이터가 존재하지 않는경우 exit.
    if(typeof oEvent?.currentTarget?._sFavIconList === "undefined"){
        return;
    }

    let _sParam = {};

    //즐겨찾기 아이콘 리스트 라인 선택 액션코드.
    _sParam.ACTCD = "FAV_ICON_LIST_SEL_LINE";

    //선택한 라인 데이터 매핑.
    _sParam.sList = oEvent.currentTarget._sFavIconList;


    //즐겨찾기 팝업으로 데이터 전송 처리.
    oAPP.fn.sendDataToParent(_sParam);
    

};


/*********************************************************
 * @event - 아이콘 이름 복사 버튼 선택 이벤트.
 ********************************************************/
oAPP.onClipBoardTextCopy = async function(oEvent){
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    let _sFavIconList = oEvent?.currentTarget?._sFavIconList;

    // await new Promise(function(resolve){
    //     oAPP.attr.clickTimmer = setTimeout(function(){
    //         delete oAPP.attr.clickTimmer;
    //         resolve();
    //     },300);
    // });
       
    //라인 데이터가 존재하지 않는경우 exit.
    if(typeof _sFavIconList === "undefined"){
        return;
    }

    let _sParam = {};

    //즐겨찾기 아이콘 클립보드 카피 처리.
    _sParam.ACTCD = "FAV_ICON_CLIP_TXT_COPY";

    //선택한 라인 데이터 매핑.
    _sParam.sList = _sFavIconList;


    //즐겨찾기 팝업으로 데이터 전송 처리.
    oAPP.fn.sendDataToParent(_sParam);


};