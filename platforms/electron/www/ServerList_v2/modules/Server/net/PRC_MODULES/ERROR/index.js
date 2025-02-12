/**
 * 😢 오류 코드별 내용은 code_info.txt 참조!! 
 */

// 공통 응답 구조
let _TY_RES = {
    RETCD: "",
    PRCCD: "",
    ERRCD: "",
    RDATA: ""
};

module.exports = function(oStream, oRES){

    // // 응답 구조 복사
    // let _oRES = JSON.parse(JSON.stringify(_TY_RES));

    oStream.end(JSON.stringify(oRES));

};