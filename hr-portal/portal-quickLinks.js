$(function() {
	// Check home.ready recursively 
	(function checkFlag() {
	    home.ready ? initQL() : window.setTimeout(checkFlag, 100);
	})();
})

var initQL = function()  {
	var data = home.data.links; 
	var container = $('.ql-container')

	var renderLink = function(d) {
		var html = '<a class="list-group-item" href="' +d.url+ '" target="_blank"><li>'+
		'<span class="nav-text">'+d.title+'</span>'+
		'</li></a>';
		
		container.append(html)
	} 
	
	$.map(data, renderLink)

	$("#quick-links").removeClass('hidden')
}