export async function getControl() {

/********************************************************************
 *  📝 LIBRARY LOAD 선언부
 ********************************************************************/
    jQuery.sap.require("sap.m.MessageBox");

    sap.ui.getCore().loadLibrary("sap.f");
    sap.ui.getCore().loadLibrary("sap.ui.layout");
    
/********************************************************************
 * 💖 DATA / ATTRIBUTE 선언부
 ********************************************************************/
    const 
        oContr          = {};
        oContr.ui       = {};
        oContr.fn       = {};
        oContr.attr     = {};
        oContr.types    = {};
        oContr.msg      = {};
        
        oContr.IF_DATA  = parent.IF_DATA;

        oContr.oModel = new sap.ui.model.json.JSONModel({
            T_CSS_LIST: [],
            TITLE: oContr.IF_DATA.TITLE    
        });

        oContr.oModel.setSizeLimit(Infinity);


        
/********************************************************************
 * 💖 메시지 텍스트 구성
 ********************************************************************/
oContr.msg.M385 = parent.oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "385", "", "", "", ""); // Please resize the browser window        







/********************************************************************
 * 💖 PRIVATE FUNCTION 선언부
 ********************************************************************/







/********************************************************************
 * 💖 PUBLIC FUNCTION 선언부
 ********************************************************************/


    /*******************************************************************
     *📝 Flow Event Definitions
     *******************************************************************/


    /*******************************************************
     * @function - 화면이 로드 될때 호출되는 function
     *******************************************************/
    oContr.onViewReady = function(){

        oContr.fn.onInit();

    }; // end of oContr.onViewReady



    /*******************************************************************
     *📝 Flow Procces Definitions
     *******************************************************************/


    /*******************************************************
     * @function - Application Init 
     *******************************************************/
    oContr.fn.onInit = async function(){

        var aItems = [{
            selected: false,
            text: "sapUiNoMarginBegin"
        }, {
            selected: false,
            text: "sapUiNoMarginEnd"
        }, {
            selected: false,
            text: "sapUiNoMarginTop"
        }, {
            selected: false,
            text: "sapUiNoMarginBottom"
        }];


        oContr.oModel.oData.T_CSS_LIST = aItems;

        oContr.oModel.refresh();    

        oContr.fn.setBusy(false);

    }; // end of oContr.fn.onInit






    /*******************************************************
     * @function - Busy indicator 실행
     *******************************************************/
    oContr.fn.setBusy = function(bIsBusy){

        oAPP.ui.ROOT.setBusy(bIsBusy === true ? true : false);

        return bIsBusy === true ? sap.ui.getCore().lock() : sap.ui.getCore().unlock();

    }; // end of oContr.ui.setBusy







/********************************************************************
 *💨 EXPORT
 *********************************************************************/
    return oContr;

}