var express = require("express");

var app = express();

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

app.get("/room/:id", function (req, res) {
  // Enter a room with the given name
  var roomId = req.params.name;
});

app.post("/create", function (req, res) {
  // Create a new room
});

var server = app.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});
