/*******************************************************
 * [send_action_assist.js]
 *******************************************************
 * - IPC로 ACTION 코드별 명령어 수행
 *******************************************************/





/*******************************************************
 * main scope의 busy and lock 설정
 *******************************************************/
export function SETBUSYLOCK(oEvent, oPARAM){

    if(typeof oPARAM?.ISBUSY == "undefined"){
        return;
    }

    console.log("ipc busy");

    oAPP.common.fnSetBusyLock(oPARAM.ISBUSY);
    
}