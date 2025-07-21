/****************************************************************************
 * 🔥 Global Variables
 ****************************************************************************/



/****************************************************************************
 * 🔥 Private functions
 ****************************************************************************/



/****************************************************************************
 * 🔥 Modules Start !!!
 ****************************************************************************/
module.exports = async function(oIF_DATA){

    // 안녕? 여기는 WS 10 모듈이야
        
  
    // 요청 데이터의 PRCCD 코드별 호출 분기
    try {

        // PRC_MODULES 폴더를 ROOT로 해서 하위 PRC별 프로세스 수행        
        let _sModulePath = parent.PATH.join(parent.PATHINFO.JS_ROOT, "uai", "PRC_MODULES", oIF_DATA.PRCCD, oIF_DATA.ACTCD, "index.js");

        require(_sModulePath)(oIF_DATA);

    } catch (oError) {

        var sErrcode = "PRC-WS_10-E001";

        console.error(sErrcode, oError);

        // [MSG]
        var _sErrMsg = `[${sErrcode}] 외부에서 잘못된 요청을 수행하였습니다.`;

        parent.showMessage(oAPP.oChildApp.sap, 20, "E", _sErrMsg);

        return;

    }

};