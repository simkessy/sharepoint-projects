let data = [{
  "isActive": true,
  "balance": "$2,238.93",
  "age": 28,
  "tab": "Tab C",
  "name": "Kinney Stephenson",
  "gender": "male",
  "favoriteFruit": "banana"
  }, {
    "isActive": false,
    "balance": "$3,611.45",
    "age": 27,
    "tab": "Tab B",
    "name": "Merrill Spears",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": false,
    "balance": "$3,514.76",
    "age": 22,
    "tab": "Tab A",
    "name": "Mabel Mclean",
    "gender": "female",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": true,
    "balance": "$2,737.31",
    "age": 25,
    "tab": "Tab B",
    "name": "Roberson Santana",
    "gender": "male",
    "favoriteFruit": "apple"
  }, {
    "isActive": true,
    "balance": "$1,834.62",
    "age": 30,
    "tab": "Tab C",
    "name": "Maxwell Cantrell",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": false,
    "balance": "$1,056.87",
    "age": 33,
    "tab": "Tab A",
    "name": "Oneill Williamson",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": false,
    "balance": "$1,730.27",
    "age": 28,
    "tab": "Tab A",
    "name": "Murphy Fowler",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": true,
    "balance": "$3,000.49",
    "age": 22,
    "tab": "Tab B",
    "name": "Christa Dixon",
    "gender": "female",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": true,
    "balance": "$2,662.55",
    "age": 35,
    "tab": "Tab C",
    "name": "Warren Hartman",
    "gender": "male",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": false,
    "balance": "$1,388.62",
    "age": 36,
    "tab": "Tab A",
    "name": "Holmes Leblanc",
    "gender": "male",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": true,
    "balance": "$2,302.03",
    "age": 40,
    "tab": "Tab A",
    "name": "Christie Adkins",
    "gender": "female",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": true,
    "balance": "$2,350.43",
    "age": 31,
    "tab": "Tab C",
    "name": "English Horne",
    "gender": "male",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": false,
    "balance": "$1,078.39",
    "age": 24,
    "tab": "Tab C",
    "name": "Lavonne Wynn",
    "gender": "female",
    "favoriteFruit": "strawberry"
  }, {
    "isActive": true,
    "balance": "$3,434.95",
    "age": 39,
    "tab": "Tab C",
    "name": "Wilder Mccray",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": false,
    "balance": "$2,568.57",
    "age": 32,
    "tab": "Tab C",
    "name": "Moon Padilla",
    "gender": "male",
    "favoriteFruit": "banana"
  }, {
    "isActive": true,
    "balance": "$1,448.46",
    "age": 32,
    "tab": "Tab A",
    "name": "Fowler Wilkins",
    "gender": "male",
    "favoriteFruit": "banana"
  }
]

class Section extends React.Component {

  constructor(props) {
    super(props)
    this.state = { items: [], index: null, data: null }
  }

  componentDidMount() {
    // Keep the scope of this function so it can be used in checkFlag
    this.setState({
      items: this.props.items,
      index: this.props.index,
      data: this.props.data
    })
    console.log(this.props)
  }

  render() {
    let {item, index, data} = this.props

    let sections = _.filter(data, x => x.item).map(function(item,index) {
      return(
        <div className="col-md-9">
          <h2 className=" bg-corp-med  h5">{item.active}</h2>
          <ul>
            <li>This si something</li>
          </ul>
        </div>
      )
    })

    return (
      <div className="col-md-9">
        <h2 className=" bg-corp-med  h5">What’s new?</h2>
        <ul>
          {sections}
        </ul>
      </div>
    )
  }
};

class Tabs extends React.Component {

  constructor(props) {
    super(props)
    this.state = { items: [], index: null, data: null }
  }

  componentDidMount() {
    // Keep the scope of this function so it can be used in checkFlag
    this.setState({
      items: this.props.items,
      index: this.props.index,
      data: this.props.data
    })
  }

  render() {
    let {item, index, data} = this.props
    return (
      <details key={item} id={"details-panel" + (++index)}>
        <summary>{item}</summary>
        <Section key={item} item={item} index={index} data={data}/>
      </details>
    )
  }
};

class HomeNav extends React.Component {

  constructor(props) {
    super(props)
    this.state = { items: [] }
  }

  componentDidMount() {
    // Keep the scope of this function so it can be used in checkFlag
    this.setState({
      items: data
    })
  }

  render() {
    let uniqueTabs = _.uniq(_.map(data, x => x.tab)).sort()

    let tabs = uniqueTabs.map((item, index) => {
      return (
        <Tabs key={item} item={item} index={index} data={data}/>
      )
    })

    return (
      <section>
        <h3>Home Nav</h3>
        <div className="wb-tabs">
          <div className="tabpanels">
            {tabs}
          </div>
        </div>
      </section>
    )
  }
};



ReactDOM.render(
  <HomeNav/>,
  document.getElementById('home-nav')
);
