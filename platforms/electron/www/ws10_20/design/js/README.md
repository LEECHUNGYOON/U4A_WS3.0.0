#WS_20에서 사용하는 기능 function 항목
1.  oAPP.fn.expandTreeItem - design tree의 선택한 라인을 펼치는 기능
    사용 예시

        선택된 라인을 펼침처리.        
        oAPP.fn.expandTreeItem();



2.  oAPP.fn.getTreeData - OBJECT ID에 해당하는 라인 정보를 얻는 기능
    사용 예시

        BUTTON1에 해당하는 TREE 라인 데이터 얻기.
        var _sTree = oAPP.fn.getTreeData("BUTTON1");



3.  oAPP.fn.setSelectTreeItem - design tree의 특정 UI를 선택 처리.
    사용 예시

        BUTTON1을 선택 처리.
        oAPP.fn.setSelectTreeItem("BUTTON1"); 

        BUTTON1을 선택 하면서 ATTRIBUTE 영역의 text Property를 선택.
        oAPP.fn.setSelectTreeItem("BUTTON1", "AT000002730");



4. oAPP.fn.designGetSelectedTreeItem - 선택한 라인의 design tree 라인 정보 얻기.
    사용 예시

        var _sTree = oAPP.fn.designGetSelectedTreeItem();