/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
// jQuery.sap.require("sap.m.MessageBox");
// jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

// sap.ui.getCore().loadLibrary("sap.m"); 
// sap.ui.getCore().loadLibrary("sap.f");
// sap.ui.getCore().loadLibrary("sap.ui.layout");
// sap.ui.getCore().loadLibrary("sap.ui.unified");    


/******************************************************************************
*  💖 DATA / ATTRIBUTE 선언부
******************************************************************************/

const 
    oContr          = {};
    oContr.msg      = {};
    oContr.ui       = {};
    oContr.fn       = {};
    oContr.types    = {};
    oContr.attr     = {};


    oContr.oModel = new sap.ui.model.json.JSONModel({


    });

    oContr.oModel.setSizeLimit(Infinity);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/

    // 메시지 구성
    _getWsMsg();


    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/

  


    /*************************************************************
     * @function - 공통 메시지 구성
     *************************************************************/
    function _getWsMsg() {

        // let sLANGU = parent.LANGU;
        // parent.WSUTIL.getWsMsgClsTxt(sLANGU, "ZMSG_WS_COMMON_001", "290"); // 다시 시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.

        // oContr.msg.M001 = "선택된 버전 항목이 없습니다.";
        // oContr.msg.M002 = "하나의 어플리케이션만 선택하세요.";
        // oContr.msg.M003 = "다시 시도 하시거나, 문제가 지속될 경우 U4A 솔루션 팀에 문의 하세요.";
        // oContr.msg.M004 = "현재 버전은 선택할 수 없습니다.";

        
    } // end of _getWsMsg


/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        zconsole.log("onViewReady");

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady


	/*************************************************************
	 * @function - Busy Indicator
	 *************************************************************/
	oContr.fn.setBusy = function (bIsbusy, oOptions) {

        let sIsBusy = (bIsbusy === true ? "X" : "");

		// oAPP.fn.setBusy(sIsBusy);
        
        // oAPP.fn.setBusyDialog(sIsBusy, oOptions);

	}; // end of oContr.fn.setBusy

    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/





/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };