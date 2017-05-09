var conn = null;
var separator = '-';
var player = {
  symbol: '',
  player_id: '',
  game_id: '',
  player_name: 'Unknown player',
  is_my_turn: false
};

$(document).ready(function(){
  initWebSockets();

  $("#joinGame").click(function() {
    if (!conn) {
      return null;
    }

    var player_name = $("input#playerName").val();
    joinGame(player_name);
  });

  $("#gameBoard").on('click', 'td.field', function (event) {
    if (!conn) {
      return null;
    }
    if (!player.is_my_turn) {
      return null;
    }
    addMove(event.target.id);
  });
});

$(window).on('beforeunload', function() {
  return 'By leaving this site you will leave the game, are you sure?';
});

function initWebSockets() {
  conn = new WebSocket('ws://localhost:8080');
  conn.onopen = function() {
    console.log("Connection established!");
  };
  conn.onerror = function(e) {
    log("Connection to server failed!" + e);
    conn = null;
    location.reload();
  };

  conn.onmessage = function(e) {
    var msg = null;
    try {
      msg = JSON.parse(e.data);
    } catch (err) {
      console.log(err, e);
    }

    if (msg.message) {
      log(msg.message);
    }

    if (msg.type === 'info_resp') {
      // do nothing, already logged above
    } else if (msg.type === 'create_player_resp') {
      createPlayerResp(msg.data);
    } else if (msg.type === 'start_game_resp') {
      startGameResp(msg.data);
    } else if (msg.type === 'add_move_resp') {
      addMoveResp(msg.data);
    } else if (msg.type === 'end_of_game_resp') {
      endOfGameResp(msg.data);
    }
  };
}


function joinGame(playerName) {
  var msg = { type: "create_player", data: { player_name: playerName } };
  conn.send(JSON.stringify(msg));
}

function createPlayerResp(data) {
  player = data;

  $("div#gameEntry").html('<p>...waiting for opponent...</p>');
  $("div#turnToggle .my_turn").prepend('<strong>' + player.player_name + '</strong>, ');
}

function startGameResp(data) {
  if (player.player_id === data.player_on_turn) {
    player.is_my_turn = true;
  }

  var boardSize = data.board_size;

  $("div#gameEntry").html(
    '<p><strong>' + player.player_name +'</strong>, your symbol is: <strong>' + player.symbol + '</strong></p>'
  );
  toggleTurnLabel();
  drawGameBoard(boardSize);
}

function toggleTurnLabel() {
  if (player.is_my_turn === true) {
    $("div#turnToggle .my_turn").show();
    $("div#turnToggle .opponents_turn").hide();
  } else {
    $("div#turnToggle .my_turn").hide();
    $("div#turnToggle .opponents_turn").show();
  }
}

function drawGameBoard(boardSize) {
  var board = '<table>';

  for (var x = 0; x < boardSize; x++) {
    board += '<tr>';
    for (var y = 0; y < boardSize; y++) {
      board += '<td class="field" id="field-' + x + separator + y +'"></td>';
    }
    board += '</tr>';
  }

  board += '</table>';

  $("div#gameBoard").html(board);
  $("div#gameBoard").show();
  $("div#turnToggle").show();
}

/**
 *
 * @param fieldId
 * @return {null}
 */
function addMove(fieldId) {
  if (!player.is_my_turn) {
    return null;
  }

  var coords = fieldId.split(separator);

  var msg = {
    type: 'add_move',
    data: {
      coords: {
        x: coords[1],
        y: coords[2]
      }
    }
  };

  conn.send(JSON.stringify(msg));
}

/**
 *
 * @param data
 */
function addMoveResp(data) {
  var x = data.coords.x;
  var y = data.coords.y;
  var key = 'td#field-' + x + separator + y;

  $(key).html(data.symbol);

  if (player.player_id === data.player_on_turn) {
    player.is_my_turn = true;
  } else {
    player.is_my_turn = false;
  }

  toggleTurnLabel();
}

function endOfGameResp(data) {
  player.is_my_turn = false;
  var label = '<div class="alert alert-danger h2">You loose, try again.</div>';
  if (player.player_id === data.winner_id) {
    label = '<div class="alert alert-success h2">Congratulations, you won.</div>';
  }

  $("div#turnToggle").html(label);
}

/**
 * Add message to message log
 *
 * @param msg
 */
function log(msg) {
  var d = new Date();
  var timeStr = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  msg = timeStr + ' -> ' + msg;

  $("div#gameLog").prepend("<p>" + msg + "</p>");
}
