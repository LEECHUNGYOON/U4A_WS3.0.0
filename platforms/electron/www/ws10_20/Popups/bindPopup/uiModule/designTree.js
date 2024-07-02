/********************************************************************
 *📝 design 영역 구성.
********************************************************************/
export async function start(oArea){

    return new Promise(async (res) => {

        //design 영역 화면 구성.
        var _oContr = await designView(oArea);

        var _oPromise = _oContr.fn.uiUpdateComplate(oArea);

        oArea.invalidate();

        await _oPromise;


        //화면 구성 이후 View Start
        await _oContr.onViewReady();

        return res(_oContr);

    });

}



/********************************************************************
 *📝 design 영역 control 정보 구성.
********************************************************************/
function designControl(oArea){

    return new Promise(async (res) => {


        /******************************************************************
         *📝 DATA / ATTRIBUTE 선언부
        *******************************************************************/ 

        //디자인 TREE의 라인 데이터 유형.
        const CS_DATYP = {
            UOBJ  : "01",   //UI 정보(T_0014)
            ATTR  : "02",   //ATTRIBUTE 정보(T_0015)
            ATTY  : "03"    //ATTBIBUTE 유형 정보(Property, Aggregation)
        };

        const 
            oContr         = {};
            oContr.ui      = {};
            oContr.ui.ROOT = undefined;
            oContr.fn      = {};
            oContr.attr    = {};


            oContr.types   = {};

            //디자인 tree 바인딩 정보.
            oContr.types.TY_TREE_DESIGN = {

                PARENT        : "",     //PARENT KEY.
                CHILD         : "",     //CHILD KEY.
                DESCR         : "",     //오브젝트 내역(OBJECT ID, ATTRIBUTE NAME)
                SUBTX         : "",     //서브 TEXT

                OBJID         : "",     //UI OBJECT ID(BUTTON1)
                PUIATK        : "",     //EMBED AGGREGATION.

                UIOBK         : "",     //UI OBJECT KEY.

                UILIB         : "",
                POBID         : "",
                PUIOK         : "",


                UIATK         : "",     //ATTRIBUTE KEY
                UIATT         : "",     //ATTRIBUTE REAL NAME
                UIASN         : "",     //ATTRIBUTE UPPER NAME
                UIATY         : "",     //UI Attribute Type

                ISMLB         : "",     //Is Multie Value Bind? (Yes : X)
                UIADT         : "",     //ATTRIBUTE TYPE.
                ISSTR         : "",     //Is String allow Aggregation? (Yes : X)


                UIATV         : "",     //바인딩 정보.
                ISBND         : "",     //바인딩 여부 필드.
                ISSPACE       : "",     //공백값 입력 여부.
                ADDSC         : "",     //Added Source Type(HM: 'HTML', JS: 'JavaScript', CS: 'CSS')
                MPROP         : "",     //바인딩 추가속성 정보.
                ISWIT         : "",     //Is Use Wait?(Yes : X)

                //T_0014 정보.
                S_14_APPID    : "", 
                S_14_GUINR    : "", 
                S_14_OBJID    : "", 
                S_14_POSIT    : "", 
                S_14_POBID    : "", 
                S_14_UIOBK    : "", 
                S_14_PUIOK    : "", 
                S_14_ISAGR    : "", 
                S_14_AGRID    : "", 
                S_14_ISDFT    : "", 
                S_14_OBDEC    : "", 
                S_14_AGTYP    : "", 
                S_14_UIATK    : "", 
                S_14_UIATT    : "", 
                S_14_UIASN    : "", 
                S_14_UIATY    : "", 
                S_14_UIADT    : "", 
                S_14_UIADS    : "", 
                S_14_VALKY    : "", 
                S_14_ISLST    : "", 
                S_14_ISMLB    : "", 
                S_14_TOOLB    : "", 
                S_14_UIFND    : "", 
                S_14_PUIATK   : "", 
                S_14_UILIB    : "",
                S_14_ISEXT    : "",
                S_14_TGLIB    : "",
                S_14_DEL_UOK  : "",
                S_14_DEL_POK  : "",
                S_14_ISECP    : "",


                DATYP           : "",       //데이터 유형(01: T_0014 정보, 02:T_0015 정보, 03:ATTR 표현 정보)

                EMATT           : "",       //EMBED AGGREGATION
                EMATT_ICON      : null,     //EMBED AGGREGATION 아이콘.

                chk_seleced     : false,    //체크박스 선택 여부.
                _check_vs       : null,     //체크박스 

                _highlight      : null,     //오류 표현 필드.

                _style          : "",       //라인 css style 바인딩 필드.
                _error_tooltip  : "",       //오류 표현 툴팁.

                _image_src      : null,     //UI ICON(image src).
                _icon_src       : null,     //UI ICON(icon src).

                _image_visible  : false,    //아이콘 활성여부
                _icon_visible   : false,    //아이콘 활성여부

                _bind_visible   : false,    //추가속성 바인딩 버튼 활성여부
                _unbind_visible : false,    //unbind 버튼 활성여부

                _check_visible  : false,    //체크박스 활성 여부.

                _drop_enable    : false,    //drop 가능 여부.

                _bind_error     : false,    //바인딩시 오류 flag.

            };


            //디자인 tree 영역 모델 정보.
            oContr.oModel = new sap.ui.model.json.JSONModel({
                TREE_DESIGN  : [],

                zTREE_DESIGN : []
            });


        /********************************************************************
         *📝 PRIVITE FUNCTION 선언부
        *******************************************************************/

            /*******************************************************
            * @function - 바인딩 추가 속성 정보 갱신 처리.
            *******************************************************/  
            function _refreshAdditBindInfo(){
                    
                //링크 선택건이 존재하지 않는경우 exit.
                if(typeof oAPP.attr.oModel.oData.S_SEL_ATTR === "undefined"){
                    return;
                }

                var _sAttr = oAPP.attr.oModel.oData.S_SEL_ATTR;

                //링크 선택건에 해당하는 라인 정보 얻기.
                var _sTree = oAPP.fn.getDesignTreeAttrData(_sAttr.OBJID, _sAttr.UIATK);
                
                if(typeof _sTree === "undefined"){
                    return;
                }


                //바인딩 추가 속성 정보 갱신 처리.
                _showBindAdditInfo(_sTree);

            }


            /*******************************************************
            * @function - 바인딩 추가 속성 정보 보기
            *******************************************************/  
            function _showBindAdditInfo(sTree){

                //바인딩 추가속성 정보 초기화.
                oAPP.fn.clearSelectAdditBind();
                

                if(typeof sTree === "undefined"){
                    
                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");

                    return;
                }
                
                //바인딩 정보가 존재하지 않는경우.
                if(sTree.UIATV === ""){

                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");
                    return;

                }


                //프로퍼티 바인딩건이 아닌경우.
                if(sTree.UIATY !== "1"){

                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");
                    return;

                }


                //모델 필드 정보 얻기.
                var _sBind = oAPP.fn.getModelBindData(sTree.UIATV, oAPP.attr.oModel.oData.zTREE);
                
                if(typeof _sBind === "undefined"){

                    //150	&1 필드가 모델 항목에 존재하지 않습니다.
                    sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "150", sTree.UIATV),
                        {duration: 3000, at:"center center", my:"center center"});

                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");
                    return;
                }


                //일반 필드가 아닌경우.
                if(_sBind.KIND !== "E"){
                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");
                    return;
                }

                
                //부모 필드 정보 얻기.
                var _sParent = oAPP.fn.getModelBindData(_sBind.PARENT, oAPP.attr.oModel.oData.zTREE);

                if(typeof _sParent === "undefined"){

                    //150	&1 필드가 모델 항목에 존재하지 않습니다.
                    sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "150", _sBind.PARENT),
                        {duration: 3000, at:"center center", my:"center center"});

                    //추가속성 정보 화면 비활성 처리.
                    oAPP.fn.setAdditLayout("");
                    return;
                }


                //선택한 라인 정보 광역화.
                oAPP.attr.oModel.oData.S_SEL_ATTR = JSON.parse(JSON.stringify(sTree));


                //추가속성 정보 출력 처리.
                oAPP.fn.setAdditBindInfo(_sBind, sTree.MPROP, _sParent.zTREE);


                //레이아웃 변경.
                oAPP.fn.setAdditLayout(_sBind.KIND);

            }


            /*******************************************************
            * @function - 미리보기 구조 구성.
            *******************************************************/  
            function _setPrevData(s0014){

                oAPP.attr.prev[s0014.OBJID] = {};

                var _oUi = oAPP.attr.prev[s0014.OBJID];


                _oUi._UILIB = s0014.UILIB;


                //프로퍼티 정보를 대상 UI에 매핑 처리.
                _oUi._T_0015 = oAPP.attr.T_0015.filter( item => item.OBJID === s0014.OBJID );
                
                //aggr에 바인딩처리한 구조.
                _oUi._MODEL = {};
                

                //Aggregation에 N건 모델 바인딩 처리시 모델정보 ui에 매핑 처리.
                oAPP.fn.setAggrBind(_oUi);

                //N건 바인딩 수집정보
                _oUi._BIND_AGGR = {};   

                //생성한 UI에 OBJID 매핑.
                _oUi._OBJID = s0014.OBJID;


                //EMBED Aggregation 정보 얻기.
                var ls_embed = _oUi._T_0015.find( a => a.OBJID === s0014.OBJID && a.UIATY === "6" );

                //최상위 정보인경우 exit.
                if(typeof ls_embed === "undefined"){
                    return;
                }
                
                //부모 UI 정보.
                oAPP.attr.prev[s0014.OBJID].__PARENT = oAPP.attr.prev[s0014.POBID];
                
                //embed aggregation 정보.
                oAPP.attr.prev[s0014.OBJID]._EMBED_AGGR = ls_embed.UIATT;
                
                //UI에 바인딩처리된경우 부모 UI에 해당 정보 매핑.
                oAPP.fn.setModelBind(_oUi);
                
            }


            /*******************************************************
            * @function - table 파생건 여부 확인.
            *******************************************************/ 
            function _isTablePath(KIND_PATH){

                if(typeof KIND_PATH === "undefined"){
                    return false;
                }

                //현재 입력 path의 마지막 KIND 정보 제거.
                let _parentPath = KIND_PATH.slice(0, KIND_PATH.length - 2);

                //경로에 해당하는 KIND에 테이블이 존재하는경우.
                if(_parentPath.indexOf("T") !== -1){
                    //TABLE 로 파생된 필드 flag return.
                    return true;
                }

                return false;

            }

            
            /*******************************************************
            * @function - 디자인 트리 바인딩 데이터 구성.
            *******************************************************/
            function _setDesignTreeData0014(s0014, aTree){
                
                var _sTree = JSON.parse(JSON.stringify(oContr.types.TY_TREE_DESIGN));

                _sTree.PARENT       = s0014.POBID;

                //현재 tree에서 부모 정보 검색시 부모를 찾을 수 없는경우.
                if(oAPP.attr.T_0014.findIndex( item => item.OBJID === s0014.POBID ) === -1){
                    //ROOT로 부모 ID 초기화.
                    _sTree.PARENT = "";
                }

                _sTree.CHILD        = s0014.OBJID;
                _sTree.OBJID        = s0014.OBJID;
                _sTree.DESCR        = s0014.OBJID;
                _sTree.PUIATK       = s0014.PUIATK;

                _sTree.UILIB         = s0014.UILIB;
                _sTree.POBID         = s0014.POBID;
                _sTree.PUIOK         = s0014.PUIOK;

                //DESIGN TREE의 라인 정보.
                _sTree.S_14_APPID   = s0014.APPID;
                _sTree.S_14_GUINR   = s0014.GUINR;
                _sTree.S_14_OBJID   = s0014.OBJID;
                _sTree.S_14_POSIT   = s0014.POSIT;
                _sTree.S_14_POBID   = s0014.POBID;
                _sTree.S_14_UIOBK   = s0014.UIOBK;
                _sTree.S_14_PUIOK   = s0014.PUIOK;
                _sTree.S_14_ISAGR   = s0014.ISAGR;
                _sTree.S_14_AGRID   = s0014.AGRID;
                _sTree.S_14_ISDFT   = s0014.ISDFT;
                _sTree.S_14_OBDEC   = s0014.OBDEC;
                _sTree.S_14_AGTYP   = s0014.AGTYP;
                _sTree.S_14_UIATK   = s0014.UIATK;
                _sTree.S_14_UIATT   = s0014.UIATT;
                _sTree.S_14_UIASN   = s0014.UIASN;
                _sTree.S_14_UIATY   = s0014.UIATY;
                _sTree.S_14_UIADT   = s0014.UIADT;
                _sTree.S_14_UIADS   = s0014.UIADS;
                _sTree.S_14_VALKY   = s0014.VALKY;
                _sTree.S_14_ISLST   = s0014.ISLST;
                _sTree.S_14_ISMLB   = s0014.ISMLB;
                _sTree.S_14_TOOLB   = s0014.TOOLB;
                _sTree.S_14_UIFND   = s0014.UIFND;
                _sTree.S_14_PUIATK  = s0014.PUIATK
                _sTree.S_14_UILIB   = s0014.UILIB;
                _sTree.S_14_ISEXT   = s0014.ISEXT;
                _sTree.S_14_TGLIB   = s0014.TGLIB;
                _sTree.S_14_DEL_UOK = s0014.DEL_UOK;
                _sTree.S_14_DEL_POK = s0014.DEL_POK;
                _sTree.S_14_ISECP   = s0014.ISECP;

                //01: T_0014 정보
                _sTree.DATYP        = CS_DATYP.UOBJ;

                //UI 표현 처리.
                _sTree._highlight   = "Success";

                //EMBED AGGREGATION 정보.
                _sTree.EMATT        = _sTree.S_14_UIATT;


                //EMBED AGGREGATION 정보가 존재하는경우.
                if(_sTree.EMATT !== ""){
                    //default 0:1 표현 아이콘
                    _sTree.EMATT_ICON        = "sap-icon://color-fill";

                    //N건 입력가능한 AGGREGATION 인경우
                    if(_sTree.S_14_ISMLB === "X"){
                        //0:N 표현 아이콘
                        _sTree.EMATT_ICON    = "sap-icon://dimension";
                    }

                }
                

                
                var _s0022 = oAPP.attr.T_0022.find( item => item.UIOBK === _sTree.S_14_UIOBK );

                if(typeof _s0022 !== "undefined"){
                    _sTree._image_src     = oAPP.fn.fnGetSapIconPath(_s0022.UICON);
                    _sTree._image_visible = true;
                }
               

                aTree.push(_sTree);


            }


            /*******************************************************
            * @function - 디자인 트리 프로퍼티 정보 구성.
            *******************************************************/
            function _setDesignTreeDataProp(s0014, aTree){

                var _aT_0023 = oAPP.attr.T_0023.filter( item => item.UIOBK === s0014.UIOBK );

                if(_aT_0023.length === 0){
                    return;
                }

                //프로퍼티 정보 검색.
                var _aProp = _aT_0023.filter( item => item.UIATY === "1" || 
                    ( item.UIATY === "3" && item.ISSTR === "X" ) );
                
                
                if(_aProp.length === 0){
                    return;
                }


                var _sTree = JSON.parse(JSON.stringify(oContr.types.TY_TREE_DESIGN));

                _sTree.PARENT       = s0014.OBJID;
                _sTree.CHILD        = `${s0014.OBJID}-PROP`;
                _sTree.OBJID        = s0014.OBJID;
                _sTree.DESCR        = "Properties";
                _sTree.SUBTX        = ` : ${s0014.OBJID}`;

                //03:ATTR 표현 정보
                _sTree.DATYP        = CS_DATYP.ATTY;

                aTree.push(_sTree);


                for (let i = 0; i < _aProp.length; i++) {

                    var _sProp = _aProp[i];

                    var _sTree = JSON.parse(JSON.stringify(oContr.types.TY_TREE_DESIGN));


                    _sTree.PARENT       = `${s0014.OBJID}-PROP`;
                    _sTree.CHILD        = `${s0014.OBJID}-${_sProp.UIATK}`;

                    _sTree.OBJID        = s0014.OBJID;
                    _sTree.UIOBK        = s0014.UIOBK;

                    _sTree.UILIB         = s0014.UILIB;
                    _sTree.POBID         = s0014.POBID;
                    _sTree.PUIOK         = s0014.PUIOK;

                    //ATTRIBUTE KEY
                    _sTree.UIATK        = _sProp.UIATK;

                    //ATTRIBUTE NAME
                    _sTree.UIATT        = _sProp.UIATT;
                    _sTree.UIASN        = _sProp.UIASN;

                    //UI Attribute Type
                    _sTree.UIATY        = _sProp.UIATY;

                    _sTree.UIADT        = _sProp.UIADT;

                    //Is Multie Value Bind? (Yes : X)
                    _sTree.ISMLB        = _sProp.ISMLB;

                    //Is String allow Aggregation? (Yes : X)
                    _sTree.ISSTR        = _sProp.ISSTR;

                    //직접 입력 가능한 aggregation인경우.
                    if(_sProp.UIATY === "3" && _sProp.ISSTR === "X"){
                        _sTree.CHILD += "_1";
                        _sTree.UIATK += "_1";

                        _sTree.UIATY = "1";

                    }

                    _sTree.DESCR          = _sProp.UIATT;

                    //02:T_0015 정보
                    _sTree.DATYP          = CS_DATYP.ATTR;

                    _sTree._icon_src      = "sap-icon://customize";
                    _sTree._icon_visible  = true;

                    //체크박스 활성화.
                    _sTree._check_visible = true;

                    aTree.push(_sTree);

                }


            }


            /*******************************************************
            * @function - 디자인 트리 Aggregation 정보 구성.
            *******************************************************/
            function _setDesignTreeDataAggr(s0014, aTree){

                var _aT_0023 = oAPP.attr.T_0023.filter( item => item.UIOBK === s0014.UIOBK  );

                if(_aT_0023.length === 0){
                    return;
                }

                //n건 입력 가능한 aggregation 정보 발췌.
                var _aAggr = _aT_0023.filter( item => item.UIATY === "3" && item.ISMLB === "X" );
                
                
                if(_aAggr.length === 0){
                    return;
                }


                var _sTree = JSON.parse(JSON.stringify(oContr.types.TY_TREE_DESIGN));

                _sTree.PARENT       = s0014.OBJID;
                _sTree.CHILD        = `${s0014.OBJID}-AGGR`;
                _sTree.OBJID        = s0014.OBJID;
                _sTree.DESCR        = "Aggregations";
                _sTree.SUBTX        = ` : ${s0014.OBJID}`;

                //03:ATTR 표현 정보
                _sTree.DATYP        = CS_DATYP.ATTY;

                aTree.push(_sTree);


                for (let i = 0; i < _aAggr.length; i++) {

                    var _sAggr = _aAggr[i];

                    var _sTree = JSON.parse(JSON.stringify(oContr.types.TY_TREE_DESIGN));


                    _sTree.PARENT         = `${s0014.OBJID}-AGGR`;
                    _sTree.CHILD          = `${s0014.OBJID}-${_sAggr.UIATK}`;

                    _sTree.OBJID          = s0014.OBJID;
                    _sTree.UIOBK          = s0014.UIOBK;

                    _sTree.UILIB          = s0014.UILIB;
                    _sTree.POBID          = s0014.POBID;
                    _sTree.PUIOK          = s0014.PUIOK;

                    //ATTRIBUTE KEY
                    _sTree.UIATK          = _sAggr.UIATK;

                    //ATTRIBUTE NAME
                    _sTree.UIATT          = _sAggr.UIATT;
                    _sTree.UIASN          = _sAggr.UIASN;

                    //UI Attribute Type
                    _sTree.UIATY          = _sAggr.UIATY;

                    _sTree.UIADT          = _sAggr.UIADT;


                    //Is String allow Aggregation? (Yes : X)
                    _sTree.ISSTR          = _sAggr.ISSTR;

                    //Is Multie Value Bind? (Yes : X)
                    _sTree.ISMLB          = _sAggr.ISMLB;

                    _sTree.DESCR          = _sAggr.UIATT;

                    //02:T_0015 정보
                    _sTree.DATYP          = CS_DATYP.ATTR;

                    _sTree._icon_src      = "sap-icon://dimension";
                    _sTree._icon_visible  = true;

                    //체크박스 활성화.
                    _sTree._check_visible = true;

                    aTree.push(_sTree);

                }


            }


            /*******************************************************
            * @function - 이전 바인딩 정보 매핑 처리.
            *******************************************************/
            function _setBindAttrData(s0014, aTree){

                //이전 바인딩된 정보 발췌.
                var _aT_0015 = oAPP.attr.T_0015.filter( item => item.OBJID === s0014.OBJID && item.ISBND === "X" );

                if(_aT_0015.length === 0){
                    return;
                }

                for (let i = 0, l = _aT_0015.length; i < l; i++) {
                    
                    var _sT_0015 = _aT_0015[i];


                    var _sTree = aTree.find( item => item.OBJID === _sT_0015.OBJID && item.UIATK === _sT_0015.UIATK );

                    if(typeof _sTree === "undefined"){
                        continue;
                    }

                    //바인딩 정보.
                    _sTree.UIATV   = _sT_0015.UIATV;

                    //바인딩 여부 필드.
                    _sTree.ISBND   = _sT_0015.ISBND;

                    //공백값 입력 여부.
                    _sTree.ISSPACE = _sT_0015.ISSPACE;

                    //바인딩 추가속성 정보.
                    _sTree.MPROP   = _sT_0015.MPROP;

                    //Added Source Type(HM: 'HTML', JS: 'JavaScript', CS: 'CSS')
                    _sTree.ADDSC   = _sT_0015.ADDSC;

                    //Is Use Wait?(Yes : X)
                    _sTree.ISWIT   = _sT_0015.ISWIT;


                    //바인딩 정보에 따른 기능 버튼 활성여부 설정.
                    oAPP.fn.setDesignTreeEnableButton(_sTree);
                    
                    
                }

            }

            /*******************************************************
            * @function - Context 에서 데이터 발췌.
            *******************************************************/
            function _getContextData(oUi){

                if(typeof oUi === "undefined"){
                    return;
                }

                var _oCtxt = oUi.getBindingContext();

                if(typeof _oCtxt === "undefined" || _oCtxt === null){
                    return;
                }

                return _oCtxt.getProperty();


            }


            /*******************************************************
            * @function - drag 데이터 점검.
            *******************************************************/
            function _checkDragData(oData){

                let _sRes = {RETCD:"", RTMSG:"", IF_DATA:{}};
                    

                if(typeof oData === "undefined" || oData === "" || oData === null){
                    _sRes.RETCD = "E";
                    //099	Drag 정보가 존재하지 않습니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "099");
                    return _sRes;
                }

                try {
                    var _sBindData = JSON.parse(oData);    
                } catch (error) {
                    //메시지 처리.                    
                    _sRes.RETCD = "E";

                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }


                //바인딩 데이터 D&D건이 아닌경우.
                if(_sBindData.PRCCD !==  "PRC001"){
                    _sRes.RETCD = "E";
                    //101	해당 작업을 수행할 수 없습니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "101");
                    return _sRes;
                }


                //다른 영역에서 D&D한 데이터 인경우.
                if(oAPP.attr.DnDRandKey !== _sBindData.DnDRandKey){
                    _sRes.RETCD = "E";
                    //102	다른 영역에서의 Drag 정보는 처리할 수 없습니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "102");
                    return _sRes;
                }

                _sRes.IF_DATA = _sBindData.IF_DATA;

                return _sRes;

            }



            /*******************************************************
            * @function - attribute 바인딩 처리.
            *******************************************************/
            async function _setBindAttribute(is_drag, is_drop){

                var _UIATK = is_drop.UIATK;

                //직접 입력 가능한 AGGREGATION인경우.
                if(_UIATK.endsWith("_1") === true){
                    //예외처리를 위해 추가했던 KEY 제거.
                    _UIATK = _UIATK.substr(0, _UIATK.lastIndexOf("_1"));
                }

                //ATTRUBTE 정보 검색.
                var _s0023 = oAPP.attr.T_0023.find( item => item.UIATK === _UIATK );
                if(typeof _s0023 === "undefined"){
                    return;
                }

                //해당 ATTRIBUTE의 UI 정보 얻기.
                var _s0022 = oAPP.attr.T_0022.find( item => item.UIOBK === _s0023.UIOBK );
                if(typeof _s0022 === "undefined"){
                    return;
                }


                //오류 표현 초기화 처리.
                _resetErrorFieldLine(is_drop);

                
                switch (is_drop.UIATY) {
                    case "1":
                        //프로퍼티 바인딩 처리.
                        oAPP.fn.attrSetBindProp(is_drop, is_drag);
                        break;

                    case "3":
                        //aggregation 바인딩 처리.
                        await oAPP.fn.attrBindCallBackAggr(true, is_drag, is_drop);
                        break;
                
                    default:
                        break;
                }
                
            }


            /*******************************************************
            * @function - 디자인 tree 라인 선택 헤제 처리.
            *******************************************************/
            function _clearSelection(aTree){

                if(typeof aTree === "undefined"){
                    return;
                }

                for (let i = 0, l = aTree.length; i < l; i++) {
                    
                    var _sTree = aTree[i];

                    _sTree.chk_seleced = false;

                    //하위를 탐색하며 라인 선택 해제 처리.
                    _clearSelection(_sTree.zTREE_DESIGN);
                    
                }

            }


            /*******************************************************
            * @function - design tree 라인의 의 오류 필드 초기화.
            *******************************************************/
            function _resetErrorFieldLine(sTree){

                //바인딩 오류 flag 초기화.
                sTree._bind_error    = false;

                //체크박스 오류 표현 필드 초기화.
                sTree._check_vs      = null;

                //오류 표현 style 초기화.
                sTree._style         = "";

                //오류 tooltip 초기화.
                sTree._error_tooltip = null;
                
            }


            /*******************************************************
            * @function - design tree의 오류 필드 초기화.
            *******************************************************/
            function _resetErrorField(aTree){

                if(typeof aTree === "undefined"){
                    return;
                }

                if(aTree.length === 0){
                    return;
                }

                for (let i = 0, l = aTree.length; i < l; i++) {
                    
                    var _sTree = aTree[i];

                    //design tree 라인의 의 오류 필드 초기화.
                    _resetErrorFieldLine(_sTree);


                    //하위를 탐색하며, 오류 표현 필드 초기화.
                    _resetErrorField(_sTree.zTREE_DESIGN);
                    
                }

            }


            /*************************************************************
             * @function - design tree에서 drag 한 데이터 점검.
             *************************************************************/
            function _chkDesignTreeDragData(sDragData){

                var _sRes = {RETCD:"", RTMSG:""};

                //DESIGN TREE에서 DRAG한 구조가 아닌경우.
                if(typeof sDragData.RETCD === "undefined"){
                    _sRes.RETCD = "E";                    
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }

                if(typeof sDragData.RTMSG === "undefined"){
                    _sRes.RETCD = "E";
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }

                if(typeof sDragData.DnDRandKey === "undefined"){
                    _sRes.RETCD = "E";
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }

                if(typeof sDragData.T_0014 === "undefined"){
                    _sRes.RETCD = "E";
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }

                if(typeof sDragData.T_0015 === "undefined"){
                    _sRes.RETCD = "E";
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }

                if(typeof sDragData.T_CEVT === "undefined"){
                    _sRes.RETCD = "E";
                    //100	잘못된 Drag 정보 입니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "100");
                    return _sRes;
                }


                //design tree에서 drag했을 당시 drop 불가능 처리로
                //RETURN CODE E를 전달받은경우.
                if(sDragData.RETCD === "E"){
                    _sRes.RETCD = "E";
                    _sRes.RTMSG = sDragData.RTMSG;
                    return _sRes;
                }


                //drag한 UI 정보가 존재하지 않는경우.
                if(sDragData.T_0014.length === 0){
                    _sRes.RETCD = "E";

                    //103	Drag한 UI 정보가 존재하지 않습니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "103");
                    return _sRes;
                }


                //다른 영역에서 DRAG한 정보인경우.
                if(sDragData.DnDRandKey !== oAPP.attr.DnDRandKey){
                    _sRes.RETCD = "E";
                    //104	같은 세션에서만 D&D처리를 할 수 있습니다.
                    _sRes.RTMSG = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "104");
                    return _sRes;
                }


                return _sRes;


            }


            /*************************************************************
             * @function - 디자인 트리 라인 정보 얻기 재귀 function
             *************************************************************/
            function _getDesignTreeLineData(CHILD, aTree){

                if(typeof aTree === "undefined"){
                    return;
                }

                if(aTree.length === 0){
                    return;
                }

                for (let i = 0, l = aTree.length; i < l; i++) {
                    
                    var _sTree = aTree[i];

                    if(_sTree.CHILD === CHILD){
                        return _sTree;
                    }

                    //하위를 탐색하면서 대상 라인 정보 검색.
                    var _sFound = _getDesignTreeLineData(CHILD, _sTree.zTREE_DESIGN);

                    if(typeof _sFound !== "undefined"){
                        return _sFound;
                    }
                    
                }


            }




        /*************************************************************
         * @FlowEvent - View Start 
         *************************************************************/
        oContr.onViewReady = async function(){
            
            return new Promise((res)=>{

                //디자인 트리 바인딩 데이터 구성.
                oContr.fn.setDesignTreeData();


                //default 화면 편집 불가능.
                oContr.oModel.oData.edit = false;

                //workbench 화면이 편집상태인경우.
                if(oAPP.attr.oAppInfo.IS_EDIT === "X"){
                    //화면 편집 가능 flag 처리.
                    oContr.oModel.oData.edit = true;
                }

                
                //모델 갱신 처리.
                oContr.oModel.refresh();


                return res();

            });

        };



        /*************************************************************
         * @event - design tree 전체펼침 / 전체 접힘 처리.
         *************************************************************/
        oContr.fn.expandCollapseAll = function(bExpand){

            //전체펼침 / 접힘 flag에 따른 로직분기.
            switch (bExpand) {
                case true:
                    //전체 펼침인경우.
                    // oAPP.fn.expandTreeItem(oContr.ui.TREE);
                    oContr.ui.TREE.expandToLevel(999999999);

                    break;
            
                case false:
                    //전체 접힘인경우.
                    // oAPP.fn.collapseTreeItem(oContr.ui.TREE);
                    oContr.ui.TREE.collapseAll();

                    break;
            }            

        };


        /*************************************************************
         * @event - 바인딩 필드 drop 이벤트.
         *************************************************************/
        oContr.fn.onDropBindField = async function(oEvent){

            //drag 정보 얻기.(바인딩 팝업의 drag정보)
            var _prc001 = event.dataTransfer.getData("prc001");

            //drag 정보 얻기.(WS20 디자인 영역의 DRAG 정보.)
            var _prc002 = event.dataTransfer.getData("prc002");

            //drop한 위치의 UI 정보 얻기.
            var _oDrop = oEvent.getParameter("droppedControl");


            oAPP.fn.setBusy(true);


            //busy가 open 될때까지 대기 처리.
            await oAPP.fn.waitBusyOpened();


            //현재 편집상태가 아닌경우.
            if(oAPP.attr.oAppInfo.IS_EDIT === ""){

                oAPP.fn.setBusy(false);

                return;
            }


            //WS20에서 DRAG한 데이터 처리건인경우.
            if(oContr.fn.dropDesignArea(_prc002) === true){
                
                //drop 영역 초기화.
                this.setTargetAggregation("rows");

                oAPP.fn.setBusy(false);

                return;
            }


            //DRAG 데이터 정합성 점검.
            var _sRes = _checkDragData(_prc001);

            //DRAG 데이터 오류건이 존재하는경우.
            if(_sRes.RETCD === "E"){
                sap.m.MessageToast.show(_sRes.RTMSG, 
                    {duration: 3000, at:"center center", my:"center center"});
                
                //drop 영역 초기화.
                this.setTargetAggregation("rows");

                oAPP.fn.setBusy(false);

                return;
            }


            //Drop 위치의 tree 데이터 얻기.
            var _sDrop = _getContextData(_oDrop);

            if(typeof _sDrop === "undefined"){

                //drop 영역 초기화.
                this.setTargetAggregation("rows");

                oAPP.fn.setBusy(false);

                return;
            }


            //DESIGN TREE 영역에 DROP 되는 데이터는 
            //바인딩 추가 속성 정보를 적용하지 않기에 초기화 처리.
            _sRes.IF_DATA.MPROP = "";
           
            //바인딩 필드 적용.
            await _setBindAttribute(_sRes.IF_DATA, _sDrop);


            //라인 선택 해제 처리.
            _sDrop.chk_seleced = false;

            
            //참조 필드 DDLB 리스트 구성
            oAPP.attr.oAddit.fn.setRefFieldList();


            //바인딩 추가 속성 정보 갱신 처리.
            _refreshAdditBindInfo();


            //모델 갱신 처리.            
            oContr.oModel.refresh(true);
            

            //drop 영역 초기화.
            this.setTargetAggregation("rows");

            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setUiTableAutoResizeColumn(oContr.ui.TREE);


        };



        /*************************************************************
         * @event - design 영역에 데이터 DROP 이벤트.
         *************************************************************/
        oContr.fn.dropDesignArea = function(oData){

            //현재 편집상태가 아닌경우.
            if(oAPP.attr.oAppInfo.IS_EDIT === ""){
                return false;
            }


            //drag 한 정보가 존재하지 않는경우.
            if(typeof oData === "undefined" || oData === null || oData === ""){
                return false;
            }


            try {
                //drag 데이터 json parse.
                var _sDragData = JSON.parse(oData);
                
            } catch (error) {
                return false;
            }


            //design tree에서 drag 한 데이터 점검.
            var _sRes =  _chkDesignTreeDragData(_sDragData);

            if(_sRes.RETCD === "E"){

                //메시지 처리.
                sap.m.MessageToast.show(_sRes.RTMSG, 
                    {my:"center center", at:"center center"});

                oAPP.fn.setBusy(false);

                return true;

            }


            //광역변수 갱신 처리.
            oAPP.attr.T_0014 = _sDragData.T_0014;
            oAPP.attr.T_0015 = _sDragData.T_0015;
            oAPP.attr.T_CEVT = _sDragData.T_CEVT;


            //디자인 트리 FILTER 초기화.
            oAPP.fn.resetUiTableFilterSort(oContr.ui.TREE);


            //바인딩 추가속성 정보 초기화.
            oAPP.fn.clearSelectAdditBind();


            //추가속성 정보 화면 비활성 처리.
            oAPP.fn.setAdditLayout("");

            
            //디자인 영역 데이터 구성 처리.
            oContr.fn.setDesignTreeData();

            //바인딩 추가 속성 정보 구성 처리.
            oAPP.attr.oAddit.fn.setAdditialListData();


            //메인 모델 갱신 처리.
            oAPP.attr.oModel.refresh();


            //디자인 영역 모델 갱신 처리.
            oContr.oModel.refresh();


            //바인딩 추가 속성 정보 모델 갱신 처리.
            oAPP.attr.oAddit.oModel.refresh();


            oAPP.attr.oDesign.ui.TREE.attachEventOnce("rowsUpdated", ()=>{
                //tree table 컬럼길이 재조정 처리.
                oAPP.fn.setUiTableAutoResizeColumn(oContr.ui.TREE);
            });
            

            return true;

        };


        /*************************************************************
         * @event - 바인딩 해제 이벤트.
         *************************************************************/
        oContr.fn.onUnbind = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent.oSource;

            //UNBIND 버튼 선택 라인의 tree 데이터 얻기.
            var _sTree = _getContextData(_oUi);

            if(typeof _sTree === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            oAPP.fn.setBusy(false);

            //263	Do you want to continue unbind?
            var _msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "263", "", "", "", "");

            let _actcd = await new Promise((resolve) => {
                sap.m.MessageBox.confirm(_msg, {
                    onClose: (actcd) => {
                        resolve(actcd);
                    }
                });
            });

            if (_actcd !== "OK") {
                return;
            }

            oAPP.fn.setBusy(true);

            //오류 표현 초기화 처리.
            oContr.fn.resetErrorField();


            switch (_sTree.UIATY) {
                case "1":
                    //프로퍼티 unbind 처리.
                    oAPP.fn.attrSetUnbindProp(_sTree);


                    //dropAble 프로퍼티 unbind시 예외처리.
                    oContr.fn.excepUnbindDropAbleProperty(_sTree);

                    break;

                case "3":

                    //unbind 처리.
                    oAPP.fn.attrUnbindAggr(oAPP.attr.prev[_sTree.OBJID], _sTree.UIATT, _sTree.UIATV);

                    //변경건 대한 후속 처리.
                    oAPP.fn.attrSetUnbindProp(_sTree);

                    //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                    oAPP.fn.attrUnbindTree(_sTree);

                    break;
                default:
                    break;
            }

            //모델 갱신 처리.
            oContr.oModel.refresh(true);

            //참조 필드 DDLB 리스트 구성
            oAPP.attr.oAddit.fn.setRefFieldList();


            //바인딩 추가속성 정보 초기화.
            oAPP.fn.clearSelectAdditBind();


            //추가속성 정보 화면 비활성 처리.
            oAPP.fn.setAdditLayout("");


            //모델 필드의 바인딩 가능 여부 설정.
            await parent.require("./modelFieldArea/bindPossible.js")(_sTree);


            //153	바인딩 해제 처리를 완료 했습니다.
            sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "153"), 
                {my:"center center", at:"center center"});

            //해당 영역에서 BUSY OFF 처리하지 않음.
            //바인딩 팝업에서 WS20 디자인 영역에 데이터 전송 ->
            //WS20 디자인 영역에서 데이터 반영 ->
            //WS20 디자인 영역에서 BUSY OFF 요청으로 팝업의 BUSY가 종료됨.

        };


        /*************************************************************
         * @event - 디자인 tree 라인 선택 헤제 처리.
         *************************************************************/
        oContr.fn.onClearSelection = function(){

            oAPP.fn.setBusy(true);

            //tree 하위를 탐색하며, 라인 선택 해제 처리.
            _clearSelection(oContr.oModel.oData.zTREE_DESIGN);

            oContr.oModel.refresh();


            //참조 필드 DDLB 리스트 구성
            oAPP.attr.oAddit.fn.setRefFieldList();

            oAPP.fn.setBusy(false);

        };




        /*************************************************************
         * @event - 디자인 tree 바인딩 추가 속성 정보 적용.
         *************************************************************/
        oContr.fn.onAdditionalBind = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent.oSource;

            //Drop 위치의 tree 데이터 얻기.
            var _sTree = _getContextData(_oUi);

            if(typeof _sTree === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }
           
            
            //오류 표현 필드 초기화.
            oAPP.attr.oAddit.fn.resetErrorField();


            //바인딩 추가 속성 정보 적용 전 입력값 점검.
            var _sRes = await oAPP.fn.chkAdditBindData(oAPP.attr.oAddit.ui.ROOT);

            //바인딩 추가 속성 점검 오류가 존재하는경우.
            if(_sRes.RETCD === "E"){

                //메시지 처리.
                await oAPP.fn.showMessagePopoverOppener(_oUi.oParent, _sRes.T_RTMSG);

                oAPP.fn.setBusy(false);

                return;
            }


            //오류 표현 초기화 처리.
            oContr.fn.resetErrorField();


            //현재 라인의 바인딩 가능 여부 점검.
            var _sRes = oAPP.attr.oAddit.fn.chkPossibleAdditBind(_sTree);

            //바인딩 추가 속성 점검 오류가 존재하는경우.
            if(_sRes.RETCD === "E"){

                //바인딩시 오류가 발생한 경우.
                _sTree._bind_error   = true;
                
                //오류 표현 처리.
                _sTree._check_vs      = "Error";
                _sTree._style         = "u4aWsDesignTreeError";
                _sTree._error_tooltip = _sRes.RTMSG;

                oContr.oModel.refresh();

                sap.m.MessageToast.show(_sRes.RTMSG, {duration: 3000, at:"center center", my: "center center"});
                oAPP.fn.setBusy(false);
                
                return;
            }

            oContr.oModel.refresh();


            //해당 UI정보 검색.
            var _oUi = oAPP.attr.prev[_sTree.OBJID];

            if(typeof _oUi === "undefined" || typeof _oUi._T_0015 === "undefined"){
                //106	&1 UI 정보를 찾을 수 없습니다.                
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "106", _sTree.OBJID), 
                    {duration: 3000, at:"center center", my: "center center"});
                oAPP.fn.setBusy(false);
                return;
            }



            //바인딩 추가 속성 정보 적용건이 존재하는경우.
            if(_sTree.MPROP !== ""){

                //089	바인딩 추가 속성 정보를 적용하시겠습니까?
                var _msg = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "089");

                oAPP.fn.setBusy(false);
                
                let _actcd = await new Promise((resolve) => {
                    sap.m.MessageBox.confirm(_msg, {
                        onClose: (actcd) => {
                            resolve(actcd);
                        }
                    });
                });

                if (_actcd !== "OK") {
                    return;
                }

            }

            oAPP.fn.setBusy(true);

            _sTree.MPROP = oAPP.fn.setAdditBindData(oAPP.attr.oAddit.oModel.oData.T_MPROP);


            //ATTR 정보 수집건에서 해당 ATTR 검색.
            var _s0015 = _oUi._T_0015.find( item => item.UIATK === _sTree.UIATK );

            //검색한 ATTR의 바인딩 추가속성 정보 갱신.
            if(typeof _s0015 !== "undefined"){
                _s0015.MPROP = _sTree.MPROP;
            }


            //154	바인딩 추가 속성 정보를 적용 했습니다.
            sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "154"),
                {duration: 3000, at:"center center", my:"center center"});


            //바인딩 추가 속성 정보 갱신 처리.
            _showBindAdditInfo(_sTree);
            

            oContr.oModel.refresh(true);


            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setUiTableAutoResizeColumn(oContr.ui.TREE);

            //해당 영역에서 BUSY OFF 처리하지 않음.
            //바인딩 팝업에서 WS20 디자인 영역에 데이터 전송 ->
            //WS20 디자인 영역에서 데이터 반영 ->
            //WS20 디자인 영역에서 BUSY OFF 요청으로 팝업의 BUSY가 종료됨.


        };



        /*************************************************************
         * @event - 디자인 트리 라인 선택 이벤트.
         *************************************************************/
        oContr.fn.onSelDesignTreeLine = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent?.mParameters?.cellControl;

            if(typeof _oUi === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            //Drop 위치의 tree 데이터 얻기.
            var _sTree = _getContextData(_oUi);

            if(typeof _sTree === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            //모델 필드의 바인딩 가능 여부 설정.
            await parent.require("./modelFieldArea/bindPossible.js")(_sTree);


            //UI 라인인 경우 WS 디자인 영역의 라인 선택 처리.
            if(_sTree.DATYP === "01"){
                //바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 전송.
                parent.require("./wsDesignHandler/broadcastChannelBindPopup.js")("DESIGN-TREE-SELECT-OBJID", _sTree.OBJID);

            }

            oAPP.fn.setBusy(false);
 

        };



        /*************************************************************
         * @event - 바인딩 추가 속성 정보 보기 이벤트.
         *************************************************************/
        oContr.fn.onShowBindAdditInfo = function(oEvent){

            oAPP.fn.setBusy(true);


            var _oUi = oEvent.oSource;

            //Drop 위치의 tree 데이터 얻기.
            var _sTree = _getContextData(_oUi);

            if(typeof _sTree === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }


            //바인딩 추가 속성 정보 보기
            _showBindAdditInfo(_sTree);


            oAPP.fn.setBusy(false);

        };
        

        /*************************************************************
         * @event - drag enter시 drop 가능여부 처리.
         *************************************************************/
        oContr.fn.onDragEnter = function(oEvent){

            var _oSess = oEvent.getParameter("dragSession");

            var _oDrag = _oSess.getDragControl();
            

            //treeTable이 visibleRowCountMode가 Auto인경우.
            //dom height를 0px로 만들어 drop style이 정상적으로
            //표현되지 않는 문제가 있어 drag 할때 height를 auto로 변경.
            var _oDom = oContr.ui.TREE.getDomRef();

            _oDom.style.height = "auto";


            //binding popup에서 drag하지 않았다면.
            if(typeof _oDrag === "undefined" || _oDrag === null){
                //drop 영역 확보를 위한 design tree 화면 비활성 처리.
                console.log(_oDrag);

                //TREE TABLE 영역을 DROP으로 변경 처리.
                this.setTargetAggregation();

                return;

            }


            //ROW를 DROP 영역으로 변경.
            this.setTargetAggregation("rows");

            var oRow = oEvent.mParameters.dragSession.getDropControl();

            //Context 에서 데이터 발췌.
            var _sTree = _getContextData(oRow);
            
            if(typeof _sTree === "undefined"){
                oEvent.preventDefault();
                return;
            }

            
            //drop 불가능건인경우.
            if(_sTree._drop_enable !== true){
                oEvent.preventDefault();
                return;
            }

        };



        /*************************************************************
         * @event - design tree 스크롤 이벤트.
         *************************************************************/
        oContr.fn.onRowsUpdated = function(){
            
            //바인딩 필드 정보에서 drag 시작하지 않은경우 exit.
            if(oContr.ui.ROOT.data("dragStart") !== true){
                return;
            }

            //design tree의 drop style 초기화.
            oContr.fn.resetDropStyle();


            //drop style 설정.
            oContr.fn.setDropStyle();

        };


        /*************************************************************
         * @event - 바인딩 데이터 변경시 메인에 해당 내용 전달 처리 이벤트.
         *************************************************************/
        oContr.fn.onModelDataChanged = async function(oEvent){
            
            //바인딩 팝업에서 구성한 바인딩정보(T_0014, T_0015 정보) 호출처에 전달.
            parent.require("./wsDesignHandler/broadcastChannelBindPopup.js")("UPDATE-DESIGN-DATA");


        };



        /*************************************************************
         * @event - 멀티 바인딩 해제 이벤트.
         *************************************************************/
        oContr.fn.onMultiUnbind = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent.oSource;

            //multi unbind전 점검.
            var _sRes = await parent.require("./designArea/checkMultiUnbinding.js")();

            //점검 오류가 발생한 경우.
            if(_sRes.RETCD === "E"){

                oAPP.fn.setBusy(false);
                
                await oAPP.fn.showMessagePopoverOppener(_oUi, _sRes.T_RTMSG);
                
                return;

            }

            //DESIGN TREE의 체크박스 선택한 정보 얻기.
            var _aTree = oContr.fn.getSelectedDesignTree();

            //166	&1건의 라인이 선택됐습니다.
            var _msg = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "166", _aTree.length);

            //167	멀티 바인딩 해제를 진행하시겠습니까?
            _msg += "\n" + oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "167");

            oAPP.fn.setBusy(false);
            
            let _actcd = await new Promise((resolve) => {
                sap.m.MessageBox.confirm(_msg, {
                    onClose: (actcd) => {
                        resolve(actcd);
                    }
                });
            });

            if (_actcd !== "OK") {
                return;
            }


            oAPP.fn.setBusy(true);

            
            //라인 선택건 얻기.
            var _aTree = oAPP.attr.oDesign.fn.getSelectedDesignTree();

            
            for (let i = 0, l = _aTree.length; i < l; i++) {
                
                var _sTree = _aTree[i];

                //오류 표현 초기화 처리.
                _resetErrorFieldLine(_sTree);


                //라인 선택 해제 처리.
                _sTree.chk_seleced = false;


                switch (_sTree.UIATY) {
                    case "1":
                        //프로퍼티 unbind 처리.
                        oAPP.fn.attrSetUnbindProp(_sTree);
    
    
                        //dropAble 프로퍼티 unbind시 예외처리.
                        oContr.fn.excepUnbindDropAbleProperty(_sTree);
    
                        break;
    
                    case "3":
    
                        //unbind 처리.
                        oAPP.fn.attrUnbindAggr(oAPP.attr.prev[_sTree.OBJID], _sTree.UIATT, _sTree.UIATV);
    
                        //변경건 대한 후속 처리.
                        oAPP.fn.attrSetUnbindProp(_sTree);
    
                        //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                        oAPP.fn.attrUnbindTree(_sTree);
    
                        break;
                    default:
                        break;
                }

            }


            oContr.oModel.refresh(true);

            //참조 필드 DDLB 리스트 구성
            oAPP.attr.oAddit.fn.setRefFieldList();


            //바인딩 추가속성 정보 초기화.
            oAPP.fn.clearSelectAdditBind();


            //추가속성 정보 화면 비활성 처리.
            oAPP.fn.setAdditLayout("");


            //모델 필드의 바인딩 가능 여부 설정.
            await parent.require("./modelFieldArea/bindPossible.js")(_sTree);


            //155	멀티 바인딩 해제 처리를 완료 했습니다.
            sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "155"), 
                {my:"center center", at:"center center"});


            //해당 영역에서 BUSY OFF 처리하지 않음.
            //바인딩 팝업에서 WS20 디자인 영역에 데이터 전송 ->
            //WS20 디자인 영역에서 데이터 반영 ->
            //WS20 디자인 영역에서 BUSY OFF 요청으로 팝업의 BUSY가 종료됨.

        };


        /*************************************************************
         * @event - 체크박스 선택 이벤트.
         *************************************************************/
        oContr.fn.onSelCheckBox = function(oEvent){

            //참조 필드 DDLB 리스트 구성
            oAPP.attr.oAddit.fn.setRefFieldList();

        };

        
        /*************************************************************
         * @event - drag를 떠났을때 이벤트.
         *************************************************************/
        oContr.fn.onDragLeaveDesignArea = function(){
return;
            var _aDrop = oContr.ui.TREE.getDragDropConfig();

            if(_aDrop.length === 0){
                return;
            }

            //데이터 바인딩용 DROP 정보 찾기.
            var _oDrop = _aDrop.find( oUI => oUI?.data && oUI.data("DROP_TYPE") === "DROP01" );

            if(typeof _oDrop === "undefined"){
                return;
            }

            //target aggregation 초기화.
            _oDrop.setTargetAggregation("rows");

        };



        /*************************************************************
         * @event - 멀티 바인딩 이벤트.
         *************************************************************/
        oContr.fn.onMultiBind = async function(oEvent){

            oAPP.fn.setBusy(true);

            var _oUi = oEvent.oSource;

            //바인딩 추가속성 정보 멀티 적용 가능 여부 점검.
            var _sRes = await parent.require("./designArea/checkMultiBinding.js")();

            //점검 오류가 발생한 경우.
            if(_sRes.RETCD === "E"){

                oAPP.fn.setBusy(false);

                //메시지 처리.
                await oAPP.fn.showMessagePopoverOppener(_oUi, _sRes.T_RTMSG);
                                
                return;

            }


            //모델 필드 라인 선택 위치 얻기.
            var _sField = oAPP.fn.getSelectedModelLine();
                        
            if(typeof _sField === "undefined"){
                oAPP.fn.setBusy(false);
                return;
            }

            //DESIGN TREE의 체크박스 선택한 정보 얻기.
            var _aTree = oContr.fn.getSelectedDesignTree();

            //166	&1건의 라인이 선택됐습니다.
            var _msg = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "166", _aTree.length);


            //156	멀티 바인딩 처리를 진행 하시겠습니까?
            _msg += "\n" + oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "156");

            
            //기존 aggr에 이미 바인딩이 걸린건이 존재하는경우.
            if(_aTree.findIndex( item => item.UIATV !== "" && item.UIATY === "3" ) !== -1){

                //122	Change the model, the binding that exists in the child is initialized.
                _msg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "122", "", "", "", "");

                //123	Do you want to continue?
                _msg += oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "123", "", "", "", "");


            }


            oAPP.fn.setBusy(false);

            let _actcd = await new Promise((resolve) => {
                sap.m.MessageBox.confirm(_msg, {
                    onClose: (actcd) => {
                        resolve(actcd);
                    }
                });
            });


            if(_actcd !== "OK"){return;}


            oAPP.fn.setBusy(true);


            //선택한 라인을 기준으로 모델 바인딩 처리.
            for (let i = 0, l =_aTree.length; i < l; i++) {
                
                var _sTree = _aTree[i];

                //라인 선택 해제 처리.
                _sTree.chk_seleced = false;


                switch (_sTree.UIATY) {
                    case "1":
                        //프로퍼티 바인딩 처리.
                        oAPP.fn.attrSetBindProp(_sTree, _sField);
                        break;

                    case "3":

                        if(_sTree.UIATV !== "" && _sTree.ISBND === "X"){

                            //UNBIND 처리.
                            oAPP.fn.attrUnbindAggr(oAPP.attr.prev[_sTree.OBJID],_sTree.UIATT, _sTree.UIATV);

                            //TREE의 PARENT, CHILD 프로퍼티 예외처리.
                            oAPP.fn.attrUnbindTree(_sTree);

                        }
                        
                        //AGGREGATION 바인딩 처리.
                        oAPP.fn.attrSetBindProp(_sTree, _sField);
                        

                        oAPP.attr.prev[_sTree.OBJID]._MODEL[_sTree.UIATT] = _sTree.UIATV;

                        break;
                
                    default:
                        break;
                }
                
            }


            //바인딩 추가속성 정보 초기화.
            oAPP.fn.clearSelectAdditBind();


            //추가속성 정보 화면 비활성 처리.
            oAPP.fn.setAdditLayout("");
            

            oContr.oModel.refresh(true);

            //157	멀티 바인딩 처리를 완료 했습니다.
            sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "157"), 
                {my:"center center", at:"center center"});


            //tree table 컬럼길이 재조정 처리.
            oAPP.fn.setUiTableAutoResizeColumn(oContr.ui.TREE);

            //해당 영역에서 BUSY OFF 처리하지 않음.
            //바인딩 팝업에서 WS20 디자인 영역에 데이터 전송 ->
            //WS20 디자인 영역에서 데이터 반영 ->
            //WS20 디자인 영역에서 BUSY OFF 요청으로 팝업의 BUSY가 종료됨.

        };


        /*************************************************************
         * @event - 동일속성 바인딩 일괄적용.
         *************************************************************/
        oContr.fn.onSynchronizionBind = async function(){

            oAPP.fn.setBusy(true);

            //라인 선택건 존재여부 확인.
            var _aTree = oContr.fn.getSelectedDesignTree();

            //라인 선택건이 존재하지 않는경우.
            if(_aTree.length === 0){

                oAPP.fn.setBusy(false);

                //268 Selected line does not exists.
                sap.m.MessageToast.show(oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "268", "", "", "", ""), 
                    {duration: 3000, at:"center center"});

                return;
            }


            //2건 이상을 선택한 경우.
            if(_aTree.length > 1){

                oAPP.fn.setBusy(false);

                //107	1건의 라인만 선택 하십시오.
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "107"), 
                    {duration: 3000, at:"center center", my: "center center"});

                return;

            }

            var _sTree = _aTree[0];

            //바인딩 처리가 되지 않은경우.
            if(_sTree.UIATV === ""){

                oAPP.fn.setBusy(false);

                //108	바인딩되지 않은 필드를 선택했습니다.
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "108"), 
                    {duration: 3000, at:"center center", my: "center center"});

                return;

            }

            //바인딩 필드의 모델 필드 정보 얻기.
            var _sField = oAPP.fn.getModelBindData(_sTree.UIATV, oAPP.attr.oModel.oData.zTREE);

            if(typeof _sField === "undefined"){

                oAPP.fn.setBusy(false);

                //109	바인딩 필드 정보를 찾을 수 없습니다.
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "109"), 
                    {duration: 3000, at:"center center", my: "center center"});

                return;
            }

            
            //동일속성 attr 항목 검색.
            var _aList = parent.require("./synchronizionArea/getSameAttrList.js")(_sTree);

            if(_aList.length === 0){

                oAPP.fn.setBusy(false);

                //158	&1와(과) 동일한 속성 정보가 존재하지 않습니다.                
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "158", _sTree.UIATT), 
                    {duration: 3000, at:"center center", my: "center center"});

                return;

            }


            var _path = oAPP.PATH.join(oAPP.APP.getAppPath(), 
                "ws10_20", "Popups", "bindPopup", "uiModule", "synchronizionBind.js");

            
            //재사용 view 정보 얻기.
            var _oSyncBind = await import(_path);

            var _oContr = await _oSyncBind.start(_sTree);
            

            var _oTargetPage = _oContr.ui.ROOT;

            // Target Page onAfterRendering Event Delegate
            var _oDelegate = {

                onAfterRendering: function () {

                    _oTargetPage.removeEventDelegate(_oDelegate);

                    
                    // 이동할 페이지에 viewReady가 있을 경우 호출해준다.
                    if (_oContr.onViewReady && typeof _oContr.onViewReady === "function") {

                        oAPP.fn.setBusy(false);

                        _oContr.onViewReady();

                        return;

                    }

                    oAPP.fn.setBusy(false);


                } // end of onAfterRendering

            };


            _oTargetPage.data("TARGET", _oContr);

            _oTargetPage.addEventDelegate(_oDelegate);


            oContr.ui.ROOT.addPage(_oTargetPage);


            oContr.ui.ROOT.to(_oTargetPage);


            //추가속성 바인딩 버튼 비활성 처리.
            oAPP.attr.oAddit.fn.setAdditBindButtonEnable(false);


            //바인딩 추가속성 정보 초기화.
            oAPP.fn.clearSelectAdditBind();


            //추가속성 정보 화면 비활성 처리.
            oAPP.fn.setAdditLayout("");


        };


        /*************************************************************
         * @function - 디자인 영역으로 화면 이동 처리
         *************************************************************/
        oContr.fn.moveDesignPage = async function(){

            return new Promise((res)=>{

                //현재 보이는 화면이 design main 화면인경우 exit.
                if(oContr.ui.ROOT.getCurrentPage() === oContr.ui.PG_MAIN){
                    return res();
                }


                oContr.ui.ROOT.attachEventOnce("afterNavigate", async function () {
                    
                    //tree 하위를 탐색하며, 라인 선택 해제 처리.
                    _clearSelection(oContr.oModel.oData.zTREE_DESIGN);

                    
                    oContr.oModel.refresh();

                    var _oPage = oContr.ui.ROOT.getCurrentPage();

                    if(typeof _oPage === "undefined"){
                        return res();

                    }

                    var _oContr = _oPage.data("TARGET");

                    if(typeof _oContr === "undefined" || _oContr === null){
                        return res();
                    }

                    //이전화면의 VIEW EXIT 호출.
                    await _oContr.onViewExit();

                    return res();
                    
                });
                
                oContr.ui.ROOT.to(oContr.ui.PG_MAIN);

            });

        };


        /*******************************************************
        * @function - 화면 잠금 / 잠금해제 처리.
        *******************************************************/  
        oContr.fn.setViewEditable = function(bLock){

            //applicationdl 조회모드인경우 exit.
            if(oAPP.attr.oAppInfo.IS_EDIT === ""){
                return;
            }


            //design tree 입력 필드 잠금 / 잠금 해제 처리.
            oContr.oModel.oData.edit = bLock;

            oContr.oModel.refresh();


        };


        /*************************************************************
         * @function - 디자인 영역의 추가속성정보 갱신 처리.
         *************************************************************/
        oContr.fn.setMPROP = function(){

            //추가속성 정보 출력건이 존재하지 않는경우 exit.
            if(jQuery.isEmptyObject(oAPP.attr.oModel.oData.S_SEL_ATTR) === true){
                return;
            }
            
            var _sAttr = oAPP.attr.oModel.oData.S_SEL_ATTR;


            //링크 선택건에 해당하는 라인 정보 얻기.
            var _sTree = oAPP.fn.getDesignTreeAttrData(_sAttr.OBJID, _sAttr.UIATK);
            
            if(typeof _sTree === "undefined"){
                //110	&1 정보를 찾을 수 없습니다.
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "110", _sAttr.UIATT), 
                    {duration: 3000, at:"center center", my:"center center"});
                return;
            }

                        
            //해당 UI정보 검색.
            var _oUi = oAPP.attr.prev[_sTree.OBJID];

            if(typeof _oUi === "undefined" || typeof _oUi._T_0015 === "undefined"){
                //110	&1 정보를 찾을 수 없습니다.                
                sap.m.MessageToast.show(oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "110", _sTree.OBJID),
                    {duration: 3000, at:"center center", my:"center center"});
                return;
            }


            //바인딩 추가 속성값 구성.
            _sTree.MPROP = oAPP.fn.setAdditBindData(oAPP.attr.oModel.oData.T_MPROP);

                
            //ATTR 정보 수집건에서 해당 ATTR 검색.
            var _s0015 = _oUi._T_0015.find( item => item.UIATK === _sTree.UIATK );

            //검색한 ATTR의 바인딩 추가속성 정보 갱신.
            if(typeof _s0015 !== "undefined"){
                _s0015.MPROP = _sTree.MPROP;
            }


            //모델 갱신 처리.
            oContr.oModel.refresh(true);

        };

        
        /*************************************************************
         * @function - UI 구성 완료후 call back 처리.
         *************************************************************/
        oContr.fn.uiUpdateComplate = function(oUI){

            return new Promise((res)=>{
                
                if(typeof oUI === "undefined" || oUI === null){
                    return res();
                }

                var _oDelegate = {
                    onAfterRendering:(oEvent)=>{

                        //onAfterRendering 이벤트 제거.
                        oUI.removeEventDelegate(_oDelegate);

                        //onAfterRendering 정보 초기화.
                        oUI.data("_onAfterRendering", null);

                        return res();

                    }
                };

                //onAfterRendering 추가.
                oUI.addEventDelegate(_oDelegate);
                
                //onAfterRendering 정보 매핑.
                oUI.data("_onAfterRendering", _oDelegate);

            });

        };


        /*************************************************************
         * @function - design tree 라인 선택건 정보 발췌.
         *************************************************************/
        oContr.fn.getSelectedDesignTree = function(){

            //라인 선택건 수집.
            function _collectSelectLine(aTree){

                if(aTree.length === 0){
                    return;
                }

                for (let i = 0, l = aTree.length; i < l; i++) {
                    var _sTree = aTree[i];

                    //라인 선택건 수집.
                    if(_sTree.chk_seleced === true){
                        _aSelLine.push(_sTree);
                    }
                    
                    //하위를 탐색하며 라인 선택건 수집.
                    _collectSelectLine(_sTree.zTREE_DESIGN);

                }

            }   //라인 선택건 수집.

            var _aSelLine = [];

            //라인 선택건 수집.
            _collectSelectLine(oContr.oModel.oData.zTREE_DESIGN);

            //선택한 라인 정보 return.
            return _aSelLine;

        };


        /*************************************************************
         * @function - 추가 속성 바인딩 멀티 적용.
         *************************************************************/
        oContr.fn.additionalBindMulti = function(MPROP){

            //DESIGN TREE의 체크박스 선택건 얻기.
            var _aTree = oContr.fn.getSelectedDesignTree();

            //체크박스 선택건이 존재하지 않는경우 exit.
            if(_aTree.length === 0){
                return;
            }


            //선택한 라인에 대해 바인딩 추가 속성 정보 매핑.
            for (let i = 0, l = _aTree.length; i < l; i++) {

                var _sTree = _aTree[i];

                //라인 선택 해제 처리.
                _sTree.chk_seleced = false;

                //추가 속성 정보 매핑 처리.
                _sTree.MPROP = MPROP;


                //해당 UI정보 검색.
                var _oUi = oAPP.attr.prev[_sTree.OBJID];

                if(typeof _oUi === "undefined" || typeof _oUi._T_0015 === "undefined"){
                    continue;
                }


                //ATTR 정보 수집건에서 해당 ATTR 검색.
                var _s0015 = _oUi._T_0015.find( item => item.UIATK === _sTree.UIATK );

                //검색한 ATTR의 바인딩 추가속성 정보 갱신.
                if(typeof _s0015 !== "undefined"){
                    _s0015.MPROP = _sTree.MPROP;
                }


            }


            //바인딩 추가 속성 정보 갱신 처리.
            _refreshAdditBindInfo();


        };


        /*************************************************************
         * @function - 디자인 트리 라인 정보 얻기.
         *************************************************************/
        oContr.fn.getDesignTreeLineData = function(CHILD){
            
            //디자인 트리 라인 정보 얻기 재귀 function 호출.
            return _getDesignTreeLineData(CHILD, oContr.oModel.oData.zTREE_DESIGN);

        };


        /*************************************************************
         * @function - 오류 표현 바인딩 필드 초기화.
         *************************************************************/
        oContr.fn.resetErrorField = function(){

            //오류 표현 바인딩 필드 초기화.
            _resetErrorField(oContr.oModel.oData.zTREE_DESIGN);

        };


        /*************************************************************
         * @function - drop 가능 여부 초기화.
         *************************************************************/
        oContr.fn.resetDropFlag = function(aTree){

            if(typeof aTree === "undefined"){
                return;
            }

            for (let i = 0, l = aTree.length; i < l; i++) {
                
                var _sTree = aTree[i];

                //drop 가능 flag 초기화.
                _sTree._drop_enable = false;

                oContr.fn.resetDropFlag(_sTree.zTREE_DESIGN);

            }

        };


        /*************************************************************
         * @function - drop style 초기화.
         *************************************************************/
        oContr.fn.resetDropStyle = function(){

            var _aRows = oContr.ui.TREE.getRows();

            if(_aRows.length === 0){
                return;
            }

            for (let i = 0, l = _aRows.length; i < l; i++) {
                
                var _oRow = _aRows[i];
                
                //row에 drop 불가능 css style 제거.
                _oRow.removeStyleClass("sapUiDnDDragging");
                
            }

        };


        /*************************************************************
         * @function - drop style 설정.
         *************************************************************/
        oContr.fn.setDropStyle = function(){

            var _aRows = oContr.ui.TREE.getRows();

            if(_aRows.length === 0){
                return;
            }

            for (let i = 0, l = _aRows.length; i < l; i++) {
                
                var _oRow = _aRows[i];

                var _sTree = _getContextData(_oRow);
                
                if(typeof _sTree === "undefined"){
                    continue;
                }

                //drop이 불가능한 경우 drop 불가능 css 처리.
                if(_sTree._drop_enable !== true){
                    _oRow.addStyleClass("sapUiDnDDragging");
                }               
                
            }

        };


        /*************************************************************
         * @function - 출력된 row에서 대상 라인 위치 찾기.
         *************************************************************/
        oContr.fn.findTargetRowIndex = function(CHILD){

            var _aRows = oAPP.attr.oDesign.ui.TREE.getRows();

            if(_aRows.length === 0){
                return -1;
            }


            //출력된 row에서 대상 라인 검색.
            for (let i = 0, l = _aRows.length; i < l; i++) {
                
                var _oRow = _aRows[i];

                if(typeof _oRow === "undefined" || _oRow === null){
                    continue;
                }

                var _oCtxt = _oRow.getBindingContext();

                if(typeof _oCtxt === "undefined" || _oCtxt === null){
                    continue;
                }

                //현재 ROW의 라인 정보가 찾고자 하는 라인과 같은경우.
                if(_oCtxt.getProperty("CHILD") === CHILD){

                    //찾은 라인 index return.
                    return _oRow.getIndex();
                }

            }

            //못찾은경우 -1 return.
            return -1;

        };


        /*************************************************************
         * @function - drop 가능 여부 설정.
         *************************************************************/
        oContr.fn.setDropFlag = function(aTree, sField){

            if(typeof aTree === "undefined"){
                return;
            }

            for (let i = 0, l = aTree.length; i < l; i++) {
                
                var _sTree = aTree[i];

                //하위를 탐색하며 drop 가능 여부 설정.
                oContr.fn.setDropFlag(_sTree.zTREE_DESIGN, sField);

                //바인딩 가능 여부 점검.
                var _sRes = oContr.fn.checkValidBind(_sTree, sField);

                if(_sRes.RETCD === "E"){
                    continue;
                }

                //drop 가능처리.
                _sTree._drop_enable = true;


            }

        };



        //tree item 선택 처리
        oContr.fn.getTreeItemIndex = function(CHILD){
            
            //tree를 탐색하며 ROOT로부터 입력 OBJID 까지의 PATH 정보 구성
            function lf_getTreePath(it_tree){

                //tree 정보가 존재하지 않는경우 exit.
                if(jQuery.isArray(it_tree) !== true || it_tree.length === 0){
                    return;
                }

                //tree 정보를 탐색하며 입력 CHILD와 동일건 검색.
                for(var i = 0, l = it_tree.length, l_find; i < l; i++){

                    //검색대상 CHILD에 해당하는경우 찾음 FLAG return.
                    if(it_tree[i].CHILD === CHILD){
                        //PATH를 수집.
                        lt_path.unshift(it_tree[i].CHILD);
                        return true;
                    }

                    //하위를 탐색하며 검색대상 CHILD에 해당하는건 검색.
                    l_find = lf_getTreePath(it_tree[i].zTREE_DESIGN);

                    //CHILD에 해당하는건을 찾은경우.
                    if(l_find === true){
                        //PATH를 수집.
                        lt_path.unshift(it_tree[i].CHILD);
                        return true;
                    }
                }

            } //tree를 탐색하며 ROOT로부터 입력 CHILD 까지의 PATH 정보 구성

            

            //수집된 경로를 기준으로 child 정보 새로 검색.
            function lf_getNode(){

                //tree bind정보 새로 검색.
                var oBind = oContr.ui.TREE.getBinding();

                //start 경로 매핑.
                var lt_child = oBind._oRootNode;

                //수집된 경로를 기준으로 child를 다시 검색.
                for(var i = 0, l = lt_route.length; i < l; i++){
                    lt_child = lt_child.children[lt_route[i]];
                }

                //검색된 child return.
                return lt_child;

            } //수집된 경로를 기준으로 child 정보 새로 검색.

            

            //수집된 path를 기준으로 child를 탐색하며 펼침 처리.
            function lf_expand(is_child){

                //펼침 처리 대상 child의 CHILD 정보 검색.
                var l_CHILD = is_child.context.getProperty("CHILD");

                if(typeof l_CHILD === "undefined"){return;}
                
                //현재 CHILD가 펼침 처리 대상건인경우.
                if(l_CHILD === lt_path[0]){
                    
                    //입력UI와 동일건인경우.
                    if(CHILD === lt_path[0]){
                        //대상 라인 찾름 flag 처리.
                        _found = true;
                    
                    }
                    
                    //수집건에서 삭제.
                    lt_path.splice(0,1);
                    
                    if(lt_path.length === 0){
                        return;
                    }

                    //해당 라인이 펼쳐져 있지 않다면.
                    if(is_child.isLeaf === false && is_child.nodeState.expanded === false){          
                        //TREE 펼첨 처리.
                        oContr.ui.TREE.expand(l_cnt);
                    }


                    //현재 탐색중인 child의 경로 정보 수집.
                    lt_route.push(is_child.positionInParent);

                    //수집된 경로를 기준으로 child 정보 새로 검색.
                    is_child = lf_getNode();

                }

                //expand 위치를 위한 counting.
                l_cnt += 1;

                //새로 검색된 child를 기준으로 하위를 탐색하며 expand 처리.
                for(var i = 0, l = is_child.children.length; i < l; i++){

                    lf_expand(is_child.children[i]);

                    if(lt_path.length === 0){
                        return;
                    }

                }

            } //수집된 path를 기준으로 child를 탐색하며 펼침 처리.



            //CHILD가 존재하지 않는경우 EXIT.
            if(typeof CHILD === "undefined" || CHILD === null || CHILD === ""){            
                return -1;
            }


            var lt_route = [], lt_path = [], l_cnt = 0;

            var _found = false;

            //입력 UI명으로 부터 부모까지의 PATH 정보 검색.
            lf_getTreePath(oContr.oModel.oData.zTREE_DESIGN);

            //path 정보를 수집하지 않은경우 exit.
            if(lt_path.length === 0){
                return -1;
            }


            var l_bind = oContr.ui.TREE.getBinding();

            if(typeof l_bind === "undefined"){
                return -1;
            }
                
            //수집한 path를 기준으로 tree 펼첨 처리.
            lf_expand(l_bind._oRootNode.children[0]);


            //해당라인을 찾지 못한 경우.
            if(_found === false){
                return -1;
            }

            //찾은 라인 위치 return.
            return l_cnt;

        };  //tree item 선택 처리

        
        /*******************************************************
        * @function - 디자인 트리 바인딩 데이터 구성.
        *******************************************************/  
        oContr.fn.setDesignTreeData = function(){

            //UI 수집 오브젝트 초기화.
            oAPP.attr.prev = {};

            var _aT_0014 = oAPP.attr.T_0014 || [];

            var _aTree = [];

            //모델 정보 초기화.
            oContr.oModel.oData.TREE_DESIGN  = [];
            oContr.oModel.oData.zTREE_DESIGN = [];

            if(_aT_0014.length === 0){
                oContr.oModel.refresh();
                return;
            }


            for (let i = 0, l = _aT_0014.length; i < l; i++) {
                
                var _s0014 = _aT_0014[i];
                
                //디자인 트리 바인딩 데이터 구성.
                _setDesignTreeData0014(_s0014, _aTree);


                //디자인 트리 프로퍼티 정보 구성.
                _setDesignTreeDataProp(_s0014, _aTree);

                
                //디자인 트리 Aggregation 정보 구성.
                _setDesignTreeDataAggr(_s0014, _aTree);
                
                
                //이전 바인딩 정보 매핑 처리.
                _setBindAttrData(_s0014, _aTree);


                //미리보기 구조 구성.
                _setPrevData(_s0014);

                
            }

            oContr.oModel.oData.TREE_DESIGN = _aTree;


            //tree 정보 구성.
            oAPP.fn.setTreeJson(oContr.oModel, "TREE_DESIGN", "CHILD", "PARENT", "zTREE_DESIGN");

            
            //바인딩 팝업 디자인 영역에 그려진 최상위 UI 정보 전송.
            parent.require("./wsDesignHandler/broadcastChannelBindPopup.js")("SEND-ROOT-OBJID", _aTree[0].OBJID);

            
        };


        /*************************************************************
         * @function - dropAble 프로퍼티 unbind시 예외처리.
         *************************************************************/
        oContr.fn.excepUnbindDropAbleProperty = function(is_tree){

            //attr 유형이 아닌경우 exit.
            if(is_tree.DATYP !== "02"){
                return;
            }

            //프로퍼티 타입이 아닌경우 exit.
            if(is_tree.UIATY !== "1"){
                return;
            }

            //dropAble 프로퍼티 변경건이 아닌경우 EXIT.
            if(is_tree.UIASN !== "DROPABLE"){
                return;
            }

            //바인딩 입력값이 존재하는경우 EXIT.
            if(is_tree.UIATV !== ""){
                return;
            }

            //attr에 해당하는 UI 정보 얻기.
            var _oUi = oAPP.attr.prev[is_tree.OBJID];

            //UI정보의 attr 변경건 수집항목이 존재하지 않는경우 exit.
            if(typeof _oUi?._T_0015 === "undefined"){
                return;
            }

            //drop 이벤트 수집건 존재 확인.
            var _found = _oUi._T_0015.findIndex( item => item.UIASN === "DNDDROP" );

            //drop 이벤트가 존재하지 않는경우 exit.
            if(_found === -1){
                return;
            }

            //존재하는경우 해당 drop 이벤트 수집건 삭제 처리.
            _oUi._T_0015.splice(_found, 1);


        };



        /*******************************************************
            * @function - 바인딩 가능 여부 점검.
            *******************************************************/ 
        oContr.fn.checkValidBind = function(sTree, sField){

            var _sRes = {RETCD:"", MSGID: "", MSGNO:""};

            //aggregation인경우 TABLE을 DROP하지 않았다면.
            if(sTree.DATYP !== "02"){

                //111	Property, Aggregation만 바인딩 할 수 있습니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "111";
                return _sRes;
            }
            

            //바인딩 불가능 예외처리 항목에 해당하는건인경우.
            if(oAPP.attr.CT_BIND_EXCEPT.findIndex( item => item.FLD01 === sTree.UIATK ) !== -1){
                
                //112	바인딩을 할 수 없는 프로퍼티 입니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "112";                
                return _sRes;
            }

            //바인딩 팝업에서 최상위를 drag한경우, structure를 drag한경우 exit.
            if(sField.KIND === "" || sField.KIND === "S"){
                //113	Structure는 바인딩할 수 없습니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "113";                
                return _sRes;
            }
        
            //aggregation인경우 TABLE을 DROP하지 않았다면.
            if(sTree.UIATY === "3" && sField.KIND !== "T" ){
                //114	Aggregation은 internal table만 바인딩 할 수 있습니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "114";                
                return _sRes;
            }

            //KIND_PATH가 존재하지 않는건은 DROP 불가능
            //(KIND_PATH는 CONTROLLER의 ATTRIBUTE중
            //STRU, TABLE로 시작하는 정보만 구성함.)
            if(typeof sField.KIND_PATH === "undefined"){
                //115	Structure, Table로 시작하는 필드만 바인딩이 가능합니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "115";                
                return _sRes;
            }

            //n건 바인딩 처리된 UI인지 여부 확인.
            var l_path = oAPP.fn.getParentAggrBind(oAPP.attr.prev[sTree.OBJID]);
        
            var l_isTree = false;

        
            //drop한 프로퍼티가 attribute정보가 sap.m.Tree의 parent, child인경우.
            if(sTree.UIATK === "EXT00001190" ||  //parent
                sTree.UIATK === "EXT00001191"){   //child
        
                //items aggregation에 바인딩된 정보 매핑.
                l_path = oAPP.attr.prev[sTree.OBJID]._MODEL["items"];
        
                l_isTree = true;
        
            //drop한 프로퍼티가 sap.ui.table.TreeTable의 parent, child인경우.
            }else if(sTree.UIATK === "EXT00001192" || //parent
                sTree.UIATK === "EXT00001193"){  //child
        
                //rows aggregation에 바인딩된 정보 매핑.
                l_path = oAPP.attr.prev[sTree.OBJID]._MODEL["rows"];
        
                l_isTree = true;
        
            //drop한 프로퍼티가 sap.ui.table.Column의 markCellColor인경우.
            }else if(sTree.UIATK === "EXT00002382" && 
                oAPP.attr.prev[sTree.OBJID].__PARENT){
        
                //rows aggregation에 바인딩된 정보 매핑.
                l_path = oAPP.attr.prev[sTree.OBJID].__PARENT._MODEL["rows"];
        
                l_isTree = true;
        
            }else if(sTree.PUIATK === "AT000022249" || sTree.PUIATK === "AT000022258" || 
                sTree.PUIATK === "AT000013070" || sTree.PUIATK === "AT000013148"){
                //sap.ui.table.Table(sap.ui.table.TreeTable)의 rowSettingsTemplate, rowActionTemplate aggregation에 속한 UI인경우.
                l_path = oAPP.attr.prev[sTree.POBID]._MODEL["rows"];
        
                l_isTree = true;
        
            
            }else if(sTree.PUIATK === "AT000013013"){
                //sap.ui.table.RowAction의 items aggregation에 존재하는 ui인경우.
        
                //부모의 items에 바인딩이 설정되있지 않다면.
                if(!oAPP.attr.prev[sTree.POBID]._MODEL["items"]){
        
                    //부모의 라인 정보 얻기.
                    var ls_parent = oAPP.fn.getDesignTreeData(sTree.POBID);
            
                    //sap.ui.table.RowAction의 부모(ui table, tree table의 rows에 바인딩된 정보를 얻기.)
                    if(ls_parent && (ls_parent.UIOBK === "UO01139" || ls_parent.UIOBK === "UO01142")){
                        l_path = oAPP.attr.prev[ls_parent.POBID]._MODEL["rows"];
                    }
            
                }
        
            }
        
            //tree의 parent, child에 drop한경우 n건 바인딩 정보가 존재하지 않는경우.
            if(l_isTree && !l_path){
                //116	Tree의 경우 Aggregation에 먼저 바인딩을 구성해야합니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "116";      
                return _sRes;
            }
        
            
            var lt_split1, lt_split2;

            
        
            //drag한 필드가 table로부터 파생된 필드인경우.
            if(_isTablePath(sField.KIND_PATH) === true){
        
                //현재 UI가 N건 바인딩처리된건이 아닌경우 EXIT.
                if(typeof l_path === "undefined" || l_path === "" || l_path === null){
                    //117	Aggregation에 먼저 바인딩을 구성해야합니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "117";      
                    return _sRes;
                }
        
                //현재 UI가 N건 바인딩 처리됐다면 
                if(l_path !== sField.CHILD.substr(0, l_path.length)){
                    //118	Aggregation에 구성한 Table과 다른 Table입니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "118";      
                    return _sRes;
                }
        
                //현재 UI의 N건 바인딩 PATH를 구분자로 분리.(STRU-STRU-TAB 형식)
                lt_split1 = l_path.split("-");
        
                //DRAG한 UI의 KIND PATH 정보를 구분자로 분리.(S-S-T-T-E 형식)
                lt_split2 = sField.KIND_PATH.split("-");
        
                //현재 UI의 N건 바인딩 PATH 위치까지를 제거.(S-S-T 부분까지 제거)
                lt_split2.splice(0, lt_split1.length);
        
            }
        
            //drop위치의 attribute가 property인경우.
            if(sTree.UIATY === "1"){
                
                //selectOption2의 value에 바인딩 처리되는경우.
                if(sTree.UIATK === "EXT00001161" || sTree.UIATK === "EXT00002507"){

                    //drag한 필드가 range table이 아닌경우 exit.
                    if(sField.EXP_TYP !== "RANGE_TAB"){
                        //119	Range table만 바인딩이 가능합니다.
                        _sRes.RETCD = "E";
                        _sRes.MSGID = "ZMSG_WS_COMMON_001";
                        _sRes.MSGNO = "119";
                        return _sRes;
                    }
            
                
                    if(typeof lt_split2 !== "undefined"){
                        //마지막 필드 제거(마지막필드는 range table이므로)
                        lt_split2.splice(lt_split2.length - 1, 1);
            
                        //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
                        if(lt_split2.findIndex( a=> a === "T" ) !== -1){
                            //119	Range table만 바인딩이 가능합니다.
                            _sRes.RETCD = "E";
                            _sRes.MSGID = "ZMSG_WS_COMMON_001";
                            _sRes.MSGNO = "119";
                            return _sRes;
                        }
            
                    }
                    
                    //프로퍼티 바인딩 처리.
                    return _sRes;
        
                }
                
                //프로퍼티가 ARRAY로 입력 가능한 경우, 프로퍼티 타입이 숫자 유형이 아님.
                if((sTree.ISMLB === "X" && (sTree.UIADT !== "int" && sTree.UIADT !== "float"))){
                
                    //string_table이 아닌경우 exit.
                    if(sField.EXP_TYP !== "STR_TAB"){
                        //120	String table만 바인딩이 가능합니다.
                        _sRes.RETCD = "E";
                        _sRes.MSGID = "ZMSG_WS_COMMON_001";
                        _sRes.MSGNO = "120";
                        return _sRes;
                    }
        
                    //STRING_TABLE이지만 부모가 ROOT인경우 EXIT.(바인딩 가능한건은 STRU-FIELD or TABLE-FIELD만 가능)
                    if(sField.EXP_TYP === "STR_TAB" && sField.PARENT === "Attribute"){
                        //115	Structure, Table로 시작하는 필드만 바인딩이 가능합니다.
                        _sRes.RETCD = "E";
                        _sRes.MSGID = "ZMSG_WS_COMMON_001";
                        _sRes.MSGNO = "115";
                        return _sRes;
                    }
            
                    if(typeof lt_split2 !== "undefined"){
                        //마지막 필드 제거(마지막필드는 string_table이므로)
                        lt_split2.splice(lt_split2.length - 1, 1);
            
                        //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
                        if(lt_split2.findIndex( a=> a === "T" ) !== -1){
                            //120	String table만 바인딩이 가능합니다.
                            _sRes.RETCD = "E";
                            _sRes.MSGID = "ZMSG_WS_COMMON_001";
                            _sRes.MSGNO = "120";
                            return _sRes;
                        }
            
                    }
                                    
                    //프로퍼티 바인딩 처리.
                    return _sRes;
                }
        
                //일반 프로퍼티의 경우 Elementary Type 이 아닌경우 EXIT.
                if(sField.KIND !== "E"){
                    //121	일반 유형의 필드만(P, INT, CHAR, NUMC, STRING, DATE, TIME) 바인딩이 가능합니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "121";
                    return _sRes;
                }
        
                //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
                if(typeof lt_split2 !== "undefined" && lt_split2.findIndex( a=> a === "T" ) !== -1){
                    //118	Aggregation에 구성한 Table과 다른 Table입니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "118";
                    return _sRes;
                }
        
        
                //tree인경우 n건 바인딩 path와 다른 경우 exit.
                if(l_isTree && l_path && l_path !== sField.CHILD.substr(0, l_path.length)){
                    //118	Aggregation에 구성한 Table과 다른 Table입니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "118";
                    return _sRes;
                }
                    
                return _sRes;
        
            } //drop위치의 attribute가 property인경우.
        
        
            //AGGREGATION인경우 N건 들어가는 AGGREGATION이 아닌경우 EXIT.
            if(sTree.UIATY === "3" && sTree.ISMLB !== "X"){
                //122	단일 UI 등록 가능한 Aggregation에 바인딩 할 수 없습니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "122";
                return _sRes;
            }
        
            
            //AGGREGATION에 string_table을 drop한경우.
            if(sTree.UIATY === "3" && sField.EXP_TYP === "STR_TAB"){
                //123	Aggregation에 String Table을 바인딩 할 수 없습니다.
                _sRes.RETCD = "E";
                _sRes.MSGID = "ZMSG_WS_COMMON_001";
                _sRes.MSGNO = "123";
                return _sRes;
            }

        
        
            //drop위치의 attribute가 aggregation인경우.
            if(sTree.UIATY === "3" && sField.KIND === "T"){

                //현재 테이블의 자식 필드 정보를 검색.
                var _aChild = oAPP.attr.oModel.oData.TREE.filter( item => item.PARENT === sField.CHILD );

                //자식 필드 정보가 존재하지 않는경우(STRING_TABLE, INT4_TABLE 등 단일 필드 속성의 테이블인경우) 바인딩 불가능.
                if(_aChild.length === 0){
                    //124	Aggregation에 라인 유형이 일반 필드인 Internal Table을 바인딩 할 수 없습니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "124";
                    return _sRes;
                }
        
                //aggregation 바인딩 처리 가능여부 점검.(현재 UI의 child 정보에 따른 바인딩 가능여부)
                if(oAPP.fn.attrChkBindAggrPossible(sTree) === true){
                    //125	Aggregation 2개 이상의 UI가 추가 되어 있어 바인딩 할 수 없습니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "125";
                    return _sRes;
                }


                //대상 UI로부터 자식을 탐색하며 바인딩 가능 여부 점검.
                if(oAPP.fn.getChildAggrBind(sTree.OBJID, sField.CHILD) === true){
                    //126	하위 UI의 Aggregation에 같은 Internal Table이 바인딩 되어 있습니다.
                    _sRes.RETCD = "E";
                    _sRes.MSGID = "ZMSG_WS_COMMON_001";
                    _sRes.MSGNO = "126";
                    return _sRes;
                }
                

                //현재 UI로부터 부모를 탐색하며 n건 바인딩 존재 여부 확인.
                var _parentModel = oAPP.fn.getParentAggrBind(oAPP.attr.prev[sTree.OBJID], sTree.UIATT);


                if(typeof _parentModel !== "undefined"){
                    //부모에 N건 바인딩이 구성 되었을경우, 현재 DRAG한 필드와 동일한 PATH라면 바인딩 불가능.
                    if(_parentModel.startsWith(sField.CHILD) === true){

                        //127	상위 UI의 Aggregation에 같은 Internal Table이 바인딩 되어 있습니다.
                        _sRes.RETCD = "E";
                        _sRes.MSGID = "ZMSG_WS_COMMON_001";
                        _sRes.MSGNO = "127";
                        return _sRes;

                    }

                    //drag한 path가 N건 바인딩된 PATH로 부터 파생된 자식 PATH인경우.
                    if(sField.CHILD !== _parentModel && sField.CHILD.startsWith(_parentModel) === true){

                        //현재 UI의 하위에 n건 바인딩된 PATH
                        if( oAPP.fn.getChildAggrBind(sTree.OBJID, _parentModel) === true){

                            //127	상위 UI의 Aggregation에 같은 Internal Table이 바인딩 되어 있습니다.
                            _sRes.RETCD = "E";
                            _sRes.MSGID = "ZMSG_WS_COMMON_001";
                            _sRes.MSGNO = "127";
                            return _sRes;
                        }

                    }                    

                }


                if(typeof lt_split2 !== "undefined"){
                    //마지막 필드 제거(마지막필드는 TABLE이므로)
                    lt_split2.splice(lt_split2.length - 1, 1);
            
                    //n건 바인딩 path 이후 필드에 table건이 존재하는경우 exit.
                    if(lt_split2.findIndex( a=> a === "T" ) !== -1){
                        //128	Aggregation은 Internal Table만 바인딩 가능합니다.
                        _sRes.RETCD = "E";
                        _sRes.MSGID = "ZMSG_WS_COMMON_001";
                        _sRes.MSGNO = "128";
                        return _sRes;
                    }
            
                }

                return _sRes;

            }

            return _sRes;

        };


        return res(oContr);

    });

}



