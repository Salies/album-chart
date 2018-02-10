const fs = require('fs');
const request = require('request');

var albums = JSON.parse(fs.readFileSync('list.json', 'utf8')).albums, master = [], artists = [], ua = 'AlbumChart/1.0.0 ( https://github.com/Salies/album-chart )';

function repeat(callback) {
    var i = 0,
    interval = setInterval(function(){
       callback(i);
       if (++i === 100) {
           clearInterval(interval);
       }
    }, 1000);
}

var restartInterval = function() {
    intervalFunction();
    interval = setInterval(intervalFunction, 1000 );
};

repeat(function(i){
    let coverArt,
    mbid = albums[i].mbid, 
    id = albums[i].id, 
    cover = albums[i].cover, 
    url = `http://musicbrainz.org/ws/2/release/${mbid}?inc=release-groups+artist-credits+recordings+media&fmt=json`;

    if(cover===true){
        coverArt = `http://coverartarchive.org/release/${mbid}/front`;
    }
    else{
        coverArt = cover;
    }


    request({url:url, headers: {'User-Agent': ua}}, function(err, req, res){
        let data = JSON.parse(res), 
        title = data["release-group"].title, 
        author = data["artist-credit"][0].name,
        authorID = data["artist-credit"][0].artist.id, 
        release = data["release-group"]["first-release-date"], 
        tracks = [];

        for(l=0;l<(data.media).length;l++){
            if(l == 1 && id == 81){
                break;
            }

            recordings = data.media[l].tracks;

            for(j=0;j<recordings.length;j++){
                tracks.push(
                    {
                        cd:l + 1,
                        number:recordings[j].position,
                        name:recordings[j].title,
                        length: new Date(recordings[j].recording.length).toISOString().substr(14, 5) //mb length is in ms, coverting
                    }
                );
            }
        }

       let info = {
            id:id,
            title: title,
            author: author,
            release:release,
            cover: coverArt,
            tracks: tracks
        }

        master.push(info);

        fs.writeFile('albums.json', albumsJSON, 'utf8', function(){
            console.log(`[${id}] "${author} - ${title}" inserido com sucesso.`);
        });

        function verify(arr, previous){
            for(k=0;k<arr.length;k++){
                if(arr[k].mbid == previous){
                    return true;
                }
            }

            return false;
        }

        if(i!==0){
            if(verify(artists, authorID)!==true){
                artists.push({name:author /*just for identification and debugging*/, mbid:authorID})
                var artistsJSON = JSON.stringify(artists);
                fs.writeFile('artists.json', artistsJSON, 'utf8', function(){
                    console.log(`${author} inserido com sucesso.`);
                });
            }
        }
        else{
            fs.writeFile('artists.json', artistsJSON, 'utf8', function(){
                console.log(`${author} inserido com sucesso.`);
            });    
        }

    }); 
});
