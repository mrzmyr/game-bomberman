class Tile {
  constructor(context, options) {
    this.context = context;

    this.type = options.type;

    this.img = sprite.get('assets/texture.png');

    this.width = options.width;
    this.height = options.height;

    this.x = options.x;
    this.y = options.y;

    this.typeX = this.type * 16;
  }

  draw() {
    if(this.img)
      this.context.drawImage(
        this.img,
        this.typeX,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
  }
}
