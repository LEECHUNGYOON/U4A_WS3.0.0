
/**
 * @title 
 * USP Code Editor Theme Designer
 * 
 * @description 
 * 에디터 테마 변경 팝업
 */

// 접속 서버 정보
const SERVER_INFO = parent.getServerInfo();
const SYSID = SERVER_INFO.SYSID;


export function exports(IF_DATA){

    let oPARAM = {
        scopeCode: "usp_main"
    };

    // 모나코 에디터 테마 디자이너 팝업 실행
    oAPP.fn.openMonacoThemeDesigner(oPARAM);

}