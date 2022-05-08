// const oAPP = parent.fn_getParent();
// const oWIN = oAPP.remote.getCurrentWindow();

/************************************************************************
 * ws의 설정 정보를 구한다.
 ************************************************************************/
function fnGetSettingsInfo() {

    let PATH = parent.oAPP.PATH,
        APP = parent.oAPP.APP;

    // Browser Window option
    var sSettingsJsonPath = PATH.join(APP.getAppPath(), "/settings/ws_settings.json"),

        // JSON 파일 형식의 Setting 정보를 읽는다..
        oSettings = parent.require(sSettingsJsonPath);
    if (!oSettings) {
        return;
    }

    return oSettings;

} // end of fnGetSettingsInfo

// /************************************************************************
//  * UI5 BootStrap 
//  ************************************************************************/
function fnLoadBootStrapSetting() {

    var oSettings = fnGetSettingsInfo(),
        oSetting_UI5 = oSettings.UI5,
        sVersion = oSetting_UI5.version,
        sTestResource = oSetting_UI5.testResource,
        sReleaseResource = `../../lib/ui5/${sVersion}/resources/sap-ui-core.js`,
        bIsDev = oSettings.isDev,
        oBootStrap = oSetting_UI5.bootstrap,
        oUserInfo = parent.oAPP.attr.oUserInfo,
        sLangu = oUserInfo.LANGU;

    var oScript = document.createElement("script");
    oScript.id = "sap-ui-bootstrap";

    // 공통 속성 적용
    for (const key in oBootStrap) {
        oScript.setAttribute(key, oBootStrap[key]);
    }

    // 로그인 Language 적용    
    oScript.setAttribute("data-sap-ui-preload", "sync");
    oScript.setAttribute("data-sap-ui-language", sLangu);
    oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.commons, sap.ui.core, sap.ui.layout, sap.ui.unified");

    // 개발일때와 release 할 때의 Bootstrip 경로 분기
    if (bIsDev) {
        oScript.setAttribute("src", sTestResource);
    } else {
        oScript.setAttribute("src", sReleaseResource);
    }

    document.head.appendChild(oScript);

} // end of fnLoadBootStrapSetting


//====================================================================================        
// 내부 프로세스 제어 및 전역 필드 
//====================================================================================         
const oPrc = {};

oPrc.APPID = "ZAPPID";
oPrc.sURL = "http://sapecc1.yourin.com:8000/zu4a_wbc/u4a_app_doc";
oPrc.USRNM = "SHHONG";

oPrc.DOCKY = null;
oPrc.sDOC = {
    T_DOCLIST: []
};
oPrc.isPressed = false;
oPrc.isEdit = true;
oPrc.isChang = false;


//====================================================================================        
// window 이벤트 설정 
//====================================================================================   

document.addEventListener('keyup', function(e) {
    oPrc.isPressed = false;
});
document.addEventListener('keydown', function(e) {
    oPrc.isPressed = true;
});

// WINDOW START 시 I/F 초기 DATA 설정 



// UI5 Boot Strap을 로드 하고 attachInit 한다.
fnLoadBootStrapSetting();

//dom start event
// document.addEventListener('DOMContentLoaded', () => {

