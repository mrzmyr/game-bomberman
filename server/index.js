var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = 8080;

app.use(express.static('client'));
app.use(express.static('shared'));

const { 
  TILE_TYPE_GRASS, 
  TILE_TYPE_OBSTACLE_BUSH,
  TILE_TYPE_OBSTACLE_BALL,
  TILE_TYPE_OBSTACLE_BOX,
  TILE_TYPE_TREE_BOTTOM_RIGHT,
  TILE_TYPE_TREE_BOTTOM_LEFT,
  TILE_TYPE_TREE_TOP_LEFT,
  TILE_TYPE_TREE_TOP_RIGHT,
  FIGURE_DIRECTION_TOP,
  FIGURE_DIRECTION_BOTTOM,
  FIGURE_DIRECTION_RIGHT,
  FIGURE_DIRECTION_LEFT,
} = require('../shared/constants.js');

function strToColor(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var distance = require('./lib/distance.js')
var distanceObjects = require('./lib/distance-objects.js')

var PlayerStatistics = require('./components/player-statistics');
var tilesGenerator = require('./components/tilesGenerator');
var Player = require('./components/player');
var Bomb = require('./components/bomb');
var Explosion = require('./components/explosion');

let playerStats = new PlayerStatistics();

class World {
  constructor(updateFn) {
    this.config = {
      tileColumns: 32,
      tileRows: 32,
      tileWidth: 16,
      tileHeight: 16
    }

    this.players = {};
    this.tiles = tilesGenerator(this.config);
    this.bombs = [];
    this.explosions = [];

    this.width = this.config.tileColumns * this.config.tileWidth;
    this.height = this.config.tileRows * this.config.tileHeight;

    this.updateFn = updateFn;
  }

  getRandomPositionForNewPlayer(clientId) {
    let nonObstacleTiles = this.tiles.filter(t => t.type == TILE_TYPE_GRASS);
    let nonObstacleTile = randomPick(nonObstacleTiles);

    return { x: nonObstacleTile.x, y: nonObstacleTile.y };
  }

  onExplosion() {
    this.explosions.forEach((explosion) => {

      // check if player got hit
      Object.keys(this.players).forEach((key, index) => {
        if(explosion.interfersWith(this.players[key])) {

          playerStats.increaseDies(key);
          this.players[key].kill();

          // make sure you didn't kill yourself
          if(this.players[explosion.from] && !this.players[explosion.from].dead) {
            playerStats.increaseKills(explosion.from);
          }

          setTimeout(() => {
            let { x, y } = this.getRandomPositionForNewPlayer(key);
            // make sure the player didn't leave
            if(this.players[key]) this.players[key].resurrect(x, y);
            this.updateFn();
          }, 3 * 1000)
        }
      })


      // check if ball tiles should explode
      let ballTiles = this.tiles.filter(t => t.type === TILE_TYPE_OBSTACLE_BALL);

      ballTiles.forEach(tile => {
        if(explosion.interfersWith(tile)) {
          let newExplosion = new Explosion({ 
            x: tile.x,
            y: tile.y,
            timer: 0.2,
            from: explosion.from,
            removeFn: () => {
              this.explosions.splice(0, 1);
              this.updateFn();
            }
          });
          this.explosions.push(newExplosion)
          this.tiles[this.tiles.indexOf(tile)].type = TILE_TYPE_GRASS;
          this.onExplosion();
        }
      })

      // check if box tile got destroyed
      let boxTiles = this.tiles.filter(t => t.type === TILE_TYPE_OBSTACLE_BOX);

      boxTiles.forEach(boxTile => {
        if(explosion.interfersWith(boxTile)) {
          this.tiles[this.tiles.indexOf(boxTile)].type = TILE_TYPE_GRASS;
        }
      })
    });
  }

  addPlayer(client) {

    if(!playerStats.get(client.id)) {
      playerStats.add(client.id);
    }

    let { x, y } = this.getRandomPositionForNewPlayer(client.id);

    this.players[client.id] = new Player({
      id: client.id,
      username: client.username,
      color: strToColor(client.id),
      x: x,
      y: y,
      width: 16,
      height: 16,
      direction: FIGURE_DIRECTION_BOTTOM,
      type: randomPick([1,2,3,4])
    });

    return this.players[client.id];
  }

  removePlayer(clientId) {
    playerStats.remove(clientId)
    delete this.players[clientId];
  }

  movePlayer(clientId, { direction }) {
    if(
      !this.players[clientId] ||
      this.players[clientId].dead
    ) return;

    let destX = this.players[clientId].x;
    let destY = this.players[clientId].y;

    switch(direction) {
      case 'up': 
        destY -= 16; 
        this.players[clientId].direction = FIGURE_DIRECTION_TOP;
        break;
      case 'down': 
        destY += 16; 
        this.players[clientId].direction = FIGURE_DIRECTION_BOTTOM;
        break;
      case 'right': 
        destX += 16; 
        this.players[clientId].direction = FIGURE_DIRECTION_RIGHT;
        break;
      case 'left': 
        destX -= 16; 
        this.players[clientId].direction = FIGURE_DIRECTION_LEFT;
        break;
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

      if(
        !dis && 
        [
          TILE_TYPE_OBSTACLE_BUSH, 
          TILE_TYPE_OBSTACLE_BALL,
          TILE_TYPE_OBSTACLE_BOX,
          TILE_TYPE_TREE_BOTTOM_RIGHT,
          TILE_TYPE_TREE_BOTTOM_LEFT,
          TILE_TYPE_TREE_TOP_LEFT,
          TILE_TYPE_TREE_TOP_RIGHT
        ].indexOf(this.tiles[i].type) !== -1
      ) {
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
        console.log(explosion.from, clientId);
        if(explosion.from === clientId) {
          playerStats.increaseKills(clientId);
        }
        this.players[clientId].kill();
        setTimeout(() => {
          let { x, y } = this.getRandomPositionForNewPlayer(clientId);
          this.players[clientId].resurrect(x, y);
        }, 3 * 1000)
      }
    })
  }

  plantPlayer(clientId) {
    // 10 bombs per player
    if(this.bombs.filter(b => b.from == this.players[clientId].id).length >= 10) {
      return;
    }

    // prevent player from planting twice
    for (var i = 0; i < this.bombs.length; i++) {
      if(!distanceObjects(this.players[clientId], this.bombs[i])) {
        return;
      }
    }

    var bx = this.players[clientId].x;
    var by = this.players[clientId].y;
    var bi = this.bombs.length;
    var ei = this.explosions.length;

    var bomb = new Bomb({
      from: clientId,
      timer: 3,
      x: this.players[clientId].x,
      y: this.players[clientId].y,
      updateFn: this.updateFn,
      detonatedFn: () => {
        this.bombs.splice(0, 1);
        var explosion = new Explosion({ 
          x: bx,
          y: by,
          from: clientId,
          timer: 0.2,
          removeFn: () => {
            this.explosions.splice(0, 1);
            this.updateFn();
          }
        });
        this.explosions.push(explosion);
        this.onExplosion();
        this.updateFn();
      }
    });

    this.bombs.push(bomb)
  }

  getData() {
    return {
      players: Object.keys(this.players).map((key, i) => { 
        this.players[key].stats = playerStats.get(key);
        return this.players[key].serialize() 
      }),
      tiles: this.tiles,
      bombs: this.bombs.map(b => b.serialize()),
      explosions: this.explosions.map(e => e.serialize())
    }
  }
}

var world = new World(function updateFn() {
  io.sockets.emit('update_world', world.getData())
});

io.on('connection', (socket) => {
  socket.emit('initialize_world', world.getData())

  socket.on('player_join', (client) => {

    socket.clientId = client.id;
    socket.clientUsername = client.username;

    let newPlayer = world.addPlayer(client);

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

  socket.on('player_leave', () => {
    world.removePlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('latency', (timestamp, fn) => fn(timestamp)); 
});

http.listen(PORT, function(){
  console.log(`listening on *:${PORT}`);
});
