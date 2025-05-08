/**
 * @title 
 * USP Code Editor ContextMenu
 * 
 * @description 
 * 에디터 테마 변경 메뉴
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


export function exports(IF_DATA){



}