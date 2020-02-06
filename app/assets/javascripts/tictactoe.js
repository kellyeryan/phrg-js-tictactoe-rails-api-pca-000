var turn = 0
var gameId

const WINNING_COMBOS = [[0,1,2], [3,4,5], [6,7,8], [0,3,6],
                        [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

$(document).ready(function() {
  attachListeners()
})

function player() {
  return turn % 2 ? "O" : "X"
}

function updateState(el) {
  let token = player();
    if ($(el).text() != "") {
      turn--;
      return
    } else {
      $(el).text(token)
    }
  }

function clearGame() {
  $("td").empty()
  turn = 0
  gameId = 0
  setMessage("")
}

function setMessage(string) {
  $("#message").html(string)
}


function checkWinner() {
  var board = {};
  var winner = false;

  $('td').text((index, square) => board[index] = square);

  WINNING_COMBOS.some(function(combo) {
    if (board[combo[0]] !== "" && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
      setMessage(`Player ${board[combo[0]]} Won!`);
      return winner = true;
    }
  });

  return winner;
}

// function checkWinner() {
//   var result = false
//   var setX = []
//   var setO = []

//   for (let i=0; i<9; i++) {
//     if ($('td')[i].innerHTML === "X") {
//       setX.push(i)
//     } else if ($('td')[i].innerHTML === "O") {
//       setO.push(i)
//     }
//   }

//   console.log(setX)
//   console.log(setO)

//   for (let i=0; i<WINNING_COMBOS.length; i++) {
//     if (JSON.stringify(setX) === JSON.stringify(WINNING_COMBOS[i])) {
//       setMessage("Player X Won!");
//       result = true
//     } else if (JSON.stringify(setO) === JSON.stringify(WINNING_COMBOS[i])) {
//       result = true
//       setMessage("Player O Won!");
//     }
//   }
//   return result
// }

function doTurn(el) {
  updateState(el)
  turn++;
  if (checkWinner() === true) {
    saveGame();
    clearGame();
  }
  else if (turn === 9) {
    setMessage("Tie game.");
    saveGame();
    clearGame();
  }
}

function previousGame() {
  $.get("/games", function(data) {
    let prevGames = data.data
    let availableGames = []

    for (let i = 0; i < prevGames.length; i++) {
      availableGames.push($(prevGames)[i].id)
    }

    $games = $("#games")
    $games.html("")

    prevGames.forEach(function(i) {
      $games.append('<button class="tictactoe" data-id="' + i.id + '">' + i.id + '</button>');
    })
    // addGameEventListeners()
    // add event listeners to each one of the new buttons.
  })
}

function previousSavedGame(el) {
   gameId = el.innerHTML
   $.get(`/games/${gameId}`, function(data) {
    let prevGames = data.data.attributes.state
    for (let i = 0; i < 9; i++) {
      $("td")[i].innerHTML = prevGames[i]
    }
    var moves = prevGames.filter(i => {return i !== ""});
    turn = moves.length
  })
}


function saveGame() {
  let gameArray = []
  for (let i = 0; i < 9; i++) {
    gameArray.push($("td")[i].innerHTML)
  }
  let dataRecord = {state: gameArray}
  if (gameId) {
    $.ajax({
      type: "PATCH",
      url: `/games/${gameId}`,
      data: dataRecord
    })
  } else {
    $.post("/games", dataRecord, function(data){
    gameId = data.data.id
    $("#games").append('<button data-id="' + gameId + '">' + gameId + '</button>')
    })
  }
}

function attachListeners() {
  $("#save").on("click", () => saveGame());
  $('#clear').on('click', () => clearGame());
  $('#previous').on('click', () => previousGame());

  $("td").on("click", function(event) {
    if (!checkWinner() && turn != 9) {
      doTurn(this);
    }
  })

  $(document).on("click", "button.tictactoe", function(event){
      event.preventDefault()
      previousSavedGame(this)
   })
}
