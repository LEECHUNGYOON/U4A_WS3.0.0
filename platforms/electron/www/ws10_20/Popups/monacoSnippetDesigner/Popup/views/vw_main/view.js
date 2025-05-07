export var oContr = await new Promise(async (resolve)=>{

/************************************************************************
 * 💖 컨트롤러 호출
 ************************************************************************/

    let sControlPath = "./control.js";

    const oRes = await import(sControlPath);
    const oContr = oRes.oContr;


/************************************************************************
 * 💖 화면 그리기
 ************************************************************************/

    let APP = new sap.m.App({
        // busy: true,
        busyIndicatorDelay: 0,
        autoFocus: false,
    });

    APP.addStyleClass("sapUiSizeCompact");

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    var PAGE = new sap.m.Page({
        enableScrolling: false,
        showHeader: false
    });
    APP.addPage(PAGE);

    PAGE.setModel(oContr.oModel);

    PAGE.addStyleClass("uspSnippetCreatorPage sapUiSizeCompact");

    var SPLITTER1 = new sap.ui.layout.Splitter();
    PAGE.addContent(SPLITTER1);

    var PAGE1 = new sap.m.Page({
        showHeader: false
    });
    SPLITTER1.addContentArea(PAGE1);

    oContr.ui.SNIPPET_LIST_PAGE = PAGE1;


    var SPLITTERLAYOUTDATA1 = new sap.ui.layout.SplitterLayoutData({
        size: "400px",
        minSize: 400
    });

    PAGE1.setLayoutData(SPLITTERLAYOUTDATA1);

    var TABLE2 = new sap.m.Table({
        growing: true,
        // autoPopinMode: true,
        growingScrollToLoad: true,
        alternateRowColors: false,
        showOverlay: false,
        mode: "SingleSelectMaster",
        sticky: [
            "ColumnHeaders",
            "HeaderToolbar"
        ],
        // mode: "SingleSelectMaster",
    });

    TABLE2.addEventDelegate({
        ondblclick: function (oEvent) {

            var oTarget = oEvent.target,

                // 클릭한 위치의 Row Dom 정보
                $SelectedRow = $(oTarget).closest(".sapMListTblRow"),

                // 클릭한 위치의 SubRow Dom 정보(popin 시 만들어짐)
                $SelectSubRow = $(oTarget).closest(".sapMListTblSubRow");

            // Row와 SubRow Dom 정보가 없다면 빠져나감 (Row를 더블 클릭한게 아님)
            if (!$SelectedRow.length && !$SelectSubRow.length) {
                return;
            }

            var oRow = $SelectedRow[0],
                oSubRow = $SelectSubRow[0],
                oSelectedRow = sap.ui.getCore().byId(oRow?.id),
                oSelectedSubRow = sap.ui.getCore().byId(oSubRow?.getAttribute("data-sap-ui-related"));

            // Row의 객체가 없다면 빠져나감 (Row를 더블 클릭한게 아님)
            if (!oSelectedRow && !oSelectedSubRow) { 
                return;
            }

            // Row와 SubRow 중 둘 중에 하나라도 객체가 있다면 해당 객체로 Fire 이벤트 수행
            if (oSelectedRow) {
                oSelectedRow.fireDetailPress();
                return;
            }

            if (oSelectedSubRow) { 
                oSelectedSubRow.fireDetailPress();
                return;
            }		

        }
    });

    oContr.ui.SLIPPET_TABLE = TABLE2;

    PAGE1.addContent(TABLE2);

    var COLUMNLISTITEM2 = new sap.m.ColumnListItem({
        type: "Active",
        // type: "DetailAndActive",
        // type: "Navigation",
        // type: "Detail",
        detailPress: function (oEvent) {

            let oSelectItem = oEvent.getSource();

            oContr.fn.onPressDetail(oSelectItem);

        }
    });
    COLUMNLISTITEM2.bindProperty("highlight", {
        parts: [
            // { path: "_isnew" }
            { path: "_isSelectedRow" }
        ],
        formatter: function (bIsSelect) {

            let sHighlight = "None";

            if (bIsSelect === true) {
                sHighlight = "Indication01";
            }

            return sHighlight;

        }
    });


    TABLE2.bindAggregation("items", {
        path: "/T_SNIPPET_LIST",
        template: COLUMNLISTITEM2,
        templateShareable: true
    });

    var TEXT5 = new sap.m.Text({
        text: "{snippet_name}",
        wrapping: false,
    });
    COLUMNLISTITEM2.addCell(TEXT5);

    var TEXT6 = new sap.m.Text({
        wrapping: false,
        text: "{snippet_desc}",
    });
    COLUMNLISTITEM2.addCell(TEXT6);

    var TEXT1 = new sap.m.Text({
        wrapping: false,
        text: "{snippet_langu}",
    });
    COLUMNLISTITEM2.addCell(TEXT1);

    // 상세 버튼
    var BUTTON2 = new sap.m.Button({
        icon: "sap-icon://detail-view",
        // type: "Attention",
        type: "Emphasized",
        press: function (oEvent) {

            let oSelectItem = oEvent.getSource().getParent();

            oContr.fn.onPressDetail(oSelectItem);

        }
    });
    COLUMNLISTITEM2.addCell(BUTTON2);


    var COLUMN3 = new sap.m.Column({
        width: "200px",
        // demandPopin: true,
        // minScreenWidth: "5000px"
    });

    TABLE2.addColumn(COLUMN3);

    var LABEL3 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M363   // 스니펫 이름
    });

    COLUMN3.setHeader(LABEL3);

    var COLUMN4 = new sap.m.Column({
        // minScreenWidth:"5000px",
        demandPopin: true,
        minScreenWidth: "5000px"
        // autoPopinWidth:2
    });

    TABLE2.addColumn(COLUMN4);

    var LABEL4 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M176   // Description
    });

    COLUMN4.setHeader(LABEL4);


    var COLUMN4 = new sap.m.Column({
        // minScreenWidth:"5000px",
        demandPopin: true,
        width: "100px",
        // autoPopinWidth:2
    });

    TABLE2.addColumn(COLUMN4);

    var LABEL1 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M001   // Language
    });

    COLUMN4.setHeader(LABEL1);

    var COLUMN5 = new sap.m.Column({
        demandPopin: true,
        width: "50px",
    });

    TABLE2.addColumn(COLUMN5);

    var LABEL1 = new sap.m.Label({
        design: "Bold",
        text: ""
    });

    COLUMN5.setHeader(LABEL1);



    var OVERFLOWTOOLBAR7 = new sap.m.OverflowToolbar();
    TABLE2.setHeaderToolbar(OVERFLOWTOOLBAR7);

    var ICON1 = new sap.ui.core.Icon({
        src: "sap-icon://group-2",
        size: "20px"
    });

    OVERFLOWTOOLBAR7.addContent(ICON1);

    var TITLE2 = new sap.m.Title({
        text: oContr.msg.M360   // 스니펫 리스트
    });

    OVERFLOWTOOLBAR7.addContent(TITLE2);

    OVERFLOWTOOLBAR7.addContent(new sap.m.ToolbarSpacer());

    var BUTTON1 = new sap.m.Button({
        text: oContr.msg.M361,  // 신규 생성
        icon: "sap-icon://create",
        type: "Emphasized",
        enabled: "{/S_PAGE_HDR_HNDL/newBtn_enable}",
        press: function () {
            oContr.fn.newSnippet();
        }
    });

    OVERFLOWTOOLBAR7.addContent(BUTTON1);


    var BUTTON16 = new sap.m.Button({
        text: oContr.msg.M029,  // Delete
        icon: "sap-icon://delete",
        type: "Reject",
        enabled: "{/S_PAGE_HDR_HNDL/delBtn_enable}",
        press: function () {

            oContr.fn.deleteSnippet();
        }
    });

    OVERFLOWTOOLBAR7.addContent(BUTTON16);


    var NAVCONTAINER1 = new sap.m.NavContainer({ autoFocus: false });
    SPLITTER1.addContentArea(NAVCONTAINER1);

    oContr.ui.NAVCON1 = NAVCONTAINER1;

    /**********************************
     * 📝 메시지 페이지
     **********************************/
    var MSG_PAGE = new sap.m.Page({
        showHeader: false
    });
    NAVCONTAINER1.addPage(MSG_PAGE);

    oContr.ui.MSG_PAGE = MSG_PAGE;


    var VBOX4 = new sap.m.VBox({
        width: "100%",
        height: "100%",
        justifyContent: "Center",
        alignItems: "Center",
    });

    MSG_PAGE.addContent(VBOX4);

    var ILLUSTRATION1 = new sap.m.Illustration({
        set: "sapIllus",
        media: "Dialog",
        type: "NoData"
    });
    VBOX4.addItem(ILLUSTRATION1);

    var TITLE4 = new sap.m.Title({
        titleStyle: "H3",
        text: oContr.msg.M358   // 선택한 항목이 없습니다!
    });
    VBOX4.addItem(TITLE4);

    TITLE4.addStyleClass("sapUiSmallMarginTop");

    var TITLE5 = new sap.m.Title({
        titleStyle: "H5",
        text: oContr.msg.M359   // 스니펫 목록 중, 하나를 선택하세요.
    });
    VBOX4.addItem(TITLE5);

    TITLE5.addStyleClass("sapUiSmallMarginTop");


    var PAGE3 = new sap.m.Page();
    // NAVCONTAINER1.addPage(PAGE3);

    oContr.ui.SNIPPET_PAGE = PAGE3;

    PAGE3.addStyleClass("sapUiContentPadding");


    // SPLITTER1.addContentArea(PAGE3);

    var VBOX1 = new sap.m.VBox({
        height: "100%"
    });

    PAGE3.addContent(VBOX1);

    var VBOX2 = new sap.m.VBox();
    VBOX2.addStyleClass("sapUiSmallMarginBottom");
    VBOX1.addItem(VBOX2);

    var PANEL1 = new sap.m.Panel({
        expandable: true,
        expanded: true
    });
    VBOX2.addItem(PANEL1);

    var TOOLBAR1 = new sap.m.OverflowToolbar();
    PANEL1.setHeaderToolbar(TOOLBAR1);

    var TITLE3 = new sap.m.Title({
        text: oContr.msg.M362   // 스니펫 기본정보
    });
    TOOLBAR1.addContent(TITLE3);

    var FORM1 = new sap.ui.layout.form.Form({
        editable: true
    });

    PANEL1.addContent(FORM1);

    var RESPONSIVEGRIDLAYOUT1 = new sap.ui.layout.form.ResponsiveGridLayout({
        labelSpanM: 12,
        labelSpanL: 12
    });

    FORM1.setLayout(RESPONSIVEGRIDLAYOUT1);

    var FORMCONTAINER1 = new sap.ui.layout.form.FormContainer();
    FORM1.addFormContainer(FORMCONTAINER1);


    /**********************************
     * 📝 Language
     **********************************/
    var FORMELEMENT3 = new sap.ui.layout.form.FormElement();
    FORMCONTAINER1.addFormElement(FORMELEMENT3);

    var LABEL7 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M001,  // Language
        required: true,
    });

    FORMELEMENT3.setLabel(LABEL7);

    var SELECT1 = new sap.m.Select({
        width: "200px",
        selectedKey: "{/S_SNIPPET/snippet_langu}",
        editable: "{/S_SNIPPET/_snippet_langu_edit}",
        valueState: "{/S_SNIPPET/_snippet_langu_vs}",
        valueStateText: "{/S_SNIPPET/_snippet_langu_vst}",
        change: function (oEvent) {
            
            let oUI = oEvent.getSource();

            oContr.fn.onSnippetInfoChange(oUI);

        },
        items: {
            path: "/T_SNIPPET_LANGU_DDLB",
            template: new sap.ui.core.ListItem({
                key: "{key}",
                text: "{key}"
            })
        }
    });
    FORMELEMENT3.addField(SELECT1);

    SELECT1.data("uid", "snippet_langu");

    oContr.ui.SELECT1 = SELECT1;

    /**********************************
     * 📝 Snippet Name
     **********************************/
    var FORMELEMENT1 = new sap.ui.layout.form.FormElement();
    FORMCONTAINER1.addFormElement(FORMELEMENT1);

    var LABEL5 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M363,  // 스니펫 이름
        required: true,
    });

    FORMELEMENT1.setLabel(LABEL5);

    var INPUT1 = new sap.m.Input({
        value: "{/S_SNIPPET/snippet_name}",
        editable: "{/S_SNIPPET/_snippet_name_edit}",
        valueState: "{/S_SNIPPET/_snippet_name_vs}",
        valueStateText: "{/S_SNIPPET/_snippet_name_vst}",
        showClearIcon: true,
        width: "400px",
        change: function (oEvent) {

            let oUI = oEvent.getSource();

            oContr.fn.onSnippetInfoChange(oUI);

        }
    });
    FORMELEMENT1.addField(INPUT1);

    INPUT1.data("uid", "snippet_name");

    oContr.ui.INPUT1 = INPUT1;

    var FORMELEMENT2 = new sap.ui.layout.form.FormElement();
    FORMCONTAINER1.addFormElement(FORMELEMENT2);


    /**********************************
     * 📝 Snippet Description
     **********************************/
    var LABEL6 = new sap.m.Label({
        design: "Bold",
        text: oContr.msg.M176   // Description
    });

    FORMELEMENT2.setLabel(LABEL6);

    var TEXTAREA1 = new sap.m.TextArea({
        width: "100%",
        value: "{/S_SNIPPET/snippet_desc}",
        editable: "{/S_SNIPPET/_snippet_desc_edit}",
        growing: true,
        growingMaxLines: 5,
        maxLength: 200,
        change: function (oEvent) {
            
            let oUI = oEvent.getSource();

            oContr.fn.onSnippetInfoChange(oUI);

        }
    });
    FORMELEMENT2.addField(TEXTAREA1);

    TEXTAREA1.data("uid", "snippet_desc");

    var VBOX3 = new sap.m.VBox({
        height: "100%",
        renderType: "Bare"
    });

    VBOX1.addItem(VBOX3);

    var PAGE4 = new sap.m.Page({
        enableScrolling: false
    });
    VBOX3.addItem(PAGE4);

    PAGE4.addStyleClass("sapUiSizeCompact");

    var FLEXITEMDATA1 = new sap.m.FlexItemData({
        minHeight: "200px"
    });

    PAGE4.setLayoutData(FLEXITEMDATA1);

    var OVERFLOWTOOLBAR4 = new sap.m.OverflowToolbar();
    PAGE4.setCustomHeader(OVERFLOWTOOLBAR4);

    var ICON2 = new sap.ui.core.Icon({
        src: "sap-icon://syntax",
        size: "20px"
    });

    OVERFLOWTOOLBAR4.addContent(ICON2);

    var TITLE1 = new sap.m.Title({
        text: oContr.msg.M364   // 스니펫 코드
    });

    OVERFLOWTOOLBAR4.addContent(TITLE1);

    let sEditorIndexPath = "./monaco/index.html";

    let sFrameHtml1 = `
    <div style="height: 100%">
        <iframe class="MONACO_EDITOR EDITOR_FRAME1" src="${sEditorIndexPath}" onload="oAPP.views.VW_MAIN.fn.onFrameLoadEditor(event);" style="border:none;width:100%;height:100%;">
        </iframe>
    </div>`;

    let HTML1 = new sap.ui.core.HTML({
        content: sFrameHtml1,
        preferDOM: false,
    });

    PAGE4.addContent(HTML1);

    var OVERFLOWTOOLBAR5 = new sap.m.OverflowToolbar();
    PAGE3.setCustomHeader(OVERFLOWTOOLBAR5);

    var BUTTON14 = new sap.m.Button({
        text: oContr.msg.M365,  // 저장호
        type: "Accept",
        icon: "sap-icon://save",
        enabled: "{/S_PAGE_HDR_HNDL/saveBtn_enable}",
        press: function () {
            oContr.fn.saveSnippet();
        }
    });

    OVERFLOWTOOLBAR5.addContent(BUTTON14);

    var BUTTON15 = new sap.m.Button({
        text: oContr.msg.M003,  // Cancel
        type: "Reject",
        icon: "sap-icon://decline",
        enabled: "{/S_PAGE_HDR_HNDL/cancBtn_enable}",
        press: function () {

            oContr.fn.cancelSnippet();

        }
    });

    OVERFLOWTOOLBAR5.addContent(BUTTON15);

    var TOOLBARSPACER1 = new sap.m.ToolbarSpacer();
    OVERFLOWTOOLBAR5.addContent(TOOLBARSPACER1);

    // var BUTTON11 = new sap.m.Button({
    //     text: "Close",
    //     type: "Negative",
    //     press: function () {


    //         oContr.fn.browserClose();

    //     }
    // });

    // OVERFLOWTOOLBAR5.addContent(BUTTON11);

    // var OVERFLOWTOOLBAR6 = new sap.m.OverflowToolbar();
    // 	PAGE3.setFooter(OVERFLOWTOOLBAR6);
    PAGE3.setFooter(OVERFLOWTOOLBAR5.clone());

    // var BUTTON12 = new sap.m.Button({
    // 	text:"New",
    // 	type:"Emphasized",
    // 	icon:"sap-icon://create"
    // });

    // OVERFLOWTOOLBAR6.addContent(BUTTON12);

    // var BUTTON13 = new sap.m.Button({
    // 	text:"Save",
    // 	type:"Accept",
    // 	icon:"sap-icon://save"
    // });

    // OVERFLOWTOOLBAR6.addContent(BUTTON13);

    // var BUTTON15 = new sap.m.Button({
    // 	text:"Delete",
    // 	icon:"sap-icon://delete",
    // 	type:"Reject"
    // });

    // OVERFLOWTOOLBAR6.addContent(BUTTON15);

    // var TOOLBARSPACER2 = new sap.m.ToolbarSpacer();
    // OVERFLOWTOOLBAR6.addContent(TOOLBARSPACER2);

    // var BUTTON17 = new sap.m.Button({
    // 	text:"Close",
    // 	type:"Negative"
    // });

    // OVERFLOWTOOLBAR6.addContent(BUTTON17);

    oContr.ui.APP = APP;


    resolve(oContr);

});