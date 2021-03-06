var React = require('react');
module.exports = React.createClass({
  displayName: 'ImageSearch',
  reader : new window.FileReader(),
  getInitialState: function(){
    return {enabled:false};
  },
  componentDidMount: function(){
    isOn('imageSearch',function(){
      this.setState({enabled:true});
      this.reader.onloadend = function() {
        base64data = this.reader.result;                
        chrome.extension.sendMessage({job:'analytics',category:'uploadSearch',action:'run'}, function(response) {});
        chrome.extension.sendMessage({job: 'imageSearch_upload',data:base64data });
      }.bind(this)
      get('totalImageSearch',function(count){
        count=count||0;
        this.setState({totalImageSearch:count});
      }.bind(this));
      getImageSearchEngines(["google","baidu","tineye","bing","yandex","saucenao","iqdb"],function(engines){
        this.setState({engines: engines});
      }.bind(this));
    }.bind(this));
  },
  onDragOver: function(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  onDrop: function(e){
    e.stopPropagation();
    e.preventDefault();
    var url=URL.createObjectURL(e.dataTransfer.files[0]);
    $('#uploadedImage').attr('src',url);
  },
  upload: function(e){
    var url=URL.createObjectURL(e.target.files[0]);
    $('#uploadedImage').attr('src',url);
  },
  search: function(e){
    fetchBlob(e.target.src, function(blob) {
      this.reader.readAsDataURL(blob);
    }.bind(this));
  },
  notImage: function(e){
    chrome.notifications.create({
      type:'basic',
      iconUrl: '/images/icon_128.png',
      title: GL('reverse_image_search'),
      message: GL('ls_0')
    });
  },
  render: function(){
    if(!this.state.enabled){
      return null;
    }
    var icons=(this.state.engines||[]).map(function(elem,index){
      return (
          <img key={index} src={'/thirdParty/'+elem+'.png'} />
        );
    });
    return (
      <div className="container" id="imageSearch">
        <h5 className="header">{GL('imageSearch')}</h5>
        <div id="info" className="container">
          <p className="important line">{GL('totalSearches')+' : '+this.state.totalImageSearch}</p>
          <div className="btn line">
            <input onChange={this.upload} type='file' id='imageUpload' />
            <label id="imageUploadLabel" htmlFor="imageUpload">{GL('upload_image')}</label>
          </div>
          <img onError={this.notImage} onLoad={this.search} id='uploadedImage' />
          <div id="icons" className="line">
          </div>
        </div>
      </div>);
  }
});
