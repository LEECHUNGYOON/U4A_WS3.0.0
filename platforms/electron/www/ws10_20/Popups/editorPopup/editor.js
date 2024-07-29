  /************************************************************************
   * 에러 감지
   ************************************************************************/
  var zconsole = parent.WSERR(window, document, console);

  (function () {
      "use strict";

      // *--------------------------------------------------------------------*
      // * ★★-글로벌 variable
      // *--------------------------------------------------------------------*    
      var oAPP = parent.oAPP;

      var oFind = {};
      oFind.Sval = " L_FINDVAL "; //"find value 처음 한번만 대상
      oFind.aMakers = [];
      oFind.Range = {};

      var oTimer = null;

      let oBtn = document.getElementById("BTSAVE");
      if (oBtn) {
          oBtn.innerHTML = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A64", "", "", "", ""); // Save
      }

      // ace edit 스타트
      ace.require("ace/ext/language_tools");

      var editor = ace.edit("editor");

      editor.setOptions({
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: false
      });

      editor.getSession().setUseWrapMode(true);
      editor.setHighlightActiveLine(false);
      editor.setShowPrintMargin(false);
      editor.session.setMode('ace/mode/text');
      editor.setTheme("ace/theme/monokai");
      document.getElementById('editor').style.fontSize = '17px';
      editor.resize();
      editor.focus();

      oFind.Range = ace.require("ace/range").Range;

      // "-EDITOR 포커스 아웃 (data 서버 동기화)
      // L_FOCUS
      editor.on('focus', function () {
          LF_messageHIDE();
      });

      editor.on("change", function () {
          //    "-* find value 정보잇을경우만 대상   

          if (oFind.aMakers.length > 0) {
              LF_removeALLMarker();
          }

      });

      // *--------------------------------------------------------------------*
      // * ★★-펑션 설정
      // *--------------------------------------------------------------------*

      // 로딩중 활성 & 비활성
      function lf_setEditorBusy(bIsBusy) {

          var oLoading = document.getElementById("zloading"),
              oLoadingOverlay = document.getElementById("zzoverlay");

          if (!oLoading || !oLoadingOverlay) {
              return;
          }

          if (bIsBusy == 'X') {

              oLoading.style.visibility = "visible";
              oLoadingOverlay.style.display = "block";

              return;

          }

          oLoading.style.visibility = "hidden";
          oLoadingOverlay.style.display = "none";

      }

      // *-이벤트 버블 및 전파 중지 처리 펑션
      function gf_u4acancelPropagation(event) {
          if (event.stopPropagation) {
              event.stopPropagation();
          } else {
              event.cancelBubble = true;
          }
      }

      // *-메시지 팝업
      function LF_messagePOPUP(txt) {
          var x = document.getElementById("snackbar");
          x.innerHTML = txt;
          x.className = "show";

          oTimer = setTimeout(function () {
              clearTimeout(oTimer);
              oTimer = null;

              x.className = x.className.replace("show", "");
          }, 5000);

      }

      // "-메시지 팝업 종료
      function LF_messageHIDE() {
          clearTimeout(oTimer);
          var x = document.getElementById("snackbar");
          x.className = x.className.replace("show", "");

      }

      // editor 조회/수정 모드 전환 처리 펑션
      function LF_setEDITOR(CHK) {

          editor.setReadOnly(true);

          // 저장버튼 활성/ 비활성
          LF_SaveBtnVisible(false);

          if (CHK == "X") {
              editor.setReadOnly(false);

              // 저장버튼 활성/ 비활성
              LF_SaveBtnVisible(true);
          }

      }

      // 저장버튼 활성/ 비활성
      function LF_SaveBtnVisible(bIsVisi) {

          var oBtn = document.getElementById("BTSAVE");
          if (!oBtn) {
              return;
          }

          if (bIsVisi) {
              oBtn.classList.remove("btnHidden");

              //editor에 focus가 발생하면 메시지 팝업을 종료 한다.
              editor.on('focus', function () {
                  LF_messageHIDE();
              });
          } else {
              oBtn.classList.add("btnHidden");
          }

      }

      // Init
      function fnOnInit() {

          editor.resize();

          var oInfo = parent.getEditorInfo(),
              oAppInfo = oInfo.APPINFO,
              oEditorInfo = oInfo.EDITORINFO,
              sSearchValue = oInfo.SRCHVAL, // 검색할 데이터
              L_EDIT = oAppInfo.IS_EDIT; // edit 여부

          // "-Editor 잠금/편집 처리 여부
          LF_setEDITOR(L_EDIT);

          // 에디터에 값 세팅하기
          oAPP.fn.fnSetEditorData(oEditorInfo);

          // 에디터 내의 텍스트 검색할 경우
          if (sSearchValue == null) {
              return;
          }

          // 검색로직 추가 여기다가 텍스트 검색하는 로직 추가 해라..
          oAPP.fn.fnFindText(sSearchValue);




      } // end of fnOnInit


      // 텍스트 검색
      oAPP.fn.fnFindText = (sSearchValue) => {

          debugger;

          // //class 선언
          // .cl_findLine {
          //     position: absolute;
          //     background - color: blue;

          // }


          LF_fineMarker(sSearchValue);


          function LF_fineMarker(v) {

              if (v === "") {
                  return;
              }

              // css 명이 space 로 구분되기 때문에 분리해서 찾음 예 => cl_xxx cl_ttt
              var Tval = v.split(" "),
                  Lmax = Tval.length,
                  i = 0;

              for (i = 0; i < Lmax; i++) {

                  if (Tval[i] === "") {
                      continue;
                  }

                  var Info = editor.find(Tval[i]);
                  if (typeof Info === "undefined") {
                      return;
                  }

                  var oBj = editor.session.addMarker(new oFind.Range(Info.start.row, Info.start.column, Info.end.row, Info.end.column), "cl_findLine", "text");

                  // oFind.aMakers.push(oBj);

                  // Info = null;
                  // oBj = null;

              }

              // var o = document.getElementById('FINDDEL');
              // o.style.display = "block";

          }

          function LF_removeALLMarker() {

              var i = 0;
              var Lmax = oFind.aMakers.length;
              for (i = 0; i < Lmax; i++) {
                  editor.session.removeMarker(oFind.aMakers[i]);
              }

              oFind.aMakers = [];

              // var o = document.getElementById('FINDDEL');
              // o.style.display = "none";

          }

      }; // end of oAPP.fn.fnFindText

      oAPP.fn.fnSetEditorData = function (oEditorInfo) {

          // 로딩 실행
          lf_setEditorBusy('X');

          // 에디터 Default Mode
          editor.session.setMode("ace/mode/text");

          // 에디터에 값 세팅
          editor.setValue(oEditorInfo.DATA);

          // 에디터 타입에 따른 Mode 설정
          switch (oEditorInfo.OBJTY) {
              case "JS":
                  editor.session.setMode("ace/mode/javascript");
                  break;
              case "HM":
                  editor.session.setMode("ace/mode/html");
                  break;
              case "CS":
                  editor.session.setMode("ace/mode/css");
                  break;
          }

          lf_setEditorBusy('');

      };

      // 에디터에 입력한 내용 저장
      oAPP.fn.fnEditorValueSave = function () {

          // 에디터가 혹시라도 읽기 전용 모드이면 저장하지 않고 빠져나간다.
          if (editor.getReadOnly()) {
              return;
          }

          //   "메시지 팝업 종료
          LF_messageHIDE();

          //   "waiting        
          lf_setEditorBusy('X');

          // 에디터 정보, APP 정보, ServerHost 정보를 구한다.
          var oInfo = parent.getEditorInfo();

          var oEditorInfo = oInfo.EDITORINFO,

              oSaveEditorData = jQuery.extend(true, {}, oEditorInfo);

          oSaveEditorData.DATA = editor.getValue();

          var BROWSKEY = parent.getBrowserKey();

          oAPP.IPCRENDERER.send("if-editor-save", {
              BROWSKEY: BROWSKEY,
              IS_CHAG: "X",
              SAVEDATA: oSaveEditorData
          });

          lf_setEditorBusy('');

          let sMsg = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D23"); // Editor
          sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "330", sMsg); // &1 has been saved

          LF_messagePOPUP(sMsg);

      }; // end of oAPP.fn.fnEditorValueSave

      // *-윈도우 오류
      window.onerror = function (message, source, lineno, colno, error) {
          alert("EDIT ERRO:" + message);
      };

      //문서 실행
      $(document).ready(function () {

          // 클라이언트 세션 유지를 위한 function
          oAPP.fn.fnKeepClientSession();

          //윈도우 resize 이벤트
          $(window).resize(function () {

              var h = $(window).height() - 60;
              editor.resize();

          });

          fnOnInit();

      
        setTimeout(() => {
            $('#maincontent').fadeIn(300, 'linear');

            // 화면이 다 그려지고 난 후 메인 영역 Busy 끄기
		    oAPP.IPCRENDERER.send(`if-send-action-${oAPP.BROWSKEY}`, { ACTCD: "SETBUSYLOCK", ISBUSY: "" }); 

        }, 0);

      });

      window.addEventListener("beforeunload", function () {

          // 윈도우 클릭 이벤트 해제
          window.removeEventListener("click", oAPP.fn.fnWindowClickEventListener);
          window.removeEventListener("keyup", oAPP.fn.fnWindowClickEventListener);

      });

      /************************************************************************
       * 클라이언트 세션 유지를 위한 function
       * **********************************************************************/
      oAPP.fn.fnKeepClientSession = function () {

          // 브라우저의 세션 키
          var sSessionKey = parent.getSessionKey();

          // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
          oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

          // 윈도우 클릭 이벤트 해제
          window.removeEventListener("click", oAPP.fn.fnWindowClickEventListener);
          window.removeEventListener("keyup", oAPP.fn.fnWindowClickEventListener);

          // 윈도우 클릭 이벤트 걸기
          window.addEventListener("click", oAPP.fn.fnWindowClickEventListener);
          window.addEventListener("keyup", oAPP.fn.fnWindowClickEventListener);

      }; // end of oAPP.fn.fnKeepClientSession

      /************************************************************************
       * 브라우저에서 키보드, 마우스 클릭 이벤트를 감지하여 클라이언트 세션을 유지한다.
       * **********************************************************************/
      oAPP.fn.fnWindowClickEventListener = function () {

          // 브라우저의 세션 키
          var sSessionKey = parent.getSessionKey();

          // 로딩할때 세션 타임 시작을 전체 브라우저에 알린다.
          oAPP.IPCRENDERER.send("if-session-time", sSessionKey);

      };

      window.oAPP = oAPP;

  })();