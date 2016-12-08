var home = home || {};

home = {
	author: "Kessy Similien (simkessy@gmail.com)",
	version: 1,
	listBaseUrl: (typeof _spPageContextInfo !== "undefined") ? (_spPageContextInfo.siteServerRelativeUrl !== "/") ? _spPageContextInfo.siteServerRelativeUrl : "" : L_Menu_BaseUrl,
	lists: [
		{
			name: "HR-Civ Home Slider",
			description: "Use this list to update the slider content and images",
			fields: [
				{'Type':'Text','DisplayName':'Description','AddToView':true},
				{'Type':'URL','DisplayName':'URL','AddToView':true},
			],
			view: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='URL' /><FieldRef Name='Description0' /></ViewFields>",
			template: 101,
			mapping: {
        ows_FileLeafRef: {
            mappedName: "title",
            objectType: "Text"
        },
        ows_URL: {
            mappedName: "url",
            objectType: "Text"
        },
        ows_Description0: {
        	mappedName: "description",
        	objectType: "Text"
        },
        ows_FileRef: {
          mappedName: "path",
          objectType: "Text"
        }
      }
		},{
			name: "HR-Civ Home Navigation",
			description: "Use this list to update the home naviation",
			fields: [
				{'Type':'URL','DisplayName':'URL','AddToView':true},
				{'Type':'Text','DisplayName':'Section','AddToView':true},
        {'Type':'Text','DisplayName':'Tab','AddToView':true},
				{'Type':'Number','DisplayName':'Order','AddToView':true}
			],
			view: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='Section' /><FieldRef Name='Order0' /><FieldRef Name='Tab' /><FieldRef Name='URL' /></ViewFields>",
			template: 100,
			mapping: {
        ows_Title: {
            mappedName: "title",
            objectType: "Text"
        },
        ows_URL: {
            mappedName: "url",
            objectType: "Text"
        },
        ows_FileRef: {
        	mappedName: "path",
        	objectType: "Text"
        },
        ows_Section: {
        	mappedName: "section",
        	objectType: "Text"
        },
        ows_Tab: {
        	mappedName: "tab",
        	objectType: "Text"
        },
        ows_Order0: {
          mappedName: "order",
          objectType: "Text"
        }
      }
	},{
      name: "HR-Civ Home Quick Links",
      description: "Use this list to update quick links section",
      fields: [
        {'Type':'URL','DisplayName':'URL','AddToView':true},
      ],
      view: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='URL' /></ViewFields>",
      template: 100,
      mapping: {
        ows_Title: {
            mappedName: "title",
            objectType: "Text"
        },
        ows_URL: {
            mappedName: "url",
            objectType: "Text"
        }
      }
  }],
  ready: false,
	data: {
		slider: [],
		nav: [],
    links: []
	},
	notice: function(msg) {
		SP.UI.Notify.addNotification(msg, false);
		//console.log(msg)
	},	
	init: function() {
		// check if lists exist
		home.check()
      .then(home.get)
        .then(function() {
          home.ready = true; 
          //console.log(home.data)
        })
	},
	check: function() {
		var dfd = jQuery.Deferred();

    // PING THE TWO LISTS WE NEED
    var listCheckPromises = [];
    $.each(home.lists, function(i, list) {
    	listCheckPromises[i] = $().SPServices({
    		operation: "GetList",
    		listName: list.name
    	})
    })

    // WHEN PROMISES RETURNED
    $.when.apply($, listCheckPromises).then(dfd.resolve(), fail)

    // THE LISTS DO NOT EXISTS
    // CREATE LISTS AND SET COLUMNS
    function fail() {
    	var err = "Setting up..."
    	home.notice(err)
    	home.create()
    	dfd.resolve();
    }
    return dfd.promise();
  },
  create: function() {
    // CREATE BOTH LISTS NEEDED FOR SITE MAP
    var createListsPromises = [];
    $.each(home.lists, function(index, list) {
    	createListsPromises[index] = $().SPServices({
    		operation: "AddList",
    		listName: list.name,
    		description: list.description,
    		templateID: list.template
    	})
    })

    // HANDLE PROMISES RETURNED
    $.when.apply($, createListsPromises).then(pass, fail)

    // SET LIST COLUMNS
    function pass() {
    	var text = 'Created lists, Adding columns...'
    	home.notice(text)
    	home.setColumns()
    }

    function fail(error) {
    	home.notice('Failed to create lists')
    }
  },
  setColumns: function() {
  	var dfd = $.Deferred()
    // GO THROUGH LISTS AND CREATE THEIR COLUMNS
    // ADD THOSE COLUMNS TO THE DEFAULT VIEW
    $.map(home.lists, function(list, index) {
    	var updateList = spjs_UpdateList(list.name, 
        L_Menu_BaseUrl, 
        list.fields, 
        [], 
        []);

      // ERROR HANDLING
      if(!updateList.success) {
      	home.notice(updateList.errorText)
      }else{
      	home.notice("Updated list: " + list.name)
      }

      if(home.lists.length == (index+1)) {
      	dfd.resolve()
      }
    })
    home.notice("Created lists successfully")

    return dfd.promise();
  },
  remove: function() {
  	var delPromise = [];

  	$.each(home.lists, function(index, list) {
  		delPromise[index] = $().SPServices({
  			operation: "DeleteList",
  			listName: list.name
  		})
  	})

  	home.notice('Lists deleted.')
  },
  get: function() { 
    var dfd = $.Deferred();
  	var getListPromises = [];

  	$.each(home.lists, function(index, list) {
  		getListPromises[index] = $().SPServices.SPGetListItemsJson({
      	listName: home.lists[index].name,
      	CAMLViewFields: home.lists[index].view,
      	mappingOverrides: home.lists[index].mapping
    	})
    	getListPromises[index].list = home.lists[index].name;
  	})

  	$.when.apply($, getListPromises).done(function() {
  		// home.notice('Retrieved items')
  		home.process(getListPromises)
        .then(function() {
          dfd.resolve()
        })
  	})
    return dfd.promise();
  },
  process: function(promiseArr) {
    var dfd = jQuery.Deferred();

  	$.map(promiseArr, function(promise) {
  		promise.then(function() {
  			var data = this.data;
  			var list = promise.list;


  			// IF navigation ELSE slider
  			if(list == "HR-Civ Home Navigation"){
  				$.map(data, function(item) {
  					home.data.nav.push({
  						title: item.title,
	  					section: item.section,
              tab: item.tab,
	  					order: item.order,
	  					url: item.url.split(",")[0],
	  					path: item.path.split("#")[1].split("_")[0] 
  					})
  				})
  			} else if (list == "HR-Civ Home Slider"){
  				$.map(data,function(item) {
	  				home.data.slider.push({
	  					title: item.title.split("#")[1].split(".")[0],
	  					url: item.url.split(",")[0],
	  					path: "../../" + item.path.split("#")[1],
              description: item.description
	  				})
  				})
  			} else {
          $.map(data,function(item) {
            home.data.links.push({
              title: item.title,
              url: item.url.split(",")[0],
            })
          })
        } 
  		})
  	})
    dfd.resolve();
    return dfd.promise();
  }
}

$(function(){
   SP.SOD.executeFunc('sp.js','SP.ClientContext', home.init)
})