/********************************************************************
 *📝 Test84.js
    내역 : 위자드를 통한 웹딘 컨버전 테스트.
********************************************************************/
oAPP.fn.fnWS20Test84 = function(){

    function lf_callback(oReturn) {
        _oDialog.close();
        
    }


    var _oContr = undefined;

    var _oDialog = new sap.m.Dialog({
        busyIndicatorDelay: 0,
        busy : true,
        resizable : true,
        draggable : true,
        contentHeight: "70%",
        contentWidth: "40%",
        customHeader : new sap.m.Bar({
            contentMiddle : [
                new sap.m.Title({
                    text : "Webdynpro Coversion"
                })
            ],
            contentRight:[
                new sap.m.Button({
                    icon:"sap-icon://decline",
                    type : "Negative",
                    press : function(){
                        _oDialog.close();
                    }
                })
            ]
        }),
        buttons : [
            new sap.m.Button({
                icon:"sap-icon://document",
                type : "Emphasized",
                text : "Create",
                press : function(){

                    var _sParam = {};
                    _sParam.ACTCD   = "WIZARD_CONV";

                    _sParam.f_callback = lf_callback;

                    var _oCEvt = new CustomEvent('conversionWebdynpro', { detail: _sParam });
                    
                    _oContr.onEvt.dispatchEvent(_oCEvt);

                }
            }),
            new sap.m.Button({
                icon:"sap-icon://decline",
                type : "Negative",
                text : "Close",
                press : function(){
                    _oDialog.close();
                }
            })
        ], 
        afterOpen: async function(){

            var _path = parent.PATH.join(parent.getPath("WS10_20_ROOT"), "design", 
            "createApplication", "conversionWebdynpro", "main", "view.js");
            
            var _oView = await import(_path);

            //웹딘 -> U4A 컨버전 view 정보 생성.
            _oContr = await _oView.createView({PRCCD:"CREATE_WIZARD"});

            
            _oDialog.addContent(_oContr.ui.ROOT);

            _oDialog.setBusy(false);


        },

        afterClose: function(){

            _oDialog.destroy();

            _oContr = undefined;

        }

    }).addStyleClass("sapUiSizeCompact");


    _oDialog.open();

};