

module.exports = async function(oIF_DATA){

    // 여기는 DISCONNECT 에 대한 모듈이야!

    let sCallbackId = oIF_DATA.CB_ID;

    let oAI_IF_MAP = parent.getAiIfMap();

    let oEventTarget = oAI_IF_MAP.get(sCallbackId);    
    if(!oEventTarget){
        return;
    }

    let oCustomEvent = new CustomEvent(sCallbackId, { detail: oIF_DATA });

    oEventTarget.dispatchEvent(oCustomEvent);

};