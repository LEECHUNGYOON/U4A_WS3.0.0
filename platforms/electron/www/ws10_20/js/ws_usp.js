/************************************************************************
 * Copyright 2020. INFOCG Inc. all rights reserved. 
 * ----------------------------------------------------------------------
 * - file Name : ws_usp.js
 * - file Desc : u4a ws usp
 ************************************************************************/

(function (window, $, oAPP) {
    "use strict";

    oAPP.fn.fnCreateWs30 = (fnCallback) => {

        // 30번 페이지 존재 유무 체크
        var oWs30 = sap.ui.getCore().byId("WS30");
        if (oWs30 && typeof fnCallback === "function") {

            oAPP.fn.fnOnInitLayoutSettings();

            fnCallback();
            return;
        }

        // 없으면 렌더링부터..
        oAPP.fn.fnOnInitRenderingWS30();

        if (typeof fnCallback === "function") {
            fnCallback();
        }

    }; // end of oAPP.fn.fnOnInitRenderingWS10

    oAPP.fn.fnOnInitLayoutSettings = () => {

        var oSplitLayout = sap.ui.getCore().byId("usptreeSplitLayout");
        if(!oSplitLayout){
            return;
        }
       
        oSplitLayout.setSize("500px");
        oSplitLayout.setMinSize(500);

    };

    oAPP.fn.fnOnInitRenderingWS30 = () => {

        var oApp = sap.ui.getCore().byId("WSAPP");
        if (!oApp) {
            return;
        }

        var oCustomHeader = oAPP.fn.fnGetCustomHeaderWs30(),
            oSubHeader = oAPP.fn.fnGetSubHeaderWs30(),
            aPageContent = oAPP.fn.fnGetPageContentWs30();

        var oWs30 = new sap.m.Page("WS30", {

            // properties
            floatingFooter: true,
            enableScrolling: false,

            // aggregations
            customHeader: oCustomHeader,
            subHeader: oSubHeader,
            content: aPageContent,

        }).addStyleClass("u4aWsPage30");

        oApp.addPage(oWs30);

    }; // end of oAPP.fn.fnInitRenderingWs30

    /************************************************************************
     * [WS30] Custom Header
     ************************************************************************/
    oAPP.fn.fnGetCustomHeaderWs30 = () => {

        return new sap.m.OverflowToolbar({
            content: [

            ]

        });

    }; // end of oAPP.fn.fnGetCustomHeaderWs30

    /************************************************************************
     * [WS30] Sub Header
     ************************************************************************/
    oAPP.fn.fnGetSubHeaderWs30 = () => {

        return new sap.m.OverflowToolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: oAPP.events.ev_pressWs30Back
                })
            ]

        });

    }; // end of oAPP.fn.fnGetCustomHeaderWs30

    /************************************************************************
     * 30번 페이지 Contents
     ************************************************************************/
    oAPP.fn.fnGetPageContentWs30 = () => {

        var oTreeTab = oAPP.fn.fnGetTreeTableWs30(),
            oCodeEditor = oAPP.fn.fnGetCodeEditorWs30();

        return [

            new sap.ui.layout.Splitter({
                height: "100%",
                width: "100%",
                contentAreas: [

                    oTreeTab,
                    oCodeEditor

                ]
            }),


        ];

    }; // end of oAPP.fn.fnGetPageContentWs30

    oAPP.fn.fnGetTreeTableWs30 = () => {

        return new sap.ui.table.TreeTable("usptree", {
            selectionMode: "Single",
            selectionBehavior: "RowOnly",
            visibleRowCountMode: "Auto",
            layoutData: new sap.ui.layout.SplitterLayoutData("usptreeSplitLayout", {
                size: "500px",
                minSize: 500
            }),

            columns: [

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Name",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{NAME}",
                    })

                }),

                new sap.ui.table.Column({
                    label: new sap.m.Label({
                        text: "Description",
                        design: "Bold"
                    }),

                    template: new sap.m.Text({
                        text: "{DESC}",
                    })

                }),

            ],
            rows: {
                path: "/WS30/USPTREE",
                parameters: {
                    arrayNames: ['USPTREE']
                }
            },
            extension: [
                new sap.m.OverflowToolbar({
                    content: [
                        new sap.m.Button({
                            icon: "sap-icon://expand-group",
                            // press: oAPP.events.ev_MimeTreeTableExpand
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://collapse-group",
                            // press: oAPP.events.ev_MimeTreeTableCollapse
                        }),
                    ]
                })
            ],

        });

    }; // end of oAPP.fn.fnGetTreeTableWs30

    oAPP.fn.fnGetCodeEditorWs30 = () => {

        return new sap.ui.codeeditor.CodeEditor({
            height: "100%",
            width: "100%",
            syntaxHints: false,
        });

    };

    oAPP.events.ev_pressWs30Back = () => {

        oAPP.fn.fnOnMoveToPage("WS10");

    };

})(window, $, oAPP);