/********************************************************************
 *📝 design 영역 화면 구성.
********************************************************************/
function designView(oArea){

    return new Promise(async (res)=>{

        //control 정보 구성.
        let oContr = await designControl(oArea);

        oContr.ui.ROOT = new sap.m.NavContainer();
        
        oContr.ui.ROOT.setModel(oContr.oModel);

        oContr.ui.PG_MAIN = new sap.m.Page({
            showHeader:false
        });
        oContr.ui.ROOT.addPage(oContr.ui.PG_MAIN);

        //129	동일속성 바인딩
        var _txt1 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "129");

        //130	멀티 바인딩
        var _txt2 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "130");

        //A43  Unbind
        var _txt3 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A43", "", "", "", "");

        //A50  Object Name
        var _txt4 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A50", "", "", "", "");

        //165	바인딩 경로
        var _txt5 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "165");

        //139   추가속성적용
        var _txt6 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "139");

        //A46  Expand All
        var _txt7 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A46", "", "", "", "");

        //A47  Collapse All
        var _txt8 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "A47", "", "", "", "");

        //B23  Clear selection
        var _txt9 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "B23", "", "", "", "");

        //161	컬럼최적화
        var _txt10 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "161");

        //162	디자인 영역의 UI를 Drag 하여 해당 영역에 Drop 하십시오.
        var _txt11 = oAPP.WSUTIL.getWsMsgClsTxt(oAPP.attr.GLANGU, "ZMSG_WS_COMMON_001", "162");


        oContr.ui.TREE = new sap.ui.table.TreeTable({
            selectionMode:"Single",
            visibleRowCountMode:"Auto",
            minAutoRowCount:1,
            selectionBehavior:"RowOnly",
            busyIndicatorDelay:1,
            rowActionCount: 2,
            cellClick: oContr.fn.onSelDesignTreeLine,
            rowsUpdated : oContr.fn.onRowsUpdated,
            noData:_txt11,
            extension: [
                //메뉴 TREE TOOLBAR 영역.
                new sap.m.OverflowToolbar({
                    visible: true,
                    content: [
                        new sap.m.Button({
                            icon:"sap-icon://expand-all",
                            tooltip: _txt7, //A46  Expand All
                            press: function(){
                                //design tree 전체펼침.
                                oContr.fn.expandCollapseAll(true);
                            }
                        }),
                        new sap.m.Button({
                            icon:"sap-icon://collapse-all",
                            tooltip: _txt8, //A47  Collapse All
                            press: function(){
                                //design tree 전체접힘.
                                oContr.fn.expandCollapseAll(false);
                            }
                        }),
                        new sap.m.ToolbarSeparator(),
                        new sap.m.Button({
                            icon:"sap-icon://multiselect-none",
                            tooltip: _txt9, //B23  Clear selection
                            press: oContr.fn.onClearSelection
                        }),

                        new sap.m.ToolbarSeparator(),


                        new sap.m.Button({
                            icon: "sap-icon://multiselect-all",
                            type: "Accept",
                            text: _txt1,    //129	동일속성 바인딩 일괄적용
                            tooltip: _txt1, //129	동일속성 바인딩 일괄적용
                            enabled: "{/edit}",
                            press: oContr.fn.onSynchronizionBind
                        }),

                        new sap.m.Button({
                            text:_txt2,     //130	멀티 바인딩
                            tooltip:_txt2,  //130	멀티 바인딩
                            icon:"sap-icon://connected",
                            type:"Emphasized",
                            enabled: "{/edit}",
                            press: oContr.fn.onMultiBind
                        }),

                        new sap.m.Button({
                            icon: "sap-icon://disconnected",
                            type: "Reject",
                            text: _txt3,    //A43  Unbind
                            tooltip: _txt3, //A43  Unbind
                            enabled: "{/edit}",
                            press: oContr.fn.onMultiUnbind
                        }),

                        new sap.m.ToolbarSpacer(),

                        new sap.m.Button({
                            icon: "sap-icon://resize-horizontal",
                            tooltip: _txt10,    //161	컬럼최적화
                            busyIndicatorDelay: 1,
                            press: function(){
                                //tree table 컬럼길이 재조정 처리.
                                oAPP.fn.setUiTableAutoResizeColumn(oContr.ui.TREE);
                            }
                        })
                    ]
                })
            ],	/*sap.ui.core.Control*/
            columns: [
                new sap.ui.table.Column({
                    filterProperty:"DESCR",
                    width: "50%",
                    autoResizable:true,
                    label: new sap.m.Label({
                        design : "Bold",
                        text   : _txt4, //A50  Object Name
                        tooltip: _txt4  //A50  Object Name
                    }),
                    template: new sap.m.HBox({
                        alignItems:"Center",
                        width: "100%",
                        renderType: "Bare",
                        justifyContent: "SpaceBetween",
                        tooltip:"{_error_tooltip}",
                        items: [
                            new sap.m.HBox({
                                alignItems: "Center",
                                tooltip:"{_error_tooltip}",
                                items:[
                                    new sap.m.CheckBox({
                                        selected: "{chk_seleced}",
                                        visible:"{_check_visible}",
                                        valueState:"{_check_vs}",
                                        tooltip:"{_error_tooltip}",
                                        editable:"{/edit}",
                                        select: oContr.fn.onSelCheckBox
                                    }),
                                    new sap.m.Image({
                                        src:"{_image_src}",
                                        width:"19px",
                                        visible:"{_image_visible}",
                                        tooltip:"{_error_tooltip}",
                                    }).addStyleClass("u4aWsMarginRight"),
                                    new sap.ui.core.Icon({
                                        src:"{_icon_src}",
                                        width:"19px",
                                        visible:"{_icon_visible}",
                                        tooltip:"{_error_tooltip}",
                                    }).addStyleClass("u4aWsMarginRight"),
                                    // }),
                                    new sap.m.Title({
                                        text:"{DESCR}",
                                        tooltip:"{DESCR}",
                                        tooltip:"{_error_tooltip}",
                                        wrapping: false                                        
                                    }),
                                    new sap.m.Title({
                                        text:"{SUBTX}",
                                        tooltip:"{SUBTX}",
                                        wrapping: false,
                                    }).addStyleClass("u4aWsMarginLeft"),

                                ]
                            }).addStyleClass("sapUiTinyMarginEnd"),
    
                            new sap.m.ObjectStatus({
                                text:"{EMATT}", 
                                icon:"{EMATT_ICON}",
                                tooltip:"{_error_tooltip}"
                            })                            
                        ]
                    })
                }),
                new sap.ui.table.Column({
                    filterProperty:"UIATV",
                    autoResizable:true,
                    label: new sap.m.Label({
                        design : "Bold",
                        text   : _txt5, //165	바인딩 경로
                        tooltip : _txt5 //165	바인딩 경로
                    }),
                    template: new sap.m.HBox({
                        alignItems:"Center",
                        width: "100%",
                        renderType: "Bare",
                        justifyContent: "SpaceBetween",
                        items: [
                            new sap.m.HBox({
                                alignItems: "Center",
                                items:[
                                    new sap.m.Link({
                                        text:"{UIATV}",
                                        tooltip:"{UIATV}",
                                        wrapping: false,
                                        press: oContr.fn.onShowBindAdditInfo
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMarginEnd"),
                        ]
                    })
                }),

                //패키징 처리 안됐을때(개발모드)만 활성화처리.
                new sap.ui.table.Column({
                    filterProperty:"MPROP",
                    autoResizable:true,
                    visible: !oAPP.APP.isPackaged,
                    label: new sap.m.Label({
                        design : "Bold",
                        text   : "MPROP"
                    }),
                    template: new sap.m.Text({
                        text:"{MPROP}",
                        tooltip:"{MPROP}",
                        wrapping: false,
                    })
                }),

            ],
            rows: {
                path:"/zTREE_DESIGN",
                template: new sap.ui.table.Row(),
                templateShareable:true,
                parameters: {
                    collapseRecursive: true,
                    arrayNames: ["zTREE_DESIGN"],
                    numberOfExpandedLevels: 3
                }
            },
            rowSettingsTemplate: new sap.ui.table.RowSettings({
                highlight:"{_highlight}"
            }),
            rowActionTemplate : new sap.ui.table.RowAction({
                visible:"{/edit}",
                items : [
                    new sap.ui.table.RowActionItem({
                        icon:"sap-icon://accept",
                        visible: "{_bind_visible}",
                        tooltip: _txt6,   //132	바인딩 추가속성 정보 적용
                        press: oContr.fn.onAdditionalBind
                    }),
                    new sap.ui.table.RowActionItem({
                        icon:"sap-icon://disconnected",
                        visible: "{_unbind_visible}",
                        tooltip: _txt3, //A43  Unbind
                        press: oContr.fn.onUnbind
                    })
                ]
            }),
            dragDropConfig: [
                new sap.ui.core.dnd.DropInfo({
                    enabled:"{/edit}",
                    targetAggregation:"rows",
                    drop: oContr.fn.onDropBindField,
                    dragEnter: oContr.fn.onDragEnter
                }).data("DROP_TYPE", "DROP01")
            ]
        });
        oContr.ui.PG_MAIN.addContent(oContr.ui.TREE);

        oContr.ui.TREE.addEventDelegate({ondragleave:oContr.fn.onDragLeaveDesignArea});


        //모델 데이터 변경시 메인에 해당 내용 전달 처리 이벤트 등록.
        oContr.oModel.attachMessageChange(oContr.fn.onModelDataChanged);

        
        var _oUtil = await import("../utils/setStyleClassUiTable.js");

        //tree table의 style class 처리.
        _oUtil.setStyleClassUiTable(oContr.ui.TREE, "_style");


        oArea.addAggregation("content", oContr.ui.ROOT, true);



        return res(oContr);

    });

}