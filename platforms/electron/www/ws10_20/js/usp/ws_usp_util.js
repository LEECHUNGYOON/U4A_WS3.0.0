const
    REMOTE = require('@electron/remote'),
    FS = require('fs-extra'),
    PATH = REMOTE.require('path'),
    APP = REMOTE.app,
    APPPATH = APP.getAppPath(),
    USERDATA = APP.getPath("userData"),
    PATHINFO = require(PATH.join(APPPATH, "Frame", "pathInfo.js")),
    WSUTIL = require(PATHINFO.WSUTIL);

module.exports = {

    /**
     * 설치 폴더에 있는 기본 패턴을 읽기
     */
    readDefaultPatternFiles: () => {
        
        return new Promise(async (resolve) => {            

            let sPatternPath = PATHINFO.USERDATA_PATT_FILES,
                oResult = await WSUTIL.readDir(sPatternPath);

            if (oResult.RETCD == "E") {
                resolve(oResult);
                return;
            }

            // 폴더 목록의 파일들을 읽어서 리턴해준다.
            let aPatternList = oResult.RTDATA,
                iPattLength = aPatternList.length,
                aPatternInfo = [];

            for (var i = 0; i < iPattLength; i++) {

                let sFileName = aPatternList[i],
                    sFileKey = sFileName.split(".")[0],
                    sFilePath = sPatternPath + "\\" + sFileName;

                let oFileDataResult = await WSUTIL.readFile(sFilePath);
                if (oFileDataResult.RETCD == "E") {
                    continue;
                }

                let sFileData = oFileDataResult.RTDATA,
                    oPatternInfo = {
                        KEY: sFileKey,
                        DATA: sFileData
                    };

                aPatternInfo.push(oPatternInfo);

            }

            if (aPatternInfo.length == 0) {
                resolve({
                    RETCD: "E",
                    // RTMSG: "데이터 없음"
                });
                return;
            }

            resolve({
                RETCD: "S",
                RTMSG: "",
                RTDATA: aPatternInfo
            });

        });

    }, // end of readDefaultPatternFiles




};