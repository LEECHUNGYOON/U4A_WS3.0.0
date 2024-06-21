const
    REMOTE = parent.REMOTE,

    //WS 3.0메인 윈도우 객체.
    CURRWIN = REMOTE.getCurrentWindow();


//디자인상세화면(20화면) <-> BINDPOPUP 통신 채널 키 정보 구성.
//(브라우저창의 세션키 + 디자인상세화면(20화면) + bindpopup)
const C_CHID = `${CURRWIN.webContents.getWebPreferences().browserkey}_ws20_bindpop`;
console.log(C_CHID);

/*************************************************************
 * @class - 디자인상세화면(20화면) <-> BINDPOPUP 통신을 위한 CLASS.
 *************************************************************/
class CL_WS20_BINDPOPUP{

    static oChannel = undefined;

    //디자인상세화면(20화면) <-> BIND POPUP 통신을 위한 broadcast Channel생성.
    static createChannel = function () {
        
        this.oChannel = new BroadcastChannel(C_CHID);

        //MESSAGE 이벤트 구성.
        this.oChannel.onmessage = function(oEvent) {
            
        };

    };


    //BIND POPUP에 데이터 전송 처리.
    static sendPostMessage = function (oData) {

        var _sRes = {RETCD:"", RTMSG:""};

        if(typeof this.oChannel === "undefined"){

            _sRes.RETCD = "E";
            _sRes.RTMSG = "";
            return _sRes;
        }

        return _sRes;
        
    };


}

/*************************************************************
 * @module - 
 *************************************************************/
module.exports = function(ACTCD, oData){

    switch (ACTCD) {
        case "CHANNEL-CREATE":
            //채널 생성.
            CL_WS20_BINDPOPUP.createChannel(oData);
            break;

        case "SEND":
            //BIND POPUP에 데이터 전송 처리.
            return CL_WS20_BINDPOPUP.sendPostMessage(oData);

        case "CHANNEL-CLOSE":
            //broadcast Channel 종료처리.
            break;
    
        default:
            break;
    }    

};