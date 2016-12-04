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
        this.caseFile = {};
        this.gameID = gameID;
        this.gameBoard = new board.GameBoard();

        this.initGame = function () {
            this.gameBoard.createBoard();
            this.dealCards();
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

       this.dealCards = function(){
            var suspectCards = [
                    "Miss Scarlett",
                    "Professor Plum",
                    "Colonel Mustard",
                    "Mrs. Peacock",
                    "Mr. Green",
                    "Mrs. White"];

            var weaponCards = [
                    "Knife",
                    "Rope",
                    "Gun",
                    "Candle Stick",
                    "Lead Pipe",
                    "Wrench"];
            
            var roomCards = [
                    "Game",
                    "Hall",
                    "Lounge",
                    "Library",
                    "Billiard",
                    "Dining",
                    "Conservatory",
                    "Ball",
                    "Kitchen"];

                var randomSuspect = Math.floor( Math.random() * suspectCards.length ); 
                var randomWeapon = Math.floor( Math.random() * weaponCards.length);
                var randomRoom = Math.floor( Math.random() * roomCards.length);


                this.caseFile["Suspect"]  = suspectCards[randomSuspect];
                suspectCards.splice(randomSuspect,1);
                this.caseFile["Weapon"] = weaponCards[randomWeapon];
                weaponCards.splice(randomWeapon,1);
                this.caseFile["Room"] = roomCards[randomRoom];
                roomCards.splice(roomCards,1);

                var allCards = suspectCards.concat(weaponCards, roomCards);

                var playerIndex = 0;
                while(allCards.length > 0){
                    playerIndex = playerIndex % this.players.length;
                    var randomCard = Math.floor( Math.random() * allCards.length);
                    this.players[playerIndex].cards.push(allCards[randomCard]);
                    allCards.splice(randomCard,1);
                    playerIndex = playerIndex + 1;
                }




       }

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