window.addEventListener('load', () => {

    parent.oAPP.setBusy('');

    var oUserInfo = parent.oAPP.attr.oUserInfo,
        oAppInfo = parent.oAPP.attr.oAppInfo,
        sServerPath = parent.oAPP.attr.sServerPath;

    oPrc.APPID = oAppInfo.APPID;
    oPrc.sURL = `${sServerPath}\\u4a_app_doc`;
    oPrc.USRNM = oUserInfo.ID;

    //====================================================================================        
    // 내부 사용 펑션 선언 
    //====================================================================================         

    //ZOOM 처리를 위해 이벤트 설정 
    oPrc.fn_setZoomEvt = () => {

        var oDom = oRch._oEditor.dom.doc.getElementsByTagName('HTML')[0];

        let scale = 1;

        $(oDom).on("keyup", function(e) {
            if (e.key !== "Control") {
                return;
            }
            oPrc.isPressed = false;
        });
        $(oDom).on("keydown", function(e) {
            if (e.key !== "Control") {
                return;
            }
            oPrc.isPressed = true;
        });
        $(oDom).on("wheel", function(e) {

            //e.preventDefault();
            if (!oPrc.isPressed) {
                return;
            }

            scale += e.originalEvent.deltaY * -0.01;
            scale = Math.min(Math.max(.125, scale), 4);

            oDom.style.zoom = scale;
            //console.log(scale);


        });


    };

    //[FUNCTION] 크리티컬 메시지 PAGE 이동  
    oPrc.fn_setMsgMove = (t) => {
            oApp.destroy();

            var oMsg = new sap.m.MessagePage({
                title: "Error infomation",
                description: "Contact your manager",
                text: t,
                icon: "sap-icon://error"
            });

            oMsg.placeAt('content');

        },

        //[FUNCTION] 출력 모델 패턴 생성  
        oPrc.fn_getModelPatt = (t) => {

            if (t === "2") {
                var sLine = {
                    ICON: "",
                    DOCKY: oPrc.fn_makeDOCKY(),
                    TITLE: "",
                    LDATA: "",
                    AEUSR: "",
                    AEDAT: "",
                    AETIM: ""
                };
                return sLine;
            }

            var sData = JSON.stringify(oPrc.sDOC);
            return JSON.parse(sData);

        },

        //[FUNCTION] 저장 Data 얻기
        oPrc.fn_makeDOCKY = () => {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 60; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;

        };

    //[FUNCTION] 저장 처리 
    oPrc.fn_Save = () => {

        oApp.setBusy(true);

        const xhr = new XMLHttpRequest();
        const url = oPrc.sURL;

        const oForm = new FormData();

        oForm.append('APPID', oPrc.APPID);
        oForm.append('ACTCD', 'SAVE');
        oForm.append('DATA', JSON.stringify(oModel.getData().T_DOCLIST));

        /*
        oForm.append('sap-client', '800'); 
        oForm.append('sap-user', 'shhong');
        oForm.append('sap-password', '1qazxsw2@');  
        */

        xhr.open("POST", url);
        //xhr.setRequestHeader('Content-Type', 'multipart/form-data');

        xhr.onload = function(e) {

            oApp.setBusy(false);

            try {
                var sData = JSON.parse(this.response);

            } catch (e) {
                //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                oPrc.fn_setMsgMove("The wrong approach");
                return;

            }


            //처리 리턴 코드에 대한 분기 
            switch (sData.RETCD) {
                case "S":
                    //정상 처리 메시지 
                    sap.m.MessageToast.show(sData.RTMSG);
                    break;

                case "E":
                    //오류 처리 메시지 
                    sap.m.MessageToast.show(sData.RTMSG);
                    break;

                default:
                    //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                    oPrc.fn_setMsgMove("The wrong approach");
                    return;
                    break;

            }

        };

        xhr.onerror = function(e) {
            oApp.setBusy(false);
            //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
            oPrc.fn_setMsgMove("The wrong approach");

        };

        xhr.send(oForm);


    };


    //[FUNCTION] 저장 Data 얻기 
    oPrc.fn_getSaveData = () => {

        oApp.setBusy(true);

        const xhr = new XMLHttpRequest();
        const url = oPrc.sURL;

        const oForm = new FormData();

        oForm.append('APPID', oPrc.APPID);
        oForm.append('ACTCD', 'GET');

        /*
        oForm.append('sap-client', '800'); 
        oForm.append('sap-user', 'shhong');
        oForm.append('sap-password', '1qazxsw2@');  
        */

        xhr.open("POST", url);
        xhr.onload = function(e) {

            oApp.setBusy(false);

            try {
                var sData = JSON.parse(this.response);

            } catch (e) {
                //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                oPrc.fn_setMsgMove("The wrong approach");
                return;

            }

            //모델 패턴 
            var sDOC = oPrc.fn_getModelPatt("1");


            //처리 리턴 코드에 대한 분기 
            switch (sData.RETCD) {
                case "S":
                    //서버 -> 클라이언트 Data 설정 
                    sDOC.T_DOCLIST = sData.T_DATA;

                    //출력 모델 갱신 
                    oModel.setData(sDOC);

                    break;

                case "E":
                    //모델 좌측 목록 패턴 

                    //편집모드일경우만 빈라인 생성 
                    if (oPrc.isEdit) {

                        var sLine = oPrc.fn_getModelPatt("2");
                        sLine.ICON = "sap-icon://create";

                        sDOC.T_DOCLIST.push(sLine);

                        //출력 모델 갱신 
                        oModel.setData(sDOC);
                    }

                    break;

                default:
                    //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                    oPrc.fn_setMsgMove("The wrong approach");
                    return;
                    break;

            }


            if (sDOC.T_DOCLIST.length !== 0) {

                //문서 라인 출력 Data 설정 
                oPrc.fn_setDOCLineData(sDOC.T_DOCLIST[0]);

            }


            //ZOOM 처리를 위해 이벤트 설정 
            setTimeout(() => {
                oPrc.fn_setZoomEvt();
            }, 300);


        };

        xhr.onerror = function() {
            oApp.setBusy(false);
            //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
            oPrc.fn_setMsgMove("The wrong approach");

        };

        xhr.send(oForm);


    };

    //[FUNCTION] 문서 라인 Data 갱신 설정 
    oPrc.fn_UpdateDOCLineData = (DOCKY) => {

        var sDOC = oModel.getData();

        sDOC.T_DOCLIST.filter((s) => {

            if (s.DOCKY === DOCKY) {
                s.TITLE = oInput.getValue();
                s.LDATA = oRch.getValue();

                //변경 이력이 존재한다면 ..
                if (oPrc.isChang) {

                    //변경 여부 지시자 초기화 
                    oPrc.isChang = false;

                    //time stemp 
                    var oStmp = oPrc.fn_getDateTime();

                    s.AEDAT = oStmp.DATE;
                    s.AETIM = oStmp.TIME;
                    s.AEUSR = oPrc.USRNM;

                    //top 우측 변경 이력 출력 Data 설정 
                    oPrc.fn_setStempOut(s);

                }

                oModel.setData(sDOC);

                return;

            }

        });

    };


    //[FUNCTION] 문서 라인 출력 Data 설정 
    oPrc.fn_setDOCLineData = (sLine) => {

        //이전 정보 UPDATE 
        if (oPrc.DOCKY !== null) {

            //문서 라인 Data 갱신 설정 
            oPrc.fn_UpdateDOCLineData(oPrc.DOCKY);

        }

        if (typeof sLine === "undefined") {
            //Title, Editor value, timestemp 값 초기화 
            oInput.setValue("");
            oRch.setValue("");
            oTimeStmp.setText("");

            return;

        }


        //이전 선택 Key 정보 설정 
        oPrc.DOCKY = sLine.DOCKY;


        //좌측 메뉴 Line select
        oNaviList.setSelectedKey(sLine.DOCKY);


        //Title
        oInput.setValue(sLine.TITLE)


        //Editor data 
        oRch.setValue(sLine.LDATA);


        //top 우측 변경 이력 출력 Data 설정 
        oPrc.fn_setStempOut(sLine);


        //ZOOM 이벤트 설정 - for Edit 영역 
        setTimeout(() => {
            oPrc.fn_setZoomEvt();
        }, 300);




    };


    //[FUNCTION] 문서 라인 Data 삭제
    oPrc.fn_delDOCLineData = (DOCKY) => {

        var sDOC = oModel.getData();
        var indx = 0;


        sDOC.T_DOCLIST.filter((s, i) => {

            if (s.DOCKY === DOCKY) {

                sDOC.T_DOCLIST.splice(i, 1);

                oModel.setData(sDOC);

                if (sDOC.T_DOCLIST.length === 0) {

                    //문서 라인 출력 Data 설정 
                    oPrc.fn_setDOCLineData(undefined);

                    //Editor 영역 잠금 
                    oPrc.fn_scrEditble(true, false);

                    return;

                }


                indx = i - 1;
                if (indx < 0) {
                    indx = 0;
                }

                //문서 라인 출력 Data 설정 
                oPrc.fn_setDOCLineData(sDOC.T_DOCLIST[indx]);


                return;

            }

        });


    };


    //[FUNCTION] 화면 잠금/해제 처리 
    oPrc.fn_scrEditble = (a, b) => {

        oBTcrt.setVisible(a);
        oBTdel.setVisible(a);
        oBTsave.setVisible(a);

        oRch.setEditable(b);
        oInput.setEditable(b);

    };


    //[FUNCTION] 현재 일자/시간 추출 
    oPrc.fn_getDateTime = () => {

        var sRet = {};

        //Date 
        var oDATE = new Date();
        var Lyear = oDATE.getFullYear();
        var Lmonth = oDATE.getMonth() + 1;
        Lmonth = Lmonth.toString().padStart(2, '0');
        var Lday = oDATE.getDate();

        //time
        var oDATE = new Date();
        var Lhour = oDATE.getHours();
        Lhour = Lhour.toString().padStart(2, '0');
        var Lminute = oDATE.getMinutes();
        Lminute = Lminute.toString().padStart(2, '0');
        var Lsecond = oDATE.getSeconds();
        Lsecond = Lsecond.toString().padStart(2, '0');

        sRet.DATE = Lyear + Lmonth + Lday;
        sRet.TIME = Lhour + Lminute + Lsecond;

        return sRet;

    };


    //[FUNCTION] top 우측 변경 이력 출력 Data 설정 
    oPrc.fn_setStempOut = (s) => {

        var Ltitle = "";
        if (s.AEDAT !== "") {
            var Ltitle = oPrc.fn_convExitDate(s.AEDAT) + " / " + oPrc.fn_convExitTime(s.AETIM) + " / " + s.AEUSR;
        }

        oTimeStmp.setText(Ltitle);

    };


    //[FUNCTION] Date convEXIT
    oPrc.fn_convExitDate = (sDate, sSymbol) => {

        let l_patt = "$1-$2-$3";

        if (typeof sSymbol !== "undefined") {
            l_patt = "$1" + sSymbol + "$2" + sSymbol + "$3";
        }

        return sDate.replace(/(\d{4})(\d{2})(\d{2})/, l_patt);

    };


    //[FUNCTION] Time convEXIT
    oPrc.fn_convExitTime = (sTime, sSymbol) => {

        let l_patt = "$1:$2:$3";

        if (typeof sSymbol !== "undefined") {
            l_patt = "$1" + sSymbol + "$2" + sSymbol + "$3";
        }

        return sTime.replace(/(\d{2})(\d{2})(\d{2})/, l_patt);


    };


    //====================================================================================        
    // 화면 생성 구성 시작 
    //====================================================================================  

    jQuery.sap.require("sap.ui.richtexteditor.RichTextEditor");
    jQuery.sap.require('sap.m.MessageBox');

    //model 
    let oModel = new sap.ui.model.json.JSONModel();

    let oApp = new sap.m.SplitApp({
        mode: "HideMode",
        busyIndicatorDelay: 1
    });

    // yoon test
    oApp.addDelegate({
        onAfterRendering: function() {
           
            // setTimeout(() => {
            //     $('#content').fadeIn(500, 'linear');
            // }, 100);

        }
    });

    //====================================================================================        
    // 좌측 영역 
    //====================================================================================          
    let oSpage = new sap.m.Page({
        enableScrolling: false,
        title: "Document List",
    });
    oApp.addMasterPage(oSpage);


    let oNaviList = new sap.tnt.NavigationList();

    oNaviList.setModel(oModel);

    let oNaviItm = new sap.tnt.NavigationListItem({
        text: {
            path: "TITLE"
        },
        key: {
            path: "DOCKY"
        },
        icon: {
            path: "ICON"
        },

        select: (e) => {
            //선택 라인정보 얻기 
            var sLine = e.oSource.getModel().mContexts[e.oSource.oBindingContexts.undefined.sPath].getProperty();

            //문서 라인 출력 Data 설정 
            oPrc.fn_setDOCLineData(sLine);

            //좌측 문서 리스트 항목 영역 접기 
            oApp.hideMaster();

        }

    });

    oNaviList.bindAggregation('items', {
        path: "/T_DOCLIST",
        template: oNaviItm,
        templateShareable: true
    });

    oSpage.addContent(oNaviList);


    //====================================================================================        
    // content 영역 
    //====================================================================================  

    //toolbar 영역 
    let oTool = new sap.m.Bar();

    //문서 생성 버튼 
    let oBTcrt = new sap.m.Button({
        icon: "sap-icon://create",
        type: "Attention",
        press: (e) => {

            ////Editor 영역 활성
            oPrc.fn_scrEditble(true, true);

            //모델 좌측 목록 패턴 
            var sLine = oPrc.fn_getModelPatt("2");
            sLine.ICON = "sap-icon://create";

            var sDOC = oModel.getData();

            sDOC.T_DOCLIST.push(sLine);

            oModel.setData(sDOC);

            //문서 라인 출력 Data 설정 
            oPrc.fn_setDOCLineData(sLine);

            setTimeout(() => {
                oInput.focus();

            }, 200);

            sap.m.MessageToast.show('document has been created');


        }

    });
    oTool.addContentLeft(oBTcrt);

    //문서 삭제 버튼 
    let oBTdel = new sap.m.Button({
        icon: "sap-icon://delete",
        type: "Reject",
        press: (e) => {

            //사용자 선택중인 라인 갱신 
            oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            if (oNaviList.getItems().length === 0) {
                oApp.showMaster(true);
                sap.m.MessageToast.show('Select the delete line');
                return;
            }

            //질문팝업 
            sap.m.MessageBox.information("do you want to delete?", {
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
                emphasizedAction: "Manage Products",
                onClose: function(sAction) {
                    if (sap.m.MessageBox.Action.OK === sAction) {

                        //변경 여부 지시자 초기화 
                        oPrc.isChang = false;

                        //삭제 
                        oPrc.fn_delDOCLineData(oPrc.DOCKY);

                        //삭제 완료 
                        sap.m.MessageToast.show('Deletion processing complete');

                    }

                }
            });

        }
    });
    oTool.addContentLeft(oBTdel);


    //문서 저장 버튼
    let oBTsave = new sap.m.Button({
        icon: "sap-icon://save",
        type: "Emphasized",
        press: (e) => {

            //사용자 선택중인 라인 갱신 
            oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            if (oNaviList.getItems().length === 0) {
                oApp.showMaster(true);
                sap.m.MessageToast.show('Saved data does not exist');
                return;
            }

            //질문팝업 
            sap.m.MessageBox.information("do you want to save", {
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
                emphasizedAction: "Manage Products",
                onClose: function(sAction) {
                    if (sap.m.MessageBox.Action.OK === sAction) {
                        //저장 처리 
                        oPrc.fn_Save();

                    }

                }
            });

        }
    });

    oTool.addContentLeft(oBTsave);

    //toolbar 우측 : 문서 갱신 date/time
    var oTimeStmp = new sap.m.Text();
    oTool.addContentRight(oTimeStmp);



    //content 영역 Page 
    let oMpage = new sap.m.Page({
        enableScrolling: false,
        showHeader: true
    });
    oApp.addDetailPage(oMpage);

    //tool 영역 page 반영 
    oMpage.setCustomHeader(oTool);


    //제목(타이틀) 
    var oInput = new sap.m.Input({
        width: "98%",
        placeholder: "Title..",
        valueState: "Information",
        valueStateText: "Document header title field",
        submit: () => {

            //변경 여부 지시자 설정 
            oPrc.isChang = true;

            //사용자 선택중인 라인 갱신 
            oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            console.log("edit 변경");

        },
        change: () => {

            //변경 여부 지시자 설정 
            oPrc.isChang = true;

            //사용자 선택중인 라인 갱신 
            oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            console.log("edit 변경");

        }
    });
    oInput.addStyleClass("sapUiTinyMargin sapUiSmallMarginEnd");

    oMpage.addContent(oInput);


    // Editor 생성     
    let oRch = new sap.ui.richtexteditor.RichTextEditor({
        editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
        width: "100%",
        height: "100%",
        customToolbar: true,
        sanitizeValue: false,
        showGroupFontStyle: true,
        showGroupStructure: true,
        showGroupTextAlign: true,
        showGroupUndo: true,
        showGroupFont: true,
        showGroupLink: true,
        showGroupInsert: true,
        ready: function() {
            this.addButtonGroup('styleselect');
            this.addButtonGroup('table');

            oApp.setBusy(true);
            setTimeout(() => {
                //저장 Data 얻기 
                oPrc.fn_getSaveData();

            }, 1000);

        }

    });

    oRch.attachChange(function() {
        //변경 여부 지시자 설정 
        oPrc.isChang = true;

        //사용자 선택중인 라인 갱신 
        oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

        console.log("edit 변경");

    });

    oRch.attachBrowserEvent('focusin', function() {
        //좌측 문서 리스트 항목 영역 접기 
        oApp.hideMaster();
    });


    //그룹 버튼 생성 
    setTimeout(function() {
        oRch.addButtonGroup('styleselect');
        oRch.addButtonGroup('table');
    }, 0);

    oMpage.addContent(oRch);

    oApp.placeAt('content');


    //화면 잠금/해제 처리 
    oPrc.fn_scrEditble(oPrc.isEdit, oPrc.isEdit);


});