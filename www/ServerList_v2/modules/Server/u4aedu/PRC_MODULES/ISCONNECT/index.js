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

    // 이미 연결되어 있는 경우
    if(oAPP.oStream){

        // 이미 연결 되어 있음.
        _oRES.RETCD = "S";

        oStream.end(JSON.stringify(_oRES));

        return;

    }

    // 연결되어 있지 않음.
    _oRES.RETCD = "E";
    
    oStream.end(JSON.stringify(_oRES));    

};