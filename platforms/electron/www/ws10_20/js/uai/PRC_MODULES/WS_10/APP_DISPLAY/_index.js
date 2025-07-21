
const sap = oWS.utill.attr.sap;

module.exports = async function(oIF_DATA){
    
    console.log("AI-APP_DISPLAY");

    // 현재 다른 프로세스가 실행 중인지 체크
    let bIsProcessing = oAPP.oChildApp.common.isProcessRunning();
    if(bIsProcessing){

        // [MSG]
        var sMsg = "진행 중인 프로세스가 완료된 이후에 다시 시도하세요.";

        parent.showMessage(sap, 10, "W", sMsg);

        return;
    }

    // 현재 페이지 정보
    // 해당 프로세스는 WS10 페이지에서만 가능함!!
    let sCurrPage = parent.getCurrPage();
    if(sCurrPage !== "WS10"){

        // [MSG]
        var sMsg = "방금전에 AI 앱에서 요청된 프로세스는 U4A 어플리케이션 메인화면에서만 가능합니다.";

        parent.showMessage(sap, 10, "W", sMsg);

        return;
    }


    let oPARAM = oIF_DATA.PARAM;
    let sAPPID = oPARAM.APPID;

    sap.ui.getCore().byId("AppNmInput").setValue(sAPPID);
    sap.ui.getCore().byId("displayBtn").firePress();    

    // setTimeout(function(){
    //     sap.ui.getCore().byId("AppNmInput").setValue("");
    // }, 0);

};