var room = require('./room.js');
var suspect = require('./suspect.js');

module.exports = {
 GameBoard: function(){
        this.rooms = {}       
        this.suspectLocations = {};

        this.createBoard = function() {
            //Rooms
            var study = new room.Room("Study",false,[]);
            var hall = new room.Room("Hall",false,[]);
            var lounge = new room.Room("Lounge",false,[]);
            var library = new room.Room("Library",false,[]);
            var billiard = new room.Room("Billiard",false,[]);
            var dining = new room.Room("dining Room",false,[]);
            var conservatory = new room.Room("Conservatory",false,[]);
            var ball = new room.Room("Ballroom",false,[]);
            var kitchen = new room.Room("Kitchen",false,[]);

            //Hallways
            var studyToHall = new room.Room("StudyToHall",true,[]);
            var hallToLounge = new room.Room("HallToLounge",true,[new suspect.Suspect("Miss Scarlett")]);
            var studyToLibrary = new room.Room("StudyToLibrary",true,[new suspect.Suspect("Professor Plum")]);
            var hallToBilliard = new room.Room("HallToBilliard",true,[]);
            var loungeTodining = new room.Room("LoungeTodining",true,[new suspect.Suspect("Colonel Mistard")]);
            var libToBilliard = new room.Room("LibraryToBilliard",true,[]);
            var billiardTodining = new room.Room("BilliardTodining",true,[]);
            var libToConserv = new room.Room("LibraryToConservatory",true,[new suspect.Suspect("Mrs. Peacock")]);
            var billiardToBall = new room.Room("BilliardToBall",true,[]);
            var diningToKitchen = new room.Room("diningToKitchen",true,[]);
            var conservToBall = new room.Room("ConservatoryToBall",true,[new suspect.Suspect("Mr.Green")]);
            var ballToKitchen = new room.Room("BallToKitchen",true,[new suspect.Suspect("Mrs. White")]);

            study.adjRooms  = ["StudyToHall","StudyToLibrary","Kitchen"] 
            hall.adjRooms = ["StudyToHall","HallToLounge"];
            lounge.adjRooms = ["HallToLounge","LoungeTodining","Conservatory"];
            library.adjRooms = ["StudyToLibrary","LibraryToBilliard","LibraryToConservatory"];
            billiard.adjRooms = ["LibraryToBilliard","HallToBilliard","BilliardTodining","BilliardToBall"];
            dining.adjRooms = ["LoungeTodining","BilliardTodining","diningToKitchen"];
            conservatory.adjRooms = ["LibraryToConservatory","ConservatoryToBall","Lounge"];
            ball.adjRooms = ["ConservatoryToBall","BilliardToBall","BallToKitchen"];
            kitchen.adjRooms = ["BallToKitchen","diningToKitchen","Study"];

            studyToHall.adjRooms = ["Study","Hall"];
            hallToLounge.adjRooms = ["Hall","Lounge"];
            studyToLibrary.adjRooms = ["Study","Library"];
            hallToBilliard.adjRooms = ["Hall","Billiard"];
            loungeTodining.adjRooms = ["Lounge","dining"];
            libToBilliard.adjRooms = ["Library","Billiard"];
            billiardTodining.adjRooms = ["Billiard","dining"];
            libToConserv.adjRooms = ["Library","Conservatory"];
            billiardToBall.adjRooms = ["Billiard","Ball"];
            diningToKitchen.adjRooms = ["dining","Kitchen"];
            conservToBall.adjRooms = ["Conservatory","Ball"];
            ballToKitchen.adjRooms = ["Ball","Kitchen"];

            this.rooms = {
                "Study": study, "StudyToHall":studyToHall,"Hall": hall,"HallToLounge":hallToLounge,"Lounge":lounge,
                "StudyToLibrary":studyToLibrary,"HallToBilliard":hallToBilliard,"LoungeTodining":loungeTodining,
                "Library":library,"LibraryToBilliard":libToBilliard,"Billiard":billiard,"BilliardTodining":billiardTodining,
                "LibraryToConservatory":libToConserv,"BilliardToBall":billiardToBall,"diningToKitchen":diningToKitchen,
                "Conservatory":conservatory,"ConservatoryToBall":conservToBall,"Ball":ball,"BallToKitchen":ballToKitchen,"Kitchen":kitchen};

            this.suspectLocations = {
                "Miss Scarlett":"HallToLounge",
                "Professor Plum":"StudyToLibrary",
                "Colonal Mustard":"LoungeTodining",
                "Mrs. Peacock":"LibraryToConservatory",
                "Mr. Green":"ConservatoryToBall",
                "Mrs. White":"BallToKitchen"};

        }

     }
};
