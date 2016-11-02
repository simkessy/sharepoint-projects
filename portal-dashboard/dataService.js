var wg = wg || {};

wg = {
  dateFormat: "MMM Do, h:mm a",
  contextUrl: _spPageContextInfo.webServerRelativeUrl,
  
  // Get working group based on url ID
  getWorkingGroups: function(id) {
    var d = $.Deferred();

    var operation = {
      listName: "Attended Meetings"
    }

    if (!_.isUndefined(id)) {
      operation.CAMLQuery = "<Query><Where><Eq><FieldRef Name='ID'/><Value Type='Number'>" + id + "</Value></Eq></Where></Query>"
    }

    var promise = $().SPServices.SPGetListItemsJson(operation);

    promise.then(function() {
      var WG = this.data;
      WG.map(function(w, i) {
        WG[i].Created = moment(w.Created).format(wg.dateFormat);
        WG[i].Modified = moment(w.Modified).format(wg.dateFormat);
      });
      d.resolve(WG);
    });
    return d.promise();
  },

  // Get working group files
  getFiles: function(id) {
    var d = $.Deferred();

    var opts = {
      listName: "WgDocuments",
      CAMLQuery: "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><And><Eq><FieldRef Name='FSObjType' /><Value Type='Integer'>0</Value></Eq><IsNotNull><FieldRef Name='ID' /></IsNotNull></And></Where></Query>",
      CAMLQueryOptions: "<QueryOptions><ViewAttributes Scope='RecursiveAll' /></QueryOptions>",
      CAMLRowLimit: 5
    }

    // Give me files for 1 WG if ID given, otherwise give all files
    if (!_.isUndefined(id)) {
      opts.CAMLQuery = "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><And><Eq><FieldRef Name='FSObjType' /><Value Type='Integer'>0</Value></Eq><Eq><FieldRef Name='wgID'/><Value Type='Text'>" + id + "</Value></Eq></And></Where></Query>"
      opts.CAMLRowLimit = 0
    }

    var promise = $().SPServices.SPGetListItemsJson(opts);

    promise.then(function() {
      var files = this.data
      files.map(function(file, i) {
        files[i].filename = file.FileRef.lookupValue.split("/").slice(-1)[0];
        files[i].modified = moment(file.Modified).format(wg.dateFormat);
        files[i].Created = moment(file.Created_x0020_Date.lookupValue).format(wg.dateFormat);
        files[i].creator = file.Editor.userName.split("(")[0];
        files[i].path = "/" + file.FileRef.lookupValue;
      })
      d.resolve(files);
      // console.log(files)
    });
    return d.promise();
  },

  // Get working group events
  getEvents: function(id) {
    var d = $.Deferred();

    var opts = {
      listName: "Demos",
      CAMLQuery: "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>",
      CAMLRowLimit: 5
    }

    if (!_.isUndefined(id)) {
      opts.CAMLQuery = "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><Eq><FieldRef Name='wgID_x003a_ID'/><Value Type='Text'>" + id + "</Value></Eq></Where></Query>";
      opts.CAMLQueryOptions = "<QueryOptions><ViewAttributes Scope='RecursiveAll' /></QueryOptions>";
      opts.CAMLRowLimit = 0;
    }

    var promise = $().SPServices.SPGetListItemsJson(opts);

    promise.then(function() {
      var demos = this.data;
      // console.log(demos)
      demos.map(function(demo, i) {
        demos[i].start = moment(demo.EventDate).format(wg.dateFormat);
        demos[i].end = moment(demo.EndDate).format(wg.dateFormat);
        demos[i].startend = demos[i].start + " - " + demos[i].end;
        demos[i].Created = moment(demo.Created).format(wg.dateFormat);
        demos[i].Location = _.isUndefined(demo.Location) ? "Not Set" : demo.Location;
        demos[i].path = "/Lists/Demos/DispForm.aspx?ID=" + demo.ID;
      })
      d.resolve(demos)
      // console.log(demos);
    });

    return d.promise();
  },

  // Get working group feeback
  getFeedback: function(id) {
    var d = $.Deferred();

    var opts = {
      listName: "Working Group Feedback",
      CAMLQuery: "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>",
      CAMLRowLimit: 5
    }

    if (!_.isUndefined(id)) {
      opts.CAMLQuery = "<Query><Where><Eq><FieldRef Name='Select_x0020_Working_x0020_Group' LookupId='True' /><Value Type='Lookup'>" + id + "</Value></Eq></Where></Query>";
      opts.CAMLRowLimit = 0;
    }

    var promise = $().SPServices.SPGetListItemsJson(opts);

    promise.then(function() {
      var feedback = this.data
      feedback.map(function(review, i) {
        feedback[i].Author = review.Author.userName.split("(")[0]
        feedback[i].Created = moment(review.Created).format(wg.dateFormat);
        feedback[i].path = "/Lists/Working%20Group%20Feedback/DispForm.aspx?ID=" + review.ID;
      })
      d.resolve(feedback)
    });
    return d.promise();
  },
  // Get working group feeback
  getDiscussions: function(id) {
    var d = $.Deferred();

    var opts = {
      listName: "WorkingGroupDiscussions",
      CAMLQuery: "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><IsNotNull><FieldRef Name='ID' /></IsNotNull></Where></Query>",
      CAMLRowLimit: 5
    }

    if (!_.isUndefined(id)) {
      opts.CAMLQuery = "<Query><OrderBy><FieldRef Name='Created' Ascending='False'/></OrderBy><Where><Eq><FieldRef Name='wgID' LookupId='True' /><Value Type='Text'>" + id + "</Value></Eq></Where></Query>";
      opts.CAMLRowLimit = 0;
    }

    var promise = $().SPServices.SPGetListItemsJson(opts);

    promise.then(function() {
      var posts = this.data
      posts.map(function(post, i) {
        posts[i].Author = post.Author.userName.split("(")[0]
        posts[i].Created = moment(post.Created).format(wg.dateFormat);
        posts[i].Modified = moment(post.Modified).format(wg.dateFormat);
        posts[i].path = "/Lists/Working%20Group%20posts/DispForm.aspx?ID=" + post.ID;
        posts[i].replies = post.ItemChildCount.lookupValue;
      })
      d.resolve(posts)
      // console.log(posts)
    });
    return d.promise();
  },

  // Global popup dialog handler
  dialogSettings: function(url, title) {
    return {
      url: url,
      title: title,
      callback: function() {
        location.reload();
      }
    }
  },

  dialog: function(opts) {
    var title = opts.title || null;
    var url = opts.url || null;
    var callback = opts.callback || null;

    SP.UI.ModalDialog.showModalDialog({
      url: wg.contextUrl + url,
      title: title,
      dialogReturnValueCallback: callback
    });
  }

}