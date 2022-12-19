            /* ===================================================================================== */
            /* [시작] 초기값 설정                                                                     */
            /* ===================================================================================== */
            let oData = {};

            //서버 HOST - 화면에서 사용 
            oData.sHOST = oAPP.config.BASE_SHOST;

            //서버 통신 서비스 URL  - 내부 사용
            //oData.SURL    = oAPP.config.SHOST + "/zu4a_wbc/u4a_ipcmain/GET_SHORTCUT_APPINFO?sap-user=shhong&sap-password=2wsxzaq1!";

            oData.SURL = oAPP.config.SHOST + "/GET_SHORTCUT_APPINFO";
            //Applicaton Type - M(U4A) U(USP)
            oData.APPTY = "";

            //UI Model 오브젝트
            oData.model = null;

            /* ===================================================================================== */
            /* [시작] 기능 펑션                                                                       */
            /* ===================================================================================== */

            //Update UI Callback 
            function fn_UIUPdated(e) {

                //Update UI 이벤트 핸들러 제거 
                sap.ui.getCore().detachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);

                //화면 활성 
                $('#content').fadeIn(1500);

                //Model 오브젝트 생성 
                oData.model = new sap.ui.model.json.JSONModel();
                APP.setModel(oData.model);

                //Target Host URL 선택에 따른 처리 
                fn_select_Host();

                //Browser type 영역 활성 비활성 처리
                fn_setBrowserHandle();

                //Browser Type 선택에 따른 처리 
                fn_select_BROWSER();

                //로딩바 제거 
                APP.setBusy(false);

            }

            //Update UI 이벤트 핸들러 설정 
            sap.ui.getCore().attachEvent(sap.ui.core.Core.M_EVENTS.UIUpdated, fn_UIUPdated);


            //Browser type 영역 활성 비활성 처리
            function fn_setBrowserHandle() {

                var isFnd = "";

                for (let index = 0; index < oAPP.browserInfo.length; index++) {

                    var sLine = oAPP.browserInfo[index];

                    switch (sLine.TYPE) {
                        case "CR":
                            FORM3_RADIOBUTTON1.setVisible(true);
                            if (isFnd === "") {
                                isFnd = "0";
                            }

                            break;

                        case "MS_EDGE":
                            FORM3_RADIOBUTTON2.setVisible(true);
                            if (isFnd === "") {
                                isFnd = "1";
                            }

                            break;
                    }

                }

                FORM3_RADIOBUTTONGROUP1.setSelectedIndex(Number(isFnd));

            }


            //Target Host URL 선택에 따른 처리 
            function fn_select_Host() {

                var Lindex = FORM2_RADIOBUTTONGROUP1.getSelectedIndex();

                switch (Lindex) {
                    case 0: //Internal HOST URL
                        FORM2_INPUT1.setEnabled(false);
                        FORM2_INPUT1.setValue(oData.sHOST);
                        break;

                    case 1: //External HOST URL
                        FORM2_INPUT1.setEnabled(true);
                        break;
                }

            }



            //Browser Type 선택에 따른 처리 
            function fn_select_BROWSER() {

                var Lindex = FORM3_RADIOBUTTONGROUP1.getSelectedIndex();

                switch (Lindex) {
                    case 0: //Chrome
                        FORM4.setVisible(true); //Browser Option - Chrome 영역 
                        FORM5.setVisible(false); //Browser Option - IE edge 영역 

                        break;

                    case 1: //IE edge
                        FORM4.setVisible(false); //Browser Option - Chrome 영역 
                        FORM5.setVisible(true); //Browser Option - IE edge 영역  

                        break;
                }

            }


            //디렉토리 선택 팝업 호출 
            function fn_select_Path(oEvent) {
                if (typeof oEvent.oSource.setValue !== "function") {
                    return;
                }

                var oSource = oEvent.oSource;

                switch (oEvent.oSource._mtype) {
                    case "01": //save path 

                        var options = {
                            title: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "317"), // Save Shortcut Download Directory.common.fnGetMsgClsText("/U4A/MSG_WS", "317", "", "", "", ""), // Save Shortcut Download Directory
                            // See place holder 4 in above image
                            filters: [

                            ],
                            properties: ['openDirectory', '']
                        };

                        break;

                    case "02": //ICON path 

                        var options = {
                            title: oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "318"), // Select Shortcut Icon
                            // See place holder 4 in above image
                            filters: [{
                                name: 'Images',
                                extensions: ['ICO', 'ico']
                            }],
                            properties: ['openFile']
                        };

                        break;
                }

                oAPP.remote.dialog.showOpenDialog(oAPP.remote.getCurrentWindow(), options).then(function (e) {

                    if (!e.canceled) {
                        oSource.setValue(e.filePaths[0]);

                    }

                }.bind(this));

            }


            //필수 값 점검 
            function fn_Check_required() {

                var Lret = "";

                //appid
                if (FORM1_INPUT1.getValue() === "") {
                    Lret = "E";
                    FORM1_INPUT1.setValueState('Error');
                }

                //Save As Path
                if (FORM1_INPUT4.getValue() === "") {
                    Lret = "E";
                    FORM1_INPUT4.setValueState('Error');
                }

                //host 
                if (FORM2_INPUT1.getValue() === "") {
                    Lret = "E";
                    FORM2_INPUT1.setValueState('Error');
                }

                PAGE.scrollTo(0, 300);

                return Lret;

            }


            //입력값 점검  
            async function fn_Check_value() {

                APP.setBusy(true);

                //App Name 초기화 
                FORM1_TEXT1.setText("");

                let promise = new Promise((resolve, reject) => {

                    var Lappid = FORM1_INPUT1.getValue();

                    var vurl = oData.SURL;
                    var Ldata = {
                        APPID: Lappid
                    };

                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: vurl,
                        dataType: "json",
                        data: JSON.stringify(Ldata),
                        success: (e) => {

                            APP.setBusy(false);
                            if (typeof e.RETCD === "undefined") {
                                return;
                            }

                            switch (e.RETCD) {
                                case "Z":
                                    //크리티컬 오류 
                                    break;

                                case "E":
                                    FORM1_INPUT1.setValueState('Error');
                                    FORM1_INPUT1.setValueStateText(e.RTMSG);
                                    PAGE.scrollTo(0, 300);
                                    setTimeout(() => {
                                        FORM1_INPUT1.focus();
                                    }, 400);

                                    break;

                                default:
                                    FORM1_TEXT1.setText(e.APPNM);
                                    oData.APPTY = e.APPTY;
                                    break;
                            }


                            resolve(e);

                        },
                        error: (r, t, e) => {

                            APP.setBusy(false);

                            var Lmsg = fn_removeTAG(r.responseText);

                            jQuery.sap.require('sap.m.MessageBox');
                            sap.m.MessageBox.error(Lmsg);

                            var sRet = {
                                RETCD: "E",
                                RTMSG: Lmsg
                            };

                            resolve(sRet);

                        }
                    });


                });

                // 상위 비동기 프로세스 대기 
                let result = await promise;

                //크리티컬 오류 !!!
                if (result.RETCD === "Z") {

                    APP.setBusy(true);
                    jQuery.sap.require("sap.m.MessageBox");

                    //시스템 메시지 
                    sap.m.MessageBox.show(result.RTMSG, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "critical error",
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function (oAction) {
                            //오류 팝업 수행후 종료 처리
                            fn_close();

                        }

                    });

                    return "E";
                }

                if (result.RETCD === "E") {
                    return "E";
                }


                //Paramerter Table 사용자 선택 입력값 점검
                var oModel = PANEL1_TABLE.getModel();
                var Lretun = "";
                var regType1 = /^[A-Za-z0-9]*$/;

                //처리 Row 정보가 존재하지않다면 
                if (typeof oModel.getData().PARAMS === "undefined") {
                    return "S";
                }

                //이전 오류 항목 표시 항목 초기화
                for (var index = 0; index < oModel.getData().PARAMS.length; index++) {
                    var sLine = oModel.getData().PARAMS[index];
                    sLine.STATE = "None";

                }

                //입력값 점검 
                for (var index = 0; index < oModel.getData().PARAMS.length; index++) {
                    var sLine = oModel.getData().PARAMS[index];

                    //NAME VALUE 항목중 VALUE 값만 존해하는경우 
                    if (sLine.NAME === "" && sLine.VALUE !== "") {
                        sLine.STATE = "Error";
                        Lretun = "01";
                        break;

                    }

                    //NAME 입력값에 숫자 영어 외 값이 존재여부 점검 
                    if (sLine.NAME !== "") {

                        if (!regType1.test(sLine.NAME)) {
                            sLine.STATE = "Error";
                            Lretun = "02";
                            break;

                        }

                    }

                }

                oModel.refresh(true);
                PAGE.scrollTo(30000, 300);

                let sMsg = "";

                if (Lretun === "01") {
                    sMsg = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C11"); // Name
                    sMsg = "'" + sMsg + "'";
                    sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "319", sMsg); // value does not exist in the &1 Field

                    sap.m.MessageToast.show(sMsg);

                    return "E";
                }

                if (Lretun === "02") {
                    sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "320"); // Only English and numbers are accepted

                    sap.m.MessageToast.show(sMsg);
                    return "E";
                }

                return "S";


            }


            //숏컷 생성 - 처리전 
            async function fn_CreateShortcut() {

                //오류 표시 초기화 
                FORM1_INPUT1.setValueState('None'); //appid
                FORM1_INPUT1.setValueStateText(""); //appid 오류 텍스트 초기화 
                FORM1_INPUT4.setValueState('None'); //Save As Path
                FORM2_INPUT1.setValueState('None'); //host

                //필수 값 점검 
                if (fn_Check_required() === "E") {
                    return;
                }

                //입력값 점검   
                if (await fn_Check_value() === "E") {
                    return;
                }

                jQuery.sap.require('sap.m.MessageBox');

                let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "321"); // Are you sure you want to proceed with creating a shortcut?
                sap.m.MessageBox.confirm(sMsg, (e) => {

                    if (e !== "OK") {
                        let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "161"); // Job canceled.
                        sap.m.MessageToast.show(sMsg);
                        return;
                    }

                    //숏컷 생성 - 처리
                    fn_CreateShortcutRUN();

                });

            }


            //숏컷 생성 - 처리
            function fn_CreateShortcutRUN() {

                var Lappid = FORM1_INPUT1.getValue();
                var Lappnm = FORM1_TEXT1.getText();
                var LsPath = FORM1_INPUT4.getValue();
                var LFname = FORM1_INPUT3.getValue();
                var Loption = "";
                var U4Apath = "";

                //File Name 빈값 점검 
                var reg = /\s/g;
                var LFname_X = LFname;
                LFname_X = LFname_X.replace(reg, "");
                if (LFname_X.length == 0) {
                    LFname = Lappid;
                }

                LFname = LFname.replace(".lnk", "");
                LFname = LFname + ".lnk";
                LsPath = oAPP.path.join(LsPath, LFname);

                var LicoPath = FORM1_INPUT5.getValue();
                var Lhost = FORM2_INPUT1.getValue();

                //Application Type 에 따른 기본 URL Path 설정 
                switch (oData.APPTY) {
                    case "M": //U4A 
                        var U4AbasePath = "/zu4a/";
                        break;

                    case "U": //USP
                        var U4AbasePath = "/zu4a/usp/";
                        break;

                }

                //U4A Application URL 구성 
                U4Apath = Lhost + U4AbasePath + Lappid.toLowerCase();

                debugger;

                //URL Paramerter 
                var oModel = PANEL1_TABLE.getModel();
                var Lparam = "";
                if (typeof oModel.getData().PARAMS !== "undefined") {

                    for (let i = 0; i < oModel.getData().PARAMS.length; i++) {
                        var sLine = oModel.getData().PARAMS[i];

                        if (sLine.NAME === "" && sLine.VALUE === "") {
                            continue;
                        }

                        if (Lparam !== "") {
                            Lparam = Lparam + "&" + sLine.NAME + "=" + sLine.VALUE;

                        } else {
                            Lparam = sLine.NAME + "=" + sLine.VALUE;

                        }

                    }

                    if (Lparam !== "") {
                        U4Apath = U4Apath + "?" + Lparam;
                    }

                }


                //Browser type
                var Lindex = FORM3_RADIOBUTTONGROUP1.getSelectedIndex();

                switch (Lindex) {
                    case 0: //Chrome
                        var Ltarget = oAPP.browserInfo[0].PATH; //브라우져 설치 경로 

                        //ShorCut Option 구성 
                        Loption = fn_setShorCutOptionCR(U4Apath);

                        break;

                    case 1: //IE edge
                        var Ltarget = oAPP.browserInfo[1].PATH; //브라우져 설치 경로

                        //ShorCut Option 구성 
                        Loption = fn_setShorCutOptionIE(U4Apath);

                        break;
                }


                //숏컷 생성 처리  
                let res = oAPP.SHELL.writeShortcutLink(LsPath, "create", {
                    //options
                    target: Ltarget,
                    args: Loption,
                    description: Lappnm,
                    appUserModelId: Ltarget,
                    icon: LicoPath,
                    iconIndex: 0

                });


                if (res) {
                    //정상처리
                    jQuery.sap.require('sap.m.MessageBox');

                    let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "322"); // processing is complete
                    sap.m.MessageBox.show(sMsg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "success",
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function (oAction) {
                            //다운 경로 폴더 수행
                            oAPP.SHELL.showItemInFolder(LsPath);

                            //Window 종료
                            fn_close();

                        }

                    });

                } else {
                    //처리 실패
                    jQuery.sap.require('sap.m.MessageBox');

                    let sMsg = oAPP.common.fnGetMsgClsText("/U4A/MSG_WS", "323"), // processing failed
                        sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C00"); // fail

                    sap.m.MessageBox.show(sMsg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: sTitle,
                        actions: [sap.m.MessageBox.Action.OK]

                    });

                };


            }


            //ShorCut Option 구성 - 크롬
            function fn_setShorCutOptionCR(U4Apath) {

                var Loption = "";

                //Displble Translate Mode 선택값
                var Lchk1 = FORM4_CHECKBOX1.getSelected();

                //Secret Mode 선택값 
                var Lchk2 = FORM4_CHECKBOX2.getSelected();

                //Secret Mode
                if (Lchk2) {
                    Loption = "--incognito";
                }

                //Displble Translate Mode 번역 금지
                if (Lchk1) {

                    if (Loption !== "") {
                        Loption = Loption + " " + "--disable-translate";

                    } else {
                        Loption = "--disable-translate";

                    }

                }

                var Lsel = FORM4_RADIOBUTTONGROUP1.getSelectedIndex();
                switch (Lsel) {
                    case 0: //App Mode

                        if (Loption !== "") {
                            Loption = Loption + " " + "--app=";

                        } else {
                            Loption = "--app=";

                        }

                        Loption = Loption + U4Apath;

                        break;

                    case 1: //Full Screen Mode

                        if (Loption !== "") {
                            Loption = Loption + " " + "--start-maximized";

                        } else {
                            Loption = "--start-maximized";

                        }

                        Loption = Loption + " " + U4Apath;

                        break;

                    case 2: //Kiosk Mode

                        if (Loption !== "") {
                            Loption = Loption + " " + "--kiosk";

                        } else {
                            Loption = "--kiosk";

                        }

                        Loption = Loption + " " + U4Apath;

                        break;

                }

                return Loption;

            }

            //ShorCut Option 구성 - IE 엣지
            function fn_setShorCutOptionIE(U4Apath) {

                debugger;

                var Loption = "";

                var Lsel = FORM5_RADIOBUTTONGROUP1.getSelectedIndex();
                switch (Lsel) {
                    case 0: //App Mode

                        if (Loption !== "") {
                            Loption = Loption + " " + "--app=";

                        } else {
                            Loption = "--app=";

                        }

                        Loption = Loption + U4Apath;

                        break;

                    case 1: //normal mode

                        if (Loption !== "") {
                            Loption = Loption + " " + "--start-maximized";

                        } else {
                            Loption = "--start-maximized";

                        }

                        Loption = Loption + " " + U4Apath;

                        break;

                }

                return Loption;

            }


            //종료 - 창닫기  
            function fn_close() {
                oAPP.remote.getCurrentWindow().close();

            }

            //태그 제거 
            function fn_removeTAG(text) {

                text = text.replace(/<br\/>/ig, "\n");
                text = text.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/ig, "");
                text = text.replace(/(<([^>]+)>)/ig, "");
                text = text.replace(/(<([^>]+)>)/gi, "");
                text = text.replace(/<(\/style|style)([^>]*)>/gi, "");

                return text;

            };

            /* ===================================================================================== */
            /* [시작] APP 화면 구성                                                                   */
            /* ===================================================================================== */


            var APP = new sap.m.App({
                autoFocus: false,
                busyIndicatorDelay: 1,
                height: "100%",
                width: "100%",
                busy: true
            });
            APP.addStyleClass('sapUiSizeCompact');

            var PAGE = new sap.m.Page({
                showHeader: false
            });
            APP.addPage(PAGE);

            //== General Information 영역 
            var FORM1 = new sap.ui.layout.form.Form({
                editable: true,
                title: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C66"), // General Infomation
                width: "100%"
            });
            var LAYO1 = new sap.ui.layout.form.ResponsiveGridLayout({
                breakpointL: 1024,
                breakpointM: 600,
                breakpointXL: 1440,
                busyIndicatorDelay: 1000,
                columnsL: 2,
                columnsM: 1,
                columnsXL: 2,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                emptySpanXL: -1,
                labelSpanL: 4,
                labelSpanM: 2,
                labelSpanS: 12,
                labelSpanXL: -1
            });
            FORM1.setLayout(LAYO1);
            PAGE.addContent(FORM1);

            // APP ID 입력 영역 
            var FORM1_CNT1 = new sap.ui.layout.form.FormContainer();
            FORM1.addFormContainer(FORM1_CNT1);
            var FORM1_ELEMENT1 = new sap.ui.layout.form.FormElement();
            FORM1_CNT1.addFormElement(FORM1_ELEMENT1);

            var FORM1_LABEL1 = new sap.m.Label({
                design: "Bold",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C67"), // APP ID
                required: true
            });
            FORM1_ELEMENT1.setLabel(FORM1_LABEL1);

            var FORM1_INPUT1 = new sap.m.Input({
                maxLength: 20,
                showValueHelp: true,
                placeholder: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D09"), // U4A Application ID
                liveChange: (e) => {
                    var Lval = FORM1_INPUT1.getValue();
                    FORM1_INPUT1.setValue(Lval.toUpperCase());
                }
            });
            FORM1_ELEMENT1.addField(FORM1_INPUT1);


            // APP NAME 영역 
            var FORM1_CNT2 = new sap.ui.layout.form.FormContainer();
            FORM1.addFormContainer(FORM1_CNT2);
            var FORM1_ELEMENT2 = new sap.ui.layout.form.FormElement();
            FORM1_CNT2.addFormElement(FORM1_ELEMENT2);

            var FORM1_LABEL2 = new sap.m.Label({
                design: "Bold",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C68"), // APP Name
            });
            FORM1_ELEMENT2.setLabel(FORM1_LABEL2);

            var FORM1_TEXT1 = new sap.m.Text();
            FORM1_ELEMENT2.addField(FORM1_TEXT1);


            // File Name 
            var FORM1_CNT3 = new sap.ui.layout.form.FormContainer();
            FORM1.addFormContainer(FORM1_CNT3);
            var FORM1_ELEMENT3 = new sap.ui.layout.form.FormElement();
            FORM1_CNT3.addFormElement(FORM1_ELEMENT3);

            let sFileNameTxt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C35"); // File Name
            var FORM1_LABEL3 = new sap.m.Label({
                design: "Bold",
                text: sFileNameTxt
            });
            FORM1_ELEMENT3.setLabel(FORM1_LABEL3);

            let sPlace1Txt = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D10"); // Shortcut
            sPlace1Txt += " " + sFileNameTxt; // Shortcut File Name

            var FORM1_INPUT3 = new sap.m.Input({
                placeholder: sPlace1Txt
            });
            FORM1_ELEMENT3.addField(FORM1_INPUT3);


            // Save_As... 영역 
            var FORM1_CNT4 = new sap.ui.layout.form.FormContainer();
            FORM1.addFormContainer(FORM1_CNT4);
            var FORM1_ELEMENT4 = new sap.ui.layout.form.FormElement();
            FORM1_CNT4.addFormElement(FORM1_ELEMENT4);

            var FORM1_LABEL4 = new sap.m.Label({
                design: "Bold",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C69"), // Save As Path
                required: true
            });
            FORM1_ELEMENT4.setLabel(FORM1_LABEL4);

            let sPlace2Txt = sPlace1Txt + " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D11"); // Shortcut Download Path

            var FORM1_INPUT4 = new sap.m.Input({
                valueHelpOnly: true,
                showValueHelp: true,
                placeholder: sPlace2Txt,
                valueHelpRequest: fn_select_Path
            });
            FORM1_INPUT4._mtype = "01";
            FORM1_ELEMENT4.addField(FORM1_INPUT4);


            // Icon Path... 영역
            var FORM1_CNT5 = new sap.ui.layout.form.FormContainer();
            FORM1.addFormContainer(FORM1_CNT5);
            var FORM1_ELEMENT5 = new sap.ui.layout.form.FormElement();
            FORM1_CNT5.addFormElement(FORM1_ELEMENT5);

            var FORM1_LABEL5 = new sap.m.Label({
                design: "Bold",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C70"), // Icon Path
            });
            FORM1_ELEMENT5.setLabel(FORM1_LABEL5);

            let sPlace3Txt = sPlace1Txt + " " + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C70"); // Shortcut Icon Path
            var FORM1_INPUT5 = new sap.m.Input({
                valueHelpOnly: true,
                showValueHelp: true,
                placeholder: sPlace3Txt,
                valueHelpRequest: fn_select_Path
            });
            FORM1_INPUT5._mtype = "02";
            FORM1_ELEMENT5.addField(FORM1_INPUT5);


            //== Target Host URL 영역 
            var FORM2 = new sap.ui.layout.form.Form({
                editable: true,
                title: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C71", "", "", "", ""), // Target Host URL,
                width: "100%"
            });
            var LAYO2 = new sap.ui.layout.form.ResponsiveGridLayout({
                breakpointL: 1024,
                breakpointM: 600,
                breakpointXL: 1440,
                busyIndicatorDelay: 1000,
                columnsL: 2,
                columnsM: 1,
                columnsXL: 2,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                emptySpanXL: -1,
                labelSpanL: 4,
                labelSpanM: 2,
                labelSpanS: 12,
                labelSpanXL: -1
            });
            FORM2.setLayout(LAYO2);
            PAGE.addContent(FORM2);

            var FORM2_CNT1 = new sap.ui.layout.form.FormContainer();
            FORM2.addFormContainer(FORM2_CNT1);

            var FORM2_ELEMENT1 = new sap.ui.layout.form.FormElement();
            FORM2_CNT1.addFormElement(FORM2_ELEMENT1);

            var FORM2_VBOX1 = new sap.m.VBox({
                width: "100%"
            });
            FORM2_ELEMENT1.addField(FORM2_VBOX1);

            var FORM2_HBOX1 = new sap.m.HBox({
                width: "100%"
            });
            FORM2_VBOX1.addItem(FORM2_HBOX1);

            var FORM2_RADIOBUTTONGROUP1 = new sap.m.RadioButtonGroup({
                columns: 2,
                width: "100%",
                select: fn_select_Host
            });
            FORM2_HBOX1.addItem(FORM2_RADIOBUTTONGROUP1);

            var FORM2_RADIOBUTTON1 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C72", "", "", "", ""), // Internal Host URL
            });
            FORM2_RADIOBUTTON1.addStyleClass("sapUiSmallMarginBegin");
            FORM2_RADIOBUTTONGROUP1.addButton(FORM2_RADIOBUTTON1);

            var FORM2_RADIOBUTTON2 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C73", "", "", "", ""), // External Host URL
            });
            FORM2_RADIOBUTTON2.addStyleClass("sapUiSmallMarginBegin");
            FORM2_RADIOBUTTONGROUP1.addButton(FORM2_RADIOBUTTON2);

            var FORM2_INPUT1 = new sap.m.Input({
                enabled: false,
                value: "",
                placeholder: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "D13", "", "", "", ""), // Host or Domain
            });
            FORM2_VBOX1.addItem(FORM2_INPUT1);


            //== Browser Type 영역 
            var FORM3 = new sap.ui.layout.form.Form({
                editable: true,
                title: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C74", "", "", "", ""), // Browser Type
                width: "100%"
            });
            var LAYO3 = new sap.ui.layout.form.ResponsiveGridLayout({
                breakpointL: 1024,
                breakpointM: 600,
                breakpointXL: 1440,
                busyIndicatorDelay: 1000,
                columnsL: 2,
                columnsM: 1,
                columnsXL: 2,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                emptySpanXL: -1,
                labelSpanL: 4,
                labelSpanM: 2,
                labelSpanS: 12,
                labelSpanXL: -1
            });
            FORM3.setLayout(LAYO3);
            PAGE.addContent(FORM3);

            var FORM3_CNT1 = new sap.ui.layout.form.FormContainer();
            FORM3.addFormContainer(FORM3_CNT1);

            var FORM3_ELEMENT1 = new sap.ui.layout.form.FormElement();
            FORM3_CNT1.addFormElement(FORM3_ELEMENT1);

            var FORM3_HBOX1 = new sap.m.HBox({
                width: "100%"
            });
            FORM3_ELEMENT1.addField(FORM3_HBOX1);

            var FORM3_RADIOBUTTONGROUP1 = new sap.m.RadioButtonGroup({
                columns: 2,
                width: "100%",
                select: fn_select_BROWSER
            });
            FORM3_HBOX1.addItem(FORM3_RADIOBUTTONGROUP1);

            var FORM3_RADIOBUTTON1 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C75", "", "", "", ""), // Chrome Browser
                visible: false
            });
            FORM3_RADIOBUTTON1.addStyleClass("sapUiSmallMarginBegin");
            FORM3_RADIOBUTTONGROUP1.addButton(FORM3_RADIOBUTTON1);

            var FORM3_RADIOBUTTON2 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C76", "", "", "", ""), // IE edge Browser
                visible: false
            });
            FORM3_RADIOBUTTON2.addStyleClass("sapUiSmallMarginBegin");
            FORM3_RADIOBUTTONGROUP1.addButton(FORM3_RADIOBUTTON2);

            let sTitle = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C77", "", "", "", ""); // Browser Option
            sTitle += "(" + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C75", "", "", "", "") + ")"; // Chrome Browser

            //== Browser Option - Chrome 영역 
            var FORM4 = new sap.ui.layout.form.Form({
                editable: true,
                title: sTitle,
                width: "100%",
                visible: false
            });
            var LAYO4 = new sap.ui.layout.form.ResponsiveGridLayout({
                breakpointL: 1024,
                breakpointM: 600,
                breakpointXL: 1440,
                busyIndicatorDelay: 1000,
                columnsL: 2,
                columnsM: 1,
                columnsXL: 2,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                emptySpanXL: -1,
                labelSpanL: 4,
                labelSpanM: 2,
                labelSpanS: 12,
                labelSpanXL: -1
            });
            FORM4.setLayout(LAYO4);
            PAGE.addContent(FORM4);

            var FORM4_CNT1 = new sap.ui.layout.form.FormContainer();
            FORM4.addFormContainer(FORM4_CNT1);

            var FORM4_ELEMENT1 = new sap.ui.layout.form.FormElement();
            FORM4_CNT1.addFormElement(FORM4_ELEMENT1);

            var FORM4_VBOX1 = new sap.m.VBox({
                width: "100%"
            });
            FORM4_ELEMENT1.addField(FORM4_VBOX1);

            var FORM4_HBOX1 = new sap.m.HBox({
                width: "100%"
            });
            FORM4_VBOX1.addItem(FORM4_HBOX1);

            var FORM4_RADIOBUTTONGROUP1 = new sap.m.RadioButtonGroup({
                columns: 3,
                width: "100%"
            });
            FORM4_HBOX1.addItem(FORM4_RADIOBUTTONGROUP1);

            var FORM4_RADIOBUTTON1 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C78", "", "", "", ""), // App Mode
            });
            FORM4_RADIOBUTTON1.addStyleClass("sapUiSmallMarginBegin");
            FORM4_RADIOBUTTONGROUP1.addButton(FORM4_RADIOBUTTON1);

            var FORM4_RADIOBUTTON2 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C79", "", "", "", ""), // Full Screen Mode
            });
            FORM4_RADIOBUTTON2.addStyleClass("sapUiSmallMarginBegin");
            FORM4_RADIOBUTTONGROUP1.addButton(FORM4_RADIOBUTTON2);

            var FORM4_RADIOBUTTON3 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C80", "", "", "", ""), // Kiosk Mode
            });
            FORM4_RADIOBUTTON3.addStyleClass("sapUiSmallMarginBegin");
            FORM4_RADIOBUTTONGROUP1.addButton(FORM4_RADIOBUTTON3);


            var FORM4_HBOX2 = new sap.m.HBox({
                width: "100%"
            });
            FORM4_VBOX1.addItem(FORM4_HBOX2);

            var FORM4_CHECKBOX1 = new sap.m.CheckBox({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C81", "", "", "", ""), // Displble Translate Mode
            });
            FORM4_CHECKBOX1.addStyleClass("sapUiTinyMarginBegin");
            FORM4_HBOX2.addItem(FORM4_CHECKBOX1);

            var FORM4_CHECKBOX2 = new sap.m.CheckBox({
                text: oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C82", "", "", "", ""), // Secret Mode
            });
            FORM4_CHECKBOX2.addStyleClass("sapUiTinyMarginBegin");
            FORM4_HBOX2.addItem(FORM4_CHECKBOX2);

            let sTitle1 = oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C77", "", "", "", ""); // Browser Option
            sTitle1 += "(" + oAPP.common.fnGetMsgClsText("/U4A/CL_WS_COMMON", "C76", "", "", "", "") + ")"; // IE edge Browser

            //== Browser Option - IE edge 영역 
            var FORM5 = new sap.ui.layout.form.Form({
                editable: true,
                title: sTitle1,
                width: "100%",
                visible: false
            });
            var LAYO5 = new sap.ui.layout.form.ResponsiveGridLayout({
                breakpointL: 1024,
                breakpointM: 600,
                breakpointXL: 1440,
                busyIndicatorDelay: 1000,
                columnsL: 2,
                columnsM: 1,
                columnsXL: 2,
                emptySpanL: 0,
                emptySpanM: 0,
                emptySpanS: 0,
                emptySpanXL: -1,
                labelSpanL: 4,
                labelSpanM: 2,
                labelSpanS: 12,
                labelSpanXL: -1
            });
            FORM5.setLayout(LAYO5);
            PAGE.addContent(FORM5);

            var FORM5_CNT1 = new sap.ui.layout.form.FormContainer();
            FORM5.addFormContainer(FORM5_CNT1);

            var FORM5_ELEMENT1 = new sap.ui.layout.form.FormElement();
            FORM5_CNT1.addFormElement(FORM5_ELEMENT1);

            var FORM5_VBOX1 = new sap.m.VBox({
                width: "100%"
            });
            FORM5_ELEMENT1.addField(FORM5_VBOX1);

            var FORM5_HBOX1 = new sap.m.HBox({
                width: "100%"
            });
            FORM5_VBOX1.addItem(FORM5_HBOX1);

            var FORM5_RADIOBUTTONGROUP1 = new sap.m.RadioButtonGroup({
                columns: 2,
                width: "100%"
            });
            FORM5_HBOX1.addItem(FORM5_RADIOBUTTONGROUP1);

            var FORM5_RADIOBUTTON1 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: "App Mode"
            });
            FORM5_RADIOBUTTON1.addStyleClass("sapUiSmallMarginBegin");
            FORM5_RADIOBUTTONGROUP1.addButton(FORM5_RADIOBUTTON1);

            var FORM5_RADIOBUTTON2 = new sap.m.RadioButton({
                groupName: "sapMRbDefaultGroup",
                text: "Normal Mode"
            });
            FORM5_RADIOBUTTON2.addStyleClass("sapUiSmallMarginBegin");
            FORM5_RADIOBUTTONGROUP1.addButton(FORM5_RADIOBUTTON2);


            //== Additional Parameter(Optional)    
            var PANEL1 = new sap.m.Panel({
                headerText: "Additional Parameter(Optional)"
            });
            PAGE.addContent(PANEL1);

            var PANEL1_TABLE = new sap.m.Table({
                mode: "MultiSelect"
            });
            PANEL1.addContent(PANEL1_TABLE);

            var PANEL1_TOOL = new sap.m.Toolbar();
            PANEL1_TABLE.setHeaderToolbar(PANEL1_TOOL);

            //라인 추가 버튼 
            PANEL1_TOOL.addContent(new sap.m.Button({
                icon: "sap-icon://add",
                type: "Accept",
                press: (e) => {
                    var oModel = PANEL1_TABLE.getModel();
                    var sdata = {
                        NAME: "",
                        VALUE: "",
                        SEL: false,
                        STATE: "None"
                    };

                    if (typeof oModel.oData.PARAMS === "undefined") {
                        oModel.oData.PARAMS = [];
                    }

                    oModel.oData.PARAMS.push(sdata);
                    oData.model.refresh(true);
                    PAGE.scrollTo(30000, 300);
                }
            }));

            //라인 삭제 
            PANEL1_TOOL.addContent(new sap.m.Button({
                icon: "sap-icon://less",
                type: "Reject",
                press: (e) => {

                    var T_lines = PANEL1_TABLE.getSelectedItems();

                    if (T_lines.length == 0) {
                        sap.m.MessageToast.show('Please select a line');
                        return;
                    }

                    var l_model = PANEL1_TABLE.getModel();
                    var lt_tmp = l_model.oData.PARAMS.filter(a => a.SEL === false);
                    l_model.oData.PARAMS = lt_tmp;
                    l_model.refresh(true);

                }
            }));

            PANEL1_TABLE.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    design: "Bold",
                    text: "Name"
                }),
                width: "200px"
            }));
            PANEL1_TABLE.addColumn(new sap.m.Column({
                header: new sap.m.Label({
                    design: "Bold",
                    text: "Value"
                })
            }));

            var PANEL1_ITEM = new sap.m.ColumnListItem({
                selected: "{SEL}"
            });
            PANEL1_ITEM.addCell(new sap.m.Input({
                value: "{NAME}",
                valueState: "{STATE}"
            }));
            PANEL1_ITEM.addCell(new sap.m.Input({
                value: "{VALUE}"
            }));

            PANEL1_TABLE.bindAggregation("items", {
                path: "/PARAMS",
                template: PANEL1_ITEM
            });


            //== Footer 영역 
            var BAR1 = new sap.m.Bar({});
            PAGE.setFooter(BAR1);

            var BAR1_BUTTON1 = new sap.m.Button({
                icon: "sap-icon://save",
                text: "Save ShortCut",
                type: "Emphasized",
                press: fn_CreateShortcut
            });
            BAR1.addContentRight(BAR1_BUTTON1);

            var BAR1_BUTTON2 = new sap.m.Button({
                icon: "sap-icon://cancel",
                text: "Cancel",
                type: "Reject",
                press: fn_close
            });
            BAR1.addContentRight(BAR1_BUTTON2);



            APP.placeAt("content", "only");









            /*====  TEST JS =============================================================== */

            /*
            crtSHOTCUT_IE:(para)=>{

                const {shell} = oAPP.remote.require('electron');
                
                var shortcut = "D:\\shotcut\\SHHONG_edge.lnk";

                oAPP.fs.unlink(shortcut, (err) => {

                        var ImgUrl = "D:\\shotcut\\_123034.ico";

                        //let TargetURL = "C:\\Users\\shhong\\AppData\\Local\\Programs\\com.u4a_ts.app\\u4a_ts.exe";
                  
                        var  TargetURL = oAPP.IE_path;

                        var T_param = "--app=http://u4ahana.u4ainfo.com:8000/zu4a/zeu4_1772_00472?sap-client=800&sap-language=EN";
                        var T_param = "--app=http://u4ahana.u4ainfo.com:8000/zu4a/zeu4_1772_00472?sap-client=800&sap-language=EN";

                        if(typeof para !== "undefined"){
                            T_param = para;

                        }



                        var Ldesc = "안녕하세요";

                        let res = shell.writeShortcutLink(shortcut, "create",{
                            //options
                            target: TargetURL,
                            args: T_param,
                            description: Ldesc,
                            //appUserModelId: process.execPath,
                            icon: ImgUrl,
                            iconIndex: 0
                        });

                });



            },    

            */