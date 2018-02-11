const fs = require('fs'), request = require('request'), list = JSON.parse(fs.readFileSync('artists-list.json', 'utf-8')), agent = 'AlbumChart/1.0.0 ( https://github.com/Salies/album-chart )';
var artists = [];
function repeat(callback) {
    var i = 0,
    interval = setInterval(function(){
       callback(i);
       if (++i === list.length) {
           clearInterval(interval);
       }
    }, 1000);
}
repeat(function(i){
    let url = `http://musicbrainz.org/ws/2/artist/${list[i].mbid}?fmt=json`;

    request({url:url, headers: {'User-Agent': agent}}, function(err, req, res){
        let data = JSON.parse(res), info;
        if(data.area===null || data.area["iso-3166-1-codes"]===undefined){
            info = {
                name:data.name,
                country:"",
                code:"",
                image:"",
                info:""
            };     
        }
        else{
            info = {
                name:data.name,
                country:data.area.name,
                code:data.area["iso-3166-1-codes"][0],
                image:"",
                info:""
            }; 
        }

        artists.push(info);

        artistsJSON = JSON.stringify(artists);

        fs.writeFile('artists.json', artistsJSON, 'utf8', function(){
            console.log(`${data.name} inserido com sucesso.`);
        });
    });
});