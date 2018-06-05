module.exports = class Player {
  constructor(options) {
    this.id = options.id;
    this.username = options.username;
    this.color = options.color;

    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.type = options.type;

    this.updateFn = options.updateFn;

    this.boosts = [];

    this.dead = false;
    this.timeout = 0; // timeout until resurrect
  }

  kill() {
    this.dead = true;
  }

  resurrect(x, y) {
    this.dead = false;
    this.x = x;
    this.y = y;
  }

  addBoost(boostType) {
    let index = this.boosts.push(boostType) - 1;

    setTimeout(() => {
      this.boosts.splice(index, 1);
      this.updateFn();
    }, 10 * 1000)
  }

  serialize() {
    return {
      id: this.id,
      username: this.username,
      stats: this.stats,
      dead: this.dead,
      x: this.x,
      y: this.y,
      color: this.color,
      type: this.type,
      direction: this.direction,
      boosts: this.boosts
    }
  }
}

