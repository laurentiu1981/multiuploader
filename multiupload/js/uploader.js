var html5 = false;
var options = {
  buttonImagePath : "/multiupload/images/upload_icon.png",
  buttonImagePathWidth : 32,
  buttonImagePathHeight : 32,
  maxFiles : 1000,
  maxFileSize : 110.8,
  maxSize : 800,
  uploadScript : "/multiupload/upload.php",
  allowedExtensions : "*.jpg; *.jpeg; *.gif; *.png; *.txt", // allowed extensions
  messages : "Maximum number of files exceeded,Maximum size in MB exceeded,Maximum size per file exceeded", // messages
  progressbar : "multiple", // unique/multiple/spinner/none possible states
  preview : 0, // enable preview of the images.
  uploadFolder : "img/", // upload path
  uploadThumbSize : "150,140", // thumb width, thumb height
  multiuploadId : 'multi-uploader',
  uploadButtonSize : 'auto', // auto - will enlarge the upload button size at actual dimmension of the image.
  autoMask : false, //
  flash : 'auto' // auto - will detect if html5 version is usable.
}

// Initialize upload button. Either flash or html5 version.
function multiUploader(sent_options, id) {
  $.extend(options, sent_options);
  if( window.FormData !== undefined ) {
    debugFlash('html5 available');
    if (options.flash != true) {
      html5 = true;
    }
  }
  else {
    debugFlash('html5 not available');
    html5 = false;
  }
  if (options.uploadButtonSize != 'auto') {
    options.buttonImagePathWidth = options.uploadButtonSize.width;
    options.buttonImagePathHeight = options.uploadButtonSize.height;
  }
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
  // Pick flash version if html5 is not available or flash option is true.
  if (html5 == false) {
    var params = {wmode: "transparent"};
    var attributes = {};
    attributes.id = id;
    swfobject.embedSWF("uploader.swf", id, options.buttonImagePathWidth, options.buttonImagePathHeight, "9.0.0", false, flashvars, params, attributes);
  }
  // Pick html5 version.
  else {
    jQuery(document).ready(function(){
      initHandlers(id);
    })
  }
}

