let oAPP = null;

oAPP = {
//====================================================//
//[펑션] 스타트 
//====================================================//    
  onStart: ()=> {
      oAPP.remote = require('@electron/remote');
      oAPP.ipcRenderer = require('electron').ipcRenderer;
      oAPP.fs     = oAPP.remote.require('fs');
      oAPP.path   = oAPP.remote.require('path');
      oAPP.WIN    = oAPP.remote.getCurrentWindow();
      oAPP.PARENT = oAPP.WIN.getParentWindow();
      oAPP.SSID = "";

      oAPP.ipcRenderer.on('IF-REC-CONTROLLER', async (event, data) => {

          //레코딩 윈도우 영역 <=> 현재 윈도우 송수신 I/F 세션 ID 
          oAPP.SSID = data.SSID;

          let OS = oAPP.remote.require("systeminformation");

          let oSysinfo = await OS.osInfo();          

          //OS Verstion WIN10, WIN11...          
          oAPP.OS_VER = oSysinfo.distro.toUpperCase();

          //컨트롤러 - 레코딩 on/off 버튼 이벤트 설정 
          oAPP.onSetREC_Switch();

          //컨트롤러 - 기타 기능 이벤트 설정 
          oAPP.onSetETC_Controlle();
          
      });

  },

  //====================================================//
  //[펑션] //컨트롤러 - 레코딩 on/off 이벤트 설정 
  //====================================================//   
  onSetETC_Controlle : ()=> {  

        //드로잉 설정 여부 체크박스 이벤트 
        document.getElementsByClassName("drow-checkbox")[0].addEventListener("click", (e)=>{

            var isCHK = document.getElementById("check1").checked;

              //드로잉 체크박스 값에 따른 드로잉 초기화 버튼 활성/비활성 처리
              if(isCHK){  //드로잉 설정

                  //레코딩 영역에 처리 액션코드 전송 
                  oAPP.onSendIPC("03");  //드로잉 설정

                  //드로잉 초기화 버튼 활성 
                  document.getElementsByClassName("drow-initial-Button")[0].style.display = "";
            

              }else{  //드로잉 해제 

                  //레코딩 영역에 처리 액션코드 전송 
                  oAPP.onSendIPC("04"); //드로잉 해제

                  //해제
                  document.getElementsByClassName("drow-initial-Button")[0].style.display = "none"; 

                
              }

        });


        //드로잉 초기화 버튼 이벤트 
        document.getElementsByClassName("drow-initial-Button")[0].addEventListener("click", (e)=>{
            e.preventDefault();

            //레코딩 영역에 처리 액션코드 전송 
            oAPP.onSendIPC("05"); //드로잉 초기화 

        });


        //레코딩 종료  
        document.getElementsByClassName("recording-close-Button")[0].addEventListener("click", (e)=>{
            e.preventDefault();
            //윈도우 종료 
            oAPP.remote.getCurrentWindow().close();

        });


  },

  //====================================================//
  //[펑션] 레코딩 윈도우 <-- IPC 통신 
  //====================================================//   
  onSendIPC : (P_ACTCD)=> {
      oAPP.PARENT.webContents.send(oAPP.SSID, {ACTCD: P_ACTCD});
    
  },
  

  //====================================================//
  //[펑션] 레코딩 시작
  //====================================================//   
  onRecordStart : ()=> {

      //레코딩 영역에 처리 액션코드 전송 
      oAPP.onSendIPC("01");

      //드로잉 여부 체크박스 해제 
      document.getElementById("check1").checked = false; 
      
      //PC OS별 기능 제어
      //윈도우10 아닐 경우 
      if(oAPP.OS_VER.indexOf("10") == -1){ 
          document.getElementsByClassName("drow-checkbox")[0].style.display = "none";
          return;

      }

      //드로잉 체크박스 활성 
      document.getElementsByClassName("drow-checkbox")[0].style.display = "";

  },


  //====================================================//
  //[펑션] 레코딩 중지
  //====================================================//   
  onRecordStop : ()=> {

      //레코딩 영역에 처리 액션코드 전송 
      oAPP.onSendIPC("02");

      //레코딩 다운 종료 
      var toggleButton = document.getElementById("toggle-button");
          toggleButton.className = "clickable movedown";


      //드로잉 여부 체크박스 숨김 처리
      document.getElementById("check1").checked = false;
      document.getElementsByClassName("drow-checkbox")[0].style.display = "none";
                
 
      //드로잉 초기화 버튼 숨김 처리
      document.getElementsByClassName("drow-initial-Button")[0].style.display = "none";  

  },

  //====================================================//
  //[펑션] //컨트롤러 - 레코딩 on/off 이벤트 설정 
  //====================================================//   
  onSetREC_Switch : ()=> {

      let touchstartX = 0;
      let touchstartY = 0;
      let touchendX = 0;
      let touchendY = 0;
      
      const gestureZone = document.getElementById("app-cover");
      const toggleButton = document.getElementById("toggle-button");
      const recText = document.getElementsByClassName("rec-text");
      const activeText = document.getElementById("active-text");
      const clickaBleElements = document.getElementsByClassName("clickable");
      
      toggleButton.addEventListener(
        "click",
        function (event) {
          event.preventDefault();
          
          //클래스 정보가 누락이라면 레코딩 시작으로 간주 
          if(typeof toggleButton.classList[1] === "undefined"){ 
              oAPP.onRecordStart();   //레코딩 시작 
              return; 
          }

          switch (toggleButton.classList[1]) {
            case "moveup":
              oAPP.onRecordStop();  //레코딩 종료
              break;
          
            case "movedown":
              oAPP.onRecordStart(); //레코딩 시작
              break;

          }
          
        },
        false
      );
      
      
      var timerInterval = null,
          swipeDir = -1,
          toggle = false,
          cElms = clickaBleElements.length;
      
      gestureZone.addEventListener(
        "touchstart",
        function (event) {
          touchstartX = event.changedTouches[0].screenX;
          touchstartY = event.changedTouches[0].screenY;
        },
        false
      );
      
      gestureZone.addEventListener(
        "touchend",
        function (event) {
          touchendX = event.changedTouches[0].screenX;
          touchendY = event.changedTouches[0].screenY;
          handleGesture();
        },
        false
      );
      
      function startRecorder() {
        var sec = "00",
          min = 0;
        activeText.classList.add("lspace");
        activeText.innerText = min + ":" + sec;
        timerInterval = setInterval(function () {
          sec = parseInt(sec);
          ++sec;
          if (sec == 60) {
            sec = "00";
            ++min;
          } else {
            if (sec < 10) sec = "0" + sec;
          }
      
          activeText.innerText = min + ":" + sec;
        }, 1000);
      }
      
      function swipeUp() {
        if (swipeDir == 2) return;
        else swipeDir = 2;
      
        toggleButton.classList.remove("movedown");
        toggleButton.classList.add("moveup");
        setTimeout(function () {
          recText[1].classList.remove("active");
          activeText.classList.add("active");
          startRecorder();
        }, 600);
      }
      
      function swipeDown() {
        if (swipeDir == -1 || swipeDir == 1) return;
        else swipeDir = 1;
      
        toggleButton.classList.remove("moveup");
        toggleButton.classList.add("movedown");
        clearInterval(timerInterval);
        setTimeout(function () {
          recText[0].classList.remove("active");
          document.getElementById("stop-text").classList.add("active");
        }, 600);
      
        setTimeout(function () {
          activeText.classList.remove("lspace");
          activeText.innerText = "Record";
        }, 900);
      }
      
      function handleGesture() {
        if (touchendY <= touchstartY) swipeUp();
      
        if (touchendY >= touchstartY) swipeDown();
      }
      
      function toggleRecorder() {
        if (
          this.id == "toggle-button" ||
          (this.id == "stop-text" && toggle == true) ||
          (this.id == "active-text" && toggle == false)
        )
          _toggleRecorder();
        else return;
      }
      
      function _toggleRecorder() {
        if (toggle) {
          swipeDown();
          toggle = false;
        } else {
          swipeUp();
          toggle = true;
        }
      }
      
      for (i = 0; i < cElms; i++) {
        clickaBleElements[i].addEventListener("click", toggleRecorder, false);
      }    

  }

};

/* ================================================================= */
/* dom ready
/* ================================================================= */
document.addEventListener('DOMContentLoaded', ()=> {    
    oAPP.onStart();

});

/*
function test(){
    var oWin    = oAPP.remote.getCurrentWindow();
    var oParent = oWin.getParentWindow();
        oParent.webContents.send(oAPP.SSID, {});


}
*/
