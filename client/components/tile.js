class Tile {
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
    if(this.img)
      if([
        TILE_TYPE_GRASS,
        TILE_TYPE_TREE_TOP_LEFT,
        TILE_TYPE_TREE_TOP_RIGHT,
        TILE_TYPE_TREE_BOTTOM_LEFT,
        TILE_TYPE_TREE_BOTTOM_RIGHT,
        TILE_TYPE_OBSTACLE_BALL,
        TILE_TYPE_OBSTACLE_BUSH,
        TILE_TYPE_OBSTACLE_BOX,
      ].indexOf(this.type) !== -1) {
        this.context.drawImage(
          this.img,
          16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }

      if(this.type === TILE_TYPE_TREE_TOP_LEFT) {
        this.context.drawImage(
          this.img,
          11 * 16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_TREE_TOP_RIGHT) {
        this.context.drawImage(
          this.img,
          12 * 16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_TREE_BOTTOM_LEFT) {
        this.context.drawImage(
          this.img,
          11 * 16, 16,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_TREE_BOTTOM_RIGHT) {
        this.context.drawImage(
          this.img,
          12 * 16, 16,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_OBSTACLE_STONE_3D) {
        this.context.drawImage(
          this.img,
          10 * 16, 4 * 16,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_OBSTACLE_STONE_FLAT) {
        this.context.drawImage(
          this.img,
          10 * 16, 5 * 16,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_OBSTACLE_BALL) {
        this.context.drawImage(
          this.img,
          13 * 16, 3 * 16,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_OBSTACLE_BUSH) {
        this.context.drawImage(
          this.img,
          3 * 16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_DIRT) {
        this.context.drawImage(
          this.img,
          0, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
      if(this.type === TILE_TYPE_OBSTACLE_BOX) {
        this.context.drawImage(
          this.img,
          9 * 16, 0,
          this.width, this.height,
          this.x, this.y, this.width, this.height
        );
      }
  }
}