class Boost {
  constructor(context, options) {
    this.context = context;

    this.type = options.type;

    this.img = sprite.get('assets/texture.png');

    this.width = options.width;
    this.height = options.height;

    this.x = options.x;
    this.y = options.y;
  }

  draw() {
    if(this.img) {
      if(this.type === TILE_TYPE_BOOST_BOMB) {
        this.context.drawImage(
          this.img,
          4 * 16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
    }
  }
}