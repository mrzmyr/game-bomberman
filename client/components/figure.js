class Figure {
  constructor(context, options) {
    this.context = context;

    this.img = sprite.get('assets/texture.png');

    this.width = 16;
    this.height = 16;

    this.x = options.x;
    this.y = options.y;

    this.type = options.type;

    this.sliceX = 16;
    this.sliceY = 16 * this.type;

    this.dead = options.dead;

    if(this.dead) {
      this.sliceX = 16 * 9;
      this.sliceY = 16 * 0;
    }
  }

  draw() {
    if(this.img)
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
