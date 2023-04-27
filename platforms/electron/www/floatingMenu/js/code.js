// ★★★★★★★★★★★★★★★★★★ 전역 변수 선언 ★★★★★★★★★★★★★★★★★★
let oAPP,
    GO_UI = {},
    GO_FN = {},
    GO_DATA = {},
    GO_INFO = {};
    
    GO_DATA.DELETEDATA = [];
    GO_INFO.DELETE = false;
    GO_INFO.SPATH = '';
    oSettingInfo = parent.WSUTIL.getWsSettingsInfo();

// var xmlPath = "C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor";
var xmlPath = oSettingInfo.SAP.abapEditorRoot;

oAPP = parent.parent.gfn_parent();

jQuery.sap.require("sap.m.MessageBox");

createUi();

// ★★★★★★★★★★★★★★★★★★ 펑션 ★★★★★★★★★★★★★★★★★★
// 데이터 체크하기
// => 너는 데이터만 가지고와서 정상적으로 있는지만 판단해
GO_FN.REFRESH_HEAD = (oUPDLG) => {

    // 현재는 하드코딩 추 후 수정
    let data = oAPP.fs.readFileSync(xmlPath + "\\abap_user.xml" , 'utf8');
    let json = JSON.parse(oAPP.convert.xml2json(data));

    GO_INFO.XMLVS = json.declaration.attributes.version;

    let eleDom = json.elements.filter(a => a.type === "element" && a.elements !== undefined)[0];

    if (eleDom) {

        let expDom = eleDom.elements.filter(a => a.name === "EXPANDS")[0];

        if (expDom !== undefined) {
            debugger;
            let expChDom = expDom.elements.filter(a => a.name === "Expand");
            let desDom = expDom.elements.filter(a => a.name === "Descr")[0];
            let txtDom = expDom.elements.filter(a => a.name === "Text")[0];

            if (expChDom && desDom === undefined && txtDom === undefined) {

                GO_FN.GET_DATA(expChDom, oUPDLG);

            };

            return;

        };

        return;

    } else {

        return;

    };

};


// 데이터 분리하기RIGHTBARDATA
// => 너는 데이터를 영역에 맞게 나누기만 해
GO_FN.GET_DATA = (o_xmlNodes, o_busyDialog) => {

    // 좌측 리스트를 구성하기 위한 ARRAY 전역 변수
    GO_DATA.KEYWORDDATA = [];
    // 우측 영역을 구성하기 위한 전역 변수
    GO_DATA.ACTIVEDATA;

    for(var i = 0; i < o_xmlNodes.length; i++) {

        let o_xmlNode = o_xmlNodes[i],
            o_nodeKey = o_xmlNode.attributes.key,
            o_nodeCont = o_xmlNode.elements.find(a => a.name === 'Descr'),
            o_nodeTitle = o_xmlNode.elements.find(a => a.name === 'Text'),
            o_cont = '',
            o_title = '';

            if(o_nodeCont.elements !== undefined) {

                o_cont = o_nodeCont.elements.find(a => a.text).text;
        
            }; 
                
            if(o_nodeTitle.elements !== undefined) {
        
                o_title = o_nodeTitle.elements.find(a => a.text).text;
        
            };

        // 좌측 리스트 구성할 기본 데이터 틀
        let S_HEAD = {

            KEY: o_nodeKey,
            ORGKEY: o_nodeKey,
            EDIT: false,
            SELECT: false,
            ICON:'sap-icon://edit',
            VISIBLE: true,
            VISIBLE2: false,
            S_ITEM: {
                CONTENT: o_cont,
                TITLE: o_title
            },
            FN: function(){
                // KEY => 좌측 리스트의 텍스트 ==> 인풋 입력 시 변경
                // ORGKEY => 저장 하지 않을 때 원복하기 위해 필요한 원본 데이터
                // EDIT => 활성화 여부
                // ICON => 클릭 시 변경되는 수정 버튼
                // VISIBLE => 텍스트 UI에 대한 VISIBLE 값
                // VISIBLE2 => 인풋 UI에 대한 VISIBLE 값
                // S_ITEM => 해당 해더의 자식인 디스크립션과 텍스트
            }

        };

        GO_DATA.KEYWORDDATA[i] = S_HEAD;

    };

    // 좌측 리스트 오름차순 정렬
    GO_DATA.KEYWORDDATA = GO_DATA.KEYWORDDATA.sort((a, b) => a.KEY > b.KEY ? 1 : -1);

    // 바 영역의 상태 텍스트 데이터 틀
    let activeTxt = {
        ICON: 'sap-icon://document',
        KEY: '',
        ACTIVE: 'DISPLAY',
        VISIBLE: false,
        S_ITEM: {
            CONTENT: "",
            TITLE: "",
            VISIBLE: false
        }
    };

    GO_DATA.ACTIVEDATA = activeTxt;

    GO_FN.COPY(GO_DATA.KEYWORDDATA, GO_DATA.ACTIVEDATA);

    // let s_jsonDataCp = JSON.stringify(expChDom),
    // o_jsonDataCp = JSON.parse(s_jsonDataCp);

    GO_FN.DATASETTING(o_busyDialog);

};


