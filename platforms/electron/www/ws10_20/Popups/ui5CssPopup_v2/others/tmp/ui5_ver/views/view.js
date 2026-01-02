export async function getView(){

    /************************************************************************
     * 💖 컨트롤러 호출
     ************************************************************************/
    
        let sControlPath = "./control.js";
    
        const oRes   = await import(sControlPath);
        const oContr = await oRes.getControl();
       
    
    /************************************************************************
     * 💖 화면 그리기
     ************************************************************************/
    
        let APP = new sap.m.App({
            busy: true,
            busyIndicatorDelay: 0,
            autoFocus: false,
        });

        let PAGE1 = new sap.m.Page();
        APP.addPage(PAGE1);

        PAGE1.setModel(oContr.oModel);
        
















        oContr.ui.ROOT = APP;   

        
    return oContr;
    
}