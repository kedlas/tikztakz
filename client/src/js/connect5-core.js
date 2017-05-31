// var serverAddr = 'ws://165.227.143.213:8080';
var serverAddr = 'ws://10.211.55.6:8888';
var conn = null;
var separator = '-';
var defaultName = 'Unknown player';
var player = {
  symbol: '',
  color: '',
  player_id: '',
  game_id: '',
  game_public: true,
  player_name: defaultName,
  is_my_turn: false
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
  };

  conn.onerror = function (e) {
    conn = null;
    log("Connection to server failed!" + e);
    // todo - check if works in app version
    location.reload();
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
 *
 * @return {string}
 */
function getPlayerName() {
  var inputName = $("input#playerName").val();
  if (inputName.length > 0) {
    player.player_name = $("input#playerName").val();
  } else {
    player.player_name = defaultName;
  }

  return player.player_name;
}

/**
 * Send join game request to server
 *
 * @param playerName
 * @param isPublic
 * @param gameId
 */
function joinGame(playerName, isPublic, gameId) {
  var msg = {
    type: "create_player",
    data: {
      player_name: playerName,
      game_public: isPublic
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
  // set player props to new values
  player = data;
  waitingForOpponentAlert(player.game_public);
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
    // todo - delete
    // $(key).addClass('my_turn');
  }

  toggleTurnAlert(player.is_my_turn);
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
  if (player.player_id === data.winner_id) {
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
  symbolTag = '<img src="images/circle.png" alt="O"/>';
  if (symbol === 'X') {
    var symbolTag = '<img src="images/cross.png" alt="X"/>';
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
