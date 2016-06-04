var scmap = scmap || {};

scmap = {
  author: "Kessy Similien (simkessy@gmail.com)",
  version: 1,
  listBaseUrl: (typeof _spPageContextInfo !== "undefined") ? (_spPageContextInfo.siteServerRelativeUrl !== "/") ? _spPageContextInfo.siteServerRelativeUrl : "" : L_Menu_BaseUrl,
  lists: [
    {
      name: "Site-Map-Collections",
      description: "This list will contain all site collections for the SPJS Charts",
      fields: [{'Type':'Note','DisplayName':'URL','AddToView':true}],
      view: "<ViewFields><FieldRef Name='URL' /></ViewFields>"
    },{
      name: "Site-Map",
      description: "This list is used as datasource for SPJS Charts for SharePoint.",
      fields: [
        {'Type':'Note','DisplayName':'CurrentSite','AddToView':true},
        {'Type':'Note','DisplayName':'Parent','AddToView':true},
        {'Type':'Note','DisplayName':'URL','AddToView':true},
        {'Type':'Text','DisplayName':'SiteCollection','AddToView':true}],
      view: "<ViewFields><FieldRef Name='CurrentSite' /><FieldRef Name='CurrentSite' /><FieldRef Name='Parent' /><FieldRef Name='URL' /><FieldRef Name='SiteCollection' /></ViewFields>"
  }],
  d: {
    collections: [],
    sites: {}
  },
  showButton: function(){
    $("#siteMapBtn").html("<input type='button' onclick='scmap.init()' value='Add or update site map' />");
  },
  notice: function(msg) {
    SP.UI.Notify.addNotification(msg, false);
    console.log(msg)
  },
  init: function() {
    // check if lists exist
    scmap.checkForLists()
      .then(scmap.getCollections)
      .then(scmap.getSites)
      .then(scmap.update)
  },
  checkForLists: function() {
    var dfd = jQuery.Deferred();

    // PING THE TWO LISTS WE NEED
    var listCheckPromises = [];
    $.each(scmap.lists, function(i, list) {
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
      var err = "FAIL: Lists do not exist. Creating..."
      scmap.notice(err)
      scmap.createLists()
      dfd.resolve();
    }

    return dfd.promise();
  },
  createLists: function() {
    // CREATE BOTH LISTS NEEDED FOR SITE MAP
    var createListsPromises = [];
    $.each(scmap.lists, function(index, list) {
      createListsPromises[index] = $().SPServices({
        operation: "AddList",
        listName: list.name,
        description: list.description,
        templateID: 100
      })
    })

    // HANDLE PROMISES RETURNED
    $.when.apply($, createListsPromises).then(pass, fail)

    // SET LIST COLUMNS
    function pass() {
      var text = 'Created lists, Adding columns...'
      scmap.notice(text)
      scmap.setListColumns()
        .then(scmap.addDefaultCollection)
    }

    function fail(error) {
      scmap.notice('Failed to creater lists')
    }
  },
  setListColumns: function() {
    var dfd = $.Deferred()
    // GO THROUGH LISTS AND CREATE THEIR COLUMNS
    // ADD THOSE COLUMNS TO THE DEFAULT VIEW
    $.map(scmap.lists, function(list, index) {
      var updateList = spjs_UpdateList(list.name, L_Menu_BaseUrl, list.fields, [], []);

      // ERROR HANDLING
      if(!updateList.success) {
        scmap.notice(updateList.errorText)
      }else{
        scmap.notice("Updated list: " + list.name)
      }

      if(scmap.lists.length == (index+1)) {
        dfd.resolve()
      }
    })
    scmap.notice("Created lists successfully")

    return dfd.promise();
  },
  addDefaultCollection: function() {
    // ADD CURRENT SITE TO SITE COLLECTION
    var defaultCollectionTitle = _spPageContextInfo.siteServerRelativeUrl.split("/")[2]
    var defaultCollectionUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

    $().SPServices({
        operation: "UpdateListItems",
        batchCmd: "New",
        listName: scmap.lists[0].name,
        valuepairs: [["Title", defaultCollectionTitle], ["URL", defaultCollectionUrl]],
        completefunc: function(xData, Status) {
          scmap.init();
        }
    });

    scmap.notice('Default collection added')

    alert("Ready! \n\nYou will need to add Site Collection links to the Site-Map-Collections list. \n\nThen follow instructions on how to set up the Organization Chart")
  },
  getCollections: function() {
    var dfd = jQuery.Deferred();

    // GET LIST OF ALL SITE COLLECTIONS IN THE SITE COLLECTION CONTAINER
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

    // HANDLE PROMISE RESPONSE
    siteCollectionsPromise.then(pass, scmap.notice)

    function pass() {
      var result = this.data
      // STORE EACH COLLECTION WITH TITLE AND URL PROPERTIES
      scmap.d.collections = $.map(result, function(sc) {
        return {title: sc.title, url: sc.url}
      })

      dfd.resolve(scmap.d.collections);
    }
    return dfd.promise();
  },
  getSites: function(collections) {
    console.log("getSites")
    var dfd = $.Deferred()

    // RETURN ALL SITES FOR EACH COLLECTION
    var getSitesPromises = [];
    $.map(collections, function(collection, index) {
      getSitesPromises[index] = $().SPServices({
        operation: "GetAllSubWebCollection",
        webURL: collection.url
      })
    })

    $.when.apply($, getSitesPromises).then(pass, scmap.notice)

    function pass() {
      $.map(getSitesPromises, function(response, index) {
        var result = $(response.responseText)
        var collectionName = scmap.d.collections[index].title

        var processSite = function() {
          var self = $(this);

          var thisBaseUrl = self.attr("Url").replace(location.protocol + "//" + location.host, "");

          // if there's nothing (root site), give it "/"
          if (thisBaseUrl === "") {
            thisBaseUrl = "/";
          }

          //remove http:// + domain
          var p = self.attr("Url").replace(location.protocol + "//" + location.host, "");

          // get parent by removing everything after last "/"
          p = p.substring(0, p.lastIndexOf("/"));

          // if no parent, set parent to root
          if (p === "") {
            p = "/";
          }

          // build object with each site title and parent
          scmap.d.sites[thisBaseUrl] = {
            "title": self.attr("Title"),
            "parent": p,
            "collection": collectionName
          };
        }

        result.find("Web").map(processSite)
      })
      dfd.resolve()
    }
    return dfd.promise();
  },
  update: function() {
    console.log("Updating...")

    var currItems, currItemsObj, data, res, noChangeCount, uCount, nCount, dCount, error;

    // GET ALL CURRENT SITES IN SITE-MAP LIST
    currItems = spjs_QueryItems({
      "listName": scmap.lists[1].name,
      "listBaseUrl": scmap.listBaseUrl,
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

    $.each(scmap.d.sites, function(url, o) {
      // CREATE ITEM: TITLE - CURRENT - URL - PARENT
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
        if ((currItemsObj[url].CurrentSite === data.CurrentSite) &&
          (currItemsObj[url].Parent === o.parent) &&
          (currItemsObj[url].URL === url) &&
          (currItemsObj[url].SiteCollection === o.collection)) {

          // IF THERE'S NO CHANGE FOR CURRENT ITEM, REMOVE FROM CURRENT ITEM LIST
          // REMAINING ITEMS WILL BE THE UPDATES
          delete currItemsObj[url];
          noChangeCount += 1;
          return;
        }

        // REMAINING ITEMS, UPDATES TO BE MADE
        res = spjs_updateItem({
          "listName": scmap.lists[1].name,
          "listBaseUrl": scmap.listBaseUrl,
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
          "listBaseUrl": scmap.listBaseUrl,
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
        "listBaseUrl": scmap.listBaseUrl,
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
    scmap.notice("Updated: " + uCount + "\nAdded: " + nCount + "\nRemoved: " + dCount);
  }
};

$(function(){
  SP.SOD.executeFunc('sp.js','SP.ClientContext', scmap.showButton);
})
