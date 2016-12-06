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
    gameSocket.on('suggestionAnswer',suggestionAnswer);

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
        if(currentGame.suspects.length == 0){
            //TODO make error handling better
            this.emit('needToSelectSuspect',{suspectList: currentGame.suspects});
        }
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
    io.sockets.in(currentGame.gameID).emit('displayGame',{
        game: currentGame, 
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: currentGame.getMoveOptions()});


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
    guess = {
        room:data.room,
        suspect:data.suspect,
        weapon:data.weapon
    }
    if(data.type ==="Accusation"){

        if(currentGame.verifyAccusation(guess)){
            console.log("Player win");
        }else{
            console.log("Player loses");
        }
    }else if(data.type ==="Suggestion"){
        var nextClientID = currentGame.startProveSuggestion(guess);
        console.log("Next Client ID: "+ nextClientID);
        io.sockets.to(nextClientID).emit("proveSuggestion",{
            guess:currentGame.currentSuggestion,
            currentCards:currentGame.currentSuggestionCards()});

    }
}

function suggestionAnswer(data){
    console.log("Answer:"+ data.reply);

    var selection = data.reply;
    var lastClientId = currentGame.getCurrentSuggestionClient();
    //Return to game board
    io.sockets.to(lastClientId).emit('displayGame',{
        game: currentGame, 
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: currentGame.getMoveOptions()});
    if(selection === "none"){
        if(currentGame.nextSuggestionClient()){
            var nextClientID = currentGame.getCurrentSuggestionClient();
            console.log("Next Client ID: "+ nextClientID);
            io.sockets.to(nextClientID).emit("proveSuggestion",{
                guess:currentGame.currentSuggestion,
                currentCards:currentGame.currentSuggestionCards()});
        }else{
             
             io.sockets.to(currentGame.currentPlayer.clientID).emit('displayGame',{
                game: currentGame, 
                currentPlayer: currentGame.currentPlayer, 
                currentLocation: currentGame.currentPlayerLocation(),
                moveOptions: ["Make Accusation"]});
              var proof = "No one can prove your suggestion false";
             io.sockets.to(currentGame.currentPlayer.clientID).emit("displayProof",{proof:proof});
        }
    }else{
        var proofPlayer = currentGame.getCurrentSuggestionPlayer();
        io.sockets.to(currentGame.currentPlayer.clientID).emit('displayGame',{
                game: currentGame, 
                currentPlayer: currentGame.currentPlayer, 
                currentLocation: currentGame.currentPlayerLocation(),
                moveOptions: ["Make Accusation"]});
        var proof = proofPlayer.name + " proves that "+selection + " is not in the case file";
        io.sockets.to(currentGame.currentPlayer.clientID).emit("displayProof",{proof:proof});
    }
 }


