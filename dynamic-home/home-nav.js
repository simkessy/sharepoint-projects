class HomeNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = { data: [] };
  };

  componentDidMount() {
    // Keep the scope of this function so it can be used in checkFlag
    let that = this;
    // Check home.ready recursively
    function checkFlag() {
      if(home.ready == false) {
        window.setTimeout(checkFlag, 100);
      } else {
        that.setState({data: that.props.data});
      }
    };
    checkFlag();
  };

  render() {
    let data = this.state.data;
    let uniqueTabs = _.uniq(_.map(data, x => x.tab)).sort();

    let tabs = uniqueTabs.map((tab, index) => {
      let itemsByTab = _.filter(data, (x => x.tab == tab));
      return (<Tabs key={tab} tab={tab} index={index} data={itemsByTab}/>);
    });

    return (
      <section>
        <div className="wb-tabs">
          <div className="tabpanels">
            {tabs}
          </div>
        </div>
      </section>
    );
  };
};

const Tabs = ({ tab, index, data }) => {
    let itemsInCurrentTab = _.filter(data, x => x.tab == tab);
    let uniqueSections = _.uniq(_.map(itemsInCurrentTab, x => x.section)).sort();

    return (
        <details key={tab} id={"details-panel"+(++index)}>
            <summary> {tab} </summary>
            <Section key={tab + index} tab={tab} sections={uniqueSections} data={itemsInCurrentTab}/>
        </details>
    )
};

const Section = ({ tab, sections, data }) => {
    let Sections = sections.map((section,index) => {
        let itemsByTabSection = _.filter(data, (x => (x.section == section)));

        return (
            <div key={section} className="col-md-9">
                <h2 className="bg-corp-med h5">{String(section)}</h2>
                <Links key={tab + "-" + section} tab={tab} section={section} data={itemsByTabSection}/>
            </div>
        )
    });
    return <div>{Sections}</div>;
};

const Links = ({ tab, section, data }) => {
    let items = _.sortBy(data, 'name');
    let Links = items.map((link, index) => {
        return (
            <li key={link+tab+index}>
                <a href={link.url} target="_blank">
                    <strong><span className="small">{link.title}</span></strong>
                </a>
            </li>
        );
    });
    return <ul>{Links}</ul>;
};

ReactDOM.render(
  <HomeNav data={home.data.nav} ready={home.ready}/>,
  document.getElementById('home-nav')
);
