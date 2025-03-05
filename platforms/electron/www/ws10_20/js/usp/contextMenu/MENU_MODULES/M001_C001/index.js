
/**
 * @title 
 * USP Code Editor ContextMenu
 * 
 * @description 
 * 에디터 주석 색상 변경 메뉴
 * 
 * 
 * @notice
 * #### 해당 모듈 영역에서 사용하는 this 객체는 UI5 scope임 #####
 * 
 * - 해당 모듈을 호출할 당시에 GlobalThis를 scope chain으로 호출함
 * (참고 소스: 
 * => www\ws10_20\js\usp\ws_usp_01.js 
 * => oAPP.fn.fnUspPatternContextMenuClick
 * => parent.require(sCtxMenuModuleRootPath).call(globalThis, oPARAM)
 * )
 * 
 * - 예1) 자주 사용하던 oAPP 오브젝트 접근 시,
 *   현재 scope에서는 this.oAPP로 접근하면 됨.
 * 
 * - 예2) UI5 라이브러리를 사용할 경우
 *   this.sap 으로 접근하면 됨.
 */

// 접속 서버 정보
const SERVER_INFO = parent.getServerInfo();
const SYSID = SERVER_INFO.SYSID;


export function exports(oBindData){

    debugger;
    

    let sP13nRootPath = parent.getPath("P13N_ROOT");
    let sUspSettingJsonPath = parent.PATH.join(sP13nRootPath, "usp", "settings.json");    

    let sUspSettings = parent.FS.readFileSync(sUspSettingJsonPath);

    try {

        var oUspSettingsInfo = JSON.parse(sUspSettings);
        
    } catch (error) {
        
        oUspSettingsInfo = {};

    }

    if(!oUspSettingsInfo[SYSID]){
        oUspSettingsInfo[SYSID] = {};
    }

    





//     // 색상 변경 팔레트 팝업부터 띄운다.

//         // 팝업 afterOpen에서..
//             // 기 저장된 주석 색상 메뉴를 구한다.
//                 // 있으면 기본값으로 해당 색상을 표시해준다.

//                 // 없다면 기본값 회색으로 표시한다.


//     // 저장 눌렀을 경우


}