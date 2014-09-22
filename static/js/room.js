var IMGUR_CLIENT_ID = "33a3250135d2053";

// Socket IO
var socket = io.connect("http://localhost:3000");

// roomId and username are passed in from server.js
socket.on("connect", function () {
  socket.emit("room", { roomId: roomId, username: username });
});

socket.on("playerList", function (playerNames) {
  var players = document.querySelector("#players");
  players.textContent = playerNames;
});

socket.on("startGame", function (image) {
  $("#startBtn").hide();
  $("#gameInfo").text("Game has started! Get ready to make a stupid face!");

  $("#sourceImage").append("<img id=sourceImage src='"+image+"'></img>");


  var seconds = 3;

  var timer = function () {
    if (seconds === 0) {
      $("#gameInfo").text("Snap!");
      snapshot();
    } else {
      $("#gameInfo").text(seconds + " seconds remaining");
      seconds--;
      window.setTimeout(timer, 1000);
    }
  };

  window.setTimeout(timer, 1000);
});

socket.on("showPictures", function (pictures) {
  console.log(pictures);

  for (var i = 0; i < pictures.length; i++) {
    var picInfo = pictures[i];
    var imageUrl = picInfo.picture;
    var submitter = picInfo.user;

    if (submitter === username) {
      continue;
    } else {
      $("#pictures").append("<img class='picture' data-username='"+submitter+"' src='"+imageUrl+"'></img>");
    }
  }
  
  $(".picture").click(function () {
    console.log("Cast a vote!");
    var username = $(this).data("username");

    socket.emit("voteSubmitted", {
      roomId: roomId,
      player: username,
      imageUrl: this.src
    });
    $(".picture").hide();
  });
});

socket.on("finalResults", function (results) {
  var topScore = results[0].votes;

  var winners = results.filter(function (result) {
    return result.votes === topScore;
  });


  $("#gameInfo").html("<h2>Winners</h2>");

  for (var i = 0; i < winners.length; i++) {
    var result = results[i];
    var name = result.name;
    var url = result.url;

    $("#gameInfo").append("<br>"+name);
  }
});

socket.on("chatMessage", function (messageInfo) {
  var message = messageInfo.message;
  var sender = messageInfo.sender;
  $("#chat").append($("<li>").text(sender + ": " + message));
});

// Cross browser compatibility
navigator.getUserMedia = (navigator.getUserMedia || 
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

// Webcam capture

var video = document.querySelector("video");
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var img = document.querySelector("#screenshot");
var videoSource = null;
var localMediaStream = null;

var snapshot = function () {
  $("#video").hide();
  $("#screenshot").show();
  if (localMediaStream) {
    ctx.drawImage(video, 0, 0);
    img.src = canvas.toDataURL("image/webp");
    upload();
  }
};

var upload = function () {
  var imageData;

  try {
    imageData = canvas.toDataURL("image/png").split(",")[1];
  } catch (e) {
    imageData = canvas.toDataURL().split(",")[1];
  }

  $.ajax({
    url: "https://api.imgur.com/3/image",
    type: "POST",
    headers: {
      Authorization: "Client-ID " + IMGUR_CLIENT_ID
    },
    data: {
      image: imageData
    },
    dataType: "json",
    success: function (info) {
      var image = info.data;
      var link = image.link;
      socket.emit("snapshotTaken", { roomId: roomId, url: link, player: username });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error :(");
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
};

video.onloadedmetadata = function (e) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  img.width = video.videoWidth;
  img.height = video.videoheight;
};

MediaStreamTrack.getSources(function (sourceInfos) {

  for (var i = 0; i < sourceInfos.length; i++) {
    var sourceInfo = sourceInfos[i];
    if (sourceInfo.kind === "video") {
      videoSource = sourceInfo.id;
    }
  }

  var constraints = {
    video: {
      optional: [{sourceId: videoSource}]
    }
  };

  window.navigator.getUserMedia(constraints, function (stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
  }, function (e) {
    console.log("Error :(", e );
  });
});

// jQuery

$(document).ready(function () {
  $("#startBtn").click(function () {
    socket.emit("roomStart", roomId);
  });

  $("#chatForm").submit(function () {
    socket.emit("chat", { room: roomId, message: $("#message").val() });
    $("#message").val("");
    return false;
  });
});
