var fail = function() {
  alert('Something didnt work');
}

var get = function(date) {
  var dateFormat = "YYYY-MM-DD HH:mm:ss"
  var query = '<Query><Where><And><Geq><FieldRef Name="Status_x0020_Date" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + date.format(dateFormat) + '</Value></Geq><Leq><FieldRef Name="Status_x0020_Date" /><Value IncludeTimeValue="TRUE" Type="DateTime">' + date.endOf('day').format(dateFormat) + '</Value></Leq></And></Where></Query>'; 

  var get = $().SPServices.SPGetListItemsJson({
    listName: "EX Class Overview and Authorization Calendar",
    CAMLQuery: query,
    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Status' /><FieldRef Name='Position_x0020_Title' /><FieldRef Name='Position_x0020_Classification' /><FieldRef Name='Client' /><FieldRef Name='Next_x0020_Step' /></ViewFields>", 
  });


  var pass = function() {
    //console.log(this.data)

    function renderCard(x) {
      var html = ''
      html += "<div class='card shadow' data-id='" + x.ID + "' data-title='" + x.Position_x0020_Title + "'><h3>" + x.Position_x0020_Title + "</h3>"
      html += "<p><strong>Position Class: </strong>" + x.Position_x0020_Classification +"</p>"
      html += "<p><strong>Client: </strong>" + x.Client +"</p>"
      html += "<p><strong>Status: </strong>" + x.Status +"</p>"
      html += "<p><strong>Next Step: </strong>" + x.Next_x0020_Step +"</p>"
      html += "</div>"
      return html
    }
    var container = $(".container")
    container.empty()
    
    var data = this.data;

    $.map(data, function(item,index){
      // console.log(item)
      container.append(renderCard(item)).hide().fadeIn("fastest");
    })

    // Set Dialog click event handler
    $(".card").click(dialog)

  }

  get.then(pass, fail)
}


var prepareCalendar = function() {
  // Disable day views
  $dates = $('.ms-acal-summary-dayrow > td');
  $dates.each(function(){
    $(this).removeAttr("evtid");
    $(this).removeAttr("date");
  });
  
  // hook into the existing SharePoint calendar load function
  (function hideCalendarEventLinkIntercept() {
    var OldCalendarNotify4a = SP.UI.ApplicationPages.CalendarNotify.$4b;
    SP.UI.ApplicationPages.CalendarNotify.$4b = function() {
      OldCalendarNotify4a();
      hideCalendarEventLinks();
    }
  })();

  // hide the hyperlinks
  (function hideCalendarEventLinks() {

    // find all DIVs
    var divs = document.getElementsByTagName("DIV");
    for (var i = 0; i < divs.length; i++) {
      // find calendar item DIVs
      if (divs[i].className.toLowerCase() == "ms-acal-item") {
        // find the hyperlink
        var links = divs[i].getElementsByTagName("A");
        if (links.length == 1) {
          // replace the hyperlink with text
          links[0].parentNode.innerHTML = links[0].innerHTML
        }
      }

      // find "x more items" links and re-remove links on Expand/Contract
      if (divs[i].className.toLowerCase() == "ms-acal-ctrlitem") {
        var links = divs[i].getElementsByTagName("A");
        if (links.length == 1) {
          links[0].href = "javascript:hideCalendarEventLinks();void(0);"
        }
      }
    }
  })();

  (function MyCalendarHook() {
    var calendarCreate = SP.UI.ApplicationPages.CalendarContainerFactory.create;
    SP.UI.ApplicationPages.CalendarContainerFactory.create = function(elem, cctx, viewType, date, startupData) {
      cctx.canUserCreateItem = false;
      calendarCreate(elem, cctx, viewType, date, startupData);
    }
  })();

  // Set handler for when day is clicked
  var calendarItems = $(".ms-acal-month td");
  calendarItems.on("click", function(e) {
    var itemClass = $(this).closest("tr").attr('class');
    var week, date, dayOfWeek;

    dayOfWeek = e.currentTarget.cellIndex;

    if (itemClass == "ms-acal-summary-itemrow") {
      week = $(this).closest("tr").prev("tr").find("th").attr("date")
    }else{
      --dayOfWeek
      week = $(this).parent().find("th").attr("date");
    }
    date = moment(week).add(dayOfWeek, "days")
    //console.log(date)
    //Get items for that day
    get(date)
  })

  // Set a location for where the project title will deplay
  // if ($(".cal-item-title").length == 0)
    // $("#WPQ2_nav_header").after($('<div>',{"class": "cal-item-title ms-acal-display", text: "place holder text"}))


  // Set hover handler on each item
  $("body")
    .on("mouseenter", ".ms-acal-item", function() {
      var title = $(this).find(".ms-acal-title").text()
      var title2 = $(this).find(".ms-acal-sdiv").text()
      var newTitle = title || title2;
      $(".cal-item-title").text(newTitle)
    })
    .on("mouseleave", ".ms-acal-item", function() {
      $(".cal-item-title").text("")
    })

    setTimeout(function() {
      $(".ms-acal-item").each(function() {
        $(this).removeAttr('title');
      });
    }, 500)
}


var dialog = function() { 
  // Get ID from item
  var id = $(this).data('id')
  // Generate dialog url using id
  var url = _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/DispForm2.aspx?ID=" + id;

  // Lunch dialog
  SP.UI.ModalDialog.showModalDialog({ 
    url: url, 
    title: $(this).data('title') 
  }); 
} 

$("#AsynchronousViewDefault_CalendarView")
  .on("click", "a[title$='Month']", function() {setTimeout(prepareCalendar, 500)})

ExecuteOrDelayUntilScriptLoaded(prepareCalendar, "SP.UI.ApplicationPages.Calendar.js");