

module.exports = async function(oIF_DATA){

    // 여기는 TEST 에 대한 모듈이야!


    // [MSG]
    var _sErrMsg = `테스트 모듈 호출 성공~!`;

    console.log(oIF_DATA);

    parent.showMessage(oAPP.oChildApp.sap, 20, "S", _sErrMsg);


    var RETURN = {
        PRCCD: "AI",
        ACTCD: "TEST",
        PARAM: {
            OK: "오케"
        }
    }

    var oClient = oIF_DATA.AI_CLIENT;

    // 연결 정보 전달
    oClient.write(JSON.stringify(RETURN));

};