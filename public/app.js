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
    "Dinning",
    "Conservatory",
    "Ball",
    "Kitchen",
    "StudyToHall",
    "HallToLounge",
    "StudyToLibrary",
    "HallToBilliard",
    "LoungeToDinning",
    "LibraryToBilliard",
    "BilliardToDinning",
    "LibraryToConservatory",
    "BilliardToBall",
    "DinningToKitchen",
    "ConservatoryToBall",
    "BallToKitchen"
    ];

var App = {

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        

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
            App.$templateWaitGame = $('#wait-game-template').html();
            App.$templateSelectSuspect = $('#select-suspect-template').html();
            App.$templatePlayGame = $('#play-game-template').html();
        
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            App.$doc.on('click', '#btnSelectSuspect',App.Player.onSuspectSelectClick);
            App.$doc.on('click', '#btnPlayClue',App.Player.onStartGameClick);
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


           /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',


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
                if(App.mySocketId === data.currentPlayer.clientID){
                    $('#playerStatus').text("Current Player");
                }else{
                    $('#playerStatus').text("Waiting for "+data.currentPlayer.name);
                }
                console.log("My ID: "+App.mySocketId);
                console.log("Current Player: "+data.currentPlayer.clientID);
            },


            updateGameBoard : function(data){            
                var rooms = data.gameBoard.rooms;
                App.$gameArea.html(App.$templatePlayGame);
                //Loop over rooms and place suspects in correct rooms
                for(var i = 0; i < gameRooms.length; i++){
                    console.log(rooms[gameRooms[i]]);
                    $('#'+rooms[gameRooms[i]].name+' #suspects li').remove();
                    for(var j = 0;j< rooms[gameRooms[i]].suspects.length; j++){
                        $('#'+rooms[gameRooms[i]].name+' #suspects').append('<li>'+rooms[gameRooms[i]].suspects[j].name+'</li>');
                    }
                    
                };
             }



        },

    };

    IO.init();
    App.init();

}($));



