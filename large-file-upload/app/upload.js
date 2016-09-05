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
  chunks: [],
  chunkID: null,
  chunkSize: 10, // in mb
  fileOffset: null,

  post: function(url, data) {
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      processData: false,
      headers: {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": Upload.digest,
        "content-type": "application/x-www-urlencoded; charset=UTF-8"
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
      'chunk_size': Upload.chunkSize,
      'chunk_read_callback': Upload.loadChunk,
      'success': Upload.finished
    })
    return d.promise();
  },
  createChunks: function(chunk, offset) {
    Upload.chunks.push(chunk);
  },
 finished: function() {
    console.log('Done')
  },
  loadChunk: function(chunk, type) {
    let d = $.Deferred();

    const processCalls = {
      start: {
        url: `${Upload.pageUrl}/_api/web/getFolderByServerRelativeUrl(@folder)/files/addStub(@file)/StartUpload(guid'${Upload.guid}')?@folder='${Upload.folderPath}'&@file='${Upload.file.name}'`,
        response: "StartUpload"
      },
      continue: {
        url: `${Upload.pageUrl}/_api/web/getFileByServerRelativeUrl(@file)/ContinueUpload(uploadId=guid'${Upload.guid}',fileOffset='${Upload.chunkID}')?@file='${Upload.filePath}'`,
        response: "ContinueUpload"
      },
      finish: {
        url: `${Upload.pageUrl}/_api/web/getFileByServerRelativeUrl(@file)/FinishUpload(uploadId=guid'${Upload.guid}',fileOffset='${Upload.chunkID}')?@file='${Upload.filePath}'`,
        response: "FinishUpload"
      }
    }

    let call = processCalls[type];
    console.log(call.url)

    let post = Upload.post(call.url, chunk)

    post.then( response => {
      if (type == "finish") {
        console.log('Finished');
        Upload.firstChunk = true;
      }
      Upload.chunkID = response.d[call.response]
      d.resolve();
    })
    return d.promise();
  },
}

$(()=> Upload.init())
