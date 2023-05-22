self.onmessage = function (e) {

    const
        FS = require("fs");

    let receiveData = e.data,
        aIcons = receiveData.aIcons,        
        sIconFavFilePath = receiveData.sSaveFilePath,
        aIconInfo = aIcons.filter(elem => elem.RATVAL == 1);

    // aSelectedFavIcon = aIcons.filter(elem => elem.ICON_SRC == sIconSrc);

    // aIconInfo = aIconInfo.concat(aSelectedFavIcon);

    try {

        // 파일이 없으면 생성
        if (!FS.existsSync(sIconFavFilePath)) {

            FS.writeFileSync(sIconFavFilePath, JSON.stringify([]));

        }

        FS.writeFileSync(sIconFavFilePath, JSON.stringify(aIconInfo));

    } catch (error) {

        postMessage('E');

        let sErrMsg = "[Icon Favorite save]: " + error.toString() + " \n\n ";
        console.log(sErrMsg);
        throw new Error(sErrMsg);

    }

    postMessage('S');

};