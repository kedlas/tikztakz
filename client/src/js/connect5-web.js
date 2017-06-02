
window.onbeforeunload = function () {
  if (conn) {
    return 'Are you sure to leave the game?';
  }
};

window.onresize = function() {
  autoResizeGameBoard();
};

$(document).ready(function () {
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
});

function log(msg) {
  var d = new Date();
  var timeStr = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  msg = '<span class="log_date">' + timeStr + '</span>' + msg;

  $("div#gameLog").prepend("<p>" + msg + "</p>");
  $("#gameLogWrapper").show();
}

function waitingForOpponentAlert() {
  $("div#gameEntry").hide();
  $("div#alerts .alert").hide();
  if (game.is_public) {
    $("div#alerts .alert-info")
      .html('Looking for an opponent...')
      .show();
  } else {
    var link = window.location.href.split('#')[0];
    link = link.split('#')[0] + '?game_id=' + game.id;

    $("div#alerts .alert-info")
      .html(
        'Copy the link below and send it to your friend. When he connects the game will start automatically.' +
        '<hr/><p><a href="'+link+'" target="_blank"><strong>'+ link + '</strong></a></p>'
      )
      .show();

  }
}

function gameStartedAlert() {
  $("div#alerts .alert-info").show();
}

function toggleTurnAlert() {
  $("#alerts .alert").hide();

  if (player.is_my_turn) {
    $("div#alerts .alert-success").html('<strong>' + player.name + '</strong>, It\'s your turn.');
    $("div#alerts .alert-success").append(' Your symbol is <strong>' + getSymbolImgTag(player.symbol) + '</strong>.');
    $("div#alerts .alert-success").show();
  } else {
    $("div#alerts .alert-warning").html('It\'s ' + player.opponent_name  +'\'s turn.');
    $("div#alerts .alert-warning").show();
  }
}

function deactivateGameBoard() {
  $("div#gameBoard").fadeTo(200, 0.33);
  $("div.buttons").show();
}

function opponentLeftAlert() {
  $("#alerts .alert").hide();
  $("#alerts .alert-warning").html('<strong>Your opponent has left the game :(</strong>').show();
}

function wonAlert() {
  $("div#alerts .alert").hide();
  $("div#alerts .alert-success")
    .html('<strong>Congratulations, you won.</strong>')
    .show();
}

function looseAlert() {
  $("div#alerts .alert").hide();
  $("div#alerts .alert-danger")
    .html('<strong>You loose, try again. You can do it!</strong>')
    .show();
}

function errorAlert(message) {
  alert(message);
  $("div#alerts .alert").hide();
  $("div#alerts .alert-danger").html(message).show();
}