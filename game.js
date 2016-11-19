var io;
var gameSocket;
var player = require('./player.js');
var suspect = require('./suspect.js');
var players = [];
var suspects = [];
suspects.push(new suspect.Suspect("Mrs.White"));
suspects.push(new suspect.Suspect("Mr.Green"));
suspects.push(new suspect.Suspect("Mrs.Peacock"));
suspects.push(new suspect.Suspect("Professor Plum"));
suspects.push(new suspect.Suspect("Miss Scarlet"));
suspects.push(new suspect.Suspect("Colonel Mustard"));


var gameId;

exports.initGame = function(sio,socket){
    io = sio;
    gameSocket = socket;

    console.log("client id:" + gameSocket.id);
    gameSocket.emit('connected', {id: gameSocket.id}); 

    gameSocket.on('createNewGame',createNewGame);
    gameSocket.on('playerJoinGame',playerJoinGame);

}



function createNewGame(data){

    gameID = (Math.random() * 100000) | 0;

    players = []; 
    var newPlayer = new player.Player(data.playerName,true);
    players.push(newPlayer);
 
    // Join the Room and wait for the players
    this.join(gameID.toString());
    console.log('new game created '+gameID.toString());

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('needToSelectSuspect',{suspectList:suspects});
    //this.emit('newGameCreated', {gameId: gameID, mySocketId: this.id, players: players});
}

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    //console.log('Player ' + data.playerName + 'attempting to join game: ' + data.gameId );

    // A reference to the player's Socket.IO socket object
    var sock = this;

    data.mySocketId = sock.id;
    //@TODO Need error handling
    if(data.gameId === gameID){
        // Join the room
        if(players.length < 6){
            sock.join(data.gameId);
            var newPlayer = new player.Player(data.playerName,false);
            players.push(newPlayer);
            console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );
            // Emit an event notifying the clients that the player has joined the room.
            io.sockets.in(data.gameId).emit('playerJoinedRoom', {players: players});
        }
    }


}
