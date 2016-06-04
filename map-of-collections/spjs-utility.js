/***********************************************************************************
 * Created by Alexander Bautz
 * alexander.bautz@gmail.com
 * http://sharepointjavascript.wordpress.com
 * Copyright (c) 2009-2016 Alexander Bautz (Licensed under the MIT X11 License)
************************************************************************************/

/*
JSLint
var $, GetUrlKeyValue, _spPageContextInfo, SP, window, setTimeout, parent, L_Menu_BaseUrl, L_Menu_LCID, alert, fields, ExecuteOrDelayUntilScriptLoaded,
SPClientPeoplePicker, document, browseris, IsAccessibilityFeatureEnabled, Microsoft, unescape, location;
*/

/* SP2013 */
if(typeof _spPageContextInfo !== "undefined"){
	if(_spPageContextInfo.webUIVersion === 15){
		var L_Menu_BaseUrl = _spPageContextInfo.webServerRelativeUrl !== "/" ? _spPageContextInfo.webServerRelativeUrl : "";
		var L_Menu_LCID = String(_spPageContextInfo.currentLanguage);
	}
}

var spjs = spjs || {};
// The file assetpickers.js in SP365 overwrites the $ namespace.
spjs.$ = spjs.$ || $;

spjs.utility = {
	"version":1.262,
	"vDispName":"1.262",
	"versionDate":"April 05, 2016",
	"data":{
		"fields":null,
		"fieldType":{},
		"formLoaded":new Date().valueOf()
	},
	"resizeDlg":function(){
		if(GetUrlKeyValue('IsDlg')!=='1' || typeof _spPageContextInfo === "undefined"){
			return;
		}
		var dlg, scroll, dlgWin, css, iH, rH, s4Height;
		if(_spPageContextInfo.webUIVersion === 15){
			dlg = SP.UI.ModalDialog.get_childDialog();
			scroll = spjs.$("#s4-workspace").scrollTop();
			dlgWin = spjs.$(".ms-dlgContent", window.parent.document);
			css = {};
			if(dlg !== null && !dlg.get_isMaximized()){
				dlg.autoSize();
				css.top = (spjs.$(window.top).height() / 2 - dlgWin.height() / 2) + "px";
				dlgWin.css({"top":css.top});
				// Reapply scroll
				spjs.$("#s4-workspace").scrollTop(scroll);
			}
		}else{
			dlg = SP.UI.ModalDialog.get_childDialog();
			scroll = spjs.$("#s4-workspace").scrollTop();
			if(dlg !== null && !dlg.$S_0 && dlg.get_$Z_0()){
				setTimeout(function(){
					dlg.$T_0 = (spjs.$(parent.window).width() / 2) - (dlg.$B_0 / 2);
					dlg.$U_0 = (spjs.$(parent.window).height() / 2) - (dlg.$A_0 / 2);
					dlg.$m_0(dlg.$T_0, dlg.$U_0);
					dlg.autoSize();
					dlg.$2B_0();
					// Fix missig scrollbar
					iH = spjs.$(parent.document).find("#"+dlg.$0_0.id).height();
					rH = spjs.$("#s4-ribbonrow").height();
					s4Height = iH-rH;
					if(s4Height < 300){
						s4Height = 300;
					}
					spjs.$("#s4-workspace").css("height",s4Height);
					// Fix missig scrollbar
					spjs.$("#s4-workspace").scrollTop(scroll);
				},150);
			}
		}
	},
	"setDlgTitle":function(str){
		try{
			var a = $(parent.document).find("*[id='dialogTitleSpan']:last");
			SP.UI.UIUtility.setInnerText(a[0],str);
		}catch(ignore){
			// Nothing
		}
	},
	"addList":function(listName,listBaseUrl,listDescription){
		var c, r;
		c = [];
		c.push("<AddList xmlns='http://schemas.microsoft.com/sharepoint/soap/'>");
		c.push("<listName>"+listName+"</listName>");
		c.push("<description>"+listDescription+"</description>");
		c.push("<templateID>100</templateID>");
		c.push("</AddList>");
		r = {success:false};
		spjs.utility.wrapSoap(listBaseUrl+"/_vti_bin/lists.asmx","http://schemas.microsoft.com/sharepoint/soap/AddList",c.join(''),function(data){
			if(spjs.$(data).find('ErrorText').length>0) {
				r.errorText = spjs.$(data).find('ErrorText').text();
				r.errorCode = spjs.$(data).find('ErrorCode').text();
			}else{
				r.success=true;
				r.id = spjs.$(data).find('List').attr('ID');
			}
		});
		return r;
	},
	"updateList":function(listName,listBaseUrl,newFieldsObjArr,updFieldsObjArr,deleteFieldsArr){
		var nb, ub, db, mi, c, cb, fb, r, addToView;
		nb = [];
		ub = [];
		db = [];
		mi = 1;
		spjs.$.each(newFieldsObjArr,function(i,obj){
			c = '';
			fb = [];
			addToView = false;
			spjs.$.each(obj,function(p,v){
				if(p==='content'){
					c = v;
				}else{
					if(p === 'AddToView'){
						addToView = true;
					}else{
						fb.push(" "+p+"=\""+v+"\"");
					}
				}
			});
			nb.push("<Method ID='"+mi+"'");
				if(addToView){
					nb.push(" AddToView=''");
				}
			nb.push("><Field "+fb.join(''));
			if(c===''){
				nb.push(" /></Method>");
			}else{
				nb.push(">"+c+"</Field></Method>");
			}
			mi+=1;
		});
		spjs.$.each(updFieldsObjArr,function(i,obj){
			c = '';
			fb = [];
			addToView = false;
			spjs.$.each(obj,function(p,v){
				if(p==='content'){
					c = v;
				}else{
					if(p === 'AddToView'){
						addToView = true;
					}else{
						fb.push(" "+p+"=\""+v+"\"");
					}
				}
			});
			ub.push("<Method ID='"+String(mi)+"'");
				if(addToView){
					ub.push(" AddToView=''");
				}

			ub.push("><Field "+fb.join(''));
			if(c===''){
				ub.push(" /></Method>");
			}else{
				ub.push(">"+c+"</Field></Method>");
			}
			mi+=1;
		});
		if(deleteFieldsArr !== undefined){
			spjs.$.each(deleteFieldsArr,function(i,fin){
				db.push("<Method ID='"+mi+"'><Field Name=\""+fin+"\" /></Method>");
				mi+=1;
			});
		}
		cb = [];
		cb.push("<UpdateList xmlns='http://schemas.microsoft.com/sharepoint/soap/'>");
		cb.push("<listName>"+listName+"</listName>");
		if(nb.length>0){
			cb.push("<newFields>");
			cb.push("<Fields>");
			cb.push(nb.join(''));
			cb.push("</Fields>");
			cb.push("</newFields>");
		}
		if(ub.length>0){
			cb.push("<updateFields>");
			cb.push("<Fields>");
			cb.push(ub.join(''));
			cb.push("</Fields>");
			cb.push("</updateFields>");
		}
		if(db.length>0){
			cb.push("<deleteFields>");
			cb.push("<Fields>");
			cb.push(db.join(''));
			cb.push("</Fields>");
			cb.push("</deleteFields>");
		}
		cb.push("</UpdateList>");
		r = {success:false};
		spjs.utility.wrapSoap(listBaseUrl+"/_vti_bin/lists.asmx","http://schemas.microsoft.com/sharepoint/soap/UpdateList",cb.join(''),function(data){
			if(spjs.$(data).find('ErrorText').length>0) {
				r.errorText = spjs.$(data).find('ErrorText').text();
				r.errorCode = spjs.$(data).find('ErrorCode').text();
			}else{
				r.success=true;
			}
		});
		return r;
	},
	"userInfo":function(loginOrUserID,customProp){
		var arrOfFields, query, res, result, item;
		result = {success:false};
		arrOfFields = ['ID', 'Name', 'Title', 'EMail', 'Department', 'JobTitle', 'Notes', 'Picture', 'IsSiteAdmin', 'Created', 'Author', 'Modified', 'Editor', 'SipAddress'];
		if(customProp !== undefined){
			if(spjs.$.isArray(customProp)){
				spjs.$.each(customProp,function(i,p){
					arrOfFields.push(p);
				});
			}else{
				arrOfFields.push(customProp);
			}
		}
		if(String(parseInt(loginOrUserID,10))===String(loginOrUserID)){
			query = "<Where><Eq><FieldRef Name='ID' /><Value Type='Integer'>" + loginOrUserID + "</Value></Eq></Where>";
		}else{
			query = "<Where><Eq><FieldRef Name='Name' /><Value Type='Text'>" + loginOrUserID + "</Value></Eq></Where>";
		}
		res = spjs.utility.queryItems({'listName':'UserInfo','listBaseUrl':L_Menu_BaseUrl,'query':query,'viewFields':arrOfFields,setRequestHeader:false});
	    if(res.count>0){
	    	result.success=true;
	    	item = res.items[0];
		    spjs.$.each(arrOfFields,function(i,fin){
		    	result[arrOfFields[i]] = item[arrOfFields[i]];
		    });
	       	return result;
	    }else{
	       result.success = false;
	       return result;
		}
	},
	"userProfile":function(a){
		if(a === undefined){
			a = "";
		}
		var r = "The user profile is not accessible.";
		spjs.utility.wrapSoap((L_Menu_BaseUrl !== "/" ? L_Menu_BaseUrl : "")+'/_vti_bin/userprofileservice.asmx','http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserProfileByName','<GetUserProfileByName xmlns="http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"><AccountName>'+a+'</AccountName></GetUserProfileByName>',function(data){
			r = {};
			$(data).find('PropertyData').each(function(){
				r[$(this).find('Name').text()] = $(this).find('Value').text();
			});
		});
		return r;
	},
	"getItemByID":function(argObj){
		if(String(parseInt(String(argObj.id),10)) !== String(argObj.id)){
			return null;
		}
		var query, qRes;
		query = "<Where><Eq><FieldRef Name='ID' /><Value Type='Text'>"+argObj.id+"</Value></Eq></Where>";
		qRes = spjs.utility.queryItems({'listName':argObj.listName,'listBaseUrl':argObj.listBaseUrl,'query':query,'viewFields':argObj.viewFields,'scope':argObj.scope});
		if(qRes.count===0){
			return null;
		}else{
			return qRes.items[0];
		}
	},
	"queryItems":function(argObj){
		var content, result, requestHeader, currID, fieldValObj, value;
		if(argObj.listBaseUrl===undefined){
			argObj.listBaseUrl=L_Menu_BaseUrl;
		}
		if(argObj.listName===undefined || (argObj.query===undefined && argObj.viewName===undefined)){
			alert("[spjs.utility.queryItems]\n\nMissing parameters!\n\nYou must provide a minimum of \"listName\", \"query\" or \"viewName\" and \"viewFields\".");
			return;
		}
		if(spjs.$.inArray('ID',argObj.viewFields)===-1){
			argObj.viewFields.push('ID');
		}
		content = spjs.utility.wrapQuery({'listName':argObj.listName, 'query':argObj.query, 'folder':argObj.folder, 'viewName':argObj.viewName, 'viewFields':argObj.viewFields, 'rowLimit':argObj.rowLimit, 'pagingInfo':argObj.pagingInfo,'scope':argObj.scope});
		result = {'count':-1, 'nextPagingInfo':'', items:[]};
		if(argObj.setRequestHeader===false){
			requestHeader  = '';
		}else{
			requestHeader  = 'http://schemas.microsoft.com/sharepoint/soap/GetListItems';
		}
		spjs.utility.wrapSoap(argObj.listBaseUrl + '/_vti_bin/lists.asmx',requestHeader, content, function(data){
			result.count = parseInt(spjs.$(data).filterNode("rs:data").attr('ItemCount'),10);
			result.nextPagingInfo = spjs.$(data).filterNode("rs:data").attr('ListItemCollectionPositionNext');
			fieldValObj = {};
			spjs.$(data).filterNode('z:row').each(function(idx, itemData){
				currID = spjs.$(itemData).attr('ows_ID');
				fieldValObj[currID] = {};
				spjs.$.each(argObj.viewFields,function(i,field){
					value = spjs.$(itemData).attr('ows_' + field);
					if(value === undefined){
						value = null;
					}
					fieldValObj[currID][field] = value;
				});
				result.items.push(fieldValObj[currID]);
			});
		},function(data){
			result.errorText = $(data.responseText).find("errorstring").text();
			result.errorCode = $(data.responseText).find("errorcode").text();
			if(result.errorCode === '0x80070024'){
				// The attempted operation is prohibited because it exceeds the list view threshold enforced by the administrator.
				result = spjs.utility.queryItemsThrottled(argObj);
			}
		});
		return result;
	},
	"queryItemsThrottled":function(argObj){
		if(argObj.listBaseUrl===undefined){
			argObj.listBaseUrl = _spPageContextInfo.webServerRelativeUrl === "/" ? "" : _spPageContextInfo.webServerRelativeUrl;
		}else if(argObj.listBaseUrl === "/"){
			argObj.listBaseUrl = "";
		}
		if(argObj.rowLimit === undefined){
			argObj.rowLimit = 100000;
		}
		var idMax, idStart, idEnd, result, preCAML, goWhile, tQuery, content, requestHeader, fieldValObj, currID, value;
		idMax = spjs.utility.getMaxID(argObj.listName,argObj.listBaseUrl);
		idStart = 1;
		idEnd = 5000;
		result = {'count':0, items:[]};
		preCAML = String(argObj.query.match("<Where>(.*?)</Where>")[1]);
		goWhile = true;
		while(goWhile && result.count < argObj.rowLimit){
			tQuery = [];
			if(preCAML.split('<And>').length>1){
				tQuery.push("<Where>");
				tQuery.push("<And>");
				tQuery.push("<And>");
				tQuery.push(preCAML);
				tQuery.push("<Geq><FieldRef Name='ID' /><Value Type='Integer'>"+idStart+"</Value></Geq>");
				tQuery.push("</And>");
				tQuery.push("<Leq><FieldRef Name='ID' /><Value Type='Integer'>"+idEnd+"</Value></Leq>");
				tQuery.push("</And>");
				tQuery.push("</Where>");
			}else{
				tQuery.push("<Where>");
				tQuery.push("<And>");
				tQuery.push("<And>");
				tQuery.push("<Geq><FieldRef Name='ID' /><Value Type='Integer'>"+idStart+"</Value></Geq>");
				tQuery.push("<Leq><FieldRef Name='ID' /><Value Type='Integer'>"+idEnd+"</Value></Leq>");
				tQuery.push("</And>");
				tQuery.push(preCAML);
				tQuery.push("</And>");
				tQuery.push("</Where>");
			}
			content = spjs.utility.wrapQuery({'listName':argObj.listName, 'query':tQuery.join(''), 'viewName':argObj.viewName, 'viewFields':argObj.viewFields, 'rowLimit':argObj.rowLimit, 'pagingInfo':argObj.pagingInfo,'scope':argObj.scope,'folder':argObj.folder});
			if(argObj.setRequestHeader===false){
				requestHeader = '';
			}else{
				requestHeader = 'http://schemas.microsoft.com/sharepoint/soap/GetListItems';
			}
			spjs.utility.wrapSoap(argObj.listBaseUrl + '/_vti_bin/lists.asmx',requestHeader, content, function(data){
				fieldValObj = {};
				$(data).filterNode('z:row').each(function(idx, itemData){
					result.count += 1;
					currID = $(itemData).attr('ows_ID');
					fieldValObj[currID] = {};
					$.each(argObj.viewFields,function(i,field){
						value = $(itemData).attr('ows_' + field);
						if(value === undefined){
							value = null;
						}
						fieldValObj[currID][field] = value;
					});
					result.items.push(fieldValObj[currID]);
				});
			},function(data){
				result.errorText = $(data.responseText).find("errorstring").text();
				result.errorCode = $(data.responseText).find("errorcode").text();
			});
			if(idEnd>idMax){
				goWhile = false;
			}else{
				idStart = idEnd+1;
				idEnd += 5000;
			}
		}
		return result;
	},
	"getMaxID":function(listName,listBaseUrl){
		var query, res;
		query = "<Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where><OrderBy><FieldRef Name='ID' Ascending='FALSE' /></OrderBy>";
		res = spjs.utility.queryItems({"listName":listName,"listBaseUrl":listBaseUrl,"query":query,"viewFields":["ID"],"rowLimit":"1"});
		return res.items[0].ID;
	},
	"wrapQuery":function(a){
		var result = [];
		result.push('<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">');
		result.push('<listName>' + a.listName + '</listName>');
		if(a.viewName!==undefined && a.viewName!==''){
			result.push('<viewName>' + a.viewName + '</viewName>');
		}
		if(a.query!==null && a.query!==''){
			result.push('<query><Query xmlns="">');
			result.push(a.query);
			result.push('</Query></query>');
		}
		if(a.viewFields!==undefined && a.viewFields!=='' && a.viewFields.length>0){
			result.push('<viewFields><ViewFields xmlns="">');
			spjs.$.each(a.viewFields, function(idx, field){
				result.push('<FieldRef Name="' + field + '"/>');
			});
			result.push('</ViewFields></viewFields>');
		}
		// A view overrides the itemlimit
		if(a.viewName===undefined){
			if(a.rowLimit!==undefined && a.rowLimit>0){
				result.push('<rowLimit>' + a.rowLimit + '</rowLimit>');
			}else{
			    result.push('<rowLimit>100000</rowLimit>');
			}
		}
		result.push('<queryOptions><QueryOptions xmlns=""><IncludeMandatoryColumns>FALSE</IncludeMandatoryColumns>');
		if(a.pagingInfo!==undefined && a.pagingInfo!==null && a.pagingInfo!==''){
			result.push('<Paging ListItemCollectionPositionNext="' + a.pagingInfo.replace(/&/g, '&amp;') + '" />');
		}
		if(a.scope !== undefined){
			result.push('<ViewAttributes Scope="'+a.scope+'" />');
		}
		if(a.folder !== undefined){
			result.push('<Folder>'+a.folder+'</Folder>');
		}
		result.push('</QueryOptions></queryOptions>');
		result.push('</GetListItems>');
		return result.join('');
	},
	"wrapSoap":function(webserviceUrl,requestHeader,soapBody,successFunc,errorFunc){
		var xmlWrap = [], r;
		if(typeof errorFunc === "undefined"){
			errorFunc = function (xhr, ajaxOptions, thrownError){
				r = xhr.responseText.match(/<errorstring[^>]*>(.*)<\/errorstring>/i);
				if(r !== null){
					spjs.$("body").prepend("<div style='color:red;background-color:#ffff32;padding:3px;'>"+r[1]+"</div>");
				}
			};
		}
		xmlWrap.push("<?xml version='1.0' encoding='utf-8'?>");
		xmlWrap.push("<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>");
		xmlWrap.push("<soap:Body>");
		xmlWrap.push(soapBody);
		xmlWrap.push("</soap:Body>");
		xmlWrap.push("</soap:Envelope>");
		xmlWrap = xmlWrap.join('');
		spjs.$.ajax({
			async:false,
			type:"POST",
			url:webserviceUrl,
			contentType:"text/xml; charset=utf-8",
			processData:false,
			data:xmlWrap,
			dataType:"xml",
			beforeSend:function(xhr){
				if(requestHeader!==''){
					xhr.setRequestHeader('SOAPAction',requestHeader);
				}
			},
			success:successFunc,
			error:errorFunc
		});
	},
	"setFieldValue_ContentTypeChoice":function(a){
		spjs.$(spjs.utility.data.fields[a.fin]).find('select option').each(function(){
			if(spjs.$(this).text() === a.newVal){
				spjs.$(this).prop('selected',true).parent().change();
			}
		});
	},
	"setFieldValue_SPFieldText":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), found = false;
		f.find('input').val(a.newVal).trigger("change");
		// Cascading dropdown
		if(f.find("#"+a.fin+"_casc").length > 0){
			f.find('select option').each(function(){
				if(spjs.$(this).text() === a.newVal){
					spjs.$(this).prop('selected',true);
					found = true;
				}
			});
			if(!found){
				f.find('input').val("");
			}else{
				f.find('select').trigger("change");
			}
		}
	},
	"setFieldValue_SPFieldFile":function(a){
		spjs.$(spjs.utility.data.fields[a.fin]).find('input').val(a.newVal).trigger("change");
	},
	"setFieldValue_SPFieldNumber":function(a){
		spjs.$(spjs.utility.data.fields[a.fin]).find('input').val(a.newVal).trigger("change");
	},
	"setFieldValue_SPFieldCurrency":function(a){
		spjs.$(spjs.utility.data.fields[a.fin]).find('input').val(a.newVal).trigger("change");
	},
	"setFieldValue_SPFieldChoice":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), setRadio;
		setRadio = function(){
			f.find('input:radio').prop("checked",false);
			f.find('input:radio').each(function(){
				if(spjs.$(this).next().text() === a.newVal){
					spjs.$(this).prop('checked',true).trigger("click");
				}
			});
		};
		if(f.find('input:radio').length > 0 && f.find('select').length === 0 && f.find('input:text').length === 0){
			setRadio();
		}else if(f.find('input:radio').length>0 && f.find('input:text').length>0){
			// Fill-in
			if(f.find('select').length>0){
				f.find('select option').each(function(){
					if(spjs.$(this).text() === a.newVal){
						spjs.$(this).prop('selected',true).trigger("change");
					}
				});
				if(f.find('select option:selected').text() !== a.newVal){
					f.find('input:text').val(a.newVal).trigger("change");
				}
			}else{
				setRadio();
				if(f.find('input:radio:checked').next().text() !== a.newVal){
					f.find('input:text').val(a.newVal).trigger("change");
				}
			}
		}else{
			if(a.newVal === "" && f.find("select option[value='']").length === 0){
				f.find("select")[0].selectedIndex = -1;
				if(a.isSP13){
					f.find("select").prepend("<option value selected='selected'></option>");
					f.find("select").trigger("change");
				}
			}else{
				f.find('select option').each(function(){
					if(spjs.$(this).text() === a.newVal){
						spjs.$(this).prop('selected',true).trigger("change");
					}
				});
			}
		}
	},
	"setFieldValue_SPFieldMultiChoice":function(a){
		var t;
		if(!spjs.$.isArray(a.newVal)){
			a.newVal = a.newVal.split(',');
		}
		spjs.$(spjs.utility.data.fields[a.fin]).find('input:checkbox').each(function(){
			t = spjs.$(this).next().text();
			if(spjs.$.inArray(t,a.newVal)>-1){
				spjs.$(this).prop('checked',true).trigger("change");
			}else{
				spjs.$(this).prop('checked',false).trigger("change");
			}
		});
	},
	"setFieldValue_SPFieldUser":function(a){
		spjs.utility.setFieldValue_SPFieldUserMulti(a);
	},
	"setFieldValue_SPFieldUserMulti":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), p;
		if(new Date().valueOf() - spjs.utility.data.formLoaded > 2000){
			if(a.isSP13){
				try{
					p = SPClientPeoplePicker.SPClientPeoplePickerDict[f.find("div.sp-peoplepicker-topLevel").attr("id")];
					if(a.newVal === ""){
						p.DeleteProcessedUser();
						return;
					}
					if(!p.AllowMultipleUsers){
						p.DeleteProcessedUser();
					}
					if(!spjs.$.isArray(a.newVal)){
						a.newVal = a.newVal.split(/;|,/);
					}
					spjs.$.each(a.newVal,function(i,v){
						document.getElementById(p.EditorElementId).value = spjs.$.trim(v);
						p.AddUnresolvedUserFromEditor(true);
					});
				}catch(ignore){
					//
				}
			}else{
				f.find('div.ms-inputuserfield').html(a.newVal);
				f.find('textarea:first').val(a.newVal);
				f.find('img:first').click();
			}
		}else{
			if(a.isSP13){
				ExecuteOrDelayUntilScriptLoaded(function(){
					setTimeout(function(){
						try{
							p = SPClientPeoplePicker.SPClientPeoplePickerDict[f.find("div.sp-peoplepicker-topLevel").attr("id")];
							if(a.newVal === ""){
								p.DeleteProcessedUser();
								return;
							}
							if(!p.AllowMultipleUsers){
								p.DeleteProcessedUser();
							}
							if(!spjs.$.isArray(a.newVal)){
								a.newVal = a.newVal.split(/;|,/);
							}
							spjs.$.each(a.newVal,function(i,v){
								document.getElementById(p.EditorElementId).value = spjs.$.trim(v);
								p.AddUnresolvedUserFromEditor(true);
							});
						}catch(ignore){
							//
						}
						spjs.utility.updateReadonlyValue(a);
					},1000);
				},'clientpeoplepicker.js');
			}else{
				spjs.$(document).ready(function(){
					f.find('div.ms-inputuserfield').html(a.newVal);
					f.find('textarea:first').val(a.newVal);
					f.find('img:first').click();
				});
			}
		}
		spjs.utility.updateReadonlyValue(a);
	},
	"setFieldValue_SPFieldLookup":function(a){
		setTimeout(function(){
			var f = spjs.$(spjs.utility.data.fields[a.fin]), type = spjs.utility.verifyLookupFieldType(a.fin), val = a.newVal;
			if(type !== "" && typeof spjs.utility["setFieldValue_SPFieldLookup"+type] === "function"){
				spjs.utility["setFieldValue_SPFieldLookup"+type](a);
				return;
			}
			if(typeof val === "object"){
				try{
					val = String(val.get_lookupId());
				}catch(ignore){
					// nothing
				}
			}
			f.find('select option').each(function(){
				if(spjs.$(this).text() === val){ // By text value
					spjs.$(this).parent().val(spjs.$(this).val()).trigger("change");
					return false;
				}
				if(spjs.$(this).val() === String(val)){ // By ID
					spjs.$(this).parent().val(spjs.$(this).val()).trigger("change");
					return false;
				}
			});
			spjs.utility.updateReadonlyValue(a);
		},1000);
	},
	"setFieldValue_SPFieldLookup_Input":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), inp, inpHid, split, match;
		inp = f.find('input.ms-lookuptypeintextbox');
		inpHid = spjs.$("*[id='"+inp.attr('optHid')+"']");
		split = inp.attr('choices').split('|');
		match = false;
		// By text
		spjs.$.each(split,function(i,val){
			if(i%2!==0){
				return;
			}
			if(val===a.newVal){
				inp.val(split[i]).trigger("change");
				inpHid.val(split[i+1]);
				match = true;
				return false;
			}
		});
		// By ID
		if(!match){
			spjs.$.each(split,function(i,val){
				if(i%2===0){
					return;
				}
				if(val===String(a.newVal)){
					inp.val(split[i-1]).trigger("change");
					inpHid.val(split[i]);
					return false;
				}
			});
		}
	},
	"setFieldValue_SPFieldLookup_Disp":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(f.find("input[type=radio]").length > 0){
			spjs.utility.setFieldValue_SPFieldLookup_Radio(a);
		}else if(f.find("input[type=checkbox]").length > 0){
			spjs.utility.setFieldValue_SPFieldLookup_Checkbox(a);
		}else{
			alert("You cannot set a lookup column that is not editable.");
		}
	},
	"setFieldValue_SPFieldLookupMulti_Disp":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(!spjs.$.isArray(a.newVal) && typeof a.newVal === "string"){
			a.newVal = a.newVal.split(",");
		}
		if(f.find("input[type=radio]").length > 0){
			spjs.utility.setFieldValue_SPFieldLookup_Radio(a);
		}else if(f.find("input[type=checkbox]").length > 0){
			spjs.utility.setFieldValue_SPFieldLookup_Checkbox(a);
		}else{
			alert("You cannot set a mulitilookup column that is not editable.");
		}
	},
	"setFieldValue_SPFieldLookup_Radio":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(!spjs.$.isArray(a.newVal)){
			if(typeof a.newVal === "string"){
				a.newVal = a.newVal.split(",");
			}else{
				a.newVal = [a.newVal];
			}
		}
		spjs.$.each(a.newVal,function(i,v){
			if(typeof v === "object"){
				v  = String(v.get_lookupId()+";#"+v.get_lookupValue());
			}else{
				v = String(v);
			}
			if(v.split(";#").length > 1){
				f.find("input:radio").each(function(j,chk){
					if(spjs.$(chk).val() === v){
						if(spjs.$(chk).prop("checked") === false){
							spjs.$(chk).prop("checked",true).trigger("click");
						}
					}
				});
			}else{
				f.find("input:radio").each(function(j,chk){
					if(spjs.$(chk).val().split(";#")[1] === v || spjs.$(chk).next().text() === v){
						if(spjs.$(chk).prop("checked") === false){
							spjs.$(chk).prop("checked",true).trigger("click");
						}
					}
				});
			}
		});
	},
	"setFieldValue_SPFieldLookupMulti_Checkbox":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(!spjs.$.isArray(a.newVal)){
			if(typeof a.newVal === "string"){
				a.newVal = a.newVal.split(",");
			}else{
				a.newVal = [a.newVal];
			}
		}
		spjs.$.each(a.newVal,function(i,val){
			if(typeof val === "object"){
				val = String(val.get_lookupId()+";#"+val.get_lookupValue());
			}else{
				val = String(val);
			}
			if(val.split(";#").length > 1){
				f.find("input:checkbox").each(function(j,chk){
					if(spjs.$(chk).val() === val){
						if(spjs.$(chk).prop("checked") === false){
							spjs.$(chk).trigger("click");
						}
					}
				});
			}else{
				f.find("input:checkbox").each(function(j,chk){
					if(spjs.$(chk).val().split(";#")[1] === val || spjs.$(chk).next().text() === val){
						if(spjs.$(chk).prop("checked") === false){
							spjs.$(chk).trigger("click");
						}
					}
				});
			}
		});
	},
	"setFieldValue_SPFieldLookupMulti":function(a){
		setTimeout(function(){
			var f = spjs.$(spjs.utility.data.fields[a.fin]), lId, type = spjs.utility.verifyLookupFieldType(a.fin);
			if(type !== "" && typeof spjs.utility["setFieldValue_SPFieldLookupMulti"+type] === "function"){
				spjs.utility["setFieldValue_SPFieldLookupMulti"+type](a);
				return;
			}
			if(f.find('select:first option:first').prop('spjs') !== "1"){
				f.find('select:first option:first').prop('selected', false);
			}
			if(!spjs.$.isArray(a.newVal)){
				if(typeof a.newVal === "string"){
					a.newVal = a.newVal.split(",");
				}else{
					a.newVal = [a.newVal];
				}
			}
			spjs.$.each(a.newVal,function(i,val){
				if(typeof val === "object"){
					lId = String(val.get_lookupId());
				}else{
					lId = String(val);
				}
				if(String(parseInt(lId,10)) === String(lId)){
					f.find('select:first').find("option").filter(function() {
						return spjs.$(this).val() === lId;
					}).prop('selected', true);
				}else{
					f.find('select:first').find("option").filter(function() {
						return spjs.$(this).text() === lId;
					}).prop('selected', true);
				}
			});
			f.find(":button:first").trigger("click");
			spjs.utility.updateReadonlyValue(a);
		},1000);
	},
	"setFieldValue_SPFieldBoolean":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(a.newVal === 1 || a.newVal === "1" || a.newVal === true || a.newVal === "true"){
			f.find('input').prop('checked',true).trigger("change");
		}else{
			f.find('input').prop('checked',false).trigger("change");
		}
	},
	"setFieldValue_SPFieldURL":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(!spjs.$.isArray(a.newVal)){
			a.newVal = a.newVal.split(',');
		}
		f.find('input:first').val(a.newVal[0]);
		f.find('input:last').val(a.newVal[1] !== undefined ? a.newVal[1] : a.newVal[0]);
	},
	"setFieldValue_SPFieldDateTime":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), c, d, e;
		if(!spjs.$.isArray(a.newVal)){
			a.newVal = a.newVal.split(',');
		}
		c = a.newVal[0].match(/[^\d]/);
		if(c !== null){
			c = String(c);
			d = a.newVal[0].split(c);
			e = [];
			e.push(d[0].length < 2 ? "0"+ d[0] : d[0].length > 4 ? d[0].substring(0,4) : d[0]);
			e.push(d[1].length < 2 ? "0"+ d[1] : d[1].length > 4 ? d[1].substring(0,4) : d[1]);
			e.push(d[2].length < 2 ? "0"+ d[2] : d[2].length > 4 ? d[2].substring(0,4) : d[2]);
			a.newVal[0] = e.join(c);
		}
		f.find('input:first').val(a.newVal[0]);
		if(a.newVal[1] !== undefined){
			f.find('select:first option:eq('+a.newVal[1]+')').prop("selected","selected");
		}
		if(a.newVal[2] !== undefined){
			a.newVal[2] = a.newVal[2] - (a.newVal[2] % 5);
			if(a.newVal[2] < 10){
				a.newVal[2] = "0"+a.newVal[2];
			}
			f.find('select:last').val(a.newVal[2]);
		}
	},
	"setFieldValue_SPFieldNote":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), found = false;
		if(f.find('textarea').length===0){
			f.find("div[contenteditable='true']").html(a.newVal);
		}else{
			f.find('textarea:first').val(a.newVal);
		}
		// Cascading dropdown
		if(f.find("#"+a.fin+"_casc_unselected").length > 0){
			f.find("#"+a.fin+"_casc_unselected option").each(function(){
				if(spjs.$(this).text() === a.newVal){
					spjs.$(this).prop('selected',true);
					found = true;
				}
			});
			if(!found){
				f.find('textarea').val("");
			}else{
				spjs.$("#"+a.fin+"_casc_btnAdd").trigger("click");
			}
		}
	},
	"setFieldValue_SPFieldNote_HTML":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		if(new Date().valueOf() - spjs.utility.data.formLoaded > 2000){
			if(f.find('iframe.ms-rtelong').length > 0){
				f.find('iframe.ms-rtelong').contents().find('body').html('<div>' + a.newVal + '</div>');
			}else{
				f.find('textarea:first').val(a.newVal);
			}
			spjs.utility.updateReadonlyValue(a);
		}else{
			setTimeout(function(){
				if(f.find('iframe.ms-rtelong').length > 0){
					f.find('iframe.ms-rtelong').contents().find('body').html('<div>' + a.newVal + '</div>');
				}else{
					f.find('textarea:first').val(a.newVal);
				}
				spjs.utility.updateReadonlyValue(a);
			},500);
		}
	},
	"setFieldValue_SPFieldNote_EHTML":function(a){
		spjs.$(spjs.utility.data.fields[a.fin]).find("div[id$='TextField_inplacerte']").html(a.newVal);
	},
	"setFieldValue_SPFieldTaxonomyFieldType":function(a){
		spjs.utility.setFieldValue_SPFieldTaxonomyFieldTypeMulti(a);
	},
	"setFieldValue_SPFieldTaxonomyFieldTypeMulti":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), t = new Microsoft.SharePoint.Taxonomy.ControlObject(f.find("div.ms-taxonomy")[0]);
		t.setTextAndCursor(a.newVal,false);
		t.validateAll();
	},
	"getFieldValue_ContentTypeChoice":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('option:selected').text();
	},
	"getFieldValue_Attachments":function(a){
		var b = [];
		spjs.$(spjs.utility.data.fields[a.fin]).find('#idAttachmentsTable tr').each(function(i,tr){
			b.push(spjs.$(tr).find('td:first').html());
		});
		return b.join("<br>");
	},
	"getFieldValue_SPFieldText":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').val();
	},
	"getFieldValue_SPFieldFile":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').val();
	},
	"getFieldValue_SPFieldNumber":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').val();
	},
	"getFieldValue_SPFieldCurrency":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').val();
	},
	"getFieldValue_SPFieldChoice":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), v = "";
		if(f.find('input:radio').length > 0 && f.find('select').length === 0 && f.find('input:text').length === 0){
			v = f.find('input:radio:checked').next().text();
		}else if(f.find('input:radio').length>0 && f.find('input:text').length>0){
			// Fill-in
			if(f.find('select').length>0){
				if(f.find('input:radio:last').prop('checked')){
					v = spjs.$.trim(f.find('input:text').val());
				}else{
					v = f.find('select').val();
				}
			}else{
				if(f.find('input:radio:last').prop('checked')){
					v = spjs.$.trim(f.find('input:text').val());
				}else{
					v = f.find('input:radio:checked').next().text();
				}
			}
		}else{
			v = f.find('select').val();
		}
		return v;
	},
	"getFieldValue_SPFieldMultiChoice":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), b = [], v = "";
		b = [];
		f.find('input:checkbox').each(function(i,opt){
			if(spjs.$(opt).prop("checked")){
				if(f.find('input:text').length===0){ // No fill-in
					b.push(spjs.$(opt).next().text());
				}else{ // Fill-in
					if(i+1 === f.find('input:checkbox').length){
						b.push(f.find('input:text').val());
					}else{
						b.push(spjs.$(opt).next().text());
					}
				}
			}
		});
		if(a.delimiter!==undefined && a.delimiter!==''){
			v = b.join(a.delimiter);
		}else{
			v = b;
		}
		return v;
	},
	"getFieldValue_SPFieldUser":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), b = [], v = "", isSP13 = false;
		if(typeof _spPageContextInfo !== "undefined" && _spPageContextInfo.webUIVersion === 15){
			isSP13 = true;
		}
		if(isSP13){
			if(typeof SPClientPeoplePicker !== "undefined"){
				try{
					spjs.$.each(SPClientPeoplePicker.SPClientPeoplePickerDict[f.find("div.sp-peoplepicker-topLevel").attr("id")].GetControlValueAsJSObject(),function(i,o){
						if(a.key==='displayName' || a.key===undefined){
							b.push(o.DisplayText);
						}else if(a.key==='loginName'){
							b.push(o.Key);
						}else if(a.key==='IsResolved'){
							b.push(o.IsResolved);
						}
					});
				}catch(err){
					// an error occurred
					b.push("["+a.fin+"]: The people picker is not ready. You must delay the function call, or if you are using DFFS, use code like this: spjs.dffs.beforeProperties[FieldInternalName]");
				}
			}else{
				b.push("["+a.fin+"]: The people picker is not ready. You must delay the function call, or if you are using DFFS, use code like this: spjs.dffs.beforeProperties[FieldInternalName]");
			}
		}else{
			v = f.find("span.ms-usereditor input:first").val();
			if(v.indexOf("<") > -1){
				v = v.substring(v.indexOf("<"));
				try{
					$(v).find("div[id='divEntityData']").each(function(i,div){
						if(a.key==='displayName' || a.key===undefined){
							b.push(spjs.$(div).attr("displaytext"));
						}else if(a.key==='loginName'){
							b.push(spjs.$(div).attr("key"));
						}else if(a.key==='IsResolved'){
							b.push(spjs.$(div).attr("isresolved").toLowerCase() === "true");
						}
					});
				}catch(ignore){
					// Nothing
				}
			}else{
				b.push(v.split("&#160;").join(""));
			}
		}
		if(a.delimiter!==undefined && a.delimiter!==''){
			v = b.join(a.delimiter);
		}else{
			v = b;
		}
		return v;
	},
	"getFieldValue_SPFieldUserMulti":function(a){
		return spjs.utility.getFieldValue_SPFieldUser(a);
	},
	"getFieldValue_SPFieldLookup":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), v = "", type = spjs.utility.verifyLookupFieldType(a.fin);
		if(type !== "" && typeof spjs.utility["setFieldValue_SPFieldLookup"+type] === "function"){
			return spjs.utility["getFieldValue_SPFieldLookup"+type](a);
		}
		if(f.find('select option:selected').val() !== "0"){
			v = f.find('select option:selected').text();
		}else{
			v = "";
		}
		return v;
	},
	"getFieldValue_SPFieldLookup_Input":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').val();
	},
	"getFieldValue_SPFieldLookupMulti":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), b = [], v = "", type = spjs.utility.verifyLookupFieldType(a.fin);
		if(type !== "" && typeof spjs.utility["setFieldValue_SPFieldLookupMulti"+type] === "function"){
			return spjs.utility["getFieldValue_SPFieldLookupMulti"+type](a);
		}
		f.find("select:last option").each(function(i,opt){
			b.push(spjs.$(opt).text());
		});
		if(a.delimiter!==undefined && a.delimiter!==''){
			v = b.join(a.delimiter);
		}else{
			v = b;
		}
		return v;
	},
	"getFieldValue_SPFieldLookupMulti_Disp":function(a){
		return spjs.utility.getFieldValue_SPFieldLookup_Disp(a);
	},
	"getFieldValue_SPFieldLookup_Disp":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), b = [];
		if(f.find("a").length > 0){
			f.find("a").each(function(i,a){
				b.push(spjs.$(a).text());
			});
			return b.join(", ");
		}else{
			if(f.find("input[type=radio]").length > 0){
				return spjs.utility.getFieldValue_SPFieldLookup_Radio(a);
			}else if(f.find("input[type=checkbox]").length > 0){
				return spjs.utility.getFieldValue_SPFieldLookupMulti_Checkbox(a);
			}
			return "";
		}
	},
	"getFieldValue_SPFieldLookup_Radio":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), v = "";
		if(f.find("input[type=radio]:checked").length > 0){
			v = f.find("input[type=radio]:checked").val();
		}
		return v;
	},
	"getFieldValue_SPFieldLookupMulti_Checkbox":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), b = [], v = "";
		f.find("input[type=checkbox]:checked").each(function(i,chk){
			b.push(spjs.$(chk).val());
		});
		if(a.delimiter!==undefined && a.delimiter!==''){
			v = b.join(a.delimiter);
		}else{
			v = b;
		}
		return v;
	},
	"getFieldValue_SPFieldBoolean":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('input').prop('checked')===true?true:false;
	},
	"getFieldValue_SPFieldURL":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]);
		return "<a href='"+f.find('input:first').val()+"'>"+f.find('input:last').val()+"</a>";
	},
	"getFieldValue_SPFieldDateTime":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), d = f.find('input:first').val(), h = "", m = "", ampm = "";
		if(d !== "" && f.find('select').length>0){
			ampm = f.find('select:first option:selected').text().match(/AM|PM/);
			if(ampm === null){
				h = f.find('select:first option:selected').val();
				ampm = "";
			}else{
				ampm = " "+ampm;
				h = f.find('select:first option:selected').text().split(" ")[0];
			}
			if(h.length<2){
				h = "0"+h;
			}
			h = " "+h+":";
			m = f.find('select:last option:selected').val();
			if(m.length<2){
				m = "0"+m;
			}
		}
		return d+h+m+ampm;
	},
	"getFieldValue_SPFieldNote":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find('textarea:first').val();
	},
	"getFieldValue_SPFieldNote_HTML":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), v = "";
		if(browseris.ie5up && browseris.win32 && !IsAccessibilityFeatureEnabled()){
			if(f.find("iframe[class^='ms-rtelong']").contents().find('body').html() !== ""){
				v = f.find("iframe[class^='ms-rtelong']").contents().find('body').html();
			}else{
				v = f.find('textarea:first').val();
			}
		}else{
			v = f.find('textarea:first').val();
		}
		return v;
	},
	"getFieldValue_SPFieldNote_EHTML":function(a){
		return spjs.$(spjs.utility.data.fields[a.fin]).find("div[id$='TextField_inplacerte']").html();
	},
	"getFieldValue_SPFieldTaxonomyFieldType":function(a){
		var f = spjs.$(spjs.utility.data.fields[a.fin]), v = "", b = [], t;
		t = new Microsoft.SharePoint.Taxonomy.ControlObject(f.find("div.ms-taxonomy")[0]);
		spjs.$(t.getRawText().split(";")).each(function(i,v){
			b.push(v.split("|")[0]);
		});
		if(a.delimiter !== undefined){
			v = b.join(a.delimiter);
		}else{
			v = b;
		}
		return v;
	},
	"getFieldValue_SPFieldTaxonomyFieldTypeMulti":function(a){
		return spjs.utility.getFieldValue_SPFieldTaxonomyFieldType(a);
	},
	"getFieldValue_DispForm":function(a){
		var b;
		if(spjs.$(spjs.utility.data.fields[a.fin]).find('div.dffs_tdWrap').length > 0 && spjs.dffs.data.isSP13){
			b = spjs.$(spjs.utility.data.fields[a.fin]).find('td.ms-formbody div.dffs_tdWrap:last').text();
		}else{
			b = spjs.$(spjs.utility.data.fields[a.fin]).find('.ms-formbody').text();
		}
		return b.split(/^\s+|\s+$/).length > 0 ? b.split(/^\s+|\s+$/).join("") : "";
	},
	"getFieldValue":function(a){
		if(a.fin === "ID"){
			return spjs.utility.urlKeyValue("ID");
		}
		var rVal = "";
		// If not already done - init all fields
		if(spjs.utility.data.fields === null){
			spjs.utility.data.fields = spjs.utility.init_fields();
		}
		// Return if FieldInternalName is not found
		if(spjs.utility.data.fields[a.fin]===undefined){
			return;
		}
		// DispForm
		if(location.href.replace("_layouts/15/start.aspx#/","").split("&")[0].match(/dispform.aspx/i) !== null){
			return spjs.utility.getFieldValue_DispForm(a);
		}else{
			if(spjs.utility.data.fieldType[a.fin] === undefined){
				alert("[getFieldValue]\nThe attribute \"FieldType\" is missing for the FieldInternalName \""+a.fin+"\".");
				return false;
			}
			if(typeof spjs.utility["getFieldValue_"+spjs.utility.data.fieldType[a.fin]] !== "function"){
				rVal = "Unknown fieldType: "+spjs.utility.data.fieldType[a.fin];
			}else{
				rVal = spjs.utility["getFieldValue_"+spjs.utility.data.fieldType[a.fin]](a);
			}
			return rVal !== undefined ? rVal : "";
		}
	},
	"setFieldValue":function(a){
		// If not already done - init all fields
		if(spjs.utility.data.fields === null){
			spjs.utility.data.fields = spjs.utility.init_fields();
		}
		// Return if FieldInternalName is not found
		if(spjs.utility.data.fields[a.fin]===undefined){
			return;
		}
		a.isSP13 = false;
		if(typeof _spPageContextInfo !== "undefined" && _spPageContextInfo.webUIVersion === 15){
			a.isSP13 = true;
		}
		if(spjs.utility.data.fieldType[a.fin] === undefined){
			alert("[setFieldValue]\nThe attribute \"FieldType\" is missing for the FieldInternalName \""+a.fin+"\".");
			return false;
		}
		if(spjs.utility.data.fieldType[a.fin].match(/note/i) === null && typeof a.newVal === "string"){
			a.newVal = a.newVal.split("\n").join("\\n");
		}
		if(typeof spjs.utility["setFieldValue_"+spjs.utility.data.fieldType[a.fin]] !== "function"){
			alert("[spjs-utility.js: setFieldValue]\nUnknown fieldType: "+spjs.utility.data.fieldType[a.fin]);
		}else{
			spjs.utility["setFieldValue_"+spjs.utility.data.fieldType[a.fin]](a);
		}
		spjs.utility.updateReadonlyValue(a);
	},
	"updateReadonlyValue":function(a){
		var thisField = spjs.$(spjs.utility.data.fields[a.fin]), b = [];
		if(thisField.find("td.dffs-readonly-inner").length > 0){
			if(spjs.utility.data.fieldType[a.fin] === "SPFieldBoolean"){
				thisField.find("td.dffs-readonly-inner div.dffs_tdWrap").html("<span style='font-size:large;font-family:Arial Unicode MS;padding-top:0px;'>"+(spjs.utility.getFieldValue({"fin":a.fin}) ? "&#x2611;" : "&#x2610;")+"</span>");
			}else if(spjs.utility.data.fieldType[a.fin] === "SPFieldMultiChoice"){
				thisField.find("input:checkbox").each(function(j,c){
					b.push("<span style='font-size:large;font-family:Arial Unicode MS;padding-top:0px;'>"+(spjs.$(c).prop("checked") ? "&#x2611;" : "&#x2610;")+"</span><label style='margin-left:4px;'>"+spjs.$(c).next().text()+"</label>");
				});
				thisField.find("td.dffs-readonly-inner div.dffs_tdWrap").html(b.join("<br>"));
			}else{
				thisField.find("td.dffs-readonly-inner div.dffs_tdWrap").html(String(spjs.utility.getFieldValue({"fin":a.fin})).split("\n").join("<br>"));
			}
		}
	},
	"urlKeyValue":function(key,url){
		var a = "", b = unescape(window.location.search), c, d;
		if(url !== undefined){
			b = unescape(url);
		}
		if(b.length>0){
			c = b.substring(1).split('&');
			$.each(c,function(i,item){
				d = item.split('=');
				if(d[0]===key){
					a = d[1];
					if(d.length===3){
						a += "="+d[2];
					}
					return false; // exit loop
				}
			});
		}
		return unescape(a);
	},
	"verifyLookupFieldType":function(fin){
		var f = spjs.$("#dffs_"+fin),type = "";
		if(f.length > 0){
			if(spjs.$(f).find("input[type='text']").length>0){
				type = "_Input";
			}else if(spjs.$(f).find("input:radio").length>0){
				type = "_Radio";
			}else if(spjs.$(f).find("input:checkbox").length>0){
				type = "_Checkbox";
			}else if(spjs.$(f).find("select").length === 0 && spjs.$(this).find("input[type='button']").length>0){
				type = "_Disp";
			}
		}
		return type;
	},
	"init_fields":function(){
		var res = {}, disp, fin, type;
		spjs.$("td.ms-formbody").each(function(){
		var m = spjs.$(this).html().match(/FieldName="(.+)"\s+FieldInternalName="(.+)"\s+FieldType="(.+)"\s+/);
			if(m !== null){
				// Display name
				disp = m[1];
				// FieldInternalName
				fin = m[2];
				// FieldType
				type = m[3];
				if(type === "SPFieldNote"){
					if(spjs.$(this).find('script').length>0){
						type=type+"_HTML";
					}else if(spjs.$(this).find("div[id$='TextField_inplacerte']").length>0){
						type=type+"_EHTML";
					}
				}
				if(type === "SPFieldLookup"){
					if(spjs.$(this).find("input[type='text']").length>0){
						type=type+"_Input";
					}else if(spjs.$(this).find("input:radio").length>0){
						type=type+"_Radio";
					}else if(spjs.$(this).find("select").length === 0 && spjs.$(this).find("input[type='button']").length>0){
						type=type+"_Disp";
					}
				}
				if(type === "SPFieldLookupMulti"){
					if(spjs.$(this).find("input:checkbox").length>0){
						type=type+"_Checkbox";
					}else if(spjs.$(this).find("select").length === 0 && spjs.$(this).find("input[type='button']").length>0){
						type=type+"_Disp";
					}
				}
				// HTML Calc
				if(type==='SPFieldCalculated' && spjs.$(this).text().match(/(<([^>]+)>)/ig)!==null){
					try{
						spjs.$(this).html(spjs.$(this).text());
					}catch(ignore){
						// empty
					}
				}
				// Build object
				res[fin] = this.parentNode;
				res[fin].FieldDispName = disp;
				res[fin].FieldType = type;
				spjs.utility.data.fieldType[fin] = type;
			}else{
				if(spjs.$(this).find("select[id$='_ContentTypeChoice']").length>0){
					res.ContentTypeChoice = this.parentNode;
					spjs.utility.data.fieldType.ContentTypeChoice = "ContentTypeChoice";
				}
			}
		});
		return res;
	},
	"addItem":function(argObj){
		var qRes = spjs.utility.updateListItem({'action':'new','listName':argObj.listName,'listBaseUrl':argObj.listBaseUrl,'data':argObj.data});
		return qRes;
	},
	"deleteItem":function(argObj){
		var qRes = spjs.utility.updateListItem({'action':'delete','listName':argObj.listName,'listBaseUrl':argObj.listBaseUrl,'id':argObj.id,'docFullUrl':argObj.docFullUrl});
		return qRes;
	},
	"updateItem":function(argObj){
		var qRes = spjs.utility.updateListItem({'action':'update','listName':argObj.listName,'listBaseUrl':argObj.listBaseUrl,'id':argObj.id,'data':argObj.data});
		return qRes;
	},
	"updateListItem":function(argObj){
		var content, result, listURL;
		if(argObj.listBaseUrl===undefined){
			argObj.listBaseUrl = L_Menu_BaseUrl;
		}
		if(argObj.id!==undefined && typeof(argObj.id)!=='object'){
			argObj.id = String(argObj.id).split(',');
		}
		content = [];
		content.push("<UpdateListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'>");
		content.push("<listName>"+argObj.listName+"</listName>");
		content.push("<updates>");
		switch(argObj.action){
			case 'new':
				if(argObj.folderName !== undefined){ // Folder
					content.push("<Batch OnError='Continue' ");
					if(argObj.rootFolder!==undefined){
						content.push("RootFolder='"+argObj.rootFolder+"'");
					}
					content.push(" PreCalc='TRUE'>");
					content.push("<Method ID='1' Cmd='New'>");
					content.push("<Field Name='ID'>New</Field>");
					content.push("<Field Name='FSObjType'>1</Field>");
					content.push("<Field Name='BaseName'>"+argObj.folderName+"</Field>");
					content.push("<Field Name='Title'>"+argObj.folderName+"</Field>");
					content.push("</Method>");
				}else{ // List
					content.push("<Batch OnError='Continue'>");
					content.push("<Method ID='1' Cmd='New'>");
					content.push("<Field Name='ID'>0</Field>");
					spjs.$.each(argObj.data,function(fin,val){
						content.push("<Field Name='"+fin+"'><![CDATA["+val+"]]></Field>");
					});
					content.push("</Method>");
				}
			break;
			case 'update':
				content.push("<Batch OnError='Continue'>");
				spjs.$.each(argObj.id,function(i,id){
					content.push("<Method ID='"+(i+1)+"' Cmd='Update'>");
					content.push("<Field Name='ID'>"+id+"</Field>");
					spjs.$.each(argObj.data,function(fin,val){
						content.push("<Field Name='"+fin+"'><![CDATA["+val+"]]></Field>");
					});
					content.push("</Method>");
				});
			break;
			case 'delete':
				// List items
				if(argObj.docFullUrl===undefined){
					content.push("<Batch OnError='Continue'>");
					spjs.$.each(argObj.id,function(i,id){
						content.push("<Method ID='"+(i+1)+"' Cmd='Delete'>");
						content.push("<Field Name='ID'>"+id+"</Field>");
						content.push("</Method>");
					});
				// Document
				}else if(argObj.id.length === 1 && argObj.docFullUrl!==undefined){
					content.push("<Batch OnError='Continue' PreCalc='TRUE'>");
					content.push("<Method ID='1' Cmd='Delete'>");
					content.push("<Field Name='ID'>"+argObj.id[0]+"</Field>");
					content.push("<Field Name='FileRef'>"+argObj.docFullUrl+"</Field>");
					content.push("</Method>");
				}else{
					alert("You cannot delete more than one document at a time!");
				}
			break;
		}
		content.push("</Batch>");
		content.push("</updates>");
		content.push("</UpdateListItems>");
		content = content.join('');
		result = {success:false,errorText:null,errorCode:null};
		spjs.utility.wrapSoap(argObj.listBaseUrl + '/_vti_bin/lists.asmx','http://schemas.microsoft.com/sharepoint/soap/UpdateListItems',content,function(data){
			if(spjs.$(data).find('ErrorText').length>0) {
				result.errorText = spjs.$(data).find('ErrorText').text();
				result.errorCode = spjs.$(data).find('ErrorCode').text();
				// Duplicate folder names
				if(result.errorCode === "0x8107090d" && argObj.folderName !== undefined){
					result.errorText = "A folder named \""+argObj.folderName+"\" already exist";
				}
			}else{
				result.success = true;
				if(argObj.action!=='delete'){
					result.id = spjs.$(data).filterNode('z:row').attr('ows_ID');
					listURL = spjs.$(data).filterNode('z:row').attr('ows_EncodedAbsUrl');
					result.listURL = listURL.substring(0,listURL.lastIndexOf('/'));
				}
			}
		});
		return result;
	},
	"getLocalizedStringFromObj":function(a){
		var b = "No translation found for "+L_Menu_LCID;
		try{
			if(a[L_Menu_LCID] !== undefined){
				b = a[L_Menu_LCID];
			}else if(a["default"] !== undefined){
				b = a["default"];
			}
		}catch(ignore){
			// Nothing
		}
		return b;
	},
	"dateObjToFormattedString":function(date,format){
		try{
			format = format.replace("MM",(date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1));
			format = format.replace("dd",date.getDate() < 10 ? "0"+date.getDate() : date.getDate());
			format = format.replace("yyyy",date.getFullYear());
			format = format.replace("yy",date.getFullYear().toString().substring(2));
			format = format.replace("hh",date.getHours() < 10 ? "0"+date.getHours() : date.getHours());
			format = format.replace("mm",date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes());
			format = format.replace("ss",date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds());
			return format;
		}catch(ignore){
			return date;
		}
	}
};

