let socket = io();

function onInitalizeWorld() {
  return new Promise((resolve, reject) => {
    socket.on('connect', function() {
      socket.on('initialize_world', function (initialData) {    
        resolve(initialData);
      });
    });
  });
}

function addClient(client, socket) {
  let timeout = +new Date();

  socket.emit('player_join', client);

  ['up', 'down', 'left', 'right'].forEach(d => {
    Mousetrap.bind(d, event => {
      delta = +new Date() - timeout;
      if(delta < 100) return;
      event.preventDefault();
      socket.emit('player_move', { direction: d })
      timeout = +new Date();
    })
  })

  Mousetrap.bind('space', (event) => {
    event.preventDefault();
    audioPlayer.play('plant')
    socket.emit('player_plant')
  });

  socket.on('disconnect', () => {
    socket.emit('player_leave', client);
  })
}

function removeClient(client, socket) {
  Mousetrap.reset();
  socket.emit('player_leave', client);
}

var latencyTime;

Promise.all([
  sprite.preload('assets/texture.png'),
  document.ready,
  onInitalizeWorld()
]).then(promiseData => {
  let initialData = promiseData[2];

  let playerDashboardDiv = document.getElementById('player-stats');
  let latencyDiv = document.getElementById('latency')
  let joinButton = document.getElementById('join')
  let usernameInput = document.getElementById('username')
  let joinForm = document.getElementById('join-form')
  let leaveButton = document.getElementById('leave')
  let gameMenu = document.getElementById('game-menu')
  let muteButton = document.getElementById('mute')
  let headline = document.getElementById('headline')

  let world = new World(initialData);
  let client;

  audioPlayer.play('bg-2')

  leaveButton.addEventListener('click', (event) => {
    audioPlayer.stop('bg')
    audioPlayer.play('bg-2')
    joinForm.style.display = 'flex';
    gameMenu.style.display = 'none';
    headline.classList.add('animate')
    removeClient(client, socket);
  });

  muteButton.addEventListener('click', (event) => {
    audioPlayer.toggleMute();
    muteButton.classList.toggle('active')
  });

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if(usernameInput.value.trim()) {
      client = new Client(usernameInput.value);
      addClient(client, socket);
      audioPlayer.play('bg')
      audioPlayer.stop('bg-2')
      joinForm.style.display = 'none';
      headline.classList.remove('animate')
      gameMenu.style.display = 'block';
    }
  })

  socket.on('update_world', function(data) {
    world.update(data);

    playerDashboardDiv.innerHTML = '';
    let html = '';

    data.players.forEach((p, i) => {
      html += `<span class="player-color" style="background: ${p.color}"></span> ${p.username}, kills: ${p.stats.kills}, dies: ${p.stats.dies} <br />`
    })

    playerDashboardDiv.innerHTML = html;
  });

  requestAnimationFrame(function loopFn(timestamp) {
    world.draw();
    requestAnimationFrame(loopFn);
  })

  setInterval(function() {
    socket.emit('latency', Date.now(), function(startTime) {
      var latency = Date.now() - startTime;
      latencyDiv.innerHTML = `latency: ${(latency - 1)}`;
    });
  }, 1000);
})