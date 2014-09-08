var express = require("express");
var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);


// Database setup

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
  res.render("room", { roomId: roomId });
});

server.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});

// SocketIO

io.on("connection", function (socket) {
  socket.on("room", function (room) {
    socket.join(room);
  });
});
