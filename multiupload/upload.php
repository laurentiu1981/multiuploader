<?php
require_once 'SimpleImage.php';

// $remote_addr = $_SERVER['REMOTE_ADDR'];
// $server_addr = $_SERVER['SERVER_ADDR'];
// if ($remote_addr !== $server_addr) {
//   echo "<result><status>Error</status><message>Hacking attempt.</message></result>";
//   die;
// }

function formatBytes($size, $precision = 2) {
  $base = log($size) / log(1024);
  $suffixes = array('', 'k', 'M', 'G', 'T');   

  return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
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
$upload_folder = 'img/';
if (!file_exists($upload_folder)) {
  mkdir($upload_folder, 0777);  
}

$file_destination = $upload_folder . basename($_FILES['imgfile']['name']);
$uploaded_file_url = 'http://' . $_SERVER['SERVER_NAME'] . '/' . $upload_folder . basename($_FILES['imgfile']['name']);
$uploaded_file_path = $_SERVER['DOCUMENT_ROOT'] . '/' . $upload_folder . basename($_FILES['imgfile']['name']);

$result = move_uploaded_file($_FILES['imgfile']['tmp_name'], $file_destination );

if ($result) {
  // Resize image if it is valid.
  if (is_image($file_destination)) {
	  $img = new SimpleImage();
    $file_resized_destination = $upload_folder . 'r_' .basename($_FILES['imgfile']['name']);
    $img->load($uploaded_file_path);
    $imageWidth = $img->getWidth();
    $imageHeight = $img->getHeight();
    $imageResizeWidth = 350;
    $imageResizeHeight = 240;  
    $img->resize($imageResizeWidth, $imageResizeHeight);
    $img->save($file_resized_destination);
    $file_size = strlen(file_get_contents($uploaded_file_url));
    $file_resized_size = strlen(file_get_contents($file_resized_destination));
  }
  $json_data = array(
    'filePath' => $uploaded_file_path,
    'fileName' => basename($uploaded_file_url),
    'fileSize' => formatBytes(strlen(file_get_contents($uploaded_file_url))),
    'fileWidth' => (isset($imageWidth) ? $imageWidth : 'undefined'),
    'fileHeight' => (isset($imageHeight) ? $imageHeight : 'undefined'),
    'fileResizePath' => (isset($file_resized_destination) ? $file_resized_destination : 'undefined'),
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