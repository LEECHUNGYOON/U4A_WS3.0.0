/******************************************************************************
 *  💖 LIBRARY LOAD 선언부
 ******************************************************************************/
jQuery.sap.require("sap.m.MessageBox");
// jQuery.sap.require("sap.ui.layout.cssgrid.GridBoxLayout");

sap.ui.getCore().loadLibrary("sap.m"); 
// sap.ui.getCore().loadLibrary("sap.f");
sap.ui.getCore().loadLibrary("sap.ui.layout");
sap.ui.getCore().loadLibrary("sap.ui.richtexteditor");
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


    oContr.types.TY_SNIPPET = {

        name: "",
        desc: "",


        _isnew: false,
        _ischg: false,

    };


    oContr.oModel = new sap.ui.model.json.JSONModel({

        T_SNIPPET_LIST: [],

        S_SNIPPET: {},

    });

    oContr.oModel.setSizeLimit(Infinity);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/
    function _initModel() {











        /* 모델 Refresh*/
        oContr.oModel.refresh();

    } /* end of _initModel */

/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    /*************************************************************
     * @flowEvent - 화면이 로드 될때 타는 이벤트
     *************************************************************/
    oContr.onViewReady = async function () {

        await oContr.fn.setInit();

        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady

    /**
     * 초기 설정
     */
    oContr.fn.setInit = async function () {

        /* 초기 모델 설정 */
        _initModel();


    }; /* end of oContr.fn.setInit */



    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/





/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };