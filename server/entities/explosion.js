var distance = require('../components/distance.js')

module.exports = class Explosion {
  constructor(options) {

    this.x = options.x;
    this.y = options.y;

    this.from = options.from;
    
    this.timer = options.timer;
    this.removeFn = options.removeFn;

    setTimeout(() => { this.removeFn() }, this.timer * 1000)
  }

  interfersWith(o) {
    var a = distance({ px: o.x, py: o.y, x: this.x, y: this.y, width: 16, height: 16 });
    var b = distance({ px: o.x, py: o.y, x: this.x + 16, y: this.y, width: 16, height: 16 });
    var c = distance({ px: o.x, py: o.y, x: this.x - 16, y: this.y, width: 16, height: 16 });
    var d = distance({ px: o.x, py: o.y, x: this.x, y: this.y - 16, width: 16, height: 16 });
    var e = distance({ px: o.x, py: o.y, x: this.x, y: this.y + 16, width: 16, height: 16 });

    return (a == 0 || b == 0 || c == 0 || d == 0 || e == 0);
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      timer: this.timer
    }
  }
}