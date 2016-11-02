// Alternative to Promise.all since IE8 is not compatible 
// http://stackoverflow.com/questions/4878887/how-do-you-work-with-an-array-of-jquery-deferreds
if (jQuery.when.all===undefined) {
	jQuery.when.all = function(deferreds) {
		var deferred = new jQuery.Deferred();
		$.when.apply(jQuery, deferreds).then(
			function() {
				deferred.resolve(Array.prototype.slice.call(arguments));
			},
			function() {
				deferred.fail(Array.prototype.slice.call(arguments));
			});

		return deferred;
	}
}

$(function() {
	init().then(processActivities);
})


var activities = []

function init() {
	return $.when.all([getFiles(), getEvents(), getFeedback()])
	.done(function(arrays) {
		activities = _.flatten(arrays);
	});
}

function getFiles() {
	return wg.getFiles().then(processData("File", "file", _.property("filename")));
}

function getEvents() {
	return wg.getEvents().then(processData("Event", "calendar", _.property("Title")));
}

function getFeedback() {
	return wg.getFeedback().then(processData("Review", "comment", function(x) { return "by " + x.Author; }));
}

function processData(type, icon, makeTitle) {
	return function(data) {
		return data.map(function(x) {
			return {
				type: type,
				title: makeTitle(x),
				created: x.Created,
				path: x.path,
				icon: icon
			};
		});
	};
}

function processActivities() {
	var renderActivity = function(a, i) {
	  var showHeader = (i % 5 == 0) ? "" : "hidden";
      var html = "";
      html +=   "<li class='list-group-item text-uppercase " + showHeader + "'><h2>" + a.type + "s" + "</h2></li>"
      html += "<div class='media'>"
      html += 	"<a title='" + a.title + "' href='" + a.path +"' data-type='" + a.type + "' class='list-group-item clearfix" + a.type + "'>";
      html += 		"<div class='media-left media-middle'>"
      html +=			"<span class='media-object glyphicon glyphicon-"+a.icon+" pull-left fa-3x'></span>";
      html +=		"</div>"
      html += 		"<div class='media-body'>";
	  html +=    		"<p class='list-group-item-heading lead'>" + a.type + ": " + a.title + "</p>";
	  html +=  			"Created: " + a.created
	  html +=		"</div>";
      html += 	"</a>"
      html += "</div>";

      return html
    }

    var activityContaier = $(".activity-items")
    activities.map(function(activity, index) {
    	activityContaier.append(renderActivity(activity, index))
    })

	$('.list-group-item').click(function(e) {
		e.preventDefault();
	    if($(this).data('type') == 'File') {
	    	location.href = $(this).attr('href')
	    }else{
	        wg.dialog({ url: $(this).attr('href') })
	    }
	})

    $('.activities-container').hide().removeClass('hidden').fadeIn();
}