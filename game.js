var SCALE = 2;
var WIDTH = 224 * SCALE,
  HEIGHT = 248 * SCALE;
var BLOCK = 8 * SCALE;

// Canvas
var canvas, ctx;

// Audio
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audio = new AudioContext();
var mainTheme, wakaWaka, dyingSound, eatHatSound;

function playSound(buffer) {
  if (buffer === null)
    return;
  var source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(0);
}

function loadSounds() {
  var bufferLoader = new BufferLoader(
    audio, ['res/pacman_beginning.wav', 'res/pacman-waka-waka.mp3', 'res/pacman-dying.mp3', 'res/pacman_eatfruit.wav'],
    function(bufferList) {
      playSound(bufferList[0]);
      wakaWaka = bufferList[1];
      dyingSound = bufferList[2];
      eatHatSound = bufferList[3];
    });
  bufferLoader.load();
}

// Keypress
var keystate = null;
var up = 38,
  down = 40,
  left = 37,
  right = 39;
window.addEventListener("keydown", function(evt) {
  keystate = evt.keyCode;
});

// Mobile support
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

// Sprites
var player;
var ghosts = [];

// Map
var map;

// Game loop
function main() {
  loadSounds();
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  setTimeout(function(){
    document.getElementById("shade").classList.add("gone");
    document.getElementById("splash").classList.add("slideAway");
    init();
    setTimeout(function() {
      window.requestAnimationFrame(loop, canvas);
    }, 500);
  }, 4100);
}

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop, canvas);
}

function init() {
  player = new Pacgongo(BLOCK);
  map = new Map(BLOCK);
  for (var i = 0; i < 4; i++) {
    ghosts.push(new Ghost(BLOCK, 12 * BLOCK + i * BLOCK));
  }
}

function update() {
  if (player.dying || map.count === 0) {
    for (var g = 0; g < 4; g++) {
      ghosts[g].x = 12 * BLOCK + g * BLOCK;
      ghosts[g].y = 14 * BLOCK;
    }
    player.x = 14 * BLOCK;
    player.y = 23 * BLOCK;
    player.dying = false;
  }
  if (map.count === 0)
    map = new Map(BLOCK);
  player.update(keystate, map);
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].update(player, map);
  }
}

function draw() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  map.draw(ctx);
  player.draw(ctx);
  for (var i = 0; i < ghosts.length; i++) {
    ghosts[i].draw(ctx);
  }
}

main();
