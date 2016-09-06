window.Upload = window.Upload || {};

Upload = {
    guid: SP.Guid.newGuid().toString(),
    digest: (() => $("#__REQUESTDIGEST").val()),
    fileInput: $("#file"),
    pageUrl: _spPageContextInfo.webServerRelativeUrl,
    button: $('#upload'),
    folderPath: "/apps/Shared Documents/",

    firstChunk: true,
    chunk: null,
    chunks: [],
    chunkID: null,
    chunkSizeInMB: 8, // in mb
    fileOffset: null,

    post: function(url, data) {
        return $.ajax({
            url: url,
            type: 'POST',
            data: data,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": Upload.digest(),
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

        // Attempt form digest update every 5 minutes
        setInterval(function() {
            console.log('Update form digest')
            UpdateFormDigest(Upload.pageUrl, _spFormDigestRefreshInterval);
        }, 5 * 60000);
    },
    getFile: function() {
        console.log("Getting file")
        let d = $.Deferred();
        this.parseFile()
        return d.promise();
    },

    parseFile: function() {
      let file = Upload.file
      let fileSize = file.size;
      let chunkSize = this.chunkSizeInMB * (1024 * 1024);
      let offset = 0;
      let firstChunk = true;
      let uploadType = null;

      let sendBlob = blob => {
        if (blob.size != 0) {
          offset += chunkSize;
          uploadType = firstChunk ? "start" : (offset >= fileSize) ? "finish" : "continue";

          Upload.loadChunk(blob, uploadType).then(() => {
            firstChunk = false;
            if (uploadType !== 'finish') readBlob(offset)
          })
        } else {
          console.log('Error in blob reading');
          return;
        }

        if (offset >= fileSize) {
          Upload.finished();
          return;
        }
      }
      let readBlob = _offset => {
        let blob = file.slice(_offset, chunkSize + _offset)
        sendBlob(blob)
      }
      readBlob(offset)
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

        let post = Upload.post(call.url, chunk)

        post.then(response => {
            Upload.chunkID = response.d[call.response]
            d.resolve();
        })
        return d.promise();
    },
}

$(() => Upload.init())
