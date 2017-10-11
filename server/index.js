var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var CONST = require('../shared/constants');

app.use(express.static('client'));
app.use(express.static('shared'));

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPositionOnField() {
  // +1 and -1 to prevent spawning on the borders
  let x = random(0 + 1, 15 - 2) * 16;
  let y = random(0 + 1, 15 - 2) * 16;

  return { x, y };
}

var tilesGenerator = require('./components/tilesGenerator');
var Player = require('./components/player');

function distance({px, py, x, y, width, height}) {
  dx = Math.max(Math.abs(px - x) - width / 2, 0);
  dy = Math.max(Math.abs(py - y) - height / 2, 0);
  return dx * dx + dy * dy;
}

function distanceObjects(a, b) {
  return distance({
    px: a.x,
    py: a.y,
    x: b.x,
    y: b.y,
    width: 16,
    height: 16
  });
}

class World {
  constructor(timerCallback) {
    this.config = {
      tileColumns: 15,
      tileRows: 15,
      tileWidth: 16,
      tileHeight: 16
    }

    this.players = {};
    this.tiles = tilesGenerator(this.config);
    this.bombs = [];
    this.explosions = [];

    this.width = this.config.tileColumns * this.config.tileWidth;
    this.height = this.config.tileRows * this.config.tileHeight;

    setInterval(timestamp => {

      this.explosions.forEach(e => e.timer--);
      this.explosions = this.explosions.filter(e => e.timer > 0)

      this.bombs.forEach((b, i) => {
        b.timer -= 1;
        if(b.timer <= -1) this.bombs.splice(i, 1);

        if(b.timer == 0) {
          this.explosions.push({ type: CONST.EXPLOSION_TYPE_CENTER, timer: 1, x: b.x, y: b.y });
          this.explosions.push({ type: CONST.EXPLOSION_TYPE_LEFT, timer: 1, x: b.x - 16, y: b.y });
          this.explosions.push({ type: CONST.EXPLOSION_TYPE_RIGHT, timer: 1, x: b.x + 16, y: b.y });
          this.explosions.push({ type: CONST.EXPLOSION_TYPE_TOP, timer: 1, x: b.x, y: b.y - 16 });
          this.explosions.push({ type: CONST.EXPLOSION_TYPE_BOTTOM, timer: 1, x: b.x, y: b.y + 16 });
        }

        Object
          .keys(this.players)
          .forEach((key, index) => {
            this.explosions.forEach((explosion) => {
              if(!distanceObjects(this.players[key], explosion)) {
                this.players[key].kill();
                setTimeout(() => {
                  let { x, y } = getRandomPositionOnField();
                  this.players[key].resurrect(x, y);
                }, 3 * 1000)
              }
            })
          });
      });

      timerCallback();
    }, 1 * 1000)
  }

  addPlayer(clientId) {

    let playerNumber = Object.keys(this.players).length + 1;
    let { x, y } = getRandomPositionOnField();

    this.players[clientId] = new Player({
      id: clientId,
      x: x,
      y: y,
      width: 16,
      height: 16,
      type: playerNumber,
      number: playerNumber
    });

    return this.players[clientId];
  }

  removePlayer(clientId) {
    delete this.players[clientId];
  }

  movePlayer(clientId, { direction }) {
    if(this.players[clientId].dead) return;

    let destX = this.players[clientId].x;
    let destY = this.players[clientId].y;

    switch(direction) {
      case 'up': destY -= 16; break;
      case 'down': destY += 16; break;
      case 'right': destX += 16; break;
      case 'left': destX -= 16; break;
    }

    // block outside of canvas
    if(
      destY >= this.height ||
      destY < 0 ||
      destX >= this.width ||
      destX < 0
    ) return;

    // Block on rocks
    for (var i = 0; i < this.tiles.length; i++) {
      let dis = distance({
        px: this.tiles[i].x,
        py: this.tiles[i].y,
        x: destX,
        y: destY,
        width: this.players[clientId].width,
        height: this.players[clientId].height,
      });

      if(!dis && this.tiles[i].type === 3) {
        return;
      }
    }

    // Block on bombs
    for (var i = 0; i < this.bombs.length; i++) {
      let dis = distance({
        px: this.bombs[i].x,
        py: this.bombs[i].y,
        x: destX,
        y: destY,
        width: this.players[clientId].width,
        height: this.players[clientId].height,
      });

      if(!dis) return;
    }

    // Block on players
    for (var p in this.players) {
      let dis = distance({
        px: this.players[p].x,
        py: this.players[p].y,
        x: destX,
        y: destY,
        width: this.players[clientId].width,
        height: this.players[clientId].height,
      });

      if(!dis) return;
    }

    this.players[clientId].x = destX;
    this.players[clientId].y = destY;

    this.explosions.forEach(e => {
      if(!distanceObjects(this.players[clientId], e)) {
        this.players[clientId].kill();
        setTimeout(() => {
          let { x, y } = getRandomPositionOnField();
          this.players[clientId].resurrect(x, y);
        }, 3 * 1000)
      }
    })
  }

  plantPlayer(clientId) {
    // only 3 bombs per player
    if(this.bombs.filter(b => b.from == this.players[clientId].id).length >= 10) return;

    this.bombs.push({
      from: this.players[clientId].id,
      timer: 3,
      x: this.players[clientId].x,
      y: this.players[clientId].y
    })
  }

  getData() {
    return {
      players: Object.keys(this.players).map((key, i) => { return this.players[key].serialize() }),
      tiles: this.tiles,
      bombs: this.bombs,
      explosions: this.explosions
    }
  }
}

var world = new World(() => {
  io.sockets.emit('update_world', world.getData())
});

io.on('connection', (socket) => {
  socket.on('player_join', (client) => {

    socket.clientId = client.id;

    world.addPlayer(client.id);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('player_move', (data) => {
    world.movePlayer(socket.clientId, data);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('player_plant', () => {
    world.plantPlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('disconnect', () => {
    world.removePlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
