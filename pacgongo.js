var Pacgongo = function(size) {
  size = parseInt(size);
  var up = 38,
    down = 40,
    left = 37,
    right = 39;
  return {
    height: size,
    width: size,
    x: 14 * size,
    y: 23 * size,
    dying: false,
    lives: 2,
    score: 0,
    superMode: false,
    superModeStartTime: 0,
    speed: 11 * size / 60,
    vel: {
      x: 0,
      y: 0
    },
    die: function() {
      this.lives--;
      this.dying = true;
      playSound(dyingSound);
      this.x = 14 * size;
      this.y = 23 * size;
      this.vel.x = 0;
      this.vel.y = 0;
      if (this.lives === 1) {
        document.getElementById("two").setAttribute("style", "display:none;");
      } else if (this.lives === 0) {
        document.getElementById("one").setAttribute("style", "display:none;");
      }
    },
    image: document.getElementById("pacgongo"),
    update: function(keystate, map) {
      // Handle blocks
      var currentBlock = map.map[Math.floor((this.y + this.height / 2) / size)][Math.floor((this.x + this.width / 2) / size)];
      if (currentBlock === map.portal) {
        if (this.vel.x < 0) {
          this.x = size * 26 + this.width / 2;
        } else if (this.vel.x > 0) {
          this.x = this.width / 2;
        }
      } else if (currentBlock == map.wall || currentBlock == map.ghostWall) {
        if (this.vel.x < 0) {
          this.x += this.speed + this.width / 2;
          this.vel.x = 0;
        } else if (this.vel.x > 0) {
          this.x -= this.speed + this.width / 2;
          this.vel.x = 0;
        } else if (this.vel.y > 0) {
          this.y -= this.speed + this.height / 2;
          this.vel.y = 0;
        } else if (this.vel.y < 0) {
          this.y += this.speed + this.height / 2;
          this.vel.y = 0;
        }
      } else if (currentBlock == map.pill) {
        this.score += 10;
        playSound(wakaWaka);
        document.getElementById('score').innerHTML = "SCORE: " + this.score;
        map.map[Math.floor((this.y + this.height / 2) / size)][Math.floor((this.x + this.width / 2) / size)] = 2;
      } else if (currentBlock == map.powerup) {
        playSound(eatHatSound);
        this.superMode = true;
        this.superModeStartTime = Date.now();
        map.map[Math.floor((this.y + this.height / 2) / size)][Math.floor((this.x + this.width / 2) / size)] = 2;
      }
      if (this.superMode) {
        if (Date.now() - this.superModeStartTime >= 10000) {
          this.superMode = false;
        }
      }
      switch (keystate) {
        case up:
          if (map.map[Math.floor((this.y + this.height / 2) / size - 1)][Math.floor((this.x + this.width / 2) / size)] !== map.wall) {
            this.vel.y = -this.speed;
            this.vel.x = 0;
          }
          break;
        case down:
          if (map.map[Math.floor((this.y + this.height / 2) / size + 1)][Math.floor((this.x + this.width / 2) / size)] !== map.wall &&
            map.map[Math.floor((this.y + this.height / 2) / size + 1)][Math.floor((this.x + this.width / 2) / size)] !== map.ghostWall) {
            this.vel.y = this.speed;
            this.vel.x = 0;
          }
          break;
        case left:
          if (map.map[Math.floor((this.y + this.height / 2) / size)][Math.floor((this.x + this.width / 2) / size - 1)] !== map.wall) {
            this.vel.x = -this.speed;
            this.vel.y = 0;
          }
          break;
        case right:
          if (map.map[Math.floor((this.y + this.height / 2) / size)][Math.floor((this.x + this.width / 2) / size + 1)] !== map.wall) {
            this.vel.x = this.speed;
            this.vel.y = 0;
          }
          break;
        default:
      }
      this.x += this.vel.x;
      this.y += this.vel.y;
    },
    draw: function(ctx) {
      ctx.drawImage(this.image, this.x, this.y);
    }
  };
};
