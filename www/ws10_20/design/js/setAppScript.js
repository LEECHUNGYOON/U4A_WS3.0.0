(function(){
	
	//application의 정보를 script로 구성.
	oAPP.fn.setAppScript = function(it_0014, it_0015){
		
		//TREE 정보로 변환 처리.
		function lf_setTreeData(it_data, parent, child){
			
			var lt_copy = JSON.parse(JSON.stringify(it_data));

			for (var e, h, u, a = [], c = {}, o = 0, f = lt_copy.length; f > o; o++){

				e = lt_copy[o];

				h = e[child];

				u = e[parent] || 0;

				c[h] = c[h] || [];

				e["child"] = c[h];

				0 != u ? (c[u] = c[u] || [], c[u].push(e)) : a.push(e);
			}
			
			return a;
			
		}	//TREE 정보로 변환 처리.
		
		
		
		
		//프로퍼티 값 구성시 쌍따옴표 적용 여부.
		function lf_setDoubleQuotation(UIADT){
			
			if(UIADT === "boolean"){return "";}
			if(UIADT === "int"){return "";}
			if(UIADT === "float"){return "";}
			
			return '"';
			
		}	//프로퍼티 값 구성시 쌍따옴표 적용 여부.
		
		
		
		
		//SCRIPT 구성 SKIP 여부.
		function lf_isSkip0014(is_tree){
			
			//ROOT는 SCRIPT 구성 SKIP.
			if(is_tree.OBJID === "ROOT"){return true;}
			
			//EXTENSION UI인경우 구성 SKIP.
			if(is_tree.ISEXT === "X"){return true;}
			
			//EXCEPTION UI인경우 구성 SKIP.
			if(is_tree.ISECP === "X"){return true;}		
			
		}	//SCRIPT 구성 SKIP 여부.
		
		
		
		
		//프로퍼티 정보 구성.
		function lf_setProp(OBJID){
			
			//현재 UI의 변경한 프로퍼티 정보 발췌.
			var lt_0015 = it_0015.filter( a => a.OBJID === OBJID && a.UIATY === "1" && a.ISBND === "" && a.UIATK.substr(0,2) === "AT" );
			
			//변경한 프로퍼티 정보가 없다면 exit.
			if(lt_0015.length === 0){return "";}
			
			var l_prop = "";
			var l_sep = "";	
			
			
			//프로퍼티명:"값", 프로퍼티명:값, ... 형식으로 구성.
			for(var i=0, l=lt_0015.length; i<l; i++){
				
				//상따옴표 적용 여부.
				var l_doqu = lf_setDoubleQuotation(lt_0015[i].UIADT);
				
				//값이 없다면 프로퍼티 구성 skip.
				if(lt_0015[i].UIATV === ""){continue;}

				l_prop += l_sep + lt_0015[i].UIATT + ":" + l_doqu + lt_0015[i].UIATV + l_doqu;
				
				if(l_sep === ""){
					l_sep = ",";
				}
				
			}
			
			//구성한 프로퍼티 정보 return.
			return "{" + l_prop + "}";
			
			
		}	//프로퍼티 정보 구성.
		
		
		
		
		//부모에 추가 script 구성.
		function lf_setParent(is_tree, is_parent){
			
			//skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}
			
			//EMBED Aggregation 정보 얻기.
			var l_parent = it_0015.find( a => a.OBJID === is_tree.OBJID && a.UIATY === "6" );
			
			//EMBED Aggregation 정보가 없는경우(최상위인경우)
			if(!l_parent){
				//Content에 추가하는 스크립트 구성.
				return is_tree.OBJID + '.placeAt("Content");';
			}
			
			
			var l_aggrnm = lf_setAggrFuncName(is_tree, is_parent);
			
			if(l_aggrnm){
				return is_tree.POBID + "." + l_aggrnm + "(" + is_tree.OBJID + ");";
			}
			
			//default 0:1 aggregation.
			var l_prefix = "set";
			
			//0:N건 입력 가능한 aggregation인경우.
			if(is_tree.ISMLB === "X"){			
				l_prefix = "add";
				
			}
			
			//PARENT.addAggregation("aggregation명", UI); 형식의 script return.
			return is_tree.POBID + "." + l_prefix + 'Aggregation("' + is_tree.UIATT + '",' + is_tree.OBJID + ");";
					
			
		}	//부모에 추가 script 구성.

		
		
		//UI 생성 SCRIPT 구성.
		function lf_createUIInstance(is_tree){
			
			//skip 대상건인경우 exit.
			if(lf_isSkip0014(is_tree) === true){return "";}
			
			//프로퍼티 정보 구성.
			var l_prop = lf_setProp(is_tree.OBJID);
			
			//UI instance 생성 script 구성(var BUTTON1 = new sap.m.Button({text:"test"}); 형식의 script)
			return "var " + is_tree.OBJID + " = new " + is_tree.UILIB + "(" + l_prop + ");";
			
		}	//UI 생성 SCRIPT 구성.
		
		
		
			
		//부모ui의 aggregation
		function lf_setAggrFuncName(is_tree, is_parent){
			
			jQuery.sap.require(is_parent.UILIB);
			
			var l_meta;
			
			try{
				
				eval("l_meta = " + is_parent.UILIB + ".getMetadata();");
				
			}catch(e){
				return;
			}
			
			if(!l_meta){return;}
			
			var l_aggr = l_meta.getAggregation(is_tree.UIATT);
			
			if(!l_aggr){return;}

			return l_aggr._sMutator;
			
		}
		
		
		
		
		//tree를 하위 탐색하며 script 정보 구성.
		function lf_setUIScript(it_tree, is_parent){
			
			var l_script = "";
			
			for(var i=0, l=it_tree.length; i<l; i++){
							
				//UI instance 생성 script 구성.
				l_script += lf_createUIInstance(it_tree[i]) + C_NEWLINE;
				
				//CHILD 정보의 UI INSTANCE 생성 SCRIPT 구성.
				var l_child = lf_setUIScript(it_tree[i].child, it_tree[i]);
				
				if(l_child !== ""){
					l_child = C_NEWLINE + l_child;
				}
				
				l_script += l_child;
				
				//부모 UI에 추가 처리.
				l_script += lf_setParent(it_tree[i], is_parent) + C_NEWLINE + C_NEWLINE;
				
			}
			
			
			//구성한 script 정보 return.
			return l_script;	
			
			
		}	//tree를 하위 탐색하며 script 정보 구성.
		
		
		
		//loadLibrary 처리 script 구성.
		function lf_getLoadLibrary(){
			
			var lt_lib = [];
			
			var l_lib = "";
			
			for(var i=0, l=it_0014.length; i<l; i++){
				
				//skip 대상건인경우 수집 안함.
				if(lf_isSkip0014(it_0014[i]) === true){continue;}
				
				//라이브러리명에 값이 없으면 skip.
				if(it_0014[i].TGLIB === ""){continue;}
					
				if(lt_lib.findIndex( a => a === it_0014[i].TGLIB ) === -1){
					lt_lib.push(it_0014[i].TGLIB);
					
					l_lib += 'sap.ui.getCore().loadLibrary("' + it_0014[i].TGLIB + '");' + C_NEWLINE;
					
				}
				
			}
			
			//sap.ui.getCore().loadLibrary("sap.m"); 형식의 script 구성.
			return l_lib;
			
		}	//loadLibrary 처리 script 구성.
		
		
		const C_NEWLINE = "\n"
		
		//입력 APPLICATION의 UI정보를 TREE 형식으로 변환.
		var lt_tree = lf_setTreeData(it_0014, "POBID", "OBJID");
		
			
		//TREE 형식의 UI정보를 토대로 하위를 탐색하며 SCRIPT 구성.
		return lf_getLoadLibrary() + lf_setUIScript(lt_tree);
		
	};	//application의 정보를 script로 구성.

})();