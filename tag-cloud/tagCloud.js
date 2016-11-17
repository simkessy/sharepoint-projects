$(function() {
	init();
})

var init = function() {
	get()
	.then(processTags);
}

var get = function() {
	var d = $.Deferred();
	var get = $().SPServices.SPGetListItemsJson({ 
		listName: "+AskDCEP"
	}) 

	get.then(good, bad)

	function good() {
		d.resolve(this.data)
	}

	function bad() {
		alert('error, didn\'t work')
		d.reject('nope')
	}

	return d.promise();
}

var processTags = function(data) {
	var tags = _.chain(data)
		.map(function(x) {return  x.Tags})
		.flattenDeep()
		.countBy()
		.value();

	var html = ''

	_.forOwn(tags, function(value, key) {
		var url = "/sites/Report.aspx?View={0D212EEF-0B1C-475F-A23A-8EED347505E2}&FilterField1=Tags&FilterValue1=" + key

		html += "<a target='_blank' class='list-group-item' href='" + url + "'>" + key + "<span class='badge'>" +value + "</span></a>"
	})

	$('#container > ul').append(html)

}
