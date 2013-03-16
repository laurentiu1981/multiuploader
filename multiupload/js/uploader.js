function multiUploader(options) {
	var width = options.buttonImagePathWidth;
	var height = options.buttonImagePathHeight;

	var flashvars = {
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
	var params = {};
	var attributes = {};
	//params.allowscriptaccess = "always";
	attributes.id = "as3_js";
	swfobject.embedSWF("uploader.swf", "alt", width, height, "9.0.0", false, flashvars, params, attributes);
}

/**
 * Prints errors messages.
 *
 * @param string message
 *   Error message.
 */
function multiuploadPrintErrors(message) {
  $('#error').append(message).show();
}

/**
 * Creates unique progress bar for all files.
 */
function multiuploadInitializeUniqueProgressBar() {
  var progressbar = $("#progressbar"),
    progressLabel = $(".progress-label");

  progressbar.progressbar({
    value:false,
    change:function () {
      progressLabel.text(progressbar.progressbar("value") + "%");
    },
    complete:function () {
      progressLabel.text("Complete!");
    }
  });
}

/**
 * Creates spinner with percent representing uploaded size.
 */
function multiuploadInitializeSpinner() {
  $('#spinner').remove();
  $('body').append(<div id="spinner"><img src="/multiupload/images/loader.gif"/></div>);
}

/**
 * Creates progress bar for a given filename.
 *
 * @param string filename
 *   Filename
 */
function multiuploadInitializeProgressBar(filename) {
  var js_filename = filename.replace(/\./g, '-');
  $('body').append('<div class="progress-bar" id="progress-' + js_filename + '"><div class="status"></div></div>');
  $('#progress-' + js_filename + ' .status').append('<div class="elements-wrapper"><span id="cancel-' + js_filename + '" class="ui-icon ui-icon-close"></span><span class="file-name">' + filename + '</span></div>');
  $('#cancel-' + js_filename).bind("click", function (event) {
    $('#progress-' + js_filename).remove();
    var flash = document.getElementById("multiuploadID");
    flash.cancelUpload(filename);
  });
}

/**
 * Update unique progress bar and percent of uploaded data.
 *
 * @param strin percent
 *   Percent of uploaded data.
 */
function multiuploadUpdateUniqueProgressBar(percent) {
  $(function () {
    counter = counter.toFixed(2);
    var progressbar = $("#progressbar");
    progressbar.progressbar("value", parseFloat(counter));
  });
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
  $('#spinner').fadeOut('fast', function() {
    $('#spinner').remove();
  });
  $('.progress-bar').fadeOut('slow', function() {
    $('.progress-bar').remove();
  });
  var uploaderData = $.parseJSON(message);
  $('#image').append($("<img src='" + uploaderData.fileResizeUrl + "'>"));

}