var youtubeAPIkey = 'YOUR_YOUTUBE_API_KEY',
    init = false,
    clicked = false,
    minimized = false,
    isClicking = {
        d: false,
        v: false
    },
    lastView = {
        name: '',
        author: '',
        cover: '',
        tracks: []
    },
    nowPlaying = {
        name: '',
        author: '',
        tracks: null,
        track: ''
    };

function time(s) {
    let ps = parseInt(s / 60, 10);
    s = Math.round(s);
    return ps + ':' + (s - ps * 60 < 10 ? `0${s - ps * 60}` : s - ps * 60);
}

function error(msg) {
    $('.log span').html(msg);
    $('.log').slideToggle("slow").css('display', 'flex');
    setTimeout(function () {
        $('.log').slideToggle();
    }, 3000);
}

$('.square').click(function () {
    if ($(this).hasClass('inactive') === true) {
        return;
    }
    $(".overlay").css("display", "flex");
    $(".circle").css("display", "block");

    $(".cover-art").attr("src", $(this).css('background-image').replace('url(', '').replace(')', '').replace(/\"/gi, ""));
    $(".thead span:nth-of-type(1)").html(`<a href="https://www.google.com.br/search?q=${$(this).data('author')} - ${$(this).data('name')}" target="_blank">${$(this).data('name')}</a>`);
    $(".thead span:nth-of-type(2)").html(`<a href="https://www.google.com.br/search?q=${$(this).data('author')} (artist)" target="_blank">${$(this).data('author')}</a>`);

    lastView.name = $(this).data('name'), lastView.author = $(this).data('author'), lastView.cover = $(this).css('background-image').replace('url(', '').replace(')', '').replace(/\"/gi, "");

    $.ajax({
        url: `/album?artist=${$(this).data('author')}&album=${$(this).data('name')}`,
        context: document.body
    }).done(function (res) {
        if (Array.isArray(res.tracks) === true) {
            let tracks = '';
            lastView.tracks = res.tracks;
            for (i = 0; i < res.tracks.length; i++) {
                tracks += `<span class="song"><span>${i + 1}</span><span>${res.tracks[i].name}</span><span>${res.tracks[i].duration}</span></span><br>`;
            }
            $('.tracklist').html(tracks);
            console.log(lastView);

            if (res.light < 0.5) {
                $(".showcase").css({
                    'color': '#fff',
                    'font-weight': '300'
                });
            } else {
                $(".showcase").css({
                    'color': '#000',
                    'font-weight': '400'
                });
            }

            $(".showcase").css("background", `hsl(${res.color})`);

            $(".circle").css("display", "none");
            $(".showcase").css("display", "inline-block");
        } else {
            $(".showcase").css("background", `hsl(${res.color})`);
            $('.tracklist').html(res);
            $(".circle").css("display", "none");
            $(".showcase").css("display", "inline-block");
        }
    });
});

$('.overlay').mouseup(function (e) {
    if (!$(".showcase").is(e.target) && $(".showcase").has(e.target).length === 0) {
        $(".overlay").hide();
        $(".showcase").css({
            'display': 'none',
            'background': '#1a1a1a'
        });
        $('.tracklist').html('');
    }
});

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
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
    playbackState = e.data;

    if (player.getDuration() != 0 && clicked === true) {
        clicked = false;
        $(".totalTime").html(time(player.getDuration() - 1));
        $(".realVolume").val(player.getVolume());
        $('.volume-progress').animate({
            width: `${player.getVolume()}%`
        });
        let getPorc = (player.getCurrentTime() * 100) / player.getDuration();
        $('.progress').animate({
            width: `${getPorc}%`
        });
        $(".realVolume").fadeIn();
        $(".realBar").attr("max", player.getDuration() - 1);
    }

    if (playbackState == 2 || playbackState === undefined) {
        $('.pp').attr('src', 'img/play.png');
    } else if (playbackState == 0) {
        $('.pp').attr('src', 'img/replay.png');
    } else {
        $('.pp').attr('src', 'img/pause.png');
        setInterval(function () {
            if (!isClicking.d) {
                $(".realBar").val(player.getCurrentTime());
                let porc = (player.getCurrentTime() * 100) / player.getDuration();
                $('.progress').css('width', `${porc}%`);
            }
        }, 100);

        setInterval(function () {
            if (!isClicking.d) {
                $('.currentTime').html(time(player.getCurrentTime()));
            }
        }, 1000)
    }
}

function stopVideo() {
    player.stopVideo();
}

function song(author, track) {
    $.ajax({
        url: `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q=${author} ${track} song&type=video&key=${youtubeAPIkey}`,
        context: document.body
    }).done(function (res) {
        if (!res.items[0]) {
            console.log('No video matches found.');
            error('Track Not Found.');
            return;
        }

        //track found...

        /*DEVELOPMENT COMMENTARY:
            It would be "cleaner" if a dealt with changing the elements in their respective calls, thus not needing the ifs. But, there are times where the song is not found on YouTube, and
            the only way to find that would is through the ajax call. So, to prevent another control variable/callback function, I've decided to just move those .html() in here, with the ifs
            for verifying if the changes are truly needed.
        */
        if (nowPlaying.tracks[nowPlaying.track].name.length >= 35 && nowPlaying.tracks[nowPlaying.track].name === nowPlaying.tracks[nowPlaying.track].name.toUpperCase()) {
            $('.playback-info span:nth-of-type(2)').html(`${nowPlaying.tracks[nowPlaying.track].name.slice(0, 30)}...`);
        } else if (nowPlaying.tracks[nowPlaying.track].name.length >= 45) {
            $('.playback-info span:nth-of-type(2)').html(`${nowPlaying.tracks[nowPlaying.track].name.slice(0, 42)}...`);
        } else {
            $('.playback-info span:nth-of-type(2)').html(nowPlaying.tracks[nowPlaying.track].name);
        }
        if ($('.playback-info span:nth-of-type(3)').html() != nowPlaying.author) $('.playback-info span:nth-of-type(3)').html(nowPlaying.author);
        if ($('.playback-album-cover').attr('src') != lastView.cover) $('.playback-album-cover').attr('src', lastView.cover);
        if (init === false) {
            init = true;
            $('footer').animate({
                paddingBottom: 85
            });
            $('.minimize').css('display', 'block');
            $('.minimize').animate({
                bottom: '90px'
            });
            $('.playback-manager').slideToggle();
            $('.showcase').addClass('expanded');
        }
        player.loadVideoById(res.items[0].id.videoId);
    });
}

function jSong(n) {
    if (n == 0) {
        if (nowPlaying.track == 0) {
            player.seekTo(0);
            return;
        }

        nowPlaying.track = nowPlaying.track - 1;
    } else {
        if (nowPlaying.track == nowPlaying.tracks.length - 1) {
            nowPlaying.track = 0;
        } else {
            nowPlaying.track = nowPlaying.track + 1;
        }
    }

    song(nowPlaying.author, nowPlaying.tracks[nowPlaying.track].name);
}

$(document).on('click', '.song span:nth-of-type(2)', function () {
    clicked = true;
    nowPlaying.name = lastView.name, nowPlaying.author = lastView.author, nowPlaying.tracks = lastView.tracks, nowPlaying.track = Number($(this).prev().html()) - 1;
    song($('.thead span:nth-of-type(2) a').html(), $(this).html());
});

$('.minimize').click(function () {
    $('.playback-manager').slideToggle();
    if (minimized === false) {
        minimized = true;
        $('.showcase').removeClass('expanded');
        $('footer').animate({
            paddingBottom: 10
        });
        $(this).css('transform', 'scaleY(-1)');
        $(this).animate({
            bottom: '15px'
        });
        if ($(document).scrollTop() >= ($(document).height() - $(window).height()) - $('footer').outerHeight() + $('.playback-manager').outerHeight()) {
            $('.minimize').addClass("mini-ab-close");
        }
    } else {
        $('.minimize').removeClass("mini-ab-close");
        $('.showcase').addClass('expanded');
        minimized = false;
        $('footer').animate({
            paddingBottom: 85
        });
        $(this).css('transform', 'scaleY(1)');
        $(this).animate({
            bottom: '90px'
        });
    }
});

$(".pp").click(function () {
    if (playbackState == 1) {
        player.pauseVideo();
    } else if (playbackState == 2) {
        player.playVideo();
    } else {
        player.playVideo();
    }
});

$(".realBar").change(function () {
    player.seekTo($(".realBar").val());
}).mousedown(function () {
    isClicking.d = true;
}).mouseup(function () {
    isClicking.d = false;
}).mousemove(function () {
    if (isClicking.d === false) {
        return;
    }
    let currentPorc = ($(".realBar").val() * 100) / player.getDuration();
    $('.progress').css('width', `${currentPorc}%`);
    $(".currentTime").html(time($(".realBar").val()));
}).mouseenter(function () {
    $('.progress').css('background', '#2791d4');
}).mouseleave(function () {
    $('.progress').css('background', '#a0a0a0');
});

$('.realVolume').mousedown(function () {
    isClicking.v = true;
}).mousemove(function () {
    if (isClicking.v === false) {
        return;
    }
    $('.volume-progress').css('width', `${$(this).val()}%`);
    player.setVolume($(this).val());
}).mouseenter(function () {
    $('.volume-progress').css('background', '#2791d4');
}).mouseleave(function () {
    $('.volume-progress').css('background', '#a0a0a0');
});

$(document).scroll(function () {
    if ($(this).scrollTop() >= ($(document).height() - $(window).height()) - $('footer').outerHeight() + $('.playback-manager').outerHeight() && $('.playback-manager').is(':visible') && init === true) {
        $('.minimize').addClass('mini-ab-open');
    } else if ($(this).scrollTop() >= ($(document).height() - $(window).height()) - $('footer').outerHeight() && !$('.playback-manager').is(':visible') && init === true) {
        $('.minimize').removeClass('mini-ab-open');
        $('.minimize').addClass('mini-ab-close');
    } else {
        $('.minimize').removeClass('mini-ab-open');
        $('.minimize').removeClass('mini-ab-close');
    }
});