<?php
	// имя файла с изображением
	$imgfile = 'img/palette.png';
	// загрузить файл с изображением
	$img = @imagecreatefromjpeg ('img/one.jpg');
	//$img = imagecreatefrompng($imgfile);
	// получить координаты точки, в которой пользователь щелкнул мышью
	$offsetx = $_GET['offsetx'];
	$offsety = $_GET['offsety'];
	// получить цвет по заданным координатам
	$rgb = imagecolorat($img, $offsetx, $offsety);
/* $r = ($rgb >> 16) & 0xFF;
$g = ($rgb >> 8) & 0xFF;
$b = $rgb & 0xFF; */
	// вернуть код цвета
	//printf("red");
	//echo '#ff0000';
	//printf('#%02s%02s%02s', dechex($b), dechex($g), dechex($r));
	//printf('#%02s',$r);
	//printf($rgb);
	//var_dump($r, $g, $b);
	
	$colors = imagecolorsforindex($img, $rgb);
	printf('#%02s%02s%02s',dechex($colors['red']), dechex($colors['green']), dechex($colors['blue']));
	

	//var_dump($colors);
?>