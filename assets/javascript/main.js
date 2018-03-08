$(document).ready(function() {
var config = {
  apiKey: "AIzaSyAaxpr0JS1vkOPFXKmmt29kzFq2ySusKRM",
  authDomain: "rps-game-acc39.firebaseapp.com",
  databaseURL: "https://rps-game-acc39.firebaseio.com",
  projectId: "rps-game-acc39",
  storageBucket: "",
  messagingSenderId: "543941386248",
};
firebase.initializeApp(config);
// variables declared to use globally
var db = firebase.database();
var submitCount = 0;
var thisPlayer;
$("#oRock").hide();
$("#tRock").hide();
var player1 = null;
var player2 = null;
var player1Name = "";
var player2Name = "";
var thisPlayer = "";
var player1Choice = "";
var player2Choice = "";
var turn = 1;
// checking db for players already in game
db.ref("/players/").on("value", function(snapshot) {
	if (snapshot.child("player1").exists()) {
	player1 = snapshot.val().player1;
		player1Name = player1.name;
		$("#oneLine").text(player1Name);
    $("#winsO").html("Win: " + player1.win + ", Loss: " + player1.loss + ", Tie: " + player1.tie);
    $("#name").hide();
    $("#enter").hide(); 
	} else {
		player1 = null;
		player1Name = "";
    $("#name").show();
    $("#enter").show();
		$("#oneLine").text("Waiting for Player 1");
		 $(".roundscore").html("Rock-Paper-Scissors");
  }
  // checking for player 2 in db
	if (snapshot.child("player2").exists()) {	
		player2 = snapshot.val().player2;
		player2Name = player2.name;
		$("#twoLine").text(player2Name);
    $("#winsT").html("Win: " + player2.win + ", Loss: " + player2.loss + ", Tie:" + player2.tie);
    $("#name").hide();
    $("#enter").hide();
	} else {
		player2 = null;
		player2Name = "";
    $("#name").show();
    $("#enter").show();
		$("#playerTwoName").text("Waiting for Player 2");
		$(".roundscore").html("Rock-Paper-Scissors");
		$("#players").html("");
  }
  // if two players present, start game
	if (player1 && player2) {
    $(".show").removeClass("border border-dark");
    $(".show").addClass("borderW");
    $(".showT").addClass("border border-dark");	
		$("#players").html("Waiting on " + player1Name + " to choose...");
  }
  // if players leaves clear db and html view
	if (!player1 && !player2) {
		db.ref("/chat/").remove();
		db.ref("/turn/").remove();
		db.ref("/score/").remove();
		$("#textArea").empty();
		$("#playerPanel1").removeClass("playerPanelTurn");
		$("#playerPanel2").removeClass("playerPanelTurn");
		$(".roundscore").html("Rock-Paper-Scissors");
		$("#players").html("");
	}
});
// if player is removed, get their name and display in chat
db.ref("/players/").on("child_removed", function(snapshot) {
	var msg = snapshot.val().name + " has disconnected!";
	db.ref().child("/chat/").push(msg);
});
// gets chat messages from db
db.ref("/chat/").on("child_added", function(snapshot) {
  var chatMsg = snapshot.val();
  var chatEntry = $("<div>").html(chatMsg);
	if (chatMsg.includes("disconnected")) {
		chatEntry.addClass("text-primary");
	} else if (chatMsg.includes("joined")) {
		chatEntry.addClass("text-light");
	} else if (chatMsg.startsWith(thisPlayer)) {
		chatEntry.addClass("text-sucess");
	} else {
		chatEntry.addClass("text-primary");
	}
  $("#textArea").append(chatEntry);
  $("#textArea").scrollTop($("#textArea")[0].scrollHeight);
});
// if turn 1, notify player 1
db.ref("/turn/").on("value", function(snapshot) {
	if (snapshot.val() === 1) {
		turn = 1;
// add border to notify player 1
		if (player1 && player2) {
			$(".show").removeClass("border-dark");
      $(".show").addClass("borderW");
      $(".showT").addClass("border border-dark");
      $(".showT").removeClass("borderT");
			$("#players").html("<i>Waiting on " + player1Name + " to choose...</i>");
		}
	} if (snapshot.val() === 2) {

		turn = 2;
		if (player1 && player2) {
      $(".show").addClass("border border-dark");
		  $(".show").removeClass("borderW");
      $(".showT").removeClass("border border-dark");
      $(".showT").addClass("borderT");
			$("#players").html("<i>Waiting on " + player2Name + " to choose...</i>");
		}
	}
});
// gets score from db and displays it
db.ref("/score/").on("value", function(snapshot) {
  var cool = $(".roundscore");
  cool.addClass("text-center text-light bg-danger");
	cool.html("<br><br><h1>" + snapshot.val() + "</h1>");
});
// adds player if needed
$("#enter").on("click", function(event) {
     event.preventDefault();
    if ( ($("#name").val().trim() !== "") && !(player1 && player2) ) {
      if (player1 === null) {      
        thisPlayer = $("#name").val().trim();
        player1 = {
          name: thisPlayer,
          win: 0,
          loss: 0,
          tie: 0,
          choice: ""
        };
// adds player 1 to db or player 2 to db
        db.ref().child("/players/player1").set(player1);
        db.ref().child("/turn").set(1);
        db.ref("/players/player1").onDisconnect().remove();
        $("#name").hide();
        $("#enter").hide();
        $("#oRock").show();
        $(".intro").prepend("<br><h5>Hello " + thisPlayer + ", you are player 1!</h5>");
      } else if( (player1 !== null) && (player2 === null) ) {        
        thisPlayer = $("#name").val().trim();
        player2 = {
          name: thisPlayer,
          win: 0,
          loss: 0,
          tie: 0,
          choice: ""
        };
        db.ref().child("/players/player2").set(player2);
        db.ref("/players/player2").onDisconnect().remove();
        $("#name").hide();
        $("#enter").hide();
        $("#tRock").show();
        $(".intro").prepend("<br><h5>Hello " + thisPlayer + ", you are player 2!</h5>");       
      }
    }
  })  
  // stores chat messages on submit to db
  $("#submit").on("click", function(event) {
    event.preventDefault();
    if ( (thisPlayer !== "") && ($("#talk").val().trim() !== "") ) {
      var msg = thisPlayer + ": " + $("#talk").val().trim();
      $("#talk").val("");
      db.ref().child("/chat/").push(msg);
    }
  });
// stores player 1's pick into db
  $("#oRock").on("click", "button", function(event) {
    event.preventDefault();
      if (player1 && player2 && (thisPlayer === player1.name) && (turn === 1) ) {
      var choice = $(this).text().trim();      
      $("#oRock").hide();
      var pickO = $("<h1>");
      pickO.html(choice);
      pickO.addClass("py-3 bg-warning panelO");
      $(".show").append(pickO);
      player1Choice = choice;
      db.ref().child("/players/player1/choice").set(choice);
      turn = 2;
      db.ref().child("/turn").set(2);
      setTimeout(function(){
        $(".panelO").hide();
        $("#oRock").show();
      },3000);
    }
  });
  // stores player 2's pick into db
  $("#tRock").on("click", "button", function(event) {
    event.preventDefault();
    if (player1 && player2 && (thisPlayer === player2.name) && (turn === 2) ) {
      var choice = $(this).text().trim();
      $("#tRock").hide();
      var pickO = $("<h1>");
      pickO.html(choice);
      pickO.addClass("py-3 bg-info panelT");
      $(".showT").append(pickO);
      player2Choice = choice;
      db.ref().child("/players/player2/choice").set(choice);
      rpsCompare()
      setTimeout(function(){
        $(".panelT").hide();
        $("#tRock").show();
      },3000);
    }
  });
// function that compares choices of players and determines winner.
  function rpsCompare() {
    if (player1.choice === "Rock") {
      if (player2.choice === "Rock") {       
        db.ref().child("/score/").set("Tie game!");
        db.ref().child("/players/player1/tie").set(player1.tie + 1);
        db.ref().child("/players/player2/tie").set(player2.tie + 1);
      } else if (player2.choice === "Paper") {     
        db.ref().child("/score/").set("Paper wins!");
        db.ref().child("/players/player1/loss").set(player1.loss + 1);
        db.ref().child("/players/player2/win").set(player2.win + 1);
      } else {       
        db.ref().child("/score/").set("Rock wins!");
        db.ref().child("/players/player1/win").set(player1.win + 1);
        db.ref().child("/players/player2/loss").set(player2.loss + 1);
      }
    } else if (player1.choice === "Paper") {
      if (player2.choice === "Rock") {        
        db.ref().child("/score/").set("Paper wins!");
        db.ref().child("/players/player1/win").set(player1.win + 1);
        db.ref().child("/players/player2/loss").set(player2.loss + 1);
      } else if (player2.choice === "Paper") {       
        db.ref().child("/score/").set("Tie game!");
        db.ref().child("/players/player1/tie").set(player1.tie + 1);
        db.ref().child("/players/player2/tie").set(player2.tie + 1);
      } else {    
        db.ref().child("/score/").set("Scissors win!");
        db.ref().child("/players/player1/loss").set(player1.loss + 1);
        db.ref().child("/players/player2/win").set(player2.win + 1);
      }  
    } else if (player1.choice === "Scissors") {
      if (player2.choice === "Rock") {
        db.ref().child("/score/").set("Rock wins!");
        db.ref().child("/players/player1/loss").set(player1.loss + 1);
        db.ref().child("/players/player2/win").set(player2.win + 1);
      } else if (player2.choice === "Paper") {   
        db.ref().child("/score/").set("Scissors win!");
        db.ref().child("/players/player1/win").set(player1.win + 1);
        db.ref().child("/players/player2/loss").set(player2.loss + 1);
      } else {
        db.ref().child("/score/").set("Tie game!");
        db.ref().child("/players/player1/tie").set(player1.tie + 1);
        db.ref().child("/players/player2/tie").set(player2.tie + 1);
      }  
    }
    turn = 1;
    db.ref().child("/turn").set(1);
  }
});
