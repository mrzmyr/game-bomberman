class Explosion {
  constructor(context, options) {
    this.context = context;

    this.img = sprite.get('assets/texture.png');

    this.width = 16;
    this.height = 16;

    this.x = options.x;
    this.y = options.y;

    this.type = options.type;
  }

  draw() {
    if(this.img) {
      var dx, dy;

      switch(this.type) {
        case EXPLOSION_TYPE_TOP:
          dx = 16 * 14
          dy = 16 * 0
          break;
        case EXPLOSION_TYPE_LEFT:
          dx = 16 * 0
          dy = 16 * 5
          break;
        case EXPLOSION_TYPE_RIGHT:
          dx = 16 * 3
          dy = 16 * 5
          break;
        case EXPLOSION_TYPE_BOTTOM:
          dx = 16 * 14
          dy = 16 * 2
          break;
        case EXPLOSION_TYPE_CENTER:
          dx = 16 * 2
          dy = 16 * 5
          break;
      }
      this.context.drawImage(
        this.img,
        dx,
        dy,
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