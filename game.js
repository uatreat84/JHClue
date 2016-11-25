var player = require('./player.js');
var suspect = require('./suspect.js');
var board = require('./gameboard.js');

module.exports = {

    Game: function(gameID){
        this.suspects = [
            new suspect.Suspect("Mrs.White"),
            new suspect.Suspect("Mrs.Peacock"),
            new suspect.Suspect("Professor Plum"),
            new suspect.Suspect("Miss Scarlet"),
            new suspect.Suspect("Colonel Mustard"),
            new suspect.Suspect("Mr.Green")];
        this.players = [];
        this.gameID = gameID;
        this.currentPlayer = [];
        this.gameBoard = new board.GameBoard();

        this.initGame = function () {
            this.gameBoard.createBoard();
            for(var i = 0; i < this.players.length; i++){
                console.log(this.players[i].suspect.name);
                if(this.players[i].suspect.name === "Miss Scarlet"){
                    this.currentPlayer = this.players[i];
                }
            }

       }
   
    }
    

};
