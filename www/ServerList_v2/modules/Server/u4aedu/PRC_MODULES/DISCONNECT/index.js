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

    _oRES.PRCCD = oIF_DATA.PRCCD;
    _oRES.RETCD = "S";

    oStream.end(JSON.stringify(_oRES));

};