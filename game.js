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
        this.init = false;
        this.activePlayers = 0;

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
            this.activePlayers = this.players.length;
            this.init = true;

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
                    "Revolver",
                    "Candle Stick",
                    "Lead Pipe",
                    "Wrench"];
            
            var roomCards = [
                    "Study",
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
                roomCards.splice(randomRoom,1); 
                console.log("CaseFile Suspect: " +this.caseFile["Suspect"]);
                console.log("CaseFile Weapon: " +this.caseFile["Weapon"]);
                console.log("CaseFile Room: " +this.caseFile["Room"]);

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

        this.goToNextPlayer = function(){
            var currentPlayerIndex = this.players.indexOf(this.currentPlayer);
            console.log("Current Player Index:" + currentPlayerIndex );
            for(var i = 1; i<this.players.length; i++){
                currentPlayerIndex =  (currentPlayerIndex + 1) % this.players.length;
                console.log("Current Player Index:" + currentPlayerIndex );
                if(this.players[currentPlayerIndex].active === true){
                    console.log("Current Player is Active")
                    this.currentPlayer = this.players[currentPlayerIndex];
                    break;
                }else{
                    console.log("Current Player is Inactive")
                }
            }
        }

        this.currentPlayerLocation = function(){
            return this.gameBoard.getSuspectLocation(this.currentPlayer.suspect);
        }
   
       this.moveCurrentPlayer = function(destination){
            if(this.currentPlayer === undefined ){
                console.log("No Current Player")
                return;
            }
            var options = [];
            var currentSuspect = this.currentPlayer.suspect;
            this.gameBoard.moveCurrentSuspect({suspect:currentSuspect,destination:destination});

            var suspectLocation = this.gameBoard.getSuspectLocation(currentSuspect);
            if(!suspectLocation.isHallway){
                options.push("Make Suggestion");
            }
            options.push("Make Accusation");
            
            return options;
        },

        this.verifyAccusation = function(accusation){
            if(this.caseFile["Room"] === accusation.room && 
                this.caseFile["Suspect"] === accusation.suspect &&
                 this.caseFile["Weapon"] === accusation.weapon)
            {
                return true;
            }else{
                return false;
            }

        },

        this.isGameOver = function(){
            console.log("Game over: "+this.players.length);
            if(this.activePlayers === 1){
                return true;
            }else{
                return false;
            }
        }

        this.eliminateCurrentPlayer = function(){
                this.currentPlayer.active =false;
                this.activePlayers = this.activePlayers - 1;
                return this.currentPlayer.name;
        }

        this.startProveSuggestion = function(guess){
            this.currentSuggestion = guess;

            //Move suspect by name
            this.gameBoard.moveSuspectByName({suspect:guess.suspect,destination:guess.room});
            //Mark player as "just moved by another player"
            for(var i = 0;i<this.players.length;i++){
                if(this.players[i].suspect.name === guess.suspect){
                    this.players[i].suspect.wasJustMoved = true;
                }
            }


            this.currentSuggestionIndex = this.players.indexOf(this.currentPlayer);
            console.log("Current Player Index:" +this.currentSuggestionIndex );
            this.currentSuggestionIndex =  (this.currentSuggestionIndex + 1) % this.players.length;

            console.log("Suggestion Index: "+ this.currentSuggestionIndex);
            return this.players[this.currentSuggestionIndex].clientID
        },

        this.currentSuggestionCards = function(){
            return this.players[this.currentSuggestionIndex].cards;
        },

        this.getCurrentSuggestionClient = function(){
           return this.players[this.currentSuggestionIndex].clientID 
       },

       this.getCurrentSuggestionPlayer = function(){
            return this.players[this.currentSuggestionIndex]; 
       },

       this.nextSuggestionClient = function(){
            var currentPlayerIndex = this.players.indexOf(this.currentPlayer);
            console.log("Current Suggestion Index:" +this.currentSuggestionIndex );
            this.currentSuggestionIndex =  (this.currentSuggestionIndex + 1) % this.players.length;
            console.log("Suggestion Index: "+ this.currentSuggestionIndex);
            if(this.currentSuggestionIndex != currentPlayerIndex){
                return true;
            }else{
                return false;
            }


       }
       this.getMurderSolutionString = function(){
            var solutionString = 'It was ' + this.caseFile["Suspect"] + ' in the ' + this.caseFile["Room"] + ' with the ' + this.caseFile["Weapon"] + '.';
            return solutionString;
       }

    }


    

};
