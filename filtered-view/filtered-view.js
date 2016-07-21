/*This script returns items from a sharepoint list based on the current user logged in. It filters the result using the curren users email address*/


<head>
	<script type="text/javascript" src="/sites/hrco/DGWD/DCEP/Site%20Assets/bundle/es5-shim.min.js"></script>
	<script type="text/javascript" src="/sites/hrco/DGWD/DCEP/Site%20Assets/bundle/bundle.js"></script>
	<style type="text/css">
		/* Fix Bootstrap Changes */
		* {
			box-sizing: content-box !important;
		}
		.boot-fix * {
			box-sizing: border-box !important;
		}

		body {
			font-family: Verdana, Arial, sans-serif !important;
			font-size: 8pt !important;
			/*display: none;*/
		}
	</style>
</head>
<body>
	<br>
	<div id='results'>
		<table id="table" class="table table-responsive table-condensed table-striped table-bordered table-hover hidden">
			<thead>
				<tr id='fields'>
					<th>L1</th>
					<th>L2</th>
					<th>Last Name</th>
					<th>First Name</th>
					<th>Civil Military</th>
					<th>Date Obtained</th>
					<th>Management Level</th>
					<th>Status</th>
					<th>City</th>
					<th>Email</th>
					<th>File</th>
				</tr>
			</thead>
			<tbody>
				
			</tbody>
		</table>
	</div>

	<script type="text/javascript">
		$(function() {

			var currentUser = $().SPServices.SPGetCurrentUser({  fieldName: "EMail"  });

			var getItems = $().SPServices.SPGetListItemsJson({
				listName: "Sub-Delegation Authority",
				CAMLQuery: "<Query><Where><Eq><FieldRef Name='Email'/><Value Type='Text'>" + currentUser + "</Value></Eq></Where></Query>"
			})

			var results = []
			getItems.then(function() {
				var data = this.data

				data.map(function(item){
					results.push({
						l1:item.L1_x0020_Organization,
						l2:item.L2_x0020_Organization,
						lastName:item.Last_x0020_Name,
						firstName:item.First_x0020_Name,
						milOrCiv:item.Civil_x0020_Military,
						date:moment(item.Date_x0020_Delegation_x0020_Obtained).format("dddd, MMMM Do YYYY, h:mm:ss a"),
						mgntLevel:item.Management_x0020_Level,
						status:item.Status,
						city:item.WorkCity,
						email:item.Email,
						file:"/" + item.FileRef.lookupValue
					})
				})

				setupTable(results)
			})

			var setupTable = function(data) {
				var table= $("#table")
				var tBody = table.find("tbody")

				if(data.length == 0) {
					tBody.append("<tr><td colspan='11' class='text-center'>YOU HAVE NO RECORDS</td></tr>")
				}else{
					data.map(function(item) {
						tBody.append(
							"<tr><td>" + 
							item.l1 + "</td><td>" + 
							item.l2 + "</td><td>" + 
							item.lastName + "</td><td>" + 
							item.firstName + "</td><td>" + 
							item.milOrCiv + "</td><td>" + 
							item.date + "</td><td>" + 
							item.mgntLevel + "</td><td>" + 
							item.status + "</td><td>" + 
							item.city + "</td><td>" + 
							item.email + "</td><td><a href=" + item.file + "> File" +
							"</a></td></tr>" 
							)
					})
				}
				table.fadeIn('slowest').removeClass("hidden")
			}
		})
	</script>
</body>

