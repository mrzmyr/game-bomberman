class Bomb {
  constructor(context, options) {
    this.context = context;

    this.img = sprite.get('assets/texture.png');

    this.width = 16;
    this.height = 16;

    this.timer = options.timer;

    this.x = options.x;
    this.y = options.y;

    this.sliceX = 16 * 5 + this.timer * 16;
    this.sliceY = 16 * 5;
  }

  draw() {
    if(this.img) {
      this.context.drawImage(
        this.img,
        this.sliceX,
        this.sliceY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}
