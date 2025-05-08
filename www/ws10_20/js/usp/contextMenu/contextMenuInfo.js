

// WS Setting Json 정보
const WSUTIL = parent.WSUTIL;
const USERINFO = parent.getUserInfo();
const LANGU = USERINFO.LANGU;

// 메시지 정보
var GS_MSG = {};


// [MSG]
// GS_MSG.M001 = WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "296"); // U4A Workspace 버전 정보를 조회 하는 도중에 문제가 발생하였습니다.
// GS_MSG.M001 = "Settings";
// GS_MSG.M002 = "Editor Comment Color";
// GS_MSG.M003 = "Editor Theme";




GS_MSG.M345 = WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "345"); // Theme Designer     // 345
GS_MSG.M346 = WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "346"); // Snippet Designer   // 346
GS_MSG.M368 = WSUTIL.getWsMsgClsTxt(LANGU, "ZMSG_WS_COMMON_001", "368"); // Code Editor Designer; 

// 공통 메뉴 구조
let TY_MENU = {
    "PKEY": "",         // 부모키
    "CKEY": "",         // 자식키
    "TYPE": "",         // 타입 (ROOT: 루트)
    "DESC": "",         // 메뉴명
    "ICON": "",         // 메뉴 아이콘
    // "DATA": "",         // 데이터 (*소스 패턴만 해당)
    "ACTCD": "",
    "ISSTART": false    // 메뉴에 구분선 사용 여부
};


module.exports = function(){       

    let aMenu = [];

    // /**
    //  * Code Editor Setting Menu
    //  */
    // var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    // oMenu.PKEY = "";
    // oMenu.CKEY = "M001";
    // oMenu.TYPE = "ROOT";
    // oMenu.ISSTART = true;
    // oMenu.ICON = "sap-icon://settings";
    // oMenu.DESC = GS_MSG.M001;

    // aMenu.push(oMenu);


    // /**
    //  * Code Editor Comment Color Change
    //  */
    // var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    // oMenu.PKEY = "M001";
    // oMenu.CKEY = "M001_C001";
    // oMenu.TYPE = "";
    // oMenu.ICON = "sap-icon://text-color";
    // oMenu.DESC = GS_MSG.M002;

    // aMenu.push(oMenu);


    // /**
    //  * Code Editor Theme Change
    //  */
    // var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    // oMenu.PKEY = "M001";
    // oMenu.CKEY = "M001_C002";
    // oMenu.TYPE = "";
    // // oMenu.ICON = "sap-icon://palette";
    // oMenu.ICON = "sap-icon://u4a-fw-solid/Brush";
    // oMenu.DESC = GS_MSG.M003;

    // aMenu.push(oMenu);
    

    /**
     ******************************************
     */


    /**
     * Code Editor Designer
     */
    var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    oMenu.PKEY = "";
    oMenu.CKEY = "M001";
    oMenu.TYPE = "ROOT";
    oMenu.ISSTART = true;
    oMenu.ICON = "sap-icon://u4a-fw-solid/Compass Drafting";
    oMenu.DESC = GS_MSG.M368;   // Code Editor Designer

    aMenu.push(oMenu);


    /**
     * Theme Designer
     */
    var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    oMenu.PKEY = "M001";
    oMenu.CKEY = "M001_C001";
    oMenu.TYPE = "";
    oMenu.ICON = "sap-icon://palette";
    oMenu.DESC = GS_MSG.M345;   // Theme Designer

    aMenu.push(oMenu);


    /**
     * Snippet Designer
     */
    var oMenu = JSON.parse(JSON.stringify(TY_MENU));

    oMenu.PKEY = "M001";
    oMenu.CKEY = "M001_C002";
    oMenu.TYPE = "";
    oMenu.ICON = "sap-icon://u4a-fw-solid/Code";
    oMenu.DESC = GS_MSG.M346;   // Snippet Designer

    aMenu.push(oMenu);

    return aMenu;

};