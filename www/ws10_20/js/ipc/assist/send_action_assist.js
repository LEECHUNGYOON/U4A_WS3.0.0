/*******************************************************
 * [send_action_assist.js]
 *******************************************************
 * - IPC로 ACTION 코드별 명령어 수행
 *******************************************************/



 
/*******************************************************
 * main scope의 busy and lock 설정
 *******************************************************/
export function SETBUSYLOCK(oEvent, oPARAM){

    if(typeof oPARAM?.ISBUSY === "undefined"){
        return;
    }

    console.log("ipc busy");

    oAPP.common.fnSetBusyLock(oPARAM.ISBUSY);
    
} // end of SETBUSYLOCK

/*******************************************************
 * 브로드 캐스트 Busy
 *******************************************************/
export function BROAD_BUSY(oEvent, oPARAM){

    if(!oAPP.attr.oMainBroad){
        return;
    }

    if(typeof oPARAM?.PRCCD === "undefined"){
        return;
    }

    // 전체 자식 윈도우에 Busy 킨다.
    oAPP.attr.oMainBroad.postMessage({PRCCD: oPARAM.PRCCD});

} // end of BROAD_BUSY