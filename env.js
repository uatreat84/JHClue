var io;
var gameSocket;
var player = require('./player.js');
var suspect = require('./suspect.js');
var game = require('./game');
var currentGame = null;

exports.initGame = function(sio,socket){
    io = sio;
    gameSocket = socket;

    console.log("client id:" + gameSocket.id);
    gameSocket.emit('connected', {id: gameSocket.id}); 
    gameSocket.on('initGame',createNewGame);
    gameSocket.on('playerSelectSuspect',playerSelectSuspect);
    gameSocket.on('startGame',playerStartGame);

}

/**
 * Create a new game if no game. Add client to socket "ROOM"
 */

function createNewGame(data){

    if(currentGame === null){
        gameID = (Math.random() * 100000) | 0;   
        currentGame = new game.Game(gameID);
        console.log('new game created '+gameID.toString());
    }
    // Join the Room and wait for the players
    this.join(gameID.toString());

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('needToSelectSuspect',{suspectList:currentGame.suspects});
}

function playerSelectSuspect(data){

    // A reference to the player's Socket.IO socket object
    var sock = this;

    console.log('Player selected ' + data.selectedSuspect);
    if(data.selectedSuspect >= 1){
        var newPlayer = new player.Player(data.playerName,this.id,true);
        newPlayer.suspect = currentGame.suspects[data.selectedSuspect- 1];
        currentGame.suspects.splice(data.selectedSuspect - 1,1);
        currentGame.players.push(newPlayer);
        io.sockets.in(currentGame.gameID).emit('suspectSelected', {gameId: gameID, mySocketId: this.id, game: currentGame});
    }else{
        //TODO make error handling better
        this.emit('needToSelectSuspect',{suspectList: currentGame.suspects});
    }

}

function playerStartGame(data){
    console.log('Game started by ID: '+this.id);
    currentGame.initGame();
    var options = currentGame.getMoveOptions();
    io.sockets.in(currentGame.gameID).emit('displayGame',{game: currentGame, currentPlayer: currentGame.currentPlayer});


}


