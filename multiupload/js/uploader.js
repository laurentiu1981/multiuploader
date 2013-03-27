function multiUploader(options, id) {
	var width = options.buttonImagePathWidth;
	var height = options.buttonImagePathHeight;
	var flashvars = {
    multiuploadId: id,
		buttonImagePath: options.buttonImagePath,
		buttonImagePathWidth: options.buttonImagePathWidth,
		buttonImagePathHeight: options.buttonImagePathHeight,
		maxFiles: options.maxFiles,
		maxFileSize: options.maxFileSize,
		maxSize: options.maxSize,
		uploadScript: options.uploadScript,
		allowedExtensions: options.allowedExtensions,
		messages: options.messages,
		progressbar: options.progressbar,
		uploadFolder: options.uploadFolder,
		uploadThumbSize: options.uploadThumbSize
	};
	var params = {wmode: "transparent"};
	var attributes = {};
	attributes.id = id;
	swfobject.embedSWF("uploader.swf", id, width, height, "9.0.0", false, flashvars, params, attributes);
}

(function($) {
  $.fn.multiupload = function(options, id) {
    var cid = 0;
    return this.each(function() {
      var $this = $(this);
      cid++;
      $this.append('<div id="'+ id + cid +'"></div>');
      multiUploader(options, id + cid);
    });
  };
})( jQuery );

 /**
  Creates unique progress bar for all files.
 */
function multiuploadInitializeUniqueProgressBar() {
    $('#progressbar').remove();
    $('body').append('<div id="progressbar" class="multiupload-progressbar multiupload-widget multiupload-widget-content multiupload-corner-all">'
  + '<div class="progress-label">0%</div>'
  + '<div class="multiupload-progressbar-value multiupload-widget-header multiupload-corner-all"></div></div>');
}

/**
 * Creates spinner with percent representing uploaded size.
 */
function multiuploadInitializeSpinner() {
  $('#spinner').remove();
  $('body').append('<div id="spinner"><img src="/multiupload/images/loader.gif"/></div>');
}

/**
 * Creates progress bar for a given filename.
 *
 * @param {string} filename
 *   Filename
 * @param {int} id
 *   File id.
 * @param {string} multiuploadId
 *   Flash object id.
 */
function multiuploadInitializeProgressBar(filename, id, multiuploadId) {
  var js_filename = filename.replace(/\./g, '-');
  $('body').append('<div class="progress-bar" id="progress-' + js_filename + '"><div class="status"></div></div>');
  $('#progress-' + js_filename + ' .status').append('<div class="elements-wrapper"><span id="cancel-' + js_filename + '" class="multiupload-icon multiupload-icon-close"></span><span class="file-name">' + filename + '</span></div>');
  $('#cancel-' + js_filename).bind("click", function (event) {
    $('#progress-' + js_filename).remove();
    var flash = document.getElementById(multiuploadId);
    flash.cancelUpload(filename, id);
  });
}

/**
 * Update unique progress bar and percent of uploaded data.
 *
 * @param {string} percent
 *   Percent of uploaded data.
 */
function multiuploadUpdateUniqueProgressBar(percent) {
  counter = parseFloat(percent.toFixed(2));
  if (counter > 100) {
    message = 'Complete!';
  }
  else {
    message = counter + '%';
  }
  $('#progressbar .progress-label').text(message);
  $('#progressbar .multiupload-widget-header').css('width', counter + '%');
}

/**
 * Update progress bar for a given filename.
 *
 * @param string filename
 *   Filename
 * @param int bytesLoaded
 *   Size of uploaded data.
 * @param int bytesTotal
 *   Total size of file to be uploaded.
 * @param string flashID
 *   ID of flash object.
 */
function multiuploadUpdateProgressBar(filename, bytesLoaded, bytesTotal, flashID) {
  var js_filename = filename.replace(/\./g, '-');
  if ($('#progress-' + js_filename).length > 0) {
    $('#progress-' + js_filename + ' .status').css('width', bytesLoaded / bytesTotal * 100 + '%');
  }
}

/**
 * Update percent of uploaded data.
 *
 * @param string percent
 *   Percent of uploaded data.
 */
function multiuploadUpdateSpinner(percent) {

}

/**
 * Handler for upload complete.
 */
function multiuploadUploadComplete(message, status) {
  var uploaderData = $.parseJSON(message);
  var js_filename = uploaderData.fileName.replace(/\./g, '-');
  $('#spinner').fadeOut('fast', function() {
    $('#spinner').remove();
  });
  $('#progress-' + js_filename).fadeOut('slow', function() {
    $(this).remove();
  });
  $('#image').append($("<img src='" + uploaderData.fileResizeUrl + "'>"));

}

function debugFlash(message) {
  $('body').append('<div>' + message + '</div>');
}