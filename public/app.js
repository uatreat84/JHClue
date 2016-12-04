;
jQuery(function($){    
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {

        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },
        /**
         * While connected, Socket.IO will listen to the following events emitted
         * by the Socket.IO server, then run the appropriate function.
         */
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('needToSelectSuspect', IO.selectSuspect);
            IO.socket.on('suspectSelected',IO.suspectSelected);
            IO.socket.on('displayGame',IO.displayGame);
        },

        /**
         * The client is successfully connected!
         */
        onConnected : function(data) {
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = data.id;
             console.log("Socket ID: "+App.mySocketId);
        },

        selectSuspect : function(data) {
            App.Player.selectSuspect(data);
        },

        suspectSelected: function(data){
            App.Player.updateWaitingList(data);
        },

        displayGame: function(data){
            App.Player.displayGame(data);
        }
     
    };
    var gameRooms = [
    "Study",
    "Hall",
    "Lounge",
    "Library",
    "Billiard",
    "Dining",
    "Conservatory",
    "Ball",
    "Kitchen",
    "StudyToHall",
    "HallToLounge",
    "StudyToLibrary",
    "HallToBilliard",
    "LoungeToDining",
    "LibraryToBilliard",
    "BilliardToDining",
    "LibraryToConservatory",
    "BilliardToBall",
    "DiningToKitchen",
    "ConservatoryToBall",
    "BallToKitchen"
    ];

    var suspectMap = {
        "Mrs. White": "white",
        "Mrs. Peacock": "peacock",
        "Professor Plum": "plum",
        "Miss Scarlett": "scarlett",
        "Colonel Mustard": "mustard",
        "Mr. Green": "green"
    };

var App = {

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        currentPlayerSocket: '',

        

        /* *************************************
         *                Setup                *
         * *********************************** */

        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();

        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$currentPlayer = $('#currentPlayer');
            App.$templateWaitGame = $('#wait-game-template').html();
            App.$templateSelectSuspect = $('#select-suspect-template').html();
            App.$templatePlayGame = $('#play-game-template').html();
            App.$templateCurrentPlayer = $("#current-player-template").html();
        
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            App.$doc.on('click', '#btnSelectSuspect',App.Player.onSuspectSelectClick);
            App.$doc.on('click', '#btnPlayClue',App.Player.onStartGameClick);
            App.$doc.on('click', '#btnMoveOptionSelect', App.Player.onOptionSelectClick);
        },

        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            IO.socket.emit('initGame');

            //App.$gameArea.html(App.$templateSelectSuspect);
        },





        /* *******************************
           *         Player CODE           *
           ******************************* */
        Player : {


            //Update the list of players about to join
            updateWaitingList : function(data){
                $('#playersWaiting  li').remove();
                var players = data.game.players;
                console.log('players: '+ players);
                    for(var i = 0; i < players.length; i++){
                        // Update host screen
                    $('#playersWaiting')
                        .append('<li>Player ' + players[i].name + ' is in the game as '+players[i].suspect.name+'. (socket ID: '+players[i].clientID+')</li>');
                    console.log(players[i].name + " Joined");
       
                }
 
             },
 
            selectSuspect: function(data) {
                App.$gameArea.html(App.$templateSelectSuspect);

                var suspects = data.suspectList;
                for(var i = 0; i < suspects.length; i++){
                        // Update host screen
                    $('#availableSuspects')
                        .append('<li>' + suspects[i].name );
                    console.log(suspects[i].name + " is available");
       
                }


            },
            onSuspectSelectClick : function () {
                var data = {
                    selectedSuspect : +($('#suspectNumber').val()),
                    playerName : $('#inputPlayerName').val() || 'anon',
                };
                console.log('Player selected ' + data.selectedSuspect);
                App.$gameArea.html(App.$templateWaitGame);
                IO.socket.emit('playerSelectSuspect',data);

            },

            onStartGameClick : function (){
                console.log('Starting game');
                App.$gameArea.html(App.$templatePlayGame);
                IO.socket.emit('startGame');
            },

            displayGame : function(data){
                App.Player.updateGameBoard(data.game)
                App.currentPlayerSocket = data.currentPlayer.clientID;
                if(App.mySocketId === data.currentPlayer.clientID){
                    $('#playerStatus').text("You are the Current Player");
                    //@TODO this needs to be done or else other players can input move numbers.
                    //App.$currentPlayer.html(App.$templateCurrentPlayer);
                    App.Player.updateMoveOptions(data.moveOptions);
                }else{
                    $('#playerStatus').text("Waiting for "+data.currentPlayer.name);
                }
                console.log("My ID: "+App.mySocketId);
                console.log("Current Player: "+data.currentPlayer.clientID);
            },

            updateMoveOptions: function(options){
                var select = document.getElementById("moveOptions");
                select.options.length = 0;
                if(options.length ===0){
                    //GO TO THE NEXT PLAYER
                }
                //$('#moveOptions  li').remove();
                for(var i = 0;i< options.length; i++){
                    //$('#moveOptions')
                    //        .append('<li>' + options[i] );
                    select.options[select.options.length] = new Option(options[i],options[i]);
                }

            },

            updateGameBoard : function(data){            
                var rooms = data.gameBoard.rooms;
                App.$gameArea.html(App.$templatePlayGame);
                var players = data.players;
                console.log("Players: "+ players);
                //Loop over players to find player that matches this socket ID
                for(var j = 0; j < players.length; j++){
                    if(players[j].clientID === App.mySocketId){
                        //Display cards dealt to player
                        for(var k = 0; k< players[j].cards.length; k++){
                            var paragraph = document.createElement('p');
                            paragraph.textContent = players[j].cards[k];
                            document.getElementById("gameCards").append(paragraph);
                        }
                    }
                }
                //Loop over rooms and place suspects in correct rooms
                for(var i = 0; i < gameRooms.length; i++){
                    //$('#'+rooms[gameRooms[i]].name+' #suspects li').remove();
                    $('#'+rooms[gameRooms[i]].name+' #suspects div').remove();
                    for(var j = 0;j< rooms[gameRooms[i]].suspects.length; j++){
                        // change the name of the suspect to one that can be used as an html ID
                        var suspectID = suspectMap[rooms[gameRooms[i]].suspects[j].name];
                        console.log("Suspect Proper Name: " + rooms[gameRooms[i]].suspects[j].name)
                        console.log("Suspect ID: " + suspectID);
                        $('#'+rooms[gameRooms[i]].name+' #suspects').append('<div class="player" id="' + suspectID + '"></div>');
                    }
                    
                };
             },

             onOptionSelectClick : function(data){

                var select = document.getElementById("moveOptions");         
                //Parse selection to figure out type
                var selection = select.options[select.selectedIndex].value;
                var splitString = selection.split(" ");
                if(splitString[0] === 'Move'){
                    var destination = splitString[2];
                    console.log("Player wants to move to "+ destination);
                    IO.socket.emit('moveCurrentPlayer',{destination:destination});
                }else{
                    console.log("Player wants to make a " + splitString[1]);
                    var choice = splitString[1];
                    if(choice === "Accusation"){
                        //Make Accusation
                    }else if(choice ==="Suggestion"){
                        //Make Suggestion
                    }
                }

             }



        },

    };

    IO.init();
    App.init();

}($));



