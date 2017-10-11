class World {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = canvas.getContext("2d");

    this.players = [];
    this.tiles = [];
    this.bombs = [];
    this.explosions = [];
  }

  update(data) {
    this.players = data.players.map(t => {
      return new Figure(this.context, t);
    });
    this.tiles = data.tiles.map(t => {
      return new Tile(this.context, t);
    });
    this.bombs = data.bombs.map(t => {
      return new Bomb(this.context, t);
    });
    this.explosions = data.explosions.map(t => {
      return new Explosion(this.context, t);
    });
  }

  draw() {
    this.context
      .clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.tiles.forEach(p => p.draw());
    this.bombs.forEach(p => p.draw());
    this.explosions.forEach(p => p.draw());
    this.players.forEach(p => p.draw());
  }
}
