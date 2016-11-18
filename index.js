var express = require('express');
app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var game = require('./game');

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});*/

app.use(express.static('public'));

io.on('connection',function(socket){
    console.log('a user is connected');
    
    game.initGame(io,socket);

    socket.on('disconnect',function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
