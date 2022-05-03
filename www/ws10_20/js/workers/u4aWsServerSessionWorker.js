/**************************************************************************
 * u4aWsServerSessionWorker.js
 * ************************************************************************
 * - Server Session Worker
 **************************************************************************/

self.onmessage = function(e) {
    
    var receiveData = e.data;

    if(this.workTimeout){
        clearInterval(this.workTimeout);
        this.workTimeout = null;
    }

    this.workTimeout = setInterval(() => {
        postMessage('X');
    }, receiveData);
	
};