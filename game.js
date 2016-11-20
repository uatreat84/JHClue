var player = require('./player.js');
var suspect = require('./suspect.js');

module.exports = {

    Game: function(gameID){
        this.suspects = [];
        this.players = [];
        this.gameID = gameID;
        this.suspects.push(new suspect.Suspect("Mrs.White"));
        this.suspects.push(new suspect.Suspect("Mr.Green"));
        this.suspects.push(new suspect.Suspect("Mrs.Peacock"));
        this.suspects.push(new suspect.Suspect("Professor Plum"));
        this.suspects.push(new suspect.Suspect("Miss Scarlet"));
        this.suspects.push(new suspect.Suspect("Colonel Mustard"));
   
    }
    

};