// 기존 데이터 COPY
GO_FN.COPY = () => {

};


// 데이터 세팅
// => 넌 세팅만 해
GO_FN.DATASETTING = (oUPDLG) => {

    let oLPageModel = new sap.ui.model.json.JSONModel();

    oLPageModel.setData({

        l_listData: GO_DATA.KEYWORDDATA,
        r_activeData: GO_DATA.ACTIVEDATA

    });

    GO_UI.PAGE.setModel(oLPageModel);

    setTimeout(() => {

        if(oUPDLG !== undefined) {
    
            oUPDLG.close();
            GO_FN.UPDATE_AFTER();
    
        };

    },1000);

};


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// SAP 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// 데이터 업데이트 이후 펑션
GO_FN.UPDATE_AFTER = () => {

};

// sap => 데이터 변경
GO_FN.WATCH_DATA = () => {
  
    let i_lineIdx = GO_UI.UITABLE.getSelectedIndex(),
        o_rPageData = GO_DATA.ACTIVEDATA;

    if(i_lineIdx === -1) {return;};

    console.log(i_lineIdx);

    let selectProp = GO_DATA.KEYWORDDATA[i_lineIdx];

    o_rPageData.S_ITEM.CONTENT = selectProp.S_ITEM.CONTENT;
    o_rPageData.S_ITEM.TITLE = selectProp.S_ITEM.TITLE;

    // 데이터 업데이트 전 편집 상태인 리스트가 있었다면
    if(GO_INFO.SAVE_EDITDATA) {

      let o_selLine = GO_DATA.KEYWORDDATA.find(a => a.KEY === GO_INFO.SAVE_EDITDATA.KEY);

      // 키 값이 같은 리스트가 있을 때
      if(o_selLine !== undefined) {

        GO_FN.ACTIVE(o_selLine);

        GO_INFO.SAVE_EDITDATA = null;

        return;
      };

      GO_UI.UITABLE.setSelectedIndex(-1);

      return;

    } else {

      o_rPageData.KEY = GO_INFO.SAVE_EDITDATA.KEY;
      o_rPageData.VISIBLE = true;
      o_rPageData.ACTIVE = "Display";
      o_rPageData.S_ITEM.VISIBLE = false;
      o_rPageData.S_ITEM.CONTENT = selectProp.S_ITEM.CONTENT;
      o_rPageData.S_ITEM.TITLE = selectProp.S_ITEM.TITLE;

      GO_UI.UITABLE.getModel().refresh();

    };

};


// sap => 활성화가 있는지
// GO_FN.EDIT_CHECK = () => {

//     if(GO_DATA.HISTORYEDIT === undefined) {return;};

//     let editProp = GO_DATA.KEYWORDDATA.find(a => a.KEY === GO_DATA.HISTORYEDIT.KEY);
    
