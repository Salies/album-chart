<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>

<script src="color-thief.js"></script>
<script>
var trueColors = [];

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}
</script>

<?php
ini_set('max_execution_time', 1800);

$albums = json_decode(file_get_contents('list.json'))->albums;

function getColors($x){
global $albums;

if($albums[$x]->cover===true){
    $url = 'http://coverartarchive.org/release/'.$albums[$x]->mbid.'/front';
}
else{
    $url = $albums[$x]->cover;
}

$img = 'data:image;base64,'.base64_encode(file_get_contents($url));

echo "
<script>
var img = document.createElement('img');
img.setAttribute('src', '".$img."');
img.addEventListener('load', function() {
    var colorThief = new ColorThief();
    var c = colorThief.getColor(img);
    var hsl = rgbToHsl(c[0], c[1], c[2]);
    var l = hsl[2];
    trueColors.push(l);
    console.log(l);
});
</script>
";
}

for($i=0;$i<sizeof($albums);$i++){
    getColors($i);
}

echo "<script>document.write(trueColors);</script>"

?>

</body>
</html>