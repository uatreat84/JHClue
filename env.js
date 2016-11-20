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
    currentGame.suspects.splice(data.selectedSuspect,1);
    currentGame.players.push(newPlayer);
    io.sockets.in(currentGame.gameID).emit('suspectSelected', {gameId: gameID, mySocketId: this.id, game: currentGame});
}


/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );


    data.mySocketId = sock.id;
    //@TODO Need error handling
    if(data.gameId === gameID){
        // Join the room
        if(players.length < 6){
            sock.join(data.gameId);
            // Emit an event notifying the clients that the player has joined the room.
          //  io.sockets.in(data.gameId).emit('needToSelectSuspectplayerJoinedRoom', {players: players});
          this.emit('needToSelectSuspect',{suspectList:currentGame.suspects});
        }
    }


}
