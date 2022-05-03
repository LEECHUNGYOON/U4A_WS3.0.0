// worker 메시지 수신 listener
self.onmessage = function(e) {
	
    var receiveData = e.data;
	if(receiveData.isActive == false){
		if(this.workInterval){
			 clearInterval(this.workInterval);
			 this.workInterval = null;
		}
	}

	var iTime = receiveData.keeptime * 60000;
	
    // 1초 후에 호출한 페이지에 데이터를 보낸다.
    this.workInterval = setInterval(function() {
        postMessage('X');
    }, iTime );
	
};