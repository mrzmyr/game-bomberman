class Bomb extends Texture {
  constructor(context, options) {
    super(context, options);

    this.timer = options.timer;
    this.detonated = options.detonated;

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
