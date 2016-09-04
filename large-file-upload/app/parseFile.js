export default function parseFile(file, options) {
  var opts       = typeof options === 'undefined' ? {} : options;
  var fileSize   = file.size;
  var chunkSize  = typeof opts['chunk_size'] === 'undefined' ?  64 * 1024 : parseInt(opts['chunk_size']);
  var binary     = typeof opts['binary'] === 'undefined' ? false : opts['binary'] == true;
  var offset     = 0;
  var self       = this; // we need a reference to the current object
  var readBlock  = null;
  var chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function() {};
  var chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function() {};
  var success = typeof opts['success'] === 'function' ? opts['success'] : function() {};

  var onLoadHandler = function(evt) {
    if (evt.target.result == "") {
      console.log('Chunk empty, call finish');
      success(file);
      return;
    }

    if (evt.target.error == null) {
      chunkReadCallback(evt.target.result, offset).then(function() {
        offset += evt.target.result.length;
        readBlock(offset, chunkSize, file);
      });
    } else {
      chunkErrorCallback(evt.target.error);
      return;
    }
    if (offset >= fileSize) {
      success(file);
      return;
    }
  }

  readBlock = function(_offset, _chunkSize, _file) {
    var r = new FileReader();
    var blob = _file.slice(_offset, _chunkSize + _offset);
    r.onload = onLoadHandler;

    var z = 1024 * 1024;
    console.log("blob size:", blob.size/z, "offset:", _offset/z, "C+O:", (_chunkSize + _offset)/z, "fileSize:", file.size/z)

    var x = _chunkSize + _offset;
    if (x >= file.size) {
      console.log('OFFSET MATCHES SIZE')
    }

    binary ? r.readAsArrayBuffer(blob) : r.readAsText(blob)

  }
  readBlock(offset, chunkSize, file);
}
