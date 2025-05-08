/**
 * @title 
 * USP Code Editor Snippet Designer
 * 
 * @description 
 * 에디터 스니펫 디자이너
 */


// 접속 서버 정보
const SERVER_INFO = parent.getServerInfo();


export function exports(IF_DATA){

    let oPARAM = {
        scopeCode: "usp_main"
    };

    oAPP.fn.openMonacoSnippetDesigner(oPARAM);

}