  /************************************************************************
   * 에러 감지
   ************************************************************************/
  var zconsole = parent.WSERR(window, document, console);

  let oAPP = parent.oAPP;

  // 브라우저 title
  let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B65"); // Document    

  oAPP.CURRWIN.setTitle(sTitle);

  /************************************************************************
   * ws의 설정 정보를 구한다.
   ************************************************************************/
  function fnGetSettingsInfo() {

      // Browser Window option
      var sSettingsJsonPath = parent.PATHINFO.WSSETTINGS,

          // JSON 파일 형식의 Setting 정보를 읽는다..
          oSettings = parent.require(sSettingsJsonPath);
      if (!oSettings) {
          return;
      }

      return oSettings;

  } // end of fnGetSettingsInfo

  /************************************************************************
   * UI5 BootStrap 
   ************************************************************************/
  function fnLoadBootStrapSetting() {

      var oSettings = fnGetSettingsInfo(),
          oSetting_UI5 = oSettings.UI5,
          oBootStrap = oSetting_UI5.bootstrap,
          oUserInfo = parent.oAPP.attr.oUserInfo,
          oThemeInfo = parent.oAPP.attr.oThemeInfo,
          sLangu = oUserInfo.LANGU;

      var oScript = document.createElement("script");
      oScript.id = "sap-ui-bootstrap";

      // 공통 속성 적용
      for (const key in oBootStrap) {
          oScript.setAttribute(key, oBootStrap[key]);
      }

      // 로그인 Language 적용    
      oScript.setAttribute('data-sap-ui-theme', oThemeInfo.THEME);
      oScript.setAttribute("data-sap-ui-preload", "sync");
      oScript.setAttribute("data-sap-ui-language", sLangu);
      oScript.setAttribute("data-sap-ui-libs", "sap.m, sap.tnt, sap.ui.commons, sap.ui.core, sap.ui.layout, sap.ui.unified");
      oScript.setAttribute("src", oSetting_UI5.resourceUrl);

      document.head.appendChild(oScript);

  } // end of fnLoadBootStrapSetting

  /************************************************************************
   * 클라이언트 세션 유지를 위한 function
   ************************************************************************/
  function fnKeepClientSession() {

      var oAPP = parent.oAPP;

      // 브라우저의 세션 키
      var sSessionKey = oAPP.fn.getSessionKey();

      // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
      oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

      // 윈도우 클릭 이벤트 해제
      window.removeEventListener("click", fnWindowClickEventListener);
      window.removeEventListener("keyup", fnWindowClickEventListener);

      // 윈도우 클릭 이벤트 걸기
      window.addEventListener("click", fnWindowClickEventListener);
      window.addEventListener("keyup", fnWindowClickEventListener);

  } // end of fnKeepClientSession


  /**************************************************
   * 윈도우 클릭 이벤트
   **************************************************/
  function fnWindowClickEventListener() {

      var oAPP = parent.oAPP;

      // 브라우저의 세션 키
      var sSessionKey = oAPP.fn.getSessionKey();

      // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
      oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

  }; // end of fnWindowClickEventListener

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


  
/**************************************************
 * BroadCast Event 걸기
 **************************************************/
