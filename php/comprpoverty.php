<?php

$zoom = $_GET["zoom"];
$filename = $_GET["filename"];
$lat = $_GET["lat"];
$lng = $_GET["lng"];
$title = $_GET["title"];
$agef = $_GET["agef"];
$aget = $_GET["aget"];
$pct = $_GET["pct"];
$outname = $_GET["outname"];

exec ('/mnt/webroot/gis-php/phantomjs rasterize.js '.$filename.'?zoom='.$zoom.'qqlat='.$lat.'qqlng='.$lng.'qqtitle='.$title.'qqagef='.$agef.'qqaget='.$aget.'qqpct='.$pct.' /mnt/webroot/tmp/'.$outname.'.png');

?>
