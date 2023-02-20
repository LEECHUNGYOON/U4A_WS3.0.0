
module.exports = {
    getMenu: function (oAPP) {
      
        return [
            {
                label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E10"), // Default Pattern
                submenu: [
                    {
                        key: "PTN001",
                        label: "HTML",
                        click: onMenuClick
                    },
                    {
                        key: "PTN002",
                        label: 'JS',
                        click: onMenuClick
                    },
                    {
                        key: "PTN003",
                        label: 'CSS',
                        click: onMenuClick

                    },
                ]
            },
            {
                type: 'separator',
            },
            {
                key: "PTN100",
                label: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "E11"), // Custom Pattern
                click: onMenuClick

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


    debugger;


} // end of onMenuClick