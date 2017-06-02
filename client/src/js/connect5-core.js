var serverAddr = 'ws://165.227.143.213:8080';
// var serverAddr = 'ws://10.211.55.6:8080';
var conn = null;
var separator = '-';
var defaultName = 'Unknown player';
var player = {
  id: '',
  name: defaultName,
  symbol: '',
  is_my_turn: false,
  opponent_name: 'opponent'
};
var game = {
  id: '',
  is_public: true
};

/**
 * Create websocket connection to server
 */
function initWebSockets() {
  conn = new WebSocket(serverAddr);

  conn.onopen = function () {
    log("Connection established!");
  };

  conn.onclose = function () {
    log("Connection closed.");
    errorAlert('Connection to server closed.');
  };

  conn.onerror = function (e) {
    conn = null;
    errorAlert('Connection to server failed.');
    log("Connection to server failed." + e);
    // todo - check if works in app version
    // location.reload();
  };

  conn.onmessage = function (e) {
    var msg = null;
    try {
      msg = JSON.parse(e.data);
    } catch (err) {
      log(err);
      log(e);
    }

    if (msg.message) {
      log(msg.message);
    }

    if (msg.type === 'info_resp') {
      // do nothing, message already logged by code above
    } if (msg.type === 'error') {
      errorAlert(msg.data.message);
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

function closeWebSockets() {
  conn.close();
  conn = null;
}

/**
 * Returns name filled by player or default one
 *
 * @return {string}
 */
function getPlayerName() {
  var inputName = $("input#playerName").val();
  if (inputName.length > 0) {
    player.name = $("input#playerName").val();
  } else {
    player.name = '';
  }

  return player.name;
}

/**
 * Send join game request to server
 *
 * @param playerName
 * @param isGamePublic
 * @param gameId
 */
function joinGame(playerName, isGamePublic, gameId) {
  var msg = {
    type: "create_player",
    data: {
      player_name: playerName,
      game_public: isGamePublic
    }
  };

  if (gameId) {
    msg.data.game_id = gameId;
  }

  conn.send(JSON.stringify(msg));
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
    $(cells).css('line-height', cells.height() + 'px');
  }

  if (cells.width() < cells.height()) {
    $(cells).height(cells.width());
    $(cells).css('line-height', cells.height() + 'px');
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
  if (player.id === data.player_on_turn) {
    player.is_my_turn = true;
  } else {
    player.is_my_turn = false;
  }

  gameStartedAlert();
  toggleTurnAlert(player.is_my_turn);
  // must be after it is shown because ov correct cell width calculations
  drawGameBoard(data.board_size);
}

/**
 * Handle server's "create player" message
 * @param data
 */
function createPlayerResp(data) {
  game.id = data.game_id;
  game.is_public = data.game_public;

  player.id = data.player_id;
  player.name = data.player_name;
  player.symbol = data.symbol;
  player.is_my_turn = data.is_my_turn;
  player.opponent_name = data.opponents[0] ? data.opponents[0] : 'opponent';

  waitingForOpponentAlert();
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

  if (player.id === data.player_on_turn) {
    player.is_my_turn = true;
  } else {
    player.is_my_turn = false;
  }

  toggleTurnAlert();
}

/**
 * Handle server's "end of game" message
 *
 * @param data
 */
function endOfGameResp(data) {
  closeWebSockets();
  player.is_my_turn = false;
  deactivateGameBoard();
  if (player.id === data.winner_id) {
    wonAlert();
  } else {
    looseAlert();
  }
}

/**
 *
 */
function disconnectPlayerResp() {
  closeWebSockets();
  player.is_my_turn = false;
  deactivateGameBoard();
  opponentLeftAlert();
}

/**
 *
 * @param symbol
 * @return {string}
 */
function getSymbolImgTag(symbol) {
  symbolTag = '<img src="images/circle.png" alt="O" class="symbol symbol_circle"/>';
  if (symbol === 'X') {
    var symbolTag = '<img src="images/cross.png" alt="X" class="symbol symbol_cross"/>';
  }

  return symbolTag;
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

  var gameId = getUrlParameter('game_id');
  if (gameId) {
    $("#privateGameId").val(gameId);
  }
}
