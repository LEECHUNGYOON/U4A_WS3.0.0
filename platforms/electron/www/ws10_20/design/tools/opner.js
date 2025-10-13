(()=>{

    //처리결과 메시지 구조.
    const TY_RES = {
        RETCD : "",
        RTMSG : ""
    };


    /*********************************************************
     * @function - 대상 UI의 추가될 aggregation 정보 얻기.
     * @param {sSource} - 부모에 추가할 UI 라인 정보.
     * @param {sTarget} - UI가 추가될 부모 라인 정보
     ********************************************************/
    oAPP.fn.aggrSelectPopupOpener = function(sSource, sTarget, sPos){

        return new Promise(async function (resolve) {

            //aggregation 선택 팝업이 로드되지 않은경우.
            if(typeof oAPP.fn.aggrSelectPopup === "undefined"){

                //UI 추가 팝업 정보가 존재하지 않는다면 JS 호출 후 팝업 호출.
                await new Promise(function(resJSLoad){

                    oAPP.fn.getScript("design/js/aggrSelectPopup",function(){
                        resJSLoad();
                    });

                });

            }


            //aggregation 선택 팝업 호출.
            oAPP.fn.aggrSelectPopup(sSource, sTarget, function(sAggr, sChild, sParent){
                
                parent.setBusy("X");

                //단축키 잠금 처리.
                oAPP.fn.setShortcutLock(true);

                let _sRes = {...TY_RES};

                _sRes.sAggr   = sAggr;
                _sRes.sChild  = sChild;
                _sRes.sParent = sParent;
                
                resolve(_sRes);

            }, sPos?.x, sPos?.y, function(sRes){
                //취소시 전달받은 파라메터 정보 RETURN.
                resolve(sRes);

            });
            
        });

    };


})();