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
    console.log('testing')
    if (evt.target.error == null) {
      offset += evt.target.result.length;
      chunkReadCallback(evt.target.result, offset)
    } else {
      chunkErrorCallback(evt.target.error);
      return;
    }

    if (offset >= fileSize) {
      success(file);
      return;
    }
    readBlock(offset, chunkSize, file);
  }

  readBlock = function(_offset, _chunkSize, _file) {
    var r = new FileReader();
    var blob = _file.slice(_offset, _chunkSize + _offset);
    r.onload = onLoadHandler;

    binary ? r.readAsArrayBuffer(blob) : r.readAsText(blob)
  }
  readBlock(offset, chunkSize, file);
}
