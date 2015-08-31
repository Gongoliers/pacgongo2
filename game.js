/*
 * Author - Kyle Corry
 */

var WIDTH = 500,
  HEIGHT = 500;
var canvas, ctx, keystate;
var Pacgongo, ghosts, Ghost, player;
var numGhosts = 4;
var up = 38,
  down = 40,
  left = 37,
  right = 39;
var BLOCK = 25;
var total_points = 222;
var clear_points = 50;
var round = 0;
var running = true;

/*
Left 2
Bottom 4
Right 8
Top 16

*/

var map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

var backup_map = clone(map);

Pacgongo = function() {
  return {
    image: document.getElementById("pacgongo"),
    x: 0,
    y: 0,
    vel: {
      x: 0,
      y: 0
    },
    score: 1,
    width: BLOCK,
    height: BLOCK,
    lives: 3,
    speed: 3,
    wallSensor: {
      front: null,
      left: null,
      right: null,
      back: null
    },
    sensorUpdate: function() {
      var normalX = Math.round(this.x / BLOCK);
      var normalY = Math.round(this.y / BLOCK);

      if (map[normalY][Math.round(this.x / BLOCK - 0.5)] === 0) {
        this.wallSensor.left = 1;
      } else {
        this.wallSensor.left = 0;
      }

      if (map[normalY][Math.round(this.x / BLOCK + 0.25)] === 0) {
        this.wallSensor.right = 1;
      } else {
        this.wallSensor.right = 0;
      }

      if (map[Math.round(this.y / BLOCK + 0.5)][normalX] === 0) {
        this.wallSensor.back = 1;
      } else {
        this.wallSensor.back = 0;
      }

      if (map[Math.round(this.y / BLOCK - 0.5)][normalX] === 0) {
        this.wallSensor.front = 1;
      } else {
        this.wallSensor.front = 0;
      }

    },
    navMap: function() {
      this.sensorUpdate();
      var i = Math.round(this.x / BLOCK);
      var j = Math.round(this.y / BLOCK);
      if ((map[j][i] === 1)) {
        new Audio("res/pacman-waka-waka.mp3").play();
        this.score++;
        map[j][i]++;
      }
      if (this.wallSensor.left === 1 && this.vel.x < 0) {
        this.vel.x = 0;
      }

      if (this.wallSensor.right === 1 && this.vel.x > 0) {
        this.vel.x = 0;
      }

      if (this.wallSensor.front === 1 && this.vel.y < 0) {
        this.vel.y = 0;
      }

      if (this.wallSensor.back === 1 && this.vel.y > 0) {
        this.vel.y = 0;
      }
    },
    update: function() {
      if (keystate == up) {
        this.vel.y = -this.speed;
        this.vel.x = 0;
      } else if (keystate == down) {
        this.vel.y = this.speed;
        this.vel.x = 0;
      } else if (keystate == left) {
        this.vel.y = 0;
        this.vel.x = -this.speed;
      } else if (keystate == right) {
        this.vel.y = 0;
        this.vel.x = this.speed;
      }
      this.navMap();
      this.x += this.vel.x;
      this.y += this.vel.y;

    },
    draw: function() {
      this.image.height = this.height;
      this.image.width = this.width;
      ctx.drawImage(this.image, this.x, this.y);
      document.getElementById("lives").innerHTML = this.lives;
      document.getElementById("score").innerHTML = 'Score: ' + this.score;
      document.getElementById("round").innerHTML = 'Round: ' + round;
    }
  };
};

