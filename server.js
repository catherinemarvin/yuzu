var express = require("express");
var app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);


// Database setup

var mongo = require("mongodb");

var MongoClient = mongo.MongoClient;

var roomsCollection;

MongoClient.connect("mongodb://localhost:27017/yuzu", function (err, db) {
  if (err) {
    throw err;
  } else {
    roomsCollection = db.collection("rooms");
  }
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
  res.render("room");
});

server.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});

// SocketIO

io.on("connection", function (socket) {
  socket.emit("news", { hello: "world" });
  socket.on("my other event", function (data) {
    console.log(data);
  });
});
