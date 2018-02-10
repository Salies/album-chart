const fs = require('fs'), express = require('express'), ejs = require('ejs'), app = express(), list = JSON.parse(fs.readFileSync('list-hue.json', 'utf8')), albums = JSON.parse(fs.readFileSync('albums.json', 'utf8')), colors = JSON.parse(fs.readFileSync('colors.json', 'utf8')), port = 8000;

app.set('view engine', 'ejs');
app.use(express.static('assets'));

app.get('/', function (req, res) {
    res.render('albums.ejs', {list:list, albums:albums, colors:colors});
});

app.listen(port, function(){
    console.log(`Listening on port ${port}.`)
})