(function($) {
  $.fn.multiupload = function(options) {
    var cid = 0;
    this.each(function() {
      var $this = $(this);
      cid++;
      if ($this.is('div')) {
        $this.append('<div id="'+ options.multiuploadId + cid +'" class="multiupload-element"></div>');
        multiUploader(options, options.multiuploadId + cid);
      }
      else {
        var id = $this.attr('id');
        var classes = $this.attr('class');
        $this.replaceWith('<div id="multi-uploader-wrapper-temp"></div>');
        $this = $('#multi-uploader-wrapper-temp');
        if (typeof id !== 'undefined') {
          $this.attr('id', '');
          $this.attr('id', id);
        }
        if (typeof classes !== 'undefined') {
          $this.addClass(classes);
        }
        multiUploader(options, id);
      }
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
  $('body').append('<div class="progress-bar-wrapper" id="progress-' + id + '"><div class="preview-box"></div><div class="progress-bar"><div class="status"></div></div></div><div class="clearfix"></div>');
  $('#progress-' + id + ' .status').append('<div class="elements-wrapper"><span id="cancel-' + id + '" class="multiupload-icon multiupload-icon-close"></span><span class="file-name">' + filename + '</span></div>');
  $('#cancel-' + id).bind("click", function (event) {
    if (html5 == false) {
      var flash = document.getElementById(multiuploadId);
      flash.cancelUpload(id);
    }
    else {
      cancelUpload(id, xhr);
    }
    $('#progress-' + id).fadeOut('slow', function() {
      $('#progress-' + id).remove();
    });

  });
}

function multiuploadShowPreview(id, multiuploadId, str) {
  if (html5 == false) {
    $('#progress-' + id + ' .preview-box').append('<img class="preview-thumbnail" src="data:image/png;base64,' + str + '" />');
  }
  else {
    $('#progress-' + id + ' .preview-box').append('<img class="preview-thumbnail" src="' + str + '" />');
  }
}

/**
 * Update unique progress bar and percent of uploaded data.
 *
 * @param {string} percent
 *   Percent of uploaded data.
 */
function multiuploadUpdateUniqueProgressBar(percent) {
  counter = parseFloat(percent.toFixed(2));
  if (counter >= 100) {
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
  $('#image').append('<div class="multiupload-thumbnail-wrapper multiupload-hidden"><img class="multiupload-thumbnail" src="' + encodeURI(uploaderData.fileResizeUrl) + '"><span class="multiupload-thumbnail-text">' + uploaderData.fileName + '</span></div>');
  $("#image .multiupload-thumbnail-wrapper.multiupload-hidden").not('.fadein').addClass('fadein').fadeIn('slow', function() {
    $(this).removeClass('fadein multiupload-hidden');
  });

}

function multiuploadAddButtons(multiuploadId) {
    if ($('.start-upload').length > 0) {
      return;
    }
    if (html5 == true){
      $('button.customfile-upload').after('<button class="start-upload">Start Upload</button>')
    }
    else {
      $('#' + options.multiuploadId).after('<button class="start-upload">Start Upload</button>')
    }
    $('.start-upload').unbind('click').bind("click", function (event) {
      if (html5 == false) {
        var flash = document.getElementById(multiuploadId);
        flash.startUpload();
      }
      else {
        uploadNextFile();
      }
    });
}

function debugFlash(message) {
  $('body').append('<div>' + message + '</div>');
}

//===========HTML5 version====================
(function( $ ) {
  $.fn.customFile = function() {
    return this.each(function() {
      var $file = $(this).addClass('customfile'); // the original file input
      $file.css({
        position: 'absolute',
        left: '-9999px'
      });
    });

  };
}( jQuery ));


var currentFilesList = new Array();
var uploadedCount = 0;
var lastFileId = 0;
var options;
var total = 0;
var totalRaw = 0;
var uniqueProgressBarInit = false;
var ONE_MEGABYTE = 1048576;
var uploadRunning = false;
var removedFiles = new Array();
var uploadedSizes = new Array();
var xhr;


// init handlers
function initHandlers(id) {
  var
    $file = $('#' + id);
    wrap = $('<div class="customfile-wrap">'),
    button = $('<button type="button" class="customfile-upload"></button>');
    label = $('<label class="customfile-upload" for="' + id + '"></label>');
    input = $('<input id="' + id + '" name="imgfile" type="file" multiple>');
  input.customFile();
  input.attr('tabIndex', -1);

  wrap.insertAfter($file).append($file, ( !html5 ? label : button ), input);
  $file.remove();

  var uploadArea = document.getElementById(id);
  uploadArea.addEventListener('drop', handleDrop, false);
  uploadArea.addEventListener('dragover', handleDragOver, false);
  uploadArea.addEventListener("change", function () {
    doFilesSelect(this.files);
  }, false);

  button.attr('tabIndex', -1);
  var img = new Image();
  img.onload = function() {
    if (!options.hasOwnProperty('uploadButtonSize') || (options.hasOwnProperty('uploadButtonSize') && options.uploadButtonSize == 'auto')) {
      button.css({
        width: this.width,
        height: this.height,
        border: 'none',
        cursor: 'pointer'
      });
    }
    else {
      button.css({
        width: options.uploadButtonSize.width,
        height: options.uploadButtonSize.height,
        border: 'none',
        cursor: 'pointer',
        'background-size': options.uploadButtonSize.width + ' ' + options.uploadButtonSize.height
      });
    }
    button.fadeIn();
  }
  img.src = options.buttonImagePath;
  button.css({
    background: 'white url(' + options.buttonImagePath + ') no-repeat top',
    color: 'white'
  });
  button.click(function () {
    input.focus().click();
  });
}




function handleDrop(evt){
  evt.preventDefault();
  evt.stopPropagation();
}

function handleDragOver(evt){
  evt.preventDefault();
  evt.stopPropagation();
}

function uploadFile(file) {
  uploadRunning = true;
  xhr = new XMLHttpRequest();
  xhr.open('POST', options.uploadScript);
  xhr.onload = function () {
    uploadDataComplete(this.responseText);
  };
  xhr.onerror = function () {
    debugFlash('error detected');
  };
  xhr.onabort = function() {
    debugFlash('canceled');
  }
  xhr.upload.onprogress = function (event) {
    progressHandler(event);
  }
  xhr.upload.onloadstart = function (event) {
  }

  var formData = new FormData();
  formData.append('imgfile', file);
  formData.append('uploadThumbSize', options.uploadThumbSize);
  currentFilesList[uploadedCount] = file;
  xhr.send(formData);
}

function doFilesSelect(files) {
  var size = 0;
  var errors = false;
  var initialFileId = lastFileId;
  for (var iter = 0; iter < files.length; iter++) {
    currentFilesList[lastFileId] = files[iter];
    size = files[iter].size;
    if (size / ONE_MEGABYTE > options.maxFileSize) {
      multiuploadPrintErrors('error 2');
      errors = true;
    }
    total +=  size;
    lastFileId++;
  }
  totalRaw = total;
  if (files.length > options.maxFiles) {
    multiuploadPrintErrors('error 0');
    errors = true;
  }
  if (total / ONE_MEGABYTE > options.maxSize) {
    multiuploadPrintErrors('error 1');
    errors = true;
  }
  if (errors == true) {
    return;
  }
  if (options.progressbar == "unique") {
    if (!uniqueProgressBarInit){
      multiuploadInitializeUniqueProgressBar();
      uniqueProgressBarInit = true;
    }
  }
  if (options.progressbar == "spinner") {
    multiuploadInitializeSpinner();
  }

  if (files.length > 0) {
    var id = 0;
    var filesLength = files.length,
        file = null;
    for (var i=0; i < filesLength; i++) {


      file = files[i];
      if (options.progressbar == "multiple") {
       multiuploadInitializeProgressBar(file.name, initialFileId + id, options.multiuploadId);
      }
      id++;
    }
    if (options.progressbar == "multiple" && options.preview == 1) {
      multiuploadAddButtons(options.multiuploadId);
      id = 0;
      for (var i=0; i < filesLength; i++) {
        file = files[i];
        var readers = new Array();
        if (options.progressbar == "multiple" && options.preview == 1) {
          readers[i] = new FileReader();
          // Closure to capture the file information.
          readers[i].onload = (function(theFile) {
            var fileIterator = i;
            return function(e) {
              multiuploadShowPreview(initialFileId + fileIterator, options.multiuploadId, e.target.result);
            };
          })(file);
          readers[i].readAsDataURL(file);
        }
      id++;
      }
      return;
    }
    if (uploadRunning == false) {
      uploadNextFile();
    }
  }
}

function uploadNextFile() {
  if (uploadedCount < currentFilesList.length && uploadRunning == false) {
    if (removedFiles[uploadedCount] != "canceled") {
      uploadFile(currentFilesList[uploadedCount]);
      return;
    }
    else {
      uploadedCount++;
      uploadNextFile();
      return;
    }
  }
  uploadRunning = false;
}

function uploadDataComplete(data) {
  uploadRunning = false;
  var parser=new DOMParser();
  var result = parser.parseFromString(data,"text/xml");
  status_nodes = result.getElementsByTagName('status');
  status = status_nodes[0].childNodes[0].nodeValue;

  message_nodes = result.getElementsByTagName('message');
  message = message_nodes[0].childNodes[0].nodeValue;
  var status_txt = "";
  var message;
  if (status == "Error") {
    status_txt = status;
  }
  multiuploadUploadComplete(message, status_txt);
  uploadedCount++;
  uploadNextFile();
}

function progressHandler(event) {
  var file = event;
  uploadedSizes[uploadedCount] = event.loaded;
  sentSize = 0;
  for(var iter = 0; iter <= uploadedCount; iter++) {
    sentSize += uploadedSizes[iter];
  }
  var sampling = parseInt((sentSize/totalRaw) * 100);
  if (options.progressbar == "unique") {
    multiuploadUpdateUniqueProgressBar(sampling);
  }
  else if (options.progressbar == "multiple") {
    multiuploadUpdateProgressBar(uploadedCount, event.loaded, event.total, options.multiuploadId);
  }
    else if (options.progressbar == "spinner") {
      multiuploadInitializeSpinner();
    }
}

function cancelUpload(id, xhr) {
  if (uploadedCount == id && uploadRunning == true) {
    xhr.abort();
    uploadRunning = false;
    uploadedCount++;
    uploadNextFile();
  }
  else {
    removedFiles[id] = "canceled";
  }
}
