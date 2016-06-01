// declare global 
var scmap = scmap || {}; 

scmap = {
	author: "Kessy Similien (simkessy@gmail.com)",
	lists: [
		{
			name: "Site-Map-Collections",
			description: "This list will contain all site collections for the SPJS Charts",
			fields: [{'Type':'Note','DisplayName':'URL'}],
			view: "<ViewFields><FieldRef Name='URL' /></ViewFields>"
		},{
			name: "Site-Map",
			description: "This list is used as datasource for SPJS Charts for SharePoint.",
			fields: [
				{'Type':'Note','DisplayName':'CurrentSite'},
				{'Type':'Note','DisplayName':'Parent'},
				{'Type':'Note','DisplayName':'URL'},
				{'Type':'Note','DisplayName':'SiteCollection'}],
			view: "<ViewFields><FieldRef Name='CurrentSite' /><FieldRef Name='CurrentSite' /><FieldRef Name='Parent' /><FieldRef Name='URL' /><FieldRef Name='SiteCollection' /></ViewFields>"
	}],
	d: {
		collections: {
			current: [],
			stored: []
		},
		sites: {
			current: [],
			stored: []
		}
	},
	notice: function(msg) {
		SP.UI.Notify.addNotification(msg false);
	}
	errorHandling: {
		failure: function() { alert("Failed") }
	},
	init: function() {
		// check if lists exist
		this.checkForLists()

	},
	checkForLists: function() {
		var listCheckPromise = [];

		$.each(scmap.lists, function(i, list) {
			listCheckPromise = $().SPServices({
				operation: "GetList",
  			listName: list.name,
			})
		})

		$.map(listCheckPromise, function(list){
			list.then(pass, fail)
		})

		function pass(data) {
			var result = $(data);
			console.log(JSON.stringify(result))
			console.log(list.name + 'exists')
		}

		function fail(data) {
			console.log(list.name, 'does not exist. Creating...')
			scmap.createList(data)
		}
	},
	createList: function(list) {
		var createPromise = $().SPServices({
			operation: "AddList",
			listName: list.name,
			description: list.description,
			templateID: 100
		})

		createPromise.then(pass, fail);

		function pass() { 
			var text = "list has been created"
			console.log(text)
			this.notice(text)
		}

		function fail() {
			this.notice('failed to create list')
			return false; 
		}
	},
	createLists: function() {
		// store promises in array
		var createPromises = [];
		// loop through lists which need to be created
		$.each(scmap.lists, function(index, list) {
			createPromises[index] = $().SPServices({
				operation: "AddList",
				listName: list.name,
				description: list.description,
				templateID: 100
			})
		})
		console.log(createPromises)
		// when promises complete, run update lists
		$.map(createPromises, function(promise) {
			promise.then(success, failure);
		})

		// error handling on list creation
		function success() {
			alert("successfully created lists")
			scmap.setListColumns()
		}

		function failure(error) {
			console.log($(error).getSPErrorCode())
		}
		
	},
	setListColumns: function() {
		$.map(scmap.lists, function(list, index) {
			var updateList = spjs_UpdateList(list.name, L_Menu_BaseUrl, list.fields, []);

			if(!updateList.success) {
				alert(updateList.errorText)
			}else{
				alert("Updated list:", list.name)
			}
		})
	}, 
	getCollections: function() {
		getCollections = $().SPServices({
			operation: "GetListItemJSON",
			listName: scmap.lists[0].name,
			CAMLViewFields: scmap.lists[0].view
		})

		getCollections.then(success, scmap.errorHandling.failure)

		function success(response) {
			var result = $(response)
			// get sites for each collection
			this.d.collections.current = result.find('Web')
			// loop through each site collection
			// get all sites per collection
			// find diff between current list 
			// remove deleted items
			// add new items 

			// or remove all and add new
			scmap.getSites(); 
		}
	},
	getSites: function(results) {
		var collections = results; 
		scmap.d.sites.current = $.map(collections, function(site, index) {
			var sitesPromise = $().SPServices({
				operation: "GetAllSubWebCollection",
				webURL: site.URL
			});
		})

		// find changes
		var updates = scmap.d.sites.current.diff(scmap.d.sites.stored)

		
	}
};















