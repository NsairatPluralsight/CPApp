var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);

const port = process.env.port || 4500;

app.use(express.static(__dirname + '/dist/ComponentPortal'));

app.get('/*', (req,res)=> res.sendFile(path.join(__dirname+ '/dist/ComponentPortal/index.html')));

server.listen(port, ()=> console.log('Running...'));
