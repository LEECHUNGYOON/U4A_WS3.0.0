(function(){
    "use strict";
    
    if(typeof oAPP === "undefined"){ 
        window.oAPP = {}; 
    };

    if(!oAPP.fn){
        oAPP.fn = {};
    }

    /*******************************************************
     * @function - 선택한 items 들을 LocalStorage에 저장
     *******************************************************/
    oAPP.fn.setSaveSelectedItemsLocal = function(sKey, aData){

        if(!sKey || Array.isArray(aData) === false){
            return;
        }

        let sSavedList = localStorage.getItem(sKey);

        try {

            /* 기존에 저장된 데이터를 구한다. */
            var aSavedList = JSON.parse(sSavedList);

        } catch (error) {
            aSavedList = [];
        }

        /* 기존에 저장된 데이터가 없을 경우 전달받은 데이터를 저장한다. */
        if(!aSavedList || (Array.isArray(aSavedList) === true && aSavedList.length === 0)){

            let aSaveData = aData.filter(e => e?.selected === true);

            localStorage.setItem(sKey, JSON.stringify(aSaveData));

            return;

        }

        /* 기 저장된 데이터 복사 */
        let aSaveTarget = JSON.parse(JSON.stringify(aSavedList));

        /* 삭제 대상 */
        let aDelTarget = aData.filter(e => e?.selected === false);
        if(aDelTarget && Array.isArray(aDelTarget) === true && aDelTarget.length !== 0){

            /*  기존에 저장된 데이터 중 삭제 대상건을 지운다 */
            for(const oDelData of aDelTarget){

                let iDelDataIdx = aSaveTarget.findIndex(e => e?.text === oDelData?.text);
                if(iDelDataIdx > -1){
                    aSaveTarget.splice(iDelDataIdx, 1);
                    continue;
                }

            }

        }

        /* 저장 대상 */
        let aSaveData = aData.filter(e => e?.selected === true);
        if(aSaveData && Array.isArray(aSaveData) === true && aSaveData.length !== 0){

            /* 저장 대상 중 기 저장된 데이터에 포함되지 않은 데이터만 push 한다. */
            for(const oSaveData of aSaveData){

                let oFindData = aSaveTarget.find(e => e?.text === oSaveData?.text);
                    if(oFindData){
                    continue;
                }

                aSaveTarget.push(oSaveData);
            }

        }

        localStorage.setItem(sKey, JSON.stringify(aSaveTarget));

    }; // end of oAPP.fn.setSaveSelectedItemsLocal

})();