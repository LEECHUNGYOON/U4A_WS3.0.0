// 공통 응답 구조
let _TY_RES = {
    RETCD: "",
    PRCCD: "",
    ERRCD: "",
    RDATA: ""
};

module.exports = function(oStream, oIF_DATA){


    // 응답 구조 복사
    let _oRES = JSON.parse(JSON.stringify(_TY_RES));

    // PRC 정의
    _oRES.PRCCD = oIF_DATA.PRCCD;

    // 응답할 스트림 객체가 없다면 빠져나간다.
    if(!oAPP.oStream){
        return;
    }

    _oRES.RDATA = oIF_DATA.RDATA;

    oStream.write(JSON.stringify(_oRES));

};