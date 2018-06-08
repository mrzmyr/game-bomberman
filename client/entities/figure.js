class Figure extends Texture {
  constructor(context, options) {
    super(context, options);

    this.id = options.id;
    this.color = options.color;
    this.username = options.username;
    this.type = options.type;
    this.direction = options.direction;
    this.dead = options.dead;

    this.sliceX = 16;
    this.sliceY = 16 * this.type;
  }

  draw() {
    if(this.img) {
      switch(this.direction) {
        case FIGURE_DIRECTION_TOP:
          this.sliceX = 0;
          break;
        case FIGURE_DIRECTION_BOTTOM:
          this.sliceX = 16;
          break;
        case FIGURE_DIRECTION_RIGHT:
          this.sliceX = 5 * 16;
          break;
        case FIGURE_DIRECTION_LEFT:
          this.sliceX = 7 * 16;
          break;
      }

      if(this.dead) {
        this.sliceX = 16 * 13;
        this.sliceY = 16 * 0;
      }

      this.context.font = "11px monospace";
      this.context.textAlign = "center";
      this.context.fillStyle = this.color;
      this.context.fillText(this.username, this.x + 4, this.y);

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