function _attachBroadCastEvent (){

    oAPP.broadToChild = new BroadcastChannel(`broadcast-to-child-window_${oAPP.BROWSKEY}`);        

    oAPP.broadToChild.onmessage = function(oEvent){

        var _PRCCD = oEvent?.data?.PRCCD || undefined;

        if(typeof _PRCCD === "undefined"){
            return;
        }

        //프로세스에 따른 로직분기.
        switch (_PRCCD) {
            case "BUSY_ON":

                //BUSY ON을 요청받은경우.
                oPrc.fn_setBusy(true, {ISBROAD:true});
                break;

            case "BUSY_OFF":
                //BUSY OFF를 요청 받은 경우.
                oPrc.fn_setBusy(false,  {ISBROAD:true});
                break;

            default:
                break;
        }

    };

} // end of _attachBroadCastEvent

  //====================================================================================        
  // window 이벤트 설정 
  //====================================================================================   

  document.addEventListener('keyup', function (e) {
      oPrc.isPressed = false;
  });
  document.addEventListener('keydown', function (e) {
      oPrc.isPressed = true;
  });

  // WINDOW START 시 I/F 초기 DATA 설정 



  // UI5 Boot Strap을 로드 하고 attachInit 한다.
  fnLoadBootStrapSetting();

  // 클라이언트 세션 유지를 위한 이벤트를 걸어둔다.
  fnKeepClientSession();

  // BroadCast Event 걸기
  _attachBroadCastEvent();

  //dom start event
  // document.addEventListener('DOMContentLoaded', () => {

  window.addEventListener('load', () => {

      // 브라우저 처음 실행 시 보여지는 Busy Indicator
      parent.oAPP.setBusyLoading('');

      var oUserInfo = parent.oAPP.attr.oUserInfo,
          oAppInfo = parent.oAPP.attr.oAppInfo,
          sServerPath = parent.oAPP.attr.sServerPath;

      oPrc.APPID = oAppInfo.APPID;
      oPrc.sURL = `${sServerPath}\\u4a_app_doc`;
      oPrc.USRNM = oUserInfo.ID;

      //====================================================================================        
      // 내부 사용 펑션 선언 
      //====================================================================================         
    

    

    /***********************************************************
     * Busy 켜기 끄기
     ***********************************************************/
    oPrc.fn_setBusy = function(bIsBusy, sOption){

        oAPP.attr.isBusy = bIsBusy;

        var _ISBROAD = sOption?.ISBROAD || undefined;

        if(bIsBusy === true){

            // lock 걸기
            sap.ui.getCore().lock();

            oApp.setBusy(true);

            // 브라우저 창 닫기 버튼 비활성
            oAPP.CURRWIN.closable = false;

            //다른 팝업의 BUSY ON 요청 처리.            
            if(typeof _ISBROAD === "undefined"){
                oAPP.broadToChild.postMessage({PRCCD:"BUSY_ON"});
            } 

            return;

        }

        oApp.setBusy(false);

        // 브라우저 창 닫기 버튼 활성
        oAPP.CURRWIN.closable = true;

        //다른 팝업의 BUSY OFF 요청 처리.           
        if(typeof _ISBROAD === "undefined"){
            oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});
        }

        // lock 풀기
        sap.ui.getCore().unlock();


    };


      //ZOOM 처리를 위해 이벤트 설정 
      oPrc.fn_setZoomEvt = () => {

          var oDom = oRch._oEditor.dom.doc.getElementsByTagName('HTML')[0];

          let scale = 1;

          $(oDom).on("keyup", function (e) {
              if (e.key !== "Control") {
                  return;
              }
              oPrc.isPressed = false;
          });
          $(oDom).on("keydown", function (e) {
              if (e.key !== "Control") {
                  return;
              }
              oPrc.isPressed = true;
          });
          $(oDom).on("wheel", function (e) {

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

              let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B93"); // Error
              sTitle += " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B86"); // Information

              var oMsg = new sap.m.MessagePage({
                  title: sTitle,
                  description: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "192"), // Fatal Error! Please contact your system administrator.
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

          oPrc.fn_setBusy(true);

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

          let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "324"); // The wrong approach

          xhr.onload = function (e) {

              oPrc.fn_setBusy(false);

              //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
              oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

              try {
                  var sData = JSON.parse(this.response);

              } catch (e) {
                  //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                  oPrc.fn_setMsgMove(sMsg);
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
                      oPrc.fn_setMsgMove(sMsg);
                      return;
                      break;

              }

          };

          xhr.onerror = function (e) {
              oPrc.fn_setBusy(false);

              //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
              oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

              //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
              oPrc.fn_setMsgMove(sMsg);

          };

          xhr.send(oForm);


      };


      //[FUNCTION] 저장 Data 얻기 
      oPrc.fn_getSaveData = () => {

          oPrc.fn_setBusy(true);

          const xhr = new XMLHttpRequest();
          const url = oPrc.sURL;

          const oForm = new FormData();

          oForm.append('APPID', oPrc.APPID);
          oForm.append('ACTCD', 'GET');

          // User정보가 있고, 서버 설정이 HTTP Only 일 경우,
          // 파라미터에 ID, PW를 붙인다.
        //   let oLogInData = oAPP.attr.oUserInfo;
        //   if(oLogInData && oLogInData.HTTP_ONLY == "1"){
        //     oForm.append("sap-user", oLogInData.ID);
        //     oForm.append("sap-password", oLogInData.PW);
        //     oForm.append("sap-client", oLogInData.CLIENT);
        //     oForm.append("sap-language", oLogInData.LANGU);
        //   }

          /*
          oForm.append('sap-client', '800'); 
          oForm.append('sap-user', 'shhong');
          oForm.append('sap-password', '1qazxsw2@');  
          */

          let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "324"); // The wrong approach

          xhr.open("POST", url);
          xhr.onload = function (e) {

              oPrc.fn_setBusy(false);

              try {
                  var sData = JSON.parse(this.response);

              } catch (e) {
                  //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
                  oPrc.fn_setMsgMove(sMsg);
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
                      oPrc.fn_setMsgMove(sMsg);
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

          xhr.onerror = function () {
              oPrc.fn_setBusy(false);
              //크리티컬 메시지 처리 서버에서 JSON 오류라는건 잘못된 경로로 판단함 
              oPrc.fn_setMsgMove(sMsg);

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

      //====================================================================================        
      // 좌측 영역 
      //====================================================================================          
      let oSpage = new sap.m.Page({
          enableScrolling: false,
          title: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D14"), // Document List
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

              let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "325"); // document has been created

              sap.m.MessageToast.show(sMsg);


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

                  let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "326"); // Select the delete line
                  sap.m.MessageToast.show(sMsg);
                  return;
              }

              let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "003"); // Do you really want to delete the object?

              //질문팝업 
              sap.m.MessageBox.information(sMsg, {
                  actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
                  emphasizedAction: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D15"), // Manage Products
                  onClose: function (sAction) {

                    if(sap.m.MessageBox.Action.OK !== sAction){

                        //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
                        oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

                        return;
                    }

                    // if (sap.m.MessageBox.Action.OK === sAction) {

                        //변경 여부 지시자 초기화 
                        oPrc.isChang = false;

                        //삭제 
                        oPrc.fn_delDOCLineData(oPrc.DOCKY);

                        //삭제 완료 
                        let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "327"); // Deletion processing complete
                        sap.m.MessageToast.show(sMsg);

                    // }
                    
                    //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
                    oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

                  }
              });

              //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
              oAPP.broadToChild.postMessage({ PRCCD:"BUSY_ON" });

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

                  let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "328"); // Saved data does not exist
                  sap.m.MessageToast.show(sMsg);
                  return;
              }

              //질문팝업 
              let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "010"); // Do you want to save it?
              sap.m.MessageBox.information(sMsg, {
                  actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
                  emphasizedAction: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D15"), // Manage Products
                  onClose: function (sAction) {

                    if(sap.m.MessageBox.Action.OK !== sAction){

                        //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
                        oAPP.broadToChild.postMessage({ PRCCD:"BUSY_OFF" });

                        return;
                    }

                    // if (sap.m.MessageBox.Action.OK === sAction) {
                        //저장 처리 
                        oPrc.fn_Save();

                    // }

                  }
              });

              //브로드 캐스트로 다른 팝업의 BUSY 요청 처리.
              oAPP.broadToChild.postMessage({ PRCCD:"BUSY_ON" });

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
      let sPlaceholder = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D16"); // Title

      var oInput = new sap.m.Input({
          width: "98%",
          placeholder: sPlaceholder,
          valueState: "Information",
          valueStateText: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D17"), // Document Subject,
          submit: () => {

              //변경 여부 지시자 설정 
              oPrc.isChang = true;

              //사용자 선택중인 라인 갱신 
              oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            //   console.log("edit 변경");

          },
          change: () => {

              //변경 여부 지시자 설정 
              oPrc.isChang = true;

              //사용자 선택중인 라인 갱신 
              oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

            //   console.log("edit 변경");

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
          ready: function () {
              this.addButtonGroup('styleselect');
              this.addButtonGroup('table');

              oPrc.fn_setBusy(true);

              setTimeout(() => {
                  //저장 Data 얻기 
                  oPrc.fn_getSaveData();

              }, 1000);

          }

      });

      oRch.attachChange(function () {

          // 클라이언트 세션 유지를 위한 function
          fnWindowClickEventListener();

          //변경 여부 지시자 설정 
          oPrc.isChang = true;

          //사용자 선택중인 라인 갱신 
          oPrc.fn_UpdateDOCLineData(oNaviList.getSelectedKey());

        //   console.log("edit 변경");

      });

      oRch.attachBrowserEvent('focusin', function () {
          //좌측 문서 리스트 항목 영역 접기 
          oApp.hideMaster();
      });


      //그룹 버튼 생성 
      setTimeout(function () {
          oRch.addButtonGroup('styleselect');
          oRch.addButtonGroup('table');
      }, 0);

      oMpage.addContent(oRch);

      oApp.placeAt('content');

      
    let oDelegate = {
        onAfterRendering : function(){
    
            oApp.removeEventDelegate(oDelegate);

            oAPP.CURRWIN.show();

            oPrc.fn_setBusy(false);

            oAPP.WSUTIL.setBrowserOpacity(oAPP.CURRWIN);
    
            // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
            oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 
    
        }
    };
    
    oApp.addEventDelegate(oDelegate);


    //화면 잠금/해제 처리 
    oPrc.fn_scrEditble(oPrc.isEdit, oPrc.isEdit);


});


