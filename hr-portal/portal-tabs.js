$(function() {
	// Check home.ready recursively 
	(function checkFlag() {
	    home.ready ? initNav() : window.setTimeout(checkFlag, 100);
	})();
})

// Render tabs
var getTabs = function(data) {
	var uniqueTabs = _(data)
						.map(function(x) {return {tab: x.tab, order: x.order}})
						.uniq("tab")
						.map("tab")
						.value()

	var tabs = $.map(uniqueTabs, function(tab, index) {
		var itemsByTab = _.filter(data, function(x) {return x.tab == tab})
		return renderTabs(tab, itemsByTab, index)
	})

	$('#menu-tabs').append(tabs.join(""))
}

var renderTabs = function(tab, data, index) {
	var itemsInCurrentTab = _.filter(data, function(x) { return x.tab == tab})
	var uniqueSections = _.uniq(_.map(itemsInCurrentTab, function(x) {return x.section})).sort()

	var id = "details-panel" + (++index)

	var SECTIONS = renderSections(tab, uniqueSections, itemsInCurrentTab)

	var html = '<details>'+
	'<summary style="visibility: hidden !important; display:none !important;">' + _.capitalize(tab) + '</summary>'+ SECTIONS +
	'</details>';
	
	return html; 
}

var renderSections = function(tab, sections, data) {
	var SECTIONS = $.map(sections, function(section, index) {
		var itemsByTabSection = _.filter(data, function(x) {return x.section == section})
		var LINKS = renderLinks(tab, section, itemsByTabSection)

		var html = '<div class="col-md-11">'+
		'<h3 class="bg-corp-med h5">' + _.capitalize(section) + '</h3>'
		 + LINKS +
		'</div>';
		return html; 
	})
	return "<div>" + SECTIONS.join("") + "</div>"
}

var renderLinks = function(tab, sections, data) { 
	var items = _.sortBy(data, 'name');
	var LINKS = $.map(items, function(link, index) {
		var html = '<li>'+
		'<a href="' +link.url+ '" target="_blank">'+
		'<span class="nav-text">'+link.title+'</span>'+
		'</a></li>';
		return html;
	})
	return "<ul>"+ LINKS.join("") +"</ul>"
}

// Build Nav
var initNav = function() {
	var data = home.data.nav
	getTabs(data)
}