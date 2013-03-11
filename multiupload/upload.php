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

$uploaddir = '../img/';
if (!file_exists($uploaddir)) {
  mkdir($uploaddir, 0777);  
}
else chmod($uploaddir, 0777);
$uploadfile = $uploaddir . basename($_FILES['imgfile']['name']);
$uploadurl = 'http://' . $_SERVER['SERVER_NAME'] . '/img/' . basename($_FILES['imgfile']['name']);

$result = move_uploaded_file($_FILES['imgfile']['tmp_name'], $uploadfile );

if ($result) {
  if (!is_image($uploadfile)) {
    $json_data = array(
      'filePath' => $uploadurl,
      'fileName' => basename($uploadurl),
      'fileSize' => formatBytes(strlen(file_get_contents($uploadurl))),
      'fileWidth' => 'undefined',
      'fileHeight' => 'undefined',
      'fileResizePath' => 'undefined',
      'fileResizeName' => 'undefined',
      'fileResizeSize' => 'undefined',
      'fileResizeWidth' => 'undefined',
      'fileResizeHeight' => 'undefined',
    );  
  }
  else {
	  $img = new SimpleImage();
    $uploadurl_r = '../img/' . 'r_' .basename($_FILES['imgfile']['name']);
    $img->load($uploadurl);
    $imageWidth = $img->getWidth();
    $imageHeight = $img->getHeight();
    $imageResizeWidth = 350;
    $imageResizeHeight = 240;  
    $img->resize($imageResizeWidth, $imageResizeHeight);
    $img->save($uploadurl_r);  
    $fileSize = strlen(file_get_contents($uploadurl));
  
    $json_data = array(
      'filePath' => $uploadurl,
    	'fileName' => basename($uploadurl),
    	'fileSize' => formatBytes(strlen(file_get_contents($uploadurl))),
    	'fileWidth' => $imageWidth,
    	'fileHeight' => $imageHeight,
    	'fileResizePath' => $uploadurl_r,
    	'fileResizeName' => basename($uploadurl_r),
    	'fileResizeSize' => formatBytes(strlen(file_get_contents($uploadurl_r))),
    	'fileResizeWidth' => $imageResizeWidth,
    	'fileResizeHeight' => $imageResizeHeight,
	  );
  }
	$json_data = json_encode($json_data);

	$message =  "<result><status>OK</status><message>$json_data</message><fileSize>$fileSize</fileSize></result>";
}
else {
	$message = "<result><status>Error</status><message>Something is wrong with uploading a file.</message></result>";
}
 
echo $message;

?>