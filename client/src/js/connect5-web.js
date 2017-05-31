
window.onbeforeunload = function () {
  if (conn) {
    return 'Are you sure to leave the game?';
  }
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

function waitingForOpponentAlert(isGamePublic) {
  $("div#gameEntry").hide();
  if (isGamePublic) {
    $("div#alerts .alert-info").html('Looking for an opponent...');
  } else {
    var link = window.location.href.split('#')[0] + '?game_id=' + player.game_id;
    $("div#alerts .alert-info").html(
      'Copy the link below and send it to your friend.When he connects the game will start automatically.' +
      '<p><strong>'+ link + '</strong></p>'
    );
  }
}

function gameStartedAlert() {
  $("div#alerts .alert-info").show();
  $("div#alerts .alert-success").prepend('<strong>' + player.player_name + '</strong>, ');
  $("div#alerts .alert-success").append(' Your symbol is <strong>' + getSymbolImgTag(player.symbol) + '</strong>.');
}

function toggleTurnAlert(myTurn) {
  if (myTurn) {
    $("#alerts .alert").hide();
    $("div#alerts .alert-success").show();
    $("div#alerts .alert-warning").hide();
  } else {
    $("#alerts .alert").hide();
    $("div#alerts .alert-success").hide();
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