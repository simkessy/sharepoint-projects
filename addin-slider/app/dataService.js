var spslider = spslider || {}

spslider = {
  author: "K-Sim Consulting Inc.",
  version: "0.0.1",
  list: {
    name: "SPSliderSettings",
    mapping: {
      ows_Title: {
        mappedName: "title",
        objectType: "Text"
      }
  },
  data: {
    settings: [],
    allSites: [],
    slider: []
    selectedSite: null,
    columns: {
      caption: null,
      imgPath: null,
      title: null,
      url: null,
    }
  },
  notice: function() {
    SP.UI.Notify.addNotification(msg, false);
    console.log(msg)
  },
  init: function() {
    slider.check()
      .then(slider.getAllSites)
  },
  check: function() {
    var d = $.Deferred()

    var checkSettings = $().SPServices({
      operation: "GetList",
      listName: spslider.list.name
    })

    checkSettings.then(spslider.getSettings, spslider.createSettings);

    return d.promise();
  },
  createSettings: function() {
    var d = $.Deferred();

    var createSettings = $().SPServices({
      operation: "AddList",
      listName: spslider.list.name,
      description: spslider.list.description,
      templateID: spslider.list.template
    })

    createSettings.then(pass, fail);

    return d.promise();
  }
  getSettings: function() {
    var d = $.Deferred()

    var getSettings = $().SPServices.SPGetListItemsJson({
      listName: spslider.list.name,
      mappingOverrides: spslider.list.mapping
    })

    getSettings.then(pass, fail);

    return d.promise();
  }
  getAllSites: function() {
    var d = $.Deferred();

    var getSites = $().SPServices({
      operation: "GetAllSubWebCollection",
    });

    getSites.then(spslider.getLists,fail)

    return d.resolve();
  },
  getAllLists: function() {
    var d = $.Deferred();

    var getLists = $().SPServices({
      operation: "GetListCollection",
      // webURL: spslider.selectedSite
    })

    getLists.then(spslider.getList, fail);

    return d.promise();
  },
  getList: function () {
    var d = $.Deferred();

    var getList = $().SPServices({
      operation: "GetList",
      listName: list
    })

    getList.then(pass, fail)

    return d.promise();
  },
  getColumns: function() {
    var d = $.Deferred();

    var getList = $().SPServices({
      operation: "GetList",
      listName: list
    })

    getList.then(pass, fail)

    return d.promise();
  },
  save: function() {

  }
}