// };

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// SAP 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// 좌측 리스트 클릭
GO_FN.CLICK_LIST = (e, ACTCD) => {

    let PROP;

    // 클릭 라인 활성화 정보 => 결과 값 true or false
    if(GO_FN.CHECK_LINE(e, ACTCD)) {

        return;
    };

    if(ACTCD === "D") {
      let o_rowCtxt = e.getParameter('rowContext'),
          o_rowProp = o_rowCtxt.getProperty();

          PROP = o_rowProp;
    } else {
      let o_rowActItem = e.getSource(), // edit button
          o_rowActItemCtxt = o_rowActItem.getBindingContext(),
          o_rowActItemProp = o_rowActItemCtxt.getProperty();

          PROP = o_rowActItemProp;
    };

    // 선택한 라인 아이템
    GO_FN.SELECT_ITEM_LINE(ACTCD, PROP);

};


// 클릭한 라인 활성화 정보
GO_FN.CHECK_LINE = (e, ACTCD) => {

    let i_lineIdx = GO_UI.UITABLE.getSelectedIndex(),
        o_editLine = GO_DATA.KEYWORDDATA.find(a => a.EDIT === true),
        result = false;

        if(ACTCD === "D") {

          result = GO_FN.CLICK_ROW(o_editLine, i_lineIdx, e);

        } else {

          let o_rowActItem = e.getSource(), // edit button
              o_rowActItemCtxt = o_rowActItem.getBindingContext(),
              o_rowActItemProp = o_rowActItemCtxt.getProperty();
                
              result = GO_FN.CLICK_EDITBTN(o_editLine, o_rowActItemProp);

              o_rowActItem.getModel().setProperty('', o_rowActItemProp, o_rowActItemCtxt);

        };

    return result;


};


// row 클릭
GO_FN.CLICK_ROW = (o_editLine, i_lineIdx, e) => {

    let o_rowCtxt = e.getParameter('rowContext'),
        o_rowSpath = o_rowCtxt.sPath;

        // 셀렉트 라인 없거나 편집중인 리스트가 있을 때
        if(GO_INFO.SPATH === o_rowSpath || Boolean(o_editLine) === true) {
            GO_UI.UITABLE.setSelectedIndex(GO_INFO.SELECT_IDX);
        
            return true;
        };

        GO_INFO.SPATH = o_rowSpath;
      
        return false;

};


// 버튼 클릭
GO_FN.CLICK_EDITBTN = (o_editLine, o_rowActItemProp) => {

    if(!Boolean(o_editLine)){
        return false;
    };

    GO_FN.CHECK_LISTKEY(o_editLine, o_rowActItemProp);

    // 우측 선택 라인 데이터 삽입
    GO_FN.SET_ITEMDATA(o_rowActItemProp);

    return true;

};


// 변경된 키 값 체크
GO_FN.CHECK_LISTKEY = (o_editLine, o_rowActItemProp) => {

    if(o_editLine === undefined){
        return;
    };

    if(o_editLine.KEY === '') {

      GO_FN.MSG_POPUP("E", "Name은 필수 값 입니다.", (ACT) => {});

      return;
    };

    // 변경된 값이 없으면
    if(o_editLine.KEY === o_rowActItemProp.ORGKEY) {

        // 선택 리스트 비활성화
        GO_FN.INACTIVE(o_editLine);

        return;
    };

    // 변경된 값이 있으면
    GO_FN.MSG_POPUP("C", "작업한 내용이 저장되지 않습니다.", (ACT) => {
                    
        if(ACT !== "OK") {return;};

        if(o_editLine.ORGKEY !== o_rowActItemProp.ORGKEY) {

          // 저장하지 않은 신규 리스트 삭제
          if(o_editLine.ORGKEY === '') {

            GO_DATA.KEYWORDDATA.shift();
                  
          };

          // 선택 리스트의 키 값 원복
          o_editLine.KEY = o_editLine.ORGKEY;

          GO_FN.INACTIVE(o_editLine);

          GO_FN.LINE_SELECT(o_rowActItemProp);

          GO_FN.ACTIVE(o_rowActItemProp);

        } else {

          // 선택 리스트의 키 값 원복
          o_editLine.KEY = o_editLine.ORGKEY;

          GO_FN.INACTIVE(o_editLine);

        };

        GO_UI.UITABLE.getModel().refresh();

    });

};


