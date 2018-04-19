const port = process.env.PORT || 8080,
    lastfmKey = 'YOUR_LASTFM_KEY',
    getColors = require('get-image-colors'),
    request = require('request'),
    async = require('async'),
    ejs = require('ejs'),
    express = require('express'),
    app = express();

app.set('view engine', 'ejs');
app.use(express.static('assets'));

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.get('/album', function (req, res) {
        var response = res;
        request(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${lastfmKey}&artist=${req.query.artist}&album=${req.query.album}&format=json`, function (err, req, res) {
            if (err) {
                return;
            }
            let r = JSON.parse(res);
            if (r.album) {
                let resTracks = r.album.tracks.track,
                    data = {
                        tracks: [],
                        color: '',
                        light: ''
                    };
                for (i = 0; i < resTracks.length; i++) {
                    let s = resTracks[i].duration,
                        ps = parseInt(resTracks[i].duration / 60, 10);
                    data.tracks.push({
                        name: resTracks[i].name,
                        duration: (ps < 10 ? `0${ps}` : ps) + ':' + (s - ps * 60 < 10 ? `0${s - ps * 60}` : s - ps * 60)
                    })
                }

                getColors(r.album.image[0]['#text'], function (err, colors) {
                    if (err || !r.album.image[0]['#text'] || colors === undefined) {
                        console.log(err);
                        data.color = '0, 0, 10'
                        response.send(data);
                        return;
                    }

                    let colorMap = colors.map(color => color.hsl())[0],
                        cor = `${colorMap[0]}, ${colorMap[1] * 100}%, ${colorMap[2] * 100}%`;
                    data.color = cor;
                    data.light = colorMap[2];
                    response.send(data);
                });
            } else {
                response.send(r.message);
            }
        });
});

app.get('/:user', function (req, res) {
    var data = [],
        response = res,
        reqst = req; //turn both into globals
    request(`http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${req.params.user}&api_key=${lastfmKey}&limit=100&format=json`, function (err, req, res) {
        if (JSON.parse(res).error) {
            response.render('index.ejs', {
                error: `Error ${JSON.parse(res).error} - ${JSON.parse(res).message}`
            });
        } else {
            var albums = JSON.parse(res).topalbums.album;
            response.render('chart.ejs', {
                data: albums,
                user: reqst.params.user
            });
        }
    });
});

app.listen(port);
