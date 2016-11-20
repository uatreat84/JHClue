

module.exports = {
 Player: function(name,clientID,leader){
        this.name = name;
        this.isLeader = leader;
        this.suspect = "";
        this.cards = [];
        this.clientID = clientID;
    }
};
