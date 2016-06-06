$(function() {
  // Variables
  var phases = [];
  var projects = [];
  var projectCount;
  var listName = "SharePoint Request Intake";
  var table = $("#projectChart");
  var container = $(".container");
  var  title = $(".title");

  // Get Phases
  function getPhases() {
    var d = $.Deferred();
	
    var ctx = SP.ClientContext.get_current();
    var web = ctx.get_web();
    var list = web.get_lists().getByTitle(listName);
    var field = list.get_fields().getByInternalNameOrTitle("Phase");
    var choiceField = ctx.castTo(field, SP.FieldChoice);
    
	  ctx.load(field);

    ctx.executeQueryAsync(success, failure);

    function success() {
      phases = choiceField.get_choices();
      //console.dir(phases);
      d.resolve(phases)
    }

    function failure() {
      alert("Failed to return Phases for SharePoint Intake Form")
      d.reject("Failed to return Phases for SharePoint Intake Form")
    }
	
    return d.promise();
  };

  // Add phases to table as headers
  function addPhases() {
    //console.log("Adding Phases");

    var headers = table.find("thead tr:last");

    $.each(phases, function(index, phase) {
      headers.append($("<th class='text-center'>").text(phase));
    })
  };

  // Get Projects
  function getProjects() {
    var d = $.Deferred()

    var projectPromise = $().SPServices.SPGetListItemsJson({
      operation: "GetListItems",
      listName: listName,
      CAMLViewFields: "<ViewFields><FieldRef Name='LinkFilename' /><FieldRef Name='Phase' /></ViewFields>",
      CAMLQuery: "<Query><Where><Eq><FieldRef Name='Status'/><Value Type='Text'>Active</Value></Eq></Where></Query>",
      mappingOverrides: {
        ows_LinkFilename: {
          mappedName: "title",
          objectType: "Text"
        },
        ows_Phase: {
          mappedName: "phase",
          objectType: "Text"
        },
        ows_FileRef: {
          mappedName: "path",
          objectType: "Text"
        }
      }
    })

    projectPromise.then(success, failure);

    function success() {
      var result = this.data;
      var projects = [];
      $.each(result, function(index, project) {
        //console.log("Title: " + project.title, " Phase: " + project.phase)
        projects.push({
          title: project.title.split(".")[0],
          phase: parseInt(project.phase.split(" ")[0]),
          id: project.path.split(";")[0],
          path: "http://collaboration-hr-civ.forces.mil.ca/" + escape(project.path.split("#")[1])
        })
      })

	    var sortedProjects = _.sortBy(projects, function(p) { return p.title; })
	    projectCount = sortedProjects.length;
      d.resolve(JSON.stringify(sortedProjects));
    }

    function failure() {
      alert("Retrieving projects failed.");
      d.reject("Retrieving projects failed.");
    }
    return d.promise();
  };

  // Add Projects to table has rows
  function addProjects(projects) {
    //console.log("Adding Projects");
    var tableBody = table.find("tbody");
	
	  $.each(JSON.parse(projects), function(index, project) {
	    //console.log(project.title,project.status)
      var projectID = project.title.replace(/ +/g, "");
        tableBody
			.append("<tr id=" + projectID + ">" + "<td class='active-project' data-id='" + project.id +"' data-title='" + project.title + "'>" + project.title + "</td></tr>" )

      var projectRow = $('#' + projectID);

      for (var i = 0; i < project.phase; i++) {
        projectRow.append($('<td class="info">'));
      }
    }) 
  };

  // Initiate table
  function init() {
    getPhases()
		.then(addPhases)
		.then(function() {
			getProjects().then(function(projects) {
				addProjects(projects)
				title.text(  "Active Projects (" + projectCount + ")" )
				container.hide().removeClass('hidden').fadeIn("fast")

        // Set on click on each project
        $(".active-project").click(function() {
          var self = $(this);
          OpenDialog(self.data("id"), self.data("title"))
        })

			})
		});
  };

  // Display form handling
  function OpenDialog(itemID, itemTitle) {

    function DialogCallback(dialogResult, returnValue) {}

    var options = {
      url: "/sites/hrco/DCSM/IMITM/Sharepoint%20Request%20Library/Forms/ViewItem.aspx?ID=" + itemID,
      dialogReturnValueCallback: this.DialogCallback,
      title: itemTitle
    };

    SP.UI.ModalDialog.showModalDialog(options);
  }


  // Wait for sharepoint to be ready because calling
  ExecuteOrDelayUntilScriptLoaded(init, "SP.js");
})
