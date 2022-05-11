((oAPP) => {
    "use strict";

    debugger;

    var remote = parent.REMOTE;

    var web = remote.getCurrentWebContents();

    oAPP.attr.scale = web.getZoomLevel();

    document.addEventListener('mousewheel', (ev) => {

        if (ev.ctrlKey) {

            oAPP.attr.scale += ev.deltaY * -0.01;
            oAPP.attr.scale = Math.min(Math.max(-10, oAPP.attr.scale), 10);
            console.log(oAPP.attr.scale);
            web.setZoomLevel(oAPP.attr.scale);

        }
    });

})(oAPP);