module.exports = class Bomb {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.timer = options.timer;

    this.from = options.from;
    this.detonated = false;
    this.detonatedFn = options.detonatedFn;
    this.updateFn = options.updateFn;

    setTimeout(() => { this.tick(); }, 1000);
  }

  tick() {
    if(this.timer == 0) {
      return this.explode();
    }

    this.timer--;
    setTimeout(() => { this.tick(); }, 1000);
    this.updateFn();
  }

  explode() {
    this.detonated = true;
    this.detonatedFn();
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      detonated: this.detonated,
      timer: this.timer
    }
  }
}