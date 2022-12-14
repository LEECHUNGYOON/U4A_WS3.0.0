/**************************************************************************
 * u4aWsServerSessionWorker.js
 * ************************************************************************
 * - Server Session Worker
 **************************************************************************/

self.onmessage = function(e) {

    const iSessionTimeMinute = 10;

    var iSessionTime = iSessionTimeMinute * 60 * 1000;
    var oReceiveData = e.data,
        sServerPath = oReceiveData.SERVPATH;

    if (this.workTimeout) {
        clearInterval(this.workTimeout);
        this.workTimeout = null;
    }

    this.workTimeout = setInterval(() => {

        this.sendAjax(sServerPath);

    }, iSessionTime);

    this.sendAjax = (sServerPath) => {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() { // 요청에 대한 콜백
            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면

                if (xhr.status === 200 || xhr.status === 201) {

                    var sRes = xhr.response;

                    // // 로그아웃 버튼으로 호출 된 경우
                    // if (sRes == "") {

                    //     self.postMessage("");
                    //     // 로그오프 성공시 타는 펑션
                    //     // fn_logoff_success();

                    //     return;

                    // }

                    let oResult,
                        sMsg;

                    try {

                        oResult = JSON.parse(sRes);

                    } catch (error) {

                        //1. 전체 다 닫는다.
                        self.postMessage({
                            RETCD: "E",
                            RTMSG: error.toString()
                        });

                        return;
                    }

                    // 세션이 이미 날라간 경우
                    // SSO 만료일 경우.
                    // 로그인 쪽으로 왔을 경우.
                    if (oResult.TYPE == "E") {

                        // 세션 유지한다고 [/dummycall] 하다가 세션 죽어서 로그인 쪽으로 온 경우.
                        if (oResult.ACTCD && oResult.ACTCD == "002") {

                            sMsg = "[Err code: " + oResult.ACTCD + "] " + oResult.MSG;

                            //1. 전체 다 닫는다.
                            self.postMessage({
                                RETCD: "E",
                                RTMSG: sMsg
                            });

                            return;

                        }

                        sMsg = "[Err code: " + oResult.ACTCD + "] " + oResult.MSG;

                        //1. 전체 다 닫는다.
                        self.postMessage({
                            RETCD: "E",
                            RTMSG: sMsg
                        });

                        return;

                    }

                    console.log("server call: " + new Date());

                } else {

                    //1. 전체 다 닫는다.
                    self.postMessage({
                        RETCD: "E",
                        RTMSG: "connection fail!"
                    });

                }

            }

        };

        xhr.open('GET', sServerPath); // 메소드와 주소 설정
        xhr.send();

    } // end of ajax_logoff

    this.sendAjax(sServerPath);

};