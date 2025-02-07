/**************************************************************************
 * Login01.js
 **************************************************************************/

var oAPP = (function () {
    "use strict";

    var oAPP = {};
    oAPP.attr = {};

    /**
     * Default Browser 기준정보
     *  @ !! 위에서 부터 Default 값 우선 순위 브라우저임!! @@
     */
    oAPP.attr.aDefaultBrowsers = [{
        NAME: "CHROME",
        DESC: "Google Chrome Browser",
        REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe"
    },
    {
        NAME: "MSEDGE",
        DESC: "Microsoft Edge",
        REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe"
    },
    {
        NAME: "IE",
        DESC: "Microsoft Internet Explorer",
        REGPATH: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\IEXPLORE.EXE"
    },
    ];

    function getDefaultBrowserInfo() {
        return oAPP.attr.aDefaultBrowsers;
    }

    function isBlank(s) {
        return isEmpty(s.trim());
    }

    function isEmpty(s) {
        return !s.length;
    }

    function fn_login_check(ID, PW, CLIENT, LANGU) {

        var oCheck = {
            RETCD: "S",
            MSG: ""
        };

        if (isEmpty(CLIENT) === true || isBlank(CLIENT) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Client 를 확인하세요.";

            return oCheck;

        }

        if (isEmpty(ID) === true || isBlank(ID) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "ID를 확인하세요.";

            return oCheck;

        }

        if (isEmpty(PW) === true || isBlank(PW) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "PW를 확인하세요.";

            return oCheck;

        }

        if (isEmpty(LANGU) === true || isBlank(LANGU) === true) {

            oCheck.RETCD = "E";
            oCheck.MSG = "Language 를 확인하세요.";

            return oCheck;

        }

        return oCheck;

    }

    oAPP.fn_submit = () => {

        debugger;
        
        var oId = document.getElementById("idInput"),
            oPw = document.getElementById("pwInput"),
            oClient = document.getElementById("clientInput"),
            oLangu = document.getElementById("languInput");

        var sId = oId.value,
            sPw = oPw.value,
            sClient = oClient.value,
            sLangu = oLangu.value,
            sServicePath = parent.getServerPath() + "/wsloginchk";

        var oResult = fn_login_check(sId, sPw, sClient, sLangu);

        if (oResult.RETCD == 'E') {

            // 메시지 처리.. 
            parent.showMessage(null, 99, "E", oResult.MSG);
            return;

        }

        var oFormData = new FormData();
        oFormData.append("sap-user", sId);
        oFormData.append("sap-password", sPw);
        oFormData.append("sap-client", sClient);
        oFormData.append("sap-language", sLangu);

        // parent.setBusy('X');

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { // 요청에 대한 콜백
            if (xhr.readyState === xhr.DONE) { // 요청이 완료되면
                if (xhr.status === 200 || xhr.status === 201) {

                    debugger;

                    // parent.setBusy("");

                    // 서버 통신 중, u4a_status가 있을 경우 오류
                    let u4a_status = xhr.getResponseHeader("u4a_status");
                    if (u4a_status) {

                        try {
                            var oResult = JSON.parse(xhr.response);
                        } catch (error) {
                            fnJsonParseError(error);
                            return;
                        }

                        // 잘못된 url 이거나 지원하지 않는 기능 처리                        
                        parent.showMessage(sap, 20, oResult.RETCD, oResult.RTMSG);

                        return;
                    }

                    var oResult = JSON.parse(xhr.response);
                    if (oResult.TYPE == "E") {

                        // 오류 처리..                   
                        parent.showMessage(null, 99, "E", oResult.MSG);

                        return;
                    }

                    parent.showLoadingPage('X');

                    oAPP.onLoginSuccess(oResult);

                } else {

                    var sCleanHtml = parent.setCleanHtml(xhr.response);

                    parent.showMessage(null, 99, "E", sCleanHtml);

                }
            }
        };

        xhr.open('POST', sServicePath); // 메소드와 주소 설정
        xhr.send(oFormData); // 요청 전송 

    }; // end of oAPP.fn_submit

    // JSON Parse Error
    function fnJsonParseError(e) {

        zconsole.error(e);

        // JSON parse 오류 일 경우는 critical 오류로 판단하여 메시지 팝업 호출 후 창 닫게 만든다.

        // 화면 Lock 해제
        sap.ui.getCore().unlock();

        // parent.setBusy("");

        // Fatal Error! Please contact your system administrator.
        let sErrmsg = "Fatal Error! Please contact your system administrator \n \n " + e.toString();

        parent.showMessage(sap, 20, "E", sErrmsg);

    }

    oAPP.onLoginSuccess = (oResult) => {

        var oId = document.getElementById("idInput"),
            oPw = document.getElementById("pwInput"),
            oClient = document.getElementById("clientInput"),
            oLangu = document.getElementById("languInput");

        var oUserInfo = {
            ID: oId.value,
            PW: oPw.value,
            CLIENT: oClient.value,
            LANGU: oLangu.value.toUpperCase()
        };

        // 로그인 유저의 아이디/패스워드를 암호화해서 저장해둔다.    
        parent.setUserInfo(oUserInfo);

        // Metadata 정보 세팅 (서버 호스트명.. 또는 메시지 클래스 데이터 등..)
        if (oResult.META) {
            parent.setMetadata(oResult.META);
        }

        // parent.document.body.style.backgroundColor = "#1c2228";       

        // var oCurrWin = parent.REMOTE.getCurrentWindow();          

        // oCurrWin.setBackgroundColor("#1c2228");

        parent.onMoveToPage("WS10");

    };

    // 현재 PC에 설치되어 있는 브라우저 설치 경로를 구한다.
    function fnCheckIstalledBrowser() {

        // Default Browser 정보를 구한다.
        var aDefaultBrowsers = getDefaultBrowserInfo(),
            iBrowsCnt = aDefaultBrowsers.length;

        var aPromise = [];

        // Default Browser 기준으로 현재 내 PC에 해당 브라우저가 설치되어 있는지 
        // 레지스트리를 확인하여 설치 경로를 구한다.
        for (var i = 0; i < iBrowsCnt; i++) {

            var oPromise = fnGetBrowserInfoPromise(aDefaultBrowsers, i);

            aPromise.push(oPromise);

        }

        Promise.all(aPromise).then((aValues) => {

            parent.setDefaultBrowserInfo(aValues);

        });

    } // end of fnCheckIstalledBrowser


    function fnGetBrowserInfoPromise(aDefaultBrowsers, index) {

        var REGEDIT = parent.REGEDIT,
            oDefBrows = aDefaultBrowsers[index],
            sRegPath = oDefBrows.REGPATH;

        var oProm = new Promise((resolve, reject) => {

            REGEDIT.list(sRegPath, (err, result) => {

                var oRETURN = Object.assign({}, aDefaultBrowsers[index]);

                // 레지스터에 해당 패스가 없을 경우 오류 처리..
                if (err) {

                    resolve(oRETURN);
                    return;

                }

                // 해당 브라우저가 설치 되어있으면 실제 설치된 경로를 매핑한다.
                var sObjKey = Object.keys(result)[0],
                    oPathObj = result[sObjKey],
                    oExePathObj = oPathObj.values[""];

                oRETURN.INSPATH = oExePathObj.value;

                resolve(oRETURN);

            });

        });

        return oProm;

    } // end of fn_onPromise

    window.onload = () => {

        // Default Browser check
        fnCheckIstalledBrowser();

        var oId = document.getElementById("idInput"),
            oPw = document.getElementById("pwInput"),
            oClient = document.getElementById("clientInput"),
            oLangu = document.getElementById("languInput");

        var oServerInfo = parent.getServerInfo();

        var COMPUTERNAME = parent.process.env.COMPUTERNAME;

        // 청윤이 PC일경우
        if (COMPUTERNAME.startsWith("YOON") ||
            COMPUTERNAME.startsWith("S00")) {

            oId.value = "soccerhs";
            oPw.value = "cjddbs12";

        }

        // SYSTEM DEFAULT LANGUAGE SETTING
        oClient.value = oServerInfo.CLIENT;
        oLangu.value = oServerInfo.LANGU;

    };

    oAPP.fnStaffLogin = function (id, pw) {

        var oId = document.getElementById("idInput"),
            oPw = document.getElementById("pwInput");

        oId.value = id;
        oPw.value = pw;

        oAPP.fn_submit();

    };


    return oAPP;

})();

document.addEventListener('DOMContentLoaded', function () {

    // parent.fn_onWinMove(false, parent.REMOTE.getCurrentWindow());

    // 브라우저 zoom 레벨을 수정 한 후 로그인 페이지로 이동 시 기본 zoom 레벨 적용
    parent.WEBFRAME.setZoomLevel(0);

    // console.log("DOMContentLoaded_1");

});