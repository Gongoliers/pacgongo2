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
var total_points = 200;
var clear_points = 50;
var round = 0;
var running = true;
var music = null;
var wakaWaka = null;
var dyingSound = null;
var hat = null;
var ghost_points = 50;
var ghosts_killed = 0;
var paused = false;

window.addEventListener("deviceorientation", function(event) {
  if (event.gamma > 30) {
    keystate = right;
  } else if (event.gamma < -30) {
    keystate = left;
  } else if (event.beta < 0) {
    keystate = up;
  } else if (event.beta > 30) {
    keystate = down;
  }
});

var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function playMainTheme(buffer) {
  var src = context.createBufferSource();
  src.buffer = buffer;
  music = context.createGain();
  music.gain.value = 1;
  src.loop = true;
  src.connect(music);
  music.connect(context.destination);
  src.start(0);
}

function playSound(buffer) {
  if (buffer === null)
    return;
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

function loadSounds() {
  var bufferLoader = new BufferLoader(
    context, ['res/pacman.mp3', 'res/pacman-waka-waka.mp3', 'res/pacman-dying.mp3'],
    function(bufferList) {
      playMainTheme(bufferList[0]);
      wakaWaka = bufferList[1];
      dyingSound = bufferList[2];
    });
  bufferLoader.load();
}

var map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 0],
  [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 8, 0, 0, 0, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 0],
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
    superMode: false,
    superTime: 0,
    superStart: 0,
    die: function() {
      this.lives--;
      music.gain.value = 0;
      if (this.lives === 2) {
        document.getElementById("two").setAttribute("style", "display:none;");
      } else if (this.lives === 1) {
        document.getElementById("one").setAttribute("style", "display:none;");
      }
      playSound(dyingSound);
      setTimeout(function() {
        music.gain.value = 1;
      }, 1000);
    },
    sensorUpdate: function() {
      var normalX = Math.round(this.x / BLOCK);
      var normalY = Math.round(this.y / BLOCK);

      if (map[normalY][Math.round(this.x / BLOCK - 0.6)] === 0) {
        this.wallSensor.left = 1;
      } else {
        this.wallSensor.left = 0;
      }

      if (map[normalY][Math.round(this.x / BLOCK + 0.6)] === 0) {
        this.wallSensor.right = 1;
      } else {
        this.wallSensor.right = 0;
      }

      if (map[Math.round(this.y / BLOCK + 0.6)][normalX] === 0 || map[Math.round(this.y / BLOCK + 0.6)][normalX] === 8) {
        this.wallSensor.back = 1;
      } else {
        this.wallSensor.back = 0;
      }

      if (map[Math.round(this.y / BLOCK - 0.6)][normalX] === 0) {
        this.wallSensor.front = 1;
      } else {
        this.wallSensor.front = 0;
      }

    },
    navMap: function() {
      var i = Math.round(this.x / BLOCK);
      var j = Math.round(this.y / BLOCK);

      if ((map[j][i] === 1)) {
        playSound(wakaWaka);
        this.score++;
        map[j][i]++;
      }

      if ((map[j][i] === 5)) {
        if (this.superTime === 0) {
          this.superStart = Date.now();
        }
        this.score++;
        this.superTime += 10000;

        map[j][i] = 2;
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
      if (Date.now() < (this.superStart + this.superTime)) {
        this.superMode = true;
      } else {
        this.superMode = false;
        this.superTime = 0;
        this.superStart = 0;
      }
      this.sensorUpdate();
      if (keystate == up && this.wallSensor.front === 0) {
        this.vel.y = -this.speed;
        this.vel.x = 0;
      } else if (keystate == down && this.wallSensor.back === 0) {
        this.vel.y = this.speed;
        this.vel.x = 0;
      } else if (keystate == left && this.wallSensor.left === 0) {
        this.vel.y = 0;
        this.vel.x = -this.speed;
      } else if (keystate == right && this.wallSensor.right === 0) {
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
      if (this.superMode) {
        document.getElementById("super").innerHTML = Math.round(((this.superStart + this.superTime) - Date.now()) / 1000) + 's';
      }
      document.getElementById("score").innerHTML = this.score;
      document.getElementById("round").innerHTML = round + 1;
    }
  };
};

