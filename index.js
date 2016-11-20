var express = require('express');
app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var env = require('./env');

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});*/

app.use(express.static('public'));

io.on('connection',function(socket){
    console.log('a user is connected');
    
    env.initGame(io,socket);

    socket.on('disconnect',function(){
        //@TODO
        console.log(socket.id + ' disconnected');
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
