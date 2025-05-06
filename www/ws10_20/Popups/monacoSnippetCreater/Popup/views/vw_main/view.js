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
        // busyIndicatorDelay: 0,
        autoFocus: false,
    });

    APP.addStyleClass("sapUiSizeCompact");

    /*****************************************
     * 📑 전체 메인
     *****************************************/
    var PAGE = new sap.m.Page({
		enableScrolling:false,
		showHeader:false
	});
    APP.addPage(PAGE);
        
    PAGE.setModel(oContr.oModel);

	PAGE.addStyleClass("uspSnippetCreatorPage sapUiSizeCompact");

	var SPLITTER1 = new sap.ui.layout.Splitter();
	PAGE.addContent(SPLITTER1);

	var PAGE1 = new sap.m.Page({
		showHeader:false
	});
	
	SPLITTER1.addContentArea(PAGE1);

	var SPLITTERLAYOUTDATA1 = new sap.ui.layout.SplitterLayoutData({
		size:"450px",
		minSize:400
	});
	
	PAGE1.setLayoutData(SPLITTERLAYOUTDATA1);

	var TABLE2 = new sap.m.Table({
		growing:true,
		growingScrollToLoad:true,
		alternateRowColors:true,
		mode:"SingleSelectMaster"
	});
	
	PAGE1.addContent(TABLE2);

	var COLUMNLISTITEM2 = new sap.m.ColumnListItem();
	TABLE2.bindAggregation("items", {
		path: "/T_SNIPPET_LIST",
		template: COLUMNLISTITEM2,
	templateShareable: true
	});

	var TEXT5 = new sap.m.Text({
		text:"{name}"
	});
	COLUMNLISTITEM2.addCell(TEXT5);

	var TEXT6 = new sap.m.Text({
		text:"{desc}"
	});
	COLUMNLISTITEM2.addCell(TEXT6);

	var COLUMN3 = new sap.m.Column({
		width:"200px",
		demandPopin:true,
		minScreenWidth:"600px"
	});
	
	TABLE2.addColumn(COLUMN3);

	var LABEL3 = new sap.m.Label({
		design:"Bold",
		text:"Name"
	});
	
	COLUMN3.setHeader(LABEL3);

	var COLUMN4 = new sap.m.Column({
		// minScreenWidth:"5000px",
		demandPopin:true,
		// autoPopinWidth:2
	});
	
	TABLE2.addColumn(COLUMN4);

	var LABEL4 = new sap.m.Label({
		design:"Bold",
		text:"description"
	});
	
	COLUMN4.setHeader(LABEL4);

	var OVERFLOWTOOLBAR7 = new sap.m.OverflowToolbar();
	TABLE2.setHeaderToolbar(OVERFLOWTOOLBAR7);

	var ICON1 = new sap.ui.core.Icon({
		src:"sap-icon://group-2",
		size:"20px"
	});
	
	OVERFLOWTOOLBAR7.addContent(ICON1);

	var TITLE2 = new sap.m.Title({
		text:"Snippet List"
	});
	
	OVERFLOWTOOLBAR7.addContent(TITLE2);

	var PAGE3 = new sap.m.Page();
	PAGE3.addStyleClass("sapUiContentPadding");
	SPLITTER1.addContentArea(PAGE3);

	var VBOX1 = new sap.m.VBox({
		height:"100%"
	});
	
	PAGE3.addContent(VBOX1);

	var VBOX2 = new sap.m.VBox();
	VBOX2.addStyleClass("sapUiSmallMarginBottom");
	VBOX1.addItem(VBOX2);

	var PANEL1 = new sap.m.Panel();
	VBOX2.addItem(PANEL1);

	var FORM1 = new sap.ui.layout.form.Form({
		editable:true
	});
	
	PANEL1.addContent(FORM1);

	var RESPONSIVEGRIDLAYOUT1 = new sap.ui.layout.form.ResponsiveGridLayout({
		labelSpanM:12,
		labelSpanL:12
	});
	
	FORM1.setLayout(RESPONSIVEGRIDLAYOUT1);

	var FORMCONTAINER1 = new sap.ui.layout.form.FormContainer();
	FORM1.addFormContainer(FORMCONTAINER1);

	var FORMELEMENT1 = new sap.ui.layout.form.FormElement();
	FORMCONTAINER1.addFormElement(FORMELEMENT1);

	var LABEL5 = new sap.m.Label({
		design:"Bold",
		text:"Snippet Name"
	});
	
	FORMELEMENT1.setLabel(LABEL5);

	var INPUT1 = new sap.m.Input({
		value:"{/S_SNIPPET/name}"
	});
	FORMELEMENT1.addField(INPUT1);

	var FORMELEMENT2 = new sap.ui.layout.form.FormElement();
	FORMCONTAINER1.addFormElement(FORMELEMENT2);

	var LABEL6 = new sap.m.Label({
		design:"Bold",
		text:"Snippet Description"
	});
	
	FORMELEMENT2.setLabel(LABEL6);

	var INPUT2 = new sap.m.Input({
		value:"{/S_SNIPPET/desc}"
	});
	FORMELEMENT2.addField(INPUT2);

	var VBOX3 = new sap.m.VBox({
		height:"100%",
		renderType:"Bare"
	});
	
	VBOX1.addItem(VBOX3);

	var PAGE4 = new sap.m.Page();
	VBOX3.addItem(PAGE4);

	var FLEXITEMDATA1 = new sap.m.FlexItemData({
		minHeight:"200px"
	});
	
	PAGE4.setLayoutData(FLEXITEMDATA1);

	var OVERFLOWTOOLBAR4 = new sap.m.OverflowToolbar();
	PAGE4.setCustomHeader(OVERFLOWTOOLBAR4);

	var ICON2 = new sap.ui.core.Icon({
		src:"sap-icon://syntax",
		size:"20px"
	});
	
	OVERFLOWTOOLBAR4.addContent(ICON2);

	var TITLE1 = new sap.m.Title({
		text:"Snippet Code"
	});
	
	OVERFLOWTOOLBAR4.addContent(TITLE1);

	var RICHTEXTEDITOR1 = new sap.ui.richtexteditor.RichTextEditor({
		height:"100%",
		width:"100%"
	});
	
	PAGE4.addContent(RICHTEXTEDITOR1);

	var OVERFLOWTOOLBAR5 = new sap.m.OverflowToolbar();
	PAGE3.setCustomHeader(OVERFLOWTOOLBAR5);

	var BUTTON10 = new sap.m.Button({
		text:"New",
		type:"Emphasized",
		icon:"sap-icon://create"
	});
	
	OVERFLOWTOOLBAR5.addContent(BUTTON10);

	var BUTTON14 = new sap.m.Button({
		text:"Save",
		type:"Accept",
		icon:"sap-icon://save"
	});
	
	OVERFLOWTOOLBAR5.addContent(BUTTON14);

	var BUTTON16 = new sap.m.Button({
		text:"Delete",
		icon:"sap-icon://delete",
		type:"Reject"
	});
	
	OVERFLOWTOOLBAR5.addContent(BUTTON16);

	var TOOLBARSPACER1 = new sap.m.ToolbarSpacer();
	OVERFLOWTOOLBAR5.addContent(TOOLBARSPACER1);

	var BUTTON11 = new sap.m.Button({
		text:"Close",
		type:"Negative"
	});
	
	OVERFLOWTOOLBAR5.addContent(BUTTON11);

	var OVERFLOWTOOLBAR6 = new sap.m.OverflowToolbar();
	PAGE3.setFooter(OVERFLOWTOOLBAR6);

	var BUTTON12 = new sap.m.Button({
		text:"New",
		type:"Emphasized",
		icon:"sap-icon://create"
	});
	
	OVERFLOWTOOLBAR6.addContent(BUTTON12);

	var BUTTON13 = new sap.m.Button({
		text:"Save",
		type:"Accept",
		icon:"sap-icon://save"
	});
	
	OVERFLOWTOOLBAR6.addContent(BUTTON13);

	var BUTTON15 = new sap.m.Button({
		text:"Delete",
		icon:"sap-icon://delete",
		type:"Reject"
	});
	
	OVERFLOWTOOLBAR6.addContent(BUTTON15);

	var TOOLBARSPACER2 = new sap.m.ToolbarSpacer();
	OVERFLOWTOOLBAR6.addContent(TOOLBARSPACER2);

	var BUTTON17 = new sap.m.Button({
		text:"Close",
		type:"Negative"
	});
	
	OVERFLOWTOOLBAR6.addContent(BUTTON17);

    oContr.ui.APP = APP;

    resolve(oContr);

});