export function MONACO_SNIPPET_CHANGE(oEvent, oRes){

    console.log("IPC_MONACO_SNIPPET_CHANGE");

    // 전체 USP의 모나코 에디터에 PostMessage 를 전송한다.
    oAPP.usp.sendEditorPostMessageAll({ actcd: 'snippet_change' });

}