/***********************************************************************
 * @function - 브라우저 창을 닫을 때 Broadcast로 busy 끄라는 지시를 한다.
 ***********************************************************************/
function _setBroadCastBusy(){

    // 브라우저 닫는 시점에 busy가 켜있을 경우
    if(oAPP.fn.getBusy() === true){

        //다른 팝업의 BUSY OFF 요청 처리.
        oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        return;

    }

    if(typeof window?.sap?.m?.InstanceManager?.getOpenDialogs !== "function"){
        return;
    }

    // 현재 호출된 dialog 정보 얻기.
    var _aDialog = sap.m.InstanceManager.getOpenDialogs();

    //호출된 dialog가 없다면 exit.
    if(typeof _aDialog === "undefined" || _aDialog?.length === 0){
        return;
    }

    // 내가 띄운 MessageBox 가 있을 경우 Busy OFF
    if(_aDialog.findIndex( item => typeof item.getType === "function" && 
        item.getType() === "Message") !== -1){
        
        //브로드캐스트로 다른 팝업의 BUSY OFF 요청 처리.
        oAPP.broadToChild.postMessage({PRCCD:"BUSY_OFF"});

        // // 메인 영역 Busy 끄기
        // parent.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" });

    }

} // end of _setBroadCastBusy

/************************************************************************
 * window 창을 닫을때 호출 되는 이벤트
 ************************************************************************/
window.onbeforeunload = function(){

    // Busy가 실행 중이면 창을 닫지 않는다.
    if(oAPP.fn.getBusy() === true){
        return false;
    }

    _setBroadCastBusy();
    
};