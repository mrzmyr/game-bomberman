function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

class Sprite {
  constructor(props) {
    this.storage = {};
  }

  preload(src) {
    return new Promise((resolve, reject) => {
      let slugSrc = slugify(src);
      var img = new Image();
      img.src = src;
      img.onload = () => {
        this.storage[slugSrc] = img;
        return resolve(img);
      }
    });
  }

  get(src) {
    let slugSrc = slugify(src);
    return this.storage[slugSrc];
  }
}

sprite = new Sprite();