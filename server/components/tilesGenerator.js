var Tile = require('./tile');

module.exports = function setupTiles({ tileWidth, tileHeight, tileRows, tileColumns }) {
  var tiles = [];

  // Grass

  for (var j = 0; j < tileRows; j++) {
    for (var i = 0; i < tileColumns; i++) {
      tiles.push(new Tile({
        type: 1,
        x: i * tileWidth,
        y: j * tileHeight,
        width: tileWidth,
        height: tileHeight
      }));
    }
  }

  // Rocks

  for (var i = 0; i < tileColumns; i++) {
    tiles.push(new Tile({
      type: 3,
      x: i * tileWidth,
      y: 0,
      width: tileWidth,
      height: tileHeight
    }));
    tiles.push(new Tile({
      type: 3,
      x: i * tileWidth,
      y: tileWidth * (tileRows - 1),
      width: tileWidth,
      height: tileHeight
    }));
  }

  for (var i = 0; i < tileRows; i++) {
    tiles.push(new Tile({
      type: 3,
      x: 0,
      y: i * tileHeight,
      width: tileWidth,
      height: tileHeight
    }));

    tiles.push(new Tile({
      type: 3,
      x: tileWidth * (tileColumns - 1),
      y: i * tileHeight,
      width: tileWidth,
      height: tileHeight
    }));
  }

  return tiles;
}