const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 8080;

app.use(express.static('client'));
app.use(express.static('shared'));

let clients = {};

var World = require('./components/world');

var world = new World(function updateFn() {
  io.sockets.emit('update_world', world.getData())
});

io.on('connection', (socket) => {
  socket.emit('initialize_world', world.getData())

  socket.on('player_join', (client) => {

    socket.clientId = client.id;
    socket.clientUsername = client.username;

    clients[client.id] = client;

    let newPlayer = world.addPlayer(client);

    io.sockets.emit('update_world', world.getData())
  })

  socket.on('player_move', (data) => {
    if(+new Date() - clients[socket.clientId].lastAct < 50) return;
    clients[socket.clientId].lastAct = +new Date();

    world.movePlayer(socket.clientId, data);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('player_plant', () => {
    if(+new Date() - clients[socket.clientId].lastAct < 50) return;
    clients[socket.clientId].lastAct = +new Date();

    world.plantPlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('player_leave', () => {
    world.removePlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('disconnect', () => {
    world.removePlayer(socket.clientId);
    io.sockets.emit('update_world', world.getData())
  })

  socket.on('latency', (timestamp, fn) => fn(timestamp)); 
});

http.listen(PORT, () => console.log(`listening on *:${PORT}`));
