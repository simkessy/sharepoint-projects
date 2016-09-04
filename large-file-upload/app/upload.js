import parseFile from './parseFile'

window.Upload = window.Upload || {};

Upload = {
  guid: SP.Guid.newGuid().toString(),
  digest: $("#__REQUESTDIGEST").val(),
  fileInput: $("#file"),
  pageUrl: _spPageContextInfo.webServerRelativeUrl,
  button: $('#upload'),
  folderPath: "/apps/Shared Documents/",

  firstChunk: true,
  chunk: null,
  chunkID: null,
  fileOffset: null,

  post: function(url, data) {
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      headers: {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": Upload.digest,
      }
    })
  },

  init: function() {
    this.fileInput.change(() => {
      this.file = $(this)["0"].fileInput["0"].files["0"]
      this.filePath = this.folderPath + this.file.name
    });


    this.button.click(function() {
      Upload.getFile().then(response => console.log(response))
    });
  },

  getFile: function() {
    console.log("Getting file")

    let d = $.Deferred();

    parseFile(Upload.file,{
      'chunk_size': 8192 * 1024,
      'chunk_read_callback': Upload.processFile,
      'success': Upload.finish
    })
    return d.promise();
  },

  processFile: function(chunk, offset) {
    let d = $.Deferred();

    Upload.chunk = chunk;
    Upload.fileOffset = offset;

    if(Upload.firstChunk) {
      Upload.start(chunk).then(function(response) {
        Upload.chunkID = response.d.StartUpload;
        Upload.firstChunk = false;
        d.resolve();
      });
    }else{
      Upload.continue(chunk).then(function(response){
        Upload.chunkID = response.d.ContinueUpload;
        d.resolve();
      });
    }
    return d.promise();
  },

  start: function(chunk) {
    console.log('Starting upload')

    let d = $.Deferred();

    let url = String.format( Upload.pageUrl +
    "/_api/web/getFolderByServerRelativeUrl(@folder)/files/addStub(@file)/StartUpload(guid'{0}')?@folder='{1}'&@file='{2}'",
     Upload.guid,
     Upload.folderPath,
     Upload.file.name)

    let start = Upload.post(url, Upload.chunk);

    start.then((chunkID) => d.resolve(chunkID));
    return d.promise();
  },

  continue: function(chunkID) {
    let d = $.Deferred();

    let url = String.format( Upload.pageUrl + "/_api/web/getFileByServerRelativeUrl(@file)/ContinueUpload(uploadId=guid'{0}',fileOffset='{1}')?@file='{2}'",
      Upload.guid,
      Upload.chunkID,
      Upload.filePath)

    let continuePromise = Upload.post(url, Upload.chunk);

    continuePromise.then((response) => d.resolve(response));
    return d.promise();
  },

  finish: function(file) {
    let d = $.Deferred();

    let url = String.format( Upload.pageUrl + "/_api/web/getFileByServerRelativeUrl(@file)/FinishUpload(uploadId=guid'{0}',fileOffset='{1}')?@file='{2}'",
      Upload.guid,
      Upload.file.size,
      Upload.filePath)

    let finish = Upload.post(url);

    finish.then((response) => {
      d.resolve(response);
      Upload.firstChunk = true;
    },function(){
      console.log('fuck');
      Upload.firstChunk = true;
    });
    console.log('finish');
    return d.promise();
  }

}

// DOM Ready
$(() => Upload.init());
