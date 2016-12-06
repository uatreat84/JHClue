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
    gameSocket.on('moveCurrentPlayer',moveCurrentPlayer);
    gameSocket.on('makeGuess',playerMakeGuess);

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
    var newPlayer = new player.Player(data.playerName,this.id,true);
    newPlayer.suspect = currentGame.suspects[data.selectedSuspect];
    currentGame.players.push(newPlayer);
    io.sockets.in(currentGame.gameID).emit('suspectSelected', {gameId: gameID, mySocketId: this.id, game: currentGame}); 

}

function playerStartGame(data){
    console.log('Game started by ID: '+this.id);
    currentGame.initGame();
    var options = currentGame.getMoveOptions();
    io.sockets.in(currentGame.gameID).emit('displayGame',{
        game: currentGame, 
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: options});


}

function moveCurrentPlayer(data){
    var destination = data.destination;
    console.log("Current Player wants to move to " + destination);
    var options = currentGame.moveCurrentPlayer(destination);
    io.sockets.in(currentGame.gameID).emit('displayGame',{
        game: currentGame,
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: options});

}

function playerMakeGuess(data){
    console.log("Player Made Guess: "+data.type);
    if(data.type ==="Accusation"){
        accusation = {
            room:data.room,
            suspect:data.suspect,
            weapon:data.weapon
        }
        console.log(accusation.weapon)
        if(currentGame.verifyAccusation(accusation)){
            console.log("Player win");
        }else{
            console.log("Player loses");
        }
    }
}


