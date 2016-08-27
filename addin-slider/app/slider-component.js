import React from 'react';
import ReactDOM from 'react-dom';

class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    let data = [
      {
        title: "My Image 1",
        url: "http://www.facebook.com",
        img: "https://i.imgur.com/jrIXCSJ.jpg",
        caption: "Something important text"
      },
      {
        title: "My Image 2",
        url: "http://www.reddit.com",
        img: "https://i.imgur.com/wY3MMsQ.jpg",
        caption: "Something important text"
      },
      {
        title: "My Image 3",
        url: "http://www.google.com",
        img: "https://i.imgur.com/Vyfmb20.jpg",
        caption: "Something important text"
      }
    ];

    setTimeout(function(){
      this.setState({data: data});
    }.bind(this), 5000);
  }

  componentDidUpdate() {
    $('.flexslider').flexslider();
  }

  render() {
    let data = this.state.data;
    let slides = data.map((slide, index)=> {
      return (<Slide key={index} title={slide.title} url={slide.url} img={slide.img} caption={slide.caption}/>)
    })
    return (
      <ul className="slides">
        {slides}
      </ul>
    )
  }
}

const Slide = ({title, url, img, caption}) => {
  return (
    <li>
      <a href={url}><img src={img} /></a>
      <p className="flex-caption">{caption}</p>
    </li>
  )
}

function resizePart(mode) {
  var queryStringParams = $().SPServices.SPGetQueryString();

  var hostUrl = queryStringParams["SPHostUr"];
  var senderId = queryStringParams["SenderId"];
  var parent = window.parent;

  var target = (mode) ? "#flexslider" : "#slider-settings";

  if (senderId && parent) {
      var height = 600;
      var width = 600;

      var message = String.format("<message senderId={0}>resize({1},{2})</message>",
          senderId, width, height);
      parent.postMessage(message, "*");
      console.log(message);
  }
}

var populateSettings = function() {
  var queryStringParams = $().SPServices.SPGetQueryString();
  var hostUrl = queryStringParams["SPHostUrl"];
  var appUrl = queryStringParams["SPAppWebUrl"];

  var url = appUrl + "/_api/SP.AppContextSite(@target)/Web/Lists?@target='" + hostUrl + "'";

  var getLists = $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      headers: {
          Accept: "application/json;odata=verbose"
      }
  });

  var ddLists = $("#ddLists");
  getLists.then(function(data) {
    var results = data.d.results

    results.map(function(site) {
      var title = site.Title
      ddLists.append($('<option>', {
        value: title,
        text: title
      }))
    })

    populateColumns()
  })

  ddLists.change(populateColumns)
}

function populateColumns() {
  var queryStringParams = $().SPServices.SPGetQueryString();
  var hostUrl = queryStringParams["SPHostUrl"];
  var appUrl = queryStringParams["SPAppWebUrl"];


  var ddLists = $("#ddLists");
  var ddTitle = "#ddTitle";
  var ddCaption = "#ddCaption";
  var ddImgPath = "#ddImgPath";
  var ddUrl = "#ddUrl";

  var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('" + ddLists.val() + "')/fields?@target='" + hostUrl + "'&$filter=Hidden eq false&$Select=Title,StaticName,TypeAsString,FromBaseType";

  var getColumns = $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      headers: {
          Accept: "application/json;odata=nometadata"
      }
  });

  getColumns.then(function(data) {
    console.log(data);

    var fields = '';
    var allowedFieldTypes = ['Number', 'Currency', 'Text', 'Note', 'Calculated', 'Boolean', 'User', 'DateTime', 'Choice', 'Lookup', 'Counter'];

    data.value.map(function(field) {
      var type = field.TypeAsString;
      var baseType = field.FromBaseType;
      var displayName = field.Title;
      var staticName = field.StaticName;

      if(!_.isUndefined(displayName)) { // Display name needs to be included
        if ($.inArray(type, allowedFieldTypes) > -1) { // Must be part of allowed types
          if (type === 'Lookup' && baseType === true) { // Can't be system column
            return
          }
          fields += $('<option>', {
            value: staticName,
            text: displayName
          })[0].outerHTML
        }
      }
    })

    $(fields).appendTo("#ddTitle, #ddCaption, #ddImgPath, #ddUrl")
    $("#slider-settings select").selectize({
      sortField: 'text'
    });
  })
}

var checkMode = function() {
  var queryStringParams = $().SPServices.SPGetQueryString();
  var mode = queryStringParams["EditMode"];
  var inViewMode = (mode == "0") ? true : false;
  var inEditMode = !inViewMode;
  console.log(mode,inViewMode, inEditMode)

  if (inViewMode) {
    console.log('show slider')
    ReactDOM.render( <Slider />, document.getElementById('flexslider'));
    $('#flexslider').removeClass('hidden')
  }else{
    console.log('in edit mode');

    $('#slider-settings').removeClass('hidden');

    populateSettings();
  }
  resizePart(inViewMode)
}

$(function(){
  checkMode()

  $('#save-btn').click(save)
})

var save = function() {
  // Get Settings
  var ddLists = $("#ddLists").val();
  var ddTitle = $("#ddTitle").val();
  var ddCaption = $("#ddCaption").val();
  var ddImgPath = $("#ddImgPath").val();
  var ddUrl = $("#ddUrl").val();

  // Get App Part instance ID
  var queryStringParams = $().SPServices.SPGetQueryString();
  console.log(queryStringParams)
  var appID = queryStringParams["wpId"];

  // Settings Object
  var settings = {
    wpID: appID,
    list: ddLists,
    fields: {
      title: ddTitle,
      caption: ddCaption,
      imgPath: ddImgPath,
      ddUrl: ddUrl
    }
  }
  console.log(JSON.stringify(settings))
  console.log(settings)
}
