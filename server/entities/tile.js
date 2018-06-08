module.exports = class Tile {
  constructor(options) {
    this.type = options.type;

    this.width = options.width;
    this.height = options.height;

    this.x = options.x;
    this.y = options.y;
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
    }
  }
}