// 선택한 라인 아이템
GO_FN.SELECT_ITEM_LINE = (ACTCD, PROP) => {

    if(PROP === undefined) {
        console.log('PROP이 없어');
        return;
    } else if (ACTCD === undefined) {
        console.log('ACTCD가 없어');
        return;
    };

    // [수정] 셀렉트 정보
    GO_FN.LINE_SELECT(PROP);

    GO_FN.SET_ITEMDATA(PROP);

    if(ACTCD === "D") {
      // 선택 리스트 및 우측 영역 비활성화
      GO_FN.INACTIVE(PROP);
    } else {
      // 선택 리스트 및 우측 영역 활성화
      GO_FN.ACTIVE(PROP);
    };

    GO_UI.UITABLE.getModel().refresh();

};


// 선택 라인 셀렉트
GO_FN.LINE_SELECT = (PROP) => {

    // 결과 값 => index
    let i_lineIdx = GO_DATA.KEYWORDDATA.findIndex(a => a.KEY === PROP.KEY);

    GO_UI.UITABLE.setSelectedIndex(i_lineIdx);

    PROP.SELECT = true;

};


// 우측 영역 데이터 삽입
GO_FN.SET_ITEMDATA = (o_rowActItemProp) => {

    // 클릭한 좌측 리스트
    let o_selLine = GO_DATA.KEYWORDDATA.find(a => a.KEY === o_rowActItemProp.KEY),
        o_rPage = GO_UI.RPAGE,
        o_rPageCtxt = o_rPage.getBindingContext(),
        o_rPageProp = o_rPageCtxt.getProperty();
    
        o_rPageProp.S_ITEM.CONTENT = o_selLine.S_ITEM.CONTENT;
        o_rPageProp.S_ITEM.TITLE = o_selLine.S_ITEM.TITLE;

};


// 선택 리스트 활성화
GO_FN.ACTIVE = (PROP) => {

    // 우측 인풋 & 코드에디터 활성화
    let o_rPageData = GO_DATA.ACTIVEDATA,
        i_lineIdx = GO_UI.UITABLE.getSelectedIndex(),
        o_saveBtn = sap.ui.getCore().byId('saveBtn');

        if(PROP.ORGKEY !== '') {

          PROP.EDIT = true;
          PROP.VISIBLE = false;
          PROP.VISIBLE2 = true;
          PROP.ICON = 'sap-icon://decline';

          o_rPageData.KEY = PROP.KEY;
          o_rPageData.VISIBLE = true;
          o_rPageData.ACTIVE = "Edit";
          o_rPageData.S_ITEM.VISIBLE = true;

          GO_INFO.SELECT_IDX = i_lineIdx;

        } else {
          o_rPageData.KEY = '';
          o_rPageData.ICON = 'sap-icon://add-document';
          o_rPageData.VISIBLE = true;
          o_rPageData.ACTIVE = "Edit";
          o_rPageData.S_ITEM.VISIBLE = true;

          GO_INFO.SELECT_IDX = 0;

        }

        o_saveBtn.setVisible(true);

        GO_UI.UITABLE.getModel().refresh();

};


// 선택 리스트 비활성화
GO_FN.INACTIVE = (o_editLine) => {

    // 우측 인풋 & 코드 에디터 비활성화
    let o_rPageData = GO_DATA.ACTIVEDATA,
        i_lineIdx = GO_UI.UITABLE.getSelectedIndex(),
        o_saveBtn = sap.ui.getCore().byId('saveBtn');

        o_editLine.EDIT = false;
        o_editLine.VISIBLE = true;
        o_editLine.VISIBLE2 = false;
        o_editLine.ICON = 'sap-icon://edit';

        o_rPageData.KEY = o_editLine.KEY;
        o_rPageData.VISIBLE = true;
        o_rPageData.ACTIVE = "Display";
        o_rPageData.S_ITEM.VISIBLE = false;

        GO_INFO.SELECT_IDX = i_lineIdx;

        o_saveBtn.setVisible(false);

        GO_UI.UITABLE.getModel().refresh();

};


