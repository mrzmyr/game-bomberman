module.exports = class Player {
  constructor(options) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.type = options.type;
    this.number = options.number;

    this.dead = false;
    this.dies = 0;
    this.timeout = 0; // timeout until resurrect
  }

  kill() {
    this.dead = true;
    this.dies++;
  }

  resurrect(x, y) {
    this.dead = false;
    this.x = x;
    this.y = y;
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
      dead: this.dead,
      dies: this.dies
    }
  }
}

