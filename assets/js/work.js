var currentInfo, playbackState, displayTrack, nowPlaying = {previous:'', next:''}, started = false, clicked = false, minimized = false, isClicking = false, isClickingVolume = false;

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

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(e) {
    e.target.playVideo();
}

function onPlayerStateChange(e) {
    if(player.getDuration()!=0 && clicked===true){
        clicked = false;
        $(".totalTime").html(round(player.getDuration() - 1));
        $(".realVolume").val(player.getVolume());
        $('.volume-progress').animate({width: `${player.getVolume()}%`});
        let getPorc = (player.getCurrentTime() * 100) / player.getDuration();
        $('.progress').animate({width: `${getPorc}%`});
        $(".realVolume").fadeIn();
        $(".realBar").attr("max", player.getDuration() - 1);
    }

    playbackState = e.data;
    
    if(playbackState==2 || playbackState===undefined){
        $('.pp').attr('src', 'img/play.png');
    }
    else if(playbackState==0){
        $('.pp').attr('src', 'img/replay.png');
    }
    else{
        $('.pp').attr('src', 'img/pause.png');  
        setInterval(function(){ 
            if(!isClicking){
                $(".realBar").val(player.getCurrentTime());
                let porc = (player.getCurrentTime() * 100) / player.getDuration();
                $('.progress').css('width', `${porc}%`);
            }
        }, 100);

        setInterval(function(){
            if(!isClicking){
                $('.currentTime').html(round(player.getCurrentTime()));
            }
        }, 1000)
    }
}

$(".realBar").change(function(){
    player.seekTo($(".realBar").val());
}).mousedown(function(){
    isClicking = true;
}).mouseup(function(){
    isClicking = false;
}).mousemove(function(){
    if(isClicking===false){return;}
    let currentPorc = ($(".realBar").val() * 100) / player.getDuration();
    $('.progress').css('width', `${currentPorc}%`);
    $(".currentTime").html(round($(".realBar").val()));
}).mouseenter(function() {
    $('.progress').css('background', '#2791d4');
}).mouseleave(function() {
    $('.progress').css('background', '#a0a0a0');
});

$('.realVolume').mousedown(function(){
    isClickingVolume = true;
}).mousemove(function(){
    if(isClickingVolume===false){return;}
    $('.volume-progress').css('width', `${$(this).val()}%`);
    player.setVolume($(this).val());
}).mouseenter(function() {
    $('.volume-progress').css('background', '#2791d4');
}).mouseleave(function() {
    $('.volume-progress').css('background', '#a0a0a0');
});

function round(x){
    x = Number(x);
    let m = Math.floor(x / 60), s = Math.floor(x - m * 60);
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}

function sec(x){
    let y = x.split(':'), min = Number(y[0]) * 60;
    return(min + Number(y[1]));
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

function vid(track, url){
    for(j=0;j<currentInfo.tracks.length;j++){
        let t = currentInfo.tracks;
        if(t[j].name.toLowerCase() == track.toLowerCase()){
            if(t[j - 1]===undefined){
                nowPlaying.previous = track;
            }
            else{
                nowPlaying.previous = t[j - 1].name;   
            }

            if(t[j + 1]===undefined){
                nowPlaying.next = t[0].name;
            }
            else{
                nowPlaying.next = t[j + 1].name;
            }
        }
    }

    $.ajax({
        url: url,
        context: document.body
        }).done(function(res) {
        /*console.log(res.items[0].id.videoId);
        console.log(displayTrack);*/
        if(track == 'Angels Cry' || track == 'Building the Church'){
            player.loadVideoById(res.items[1].id.videoId);
        }
        else{
            player.loadVideoById(res.items[0].id.videoId);  
        }
        //player.setVolume(100);
        console.log(currentInfo.albumId);
        $(".playback-album-cover").attr("src", currentInfo.cover);
        $(".playback-info span:nth-of-type(2)").html(track);
        $(".playback-info span:nth-of-type(3)").html(currentInfo.author);
    });
}

function getTrack(track){
    $('.wrapper').css('padding-bottom', '75px');
    clicked = true;

    if(track.innerHTML.length > 70){
        displayTrack = track.innerHTML.split(':')[0];
    }
    else{
        displayTrack = track.innerHTML;
    }

    let song = `${currentInfo.author} ${displayTrack} song`, url = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=2&q=${song}&type=video&key=${key}`;

    vid(displayTrack, url);
}

function jumpSong(jump){
    let trackName = '';
    if(jump=='next'){
        trackName = nowPlaying.next;
    }
    else if(jump=='previous'){
        trackName = nowPlaying.previous;
    }

    let song = `${currentInfo.author} ${trackName} song`, url = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=2&q=${song}&type=video&key=${key}`;

    vid(trackName, url);
    console.log(trackName);
}

$(".pp").click(function(){
    if(playbackState==1){
        player.pauseVideo();
    }
    else if(playbackState==2){
        player.playVideo();
    }
    else{
        player.playVideo();
    }
});

$('.minimize').click(function(){
    $('.playback-manager').slideToggle();
    if(minimized===false){
        minimized = true;
        $('.wrapper').animate({paddingBottom: 0});
        $(this).css('transform', 'scaleY(-1)');
        $(this).animate({bottom : '15px'});
    }
    else{
        minimized = false;
        $('.wrapper').css('padding-bottom', '75px');
        $(this).css('transform', 'scaleY(1)');
        $(this).animate({bottom : '90px'});
    }
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

    currentInfo = {
        author: a[o].author,
        albumId: a[o].id,
        tracks: a[o].tracks,
        cover: art
    };

    var trackContainer = ["",""];

    for (t = 0; t < a[o].tracks.length; t++) {
        trackContainer[a[o].tracks[t].cd - 1] += `<div class="song"><span class="number">${a[o].tracks[t].number}</span><span class="name" onclick="getTrack(this); if(started===false){started = true; $('.minimize').css('display', 'block'); $('.minimize').animate({bottom : '90px'});$('.playback-manager').slideToggle();}">${a[o].tracks[t].name}</span><span class="length">${a[o].tracks[t].length}</span></div><Br>`;
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
            $(".artist-country").html(`<img src="https://salies.github.io/csgo-profiler/assets/flags/${(ats[g].code).toLowerCase()}.svg" class="artist-flag"> ${ats[g].country}`);
            break;
        }
    }

    $(".overlay").css("display", "block");

    if($(".album-window").outerHeight() > $(".overlay").outerHeight()){
        $(".album-window").addClass("extra");
    }
});

$('.overlay').mouseup(function (e) {
    var container = $(".album-window");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $(".overlay").hide();
        $(".album-window").removeClass("extra");
        artistDisplay(false);
    }
});

    /*
    UNUSED FILTER ALGORITHM
    if(l >= 1260){
        url = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&videoDuration=long&q=${song}&type=video&key=${key}`;
    }
    else if(l < 300){
        url = `https://www.googleapis.com/youtube/v3/search?part=id&videoDuration=short&maxResults=1&q=${song}&type=video&key=${key}`
    }
    else if(l < 900){
        url = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&videoDuration=medium&q=${song}&type=video&key=${key}`;
    }
    else{
        url = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q=${song}&type=video&key=${key}`
    }*/