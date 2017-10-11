var audio = new Audio('assets/bg.wav');
// audio.play();

let client = new Client();
let world = new World();
let socket = io();

sprite.preload('assets/texture.png');

socket.on('connect', function() {
  socket.emit('player_join', client);

  ['up', 'down', 'left', 'right'].forEach(d => {
    Mousetrap.bind(d, event => {
      event.preventDefault();
      socket.emit('player_move', { direction: d })
    })
  })

  Mousetrap.bind('space', (event) => {
    event.preventDefault();
    socket.emit('player_plant')
  });
});

socket.on('disconnect', () => {
  socket.emit('player_leave', client);
})

socket.on('update_world', function(data) {
  // console.log(data);
  world.update(data);

  document.getElementById('info').innerHTML = '';
  let html = '';

  data.players.forEach((p, i) => {
    html += `Player ${i + 1}, dead: ${!!p.dead}, dies: ${p.dies}<br>`
  })

  document.getElementById('info').innerHTML = html;

});

requestAnimationFrame(function loopFn(timestamp) {
  world.draw();
  requestAnimationFrame(loopFn);
})
