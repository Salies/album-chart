function rgbToHsl(a, e, r) {
    a /= 255, e /= 255, r /= 255;
    var s, c, t = Math.max(a, e, r),
        i = Math.min(a, e, r),
        n = (t + i) / 2;
    if (t == i) s = c = 0;
    else {
        var b = t - i;
        switch (c = n > .5 ? b / (2 - t - i) : b / (t + i), t) {
            case a:
                s = (e - r) / b + (e < r ? 6 : 0);
                break;
            case e:
                s = (r - a) / b + 2;
                break;
            case r:
                s = (a - e) / b + 4
        }
        s /= 6
    }
    return [s, c, n]
}

function artistDisplay(bool){
    if(bool===true){
        $(".album-data").css("display", "none");
        $(".artist-data").css("display", "block");
        $(".back").css("display", "block");
    }
    else{
        $(".album-data").css("display", "block");
        $(".artist-data").css("display", "none");
        $(".back").css("display", "none");
    }
}

$(".close").click(function () {
    $(".overlay").css("display", "none")
});

$(".album img").click(function () {
    let o = parseInt(this.id, 10) - 1,
        background = `${c[o][0]}, ${c[o][1]}, ${c[o][2]}`,
        art;

    if (a[o].cover === true) {
        art = `http://coverartarchive.org/release/${a[o].mbid}/front`;
    } else {
        art = a[o].cover;
    }

    var trackContainer = ["",""];

    for (t = 0; t < a[o].tracks.length; t++) {
        trackContainer[a[o].tracks[t].cd - 1] += `<div class="song"><span class="number">${a[o].tracks[t].number}</span><span class="name">${a[o].tracks[t].name}</span><span class="length">${a[o].tracks[t].length}</span></div><Br>`;
    }

    $(".cd1").html(trackContainer[0]);
    $(".cd2").html(trackContainer[1]);

    if (rgbToHsl(c[o][0], c[o][1], c[o][2])[2] < 0.5) {
        $(".album-window").css("color", "#fff");
        $(".album-window").css("font-weight", "300");
    } else {
        $(".album-window").css("color", "#000");
        $(".album-window").css("font-weight", "400");
    }
    $(".album-window").css("background", `rgb(${background})`);
    $(".album-display").attr("src", art);
    $(".info .title").html(a[o].title);
    $(".info .artist").html(`<a onclick="artistDisplay(true)">${a[o].author}</a> (${new Date(a[o].release).getFullYear()})`);

    //finding and mouting artist
    for(g=0;g<ats.length;g++){
        if(a[o].author == ats[g].name){
            $(".artist-display").attr("src", ats[g].image);
            $(".artist-name").html(ats[g].name);
            $(".artist-bio").html(ats[g].info.replace(/ *\[[^\]]*]/g, '').replace(/\n/g,'<br><br>'));
            $(".artist-country").html(`<img src="flags/4x3/${(ats[g].code).toLowerCase()}.svg" class="artist-flag"> ${ats[g].country}`);
            break;
        }
    }

    $(".overlay").css("display", "block");

    if($(".album-window").outerHeight() > $(".overlay").outerHeight()){
        $(".album-window").addClass("extra");
    }
});

$(document).mouseup(function (e) {
    var container = $(".album-window");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".overlay").hide();
        $(".album-window").removeClass("extra");
        artistDisplay(false);
    }
});