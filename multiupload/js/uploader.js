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
		progressbar: options.progressbar
	};
	var params = {};
	var attributes = {};
	//params.allowscriptaccess = "always";
	attributes.id = "as3_js";
	swfobject.embedSWF("uploader.swf", "alt", 300, 300, "9.0.0", false, flashvars, params, attributes);
}