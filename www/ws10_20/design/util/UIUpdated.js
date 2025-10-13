export async function UIUpdated(){

    return new Promise(function(resolve){
        
        async function _updatedCallback(){
            
            //UI UPDATED 이벤트 제거.
            _oRendering.detachUIUpdated(_updatedCallback);
            
            resolve();
            
        }
            
        let _oRendering = sap.ui.requireSync('sap/ui/core/Rendering');
        
        //UI가 화면에 충분히 그려질때까지 대기 처리 이벤트 등록 처리.
        _oRendering.attachUIUpdated(_updatedCallback);
            

    });

};