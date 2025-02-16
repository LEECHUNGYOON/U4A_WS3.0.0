const TY_RES = {
    PRCCD: "",      // 수행중인 프로세스 코드
    ACTCD: "",      // 수행중인 행위에 대한 코드
    RETCD: "",      // 수행 결과에 대한 코드
    STCOD: "",      // 수행 결과에 대한 상태 코드    
    RTMSG: "",      // 수행 결과에 대한 메시지 
    RDATA: "",      // 수행 결과에 대한 데이터
};

module.exports = async function(oStream, oIF_DATA){  

    // 응답 구조 복사
    let _oRES = JSON.parse(JSON.stringify(TY_RES));

    _oRES.PRCCD = oIF_DATA.PRCCD;

    // 연결 성공!!
    _oRES.RETCD = "S";    

    oStream.write(JSON.stringify(_oRES));
    
    console.log("connect success!!");
  
};