// /************************************************************************
//  * Copyright 2020. INFOCG Inc. all rights reserved. 
//  * ----------------------------------------------------------------------
//  * - file Name : fnShowMultiFooterMsg.js
//  * - file Desc : 멀티 푸터 메시지
//  ************************************************************************/

// (function(window, $, oAPP) {
//     "use strict";

//     /************************************************************************
//      * WS20 페이지의 멀티 메시지
//      * **********************************************************************
//      * @param {Array} aMsg  
//      * - 메시지 구조 (JSON Type) ->> 추후 결정
//      * - 현재 구조 : [{ F01: "[Err Type]", F02: "[Line]", F03: "[Description]" }]
//      ************************************************************************/
//     oAPP.fn.fnShowMultiFooterMsg = function(aMsg) {

//         // Z-Index 구하기
//         var iZindex = oAPP.common.fnGetZIndex();

//         // 푸터 메시지가 있으면 숨김처리.
//         oAPP.common.fnHideFloatingFooterMsg();

//         // Footer 메시지 영역이 있으면 삭제 하고 시작.
//         oAPP.common.fnMultiFooterMsgClose();

//         var oFooterMsgDom = document.createElement("div");
//         oFooterMsgDom.id = "u4aWsMsgFooter";
//         oFooterMsgDom.classList = "u4aWsMsgFooter sapUiArea";
//         oFooterMsgDom.style.zIndex = iZindex;

//         var oFooterMsgDomInner = document.createElement("div");
//         oFooterMsgDomInner.id = "u4aWsMsgFooterInner";
//         oFooterMsgDomInner.classList = "u4aWsMsgFooterInner";
//         oFooterMsgDomInner.style.zIndex = iZindex;

//         oFooterMsgDom.appendChild(oFooterMsgDomInner);

//         document.body.appendChild(oFooterMsgDom);

//         /** 
//          * Footer 메시지 영역 Resize 이벤트 -- Start
//          */
//         var fn_resizeStart = function(event, ui) {
//                 $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>')
//                     .css({
//                         width: '100%',
//                         height: '100%',
//                         position: "absolute",
//                         opacity: "0.001",
//                         zIndex: iZindex,
//                         overflow: "hidden",
//                         left: "0px",
//                         top: "0px"
//                     }).appendTo("body");
//             },
//             fn_resizeStop = function(event, ui) {
//                 $('.ui-resizable-iframeFix').remove();
//                 $('.u4aWsMsgFooter').css("top", '');
//             };

//         // Resize Options
//         var oResizeOpts = {
//             handles: "n",
//             minHeight: 100,
//             stop: fn_resizeStop
//         };

//         // Footer Msg Area 영역에 resize 기능을 적용한다.
//         // $("#u4aWsMsgFooterInner").resizable(oResizeOpts);
//         $("#u4aWsMsgFooter").resizable(oResizeOpts);

//         /**
//          * Resize 이벤트 적용 시..
//          * - Resize 영역을 클릭하고 드래그 할 때, 드래그 위치가 Iframe 영역이면 드래그 이벤트가 안먹어서 Resize가 안됨.
//          * - 해결: Resize 영역을 클릭할 때 순간적으로 IFrame 영역 위에 DIV로 막을 치고, 클릭을 놓는 순간 DIV 막을 제거하여 해결함. 
//          */
//         $(".u4aWsMsgFooter .ui-resizable-n").on("mousedown", fn_resizeStart);
//         $(".u4aWsMsgFooter .ui-resizable-n").on("mouseup", fn_resizeStop);

//         /** 
//          * Footer 메시지 영역 Resize 이벤트 -- END
//          */

//         oAPP.common.fnSetModelProperty("/FMTMSG", aMsg);

//         var oToolbar = new sap.m.Toolbar({
//                 content: [
//                     new sap.m.Text({
//                         text: "Error Footer Message"
//                     }),
//                     new sap.m.ToolbarSpacer(),
//                     new sap.m.Button({
//                         icon: "sap-icon://decline",
//                         press: oAPP.events.fnPressMultiFooterMsgCloseBtn
//                     })
//                 ]
//             }).addStyleClass("u4aWsMsgFooter_HeaderToolbar"),

//             oTable = new sap.m.Table("footerMsgTable", {
//                 sticky: ["ColumnHeaders", "HeaderToolbar"],
//                 fixedLayout: true,
//                 headerToolbar: oToolbar,
//                 columns: [
//                     new sap.m.Column({
//                         width: "100px",
//                         hAlign: "Center",
//                         header: new sap.m.Label({
//                             design: "Bold",
//                             text: "Error Type"
//                         })
//                     }),
//                     new sap.m.Column({
//                         width: "80px",
//                         hAlign: "Center",
//                         header: new sap.m.Label({
//                             design: "Bold",
//                             text: "Line"
//                         })
//                     }),
//                     new sap.m.Column({
//                         header: new sap.m.Label({
//                             design: "Bold",
//                             text: "Description"
//                         })
//                     }),
//                 ],
//                 items: {
//                     path: "/FMTMSG",
//                     template: new sap.m.ColumnListItem({
//                         type: "Active",
//                         press: oAPP.events.ev_pressFooterMsgColListItem,
//                         cells: [
//                             new sap.m.Text({
//                                 text: '{TYPE}'
//                             }),
//                             new sap.m.Text({
//                                 text: '{LINE}'
//                             }),
//                             new sap.m.Text({
//                                 text: '{DESC}'
//                             }),
//                         ]
//                     })
//                 }

//             }).addStyleClass("sapUiSizeCompact");

//         // Multi Footer Message 더블클릭
//         oTable.attachBrowserEvent("dblclick", function(oEvent) {

//             var oTarget = oEvent.target,
//                 $SelectedRow = $(oTarget).closest(".sapMListTblRow");

//             if (!$SelectedRow.length) {
//                 return;
//             }

//             var oRow = $SelectedRow[0],
//                 oSelectedRow = sap.ui.getCore().byId(oRow.id);

//             if (!oSelectedRow) {
//                 return;
//             }

//             var oCtx = oSelectedRow.getBindingContext(),
//                 oRowData = oSelectedRow.getModel().getProperty(oCtx.sPath);

//             switch (oRowData.GRCOD) {

//                 case "CLS_SNTX":
//                 case "METH":
//                 case "CLSD":
//                 case "CPRO":
//                 case "CPUB":

//                     oAPP.common.execControllerClass(oRowData.OBJID, oRowData.LINE);
//                     return;

//                 default:

//                     oAPP.fn.setSelectTreeItem(oRowData.OBJID, oRowData.UIATK, oRowData.TYPE);
//                     return;

//             }

//         });

//         oTable.placeAt("u4aWsMsgFooterInner");

//     }; // end of oAPP.fn.fnShowMultiFooterMsg    

//     // /************************************************************************
//     //  * WS20의 멀티 메시지 리스트 아이템 클릭 이벤트
//     //  ************************************************************************/
//     // oAPP.events.ev_pressFooterMsgColListItem = function(oEvent) {

//     //     var oCtx = oEvent.getSource().getBindingContext(),
//     //         sBindPath = oCtx.sPath,
//     //         oBindData = oCtx.getProperty(sBindPath);

//     //     // 하위로직 수행..


//     // }; // end of oAPP.events.ev_pressFooterMsgColListItem  

// })(window, $, oAPP);