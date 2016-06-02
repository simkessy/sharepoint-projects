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
				{'Type':'Text','DisplayName':'SiteCollection'}],
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
		SP.UI.Notify.addNotification(msg, false);
	},
	errorHandling: {
		failure: function() { alert("Failed") }
	},
	init: function() {
		// check if lists exist
		scmap.checkForLists()

	},
	checkForLists: function() {
		var listCheckPromises = [];

		$.each(scmap.lists, function(i, list) {
			listCheckPromises[i] = $().SPServices({
				operation: "GetList",
  			listName: list.name,
			})
		})

		// $.map(listCheckPromises, function(listPromise, index){
		// 	listPromise.then(pass.bind(null, index), fail.bind(null, index))
		// })

    $.when.apply($, listCheckPromises).then(pass, fail)

		function pass() {
      var currentList = scmap.lists[index]
      console.log("PASS:", 'Lists created')
    }

    function fail(index) {
      // var currentList = scmap.lists[index]
			console.log("FAIL:", 'Lists do not exist. Creating...')
			scmap.createLists()
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

		// when promises complete, run update lists
    $.when.apply($, createPromises).then(pass, fail)

		// error handling on list creation
		function pass() {
			console.log("successfully created lists")
			scmap.setListColumns()
		}

		function fail(error) {
			console.log($(error).getSPErrorCode())
		}
	},
	setListColumns: function() {
		$.map(scmap.lists, function(list, index) {
			var updateList = spjs_UpdateList(list.name, L_Menu_BaseUrl, list.fields, [], []);

			if(!updateList.success) {
				console.log(updateList.errorText)
			}else{
				console.log("Updated list:", list.name)
			}
		})
    console.log('Add site collections to map')
	},
	getCollections: function() {
		siteCollectionsPromise = $().SPServices.SPGetListItemsJson({
			listName: scmap.lists[0].name,
			CAMLViewFields: scmap.lists[0].view,
      mappingOverrides: {
        ows_Title: {
            mappedName: "title",
            objectType: "Text"
        },
        ows_URL: {
            mappedName: "url",
            objectType: "Text"
        }
      }
		})

		siteCollectionsPromise.then(success, scmap.errorHandling.failure)

		function success() {
			var result = this.data
			// get each collection
			scmap.d.collections.current = this.data.map(function(sc) {
        return {title: sc.title, url: sc.url}
      })
			// loop through each site collection
			// get all sites per collection
      scmap.d.collections.current.map(scmap.getSites)

			// find diff between current list
			// remove deleted items
			// add new items

			// or remove all and add new
			//scmap.getSites();
		}
	},
  getSites: function(collection) {
    var sitePromise = $().SPServices({
      operation: "GetAllSubWebCollection",
      webURL: collection.url,
      completefunc: function(xData, Status) {
        var results = $(xData.responseXML);
        results.find("Web").each(function() {
          var self = $(this);
          scmap.d.sites.current.push({
            title: self.attr("Title"),
            url: self.attr("Url"),
            collection: collection.title
          })
        })
      }
    })
  },
  update: function() {
    var b, webs, thisBaseUrl, p, currItems, currItemsObj, newList, uList, data, res, noChangeCount, uCount, nCount, dCount, error;

    // create this object right away in getSites
    var webs = {}

    // process each site
    scmap.d.sites.current.map(function(o, i) {

      //remove http:// + domain
      thisBaseUrl = o.url.replace(location.protocol + "//" + location.host, "");

      // if there's nothing (root site), give it "/"
      if (thisBaseUrl === "") {
        thisBaseUrl = "/";
      }

      //remove http:// + domain
      p = o.url.replace(location.protocol + "//" + location.host, "");

      // get parent by removing everything after last "/"
      p = p.substring(0, p.lastIndexOf("/"));

      // if no parent, set parent to root
      if (p === "") {
        p = "/";
      }

      // build object with each site title and parent
      webs[thisBaseUrl] = {
        "title": o.title,
        "parent": p,
        "collection": o.collection
      };
    });

    // GET ALL CURRENT SITES IN SITE-MAP LIST
    currItems = spjs_QueryItems({
      "listName": scmap.lists[1].name,
      "listBaseUrl": spjs.siteMap.data.listBaseUrl,
      "query": "<Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where>",
      "viewFields": ["ID", "CurrentSite", "Parent", "URL", "SiteCollection"]
    });

    // START HANDLING ADDING LINKS TO THE NEW LIST
    currItemsObj = {};
    noChangeCount = 0;
    uCount = 0; // UPDATE COUNT
    nCount = 0; // NEW COUNT
    dCount = 0; // DELETE COUNT

    // CREATE OBJECT FOR ALL SITES
    $.each(currItems.items, function(i, item) {
      currItemsObj[item.URL === null ? "" : item.URL] = {
        "ID": item.ID,
        "CurrentSite": item.CurrentSite,
        "Parent": item.Parent,
        "URL": item.URL,
        "SiteCollection": item.SiteCollection
      };
    });

    error = false;    // GO THROUGH ALL RETURNED SITES FOR COLLECTION

    $.each(webs, function(url, o) {
      // CREATE ITEM: TITLE - CURRENT - URL - PARENT
      //// ADD COLLECTION HERE!
      data = {
        "Title": "[...]",
        "CurrentSite": "{\"v\":\"" + url + "\",\"f\":\"<a href='" + url + "' target='_blank'>" + o.title + "</a>\"}",
        "URL": url,
        "Parent": o.parent,
        "SiteCollection": o.collection
      }

      // CHECK IF CURRENT SITE ALREADY IN LIST
      // IF CURRENT SITE FOUND!
      if (currItemsObj[url] !== undefined) {
        // FOUND THE SITE GIVEN URL
        // NOW CHECK IF ALL PROPERTIES ARE UNCHANGED
        //// SHOULD ADD A CHECK FOR SITE COLLECTION AS WELL
        if (
          (currItemsObj[url].CurrentSite === data.CurrentSite) &&
          (currItemsObj[url].Parent === o.parent) &&
          (currItemsObj[url].URL === url) &&
          (currItemsObj[url].SiteCollection === o.collection)
          ) {

          // IF THERE'S NO CHANGE FOR CURRENT ITEM, REMOVE FROM CURRENT ITEM LIST
          // REMAINING ITEMS WILL BE THE UPDATES
          delete currItemsObj[url];
          noChangeCount += 1;
          return;
        }

        // REMAINING ITEMS, UPDATES TO BE MADE
        res = spjs_updateItem({
          "listName": scmap.lists[1].name,
          "listBaseUrl": spjs.siteMap.data.listBaseUrl,
          "id": currItemsObj[url].ID,
          "data": data
        });

        // REMOVE CURRENTLY UPDATED ITEM
        delete currItemsObj[url];

        // IF THERE'S AN ERROR IN UPDATED THE ITEM
        if (!res.success) {
          error = {
            "errorText": res.errorText,
            "code": res.errorCode
          };
          return false;
        } else {
          // INCREMENT UPDATE COUNT
          uCount += 1;
        }
      } else {
        // IF ITEM NOT FOUND
        // UPDATE THE LIST WITH THE NEW ITEM
        res = spjs_addItem({
          "listName": scmap.lists[1].name,
          "listBaseUrl": spjs.siteMap.data.listBaseUrl,
          "data": data
        });
        if (!res.success) {
          // ERROR ON NEW ITEM CREATION
          error = {
            "errorText": res.errorText,
            "code": res.errorCode
          };
          return false;
        } else {
          // INCREMENT NEW COUNT
          nCount += 1;
        }
      }
    });

    // ERROR HANDLING
    if (error !== false) {
      alert("SPJS-SiteMap: An error occurred\n---------------------------------------\nAre you updating from a previous version? If the below error message tells you that one or more field types are not installed correctly, please delete the list \"SPJS-SiteMap\" and rerun this script. The list will be recreated with the missing fields.\n\nPlease note that you must edit the SiteMap chart to reselect the list and fields.\n\nError message\n---------------------------------------\n" + error.errorText);
    }


    // DELETE REMAINING ITEMS - SITES NO LONGER IN COLLECTION
    $.each(currItemsObj, function(url, obj) {
      res = spjs_deleteItem({
        "listName": scmap.lists[1].name,
        "listBaseUrl": spjs.siteMap.data.listBaseUrl,
        "id": obj.ID
      });
      if (!res.success) {
        alert("[spjs.siteMap]\n\n" + res.errorText);
        return false;
      } else {
        dCount += 1;
      }
    });

    // FINAL RESULTS POP UP
    alert("SPJS-SiteMap\n\nUpdated: " + uCount + "\nAdded: " + nCount + "\nRemoved: " + dCount);

  }
};
