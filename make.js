const fs = require('fs');
const request = require('request');

var albums = JSON.parse(fs.readFileSync('list.json', 'utf8')).albums, master = [], ua = 'AlbumCollage/0.1.0 ( danielserezane@outlook.com )';

function repeat(callback) {
    let i = 0,
    interval = setInterval(function(){
       callback(i);
       if (++i === 100) {
           clearInterval(interval);
       }
    }, 1000);
}

repeat(function(i){
    let coverArt,
    mbid = albums[i].mbid, 
    id = albums[i].id, 
    cover = albums[i].cover, 
    url = `http://musicbrainz.org/ws/2/release/${mbid}?inc=release-groups+artist-credits+recordings&fmt=json`;

    if(cover===true){
        coverArt = `http://coverartarchive.org/release/${mbid}/front`;
    }
    /*else if(cover.substring(0, 4) == "http"){
        coverArt = cover;
    }*/
    else{
        coverArt = cover;
    }


    request({url:url, headers: {'User-Agent': ua}}, function(err, req, res){
        let data = JSON.parse(res), 
        title = data["release-group"].title, 
        author = data["artist-credit"][0].name,
        authorID = data["artist-credit"][0].artist.id, 
        release = data["release-group"]["first-release-date"];

        let tracks = [];

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
                        name:recordings[j].title
                    }
                );
            }
        }

        let info = {
            id:id,
            title: title,
            author: author,
            authorID: authorID,
            release:release,
            cover: coverArt,
            tracks: tracks
        }

        master.push(info);

        var albumsJSON = JSON.stringify(master);

        fs.writeFile('albums.json', albumsJSON, 'utf8', function(){
            console.log(`[${id}] "${author} - ${title}" inserido com sucesso.`);
        }); 
    }); 
});