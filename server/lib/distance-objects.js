var distance = require('./distance.js');

function distanceObjects(a, b) {
  return distance({
    px: a.x,
    py: a.y,
    x: b.x,
    y: b.y,
    width: 16,
    height: 16
  });
}

module.exports = distanceObjects;