self.onmessage = function (e) {

    const
        FS = require("fs");

    let receiveData = e.data,
        aIconFav = receiveData.aIconFav,
        sIconFavFilePath = receiveData.sSaveFilePath,
        aIconInfo = aIconFav.filter(elem => elem.RATVAL == 1);

    try {

        // 파일이 없으면 생성
        if (!FS.existsSync(sIconFavFilePath)) {

            FS.writeFileSync(sIconFavFilePath, JSON.stringify([]));

        }

        FS.writeFileSync(sIconFavFilePath, JSON.stringify(aIconInfo));

    } catch (error) {

        postMessage('X');

        let sErrMsg = "[Icon Favorite save]: " + error.toString() + " \n\n ";
        console.log(sErrMsg);
        throw new Error(sErrMsg);        

    }

    postMessage('X');

};