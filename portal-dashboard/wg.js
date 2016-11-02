$(function() {
  var id = $().SPServices.SPGetQueryString().wgID;
  
  var user = $().SPServices.SPGetCurrentUser({
    fieldNames: ["ID", "Name"]
  });
  var currentUser = user.ID + ";#" + user.Name.split("\\")[1];
  var existingUsers = [];
  var project = null; // store current project

  // Utility function to process attendees list
  var processAttendees = function(data) {
    var attendance = data.Attendee_x0028_s_x0029_;
    if (_.isNull(attendance)) {
      return "";
    } else {
      var arr = [];
      attendance.map(function(x) {
        existingUsers.push(x.userId + ";#" + x.userName.toLowerCase())
        arr.push(x.userName.toString().replace(",", ", "));
      });
      return arr;
    }
  };

  // Add or Remove self from attendance list
  var manageAttendee = function() {
    var isAttending = _.includes(existingUsers, currentUser)
    var addBtn = $('.add-user');
    var removeBtn = $('.remove-user');

    isAttending ? removeBtn.removeClass('hidden').show() : addBtn.removeClass('hidden').show()

    addBtn.click(function() {
      existingUsers.push(currentUser)
      var newUserSet = existingUsers.join(";#");
      updateAttendee(newUserSet, true)
    })

    removeBtn.click(function() {
      var newUserSet = _.without(existingUsers, currentUser).join(";#")
      // console.log(newUserSet)
      updateAttendee(newUserSet, false)
    })

    var updateAttendee = function(users, adding) {
      var promise = $().SPServices({
        operation: "UpdateListItems",
        listName: "Attended Meetings",
        ID: id,
        valuepairs: [
        ["Attendee_x0028_s_x0029_", users]
        ]
      })

      promise.then(function() {
        var msg = adding ? "Attending working group" : "Removed from attendance"
        SP.UI.Notify.addNotification(msg);
        location.reload()
      }, function() {
        alert('Error updating working group')
      })
    }
  }

  // Display form handling
  var openDialog = function(itemID, itemTitle, type) {
    var eventsPath = "/Lists/Demos/DispForm.aspx?ID=";
    var feedbackPath = "/Lists/Working%20Group%20Feedback/DispForm.aspx?ID=";
    var path = (type == "event") ? eventsPath : feedbackPath;
    var url = _spPageContextInfo.webServerRelativeUrl + path + itemID;

    var options = {
      url: url,
      title: itemTitle
    };
    SP.UI.ModalDialog.showModalDialog(options);
  }

  // Display dialog when event clicked
  var setDialogClickEvent = function() {
    var itemID = $(this).data('id');
    var itemTitle = $(this).data('title');
    var itemType = $(this).data('type');
    openDialog(itemID, itemTitle, itemType)
  }

  wg.getWorkingGroups(id).then(function(data) {
    // console.log(data)
    var wg = data[0];
    project = wg;
    var confirmed = wg.Confirmed ? "Yes" : "No";

    if (wg.Title) $(".wg-title").text(wg.Title);
    if (wg.Meeting_x0020_Type) $(".wg-Meeting_x0020_Type").text(wg.Meeting_x0020_Type);
    if (wg.Level) $(".wg-Level").text(wg.Level);
    if (wg.Link_x0020_To_x0020_Meeting_x002) $(".wg-Link").attr('href', wg.Link_x0020_To_x0020_Meeting_x002.Url);
    if (wg.Role) $(".wg-Role").text(wg.Role);
    if (wg.Scope) $(".wg-Scope").text(wg.Scope);
    if (wg.Editor) $(".wg-userName").text(wg.Editor.userName);

    $(".wg-Confirmed").text(confirmed);

    if (wg.Associated_x0020_Project_x0020__) $(".wg-Associated_x0020_Project_x0020__").text(wg.Associated_x0020_Project_x0020__)
      if (wg.Expected_x0020_Attendee_x0020_Le) $(".wg-Expected_x0020_Attendee_x0020_Le").text(wg.Expected_x0020_Attendee_x0020_Le)
        if (wg.Author) $(".wg-Author").text(wg.Author.userName);
      if (wg.Created) $(".wg-Created").text(wg.Created);
      if (wg.Modified) $(".wg-Modified").text(wg.Modified)
        if (wg.Primary_x0020_Business_x0020_Fun) $(".wg-business").text(wg.Primary_x0020_Business_x0020_Fun)
          if (wg.Frequency) $(".wg-frequency").text(wg.Frequency);
        if (wg.Status) $(".wg-status").text(wg.Status);

        var renderAttendee = function(attendee) {
          var html = "<div class='media'><a href='#' class='list-group-item review-item'><div class='media-left media-middle'><span class='media-object glyphicon glyphicon-user pull-left fa-3x'></span><div class='media-body'><h3 class='list-group-item-heading'>" + attendee + "</h3></div></a>";
          $(".wg-attendees").append(html)
        }

        var attendance = processAttendees(wg)
        if (attendance.length > 0) attendance.map(renderAttendee)

          $('.container-wg-attendees').hide().removeClass('hidden').fadeIn();

        $('.container-wg-details').hide().removeClass('hidden').fadeIn();
        manageAttendee()
      });

  wg.getFiles(id).then(function(files) {
    // console.log(files)
    var renderFile = function(file) {
      return "<div class='media'><a href='/" + file.FileRef.lookupValue + "' class='list-group-item'><div class='media-left media-middle'><span class='media-object glyphicon glyphicon-file pull-left fa-3x'></span></div><div class='media-body'><h3 class='list-group-item-heading'>" + file.filename + "</h3><p class='list-group-item-text'>Created by: " + file.creator + "</p><p class='list-group-item-text'>Modified: " + file.modified + "</p></div></a></div>";
    };


    var fileTable = $('.wg-files');
    files.map(function(file) {
      fileTable.append(renderFile(file));
    });
    $(".see-files").click(function() {
      location.href = wg.contextUrl + "/Working%20Groups/" + project.Title;
    })
    $('.container-wg-files').hide().removeClass('hidden').fadeIn();
  });

  wg.getEvents(id).then(function(events) {
    // console.log(events);
    var renderEvents = function(event) {
      return "<div class='media'><a title='"+event.Title+"'href='#' class='list-group-item event-item' data-id='" + event.ID + "' data-title='" + event.Title + "' data-type='event'><div class='media-left media-middle'><span class='media-object glyphicon glyphicon-calendar pull-left fa-3x'></span></div><div class='media-body'><h3 class='list-group-item-heading'>" + event.Title + "</h3><p class='list-group-item-text'>Location: " + event.Location + "</p><p class='list-group-item-text'>Date: " + event.startend + "</p></div></a></div>";
    };

    var eventTable = $('.wg-events');
    events.map(function(event) {
      eventTable.append(renderEvents(event));
    });

    $(".event-item").click(setDialogClickEvent);
    $('.container-wg-events').hide().removeClass('hidden').fadeIn();
  });

  wg.getFeedback(id).then(function(feedback) {
    var renderFeedback = function(review) {
      return "<div class='media'><a href='#' class='list-group-item review-item' data-id='" + review.ID + "' data-title='Working Group Feedback From " + review.Author + "' data-type='feedback'><div class='media-left media-middle'><span class='media-object glyphicon glyphicon-comment pull-left fa-3x'></span></div><div class='media-body'><h3 class='list-group-item-heading'>Review by " + review.Author + "on " + review.Created + "</h3></div></a></div>";
    }

    var feedbackTable = $('.wg-feedback');
    feedback.map(function(review) {
      feedbackTable.append(renderFeedback(review));
    });

    $(".review-item").click(setDialogClickEvent);
    $('.container-wg-feedback').hide().removeClass('hidden').fadeIn();
  })

  wg.getDiscussions(id).then(function(posts) {
    var renderPost = function(post) {
      return "<div class='media'><a href='#' class='list-group-item post-item' data-title='" + post.Title + "'><div class='media-left media-middle'><span class='media-object glyphicon glyphicon-folder-open pull-left fa-3x'></span></div><div class='media-body'><h3 class='list-group-item-heading'>" + post.Title + "</h3><span class='badge pull-right' title='Replies'>"+ post.replies +"</span><p class='list-group-item-text'>by: " + post.Author + "</p><p class='list-group-item-text'>Modified: " + post.Modified + "</p></div></a></div>";
    }

    var discussionContainer = $('.wg-discussions');
    posts.map(function(post) {
      discussionContainer.append(renderPost(post));
    });

    $(".post-item").click(function() {
      var url = "/Lists/WorkingGroupDiscussions/Flat.aspx?RootFolder=" + wg.contextUrl + "/Lists/WorkingGroupDiscussions/" + $(this).data('title')
      var config = wg.dialogSettings(url, "Discussion")
      wg.dialog(config)
    });
    $('.container-wg-discussions').hide().removeClass('hidden').fadeIn();
  })

  // Handle various dialogs 
  $(".edit-wg").click(function() {
    var url = "/Lists/Attended%20Meetings/EditForm.aspx?ID=" + id;
    var config = wg.dialogSettings(url, "Edit Working Group")
    wg.dialog(config)
  })

  $(".new-feedback").click(function() {
    var url = "/Lists/Working%20Group%20Feedback/NewForm.aspx";
    var config = wg.dialogSettings(url, "New feedback for " + project.Title);
    wg.dialog(config)
  });

  $(".new-event").click(function() {
    var url = "/Lists/Demos/NewForm.aspx";
    var config = wg.dialogSettings(url, "New event for " + project.Title);
    wg.dialog(config);
  });

  $('.new-file').click(function() {
    var listID = "8440d650-f556-40dd-a6e8-1b20b562a27d"; 
    var folderPath = "&RootFolder=" + _spPageContextInfo.webServerRelativeUrl + "/Working Groups/" + project.Title;
    var url = "/_layouts/Upload.aspx?List=" + listID + folderPath;
    var config = wg.dialogSettings(url, "Add new file to " + project.Title)
    wg.dialog(config)
  })

  $('.new-discussion').click(function() {
    var url = "/Lists/WorkingGroupDiscussions/NewForm.aspx?wgID=" + id;
    var config = wg.dialogSettings(url, "New Discussion for this working group");
    wg.dialog(config)
  })
})