// 삭제 버튼 클릭
GO_FN.CLICK_DELETEBTN = (e) => {

    let o_rowActItem = e.getSource(), // delete button
        o_rowActItemCtxt = o_rowActItem.getBindingContext(),
        o_rowActItemProp = o_rowActItemCtxt.getProperty(),
        a_lListData = GO_DATA.KEYWORDDATA,
        i_lineIdx = a_lListData.findIndex(a => a.KEY === o_rowActItemProp.ORGKEY);

        GO_FN.MSG_POPUP("C", "정말 삭제하시겠습니까?.", (ACT) => {
                    
          if(ACT !== "OK") {return;};
  
          GO_FN.REMOVE_LIST(o_rowActItemProp, i_lineIdx, a_lListData);
  
          GO_UI.UITABLE.getModel().refresh();
  
      });
};


// 해당 리스트 제거
GO_FN.REMOVE_LIST = (o_rowActItemProp, i_lineIdx, a_lListData) => {

    if(o_rowActItemProp === undefined) { return; };

    let o_rPageData = GO_DATA.ACTIVEDATA,
        i_selLineIdx = GO_UI.UITABLE.getSelectedIndex();

    // 삭제 할 리스트가 편집 중이라면
    if(o_rowActItemProp.EDIT === true || i_selLineIdx === i_lineIdx) {

      a_lListData.splice(i_lineIdx, 1);

      
      o_rPageData.VISIBLE = false;
      o_rPageData.S_ITEM.CONTENT = "";
      o_rPageData.S_ITEM.TITLE = "";
      o_rPageData.S_ITEM.VISIBLE = false;
      
      // GO_INFO.DELETE = true;
      
      GO_INFO.SELECT_IDX = -1;
      GO_UI.UITABLE.setSelectedIndex(-1);

      return;

    };

    a_lListData.splice(i_lineIdx, 1);

    GO_INFO.SELECT_IDX = i_selLineIdx;
    GO_UI.UITABLE.setSelectedIndex(i_selLineIdx);

};


// 추가 버튼 클릭
GO_FN.CLICK_ADDBTN = (e) => {

    let a_lListData = GO_DATA.KEYWORDDATA,
        o_editLine = a_lListData.find(a => a.EDIT === true);

        if(Boolean(o_editLine) === true) {

          GO_FN.MSG_POPUP("A", "수정 중에는 추가할 수 없습니다.", (ACT) => {});

          return;
        };

        GO_FN.CREATE_NEWLIST(a_lListData);

};


// 신규 리스트 생성
GO_FN.CREATE_NEWLIST = (a_lListData) => {

    let o_rPage = GO_UI.RPAGE,
        o_rPageCtxt = o_rPage.getBindingContext(),
        o_rPageProp = o_rPageCtxt.getProperty();

    let S_HEAD = {

          KEY: '',
          ORGKEY: '',
          EDIT: true,
          ICON: 'sap-icon://decline',
          VISIBLE: false,
          VISIBLE2: true,
          S_ITEM: {
              CONTENT: '',
              TITLE: ''
          }
  
      };

      a_lListData.unshift(S_HEAD);

      o_rPageProp.S_ITEM.CONTENT = '';
      o_rPageProp.S_ITEM.TITLE = '';

      GO_FN.ACTIVE(S_HEAD);

      o_rPage.getModel().setProperty('', o_rPageProp, o_rPageCtxt);

      GO_UI.UITABLE.setSelectedIndex(0);
      GO_UI.UITABLE.setFirstVisibleRow(0);

};


// 저장 버튼 클릭
GO_FN.CLICK_SAVEBTN = (e) => {

  let a_lListData = GO_DATA.KEYWORDDATA,
      o_rPageData = GO_DATA.ACTIVEDATA,
      o_editLine = a_lListData.find(a => a.EDIT === true),
      o_emptyKey = a_lListData.find(a => a.KEY === '');

      // 텍스트 저장
      o_editLine.S_ITEM.CONTENT = o_rPageData.S_ITEM.CONTENT;
      o_editLine.S_ITEM.TITLE = o_rPageData.S_ITEM.TITLE;

      // name 필수 값 체크
      if(Boolean(o_emptyKey) === true) {

        GO_FN.MSG_POPUP("E", "Name은 필수 값 입니다.", (ACT) => {});

        return;
      };

      GO_INFO.SAVE_EDITDATA = o_editLine;

      GO_FN.SAVE_DATA(a_lListData);

};


