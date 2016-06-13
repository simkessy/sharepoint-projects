// Defaults 
isEnglish = (GetUrlKeyValue("lang") == "en") ? true : false;
displayView = isEnglish ? "DispEn" : "DispFr";

// Display form handling
var OpenDialog = function(itemID, itemTitle) {
  var options = {
    url: _spPageContextInfo.webServerRelativeUrl + "/DLC_Classes/Forms/" + displayView + ".aspx?ID=" + itemID,
    dialogReturnValueCallback: DialogCallback,
    title: itemTitle
  };
  SP.UI.ModalDialog.showModalDialog(options);
}

function DialogCallback(dialogResult, returnValue) {}

//Document ready
$(function() {
  // Hide name field from table
  $("nobr:contains('Name')").closest('tr').hide();

  // Set width for preview container
  $(".ms-ppleft").parent("td").css("width", "50%")

  // Set button event handlers
  $('#searchBtn').click(function() {
    search();
  })

  $("#resetBtn").click(function() {
    window.location = window.location.href.split('&')[0]
  })

  // Get select filters
  var topicFilter = $("#topicSelect");
  var communityFilter = $("#communitySelect");
  var deliveryFilter = $("#deliverySelect");


  // Set event hanlder for filter change
  var topicValue, communityValue, deliveryValue;

  // Flag  to identify which select has been used
  var topicChanged = false;
  var communityChanged = false;
  var deliveryChanged = false;

  // Filter event handlers
  topicFilter.change(function() {
    topicChanged = true;
    topicValue = "&topic=" + escape($(this).val());
  })

  communityFilter.change(function() {
    communityChanged = true;
    communityValue = "&FilterName=Community1&FilterMultiValue=*" + escape($(this).val()) + "*";
  })

  deliveryFilter.change(function() {
    deliveryChanged = true;
    deliveryValue = "&FilterField2=Delivery0&FilterValue2=" + escape($(this).val());
  })

  // Set url based on selected filters
  function search() {

    var currentPath = window.location.href.split("&")[0];
    var filters = "";

    // If topic has been changed, use the new value
    // If topic has not been changed from previous search, use the previous value 
    // Get the previous value from url parameter 
    if (typeof topicValue !== 'undefined') {
      filters += topicValue
    } else if (GetUrlKeyValue("topic") != "") {
      filters += "&topic=" + escape(GetUrlKeyValue("FilterValue1"));
    }

    if (typeof communityValue !== 'undefined') {
      filters += communityValue
    } else if (GetUrlKeyValue("FilterMultiValue") != "") {
      filters += "&FilterName=Community1&FilterMultiValue=*" + escape(GetUrlKeyValue("FilterMultiValue").slice(1, -1)) + "*";
    }

    if (typeof deliveryValue !== 'undefined') {
      filters += deliveryValue
    } else if (GetUrlKeyValue("FilterValue2") != "") {
      filters += "&FilterField2=Delivery0&FilterValue2=" + escape(GetUrlKeyValue("FilterValue2"));
    }

    var searchUrl = currentPath + filters;
    window.location = searchUrl;
    console.log(searchUrl);
  }

  // Get values for dropdown filters
  function loadFilters() {

    function getTopic() {
      // Store result in var promise so I can use .then(success function, failure function) <---error handling
       var promise = $().SPServices.SPGetListItemsJson({
        operation: "GetListItems",
        listName: "DLC Topics",
        CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='Suject' /></ViewFields>", //fields I want
        mappingOverrides: {
          ows_Title: { // field names returned
            mappedName: "english", // what I want them to actually be called, example: {english: "some text"}
            objectType: "Text"
          },
          ows_Suject: {
            mappedName: "french",
            objectType: "Text"
          }
        }
      });

      // once the request has finished, do stuff
      promise.then(function() {
        //handle successful response --- 
        //here i'm writting the instructions directly inside but I could have a function called success()
        // it would like like this .then(success, failure)
        // it's a preference thing

        // the json data returned
        var result = this.data;

        //jQuery loop through each item 
        $.each(result, function(index, item) {
          // append to a drop down but you'd likely do something different here
          topicFilter.append($('<option>', {
            value: item.english.toString(),
            text: isEnglish ? item.english : item.french
          }))
        })

        var topic = GetUrlKeyValue("topic");
        if (topic != "") {
          topicFilter.val(topic)
        }
      }, function() {
        // handle failed response
      })
    }

    function getCommunity() {

      var promise = $().SPServices.SPGetListItemsJson({
        operation: "GetListItems",
        listName: "DLC Community",
        mappingOverrides: {
          ows_Title: {
            mappedName: "english",
            objectType: "Text"
          },
          ows_Communaut_x00e9_: {
            mappedName: "french",
            objectType: "Text"
          }
        }
      });

      promise.then(function() {
        var result = this.data;

        $.each(result, function(index, item) {
          communityFilter.append($('<option>', {
            value: item.english.toString(),
            text: isEnglish ? item.english : item.french
          }))
        })

        var community = GetUrlKeyValue("FilterMultiValue");
        if (community != "") {
          communityFilter.val(community.slice(1, -1))
        }
      })
    }

    function getDelivery() {

      var promise = $().SPServices.SPGetListItemsJson({
        operation: "GetListItems",
        listName: "DLC Delivery Type",
        mappingOverrides: {
          ows_Title: {
            mappedName: "english",
            objectType: "Text"
          },
          ows_Mode_x0020_de_x0020_livraison: {
            mappedName: "french",
            objectType: "Text"
          }
        }
      });

      promise.then(function() {
        var result = this.data;

        $.each(result, function(index, item) {
          deliveryFilter.append($('<option>', {
            value: item.english.toString(),
            text: isEnglish ? item.english : item.french
          }))
        })

        var delivery = GetUrlKeyValue("FilterValue2");
        if (delivery != "") {
          deliveryFilter.val(delivery)
        }
      })
    }

    getTopic();
    getCommunity();
    getDelivery();
  }
  loadFilters();


  //---------------------- INSTANT SEARCH ----------------------//
  // Our filter input.
  var input = $("input#filterInput");
  //Table
  var table = $("[id^='previewpanetable']")
  // Table row of the items in my list.
  var listItems = $(".ms-ppanerow, .ms-ppanerowalt");


  // Hide rows based on search text
  input.keyup(function() {
    var searchText = input.val()
    listItems.each(function() {
      var text = $(this).find("div").first().text().toLowerCase();
      (text.indexOf(searchText) != -1) ? $(this).show(): $(this).hide();
    })
  })

  input.change(function() {
    noResultCheck();
  })

  // Hide table when no reuslts
  function noResultCheck() {
    var preview = $(".ms-ppleft");
    var noResults = $(".ms-ppanerow:visible, .ms-ppanerowalt:visible").length == 0;
    (noResults) ? preview.css("visibility", "hidden"): preview.css("visibility", "visible");
  }

  //---------------------- HANDLE FILTER TRANSLATION ----------------------// 
  // Set filter attributes 
  if (isEnglish) {
    input.attr('placeholder', input.data('placeholder-en'));
    $(".popover-topic").removeAttr("title").removeAttr('data-content');
    $(".popover-topic").popover({
      container: 'body',
      placement: 'bottom',
      title: "Topic",
      content: "Filter the results below by various topics of interest."
    });

    $(".popover-community").removeAttr("title").removeAttr('data-content');
    $(".popover-community").popover({
      container: 'body',
      placement: 'bottom',
      title: "Community",
      content: "Filter the results below to specific communities of interest."
    });

    $(".popover-delivery").removeAttr("title").removeAttr('data-content');
    $(".popover-delivery").popover({
      container: 'body',
      placement: 'bottom',
      title: "Delivery Type",
      content: "Filter the results by method of delivery."
    });

    // Set filter placeholders
    topicFilter.find("option:selected").text("Select Topic...");
    communityFilter.find("option:selected").text("Select Community...");
    deliveryFilter.find("option:selected").text("Select Delivery Type...");
	
	$('#searchBtn').text("Search")
  } else {
    // Set search box placeholder
    input.attr('placeholder', input.data('placeholder-fr'));

    // Enable popovers
    $('[data-toggle="popover"]').popover({
      container: 'body',
      placement: 'bottom'
    })

  }
})
