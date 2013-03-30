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
		uploadThumbSize: options.uploadThumbSize,
    preview: options.preview
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
  $('body').append('<div class="progress-bar" id="progress-' + id + '"><div class="status"></div></div>');
  $('#progress-' + id + ' .status').append('<div class="elements-wrapper"><span id="cancel-' + id + '" class="multiupload-icon multiupload-icon-close"></span><span class="file-name">' + filename + '</span></div>');
  $('#cancel-' + id).bind("click", function (event) {
    var flash = document.getElementById(multiuploadId);
    flash.cancelUpload(id);
    $('#progress-' + id).remove();
  });
}

function multiuploadShowPreview(id, multiuploadId, str) {
  $('#progress-' + id).before('<div><img class="preview-thumbnail" src="data:image/png;base64,' + str + '" /></div>');
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
function multiuploadUpdateProgressBar(id, bytesLoaded, bytesTotal, flashID) {
  if ($('#progress-' + id).length > 0) {
    $('#progress-' + id + ' .status').css('width', bytesLoaded / bytesTotal * 100 + '%');
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
  var fileID = uploaderData.fileID;
  $('#spinner').fadeOut('fast', function() {
    $('#spinner').remove();
  });
//  $('#progress-' + fileID).fadeOut('slow', function() {
//    $(this).remove();
//  });
  $('#image').append('<div class="multiupload-thumbnail-wrapper multiupload-hidden"><img class="multiupload-thumbnail" src="' + uploaderData.fileResizeUrl + '"><span class="multiupload-thumbnail-text">' + uploaderData.fileName + '</span></div>');
  $("#image .multiupload-thumbnail-wrapper.multiupload-hidden").not('.fadein').addClass('fadein').fadeIn('slow', function() {
    $(this).removeClass('fadein multiupload-hidden');
  });

}

function multiuploadAddButtons(multiuploadId) {
    $('body').append('<button class="start-upload">Start Upload</button>')
    $('.start-upload').unbind('click').bind("click", function (event) {
      var flash = document.getElementById(multiuploadId);
      flash.startUpload();
    });
}

function debugFlash(message) {
  $('body').append('<div>' + message + '</div>');
}