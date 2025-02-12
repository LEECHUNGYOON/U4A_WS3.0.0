 // 공통 응답 구조
 let _TY_RES = {
    RETCD: "",
    PRCCD: "",
    ERRCD: "",
    RDATA: ""
};

// 연결 해제 여부에 대한 플래그
let _bIsDiscon = false;

module.exports = async function(oStream, oIF_DATA){  

    // 연결 해제 여부에 대한 플래그 초기화
    _bIsDiscon = false;

    // 연결 해제에 대한 AbortController
    oAPP.DISCON_ABORT = new AbortController();

    // 연결이 끊어졌는지에 대한 About 이벤트
    oAPP.DISCON_ABORT.signal.addEventListener('abort', () => { 

        _bIsDiscon = true;
        
        delete oAPP.DISCON_ABORT;

    });
    
    // 응답 구조 복사
    let _oRES = JSON.parse(JSON.stringify(_TY_RES));

    _oRES.PRCCD = oIF_DATA.PRCCD;

    // 기존에 연결된 클라이언트가 존재할 경우 오류
    if(oAPP.oStream){

        // 이미 연결되어 있는 클라이언트인지 확인
        if(oAPP.oStream.CONID === oIF_DATA.CONID){

            // 오류 리턴
            _oRES.RETCD = "E";
            _oRES.ERRCD = "AIE05"; // 같은 CONID로 연결을 할 경우(이미 연결된 경우)

            // 연결을 끊는다.
            oStream.end(JSON.stringify(_oRES));

            return;
        }

        // 오류 리턴
        _oRES.RETCD = "E";
        _oRES.ERRCD = "AIE04"; // 기존에 다른쪽에서 연결 중이라 신규 연결 불가
        _oRES.RDATA = {
            CURR_CONID: oAPP.oStream.CONID // 현재 연결되어 있는 브라우저의 session key
        };
        
        // 연결을 끊는다.
        oStream.end(JSON.stringify(_oRES));
        
        return;

    }
  
   
    /*****************************************************************
     * 접속 정보 관련 설정
     *****************************************************************/

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }

    // // 메인 뷰 Object
    // let _oVW_MAIN = oAPP?.oChildAPP?.views?.VW_MAIN || undefined;
    // if(!_oVW_MAIN){
    //     return;
    // }

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }

    // // 메인 뷰의 모델
    // let _oMainModel = _oVW_MAIN?.oModel || undefined;
    // if(!_oMainModel){
    //     return;
    // }

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }
    
    // // 메인 뷰의 모델 데이터
    // let _oMainModelData = _oMainModel?.oData || undefined;
    // if(!_oMainModelData){
    //     return;
    // }

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }   

    // // 각 화면에 연결에 대한 flowEvent 를 호출한다.
    // await oAPP.fn.onConnectAI(oIF_DATA.PARAM);   

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }

    // // 접속 연결 정보
    // _oMainModelData.S_CONN_INFO = oIF_DATA.PARAM;

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }     

    // _oMainModel.refresh();

    // // 이순간에 연결 해제되었다면 빠져나감.
    // if(_bIsDiscon){
    //     return;
    // }

    /**
     * - 스트림 객체에도 연결 정보 저장.
     * 
     * 이미 연결된 상태에서 다른 쪽에서 연결 시도 시 oStream.end()를 사용해서 해당 연결을 끊어주는데..
     * 
     * end() 메소드 수행을 할 때 close 이벤트가 발생된다.
     * 
     * close 메소드에서 전역 변수의 연결 정보를 삭제 할지 말지 체크를 해야하는데
     * 
     * oStream 객체에 CONID가 없으면 전역 변수를 지울지 말지 판단을 하기 위한 용도.
     *                              
     */                  
    oStream.CONID = oIF_DATA.CONID;

    oAPP.oStream = oStream;

    // 연결 성공!!
    _oRES.RETCD = "S";    

    oStream.write(JSON.stringify(_oRES));

    // // 연결 상태 변경
    // _oVW_MAIN.fn.setAiConnState(true);

    // // 연결 해제 팝업을 닫는다.
    // _oVW_MAIN.fn.showDisConnectPopup(false);
    
    console.log("connect success!!");
  
};