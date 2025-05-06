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

        //standard theme 변경 flag.
        oContr.attr.themeChanged = false;


    //언어 정보.
    const CT_LANGAGE = [
        {
            KEY : "javascript",
            TEXT : "javascript"
        },
        {
            KEY : "css",
            TEXT : "css"
        },
        {
            KEY : "html",
            TEXT : "html"
        }
    ];


    //DEFAULT 테마 색상.
    const CT_DEFAILT_RULES = [
        { token: '', foreground: 'D4D4D4', background: '1E1E1E' },
        { token: 'invalid', foreground: 'f44747' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'strong', fontStyle: 'bold' },

        { token: 'variable', foreground: '74B0DF' },
        { token: 'variable.predefined', foreground: '4864AA' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        { token: 'constant', foreground: '569CD6' },
        { token: 'comment', foreground: '608B4E' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: '5BB498' },
        { token: 'regexp', foreground: 'B46695' },
        { token: 'annotation', foreground: 'cc6666' },
        { token: 'type', foreground: '3DC9B0' },

        { token: 'delimiter', foreground: 'DCDCDC' },
        { token: 'delimiter.html', foreground: '808080' },
        { token: 'delimiter.xml', foreground: '808080' },

        { token: 'tag', foreground: '569CD6' },
        { token: 'tag.id.pug', foreground: '4F76AC' },
        { token: 'tag.class.pug', foreground: '4F76AC' },
        { token: 'meta.scss', foreground: 'A79873' },
        { token: 'meta.tag', foreground: 'CE9178' },
        { token: 'metatag', foreground: 'DD6A6F' },
        { token: 'metatag.content.html', foreground: '9CDCFE' },
        { token: 'metatag.html', foreground: '569CD6' },
        { token: 'metatag.xml', foreground: '569CD6' },
        { token: 'metatag.php', fontStyle: 'bold' },

        { token: 'key', foreground: '9CDCFE' },
        { token: 'string.key.json', foreground: '9CDCFE' },
        { token: 'string.value.json', foreground: 'CE9178' },

        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
        { token: 'attribute.value.number.css', foreground: 'B5CEA8' },
        { token: 'attribute.value.unit.css', foreground: 'B5CEA8' },
        { token: 'attribute.value.hex.css', foreground: 'D4D4D4' },

        { token: 'string', foreground: 'CE9178' },
        { token: 'string.sql', foreground: 'FF0000' },

        { token: 'keyword', foreground: '569CD6' },
        { token: 'keyword.flow', foreground: 'C586C0' },
        { token: 'keyword.json', foreground: 'CE9178' },
        { token: 'keyword.flow.scss', foreground: '569CD6' },

        { token: 'operator.scss', foreground: '909090' },
        { token: 'operator.sql', foreground: '778899' },
        { token: 'operator.swift', foreground: '909090' },
        { token: 'predefined.sql', foreground: 'FF00FF' }
        
    ];


    //DEFAULT 테마 색상.
    const CT_DEFAULT_COLORS = [
        { token: 'editor.background', color: '#1E1E1E' },
        { token: 'editor.foreground', color: '#D4D4D4' },
        { token: 'editor.InactiveSelection', color: '#3A3D41' },
        { token: 'editor.IndentGuide1', color: '#404040' },
        { token: 'editor.ActiveIndentGuide1', color: '#707070' },
        { token: 'editor.SelectionHighlight', color: '#ADD6FF26' }
    ];


    //폰트 스타일.
    const CT_FONT_STYLE = [
        {
            KEY : "",
            TEXT : "None"
        },
        {
            KEY : "F01",
            TEXT : "italic"
        }, 
        {
            KEY : "F02",
            TEXT : "bold"
        },
        {
            KEY : "F03",
            TEXT : "underline"
        }
    ];

    //TABLE VISIBLE ROW COUNT MAX값.
    const C_MAXROW = 7;


    oContr.oModel = new sap.ui.model.json.JSONModel({
        S_THEME: {
            LANGUAGE         : "",           //언어.
            NAME             : "",           //테마명
            NAME_VS          : undefined,    //테마 오류 표현 필드.
            NAME_VT          : "",           //테마 오류 표현 필드.
            THEME_SUBTX      : "",           //테마 dark / light text 표현 필드.
 
            CUSTOM_NAME      : "",           //커스텀 테마명.
            CUSTOM_NAME_VS   : undefined,    //커스텀 테마 오류 표현 필드.
            CUSTOM_NAME_VT   : "",           //커스텀 테마 오류 표현 필드.
            CUSTOM_NAME_EDIT : true          //커스텀 테마 입력 가능 필드.
        },

        S_LIST : {
            RULE_ROW_CNT : 1,
            COLOR_ROW_CNT : 1
        },

        T_FONT_STYLE : JSON.parse(JSON.stringify(CT_FONT_STYLE)),

        //테마 DDLB 리스트 바인딩 정보.
        T_THEME : [],

        //선택한 테마의 RULES 리스트 정보.
        T_RULES : [],

        //선택한 테마의 COLORS 리스트 정보.
        T_COLORS: [],

    });

    oContr.oModel.setSizeLimit(Infinity);

/******************************************************************************
*  💖 PRIVATE FUNCTION 선언부
******************************************************************************/


    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/




/******************************************************************************
* 💖  PUBLIC EVENT FUNCTION 선언부
******************************************************************************/

    /*************************************************************
    * @flowEvent - 화면이 로드 될때 타는 이벤트
    *************************************************************/
    oContr.onViewReady = async function () {

        zconsole.log("onViewReady");


        //초기 데이터 구성.
        oContr.fn.setInitData();

        
        //팝업 초기 모델 바인딩 데이터 구성.
        oContr.fn.fnInitModelBinding();


        oAPP.fn.setBusy("");

    }; // end of oContr.onViewReady



    /*************************************************************
     * @function - XXXXXXX
     *************************************************************/


    /************************************************************************
     * 초기 데이터 구성.
     ************************************************************************/
    oContr.fn.setInitData = function(){

        //monaco editor 에디터 path.
        oContr.attr.monacoLibPath = oAPP.PATH.join(oAPP.APPPATH, "lib", "monaco");


        //monaco editor 폴더 경로.
        oContr.attr.monacoVSPath = oAPP.PATH.join(oContr.attr.monacoLibPath, "vs");


        //monaco editor loader js 파일 경로.
        oContr.attr.monacoLoaderPath = oAPP.PATH.join(oContr.attr.monacoVSPath, "loader.js");


        //standard 테마 경로.
        oContr.attr.standardThemePath = oAPP.PATH.join(oAPP.APPPATH, "lib", "monaco", "themes");


        //custom 테마 경로.
        oContr.attr.customThemePath = oAPP.PATH.join(parent.PATHINFO.P13N_ROOT, "monaco", "theme");
        

    };


    /************************************************************************
     * 언어 DDLB 리스트 구성.
     ************************************************************************/
    oContr.fn.getLanguageDDLBList = function(){

        let _aLangugage = [];

        for (let i = 0, l = CT_LANGAGE.length; i < l; i++) {
            
            let _sLanguage = CT_LANGAGE[i];

            _aLangugage.push({
                KEY: _sLanguage.KEY,
                TEXT: _sLanguage.TEXT,
            });
            
        }

        return _aLangugage;

    };


    /************************************************************************
     * 테마 DDLB 리스트 구성.
     ************************************************************************/
    oContr.fn.getThemeDDLBList = function(themePath){

        let _aThemeList = [];


        //해당 경로의 파일 및 폴더 항목 발췌.
        try {
            var _aFileList = oAPP.FS.readdirSync(themePath);
        } catch (e) {
            
            return _aThemeList;
        }
        

        for (let i = 0, l = _aFileList.length; i < l; i++) {

            var _fileList = _aFileList[i];

            var _filePath = oAPP.PATH.join(themePath, _fileList);

            try {
                //파일 or 폴더 정보 얻기.
                var _oDirInfo = oAPP.FS.statSync(_filePath);
                
            } catch (e) {
                continue;
            }

            //파일 확인여부 function이 존재하지 않는다면 skip.
            if(typeof _oDirInfo?.isFile === "undefined"){
                continue;
            }

            //파일이 아닌경우 skip.
            if(_oDirInfo.isFile() === false){
                continue;
            }

            //파일 정보 얻기.            
            var _oFileInfo = oAPP.PATH.parse(_filePath);

            //파일 정보를 얻지 못한 경우 skip.
            if(typeof _oFileInfo === "undefined"){
                continue;
            }


            try {

                //파일 읽기.
                var _themeJson = oAPP.FS.readFileSync(oAPP.PATH.join(themePath, _oFileInfo.base), "utf-8");
    
                //읽은 파일을 json 변환 처리.
                var _sThemeInfo = JSON.parse(_themeJson);
    
            } catch (error) {
                continue;
            }


            //theme sub text 정보 구성.
            let _SUBTX = oContr.fn.setThemeSubText(_sThemeInfo?.base);

            //테마 리스트 구성.
            _aThemeList.push({                
                KEY         : _oFileInfo.base,     //실제 파일명(All-Hallows-Ev3e.json).
                TEXT        : _oFileInfo.name,     //확장자 없는 파일명(All-Hallows-Ev3e).
                SUBTX       : _SUBTX,              //dark / light 테마
                base        :_sThemeInfo?.base,    //BASE 테마 정보.(vs, vs-dark)
                inherit     :_sThemeInfo?.inherit  //상속 필드.
            });

        }


        return _aThemeList;

    };



    /************************************************************************
     * 🔊 테마 ddlb 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeTheme = function(oEvent){

        oAPP.fn.setBusy("X");

        //모델 바인딩 정보 초기화.
        oContr.fn.resetThemeData();

        //테마명이 존재하지 않는경우 exit.
        if(oContr.oModel.oData.S_THEME.NAME === ""){

            //첫번째 step으로 이동 처리.
            oContr.ui.WIZARD1.discardProgress(oContr.ui.WIZARDSTEP1);

            oAPP.fn.setBusy("");
            return;
        }

        
        //테마 상세 데이터 구성.
        oContr.fn.setThemeDetailData();


        oContr.oModel.refresh();


        //에디터 테마 변경 처리.
        oContr.fn.changeEditorTheme();


        oAPP.fn.setBusy("");

        //color 리스트 구성.

    };



    /************************************************************************
     * 🔊 전경색 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeForegroundColor = async function(oUi){

        oAPP.fn.setBusy("X");

        //ui의 바인딩 데이터 얻기.
        let _sRule = oContr.fn.getContextData(oUi);

        if(typeof _sRule === "undefined"){
            oAPP.fn.setBusy("");
            return;
        }


        oAPP.fn.setBusy("");

        //색상선택 팝업 호출.
        let _color = await oContr.fn.callColorPopup(oUi, _sRule.FGROUND_COLOR);

        if(typeof _color === "undefined"){
            return;
        }

        //theme 변경함 flag 처리.
        oContr.attr.themeChanged = true;
        

        oAPP.fn.setBusy("X");

        _sRule.FGROUND_COLOR = _color;
        _sRule.foreground = _color.replace(/#/, "");

        oContr.oModel.refresh();


        //에디터 테마 변경 처리.
        oContr.fn.changeEditorTheme();

        oAPP.fn.setBusy("");


    };


    /************************************************************************
     * 🔊 배경색 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeBackgroundColor = async function(oUi){

        oAPP.fn.setBusy("X");
        
        //ui의 바인딩 데이터 얻기.
        let _sRule = oContr.fn.getContextData(oUi);

        if(typeof _sRule === "undefined"){
            oAPP.fn.setBusy("");
            return;
        }

        oAPP.fn.setBusy("");

        //색상선택 팝업 호출.
        let _color = await oContr.fn.callColorPopup(oUi, _sRule.BGROUND_COLOR);

        if(typeof _color === "undefined"){
            return;
        }
        
        //theme 변경함 flag 처리.
        oContr.attr.themeChanged = true;

        oAPP.fn.setBusy("X");

        _sRule.BGROUND_COLOR = _color;
        _sRule.background = _color.replace(/#/, "");

        oContr.oModel.refresh();

        //에디터 테마 변경 처리.
        oContr.fn.changeEditorTheme();

        oAPP.fn.setBusy("");

    };


    /************************************************************************
     * 🔊 색상 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeColor = async function(oUi){

        oAPP.fn.setBusy("X");

        //ui의 바인딩 데이터 얻기.
        let _sColor = oContr.fn.getContextData(oUi);

        if(typeof _sColor === "undefined"){
            oAPP.fn.setBusy("");
            return;
        }

        oAPP.fn.setBusy("");

        //색상선택 팝업 호출.
        let _color = await oContr.fn.callColorPopup(oUi, _sColor.color);

        if(typeof _color === "undefined"){
            return;
        }
        

        //theme 변경함 flag 처리.
        oContr.attr.themeChanged = true;
        

        oAPP.fn.setBusy("X");

        _sColor.color = _color;

        oContr.oModel.refresh();


        //에디터 테마 변경 처리.
        oContr.fn.changeEditorTheme();

        oAPP.fn.setBusy("");
        

    };


    /************************************************************************
     * 🔊 폰트 스타일 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeFontStyle = function(oUi){

        oAPP.fn.setBusy("X");

        //theme 변경함 flag 처리.
        oContr.attr.themeChanged = true;

        //에디터 테마 변경 처리.
        oContr.fn.changeEditorTheme();

        oAPP.fn.setBusy("");

    };


    /************************************************************************
     * 🔊 splitter resize 이벤트
     ************************************************************************/
    oContr.fn.onSplitterResize = function(oEvent){

        var _oUi = oEvent.oSource || undefined;
        
        if(typeof _oUi === "undefined"){
            return;
        }

        var _aOldSize = oEvent?.mParameters?.oldSizes || [];

        if(_aOldSize.length === 0){
            return;
        }

        //size 정보 얻기.
        var _aSize = oEvent?.mParameters?.newSizes || undefined;
                
        //size 정보가 없다면 exit.
        if(typeof _aSize === "undefined"){
            return;
        }
        
        if(Array.isArray(_aSize) !== true){
            return;
        }
        
        if(_aSize.length === 0){
            return;
        }
        
        
        //splitter dom 정보 얻기.    
        var _oDom = _oUi.getDomRef();
            
        //화면에 그려지지 않은경우 exit.
        if(typeof _oDom === "undefined" || _oDom === null){
            return;
        }
        
        
        //splitter의 하위 area 정보 얻기.
        var _aArea = _oUi.getContentAreas();
        
        //area가 없다면 exit
        if(typeof _aArea === "undefined"){
            return;
        }
        
        if(Array.isArray(_aArea) !== true){
            return;
        }
        
        if(_aArea.length === 0){
            return;
        }


        //bar에 해당하는 size 얻기.
        //(resizable 프로퍼티 변경시 bar 존재여부 확인해.)
        var _barSize = (_aSize.length - 1) * 16;
        
        var _totalSize = 0;
        
        
        //splitter의 수직, 수평 표현 값에 따른 분기.
        switch (_oUi.getOrientation()) {
            case 'Vertical':
                //수직으로 표현하는경우 height값으로 계산.
                _totalSize = _oDom.scrollHeight - _barSize;
                break;
                
            case 'Horizontal':
                //수팽으로 표현하는경우 width 값으로 계산.
                _totalSize = _oDom.scrollWidth - _barSize;
                break;
            
            default:
                return;
        }
        
        
        //전체 크기가 0px 인경우 exit.
        if(_totalSize === 0){
            return;
        }
        

        //마지막 위치 index.
        var _last = _aArea.length - 1;
        
        //area의 size를 %로 계산 처리.
        for (var i = 0, l = _aArea.length; i < l; i++) {
            
            var _oArea = _aArea[i];
            
            var _oLayout = _oArea.getLayoutData();
            
            if(typeof _oLayout === "undefined" || _oLayout === null){
                continue;
            }

            //마지막 area인경우 size auto 처리.
            if(i === _last){
                //area의 size를 auto로 지정.
                //(마지막 size를 %로 지정할 경우 window창을 최소화 한뒤
                //각 area를 minSize로 줄이고 windown를 전체창으로 변경하면
                //resize 이벤트가 동작하지 않아 size 계산을 하지 못함.
                //마지막 area의 size를 auto로 설정하면 window전체창시 resize이벤트가 호출됨)
                _oLayout.setSize(`auto`);
                continue;
            }
            
            var _size = _aSize[i];
            
            _size = (_size / _totalSize) * 100;
            
            //소숫점 2자리까지 반올림.
            _size = _size.toFixed(2);
                        
            _oLayout.setSize(`${_size}%`);
            
            
        }

    };


    /************************************************************************
     * 🔊 테마 선택 step active
     ************************************************************************/
    oContr.fn.onThemeStepComplete = function(oEvent){

        oAPP.fn.setBusy("X");

        let _step = oContr.ui.WIZARD1.getCurrentStep();

        let _oCurrentStep = sap.ui.getCore().byId(_step) ||undefined; 

        if(typeof _oCurrentStep === "undefined"){
            oAPP.fn.setBusy("");
            return;
        }


        switch (_oCurrentStep) {
            case oContr.ui.WIZARDSTEP1:
                //테마 선택 step.

                //테마명 선택건 점검.
                if(oContr.fn.checkThemeName() === true){
                    
                    //첫번째 step으로 이동 처리.
                    oContr.ui.WIZARD1.discardProgress(oContr.ui.WIZARDSTEP1);

                    oAPP.fn.setBusy("");
                    return;
                }
                
                break;

            case oContr.ui.WIZARDSTEP2:
                //테마 속성정보 설정 step.
                
                break;

        
            default:
                break;
        }


        oAPP.fn.setBusy("");


    };


    /************************************************************************
     * 🔊 테마 저장 이벤트.
     ************************************************************************/
    oContr.fn.onSaveTheme = async function(){

        oAPP.fn.setBusy("X");


        //테마명 선택건 점검.
        if(oContr.fn.checkThemeName() === true){
            
            //첫번째 step으로 이동 처리.
            oContr.ui.WIZARD1.discardProgress(oContr.ui.WIZARDSTEP1);

            oAPP.fn.setBusy("");
            return;
        }


        //커스텀 테마명 입력건 확인.
        if(oContr.fn.checkCustomThemeName() === true){

            oContr.oModel.refresh();

            //세번째 step으로 이동 처리.
            oContr.ui.WIZARD1.discardProgress(oContr.ui.WIZARDSTEP3);
            
            oAPP.fn.setBusy("");
            

            oContr.ui.CUSTOM_THEME_NAME.focus();

            return;
        }


        oAPP.fn.setBusy("");


        let _conf = await new Promise(function(resolve){
            //$msg
            sap.m.MessageBox.confirm("테마 정보를 저장하시겠습니까?", function(param){
                resolve(param);
            });
        });

        if(_conf !== "OK"){
            return;
        }

        oAPP.fn.setBusy("X");

        //테마 데이터 구성 처리.
        let _sData = oContr.fn.setEditorThemeData();

        //파일명 구성.
        let _fileName = oContr.oModel.oData.S_THEME.CUSTOM_NAME + ".json";

        try {
            
            //파일 저장 처리.
            oAPP.FS.writeFileSync(oAPP.PATH.join(oContr.attr.customThemePath, _fileName), JSON.stringify(_sData, "", 2));

        } catch (error) {
            sap.m.MessageBox.error("custom 테마 정보 저장 실패. 잠시 후 다시 시도 하십시오. 오류가 반복될 경우 관리자에게 문의 바랍니다.");     //$msg
            oAPP.fn.setBusy("");
            return;   
        }


        //해당 테마가 기존 테마 ddlb 리스트에 존재하는지 확인.
        let _sThemeInfo = oContr.oModel.oData.T_THEME.find( items => items.KEY === _fileName );

        //존재하지 않는경우 신규 추가 처리.
        if(typeof _sThemeInfo === "undefined"){
            _sThemeInfo = {};
            oContr.oModel.oData.T_THEME.push(_sThemeInfo);
        }
                
        _sThemeInfo.KEY         = _fileName;
        _sThemeInfo.TEXT        = oContr.oModel.oData.S_THEME.CUSTOM_NAME;

        _sThemeInfo.base        = _sData.base;
        _sThemeInfo.inherit     = _sData.inherit;

        //theme sub text 정보 구성.
        _sThemeInfo.SUBTX = oContr.fn.setThemeSubText(_sThemeInfo.base);

        _sThemeInfo.IS_STANDARD = false;



        //테마 변경함 flag 초기화.
        oContr.attr.themeChanged = false;

        //커스텀 테마명 입력 필드 잠금 처리.
        oContr.oModel.oData.S_THEME.CUSTOM_NAME_EDIT = false;

        //테마명 ddlb 선택건 변경 처리.
        oContr.oModel.oData.S_THEME.NAME = _fileName;


        oContr.oModel.refresh();


        //$msg
        sap.m.MessageToast.show("테마 정보를 저장했습니다.", {my:"center center", at:"center center"});

        oAPP.fn.setBusy("");

    };


    /************************************************************************
     * 🔊 테마 팝업 종료 이벤트.
     ************************************************************************/
    oContr.fn.onCloseThemeEditorPopup = function(){

        //팝업 종료 처리.
        parent.CURRWIN.close();


    };


    /************************************************************************
     * 🔊 Langage 변경 이벤트.
     ************************************************************************/
    oContr.fn.onChangeLangage = function(){

        oAPP.fn.setBusy("X");

        let _sData = {};

        //language 변경 action code.
        _sData.actcd = "changeLanguage";

        //선택한 언어키.
        _sData.language = oContr.oModel.oData.S_THEME.LANGUAGE;

        let _oEditor = document.body.querySelector(".EDITOR_FRAME1");

        _oEditor.contentWindow.postMessage(_sData);

        oAPP.fn.setBusy("");


    };


    /************************************************************************
     * 🔊 테마 초기화 기능.
     ************************************************************************/
    oContr.fn.onResetThemeData = function(){

        oAPP.fn.setBusy("X");

        //테마 데이터 초기화 처리.
        oContr.fn.resetThemeData(true);

        //첫번째 step으로 이동 처리.
        oContr.ui.WIZARD1.discardProgress(oContr.ui.WIZARDSTEP1);

        //$msg
        sap.m.MessageToast.show("테마 정보를 초기화 했습니다.", {my:"center center", at:"center center"});

        oAPP.fn.setBusy("");

    };


    /************************************************************************
     * 🔊 iframe 로드 이벤트.
     ************************************************************************/
    oContr.fn.onFrameLoad = function(oEvent){

    };



    /************************************************************************
     * 초기 모델 바인딩
     ************************************************************************/
    oContr.fn.fnInitModelBinding = function () {

        //언어 DDLB 리스트 구성.
        oContr.oModel.oData.T_LANGAGE = oContr.fn.getLanguageDDLBList();

        
        //stadard 테마 리스트 구성.
        let _aStandardThemeList = oContr.fn.getThemeDDLBList(oContr.attr.standardThemePath);

        
        //custom 테마 리스트 구성.
        let _aCustomThemeList = oContr.fn.getThemeDDLBList(oContr.attr.customThemePath);

        
        //stadard 테마 정보 ddlb 리스트 구성.
        for (let i = 0, l = _aStandardThemeList.length; i < l; i++) {
            let _sStandardThemeList = _aStandardThemeList[i];

            let _sTheme = {};

            _sTheme.KEY         = _sStandardThemeList.KEY;
            _sTheme.TEXT        = _sStandardThemeList.TEXT;
            _sTheme.SUBTX       = _sStandardThemeList.SUBTX;
            _sTheme.base        = _sStandardThemeList.base;
            _sTheme.inherit     = _sStandardThemeList.inherit;
            _sTheme.IS_STANDARD = true;

            oContr.oModel.oData.T_THEME.push(_sTheme);
            
        }


        //커스텀 테마 정보 ddlb 리스트 구성.
        for (let i = 0, l = _aCustomThemeList.length; i < l; i++) {
            let _sCustomThemeList = _aCustomThemeList[i];

            let _sTheme = {};

            _sTheme.KEY         = _sCustomThemeList.KEY;
            _sTheme.TEXT        = _sCustomThemeList.TEXT;
            _sTheme.SUBTX       = _sCustomThemeList.SUBTX;
            _sTheme.base        = _sCustomThemeList.base;
            _sTheme.inherit     = _sCustomThemeList.inherit;
            _sTheme.IS_STANDARD = false;

            oContr.oModel.oData.T_THEME.push(_sTheme);
            
        }


        //DEFAULT LANGUAGE 설정.
        oContr.oModel.oData.S_THEME.LANGUAGE = oContr.oModel.oData.T_LANGAGE[0].KEY;

        
        oContr.oModel.refresh();

    }; // end of oContr.fn.fnInitModelBinding


    /************************************************************************
     * 테마 데이터 초기화 처리.
     ************************************************************************/
    oContr.fn.resetThemeData = function(isAll){
        
        //테마를 변경하는 경우 standard theme 변경 flag 초기화.
        oContr.attr.themeChanged = false;

        if(isAll === true){
            //테마 선택건 초기화.
            oContr.oModel.oData.S_THEME.NAME = "";
        }

        //rules, color 리스트 초기화.
        oContr.oModel.oData.T_RULES = [];
        oContr.oModel.oData.T_COLORS = [];

        //rules, color 테이블 row 초기화.
        oContr.oModel.oData.S_LIST.RULE_ROW_CNT = 1;
        oContr.oModel.oData.S_LIST.COLOR_ROW_CNT = 1;

        //theme dark, light text 초기화.
        oContr.oModel.oData.S_THEME.THEME_SUBTX = "";

        //커스텀 테마명 입력필드 초기화.
        oContr.oModel.oData.S_THEME.CUSTOM_NAME = "";

        //theme 오류 표현 필드 초기화.
        oContr.oModel.oData.S_THEME.NAME_VS = undefined;
        oContr.oModel.oData.S_THEME.NAME_VT = "";

        //theme 오류 표현 필드 초기화.
        oContr.oModel.oData.S_THEME.CUSTOM_NAME_VS = undefined;
        oContr.oModel.oData.S_THEME.CUSTOM_NAME_VT = "";

        //default 커스텀 테마명 입력 가능.
        oContr.oModel.oData.S_THEME.CUSTOM_NAME_EDIT = true;

        oContr.oModel.refresh();

    };


    /************************************************************************
     * theme sub text 정보 구성.
     ************************************************************************/
    oContr.fn.setThemeSubText = function(base){

        //json 파일의 테마 정보
        switch (base) {
            case "vs":
                //vs인경우 Light 테마. 
                return "Light Theme"; //$msg
                break;
        
            case "vs-dark":
                //vs-dark인경우 Dark 테마.
                return "Dark Theme";  //$msg
                break;
            default:
                break;
        }

    };


    /************************************************************************
     * 테마명 선택건 점검.
     ************************************************************************/
    oContr.fn.checkThemeName = function(){

        oContr.oModel.oData.S_THEME.NAME_VS = undefined;
        oContr.oModel.oData.S_THEME.NAME_VT = "";

        //테마 정보 선택건 존재 여부 확인.
        if(oContr.oModel.oData.S_THEME.NAME === ""){

            oContr.oModel.oData.S_THEME.NAME_VS = "Error";
            oContr.oModel.oData.S_THEME.NAME_VT = "Theme를 선택 하십시오";    //$msg

            oContr.oModel.refresh();

            sap.m.MessageToast.show(oContr.oModel.oData.S_THEME.NAME_VT,
                {duration: 3000, at:"center center", my:"center center"});
            
            return true;
        }

    };


    /************************************************************************
     * 테마 속성정보 변경건 확인.
     ************************************************************************/
    oContr.fn.checkThemeChangedData = function(){

        //테마 변경건이 존재하지 않는경우.
        if(oContr.attr.themeChanged !== true){
            //$msg
            sap.m.MessageToast.show("테마 속성정보 변경건이 존재하지 않습니다.",
                {duration: 3000, at:"center center", my:"center center"});

            return true;
        }

    };


    /************************************************************************
     * 커스텀 테마명 입력건 확인.
     ************************************************************************/
    oContr.fn.checkCustomThemeName = function(){

        let _S_THEME = oContr.oModel.oData.S_THEME;

        //오류 표현 필드 초기화.
        _S_THEME.CUSTOM_NAME_VS = undefined;
        _S_THEME.CUSTOM_NAME_VT = "";


        //테마명을 입력하지 않은경우.
        if(_S_THEME.CUSTOM_NAME === ""){

            var _msg = "테마명을 입력하십시오";     //$msg

            _S_THEME.CUSTOM_NAME_VS = "Error";
            _S_THEME.CUSTOM_NAME_VT = _msg

            sap.m.MessageToast.show(_msg, 
                {duration: 3000, at:"center center", my:"center center"});

            return true;
        }

        let _oReg = new RegExp(/[^a-z0-9\-]/gi);


        //허용 불가문자를 입력한 경우
        if(_oReg.test(_S_THEME.CUSTOM_NAME) === true){

            var _msg = "영어, 숫자, - 이외의 문자는 입력할 수 없습니다.";     //$msg

            _S_THEME.CUSTOM_NAME_VS = "Error";
            _S_THEME.CUSTOM_NAME_VT = _msg

            sap.m.MessageToast.show(_msg, 
                {duration: 3000, at:"center center", my:"center center"});

            return true;

        }

        
        let _CUSTOM_NAME = _S_THEME.CUSTOM_NAME.toLowerCase();


        //standard 테마명과 동일한 이름을 입력한 경우 오류 처리.
        if(oContr.oModel.oData.T_THEME.findIndex( item => item.TEXT.toLowerCase() === _CUSTOM_NAME && item.IS_STANDARD === true ) !== -1){

            var _msg = "Standard 테마명은 입력할 수 없습니다.";     //$msg

            _S_THEME.CUSTOM_NAME_VS = "Error";
            _S_THEME.CUSTOM_NAME_VT = "Standard 테마명은 입력할 수 없습니다.";     //$msg

            sap.m.MessageToast.show(_msg, 
                {duration: 3000, at:"center center", my:"center center"});

            return true;
        }

        
    };


    /************************************************************************
     * 테마 상세 데이터 구성.
     ************************************************************************/
    oContr.fn.setThemeDetailData = function(){

        if(oContr.oModel.oData.S_THEME.NAME === ""){
            return;
        }

        var _sThemeList = oContr.oModel.oData.T_THEME.find( item => item.KEY === oContr.oModel.oData.S_THEME.NAME );

        if(typeof _sThemeList !== "undefined"){
            oContr.oModel.oData.S_THEME.THEME_SUBTX = _sThemeList.SUBTX;
        }


        //default standard path.
        let _rootPath = oContr.attr.standardThemePath;


        //선택한 테마가 custom theme인경우 custom 테마 path로 지정.
        if(_sThemeList.IS_STANDARD === false){
            _rootPath = oContr.attr.customThemePath;

            //커스텀 테마명 매핑.
            oContr.oModel.oData.S_THEME.CUSTOM_NAME = _sThemeList.TEXT;
            oContr.oModel.oData.S_THEME.CUSTOM_NAME_EDIT = false;

        }


        try {

            //파일 읽기.
            var _themeJson = oAPP.FS.readFileSync(oAPP.PATH.join(_rootPath, oContr.oModel.oData.S_THEME.NAME), "utf-8");

            //읽은 파일을 json 변환 처리.
            var _sThemeInfo = JSON.parse(_themeJson);

        } catch (error) {
            sap.m.MessageBox.error("custom 테마 정보 읽기 실패. 잠시 후 다시 시도 하십시오. 오류가 반복될 경우 관리자에게 문의 바랍니다.");     //$msg
            oAPP.fn.setBusy("");
            return;
        }
       
        
        //rule 리스트 구성.
        oContr.fn.setRuleList(_sThemeInfo);

        //color 리스트 구성.
        oContr.fn.setColorList(_sThemeInfo);

        //얻은 rule list가 존재하는 경우 해당 row값, 없으면 default 1.
        let _ruleRowCnt = Math.max(oContr.oModel.oData.T_RULES.length, 1);

        //row가 7을 초과한 경우 7으로 고정.
        if(_ruleRowCnt > C_MAXROW){
            _ruleRowCnt = C_MAXROW;
        }


        //얻은 color list가 존재하는 경우 해당 row값, 없으면 default 1.
        let _colorRowCnt = Math.max(oContr.oModel.oData.T_COLORS.length, 1);

        //row가 7을 초과한 경우 7으로 고정.
        if(_colorRowCnt > C_MAXROW){
            _colorRowCnt = C_MAXROW;
        }

        oContr.oModel.oData.S_LIST.RULE_ROW_CNT = _ruleRowCnt;
        oContr.oModel.oData.S_LIST.COLOR_ROW_CNT = _colorRowCnt;


    };



    /************************************************************************
     * 현재 선택한 테마가 standard theme 여부 얻기.
     ************************************************************************/
    oContr.fn.isSelectedThemeStandard = function(){

        let _theme = oContr.oModel.oData.S_THEME.NAME;

        //현재 선택한 테마 정보 read.
        let _sTheme = oContr.oModel.oData.T_THEME.find( item => item.KEY === _theme );

        return _sTheme?.IS_STANDARD || false;


    };


    /************************************************************************
     * -- 모델 바인딩 처리된 ui의 BindingContext 에서 모델 데이터 발췌.
     ************************************************************************/
    oContr.fn.getContextData = function(oUi){

        if(typeof oUi === "undefined"){
            return;
        }

        let _oCtxt = oUi.getBindingContext() || undefined;

        if(typeof _oCtxt?.getProperty === "undefined"){
            return;
        }

        return _oCtxt.getProperty();

    };


    /************************************************************************
     * -- RULE LIST 구성 처리.
     ************************************************************************/
    oContr.fn.setRuleList = function(sThemeInfo){

        if(typeof sThemeInfo?.rules === "undefined"){
            return;
        }

        if(Array.isArray(sThemeInfo.rules) !== true){
            return;
        }

        if(sThemeInfo.rules.length === 0){
            return;
        }
         
        //json의 rules 항목을 기준으로 리스트 구성.
        for (let i = 0; i < sThemeInfo.rules.length; i++) {
            
            var _sRules = sThemeInfo.rules[i];

            if(_sRules.token === ""){
                continue;
            }

            //default rules에 존재하는건에 대해서만 리스트 구성.
            var _sDefault = CT_DEFAILT_RULES.find( items => items.token === _sRules.token );

            if(typeof _sDefault === "undefined"){
                continue;
            }


            var _sRuleList = {};

            _sRuleList.token    = _sRules.token;
            _sRuleList.TOKEN_TX = _sRules.token;

            //폰트 스타일.
            _sRuleList.fontStyle = _sRules?.fontStyle || "";

            //폰트 스타일 DDLB 선택값.
            _sRuleList.FONT_STYLE = "";

            //foreground 버튼 DEFAULT 비활성 처리.
            _sRuleList.FGROUND_VISIBLE = false;

            //background 버튼 DEFAULT 비활성 처리.
            _sRuleList.BGROUND_VISIBLE = false;


            //foreground 값이 존재하는경우.
            if(typeof _sRules.foreground !== "undefined"){

                //해당 값 매핑.
                _sRuleList.foreground = _sRules.foreground;

                _sRuleList.FGROUND_COLOR = _sRules.foreground;

                _sRuleList.FGROUND_OPACITY = "";

                //색상코드가 #으로 시작되지 않는경우.
                if(_sRuleList.FGROUND_COLOR.startsWith("#") === false){

                    //#을 추가 처리.
                    _sRuleList.FGROUND_COLOR = "#" + _sRuleList.FGROUND_COLOR;
                }
                
                //색상코드가 #을 포함하여 7자리가 넘는는경우.(opacity값이 포함된경우.)
                if(_sRuleList.FGROUND_COLOR.length > 7){
                    //opacity에 해당하는 값만 따로 발췌.
                    _sRuleList.FGROUND_OPACITY = _sRuleList.FGROUND_COLOR.substr(7);

                    _sRuleList.FGROUND_COLOR = _sRuleList.FGROUND_COLOR.substr(0, 7);
                }

                //foreground 버튼 활성 처리.
                _sRuleList.FGROUND_VISIBLE = true;

            }
            
            
            //background 값이 존재하는경우.
            if(typeof _sRules.background !== "undefined"){

                //해당 값 매핑.
                _sRuleList.background = _sRules.background;

                _sRuleList.BGROUND_COLOR = _sRules.background;

                _sRuleList.BGROUND_OPACITY = "";

                //색상코드가 #으로 시작되지 않는경우.
                if(_sRuleList.BGROUND_COLOR.startsWith("#") === false){
                    //#을 추가 처리.
                    _sRuleList.BGROUND_COLOR = "#" + _sRuleList.BGROUND_COLOR;
                }

                //색상코드가 #을 포함하여 7자리가 넘는는경우.(opacity값이 포함된경우.)
                if(_sRuleList.BGROUND_COLOR.length > 7){
                    //opacity에 해당하는 값만 따로 발췌.
                    _sRuleList.BGROUND_OPACITY = _sRuleList.BGROUND_COLOR.substr(7);

                    _sRuleList.BGROUND_COLOR = _sRuleList.BGROUND_COLOR.substr(0, 7);


                }

                //background 버튼 활성 처리.
                _sRuleList.BGROUND_VISIBLE = true;
            }

            oContr.oModel.oData.T_RULES.push(_sRuleList);
            
        }


    };


    /************************************************************************
     * -- COLOR LIST 구성 처리.
     ************************************************************************/
    oContr.fn.setColorList = function(sThemeInfo){

        if(typeof sThemeInfo?.colors === "undefined"){
            return;
        }


        //json의 color 항목을 기준으로 리스트 구성.
        for (const key in sThemeInfo.colors) {

            //default color에 존재하는건에 대해서만 리스트 구성.
            var _sDefault = CT_DEFAULT_COLORS.find( items => items.token === key );

            if(typeof _sDefault === "undefined"){
                continue;
            }

            var _sColorList = {};

            _sColorList.token = key;
            _sColorList.TOKEN_TX = key;

            _sColorList.color = sThemeInfo.colors[key];

            _sColorList.COLOR_OPACITY = "";

            //색상코드가 #으로 시작되지 않는경우.
            if(_sColorList.color.startsWith("#") === false){
                //#을 추가 처리.
                _sColorList.color = "#" + _sColorList.color;
            }

            //색상코드가 #을 포함하여 7자리가 넘는는경우.(opacity값이 포함된경우.)
            if(_sColorList.color.length > 7){
                //opacity에 해당하는 값만 따로 발췌.
                _sColorList.COLOR_OPACITY = _sColorList.color.substr(7);

                _sColorList.color = _sColorList.color.substr(0, 7);

            }

            oContr.oModel.oData.T_COLORS.push(_sColorList);

            
        }

    };


    /************************************************************************
     * -- editor의 테마 데이터 구성.
     ************************************************************************/
    oContr.fn.setEditorThemeData = function(){

        if(oContr.oModel.oData.T_RULES.length === 0){
            return;
        }

        if(oContr.oModel.oData.T_COLORS.length === 0){
            return;
        }


        //현재 선택한 테마의 라인 정보 얻기.
        let _sThemeInfo = oContr.oModel.oData.T_THEME.find( item => item.KEY === oContr.oModel.oData.S_THEME.NAME );

        if(typeof _sThemeInfo === "undefined"){
            return;
        }

        let _sTheme = {};

        _sTheme.base = _sThemeInfo.base;
        _sTheme.inherit = _sThemeInfo.inherit;

        _sTheme.rules = [];
        _sTheme.colors = {};


        //editor rules 정보 구성.
        for (let i = 0, l = oContr.oModel.oData.T_RULES.length; i < l; i++) {
            
            let _sRules = oContr.oModel.oData.T_RULES[i];

            let _sRuleList = {};

            _sRuleList.token = _sRules.token;

            //foreground 색상을 선택한 경우.
            if(typeof _sRules.FGROUND_COLOR !== "undefined"){
                _sRuleList.foreground = _sRules.FGROUND_COLOR + _sRules.FGROUND_OPACITY;

                //#제거.
                _sRuleList.foreground = _sRuleList.foreground.replace(/#/, "");
            }

            //background 색상을 선택한 경우.
            if(typeof _sRules.BGROUND_COLOR !== "undefined"){
                _sRuleList.background = _sRules.BGROUND_COLOR + _sRules.BGROUND_OPACITY;

                //#제거.
                _sRuleList.background = _sRuleList.background.replace(/#/, "");

            }
            
            let _sFontStyle = oContr.oModel.oData.T_FONT_STYLE.find( item => item.KEY === _sRules.fontStyle );
            
            if(typeof _sFontStyle !== "undefined"){

                //font style 구성 정보 매핑.
                _sRuleList.fontStyle = _sFontStyle.TEXT;

            }
            
            _sTheme.rules.push(_sRuleList);
            
        }


        //editor 색상 정보 구성.
        for (let i = 0, l = oContr.oModel.oData.T_COLORS.length; i < l; i++) {

            let _sColor = oContr.oModel.oData.T_COLORS[i];

            _sTheme.colors[_sColor.token] = _sColor.color + _sColor.COLOR_OPACITY;

        }


        return _sTheme;
        

    };


    /************************************************************************
     * -- 색상 선택 팝업 호출.
     ************************************************************************/
    oContr.fn.callColorPopup = function(oUi, color){

        return new Promise(async function(resolve){

            jQuery.sap.require('sap.ui.unified.ColorPickerPopover');

            let _oPopup = new sap.ui.unified.ColorPickerPopover({
                colorString : color,
                change:function(oEvent){
                    
                    resolve(oEvent.getParameter("hex"));

                    _oPopup.destroy();

                }
            });

            _oPopup._oPopover.attachAfterClose(function(){
                resolve();
                _oPopup.destroy();
            });

            _oPopup.openBy(oUi);

        });

    };

    
    /************************************************************************
     * -- 에디터 테마 변경 처리.
     ************************************************************************/
    oContr.fn.changeEditorTheme = function(){

        //테마 데이터 구성 처리.
        let _sData = oContr.fn.setThemeData();
        
        _sData.actcd = "changeTheme";

        //editor의 테마 데이터 구성. 
        _sData.themeData = oContr.fn.setEditorThemeData();

        let _oEditor = document.body.querySelector(".EDITOR_FRAME1") || undefined;

        _oEditor.contentWindow.postMessage(_sData);


    };


    /************************************************************************
     * -- 테마 데이터 구성 처리.
     ************************************************************************/
    oContr.fn.setThemeData = function(){
        
        let _sData = {};
                
        let _sTheme = oContr.oModel.oData.T_THEME.find( item => item.KEY === oContr.oModel.oData.S_THEME.NAME );

        if(typeof _sTheme === "undefined"){
            return;
        }

        _sData.themeName = _sTheme.TEXT;

        //영여, 숫자 - 이외의 문자 제거 처리.
        _sData.themeName = _sData.themeName.replace(/[^a-z0-9\-]/gi, "");


        //editor의 테마 데이터 구성. 
        _sData.themeData = oContr.fn.setEditorThemeData();

        return _sData;

    };




/********************************************************************
 *💨 EXPORT
 *********************************************************************/
 export { oContr };