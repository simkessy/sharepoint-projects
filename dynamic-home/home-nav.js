class HomeNav extends React.Component {

  constructor(props) {
    super(props)
    this.state = { data: [] }
  }

  componentDidMount() {
    // Keep the scope of this function so it can be used in checkFlag
    let that = this;

    // Check home.ready recursively 
    function checkFlag() {
      if(home.ready == false) {
        window.setTimeout(checkFlag, 100); 
      } else {
        that.setState({data: that.props.data})
      }
    }
    checkFlag();
  }

  render() {
    let data = this.state.data
    let uniqueTabs = _.uniq(_.map(data, x => x.tab)).sort()

    let tabs = uniqueTabs.map((tab, index) => {
      let itemsByTab = _.filter(data, (x => x.tab == tab) )
      return (
        <Tabs key={tab} tab={tab} index={index} data={itemsByTab}/>
      )
    })

    return (
      <section>
        <h3>Tabs</h3>
        <div className="wb-tabs">
          <div className="tabpanels">
            {tabs}
          </div>
        </div>
      </section>
    )
  }
};

class Tabs extends React.Component {

  constructor(props) {
    super(props)
    this.state = { tab: null, index: null, data: null }
  }

  componentDidMount() {
    this.setState({
      tab: this.props.tab,
      index: this.props.index,
      data: this.props.data
    })
  }

  render() {
    let {tab, index, data} = this.state;
    let itemsInCurrentTab = _.filter(data, x => x.tab == tab);
    let uniqueSections = _.uniq(_.map(itemsInCurrentTab, x => x.section)).sort()

    return (
      <details key={tab} id={"details-panel" + (++index)}>
        <summary>{tab}</summary>
        <Section key={tab + index} tab={tab} sections={uniqueSections} data={itemsInCurrentTab}/>
      </details>
    )
  }
};

class Section extends React.Component {

  constructor(props) {
    super(props)
    this.state = { tab: null, sections: [], data: [] }
  }

  componentDidMount() {
    this.setState({
      tab: this.props.tab,
      sections: this.props.sections,
      data: this.props.data
    })
  }

  render() {
    let {tab, sections, data} = this.state
    let Sections = sections.map(function(section,index) {
      let itemsByTabSection = _.filter(data, (x => (x.section == section)))
      
      return(
        <div key={section} className="col-md-9">
          <h2 className="bg-corp-med  h5">{String(section)}</h2>
            <Links key={tab + "-" + section} tab={tab} section={section} data={itemsByTabSection}/>
        </div>
      )
    })
    return (<div>{Sections}</div>)
  }
};

class Links extends React.Component {

  constructor(props) {
    super(props)
    this.state = { tab: null, section: null, data: [] }
  }

  componentDidMount() {
    this.setState({
      tab: this.props.tab,
      section: this.props.section,
      data: this.props.data
    })
  }

  render() {
    let {tab, section, data} = this.state
    let items = _.sortBy(data, 'name')
    let Links = items.map((link, index) => {
      return(
        <li key={link+tab+index}>
          <a href={link.url} target="_blank">
            <strong>
              <span className="small">{link.title}</span>
            </strong>
          </a>
        </li>
      )
    })
    return (<ul>{Links}</ul>)
  }
};

ReactDOM.render(
  <HomeNav data={home.data.nav}/>,
  document.getElementById('home-nav')
);
