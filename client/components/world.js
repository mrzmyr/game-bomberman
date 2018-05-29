function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);  
}

class World {
  constructor(data) {
    this.players = [];
    this.bombs = [];
    this.explosions = [];
    this.boosts = [];

    this.org_canvas = document.getElementById("canvasOrg");
    this.org_context = this.org_canvas.getContext("2d");

    this.tmp_canvas = document.getElementById("canvasTmp");
    this.tmp_context = this.tmp_canvas.getContext("2d");

    this.bg_canvas = document.getElementById("canvasBg");
    this.bg_context = this.bg_canvas.getContext("2d");

    this.setupCanvas(data);

    window.addEventListener('resize', () => {
      this.setupCanvas(data);
    })
  }

  setupCanvas(initialData) {
    let windowHeight = 512;
    let windowWidth = 512;

    let devicePixelRatio = window.devicePixelRatio;

    this.org_canvas.width = windowWidth;
    this.org_canvas.height = windowHeight;

    this.tmp_canvas.width = windowWidth * devicePixelRatio;
    this.tmp_canvas.height = windowHeight * devicePixelRatio;

    this.bg_canvas.width = windowWidth * devicePixelRatio;
    this.bg_canvas.height = windowHeight * devicePixelRatio;

    this.updateTiles(initialData.tiles);
  }

  updateTiles(tiles) {
    this.tiles = tiles.map(t => {
      return new Tile(this.bg_context, t);
    });

    this.tiles.map(t => t.draw());
  }

  update(data) {

    if(this.lastData) {
      if(!deepEqual(this.lastData.tiles, data.tiles)) {
        this.updateTiles(data.tiles);
      }

      if(!deepEqual(this.lastData.players, data.players)) {
        this.players = data.players.map(t => {
          return new Figure(this.tmp_context, t);
        });
      }

      if(!deepEqual(this.lastData.bombs, data.bombs)) {
        this.bombs = data.bombs.map(t => {
          return new Bomb(this.tmp_context, t);
        });
      }

      if(!deepEqual(this.lastData.explosions, data.explosions)) {
        this.explosions = data.explosions.map(t => {
          return new Explosion(this.tmp_context, t);
        });
      }

      if(!deepEqual(this.lastData.boosts, data.boosts)) {
        this.boosts = data.boosts.map(t => {
          return new Boost(this.tmp_context, t);
        });
      }

    } else {
      this.players = data.players.map(t => {
        return new Figure(this.tmp_context, t);
      });
      this.bombs = data.bombs.map(t => {
        return new Bomb(this.tmp_context, t);
      });
      this.explosions = data.explosions.map(t => {
        return new Explosion(this.tmp_context, t);
      });
      this.boosts = data.boosts.map(t => {
        return new Boost(this.tmp_context, t);
      });
    }

    this.lastData = data;
  }

  draw() {
    this.org_context.clearRect(0, 0, this.org_canvas.width, this.org_canvas.height)

    var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;

    var me = this.players.filter(p => p.id == this.clientId)[0];

    this.xView = this.xView || 0;
    this.yView = this.yView || 0;

    var wView = this.org_canvas.width;
    var hView = this.org_canvas.height;

    var followed;

    if(!me) {
      followed = {
        x: this.org_canvas.width / 2,
        y: this.org_canvas.height / 2
      }
    } else {
      followed = me;
    }


    var xDeadZone = this.org_canvas.width / 2;
    var yDeadZone = this.org_canvas.height / 2;

    // moves camera on horizontal axis based on followed object position
    if((followed.x - this.xView  + xDeadZone) > wView) {
      this.xView = followed.x - (wView - xDeadZone);
    } else if(followed.x  - xDeadZone < this.xView) {
      this.xView = followed.x - xDeadZone;
    }

    // moves camera on vertical axis based on followed object position
    if(followed.y - this.yView + yDeadZone > hView) {
      this.yView = followed.y - (hView - yDeadZone);
    } else if(followed.y - yDeadZone < this.yView) {
      this.yView = followed.y - yDeadZone;
    }

    sx = Math.min(wView, Math.max(0, this.xView));
    sy = Math.min(hView, Math.max(0, this.yView));

    sWidth = this.org_canvas.width;
    sHeight = this.org_canvas.height;

    // if cropped image is smaller than canvas we need to change the source dimensions
    if(this.tmp_canvas.width - sx < sWidth){
      sWidth = this.tmp_canvas.width - sx;
    }
    if(this.tmp_canvas.height - sy < sHeight){
      sHeight = this.tmp_canvas.height - sy; 
    }

    dx = 0;
    dy = 0;

    dWidth = sWidth;
    dHeight = sHeight;

    this.org_context.drawImage(this.tmp_canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    this.tmp_context.drawImage(this.bg_canvas, 0, 0);
    
    this.bombs.forEach(p => p.draw());
    this.explosions.forEach(p => p.draw());
    this.boosts.forEach(p => p.draw());
    this.players.forEach(p => p.draw());
  }
}
