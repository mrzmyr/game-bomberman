const { 
  TILE_TYPE_GRASS, 
  TILE_TYPE_OBSTACLE_BUSH,
  TILE_TYPE_OBSTACLE_BALL,
  TILE_TYPE_OBSTACLE_BOX,
  TILE_TYPE_OBSTACLE_STONE_3D,
  TILE_TYPE_OBSTACLE_STONE_FLAT,
  TILE_TYPE_TREE_BOTTOM_RIGHT,
  TILE_TYPE_TREE_BOTTOM_LEFT,
  TILE_TYPE_TREE_TOP_LEFT,
  TILE_TYPE_TREE_TOP_RIGHT,
  FIGURE_DIRECTION_TOP,
  FIGURE_DIRECTION_BOTTOM,
  FIGURE_DIRECTION_RIGHT,
  FIGURE_DIRECTION_LEFT,
  TILE_TYPE_BOOST_BOMB,
  BOOST_TYPE_BOMB,
} = require('../../shared/constants.js');

const strToColor = require('string-to-color')
const randomPick = require('random-pick')

const distance = require('./distance.js')
const distanceObjects = require('./distance-objects.js')

const PlayerStatistics = require('./player-statistics');
const WorldGenerator = require('./world-generator');

const Boost = require('../entities/boost');
const Player = require('../entities/player');
const Bomb = require('../entities/bomb');
const Explosion = require('../entities/explosion');

module.exports = class World {
  constructor(updateFn) {
    const worldGenerator = new WorldGenerator({
      tileColumns: 32,
      tileRows: 32,
      tileWidth: 16,
      tileHeight: 16
    });

    worldGenerator.generate();

    this.playerStats = new PlayerStatistics();
    this.players = {};

    this.tiles = worldGenerator.getTiles();
    this.boosts = worldGenerator.getBoosts();
    this.bombs = [];
    this.explosions = [];

    this.width = worldGenerator.getWidth();
    this.height = worldGenerator.getHeight();

    this.updateFn = updateFn;
  }

  getRandomPositionForNewPlayer(clientId) {
    let nonObstacleTiles = this.tiles.filter(t => t.type == TILE_TYPE_GRASS);
    let nonObstacleTile = randomPick(nonObstacleTiles)[0];

    return { x: nonObstacleTile.x, y: nonObstacleTile.y };
  }

  onExplosion() {
    this.explosions.forEach((explosion) => {

      // check if player got hit
      Object.keys(this.players).forEach((key, index) => {
        if(explosion.interfersWith(this.players[key])) {

          this.playerStats.increaseDies(key);
          this.players[key].kill();

          // make sure you didn't kill yourself
          if(this.players[explosion.from] && !this.players[explosion.from].dead) {
            this.playerStats.increaseKills(explosion.from);
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
          this.boosts.push(new Boost({
            type: TILE_TYPE_BOOST_BOMB,
            x: boxTile.x,
            y: boxTile.y
          }))
        }
      })
    });
  }

  addPlayer(client) {

    if(!this.playerStats.get(client.id)) {
      this.playerStats.add(client.id);
    }

    let { x, y } = this.getRandomPositionForNewPlayer(client.id);

    this.players[client.id] = new Player({
      updateFn: this.updateFn,
      id: client.id,
      username: client.username,
      color: strToColor(client.id),
      x: x,
      y: y,
      width: 16,
      height: 16,
      direction: FIGURE_DIRECTION_BOTTOM,
      type: randomPick([1,2,3,4])[0]
    });

    return this.players[client.id];
  }

  removePlayer(clientId) {
    this.playerStats.remove(clientId)
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
          TILE_TYPE_OBSTACLE_STONE_3D,
          TILE_TYPE_OBSTACLE_STONE_FLAT,
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

    this.boosts.forEach(b => {
      if(!distanceObjects(this.players[clientId], b)) {
        this.boosts.splice(this.boosts.indexOf(b), 1);
        this.updateFn();
        if(b.type == TILE_TYPE_BOOST_BOMB) {
          this.players[clientId].addBoost(BOOST_TYPE_BOMB);
        }
      }
    })

    this.explosions.forEach(e => {
      if(!distanceObjects(this.players[clientId], e)) {
        if(explosion.from === clientId) {
          this.playerStats.increaseKills(clientId);
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
    let allowedBombs = this.players[clientId].boosts.indexOf(BOOST_TYPE_BOMB) !== -1 ? 5 : 1;

    if(this.bombs.filter(b => b.from == this.players[clientId].id).length >= allowedBombs) {
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
        this.players[key].stats = this.playerStats.get(key);
        return this.players[key].serialize()
      }),
      tiles: this.tiles.map(t => t.serialize()),
      bombs: this.bombs.map(b => b.serialize()),
      explosions: this.explosions.map(e => e.serialize()),
      boosts: this.boosts.map(b => b.serialize())
    }
  }
}