// http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
spjs.$.fn.filterNode = function(name) {
	return this.find('*').filter(function() {
		return this.nodeName === name;
	});
};

/***********************************************/
/****  Compatibility with existing scripts  ****/
/***********************************************/
function doResizeDialog(){
	spjs.utility.resizeDlg();
}

function spjs_AddList(listName,listBaseUrl,listDescription){
	return spjs.utility.addList(listName,listBaseUrl,listDescription);
}

function spjs_UpdateList(listName,listBaseUrl,newFieldsObjArr,updFieldsObjArr,deleteFieldsArr){
	return spjs.utility.updateList(listName,listBaseUrl,newFieldsObjArr,updFieldsObjArr,deleteFieldsArr);
}

function getUserInfo_v2(loginOrUserID,customProp){
	return spjs.utility.userInfo(loginOrUserID,customProp);
}

function spjs_getItemByID(argObj){
	return spjs.utility.getItemByID(argObj);
}

function spjs_QueryItems(argObj){
	return spjs.utility.queryItems(argObj);
}

function spjs_wrapQueryContent(paramObj){
	return spjs.utility.wrapQuery(paramObj);
}

function spjs_wrapSoapRequest(webserviceUrl,requestHeader,soapBody,successFunc){
	spjs.utility.wrapSoap(webserviceUrl,requestHeader,soapBody,successFunc);
}

function setFieldValue(fin,newVal,onLoad){
	spjs.utility.setFieldValue({"fin":fin,"newVal":newVal,"onLoad":onLoad});
}

function getFieldValue(fin,dispform,multiValueJoinBy,optionalFilter){
	return spjs.utility.getFieldValue({"fin":fin,"delimiter":multiValueJoinBy,"key":optionalFilter});
}

function init_fields_v2(){
	return spjs.utility.init_fields();
}

function spjs_addItem(argObj){
	return spjs.utility.addItem(argObj);
}

function spjs_deleteItem(argObj){
	return spjs.utility.deleteItem(argObj);
}

function spjs_updateItem(argObj){
	return spjs.utility.updateItem(argObj);
}

function spjs_UpdateListItem(argObj){
	return spjs.utility.updateListItem(argObj);
}
