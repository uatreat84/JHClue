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
    gameSocket.on('resetGame',resetGame);
    gameSocket.on('playerSelectSuspect',playerSelectSuspect);
    gameSocket.on('startGame',playerStartGame);
    gameSocket.on('moveCurrentPlayer',moveCurrentPlayer);
    gameSocket.on('makeGuess',playerMakeGuess);
    gameSocket.on('suggestionAnswer',suggestionAnswer);
    gameSocket.on('nextPlayer',nextPlayer);

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

function resetGame(data){

    currentGame = null;
}

function playerSelectSuspect(data){

    // A reference to the player's Socket.IO socket object
    var sock = this;

    console.log('Player selected ' + data.selectedSuspect);

    var newPlayer = new player.Player(data.playerName,this.id,true);
    newPlayer.suspect = currentGame.suspects[data.selectedSuspect];
    if(currentGame.suspects.length == 0){
        //TODO make error handling better
        this.emit('needToSelectSuspect',{suspectList: currentGame.suspects});
    }
    currentGame.suspects.splice(data.selectedSuspect, 1);
    currentGame.players.push(newPlayer);
    io.sockets./*in(currentGame.gameID).*/emit('suspectSelected', {gameId: gameID, mySocketId: this.id, game: currentGame, suspectList: currentGame.suspects});

} 

function playerStartGame(data){
    console.log('Game started by ID: '+this.id);
    if(currentGame.init === false){
        currentGame.initGame();
    }
    io.sockets.in(currentGame.gameID).emit('displayGame',{
        log: "New Game started!",
        game: currentGame, 
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: currentGame.getMoveOptions()});


}

function nextPlayer(){
    currentGame.goToNextPlayer();
    io.sockets.in(currentGame.gameID).emit('displayGame',{
        log: "It is now " + currentGame.currentPlayer.name + "'s (" + currentGame.currentPlayer.suspect.name + "'s) turn",
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
        log: currentGame.currentPlayer.name + " moved to " + destination,
        game: currentGame,
        currentPlayer: currentGame.currentPlayer, 
        currentLocation: currentGame.currentPlayerLocation(),
        moveOptions: options});
}

function playerMakeGuess(data){
    console.log("Player Made Guess: "+data.type);
    var guessString =''
    if(data.type ==="Accusation"){
        guessString=" made an accusation";
    }else{
        guessString=" made a suggestion";
    }

    io.sockets.in(currentGame.gameID).emit('updateLog',{log:currentGame.currentPlayer.name + guessString +": It was " +data.suspect+ " in the " +data.room+" with the "+data.weapon,});
    guess = {
        room:data.room,
        suspect:data.suspect,
        weapon:data.weapon
    }

    if(data.type ==="Accusation"){

        if(currentGame.verifyAccusation(guess)){
            console.log("Player win");
             io.sockets.in(currentGame.gameID).emit('playerWon',{});
        }else{
            var name =currentGame.eliminateCurrentPlayer()
            io.sockets.in(currentGame.gameID).emit('updateLog',{log: name = "made a wrong accusation. They have been eliminated."});
            if(currentGame.isGameOver()){
                io.sockets.in(currentGame.gameID).emit('playerWon',{});
            }else{
                io.sockets.in(currentGame.gameID).emit('displayGame',{
                    log: "It is now " + currentGame.currentPlayer.name + "'s turn",
                    game: currentGame, 
                    currentPlayer: currentGame.currentPlayer, 
                    currentLocation: currentGame.currentPlayerLocation(),
                    moveOptions: currentGame.getMoveOptions()});
            }
        }
    }else if(data.type ==="Suggestion"){
        var nextClientID = currentGame.startProveSuggestion(guess);
        console.log("Next Client ID: "+ nextClientID);
        io.sockets.in(currentGame.gameID).emit('displayGame',{
            log: currentGame.getCurrentSuggestionPlayer().name +"'s turn to prove suggestion.",
            game: currentGame,
            currentPlayer: currentGame.currentPlayer, 
            currentLocation: currentGame.currentPlayerLocation(),
            moveOptions: []});
        
        io.sockets.to(nextClientID).emit("proveSuggestion",{
            guess:currentGame.currentSuggestion,
            currentCards:currentGame.currentSuggestionCards()});
    }
}

function suggestionAnswer(data){
    var selection = data.reply;
    var lastClientId = currentGame.getCurrentSuggestionClient();
    //Return person who just tried to prove suggestion to game board
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
                log: "No one could prove the last suggestion false",
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
                log:  proofPlayer.name + " proves that the last suggestion was false",
                game: currentGame, 
                currentPlayer: currentGame.currentPlayer, 
                currentLocation: currentGame.currentPlayerLocation(),
                moveOptions: ["Make Accusation"]});
        var proof = proofPlayer.name + " proves that "+selection + " is not in the case file";
        io.sockets.to(currentGame.currentPlayer.clientID).emit("displayProof",{proof:proof});
    }
 }
