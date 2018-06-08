class Texture {
  constructor(context, options) {
    this.context = context;

    this.img = sprite.get('assets/texture.png');

    this.x = options.x || 0;
    this.y = options.y || 0;

    this.width = options.width || 16;
    this.height = options.height || 16;

    this.sliceX = 0;
    this.sliceY = 0;
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