const { screen } = REMOTE.require('electron');

/**
 * 윈도우의 전체 크기를 기준으로, 모니터의 정확한 중앙에 윈도우가 위치하도록 x, y를 보정함
 * 
 * @param {Electron.Rectangle} parentBounds - 기준이 될 윈도우 bounds (보통 getBounds())
 * @param {number} width - 자식 윈도우 또는 새 윈도우의 너비
 * @param {number} height - 자식 윈도우 또는 새 윈도우의 높이
 * @returns {{ x: number, y: number, width: number, height: number }} - 정확히 중앙에 위치한 bounds
 */
function _getBoundsToCenterOfMonitor(parentBounds, width, height) {
    if (!parentBounds || !Number.isFinite(width) || !Number.isFinite(height)) {
        return;
    }

    const display = screen.getDisplayMatching(parentBounds);
    const { x: monX, y: monY, width: monW, height: monH } = display.workArea;

    const centeredX = Math.floor(monX + (monW - width) / 2);
    const centeredY = Math.floor(monY + (monH - height) / 2);

    return {
        x: centeredX,
        y: centeredY,
        width,
        height
    };
}


/*************************************************************
 * @function - AI의 미리보기가 실행되고 있는 모니터의 가운데에 배치
 *************************************************************/
function _moveWindowToAiMonitorCenter(oPrevBounds){ 
 
    let oCurrBounds = CURRWIN.getBounds();

    let oBoundsResult = _getBoundsToCenterOfMonitor(oPrevBounds, oCurrBounds.width, oCurrBounds.height);
    if(!oBoundsResult){
        return;
    }    

    let oBounds = {
        x: oBoundsResult.x,
        y: oBoundsResult.y,
        width: oBoundsResult.width,
        height: oBoundsResult.height
    };

    CURRWIN.setBounds(oBounds);

} // end of _setMovePosAiWinMonitor

module.exports = async function(oAPP, oIF_DATA){
    
    let sTargetPage = oIF_DATA?.TARPG || "";

    // 현재 페이지 정보
    let sCurrPage = parent.getCurrPage();

    // 현재 페이지와 전달받은 파라미터 중 타겟 페이지가 WS20 페이지가 아닌 경우 빠져나감
    if(sTargetPage !== "WS20" || sCurrPage !== "WS20"){
        return;
    }

    // 3.0 브라우저가 숨어져 있을 수 있으므로 최상단에 위치시킨다.
    CURRWIN.setAlwaysOnTop(true);

    // 현재 브라우저가 활성화 or 작업표시줄에 있을 경우에는
    // 현재 브라우저를 활성화 시키면서 AI의 미리보기 창이 있는 모니터로 이동시킨다.
    if(CURRWIN.isVisible() === false || CURRWIN.isMinimized() === true){
        
        // 현재 윈도우를 먼저 활성화 시켜준 다음에 3.0 윈도우를 이동시켜야 정확하게 이동됨
        parent.CURRWIN.show();
        parent.CURRWIN.focus();

        // AI의 미리보기 브라우저의 위치 정보
        let oPrevBounds = oIF_DATA?.PREV_BOUNDS || undefined;
        if(oPrevBounds){

            // 현재 ws3.0 윈도우를 AI 미리보기 창이 있는 브라우저로 이동시킨다.
            _moveWindowToAiMonitorCenter(oPrevBounds);

        }

    }

    // 3.0이 다른창에 숨어져 있을 수 있으므로 여기서 활성화 및 포커스를 줌
    parent.CURRWIN.show();
    parent.CURRWIN.focus();

    // 사용자가 브라우저 최상위 고정 핀을 박았다면 setAlwaysOnTop을 원복 시키지 않음
    if(oAPP.common.fnGetModelProperty("/SETTING/ISPIN") !== true){
        CURRWIN.setAlwaysOnTop(false);
    }
    

    // let oPARAM = {
    //     ACTCD: "",
    //     RETCD: "",
    //     RTMSG: "",
    //     T_0014: [],
    //     T_0015: [],
    //     oAPP: oAPP
    // };

    let oPARAM = oIF_DATA.PARAM;
        oPARAM.oAPP = oAPP;

    // 리턴 필드 구조
    // RETCD, RTMSG
    // var oResult = await require(PATH.join(oAPP.oDesign.pathInfo.designRootPath, "UAI", "parseAiLibraryData.js"))(oPARAM, oAPP);


    // [TO-BE]
    var oResult = await require(PATH.join(oAPP.oDesign.pathInfo.designRootPath, "UAI", "parseAiLibraryData.js"))(oPARAM);

};