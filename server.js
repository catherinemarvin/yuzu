var express = require("express");
var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);


// Database setup
var redis = require("redis");
var client = redis.createClient();

var ROOMS_KEY = "rooms";

client.on("error", function (err) {
  console.log("Error " + err);
});

// Configuration
app.use(express.static(__dirname+ "/static"));

app.engine("jade", require("jade").__express);
app.set("view engine", "jade");

// Routing

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/join", function (req, res) {
  var username = req.query.username;
  var roomId = req.query.roomId;

  client.sadd(ROOMS_KEY, roomId);

  res.render("room", { roomId: roomId, username: username });
});

server.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});

// SocketIO

io.on("connection", function (socket) {
  socket.on("room", function (info) {
    var room = info.roomId;
    var username = info.username;

    socket.join(room);
    client.set(socket.id, username);

    emitPlayers(room);
  });

  socket.on("disconnect", function () {
    client.del(socket.id);

    var socketsAndRooms = Object.keys(io.sockets.adapter.rooms);

    for (var i = 0; i < socketsAndRooms.length; i++) {
      var socketOrRoomId = socketsAndRooms[i];
      var connection = io.sockets.adapter.nsp.connected[socketOrRoomId];

      if (!connection) {
        // Could be a room or the disconnected socket.
        var players = socketsInRoom(socketOrRoomId);
        if (players.length === 0) {
          client.srem(ROOMS_KEY,socketOrRoomId);
        }
      }
    }
  });
});

var emitPlayers = function (roomId) {
  var sockets = io.sockets.adapter.rooms[roomId];

  client.mget(Object.keys(sockets), function (err, names) {
    var clients = socketsInRoom(roomId);

    for (var i = 0; i < clients.length; i++) {
      var socket = clients[i];
      socket.emit("playerList", names);
    }
  });
};

var socketsInRoom = function (roomId) {
  var sockets = io.sockets.adapter.rooms[roomId];

  var ret = [];

  for (var socketId in sockets) {
    ret.push(io.sockets.adapter.nsp.connected[socketId]);
  }
  return ret;
};
