/********************************************************************
 *📝 VIEW.JS    
    내역 : 웹딘 컨버전 화면 구성 영역
********************************************************************/
export async function designAddTreeData(is_data, is_tree, sAggr){

}



//UI의 attr 정보 복사 처리.
function copyAttrData(is_14, is_copied, aggrParam, bKeep){

    if(is_copied._T_0015.length === 0){return;}

    var lt_0015 = [];

    for(var i = 0, l = is_copied._T_0015.length; i < l; i++){
        
        //바인딩 정보를 유지 안하는경우.
        if(bKeep !== true){

            //바인딩 처리된건인경우 skip.
            if(is_copied._T_0015[i].ISBND === "X" && is_copied._T_0015[i].UIATV !== ""){
                continue;
            }

            //서버 이벤트가 존재하는경우 skip.
            if(is_copied._T_0015[i].UIATY === "2" && is_copied._T_0015[i].UIATV !== ""){
                continue;
            }

        }

        //프로퍼티 구조 신규 생성.
        var ls_15 = oAPP.fn.crtStru0015();

        //기존 복사건을 신규 15번 구조에 매핑.
        oAPP.fn.moveCorresponding(is_copied._T_0015[i], ls_15);

        ls_15.APPID = oAPP.attr.appInfo.APPID;
        ls_15.GUINR = oAPP.attr.appInfo.GUINR;
        ls_15.OBJID = is_14.OBJID;

        //복사된 ui의 최상위 정보의 aggregation 정보 변경처리.
        if(aggrParam && ls_15.UIATY === "6"){
            ls_15.UIATK = aggrParam.UIATK;
            ls_15.UIATT = aggrParam.UIATT;
            ls_15.UIASN = aggrParam.UIASN;
            ls_15.UIADT = aggrParam.UIADT;
            ls_15.UIADS = aggrParam.UIADS;
            ls_15.ISMLB = aggrParam.ISMLB;

        }

        //프로퍼티 복사건 재수집 처리.
        lt_0015.push(ls_15);
        
    }

    return lt_0015;

    }   //UI의 attr 정보 복사 처리.
