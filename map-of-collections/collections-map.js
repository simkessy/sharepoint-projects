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
    errorHandling: {
        failure: function() { alert("Failed") }
    },
    init: function() {

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
        scmap.lists.map(function(list, index) {
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
            operation: "GetListItems",
            listName: scmap.lists[0].name,
            CAMLViewFields: scmap.lists[0].view
        })

        getCollections.then(success, scmap.errorHandling.failure)

        function success() {
            // get sites for each collection
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
        scmap.d.sites.current = collections.map(function(site, index) {
            var$().SPServices({
                operation: "GetAllSubWebCollection",
                webURL: site.URL
            });
        })

        // find changes
        var updates = scmap.d.sites.current.diff(scmap.d.sites.stored)


    }
};
