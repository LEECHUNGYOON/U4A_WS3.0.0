const TY_RES = {
    RETCD: "",      // 수행 결과에 대한 코드
    STCOD: "",      // 수행 결과에 대한 상태 코드   
    PRCCD: "",      // 수행중인 프로세스 코드
    ACTCD: "",      // 수행중인 행위에 대한 코드         
    RTMSG: "",      // 수행 결과에 대한 메시지 
    RDATA: "",      // 수행 결과에 대한 데이터
};


module.exports = async function(oStream, oIF_DATA){    

    console.log("OPEN_SERVER", oIF_DATA);

    // 응답 구조 복사
    let _oRES = JSON.parse(JSON.stringify(TY_RES));

    _oRES.PRCCD = oIF_DATA.PRCCD;    

    setTimeout(async function(){
        
        // 전달받은 파라미터
        let oPARAM = oIF_DATA.PARAM;

        // 서버의 SYSID
        let SYSID = oPARAM.SYSID;

        // SSO KEY
        let SSO_KEY = oPARAM.SSO;

        
        _oRES.RETCD = "E";
        
        // 전체 서버리스트 목록을 구한다.
        let aServerList = oAPP.attr.sap.ui.getCore().getModel().getProperty("/ServerList");
        if(!aServerList || Array.isArray(aServerList) === false || aServerList.length === 0){

            // 서버리스트에 등록된 서버 정보가 없습니다.
            _oRES.STCOD = "E001";

            // 응답 후 소캣을 종료한다.
            oStream.end(JSON.stringify(_oRES));

            return;

        }

        // 기 저장된 서버리스트 전체를 구한다.
        let oSavedResult = oAPP.fn.fnGetSavedServerListDataAll();
        if (oSavedResult.RETCD === "E") {

            // 서버리스트에 등록된 서버 정보가 없습니다.
            _oRES.STCOD = "E001";

            // 응답 후 소캣을 종료한다.
            oStream.end(JSON.stringify(_oRES));

            return;

        }

        let aSavedServList = oSavedResult.RETDATA;
        if(!aSavedServList || Array.isArray(aSavedServList) === false || aSavedServList.length === 0){

            // 서버리스트에 등록된 서버 정보가 없습니다.
            _oRES.STCOD = "E001";

            // 응답 후 소캣을 종료한다.
            oStream.end(JSON.stringify(_oRES));

            return;

        }

        let oServerFound = aServerList.find(e => e.systemid === SYSID);
        if(!oServerFound){

            // 서버리스트에 등록된 서버 정보가 없습니다.
            _oRES.STCOD = "E001";

            // 응답 후 소캣을 종료한다.
            oStream.end(JSON.stringify(_oRES));

            return;
        }

        let sUUID = oServerFound.uuid;


        let oSysInfo = aSavedServList.find(e => e.uuid === sUUID);
        if(!oSysInfo){

            // 서버리스트에 등록된 서버 정보가 없습니다.
            _oRES.STCOD = "E001";

            // 응답 후 소캣을 종료한다.
            oStream.end(JSON.stringify(_oRES));

            return;
        }
        

        // 서버 정보
        var oSAPServerInfo = {
            NAME: oServerFound.name,
            SERVER_INFO: oSysInfo,
            SERVER_INFO_DETAIL: oServerFound,
            INSTANCENO: oServerFound.insno,
            SYSTEMID: oServerFound.systemid,
            CLIENT: "",
            LANGU: "",
            SYSID: oServerFound.systemid,
            SSO_KEY : SSO_KEY
        };

        // zconsole.log(oSAPServerInfo);

        // 사용자 테마 정보를 읽어온다.
        let oP13nThemeInfo = await oAPP.fn.fnP13nCreateTheme(oSAPServerInfo.SYSID);
        if (oP13nThemeInfo.RETCD == "S") {
            oSAPServerInfo.oThemeInfo = oP13nThemeInfo.RTDATA;
        }

        oAPP.fn.fnLoginPage(oSAPServerInfo);

        // 실행 성공!!
        _oRES.RETCD = "S";

        // 응답 후 소캣을 종료한다.
        oStream.end(JSON.stringify(_oRES));


    }, 3000);

};