

module.exports = {
 Player: function(name,leader){
        this.name = name;
        this.isLeader = leader;
        this.suspect = "";
        this.cards = [];
    }
};
