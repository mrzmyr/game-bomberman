class AudioPlayer {
  constructor(args) {
    this.sounds = {};

    [
      'explosion.mp3', 
      'bg.mp3', 
      'plant.mp3', 
      'bg-2.mp3', 
      'click.mp3',
      'boost.wav'
    ].map(a => {
      let name = a.split('.');
      this.sounds[name[0]] = new Audio(`assets/${a}`);
    })
  }

  toggleMute() {
    if(!this.isMuted) {
      Object.keys(this.sounds).map((k) => {
        this.sounds[k].volume = 0;
      })
    } else {
      Object.keys(this.sounds).map((k) => {
        this.sounds[k].volume = 1;
      })
    }

    this.isMuted = !this.isMuted;
  }

  play(soundName) {
    this.sounds[soundName].currentTime = 0
    this.sounds[soundName].play()
  }

  stop(soundName) {
    this.sounds[soundName].pause()
    this.sounds[soundName].currentTime = 0
  }
}

const audioPlayer = new AudioPlayer()