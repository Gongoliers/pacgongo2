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
    speed: size / 4,
    vel: {
      x: 0,
      y: 0
    },
    setVelocity: function(direction, speed) {
      switch (direction) {
        case up:
          this.vel.y = -speed;
          this.vel.x = 0;
          break;
        case down:
          this.vel.y = speed;
          this.vel.x = 0;
          break;
        case left:
          this.vel.x = -speed;
          this.vel.y = 0;
          break;
        case right:
          this.vel.x = speed;
          this.vel.y = 0;
          break;
      }
    },
    move: function() {
      this.x += this.vel.x;
      this.y += this.vel.y;
    },
    stop: function() {
      this.vel.x = 0;
      this.vel.y = 0;
    },
    objectAt: function(x, y, relative) {
      if (relative) {
        x += this.x;
        y += this.y;
      }
      return map.get(Math.floor(x / size), Math.floor(y / size));
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
      var currentBlock = this.objectAt(0, 0, true);
      if (currentBlock === map.portal) {
        if (this.vel.x < 0) {
          this.x = size * 26 + this.width / 2;
        } else if (this.vel.x > 0) {
          this.x = this.width / 2;
        }
      } else if (currentBlock == map.pill) {
        this.score += 10;
        playSound(wakaWaka);
        if (this.score % 10000 === 0) {
          this.lives++;
        }
        document.getElementById('score').innerHTML = "SCORE: " + this.score;
        map.set(Math.floor(this.x / size), Math.floor(this.y / size), map.empty);
      } else if (currentBlock == map.powerup) {
        playSound(eatHatSound);
        this.score += 50;
        for (var i = 0; i < ghosts.length; i++) {
          ghosts[i].immune = false;
        }
        this.superMode = true;
        this.superModeStartTime = Date.now();
        map.set(Math.floor(this.x / size), Math.floor(this.y / size), map.empty);
      }
      if (this.superMode) {
        if (Date.now() - this.superModeStartTime >= 6000) {
          this.superMode = false;
        }
      }
      if (this.x % size === 0 && this.y % size === 0) {
        if (currentKeyState != keystate) {
          switch (keystate) {
            case up:
              if (this.objectAt(0, -size, true) != map.wall)
                currentKeyState = keystate;

              break;
            case down:
              var objDown = this.objectAt(0, size, true);
              if (objDown !== map.wall &&
                objDown !== map.ghostWall)
                currentKeyState = keystate;
              break;
            case left:
              if (this.objectAt(-size, 0, true) !== map.wall)
                currentKeyState = keystate;
              break;
            case right:
              if (this.objectAt(size, 0, true) != map.wall)
                currentKeyState = keystate;
              break;
          }
        }
        switch (currentKeyState) {
          case up:
            if (this.objectAt(0, -size, true) != map.wall)
              this.setVelocity(up, this.speed);
            else
              this.stop();
            break;
          case down:
            var objDown = this.objectAt(0, size, true);
            if (objDown !== map.wall &&
              objDown !== map.ghostWall)
              this.setVelocity(down, this.speed);
            else
              this.stop();
            break;
          case left:
            if (this.objectAt(-size, 0, true) !== map.wall)
              this.setVelocity(left, this.speed);
            else
              this.stop();
            break;
          case right:
            if (this.objectAt(size, 0, true) !== map.wall)
              this.setVelocity(right, this.speed);
            else
              this.stop();
            break;
        }
      }
      this.move();
    },
    draw: function(ctx) {
      ctx.drawImage(this.image, this.x, this.y);
    }
  };
};
