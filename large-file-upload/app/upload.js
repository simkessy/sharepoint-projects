window.Upload = window.Upload || {};

Upload = {
    guid: null, // Unique GUID for upload process
    digest: (() => $("#__REQUESTDIGEST").val()), // Page Digest need to secure request
    fileInput: null, // DOM file input element
    folderPath: null, // Folder path where to save file
    button: null, // Upload button to attach events
    pageUrl: _spPageContextInfo.webServerRelativeUrl,

    firstChunk: true, // Flag for first upload chunk
    chunkID: null, // ID of last chunk processed. Used to initiate next chunk start point
    chunkSizeInMB: 8, // Defaul chunk sizes in MB

    // Handle all ajax posts
    post: (url, data) => {
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

    // Set inputs and input event handlers
    init: function(fileInput, folderPath, buttonElement) {
        this.fileInput = $(`#${fileInput}`);
        this.folderPath = folderPath;
        this.button = $(`#${buttonElement}`);
        this.guid = SP.Guid.newGuid().toString();
        this.fileInput.change(() => {
            this.file = $(this)["0"].fileInput["0"].files["0"]
            this.filePath = this.folderPath + this.file.name
        });

        this.button.click(Upload.getFile);
    },

    // Page Digest expires every 30 minutes.
    // Check every 5 minutes to determine if new digest can be obtained
    // Update the digest to prevent FORBIDDEN error during long uploads
    startDigestCheck: function() {
        Upload.digestCheck = setInterval(initUpdateFormDigest, 5*60000)

        let initUpdateFormDigest =  () => {
            console.log('Update form digest')
            UpdateFormDigest(Upload.pageUrl, _spFormDigestRefreshInterval);
        }
    },

    // Retrieve file object from input
    getFile: function() {
        if (Upload.fileInput[0].files.length === 0) {
            alert('No file selected');
            return;
        }

        console.log("Getting file")
        let d = $.Deferred();

        Upload.startDigestCheck();

        Upload.parseFile()
            .then(() => {
                Upload.finished();
                d.resolve();
            }, (err) => {
                Upload.error(err);
                d.reject();
            })
            .always(clearInterval(Upload.digestCheck))
        return d.promise();
    },

    // Turn file into chunks/slices and upload each chunk to library
    parseFile: function() {
        let d = $.Deferred();

        let file = Upload.file
        let fileSize = file.size;
        let defaultChunkSize = this.chunkSizeInMB * (1024 * 1024);
        let chunkSize = (defaultChunkSize > fileSize) ? (fileSize / 2) : defaultChunkSize;
        let offset = 0;
        let firstChunk = true;
        let uploadType = null;

        let sendBlob = blob => {
            if (blob.size !== 0) {
                offset += chunkSize;
                uploadType = firstChunk ? "start" : (offset >= fileSize) ? "finish" : "continue";

                Upload.loadChunk(blob, uploadType)
                    .then(() => {
                        firstChunk = false;
                        if (uploadType !== 'finish') readBlob(offset);
                    }, (error) => {
                        d.reject(error)
                    })
            } else {
                console.log('Error in blob reading');
                d.reject('Error in reading blob');
                return;
            }

            if (offset >= fileSize) {
                d.resolve('Completed file upload');
                return;
            }
        }
        let readBlob = _offset => {
            let blob = file.slice(_offset, chunkSize + _offset);
            sendBlob(blob);
        }
        readBlob(offset);
        return d.promise();
    },

    // Load each file chunk into library
    // Type: start, continue or finished <--- set by parse file automatically
    loadChunk: (chunk, type) => {
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
                response: "ListItemAllFields.__deferred.uri"
            }
        }

        let call = processCalls[type];
        let post = Upload.post(call.url, chunk)

        post.then(response => {
            Upload.chunkID = response.d[call.response]
            d.resolve();
        }, (error) => {
            let errorMessage = JSON.parse(error.responseText).error.message.value
            d.reject(JSON.stringify(errorMessage))
        })
        return d.promise();
    },

    // Use this to handle progress or animations at some point
    finished: function() {
        Upload.updateFileLookup()
    },
    error: function(error) {
        document.getElementById('showMsg').style.display = 'block';
        document.getElementById('showMsg').innerHTML = `Upload Error: ${error}`;
        console.log(error);
    },
    updateFileLookup: function() {
        let filePropertiesUrl = `${_spPageContextInfo.webServerRelativeUrl}/_api/Web/GetFileByServerRelativeUrl('${_spPageContextInfo.webServerRelativeUrl}/Documents/${Upload.fileInput[0].files[0].name}')/ListItemAllFields`;

        $.get(filePropertiesUrl)
            .then(function(responseXML) {
                let $xml = $(responseXML);
                let fileID = $xml.SPFilterNode("d:Id").text();

                let isLessonsLearned = location.pathname.indexOf("Lessons%20Learned") > -1;
                let lookUpField = isLessonsLearned ? "Lesson" : "Common";
                let queryParam = location.search.substring(location.search.indexOf("=") + 1);

                $().SPServices({
                   operation: "UpdateListItems",
                   listName: "Documents",
                   ID: fileID,
                   valuepairs: [[lookUpField, queryParam]],
                   completefunc: function (xData, Status) {
                        document.getElementById('showMsg').style.display = 'block';
                        document.getElementById('showMsg').innerHTML = 'Document Successfully Added!';
                        location.reload();
                   }
                });
            })
    }
}

// When document is ready and SharePoint dependencies loaded launch init
$(() => SP.SOD.executeFunc('sp.js', 'SP.ClientContext',
    () => {
        let input = 'docUpload';
        let destination = `${_spPageContextInfo.webServerRelativeUrl}/Documents/`;
        let button = 'btnSave';
        Upload.init(input, destination, button)
    })
)

