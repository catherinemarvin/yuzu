var express = require("express");

var app = express();

// Configuration
app.use(express.static(__dirname+ "/static"));

app.engine("jade", require("jade").__express);
app.set("view engine", "jade");

app.get("/", function (req, res) {
  res.render("index");
});

var server = app.listen(3000, function () {
  console.log("Listening on port %d", server.address().port);
});
