export async function getControl() {

/********************************************************************
 *  📝 LIBRARY LOAD 선언부
 ********************************************************************/
    jQuery.sap.require("sap.m.MessageBox");
    
    
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
        
    // oContr.msg.E34 = parent.oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E34", "", "", "", ""); // Please resize the browser window


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
            cssnm: "sapUiResponsiveMargin",
            text: "sapUiResponsiveMargin",
            desc: `All panels on this page use css class 'sapUiResponsiveMargin' to clear space all around, depending on the available width. \n \n
            이 페이지의 모든 패널은 사용 가능한 너비에 따라 css 클래스 'sapUiResponsiveMargin'을 사용하여 주변의 공간을 비웁니다.`
        }, {
            selected: false,
            cssnm: "sapUiResponsiveMargin",
            text: "",
            desc: `Please resize the browser window and/or use the 'Full Screen' button to see how the margins change. \n \n
            브라우저 창의 크기를 조정하거나 '전체 화면' 버튼을 사용하여 여백이 어떻게 변경되는지 확인하세요.`
        }, {
            selected: false,
            cssnm: "sapUiResponsiveMargin",
            text: "",
            desc: `Since panels have a default width of 100%, horizontal margins are not displayed appropriately.\n \n
            패널의 기본 너비는 100%이므로 가로 여백이 적절하게 표시되지 않습니다.`
        }, {
            selected: false,
            cssnm: "sapUiResponsiveMargin",
            text: "",
            desc: `Therefore we need to set each panel's 'width' property to 'auto'. \n \n
            따라서 각 패널의 'width' 속성을 'auto'로 설정해야 합니다.`
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