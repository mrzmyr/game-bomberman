const TEXTURE_TYPE_TOP_X = 16 * 14;
const TEXTURE_TYPE_TOP_Y = 16 * 0;
const TEXTURE_TYPE_LEFT_X = 16 * 0;
const TEXTURE_TYPE_LEFT_Y = 16 * 5;
const TEXTURE_TYPE_RIGHT_X = 16 * 3;
const TEXTURE_TYPE_RIGHT_Y = 16 * 5;
const TEXTURE_TYPE_BOTTOM_X = 16 * 14;
const TEXTURE_TYPE_BOTTOM_Y = 16 * 2;
const TEXTURE_TYPE_CENTER_X = 16 * 2;
const TEXTURE_TYPE_CENTER_Y = 16 * 5;

class Explosion {
  constructor(context, options) {
    this.context = context;

    this.img = sprite.get('assets/texture.png');

    this.x = options.x;
    this.y = options.y;

    this.timer = options.timer;

    audioPlayer.play('explosion');
    this.animateGame();
  }

  animateGame() {
    document.querySelector('#game').classList.add('effect-shake');
    setTimeout(() => {
      document.querySelector('#game').classList.remove('effect-shake');
    }, 400)
  }

  drawTile(x, y, sx, sy) {
    this.context.drawImage(this.img, sx, sy, 16, 16, x, y, 16, 16);
  }

  draw() {
    if(this.img) {
      this.drawTile(this.x, this.y - 16, TEXTURE_TYPE_TOP_X, TEXTURE_TYPE_TOP_Y)
      this.drawTile(this.x, this.y + 16, TEXTURE_TYPE_BOTTOM_X, TEXTURE_TYPE_BOTTOM_Y)
      this.drawTile(this.x + 16, this.y, TEXTURE_TYPE_RIGHT_X, TEXTURE_TYPE_RIGHT_Y)
      this.drawTile(this.x - 16, this.y, TEXTURE_TYPE_LEFT_X, TEXTURE_TYPE_LEFT_Y)
      this.drawTile(this.x, this.y, TEXTURE_TYPE_CENTER_X, TEXTURE_TYPE_CENTER_Y)
    }
  }
}