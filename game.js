/*
 * Author - Kyle Corry
 */

var c = document.getElementById("game");
var ctx = c.getContext("2d");
var white = "#ffffff";
var black = "#000000";
var yellow = "#ffff00";
var blue = "#0000ff";
var blockSize = 25;
var height = ctx.canvas.height;
var width = ctx.canvas.width;
var jump = 8;
var ghostSpeed = 5;
var fps = 16;
var score = 0;
var lives = 3;

// Pacgongo position
var x = width / 2 - blockSize / 2;
var y = height - blockSize;

var dx = 0;
var dy = 0;

// Images
var pacgongo = document.getElementById("pacgongo");
var ghostcoffey = document.getElementById("ghostcoffey");


var ghostXs = [
  100, 120, 10, 50
];

var ghostYs = [
  130, 20, 15, 90
];

var riding = false;
var gameOver = false;
var gamePaused = false;
var intervalId = null;


var gameLoop = function() {
  document.getElementById('soundtrack').play();
  ctx.font = "25px SanSerif";
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = black;
  if (gameOver) {
    clearInterval(intervalId);
    intervalId = setInterval(gameEnd, 1000 / fps);

  }
  if (gamePaused) {
    clearInterval(intervalId);
    intervalId = setInterval(gamePause, 1000 / fps);
  }

  drawBackground();
  drawObjects();
  window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 38) {
      dy = -jump;
      dx = 0;
    } else if (key == 40) {
      dy = jump;
      dx = 0;
    } else if (key == 39) {
      dx = jump;
      dy = 0;
    } else if (key == 37) {
      dx = -jump;
      dy = 0;
    } else if (key == 27) {
      gameOver = true;
    } else if (key == 80) {
      gamePaused = true;
    }

  };
  wallCollision();
};

var drawBackground = function() {

};

var drawObjects = function() {

  movePacgongo();

  moveGhosts();

  // Pacgongo
  ctx.drawImage(pacgongo, x, y);

  // ghostcoffey
  for (var i = 0; i < ghostXs.length; i++) {
    ctx.drawImage(ghostcoffey, ghostXs[i], ghostYs[i]);
  }

  if (colliding() && !gameOver) {
    lives--;
    x = width / 2 - blockSize / 2;
    y = height - blockSize;
    dx = 0;
    dy = 0;
    ghostXs = [
      100, 120, 10, 50
    ];

    ghostYs = [
      130, 20, 15, 90
    ];
    if (lives <= 0) {
      gameOver = true;
    }
  }

  $('#lives').empty();
  for(var j = 0; j < lives; j++){
    $('#lives').append('<img src="res/pacgongo.png"> ');
  }
  $('#score').text(score + " points");
};


var moveGhosts = function() {
  for (var i = 0; i < ghostXs.length; i++) {
    ghostXs[i] += x > ghostXs[i] ? ghostSpeed : -ghostSpeed;
    ghostYs[i] += y > ghostYs[i] ? ghostSpeed : -ghostSpeed;
  }
};


var movePacgongo = function() {
  y += dy;
  x += dx;
};

var colliding = function() {
  for (var i = 0; i < ghostXs.length; i++) {
    if (ghostXs[i] < x + pacgongo.width && ghostXs[i] + ghostcoffey.width > x) {
      if (ghostYs[i] < y + pacgongo.height && ghostYs[i] + ghostcoffey.height > y) {
        return true;
      }
    }
  }
  return false;
};

var wallCollision = function() {
  if (x < 0) {
    x = 0;
  } else if (x > width - blockSize) {
    x = width - blockSize;
  } else if (y < jump) {
    y = 0;
  } else if (y > height - blockSize) {
    y = height - blockSize;
  }
};

var gamePause = function() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = black;
  ctx.fillText("Game Paused, press P to resume", width / 2 - "Game Paused, press P to resume".length * 5, height / 3);
  window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 80) {
      gamePaused = false;
      clearInterval(intervalId);
      intervalId = setInterval(gameLoop, 1000 / fps);
    }
  };
};

var gameEnd = function() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = black;
  ctx.fillText("Game Over, press C to play again", width / 2 - "Game Over, press C to play again".length * 5, height / 3);
  window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 67) {
      clearInterval(intervalId);
      window.location.reload();
    }
  };
};

var intervalId = setInterval(gameLoop, 1000 / fps);
