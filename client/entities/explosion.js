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

class Explosion extends Texture {
  constructor(context, options) {
    super(context, options);

    this.timer = options.timer;
    this.animateGame();

    audioPlayer.play('explosion');
  }

  animateGame() {
    let gameDiv = document.querySelector('#game');

    gameDiv.classList.add('effect-shake');

    setTimeout(() => {
      document.querySelector('#game').classList.remove('effect-shake');
    }, 400)
  }

  drawTile(x, y, sx, sy) {
    this.context.drawImage(this.img, sx, sy, this.width, this.height, x, y, this.width, this.height);
  }

  draw() {
    if(this.img) {
      this.drawTile(this.x, this.y - this.height, TEXTURE_TYPE_TOP_X, TEXTURE_TYPE_TOP_Y)
      this.drawTile(this.x, this.y + this.height, TEXTURE_TYPE_BOTTOM_X, TEXTURE_TYPE_BOTTOM_Y)
      this.drawTile(this.x + this.width, this.y, TEXTURE_TYPE_RIGHT_X, TEXTURE_TYPE_RIGHT_Y)
      this.drawTile(this.x - this.width, this.y, TEXTURE_TYPE_LEFT_X, TEXTURE_TYPE_LEFT_Y)
      this.drawTile(this.x, this.y, TEXTURE_TYPE_CENTER_X, TEXTURE_TYPE_CENTER_Y)
    }
  }
}