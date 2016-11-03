$(function() {
  wg.getWorkingGroups().then(function(data) {
    processGroups(data)
    window.x = data;
    prepSearch();
  })
})

var processGroups = function(data) {
  var wgContaier = $('.all-wg');
  var grouped = _.groupBy(data, 'WG_Type');
  console.log(grouped)
  
  Object.keys(grouped).sort().map(function(key) {
    console.log(key)
    var nKey = key.replace(/\s/g,"") //remove space

    var header = $("<div>",{"class":"page-header"})
    var headerText = $("<h1>", {"class": "wg-" + nKey, text: key})
    
    wgContaier
      .append(header.append(headerText))
      .append($("<ul>", {"class": "row " + nKey}));


    var items = _.sortBy(grouped[key], "Title");
    console.log(items)
    
    items.map(function(item) {
      $("<a>", {
        'class': "list-group-item col-xs-5",
        href: "/sites/HRCS/IS/MyGCHR/Pages/WG.aspx?wgID=" + item.ID,
        text: item.Title
      }).appendTo(wgContaier.find("ul." + nKey))
    })
  });
}


//---------------------- INSTANT SEARCH ----------------------//
var prepSearch = function() {
  // Our filter input.
  var input = $("input#filter");
  // Table row of the items in my list.
  var listItems = $(".list-group-item");

  // Hide rows based on search text
  input.keyup(function() {
    var searchText = input.val().toLowerCase();
    listItems.each(function() {
      var text = $(this).text().toLowerCase();
      (text.indexOf(searchText) != -1) ? $(this).slideDown(): $(this).slideUp();
    })
  })
}