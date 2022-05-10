//=====================================================================================//
//
//=====================================================================================//


(function(oCTNR){	

	//테마 미리보기 URL 경로 구성 
	function Lfn_PriviewURL(theme){

		var Lurl = oAPP.path.join(oAPP.__dirname, '/img/' + theme + '.png');
    
		return Lurl;

	}

	jQuery.sap.require('sap.ui.layout.form.SimpleForm');


    // Theme Name 
	var Ltheme = oAPP.IF_DATA.THEME_INFO.THEME;
	
	var page = new sap.m.Page({ 
		                        showHeader:true,
								busyIndicatorDelay:1,
								busy:false,
								title:"Theme Selection", 
								enableScrolling:false
							});

	var oSform = new sap.ui.layout.form.SimpleForm({ editable:true });

	var oLB = new sap.m.Label({ design:"Bold", text:"Select Theme" });
		oSform.addContent(oLB);

	var oSelect = new sap.m.Select({ selectedKey:Ltheme });

		oSelect.addItem(new sap.ui.core.Item({key:"sap_belize_plus", text:"sap_belize_plus"  }));
		oSelect.addItem(new sap.ui.core.Item({key:"sap_horizon_dark", text:"sap_horizon_dark"  }));
		oSelect.addItem(new sap.ui.core.Item({key:"sap_horizon", text:"sap_horizon"  }));
		oSelect.addItem(new sap.ui.core.Item({key:"sap_belize", text:"sap_belize"  }));

		oSelect.attachChange((e)=>{

			var Lkey = e.oSource.getSelectedKey();

			oImg.setSrc(Lfn_PriviewURL(Lkey));
		
		});


		oSform.addContent(oSelect);


	//미리보기 테마 영역 생성 
	var oPriview = new sap.m.HBox({ width:"100%", height:"100%", alignContent:"Center", justifyContent:"Center", alignItems:"Center"  });

	var oImg = new sap.m.Image({ src:Lfn_PriviewURL(Ltheme), width:"500px" });

		oImg.addStyleClass("sapUiSmallMargin");

		oPriview.addItem(oImg);


	//하단 영역 
	var oBar = new sap.m.Bar();


	//경고 문구 
	var oTxt1 = new sap.m.Text({text:"The theme is applied after re-running."});
	oTxt1.addStyleClass("sapUiTinyMarginBegin cl_theme_notice_text");
	oBar.addContentLeft(oTxt1);

		
	//테마 등록저장 버튼 생성 
	var oBut = new sap.m.Button({ text:"Apply", 
	        					  type:"Emphasized",
								  icon:"sap-icon://accept",
								  press:function(e){

									page.setBusy(true);

									var sData = {};
										sData.THEME = oSelect.getSelectedKey();
										sData.BGCOL = "";	

									switch (sData.THEME) {
										case "sap_belize_plus":
											sData.BGCOL = "#2f3c48";	

											break;

										case "sap_horizon_dark":
											sData.BGCOL = "#12171c";	

											break;

										case "sap_horizon":
											sData.BGCOL = "#fff";	

											break;

										case "sap_belize":
											sData.BGCOL = "#4d6377";	

											break;

										default:
											break;

									}


									var Lfname = oAPP.IF_DATA.SYSID + ".json",
										Lpath  = oAPP.path.join(oAPP.USERDATA_PATH,  "p13n", "theme", Lfname);

									var SaveData = JSON.stringify(sData);

									oAPP.fs.writeFileSync(Lpath, SaveData, 'utf-8', function(err){

											page.setBusy(false);

											sap.m.MessageBox.error(err.toString(), {onClose:(e)=>{ 
												
												
											}});
										
										return;

									});

									page.setBusy(false);

									sap.m.MessageToast.show("complete", { duration: 10000 });



								  }

								});
		
		oBar.addContentRight(oBut);

		page.setFooter(oBar);

		page.addContent(oSform);

		page.addContent(oPriview);
	
		oCTNR.addPage(page);

	
})(oUI5.NVCNT);