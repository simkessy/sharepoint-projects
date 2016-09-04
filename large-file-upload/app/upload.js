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
  fileOffset: null,

  post: function(url, data) {
    return $.ajax({
      url: url,
      type: 'POST',
      body: data,
      processData: false,
      headers: {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": Upload.digest,
        "content-type": "application/x-www-urlencoded; charset=UTF-8
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
      'chunk_read_callback': Upload.createChunks,
      'success': Upload.processChunks
    })
    return d.promise();
  },

  createChunks: function(chunk, offset) {
    console.log('creating chunks');
    Upload.chunks.push(chunk);
  },

  processChunks: function() {
    console.log('processChunks')
    let index = 0;
    let lastChunkIndex = Upload.chunks.length;

    let setChunkID = chunkID => {
      Upload.chunkID = chunkID;
      next();
    };

    function next() {
      if(index > lastChunkIndex) { return false }

      if (index == 0) {
        Upload.loadChunk(Upload.chunks[index++], "start").then(setChunkID)
      } else if (index == lastChunkIndex) {
        Upload.loadChunk(Upload.chunks[index++], "finish").then(setChunkID)
      } else {
        Upload.loadChunk(Upload.chunks[index++], "continue").then(setChunkID)
      }
    }
    next();
  },

  loadChunk: function(chunk, type) {
    console.log('loadchunks')
    let d = $.Deferred();

    const processCalls = {
      start: {
        url: "getFolderByServerRelativeUrl(@folder)/files/addStub(@file)/StartUpload(guid'" + Upload.guid + "')?@folder='" + Upload.folderPath + "'&@file='" + Upload.file.name + "'",
        response: "StartUpload"
      },
      continue: {
        url: "getFileByServerRelativeUrl(@file)/ContinueUpload(uploadId=guid'" + Upload.guid + "',fileOffset='" + Upload.chunkID + "')?@file='" + Upload.filePath + "'",
        response: "ContinueUpload"
      },
      finish: {
        url: "getFileByServerRelativeUrl(@file)/FinishUpload(uploadId=guid'" + Upload.guid + "',fileOffset='" + Upload.chunkID + "')?@file='" + Upload.filePath + "'",
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
      d.resolve(response.d[call.response]);
    })
    return d.promise();
  }
}

// DOM Ready
$(() => Upload.init());
