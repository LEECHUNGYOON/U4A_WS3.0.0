// I/F 필드 정의 
/* ***************************************************************** */
/*
*/
/* ***************************************************************** */
/* ***************************************************************** */
/* 사용 예시 
    var getDesc = require(oAPP.path.join(__dirname, 'SupportPackageUpgrade/index.js'));
    var retdata = await getDesc.getLibDesc(oAPP);
    retdata.RETCD <-- E:오류, S:성공
    retdata.RTMSG <-- 처리 메시지.
    retdata.T_DESC <-- UI ATTRIBUTE의 DESC 정보.
        ([{LIBNM:"sap.m.Input", UIATY:"1", UIATT:"maxLength", UIADT:"int", DEFVL:0, DESCR:"설명"},
          {LIBNM:"sap.m.Input", UIATY:"2", UIATT:"submit", DESCR:"설명"},
          {LIBNM:"sap.m.Input", UIATY:"3", UIATT:"suggestionItems", UIADT:"sap.ui.core.Item", CARDI:"0..n", DESCR:"설명"},
          {LIBNM:"sap.m.Input", UIATY:"4", UIATT:"selectedRow", UIADT:"sap.m.ColumnListItem", CARDI:"0..1", DESCR:"설명"}
        ])
      
*/

/* ***************************************************************** */
/* ***************************************************************** */
/* 내부 광역 변수  
/* ***************************************************************** */



/* ***************************************************************** */
/* Custom Event  
/* ***************************************************************** */



/* ***************************************************************** */
/* 내부 전역 펑션 
/* ***************************************************************** */

const evt_chk_update = new CustomEvent('checking-for-update-SP', {
    detail: {
    message: 'sample message'
    }
});

const evt_update_available = new CustomEvent('update-not-available-SP', {
    detail: {
    message: 'sample message'
    }
});


/* ================================================================= */
/* Export Module Function 
/* ================================================================= */


//업데이트 - 업데이트 점검후 업데이트 가능여부에 따른 파일 다운
// process.resourcesPath 
exports.updater = async function(REMOTE){
    return new Promise((resolve, reject) => {

        var URL = "http://u4arnd.com:8000/zs1?sap-user=shhong&sap-password=2wsxzaq1!";


        const { Octokit } = REMOTE.require("@octokit/core");
        const octokit = new Octokit({ auth:'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' });


        //git sp 시작 폴더 정보 얻기 
        var ROOT = await octokit.request('GET https://api.github.com/repos/hongsungho1/U4A_WS3.0.0_SP/contents/', {
                owner: 'OWNER',
                repo: 'REPO',
                path: 'PATH'

            });

        //버전 파일 read 
        var latest = ROOT.data.filter(e=> e.name === "latest.json");


        //latest.download_url //<-- 이걸 통해서 실제 버젼정보추출


        //패치 버젼 비교후 패치 대상일경우 ..
        

        //파일 다운로드 진행
        //다운로드 경로는 process.resourcesPath //=> C:\\Users\\shhong\\AppData\\Local\\Programs\\com.U4A_API_TEST01.app\\resources
        //패치 폴더 (sp) 생성후 
        //sp 폴더안에 다운로드 처리함 zip 파일 압축 해제 함
        

        //등록처리 로직 =======

        //이전 패치파일 + latest 포함 NAS 서버에 저장


        //git -> 이전 패치파일 + latest 삭제 


        //git 패치파일 + latest 등록


        //완료














        /*
        var URL = "http://u4arnd.com:8000/zs1?sap-user=shhong&sap-password=2wsxzaq1!";
        
        	
        document.addEventListener("checking-for-update-SP", (e)=>{ 
            debugger; 

            //update 여부
            document.dispatchEvent(new CustomEvent('update-not-available-SP', {})); 

        });


        document.addEventListener("update-not-available-SP", (e)=>{ 
            
            debugger; 

        });


        //update 여부
        document.dispatchEvent(new CustomEvent('checking-for-update-SP', {})); 

        */
            

    });
};



