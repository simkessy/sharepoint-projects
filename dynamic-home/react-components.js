let items = [
	{ title: 'Matthew', link: 'https://bible.com/1/mat.1' },
	{ title: 'Mark', link: 'https://bible.com/1/mrk.1' },
	{ title: 'Luke', link: 'https://bible.com/1/luk.1' },
	{ title: 'John', link: 'https://bible.com/1/jhn.1' }
];

let SliderTabs = React.createClass({
	getInitialState: function() {
		return <p>Loading data...</p>
	},
	render: function() {
		let listItems = home.data.slider

		if(items.length != 0) 
			listItems = this.props.items.map(function(item) {
				return (
					<li key={item.title}>
						<a href="#panel1">{item.title}</a>
					</li>
				);
			});
		

	return (
			<div className="something">
				<h3>Some content</h3>
					<ul>
						{listItems}
					</ul>
			</div>
		);
	}
});

ReactDOM.render(<SliderTabs items={home.data.slider} />, 				
	document.getElementById('slider-tabs'));