// 데이터 저장
GO_FN.SAVE_DATA = (a_lListData) => {

  let nXML = `<?xml version="${GO_INFO.XMLVS}"?>\n`;
    nXML += '<?xml-stylesheet type="text/xsl" href="lang_user.xslt"?>\n';
    nXML += '<XMLConfigSettings>\n';
    nXML += '  <FILEINFO>\n';
    nXML += '      <Author>SAP</Author>\n      <Type>LangUser</Type>\n     <Language>ABAP</Language>\n     <Desc>User specific settings for ABAP</Desc>\n';
    nXML += '  </FILEINFO>\n';
    nXML += '  <EXPANDS>\n';

    for (var i = 0; i < a_lListData.length; i++) {
        nXML += `      <Expand key="${a_lListData[i].KEY}">\n`;
        nXML += `          <Descr>${a_lListData[i].S_ITEM.CONTENT}</Descr>\n`;
        nXML += `          <Text>${a_lListData[i].S_ITEM.TITLE}</Text>\n`;
        nXML += '      </Expand>\n';
    };

    nXML += '  </EXPANDS>\n';
    nXML += '</XMLConfigSettings>\n';

    oAPP.fs.writeFileSync(xmlPath + "\\abap_user.xml", nXML);

    sap.m.MessageToast.show('저장 되었습니다', {
      duration: 1500,
      animationDuration: 1500,
      at: sap.ui.core.Popup.Dock.CenterCenter
  });

  // xml = oAPP.convert.json2xml(json, {compact: true, spaces: 4});

};

// ************************************************************


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 팝업 관련 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// 메세지 팝업
/*
    TYPE => E: ERROR C: CONFIRM S: SAVE
    MTXT => 팝업에 들어갈 내용
    CALLBACK => 콜백 펑션
*/
GO_FN.MSG_POPUP = (TYPE, MTXT, CALLBACK) => {

    let o_msgIcon = '',
        T_msgAct = [],
        PRAM;

    switch (TYPE) {
        case "E": // name 필수 팝업

            o_msgIcon = sap.m.MessageBox.Icon.ERROR;
            T_msgAct.push(sap.m.MessageBox.Action.CLOSE);

            break;

        case "C": // 저장 안됨 팝업

            o_msgIcon = sap.m.MessageBox.Icon.WARNING;
            T_msgAct.push(sap.m.MessageBox.Action.OK);
            T_msgAct.push(sap.m.MessageBox.Action.NO);

            break;

        case "A":

            o_msgIcon = sap.m.MessageBox.Icon.WARNING;
            T_msgAct.push(sap.m.MessageBox.Action.CLOSE);

            break;

    };
    // MTXT => 팝업 상태 글
    sap.m.MessageBox.show(MTXT, {
        icon: o_msgIcon,
        actions: T_msgAct,
        onClose: (ACT) => {
        
            CALLBACK(ACT)
            
        },
    });

};


// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 팝업 관련 끝 ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


// RowActionItem 스타일 클래스 추가
GO_FN.UITABLE_HOOKUITILS = (oEvent) => {

    if(oEvent !== "StartTableUpdate") {

        // debugger;
    }

};


// ★★★★★★★★★★★★★★★★★★ UI 생성 이후 실행 ★★★★★★★★★★★★★★★★★★
function fn_UIUPdated() {

    sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

    GO_FN.REFRESH_HEAD();

    // let watchPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\SAP\\SAP GUI\\ABAP Editor';

    oAPP.WATCH = oAPP.fs.watch(xmlPath, { "recursive":true } ,async (a,b)=>{
       
        // 받아온 파라미터 값 중 b의 값이 'abap_user.xml' 아니라면 리턴
        if(b !== 'abap_user.xml'){return;};

        // 해당 경로에 abap_user.xml 파일이 있는지 체크
        let oFileFind = oAPP.fs.existsSync(`${xmlPath}\\abap_user.xml`);

        // [수정]없다면?
        if(oFileFind !== true) {

            GO_UI.PAGE.setBusy(true);

            return;
        };

        let oUPDLG = new sap.m.BusyDialog({
            text:'정보 업데이트 중...',
            customIconRotationSpeed: 1000
        });

        oUPDLG.open();

        GO_INFO.HISTORY_EDIT = GO_DATA.KEYWORDDATA.find(a => a.EDIT === true);

        GO_INFO.HISTORY_IDX = GO_UI.UITABLE.getSelectedIndex();

        GO_FN.REFRESH_HEAD(oUPDLG);
    
    }); 

    GO_UI.RPAGE.bindElement('/r_activeData');

    GO_UI.RCODEEDITOR.addEventDelegate({

        // onAfterRendering: function(e) {
        //     GO_FN.CODEEDITZOOM();
        // }

    });


    GO_UI.PAGE.setBusy(false);

}; // fn_UIUPdated end


        //table에 hook 이벤트 추가. 
        sap.ui.table.utils._HookUtils.register(GO_UI.UITABLE,  

            sap.ui.table.utils._HookUtils.Keys.Signal, function(oEvent){ 
          
                GO_FN.UITABLE_HOOKUITILS(oEvent);
              //콜백 펑션 
          
        }); 


