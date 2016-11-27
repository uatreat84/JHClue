var player = require('./player.js');
var suspect = require('./suspect.js');
var board = require('./gameboard.js');

module.exports = {

    Game: function(gameID){
        this.suspects = [
            new suspect.Suspect("Mrs. White"),
            new suspect.Suspect("Mrs. Peacock"),
            new suspect.Suspect("Professor Plum"),
            new suspect.Suspect("Miss Scarlett"),
            new suspect.Suspect("Colonel Mustard"),
            new suspect.Suspect("Mr. Green")];
        this.players = [];
        this.gameID = gameID;
        this.gameBoard = new board.GameBoard();

        this.initGame = function () {
            this.gameBoard.createBoard();
            for(var i = 0; i < this.players.length; i++){
                if(this.players[i].suspect.name === "Miss Scarlett"){
                    this.currentPlayer = this.players[i];
                }
            }

       },

       this.getMoveOptions = function(){
        console.log("MoveOptions");
        var options = [];
        options.push("Accusation");
        options.push("Suggestion");
        if(this.currentPlayer === undefined ){
            console.log("No Miss Scarlett")
            this.currentPlayer = this.players[0];
        }
        console.log("Current Player: "+ this.currentPlayer);
        var suspectLocation = this.gameBoard.getSuspectLocation(this.currentPlayer.suspect);
        console.log("Current Location: " + suspectLocation);
        return options;
       }
   
    }
    

};
