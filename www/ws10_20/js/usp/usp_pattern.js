/*================================================== */




module.exports = {
    getMenu: function (oAPP) {

        return [
            {
                label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E10"), // Default Pattern
                submenu: [
                    {
                        key: "PTN001",
                        label: "HTML",
                        click: onMenuClick.bind(oAPP),
                        submenu: [{ key: "zzz", label: "html 기본패턴", OP: "01", toolTip: "asdffffff", sublabel: "asdfsadfasdfasdfasdfasdfsadfasdf" }]
                    },
                    {
                        key: "PTN002",
                        label: 'JS',
                        click: onMenuClick.bind(oAPP)
                    },
                    // {
                    //     key: "PTN003",
                    //     label: 'CSS',
                    //     click: onMenuClick

                    // },
                ]
            },
            {
                type: 'separator',
            },
            {
                key: "PTN100",
                label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E11"), // Custom Pattern
                click: onMenuClick.bind(oAPP)

            },

        ]

    }, // end of getMenu
}

/**
 * Usp Pattern Context Menu Click Event
 * @param {*} menu 
 * @param {*} currentWindow 
 * @param {*} keyboardEvent 
 */
function onMenuClick(menu, currentWindow, keyboardEvent) {

    let oAPP = this;

    oAPP.fn.fnUspPatternPopupOpener(menu, currentWindow, keyboardEvent);

} // end of onMenuClick