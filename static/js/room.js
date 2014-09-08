// Socket IO
var socket = io.connect("http://localhost:3000");
socket.on("news", function (data) {
  console.log(data);
  socket.emit("my other event", { my: "data"} );
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
  if (localMediaStream) {
    ctx.drawImage(video, 0, 0);
    img.src = canvas.toDataURL("image/png");
  }
};

video.onloadedmetadata = function (e) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  img.width = video.videoWidth;
  img.height = video.videoheight;
};

video.addEventListener("click", snapshot, false);

MediaStreamTrack.getSources(function (sourceInfos) {

  for (var i = 0; i < sourceInfos.length; i++) {
    var sourceInfo = sourceInfos[i];
    if (sourceInfo.kind === "video") {
      console.log(sourceInfo.id, sourceInfo.label || "camera");
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