// PURPOSE:
//  Examines SPServices xData.responseXML for any errors. At a minimum, it will use this SP.UI framework to display
//  an error summary in the status bar which can include the name of your function and the SPServices operation for 
//  troubleshooting in the field and debugging during development. Optionally, it dumps the verbose output from 
//  $().SPServices.SPDebugXMLHttpResult() to a supplied container
//
// NOTE:
//  It is possible for the "Status" parameter in the completefunc() callback to state "success" and for
//  xData.statusText to hold "OK" when in fact there are errors. A "Status" of "success" simply means the web 
//  service call succeeded. It does NOT mean the web service did not return its own error code and message.
//
// USAGE:
//  $(xData).OutputSPError();
//
jQuery.fn.OutputSPError = function(options) {

    var opt = $.extend({}, {
        functionName:   "",             // Name of your javascript function that invoked the SPServices call
        operationName:  "",             // Name of the SPServices operation, ie: "UpdateListItems"
        msgContainer:   "#SPServices",  // [OPTIONAL] jQuery selector for HTML container to hold error messages output
        }, options);
    
    // Ensure we were chained to the right object
    if( typeof($(this).prop("responseXML")) === "undefined" )
        return;

    var responseXML = $(this).prop("responseXML");
    if( !$(responseXML).hasSPError() )
        return;
    
    var statusText  = $(this).prop("statusText");
    var message = "";

    if( opt.functionName != "" || opt.operationName != "" )
        message = "[" + opt.functionName + "] " + opt.operationName + " :: ";

    // Display the error summary in the status bar
    var strStatusID = 
        SP.UI.Status.addStatus(
            "<img src='/_Layouts/Images/error16by16.gif' align='absmiddle'>&nbsp;" + 
            message + (statusText != "OK" ? statusText + ":&nbsp;" : "" ) + $(responseXML).getSPErrorText());
    SP.UI.Status.setStatusPriColor(strStatusID, "yellow");

    // Dump the error details to the caller's message container and unhide it
    if( $(opt.msgContainer).length != 0 ) {
        var errorDetails    = $().SPServices.SPDebugXMLHttpResult({node: responseXML});
        var divStatus       = jQuery("<h1 class='_wsStatusText'></h1>").appendTo(opt.msgContainer);
        var divError        = jQuery("<div class='_wsError'></div>").appendTo(opt.msgContainer);
        $(divStatus).text((statusText != "OK" ? statusText : $(responseXML).getSPErrorCode()));
        $(divError).append("<b>" + message + "</b><br>" + errorDetails);
        $(opt.msgContainer).show();
    }
    return;
}


// PURPOSE:
//  Given an XML message as returned by the Sharepoint web services API, this method checks for an error
//
// RETURNS:
//  {Boolean} true|false
//
// USAGE:
//  $(xData).hasSPError();
//  $(xData.responseXML).hasSPError();
//
jQuery.fn.hasSPError    = function() {

    // Sometimes a web service will be reachable and the web method will still
    // return an error code XML node. So we need to check its contents
    return( $(this).getSPErrorCode() != "0x00000000");
};/* jQuery.fn.hasSPError() */



// PURPOSE:
//  Given an XML message as returned by the Sharepoint web services API, this method
//  checks if it contains an error and returnS the error code.
//
// NOTE:
//  Sometimes a web service will be reachable and the web method call will succeed with no errors
//  but it may still return an error code XML node. If so, the node value needs to be checked.
//  EXAMPLE: UpdateListItems returns "0x00000000" for success
//
// RETURNS:
//  {String} hexidecimal error code
//
// USAGE:
//  $(xData).hasSPError();
//  $(xData.responseXML).hasSPError();
//
jQuery.fn.getSPErrorCode    = function() {

    if( typeof($(this).prop("status")) !== "undefined" && $(this).prop("status") != 200 )
        return $(this).prop("status").toString();
    
    var responseXML = $(this).prop("responseXML");
    if( typeof($(this).prop("responseXML")) === "undefined" )
        responseXML = $(this);

    var spErrCode = $(responseXML).find("ErrorCode:first");
    if( spErrCode.length )
        return spErrCode.text();
    
    spErrCode = $(responseXML).find("errorcode:first");
    if( spErrCode.length )
        return spErrCode.text();
    
    spErrCode = $(responseXML).find("faultcode");
    if( spErrCode.length )
        return spErrCode.text();
    
    return "0x00000000";
};/* jQuery.fn.hasSPError() */



// PURPOSE:
// Given a sharepoint webservices response, this method will look to see if it 
// contains an error and return that error formated as a string.
//
// RETURNS:
//  {String} error message text
//
// USAGE:
//  alert($(xData).getSPError());
//  alert($(xData.responseXML).getSPError());
//
jQuery.fn.getSPErrorText    = function(){

    var responseXML = $(this).prop("responseXML");
    if( typeof($(this).prop("responseXML")) === "undefined" )
        responseXML = $(this);

    var errorText   = "Call to Sharepoint web services failed. ";
    
    if( $(responseXML).find("ErrorCode:first").text().length ) {
        errorText += "\n" + $(responseXML).find("ErrorCode:first").text()
            +   ": " + $(responseXML).find("ErrorText").text();
    } else if( $(responseXML).find("faultcode").length ) {
        errorText += $(responseXML).find("faultstring").text()
            + "\n" + $(responseXML).find("errorstring").text();
    } else {
        errorText = "";
    }
    return errorText;
}/* jQuery.fn.getSPError() */
