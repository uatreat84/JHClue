var room = require('./room.js');
var suspect = require('./suspect.js');

module.exports = {
 GameBoard: function(){
        this.rooms = {};  
        this.suspectLocations = {};

        this.createBoard = function() {
            //Rooms
            var study = new room.Room("Study",false,[]);
            var hall = new room.Room("Hall",false,[]);
            var lounge = new room.Room("Lounge",false,[]);
            var library = new room.Room("Library",false,[]);
            var billiard = new room.Room("Billiard",false,[]);
            var dining = new room.Room("Dining",false,[]);
            var conservatory = new room.Room("Conservatory",false,[]);
            var ball = new room.Room("Ball",false,[]);
            var kitchen = new room.Room("Kitchen",false,[]);

            //Hallways
            var studyToHall = new room.Room("StudyToHall",true,[]);
            var hallToLounge = new room.Room("HallToLounge",true,[]);
            var studyToLibrary = new room.Room("StudyToLibrary",true,[]);
            var hallToBilliard = new room.Room("HallToBilliard",true,[]);
            var loungeToDining = new room.Room("LoungeToDining",true,[]);
            var libToBilliard = new room.Room("LibraryToBilliard",true,[]);
            var billiardToDining = new room.Room("BilliardToDining",true,[]);
            var libToConserv = new room.Room("LibraryToConservatory",true,[]);
            var billiardToBall = new room.Room("BilliardToBall",true,[]);
            var diningToKitchen = new room.Room("DiningToKitchen",true,[]);
            var conservToBall = new room.Room("ConservatoryToBall",true,[]);
            var ballToKitchen = new room.Room("BallToKitchen", true, []);

            //StartPoints
            var plum = new room.Room("Plum", false, [new suspect.Suspect("Professor Plum")]);
            var scarlett = new room.Room("Scarlett", false, [new suspect.Suspect("Miss Scarlett")]);
            var mustard = new room.Room("Mustard", false, [new suspect.Suspect("Colonel Mustard")]);
            var peacock = new room.Room("Peacock", false, [new suspect.Suspect("Mrs. Peacock")]);
            var white = new room.Room("White", false, [new suspect.Suspect("Mrs. White")]);
            var green = new room.Room("Green", false, [new suspect.Suspect("Mr. Green")]);


            study.adjRooms  = ["StudyToHall","StudyToLibrary","Kitchen"] 
            hall.adjRooms = ["StudyToHall","HallToLounge"];
            lounge.adjRooms = ["HallToLounge","LoungeToDining","Conservatory"];
            library.adjRooms = ["StudyToLibrary","LibraryToBilliard","LibraryToConservatory"];
            billiard.adjRooms = ["LibraryToBilliard","HallToBilliard","BilliardToDining","BilliardToBall"];
            dining.adjRooms = ["LoungeToDining","BilliardToDining","DiningToKitchen"];
            conservatory.adjRooms = ["LibraryToConservatory","ConservatoryToBall","Lounge"];
            ball.adjRooms = ["ConservatoryToBall","BilliardToBall","BallToKitchen"];
            kitchen.adjRooms = ["BallToKitchen","DiningToKitchen","Study"];

            studyToHall.adjRooms = ["Study","Hall"];
            hallToLounge.adjRooms = ["Hall","Lounge"];
            studyToLibrary.adjRooms = ["Study","Library"];
            hallToBilliard.adjRooms = ["Hall","Billiard"];
            loungeToDining.adjRooms = ["Lounge","Dining"];
            libToBilliard.adjRooms = ["Library","Billiard"];
            billiardToDining.adjRooms = ["Billiard","Dining"];
            libToConserv.adjRooms = ["Library","Conservatory"];
            billiardToBall.adjRooms = ["Billiard","Ball"];
            diningToKitchen.adjRooms = ["Dining","Kitchen"];
            conservToBall.adjRooms = ["Conservatory","Ball"];
            ballToKitchen.adjRooms = ["Ball","Kitchen"];

            plum.adjRooms = ["StudyToLibrary"]
            peacock.adjRooms = ["LibraryToConservatory"];
            scarlett.adjRooms = ["HallToLounge"];
            green.adjRooms = ["ConservatoryToBall"];
            white.adjRooms = ["BallToKitchen"];
            mustard.adjRooms = ["LoungeToDining"];

            this.rooms = {"Scarlett": scarlett,
                "Study": study, "StudyToHall":studyToHall,"Hall": hall,"HallToLounge":hallToLounge,"Lounge":lounge,
                "Plum": plum, "StudyToLibrary": studyToLibrary, "HallToBilliard": hallToBilliard, "LoungeToDining": loungeToDining, "Mustard": mustard,
                "Library":library,"LibraryToBilliard":libToBilliard,"Billiard":billiard,"BilliardToDining":billiardToDining, "Dining":dining,
                "Peacock": peacock, "LibraryToConservatory": libToConserv, "BilliardToBall": billiardToBall, "DiningToKitchen": diningToKitchen,
                "Conservatory": conservatory, "ConservatoryToBall": conservToBall, "Ball": ball, "BallToKitchen": ballToKitchen, "Kitchen": kitchen,
                "Green": green,"White": white};

            /*this.rooms.push(study);
            this.rooms.push(studyToHall);
            this.rooms.push(hall);
            this.rooms.push(hallToLounge);
            this.rooms.push(lounge);
            this.rooms.push(studyToLibrary);
            this.rooms.push(hallToBilliard);
            this.rooms.push(loungeToDining);
            this.rooms.push(library);
            this.rooms.push(libToBilliard);
            this.rooms.push(billiard);
            this.rooms.push(billiardToDining);
            this.rooms.push(dining);
            this.rooms.push(libToConserv);
            this.rooms.push(billiardToBall);
            this.rooms.push(diningToKitchen);
            this.rooms.push(conservatory);
            this.rooms.push(conservToBall);
            this.rooms.push(ball);
            this.rooms.push(ballToKitchen);
            this.rooms.push(kitchen);*/

            
            this.suspectLocations = {
                "Miss Scarlett":scarlett,
                "Professor Plum":plum,
                "Colonel Mustard":mustard,
                "Mrs. Peacock":peacock,
                "Mr. Green":green,
                "Mrs. White":white};

        },

        this.getSuspectLocation = function(suspect){
            return this.suspectLocations[suspect.name];
        }

        this.isOccupiedHallway = function(room){
            var roomToCheck = this.rooms[room];
            if(roomToCheck.isHallway && roomToCheck.suspects.length > 0){
                return true;
            }else{
                return false;
            }
        },

        this.moveSuspect = function(data){
            var suspect = data.suspect;
            var destination = data.destination;
            var currentRoom = this.suspectLocations[suspect.name];
            console.log("Suspect was in " + currentRoom.name);
            //Remove suspect from current Room
            var index = currentRoom.suspects.indexOf(suspect)
            currentRoom.suspects.splice(index,1);
            //Add suspect to new room
            var destinationRoom = this.rooms[destination]
            destinationRoom.suspects.push(suspect);

            //Update Map
            this.suspectLocations[suspect.name] = destinationRoom;

            console.log("Suspect is now in " + this.suspectLocations[suspect.name].name);
        }

     }
};
