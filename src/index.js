const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const handlers = {};

const sockets = [];
const lounge = [];
const games = [];

handlers.login = (socket, message) => {
  console.log("logged in " + message.name);
  console.log("Connected Sockets", sockets.length);

  socket.name = message.name;
  socket.send({ type: "loggedIn", name: message.name });
  lounge.push(socket);
};

server.on("connection", socket => {
  console.log("Connected Socket....");

  // Monkey Patching, ewwwy!!
  socket._send = socket.send;
  socket.send = msg => socket._send(JSON.stringify(msg));
  sockets.push(socket);

  socket.on("message", message => {
    const msg = JSON.parse(message);
    const handler = handlers[msg.type];
    if (handler) handler(socket, msg);
  });

  socket.on("disconnect", () => sockets.splice(sockets.indexOf(socket), 1));
  socket.send({ type: "debug", body: "Connected" });
});

setInterval(() => {
  if (lounge.length >= 2) {
    const game = {
      player1: lounge.shift(),
      player2: lounge.shift()
    };

    games.push(game);
    Object.values(game).forEach(player => player.send({ type: "start" }));
  }
}, 1000);
