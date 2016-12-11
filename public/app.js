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
            IO.socket.on('updateLog',IO.updateLog);
            IO.socket.on('proveSuggestion',IO.proveSuggestion);
            IO.socket.on('displayProof',IO.displayProof);
            IO.socket.on('playerWon',IO.displayPlayerWon);
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
            App.Player.updateSuspectList(data);
        },

        displayGame: function(data){
            App.Player.displayGame(data);
        },

        proveSuggestion: function(data){
            App.Player.proveSuggestion(data);
        },

        displayProof: function(data){
            App.Player.displayProof(data);
        },

        updateLog: function(data){
            App.addToLog(data.log);
        },

        displayPlayerWon: function(data){
            App.Player.playerWon(data);
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
    "BallToKitchen",
    "Plum",
    "Peacock",
    "Scarlett",
    "Green",
    "White",
    "Mustard",
    ];

    var suspectMap = {
        "Mrs. White": "white",
        "Mrs. Peacock": "peacock",
        "Professor Plum": "plum",
        "Miss Scarlett": "scarlett",
        "Colonel Mustard": "mustard",
        "Mr. Green": "green"
    };

	var numPlayers = 0;

var App = {

        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',

        currentPlayerSocket: '',

        currentPlayerLocation: [],

        myName: '',

        

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
            App.$templateMakeSuggestion = $("#make-suggestion-template").html();
            App.$templateProveSuggestion = $("#prove-suggestion-template").html();

        
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            App.$doc.on('click', '#btnSelectSuspect',App.Player.onSuspectSelectClick);
            App.$doc.on('click', '#btnPlayClue',App.Player.onStartGameClick);
            App.$doc.on('click', '#btnMoveOptionSelect', App.Player.onOptionSelectClick);
            App.$doc.on('click', '#btnMoveOptionDone', App.Player.onOptionDoneClick);
            App.$doc.on('click', '#btnMakeSuggestion', App.Player.onMakeSuggestionClick);
            App.$doc.on('click', '#btnSuggestionSelect', App.Player.onProveSuggestionClick);
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

        addToLog : function(data){
           var paragraph = document.createElement('p');
            paragraph.textContent = data;   
            document.getElementById("gameLogContent").append(paragraph);
            $('#scrollBox').scrollTop($('#scrollBox')[0].scrollHeight);

        },



        /* *******************************
           *         Player CODE           *
           ******************************* */
        Player : {


            //Update the list of players about to join
            updateWaitingList : function(data){
                //$('#playersWaiting  li').remove();
                $('#gameLogContent p').remove();
                var players = data.game.players;
                console.log('players: '+ players);
                if(players.length >= 3){
                    $('#btnPlayClue').show();
                }
                for(var i = 0; i < players.length; i++){
                    // Update host screen
                    var logHTML = 'Player ' + players[i].name + ' is in the game as '+players[i].suspect.name;
                    App.addToLog(logHTML);
                    //$('#playersWaiting')
                    //    .append('<li>Player ' + players[i].name + ' is in the game as '+players[i].suspect.name+'. (socket ID: '+players[i].clientID+')</li>');
                    console.log(players[i].name + " Joined");
       
                }
 
             },

             updateSuspectList : function(data){
                var suspects = data.suspectList;
                // If the player is in the state of 'availableSuspects' then update the suspect list
                //  in the dropdown
                if(document.getElementById('availableSuspects')) {
                    console.log("The availableSuspects div is not null");
                    $('#availableSuspects option').remove();
                    for(var i = 0; i < suspects.length; i++){
                        // Update host screen
                        var sus = suspects[i];
                        var op = document.createElement("option");
                        op.textContent = sus.name;
                        op.value = i;
                        availableSuspects.appendChild(op); 
                        console.log(sus.name + " is available");
                    }
                }
             },
 
            selectSuspect: function(data) {
                App.$gameArea.html(App.$templateSelectSuspect);
                //$('#gameLogContainer').hide();
                $('#gameLogContent p').remove();
                var suspects = data.suspectList;
                for(var i = 0; i < suspects.length; i++){
                        // Update host screen
						var sus = suspects[i];
						var op = document.createElement("option");
						op.textContent = sus.name;
						op.value = i;
						availableSuspects.appendChild(op); 
                    console.log(sus.name + " is available");
                }


            },
            onSuspectSelectClick : function () {
                var data = {
                    selectedSuspect : +$('#availableSuspects').val(),
                    playerName : $('#inputPlayerName').val() || 'anon',
                };
                App.myName = data.playerName;
                $('#gameLogContainer').show();
                console.log('Player selected suspect number ' + data.selectedSuspect);
                App.$gameArea.html(App.$templateWaitGame);
                numPlayers +=1;
                IO.socket.emit('playerSelectSuspect',data);
            }, 

            onStartGameClick : function (){
            	console.log('Starting game');
                App.$gameArea.html(App.$templatePlayGame);
                IO.socket.emit('startGame');
            },

            displayGame : function(data){
                if(data.log != undefined){
                    App.addToLog(data.log);   
                }
                $('notepad').show();
                App.Player.updateGameBoard(data.game);
                App.currentPlayerSocket = data.currentPlayer.clientID;
                App.currentPlayerLocation=data.currentLocation;
                var players = data.game.players;
                console.log("Players: "+ players);

                console.log("Current location: "+App.currentPlayerLocation.name);
                if(App.mySocketId === data.currentPlayer.clientID){
                    $('#playerStatus').text(data.currentPlayer.name + " (" + data.currentPlayer.suspect.name + "), it is your turn");
                    //@TODO this needs to be done or else other players can input move numbers.
                    //App.$currentPlayer.html(App.$templateCurrentPlayer);
                    App.Player.updateMoveOptions(data.moveOptions);
                    // Display Current Player Section (if not already displayed)
                    if(!$('#currentPlayer').is(":visible")){
                        $('#currentPlayer').show();
                    }
                }else{
                    //Loop over players to find player that matches this socket ID
                    for(var j = 0; j < players.length; j++){
                        if(players[j].clientID === App.mySocketId){
                            $('#playerStatus').text("Waiting for " + data.currentPlayer.name);
                            $('#playerStatus').text(players[j].name +
                                " (" + players[j].suspect.name + "), waiting for " +
                                data.currentPlayer.name + " (" +
                                data.currentPlayer.suspect.name + ")");
                            // Hide Current player section (if not already hidden)
                            if($('#currentPlayer').is(":visible")){
                                $('#currentPlayer').hide();
                            }
                        }
                    }                     
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
                        for (var k = 0; k < players[j].cards.length; k++) {
                            var Card = document.createElement("img");
                            Card.setAttribute('src', 'images/' + players[j].cards[k].replace(' ', '') + 'card.png');
                            Card.setAttribute('class', 'card');
                            document.getElementById("gameCards").appendChild(Card);
                            /*var paragraph = document.createElement('p');
                            paragraph.textContent = players[j].cards[k];
                            console.log("Card ID: " + players[j].cards[k]);
                            paragraph.textContent = '<img class="piece" src="http://localhost:3000/' + players[j].cards[k] + 'card.png">';
                            document.getElementById("gameCards").append(paragraph);*/
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
                        //console.log("Room ID: " + rooms[gameRooms[i]].name);
                        //console.log('#' + rooms[gameRooms[i]].name + ' #suspects');
                        // $('#' + rooms[gameRooms[i]].name + ' #suspects').append('<div class="player" id="' + suspectID + '"></div>');
                        $('#' + rooms[gameRooms[i]].name + ' #suspects').append('<img id="' + suspectID + 'Piece" class="piece" src="images/' + suspectID + '.png">');
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
                        App.Player.makeAccusation();
                    }else if(choice ==="Suggestion"){
                        App.Player.makeSuggestion();
                    }
                }

             },

             onOptionDoneClick: function(data){
                IO.socket.emit('nextPlayer');

             },

             makeSuggestion : function(data){
                //App.$gameArea.html(App.$templateMakeSuggestion);
                // Display suggestion html
                $('#suggestionWrapper').show();
                $('#typeOfGuess').text("Suggestion");
                var roomSelect = document.getElementById("roomSuggestion");
                roomSelect.options.length = 0;
                roomSelect.options[roomSelect.options.length] = new Option(App.currentPlayerLocation.name,App.currentPlayerLocation.name);

             },

             makeAccusation : function(data){
                $('#suggestionWrapper').show();
                $('#typeOfGuess').text("Accusation");
                var roomSelect = document.getElementById("roomSuggestion");
                roomSelect.options.length = 0;
                for(var i = 0;i < 9; i++){
                    roomSelect.options[i] = new Option(gameRooms[i],gameRooms[i]);
                }
              
             },

             onMakeSuggestionClick : function(){
                var roomSelect = document.getElementById("roomSuggestion");
                var weaponSelect = document.getElementById("weaponSuggestion");
                var suspectSelect = document.getElementById("suspectSuggestion");         
                //Parse selection to figure out type
                var roomSelection = roomSelect.options[roomSelect.selectedIndex].value;
                var weaponSelection = weaponSelect.options[weaponSelect.selectedIndex].value;
                var suspectSelection = suspectSelect.options[suspectSelect.selectedIndex].value;

                console.log("Room: "+roomSelection);
                console.log("Weapon: "+weaponSelection);
                console.log("Suspect: "+suspectSelection);
                var type = $('#typeOfGuess').text();              
                //$('#suggestionWrapper').hide();


                IO.socket.emit('makeGuess',{
                    type:type,
                    room:roomSelection,
                    weapon:weaponSelection,
                    suspect:suspectSelection});

             },

             proveSuggestion : function(data){
                console.log("Prove Suggestion");
                //App.$gameArea.html(App.$templateProveSuggestion);
                var guess = data.guess;
                var playerCards = data.currentCards;
                $('#proveSuggestionWrapper').show();

/*
                for(var k = 0; k< playerCards.length; k++){
                    var paragraph = document.createElement('p');
                    paragraph.textContent = playerCards[k];
                    document.getElementById("gameCards").append(paragraph);
                }
*/              var count = 0;
                if(playerCards.indexOf(guess.suspect) > -1 ){
                    $('#currentSuggestion').append('<input type="radio" name="suggestion" value="'+guess.suspect+'" checked>' + guess.suspect + '</br>');
                    count+=1;
                }
                if(playerCards.indexOf(guess.weapon) > -1){
                    if(count === 0){
                        $('#currentSuggestion').append('<input type="radio" name="suggestion" value="'+guess.weapon+'" checked>' + guess.weapon + '</br>');
                    } else {
                        $('#currentSuggestion').append('<input type="radio" name="suggestion" value="'+guess.weapon+'">' + guess.weapon + '</br>');
                    } 
                    count +=1;

                }
                if(playerCards.indexOf(guess.room) > -1){
                    if(count === 0){
                        $('#currentSuggestion').append('<input type="radio" name="suggestion" value="'+guess.room+'" checked>' + guess.room + '</br>');
                    } else {
                        $('#currentSuggestion').append('<input type="radio" name="suggestion" value="'+guess.room+'">' + guess.room + '</br>');
                    }
                    count+=1;
                }
                if(count === 0){
                    $('#currentSuggestion').append('<input type="radio"  name="suggestion" value="none" checked>none</br>');
                }
             },

             onProveSuggestionClick : function(){

                console.log("Selected: "+ selection);
                var selection = $('#currentSuggestion input:radio[name=suggestion]:checked').val()
                //need error checking - make sure that selection is one of their cards
                console.log("Selected: "+ selection);
                $('#proveSuggestionWrapper').hide();
                IO.socket.emit('suggestionAnswer',{
                    reply:selection
                });
             },

             displayProof : function(data){
                var proof = data.proof;
                alert("Suggestion: "+ proof);
             },

             playerWon: function(data){
                alert("GAME OVER! " + data.name + " is the winner! " + data.murderString);
                $('notepad').hide();
                $('#gameLogContainer').hide();
                IO.socket.emit('resetGame');
                IO.socket.emit('initGame');
             }



        },

    };

    IO.init();
    App.init();

}($));



