$(function() {
	// Check home.ready recursively 
	function checkFlag() {
	    if(home.ready == false) {
	      window.setTimeout(checkFlag, 100); 
	    } else {
			initSlider();
	    }
	}
	checkFlag();
})

// Render navigation
var renderTabNav = function(tab, index) {
	var isActive = index == 0 ? "active" : "";
	var href = "#panel" + (++index);
	return "<li class='tab "+ isActive +"'><a href='"+ href +"'>" + tab.title + "</a></li>"
}

// Render Slides
var renderSliders = function(slide, index) {
	var id = "panel" + (++index)
	var className = (index == 1) ? "in fade" : "out";
	var html = '<div role="tabpanel" id="' +id+ '"" class="' + className +'">'+
	'		<a href="'+slide.url+'" target="_blank">'+
	'			<figure>'+
	'				<img src="'+ slide.path +'">'+
	'				<figcaption>'+
	'					<p class="h4">'+ slide.description +'</p>'+
	'				</figcaption>'+
	'			</figure>'+
	'		</a>'+
	'	</div>';

	return html;
}
// Build Slider
var initSlider = function() {
	var data = home.data.slider;
	$.map(data, function(slide, index){
		$('.tabs').append(renderTabNav(slide, index))
		$('#slides').append(renderSliders(slide, index))
	})

}