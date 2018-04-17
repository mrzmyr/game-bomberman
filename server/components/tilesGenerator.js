var Tile = require('./tile');

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
} = require('../../shared/constants.js');

module.exports = function setupTiles({ tileWidth, tileHeight, tileRows, tileColumns }) {
  var tiles = [];

  for (var i = 0; i < 8; i++) {
    treeTiles(random(2, tileRows - 4) * 16, random(2, tileColumns - 4) * 16).map(t => tiles.push(t));
  }

  // Grass
  for (var j = 1; j < tileRows - 1; j++) {
    for (var i = 1; i < tileColumns - 1; i++) {

      let newTile = new Tile({
        type: randomPick([TILE_TYPE_GRASS]),
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
      type: TILE_TYPE_OBSTACLE_BUSH,
      x: i * tileWidth,
      y: 0,
      width: tileWidth,
      height: tileHeight
    }));

    tiles.push(new Tile({
      type: TILE_TYPE_OBSTACLE_BUSH,
      x: i * tileWidth,
      y: tileWidth * (tileRows - 1),
      width: tileWidth,
      height: tileHeight
    }));
  }

  for (var i = 0; i < tileRows; i++) {
    tiles.push(new Tile({
      type: TILE_TYPE_OBSTACLE_BUSH,
      x: 0,
      y: i * tileHeight,
      width: tileWidth,
      height: tileHeight
    }));

    tiles.push(new Tile({
      type: TILE_TYPE_OBSTACLE_BUSH,
      x: tileWidth * (tileColumns - 1),
      y: i * tileHeight,
      width: tileWidth,
      height: tileHeight
    }));
  }

  for (var i = 0; i < Math.round(tileRows*tileColumns*0.1); i++) {
    let newTile = new Tile({
      type: randomPick([TILE_TYPE_OBSTACLE_BALL, TILE_TYPE_OBSTACLE_BUSH, TILE_TYPE_OBSTACLE_BOX]),
      x: random(1, tileRows - 2) * 16,
      y: random(1, tileColumns - 2) * 16,
      width: tileWidth,
      height: tileHeight
    });

    let tileFound = tiles.find((t => t.x == newTile.x && t.y == newTile.y))

    if(tileFound) {
      if([
        TILE_TYPE_TREE_BOTTOM_RIGHT,
        TILE_TYPE_TREE_BOTTOM_LEFT,
        TILE_TYPE_TREE_TOP_LEFT,
        TILE_TYPE_TREE_TOP_RIGHT
      ].indexOf(tileFound.type) === -1) {
        tiles[tiles.indexOf(tileFound)] = newTile;
      }
    } else {
      tiles.push(newTile);
    }
  }

  return tiles;
}