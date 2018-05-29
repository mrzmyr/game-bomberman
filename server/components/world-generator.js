const { 
  TILE_TYPE_TREE_TOP_LEFT,
  TILE_TYPE_TREE_TOP_RIGHT,
  TILE_TYPE_TREE_BOTTOM_LEFT,
  TILE_TYPE_TREE_BOTTOM_RIGHT,
  TILE_TYPE_GRASS,
  TILE_TYPE_DIRT,
  TILE_TYPE_OBSTACLE_BUSH,
  TILE_TYPE_OBSTACLE_BOX,
  TILE_TYPE_OBSTACLE_BALL,
  TILE_TYPE_OBSTACLE_STONE_3D,
  TILE_TYPE_OBSTACLE_STONE_FLAT,
  TILE_TYPE_BOOST_BOMB
} = require('../../shared/constants.js');

const Tile = require('./tile');
const Boost = require('./boost');

function random(min, max, except = []) {
  let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return except.indexOf(randomNumber) !== -1 ? random(min, max, except) : randomNumber;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function treeTiles(x, y) {
  let tiles = [];

  tiles.push(new Tile({
    type: TILE_TYPE_TREE_TOP_LEFT,
    x: x,
    y: y,
    width: 16,
    height: 16
  }));

  tiles.push(new Tile({
    type: TILE_TYPE_TREE_TOP_RIGHT,
    x: x + 16,
    y: y,
    width: 16,
    height: 16
  }));

  tiles.push(new Tile({
    type: TILE_TYPE_TREE_BOTTOM_LEFT,
    x: x,
    y: y + 16,
    width: 16,
    height: 16
  }));

  tiles.push(new Tile({
    type: TILE_TYPE_TREE_BOTTOM_RIGHT,
    x: x + 16,
    y: y + 16,
    width: 16,
    height: 16
  }));

  return tiles;
}

class WorldGenerator {
  constructor(config) {
    this.config = config;
  }

  setupTiles() {
    const tileWidth = this.config.tileWidth;
    const tileHeight = this.config.tileHeight;
    const tileRows = this.config.tileRows;
    const tileColumns = this.config.tileColumns;

    var tiles = [];

    for (var i = 0; i < 8; i++) {
      treeTiles(random(2, tileRows - 4) * 16, random(2, tileColumns - 4) * 16).map(t => tiles.push(t));
    }

    // Grass
    for (var j = 1; j < tileRows - 1; j++) {
      for (var i = 1; i < tileColumns - 1; i++) {

        let newTile = new Tile({
          type: TILE_TYPE_GRASS,
          x: i * tileWidth,
          y: j * tileHeight,
          width: tileWidth,
          height: tileHeight
        })

        let tileFound = tiles.find((t => t.x == newTile.x && t.y == newTile.y))

        if(!tileFound) {
          tiles.push(newTile);
        }
      }
    }

    // Rocks

    for (var i = 0; i < tileColumns; i++) {
      tiles.push(new Tile({
        type: TILE_TYPE_OBSTACLE_STONE_3D,
        x: i * tileWidth,
        y: 0,
        width: tileWidth,
        height: tileHeight
      }));

      tiles.push(new Tile({
        type: TILE_TYPE_OBSTACLE_STONE_3D,
        x: i * tileWidth,
        y: tileWidth * (tileRows - 1),
        width: tileWidth,
        height: tileHeight
      }));
    }

    for (var i = 0; i < tileRows; i++) {
      tiles.push(new Tile({
        type: TILE_TYPE_OBSTACLE_STONE_3D,
        x: 0,
        y: i * tileHeight,
        width: tileWidth,
        height: tileHeight
      }));

      tiles.push(new Tile({
        type: TILE_TYPE_OBSTACLE_STONE_3D,
        x: tileWidth * (tileColumns - 1),
        y: i * tileHeight,
        width: tileWidth,
        height: tileHeight
      }));
    }


    // Random obstacles
    let nonObstacleTiles = tiles.filter(t => t.type == TILE_TYPE_GRASS);

    for (var i = 0; i < nonObstacleTiles.length; i++) {
      if(Math.random() > 0.8) {
        tiles[i].type = randomPick([TILE_TYPE_OBSTACLE_BALL, TILE_TYPE_OBSTACLE_BUSH, TILE_TYPE_OBSTACLE_BOX]);
      }
    }

    return tiles;
  }

  setupBoosts() {
    let boosts = [];
    let nonObstacleTiles = this.tiles.filter(t => t.type == TILE_TYPE_GRASS);

    for (var i = 0; i < nonObstacleTiles.length; i++) {
      if(Math.random() > 0.99) {
        let newBoost = new Boost({
          type: TILE_TYPE_BOOST_BOMB,
          x: nonObstacleTiles[i].x,
          y: nonObstacleTiles[i].y,
          width: this.config.tileWidth,
          height: this.config.tileHeight
        });
        boosts.push(newBoost);
      }
    }

    return boosts;
  }

  generate() {
    this.tiles = this.setupTiles();
    this.boosts = this.setupBoosts();
  }

  getTiles() {
    return this.tiles;
  }

  getBoosts() {
    return this.boosts;
  }
}

module.exports = WorldGenerator;