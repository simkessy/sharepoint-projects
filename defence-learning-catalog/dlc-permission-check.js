$(function(){
	(function getCurrentUserRole() {
		$().SPServices({
			operation: "GetRolesAndPermissionsForCurrentUser",
			async: false,
			completefunc: function (xData, Status) {
				if( Status == "success") {

					var libraryTools = $("#s4-ribbonrow");
					var perm = {
						full: false,
						contribute: false
					};

					// Set current users permissions
					$(xData.responseXML).SPFilterNode("Role").each(function() {
						var self  = $(this);

						if ( self.attr("Name") == "Full Control" ) {
							perm.full = true;
						}

						if( self.attr("Name") == "Contribute" ) {
							perm.contribute = true;
						}							
					});

					// Show settings button
					if (perm.full || perm.contribute) {
						$("#settings-btn").hide().removeClass("hidden").fadeIn("slowest");				
						$("#new-btn").hide().removeClass("hidden").fadeIn("slowest");				
					}

					// Overide web part active action
					// If not full control, don't show library tools
					if (!perm.full) {
						libraryTools.hide();

						window.WpClick = function(event) {
							return false;
						};
					}else{
						libraryTools.show();
					}

				}
			}
		})
	})()
})