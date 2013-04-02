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
  $('body').append('<div class="progress-bar-wrapper" id="progress-' + id + '"><div class="preview-box"></div><div class="progress-bar"><div class="status"></div></div></div><div class="clearfix"></div>');
  $('#progress-' + id + ' .status').append('<div class="elements-wrapper"><span id="cancel-' + id + '" class="multiupload-icon multiupload-icon-close"></span><span class="file-name">' + filename + '</span></div>');
  $('#cancel-' + id).bind("click", function (event) {
    //var flash = document.getElementById(multiuploadId);
    cancelUpload(id, xhr);
    $('#progress-' + id).fadeOut('slow', function() {
      $('#progress-' + id).remove();
    });

  });
}

function multiuploadShowPreview(id, multiuploadId, str) {
  $('#progress-' + id + ' .preview-box').append('<img class="preview-thumbnail" src="data:image/png;base64,' + str + '" />');
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
    $('body').append('<button class="start-upload">Start Upload</button>')
    $('.start-upload').unbind('click').bind("click", function (event) {
      var flash = document.getElementById(multiuploadId);
      flash.startUpload();
    });
}

function debugFlash(message) {
  $('body').append('<div>' + message + '</div>');
}

//===========HTML5 version====================
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
function initHandlers() {
  if( window.FormData !== undefined ) {
    debugFlash('html5 available');
  }
  else {
    debugFlash('html5 not available');
  }
  var uploadArea = document.getElementById(options.multiuploadId);
  uploadArea.addEventListener('drop', handleDrop, false);
  uploadArea.addEventListener('dragover', handleDragOver, false);
  uploadArea.addEventListener("change", function () {
    doFilesSelect(this.files);
  }, false);
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
        if (options.progressbar == "multiple" && options.preview == 1) {
          file.addEventListener(Event.COMPLETE, handleLoadWrapper, false, 0, false);
          file.load();
          function handleLoadWrapper(event) {
            handleLoad(e, initialFileId+id);
          };
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

function handleLoad(event, initialFileId) {
  if (uploadRunning == true) {
    return;
  }
  var file = event.target;
  var fileByteArr;
  var str;
  fileByteArr = file.data;
  str = compress(fileByteArr);
  for(var iter = 0; iter < currentFilesList.length; iter++) {
    if (currentFilesList[iter] == file) {
      multiuploadShowPreview(iter, options.multiuploadId, str);
    }
  }
}

function compress(bytes) {
  var enc = new Base64Encoder();
  enc.encodeBytes(bytes);
  return enc.drain().split("\n").join("");
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

jQuery(document).ready(function(){
  initHandlers();
})