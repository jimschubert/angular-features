'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function (req, res) {
    res.render('index.html', {
        title: 'angular-feature example',
        features: ['Feature1']
    });
});

fs.writeFileSync(path.join(__dirname, 'public', 'javascripts', 'angular-features.js'), fs.readFileSync('../../../dist/all/angular-features.js'));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
