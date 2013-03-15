<?php
require_once 'SimpleImage.php';

function curl_get_file_size($file_url) {
  $ch = curl_init("$file_url");
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_BINARYTRANSFER, 1);
  curl_exec($ch);
  $size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
  curl_close($ch);
  return $size;
}

function formatBytes($size, $precision = 2) {
  if ($size >= 0) {
    $base = log($size) / log(1024);
    $suffixes = array('', 'k', 'M', 'G', 'T');

    return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
  }
  return 'not available';
}

function is_image($path) {
  $a = getimagesize($path);
  $image_type = $a[2];
  if (in_array($image_type , array(IMAGETYPE_GIF , IMAGETYPE_JPEG ,IMAGETYPE_PNG , IMAGETYPE_BMP))) {
    return true;
  }
  return false;
}

// Prepare folder.
// Check if folder or file exists, create it otherwise.
if (!isset($_POST['uploadFolder'])) {
  $upload_folder = 'img/';
}
else {
  $upload_folder = $_POST['uploadFolder'];
}

if (isset($_POST['uploadThumbSize'])) {
  $upload_thumb_size = explode(',', $_POST['uploadThumbSize']);
}
else {
  $upload_thumb_size = array('150', '150');
}
if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $upload_folder)) {
  mkdir($_SERVER['DOCUMENT_ROOT'] . '/' . $upload_folder, 0777, TRUE);
}

$file_relative_path = $upload_folder . basename($_FILES['imgfile']['name']);
$file_destination = $_SERVER['DOCUMENT_ROOT'] . '/' . $file_relative_path;
$uploaded_file_url = 'http://' . $_SERVER['SERVER_NAME'] . '/' . $file_relative_path;

if  ($_FILES['uploaded_file']['error'] == 0) {
  $result = move_uploaded_file($_FILES['imgfile']['tmp_name'], $file_destination );
}
else {
  return;
}

if ($result) {
  // Resize image if it is valid.
  if (is_image($file_destination)) {
	  $img = new SimpleImage();
    $file_resized_destination = $_SERVER['DOCUMENT_ROOT'] . '/' . $upload_folder . 'r_' . basename($_FILES['imgfile']['name']);
    $file_resized_url = 'http://' . $_SERVER['SERVER_NAME'] . '/' . $upload_folder . 'r_' . basename($_FILES['imgfile']['name']);
    $img->load($file_destination);
    $imageWidth = $img->getWidth();
    $imageHeight = $img->getHeight();
    $imageResizeWidth = $upload_thumb_size[0];
    $imageResizeHeight = $upload_thumb_size[1];
    $img->resize($imageResizeWidth, $imageResizeHeight);
    $img->save($file_resized_destination);
    $file_size = filesize($file_destination);
    $file_resized_size = filesize($file_resized_destination);
  }
  $json_data = array(
    'filePath' => $file_destination,
    'fileUrl' => $uploaded_file_url,
    'fileName' => basename($uploaded_file_url),
    'fileSize' => formatBytes($file_size),
    'fileWidth' => (isset($imageWidth) ? $imageWidth : 'undefined'),
    'fileHeight' => (isset($imageHeight) ? $imageHeight : 'undefined'),
    'fileResizePath' => (isset($file_resized_destination) ?  $file_resized_destination : 'undefined'),
    'fileResizeUrl' => (isset($file_resized_url) ?  $file_resized_url : 'undefined'),
    'fileResizeName' => (isset($file_resized_destination) ? basename($file_resized_destination) : 'undefined'),
    'fileResizeSize' => (isset($file_resized_size) ? formatBytes($file_resized_size) : 'undefined'),
    'fileResizeWidth' => (isset($imageResizeWidth) ? $imageResizeWidth : 'undefined'),
    'fileResizeHeight' => (isset($imageResizeHeight) ? $imageResizeHeight : 'undefined'),
  );
  $json_data = json_encode($json_data);

	$message =  "<result><status>OK</status><message>$json_data</message><fileSize>$file_size</fileSize></result>";
}
else {
	$message = "<result><status>Error</status><message>Something is wrong with uploading a file.</message></result>";
}
 
echo $message;

?>