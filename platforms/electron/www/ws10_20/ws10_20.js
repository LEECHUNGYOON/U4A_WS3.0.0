((oAPP) => {
    "use strict";

    /************************************************************************
     * 마우스 휠 이벤트 적용하기 (줌 기능)
     ************************************************************************/
    oAPP.fn.fnAttachMouseWheelEvent = () => {

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

    }; // end of oAPP.fn.fnAttachMouseWheelEvent

    /************************************************************************/

    // 마우스 휠 이벤트 적용하기 (줌 기능)
    oAPP.fn.fnAttachMouseWheelEvent();

})(oAPP);