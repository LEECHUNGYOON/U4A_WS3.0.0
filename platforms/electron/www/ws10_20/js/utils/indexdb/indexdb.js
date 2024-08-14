
    // 🌐 리턴코드 공통 구조
    const RES_DATA = {
        RETCD: "",      // 응답 코드 (예: S = 성공, E = 실패)
        ACTCD: "",      // 액션 코드 (행위 기반)
        PRCCD: "",      // 수행 중 또는 수행 하려는 현재 프로세스를 구분하기 위한 코드 (흐름 기반)
        ERRCD: "",      // 에러 코드 (오류 발생시 오류 유형을 구분하기 위한 코드)
        RDATA: "",      // 성공 또는 실패 시 전달하고자 하는 데이터
    };


    /****************************************************************
     * ⚒️ Index DB 클래스 
     ****************************************************************/
    class CLIndexDB {


    constructor(){

        


    }

    /******************************************************************
     * 데이터 Insert
     ******************************************************************
     * @param {Object} oParams 
     * {
     *    DB_NAME   :   @type {String} Database Name    (* 필수)
     *    TABLE_NAME:   @type {String} Table Name       (* 필수)
     *    DATA      :   @type {Array}  Insert Data      (* 필수)
     *    KEY       :   @type {String} Key              (옵션)
     * }
     * @param {Function} fSuccessCallback
     * - success callback
     * 
     * @param {Function} fErrorCallback
     * - error callback
     *******************************************************************/
    insert(oParams, fSuccessCallback, fErrorCallback){ // 1

        // // 전달받은 파라미터 점검
        // let _oParamCheck = this._checkInsertParams(oParams);
        // if(_oParamCheck.RETCD === "E"){

        //     if(typeof fErrorCallback === "function"){
        //         fErrorCallback();
        //         return;
        //     }

        // }

        return new Promise(async function(resolve){


            



        });

    } // end of insert

    // Insert 메소드의 파라미터 점검
    _checkInsertParams (oParams){





    } // end of _checkInsertParams

    read(oParams, fSuccessCallback, fErrorCallback){


    }

    readAll(oParams, fSuccessCallback, fErrorCallback){ // 2


    }

    delete(oParams, fSuccessCallback, fErrorCallback){


    }

    deleteAll(oParams, fSuccessCallback, fErrorCallback){ // 3


    }
    
}

module.exports = CLIndexDB;