Ghost = function() {
  return {
    image: document.getElementById("ghostcoffey"),
    x: 0,
    y: 0,
    vel: {
      x: 0,
      y: 0
    },
    wallSensor: {
      front: null,
      left: null,
      right: null,
      back: null
    },
    sensorUpdate: function() {
      var normalX = Math.round(this.x / BLOCK);
      var normalY = Math.round(this.y / BLOCK);

      if (map[normalY][Math.round(this.x / BLOCK - 0.5)] === 0) {
        this.wallSensor.left = 1;
      } else {
        this.wallSensor.left = 0;
      }

      if (map[normalY][Math.round(this.x / BLOCK + 0.25)] === 0) {
        this.wallSensor.right = 1;
      } else {
        this.wallSensor.right = 0;
      }

      if (map[Math.round(this.y / BLOCK + 0.5)][normalX] === 0) {
        this.wallSensor.back = 1;
      } else {
        this.wallSensor.back = 0;
      }

      if (map[Math.round(this.y / BLOCK - 0.5)][normalX] === 0) {
        this.wallSensor.front = 1;
      } else {
        this.wallSensor.front = 0;
      }

    },
    width: BLOCK,
    height: BLOCK,
    speed: 2,
    navMap: function() {
      this.sensorUpdate();
      var i = Math.round(this.x / BLOCK);
      var j = Math.round(this.y / BLOCK);

      if (this.wallSensor.left === 1 && this.vel.x < 0) {
        this.vel.x = 0;
      }

      if (this.wallSensor.right === 1 && this.vel.x > 0) {
        this.vel.x = 0;
      }

      if (this.wallSensor.front === 1 && this.vel.y < 0) {
        this.vel.y = 0;
      }

      if (this.wallSensor.back === 1 && this.vel.y > 0) {
        this.vel.y = 0;
      }

    },
    moveToPacgongo: function() {
      var grid = getAstarMap();
      var finder = new PF.AStarFinder();
      var path = finder.findPath(Math.round(this.x / BLOCK), Math.round(this.y / BLOCK),
        Math.round(player.x / BLOCK), Math.round(player.y / BLOCK), grid);
      if (path[1]) {
        if (path[1][0] * BLOCK < this.x) {
          this.vel.x = -this.speed;
        } else if (path[1][0] * BLOCK > this.x) {
          this.vel.x = this.speed;
        } else {
          this.vel.x = 0;
        }

        if (path[1][1] * BLOCK < this.y) {
          this.vel.y = -this.speed;
        } else if (path[1][1] * BLOCK > this.y) {
          this.vel.y = this.speed;
        } else {
          this.vel.y = 0;
        }

      }


    },
    update: function() {
      this.moveToPacgongo();
      this.navMap();
      this.x += this.vel.x;
      this.y += this.vel.y;
      if (intersect(this.x, this.y, this.width, this.height,
          player.x, player.y, player.width, player.height)) {
        player.lives--;
        resetField();
      }
    },
    draw: function() {
      this.image.height = this.height;
      this.image.width = this.width;
      ctx.drawImage(this.image, this.x, this.y);
    }
  };
};

function resetField() {
  if (running) {
    player.x = (WIDTH) / 2;
    player.y = HEIGHT - player.height - BLOCK;
    player.vel = {
      x: 0,
      y: 0
    };
    keystate = 0;
    ghosts = [];
    for (var i = 0; i < numGhosts; i++) {
      var tempGhost = new Ghost();
      tempGhost.x = (Math.random() * (6 * BLOCK - tempGhost.width)) + 8 * BLOCK;
      tempGhost.y = Math.random() * (2 * BLOCK - tempGhost.height) + 7 * BLOCK;
      ghosts.push(tempGhost);
    }
  }
}

function drawMap() {
  ctx.fillStyle = 'darkgreen';
  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[i].length; j++) {
      if (map[i][j] === 1) {
        ctx.fillRect(j * BLOCK + BLOCK / 2, i * BLOCK + BLOCK / 2, 4, 4);
      } else if (map[i][j] === 0) {
        ctx.fillRect(j * BLOCK, i * BLOCK, BLOCK, BLOCK);
      }
    }
  }
}


function intersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
}

function main() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  backup_map = map.slice();
  document.addEventListener("keydown", function(evt) {
    keystate = evt.keyCode;
  });

  init();

  var loop = function() {
    update();
    draw();
    window.requestAnimationFrame(loop, canvas);
  };
  window.requestAnimationFrame(loop, canvas);
}

function init() {
  player = new Pacgongo();
  resetField();
  var music = new Audio("res/pacman.mp3");
  music.loop = true;
  music.play();

}

function clone(src) {
  var dest = [];
  for (var i = 0; i < src.length; i++) {
    var arr = [];
    for (var j = 0; j < src[i].length; j++) {
      arr.push(src[i][j]);
    }
    dest.push(arr);
  }
  return dest;
}

function getAstarMap() {
  var grid = new PF.Grid(map[0].length, map.length);
  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[i].length; j++) {
      if (map[i][j] === 2 || map[i][j] === 1) {
        grid.setWalkableAt(j, i, true);
      } else {
        grid.setWalkableAt(j, i, false);
      }
    }
  }
  return grid;
}

function update() {
  // document.getElementById('soundtrack').play();
  if (!running) {
    player.y += player.speed * 3;
    player.draw();
  } else {
    if (player.lives <= 0) {
      running = false;
      // alert('Game Over ---- You scored ' + player.score + ' points!');
      new Audio("res/pacman-dying.mp3").play();

      setTimeout(function() {
        location.reload();
      }, 2000);

    }
    if (((player.score - clear_points * round) % total_points) === 0) {
      round++;
      map = clone(backup_map);
      resetField();
    }
    player.update();
    for (var i = 0; i < ghosts.length; i++) {
      ghosts[i].update();
    }
  }
}

function draw() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawMap();
  player.draw();
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].draw();
  }
}


main();
