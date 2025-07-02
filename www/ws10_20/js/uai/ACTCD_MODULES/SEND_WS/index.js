module.exports = async function(oAPP, oIF_DATA){

    parent.CURRWIN.show();
    parent.CURRWIN.focus(); 
    
    let sTargetPage = oIF_DATA?.TARPG || "";

    // 현재 페이지 정보
    let sCurrPage = parent.getCurrPage();

    // 현재 페이지와 전달받은 파라미터 중 타겟 페이지가 WS20 페이지가 아닌 경우 빠져나감
    if(sTargetPage !== "WS20" || sCurrPage !== "WS20"){
        return;
    }

    
    // !!! hide 상태일 때만 !!!!!!!
    // ai 있는 위치의 모니터 가운데.. 출력
    // ai 던질때 스크린 정보를 던지면 됨..
    let bCurrWinVisi = CURRWIN.isVisible();
    if(!bCurrWinVisi){

        let oPrevBounds = oIF_DATA?.PREV_BOUNDS || undefined;
        if(oPrevBounds){

            // 현재 ws3.0 윈도우를 AI 미리보기 창이 있는 브라우저로 이동시킨다.




        }


    }    

    let oPARAM = oIF_DATA.PARAM;

    // 리턴 필드 구조
    // RETCD, RTMSG
    var oResult = await require(PATH.join(oAPP.oDesign.pathInfo.designRootPath, "UAI", "parseAiLibraryData.js"))(oPARAM, oAPP);

};