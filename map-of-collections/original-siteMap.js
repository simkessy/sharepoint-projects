<div id="siteMapBtn"></div>
<script type="text/javascript" src="/sites/hrco/SiteAssets/jquery-1.12.1.min.js"></script>
<script type="text/javascript" src="/sites/hrco/SiteAssets/jquery.SPServices-2014.02.js"></script>
<script type="text/javascript" src="/sites/hrco/SiteAssets/spjs-utility.js"></script>
<!-- <script type="text/javascript" src="/sites/hrco/SiteAssets/collection-map.js"></script> -->

<script type="text/javascript">

var spjs = spjs || {};

spjs.siteMap = {
	"version":"1.2",
	"data":{
		"listName":"SPJS-SiteMap",
		"listBaseUrl":typeof _spPageContextInfo !== "undefined" ? _spPageContextInfo.siteServerRelativeUrl !== "/" ? _spPageContextInfo.siteServerRelativeUrl : "" : L_Menu_BaseUrl,
		"listDescription":"SPJS-SiteMap for SharePoint by Alexander Bautz / SharePoint JavaScripts: http://spjsblog.com. This list is used as datasource for SPJS Charts for SharePoint."
	},
	"showButton":function(){
		$("#siteMapBtn").html("<input type='button' onclick='spjs.siteMap.update()' value='Add or update site map' />");
	},
	"update":function(){		
		var b, webs, thisBaseUrl, p, currItems, currItemsObj, newList, uList, data, res, noChangeCount, uCount, nCount, dCount, error;
		b = '<GetAllSubWebCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/" />';

		// get current list of all sites
		webs = {};

		// Go through each site
		// Build webs object with each title and url
		spjs_wrapSoapRequest(spjs.siteMap.data.listBaseUrl+'/_vti_bin/webs.asmx', 'http://schemas.microsoft.com/sharepoint/soap/GetAllSubWebCollection', b, function(data){

			// process each site
			$('Web', data).each(function(i,o){
				
				//remove http:// + domain 
				thisBaseUrl = $(o).attr("Url").replace(location.protocol+"//"+location.host,"");

				// if there's nothing (root site), give it "/"
				if(thisBaseUrl === ""){
					thisBaseUrl = "/";
				}

				//remove http:// + domain 
				p = $(o).attr("Url").replace(location.protocol+"//"+location.host,"");

				// get parent by removing everything after last "/"
				p = p.substring(0,p.lastIndexOf("/"));

				// if no parent, set parent to root
				if(p === ""){
					p = "/";		
				}

				// build object with each site title and parent
				webs[thisBaseUrl] = {"title":$(o).attr("Title"),"parent":p};
			});
		});
		//alert(JSON.stringify(webs))

		// GET ALL SITES FOR COLLECTION
		currItems = spjs_QueryItems({"listName":spjs.siteMap.data.listName,"listBaseUrl":spjs.siteMap.data.listBaseUrl,"query":"<Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where>","viewFields":["ID","CurrentSite","Parent","URL"]});

		//WEB QUERY RESULTS
		// alert(JSON.stringify(currItems)) 

		// IF NOTHING COMES BACK FROM QUERY
		// CHECK IF CONTAINER LIST EXISTS
		if(currItems.count === -1){
			// CREATE CONTAINER LIST IF IT DOESN'T EXIST 
			if(confirm("It looks like the list named "+spjs.siteMap.data.listName+" does not exist.\n\nCreate it now?")){

				// CREATE NEW LIST 
				newList = spjs_AddList(spjs.siteMap.data.listName,spjs.siteMap.data.listBaseUrl,spjs.siteMap.data.listDescription);
				if(newList.success){
					// UPDATE LIST WITH COLUMNS
					uList = spjs_UpdateList(newList.id,L_Menu_BaseUrl,[{'Type':'Note','DisplayName':'CurrentSite'},{'Type':'Note','DisplayName':'Parent'},{'Type':'Note','DisplayName':'URL'},{'Type':'Note','DisplayName':'SiteCollection'}],[]);
					//IF UPDATE FAILES 
					if(!uList.success){						
						alert(uList.errorText);
						return;
					}else{
						// POPULATE LIST
						if(confirm("The list was created successfully. Click OK to populate the list.")){
							spjs.siteMap.update();
						}
					}										
				}else{
					alert("[spjs_AddList]\n\n"+newList.errorText);
					return;
				}
				return;
			}else{
				return;
			}
		}

		// START HANDLING ADDING LINKS TO THE NEW LIST 
		currItemsObj = {};
		noChangeCount = 0;
		uCount = 0; // UPDATE COUNT
		nCount = 0; // NEW COUNT
		dCount = 0; // DELETE COUNT

		// CREATE OBJECT FOR ALL SITES
		$.each(currItems.items,function(i,item){
			currItemsObj[item.URL === null ? "" : item.URL] = {"ID":item.ID,"CurrentSite":item.CurrentSite,"Parent":item.Parent,"URL":item.URL};
		});

		// RETURNED SITES IN OBJECT
		// alert(JSON.stringify(currItemsObj))

		error = false;

		// GO THROUGH ALL RETURNED SITES FOR COLLECTION
		$.each(webs,function(url,o){
			// CREATE ITEM: TITLE - CURRENT - URL - PARENT 
			//// ADD COLLECTION HERE!
			data = {"Title":"[...]","CurrentSite":"{\"v\":\""+url+"\",\"f\":\"<a href='"+url+"' target='_blank'>"+o.title+"</a>\"}","URL":url,"Parent":o.parent}

			// CHECK IF CURRENT SITE ALREADY IN LIST 
			// IF CURRENT SITE FOUND!
			if(currItemsObj[url] !== undefined){
				// FOUND THE SITE GIVEN URL 
				// NOW CHECK IF ALL PROPERTIES ARE UNCHANGED  
					//// SHOULD ADD A CHECK FOR SITE COLLECTION AS WELL 
				if(currItemsObj[url].CurrentSite === data.CurrentSite && currItemsObj[url].Parent === o.parent && currItemsObj[url].URL === url){

					// IF THERE'S NO CHANGE FOR CURRENT ITEM, REMOVE FROM CURRENT ITEM LIST
					// REMAINING ITEMS WILL BE THE UPDATES
					delete currItemsObj[url];
					noChangeCount += 1;
					return;
				}	

				// REMAINING ITEMS, UPDATES TO BE MADE
				res = spjs_updateItem({"listName":spjs.siteMap.data.listName,"listBaseUrl":spjs.siteMap.data.listBaseUrl,"id":currItemsObj[url].ID,"data":data});

				// REMOVE CURRENTLY UPDATED ITEM
				delete currItemsObj[url];

				// IF THERE'S AN ERROR IN UPDATED THE ITEM
				if(!res.success){
					error = {"errorText":res.errorText,"code":res.errorCode};
					return false;
				}else{
					// INCREMENT UPDATE COUNT
					uCount += 1;
				}
			}else{
				// IF ITEM NOT FOUND 
				// UPDATE THE LIST WITH THE NEW ITEM
				res = spjs_addItem({"listName":spjs.siteMap.data.listName,"listBaseUrl":spjs.siteMap.data.listBaseUrl,"data":data});
				if(!res.success){
					// ERROR ON NEW ITEM CREATION 
					error = {"errorText":res.errorText,"code":res.errorCode};
					return false;
				}else{
					// INCREMENT NEW COUNT 
					nCount += 1;
				}
			}				
		});	

		// ERROR HANDLING 
		if(error !== false){
			alert("SPJS-SiteMap: An error occurred\n---------------------------------------\nAre you updating from a previous version? If the below error message tells you that one or more field types are not installed correctly, please delete the list \"SPJS-SiteMap\" and rerun this script. The list will be recreated with the missing fields.\n\nPlease note that you must edit the SiteMap chart to reselect the list and fields.\n\nError message\n---------------------------------------\n"+error.errorText);
		}	

		// DELETE REMAINING ITEMS - SITES NO LONGER IN COLLECTION
		$.each(currItemsObj,function(url,obj){
			res = spjs_deleteItem({"listName":spjs.siteMap.data.listName,"listBaseUrl":spjs.siteMap.data.listBaseUrl,"id":obj.ID});
			if(!res.success){
				alert("[spjs.siteMap]\n\n"+res.errorText);
				return false;
			}else{
				dCount += 1;
			}
		});

		// FINAL RESULTS POP UP
		alert("SPJS-SiteMap\n\nUpdated: "+uCount+"\nAdded: "+nCount+"\nRemoved: "+dCount);

		// REFRESH PAGE
		location.href = location.href;
	}
};

spjs.siteMap.showButton();
</script>
