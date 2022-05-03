/**************************************************************************
 * u4aWsClientSessionWorker.js
 * ************************************************************************
 * - Client Session Worker
 **************************************************************************/

self.onmessage = function(e) {
    
    var receiveData = e.data;

    // 분을 밀리초로 변환
    // 예) 1분 -> 1분 * 60초 = 60초 -> 60초 * 1000 밀리초 = 60,000 밀리초

    receiveData *= 60;
    receiveData *= 1000;
    
    // console.log(receiveData);

    if(this.workTimeout){
        clearTimeout(this.workTimeout);
        this.workTimeout = null;
    }

    this.workTimeout = setTimeout(function(){
        postMessage('X');
    }, receiveData);
	
};