// ★★★★★★★★★★★★★★★★★★ ui 생성 ★★★★★★★★★★★★★★★★★★
function createUi() {

    // UI가 다 생성이 되고나면 fn_UIUPdated를 실행
    sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);


    // 1. APP 생성
    GO_UI.APP = new sap.m.App().addStyleClass('codeTempNoScrolling');


    // 2. PAGE 생성
    GO_UI.PAGE = new sap.m.Page({
        busy: true,
        busyIndicatorDelay: 0,
        showHeader: false

    });


    // 3. SPLITTER 생성
    GO_UI.SPLITTER = new sap.ui.layout.Splitter();


    // 4. NAME LIST PAGE 생성
    GO_UI.LPAGE = new sap.m.Page({
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            size: '300px',
            minSize: 200
        })

    }).addStyleClass('listPage');


    // 4_1. LIST PAGE BAR 생성
    GO_UI.LHBAR = new sap.m.Bar();


    // 4_2. LIST PAGE BAR 추가 버튼 생성
    GO_UI.LADDBTN = new sap.m.Button({
        icon: "sap-icon://add",
        type: sap.m.ButtonType.Emphasized,
        press: function(e) {
          GO_FN.CLICK_ADDBTN(e);
        }
    });


    // 4_3. LIST PAGE UI TABLE 생성
    GO_UI.UITABLE = new sap.ui.table.Table({
        extension: [
            GO_UI.LHBAR
        ],
        columns: new sap.ui.table.Column({
            width: '100%',
            minWidth: 80,
            label: new sap.m.Label({
                text: 'Name'
            }),
            sorted: true,
            template: new sap.m.HBox({
                items: [
                    new sap.m.Text({
                        text: '{KEY}',
                        visible: '{VISIBLE}'
                    }),
                    new sap.m.Input({
                        value: '{KEY}',
                        visible: '{VISIBLE2}',
                    })
                ]
            })
        }),
        rows: {
            path: '/l_listData',
        },
        rowActionTemplate: new sap.ui.table.RowAction({
            items: [
                new sap.ui.table.RowActionItem({
                    icon: "{ICON}",
                    type: sap.ui.table.RowActionType.Custom,
                    press: function(e) {
                        GO_FN.CLICK_LIST(e , 'U');
                    }
                }),
                new sap.ui.table.RowActionItem({
                    icon: "sap-icon://delete",
                    type: sap.ui.table.RowActionType.Delete,
                    press: function(e) {
                      GO_FN.CLICK_DELETEBTN(e);
                    }
                })
            ]
        }).addStyleClass('actionBtn'),
        rowSelectionChange: function(e) {
            GO_FN.CLICK_LIST(e, 'D');
        },
        rowHeight: 50,
        rowActionCount: 2,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.Row,
        visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
        minAutoRowCount: 1
    });


    // 4_4. LIST PAGE ROWACTIONTEMPLATE 생성
    GO_UI.ROWACTION = new sap.ui.table.RowAction();


    // 5. DESCRIPTION & TEXT PAGE 생성
    GO_UI.RPAGE = new sap.m.Page({
        showHeader: false,
        layoutData: new sap.ui.layout.SplitterLayoutData({
            minSize: 250
        })
    });


    // 5_1. DESCRIPTION & TEXT PAGE BAR 생성
    GO_UI.RHBAR = new sap.m.Bar({
        contentRight: new sap.m.Button('saveBtn',{
            icon: 'sap-icon://save',
            type: sap.m.ButtonType.Emphasized,
            visible: false,
            press: function(e) {
                GO_FN.CLICK_SAVEBTN(e);
            }
        })
    });


    // 5_2. DESCRIPTION & TEXT PAGE BAR LEFT CONTENT 생성
    GO_UI.SELDESC = new sap.m.HBox({
        width: '200px',
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        items: [
            new sap.ui.core.Icon({
                src: '{ICON}'
            }).addStyleClass('sapUiTinyMarginEnd'),
            new sap.m.Title({
                level: sap.ui.core.TitleLevel.H1,
                text: '{KEY}'
            }).addStyleClass('sapUiSmallMarginEnd'),
            new sap.m.Title({
                level: sap.ui.core.TitleLevel.H1,
                text: '{ACTIVE}'
            })
        ],
        visible: '{VISIBLE}'
    });


    // 5_3. DESCRIPTION & TEXT PAGE VBOX 생성
    GO_UI.RVBOX = new sap.m.VBox({
        renderType: sap.m.FlexRendertype.Bare,
        height: 'calc(100% - 50px)'
    });


    // 5_4. DESCRIPTION & TEXT PAGE HBOX 생성
    GO_UI.RHBOX = new sap.m.HBox({
        renderType: sap.m.FlexRendertype.Bare,
        alignItems: sap.m.FlexAlignItems.Center,
        height: "50px"
    });


    // 5_5. DESCRIPTION & TEXT PAGE HBOX LABEL 생성
    GO_UI.RHLABEL = new sap.m.Label({
        text: 'Description',
        width: '100px'
    });


    // 5_6. DESCRIPTION & TEXT PAGE HBOX INPUT 생성
    GO_UI.RHINPUT = new sap.m.Input({
        editable: "{/r_activeData/S_ITEM/VISIBLE}",
        value: "{/r_activeData/S_ITEM/CONTENT}",
        // change: function(e) {
        //     GO_FN.DESCINPUTCHANGE(e);
        // }
    });


    // 5_6. DESCRIPTION & TEXT PAGE CODEEDITOR 생성
    GO_UI.RCODEEDITOR = new sap.ui.codeeditor.CodeEditor({
        type: "abap",
        height: '100%',
        editable: "{/r_activeData/S_ITEM/VISIBLE}",
        value: "{/r_activeData/S_ITEM/TITLE}",
        // change: function(e) {
        //     GO_FN.CODEEDITORCHANGE(e);
        // }
    }).attachBrowserEvent('wheel', function(e) {
        let codDom = GO_UI.RCODEEDITOR.getDomRef();

        if (e.ctrlKey === true) {
            if (e.originalEvent.deltaY > 0) {
                if (codDom.style.zoom === '1') {
                    return;
                }
                codDom.style.zoom = (zoom -= ZOOM_SPEED);
            } else {
                codDom.style.zoom = (zoom += ZOOM_SPEED);
            }

            GLV_ZOOM = codDom.style.zoom;
            return;
        };
    });

    GO_UI.LHBAR.addContentLeft(GO_UI.LADDBTN);
    // GO_UI.LPAGE.addContent(GO_UI.LHBAR).addContent(GO_UI.UITABLE);
    GO_UI.LPAGE.addContent(GO_UI.UITABLE);
    GO_UI.RHBOX.addItem(GO_UI.RHLABEL).addItem(GO_UI.RHINPUT);
    GO_UI.RVBOX.addItem(GO_UI.RHBOX).addItem(GO_UI.RCODEEDITOR);
    GO_UI.RHBAR.addContentLeft(GO_UI.SELDESC);
    GO_UI.RPAGE.addContent(GO_UI.RHBAR).addContent(GO_UI.RVBOX);
    GO_UI.SPLITTER.addContentArea(GO_UI.LPAGE).addContentArea(GO_UI.RPAGE)
    GO_UI.PAGE.addContent(GO_UI.SPLITTER);
    GO_UI.APP.addPage(GO_UI.PAGE);
    GO_UI.APP.placeAt('content');
}; // createUi end