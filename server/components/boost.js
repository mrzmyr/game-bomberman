module.exports = class Boost {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.type = options.type;
    this.width = options.width;
    this.height = options.height;
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
      width: this.width,
      height: this.height,
    }
  }
}