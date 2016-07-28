// SLIDER COMPONENT
let SliderTabs = React.createClass({
	getInitialState: function() {
		// Set default state so you don't get an error when data is not ready
		return {items:[]}
	},
	componentDidMount: function() {
		// Keep the scope of this function so it can be used in checkFlag
		let that = this;

		// Check home.ready recursively 
		function checkFlag() {
	    if(home.ready == false) {
	      window.setTimeout(checkFlag, 100); 
	    } else {
				that.setState({items: that.props.data})
	    }
		}
		checkFlag();
	},
	render: function() {
		// Handle navigation tabs
		let listTabs = this.state.items.map(function(item, index) {
			return (
				<li key={item.title} className={(index==0) ? "active":""}>
					<a href={"#panel" + (++index)}>{item.title}</a>
				</li>
				);
		});

		// Handle slides
		let listSlides = this.state.items.map(function(item, index) {
			return (
					<div key={item.title} role="tabpanel" id={"panel" + (++index)} className={(index==1) ? "in fade":"out fade"}>
						<a href={item.url}>
							<figure>
								<img src={item.path}/>
								<figcaption>
									<p>{item.description}</p>
								</figcaption>
							</figure>
						</a>
					</div>
				);
		});

		return (
			<section>
				<h3>Slider</h3>
				<div className="wb-tabs carousel-s2">
					<ul role="tablist">
						{listTabs}
					</ul>
					<div className="tabpanels">
						{listSlides}		
					</div>
				</div>
			</section>
		);
	}
});

ReactDOM.render(
	<SliderTabs data={home.data.slider}/>, 
	document.getElementById('home-slider')
);
