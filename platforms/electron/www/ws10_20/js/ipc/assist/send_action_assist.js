/*******************************************************
 * [send_action_assist.js]
 *******************************************************
 * - IPC로 ACTION 코드별 명령어 수행
 *******************************************************/
 let oExport = {};



/*******************************************************
 * main scope의 busy and lock 설정
 *******************************************************/
oExport.SETBUSYLOCK = function(oEvent, oPARAM){
    
    console.log("yy");

    if(typeof oPARAM?.ISBUSY == "undefined"){
        return;
    }

    parent.setBusy(oPARAM.ISBUSY);

 }; // end of oExport.SETBUSYLOCK






















 module.exports = oExport;