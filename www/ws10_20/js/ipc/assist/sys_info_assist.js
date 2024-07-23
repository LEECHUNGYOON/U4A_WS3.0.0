/*******************************************************
 * [sys_info_assist.js]
 *******************************************************
 * - IPC로 System 접속 관련 정보 구하는 Module
 *******************************************************/
let oExport = {};


/*******************************************************
 * 로그인 정보
 *******************************************************/
oExport.USER_LOGIN_INFO = function(oEvent, oPARAM){
    
    let USER_LOGIN_INFO = parent.process.USERINFO;

    oEvent.sender.send(oPARAM.TO_CHID, USER_LOGIN_INFO);

}; // end of oExport.USER_LOGIN_INFO

/*******************************************************
 * 로그인 사용자 접속 관련 정보
 *******************************************************/
oExport.USER_INFO = function(oEvent, oPARAM){

    let USER_INFO = parent.getUserInfo();

    oEvent.sender.send(oPARAM.TO_CHID, USER_INFO);

}; // end of oExport.USER_INFO


/*******************************************************
 * 설정된 테마 정보
 *******************************************************/
oExport.THEME_INFO = function(oEvent, oPARAM){

    let THEME_INFO = parent.getThemeInfo();

    oEvent.sender.send(oPARAM.TO_CHID, THEME_INFO);

}; // end of oExport.THEMEINFO


/*******************************************************
 * 서버 호스트 정보
 *******************************************************/
oExport.SERVER_HOST = function(oEvent, oPARAM){

    let SERVER_HOST = parent.getHost();

    oEvent.sender.send(oPARAM.TO_CHID, SERVER_HOST);

}; // end of oExport.SERVER_HOST


/*******************************************************
 * 서버 경로 정보
 *******************************************************/
oExport.SERVER_PATH = function(oEvent, oPARAM){

    let SERVER_PATH = parent.getServerPath();

    oEvent.sender.send(oPARAM.TO_CHID, SERVER_PATH);

}; // end of oExport.SERVER_PATH


module.exports = oExport;