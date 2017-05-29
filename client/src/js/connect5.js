//var serverAddr = 'ws://165.227.143.213:8080';
var serverAddr = 'ws://10.211.55.6:8888';
var conn = null;
var separator = '-';
var player = {
  symbol: '',
  color: '',
  player_id: '',
  game_id: '',
  game_public: true,
  player_name: 'Unknown player',
  is_my_turn: false
};

$(document).ready(function () {
  onDeviceReady();
});

window.onbeforeunload = function (e) {
  if (conn) {
      return 'Are you sure to leave the game?';
  }
};

/**
 * Device ready, bind basic behavior
 */
function onDeviceReady() {
  initWebSockets();
  preFillGameEntry();

  $("#joinRandomPublicGame").click(function () {
    if (!conn) {
      return null;
    }

    joinGame(getPlayerName(), true);
  });
  
  $("#createPrivateGame").click(function () {
    if (!conn) {
      return null;
    }

    joinGame(getPlayerName(), false);
  });

  $("#joinPrivateGame").click(function () {
    if (!conn) {
      return null;
    }

    var gameId = $("#privateGameId").val();

    if (!gameId || gameId.length === 0) {
      return null;
    }

    joinGame(getPlayerName(), false, gameId);
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

  $('.buttons #resetGame').click(function () {
    if (conn) {
      conn.close();
    }
    conn = null;
    location.reload();
  });
}

/**
 * Create websocket connection to server
 */
function initWebSockets() {
  conn = new WebSocket(serverAddr);

  conn.onopen = function () {
    log("Connection established!");
  };

  conn.onerror = function (e) {
    conn = null;
    log("Connection to server failed!" + e);
    location.reload();
  };

  conn.onmessage = function (e) {
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
    } else if (msg.type === 'disconnect_player_resp') {
      disconnectPlayerResp();
    } else if (msg.type === 'end_of_game_resp') {
      endOfGameResp(msg.data);
    }
  };
}

/**
 *
 * @return {string}
 */
function getPlayerName() {
  var inputName = $("input#playerName").val();
  if (!inputName || inputName.length === 0) {
    inputName = player.player_name;
  }
  player.player_name = inputName;

  return player.player_name;
}

/**
 * Send join game request to server
 *
 * @param playerName
 */
function joinGame(playerName, public, gameId) {
  var msg = {
    type: "create_player",
    data: {
      player_name: playerName,
      game_public: public
    }
  };

  if (gameId) {
    msg.data.game_id = gameId;
  }

  conn.send(JSON.stringify(msg));
}

/**
 * Toggle labels signalizing if player is on turn or not
 */
function toggleTurnLabel() {
  $("#alerts .alert").hide();
  if (player.is_my_turn === true) {
    $("div#alerts .alert-success").show();
    $("div#alerts .alert-warning").hide();
  } else {
    $("div#alerts .alert-success").hide();
    $("div#alerts .alert-warning").show();
  }
}

/**
 * Draws game board
 *
 * @param boardSize
 */
function drawGameBoard(boardSize) {
  var board = '<table>';

  for (var x = 0; x < boardSize; x++) {
    board += '<tr>';
    for (var y = 0; y < boardSize; y++) {
      board += '<td class="field" id="field-' + x + separator + y + '"></td>';
    }
    board += '</tr>';
  }

  board += '</table>';

  $("div#gameBoard").html(board);
  $("div#gameBoard").show();

  var cells = $("div#gameBoard table tr td");
  if (cells.width() > cells.height()) {
    $(cells).height(cells.width());
  }
}

/**
 * Send add move command to server
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
 * Handle server's "start game" message
 * @param data
 */
function startGameResp(data) {
  if (player.player_id === data.player_on_turn) {
    player.is_my_turn = true;
  }

  var boardSize = data.board_size;

  toggleTurnLabel();
  drawGameBoard(boardSize);
}

/**
 * Handle server's "create player" message
 * @param data
 */
function createPlayerResp(data) {
  player = data;

  $("div#gameEntry").hide();

  if (player.game_public) {
    $("div#alerts .alert-info").html('Looking for an opponent...');
  } else {
    $("div#alerts .alert-info").html(
      'Waiting for opponent to connect. Share this game token with him: <strong>'+ player.game_id + '</strong>'
    );
  }

  $("div#alerts .alert-info").show();

  $("div#alerts .alert-success").prepend('<strong>' + player.player_name + '</strong>, ');
  $("div#alerts .alert-success").append(' Your symbol is <strong>' + getSymbolImgTag(player.symbol) + '</strong>.');
}

/**
 * Handle server's "add move" message
 *
 * @param data
 */
function addMoveResp(data) {
  var x = data.coords.x;
  var y = data.coords.y;
  var key = 'td#field-' + x + separator + y;

  $('td.field').removeClass('last_turn');
  $(key).addClass('last_turn');
  $(key).html(getSymbolImgTag(data.symbol));

  if (player.player_id === data.player_on_turn) {
    player.is_my_turn = true;
  } else {
    player.is_my_turn = false;
    $(key).addClass('my_turn');
  }

  toggleTurnLabel();
}

/**
 * Handle server's "end of game" message
 *
 * @param data
 */
function endOfGameResp(data) {
  player.is_my_turn = false;
  $("div#alerts .alert").hide();
  if (player.player_id === data.winner_id) {
    $("div#alerts .alert-success")
      .html('<strong>Congratulations, you won.</strong>')
      .show();
  } else {
    $("div#alerts .alert-danger")
      .html('<strong>You loose, try again. You can do it!</strong>')
      .show();
  }

  deactivateGame();
}

/**
 *
 */
function disconnectPlayerResp() {
  player.is_my_turn = false;
  $("#alerts .alert").hide();
  $("#alerts .alert-warning").html('<strong>Your opponent has left the game :(</strong>').show();

  deactivateGame();
}

/**
 *
 */
function deactivateGame() {
  $("div#gameBoard").fadeTo(200, 0.33);
  $("div.buttons").show();
  conn.close();
  conn = null;
}

/**
 *
 * @param symbol
 * @return {string}
 */
function getSymbolImgTag(symbol) {
  symbolTag = '<img src="images/circle.png" alt="O"/>';
  if (symbol === 'X') {
    var symbolTag = '<img src="images/cross.png" alt="X"/>';
  }

  return symbolTag;
}

/**
 * Add message to message log
 *
 * @param msg
 */
function log(msg) {
  var d = new Date();
  var timeStr = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  msg = '<span class="log_date">' + timeStr + '</span>' + msg;

  $("div#gameLog").prepend("<p>" + msg + "</p>");
  $("#gameLogWrapper").show();
}

/**
 *
 * @param sParam
 * @return {boolean}
 */
function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
}

/**
 *
 */
function preFillGameEntry() {
  var name = getUrlParameter('player_name');
  if (name) {
    player.player_name = name;
    $("input#playerName").val(name);
  }
}
