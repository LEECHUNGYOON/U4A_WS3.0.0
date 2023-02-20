const
    REMOTE = require('@electron/remote'),
    FS = REMOTE.require('fs'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    USERDATA = APP.getPath("userData");

/**
 * 테스트 -- start
 */
const
    CURRWIN = REMOTE.getCurrentWindow(),
    WEBCON = CURRWIN.webContents,
    WEBPREF = WEBCON.getWebPreferences(),
    USERINFO = WEBPREF.USERINFO;

if (USERINFO) {
    process.USERINFO = USERINFO;
}

/**
 * 테스트 -- end
 */


module.exports = {

    /**
     * @class
     * 접속 언어별 다국어 지원 메시지를 생성하는 클래스
     */
    MessageClassText: class {

        _aMsgClsTxt = [];

        /**
         * constructor
         * @param {string} pSysID 접속 시스템 아이디
         * @param {string} pLangu 접속 시스템 언어
         */
        constructor(pSysID, pLangu) { // 인자를 받아 할당한다.                 

            if (!pSysID) {
                throw new Error("System ID is require!");
            }

            if (!pLangu) {
                throw new Error("Language is require!");
            }

            // 클래스의 필드(프로퍼티)
            this.SYSID = pSysID;
            this.LANGU = pLangu;

            // 로컬에 있는 메시지 json 파일을 읽어서 this.aMsgClsTxt; <-- 여기에 저장해둔다.
            this._fnReadMsgClassTxt();

        }

        setMsgClassTxt(aMsgClsTxt) {
            this._aMsgClsTxt = aMsgClsTxt;
        }

        getMsgClassTxt() {
            return this._aMsgClsTxt;
        }

        /**
         * APP 설치 폴더에 있는 메시지 클래스 json 파일을 읽어서 전역 변수에 저장한다.
         *  
         * @private
         */
        _fnReadMsgClassTxt() {

            // APPPATH 경로를 구한다.
            let sSysID = this.SYSID,
                sLangu = this.LANGU,
                sJsonFolderPath = PATH.join(USERDATA, "msgcls", sSysID, sLangu),
                sJsonPath = PATH.join(sJsonFolderPath, "msgcls.json");

            // 파일이 없을 경우 그냥 빠져나간다.
            if (!FS.existsSync(sJsonPath)) {
                console.error("not exists file => msgcls.json");
                return;
            }

            let sJsonData = FS.readFileSync(sJsonPath, 'utf-8'),
                aMsgClsTxt = JSON.parse(sJsonData);

            this.setMsgClassTxt(aMsgClsTxt);

        } // end of _fnReadMsgClassTxt

        /**
         * 메시지 클래스 명과 번호를 참조해서 메시지 텍스트를 리턴한다.
         * 
         * @param {string} sMsgCls - 메시지 클래스 명
         * @param {string} sMsgNum - 메시지 번호
         * @param {string} p1      - replace text param 1
         * @param {string} p2      - replace text param 2
         * @param {string} p3      - replace text param 3
         * @param {string} p4      - replace text param 4
         * @returns {string} Message Text
         * @public
         */
        fnGetMsgClsText(sMsgCls, sMsgNum, p1, p2, p3, p4) {

            let aMsgClsTxt = this.getMsgClassTxt(),
                sLangu = this.LANGU;

            if (!aMsgClsTxt || !aMsgClsTxt.length) {
                return sMsgCls + "|" + sMsgNum;
            }

            let sDefLangu = "E"; // default language    

            // 현재 접속한 언어로 메시지를 찾는다.
            let oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sLangu && a.MSGNR == sMsgNum);

            // 현재 접속한 언어로 메시지를 못찾은 경우
            if (!oMsgTxt) {

                // 접속한 언어가 영어일 경우 빠져나간다.
                if (sDefLangu == sLangu) {
                    return sMsgCls + "|" + sMsgNum;

                }

                // 접속한 언어가 영어가 아닌데 메시지를 못찾으면 영어로 찾는다.
                oMsgTxt = aMsgClsTxt.find(a => a.ARBGB == sMsgCls && a.SPRSL == sDefLangu && a.MSGNR == sMsgNum);

                // 그래도 없다면 빠져나간다.
                if (!oMsgTxt) {
                    return sMsgCls + "|" + sMsgNum;
                }

            }

            var sText = oMsgTxt.TEXT,
                aWithParam = [];

            // 파라미터로 전달 받은 Replace Text 수집
            aWithParam.push(p1 == null ? "" : p1);
            aWithParam.push(p2 == null ? "" : p2);
            aWithParam.push(p3 == null ? "" : p3);
            aWithParam.push(p4 == null ? "" : p4);

            var iWithParamLenth = aWithParam.length;
            if (iWithParamLenth == 0) {
                return sText;
            }

            // 메시지 클래스 텍스트에서 "& + 숫자" (예: &1) 값이 있는 것부터 순차적으로 치환한다.
            for (var i = 0; i < iWithParamLenth; i++) {

                var index = i + 1,
                    sParamTxt = aWithParam[i];

                var sRegEx = "&" + index,
                    oRegExp = new RegExp(sRegEx, "g");

                sText = sText.replace(oRegExp, sParamTxt);

            }

            sText = sText.replace(new RegExp("&\\d+", "g"), "");

            // 메시지 클래스 텍스트에서 "&" 를 앞에서 부터 순차적으로 치환한다."
            for (var i = 0; i < iWithParamLenth; i++) {

                var sParamTxt = aWithParam[i];

                sText = sText.replace(new RegExp("&", "i"), sParamTxt);

            }

            sText = sText.replace(new RegExp("&", "g"), "");

            return sText;

        } // end of getMsgClsText

    },
    /************** end of Class (MessageClassText) ***************/

    /************************************************************************
     * Array를 Tree 구조로 변환
     ************************************************************************  
     * 예) parseArrayToTree(oModel, "WS20.MIMETREE", "CHILD", "PARENT", "MIMETREE");
     * 
     * @param {*} m Core Model Instance
     * @param {*} p Tree를 구성할 원본 Model Path (Deep 은 [.] 점으로 구분)
     * @param {*} r CHILD
     * @param {*} t PARENT
     * @param {*} z 재구성할 MODEL PATH 명
     *************************************************************************/
    parseArrayToTree: function (m, p, r, t, z) {

        var lp = p.replace(/[.\[\]]/g, '/');
        lp = lp.replace(/(\/\/)/g, '/');

        z = z.replace(/[\/]/g, 'x');
        r = r.replace(/[\/]/g, 'x');
        t = t.replace(/[\/]/g, 'x');

        var lp2 = lp.substr(0, lp.lastIndexOf('/'));

        var tm = m.getProperty('/' + lp);

        var tm2 = m.getProperty('/' + lp2);

        if (!tm || tm.length === 0) {
            tm2[z] = [];
            m.refresh();
            return;
        }

        var y = JSON.stringify(tm);

        var n = JSON.parse(y);

        for (var e, h, u, a = [], c = {}, o = 0, f = n.length; f > o; o++) {
            e = n[o],
                h = e[r],
                u = e[t] || 0,
                c[h] = c[h] || [],
                e[z] = c[h],
                0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
        }

        tm2[z] = a;

    }, // end of oAPP.fn.fnSetTreeJson

    /************************************************************************
    * Tree구조를 Array 구조로 변환
    ************************************************************************  
    * 예) parseTreeToArray(aUspTreeData, "USPTREE"),
    * 
    * @param {Array} Tree 구조로 되어 있는 Array
    * @param {String} Child 이름
    *************************************************************************/
    parseTreeToArray: function (e, sArrName) {

        var a = [],
            t = function (e) {

                e.forEach((o, e) => {

                    o[sArrName] && (t(o[sArrName]),
                        delete o[sArrName]);
                    a.push(o);

                });

                // $.each(e, function (e, o) {
                //     o[sArrName] && (t(o[sArrName]),
                //         delete o[sArrName]);
                //     a.push(o);
                // })

            };
        t(JSON.parse(JSON.stringify(e)));
        return a;

    }, // end of parseTreeToArray

    readDir: (sFolderPath) => {

        return new Promise(async (resolve) => {

            FS.readdir(sFolderPath, (err, files) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTDATA: files
                });

            });

        });

    }, // end of readdir

    readFile: (sFilePath) => {

        return new Promise(async (resolve) => {

            FS.readFile(sFilePath, "utf-8", (err, data) => {

                if (err) {

                    resolve({
                        RETCD: "E",
                        RTMSG: err.toString()
                    });

                    return;
                }

                resolve({
                    RETCD: "S",
                    RTDATA: data
                });

            });

        });

    }, // end of readFile

};