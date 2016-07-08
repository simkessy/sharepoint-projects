$(function() {
	$.jgrid.defaults.width = 780;
	$.jgrid.defaults.responsive = true;

 	var lists = ["sub-list-1", "sub-list-2", "sub-list-3"]

 	lists.map(getItems)
 	
	var finalObj = [];

 	function getItems(listname, index) {
		var listItems = $().SPServices.SPGetListItemsJson({
			webURL: "http://collaboration-hr-civ.forces.mil.ca/sites/HRCSS/IMIT-Sandbox/SPLists",
			listName: listname,
			CAMLViewFields: '<ViewFields><FieldRef Name="Title"/><FieldRef Name="Category"/><FieldRef Name="Region"/></ViewFields>',
			mappingOverrides: {
			  ows_Title: {
			    mappedName: "title"
			  },
			  ows_Category: {
			    mappedName: "category"
			  },
			  ows_Region:{
			  	mappedName: "region"
			  }
			} 
		});	

		var pushItems = function(item) {
			finalObj.push({
				title: item.title,
				category: item.category,
				region: item.region
			})
		}

		listItems.then(function() {
			var data = this.data.map(pushItems)
			console.log(finalObj)
		})
 	}

	var launchGrid = function() {
		var $table = $("#jqGrid");
		$table.jqGrid({
			data: finalObj,
		   datatype: "local",
		   height: 250,
		   colModel:[
		        {label: "Title", name:'title',index:'title'},
		        {label:"Category", name:'category',index:'category'},
		        {label:"Region", name:'region',index:'region'},
		    ],
		   caption: "HR Priorities Master",
		   grouping: true,
		   groupingView: {
		   	groupField: ['region', 'category'],
		   	groupColumnShow : [],
		   	groupText : ['<b>{0} - {1} Item(s)</b>'],
		   	groupCollapse : true,
		    },
		   height: 500,
		   rowNum: 20,
   		rowList:[20, 50, 100],
   		height: 'auto',
   		pager: "#jqGridPager",
   		sortname: 'title',
    		sortorder: "asc",
    		viewrecords: true
		});

	  // activate the build in navigator
	  $('#jqGrid').navGrid("#jqGridPager", {
	    search: true, // show search button on the toolbar
	    add: false,
	    edit: false,
	    del: false,
	    refresh: true
	  });

	}

	setTimeout(launchGrid, 1000)

})
