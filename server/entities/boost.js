module.exports = class Boost {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.type = options.type;
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      type: this.type
    }
  }
}