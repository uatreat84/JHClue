


module.exports = {
 Room: function(name,isHallway,suspects){
        this.name = name;
        this.isHallway = isHallway;
        this.suspects = suspects;
        this.adjRooms = [];
    }
};
