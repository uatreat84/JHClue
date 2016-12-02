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
            if(this.currentPlayer === undefined ){
                console.log("No Miss Scarlett")
                this.currentPlayer = this.players[0];
            }

       },

       this.getMoveOptions = function(){
            var options = [];
            options.push("Make Accusation");

            if(this.currentPlayer === undefined ){
                console.log("No Miss Scarlett")
                this.currentPlayer = this.players[0];
            }

            //console.log("Current Player: "+ this.currentPlayer.name);
            var suspect = this.currentPlayer.suspect;
            //console.log("Current Suspect: "+ suspect.name);

            var suspectLocation = this.gameBoard.getSuspectLocation(this.currentPlayer.suspect);
            //console.log("Current Location: " + suspectLocation.name);
            var adjRooms = suspectLocation.adjRooms;
             //console.log("Destinations: "+suspectLocation.adjRooms);
            if(suspectLocation.isHallway){
                //console.log("Suspect in Hallway");
                //console.log("AdjRooms: "+ adjRooms)
                for(var i = 0; i< adjRooms.length; i++){
                    options.push("Move to "+adjRooms[i]);
                }

            }else{
                if(suspect.wasJustMoved){
                    options.push("Make Suggestion");
                }
                for(var i = 0; i< adjRooms.length; i++){
                    if(!this.gameBoard.isOccupiedHallway(adjRooms[i])){
                        options.push("Move to "+adjRooms[i]);
                    }
                }

            }
            //console.log("Options: " + options);
            return options;
        },
   
       this.moveCurrentPlayer = function(destination){
            if(this.currentPlayer === undefined ){
                console.log("No Current Player")
                return;
            }
            var options = [];
            var currentSuspect = this.currentPlayer.suspect;
            this.gameBoard.moveSuspect({suspect:currentSuspect,destination:destination});

            var suspectLocation = this.gameBoard.getSuspectLocation(currentSuspect);
            if(!suspectLocation.isHallway){
                options.push("Make Suggestion");
            }
            options.push("Make Accusation");
            
            return options;
        }
    }


    

};