Ghost = function() {
  return {
    image: document.getElementById("ghostcoffey"),
    scareImage: document.getElementById("ghostcoffey-scare"),
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

      if (map[Math.round(this.y / BLOCK + 0.5)][normalX] === 0 || map[Math.round(this.y / BLOCK + 0.5)][normalX] === 8) {
        this.wallSensor.back = 1;
      } else {
        this.wallSensor.back = 0;
      }

      if (map[Math.round(this.y / BLOCK - 0.5)][normalX] === 0) {
        this.wallSensor.front = 1;
      } else {
        this.wallSensor.front = 0;
      }

      if (normalX === 10 && normalY === 5) {
        this.wallSensor.back = 1;
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
        if (player.superMode) {
          this.vel.x *= -1;
          this.vel.y *= -1;
        }
      }
    },
    update: function() {
      this.moveToPacgongo();
      this.navMap();
      this.x += this.vel.x;
      this.y += this.vel.y;
      if (intersect(this.x, this.y, this.width, this.height,
          player.x, player.y, player.width, player.height) && !player.superMode) {
        player.die();
        resetField();
      } else if (intersect(this.x, this.y, this.width, this.height,
          player.x, player.y, player.width, player.height)) {
        player.score += ghost_points;
        ghosts_killed++;
        this.x = (Math.random() * (6 * BLOCK - this.width)) + 8 * BLOCK;
        this.y = Math.random() * (2 * BLOCK - this.height) + 7 * BLOCK;
      }
    },
    draw: function() {
      this.image.height = this.height;
      this.image.width = this.width;
      this.scareImage.height = this.height;
      this.scareImage.width = this.width;
      if (!player.superMode) {
        ctx.drawImage(this.image, this.x, this.y);
      } else {
        ctx.drawImage(this.scareImage, this.x, this.y);
      }
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
    paused = true;
    setTimeout(function() {
      paused = false;
    }, 1000);
  }
}

function drawMap() {
  ctx.fillStyle = 'green';
  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[i].length; j++) {
      if (map[i][j] === 1) {
        ctx.fillRect(j * BLOCK + BLOCK / 2, i * BLOCK + BLOCK / 2, 4, 4);
      } else if (map[i][j] === 0) {
        ctx.fillRect(j * BLOCK, i * BLOCK, BLOCK, BLOCK);
      } else if (map[i][j] === 5) {
        ctx.drawImage(hat, j * BLOCK, i * BLOCK + 6);
      } else if (map[i][j] === 8) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(j * BLOCK, i * BLOCK + 5);
        ctx.lineTo(j * BLOCK + BLOCK, i * BLOCK + 5);
        ctx.stroke();
      }
    }
  }
}


function intersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
}

function main() {
  loadSounds();
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  document.addEventListener("keydown", function(evt) {
    keystate = evt.keyCode;
    if (keystate === 80) {
      paused = !paused;
    }
  });

  init();

  var loop = function() {
    if (!paused) {
      update();
      draw();
    }
    window.requestAnimationFrame(loop, canvas);
  };
  window.requestAnimationFrame(loop, canvas);
}

function init() {
  player = new Pacgongo();
  resetField();
  hat = document.getElementById("hat");
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
      if (map[i][j] === 2 || map[i][j] === 1 || map[i][j] === 5 || map[i][j] === 8) {
        grid.setWalkableAt(j, i, true);
      } else {
        grid.setWalkableAt(j, i, false);
      }
    }
  }
  return grid;
}

function update() {
  if (!running) {
    player.y += player.speed * 3;
    player.draw();
  } else {
    if (player.lives <= 0) {
      running = false;
      alert('Game Over ---- You scored ' + player.score + ' points!');
      setTimeout(function() {
        location.reload();
      }, 2000);

    }
    if (((player.score - clear_points * round - ghost_points * ghosts_killed) % total_points) === 0) {
      round++;
      numGhosts++;
      player.score += clear_points + 1;
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
