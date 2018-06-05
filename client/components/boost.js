class Boost extends Texture {
  constructor(context, options) {
    super(context, options);

    this.type = options.type;

    this.sliceX = 4 * 16;
    this.sliceY = 0;
  }

  draw() {
    if(this.img) {
      if(this.type === TILE_TYPE_BOOST_BOMB) {
        this.context.drawImage(
          this.img,
          this.sliceX, 
          this.sliceY,
          this.width, 
          this.height,
          this.x, this.y, 
          this.width, 
          this.height
        );
      }
    }
  }
}